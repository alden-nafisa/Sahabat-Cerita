// Service Worker untuk PWA
const CACHE_NAME = 'sahabat-cerita-v2';
const urlsToCache = [
  '/Sahabat-Cerita/',
  '/Sahabat-Cerita/styles/styles.css',
  '/Sahabat-Cerita/scripts/index.js',
  '/Sahabat-Cerita/scripts/pages/home/home-page-mvp.js',
  '/Sahabat-Cerita/scripts/pages/auth/login-page.js',
  '/Sahabat-Cerita/scripts/pages/auth/register-page.js',
  '/Sahabat-Cerita/scripts/pages/stories/detail-page.js',
  '/Sahabat-Cerita/scripts/pages/stories/add-story-page.js',
  '/Sahabat-Cerita/scripts/pages/not-found-page.js',
  '/Sahabat-Cerita/scripts/presenters/home-presenter.js',
  '/Sahabat-Cerita/scripts/presenters/auth-presenter.js',
  '/Sahabat-Cerita/scripts/models/story-model.js',
  '/Sahabat-Cerita/scripts/models/auth-model.js',
  '/Sahabat-Cerita/scripts/models/notification-model.js',
  '/Sahabat-Cerita/scripts/models/map-model.js',
  '/Sahabat-Cerita/scripts/routes/routes.js',
  '/Sahabat-Cerita/scripts/routes/url-parser.js',
  '/Sahabat-Cerita/scripts/utils/index.js',
  '/Sahabat-Cerita/scripts/data/api.js',
  '/Sahabat-Cerita/scripts/config.js',
  '/Sahabat-Cerita/favicon.png',
  '/Sahabat-Cerita/manifest.json',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];
// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  // App Shell-style: navigate requests should fall back to cached index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((response) => {
          if (response && response.status === 200 && response.type !== 'opaque') {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
          }
          return response;
        })
        .catch(() => cached);
      return cached || networkFetch;
    })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Ada cerita baru di SahabatCerita!',
    icon: '/favicon.png',
    badge: '/favicon.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Lihat Cerita',
        icon: '/favicon.png'
      },
      {
        action: 'close',
        title: 'Tutup',
        icon: '/favicon.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('SahabatCerita', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

