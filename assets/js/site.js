/* Mobile menu + the lab-floor animation on the home page.
   Scene: lane robots carrying parcels, a platoon carrying a plank,
   and a robot arm that picks a box and stacks it on a shelf. */
(function () {
  // ---- Mobile menu ----
  var btn = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // ---- Hero canvas ----
  var c = document.getElementById('hero-canvas');
  if (!c || !c.getContext) return;
  var ctx = c.getContext('2d');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var CELL = 60, TAPE = '#4FA3E3', INK = '#0F2742', ACC = '79,163,227';
  // Colours follow the colour scheme chosen in _config.yml (read from the CSS variables).
  function readColors() {
    var cs = getComputedStyle(document.documentElement);
    var tape = cs.getPropertyValue('--tape').trim(), ink = cs.getPropertyValue('--ink').trim();
    if (/^#[0-9a-f]{6}$/i.test(tape)) { TAPE = tape; ACC = [1, 3, 5].map(function (i) { return parseInt(tape.substr(i, 2), 16); }).join(','); }
    if (/^#[0-9a-f]{6}$/i.test(ink)) INK = ink;
  }
  function acc(a) { return 'rgba(' + ACC + ',' + a + ')'; }
  var W = 0, H = 0, agents = [], t = 0, last = 0, raf = 0;
  var bx, by, L, B, P, Q, HOME;           // arm geometry

  function rnd(n) { return Math.floor(Math.random() * n); }
  function ease(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }
  function lerp(a, b, u) { return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u }; }

  function size() {
    readColors();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = c.clientWidth; H = c.clientHeight;
    c.width = W * dpr; c.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var cols = Math.ceil(W / CELL) + 1, rows = Math.ceil(H / CELL) + 1;
    var n = Math.max(8, Math.round(W * H / 30000));
    agents = [];
    for (var i = 0; i < n; i++) {
      var a = { gx: rnd(cols), gy: rnd(rows), dx: 0, dy: 0, p: Math.random(),
                v: .006 + Math.random() * .008, cols: cols, rows: rows, load: Math.random() < .5 };
      if (Math.random() < .5) a.dx = Math.random() < .5 ? 1 : -1; else a.dy = Math.random() < .5 ? 1 : -1;
      agents.push(a);
    }

    // robot arm geometry
    L = Math.min(H * .26, W * .13);
    B = Math.max(14, L * .3);
    bx = W * .72; by = H * .84;
    P = { x: bx - L * 1.3, y: by - B / 2 - 4 };            // pick position (box centre)
    Q = { x: bx + L * 1.25, y: by - L * .95 - B / 2 };     // place position, slot 0
    HOME = { x: bx + L * .25, y: by - L * 1.45 };
    draw();
  }

  function step(a) {
    a.p += a.v;
    if (a.p >= 1) {
      a.p = 0; a.gx += a.dx; a.gy += a.dy;
      if (Math.random() < .3) { var h = a.dx !== 0; a.dx = h ? 0 : (Math.random() < .5 ? 1 : -1); a.dy = h ? (Math.random() < .5 ? 1 : -1) : 0; }
      if (a.gx < 0) { a.gx = 0; a.dx = 1; } if (a.gx > a.cols) { a.gx = a.cols; a.dx = -1; }
      if (a.gy < 0) { a.gy = 0; a.dy = 1; } if (a.gy > a.rows) { a.gy = a.rows; a.dy = -1; }
    }
  }
  function pos(a) { return { x: (a.gx + a.dx * a.p) * CELL, y: (a.gy + a.dy * a.p) * CELL }; }

  // Platoon path: followers replay the leader's path with a delay.
  function path(s) {
    return { x: W * .76 + W * .13 * Math.sin(s * .45), y: H * .24 + H * .1 * Math.sin(s * .9 + .6) };
  }

  // Two-link inverse kinematics, elbow up. Target is relative to the base.
  function ik(tx, ty) {
    var d = Math.hypot(tx, ty), mx = 2 * L * .999;
    if (d > mx) { tx *= mx / d; ty *= mx / d; d = mx; }
    var cs = Math.max(-1, Math.min(1, (d * d - 2 * L * L) / (2 * L * L)));
    var q2 = Math.acos(cs), best = null;
    [q2, -q2].forEach(function (q) {
      var a1 = Math.atan2(ty, tx) - Math.atan2(L * Math.sin(q), L + L * Math.cos(q));
      var ex = L * Math.cos(a1), ey = L * Math.sin(a1);
      if (!best || ey < best.ey) best = { ex: ex, ey: ey, x: tx, y: ty };
    });
    return best;
  }

  // One pick-and-place cycle every 9 s.
  function armState(s) {
    var T = 9, k = Math.floor(s / T), u = s - k * T, tg, holding = false;
    if (u < 1.4) tg = lerp(HOME, P, ease(u / 1.4));
    else if (u < 1.9) tg = P;
    else if (u < 3.9) { tg = lerp(P, Q, ease((u - 1.9) / 2.0)); holding = true; }
    else if (u < 4.4) tg = Q;
    else if (u < 6.2) tg = lerp(Q, HOME, ease((u - 4.4) / 1.8));
    else tg = HOME;
    if (u >= 1.7 && u < 3.95) holding = true;
    return { tg: tg, holding: holding, u: u, slot: k % 3 };
  }

  function box(x, y, alpha) {
    ctx.fillStyle = acc(0.22 * alpha);
    ctx.strokeStyle = acc(alpha); ctx.lineWidth = 1.5;
    ctx.fillRect(x - B / 2, y - B / 2, B, B); ctx.strokeRect(x - B / 2, y - B / 2, B, B);
  }

  function drawArm(s) {
    var st = armState(s);
    // floor line and shelf
    ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(bx - L * 2.1, by + 10); ctx.lineTo(bx + L * 2.1, by + 10); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.35)';
    ctx.beginPath(); ctx.moveTo(Q.x - B, Q.y + B / 2 + 2); ctx.lineTo(Q.x + B, Q.y + B / 2 + 2);
    ctx.moveTo(Q.x, Q.y + B / 2 + 2); ctx.lineTo(Q.x, by + 10); ctx.stroke();
    // stacked boxes already on the shelf
    for (var i = 0; i < st.slot; i++) box(Q.x, Q.y - i * B, .7);
    // box waiting at the pick position
    if (st.u < 1.7) box(P.x, P.y, Math.min(1, st.u / .3) * .9);
    // arm
    var q = ik(st.tg.x - bx, st.tg.y - by);
    var sx = bx, sy = by, ex = bx + q.ex, ey = by + q.ey, wx = bx + q.x, wy = by + q.y;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = '#D8DEE4'; ctx.lineWidth = Math.max(6, L * .11);
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.lineTo(wx, wy); ctx.stroke();
    ctx.fillStyle = '#2A323B'; ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 1.5;
    ctx.fillRect(bx - L * .22, by - 2, L * .44, 12);
    // gripper
    var ang = Math.atan2(wy - ey, wx - ex), gap = st.holding ? B * .5 : B * .85, f = B * .55;
    var nx = -Math.sin(ang), ny = Math.cos(ang), ax = Math.cos(ang), ay = Math.sin(ang);
    ctx.strokeStyle = TAPE; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(wx + nx * gap / 2 + ax * f, wy + ny * gap / 2 + ay * f); ctx.lineTo(wx + nx * gap / 2, wy + ny * gap / 2);
    ctx.lineTo(wx - nx * gap / 2, wy - ny * gap / 2); ctx.lineTo(wx - nx * gap / 2 + ax * f, wy - ny * gap / 2 + ay * f);
    ctx.stroke();
    // joints
    [[sx, sy], [ex, ey], [wx, wy]].forEach(function (j) {
      ctx.fillStyle = INK; ctx.strokeStyle = TAPE; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(j[0], j[1], 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    });
    // held box, or box just placed
    if (st.holding) box(wx + ax * (f + B * .35), wy + ay * (f + B * .35), .95);
    else if (st.u >= 3.95 && st.u < 6.2 || st.u >= 6.2) box(Q.x, Q.y - st.slot * B, .95);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(255,255,255,.07)'; ctx.lineWidth = 1; ctx.beginPath();
    for (var x = 0; x <= W; x += CELL) { ctx.moveTo(x + .5, 0); ctx.lineTo(x + .5, H); }
    for (var y = 0; y <= H; y += CELL) { ctx.moveTo(0, y + .5); ctx.lineTo(W, y + .5); }
    ctx.stroke();

    var P2 = agents.map(pos), i, j;
    for (i = 0; i < P2.length; i++) for (j = i + 1; j < P2.length; j++) {
      var d = Math.hypot(P2[i].x - P2[j].x, P2[i].y - P2[j].y);
      if (d < CELL * 2.4) {
        ctx.strokeStyle = acc((0.3 * (1 - d / (CELL * 2.4))).toFixed(3));
        ctx.beginPath(); ctx.moveTo(P2[i].x, P2[i].y); ctx.lineTo(P2[j].x, P2[j].y); ctx.stroke();
      }
    }
    for (i = 0; i < P2.length; i++) {
      ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillRect(P2[i].x - 3, P2[i].y - 3, 6, 6);
      if (agents[i].load) { ctx.strokeStyle = acc(.75); ctx.lineWidth = 1.5; ctx.strokeRect(P2[i].x - 3, P2[i].y - 10, 6, 6); }
    }

    // platoon carrying a plank
    var K = 4, bots = [];
    for (i = 0; i < K; i++) bots.push(path(t - i * .55));
    ctx.lineCap = 'round'; ctx.strokeStyle = TAPE; ctx.lineWidth = 5; ctx.beginPath();
    ctx.moveTo(bots[0].x, bots[0].y);
    for (i = 1; i < K; i++) ctx.lineTo(bots[i].x, bots[i].y);
    ctx.stroke();
    for (i = 0; i < K; i++) {
      ctx.fillStyle = INK; ctx.strokeStyle = TAPE; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(bots[i].x, bots[i].y, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = i === 0 ? TAPE : '#fff';
      ctx.beginPath(); ctx.arc(bots[i].x, bots[i].y, 3, 0, Math.PI * 2); ctx.fill();
    }

    drawArm(reduce ? 2.6 : t);
  }

  function loop(ts) {
    var dt = Math.min((ts - last) / 1000 || 0, .05); last = ts;
    t += dt;
    for (var i = 0; i < agents.length; i++) step(agents[i]);
    draw();
    raf = requestAnimationFrame(loop);
  }

  size();
  window.addEventListener('resize', size);
  if (!reduce) {
    raf = requestAnimationFrame(loop);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) cancelAnimationFrame(raf); else { last = performance.now(); raf = requestAnimationFrame(loop); }
    });
  }
})();
