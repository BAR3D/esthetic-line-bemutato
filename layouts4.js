/* Bemutató Gyár – 4. sorozat: 10 extrém futurisztikus felépítés (31–40).
   Fizika, WebGL-lencse, 3D-terep, részecskéből összeálló név, AR-HUD – a projekt saját tartalmából, AI nélkül.
   Épít a 2–3. sorozatra: FX, lx2Start, LX2 (layouts2.js) és F3 (layouts3.js). */
'use strict';

window.LAYOUT_META4 = {
  tervrajz: { name: 'Tervrajz', desc: 'Kék műszaki tervrajz – az egérlencse alatt előtűnik a valódi fotó; méretvonalak, adatlapos termékek.', light: false, shopView: 'racs' },
  showroom: { name: 'Showroom', desc: 'Sötét bemutatóterem tükröződő padlóval: húzással forgatható 3D körpódium, reflektorok.', light: false, shopView: 'kor' },
  portal: { name: 'Portál', desc: 'Energiagyűrű-kapu: görgetésre kitágul, és átlépsz rajta a márka világába.', light: false, shopView: 'kor' },
  gravitacio: { name: 'Gravitáció', desc: 'Valódi fizika: a termékek lepotyognak, megfoghatod, eldobhatod, egymásnak ütköznek.', light: false, shopView: 'racs' },
  lencse: { name: 'Lencse', desc: 'WebGL-nagyító: fénytörés és színszórás az egér alatt, kattintásra vízhullám a képen.', light: false, shopView: 'racs' },
  domborzat: { name: 'Domborzat', desc: '3D pontfelhő-táj a nyitóképből: hullámzik, az egér alatt gyűrődik, görgetésre átrepülsz rajta.', light: false, shopView: 'kor' },
  tabla: { name: 'Indulási tábla', desc: 'Pergő betűs reptéri kijelző: a kínálat sorai kattogva állnak be, laponként váltanak.', light: false, shopView: 'racs' },
  diorama: { name: 'Dioráma', desc: 'Rétegzett 3D jelenet: a kép, az igények és a termékek külön mélységben – berepülsz közéjük.', light: false, shopView: 'kor' },
  aramlas: { name: 'Áramlás', desc: 'Áramló részecskemező, ami időnként a cég nevévé áll össze; adatkártyák mini-grafikonnal.', light: false, shopView: 'racs' },
  ar: { name: 'AR-szkenner', desc: 'Kiterjesztett valóság: a jelenetekben a HUD bemérőkeretekkel azonosítja és felcímkézi a termékeket.', light: false, shopView: 'kor' },
};
Object.assign(window.LAYOUT_META, window.LAYOUT_META4);

const F4 = {
  /** egér vagy – ha 3 mp-ig nem mozdul – magától vándorló pont az elemen belül (0..1) */
  wander(el) {
    const s = { x: 0.62, y: 0.45, tx: 0.62, ty: 0.45, last: 0 };
    FX.on(el, 'pointermove', (e) => { const r = el.getBoundingClientRect(); s.tx = (e.clientX - r.left) / r.width; s.ty = (e.clientY - r.top) / r.height; s.last = performance.now(); });
    FX.tick((t) => { if (t - s.last > 3000) { s.tx = 0.5 + Math.sin(t / 2300) * 0.3; s.ty = 0.5 + Math.sin(t / 1700 + 1) * 0.25; } s.x += (s.tx - s.x) * 0.08; s.y += (s.ty - s.y) * 0.08; });
    return s;
  },
  /** determinisztikus ál-véletlen a termék azonosítójából */
  rnd: (seed) => { let x = Math.sin(seed * 9301 + 49297) * 233280; return x - Math.floor(x); },
  plain: (h) => String(h || '').replace(/<[^>]+>/g, ''),
};

/* ===================== 31. TERVRAJZ ===================== */
LAYOUTS.tervrajz = function () {
  const P = LX2.P(), st = LX.steps();
  lx2Start(() => {
    const hero = $('.tr-hero'); if (!hero) return;
    const lens = F4.wander(hero), ph = $('.tr-photo'), rd = $('.tr-read');
    FX.tick(() => { const r = hero.getBoundingClientRect(); const x = lens.x * r.width, y = lens.y * r.height; ph.style.clipPath = `circle(${Math.min(200, r.width * 0.16)}px at ${x}px ${y}px)`; hero.style.setProperty('--lx', x + 'px'); hero.style.setProperty('--ly', y + 'px'); rd.textContent = `X ${String(Math.round(x)).padStart(4, '0')}  ·  Y ${String(Math.round(y)).padStart(4, '0')}`; });
    // a fázis-vonal a görgetéssel rajzolódik
    const ph2 = $('.tr-phase'); if (ph2) FX.tick(() => ph2.style.setProperty('--p', FX.prog(ph2) * 1.6));
  });
  return `<div class="lx2 tr">
    <section class="tr-hero"><div class="tr-blue" style="background-image:url(${LX.hero()})"></div><div class="tr-photo" style="background-image:url(${LX.hero()})"></div><div class="tr-grid"></div>
      <span class="tr-cross"></span><span class="tr-read"></span>
      <svg class="tr-dim" viewBox="0 0 1000 600" preserveAspectRatio="none"><path d="M60 560 H940" /><path d="M60 548 V572 M940 548 V572" /><path d="M960 60 V540" /><path d="M948 60 H972 M948 540 H972" /><circle cx="760" cy="180" r="70" /><path d="M690 180 H830 M760 110 V250" /></svg>
      <div class="tr-copy wrap"><span class="tr-tag">TERV · ${esc(C.name).toUpperCase()} · M 1:50</span><h1 data-split="w">${fill(C.hero.title)}</h1><p class="lead" data-fx>${fill(C.hero.lead)}</p><div class="hero-cta" data-fx>${LX.cta()}</div></div>
      <div class="tr-stamp">RAJZSZÁM ${String(S.products.length).padStart(4, '0')} · ${new Date().getFullYear()} · JÓVÁHAGYVA</div></section>
    <section class="sec wrap"><div class="tr-needs">${SKINS.map((s, i) => `<a href="#/${NR}/${s.k}" data-fx><span class="tr-n">${String.fromCharCode(65 + (i % 26))}</span><b>${esc(s.name)}</b><small>${LX.needN(s)} ${L_('itemWord', 'tétel')}</small></a>`).join('')}</div></section>
    <section class="sec wrap"><div class="tr-sheets">${P.slice(0, 12).map((p, i) => `<a class="tr-sheet lx2-p" data-fx href="#/termek/${p.slug}"><span class="tr-img"><img src="${pimg(p)}" alt="" loading="lazy"><i class="tr-w"></i><i class="tr-h"></i></span><span class="tr-tb"><span><small>MEGNEVEZÉS</small><b>${esc(p.name)}</b></span><span><small>RAJZSZÁM</small><b>${String(p.id).padStart(4, '0')}-${String(i + 1).padStart(2, '0')}</b></span><span><small>KATEGÓRIA</small><b>${esc(p.cats[0] || '—')}</b></span><span><small>ÁR</small><b class="tr-pr">${pft(p)}</b></span></span></a>`).join('')}</div></section>
    ${st.length ? `<section class="sec wrap tr-phase"><h2 class="tr-h2">${esc(C.ritual.title)}</h2><div class="tr-line"><i></i></div><ol>${st.map((s, i) => `<li data-fx><span>FÁZIS ${String(i + 1).padStart(2, '0')}</span><b>${esc(s.t)}</b><p>${esc(s.d)}</p></li>`).join('')}</ol></section>` : ''}
    <section class="sec wrap">${head('', 'A teljes kínálat', '')}<div class="ring-slot" data-lx="0"></div></section>${(LX.rings([S.products]), '')}
  </div>`;
};

