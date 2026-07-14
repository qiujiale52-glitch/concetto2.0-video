import fs from 'fs';
import path from 'path';
import sharp from './thumbs/node_modules/sharp/dist/index.mjs';

const cwd = process.cwd();
const source = path.join(cwd, '九大环节最新版', '九大环节总览_最新版.svg');
const outDir = path.join(cwd, '九大环节最新版', '黑场版静态提案');
const outSvg = path.join(outDir, '九大环节总览_黑场微光_v01.svg');
const outPng = path.join(outDir, '九大环节总览_黑场微光_v01.png');

fs.mkdirSync(outDir, { recursive: true });

let svg = fs.readFileSync(source, 'utf8');

// Remove the embedded white raster base. The nine foreground modules remain vector-accurate.
svg = svg
  .split('\n')
  .filter((line) => !line.includes('<image href="data:image/png;base64,'))
  .join('\n');

const extraDefs = `
    <style>
      text { font-family: 'PingFang SC', 'Hiragino Sans GB', Arial, sans-serif !important; }
    </style>
    <radialGradient id="darkCore" cx="50%" cy="48%" r="72%">
      <stop offset="0%" stop-color="#251c58" stop-opacity=".42"/>
      <stop offset="42%" stop-color="#0b091b" stop-opacity=".55"/>
      <stop offset="100%" stop-color="#020207" stop-opacity="1"/>
    </radialGradient>
    <linearGradient id="curveDarkGrad" gradientUnits="userSpaceOnUse" x1="190" y1="360" x2="1830" y2="390">
      <stop offset="0%" stop-color="#7061e8" stop-opacity=".40"/>
      <stop offset="36%" stop-color="#a18cff" stop-opacity=".70"/>
      <stop offset="68%" stop-color="#7567ff" stop-opacity=".58"/>
      <stop offset="100%" stop-color="#c7bdff" stop-opacity=".42"/>
    </linearGradient>
    <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#5e50d8" stop-opacity="0"/>
      <stop offset="34%" stop-color="#8b7cff" stop-opacity=".46"/>
      <stop offset="68%" stop-color="#b09aff" stop-opacity=".31"/>
      <stop offset="100%" stop-color="#6e5cff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="bannerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#17132f" stop-opacity=".92"/>
      <stop offset="52%" stop-color="#100d24" stop-opacity=".86"/>
      <stop offset="100%" stop-color="#1d1740" stop-opacity=".92"/>
    </linearGradient>
    <filter id="darkCurveGlow" x="-20%" y="-100%" width="140%" height="300%">
      <feGaussianBlur stdDeviation="8"/>
    </filter>
    <filter id="darkTextGlow" x="-40%" y="-80%" width="180%" height="260%">
      <feDropShadow dx="0" dy="0" stdDeviation="5" flood-color="#9b88ff" flood-opacity=".30"/>
    </filter>
    <filter id="buildingGlow" x="-100%" y="-100%" width="300%" height="300%">
      <feDropShadow dx="0" dy="0" stdDeviation="14" flood-color="#7563ff" flood-opacity=".42"/>
    </filter>`;

svg = svg.replace('</defs>', `${extraDefs}\n  </defs>`);

const curve = 'M208 352 C300 352 306 670 398 670 C492 670 522 385 616 385 C708 385 695 670 787 670 C882 670 905 385 1000 385 C1094 385 1125 670 1219 670 C1312 670 1317 385 1410 385 C1500 385 1498 670 1588 670 C1681 670 1707 385 1800 385';

