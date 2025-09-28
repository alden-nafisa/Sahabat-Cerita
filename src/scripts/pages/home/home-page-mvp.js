import { HomePresenter } from '../../presenters/home-presenter.js';
import { MapModel } from '../../models/map-model.js';

export default class HomePage {
  constructor() {
    this.presenter = new HomePresenter(this);
    this.mapModel = new MapModel();
  }

  async render() {
    return `
      <section class="container stories-hero-section">
        <div class="stories-hero-content">
          <div class="stories-hero-text">
            <div class="stories-hero-title-row">
              <h1 class="stories-hero-title"><span class="brand-purple">Cerita</span>Kita</h1>
              <div class="stories-status-card-inline">
                <div id="online-status" class="status-badge online" style="display: flex;"><i class="fas fa-wifi"></i> ONLINE</div>
                <div id="offline-count" class="status-badge offline" style="display:none;"><i class="fas fa-database"></i> <span id="offline-count-text">0</span> Offline</div>
              </div>
            </div>
            <h2 class="stories-hero-subtitle">Temukan dan bagikan cerita menarik dari komunitas</h2>
            <p class="stories-hero-desc">Jelajahi kisah inspiratif, pengalaman unik, dan momen berharga dari para pengguna. Bagikan ceritamu dan jadilah inspirasi bagi yang lain!</p>
            <div class="stories-hero-actions">
              <a href="#/add-story" class="btn btn-primary stories-hero-btn"><i class="fas fa-plus"></i> Add Story</a>
              <a href="#/offline-stories" class="btn btn-outline stories-hero-btn"><i class="fas fa-database"></i> Offline Stories</a>
            </div>
          </div>
          <div class="stories-hero-image">
            <img src="images/story-1.png" alt="Ilustrasi membaca buku di malam hari" loading="eager" />
          </div>
        </div>
        <div class="discover-bar">
          <div class="discover-bar-row">
            <div class="searchbox">
              <i class="fas fa-search"></i>
              <input id="home-search" type="text" placeholder="Cari cerita..." />
            </div>
            <div class="push-btn-group">
              <button id="push-subscribe" class="btn btn-success" title="Subscribe Push"><i class="fas fa-bell"></i></button>
              <button id="push-unsubscribe" class="btn btn-danger" title="Unsubscribe Push"><i class="fas fa-bell-slash"></i></button>
            </div>
          </div>
          <div class="chips" id="home-chips">
            <button class="chip chip-active" data-filter="all">Semua</button>
            <button class="chip" data-filter="with-location">Ada lokasi</button>
            <button class="chip" data-filter="recent">Terbaru</button>
          </div>
        </div>
        <ul id="stories" class="stories-grid" aria-live="polite"></ul>
        <div id="pagination" style="display:flex; gap:8px; justify-content:center; margin:20px 0;"></div>
        <div id="map" style="height:360px; border:1px solid #e5e7eb; border-radius:8px;"></div>
      </section>
    `;
  }

  // View methods for Presenter
  showLoading() {
    const storiesContainer = document.querySelector('#stories');
    if (storiesContainer) {
      storiesContainer.innerHTML = `
        <div class="loading-state">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Memuat stories...</p>
        </div>
      `;
    }
    
    // Show loading in status indicators
    const onlineStatus = document.querySelector('#online-status');
    if (onlineStatus) {
      onlineStatus.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';
    }
  }

