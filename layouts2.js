/* Bemutató Gyár – 2. sorozat: 10 látványos, animációra épülő főoldal-felépítés (11–20).
   Közös eszköztár (FX): nyitófüggöny, görgetésjelző, kosárba repülő kép, szavanként beúszó címek, kitakarásos képek,
   görgetéshez kötött effektek egyetlen rAF-hurokban, 3D-dőlés, számlálók, konfetti, saját kurzor.
   Minden effekt a FX.cleanup()-pal áll le oldalváltáskor (app.js route → LX_CLEANUP). „Csökkentett mozgás” beállításnál nyugodt. */
'use strict';

window.LAYOUT_META2 = {
  folyam: { name: 'Folyam', desc: 'A görgetés vízszintes utazássá válik: szakaszok, parallax rétegek, lebegő termékek.', light: false, shopView: 'kor' },
  vaszon: { name: 'Vászon', desc: 'Rögzített filmvászon: görgetésre jelenetváltás zoommal, filmszalag-sávok, szemcse, számláló.', light: false, shopView: 'kor' },
  kinetika: { name: 'Kinetika', desc: 'Mozgó tipográfia: az egér elől szétrebbenő betűk, görgetésre gyorsuló futószalagok, kigyulladó szöveg.', light: false, shopView: 'racs' },
  osveny: { name: 'Ösvény', desc: 'Görgetésre kirajzolódó kanyargós ösvény, világító pont, felgyulladó állomások.', light: false, shopView: 'kor' },
  terbento: { name: 'Térbento', desc: 'A csempék 3D-ben repülnek a helyükre, egérre dőlnek csillanással, a képek váltakoznak.', light: false, shopView: 'racs' },
  kepvalto: { name: 'Képváltó', desc: 'Osztott képernyő: a nagy kép görgetésre, kitakarással vált a tartalomhoz igazodva.', light: false, shopView: 'racs' },
  jatszoter: { name: 'Játszótér', desc: 'Dobálható, rugózó kártyák, színes egérnyom, konfetti a kosárnál.', light: true, shopView: 'racs' },
  vegtelen: { name: 'Végtelen fal', desc: 'Eltérő sebességgel úszó mozaikoszlopok, nagyítós képnézegető.', light: false, shopView: 'racs' },
  reflektor: { name: 'Reflektor', desc: 'Sötét színpad: az egér fénykört mozgat, ami megvilágítja és megnevezi a termékeket.', light: false, shopView: 'racs' },
  pakli: { name: 'Pakli', desc: 'Egymásra csúszó teljes képernyős kártyák, a végén térbeli termék-lapozó.', light: false, shopView: 'kor' },
};
Object.assign(window.LAYOUT_META, window.LAYOUT_META2);

