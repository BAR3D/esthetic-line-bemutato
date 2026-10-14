/* Bemutató Gyár – ALAPOK: nyitómotorok (a futószalagon gyártott ágazati alapok hátterei).
   Minden motor: A5M[név](stage, opció) – a stage egy teljes nyitókép-méretű, relatív elem; minden FX-en át regisztrálva (takarítás). */
'use strict';

const A5M = {};
const a5cv = (stage) => { const o = F3.canvas('a5-cv', stage, false); o.c.style.position = 'absolute'; return o; };
const a5col = () => ({ A: F3.rgb('--gold').map((v) => Math.round(v * 255)), B: F3.rgb('--rose').map((v) => Math.round(v * 255)), I: F3.rgb('--ink').map((v) => Math.round(v * 255)) });
const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

/* ---------- 3D drótmodellek ---------- */
const W3 = {
  box(S, x, y, z, w, h, d) { const X = [x - w / 2, x + w / 2], Y = [y - h / 2, y + h / 2], Z = [z - d / 2, z + d / 2]; const P = (i, j, k) => [X[i], Y[j], Z[k]]; [[0, 0, 0, 1, 0, 0], [0, 1, 0, 1, 1, 0], [0, 0, 1, 1, 0, 1], [0, 1, 1, 1, 1, 1], [0, 0, 0, 0, 1, 0], [1, 0, 0, 1, 1, 0], [0, 0, 1, 0, 1, 1], [1, 0, 1, 1, 1, 1], [0, 0, 0, 0, 0, 1], [1, 0, 0, 1, 0, 1], [0, 1, 0, 0, 1, 1], [1, 1, 0, 1, 1, 1]].forEach(([a, b, c, d2, e, f]) => S.push([...P(a, b, c), ...P(d2, e, f)])); },
  ring(S, x, y, z, r, n = 24, ax = 'y', ry = r) { let p = null; for (let i = 0; i <= n; i++) { const a = (i / n) * 6.2832, u = Math.cos(a) * r, v = Math.sin(a) * ry; const q = ax === 'y' ? [x + u, y, z + v] : ax === 'z' ? [x + u, y + v, z] : [x, y + u, z + v]; if (p) S.push([...p, ...q]); p = q; } },
  line(S, a, b) { S.push([...a, ...b]); },
  poly(S, pts, close) { for (let i = 0; i < pts.length - (close ? 0 : 1); i++) S.push([...pts[i], ...pts[(i + 1) % pts.length]]); },
};
const MESH = {
  haz(S) { W3.box(S, 0, -0.4, 0, 1.6, 0.9, 1.1); const r = [[-0.8, 0.05, -0.55], [0.8, 0.05, -0.55], [0.8, 0.05, 0.55], [-0.8, 0.05, 0.55]], t = [[-0.8, 0.75, 0], [0.8, 0.75, 0]]; W3.line(S, t[0], t[1]); r.forEach((p, i) => W3.line(S, p, t[i === 0 || i === 3 ? 0 : 1])); W3.poly(S, [[-0.15, -0.85, 0.55], [-0.15, -0.35, 0.55], [0.15, -0.35, 0.55], [0.15, -0.85, 0.55]]); W3.poly(S, [[0.35, -0.5, 0.55], [0.35, -0.25, 0.55], [0.6, -0.25, 0.55], [0.6, -0.5, 0.55]], true); W3.poly(S, [[-0.6, -0.5, 0.55], [-0.6, -0.25, 0.55], [-0.35, -0.25, 0.55], [-0.35, -0.5, 0.55]], true); },
  torony(S) { let y = -1; [[1.1, 0.5], [0.95, 0.5], [0.8, 0.5], [0.6, 0.4], [0.35, 0.35]].forEach(([w, h]) => { W3.box(S, 0, y + h / 2, 0, w, h, w); for (let f = 1; f < 3; f++) W3.ring(S, 0, y + (h * f) / 3, 0, w * 0.71, 4, 'y'); y += h; }); W3.line(S, [0, y, 0], [0, y + 0.4, 0]); },
  kocka(S) { W3.box(S, 0, 0, 0, 1.4, 1.4, 1.4); W3.box(S, 0, 0, 0, 0.8, 0.8, 0.8); [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]].forEach(([a, b, c]) => W3.line(S, [a * 0.7, b * 0.7, c * 0.7], [a * 0.4, b * 0.4, c * 0.4])); },
  fogaskerek(S) { const n = 14, pts = (z) => { const o = []; for (let i = 0; i < n * 4; i++) { const a = (i / (n * 4)) * 6.2832, r = i % 4 < 2 ? 1 : 0.8; o.push([Math.cos(a) * r, Math.sin(a) * r, z]); } return o; }; const f = pts(0.2), b = pts(-0.2); W3.poly(S, f, true); W3.poly(S, b, true); f.forEach((p, i) => W3.line(S, p, b[i])); W3.ring(S, 0, 0, 0.2, 0.3, 20, 'z'); W3.ring(S, 0, 0, -0.2, 0.3, 20, 'z'); for (let i = 0; i < 6; i++) { const a = (i / 6) * 6.2832; W3.line(S, [Math.cos(a) * 0.3, Math.sin(a) * 0.3, 0.2], [Math.cos(a) * 0.72, Math.sin(a) * 0.72, 0.2]); } },
  gyemant(S, P, _t, sc = 1, oy = 0) { const n = 8, g = [], t = [], cu = [0, -1.1 * sc + oy, 0]; for (let i = 0; i < n; i++) { const a = (i / n) * 6.2832; g.push([Math.cos(a) * sc, 0.15 * sc + oy, Math.sin(a) * sc]); t.push([Math.cos(a + 0.39) * 0.55 * sc, 0.55 * sc + oy, Math.sin(a + 0.39) * 0.55 * sc]); } W3.poly(S, g, true); W3.poly(S, t, true); g.forEach((p, i) => { W3.line(S, p, cu); W3.line(S, p, t[i]); W3.line(S, t[i], g[(i + 1) % n]); }); },
  gyuru(S) { for (let i = 0; i < 6; i++) { const a = (i / 6) * 6.2832; W3.ring(S, 0, -0.2 + Math.sin(a) * 0.12, 0, 0.9 + Math.cos(a) * 0.12, 32, 'z'); } MESH.gyemant(S, null, 0, 0.4, 1.05); },
  foldgomb(S) { for (let k = -2; k <= 2; k++) { const la = k * 0.5; W3.ring(S, 0, Math.sin(la), 0, Math.cos(la), 32, 'y'); } for (let k = 0; k < 8; k++) { const a = (k / 8) * 3.1416; let p = null; for (let i = 0; i <= 24; i++) { const t = (i / 24) * 6.2832, q = [Math.cos(t) * Math.cos(a), Math.sin(t), Math.cos(t) * Math.sin(a)]; if (p) S.push([...p, ...q]); p = q; } } W3.ring(S, 0, 0, 0, 1.45, 48, 'y', 1.45); },
  csomo(S) { let p = null; for (let i = 0; i <= 300; i++) { const t = (i / 300) * 6.2832, r = 2 + Math.cos(3 * t), q = [r * Math.cos(2 * t) * 0.42, Math.sin(3 * t) * 0.42, r * Math.sin(2 * t) * 0.42]; if (p) S.push([...p, ...q]); p = q; } },
  molekula(S, P) { const at = [[0, 0, 0], [0.9, 0.5, 0.2], [-0.9, 0.5, -0.2], [0.2, -1, 0.3], [0.9, -0.5, -0.8], [-0.7, -0.7, 0.8], [0.3, 1.2, -0.6]]; at.forEach((a) => P.push(a)); [[0, 1], [0, 2], [0, 3], [3, 4], [3, 5], [1, 6], [2, 6]].forEach(([a, b]) => W3.line(S, at[a], at[b])); },
  atom(S, P, t) { P.push([0, 0, 0]); [[0, 0], [1.05, 0.6], [2.1, -0.6]].forEach(([rot, tilt], k) => { let p = null; for (let i = 0; i <= 40; i++) { const a = (i / 40) * 6.2832; let x = Math.cos(a) * 1.3, y = Math.sin(a) * 0.45, z = 0; const c = Math.cos(rot), s = Math.sin(rot); [x, z] = [x * c, x * s]; const ct = Math.cos(tilt), st = Math.sin(tilt); [y, z] = [y * ct - z * st, y * st + z * ct]; const q = [x, y, z]; if (p) S.push([...p, ...q]); p = q; } const a = t / 600 + k * 2; let x = Math.cos(a) * 1.3, y = Math.sin(a) * 0.45, z = 0; const c = Math.cos(rot), s = Math.sin(rot); [x, z] = [x * c, x * s]; const ct = Math.cos(tilt), st = Math.sin(tilt); [y, z] = [y * ct - z * st, y * st + z * ct]; P.push([x, y, z]); }); },
  kerek(S) { for (let i = 0; i < 8; i++) { const a = (i / 8) * 6.2832; W3.ring(S, 0, 0, Math.sin(a) * 0.25, 1 + Math.cos(a) * 0.25, 36, 'z'); } W3.ring(S, 0, 0, 0, 0.62, 30, 'z'); W3.ring(S, 0, 0, 0, 0.15, 12, 'z'); for (let i = 0; i < 5; i++) { const a = (i / 5) * 6.2832; W3.line(S, [Math.cos(a) * 0.15, Math.sin(a) * 0.15, 0], [Math.cos(a + 0.3) * 0.62, Math.sin(a + 0.3) * 0.62, 0]); W3.line(S, [Math.cos(a) * 0.15, Math.sin(a) * 0.15, 0], [Math.cos(a - 0.3) * 0.62, Math.sin(a - 0.3) * 0.62, 0]); } },
  auto(S) { W3.poly(S, [[-1.3, -0.35, 0.5], [-1.3, 0, 0.5], [-0.5, 0.05, 0.5], [-0.15, 0.4, 0.5], [0.55, 0.4, 0.5], [0.95, 0.05, 0.5], [1.3, 0, 0.5], [1.3, -0.35, 0.5]], true); W3.poly(S, [[-1.3, -0.35, -0.5], [-1.3, 0, -0.5], [-0.5, 0.05, -0.5], [-0.15, 0.4, -0.5], [0.55, 0.4, -0.5], [0.95, 0.05, -0.5], [1.3, 0, -0.5], [1.3, -0.35, -0.5]], true); [[-1.3, -0.35], [-1.3, 0], [-0.5, 0.05], [-0.15, 0.4], [0.55, 0.4], [0.95, 0.05], [1.3, 0], [1.3, -0.35]].forEach(([x, y]) => W3.line(S, [x, y, 0.5], [x, y, -0.5])); [[-0.8, 0.5], [0.8, 0.5], [-0.8, -0.5], [0.8, -0.5]].forEach(([x, z]) => { W3.ring(S, x, -0.35, z, 0.28, 16, 'z'); W3.ring(S, x, -0.35, z, 0.14, 10, 'z'); }); },
  turbina(S, P, t) { W3.line(S, [0, -1.5, 0], [0, 0.3, 0]); W3.line(S, [-0.12, -1.5, 0], [-0.04, 0.3, 0]); W3.line(S, [0.12, -1.5, 0], [0.04, 0.3, 0]); W3.ring(S, 0, 0.35, 0.05, 0.08, 10, 'z'); for (let i = 0; i < 3; i++) { const a = t / 700 + (i / 3) * 6.2832, b = a + 0.12, c = a - 0.05; W3.poly(S, [[0, 0.35, 0.08], [Math.cos(b) * 1.3, 0.35 + Math.sin(b) * 1.3, 0.08], [Math.cos(a) * 1.35, 0.35 + Math.sin(a) * 1.35, 0.08], [Math.cos(c) * 0.3, 0.35 + Math.sin(c) * 0.3, 0.08]], true); } },
  sulyzo(S) { W3.line(S, [-1.4, 0, 0], [1.4, 0, 0]); [[-0.9, 0.55], [-1.05, 0.45], [-1.2, 0.35], [0.9, 0.55], [1.05, 0.45], [1.2, 0.35]].forEach(([x, r]) => { W3.ring(S, x, 0, 0, r, 24, 'x'); W3.ring(S, x, 0, 0, 0.08, 8, 'x'); }); },
  csip(S) { W3.box(S, 0, 0, 0, 1.5, 0.14, 1.5); W3.box(S, 0, 0.12, 0, 0.7, 0.1, 0.7); for (let i = 0; i < 8; i++) { const o = -0.6 + i * 0.17; W3.line(S, [o, -0.07, 0.75], [o, -0.25, 0.95]); W3.line(S, [o, -0.07, -0.75], [o, -0.25, -0.95]); W3.line(S, [0.75, -0.07, o], [0.95, -0.25, o]); W3.line(S, [-0.75, -0.07, o], [-0.95, -0.25, o]); } },
  bura(S) { for (let k = 0; k < 5; k++) { const la = (k / 5) * 1.5708; W3.ring(S, 0, Math.sin(la) * 0.9 - 0.3, 0, Math.cos(la) * 0.9, 28, 'y'); } for (let k = 0; k < 8; k++) { const a = (k / 8) * 6.2832; let p = null; for (let i = 0; i <= 10; i++) { const t = (i / 10) * 1.5708, q = [Math.cos(t) * Math.cos(a) * 0.9, Math.sin(t) * 0.9 - 0.3, Math.cos(t) * Math.sin(a) * 0.9]; if (p) S.push([...p, ...q]); p = q; } } W3.ring(S, 0, -0.32, 0, 1.25, 36, 'y'); W3.ring(S, 0, -0.4, 0, 1.1, 36, 'y'); W3.ring(S, 0, 0.7, 0, 0.12, 12, 'z'); },
  kanape(S) { W3.box(S, 0, -0.35, 0.1, 2, 0.3, 0.9); W3.box(S, 0, 0.1, -0.3, 2, 0.6, 0.2); W3.box(S, -1.05, -0.15, 0.05, 0.2, 0.7, 1); W3.box(S, 1.05, -0.15, 0.05, 0.2, 0.7, 1); [[-0.9, 0.5], [0.9, 0.5], [-0.9, -0.3], [0.9, -0.3]].forEach(([x, z]) => W3.line(S, [x, -0.5, z], [x, -0.75, z])); W3.line(S, [0, -0.2, 0.55], [0, -0.2, -0.25]); },
  ajandek(S) { W3.box(S, 0, -0.3, 0, 1.3, 1, 1.3); W3.box(S, 0, 0.3, 0, 1.45, 0.25, 1.45); W3.poly(S, [[0, 0.42, 0.72], [0, 0.42, -0.72]]); W3.poly(S, [[0.72, 0.42, 0], [-0.72, 0.42, 0]]); W3.line(S, [0, 0.42, 0.72], [0, -0.8, 0.65]); W3.line(S, [0.72, 0.42, 0], [0.65, -0.8, 0]); W3.ring(S, -0.25, 0.65, 0, 0.25, 16, 'z', 0.18); W3.ring(S, 0.25, 0.65, 0, 0.25, 16, 'z', 0.18); },
  oszlopok(S) { const h = [0.5, 0.9, 0.7, 1.3, 1.0, 1.6, 1.2, 1.9, 1.5]; h.forEach((v, i) => { const x = (i % 3) * 0.6 - 0.6, z = Math.floor(i / 3) * 0.6 - 0.6; W3.box(S, x, -1 + v / 2, z, 0.38, v, 0.38); }); for (let i = 0; i < 5; i++) { W3.line(S, [-1.2 + i * 0.6, -1, -1.2], [-1.2 + i * 0.6, -1, 1.2]); W3.line(S, [-1.2, -1, -1.2 + i * 0.6], [1.2, -1, -1.2 + i * 0.6]); } },
  kajak(S) { const N = 24, L = 1.7, top = [], bot = [], top2 = []; for (let i = 0; i <= N; i++) { const x = -L + (2 * L * i) / N, u = 1 - (x / L) ** 2, w = 0.32 * Math.pow(Math.max(u, 0), 0.7); top.push([x, 0.04 * u, w]); top2.push([x, 0.04 * u, -w]); bot.push([x, -0.22 * u, 0]); } W3.poly(S, top); W3.poly(S, top2); W3.poly(S, bot); for (let i = 3; i < N - 2; i += 3) { W3.line(S, top[i], bot[i]); W3.line(S, top2[i], bot[i]); } W3.ring(S, 0.05, 0.07, 0, 0.36, 20, 'y', 0.17); W3.line(S, [-1.1, 0.75, -0.9], [1.1, 0.25, 0.9]); [[-1.1, 0.75, -0.9], [1.1, 0.25, 0.9]].forEach(([x, y, z]) => W3.poly(S, [[x - 0.12, y + 0.06, z - 0.1], [x + 0.12, y + 0.02, z - 0.1], [x + 0.12, y - 0.06, z + 0.1], [x - 0.12, y - 0.02, z + 0.1]], true)); },
  fa(S) { const br = (p, d, len, dep) => { if (dep === 0) return; const q = [p[0] + d[0] * len, p[1] + d[1] * len, p[2] + d[2] * len]; W3.line(S, p, q); for (let k = 0; k < 3; k++) { const a = (k / 3) * 6.2832 + dep, nd = [d[0] * 0.55 + Math.cos(a) * 0.6, d[1] * 0.75 + 0.25, d[2] * 0.55 + Math.sin(a) * 0.6], l = Math.hypot(...nd); br(q, nd.map((v) => v / l), len * 0.7, dep - 1); } }; br([0, -1.4, 0], [0, 1, 0], 0.8, 5); },
};

