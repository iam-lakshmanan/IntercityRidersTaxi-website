self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
// Network-only. Requests and personal journey details are never cached here.
self.addEventListener('fetch', event => event.respondWith(fetch(event.request)));