/* ===================== FX eszköztár ===================== */
const FX = {
  reduce: matchMedia('(prefers-reduced-motion: reduce)').matches,
  fine: matchMedia('(pointer: fine)').matches,
  _c: [], _t: [], _raf: 0, _io: null,
  clamp: (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)),
  on(el, ev, fn, o) { el.addEventListener(ev, fn, o); this._c.push(() => el.removeEventListener(ev, fn, o)); },
  every(fn, ms) { const t = setInterval(fn, ms); this._c.push(() => clearInterval(t)); },
  later(fn, ms) { const t = setTimeout(fn, ms); this._c.push(() => clearTimeout(t)); },
  add(el) { this._c.push(() => el.remove()); return el; },
  tick(fn) {
    this._t.push(fn);
    if (!this._raf) { const loop = (t) => { for (const f of this._t) { try { f(t); } catch (e) { /* egy effekt hibája ne állítsa le a többit */ } } this._raf = requestAnimationFrame(loop); }; this._raf = requestAnimationFrame(loop); }
  },
  cleanup() { for (const f of this._c.splice(0)) { try { f(); } catch { /* */ } } this._t = []; cancelAnimationFrame(this._raf); this._raf = 0; if (this._io) this._io.disconnect(); this._io = null; document.documentElement.style.removeProperty('--lx-vel'); },
  /** elem görgetési helyzete: 0 = alulról épp belép, 1 = felül épp kilép */
  prog(el) { const r = el.getBoundingClientRect(); return this.clamp((innerHeight - r.top) / (innerHeight + r.height)); },
  /** rögzített (sticky) szakasz előrehaladása 0..1 */
  span(el) { const r = el.getBoundingClientRect(); return this.clamp(-r.top / Math.max(1, r.height - innerHeight)); },
  /** szavakra / betűkre bontás a belső elemek (pl. <em>) megtartásával */
  split(el, mode = 'w') {
    if (!el || el.dataset.split) return []; el.dataset.split = 1;
    let i = 0; const out = [];
    const walk = (node) => {
      for (const n of [...node.childNodes]) {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          for (const part of n.textContent.split(/(\s+)/)) {
            if (!part) continue;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); continue; }
            const w = document.createElement('span'); w.className = 'fx-w';
            if (mode === 'c') for (const ch of part) { const c = document.createElement('span'); c.className = 'fx-c'; c.style.setProperty('--i', i++); c.textContent = ch; w.appendChild(c); out.push(c); }
            else { const s = document.createElement('span'); s.className = 'fx-wi'; s.style.setProperty('--i', i++); s.textContent = part; w.appendChild(s); out.push(s); }
            frag.appendChild(w);
          }
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      }
    };
    walk(el);
    return out;
  },
  /** [data-fx] elemek megjelenítése, amikor a képbe érnek */
  reveal(root = document) {
    this._io = this._io || new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('fx-in'); this._io.unobserve(e.target); } }), { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    $$('[data-fx]:not(.fx-in)', root).forEach((el) => { const r = el.getBoundingClientRect(); if (this.reduce || (r.top < innerHeight * 0.92 && r.bottom > 0)) el.classList.add('fx-in'); else this._io.observe(el); });
  },
  tilt(nodes, max = 9) {
    if (!this.fine || this.reduce) return;
    nodes.forEach((el) => {
      this.on(el, 'pointermove', (e) => { const r = el.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height; el.style.setProperty('--rx', ((0.5 - y) * max).toFixed(2) + 'deg'); el.style.setProperty('--ry', ((x - 0.5) * max).toFixed(2) + 'deg'); el.style.setProperty('--gx', (x * 100).toFixed(1) + '%'); el.style.setProperty('--gy', (y * 100).toFixed(1) + '%'); });
      this.on(el, 'pointerleave', () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
    });
  },
  count(el) { const to = +el.dataset.to || 0; if (this.reduce || !to) { el.textContent = to; return; } const t0 = performance.now(); const f = (t) => { const k = this.clamp((t - t0) / 1600); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 4))); if (k < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); },
  magnet(nodes) { if (!this.fine || this.reduce) return; nodes.forEach((b) => { this.on(b, 'pointermove', (e) => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`; }); this.on(b, 'pointerleave', () => { b.style.transform = ''; }); }); },
  cursor() {
    if (!this.fine || this.reduce) return;
    const c = this.add(Object.assign(document.createElement('div'), { className: 'fx-cursor' })); document.body.appendChild(c);
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
    this.on(window, 'pointermove', (e) => { x = e.clientX; y = e.clientY; c.classList.toggle('big', !!e.target.closest('a, button, .lx2-hot')); }, { passive: true });
    this.tick(() => { cx += (x - cx) * 0.2; cy += (y - cy) * 0.2; c.style.transform = `translate(${cx}px, ${cy}px)`; });
  },
  grain() { const c = document.createElement('canvas'); c.width = c.height = 140; const x = c.getContext('2d'); const d = x.createImageData(140, 140); for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 22; } x.putImageData(d, 0, 0); return c.toDataURL(); },
  confetti(x, y, n = 110) {
    if (this.reduce) return;
    const cv = document.createElement('canvas'); cv.className = 'fx-confetti'; cv.width = innerWidth * devicePixelRatio; cv.height = innerHeight * devicePixelRatio; document.body.appendChild(cv);
    const g = cv.getContext('2d'); g.scale(devicePixelRatio, devicePixelRatio);
    const cols = ['#ff7a59', '#ffd23f', '#3bceac', '#5d9cec', '#ee4266', '#9b5de5'];
    const ps = Array.from({ length: n }, () => ({ x, y, vx: (Math.random() - 0.5) * 13, vy: -Math.random() * 13 - 3, r: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.4, s: 5 + Math.random() * 6, c: cols[Math.random() * cols.length | 0] }));
    const t0 = performance.now();
    const f = (t) => { g.clearRect(0, 0, innerWidth, innerHeight); for (const p of ps) { p.vy += 0.38; p.vx *= 0.985; p.x += p.vx; p.y += p.vy; p.r += p.vr; g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.fillStyle = p.c; g.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); g.restore(); } if (t - t0 < 2600) requestAnimationFrame(f); else cv.remove(); };
    requestAnimationFrame(f);
  },
  /** a termékkép a kosárba repül */
  fly(btn) {
    if (this.reduce) return;
    const scope = btn.closest('.card, .lx2-p, .kt-row, .ring-info, .pd, article, .fo-prod, .rf-it, .vg-box, .pk-cf') || document;
    const im = $('img', scope.classList && scope.classList.contains('ring-info') ? $('.ring-card.front') || scope : scope) || $('.gallery .main img');
    const cartB = $('#cartBtn'); if (!im || !cartB) return;
    const a = im.getBoundingClientRect(), b = cartB.getBoundingClientRect();
    const ghost = im.cloneNode(); ghost.className = 'fx-fly'; Object.assign(ghost.style, { left: a.left + 'px', top: a.top + 'px', width: a.width + 'px', height: a.height + 'px' });
    document.body.appendChild(ghost);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
    ghost.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 120}px) scale(.55)`, opacity: 1, offset: 0.55 }, { transform: `translate(${dx}px, ${dy}px) scale(.08)`, opacity: 0.4 }], { duration: 850, easing: 'cubic-bezier(.5,0,.3,1)' }).onfinish = () => ghost.remove();
  },
  intro() {
    if (window.__lx2Intro || this.reduce || /[?&]thumb=1/.test(location.search)) return; window.__lx2Intro = true;
    const d = document.createElement('div'); d.className = 'fx-intro'; d.innerHTML = `<b>${esc(C.name)}</b><i></i>`; document.body.appendChild(d);
    this.split($('b', d), 'c');
    setTimeout(() => d.classList.add('go'), 1150); setTimeout(() => d.remove(), 2100);
  },
  progressBar() { const b = this.add(Object.assign(document.createElement('div'), { className: 'fx-progress' })); document.body.appendChild(b); this.tick(() => { const h = document.documentElement.scrollHeight - innerHeight; b.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`; }); },
  /** görgetési sebesség (a futószalagok és dőlések ehhez igazodnak) */
  velocity() { let last = scrollY, v = 0; this.tick(() => { const d = scrollY - last; last = scrollY; v += (d - v) * 0.12; document.documentElement.style.setProperty('--lx-vel', v.toFixed(2)); }); return () => v; },
};
window.LX_CLEANUP = () => FX.cleanup();

// a kosár gombjai: repülő kép (minden 2. sorozatbeli felépítésnél), a Játszótéren konfetti is
document.addEventListener('click', (e) => {
  const a = e.target.closest('[data-add]'); if (!a || !window.LAYOUT_META2[typeof LY === 'function' && C ? LY() : '']) return;
  FX.fly(a);
  if (LY() === 'jatszoter') FX.confetti(e.clientX, e.clientY);
}, true);

/** közös indítás minden 2. sorozatbeli felépítésnél */
function lx2Start(extra) {
  setTimeout(() => {
    if (!$('.lx2')) return;
    FX.intro(); FX.progressBar();
    $$('[data-split]').forEach((el) => FX.split(el, el.dataset.split === 'c' ? 'c' : 'w'));
    FX.reveal(); FX.magnet($$('.lx2 .btn'));
    $$('.lx2 [data-to]').forEach((el) => { const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { FX.count(el); io.disconnect(); } }); io.observe(el); FX._c.push(() => io.disconnect()); });
    extra && extra();
  }, 30);
}
const LX2 = {
  P: () => LX.pics(),
  sc: () => LX.scenes(),
  addBtn: (p) => (needsChoice(p) ? `<a class="btn btn-gold" href="#/termek/${p.slug}">Kiválasztom</a>` : `<button class="btn btn-gold" data-add="${p.id}">${L_('addShort', 'Kosárba')}</button>`),
  t: (s) => esc(String(s || '').replace(/<[^>]+>/g, '')),
  needImgs(s) { const ps = S.products.filter((p) => has(p, s.cats)); return [s.img, ...LX.scenes()].filter(Boolean); },
};

/* ===================== 11. FOLYAM – vízszintes utazás ===================== */
LAYOUTS.folyam = function () {
  const P = LX2.P(), H = C.hero;
  lx2Start(() => {
    const sec = $('.fo-pin'), track = $('.fo-track'); if (!sec || !track) return;
    const flat = () => innerWidth < 760 || FX.reduce;
    const size = () => { if (flat()) { sec.style.height = ''; track.style.transform = ''; return; } sec.style.height = (track.scrollWidth - innerWidth + innerHeight) + 'px'; };
    size(); FX.on(window, 'resize', size);
    const pars = $$('.fo-par', track);
    FX.tick(() => {
      if (flat()) return;
      const p = FX.span(sec), x = p * (track.scrollWidth - innerWidth);
      track.style.transform = `translate3d(${-x}px,0,0)`;
      $('.fo-bar i').style.transform = `scaleX(${p})`;
      for (const el of pars) { const r = el.parentElement.getBoundingClientRect(); el.style.transform = `translate3d(${((r.left + r.width / 2) - innerWidth / 2) * -0.12}px,0,0) scale(1.15)`; }
    });
  });
  return `<div class="lx2 fo">
    <section class="fo-pin"><div class="fo-stage"><div class="fo-track">
      <article class="fo-panel fo-hero"><div class="fo-bgw"><div class="fo-par" style="background-image:url(${LX.hero()})"></div></div>
        <div class="fo-copy"><span class="pill"><span class="dot"></span>${fill(H.pill)}</span><h1 data-split="c">${fill(H.title)}</h1><p class="lead" data-fx>${fill(H.lead)}</p><div class="hero-cta" data-fx>${LX.cta()}</div><span class="fo-hint">görgess → az utazás oldalra visz</span></div></article>
      ${SKINS.slice(0, 6).map((s, i) => `<a class="fo-panel fo-need" href="#/${NR}/${s.k}"><div class="fo-bgw"><div class="fo-par" style="background-image:url(${s.img})"></div></div><div class="fo-nc"><span class="fo-n">${String(i + 1).padStart(2, '0')}</span><h2>${esc(s.name)}</h2><p>${esc(s.d)}</p><span class="link-more">${LX.needN(s)} ${L_('itemWord', 'termék')} →</span></div></a>`).join('')}
      <article class="fo-panel fo-prods"><h2>Válogatás</h2><div class="fo-pgrid">${P.slice(0, 8).map((p, i) => `<a class="fo-prod lx2-p" href="#/termek/${p.slug}" style="--d:${(i % 4) * 0.4}s"><img src="${pimg(p)}" alt=""><b>${esc(p.name)}</b><em>${pft(p)}</em></a>`).join('')}</div></article>
      ${C.quote ? `<article class="fo-panel fo-quote"><p>${fill(C.quote)}</p><div class="hero-cta">${LX.contact()}</div></article>` : ''}
    </div><div class="fo-bar"><i></i></div></div></section>
    <section class="sec wrap">${head('', 'A teljes kínálat', '')}<div class="ring-slot" data-lx="0"></div></section>
    <section class="sec wrap"><div class="perks">${LX.perks()}</div></section>
  </div>${(LX.rings([S.products]), '')}`;
};

/* ===================== 12. VÁSZON – filmszerű jelenetek ===================== */
LAYOUTS.vaszon = function () {
  const sc = LX2.sc();
  const scenes = [{ img: LX.hero(), k: fill(C.hero.pill), t: fill(C.hero.title), d: fill(C.hero.lead), cta: LX.cta() },
    ...SKINS.slice(0, 5).map((s, i) => ({ img: s.img || sc[i % sc.length], k: `${LX.needN(s)} ${L_('itemWord', 'termék')}`, t: esc(s.name), d: esc(s.d), cta: `<a class="btn btn-gold" href="#/${NR}/${s.k}">Megnézem →</a>` })),
    ...(C.quote ? [{ img: sc[1] || LX.hero(), k: esc(C.name), t: fill(C.quote), d: '', cta: LX.contact() }] : [])];
  const n = scenes.length;
  lx2Start(() => {
    const sec = $('.vz'), layers = $$('.vz-l'), texts = $$('.vz-t'); if (!sec) return;
    $('.vz-grain').style.backgroundImage = `url(${FX.grain()})`;
    FX.tick(() => {
      const f = FX.span(sec) * (n - 1);
      layers.forEach((l, i) => { const d = f - i, a = FX.clamp(1 - Math.abs(d) * 1.25); l.style.opacity = a; l.style.transform = `scale(${1.18 - 0.18 * FX.clamp(1 - Math.abs(d))})`; l.style.zIndex = a > 0.5 ? 2 : 1; });
      texts.forEach((t, i) => { const d = f - i; t.style.opacity = FX.clamp(1 - Math.abs(d) * 2.2); t.style.transform = `translateY(${d * -90}px)`; t.style.pointerEvents = Math.abs(d) < 0.3 ? 'auto' : 'none'; });
      $('.vz-count b').textContent = String(Math.round(f) + 1).padStart(2, '0');
      $('.vz-prog i').style.transform = `scaleX(${f / (n - 1)})`;
    });
  });
  return `<div class="lx2 vz" style="height:${n * 100}vh"><div class="vz-stage">
      ${scenes.map((s) => `<div class="vz-l" style="background-image:url(${s.img})"></div>`).join('')}
      <div class="vz-shade"></div><div class="vz-grain"></div><div class="vz-bar top"></div><div class="vz-bar bot"></div>
      ${scenes.map((s) => `<div class="vz-t wrap"><span class="sec-num">${s.k}</span><h1>${s.t}</h1>${s.d ? `<p class="lead">${s.d}</p>` : ''}<div class="hero-cta">${s.cta}</div></div>`).join('')}
      <div class="vz-count"><b>01</b> / ${String(n).padStart(2, '0')}</div><div class="vz-prog"><i></i></div>
    </div></div>
    <section class="sec wrap">${head('', 'A teljes kínálat', '')}<div class="ring-slot" data-lx="0"></div></section>${(LX.rings([S.products]), '')}`;
};

/* ===================== 13. KINETIKA – mozgó tipográfia ===================== */
LAYOUTS.kinetika = function () {
  const P = LX2.P(), words = [...SKINS.map((s) => s.name), ...BRANDS.map((b) => b.name)];
  const band = (dir, i) => `<div class="kn-band" data-dir="${dir}"><div class="kn-row">${[...words, ...words, ...words].map((w) => `<span>${esc(w)}</span><i>✦</i>`).join('')}</div></div>`;
  lx2Start(() => {
    const chars = FX.split($('.kn-title'), 'c'); let mx = -9999, my = -9999;
    FX.on(window, 'pointermove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
    const pos = chars.map(() => ({ x: 0, y: 0 }));
    const vel = FX.velocity();
    const rows = $$('.kn-band').map((b) => ({ el: $('.kn-row', b), dir: +b.dataset.dir, x: 0 }));
    const scrub = FX.split($('.kn-scrub'), 'w'), scrubSec = $('.kn-scrubw');
    const lines = $$('.kn-line'), flo = $('.kn-float');
    FX.tick(() => {
      if (FX.fine && !FX.reduce) chars.forEach((c, i) => { const r = c.getBoundingClientRect(), cx = r.left + r.width / 2 - pos[i].x, cy = r.top + r.height / 2 - pos[i].y; const dx = cx - mx, dy = cy - my, d = Math.hypot(dx, dy), f = Math.max(0, 1 - d / 170); const tx = (dx / (d || 1)) * f * 46, ty = (dy / (d || 1)) * f * 46; pos[i].x += (tx - pos[i].x) * 0.18; pos[i].y += (ty - pos[i].y) * 0.18; c.style.transform = `translate(${pos[i].x.toFixed(1)}px, ${pos[i].y.toFixed(1)}px) rotate(${(pos[i].x * 0.4).toFixed(1)}deg)`; });
      const v = vel();
      for (const r of rows) { r.x -= (1.1 + Math.abs(v) * 0.6) * r.dir * (v < 0 ? -1 : 1); const w = r.el.scrollWidth / 3; if (r.x < -w) r.x += w; if (r.x > 0) r.x -= w; r.el.style.transform = `translate3d(${r.x}px,0,0) skewX(${FX.clamp(v * -0.6, -14, 14)}deg)`; }
      if (scrubSec) { const p = FX.clamp((FX.prog(scrubSec) - 0.2) / 0.55); const lit = Math.round(p * scrub.length); scrub.forEach((w, i) => w.classList.toggle('lit', i < lit)); }
    });
    lines.forEach((l) => { FX.on(l, 'pointerenter', () => { flo.style.backgroundImage = `url(${l.dataset.img})`; flo.classList.add('on'); }); FX.on(l, 'pointerleave', () => flo.classList.remove('on')); });
    FX.on(window, 'pointermove', (e) => { flo.style.transform = `translate(${e.clientX + 24}px, ${e.clientY - 120}px)`; }, { passive: true });
  });
  return `<div class="lx2 kn">
    <section class="kn-hero wrap"><span class="sec-num">${esc(C.name)}</span><h1 class="kn-title">${fill(C.hero.title)}</h1><p class="lead" data-fx>${fill(C.hero.lead)}</p><div class="hero-cta" data-fx>${LX.cta()}</div><small class="muted kn-tip">mozgasd az egeret a cím fölött</small></section>
    ${band(1, 0)}${band(-1, 1)}
    <section class="kn-scrubw wrap"><p class="kn-scrub">${LX2.t(C.quote || '')} ${LX2.t(C.hero.lead)}</p></section>
    <section class="wrap kn-lines">${BRANDS.concat(SKINS).slice(0, 8).map((b) => { const isLine = !!b.tag; const ps = isLine ? LX.lineP(b) : S.products.filter((p) => has(p, b.cats)); return `<a class="kn-line" href="${isLine ? '#/marka/' + b.k : '#/' + NR + '/' + b.k}" data-img="${isLine ? pimg(ps[0] || {}) : b.img}"><span>${esc(b.name)}</span><sup>${ps.length}</sup></a>`; }).join('')}</section>
    <div class="kn-float"></div>
    <section class="sec wrap"><div class="kn-stickers">${P.slice(0, 10).map((p, i) => `<a class="kn-st lx2-p" href="#/termek/${p.slug}" style="--r:${(i % 2 ? 1 : -1) * (3 + (i * 7) % 9)}deg"><img src="${pimg(p)}" alt=""><b>${pft(p)}</b></a>`).join('')}</div></section>
    ${band(1, 2)}
  </div>`;
};

/* ===================== 14. ÖSVÉNY – kirajzolódó idővonal ===================== */
LAYOUTS.osveny = function () {
  const st = [...LX.steps().map((s) => ({ t: s.t, d: s.d, img: img(s.img), href: '#/termekek' })), ...SKINS.slice(0, 4).map((s) => ({ t: s.name, d: s.d, img: s.img, href: `#/${NR}/${s.k}` }))].slice(0, 8);
  const sc = LX2.sc();
  lx2Start(() => {
    const box = $('.ov-path'), svg = $('svg', box), path = $('path.ov-line', svg), glow = $('path.ov-glow', svg), dot = $('.ov-dot'), stations = $$('.ov-st');
    let len = 0;
    const build = () => {
      const br = box.getBoundingClientRect(), pts = stations.map((s) => { const r = $('.ov-pin', s).getBoundingClientRect(); return [r.left - br.left + r.width / 2, r.top - br.top + r.height / 2]; });
      if (!pts.length) return;
      let d = `M ${br.width / 2} 0 C ${br.width / 2} ${pts[0][1] * 0.5}, ${pts[0][0]} ${pts[0][1] * 0.5}, ${pts[0][0]} ${pts[0][1]}`;
      for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], my = (y0 + y1) / 2; d += ` C ${x0} ${my}, ${x1} ${my}, ${x1} ${y1}`; }
      svg.setAttribute('viewBox', `0 0 ${br.width} ${br.height}`); path.setAttribute('d', d); glow.setAttribute('d', d);
      len = path.getTotalLength(); for (const p of [path, glow]) { p.style.strokeDasharray = len; }
    };
    build(); FX.on(window, 'resize', build); FX.later(build, 800);
    FX.tick(() => {
      if (!len) return;
      const r = box.getBoundingClientRect(), p = FX.clamp((innerHeight * 0.62 - r.top) / r.height), L = len * p;
      path.style.strokeDashoffset = len - L; glow.style.strokeDashoffset = len - L;
      const pt = path.getPointAtLength(L); dot.style.transform = `translate(${pt.x}px, ${pt.y}px)`;
      stations.forEach((s) => { const pr = $('.ov-pin', s).getBoundingClientRect(); s.classList.toggle('on', pr.top - r.top <= pt.y + 4); });
    });
  });
  return `<div class="lx2 ov">
    <section class="ov-hero" style="background-image:url(${LX.hero()})"><div class="wrap"><span class="pill"><span class="dot"></span>${fill(C.hero.pill)}</span><h1 data-split="w">${fill(C.hero.title)}</h1><p class="lead" data-fx>${fill(C.hero.lead)}</p><div class="hero-cta" data-fx>${LX.cta()}</div></div><div class="scroll-hint">kövesd az ösvényt<i></i></div></section>
    <section class="wrap ov-path"><svg class="ov-svg" preserveAspectRatio="none"><path class="ov-glow"/><path class="ov-line"/></svg><span class="ov-dot"></span>
      ${st.map((s, i) => `<div class="ov-st ${i % 2 ? 'r' : 'l'}"><span class="ov-pin">${String(i + 1).padStart(2, '0')}</span><a class="ov-card" href="${s.href}"><div class="ph" style="background-image:url(${s.img || sc[i % sc.length]})"></div><div><h3>${esc(s.t)}</h3><p>${esc(s.d)}</p></div></a></div>`).join('')}
    </section>
    <section class="sec wrap">${head('', 'Az ösvény végén: a kínálat', '')}<div class="ring-slot" data-lx="0"></div></section>${(LX.rings([S.products]), '')}
  </div>`;
};

