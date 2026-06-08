(function () {
  const app = document.getElementById('app');
  const canvas = document.getElementById('qrCanvas');
  const ctx = canvas.getContext('2d');
  const bt = document.getElementById('bounceTime');
  const bars = document.querySelector('.bars');
  const barEls = [document.getElementById('bar0'), document.getElementById('bar1'), document.getElementById('bar2')];
  const tmClock = document.getElementById('tmClock');
  const banners = document.querySelector('.banners');
  const activatedBar = document.getElementById('activatedBar');

  const pad2 = n => String(n).padStart(2, '0');
  const ACTIVATED_MS = 5 * 60 * 1000;        // green "Activated" strip shows for first 5 min
  const VALID_MS = 2 * 60 * 60 * 1000;       // ticket stays active in the wallet for 2 hours
  let activatedTimer = null;

  /* ================= PERSISTENT WALLET STATE ================= */
  const ACTIVE_KEY = 'grtActiveTicket';
  const HIST_KEY = 'grtHistory';
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  function loadActive() { try { return JSON.parse(localStorage.getItem(ACTIVE_KEY)); } catch (e) { return null; } }
  function saveActive(o) { localStorage.setItem(ACTIVE_KEY, JSON.stringify(o)); }
  function clearActive() { localStorage.removeItem(ACTIVE_KEY); }
  function loadHistory() { try { return JSON.parse(localStorage.getItem(HIST_KEY)) || []; } catch (e) { return []; } }
  function saveHistory(a) { localStorage.setItem(HIST_KEY, JSON.stringify(a)); }
  function pushHistory(usedAt) { const h = loadHistory(); h.unshift({ usedAt }); saveHistory(h); }

  // seed a little sample history the first time the app runs
  if (localStorage.getItem(HIST_KEY) === null) {
    saveHistory([
      { usedAt: Date.parse('2026-05-13T09:10:00') },
      { usedAt: Date.parse('2026-05-11T17:42:00') },
      { usedAt: Date.parse('2026-05-08T08:05:00') },
      { usedAt: Date.parse('2026-05-07T12:30:00') },
    ]);
  }

  // returns the active ticket if still within its 2h window, else expires it to history
  function getValidActive() {
    const a = loadActive();
    if (!a) return null;
    if (Date.now() - a.activatedAt >= VALID_MS) {
      pushHistory(a.activatedAt);
      clearActive();
      return null;
    }
    return a;
  }

  /* ================= DATE-BAR COLORS ================= */
  // muted, medium-bright band — fresh hues per purchase, stored so a re-open looks identical
  function makeColors() {
    const base = Math.random() * 360;
    const spread = [0, 110 + Math.random() * 50, 215 + Math.random() * 70];
    return barEls.map((el, i) => {
      const h = (base + spread[i] + (Math.random() * 24 - 12)) % 360;
      const s = 24 + Math.random() * 34;
      const l = 45 + Math.random() * 11;
      return `hsl(${h.toFixed(0)} ${s.toFixed(0)}% ${l.toFixed(0)}%)`;
    });
  }
  function applyColors(cols) { barEls.forEach((el, i) => { el.style.background = cols[i]; }); }

  /* ================= ACTIVATED GREEN BAR ================= */
  function refreshActivatedBar(activatedAt) {
    clearTimeout(activatedTimer);
    const elapsed = Date.now() - activatedAt;
    const d = new Date(activatedAt);
    activatedBar.textContent = `Activated ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
    if (elapsed < ACTIVATED_MS) {
      banners.classList.add('activated');
      activatedTimer = setTimeout(() => banners.classList.remove('activated'), ACTIVATED_MS - elapsed);
    } else {
      banners.classList.remove('activated');
    }
  }

  /* ================= TICKET SHEET ================= */
  let modalOpen = false;
  let openActivatedAt = 0;

  function showTicketSheet(ticket) {
    openActivatedAt = ticket.activatedAt;
    applyColors(ticket.colors);
    drawQR(Math.floor(Math.random() * 1e6));
    refreshActivatedBar(ticket.activatedAt);
    app.dataset.modal = 'open';
    modalOpen = true;
    seedBounce();
  }

  // Buying / activating a NEW ticket (from the Select screen)
  function buyTicket() {
    const cur = loadActive();
    if (cur) pushHistory(cur.activatedAt);          // replace any existing active ticket
    const ticket = { activatedAt: Date.now(), colors: makeColors() };
    saveActive(ticket);
    showTicketSheet(ticket);
  }

  // Re-opening the SAME still-valid ticket from the wallet (no re-activation)
  function reopenTicket() {
    const a = getValidActive();
    if (!a) { renderWallet(); return; }
    showTicketSheet(a);
  }

  function closeTicket() { app.dataset.modal = 'closed'; modalOpen = false; renderWallet(); }

  document.querySelectorAll('[data-open-ticket]').forEach(el => el.addEventListener('click', buyTicket));
  document.querySelectorAll('[data-close-ticket]').forEach(el => el.addEventListener('click', closeTicket));

  /* ================= NAVIGATION ================= */
  function go(screen) {
    app.dataset.screen = screen;
    if (screen === 'wallet') renderWallet();
  }
  document.querySelectorAll('[data-go]').forEach(el => el.addEventListener('click', () => go(el.dataset.go)));

  /* ================= WALLET RENDERING ================= */
  const ticketsPane = document.querySelector('[data-pane="tickets"]');
  const historyPane = document.querySelector('[data-pane="history"]');

  function fmtUsed(ts) { const d = new Date(ts); return `Used ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`; }
  function fmtTime(ts) { const d = new Date(ts); return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`; }

  function renderWallet() {
    const a = getValidActive();
    if (a) {
      ticketsPane.innerHTML =
        `<div class="wallet-card" data-reopen-ticket>
           <div class="wc-top">
             <div class="wc-name"><b>Single Ride</b><span>Ticket</span></div>
             <div class="wc-status">ACTIVE</div>
           </div>
           <div class="wc-div"></div>
           <div class="wc-meta">Activated ${fmtTime(a.activatedAt)} · Valid until ${fmtTime(a.activatedAt + VALID_MS)}</div>
         </div>`;
      ticketsPane.querySelector('[data-reopen-ticket]').addEventListener('click', reopenTicket);
    } else {
      ticketsPane.innerHTML =
        `<div class="wallet-empty">
           <div class="we-icon">${TICKET_BIG}</div>
           <h2>Can't see your tickets?</h2>
           <p>Log in or create an account below</p>
         </div>`;
    }
    const h = loadHistory();
    historyPane.innerHTML = h.map(item =>
      `<div class="hist-card">
         <div class="hc-top">
           <div class="hc-name"><b>Single Ride</b><span>Ticket</span></div>
           <div class="hc-status">USED</div>
         </div>
         <div class="hc-div"></div>
         <div class="hc-meta">${fmtUsed(item.usedAt)}</div>
       </div>`).join('');
  }

  // wallet tab switching
  document.querySelectorAll('[data-wallet-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
      const which = tab.dataset.walletTab;
      document.querySelectorAll('[data-wallet-tab]').forEach(x => {
        const on = x.dataset.walletTab === which;
        x.classList.toggle('active', on);
        x.classList.toggle('inactive', !on);
      });
      document.querySelectorAll('.wallet-pane').forEach(p => { p.hidden = p.dataset.pane !== which; });
    });
  });
  const refreshBtn = document.querySelector('[data-wallet-refresh]');
  if (refreshBtn) refreshBtn.addEventListener('click', renderWallet);

  const TICKET_BIG = '<svg viewBox="0 0 120 110" fill="none" stroke="#0072bc" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><g transform="rotate(-18 60 55)"><path d="M30 34h60a4 4 0 0 1 4 4v9a8 8 0 0 0 0 16v9a4 4 0 0 1-4 4H30a4 4 0 0 1-4-4v-9a8 8 0 0 0 0-16v-9a4 4 0 0 1 4-4z"/><path d="M52 34v42" stroke-dasharray="3 7"/></g></svg>';

  /* ================= QR (decorative) ================= */
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

  /* ================= ANIMATION LOOP ================= */
  const EDGE = 10;
  const BOUNCE_MS = 3000;     // full round-trip → ~1.5s each way
  const QR_REFRESH_MS = 2000;

  function easeInOutQuad(x) { return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }
  function bouncePos(now, maxBx) {
    const u = (now % BOUNCE_MS) / BOUNCE_MS;
    const tri = u < 0.5 ? u * 2 : (1 - u) * 2;
    return EDGE + maxBx * easeInOutQuad(tri);
  }

  let lastQR = 0, qrSeed = 0;

  function frame(now) {
    const d = new Date();
    if (tmClock) tmClock.textContent = `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
    if (modalOpen) {
      bt.textContent =
        `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())} ` +
        `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${String(d.getFullYear()).slice(-2)}`;
      if (now - lastQR > QR_REFRESH_MS) { qrSeed = (qrSeed + 1) % 1e6; drawQR(qrSeed * 7919 + 3); lastQR = now; }
      const maxBx = Math.max(0, bars.offsetWidth - bt.offsetWidth - EDGE * 2);
      bt.style.left = bouncePos(now, maxBx) + 'px';
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  function seedBounce() {
    const d = new Date();
    bt.textContent =
      `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())} ` +
      `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${String(d.getFullYear()).slice(-2)}`;
    const maxBx = Math.max(0, bars.offsetWidth - bt.offsetWidth - EDGE * 2);
    bt.style.left = (EDGE + maxBx / 2) + 'px';
  }

  // initial paint
  renderWallet();
  if (app.dataset.modal === 'open') {
    const a = getValidActive();
    showTicketSheet(a || { activatedAt: Date.now(), colors: makeColors() });
  }
})();
