// Simple service worker to provide efficient caching lifetimes for static assets.
// Strategy:
// - Precache core site shell on install.
// - Network-first for navigation/HTML requests (keeps pages fresh), fallback to cache.
// - Cache-first for static assets (CSS/JS/images); update cache in background when possible.

const CACHE_VERSION = 'v1';
const CACHE_NAME = `finemagazi-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/head-loader.js',
  '/img/F.jpg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

function isNavigationRequest(request) {
  return request.mode === 'navigate' || (request.method === 'GET' && request.headers.get('accept') && request.headers.get('accept').includes('text/html'));
}

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== location.origin) return;

  if (isNavigationRequest(request)) {
    // Network-first for HTML/navigation
    event.respondWith(
      fetch(request).then(networkResponse => {
        // Update cache in background
        caches.open(CACHE_NAME).then(cache => cache.put(request, networkResponse.clone()));
        return networkResponse;
      }).catch(() => caches.match(request).then(cached => cached || caches.match('/index.html')))
    );
    return;
  }

  // For static assets (images, CSS, JS): cache-first with background update
  event.respondWith(
    caches.match(request).then(cached => {
      const networkFetch = fetch(request).then(networkResponse => {
        // Only cache valid responses
        if (networkResponse && networkResponse.status === 200) {
          caches.open(CACHE_NAME).then(cache => cache.put(request, networkResponse.clone()));
        }
        return networkResponse;
      }).catch(() => null);

      // Return cached if available, otherwise network fetch, otherwise fallback
      return cached || networkFetch;
    })
  );
});

// Optional message handler to let client trigger skipWaiting/clear caches
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
