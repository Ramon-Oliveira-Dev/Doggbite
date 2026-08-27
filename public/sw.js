const CACHE_NAME = 'doggbite-cache-v10';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo1.png',
  '/logo2.png',
  '/icon-180.png',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn("Pre-cache warning during install:", err);
      });
    }).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key).catch(() => {});
          }
        })
      );
    }).catch(() => {})
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  let url;
  try {
    url = new URL(e.request.url);
  } catch (_) {
    return;
  }

  // Skip non-http/https, range requests, audio streams, APIs, Supabase, and dynamic assets
  if (
    !url.protocol.startsWith('http') ||
    url.origin.includes('supabase') ||
    url.pathname.startsWith('/api') ||
    url.pathname.endsWith('.mp3') ||
    e.request.headers.has('range')
  ) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Background sync to keep cache fresh
        fetch(e.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(e.request, networkResponse).catch(() => {});
            }).catch(() => {});
          }
        }).catch(() => {});
        return cachedResponse;
      }

      return fetch(e.request).then((networkResponse) => {
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          networkResponse.type === 'basic' &&
          !url.pathname.includes('chrome-extension')
        ) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseClone).catch(() => {});
          }).catch(() => {});
        }
        return networkResponse;
      }).catch((err) => {
        if (e.request.mode === 'navigate') {
          return caches.match('/').then(res => res || Response.error());
        }
        throw err;
      });
    })
  );
});

