/* Calypso Star — Tarot of the Sea: Insider Tide funnel */

const ESP = { endpoint: "https://formspree.io/f/mojgjwqg" };
const LAUNCH_DATE = new Date("2026-09-21T09:00:00");

const DECK_CARDS = [
  { name: "Open Sea", img: "assets/card-open-sea.jpg" },
  { name: "Starfish", img: "assets/card-starfish.jpg" },
  { name: "Knowing", img: "assets/card-knowing.jpg" },
  { name: "Limitless", img: "assets/card-limitless.jpg" },
  { name: "Return", img: "assets/card-return.jpg" },
  { name: "The Tower", img: "assets/card-tower.jpg" },
  { name: "Boundaries", img: "assets/card-boundaries.jpg" },
  { name: "Unmasking", img: "assets/card-unmasking.jpg" },
  { name: "Seed", img: "assets/card-seed.jpg" },
  { name: "Inner Beauty", img: "assets/card-inner-beauty.jpg" },
  { name: "Quiet Shift", img: "assets/card-quiet-shift.jpg" },
  { name: "Trust Fall", img: "assets/card-trust-fall.jpg" },
  { name: "Whirlpool", img: "assets/card-whirlpool.jpg" },
  { name: "Hold Space", img: "assets/card-hold-space.jpg" },
  { name: "Plenty", img: "assets/card-plenty.jpg" },
  { name: "Open Minded", img: "assets/card-open-minded.jpg" },
  { name: "Silence", img: "assets/card-silence.jpg" },
  { name: "Karmic Bond", img: "assets/card-karmic-bond.jpg" },
];

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------- ESP submit (Formspree) ---------- */
async function submitToESP(payload) {
  if (!ESP.endpoint) return { ok: false, reason: "no-endpoint" };
  try {
    const res = await fetch(ESP.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload),
    });
    return { ok: res.ok, status: res.status };
  } catch (err) {
    return { ok: false, reason: "network-error", err: String(err) };
  }
}
function persistLocal(payload) {
  try {
    const all = JSON.parse(localStorage.getItem("calypso_insider_log") || "[]");
    all.push(payload);
    localStorage.setItem("calypso_insider_log", JSON.stringify(all));
  } catch (_) {}
}
function isHoneypotFilled(form) {
  const hp = form.querySelector('[name="website"]');
  return hp && hp.value.trim().length > 0;
}

/* ---------- deck showcase ---------- */
(function buildDeck() {
  const grid = $("#deck-grid");
  if (!grid) return;
  grid.innerHTML = DECK_CARDS.map(c =>
    `<figure class="deck-card reveal"><img src="${c.img}" alt="${c.name} card art" loading="lazy"/><figcaption class="deck-tag">${c.name}</figcaption></figure>`
  ).join("");
})();

/* ---------- poll + modal ---------- */
const modal = $("#modal");
let currentStep = 0, pendingVote = null, lastFocus = null;

function showStep(step) {
  currentStep = step;
  $$(".modal-step", modal).forEach(el => { el.hidden = +el.dataset.step !== step; });
  $$(".modal-progress span", modal).forEach((d, i) => d.classList.toggle("active", i <= step));
}

function setModalCopy(isVote) {
  const eb = $("#modal-eyebrow"), ti = $("#modal-title"), su = $("#modal-sub"), btn = $("#modal-submit");
  if (isVote && pendingVote) {
    if (eb) eb.textContent = "Cast your vote";
    if (ti) ti.textContent = "Join to cast your vote.";
    if (su) su.textContent = "One email and your vote for " + pendingVote + " is in — plus early access and members-only pricing.";
    if (btn) btn.textContent = "Join & cast my vote";
  } else {
    if (eb) eb.textContent = "Join the Insider Tide";
    if (ti) ti.textContent = "Help shape the deck.";
    if (su) su.textContent = "Join to vote on card art, meanings, and more — and get early access and members-only pricing when it launches.";
    if (btn) btn.textContent = "Join the Insider Tide";
  }
}

function openModal(step = 0, isVote = false) {
  lastFocus = document.activeElement;
  setModalCopy(isVote);
  showStep(step);
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  requestAnimationFrame(() => {
    const first = modal.querySelector('[data-step="0"] input:not(.hp)');
    if (first) first.focus();
  });
}
function closeModal() {
  modal.hidden = true;
  document.body.style.overflow = "";
  if (lastFocus && lastFocus.focus) lastFocus.focus();
}

