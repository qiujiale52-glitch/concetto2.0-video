import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import sharp from './thumbs/node_modules/sharp/dist/index.mjs';

const cwd = process.cwd();
const ffmpeg = path.join(cwd, '.tools/media-bin/node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg');
const fontRegular = path.join(cwd, '.tools', 'unified_font', 'MiSans', 'otf', 'MiSans-Regular.otf');
const fontBold = path.join(cwd, '.tools', 'unified_font', 'MiSans', 'otf', 'MiSans-Bold.otf');
const previewMode = process.env.RENDER_MODE !== 'final';
const outDir = path.join(cwd, '06_预览输出', 'end_card_fx_v02');
const frameDir = path.join(outDir, 'frames');
const output = path.join(cwd, '06_预览输出', previewMode
  ? 'Concetto_2.0_结尾字形蚀刻多层光_v02_低清预览.mp4'
  : 'Concetto_2.0_结尾字形蚀刻多层光_v02_2560p60.mp4');

const W = 1920;
const H = 1080;
const OUT_W = previewMode ? 1280 : 2560;
const OUT_H = previewMode ? 720 : 1440;
const FPS = previewMode ? 30 : 60;
const DUR = 8.2;

for (const p of [ffmpeg, fontRegular, fontBold]) {
  if (!fs.existsSync(p)) throw new Error(`missing file: ${p}`);
}
fs.mkdirSync(outDir, { recursive: true });
fs.rmSync(frameDir, { recursive: true, force: true });
fs.mkdirSync(frameDir, { recursive: true });

const reg64 = fs.readFileSync(fontRegular).toString('base64');
const bold64 = fs.readFileSync(fontBold).toString('base64');