A5M.drot = function (stage, opt = 'kocka') {
  const { c, g, dpr } = a5cv(stage), K = a5col(); F3.trackMouse();
  let rx = 0, ry = 0; const dyn = ['atom', 'turbina'].includes(opt); let S = [], P = [];
  if (!dyn) (MESH[opt] || MESH.kocka)(S, P, 0);
  FX.tick((t) => {
    if (!F3.visible(stage)) return;
    if (dyn) { S = []; P = []; MESH[opt](S, P, t); }
    const W = c.width / dpr, H = c.height / dpr, r = stage.getBoundingClientRect();
    const mx = F3.mouse.x < 0 ? 0 : (F3.mouse.x - r.left) / r.width - 0.5, my = F3.mouse.y < 0 ? 0 : (F3.mouse.y - r.top) / r.height - 0.5;
    ry += ((t / 5200) + mx * 1.4 - ry) * 0.06; rx += (-0.32 + my * 0.8 - rx) * 0.06;
    const cy = Math.cos(ry), sy = Math.sin(ry), cx = Math.cos(rx), sx = Math.sin(rx), cen = +stage.dataset.mx === 0.5, sc = Math.min(W, H) * (cen ? 0.4 : 0.26), ox = W * (stage.dataset.mx ? +stage.dataset.mx : 0.68), oy = H * 0.52 + FX.prog(stage) * -60;
    const pr = (x, y, z) => { let X = x * cy + z * sy, Z = -x * sy + z * cy; let Y = y * cx - Z * sx; Z = y * sx + Z * cx; const k = 3.2 / (3.2 + Z); return [ox + X * sc * k, oy - Y * sc * k, Z]; };
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H); g.lineCap = 'round';
    g.shadowColor = rgba(K.A, 0.8); g.shadowBlur = 8;
    for (const s of S) { const a = pr(s[0], s[1], s[2]), b = pr(s[3], s[4], s[5]), z = (a[2] + b[2]) / 2, k = FX.clamp(0.75 - z * 0.35, 0.15, 1) * (cen ? 0.55 : 1); g.strokeStyle = rgba(z < 0 ? K.A : K.B, k); g.lineWidth = 1 + k; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
    for (const p of P) { const a = pr(...p); g.fillStyle = rgba(K.A, 0.9); g.beginPath(); g.arc(a[0], a[1], 6 * (3.2 / (3.2 + a[2])), 0, 6.3); g.fill(); }
    g.shadowBlur = 0;
  });
};

