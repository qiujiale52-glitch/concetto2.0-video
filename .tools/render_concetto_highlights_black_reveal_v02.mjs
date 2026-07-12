import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import sharp from './thumbs/node_modules/sharp/dist/index.mjs';

const cwd = process.cwd();
const ffmpeg = path.join(cwd, '.tools/media-bin/node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg');
const source = path.join(cwd, '亮点', '亮点黑底静态稿_v01.png');
const outDir = path.join(cwd, '06_预览输出', 'highlights_black_reveal_v02_parts');
const frameDir = path.join(outDir, 'frames');
const output = path.join(cwd, '06_预览输出', 'Concetto_2.0_升级亮点_柔光材质显形_v02_预览.mp4');

const W = 1920;
const H = 1080;
const FPS = 60;
const DUR = 9.4;

function assertFile(file) {
  if (!fs.existsSync(file)) throw new Error(`missing file: ${file}`);
}

function run(bin, args, label) {
  const result = spawnSync(bin, args, { stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`${label} failed with status ${result.status}`);
}

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function smooth(start, end, value) {
  const t = clamp((value - start) / (end - start));
  return t * t * (3 - 2 * t);
}

function easeOut(value) {
  const t = clamp(value);
  return 1 - Math.pow(1 - t, 3);
}

function roundedRectPath(rect, radius = 26) {
  const { x, y, w, h } = rect;
  const r = Math.min(radius, w / 2, h / 2);
  return [
    `M ${x + r} ${y}`,
    `H ${x + w - r}`,
    `Q ${x + w} ${y} ${x + w} ${y + r}`,
    `V ${y + h - r}`,
    `Q ${x + w} ${y + h} ${x + w - r} ${y + h}`,
    `H ${x + r}`,
    `Q ${x} ${y + h} ${x} ${y + h - r}`,
    `V ${y + r}`,
    `Q ${x} ${y} ${x + r} ${y}`,
    'Z',
  ].join(' ');
}

function dataUri(file) {
  return `data:image/png;base64,${fs.readFileSync(file).toString('base64')}`;
}

function defs() {
  return `<defs>
    <radialGradient id="ambient" cx="50%" cy="46%" r="72%">
      <stop offset="0%" stop-color="#171033" stop-opacity="0.36"/>
      <stop offset="48%" stop-color="#080612" stop-opacity="0.20"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="1"/>
    </radialGradient>
    <linearGradient id="titleSweep" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#6652ff" stop-opacity="0"/>
      <stop offset="42%" stop-color="#c3b7ff" stop-opacity="0.30"/>
      <stop offset="52%" stop-color="#ffffff" stop-opacity="0.92"/>
      <stop offset="62%" stop-color="#7de7ff" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#6652ff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="titleReveal" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.98"/>
      <stop offset="72%" stop-color="#ffffff" stop-opacity="0.94"/>
      <stop offset="90%" stop-color="#ffffff" stop-opacity="0.42"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="cardAura" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#9482ff" stop-opacity="0.30"/>
      <stop offset="42%" stop-color="#6652ff" stop-opacity="0.11"/>
      <stop offset="100%" stop-color="#24185f" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="caustic" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="46%" stop-color="#a9a0ff" stop-opacity="0.04"/>
      <stop offset="52%" stop-color="#ffffff" stop-opacity="0.20"/>
      <stop offset="58%" stop-color="#77ddff" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="edge" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6652ff" stop-opacity="0.18"/>
      <stop offset="38%" stop-color="#b8a8ff" stop-opacity="0.86"/>
      <stop offset="52%" stop-color="#ffffff" stop-opacity="1"/>
      <stop offset="70%" stop-color="#75dcff" stop-opacity="0.72"/>
      <stop offset="100%" stop-color="#6652ff" stop-opacity="0.14"/>
    </linearGradient>
    <linearGradient id="glass" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="48%" stop-color="#ffffff" stop-opacity="0.12"/>
      <stop offset="52%" stop-color="#ffffff" stop-opacity="0.36"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <filter id="glow" x="-80%" y="-80%" width="260%" height="260%">
      <feDropShadow dx="0" dy="0" stdDeviation="7" flood-color="#ffffff" flood-opacity="0.38"/>
      <feDropShadow dx="0" dy="0" stdDeviation="18" flood-color="#8070ff" flood-opacity="0.46"/>
      <feDropShadow dx="0" dy="0" stdDeviation="38" flood-color="#3929aa" flood-opacity="0.24"/>
    </filter>
    <filter id="softGlow" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="18"/>
    </filter>
    <filter id="pinGlow" x="-120%" y="-120%" width="340%" height="340%">
      <feDropShadow dx="0" dy="0" stdDeviation="2.5" flood-color="#ffffff" flood-opacity="0.94"/>
      <feDropShadow dx="0" dy="0" stdDeviation="10" flood-color="#8675ff" flood-opacity="0.74"/>
    </filter>
  </defs>`;
}

function sourceGeometry(meta) {
  const targetW = 1760;
  const targetH = targetW * meta.height / meta.width;
  return { x: (W - targetW) / 2, y: (H - targetH) / 2 + 2, w: targetW, h: targetH };
}

function mapRect(rect, geometry, meta) {
  const sx = geometry.w / meta.width;
  const sy = geometry.h / meta.height;
  return {
    x: geometry.x + rect.x * sx,
    y: geometry.y + rect.y * sy,
    w: rect.w * sx,
    h: rect.h * sy,
    iconX: geometry.x + rect.iconX * sx,
    iconY: geometry.y + rect.iconY * sy,
  };
}

function renderSvg(t, meta, uri) {
  const geometry = sourceGeometry(meta);
  const globalIn = smooth(0.02, 0.42, t);
  const globalOut = 1 - smooth(DUR - 0.55, DUR, t);
  const globalA = globalIn * globalOut;
  const titleA = smooth(0.34, 1.28, t) * globalOut;
  const titleWipe = easeOut((t - 0.30) / 1.82);
  const titleHold = smooth(1.42, 1.92, t) * globalOut;
  const titleSweepX = geometry.x - 520 + (geometry.w + 1040) * clamp((t - 0.12) / 2.42);
  const titlePulse = 0.5 + 0.5 * Math.sin(t * 2.1);
  const sparkleIn = smooth(1.48, 2.05, t) * globalOut;
  const titleMist = smooth(0.10, 0.78, t) * (1 - smooth(1.75, 2.55, t)) * globalOut;

  const sourceCards = [
    { x: 128, y: 258, w: 696, h: 294, iconX: 214, iconY: 338, start: 1.42 },
    { x: 842, y: 258, w: 694, h: 294, iconX: 934, iconY: 338, start: 1.58 },
    { x: 128, y: 566, w: 696, h: 308, iconX: 214, iconY: 648, start: 1.58 },
    { x: 842, y: 566, w: 694, h: 308, iconX: 934, iconY: 648, start: 1.42 },
  ];
  const cards = sourceCards.map((rect) => mapRect(rect, geometry, meta));

  const cardDefs = cards.map((r, i) => {
    const diagonal = Math.hypot(r.w, r.h);
    const reveal = easeOut((t - sourceCards[i].start) / 2.05);
    const radius = 10 + diagonal * 1.10 * reveal;
    const d = roundedRectPath(r, 28);
    return `<clipPath id="clip${i}"><path d="${d}"/></clipPath>
      <radialGradient id="reveal${i}" gradientUnits="userSpaceOnUse" cx="${r.iconX.toFixed(1)}" cy="${r.iconY.toFixed(1)}" r="${radius.toFixed(1)}">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="1"/>
        <stop offset="68%" stop-color="#ffffff" stop-opacity="${(0.96 * reveal).toFixed(3)}"/>
        <stop offset="88%" stop-color="#ffffff" stop-opacity="${(0.42 * reveal).toFixed(3)}"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
      </radialGradient>
      <mask id="mask${i}" maskUnits="userSpaceOnUse" x="${(r.x - 80).toFixed(1)}" y="${(r.y - 80).toFixed(1)}" width="${(r.w + 160).toFixed(1)}" height="${(r.h + 160).toFixed(1)}">
        <rect x="${(r.x - 80).toFixed(1)}" y="${(r.y - 80).toFixed(1)}" width="${(r.w + 160).toFixed(1)}" height="${(r.h + 160).toFixed(1)}" fill="#000000"/>
        <circle cx="${r.iconX.toFixed(1)}" cy="${r.iconY.toFixed(1)}" r="${radius.toFixed(1)}" fill="url(#reveal${i})"/>
      </mask>`;
  }).join('');

  const cardLayers = cards.map((r, i) => {
    const start = sourceCards[i].start;
    const reveal = easeOut((t - start) / 2.05);
    const alpha = smooth(start - 0.18, start + 0.34, t) * globalOut;
    const silhouette = smooth(start - 0.46, start + 0.06, t) * (1 - smooth(start + 1.65, start + 2.45, t)) * globalOut;
    const edgeDraw = easeOut((t - (start + 0.62)) / 1.82);
    const breath = 0.5 + 0.5 * Math.sin(t * 1.38 + i * 1.23);
    const finePulse = 0.5 + 0.5 * Math.sin(t * 3.15 + i * 1.52);
    const materialPulse = 0.5 + 0.5 * Math.sin(t * 0.84 + i * 1.18);
    const d = roundedRectPath(r, 28);
    const pathDraw = Math.round(1000 * edgeDraw);
    const orbit = ((t * 0.052 + i * 0.23) % 1) * 1000;
    const glassPhase = ((t * 0.058 + i * 0.17) % 1);
    const glassX = r.x - r.w * 0.46 + glassPhase * r.w * 1.72;
    const iconR = 42 + 10 * breath;
    const causticX = r.x - r.w * 0.74 + (((t * 0.034 + i * 0.21) % 1) * r.w * 2.20);
    const corners = [
      [r.x + 18, r.y + 18], [r.x + r.w - 18, r.y + 18],
      [r.x + r.w - 18, r.y + r.h - 18], [r.x + 18, r.y + r.h - 18],
    ].map(([x, y], j) => {
      const pulse = 0.5 + 0.5 * Math.sin(t * 3.4 + i * 1.2 + j * 1.55);
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(1.4 + 1.8 * pulse).toFixed(1)}" fill="#ffffff" opacity="${(0.12 + 0.36 * pulse * edgeDraw).toFixed(3)}" filter="url(#pinGlow)"/>`;
    }).join('');
    const sparks = [0, 1, 2, 3].map((_, j) => {
      const phase = t * (0.42 + j * 0.06) + i * 1.3 + j * 1.7;
      const x = r.x + r.w * (0.18 + 0.68 * (0.5 + 0.5 * Math.sin(phase)));
      const y = r.y + r.h * (0.20 + 0.60 * (0.5 + 0.5 * Math.cos(phase * 0.83)));
      const twinkle = Math.pow(0.5 + 0.5 * Math.sin(phase * 7.0), 3);
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(0.8 + 1.6 * twinkle).toFixed(1)}" fill="#ffffff" opacity="${(0.04 + 0.28 * twinkle * edgeDraw).toFixed(3)}" filter="url(#pinGlow)"/>`;
    }).join('');
    return `<g>
      <path d="${d}" fill="#17102e" fill-opacity="${(0.16 * silhouette).toFixed(3)}" stroke="#7564e8" stroke-width="1.4" stroke-opacity="${(0.22 * silhouette).toFixed(3)}" filter="url(#glow)"/>
      <ellipse cx="${r.iconX.toFixed(1)}" cy="${r.iconY.toFixed(1)}" rx="${(r.w * (0.17 + 0.025 * materialPulse)).toFixed(1)}" ry="${(r.h * (0.40 + 0.04 * materialPulse)).toFixed(1)}" fill="url(#cardAura)" opacity="${(0.30 * smooth(start - 0.16, start + 0.68, t) * globalOut).toFixed(3)}" filter="url(#softGlow)"/>
      <g opacity="${alpha.toFixed(3)}">
      <g clip-path="url(#clip${i})" mask="url(#mask${i})">
        <image href="${uri}" x="${geometry.x.toFixed(1)}" y="${geometry.y.toFixed(1)}" width="${geometry.w.toFixed(1)}" height="${geometry.h.toFixed(1)}" preserveAspectRatio="none"/>
      </g>
      <g clip-path="url(#clip${i})" opacity="${(0.34 * reveal).toFixed(3)}">
        <circle cx="${r.iconX.toFixed(1)}" cy="${r.iconY.toFixed(1)}" r="${(84 + 22 * breath).toFixed(1)}" fill="#7965ff" opacity="${(0.08 + 0.06 * breath).toFixed(3)}" filter="url(#softGlow)"/>
        <rect x="${glassX.toFixed(1)}" y="${(r.y - r.h * 0.24).toFixed(1)}" width="${(r.w * 0.21).toFixed(1)}" height="${(r.h * 1.48).toFixed(1)}" transform="skewX(-18)" fill="url(#glass)" opacity="${(0.075 + 0.055 * breath).toFixed(3)}"/>
        <rect x="${causticX.toFixed(1)}" y="${(r.y - r.h * 0.38).toFixed(1)}" width="${(r.w * 0.34).toFixed(1)}" height="${(r.h * 1.76).toFixed(1)}" transform="rotate(-13 ${r.x.toFixed(1)} ${r.y.toFixed(1)})" fill="url(#caustic)" opacity="${(0.10 + 0.05 * materialPulse).toFixed(3)}" filter="url(#softGlow)"/>
        ${sparks}
      </g>
      <path d="${d}" pathLength="1000" fill="none" stroke="#6a54ff" stroke-width="8" stroke-opacity="${(0.06 + 0.06 * breath * edgeDraw).toFixed(3)}" filter="url(#glow)"/>
      <path d="${d}" pathLength="1000" fill="none" stroke="url(#edge)" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${pathDraw} 1000" stroke-opacity="${(0.30 + 0.56 * edgeDraw).toFixed(3)}" filter="url(#pinGlow)"/>
      <path d="${d}" pathLength="1000" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="110 1000" stroke-dashoffset="${(-orbit).toFixed(1)}" stroke-opacity="${(0.34 + 0.44 * breath * edgeDraw).toFixed(3)}" filter="url(#pinGlow)"/>
      <circle cx="${r.iconX.toFixed(1)}" cy="${r.iconY.toFixed(1)}" r="${iconR.toFixed(1)}" fill="none" stroke="#b9adff" stroke-width="1.2" stroke-opacity="${(0.12 + 0.22 * finePulse * reveal).toFixed(3)}" filter="url(#pinGlow)"/>
      ${corners}
      </g>
    </g>`;
  }).join('');

  const dust = Array.from({ length: 30 }, (_, i) => {
    const x = (i * 269 + 87) % W;
    const y = (i * 151 + 43) % H;
    const phase = t * (0.55 + (i % 5) * 0.11) + i * 0.71;
    const twinkle = Math.pow(0.5 + 0.5 * Math.sin(phase), 4);
    return `<circle cx="${x}" cy="${y}" r="${(0.55 + (i % 3) * 0.38).toFixed(2)}" fill="#c8c0ff" opacity="${(0.02 + 0.12 * twinkle * globalA).toFixed(3)}"/>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
  <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    ${defs()}
    <defs>
      <clipPath id="titleClip"><rect x="${geometry.x.toFixed(1)}" y="${geometry.y.toFixed(1)}" width="${(geometry.w * 0.62).toFixed(1)}" height="${(geometry.h * 0.245).toFixed(1)}" rx="8"/></clipPath>
      <mask id="titleMask" maskUnits="userSpaceOnUse" x="${geometry.x.toFixed(1)}" y="${geometry.y.toFixed(1)}" width="${geometry.w.toFixed(1)}" height="${(geometry.h * 0.27).toFixed(1)}">
        <rect x="${geometry.x.toFixed(1)}" y="${geometry.y.toFixed(1)}" width="${(geometry.w * 0.68 * titleWipe).toFixed(1)}" height="${(geometry.h * 0.27).toFixed(1)}" fill="url(#titleReveal)"/>
        <rect x="${geometry.x.toFixed(1)}" y="${geometry.y.toFixed(1)}" width="${(geometry.w * 0.62).toFixed(1)}" height="${(geometry.h * 0.27).toFixed(1)}" fill="#ffffff" opacity="${titleHold.toFixed(3)}"/>
      </mask>
      ${cardDefs}
    </defs>
    <rect width="${W}" height="${H}" fill="#000000"/>
    <rect width="${W}" height="${H}" fill="url(#ambient)" opacity="${(0.58 * globalA).toFixed(3)}"/>
    ${dust}
    <ellipse cx="${(geometry.x + geometry.w * 0.31).toFixed(1)}" cy="${(geometry.y + geometry.h * 0.135).toFixed(1)}" rx="${(geometry.w * 0.34).toFixed(1)}" ry="${(geometry.h * 0.12).toFixed(1)}" fill="#7462ff" opacity="${(0.08 * titleMist).toFixed(3)}" filter="url(#softGlow)"/>
    <g clip-path="url(#titleClip)" mask="url(#titleMask)" opacity="${titleA.toFixed(3)}">
      <image href="${uri}" x="${geometry.x.toFixed(1)}" y="${geometry.y.toFixed(1)}" width="${geometry.w.toFixed(1)}" height="${geometry.h.toFixed(1)}" preserveAspectRatio="none"/>
    </g>
    <rect x="${titleSweepX.toFixed(1)}" y="${(geometry.y + 34).toFixed(1)}" width="560" height="224" transform="skewX(-12)" fill="url(#titleSweep)" opacity="${(0.095 * smooth(0.20, 0.78, t) * (1 - smooth(1.86, 2.56, t))).toFixed(3)}" filter="url(#softGlow)"/>
    <rect x="${(geometry.x + 10).toFixed(1)}" y="${(geometry.y + geometry.h * 0.232).toFixed(1)}" width="${(geometry.w * 0.46 * smooth(0.82, 2.22, t)).toFixed(1)}" height="1.15" rx="0.6" fill="url(#titleSweep)" opacity="${(0.28 * smooth(0.72, 1.52, t) * (1 - smooth(3.15, 4.20, t))).toFixed(3)}" filter="url(#pinGlow)"/>
    <circle cx="${(geometry.x + geometry.w * 0.315).toFixed(1)}" cy="${(geometry.y + geometry.h * 0.130).toFixed(1)}" r="${(58 + 18 * titlePulse).toFixed(1)}" fill="#7562ff" opacity="${(0.035 * smooth(1.00, 1.82, t) * globalOut).toFixed(3)}" filter="url(#softGlow)"/>
    <circle cx="${(geometry.x + geometry.w * 0.545).toFixed(1)}" cy="${(geometry.y + geometry.h * 0.128).toFixed(1)}" r="${(24 + 9 * titlePulse).toFixed(1)}" fill="#8b77ff" opacity="${(0.10 * sparkleIn * titlePulse).toFixed(3)}" filter="url(#softGlow)"/>
    <circle cx="${(geometry.x + geometry.w * 0.545).toFixed(1)}" cy="${(geometry.y + geometry.h * 0.128).toFixed(1)}" r="${(1.6 + 1.2 * titlePulse).toFixed(1)}" fill="#ffffff" opacity="${(0.28 * sparkleIn).toFixed(3)}" filter="url(#pinGlow)"/>
    ${cardLayers}
    <rect x="54" y="38" width="1812" height="1004" rx="34" fill="none" stroke="#5f4fe0" stroke-width="1.1" stroke-opacity="${(0.10 * globalA).toFixed(3)}"/>
  </svg>`;
}

async function main() {
  assertFile(ffmpeg);
  assertFile(source);
  const meta = await sharp(source).metadata();
  const uri = dataUri(source);
  fs.rmSync(frameDir, { recursive: true, force: true });
  fs.mkdirSync(frameDir, { recursive: true });
  const frameCount = Math.round(DUR * FPS);
  for (let i = 0; i < frameCount; i += 1) {
    const t = i / FPS;
    const frame = path.join(frameDir, `frame_${String(i).padStart(5, '0')}.png`);
    await sharp(Buffer.from(renderSvg(t, meta, uri))).png().toFile(frame);
    if (i % 60 === 0) console.log(`frame ${i}/${frameCount}`);
  }
  run(ffmpeg, [
    '-y', '-framerate', String(FPS), '-i', path.join(frameDir, 'frame_%05d.png'),
    '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17',
    '-pix_fmt', 'yuv420p', '-r', String(FPS), '-movflags', '+faststart', output,
  ], 'encode highlight preview');
  console.log(`DONE ${output}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