/* ===================== 32. SHOWROOM ===================== */
LAYOUTS.showroom = function () {
  const P = LX2.P().slice(0, 12), N = P.length;
  lx2Start(() => {
    const ring = $('.sr-ring'), stage = $('.sr-stage'), info = $('.sr-info'), items = $$('.sr-it'); if (!ring || !N) return;
    const R = () => Math.max(300, Math.min(innerWidth * 0.42, 620)) * (N > 8 ? 1.15 : 1);
    items.forEach((it, i) => it.style.setProperty('--a', (i * 360 / N) + 'deg'));
    let ang = 0, vel = 0.04, drag = false, lx = 0, moved = 0, front = -1;
    FX.on(stage, 'pointerdown', (e) => { drag = true; lx = e.clientX; moved = 0; vel = 0; stage.setPointerCapture(e.pointerId); });
    FX.on(stage, 'pointermove', (e) => { if (!drag) return; const d = e.clientX - lx; lx = e.clientX; moved += Math.abs(d); ang += d * 0.18; vel = d * 0.18; });
    FX.on(stage, 'pointerup', () => { drag = false; });
    FX.on(stage, 'click', (e) => { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } }, true);
    $$('.sr-arrow').forEach((b) => FX.on(b, 'click', () => { vel = 0; ang += (+b.dataset.d) * 360 / N; }));
    const show = (i) => { const p = P[i]; info.innerHTML = `<small>${String(i + 1).padStart(2, '0')} / ${String(N).padStart(2, '0')} · ${esc(p.brand || p.cats[0] || '')}</small><h2>${esc(p.name)}</h2><b class="sr-price">${pft(p)}</b><div class="hero-cta"><a class="btn btn-gold" href="#/termek/${p.slug}">Részletek</a>${LX2.addBtn(p).replace('btn btn-gold', 'btn btn-ghost')}</div>`; };
    FX.tick(() => {
      if (!drag) { vel += ((Math.abs(vel) < 0.04 ? 0.04 : vel) - vel) * 0.02; ang += vel; vel *= 0.985; }
      ring.style.transform = `translateZ(${-R()}px) rotateY(${-ang}deg)`;
      items.forEach((it) => it.style.setProperty('--r', R() + 'px'));
      const f = ((Math.round(ang / (360 / N)) % N) + N) % N;
      if (f !== front) { front = f; items.forEach((it, i) => it.classList.toggle('on', i === f)); show(f); }
    });
  });
  return `<div class="lx2 srm">
    <section class="sr-stage"><div class="sr-spot s1"></div><div class="sr-spot s2"></div><div class="sr-spot s3"></div><div class="sr-floor"></div>
      <div class="sr-head wrap"><span class="sec-num">◢ SHOWROOM · ${esc(C.name)}</span><h1 data-split="c">${fill(C.hero.title)}</h1></div>
      <div class="sr-scene"><div class="sr-ring">${P.map((p) => `<a class="sr-it" href="#/termek/${p.slug}" draggable="false"><img src="${pimg(p)}" alt="" draggable="false"></a>`).join('')}</div></div>
      <button class="sr-arrow l" data-d="-1" aria-label="Előző">‹</button><button class="sr-arrow r" data-d="1" aria-label="Következő">›</button>
      <div class="sr-info"></div><small class="sr-hint muted">húzd oldalra – forgasd a pódiumot</small></section>
    <section class="sec wrap"><div class="sr-lines">${SKINS.slice(0, 8).map((s) => `<a href="#/${NR}/${s.k}" style="background-image:url(${s.img})"><span><b>${esc(s.name)}</b><small>${LX.needN(s)} modell</small></span></a>`).join('')}</div></section>
    <section class="sec wrap">${head('', 'A teljes kínálat', '')}<div class="ring-slot" data-lx="0"></div></section>${(LX.rings([S.products]), '')}
  </div>`;
};

