import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import sharp from './thumbs/node_modules/sharp/dist/index.mjs';

const cwd = process.cwd();
const ffmpeg = path.join(cwd, '.tools/media-bin/node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg');
const ffprobe = path.join(cwd, '.tools/media-bin/node_modules/@ffprobe-installer/darwin-arm64/ffprobe');
const previewMode = process.env.RENDER_MODE === 'preview';
const progressMode = process.env.PROGRESS_MODE || 'embedded';
const selectedChapter = process.env.CHAPTER || '';
const selectedChapters = process.env.CHAPTERS || selectedChapter;
const outDir = path.join(cwd, '06_预览输出', 'chapter_covers_clean_v01_parts');
const frameRoot = path.join(outDir, 'chapter_frames');
const sideRoot = path.join(outDir, 'side_frames');
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(frameRoot, { recursive: true });
fs.mkdirSync(sideRoot, { recursive: true });

const W = previewMode ? 1280 : 2560;
const H = previewMode ? 720 : 1440;
const DW = 1920;
const DH = 1080;
const fps = previewMode ? 30 : 60;
const chapterDur = 3.6;
const FRAME_CONCURRENCY = Math.max(1, Number.parseInt(process.env.FRAME_CONCURRENCY || '2', 10) || 2);
const RESUME_FRAMES = process.env.RESUME_FRAMES === '1';

const music = path.join(cwd, '04-正版授权音乐库', '未来科技宽广磅礴音乐15437.wav');
const selectionTag = selectedChapters ? selectedChapters.replace(/[^0-9,-]/g, '').replace(/,/g, '-') : '01-09';
const progressSuffix = progressMode === 'none' ? '_无内嵌进度层' : '';
const output = path.join(cwd, '06_预览输出', previewMode ? `Concetto_2.0_章节顶部九环引线推进_${selectionTag}_v04${progressSuffix}_低清预览.mp4` : `Concetto_2.0_章节顶部九环引线推进_${selectionTag}_v04${progressSuffix}_2560p60.mp4`);

const local = (p) => path.join(cwd, 'CC 2.0宣发/Resources/local', p);
const manual = (...p) => path.join(cwd, '手动保存素材', ...p);
const v04Part = (n) => path.join(cwd, '06_预览输出/workflow_strict_v04_parts', `part_${String(n).padStart(2, '0')}.mp4`);