/* ---------- lebegő ágazati ikonok ---------- */
const IKON = {
  csepp: 'M12 2C12 2 5 10 5 15a7 7 0 0 0 14 0C19 10 12 2 12 2z', level: 'M4 20C4 10 11 4 21 3c-1 10-7 17-17 17z', levelke: 'M4 20C4 10 11 4 21 3c-1 10-7 17-17 17z',
  mancs: 'M12 12c-3.5 0-6.5 3.5-6.5 6s2.5 3.5 6.5 2.5c4 1 6.5 0 6.5-2.5S15.5 12 12 12zM5 7a2 2.6 0 1 0 .01 0zM9.5 3.5a2 2.6 0 1 0 .01 0zM14.5 3.5a2 2.6 0 1 0 .01 0zM19 7a2 2.6 0 1 0 .01 0z',
  szikra: 'M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z', csillag: 'M12 2l3 6.5 7 .8-5.2 4.8 1.5 7L12 17.6 5.7 21.1l1.5-7L2 9.3l7-.8z',
  kereszt: 'M9 3h6v6h6v6h-6v6H9v-6H3V9h6z', villam: 'M13 2 4 14h7l-1 8 9-12h-7z', gerenda: 'M3 4h18v3h-7.5v10H21v3H3v-3h7.5V7H3z',
  repulo: 'M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z', erme: 'M12 2a10 10 0 1 0 .01 0z',
  hangjegy: 'M9 18a3 3 0 1 1-2-2.8V5l12-2v11a3 3 0 1 1-2-2.8V7L9 8.5z', szirom: 'M12 2c4.5 4 4.5 11 0 20C7.5 13 7.5 6 12 2z', konfetti: 'M4 9h16v6H4z',
  fogaskerek: (() => { let d = ''; for (let i = 0; i < 32; i++) { const a = (i / 32) * 6.2832, r = i % 4 < 2 ? 10 : 7.5; d += (i ? 'L' : 'M') + (12 + Math.cos(a) * r).toFixed(2) + ' ' + (12 + Math.sin(a) * r).toFixed(2); } return d + 'zM12 9a3 3 0 1 0 .01 0z'; })(),
};
A5M.lebego = function (stage, opt = 'szikra') {
  const { c, g, dpr } = a5cv(stage), K = a5col(); F3.trackMouse();
  const path = new Path2D(IKON[opt] || IKON.szikra), even = opt === 'fogaskerek';
  const N = innerWidth < 760 ? 22 : 46;
  const it = Array.from({ length: N }, (_, i) => ({ x: Math.random(), y: Math.random(), z: 0.25 + Math.random() * 0.75, r: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.01, vy: -0.0004 - Math.random() * 0.0007, ox: 0, oy: 0, k: i % 3 }));
  FX.tick((t) => {
    if (!F3.visible(stage)) return;
    const W = c.width / dpr, H = c.height / dpr, r = stage.getBoundingClientRect(), mx = F3.mouse.x - r.left, my = F3.mouse.y - r.top;
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
    for (const p of it) {
      p.y += p.vy * (1 + p.z); p.r += p.vr; if (p.y < -0.1) { p.y = 1.1; p.x = Math.random(); }
      let x = p.x * W + Math.sin(t / 2000 + p.r) * 20 * p.z, y = p.y * H;
      const dx = x - mx, dy = y - my, d = Math.hypot(dx, dy); if (d < 150) { p.ox += (dx / d) * (150 - d) * 0.02; p.oy += (dy / d) * (150 - d) * 0.02; }
      p.ox *= 0.94; p.oy *= 0.94; x += p.ox; y += p.oy;
      const s = (opt === 'konfetti' ? 0.7 : 1.2) * (0.6 + p.z * 1.6);
      g.save(); g.translate(x, y); g.rotate(p.r); g.scale(s, s); g.translate(-12, -12);
      g.globalAlpha = 0.25 + p.z * 0.6; g.fillStyle = rgba(p.k === 0 ? K.A : p.k === 1 ? K.B : K.I, 1);
      g.fill(path, even ? 'evenodd' : 'nonzero'); g.restore();
    }
    g.globalAlpha = 1;
  });
};