function clamp(v, a = 0, b = 1) { return Math.max(a, Math.min(b, v)); }
function smooth(a, b, x) {
  const t = clamp((x - a) / Math.max(1e-6, b - a));
  return t * t * (3 - 2 * t);
}
function easeOut(t) { t = clamp(t); return 1 - Math.pow(1 - t, 3); }
function easeInOut(t) {
  t = clamp(t);
  return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
function pulse(t, a, peak, b) { return smooth(a, peak, t) * (1 - smooth(peak, b, t)); }
function rand(i) {
  const x = Math.sin(i * 91.733 + 17.17) * 43758.5453;
  return x - Math.floor(x);
}

function defs() {
  return `<defs>
    <style>
      @font-face { font-family: MiSans; src: url(data:font/otf;base64,${reg64}); font-weight: 400; }
      @font-face { font-family: MiSans; src: url(data:font/otf;base64,${bold64}); font-weight: 700; }
      text { font-family: MiSans, sans-serif; }
    </style>
    <linearGradient id="bgCore" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#080515"/><stop offset=".48" stop-color="#010104"/><stop offset="1" stop-color="#0b061b"/>
    </linearGradient>
    <radialGradient id="centerMist" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#5436bd" stop-opacity=".24"/><stop offset=".5" stop-color="#2a176e" stop-opacity=".08"/><stop offset="1" stop-color="#130b36" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#6445d6" stop-opacity=".18"/><stop offset=".30" stop-color="#795dff" stop-opacity=".72"/>
      <stop offset=".55" stop-color="#c0afff" stop-opacity=".98"/><stop offset=".82" stop-color="#775bff" stop-opacity=".68"/>
      <stop offset="1" stop-color="#6445d6" stop-opacity=".20"/>
    </linearGradient>
    <filter id="blur7" x="-70%" y="-160%" width="240%" height="420%"><feGaussianBlur stdDeviation="7"/></filter>
    <filter id="blur16" x="-100%" y="-220%" width="300%" height="540%"><feGaussianBlur stdDeviation="16"/></filter>
    <filter id="glyphTight" x="-100%" y="-220%" width="300%" height="540%">
      <feDropShadow dx="0" dy="0" stdDeviation="1.6" flood-color="#ffffff" flood-opacity=".78"/>
      <feDropShadow dx="0" dy="0" stdDeviation="5" flood-color="#b8a5ff" flood-opacity=".72"/>
      <feDropShadow dx="0" dy="0" stdDeviation="13" flood-color="#7652ff" flood-opacity=".42"/>
    </filter>
    <filter id="glyphWide" x="-130%" y="-280%" width="360%" height="660%">
      <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#ffffff" flood-opacity=".24"/>
      <feDropShadow dx="0" dy="0" stdDeviation="14" flood-color="#9e84ff" flood-opacity=".54"/>
      <feDropShadow dx="0" dy="0" stdDeviation="32" flood-color="#4e2db4" flood-opacity=".34"/>
    </filter>
    <filter id="lineGlow" x="-20%" y="-500%" width="140%" height="1100%">
      <feDropShadow dx="0" dy="0" stdDeviation="2" flood-color="#ffffff" flood-opacity=".9"/>
      <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#9b82ff" flood-opacity=".72"/>
      <feDropShadow dx="0" dy="0" stdDeviation="18" flood-color="#6845e9" flood-opacity=".38"/>
    </filter>
  </defs>`;
}

function renderSvg(t) {
  const out = 1 - smooth(6.62, 8.08, t);
  const ambient = .5 + .5 * Math.sin(t * 1.03 - .7);

  // Brand title condenses first. The later impact is made only from copies of its glyph silhouette.
  const topA = smooth(.28, 1.38, t) * out;
  const topSharp = smooth(.70, 1.40, t);
  const topBaseScale = .972 + .028 * easeOut((t - .25) / 1.20);
  const topY = 12 * (1 - easeOut((t - .28) / 1.14));
  const titleImpact = pulse(t, 3.72, 3.98, 4.82);
  const titleAfter = smooth(3.80, 4.20, t) * (1 - smooth(5.40, 6.16, t));

  const titleEchoes = [
    { s: 1.010 + .016 * easeOut(titleImpact), sw: 1.2, a: .90, c: '#ffffff', f: 'glyphTight' },
    { s: 1.030 + .038 * easeOut(titleImpact), sw: 3.2, a: .48, c: '#c0aeff', f: 'glyphWide' },
    { s: 1.065 + .072 * easeOut(titleImpact), sw: 6.8, a: .20, c: '#7653ff', f: 'glyphWide' },
  ].map((e) => `<g transform="translate(960 445) scale(${e.s.toFixed(4)}) translate(-960 -445)" opacity="${(titleImpact * e.a * out).toFixed(3)}">
      <text x="960" y="468" text-anchor="middle" font-size="58" font-weight="700" letter-spacing="1.5" fill="none" stroke="${e.c}" stroke-width="${e.sw}" stroke-linejoin="round" filter="url(#${e.f})">CONCETTO 2.0</text>
    </g>`).join('');

  // Every middle glyph has its own outline etch, white core, fill, and purple residual glow.
  const midChars = [...'一站式智能工作流'];
  const midStep = 45;
  const midGlyphs = midChars.map((char, i) => {
    const start = 1.00 + i * .145;
    const reveal = smooth(start, start + .52, t) * out;
    const hit = pulse(t, start + .05, start + .27, start + .68) * out;
    const outline = smooth(start, start + .16, t) * (1 - smooth(start + .42, start + .78, t)) * out;
    const x = 960 + (i - (midChars.length - 1) / 2) * midStep;
    const y = 552 - 7 * (1 - easeOut((t - start) / .52));
    const dash = 92 - 66 * easeInOut((t - start) / .54);
    return `<g>
      <text x="${x}" y="${y.toFixed(1)}" text-anchor="middle" font-size="30" font-weight="400" fill="#5e4d91" opacity="${(.18 * reveal).toFixed(3)}">${char}</text>
      <text x="${x}" y="${y.toFixed(1)}" text-anchor="middle" font-size="30" font-weight="400" fill="none" stroke="#b7a3ff" stroke-width="1.15" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="20 11" stroke-dashoffset="${dash.toFixed(1)}" opacity="${(.88 * outline).toFixed(3)}" filter="url(#glyphTight)">${char}</text>
      <text x="${x}" y="${y.toFixed(1)}" text-anchor="middle" font-size="30" font-weight="400" fill="#ffffff" stroke="#f4efff" stroke-width=".7" opacity="${(.78 * hit).toFixed(3)}" filter="url(#glyphTight)">${char}</text>
      <text x="${x}" y="${y.toFixed(1)}" text-anchor="middle" font-size="30" font-weight="400" fill="#c1b6ef" opacity="${reveal.toFixed(3)}" filter="url(#glyphWide)">${char}</text>
      <text x="${x}" y="${y.toFixed(1)}" text-anchor="middle" font-size="30" font-weight="400" fill="#ded6ff" opacity="${(.34 * reveal + .30 * hit).toFixed(3)}">${char}</text>
    </g>`;
  }).join('');

  // A narrow core draws the divider. Only the line itself glows; no area sweep is used.
  const lineP = easeInOut((t - 1.78) / 1.48);
  const lineDraw = 600 * lineP;
  const lineHeadA = (lineP > .01 && lineP < .995 ? 1 : 0) * out;
  const headX = 660 + lineDraw;

  // Bottom statement: particles condense, followed by per-glyph outline and internal light.
  const bottomChars = [...'让设计回归真正的创意'];
  const bottomStep = 45;
  const particleCollapse = easeInOut((t - 2.08) / 1.48);
  const particles = Array.from({ length: 30 }, (_, i) => {
    const targetX = 750 + rand(i) * 420;
    const targetY = 697 + (rand(i + 100) - .5) * 28;
    const startX = targetX + (rand(i + 200) - .5) * 380;
    const startY = targetY + 65 + rand(i + 300) * 140;
    const p = clamp(particleCollapse + (rand(i + 400) - .5) * .18);
    const x = startX + (targetX - startX) * easeInOut(p);
    const y = startY + (targetY - startY) * easeOut(p);
    const a = smooth(2.10, 2.42, t) * (1 - smooth(3.46, 4.12, t)) * (.08 + .38 * (1 - p)) * out;
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(1 + rand(i + 500) * 2.1).toFixed(1)}" fill="${i % 3 === 0 ? '#ffffff' : '#9b83ff'}" opacity="${a.toFixed(3)}" filter="url(#glyphWide)"/>`;
  }).join('');
  const bottomGlyphs = bottomChars.map((char, i) => {
    const start = 2.30 + i * .075;
    const reveal = smooth(start, start + .78, t) * out;
    const hit = pulse(t, start + .08, start + .34, start + .86) * out;
    const x = 960 + (i - (bottomChars.length - 1) / 2) * bottomStep;
    const y = 704 + 17 * (1 - easeOut((t - start) / .74));
    return `<g>
      <text x="${x}" y="${y.toFixed(1)}" text-anchor="middle" font-size="38" font-weight="400" fill="none" stroke="#a98fff" stroke-width="1.0" opacity="${(.70 * reveal).toFixed(3)}" filter="url(#glyphWide)">${char}</text>
      <text x="${x}" y="${y.toFixed(1)}" text-anchor="middle" font-size="38" font-weight="400" fill="#ffffff" opacity="${(.62 * hit).toFixed(3)}" filter="url(#glyphTight)">${char}</text>
      <text x="${x}" y="${y.toFixed(1)}" text-anchor="middle" font-size="38" font-weight="400" fill="#eeeaff" opacity="${reveal.toFixed(3)}">${char}</text>
    </g>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
  <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    ${defs()}
    <rect width="1920" height="1080" fill="#010104"/>
    <rect width="1920" height="1080" fill="url(#bgCore)" opacity="${(.78 + .10 * ambient).toFixed(3)}"/>
    <ellipse cx="960" cy="548" rx="690" ry="345" fill="url(#centerMist)" opacity="${(.34 + .17 * ambient + .16 * titleImpact).toFixed(3)}"/>

    ${titleEchoes}
    <g transform="translate(960 445) scale(${(topBaseScale * (1 + .018 * titleImpact)).toFixed(5)}) translate(-960 -445) translate(0 ${topY.toFixed(1)})">
      <text x="960" y="468" text-anchor="middle" font-size="58" font-weight="700" letter-spacing="1.5" fill="#f7f5ff" opacity="${(topA * (1 - topSharp) * .55).toFixed(3)}" filter="url(#blur7)">CONCETTO 2.0</text>
      <text x="960" y="468" text-anchor="middle" font-size="58" font-weight="700" letter-spacing="1.5" fill="#f8f6ff" stroke="#ffffff" stroke-width="${(.25 + .85 * titleImpact).toFixed(2)}" opacity="${topA.toFixed(3)}" filter="url(#glyphTight)">CONCETTO 2.0</text>
      <text x="960" y="468" text-anchor="middle" font-size="58" font-weight="700" letter-spacing="1.5" fill="#ffffff" opacity="${(.16 * titleAfter + .36 * titleImpact).toFixed(3)}">CONCETTO 2.0</text>
    </g>

    ${midGlyphs}

    <rect x="660" y="617" width="${lineDraw.toFixed(1)}" height="4" rx="2" fill="#7558ef" opacity="${(.17 * out).toFixed(3)}" filter="url(#blur7)"/>
    <rect x="660" y="618" width="${lineDraw.toFixed(1)}" height="2" rx="1" fill="url(#lineGrad)" opacity="${(.94 * out).toFixed(3)}" filter="url(#lineGlow)"/>
    <g opacity="${lineHeadA.toFixed(3)}" filter="url(#lineGlow)">
      <rect x="${Math.max(660, headX - 30).toFixed(1)}" y="617.4" width="${Math.min(30, lineDraw).toFixed(1)}" height="3.2" rx="1.6" fill="#d9cfff"/>
      <circle cx="${headX.toFixed(1)}" cy="619" r="3.8" fill="#ffffff"/>
    </g>

    ${particles}
    ${bottomGlyphs}
  </svg>`;
}

function run(bin, args, label) {
  const r = spawnSync(bin, args, { stdio: 'inherit' });
  if (r.status !== 0) throw new Error(`${label} failed with status ${r.status}`);
}

async function main() {
  const total = Math.round(DUR * FPS);
  for (let i = 0; i < total; i++) {
    const svg = renderSvg(i / FPS);
    const file = path.join(frameDir, `frame_${String(i).padStart(4, '0')}.png`);
    await sharp(Buffer.from(svg)).resize(OUT_W, OUT_H).png({ compressionLevel: 3 }).toFile(file);
    if ((i + 1) % 60 === 0 || i + 1 === total) console.log(`frames ${i + 1}/${total}`);
  }
  run(ffmpeg, [
    '-y', '-framerate', String(FPS), '-i', path.join(frameDir, 'frame_%04d.png'),
    '-an', '-c:v', 'libx264', '-preset', previewMode ? 'fast' : 'medium', '-crf', previewMode ? '19' : '14', '-pix_fmt', 'yuv420p',
    '-r', String(FPS), '-movflags', '+faststart', output,
  ], previewMode ? 'encode end card v02 preview' : 'encode end card v02 2560p60');
  console.log(`DONE ${output}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
