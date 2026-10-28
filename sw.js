/* ConjuguonsEco : service worker. Changer V à chaque mise en ligne pour que les appareils se mettent à jour. */
const V='conjuguonseco-v19';
/* indispensable : si l’un de ces fichiers manque, l’installation échoue et l’ancienne version reste active */
const CORE=['./','index.html','data.js','js/donnees.js','js/base.js','js/interface.js','js/services.js','js/navigation.js','js/ecrans.js','js/jeu.js','js/minijeux.js','js/profil.js','manifest.webmanifest'];
/* utile mais non bloquant : un fichier absent est simplement ignoré */
const MORE=['icon-192.png','icon-512.png','icon-maskable-192.png','icon-maskable-512.png','apropos.html','politique-confidentialite.html','img/logo.png','img/tinet.png','img/tinet-ok.png','img/tinet-cheer.png','img/banniere.jpg','img/titre-fond.webp','img/enseigne.png','img/logo-afj.jpg','img/logo-oif.jpg','img/deco/hills.webp','img/deco/ground.webp','img/deco/cloud1.webp','img/deco/cloud2.webp','img/deco/cloud3.webp','img/deco/palm.webp','img/deco/foliage.webp','img/deco/bush1.webp','img/deco/bush2.webp'];

self.addEventListener('install',e=>{e.waitUntil((async()=>{
  const c=await caches.open(V);
  await c.addAll(CORE);
  await Promise.allSettled(MORE.map(u=>c.add(u)));
  await self.skipWaiting();
})())});

self.addEventListener('activate',e=>{e.waitUntil((async()=>{
  for(const k of await caches.keys())if(k!==V)await caches.delete(k);
  await self.clients.claim();
})())});

/* le son (et toute lecture « par morceaux ») envoie un en-tête Range : on le sert depuis le cache sans casser la lecture */
async function slice(r,res){
  const b=await res.blob(),size=b.size,m=/bytes=(\d*)-(\d*)/.exec(r.headers.get('range'));
  if(!m)return res;
  let s,e;
  if(m[1]===''){s=Math.max(0,size-Number(m[2]));e=size}
  else{s=Number(m[1]);e=m[2]===''?size:Math.min(size,Number(m[2])+1)}
  if(s>=size||s>=e)return new Response('',{status:416,headers:{'Content-Range':'bytes */'+size}});
  return new Response(b.slice(s,e),{status:206,statusText:'Partial Content',headers:{'Content-Type':res.headers.get('Content-Type')||'application/octet-stream','Content-Range':`bytes ${s}-${e-1}/${size}`,'Content-Length':String(e-s)}});
}

async function handle(r){
  const c=await caches.open(V),ranged=r.headers.has('range');
  const hit=await c.match(r,{ignoreSearch:r.mode==='navigate'});
