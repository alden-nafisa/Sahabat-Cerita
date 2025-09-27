class IndexedDBModel {
  constructor() {
    this.dbName = 'DicodingStoryDB';
    this.dbVersion = 3; // Increment version when schema changes
    this.storeName = 'stories';
    this.userStoreName = 'users';
    this.favoriteStoreName = 'favorites';
    this.db = null;
  }

  // Initialize IndexedDB
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create stories store
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('name', 'name', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
          store.createIndex('description', 'description', { unique: false });
        }
        
        // Create users store
        if (!db.objectStoreNames.contains(this.userStoreName)) {
          const userStore = db.createObjectStore(this.userStoreName, { keyPath: 'id' });
          userStore.createIndex('email', 'email', { unique: true });
          userStore.createIndex('name', 'name', { unique: false });
        }

        // Create favorites store
        if (!db.objectStoreNames.contains(this.favoriteStoreName)) {
          const favStore = db.createObjectStore(this.favoriteStoreName, { keyPath: 'id' });
          favStore.createIndex('createdAt', 'createdAt', { unique: false });
          favStore.createIndex('name', 'name', { unique: false });
        }
      };
    });
  }

  // Create/Add story to IndexedDB
  async addStory(story) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      // Add offline flag and timestamp
      const offlineStory = {
        ...story,
        isOffline: true,
        offlineCreatedAt: new Date().toISOString(),
        syncStatus: 'pending'
      };
      
      const request = store.add(offlineStory);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Read all stories from IndexedDB
  async getAllStories() {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Read single story by ID
  async getStoryById(id) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(id);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Update story in IndexedDB
  async updateStory(story) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(story);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Delete story from IndexedDB
  async deleteStory(id) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Search stories by description
  async searchStories(query) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();
      
      request.onsuccess = () => {
        const stories = request.result;
        const filtered = stories.filter(story => 
          story.description.toLowerCase().includes(query.toLowerCase()) ||
          story.name.toLowerCase().includes(query.toLowerCase())
        );
        resolve(filtered);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Filter stories by date range
  async filterStoriesByDate(startDate, endDate) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();
      
      request.onsuccess = () => {
        const stories = request.result;
        const filtered = stories.filter(story => {
          const storyDate = new Date(story.createdAt);
          return storyDate >= startDate && storyDate <= endDate;
        });
        resolve(filtered);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Sort stories
  async sortStories(sortBy = 'createdAt', order = 'desc') {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();
      
      request.onsuccess = () => {
        const stories = request.result;
        const sorted = stories.sort((a, b) => {
          let aVal = a[sortBy];
          let bVal = b[sortBy];
          
          if (sortBy === 'createdAt') {
            aVal = new Date(aVal);
            bVal = new Date(bVal);
          }
          
          if (order === 'desc') {
            return bVal > aVal ? 1 : -1;
          } else {
            return aVal > bVal ? 1 : -1;
          }
        });
        resolve(sorted);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Get pending sync stories
  async getPendingSyncStories() {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();
      
      request.onsuccess = () => {
        const stories = request.result;
        const pending = stories.filter(story => 
          story.syncStatus === 'pending' || 
          story.isOffline === true ||
          !story.syncStatus
        );
        resolve(pending);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Mark story as synced
  async markAsSynced(id) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const getRequest = store.get(id);
      
      getRequest.onsuccess = () => {
        const story = getRequest.result;
        if (story) {
          story.syncStatus = 'synced';
          story.isOffline = false;
          const putRequest = store.put(story);
          putRequest.onsuccess = () => resolve(putRequest.result);
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve(null);
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // Clear all data
  async clearAll() {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // User Management Methods
  async addUser(user) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.userStoreName], 'readwrite');
      const store = transaction.objectStore(this.userStoreName);
      const request = store.add(user);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllUsers() {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.userStoreName], 'readonly');
      const store = transaction.objectStore(this.userStoreName);
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getUserByEmail(email) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.userStoreName], 'readonly');
      const store = transaction.objectStore(this.userStoreName);
      const index = store.index('email');
      const request = index.get(email);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateUser(user) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.userStoreName], 'readwrite');
      const store = transaction.objectStore(this.userStoreName);
      const request = store.put(user);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteUser(id) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.userStoreName], 'readwrite');
      const store = transaction.objectStore(this.userStoreName);
      const request = store.delete(id);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Favorites Management Methods
  async addFavorite(story) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.favoriteStoreName], 'readwrite');
      const store = transaction.objectStore(this.favoriteStoreName);
      const now = new Date().toISOString();
      const record = { ...story, createdAt: story.createdAt || now, savedAt: now };
      const request = store.put(record);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getFavoriteById(id) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.favoriteStoreName], 'readonly');
      const store = transaction.objectStore(this.favoriteStoreName);
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllFavorites() {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.favoriteStoreName], 'readonly');
      const store = transaction.objectStore(this.favoriteStoreName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async removeFavorite(id) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.favoriteStoreName], 'readwrite');
      const store = transaction.objectStore(this.favoriteStoreName);
      const request = store.delete(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async isFavorite(id) {
    const item = await this.getFavoriteById(id);
    return !!item;
  }

  async toggleFavorite(story) {
    const existing = await this.getFavoriteById(story.id);
    if (existing) {
      await this.removeFavorite(story.id);
      return false;
    }
    await this.addFavorite(story);
    return true;
  }
}

export default IndexedDBModel;
