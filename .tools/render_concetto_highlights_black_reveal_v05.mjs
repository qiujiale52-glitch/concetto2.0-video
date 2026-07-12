import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import sharp from './thumbs/node_modules/sharp/dist/index.mjs';

const cwd = process.cwd();
const ffmpeg = path.join(cwd, '.tools/media-bin/node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg');
const source = path.join(cwd, '亮点', '亮点黑底静态稿_v01.png');
const music = path.join(cwd, '04-正版授权音乐库', '未来科技宽广磅礴音乐15437.wav');
const outDir = path.join(cwd, '06_预览输出', 'highlights_black_reveal_v05_parts');
const frameDir = path.join(outDir, 'frames');
const previewMode = process.env.RENDER_MODE === 'preview';
const W = previewMode ? 1280 : 2560;
const H = previewMode ? 720 : 1440;
const FPS = previewMode ? 30 : 60;
const visualOutput = path.join(outDir, previewMode ? 'highlight_independent_breath_v05_preview_video_only.mp4' : 'highlight_independent_breath_v05_2560p60_video_only.mp4');
const output = path.join(cwd, '06_预览输出', previewMode ? 'Concetto_2.0_升级亮点_分层独立呼吸_v05_低清预览.mp4' : 'Concetto_2.0_升级亮点_分层独立呼吸_v05_2560p60.mp4');
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
    <radialGradient id="sceneAura" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#7562ff" stop-opacity="0.28"/>
      <stop offset="44%" stop-color="#4b3ac4" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="#100a35" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="cyanAura" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#6bdfff" stop-opacity="0.18"/>
      <stop offset="52%" stop-color="#4b75ff" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="#0b183b" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="breathLine" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#6550ff" stop-opacity="0"/>
      <stop offset="34%" stop-color="#8675ff" stop-opacity="0.18"/>
      <stop offset="50%" stop-color="#ffffff" stop-opacity="0.52"/>
      <stop offset="66%" stop-color="#72dfff" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="#6550ff" stop-opacity="0"/>
    </linearGradient>
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
    <filter id="lightTextAura" x="-30%" y="-80%" width="160%" height="260%" color-interpolation-filters="sRGB">
      <feColorMatrix type="luminanceToAlpha" result="lightMask"/>
      <feGaussianBlur in="lightMask" stdDeviation="2.2" result="lightCore"/>
      <feGaussianBlur in="lightMask" stdDeviation="7.5" result="lightWide"/>
      <feFlood flood-color="#ffffff" flood-opacity="0.72" result="whiteFlood"/>
      <feComposite in="whiteFlood" in2="lightCore" operator="in" result="whiteGlow"/>
      <feFlood flood-color="#7968ff" flood-opacity="0.66" result="violetFlood"/>
      <feComposite in="violetFlood" in2="lightWide" operator="in" result="violetGlow"/>
      <feMerge><feMergeNode in="violetGlow"/><feMergeNode in="whiteGlow"/></feMerge>
    </filter>
    <filter id="darkTextAura" x="-24%" y="-45%" width="148%" height="190%" color-interpolation-filters="sRGB">
      <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -0.2126 -0.7152 -0.0722 0 1" result="darkMask"/>
      <feGaussianBlur in="darkMask" stdDeviation="1.35" result="darkCore"/>
      <feGaussianBlur in="darkMask" stdDeviation="4.8" result="darkWide"/>
      <feFlood flood-color="#ffffff" flood-opacity="0.54" result="textWhite"/>
      <feComposite in="textWhite" in2="darkCore" operator="in" result="textCore"/>
      <feFlood flood-color="#7664ff" flood-opacity="0.44" result="textViolet"/>
      <feComposite in="textViolet" in2="darkWide" operator="in" result="textWide"/>
      <feMerge><feMergeNode in="textWide"/><feMergeNode in="textCore"/></feMerge>
    </filter>
  </defs>`;
}

function sourceGeometry(meta) {
  const targetW = W * (1760 / 1920);
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
    textX: geometry.x + rect.textX * sx,
    textY: geometry.y + rect.textY * sy,
    textW: rect.textW * sx,
    textH: rect.textH * sy,
  };
}

function renderSvg(t, meta, uri) {
  const geometry = sourceGeometry(meta);
  const sx = W / 1920;
  const sy = H / 1080;
  const imgSx = geometry.w / meta.width;
  const imgSy = geometry.h / meta.height;
  const globalIn = smooth(0.02, 0.42, t);
  const globalOut = 1 - smooth(DUR - 0.55, DUR, t);
  const globalA = globalIn * globalOut;
  const breathGate = smooth(1.65, 3.20, t) * globalOut;
  const sceneBreath = 0.5 + 0.5 * Math.sin(t * 0.86 - 1.15);
  const sceneBreath2 = 0.5 + 0.5 * Math.sin(t * 0.57 + 1.72);
  const sceneScale = 0.998 + 0.0065 * sceneBreath * breathGate;
  const sceneX = (W / 2) * (1 - sceneScale);
  const sceneY = (H / 2) * (1 - sceneScale) - 1.8 * sceneBreath2 * breathGate;
  const purpleField = (0.028 + 0.030 * sceneBreath) * breathGate * globalA;
  const cyanField = (0.018 + 0.022 * sceneBreath2) * breathGate * globalA;
  const titleA = smooth(0.34, 1.28, t) * globalOut;
  const titleWipe = easeOut((t - 0.30) / 1.82);
  const titleHold = smooth(1.42, 1.92, t) * globalOut;
  const titleSweepX = geometry.x - 520 + (geometry.w + 1040) * clamp((t - 0.12) / 2.42);
  const titlePulse = 0.5 + 0.5 * Math.sin(t * 2.1);
  const sparkleIn = smooth(1.48, 2.05, t) * globalOut;
  const titleMist = smooth(0.10, 0.78, t) * (1 - smooth(1.75, 2.55, t)) * globalOut;
  const brandBreath = 0.5 + 0.5 * Math.sin(t * 0.92 + 0.25);
  const versionBreath = 0.5 + 0.5 * Math.sin(t * 1.18 + 1.55);
  const cnTitleBreath = 0.5 + 0.5 * Math.sin(t * 0.78 + 2.42);
  const subtitleBreath = 0.5 + 0.5 * Math.sin(t * 0.63 + 3.12);
  const sparkleBreath = Math.pow(0.5 + 0.5 * Math.sin(t * 1.72 + 0.82), 1.45);

  const sourceCards = [
    { x: 128, y: 258, w: 696, h: 294, iconX: 214, iconY: 338, textX: 286, textY: 322, textW: 330, textH: 178, start: 1.42 },
    { x: 842, y: 258, w: 694, h: 294, iconX: 934, iconY: 338, textX: 998, textY: 322, textW: 310, textH: 178, start: 1.58 },
    { x: 128, y: 566, w: 696, h: 308, iconX: 214, iconY: 648, textX: 286, textY: 626, textW: 250, textH: 166, start: 1.58 },
    { x: 842, y: 566, w: 694, h: 308, iconX: 934, iconY: 648, textX: 998, textY: 626, textW: 270, textH: 168, start: 1.42 },
  ];
  const cards = sourceCards.map((rect) => mapRect(rect, geometry, meta));

  const cardDefs = cards.map((r, i) => {
    const diagonal = Math.hypot(r.w, r.h);
    const reveal = easeOut((t - sourceCards[i].start) / 2.05);
    const radius = 10 + diagonal * 1.10 * reveal;
    const d = roundedRectPath(r, 28 * sx);
    return `<clipPath id="clip${i}"><path d="${d}"/></clipPath>
      <clipPath id="textClip${i}"><rect x="${r.textX.toFixed(1)}" y="${r.textY.toFixed(1)}" width="${r.textW.toFixed(1)}" height="${r.textH.toFixed(1)}" rx="${(8 * sx).toFixed(1)}"/></clipPath>
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
    const edgeBreath = 0.5 + 0.5 * Math.sin(t * 1.12 + i * 0.74);
    const textBreath = 0.5 + 0.5 * Math.sin(t * 1.36 + i * 0.92);
    const panelBreath = 0.5 + 0.5 * Math.sin(t * (0.72 + i * 0.09) + i * 1.47 + 0.35);
    const panelScale = 0.998 + 0.010 * panelBreath * reveal;
    const panelTx = (r.x + r.w / 2) * (1 - panelScale);
    const panelTy = (r.y + r.h / 2) * (1 - panelScale);
    const panelColor = ['#785fff', '#6987ff', '#9270ff', '#62c9ff'][i];
    const d = roundedRectPath(r, 28 * sx);
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
    return `<g transform="translate(${panelTx.toFixed(3)} ${panelTy.toFixed(3)}) scale(${panelScale.toFixed(6)})">
      <path d="${d}" fill="${panelColor}" fill-opacity="${((0.025 + 0.070 * panelBreath) * reveal).toFixed(3)}" stroke="${panelColor}" stroke-width="${(7.5 * sx).toFixed(2)}" stroke-opacity="${((0.08 + 0.13 * panelBreath) * edgeDraw).toFixed(3)}" filter="url(#softGlow)"/>
      <path d="${d}" fill="#17102e" fill-opacity="${(0.16 * silhouette).toFixed(3)}" stroke="#7564e8" stroke-width="1.4" stroke-opacity="${(0.22 * silhouette).toFixed(3)}" filter="url(#glow)"/>
      <ellipse cx="${r.iconX.toFixed(1)}" cy="${r.iconY.toFixed(1)}" rx="${(r.w * (0.18 + 0.045 * panelBreath)).toFixed(1)}" ry="${(r.h * (0.41 + 0.075 * panelBreath)).toFixed(1)}" fill="url(#cardAura)" opacity="${((0.31 + 0.24 * panelBreath) * smooth(start - 0.16, start + 0.68, t) * globalOut).toFixed(3)}" filter="url(#softGlow)"/>
      <g opacity="${alpha.toFixed(3)}">
      <g clip-path="url(#clip${i})" mask="url(#mask${i})">
        <image href="${uri}" x="${geometry.x.toFixed(1)}" y="${geometry.y.toFixed(1)}" width="${geometry.w.toFixed(1)}" height="${geometry.h.toFixed(1)}" preserveAspectRatio="none"/>
      </g>
      <g clip-path="url(#textClip${i})" opacity="${((0.18 + 0.28 * textBreath) * reveal).toFixed(3)}">
        <image href="${uri}" x="${geometry.x.toFixed(1)}" y="${geometry.y.toFixed(1)}" width="${geometry.w.toFixed(1)}" height="${geometry.h.toFixed(1)}" preserveAspectRatio="none" filter="url(#darkTextAura)"/>
      </g>
      <g clip-path="url(#clip${i})" opacity="${(0.34 * reveal).toFixed(3)}">
        <circle cx="${r.iconX.toFixed(1)}" cy="${r.iconY.toFixed(1)}" r="${(84 + 22 * breath).toFixed(1)}" fill="#7965ff" opacity="${(0.08 + 0.06 * breath).toFixed(3)}" filter="url(#softGlow)"/>
        <rect x="${glassX.toFixed(1)}" y="${(r.y - r.h * 0.24).toFixed(1)}" width="${(r.w * 0.21).toFixed(1)}" height="${(r.h * 1.48).toFixed(1)}" transform="skewX(-18)" fill="url(#glass)" opacity="${(0.075 + 0.055 * breath).toFixed(3)}"/>
        <rect x="${causticX.toFixed(1)}" y="${(r.y - r.h * 0.38).toFixed(1)}" width="${(r.w * 0.34).toFixed(1)}" height="${(r.h * 1.76).toFixed(1)}" transform="rotate(-13 ${r.x.toFixed(1)} ${r.y.toFixed(1)})" fill="url(#caustic)" opacity="${(0.10 + 0.05 * materialPulse).toFixed(3)}" filter="url(#softGlow)"/>
        ${sparks}
      </g>
      <path d="${d}" pathLength="1000" fill="none" stroke="${panelColor}" stroke-width="${((13.5 + 5.0 * edgeBreath) * sx).toFixed(2)}" stroke-opacity="${((0.12 + 0.13 * edgeBreath) * edgeDraw).toFixed(3)}" filter="url(#glow)"/>
      <path d="${d}" pathLength="1000" fill="none" stroke="#7967ff" stroke-width="${((5.8 + 2.0 * edgeBreath) * sx).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${pathDraw} 1000" stroke-opacity="${(0.32 + 0.38 * edgeBreath * edgeDraw).toFixed(3)}" filter="url(#pinGlow)"/>
      <path d="${d}" pathLength="1000" fill="none" stroke="url(#edge)" stroke-width="${((3.45 + 1.15 * edgeBreath) * sx).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${pathDraw} 1000" stroke-opacity="${((0.60 + 0.36 * edgeBreath) * edgeDraw).toFixed(3)}" filter="url(#pinGlow)"/>
      <path d="${d}" pathLength="1000" fill="none" stroke="#ffffff" stroke-width="${((1.15 + 0.70 * finePulse) * sx).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round" stroke-opacity="${((0.28 + 0.32 * edgeBreath) * edgeDraw).toFixed(3)}"/>
      <path d="${d}" pathLength="1000" fill="none" stroke="#ffffff" stroke-width="${((3.0 + 0.7 * finePulse) * sx).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="125 1000" stroke-dashoffset="${(-orbit).toFixed(1)}" stroke-opacity="${(0.52 + 0.42 * breath * edgeDraw).toFixed(3)}" filter="url(#pinGlow)"/>
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
      <clipPath id="brandClip"><rect x="${(geometry.x + 108 * imgSx).toFixed(1)}" y="${(geometry.y + 88 * imgSy).toFixed(1)}" width="${(398 * imgSx).toFixed(1)}" height="${(90 * imgSy).toFixed(1)}" rx="${(8 * sx).toFixed(1)}"/></clipPath>
      <clipPath id="versionClip"><rect x="${(geometry.x + 505 * imgSx).toFixed(1)}" y="${(geometry.y + 86 * imgSy).toFixed(1)}" width="${(122 * imgSx).toFixed(1)}" height="${(94 * imgSy).toFixed(1)}" rx="${(8 * sx).toFixed(1)}"/></clipPath>
      <clipPath id="cnTitleClip"><rect x="${(geometry.x + 620 * imgSx).toFixed(1)}" y="${(geometry.y + 86 * imgSy).toFixed(1)}" width="${(254 * imgSx).toFixed(1)}" height="${(94 * imgSy).toFixed(1)}" rx="${(8 * sx).toFixed(1)}"/></clipPath>
      <clipPath id="sparkleClip"><rect x="${(geometry.x + 870 * imgSx).toFixed(1)}" y="${(geometry.y + 82 * imgSy).toFixed(1)}" width="${(74 * imgSx).toFixed(1)}" height="${(90 * imgSy).toFixed(1)}" rx="${(8 * sx).toFixed(1)}"/></clipPath>
      <clipPath id="subtitleClip"><rect x="${(geometry.x + 118 * imgSx).toFixed(1)}" y="${(geometry.y + 176 * imgSy).toFixed(1)}" width="${(580 * imgSx).toFixed(1)}" height="${(58 * imgSy).toFixed(1)}" rx="${(6 * sx).toFixed(1)}"/></clipPath>
      <mask id="titleMask" maskUnits="userSpaceOnUse" x="${geometry.x.toFixed(1)}" y="${geometry.y.toFixed(1)}" width="${geometry.w.toFixed(1)}" height="${(geometry.h * 0.27).toFixed(1)}">
        <rect x="${geometry.x.toFixed(1)}" y="${geometry.y.toFixed(1)}" width="${(geometry.w * 0.68 * titleWipe).toFixed(1)}" height="${(geometry.h * 0.27).toFixed(1)}" fill="url(#titleReveal)"/>
        <rect x="${geometry.x.toFixed(1)}" y="${geometry.y.toFixed(1)}" width="${(geometry.w * 0.62).toFixed(1)}" height="${(geometry.h * 0.27).toFixed(1)}" fill="#ffffff" opacity="${titleHold.toFixed(3)}"/>
      </mask>
      ${cardDefs}
    </defs>
    <rect width="${W}" height="${H}" fill="#000000"/>
    <rect width="${W}" height="${H}" fill="url(#ambient)" opacity="${(0.58 * globalA).toFixed(3)}"/>
    <ellipse cx="${(W * (0.40 + 0.035 * sceneBreath2)).toFixed(1)}" cy="${(H * 0.57).toFixed(1)}" rx="${(W * (0.48 + 0.025 * sceneBreath)).toFixed(1)}" ry="${(H * (0.43 + 0.020 * sceneBreath)).toFixed(1)}" fill="url(#sceneAura)" opacity="${purpleField.toFixed(3)}" filter="url(#softGlow)"/>
    <ellipse cx="${(W * (0.68 - 0.030 * sceneBreath)).toFixed(1)}" cy="${(H * (0.48 + 0.025 * sceneBreath2)).toFixed(1)}" rx="${(W * 0.34).toFixed(1)}" ry="${(H * 0.36).toFixed(1)}" fill="url(#cyanAura)" opacity="${cyanField.toFixed(3)}" filter="url(#softGlow)"/>
    ${dust}
    <rect x="${(W * (0.12 - 0.02 * sceneBreath)).toFixed(1)}" y="${(H * 0.500).toFixed(1)}" width="${(W * (0.76 + 0.04 * sceneBreath)).toFixed(1)}" height="1.0" fill="url(#breathLine)" opacity="${(0.045 * breathGate * (0.45 + 0.55 * sceneBreath)).toFixed(3)}" filter="url(#pinGlow)"/>
    <g transform="translate(${sceneX.toFixed(3)} ${sceneY.toFixed(3)}) scale(${sceneScale.toFixed(6)})">
    <ellipse cx="${(geometry.x + geometry.w * 0.31).toFixed(1)}" cy="${(geometry.y + geometry.h * 0.135).toFixed(1)}" rx="${(geometry.w * 0.34).toFixed(1)}" ry="${(geometry.h * 0.12).toFixed(1)}" fill="#7462ff" opacity="${(0.08 * titleMist).toFixed(3)}" filter="url(#softGlow)"/>
    <g clip-path="url(#brandClip)" mask="url(#titleMask)" opacity="${((0.30 + 0.42 * brandBreath) * titleA).toFixed(3)}">
      <image href="${uri}" x="${geometry.x.toFixed(1)}" y="${geometry.y.toFixed(1)}" width="${geometry.w.toFixed(1)}" height="${geometry.h.toFixed(1)}" preserveAspectRatio="none" filter="url(#lightTextAura)"/>
    </g>
    <g clip-path="url(#versionClip)" mask="url(#titleMask)" opacity="${((0.46 + 0.52 * versionBreath) * titleA).toFixed(3)}">
      <image href="${uri}" x="${geometry.x.toFixed(1)}" y="${geometry.y.toFixed(1)}" width="${geometry.w.toFixed(1)}" height="${geometry.h.toFixed(1)}" preserveAspectRatio="none" filter="url(#lightTextAura)"/>
    </g>
    <g clip-path="url(#cnTitleClip)" mask="url(#titleMask)" opacity="${((0.28 + 0.44 * cnTitleBreath) * titleA).toFixed(3)}">
      <image href="${uri}" x="${geometry.x.toFixed(1)}" y="${geometry.y.toFixed(1)}" width="${geometry.w.toFixed(1)}" height="${geometry.h.toFixed(1)}" preserveAspectRatio="none" filter="url(#lightTextAura)"/>
    </g>
    <g clip-path="url(#subtitleClip)" mask="url(#titleMask)" opacity="${((0.16 + 0.30 * subtitleBreath) * titleA).toFixed(3)}">
      <image href="${uri}" x="${geometry.x.toFixed(1)}" y="${geometry.y.toFixed(1)}" width="${geometry.w.toFixed(1)}" height="${geometry.h.toFixed(1)}" preserveAspectRatio="none" filter="url(#lightTextAura)"/>
    </g>
    <g clip-path="url(#sparkleClip)" mask="url(#titleMask)" opacity="${((0.42 + 0.58 * sparkleBreath) * titleA).toFixed(3)}">
      <image href="${uri}" x="${geometry.x.toFixed(1)}" y="${geometry.y.toFixed(1)}" width="${geometry.w.toFixed(1)}" height="${geometry.h.toFixed(1)}" preserveAspectRatio="none" filter="url(#lightTextAura)"/>
    </g>
    <g clip-path="url(#titleClip)" mask="url(#titleMask)" opacity="${titleA.toFixed(3)}">
      <image href="${uri}" x="${geometry.x.toFixed(1)}" y="${geometry.y.toFixed(1)}" width="${geometry.w.toFixed(1)}" height="${geometry.h.toFixed(1)}" preserveAspectRatio="none"/>
    </g>
    <rect x="${titleSweepX.toFixed(1)}" y="${(geometry.y + 34).toFixed(1)}" width="560" height="224" transform="skewX(-12)" fill="url(#titleSweep)" opacity="${(0.095 * smooth(0.20, 0.78, t) * (1 - smooth(1.86, 2.56, t))).toFixed(3)}" filter="url(#softGlow)"/>
    <rect x="${(geometry.x + 10).toFixed(1)}" y="${(geometry.y + geometry.h * 0.232).toFixed(1)}" width="${(geometry.w * 0.46 * smooth(0.82, 2.22, t)).toFixed(1)}" height="1.15" rx="0.6" fill="url(#titleSweep)" opacity="${(0.28 * smooth(0.72, 1.52, t) * (1 - smooth(3.15, 4.20, t))).toFixed(3)}" filter="url(#pinGlow)"/>
    <circle cx="${(geometry.x + geometry.w * 0.315).toFixed(1)}" cy="${(geometry.y + geometry.h * 0.130).toFixed(1)}" r="${(58 + 18 * titlePulse).toFixed(1)}" fill="#7562ff" opacity="${(0.035 * smooth(1.00, 1.82, t) * globalOut).toFixed(3)}" filter="url(#softGlow)"/>
    <circle cx="${(geometry.x + geometry.w * 0.545).toFixed(1)}" cy="${(geometry.y + geometry.h * 0.128).toFixed(1)}" r="${(24 + 9 * titlePulse).toFixed(1)}" fill="#8b77ff" opacity="${(0.10 * sparkleIn * titlePulse).toFixed(3)}" filter="url(#softGlow)"/>
    <circle cx="${(geometry.x + geometry.w * 0.545).toFixed(1)}" cy="${(geometry.y + geometry.h * 0.128).toFixed(1)}" r="${(1.6 + 1.2 * titlePulse).toFixed(1)}" fill="#ffffff" opacity="${(0.28 * sparkleIn).toFixed(3)}" filter="url(#pinGlow)"/>
    ${cardLayers}
    </g>
    <rect x="${((54 - 2.5 * sceneBreath) * sx).toFixed(1)}" y="${((38 - 1.5 * sceneBreath) * sy).toFixed(1)}" width="${((1812 + 5 * sceneBreath) * sx).toFixed(1)}" height="${((1004 + 3 * sceneBreath) * sy).toFixed(1)}" rx="${(34 * sx).toFixed(1)}" fill="none" stroke="#5f4fe0" stroke-width="${((0.9 + 0.35 * sceneBreath) * sx).toFixed(2)}" stroke-opacity="${((0.075 + 0.055 * sceneBreath) * globalA).toFixed(3)}" filter="url(#pinGlow)"/>
    <rect x="${((126 + 12 * (1 - sceneBreath2)) * sx).toFixed(1)}" y="${(1018 * sy).toFixed(1)}" width="${(W - (252 + 24 * (1 - sceneBreath2)) * sx).toFixed(1)}" height="${Math.max(0.7, sy).toFixed(1)}" fill="url(#breathLine)" opacity="${(0.055 * breathGate * (0.48 + 0.52 * sceneBreath2)).toFixed(3)}"/>
  </svg>`;
}

async function main() {
  assertFile(ffmpeg);
  assertFile(source);
  assertFile(music);
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
    '-an', '-c:v', 'libx264', '-preset', previewMode ? 'veryfast' : 'medium', '-crf', previewMode ? '24' : '16',
    '-pix_fmt', 'yuv420p', '-r', String(FPS), '-movflags', '+faststart', visualOutput,
  ], 'encode highlight preview');
  run(ffmpeg, [
    '-y', '-i', visualOutput, '-stream_loop', '-1', '-i', music,
    '-filter_complex', `[1:a]atrim=0:${DUR},asetpts=PTS-STARTPTS,afade=t=in:st=0:d=0.7,afade=t=out:st=${(DUR - 0.8).toFixed(2)}:d=0.8,volume=0.34[a]`,
    '-map', '0:v:0', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k',
    '-ar', '48000', '-ac', '2', '-shortest', '-movflags', '+faststart', output,
  ], 'mux highlight preview audio');
  console.log(`DONE ${output}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
