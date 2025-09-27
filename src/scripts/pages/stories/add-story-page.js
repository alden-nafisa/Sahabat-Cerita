import { AddStoryPresenter } from '../../presenters/add-story-presenter.js';
import { MapModel } from '../../models/map-model.js';

export default class AddStoryPage {
  constructor() {
    this.presenter = new AddStoryPresenter(this);
    this.mapModel = new MapModel();
  }

  async render() {
    return `
      <div class="add-story-page">
        <div class="add-story-container">
          <div class="add-story-card">
            <div class="card-actions" aria-label="Navigasi form">
              <button id="add-story-back" type="button" class="icon-btn" aria-label="Kembali" title="Kembali">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <h1 class="add-story-title">Tambah Story</h1>
            <form id="story-form" class="add-story-form" enctype="multipart/form-data" novalidate>

              <div class="form-group">
                <label for="description">Deskripsi</label>
                <textarea id="description" name="description" required placeholder="Ceritakan momen coding Anda..."></textarea>
              </div>
              

              <div class="camera-section">
                <label class="camera-label">Foto</label>
                <div class="camera-controls">
                  <button id="open-camera" type="button" class="btn btn-outline">Buka Kamera</button>
                  <button id="capture-photo" type="button" class="btn btn-primary" disabled>Ambil Foto</button>
                  <button id="close-camera" type="button" class="btn btn-outline" disabled>Tutup Kamera</button>
                </div>
                <video id="camera-preview" playsinline class="camera-preview"></video>
                <canvas id="camera-canvas" class="camera-canvas"></canvas>
                <img id="photo-preview" alt="Preview foto" class="photo-preview"/>

                <div class="form-group">
                  <label for="photo-upload">Atau upload gambar</label>
                  <input id="photo-upload" name="photo-upload" type="file" accept="image/*" class="file-input" />
                </div>
              </div>

              <div class="location-section">
                <label class="location-label">Lokasi (Opsional)</label>
                <div class="location-inputs">
                  <div class="form-group">
                    <label for="lat">Latitude</label>
                    <input id="lat" name="lat" type="number" step="any" placeholder="Contoh: -6.200000" />
                  </div>
                  <div class="form-group">
                    <label for="lon">Longitude</label>
                    <input id="lon" name="lon" type="number" step="any" placeholder="Contoh: 106.816666" />
                  </div>
                </div>
                <p class="map-instruction">Klik peta untuk mengisi latitude dan longitude</p>
                <div id="mini-map" class="mini-map"></div>
              </div>

              <button class="btn btn-primary submit-btn" type="submit">Kirim Story</button>
            </form>
            <p id="message" role="status" class="add-story-message"></p>
          </div>
        </div>
      </div>
    `;
  }

  // View methods for Presenter
  showLoading(message) {
    const messageEl = document.querySelector('#message');
    if (messageEl) {
      messageEl.textContent = message;
    }
  }

  showSuccess(message) {
    const messageEl = document.querySelector('#message');
    if (messageEl) {
      messageEl.textContent = message;
    }
  }

  showError(message) {
    const messageEl = document.querySelector('#message');
    if (messageEl) {
      messageEl.textContent = message;
    }
  }

  navigateToHome() {
    setTimeout(() => {
      window.location.hash = '#/';
    }, 1000);
  }

  async afterRender() {

  const form = document.querySelector('#story-form');
  const backBtn = document.querySelector('#add-story-back');
  const latInput = document.querySelector('#lat');
  const lonInput = document.querySelector('#lon');
  const miniMap = document.querySelector('#mini-map');

  // Camera elements
  const openBtn = document.querySelector('#open-camera');
  const captureBtn = document.querySelector('#capture-photo');
  const closeBtn = document.querySelector('#close-camera');
  const videoEl = document.querySelector('#camera-preview');
  const canvasEl = document.querySelector('#camera-canvas');
  const photoPreview = document.querySelector('#photo-preview');
  const photoUpload = document.querySelector('#photo-upload');

  let mediaStream = null;
  let photoFromCamera = null;
  let photoFromUpload = null;
    // Helper to update preview image
    const showPreview = (file) => {
      if (file) {
        photoPreview.src = URL.createObjectURL(file);
        photoPreview.style.display = 'block';
      } else {
        photoPreview.src = '';
        photoPreview.style.display = 'none';
      }
    };

    const stopStream = () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((t) => t.stop());
        mediaStream = null;
      }
      videoEl.style.display = 'none';
      captureBtn.disabled = true;
      closeBtn.disabled = true;
    };

    openBtn?.addEventListener('click', async () => {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        videoEl.srcObject = mediaStream;
        await videoEl.play();
        videoEl.style.display = 'block';
        captureBtn.disabled = false;
        closeBtn.disabled = false;
      } catch (err) {
        this.showError('Tidak bisa membuka kamera: ' + err.message);
      }
    });


    captureBtn?.addEventListener('click', async () => {
      try {
        const width = videoEl.videoWidth;
        const height = videoEl.videoHeight;
        canvasEl.width = width;
        canvasEl.height = height;
        const ctx = canvasEl.getContext('2d');
        ctx.drawImage(videoEl, 0, 0, width, height);
        await new Promise((resolve) => {
          canvasEl.toBlob((blob) => {
            if (!blob) return resolve();
            photoFromCamera = new File([blob], 'photo.jpg', { type: blob.type || 'image/jpeg' });
            photoFromUpload = null; // Clear upload if camera used
            showPreview(photoFromCamera);
            resolve();
          }, 'image/jpeg', 0.9);
        });
      } finally {
        stopStream();
      }
    });

    // Handle file upload
    photoUpload?.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        photoFromUpload = file;
        photoFromCamera = null; // Clear camera if upload used
        showPreview(photoFromUpload);
      } else {
        photoFromUpload = null;
        showPreview(null);
      }
    });

    closeBtn?.addEventListener('click', () => {
      stopStream();
    });

    backBtn?.addEventListener('click', () => {
      stopStream();
      if (window.history.length > 1) window.history.back();
      else window.location.hash = '#/';
    });

    window.addEventListener('hashchange', stopStream, { once: true });

    // Initialize map
    if (window.L) {
      const map = this.mapModel.createMap('mini-map', {
        center: [-2.5, 118],
        zoom: 4.5
      });
      
      this.mapModel.addTileLayer(map, 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap',
      }).addTo(map);
      
      let marker = null;
      map.on('click', (ev) => {
        const { lat, lng } = ev.latlng;
        latInput.value = lat.toFixed(6);
        lonInput.value = lng.toFixed(6);
        if (marker) marker.setLatLng([lat, lng]);
        else marker = this.mapModel.addMarker(map, [lat, lng]);
      });
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

  const description = form.description.value;
      const lat = form.lat.value ? parseFloat(form.lat.value) : undefined;
      const lon = form.lon.value ? parseFloat(form.lon.value) : undefined;

      // Use uploaded file if present, otherwise camera photo
      const photoFile = photoFromUpload || photoFromCamera;

      await this.presenter.addStory({
        description,
        photoFile,
        lat,
        lon
      });
    });
  }
}