/* ===================== 33. PORTÁL ===================== */
LAYOUTS.portal = function () {
  const sc = LX.scenes(), inner = sc[0] || LX.hero();
  lx2Start(() => {
    const sec = $('.pt-pin'), stage = $('.pt-stage'), win = $('.pt-in'), bg = $('.pt-in i'); if (!sec) return;
    const { c, g, dpr } = F3.canvas('pt-cv', stage, false); c.style.position = 'absolute';
    const [ar, ag, ab] = F3.rgb('--gold').map((v) => Math.round(v * 255)), [rr, rg, rb] = F3.rgb('--rose').map((v) => Math.round(v * 255));
    const parts = Array.from({ length: innerWidth < 760 ? 260 : 520 }, (_, i) => ({ a: Math.random() * 6.283, o: (Math.random() - 0.5) * 0.16, s: 0.004 + Math.random() * 0.012, z: Math.random(), k: i % 2 }));
    F3.trackMouse();
    FX.tick((t) => {
      if (!F3.visible(stage)) return;
      const p = FX.span(sec), W = c.width / dpr, H = c.height / dpr, base = Math.min(W, H) * 0.24, R = base + Math.pow(p, 2.2) * Math.hypot(W, H);
      win.style.clipPath = `circle(${R}px at 50% 50%)`;
      const mx = (F3.mouse.x / innerWidth - 0.5) || 0, my = (F3.mouse.y / innerHeight - 0.5) || 0;
      bg.style.transform = `scale(${1.25 - p * 0.2}) translate(${mx * -30}px, ${my * -30}px)`;
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H); g.globalCompositeOperation = 'lighter';
      for (const q of parts) {
        q.a += q.s * (1 + p * 3); const wob = Math.sin(q.a * 5 + t / 400) * 10 + q.o * base;
        const r = R + wob, x = W / 2 + Math.cos(q.a) * r, y = H / 2 + Math.sin(q.a) * r;
        g.fillStyle = q.k ? `rgba(${ar},${ag},${ab},${0.25 + q.z * 0.6})` : `rgba(${rr},${rg},${rb},${0.2 + q.z * 0.5})`;
        g.beginPath(); g.arc(x, y, 0.8 + q.z * 2.2, 0, 6.3); g.fill();
      }
      const gr = g.createRadialGradient(W / 2, H / 2, R * 0.92, W / 2, H / 2, R * 1.12); gr.addColorStop(0, `rgba(${ar},${ag},${ab},0)`); gr.addColorStop(0.5, `rgba(${ar},${ag},${ab},.45)`); gr.addColorStop(1, `rgba(${ar},${ag},${ab},0)`);
      g.fillStyle = gr; g.beginPath(); g.arc(W / 2, H / 2, R * 1.12, 0, 6.3); g.fill(); g.globalCompositeOperation = 'source-over';
      $('.pt-copy').style.opacity = FX.clamp(1 - p * 3); $('.pt-inside').style.opacity = FX.clamp((p - 0.55) * 3.5);
    });
  });
  return `<div class="lx2 pt"><section class="pt-pin"><div class="pt-stage">
      <div class="pt-out" style="background-image:url(${sc[1] || LX.hero()})"></div>
      <div class="pt-in"><i style="background-image:url(${inner})"></i><div class="pt-inside wrap"><h2>${esc(C.name)}</h2><p class="lead">${fill(C.hero.lead)}</p><div class="hero-cta">${LX.cta()}</div></div></div>
      <div class="pt-copy wrap"><span class="sec-num">◯ KAPU NYITVA</span><h1 data-split="c">${fill(C.hero.title)}</h1><small class="muted">görgess – lépj át</small></div>
    </div></section>
    <section class="sec wrap"><div class="pt-gates">${SKINS.slice(0, 6).map((s) => `<a href="#/${NR}/${s.k}"><span class="pt-g" style="background-image:url(${s.img})"></span><b>${esc(s.name)}</b><small>${LX.needN(s)} ${L_('itemWord', 'tétel')}</small></a>`).join('')}</div></section>
    <section class="sec wrap">${head('', 'A teljes kínálat', '')}<div class="ring-slot" data-lx="0"></div></section>${(LX.rings([S.products]), '')}
  </div>`;
};

