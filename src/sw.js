self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {}
  const title = data.title || 'Story Notification';
  const options = data.options || { body: 'Ada notifikasi baru.' };
  event.waitUntil(self.registration.showNotification(title, options));
});



