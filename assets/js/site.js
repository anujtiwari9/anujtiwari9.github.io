/* Mobile menu + the warehouse-floor animation on the home page. */
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

  // ---- Hero canvas: lane robots plus a platoon carrying a plank ----
  var c = document.getElementById('hero-canvas');
  if (!c || !c.getContext) return;
  var ctx = c.getContext('2d');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var CELL = 60, TAPE = '#F0B323';
  var W = 0, H = 0, agents = [], t = 0, last = 0, raf = 0;

  function rnd(n) { return Math.floor(Math.random() * n); }

  function size() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = c.clientWidth; H = c.clientHeight;
    c.width = W * dpr; c.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var cols = Math.ceil(W / CELL) + 1, rows = Math.ceil(H / CELL) + 1;
    var n = Math.max(8, Math.round(W * H / 24000));
    agents = [];
    for (var i = 0; i < n; i++) {
      agents.push({ gx: rnd(cols), gy: rnd(rows), dx: Math.random() < .5 ? 1 : 0, dy: 0, p: Math.random(),
                    v: .006 + Math.random() * .008, cols: cols, rows: rows });
      var a = agents[i]; if (!a.dx) a.dy = Math.random() < .5 ? 1 : -1; else a.dx = Math.random() < .5 ? 1 : -1;
    }
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

  // The platoon leader follows a smooth loop; followers replay the path with a delay,
  // like decentralized robots that keep a flexible object from deforming.
  function path(s) {
    return { x: W * .70 + W * .20 * Math.sin(s * .45), y: H * .52 + H * .26 * Math.sin(s * .9 + .6) };
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    // floor grid
    ctx.strokeStyle = 'rgba(255,255,255,.07)'; ctx.lineWidth = 1; ctx.beginPath();
    for (var x = 0; x <= W; x += CELL) { ctx.moveTo(x + .5, 0); ctx.lineTo(x + .5, H); }
    for (var y = 0; y <= H; y += CELL) { ctx.moveTo(0, y + .5); ctx.lineTo(W, y + .5); }
    ctx.stroke();

    var P = agents.map(pos), i, j;
    // links between neighbouring robots
    for (i = 0; i < P.length; i++) for (j = i + 1; j < P.length; j++) {
      var d = Math.hypot(P[i].x - P[j].x, P[i].y - P[j].y);
      if (d < CELL * 2.4) {
        ctx.strokeStyle = 'rgba(240,179,35,' + (0.35 * (1 - d / (CELL * 2.4))).toFixed(3) + ')';
        ctx.beginPath(); ctx.moveTo(P[i].x, P[i].y); ctx.lineTo(P[j].x, P[j].y); ctx.stroke();
      }
    }
    for (i = 0; i < P.length; i++) {
      ctx.fillStyle = 'rgba(255,255,255,.55)';
      ctx.fillRect(P[i].x - 3, P[i].y - 3, 6, 6);
    }

    // platoon carrying a plank
    var K = 4, bots = [];
    for (i = 0; i < K; i++) bots.push(path(t - i * .55));
    ctx.lineCap = 'round'; ctx.strokeStyle = TAPE; ctx.lineWidth = 5; ctx.beginPath();
    ctx.moveTo(bots[0].x, bots[0].y);
    for (i = 1; i < K; i++) ctx.lineTo(bots[i].x, bots[i].y);
    ctx.stroke();
    for (i = 0; i < K; i++) {
      ctx.fillStyle = '#1D232A'; ctx.strokeStyle = TAPE; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(bots[i].x, bots[i].y, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = i === 0 ? TAPE : '#fff';
      ctx.beginPath(); ctx.arc(bots[i].x, bots[i].y, 3, 0, Math.PI * 2); ctx.fill();
    }
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