/* ===================== 34. GRAVITÁCIÓ ===================== */
LAYOUTS.gravitacio = function () {
  const P = LX2.P().slice(0, 16), NS = SKINS.slice(0, 6);
  lx2Start(() => {
    const box = $('.gv-box'); if (!box) return;
    const small = innerWidth < 760;
    const bodies = $$('.gv-b', box).map((el, i) => { const r = (el.classList.contains('nd') ? 54 : 46 + F4.rnd(i + 3) * 26) * (small ? 0.72 : 1); el.style.width = el.style.height = r * 2 + 'px'; return { el, r, x: 0, y: 0, vx: 0, vy: 0, born: i * 140, live: false, drag: false }; });
    let W = box.clientWidth, H = box.clientHeight; FX.on(window, 'resize', () => { W = box.clientWidth; H = box.clientHeight; });
    let grab = null, gx = 0, gy = 0, moved = 0;
    bodies.forEach((b) => {
      FX.on(b.el, 'pointerdown', (e) => { grab = b; b.drag = true; moved = 0; const r = box.getBoundingClientRect(); gx = e.clientX - r.left; gy = e.clientY - r.top; b.el.setPointerCapture(e.pointerId); b.el.classList.add('held'); e.preventDefault(); });
      FX.on(b.el, 'pointermove', (e) => { if (grab !== b) return; const r = box.getBoundingClientRect(), nx = e.clientX - r.left, ny = e.clientY - r.top; b.vx = (nx - gx); b.vy = (ny - gy); moved += Math.abs(b.vx) + Math.abs(b.vy); b.x = nx; b.y = ny; gx = nx; gy = ny; });
      FX.on(b.el, 'pointerup', () => { if (grab === b) { b.drag = false; grab = null; b.el.classList.remove('held'); } });
      FX.on(b.el, 'click', (e) => { if (moved > 8) e.preventDefault(); });
    });
    $('.gv-shake') && FX.on($('.gv-shake'), 'click', () => bodies.forEach((b) => { b.vx += (Math.random() - 0.5) * 40; b.vy -= 18 + Math.random() * 22; }));
    const t0 = performance.now();
    FX.tick((t) => {
      if (!F3.visible(box)) return;
      for (const b of bodies) {
        if (!b.live) { if (t - t0 < b.born) continue; b.live = true; b.x = b.r + F4.rnd(b.born) * (W - 2 * b.r); b.y = -b.r * 2; b.el.style.opacity = 1; }
        if (b.drag) continue;
        b.vy += 0.55; b.vx *= 0.995; b.vy *= 0.995; b.x += b.vx; b.y += b.vy;
        if (b.y > H - b.r) { b.y = H - b.r; b.vy *= -0.42; b.vx *= 0.9; }
        if (b.x < b.r) { b.x = b.r; b.vx *= -0.6; } if (b.x > W - b.r) { b.x = W - b.r; b.vx *= -0.6; }
      }
      for (let k = 0; k < 3; k++) for (let i = 0; i < bodies.length; i++) for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i], c = bodies[j]; if (!a.live || !c.live) continue;
        const dx = c.x - a.x, dy = c.y - a.y, d = Math.hypot(dx, dy) || 0.01, min = a.r + c.r;
        if (d < min) { const ov = (min - d) / 2, nx = dx / d, ny = dy / d, wa = a.drag ? 0 : c.drag ? 2 : 1, wc = c.drag ? 0 : a.drag ? 2 : 1;
          a.x -= nx * ov * wa; a.y -= ny * ov * wa; c.x += nx * ov * wc; c.y += ny * ov * wc;
          const rv = (c.vx - a.vx) * nx + (c.vy - a.vy) * ny; if (rv < 0) { const imp = -rv * 0.75; if (!a.drag) { a.vx -= nx * imp * 0.5; a.vy -= ny * imp * 0.5; } if (!c.drag) { c.vx += nx * imp * 0.5; c.vy += ny * imp * 0.5; } } }
      }
      for (const b of bodies) if (b.live) b.el.style.transform = `translate(${b.x - b.r}px, ${b.y - b.r}px) rotate(${(b.x / b.r) * 57.3 % 360}deg)`;
    });
  });
  return `<div class="lx2 gv"><section class="gv-hero wrap"><div class="gv-copy"><span class="sec-num">↓ 9,81 m/s² · ${esc(C.name)}</span><h1 data-split="w">${fill(C.hero.title)}</h1><p class="lead" data-fx>${fill(C.hero.lead)}</p><div class="hero-cta" data-fx>${LX.cta()}<button class="btn btn-ghost gv-shake">Rázd meg! ↯</button></div><small class="muted">fogd meg és dobd el őket</small></div>
      <div class="gv-box">${P.map((p) => `<a class="gv-b pr" href="#/termek/${p.slug}" draggable="false"><img src="${pimg(p)}" alt="" draggable="false"><span>${pft(p)}</span></a>`).join('')}${NS.map((s) => `<a class="gv-b nd" href="#/${NR}/${s.k}" draggable="false"><b>${esc(s.name)}</b></a>`).join('')}</div></section>
    <section class="sec wrap">${head('', 'A teljes kínálat', '')}<div class="ring-slot" data-lx="0"></div></section>${(LX.rings([S.products]), '')}
  </div>`;
};

