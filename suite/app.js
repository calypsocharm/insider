/* Funnel Suite — no-backend funnel builder */
"use strict";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const uid = () => "id" + Math.random().toString(36).slice(2, 9);
const clone = o => JSON.parse(JSON.stringify(o));
function toast(msg){ const t = $("#toast"); t.textContent = msg; t.hidden = false; t.classList.add("show"); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove("show"), 2200); }
const deb = (fn, ms = 350) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

const DB = (() => {
  let dbp;
  function open(){ if(dbp) return dbp; dbp = new Promise((res, rej) => {
    const r = indexedDB.open("funnel_suite", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("assets", { keyPath: "id" });
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  }); return dbp; }
  function tx(mode){ return open().then(db => db.transaction("assets", mode).objectStore("assets")); }
  return {
    put(a){ return tx("readwrite").then(s => new Promise((res,rej)=>{ const rq=s.put(a); rq.onsuccess=()=>res(); rq.onerror=()=>rej(rq.error); })); },
    get(id){ return tx("readonly").then(s => new Promise((res,rej)=>{ const rq=s.get(id); rq.onsuccess=()=>res(rq.result); rq.onerror=()=>rej(rq.error); })); },
    all(){ return tx("readonly").then(s => new Promise((res,rej)=>{ const rq=s.getAll(); rq.onsuccess=()=>res(rq.result||[]); rq.onerror=()=>rej(rq.error); })); },
    del(id){ return tx("readwrite").then(s => new Promise((res,rej)=>{ const rq=s.delete(id); rq.onsuccess=()=>res(); rq.onerror=()=>rej(rq.error); })); },
  };
})();

const ICONS = {
  spark:'<svg viewBox="0 0 24 24"><path d="M3 12h4l2 6 4-14 2 8h6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  star:'<svg viewBox="0 0 24 24"><path d="M12 2l2.4 5 5.6.8-4 3.9.9 5.5L12 14.8 7.1 17.2 8 11.7 4 7.8 9.6 7z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
  book:'<svg viewBox="0 0 24 24"><path d="M4 5h16v14H4z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M4 9h16M9 5v14" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
  gift:'<svg viewBox="0 0 24 24"><path d="M4 11h16v9H4zM4 7h16v4H4zM12 7v13M12 7C9 7 8 4 12 4c4 0 3 3 0 3z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
  heart:'<svg viewBox="0 0 24 24"><path d="M12 20S4 14.5 4 8.8A4 4 0 0 1 12 6a4 4 0 0 1 8 2.8C20 14.5 12 20 12 20z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
  compass:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M15 9l-2 5-5 2 2-5z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
  shield:'<svg viewBox="0 0 24 24"><path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
  leaf:'<svg viewBox="0 0 24 24"><path d="M5 19C5 10 12 5 20 5c0 8-5 15-14 14-1 0-1-1-1-0z M5 19l7-7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
  bolt:'<svg viewBox="0 0 24 24"><path d="M13 2L4 14h6l-2 8 9-12h-6z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
  crown:'<svg viewBox="0 0 24 24"><path d="M3 17h18l-2-9-4 4-3-6-3 6-4-4z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
  wave:'<svg viewBox="0 0 24 24"><path d="M2 12c3-4 6-4 9 0s6 4 9 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M2 17c3-4 6-4 9 0s6 4 9 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  chat:'<svg viewBox="0 0 24 24"><path d="M4 5h16v11H8l-4 4z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
};
const ICON_KEYS = Object.keys(ICONS);

const THEMES = {
  abyss:{ name:"Abyss", vars:{bg:"#06131f",bg2:"#0a1b2a",surface:"rgba(13,35,54,.55)",surface2:"rgba(8,24,38,.4)",text:"#fffdf8",muted:"#b9c9d6",accent:"#5fd0c2",accent2:"#7ad6e8",gold:"#f3bf55",line:"rgba(185,242,223,.16)",hero:"rgba(6,19,32,.78)"} },
  ember:{ name:"Ember", vars:{bg:"#1a0f0a",bg2:"#2a160e",surface:"rgba(58,28,16,.55)",surface2:"rgba(40,20,12,.4)",text:"#fff3ea",muted:"#d8b39a",accent:"#f3bf55",accent2:"#f47c64",gold:"#ffd27a",line:"rgba(255,210,122,.18)",hero:"rgba(26,15,10,.8)"} },
  verdant:{ name:"Verdant", vars:{bg:"#08160e",bg2:"#0f2417",surface:"rgba(18,42,28,.55)",surface2:"rgba(12,30,20,.4)",text:"#eef7ef",muted:"#a9cbb2",accent:"#7bd88a",accent2:"#c9f27a",gold:"#e6d066",line:"rgba(169,203,178,.16)",hero:"rgba(8,22,14,.8)"} },
  noir:{ name:"Noir", vars:{bg:"#0a0a0c",bg2:"#15151a",surface:"rgba(28,28,34,.6)",surface2:"rgba(20,20,24,.45)",text:"#f2f2f5",muted:"#9aa0aa",accent:"#d9d9e0",accent2:"#8fa0b8",gold:"#cbb88a",line:"rgba(255,255,255,.1)",hero:"rgba(10,10,12,.82)"} },
  bloom:{ name:"Bloom", vars:{bg:"#f7efe7",bg2:"#efe3d6",surface:"#ffffff",surface2:"#fbf4ec",text:"#2a2230",muted:"#6b6072",accent:"#b76a8a",accent2:"#d98aa0",gold:"#b5832a",line:"rgba(42,34,48,.12)",hero:"rgba(247,239,231,.55)"} },
  royal:{ name:"Royal", vars:{bg:"#120a24",bg2:"#1d1140",surface:"rgba(34,22,62,.6)",surface2:"rgba(24,15,46,.45)",text:"#f1ecff",muted:"#b3a6d8",accent:"#b794f6",accent2:"#7ad6e8",gold:"#f3bf55",line:"rgba(183,148,246,.18)",hero:"rgba(18,10,36,.8)"} },
};

function defaultProject(name){
  name=name||"My funnel";
  return {
    id:uid(), name, updatedAt:Date.now(), themeId:"abyss", customAccent:"",
    brand:{ name:"Calypso Star" },
    offer:{ eyebrow:"Tarot of the Sea · 78 cards", title:"Calypso Star",
      subtitle:"A dark-fantasy oceanic tarot, channeled from the deep. The old archetypes retold in tides, reefs, currents, and shore.",
      ctaPrimary:"Draw my free reading", ctaSecondary:"See the deck",
      trustLine:"Joined by 2,400+ deep-water readers · free, no card required", heroImage:"" },
    perks:[
      {icon:"spark",title:"A free 3-card reading",text:"Draw from the ocean the moment you arrive. Past, present, threshold."},
      {icon:"star",title:"Members-only pricing",text:"Lock the launch deck at early-bird rates before the public opens."},
      {icon:"book",title:"Behind-the-tides letters",text:"Field notes from the studio: the art process and the card lore."},
      {icon:"gift",title:"The First Tide sample",text:"A free downloadable sample card and mini-guidebook excerpt."}
    ],
    leadMagnet:{ eyebrow:"Your free reading", title:"Let the tide answer in three voices.",
      lede:"Three cards wait face-down in the deep. Past. Present. Threshold. Reveal them and hear what the ocean has been trying to say.",
      cta:"Reveal my reading", note:"Free. Takes 20 seconds. We send your reading + sample to your inbox.",
      intents:["Love & bonds","Work & path","Clarity","Shadow work"],
      cards:[
        {title:"Past",text:"What was built on sand is falling. Let it fall — the ground beneath it is the true one."},
        {title:"Present",text:"Everything is changing, even where the water looks still. Trust the undertow."},
        {title:"Threshold",text:"There is more for you, and you are ready for it."}
      ],
      downloadLabel:"Download my sample card", downloadHref:"", upsellLabel:"See members-only pricing", upsellHref:"#tiers" },
    showcase:{ eyebrow:"The deck", title:"Twenty-one tides are already awake.", lede:"Hand-illustrated in the locked oceanic style.", images:[] },
    proof:{ eyebrow:"From the current", title:"Readers already in the deep.",
      stats:[{value:"2,400+",label:"First Tide readers"},{value:"4.9",label:"avg deck rating"},{value:"78",label:"cards illustrated"},{value:"$40K",label:"launch target"}],
      quotes:[
        {text:"The cards read like the sea actually answered me.",name:"Marisol R.",location:"Brooklyn, NY"},
        {text:"I came for the art and stayed for the readings.",name:"Devon K.",location:"Portland, OR"},
        {text:"Dark, gorgeous, and weirdly accurate.",name:"Priya N.",location:"Austin, TX"}
      ] },
    tiers:[
      {name:"Digital",price:"$12",strike:"$15",sub:"Early-bird",features:["Print-your-own PDF deck","Digital guidebook","Members-only updates"],featured:false,cta:"Claim this tier"},
      {name:"Deck + Book",price:"$49",strike:"$60",sub:"Early-bird",features:["78-card linen deck","Softcover guidebook","PDF + reading journal","First Tide sample"],featured:true,cta:"Claim this tier"},
      {name:"Keeper",price:"$89",strike:"$99",sub:"Early-bird",features:["Deck + hardcover book","Linen pouch","Numbered art print","Name in the guidebook"],featured:false,cta:"Claim this tier"}
    ],
    faq:[
      {q:"Is the free reading really free?",a:"Yes. No card, no trial. You give an email so we can send your reading and the sample card."},
      {q:"When does the deck launch?",a:"First Tide readers get the launch date, early-bird pricing, and first access 48 hours before the public."},
      {q:"Can I unsubscribe?",a:"Anytime, one click. We send quiet transmissions — not a firehose."}
    ],
    final:{ eyebrow:"The first tide is forming", title:"Claim your spot before the deck surfaces.",
      lede:"Free reading, members-only pricing, and the sample card — all yours the moment you join.",
      bgImage:"", launchDate:"2026-09-21", note:"Free · No spam · Unsubscribe anytime", cta:"Join the First Tide" },
    footer:"© 2026 Calypso Star. All rights reserved."
  };
}

let state = { projects:[], activeId:null };
function loadState(){ try{ state = JSON.parse(localStorage.getItem("funnel_suite_state"))||state; }catch(e){} if(!state.projects.length){ const p=defaultProject(); state.projects=[p]; state.activeId=p.id; saveState(); } }
function saveState(){ localStorage.setItem("funnel_suite_state", JSON.stringify(state)); }
function active(){ return state.projects.find(p=>p.id===state.activeId)||state.projects[0]; }
function setActive(id){ state.activeId=id; saveState(); renderAll(); }
let saveTimer=null;
function markDirty(){ const s=$("#save-status"); s.textContent="Saving…"; s.className="save-status saving"; clearTimeout(saveTimer); saveTimer=setTimeout(()=>{ saveState(); s.textContent="Saved"; s.className="save-status"; },400); }
function collectAssetIds(p){ const ids=new Set(); const scan=v=>{ if(typeof v==="string"&&v.startsWith("asset:")) ids.add(v.slice(6)); else if(Array.isArray(v)) v.forEach(scan); }; scan(p.offer.heroImage); scan(p.showcase.images); scan(p.final.bgImage); return [...ids]; }
async function buildAssetMap(p){ const map={}; for(const id of collectAssetIds(p)){ const a=await DB.get(id); if(a) map[id]=a.dataUrl; } return map; }
function resolveImg(ref, map){ if(!ref) return ""; if(typeof ref==="string"&&ref.startsWith("asset:")) return map[ref.slice(6)]||""; return ref; }
async function inlineUrl(src){ if(!src||src.startsWith("data:")||src.startsWith("asset:")) return src; try{ const r=await fetch(src); const b=await r.blob(); return await new Promise(res=>{ const fr=new FileReader(); fr.onload=()=>res(fr.result); fr.readAsDataURL(b); }); }catch(e){ return src; } }

const FUNNEL_CSS = `
:root{--bg:#06131f;--bg2:#0a1b2a;--surface:rgba(13,35,54,.55);--surface2:rgba(8,24,38,.4);--text:#fffdf8;--muted:#b9c9d6;--accent:#5fd0c2;--accent2:#7ad6e8;--gold:#f3bf55;--line:rgba(185,242,223,.16);--hero:rgba(6,19,32,.78);--radius:14px;--max:1180px;--head:'Cinzel',Georgia,serif;--body:'Nunito','Inter',system-ui,sans-serif}
*{box-sizing:border-box}html{scroll-behavior:smooth}
body{margin:0;min-height:100vh;color:var(--text);font-family:var(--body);line-height:1.6;overflow-x:hidden;background:linear-gradient(180deg,var(--bg),var(--bg2))}
body::before{content:"";position:fixed;inset:0;z-index:-2;pointer-events:none;background:radial-gradient(60% 50% at 18% 8%,color-mix(in srgb,var(--accent) 22%,transparent),transparent 60%),radial-gradient(50% 45% at 86% 22%,color-mix(in srgb,var(--accent2) 18%,transparent),transparent 60%)}
a{color:inherit;text-decoration:none}button{font:inherit;cursor:pointer}img{display:block;max-width:100%}
h1,h2,h3{font-family:var(--head);letter-spacing:.01em}
.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
.sea-canvas{position:fixed;inset:0;z-index:0;width:100%;height:100%;pointer-events:none;opacity:.5}
section{position:relative;z-index:2;padding:clamp(64px,9vw,120px) 0}
.head{width:min(100% - 48px,var(--max));margin:0 auto clamp(36px,5vw,60px);text-align:center}
.eyebrow{text-transform:uppercase;letter-spacing:.3em;font-size:.72rem;font-weight:800;color:var(--accent);margin:0 0 14px}
.head h2{font-size:clamp(1.9rem,4.4vw,3.1rem);line-height:1.12;margin:0 0 16px;font-weight:700}
.lede{max-width:60ch;margin:0 auto;color:var(--muted);font-size:1.06rem}
.reveal{opacity:0;transform:translateY(26px);transition:opacity .8s cubic-bezier(.2,.7,.2,1),transform .8s cubic-bezier(.2,.7,.2,1)}
.reveal.in{opacity:1;transform:none}
header.bar{position:fixed;top:0;left:50%;transform:translateX(-50%);width:min(100% - 24px,var(--max));z-index:40;display:flex;align-items:center;justify-content:space-between;gap:18px;padding:14px 18px;margin-top:14px;border:1px solid var(--line);border-radius:999px;background:color-mix(in srgb,var(--bg) 70%,transparent);backdrop-filter:blur(14px);box-shadow:0 10px 40px rgba(0,0,0,.3)}
.bar .brand{font-family:var(--head);color:var(--gold);font-weight:800;font-size:1.05rem}
.bar nav{display:flex;gap:22px;font-size:.9rem;font-weight:700;color:var(--muted)}
.bar nav a:hover{color:var(--accent)}
.btn-ghost{border:1px solid var(--accent);color:var(--accent);background:color-mix(in srgb,var(--accent) 10%,transparent);padding:9px 18px;border-radius:999px;font-weight:800}
.btn-ghost:hover{background:color-mix(in srgb,var(--accent) 20%,transparent)}
.pcta{display:inline-flex;align-items:center;justify-content:center;gap:10px;font-weight:900;color:var(--bg);background:linear-gradient(120deg,var(--accent),var(--accent2));padding:15px 30px;border:none;border-radius:999px;font-size:1rem;box-shadow:0 14px 34px color-mix(in srgb,var(--accent) 35%,transparent);transition:transform .15s,box-shadow .25s}
.pcta:hover{transform:translateY(-2px)}.pcta.full{width:100%}
.scta{display:inline-flex;align-items:center;justify-content:center;gap:10px;font-weight:800;color:var(--text);border:1px solid var(--line);background:color-mix(in srgb,#fff 4%,transparent);padding:14px 28px;border-radius:999px;font-size:1rem}
.scta:hover{border-color:var(--accent);background:color-mix(in srgb,#fff 10%,transparent)}.scta.full{width:100%}
.hero{min-height:100svh;display:flex;align-items:center;text-align:center;padding-top:120px;overflow:hidden}
.hero-bg{position:absolute;inset:0;background-size:cover;background-position:center;transform:scale(1.06)}
.hero-veil{position:absolute;inset:0;background:radial-gradient(70% 60% at 50% 35%,color-mix(in srgb,var(--bg) 15%,transparent),var(--hero) 72%),linear-gradient(180deg,color-mix(in srgb,var(--bg) 55%,transparent),transparent 30%,var(--bg))}
.hero-grad{position:absolute;inset:0;background:radial-gradient(80% 70% at 50% 30%,color-mix(in srgb,var(--accent) 18%,transparent),var(--bg) 70%)}
.hero-inner{position:relative;z-index:2;width:min(100% - 48px,820px);margin:0 auto}
.hero .eyebrow{color:var(--gold)}
.hero h1{font-size:clamp(3rem,10vw,6.6rem);line-height:.98;margin:.1em 0 .25em;font-weight:800;background:linear-gradient(120deg,var(--text),var(--gold) 70%,var(--accent2));-webkit-background-clip:text;background-clip:text;color:transparent}
.hero-sub{font-size:clamp(1.05rem,2.4vw,1.35rem);color:var(--muted);max-width:52ch;margin:0 auto 34px}
.hero-cta{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin-bottom:26px}
.trust{font-size:.86rem;color:var(--muted);font-weight:700}
.perks-grid{list-style:none;margin:0;padding:0;width:min(100% - 48px,var(--max));margin-inline:auto;display:grid;grid-template-columns:repeat(4,1fr);gap:18px}
.perk{border:1px solid var(--line);border-radius:var(--radius);padding:28px 24px;background:linear-gradient(160deg,var(--surface),var(--surface2));transition:transform .25s,border-color .25s}
.perk:hover{transform:translateY(-6px);border-color:color-mix(in srgb,var(--accent) 40%,transparent)}
.perk-ico{display:grid;place-items:center;width:50px;height:50px;border-radius:14px;margin-bottom:18px;color:var(--bg);background:linear-gradient(135deg,var(--accent),var(--accent2))}
.perk-ico svg{width:26px;height:26px}
.perk h3{font-size:1.18rem;margin:0 0 10px}.perk p{margin:0;color:var(--muted);font-size:.96rem}
.freebie{background:linear-gradient(180deg,transparent,var(--surface2),transparent)}
.stage{display:flex;justify-content:center;align-items:flex-end;gap:clamp(14px,4vw,48px);flex-wrap:wrap;margin-bottom:40px}
.rcard{display:flex;flex-direction:column;align-items:center;gap:14px;max-width:230px;transform:translateY(var(--lift,0))}
.rc-btn{padding:0;border:none;background:none}
.r-in{position:relative;width:170px;height:262px;perspective:900px;display:block;transform-style:preserve-3d;transition:transform 1s cubic-bezier(.2,.8,.2,1)}
.r-face{position:absolute;inset:0;width:100%;height:100%;border-radius:12px;backface-visibility:hidden;box-shadow:0 18px 44px rgba(0,0,0,.45),0 0 0 1px var(--line);display:grid;place-items:center;text-align:center;padding:22px}
.r-back{background:radial-gradient(circle at 50% 30%,color-mix(in srgb,var(--accent) 22%,transparent),transparent 60%),repeating-linear-gradient(45deg,color-mix(in srgb,var(--bg) 60%,transparent),color-mix(in srgb,var(--bg) 60%,transparent) 10px,color-mix(in srgb,var(--accent) 8%,transparent) 10px,color-mix(in srgb,var(--accent) 8%,transparent) 20px);color:var(--gold)}
.r-back .bk{font-family:var(--head);font-size:1rem;opacity:.8}
.r-front{transform:rotateY(180deg);background:linear-gradient(160deg,var(--surface),var(--surface2));color:var(--text);border:1px solid var(--line)}
.r-front .ft-ico{color:var(--accent);margin-bottom:10px}.r-front .ft-ico svg{width:30px;height:30px}
.r-front h4{margin:0 0 8px;font-size:1.1rem;color:var(--gold)}.r-front p{margin:0;font-size:.84rem;color:var(--muted);line-height:1.45}
.rcard.flipped .r-in{transform:rotateY(180deg)}
.r-label{text-transform:uppercase;letter-spacing:.26em;font-size:.7rem;color:var(--accent);font-weight:800;margin:0}
.freebie-cta{text-align:center}.freebie-note{font-size:.84rem;color:var(--muted);margin:14px 0 0}
.show-grid{width:min(100% - 48px,var(--max));margin-inline:auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:16px}
.show-card{border-radius:12px;overflow:hidden;border:1px solid var(--line);aspect-ratio:170/262;box-shadow:0 14px 34px rgba(0,0,0,.4);transition:transform .3s}
.show-card:hover{transform:translateY(-6px) scale(1.01)}.show-card img{width:100%;height:100%;object-fit:cover}
.pstats{width:min(100% - 48px,var(--max));margin:0 auto 40px;display:grid;grid-template-columns:repeat(4,1fr);gap:18px;text-align:center}
.pstats div{border:1px solid var(--line);border-radius:var(--radius);padding:24px 12px;background:var(--surface2)}
.pstats b{display:block;font-family:var(--head);font-size:clamp(1.6rem,4vw,2.4rem);color:var(--gold)}.pstats span{font-size:.82rem;color:var(--muted)}
.quotes{width:min(100% - 48px,var(--max));margin-inline:auto;display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.quote{margin:0;border:1px solid var(--line);border-radius:var(--radius);padding:26px 24px;background:linear-gradient(160deg,var(--surface),var(--surface2))}
.quote blockquote{margin:0 0 16px;font-size:1.05rem;color:var(--text);font-style:italic;line-height:1.55}
.quote figcaption{display:flex;align-items:center;gap:12px;font-weight:800;font-size:.9rem}
.quote .av{display:grid;place-items:center;width:36px;height:36px;border-radius:999px;flex:0 0 auto;background:linear-gradient(135deg,var(--accent2),var(--gold));color:var(--bg);font-family:var(--head)}
.tier-grid{width:min(100% - 48px,var(--max));margin-inline:auto;display:grid;grid-template-columns:repeat(3,1fr);gap:20px;align-items:stretch}
.tier{position:relative;border:1px solid var(--line);border-radius:18px;padding:30px 26px;background:linear-gradient(165deg,var(--surface),var(--surface2));display:flex;flex-direction:column}
.tier.feat{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent),0 26px 60px color-mix(in srgb,var(--accent) 22%,transparent);transform:scale(1.03)}
.tier-badge{position:absolute;top:-13px;left:50%;transform:translateX(-50%);background:linear-gradient(120deg,var(--accent),var(--accent2));color:var(--bg);font-weight:900;font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;padding:6px 14px;border-radius:999px;white-space:nowrap}
.tier h3{font-size:1.4rem;margin:0 0 8px}
.tier-price{margin:0 0 4px;display:flex;align-items:baseline;gap:10px}
.tier-price .strike{color:var(--muted);text-decoration:line-through;font-size:1rem}
.tier-price b{font-family:var(--head);font-size:2.1rem;color:var(--gold)}
.tier-sub{margin:0 0 18px;font-size:.82rem;color:var(--accent);font-weight:800}
.tier ul{list-style:none;margin:0 0 24px;padding:0;display:grid;gap:10px}
.tier li{position:relative;padding-left:28px;color:var(--muted);font-size:.95rem}
.tier li::before{content:"";position:absolute;left:0;top:.5em;width:14px;height:14px;border-radius:999px;background:radial-gradient(circle at 35% 30%,var(--accent),var(--accent2))}
.tier-cta{margin-top:auto;border:1px solid var(--accent);background:color-mix(in srgb,var(--accent) 8%,transparent);color:var(--accent);padding:13px;border-radius:999px;font-weight:800}
.tier.feat .tier-cta{background:linear-gradient(120deg,var(--accent),var(--accent2));color:var(--bg);border:none}
.faq-list{width:min(100% - 48px,760px);margin-inline:auto;display:grid;gap:12px}
.faq-item{border:1px solid var(--line);border-radius:var(--radius);background:var(--surface2);overflow:hidden}
.faq-item summary{cursor:pointer;list-style:none;padding:20px 24px;font-weight:800;display:flex;justify-content:space-between;align-items:center;gap:14px}
.faq-item summary::-webkit-details-marker{display:none}
.faq-item summary::after{content:"+";font-size:1.4rem;color:var(--accent);transition:transform .3s}
.faq-item[open] summary::after{transform:rotate(45deg)}
.faq-item p{margin:0;padding:0 24px 22px;color:var(--muted)}
.final{position:relative;overflow:hidden;text-align:center}
.final-bg{position:absolute;inset:0;background-size:cover;background-position:center;filter:blur(2px) brightness(.7)}
.final-veil{position:absolute;inset:0;background:radial-gradient(70% 70% at 50% 50%,color-mix(in srgb,var(--bg) 40%,transparent),var(--bg))}
.final-inner{position:relative;z-index:2;width:min(100% - 48px,680px);margin:0 auto}
.final .eyebrow{color:var(--accent2)}
.final-inner h2{font-size:clamp(2rem,5vw,3.2rem);margin:0 0 14px}
.final-lede{color:var(--muted);margin:0 auto 28px;max-width:48ch}
.countdown{display:flex;justify-content:center;gap:14px;margin-bottom:30px}
.countdown div{min-width:74px;border:1px solid var(--line);border-radius:14px;padding:14px 8px;background:var(--surface2)}
.countdown b{display:block;font-family:var(--head);font-size:clamp(1.6rem,5vw,2.4rem);color:var(--gold);line-height:1}
.countdown span{font-size:.7rem;text-transform:uppercase;letter-spacing:.2em;color:var(--muted)}
.inline-capture{display:flex;gap:12px;justify-content:center;max-width:480px;margin:0 auto;flex-wrap:wrap}
.inline-capture input{flex:1;min-width:200px;background:color-mix(in srgb,#fff 6%,transparent);border:1px solid var(--line);color:var(--text);padding:15px 20px;border-radius:999px;font-size:1rem;outline:none}
.inline-capture input:focus{border-color:var(--accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 18%,transparent)}
.final-note{margin-top:14px;font-size:.82rem;color:var(--muted)}.final-note.ok{color:var(--accent);font-weight:800}
.site-footer{position:relative;z-index:2;border-top:1px solid var(--line);padding:34px 0;text-align:center;color:var(--muted);font-size:.85rem;background:color-mix(in srgb,var(--bg) 70%,transparent)}
.hp{position:absolute!important;left:-10000px!important;width:1px!important;height:1px!important;opacity:0!important}
.modal{position:fixed;inset:0;z-index:80;display:grid;place-items:center;padding:20px}.modal[hidden]{display:none}
.scrim{position:absolute;inset:0;background:rgba(0,0,0,.6);backdrop-filter:blur(8px);animation:fade .35s}
.mcard{position:relative;z-index:2;width:min(100%,440px);max-height:92svh;overflow:auto;border:1px solid var(--line);border-radius:22px;padding:34px 30px 30px;background:linear-gradient(170deg,var(--surface),var(--bg));box-shadow:0 30px 80px rgba(0,0,0,.6);animation:rise .4s}
@keyframes fade{from{opacity:0}to{opacity:1}}@keyframes rise{from{opacity:0;transform:translateY(24px) scale(.97)}to{opacity:1;transform:none}}
.mclose{position:absolute;top:14px;right:14px;width:38px;height:38px;border-radius:999px;border:1px solid var(--line);background:color-mix(in srgb,#fff 6%,transparent);color:var(--text);display:grid;place-items:center}
.mclose svg{width:18px;height:18px}
.mprogress{display:flex;gap:8px;justify-content:center;margin:8px 0 22px}
.mprogress span{width:28px;height:4px;border-radius:4px;background:color-mix(in srgb,#fff 16%,transparent);transition:background .3s}
.mprogress span.active{background:linear-gradient(90deg,var(--accent),var(--accent2))}
.mstep .eyebrow{margin-bottom:8px}
.mtitle{font-family:var(--head);font-size:1.55rem;margin:0 0 10px;line-height:1.18}
.msub{color:var(--muted);margin:0 0 22px;font-size:.96rem}
.mform{display:grid;gap:16px}.mform label.field{display:block}
.flabel{display:block;font-weight:800;font-size:.84rem;color:var(--text);margin-bottom:8px}.flabel em{color:var(--muted);font-style:normal;font-weight:600}
.mform input[type=text],.mform input[type=email]{width:100%;background:color-mix(in srgb,#fff 6%,transparent);border:1px solid var(--line);color:var(--text);padding:13px 16px;border-radius:12px;font-size:1rem;outline:none}
.mform input:focus{border-color:var(--accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 16%,transparent)}
.chip-row{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
.chip{position:relative;cursor:pointer}.chip input{position:absolute;opacity:0;inset:0}
.chip span{display:block;text-align:center;padding:12px;border:1px solid var(--line);border-radius:12px;color:var(--muted);font-weight:800;font-size:.9rem;transition:all .2s}
.chip input:checked+span{border-color:var(--accent);background:color-mix(in srgb,var(--accent) 14%,transparent);color:var(--text)}
.consent{display:flex;gap:11px;align-items:flex-start;font-size:.84rem;color:var(--muted)}
.consent input{margin-top:3px;accent-color:var(--accent);width:18px;height:18px;flex:0 0 auto}
.mfine{text-align:center;font-size:.78rem;color:var(--muted);margin:16px 0 0}
.reveal-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:6px 0 22px}
.reveal-cards figure{margin:0;text-align:center;border:1px solid var(--line);border-radius:10px;padding:12px 8px;background:var(--surface2)}
.reveal-cards h4{margin:0 0 6px;color:var(--gold);font-family:var(--head);font-size:.92rem}
.reveal-cards p{font-size:.74rem;color:var(--muted);margin:0;line-height:1.4}
.reveal-actions{display:grid;gap:10px}
@media(max-width:900px){.perks-grid{grid-template-columns:repeat(2,1fr)}.quotes{grid-template-columns:1fr}.pstats{grid-template-columns:repeat(2,1fr)}.tier-grid{grid-template-columns:1fr;max-width:420px;margin-inline:auto}.tier.feat{transform:none}}
@media(max-width:720px){.bar nav{display:none}.rcard{--lift:0!important}.show-grid{grid-template-columns:repeat(auto-fill,minmax(120px,1fr))}}
@media(max-width:560px){.perks-grid{grid-template-columns:1fr}.countdown div{min-width:60px;padding:12px 4px}.inline-capture{flex-direction:column}.inline-capture .pcta{width:100%}}
`;
const FUNNEL_JS = [
"var P=PROJECT;",
"function Q(s,r){return (r||document).querySelector(s)}",
"function QA(s,r){return [].slice.call((r||document).querySelectorAll(s))}",
"function esc(s){return String(s==null?'':s).replace(/[&<>\"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;','\\'':'&#39;'}[c]})}",
"(function(){var g=Q('#showcase-grid');if(!g||!P.showcase||!P.showcase.images||!P.showcase.images.length){return;}g.innerHTML=P.showcase.images.map(function(src){return '<figure class=\"show-card reveal\"><img src=\"'+src+'\" alt=\"\"/></figure>'}).join('');})();",
"(function(){var cards=P.leadMagnet.cards||[];QA('.rcard').forEach(function(c,i){var cd=cards[i];if(!cd)return;var f=c.querySelector('.r-front');f.querySelector('.ft-title').textContent=cd.title;f.querySelector('.ft-text').textContent=cd.text;});})();",
"(function(){var host=Q('#intent-host');if(!host)return;host.innerHTML=(P.leadMagnet.intents||[]).map(function(t,i){return '<label class=\"chip\"><input type=\"radio\" name=\"intent\" value=\"'+esc(t)+'\" '+(i===0?'required':'')+'><span>'+esc(t)+'</span></label>'}).join('');})();",
"var modal=Q('#modal'),step=0,lastFocus=null,pendingTier=null;",
"function showStep(s){step=s;QA('.mstep',modal).forEach(function(el){el.hidden=+el.getAttribute('data-step')!==s;});QA('.mprogress span',modal).forEach(function(d,i){d.className=(i<=s)?'active':'';});}",
"function openModal(s){s=s||0;lastFocus=document.activeElement;showStep(s);modal.hidden=false;document.body.style.overflow='hidden';requestAnimationFrame(function(){var st=modal.querySelector('[data-step=\"'+s+'\"]');var f=st&&st.querySelector('input:not(.hp),button:not(.mclose)');(f||modal.querySelector('.mclose')).focus();});}",
"function closeModal(){modal.hidden=true;document.body.style.overflow='';if(lastFocus&&lastFocus.focus)lastFocus.focus();}",
"QA('[data-open-modal]').forEach(function(b){b.addEventListener('click',function(){var t=b.closest('.tier');pendingTier=t?(t.querySelector('h3')||{}).textContent:null;openModal(0);});});",
"QA('[data-close-modal]',modal).forEach(function(el){el.addEventListener('click',closeModal);});",
"document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!modal.hidden)closeModal();if(e.key==='Tab'&&!modal.hidden){var f=QA('input:not(.hp),button,a[href]',modal).filter(function(el){return !el.disabled&&el.offsetParent!==null&&el.getClientRects().length&&!el.closest('[hidden]')});if(!f.length)return;var first=f[0],last=f[f.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});",
"Q('[data-form=\"0\"]',modal).addEventListener('submit',function(e){e.preventDefault();var hp=this.querySelector('[name=website]');if(hp&&hp.value)return;var name=this.querySelector('[name=name]').value.trim();var ch=this.querySelector('[name=intent]:checked');if(!ch){this.querySelector('[name=intent]').focus();this.reportValidity();return;}P._name=name;P._intent=ch.value;showStep(1);requestAnimationFrame(function(){var i=modal.querySelector('[data-step=\"1\"] input:not(.hp)');if(i)i.focus();});});",
"Q('[data-form=\"1\"]',modal).addEventListener('submit',function(e){e.preventDefault();var hp=this.querySelector('[name=website]');if(hp&&hp.value)return;var email=this.querySelector('[name=email]').value.trim();var con=this.querySelector('[name=consent]').checked;if(!this.checkValidity()||!con){this.reportValidity();return;}flipCards();buildReveal();showStep(2);requestAnimationFrame(function(){var d=Q('#dl-link');if(d)d.focus();});});",
"function flipCards(){QA('.rcard').forEach(function(c,i){c.className='rcard';setTimeout(function(){c.className='rcard flipped';},i*220);});}",
"function buildReveal(){var host=Q('#reveal-cards');var cards=P.leadMagnet.cards||[];host.innerHTML=cards.map(function(c){return '<figure><h4>'+esc(c.title)+'</h4><p>'+esc(c.text)+'</p></figure>'}).join('');var dl=Q('#dl-link');if(P.leadMagnet.downloadHref){dl.href=P.leadMagnet.downloadHref;}}",
"var ic=Q('#inline-capture');if(ic)ic.addEventListener('submit',function(e){e.preventDefault();var hp=this.querySelector('[name=website]');if(hp&&hp.value)return;var email=Q('#inline-email').value.trim();if(!email||!/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(email)){Q('#inline-email').focus();Q('#inline-email').reportValidity();return;}var note=Q('#inline-note');note.textContent='You are in. Check your inbox.';note.className='final-note ok';var b=ic.querySelector('button');b.textContent='You are in';b.disabled=true;ic.querySelector('input').disabled=true;});",
"(function(){var launch=new Date(P.final.launchDate+'T09:00:00');if(isNaN(launch))return;function set(k,v){var el=Q('[data-cd='+k+']');if(el)el.textContent=String(v).padStart(2,'0');}function tick(){var diff=Math.max(0,launch-new Date());var d=Math.floor(diff/86400000);diff-=d*86400000;var h=Math.floor(diff/3600000);diff-=h*3600000;var m=Math.floor(diff/60000);diff-=m*60000;var s=Math.floor(diff/1000);set('d',d);set('h',h);set('m',m);set('s',s);}tick();setInterval(tick,1000);})();",
"var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.className+=' in';io.unobserve(en.target);}});},{threshold:0.12});QA('.reveal').forEach(function(el){io.observe(el);});",
"(function(){var c=Q('.sea-canvas');if(!c||matchMedia('(prefers-reduced-motion: reduce)').matches)return;var x=c.getContext('2d'),w,h,t=0;function r(){w=c.width=innerWidth;h=c.height=innerHeight;c.style.width=innerWidth+'px';c.style.height=innerHeight+'px';}r();onresize=r;var b=[];for(var i=0;i<6;i++)b.push({x:Math.random(),y:Math.random(),r:.18+Math.random()*.22,h:Math.random()>.5?'95,208,194':'244,124,100',s:.0002+Math.random()*.0004});function f(){t++;x.clearRect(0,0,w,h);b.forEach(function(n,i){var px=(n.x+Math.sin(t*n.s+i)*.06)*w,py=(n.y+Math.cos(t*n.s*1.3+i)*.05)*h,rad=n.r*Math.min(w,h),g=x.createRadialGradient(px,py,0,px,py,rad);g.addColorStop(0,'rgba('+n.h+',0.08)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.beginPath();x.arc(px,py,rad,0,7);x.fill();});requestAnimationFrame(f);}f();})();"
].join("\n");
function funnelBody(P, R){
  const hero = P.offer.heroImage ? '<div class="hero-bg" style="background-image:url(\''+resolveImg(P.offer.heroImage,R)+'\')"></div>' : '<div class="hero-grad"></div>';
  const perks = P.perks.map(function(p){return '<li class="perk reveal"><span class="perk-ico">'+(ICONS[p.icon]||ICONS.spark)+'</span><h3>'+esc(p.title)+'</h3><p>'+esc(p.text)+'</p></li>';}).join("");
  const labels=["Past","Present","Threshold"];
  const cards = P.leadMagnet.cards.map(function(c,i){var lift=i===1?-26:-6;return '<article class="rcard reveal" style="--lift:'+lift+'px"><button class="rc-btn" type="button"><span class="r-in"><span class="r-face r-back"><span class="bk">'+esc(P.brand.name||'')+'</span></span><span class="r-face r-front"><span class="ft-ico">'+ICONS.wave+'</span><h4 class="ft-title">'+esc(c.title)+'</h4><p class="ft-text">'+esc(c.text)+'</p></span></span></button><p class="r-label">'+esc(labels[i]||('Card '+(i+1)))+'</p></article>';}).join("");
  const showcase = '<div class="show-grid" id="showcase-grid"></div>';
  const stats = P.proof.stats.map(function(s){return '<div><b>'+esc(s.value)+'</b><span>'+esc(s.label)+'</span></div>';}).join("");
  const quotes = P.proof.quotes.map(function(q){return '<figure class="quote reveal"><blockquote>'+esc(q.text)+'</blockquote><figcaption><span class="av">'+esc((q.name||'?').charAt(0))+'</span>'+esc(q.name)+(q.location?' · '+esc(q.location):'')+'</figcaption></figure>';}).join("");
  const tiers = P.tiers.map(function(t){return '<article class="tier reveal'+(t.featured?' feat':'')+'">'+(t.featured?'<span class="tier-badge">Most popular</span>':'')+'<h3>'+esc(t.name)+'</h3><p class="tier-price">'+(t.strike?'<span class="strike">'+esc(t.strike)+'</span>':'')+'<b>'+esc(t.price)+'</b></p><p class="tier-sub">'+esc(t.sub||'')+'</p><ul>'+(t.features||[]).map(function(f){return '<li>'+esc(f)+'</li>';}).join("")+'</ul><button class="tier-cta" type="button" data-open-modal>'+esc(t.cta||'Claim this tier')+'</button></article>';}).join("");
  const faq = P.faq.map(function(f){return '<details class="faq-item reveal"><summary>'+esc(f.q)+'</summary><p>'+esc(f.a)+'</p></details>';}).join("");
  const finalBg = P.final.bgImage ? '<div class="final-bg" style="background-image:url(\''+resolveImg(P.final.bgImage,R)+'\')"></div>' : '';
  return ''
  + '<canvas class="sea-canvas" aria-hidden="true"></canvas>'
  + '<header class="bar"><span class="brand">'+esc(P.brand.name||'')+'</span><nav><a href="#perks">Perks</a><a href="#freebie">Free</a><a href="#tiers">Pricing</a><a href="#faq">FAQ</a></nav><button class="btn-ghost" type="button" data-open-modal>'+esc(P.offer.ctaPrimary)+'</button></header>'
  + '<section class="hero" id="top"><div class="hero-veil"></div>'+hero+'<div class="hero-inner reveal"><p class="eyebrow">'+esc(P.offer.eyebrow)+'</p><h1>'+esc(P.offer.title)+'</h1><p class="hero-sub">'+esc(P.offer.subtitle)+'</p><div class="hero-cta"><button class="pcta" type="button" data-open-modal>'+esc(P.offer.ctaPrimary)+'</button><a class="scta" href="#showcase">'+esc(P.offer.ctaSecondary)+'</a></div><p class="trust">'+esc(P.offer.trustLine)+'</p></div></section>'
  + '<section id="perks"><div class="head reveal"><p class="eyebrow">Why join</p><h2>Four reasons to wade in now.</h2></div><ul class="perks-grid">'+perks+'</ul></section>'
  + '<section class="freebie" id="freebie"><div class="head reveal"><p class="eyebrow">'+esc(P.leadMagnet.eyebrow)+'</p><h2>'+esc(P.leadMagnet.title)+'</h2><p class="lede">'+esc(P.leadMagnet.lede)+'</p></div><div class="stage reveal">'+cards+'</div><div class="freebie-cta reveal"><button class="pcta" type="button" data-open-modal>'+esc(P.leadMagnet.cta)+'</button><p class="freebie-note">'+esc(P.leadMagnet.note)+'</p></div></section>'
  + '<section id="showcase"><div class="head reveal"><p class="eyebrow">'+esc(P.showcase.eyebrow)+'</p><h2>'+esc(P.showcase.title)+'</h2><p class="lede">'+esc(P.showcase.lede)+'</p></div>'+showcase+'</section>'
  + '<section id="proof"><div class="head reveal"><p class="eyebrow">'+esc(P.proof.eyebrow)+'</p><h2>'+esc(P.proof.title)+'</h2></div><div class="pstats reveal">'+stats+'</div><div class="quotes">'+quotes+'</div></section>'
  + '<section id="tiers"><div class="head reveal"><p class="eyebrow">Pre-order</p><h2>Choose your depth.</h2><p class="lede">First subscribers get early-bird rates the moment it launches.</p></div><div class="tier-grid">'+tiers+'</div></section>'
  + '<section id="faq"><div class="head reveal"><p class="eyebrow">FAQ</p><h2>Questions from the shore.</h2></div><div class="faq-list">'+faq+'</div></section>'
  + '<section class="final" id="claim">'+finalBg+'<div class="final-veil"></div><div class="final-inner reveal"><p class="eyebrow">'+esc(P.final.eyebrow)+'</p><h2>'+esc(P.final.title)+'</h2><p class="final-lede">'+esc(P.final.lede)+'</p><div class="countdown"><div><b data-cd="d">--</b><span>days</span></div><div><b data-cd="h">--</b><span>hrs</span></div><div><b data-cd="m">--</b><span>min</span></div><div><b data-cd="s">--</b><span>sec</span></div></div><form class="inline-capture" id="inline-capture" novalidate><input type="text" name="website" class="hp" tabindex="-1" aria-hidden="true"/><label class="sr-only" for="inline-email">Email</label><input id="inline-email" name="email" type="email" placeholder="you@email.com" required/><button class="pcta" type="submit">'+esc(P.final.cta)+'</button></form><p class="final-note" id="inline-note">'+esc(P.final.note)+'</p></div></section>'
  + '<footer class="site-footer">'+esc(P.footer)+'</footer>'
  + '<div class="modal" id="modal" role="dialog" aria-modal="true" aria-labelledby="mtitle" hidden><div class="mcard"><button class="mclose" type="button" data-close-modal aria-label="Close"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button><div class="mprogress" aria-hidden="true"><span></span><span></span><span></span></div>'
  + '<div class="mstep" data-step="0"><p class="eyebrow">Before the cards surface</p><h2 class="mtitle" id="mtitle">What brought you here?</h2><p class="msub">Tell us what to read for. This shapes your three cards.</p><form class="mform" data-form="0" novalidate><input type="text" name="website" class="hp" tabindex="-1" aria-hidden="true"/><label class="field"><span class="flabel">Your first name <em>(optional)</em></span><input type="text" name="name" placeholder="Your name"/></label><label class="field"><span class="flabel">What is on your mind?</span><div class="chip-row" id="intent-host"></div></label><button class="pcta full" type="submit">Continue</button></form></div>'
  + '<div class="mstep" data-step="1" hidden><p class="eyebrow">Almost there</p><h2 class="mtitle">Where should we send your reading?</h2><p class="msub">Your reading and the sample land here.</p><form class="mform" data-form="1" novalidate><input type="text" name="website" class="hp" tabindex="-1" aria-hidden="true"/><label class="field"><span class="flabel">Email address</span><input type="email" name="email" placeholder="you@email.com" required/></label><label class="consent"><input type="checkbox" name="consent" required/><span>Send me my reading and launch news. Unsubscribe anytime.</span></label><button class="pcta full" type="submit">Reveal my reading</button><p class="mfine">We guard your inbox. No spam, ever.</p></form></div>'
  + '<div class="mstep" data-step="2" hidden aria-live="polite"><p class="eyebrow">The tide has answered</p><h2 class="mtitle">Your reading from the deep</h2><div class="reveal-cards" id="reveal-cards"></div><div class="reveal-actions"><a class="pcta full" id="dl-link" href="#" download>'+esc(P.leadMagnet.downloadLabel)+'</a>'+(P.leadMagnet.upsellHref?'<a class="scta full" href="'+esc(P.leadMagnet.upsellHref)+'" data-close-modal>'+esc(P.leadMagnet.upsellLabel)+'</a>':'')+'</div><p class="mfine">Welcome to the First Tide.</p></div>'
  + '</div><div class="scrim" data-close-modal></div></div>';
}

function themeVars(P){
  const t = THEMES[P.themeId]||THEMES.abyss;
  const v = clone(t.vars);
  if(P.customAccent){ v.accent = P.customAccent; }
  return ":root{" + Object.keys(v).map(function(k){return "--"+k+":"+v[k]+";";}).join("") + "--radius:14px;--max:1180px;--head:'Cinzel',Georgia,serif;--body:'Nunito','Inter',system-ui,sans-serif;}";
}

async function buildFunnelDoc(P, opts){
  opts=opts||{};
  const map = await buildAssetMap(P);
  let slim = clone(P);
  slim.offer.heroImage = resolveImg(P.offer.heroImage, map);
  slim.final.bgImage = resolveImg(P.final.bgImage, map);
  slim.showcase.images = P.showcase.images.map(function(src){return resolveImg(src, map);});
  if(opts.forExport){
    slim.offer.heroImage = await inlineUrl(slim.offer.heroImage);
    slim.final.bgImage = await inlineUrl(slim.final.bgImage);
    slim.showcase.images = await Promise.all(slim.showcase.images.map(inlineUrl));
  }
  const proj = { brand:slim.brand, offer:slim.offer, perks:slim.perks, leadMagnet:slim.leadMagnet, showcase:slim.showcase, proof:slim.proof, tiers:slim.tiers, faq:slim.faq, final:slim.final, footer:slim.footer };
  const head = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>'+esc(slim.offer.title||slim.brand.name||"Funnel")+'</title><meta name="description" content="'+esc(slim.offer.subtitle||'')+'"/><link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/><link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Nunito:wght@400;500;700;800;900&display=swap" rel="stylesheet"/><style>' + themeVars(P) + FUNNEL_CSS + '</style></head>';
  const body = '<body>' + funnelBody(slim, map) + '</body>';
  const script = '<script>var PROJECT='+JSON.stringify(proj)+';\n'+FUNNEL_JS+'<\/script>';
  return head + body + script + '</html>';
}
const TABS = [
  {id:"offer",label:"Offer"},{id:"images",label:"Images"},{id:"perks",label:"Perks"},
  {id:"freebie",label:"Freebie"},{id:"pricing",label:"Pricing"},{id:"proof",label:"Proof"},
  {id:"faq",label:"FAQ"},{id:"theme",label:"Theme"}
];
let activeTab = "offer";

function renderTabs(){
  $("#tabs").innerHTML = TABS.map(function(t){return '<button class="tab'+(t.id===activeTab?" active":"")+'" data-tab="'+t.id+'" role="tab">'+t.label+'</button>';}).join("");
  $$("#tabs .tab").forEach(function(b){b.addEventListener("click",function(){activeTab=b.dataset.tab;renderTabs();renderPanels();});});
}

function getPath(obj, path){ return path.split(".").reduce(function(o,k){return o==null?undefined:o[k];}, obj); }
function setPath(obj, path, val){ var ks=path.split("."), o=obj; for(var i=0;i<ks.length-1;i++){ o=o[ks[i]]; } o[ks[ks.length-1]]=val; }

function fld(label, path, opts){
  opts=opts||{};
  const val = getPath(active(), path);
  const id = "f_" + path.replace(/\./g,"_");
  const hint = opts.hint ? ' <span class="hint">'+opts.hint+'</span>' : "";
  if(opts.area){ return '<div class="field"><label class="field-label" for="'+id+'">'+label+hint+'</label><textarea id="'+id+'" data-path="'+path+'">'+esc(val)+'</textarea></div>'; }
  if(opts.date){ return '<div class="field"><label class="field-label" for="'+id+'">'+label+hint+'</label><input id="'+id+'" data-path="'+path+'" type="date" value="'+esc(val)+'"/></div>'; }
  return '<div class="field"><label class="field-label" for="'+id+'">'+label+hint+'</label><input id="'+id+'" data-path="'+path+'" type="text" value="'+esc(val)+'" placeholder="'+esc(opts.ph||"")+'"/></div>';
}

function bindFields(){
  $$("[data-path]").forEach(function(el){
    const evt = el.tagName==="TEXTAREA"?"input":"input";
    el.addEventListener(evt, deb(function(){ setPath(active(), el.dataset.path, el.value); active().updatedAt=Date.now(); markDirty(); renderPreview(); }, 250));
    el.addEventListener("change", function(){ setPath(active(), el.dataset.path, el.value); markDirty(); renderPreview(); });
  });
}

function head(t, sub){ return '<div class="panel-head"><h2>'+t+'</h2><p>'+sub+'</p></div>'; }

function rep(items, render, opts){
  opts=opts||{};
  let html = items.map(function(it,i){return '<div class="rep-item">'+render(it,i)+'</div>';}).join("");
  html += '<div class="rep-add"><button type="button" data-rep-add>'+(opts.addLabel||"+ Add")+'</button></div>';
  return '<div class="rep">'+html+'</div>';
}

function renderPanels(){ $("#panels").innerHTML = panelHTML(); bindFields(); bindPanelActions(); }

function panelHTML(){
  const P = active();
  if(activeTab==="offer"){
    return head("Offer","The headline of your funnel — what visitors see first.")
      + fld("Brand name","brand.name")
      + fld("Eyebrow","offer.eyebrow",{ph:"small label above the title"})
      + fld("Title","offer.title",{ph:"Your hero headline"})
      + fld("Subtitle","offer.subtitle",{area:true,ph:"one-line promise"})
      + '<div class="row r2">'+fld("Primary button","offer.ctaPrimary")+fld("Secondary button","offer.ctaSecondary")+'</div>'
      + fld("Trust line","offer.trustLine",{ph:"social proof under the buttons"});
  }
  if(activeTab==="images"){
    return head("Images","Upload images, then assign them to the hero, the showcase, and the final section. Uploaded images stay in your browser.")
      + '<div class="asset-bar"><button class="btn" id="upload-btn" type="button">+ Upload image</button><button class="btn ghost" id="load-sample-btn" type="button">Load sample art</button></div>'
      + '<div class="asset-grid" id="asset-grid"></div><div class="divider"></div>'
      + '<div id="hero-picker"></div><div id="final-picker"></div><div id="showcase-picker"></div>';
  }
  if(activeTab==="perks"){
    return head("Perks","Reasons to join. Three or four reads best.")
      + rep(P.perks, function(it,i){
          const icons = ICON_KEYS.map(function(k){return '<button class="icon-opt'+(it.icon===k?" active":"")+'" data-icon="'+k+'" type="button">'+ICONS[k]+'</button>';}).join("");
          return '<div class="rep-head"><span class="rep-title">Perk '+(i+1)+'</span><div class="rep-actions"><button class="icon-btn" data-up type="button">▲</button><button class="icon-btn" data-down type="button">▼</button><button class="icon-btn danger" data-del type="button">✕</button></div></div><div class="field"><span class="field-label">Icon</span><div class="icon-grid">'+icons+'</div></div>'+fld("Title","perks."+i+".title")+fld("Text","perks."+i+".text",{area:true});
        }, {addLabel:"+ Add perk"});
  }
  if(activeTab==="freebie"){
    const L = P.leadMagnet;
    return head("Freebie","The email-gated reveal. Three cards flip after the visitor gives their email.")
      + fld("Eyebrow","leadMagnet.eyebrow") + fld("Title","leadMagnet.title") + fld("Lede","leadMagnet.lede",{area:true})
      + '<div class="row r2">'+fld("Reveal button","leadMagnet.cta")+fld("Note","leadMagnet.note")+'</div>'
      + '<div class="divider"></div><div class="panel-head"><h2>Intent options</h2></div>'
      + rep(L.intents, function(it,i){return '<div class="rep-head"><span class="rep-title">'+esc(it)+'</span><div class="rep-actions"><button class="icon-btn" data-up type="button">▲</button><button class="icon-btn" data-down type="button">▼</button><button class="icon-btn danger" data-del type="button">✕</button></div></div>'+fld("Option","leadMagnet.intents."+i);}, {addLabel:"+ Add option"})
      + '<div class="divider"></div><div class="panel-head"><h2>Reveal cards</h2></div>'
      + rep(L.cards, function(c,i){return '<div class="rep-head"><span class="rep-title">Card '+(i+1)+'</span><div class="rep-actions"><button class="icon-btn" data-up type="button">▲</button><button class="icon-btn" data-down type="button">▼</button><button class="icon-btn danger" data-del type="button">✕</button></div></div>'+fld("Title","leadMagnet.cards."+i+".title")+fld("Text","leadMagnet.cards."+i+".text",{area:true});}, {addLabel:"+ Add card"})
      + '<div class="divider"></div>'
      + fld("Download button label","leadMagnet.downloadLabel") + fld("Download file URL (optional)","leadMagnet.downloadHref",{ph:"https://… or leave blank"})
      + '<div class="row r2">'+fld("Upsell label","leadMagnet.upsellLabel")+fld("Upsell link","leadMagnet.upsellHref")+'</div>';
  }
  if(activeTab==="pricing"){
    return head("Pricing","Your offer tiers. Mark one as featured.")
      + rep(P.tiers, function(t,i){
          return '<div class="rep-head"><span class="rep-title">'+esc(t.name||("Tier "+(i+1)))+'</span><div class="rep-actions"><button class="icon-btn" data-up type="button">▲</button><button class="icon-btn" data-down type="button">▼</button><button class="icon-btn danger" data-del type="button">✕</button></div></div>'
            + fld("Name","tiers."+i+".name")
            + '<div class="row r2">'+fld("Price","tiers."+i+".price")+fld("Strike price","tiers."+i+".strike")+'</div>'
            + fld("Sub label","tiers."+i+".sub")
            + fld("Features (one per line)","tiers."+i+"._features",{area:true})
            + '<div class="chip'+(t.featured?" active":"")+'" data-toggle="tiers.'+i+'.featured"><span>★ Featured tier</span></div>'
            + fld("Button label","tiers."+i+".cta");
        }, {addLabel:"+ Add tier"});
  }
  if(activeTab==="proof"){
    return head("Social proof","Stats and testimonials.")
      + '<div class="panel-head"><h2>Stats</h2></div>'
      + rep(P.proof.stats, function(s,i){return '<div class="rep-head"><span class="rep-title">Stat '+(i+1)+'</span><div class="rep-actions"><button class="icon-btn" data-up type="button">▲</button><button class="icon-btn" data-down type="button">▼</button><button class="icon-btn danger" data-del type="button">✕</button></div></div><div class="row r2">'+fld("Value","proof.stats."+i+".value")+fld("Label","proof.stats."+i+".label")+'</div>';}, {addLabel:"+ Add stat"})
      + '<div class="divider"></div><div class="panel-head"><h2>Testimonials</h2></div>'
      + rep(P.proof.quotes, function(q,i){return '<div class="rep-head"><span class="rep-title">Quote '+(i+1)+'</span><div class="rep-actions"><button class="icon-btn" data-up type="button">▲</button><button class="icon-btn" data-down type="button">▼</button><button class="icon-btn danger" data-del type="button">✕</button></div></div>'+fld("Quote","proof.quotes."+i+".text",{area:true})+'<div class="row r2">'+fld("Name","proof.quotes."+i+".name")+fld("Location","proof.quotes."+i+".location")+'</div>';}, {addLabel:"+ Add testimonial"});
  }
  if(activeTab==="faq"){
    return head("FAQ","Questions and answers, shown as an accordion.")
      + rep(P.faq, function(f,i){return '<div class="rep-head"><span class="rep-title">'+esc(f.q||("Q "+(i+1)))+'</span><div class="rep-actions"><button class="icon-btn" data-up type="button">▲</button><button class="icon-btn" data-down type="button">▼</button><button class="icon-btn danger" data-del type="button">✕</button></div></div>'+fld("Question","faq."+i+".q")+fld("Answer","faq."+i+".a",{area:true});}, {addLabel:"+ Add question"});
  }
  if(activeTab==="theme"){
    const cards = Object.keys(THEMES).map(function(id){const v=THEMES[id].vars;return '<div class="theme-card'+(P.themeId===id?" active":"")+'" data-theme="'+id+'"><div class="theme-swatch" style="background:linear-gradient(135deg,'+v.bg+','+v.bg2+')"><i style="background:'+v.accent+'"></i><i style="background:'+v.accent2+'"></i><i style="background:'+v.gold+'"></i></div><div class="theme-name">'+THEMES[id].name+'</div></div>';}).join("");
    return head("Theme","Pick a palette. Colors flow through the whole funnel.")
      + '<div class="theme-grid">'+cards+'</div><div class="divider"></div>'
      + '<div class="field"><span class="field-label">Custom accent <span class="hint">(overrides the theme accent)</span></span><div class="color-row"><input type="color" id="custom-accent" value="'+esc(P.customAccent||"#5fd0c2")+'"/><button class="btn ghost sm" id="clear-accent" type="button">Reset</button></div></div>'
      + '<div class="divider"></div>' + fld("Footer text","footer");
  }
  return "";
}
function bindPanelActions(){
  const P = active();
  $$(".rep").forEach(function(repEl){
    const addBtn = repEl.querySelector("[data-rep-add]");
    if(addBtn) addBtn.addEventListener("click", function(){
      const first = repEl.querySelector("[data-path]");
      const path = first ? first.dataset.path : "";
      const base = path.replace(/\.\d+\..*$/,"");
      const arr = getPath(P, base) || [];
      if(base==="perks") arr.push({icon:"spark",title:"New perk",text:""});
      else if(base==="leadMagnet.intents") arr.push("New option");
      else if(base==="leadMagnet.cards") arr.push({title:"Card",text:""});
      else if(base==="tiers") arr.push({name:"New tier",price:"$",strike:"",sub:"",features:[],featured:false,cta:"Claim this tier"});
      else if(base==="proof.stats") arr.push({value:"",label:""});
      else if(base==="proof.quotes") arr.push({text:"",name:"",location:""});
      else if(base==="faq") arr.push({q:"Question?",a:"Answer."});
      setPath(P, base, arr); markDirty(); renderPanels(); renderPreview();
    });
    $$(".rep-item", repEl).forEach(function(item, idx){
      const up=item.querySelector("[data-up]"), down=item.querySelector("[data-down]"), del=item.querySelector("[data-del]");
      const baseOf=function(){const f=item.querySelector("[data-path]");if(!f)return null;const m=f.dataset.path.match(/^(.*)\.\d+/);return m?m[1]:null;};
      const move=function(dir){const base=baseOf();if(!base)return;const arr=getPath(P,base);const j=idx+dir;if(j<0||j>=arr.length)return;var t=arr[idx];arr[idx]=arr[j];arr[j]=t;markDirty();renderPanels();renderPreview();};
      if(up) up.addEventListener("click",function(){move(-1);});
      if(down) down.addEventListener("click",function(){move(1);});
      if(del) del.addEventListener("click",function(){const base=baseOf();if(!base)return;const arr=getPath(P,base);arr.splice(idx,1);markDirty();renderPanels();renderPreview();});
    });
  });
  $$(".icon-opt[data-icon]").forEach(function(b){b.addEventListener("click",function(){const item=b.closest(".rep-item");const idx=$$(".rep-item",item.closest(".rep")).indexOf(item);active().perks[idx].icon=b.dataset.icon;markDirty();renderPanels();renderPreview();});});
  $$(".theme-card[data-theme]").forEach(function(c){c.addEventListener("click",function(){active().themeId=c.dataset.theme;markDirty();renderPanels();renderPreview();});});
  const ca=$("#custom-accent"); if(ca) ca.addEventListener("input", deb(function(){active().customAccent=ca.value;markDirty();renderPreview();},200));
  const clr=$("#clear-accent"); if(clr) clr.addEventListener("click",function(){active().customAccent="";markDirty();renderPanels();renderPreview();});
  $$("[data-toggle]").forEach(function(el){el.addEventListener("click",function(){const path=el.dataset.toggle;setPath(P,path,!getPath(P,path));markDirty();renderPanels();renderPreview();});});
  $$('textarea[data-path$="._features"]').forEach(function(ta){
    const m=ta.dataset.path.match(/tiers\.(\d+)\._features/); if(!m)return; const i=+m[1];
    ta.value=(P.tiers[i].features||[]).join("\n");
    ta.addEventListener("input", deb(function(){P.tiers[i].features=ta.value.split("\n").map(function(s){return s.trim();}).filter(Boolean);markDirty();renderPreview();},250));
  });
  bindImagesTab();
}

async function bindImagesTab(){
  const grid=$("#asset-grid");
  if(grid){
    const all=await DB.all();
    if(!all.length){grid.innerHTML='<div class="asset-empty">No images yet. Upload one to get started.</div>';}
    else grid.innerHTML=all.map(function(a){return '<div class="asset-tile" title="'+esc(a.name)+'"><img src="'+a.dataUrl+'" alt=""/><span class="name">'+esc(a.name)+'</span><button class="icon-btn del" data-del-asset="'+a.id+'" type="button" title="Delete">✕</button></div>';}).join("");
    $$("[data-del-asset]",grid).forEach(function(b){b.addEventListener("click",async function(e){e.stopPropagation();await DB.del(b.dataset.delAsset);toast("Image deleted");bindImagesTab();refreshPickers();});});
  }
  await mountPicker("#hero-picker","offer.heroImage","Hero background",false);
  await mountPicker("#final-picker","final.bgImage","Final section background",false);
  await mountPicker("#showcase-picker",null,"Showcase gallery",true);
  const up=$("#upload-btn"); if(up) up.addEventListener("click",function(){$("#file-input").click();});
  const ls=$("#load-sample-btn"); if(ls) ls.addEventListener("click",loadSampleArt);
}

async function mountPicker(sel, path, label, isShowcase){
  const host=$(sel); if(!host)return;
  const all=await DB.all();
  if(isShowcase){
    const cur=active().showcase.images||[];
    let html='<span class="asset-sel-label">'+label+' <span class="hint">(click to add, click an active one to remove)</span></span>';
    if(!all.length){html+='<div class="asset-empty">Upload images first, then add them to the gallery.</div>';host.innerHTML=html;return;}
    html+='<div class="asset-sel">'+all.map(function(a){const ref="asset:"+a.id;const on=cur.indexOf(ref)>=0;return '<div class="opt'+(on?" active":"")+'" data-add="'+a.id+'"><img src="'+a.dataUrl+'"/></div>';}).join("")+'</div>';
    host.innerHTML=html;
    $$("[data-add]",host).forEach(function(o){o.addEventListener("click",function(){const ref="asset:"+o.dataset.add;const arr=active().showcase.images;const i=arr.indexOf(ref);if(i>=0)arr.splice(i,1);else arr.push(ref);markDirty();mountPicker(sel,null,label,true);renderPreview();});});
    return;
  }
  const cur=getPath(active(),path);
  let opts='<div class="opt none" data-asset-clear>none</div>';
  opts+=all.map(function(a){return '<div class="opt'+(cur===("asset:"+a.id)?" active":"")+'" data-asset="'+a.id+'"><img src="'+a.dataUrl+'"/></div>';}).join("");
  host.innerHTML='<div class="field"><span class="asset-sel-label">'+label+'</span><div class="asset-sel">'+opts+'</div></div>';
  $$("[data-asset]",host).forEach(function(o){o.addEventListener("click",function(){setPath(active(),path,"asset:"+o.dataset.asset);markDirty();refreshPickers();renderPreview();});});
  const clr=host.querySelector("[data-asset-clear]"); if(clr) clr.addEventListener("click",function(){setPath(active(),path,"");markDirty();refreshPickers();renderPreview();});
}
async function refreshPickers(){
  await mountPicker("#hero-picker","offer.heroImage","Hero background",false);
  await mountPicker("#final-picker","final.bgImage","Final section background",false);
  await mountPicker("#showcase-picker",null,"Showcase gallery",true);
}

$("#file-input").addEventListener("change", async function(e){
  const files=[].slice.call(e.target.files); e.target.value="";
  for(const file of files){
    if(!file.type.startsWith("image/")) continue;
    const dataUrl=await new Promise(function(res){const fr=new FileReader();fr.onload=function(){res(fr.result);};fr.readAsDataURL(file);});
    const scaled=await downscale(dataUrl,1400);
    await DB.put({id:uid(),name:file.name,dataUrl:scaled});
  }
  toast(files.length+" image(s) added"); bindImagesTab(); refreshPickers();
});
function downscale(dataUrl, max){
  return new Promise(function(res){
    const img=new Image(); img.onload=function(){const scale=Math.min(1,max/Math.max(img.width,img.height));if(scale>=1){return res(dataUrl);}const c=document.createElement("canvas");c.width=Math.round(img.width*scale);c.height=Math.round(img.height*scale);c.getContext("2d").drawImage(img,0,0,c.width,c.height);res(c.toDataURL("image/jpeg",0.85));};img.onerror=function(){res(dataUrl);};img.src=dataUrl;
  });
}
async function loadSampleArt(){
  const base="../calypsostar-site/assets/";
  const names=["card-open-sea.jpg","card-tower.jpg","card-return.jpg","card-knowing.jpg","card-quiet-shift.jpg","card-limitless.jpg","card-boundaries.jpg","card-seed.jpg"];
  let n=0;
  for(const name of names){
    try{const r=await fetch(base+name);if(!r.ok)continue;const b=await r.blob();const dataUrl=await new Promise(function(res){const fr=new FileReader();fr.onload=function(){res(fr.result);};fr.readAsDataURL(b);});await DB.put({id:uid(),name:name,dataUrl:await downscale(dataUrl,1200)});n++;}catch(e){}
  }
  toast(n+" sample images loaded"); bindImagesTab(); refreshPickers();
}

const previewDeb = deb(async function(){ const doc=await buildFunnelDoc(active(),{forExport:false}); $("#preview").srcdoc=doc; }, 300);
function renderPreview(){ previewDeb(); }

$("#export-btn").addEventListener("click", async function(){
  const btn=$("#export-btn"); const orig=btn.textContent; btn.textContent="Building…"; btn.disabled=true;
  try{
    const doc=await buildFunnelDoc(active(),{forExport:true});
    const blob=new Blob([doc],{type:"text/html"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a"); a.href=url; a.download=(active().brand.name||"funnel").replace(/[^a-z0-9]+/gi,"-").toLowerCase()+"-funnel.html";
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(function(){URL.revokeObjectURL(url);},4000);
    toast("Funnel exported");
  }catch(e){toast("Export failed: "+e.message);}
  btn.textContent=orig; btn.disabled=false;
});

function renderProjectSelect(){ const sel=$("#project-select"); sel.innerHTML=state.projects.map(function(p){return '<option value="'+p.id+'">'+esc(p.name||"Untitled")+'</option>';}).join(""); sel.value=active().id; }
$("#project-select").addEventListener("change", function(e){setActive(e.target.value);});
$("#new-project").addEventListener("click", function(){const p=defaultProject("New funnel");p.brand.name="My Brand";state.projects.push(p);state.activeId=p.id;saveState();renderAll();});
$("#dup-project").addEventListener("click", function(){const c=clone(active());c.id=uid();c.name=(active().name||"Funnel")+" copy";state.projects.push(c);state.activeId=c.id;saveState();renderAll();});
$("#del-project").addEventListener("click", function(){if(state.projects.length<=1){toast("Keep at least one project");return;}state.projects=state.projects.filter(function(p){return p.id!==active().id;});state.activeId=state.projects[0].id;saveState();renderAll();});

$$(".device-toggle .seg").forEach(function(b){b.addEventListener("click",function(){$$(".device-toggle .seg").forEach(function(x){x.classList.remove("active");});b.classList.add("active");$("#preview").className=b.dataset.device;});});
$("#refresh-preview").addEventListener("click", renderPreview);
$("#open-preview").addEventListener("click", function(){const doc=$("#preview").srcdoc;const w=window.open();if(w){w.document.write(doc);w.document.close();}});

function renderAll(){ renderProjectSelect(); renderTabs(); renderPanels(); renderPreview(); }

(async function init(){
  loadState();
  renderProjectSelect();
  renderTabs();
  await new Promise(function(r){setTimeout(r,0);});
  renderPanels();
  renderPreview();
})();
/* ---------- templates ---------- */
const TEMPLATES = [
  { id:"ocean",   name:"Ocean Oracle",    blurb:"Tarot/deck launch with a free 3-card reading.",  theme:"abyss",   sw:["#06131f","#0a1b2a","#5fd0c2","#f3bf55"] },
  { id:"ebook",   name:"Free Ebook",      blurb:"Give a chapter, capture emails.",                 theme:"bloom",   sw:["#f7efe7","#efe3d6","#b76a8a","#b5832a"] },
  { id:"waitlist",name:"Pre-launch Waitlist", blurb:"Build hype before you ship.",                theme:"royal",   sw:["#120a24","#1d1140","#b794f6","#f3bf55"] },
  { id:"course",  name:"Free Mini-Course",blurb:"3-day email course teaser.",                      theme:"ember",   sw:["#1a0f0a","#2a160e","#f3bf55","#f47c64"] },
  { id:"service", name:"Book a Call",     blurb:"Service/coaching lead magnet.",                   theme:"verdant", sw:["#08160e","#0f2417","#7bd88a","#e6d066"] },
  { id:"saas",    name:"SaaS Trial + Plans", blurb:"Demo funnel with pricing tiers.",              theme:"noir",    sw:["#0a0a0c","#15151a","#d9d9e0","#cbb88a"] },
];

function buildTemplate(id){
  const p = defaultProject();
  if(id==="ocean") return p;
  if(id==="ebook"){
    p.name="Free Ebook funnel"; p.themeId="bloom"; p.brand.name="Your Brand";
    p.offer={eyebrow:"Free ebook · 42 pages",title:"The Handbook",subtitle:"Get the first chapter free — the one that changes how you think about the topic.",ctaPrimary:"Send me chapter 1",ctaSecondary:"See what is inside",trustLine:"Read by 1,200+ readers · no spam",heroImage:""};
    p.perks=[{icon:"spark",title:"Chapter 1, instantly",text:"The full first chapter delivered to your inbox the moment you confirm."},{icon:"book",title:"The 5 frameworks",text:"The core mental models, explained with real examples."},{icon:"star",title:"Author notes",text:"A short weekly note on how the ideas hold up in the wild."},{icon:"gift",title:"Bonus worksheet",text:"A printable worksheet to apply chapter 1 today."}];
    p.leadMagnet={eyebrow:"Your free chapter",title:"Read the chapter everyone shares.",lede:"Three things you will walk away with. Drop your email and I will send the chapter.",cta:"Send me chapter 1",note:"Free. Delivered to your inbox in a minute.",intents:["Just curious","Ready to learn","Comparing options"],cards:[{title:"Framework 1",text:"The one shift that makes the whole topic click."},{title:"Framework 2",text:"A 10-minute exercise to find your blind spot."},{title:"Framework 3",text:"The mistake that costs people months."}],downloadLabel:"Download chapter 1 (PDF)",downloadHref:"",upsellLabel:"See the full book",upsellHref:"#tiers"};
    p.showcase={eyebrow:"Inside the book",title:"A peek at the pages.",lede:"",images:[]};
    p.proof={eyebrow:"Readers",title:"What early readers say.",stats:[{value:"1,200+",label:"readers"},{value:"4.8★",label:"avg rating"},{value:"42",label:"pages"}],quotes:[{text:"I read chapter 1 and immediately preordered.",name:"Alex M.",location:"reader"},{text:"Finally, a book that does not waste my time.",name:"Sam T.",location:"reader"}]};
    p.tiers=[{name:"Full Book",price:"$19",strike:"",sub:"Optional upsell",features:["All 42 pages","Audio version","Bonus worksheets"],featured:true,cta:"Get the full book"}];
    p.faq=[{q:"Is the chapter really free?",a:"Yes. No card, no trial. Just an email so I can send it."},{q:"Will you spam me?",a:"No. One chapter, then occasional notes. Unsubscribe anytime."}];
    p.final={eyebrow:"Before you close the tab",title:"Get chapter 1 before you go.",lede:"One email. The chapter. No spam, ever.",bgImage:"",launchDate:"",note:"Free · No spam · Unsubscribe anytime",cta:"Send me chapter 1"};
    p.footer="© Your Brand. All rights reserved."; return p;
  }
  if(id==="waitlist"){
    p.name="Waitlist funnel"; p.themeId="royal"; p.brand.name="Your Product";
    p.offer={eyebrow:"Coming soon · waitlist open",title:"Be first when we launch.",subtitle:"Join the waitlist for early access, founder pricing, and a behind-the-scenes look at the build.",ctaPrimary:"Join the waitlist",ctaSecondary:"Why you will love it",trustLine:"1,800+ already on the list · no spam",heroImage:""};
    p.perks=[{icon:"star",title:"Founder pricing",text:"Lock the lowest price we will ever offer."},{icon:"bolt",title:"Early access",text:"Get in 48 hours before the public."},{icon:"book",title:"Build updates",text:"See how it is being made, not just the launch."},{icon:"gift",title:"Founding badge",text:"A permanent founding-member mark on your account."}];
    p.leadMagnet={eyebrow:"Reserve your spot",title:"Three things coming in v1.",lede:"Join the waitlist and I will send you the roadmap sneak peek.",cta:"Join the waitlist",note:"Free. One email to confirm, then launch news only.",intents:["I want early access","Just watching","Ready to buy on day one"],cards:[{title:"The core feature",text:"The one thing no other tool does quite this way."},{title:"The integrations",text:"Plays nicely with the tools you already use."},{title:"The roadmap",text:"What ships at launch, and what comes next quarter."}],downloadLabel:"Download the roadmap (PDF)",downloadHref:"",upsellLabel:"See founder tiers",upsellHref:"#tiers"};
    p.showcase={eyebrow:"The product",title:"A look at what is coming.",lede:"",images:[]};
    p.proof={eyebrow:"The list",title:"You will be in good company.",stats:[{value:"1,800+",label:"on the waitlist"},{value:"48h",label:"early access"},{value:"$29",label:"founder price"}],quotes:[{text:"I joined for the price and stayed for the build updates.",name:"Riley K.",location:"early member"}]};
    p.tiers=[{name:"Early Bird",price:"$29",strike:"$49",sub:"Founder tier",features:["Full v1 access","Founding badge","1 year of updates"],featured:false,cta:"Reserve Early Bird"},{name:"Founder",price:"$59",strike:"$99",sub:"Most popular",features:["Everything in Early Bird","Priority support","Beta features first"],featured:true,cta:"Reserve Founder"},{name:"Lifetime",price:"$149",strike:"$299",sub:"Limited",features:["Lifetime updates","All future major versions","Name in credits"],featured:false,cta:"Reserve Lifetime"}];
    p.faq=[{q:"When does it launch?",a:"Waitlist members get the date first, plus 48 hours of early access."},{q:"Am I charged now?",a:"No. Joining the waitlist is free. You pay only at launch, if you choose a tier."}];
    p.final={eyebrow:"The list is growing",title:"Claim your spot before launch.",lede:"Founder pricing, early access, and the build diary — all for joining the list.",bgImage:"",launchDate:"2026-11-01",note:"Free · No spam · Unsubscribe anytime",cta:"Join the waitlist"};
    p.footer="© Your Product. All rights reserved."; return p;
  }
  if(id==="course"){
    p.name="Mini-course funnel"; p.themeId="ember"; p.brand.name="Your Course";
    p.offer={eyebrow:"Free 3-day mini-course",title:"Learn the skill in 3 days.",subtitle:"A free 3-day email course that takes you from stuck to confident — one short lesson a day.",ctaPrimary:"Start day 1 free",ctaSecondary:"What you will learn",trustLine:"9,000+ students · no card required",heroImage:""};
    p.perks=[{icon:"spark",title:"3 daily lessons",text:"Short, actionable emails — five minutes each."},{icon:"book",title:"Worksheet each day",text:"A tiny exercise that locks the lesson in."},{icon:"star",title:"Lifetime free access",text:"The mini-course is yours forever, free."},{icon:"gift",title:"Bonus resource kit",text:"Templates and checklists at the end of day 3."}];
    p.leadMagnet={eyebrow:"Your free course",title:"Three days. Three lessons. One new skill.",lede:"Drop your email and I will send day 1 right now.",cta:"Start day 1 free",note:"Free. One lesson a day for 3 days. Unsubscribe anytime.",intents:["I am a beginner","I know the basics","I want to go pro"],cards:[{title:"Day 1 · Foundations",text:"The one concept everything else rests on."},{title:"Day 2 · Practice",text:"A real, tiny project you finish today."},{title:"Day 3 · Next steps",text:"Where to go from here, and the full course."}],downloadLabel:"Download day 1 (PDF)",downloadHref:"",upsellLabel:"See the full course",upsellHref:"#tiers"};
    p.showcase={eyebrow:"The course",title:"What the full course covers.",lede:"",images:[]};
    p.proof={eyebrow:"Students",title:"What students say.",stats:[{value:"9,000+",label:"students"},{value:"4.7★",label:"avg rating"},{value:"3 days",label:"to results"}],quotes:[{text:"Day 2 was the lightbulb. I finally got it.",name:"Jordan P.",location:"student"},{text:"Best free course I have ever taken, full stop.",name:"Casey L.",location:"student"}]};
    p.tiers=[{name:"Full Course",price:"$129",strike:"$199",sub:"Optional upgrade",features:["All 40 lessons","Downloadable resources","Community access","Certificate of completion"],featured:true,cta:"Get the full course"}];
    p.faq=[{q:"Is the mini-course really free?",a:"Yes — 3 days, no card. The full course is an optional upgrade."},{q:"How long are the lessons?",a:"About five minutes to read, plus a small exercise."}];
    p.final={eyebrow:"Day 1 is one click away",title:"Start the free 3-day course.",lede:"Join 9,000+ students. One lesson a day. No spam.",bgImage:"",launchDate:"",note:"Free · No spam · Unsubscribe anytime",cta:"Start day 1 free"};
    p.footer="© Your Course. All rights reserved."; return p;
  }
  if(id==="service"){
    p.name="Book-a-call funnel"; p.themeId="verdant"; p.brand.name="Your Studio";
    p.offer={eyebrow:"Free 20-minute call",title:"Let us map your next step.",subtitle:"Book a free discovery call and walk away with a clear plan — no pitch, no pressure.",ctaPrimary:"Book my free call",ctaSecondary:"How it works",trustLine:"20+ clients helped · 5.0 average rating",heroImage:""};
    p.perks=[{icon:"chat",title:"Free 20-min call",text:"A real conversation, not a sales script."},{icon:"compass",title:"A clear next step",text:"You leave the call knowing exactly what to do."},{icon:"shield",title:"No pressure",text:"No pitch. If we are not a fit, I will tell you."},{icon:"star",title:"Honest advice",text:"Years of experience, condensed into 20 minutes."}];
    p.leadMagnet={eyebrow:"Your free call",title:"Three things we will cover.",lede:"Pick a time and we will dig into where you are and where you want to be.",cta:"Book my free call",note:"Free. 20 minutes. Zero pressure.",intents:["I need a plan","I am comparing options","I am ready to start"],cards:[{title:"Where you are",text:"An honest look at what is working and what is not."},{title:"What is blocking you",text:"The one or two things actually holding you back."},{title:"Your 90-day plan",text:"A simple, specific plan you can run with."}],downloadLabel:"Download the prep sheet (PDF)",downloadHref:"",upsellLabel:"See ways to work together",upsellHref:"#tiers"};
    p.showcase={eyebrow:"The work",title:"Results from past clients.",lede:"",images:[]};
    p.proof={eyebrow:"Clients",title:"What clients say after the call.",stats:[{value:"20+",label:"clients helped"},{value:"5.0★",label:"avg rating"},{value:"20 min",label:"free call"}],quotes:[{text:"I came in lost and left with a 90-day plan. Wild.",name:"Taylor R.",location:"founder"},{text:"No pitch, just clarity. Worth every minute.",name:"Morgan B.",location:"owner"}]};
    p.tiers=[{name:"Strategy Call",price:"Free",strike:"",sub:"Start here",features:["20-minute discovery call","A clear next step","No commitment"],featured:true,cta:"Book the call"},{name:"1:1 Sprint",price:"$1,200",strike:"",sub:"4 weeks",features:["4 weekly sessions","Personalized plan","Async support between calls"],featured:false,cta:"Apply for the sprint"},{name:"Retainer",price:"$3k/mo",strike:"",sub:"Ongoing",features:["Monthly strategy","Priority access","Quarterly planning"],featured:false,cta:"Ask about the retainer"}];
    p.faq=[{q:"Is the call really free?",a:"Yes. 20 minutes, no charge, no obligation."},{q:"Will you try to sell me?",a:"No. If we are a fit, we can talk about working together — otherwise you still get the plan."},{q:"Where does the call happen?",a:"Zoom. You will get a link when you book."}];
    p.final={eyebrow:"Pick a time",title:"Book your free call before the calendar fills.",lede:"20 minutes. A clear plan. No pressure.",bgImage:"",launchDate:"",note:"Free · No pitch · Cancel anytime",cta:"Book my free call"};
    p.footer="© Your Studio. All rights reserved."; return p;
  }
  if(id==="saas"){
    p.name="SaaS trial funnel"; p.themeId="noir"; p.brand.name="YourApp";
    p.offer={eyebrow:"14-day free trial · no card",title:"Stop the chaos. Start shipping.",subtitle:"See how YourApp saves your team 10 hours a week. Start a free trial or book a live demo.",ctaPrimary:"Start free trial",ctaSecondary:"Book a demo",trustLine:"Trusted by 3,000+ teams · 14-day free trial",heroImage:""};
    p.perks=[{icon:"bolt",title:"14-day free trial",text:"Full access, no credit card to start."},{icon:"shield",title:"No credit card",text:"Try it before you decide."},{icon:"star",title:"Cancel anytime",text:"No contracts, no lock-in."},{icon:"chat",title:"Live support",text:"Real humans, fast answers."}];
    p.leadMagnet={eyebrow:"See it in action",title:"Three things YourApp does that the others do not.",lede:"Start a trial or book a demo and we will show you the difference in 15 minutes.",cta:"Start free trial",note:"14 days free. No card. Cancel anytime.",intents:["I want a trial","I want a demo","I am comparing tools"],cards:[{title:"One source of truth",text:"Everything your team needs, in one place."},{title:"Automations",text:"The busywork, handled for you."},{title:"Real-time reporting",text:"Know where things stand without a meeting."}],downloadLabel:"Download the 1-pager (PDF)",downloadHref:"",upsellLabel:"See plans",upsellHref:"#tiers"};
    p.showcase={eyebrow:"The product",title:"A tour of the dashboard.",lede:"",images:[]};
    p.proof={eyebrow:"Customers",title:"Trusted by 3,000+ teams.",stats:[{value:"3,000+",label:"teams"},{value:"10h",label:"saved per week"},{value:"4.8★",label:"avg rating"}],quotes:[{text:"We cut our weekly status meeting entirely.",name:"Dev team lead",location:"SaaS company"},{text:"Onboarding took an afternoon, not a month.",name:"Ops manager",location:"agency"}]};
    p.tiers=[{name:"Starter",price:"$19",strike:"",sub:"Per month",features:["Up to 5 seats","Core features","Email support"],featured:false,cta:"Start free trial"},{name:"Pro",price:"$49",strike:"",sub:"Most popular",features:["Up to 20 seats","Automations","Priority support","Reporting"],featured:true,cta:"Start free trial"},{name:"Team",price:"$99",strike:"",sub:"Per month",features:["Unlimited seats","SSO + roles","Dedicated manager","SLA"],featured:false,cta:"Start free trial"}];
    p.faq=[{q:"Do I need a credit card to trial?",a:"No. The trial is 14 days, fully free, no card required."},{q:"Can I cancel anytime?",a:"Yes. No contracts. Cancel in one click."},{q:"Do you offer demos?",a:"Yes — book a live demo and we will walk you through it in 15 minutes."}];
    p.final={eyebrow:"Offer ends soon",title:"Start your 14-day free trial.",lede:"No card. No contract. Just 10 hours back every week.",bgImage:"",launchDate:"2026-08-15",note:"14 days free · No card · Cancel anytime",cta:"Start free trial"};
    p.footer="© YourApp. All rights reserved."; return p;
  }
  return p;
}

/* templates modal */
function openTemplates(){ renderTemplateGrid(); $("#templates-modal").hidden=false; }
function closeTemplates(){ $("#templates-modal").hidden=true; }
function renderTemplateGrid(){
  $("#tpl-grid").innerHTML = TEMPLATES.map(function(t){
    const sw=t.sw.map(function(c){return '<i style="background:'+c+'"></i>';}).join("");
    return '<div class="tpl-card" data-tpl="'+t.id+'"><div class="tpl-preview" style="background:linear-gradient(135deg,'+t.sw[0]+','+t.sw[1]+')"><span class="tpl-name">'+esc(t.name)+'</span>'+sw+'</div><div class="tpl-body"><h3>'+esc(t.name)+'</h3><p>'+esc(t.blurb)+'</p></div></div>';
  }).join("");
  $$("#tpl-grid .tpl-card").forEach(function(c){c.addEventListener("click",function(){ const tpl=buildTemplate(c.dataset.tpl); tpl.name = TEMPLATES.find(function(x){return x.id===c.dataset.tpl;}).name+" funnel"; state.projects.push(tpl); state.activeId=tpl.id; saveState(); closeTemplates(); renderAll(); toast("Template loaded — edit anything"); });});
}
$("#templates-btn").addEventListener("click", openTemplates);
$("#tpl-close").addEventListener("click", closeTemplates);
$("#tpl-scrim").addEventListener("click", closeTemplates);
/* override funnelBody with conditional sections (hide empty showcase/tiers/faq, countdown only if launchDate) */
function funnelBody(P, R){
  const hero = P.offer.heroImage ? '<div class="hero-bg" style="background-image:url(\''+resolveImg(P.offer.heroImage,R)+'\')"></div>' : '<div class="hero-grad"></div>';
  const perks = P.perks.map(function(p){return '<li class="perk reveal"><span class="perk-ico">'+(ICONS[p.icon]||ICONS.spark)+'</span><h3>'+esc(p.title)+'</h3><p>'+esc(p.text)+'</p></li>';}).join("");
  const labels=["Past","Present","Threshold"];
  const cards = P.leadMagnet.cards.map(function(c,i){var lift=i===1?-26:-6;return '<article class="rcard reveal" style="--lift:'+lift+'px"><button class="rc-btn" type="button"><span class="r-in"><span class="r-face r-back"><span class="bk">'+esc(P.brand.name||'')+'</span></span><span class="r-face r-front"><span class="ft-ico">'+ICONS.wave+'</span><h4 class="ft-title">'+esc(c.title)+'</h4><p class="ft-text">'+esc(c.text)+'</p></span></span></button><p class="r-label">'+esc(labels[i]||('Card '+(i+1)))+'</p></article>';}).join("");
  const showcaseSec = (P.showcase && P.showcase.images && P.showcase.images.length) ? '<section id="showcase"><div class="head reveal"><p class="eyebrow">'+esc(P.showcase.eyebrow)+'</p><h2>'+esc(P.showcase.title)+'</h2><p class="lede">'+esc(P.showcase.lede)+'</p></div><div class="show-grid" id="showcase-grid"></div></section>' : '';
  const stats = P.proof.stats.map(function(s){return '<div><b>'+esc(s.value)+'</b><span>'+esc(s.label)+'</span></div>';}).join("");
  const quotes = P.proof.quotes.map(function(q){return '<figure class="quote reveal"><blockquote>'+esc(q.text)+'</blockquote><figcaption><span class="av">'+esc((q.name||'?').charAt(0))+'</span>'+esc(q.name)+(q.location?' · '+esc(q.location):'')+'</figcaption></figure>';}).join("");
  const proofSec = (P.proof.stats.length||P.proof.quotes.length) ? '<section id="proof"><div class="head reveal"><p class="eyebrow">'+esc(P.proof.eyebrow)+'</p><h2>'+esc(P.proof.title)+'</h2></div>'+(P.proof.stats.length?'<div class="pstats reveal">'+stats+'</div>':'')+(P.proof.quotes.length?'<div class="quotes">'+quotes+'</div>':'')+'</section>' : '';
  const tiers = P.tiers.map(function(t){return '<article class="tier reveal'+(t.featured?' feat':'')+'">'+(t.featured?'<span class="tier-badge">Most popular</span>':'')+'<h3>'+esc(t.name)+'</h3><p class="tier-price">'+(t.strike?'<span class="strike">'+esc(t.strike)+'</span>':'')+'<b>'+esc(t.price)+'</b></p><p class="tier-sub">'+esc(t.sub||'')+'</p><ul>'+(t.features||[]).map(function(f){return '<li>'+esc(f)+'</li>';}).join("")+'</ul><button class="tier-cta" type="button" data-open-modal>'+esc(t.cta||'Claim this tier')+'</button></article>';}).join("");
  const tiersSec = P.tiers.length ? '<section id="tiers"><div class="head reveal"><p class="eyebrow">Pricing</p><h2>Choose your option.</h2><p class="lede">Pick the option that fits — you can change anytime.</p></div><div class="tier-grid">'+tiers+'</div></section>' : '';
  const faq = P.faq.map(function(f){return '<details class="faq-item reveal"><summary>'+esc(f.q)+'</summary><p>'+esc(f.a)+'</p></details>';}).join("");
  const faqSec = P.faq.length ? '<section id="faq"><div class="head reveal"><p class="eyebrow">FAQ</p><h2>Questions, answered.</h2></div><div class="faq-list">'+faq+'</div></section>' : '';
  const finalBg = P.final.bgImage ? '<div class="final-bg" style="background-image:url(\''+resolveImg(P.final.bgImage,R)+'\')"></div>' : '';
  const countdown = P.final.launchDate ? '<div class="countdown"><div><b data-cd="d">--</b><span>days</span></div><div><b data-cd="h">--</b><span>hrs</span></div><div><b data-cd="m">--</b><span>min</span></div><div><b data-cd="s">--</b><span>sec</span></div></div>' : '';
  return ''
  + '<canvas class="sea-canvas" aria-hidden="true"></canvas>'
  + '<header class="bar"><span class="brand">'+esc(P.brand.name||'')+'</span><nav><a href="#perks">Perks</a><a href="#freebie">Free</a>'+(tiersSec?'<a href="#tiers">Pricing</a>':'')+'<a href="#faq">FAQ</a></nav><button class="btn-ghost" type="button" data-open-modal>'+esc(P.offer.ctaPrimary)+'</button></header>'
  + '<section class="hero" id="top"><div class="hero-veil"></div>'+hero+'<div class="hero-inner reveal"><p class="eyebrow">'+esc(P.offer.eyebrow)+'</p><h1>'+esc(P.offer.title)+'</h1><p class="hero-sub">'+esc(P.offer.subtitle)+'</p><div class="hero-cta"><button class="pcta" type="button" data-open-modal>'+esc(P.offer.ctaPrimary)+'</button><a class="scta" href="#showcase">'+esc(P.offer.ctaSecondary)+'</a></div><p class="trust">'+esc(P.offer.trustLine)+'</p></div></section>'
  + (P.perks.length?'<section id="perks"><div class="head reveal"><p class="eyebrow">Why join</p><h2>What you get.</h2></div><ul class="perks-grid">'+perks+'</ul></section>':'')
  + '<section class="freebie" id="freebie"><div class="head reveal"><p class="eyebrow">'+esc(P.leadMagnet.eyebrow)+'</p><h2>'+esc(P.leadMagnet.title)+'</h2><p class="lede">'+esc(P.leadMagnet.lede)+'</p></div><div class="stage reveal">'+cards+'</div><div class="freebie-cta reveal"><button class="pcta" type="button" data-open-modal>'+esc(P.leadMagnet.cta)+'</button><p class="freebie-note">'+esc(P.leadMagnet.note)+'</p></div></section>'
  + showcaseSec + proofSec + tiersSec + faqSec
  + '<section class="final" id="claim">'+finalBg+'<div class="final-veil"></div><div class="final-inner reveal"><p class="eyebrow">'+esc(P.final.eyebrow)+'</p><h2>'+esc(P.final.title)+'</h2><p class="final-lede">'+esc(P.final.lede)+'</p>'+countdown+'<form class="inline-capture" id="inline-capture" novalidate><input type="text" name="website" class="hp" tabindex="-1" aria-hidden="true"/><label class="sr-only" for="inline-email">Email</label><input id="inline-email" name="email" type="email" placeholder="you@email.com" required/><button class="pcta" type="submit">'+esc(P.final.cta)+'</button></form><p class="final-note" id="inline-note">'+esc(P.final.note)+'</p></div></section>'
  + '<footer class="site-footer">'+esc(P.footer)+'</footer>'
  + '<div class="modal" id="modal" role="dialog" aria-modal="true" aria-labelledby="mtitle" hidden><div class="mcard"><button class="mclose" type="button" data-close-modal aria-label="Close"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button><div class="mprogress" aria-hidden="true"><span></span><span></span><span></span></div>'
  + '<div class="mstep" data-step="0"><p class="eyebrow">Almost there</p><h2 class="mtitle" id="mtitle">What brought you here?</h2><p class="msub">This shapes what we send you.</p><form class="mform" data-form="0" novalidate><input type="text" name="website" class="hp" tabindex="-1" aria-hidden="true"/><label class="field"><span class="flabel">Your first name <em>(optional)</em></span><input type="text" name="name" placeholder="Your name"/></label><label class="field"><span class="flabel">What is on your mind?</span><div class="chip-row" id="intent-host"></div></label><button class="pcta full" type="submit">Continue</button></form></div>'
  + '<div class="mstep" data-step="1" hidden><p class="eyebrow">Almost there</p><h2 class="mtitle">Where should we send it?</h2><p class="msub">Your freebie and updates land here.</p><form class="mform" data-form="1" novalidate><input type="text" name="website" class="hp" tabindex="-1" aria-hidden="true"/><label class="field"><span class="flabel">Email address</span><input type="email" name="email" placeholder="you@email.com" required/></label><label class="consent"><input type="checkbox" name="consent" required/><span>Send me my freebie and updates. Unsubscribe anytime.</span></label><button class="pcta full" type="submit">Reveal / Send it</button><p class="mfine">We guard your inbox. No spam, ever.</p></form></div>'
  + '<div class="mstep" data-step="2" hidden aria-live="polite"><p class="eyebrow">Done</p><h2 class="mtitle">Here is your freebie</h2><div class="reveal-cards" id="reveal-cards"></div><div class="reveal-actions"><a class="pcta full" id="dl-link" href="#" download>'+esc(P.leadMagnet.downloadLabel)+'</a>'+(P.leadMagnet.upsellHref?'<a class="scta full" href="'+esc(P.leadMagnet.upsellHref)+'" data-close-modal>'+esc(P.leadMagnet.upsellLabel)+'</a>':'')+'</div><p class="mfine">Check your inbox — it is on the way.</p></div>'
  + '</div><div class="scrim" data-close-modal></div></div>';
}
/* ---------- email integration ---------- */
TABS.push({id:"integrations",label:"Email"});
function ensureEsp(P){ if(!P.esp) P.esp={provider:"none",convertkit:{formId:"",apiKey:""},mailchimp:{url:""},beehiiv:{url:""},formspree:{url:""},custom:{url:""}}; return P.esp; }

function integrationsPanel(){
  const P=active(); const E=ensureEsp(P);
  let h=head("Email capture","Where captured emails go. Leave on none to just save locally in the browser. Keys are embedded in the exported funnel (client-side submit), so use provider-issued public/form keys only.");
  h+='<div class="field"><label class="field-label" for="f_esp_provider">Provider</label><select id="f_esp_provider" data-path="esp.provider">';
  [{v:"none",l:"None (save locally only)"},{v:"convertkit",l:"Kit / ConvertKit"},{v:"mailchimp",l:"Mailchimp"},{v:"beehiiv",l:"Beehiiv"},{v:"formspree",l:"Forward to my inbox (Formspree)"},{v:"custom",l:"Custom webhook"}].forEach(function(o){h+='<option value="'+o.v+'"'+(E.provider===o.v?" selected":"")+'>'+o.l+'</option>';});
  h+='</select></div>';
  if(E.provider==="convertkit"){ h+=fld("Form ID","esp.convertkit.formId",{ph:"1234567"})+fld("Public API key","esp.convertkit.apiKey",{ph:"public key (safe to expose)"}); }
  else if(E.provider==="mailchimp"){ h+=fld("Mailchimp form action URL","esp.mailchimp.url",{ph:"https://xxxx.usX.list-manage.com/subscribe/post?u=...&id=..."}); }
  else if(E.provider==="beehiiv"){ h+=fld("Beehiiv subscribe URL","esp.beehiiv.url",{ph:"https://www.beehiiv.com/.../subscribe"}); }
  else if(E.provider==="formspree"){ h+=fld("Formspree endpoint URL","esp.formspree.url",{ph:"https://formspree.io/f/xxxxxxxx"})+'<p style="font-size:12px;color:var(--muted-2);line-height:1.5">Free at formspree.io — create a form, copy its endpoint, paste here. Each signup emails you the details.</p>'; } else if(E.provider==="custom"){ h+=fld("Custom webhook URL","esp.custom.url",{ph:"https://your-endpoint.com/subscribe"}); }
  h+='<div class="divider"></div><p style="font-size:12px;color:var(--muted-2);line-height:1.5">On submit the funnel fires the email (plus first name, intent, and chosen tier) to your provider, then always shows the reveal so the experience never breaks. Test it in the preview after saving.</p>';
  return h;
}
function renderPanels(){ if(activeTab==="integrations"){ $("#panels").innerHTML=integrationsPanel(); bindFields(); bindPanelActions(); const sel=$("#f_esp_provider"); if(sel) sel.addEventListener("change", function(){ setPath(active(),"esp.provider",sel.value); markDirty(); renderPanels(); renderPreview(); }); } else { $("#panels").innerHTML=panelHTML(); bindFields(); bindPanelActions(); } }
renderTabs();

const ESP_JS = [
"(function(){var E=P.esp||{};var prov=E.provider||'none';",
"function submit(email,extra){extra=extra||{};",
" if(prov==='convertkit'){var f=E.convertkit||{};if(!f.formId||!f.apiKey)return;try{fetch('https://api.convertkit.com/v3/forms/'+f.formId+'/subscribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({api_key:f.apiKey,email:email,first_name:extra.name||'',tags:[]})}).catch(function(){});}catch(e){}}",
" else if(prov==='mailchimp'){var m=E.mailchimp||{};if(!m.url)return;try{var fd=new FormData();fd.append('EMAIL',email);fetch(m.url,{method:'POST',body:fd,mode:'no-cors'}).catch(function(){});}catch(e){}}",
" else if(prov==='beehiiv'){var b=E.beehiiv||{};if(!b.url)return;try{var fd2=new FormData();fd2.append('email',email);fetch(b.url,{method:'POST',body:fd2,mode:'no-cors'}).catch(function(){});}catch(e){}}",
" else if(prov==='formspree'){var fs=E.formspree||{};if(!fs.url)return;try{fetch(fs.url,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({_subject:'New funnel signup',_replyto:email,email:email,name:extra.name||'',intent:extra.intent||'',tier:extra.tier||'',source:extra.source||'funnel'})}).catch(function(){});}catch(e){}} else if(prov==='custom'){var c=E.custom||{};if(!c.url)return;try{fetch(c.url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:email,name:extra.name||'',intent:extra.intent||'',tier:extra.tier||'',source:extra.source||'funnel'})}).catch(function(){});}catch(e){}}",
"}",
"var f1=document.querySelector('[data-form=\"1\"]');if(f1)f1.addEventListener('submit',function(){var em=this.querySelector('[name=email]').value.trim();submit(em,{name:P._name||'',intent:P._intent||'',tier:(typeof pendingTier!=='undefined'?pendingTier:null),source:'modal'});});",
"var ic=document.querySelector('#inline-capture');if(ic)ic.addEventListener('submit',function(){var em=this.querySelector('[name=email]').value.trim();submit(em,{source:'inline'});});",
"})();"
].join("\n");

async function buildFunnelDoc(P, opts){
  opts=opts||{};
  const map = await buildAssetMap(P);
  let slim = clone(P);
  ensureEsp(slim);
  slim.offer.heroImage = resolveImg(P.offer.heroImage, map);
  slim.final.bgImage = resolveImg(P.final.bgImage, map);
  slim.showcase.images = P.showcase.images.map(function(src){return resolveImg(src, map);});
  if(opts.forExport){
    slim.offer.heroImage = await inlineUrl(slim.offer.heroImage);
    slim.final.bgImage = await inlineUrl(slim.final.bgImage);
    slim.showcase.images = await Promise.all(slim.showcase.images.map(inlineUrl));
  }
  const proj = { brand:slim.brand, offer:slim.offer, perks:slim.perks, leadMagnet:slim.leadMagnet, showcase:slim.showcase, proof:slim.proof, tiers:slim.tiers, faq:slim.faq, final:slim.final, footer:slim.footer, esp:slim.esp };
  const head = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>'+esc(slim.offer.title||slim.brand.name||"Funnel")+'</title><meta name="description" content="'+esc(slim.offer.subtitle||'')+'"/><link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/><link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Nunito:wght@400;500;700;800;900&display=swap" rel="stylesheet"/><style>' + themeVars(P) + FUNNEL_CSS + '</style></head>';
  const body = '<body>' + funnelBody(slim, map) + '</body>';
  const script = '<script>var PROJECT='+JSON.stringify(proj)+';\n'+FUNNEL_JS+'\n'+ESP_JS+'<\/script>';
  return head + body + script + '</html>';
}
/* override integrationsPanel with inline help + test button, plus testEsp + renderPanels binding */
function integrationsPanel(){
  const P=active(); const E=ensureEsp(P);
  let h=head("Email capture","Where captured emails go. The funnel runs in each visitor's browser, so you must point it somewhere that forwards signups to you — otherwise they are saved on the visitor's device, not yours.");
  h+='<div class="field"><label class="field-label" for="f_esp_provider">Provider</label><select id="f_esp_provider" data-path="esp.provider">';
  [{v:"none",l:"None (signups are NOT saved to you)"},{v:"formspree",l:"Forward to my inbox (Formspree) — easiest"},{v:"convertkit",l:"Kit / ConvertKit"},{v:"mailchimp",l:"Mailchimp"},{v:"beehiiv",l:"Beehiiv"},{v:"custom",l:"Custom webhook"}].forEach(function(o){h+='<option value="'+o.v+'"'+(E.provider===o.v?" selected":"")+'>'+o.l+'</option>';});
  h+='</select></div>';
  function note(t){return '<p style="font-size:12px;color:var(--muted-2);line-height:1.5;margin-top:4px">'+t+'</p>';}
  if(E.provider==="formspree"){
    h+=fld("Formspree endpoint URL","esp.formspree.url",{ph:"https://formspree.io/f/xxxxxxxx"});
    h+=note('No ESP needed. Create a free form at <a href="https://formspree.io" target="_blank" rel="noreferrer">formspree.io</a>, copy its endpoint (looks like <code>https://formspree.io/f/xxxxxxxx</code>), paste it here. Each signup emails you the details — you read them in Spark like any other email. Free up to 50 signups/month.');
  } else if(E.provider==="convertkit"){
    h+=fld("Form ID","esp.convertkit.formId",{ph:"1234567"})+fld("Public API key","esp.convertkit.apiKey",{ph:"public key (safe to expose)"});
    h+=note('In Kit: Grow &rarr; Forms &rarr; your form. Form ID is in the embed code; the public API key is in Settings &rarr; Advanced. Use the public key only — never a secret key.');
  } else if(E.provider==="mailchimp"){
    h+=fld("Mailchimp form action URL","esp.mailchimp.url",{ph:"https://xxxx.usX.list-manage.com/subscribe/post?u=...&id=..."});
    h+=note('Audience &rarr; Signup forms &rarr; Embedded form &rarr; copy the form <code>action</code> URL.');
  } else if(E.provider==="beehiiv"){
    h+=fld("Beehiiv subscribe URL","esp.beehiiv.url",{ph:"https://www.beehiiv.com/.../subscribe"});
    h+=note('Settings &rarr; Subscription &rarr; copy the form subscribe URL.');
  } else if(E.provider==="custom"){
    h+=fld("Custom webhook URL","esp.custom.url",{ph:"https://your-endpoint.com/subscribe"});
    h+=note('Any endpoint that accepts a JSON POST. It must allow CORS, or the browser will block it.');
  }
  if(E.provider!=="none"){
    h+='<div class="divider"></div><button class="btn" id="esp-test" type="button">Send test signup</button> <span id="esp-test-result" style="font-size:12px;color:var(--muted-2);margin-left:8px"></span>';
  }
  h+='<div class="divider"></div><p style="font-size:12px;color:var(--muted-2);line-height:1.5">On submit the funnel fires the email (plus first name, intent, and chosen tier) to your provider, then always shows the reveal so the visitor\'s experience never breaks.</p>';
  return h;
}

async function testEsp(){
  const E=ensureEsp(active()); const prov=E.provider;
  const out=$("#esp-test-result"); const set=function(m,c){ if(out){out.textContent=m;out.style.color=c;} toast(m); };
  if(out){out.textContent="Sending…";out.style.color="var(--accent-2)";}
  const email="test+funnel@example.com", name="Test", intent="test";
  try{
    if(prov==="convertkit"){const f=E.convertkit||{};if(!f.formId||!f.apiKey)return set("Add Form ID + public API key first","var(--danger)");const r=await fetch("https://api.convertkit.com/v3/forms/"+f.formId+"/subscribe",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({api_key:f.apiKey,email:email,first_name:name,tags:[]})});return r.ok?set("Kit: subscribed ✓ — check Kit","var(--accent)"):set("Kit: error "+r.status,"var(--danger)");}
    if(prov==="formspree"){const fs=E.formspree||{};if(!fs.url)return set("Add your Formspree endpoint URL first","var(--danger)");const r=await fetch(fs.url,{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify({_subject:"Test funnel signup",email:email,name:name,intent:intent,source:"suite-test"})});return r.ok?set("Formspree: sent ✓ — check your inbox","var(--accent)"):set("Formspree: error "+r.status,"var(--danger)");}
    if(prov==="custom"){const c=E.custom||{};if(!c.url)return set("Add your webhook URL first","var(--danger)");const r=await fetch(c.url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:email,name:name,intent:intent,tier:"",source:"suite-test"})});return r.ok?set("Webhook: sent ✓","var(--accent)"):set("Webhook: error "+r.status+" (CORS?)","var(--danger)");}
    if(prov==="mailchimp"){const m=E.mailchimp||{};if(!m.url)return set("Add your Mailchimp form URL first","var(--danger)");const fd=new FormData();fd.append("EMAIL",email);await fetch(m.url,{method:"POST",mode:"no-cors",body:fd});return set("Mailchimp: submitted (no-cors, can't confirm — check your list)","var(--accent)");}
    if(prov==="beehiiv"){const b=E.beehiiv||{};if(!b.url)return set("Add your Beehiiv URL first","var(--danger)");const fd=new FormData();fd.append("email",email);await fetch(b.url,{method:"POST",mode:"no-cors",body:fd});return set("Beehiiv: submitted (no-cors, can't confirm — check your list)","var(--accent)");}
    return set("Pick a provider first","var(--danger)");
  }catch(e){return set("Failed: "+e.message,"var(--danger)");}
}

function renderPanels(){
  if(activeTab==="integrations"){
    $("#panels").innerHTML=integrationsPanel(); bindFields(); bindPanelActions();
    const sel=$("#f_esp_provider"); if(sel) sel.addEventListener("change", function(){ setPath(active(),"esp.provider",sel.value); markDirty(); renderPanels(); renderPreview(); });
    const tb=$("#esp-test"); if(tb) tb.addEventListener("click", testEsp);
  } else {
    $("#panels").innerHTML=panelHTML(); bindFields(); bindPanelActions();
  }
}
