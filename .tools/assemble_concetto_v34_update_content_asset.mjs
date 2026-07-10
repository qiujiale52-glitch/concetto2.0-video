import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import sharp from './thumbs/node_modules/sharp/dist/index.mjs';

const cwd = process.cwd();
const ffmpeg = path.join(cwd, '.tools/media-bin/node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg');
const ffprobe = path.join(cwd, '.tools/media-bin/node_modules/@ffprobe-installer/darwin-arm64/ffprobe');
const music = path.join(cwd, '04-正版授权音乐库', '未来科技宽广磅礴音乐15437.wav');

const W = 1920;
const H = 1080;
const FPS = 30;
const srcList = path.join(cwd, '06_预览输出', 'refined_v27_workflow_pathpolish_parts', 'concat_list_v27.txt');
const outDir = path.join(cwd, '06_预览输出', 'refined_v34_update_content_asset_parts');
const frameDir = path.join(outDir, 'frames_update_content_v34');
const highlightFrameDir = path.join(outDir, 'frames_highlight_v34');
const updateDir = path.join(cwd, '更新内容');
const highlightDir = path.join(cwd, '亮点');
const openingClip = path.join(cwd, '开头', 'Concetto_2.0_开头登场视觉_v04_2点0震荡波_9s.mp4');
const output = path.join(cwd, '06_预览输出', 'Concetto_2.0_AI超分操作演示_v34_更新内容素材替换_低清.mp4');
const preview = path.join(cwd, '06_预览输出', 'Concetto_2.0_AI超分操作演示_v34_更新内容素材替换_全片预览.jpg');
const introPreview = path.join(cwd, '06_预览输出', 'Concetto_2.0_AI超分操作演示_v34_前置段预览.jpg');
const updatePreview = path.join(cwd, '06_预览输出', 'Concetto_2.0_AI超分操作演示_v34_六大模块段预览.jpg');
const highlightPreview = path.join(cwd, '06_预览输出', 'Concetto_2.0_AI超分操作演示_v34_升级亮点段预览.jpg');
const logPath = path.join(cwd, '03_脚本与结构', 'Concetto 2.0_v34_更新内容素材替换说明.md');

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(frameDir, { recursive: true });
fs.mkdirSync(highlightFrameDir, { recursive: true });

function assertFile(p) {
  if (!fs.existsSync(p)) throw new Error(`missing file: ${p}`);
}

function run(bin, args, label) {
  const r = spawnSync(bin, args, { stdio: 'inherit' });
  if (r.status !== 0) throw new Error(`${label} failed with status ${r.status}`);
}

