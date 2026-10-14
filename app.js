/* Bemutató Gyár – webshop-bemutató sablon. Minden bolt-specifikus rész a data/config.json-ból jön (a Bemutató Gyár írja). */
'use strict';
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const app = $('#app');
const ft = n => n.toLocaleString('hu-HU').replace(/ /g, ' ') + ' Ft';
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

let S = null; // site.json – a bolt tartalma
let C = null; // config.json – a felépítés modellje (szövegek, csoportok, színek, szállítás)

/* ---------- osztályozás (a config.json-ból töltődik) ---------- */
let SKINS = [], TYPES = [], BRANDS = [];   // igények (needs), kategóriák (types), termékcsaládok/márkák (lines)
let NR = 'igeny';                          // az „igények” oldal útvonala (a configból)
const fill = t => String(t ?? '').replace(/\{count\}/g, S.products.length).replace(/\{posts\}/g, S.posts.length)
  .replace(/\{free\}/g, ft(C.shipping.free)).replace(/\{phone\}/g, C.contact.phone || '').replace(/\{name\}/g, C.name);
const telHref = t => 'tel:' + String(t || '').replace(/[^+\d]/g, '');
const img = ref => !ref ? C.fallbackImg : ref.startsWith('line:') ? lineImg(ref) : ref;
// a termékcsalád-oldalak saját életképei (pl. 'line:taskak:0')
const lineImg = ref => { const [, page, i] = ref.split(':'); const im = S.brandIntro[page]?.images || []; return im[+i] || im[0] || C.fallbackImg; };
const lineImages = b => (b.pages || []).flatMap(pg => S.brandIntro[pg]?.images || []);
const lineParas = b => (b.pages || []).flatMap(pg => S.brandIntro[pg]?.paras || []);
// ár: változatos terméknél „-tól”
const SVC = () => C.mode === 'szolgaltatas';
const L_ = (k, d) => (C.labels && C.labels[k]) || d;
const pft = p => p.priceLabel ? p.priceLabel : !p.price ? L_('priceOnRequest', 'Egyedi ajánlat') : p.priceMax && p.priceMax !== p.price ? ft(p.price) + '-tól' : ft(p.price) + (p.unit ? ' / ' + p.unit : '');
const LY = () => new URLSearchParams(location.search).get('layout') || C.layout || 'korhinta';
const lineFt = (price, q) => price ? ft(price * q) : L_('priceOnRequest', 'Egyedi ajánlat');
const needsChoice = p => p.options && p.options.length > 0;
const brandKey = n => BRANDS.find(b => b.name === n)?.k;
const has = (p, list) => p.cats.some(c => list.includes(c));
const skinOf = k => SKINS.find(s => s.k === k);
const typeOf = k => TYPES.find(s => s.k === k);
const pimg = p => (p.images && p.images[0]) || C.fallbackImg;
const bySlug = slug => S.products.find(p => p.slug === slug);

/* ---------- kosár ---------- */
const keyOf = i => `${i.id}|${i.v || ''}|${i.o || ''}`;
const cart = {
  items: [],
  load() { try { this.items = JSON.parse(localStorage.getItem(C.id + '-cart') || '[]'); } catch { this.items = []; } },
  save() { try { localStorage.setItem(C.id + '-cart', JSON.stringify(this.items)); } catch {} renderCart(); },
  add(id, q = 1, v = '', o = '') {
    const it = this.items.find(i => keyOf(i) === keyOf({ id, v, o }));
    it ? it.q += q : this.items.push({ id, q, v, o });
    this.save();
    const b = $('#cartBtn'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump');
    toast(L_('addedToast', 'Kosárba tettem ✓'));
  },
  set(key, q) { this.items = this.items.map(i => keyOf(i) === key ? { ...i, q } : i).filter(i => i.q > 0); this.save(); },
  get lines() {
    return this.items.map(i => {
      const p = S.products.find(x => x.id === i.id); if (!p) return null;
      const va = i.v ? (p.variants || []).find(x => x.id === +i.v) : null;
      const label = va ? Object.values(va.attrs).join(', ') : i.o || '';
      return { ...i, key: keyOf(i), p, price: va ? va.price : p.price, label };
    }).filter(Boolean);
  },
  get total() { return this.lines.reduce((s, l) => s + l.price * l.q, 0); },
  get count() { return this.items.reduce((s, i) => s + i.q, 0); },
};

function renderCart() {
  $('#cartCount').textContent = cart.count;
  const left = C.shipping.free - cart.total;
  const pct = Math.min(100, cart.total / C.shipping.free * 100);
  $('#shipMeter').hidden = !C.shipping.free;
  if (C.shipping.free) $('#shipMeter').innerHTML = (left > 0
    ? `Még <b>${ft(left)}</b> és ingyenes a szállítás`
    : `🎉 Ingyenes szállítás`) + `<div class="bar"><i style="width:${pct}%"></i></div>`;
  const L = cart.lines;
  $('#drawerItems').innerHTML = L.length ? L.map(l => `
    <div class="ci">
      <a href="#/termek/${l.p.slug}"><img src="${pimg(l.p)}" alt=""></a>
      <div><div class="n">${esc(l.p.name)}${l.label ? `<div class="muted">${esc(l.label)}</div>` : ''}</div>
        <div class="q"><button data-q="${l.key}" data-d="-1">−</button><span>${l.q}</span><button data-q="${l.key}" data-d="1">+</button></div></div>
      <b>${lineFt(l.price, l.q)}</b>
    </div>`).join('') : `<div class="empty"><p style="font-size:40px;margin:0">${C.labels.emptyIcon}</p><p>Még üres a kosarad.</p><a class="btn btn-ghost" href="#/termekek">Termékek böngészése</a></div>`;
  $('#drawerFoot').innerHTML = L.length ? `<div class="sum"><span>Összesen</span><b>${ft(cart.total)}</b></div><a class="btn btn-gold" href="#/penztar">${L_('toCheckout', 'Tovább a pénztárhoz')}</a>` : '';
}
document.addEventListener('click', e => {
  const q = e.target.closest('[data-q]');
  if (q) { const it = cart.items.find(i => keyOf(i) === q.dataset.q); cart.set(q.dataset.q, (it?.q || 0) + +q.dataset.d); }
  const a = e.target.closest('[data-add]');
  if (a) { e.preventDefault(); cart.add(+a.dataset.add, +(a.dataset.n || 1), a.dataset.v || '', a.dataset.o || ''); }
});
const drawer = open => { $('#drawer').classList.toggle('open', open); $('#drawer').setAttribute('aria-hidden', !open); };
$('#cartBtn').onclick = () => drawer(true);
$('#drawerClose').onclick = () => drawer(false);
$('#drawer').onclick = e => { if (e.target.id === 'drawer') drawer(false); };

function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('on'), 1800); }

