/* ══════════════════════════════════════════════════════════════
   PRAJNA DASHBOARD — app logic
   ══════════════════════════════════════════════════════════════ */
(() => {
"use strict";
const C = window.CONFIG;
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const rand = (a, b) => a + Math.random() * (b - a);
const pick = a => a[(Math.random() * a.length) | 0];
const PALETTE = ["#ffffff","#dfe5f1","#c3cbdd","#aab3c8","#f3e3bf","#e6c97f","#ffd6e4"];

/* ── safe storage ─────────────────────────────────────────── */
const store = {
  get(k, d) { try { const v = localStorage.getItem("prajna:" + k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem("prajna:" + k, JSON.stringify(v)); return true; } catch { return false; } },
};

/* ── toast ────────────────────────────────────────────────── */
let toastT;
function toast(msg) {
  const el = $("#toast");
  el.textContent = msg; el.hidden = false;
  clearTimeout(toastT); toastT = setTimeout(() => (el.hidden = true), 2600);
}

/* ══ CANVAS FX: confetti + fireworks ═══════════════════════ */
const fx = (() => {
  const cv = $("#fx"), ctx = cv.getContext("2d");
  let parts = [], raf = null, dpr = 1;

  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
    cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  addEventListener("resize", resize); resize();

  function loop() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.vy += p.g; p.vx *= p.drag; p.vy *= p.drag;
      p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life--;
      const a = Math.max(0, Math.min(1, p.life / p.fade));
      if (p.life <= 0 || p.y > innerHeight + 80) { parts.splice(i, 1); continue; }
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.c;
      if (p.shape === "circle") { ctx.beginPath(); ctx.arc(0, 0, p.s / 2, 0, 7); ctx.fill(); }
      else if (p.shape === "spark") { ctx.shadowBlur = 12; ctx.shadowColor = p.c; ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s); }
      else { ctx.fillRect(-p.s / 2, -p.s * .35, p.s, p.s * .7); }
      ctx.restore();
    }
    if (parts.length) raf = requestAnimationFrame(loop);
    else { raf = null; ctx.clearRect(0, 0, innerWidth, innerHeight); }
  }
  const start = () => { if (!raf) raf = requestAnimationFrame(loop); };

  function burst(x, y, n = 90, power = 15, shape = "rect") {
    for (let i = 0; i < n; i++) {
      const a = rand(0, Math.PI * 2), sp = rand(power * .25, power);
      parts.push({
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - rand(0, 5),
        g: shape === "spark" ? .12 : .28, drag: .985,
        s: rand(5, 11), c: pick(PALETTE), rot: rand(0, 6), vr: rand(-.3, .3),
        life: rand(70, 150), fade: 90, shape,
      });
    }
    start();
  }

  function rain(n = 160) {
    for (let i = 0; i < n; i++) {
      parts.push({
        x: rand(0, innerWidth), y: rand(-innerHeight, -20),
        vx: rand(-1.6, 1.6), vy: rand(2.5, 6.5), g: .045, drag: 1,
        s: rand(6, 13), c: pick(PALETTE), rot: rand(0, 6), vr: rand(-.22, .22),
        life: rand(220, 400), fade: 120, shape: Math.random() < .3 ? "circle" : "rect",
      });
    }
    start();
  }

  function firework(x, y) {
    const col = pick(PALETTE);
    for (let i = 0; i < 70; i++) {
      const a = (Math.PI * 2 * i) / 70, sp = rand(3, 11);
      parts.push({
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        g: .09, drag: .955, s: rand(2.5, 5), c: Math.random() < .75 ? col : pick(PALETTE),
        rot: 0, vr: 0, life: rand(60, 110), fade: 70, shape: "spark",
      });
    }
    start();
  }

  function show(rounds = 14) {
    let i = 0;
    const t = setInterval(() => {
      firework(rand(innerWidth * .12, innerWidth * .88), rand(innerHeight * .1, innerHeight * .55));
      if (++i >= rounds) clearInterval(t);
    }, 320);
  }
  return { burst, rain, firework, show };
})();

/* ══ AMBIENT: stars + balloons ═════════════════════════════ */
(function stars() {
  const wrap = $("#stars"), f = document.createDocumentFragment();
  for (let i = 0; i < 90; i++) {
    const s = document.createElement("span");
    s.className = "star";
    s.style.cssText = `left:${rand(0,100)}%;top:${rand(0,100)}%;animation-delay:${rand(0,4)}s;
      opacity:${rand(.1,.6)};transform:scale(${rand(.6,1.6)})`;
    f.appendChild(s);
  }
  wrap.appendChild(f);
})();

