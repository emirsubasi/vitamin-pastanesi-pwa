const CACHE_NAME = "vitamin-cache-v1";
const urlsToCache = [
  '/',
  '/index.html',
  '/dashboard.html',
  '/detail.html',
  '/add-employee.html',
  '/tasks.html',
  '/leave.html',
  '/customers.html',
  '/calendar.html',
  '/offline.html',
  '/css/style.css',
  '/js/api.js',
  '/js/app.js',
  '/js/dashboard.js',
  '/js/detail.js',
  '/js/employees.js',
  '/js/add-employee.js',
  '/js/tasks.js',
  '/js/leave.js',
  '/js/customers.js',
  '/js/calendar.js',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache açıldı');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - Network first, fallback to cache
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Başarılı yanıtı cache'e kaydet
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Hata durumunda cache'den al
        return caches.match(event.request)
          .then(response => {
            if (response) {
              return response;
            }
            // HTML dosyası ise offline sayfasını göster
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/offline.html');
            }
          });
      })
  );
});
