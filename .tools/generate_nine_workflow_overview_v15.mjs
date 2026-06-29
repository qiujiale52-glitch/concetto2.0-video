import fs from 'fs';
import path from 'path';
import sharp from './thumbs/node_modules/sharp/dist/index.mjs';

const cwd = process.cwd();
const W = 2048;
const H = 1152;
const ref = path.join(cwd, '九大环节总览', '32136d7756e1aed58bd505284ce6fe5e.png');
const outPng = path.join(cwd, '06_预览输出', 'Concetto_2.0_九大环节总览_新版_v15.png');
const outJpg = path.join(cwd, '06_预览输出', 'Concetto_2.0_九大环节总览_新版_v15.jpg');
const outSvg = path.join(cwd, '06_预览输出', 'Concetto_2.0_九大环节总览_新版_v15.svg');

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function dataUri(file) {
  const mime = path.extname(file).toLowerCase() === '.jpg' ? 'image/jpeg' : 'image/png';
  return `data:${mime};base64,${fs.readFileSync(file).toString('base64')}`;
}

const nodes = [
  {
    no: '01',
    title: '前策分析',
    lines: ['多维分析', '整合数据与策略', '辅助高效决策'],
    x: 208,
    y: 352,
    cardY: 380,
    icon: 'predesign',
  },
  {
    no: '02',
    title: '场地定位',
    lines: ['多维解析区位', '周边资源条件', '快速建立认知'],
    x: 398,
    y: 670,
    cardY: 696,
    icon: 'pin',
  },
  {
    no: '03',
    title: '图生模型',
    lines: ['支持总平生成', '三维模型', '加速方案迭代'],
    x: 616,
    y: 385,
    cardY: 413,
    icon: 'cube',
  },
  {
    no: '04',
    title: '数智建模',
    lines: ['参数化驱动', '高效生成', '提升建模精度'],
    x: 787,
    y: 670,
    cardY: 696,
    icon: 'model',
  },
  {
    no: '05',
    title: 'AI灵感渲染',
    lines: ['快速生成', '多维度结果', '彩总/效果图/视频'],
    x: 1000,
    y: 385,
    cardY: 413,
    icon: 'spark_image',
  },
  {
    no: '06',
    title: '总图排布',
    lines: ['自动生成', '高效合规车位', '指标实时刷新'],
    x: 1219,
    y: 670,
    cardY: 696,
    icon: 'grid',
  },
  {
    no: '07',
    title: 'AI仿真分析',
    lines: ['集成多项', '仿真分析能力', '快速反馈优化'],
    x: 1410,
    y: 385,
    cardY: 413,
    icon: 'simulation',
  },
  {
    no: '08',
    title: 'AI成本估算',
    lines: ['海量真实项目', '数据训练模型', '估算误差可控'],
    x: 1588,
    y: 670,
    cardY: 696,
    icon: 'calculator',
  },
  {
    no: '09',
    title: '文本生成',
    lines: ['整合渲染估算', '分析等成果图', '汇报PPT生成'],
    x: 1800,
    y: 385,
    cardY: 413,
    icon: 'doc',
  },
];

function iconSvg(kind) {
  const common = 'fill="#fff" stroke="#fff" stroke-width="0"';
  if (kind === 'predesign') {
    return `
      <path ${common} d="M-25-28h31l17 17v39a7 7 0 0 1-7 7h-41a7 7 0 0 1-7-7v-49a7 7 0 0 1 7-7z"/>
      <path fill="#8068ff" d="M5-28v17h17z"/>
      <path fill="#8068ff" d="M-18-4h24v7h-24zm0 14h35v7h-35z"/>
      <path fill="#fff" d="M23-38l7 15 16 6-16 7-7 16-7-16-16-7 16-6z"/>`;
  }
  if (kind === 'pin') {
    return `
      <path ${common} d="M0-35c-18 0-32 14-32 32 0 24 32 52 32 52S32 21 32-3c0-18-14-32-32-32zm0 45a14 14 0 1 1 0-28 14 14 0 0 1 0 28z"/>`;
  }
  if (kind === 'cube') {
    return `
      <path ${common} d="M0-38 35-18 0 2-35-18z"/>
      <path ${common} d="M-35-10 0 10v40l-35-20z" opacity=".92"/>
      <path ${common} d="M35-10 0 10v40l35-20z" opacity=".82"/>`;
  }
  if (kind === 'model') {
    return `
      <path ${common} d="M0-38 12-14H-12zM0 38l-12-24h24z"/>
      <path ${common} d="M-36 26h28L6-5l-12-6zm72 0H8L-6-5l12-6z" opacity=".92"/>
      <circle cx="0" cy="-4" r="7" fill="#fff"/>`;
  }
  if (kind === 'spark_image') {
    return `
      <rect x="-33" y="-30" width="56" height="46" rx="8" fill="#fff"/>
      <circle cx="-14" cy="-12" r="6" fill="#8068ff"/>
      <path fill="#8068ff" d="m-29 11 17-18 13 13 9-10 18 15z"/>
      <path fill="#fff" d="M28-40l6 13 14 5-14 6-6 14-6-14-14-6 14-5z"/>`;
  }
  if (kind === 'grid') {
    return `
      <rect x="-35" y="-33" width="22" height="22" rx="3" fill="#fff"/>
      <rect x="-6" y="-33" width="22" height="22" rx="3" fill="#fff"/>
      <rect x="23" y="-33" width="22" height="22" rx="3" fill="#fff"/>
      <rect x="-35" y="-4" width="22" height="22" rx="3" fill="#fff"/>
      <rect x="-6" y="-4" width="22" height="22" rx="3" fill="#fff"/>
      <rect x="23" y="-4" width="22" height="22" rx="3" fill="#fff"/>
      <rect x="-35" y="25" width="22" height="22" rx="3" fill="#fff"/>
      <rect x="-6" y="25" width="22" height="22" rx="3" fill="#fff"/>
      <rect x="23" y="25" width="22" height="22" rx="3" fill="#fff"/>
      <path fill="#8068ff" d="M-28-25h8v8h-8zm29 29h8v8H1zm29 29h8v8h-8z"/>`;
  }
  if (kind === 'simulation') {
    return `
      <circle cx="0" cy="0" r="28" fill="none" stroke="#fff" stroke-width="8"/>
      <path fill="#8068ff" d="M-4-36h8v18h-8zm0 54h8v18h-8zM-36-4h18v8h-18zm54 0h18v8H18z"/>
      <circle cx="0" cy="0" r="10" fill="#fff"/>`;
  }
  if (kind === 'calculator') {
    return `
      <rect x="-28" y="-36" width="56" height="72" rx="8" fill="#fff"/>
      <rect x="-18" y="-24" width="36" height="14" rx="3" fill="#8068ff"/>
      <circle cx="-15" cy="3" r="5" fill="#8068ff"/>
      <circle cx="0" cy="3" r="5" fill="#8068ff"/>
      <circle cx="15" cy="3" r="5" fill="#8068ff"/>
      <circle cx="-15" cy="20" r="5" fill="#8068ff"/>
      <circle cx="0" cy="20" r="5" fill="#8068ff"/>
      <circle cx="15" cy="20" r="5" fill="#8068ff"/>`;
  }
  return `
    <path ${common} d="M-24-35h34l20 20v43a8 8 0 0 1-8 8h-46a8 8 0 0 1-8-8v-55a8 8 0 0 1 8-8z"/>
    <path fill="#8068ff" d="M9-35v20h20z"/>
    <path fill="#8068ff" d="M-16-5h28v7h-28zm0 15h33v7h-33zm0 15h24v7h-24z"/>`;
}

