const CACHE_NAME = 'english-os-v2';
const APP_SHELL = [
  './',
  './index.html',
  './daily.html',
  './progress.html',
  './review.html',
  './errors.html',
  './words.html',
  './assets/style.css',
  './assets/app.js',
  './data/dashboard.json',
  './data/daily.json',
  './data/progress.json',
  './data/review_queue.json',
  './data/error_log.md',
  './data/words.json',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match(event.request).then(cached => cached || caches.match('./index.html')))
  );
});