/* ---------- keresés ---------- */
function searchOpen(open) {
  $('#search').classList.toggle('open', open);
  if (open) { $('#searchInput').value = ''; $('#searchResults').innerHTML = ''; setTimeout(() => $('#searchInput').focus(), 30); }
}
$('#searchBtn').onclick = () => searchOpen(true);
$('#search').onclick = e => { if (e.target.id === 'search') searchOpen(false); };
document.addEventListener('keydown', e => { if (e.key === 'Escape') { searchOpen(false); drawer(false); } if (e.key === '/' && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); searchOpen(true); } });
const match = (p, q) => { const h = norm(p.name + ' ' + p.brand + ' ' + p.cats.join(' ') + ' ' + p.tags.join(' ')); return norm(q).split(/\s+/).every(w => h.includes(w)); };
$('#searchInput').oninput = e => {
  const q = e.target.value.trim();
  if (q.length < 2) { $('#searchResults').innerHTML = ''; return; }
  const r = S.products.filter(p => match(p, q)).slice(0, 12);
  $('#searchResults').innerHTML = r.length ? r.map(p => `<a class="sr" href="#/termek/${p.slug}"><img src="${pimg(p)}" alt=""><span>${esc(p.name)}</span><b>${pft(p)}</b></a>`).join('')
    : `<div class="sr" style="grid-template-columns:1fr">Nincs találat erre: „${esc(q)}”</div>`;
};
window.addEventListener('hashchange', () => searchOpen(false));

/* ---------- körhinta: a kínálat körben tekerhető, a középső termék kiemelve ---------- */
let rings = [];
function ring(el, opts = {}) {
  const VIS = 5, STEP = 24;                          // ±5 kártya látszik, 24°-onként a körön
  el.innerHTML = `<div class="ring">
    <div class="ring-view" tabindex="0" aria-label="Termékkörhinta – húzd vagy használd a nyilakat">
      <div class="ring-stage"></div>
      <button class="ring-nav prev" aria-label="Előző">‹</button><button class="ring-nav next" aria-label="Következő">›</button>
    </div>
    <div class="ring-info"></div>
    <div class="ring-scrub"><span class="ring-pos"></span><input type="range" min="0" max="0" value="0" aria-label="Ugrás a listában"></div>
  </div>`;
  const view = $('.ring-view', el), stage = $('.ring-stage', el), info = $('.ring-info', el), scrub = $('.ring-scrub input', el), pos = $('.ring-pos', el);
  const nodes = Array.from({ length: VIS * 2 + 3 }, () => {
    const n = document.createElement('div'); n.className = 'ring-card';
    n.innerHTML = '<div class="rc-img"><img alt="" draggable="false"></div><div class="rc-t"><span class="rc-b"></span><span class="rc-n"></span><b class="rc-p"></b></div>';
    stage.appendChild(n); return n;
  });
  let items = [], p = 0, target = 0, vel = 0, drag = null, raf = 0, shown = -1, idleAt = performance.now(), W = 200, R = 500;
  const wrap = i => ((i % items.length) + items.length) % items.length;
  const measure = () => {
    W = Math.round(Math.max(140, Math.min(230, el.clientWidth * (innerWidth < 700 ? 0.42 : 0.25))));
    R = Math.round(W / 2 / Math.tan(STEP / 2 * Math.PI / 180) * 1.18);
    el.style.setProperty('--rw', W + 'px');
    stage.style.transform = `translateZ(${-R}px) rotateX(-4deg)`;
  };
  const showInfo = i => {
    const it = items[i]; if (!it) return;
    info.innerHTML = `<div class="ri-main"><span class="card-brand">${esc(it.brand)}</span><h3>${esc(it.name)}</h3>
      ${SVC() ? '' : `<span class="stock ${it.inStock ? 'ok' : 'no'}">${it.inStock ? '● Raktáron' : '● Jelenleg elfogyott'}</span>`}</div>
      <div class="ri-buy"><span class="price">${pft(it)}</span>
        ${!it.inStock ? '' : needsChoice(it) ? `<a class="btn btn-gold" href="#/termek/${it.slug}">Kiválasztom</a>` : `<button class="btn btn-gold" data-add="${it.id}">${L_('addShort', 'Kosárba')}</button>`}
        <a class="btn btn-ghost" href="#/termek/${it.slug}">Részletek</a></div>`;
    pos.textContent = `${i + 1} / ${items.length}`;
    scrub.value = i;
  };
  const frame = now => {
    raf = 0;
    if (!el.isConnected) return;
    if (!drag) {
      if (opts.auto && now - idleAt > 5000) { target += 1; idleAt = now - 1500; }
      p += (target - p) * 0.14;
      if (Math.abs(target - p) < 0.001) p = target;
    }
    const base = Math.round(p);
    nodes.forEach((n, k) => {
      const abs = base + k - VIS - 1, d = abs - p, ang = d * STEP;
      const on = items.length && Math.abs(ang) < 112 && (items.length > VIS * 2 || Math.abs(abs - base) <= Math.floor((items.length - 1) / 2));
      n.style.visibility = on ? 'visible' : 'hidden';
      if (!on) return;
      const i = wrap(abs);
      if (n._i !== i) {
        n._i = i; const it = items[i];
        n.querySelector('img').src = pimg(it);
        n.querySelector('.rc-b').textContent = it.brand;
        n.querySelector('.rc-n').textContent = it.name;
        n.querySelector('.rc-p').textContent = pft(it);
        n.classList.toggle('out', !it.inStock);
      }
      n._abs = abs;
      const f = Math.max(0, 1 - Math.abs(d) / (VIS + .5));
      n.style.transform = `rotateY(${ang}deg) translateZ(${R}px)`;
      n.style.opacity = (0.25 + 0.75 * f).toFixed(3);
      n.style.zIndex = 100 - Math.round(Math.abs(d) * 10);
      n.classList.toggle('front', Math.abs(d) < 0.5);
    });
    const cur = items.length ? wrap(base) : -1;
    if (cur !== shown) { shown = cur; if (cur >= 0) showInfo(cur); }
    if (drag || Math.abs(target - p) > 0.0005 || opts.auto) raf = requestAnimationFrame(frame);
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };
  const go = t => { target = t; idleAt = performance.now(); kick(); };

  // húzás tehetetlenséggel; a kártyára kattintás oda teker, a középsőre kattintás megnyitja
  view.addEventListener('pointerdown', e => {
    if (e.target.closest('.ring-nav')) return;
    drag = { x: e.clientX, p0: p, t: performance.now(), moved: 0, lastX: e.clientX, lastT: performance.now() };
    view.setPointerCapture(e.pointerId); view.classList.add('grabbing'); kick();
  });
  view.addEventListener('pointermove', e => {
    if (!drag) return;
    const now = performance.now();
    vel = (e.clientX - drag.lastX) / Math.max(1, now - drag.lastT);
    drag.lastX = e.clientX; drag.lastT = now;
    drag.moved = Math.max(drag.moved, Math.abs(e.clientX - drag.x));
    p = drag.p0 - (e.clientX - drag.x) / (W * 0.95); target = p;
  });
  const end = e => {
    if (!drag) return;
    const moved = drag.moved; drag = null; view.classList.remove('grabbing');
    if (moved < 6) {                                   // kattintás
      const c = document.elementFromPoint(e.clientX, e.clientY)?.closest('.ring-card');
      if (c && c._abs !== undefined) {
        if (c.classList.contains('front')) location.hash = '#/termek/' + items[c._i].slug;
        else go(c._abs);
      } else go(Math.round(p));
      return;
    }
    go(Math.round(p - vel * 9));                       // lendület után a legközelebbi kártyára áll
  };
  view.addEventListener('pointerup', end);
  view.addEventListener('pointercancel', end);
  view.addEventListener('wheel', e => {
    const dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : (e.shiftKey ? e.deltaY : 0);
    if (!dx) return;                                   // függőleges görgetés: az oldal görög tovább
    e.preventDefault(); go(Math.round(target + Math.sign(dx)));
  }, { passive: false });
  view.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(Math.round(target) - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); go(Math.round(target) + 1); }
    if (e.key === 'Enter' && items.length) location.hash = '#/termek/' + items[wrap(Math.round(p))].slug;
  });
  $('.prev', el).onclick = () => go(Math.round(target) - 1);
  $('.next', el).onclick = () => go(Math.round(target) + 1);
  scrub.oninput = () => { const b = Math.round(target); go(b + (+scrub.value - wrap(b))); };
  const ro = new ResizeObserver(() => { measure(); kick(); }); ro.observe(el);
  measure();
  const api = {
    set(list) {
      items = list; shown = -1; nodes.forEach(n => n._i = -1);
      p = target = 0; scrub.max = Math.max(0, list.length - 1);
      el.classList.toggle('few', list.length < 15);
      el.classList.toggle('empty-ring', !list.length);
      if (!list.length) { info.innerHTML = '<div class="ri-main"><h3>Nincs ilyen termék</h3><span class="muted">Próbálj kevesebb szűrőt.</span></div>'; pos.textContent = ''; }
      kick();
    },
    dispose() { cancelAnimationFrame(raf); ro.disconnect(); },
  };
  rings.push(api);
  return api;
}
function disposeRings() { rings.forEach(r => r.dispose()); rings = []; }

