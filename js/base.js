/* état et réglages */
const DEF={music:true,sfx:true,fsc:true,fs:1,dys:false,hc:false,rm:false,nt:false,vox:false};
let S={done:{},photo:null,name:'',xp:0,coins:0,streak:0,last:'',badges:[],daily:{},days:{},td:null,verbs:0,err:{},qbest:0,sr:{},freeze:0,set:{}};
try{Object.assign(S,JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(e){}
S.set=Object.assign({},DEF,S.set);if(S.mute){S.set.sfx=S.set.music=false;delete S.mute}S.err=S.err||{};S.sr=S.sr||{};S.freeze=S.freeze||0;
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
function applySet(){const r=document.documentElement,t=S.set;r.style.setProperty('--fs',[.92,1,1.22][t.fs]);r.classList.toggle('dys',t.dys);r.classList.toggle('hc',t.hc);r.classList.toggle('rm',t.rm)}
const ic=(n,c='')=>`<svg class="ic ${c}" aria-hidden="true" focusable="false"><use href="#i-${n}"/></svg>`;
const esc=t=>t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const norm=t=>t.toLowerCase().replace(/[’‘`´]/g,"'").replace(/\s+/g,' ').replace(/[.!,;:]+$/,'').trim();
const strip=t=>t.normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const pick=a=>a[Math.floor(Math.random()*a.length)];
const shuf=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const lvlOf=x=>1+Math.floor(Math.sqrt(x/40)),today=(d=new Date())=>d.toLocaleDateString('sv');
const dayDiff=(a,b)=>Math.round((new Date(b+'T12:00')-new Date(a+'T12:00'))/864e5),addDays=n=>{const d=new Date();d.setDate(d.getDate()+n);return today(d)};
if(S.last){const d=dayDiff(S.last,today());if(d>2||(d==2&&!S.freeze))S.streak=0}
/* répétition espacée : un verbe raté revient après 1, 3 puis 7 jours */
const SR=[1,3,7],dueErr=()=>Object.keys(S.err).filter(k=>!S.sr[k]||S.sr[k].d<=today());
function srKo(ek){S.sr[ek]={b:0,d:addDays(SR[0])}}
function srOk(ek){if(!S.err[ek])return false;const r=S.sr[ek];if(r&&r.d>today())return false;const b=(r?r.b:0)+1;if(b>=SR.length){delete S.err[ek];delete S.sr[ek];return true}S.sr[ek]={b,d:addDays(SR[b])};return false}
const nz=t=>norm(t).replace(/[‐‑–-]/g,' ').replace(/œ/g,'oe').replace(/\s+/g,' ').trim(),same=(v,a)=>nz(v)===nz(a);
const rich=t=>esc(t).replace(/⟦(.*?)⟧/g,'<b>$1</b>');
const star=k=>S.done[k]?S.done[k].st||0:0;
const stars=n=>`<div class="stars" role="img" aria-label="${n} étoile${n>1?'s':''} sur 3">${[0,1,2].map(i=>`<svg class="ic ${i<n?'on':''}" aria-hidden="true" style="animation-delay:${i*.2}s"><use href="#i-star"/></svg>`).join('')}</div>`;
/* audio : effets, ambiance, voix */
let AC;const ac=()=>{try{AC=AC||new(window.AudioContext||webkitAudioContext)();if(AC.state=='suspended')AC.resume()}catch(e){}return AC};
function tone(f,d=.12,t=0,ty='sine'){if(!S.set.sfx)return;try{const c=ac(),o=c.createOscillator(),g=c.createGain(),n=c.currentTime+t;o.type=ty;o.frequency.value=f;g.gain.setValueAtTime(.14,n);g.gain.exponentialRampToValueAtTime(.001,n+d);o.connect(g);g.connect(c.destination);o.start(n);o.stop(n+d)}catch(e){}}
const sfx={ok:()=>{tone(660);tone(880,.15,.09)},ko:()=>tone(190,.28,0,'sawtooth'),rv:()=>tone(330,.22),win:()=>[523,659,784,1047].forEach((f,i)=>tone(f,.2,i*.12))};
const AU=new Audio('audio/ambiance.mp3');AU.loop=true;AU.volume=.45;AU.preload='auto';AU.addEventListener('canplaythrough',()=>{AU.ok=true},{once:true});
const Amb={on:false,T:[],start(){if(!S.set.music||this.on)return;if(AU.ok){this.on=true;this.file=true;AU.play().catch(()=>{});return}const c=ac();if(!c)return;this.on=true;
  const m=this.m=c.createGain();m.gain.setValueAtTime(0,c.currentTime);m.gain.linearRampToValueAtTime(.55,c.currentTime+2.5);m.connect(c.destination);
  const b=c.createBuffer(1,c.sampleRate*3,c.sampleRate),d=b.getChannelData(0);let l=0;for(let i=0;i<d.length;i++){l=(l+.02*(Math.random()*2-1))/1.02;d[i]=l*3.2}
  const n=this.n=c.createBufferSource();n.buffer=b;n.loop=true;const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=520;const g=c.createGain();g.gain.value=.5;n.connect(f);f.connect(g);g.connect(m);n.start();
