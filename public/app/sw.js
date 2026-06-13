const CACHE_NAME = 'west-house-v1';
const urlsToCache = [
  './',
  './index.html',
  './css/styles.css',
  './js/config.js',
  './js/db.js',
  './js/auth.js',
  './js/ui.js',
  './js/app.js',
  './img/icon-192.png',
  './img/icon-512.png'
];

// Install Event - Cache assets
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.warn("Failed to cache pre-resources", err))
  );
});

// Fetch Event - Serve from Cache OR Network
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  // Network First, falling back to cache (Better for apps with dynamic data)
  event.respondWith(
    fetch(event.request).then(response => {
      let responseClone = response.clone();
      caches.open(CACHE_NAME).then(cache => {
        cache.put(event.request, responseClone);
      });
      return response;
    }).catch(() => caches.match(event.request))
  );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => {
          return name !== CACHE_NAME;
        }).map(name => {
          return caches.delete(name);
        })
      );
    }).then(() => self.clients.claim())
  );
});
