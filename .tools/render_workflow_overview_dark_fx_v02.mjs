import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import sharp from './thumbs/node_modules/sharp/dist/index.mjs';

const cwd = process.cwd();
const ffmpeg = path.join(cwd, '.tools/media-bin/node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg');
const sourcePng = path.join(cwd, '九大环节最新版', '黑场版静态提案', '九大环节总览_黑场微光_v01.png');
const sourceSvg = path.join(cwd, '九大环节最新版', '黑场版静态提案', '九大环节总览_黑场微光_v01.svg');
const outDir = path.join(cwd, '06_预览输出', 'workflow_overview_dark_fx_v01');
const frameDir = path.join(outDir, 'frames');
const output = path.join(cwd, '06_预览输出', 'Concetto_2.0_九大环节黑场浮现流光_按钮波纹_v02_低清预览.mp4');

// Version 02 adds the final CTA pointer press and local concentric ripple response.
// Preview is intentionally light. The SVG remains authored in the 2048 × 1152
// design coordinate system, so the same motion can later render at 2560p/60fps.
const VIEW_W = 2048;
const VIEW_H = 1152;
const OUT_W = 1280;
const OUT_H = 720;
const FPS = 30;
const DUR = 9.2;

fs.mkdirSync(outDir, { recursive: true });
fs.rmSync(frameDir, { recursive: true, force: true });
fs.mkdirSync(frameDir, { recursive: true });

for (const p of [ffmpeg, sourcePng, sourceSvg]) {
  if (!fs.existsSync(p)) throw new Error(`missing file: ${p}`);
}