/* ---------- komponensek ---------- */
const card = p => `
  <article class="card glass">
    ${!p.inStock ? '<span class="badge">Elfogyott</span>' : p.onSale ? '<span class="badge sale">Akció</span>' : ''}
    <a href="#/termek/${p.slug}" class="card-img"><img src="${pimg(p)}" alt="${esc(p.name)}" loading="lazy"></a>
    <div class="card-body">
      <span class="card-brand">${esc(p.brand)}</span>
      <a href="#/termek/${p.slug}" class="card-name">${esc(p.name)}</a>
      <div class="card-foot"><span class="price">${p.onSale ? `<s class="was">${ft(p.regular)}</s>` : ''}${pft(p)}</span>
        ${needsChoice(p) ? `<a class="add" href="#/termek/${p.slug}" aria-label="Kiválasztom"><svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>`
          : `<button class="add" ${p.inStock ? `data-add="${p.id}"` : 'disabled'} aria-label="Kosárba"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></button>`}</div>
    </div>
  </article>`;
const head = (num, title, sub, more) => `
  <div class="sec-head rv"><div><span class="sec-num">${num}</span><h2>${title}</h2>${sub ? `<p>${sub}</p>` : ''}</div>${more || ''}</div>`;

/* ---------- oldalak ---------- */
function home() {
  if (LY() !== 'korhinta' && window.LAYOUTS && LAYOUTS[LY()]) return LAYOUTS[LY()]();
  const P = S.products, H = C.hero, L = C.labels, R = C.rings || [];
  const posts = S.posts.slice(0, 3);
  const skinN = s => P.filter(p => has(p, s.cats)).length;
  const ringList = r => P.filter(p => (!r.line || brandKey(p.brand) === r.line) && (!r.need || has(p, skinOf(r.need)?.cats || []))
    && (!r.cats || has(p, r.cats)) && (!r.inStock || p.inStock)).sort((a, b) => b.inStock - a.inStock);
  let sec = 0; const num = () => String(++sec).padStart(2, '0');
  setTimeout(() => { homeRing(); $$('.ring-slot[data-ring]').forEach(el => ring(el, { auto: true }).set(ringList(R[+el.dataset.ring]))); });
  const big = Math.max(0, SKINS.length - 7 >= 0 ? 0 : -1);
  // a bento-rácsot hézagmentesre igazítjuk: 4 oszlop, az első elem 2×2, a maradékhoz annyi „széles”, hogy kijöjjön a sor
  const rest = SKINS.length - 1, wides = (4 - ((4 + rest) % 4)) % 4;
  const wideIdx = new Set(Array.from({ length: wides }, (_, i) => 3 + i));
  return `
  <section class="hero"><div class="wrap hero-grid">
    <div class="hero-text">
      <span class="pill"><span class="dot"></span>${fill(H.pill)}</span>
      <h1>${fill(H.title)}</h1>
      <p class="lead">${fill(H.lead)}</p>
      <div class="hero-cta"><a class="btn btn-gold" href="#/${NR}">${fill(H.cta)}</a><a class="btn btn-ghost" href="#/termekek">Összes termék</a></div>
    </div>
    <div class="hero-side">
      <div class="hero-portrait">${HERO_VIDEO ? `<video src="media/${H.media}.mp4" poster="media/${H.media}.jpg" autoplay muted loop playsinline></video>` : `<img class="kb" src="${img(H.image || 'media/' + H.media + '.jpg')}" alt="">`}</div>
      ${(H.floats || []).slice(0, 3).map((f, i) => `<div class="float glass f${i + 1}"><span class="ico">${f.ico}</span><div><b>${fill(f.b)}</b><small>${fill(f.small)}</small></div></div>`).join('')}
    </div>
  </div><div class="scroll-hint">görgess<i></i></div></section>

  <div class="wrap stats">
    ${(C.stats || []).map(x => { const n = +fill(x.n) || 0; return `<div class="stat glass rv"><b data-count="${n}">${n}</b><span>${fill(x.label)}</span></div>`; }).join('')}
  </div>

  ${C.quote ? `<section class="quote wrap rv"><p>${fill(C.quote)}</p></section>` : ''}

  ${SKINS.length ? `<section class="sec wrap">
    ${head(num(), L.needsTitle, L.needsSub, `<a class="link-more" href="#/${NR}">Mind →</a>`)}
    <div class="bento">
      ${SKINS.map((s, i) => `<a href="#/${NR}/${s.k}" class="skin glass rv ${i === 0 ? 'big' : wideIdx.has(i) ? 'wide' : ''}">
        <div class="bgimg" style="background-image:url(${s.img})"></div>
        <span class="pill count">${skinN(s)} ${L_('itemWord', 'termék')}</span>
        <h3>${esc(s.name)}</h3><p>${esc(s.d)}</p></a>`).join('')}
    </div>
  </section>` : ''}

  <section class="sec wrap">
    ${head(num(), 'A teljes kínálat', 'Tekerd körbe mind a ' + P.length + ' ' + L_('itemsWord', 'terméket') + ' — húzással, a nyilakkal vagy a csúszkával. ' + (L.ringFilterHint || ''), '<a class="link-more" href="#/termekek">Webshop →</a>')}
    <div class="chips ring-filter rv" id="hrFilter">
      <button class="chip on" data-k="">Minden termék</button>
      ${BRANDS.map(b => `<button class="chip" data-k="m:${b.k}">${esc(b.name)}</button>`).join('')}
      ${SKINS.map(x => `<button class="chip" data-k="b:${x.k}">${esc(x.name)}</button>`).join('')}
    </div>
    <div id="homeRing"></div>
    ${R[0] ? `<h3 class="sub-h rv">${fill(R[0].title)}</h3><div class="ring-slot" data-ring="0"></div>` : ''}
  </section>

  ${BRANDS.length ? `<section class="sec wrap">
    ${head(num(), L.linesTitle, L.linesSub, '<a class="link-more" href="#/markak">Mind →</a>')}
    <div class="brands">${BRANDS.map(b => { const ps = P.filter(p => p.brand === b.name); return `
      <a class="brand-card glass rv" href="#/marka/${b.k}"><span class="sec-num">${ps.length} ${L_('itemWord', 'termék')}</span><h3>${esc(b.name)}</h3><p>${esc(b.tag)}</p>
      <div class="imgs">${ps.slice(0, 5).map(p => `<img src="${pimg(p)}" alt="" loading="lazy">`).join('')}</div></a>`; }).join('')}</div>
  </section>` : ''}

  ${C.ritual && C.ritual.steps.length ? `<section class="sec wrap">
    ${head(num(), C.ritual.title, C.ritual.sub)}
    <div class="ritual">
      ${C.ritual.steps.map((st, i) => `<a class="step glass rv" href="#/termekek${st.tipus ? '?tipus=' + st.tipus : ''}"><div class="ph" style="background-image:url(${img(st.img)})"><span class="n">0${i + 1}</span></div><div class="t"><h3>${esc(st.t)}</h3><p>${esc(st.d)}</p></div></a>`).join('')}
    </div>
  </section>` : ''}

  ${R[1] ? `<section class="sec wrap">
    ${head(num(), fill(R[1].title), fill(R[1].sub || ''), R[1].line ? `<a class="link-more" href="#/marka/${R[1].line}">Mind →</a>` : '')}
    <div class="ring-slot" data-ring="1"></div>
  </section>` : ''}

  <section class="sec wrap">
    <div class="advice glass rv">
      <div class="ph" style="background-image:url(${img(C.advice.img)})"></div>
      <div class="t"><span class="sec-num">${num()}</span><h2>${fill(C.advice.title)}</h2>
        <p class="muted">${fill(C.advice.text)}</p>
        <div class="hero-cta">${C.contact.phone ? `<a class="btn btn-gold" href="${telHref(C.contact.phone)}">Hívj: ${C.contact.phone}</a>` : ''}<a class="btn btn-ghost" href="#/kapcsolat">Írj nekünk</a></div></div>
    </div>
    <div class="perks">
      ${(C.perks || []).map(x => `<div class="perk glass rv"><span class="ico">${x.ico}</span><b>${fill(x.b)}</b><span>${fill(x.s)}</span></div>`).join('')}
    </div>
  </section>

  ${posts.length ? `<section class="sec wrap">
    ${head(num(), L.blogTitle, fill(L.blogSub), '<a class="link-more" href="#/blog">Blog →</a>')}
    <div class="posts">${posts.map(postCard).join('')}</div>
  </section>` : ''}`;
}
function homeRing() {
  const el = $('#homeRing'); if (!el) return;
  const r = ring(el, { auto: true });
  const pick = k => {
    const [t, v] = k.split(':');
    r.set(S.products.filter(p => !k || (t === 'm' ? brandKey(p.brand) === v : has(p, skinOf(v).cats))).sort((a, b) => b.inStock - a.inStock));
  };
  $$('#hrFilter .chip').forEach(c => c.onclick = () => { $$('#hrFilter .chip').forEach(x => x.classList.toggle('on', x === c)); pick(c.dataset.k); });
  pick('');
}
const postCard = x => `<a class="post glass rv" href="#/blog/${x.slug}"><div class="ph" style="background-image:url(${x.image || C.fallbackImg})"></div>
  <div class="t"><time>${x.date.replaceAll('-', '. ')}.</time><h3>${esc(x.title)}</h3><p>${esc(x.excerpt)}</p></div></a>`;