/* ---------- élő görbék: EKG, szinusz, grafikon, hang, jel, út ---------- */
A5M.hullam = function (stage, opt = 'szinusz') {
  const { c, g, dpr } = a5cv(stage), K = a5col(); F3.trackMouse();
  const hist = []; let price = 50; for (let i = 0; i < 90; i++) { price += (Math.random() - 0.47) * 4; hist.push({ t: -1, o: price - (Math.random() - 0.5) * 3, c: price, h: price + Math.random() * 3, l: price - Math.random() * 3 }); }
  FX.tick((t) => {
    if (!F3.visible(stage)) return;
    const W = c.width / dpr, H = c.height / dpr, r = stage.getBoundingClientRect(), my = F3.mouse.y > 0 ? (F3.mouse.y - r.top) / r.height : 0.5;
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H); g.lineJoin = 'round';
    if (opt === 'ekg') {
      const beat = (x) => { const u = ((x % 1) + 1) % 1; return u < 0.38 ? Math.sin(u * 8.27) * 0.02 : u < 0.42 ? -(u - 0.38) * 3 : u < 0.46 ? (u - 0.42) * 25 - 0.12 : u < 0.5 ? 0.88 - (u - 0.46) * 30 : u < 0.54 ? -0.32 + (u - 0.5) * 8 : u < 0.72 ? Math.sin((u - 0.54) * 17.4) * 0.12 : 0; };
      [[0.55, 1, K.A, 2.2], [0.3, 0.6, K.B, 1.2], [0.78, 0.45, K.I, 1]].forEach(([yy, amp, col, lw], k) => {
        g.beginPath(); for (let x = 0; x <= W; x += 3) { const v = beat(x / 420 - t / (1100 + k * 300)); g.lineTo(x, H * yy - v * 90 * amp); } g.strokeStyle = rgba(col, k ? 0.35 : 0.9); g.lineWidth = lw; g.shadowColor = rgba(col, 0.9); g.shadowBlur = k ? 0 : 12; g.stroke();
      }); g.shadowBlur = 0;
    } else if (opt === 'grafikon') {
      if (t - (hist[hist.length - 1].t < 0 ? (hist[hist.length - 1].t = t) : hist[hist.length - 1].t) > 260) { price += (Math.random() - 0.47) * 4; hist.push({ t, o: price - (Math.random() - 0.5) * 3, c: price, h: price + Math.random() * 3, l: price - Math.random() * 3 }); if (hist.length > 90) hist.shift(); }
      const mn = Math.min(...hist.map((h) => h.l)), mx = Math.max(...hist.map((h) => h.h)), Y = (v) => H * 0.85 - ((v - mn) / Math.max(1, mx - mn)) * H * 0.6, bw = W / 90;
      g.strokeStyle = rgba(K.I, 0.06); for (let i = 1; i < 8; i++) { g.beginPath(); g.moveTo(0, (H * i) / 8); g.lineTo(W, (H * i) / 8); g.stroke(); }
      hist.forEach((h, i) => { const x = i * bw + bw / 2, up = h.c >= h.o; g.strokeStyle = g.fillStyle = rgba(up ? K.A : K.B, 0.7); g.beginPath(); g.moveTo(x, Y(h.h)); g.lineTo(x, Y(h.l)); g.stroke(); g.fillRect(x - bw * 0.3, Math.min(Y(h.o), Y(h.c)), bw * 0.6, Math.max(1, Math.abs(Y(h.o) - Y(h.c)))); });
      g.beginPath(); hist.forEach((h, i) => g.lineTo(i * bw + bw / 2, Y(h.c))); g.strokeStyle = rgba(K.A, 0.95); g.lineWidth = 2; g.shadowColor = rgba(K.A, 0.9); g.shadowBlur = 10; g.stroke(); g.shadowBlur = 0; g.lineWidth = 1;
    } else if (opt === 'hang') {
      const n = 64, bw = W / n; for (let i = 0; i < n; i++) { const v = (Math.sin(i * 0.35 + t / 300) * 0.5 + 0.5) * (Math.sin(i * 0.11 - t / 520) * 0.5 + 0.5) * (0.4 + 0.6 * Math.abs(Math.sin(t / 900 + i))); const h = v * H * 0.42; g.fillStyle = rgba(i % 2 ? K.A : K.B, 0.55); g.fillRect(i * bw + 2, H * 0.6 - h, bw - 4, h); g.fillStyle = rgba(i % 2 ? K.A : K.B, 0.18); g.fillRect(i * bw + 2, H * 0.6 + 4, bw - 4, h * 0.5); }
    } else if (opt === 'jel') {
      for (let l = 0; l < 7; l++) { const y0 = H * (0.18 + l * 0.11); g.beginPath(); for (let x = 0; x <= W; x += 6) { const bit = Math.sin(Math.floor((x + t * (0.05 + l * 0.02)) / 60) * 12.9898 + l * 78.2) > 0; g.lineTo(x, y0 - (bit ? 18 : 0)); } g.strokeStyle = rgba(l % 2 ? K.A : K.B, 0.3 + (Math.abs(y0 / H - my) < 0.06 ? 0.6 : 0)); g.lineWidth = 1.5; g.stroke(); }
    } else if (opt === 'ut') {
      const hz = H * 0.48, vx = W * 0.5; g.fillStyle = 'rgba(0,0,0,0)';
      const gr = g.createLinearGradient(0, hz - 80, 0, hz + 40); gr.addColorStop(0, rgba(K.B, 0)); gr.addColorStop(1, rgba(K.A, 0.25)); g.fillStyle = gr; g.fillRect(0, hz - 80, W, 120);
      for (let s = -1; s <= 1; s += 2) { g.beginPath(); g.moveTo(vx, hz); g.lineTo(vx + s * W * 0.9, H); g.strokeStyle = rgba(K.A, 0.8); g.lineWidth = 2; g.shadowColor = rgba(K.A, 1); g.shadowBlur = 14; g.stroke(); }
      g.shadowBlur = 0; for (let i = 0; i < 14; i++) { const z = ((i / 14 + t / 1400) % 1), y = hz + Math.pow(z, 2.2) * (H - hz), w = 2 + z * 10, h = 4 + z * 46; g.fillStyle = rgba(K.I, 0.15 + z * 0.6); g.fillRect(vx - w / 2, y, w, h); }
      for (let i = 0; i < 18; i++) { const z = ((i / 18 + t / 2200) % 1), y = hz + Math.pow(z, 2) * (H - hz); g.strokeStyle = rgba(K.B, z * 0.25); g.lineWidth = 1; g.beginPath(); g.moveTo(vx - (y - hz) * 1.9, y); g.lineTo(vx + (y - hz) * 1.9, y); g.stroke(); }
    } else { // szinusz-interferencia
      for (let l = 0; l < 9; l++) { g.beginPath(); for (let x = 0; x <= W; x += 4) { const y = H * 0.55 + Math.sin(x / (120 + l * 20) + t / (900 + l * 140)) * (40 + l * 8) * Math.sin(t / 3000 + l) + Math.sin(x / 47 + l) * 6; g.lineTo(x, y); } g.strokeStyle = rgba(l % 2 ? K.A : K.B, 0.12 + (l / 9) * 0.5); g.lineWidth = 1 + (l === 8 ? 1.5 : 0); g.stroke(); }
    }
  });
};

