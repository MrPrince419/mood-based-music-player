const CACHE_NAME = 'mood-music-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/static/js/main.js',
    '/static/css/main.css'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});