function shop(params) {
  const st = {
    q: params.get('q') || '', marka: params.get('marka') || '', bor: params.get('bor') || '', tipus: params.get('tipus') || '',
    rend: params.get('rend') || 'ajanlott', keszlet: params.get('keszlet') === '1', nezet: params.get('nezet') || ((window.LAYOUT_META || {})[LY()] || {}).shopView || 'kor',
  };
  const html = `
  <section class="page wrap">
    <div class="page-head rv"><span class="sec-num">${L_('shopEyebrow', 'Webshop')}</span><h1>${L_('itemsNav', 'Termékek')}</h1><p>${C.labels.shopLead}</p></div>
    <div class="shop">
      <aside class="filters glass" id="filters">
        ${BRANDS.length ? `<div><h4>${C.labels.filterLines}</h4><div class="chips">${BRANDS.map(b => `<button class="chip" data-f="marka" data-v="${b.k}">${esc(b.name)}</button>`).join('')}</div></div>` : ''}
        ${SKINS.length ? `<div><h4>${C.labels.filterNeeds}</h4><div class="chips">${SKINS.map(s => `<button class="chip" data-f="bor" data-v="${s.k}">${esc(s.name)}</button>`).join('')}</div></div>` : ''}
        <div><h4>${C.labels.filterTypes}</h4><div class="chips">${TYPES.map(s => `<button class="chip" data-f="tipus" data-v="${s.k}">${s.name}</button>`).join('')}</div></div>
        <label class="chip" style="cursor:pointer;align-self:flex-start"><input type="checkbox" id="fStock" style="accent-color:var(--gold)"> Csak raktáron lévők</label>
        <button class="btn btn-ghost" id="fReset" style="justify-content:center">Szűrők törlése</button>
      </aside>
      <div>
        <div class="toolbar">
          <button class="btn btn-ghost filter-toggle" id="fToggle">Szűrők</button>
          <input type="search" id="fQ" placeholder="Keresés a termékek között…">
          <select id="fSort"><option value="ajanlott">Ajánlott</option><option value="olcso">Ár szerint növekvő</option><option value="draga">Ár szerint csökkenő</option><option value="nev">Név szerint</option></select>
          <span class="result-n" id="fN"></span>
          <div class="seg" role="group" aria-label="Nézet"><button data-nezet="kor">Körhinta</button><button data-nezet="racs">Rács</button></div>
        </div>
        <div id="fRing"></div>
        <div class="grid" id="fGrid"></div>
      </div>
    </div>
  </section>`;
  setTimeout(() => {
    const rg = ring($('#fRing'));
    $('#fQ').value = st.q; $('#fSort').value = st.rend; $('#fStock').checked = st.keszlet;
    const draw = () => {
      let r = S.products.filter(p =>
        (!st.marka || brandKey(p.brand) === st.marka) &&
        (!st.bor || has(p, skinOf(st.bor).cats)) &&
        (!st.tipus || has(p, typeOf(st.tipus).cats)) &&
        (!st.keszlet || p.inStock) &&
        (!st.q || match(p, st.q)));
      if (st.rend === 'olcso') r.sort((a, b) => a.price - b.price);
      if (st.rend === 'draga') r.sort((a, b) => b.price - a.price);
      if (st.rend === 'nev') r.sort((a, b) => a.name.localeCompare(b.name, 'hu'));
      if (st.rend === 'ajanlott') r.sort((a, b) => b.inStock - a.inStock);
      $$('.chip[data-f]').forEach(c => c.classList.toggle('on', st[c.dataset.f] === c.dataset.v));
      $('#fN').textContent = r.length + ' termék';
      const kor = st.nezet !== 'racs';
      $('#fRing').hidden = !kor; $('#fGrid').hidden = kor;
      $$('.seg button').forEach(b => b.classList.toggle('on', b.dataset.nezet === (kor ? 'kor' : 'racs')));
      if (kor) rg.set(r);
      else $('#fGrid').innerHTML = r.length ? r.map(card).join('') : `<div class="empty glass" style="grid-column:1/-1"><p>Nincs ilyen termék. Próbálj kevesebb szűrőt.</p></div>`;
      const qs = new URLSearchParams(Object.entries(st).filter(([k, v]) => v && !(k === 'rend' && v === 'ajanlott') && !(k === 'nezet' && v === 'kor')).map(([k, v]) => [k, v === true ? '1' : v])).toString();
      history.replaceState(null, '', '#/termekek' + (qs ? '?' + qs : ''));
    };
    $$('.chip[data-f]').forEach(c => c.onclick = () => { st[c.dataset.f] = st[c.dataset.f] === c.dataset.v ? '' : c.dataset.v; draw(); });
    $('#fQ').oninput = e => { st.q = e.target.value.trim(); draw(); };
    $('#fSort').onchange = e => { st.rend = e.target.value; draw(); };
    $('#fStock').onchange = e => { st.keszlet = e.target.checked; draw(); };
    $('#fReset').onclick = () => { Object.assign(st, { q: '', marka: '', bor: '', tipus: '', keszlet: false }); $('#fQ').value = ''; $('#fStock').checked = false; draw(); };
    $('#fToggle').onclick = () => $('#filters').classList.toggle('open');
    $$('.seg button').forEach(b => b.onclick = () => { st.nezet = b.dataset.nezet; draw(); });
    draw();
  });
  return html;
}

