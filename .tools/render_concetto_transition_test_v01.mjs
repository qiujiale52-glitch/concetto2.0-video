import fs from 'fs';
import path from 'path';
import sharp from './thumbs/node_modules/sharp/dist/index.mjs';

const cwd = process.cwd();
const W = 1920;
const H = 1080;
const fps = 30;
const openingFrames = path.join(cwd, '06_预览输出', 'opening_v01_frames');
const outDir = path.join(cwd, '06_预览输出', 'transition_test_v01_frames');
fs.mkdirSync(outDir, { recursive: true });

const assets = {
  logo: path.join(cwd, '.tools/transition_test_assets/logo.png'),
  workflow: path.join(cwd, '.tools/transition_test_assets/workflow.jpg'),
  frontCard: path.join(cwd, '.tools/transition_test_assets/frontCard.png'),
  report1: path.join(cwd, '.tools/transition_test_assets/report1.jpg'),
  report2: path.join(cwd, '.tools/transition_test_assets/report2.jpg'),
  report3: path.join(cwd, '.tools/transition_test_assets/report3.jpg'),
  mapFrame: path.join(cwd, '.tools/transition_test_assets/mapFrame.jpg'),
  uiFrame: path.join(cwd, '.tools/transition_test_assets/uiFrame.jpg'),
};

const b64 = {};
for (const [k, p] of Object.entries(assets)) {
  b64[k] = fs.readFileSync(p).toString('base64');
}

function mime(p) {
  return /\.jpe?g$/i.test(p) ? 'image/jpeg' : 'image/png';
}

function data(name) {
  return `data:${mime(assets[name])};base64,${b64[name]}`;
}

function clamp(v, a = 0, b = 1) {
  return Math.max(a, Math.min(b, v));
}

function smoothstep(a, b, x) {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
}

function easeOut(x) {
  const t = clamp(x);
  return 1 - Math.pow(1 - t, 3);
}

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function imageTag(name, x, y, w, h, opacity = 1, extra = '') {
  return `<image href="${data(name)}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" opacity="${opacity}" ${extra}/>`;
}

function glowText(text, x, y, size, opacity = 1, weight = 600, letter = 0) {
  return `
  <text x="${x}" y="${y}" text-anchor="middle" font-family="PingFang SC, Hiragino Sans GB, Avenir Next, Arial, sans-serif" font-size="${size}" font-weight="${weight}" letter-spacing="${letter}" fill="#d9d4ff" opacity="${(opacity * 0.32).toFixed(3)}" filter="url(#blur6)">${esc(text)}</text>
  <text x="${x}" y="${y}" text-anchor="middle" font-family="PingFang SC, Hiragino Sans GB, Avenir Next, Arial, sans-serif" font-size="${size}" font-weight="${weight}" letter-spacing="${letter}" fill="#f2f0ff" opacity="${opacity.toFixed(3)}">${esc(text)}</text>`;
}

