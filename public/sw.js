const CACHE_NAME = 'home-job-pealpeal-v1';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', (e) => {
  // Network first fallback to cache for offline capabilities
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
