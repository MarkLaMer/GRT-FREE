// SVG icon set (24x24, currentColor) — simple line/solid glyphs
const ICONS = {
  TICKET: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h15A1.5 1.5 0 0 1 21 8.5V11a2 2 0 0 0 0 4v2.5A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5V15a2 2 0 0 0 0-4z"/><path d="M9 7v12" stroke-dasharray="2 2.4"/></svg>',
  WALLET: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7.5A1.5 1.5 0 0 1 4.5 6H17a1 1 0 0 1 1 1v1"/><rect x="3" y="7.5" width="18" height="12" rx="2.2"/><path d="M16 12.5h4v3.5h-4a1.75 1.75 0 0 1 0-3.5z"/><circle cx="16.6" cy="14.25" r=".9" fill="currentColor" stroke="none"/></svg>',
  STAR: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3.2l2.65 5.37 5.93.86-4.29 4.18 1.01 5.9L12 16.7l-5.3 2.81 1.01-5.9-4.29-4.18 5.93-.86z"/></svg>',
  TAG: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4.5h7.5a2 2 0 0 1 1.4.6l6.5 6.5a1.8 1.8 0 0 1 0 2.6l-5.3 5.3a1.8 1.8 0 0 1-2.6 0l-6.5-6.5a2 2 0 0 1-.6-1.4z" transform="translate(-1 0)"/><circle cx="7.4" cy="8" r="1.25" fill="currentColor" stroke="none"/></svg>',
  BAG: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4.5l-1.4 2.2M15 4.5l1.4 2.2M8.2 6.7h7.6l1.3 1.6c2.1 2.6 3 5.9 1.9 8.6A4.6 4.6 0 0 1 14.7 20H9.3a4.6 4.6 0 0 1-4.3-3.1c-1.1-2.7-.2-6 1.9-8.6z"/></svg>',
  MAP: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4.5L4 6.5v13l5-2 6 2 5-2v-13l-5 2-6-2z"/><path d="M9 4.5v13M15 6.5v13"/><circle cx="16.5" cy="6.6" r="2.4" fill="#fff" stroke="currentColor"/></svg>',
  CLOCK: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.3"/><path d="M12 7.5V12l3 1.8"/></svg>',
  ALERT: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.3"/><path d="M12 7.6v5.2"/><circle cx="12" cy="16.2" r="1.05" fill="currentColor" stroke="none"/></svg>',
  WARN: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.8L21 19.5H3z"/><path d="M12 9.6v4.4"/><circle cx="12" cy="16.8" r="1.05" fill="currentColor" stroke="none"/></svg>',
  GLOBE: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.3"/><path d="M3.7 12h16.6M12 3.7c2.4 2.2 3.6 5.2 3.6 8.3S14.4 18.1 12 20.3C9.6 18.1 8.4 15.1 8.4 12S9.6 5.9 12 3.7z"/></svg>',
  INFO: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5.2"/><circle cx="12" cy="7.9" r="1.05" fill="currentColor" stroke="none"/></svg>',
  CHEV: '<svg viewBox="0 0 8 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 1l6 6-6 6"/></svg>',
  CHEV_DK: '<svg viewBox="0 0 8 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 1l6 6-6 6"/></svg>',
  BACK: '<svg viewBox="0 0 8 14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 1L1 7l6 6"/></svg>',
  REFRESH: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11a8 8 0 1 0-.9 5"/><path d="M20 4.5V11h-6.2"/></svg>',
  BELL: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8.5a6 6 0 0 0-12 0c0 6-2.4 7.5-2.4 7.5h16.8S18 14.5 18 8.5z"/><path d="M10 20a2.2 2.2 0 0 0 4 0"/></svg>',
};

// Status bar right-side icons (cellular, wifi, battery)
const SB_ICONS = `
<svg class="sb-icon" viewBox="0 0 22 14" fill="currentColor" style="width:19px">
  <rect x="0" y="9" width="3.2" height="5" rx="1"/>
  <rect x="5" y="6" width="3.2" height="8" rx="1"/>
  <rect x="10" y="3" width="3.2" height="11" rx="1" opacity=".35"/>
  <rect x="15" y="0" width="3.2" height="14" rx="1" opacity=".35"/>
</svg>
<svg class="sb-icon" viewBox="0 0 18 14" fill="currentColor" style="width:18px">
  <path d="M9 1.6C5.7 1.6 2.7 2.9.5 5l1.7 1.8C3.9 5.1 6.3 4 9 4s5.1 1.1 6.8 2.8L17.5 5C15.3 2.9 12.3 1.6 9 1.6z"/>
  <path d="M9 6.4c-2 0-3.8.8-5.1 2.1L5.6 10.4C6.5 9.5 7.7 9 9 9s2.5.5 3.4 1.4l1.7-1.9C12.8 7.2 11 6.4 9 6.4z"/>
  <path d="M9 11c-.9 0-1.7.4-2.3 1L9 14.4 11.3 12c-.6-.6-1.4-1-2.3-1z"/>
</svg>
<span class="sb-batt warn"><span class="batt-pct">19</span><span class="batt-body"><span class="batt-fill" style="width:19%"></span></span><span class="batt-cap"></span></span>
`;

function applyIcons() {
  const app = document.getElementById('app');
  let html = app.innerHTML;
  html = html
    .replace(/__IC_TICKET__/g, ICONS.TICKET)
    .replace(/__IC_WALLET__/g, ICONS.WALLET)
    .replace(/__IC_STAR__/g, ICONS.STAR)
    .replace(/__IC_TAG__/g, ICONS.TAG)
    .replace(/__IC_BAG__/g, ICONS.BAG)
    .replace(/__IC_MAP__/g, ICONS.MAP)
    .replace(/__IC_CLOCK__/g, ICONS.CLOCK)
    .replace(/__IC_ALERT__/g, ICONS.ALERT)
    .replace(/__IC_WARN__/g, ICONS.WARN)
    .replace(/__IC_GLOBE__/g, ICONS.GLOBE)
    .replace(/__IC_INFO__/g, ICONS.INFO)
    .replace(/__IC_CHEV_DK__/g, ICONS.CHEV_DK)
    .replace(/__IC_CHEV__/g, ICONS.CHEV)
    .replace(/__IC_BACK__/g, ICONS.BACK)
    .replace(/__IC_REFRESH__/g, ICONS.REFRESH)
    .replace(/__IC_BELL__/g, ICONS.BELL);
  app.innerHTML = html;
  document.querySelectorAll('[data-sb-icons]').forEach(el => el.innerHTML = SB_ICONS);
}
applyIcons();
