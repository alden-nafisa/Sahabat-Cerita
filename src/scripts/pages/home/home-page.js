import { HomePresenter } from '../../presenters/home-presenter.js';

export default class HomePage {
  constructor() {
    this.presenter = new HomePresenter(this);
  }

  async render() {
    return `
      <section class="container stories-hero-section">
        <div class="stories-hero-content">
          <div class="stories-hero-text">
            <h1 class="stories-hero-title">Stories</h1>
            <h2 class="stories-hero-subtitle">Temukan dan bagikan cerita menarik dari komunitas</h2>
            <p class="stories-hero-desc">Jelajahi kisah inspiratif, pengalaman unik, dan momen berharga dari para pengguna. Bagikan ceritamu dan jadilah inspirasi bagi yang lain!</p>
            <div class="stories-hero-actions">
              <a href="#/add-story" class="btn btn-primary stories-hero-btn">+ Add Story</a>
              <a href="#/offline-stories" class="btn btn-outline stories-hero-btn">Offline Stories</a>
            </div>
          </div>
          <div class="stories-hero-image">
            <img src="images/story-1.png" alt="Ilustrasi berbagi cerita" loading="eager" />
          </div>
        </div>
        <ul id="stories" class="stories-grid" aria-live="polite"></ul>
        <div id="pagination" style="display:flex; gap:8px; justify-content:center; margin:20px 0;"></div>
        <div id="map" style="height:360px; border:1px solid #e5e7eb; border-radius:8px;"></div>
        <div style="margin-top:10px; display:flex; gap:8px;">
          <button id="push-subscribe" class="btn">Subscribe Push</button>
          <button id="push-unsubscribe" class="btn">Unsubscribe Push</button>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const storiesContainer = document.querySelector('#stories');
    const paginationEl = document.querySelector('#pagination');
    const locationToggle = document.querySelector('#location-toggle');
    const addStoryBtn = document.querySelector('a[href="#/add-story"]');
    const loginBtn = document.querySelector('#home-login-btn');
    const registerBtn = document.querySelector('#home-register-btn');
    const mapEl = document.querySelector('#map');
    const subscribeBtn = document.querySelector('#push-subscribe');
    const unsubscribeBtn = document.querySelector('#push-unsubscribe');

    let page = 1;
    const size = 10;
    let leafletMap = null; // keep single map instance per page

    const renderPageButtons = (hasPrev, hasNext) => {
      paginationEl.innerHTML = '';
      const prevBtn = document.createElement('button');
      prevBtn.textContent = 'Prev';
      prevBtn.disabled = !hasPrev;
      prevBtn.addEventListener('click', () => {
        page -= 1; loadStories();
      });
      const nextBtn = document.createElement('button');
      nextBtn.textContent = 'Next';
      nextBtn.disabled = !hasNext;
      nextBtn.addEventListener('click', () => {
        page += 1; loadStories();
      });
      paginationEl.append(prevBtn, nextBtn);
    };

    const loadStories = async () => {
      storiesContainer.innerHTML = '<p>Loading...</p>';
      try {
        const { authStorage } = await import('../../utils');
        const { getStories } = await import('../../data/api');
        const token = authStorage.token;
        if (!token) {
          // Hide all elements for guests
          const toolbar = document.querySelector('.toolbar');
          const pageHeader = document.querySelector('.page-header');
          if (toolbar) toolbar.style.display = 'none';
          if (pageHeader) pageHeader.style.display = 'none';
          
          paginationEl.innerHTML = '';
          mapEl.style.display = 'none';
          if (subscribeBtn) subscribeBtn.style.display = 'none';
          if (unsubscribeBtn) unsubscribeBtn.style.display = 'none';
          // Clear everything and show only welcome page
          const mainContent = document.querySelector('.main-content');
          if (mainContent) {
            mainContent.innerHTML = `
              <div class="welcome-page">
                <div class="welcome-hero">
                  <h1>Selamat Datang di Dicoding Story</h1>
                  <p>Platform berbagi cerita terbaik untuk komunitas developer Indonesia</p>
                  <div class="welcome-buttons">
                    <a href="#/register" class="btn btn-primary">Daftar Sekarang</a>
                    <a href="#/login" class="btn btn-outline">Masuk</a>
                  </div>
                </div>
              </div>`;
          }
          return;
        }
        // Authenticated UI tweaks
        const pageHeader = document.querySelector('.page-header');
        if (pageHeader) pageHeader.style.display = '';
        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';

        const location = locationToggle.checked ? 1 : 0;
        const data = await getStories({ token, page, size, location });
        const items = data.listStory || [];
        storiesContainer.innerHTML = items
          .map((s) => `
            <li class="story-card">
              <a class="story-link" href="#/stories/${s.id}">
                <img src="${s.photoUrl}" alt="Foto oleh ${s.name}" loading="lazy" />
                <div class="story-content">
                  <h3>${s.name}</h3>
                  <p>${s.description}</p>
                  <p style="font-size:12px;color:#666;">${new Date(s.createdAt).toLocaleString('id-ID')}</p>
                </div>
              </a>
            </li>
          `)
          .join('');

        renderPageButtons(page > 1, items.length === size);

        // map render with layers
        const mapContainer = document.querySelector('#map');
        if (mapContainer && window.L) {
          try {
            // Destroy previous map instance to avoid "Map container is already initialized" error
            if (leafletMap) {
              leafletMap.remove();
              leafletMap = null;
            }
            mapContainer.innerHTML = '';
            const map = L.map('map').setView([-2.5, 118], 4.5);

            const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 19,
              attribution: '© OpenStreetMap',
            });
            
            const toner = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
              subdomains: 'abcd',
              maxZoom: 20,
              attribution: '© CARTO',
            });
            
            const terrain = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
              maxZoom: 17,
              attribution: '© OpenTopoMap',
            });

            osm.addTo(map);

            const markersLayer = L.layerGroup();
            markersLayer.addTo(map);

            // Add markers for stories with location
            items.filter((s) => typeof s.lat === 'number' && typeof s.lon === 'number')
              .forEach((s) => {
                L.marker([s.lat, s.lon]).addTo(markersLayer).bindPopup(`<b>${s.name}</b><br/>${s.description}`);
              });

            // Add layer control
            const baseLayers = {
              'OpenStreetMap': osm,
              'Light Map': toner,
              'Topo': terrain
            };
            
            const overlayLayers = {
              'Stories': markersLayer
            };

            L.control.layers(baseLayers, overlayLayers, { collapsed: false }).addTo(map);
            leafletMap = map;
          } catch (error) {
            console.error('Map initialization error:', error);
            mapContainer.innerHTML = '<p>Error loading map. Please refresh the page.</p>';
          }
        }
      } catch (err) {
        storiesContainer.innerHTML = `<p role="alert">${err.message}</p>`;
        renderPageButtons(false, false);
      }
    };

    locationToggle.addEventListener('change', () => { page = 1; loadStories(); });
    await loadStories();

    // Web Push subscribe/unsubscribe
    const { authStorage } = await import('../../utils');
    const { subscribeWebPush, unsubscribeWebPush } = await import('../../data/api');
    const VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';

    async function askPermission() {
      const result = await Notification.requestPermission();
      if (result !== 'granted') throw new Error('Izin notifikasi ditolak');
    }

    async function getSubscription() {
      const reg = await navigator.serviceWorker.getRegistration();
      if (!reg) throw new Error('Service worker belum terdaftar');
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: Uint8Array.from(atob(VAPID_PUBLIC_KEY.replace(/_/g, '/').replace(/-/g, '+')), c => c.charCodeAt(0)),
        });
      }
      return sub;
    }

    document.querySelector('#push-subscribe')?.addEventListener('click', async () => {
      try {
        await askPermission();
        const sub = await getSubscription();
        const token = authStorage.token;
        if (!token) throw new Error('Login terlebih dahulu untuk subscribe');
        const data = await subscribeWebPush({ token, subscription: sub.toJSON() });
        alert('Subscribed: ' + data.message);
      } catch (e) {
        alert(e.message);
      }
    });

    document.querySelector('#push-unsubscribe')?.addEventListener('click', async () => {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        const sub = await reg?.pushManager.getSubscription();
        if (!sub) throw new Error('Belum berlangganan');
        const endpoint = sub.endpoint;
        await sub.unsubscribe();
        const token = authStorage.token;
        if (!token) throw new Error('Login terlebih dahulu');
        const data = await unsubscribeWebPush({ token, endpoint });
        alert('Unsubscribed: ' + data.message);
      } catch (e) {
        alert(e.message);
      }
    });
  }
}
