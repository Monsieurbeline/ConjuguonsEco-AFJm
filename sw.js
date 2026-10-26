const V='conjuguonseco-v10',FILES=['./','index.html','data.js','app.js','manifest.webmanifest','icon-192.png','icon-512.png','img/logo.png','img/tinet.png','img/tinet-ok.png','img/tinet-cheer.png','img/banniere.jpg','img/logo-afj.jpg','img/logo-oif.jpg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(n=>{const c=n.clone();caches.open(V).then(x=>x.put(e.request,c));return n}).catch(()=>caches.match('index.html'))))});
