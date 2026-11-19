// Tiny Scholars service worker: every game opens offline after the first visit.
// When you change any file, bump the version (v1 -> v2) so phones refresh their saved copy.
const CACHE = "tiny-scholars-v3";
const FILES = [
  "./", "index.html", "math.html", "letters.html", "science.html",
  "puzzles.html", "stories.html", "world.html", "abacus.html", "games.html",
  "jquery.min.js", "manifest.json", "icon-192.png", "icon-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return; // other sites untouched
  // Network first so updates show; fall back to saved copy when offline
  e.respondWith(
    fetch(req)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      })
      .catch(() => caches.match(req).then(r => r || caches.match("index.html")))
  );
});