function clamp(v, a = 0, b = 1) { return Math.max(a, Math.min(b, v)); }
function smooth(a, b, x) {
  const t = clamp((x - a) / Math.max(1e-6, b - a));
  return t * t * (3 - 2 * t);
}
function easeOut(t) { t = clamp(t); return 1 - Math.pow(1 - t, 3); }
function easeInOut(t) {
  t = clamp(t);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
function dataUri(file) {
  return `data:image/png;base64,${fs.readFileSync(file).toString('base64')}`;
}

function parseGeometry() {
  const text = fs.readFileSync(sourceSvg, 'utf8');
  const nodes = [];
  const cards = [];
  let m;
  const nodeRe = /<circle cx="([0-9.]+)" cy="([0-9.]+)" r="65"/g;
  while ((m = nodeRe.exec(text))) nodes.push({ x: +m[1], y: +m[2] });
  const cardRe = /<rect x="([0-9.]+)" y="([0-9.]+)" width="180" height="226" rx="34"/g;
  while ((m = cardRe.exec(text))) cards.push({ x: +m[1], y: +m[2], w: 180, h: 226 });
  if (nodes.length !== 9 || cards.length !== 9) {
    throw new Error(`geometry parse failed: nodes=${nodes.length}, cards=${cards.length}`);
  }
  return { nodes, cards };
}

const { nodes, cards } = parseGeometry();
const imageUri = dataUri(sourcePng);

// Exact eight Bézier sections used to draw the connection in the new black artwork.
const curves = [
  { p0:{x:208,y:352}, p1:{x:300,y:352}, p2:{x:306,y:670}, p3:{x:398,y:670} },
  { p0:{x:398,y:670}, p1:{x:492,y:670}, p2:{x:522,y:385}, p3:{x:616,y:385} },
  { p0:{x:616,y:385}, p1:{x:708,y:385}, p2:{x:695,y:670}, p3:{x:787,y:670} },
  { p0:{x:787,y:670}, p1:{x:882,y:670}, p2:{x:905,y:385}, p3:{x:1000,y:385} },
  { p0:{x:1000,y:385}, p1:{x:1094,y:385}, p2:{x:1125,y:670}, p3:{x:1219,y:670} },
  { p0:{x:1219,y:670}, p1:{x:1312,y:670}, p2:{x:1317,y:385}, p3:{x:1410,y:385} },
  { p0:{x:1410,y:385}, p1:{x:1500,y:385}, p2:{x:1498,y:670}, p3:{x:1588,y:670} },
  { p0:{x:1588,y:670}, p1:{x:1681,y:670}, p2:{x:1707,y:385}, p3:{x:1800,y:385} },
];

function pathD(c) {
  return `M ${c.p0.x} ${c.p0.y} C ${c.p1.x} ${c.p1.y}, ${c.p2.x} ${c.p2.y}, ${c.p3.x} ${c.p3.y}`;
}
function cubic(c, u) {
  const t = clamp(u), mt = 1 - t;
  return {
    x: mt ** 3 * c.p0.x + 3 * mt ** 2 * t * c.p1.x + 3 * mt * t ** 2 * c.p2.x + t ** 3 * c.p3.x,
    y: mt ** 3 * c.p0.y + 3 * mt ** 2 * t * c.p1.y + 3 * mt * t ** 2 * c.p2.y + t ** 3 * c.p3.y,
  };
}

function defs() {
  return `<defs>
    <clipPath id="clipTitle"><rect x="0" y="0" width="2048" height="268"/></clipPath>
    <clipPath id="clipBody"><rect x="0" y="260" width="2048" height="650"/></clipPath>
    <clipPath id="clipBanner"><rect x="0" y="900" width="2048" height="252"/></clipPath>
    <clipPath id="clipButton"><rect x="1252" y="950" width="366" height="70" rx="24"/></clipPath>
    <linearGradient id="ambient" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#160f3a" stop-opacity=".25"/>
      <stop offset=".5" stop-color="#04030c" stop-opacity=".05"/>
      <stop offset="1" stop-color="#332065" stop-opacity=".17"/>
    </linearGradient>
    <linearGradient id="headGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#7258ff" stop-opacity="0"/>
      <stop offset=".48" stop-color="#806bff" stop-opacity=".72"/>
      <stop offset=".78" stop-color="#b8a9ff" stop-opacity=".94"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="1"/>
    </linearGradient>
    <linearGradient id="trailGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#5940d8"/>
      <stop offset=".42" stop-color="#7863f5"/>
      <stop offset=".72" stop-color="#bdadff"/>
      <stop offset="1" stop-color="#77ddff"/>
    </linearGradient>
    <radialGradient id="nodeAura">
      <stop offset="0" stop-color="#ffffff" stop-opacity=".52"/>
      <stop offset=".22" stop-color="#b9acff" stop-opacity=".36"/>
      <stop offset=".55" stop-color="#775fff" stop-opacity=".16"/>
      <stop offset="1" stop-color="#6646ff" stop-opacity="0"/>
    </radialGradient>
    <filter id="blur8" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="8"/></filter>
    <filter id="softGlow" x="-80%" y="-80%" width="260%" height="260%">
      <feDropShadow dx="0" dy="0" stdDeviation="5" flood-color="#ffffff" flood-opacity=".56"/>
      <feDropShadow dx="0" dy="0" stdDeviation="15" flood-color="#8b73ff" flood-opacity=".62"/>
      <feDropShadow dx="0" dy="0" stdDeviation="30" flood-color="#5432c9" flood-opacity=".35"/>
    </filter>
    <filter id="headGlow" x="-120%" y="-120%" width="340%" height="340%">
      <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="#ffffff" flood-opacity=".95"/>
      <feDropShadow dx="0" dy="0" stdDeviation="10" flood-color="#a690ff" flood-opacity=".82"/>
      <feDropShadow dx="0" dy="0" stdDeviation="24" flood-color="#5bbdff" flood-opacity=".34"/>
    </filter>
  </defs>`;
}

function renderSvg(t) {
  const leave = 1 - smooth(DUR - 0.72, DUR, t);
  const bgA = smooth(0.00, 1.05, t) * leave;
  const titleA = smooth(0.28, 1.52, t) * leave;
  const bodyA = smooth(0.70, 2.08, t) * leave;
  const bannerA = smooth(1.04, 2.30, t) * leave;
  const crispTitle = smooth(0.72, 1.55, t);
  const crispBody = smooth(1.12, 2.15, t);
  const crispBanner = smooth(1.38, 2.28, t);

  const titleY = 15 * (1 - easeOut((t - .28) / 1.25));
  const bodyY = 20 * (1 - easeOut((t - .70) / 1.38));
  const bannerY = 14 * (1 - easeOut((t - 1.04) / 1.26));
  const titleBreath = 1 + 0.0018 * Math.sin(t * 1.75);
  const bodyBreath = 1 + 0.0013 * Math.sin(t * 1.36 + .8);
  const ambientPulse = .52 + .48 * Math.sin(t * 1.16 - .6);

  const segmentStart = 1.78;
  const segmentGap = 0.59;
  const segmentDur = 0.92;

  // Final CTA interaction: the pointer arrives after the ninth module settles,
  // presses the button locally, and releases two soft concentric ripples.
  const clickT = 7.38;
  const cursorA = smooth(6.42, 6.72, t) * (1 - smooth(8.18, 8.52, t)) * leave;
  const cursorMove = easeInOut((t - 6.48) / .76);
  const cursorX = 1772 + (1556 - 1772) * cursorMove;
  const cursorY = 1080 + (986 - 1080) * cursorMove;
  const press = smooth(clickT - .05, clickT + .055, t) * (1 - smooth(clickT + .15, clickT + .34, t));
  const clickFlash = smooth(clickT - .02, clickT + .07, t) * (1 - smooth(clickT + .12, clickT + .42, t));
  const rp1 = clamp((t - clickT) / 1.02);
  const rp2 = clamp((t - clickT - .16) / 1.20);
  const rp3 = clamp((t - clickT - .36) / 1.32);
  const ripple1A = rp1 > 0 ? (1 - smooth(.18, 1, rp1)) : 0;
  const ripple2A = rp2 > 0 ? (1 - smooth(.12, 1, rp2)) : 0;
  const ripple3A = rp3 > 0 ? (1 - smooth(.08, 1, rp3)) : 0;
  const buttonBreath = .5 + .5 * Math.sin(t * 2.2 + .4);

  const basePaths = curves.map((c, i) => {
    const flowOffset = -((t * 22 + i * 53) % 80);
    const pulse = .58 + .42 * Math.sin(t * 2.1 + i * .7);
    return `<path d="${pathD(c)}" pathLength="1000" fill="none" stroke="#7663eb" stroke-width="6" stroke-linecap="round" opacity="${(.032 + pulse * .018).toFixed(3)}" filter="url(#softGlow)"/>
      <path d="${pathD(c)}" pathLength="1000" fill="none" stroke="#8a78f7" stroke-width="1.8" stroke-linecap="round" opacity="${(.20 + pulse * .05).toFixed(3)}"/>
      <path d="${pathD(c)}" pathLength="1000" fill="none" stroke="#dcd5ff" stroke-width=".8" stroke-dasharray="4 14" stroke-dashoffset="${flowOffset}" stroke-linecap="round" opacity=".11"/>`;
  }).join('');

  const activePaths = curves.map((c, i) => {
    const raw = (t - (segmentStart + i * segmentGap)) / segmentDur;
    if (raw <= 0) return '';
    const local = easeInOut(raw);
    const drawn = Math.min(1000, local * 1000);
    const headLen = Math.min(155, drawn);
    const headStart = Math.max(0, drawn - headLen);
    const settled = raw >= 1;
    const flicker = .90 + .07 * Math.sin(t * 13 + i) + .03 * Math.sin(t * 29 + i * 2);
    const settledA = settled ? .38 : .96;
    return `<path d="${pathD(c)}" pathLength="1000" fill="none" stroke="#6f54ed" stroke-width="17" stroke-linecap="round" stroke-dasharray="${drawn.toFixed(1)} 1000" opacity="${(.12 * settledA).toFixed(3)}" filter="url(#softGlow)"/>
      <path d="${pathD(c)}" pathLength="1000" fill="none" stroke="url(#trailGrad)" stroke-width="3.7" stroke-linecap="round" stroke-dasharray="${drawn.toFixed(1)} 1000" opacity="${(.64 * settledA * flicker).toFixed(3)}" filter="url(#softGlow)"/>
      <path d="${pathD(c)}" pathLength="1000" fill="none" stroke="url(#headGrad)" stroke-width="7.2" stroke-linecap="round" stroke-dasharray="${headLen.toFixed(1)} 1000" stroke-dashoffset="${(-headStart).toFixed(1)}" opacity="${(settled ? .16 : .94).toFixed(3)}" filter="url(#headGlow)"/>`;
  }).join('');

  const headSparks = curves.map((c, i) => {
    const raw = (t - (segmentStart + i * segmentGap)) / segmentDur;
    if (raw <= 0 || raw >= 1.08) return '';
    const local = easeInOut(raw);
    const p = cubic(c, local);
    const r = 6.5 + 1.8 * Math.sin(t * 18 + i);
    return `<g filter="url(#headGlow)">
      <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="34" fill="#8c70ff" opacity=".14"/>
      <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${r.toFixed(1)}" fill="#fff" opacity=".94"/>
      <circle cx="${(p.x + 17 * Math.cos(t * 10 + i)).toFixed(1)}" cy="${(p.y + 13 * Math.sin(t * 8 + i)).toFixed(1)}" r="2" fill="#dff7ff" opacity=".70"/>
    </g>`;
  }).join('');

  const moduleGlows = nodes.map((n, i) => {
    const hitTime = segmentStart - .08 + i * segmentGap;
    const on = smooth(hitTime, hitTime + .35, t);
    if (on <= .001) return '';
    const impact = smooth(hitTime, hitTime + .16, t) * (1 - smooth(hitTime + .17, hitTime + .62, t));
    const idle = .5 + .5 * Math.sin(t * 2.55 + i * .86);
    const r = cards[i];
    const dashOffset = -(t * 54 + i * 47);
    return `<g opacity="${on.toFixed(3)}">
      <circle cx="${n.x}" cy="${n.y}" r="${(76 + impact * 36 + idle * 5).toFixed(1)}" fill="url(#nodeAura)" opacity="${(.22 + impact * .45 + idle * .05).toFixed(3)}"/>
      <circle cx="${n.x}" cy="${n.y}" r="${(54 + impact * 17).toFixed(1)}" fill="none" stroke="#fff" stroke-width="${(1.1 + impact * 1.7).toFixed(2)}" opacity="${(.10 + impact * .54 + idle * .05).toFixed(3)}" filter="url(#softGlow)"/>
      <circle cx="${n.x}" cy="${n.y}" r="${(66 + impact * 48).toFixed(1)}" fill="none" stroke="#9079ff" stroke-width="1.2" opacity="${(impact * .30).toFixed(3)}" filter="url(#softGlow)"/>
      <rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="34" fill="none" stroke="#a595ff" stroke-width="${(1.1 + impact * 1.2).toFixed(2)}" opacity="${(.18 + impact * .50 + idle * .06).toFixed(3)}" filter="url(#softGlow)"/>
      <rect x="${r.x - 7}" y="${r.y - 6}" width="${r.w + 14}" height="${r.h + 12}" rx="39" fill="none" stroke="#87deff" stroke-width="1.1" stroke-dasharray="82 580" stroke-dashoffset="${dashOffset.toFixed(1)}" opacity="${(.06 + impact * .36).toFixed(3)}" filter="url(#headGlow)"/>
    </g>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
  <svg width="${OUT_W}" height="${OUT_H}" viewBox="0 0 ${VIEW_W} ${VIEW_H}" xmlns="http://www.w3.org/2000/svg">
    ${defs()}
    <rect width="2048" height="1152" fill="#010106"/>
    <rect width="2048" height="1152" fill="url(#ambient)" opacity="${(.38 * bgA * (.82 + ambientPulse * .18)).toFixed(3)}"/>
    <path d="M-80 1070 C360 900 630 1120 1030 1002 C1400 892 1710 1045 2120 885" fill="none" stroke="#7760ee" stroke-width="2" opacity="${(.08 * bgA).toFixed(3)}" filter="url(#softGlow)"/>

    <g clip-path="url(#clipTitle)" transform="translate(1024 130) scale(${titleBreath.toFixed(5)}) translate(-1024 -130)">
      <image href="${imageUri}" width="2048" height="1152" transform="translate(0 ${titleY.toFixed(2)})" opacity="${(titleA * (1-crispTitle) * .58).toFixed(3)}" filter="url(#blur8)"/>
      <image href="${imageUri}" width="2048" height="1152" transform="translate(0 ${titleY.toFixed(2)})" opacity="${(titleA * crispTitle).toFixed(3)}"/>
    </g>
    <g clip-path="url(#clipBody)" transform="translate(1024 590) scale(${bodyBreath.toFixed(5)}) translate(-1024 -590)">
      <image href="${imageUri}" width="2048" height="1152" transform="translate(0 ${bodyY.toFixed(2)})" opacity="${(bodyA * (1-crispBody) * .62).toFixed(3)}" filter="url(#blur8)"/>
      <image href="${imageUri}" width="2048" height="1152" transform="translate(0 ${bodyY.toFixed(2)})" opacity="${(bodyA * crispBody).toFixed(3)}"/>
    </g>
    <g clip-path="url(#clipBanner)">
      <image href="${imageUri}" width="2048" height="1152" transform="translate(0 ${bannerY.toFixed(2)})" opacity="${(bannerA * (1-crispBanner) * .56).toFixed(3)}" filter="url(#blur8)"/>
      <image href="${imageUri}" width="2048" height="1152" transform="translate(0 ${bannerY.toFixed(2)})" opacity="${(bannerA * crispBanner).toFixed(3)}"/>
    </g>

    <g opacity="${bannerA.toFixed(3)}">
      <rect x="1258" y="956" width="354" height="58" rx="20" fill="none" stroke="#aa94ff" stroke-width="1.4"
        opacity="${(.08 + buttonBreath * .10 + clickFlash * .42).toFixed(3)}" filter="url(#softGlow)"/>
      <rect x="1252" y="950" width="366" height="70" rx="24" fill="#0e0a24" opacity="${(.94 * press).toFixed(3)}"/>
      <g clip-path="url(#clipButton)" transform="translate(1435 985) scale(${(1 - .018 * press).toFixed(4)}) translate(-1435 -985)" opacity="${press.toFixed(3)}">
        <image href="${imageUri}" width="2048" height="1152"/>
      </g>
      <rect x="1261" y="959" width="348" height="52" rx="18" fill="#d8ceff" opacity="${(.10 * press + .10 * clickFlash).toFixed(3)}" filter="url(#softGlow)"/>

      <g opacity="${cursorA.toFixed(3)}" transform="translate(${cursorX.toFixed(1)} ${cursorY.toFixed(1)}) rotate(-12) scale(${(1 - .10 * press).toFixed(3)})" filter="url(#headGlow)">
        <path d="M0 0 L2 36 L11 27 L20 46 L29 41 L20 23 L34 22 Z" fill="#ffffff" stroke="#6552c9" stroke-width="2" stroke-linejoin="round"/>
      </g>

      <g transform="translate(1556 986)" fill="none" filter="url(#softGlow)">
        <circle r="${(12 + 92 * easeOut(rp1)).toFixed(1)}" stroke="#ffffff" stroke-width="${(2.8 - 1.4 * rp1).toFixed(2)}" opacity="${(.62 * ripple1A).toFixed(3)}"/>
        <circle r="${(8 + 126 * easeOut(rp2)).toFixed(1)}" stroke="#a990ff" stroke-width="${(3.4 - 2.0 * rp2).toFixed(2)}" opacity="${(.43 * ripple2A).toFixed(3)}"/>
        <circle r="${(6 + 164 * easeOut(rp3)).toFixed(1)}" stroke="#6bc9ff" stroke-width="${(2.7 - 1.5 * rp3).toFixed(2)}" opacity="${(.22 * ripple3A).toFixed(3)}"/>
        <circle r="${(18 + 24 * clickFlash).toFixed(1)}" fill="#ffffff" stroke="none" opacity="${(.26 * clickFlash).toFixed(3)}"/>
      </g>
      <g opacity="${(.72 * clickFlash).toFixed(3)}" filter="url(#headGlow)">
        <circle cx="1528" cy="963" r="2.5" fill="#ffffff"/>
        <circle cx="1588" cy="968" r="2" fill="#d9d1ff"/>
        <circle cx="1596" cy="1008" r="2.2" fill="#83dfff"/>
        <circle cx="1524" cy="1010" r="1.8" fill="#a88cff"/>
      </g>
    </g>

    <g opacity="${bodyA.toFixed(3)}">
      ${basePaths}
      ${activePaths}
      ${moduleGlows}
      ${headSparks}
    </g>
  </svg>`;
}

function run(bin, args, label) {
  const r = spawnSync(bin, args, { stdio: 'inherit' });
  if (r.status !== 0) throw new Error(`${label} failed with status ${r.status}`);
}

async function main() {
  const frames = Math.round(DUR * FPS);
  for (let i = 0; i < frames; i++) {
    const svg = renderSvg(i / FPS);
    const file = path.join(frameDir, `frame_${String(i).padStart(4, '0')}.png`);
    await sharp(Buffer.from(svg), { density: 96 }).png({ compressionLevel: 3 }).toFile(file);
    if ((i + 1) % 60 === 0 || i + 1 === frames) console.log(`frames ${i + 1}/${frames}`);
  }
  run(ffmpeg, [
    '-y', '-framerate', String(FPS), '-i', path.join(frameDir, 'frame_%04d.png'),
    '-vf', `scale=${OUT_W}:${OUT_H}:flags=lanczos`,
    '-an', '-c:v', 'libx264', '-preset', 'fast', '-crf', '20', '-pix_fmt', 'yuv420p',
    '-r', String(FPS), '-movflags', '+faststart', output,
  ], 'encode preview');
  console.log(`DONE ${output}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