/* ---------- mágneses pontrács ---------- */
A5M.racs = function (stage) {
  const { c, g, dpr } = a5cv(stage), K = a5col(), wm = F4.wander(stage);
  FX.tick((t) => {
    if (!F3.visible(stage)) return;
    const W = c.width / dpr, H = c.height / dpr, mx = wm.x * W, my = wm.y * H, sp = innerWidth < 760 ? 26 : 30;
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
    for (let y = sp / 2; y < H; y += sp) for (let x = sp / 2; x < W; x += sp) {
      const dx = x - mx, dy = y - my, d = Math.hypot(dx, dy) || 1, f = Math.max(0, 1 - d / 260), wave = Math.sin(d / 40 - t / 300) * f * 6 + Math.sin(x / 90 + y / 70 + t / 1200) * 2;
      const px = x + (dx / d) * f * 26 + wave, py = y + (dy / d) * f * 26;
      g.fillStyle = rgba(f > 0.05 ? K.A : K.I, 0.3 + f * 0.7); g.beginPath(); g.arc(px, py, 1.5 + f * 3.6, 0, 6.3); g.fill();
    }
  });
};

/* ---------- mélységi fotó (egérre dőlő, fénysávval) ---------- */
A5M.melyseg = function (stage) {
  const l1 = FX.add(document.createElement('div')), l2 = FX.add(document.createElement('div')); l1.className = 'a5-dp'; l1.style.backgroundImage = `url(${LX.hero()})`; l2.className = 'a5-sweep'; stage.append(l1, l2);
  const sc = LX.scenes()[1]; if (sc) { const f = FX.add(document.createElement('div')); f.className = 'a5-dp2'; f.style.backgroundImage = `url(${sc})`; stage.append(f); }
  let mx = 0, my = 0, cx = 0, cy = 0; FX.on(window, 'pointermove', (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; }, { passive: true });
  const f2 = $('.a5-dp2', stage);
  FX.tick((t) => { cx += (mx - cx) * 0.05; cy += (my - cy) * 0.05; l1.style.transform = `scale(1.14) translate(${cx * -26}px, ${cy * -20 + FX.prog(stage) * 40}px)`; if (f2) f2.style.transform = `translate(${cx * 40}px, ${cy * 30}px) rotateY(${cx * 16}deg) rotateX(${-cy * 12}deg)`; });
};

/* ---------- WebGL folyadék / márvány / plazma ---------- */
A5M.shader = function (stage, opt = 'folyekony') {
  const cv = FX.add(document.createElement('canvas')); cv.className = 'a5-gl'; stage.prepend(cv);
  const gl = cv.getContext('webgl'); if (!gl) return;
  const mode = { folyekony: 0, marvany: 1, plazma: 2 }[opt] || 0;
  const fs = `precision mediump float;uniform vec2 r;uniform float t;uniform vec2 m;uniform vec3 c1;uniform vec3 c2;uniform vec3 c3;
    float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}
    float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p*=2.02;a*=.5;}return v;}
    void main(){vec2 uv=gl_FragCoord.xy/r;vec2 p=uv*vec2(r.x/r.y,1.)*2.2;float d=length((uv-m)*vec2(r.x/r.y,1.));vec3 col;
      ${mode === 1 ? 'float f=fbm(p*1.3+fbm(p+t*.03)*2.);float v=abs(sin(p.x*3.+f*9.+t*.1));v=pow(1.-v,6.);col=mix(c1,c1*1.8+.06,f*.6);col=mix(col,c2,v*.9);col+=exp(-d*7.)*.15;'
      : mode === 2 ? 'float v=sin(p.x*2.+t*.5)+sin(p.y*3.-t*.4)+sin((p.x+p.y)*2.+t*.3)+sin(length(p-m*2.)*5.-t*1.5);v=v*.25+.5;col=mix(c1,c2,smoothstep(.3,.7,v));col=mix(col,c3,smoothstep(.6,.95,v)*.8);col*=.55+.45*v;'
      : 'vec2 q=vec2(fbm(p+t*.04),fbm(p+vec2(5.2,1.3)-t*.035));vec2 w=vec2(fbm(p+3.5*q+vec2(1.7,9.2)+t*.06),fbm(p+3.5*q+vec2(8.3,2.8)-t*.05));float f=fbm(p+3.*w+.6*exp(-d*5.)*sin(t*2.-d*24.));col=mix(c1,c2,clamp(f*f*2.2,0.,1.));col=mix(col,c3,clamp(length(w)*.9-.35,0.,1.));col=mix(c1,col,.74);col+=pow(clamp(f*1.25,0.,1.),6.)*.5+.15*exp(-d*9.);'}
      gl_FragColor=vec4(col,1.);}`;
  const sh = (ty, s) => { const o = gl.createShader(ty); gl.shaderSource(o, s); gl.compileShader(o); return o; };
  const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}')); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { cv.remove(); return; }
  gl.useProgram(pr); gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = (k) => gl.getUniformLocation(pr, k); gl.uniform3fv(U('c1'), F3.rgb('--bg')); gl.uniform3fv(U('c2'), F3.rgb('--gold')); gl.uniform3fv(U('c3'), F3.rgb('--rose'));
  const fit = () => { const r = stage.getBoundingClientRect(); cv.width = r.width * 0.5; cv.height = r.height * 0.5; gl.viewport(0, 0, cv.width, cv.height); gl.uniform2f(U('r'), cv.width, cv.height); }; fit(); FX.on(window, 'resize', fit);
  let mx = 0.6, my = 0.5, tx = 0.6, ty = 0.5; FX.on(stage, 'pointermove', (e) => { const r = stage.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width; ty = 1 - (e.clientY - r.top) / r.height; });
  const t0 = performance.now(); FX.tick((t) => { if (!F3.visible(stage)) return; mx += (tx - mx) * 0.05; my += (ty - my) * 0.05; gl.uniform1f(U('t'), (t - t0) / 1000); gl.uniform2f(U('m'), mx, my); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); });
};

