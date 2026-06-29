import fs from 'fs';
import path from 'path';
import sharp from './thumbs/node_modules/sharp/dist/index.mjs';

const cwd = process.cwd();
const base = path.join(cwd, '.tools', 'transition_test_assets', 'workflow.jpg');
const out = path.join(cwd, '06_预览输出', 'Concetto_2.0_九环节总览_原版局部重排_v10.jpg');

const meta = await sharp(base).metadata();
const W = meta.width;
const H = meta.height;

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// 只覆盖节点卡片内部的旧标题与说明，背景、连线、图标、底部按钮等全部保留。
const nodes = [
  {
    no: '03',
    x: 365,
    y: 274,
    w: 140,
    h: 104,
    title: '图生模型',
    lines: ['支持总平生成', '三维模型'],
    titleSize: 18,
  },
  {
    no: '04',
    x: 466,
    y: 486,
    w: 138,
    h: 98,
    title: '数智建模',
    lines: ['参数化驱动生成', '提升建模效率'],
    titleSize: 18,
  },
  {
    no: '05',
    x: 608,
    y: 274,
    w: 154,
    h: 104,
    title: 'AI灵感渲染',
    lines: ['快速生成多维', '彩总/效果图/视频'],
    titleSize: 16,
  },
  {
    no: '06',
    x: 759,
    y: 486,
    w: 134,
    h: 98,
    title: '总图排布',
    lines: ['自动生成合规车位', '指标实时刷新'],
    titleSize: 18,
  },
  {
    no: '07',
    x: 900,
    y: 274,
    w: 150,
    h: 104,
    title: 'AI仿真分析',
    lines: ['集成多项仿真', '快速反馈优化'],
    titleSize: 16,
  },
  {
    no: '08',
    x: 1005,
    y: 486,
    w: 132,
    h: 98,
    title: 'AI成本估算',
    lines: ['项目数据训练', '估算误差可控'],
    titleSize: 16,
  },
];

let svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
<defs>
  <filter id="soft"><feGaussianBlur stdDeviation="0.25"/></filter>
</defs>`;

for (const n of nodes) {
  svg += `
  <g>
    <rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="12" fill="#fbfaff" fill-opacity="0.94" filter="url(#soft)"/>
    <text x="${n.x + n.w / 2}" y="${n.y + 24}" text-anchor="middle" font-family="PingFang SC, Hiragino Sans GB, Noto Sans CJK SC, Arial, sans-serif" font-size="15" font-weight="700" fill="#6d63f6">${esc(n.no)}</text>
    <text x="${n.x + n.w / 2}" y="${n.y + 50}" text-anchor="middle" font-family="PingFang SC, Hiragino Sans GB, Noto Sans CJK SC, Arial, sans-serif" font-size="${n.titleSize}" font-weight="700" fill="#161b38">${esc(n.title)}</text>`;
  n.lines.forEach((line, i) => {
    svg += `
    <text x="${n.x + n.w / 2}" y="${n.y + 70 + i * 14}" text-anchor="middle" font-family="PingFang SC, Hiragino Sans GB, Noto Sans CJK SC, Arial, sans-serif" font-size="10.5" font-weight="400" fill="#6b7088">${esc(line)}</text>`;
  });
  svg += `
  </g>`;
}

svg += `</svg>`;

await sharp(base)
  .composite([{ input: Buffer.from(svg), left: 0, top: 0 }])
  .jpeg({ quality: 94 })
  .toFile(out);

console.log(out);