/* ===================== 15. TÉRBENTO – 3D csempék ===================== */
LAYOUTS.terbento = function () {
  const P = LX2.P(), sc = LX2.sc(), st = C.stats || [];
  const tiles = [
    `<div class="tb-t tb-hero" style="background-image:url(${LX.hero()})"><div><span class="pill"><span class="dot"></span>${fill(C.hero.pill)}</span><h1 data-split="w">${fill(C.hero.title)}</h1><div class="hero-cta">${LX.cta()}</div></div></div>`,
    ...SKINS.slice(0, 4).map((s, i) => `<a class="tb-t tb-need" href="#/${NR}/${s.k}" data-imgs="${esc(JSON.stringify([s.img, ...sc.filter((x) => x !== s.img)].slice(0, 4)))}"><span class="tb-a" style="background-image:url(${s.img})"></span><span class="tb-b"></span><span class="pill count">${LX.needN(s)}</span><h3>${esc(s.name)}</h3></a>`),
    ...P.slice(0, 6).map((p) => `<a class="tb-t tb-prod lx2-p" href="#/termek/${p.slug}"><img src="${pimg(p)}" alt="" loading="lazy"><b>${esc(p.name)}</b><em>${pft(p)}</em></a>`),
    ...st.slice(0, 2).map((x) => `<div class="tb-t tb-stat"><b data-to="${+fill(x.n) || 0}">0</b><span>${fill(x.label)}</span></div>`),
    C.quote ? `<div class="tb-t tb-quote"><p class="tb-type" data-text="${esc(String(fill(C.quote)).replace(/<[^>]+>/g, ''))}"></p></div>` : '',
    ...BRANDS.slice(0, 2).map((b) => `<a class="tb-t tb-line" href="#/marka/${b.k}"><span class="sec-num">${LX.lineP(b).length} ${L_('itemWord', 'termék')}</span><h3>${esc(b.name)}</h3><p>${esc(b.tag)}</p></a>`),
  ].filter(Boolean);
  lx2Start(() => {
    const ts = $$('.tb-t');
    ts.forEach((t, i) => { t.style.setProperty('--fx', `${(Math.random() - 0.5) * 900}px`); t.style.setProperty('--fy', `${(Math.random() - 0.3) * 700}px`); t.style.setProperty('--fz', `${-600 - Math.random() * 900}px`); t.style.setProperty('--fr', `${(Math.random() - 0.5) * 70}deg`); FX.later(() => t.classList.add('land'), 120 + i * 70); });
    FX.tilt(ts, 12);
    $$('.tb-need').forEach((t, i) => { const imgs = JSON.parse(t.dataset.imgs || '[]'); if (imgs.length < 2) return; let k = 0; FX.every(() => { k = (k + 1) % imgs.length; const a = $('.tb-a', t), b = $('.tb-b', t); b.style.backgroundImage = `url(${imgs[k]})`; b.classList.add('on'); FX.later(() => { a.style.backgroundImage = `url(${imgs[k]})`; b.classList.remove('on'); }, 900); }, 3200 + i * 700); });
    const q = $('.tb-type'); if (q) { const txt = q.dataset.text; let i = 0; const io = new IntersectionObserver((es) => { if (!es[0].isIntersecting) return; io.disconnect(); FX.every(() => { if (i <= txt.length) q.textContent = txt.slice(0, i++); }, 34); }); io.observe(q); FX._c.push(() => io.disconnect()); }
  });
  return `<div class="lx2 tb"><section class="page wrap"><div class="tb-grid">${tiles.join('')}</div></section>
    <section class="sec wrap">${head('', 'A teljes kínálat', '')}<div class="ring-slot" data-lx="0"></div></section>${(LX.rings([S.products]), '')}</div>`;
};

