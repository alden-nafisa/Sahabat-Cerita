import { StoryModel } from '../models/story-model.js';
import { AuthModel } from '../models/auth-model.js';
import IndexedDBModel from '../models/indexeddb-model.js';

export class AuthPresenter {
  constructor(view) {
    this.view = view;
    this.storyModel = new StoryModel();
    this.authModel = new AuthModel();
    this.indexedDB = new IndexedDBModel();
    this.isOnline = navigator.onLine;
  }

  async login(credentials) {
    try {
      this.view.showLoading('Logging in...');
      const online = navigator.onLine;

      if (online) {
        try {
          // Try online login first
          const result = await this.storyModel.loginUser(credentials);
          this.authModel.setToken(result.loginResult.token);
          
          // Save user data to IndexedDB for offline use
          await this.saveUserOffline({
            email: credentials.email,
            token: result.loginResult.token,
            name: result.loginResult.name,
            userId: result.loginResult.userId,
            password: credentials.password
          });
          
          this.view.showSuccess('Login sukses. Membuka stories...');
          this.view.navigateToHome();
        } catch (apiError) {
          // If API fails, try offline login
          console.log('API login failed, trying offline:', apiError.message);
          await this.loginOffline(credentials);
        }
      } else {
        // If offline, try offline login
        await this.loginOffline(credentials);
      }
      
    } catch (error) {
      this.view.showError(error.message);
    }
  }

  async loginOffline(credentials) {
    try {
      await this.indexedDB.init();
      
      // Check if user exists in IndexedDB
      const user = await this.indexedDB.getUserByEmail(credentials.email);
      
      if (!user) {
        throw new Error('User tidak ditemukan. Silakan daftar online terlebih dahulu.');
      }
      
      // Simple password check (in real app, use proper hashing)
      if (user.password && user.password !== credentials.password) {
        throw new Error('Password salah.');
      }
      
      // If online, try to get fresh token from API
      if (navigator.onLine) {
        try {
          // Try to login online to get fresh token
          const result = await this.storyModel.loginUser(credentials);
          this.authModel.setToken(result.loginResult.token);
          
          // Update user with fresh token
          user.token = result.loginResult.token;
          user.isOffline = false;
          user.lastLogin = new Date().toISOString();
          await this.indexedDB.updateUser(user);
          
          this.view.showSuccess('Login online sukses. Membuka stories...');
          this.view.navigateToHome();
          return;
        } catch (apiError) {
          console.log('Online login failed, using offline mode:', apiError.message);
          // Fall through to offline login
        }
      }
      
      // Offline login - use stored token
      this.authModel.setToken(user.token);
      user.lastLogin = new Date().toISOString();
      await this.indexedDB.updateUser(user);
      
      this.view.showSuccess('Login offline sukses. Membuka stories...');
      this.view.navigateToHome();
      
    } catch (error) {
      throw new Error('Login offline gagal: ' + error.message);
    }
  }

  async saveUserOffline(userData) {
    try {
      await this.indexedDB.init();
      
      const user = {
        id: userData.userId,
        email: userData.email,
        token: userData.token,
        name: userData.name,
        password: userData.password || null,
        isOffline: false,
        lastLogin: new Date().toISOString()
      };
      
      // Upsert: if exists update, else add
      const existing = await this.indexedDB.getUserByEmail(user.email);
      if (existing) {
        user.id = existing.id || user.id;
        await this.indexedDB.updateUser(user);
      } else {
        await this.indexedDB.addUser(user);
      }
    } catch (error) {
      console.error('Error saving user offline:', error);
    }
  }

  async register(userData) {
    try {
      this.view.showLoading('Registering...');
      const online = navigator.onLine;
      
      if (online) {
        try {
          // Try online register first
          await this.storyModel.registerUser(userData);
          
          this.view.showSuccess('Registrasi sukses. Silakan login.');
          this.view.navigateToLogin();
        } catch (apiError) {
          // Only fallback to offline on genuine network failure
          if (apiError.message && (
            apiError.message.includes('Failed to fetch') ||
            apiError.message.includes('NetworkError') ||
            apiError.message.includes('Network request failed')
          )) {
            console.log('Network error on register, saving offline.');
            await this.registerOffline(userData);
          } else {
            throw apiError; // surface API validation errors to UI
          }
        }
      } else {
        // If offline, register offline
        await this.registerOffline(userData);
      }
      
    } catch (error) {
      this.view.showError(error.message);
    }
  }

  async registerOffline(userData) {
    try {
      await this.indexedDB.init();
      
      // Check if user already exists
      const existingUser = await this.indexedDB.getUserByEmail(userData.email);
      if (existingUser) {
        throw new Error('Email sudah terdaftar.');
      }
      
      // Create offline user
      const user = {
        id: 'offline_user_' + Date.now(),
        email: userData.email,
        name: userData.name,
        password: userData.password,
        token: 'offline_token_' + Date.now(),
        isOffline: true,
        createdAt: new Date().toISOString()
      };
      
      await this.indexedDB.addUser(user);
      
      this.view.showSuccess('Registrasi offline sukses. Silakan login.');
      this.view.navigateToLogin();
      
    } catch (error) {
      throw new Error('Registrasi offline gagal: ' + error.message);
    }
  }

  logout() {
    this.authModel.removeToken();
    this.view.navigateToLogin();
  }
}