const darkBase = `
  <rect x="0" y="0" width="2048" height="1152" fill="#020207"/>
  <rect x="0" y="0" width="2048" height="1152" fill="url(#darkCore)"/>
  <ellipse cx="1024" cy="500" rx="760" ry="430" fill="#5741d7" opacity=".035" filter="url(#darkCurveGlow)"/>

  <g opacity=".38">
    <path d="M-70 1065 C270 900 570 1108 905 982 C1232 858 1536 1056 2120 846" fill="none" stroke="url(#waveGrad)" stroke-width="2.4"/>
    <path d="M-70 1092 C285 924 575 1132 930 1005 C1265 884 1584 1087 2120 886" fill="none" stroke="url(#waveGrad)" stroke-width="1.35" opacity=".72"/>
    <path d="M-80 1116 C280 968 625 1148 982 1032 C1328 918 1642 1105 2112 933" fill="none" stroke="url(#waveGrad)" stroke-width="1" opacity=".42"/>
  </g>

  <g transform="translate(1024 768)" opacity=".17" filter="url(#buildingGlow)">
    <ellipse cx="0" cy="44" rx="132" ry="42" fill="none" stroke="#8a78ff" stroke-width="2"/>
    <ellipse cx="0" cy="44" rx="94" ry="28" fill="none" stroke="#c1b6ff" stroke-width="1.2" opacity=".55"/>
    <path d="M-92 44V-10L-54-32V44M-49 44V-92L-5-118V44M2 44V-162L46-136V44M53 44V-70L88-49V44" fill="#7565ff" fill-opacity=".10" stroke="#b6a9ff" stroke-width="1.3"/>
    <path d="M-92-10-54 12M-49-92-5-66M2-162 46-136M53-70 88-49" stroke="#e3dcff" stroke-width="1" opacity=".42"/>
    <path d="M-75 34V1M-64 28V-5M-33 34V-72M-19 34V-81M18 34V-130M32 34V-121M67 34V-52M78 34V-43" stroke="#9a89ff" stroke-width="1" opacity=".65"/>
  </g>

  <text x="1024" y="155" text-anchor="middle" font-size="54" font-weight="800" fill="#f6f4ff" letter-spacing="1.5" filter="url(#darkTextGlow)">AI 重塑建筑方案设计师的完整旅程</text>
  <text x="1024" y="205" text-anchor="middle" font-size="20" font-weight="500" fill="#aaa4c8" letter-spacing="2">九大环节串联，从任务书解读到汇报材料合成，一条工作流走完方案全过程</text>
  <path d="M1470 106 l7 15 16 7-16 7-7 16-7-16-16-7 16-7z" fill="#aa97ff" opacity=".88" filter="url(#darkTextGlow)"/>
  <path d="M1511 83 l4 9 10 4-10 4-4 10-4-10-10-4 10-4z" fill="#d7ceff" opacity=".66"/>

  <path d="${curve}" fill="none" stroke="#6f5aff" stroke-width="10" stroke-linecap="round" opacity=".10" filter="url(#darkCurveGlow)"/>
  <path d="${curve}" fill="none" stroke="url(#curveDarkGrad)" stroke-width="2.2" stroke-linecap="round" opacity=".84"/>
  <path d="${curve}" fill="none" stroke="#d6ceff" stroke-width=".85" stroke-dasharray="4 14" stroke-linecap="round" opacity=".32"/>

  <g>
    <rect x="374" y="928" width="1300" height="112" rx="34" fill="url(#bannerGrad)" stroke="#8171e8" stroke-opacity=".38"/>
    <circle cx="445" cy="984" r="34" fill="url(#nodeGrad)" opacity=".86" filter="url(#softShadow)"/>
    <path d="M442 958l-15 29h14l-5 24 25-36h-14l9-17z" fill="#fff"/>
    <text x="502" y="977" font-size="24" font-weight="800" fill="#f7f5ff">完整闭环方案设计工作流</text>
    <text x="502" y="1008" font-size="14" font-weight="500" fill="#9993b6">通过数据反馈不断优化专注策略，形成正向循环，持续提升个人效能</text>
    <rect x="1260" y="958" width="350" height="54" rx="18" fill="#7562f5" opacity=".82" filter="url(#darkTextGlow)"/>
    <text x="1430" y="992" text-anchor="middle" font-size="18" font-weight="700" fill="#fff">开始体验 全新 CONCETTO 2.0  →</text>
  </g>`;

svg = svg.replace(/(<\/defs>)/, `$1${darkBase}`);

svg = svg
  .replace(/>总图排布</g, '>车库智能排布<')
  .replace(/fill="#f5f6ff" opacity="\.92"/g, 'fill="#17142e" opacity=".66"')
  .replace(/fill="#f8f9ff" opacity="\.98"/g, 'fill="#100e23" opacity=".82"')
  .replace(/fill="#fbfcff" opacity="1" stroke="#c6c1ea"/g, 'fill="#080714" opacity=".92" stroke="#8f80ff" stroke-opacity=".54"')
  .replace(/fill="#111c36"/g, 'fill="#f6f3ff"')
  .replace(/fill="#65708d"/g, 'fill="#aaa5c7"')
  .replace(/fill="#5d52f4"/g, 'fill="#b9adff"')
  .replace(/<circle cx="([^"]+)" cy="([^"]+)" r="65" fill="#ffffff" opacity="\.44"\/>/g, '<circle cx="$1" cy="$2" r="65" fill="#8b78ff" opacity=".10"/>')
  .replace(/<circle cx="([^"]+)" cy="([^"]+)" r="54" fill="url\(#nodeGlow\)" opacity="\.36"\/>/g, '<circle cx="$1" cy="$2" r="57" fill="url(#nodeGlow)" opacity=".56"/>');

fs.writeFileSync(outSvg, svg);
await sharp(Buffer.from(svg)).png().toFile(outPng);
console.log(outPng);