function balloon() {
  const wrap = $("#balloons");
  if (wrap.childElementCount > 14) return;
  const b = document.createElement("div");
  const c = pick(PALETTE);
  b.className = "balloon";
  b.style.cssText = `left:${rand(2,94)}%;background:radial-gradient(circle at 32% 28%, #fff6, ${c});
    --spin:${rand(-25,25)}deg;animation-duration:${rand(13,24)}s;
    transform:scale(${rand(.55,1.25)});opacity:${rand(.25,.6)}`;
  b.addEventListener("animationend", () => b.remove());
  wrap.appendChild(b);
}

/* sound is switched off — keep a silent stub so the callers below stay simple */
const music = { start() {}, stop() {}, toggle() {}, duck() {}, blip() {}, puff() {}, on: false };

/* ══ VEIL / OPENING SEQUENCE ═══════════════════════════════ */
let opened = false;
function openGift() {
  if (opened) return; opened = true;
  $("#gift").classList.add("open");
  music.start();
  fx.burst(innerWidth / 2, innerHeight / 2, 160, 22);
  setTimeout(() => fx.rain(200), 250);

  setTimeout(() => {
    $("#veil").classList.add("gone");
    $("#app").hidden = false;
    document.body.classList.remove("locked");
    boot();
    setTimeout(() => $("#veil").remove(), 1200);
  }, 720);
}

/* ══ TYPEWRITER ════════════════════════════════════════════ */
function typewriter(el, lines) {
  let li = 0, ci = 0, del = false;
  (function tick() {
    const full = lines[li % lines.length];
    ci += del ? -1 : 1;
    el.innerHTML = full.slice(0, ci) + '<span class="caret">▌</span>';
    let wait = del ? 26 : 46;
    if (!del && ci === full.length) { wait = 2100; del = true; }
    else if (del && ci === 0) { del = false; li++; wait = 320; }
    setTimeout(tick, wait);
  })();
}

