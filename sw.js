// Simple offline cache for GitHub Pages / iOS PWA
const CACHE = "vlm-cache-v3";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(()=>self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => (k===CACHE)?null:caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((resp)=>{
      // Cache GET responses
      if(req.method==="GET" && resp && resp.status===200){
        const copy = resp.clone();
        caches.open(CACHE).then(cache=>cache.put(req, copy)).catch(()=>{});
      }
      return resp;
    }).catch(()=>cached))
  );
});