/* ===================== 35. LENCSE (WebGL) ===================== */
LAYOUTS.lencse = function () {
  const P = LX2.P();
  lx2Start(async () => {
    const hero = $('.ln-hero'); if (!hero) return;
    // termékkártyák: kerek nagyító a kép fölött
    $$('.ln-card').forEach((c) => { const img = $('img', c), lp = $('.ln-loupe', c); lp.style.backgroundImage = `url(${img.src})`; FX.on(c, 'pointermove', (e) => { const r = $('.ln-img', c).getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; lp.style.left = x + 'px'; lp.style.top = y + 'px'; lp.style.backgroundPosition = `${(x / r.width) * 100}% ${(y / r.height) * 100}%`; }); });
    const im = await F3.loadImg(LX.hero()); if (!im || !$('.ln-hero')) return;
    const cv = document.createElement('canvas'); cv.className = 'ln-gl'; hero.prepend(cv); FX.add(cv);
    const gl = cv.getContext('webgl'); if (!gl) { cv.remove(); return; }
    const vs = 'attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;v.y=1.-v.y;gl_Position=vec4(p,0.,1.);}';
    const fs = `precision mediump float;varying vec2 v;uniform sampler2D tx;uniform vec2 r;uniform vec2 ia;uniform vec2 m;uniform float t;uniform vec4 rp[4];
      vec2 cover(vec2 u){float s=max(r.x/ia.x,r.y/ia.y);vec2 sz=ia*s/r;return (u-.5)/sz+.5;}
      void main(){vec2 u=v;vec2 asp=vec2(r.x/r.y,1.);
        for(int i=0;i<4;i++){float age=t-rp[i].z;if(rp[i].w>0.&&age<3.){float d=length((u-rp[i].xy)*asp);float w=sin(d*55.-age*9.)*exp(-age*1.4)*exp(-d*3.)*.012;u+=normalize((u-rp[i].xy)*asp+1e-4)/asp*w;}}
        vec2 dm=(u-m)*asp;float d=length(dm);float R=.17;float k=smoothstep(R,R*.2,d);
        vec2 lu=m+(u-m)*mix(1.,.55,k);float ca=.012*k*(d/R);vec2 dir=normalize(dm+1e-4)/asp;
        vec3 col=vec3(texture2D(tx,cover(lu+dir*ca)).r,texture2D(tx,cover(lu)).g,texture2D(tx,cover(lu-dir*ca)).b);
        float rim=smoothstep(.006,0.,abs(d-R));col+=rim*.55;col*=mix(.62,1.,k*.6+.4*smoothstep(1.1,.2,length((v-.5)*asp)));
        gl_FragColor=vec4(col,1.);}`;
    const sh = (ty, s) => { const o = gl.createShader(ty); gl.shaderSource(o, s); gl.compileShader(o); return o; };
    const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { cv.remove(); return; }
    gl.useProgram(pr); hero.classList.add('ln-on');
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, im);
    const U = (k) => gl.getUniformLocation(pr, k); gl.uniform2f(U('ia'), im.width, im.height);
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    const fit = () => { const r = hero.getBoundingClientRect(); cv.width = r.width * dpr; cv.height = r.height * dpr; gl.viewport(0, 0, cv.width, cv.height); gl.uniform2f(U('r'), cv.width, cv.height); };
    fit(); FX.on(window, 'resize', fit);
    const lens = F4.wander(hero), rip = [0, 0, 0, 0].map(() => [0, 0, 0, 0]); let ri = 0; const t0 = performance.now();
    FX.on(hero, 'pointerdown', (e) => { if (e.target.closest('a,button')) return; const r = hero.getBoundingClientRect(); rip[ri++ % 4] = [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height, (performance.now() - t0) / 1000, 1]; });
    FX.tick((t) => { if (!F3.visible(hero)) return; gl.uniform2f(U('m'), lens.x, lens.y); gl.uniform1f(U('t'), (t - t0) / 1000); gl.uniform4fv(U('rp'), rip.flat()); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); });
  });
  return `<div class="lx2 ln"><section class="ln-hero" style="background-image:url(${LX.hero()})"><div class="ln-copy wrap"><span class="sec-num">⌕ ${esc(C.name)} · NAGYÍTÁS 1,8×</span><h1 data-split="w">${fill(C.hero.title)}</h1><p class="lead" data-fx>${fill(C.hero.lead)}</p><div class="hero-cta" data-fx>${LX.cta()}</div><small class="muted">mozgasd az egeret · kattints a képre</small></div></section>
    <section class="sec wrap"><div class="ln-grid">${P.slice(0, 12).map((p) => `<a class="ln-card lx2-p" data-fx href="#/termek/${p.slug}"><span class="ln-img"><img src="${pimg(p)}" alt="" loading="lazy"><i class="ln-loupe"></i></span><b>${esc(p.name)}</b><em>${pft(p)}</em></a>`).join('')}</div></section>
    <section class="sec wrap">${head('', 'A teljes kínálat', '')}<div class="ring-slot" data-lx="0"></div></section>${(LX.rings([S.products]), '')}
  </div>`;
};

/* ===================== 36. DOMBORZAT ===================== */
LAYOUTS.domborzat = function () {
  const P = LX2.P(), maxP = Math.max(1, ...P.map((p) => p.price || 0));
  lx2Start(async () => {
    const sec = $('.db-pin'), stage = $('.db-stage'); if (!sec) return;
    const { c, g, dpr } = F3.canvas('db-cv', stage, false); c.style.position = 'absolute';
    const COLS = innerWidth < 760 ? 60 : 110, ROWS = innerWidth < 760 ? 46 : 70;
    let hm = new Float32Array(COLS * ROWS);
    const im = await F3.loadImg(LX.hero());
    if (im) { const o = document.createElement('canvas'); o.width = COLS; o.height = ROWS; const x = o.getContext('2d'); x.drawImage(im, 0, 0, COLS, ROWS); const d = x.getImageData(0, 0, COLS, ROWS).data; for (let i = 0; i < COLS * ROWS; i++) hm[i] = (d[i * 4] * 0.3 + d[i * 4 + 1] * 0.59 + d[i * 4 + 2] * 0.11) / 255; }
    const A = F3.rgb('--gold'), B = F3.rgb('--rose'); F3.trackMouse();
    FX.tick((t) => {
      if (!F3.visible(stage)) return;
      const p = FX.span(sec), W = c.width / dpr, H = c.height / dpr, r = stage.getBoundingClientRect();
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
      const camZ = p * 1.6, fov = H * 0.9, horizon = H * (0.36 - p * 0.12), amp = 0.22 + p * 0.35;
      const mx = F3.mouse.x - r.left, my = F3.mouse.y - r.top;
      for (let j = ROWS - 1; j >= 0; j--) {
        const zw = (j / ROWS) * 4 + 0.6 - camZ; if (zw < 0.15) continue;
        g.beginPath(); let first = true;
        for (let i = 0; i < COLS; i++) {
          const xw = (i / (COLS - 1) - 0.5) * 6;
          let h = hm[j * COLS + i] * amp + Math.sin(i * 0.22 + t / 900) * 0.05 + Math.cos(j * 0.25 + t / 1300) * 0.05;
          const sx = W / 2 + (xw / zw) * fov * 0.5, sy0 = horizon + (1.1 / zw) * fov * 0.32;
          const dm = Math.hypot(sx - mx, sy0 - my); if (dm < 160) h += Math.sin(dm / 14 - t / 120) * 0.06 * (1 - dm / 160);
          const sy = sy0 - (h / zw) * fov * 0.5;
          if (first) { g.moveTo(sx, sy); first = false; } else g.lineTo(sx, sy);
        }
        const k = j / ROWS, fade = FX.clamp(1.4 - zw / 3.2);
        g.strokeStyle = `rgba(${Math.round((A[0] * (1 - k) + B[0] * k) * 255)},${Math.round((A[1] * (1 - k) + B[1] * k) * 255)},${Math.round((A[2] * (1 - k) + B[2] * k) * 255)},${(0.12 + fade * 0.7).toFixed(3)})`;
        g.lineWidth = 0.6 + fade * 1.1; g.stroke();
      }
      $('.db-copy').style.opacity = FX.clamp(1 - p * 2.4); $('.db-alt b').textContent = Math.round(120 + p * 2280) + ' m';
    });
  });
  return `<div class="lx2 db"><section class="db-pin"><div class="db-stage">
      <div class="db-copy wrap"><span class="sec-num">▲ ${esc(C.name)} · TEREPMODELL</span><h1 data-split="c">${fill(C.hero.title)}</h1><p class="lead">${fill(C.hero.lead)}</p><div class="hero-cta">${LX.cta()}</div></div>
      <div class="db-alt">MAGASSÁG <b>120 m</b></div></div></section>
    <section class="sec wrap"><div class="db-peaks">${P.slice(0, 12).map((p, i) => `<a class="db-pk lx2-p" data-fx href="#/termek/${p.slug}" style="--h:${Math.round(18 + 82 * ((p.price || maxP * 0.3) / maxP))}%"><span class="db-bar"><i></i></span><img src="${pimg(p)}" alt="" loading="lazy"><b>${esc(p.name)}</b><em>${pft(p)}</em><small>CSÚCS ${String(i + 1).padStart(2, '0')}</small></a>`).join('')}</div></section>
    <section class="sec wrap">${head('', 'A teljes kínálat', '')}<div class="ring-slot" data-lx="0"></div></section>${(LX.rings([S.products]), '')}
  </div>`;
};

