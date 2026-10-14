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

  lx2Start(() => {
    fontLoad();
    const stage = $('.rc-stage'), ring = $('.rc-ring'), doors = $('.rc-doors'), panels = $$('.rc-room'), chips = $$('.rc-chip'), room = $('.rc-open'); if (!stage) return;
    // érkezés: az ajtó szétnyílik
    FX.later(() => doors.classList.add('open'), FX.reduce || /thumb=1/.test(location.search) ? 0 : 900);
    const R = () => Math.max(380, Math.min(innerWidth * 0.5, 820));
    panels.forEach((p, i) => p.style.setProperty('--a', (i * 360) / N + 'deg'));
    let ang = 0, target = 0, drag = false, lx = 0, moved = 0, zoom = 0, zt = 0, focus = -1;
    const norm = (a) => ((a % 360) + 360) % 360;
    FX.on(stage, 'pointerdown', (e) => { if (e.target.closest('button, a, .rc-desk')) return; drag = true; lx = e.clientX; moved = 0; stage.setPointerCapture(e.pointerId); stage.classList.add('drag'); });
    FX.on(stage, 'pointermove', (e) => { if (!drag) return; const d = e.clientX - lx; lx = e.clientX; moved += Math.abs(d); target -= d * 0.22; });
    FX.on(stage, 'pointerup', () => { drag = false; stage.classList.remove('drag'); const step = 360 / N; target = Math.round(target / step) * step; });
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
      ring.style.transform = `translateZ(${r * (0.3 + zoom * 1.05)}px) rotateY(${-ang}deg)`;
      panels.forEach((p) => p.style.setProperty('--r', r + 'px'));
      const front = Math.round(norm(ang) / (360 / N)) % N;
      panels.forEach((p, i) => p.classList.toggle('front', i === front));
      chips.forEach((c, i) => c.classList.toggle('on', i === front));
    });
  });

  return `<div class="lx2 rc">
    <section class="rc-stage" aria-label="A szalon recepciója – húzd oldalra a körbenézéshez">
      <div class="rc-sky"></div><div class="rc-wall"></div><div class="rc-brand" aria-hidden="true">${esc(C.name)}</div><div class="rc-strip"></div><div class="rc-halo"></div><div class="rc-floor"></div>
      <div class="rc-scene"><div class="rc-ring">
        ${rooms.map((s, i) => `<a class="rc-room" href="#/${NR}/${s.k}" draggable="false"><span class="rc-arch" style="background-image:url(${s.img})"></span><span class="rc-sign"><small>${String(i + 1).padStart(2, '0')}</small><b>${esc(s.name)}</b><em>${LX.needN(s)} ${L_('itemWord', 'kezelés')} · belépek →</em></span><span class="rc-glow"></span></a>`).join('')}
      </div></div>
      <div class="rc-desk"><span class="rc-avatar" aria-hidden="true"></span><div><small>RECEPCIÓ · ${esc(C.name)}</small><p>${esc(C.recepcio && C.recepcio.koszones || 'Szép napot! Örülünk, hogy itt vagy. Merre kísérhetünk?')}</p>
        <div class="rc-chips">${rooms.map((s, i) => `<button class="rc-chip" type="button" data-i="${i}">${esc(s.name)}</button>`).join('')}</div>
        <div class="rc-deskcta"><button class="btn btn-gold" type="button" data-open="0">Belépek: ${esc(rooms[0] ? rooms[0].name : '')} →</button>${tel ? `<a class="btn btn-ghost" href="${telHref(tel)}">${esc(tel)}</a>` : ''}</div></div></div>
      <button class="rc-arrow l" data-d="-1" type="button" aria-label="Balra">‹</button><button class="rc-arrow r" data-d="1" type="button" aria-label="Jobbra">›</button>
      <small class="rc-hint">húzd oldalra – nézz körül a szalonban</small>
      <div class="rc-doors" aria-hidden="true"><i class="l"></i><i class="r"></i><div class="rc-welcome"><small>${esc(C.hero.pill || '')}</small><b>Üdvözlünk az ${esc(C.name)}-ban</b></div></div>
    </section>
    <div class="rc-open" role="dialog" aria-modal="true"><div class="rc-open-bg"></div><div class="rc-open-in wrap"></div></div>
    <section class="sec wrap rc-about"><div><span class="sec-num">${esc(C.name)}</span><h2>${fill(C.hero.title)}</h2><p class="lead">${fill(C.hero.lead)}</p></div>
      <div class="rc-perks">${(C.perks || []).map((x) => `<div><span>${esc(x.ico || '✦')}</span><b>${esc(x.b)}</b><small>${esc(x.s || '')}</small></div>`).join('')}</div></section>
    ${LX.steps().length ? `<section class="sec wrap rc-steps"><h2>${esc(C.ritual.title)}</h2><ol>${LX.steps().map((s, i) => `<li data-fx><span>${String(i + 1).padStart(2, '0')}</span><b>${esc(s.t)}</b><p>${esc(s.d)}</p></li>`).join('')}</ol></section>` : ''}
    ${C.quote ? `<section class="sec wrap rc-quote"><p data-split="w">${fill(C.quote)}</p></section>` : ''}
  </div>`;
};