function product(slug) {
  const p = bySlug(slug);
  if (!p) return notFound();
  const skins = SKINS.filter(s => has(p, s.cats));
  const rel = S.products.filter(x => x.id !== p.id && x.brand === p.brand && x.cats.some(c => p.cats.includes(c))).slice(0, 8);
  setTimeout(() => {
    let n = 1;
    // változat-választó: a kiválasztott opciókhoz tartozó változat ára és készlete
    const pick = {};
    (p.options || []).forEach(o => pick[o.name] = o.terms[0]);
    const nn = x => norm(x).replace(/[^a-z0-9]/g, '');
    const sync = () => {
      $$('.opt-chip').forEach(c => c.classList.toggle('on', pick[c.dataset.a] === c.dataset.t));
      const va = (p.variants || []).find(v => Object.entries(v.attrs).every(([a, val]) => !val || nn(val) === nn(pick[a] || '')));
      const btn = $('#buyBtn');
      if (va) { $('#pdPrice').textContent = ft(va.price); $('#pdStock').className = 'stock ' + (va.inStock ? 'ok' : 'no'); $('#pdStock').textContent = va.inStock ? '● Raktáron' : '● Ez a változat elfogyott'; }
      if (btn) { btn.dataset.v = va ? va.id : ''; btn.dataset.o = va ? '' : Object.entries(pick).map(([a, t]) => a + ': ' + t).join(', '); btn.disabled = !!(va && !va.inStock); }
    };
    $$('.opt-chip').forEach(c => c.onclick = () => { pick[c.dataset.a] = c.dataset.t; sync(); });
    if ((p.options || []).length) sync();
    if ($('#relRing')) ring($('#relRing'), { auto: true }).set(rel);
    $$('.thumbs button').forEach(b => b.onclick = () => { $('.gallery .main img').src = b.dataset.src; $$('.thumbs button').forEach(x => x.classList.toggle('on', x === b)); });
    $$('.qty button').forEach(b => b.onclick = () => { n = Math.max(1, n + +b.dataset.d); $('.qty span').textContent = n; $('#buyBtn').dataset.n = n; });
  });
  return `
  <section class="page wrap">
    <div class="pd">
      <div class="gallery rv">
        <div class="main"><img src="${pimg(p)}" alt="${esc(p.name)}"></div>
        ${p.images.length > 1 ? `<div class="thumbs">${p.images.map((s, i) => `<button class="${i ? '' : 'on'}" data-src="${s}"><img src="${s}" alt=""></button>`).join('')}</div>` : ''}</div>
      <div class="rv">
        <a class="card-brand" href="#/marka/${brandKey(p.brand)}">${esc(p.brand)}</a>
        <h1>${esc(p.name)}</h1>
        <div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap">${p.onSale ? `<s class="was big">${ft(p.regular)}</s>` : ''}<span class="price" id="pdPrice">${pft(p)}</span>
          <span class="stock ${p.inStock ? 'ok' : 'no'}" id="pdStock" ${SVC() ? 'hidden' : ''}>${p.inStock ? '● Raktáron' : '● Jelenleg elfogyott'}</span></div>
        ${(p.options || []).map(o => `<div class="opt"><span class="muted">${esc(o.name)}</span><div class="chips">${o.terms.map(t => `<button class="chip opt-chip" data-a="${esc(o.name)}" data-t="${esc(t)}">${esc(t)}</button>`).join('')}</div></div>`).join('')}
        ${p.short ? `<div class="prose">${p.short}</div>` : ''}
        <div class="buy">${p.inStock ? `<div class="qty"><button data-d="-1">−</button><span>1</span><button data-d="1">+</button></div><button class="btn btn-gold" id="buyBtn" data-add="${p.id}" data-n="1">${L_('addLong', 'Kosárba teszem')}</button>`
          : `<a class="btn btn-ghost" href="#/kapcsolat">Érdeklődöm, mikor érkezik</a>`}</div>
        ${skins.length ? `<div><span class="muted" style="font-size:14px">Ehhez jó:</span><div class="tags">${skins.map(s => `<a class="chip" href="#/${NR}/${s.k}">${esc(s.name)}</a>`).join('')}</div></div>` : ''}
        <div class="tags">${p.cats.map(c => `<span class="pill">${esc(c)}</span>`).join('')}</div>
        <div class="perks" style="grid-template-columns:1fr 1fr;margin-top:6px">
          ${C.shipping.free ? `<div class="perk glass"><span class="ico">🚚</span><b>Ingyenes szállítás</b><span>${ft(C.shipping.free)} felett</span></div>` : ''}
          <div class="perk glass"><span class="ico">💬</span><b>Kérdésed van?</b><span>${C.contact.phone ? `<a href="${telHref(C.contact.phone)}">${C.contact.phone}</a>` : `<a href="#/kapcsolat">Írj nekünk</a>`}</span></div>
        </div>
      </div>
    </div>
    ${p.desc ? `<div class="box glass prose rv"><h2 style="margin-top:0">Részletes leírás</h2>${p.desc}</div>` : ''}
    ${rel.length ? `<div class="sec">${head('', 'Ehhez illik még', '')}<div class="ring-slot" id="relRing"></div></div>` : ''}
  </section>`;
}

