const CACHE_NAME = 'summer-checkin-v7';
const STATIC_ASSETS = [
  './',
  './index.html',
  './island.html',
  './checkin.html',
  './badges.html',
  './stats.html',
  './print.html',
  './manifest.json',
  './css/base.css',
  './css/components.css',
  './css/themes.css',
  './css/print.css',
  './css/portal.css',
  './css/map.css',
  './css/theme-switcher.css',
  './js/data.js',
  './js/storage.js',
  './js/checkin.js',
  './js/map.js',
  './js/badges.js',
  './js/stats.js',
  './js/app.js'
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