  showGuestView() {
    const mainContent = document.querySelector('.main-content');
    const footer = document.querySelector('.footer');
    const offlineStoriesBtn = document.querySelector('#home-offline-stories-btn');
    
    if (footer) footer.style.display = '';
    if (offlineStoriesBtn) offlineStoriesBtn.style.display = 'none';
    
    if (mainContent) {
      mainContent.innerHTML = `
        <div class="landing-page">
          <!-- Hero Section -->
          <section class="hero-section" style="background:#fff;min-height:480px;display:flex;align-items:center;justify-content:center;padding:0;">
            <div class="hero-container" style="max-width:1200px;width:100%;margin:0 auto;padding:0 2rem;">
              <div class="hero-content" style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:32px;min-height:420px;">
                <div class="hero-text" style="flex:1 1 480px;min-width:320px;">
                  <h1 class="hero-title" style="font-size:3.2rem;font-weight:800;line-height:1.1;margin-bottom:1.2rem;color:#222;">
                    Bagikan <span style="color:#a259c6;font-weight:700;">Cerita</span> Terbaikmu<br>
                    <span style="color:#222;">untuk <span style="color:#a259c6;font-weight:700;">Menginspirasi</span> Komunitas</span>
                  </h1>
                  <p class="hero-description" style="font-size:1.25rem;line-height:1.6;margin-bottom:2.2rem;color:#6b7280;max-width:480px;">
                    Platform berbagi cerita developer Indonesia. Ceritakan pengalaman, inspirasi, dan perjalanan codingmu dengan mudah, lengkap dengan foto dan lokasi.
                  </p>
                  <div class="hero-actions" style="margin-top:2.5rem;">
                    <a href="#/register" class="btn btn-primary btn-large" style="font-size:1.1rem;padding:1rem 2.2rem;box-shadow:0 4px 16px rgba(162,89,198,0.10);border-radius:10px;background:linear-gradient(90deg,#a259c6 0%,#f7b0e4 100%);border:none;">
                      <i class="fas fa-rocket"></i>
                      Mulai Cerita!
                    </a>
                  </div>
                </div>
                <div class="hero-visual" style="flex:1 1 480px;min-width:320px;display:flex;align-items:center;justify-content:center;">
                  <div style="position:relative;display:flex;align-items:center;justify-content:center;width:100%;max-width:420px;">
                    <img src="images/story.png" alt="Ilustrasi berbagi cerita developer" style="width:100%;max-width:420px;min-width:220px;object-fit:contain;filter:drop-shadow(0 8px 32px rgba(162,89,198,0.10));border-radius:24px;background:#f7f6fb;" loading="lazy" />
                  </div>
                </div>
              </div>
            </div>
            <style>
              @media (max-width: 900px) {
                .hero-content { flex-direction:column;gap:32px; }
                .hero-visual { min-width:180px; }
                .hero-title { font-size:2.2rem !important; }
              }
              @media (max-width: 600px) {
                .hero-title { font-size:1.3rem !important; }
                .hero-description { font-size:1rem !important; }
                .hero-visual > div { padding:0 !important; min-width:120px !important; }
              }
            </style>
          </section>
          <!-- Stats Section -->
          <section class="stats-section" style="background:#fff;">
            <div class="container">
              <div class="section-header">
                <h2 style="font-size:2.5rem;font-weight:700;color:#111;">Alur Penggunaan Aplikasi</h2>
                <p>Ada 4 Langkah Yang Diikuti</p>
              </div>
              <div class="stats-grid" style="gap:2rem;grid-template-columns:repeat(4,1fr);margin-top:2.5rem;">
                <div class="stat-item" style="text-align:center;">
                  <div style="width:70px;height:70px;margin:0 auto 1rem auto;background:linear-gradient(135deg,#a259c6,#f7b0e4);border-radius:16px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 24px rgba(162,89,198,0.10);color:#fff;font-size:2rem;font-weight:700;">
                    <i class="fas fa-user-plus"></i>
                  </div>
                  <div style="font-size:1.25rem;font-weight:600;margin-bottom:0.5rem;">Daftar Akun</div>
                  <div style="color:#64748b;">Registrasi akun secara mudah dan cepat</div>
                </div>
                <div class="stat-item" style="text-align:center;">
                  <div style="width:70px;height:70px;margin:0 auto 1rem auto;background:linear-gradient(135deg,#a259c6,#f7b0e4);border-radius:16px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 24px rgba(162,89,198,0.10);color:#fff;font-size:2rem;font-weight:700;">
                    <i class="fas fa-file-alt"></i>
                  </div>
                  <div style="font-size:1.25rem;font-weight:600;margin-bottom:0.5rem;">Buat Story Baru</div>
                  <div style="color:#64748b;">Unggah foto dan tuliskan kisahmu</div>
                </div>
                <div class="stat-item" style="text-align:center;">
                  <div style="width:70px;height:70px;margin:0 auto 1rem auto;background:linear-gradient(135deg,#a259c6,#f7b0e4);border-radius:16px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 24px rgba(162,89,198,0.10);color:#fff;font-size:2rem;font-weight:700;">
                    <i class="fas fa-map-marker-alt"></i>
                  </div>
                  <div style="font-size:1.25rem;font-weight:600;margin-bottom:0.5rem;">Tambahkan Lokasi</div>
                  <div style="color:#64748b;">Tentukan lokasi agar cerita lebih bermakna</div>
                </div>
                <div class="stat-item" style="text-align:center;">
                  <div style="width:70px;height:70px;margin:0 auto 1rem auto;background:linear-gradient(135deg,#a259c6,#f7b0e4);border-radius:16px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 24px rgba(162,89,198,0.10);color:#fff;font-size:2rem;font-weight:700;">
                    <i class="fas fa-share-square"></i>
                  </div>
                  <div style="font-size:1.25rem;font-weight:600;margin-bottom:0.5rem;">Bagikan!</div>
                  <div style="color:#64748b;">Bagikan cerita dan beri inspirasi komunitas</div>
                </div>
              </div>
            </div>
          </section>

          <!-- Testimonials Section -->
          <section class="features-section" style="background:#f8fafc;">
            <div class="container">
              <div class="section-header">
                <h2>Kenapa Pengguna Menyukai SahabatCerita?</h2>
                <p>Testimoni dari para developer dan pengguna aplikasi</p>
              </div>
              <div class="features-grid">
                <div class="feature-card">
                  <div class="feature-icon" style="width:64px;height:64px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#a259c6,#f7b0e4);border-radius:16px;margin:0 auto 1rem auto;">
                    <img src="images/profile-1.png" alt="Andi" style="width:56px;height:56px;border-radius:50%;object-fit:cover;background:#fff;" />
                  </div>
                  <h3>"Aplikasinya keren, mudah digunakan, dan sangat membantu!"</h3>
                  <p>- Andi, Mobile Developer</p>
                </div>
                <div class="feature-card">
                  <div class="feature-icon" style="width:64px;height:64px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#a259c6,#f7b0e4);border-radius:16px;margin:0 auto 1rem auto;">
                    <img src="images/profile-2.png" alt="Sari" style="width:56px;height:56px;border-radius:50%;object-fit:cover;background:#fff;" />
                  </div>
                  <h3>"Fitur peta dan media sangat inovatif untuk berbagi cerita."</h3>
                  <p>- Sari, Web Enthusiast</p>
                </div>
                <div class="feature-card">
                  <div class="feature-icon" style="width:64px;height:64px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#a259c6,#f7b0e4);border-radius:16px;margin:0 auto 1rem auto;">
                    <img src="images/profile-3.png" alt="Budi" style="width:56px;height:56px;border-radius:50%;object-fit:cover;background:#fff;" />
                  </div>
                  <h3>"Push notification-nya bikin selalu update cerita baru!"</h3>
                  <p>- Budi, Backend Engineer</p>
                </div>
              </div>
            </div>
          </section>

          <!-- Case Studies Section -->
          <!-- <section class="stats-section" style="background:#fff;">
            <div class="container">
              <div class="section-header">
                <h2>Recent Case Studies</h2>
                <p>Contoh aplikasi dan cerita yang telah dibagikan</p>
              </div>
              <div class="stats-grid" style="gap:2rem;">
                <div class="stat-item">
                  <img src="public/images/mobile-screenshot.png" alt="Mobile Story" style="height:120px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);" />
                  <div class="stat-label">Website Design for SCFC Canada</div>
                </div>
                <div class="stat-item">
                  <img src="public/images/desktop-screenshot.png" alt="Desktop Story" style="height:120px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);" />
                  <div class="stat-label">Mobile App for Developer Community</div>
                </div>
                <div class="stat-item">
                  <img src="public/images/logo.png" alt="Logo Story" style="height:120px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);" />
                  <div class="stat-label">Branding & Identity</div>
                </div>
              </div>
            </div>
          </section> -->

          <!-- Tech Stack Section -->
          <section class="features-section" style="background:#f8fafc;">
            <div class="container">
              <div class="section-header">
                <h2>Our Tech Stack</h2>
                <p>Teknologi yang digunakan dalam pengembangan aplikasi</p>
              </div>
              <div class="features-grid">
                <div class="feature-card"><div class="feature-icon" style="width:80px;height:80px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#a259c6,#f7b0e4);border-radius:16px;margin:0 auto 1rem auto;"><i class="fab fa-node-js" style="font-size:2.5rem;color:#fff;"></i></div>Node.js</div>
                <div class="feature-card"><div class="feature-icon" style="width:80px;height:80px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#a259c6,#f7b0e4);border-radius:16px;margin:0 auto 1rem auto;"><i class="fas fa-database" style="font-size:2.5rem;color:#fff;"></i></div>IndexedDB</div>
                <div class="feature-card"><div class="feature-icon" style="width:80px;height:80px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#a259c6,#f7b0e4);border-radius:16px;margin:0 auto 1rem auto;"><i class="fas fa-cloud" style="font-size:2.5rem;color:#fff;"></i></div>Cloud Hosting</div>
                <div class="feature-card"><div class="feature-icon" style="width:80px;height:80px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#a259c6,#f7b0e4);border-radius:16px;margin:0 auto 1rem auto;"><i class="fas fa-map" style="font-size:2.5rem;color:#fff;"></i></div>Leaflet Map</div>
                <div class="feature-card"><div class="feature-icon" style="width:80px;height:80px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#a259c6,#f7b0e4);border-radius:16px;margin:0 auto 1rem auto;"><i class="fas fa-bell" style="font-size:2.5rem;color:#fff;"></i></div>Web Push</div>
                <div class="feature-card"><div class="feature-icon" style="width:80px;height:80px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#a259c6,#f7b0e4);border-radius:16px;margin:0 auto 1rem auto;"><i class="fas fa-mobile-alt" style="font-size:2.5rem;color:#fff;"></i></div>PWA</div>
              </div>
            </div>
          </section>

          <!-- CTA Section -->
          <section class="cta-section">
            <div class="container">
              <div class="cta-content">
                <h2>Hire the best developers and designers around!</h2>
                <p>Bergabunglah dengan komunitas kami dan mulai berbagi cerita inspiratif hari ini.</p>
                <div class="cta-actions">
                  <a href="#/register" class="btn btn-primary btn-large">
                    <i class="fas fa-rocket"></i>
                    Daftar Sekarang
                  </a>
                  <a href="#/login" class="btn btn-outline btn-large">
                    <i class="fas fa-sign-in-alt"></i>
                    Masuk
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>`;
    }
  }