$$(".poll-opt").forEach(btn => btn.addEventListener("click", () => {
  pendingVote = btn.dataset.vote;
  $$(".poll-opt").forEach(o => o.classList.remove("voted"));
  btn.classList.add("voted");
  openModal(0, true);
}));
$$("[data-open-modal]").forEach(btn => btn.addEventListener("click", () => { pendingVote = null; openModal(0, false); }));
$$("[data-close-modal]", modal).forEach(el => el.addEventListener("click", closeModal));
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && !modal.hidden) closeModal();
  if (e.key === "Tab" && !modal.hidden) {
    const f = $$('input:not(.hp), button, a[href]', modal)
      .filter(el => !el.disabled && el.offsetParent !== null && el.getClientRects().length && !el.closest("[hidden]"));
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});

// step 0 submit -> reveal
const form0 = $('[data-modal-form="0"]', modal);
form0.addEventListener("submit", async e => {
  e.preventDefault();
  if (isHoneypotFilled(form0)) return;
  const email = form0.querySelector('[name="email"]').value.trim();
  const consent = form0.querySelector('[name="consent"]').checked;
  if (!form0.checkValidity() || !consent) { form0.reportValidity(); return; }
  const name = form0.querySelector('[name="name"]').value.trim();
  const payload = { _subject: "New Insider Tide signup", _replyto: email, email, name, vote: pendingVote || "", source: pendingVote ? "poll" : "hero", at: Date.now() };
  persistLocal(payload);
  const btn = form0.querySelector('button[type="submit"]');
  const orig = btn.textContent; btn.disabled = true; btn.textContent = "Joining…";
  await submitToESP(payload);
  btn.disabled = false; btn.textContent = orig;
  const greet = $("#reveal-greeting");
  if (greet) greet.textContent = pendingVote ? ("Your vote for " + pendingVote + " is recorded.") : "You are in the Insider Tide.";
  showStep(1);
  requestAnimationFrame(() => modal.querySelector('a[data-close-modal]')?.focus());
});

/* ---------- inline capture (final section) ---------- */
const inline = $("#inline-capture");
inline.addEventListener("submit", async e => {
  e.preventDefault();
  if (isHoneypotFilled(inline)) return;
  const email = $("#inline-email").value.trim();
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    $("#inline-email").focus(); $("#inline-email").reportValidity(); return;
  }
  const payload = { _subject: "New Insider Tide signup", _replyto: email, email, name: "", vote: "", source: "inline-final", at: Date.now() };
  persistLocal(payload);
  await submitToESP(payload);
  const note = $("#inline-note");
  note.textContent = "You are in the Insider Tide. Watch your inbox for the first poll.";
  note.classList.add("ok");
  const btn = inline.querySelector("button");
  btn.textContent = "You are in \u2713";
  btn.disabled = true;
  inline.querySelector("input").disabled = true;
});

/* ---------- menu toggle ---------- */
const menuToggle = $(".menu-toggle");
const microNav = $(".micro-nav");
menuToggle?.addEventListener("click", () => {
  const open = microNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", open);
});
$$(".micro-nav a").forEach(a => a.addEventListener("click", () => microNav.classList.remove("open")));

/* ---------- header scroll state ---------- */
const header = $(".micro-header");
window.addEventListener("scroll", () => header.classList.toggle("scrolled", window.scrollY > 24), { passive: true });

/* ---------- reveal on scroll ---------- */
const io = new IntersectionObserver(entries => {
  entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
}, { threshold: 0.12 });
$$(".reveal").forEach(el => io.observe(el));

/* ---------- countdown to launch ---------- */
(function countdown() {
  const launch = LAUNCH_DATE;
  const set = (k, v) => { const el = $(`[data-cd="${k}"]`); if (el) el.textContent = String(v).padStart(2, "0"); };
  const tick = () => {
    let diff = Math.max(0, launch - new Date());
    const d = Math.floor(diff / 86400000); diff -= d * 86400000;
    const h = Math.floor(diff / 3600000); diff -= h * 3600000;
    const m = Math.floor(diff / 60000); diff -= m * 60000;
    const s = Math.floor(diff / 1000);
    set("d", d); set("h", h); set("m", m); set("s", s);
  };
  tick(); setInterval(tick, 1000);
})();