/* ---------- a cég nevéből összeálló részecskék ---------- */
A5M.nev = function (stage) {
  const { c, g, dpr } = a5cv(stage), K = a5col(); F3.trackMouse();
  const W = c.width / dpr, H = c.height / dpr, N = innerWidth < 760 ? 1300 : 2800;
  const o = document.createElement('canvas'); o.width = W; o.height = H; const x = o.getContext('2d');
  const fsz = Math.min(H * 0.3, (W * 1.4) / Math.max(4, C.name.length)); x.font = `700 ${fsz}px ${F3.css('--serif') || 'serif'}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#fff'; x.fillText(C.name, W * 0.5, H * 0.3);
  const d = x.getImageData(0, 0, W, H).data, tg = []; for (let yy = 0; yy < H; yy += 4) for (let xx = 0; xx < W; xx += 4) if (d[(yy * Math.round(W) + xx) * 4 + 3] > 128) tg.push([xx, yy]);
  const cols = [K.A, K.B, K.I], ps = Array.from({ length: N }, (_, i) => ({ x: Math.random() * W, y: Math.random() * H, vx: 0, vy: 0, t: tg[i % Math.max(1, tg.length)], c: cols[i % 3] }));
  const t0 = performance.now();
  FX.tick((t) => {
    if (!F3.visible(stage)) return;
    const cyc = ((t - t0) / 1000) % 11, form = cyc > 3.5 && cyc < 9 && tg.length, r = stage.getBoundingClientRect(), mx = F3.mouse.x - r.left, my = F3.mouse.y - r.top;
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.globalCompositeOperation = 'destination-out'; g.fillStyle = 'rgba(0,0,0,.14)'; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'lighter';
    for (const q of ps) {
      if (form) { q.vx += (q.t[0] - q.x) * 0.012; q.vy += (q.t[1] - q.y) * 0.012; q.vx *= 0.86; q.vy *= 0.86; } else { const a = Math.sin(q.x * 0.004 + t / 3000) * 2.2 + Math.cos(q.y * 0.005 - t / 4100) * 2.2; q.vx += Math.cos(a) * 0.12; q.vy += Math.sin(a) * 0.12; q.vx *= 0.96; q.vy *= 0.96; }
      const dx = q.x - mx, dy = q.y - my; if (dx * dx + dy * dy < 14000) { q.vx += -dy * 0.0016 + dx * 0.001; q.vy += dx * 0.0016 + dy * 0.001; }
      const ox = q.x, oy = q.y; q.x = (q.x + q.vx + W) % W; q.y = (q.y + q.vy + H) % H; if (Math.abs(q.x - ox) > 50 || Math.abs(q.y - oy) > 50) continue;
      g.strokeStyle = rgba(q.c, 0.5); g.beginPath(); g.moveTo(ox, oy); g.lineTo(q.x, q.y); g.stroke();
    }
    g.globalCompositeOperation = 'source-over';
  });
};

/* ---------- 3D terep a nyitókép fényességéből ---------- */
A5M.terep = async function (stage) {
  const { c, g, dpr } = a5cv(stage); F3.trackMouse();
  const COLS = innerWidth < 760 ? 60 : 100, ROWS = innerWidth < 760 ? 40 : 60, hm = new Float32Array(COLS * ROWS);
  const im = await F3.loadImg(LX.hero()); if (im) { const o = document.createElement('canvas'); o.width = COLS; o.height = ROWS; const x = o.getContext('2d'); x.drawImage(im, 0, 0, COLS, ROWS); const d = x.getImageData(0, 0, COLS, ROWS).data; for (let i = 0; i < COLS * ROWS; i++) hm[i] = (d[i * 4] * 0.3 + d[i * 4 + 1] * 0.59 + d[i * 4 + 2] * 0.11) / 255; }
  const A = F3.rgb('--gold'), B = F3.rgb('--rose');
  FX.tick((t) => {
    if (!F3.visible(stage)) return;
    const p = FX.prog(stage), W = c.width / dpr, H = c.height / dpr, r = stage.getBoundingClientRect(), mx = F3.mouse.x - r.left, my = F3.mouse.y - r.top;
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
    const camZ = p * 0.8, fov = H * 0.9, horizon = H * 0.42, amp = 0.25 + p * 0.3;
    for (let j = ROWS - 1; j >= 0; j--) {
      const zw = (j / ROWS) * 4 + 0.6 - camZ; if (zw < 0.15) continue; g.beginPath();
      for (let i = 0; i < COLS; i++) { const xw = (i / (COLS - 1) - 0.5) * 6; let h = hm[j * COLS + i] * amp + Math.sin(i * 0.22 + t / 900) * 0.05 + Math.cos(j * 0.25 + t / 1300) * 0.05; const sx = W / 2 + (xw / zw) * fov * 0.5, sy0 = horizon + (1.1 / zw) * fov * 0.32, dm = Math.hypot(sx - mx, sy0 - my); if (dm < 160) h += Math.sin(dm / 14 - t / 120) * 0.06 * (1 - dm / 160); const sy = sy0 - (h / zw) * fov * 0.5; i ? g.lineTo(sx, sy) : g.moveTo(sx, sy); }
      const k = j / ROWS, fade = FX.clamp(1.4 - zw / 3.2); g.strokeStyle = `rgba(${Math.round((A[0] * (1 - k) + B[0] * k) * 255)},${Math.round((A[1] * (1 - k) + B[1] * k) * 255)},${Math.round((A[2] * (1 - k) + B[2] * k) * 255)},${(0.1 + fade * 0.6).toFixed(3)})`; g.lineWidth = 0.6 + fade; g.stroke();
    }
  });
};

/* ---------- portálgyűrű ---------- */
A5M.portal = function (stage) {
  const win = FX.add(document.createElement('div')); win.className = 'a5-pt'; win.innerHTML = `<i style="background-image:url(${LX.hero()})"></i>`; stage.append(win);
  const { c, g, dpr } = a5cv(stage), K = a5col();
  const ps = Array.from({ length: innerWidth < 760 ? 220 : 460 }, (_, i) => ({ a: Math.random() * 6.283, o: (Math.random() - 0.5) * 0.18, s: 0.004 + Math.random() * 0.012, z: Math.random(), k: i % 2 }));
  FX.tick((t) => {
    if (!F3.visible(stage)) return;
    const p = FX.prog(stage), W = c.width / dpr, H = c.height / dpr, cx = W * (+stage.dataset.mx || 0.68), cy = H * 0.5, base = Math.min(W, H) * 0.27, R = base * (1 + Math.max(0, p - 0.45) * 2.5);
    win.style.clipPath = `circle(${R}px at ${cx}px ${cy}px)`;
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H); g.globalCompositeOperation = 'lighter';
    for (const q of ps) { q.a += q.s; const rr = R + Math.sin(q.a * 5 + t / 400) * 10 + q.o * base; g.fillStyle = rgba(q.k ? K.A : K.B, 0.2 + q.z * 0.6); g.beginPath(); g.arc(cx + Math.cos(q.a) * rr, cy + Math.sin(q.a) * rr, 0.8 + q.z * 2.2, 0, 6.3); g.fill(); }
    g.globalCompositeOperation = 'source-over';
  });
};

/* ---------- WebGL-lencse a nyitóképen ---------- */
A5M.lencse = async function (stage) {
  const bg = FX.add(document.createElement('div')); bg.className = 'a5-dp'; bg.style.backgroundImage = `url(${LX.hero()})`; stage.append(bg);
  const im = await F3.loadImg(LX.hero()); if (!im || !stage.isConnected) return;
  const cv = FX.add(document.createElement('canvas')); cv.className = 'a5-gl'; stage.append(cv);
  const gl = cv.getContext('webgl'); if (!gl) { cv.remove(); return; }
  const fs = `precision mediump float;varying vec2 v;uniform sampler2D tx;uniform vec2 r;uniform vec2 ia;uniform vec2 m;uniform float t;uniform vec4 rp;
    vec2 cover(vec2 u){float s=max(r.x/ia.x,r.y/ia.y);vec2 sz=ia*s/r;return (u-.5)/sz+.5;}
    void main(){vec2 u=v;vec2 asp=vec2(r.x/r.y,1.);float age=t-rp.z;if(rp.w>0.&&age<3.){float d=length((u-rp.xy)*asp);u+=normalize((u-rp.xy)*asp+1e-4)/asp*sin(d*55.-age*9.)*exp(-age*1.4)*exp(-d*3.)*.012;}
      vec2 dm=(u-m)*asp;float d=length(dm);float R=.17;float k=smoothstep(R,R*.2,d);vec2 lu=m+(u-m)*mix(1.,.55,k);float ca=.012*k*(d/R);vec2 dir=normalize(dm+1e-4)/asp;
      vec3 col=vec3(texture2D(tx,cover(lu+dir*ca)).r,texture2D(tx,cover(lu)).g,texture2D(tx,cover(lu-dir*ca)).b);col+=smoothstep(.006,0.,abs(d-R))*.55;col*=mix(.6,1.,k*.6+.4);gl_FragColor=vec4(col,1.);}`;
  const sh = (ty, s) => { const o = gl.createShader(ty); gl.shaderSource(o, s); gl.compileShader(o); return o; };
  const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, 'attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;v.y=1.-v.y;gl_Position=vec4(p,0.,1.);}')); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { cv.remove(); return; }
  gl.useProgram(pr); bg.remove(); gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture()); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, im);
  const U = (k) => gl.getUniformLocation(pr, k); gl.uniform2f(U('ia'), im.width, im.height);
  const fit = () => { const r = stage.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 1.5); cv.width = r.width * d; cv.height = r.height * d; gl.viewport(0, 0, cv.width, cv.height); gl.uniform2f(U('r'), cv.width, cv.height); }; fit(); FX.on(window, 'resize', fit);
  const lens = F4.wander(stage), t0 = performance.now(); let rp = [0, 0, 0, 0];
  FX.on(stage, 'pointerdown', (e) => { if (e.target.closest('a,button,input')) return; const r = stage.getBoundingClientRect(); rp = [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height, (performance.now() - t0) / 1000, 1]; });
  FX.tick((t) => { if (!F3.visible(stage)) return; gl.uniform2f(U('m'), lens.x, lens.y); gl.uniform1f(U('t'), (t - t0) / 1000); gl.uniform4fv(U('rp'), rp); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); });
};

/* ---------- élő neurális háló ---------- */
A5M.neuron = function (stage) {
  const { c, g, dpr } = a5cv(stage), K = a5col(); F3.trackMouse();
  const W = () => c.width / dpr, H = () => c.height / dpr;
  const dots = Array.from({ length: innerWidth < 760 ? 60 : 120 }, () => ({ x: Math.random() * W(), y: Math.random() * H(), vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4 }));
  FX.tick(() => {
    if (!F3.visible(stage)) return;
    const r = stage.getBoundingClientRect(), mx = F3.mouse.x - r.left, my = F3.mouse.y - r.top;
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W(), H());
    for (const d of dots) { d.x += d.vx; d.y += d.vy; if (d.x < 0 || d.x > W()) d.vx *= -1; if (d.y < 0 || d.y > H()) d.vy *= -1; if (Math.hypot(d.x - mx, d.y - my) < 170) { d.x += (mx - d.x) * 0.006; d.y += (my - d.y) * 0.006; } }
    for (let i = 0; i < dots.length; i++) for (let j = i + 1; j < dots.length; j++) { const a = dots[i], b = dots[j], d = Math.hypot(a.x - b.x, a.y - b.y); if (d < 130) { const near = Math.max(0, 1 - Math.hypot((a.x + b.x) / 2 - mx, (a.y + b.y) / 2 - my) / 230); g.strokeStyle = rgba(K.A, ((1 - d / 130) * (0.15 + near * 0.7)).toFixed(3)); g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); } }
    for (const d of dots) { const near = Math.max(0, 1 - Math.hypot(d.x - mx, d.y - my) / 180); g.fillStyle = rgba(near > 0.3 ? K.B : K.A, 0.35 + near * 0.65); g.beginPath(); g.arc(d.x, d.y, 1.6 + near * 2.6, 0, 6.3); g.fill(); }
  });
};

/* ---------- fénysebesség (csillagcsíkok) ---------- */
A5M.warp = function (stage) {
  const { c, g, dpr } = a5cv(stage), K = a5col(); const vel = FX.velocity();
  const st = Array.from({ length: innerWidth < 760 ? 350 : 800 }, () => ({ x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2, z: Math.random(), k: Math.random() < 0.3 }));
  FX.tick(() => {
    if (!F3.visible(stage)) return;
    const W = c.width / dpr, H = c.height / dpr, sp = 0.004 + Math.abs(vel()) * 0.0015 + FX.prog(stage) * 0.01;
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.fillStyle = 'rgba(0,0,0,.35)'; g.globalCompositeOperation = 'destination-out'; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over';
    for (const s of st) { s.z -= sp; if (s.z <= 0.02) { s.z = 1; s.x = (Math.random() - 0.5) * 2; s.y = (Math.random() - 0.5) * 2; } const k = 0.5 / s.z, k2 = 0.5 / (s.z + sp * 6), cx = W * 0.6; g.strokeStyle = rgba(s.k ? K.A : K.I, (1 - s.z).toFixed(2)); g.lineWidth = (1 - s.z) * 2.2; g.beginPath(); g.moveTo(cx + s.x * W * k2 * 0.5, H / 2 + s.y * H * k2 * 0.5); g.lineTo(cx + s.x * W * k * 0.5, H / 2 + s.y * H * k * 0.5); g.stroke(); }
  });
};

/* ---------- sarki fény ---------- */
A5M.aurora = function (stage) {
  const { c, g, dpr } = a5cv(stage), K = a5col(), cols = [K.A, K.B, [90, 240, 190], [110, 150, 255]];
  FX.tick((t) => {
    if (!F3.visible(stage)) return;
    const W = c.width / dpr, H = c.height / dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H); g.globalCompositeOperation = 'lighter';
    cols.forEach((col, k) => { for (let x = 0; x <= W; x += 6) { const y = H * (0.2 + k * 0.08) + Math.sin(x / (220 + k * 60) + t / (2400 + k * 500)) * 70 + Math.sin(x / 90 + t / 1300 + k) * 18, h = 170 + Math.sin(x / 140 + t / 1800 + k * 2) * 90, gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, rgba(col, 0)); gr.addColorStop(0.25, rgba(col, 0.11)); gr.addColorStop(1, rgba(col, 0)); g.fillStyle = gr; g.fillRect(x, y, 6, h); } });
    g.globalCompositeOperation = 'source-over';
  });
};

/* ---------- pixelvihar a nyitóképből ---------- */
A5M.pixel = async function (stage) {
  const { c, g, dpr } = a5cv(stage); F3.trackMouse();
  const W = c.width / dpr, H = c.height / dpr, step = innerWidth < 760 ? 7 : 6, im = await F3.loadImg(LX.hero()); if (!im || !stage.isConnected) return;
  const o = document.createElement('canvas'); o.width = Math.round(W); o.height = Math.round(H); const x = o.getContext('2d'), s = Math.max(W / im.width, H / im.height); x.drawImage(im, (W - im.width * s) / 2, (H - im.height * s) / 2, im.width * s, im.height * s);
  const d = x.getImageData(0, 0, o.width, o.height).data, pts = [];
  for (let yy = 0; yy < o.height; yy += step) for (let xx = 0; xx < o.width; xx += step) { const i = (yy * o.width + xx) * 4; pts.push({ hx: xx, hy: yy, x: Math.random() * W, y: Math.random() * H - H, vx: 0, vy: 0, c: `rgb(${d[i]},${d[i + 1]},${d[i + 2]})` }); }
  FX.tick(() => {
    if (!F3.visible(stage)) return;
    const r = stage.getBoundingClientRect(), mx = F3.mouse.x - r.left, my = F3.mouse.y - r.top, blow = FX.clamp(-r.top / r.height) * 2;
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
    for (const p of pts) { const dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy; if (d2 < 13000) { const f = ((13000 - d2) / 13000) * 6, dd = Math.sqrt(d2) || 1; p.vx += (dx / dd) * f; p.vy += (dy / dd) * f; } p.vx += (p.hx + (p.hx - W / 2) * blow - p.x) * 0.045; p.vy += (p.hy + (p.hy - H / 2) * blow - p.y) * 0.045; p.vx *= 0.82; p.vy *= 0.82; p.x += p.vx; p.y += p.vy; g.fillStyle = p.c; g.fillRect(p.x, p.y, step - 1, step - 1); }
  });
};

/* ---------- jelzáporozás (az ágazat jeleivel és a bolt szavaival) ---------- */
A5M.eso = function (stage, opt = '01') {
  const { c, g, dpr } = a5cv(stage), K = a5col(), fs = 16, chars = (opt + C.name.replace(/\s/g, '')).split('');
  let cols = []; const reset = () => { cols = Array.from({ length: Math.ceil(c.width / dpr / fs) }, () => Math.random() * (c.height / dpr / fs)); }; reset(); FX.on(window, 'resize', reset);
  let last = 0;
  FX.tick((t) => { if (!F3.visible(stage) || t - last < 55) return; last = t; g.setTransform(dpr, 0, 0, dpr, 0, 0); g.globalCompositeOperation = 'destination-out'; g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(0, 0, c.width, c.height); g.globalCompositeOperation = 'source-over'; g.font = fs + 'px ui-monospace, Consolas, monospace'; cols.forEach((y, i) => { g.fillStyle = Math.random() > 0.96 ? rgba(K.I, 1) : rgba(i % 5 ? K.A : K.B, 0.7); g.fillText(chars[(Math.random() * chars.length) | 0], i * fs, y * fs); cols[i] = y * fs > c.height / dpr && Math.random() > 0.975 ? 0 : y + 1; }); });
};

/* ---------- folyékony buborékok ---------- */
A5M.goo = function (stage) {
  const w = FX.add(document.createElement('div')); w.className = 'a5-goo';
  w.innerHTML = `<svg width="0" height="0" style="position:absolute"><filter id="a5Goo"><feGaussianBlur in="SourceGraphic" stdDeviation="24" result="b"/><feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 28 -12"/></filter></svg><div class="a5-goo-in">${[0, 1, 2, 3, 4, 5, 6].map((i) => `<span class="g${i % 3}" style="width:${130 + (i % 3) * 70}px;height:${130 + (i % 3) * 70}px"></span>`).join('')}</div>`;
  stage.append(w); F3.trackMouse(); const bl = $$('span', w).map((b, i) => ({ b, x: 0, y: 0, a: i * 1.7, r: 130 + (i % 3) * 70 }));
  FX.tick((t) => { if (!F3.visible(stage)) return; const r = stage.getBoundingClientRect(), mx = F3.mouse.x - r.left, my = F3.mouse.y - r.top, inside = mx > 0 && my > 0 && mx < r.width && my < r.height; bl.forEach((s, i) => { const tx = r.width * (+stage.dataset.mx || 0.65) + Math.cos(t / 2600 + s.a) * r.width * 0.22 + Math.sin(t / 1700 + i) * 50, ty = r.height / 2 + Math.sin(t / 3100 + s.a) * r.height * 0.28, f = i === 0 && inside; s.x += ((f ? mx : tx) - s.x) * (f ? 0.12 : 0.03); s.y += ((f ? my : ty) - s.y) * (f ? 0.12 : 0.03); s.b.style.transform = `translate(${s.x - s.r / 2}px, ${s.y - s.r / 2}px)`; }); });
};

