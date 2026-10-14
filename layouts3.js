/* Bemutató Gyár – 3. sorozat: 10 futurisztikus felépítés (21–30).
   WebGL-shader, vászon-részecskék, 3D-tér, élő háló – mind a projekt saját tartalmából, AI nélkül.
   A 2. sorozat FX-eszköztárát használja (layouts2.js: FX, lx2Start, LX2); takarítás: FX.cleanup(). */
'use strict';

window.LAYOUT_META3 = {
  hologram: { name: 'Hologram', desc: 'Irizáló szivárványfóliás kártyák fénytöréssel, hologramvitrin pásztázó vonalakkal.', light: false, shopView: 'racs' },
  neuron: { name: 'Neuron', desc: 'Élő neurális háló: a termékek a csomópontok, az egér közelében felizzik és összeköt.', light: false, shopView: 'kor' },
  folyadek: { name: 'Folyadék', desc: 'Saját WebGL-shader: folyékony fémháttér a palettából, egérre hullámzik; üvegkártyák.', light: false, shopView: 'racs' },
  galaxis: { name: 'Galaxis', desc: '3D csillagmező, keringő termék-bolygók, görgetésre fénysebességű ugrás.', light: false, shopView: 'kor' },
  terminal: { name: 'Terminál', desc: 'Sci-fi irányítópult: mátrix-eső, gépelő terminál, glitch, radar, célkereszt.', light: false, shopView: 'racs' },
  morfozis: { name: 'Morfózis', desc: 'Összeolvadó folyékony buborékok, lélegző, alakot váltó képmaszkok.', light: false, shopView: 'racs' },
  kocka: { name: 'Kocka', desc: 'A főoldal egy forgó 3D kocka oldalain – a görgetés forgatja.', light: false, shopView: 'kor' },
  alagut: { name: 'Alagút', desc: 'Repülés egy neonkeretes 3D alagútban, a termékek a falakon suhannak el.', light: false, shopView: 'kor' },
  pixelvihar: { name: 'Pixelvihar', desc: 'Részecskékből összeálló nyitókép, az egér szétfújja; pixelből átalakuló termékek.', light: false, shopView: 'racs' },
  aurora: { name: 'Aurora', desc: 'Sarki fény és beszélgető kirakat: kérdésekre gépelve ajánl termékeket (AI nélkül).', light: false, shopView: 'kor' },
};
Object.assign(window.LAYOUT_META, window.LAYOUT_META3);

/** közös segédek a 3. sorozathoz */
const F3 = {
  css: (v) => getComputedStyle(document.body).getPropertyValue(v).trim(),
  rgb(v) { const s = this.css(v); if (s.startsWith('#')) { const h = s.length === 4 ? s.slice(1).split('').map((c) => c + c).join('') : s.slice(1, 7); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255); } const m = s.match(/[\d.]+/g) || [128, 128, 128]; return m.slice(0, 3).map((x) => +x / 255); },
  canvas(cls, parent = document.body, fixed = true) {
    const c = document.createElement('canvas'); c.className = cls; if (fixed) c.style.position = 'fixed';
    parent.appendChild(c); FX.add(c);
    const dpr = Math.min(devicePixelRatio || 1, 1.75);
    const fit = () => { const r = fixed ? { width: innerWidth, height: innerHeight } : parent.getBoundingClientRect(); c.width = r.width * dpr; c.height = r.height * dpr; c.style.width = r.width + 'px'; c.style.height = r.height + 'px'; };
    fit(); FX.on(window, 'resize', fit);
    return { c, g: c.getContext('2d'), dpr, fit };
  },
  visible: (el) => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; },
  mouse: { x: -9999, y: -9999 },
  trackMouse() { FX.on(window, 'pointermove', (e) => { this.mouse.x = e.clientX; this.mouse.y = e.clientY; }, { passive: true }); },
  loadImg: (src) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; }),
};

