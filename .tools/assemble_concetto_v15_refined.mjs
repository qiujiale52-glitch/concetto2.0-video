import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import sharp from './thumbs/node_modules/sharp/dist/index.mjs';

const cwd = process.cwd();
const ffmpeg = path.join(cwd, '.tools/media-bin/node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg');
const ffprobe = path.join(cwd, '.tools/media-bin/node_modules/@ffprobe-installer/darwin-arm64/ffprobe');

const W = 1920;
const H = 1080;
const fps = 30;
const chapterDur = 3.6;

const outDir = path.join(cwd, '06_预览输出', 'refined_v15_parts');
const frameRoot = path.join(outDir, 'frames');
const chapterFrameRoot = path.join(frameRoot, 'chapters');
const aiFrameRoot = path.join(frameRoot, 'ai_results');
const sideRoot = path.join(outDir, 'side_frames');
const bgRoot = path.join(outDir, 'operation_backgrounds');
for (const d of [outDir, frameRoot, chapterFrameRoot, aiFrameRoot, sideRoot, bgRoot]) {
  fs.mkdirSync(d, { recursive: true });
}

const fontRegular = path.join(cwd, '.tools/unified_font/MiSans/otf/MiSans-Regular.otf');
const fontMedium = path.join(cwd, '.tools/unified_font/MiSans/otf/MiSans-Medium.otf');
const fontBold = path.join(cwd, '.tools/unified_font/MiSans/otf/MiSans-Bold.otf');
const v10Intro = path.join(cwd, '06_预览输出', 'manual_materials_v10_parts', 'intro_v10_old_opening_corrected_workflow.mp4');
const predesignPpt = path.join(cwd, '06_预览输出', 'original_rhythm_v06_parts', 'sec_01_result_materials_v07.mp4');
const music = path.join(cwd, '04-正版授权音乐库', '未来科技宽广磅礴音乐15437.wav');
const endCard = path.join(cwd, '06_预览输出', 'manual_materials_v09_parts', 'end_card_v09.mp4');
const workflowImage = path.join(cwd, '九大环节最新版', '九大环节总览_最新版.png');

const output = path.join(cwd, '06_预览输出', 'Concetto_2.0_综合调整_v15_低清.mp4');
const preview = path.join(cwd, '06_预览输出', 'Concetto_2.0_综合调整_v15_全片预览.jpg');
const opPreview = path.join(cwd, '06_预览输出', 'Concetto_2.0_综合调整_v15_演示包装预览.jpg');
const aiPreview = path.join(cwd, '06_预览输出', 'Concetto_2.0_综合调整_v15_AI渲染成果预览.jpg');
const logPath = path.join(cwd, '03_脚本与结构', 'Concetto 2.0_综合调整_v15_说明.md');

const local = (p) => path.join(cwd, 'CC 2.0宣发/Resources/local', p);
const manual = (...p) => path.join(cwd, '手动保存素材', ...p);
const image = (...p) => path.join(cwd, '手动保存素材', '图片', ...p);
const meetingClip = manual('交流会', '交流会-1.mov');

const fallbackSides = [
  path.join(cwd, '.tools/transition_test_assets/report1.jpg'),
  path.join(cwd, '.tools/transition_test_assets/report2.jpg'),
  path.join(cwd, '.tools/transition_test_assets/report3.jpg'),
];