/* ===================== 16. KÉPVÁLTÓ – scrollytelling ===================== */
LAYOUTS.kepvalto = function () {
  const P = LX2.P(), sc = LX2.sc(), st = LX.steps();
  const secs = [{ img: LX.hero(), html: `<span class="pill"><span class="dot"></span>${fill(C.hero.pill)}</span><h1 data-split="w">${fill(C.hero.title)}</h1><p class="lead">${fill(C.hero.lead)}</p><div class="hero-cta">${LX.cta()}</div>` },
    ...BRANDS.slice(0, 4).map((b, i) => { const ps = LX.lineP(b).filter((p) => p.images.length).slice(0, 4); return { img: (LX.lineP(b)[0] && sc[(i + 1) % sc.length]) || LX.hero(), html: `<span class="sec-num">${LX.lineP(b).length} ${L_('itemWord', 'termék')}</span><h2>${esc(b.name)}</h2><p>${esc(b.tag)}</p><div class="kv-mini">${ps.map((p) => `<a class="lx2-p" href="#/termek/${p.slug}" data-swap="${pimg(p)}"><img src="${pimg(p)}" alt=""><span>${pft(p)}</span></a>`).join('')}</div><a class="link-more" href="#/marka/${b.k}">Mind →</a>` }; }),
    ...(st.length ? [{ img: img(st[0].img) || sc[2] || LX.hero(), html: `<span class="sec-num">${esc(C.ritual.title)}</span>${st.map((s, i) => `<div class="kv-step"><b>${String(i + 1).padStart(2, '0')}</b><div><h3>${esc(s.t)}</h3><p>${esc(s.d)}</p></div></div>`).join('')}` }] : []),
    { img: img(C.advice.img) || LX.hero(), html: `<h2>${fill(C.advice.title)}</h2><p>${fill(C.advice.text)}</p><div class="hero-cta">${LX.contact()}</div>` }];
  lx2Start(() => {
    const imgs = $$('.kv-img'), num = $('.kv-num b'); let cur = 0, front = 0;
    // két réteg váltakozik: az új kitakarással jön elő, a régi csak akkor tűnik el, ha közben nem lett újra az elülső
    const show = (src, k) => {
      const nx = imgs[1 - front], old = imgs[front];
      clearTimeout(nx._t); nx.style.backgroundImage = `url(${src})`; nx.classList.toggle('paper', /img\/src\//.test(src) && k === 'p');
      nx.classList.remove('wipe'); void nx.offsetWidth; nx.classList.add('on', 'wipe'); nx.style.zIndex = 2; old.style.zIndex = 1;
      old.classList.remove('wipe'); clearTimeout(old._t); old._t = setTimeout(() => { if (imgs[front] !== old) old.classList.remove('on'); }, 1000);
      front = 1 - front;
    };
    FX._c.push(() => imgs.forEach((x) => clearTimeout(x._t)));
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { const i = +e.target.dataset.i; if (i !== cur) { cur = i; show(secs[i].img); num.textContent = String(i + 1).padStart(2, '0'); } } }), { threshold: 0.55 });
    $$('.kv-sec').forEach((s) => io.observe(s)); FX._c.push(() => io.disconnect());
    $$('[data-swap]').forEach((a) => FX.on(a, 'pointerenter', () => show(a.dataset.swap, 'p')));
  });
  return `<div class="lx2 kv">
    <aside class="kv-left"><div class="kv-img on" style="background-image:url(${secs[0].img})"></div><div class="kv-img"></div><div class="kv-num"><b>01</b> / ${String(secs.length).padStart(2, '0')}</div><div class="kv-name">${esc(C.name)}</div></aside>
    <div class="kv-right">${secs.map((s, i) => `<section class="kv-sec" data-i="${i}"><div data-fx>${s.html}</div></section>`).join('')}
      <section class="kv-sec kv-grid">${P.slice(0, 6).map((p) => LX.tile(p)).join('')}</section></div></div>`;
};