  showAuthenticatedView() {
    const pageHeader = document.querySelector('.page-header');
    const loginBtn = document.querySelector('#home-login-btn');
    const registerBtn = document.querySelector('#home-register-btn');
    const offlineStoriesBtn = document.querySelector('#home-offline-stories-btn');
    
    if (pageHeader) pageHeader.style.display = '';
    if (loginBtn) loginBtn.style.display = 'none';
    if (registerBtn) registerBtn.style.display = 'none';
    if (offlineStoriesBtn) offlineStoriesBtn.style.display = 'inline-flex';
  }

  displayStories(stories) {
    const storiesContainer = document.querySelector('#stories');
    if (storiesContainer) {
      storiesContainer.innerHTML = stories
        .map((s) => {
          // Prefer fresh blob URL when a photoFile exists
          let photoUrl = s.photoFile ? URL.createObjectURL(s.photoFile) : (s.photoUrl || '');
          
          // Create fallback image
          const fallbackImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OWFiYiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
          
          return `
          <li class="story-card">
            <a class="story-link" href="#/stories/${s.id}">
              <div class="story-image-container">
                <img src="${photoUrl || fallbackImage}" alt="Foto oleh ${s.name}" loading="lazy" onload="if(this.src.startsWith('blob:')) URL.revokeObjectURL(this.src)" onerror="this.src='${fallbackImage}'; this.onerror=null;" />
                <div class="story-overlay">
                  <i class="fas fa-eye"></i>
                </div>
              </div>
              <div class="story-content">
                <h3><i class="fas fa-book-open"></i> ${s.name}</h3>
                <p>${s.description}</p>
                <div class="story-meta">
                  <span><i class="fas fa-calendar"></i> ${new Date(s.createdAt).toLocaleString('id-ID')}</span>
                  ${s.lat && s.lon ? '<span><i class="fas fa-map-marker-alt"></i> Lokasi tersedia</span>' : ''}
                </div>
              </div>
            </a>
            <button class="icon-btn bookmark-btn" aria-label="Simpan" data-id="${s.id}" data-name="${s.name}" data-description="${s.description}" data-created="${s.createdAt}" data-photo="${s.photoUrl || ''}">
              <i class="fas fa-bookmark"></i>
            </button>
          </li>
          `;
        })
        .join('');
    }
  }