/* ══ LIVE STATS ════════════════════════════════════════════ */
const BIRTH = new Date(C.birth.year, C.birth.month - 1, C.birth.day, 9, 0, 0);
const fmt = n => n.toLocaleString("en-US");
function compact(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return fmt(Math.round(n));
}
function ageParts() {
  const now = new Date();
  const ms = now - BIRTH;
  const days = Math.floor(ms / 864e5);
  let years = now.getFullYear() - BIRTH.getFullYear();
  const had = (now.getMonth() > BIRTH.getMonth()) ||
              (now.getMonth() === BIRTH.getMonth() && now.getDate() >= BIRTH.getDate());
  if (!had) years--;
  let next = new Date(now.getFullYear(), BIRTH.getMonth(), BIRTH.getDate());
  const isToday = now.getMonth() === BIRTH.getMonth() && now.getDate() === BIRTH.getDate();
  if (next < new Date(now.getFullYear(), now.getMonth(), now.getDate())) next.setFullYear(now.getFullYear() + 1);
  const untilNext = Math.round((next - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 864e5);
  return { ms, days, years, untilNext, isToday };
}

function buildStats() {
  const a = ageParts();
  const tiles = [
    { icon: "🥈", val: fmt(C.jubileeAge || 25),          label: "Silver jubilee",     note: "a quarter century" },
    { icon: "⏱️", val: "0",  live: "seconds",            label: "Seconds alive",      note: `${fmt(a.days)} days on Earth` },
    { icon: "❤️", val: compact(a.days * 24 * 60 * 72),   label: "Heartbeats",         note: "roughly, give or take" },
    { icon: "😄", val: compact(a.days * 14),             label: "Smiles caused",      note: "conservative estimate" },
    { icon: "🌙", val: fmt(a.days),                      label: "Sunrises seen",      note: "never gets old" },
    { icon: "☕", val: compact(a.days * 1.8),            label: "Cups of chai",       note: "the real fuel" },
    { icon: "⏳", val: a.isToday ? "TODAY" : fmt(a.untilNext), label: a.isToday ? "It's the day 🎉" : "Days to next birthday", note: a.isToday ? "party mode on" : "already excited" },
    { icon: "✨", val: "∞",                              label: "Awesomeness",        note: "scientifically unmeasurable" },
  ];
  $("#statGrid").innerHTML = tiles.map((t, i) => `
    <article class="card stat" style="animation-delay:${i * 60}ms">
      <div class="stat-icon">${t.icon}</div>
      <div class="stat-val" ${t.live ? 'data-live="seconds"' : `data-target="${t.val}"`}>${t.live ? "0" : t.val}</div>
      <div class="stat-label">${t.label}</div>
      <div class="stat-note">${t.note}</div>
    </article>`).join("");

  // count-up for numeric tiles
  $$(".stat-val[data-target]").forEach(el => {
    const raw = el.dataset.target;
    const num = parseFloat(raw.replace(/[^\d.]/g, ""));
    if (!isFinite(num) || num === 0) return;
    const suffix = raw.replace(/[\d.,]/g, "");
    const t0 = performance.now(), D = 1500;
    (function step(t) {
      const k = Math.min(1, (t - t0) / D), e = 1 - Math.pow(1 - k, 3);
      const v = num * e;
      el.textContent = (raw.includes(",") || num >= 1000 && !suffix ? fmt(Math.round(v)) : (suffix ? v.toFixed(v >= 100 ? 0 : 1) : Math.round(v))) + suffix;
      if (k < 1) requestAnimationFrame(step); else el.textContent = raw;
    })(t0);
  });

  // live seconds ticker
  const liveEl = $('.stat-val[data-live="seconds"]');
  setInterval(() => { liveEl.textContent = fmt(Math.floor((Date.now() - BIRTH) / 1000)); }, 1000);
  liveEl.textContent = fmt(Math.floor((Date.now() - BIRTH) / 1000));
}

/* ══ CAKE + CANDLES ════════════════════════════════════════ */
const cake = (() => {
  const N = 5;
  const BLOW = 46;                 // % of meter where a sustained breath starts taking candles
  let out = 0, micOn = false, stopMic = null;

  function build() {
    $("#candles").innerHTML = Array.from({ length: N }, () =>
      `<div class="candle"><span class="wick"></span><span class="flame"></span></div>`).join("");
    out = 0; status();
    $$("#candles .candle").forEach(c => c.addEventListener("click", e => { e.stopPropagation(); blowOne(c); }));
  }
  function status() {
    const left = N - out;
    $("#cakeStatus").textContent = left ? `${left} candle${left > 1 ? "s" : ""} still burning.` : "All out — the wish is officially in flight. 🌠";
  }
  function blowOne(c) {
    if (!c || c.classList.contains("out")) return;
    c.classList.add("out");
    const s = document.createElement("span"); s.className = "smoke"; c.appendChild(s);
    out++; music.blip(rand(500, 700)); status();
    if (out >= N) allOut();
  }
  function blowAll(stagger = 90) { $$("#candles .candle:not(.out)").forEach((c, i) => setTimeout(() => blowOne(c), i * stagger)); }
  function relight() { build(); toast("Candles relit 🔥"); }
  function allOut() {
    if (stopMic) stopMic();                 // nothing left to blow — let go of the mic
    setTimeout(() => {                      // confetti only — no dialog to dismiss
      const r = $("#cake").getBoundingClientRect();
      fx.burst(r.left + r.width / 2, r.top + r.height / 3, 130, 18);
      fx.show(6);
    }, 420);
  }

  /* ── mic breath meter: fill it to 100% and every flame goes out at once ── */
  function gust(pct) { document.documentElement.style.setProperty("--gust", (pct / 100).toFixed(2)); }

  async function mic() {
    if (micOn) return toast("Mic already listening 🎤");
    if (out >= N) return toast("Every candle is already out — relight them first 🔥");
    try {
      /* raw audio: Chrome's noise suppression + AGC are built to erase exactly the
         broadband rumble that blowing makes, so the meter would never move. */
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === "suspended") await ac.resume();
      const src = ac.createMediaStreamSource(stream);
      const an = ac.createAnalyser();
      an.fftSize = 1024; an.smoothingTimeConstant = .35;
      src.connect(an);

      const freq = new Uint8Array(an.frequencyBinCount);
      const binHz = ac.sampleRate / an.fftSize;
      const LO = Math.max(1, Math.round(80 / binHz));       // breath lives low and broad;
      const HI = Math.round(1400 / binHz);                  // ignore everything above speech
      const bar = $("#blowBar");

      let alive = true, charge = 0, floor = 0, cal = 0, quiet = 0;

      micOn = true;
      music.duck(true);                                     // keep the song out of the mic
      $("#micBtn").textContent = "🎤 Listening… blow!";
      $("#cake").classList.add("listening");
      toast("Calibrating… stay quiet for a second 🤫");

      stopMic = () => {
        alive = false; micOn = false; stopMic = null;
        stream.getTracks().forEach(t => t.stop());
        ac.close().catch(() => {});
        music.duck(false);
        $("#micBtn").textContent = "🎤 Enable mic blowing";
        $("#cake").classList.remove("listening");
        bar.style.width = "0%"; bar.classList.remove("max");
        $("#blowPct").textContent = "0%";
        gust(0);
      };

      (function read() {
        if (!alive) return;
        requestAnimationFrame(read);

        an.getByteFrequencyData(freq);
        let sum = 0;
        for (let i = LO; i <= HI; i++) sum += freq[i];
        const energy = sum / (HI - LO + 1);                 // 0…255, low-band average

        /* first ~40 frames set the room's noise floor so any mic works */
        if (cal < 40) {
          cal++; floor = Math.max(floor, energy);
          if (cal === 40) { floor += 6; toast("Now blow into your mic 💨"); }
          return;
        }

        const breath = Math.max(0, Math.min(1, (energy - floor) / 55));
        /* if nothing ever registers, say so instead of failing silently */
        if (breath > .12) quiet = 0;
        else if (++quiet === 480) toast("Not hearing any breath — check the mic input 🎤");
        window.__breath = { energy: energy | 0, floor: floor | 0, breath: +breath.toFixed(2), charge: charge | 0 };

        /* sustained breath charges the meter; it drains when you stop */
        charge = breath > .12 ? Math.min(100, charge + breath * 3.4)
                              : Math.max(0, charge - 2.2);
        const pct = Math.round(charge);

        bar.style.width = pct + "%";
        bar.classList.toggle("max", pct >= 100);
        $("#blowPct").textContent = pct + "%";
        gust(charge / 100);                                 // flames flatten as it fills

        /* every flame stays lit — leaning harder and harder — until the meter tops out,
           then one gust at 100% puts them all out together. */
        if (pct >= 100) {
          music.puff(1);
          $("#cake").classList.add("gusted");
          setTimeout(() => $("#cake").classList.remove("gusted"), 600);
          blowAll(0);
          stopMic();
        }
      })();
    } catch (e) {
      toast("No mic access — tap the candles instead 👆");
    }
  }
  return { build, blowAll, relight, mic };
})();

