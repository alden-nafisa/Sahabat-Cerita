import IndexedDBModel from '../../models/indexeddb-model.js';

class OfflineStoriesPage {
  constructor() {
    this.indexedDB = new IndexedDBModel();
    this.stories = [];
    this.currentFilter = 'all';
    this.currentSort = 'createdAt';
    this.currentOrder = 'desc';
    this.searchQuery = '';
  }

  async render() {
    return `
      <section class="container stories-hero-section">
        <div class="stories-hero-content">
          <div class="stories-hero-text">
            <div class="stories-hero-title-row">
              <h1 class="stories-hero-title"><span class="brand-purple">Cerita</span>Kita</h1>
              <div class="stories-status-card-inline">
                <div id="offline-status" class="status-badge offline" style="display: flex;"><i class="fas fa-database"></i> OFFLINE</div>
              </div>
            </div>
            <h2 class="stories-hero-subtitle">Story yang menemani Anda secara Offline</h2>
            <p class="stories-hero-desc">Kumpulan cerita offline yang telah disediakan untuk Anda. Baca kembali kapan saja, bahkan saat offline!</p>
          </div>
          <div class="stories-hero-image">
            <img src="images/story-2.png" alt="Ilustrasi membaca buku di malam hari" loading="eager" />
          </div>
        </div>
        
        <div class="toolbar">
          <div class="offline-controls">
            <div class="search-box">
              <input type="text" id="search-input" placeholder="Cari story..." />
              <i class="fas fa-search"></i>
            </div>
            
            <div class="filter-controls">
              <select id="filter-select">
                <option value="all">Semua Story</option>
                <option value="offline">Offline Only</option>
                <option value="synced">Sudah Sync</option>
                <option value="pending">Pending Sync</option>
              </select>
              
              <select id="sort-select">
                <option value="createdAt">Sortir berdasarkan Tanggal</option>
                <option value="name">Sortir berdasarkan Nama</option>
                <option value="description">Sortir berdasarkan Deskripsi</option>
              </select>
              
              <button id="sort-order-btn" class="btn btn-outline">
                <i class="fas fa-sort-amount-down"></i>
              </button>
            </div>
            
            <div class="action-buttons">
              <button id="sync-all-btn" class="btn btn-primary">
                <i class="fas fa-sync"></i> Sync All
              </button>
              <button id="clear-all-btn" class="btn btn-danger">
                <i class="fas fa-trash"></i> Clear All
              </button>
            </div>
          </div>
        </div>
        
        <div id="offline-stories" class="stories-grid"></div>
        <div id="offline-pagination" class="pagination"></div>
      </section>
    `;
  }

  async afterRender() {
    // Set global instance for onclick handlers
    window.offlineStoriesPage = this;
    
    await this.indexedDB.init();
    await this.loadStories();
    this.setupEventListeners();
  }

  async loadStories() {
    try {
      this.stories = await this.indexedDB.getAllStories();
      this.applyFilters();
      this.displayStories();
    } catch (error) {
      console.error('Error loading stories:', error);
      this.showError('Gagal memuat story offline');
    }
  }