  renderPagination(hasPrev, hasNext) {
    const paginationEl = document.querySelector('#pagination');
    if (paginationEl) {
      paginationEl.innerHTML = '';
      const prevBtn = document.createElement('button');
      prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i> Prev';
      prevBtn.className = 'btn btn-outline';
      prevBtn.disabled = !hasPrev;
      prevBtn.addEventListener('click', () => this.presenter.onPageChange('prev'));
      
      const nextBtn = document.createElement('button');
      nextBtn.innerHTML = 'Next <i class="fas fa-chevron-right"></i>';
      nextBtn.className = 'btn btn-outline';
      nextBtn.disabled = !hasNext;
      nextBtn.addEventListener('click', () => this.presenter.onPageChange('next'));
      
      paginationEl.append(prevBtn, nextBtn);
    }
  }

  renderMap(stories) {
    const mapContainer = document.querySelector('#map');
    if (!mapContainer || !window.L) return;

    try {
      this.mapModel.destroyMap();
      mapContainer.innerHTML = '';
      
      const map = this.mapModel.createMap('map', {
        center: [-2.5, 118],
        zoom: 4.5
      });

      const osm = this.mapModel.addTileLayer(map, 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap',
      });
      
      const toner = this.mapModel.addTileLayer(map, 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 20,
        attribution: '© CARTO',
      });
      