/* ===================== 17. JÁTSZÓTÉR – fizika, konfetti ===================== */
LAYOUTS.jatszoter = function () {
  const P = LX2.P(), words = [...SKINS.map((s) => s.name), ...BRANDS.map((b) => b.name)];
  lx2Start(() => {
    const cards = $$('.js-card'), area = $('.js-pile');
    const st = cards.map((c, i) => ({ c, x: 0, y: 0, vx: 0, vy: 0, r: (i - 1.5) * 9, drag: null }));
    st.forEach((s) => {
      FX.on(s.c, 'pointerdown', (e) => { e.preventDefault(); s.drag = { x: e.clientX - s.x, y: e.clientY - s.y, lx: e.clientX, ly: e.clientY, moved: 0 }; s.c.setPointerCapture(e.pointerId); s.c.classList.add('grab'); s.c.style.zIndex = 10 + Date.now() % 1000; });
      FX.on(s.c, 'pointermove', (e) => { if (!s.drag) return; s.vx = e.clientX - s.drag.lx; s.vy = e.clientY - s.drag.ly; s.drag.lx = e.clientX; s.drag.ly = e.clientY; s.drag.moved += Math.abs(s.vx) + Math.abs(s.vy); s.x = e.clientX - s.drag.x; s.y = e.clientY - s.drag.y; });
      FX.on(s.c, 'pointerup', () => { if (s.drag && s.drag.moved < 6) location.hash = s.c.dataset.href; s.drag = null; s.c.classList.remove('grab'); });
    });
    FX.tick(() => { for (const s of st) { if (!s.drag) { s.vx += -s.x * 0.06; s.vy += -s.y * 0.06; s.vx *= 0.86; s.vy *= 0.86; s.x += s.vx; s.y += s.vy; } s.c.style.transform = `translate(${s.x}px, ${s.y}px) rotate(${s.r + s.vx * 0.8}deg)`; } });
    // színes egérnyom
    if (FX.fine && !FX.reduce) {
      const cv = FX.add(Object.assign(document.createElement('canvas'), { className: 'js-trail' })); document.body.appendChild(cv);
      const g = cv.getContext('2d'); const fit = () => { cv.width = innerWidth; cv.height = innerHeight; }; fit(); FX.on(window, 'resize', fit);
      const dots = []; const cols = ['#ff7a59', '#ffd23f', '#3bceac', '#5d9cec', '#ee4266', '#9b5de5']; let k = 0;
      FX.on(window, 'pointermove', (e) => { dots.push({ x: e.clientX, y: e.clientY, r: 9, c: cols[k++ % cols.length] }); if (dots.length > 40) dots.shift(); }, { passive: true });
      FX.tick(() => { g.clearRect(0, 0, cv.width, cv.height); for (const d of dots) { d.r *= 0.93; g.beginPath(); g.arc(d.x, d.y, d.r, 0, 6.3); g.fillStyle = d.c; g.fill(); } });
    }
    const vel = FX.velocity(); const rows = $$('.js-marq > div').map((el, i) => ({ el, x: 0, dir: i % 2 ? -1 : 1 }));
    FX.tick(() => { const v = vel(); for (const r of rows) { r.x -= (1.4 + Math.abs(v) * 0.5) * r.dir; const w = r.el.scrollWidth / 3; if (r.x < -w) r.x += w; if (r.x > 0) r.x -= w; r.el.style.transform = `translate3d(${r.x}px,0,0)`; } });
  });
  const marq = () => `<div class="js-marq"><div>${[...words, ...words, ...words].map((w) => `<span>${esc(w)}</span>`).join('<i>✺</i>')}</div></div>`;
  return `<div class="lx2 js">
    <section class="js-hero wrap"><div><span class="js-sticker">${esc(C.name)} ✦ ${esc(C.name)} ✦ </span><h1 data-split="c">${fill(C.hero.title)}</h1><p class="lead" data-fx>${fill(C.hero.lead)}</p><div class="hero-cta" data-fx>${LX.cta()}</div><small class="muted">psszt: a kártyákat meg lehet dobni 👉</small></div>
      <div class="js-pile">${P.slice(0, 4).map((p, i) => `<div class="js-card c${i} lx2-p" data-href="#/termek/${p.slug}"><img src="${pimg(p)}" alt="" draggable="false"><b>${esc(p.name)}</b><em>${pft(p)}</em></div>`).join('')}</div></section>
    ${marq()}
    <section class="sec wrap"><div class="js-bubbles">${SKINS.map((s, i) => `<a class="js-bub c${i % 6}" href="#/${NR}/${s.k}" style="--d:${(i % 5) * 0.6}s"><b>${esc(s.name)}</b><span>${LX.needN(s)} ${L_('itemWord', 'termék')}</span></a>`).join('')}</div></section>
    <section class="sec wrap">${head('', 'Kosárba vele! 🎉', 'Próbáld ki: kosárba tételkor konfetti jár.')}<div class="grid">${P.slice(4, 12).map(card).join('')}</div></section>
    ${marq()}
  </div>`;
};