function panel(x, y, w, h, r, opacity = 1) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="#080713" opacity="${(0.78 * opacity).toFixed(3)}" stroke="#8d7cff" stroke-opacity="${(0.24 * opacity).toFixed(3)}" stroke-width="1.2" filter="url(#panelShadow)"/>`;
}

function bg(t) {
  const pulse = 0.14 + 0.04 * Math.sin(t * 0.8);
  const scan = -400 + (W + 800) * ((t * 0.035) % 1);
  return `
  <rect width="${W}" height="${H}" fill="#010104"/>
  <rect width="${W}" height="${H}" fill="url(#core)" opacity="${pulse.toFixed(3)}"/>
  <rect x="${scan.toFixed(1)}" y="0" width="520" height="${H}" transform="skewX(-18)" fill="url(#scanGrad)" opacity="0.09"/>
  <path d="M 170 770 C 610 694, 1250 710, 1750 625" stroke="#7668ff" stroke-opacity="0.11" stroke-width="1.2" fill="none"/>
  <path d="M 280 300 C 720 250, 1170 270, 1660 210" stroke="#ffffff" stroke-opacity="0.045" stroke-width="1" fill="none"/>
  `;
}

function defs() {
  return `
  <defs>
    <radialGradient id="core" cx="50%" cy="52%" r="58%">
      <stop offset="0%" stop-color="#7b67ff" stop-opacity="0.72"/>
      <stop offset="45%" stop-color="#1c1643" stop-opacity="0.38"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="scanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="50%" stop-color="#cfc9ff" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#7668ff" stop-opacity="0"/>
      <stop offset="48%" stop-color="#ffffff" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="#7668ff" stop-opacity="0"/>
    </linearGradient>
    <filter id="blur6"><feGaussianBlur stdDeviation="6"/></filter>
    <filter id="blur18"><feGaussianBlur stdDeviation="18"/></filter>
    <filter id="panelShadow" x="-35%" y="-35%" width="170%" height="170%">
      <feDropShadow dx="0" dy="0" stdDeviation="22" flood-color="#6658ff" flood-opacity="0.32"/>
    </filter>
    <filter id="softGlow" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="0" stdDeviation="12" flood-color="#9b8dff" flood-opacity="0.42"/>
    </filter>
    <clipPath id="workflowClip"><rect x="270" y="186" width="1380" height="776" rx="36"/></clipPath>
    <clipPath id="frontClip"><rect x="688" y="330" width="544" height="304" rx="32"/></clipPath>
    <clipPath id="uiClip"><rect x="335" y="265" width="1250" height="664" rx="34"/></clipPath>
    <clipPath id="mapClip"><rect x="1135" y="350" width="520" height="300" rx="26"/></clipPath>
  </defs>`;
}

function renderContinuation(t) {
  // t is seconds after opening, from 0 to 16.5
  const svgParts = [];
  svgParts.push(`<?xml version="1.0" encoding="UTF-8"?><svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`);
  svgParts.push(defs());
  svgParts.push(bg(t + 9));

  // 0-2s: opening line becomes workflow stage
  const logoFade = 1 - smoothstep(0.25, 1.7, t);
  const lineGrow = smoothstep(0.1, 1.6, t);
  if (logoFade > 0.01) {
    svgParts.push(`<image href="${data('logo')}" x="580" y="444" width="760" opacity="${(0.82 * logoFade).toFixed(3)}" filter="url(#softGlow)"/>`);
    svgParts.push(`<text x="960" y="620" text-anchor="middle" font-family="Avenir Next, Arial" font-size="72" fill="#d8d2ff" opacity="${(0.55 * logoFade).toFixed(3)}" letter-spacing="8">2.0</text>`);
  }
  svgParts.push(`<rect x="${(960 - 690 * lineGrow).toFixed(1)}" y="525" width="${(1380 * lineGrow).toFixed(1)}" height="1.4" fill="url(#lineGrad)" opacity="${(0.95 * smoothstep(0.0, 1.1, t) * (1 - 0.4 * smoothstep(3.0, 6.0, t))).toFixed(3)}"/>`);

  // 1.2-6.5s: workflow overview as dark-stage floating panel
  const wfIn = smoothstep(1.05, 2.7, t);
  const wfOut = 1 - smoothstep(7.0, 8.6, t);
  const wfA = wfIn * wfOut;
  if (wfA > 0.01) {
    const z = 1.0 + 0.045 * easeOut((t - 1.2) / 5.8);
    const w = 1380 * z, h = 776 * z;
    const x = 960 - w / 2, y = 186 - 18 * wfIn + (776 - h) / 2;
    svgParts.push(panel(x - 16, y - 16, w + 32, h + 32, 42, wfA));
    svgParts.push(`<g clip-path="url(#workflowClip)" opacity="${(0.88 * wfA).toFixed(3)}" transform="translate(${(x - 270).toFixed(1)} ${(y - 186).toFixed(1)}) scale(${z.toFixed(4)})">`);
    svgParts.push(imageTag('workflow', 270, 186, 1380, 776, 0.9));
    svgParts.push(`</g>`);
    // Dark overlay makes it fit the opening tone
    svgParts.push(`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="36" fill="#070610" opacity="${(0.28 * wfA).toFixed(3)}"/>`);
    // Node highlight around "front analysis" left node
    const nodePulse = smoothstep(3.2, 4.4, t) * (1 - smoothstep(6.8, 8.2, t));
    const nx = x + 144 * z, ny = y + 318 * z;
    svgParts.push(`<circle cx="${nx.toFixed(1)}" cy="${ny.toFixed(1)}" r="${(68 + 18 * Math.sin(t * 5)).toFixed(1)}" fill="#806fff" opacity="${(0.20 * nodePulse).toFixed(3)}" filter="url(#blur18)"/>`);
    svgParts.push(`<circle cx="${nx.toFixed(1)}" cy="${ny.toFixed(1)}" r="${(72).toFixed(1)}" fill="none" stroke="#ffffff" stroke-opacity="${(0.82 * nodePulse).toFixed(3)}" stroke-width="2.2"/>`);
    svgParts.push(`<path d="M ${nx.toFixed(1)} ${ny.toFixed(1)} C 530 210, 720 165, 960 170" stroke="#c8c0ff" stroke-opacity="${(0.58 * nodePulse).toFixed(3)}" stroke-width="1.4" fill="none"/>`);
    svgParts.push(glowText('一条工作流，串联方案全过程', 960, 126, 42, smoothstep(2.2, 3.2, t) * wfOut, 600, 1.2));
    svgParts.push(`<text x="960" y="880" text-anchor="middle" font-family="Avenir Next, Arial" font-size="18" letter-spacing="7" fill="#9f95df" opacity="${(0.65 * smoothstep(3.2, 4.2, t) * wfOut).toFixed(3)}">FROM ANALYSIS TO DESIGN</text>`);
  }

  // 8.0-16.5s: front analysis transition
  const fa = smoothstep(7.7, 9.0, t);
  if (fa > 0.01) {
    // background docs drift
    const docA = fa * (1 - 0.28 * smoothstep(14.5, 16.3, t));
    const drift = easeOut((t - 7.8) / 6);
    const docs = [
      ['report1', 128 - 55 * drift, 230 + 18 * Math.sin(t), 390, 250, -8],
      ['report2', 1370 + 45 * drift, 210, 390, 250, 7],
      ['report3', 100 + 35 * drift, 660, 390, 250, 5],
      ['mapFrame', 1320 - 26 * drift, 690, 360, 210, -4],
    ];
    for (const [name, x, y, w, h, rot] of docs) {
      svgParts.push(`<g transform="translate(${x} ${y}) rotate(${rot})" opacity="${(0.22 * docA).toFixed(3)}">`);
      svgParts.push(`<rect x="-8" y="-8" width="${w + 16}" height="${h + 16}" rx="18" fill="#0b0919" stroke="#8d7cff" stroke-opacity="0.16"/>`);
      svgParts.push(imageTag(name, 0, 0, w, h, 1));
      svgParts.push(`</g>`);
    }

    // central front analysis card appears first
    const cardIn = smoothstep(8.2, 9.5, t);
    const cardOut = 1 - smoothstep(12.8, 14.2, t);
    const cardA = cardIn * cardOut;
    if (cardA > 0.01) {
      const scale = 1.02 + 0.08 * easeOut((t - 8.2) / 2.5);
      const x = 960 - 544 * scale / 2, y = 330 - 304 * (scale - 1) / 2;
      svgParts.push(`<g opacity="${cardA.toFixed(3)}">`);
      svgParts.push(`<rect x="${(x - 18).toFixed(1)}" y="${(y - 18).toFixed(1)}" width="${(544 * scale + 36).toFixed(1)}" height="${(304 * scale + 36).toFixed(1)}" rx="40" fill="#120d2a" stroke="#a696ff" stroke-opacity="0.26" filter="url(#panelShadow)"/>`);
      svgParts.push(`<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${scale.toFixed(3)})">`);
      svgParts.push(imageTag('frontCard', 0, 0, 544, 304, 1));
      svgParts.push(`</g></g>`);
    }

    // It resolves into a UI panel with strategy/data text
    const uiIn = smoothstep(12.6, 14.1, t);
    const uiA = uiIn;
    if (uiA > 0.01) {
      svgParts.push(panel(320, 250, 1280, 700, 38, uiA));
      svgParts.push(`<g clip-path="url(#uiClip)" opacity="${(0.82 * uiA).toFixed(3)}">`);
      svgParts.push(imageTag('uiFrame', 335, 265, 1250, 664, 0.82));
      svgParts.push(`<rect x="335" y="265" width="1250" height="664" fill="#05040b" opacity="0.20"/>`);
      svgParts.push(`</g>`);
      svgParts.push(`<rect x="335" y="265" width="1250" height="664" rx="34" fill="none" stroke="#b7aaff" stroke-opacity="${(0.28 * uiA).toFixed(3)}"/>`);
      svgParts.push(`<g opacity="${uiA.toFixed(3)}">`);
      svgParts.push(`<rect x="398" y="335" width="460" height="66" rx="18" fill="#111026" stroke="#8b7dff" stroke-opacity="0.26"/>`);
      svgParts.push(`<text x="430" y="377" font-family="PingFang SC, Hiragino Sans GB, Arial" font-size="28" font-weight="600" fill="#f0edff">前策分析</text>`);
      svgParts.push(`<text x="430" y="430" font-family="PingFang SC, Hiragino Sans GB, Arial" font-size="20" fill="#bdb6ea">从任务书解读，到区位、现状、案例与策略生成</text>`);
      svgParts.push(`<rect x="400" y="490" width="280" height="44" rx="12" fill="#7668ff" opacity="0.18"/><text x="428" y="520" font-family="PingFang SC, Arial" font-size="19" fill="#e9e5ff">任务理解</text>`);
      svgParts.push(`<rect x="700" y="490" width="280" height="44" rx="12" fill="#7668ff" opacity="0.18"/><text x="728" y="520" font-family="PingFang SC, Arial" font-size="19" fill="#e9e5ff">场地判断</text>`);
      svgParts.push(`<rect x="1000" y="490" width="280" height="44" rx="12" fill="#7668ff" opacity="0.18"/><text x="1028" y="520" font-family="PingFang SC, Arial" font-size="19" fill="#e9e5ff">策略输出</text>`);
      svgParts.push(`</g>`);
    }

    const titleA = smoothstep(10.0, 11.0, t) * (1 - smoothstep(13.2, 14.0, t));
    svgParts.push(glowText('从空白开始之前，先让系统理解场地', 960, 145, 38, titleA, 600, 1.1));
  }

  // top status
  const statusA = smoothstep(1.8, 2.8, t) * (1 - smoothstep(15.4, 16.5, t));
  svgParts.push(`<text x="112" y="78" font-family="Avenir Next, Arial" font-size="17" letter-spacing="5" fill="#837acf" opacity="${(0.68 * statusA).toFixed(3)}">CONCETTO 2.0 / WORKFLOW PREVIEW</text>`);
  svgParts.push(`<rect x="112" y="96" width="${(260 * statusA).toFixed(1)}" height="1" fill="#7668ff" opacity="0.42"/>`);

  svgParts.push(`</svg>`);
  return svgParts.join('\n');
}

// Copy confirmed opening frames first
const openingCount = 270;
for (let i = 0; i < openingCount; i++) {
  const src = path.join(openingFrames, `frame_${String(i).padStart(4, '0')}.png`);
  const dst = path.join(outDir, `frame_${String(i).padStart(4, '0')}.png`);
  if (!fs.existsSync(dst)) fs.copyFileSync(src, dst);
}

// Render continuation frames
const contDuration = 16.5;
const contFrames = Math.round(contDuration * fps);
for (let i = 0; i < contFrames; i++) {
  const t = i / fps;
  const svg = Buffer.from(renderContinuation(t));
  const out = path.join(outDir, `frame_${String(openingCount + i).padStart(4, '0')}.png`);
  await sharp(svg).png().toFile(out);
}

console.log(outDir);
