/* Bemutató Gyár – 10 főoldal-felépítés. A „korhinta” az app.js saját home()-ja; a többit ez a fájl adja.
   Mindegyik ugyanabból a tartalomból (site.json + config.json) dolgozik, csak más szerkezetben és hangulatban.
   Választás: config.layout, vagy előnézetben az URL ?layout=… paramétere (újraépítés nélkül). */
'use strict';

window.LAYOUT_META = {
  korhinta: { name: 'Körhinta', desc: 'Sötét üveg, mozgó háttér, 3D körhinta – a Plantora-stílus.', light: false, shopView: 'kor' },
  magazin: { name: 'Magazin', desc: 'Világos, szerkesztőségi: nagy betűk, cikkszerű blokkok, sok fotó.', light: true, shopView: 'racs' },
  minimal: { name: 'Minimal', desc: 'Fehér, sok levegő, letisztult rács – a termék beszél.', light: true, shopView: 'racs' },
  kirakat: { name: 'Kirakat', desc: 'Egyetlen nagy bento-rács: minden fontos egy pillantásra.', light: false, shopView: 'racs' },
  mozi: { name: 'Mozi', desc: 'Teljes képernyős, filmszerű jelenetek egymás után.', light: false, shopView: 'kor' },
  butik: { name: 'Butik', desc: 'Osztott képernyő: álló nagy kép balra, görgethető tartalom jobbra.', light: false, shopView: 'racs' },
  katalogus: { name: 'Katalógus', desc: 'Sűrű lista oldalsávval – gyors keresés, gyors vásárlás.', light: true, shopView: 'racs' },
  meselo: { name: 'Mesélő', desc: 'Történetmesélés: idővonal a lépésekből, váltakozó nagy képek.', light: false, shopView: 'kor' },
  pop: { name: 'Pop', desc: 'Élénk, játékos: futószalagos feliratok, nagy kerekített kártyák.', light: true, shopView: 'racs' },
  galeria: { name: 'Galéria', desc: 'Képközpontú mozaik – Pinterest-szerű, hangulatos.', light: false, shopView: 'racs' },
};

const LX = {
  all: () => S.products,
  pics: () => S.products.filter((p) => p.images && p.images.length).sort((a, b) => b.inStock - a.inStock),
  hero: () => img(C.hero.image || ('media/' + C.hero.media + '.jpg')),
  scenes: () => [...new Set([...(C.scenes || []).map((n) => (n.includes('/') ? n : 'media/' + n + '.jpg')), ...SKINS.map((s) => s.img)].filter(Boolean))],
  needN: (s) => S.products.filter((p) => has(p, s.cats)).length,
  lineP: (b) => S.products.filter((p) => p.brand === b.name),
  tile: (p, cls = '') => `<a class="lx-tile ${cls}" href="#/termek/${p.slug}"><span class="lx-ti"><img src="${pimg(p)}" alt="" loading="lazy"></span><span class="lx-tt"><small>${esc(p.brand)}</small><b>${esc(p.name)}</b><em>${pft(p)}</em></span></a>`,
  cta: () => `<a class="btn btn-gold" href="#/${NR}">${fill(C.hero.cta)}</a><a class="btn btn-ghost" href="#/termekek">${L_('itemsNav', 'Termékek')}</a>`,
  rings(list) { setTimeout(() => $$('.ring-slot[data-lx]').forEach((el) => ring(el, { auto: true }).set(list[+el.dataset.lx] || []))); },
  ringList: (r) => (r ? S.products.filter((p) => (!r.line || brandKey(p.brand) === r.line) && (!r.inStock || p.inStock)) : []),
  steps: () => (C.ritual && C.ritual.steps) || [],
  perks: () => (C.perks || []).map((x) => `<div class="perk glass rv"><span class="ico">${x.ico}</span><b>${fill(x.b)}</b><span>${fill(x.s)}</span></div>`).join(''),
  contact: () => `${C.contact.phone ? `<a class="btn btn-gold" href="${telHref(C.contact.phone)}">${C.contact.phone}</a>` : ''}<a class="btn btn-ghost" href="#/kapcsolat">Írj nekünk</a>`,
};

