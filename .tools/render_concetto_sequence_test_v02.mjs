import fs from 'fs';
import path from 'path';
import sharp from './thumbs/node_modules/sharp/dist/index.mjs';

const cwd = process.cwd();
const W = 1920;
const H = 1080;
const fps = 30;
const openingFrames = path.join(cwd, '06_预览输出', 'opening_v01_frames');
const outDir = path.join(cwd, '06_预览输出', 'sequence_test_v02_frames');
fs.mkdirSync(outDir, { recursive: true });

const assets = {
  logo: path.join(cwd, '.tools/transition_test_assets/logo.png'),
  highlights: path.join(cwd, '.tools/transition_test_assets/highlights.jpg'),
  updates: path.join(cwd, '.tools/transition_test_assets/updates.jpg'),
  workflow: path.join(cwd, '.tools/transition_test_assets/workflow.jpg'),
  frontCard: path.join(cwd, '.tools/transition_test_assets/frontCard.png'),
  report1: path.join(cwd, '.tools/transition_test_assets/report1.jpg'),
  report2: path.join(cwd, '.tools/transition_test_assets/report2.jpg'),
  report3: path.join(cwd, '.tools/transition_test_assets/report3.jpg'),
  uiFrame: path.join(cwd, '.tools/transition_test_assets/uiFrame.jpg'),
};

