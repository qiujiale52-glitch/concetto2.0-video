import fs from 'fs';
import path from 'path';
import sharp from './thumbs/node_modules/sharp/dist/index.mjs';

const cwd = process.cwd();
const W = 1920;
const H = 1080;
const fps = 24;
const duration = 44;
const outDir = path.join(cwd, '06_预览输出', 'subject_front_model_v01_frames');
fs.mkdirSync(outDir, { recursive: true });

const assetDir = path.join(cwd, '.tools/subject_test_assets');
const assets = {
  logo: 'logo.png',
  workflow: 'workflow.jpg',
  frontCard: 'frontCard.png',
  siteCard: 'siteCard.png',
  modelCard: 'modelCard.png',
  imageModelCard: 'imageModelCard.png',
  planTo3d: 'planTo3d.jpg',
  frontUI: 'frontUI.jpg',
  siteMap: 'siteMap.jpg',
  siteModel: 'siteModel.jpg',
  modelUI: 'modelUI.jpg',
  webModel: 'webModel.jpg',
  report1: 'report1.jpg',
  report2: 'report2.jpg',
  report3: 'report3.jpg',
};
const b64 = {};
for (const [k, f] of Object.entries(assets)) {
  b64[k] = fs.readFileSync(path.join(assetDir, f)).toString('base64');
}
function mime(name) {
  return /\.png$/i.test(assets[name]) ? 'image/png' : 'image/jpeg';
}
function data(name) {
  return `data:${mime(name)};base64,${b64[name]}`;
}
function clamp(v, a = 0, b = 1) {
  return Math.max(a, Math.min(b, v));
}
function smooth(a, b, x) {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
}
function ease(x) {
  const t = clamp(x);
  return 1 - Math.pow(1 - t, 3);
}
function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function img(name, x, y, w, h, op = 1, extra = '') {
  return `<image href="${data(name)}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" opacity="${op}" ${extra}/>`;
}
function defs() {
  return `
  <defs>
    <radialGradient id="core" cx="50%" cy="52%" r="62%">
      <stop offset="0%" stop-color="#7565ff" stop-opacity="0.68"/>
      <stop offset="45%" stop-color="#17133a" stop-opacity="0.36"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="scanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#fff" stop-opacity="0"/>
      <stop offset="50%" stop-color="#d8d2ff" stop-opacity="0.86"/>
      <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#7668ff" stop-opacity="0"/>
      <stop offset="48%" stop-color="#ffffff" stop-opacity="0.78"/>
      <stop offset="100%" stop-color="#7668ff" stop-opacity="0"/>
    </linearGradient>
    <filter id="blur6"><feGaussianBlur stdDeviation="6"/></filter>
    <filter id="blur18"><feGaussianBlur stdDeviation="18"/></filter>
    <filter id="blur28"><feGaussianBlur stdDeviation="28"/></filter>
    <filter id="panelShadow" x="-35%" y="-35%" width="170%" height="170%">
      <feDropShadow dx="0" dy="0" stdDeviation="22" flood-color="#6658ff" flood-opacity="0.34"/>
    </filter>
    <filter id="softGlow" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="0" stdDeviation="12" flood-color="#9b8dff" flood-opacity="0.42"/>
    </filter>
    <clipPath id="panelClip"><rect x="315" y="250" width="1290" height="705" rx="38"/></clipPath>
    <clipPath id="smallClip"><rect x="0" y="0" width="544" height="304" rx="32"/></clipPath>
    <clipPath id="wideClip"><rect x="250" y="160" width="1420" height="800" rx="42"/></clipPath>
  </defs>`;
}
function bg(t) {
  const pulse = 0.13 + 0.04 * Math.sin(t * 0.45);
  const scan = -520 + (W + 1040) * ((t * 0.018) % 1);
  let grid = '';
  for (let i = 0; i < 11; i++) {
    const y = 220 + i * 58;
    grid += `<path d="M 220 ${y} C 650 ${y - 35}, 1230 ${y + 12}, 1700 ${y - 30}" stroke="#6f64d9" stroke-opacity="0.035" stroke-width="1" fill="none"/>`;
  }
  return `
  <rect width="${W}" height="${H}" fill="#010104"/>
  <rect width="${W}" height="${H}" fill="url(#core)" opacity="${pulse.toFixed(3)}"/>
  <rect x="${scan.toFixed(1)}" y="-80" width="620" height="1240" transform="skewX(-18)" fill="url(#scanGrad)" opacity="0.055"/>
  ${grid}
  <path d="M 150 806 C 600 716, 1280 730, 1760 635" stroke="#7668ff" stroke-opacity="0.13" stroke-width="1.2" fill="none"/>`;
}
function panel(x, y, w, h, r, op = 1) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="#080713" opacity="${(0.76 * op).toFixed(3)}" stroke="#8d7cff" stroke-opacity="${(0.24 * op).toFixed(3)}" stroke-width="1.2" filter="url(#panelShadow)"/>`;
}
function title(text, sub, op, y = 105) {
  if (op <= 0.01) return '';
  return `
  <text x="960" y="${y}" text-anchor="middle" font-family="PingFang SC, Hiragino Sans GB, Arial" font-size="42" font-weight="650" letter-spacing="1.2" fill="#d9d4ff" opacity="${(op * 0.35).toFixed(3)}" filter="url(#blur6)">${esc(text)}</text>
  <text x="960" y="${y}" text-anchor="middle" font-family="PingFang SC, Hiragino Sans GB, Arial" font-size="42" font-weight="650" letter-spacing="1.2" fill="#f2f0ff" opacity="${op.toFixed(3)}">${esc(text)}</text>
  <text x="960" y="${y + 44}" text-anchor="middle" font-family="PingFang SC, Hiragino Sans GB, Arial" font-size="20" letter-spacing="1.2" fill="#aaa2df" opacity="${(op * 0.82).toFixed(3)}">${esc(sub)}</text>`;
}
function glassImage(name, x, y, w, h, op, shade = 0.24) {
  if (op <= 0.01) return '';
  return `
  <g opacity="${op.toFixed(3)}">
    <rect x="${x - 16}" y="${y - 16}" width="${w + 32}" height="${h + 32}" rx="42" fill="#080713" stroke="#9b8cff" stroke-opacity="0.24" filter="url(#panelShadow)"/>
    ${img(name, x, y, w, h, 0.94)}
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="38" fill="#04030a" opacity="${shade}"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="38" fill="none" stroke="#c3bbff" stroke-opacity="0.22"/>
  </g>`;
}
function miniCard(name, x, y, op, label = '') {
  if (op <= 0.01) return '';
  return `
  <g transform="translate(${x} ${y})" opacity="${op.toFixed(3)}">
    <rect x="-18" y="-18" width="580" height="340" rx="42" fill="#120d2a" stroke="#a696ff" stroke-opacity="0.26" filter="url(#panelShadow)"/>
    ${img(name, 0, 0, 544, 304, 1)}
    ${label ? `<text x="272" y="352" text-anchor="middle" font-family="Avenir Next, Arial" font-size="17" letter-spacing="5" fill="#958be0">${esc(label)}</text>` : ''}
  </g>`;
}
function hud(x, y, text, op) {
  if (op <= 0.01) return '';
  return `<g opacity="${op.toFixed(3)}"><rect x="${x}" y="${y}" width="210" height="48" rx="14" fill="#7668ff" opacity="0.16" stroke="#b8afff" stroke-opacity="0.18"/><text x="${x + 24}" y="${y + 31}" font-family="PingFang SC, Arial" font-size="18" fill="#eeeaff">${esc(text)}</text></g>`;
}

function render(t) {
  let s = `<?xml version="1.0" encoding="UTF-8"?><svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
  s += defs();
  s += bg(t);
  s += `<text x="112" y="78" font-family="Avenir Next, Arial" font-size="17" letter-spacing="5" fill="#837acf" opacity="0.62">CONCETTO 2.0 / WORKFLOW DEMO</text><rect x="112" y="96" width="260" height="1" fill="#7668ff" opacity="0.42"/>`;

  // 0-5 workflow overview, prepare node journey
  const wf = smooth(0.0, 1.3, t) * (1 - smooth(5.1, 6.3, t));
  if (wf > 0.01) {
    const sc = 0.98 + 0.035 * ease(t / 5);
    const x = 270 + 1380 * (1 - sc) / 2;
    const y = 170 + 776 * (1 - sc) / 2;
    s += glassImage('workflow', x, y, 1380 * sc, 776 * sc, wf, 0.25);
    s += title('九大环节串联，进入主体工作流', '从任务书解读到模型生成，系统开始推进方案全过程', wf * smooth(0.4, 1.4, t), 105);
    const nodes = [
      [420, 428], [610, 670], [775, 395], [935, 650],
    ];
    for (let i = 0; i < nodes.length; i++) {
      const p = smooth(1.2 + i * 0.55, 1.8 + i * 0.55, t) * (1 - smooth(4.4, 5.6, t));
      s += `<circle cx="${nodes[i][0]}" cy="${nodes[i][1]}" r="${(58 + 16 * Math.sin(t * 5 + i)).toFixed(1)}" fill="#806fff" opacity="${(0.18 * p).toFixed(3)}" filter="url(#blur18)"/>`;
      s += `<circle cx="${nodes[i][0]}" cy="${nodes[i][1]}" r="64" fill="none" stroke="#ffffff" stroke-opacity="${(0.58 * p).toFixed(3)}" stroke-width="1.6"/>`;
    }
  }

  // 5-15 front analysis
  const fa = smooth(4.9, 6.0, t) * (1 - smooth(14.7, 16.0, t));
  if (fa > 0.01) {
    const docA = fa * (1 - smooth(11.5, 14.3, t));
    const drift = ease((t - 5) / 8);
    const docs = [
      ['report1', 110 - 30 * drift, 245, 390, 250, -8],
      ['report2', 1390 + 30 * drift, 225, 390, 250, 7],
      ['report3', 120 + 20 * drift, 670, 390, 250, 5],
    ];
    for (const [name, x, y, w, h, rot] of docs) {
      s += `<g transform="translate(${x} ${y}) rotate(${rot})" opacity="${(0.24 * docA).toFixed(3)}"><rect x="-8" y="-8" width="${w + 16}" height="${h + 16}" rx="18" fill="#0b0919" stroke="#8d7cff" stroke-opacity="0.16"/>${img(name, 0, 0, w, h, 1)}</g>`;
    }
    const cardA = smooth(5.2, 6.4, t) * (1 - smooth(9.2, 10.4, t));
    s += miniCard('frontCard', 688, 322, cardA, 'SITE INTELLIGENCE');
    const uiA = smooth(9.2, 10.7, t) * (1 - smooth(14.7, 15.7, t));
    s += glassImage('frontUI', 315, 250, 1290, 705, uiA, 0.28);
    s += title('前策分析：先理解任务，再形成策略', '任务书解读、区位现状、案例研究和设计策略，在同一流程中完成', fa * smooth(6.0, 7.0, t) * (1 - smooth(14.0, 15.0, t)), 110);
    s += hud(420, 820, '任务理解', uiA);
    s += hud(680, 820, '场地判断', uiA);
    s += hud(940, 820, '策略输出', uiA);
    const lineA = smooth(12.0, 14.3, t);
    s += `<circle cx="1210" cy="516" r="${(8 + 28 * lineA).toFixed(1)}" fill="#9c8cff" opacity="${(0.20 * lineA).toFixed(3)}" filter="url(#blur6)"/><circle cx="1210" cy="516" r="10" fill="#dcd6ff" opacity="${lineA.toFixed(3)}"/>`;
  }

  // 15-24 site positioning
  const site = smooth(14.7, 16.0, t) * (1 - smooth(23.6, 24.8, t));
  if (site > 0.01) {
    const cardA = smooth(15.0, 16.2, t) * (1 - smooth(18.0, 19.0, t));
    s += miniCard('siteCard', 688, 322, cardA, 'LOCATION LOCK');
    const mapA = smooth(17.8, 19.0, t) * (1 - smooth(23.6, 24.6, t));
    s += glassImage('siteMap', 315, 250, 1290, 705, mapA, 0.26);
    s += title('场地定位：坐标锁定，周边条件浮现', '从场地位置到周边资源、交通与环境，前期判断落到地图空间', site * smooth(16.0, 17.0, t) * (1 - smooth(23.0, 24.0, t)), 110);
    const cx = 960, cy = 548;
    const rings = smooth(18.8, 22.8, t);
    for (let i = 0; i < 4; i++) {
      const r = 70 + i * 74 + 30 * Math.sin(t * 1.8 + i);
      s += `<circle cx="${cx}" cy="${cy}" r="${r.toFixed(1)}" fill="none" stroke="#b8afff" stroke-opacity="${(0.20 * rings * (1 - i * 0.14)).toFixed(3)}" stroke-width="1.4"/>`;
    }
    s += `<circle cx="${cx}" cy="${cy}" r="12" fill="#f2eeff" opacity="${mapA.toFixed(3)}" filter="url(#softGlow)"/>`;
    s += hud(410, 800, '坐标锁定', mapA);
    s += hud(670, 800, '周边分析', mapA);
    s += hud(930, 800, '环境判断', mapA);
  }

  // 24-34 map to model and image model
  const model = smooth(23.8, 25.0, t) * (1 - smooth(34.0, 35.0, t));
  if (model > 0.01) {
    const lift = smooth(24.2, 27.2, t);
    s += title('从场地到空间：地图立起，模型生成', '资料不再停留在平面，开始转化为可编辑的设计对象', model * smooth(25.0, 26.0, t) * (1 - smooth(33.4, 34.4, t)), 110);
    const y = 300 - 70 * lift;
    const h = 540 - 100 * lift;
    s += glassImage('siteModel', 340, y, 1240, h, model * (1 - smooth(28.2, 29.2, t)), 0.24);
    // Simulated lifting plane grid
    const planeA = model * smooth(25.0, 27.5, t) * (1 - smooth(29.0, 30.0, t));
    s += `<g opacity="${planeA.toFixed(3)}" transform="translate(960 650) scale(${(1 + 0.08 * lift).toFixed(3)} ${(.62 - .18 * lift).toFixed(3)}) rotate(-2)">`;
    for (let i = -7; i <= 7; i++) {
      s += `<line x1="${i * 70}" y1="-260" x2="${i * 70}" y2="260" stroke="#c8c0ff" stroke-opacity="0.16" stroke-width="1"/>`;
      s += `<line x1="-520" y1="${i * 36}" x2="520" y2="${i * 36}" stroke="#c8c0ff" stroke-opacity="0.13" stroke-width="1"/>`;
    }
    s += `</g>`;
    const cardA = smooth(29.0, 30.0, t) * (1 - smooth(32.0, 33.0, t));
    s += miniCard('imageModelCard', 688, 320, cardA, 'PLAN TO 3D');
    const planA = smooth(31.2, 32.2, t) * (1 - smooth(34.0, 34.8, t));
    s += glassImage('planTo3d', 560, 300, 800, 450, planA, 0.20);
    s += hud(680, 800, '总平图转 3D', planA);
    s += hud(960, 800, '可编辑模型', planA);
  }

  // 34-44 data/modeling
  const build = smooth(34.0, 35.0, t);
  if (build > 0.01) {
    const leftA = smooth(34.6, 35.8, t);
    const rightA = smooth(36.6, 37.8, t);
    s += title('数据建模：从资料到可推演空间', '参数化驱动模型生成，Web 端建模能力继续承接后续设计', build * (1 - smooth(42.8, 44.0, t)), 110);
    s += `<g opacity="${leftA.toFixed(3)}" transform="translate(${(-18 * (1 - leftA)).toFixed(1)} 0)">${glassImage('modelUI', 180, 270, 760, 430, 1, 0.24)}</g>`;
    s += `<g opacity="${rightA.toFixed(3)}" transform="translate(${(18 * (1 - rightA)).toFixed(1)} 0)">${glassImage('webModel', 980, 270, 760, 430, 1, 0.24)}</g>`;
    const line = smooth(37.0, 40.0, t);
    for (let i = 0; i < 8; i++) {
      const x = 430 + i * 132;
      s += `<rect x="${x}" y="${760 - 18 * Math.sin(t * 2 + i)}" width="82" height="${(5 + 42 * line * Math.abs(Math.sin(t * 0.8 + i))).toFixed(1)}" rx="6" fill="#8b7cff" opacity="${(0.16 * line).toFixed(3)}"/>`;
    }
    s += hud(410, 800, '数据建模', line);
    s += hud(680, 800, '图纸模型', line);
    s += hud(950, 800, 'Web 建模', line);
    const next = smooth(41.0, 44.0, t);
    s += `<rect x="${(960 - 760 * next).toFixed(1)}" y="910" width="${(1520 * next).toFixed(1)}" height="1.4" fill="url(#lineGrad)" opacity="${(0.74 * next).toFixed(3)}"/>`;
    s += `<text x="960" y="948" text-anchor="middle" font-family="Avenir Next, Arial" font-size="18" letter-spacing="7" fill="#9f95df" opacity="${(0.75 * next).toFixed(3)}">NEXT / AI RENDERING</text>`;
  }

  s += `</svg>`;
  return s;
}

for (let i = 0; i < duration * fps; i++) {
  const t = i / fps;
  const out = path.join(outDir, `frame_${String(i).padStart(4, '0')}.png`);
  await sharp(Buffer.from(render(t))).png().toFile(out);
}
console.log(outDir);
