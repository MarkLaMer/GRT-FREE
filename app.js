(function () {
  const app = document.getElementById('app');
  const canvas = document.getElementById('qrCanvas');
  const ctx = canvas.getContext('2d');
  const bt = document.getElementById('bounceTime');
  const bars = document.querySelector('.bars');
  const barEls = [document.getElementById('bar0'), document.getElementById('bar1'), document.getElementById('bar2')];
  const tmClock = document.getElementById('tmClock');

  /* ---------------- NAVIGATION ---------------- */
  function go(screen) { app.dataset.screen = screen; }
  document.querySelectorAll('[data-go]').forEach(el =>
    el.addEventListener('click', () => go(el.dataset.go)));

  let modalOpen = false;
  function openTicket() {
    randomizeColors();          // new date-bar colors each time the ticket is opened
    drawQR(Math.floor(Math.random() * 1e6));
    app.dataset.modal = 'open';
    modalOpen = true;
    seedBounce();
  }
  function closeTicket() { app.dataset.modal = 'closed'; modalOpen = false; }
  document.querySelectorAll('[data-open-ticket]').forEach(el => el.addEventListener('click', openTicket));
  document.querySelectorAll('[data-close-ticket]').forEach(el => el.addEventListener('click', closeTicket));

  /* ------------- DATE-BAR COLORS -------------
     Three colours, re-rolled on every ticket open. They keep the muted,
     medium-bright look of the originals (pink / grey / teal): fixed-ish
     saturation & lightness band, randomised hues spaced around the wheel. */
  function randomizeColors() {
    const base = Math.random() * 360;
    const spread = [0, 110 + Math.random() * 50, 215 + Math.random() * 70];
    barEls.forEach((el, i) => {
      const h = (base + spread[i] + (Math.random() * 24 - 12)) % 360;
      const s = 24 + Math.random() * 34;     // 24%–58%  (incl. occasional greyish)
      const l = 45 + Math.random() * 11;     // 45%–56%  medium brightness
      el.style.background = `hsl(${h.toFixed(0)} ${s.toFixed(0)}% ${l.toFixed(0)}%)`;
    });
  }

  /* ---------------- QR (decorative) ---------------- */
  function mulberry32(seed) {
    return function () {
      seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function drawQR(seed) {
    const rand = mulberry32(seed * 999983 + 7);
    const cols = 60, cell = 4;
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cols * cell, cols * cell);
    ctx.fillStyle = '#000';
    for (let c = 0; c < cols; c++)
      for (let r = 0; r < cols; r++)
        if (rand() > 0.5) ctx.fillRect(c * cell, r * cell, cell, cell);
    const cx = cols / 2 * cell;
    const rings = [
      { r: 6, color: '#000' }, { r: 5, color: '#fff' }, { r: 4, color: '#000' },
      { r: 3, color: '#fff' }, { r: 2, color: '#000' }, { r: 1, color: '#fff' },
    ];
    for (const { r, color } of rings) {
      ctx.fillStyle = color;
      ctx.fillRect(cx - r * cell, cx - r * cell, r * 2 * cell, r * 2 * cell);
    }
    ctx.fillStyle = '#000';
    ctx.fillRect(cx - cell / 2, cx - cell / 2, cell, cell);
  }
  drawQR(0);

  /* ---------------- ANIMATION LOOP (time-based) ---------------- */
  const pad2 = n => String(n).padStart(2, '0');
  const EDGE = 10;          // px margin at each end of the bar
  const BOUNCE_MS = 3600;   // full left→right→left round-trip (slower, tuned to video)
  const QR_REFRESH_MS = 1000;

  // pronounced ease-in-out: clear pause/slow at each end, fast through the middle
  function easeInOutCubic(x) {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }
  function bouncePos(now, maxBx) {
    const u = (now % BOUNCE_MS) / BOUNCE_MS;          // 0..1 over full cycle
    const tri = u < 0.5 ? u * 2 : (1 - u) * 2;         // 0→1→0 triangle (one-way each half)
    return EDGE + maxBx * easeInOutCubic(tri);
  }

  let lastQR = 0;
  let qrSeed = 0;

  function frame(now) {
    const d = new Date();

    // status-bar pill (modal) shows live clock
    if (tmClock) tmClock.textContent = `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;

    if (modalOpen) {
      // live date/time text
      bt.textContent =
        `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())} ` +
        `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${String(d.getFullYear()).slice(-2)}`;

      // refresh the QR periodically for a "live secure code" feel
      if (now - lastQR > QR_REFRESH_MS) { qrSeed = (qrSeed + 1) % 1e6; drawQR(qrSeed * 7919 + 3); lastQR = now; }

      // bounce: pronounced ease-in-out — visibly slow at the edges, fast in the middle
      const maxBx = Math.max(0, bars.offsetWidth - bt.offsetWidth - EDGE * 2);
      bt.style.left = bouncePos(now, maxBx) + 'px';
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // initialize state (robust to the modal being open on load)
  function seedBounce() {
    const d = new Date();
    bt.textContent =
      `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())} ` +
      `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${String(d.getFullYear()).slice(-2)}`;
    const maxBx = Math.max(0, bars.offsetWidth - bt.offsetWidth - EDGE * 2);
    bt.style.left = (EDGE + maxBx / 2) + 'px';
  }
  if (app.dataset.modal === 'open') { randomizeColors(); drawQR(Math.floor(Math.random() * 1e6)); modalOpen = true; seedBounce(); }
})();
