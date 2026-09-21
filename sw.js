const CACHE="lafay-trx-lab-v12";
const ASSETS=["./","./index.html","./manifest.json","./icon.svg"];

self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate",event=>{
  event.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch",event=>{
  const req=event.request;
  const url=new URL(req.url);

  // Ne jamais mettre en cache l'API Supabase ni les requêtes cross-origin.
  if(req.method!=="GET" || url.origin!==self.location.origin) return;

  event.respondWith(
    fetch(req).then(response=>{
      const copy=response.clone();
      caches.open(CACHE).then(cache=>cache.put(req,copy));
      return response;
    }).catch(()=>caches.match(req).then(hit=>hit||caches.match("./index.html")))
  );
});