/* ══ TWENTY-FIVE + LETTER ══════════════════════════════════ */
function buildJubilee() {
  const list = C.twentyFive || [];
  $("#tfGrid").innerHTML = list.map((t, i) => `
    <li class="tf${i === list.length - 1 ? " last" : ""}" style="animation-delay:${i * 70}ms"><b>${["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX","XXI","XXII","XXIII","XXIV","XXV"][i] || i + 1}</b><span>${t.replace(/</g, "&lt;")}</span></li>`).join("");
  const esc = x => x.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  $("#letterBody").innerHTML = (C.letter || "").split(/\n\s*\n/).map(p => `<p>${esc(p.trim())}</p>`).join("");
  $("#letterSign").textContent = C.letterSign || "";
}

/* ══ REASONS ═══════════════════════════════════════════════ */
(function reasons() {
  let i = 0, bag = [];
  window.nextReason = () => {
    if (!bag.length) bag = [...C.reasons].sort(() => Math.random() - .5);
    const el = $("#reasonText");
    el.classList.remove("fade-swap"); void el.offsetWidth; el.classList.add("fade-swap");
    el.textContent = bag.pop();
    $("#reasonCount").textContent = `reason #${++i}`;
    music.blip(rand(700, 1100));
  };
})();

/* ══ GALLERY ═══════════════════════════════════════════════ */
/* Phone photos are several MB each and localStorage only holds ~5MB total, so
   every image is decoded, downscaled and re-encoded as JPEG before it's stored. */
/* localStorage gives roughly 5M characters per origin for ALL of it, so each
   photo gets a share small enough that a full vault still fits comfortably. */
const MAX_EDGE = 1400, BUDGET = 430e3;

const isHeic = f => /hei[cf]/i.test(f.type) || /\.hei[cf]$/i.test(f.name || "");

/* decode via createImageBitmap where possible, else an <img> */
async function decode(file) {
  if (self.createImageBitmap) {
    try { return await createImageBitmap(file); } catch {}
  }
  const url = URL.createObjectURL(file);
  try {
    return await new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = () => rej(new Error("decode"));
      img.src = url;
    });
  } finally { setTimeout(() => URL.revokeObjectURL(url), 5e3); }
}

/* shrink until the data URL fits the per-photo budget */
async function readImage(file) {
  const src = await decode(file);
  const w0 = src.width || src.naturalWidth, h0 = src.height || src.naturalHeight;
  if (!w0 || !h0) throw new Error("empty image");

  for (const [edge, q] of [[MAX_EDGE, .82], [MAX_EDGE, .68], [1100, .62], [800, .55], [560, .5]]) {
    const scale = Math.min(1, edge / Math.max(w0, h0));
    const cv = document.createElement("canvas");
    cv.width = Math.max(1, Math.round(w0 * scale));
    cv.height = Math.max(1, Math.round(h0 * scale));
    const cx = cv.getContext("2d");
    cx.imageSmoothingQuality = "high";
    cx.drawImage(src, 0, 0, cv.width, cv.height);
    const data = cv.toDataURL("image/jpeg", q);
    if (data.length <= BUDGET) return data;
    if (edge === 560) return data;                           // last resort — take what we got
  }
}

/* a full localStorage is the one failure worth surfacing */
function savePhotos(photos) {
  if (store.set("photos", photos)) return true;
  toast("Out of browser storage — remove a photo first 😬");
  return false;
}