/* ===================== 37. INDULÁSI TÁBLA ===================== */
LAYOUTS.tabla = function () {
  const P = LX2.P(), ROWS = 8, AB = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÁÉÍÓÖŐÚÜŰ0123456789';
  const up = (s, n) => F4.plain(s).toUpperCase().slice(0, n).padEnd(n, ' ');
  const cols = [['IDŐ', 5], ['TERMÉK', 20], ['KATEGÓRIA', 12], ['ÁR', 10], ['STÁTUSZ', 9]];
  const rowData = (p, i) => { const h = 8 + ((i * 37) % 12), m = (i * 13) % 60; const st = !p.price ? 'AJÁNLAT' : p.inStock === false ? 'ELFOGYOTT' : F4.rnd(p.id) > 0.75 ? 'ÚJ' : 'KÉSZLETEN'; return [`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`, p.name, p.cats[0] || '', F4.plain(pft(p)).replace(/\s?Ft/, ' FT'), st]; };
  lx2Start(() => {
    const board = $('.tb-board'); if (!board) return;
    const rowsEl = $$('.tb-row', board);
    const setCell = (cell, ch, delay) => { const n = 4 + Math.floor(Math.random() * 8); let k = 0; FX.later(() => { const iv = setInterval(() => { if (!cell.isConnected) return clearInterval(iv); if (k++ >= n) { cell.textContent = ch; cell.classList.remove('fl'); clearInterval(iv); return; } cell.textContent = ch === ' ' && k > n - 2 ? ' ' : AB[(Math.random() * AB.length) | 0]; cell.classList.remove('fl'); void cell.offsetWidth; cell.classList.add('fl'); }, 55); FX._c.push(() => clearInterval(iv)); }, delay); };
    let page = 0; const pages = Math.max(1, Math.ceil(Math.min(P.length, 32) / ROWS));
    const show = () => {
      const list = P.slice(page * ROWS, page * ROWS + ROWS);
      rowsEl.forEach((row, r) => {
        const p = list[r], d = p ? rowData(p, page * ROWS + r) : cols.map(() => '');
        row.href = p ? `#/termek/${p.slug}` : '#/termekek'; row.classList.toggle('tb-empty', !p);
        $$('.tb-f', row).forEach((f, ci) => { const txt = up(d[ci], cols[ci][1]); $$('i', f).forEach((cell, k) => { if (cell.textContent !== txt[k]) setCell(cell, txt[k], r * 70 + k * 12); }); if (ci === 4) f.dataset.st = d[4] || ''; });
      });
      $('.tb-page').textContent = `${page + 1} / ${pages}`; page = (page + 1) % pages;
    };
    show(); FX.every(show, 7000);
    const clk = $('.tb-clock'); const tick = () => { clk.textContent = new Date().toLocaleTimeString('hu-HU'); }; tick(); FX.every(tick, 1000);
  });
  const cells = (n) => '<i> </i>'.repeat(n);
  return `<div class="lx2 tb">
    <section class="tb-hero wrap"><div class="tb-top"><span class="sec-num">✈ INDULÁS · ${esc(C.name)}</span><span class="tb-clock"></span></div>
      <h1 data-split="c">${fill(C.hero.title)}</h1><p class="lead" data-fx>${fill(C.hero.lead)}</p><div class="hero-cta" data-fx>${LX.cta()}</div></section>
    <section class="wrap tb-wrapb"><div class="tb-board"><div class="tb-hd">${cols.map(([n, w]) => `<span class="tb-f c${w}" style="--n:${w}">${n}</span>`).join('')}</div>
      ${Array.from({ length: ROWS }, () => `<a class="tb-row" href="#/termekek">${cols.map(([, w]) => `<span class="tb-f c${w}" style="--n:${w}">${cells(w)}</span>`).join('')}</a>`).join('')}
      <div class="tb-ft"><span>Kattints egy sorra a részletekért</span><span>OLDAL <b class="tb-page">1 / 1</b></span></div></div></section>
    <section class="sec wrap"><div class="tb-gates">${SKINS.slice(0, 8).map((s, i) => `<a href="#/${NR}/${s.k}"><span class="tb-gate">${String.fromCharCode(65 + i)}${i + 1}</span><b>${esc(s.name)}</b><small>${LX.needN(s)} járat</small></a>`).join('')}</div></section>
    <section class="sec wrap">${head('', 'A teljes kínálat', '')}<div class="ring-slot" data-lx="0"></div></section>${(LX.rings([S.products]), '')}
  </div>`;
};