/* ---------- animated sea canvas ---------- */
(function sea() {
  const canvas = $(".sea-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let w, h, dpr, t = 0;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.width = innerWidth * dpr;
    h = canvas.height = innerHeight * dpr;
    canvas.style.width = innerWidth + "px";
    canvas.style.height = innerHeight + "px";
  }
  resize(); addEventListener("resize", resize);
  const blobs = Array.from({ length: 7 }, () => ({
    x: Math.random(), y: Math.random(), r: 0.18 + Math.random() * 0.22,
    hue: Math.random() > 0.5 ? "95,208,194" : "224,122,95", sp: 0.0002 + Math.random() * 0.0004
  }));
  function frame() {
    t += 1;
    ctx.clearRect(0, 0, w, h);
    blobs.forEach((b, i) => {
      const px = (b.x + Math.sin(t * b.sp + i) * 0.06) * w;
      const py = (b.y + Math.cos(t * b.sp * 1.3 + i) * 0.05) * h;
      const rad = b.r * Math.min(w, h);
      const g = ctx.createRadialGradient(px, py, 0, px, py, rad);
      g.addColorStop(0, `rgba(${b.hue},0.10)`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, rad, 0, Math.PI * 2); ctx.fill();
    });
    requestAnimationFrame(frame);
  }
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) frame();
})();

/* ---------- free 3-card draw (instant, no email) ---------- */
const READING_POOL = [
  { name: "Open Sea",     msg: "The journey completes and opens at once. There is more for you, and you are ready for it.", img: "assets/card-open-sea.jpg" },
  { name: "The Tower",    msg: "What was built on sand is falling. Let it fall — the ground beneath it is the true one.",    img: "assets/card-tower.jpg" },
  { name: "Return",       msg: "What was sent against you returns to sender. You are protected, and the debt was never yours.", img: "assets/card-return.jpg" },
  { name: "Knowing",      msg: "It surfaces all at once, and you cannot undo the knowing. Let it rearrange you.",          img: "assets/card-knowing.jpg" },
  { name: "Quiet Shift",  msg: "Everything is changing, even where the water looks still. Trust the undertow.",            img: "assets/card-quiet-shift.jpg" },
  { name: "Limitless",    msg: "No one knows your true depth — not even you. Stop measuring yourself from the surface.",   img: "assets/card-limitless.jpg" },
  { name: "Boundaries",   msg: "You can be beautiful and kind and still keep your thorns. The reef is gentle because it is firm.", img: "assets/card-boundaries.jpg" },
  { name: "Inner Beauty", msg: "It is safe to shine here. The deep does not envy its own light.",                          img: "assets/card-inner-beauty.jpg" },
  { name: "Seed",         msg: "Whatever you tend now will root. Your energy is the current; let it move into what you love.", img: "assets/card-seed.jpg" },
  { name: "Unmasking",    msg: "You are ready to surface as yourself. The mask was heavier than the face beneath it.",      img: "assets/card-unmasking.jpg" },
  { name: "Trust Fall",   msg: "Let go, even unsure. The deep has held heavier things than you.",                          img: "assets/card-trust-fall.jpg" },
  { name: "Whirlpool",    msg: "The center is moving. Stop fighting the spin and find the still point at its heart.",       img: "assets/card-whirlpool.jpg" },
];
function shuffle(arr){ const a=[...arr]; for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
let drawn=null;
function drawReading(){
  drawn = shuffle(READING_POOL).slice(0,3);
  $$(".r-card").forEach((card,i)=>{
    const c=drawn[i];
    card.querySelector("[data-front]").src = c.img;
    card.querySelector("[data-front]").alt = c.name + " card";
    card.querySelector("[data-name]").textContent = c.name;
    card.querySelector("[data-msg]").textContent = c.msg;
  });
}
function flipCards(){
  if(!drawn) drawReading();
  const cards=$$(".r-card");
  cards.forEach(card=>card.classList.remove("flipped"));
  cards.forEach((card,i)=> setTimeout(()=>card.classList.add("flipped"), i*220));
}
const drawBtn=$("#draw-cards");
if(drawBtn) drawBtn.addEventListener("click", ()=>{ drawReading(); flipCards(); });