async function addPhoto(i, file) {
  let data;
  try {
    data = await readImage(file);
  } catch (err) {
    console.error("[vault] could not read", file.name, err);
    toast(isHeic(file)
      ? `“${file.name}” is an iPhone HEIC file — browsers can't read those. Export it as JPEG.`
      : `Couldn't read “${file.name}” 🙃`);
    return false;
  }
  const photos = store.get("photos", {});
  const prev = photos[i];
  photos[i] = data;
  if (!savePhotos(photos)) {
    if (prev === undefined) delete photos[i]; else photos[i] = prev;
    return false;
  }
  console.log(`[vault] frame ${i} ← ${file.name} (${(data.length / 1024 | 0)}KB)`);
  buildGallery();
  const t = $(`#gallery .frame[data-i="${i}"]`);
  if (t) { const b = t.getBoundingClientRect(); fx.burst(b.left + b.width / 2, b.top + b.height / 2, 40, 11); }
  return true;
}

function removePhoto(i) {
  const photos = store.get("photos", {});
  delete photos[i]; savePhotos(photos);
  buildGallery(); toast("Photo removed");
}

/* fill the given frame, then spill over into the next empty ones */
async function addPhotos(files, startAt) {
  const all = [...files];
  const list = all.filter(f => f.type.startsWith("image/") || isHeic(f));
  if (!list.length) return toast("No images in that selection 🙃");

  const saved = store.get("photos", {});
  const slots = [];
  if (startAt != null) slots.push(+startAt);
  for (let i = 0; i < C.memories.length; i++) if (!saved[i] && !slots.includes(i)) slots.push(i);
  for (let i = 0; i < C.memories.length; i++) if (!slots.includes(i)) slots.push(i);

  toast(list.length > 1 ? `Adding ${list.length} photos…` : "Adding photo…");
  let n = 0, failed = 0;
  for (const f of list.slice(0, slots.length)) {
    if (await addPhoto(slots[n], f)) n++; else failed++;
  }
  if (n) toast(n === 1 ? "Memory saved 📸" : `${n} memories saved 📸`);
  else if (!failed) toast("Nothing to add");
  if (n) music.blip(rand(700, 1000));
}

function buildGallery() {
  const saved = store.get("photos", {});
  $("#gallery").innerHTML = C.memories.map((m, i) => {
    const c1 = PALETTE[i % PALETTE.length], c2 = PALETTE[(i + 2) % PALETTE.length];
    const has = !!saved[i];
    return `<figure class="frame${has ? " has-photo" : ""}" data-i="${i}" style="--c1:${c1}33;--c2:${c2}33"
              title="${has ? "Click to replace this photo" : "Click to add a photo"}">
      ${has ? `<img src="${saved[i]}" alt="${esc(m.caption)}">`
            : `<span class="frame-emoji">${m.emoji}</span>`}
      <span class="frame-hint">${has ? "click to replace" : "click or drop a photo"}</span>
      ${has ? `<button class="frame-x" data-x="${i}" title="Remove this photo" aria-label="Remove photo">✕</button>` : ""}
      <figcaption class="frame-cap">${esc(m.caption)}</figcaption>
    </figure>`;
  }).join("");

  const filled = C.memories.filter((_, i) => saved[i]).length;
  $("#vaultCount").textContent = `${filled} of ${C.memories.length} frames filled`;
  $("#clearPhotosBtn").hidden = !filled;

  $$("#gallery .frame").forEach(f => {
    const i = f.dataset.i;
    f.addEventListener("dragover", e => { e.preventDefault(); f.classList.add("drag"); });
    f.addEventListener("dragleave", () => f.classList.remove("drag"));
    f.addEventListener("drop", e => {
      e.preventDefault(); f.classList.remove("drag");
      addPhotos(e.dataTransfer.files, i);
    });
    f.addEventListener("click", e => {                       // click the frame → file picker
      if (e.target.closest(".frame-x")) return;
      pickInto(i);
    });
  });
  $$("#gallery .frame-x").forEach(b =>
    b.addEventListener("click", e => { e.stopPropagation(); removePhoto(b.dataset.x); }));
}

/* one shared <input type=file>, retargeted at whichever frame asked for it */
let pickTarget = null;
function pickInto(i) { pickTarget = i; $("#filePick").value = ""; $("#filePick").click(); }

/* ══ TIMELINE ══════════════════════════════════════════════ */
function buildTimeline() {
  $("#timeline").innerHTML = C.timeline.map(t => `
    <li class="tl">
      <div class="tl-title"><span>${t.icon}</span>${t.title}</div>
      <p class="tl-text">${t.text}</p>
    </li>`).join("");
}

