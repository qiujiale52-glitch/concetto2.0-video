import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import sharp from './thumbs/node_modules/sharp/dist/index.mjs';

const cwd = process.cwd();
const outDir = path.join(cwd, '06_预览输出', 'opening_v04_20_bolder_shockwave_frames');
const logoPath = path.join(cwd, 'CC 2.0宣发', 'Resources', 'local', '55236418f421c2af2407d375a52098a3.png');
const ffmpeg = path.join(cwd, '.tools/media-bin/node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg');
const output = path.join(cwd, '开头', 'Concetto_2.0_开头登场视觉_v04_2点0震荡波_9s.mp4');

fs.mkdirSync(outDir, { recursive: true });

const logoBase64 = fs.readFileSync(logoPath).toString('base64');
const W = 1920;
const H = 1080;
const fps = 60;
const duration = 9;
const frames = fps * duration;
const frameConcurrency = Math.max(1, Number.parseInt(process.env.FRAME_CONCURRENCY || '6', 10) || 6);

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
  // Layered exit: the spatial light recedes first, followed by the logo and
  // 2.0, then a short clean black hold. This avoids a hard last-frame cut.
  const ambientExit = 1 - smoothstep(6.95, 8.72, t);
  const logoExit = 1 - smoothstep(7.12, 8.42, t);
  const twoExit = 1 - smoothstep(7.38, 8.66, t);
  const lineExit = 1 - smoothstep(6.82, 8.48, t);
  const particleExit = 1 - smoothstep(7.05, 8.62, t);
  const ambient = (0.12 + 0.28 * smoothstep(0.8, 5.0, t)) * ambientExit;
  const lineP = smoothstep(1.15, 4.45, t);
  const lineFade = smoothstep(1.0, 1.8, t) * lineExit;
  const logoA = smoothstep(3.35, 5.05, t) * logoExit;
  const logoY = 480 - 22 * easeOutCubic((t - 3.35) / 1.9);
  const hit = Math.exp(-Math.pow((t - 4.75) / 0.22, 2));
  const logoGlow = Math.min(0.75, logoA * 0.36 + hit * 0.45);
  const twoA = smoothstep(5.0, 6.1, t) * twoExit;
  const twoHit = Math.exp(-Math.pow((t - 6.22) / 0.18, 2));
  const twoAfterPulse = Math.exp(-Math.pow((t - 6.58) / 0.28, 2));
  const twoScale = 0.90 + 0.12 * smoothstep(5.0, 6.0, t) + 0.135 * twoHit + 0.040 * twoAfterPulse;
  const twoGlow = Math.min(0.72, 0.28 * twoA + 0.52 * twoHit + 0.25 * twoAfterPulse);
  const leftEnd = 960 - 760 * lineP;
  const rightEnd = 960 + 760 * lineP;
  const centerPulse = (0.18 + hit * 0.65) * lineExit;
  const finalBlack = smoothstep(8.42, 8.78, t);
  const scanX = -260 + (W + 520) * smoothstep(1.7, 5.9, t);

  const particleSvg = particles.map((p, i) => {
    const twinkle = 0.12 + 0.35 * Math.sin(t * 1.4 + p.phase * 6.28);
    const drift = Math.sin(t * 0.28 + i) * 12;
    const op = clamp((twinkle + 0.16) * smoothstep(1.8, 5.2, t) * particleExit, 0, 0.28);
    return `<circle cx="${(p.x + drift).toFixed(1)}" cy="${p.y.toFixed(1)}" r="${p.r.toFixed(2)}" fill="#bdb4ff" opacity="${op.toFixed(3)}"/>`;
  }).join('\n');

  function twoWave(start, dur, maxScale, maxOpacity, blur, strokeBase) {
    const p = clamp((t - start) / dur);
    if (t < start || t > start + dur) return '';
    const rise = smoothstep(0.0, 0.12, p);
    const fall = Math.pow(1 - p, 1.45);
    const a = maxOpacity * rise * fall;
    const scale = 1 + maxScale * easeOutCubic(p);
    const sw = strokeBase + 8.5 * p;
    const yShift = 634 - 5 * p;
    return `<g opacity="${a.toFixed(3)}" filter="url(#blur${blur})" transform="translate(960 620) scale(${scale.toFixed(4)}) translate(-960 -620)">
      <text x="960" y="${yShift.toFixed(1)}" text-anchor="middle" font-family="Avenir Next, Helvetica Neue, Arial, sans-serif" font-size="92" font-weight="700" fill="none" stroke="#dcd7ff" stroke-width="${sw.toFixed(2)}" stroke-linejoin="round" letter-spacing="8">2.0</text>
    </g>`;
  }

  const twoShockwaves = [
    twoWave(6.08, 1.20, 0.50, 0.72, 6, 1.5),
    twoWave(6.25, 1.14, 0.74, 0.46, 6, 1.2),
    twoWave(6.48, 1.05, 1.02, 0.30, 24, 1.0),
  ].join('\n');

  const shockLineA = clamp(0.55 * Math.exp(-Math.pow((t - 6.24) / 0.25, 2)) + 0.28 * Math.exp(-Math.pow((t - 6.58) / 0.34, 2)), 0, 0.8);

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
  <g opacity="${shockLineA.toFixed(3)}" filter="url(#blur24)">
    <ellipse cx="960" cy="616" rx="${(140 + 620 * shockLineA).toFixed(1)}" ry="${(3 + 10 * shockLineA).toFixed(1)}" fill="#bcb4ff" opacity="${(0.18 + 0.22 * shockLineA).toFixed(3)}"/>
    <rect x="${(960 - 850 * shockLineA).toFixed(1)}" y="616" width="${(1700 * shockLineA).toFixed(1)}" height="1.8" fill="#d9d4ff" opacity="0.42"/>
  </g>
  ${twoShockwaves}
  <g transform="translate(960 634) scale(${twoScale.toFixed(4)}) translate(-960 -634)">
    <text x="960" y="634" text-anchor="middle" font-family="Avenir Next, Helvetica Neue, Arial, sans-serif" font-size="92" font-weight="700" fill="#d8d2ff" opacity="${twoA.toFixed(3)}" letter-spacing="8" filter="url(#softShadow)">2.0</text>
    <text x="960" y="634" text-anchor="middle" font-family="Avenir Next, Helvetica Neue, Arial, sans-serif" font-size="92" font-weight="700" fill="#ffffff" opacity="${(0.18 * twoGlow).toFixed(3)}" letter-spacing="8">2.0</text>
  </g>
  <rect width="${W}" height="${H}" fill="none" stroke="#ffffff" stroke-opacity="${(0.035 * smoothstep(3.5, 5.5, t) * ambientExit).toFixed(3)}"/>
  <rect width="${W}" height="${H}" fill="#010104" opacity="${finalBlack.toFixed(3)}"/>
</svg>`;
}

let nextFrame = 0;
async function frameWorker() {
  while (true) {
    const i = nextFrame++;
    if (i >= frames) return;
    const t = i / fps;
    const svg = Buffer.from(makeSvg(t));
    const out = path.join(outDir, `frame_${String(i).padStart(4, '0')}.png`);
    await sharp(svg).png().toFile(out);
    if ((i + 1) % 60 === 0) console.log(`opening frames ${i + 1}/${frames}`);
  }
}

await Promise.all(Array.from({ length: Math.min(frameConcurrency, frames) }, () => frameWorker()));

const encoded = spawnSync(ffmpeg, [
  '-y', '-framerate', String(fps), '-start_number', '0',
  '-i', path.join(outDir, 'frame_%04d.png'),
  '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '10',
  '-pix_fmt', 'yuv420p', '-r', String(fps), '-movflags', '+faststart', output,
], { stdio: 'inherit' });
if (encoded.status !== 0) throw new Error(`opening encode failed: ${encoded.status}`);

console.log(output);
