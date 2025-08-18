onload = () => {
const style = document.createElement('style');
style.textContent=`
*{margin:0;padding:0;position:fixed;box-sizing:border-box;touch-action:none;user-select:none;} 
canvas {
  background: linear-gradient(to top, blue, skyblue);
}
body{
  background: black;
}
`;
document.head.appendChild(style);
const game = document.createElement('canvas');
let level = Object.assign(document.createElement('input'), {type:"range",value:10,min:1,max:30}); level.addEventListener("input",()=>pspeed=level.value/10);
document.body.append(game,level);
let maxDx,horizontalFactor,score,W,H,plats,player,frame,gravity,jumpstrength,oscillationspeed,pspace,pspeed,pwidth,pheight,poscill,playersize,catimage;
const canvas = game;
const ctx = canvas.getContext('2d');











canvas.addEventListener('click', e => {
    if (player.jumping) return;
    playSound("jump");
    const clickX = e.offsetX;
    let dx = clickX - W / 2;
    dx = Math.max(-maxDx, Math.min(maxDx, dx));
    player.vx = dx * horizontalFactor;
    player.vy = jumpstrength;
    player.jumping = true;
    player.onPlatform = null;
});











window.addEventListener('resize', resize);











function resize() {
score = 0;
frame = 0;

const ASPECT_RATIO = 9 / 16;
H = window.innerHeight;
W = H * ASPECT_RATIO;
if (W > window.innerWidth) {
  W = window.innerWidth;
  H = W / ASPECT_RATIO;
}

canvas.width = W;
canvas.height = H;
canvas.style.left = `${(window.innerWidth - W) / 2}px`;

const scale = H / 600;

// Scale game variables using scale factor
gravity = 0.5 * scale;              // gravity
jumpstrength = -12 * scale;         // jump power
pspace = 90 * scale;                // platform vertical spacing
pspeed = level.value / 10 * scale;  // platform speed
pwidth = 60 * scale;               // platform width
pheight = 10 * scale;               // platform height
poscill = 180 * scale;              // oscillation range
oscillationspeed = 0.02 / scale;    // oscillation speed (inverse scaling)
playersize = 20 * scale;            // player size
maxDx = 150 * scale;                // max horizontal movement
horizontalFactor = 0.05;            // can stay fixed
ctx.font = `${12 * scale}px monospace`; // scaled font size
// ctx.lineWidth = 2 * scale;          // scaled stroke width (optional)

// Platforms
plats = [];
for (let y = 0; y < H; y += pspace) {
  const baseX = Math.random() * (W - pwidth - poscill) + poscill / 2;
  plats.push({
    baseX,
    x: baseX,
    y,
    w: pwidth,
    h: pheight,
    phase: Math.random() * Math.PI * 2
  });
}

// Player
player = {
  size: playersize,
  x: plats[0].x + (pwidth - playersize) / 2,
  y: plats[0].y - playersize,
  vx: 0,
  vy: 0,
  jumping: false,
  angle: 0,
  onPlatform: plats[0]
};

catimage = makeCatImage(player.size);
}











resize();
loop();

function loop() {
frame+=(pspeed/5);
ctx.clearRect(0, 0, W, H);
// Move platforms down and oscillate
plats.forEach(p => {
  p.y += pspeed;
  const prevX = p.x;
  p.x = p.baseX + Math.sin(frame * oscillationspeed + p.phase) * poscill / 2;
  if (player.onPlatform === p && !player.jumping) player.x += p.x - prevX;
  if (p.y > H) {
    p.y = -pheight;
    p.baseX = Math.random() * (W - pwidth - poscill) + poscill / 2;
    p.phase = Math.random() * Math.PI * 2;
  }
  drawPlatform(ctx,p);
});
// Player physics
if (!player.jumping) {
  player.y += pspeed;
} else {
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
}
if (player.y > H) {
  playSound("fall");
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
drawCat(player.x, player.y, player.size, player.angle);
ctx.fillStyle = 'black';
ctx.fillText(`Score: ${score}`, 20, 40);
requestAnimationFrame(loop);
}//loop











function playSound(type) {
let t = (i, n) => (n - i) / n;
let f;
if (type === "fall") {
  f = function (i) {
    let n = 5e4;
    if (i > n) return null;
    return ((Math.pow(i, 0.9) & 200) ? 1 : -1) * Math.pow(t(i, n), 3);
  };
} else if (type === "jump") {
  f = function (i) {
    let n = 1e4;
    if (i > n) return null;
    return ((Math.pow(i, 1.055) & 128) ? 1 : -1) * Math.pow(t(i, n), 2);
  };
}
let A = new AudioContext();
let m = A.createBuffer(1, 96e3, 48e3);
let b = m.getChannelData(0);
for (let i = 96e3; i--;) b[i] = f(i);
let s = A.createBufferSource();
s.buffer = m;
s.connect(A.destination);
s.start();
}











function drawPlatform(ctx, p) {
ctx.save();
ctx.translate(p.x + p.w/2, p.y + p.h/2);
ctx.scale(p.w/2, p.h/2);
ctx.fillStyle = "rgba(255,255,255,0.3)";
ctx.beginPath();
ctx.arc(0, 0, 1, 0, Math.PI * 2);
ctx.closePath();
ctx.fill();
ctx.restore();
}











function drawCat(x, y, size, angle) {
  ctx.save();
  ctx.translate(x + size / 2, y + size / 2);
  ctx.rotate(angle);
  ctx.drawImage(catimage, -size / 2, -size / 2, size, size);
  ctx.restore();
}

function makeCatImage(size) {
  const off = document.createElement("canvas");
  off.width = off.height = size;
  const octx = off.getContext("2d");
  octx.save();
  octx.translate(size / 2, size / 2);
  octx.scale(size, size);
  octx.fillStyle = "rgb(0,0,0,0.7)"; octx.fill(shape([[0, -6, 3, -6, 6, -10, 10, -2, 10, 2, 7, 7, 4, 9, 0, 9]])); // Head
  octx.fillStyle = "rgb(0,255,0,0.9)"; octx.fill(shape([[2, 0, 3, -2, 5, -3, 5, -1, 2, 0]])); // Eyes
  octx.restore();
  return off;
}

function shape(array,gridsize=20,mirror=true){
let p=new Path2D;
for(let i of array){for(let x of mirror?[1,-1]:[1]){p.moveTo(x*i[0]/gridsize,i[1]/gridsize);
  for(let j=2;j<i.length;j+=2)p.lineTo(x*i[j]/gridsize,i[j+1]/gridsize);
}}
return p;
}











}
