onload = () => {
const style = document.createElement('style');
style.textContent = `
  body { margin: 0; overflow: hidden; }
  canvas { display: block; position: absolute; top: 0; left: 0; }
`;
document.head.appendChild(style);
const bg = document.createElement('canvas');
const game = document.createElement('canvas');
document.body.append(bg,game);
let score = 0;
// Physics
const gravity = 0.5;
const jumpStrength = -14;

clouds(bg);

const canvas = game;
const ctx = canvas.getContext('2d');
let W=canvas.width = window.innerWidth;
let H=canvas.height = window.innerHeight;

// Platforms
let plats = [];
const pspace = 100;
const pspeed = 1;
const pwidth = 80;
const pheight = 10;
let poscill = W / 3;
for (let y = 0; y < H; y += pspace) {
  const baseX = Math.random() * (W - pwidth - poscill) + poscill / 2;
  plats.push({baseX, x: baseX, y, w: pwidth, h: pheight, phase: Math.random() * Math.PI * 2});
}

// Player
const player = {size: 30, x: 0, y: 0, vx: 0, vy: 0, jumping: false, angle: 0, onPlatform: null};
player.x = plats[0].x + (pwidth - player.size) / 2;
player.y = plats[0].y - player.size;
player.onPlatform = plats[0];












let frame = 0;
const oscillationSpeed = 0.02;

// Game loop
function loop() {
frame++;
ctx.clearRect(0, 0, W, H);
// Move platforms down and oscillate
plats.forEach(p => {
  p.y += pspeed;
  const prevX = p.x;
  p.x = p.baseX + Math.sin(frame * oscillationSpeed + p.phase) * poscill / 2;
  if (player.onPlatform === p && !player.jumping) player.x += p.x - prevX;
  if (p.y > H) {
    p.y = -pheight;
    p.baseX = Math.random() * (W - pwidth - poscill) + poscill / 2;
    p.phase = Math.random() * Math.PI * 2;
  }
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  const radius = 8;
  ctx.beginPath();
  ctx.moveTo(p.x + radius, p.y);
  ctx.lineTo(p.x + p.w - radius, p.y);
  ctx.quadraticCurveTo(p.x + p.w, p.y, p.x + p.w, p.y + radius);
  ctx.lineTo(p.x + p.w, p.y + p.h - radius);
  ctx.quadraticCurveTo(p.x + p.w, p.y + p.h, p.x + p.w - radius, p.y + p.h);
  ctx.lineTo(p.x + radius, p.y + p.h);
  ctx.quadraticCurveTo(p.x, p.y + p.h, p.x, p.y + p.h - radius);
  ctx.lineTo(p.x, p.y + radius);
  ctx.quadraticCurveTo(p.x, p.y, p.x + radius, p.y);
  ctx.fill();
});

// Player physics
if (player.jumping) {
  player.vy += gravity;
  player.y += player.vy;
  player.x += player.vx;
  player.angle += player.vx * 0.05;
  let landed = false;
  plats.forEach(p => {
    if (player.vy > 0 &&
      player.x + player.size > p.x &&
      player.x < p.x + p.w &&
      player.y + player.size > p.y &&
      player.y + player.size < p.y + player.vy + 1) {
      player.vy = 0;
      player.jumping = false;
      player.y = p.y - player.size;
      player.angle = 0;
      if (player.onPlatform !== p) {
        score += 1;
      }
      player.onPlatform = p;
      landed = true;
    }
  });
  if (!landed) player.onPlatform = null;
} else {
  player.y += pspeed;
}
if (player.y > H) {
  fall();
  score -= 5;
  const middle = Math.floor(plats.length / 2);
  const p = plats[middle];
  player.x = p.x + (pwidth - player.size) / 2;
  player.y = p.y - player.size;
  player.vx = 0;
  player.vy = 0;
  player.jumping = false;
  player.angle = 0;
  player.onPlatform = p;
}
cat(player.x, player.y, player.size, player.angle);
ctx.fillStyle = 'black';
ctx.font = '24px Arial';
ctx.fillText(`Score: ${score}`, 20, 40);
requestAnimationFrame(loop);
}//loop











function fall() {
let f = function (i) {
  let n = 5e4;
  if (i > n) return null;
  return ((Math.pow(i, 0.9) & 200) ? 1 : -1) * Math.pow(t(i, n), 3);
}
let t = (i, n) => (n - i) / n;
let A = new AudioContext();
let m = A.createBuffer(1, 96e3, 48e3);
let b = m.getChannelData(0);
for (let i = 96e3; i--;) b[i] = f(i);
let s = A.createBufferSource();
s.buffer = m;
s.connect(A.destination);
s.start();
}

function jump() {
let f = function (i) {
  let n = 1e4;
  if (i > n) return null;
  return ((Math.pow(i, 1.055) & 128) ? 1 : -1) * Math.pow(t(i, n), 2);
}
let t = (i, n) => (n - i) / n;
let A = new AudioContext();
let m = A.createBuffer(1, 96e3, 48e3);
let b = m.getChannelData(0);
for (let i = 96e3; i--;) b[i] = f(i);
let s = A.createBufferSource();
s.buffer = m;
s.connect(A.destination);
s.start();
}

function clouds(canvas) {
let layers = [];
let c = canvas.getContext("2d");
let w = window.innerWidth;
let h = window.innerHeight;
canvas.width = w;
canvas.height = h;
layers = [];
let b = [];
for (let i = 0; i < 6; i++) {
  let layer = document.createElement("canvas");
  layer.width = w;
  layer.height = h;
  let s = layer.getContext("2d");
  let Z = document.createElement("canvas");
  Z.width = Z.height = 60;
  let z = Z.getContext("2d");
  for (let j = 1e4; j--;) b[j] = Math.random();
  let g = 0.2 + Math.random() * 0.8;
  let e = 5 + 40 * Math.random();
  let hsl1 = `hsl(${200 + 80 * Math.random()},100%,${e + 20 * Math.random()}%)`;
  let hsl2 = `hsl(${200 + 180 * Math.random()},100%,${e + 20 * Math.random()}%)`;
  let grad = z.createLinearGradient(0, 0, 0, 60);
  grad.addColorStop(0, hsl1);
  grad.addColorStop(1, hsl2);
  z.fillStyle = grad;
  for (let f = 300; f--;) for (let x = 30; f / 9 < x--;) z.fillRect(
    30 + x * Math.cos(f) * Math.cos(f * Math.sin(f)),
    30 + x * Math.sin(f),
    0.9, 0.9
  );
  for (let f = 1e4; f--;) {
    s.globalAlpha = g * b[i] * (1 - f / 1e4);
    s.drawImage(
      Z,
      30 * Math.random() * h / b[i] - 20 * h / 2,
      f / 1e4 * h,
      h / 2 + Math.random() * h / 2 * (1 - f / 1e4),
      Math.random() * h / 8 * (1 - f / 1e4)
    );
  }
  let overlay = s.createLinearGradient(0, 0, 0, h);
  overlay.addColorStop(0, 'rgba(255,255,255,0.1)');
  overlay.addColorStop(1, 'rgba(255,255,255,0)');
  s.fillStyle = overlay;
  s.fillRect(0, 0, w, h);
  layers.push(layer);
}
for (let i = 0; i < layers.length; i++) c.drawImage(layers[i], 0, 0);
}//clouds

function cat(x, y, size, angle) {
const radius = size / 2;
ctx.save();
ctx.globalAlpha = 0.7;
ctx.translate(x + radius, y + radius);
ctx.rotate(angle);
const grad = ctx.createRadialGradient(0, 0, radius * 0.1, 0, 0, radius);
grad.addColorStop(0, 'black');
grad.addColorStop(1, 'rgb(0,0,0,0.5)');
ctx.fillStyle = grad;
ctx.beginPath();
ctx.arc(0, 0, radius, 0, 2 * Math.PI);
ctx.fill();
// Slanted cat eyes
const eyeOffsetX = radius * 0.4;
const eyeOffsetY = -radius * 0.2;
const eyeWidth = radius * 0.1;
const eyeHeight = radius * 0.3;
ctx.fillStyle = 'lime';
// Left eye
ctx.save();
ctx.translate(-eyeOffsetX, eyeOffsetY);
ctx.rotate(-Math.PI / 3); // slant
ctx.beginPath();
ctx.ellipse(0, 0, eyeWidth, eyeHeight, 0, 0, 2 * Math.PI);
ctx.fill();
ctx.restore();
// Right eye
ctx.save();
ctx.translate(eyeOffsetX, eyeOffsetY);
ctx.rotate(Math.PI / 3); // slant
ctx.beginPath();
ctx.ellipse(0, 0, eyeWidth, eyeHeight, 0, 0, 2 * Math.PI);
ctx.fill();
ctx.restore();
ctx.restore();
}

canvas.addEventListener('click', e => {
if (player.jumping) return;
jump();
const clickX = e.offsetX;
let dx = clickX - canvas.width / 2;
dx = Math.max(-100, Math.min(100, dx));
player.vx = dx * 0.05;
player.vy = jumpStrength;
player.jumping = true;
player.onPlatform = null;
});










loop();

}