window.LAYOUTS = {
  // 2. MAGAZIN – szerkesztőségi, világos
  magazin() {
    const P = LX.pics(), H = C.hero;
    return `
    <section class="mg-hero wrap"><div class="mg-mast"><span>${esc(C.name)}</span><span>${new Date().toLocaleDateString('hu-HU', { year: 'numeric', month: 'long' })}</span><span>${S.products.length} ${L_('itemWord', 'termék')}</span></div>
      <div class="mg-grid"><div class="mg-copy"><span class="sec-num">${fill(H.pill)}</span><h1>${fill(H.title)}</h1><p class="lead">${fill(H.lead)}</p><div class="hero-cta">${LX.cta()}</div></div>
      <figure class="mg-fig" style="background-image:url(${LX.hero()})"></figure></div></section>
    <section class="sec wrap"><div class="mg-rule"><span>Ebben a számban</span></div>
      <div class="mg-feats">${SKINS.slice(0, 3).map((s, i) => `<a class="mg-feat" href="#/${NR}/${s.k}"><div class="ph" style="background-image:url(${s.img})"></div><span class="sec-num">0${i + 1} · ${LX.needN(s)} ${L_('itemWord', 'termék')}</span><h3>${esc(s.name)}</h3><p>${esc(s.d)}</p></a>`).join('')}</div></section>
    ${C.quote ? `<section class="mg-quote wrap"><p>${fill(C.quote)}</p></section>` : ''}
    <section class="sec wrap"><div class="mg-rule"><span>Válogatás</span></div><div class="grid">${P.slice(0, 8).map(card).join('')}</div>
      <p style="text-align:center;margin-top:20px"><a class="btn btn-ghost" href="#/termekek">A teljes kínálat →</a></p></section>
    ${BRANDS.slice(0, 4).map((b, i) => { const ps = LX.lineP(b); return `<section class="mg-row wrap ${i % 2 ? 'rev' : ''}"><div class="ph" style="background-image:url(${pimg(ps[0] || {})})"></div>
      <div><span class="sec-num">${ps.length} ${L_('itemWord', 'termék')}</span><h2>${esc(b.name)}</h2><p>${esc(b.tag)}</p><a class="link-more" href="#/marka/${b.k}">Tovább →</a></div></section>`; }).join('')}
    ${LX.steps().length ? `<section class="sec wrap"><div class="mg-rule"><span>${esc(C.ritual.title)}</span></div><ol class="mg-steps">${LX.steps().map((s) => `<li><b>${esc(s.t)}</b><span>${esc(s.d)}</span></li>`).join('')}</ol></section>` : ''}
    ${S.posts.length ? `<section class="sec wrap"><div class="mg-rule"><span>${esc(L_('blogTitle', 'Blog'))}</span></div><div class="posts">${S.posts.slice(0, 3).map(postCard).join('')}</div></section>` : ''}`;
  },

  // 3. MINIMAL – sok levegő
  minimal() {
    const P = LX.pics();
    return `
    <section class="mn-hero wrap"><span class="sec-num">${esc(C.name)}</span><h1>${fill(C.hero.title)}</h1><p class="lead">${fill(C.hero.lead)}</p><div class="hero-cta">${LX.cta()}</div></section>
    <nav class="mn-cats wrap">${SKINS.map((s) => `<a href="#/${NR}/${s.k}">${esc(s.name)} <sup>${LX.needN(s)}</sup></a>`).join('')}</nav>
    <section class="wrap mn-grid">${P.slice(0, 12).map((p) => LX.tile(p)).join('')}</section>
    <p class="wrap" style="text-align:center;margin:40px auto 80px"><a class="btn btn-ghost" href="#/termekek">Mind a ${S.products.length} ${L_('itemWord', 'termék')} →</a></p>
    ${C.quote ? `<section class="mn-quote wrap"><p>${fill(C.quote)}</p></section>` : ''}`;
  },

  // 4. KIRAKAT – egyetlen bento-rács
  kirakat() {
    const P = LX.pics(), st = C.stats || [];
    const tiles = [
      `<div class="kr-t kr-hero" style="background-image:url(${LX.hero()})"><div><span class="pill"><span class="dot"></span>${fill(C.hero.pill)}</span><h1>${fill(C.hero.title)}</h1><div class="hero-cta">${LX.cta()}</div></div></div>`,
      ...SKINS.slice(0, 4).map((s) => `<a class="kr-t kr-need" href="#/${NR}/${s.k}" style="background-image:url(${s.img})"><span class="pill count">${LX.needN(s)}</span><h3>${esc(s.name)}</h3></a>`),
      ...P.slice(0, 6).map((p) => `<a class="kr-t kr-prod" href="#/termek/${p.slug}"><img src="${pimg(p)}" alt="" loading="lazy"><b>${esc(p.name)}</b><em>${pft(p)}</em></a>`),
      ...st.slice(0, 2).map((x) => `<div class="kr-t kr-stat"><b>${fill(x.n)}</b><span>${fill(x.label)}</span></div>`),
      C.quote ? `<div class="kr-t kr-quote"><p>${fill(C.quote)}</p></div>` : '',
      ...BRANDS.slice(0, 2).map((b) => `<a class="kr-t kr-line" href="#/marka/${b.k}"><span class="sec-num">${LX.lineP(b).length} ${L_('itemWord', 'termék')}</span><h3>${esc(b.name)}</h3><p>${esc(b.tag)}</p></a>`),
    ].filter(Boolean);
    return `<section class="page wrap"><div class="kr-grid">${tiles.join('')}</div></section>
      <section class="sec wrap">${head('', 'A teljes kínálat', '')}<div class="ring-slot" data-lx="0"></div></section>${(LX.rings([S.products]), '')}`;
  },

  // 5. MOZI – teljes képernyős jelenetek
  mozi() {
    const sc = LX.scenes();
    const scenes = SKINS.slice(0, 5).map((s, i) => { const ps = S.products.filter((p) => has(p, s.cats) && p.images.length).slice(0, 3); return `
      <section class="mz-scene" style="background-image:url(${s.img || sc[i % sc.length]})"><div class="wrap mz-in ${i % 2 ? 'right' : ''}"><span class="sec-num">${String(i + 1).padStart(2, '0')} / ${String(Math.min(5, SKINS.length)).padStart(2, '0')}</span><h2>${esc(s.name)}</h2><p>${esc(s.d)}</p>
        <div class="mz-mini">${ps.map((p) => `<a href="#/termek/${p.slug}"><img src="${pimg(p)}" alt=""><span>${pft(p)}</span></a>`).join('')}</div><a class="btn btn-gold" href="#/${NR}/${s.k}">Megnézem →</a></div></section>`; }).join('');
    return `<div class="mz">
      <section class="mz-scene mz-first" style="background-image:url(${LX.hero()})"><div class="wrap mz-in"><span class="pill"><span class="dot"></span>${fill(C.hero.pill)}</span><h1>${fill(C.hero.title)}</h1><p class="lead">${fill(C.hero.lead)}</p><div class="hero-cta">${LX.cta()}</div></div><div class="scroll-hint">görgess<i></i></div></section>
      ${scenes}
      ${C.quote ? `<section class="mz-scene mz-q" style="background-image:url(${sc[1] || LX.hero()})"><div class="wrap mz-in"><p class="mz-quote">${fill(C.quote)}</p><div class="hero-cta">${LX.contact()}</div></div></section>` : ''}
    </div>`;
  },

  // 6. BUTIK – osztott képernyő
  butik() {
    const P = LX.pics();
    return `<div class="bt">
      <aside class="bt-img" style="background-image:url(${LX.hero()})"><div class="bt-cap"><b>${esc(C.name)}</b><span>${fill(C.hero.pill)}</span></div></aside>
      <div class="bt-main">
        <section class="bt-sec"><h1>${fill(C.hero.title)}</h1><p class="lead">${fill(C.hero.lead)}</p><div class="hero-cta">${LX.cta()}</div></section>
        <section class="bt-sec"><span class="sec-num">${esc(L_('linesTitle', 'Termékcsaládok'))}</span>${BRANDS.map((b) => `<a class="bt-line" href="#/marka/${b.k}"><b>${esc(b.name)}</b><span>${LX.lineP(b).length}</span></a>`).join('')}</section>
        <section class="bt-sec"><span class="sec-num">Válogatás</span><div class="bt-grid">${P.slice(0, 8).map((p) => LX.tile(p)).join('')}</div></section>
        ${LX.steps().length ? `<section class="bt-sec"><span class="sec-num">${esc(C.ritual.title)}</span>${LX.steps().map((s, i) => `<div class="bt-step"><b>0${i + 1}</b><div><h3>${esc(s.t)}</h3><p>${esc(s.d)}</p></div></div>`).join('')}</section>` : ''}
        <section class="bt-sec"><h2>${fill(C.advice.title)}</h2><p class="muted">${fill(C.advice.text)}</p><div class="hero-cta">${LX.contact()}</div></section>
      </div></div>`;
  },

  // 7. KATALÓGUS – sűrű lista oldalsávval
  katalogus() {
    const all = S.products.slice().sort((a, b) => b.inStock - a.inStock);
    return `<section class="kt-banner wrap"><div><h1>${esc(C.name)}</h1><p>${fill(C.hero.lead)}</p></div><div class="kt-search"><input type="search" id="ktQ" placeholder="${esc(L_('searchPh', 'Keresés…'))}"></div></section>
      <section class="wrap kt"><aside class="kt-side">
        <h4>${esc(L_('filterTypes', 'Kategória'))}</h4>${TYPES.slice(0, 16).map((t) => `<a href="#/termekek?tipus=${t.k}">${esc(t.name)} <span>${S.products.filter((p) => has(p, t.cats)).length}</span></a>`).join('')}
        ${BRANDS.length ? `<h4>${esc(L_('filterLines', 'Termékcsalád'))}</h4>${BRANDS.map((b) => `<a href="#/marka/${b.k}">${esc(b.name)} <span>${LX.lineP(b).length}</span></a>`).join('')}` : ''}
      </aside><div class="kt-list" id="ktList">${all.slice(0, 40).map((p) => `<div class="kt-row" data-n="${esc(norm(p.name + ' ' + p.brand))}"><a href="#/termek/${p.slug}"><img src="${pimg(p)}" alt="" loading="lazy"></a>
        <a class="kt-name" href="#/termek/${p.slug}"><b>${esc(p.name)}</b><small>${esc(p.brand)} · ${esc(p.cats.slice(0, 2).join(', '))}</small></a><span class="kt-price">${pft(p)}</span>
        ${needsChoice(p) ? `<a class="btn btn-ghost" href="#/termek/${p.slug}">Kiválasztom</a>` : `<button class="btn btn-gold" data-add="${p.id}">${L_('addShort', 'Kosárba')}</button>`}</div>`).join('')}
        <p style="text-align:center;margin:18px 0"><a class="btn btn-ghost" href="#/termekek">Mind a ${S.products.length} →</a></p></div></section>${(setTimeout(() => { const q = $('#ktQ'); if (q) q.oninput = () => { const v = norm(q.value); $$('.kt-row').forEach((r) => (r.hidden = !!v && !r.dataset.n.includes(v))); }; }), '')}`;
  },

  // 8. MESÉLŐ – idővonal, váltakozó képek
  meselo() {
    const st = LX.steps(), sc = LX.scenes(), R = C.rings || [];
    LX.rings([LX.ringList(R[0]).length ? LX.ringList(R[0]) : S.products]);
    return `
    <section class="ms-hero" style="background-image:url(${LX.hero()})"><div class="wrap"><span class="pill"><span class="dot"></span>${fill(C.hero.pill)}</span><h1>${fill(C.hero.title)}</h1><p class="lead">${fill(C.hero.lead)}</p><div class="hero-cta">${LX.cta()}</div></div></section>
    ${C.quote ? `<section class="quote wrap rv"><p>${fill(C.quote)}</p></section>` : ''}
    ${st.length ? `<section class="wrap ms-line"><h2 class="ms-title">${esc(C.ritual.title)}</h2>${st.map((s, i) => `<div class="ms-step ${i % 2 ? 'rev' : ''} rv"><div class="ph" style="background-image:url(${img(s.img) || sc[i % sc.length]})"></div><div class="ms-txt"><span class="ms-n">${String(i + 1).padStart(2, '0')}</span><h3>${esc(s.t)}</h3><p>${esc(s.d)}</p></div></div>`).join('')}</section>` : ''}
    <section class="sec wrap">${head('', R[0] ? fill(R[0].title) : 'Kínálat', '')}<div class="ring-slot" data-lx="0"></div></section>
    <section class="sec wrap"><div class="perks">${LX.perks()}</div></section>`;
  },

  // 9. POP – élénk, játékos
  pop() {
    const P = LX.pics(), words = [...SKINS.map((s) => s.name), ...BRANDS.map((b) => b.name)];
    const marq = (cls) => `<div class="pp-marq ${cls}"><div>${[...words, ...words, ...words].map((w) => `<span>${esc(w)}</span>`).join('<i>✦</i>')}</div></div>`;
    return `
    <section class="pp-hero wrap"><div><span class="pp-badge">${esc(C.name)}</span><h1>${fill(C.hero.title)}</h1><p class="lead">${fill(C.hero.lead)}</p><div class="hero-cta">${LX.cta()}</div></div>
      <div class="pp-stack">${P.slice(0, 3).map((p, i) => `<a class="pp-card c${i}" href="#/termek/${p.slug}"><img src="${pimg(p)}" alt=""><b>${pft(p)}</b></a>`).join('')}</div></section>
    ${marq('')}
    <section class="sec wrap"><div class="pp-needs">${SKINS.map((s, i) => `<a class="pp-need c${i % 5}" href="#/${NR}/${s.k}"><b>${esc(s.name)}</b><span>${LX.needN(s)} ${L_('itemWord', 'termék')} →</span></a>`).join('')}</div></section>
    <section class="sec wrap">${head('', 'Kedvencek', '')}<div class="pp-rail">${P.slice(0, 12).map((p) => LX.tile(p, 'pp-t')).join('')}</div></section>
    ${marq('rev')}
    <section class="sec wrap"><div class="perks">${LX.perks()}</div></section>`;
  },

  // 10. GALÉRIA – mozaik
  galeria() {
    const P = LX.pics(), sc = LX.scenes();
    const items = [];
    P.slice(0, 24).forEach((p, i) => { items.push(`<a class="gl-it" href="#/termek/${p.slug}"><img src="${pimg(p)}" alt="" loading="lazy"><span><b>${esc(p.name)}</b><em>${pft(p)}</em></span></a>`); if (i % 5 === 2 && sc[i % sc.length]) items.push(`<div class="gl-it gl-mood"><img src="${sc[(i / 5 | 0) % sc.length]}" alt="" loading="lazy"></div>`); });
    return `<section class="gl-hero wrap"><h1>${fill(C.hero.title)}</h1><p class="lead">${fill(C.hero.lead)}</p>
      <div class="chips gl-chips">${SKINS.map((s) => `<a class="chip" href="#/${NR}/${s.k}">${esc(s.name)}</a>`).join('')}</div></section>
      <section class="wrap gl">${items.join('')}</section>
      <p class="wrap" style="text-align:center;margin:30px auto 60px"><a class="btn btn-gold" href="#/termekek">Mind a ${S.products.length} ${L_('itemWord', 'termék')} →</a></p>`;
  },
};
