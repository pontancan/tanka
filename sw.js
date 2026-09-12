/* 旅の短歌 — 電波がなくても開けるように */

/* 版。index.html を直したらここも上げる。
   上げ忘れても古いまま固まらないよう、下の取り方で保険をかけてある */
const BAN = "2026-09-13";
const NAMAE = "tabi-tanka-" + BAN;

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

self.addEventListener("fetch", e=>{
  const req = e.request;
  if (req.method !== "GET") return;

  /* 本体はいつも新しいものを取りにいく。取れなければしまってあるものを出す */
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

  /* それ以外は、しまってあるものをすぐ出しつつ、裏で新しくしておく。
     こうしておけば BAN を上げ忘れても、次に開いた時には新しくなっている */
  e.respondWith(
    caches.match(req).then(aru=>{
      const tori = fetch(req).then(res=>{
        if (res && res.ok){
          const utsushi = res.clone();
          caches.open(NAMAE).then(c=>c.put(req, utsushi));
        }
        return res;
      }).catch(()=> aru || Response.error());
      return aru || tori;
    })
  );
});
