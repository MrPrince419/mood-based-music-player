const CACHE_NAME = 'mood-music-player-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/static/js/main.js',
    '/static/css/main.css'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS_TO_CACHE))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});