/* ---------- tervrajz-lencse ---------- */
A5M.tervlencse = function (stage) {
  const w = FX.add(document.createElement('div')); w.className = 'a5-bp';
  w.innerHTML = `<div class="a5-bp-blue" style="background-image:url(${LX.hero()})"></div><div class="a5-bp-photo" style="background-image:url(${LX.hero()})"></div><div class="a5-bp-grid"></div><svg class="a5-bp-dim" viewBox="0 0 1000 600" preserveAspectRatio="none"><path d="M60 560 H940 M60 548 V572 M940 548 V572 M960 60 V540 M948 60 H972 M948 540 H972"/><circle cx="780" cy="170" r="70"/><path d="M710 170 H850 M780 100 V240"/></svg><span class="a5-bp-rd"></span>`;
  stage.append(w); const lens = F4.wander(stage), ph = $('.a5-bp-photo', w), rd = $('.a5-bp-rd', w);
  FX.tick(() => { const r = stage.getBoundingClientRect(), x = lens.x * r.width, y = lens.y * r.height; ph.style.clipPath = `circle(${Math.min(200, r.width * 0.15)}px at ${x}px ${y}px)`; rd.textContent = `X ${String(Math.round(x)).padStart(4, '0')} · Y ${String(Math.round(y)).padStart(4, '0')}`; });
};

/* ---------- AR-szkenner a nyitóképen ---------- */
A5M.ar = function (stage) {
  const P = LX2.P().slice(0, 3), w = FX.add(document.createElement('div')); w.className = 'a5-ar';
  w.innerHTML = `<div class="a5-dp" style="background-image:url(${LX.hero()})"></div><div class="a5-ar-hud"><i></i><i></i><i></i><i></i><b class="a5-ar-scan"></b><span class="a5-ar-t">◉ AR · ${esc(C.name).toUpperCase()} · OBJEKTUM: ${P.length}</span></div>
    ${P.map((p, k) => `<a class="a5-ar-s" href="#/termek/${p.slug}" style="left:${[58, 78, 66][k]}%;top:${[30, 46, 70][k]}%"><i></i><span><small>AZONOSÍTVA</small><b>${esc(p.name)}</b><em>${pft(p)}</em></span></a>`).join('')}`;
  stage.append(w); $$('.a5-ar-s', w).forEach((s, i) => FX.later(() => s.classList.add('on'), 900 + i * 700));
};

window.A5M = A5M;