function nodeSvg(n) {
  const cardW = 136;
  const cardH = 174;
  const cardX = n.x - cardW / 2;
  const textY = n.cardY + 72;
  const titleSize = n.title.length >= 6 ? 23 : 24;
  const lineSize = 13.4;
  const subLines = n.lines.map((line, i) => (
    `<text x="${n.x}" y="${textY + 29 + i * 22}" text-anchor="middle" font-family="MiSans, PingFang SC, Arial, sans-serif" font-size="${lineSize}" font-weight="500" fill="#65708d">${esc(line)}</text>`
  )).join('\n');
  return `
    <g>
      <rect x="${cardX - 22}" y="${n.cardY - 26}" width="${cardW + 44}" height="${cardH + 52}" rx="34" fill="#f5f6ff" opacity=".92"/>
      <rect x="${cardX - 9}" y="${n.cardY - 13}" width="${cardW + 18}" height="${cardH + 22}" rx="30" fill="#f8f9ff" opacity=".98"/>
      <rect x="${cardX}" y="${n.cardY}" width="${cardW}" height="${cardH}" rx="24" fill="#fbfcff" opacity="1" stroke="#c6c1ea" stroke-width="1.4"/>
      <text x="${n.x}" y="${n.cardY + 42}" text-anchor="middle" font-family="MiSans, PingFang SC, Arial, sans-serif" font-size="22" font-weight="800" fill="#5d52f4">${n.no}</text>
      <text x="${n.x}" y="${textY}" text-anchor="middle" font-family="MiSans, PingFang SC, Arial, sans-serif" font-size="${titleSize}" font-weight="800" fill="#111c36">${esc(n.title)}</text>
      ${subLines}
      <circle cx="${n.x}" cy="${n.y}" r="65" fill="#ffffff" opacity=".44"/>
      <circle cx="${n.x}" cy="${n.y}" r="54" fill="url(#nodeGlow)" opacity=".36"/>
      <circle cx="${n.x}" cy="${n.y}" r="47" fill="url(#nodeGrad)" filter="url(#softShadow)"/>
      <circle cx="${n.x - 14}" cy="${n.y - 18}" r="19" fill="#fff" opacity=".12"/>
      <g transform="translate(${n.x} ${n.y}) scale(.86)">
        ${iconSvg(n.icon)}
      </g>
    </g>`;
}

function svg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="nodeGrad" cx="42%" cy="28%" r="78%">
      <stop offset="0%" stop-color="#a98bff"/>
      <stop offset="54%" stop-color="#7459ff"/>
      <stop offset="100%" stop-color="#4e48e7"/>
    </radialGradient>
    <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#6e5cff" stop-opacity=".8"/>
      <stop offset="60%" stop-color="#6e5cff" stop-opacity=".28"/>
      <stop offset="100%" stop-color="#6e5cff" stop-opacity="0"/>
    </radialGradient>
    <filter id="softShadow" x="-80%" y="-80%" width="260%" height="260%">
      <feDropShadow dx="0" dy="8" stdDeviation="9" flood-color="#5746d6" flood-opacity=".34"/>
      <feDropShadow dx="0" dy="0" stdDeviation="13" flood-color="#8b7bff" flood-opacity=".45"/>
    </filter>
  </defs>
  <image href="${dataUri(ref)}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="none"/>
  ${nodes.map(nodeSvg).join('\n')}
</svg>`;
}

const content = svg();
fs.writeFileSync(outSvg, content);
await sharp(Buffer.from(content)).png().toFile(outPng);
await sharp(outPng).jpeg({ quality: 94 }).toFile(outJpg);

console.log(outPng);
console.log(outJpg);
console.log(outSvg);