/* ══ WISH WALL ═════════════════════════════════════════════ */
function wishes() { return store.get("wishes", null) || C.wishes; }
function renderWishes() {
  const list = wishes();
  $("#wishWall").innerHTML = list.map((w, i) => {
    const c1 = PALETTE[i % PALETTE.length], c2 = PALETTE[(i + 3) % PALETTE.length];
    return `<article class="note" style="--c1:${c1}26;--c2:${c2}26;--rot:${(i % 2 ? 1 : -1) * rand(.4, 1.4).toFixed(2)}deg;animation-delay:${i * 50}ms">
      <button class="note-del" data-i="${i}" title="Remove">✕</button>
      <p class="note-text">${esc(w.text)}</p>
      <p class="note-who">— ${esc(w.who)}</p>
    </article>`;
  }).join("");
  $$(".note-del").forEach(b => b.addEventListener("click", () => {
    const l = wishes().slice(); l.splice(+b.dataset.i, 1); store.set("wishes", l); renderWishes(); toast("Removed");
  }));
}
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ══ MODAL ═════════════════════════════════════════════════ */
function modal(emoji, title, body) {
  $("#modalEmoji").textContent = emoji;
  $("#modalTitle").textContent = title;
  $("#modalBody").textContent = body;
  $("#modal").hidden = false;
}

/* ══ CAKE CARD: click the cake → a slice with the message iced on it ══ */
const sliceCard = (() => {
  const CX = 166, CY = 100, RX = 126, RY = 58;               // the cake's top ellipse
  const H = 94, BASE = 26;                                   // wall height, flatter base curve
  const A1 = 33, A2 = 79;                                    // the wedge that's been cut out
  const rad = d => d * Math.PI / 180;
  const f = n => n.toFixed(1);
  const on = a => [CX + Math.cos(rad(a)) * RX, CY + Math.sin(rad(a)) * RY];
  /* the ellipse's near edge, where frosting spills over the rim */
  const lip = x => CY + RY * Math.sqrt(Math.max(0, 1 - Math.pow((x - CX) / RX, 2)));
  const wedge = (a1, a2, rx, ry, cx, cy) => {
    const p = a => `${f(cx + Math.cos(rad(a)) * rx)},${f(cy + Math.sin(rad(a)) * ry)}`;
    return `M${cx},${cy} L${p(a1)} A${rx},${ry} 0 0 1 ${p(a2)} Z`;
  };

  function svg() {
    const cfg = C.cakeCard || {};

    /* piped icing pearls around the rim, skipping the gap the slice came out of */
    let pearls = "";
    for (let i = 0; i < 40; i++) {
      const a = i * 9;
      if (a > A1 - 5 && a < A2 + 5) continue;
      const [x, y] = on(a);
      pearls += `<circle cx="${f(x)}" cy="${f(y)}" r="6.2" fill="url(#pearl)"/>`;
    }

    /* frosting drips hanging off the front rim */
    const dd = [15, 33, 10, 26, 41, 13, 29, 18, 35, 11, 22];
    let drips = `M${f(CX - RX)},${CY}`;
    for (let i = 0; i < dd.length; i++) {
      const x1 = CX - RX + ((i + 1) * 2 * RX) / dd.length;
      const mid = CX - RX + ((i + .5) * 2 * RX) / dd.length;
      drips += ` Q${f(mid)},${f(lip(mid) + dd[i])} ${f(x1)},${f(lip(x1))}`;
    }
    drips += ` L${f(CX + RX)},${CY} Z`;

    /* sprinkles scattered over the frosting */
    let sprinkles = "";
    for (const [x, y, r] of [[104,74,-24],[212,78,18],[142,132,40],[206,124,-12],[118,116,8],[178,60,-38],[232,100,26]])
      sprinkles += `<rect x="${x}" y="${y}" width="11" height="3.6" rx="1.8" opacity=".85"
        fill="${PALETTE[(x + y) % PALETTE.length]}" transform="rotate(${r} ${x + 5} ${y + 2})"/>`;

    return `
<svg viewBox="0 0 340 320" role="img" aria-label="A birthday cake iced with ${esc(cfg.top || "")} ${esc(cfg.iced || "")}">
  <defs>
    <linearGradient id="frost" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff4f8"/><stop offset="1" stop-color="#ffd4e3"/>
    </linearGradient>
    <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#8a5236"/><stop offset=".26" stop-color="#7a4630"/>
      <stop offset=".26" stop-color="#fff0e2"/><stop offset=".40" stop-color="#ffdfc2"/>
      <stop offset=".40" stop-color="#8a5236"/><stop offset=".66" stop-color="#6d3d29"/>
      <stop offset=".66" stop-color="#fff0e2"/><stop offset=".80" stop-color="#ffdfc2"/>
      <stop offset=".80" stop-color="#7a4630"/><stop offset="1" stop-color="#5a3120"/>
    </linearGradient>
    <linearGradient id="crumb" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f6dcc2"/><stop offset="1" stop-color="#d8b291"/>
    </linearGradient>
    <radialGradient id="pearl" cx=".35" cy=".3">
      <stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#ffb3cf"/>
    </radialGradient>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="12" stdDeviation="12" flood-color="#160818" flood-opacity=".5"/>
    </filter>
  </defs>

  <ellipse cx="168" cy="236" rx="142" ry="20" fill="rgba(0,0,0,.32)"/>

  <g filter="url(#soft)">
    <!-- side wall: layers of sponge and cream -->
    <path d="M${f(CX - RX)},${CY} L${f(CX - RX)},${CY + H}
             A${RX},${BASE} 0 0 0 ${f(CX + RX)},${CY + H} L${f(CX + RX)},${CY} Z" fill="url(#wall)"/>
    <!-- frosting spilling over the rim -->
    <path d="${drips}" fill="url(#frost)"/>
    <!-- frosted top -->
    <ellipse cx="${CX}" cy="${CY}" rx="${RX}" ry="${RY}" fill="url(#frost)"/>
    <!-- the cut: exposed sponge where the slice was lifted out -->
    <path d="${wedge(A1, A2, RX, RY, CX, CY)}" fill="url(#crumb)"/>
    <path d="${wedge(A1, A2, RX, RY, CX, CY)}" fill="none" stroke="rgba(150,95,65,.45)" stroke-width="1.6"/>
    ${pearls}${sprinkles}
    <!-- the message, piped on in icing -->
    <text class="ice-top" x="${CX}" y="${CY - 30}" text-anchor="middle">${esc(cfg.top || "Happy Birthday")}</text>
    <text class="ice-name" x="${CX}" y="${CY + 6}" text-anchor="middle">${esc(cfg.iced || C.name)}</text>
    <text class="ice-sub" x="${CX}" y="${CY + 32}" text-anchor="middle">${esc(cfg.sub || "")}</text>
  </g>

  <!-- the piece, on its own plate -->
  <g transform="translate(196,196)">
    <ellipse cx="40" cy="56" rx="88" ry="20" fill="rgba(255,255,255,.12)"/>
    <ellipse cx="40" cy="56" rx="88" ry="20" fill="none" stroke="rgba(255,255,255,.18)"/>
    <path d="${wedge(A1 - 14, A2 - 14, 86, 46, 0, 6)}" transform="translate(0,22)" fill="#5a3120"/>
    <path d="${wedge(A1 - 14, A2 - 14, 86, 46, 0, 6)}" transform="translate(0,15)" fill="#fff0e2"/>
    <path d="${wedge(A1 - 14, A2 - 14, 86, 46, 0, 6)}" transform="translate(0,8)"  fill="#8a5236"/>
    <path d="${wedge(A1 - 14, A2 - 14, 86, 46, 0, 6)}" fill="url(#frost)" stroke="rgba(190,120,150,.45)" stroke-width="1.5"/>
    <circle cx="40" cy="32" r="7.5" fill="#ff5f86"/>
    <circle cx="37.5" cy="29.5" r="2.4" fill="rgba(255,255,255,.65)"/>
    <path d="M40,25 q5,-10 12,-12" stroke="#4f7a3a" stroke-width="2.6" fill="none" stroke-linecap="round"/>
  </g>
</svg>`;
  }

  function open() {
    const cfg = C.cakeCard || {};
    $("#sliceStage").innerHTML = svg();
    $("#sliceTitle").textContent = cfg.title || "A piece, just for you.";
    $("#sliceMsg").textContent = cfg.message || "";
    $("#sliceModal").hidden = false;
    music.blip(880);
    const r = $("#cake").getBoundingClientRect();
    fx.burst(r.left + r.width / 2, r.top + r.height / 2, 46, 13, "circle");
  }
  function close() { $("#sliceModal").hidden = true; }
  return { open, close };
})();

