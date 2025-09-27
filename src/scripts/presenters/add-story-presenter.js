import { StoryModel } from '../models/story-model.js';
import { AuthModel } from '../models/auth-model.js';
import IndexedDBModel from '../models/indexeddb-model.js';

export class AddStoryPresenter {
  constructor(view) {
    this.view = view;
    this.storyModel = new StoryModel();
    this.authModel = new AuthModel();
    this.indexedDB = new IndexedDBModel();
    this.isOnline = navigator.onLine;
  }

  async addStory(storyData) {
    try {
      this.view.showLoading('Mengirim...');
      
      const token = this.authModel.getToken();
      if (!token) {
        throw new Error('Harus login terlebih dahulu');
      }


      if (!storyData.photoFile) {
        throw new Error('Ambil foto dengan kamera atau upload gambar terlebih dahulu');
      }

      // Check if online

      if (this.isOnline) {
        try {
          // Try to send to API first
          await this.storyModel.addStory({
            token,
            ...storyData
          });
          this.view.showSuccess('Berhasil membuat story');
          this.view.navigateToHome();
        } catch (apiError) {
          // If API fails, save to IndexedDB
          console.log('API failed, saving to IndexedDB:', apiError.message);
          await this.saveToIndexedDB(storyData);
        }
      } else {
        // If offline, save to IndexedDB
        await this.saveToIndexedDB(storyData);
      }
      
    } catch (error) {
      this.view.showError(error.message);
    }
  }

  async saveToIndexedDB(storyData) {
    try {
      // Initialize IndexedDB
      await this.indexedDB.init();
      
      // Create story object for IndexedDB
      const story = {
        id: 'offline_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        name: 'User', // You can get this from auth if needed
        description: storyData.description,
        photoUrl: URL.createObjectURL(storyData.photoFile),
        photoFile: storyData.photoFile, // Store file for later sync
        lat: storyData.lat,
        lon: storyData.lon,
        createdAt: new Date().toISOString(),
        isOffline: true,
        syncStatus: 'pending'
      };

      await this.indexedDB.addStory(story);
      
      this.view.showSuccess('Story disimpan offline. Akan di-sync saat online.');
      this.view.navigateToHome();
    } catch (error) {
      throw new Error('Gagal menyimpan story offline: ' + error.message);
    }
  }
}