function skinPage(k) {
  const s = skinOf(k);
  const list = s ? S.products.filter(p => has(p, s.cats)).sort((a, b) => b.inStock - a.inStock) : [];
  return `
  <section class="page wrap">
    <div class="page-head rv"><span class="sec-num">${C.labels.needsPage}</span><h1>${s ? esc(s.name) : C.labels.needsTitle}</h1><p>${s ? esc(s.d) : 'Kattints arra, ami illik hozzád — azonnal mutatjuk a hozzá illő termékeket.'}</p></div>
    <div class="skin-pick rv">${SKINS.map(x => `<button class="${x.k === k ? 'on' : ''}" onclick="location.hash='#/${NR}/${x.k}'"><b>${esc(x.name)}</b><span>${S.products.filter(p => has(p, x.cats)).length} ${L_('itemWord', 'termék')}</span></button>`).join('')}</div>
    ${s ? `<div class="grid">${list.map(card).join('')}</div>` : `<div class="advice glass rv"><div class="ph" style="background-image:url(${img(C.advice.img)})"></div><div class="t"><h2>Bizonytalan vagy?</h2><p class="muted">${fill(C.advice.text)}</p><a class="btn btn-gold" href="${C.contact.phone ? telHref(C.contact.phone) : '#/kapcsolat'}" style="align-self:flex-start">${C.contact.phone || 'Írj nekünk'}</a></div></div>`}
  </section>`;
}

function brandsPage() {
  return `<section class="page wrap"><div class="page-head rv"><span class="sec-num">${C.labels.linesNav}</span><h1>${C.labels.linesTitle}</h1><p>${C.labels.linesSub}</p></div>
    <div class="brands">${BRANDS.map(b => { const ps = S.products.filter(p => p.brand === b.name); return `
      <a class="brand-card glass rv" href="#/marka/${b.k}"><span class="sec-num">${ps.length} ${L_('itemWord', 'termék')}</span><h3>${esc(b.name)}</h3><p>${esc(b.tag)}</p>
      <div class="imgs">${ps.slice(0, 5).map(p => `<img src="${pimg(p)}" alt="" loading="lazy">`).join('')}</div></a>`; }).join('')}</div></section>`;
}

function brandPage(k) {
  const b = BRANDS.find(x => x.k === k);
  if (!b) return notFound();
  const paras = lineParas(b), imgs = lineImages(b);
  const list = S.products.filter(p => p.brand === b.name).sort((a, c) => c.inStock - a.inStock);
  return `<section class="page wrap">
    <div class="page-head rv"><span class="sec-num">${C.labels.linesNav} · ${list.length} ${L_('itemWord', 'termék')}</span><h1>${esc(b.name)}</h1><p>${esc(b.tag)}</p></div>
    ${paras.length ? `<div class="box glass prose rv" style="margin-bottom:26px">${paras.slice(0, 4).map(t => `<p>${esc(t)}</p>`).join('')}</div>` : ''}
    ${imgs.length ? `<div class="line-gallery rv">${imgs.slice(0, 8).map(u => `<div style="background-image:url(${u})"></div>`).join('')}</div>` : ''}
    <div class="grid">${list.map(card).join('')}</div></section>`;
}

