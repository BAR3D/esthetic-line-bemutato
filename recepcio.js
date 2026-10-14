/* Bemutató Gyár – RECEPCIÓ: belépés a szalon (rendelő, spa, stúdió) recepciójára.
   Üvegajtó nyílik → 3D térben körbenézel → a „termek” (a modell igényei) íves portálok → belépve a kezelések árral.
   Bármely szolgáltatónál működik: a termek = C.needs, a kezelések = a termékek (cats szerint). Foglalási rendszer NINCS benne. */
'use strict';

window.LAYOUT_META5 = {
  recepcio: { name: 'Recepció', desc: 'Megérkezel a szalon recepciójára: körbenézel a 3D térben, a termek közül választasz, belépve kezelések és árak.', light: true, shopView: 'racs' },
};
Object.assign(window.LAYOUT_META, window.LAYOUT_META5);

LAYOUTS.recepcio = function () {
  const rooms = SKINS.slice(0, 8), N = rooms.length || 1;
  const list = (s) => S.products.filter((p) => has(p, s.cats)).sort((a, b) => (b.price > 0) - (a.price > 0));   // a szalon saját sorrendje marad (a kiemelt kezelések elöl)
  const tel = (C.contact && C.contact.phone) || '';
  const fontLoad = () => { const f = window.A5F && A5F[C.alapBetu || 'cormorant']; if (f && !document.getElementById('rcFont')) { const l = document.createElement('link'); l.id = 'rcFont'; l.rel = 'stylesheet'; l.href = `https://fonts.googleapis.com/css2?family=${f[1]}&display=swap`; document.head.appendChild(l); document.body.style.setProperty('--serif', `"${f[0]}", Georgia, serif`); } };

  const tema = (C.recepcio && C.recepcio.tema) || 'vilagos', lux = tema === 'luxus';
  window.__lx2Intro = true;   // a saját ajtós érkezés váltja ki az általános nyitófüggönyt
  lx2Start(() => {
    fontLoad();
    if (lux) document.body.classList.remove('light');   // a sötét luxus téma a saját színeit használja
    const stage = $('.rc-stage'), ring = $('.rc-ring'), doors = $('.rc-doors'), panels = $$('.rc-room'), chips = $$('.rc-chip'), room = $('.rc-open'); if (!stage) return;
    // érkezés: az ajtó szétnyílik
    const ph = $('.rc-photo', stage); if (ph) { let mx = 0, my = 0, cx = 0, cy = 0; FX.on(window, 'pointermove', (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; }, { passive: true });
      FX.tick(() => { cx += (mx - cx) * 0.04; cy += (my - cy) * 0.04; ph.style.transform = `scale(1.12) translate(${cx * -22 - ((ang % 360) / 360) * 30}px, ${cy * -14}px)`; }); }   // a valódi(szerű) recepciókép enyhe mélységgel mozdul
    const quick = FX.reduce || /thumb=1/.test(location.search);
    FX.later(() => { doors.classList.add('open'); stage.classList.add('in'); }, quick ? 0 : 1100);
    let intro = quick ? 1 : 0; const t0 = performance.now() + (quick ? 0 : 1100);   // belépő kamera: messziről beúszik
    if (lux) {   // aranypor a levegőben – az egér elől szétrebben
      const { c, g, dpr } = F3.canvas('rc-dust', stage, false); c.style.position = 'absolute'; F3.trackMouse();
      const P = Array.from({ length: innerWidth < 760 ? 70 : 160 }, () => ({ x: Math.random(), y: Math.random(), z: 0.3 + Math.random() * 0.7, vx: 0, vy: 0, tw: Math.random() * 6.28 }));
      FX.tick((t) => { if (!F3.visible(stage)) return; const W = c.width / dpr, H = c.height / dpr, rr = stage.getBoundingClientRect(), mx = F3.mouse.x - rr.left, my = F3.mouse.y - rr.top;
        g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H); g.globalCompositeOperation = 'lighter';
        for (const p of P) { p.y -= 0.00035 * (1 + p.z); if (p.y < -0.05) { p.y = 1.05; p.x = Math.random(); } let x = p.x * W + Math.sin(t / 2200 + p.tw) * 18 * p.z, y = p.y * H; const dx = x - mx, dy = y - my, d = Math.hypot(dx, dy); if (d < 140) { p.vx += (dx / d) * (140 - d) * 0.0009; p.vy += (dy / d) * (140 - d) * 0.0009; } p.vx *= 0.95; p.vy *= 0.95; p.x += p.vx / 10; p.y += p.vy / 10;
          const a = (0.35 + 0.65 * Math.abs(Math.sin(t / 700 + p.tw))) * p.z, r = 0.6 + p.z * 2.2; const gr = g.createRadialGradient(x, y, 0, x, y, r * 4); gr.addColorStop(0, `rgba(255,226,150,${a})`); gr.addColorStop(1, 'rgba(255,200,90,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r * 4, 0, 6.3); g.fill(); }
        g.globalCompositeOperation = 'source-over'; });
    }
    const R = () => Math.max(380, Math.min(innerWidth * 0.5, 820));
    panels.forEach((p, i) => p.style.setProperty('--a', (i * 360) / N + 'deg'));
    let ang = 0, target = 0, drag = false, lx = 0, moved = 0, zoom = 0, zt = 0, focus = -1;
    const norm = (a) => ((a % 360) + 360) % 360;
    // húzás csak valódi mozgásnál kapja el az egeret – különben a kattintás eljut a teremhez (pointer capture miatt nem jutott el)
    let down = false, pid = 0;
    FX.on(stage, 'pointerdown', (e) => { if (e.target.closest('button, .rc-desk')) return; down = true; drag = false; lx = e.clientX; moved = 0; pid = e.pointerId; });
    FX.on(stage, 'pointermove', (e) => { if (!down) return; const d = e.clientX - lx; lx = e.clientX; moved += Math.abs(d); if (!drag && moved > 6) { drag = true; try { stage.setPointerCapture(pid); } catch { /* */ } stage.classList.add('drag'); } if (drag) target -= d * 0.22; });
    const up = () => { if (!down) return; down = false; if (drag) { drag = false; stage.classList.remove('drag'); const step = 360 / N; target = Math.round(target / step) * step; } };
    FX.on(stage, 'pointerup', up); FX.on(stage, 'pointercancel', up);
    FX.on(stage, 'click', (e) => { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } }, true);
    $$('.rc-arrow').forEach((b) => FX.on(b, 'click', () => { target += (+b.dataset.d * 360) / N; }));
    const turnTo = (i) => { target = target - norm(target) + (i * 360) / N; if (norm(target) - norm(ang) > 180) target -= 360; };
    chips.forEach((c) => FX.on(c, 'click', () => turnTo(+c.dataset.i)));
    FX.on(window, 'keydown', (e) => { if (room.classList.contains('on')) { if (e.key === 'Escape') close(); return; } if (e.key === 'ArrowLeft') target -= 360 / N; if (e.key === 'ArrowRight') target += 360 / N; });
    // belépés egy terembe
    const open = (i) => {
      const s = rooms[i], L = list(s); focus = i; zt = 1;
      $('.rc-open-bg', room).style.backgroundImage = `url(${s.img})`;
      $('.rc-open-in', room).innerHTML = `<button class="rc-back" type="button">← Vissza a recepcióra</button>
        <span class="rc-kick">${String(i + 1).padStart(2, '0')} · ${esc(C.name)}</span><h2>${esc(s.name)}</h2><p class="rc-lead">${esc(s.d || '')}</p>
        <div class="rc-menu">${L.map((p, k) => `<a href="#/termek/${p.slug}" style="--d:${Math.min(k, 14) * 40}ms"><span><b>${esc(p.name)}</b>${p.summary ? `<small>${esc(String(p.summary).slice(0, 90))}</small>` : ''}</span><i></i><em>${pft(p)}</em></a>`).join('') || '<p class="muted">Ehhez a teremhez most egyedi ajánlatot adunk – kérdezz a recepción.</p>'}</div>
        <div class="rc-cta">${tel ? `<a class="btn btn-gold" href="${telHref(tel)}">Bejelentkezés: ${esc(tel)}</a>` : ''}<a class="btn btn-ghost" href="#/kapcsolat">Írj nekünk</a></div>`;
      FX.later(() => { room.classList.add('on'); document.body.classList.add('rc-in'); FX.on($('.rc-back', room), 'click', close); }, FX.reduce ? 0 : 520);
    };
    const close = () => { room.classList.remove('on'); document.body.classList.remove('rc-in'); zt = 0; focus = -1; };
    FX.add({ remove: () => document.body.classList.remove('rc-in') });
    panels.forEach((p, i) => FX.on(p, 'click', (e) => { e.preventDefault(); if (moved > 6) return; const front = Math.round(norm(ang) / (360 / N)) % N; if (front !== i) { turnTo(i); FX.later(() => open(i), 650); } else open(i); }));
    $$('.rc-desk [data-open]').forEach((b) => FX.on(b, 'click', () => { const i = +b.dataset.open; turnTo(i); FX.later(() => open(i), 700); }));
    // a kamera: forgás + enyhe lebegés + belépéskor előre úszás
    FX.tick((t) => {
      if (!F3.visible(stage)) return;
      if (!drag && !room.classList.contains('on') && Math.abs(target - ang) < 0.05) target += Math.sin(t / 3000) * 0.004;
      ang += (target - ang) * 0.08; zoom += (zt - zoom) * 0.07;
      const r = R();
      if (intro < 1 && t > t0) intro = Math.min(1, (t - t0) / 1800); const ease = 1 - Math.pow(1 - intro, 3);
      ring.style.transform = `translateZ(${r * (0.3 + zoom * 1.05) - (1 - ease) * r * 1.6}px) rotateY(${-ang + (1 - ease) * 40}deg)`;
      panels.forEach((p) => p.style.setProperty('--r', r + 'px'));
      const front = Math.round(norm(ang) / (360 / N)) % N;
      panels.forEach((p, i) => p.classList.toggle('front', i === front));
      chips.forEach((c, i) => c.classList.toggle('on', i === front));
    });
  });

  return `<div class="lx2 rc rc-${tema}">
    <section class="rc-stage" aria-label="A szalon recepciója – húzd oldalra a körbenézéshez">
      ${C.recepcio && C.recepcio.hatter ? `<div class="rc-photo" style="background-image:url(${img(C.recepcio.hatter)})"></div>` : ''}<div class="rc-sky"></div><div class="rc-wall"></div><div class="rc-brand" aria-hidden="true">${esc(C.name)}</div><div class="rc-strip"></div><div class="rc-halo"></div><div class="rc-floor"></div>
      <div class="rc-scene"><div class="rc-ring">
        ${rooms.map((s, i) => `<a class="rc-room" href="#/${NR}/${s.k}" draggable="false"><span class="rc-arch" style="background-image:url(${s.img})"></span><span class="rc-sign"><small>${String(i + 1).padStart(2, '0')}</small><b>${esc(s.name)}</b><em>${LX.needN(s)} ${L_('itemWord', 'kezelés')} · belépek →</em></span><span class="rc-glow"></span></a>`).join('')}
      </div></div>
      <div class="rc-desk"><span class="rc-avatar" aria-hidden="true"></span><div><small>RECEPCIÓ · ${esc(C.name)}</small><p>${esc(C.recepcio && C.recepcio.koszones || 'Szép napot! Örülünk, hogy itt vagy. Merre kísérhetünk?')}</p>
        <div class="rc-chips">${rooms.map((s, i) => `<button class="rc-chip" type="button" data-i="${i}">${esc(s.name)}</button>`).join('')}</div>
        <div class="rc-deskcta"><button class="btn btn-gold" type="button" data-open="0">Belépek: ${esc(rooms[0] ? rooms[0].name : '')} →</button>${tel ? `<a class="btn btn-ghost" href="${telHref(tel)}">${esc(tel)}</a>` : ''}</div></div></div>
      <button class="rc-arrow l" data-d="-1" type="button" aria-label="Balra">‹</button><button class="rc-arrow r" data-d="1" type="button" aria-label="Jobbra">›</button>
      <small class="rc-hint">húzd oldalra – nézz körül a szalonban</small>
      <div class="rc-beam b1"></div><div class="rc-beam b2"></div><div class="rc-beam b3"></div>
      <div class="rc-doors" aria-hidden="true"><i class="l"><span>${esc((C.name || "").charAt(0))}</span></i><i class="r"><span>${esc((C.name || "").charAt(0))}</span></i><b class="rc-seam"></b><div class="rc-welcome"><small>${esc(C.hero.pill || '')}</small><b>Üdvözlünk az ${esc(C.name)}-ban</b></div></div>
    </section>
    <div class="rc-open" role="dialog" aria-modal="true"><div class="rc-open-bg"></div><div class="rc-open-in wrap"></div></div>
    <section class="sec wrap rc-about"><div><span class="sec-num">${esc(C.name)}</span><h2>${fill(C.hero.title)}</h2><p class="lead">${fill(C.hero.lead)}</p></div>
      <div class="rc-perks">${(C.perks || []).map((x) => `<div><span>${esc(x.ico || '✦')}</span><b>${esc(x.b)}</b><small>${esc(x.s || '')}</small></div>`).join('')}</div></section>
    ${LX.steps().length ? `<section class="sec wrap rc-steps"><h2>${esc(C.ritual.title)}</h2><ol>${LX.steps().map((s, i) => `<li data-fx><span>${String(i + 1).padStart(2, '0')}</span><b>${esc(s.t)}</b><p>${esc(s.d)}</p></li>`).join('')}</ol></section>` : ''}
    ${C.quote ? `<section class="sec wrap rc-quote"><p data-split="w">${fill(C.quote)}</p></section>` : ''}
  </div>`;
};