const sections = [
  {
    no: '01',
    title: '前策分析',
    sub: '目标设定与需求分析',
    desc: '多维分析，整合数据与策略，辅助高效决策与成果输出',
    card: local('d2762fc4b89fe6b51164939fe8df53d1.png'),
    source: manual('前策分析', '前策分析-1.mov'),
    sourceStart: 4,
    sourceDur: 38,
    parts: [v04Part(0)],
  },
  {
    no: '02',
    title: '场地定位',
    sub: '地理位置与周边环境分析',
    desc: '快速锁定场地条件，让区位、周边环境与设计边界清晰浮现',
    card: local('176057603fd1bc14879a80ce13fdb664.png'),
    source: manual('场地定位', '场地定位-1.mov'),
    sourceStart: 3,
    sourceDur: 44,
    parts: [v04Part(1)],
  },
  {
    no: '03',
    title: '图生模型',
    sub: '支持总平直接生成三维模型',
    desc: '上传总平图，快速生成可编辑三维模型，减少重复工作',
    card: local('d0965d0ab74b18687aee8d256a28c88e.png'),
    source: manual('图生模型', '图生模型-1.mov'),
    sourceStart: 3,
    sourceDur: 35,
    parts: [v04Part(2)],
  },
  {
    no: '04',
    title: '数智建模',
    sub: '参数化驱动高效生成',
    desc: '以参数化能力提升建模速度与精度，让方案生成更高效',
    card: local('d3fcf9026ef31f64a923dbd6642394f1.png'),
    source: manual('数智建模', '数智建模-1.mov'),
    sourceStart: 18,
    sourceDur: 50,
    parts: [v04Part(3), v04Part(4)],
  },
  {
    no: '05',
    title: 'AI灵感渲染',
    sub: '快速生成多维度结果',
    desc: '输出彩总、效果图与动态视频，让创意表达更灵活',
    card: local('5e8962f826804a260077f7dfc4736d47.png'),
    source: manual('灵感渲染（普通渲染）', '灵感渲染（普通渲染）.mov'),
    sourceStart: 2,
    sourceDur: 35,
    parts: [v04Part(5), v04Part(6)],
  },
  {
    no: '06',
    title: '车库智能排布',
    sub: '自动生成高效合规车位',
    desc: '支持修改与指标实时刷新，让专项排布快速进入可优化状态',
    card: local('233bf84d9a4a141ad1bf43fcc299bcdc.png'),
    source: manual('车库智能排布', '车库智能排布-1.mov'),
    sourceStart: 5,
    sourceDur: 58,
    parts: [v04Part(7), v04Part(8)],
  },
  {
    no: '07',
    title: 'AI仿真分析',
    sub: '集成多项仿真分析能力',
    desc: '实现快速反馈与实时优化，让方案性能判断更直观',
    card: local('6d473a175bd0b0933225dc743495e6ff.png'),
    source: manual('ai仿真分析', 'ai仿真分析-1.mov'),
    sourceStart: 74,
    sourceDur: 12,
    parts: [v04Part(9), v04Part(10)],
  },
  {
    no: '08',
    title: 'AI成本估算',
    sub: '海量真实项目数据训练模型',
    desc: '快速完成估算，误差可控，为方案决策提供量化依据',
    card: local('a18601b29bad07eee0f0dd302ada6a82.png'),
    source: manual('ai成本估算', 'ai成本估算-1.mov'),
    sourceStart: 9,
    sourceDur: 111,
    parts: [v04Part(11)],
  },
  {
    no: '09',
    title: '文本生成',
    sub: '整合成果图，自动生成汇报 PPT',
    desc: '整合渲染、估算、分析等成果图，汇报 PPT 自动生成',
    card: local('cf7daf0237d7acc922506778217aca01.png'),
    source: manual('文本生成', '文本生成-1.mov'),
    sourceStart: 150,
    sourceDur: 188,
    parts: [v04Part(12)],
  },
];

function run(args, label) {
  const r = spawnSync(ffmpeg, args, { stdio: 'inherit' });
  if (r.status !== 0) throw new Error(`${label} failed with status ${r.status}`);
}

