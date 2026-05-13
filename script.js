const canvas = document.getElementById('qrCanvas');
const ctx = canvas.getContext('2d');

let elapsed = 0;
let maxBx = 100;
let currentTheme = 0, lastQRTheme = -1;

function mulberry32(seed) {
  return function() {
    seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function drawQR(seed) {
  const rand = mulberry32(seed * 999983 + 7);
  const cols = 60, cell = 4;  // 60x60 cells, 4px each = 240px canvas
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, cols * cell, cols * cell);
  ctx.fillStyle = '#000';
  for (let c = 0; c < cols; c++)
    for (let r = 0; r < cols; r++)
      if (rand() > 0.5) ctx.fillRect(c * cell, r * cell, cell, cell);
  // 5 rings of 1 cell each, centered exactly in the 240px canvas (center = 120px)
  const cx = cols / 2 * cell;  // 120px
  const rings = [
    { r: 6, color: '#000' },
    { r: 5, color: '#fff' },
    { r: 4, color: '#000' },
    { r: 3, color: '#fff' },
    { r: 2, color: '#000' },
    { r: 1, color: '#fff' },
  ];
  for (const { r, color } of rings) {
    ctx.fillStyle = color;
    ctx.fillRect(cx - r * cell, cx - r * cell, r * 2 * cell, r * 2 * cell);
  }
  // single black center cell, visually centered
  ctx.fillStyle = '#000';
  ctx.fillRect(cx - cell / 2, cx - cell / 2, cell, cell);
}

function pad2(n) { return String(n).padStart(2, '0'); }

function tick() {
  const now = new Date();

  const theme = Math.floor(now.getSeconds() / 4) % 3;
  if (theme !== currentTheme) currentTheme = theme;
  if (currentTheme !== lastQRTheme) {
    drawQR(currentTheme);
    lastQRTheme = currentTheme;
  }

  const bt = document.getElementById('bounceTime');
  bt.textContent = `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())} ${pad2(now.getDate())}/${pad2(now.getMonth() + 1)}/${String(now.getFullYear()).slice(-2)}`;

  const bars = document.querySelector('.bars');
  maxBx = Math.max(0, bars.offsetWidth - bt.offsetWidth);

  // cosine easing: slow at ends, fast in the middle; full back-and-forth = 2s
  elapsed++;
  const period = 166; // ~83 ticks/direction × 2 (33% slower)
  const t = (elapsed % period) / period;
  const bx = maxBx * (1 - Math.cos(t * 2 * Math.PI)) / 2;

  bt.style.left = bx + 'px';
}

drawQR(0);
lastQRTheme = 0;
setInterval(tick, 16);