/* ===================== 38. DIORÁMA ===================== */
LAYOUTS.diorama = function () {
  const P = LX2.P().slice(0, 10), sc = LX.scenes();
  lx2Start(() => {
    const sec = $('.dr-pin'), cam = $('.dr-cam'); if (!sec) return;
    let mx = 0, my = 0, cx = 0, cy = 0; FX.on(window, 'pointermove', (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; }, { passive: true });
    const layers = $$('.dr-l', cam);
    FX.tick((t) => {
      if (innerWidth < 760) return;
      const p = FX.span(sec), auto = performance.now() / 4000; cx += ((mx || Math.sin(auto) * 0.15) - cx) * 0.05; cy += ((my || Math.cos(auto * 0.8) * 0.1) - cy) * 0.05;
      cam.style.transform = `translateZ(${p * 1500}px) rotateY(${cx * 14}deg) rotateX(${-cy * 10}deg)`;
      layers.forEach((l) => { const z = +l.dataset.z + p * 1500; l.style.opacity = FX.clamp(z > 400 ? 1 - (z - 400) / 300 : 1); });
      $('.dr-end').style.opacity = FX.clamp((p - 0.8) * 5);
    });
  });
  return `<div class="lx2 dr"><section class="dr-pin"><div class="dr-stage"><div class="dr-cam">
      <div class="dr-l dr-back" data-z="-1400" style="transform:translateZ(-1400px) scale(2.5);background-image:url(${sc[0] || LX.hero()})"></div>
      <div class="dr-l dr-mid" data-z="-900" style="transform:translateZ(-900px)">${SKINS.slice(0, 5).map((s, i) => `<a href="#/${NR}/${s.k}" style="left:${50 + (i % 3) * 16}%;top:${12 + Math.floor(i / 3) * 40 + (i % 2) * 8}%;background-image:url(${s.img})"><b>${esc(s.name)}</b></a>`).join('')}</div>
      <div class="dr-l dr-fog" data-z="-600" style="transform:translateZ(-600px)"></div>
      <div class="dr-l dr-front" data-z="-300" style="transform:translateZ(-300px)">${P.map((p, i) => `<a class="lx2-p" href="#/termek/${p.slug}" style="left:${58 + (i * 13.7) % 36}%;top:${(i % 4) * 21 + 10}%;--d:${i * 0.3}s"><img src="${pimg(p)}" alt=""><span>${esc(p.name)} · ${pft(p)}</span></a>`).join('')}</div>
      <div class="dr-l dr-text" data-z="0" style="transform:translateZ(0)"><div class="wrap"><span class="sec-num">◫ DIORÁMA · ${esc(C.name)}</span><h1 data-split="w">${fill(C.hero.title)}</h1><p class="lead">${fill(C.hero.lead)}</p><small class="muted">mozgasd az egeret, aztán görgess be a jelenetbe</small></div></div>
    </div><div class="dr-end wrap"><h2>${esc(C.name)}</h2><div class="hero-cta">${LX.cta()}</div></div></div></section>
    <section class="sec wrap">${head('', 'A teljes kínálat', '')}<div class="ring-slot" data-lx="0"></div></section>${(LX.rings([S.products]), '')}
  </div>`;
};

