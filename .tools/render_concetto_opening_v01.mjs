import fs from 'fs';
import path from 'path';
import sharp from './thumbs/node_modules/sharp/dist/index.mjs';

const cwd = process.cwd();
const outDir = path.join(cwd, '06_预览输出', 'opening_v01_frames');
const logoPath = path.join(cwd, 'CC 2.0宣发', 'Resources', 'local', '55236418f421c2af2407d375a52098a3.png');

fs.mkdirSync(outDir, { recursive: true });

const logoBase64 = fs.readFileSync(logoPath).toString('base64');
const W = 1920;
const H = 1080;
const fps = 30;
const duration = 9;
const frames = fps * duration;

function clamp(v, a = 0, b = 1) {
  return Math.max(a, Math.min(b, v));
}

function smoothstep(a, b, x) {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
}

function easeOutCubic(x) {
  const t = clamp(x);
  return 1 - Math.pow(1 - t, 3);
}

function particle(seed) {
  const x = (Math.sin(seed * 12.9898) * 43758.5453) % 1;
  const y = (Math.sin(seed * 78.233) * 18317.1329) % 1;
  return {
    x: Math.abs(x) * W,
    y: Math.abs(y) * H,
    r: 0.7 + Math.abs(Math.sin(seed * 9.1)) * 1.8,
    phase: Math.abs(Math.sin(seed * 3.7)),
  };
}

const particles = Array.from({ length: 120 }, (_, i) => particle(i + 1));