const b64 = {};
for (const [k, p] of Object.entries(assets)) b64[k] = fs.readFileSync(p).toString('base64');

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
function img(name, x, y, w, h, opacity = 1, extra = '') {
  return `<image href="${data(name)}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" opacity="${opacity}" ${extra}/>`;
}
function defs() {
  return `
  <defs>
    <radialGradient id="core" cx="50%" cy="52%" r="58%">
      <stop offset="0%" stop-color="#7b67ff" stop-opacity="0.78"/>
      <stop offset="45%" stop-color="#1c1643" stop-opacity="0.38"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="scanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="50%" stop-color="#d8d2ff" stop-opacity="0.82"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#7668ff" stop-opacity="0"/>
      <stop offset="48%" stop-color="#ffffff" stop-opacity="0.82"/>
      <stop offset="100%" stop-color="#7668ff" stop-opacity="0"/>
    </linearGradient>
    <filter id="blur6"><feGaussianBlur stdDeviation="6"/></filter>
    <filter id="blur18"><feGaussianBlur stdDeviation="18"/></filter>
    <filter id="panelShadow" x="-35%" y="-35%" width="170%" height="170%">
      <feDropShadow dx="0" dy="0" stdDeviation="22" flood-color="#6658ff" flood-opacity="0.34"/>
    </filter>
    <filter id="softGlow" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="0" stdDeviation="12" flood-color="#9b8dff" flood-opacity="0.42"/>
    </filter>
    <clipPath id="stageClip"><rect x="250" y="150" width="1420" height="800" rx="42"/></clipPath>
    <clipPath id="workflowClip"><rect x="270" y="186" width="1380" height="776" rx="36"/></clipPath>
    <clipPath id="uiClip"><rect x="335" y="265" width="1250" height="664" rx="34"/></clipPath>
  </defs>`;
}
function bg(t) {
  const pulse = 0.13 + 0.045 * Math.sin(t * 0.55);
  const scan = -460 + (W + 920) * ((t * 0.025) % 1);
  return `
  <rect width="${W}" height="${H}" fill="#010104"/>
  <rect width="${W}" height="${H}" fill="url(#core)" opacity="${pulse.toFixed(3)}"/>
  <rect x="${scan.toFixed(1)}" y="0" width="560" height="${H}" transform="skewX(-18)" fill="url(#scanGrad)" opacity="0.075"/>
  <path d="M 150 785 C 600 705, 1280 720, 1760 625" stroke="#7668ff" stroke-opacity="0.12" stroke-width="1.2" fill="none"/>
  <path d="M 280 292 C 720 245, 1170 270, 1660 210" stroke="#ffffff" stroke-opacity="0.045" stroke-width="1" fill="none"/>
  `;
}
function panel(x, y, w, h, r, opacity = 1) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="#080713" opacity="${(0.76 * opacity).toFixed(3)}" stroke="#8d7cff" stroke-opacity="${(0.24 * opacity).toFixed(3)}" stroke-width="1.2" filter="url(#panelShadow)"/>`;
}
function title(text, sub, y, opacity) {
  return `
  <text x="960" y="${y}" text-anchor="middle" font-family="PingFang SC, Hiragino Sans GB, Arial" font-size="40" font-weight="650" letter-spacing="1.2" fill="#d9d4ff" opacity="${(opacity * 0.34).toFixed(3)}" filter="url(#blur6)">${esc(text)}</text>
  <text x="960" y="${y}" text-anchor="middle" font-family="PingFang SC, Hiragino Sans GB, Arial" font-size="40" font-weight="650" letter-spacing="1.2" fill="#f2f0ff" opacity="${opacity.toFixed(3)}">${esc(text)}</text>
  <text x="960" y="${y + 42}" text-anchor="middle" font-family="PingFang SC, Hiragino Sans GB, Arial" font-size="20" font-weight="400" letter-spacing="1.5" fill="#aaa2df" opacity="${(opacity * 0.82).toFixed(3)}">${esc(sub)}</text>`;
}
function cardImage(name, x, y, w, h, opacity, scale = 1, shade = 0.22) {
  const sx = x + w * (1 - scale) / 2;
  const sy = y + h * (1 - scale) / 2;
  const sw = w * scale;
  const sh = h * scale;
  return `
  <g opacity="${opacity.toFixed(3)}">
    <rect x="${(sx - 16).toFixed(1)}" y="${(sy - 16).toFixed(1)}" width="${(sw + 32).toFixed(1)}" height="${(sh + 32).toFixed(1)}" rx="44" fill="#080713" stroke="#9b8cff" stroke-opacity="0.24" filter="url(#panelShadow)"/>
    <g clip-path="url(#stageClip)" transform="translate(${(sx - x).toFixed(1)} ${(sy - y).toFixed(1)}) scale(${scale.toFixed(4)})">
      ${img(name, x, y, w, h, 0.94)}
    </g>
    <rect x="${sx.toFixed(1)}" y="${sy.toFixed(1)}" width="${sw.toFixed(1)}" height="${sh.toFixed(1)}" rx="42" fill="#04030a" opacity="${shade.toFixed(3)}"/>
    <rect x="${sx.toFixed(1)}" y="${sy.toFixed(1)}" width="${sw.toFixed(1)}" height="${sh.toFixed(1)}" rx="42" fill="none" stroke="#c3bbff" stroke-opacity="0.22"/>
  </g>`;
}

function renderContinuation(t) {
  // t after opening, total 29s
  let s = `<?xml version="1.0" encoding="UTF-8"?><svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
  s += defs();
  s += bg(t + 9);

  // Soft carry-over from logo into first content: no hard cut
  const logoFade = 1 - smoothstep(0.0, 2.6, t);
  if (logoFade > 0.01) {
    s += `<image href="${data('logo')}" x="580" y="444" width="760" opacity="${(0.72 * logoFade).toFixed(3)}" filter="url(#softGlow)"/>`;
    s += `<text x="960" y="620" text-anchor="middle" font-family="Avenir Next, Arial" font-size="72" fill="#d8d2ff" opacity="${(0.42 * logoFade).toFixed(3)}" letter-spacing="8">2.0</text>`;
  }
  const bridge = smoothstep(0.3, 2.7, t) * (1 - smoothstep(9.0, 10.2, t));
  s += `<rect x="${(960 - 720 * bridge).toFixed(1)}" y="524" width="${(1440 * bridge).toFixed(1)}" height="1.2" fill="url(#lineGrad)" opacity="${(0.75 * bridge).toFixed(3)}"/>`;

  // 1.6-8.4: upgrade highlights
  const hIn = smoothstep(1.3, 3.1, t);
  const hOut = 1 - smoothstep(8.5, 10.1, t);
  const hA = hIn * hOut;
  if (hA > 0.01) {
    const sc = 0.96 + 0.055 * easeOut((t - 1.5) / 6.2);
    s += cardImage('highlights', 250, 150, 1420, 800, hA, sc, 0.18);
    s += title('CONCETTO 2.0 升级亮点', '全新体验，全方位升级，让专注更简单、更高效', 112, hA * smoothstep(2.2, 3.0, t));
    // four subtle beats
    const xs = [420, 1180, 420, 1180], ys = [352, 352, 675, 675];
    for (let i = 0; i < 4; i++) {
      const p = smoothstep(3.1 + i * 0.65, 3.65 + i * 0.65, t) * (1 - smoothstep(7.6, 8.5, t));
      s += `<rect x="${xs[i] - 16}" y="${ys[i] - 16}" width="250" height="88" rx="22" fill="#ffffff" opacity="${(0.045 * p).toFixed(3)}" stroke="#ffffff" stroke-opacity="${(0.18 * p).toFixed(3)}"/>`;
    }
  }

  // 9.0-15.8: new/updated functions
  const uIn = smoothstep(9.0, 10.5, t);
  const uOut = 1 - smoothstep(15.8, 17.1, t);
  const uA = uIn * uOut;
  if (uA > 0.01) {
    const sc = 0.96 + 0.045 * easeOut((t - 9.0) / 5.7);
    s += cardImage('updates', 250, 150, 1420, 800, uA, sc, 0.16);
    s += title('六大模块全面更新', '系统更新、渲染 2.0、图生模、前策分析、车库排布、Web 端建模', 112, uA * smoothstep(9.8, 10.8, t));
    const dots = [
      [420, 318], [810, 318], [1210, 318],
      [420, 655], [810, 655], [1210, 655],
    ];
    for (let i = 0; i < dots.length; i++) {
      const p = smoothstep(10.8 + i * 0.28, 11.2 + i * 0.28, t) * (1 - smoothstep(15.1, 16.2, t));
      s += `<circle cx="${dots[i][0]}" cy="${dots[i][1]}" r="${(38 + 9 * Math.sin(t * 5 + i)).toFixed(1)}" fill="#8a76ff" opacity="${(0.13 * p).toFixed(3)}" filter="url(#blur18)"/>`;
    }
  }

  // 16.5-23.2: workflow overview
  const wfIn = smoothstep(16.3, 17.8, t);
  const wfOut = 1 - smoothstep(23.2, 24.4, t);
  const wfA = wfIn * wfOut;
  if (wfA > 0.01) {
    const sc = 0.98 + 0.04 * easeOut((t - 16.5) / 5.5);
    s += cardImage('workflow', 270, 186, 1380, 776, wfA, sc, 0.25);
    s += title('从升级能力，到完整工作流', '九大环节串联，从任务书解读到汇报材料合成', 112, wfA * smoothstep(17.1, 18.1, t));
    const p = smoothstep(18.5, 19.7, t) * (1 - smoothstep(23.0, 24.0, t));
    const nx = 420, ny = 430;
    s += `<circle cx="${nx}" cy="${ny}" r="${(70 + 16 * Math.sin(t * 5)).toFixed(1)}" fill="#806fff" opacity="${(0.22 * p).toFixed(3)}" filter="url(#blur18)"/>`;
    s += `<circle cx="${nx}" cy="${ny}" r="76" fill="none" stroke="#ffffff" stroke-opacity="${(0.74 * p).toFixed(3)}" stroke-width="2"/>`;
    s += `<text x="960" y="906" text-anchor="middle" font-family="Avenir Next, Arial" font-size="18" letter-spacing="7" fill="#a196df" opacity="${(0.70 * p).toFixed(3)}">FROM ANALYSIS TO DESIGN</text>`;
  }

  // 24.0-29: front analysis entry
  const fa = smoothstep(24.0, 25.1, t);
  if (fa > 0.01) {
    const docA = fa * (1 - smoothstep(28.2, 29.0, t));
    const drift = easeOut((t - 24.0) / 4.5);
    const docs = [
      ['report1', 128 - 45 * drift, 230, 390, 250, -8],
      ['report2', 1370 + 36 * drift, 210, 390, 250, 7],
      ['report3', 100 + 25 * drift, 660, 390, 250, 5],
    ];
    for (const [name, x, y, w, h, rot] of docs) {
      s += `<g transform="translate(${x} ${y}) rotate(${rot})" opacity="${(0.23 * docA).toFixed(3)}">`;
      s += `<rect x="-8" y="-8" width="${w + 16}" height="${h + 16}" rx="18" fill="#0b0919" stroke="#8d7cff" stroke-opacity="0.16"/>`;
      s += img(name, 0, 0, w, h, 1);
      s += `</g>`;
    }
    const cardA = smoothstep(24.6, 25.6, t) * (1 - smoothstep(27.5, 28.5, t));
    if (cardA > 0.01) {
      s += `<g opacity="${cardA.toFixed(3)}">`;
      s += `<rect x="670" y="318" width="580" height="340" rx="42" fill="#120d2a" stroke="#a696ff" stroke-opacity="0.26" filter="url(#panelShadow)"/>`;
      s += img('frontCard', 688, 330, 544, 304, 1);
      s += `</g>`;
    }
    const uiA = smoothstep(27.5, 28.7, t);
    if (uiA > 0.01) {
      s += panel(320, 250, 1280, 700, 38, uiA);
      s += `<g clip-path="url(#uiClip)" opacity="${(0.82 * uiA).toFixed(3)}">${img('uiFrame', 335, 265, 1250, 664, 0.82)}<rect x="335" y="265" width="1250" height="664" fill="#05040b" opacity="0.22"/></g>`;
      s += `<rect x="335" y="265" width="1250" height="664" rx="34" fill="none" stroke="#b7aaff" stroke-opacity="${(0.28 * uiA).toFixed(3)}"/>`;
      s += `<text x="430" y="377" font-family="PingFang SC, Hiragino Sans GB, Arial" font-size="30" font-weight="650" fill="#f0edff" opacity="${uiA.toFixed(3)}">前策分析</text>`;
      s += `<text x="430" y="430" font-family="PingFang SC, Hiragino Sans GB, Arial" font-size="20" fill="#bdb6ea" opacity="${uiA.toFixed(3)}">从任务书解读，到区位、现状、案例与策略生成</text>`;
    }
    s += title('从工作流的第一步，进入前策分析', '设计不再从空白开始', 118, smoothstep(25.2, 26.2, t) * (1 - smoothstep(28.5, 29.0, t)));
  }

  const statusA = smoothstep(1.6, 2.7, t) * (1 - smoothstep(28.0, 29.0, t));
  s += `<text x="112" y="78" font-family="Avenir Next, Arial" font-size="17" letter-spacing="5" fill="#837acf" opacity="${(0.66 * statusA).toFixed(3)}">CONCETTO 2.0 / LAUNCH SEQUENCE</text>`;
  s += `<rect x="112" y="96" width="${(260 * statusA).toFixed(1)}" height="1" fill="#7668ff" opacity="0.42"/>`;

  s += `</svg>`;
  return s;
}

const openingCount = 270;
for (let i = 0; i < openingCount; i++) {
  const src = path.join(openingFrames, `frame_${String(i).padStart(4, '0')}.png`);
  const dst = path.join(outDir, `frame_${String(i).padStart(4, '0')}.png`);
  if (!fs.existsSync(dst)) fs.copyFileSync(src, dst);
}

const contDuration = 29;
const contFrames = Math.round(contDuration * fps);
for (let i = 0; i < contFrames; i++) {
  const t = i / fps;
  const svg = Buffer.from(renderContinuation(t));
  const out = path.join(outDir, `frame_${String(openingCount + i).padStart(4, '0')}.png`);
  await sharp(svg).png().toFile(out);
}

console.log(outDir);