/* ===================== 39. ÁRAMLÁS ===================== */
LAYOUTS.aramlas = function () {
  const P = LX2.P();
  const spark = (seed) => { let y = 20, d = 'M0 ' + y; for (let i = 1; i <= 20; i++) { y = Math.max(3, Math.min(37, y + (F4.rnd(seed * 31 + i) - 0.45) * 12)); d += ` L${i * 6} ${y.toFixed(1)}`; } return d; };
  lx2Start(() => {
    const hero = $('.ar2-hero'); if (!hero) return;
    const { c, g, dpr } = F3.canvas('ar2-cv', hero, false); c.style.position = 'absolute';
    const W = c.width / dpr, H = c.height / dpr, N = innerWidth < 760 ? 1400 : 3200;
    // célpontok: a cég neve egy rejtett vásznon
    const o = document.createElement('canvas'); o.width = W; o.height = H; const x = o.getContext('2d');
    let fsz = Math.min(H * 0.32, (W * 1.5) / Math.max(4, C.name.length)); x.font = `600 ${fsz}px ${F3.css('--serif') || 'serif'}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#fff'; x.fillText(C.name, W * 0.5, H * 0.5);
    const d = x.getImageData(0, 0, W, H).data, tg = []; for (let yy = 0; yy < H; yy += 4) for (let xx = 0; xx < W; xx += 4) if (d[(yy * Math.round(W) + xx) * 4 + 3] > 128) tg.push([xx, yy]);
    const cols = [F3.rgb('--gold'), F3.rgb('--rose'), F3.rgb('--ink')].map((v) => v.map((q) => Math.round(q * 255)));
    const ps = Array.from({ length: N }, (_, i) => ({ x: Math.random() * W, y: Math.random() * H, vx: 0, vy: 0, t: tg.length ? tg[i % tg.length] : null, c: cols[i % 3] }));
    F3.trackMouse(); const t0 = performance.now();
    FX.tick((t) => {
      if (!F3.visible(hero)) return;
      const cyc = ((t - t0) / 1000) % 12, form = cyc > 5 && cyc < 10 && tg.length, r = hero.getBoundingClientRect(), mx = F3.mouse.x - r.left, my = F3.mouse.y - r.top;
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.fillStyle = 'rgba(0,0,0,.12)'; g.globalCompositeOperation = 'destination-out'; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'lighter';
      for (const q of ps) {
        if (form) { q.vx += (q.t[0] - q.x) * 0.012; q.vy += (q.t[1] - q.y) * 0.012; q.vx *= 0.86; q.vy *= 0.86; }
        else { const a = Math.sin(q.x * 0.004 + t / 3000) * 2.2 + Math.cos(q.y * 0.005 - t / 4100) * 2.2; q.vx += Math.cos(a) * 0.12; q.vy += Math.sin(a) * 0.12; q.vx *= 0.96; q.vy *= 0.96; }
        const dx = q.x - mx, dy = q.y - my, dd = dx * dx + dy * dy; if (dd < 14000) { q.vx += -dy * 0.0016 + dx * 0.0008; q.vy += dx * 0.0016 + dy * 0.0008; }
        const ox = q.x, oy = q.y; q.x += q.vx; q.y += q.vy;
        if (q.x < 0) q.x += W; if (q.x > W) q.x -= W; if (q.y < 0) q.y += H; if (q.y > H) q.y -= H;
        if (Math.abs(q.x - ox) > 50 || Math.abs(q.y - oy) > 50) continue;
        g.strokeStyle = `rgba(${q.c[0]},${q.c[1]},${q.c[2]},.5)`; g.lineWidth = 1; g.beginPath(); g.moveTo(ox, oy); g.lineTo(q.x, q.y); g.stroke();
      }
      g.globalCompositeOperation = 'source-over';
    });
  });
  return `<div class="lx2 ar2"><section class="ar2-hero"><div class="ar2-copy wrap"><span class="sec-num">≋ ÁRAMLÁS · ${esc(C.name)}</span><h1 data-split="w">${fill(C.hero.title)}</h1><p class="lead" data-fx>${fill(C.hero.lead)}</p><div class="hero-cta" data-fx>${LX.cta()}</div></div></section>
    <section class="wrap ar2-stats"><div><b data-to="${S.products.length}">0</b><span>${L_('itemWord', 'tétel')}</span></div><div><b data-to="${SKINS.length}">0</b><span>${esc(C.labels.needsNav || 'igény')}</span></div><div><b data-to="${BRANDS.length || TYPES.length}">0</b><span>kategória</span></div><div><b data-to="${(C.ritual && C.ritual.steps || []).length || 4}">0</b><span>lépés a célig</span></div></section>
    <section class="sec wrap"><div class="ar2-grid">${P.slice(0, 12).map((p) => `<a class="ar2-card lx2-p" data-fx href="#/termek/${p.slug}"><img src="${pimg(p)}" alt="" loading="lazy"><div><small>${esc(p.cats[0] || p.brand || '')}</small><b>${esc(p.name)}</b><em>${pft(p)}</em></div><svg viewBox="0 0 120 40" preserveAspectRatio="none"><path d="${spark(p.id)}"/></svg></a>`).join('')}</div></section>
    <section class="sec wrap">${head('', 'A teljes kínálat', '')}<div class="ring-slot" data-lx="0"></div></section>${(LX.rings([S.products]), '')}
  </div>`;
};

/* ===================== 40. AR-SZKENNER ===================== */
LAYOUTS.ar = function () {
  const P = LX2.P(), sc = [LX.hero(), ...LX.scenes()].filter((v, i, a) => v && a.indexOf(v) === i).slice(0, 4);
  const spots = (si) => P.slice(si * 3, si * 3 + 3).map((p, k) => ({ p, x: 18 + F4.rnd(si * 7 + k + 1) * 64, y: 22 + F4.rnd(si * 11 + k + 5) * 52 }));
  lx2Start(() => {
    $$('.ar-scene').forEach((s) => {
      const io = new IntersectionObserver((es) => { if (es[0].isIntersecting && !s.dataset.done) { s.dataset.done = 1; $$('.ar-spot', s).forEach((sp, i) => FX.later(() => { sp.classList.add('scan'); FX.later(() => sp.classList.add('id'), 900); }, 500 + i * 700)); } }, { threshold: 0.4 });
      io.observe(s); FX._c.push(() => io.disconnect());
      const cross = $('.ar-cross', s), rd = $('.ar-rd', s);
      FX.on(s, 'pointermove', (e) => { const r = s.getBoundingClientRect(); const x = e.clientX - r.left, y = e.clientY - r.top; cross.style.transform = `translate(${x}px, ${y}px)`; rd.textContent = `${(x / r.width * 100).toFixed(1)}° · ${(y / r.height * 100).toFixed(1)}° · TÁV ${(2 + (y / r.height) * 6).toFixed(2)} m`; });
    });
    const clk = $$('.ar-time'); FX.every(() => { const s = new Date().toLocaleTimeString('hu-HU'); clk.forEach((c) => (c.textContent = s)); }, 1000);
  });
  return `<div class="lx2 arx">${sc.map((img, si) => `<section class="ar-scene" style="background-image:url(${img})">
      <div class="ar-hud"><i class="b1"></i><i class="b2"></i><i class="b3"></i><i class="b4"></i><div class="ar-scanl"></div>
        <div class="ar-tl">◉ AR · ${esc(C.name).toUpperCase()} · JELENET ${si + 1}/${sc.length}</div><div class="ar-tr"><span class="ar-time"></span> · OBJEKTUM: ${spots(si).length}</div><div class="ar-bl ar-rd">mozgasd az egeret a bemérőhöz</div></div>
      <span class="ar-cross"></span>
      ${spots(si).map(({ p, x, y }, k) => `<a class="ar-spot ${x > 60 ? 'flip' : ''}" href="#/termek/${p.slug}" style="left:${x}%;top:${y}%"><i class="ar-ring"></i><span class="ar-box"></span><span class="ar-card"><small>AZONOSÍTVA · ${(92 + F4.rnd(p.id + k) * 7.9).toFixed(1)}%</small><img src="${pimg(p)}" alt=""><b>${esc(p.name)}</b><em>${pft(p)}</em></span></a>`).join('')}
      ${si === 0 ? `<div class="ar-copy wrap"><h1 data-split="w">${fill(C.hero.title)}</h1><p class="lead">${fill(C.hero.lead)}</p><div class="hero-cta">${LX.cta()}</div></div>` : ''}
    </section>`).join('')}
    <section class="sec wrap">${head('', 'A teljes kínálat', '')}<div class="ring-slot" data-lx="0"></div></section>${(LX.rings([S.products]), '')}
  </div>`;
};