function blog() {
  return `<section class="page wrap"><div class="page-head rv"><span class="sec-num">Blog</span><h1>${C.labels.blogTitle}</h1><p>${fill(C.labels.blogSub)}</p></div>
    <div class="posts">${S.posts.map(postCard).join('')}</div></section>`;
}
function article(slug) {
  const x = S.posts.find(p => p.slug === slug);
  if (!x) return notFound();
  const more = S.posts.filter(p => p !== x).slice(0, 3);
  return `<section class="page wrap"><article class="article rv">
    <a class="link-more" href="#/blog">← Blog</a>
    <div class="page-head" style="margin-top:16px"><span class="sec-num">${x.date.replaceAll('-', '. ')}.</span><h1>${esc(x.title)}</h1></div>
    ${x.image ? `<div class="cover" style="background-image:url(${x.image})"></div>` : ''}
    <div class="prose">${x.html}</div></article>
    <div class="sec">${head('', 'További cikkek', '')}<div class="posts">${more.map(postCard).join('')}</div></div></section>`;
}
function legal(slug) {
  const x = S.pages[slug];
  if (!x) return notFound();
  return `<section class="page wrap"><article class="article"><div class="page-head"><h1>${esc(x.title)}</h1></div><div class="box glass prose">${x.html}</div></article></section>`;
}
function contact() {
  setTimeout(() => {
    $('#cForm').onsubmit = e => {
      e.preventDefault();
      e.target.outerHTML = `<div class="done glass"><h3>Köszönjük, ${esc(new FormData(e.target).get('nev'))}!</h3><p class="muted">Ez a bemutató változat, így az üzenet most nem megy el. Élesben ide érkezik: <b>${C.contact.email || C.name}</b></p></div>`;
    };
  });
  return `<section class="page wrap"><div class="page-head rv"><span class="sec-num">Kapcsolat</span><h1>Szívesen segítünk</h1><p>${fill(C.contactPage.lead)}</p></div>
    <div class="contact">
      <div class="box glass rv" style="margin:0">
        <div class="perks" style="grid-template-columns:1fr 1fr;margin:0 0 18px">
          ${[C.contact.phone && `<a class="perk glass" href="${telHref(C.contact.phone)}"><span class="ico">📞</span><b>Telefon</b><span>${C.contact.phone}</span></a>`,
             C.contact.email && `<a class="perk glass" href="mailto:${C.contact.email}"><span class="ico">✉️</span><b>E-mail</b><span>${C.contact.email}</span></a>`,
             C.contact.address && `<div class="perk glass"><span class="ico">📍</span><b>Címünk</b><span>${C.contact.address}</span></div>`,
             C.contact.hours && `<div class="perk glass"><span class="ico">🕗</span><b>Nyitvatartás</b><span>${C.contact.hours}</span></div>`,
             C.contact.facebook && `<a class="perk glass" href="${C.contact.facebook}" target="_blank" rel="noopener"><span class="ico">👍</span><b>Facebook</b><span>${C.contact.facebook.replace(/^https?:\/\/(www\.)?facebook\.com\//, '')}</span></a>`,
             C.contact.instagram && `<a class="perk glass" href="${C.contact.instagram}" target="_blank" rel="noopener"><span class="ico">📸</span><b>Instagram</b><span>@${C.contact.instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/$/, '')}</span></a>`]
            .filter(Boolean).slice(0, 4).join('')}
        </div>
        <form class="form" id="cForm"><input name="nev" placeholder="Neved" required><input name="email" type="email" placeholder="E-mail címed" required><textarea name="uzenet" placeholder="Miben segíthetünk?" required></textarea><button class="btn btn-gold" style="align-self:flex-start">Üzenet küldése</button></form>
      </div>
      <div class="map rv" style="background-image:url(${img(C.contactPage.img)})"><div><span class="pill"><span class="dot"></span>${C.contactPage.pill}</span><h2 style="font-size:32px">${fill(C.contactPage.title)}</h2>
        <div class="hero-cta">${C.contact.instagram ? `<a class="btn btn-gold" href="${C.contact.instagram}" target="_blank" rel="noopener">Instagram</a>` : ''}${C.contact.facebook ? `<a class="btn btn-ghost" href="${C.contact.facebook}" target="_blank" rel="noopener">Facebook</a>` : ''}</div></div></div>
    </div></section>`;
}
function checkout() {
  const L = cart.lines;
  if (!L.length) return `<section class="page wrap"><div class="empty glass"><p style="font-size:40px;margin:0">${C.labels.emptyIcon}</p><p>Üres a kosarad.</p><a class="btn btn-gold" href="#/termekek">Vásárlás</a></div></section>`;
  const SHIP = C.shipping.methods, PAY = C.shipping.payments;
  const under = cart.total < (C.shipping.min || 0);
  setTimeout(() => {
    const calc = () => {
      const f = new FormData($('#oForm'));
      const sh = SHIP.find(x => x.k === f.get('mod')) || { fee: 0 }, pay = PAY.find(x => x.k === f.get('fiz')) || { fee: 0 };
      if (sh.noCod && pay.cod) { $('#oForm').fiz.value = PAY.find(x => !x.cod).k; return calc(); }
      const ship = C.shipping.free && cart.total >= C.shipping.free ? 0 : sh.fee;
      $('#oShip').textContent = ship ? ft(ship) : 'ingyenes';
      $('#oPay').textContent = pay.fee ? ft(pay.fee) : '—';
      $('#oTotal').textContent = cart.total ? ft(cart.total + ship + pay.fee) : L_('priceOnRequest', 'Egyedi ajánlat');
    };
    $('#oForm').onchange = calc; calc();
    $('#oForm').onsubmit = e => {
      e.preventDefault();
      if (under) return;
      const f = new FormData(e.target);
      e.target.outerHTML = SVC() ? `<div class="done glass"><h3>Köszönjük az ajánlatkérést, ${esc(f.get('nev'))}!</h3>
        <p class="muted">Ez a bemutató változat: az üzenet most nem megy el. Élesben ${esc(C.name)} kapja meg, és a(z) <b>${esc(f.get('email'))}</b> címen jelentkezik.</p>
        <a class="btn btn-ghost" href="#/termekek">Vissza a kínálathoz</a></div>` : `<div class="done glass"><h3>Köszönjük a rendelést, ${esc(f.get('nev'))}!</h3>
        <p class="muted">Ez a bemutató változat: a rendelés most nem megy el, a kosarad megmarad. Élesben a webshop rendeléskezelője kapja meg, és visszaigazolást küld a(z) <b>${esc(f.get('email'))}</b> címre.</p>
        <a class="btn btn-ghost" href="#/termekek">Vissza a termékekhez</a></div>`;
    };
  });
  return `<section class="page wrap"><div class="page-head"><span class="sec-num">${L_('checkoutEyebrow', 'Pénztár')}</span><h1>${L_('checkoutTitle', 'Rendelés')}</h1></div>
    <div class="contact">
      <form class="box glass form" id="oForm" style="margin:0">
        <input name="nev" placeholder="Teljes név" required><input name="tel" placeholder="Telefonszám" required><input name="email" type="email" placeholder="E-mail" required>
        ${SVC() ? '' : `<input name="cim" placeholder="${C.shipping.addressPh || 'Szállítási cím'}" required>`}
        ${SHIP.length ? `<label class="muted" for="oMod">Szállítás</label>
        <select id="oMod" name="mod" class="sel">${SHIP.map(x => `<option value="${x.k}">${x.name} — ${ft(x.fee)}</option>`).join('')}</select>` : ''}
        ${PAY.length ? `<label class="muted" for="oFiz">Fizetés</label>
        <select id="oFiz" name="fiz" class="sel">${PAY.map(x => `<option value="${x.k}">${x.name}</option>`).join('')}</select>` : ''}
        <textarea name="megj" placeholder="${L_('notePh', 'Megjegyzés (nem kötelező)')}" ${SVC() ? 'required' : ''}></textarea>
        ${under ? `<p class="warn">A minimum rendelési érték ${ft(C.shipping.min)} — még ${ft(C.shipping.min - cart.total)} hiányzik.</p>` : ''}
        <button class="btn btn-gold" style="align-self:flex-start" ${under ? 'disabled' : ''}>${L_('submit', 'Rendelés elküldése')}</button>
        <p class="muted" style="font-size:13px">${SVC() ? 'Az elküldéssel' : 'A rendeléssel'} elfogadod az <a href="#/oldal/${C.legal.terms || ''}" style="color:var(--gold)">ÁSZF</a>-et és az <a href="#/oldal/${C.legal.privacy || ''}" style="color:var(--gold)">adatvédelmi tájékoztatót</a>.</p>
      </form>
      <div class="box glass" style="margin:0">${L.map(l => `<div class="ci"><img src="${pimg(l.p)}" alt=""><div class="n">${esc(l.p.name)}<div class="muted">${l.label ? esc(l.label) + ' · ' : ''}${l.q} ${l.p.unit || 'db'}</div></div><b>${lineFt(l.price, l.q)}</b></div>`).join('')}
        <div class="drawer-foot" style="padding:16px 0 0;border:0">
          <div class="sum" style="font-size:15px" ${SHIP.length ? '' : 'hidden'}><span>Szállítás</span><span id="oShip"></span></div>
          <div class="sum" style="font-size:15px" ${PAY.length ? '' : 'hidden'}><span>Fizetési díj</span><span id="oPay"></span></div>
          <div class="sum"><span>${L_('totalLabel', 'Fizetendő')}</span><b id="oTotal"></b></div></div></div>
    </div></section>`;
}
const notFound = () => `<section class="page wrap"><div class="empty glass"><h1>Ez az oldal nem található</h1><p><a class="btn btn-gold" href="#/">Vissza a főoldalra</a></p></div></section>`;

/* ---------- útválasztó ---------- */
function route() {
  const [path, qs] = location.hash.slice(1).split('?');
  const seg = (path || '/').split('/').filter(Boolean);
  const params = new URLSearchParams(qs || '');
  const r = seg[0] || '';
  const view = {
    '': () => home(), termekek: () => shop(params), termek: () => product(seg[1]), [NR]: () => skinPage(seg[1]),
    markak: () => brandsPage(), marka: () => brandPage(seg[1]), blog: () => seg[1] ? article(seg[1]) : blog(),
    oldal: () => legal(seg[1]), kapcsolat: () => contact(), penztar: () => checkout(),
  }[r] || notFound;
  if (route.last === r + '/' + (seg[1] || '') && r === 'termekek') return; // a szűrő maga írja át a címet
  route.last = r + '/' + (seg[1] || '');
  disposeRings();
  if (window.LX_CLEANUP) LX_CLEANUP();
  app.innerHTML = view();
  drawer(false);
  $('#navLinks').classList.remove('open');
  $$('#navLinks a').forEach(a => a.classList.toggle('on', a.getAttribute('href').slice(2).split('/')[0] === (r === 'termek' ? 'termekek' : r === 'marka' ? 'markak' : r)));
  document.body.classList.toggle('deep', r !== '');
  document.title = r ? ($('h1')?.textContent || C.name) + ' · ' + C.name : C.name;
  window.scrollTo({ top: 0, behavior: 'instant' });
  reveal();
}
window.addEventListener('hashchange', route);
$('#menuBtn').onclick = () => $('#navLinks').classList.toggle('open');

/* ---------- megjelenés, számlálók ---------- */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add('in'); io.unobserve(e.target);
  $$('[data-count]', e.target).forEach(countUp);
}), { threshold: .12 });
function reveal() {
  $$('.rv:not(.in)').forEach(el => { const r = el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) el.classList.add('in', 'seen'); else io.observe(el); });
  $$('.rv.seen [data-count]').forEach(countUp);
}
function countUp(el) {
  const to = +el.dataset.count, t0 = performance.now();
  const step = t => { const k = Math.min(1, (t - t0) / 1400); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}

/* ---------- mozgó háttér: a config jelenetei váltakozva (videó, ha van; különben kép lassú Ken Burns-mozgással) ---------- */
let HERO_VIDEO = false;
let SCENES = [];
async function background() {
  const box = $('#bgMedia');
  // media.json: mely jelenetekhez van már mozgó videó (a többi kép, lassú Ken Burns-mozgással)
  let vids = [];
  try { vids = (await (await fetch('media/media.json', { cache: 'no-store' })).json()).videos || []; } catch {}
  HERO_VIDEO = vids.includes(C.hero.media);
  const els = SCENES.map(n => {
    if (!vids.includes(n)) { const im = new Image(); im.src = n.includes('/') ? n : `media/${n}.jpg`; im.alt = ''; box.appendChild(im); return im; }
    const v = document.createElement('video');
    Object.assign(v, { muted: true, loop: true, playsInline: true, preload: 'auto', poster: `media/${n}.jpg` });
    v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
    v.src = `media/${n}.mp4`;
    // ha nincs videó (vagy nem játszható), a képet mutatjuk lassú Ken Burns-mozgással
    v.onerror = () => { const im = new Image(); im.src = `media/${n}.jpg`; im.alt = ''; im.className = v.className; v.replaceWith(im); els[els.indexOf(v)] = im; };
    box.appendChild(v);
    return v;
  });
  let i = 0;
  const show = () => {
    els.forEach((el, k) => {
      el.classList.toggle('on', k === i);
      if (el.tagName === 'VIDEO') { if (k === i) { el.currentTime = 0; el.play().catch(() => {}); } else setTimeout(() => el.pause(), 2500); }
    });
    i = (i + 1) % els.length;
  };
  show();
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) setInterval(show, 9000);
}

/* lebegő fénypontok a háttérben (szín a configból) */
function sparkle() {
  const c = $('#sparkle'), x = c.getContext('2d');
  let W, H, dots;
  const size = () => {
    W = c.width = innerWidth * devicePixelRatio; H = c.height = innerHeight * devicePixelRatio;
    dots = Array.from({ length: Math.round(innerWidth / 18) }, () => ({ x: Math.random() * W, y: Math.random() * H, r: (Math.random() * 1.8 + .4) * devicePixelRatio, v: Math.random() * .25 + .05, p: Math.random() * 6.28 }));
  };
  size(); addEventListener('resize', size);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const tick = t => {
    x.clearRect(0, 0, W, H);
    for (const d of dots) {
      d.y -= d.v * devicePixelRatio; d.x += Math.sin(t / 2000 + d.p) * .2;
      if (d.y < -10) { d.y = H + 10; d.x = Math.random() * W; }
      const a = .25 + .35 * Math.sin(t / 700 + d.p) ** 2;
      x.beginPath(); x.arc(d.x, d.y, d.r, 0, 6.28);
      x.fillStyle = `rgba(${C.sparkle},${a})`; x.shadowColor = `rgba(${C.sparkle},.8)`; x.shadowBlur = 8 * devicePixelRatio; x.fill();
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ---------- frissítés-jelző (új verzió esetén gomb) ---------- */
async function checkUpdate() {
  try {
    const r = await fetch('version.json?t=' + Date.now(), { cache: 'no-store' });
    const v = (await r.json()).version;
    if (v && v !== C.version) $('#updateBtn').hidden = false;
  } catch {}
}
$('#updateBtn').onclick = () => location.reload();
setInterval(checkUpdate, 60000);

/* ---------- indítás ---------- */
(async () => {
  C = await (await fetch('data/config.json', { cache: 'no-store' })).json();
  SKINS = C.needs || []; TYPES = C.types || []; BRANDS = C.lines || []; NR = C.labels.needsRoute || 'igeny'; SCENES = C.scenes || [];
  await background(); sparkle();
  S = await (await fetch('data/site.json?v=' + C.version)).json();
  SKINS.forEach(x => { x.img = img(x.img); });
  cart.load(); renderCart();
  document.body.classList.add('layout-' + LY());
  if (((window.LAYOUT_META || {})[LY()] || {}).light) document.body.classList.add('light');
  $('.drawer-head h3').textContent = L_('cartTitle', 'Kosarad');
  const navI = $('#navLinks a[href="#/termekek"]'); if (navI) navI.textContent = L_('itemsNav', 'Termékek');
  // lassú hálózaton a felépítések szkriptjei (layouts*.js, alapok*.js) még töltődhetnek – a kirajzolás megvárja őket
  if (document.readyState === 'loading') await new Promise((r) => addEventListener('DOMContentLoaded', r, { once: true }));
  if (((window.LAYOUT_META || {})[LY()] || {}).light) document.body.classList.add('light');
  route();
  addEventListener('scroll', () => $('#nav').classList.toggle('scrolled', scrollY > 40), { passive: true });
})();
