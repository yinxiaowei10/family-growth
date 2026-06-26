const CACHE_NAME = 'summer-checkin-v1';
const STATIC_ASSETS = [
  '/summer-checkin/',
  '/summer-checkin/index.html',
  '/summer-checkin/checkin.html',
  '/summer-checkin/badges.html',
  '/summer-checkin/stats.html',
  '/summer-checkin/print.html',
  '/summer-checkin/manifest.json',
  '/summer-checkin/css/base.css',
  '/summer-checkin/css/components.css',
  '/summer-checkin/css/themes.css',
  '/summer-checkin/css/print.css',
  '/summer-checkin/js/data.js',
  '/summer-checkin/js/storage.js',
  '/summer-checkin/js/checkin.js',
  '/summer-checkin/js/map.js',
  '/summer-checkin/js/badges.js',
  '/summer-checkin/js/stats.js',
  '/summer-checkin/js/app.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request).then((fetchResponse) => {
          return fetchResponse;
        })
      );
    })
  );
});