/* ===================== 18. VÉGTELEN FAL – parallax mozaik + nézegető ===================== */
LAYOUTS.vegtelen = function () {
  const P = LX2.P(), sc = LX2.sc();
  const items = []; P.slice(0, 30).forEach((p, i) => { items.push({ p }); if (i % 4 === 1 && sc.length) items.push({ mood: sc[(i / 4 | 0) % sc.length] }); });
  lx2Start(() => {
    const wall = $('.vg-wall'); if (!wall) return;
    const cols = innerWidth < 640 ? 2 : innerWidth < 1000 ? 3 : 4, speeds = [-0.10, 0.06, -0.14, 0.09];
    wall.innerHTML = Array.from({ length: cols }, (_, c) => `<div class="vg-col">${items.filter((_, i) => i % cols === c).map((it) => it.mood ? `<div class="vg-it vg-mood"><img src="${it.mood}" alt="" loading="lazy"></div>` : `<a class="vg-it" href="#/termek/${it.p.slug}" data-id="${it.p.id}"><img src="${pimg(it.p)}" alt="" loading="lazy"><span><b>${esc(it.p.name)}</b><em>${pft(it.p)}</em></span></a>`).join('')}</div>`).join('');
    const colsEl = $$('.vg-col', wall);
    FX.tick(() => { if (FX.reduce) return; const r = wall.getBoundingClientRect(), off = innerHeight / 2 - (r.top + r.height / 2); colsEl.forEach((c, i) => { c.style.transform = `translate3d(0, ${off * speeds[i % speeds.length]}px, 0)`; }); });
    // nagyítós képnézegető (FLIP-animációval)
    const lb = FX.add(Object.assign(document.createElement('div'), { className: 'vg-lb' })); document.body.appendChild(lb);
    const list = P.slice(0, 30); let idx = 0;
    const open = (id, from) => {
      idx = list.findIndex((p) => p.id === id); const p = list[idx]; if (!p) return;
      lb.innerHTML = `<div class="vg-box"><button class="vg-x" aria-label="Bezárás">×</button><button class="vg-prev" aria-label="Előző">‹</button><button class="vg-next" aria-label="Következő">›</button>
        <div class="vg-pic"><img src="${pimg(p)}" alt=""></div><div class="vg-info"><span class="card-brand">${esc(p.brand)}</span><h2>${esc(p.name)}</h2><div class="prose">${p.short || ''}</div><span class="price">${pft(p)}</span><div class="hero-cta">${LX2.addBtn(p)}<a class="btn btn-ghost" href="#/termek/${p.slug}">Részletek</a></div></div></div>`;
      lb.classList.add('open');
      const pic = $('.vg-pic img', lb);
      if (from && !FX.reduce) { const a = from.getBoundingClientRect(), b = pic.getBoundingClientRect(); pic.animate([{ transform: `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(${a.width / b.width})`, opacity: 0.6 }, { transform: 'none', opacity: 1 }], { duration: 520, easing: 'cubic-bezier(.2,.8,.2,1)' }); }
      $('.vg-x', lb).onclick = () => lb.classList.remove('open');
      $('.vg-prev', lb).onclick = () => open(list[(idx - 1 + list.length) % list.length].id);
      $('.vg-next', lb).onclick = () => open(list[(idx + 1) % list.length].id);
    };
    FX.on(lb, 'click', (e) => { if (e.target === lb) lb.classList.remove('open'); });
    FX.on(window, 'keydown', (e) => { if (!lb.classList.contains('open')) return; if (e.key === 'Escape') lb.classList.remove('open'); if (e.key === 'ArrowRight') $('.vg-next', lb)?.click(); if (e.key === 'ArrowLeft') $('.vg-prev', lb)?.click(); });
    FX.on(wall, 'click', (e) => { const a = e.target.closest('a.vg-it'); if (!a) return; e.preventDefault(); open(+a.dataset.id, $('img', a)); });
  });
  return `<div class="lx2 vg">
    <section class="vg-hero wrap"><h1 class="vg-title" style="background-image:url(${LX.hero()})">${esc(C.name)}</h1><p class="lead" data-fx>${fill(C.hero.lead)}</p>
      <div class="chips vg-chips" data-fx>${SKINS.map((s) => `<a class="chip" href="#/${NR}/${s.k}">${esc(s.name)}</a>`).join('')}</div></section>
    <section class="wrap vg-wall"></section>
    <p class="wrap" style="text-align:center;margin:40px auto 70px"><a class="btn btn-gold" href="#/termekek">Mind a ${S.products.length} ${L_('itemWord', 'termék')} →</a></p></div>`;
};