function probeDur(file) {
  const r = spawnSync(ffprobe, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nk=1:nw=1', file], { encoding: 'utf8' });
  const n = Number.parseFloat(r.stdout.trim());
  return Number.isFinite(n) ? n : 0;
}

function dataUri(file) {
  const ext = path.extname(file).toLowerCase();
  const mime = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/png';
  return `data:${mime};base64,${fs.readFileSync(file).toString('base64')}`;
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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

function extractSideFrames(section, idx) {
  const dir = path.join(sideRoot, section.no);
  fs.mkdirSync(dir, { recursive: true });
  const duration = Math.max(1, probeDur(section.source));
  const offsets = [0.08, 0.46, 0.78];
  const files = [];
  for (let i = 0; i < offsets.length; i++) {
    const out = path.join(dir, `side_${i}.jpg`);
    files.push(out);
    if (fs.existsSync(out)) continue;
    const ts = Math.max(0.1, duration * offsets[i]);
    run([
      '-y',
      '-ss', String(ts),
      '-i', section.source,
      '-frames:v', '1',
      '-vf', 'scale=640:-1',
      out,
    ], `extract side ${idx}-${i}`);
  }
  return files;
}

function defs() {
  return `
  <defs>
    <radialGradient id="core" cx="50%" cy="56%" r="62%">
      <stop offset="0%" stop-color="#6e5cff" stop-opacity="0.42"/>
      <stop offset="42%" stop-color="#151137" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4d71ff"/>
      <stop offset="54%" stop-color="#8067ff"/>
      <stop offset="100%" stop-color="#be7cf5"/>
    </linearGradient>
    <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#7668ff" stop-opacity="0"/>
      <stop offset="50%" stop-color="#d8d2ff" stop-opacity="0.86"/>
      <stop offset="100%" stop-color="#7668ff" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="progressActive" cx="38%" cy="25%" r="78%">
      <stop offset="0%" stop-color="#d9d0ff" stop-opacity=".90"/>
      <stop offset="24%" stop-color="#ac98ff" stop-opacity=".80"/>
      <stop offset="58%" stop-color="#7d65ff" stop-opacity=".68"/>
      <stop offset="100%" stop-color="#5144dc" stop-opacity=".48"/>
    </radialGradient>
    <radialGradient id="progressIdle" cx="40%" cy="28%" r="78%">
      <stop offset="0%" stop-color="#3d396e"/><stop offset="100%" stop-color="#17172d"/>
    </radialGradient>
    <linearGradient id="progressLine" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#8e86dc" stop-opacity=".24"/>
      <stop offset="12%" stop-color="#6258bd" stop-opacity=".17"/>
      <stop offset="100%" stop-color="#504a91" stop-opacity=".09"/>
    </linearGradient>
    <linearGradient id="progressTrailChromatic" gradientUnits="userSpaceOnUse" x1="642" y1="130" x2="1650" y2="131">
      <stop offset="0%" stop-color="#6954d9"/>
      <stop offset="24%" stop-color="#a77cff"/>
      <stop offset="48%" stop-color="#746fff"/>
      <stop offset="70%" stop-color="#90c6ff"/>
      <stop offset="86%" stop-color="#e3d8ff"/>
      <stop offset="100%" stop-color="#8d6dff"/>
    </linearGradient>
    <filter id="blur8"><feGaussianBlur stdDeviation="8"/></filter>
    <filter id="blur20"><feGaussianBlur stdDeviation="20"/></filter>
    <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
      <feDropShadow dx="0" dy="0" stdDeviation="20" flood-color="#7465ff" flood-opacity="0.68"/>
      <feDropShadow dx="0" dy="12" stdDeviation="34" flood-color="#271b82" flood-opacity="0.52"/>
    </filter>
    <filter id="panelGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="0" stdDeviation="14" flood-color="#5d52d9" flood-opacity="0.30"/>
    </filter>
    <filter id="progressGlow" x="-140%" y="-140%" width="380%" height="380%">
      <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#ffffff" flood-opacity="1"/>
      <feDropShadow dx="0" dy="0" stdDeviation="10" flood-color="#f6f2ff" flood-opacity=".88"/>
      <feDropShadow dx="0" dy="0" stdDeviation="18" flood-color="#a28cff" flood-opacity=".60"/>
      <feDropShadow dx="0" dy="8" stdDeviation="28" flood-color="#6147e8" flood-opacity=".45"/>
    </filter>
    <filter id="progressSweepGlow" x="-30%" y="-200%" width="160%" height="500%"><feGaussianBlur stdDeviation="7"/></filter>
    <filter id="progressHeadSoftGlow" x="-80%" y="-250%" width="260%" height="600%">
      <feGaussianBlur stdDeviation="4.8"/>
    </filter>
    <clipPath id="cardClip"><rect x="0" y="0" width="590" height="340" rx="42"/></clipPath>
    <clipPath id="sideClip"><rect x="0" y="0" width="430" height="260" rx="8"/></clipPath>
  </defs>`;
}

const progressNodes = [
  { x: 642, y: 130, icon: 'documentSpark' }, { x: 768, y: 194, icon: 'pin' },
  { x: 894, y: 131, icon: 'cube' }, { x: 1020, y: 194, icon: 'model' },
  { x: 1146, y: 131, icon: 'imageSpark' }, { x: 1272, y: 194, icon: 'grid' },
  { x: 1398, y: 131, icon: 'target' }, { x: 1524, y: 194, icon: 'calculator' },
  { x: 1650, y: 131, icon: 'document' },
];
const progressPath = 'M642 130 C705 130 705 194 768 194 S831 131 894 131 S957 194 1020 194 S1083 131 1146 131 S1209 194 1272 194 S1335 131 1398 131 S1461 194 1524 194 S1587 131 1650 131';

function progressIcon(name, x, y, scale, opacity) {
  const t = `translate(${x} ${y}) scale(${scale})`;
  const white = `fill="#fff" opacity="${opacity.toFixed(3)}"`;
  const purple = '#7565ff';
  const icons = {
    documentSpark: `<g transform="${t}"><path ${white} d="M-13-17h17l9 9v21a4 4 0 0 1-4 4h-22a4 4 0 0 1-4-4v-26a4 4 0 0 1 4-4z"/><path fill="${purple}" opacity="${opacity}" d="M3-17v10h10zM-10-2H3v4h-13zm0 8H8v4h-18z"/><path ${white} d="M13-22l4 8 8 4-8 4-4 8-4-8-8-4 8-4z"/></g>`,
    pin: `<g transform="${t}"><path ${white} d="M0-18c-10 0-18 8-18 18 0 13 18 29 18 29S18 13 18 0c0-10-8-18-18-18zm0 25a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"/></g>`,
    cube: `<g transform="${t}"><path ${white} d="M0-20 19-10 0 1-19-10zM-19-5 0 6v22L-19 17zm38 0L0 6v22l19-11z"/></g>`,
    model: `<g transform="${t}"><path ${white} d="M0-20 7-7H-7zM0 20l-7-13H7zM-19 14h15L3-3l-7-3zm38 0H4L-3-3l7-3z"/><circle ${white} cx="0" cy="-2" r="4"/></g>`,
    imageSpark: `<g transform="${t}"><rect ${white} x="-18" y="-15" width="30" height="25" rx="4"/><circle fill="${purple}" opacity="${opacity}" cx="-8" cy="-6" r="3"/><path fill="${purple}" opacity="${opacity}" d="m-16 7 9-10 7 7 5-6 10 9z"/><path ${white} d="M15-20l3 7 8 3-8 3-3 8-3-8-8-3 8-3z"/></g>`,
    grid: `<g transform="${t}">${[-13,0,13].flatMap((xx)=>[-13,0,13].map((yy)=>`<rect ${white} x="${xx-5}" y="${yy-5}" width="10" height="10" rx="2"/>`)).join('')}</g>`,
    target: `<g transform="${t}"><circle cx="0" cy="0" r="15" fill="none" stroke="#fff" stroke-width="4" opacity="${opacity}"/><circle ${white} cx="0" cy="0" r="5"/><path stroke="#fff" stroke-width="4" opacity="${opacity}" d="M0-24v9M0 15v9M-24 0h9M15 0h9"/></g>`,
    calculator: `<g transform="${t}"><rect ${white} x="-14" y="-19" width="28" height="38" rx="5"/><rect fill="${purple}" opacity="${opacity}" x="-9" y="-14" width="18" height="7" rx="2"/>${[-7,0,7].flatMap((xx)=>[1,9].map((yy)=>`<circle fill="${purple}" opacity="${opacity}" cx="${xx}" cy="${yy}" r="2.5"/>`)).join('')}</g>`,
    document: `<g transform="${t}"><path ${white} d="M-13-19h18l10 10v23a4 4 0 0 1-4 4h-24a4 4 0 0 1-4-4v-29a4 4 0 0 1 4-4z"/><path fill="${purple}" opacity="${opacity}" d="M4-19v11h11zM-10-2H5v4h-15zm0 8H8v4h-18z"/></g>`,
  };
  return icons[name];
}

function progressGeometry(progress) {
  const points = [];
  const samplesPerSegment = 42;
  for (let segment = 0; segment < progressNodes.length - 1; segment++) {
    const a = progressNodes[segment];
    const b = progressNodes[segment + 1];
    const mx = (a.x + b.x) / 2;
    for (let i = segment === 0 ? 0 : 1; i <= samplesPerSegment; i++) {
      const u = i / samplesPerSegment;
      const v = 1 - u;
      const x = v*v*v*a.x + 3*v*v*u*mx + 3*v*u*u*mx + u*u*u*b.x;
      const y = v*v*v*a.y + 3*v*v*u*a.y + 3*v*u*u*b.y + u*u*u*b.y;
      points.push({ x, y });
    }
  }
  const end = Math.max(0, Math.min(points.length - 1, Math.round(progress * (points.length - 1))));
  const start = Math.max(0, end - 36);
  const toPath = (list) => list.length ? `M${list.map((p) => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' L')}` : '';
  const headPoints = points.slice(start, end + 1);
  const headSegments = [];
  const segmentCount = 8;
  for (let segment = 0; segment < segmentCount; segment++) {
    const from = Math.floor(segment * Math.max(1, headPoints.length - 1) / segmentCount);
    const to = Math.min(headPoints.length, Math.ceil((segment + 1) * Math.max(1, headPoints.length - 1) / segmentCount) + 2);
    const list = headPoints.slice(from, to);
    if (list.length > 1) headSegments.push(toPath(list));
  }
  return {
    trailPath: toPath(points.slice(0, end + 1)),
    headPath: toPath(headPoints),
    headSegments,
    headTip: points[end],
  };
}

function progressOverlay(section, t, opacity) {
  const current = Number(section.no) - 1;
  const transfer = current === 0 ? smooth(0.28, 1.18, t) : smooth(0.36, 1.22, t);
  const previous = current > 0 ? current - 1 : -1;
  const sweepP = smooth(0.48, 1.62, t);
  const sweepA = smooth(0.39, 0.56, t) * (1 - smooth(1.58, 1.82, t));
  const { trailPath, headPath, headSegments, headTip } = progressGeometry(sweepP);
  const flowOffset = (-t * 18).toFixed(2);
  const headMarkup = headSegments.map((path, index) => {
    const p = headSegments.length <= 1 ? 1 : index / (headSegments.length - 1);
    const width = 2.2 + 6.2 * Math.pow(p, 1.34);
    const alpha = (0.20 + 0.80 * Math.pow(p, 1.15)) * sweepA * opacity;
    const color = p > 0.72 ? '#ffffff' : p > 0.40 ? '#e8ddff' : '#9b7cff';
    return `<path d="${path}" fill="none" stroke="${color}" stroke-width="${width.toFixed(2)}" stroke-linecap="round" stroke-linejoin="round" opacity="${alpha.toFixed(3)}" ${p > 0.54 ? 'filter="url(#progressHeadSoftGlow)"' : ''}/>`;
  }).join('');
  const ringRotation = (t * 115) % 360;
  const nodeMarkup = progressNodes.map((node, index) => {
    let strength = 0;
    if (index === current) strength = transfer;
    if (index === previous) strength = 1 - transfer;
    const r = 22 + 19 * strength;
    const circleOpacity = 0.20 + 0.46 * strength;
    const iconOpacity = 0.14 + 0.86 * strength;
    const iconScale = 0.62 + 0.42 * strength;
    const halo = strength * opacity;
    return `<g opacity="${opacity.toFixed(3)}">
      ${strength > 0.001 ? `<circle cx="${node.x}" cy="${node.y}" r="${r + 24}" fill="#7964ff" opacity="${(0.07 * halo).toFixed(3)}"/><circle cx="${node.x}" cy="${node.y}" r="${r + 12}" fill="#9d88ff" opacity="${(0.10 * halo).toFixed(3)}"/>` : ''}
      <circle cx="${node.x}" cy="${node.y}" r="${r.toFixed(2)}" fill="url(#${strength > 0.001 ? 'progressActive' : 'progressIdle'})" opacity="${circleOpacity.toFixed(3)}" stroke="#fff" stroke-width="${(1 + 1.5 * strength).toFixed(2)}" stroke-opacity="${(0.07 + 0.79 * strength).toFixed(3)}" ${strength > 0.02 ? 'filter="url(#progressGlow)"' : ''}/>
      ${strength > 0.02 ? `<ellipse cx="${node.x}" cy="${node.y}" rx="${(r+8).toFixed(2)}" ry="${(r+2).toFixed(2)}" fill="none" stroke="#fff" stroke-width="1.5" stroke-dasharray="10 18" stroke-linecap="round" opacity="${(0.52*strength).toFixed(3)}" transform="rotate(${ringRotation.toFixed(1)} ${node.x} ${node.y})"/><ellipse cx="${node.x}" cy="${node.y}" rx="${(r+15).toFixed(2)}" ry="${(r+8).toFixed(2)}" fill="none" stroke="#9b8cff" stroke-width="1.2" stroke-dasharray="6 26" opacity="${(0.34*strength).toFixed(3)}" transform="rotate(${(-ringRotation*.72).toFixed(1)} ${node.x} ${node.y})"/>` : ''}
      ${progressIcon(node.icon, node.x, node.y, iconScale, iconOpacity)}
    </g>`;
  }).join('');
  return `<g transform="translate(33 21)">
    <path d="${progressPath}" fill="none" stroke="#302c55" stroke-width="1.45" opacity="${(0.18*opacity).toFixed(3)}"/>
    <path d="${trailPath}" fill="none" stroke="#675bd2" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity="${(0.060*opacity).toFixed(3)}" filter="url(#progressSweepGlow)"/>
    <path d="${trailPath}" fill="none" stroke="#7569d8" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" opacity="${(0.34*opacity).toFixed(3)}"/>
    <path d="${trailPath}" fill="none" stroke="#d9d3ff" stroke-width="1.05" stroke-linecap="round" stroke-linejoin="round" opacity="${(0.18*opacity).toFixed(3)}"/>
    <path d="${trailPath}" fill="none" stroke="url(#progressTrailChromatic)" stroke-width="5.2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="2.2 51" stroke-dashoffset="${flowOffset}" opacity="${(0.105*opacity).toFixed(3)}" filter="url(#progressHeadSoftGlow)"/>
    <path d="${trailPath}" fill="none" stroke="url(#progressTrailChromatic)" stroke-width="1.15" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="10 74" stroke-dashoffset="${flowOffset}" opacity="${(0.23*opacity).toFixed(3)}"/>
    <path d="${headPath}" fill="none" stroke="#9678ff" stroke-width="9.5" stroke-linecap="round" stroke-linejoin="round" opacity="${(0.20*sweepA*opacity).toFixed(3)}" filter="url(#progressSweepGlow)"/>
    ${headMarkup}
    <circle cx="${headTip.x.toFixed(2)}" cy="${headTip.y.toFixed(2)}" r="${(5.2 + 1.3*Math.sin(t*7)).toFixed(2)}" fill="#ffffff" opacity="${(0.92*sweepA*opacity).toFixed(3)}" filter="url(#progressGlow)"/>
    <circle cx="${headTip.x.toFixed(2)}" cy="${headTip.y.toFixed(2)}" r="2.1" fill="#ffffff" opacity="${(1.0*sweepA*opacity).toFixed(3)}"/>
    ${nodeMarkup}
  </g>`;
}

function renderSvg(section, sideFiles, t) {
  const inA = smooth(0.05, 0.8, t);
  const outA = 1 - smooth(chapterDur - 0.55, chapterDur, t);
  const a = inA * outA;
  const cardScale = 0.86 + 0.14 * easeOut(t / 1.05);
  const cardW = 590;
  const cardH = 340;
  const cardX = 665 + (1 - cardScale) * cardW / 2;
  const cardY = 395 + (1 - cardScale) * cardH / 2;
  const scan = -500 + (DW + 1000) * ((t / chapterDur) * 0.65);
  const drift = easeOut(t / chapterDur);
  const sideA = smooth(0.45, 1.25, t) * outA;
  const titleA = smooth(0.7, 1.25, t) * outA;

  const cardUri = dataUri(section.card);
  const sideUris = sideFiles.map(dataUri);

  return `<?xml version="1.0" encoding="UTF-8"?>
  <svg width="${W}" height="${H}" viewBox="0 0 ${DW} ${DH}" xmlns="http://www.w3.org/2000/svg">
    ${defs()}
    <rect width="${DW}" height="${DH}" fill="#010104"/>
    <rect width="${DW}" height="${DH}" fill="url(#core)" opacity="${(0.75 * a).toFixed(3)}"/>
    <rect x="${scan.toFixed(1)}" y="0" width="620" height="${DH}" transform="skewX(-18)" fill="url(#lineGrad)" opacity="${(0.10 * a).toFixed(3)}"/>
    <path d="M 110 820 C 520 730, 1210 752, 1800 666" stroke="#7668ff" stroke-opacity="${(0.20 * a).toFixed(3)}" stroke-width="1.2" fill="none"/>
    <path d="M 300 345 C 760 300, 1240 312, 1645 258" stroke="#ffffff" stroke-opacity="${(0.055 * a).toFixed(3)}" stroke-width="1" fill="none"/>

    <text x="112" y="136" font-family="Avenir Next, Arial" font-size="17" letter-spacing="7" fill="#857be8" opacity="${(0.72 * a).toFixed(3)}">CONCETTO 2.0</text>
    <rect x="112" y="158" width="${(185 * a).toFixed(1)}" height="1.2" fill="#7668ff" opacity="0.55"/>
    ${progressMode === 'none' ? '' : progressOverlay(section, t, outA)}

    <g opacity="${(0.45 * sideA).toFixed(3)}" filter="url(#panelGlow)" transform="translate(${(128 - 28 * drift).toFixed(1)} ${(280 - 12 * drift).toFixed(1)}) rotate(-8)">
      <rect x="-12" y="-12" width="454" height="284" rx="12" fill="#070611" stroke="#9a8cff" stroke-opacity="0.18"/>
      <g clip-path="url(#sideClip)"><image href="${sideUris[0]}" x="0" y="0" width="430" height="260" preserveAspectRatio="xMidYMid slice"/></g>
    </g>
    <g opacity="${(0.43 * sideA).toFixed(3)}" filter="url(#panelGlow)" transform="translate(${(1376 + 30 * drift).toFixed(1)} ${(288 - 8 * drift).toFixed(1)}) rotate(7)">
      <rect x="-12" y="-12" width="454" height="284" rx="12" fill="#070611" stroke="#9a8cff" stroke-opacity="0.18"/>
      <g clip-path="url(#sideClip)"><image href="${sideUris[1]}" x="0" y="0" width="430" height="260" preserveAspectRatio="xMidYMid slice"/></g>
    </g>
    <g opacity="${(0.34 * sideA).toFixed(3)}" filter="url(#panelGlow)" transform="translate(${(170 + 20 * drift).toFixed(1)} ${(780 + 18 * drift).toFixed(1)}) rotate(5)">
      <rect x="-12" y="-12" width="454" height="284" rx="12" fill="#070611" stroke="#9a8cff" stroke-opacity="0.16"/>
      <g clip-path="url(#sideClip)"><image href="${sideUris[2]}" x="0" y="0" width="430" height="260" preserveAspectRatio="xMidYMid slice"/></g>
    </g>

    <g opacity="${a.toFixed(3)}" transform="translate(${cardX.toFixed(2)} ${cardY.toFixed(2)}) scale(${cardScale.toFixed(4)})">
      <rect x="-28" y="-28" width="${cardW + 56}" height="${cardH + 56}" rx="56" fill="#151039" stroke="#8d7cff" stroke-opacity="0.30" filter="url(#glow)"/>
      <rect x="0" y="0" width="${cardW}" height="${cardH}" rx="42" fill="url(#cardGrad)" opacity="0.96"/>
      <g clip-path="url(#cardClip)">
        <image href="${cardUri}" x="0" y="0" width="${cardW}" height="${cardH}" preserveAspectRatio="xMidYMid slice"/>
        <rect x="0" y="0" width="${cardW}" height="${cardH}" fill="#ffffff" opacity="${(0.02 + 0.025 * Math.sin(t * 4)).toFixed(3)}"/>
      </g>
      <rect x="0" y="0" width="${cardW}" height="${cardH}" rx="42" fill="none" stroke="#d9d3ff" stroke-opacity="0.24" stroke-width="1.5"/>
    </g>

    <text x="960" y="805" text-anchor="middle" font-family="PingFang SC, Hiragino Sans GB, Arial" font-size="22" letter-spacing="1.2" fill="#bdb6ea" opacity="${(0.74 * titleA).toFixed(3)}">${esc(section.desc)}</text>
    <text x="960" y="875" text-anchor="middle" font-family="Avenir Next, Arial" font-size="18" letter-spacing="7" fill="#8f84dc" opacity="${(0.70 * a).toFixed(3)}">${section.no} / ${esc(section.title).toUpperCase()}</text>
  </svg>`;
}

async function renderChapter(section, idx) {
  const sideFiles = extractSideFrames(section, idx);
  const dir = path.join(frameRoot, section.no);
  if (!RESUME_FRAMES) fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const count = Math.round(chapterDur * fps);
  let nextFrame = 0;
  async function renderWorker() {
    while (true) {
      const i = nextFrame++;
      if (i >= count) return;
      const out = path.join(dir, `frame_${String(i).padStart(4, '0')}.png`);
      if (!(RESUME_FRAMES && fs.existsSync(out))) {
        const t = i / fps;
        await sharp(Buffer.from(renderSvg(section, sideFiles, t))).png().toFile(out);
      }
    }
  }
  await Promise.all(Array.from({ length: FRAME_CONCURRENCY }, () => renderWorker()));
  const part = path.join(outDir, `chapter_${section.no}_clean_v01${progressSuffix}_${previewMode ? 'preview' : '2560p60'}.mp4`);
  run([
    '-y',
    '-framerate', String(fps),
    '-i', path.join(dir, 'frame_%04d.png'),
    '-c:v', 'libx264',
    '-preset', previewMode ? 'veryfast' : 'medium',
    '-crf', previewMode ? '24' : '16',
    '-pix_fmt', 'yuv420p',
    '-r', String(fps),
    part,
  ], `render chapter ${section.no}`);
  return part;
}

async function main() {
  for (const tool of [ffmpeg, ffprobe]) {
    if (!fs.existsSync(tool)) throw new Error(`Missing media tool: ${tool}`);
  }
  if (!fs.existsSync(music)) throw new Error(`Missing music: ${music}`);
  const wanted = selectedChapters
    ? selectedChapters.split(',').map((value) => value.trim().padStart(2, '0')).filter(Boolean)
    : [];
  const chosen = wanted.length ? sections.filter((section) => wanted.includes(section.no)) : sections;
  if (!chosen.length) throw new Error(`Unknown chapters: ${selectedChapters}`);
  for (const section of chosen) {
    if (!fs.existsSync(section.card)) throw new Error(`Missing card: ${section.card}`);
    if (!fs.existsSync(section.source)) throw new Error(`Missing source: ${section.source}`);
  }
  const chapterParts = [];
  for (let i = 0; i < chosen.length; i++) {
    chapterParts.push(await renderChapter(chosen[i], i));
  }
  const listPath = path.join(outDir, `concat_list${progressSuffix}.txt`);
  fs.writeFileSync(listPath, chapterParts.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join('\n') + '\n');
  const videoOnly = path.join(outDir, `video_concat${progressSuffix}.mp4`);
  run(['-y', '-f', 'concat', '-safe', '0', '-i', listPath, '-c', 'copy', videoOnly], 'concat final parts');

  const dur = probeDur(videoOnly);
  run([
    '-y',
    '-i', videoOnly,
    '-stream_loop', '-1',
    '-i', music,
    '-filter_complex', `[1:a]atrim=0:${dur.toFixed(3)},afade=t=in:st=0:d=1.2,afade=t=out:st=${Math.max(0, dur - 3).toFixed(3)}:d=3,volume=0.72[a]`,
    '-map', '0:v',
    '-map', '[a]',
    '-c:v', 'copy',
    '-c:a', 'aac',
    '-b:a', '160k',
    '-movflags', '+faststart',
    '-shortest',
    output,
  ], 'mux looped music');
  console.log(output);
}

await main();