  applyFilters() {
    let filtered = [...this.stories];

    // Apply search filter
    if (this.searchQuery) {
      filtered = filtered.filter(story => 
        story.description.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        story.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (this.currentFilter === 'offline') {
      filtered = filtered.filter(story => story.isOffline);
    } else if (this.currentFilter === 'synced') {
      filtered = filtered.filter(story => story.syncStatus === 'synced');
    } else if (this.currentFilter === 'pending') {
      filtered = filtered.filter(story => story.syncStatus === 'pending');
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal = a[this.currentSort];
      let bVal = b[this.currentSort];
      
      if (this.currentSort === 'createdAt') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      
      if (this.currentOrder === 'desc') {
        return bVal > aVal ? 1 : -1;
      } else {
        return aVal > bVal ? 1 : -1;
      }
    });

    this.filteredStories = filtered;
  }

  displayStories() {
    const container = document.querySelector('#offline-stories');
    if (!container) return;

    if (this.filteredStories.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-database"></i>
          <h3>Tidak ada story offline</h3>
          <p>Story yang disimpan offline akan muncul di sini</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.filteredStories.map(story => {
      // Prefer fresh blob URL when a photoFile exists (object URLs are not persistent across reloads)
      let photoUrl = story.photoFile ? URL.createObjectURL(story.photoFile) : (story.photoUrl || '');
      
      return `
      <div class="story-card offline-story-card">
        <div class="story-image-container">
          <img src="${photoUrl}" alt="Foto oleh ${story.name}" loading="lazy" onload="if(this.src.startsWith('blob:')) URL.revokeObjectURL(this.src)" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';" />
          <div class="story-overlay">
            <i class="fas fa-eye"></i>
          </div>
          <div class="offline-badge ${story.isOffline ? 'offline' : 'synced'}">
            <i class="fas fa-${story.isOffline ? 'wifi' : 'check'}"></i>
            ${story.isOffline ? 'Offline' : 'Synced'}
          </div>
        </div>
        <div class="story-content">
          <h3><i class="fas fa-book-open"></i> ${story.name}</h3>
          <p>${story.description}</p>
          <div class="story-meta">
            <span><i class="fas fa-calendar"></i> ${new Date(story.createdAt).toLocaleString('id-ID')}</span>
            ${story.lat && story.lon ? '<span><i class="fas fa-map-marker-alt"></i> Lokasi tersedia</span>' : ''}
          </div>
          <div class="story-actions">
            <button class="btn btn-sm btn-outline" onclick="window.offlineStoriesPage.viewStory('${story.id}')">
              <i class="fas fa-eye"></i> Lihat
            </button>
            <button class="btn btn-sm btn-danger" onclick="window.offlineStoriesPage.deleteStory('${story.id}')">
              <i class="fas fa-trash"></i> Hapus
            </button>
            ${story.syncStatus === 'pending' ? `
              <button class="btn btn-sm btn-primary" onclick="window.offlineStoriesPage.syncStory('${story.id}')">
                <i class="fas fa-sync"></i> Sync
              </button>
            ` : ''}
          </div>
        </div>
      </div>
      `;
    }).join('');
  }

  setupEventListeners() {
    // Search functionality
    const searchInput = document.querySelector('#search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.applyFilters();
        this.displayStories();
      });
    }

    // Filter functionality
    const filterSelect = document.querySelector('#filter-select');
    if (filterSelect) {
      filterSelect.addEventListener('change', (e) => {
        this.currentFilter = e.target.value;
        this.applyFilters();
        this.displayStories();
      });
    }

    // Sort functionality
    const sortSelect = document.querySelector('#sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.currentSort = e.target.value;
        this.applyFilters();
        this.displayStories();
      });
    }

    // Sort order toggle
    const sortOrderBtn = document.querySelector('#sort-order-btn');
    if (sortOrderBtn) {
      sortOrderBtn.addEventListener('click', () => {
        this.currentOrder = this.currentOrder === 'desc' ? 'asc' : 'desc';
        const icon = sortOrderBtn.querySelector('i');
        icon.className = this.currentOrder === 'desc' ? 'fas fa-sort-amount-down' : 'fas fa-sort-amount-up';
        this.applyFilters();
        this.displayStories();
      });
    }

    // Sync all button
    const syncAllBtn = document.querySelector('#sync-all-btn');
    if (syncAllBtn) {
      syncAllBtn.addEventListener('click', () => this.syncAllStories());
    }

    // Clear all button
    const clearAllBtn = document.querySelector('#clear-all-btn');
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', () => this.clearAllStories());
    }
  }

  async syncAllStories() {
    try {
      const pendingStories = await this.indexedDB.getPendingSyncStories();
      let syncedCount = 0;

      for (const story of pendingStories) {
        try {
          // Simulate API call (replace with actual API call)
          await this.simulateApiCall(story);
          await this.indexedDB.markAsSynced(story.id);
          syncedCount++;
        } catch (error) {
          console.error(`Failed to sync story ${story.id}:`, error);
        }
      }

      this.showMessage(`Berhasil sync ${syncedCount} story`);
      await this.loadStories();
      
      // Refresh home page if we're online
      if (navigator.onLine) {
        this.refreshHomePage();
      }
    } catch (error) {
      console.error('Error syncing stories:', error);
      this.showError('Gagal sync story');
    }
  }

  // Simulate API call for testing
  async simulateApiCall(story) {
    return new Promise((resolve) => {
      // Simulate network delay
      setTimeout(() => {
        console.log('Simulated API call for story:', story.id);
        resolve();
      }, 1000);
    });
  }

  async clearAllStories() {
    if (confirm('Apakah Anda yakin ingin menghapus semua story offline?')) {
      try {
        await this.indexedDB.clearAll();
        this.showMessage('Semua story offline berhasil dihapus');
        await this.loadStories();
      } catch (error) {
        console.error('Error clearing stories:', error);
        this.showError('Gagal menghapus semua story');
      }
    }
  }

  async syncStory(id) {
    try {
      const story = await this.indexedDB.getStoryById(id);
      if (!story) return;

      // Simulate API call (replace with actual API call)
      await this.simulateApiCall(story);
      await this.indexedDB.markAsSynced(id);
      
      this.showMessage('Story berhasil di-sync');
      await this.loadStories();
    } catch (error) {
      console.error('Error syncing story:', error);
      this.showError('Gagal sync story');
    }
  }

  async simulateApiCall(story) {
    // Simulate network delay
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Syncing story:', story.name);
        resolve();
      }, 1000);
    });
  }

  async deleteStory(id) {
    if (!confirm('Yakin ingin menghapus story ini?')) return;

    try {
      await this.indexedDB.deleteStory(id);
      this.showMessage('Story berhasil dihapus');
      await this.loadStories();
    } catch (error) {
      console.error('Error deleting story:', error);
      this.showError('Gagal menghapus story');
    }
  }

  async clearAllStories() {
    if (!confirm('Yakin ingin menghapus semua story offline?')) return;

    try {
      await this.indexedDB.clearAll();
      this.showMessage('Semua story offline berhasil dihapus');
      await this.loadStories();
    } catch (error) {
      console.error('Error clearing stories:', error);
      this.showError('Gagal menghapus semua story');
    }
  }

  showMessage(message) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = 'toast toast-success';
    toast.innerHTML = `
      <i class="fas fa-check-circle"></i>
      <span>${message}</span>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  showError(message) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = 'toast toast-error';
    toast.innerHTML = `
      <i class="fas fa-exclamation-circle"></i>
      <span>${message}</span>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  showMessage(message) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = 'toast toast-success';
    toast.innerHTML = `
      <i class="fas fa-check-circle"></i>
      <span>${message}</span>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  refreshHomePage() {
    // Dispatch custom event to refresh home page
    window.dispatchEvent(new CustomEvent('refreshHomePage'));
  }

  async viewStory(id) {
    try {
      const story = await this.indexedDB.getStoryById(id);
      if (!story) {
        this.showError('Story tidak ditemukan');
        return;
      }

      // Show story detail in modal or navigate to detail page
      this.showStoryDetail(story);
    } catch (error) {
      console.error('Error viewing story:', error);
      this.showError('Gagal memuat detail story');
    }
  }

  showStoryDetail(story) {
    // Prefer fresh blob URL when available to ensure it works after reloads
    let photoUrl = story.photoFile ? URL.createObjectURL(story.photoFile) : (story.photoUrl || '');

    // Create modal for story detail
    const modal = document.createElement('div');
    modal.className = 'story-detail-modal';
    modal.innerHTML = `
      <div class="modal-overlay" onclick="window.closeModal()">
        <div class="modal-content" onclick="event.stopPropagation()">
          <div class="modal-header">
            <h2>Detail Story</h2>
            <button class="modal-close" onclick="window.closeModal()">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="story-detail-image">
              <img src="${photoUrl}" alt="Foto oleh ${story.name}" onload="if(this.src.startsWith('blob:')) URL.revokeObjectURL(this.src)" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';" />
            </div>
            <div class="story-detail-content">
              <h3><i class="fas fa-book-open"></i> ${story.name}</h3>
              <p class="story-description">${story.description}</p>
              <div class="story-meta">
                <span><i class="fas fa-calendar"></i> ${new Date(story.createdAt).toLocaleString('id-ID')}</span>
                ${story.lat && story.lon ? '<span><i class="fas fa-map-marker-alt"></i> Lokasi tersedia</span>' : ''}
                <span class="status-badge ${story.isOffline ? 'offline' : 'synced'}">
                  <i class="fas fa-${story.isOffline ? 'wifi' : 'check'}"></i>
                  ${story.isOffline ? 'Offline' : 'Synced'}
                </span>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" onclick="window.closeModal()">Tutup</button>
            ${story.syncStatus === 'pending' ? `
              <button class="btn btn-primary" onclick="window.offlineStoriesPage.syncStory('${story.id}'); window.closeModal();">
                <i class="fas fa-sync"></i> Sync
              </button>
            ` : ''}
            <button class="btn btn-danger" onclick="window.offlineStoriesPage.deleteStory('${story.id}'); window.closeModal();">
              <i class="fas fa-trash"></i> Hapus
            </button>
          </div>
        </div>
      </div>
    `;

    // Add modal to body
    document.body.appendChild(modal);

    // Add close functionality
    window.closeModal = () => {
      modal.remove();
    };

    // Close on escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        modal.remove();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
  }

  async deleteStory(id) {
    if (confirm('Apakah Anda yakin ingin menghapus story ini?')) {
      try {
        await this.indexedDB.deleteStory(id);
        this.showMessage('Story berhasil dihapus');
        await this.loadStories();
      } catch (error) {
        console.error('Error deleting story:', error);
        this.showError('Gagal menghapus story');
      }
    }
  }

  async syncStory(id) {
    try {
      const story = await this.indexedDB.getStoryById(id);
      if (!story) {
        this.showError('Story tidak ditemukan');
        return;
      }

      // Simulate API call (replace with actual API call)
      await this.simulateApiCall(story);
      await this.indexedDB.markAsSynced(id);
      
      this.showMessage('Story berhasil di-sync');
      await this.loadStories();
      
      // Refresh home page if we're online
      if (navigator.onLine) {
        this.refreshHomePage();
      }
    } catch (error) {
      console.error('Error syncing story:', error);
      this.showError('Gagal sync story');
    }
  }
}

export default OfflineStoriesPage;