/* ══ SCROLL REVEAL ═════════════════════════════════════════ */
function reveal() {
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { threshold: .12 });
  $$(".reveal").forEach(el => io.observe(el));
}

/* ══ EASTER EGG ════════════════════════════════════════════ */
(function egg() {
  const SECRET = "prajna"; let buf = "";
  addEventListener("keydown", e => {
    if (e.target.matches("input, textarea")) return;
    if (e.key.length !== 1) return;
    buf = (buf + e.key.toLowerCase()).slice(-SECRET.length);
    if (buf === SECRET) {
      buf = "";
      fx.show(22); fx.rain(240);
      document.body.classList.add("shake");
      setTimeout(() => document.body.classList.remove("shake"), 600);
      modal("👑", "You found it.",
        `The whole dashboard was already yours, ${C.name} — but this part is extra. Happy birthday. Genuinely.`);
    }
  });
})();

/* ══ BOOT ══════════════════════════════════════════════════ */
const BUILD = 7;
window.__build = BUILD;
console.log(`[dashboard] build ${BUILD} loaded — upload, cake card and mic fixes are active`);
/* type __vault() in the console to see what the memory vault thinks is going on */
window.__vault = () => {
  const photos = store.get("photos", {});
  const chars = JSON.stringify(photos).length;
  return {
    input: !!$("#filePick"),
    inputVisible: $("#filePick") ? getComputedStyle($("#filePick")).display !== "none" : false,
    frames: $$("#gallery .frame").length,
    imgsInDom: $$("#gallery .frame img").length,
    stored: Object.keys(photos).map(k => `${k}: ${(photos[k].length / 1024) | 0}KB`),
    totalKB: (chars / 1024) | 0,
    pickTarget,
  };
};