/* ===================== 19. REFLEKTOR – sötét színpad, fénykör ===================== */
LAYOUTS.reflektor = function () {
  const P = LX2.P();
  lx2Start(() => {
    const stage = $('.rf-stage'), its = $$('.rf-it'), label = $('.rf-label'); if (!stage) return;
    // a fény magától vándorol, amíg nem nyúlnak hozzá; 3 mp tétlenség után újra magától megy
    let x = innerWidth / 2, y = 300, tx = x, ty = y, lastMove = -1e9, t0 = performance.now();
    FX.on(stage, 'pointermove', (e) => { const r = stage.getBoundingClientRect(); tx = e.clientX - r.left; ty = e.clientY - r.top; lastMove = performance.now(); }, { passive: true });
    FX.tick((t) => {
      const r = stage.getBoundingClientRect();
      if (t - lastMove > 3000) { const k = (t - t0) / 1000; tx = r.width / 2 + Math.sin(k * 0.6) * r.width * 0.36; ty = Math.min(r.height - 120, 260 + (Math.sin(k * 0.43) * 0.5 + 0.5) * (r.height * 0.6)); }
      x += (tx - x) * 0.12; y += (ty - y) * 0.12;
      stage.style.setProperty('--sx', x + 'px'); stage.style.setProperty('--sy', y + 'px');
      let best = null, bd = 1e9;
      for (const it of its) { const b = it.getBoundingClientRect(), cx = b.left - r.left + b.width / 2, cy = b.top - r.top + b.height / 2, d = Math.hypot(cx - x, cy - y); const lit = FX.clamp(1 - d / 300); it.style.setProperty('--lit', lit.toFixed(3)); if (d < bd) { bd = d; best = it; } }
      if (best && bd < 160) { label.innerHTML = `<b>${esc(best.dataset.n)}</b><em>${esc(best.dataset.p)}</em>`; label.style.transform = `translate(${x + 26}px, ${y - 30}px)`; label.classList.add('on'); } else label.classList.remove('on');
    });
  });
  return `<div class="lx2 rf"><section class="rf-stage">
      <div class="rf-head wrap"><span class="sec-num">${esc(C.name)}</span><h1>${fill(C.hero.title)}</h1><p class="lead">${fill(C.hero.lead)}</p><div class="hero-cta">${LX.cta()}</div><small class="muted">vidd az egeret a sötétbe – a fény megmutatja a kínálatot</small></div>
      <div class="rf-grid wrap">${P.slice(0, 18).map((p) => `<a class="rf-it lx2-p" href="#/termek/${p.slug}" data-n="${esc(p.name)}" data-p="${esc(pft(p))}"><img src="${pimg(p)}" alt="" loading="lazy"></a>`).join('')}</div>
      <div class="rf-dark"></div><div class="rf-label"></div></section>
    <section class="sec wrap">${head('', 'Fényben a teljes kínálat', '')}<div class="ring-slot" data-lx="0"></div></section>${(LX.rings([S.products]), '')}</div>`;
};

