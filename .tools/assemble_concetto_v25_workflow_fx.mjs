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

const workflowImage = path.join(cwd, '九大环节最新版', '九大环节总览_最新版.png');
const workflowSvg = path.join(cwd, '九大环节最新版', '九大环节总览_最新版.svg');
const sourceList = path.join(cwd, '06_预览输出', 'refined_v23_update_insert_parts', 'concat_list_v24.txt');
const outDir = path.join(cwd, '06_预览输出', 'refined_v27_workflow_pathpolish_parts');
const frameDir = path.join(outDir, 'frames_workflow_v27');
const workflowClip = path.join(outDir, 'intro_workflow_overview_v27_path_polish_light.mp4');
const concatList = path.join(outDir, 'concat_list_v27.txt');
const videoOnly = path.join(outDir, 'video_concat_v27_reencoded.mp4');
const output = path.join(cwd, '06_预览输出', 'Concetto_2.0_AI超分操作演示_v27_九环路径精修光效_低清.mp4');
const preview = path.join(cwd, '06_预览输出', 'Concetto_2.0_AI超分操作演示_v27_九环路径精修光效_全片预览.jpg');
const workflowPreview = path.join(cwd, '06_预览输出', 'Concetto_2.0_AI超分操作演示_v27_九环段预览.jpg');
const logPath = path.join(cwd, '03_脚本与结构', 'Concetto 2.0_v27_九环路径精修光效说明.md');

fs.mkdirSync(outDir, { recursive: true });

function assertFile(p) {
  if (!fs.existsSync(p)) throw new Error(`missing file: ${p}`);
}

function run(bin, args, label) {
  const r = spawnSync(bin, args, { stdio: 'inherit' });
  if (r.status !== 0) throw new Error(`${label} failed with status ${r.status}`);
}