function makeSvg(t) {
  const ambient = 0.12 + 0.28 * smoothstep(0.8, 5.0, t);
  const lineP = smoothstep(1.15, 4.45, t);
  const lineFade = smoothstep(1.0, 1.8, t) * (1 - 0.55 * smoothstep(6.0, 8.4, t));
  const logoA = smoothstep(3.35, 5.05, t);
  const logoY = 480 - 22 * easeOutCubic((t - 3.35) / 1.9);
  const hit = Math.exp(-Math.pow((t - 4.75) / 0.22, 2));
  const logoGlow = Math.min(0.75, logoA * 0.36 + hit * 0.45);
  const twoA = smoothstep(5.0, 6.1, t);
  const claimA = smoothstep(6.05, 7.05, t);
  const leftEnd = 960 - 760 * lineP;
  const rightEnd = 960 + 760 * lineP;
  const centerPulse = 0.18 + hit * 0.65;
  const scanX = -260 + (W + 520) * smoothstep(1.7, 5.9, t);

  const particleSvg = particles.map((p, i) => {
    const twinkle = 0.12 + 0.35 * Math.sin(t * 1.4 + p.phase * 6.28);
    const drift = Math.sin(t * 0.28 + i) * 12;
    const op = clamp((twinkle + 0.16) * smoothstep(1.8, 5.2, t) * (1 - smoothstep(7.5, 9, t)), 0, 0.28);
    return `<circle cx="${(p.x + drift).toFixed(1)}" cy="${p.y.toFixed(1)}" r="${p.r.toFixed(2)}" fill="#bdb4ff" opacity="${op.toFixed(3)}"/>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="core" cx="50%" cy="49%" r="42%">
      <stop offset="0%" stop-color="#8c72ff" stop-opacity="${(0.22 * ambient + 0.20 * hit).toFixed(3)}"/>
      <stop offset="33%" stop-color="#2a1958" stop-opacity="${(0.18 * ambient).toFixed(3)}"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="floor" cx="50%" cy="77%" r="52%">
      <stop offset="0%" stop-color="#2d2760" stop-opacity="${(0.18 * ambient).toFixed(3)}"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="42%" stop-color="#8a72ff" stop-opacity="${(0.60 * lineFade).toFixed(3)}"/>
      <stop offset="50%" stop-color="#ffffff" stop-opacity="${(0.95 * lineFade).toFixed(3)}"/>
      <stop offset="58%" stop-color="#8a72ff" stop-opacity="${(0.60 * lineFade).toFixed(3)}"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="scanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="50%" stop-color="#cfc8ff" stop-opacity="${(0.30 * lineFade).toFixed(3)}"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <filter id="blur24"><feGaussianBlur stdDeviation="24"/></filter>
    <filter id="blur6"><feGaussianBlur stdDeviation="6"/></filter>
    <filter id="softShadow" x="-60%" y="-60%" width="220%" height="220%">
      <feDropShadow dx="0" dy="0" stdDeviation="18" flood-color="#7d6cff" flood-opacity="${logoGlow.toFixed(3)}"/>
    </filter>
  </defs>
  <rect width="${W}" height="${H}" fill="#010104"/>
  <rect width="${W}" height="${H}" fill="url(#core)"/>
  <rect width="${W}" height="${H}" fill="url(#floor)"/>
  <g filter="url(#blur24)" opacity="${(0.65 * lineFade).toFixed(3)}">
    <rect x="${leftEnd.toFixed(1)}" y="515" width="${(rightEnd - leftEnd).toFixed(1)}" height="2.5" fill="url(#lineGrad)"/>
    <rect x="${(scanX).toFixed(1)}" y="430" width="520" height="220" fill="url(#scanGrad)" transform="skewX(-18)"/>
  </g>
  <g opacity="${lineFade.toFixed(3)}">
    <rect x="${leftEnd.toFixed(1)}" y="516" width="${(rightEnd - leftEnd).toFixed(1)}" height="1.2" fill="url(#lineGrad)"/>
    <path d="M ${Math.max(240, leftEnd).toFixed(1)} 547 C 660 522, 1260 522, ${Math.min(1680, rightEnd).toFixed(1)} 547" fill="none" stroke="#8f7aff" stroke-width="1" opacity="${(0.22 * lineFade).toFixed(3)}"/>
  </g>
  <ellipse cx="960" cy="518" rx="${(80 + hit * 470).toFixed(1)}" ry="${(1.5 + hit * 6).toFixed(1)}" fill="#ffffff" opacity="${centerPulse.toFixed(3)}" filter="url(#blur6)"/>
  <g>${particleSvg}</g>
  <image href="data:image/png;base64,${logoBase64}" x="580" y="${(logoY - 8).toFixed(1)}" width="760" opacity="${logoGlow.toFixed(3)}" filter="url(#blur24)"/>
  <image href="data:image/png;base64,${logoBase64}" x="580" y="${logoY.toFixed(1)}" width="760" opacity="${logoA.toFixed(3)}" filter="url(#softShadow)"/>
  <text x="960" y="620" text-anchor="middle" font-family="Avenir Next, Helvetica Neue, Arial, sans-serif" font-size="72" font-weight="500" fill="#d8d2ff" opacity="${twoA.toFixed(3)}" letter-spacing="8">2.0</text>
  <text x="960" y="704" text-anchor="middle" font-family="PingFang SC, Hiragino Sans GB, Noto Sans CJK SC, sans-serif" font-size="34" font-weight="500" fill="#e9e7ff" opacity="${claimA.toFixed(3)}" letter-spacing="2">AI 重塑建筑方案设计师的完整旅程</text>
  <text x="960" y="755" text-anchor="middle" font-family="Avenir Next, Helvetica Neue, Arial, sans-serif" font-size="18" font-weight="400" fill="#9b91d8" opacity="${(0.72 * claimA).toFixed(3)}" letter-spacing="7">FROM ANALYSIS TO DESIGN</text>
  <rect width="${W}" height="${H}" fill="none" stroke="#ffffff" stroke-opacity="${(0.035 * smoothstep(3.5, 5.5, t)).toFixed(3)}"/>
</svg>`;
}

for (let i = 0; i < frames; i++) {
  const t = i / fps;
  const svg = Buffer.from(makeSvg(t));
  const out = path.join(outDir, `frame_${String(i).padStart(4, '0')}.png`);
  await sharp(svg).png().toFile(out);
}

console.log(outDir);
