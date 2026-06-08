# GRT Free — setup guide

The app is split into two halves:

| Half | Folder | Hosting |
|---|---|---|
| **The app (PWA)** | project root (`index.html`, `app.js`, `push.js`, `sw.js`, `manifest.webmanifest`, `app.css`, `icons.js`, `assets/`) | **GitHub Pages** (free static hosting) |
| **The alert backend** | `cloudflare/` | **Cloudflare Workers** (free tier) |

The app works immediately in **demo mode** (alerts save on your device). Push notifications only start working after you do Part B and paste two values into `push.js`.

---

## Part A — Put the app on GitHub Pages

1. Create a new GitHub repo and upload everything **except** the `cloudflare/` folder
   (root files + the `assets/` folder).
2. In the repo: **Settings → Pages → Build and deployment → Source = "Deploy from a branch"**, pick `main` / `/root`, save.
3. After a minute your app is live at `https://YOUR_USERNAME.github.io/REPO_NAME/`.
   - HTTPS is required for service workers — GitHub Pages gives you that automatically.
4. **On your iPhone:** open that URL in Safari → Share → **Add to Home Screen**.
   Push notifications on iOS **only** work from the installed (Home-Screen) app, not a Safari tab.

> Tip: if you publish to a project subpath (`/REPO_NAME/`), everything here already uses
> relative paths, so it will work without changes.

---

## Part B — Deploy the alert backend (Cloudflare Worker)

You'll need a free Cloudflare account and Node.js installed.

```bash
cd cloudflare
npm install
npx wrangler login
```

### 1. Create the KV store
```bash
npx wrangler kv namespace create ALERTS
```
Copy the printed `id` into `wrangler.toml` (replace `PASTE_YOUR_KV_NAMESPACE_ID_HERE`).

### 2. Generate your VAPID keys
```bash
npx web-push generate-vapid-keys
```
You'll get a **Public Key** and a **Private Key**. Set them as secrets:
```bash
npx wrangler secret put VAPID_PUBLIC_KEY     # paste the public key
npx wrangler secret put VAPID_PRIVATE_KEY    # paste the private key
npx wrangler secret put VAPID_SUBJECT        # type: mailto:you@example.com
```

### 3. Set the two plain vars in `wrangler.toml`
- `ALLOW_ORIGIN` → your GitHub Pages origin, e.g. `https://yourname.github.io`
- `GRT_TRIPUPDATES_URL` → the **current** GRT TripUpdates feed URL.
  Get it from the Region of Waterloo's GRT GTFS-Realtime publishing tool /
  open-data portal — look for **TripUpdates.pb**. (The host has changed over the
  years, so grab the live one rather than trusting an old link.)

### 4. Deploy
```bash
npx wrangler deploy
```
Wrangler prints your Worker URL, e.g. `https://grt-alerts.yourname.workers.dev`.

---

## Part C — Connect the app to the backend

Open **`push.js`** (root) and fill in the two values at the top:

```js
window.GRT_CONFIG = {
  WORKER_URL: 'https://grt-alerts.yourname.workers.dev',   // from step B4
  VAPID_PUBLIC_KEY: 'YOUR_VAPID_PUBLIC_KEY',               // same public key from B2
};
```

Commit & push to GitHub. Done — the "Bus Arrival Alerts" screen will now ask for
notification permission and register real alerts.

---

## How it runs

1. You set an alert in the app → it subscribes to push and POSTs
   `{route, stop, minutes, subscription}` to the Worker, saved in KV.
2. Every minute the Worker's cron fetches the GRT TripUpdates feed, finds the soonest
   arrival of your route at your stop, and if it's within your chosen minutes it sends a
   push. It won't spam you for the same bus twice.
3. Your phone shows the notification even if the app is closed (Android always; iPhone
   when installed to the Home Screen).

---

## Things to know / tune

- **Route & stop numbers:** the app matches the GTFS `route_id` and `stop_id` from the
  feed. For GRT these usually equal the public route number and the stop number on the
  sign. If your route shows as something like `7-31`, the Worker already strips the suffix
  (`routeMatches()` in `worker.js`) — adjust that function if your agency differs.
- **Free-tier limits:** a once-a-minute cron + a handful of alerts is far under Cloudflare's
  free Workers/KV limits.
- **Testing locally:** `npx wrangler dev` runs the Worker; `npx wrangler tail` streams its
  logs so you can watch feed fetches and pushes.
- **iOS quirk:** if notifications don't arrive, confirm the app was opened from the Home
  Screen icon (standalone), not Safari, and that you allowed notifications.