const sections = [
  {
    no: '01',
    title: '前策分析',
    sub: '目标设定与需求分析',
    desc: '多维分析，整合数据与策略，辅助高效决策与成果输出',
    clip: manual('前策分析', '前策分析-1.mov'),
    card: local('d2762fc4b89fe6b51164939fe8df53d1.png'),
    feature: '从任务书解读，到区位、现状、案例与策略生成',
  },
  {
    no: '02',
    title: '场地定位',
    sub: '地理位置与周边环境分析',
    desc: '多维解析区位与周边资源条件，快速建立场地认知基础',
    clip: manual('场地定位', '场地定位-1.mov'),
    card: local('176057603fd1bc14879a80ce13fdb664.png'),
    feature: '快速建立场地认知基础',
  },
  {
    no: '03',
    title: '图生模型',
    sub: '支持总平直接生成三维模型',
    desc: '上传总平图，快速生成可编辑三维模型，减少重复工作',
    clip: manual('图生模型', '图生模型-1.mov'),
    card: local('d0965d0ab74b18687aee8d256a28c88e.png'),
    feature: '上传总图，一键生成 3D 模型并支持深化编辑',
  },
  {
    no: '04',
    title: '数智建模',
    sub: '参数化驱动高效生成',
    desc: '以参数化能力提升建模速度与精度，让方案生成更高效',
    clip: manual('数智建模', '数智建模-1.mov'),
    card: local('d3fcf9026ef31f64a923dbd6642394f1.png'),
    feature: '参数化驱动高效生成，提升建模速度精度',
  },
  {
    no: '05',
    title: 'AI灵感渲染',
    sub: '快速生成多维度结果',
    desc: '输出彩总、效果图与动态视频，让创意表达更灵活',
    clip: manual('灵感渲染（普通渲染）', '灵感渲染（普通渲染）.mov'),
    card: local('5e8962f826804a260077f7dfc4736d47.png'),
    feature: '快速生成多维度结果',
  },
  {
    no: '06',
    title: '总图排布',
    sub: '自动生成高效合规车位',
    desc: '支持修改与指标实时刷新，让专项排布快速进入可优化状态',
    clip: manual('车库智能排布', '车库智能排布-1.mov'),
    card: local('233bf84d9a4a141ad1bf43fcc299bcdc.png'),
    feature: '自动生成高效合规车位，指标实时刷新',
  },
  {
    no: '07',
    title: 'AI仿真分析',
    sub: '集成多项仿真分析能力',
    desc: '实现快速反馈与实时优化，让方案性能判断更直观',
    clip: manual('ai仿真分析', 'ai仿真分析-1.mov'),
    card: local('6d473a175bd0b0933225dc743495e6ff.png'),
    feature: '仿真分析与成果一体展示',
  },
  {
    no: '08',
    title: 'AI成本估算',
    sub: '海量真实项目数据训练模型',
    desc: '快速完成估算，误差可控，为方案决策提供量化依据',
    clip: manual('ai成本估算', 'ai成本估算-1.mov'),
    card: local('a18601b29bad07eee0f0dd302ada6a82.png'),
    feature: '快速完成估算，误差可控',
  },
  {
    no: '09',
    title: '文本生成',
    sub: '整合成果图，自动生成汇报 PPT',
    desc: '整合渲染、估算、分析等成果图，汇报 PPT 自动生成',
    clip: manual('文本生成', '文本生成-1.mov'),
    card: local('cf7daf0237d7acc922506778217aca01.png'),
    feature: '整合成果材料，自动生成汇报文本',
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

function assertFile(p) {
  if (!fs.existsSync(p)) throw new Error(`missing file: ${p}`);
}

function quoteFile(p) {
  return p.replace(/'/g, "'\\''");
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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

function defs() {
  return `
  <defs>
    <radialGradient id="core" cx="50%" cy="55%" r="62%">
      <stop offset="0%" stop-color="#6e5cff" stop-opacity="0.42"/>
      <stop offset="42%" stop-color="#151137" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#7668ff" stop-opacity="0"/>
      <stop offset="50%" stop-color="#d8d2ff" stop-opacity="0.86"/>
      <stop offset="100%" stop-color="#7668ff" stop-opacity="0"/>
    </linearGradient>
    <filter id="blur8"><feGaussianBlur stdDeviation="8"/></filter>
    <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
      <feDropShadow dx="0" dy="0" stdDeviation="20" flood-color="#7465ff" flood-opacity="0.68"/>
      <feDropShadow dx="0" dy="12" stdDeviation="34" flood-color="#271b82" flood-opacity="0.52"/>
    </filter>
    <filter id="panelGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="0" stdDeviation="14" flood-color="#5d52d9" flood-opacity="0.30"/>
    </filter>
    <clipPath id="cardClip"><rect x="0" y="0" width="590" height="340" rx="42"/></clipPath>
    <clipPath id="sideClip"><rect x="0" y="0" width="430" height="260" rx="8"/></clipPath>
    <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#bd72ff"/>
      <stop offset="55%" stop-color="#7572ff"/>
      <stop offset="100%" stop-color="#49b9ff"/>
    </linearGradient>
  </defs>`;
}

function extractSideFrames(section) {
  if (!section.clip || !fs.existsSync(section.clip)) return fallbackSides;
  const dir = path.join(sideRoot, section.no);
  fs.mkdirSync(dir, { recursive: true });
  const dur = Math.max(1, probeDur(section.clip));
  const offsets = [0.08, 0.46, 0.78];
  const files = [];
  for (let i = 0; i < offsets.length; i++) {
    const out = path.join(dir, `side_${i}.jpg`);
    files.push(out);
    if (fs.existsSync(out)) continue;
    const ts = Math.max(0.1, dur * offsets[i]);
    run(['-y', '-ss', String(ts), '-i', section.clip, '-frames:v', '1', '-vf', 'scale=720:-1', out], `extract side ${section.no}-${i}`);
  }
  return files;
}

function renderChapterSvg(section, sideFiles, t) {
  const inA = smooth(0.05, 0.8, t);
  const outA = 1 - smooth(chapterDur - 0.55, chapterDur, t);
  const a = inA * outA;
  const cardScale = 0.86 + 0.14 * easeOut(t / 1.05);
  const cardW = 590;
  const cardH = 340;
  const cardX = 665 + (1 - cardScale) * cardW / 2;
  const cardY = 395 + (1 - cardScale) * cardH / 2;
  const scan = -500 + (W + 1000) * ((t / chapterDur) * 0.65);
  const drift = easeOut(t / chapterDur);
  const sideA = smooth(0.45, 1.25, t) * outA;
  const titleA = smooth(0.7, 1.25, t) * outA;
  const sideUris = sideFiles.map(dataUri);
  const cardUri = dataUri(section.card);

  return `<?xml version="1.0" encoding="UTF-8"?>
  <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    ${defs()}
    <rect width="${W}" height="${H}" fill="#010104"/>
    <rect width="${W}" height="${H}" fill="url(#core)" opacity="${(0.75 * a).toFixed(3)}"/>
    <rect x="${scan.toFixed(1)}" y="0" width="620" height="${H}" transform="skewX(-18)" fill="url(#lineGrad)" opacity="${(0.10 * a).toFixed(3)}"/>
    <path d="M 110 820 C 520 730, 1210 752, 1800 666" stroke="#7668ff" stroke-opacity="${(0.20 * a).toFixed(3)}" stroke-width="1.2" fill="none"/>
    <path d="M 300 345 C 760 300, 1240 312, 1645 258" stroke="#ffffff" stroke-opacity="${(0.055 * a).toFixed(3)}" stroke-width="1" fill="none"/>

    <text x="112" y="136" font-family="Avenir Next, Arial" font-size="17" letter-spacing="7" fill="#857be8" opacity="${(0.72 * a).toFixed(3)}">CONCETTO 2.0 / LAUNCH SEQUENCE</text>
    <rect x="112" y="158" width="${(265 * a).toFixed(1)}" height="1.2" fill="#7668ff" opacity="0.55"/>

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

    <text x="960" y="188" text-anchor="middle" font-family="MiSans, PingFang SC, Arial" font-size="42" font-weight="700" letter-spacing="1.2" fill="#d9d4ff" opacity="${(0.32 * titleA).toFixed(3)}" filter="url(#blur8)">从工作流的第 ${section.no} 步，进入${esc(section.title)}</text>
    <text x="960" y="188" text-anchor="middle" font-family="MiSans, PingFang SC, Arial" font-size="42" font-weight="700" letter-spacing="1.2" fill="#f2f0ff" opacity="${(0.94 * titleA).toFixed(3)}">从工作流的第 ${section.no} 步，进入${esc(section.title)}</text>
    <text x="960" y="230" text-anchor="middle" font-family="MiSans, PingFang SC, Arial" font-size="20" font-weight="400" letter-spacing="1.5" fill="#aaa2df" opacity="${(0.82 * titleA).toFixed(3)}">${esc(section.sub)}</text>

    <g opacity="${a.toFixed(3)}" transform="translate(${cardX.toFixed(2)} ${cardY.toFixed(2)}) scale(${cardScale.toFixed(4)})">
      <rect x="-28" y="-28" width="${cardW + 56}" height="${cardH + 56}" rx="56" fill="#151039" stroke="#8d7cff" stroke-opacity="0.30" filter="url(#glow)"/>
      <g clip-path="url(#cardClip)">
        <image href="${cardUri}" x="0" y="0" width="${cardW}" height="${cardH}" preserveAspectRatio="xMidYMid slice"/>
        <rect x="0" y="0" width="${cardW}" height="${cardH}" fill="#ffffff" opacity="${(0.02 + 0.025 * Math.sin(t * 4)).toFixed(3)}"/>
      </g>
      <rect x="0" y="0" width="${cardW}" height="${cardH}" rx="42" fill="none" stroke="#d9d3ff" stroke-opacity="0.24" stroke-width="1.5"/>
    </g>

    <text x="960" y="805" text-anchor="middle" font-family="MiSans, PingFang SC, Arial" font-size="22" letter-spacing="1.2" fill="#bdb6ea" opacity="${(0.74 * titleA).toFixed(3)}">${esc(section.desc)}</text>
    <text x="960" y="875" text-anchor="middle" font-family="Avenir Next, Arial" font-size="18" letter-spacing="7" fill="#8f84dc" opacity="${(0.70 * a).toFixed(3)}">${section.no} / ${esc(section.title).toUpperCase()}</text>
  </svg>`;
}

async function renderChapter(section) {
  const sideFiles = extractSideFrames(section);
  const dir = path.join(chapterFrameRoot, section.no);
  fs.mkdirSync(dir, { recursive: true });
  const count = Math.round(chapterDur * fps);
  for (let i = 0; i < count; i++) {
    const out = path.join(dir, `frame_${String(i).padStart(4, '0')}.png`);
    const t = i / fps;
    await sharp(Buffer.from(renderChapterSvg(section, sideFiles, t))).png().toFile(out);
  }
  const part = path.join(outDir, `chapter_${section.no}_v05_card_style.mp4`);
  run(['-y', '-framerate', String(fps), '-i', path.join(dir, 'frame_%04d.png'), '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-r', String(fps), part], `render chapter ${section.no}`);
  return part;
}

function operationBgSvg(section) {
  return `<?xml version="1.0" encoding="UTF-8"?>
  <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    ${defs()}
    <rect width="${W}" height="${H}" fill="#010104"/>
    <rect width="${W}" height="${H}" fill="url(#core)" opacity="0.82"/>
    <path d="M 105 870 C 565 770, 1220 790, 1815 700" stroke="#7668ff" stroke-opacity="0.22" stroke-width="1.2" fill="none"/>
    <path d="M 290 185 C 780 135, 1240 150, 1660 95" stroke="#ffffff" stroke-opacity="0.06" stroke-width="1" fill="none"/>
    <rect x="88" y="92" width="1744" height="978" rx="34" fill="#12102a" opacity="0.72" filter="url(#panelGlow)"/>
    <rect x="88" y="92" width="1744" height="978" rx="34" fill="none" stroke="#8375ff" stroke-opacity="0.42" stroke-width="1.4"/>
    <rect x="112" y="108" width="1696" height="954" rx="24" fill="#f5f5ff" opacity="0.025"/>
    <text x="112" y="82" font-family="Avenir Next, Arial" font-size="15" letter-spacing="6" fill="#857be8" opacity="0.78">CONCETTO 2.0 / WORKFLOW DEMO</text>
    <rect x="112" y="105" width="245" height="1.2" fill="#7668ff" opacity="0.55"/>
    <text x="1748" y="82" text-anchor="end" font-family="Avenir Next, Arial" font-size="18" letter-spacing="4" fill="#8f84dc" opacity="0.78">${section.no} / ${esc(section.title).toUpperCase()}</text>
    <text x="548" y="84" font-family="MiSans, PingFang SC, Arial" font-size="24" fill="#8f84dc" opacity="0.82">${section.no}</text>
    <text x="592" y="85" font-family="MiSans, PingFang SC, Arial" font-size="34" font-weight="700" fill="#f3f0ff">${esc(section.title)}</text>
    <text x="800" y="84" font-family="MiSans, PingFang SC, Arial" font-size="20" fill="#aaa2df" opacity="0.92">${esc(section.feature)}</text>
  </svg>`;
}

async function renderOperationBg(section) {
  const out = path.join(bgRoot, `operation_bg_${section.no}.png`);
  await sharp(Buffer.from(operationBgSvg(section))).png().toFile(out);
  return out;
}

async function renderOperationClip(section, clip = section.clip, feature = section.feature, suffix = '', opts = {}) {
  const bg = await renderOperationBg({ ...section, feature });
  const out = path.join(outDir, `sec_${section.no}_operation${suffix}.mp4`);
  const trimStart = Number(opts.trimStart || 0);
  const dur = Math.max(0.2, probeDur(clip) - trimStart);
  const filter = [
    `[0:v]setpts=PTS-STARTPTS,scale=1696:954:force_original_aspect_ratio=decrease,pad=1696:954:(ow-iw)/2:(oh-ih)/2:color=0x17142f,setsar=1,fps=${fps}[vid]`,
    `[1:v]scale=${W}:${H},setsar=1[bg]`,
    `[bg][vid]overlay=x=112:y=108:format=auto[v0]`,
    `[v0]drawbox=x=112:y=108:w=1696:h=954:color=0x8d7cff@0.18:t=2,fade=t=in:st=0:d=0.18,fade=t=out:st=${Math.max(0.1, dur - 0.25)}:d=0.25[v]`,
  ].join(';');
  const clipInput = trimStart > 0 ? ['-ss', String(trimStart), '-i', clip] : ['-i', clip];
  run([
    '-y',
    ...clipInput,
    '-loop', '1',
    '-t', String(dur),
    '-i', bg,
    '-filter_complex', filter,
    '-map', '[v]',
    '-an',
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '20',
    '-pix_fmt', 'yuv420p',
    '-r', String(fps),
    out,
  ], `operation ${section.no}${suffix}`);
  return out;
}

function resultBg(t, extra = '') {
  const scan = -500 + (W + 1000) * ((t / 5.2) * 0.65);
  return `
    <rect width="${W}" height="${H}" fill="#010104"/>
    <rect width="${W}" height="${H}" fill="url(#core)" opacity="0.86"/>
    <rect x="${scan.toFixed(1)}" y="0" width="620" height="${H}" transform="skewX(-18)" fill="url(#lineGrad)" opacity="0.08"/>
    <path d="M 90 842 C 590 748, 1230 780, 1805 690" stroke="#7668ff" stroke-opacity="0.22" stroke-width="1.2" fill="none"/>
    <text x="112" y="132" font-family="Avenir Next, Arial" font-size="17" letter-spacing="7" fill="#857be8" opacity="0.72">CONCETTO 2.0 / AI RENDER RESULT</text>
    <rect x="112" y="154" width="278" height="1.2" fill="#7668ff" opacity="0.55"/>
    ${extra}`;
}

function renderNormalBaseSvg(t) {
  const a = smooth(0.2, 0.8, t) * (1 - smooth(4.85, 5.2, t));
  const panelScale = 0.92 + 0.08 * easeOut(t / 1.2);
  const x = 715 - 20 * easeOut(t / 5.2);
  const y = 125;
  const w = 1060 * panelScale;
  const h = 850 * panelScale;
  const textA = smooth(0.35, 1.05, t) * (1 - smooth(4.75, 5.2, t));
  const tags = ['住宅', '公建', '城市更新', '工业园区', '市政基建'];
  const extras = tags.map((tag, i) => {
    const tx = 112 + (i % 2) * 116;
    const ty = 455 + Math.floor(i / 2) * 58;
    return `<g opacity="${(textA * 0.92).toFixed(3)}"><rect x="${tx}" y="${ty}" width="${tag.length > 3 ? 112 : 82}" height="36" rx="13" fill="#875bff" opacity="0.88"/><text x="${tx + (tag.length > 3 ? 56 : 41)}" y="${ty + 25}" text-anchor="middle" font-family="MiSans, PingFang SC, Arial" font-size="22" font-weight="700" fill="#fff">${esc(tag)}</text></g>`;
  }).join('');
  return `<?xml version="1.0" encoding="UTF-8"?>
  <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    ${defs()}
    ${resultBg(t)}
    <text x="112" y="342" font-family="MiSans, PingFang SC, Arial" font-size="66" font-weight="800" fill="url(#textGrad)" opacity="${textA.toFixed(3)}">更灵活的 AI 渲染</text>
    <text x="112" y="405" font-family="MiSans, PingFang SC, Arial" font-size="36" font-weight="650" fill="#bf91ff" opacity="${(textA * 0.96).toFixed(3)}">快速生成多维度结果</text>
    ${extras}
    <g opacity="${a.toFixed(3)}" filter="url(#glow)" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">
      <rect x="-24" y="-24" width="${(w + 48).toFixed(1)}" height="${(h + 48).toFixed(1)}" rx="42" fill="#151039" stroke="#8d7cff" stroke-opacity="0.28"/>
      <rect x="0" y="0" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="30" fill="none" stroke="#d9d3ff" stroke-opacity="0.24" stroke-width="1.5"/>
    </g>
  </svg>`;
}

function normalPanelGeom(t) {
  const panelScale = 0.92 + 0.08 * easeOut(t / 1.2);
  return {
    x: Math.round(715 - 20 * easeOut(t / 5.2)),
    y: 125,
    w: Math.round(1060 * panelScale),
    h: Math.round(850 * panelScale),
    a: smooth(0.2, 0.8, t) * (1 - smooth(4.85, 5.2, t)),
  };
}

function normalImageOverlaySvg(t) {
  const { x, y, w, h, a } = normalPanelGeom(t);
  return `<?xml version="1.0" encoding="UTF-8"?>
  <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    ${defs()}
    <g opacity="${a.toFixed(3)}" transform="translate(${x} ${y})">
      <rect x="0" y="0" width="${w}" height="${h}" rx="30" fill="none" stroke="#d9d3ff" stroke-opacity="0.26" stroke-width="1.6"/>
      <rect x="0" y="0" width="${w}" height="${h}" rx="30" fill="#ffffff" opacity="0.025"/>
    </g>
  </svg>`;
}

async function renderNormalRenderResult() {
  const dur = 5.2;
  const dir = path.join(aiFrameRoot, 'normal');
  fs.mkdirSync(dir, { recursive: true });
  const count = Math.round(dur * fps);
  const src = image('0b58f775ed9dba6e413d8fb8f0c2168f.png');
  for (let i = 0; i < count; i++) {
    const out = path.join(dir, `frame_${String(i).padStart(4, '0')}.png`);
    const t = i / fps;
    const { x, y, w, h } = normalPanelGeom(t);
    const art = await sharp(src).resize(w, h, { fit: 'cover', position: 'centre' }).png().toBuffer();
    const border = await sharp(Buffer.from(normalImageOverlaySvg(t))).png().toBuffer();
    await sharp(Buffer.from(renderNormalBaseSvg(t)))
      .composite([
        { input: art, left: x, top: y },
        { input: border, left: 0, top: 0 },
      ])
      .png()
      .toFile(out);
  }
  const out = path.join(outDir, 'sec_05_normal_render_result_redesign.mp4');
  run(['-y', '-framerate', String(fps), '-i', path.join(dir, 'frame_%04d.png'), '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-r', String(fps), out], 'normal render result redesign');
  return out;
}

function suiteCardGeoms(t) {
  const final = [
    [745, 160, 520, 294, -4],
    [1225, 230, 520, 294, 5],
    [650, 586, 620, 350, 4],
    [1180, 635, 520, 294, -5],
  ];
  return final.map(([fx, fy, fw, fh, rot], i) => {
    const delay = 0.18 + i * 0.08;
    const k = easeOut((t - delay) / 1.15);
    const scale = 0.70 + 0.30 * k;
    return {
      x: Math.round(980 + (fx - 980) * k),
      y: Math.round(430 + (fy - 430) * k),
      w: Math.round(fw * scale),
      h: Math.round(fh * scale),
      a: smooth(0.15, 0.75, t) * (1 - smooth(4.75, 5.0, t)),
      rot: rot * k,
    };
  });
}

function renderSuiteBaseSvg(t) {
  const textA = smooth(0.3, 1.0, t) * (1 - smooth(4.65, 5.0, t));
  const shells = suiteCardGeoms(t).map(({ x, y, w, h, a, rot }) => `<g opacity="${a.toFixed(3)}" filter="url(#panelGlow)" transform="translate(${x} ${y}) rotate(${rot.toFixed(2)})">
      <rect x="-16" y="-16" width="${w + 32}" height="${h + 32}" rx="24" fill="#151039" stroke="#8d7cff" stroke-opacity="0.28"/>
    </g>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
  <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    ${defs()}
    ${resultBg(t)}
    <text x="112" y="430" font-family="MiSans, PingFang SC, Arial" font-size="42" font-weight="700" fill="#bd72ff" opacity="${textA.toFixed(3)}">上传多视角底图</text>
    <text x="112" y="505" font-family="MiSans, PingFang SC, Arial" font-size="72" font-weight="800" fill="url(#textGrad)" opacity="${textA.toFixed(3)}">一键生一致性套图</text>
    ${shells}
  </svg>`;
}

function suiteBorderSvg(t) {
  const cards = suiteCardGeoms(t).map(({ x, y, w, h, a, rot }) => `<g opacity="${a.toFixed(3)}" transform="translate(${x} ${y}) rotate(${rot.toFixed(2)})">
      <rect x="0" y="0" width="${w}" height="${h}" rx="18" fill="none" stroke="#ffffff" stroke-opacity="0.28" stroke-width="1.2"/>
    </g>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?>
  <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${cards}</svg>`;
}

async function renderSuiteResult() {
  const dur = 5.0;
  const dir = path.join(aiFrameRoot, 'suite');
  fs.mkdirSync(dir, { recursive: true });
  const count = Math.round(dur * fps);
  const imgs = [
    image('f3ba1e172bc2fa416bd86c018310179f.jpg'),
    image('ea285d03baa21b726e84d4d736f102d4.jpg'),
    image('d762819b713649d93c6ac46192f8d75a.jpg'),
    image('2aa273d96cd9cfdcb067f3955d5cd315.jpg'),
  ];
  for (let i = 0; i < count; i++) {
    const out = path.join(dir, `frame_${String(i).padStart(4, '0')}.png`);
    const t = i / fps;
    const composites = [];
    const cards = suiteCardGeoms(t);
    for (let j = 0; j < cards.length; j++) {
      const { x, y, w, h } = cards[j];
      const art = await sharp(imgs[j]).resize(w, h, { fit: 'cover', position: 'centre' }).png().toBuffer();
      composites.push({ input: art, left: x, top: y });
    }
    const border = await sharp(Buffer.from(suiteBorderSvg(t))).png().toBuffer();
    composites.push({ input: border, left: 0, top: 0 });
    await sharp(Buffer.from(renderSuiteBaseSvg(t))).composite(composites).png().toFile(out);
  }
  const out = path.join(outDir, 'sec_05_suite_result_redesign.mp4');
  run(['-y', '-framerate', String(fps), '-i', path.join(dir, 'frame_%04d.png'), '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-r', String(fps), out], 'suite result redesign');
  return out;
}

const workflowNodeSrc = [
  { no: '01', x: 330, y: 292 },
  { no: '02', x: 642, y: 292 },
  { no: '03', x: 954, y: 292 },
  { no: '04', x: 954, y: 520 },
  { no: '05', x: 642, y: 520 },
  { no: '06', x: 330, y: 520 },
  { no: '07', x: 330, y: 748 },
  { no: '08', x: 642, y: 748 },
  { no: '09', x: 954, y: 748 },
];

function pointAlong(points, progress) {
  const lengths = [];
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const dx = points[i + 1].x - points[i].x;
    const dy = points[i + 1].y - points[i].y;
    const len = Math.hypot(dx, dy);
    lengths.push(len);
    total += len;
  }
  let dist = clamp(progress) * total;
  for (let i = 0; i < lengths.length; i++) {
    if (dist <= lengths[i] || i === lengths.length - 1) {
      const k = lengths[i] <= 0 ? 0 : dist / lengths[i];
      return {
        x: points[i].x + (points[i + 1].x - points[i].x) * k,
        y: points[i].y + (points[i + 1].y - points[i].y) * k,
        segment: i,
      };
    }
    dist -= lengths[i];
  }
  return { ...points[points.length - 1], segment: points.length - 2 };
}

function partialPolyline(points, progress) {
  const p = pointAlong(points, progress);
  const shown = points.slice(0, p.segment + 1).concat([{ x: p.x, y: p.y }]);
  return shown.map((pt) => `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(' ');
}

function workflowGeom(t, dur) {
  const panel = easeOut(t / 1.1);
  const imgW = 1620 * (0.985 + 0.015 * panel);
  const imgH = imgW * 9 / 16;
  const imgX = (W - imgW) / 2;
  const imgY = 132 - 10 * panel;
  const sx = imgW / 1230;
  const sy = imgH / 694;
  const nodes = workflowNodeSrc.map((n) => ({
    ...n,
    x: imgX + n.x * sx,
    y: imgY + n.y * sy,
  }));
  return { imgX, imgY, imgW, imgH, nodes };
}

function renderWorkflowOverviewSvg(t, dur = 7.2) {
  const a = smooth(0.10, 0.85, t) * (1 - smooth(dur - 0.55, dur, t));
  const imgUri = dataUri(workflowImage);
  const { imgX, imgY, imgW, imgH, nodes } = workflowGeom(t, dur);
  const scan = -520 + (W + 980) * (t / dur);
  const progress = smooth(1.05, dur - 1.0, t);
  const light = pointAlong(nodes, progress);
  const litCount = Math.min(9, Math.max(0, Math.floor(progress * 8.999) + (progress > 0.02 ? 1 : 0)));
  const fullPts = nodes.map((pt) => `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(' ');
  const activePts = partialPolyline(nodes, progress);
  const glows = nodes.map((n, i) => {
    const on = i < litCount;
    const pulse = on ? (0.52 + 0.20 * Math.sin(t * 5 + i)) : 0;
    return `<g opacity="${(a * (on ? 1 : 0)).toFixed(3)}">
      <circle cx="${n.x.toFixed(1)}" cy="${n.y.toFixed(1)}" r="${(70 + pulse * 12).toFixed(1)}" fill="#a985ff" opacity="${(0.26 + pulse * 0.24).toFixed(3)}" filter="url(#glow)"/>
      <circle cx="${n.x.toFixed(1)}" cy="${n.y.toFixed(1)}" r="42" fill="#ffffff" opacity="0.13"/>
    </g>`;
  }).join('');
  return `<?xml version="1.0" encoding="UTF-8"?>
  <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    ${defs()}
    <rect width="${W}" height="${H}" fill="#010104"/>
    <rect width="${W}" height="${H}" fill="url(#core)" opacity="${(0.82 * a).toFixed(3)}"/>
    <rect x="${scan.toFixed(1)}" y="0" width="620" height="${H}" transform="skewX(-18)" fill="url(#lineGrad)" opacity="${(0.085 * a).toFixed(3)}"/>
    <path d="M 110 820 C 520 730, 1210 752, 1800 666" stroke="#7668ff" stroke-opacity="${(0.20 * a).toFixed(3)}" stroke-width="1.2" fill="none"/>
    <text x="112" y="136" font-family="Avenir Next, Arial" font-size="17" letter-spacing="7" fill="#857be8" opacity="${(0.72 * a).toFixed(3)}">CONCETTO 2.0 / LAUNCH SEQUENCE</text>
    <rect x="112" y="158" width="${(265 * a).toFixed(1)}" height="1.2" fill="#7668ff" opacity="0.55"/>
    <text x="960" y="118" text-anchor="middle" font-family="MiSans, PingFang SC, Arial" font-size="40" font-weight="750" fill="#f2f0ff" opacity="${(0.94 * a).toFixed(3)}">从升级能力，到完整工作流</text>
    <text x="960" y="164" text-anchor="middle" font-family="MiSans, PingFang SC, Arial" font-size="21" letter-spacing="1.2" fill="#aaa2df" opacity="${(0.84 * a).toFixed(3)}">九大环节串联，从任务书解读到汇报材料合成</text>
    <g opacity="${a.toFixed(3)}" filter="url(#glow)">
      <rect x="${(imgX - 28).toFixed(1)}" y="${(imgY - 26).toFixed(1)}" width="${(imgW + 56).toFixed(1)}" height="${(imgH + 52).toFixed(1)}" rx="42" fill="#151039" stroke="#8d7cff" stroke-opacity="0.28"/>
      <image href="${imgUri}" x="${imgX.toFixed(1)}" y="${imgY.toFixed(1)}" width="${imgW.toFixed(1)}" height="${imgH.toFixed(1)}" preserveAspectRatio="xMidYMid meet"/>
    </g>
    <g opacity="${a.toFixed(3)}">
      <polyline points="${fullPts}" fill="none" stroke="#7868ff" stroke-opacity="0.18" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
      <polyline points="${activePts}" fill="none" stroke="#ffffff" stroke-opacity="0.90" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)"/>
      <polyline points="${activePts}" fill="none" stroke="#8b73ff" stroke-opacity="0.84" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)"/>
      ${glows}
      <circle cx="${light.x.toFixed(1)}" cy="${light.y.toFixed(1)}" r="18" fill="#ffffff" opacity="${(0.94 * a).toFixed(3)}" filter="url(#glow)"/>
      <circle cx="${light.x.toFixed(1)}" cy="${light.y.toFixed(1)}" r="42" fill="#b58cff" opacity="${(0.28 * a).toFixed(3)}" filter="url(#glow)"/>
    </g>
  </svg>`;
}

async function renderWorkflowOverview() {
  const dur = 7.2;
  const dir = path.join(frameRoot, 'workflow_overview_v15');
  fs.mkdirSync(dir, { recursive: true });
  const count = Math.round(dur * fps);
  for (let i = 0; i < count; i++) {
    const out = path.join(dir, `frame_${String(i).padStart(4, '0')}.png`);
    const t = i / fps;
    await sharp(Buffer.from(renderWorkflowOverviewSvg(t, dur))).png().toFile(out);
  }
  const out = path.join(outDir, 'intro_workflow_overview_v15.mp4');
  run(['-y', '-framerate', String(fps), '-i', path.join(dir, 'frame_%04d.png'), '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-r', String(fps), out], 'workflow overview v15');
  return out;
}

function renderOpeningLogoSweep() {
  const out = path.join(outDir, 'intro_logo_sweep_only_v15.mp4');
  run([
    '-y',
    '-ss', '0',
    '-t', '5.35',
    '-i', v10Intro,
    '-vf', `fps=${fps},scale=${W}:${H},setsar=1,fade=t=in:st=0:d=0.18,fade=t=out:st=5.02:d=0.33`,
    '-an',
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '20',
    '-pix_fmt', 'yuv420p',
    '-r', String(fps),
    out,
  ], 'intro logo sweep only v15');
  return out;
}

function renderIntroHighlightsUpdates() {
  const out = path.join(outDir, 'intro_highlights_updates_v15.mp4');
  run([
    '-y',
    '-ss', '10.45',
    '-t', '15.35',
    '-i', v10Intro,
    '-vf', `fps=${fps},scale=${W}:${H},setsar=1,fade=t=in:st=0:d=0.35,fade=t=out:st=15.0:d=0.35`,
    '-an',
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '20',
    '-pix_fmt', 'yuv420p',
    '-r', String(fps),
    out,
  ], 'intro highlights updates v15');
  return out;
}

function renderDirectClip(clip, name, { trimStart = 0, dur = null } = {}) {
  const out = path.join(outDir, `${name}.mp4`);
  const sourceDur = Math.max(0.2, probeDur(clip) - trimStart);
  const outDur = dur || sourceDur;
  const clipInput = trimStart > 0 ? ['-ss', String(trimStart), '-i', clip] : ['-i', clip];
  run([
    '-y',
    ...clipInput,
    '-t', String(outDur),
    '-vf', `scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:color=black,setsar=1,fps=${fps},fade=t=in:st=0:d=0.18,fade=t=out:st=${Math.max(0.1, outDur - 0.28)}:d=0.28`,
    '-an',
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '20',
    '-pix_fmt', 'yuv420p',
    '-r', String(fps),
    out,
  ], name);
  return out;
}

async function main() {
  for (const p of [ffmpeg, ffprobe, fontRegular, fontMedium, fontBold, v10Intro, predesignPpt, music, endCard, workflowImage, meetingClip]) assertFile(p);
  for (const s of sections) {
    assertFile(s.card);
    if (s.clip) assertFile(s.clip);
  }
  for (const p of [
    image('0b58f775ed9dba6e413d8fb8f0c2168f.png'),
    image('f3ba1e172bc2fa416bd86c018310179f.jpg'),
    image('ea285d03baa21b726e84d4d736f102d4.jpg'),
    image('d762819b713649d93c6ac46192f8d75a.jpg'),
    image('2aa273d96cd9cfdcb067f3955d5cd315.jpg'),
  ]) assertFile(p);

  const openingLogo = renderOpeningLogoSweep();
  const introHighlights = renderIntroHighlightsUpdates();
  const workflowOverview = await renderWorkflowOverview();
  const parts = [openingLogo, introHighlights, workflowOverview];
  const records = [
    { segment: '开头：暗场 CONCETTO 扫光登场（删除后续多余标题）', file: openingLogo, duration: probeDur(openingLogo) },
    { segment: '开头：升级亮点与六大更新（旧 intro 选段）', file: introHighlights, duration: probeDur(introHighlights) },
    { segment: '九大环节总览：最新版图片 + 路径流光点亮动效', file: workflowOverview, duration: probeDur(workflowOverview) },
  ];

  for (const section of sections) {
    const chapter = await renderChapter(section);
    parts.push(chapter);
    records.push({ segment: `${section.no} ${section.title} 章节开头`, file: chapter, duration: probeDur(chapter) });

    if (section.no === '05') {
      const normalClip = manual('灵感渲染（普通渲染）', '灵感渲染（普通渲染）.mov');
      const suiteClip = manual('灵感渲染（生成套图）', '灵感渲染（生成套图）-1.mov');
      const op1 = await renderOperationClip(section, normalClip, '普通渲染操作演示：快速生成多维度结果', '_normal');
      const res1 = await renderNormalRenderResult();
      const op2 = await renderOperationClip(section, suiteClip, '多视角套图操作演示：一键生成一致性套图', '_suite');
      const res2 = await renderSuiteResult();
      for (const p of [op1, res1, op2, res2]) {
        parts.push(p);
        records.push({ segment: `${section.no} ${section.title}`, file: p, duration: probeDur(p) });
      }
    } else if (section.no === '09') {
      const textClip = renderDirectClip(section.clip, 'sec_09_text_generation_direct');
      const meeting = renderDirectClip(meetingClip, 'sec_09_meeting_followup');
      for (const p of [textClip, meeting]) {
        parts.push(p);
        records.push({ segment: `${section.no} ${section.title} / 交流会补充素材`, file: p, duration: probeDur(p) });
      }
    } else if (section.clip) {
      const op = await renderOperationClip(section, section.clip, section.feature, '', section.no === '01' ? { trimStart: 0.8 } : {});
      parts.push(op);
      records.push({ segment: `${section.no} ${section.title} 操作演示`, file: op, duration: probeDur(op) });
      if (section.no === '01') {
        parts.push(predesignPpt);
        records.push({ segment: '01 前策分析 PPT 成果页（加回）', file: predesignPpt, duration: probeDur(predesignPpt) });
      }
    } else {
      records.push({ segment: `${section.no} ${section.title} 操作演示`, file: '素材暂缺，未放入成片', duration: 0 });
    }
  }

  parts.push(endCard);
  records.push({ segment: '结尾（沿用 v09）', file: endCard, duration: probeDur(endCard) });

  const list = path.join(outDir, 'concat_list.txt');
  fs.writeFileSync(list, parts.map((p) => `file '${quoteFile(p)}'`).join('\n') + '\n');
  const videoOnly = path.join(outDir, 'video_concat_v15.mp4');
  run(['-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', videoOnly], 'concat v15');
  const totalDur = probeDur(videoOnly);

  run([
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
    '-shortest',
    output,
  ], 'mux v15 music');

  run(['-y', '-i', output, '-vf', 'fps=0.24,scale=360:-1,tile=10x7', '-frames:v', '1', preview], 'preview v15');
  run(['-y', '-ss', '00:00:31', '-i', output, '-t', '00:00:32', '-vf', 'fps=1,scale=480:-1,tile=8x4', '-frames:v', '1', opPreview], 'operation preview v15');
  run(['-y', '-ss', '00:01:24', '-i', output, '-t', '00:00:42', '-vf', 'fps=1,scale=480:-1,tile=10x5', '-frames:v', '1', aiPreview], 'ai preview v15');

  fs.writeFileSync(logPath, [
    '# Concetto 2.0 综合调整 v15',
    '',
    '本版按最新反馈处理：',
    '',
    '- 开头只保留最初暗场 CONCETTO 登场与左到右扫光段落，删除后续多余/不一致的 CONCETTO 2.0 标题；',
    '- 开头转场改为：扫光标题淡出 → 升级亮点/六大更新淡入 → 最新九大环节总览动效；',
    '- 九大环节总览不再覆盖旧视频，改为使用“九大环节最新版”图片重新生成，加入沿流程线运动的亮光与图标逐个点亮；',
    '- 01 前策分析章节开场重新生成，保持与后续 02–09 章节开头一致；',
    '- 前策分析操作后保留/加回 v07 的 PPT 成果页段落；',
    '- 操作演示全部重做包装：界面进一步放大到 1680×945，接近边框尺寸；顶部编号、标题和说明文字保持右移，避免与左侧英文标题重叠；',
    '- 第九环节补入文本生成素材，并在第九环节后加入“交流会”素材；',
    '- AI 灵感渲染成果部分沿用 v12 暗场发布会风格展示，保留原始素材和文字内容。',
    '',
    `输出视频：\`${output}\``,
    `全片预览：\`${preview}\``,
    `演示包装预览：\`${opPreview}\``,
    `AI 渲染成果预览：\`${aiPreview}\``,
    `总时长：约 ${Math.floor(totalDur / 60)}:${String(Math.round(totalDur % 60)).padStart(2, '0')}`,
    '',
    '| 段落 | 文件 | 时长 |',
    '|---|---|---:|',
    ...records.map((r) => `| ${r.segment} | ${typeof r.file === 'string' && r.file.startsWith(cwd) ? `\`${path.relative(cwd, r.file)}\`` : r.file} | ${Number(r.duration || 0).toFixed(1)}s |`),
  ].join('\n'));

  console.log(`v15 done: ${output}`);
  console.log(`duration: ${totalDur.toFixed(2)}s`);
  console.log(preview);
  console.log(opPreview);
  console.log(aiPreview);
}

await main();
