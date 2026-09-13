// Self-destructing service worker: cleans old caches and updates to modern Web app
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))).then(() => {
      self.clients.claim();
      return self.registration.unregister();
    })
  );
});

