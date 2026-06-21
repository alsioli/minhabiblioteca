const CACHE = 'biblioteca-v1';

const ASSETS = [
    '/',
    '/public/assets/css/global.css',
    '/public/assets/css/header.css',
    '/public/assets/css/menu_lateral.css',
    '/public/assets/css/main.css',
    '/public/assets/css/footer.css',
    '/public/assets/css/mobile.css',
    '/public/imagens/imagem_abstrata_em_d.png'
];

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

// Network first, cache fallback
self.addEventListener('fetch', e => {
    if (e.request.method !== 'GET') return;
    e.respondWith(
        fetch(e.request)
            .then(res => {
                const clone = res.clone();
                caches.open(CACHE).then(c => c.put(e.request, clone));
                return res;
            })
            .catch(() => caches.match(e.request))
    );
});