/* ===================== 20. PAKLI – egymásra csúszó kártyák + coverflow ===================== */
LAYOUTS.pakli = function () {
  const P = LX2.P(), sc = LX2.sc(), st = LX.steps();
  const cards = [{ img: LX.hero(), html: `<span class="pill"><span class="dot"></span>${fill(C.hero.pill)}</span><h1 data-split="w">${fill(C.hero.title)}</h1><p class="lead">${fill(C.hero.lead)}</p><div class="hero-cta">${LX.cta()}</div>` },
    ...BRANDS.slice(0, 3).map((b, i) => ({ img: sc[(i + 1) % sc.length] || LX.hero(), html: `<span class="sec-num">${LX.lineP(b).length} ${L_('itemWord', 'termék')}</span><h2>${esc(b.name)}</h2><p class="lead">${esc(b.tag)}</p><a class="btn btn-gold" href="#/marka/${b.k}">Megnézem →</a>` })),
    ...(st.length ? [{ img: img(st[0].img) || sc[0] || LX.hero(), html: `<h2>${esc(C.ritual.title)}</h2><ol class="pk-steps">${st.map((s) => `<li><b>${esc(s.t)}</b> — ${esc(s.d)}</li>`).join('')}</ol>` }] : []),
    ...(C.quote ? [{ img: sc[2] || LX.hero(), html: `<p class="pk-q">${fill(C.quote)}</p><div class="hero-cta">${LX.contact()}</div>` }] : [])];
  const list = P.slice(0, 15);
  lx2Start(() => {
    const cs = $$('.pk-card');
    FX.tick(() => { cs.forEach((c, i) => { const nx = cs[i + 1]; if (!nx) return; const r = nx.getBoundingClientRect(), p = FX.clamp(1 - (r.top - 80) / (innerHeight - 80)); c.style.setProperty('--k', p.toFixed(3)); }); });
    // coverflow
    const cf = $('.pk-cf'), items = $$('.pk-ci', cf), info = $('.pk-cinfo'); let pos = 0, target = 0, drag = null;
    const show = (i) => { const p = list[i]; info.innerHTML = `<span class="card-brand">${esc(p.brand)}</span><h3>${esc(p.name)}</h3><span class="price">${pft(p)}</span><div class="hero-cta">${LX2.addBtn(p)}<a class="btn btn-ghost" href="#/termek/${p.slug}">Részletek</a></div>`; };
    let shown = -1;
    FX.tick(() => { if (!drag) pos += (target - pos) * 0.12; items.forEach((el, i) => { const d = i - pos, a = Math.abs(d); el.style.transform = `translateX(${d * 170}px) translateZ(${-a * 140}px) rotateY(${FX.clamp(-d, -1, 1) * 55}deg)`; el.style.zIndex = 100 - Math.round(a * 10); el.style.opacity = FX.clamp(1.2 - a * 0.22); }); const c = Math.round(pos); if (c !== shown && list[c]) { shown = c; show(c); } });
    const go = (t) => { target = FX.clamp(Math.round(t), 0, list.length - 1); };
    FX.on(cf, 'pointerdown', (e) => { drag = { x: e.clientX, p: pos }; cf.setPointerCapture(e.pointerId); });
    FX.on(cf, 'pointermove', (e) => { if (drag) { pos = FX.clamp(drag.p - (e.clientX - drag.x) / 170, 0, list.length - 1); target = pos; } });
    FX.on(cf, 'pointerup', (e) => { if (!drag) return; const moved = Math.abs(e.clientX - drag.x); drag = null; if (moved < 6) { const el = e.target.closest('.pk-ci'); if (el) { const i = +el.dataset.i; if (i === Math.round(pos)) location.hash = '#/termek/' + list[i].slug; else go(i); return; } } go(pos); });
    FX.on(cf, 'wheel', (e) => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) { e.preventDefault(); go(target + Math.sign(e.deltaX)); } }, { passive: false });
    $('.pk-prev').onclick = () => go(target - 1); $('.pk-next').onclick = () => go(target + 1);
    go(Math.floor(list.length / 2));
  });
  return `<div class="lx2 pk">
    <div class="pk-deck">${cards.map((c, i) => `<section class="pk-card" style="--i:${i};top:${70 + i * 14}px"><div class="pk-in" style="background-image:url(${c.img})"><div class="pk-tx" data-fx>${c.html}</div></div></section>`).join('')}</div>
    <section class="sec wrap"><h2 class="pk-cft">Lapozd végig</h2>
      <div class="pk-cfw"><button class="ring-nav prev pk-prev" aria-label="Előző">‹</button><div class="pk-cf">${list.map((p, i) => `<div class="pk-ci" data-i="${i}"><img src="${pimg(p)}" alt="" draggable="false"></div>`).join('')}</div><button class="ring-nav next pk-next" aria-label="Következő">›</button></div>
      <div class="pk-cinfo"></div></section>
  </div>`;
};