/* ===================== 21. HOLOGRAM ===================== */
LAYOUTS.hologram = function () {
  const P = LX2.P();
  lx2Start(() => {
    const cards = $$('.hg-card');
    FX.tilt(cards, 16);
    cards.forEach((c) => FX.on(c, 'pointermove', (e) => { const r = c.getBoundingClientRect(); c.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%'); c.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%'); c.style.setProperty('--ang', (((e.clientX - r.left) / r.width) * 180 + 90).toFixed(0) + 'deg'); }));
    if (!FX.fine) { let t = 0; FX.tick(() => { t += 0.01; cards.forEach((c, i) => { const x = 50 + Math.sin(t + i) * 40, y = 50 + Math.cos(t * 0.8 + i) * 40; c.style.setProperty('--mx', x + '%'); c.style.setProperty('--my', y + '%'); c.style.setProperty('--ang', (x * 1.8 + 90) + 'deg'); }); }); }
  });
  return `<div class="lx2 hg"><div class="hg-grid-bg"></div>
    <section class="hg-hero wrap"><span class="hg-tag">◇ HOLO-VITRIN · ${esc(C.name)}</span><h1 class="hg-title" data-split="c">${fill(C.hero.title)}</h1><p class="lead" data-fx>${fill(C.hero.lead)}</p><div class="hero-cta" data-fx>${LX.cta()}</div></section>
    <section class="wrap hg-needs" data-fx>${SKINS.map((s) => `<a class="hg-chip" href="#/${NR}/${s.k}"><span>${esc(s.name)}</span><b>${LX.needN(s)}</b></a>`).join('')}</section>
    <section class="wrap hg-vitrin"><div class="hg-scan"></div>${P.slice(0, 12).map((p, i) => `<a class="hg-card lx2-p" href="#/termek/${p.slug}" style="--i:${i}"><span class="hg-foil"></span><span class="hg-glare"></span><span class="hg-img"><img src="${pimg(p)}" alt="" loading="lazy"></span><span class="hg-meta"><small>${esc(p.brand)}</small><b>${esc(p.name)}</b><em>${pft(p)}</em></span><span class="hg-id">#${String(p.id).padStart(4, '0')}</span></a>`).join('')}</section>
    <section class="sec wrap">${head('', 'A teljes kínálat', '')}<div class="ring-slot" data-lx="0"></div></section>${(LX.rings([S.products]), '')}
  </div>`;
};

/* ===================== 22. NEURON ===================== */
LAYOUTS.neuron = function () {
  const P = LX2.P().slice(0, 14);
  lx2Start(() => {
    const stage = $('.nr-stage'), nodesEl = $$('.nr-node'); if (!stage) return;
    const { c, g, dpr } = F3.canvas('nr-canvas', stage, false); c.style.position = 'absolute';
    F3.trackMouse();
    const W = () => c.width / dpr, H = () => c.height / dpr;
    const dots = Array.from({ length: innerWidth < 760 ? 55 : 110 }, () => ({ x: Math.random() * W(), y: Math.random() * H(), vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35 }));
    const prods = nodesEl.map((el, i) => ({ el, x: W() * (0.12 + 0.76 * ((i * 0.618) % 1)), y: H() * (0.2 + 0.65 * ((i * 0.382 + 0.1) % 1)), vx: 0, vy: 0, hx: 0, hy: 0 }));
    prods.forEach((p) => { p.hx = p.x; p.hy = p.y; });
    const [ar, ag, ab] = F3.rgb('--gold').map((v) => Math.round(v * 255));
    FX.tick(() => {
      if (!F3.visible(stage)) return;
      const r = stage.getBoundingClientRect(), mx = F3.mouse.x - r.left, my = F3.mouse.y - r.top;
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W(), H());
      for (const d of dots) { d.x += d.vx; d.y += d.vy; if (d.x < 0 || d.x > W()) d.vx *= -1; if (d.y < 0 || d.y > H()) d.vy *= -1; const dm = Math.hypot(d.x - mx, d.y - my); if (dm < 160) { d.x += (mx - d.x) * 0.006; d.y += (my - d.y) * 0.006; } }
      for (const p of prods) { p.x += (p.hx + Math.sin(performance.now() / 1600 + p.hx) * 14 - p.x) * 0.05; p.y += (p.hy + Math.cos(performance.now() / 1900 + p.hy) * 12 - p.y) * 0.05; p.el.style.transform = `translate(${p.x}px, ${p.y}px)`; }
      const all = [...dots, ...prods];
      for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) {
        const a = all[i], b = all[j], d = Math.hypot(a.x - b.x, a.y - b.y), lim = a.el || b.el ? 210 : 120;
        if (d < lim) { const near = Math.max(0, 1 - Math.hypot((a.x + b.x) / 2 - mx, (a.y + b.y) / 2 - my) / 220); g.strokeStyle = `rgba(${ar},${ag},${ab},${((1 - d / lim) * (0.18 + near * 0.7)).toFixed(3)})`; g.lineWidth = a.el || b.el ? 1.2 : 0.8; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); }
      }
      for (const d of dots) { const near = Math.max(0, 1 - Math.hypot(d.x - mx, d.y - my) / 180); g.fillStyle = `rgba(${ar},${ag},${ab},${0.35 + near * 0.65})`; g.beginPath(); g.arc(d.x, d.y, 1.6 + near * 2.4, 0, 6.3); g.fill(); }
    });
  });
  return `<div class="lx2 nr"><section class="nr-stage">
      <div class="nr-copy wrap"><span class="sec-num">◉ NEURÁLIS KIRAKAT · ${S.products.length} csomópont</span><h1 data-split="w">${fill(C.hero.title)}</h1><p class="lead" data-fx>${fill(C.hero.lead)}</p><div class="hero-cta" data-fx>${LX.cta()}</div></div>
      ${P.map((p) => `<a class="nr-node lx2-p" href="#/termek/${p.slug}"><span class="nr-img"><img src="${pimg(p)}" alt=""></span><span class="nr-lab"><b>${esc(p.name)}</b><em>${pft(p)}</em></span></a>`).join('')}
    </section>
    <section class="sec wrap"><div class="nr-syn">${SKINS.map((s) => `<a href="#/${NR}/${s.k}"><i></i><b>${esc(s.name)}</b><span>${LX.needN(s)} kapcsolat</span></a>`).join('')}</div></section>
    <section class="sec wrap">${head('', 'Minden csomópont', '')}<div class="ring-slot" data-lx="0"></div></section>${(LX.rings([S.products]), '')}
  </div>`;
};

/* ===================== 23. FOLYADÉK (WebGL) ===================== */
LAYOUTS.folyadek = function () {
  const P = LX2.P();
  lx2Start(() => {
    const cv = document.createElement('canvas'); cv.className = 'fl-gl'; document.body.prepend(cv); FX.add(cv);
    const gl = cv.getContext('webgl', { antialias: false, premultipliedAlpha: false });
    if (!gl) { cv.remove(); document.body.classList.add('fl-nogl'); return; }
    const vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
    const fs = `precision mediump float;uniform vec2 r;uniform float t;uniform vec2 m;uniform vec3 c1;uniform vec3 c2;uniform vec3 c3;
      float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}
      float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p*=2.02;a*=.5;}return v;}
      void main(){vec2 uv=gl_FragCoord.xy/r;vec2 p=uv*vec2(r.x/r.y,1.)*2.2;float d=length((uv-m)*vec2(r.x/r.y,1.));
        vec2 q=vec2(fbm(p+t*.04),fbm(p+vec2(5.2,1.3)-t*.035));
        vec2 w=vec2(fbm(p+3.5*q+vec2(1.7,9.2)+t*.06),fbm(p+3.5*q+vec2(8.3,2.8)-t*.05));
        float f=fbm(p+3.*w+.6*exp(-d*5.)*sin(t*2.-d*24.));
        vec3 col=mix(c1,c2,clamp(f*f*2.2,0.,1.));col=mix(col,c3,clamp(length(w)*.9-.35,0.,1.));
        col=mix(c1,col,.74);float spec=pow(clamp(f*1.25,0.,1.),6.);col+=spec*.55+.18*exp(-d*9.);
        gl_FragColor=vec4(col,1.);}`;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { cv.remove(); document.body.classList.add('fl-nogl'); return; }
    gl.useProgram(pr);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = (k) => gl.getUniformLocation(pr, k);
    gl.uniform3fv(U('c1'), F3.rgb('--bg')); gl.uniform3fv(U('c2'), F3.rgb('--gold')); gl.uniform3fv(U('c3'), F3.rgb('--rose'));
    const scale = 0.5;   // fél felbontás: sima és gyors
    const fit = () => { cv.width = innerWidth * scale; cv.height = innerHeight * scale; gl.viewport(0, 0, cv.width, cv.height); gl.uniform2f(U('r'), cv.width, cv.height); };
    fit(); FX.on(window, 'resize', fit);
    let mx = 0.5, my = 0.5, tx = 0.5, ty = 0.5; FX.on(window, 'pointermove', (e) => { tx = e.clientX / innerWidth; ty = 1 - e.clientY / innerHeight; }, { passive: true });
    const t0 = performance.now();
    FX.tick((t) => { if (FX.reduce && t - t0 > 100) return; mx += (tx - mx) * 0.05; my += (ty - my) * 0.05; gl.uniform1f(U('t'), (t - t0) / 1000 + scrollY * 0.002); gl.uniform2f(U('m'), mx, my); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); });
  });
  return `<div class="lx2 fl">
    <section class="fl-hero wrap"><div class="fl-glass fl-main"><span class="sec-num">${esc(C.name)}</span><h1 data-split="w">${fill(C.hero.title)}</h1><p class="lead">${fill(C.hero.lead)}</p><div class="hero-cta">${LX.cta()}</div></div></section>
    <section class="wrap fl-grid">${P.slice(0, 9).map((p, i) => `<a class="fl-glass fl-card lx2-p" data-fx href="#/termek/${p.slug}" style="--d:${i * 0.07}s"><span class="fl-img"><img src="${pimg(p)}" alt="" loading="lazy"></span><b>${esc(p.name)}</b><em>${pft(p)}</em></a>`).join('')}</section>
    <section class="wrap fl-needs">${SKINS.map((s) => `<a class="fl-glass fl-need" data-fx href="#/${NR}/${s.k}"><b>${esc(s.name)}</b><span>${esc(s.d)}</span></a>`).join('')}</section>
    <section class="sec wrap">${head('', 'A teljes kínálat', '')}<div class="ring-slot" data-lx="0"></div></section>${(LX.rings([S.products]), '')}
  </div>`;
};

/* ===================== 24. GALAXIS ===================== */
LAYOUTS.galaxis = function () {
  const P = LX2.P().slice(0, 12);
  lx2Start(() => {
    const sec = $('.gx-pin'), st = $('.gx-stage'), sys = $('.gx-sys'), planets = $$('.gx-pl'); if (!sec) return;
    const { c, g, dpr } = F3.canvas('gx-stars', st, false); c.style.position = 'absolute';
    const N = innerWidth < 760 ? 380 : 900, stars = Array.from({ length: N }, () => ({ x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2, z: Math.random() }));
    const vel = FX.velocity(); let hover = null;
    planets.forEach((p) => { FX.on(p, 'pointerenter', () => { hover = p; }); FX.on(p, 'pointerleave', () => { hover = null; }); });
    const orb = planets.map((el, i) => ({ el, ring: i % 3, a: (i / planets.length) * Math.PI * 2 * 3.1, sp: 0.0016 + (i % 3 === 0 ? 0.0012 : i % 3 === 1 ? 0.0007 : 0.0004) }));
    FX.tick(() => {
      if (!F3.visible(st)) return;
      const p = FX.span(sec), W = c.width / dpr, H = c.height / dpr, speed = 0.0025 + Math.abs(vel()) * 0.0012 + p * p * 0.022;
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.fillStyle = 'rgba(2,4,10,.55)'; g.fillRect(0, 0, W, H);
      for (const s of stars) { s.z -= speed; if (s.z <= 0.02) { s.z = 1; s.x = (Math.random() - 0.5) * 2; s.y = (Math.random() - 0.5) * 2; } const k = 0.5 / s.z, x = W / 2 + s.x * W * k * 0.5, y = H / 2 + s.y * H * k * 0.5, r = (1 - s.z) * 2.2; const k2 = 0.5 / (s.z + speed * 6), x2 = W / 2 + s.x * W * k2 * 0.5, y2 = H / 2 + s.y * H * k2 * 0.5; g.strokeStyle = `rgba(255,255,255,${(1 - s.z).toFixed(2)})`; g.lineWidth = r; g.beginPath(); g.moveTo(x2, y2); g.lineTo(x, y); g.stroke(); }
      const zoom = 1 + p * 1.8, R = Math.min(W, H);
      sys.style.transform = `translate(-50%,-50%) scale(${zoom})`; sys.style.opacity = FX.clamp(1.3 - p * 1.4);
      for (const o of orb) { if (o.el !== hover) o.a += o.sp * (1 + p * 4); const rx = R * (0.2 + o.ring * 0.11) * 1.5, ry = rx * 0.34, x = Math.cos(o.a) * rx, y = Math.sin(o.a) * ry, depth = (Math.sin(o.a) + 1) / 2; o.el.style.transform = `translate(${x}px, ${y}px) scale(${0.62 + depth * 0.55})`; o.el.style.zIndex = Math.round(depth * 100); o.el.style.opacity = 0.55 + depth * 0.45; }
      $('.gx-copy').style.opacity = FX.clamp(1 - p * 2.2); $('.gx-end').style.opacity = FX.clamp((p - 0.7) * 4);
    });
  });
  return `<div class="lx2 gx"><section class="gx-pin"><div class="gx-stage">
      <div class="gx-sys"><div class="gx-sun" style="background-image:url(${LX.hero()})"></div><i class="gx-orbit o0"></i><i class="gx-orbit o1"></i><i class="gx-orbit o2"></i>
        ${P.map((p) => `<a class="gx-pl lx2-p" href="#/termek/${p.slug}"><img src="${pimg(p)}" alt=""><span><b>${esc(p.name)}</b><em>${pft(p)}</em></span></a>`).join('')}</div>
      <div class="gx-copy wrap"><span class="sec-num">✦ ${esc(C.name)} UNIVERZUM</span><h1 data-split="c">${fill(C.hero.title)}</h1><p class="lead">${fill(C.hero.lead)}</p><small class="muted">görgess – ugrás a térbe</small></div>
      <div class="gx-end wrap"><h2>Megérkeztél.</h2><div class="hero-cta">${LX.cta()}</div></div>
    </div></section>
    <section class="sec wrap">${head('', 'Csillagképek', '')}<div class="gx-const">${SKINS.map((s) => `<a href="#/${NR}/${s.k}" style="background-image:url(${s.img})"><b>${esc(s.name)}</b><span>${LX.needN(s)} ${L_('itemWord', 'termék')}</span></a>`).join('')}</div></section>
    <section class="sec wrap"><div class="ring-slot" data-lx="0"></div></section>${(LX.rings([S.products]), '')}
  </div>`;
};

/* ===================== 25. TERMINÁL ===================== */
LAYOUTS.terminal = function () {
  const P = LX2.P();
  const lines = [`> ${C.name.toLowerCase().replace(/\s+/g, '_')}.sys betöltése ............ OK`, `> kínálat indexelése: ${S.products.length} tétel ........ OK`,
    `> kategóriák: ${SKINS.slice(0, 4).map((s) => s.name).join(' / ')}`, `> ajánlómotor: ONLINE · AI nélkül, szabályalapon`, '> várakozás a felhasználóra_'];
  lx2Start(() => {
    // mátrix-eső a bolt saját szavaiból
    const { c, g, dpr } = F3.canvas('tm-rain'); const fs = 16, chars = (C.name + SKINS.map((s) => s.name).join('') + '01').replace(/\s/g, '').split('');
    let cols = []; const reset = () => { cols = Array.from({ length: Math.ceil(c.width / dpr / fs) }, () => Math.random() * -50); }; reset(); FX.on(window, 'resize', reset);
    const [ar, ag, ab] = F3.rgb('--gold').map((v) => Math.round(v * 255)); let last = 0;
    FX.tick((t) => { if (t - last < 55) return; last = t; g.setTransform(dpr, 0, 0, dpr, 0, 0); g.fillStyle = 'rgba(0,0,0,.09)'; g.fillRect(0, 0, c.width, c.height); g.font = fs + 'px monospace'; cols.forEach((y, i) => { g.fillStyle = Math.random() > 0.96 ? '#fff' : `rgba(${ar},${ag},${ab},.75)`; g.fillText(chars[(Math.random() * chars.length) | 0], i * fs, y * fs); cols[i] = y * fs > c.height / dpr && Math.random() > 0.975 ? 0 : y + 1; }); });
    // gépelő terminál
    const term = $('.tm-term pre'); let li = 0, ci = 0, out = '';
    FX.every(() => { if (li >= lines.length) return; out += lines[li][ci++] || ''; if (ci > lines[li].length) { out += '\n'; li++; ci = 0; } term.textContent = out; }, 22);
    // radar: a termékek pontként
    const blips = $$('.tm-blip');
    blips.forEach((b, i) => { const a = (i / blips.length) * 6.28 + i, r = 18 + ((i * 37) % 70); b.style.left = 50 + Math.cos(a) * r * 0.5 + '%'; b.style.top = 50 + Math.sin(a) * r * 0.5 + '%'; b.style.setProperty('--a', ((Math.atan2(Math.sin(a), Math.cos(a)) * 180 / Math.PI + 360) % 360) + 'deg'); });
  });
  return `<div class="lx2 tm">
    <section class="tm-hero wrap"><div><span class="tm-tag">[ RENDSZER AKTÍV ] · ${new Date().toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}</span>
      <h1 class="tm-glitch" data-text="${esc(String(fill(C.hero.title)).replace(/<[^>]+>/g, ''))}">${esc(String(fill(C.hero.title)).replace(/<[^>]+>/g, ''))}</h1>
      <div class="tm-term"><div class="tm-bar"><i></i><i></i><i></i><span>terminál — ${esc(C.name)}</span></div><pre></pre></div><div class="hero-cta">${LX.cta()}</div></div>
      <div class="tm-radar"><div class="tm-sweep"></div><i class="r1"></i><i class="r2"></i><i class="r3"></i>${P.slice(0, 14).map((p) => `<a class="tm-blip" href="#/termek/${p.slug}"><span>${esc(p.name)} · ${pft(p)}</span></a>`).join('')}</div></section>
    <section class="wrap tm-grid">${P.slice(0, 12).map((p, i) => `<a class="tm-card lx2-p" data-fx href="#/termek/${p.slug}"><i class="c1"></i><i class="c2"></i><i class="c3"></i><i class="c4"></i><span class="tm-lock">◎ CÉLPONT RÖGZÍTVE</span><img src="${pimg(p)}" alt="" loading="lazy"><code>ID:${String(p.id).padStart(4, '0')} · ${esc((p.cats[0] || '').toUpperCase())}</code><b>${esc(p.name)}</b><em>${pft(p)}</em></a>`).join('')}</section>
  </div>`;
};

/* ===================== 26. MORFÓZIS ===================== */
LAYOUTS.morfozis = function () {
  const P = LX2.P();
  lx2Start(() => {
    const goo = $('.mf-goo'), blobs = $$('.mf-b', goo); F3.trackMouse();
    const st = blobs.map((b, i) => ({ b, x: 0, y: 0, a: i * 1.7, r: 120 + (i % 3) * 60 }));
    FX.tick((t) => { const r = goo.getBoundingClientRect(), mx = F3.mouse.x - r.left, my = F3.mouse.y - r.top; st.forEach((s, i) => { const tx = r.width / 2 + Math.cos(t / 2600 + s.a) * r.width * 0.3 + Math.sin(t / 1700 + i) * 60, ty = r.height / 2 + Math.sin(t / 3100 + s.a) * r.height * 0.28; const near = i === 0 && mx > 0 && my > 0 && mx < r.width && my < r.height; s.x += ((near ? mx : tx) - s.x) * (near ? 0.12 : 0.03); s.y += ((near ? my : ty) - s.y) * (near ? 0.12 : 0.03); s.b.style.transform = `translate(${s.x - s.r / 2}px, ${s.y - s.r / 2}px)`; }); });
  });
  return `<div class="lx2 mf">
    <svg width="0" height="0" style="position:absolute"><filter id="mfGoo"><feGaussianBlur in="SourceGraphic" stdDeviation="22" result="b"/><feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 26 -11" result="g"/><feComposite in="SourceGraphic" in2="g" operator="atop"/></filter></svg>
    <section class="mf-hero"><div class="mf-goo">${[0, 1, 2, 3, 4, 5].map((i) => `<span class="mf-b b${i}" style="width:${120 + (i % 3) * 60}px;height:${120 + (i % 3) * 60}px"></span>`).join('')}</div>
      <div class="wrap mf-copy"><span class="pill"><span class="dot"></span>${fill(C.hero.pill)}</span><h1 data-split="w">${fill(C.hero.title)}</h1><p class="lead" data-fx>${fill(C.hero.lead)}</p><div class="hero-cta" data-fx>${LX.cta()}</div></div>
      <div class="mf-shape" style="background-image:url(${LX.hero()})"></div></section>
    <section class="sec wrap"><div class="mf-bubbles">${SKINS.map((s, i) => `<a class="mf-bub" href="#/${NR}/${s.k}" style="--d:${i * 0.4}s;background-image:url(${s.img})"><b>${esc(s.name)}</b></a>`).join('')}</div></section>
    <section class="sec wrap"><div class="mf-grid">${P.slice(0, 9).map((p, i) => `<a class="mf-card lx2-p" data-fx href="#/termek/${p.slug}"><span class="mf-mask" style="--d:${i * 0.5}s"><img src="${pimg(p)}" alt="" loading="lazy"></span><b>${esc(p.name)}</b><em>${pft(p)}</em></a>`).join('')}</div></section>
    <section class="sec wrap">${head('', 'A teljes kínálat', '')}<div class="ring-slot" data-lx="0"></div></section>${(LX.rings([S.products]), '')}
  </div>`;
};

/* ===================== 27. KOCKA ===================== */
LAYOUTS.kocka = function () {
  const P = LX2.P(), st = LX.steps();
  const faces = [
    `<span class="sec-num">01 · ${esc(C.name)}</span><h1 data-split="w">${fill(C.hero.title)}</h1><p class="lead">${fill(C.hero.lead)}</p><div class="hero-cta">${LX.cta()}</div>`,
    `<span class="sec-num">02 · ${esc(C.labels.needsTitle)}</span><div class="kc-needs">${SKINS.slice(0, 6).map((s) => `<a href="#/${NR}/${s.k}" style="background-image:url(${s.img})"><b>${esc(s.name)}</b></a>`).join('')}</div>`,
    `<span class="sec-num">03 · Válogatás</span><div class="kc-prods">${P.slice(0, 6).map((p) => `<a class="lx2-p" href="#/termek/${p.slug}"><img src="${pimg(p)}" alt=""><b>${esc(p.name)}</b><em>${pft(p)}</em></a>`).join('')}</div>`,
    `<span class="sec-num">04 · ${esc(st.length ? C.ritual.title : C.advice.title)}</span>${st.length ? `<ol class="kc-steps">${st.slice(0, 5).map((s) => `<li><b>${esc(s.t)}</b><span>${esc(s.d)}</span></li>`).join('')}</ol>` : `<p class="lead">${fill(C.advice.text)}</p>`}<div class="hero-cta">${LX.contact()}</div>`,
  ];
  lx2Start(() => {
    const sec = $('.kc-pin'), cube = $('.kc-cube'), dots = $$('.kc-dots i'); if (!sec) return;
    const size = () => { const w = Math.min(innerWidth * 0.86, 1100); cube.style.setProperty('--w', w + 'px'); };
    size(); FX.on(window, 'resize', size);
    FX.tick(() => { if (innerWidth < 760) return; const p = FX.span(sec), f = p * 3, k = Math.round(f); const ease = f + (Math.round(f) - f) * 0.35; cube.style.transform = `translateZ(calc(var(--w) / -2)) rotateX(${Math.sin(p * Math.PI) * -6}deg) rotateY(${-ease * 90}deg)`; dots.forEach((d, i) => d.classList.toggle('on', i === k)); });
  });
  return `<div class="lx2 kc"><section class="kc-pin"><div class="kc-stage"><div class="kc-cube">${faces.map((h, i) => `<div class="kc-face f${i}" style="${i === 0 ? `background-image:linear-gradient(90deg, rgba(var(--shade-rgb),.92), rgba(var(--shade-rgb),.4)), url(${LX.hero()})` : ''}"><div class="kc-in">${h}</div></div>`).join('')}</div>
      <div class="kc-dots">${faces.map(() => '<i></i>').join('')}</div><small class="kc-hint muted">görgess – a kocka fordul</small></div></section>
    <section class="sec wrap">${head('', 'A teljes kínálat', '')}<div class="ring-slot" data-lx="0"></div></section>${(LX.rings([S.products]), '')}
  </div>`;
};

/* ===================== 28. ALAGÚT ===================== */
LAYOUTS.alagut = function () {
  const P = LX2.P().slice(0, 18), GAP = 520;
  lx2Start(() => {
    const sec = $('.ag-pin'), world = $('.ag-world'), items = $$('.ag-it', world), frames = $$('.ag-fr', world); if (!sec) return;
    const total = (P.length + 2) * GAP;
    let mx = 0, my = 0; FX.on(window, 'pointermove', (e) => { mx = (e.clientX / innerWidth - 0.5); my = (e.clientY / innerHeight - 0.5); }, { passive: true });
    let cx = 0, cy = 0;
    FX.tick(() => {
      const p = FX.span(sec), z = p * total; cx += (mx - cx) * 0.06; cy += (my - cy) * 0.06;
      world.style.transform = `translateZ(${z}px) rotateY(${cx * -8}deg) rotateX(${cy * 6}deg)`;
      items.forEach((it) => { const iz = +it.dataset.z, d = iz + z; it.style.opacity = FX.clamp(d < -3200 ? (d + 4200) / 1000 : d > 120 ? 1 - (d - 120) / 260 : 1) * FX.clamp(0.08 + p * 14); });
      $('.ag-hud b').textContent = Math.round(p * 100) + '%';
      $('.ag-copy').style.opacity = FX.clamp(1 - p * 6); $('.ag-end').style.opacity = FX.clamp((p - 0.86) * 8);
    });
  });
  const pos = ['l', 'r', 't', 'b'];
  return `<div class="lx2 ag"><section class="ag-pin" style="height:${(P.length + 3) * 60}vh"><div class="ag-stage"><div class="ag-world">
      ${Array.from({ length: P.length + 3 }, (_, i) => `<i class="ag-fr" style="transform:translateZ(${-i * GAP}px)"></i>`).join('')}
      ${P.map((p, i) => `<a class="ag-it ${pos[i % 4]} lx2-p" href="#/termek/${p.slug}" data-z="${-(i + 1) * GAP}" style="--z:${-(i + 1) * GAP}px"><img src="${pimg(p)}" alt=""><span><b>${esc(p.name)}</b><em>${pft(p)}</em></span></a>`).join('')}
    </div>
    <div class="ag-copy wrap"><span class="sec-num">▶ BELÉPÉS · ${esc(C.name)}</span><h1 data-split="c">${fill(C.hero.title)}</h1><p class="lead">görgess – repülj be a kínálatba</p></div>
    <div class="ag-end wrap"><h2>A kínálat végére értél.</h2><div class="hero-cta">${LX.cta()}</div></div>
    <div class="ag-hud">MÉLYSÉG <b>0%</b></div></div></section>
    <section class="sec wrap"><div class="ring-slot" data-lx="0"></div></section>${(LX.rings([S.products]), '')}
  </div>`;
};

/* ===================== 29. PIXELVIHAR ===================== */
LAYOUTS.pixelvihar = function () {
  const P = LX2.P().slice(0, 8);
  lx2Start(async () => {
    const hero = $('.px-hero'); if (!hero) return;
    const { c, g, dpr } = F3.canvas('px-cv', hero, false); c.style.position = 'absolute';
    F3.trackMouse();
    const sample = async (src, w, h, step, contain) => {
      const im = await F3.loadImg(src); if (!im) return [];
      const o = document.createElement('canvas'); o.width = w; o.height = h; const x = o.getContext('2d');
      if (contain) { x.fillStyle = 'rgba(0,0,0,0)'; const s = Math.min(w / im.width, h / im.height) * 0.9; x.drawImage(im, (w - im.width * s) / 2, (h - im.height * s) / 2, im.width * s, im.height * s); }
      else { const s = Math.max(w / im.width, h / im.height); x.drawImage(im, (w - im.width * s) / 2, (h - im.height * s) / 2, im.width * s, im.height * s); }
      const d = x.getImageData(0, 0, w, h).data, pts = [];
      for (let yy = 0; yy < h; yy += step) for (let xx = 0; xx < w; xx += step) { const i = (yy * w + xx) * 4; if (d[i + 3] < 40) continue; if (contain && d[i] > 238 && d[i + 1] > 238 && d[i + 2] > 238) continue; pts.push({ hx: xx, hy: yy, c: `rgb(${d[i]},${d[i + 1]},${d[i + 2]})` }); }
      return pts;
    };
    const W = c.width / dpr, H = c.height / dpr, step = innerWidth < 760 ? 7 : 6;
    const pts = (await sample(LX.hero(), Math.round(W), Math.round(H), step, false)).map((p) => ({ ...p, x: Math.random() * W, y: Math.random() * H - H, vx: 0, vy: 0 }));
    if (!pts.length || !$('.px-hero')) return;
    FX.tick(() => {
      if (!F3.visible(hero)) return;
      const r = hero.getBoundingClientRect(), mx = F3.mouse.x - r.left, my = F3.mouse.y - r.top, blow = FX.clamp(-r.top / r.height) * 2;
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
      for (const p of pts) {
        const dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
        if (d2 < 13000) { const f = (13000 - d2) / 13000 * 6; const d = Math.sqrt(d2) || 1; p.vx += dx / d * f; p.vy += dy / d * f; }
        p.vx += (p.hx + (p.hx - W / 2) * blow - p.x) * 0.045; p.vy += (p.hy + (p.hy - H / 2) * blow - p.y) * 0.045; p.vx *= 0.82; p.vy *= 0.82; p.x += p.vx; p.y += p.vy;
        g.fillStyle = p.c; g.fillRect(p.x, p.y, step - 1, step - 1);
      }
    });
    // termék-morf: egy vásznon a termékek pixelekből alakulnak át egymásba
    const box = $('.px-morph'), lab = $('.px-lab'); if (!box) return;
    const m = F3.canvas('px-mcv', box, false); m.c.style.position = 'absolute';
    const MW = m.c.width / m.dpr, MH = m.c.height / m.dpr;
    const sets = []; for (const p of P) sets.push(await sample(pimg(p), Math.round(MW), Math.round(MH), 5, true));
    const parts = Array.from({ length: Math.max(...sets.map((s) => s.length), 1) }, () => ({ x: MW / 2, y: MH / 2, tx: MW / 2, ty: MH / 2, c: '#fff', a: 0 }));
    let k = -1; const next = () => { k = (k + 1) % P.length; const s = sets[k] || []; parts.forEach((q, i) => { const t = s[i % Math.max(1, s.length)]; if (t && i < s.length) { q.tx = t.hx; q.ty = t.hy; q.c = t.c; q.ta = 1; } else { q.tx = MW / 2 + (Math.random() - 0.5) * MW; q.ty = MH + 40; q.ta = 0; } }); lab.innerHTML = `<b>${esc(P[k].name)}</b><em>${pft(P[k])}</em><a class="btn btn-gold" href="#/termek/${P[k].slug}">Megnézem</a>`; };
    next(); FX.every(next, 3800);
    FX.tick(() => { if (!F3.visible(box)) return; m.g.setTransform(m.dpr, 0, 0, m.dpr, 0, 0); m.g.clearRect(0, 0, MW, MH); for (const q of parts) { q.x += (q.tx - q.x) * 0.075; q.y += (q.ty - q.y) * 0.075; q.a += ((q.ta || 0) - q.a) * 0.08; if (q.a < 0.03) continue; m.g.globalAlpha = q.a; m.g.fillStyle = q.c; m.g.fillRect(q.x, q.y, 4, 4); } m.g.globalAlpha = 1; });
  });
  return `<div class="lx2 px"><section class="px-hero"><div class="px-copy wrap"><span class="sec-num">▦ ${esc(C.name)}</span><h1 data-split="w">${fill(C.hero.title)}</h1><p class="lead" data-fx>${fill(C.hero.lead)}</p><div class="hero-cta" data-fx>${LX.cta()}</div><small class="muted">fújd szét az egérrel – görgetésre szétrobban</small></div></section>
    <section class="sec wrap px-mw"><div class="px-morph"></div><div class="px-lab"></div></section>
    <section class="sec wrap">${head('', 'A teljes kínálat', '')}<div class="ring-slot" data-lx="0"></div></section>${(LX.rings([S.products]), '')}
  </div>`;
};

/* ===================== 30. AURORA – beszélgető kirakat ===================== */
LAYOUTS.aurora = function () {
  const P = S.products;
  const asks = [
    ...SKINS.slice(0, 4).map((s) => ({ q: `Mit ajánlasz: ${s.name.toLowerCase()}?`, pick: () => P.filter((p) => has(p, s.cats) && p.images.length).slice(0, 4), a: `${s.name} — ${LX.needN(s)} találat. ${s.d} Ezeket nézd meg elsőként:` })),
    { q: 'Mutasd a legolcsóbbakat!', pick: () => P.filter((p) => p.price > 0 && p.images.length).sort((a, b) => a.price - b.price).slice(0, 4), a: 'A legkedvezőbb árú tételek, olcsóbbtól felfelé:' },
    { q: 'Mi a legprémiumabb?', pick: () => P.filter((p) => p.price > 0 && p.images.length).sort((a, b) => b.price - a.price).slice(0, 4), a: 'A kínálat csúcsa – ha valami igazán különlegeset keresel:' },
    { q: 'Lepj meg valamivel!', pick: () => [...P].filter((p) => p.images.length).sort(() => Math.random() - 0.5).slice(0, 4), a: 'Íme néhány véletlen kincs a kínálatból:' },
  ];
  lx2Start(() => {
    const { c, g, dpr } = F3.canvas('au-cv');
    const cols = [F3.rgb('--gold'), F3.rgb('--rose'), [0.35, 0.95, 0.75], [0.45, 0.6, 1]].map((v) => v.map((x) => Math.round(x * 255)));
    FX.tick((t) => {
      const W = c.width / dpr, H = c.height / dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H); g.globalCompositeOperation = 'lighter';
      cols.forEach((col, k) => { for (let x = 0; x <= W; x += 6) { const y = H * (0.28 + k * 0.07) + Math.sin(x / (220 + k * 60) + t / (2400 + k * 500)) * 70 + Math.sin(x / 90 + t / 1300 + k) * 18; const h = 160 + Math.sin(x / 140 + t / 1800 + k * 2) * 90; const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, `rgba(${col[0]},${col[1]},${col[2]},0)`); gr.addColorStop(0.25, `rgba(${col[0]},${col[1]},${col[2]},.10)`); gr.addColorStop(1, `rgba(${col[0]},${col[1]},${col[2]},0)`); g.fillStyle = gr; g.fillRect(x, y, 6, h); } });
      g.globalCompositeOperation = 'source-over';
    });
    const log = $('.au-log'), chips = $('.au-chips'), inp = $('#auIn');
    const say = (who, html, typing) => new Promise((res) => {
      const b = document.createElement('div'); b.className = 'au-msg ' + who; log.appendChild(b); log.scrollTop = log.scrollHeight;
      if (!typing || FX.reduce) { b.innerHTML = html; res(b); return; }
      b.innerHTML = '<span class="au-dots"><i></i><i></i><i></i></span>';
      FX.later(() => { const txt = html; let i = 0; b.textContent = ''; FX.every(() => { if (i <= txt.length) { b.textContent = txt.slice(0, i); i += 2; log.scrollTop = log.scrollHeight; } else if (!b.dataset.done) { b.dataset.done = 1; res(b); } }, 18); }, 650);
    });
    const show = async (q) => {
      await say('me', esc(q.q));
      const b = await say('ai', q.a, true);
      const ps = q.pick();
      const row = document.createElement('div'); row.className = 'au-prods';
      row.innerHTML = ps.length ? ps.map((p, i) => `<a class="au-p lx2-p" href="#/termek/${p.slug}" style="--d:${i * 0.12}s"><img src="${pimg(p)}" alt=""><b>${esc(p.name)}</b><em>${pft(p)}</em></a>`).join('') : '<span class="muted">Erre most nincs találat – próbálj egy másik kérdést.</span>';
      b.after(row); log.scrollTop = log.scrollHeight;
    };
    chips.innerHTML = asks.map((a, i) => `<button class="chip" data-q="${i}">${esc(a.q)}</button>`).join('');
    $$('button', chips).forEach((btn) => (btn.onclick = () => show(asks[+btn.dataset.q])));
    $('#auForm').onsubmit = (e) => { e.preventDefault(); const v = inp.value.trim(); if (!v) return; inp.value = ''; const r = S.products.filter((p) => match(p, v)).filter((p) => p.images.length).slice(0, 4); show({ q: v, a: r.length ? `Ezt találtam erre: „${v}”` : `Erre nem találtam pontos egyezést: „${v}”. Nézd meg ezeket helyette:`, pick: () => (r.length ? r : asks[asks.length - 1].pick()) }); };
    FX.later(() => say('ai', `Szia! A(z) ${C.name} kirakata vagyok. ${S.products.length} tételt ismerek. Kérdezz, vagy válassz lent egy témát!`, true), 1300);
  });
  return `<div class="lx2 au"><section class="au-hero wrap"><div class="au-left"><span class="sec-num">◌ BESZÉLGETŐ KIRAKAT · ${esc(C.name)}</span><h1 data-split="w">${fill(C.hero.title)}</h1><p class="lead" data-fx>${fill(C.hero.lead)}</p><div class="hero-cta" data-fx>${LX.cta()}</div></div>
      <div class="au-chat"><div class="au-head"><span class="au-orb"></span><b>Kirakat-asszisztens</b><small>szabályalapú · AI nélkül</small></div><div class="au-log"></div><div class="au-chips"></div>
        <form id="auForm" class="au-form"><input id="auIn" placeholder="Írd be, mit keresel…" autocomplete="off"><button class="btn btn-gold">➤</button></form></div></section>
    <section class="sec wrap">${head('', 'A teljes kínálat', '')}<div class="ring-slot" data-lx="0"></div></section>${(LX.rings([S.products]), '')}
  </div>`;
};