function boot() {
  /* each step is isolated — one broken section shouldn't take the rest of the page down */
  for (const [name, fn] of [
    ["typewriter", () => typewriter($("#typewriter"), C.taglines)],
    ["stats",      () => buildStats()],
    ["cake",       () => cake.build()],
    ["gallery",    () => buildGallery()],
    ["jubilee",    () => buildJubilee()],
    ["timeline",   () => buildTimeline()],
    ["wishes",     () => renderWishes()],
    ["reveal",     () => reveal()],
    ["reasons",    () => window.nextReason()],
  ]) {
    try { fn(); } catch (err) { console.error(`[dashboard] ${name} failed:`, err); }
  }
  setInterval(balloon, 1800);
  for (let i = 0; i < 5; i++) setTimeout(balloon, i * 400);

  const tick = () => {
    const d = new Date();
    $("#clock").textContent = d.toLocaleTimeString("en-GB", { hour12: false });
  };
  tick(); setInterval(tick, 1000);
}

/* ══ WIRING ════════════════════════════════════════════════ */
document.body.classList.add("locked");
// visit http://localhost:8000/?open to skip straight past the gift intro
if (/[?&](open|skip)\b/.test(location.search)) {
  $("#veil").remove(); $("#app").hidden = false;
  document.body.classList.remove("locked"); opened = true; boot();
} else {
  $("#openBtn").addEventListener("click", openGift);
  $("#gift").addEventListener("click", openGift);
  $("#gift").addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openGift(); }
  });
}

$("#partyBtn").addEventListener("click", e => {
  const r = e.currentTarget.getBoundingClientRect();
  fx.burst(r.left + r.width / 2, r.bottom, 80, 16); fx.rain(90);
});
$("#wishBtn").addEventListener("click", () => {
  document.querySelector(".cake-card").scrollIntoView({ behavior: "smooth", block: "center" });
  setTimeout(() => cake.blowAll(), 700);
});
$("#scrollBtn").addEventListener("click", () => $("#stats").scrollIntoView({ behavior: "smooth" }));
$("#cake").addEventListener("click", () => sliceCard.open());   // the candles handle their own clicks

/* ── memory vault controls ── */
$("#uploadBtn").addEventListener("click", () => { pickTarget = null; $("#filePick").value = ""; });
function onPicked(e) {
  const files = [...e.target.files];
  console.log("[vault] picked", files.length, files.map(f => `${f.name} (${f.type || "unknown type"}, ${f.size / 1024 | 0}KB)`));
  if (!files.length) return;
  addPhotos(e.target.files, pickTarget);
  pickTarget = null;                       // the value is cleared when the picker is next opened
}
$("#filePick").addEventListener("change", onPicked);
$("#clearPhotosBtn").addEventListener("click", () => {
  if (!Object.keys(store.get("photos", {})).length) return;
  savePhotos({}); buildGallery(); toast("Memory vault cleared");
});

/* ── cake card ── */
$("#sliceClose").addEventListener("click", () => sliceCard.close());
$("#sliceModal").addEventListener("click", e => { if (e.target.id === "sliceModal") sliceCard.close(); });
addEventListener("keydown", e => {
  if (e.key !== "Escape") return;
  sliceCard.close(); $("#modal").hidden = true;
});
$("#micBtn").addEventListener("click", () => cake.mic());
$("#relightBtn").addEventListener("click", () => cake.relight());
$("#reasonBtn").addEventListener("click", () => window.nextReason());
$("#modalClose").addEventListener("click", () => ($("#modal").hidden = true));
$("#modal").addEventListener("click", e => { if (e.target.id === "modal") $("#modal").hidden = true; });
addEventListener("keydown", e => { if (e.key === "Escape") $("#modal").hidden = true; });

$("#wishForm").addEventListener("submit", e => {
  e.preventDefault();
  const who = $("#wishName").value.trim(), text = $("#wishText").value.trim();
  if (!who || !text) return;
  const l = wishes().slice(); l.unshift({ who, text }); store.set("wishes", l);
  $("#wishText").value = ""; renderWishes();
  fx.burst(innerWidth / 2, innerHeight * .75, 60, 14);
  music.blip(1200); toast("Wish added to the wall 💌");
});

// title flicker for fun
let tflip = false;
setInterval(() => { document.title = (tflip = !tflip) ? "🎂 Happy Birthday, Prajna ✨" : "✨ Prajna's Dashboard 🎈"; }, 3000);
})();
