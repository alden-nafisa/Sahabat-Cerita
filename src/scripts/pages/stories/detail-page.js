import { parseActivePathname } from '../../routes/url-parser.js';

import { MapModel } from '../../models/map-model.js';
import IndexedDBModel from '../../models/indexeddb-model.js';

export default class StoryDetailPage {
  constructor() {
    this.mapModel = new MapModel();
    this.indexedDB = new IndexedDBModel();
  }

  async render() {
    return `
      <section class="container">
        <a href="#/" class="btn" style="margin-bottom:12px; display:inline-block;">Kembali</a>
        <article id="story-detail"></article>
      </section>
    `;
  }

  async afterRender() {
    const target = document.querySelector('#story-detail');
    try {
      const { id } = parseActivePathname();
      const { authStorage } = await import('../../utils/index.js');
      const { getStoryDetail } = await import('../../data/api.js');
      const token = authStorage.token;
      const data = await getStoryDetail({ token, id });
      const s = data.story;
      
      let mapHtml = '';
      if (s.lat && s.lon) {
        mapHtml = `
          <div class="story-map">
            <h3><i class="fas fa-map-marker-alt"></i> Lokasi Story</h3>
            <div id="detail-map" style="height: 300px; border-radius: 8px; margin-top: 12px;"></div>
          </div>
        `;
      }
      
      target.innerHTML = `
        <div class="story-detail-container">
          <div class="story-detail-image">
            <img src="${s.photoUrl}" alt="Foto oleh ${s.name}" />
          </div>
          <div class="story-detail-content">
            <h1><i class="fas fa-book-open"></i> ${s.name}</h1>
            <p class="story-description">${s.description}</p>
            <div class="story-detail-meta">
              <span><i class="fas fa-calendar"></i> Dibuat: ${new Date(s.createdAt).toLocaleDateString('id-ID')}</span>
              ${s.lat && s.lon ? '<span><i class="fas fa-map-marker-alt"></i> Lokasi tersedia</span>' : ''}
            </div>
            <div style="margin-top:12px;">
              <button id="fav-toggle" class="btn btn-outline"><i class="fas fa-bookmark"></i> Simpan</button>
            </div>
          </div>
          ${mapHtml}
        </div>
      `;

      // Favorite toggle setup
      try {
        await this.indexedDB.init();
        const isFav = await this.indexedDB.isFavorite(s.id);
        const favBtn = document.querySelector('#fav-toggle');
        if (favBtn) {
          if (isFav) favBtn.classList.add('active');
          favBtn.addEventListener('click', async () => {
            const saved = await this.indexedDB.toggleFavorite({ id: s.id, name: s.name, description: s.description, createdAt: s.createdAt, photoUrl: s.photoUrl });
            favBtn.classList.toggle('active', saved);
          });
        }
      } catch {}

      // Initialize map if story has location
      if (s.lat && s.lon && window.L) {
        const map = this.mapModel.createMap('detail-map', {
          center: [s.lat, s.lon],
          zoom: 13
        });
        
        // Add multiple tile layers
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

        const satellite = this.mapModel.addTileLayer(map, 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: '© Esri',
        });

        // Set default layer
        osm.addTo(map);
        
        // Add marker
        this.mapModel.addMarker(map, [s.lat, s.lon], `
          <b>${s.name}</b><br/>
          ${s.description}
        `);

        // Add layer control
        const baseLayers = {
          'OpenStreetMap': osm,
          'Light Map': toner,
          'Topo': terrain,
          'Satellite': satellite
        };
        
        this.mapModel.addLayerControl(map, baseLayers, {});
      }
    } catch (err) {
      target.innerHTML = `<p role="alert">${err.message}</p>`;
    }
  }
}


