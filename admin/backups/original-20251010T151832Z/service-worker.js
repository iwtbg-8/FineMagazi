const PRECACHE = 'precache-v1';
const RUNTIME = 'runtime';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(PRECACHE).then(cache => cache.addAll(PRECACHE_URLS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

function staleWhileRevalidate(request) {
  return caches.open(RUNTIME).then(cache =>
    cache.match(request).then(cached =>
      fetch(request).then(response => {
        cache.put(request, response.clone());
        return response;
      }).catch(() => cached)
    )
  );
}

self.addEventListener('fetch', event => {
  const req = event.request;

  // Navigation requests -> network-first
  if (req.mode === 'navigate' || req.destination === 'document') {
    event.respondWith(
      fetch(req).then(resp => { caches.open(RUNTIME).then(c=>c.put(req, resp.clone())); return resp; }).catch(() => caches.match(req))
    );
    return;
  }

  // Styles, scripts, images -> stale-while-revalidate
  if (['style','script','image','font'].includes(req.destination)) {
    event.respondWith(staleWhileRevalidate(req));
    return;
  }

  // Default: try cache then network
  event.respondWith(caches.match(req).then(cached => cached || fetch(req)));
});
