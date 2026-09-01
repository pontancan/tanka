/* 旅の短歌 — 電波がなくても開けるように */
const NAMAE = "tabi-tanka-v1";
const MONO = ["./","./index.html","./manifest.webmanifest",
              "./icon-180.png","./icon-192.png","./icon-512.png","./icon-512-maskable.png"];

self.addEventListener("install", e=>{
  e.waitUntil(caches.open(NAMAE).then(c=>c.addAll(MONO)).then(()=>self.skipWaiting()));
});

self.addEventListener("activate", e=>{
  e.waitUntil(
    caches.keys()
      .then(ks=>Promise.all(ks.filter(k=>k!==NAMAE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

/* 本体はいつも新しいものを取りにいく。取れなければしまってあるものを出す。 */
self.addEventListener("fetch", e=>{
  const req = e.request;
  if (req.method !== "GET") return;

  if (req.mode === "navigate"){
    e.respondWith(
      fetch(req).then(r=>{
        const utsushi = r.clone();
        caches.open(NAMAE).then(c=>c.put("./index.html", utsushi));
        return r;
      }).catch(()=> caches.match("./index.html"))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(r => r || fetch(req).then(res=>{
      const utsushi = res.clone();
      caches.open(NAMAE).then(c=>c.put(req, utsushi));
      return res;
    }))
  );
});
