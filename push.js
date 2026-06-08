/* =====================================================================
   GRT Free — Bus Arrival Alerts (front-end)
   ---------------------------------------------------------------------
   Fill these two values in after you deploy the Cloudflare Worker
   (see SETUP.md). Until then the screen runs in DEMO MODE: alerts are
   saved on this device and the UI works, but no push is delivered.
   ===================================================================== */
window.GRT_CONFIG = {
  // e.g. 'https://grt-alerts.yourname.workers.dev'  (no trailing slash)
  WORKER_URL: '',
  // The VAPID *public* key printed by `npx web-push generate-vapid-keys`
  VAPID_PUBLIC_KEY: '',
};

(function () {
  const cfg = window.GRT_CONFIG;
  const configured = !!(cfg.WORKER_URL && cfg.VAPID_PUBLIC_KEY);

  const routeInput = document.getElementById('alRoute');
  const stopInput = document.getElementById('alStop');
  const minutesWrap = document.getElementById('alMinutes');
  const enableBtn = document.getElementById('alEnable');
  const statusEl = document.getElementById('alStatus');
  const listEl = document.getElementById('alList');

  let selectedMin = 5;
  minutesWrap.addEventListener('click', (e) => {
    const b = e.target.closest('.al-min');
    if (!b) return;
    minutesWrap.querySelectorAll('.al-min').forEach(x => x.classList.toggle('active', x === b));
    selectedMin = parseInt(b.dataset.min, 10);
  });

  function setStatus(msg, kind) {
    if (!msg) { statusEl.hidden = true; return; }
    statusEl.hidden = false;
    statusEl.className = 'al-status ' + (kind || 'info');
    statusEl.textContent = msg;
  }

  /* ---------- local persistence of the user's alerts ---------- */
  const KEY = 'grtAlerts';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } };
  const save = (a) => localStorage.setItem(KEY, JSON.stringify(a));

  function render() {
    const alerts = load();
    listEl.innerHTML = alerts.map(a =>
      `<div class="al-card">
         <div class="al-route">${a.route}</div>
         <div class="al-info"><b>Stop ${a.stop}</b><span>Notify ${a.minutes} min before arrival</span></div>
         <button class="al-del" data-del="${a.id}" aria-label="Delete">&times;</button>
       </div>`).join('');
    listEl.querySelectorAll('[data-del]').forEach(btn =>
      btn.addEventListener('click', () => removeAlert(btn.dataset.del)));
  }

  /* ---------- service worker + push helpers ---------- */
  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(base64);
    const out = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
    return out;
  }

  async function getSubscription() {
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(cfg.VAPID_PUBLIC_KEY),
      });
    }
    return sub;
  }

  /* ---------- enable a new alert ---------- */
  enableBtn.addEventListener('click', async () => {
    const route = routeInput.value.trim();
    const stop = stopInput.value.trim();
    if (!route || !stop) { setStatus('Enter both a route number and a stop number.', 'warn'); return; }

    const alert = { id: 'a' + Date.now(), route, stop, minutes: selectedMin };

    // DEMO MODE — no backend configured yet
    if (!configured) {
      const a = load(); a.push(alert); save(a); render();
      routeInput.value = ''; stopInput.value = '';
      setStatus('Saved on this device (demo mode). Connect the Cloudflare Worker in push.js to receive real notifications.', 'info');
      return;
    }

    // Notifications + Service Worker required
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('This browser does not support push notifications.', 'err'); return;
    }
    enableBtn.disabled = true;
    try {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') {
        setStatus('Notifications are blocked. Enable them for this site (on iPhone, add the app to your Home Screen first).', 'warn');
        enableBtn.disabled = false; return;
      }
      const sub = await getSubscription();
      const res = await fetch(cfg.WORKER_URL + '/subscribe', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...alert, subscription: sub }),
      });
      if (!res.ok) throw new Error('Server responded ' + res.status);
      const a = load(); a.push(alert); save(a); render();
      routeInput.value = ''; stopInput.value = '';
      setStatus(`Alert set — we'll notify you when route ${route} is about ${selectedMin} min from stop ${stop}.`, 'ok');
    } catch (err) {
      setStatus('Could not set the alert: ' + err.message, 'err');
    } finally {
      enableBtn.disabled = false;
    }
  });

  async function removeAlert(id) {
    const alerts = load();
    const target = alerts.find(a => a.id === id);
    save(alerts.filter(a => a.id !== id));
    render();
    if (configured && target) {
      try {
        const sub = await getSubscription();
        await fetch(cfg.WORKER_URL + '/unsubscribe', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, subscription: sub }),
        });
      } catch (e) { /* best-effort */ }
    }
  }

  /* ---------- register the service worker on load ---------- */
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => { /* ignore in preview */ });
  }

  render();
  if (!configured) {
    setStatus('Demo mode: alerts save on this device. See SETUP.md to connect push notifications.', 'info');
  }
})();