function runCapture(bin, args, label) {
  const r = spawnSync(bin, args, { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`${label} failed: ${r.stderr}`);
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

function dataUri(file) {
  const ext = path.extname(file).toLowerCase();
  const mime = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/png';
  return `data:${mime};base64,${fs.readFileSync(file).toString('base64')}`;
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

function easeInOut(t) {
  t = clamp(t);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function parseGeometry() {
  const text = fs.readFileSync(workflowSvg, 'utf8');
  const nodes = [];
  const nodeRe = /<circle cx="([0-9.]+)" cy="([0-9.]+)" r="65"/g;
  let m;
  while ((m = nodeRe.exec(text))) nodes.push({ x: +m[1], y: +m[2] });
  const cards = [];
  const cardRe = /<rect x="([0-9.]+)" y="([0-9.]+)" width="180" height="226" rx="34"/g;
  while ((m = cardRe.exec(text))) cards.push({ x: +m[1], y: +m[2], w: 180, h: 226 });
  if (nodes.length !== 9 || cards.length !== 9) throw new Error(`parse geometry failed: nodes=${nodes.length}, cards=${cards.length}`);
  return { nodes, cards };
}

const sourceGeom = parseGeometry();

function defs() {
  return `
  <defs>
    <radialGradient id="core" cx="50%" cy="56%" r="68%">
      <stop offset="0%" stop-color="#6d5cff" stop-opacity="0.34"/>
      <stop offset="44%" stop-color="#151137" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#010104" stop-opacity="1"/>
    </radialGradient>
    <linearGradient id="scanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#7668ff" stop-opacity="0"/>
      <stop offset="47%" stop-color="#ffffff" stop-opacity="0.70"/>
      <stop offset="100%" stop-color="#5ac7ff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#7c65ff"/>
      <stop offset="42%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#4ccfff"/>
    </linearGradient>
    <linearGradient id="thinFlow" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#6a53ff" stop-opacity="0"/>
      <stop offset="35%" stop-color="#8c7cff" stop-opacity="0.86"/>
      <stop offset="56%" stop-color="#ffffff" stop-opacity="1"/>
      <stop offset="78%" stop-color="#7ae8ff" stop-opacity="0.82"/>
      <stop offset="100%" stop-color="#6a53ff" stop-opacity="0"/>
    </linearGradient>
    <filter id="glow" x="-80%" y="-80%" width="260%" height="260%">
      <feDropShadow dx="0" dy="0" stdDeviation="5" flood-color="#ffffff" flood-opacity="0.58"/>
      <feDropShadow dx="0" dy="0" stdDeviation="16" flood-color="#8172ff" flood-opacity="0.66"/>
      <feDropShadow dx="0" dy="0" stdDeviation="34" flood-color="#3520a8" flood-opacity="0.54"/>
    </filter>
    <filter id="deepGlow" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="18" result="blur"/>
      <feColorMatrix in="blur" type="matrix" values="0.65 0 0 0 0.2  0 0.48 0 0 0.18  0 0 1 0 1  0 0 0 0.72 0"/>
    </filter>
    <filter id="softBlur"><feGaussianBlur stdDeviation="8"/></filter>
    <filter id="pinGlow" x="-120%" y="-120%" width="340%" height="340%">
      <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="#ffffff" flood-opacity="0.88"/>
      <feDropShadow dx="0" dy="0" stdDeviation="10" flood-color="#8b7cff" flood-opacity="0.78"/>
      <feDropShadow dx="0" dy="0" stdDeviation="22" flood-color="#45d8ff" flood-opacity="0.28"/>
    </filter>
    <mask id="edgeFade">
      <rect width="${W}" height="${H}" fill="white"/>
      <rect x="0" y="0" width="${W}" height="82" fill="black" opacity="0.18"/>
    </mask>
  </defs>`;
}

function stageGeom(t, dur) {
  const panel = easeOut(t / 1.05);
  const imgW = 1680 * (0.985 + 0.015 * panel);
  const imgH = imgW * 9 / 16;
  const imgX = (W - imgW) / 2;
  const imgY = (H - imgH) / 2 + 18 - 8 * panel;
  const sx = imgW / 2048;
  const sy = imgH / 1152;
  const mapPoint = (p) => ({ x: imgX + p.x * sx, y: imgY + p.y * sy });
  const nodes = sourceGeom.nodes.map(mapPoint);
  const cards = sourceGeom.cards.map((r) => ({ x: imgX + r.x * sx, y: imgY + r.y * sy, w: r.w * sx, h: r.h * sy }));
  // These curves are calibrated against the faint solid/dashed connector lines already
  // present in 九大环节总览_最新版.png. They intentionally do not connect node centers:
  // each segment follows the visible S-shaped path beside the cards, matching the user's
  // red-line annotation and avoiding text/card bodies.
  const sourceCurves = [
    { p0: { x: 296, y: 392 }, p1: { x: 342, y: 420 }, p2: { x: 308, y: 582 }, p3: { x: 365, y: 628 } },
    { p0: { x: 430, y: 626 }, p1: { x: 470, y: 585 }, p2: { x: 500, y: 478 }, p3: { x: 542, y: 425 } },
    { p0: { x: 706, y: 402 }, p1: { x: 735, y: 438 }, p2: { x: 738, y: 552 }, p3: { x: 770, y: 620 } },
    { p0: { x: 833, y: 620 }, p1: { x: 868, y: 565 }, p2: { x: 872, y: 458 }, p3: { x: 935, y: 394 } },
    { p0: { x: 1085, y: 392 }, p1: { x: 1142, y: 420 }, p2: { x: 1133, y: 578 }, p3: { x: 1185, y: 622 } },
    { p0: { x: 1254, y: 622 }, p1: { x: 1304, y: 575 }, p2: { x: 1289, y: 466 }, p3: { x: 1358, y: 398 } },
    { p0: { x: 1454, y: 401 }, p1: { x: 1492, y: 459 }, p2: { x: 1488, y: 548 }, p3: { x: 1530, y: 624 } },
    { p0: { x: 1620, y: 624 }, p1: { x: 1668, y: 574 }, p2: { x: 1682, y: 470 }, p3: { x: 1732, y: 425 } },
  ].map((c) => ({
    p0: mapPoint(c.p0),
    p1: mapPoint(c.p1),
    p2: mapPoint(c.p2),
    p3: mapPoint(c.p3),
  }));
  return { imgX, imgY, imgW, imgH, nodes, cards, curves: sourceCurves };
}

function cubic(c, u) {
  const t = clamp(u);
  const mt = 1 - t;
  return {
    x: mt ** 3 * c.p0.x + 3 * mt ** 2 * t * c.p1.x + 3 * mt * t ** 2 * c.p2.x + t ** 3 * c.p3.x,
    y: mt ** 3 * c.p0.y + 3 * mt ** 2 * t * c.p1.y + 3 * mt * t ** 2 * c.p2.y + t ** 3 * c.p3.y,
  };
}

function pathD(c) {
  return `M ${c.p0.x.toFixed(1)} ${c.p0.y.toFixed(1)} C ${c.p1.x.toFixed(1)} ${c.p1.y.toFixed(1)}, ${c.p2.x.toFixed(1)} ${c.p2.y.toFixed(1)}, ${c.p3.x.toFixed(1)} ${c.p3.y.toFixed(1)}`;
}

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function nearPathPulse(curve, u, local, falloff = 0.12) {
  return clamp(1 - Math.abs(local - u) / falloff);
}

function renderWorkflowSvg(t, dur = 7.6) {
  const a = smooth(0.10, 0.82, t) * (1 - smooth(dur - 0.55, dur, t));
  const imgUri = dataUri(workflowImage);
  const { imgX, imgY, imgW, imgH, nodes, cards, curves } = stageGeom(t, dur);
  const intro = easeOut(t / 1.25);
  const scan = -680 + (W + 1320) * (t / dur);
  const cx = W / 2;
  const cy = H / 2 + 6;
  const stageScale = 0.992 + 0.008 * intro;

  const segmentStart = 1.04;
  const segmentGap = 0.54;
  const segmentDur = 0.88;
  const activeIndex = clamp(Math.floor((t - segmentStart) / segmentGap), 0, 7);

  const basePaths = curves.map((c, i) => {
    const shimmer = 0.060 + 0.030 * Math.sin(t * 4.8 + i * 1.7);
    const dashOffset = ((t * 34 + i * 83) % 56).toFixed(1);
    return `<path d="${pathD(c)}" pathLength="1000" fill="none" stroke="#6f61ff" stroke-width="4.8" stroke-linecap="round" stroke-opacity="${(a * shimmer * 0.22).toFixed(3)}" filter="url(#glow)"/>
      <path d="${pathD(c)}" pathLength="1000" fill="none" stroke="#5c49e8" stroke-width="2.2" stroke-linecap="round" stroke-opacity="${(a * shimmer).toFixed(3)}"/>
      <path d="${pathD(c)}" pathLength="1000" fill="none" stroke="#ffffff" stroke-width="1.05" stroke-dasharray="7 14" stroke-dashoffset="${dashOffset}" stroke-linecap="round" stroke-opacity="${(a * 0.075).toFixed(3)}"/>`;
  }).join('');

  const activePaths = curves.map((c, i) => {
    const local = easeInOut((t - (segmentStart + i * segmentGap)) / segmentDur);
    const done = local >= 1;
    const started = local > 0;
    if (!started) return '';
    const dash = (local * 1000).toFixed(1);
    const draw = Math.min(1000, local * 1000);
    const headStart = Math.max(0, draw - 120).toFixed(1);
    const headLen = Math.min(150, draw).toFixed(1);
    const flicker = 0.78 + 0.14 * Math.sin(t * 13 + i * 0.9) + 0.08 * Math.sin(t * 31 + i);
    const opacity = a * (done ? 0.42 : 0.92) * flicker;
    return `<path d="${pathD(c)}" pathLength="1000" fill="none" stroke="#927dff" stroke-width="20" stroke-linecap="round" stroke-dasharray="${dash} 1000" stroke-opacity="${(opacity * 0.18).toFixed(3)}" filter="url(#glow)"/>
      <path d="${pathD(c)}" pathLength="1000" fill="none" stroke="#53ddff" stroke-width="8.5" stroke-linecap="round" stroke-dasharray="${headLen} 1000" stroke-dashoffset="${(-headStart).toFixed(1)}" stroke-opacity="${(opacity * 0.42).toFixed(3)}" filter="url(#pinGlow)"/>
      <path d="${pathD(c)}" pathLength="1000" fill="none" stroke="url(#flowGrad)" stroke-width="4.5" stroke-linecap="round" stroke-dasharray="${dash} 1000" stroke-opacity="${(opacity * 0.72).toFixed(3)}" filter="url(#glow)"/>
      <path d="${pathD(c)}" pathLength="1000" fill="none" stroke="url(#thinFlow)" stroke-width="2.1" stroke-linecap="round" stroke-dasharray="${headLen} 1000" stroke-dashoffset="${(-headStart).toFixed(1)}" stroke-opacity="${(opacity * 0.98).toFixed(3)}" filter="url(#pinGlow)"/>
      <path d="${pathD(c)}" pathLength="1000" fill="none" stroke="#ffffff" stroke-width="1.15" stroke-linecap="round" stroke-dasharray="${Math.max(0, local * 1000 - 54).toFixed(1)} 1000" stroke-opacity="${(opacity * 0.58).toFixed(3)}"/>`;
  }).join('');

  const pathDots = curves.map((c, i) => {
    const localRaw = (t - (segmentStart + i * segmentGap)) / segmentDur;
    const local = easeInOut(clamp(localRaw));
    const dots = [0.18, 0.36, 0.64, 0.83];
    return dots.map((u, j) => {
      const p = cubic(c, u);
      const hit = nearPathPulse(c, u, local, 0.105);
      const idle = 0.32 + 0.18 * Math.sin(t * 6.2 + i * 1.8 + j);
      const opacity = a * (0.11 + idle * 0.10 + hit * 0.68);
      const r = 2.2 + hit * 6.4 + idle * 0.8;
      return `<g opacity="${opacity.toFixed(3)}">
        <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${(r + hit * 12).toFixed(1)}" fill="#8d7aff" opacity="${(0.12 + hit * 0.12).toFixed(3)}" filter="url(#glow)"/>
        <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${r.toFixed(1)}" fill="#ffffff" opacity="${(0.70 + hit * 0.28).toFixed(3)}" filter="url(#pinGlow)"/>
      </g>`;
    }).join('');
  }).join('');

  const sparks = curves.map((c, i) => {
    const localRaw = (t - (segmentStart + i * segmentGap)) / segmentDur;
    if (localRaw < 0 || localRaw > 1.16) return '';
    const local = easeInOut(clamp(localRaw));
    const p = cubic(c, local);
    const trail1 = cubic(c, Math.max(0, local - 0.045));
    const trail2 = cubic(c, Math.max(0, local - 0.09));
    const flicker = 0.78 + 0.22 * Math.sin(t * 24 + i);
    const side = Math.sin(t * 20 + i * 3.1);
    return `<g opacity="${(a * flicker).toFixed(3)}">
      <path d="M ${trail2.x.toFixed(1)} ${trail2.y.toFixed(1)} Q ${trail1.x.toFixed(1)} ${trail1.y.toFixed(1)} ${p.x.toFixed(1)} ${p.y.toFixed(1)}" fill="none" stroke="#ffffff" stroke-opacity="0.68" stroke-width="3.2" stroke-linecap="round" filter="url(#glow)"/>
      <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${(8 + 2.5 * side).toFixed(1)}" fill="#ffffff" opacity="0.94" filter="url(#pinGlow)"/>
      <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="36" fill="#a985ff" opacity="0.22" filter="url(#glow)"/>
      <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="56" fill="none" stroke="#ffffff" stroke-width="1.4" stroke-opacity="0.20" filter="url(#glow)"/>
      <circle cx="${(p.x + 22 * Math.cos(t * 10 + i)).toFixed(1)}" cy="${(p.y + 16 * Math.sin(t * 9 + i)).toFixed(1)}" r="2.5" fill="#dff7ff" opacity="0.75"/>
      <circle cx="${(p.x - 28 * Math.sin(t * 11 + i)).toFixed(1)}" cy="${(p.y + 18 * Math.cos(t * 8 + i)).toFixed(1)}" r="1.9" fill="#b493ff" opacity="0.65"/>
    </g>`;
  }).join('');

  const moduleGlows = nodes.map((n, i) => {
    const on = smooth(segmentStart - 0.18 + i * segmentGap, segmentStart + 0.28 + i * segmentGap, t);
    if (on <= 0.001) return '';
    const settle = 1 - smooth(segmentStart + 0.78 + i * segmentGap, segmentStart + 1.45 + i * segmentGap, t);
    const pulse = 0.55 + 0.45 * Math.sin(t * 5.7 + i * 1.13);
    const impact = smooth(segmentStart - 0.08 + i * segmentGap, segmentStart + 0.14 + i * segmentGap, t) * (1 - smooth(segmentStart + 0.14 + i * segmentGap, segmentStart + 0.52 + i * segmentGap, t));
    const r = cards[i];
    return `<g opacity="${(a * on).toFixed(3)}">
      <rect x="${r.x.toFixed(1)}" y="${r.y.toFixed(1)}" width="${r.w.toFixed(1)}" height="${r.h.toFixed(1)}" rx="${(30 * r.w / 180).toFixed(1)}" fill="none" stroke="#ffffff" stroke-width="${(1.2 + impact * 1.4).toFixed(2)}" stroke-opacity="${(0.12 + 0.20 * settle + 0.38 * impact).toFixed(3)}" filter="url(#glow)"/>
      <rect x="${(r.x + r.w * 0.05).toFixed(1)}" y="${(r.y + r.h * 0.07).toFixed(1)}" width="${(r.w * 0.90).toFixed(1)}" height="${(r.h * 0.86).toFixed(1)}" rx="${(23 * r.w / 180).toFixed(1)}" fill="none" stroke="#836dff" stroke-width="1.2" stroke-opacity="${(0.22 + 0.20 * pulse).toFixed(3)}"/>
      <rect x="${(r.x - r.w * 0.035).toFixed(1)}" y="${(r.y - r.h * 0.025).toFixed(1)}" width="${(r.w * 1.07).toFixed(1)}" height="${(r.h * 1.05).toFixed(1)}" rx="${(32 * r.w / 180).toFixed(1)}" fill="none" stroke="#7de8ff" stroke-width="${(1.0 + impact * 1.2).toFixed(2)}" stroke-dasharray="${(70 + impact * 90).toFixed(1)} 520" stroke-dashoffset="${(-(t * 72 + i * 45)).toFixed(1)}" stroke-opacity="${(0.09 + impact * 0.36 + pulse * 0.07).toFixed(3)}" filter="url(#pinGlow)"/>
      <circle cx="${n.x.toFixed(1)}" cy="${n.y.toFixed(1)}" r="${(58 + impact * 30 + pulse * 7).toFixed(1)}" fill="#846bff" opacity="${(0.13 + impact * 0.18 + pulse * 0.04).toFixed(3)}" filter="url(#glow)"/>
      <circle cx="${n.x.toFixed(1)}" cy="${n.y.toFixed(1)}" r="${(40 + impact * 12).toFixed(1)}" fill="none" stroke="#ffffff" stroke-width="${(1.1 + impact * 1.2).toFixed(2)}" stroke-opacity="${(0.15 + impact * 0.46).toFixed(3)}" filter="url(#glow)"/>
      <circle cx="${n.x.toFixed(1)}" cy="${n.y.toFixed(1)}" r="${(70 + impact * 46).toFixed(1)}" fill="none" stroke="#8f7aff" stroke-width="1.5" stroke-opacity="${(impact * 0.20).toFixed(3)}" filter="url(#glow)"/>
      <rect x="${(r.x - r.w * 0.06 + r.w * (pulse - 0.5) * 0.15).toFixed(1)}" y="${(r.y + r.h * 0.12).toFixed(1)}" width="${(r.w * 1.12).toFixed(1)}" height="${(r.h * 0.20).toFixed(1)}" transform="skewX(-18)" fill="url(#scanGrad)" opacity="${(0.055 + impact * 0.10).toFixed(3)}"/>
    </g>`;
  }).join('');

  const finalRipple = smooth(segmentStart + 8 * segmentGap - 0.4, segmentStart + 8 * segmentGap + 0.55, t) * (1 - smooth(dur - 1.1, dur - 0.35, t));

  return `<?xml version="1.0" encoding="UTF-8"?>
  <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    ${defs()}
    <rect width="${W}" height="${H}" fill="#010104"/>
    <rect width="${W}" height="${H}" fill="url(#core)" opacity="${(0.80 * a).toFixed(3)}"/>
    <path d="M 112 836 C 520 748, 1180 780, 1808 690" stroke="#7668ff" stroke-opacity="${(0.18 * a).toFixed(3)}" stroke-width="1.1" fill="none"/>
    <path d="M 0 970 C 420 892, 710 1042, 1096 970 S 1650 860, 1920 940" stroke="#ffffff" stroke-opacity="${(0.055 * a).toFixed(3)}" stroke-width="2.2" fill="none"/>
    <rect x="${scan.toFixed(1)}" y="-80" width="620" height="${H + 160}" transform="skewX(-18)" fill="url(#scanGrad)" opacity="${(0.070 * a).toFixed(3)}"/>
    <text x="112" y="116" font-family="Avenir Next, Arial" font-size="15" letter-spacing="7" fill="#857be8" opacity="${(0.54 * a).toFixed(3)}">CONCETTO 2.0 / COMPLETE WORKFLOW</text>
    <rect x="112" y="137" width="${(298 * a).toFixed(1)}" height="1.2" fill="#7668ff" opacity="0.42"/>
    <g opacity="${a.toFixed(3)}" transform="translate(${cx} ${cy}) scale(${stageScale.toFixed(4)}) translate(${-cx} ${-cy})">
      <rect x="${(imgX - 18).toFixed(1)}" y="${(imgY - 18).toFixed(1)}" width="${(imgW + 36).toFixed(1)}" height="${(imgH + 36).toFixed(1)}" rx="34" fill="#110c2c" opacity="0.82"/>
      <rect x="${(imgX - 16).toFixed(1)}" y="${(imgY - 16).toFixed(1)}" width="${(imgW + 32).toFixed(1)}" height="${(imgH + 32).toFixed(1)}" rx="32" fill="none" stroke="#8271ff" stroke-opacity="0.22" filter="url(#glow)"/>
      <image href="${imgUri}" x="${imgX.toFixed(1)}" y="${imgY.toFixed(1)}" width="${imgW.toFixed(1)}" height="${imgH.toFixed(1)}" preserveAspectRatio="xMidYMid meet" opacity="0.965"/>
    </g>
    <g opacity="${a.toFixed(3)}" transform="translate(${cx} ${cy}) scale(${stageScale.toFixed(4)}) translate(${-cx} ${-cy})" mask="url(#edgeFade)">
      ${basePaths}
      ${activePaths}
      ${pathDots}
      ${moduleGlows}
      ${sparks}
      <ellipse cx="${cx}" cy="${(cy + 138).toFixed(1)}" rx="${(finalRipple * 520).toFixed(1)}" ry="${(finalRipple * 100).toFixed(1)}" fill="none" stroke="#ffffff" stroke-width="2.4" stroke-opacity="${(0.22 * finalRipple * a).toFixed(3)}" filter="url(#glow)"/>
      <ellipse cx="${cx}" cy="${(cy + 138).toFixed(1)}" rx="${(finalRipple * 690).toFixed(1)}" ry="${(finalRipple * 132).toFixed(1)}" fill="none" stroke="#856dff" stroke-width="5.2" stroke-opacity="${(0.12 * finalRipple * a).toFixed(3)}" filter="url(#glow)"/>
    </g>
  </svg>`;
}

async function renderWorkflowClip() {
  const dur = 7.6;
  const count = Math.round(dur * FPS);
  fs.rmSync(frameDir, { recursive: true, force: true });
  fs.mkdirSync(frameDir, { recursive: true });
  for (let i = 0; i < count; i++) {
    const t = i / FPS;
    const out = path.join(frameDir, `frame_${String(i).padStart(4, '0')}.png`);
    await sharp(Buffer.from(renderWorkflowSvg(t, dur))).png().toFile(out);
  }
  run(ffmpeg, [
    '-y', '-framerate', String(FPS), '-i', path.join(frameDir, 'frame_%04d.png'),
    '-vf', `fade=t=in:st=0:d=0.16,fade=t=out:st=${(dur - 0.34).toFixed(2)}:d=0.34,format=yuv420p`,
    '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-movflags', '+faststart',
    workflowClip,
  ], 'render workflow v27');
  return workflowClip;
}

async function assemble() {
  for (const p of [ffmpeg, ffprobe, music, workflowImage, workflowSvg, sourceList]) assertFile(p);
  await renderWorkflowClip();
  const parts = readConcatList(sourceList).map((p) => /intro_workflow_overview_v\d+\.mp4$/.test(p) ? workflowClip : p);
  fs.writeFileSync(concatList, parts.map((p) => `file '${quoteFile(p)}'`).join('\n') + '\n');
  run(ffmpeg, [
    '-y', '-f', 'concat', '-safe', '0', '-i', concatList,
    '-vf', `scale=${W}:${H}:force_original_aspect_ratio=decrease:flags=lanczos,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:color=black,fps=${FPS},format=yuv420p,setpts=PTS-STARTPTS`,
    '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-movflags', '+faststart',
    videoOnly,
  ], 'concat v27');
  const total = probeDur(videoOnly);
  run(ffmpeg, [
    '-y', '-i', videoOnly, '-stream_loop', '-1', '-i', music,
    '-filter_complex', `[1:a]atrim=0:${total.toFixed(3)},afade=t=in:st=0:d=1.2,afade=t=out:st=${Math.max(0, total - 3).toFixed(3)}:d=3,volume=0.72[a]`,
    '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', '-shortest', output,
  ], 'mux v27');
  run(ffmpeg, ['-y', '-i', output, '-vf', 'fps=0.24,scale=360:-1,tile=10x7', '-frames:v', '1', preview], 'preview v27');
  run(ffmpeg, ['-y', '-i', workflowClip, '-vf', 'fps=1,scale=480:-1,tile=8x1', '-frames:v', '1', workflowPreview], 'workflow preview v27');
  fs.writeFileSync(logPath, [
    '# Concetto 2.0 v27 九环路径精修光效',
    '',
    `- 输出视频：\`${path.relative(cwd, output)}\``,
    `- 单独九环片段：\`${path.relative(cwd, workflowClip)}\``,
    '- 使用 `九大环节最新版/九大环节总览_最新版.png` 作为底图，未改动图片内文字与图标；',
    '- 沿用 v26 的 8 段原图路径校准，使流光贴合原图中已有的淡紫色实线/虚线连接路径；',
    '- 精修底层虚线、电流头部高光、路径圆点脉冲、模块卡片游走描边、图标外圈扩散与最终能量回响；',
    '- 仅替换九大环节总览段，其余 v24 内容保持不变。',
    '',
  ].join('\n'));
  console.log(`DONE ${output}`);
}

assemble().catch((err) => {
  console.error(err);
  process.exit(1);
});