function runCapture(bin, args, label) {
  const r = spawnSync(bin, args, { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`${label} failed with status ${r.status}: ${r.stderr}`);
  return r.stdout.trim();
}

function probeDur(file) {
  const out = runCapture(ffprobe, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nk=1:nw=1', file], `probe ${file}`);
  const n = Number.parseFloat(out);
  return Number.isFinite(n) ? n : 0;
}

function quoteFile(p) {
  return p.replace(/'/g, "'\\''");
}

function readConcatList(file) {
  return fs.readFileSync(file, 'utf8')
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^file\s+'/, '').replace(/'$/, '').replace(/'\\''/g, "'"));
}

const dataUriCache = new Map();
function dataUri(file) {
  if (dataUriCache.has(file)) return dataUriCache.get(file);
  const ext = path.extname(file).toLowerCase();
  const mime = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/png';
  const uri = `data:${mime};base64,${fs.readFileSync(file).toString('base64')}`;
  dataUriCache.set(file, uri);
  return uri;
}

function clamp(v, a = 0, b = 1) {
  return Math.max(a, Math.min(b, v));
}

function smooth(a, b, x) {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
}

function easeOut(t) {
  t = clamp(t);
  return 1 - Math.pow(1 - t, 3);
}

function updateImages() {
  if (!fs.existsSync(updateDir)) return [];
  const files = fs.readdirSync(updateDir)
    .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
    .sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'));
  files.sort((a, b) => {
    const ap = /^更新内容1\./.test(a) ? 0 : 1;
    const bp = /^更新内容1\./.test(b) ? 0 : 1;
    return ap - bp || a.localeCompare(b, 'zh-Hans-CN');
  });
  return files.map((f) => path.join(updateDir, f));
}

function highlightImages() {
  if (!fs.existsSync(highlightDir)) return [];
  return fs.readdirSync(highlightDir)
    .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
    .sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'))
    .map((f) => path.join(highlightDir, f));
}

function svgDefs() {
  return `
  <defs>
    <radialGradient id="core" cx="50%" cy="54%" r="70%">
      <stop offset="0%" stop-color="#4935a0" stop-opacity="0.48"/>
      <stop offset="52%" stop-color="#080612" stop-opacity="0.82"/>
      <stop offset="100%" stop-color="#010104" stop-opacity="1"/>
    </radialGradient>
    <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#7668ff" stop-opacity="0"/>
      <stop offset="48%" stop-color="#eeeaff" stop-opacity="0.82"/>
      <stop offset="100%" stop-color="#4fa6ff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#7462ff" stop-opacity="0.1"/>
      <stop offset="36%" stop-color="#9b85ff" stop-opacity="0.75"/>
      <stop offset="54%" stop-color="#ffffff" stop-opacity="1"/>
      <stop offset="76%" stop-color="#75e2ff" stop-opacity="0.72"/>
      <stop offset="100%" stop-color="#6251f2" stop-opacity="0.08"/>
    </linearGradient>
    <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#c66bff"/>
      <stop offset="52%" stop-color="#8b73ff"/>
      <stop offset="100%" stop-color="#48a9ff"/>
    </linearGradient>
    <filter id="glow" x="-70%" y="-70%" width="240%" height="240%">
      <feDropShadow dx="0" dy="0" stdDeviation="13" flood-color="#8b76ff" flood-opacity="0.58"/>
      <feDropShadow dx="0" dy="8" stdDeviation="28" flood-color="#23166f" flood-opacity="0.42"/>
    </filter>
    <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="0" stdDeviation="7" flood-color="#ffffff" flood-opacity="0.35"/>
      <feDropShadow dx="0" dy="0" stdDeviation="18" flood-color="#806cff" flood-opacity="0.48"/>
    </filter>
    <filter id="pinGlow" x="-90%" y="-90%" width="280%" height="280%">
      <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="#ffffff" flood-opacity="0.86"/>
      <feDropShadow dx="0" dy="0" stdDeviation="11" flood-color="#8c7cff" flood-opacity="0.68"/>
      <feDropShadow dx="0" dy="0" stdDeviation="22" flood-color="#52d8ff" flood-opacity="0.22"/>
    </filter>
    <filter id="wideGlow" x="-120%" y="-120%" width="340%" height="340%">
      <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#ffffff" flood-opacity="0.46"/>
      <feDropShadow dx="0" dy="0" stdDeviation="18" flood-color="#8c7cff" flood-opacity="0.58"/>
      <feDropShadow dx="0" dy="0" stdDeviation="38" flood-color="#3d31bd" flood-opacity="0.36"/>
    </filter>
  </defs>`;
}

function updateCardRects(imgX, imgY, imgW, imgH, meta) {
  const sx = imgW / meta.width;
  const sy = imgH / meta.height;
  // Based on the provided 1680×945 update-content page. Kept slightly inset so the glow traces the original card borders.
  const rects = [
    { x: 116, y: 220, w: 490, h: 318 },
    { x: 636, y: 220, w: 448, h: 318 },
    { x: 1108, y: 220, w: 456, h: 318 },
    { x: 116, y: 568, w: 470, h: 288 },
    { x: 616, y: 568, w: 468, h: 288 },
    { x: 1108, y: 508, w: 456, h: 348 },
  ];
  return rects.map((r) => ({
    x: imgX + r.x * sx,
    y: imgY + r.y * sy,
    w: r.w * sx,
    h: r.h * sy,
  }));
}

function roundedRectPath(r, rad = 24) {
  const x = r.x;
  const y = r.y;
  const w = r.w;
  const h = r.h;
  const rr = Math.min(rad, w / 2, h / 2);
  return [
    `M ${x + rr} ${y}`,
    `H ${x + w - rr}`,
    `Q ${x + w} ${y} ${x + w} ${y + rr}`,
    `V ${y + h - rr}`,
    `Q ${x + w} ${y + h} ${x + w - rr} ${y + h}`,
    `H ${x + rr}`,
    `Q ${x} ${y + h} ${x} ${y + h - rr}`,
    `V ${y + rr}`,
    `Q ${x} ${y} ${x + rr} ${y}`,
    'Z',
  ].join(' ');
}

function easeInOut(t) {
  t = clamp(t);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function renderUpdateSvg(t, dur, imgFile, meta) {
  const p = easeOut(t / 1.05);
  const a = smooth(0.04, 0.55, t) * (1 - smooth(dur - 0.48, dur, t));
  const imgUri = dataUri(imgFile);
  const imgW = 1680 * (0.982 + 0.018 * p);
  const imgH = imgW * meta.height / meta.width;
  const imgX = (W - imgW) / 2;
  const imgY = (H - imgH) / 2 + 14 - 9 * p;
  const scanX = -620 + (W + 1240) * (t / dur);
  const cards = updateCardRects(imgX, imgY, imgW, imgH, meta);
  const moduleStart = 0.78;
  const moduleGap = 0.42;
  const moduleDur = 1.34;
  const cardEffects = cards.map((r, i) => {
    const start = moduleStart + i * moduleGap;
    const k = smooth(start, start + 0.46, t);
    const hold = 1 - smooth(dur - 0.85, dur - 0.2, t);
    const pulse = 0.52 + 0.48 * Math.sin(t * 3.1 + i * 1.18);
    const breath = 0.62 + 0.38 * Math.sin(t * 2.2 + i * 0.64);
    const local = easeInOut((t - start) / moduleDur);
    const draw = Math.min(1000, local * 1000);
    const headStart = Math.max(0, draw - 165);
    const headLen = Math.min(210, draw);
    const sweepLocal = (t - (start + 0.18)) / 2.15;
    const sweepPos = clamp(sweepLocal);
    const sweepA = Math.pow(Math.sin(Math.PI * sweepPos), 1.45) * smooth(0, 0.12, sweepLocal) * (1 - smooth(0.88, 1.0, sweepLocal));
    const sweep = r.x - r.w * 0.48 + r.w * 1.92 * clamp(sweepLocal);
    const alpha = a * k * hold;
    const d = roundedRectPath(r, 26);
    const cornerDots = [
      [r.x + r.w * 0.06, r.y + r.h * 0.06],
      [r.x + r.w * 0.94, r.y + r.h * 0.06],
      [r.x + r.w * 0.94, r.y + r.h * 0.94],
      [r.x + r.w * 0.06, r.y + r.h * 0.94],
    ].map(([x, y], j) => {
      const hit = smooth(start + 0.12 + j * 0.10, start + 0.24 + j * 0.10, t) * (1 - smooth(start + 0.58 + j * 0.08, start + 0.98 + j * 0.08, t));
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(2.6 + hit * 6 + breath * 1.2).toFixed(1)}" fill="#ffffff" opacity="${(0.12 + hit * 0.60 + breath * 0.10).toFixed(3)}" filter="url(#pinGlow)"/>`;
    }).join('');
    return `<g opacity="${alpha.toFixed(3)}">
      <path d="${d}" pathLength="1000" fill="none" stroke="#6d5cff" stroke-width="5.4" stroke-linecap="round" stroke-linejoin="round" stroke-opacity="${(0.055 + 0.045 * breath).toFixed(3)}" filter="url(#glow)"/>
      <path d="${d}" pathLength="1000" fill="none" stroke="#ffffff" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="8 16" stroke-dashoffset="${(-(t * 28 + i * 48)).toFixed(1)}" stroke-opacity="${(0.07 + 0.04 * pulse).toFixed(3)}"/>
      <path d="${d}" pathLength="1000" fill="none" stroke="#927fff" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${draw.toFixed(1)} 1000" stroke-opacity="${(0.13 + 0.08 * breath).toFixed(3)}" filter="url(#glow)"/>
      <path d="${d}" pathLength="1000" fill="none" stroke="url(#edgeGrad)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${draw.toFixed(1)} 1000" stroke-opacity="${(0.54 + 0.25 * breath).toFixed(3)}" filter="url(#pinGlow)"/>
      <path d="${d}" pathLength="1000" fill="none" stroke="#ffffff" stroke-width="2.0" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${headLen.toFixed(1)} 1000" stroke-dashoffset="${(-headStart).toFixed(1)}" stroke-opacity="${(0.72 + 0.22 * pulse).toFixed(3)}" filter="url(#pinGlow)"/>
      <rect x="${sweep.toFixed(1)}" y="${(r.y - 34).toFixed(1)}" width="${(r.w * (0.16 + 0.05 * breath)).toFixed(1)}" height="${(r.h + 68).toFixed(1)}" transform="skewX(-17)" fill="url(#lineGrad)" opacity="${(0.20 * sweepA * (0.72 + 0.28 * breath)).toFixed(3)}"/>
      <rect x="${(r.x + r.w * 0.03).toFixed(1)}" y="${(r.y + r.h * 0.03).toFixed(1)}" width="${(r.w * 0.94).toFixed(1)}" height="${(r.h * 0.94).toFixed(1)}" rx="21" fill="none" stroke="#79dfff" stroke-width="1.0" stroke-dasharray="${(70 + 40 * breath).toFixed(1)} 520" stroke-dashoffset="${(-(t * 52 + i * 60)).toFixed(1)}" stroke-opacity="${(0.07 + 0.07 * breath).toFixed(3)}" filter="url(#softGlow)"/>
      <circle cx="${(r.x + r.w * 0.14).toFixed(1)}" cy="${(r.y + r.h * 0.30).toFixed(1)}" r="${(24 + 9 * pulse).toFixed(1)}" fill="#ffffff" opacity="${(0.09 + 0.09 * pulse).toFixed(3)}" filter="url(#softGlow)"/>
      ${cornerDots}
    </g>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
  <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    ${svgDefs()}
    <rect width="${W}" height="${H}" fill="#010104"/>
    <rect width="${W}" height="${H}" fill="url(#core)" opacity="${(0.92 * a).toFixed(3)}"/>
    <path d="M 104 852 C 590 750, 1220 778, 1818 684" stroke="#7668ff" stroke-opacity="${(0.18 * a).toFixed(3)}" stroke-width="1.3" fill="none"/>
    <path d="M 230 218 C 710 146, 1240 174, 1708 106" stroke="#ffffff" stroke-opacity="${(0.055 * a).toFixed(3)}" stroke-width="1" fill="none"/>
    <rect x="${scanX.toFixed(1)}" y="-80" width="620" height="1240" transform="skewX(-18)" fill="url(#lineGrad)" opacity="${(0.045 * a * Math.pow(Math.sin(Math.PI * clamp(t / dur)), 1.35) * (0.82 + 0.18 * Math.sin(t * 2.0))).toFixed(3)}"/>
    <text x="112" y="118" font-family="Avenir Next, Arial" font-size="16" letter-spacing="7" fill="#857be8" opacity="${(0.72 * a).toFixed(3)}">CONCETTO 2.0 / UPDATE CONTENTS</text>
    <rect x="112" y="140" width="${(288 * a).toFixed(1)}" height="1.2" fill="#7668ff" opacity="0.55"/>
    <g opacity="${a.toFixed(3)}" filter="url(#glow)">
      <rect x="${(imgX - 22).toFixed(1)}" y="${(imgY - 22).toFixed(1)}" width="${(imgW + 44).toFixed(1)}" height="${(imgH + 44).toFixed(1)}" rx="42" fill="#151039" opacity="0.78" stroke="#8d7cff" stroke-opacity="0.24"/>
      <image href="${imgUri}" x="${imgX.toFixed(1)}" y="${imgY.toFixed(1)}" width="${imgW.toFixed(1)}" height="${imgH.toFixed(1)}" preserveAspectRatio="xMidYMid meet"/>
    </g>
    ${cardEffects}
    <rect x="${(imgX + imgW * 0.04).toFixed(1)}" y="${(imgY + imgH * 0.155).toFixed(1)}" width="${(imgW * 0.92).toFixed(1)}" height="2.2" fill="url(#lineGrad)" opacity="${(0.34 * smooth(0.72, 1.72, t) * a).toFixed(3)}" filter="url(#glow)"/>
  </svg>`;
}

async function renderUpdateClip() {
  const imgs = updateImages();
  if (imgs.length === 0) throw new Error(`更新内容文件夹没有可用图片：${updateDir}`);
  const img = imgs[0];
  const meta = await sharp(img).metadata();
  const dur = 7.2;
  const count = Math.round(dur * FPS);
  fs.rmSync(frameDir, { recursive: true, force: true });
  fs.mkdirSync(frameDir, { recursive: true });
  for (let i = 0; i < count; i++) {
    const t = i / FPS;
    const out = path.join(frameDir, `frame_${String(i).padStart(4, '0')}.png`);
    await sharp(Buffer.from(renderUpdateSvg(t, dur, img, meta))).png().toFile(out);
  }
  const out = path.join(outDir, 'intro_update_contents_v34_from_update1.mp4');
  run(ffmpeg, [
    '-y',
    '-framerate', String(FPS),
    '-i', path.join(frameDir, 'frame_%04d.png'),
    '-vf', `fade=t=in:st=0:d=0.18,fade=t=out:st=${(dur - 0.32).toFixed(2)}:d=0.32,format=yuv420p`,
    '-an',
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '20',
    '-pix_fmt', 'yuv420p',
    '-r', String(FPS),
    '-movflags', '+faststart',
    out,
  ], 'render update contents v34');
  return out;
}

function highlightCardRects(imgX, imgY, imgW, imgH, meta) {
  const sx = imgW / meta.width;
  const sy = imgH / meta.height;
  // Coordinates calibrated on 亮点/512bfd...png, tracing the four rounded feature cards.
  const rects = [
    { x: 515, y: 900, w: 2188, h: 920, iconX: 805, iconY: 1164 },
    { x: 2760, y: 900, w: 2190, h: 920, iconX: 3038, iconY: 1164 },
    { x: 515, y: 1884, w: 2188, h: 965, iconX: 805, iconY: 2165 },
    { x: 2760, y: 1884, w: 2190, h: 965, iconX: 3038, iconY: 2165 },
  ];
  return rects.map((r) => ({
    x: imgX + r.x * sx,
    y: imgY + r.y * sy,
    w: r.w * sx,
    h: r.h * sy,
    iconX: imgX + r.iconX * sx,
    iconY: imgY + r.iconY * sy,
  }));
}

function renderHighlightSvg(t, dur, imgFile, meta) {
  const imgUri = dataUri(imgFile);
  const p = easeOut(t / 1.05);
  const a = smooth(0.05, 0.62, t) * (1 - smooth(dur - 0.55, dur, t));
  const imgW = 1680 * (0.982 + 0.018 * p);
  const imgH = imgW * meta.height / meta.width;
  const imgX = (W - imgW) / 2;
  const imgY = (H - imgH) / 2 + 14 - 8 * p;
  const cards = highlightCardRects(imgX, imgY, imgW, imgH, meta);
  const globalPos = clamp(t / dur);
  const globalScan = -650 + (W + 1300) * globalPos;
  const scanStrength = Math.pow(Math.sin(Math.PI * globalPos), 1.70) * smooth(0.12, 0.34, globalPos) * (1 - smooth(0.82, 0.98, globalPos));

  const cardEffects = cards.map((r, i) => {
    const intro = smooth(0.62 + i * 0.10, 1.22 + i * 0.10, t);
    const hold = 1 - smooth(dur - 0.85, dur - 0.18, t);
    const alpha = a * intro * hold;
    const local = (t - (0.72 + i * 0.12)) / 4.45;
    const orbit = (t * 0.15 + i * 0.23) % 1;
    const drawA = 0.70 + 0.30 * Math.sin(t * 2.1 + i * 1.17);
    const breath = 0.58 + 0.42 * Math.sin(t * 2.45 + i * 0.82);
    const slowBreath = 0.50 + 0.50 * Math.sin(t * 1.55 + i * 1.36);
    const quickTwinkle = 0.50 + 0.50 * Math.sin(t * 5.6 + i * 0.92);
    const d = roundedRectPath(r, 30);
    const sweepPos = clamp(local);
    const sweepA = Math.pow(Math.sin(Math.PI * sweepPos), 1.70) * smooth(0.14, 0.34, local) * (1 - smooth(0.84, 1.0, local));
    const sweepX = r.x - r.w * 0.48 + r.w * 1.96 * sweepPos;
    const ring = 0.55 + 0.45 * Math.sin(t * 3.4 + i * 1.31);
    const dashOffset = (-(t * 52 + i * 116)).toFixed(1);
    const headOffset = (-(orbit * 1000)).toFixed(1);
    const cornerDots = [
      [r.x + r.w * 0.055, r.y + r.h * 0.060],
      [r.x + r.w * 0.945, r.y + r.h * 0.060],
      [r.x + r.w * 0.945, r.y + r.h * 0.940],
      [r.x + r.w * 0.055, r.y + r.h * 0.940],
    ].map(([x, y], j) => {
      const pulse = 0.45 + 0.55 * Math.sin(t * 3.2 + i * 1.6 + j * 1.1);
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(3.0 + pulse * 3.8).toFixed(1)}" fill="#ffffff" opacity="${(0.16 + pulse * 0.20).toFixed(3)}" filter="url(#pinGlow)"/>`;
    }).join('');
    const innerLines = [0.16, 0.50, 0.84].map((yy, j) => {
      const w = r.w * (0.20 + 0.11 * Math.sin(t * 1.7 + i + j));
      const x = r.x + r.w * (0.52 + 0.06 * j);
      const y = r.y + r.h * yy;
      return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="1.4" rx="0.7" fill="url(#lineGrad)" opacity="${(0.08 + 0.06 * breath).toFixed(3)}" filter="url(#softGlow)"/>`;
    }).join('');
    const glassSweepX = r.x - r.w * 0.62 + r.w * (1.18 + 0.22 * Math.sin(t * 0.92 + i)) * ((t * 0.105 + i * 0.19) % 1.22);
    const cardGlowX = r.x + r.w * (0.22 + 0.60 * (0.5 + 0.5 * Math.sin(t * 0.86 + i * 1.42)));
    const cardGlowY = r.y + r.h * (0.30 + 0.38 * (0.5 + 0.5 * Math.cos(t * 0.74 + i * 1.1)));
    const microSparks = [0, 1, 2, 3, 4, 5].map((_, j) => {
      const phase = t * (2.2 + j * 0.18) + i * 1.7 + j * 1.31;
      const x = r.x + r.w * (0.15 + ((0.17 * j + 0.19 * Math.sin(phase * 0.51)) % 0.72 + 0.72) % 0.72);
      const y = r.y + r.h * (0.18 + ((0.13 * j + 0.16 * Math.cos(phase * 0.43)) % 0.64 + 0.64) % 0.64);
      const tw = Math.pow(0.5 + 0.5 * Math.sin(phase * 2.2), 2.2);
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(1.2 + tw * 2.2).toFixed(1)}" fill="#ffffff" opacity="${(0.05 + 0.24 * tw).toFixed(3)}" filter="url(#pinGlow)"/>`;
    }).join('');
    const filamentLines = [0.22, 0.42, 0.68].map((yy, j) => {
      const localShift = (t * (34 + j * 9) + i * 71 + j * 44) % (r.w * 0.72);
      const x = r.x + r.w * 0.16 + localShift;
      const y = r.y + r.h * yy;
      return `<path d="M ${x.toFixed(1)} ${y.toFixed(1)} C ${(x + r.w * 0.12).toFixed(1)} ${(y - 10).toFixed(1)}, ${(x + r.w * 0.24).toFixed(1)} ${(y + 9).toFixed(1)}, ${(x + r.w * 0.36).toFixed(1)} ${(y - 2).toFixed(1)}" stroke="#ffffff" stroke-width="${(0.7 + 0.35 * slowBreath).toFixed(2)}" stroke-opacity="${(0.055 + 0.04 * quickTwinkle).toFixed(3)}" fill="none" filter="url(#softGlow)"/>`;
    }).join('');
    return `<g opacity="${alpha.toFixed(3)}">
      <clipPath id="featureClip${i}"><path d="${d}"/></clipPath>
      <g clip-path="url(#featureClip${i})">
        <path d="${d}" fill="#ffffff" opacity="${(0.018 + 0.025 * slowBreath).toFixed(3)}"/>
        <circle cx="${cardGlowX.toFixed(1)}" cy="${cardGlowY.toFixed(1)}" r="${(r.w * (0.105 + 0.025 * slowBreath)).toFixed(1)}" fill="#8c7cff" opacity="${(0.030 + 0.035 * slowBreath).toFixed(3)}" filter="url(#wideGlow)"/>
        <circle cx="${(cardGlowX + r.w * 0.18 * Math.sin(t * 0.55 + i)).toFixed(1)}" cy="${(cardGlowY - r.h * 0.18 * Math.cos(t * 0.62 + i)).toFixed(1)}" r="${(r.w * 0.045).toFixed(1)}" fill="#7de8ff" opacity="${(0.025 + 0.030 * quickTwinkle).toFixed(3)}" filter="url(#wideGlow)"/>
        <rect x="${glassSweepX.toFixed(1)}" y="${(r.y - r.h * 0.20).toFixed(1)}" width="${(r.w * 0.16).toFixed(1)}" height="${(r.h * 1.42).toFixed(1)}" transform="skewX(-20)" fill="url(#lineGrad)" opacity="${(0.045 + 0.040 * slowBreath).toFixed(3)}"/>
        ${filamentLines}
        ${microSparks}
      </g>
      <path d="${d}" pathLength="1000" fill="none" stroke="#6d5cff" stroke-width="8.5" stroke-linecap="round" stroke-linejoin="round" stroke-opacity="${(0.08 + 0.05 * breath).toFixed(3)}" filter="url(#wideGlow)"/>
      <path d="${d}" pathLength="1000" fill="none" stroke="#ffffff" stroke-width="1.05" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="8 15" stroke-dashoffset="${dashOffset}" stroke-opacity="${(0.08 + 0.05 * breath).toFixed(3)}"/>
      <path d="${d}" pathLength="1000" fill="none" stroke="url(#edgeGrad)" stroke-width="${(3.3 + 0.9 * slowBreath).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round" stroke-opacity="${(0.30 + 0.30 * drawA).toFixed(3)}" filter="url(#pinGlow)"/>
      <path d="${d}" pathLength="1000" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="130 1000" stroke-dashoffset="${headOffset}" stroke-opacity="${(0.64 + 0.24 * breath).toFixed(3)}" filter="url(#pinGlow)"/>
      <rect x="${sweepX.toFixed(1)}" y="${(r.y - 38).toFixed(1)}" width="${(r.w * (0.16 + 0.05 * breath)).toFixed(1)}" height="${(r.h + 76).toFixed(1)}" transform="skewX(-17)" fill="url(#lineGrad)" opacity="${(0.20 * sweepA * (0.70 + 0.30 * breath)).toFixed(3)}"/>
      <rect x="${(r.x + r.w * 0.025).toFixed(1)}" y="${(r.y + r.h * 0.035).toFixed(1)}" width="${(r.w * 0.95).toFixed(1)}" height="${(r.h * 0.93).toFixed(1)}" rx="24" fill="none" stroke="#7de8ff" stroke-width="1.0" stroke-dasharray="${(86 + 56 * breath).toFixed(1)} 560" stroke-dashoffset="${(-(t * 70 + i * 80)).toFixed(1)}" stroke-opacity="${(0.08 + 0.08 * breath).toFixed(3)}" filter="url(#softGlow)"/>
      <circle cx="${r.iconX.toFixed(1)}" cy="${r.iconY.toFixed(1)}" r="${(46 + 12 * ring).toFixed(1)}" fill="#8c78ff" opacity="${(0.15 + 0.10 * ring).toFixed(3)}" filter="url(#wideGlow)"/>
      <circle cx="${r.iconX.toFixed(1)}" cy="${r.iconY.toFixed(1)}" r="${(67 + 18 * ring).toFixed(1)}" fill="none" stroke="#ffffff" stroke-width="1.2" stroke-opacity="${(0.10 + 0.10 * ring).toFixed(3)}" filter="url(#pinGlow)"/>
      ${cornerDots}
      ${innerLines}
    </g>`;
  }).join('');

  const floatSparks = cards.map((r, i) => {
    const phase = t * 0.9 + i * 1.9;
    const x = r.x + r.w * (0.62 + 0.26 * Math.sin(phase * 0.7));
    const y = r.y + r.h * (0.46 + 0.28 * Math.cos(phase * 0.52));
    return `<g opacity="${(a * 0.42).toFixed(3)}">
      <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(2.6 + 1.8 * Math.sin(phase)).toFixed(1)}" fill="#ffffff" filter="url(#pinGlow)"/>
      <circle cx="${(x + 34 * Math.sin(phase * 1.2)).toFixed(1)}" cy="${(y + 26 * Math.cos(phase * 1.1)).toFixed(1)}" r="1.8" fill="#7de8ff" opacity="0.70"/>
    </g>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
  <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    ${svgDefs()}
    <rect width="${W}" height="${H}" fill="#010104"/>
    <rect width="${W}" height="${H}" fill="url(#core)" opacity="${(0.86 * a).toFixed(3)}"/>
    <path d="M 102 842 C 560 746, 1220 785, 1818 692" stroke="#7668ff" stroke-opacity="${(0.20 * a).toFixed(3)}" stroke-width="1.3" fill="none"/>
    <path d="M 210 214 C 720 148, 1220 178, 1710 118" stroke="#ffffff" stroke-opacity="${(0.055 * a).toFixed(3)}" stroke-width="1" fill="none"/>
    <rect x="${globalScan.toFixed(1)}" y="-90" width="640" height="1260" transform="skewX(-18)" fill="url(#lineGrad)" opacity="${(0.045 * a * scanStrength * (0.72 + 0.28 * Math.sin(t * 1.8))).toFixed(3)}"/>
    <text x="112" y="118" font-family="Avenir Next, Arial" font-size="16" letter-spacing="7" fill="#857be8" opacity="${(0.72 * a).toFixed(3)}">CONCETTO 2.0 / FEATURE HIGHLIGHTS</text>
    <rect x="112" y="140" width="${(302 * a).toFixed(1)}" height="1.2" fill="#7668ff" opacity="0.55"/>
    <g opacity="${a.toFixed(3)}" filter="url(#glow)">
      <rect x="${(imgX - 22).toFixed(1)}" y="${(imgY - 22).toFixed(1)}" width="${(imgW + 44).toFixed(1)}" height="${(imgH + 44).toFixed(1)}" rx="42" fill="#151039" opacity="0.78" stroke="#8d7cff" stroke-opacity="0.24"/>
      <image href="${imgUri}" x="${imgX.toFixed(1)}" y="${imgY.toFixed(1)}" width="${imgW.toFixed(1)}" height="${imgH.toFixed(1)}" preserveAspectRatio="xMidYMid meet"/>
    </g>
    <g opacity="${a.toFixed(3)}">
      ${cardEffects}
      ${floatSparks}
      <rect x="${(imgX + imgW * 0.03).toFixed(1)}" y="${(imgY + imgH * 0.14).toFixed(1)}" width="${(imgW * 0.94).toFixed(1)}" height="2.0" fill="url(#lineGrad)" opacity="${(0.26 * smooth(0.55, 1.55, t)).toFixed(3)}" filter="url(#glow)"/>
    </g>
  </svg>`;
}

async function renderHighlightClip() {
  const imgs = highlightImages();
  if (imgs.length === 0) throw new Error(`亮点文件夹没有可用图片：${highlightDir}`);
  const img = imgs[0];
  const meta = await sharp(img).metadata();
  const lightImg = path.join(outDir, 'highlight_source_scaled_v30.jpg');
  await sharp(img)
    .resize({ width: 1900, withoutEnlargement: true })
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(lightImg);
  const dur = 7.2;
  const count = Math.round(dur * FPS);
  fs.rmSync(highlightFrameDir, { recursive: true, force: true });
  fs.mkdirSync(highlightFrameDir, { recursive: true });
  for (let i = 0; i < count; i++) {
    const t = i / FPS;
    const out = path.join(highlightFrameDir, `frame_${String(i).padStart(4, '0')}.png`);
    await sharp(Buffer.from(renderHighlightSvg(t, dur, lightImg, meta))).png().toFile(out);
  }
  const out = path.join(outDir, 'intro_highlight_01_v30_richer_breath_fx.mp4');
  run(ffmpeg, [
    '-y',
    '-framerate', String(FPS),
    '-i', path.join(highlightFrameDir, 'frame_%04d.png'),
    '-vf', `fade=t=in:st=0:d=0.18,fade=t=out:st=${(dur - 0.32).toFixed(2)}:d=0.32,format=yuv420p`,
    '-an',
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '20',
    '-pix_fmt', 'yuv420p',
    '-r', String(FPS),
    '-movflags', '+faststart',
    out,
  ], 'render highlight contents v30');
  return out;
}

async function main() {
  for (const p of [ffmpeg, ffprobe, music, srcList, openingClip]) assertFile(p);
  const highlightClip = await renderHighlightClip();
  const updateClip = await renderUpdateClip();
  const baseParts = readConcatList(srcList);
  const parts = [];
  let replacedOpening = false;
  let replacedHighlight = false;
  let replacedUpdate = false;
  for (const p of baseParts) {
    if (path.basename(p) === 'intro_opening_folder_direct_v16.mp4') {
      parts.push(openingClip);
      replacedOpening = true;
    } else if (path.basename(p) === 'intro_highlight_01_v16.mp4') {
      parts.push(highlightClip);
      replacedHighlight = true;
    } else if (path.basename(p) === 'intro_update_contents_v24.mp4') {
      parts.push(updateClip);
      replacedUpdate = true;
    } else {
      parts.push(p);
    }
  }
  if (!replacedOpening) throw new Error('未找到 intro_opening_folder_direct_v16.mp4，无法替换开头段');
  if (!replacedHighlight) throw new Error('未找到 intro_highlight_01_v16.mp4，无法替换升级亮点段');
  if (!replacedUpdate) throw new Error('未找到 intro_update_contents_v24.mp4，无法替换更新内容段');

  const list = path.join(outDir, 'concat_list_v34.txt');
  fs.writeFileSync(list, parts.map((p) => `file '${quoteFile(p)}'`).join('\n') + '\n');

  const videoOnly = path.join(outDir, 'video_concat_v34_reencoded.mp4');
  run(ffmpeg, [
    '-y',
    '-f', 'concat',
    '-safe', '0',
    '-i', list,
    '-vf', `scale=${W}:${H}:force_original_aspect_ratio=decrease:flags=lanczos,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:color=black,fps=${FPS},format=yuv420p,setpts=PTS-STARTPTS`,
    '-an',
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '17',
    '-pix_fmt', 'yuv420p',
    '-r', String(FPS),
    '-movflags', '+faststart',
    videoOnly,
  ], 'concat v34 full reencode');
  const totalDur = probeDur(videoOnly);

  run(ffmpeg, [
    '-y',
    '-i', videoOnly,
    '-stream_loop', '-1',
    '-i', music,
    '-filter_complex', `[1:a]atrim=0:${totalDur.toFixed(3)},afade=t=in:st=0:d=1.2,afade=t=out:st=${Math.max(0, totalDur - 3).toFixed(3)}:d=3,volume=0.72[a]`,
    '-map', '0:v',
    '-map', '[a]',
    '-c:v', 'copy',
    '-c:a', 'aac',
    '-b:a', '160k',
    '-movflags', '+faststart',
    '-shortest',
    output,
  ], 'mux v34 music');

  run(ffmpeg, ['-y', '-i', output, '-vf', 'fps=0.24,scale=360:-1,tile=10x7', '-frames:v', '1', preview], 'preview v34');
  run(ffmpeg, ['-y', '-ss', '00:00:00', '-i', output, '-t', '00:00:45', '-vf', 'fps=1,scale=480:-1,tile=10x5', '-frames:v', '1', introPreview], 'intro preview v34');
  run(ffmpeg, ['-y', '-i', updateClip, '-vf', 'fps=1,scale=480:-1,tile=8x1', '-frames:v', '1', updatePreview], 'update preview v34');
  run(ffmpeg, ['-y', '-i', highlightClip, '-vf', 'fps=1,scale=480:-1,tile=8x1', '-frames:v', '1', highlightPreview], 'highlight preview v34');

  fs.writeFileSync(logPath, [
    '# Concetto 2.0 v34 更新内容素材替换',
    '',
    '- 基于 v30 前置段逻辑继续制作；',
    '- 开头段替换为 `开头/Concetto_2.0_开头登场视觉_v04_2点0震荡波_9s.mp4`：删除原中文/英文副标题，并强化 2.0 字形震荡波；',
    '- 更新内容段改用 `更新内容/更新内容1.png` 重新渲染，保留原有六大模块描边、呼吸扫光和卡片光效；',
    '- 升级亮点、九大环节、操作演示和后续内容不改动。',
    '',
    `开头新片段：\`${openingClip}\``,
    `升级亮点片段：\`${highlightClip}\``,
    `更新内容新片段：\`${updateClip}\``,
    `输出视频：\`${output}\``,
    `前置段预览：\`${introPreview}\``,
    `升级亮点段预览：\`${highlightPreview}\``,
    `六大模块段预览：\`${updatePreview}\``,
    '',
  ].join('\n'));

  console.log(`DONE ${output}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