      const terrain = this.mapModel.addTileLayer(map, 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 17,
        attribution: '© OpenTopoMap',
      });

      osm.addTo(map);

      const markersLayer = this.mapModel.addLayerGroup(map);

      stories.filter((s) => typeof s.lat === 'number' && typeof s.lon === 'number')
        .forEach((s) => {
          this.mapModel.addMarker(map, [s.lat, s.lon], `<b>${s.name}</b><br/>${s.description}`);
        });

      const baseLayers = {
        'OpenStreetMap': osm,
        'Light Map': toner,
        'Topo': terrain
      };
      
      const overlayLayers = {
        'Stories': markersLayer
      };

      this.mapModel.addLayerControl(map, baseLayers, overlayLayers);
    } catch (error) {
      console.error('Map initialization error:', error);
      mapContainer.innerHTML = '<p>Error loading map. Please refresh the page.</p>';
    }
  }

  getLocationToggle() {
    const locationToggle = document.querySelector('#location-toggle');
    return locationToggle ? locationToggle.checked : false;
  }

  showError(message) {
    const storiesContainer = document.querySelector('#stories');
    if (storiesContainer) {
      storiesContainer.innerHTML = `<p role="alert">${message}</p>`;
    }
  }

  showMessage(message) {
    const toast = document.createElement('div');
    toast.className = 'toast toast-success';
    toast.innerHTML = `<i class="fas fa-bell"></i><span>${message}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  // Navigation methods
  navigateToHome() {
    setTimeout(() => {
      window.location.hash = '#/';
    }, 1000);
  }

  navigateToLogin() {
    setTimeout(() => {
      window.location.hash = '#/login';
    }, 1000);
  }

  showMessage(message) {
    const toast = document.createElement('div');
    toast.className = 'toast toast-success';
    toast.innerHTML = `<i class="fas fa-bell"></i><span>${message}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  async afterRender() {
    const locationToggle = document.querySelector('#location-toggle');
    const subscribeBtn = document.querySelector('#push-subscribe');
    const unsubscribeBtn = document.querySelector('#push-unsubscribe');
    const searchInput = document.querySelector('#home-search');
    const chips = document.querySelector('#home-chips');

    // Event listeners
    if (locationToggle) {
      locationToggle.addEventListener('change', () => this.presenter.onLocationToggle());
    }

    if (subscribeBtn) {
      subscribeBtn.addEventListener('click', () => this.presenter.subscribeWebPush());
    }

    if (unsubscribeBtn) {
      unsubscribeBtn.addEventListener('click', () => this.presenter.unsubscribeWebPush());
    }

    // Search filter (client-side)
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const cards = document.querySelectorAll('#stories .story-card');
        cards.forEach((card) => {
          const text = card.textContent.toLowerCase();
          card.style.display = text.includes(query) ? '' : 'none';
        });
      });
    }

    // Chips filter
    if (chips) {
      chips.addEventListener('click', (e) => {
        const btn = e.target.closest('.chip');
        if (!btn) return;
        chips.querySelectorAll('.chip').forEach(c => c.classList.remove('chip-active'));
        btn.classList.add('chip-active');
        const filter = btn.getAttribute('data-filter');
        const cards = document.querySelectorAll('#stories .story-card');
        cards.forEach((card) => {
          if (filter === 'with-location') {
            const hasLoc = !!card.querySelector('.fa-map-marker-alt');
            card.style.display = hasLoc ? '' : 'none';
          } else if (filter === 'recent') {
            // simple visual: show all, sort already handled by API; keep UX predictable
            card.style.display = '';
          } else {
            card.style.display = '';
          }
        });
      });
    }

    // Load initial data
    await this.presenter.loadStories();

    // Mark bookmark buttons active based on current favorites
    try {
      const indexed = new (await import('../../models/indexeddb-model.js')).default();
      await indexed.init();
      const favs = await indexed.getAllFavorites();
      const favIds = new Set(favs.map(f => String(f.id)));
      document.querySelectorAll('.bookmark-btn').forEach((btn) => {
        if (favIds.has(btn.getAttribute('data-id'))) {
          btn.classList.add('active');
        }
      });
    } catch {}

    // Delegate bookmark button clicks
    const storiesContainer = document.querySelector('#stories');
    if (storiesContainer) {
      storiesContainer.addEventListener('click', async (e) => {
        const btn = e.target.closest('.bookmark-btn');
        if (!btn) return;
        const story = {
          id: btn.getAttribute('data-id'),
          name: btn.getAttribute('data-name'),
          description: btn.getAttribute('data-description'),
          createdAt: btn.getAttribute('data-created'),
          photoUrl: btn.getAttribute('data-photo') || ''
        };
        const saved = await this.presenter.toggleFavorite(story);
        btn.classList.toggle('active', saved);
        this.showMessage(saved ? 'Disimpan ke Favorit' : 'Dihapus dari Favorit');
      });
    }
  }
}
