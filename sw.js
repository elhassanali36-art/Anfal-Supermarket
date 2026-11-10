/* السوبرماركت — يعمل بسرعة ويحفظ آخر نسخة من العروض للعرض بدون إنترنت */
var CACHE = 'market-v4';
var CORE = ['./', './index.html', './manifest.webmanifest', './img/icon-192.png', './img/icon-512.png', './img/placeholder.svg'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(CORE); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

function isFresh(url) {
  return url.endsWith('/') || /(index\.html|data\.js|manifest\.webmanifest)$/.test(new URL(url).pathname);
}

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = req.url;
  if (new URL(url).origin !== location.origin) return;

  if (req.mode === 'navigate' || isFresh(url)) {
    /* العروض والأسعار: نجيبها من الشبكة دائماً، ونستخدم الكاش فقط عند انقطاع الإنترنت */
    e.respondWith(
      fetch(req, { cache: 'no-store' }).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
        return res;
      }).catch(function () { return caches.match(req).then(function (hit) { return hit || caches.match('./index.html'); }); })
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(function (hit) {
      if (hit) return hit;
      return fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
        return res;
      });
    })
  );
});
