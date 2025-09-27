import { StoryModel } from '../models/story-model.js';
import { AuthModel } from '../models/auth-model.js';
import { NotificationModel } from '../models/notification-model.js';
import IndexedDBModel from '../models/indexeddb-model.js';

export class HomePresenter {
  constructor(view) {
    this.view = view;
    this.storyModel = new StoryModel();
    this.authModel = new AuthModel();
    this.notificationModel = new NotificationModel();
    this.indexedDB = new IndexedDBModel();
    this.currentPage = 1;
    this.pageSize = 12;
    this.isOnline = navigator.onLine;
    this.isChecking = false; // Add checking flag
    
    // Initialize IndexedDB
    this.indexedDB.init();
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.checkOnlineStatus();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.updateOnlineStatus();
    });

    // Listen for refresh event from offline stories page
    window.addEventListener('refreshHomePage', () => {
      this.loadStories();
    });
    
    // Initial status check
    this.checkOnlineStatus();
    
    // Periodic online status check every 60 seconds (reduced frequency)
    setInterval(() => {
      this.checkOnlineStatus();
    }, 60000);
  }

  async loadStories() {
    try {
      console.log('loadStories called');
      this.view.showLoading();
      
      const token = this.authModel.getToken();
      console.log('Token:', token ? 'Present' : 'Missing');
      console.log('Is Online:', this.isOnline);
      
      if (!token) {
        console.log('No token, showing guest view');
        this.view.showGuestView();
        return;
      }

      this.view.showAuthenticatedView();
      
      // Check if online and token is valid for API
      if (this.isOnline && token && !token.startsWith('offline_token_')) {
        try {
          console.log('Loading from API...');
          // Try to load from API
          const location = this.view.getLocationToggle() ? 1 : 0;
          const data = await this.storyModel.getStories({
            token,
            page: this.currentPage,
            size: this.pageSize,
            location
          });

          console.log('API response:', data);
          const stories = data.listStory || [];
          console.log('Stories count:', stories.length);
          
          this.view.displayStories(stories);
          this.view.renderPagination(this.currentPage > 1, stories.length === this.pageSize);
          
          if (stories.length > 0) {
            this.view.renderMap(stories);
          }
          // Ensure status is updated from "Checking..." after load
          await this.updateOnlineStatus();
        } catch (apiError) {
          // If API fails, load from IndexedDB
          console.log('API failed, loading from IndexedDB:', apiError.message);
          await this.loadStoriesFromIndexedDB();
          await this.updateOnlineStatus();
        }
      } else {
        console.log('Loading from IndexedDB (offline or offline token)');
        // If offline or using offline token, load from IndexedDB
        await this.loadStoriesFromIndexedDB();
        await this.updateOnlineStatus();
      }
      
    } catch (error) {
      console.error('Error loading stories:', error);
      // Don't show error to user, just load from IndexedDB
      await this.loadStoriesFromIndexedDB();
    }
  }

  async loadStoriesFromIndexedDB() {
    try {
      const stories = await this.indexedDB.getAllStories();
      this.view.displayStories(stories);
      this.view.renderPagination(false, false); // No pagination for offline
      
      if (stories.length > 0) {
        this.view.renderMap(stories);
      }
      
      // Show offline message
      this.view.showMessage('Menampilkan data offline');
    } catch (error) {
      console.error('Error loading from IndexedDB:', error);
      this.view.displayStories([]);
    }
  }

  async onPageChange(direction) {
    if (direction === 'prev' && this.currentPage > 1) {
      this.currentPage--;
    } else if (direction === 'next') {
      this.currentPage++;
    }
    
    await this.loadStories();
  }

  async onLocationToggle() {
    this.currentPage = 1;
    await this.loadStories();
  }

  async subscribeWebPush() {
    try {
      await this.notificationModel.requestPermission();
      const registration = await this.notificationModel.getServiceWorkerRegistration();
      const subscription = await this.notificationModel.getPushSubscription(registration);

      const token = this.authModel.getToken();
      if (!token) {
        throw new Error('Login terlebih dahulu untuk subscribe');
      }

      const result = await this.storyModel.subscribeWebPush({
        token,
        subscription: subscription.toJSON()
      });

      this.view.showMessage('Subscribed: ' + result.message);
    } catch (error) {
      this.view.showMessage(error.message);
    }
  }

  async unsubscribeWebPush() {
    try {
      const endpoint = await this.notificationModel.unsubscribeFromPush();

      const token = this.authModel.getToken();
      if (!token) {
        throw new Error('Login terlebih dahulu');
      }

      const result = await this.storyModel.unsubscribeWebPush({
        token,
        endpoint
      });

      this.view.showMessage('Unsubscribed: ' + result.message);
    } catch (error) {
      this.view.showMessage(error.message);
    }
  }

  // Favorites
  async toggleFavorite(story) {
    try {
      const saved = await this.indexedDB.toggleFavorite(story);
      return saved;
    } catch (e) {
      console.error('toggleFavorite error', e);
      this.view.showMessage('Gagal menyimpan favorit');
      return false;
    }
  }

  // Save story to IndexedDB when offline
  async saveStoryOffline(story) {
    try {
      await this.indexedDB.addStory(story);
      this.view.showMessage('Story disimpan offline');
    } catch (error) {
      console.error('Error saving story offline:', error);
      this.view.showMessage('Gagal menyimpan story offline');
    }
  }

  // Sync offline stories when online
  async syncOfflineStories() {
    try {
      const pendingStories = await this.indexedDB.getPendingSyncStories();
      const token = this.authModel.getToken();
      
      if (!token || pendingStories.length === 0) return;

      let syncedCount = 0;
      for (const story of pendingStories) {
        try {
          // Try to sync with API
          await this.storyModel.addStory({
            token,
            description: story.description,
            photoFile: story.photoFile,
            lat: story.lat,
            lon: story.lon
          });
          
          await this.indexedDB.markAsSynced(story.id);
          syncedCount++;
        } catch (error) {
          console.error(`Failed to sync story ${story.id}:`, error);
        }
      }

      if (syncedCount > 0) {
        this.view.showMessage(`Berhasil sync ${syncedCount} story offline`);
        // Reload stories to show updated data
        this.loadStories();
      }
    } catch (error) {
      console.error('Error syncing offline stories:', error);
    }
  }

  // Get offline stories count
  async getOfflineStoriesCount() {
    try {
      const stories = await this.indexedDB.getAllStories();
      return stories.length;
    } catch (error) {
      console.error('Error getting offline stories count:', error);
      return 0;
    }
  }

  // Check online status with actual network test
  async checkOnlineStatus() {
    // Prevent multiple simultaneous checks
    if (this.isChecking) {
      return;
    }

    // First check navigator.onLine
    if (!navigator.onLine) {
      this.isOnline = false;
      this.updateOnlineStatus();
      return;
    }

    this.isChecking = true;

    // Show checking status
    const onlineStatus = document.querySelector('#online-status');
    if (onlineStatus) {
      onlineStatus.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';
    }

    try {
      // Simple timeout-based test
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      const response = await fetch('https://httpbin.org/status/200', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      this.isOnline = true;
    } catch (error) {
      // If external test fails, try local test
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout
        
        const response = await fetch(window.location.origin + '/favicon.ico', {
          method: 'HEAD',
          cache: 'no-cache',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        this.isOnline = response.ok;
      } catch (error2) {
        this.isOnline = false;
      }
    } finally {
      this.isChecking = false;
    }
    
    this.updateOnlineStatus();
    
    // If online, try to sync offline stories
    if (this.isOnline) {
      this.syncOfflineStories();
    }
  }

  // Update online/offline status display
  async updateOnlineStatus() {
    const onlineStatus = document.querySelector('#online-status');
    const offlineCount = document.querySelector('#offline-count');
    const offlineCountText = document.querySelector('#offline-count-text');

    if (onlineStatus) {
      // Keep the chip always visible for stability; just change label/style
      onlineStatus.style.display = 'flex';
      if (this.isOnline) {
        onlineStatus.classList.remove('offline');
        onlineStatus.classList.add('online');
        onlineStatus.innerHTML = '<i class="fas fa-wifi"></i> ONLINE';
      } else {
        onlineStatus.classList.remove('online');
        onlineStatus.classList.add('offline');
        onlineStatus.innerHTML = '<i class="fas fa-wifi"></i> OFFLINE';
      }
    }

    if (offlineCount && offlineCountText) {
      const count = await this.getOfflineStoriesCount();
      offlineCountText.textContent = count;
      offlineCount.style.display = count > 0 ? 'flex' : 'none';
    }
  }
}
