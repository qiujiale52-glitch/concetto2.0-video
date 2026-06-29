import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import sharp from './thumbs/node_modules/sharp/dist/index.mjs';

const cwd = process.cwd();
const ffmpeg = path.join(cwd, '.tools/media-bin/node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg');
const ffprobe = path.join(cwd, '.tools/media-bin/node_modules/@ffprobe-installer/darwin-arm64/ffprobe');
const outDir = path.join(cwd, '06_预览输出', 'chapter_intro_v05_parts');
const frameRoot = path.join(outDir, 'chapter_frames');
const sideRoot = path.join(outDir, 'side_frames');
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(frameRoot, { recursive: true });
fs.mkdirSync(sideRoot, { recursive: true });

const W = 1920;
const H = 1080;
const fps = 30;
const chapterDur = 3.6;

const font = path.join(cwd, '03-正版授权字体库/免费商用字体/思源黑体/NotoSansHans-Regular.otf');
const introFull = path.join(cwd, '06_预览输出', 'Concetto_2.0_开头升级工作流前策_v02_38s.mp4');
const music = path.join(cwd, '04-正版授权音乐库', '未来科技宽广磅礴音乐15437.wav');
const output = path.join(cwd, '06_预览输出', 'Concetto_2.0_九环节统一章节开头样片_v05_低清.mp4');
const preview = path.join(cwd, '06_预览输出', 'Concetto_2.0_九环节统一章节开头样片_v05_全片预览.jpg');
const logPath = path.join(cwd, '03_脚本与结构', 'Concetto 2.0_九环节统一章节开头_v05_说明.md');

const local = (p) => path.join(cwd, 'CC 2.0宣发/Resources/local', p);
const v04Part = (n) => path.join(cwd, '06_预览输出/workflow_strict_v04_parts', `part_${String(n).padStart(2, '0')}.mp4`);

const sections = [
  {
    no: '01',
    title: '前策分析',
    sub: '目标设定与需求分析',
    desc: '多维分析，整合数据与策略，辅助高效决策与成果输出',
    card: local('d2762fc4b89fe6b51164939fe8df53d1.png'),
    source: local('2c8f6c525a9714147f7b595ae71420af.mp4'),
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
    source: local('851fd789ef880cfe4c24d6f2681751ce.mp4'),
    sourceStart: 3,
    sourceDur: 44,
    parts: [v04Part(1)],
  },
  {
    no: '03',
    title: '数据建模',
    sub: 'BIM信息模型构建',
    desc: '从场地数据进入信息模型，让设计推演拥有可计算的基础',
    card: local('d3fcf9026ef31f64a923dbd6642394f1.png'),
    source: local('4c430bc016a79d5b446ff15cc00df2ab.mp4'),
    sourceStart: 3,
    sourceDur: 35,
    parts: [v04Part(2)],
  },
  {
    no: '04',
    title: '图纸模型',
    sub: '2D/3D设计图纸生成',
    desc: '连接图纸、模型与可编辑对象，让二维信息进入三维设计流程',
    card: local('d0965d0ab74b18687aee8d256a28c88e.png'),
    source: local('bdf6c7f35f90ffaf04c13c600925989d.mp4'),
    sourceStart: 18,
    sourceDur: 50,
    parts: [v04Part(3), v04Part(4)],
  },
  {
    no: '05',
    title: 'AI渲染',
    sub: '智能效果图生成',
    desc: '从参考图、提示词到结果图，一键生成更具表现力的设计画面',
    card: local('5e8962f826804a260077f7dfc4736d47.png'),
    source: local('81bdcc47cfffa059ce2f1f6d5318cd28.mp4'),
    sourceStart: 2,
    sourceDur: 35,
    parts: [v04Part(5), v04Part(6)],
  },
  {
    no: '06',
    title: 'AI分析',
    sub: '性能与优化分析',
    desc: '让方案性能、分析图层与优化建议形成可见反馈',
    card: local('6d473a175bd0b0933225dc743495e6ff.png'),
    source: local('f6aa9cbe5a64dd09dc34a4841d261ae1.mp4'),
    sourceStart: 5,
    sourceDur: 58,
    parts: [v04Part(7), v04Part(8)],
  },
  {
    no: '07',
    title: 'AI估算',
    sub: '成本与投资估算',
    desc: '将关键指标、成本与投资估算转化为可比较的数据依据',
    card: local('a18601b29bad07eee0f0dd302ada6a82.png'),
    source: local('e22d4200e9c271f86d33aa2b68d8b478.mp4'),
    sourceStart: 74,
    sourceDur: 12,
    parts: [v04Part(9), v04Part(10)],
  },
  {
    no: '08',
    title: '车库排布',
    sub: '停车规划与优化',
    desc: '从参数输入到排布结果，专项设计进入自动化优化流程',
    card: local('233bf84d9a4a141ad1bf43fcc299bcdc.png'),
    source: local('aeb56ebbfe9401582092208e15547ce7.mp4'),
    sourceStart: 9,
    sourceDur: 111,
    parts: [v04Part(11)],
  },
  {
    no: '09',
    title: '文本生成',
    sub: '智能报告撰写',
    desc: '汇聚分析与设计成果，生成可交付的汇报文本和材料',
    card: local('cf7daf0237d7acc922506778217aca01.png'),
    source: local('a58e492385ebe042fa4c809a19dc3545.mp4'),
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
  const offsets = [0, 0.45, 0.82];
  const files = [];
  for (let i = 0; i < offsets.length; i++) {
    const out = path.join(dir, `side_${i}.jpg`);
    files.push(out);
    if (fs.existsSync(out)) continue;
    const ts = section.sourceStart + Math.max(0.1, section.sourceDur * offsets[i]);
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
    <filter id="blur8"><feGaussianBlur stdDeviation="8"/></filter>
    <filter id="blur20"><feGaussianBlur stdDeviation="20"/></filter>
    <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
      <feDropShadow dx="0" dy="0" stdDeviation="20" flood-color="#7465ff" flood-opacity="0.68"/>
      <feDropShadow dx="0" dy="12" stdDeviation="34" flood-color="#271b82" flood-opacity="0.52"/>
    </filter>
    <filter id="panelGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="0" stdDeviation="14" flood-color="#5d52d9" flood-opacity="0.30"/>
    </filter>
    <clipPath id="cardClip"><rect x="0" y="0" width="590" height="340" rx="42"/></clipPath>
    <clipPath id="sideClip"><rect x="0" y="0" width="430" height="260" rx="8"/></clipPath>
  </defs>`;
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
  const scan = -500 + (W + 1000) * ((t / chapterDur) * 0.65);
  const drift = easeOut(t / chapterDur);
  const sideA = smooth(0.45, 1.25, t) * outA;
  const titleA = smooth(0.7, 1.25, t) * outA;

  const cardUri = dataUri(section.card);
  const sideUris = sideFiles.map(dataUri);

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

    <text x="960" y="188" text-anchor="middle" font-family="PingFang SC, Hiragino Sans GB, Arial" font-size="42" font-weight="650" letter-spacing="1.2" fill="#d9d4ff" opacity="${(0.32 * titleA).toFixed(3)}" filter="url(#blur8)">从工作流的第 ${section.no} 步，进入${esc(section.title)}</text>
    <text x="960" y="188" text-anchor="middle" font-family="PingFang SC, Hiragino Sans GB, Arial" font-size="42" font-weight="650" letter-spacing="1.2" fill="#f2f0ff" opacity="${(0.94 * titleA).toFixed(3)}">从工作流的第 ${section.no} 步，进入${esc(section.title)}</text>
    <text x="960" y="230" text-anchor="middle" font-family="PingFang SC, Hiragino Sans GB, Arial" font-size="20" font-weight="400" letter-spacing="1.5" fill="#aaa2df" opacity="${(0.82 * titleA).toFixed(3)}">${esc(section.sub)}</text>

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
  fs.mkdirSync(dir, { recursive: true });
  const count = Math.round(chapterDur * fps);
  for (let i = 0; i < count; i++) {
    const out = path.join(dir, `frame_${String(i).padStart(4, '0')}.png`);
    if (fs.existsSync(out)) continue;
    const t = i / fps;
    await sharp(Buffer.from(renderSvg(section, sideFiles, t))).png().toFile(out);
  }
  const part = path.join(outDir, `chapter_${section.no}.mp4`);
  run([
    '-y',
    '-framerate', String(fps),
    '-i', path.join(dir, 'frame_%04d.png'),
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '20',
    '-pix_fmt', 'yuv420p',
    '-r', String(fps),
    part,
  ], `render chapter ${section.no}`);
  return part;
}

async function main() {
  const introBase = path.join(outDir, 'intro_base_no_front_card.mp4');
  run([
    '-y',
    '-t', '33',
    '-i', introFull,
    '-an',
    '-vf', 'scale=1920:1080,setsar=1',
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '20',
    '-pix_fmt', 'yuv420p',
    '-r', String(fps),
    introBase,
  ], 'render intro base');

  const chapterParts = [];
  for (let i = 0; i < sections.length; i++) {
    chapterParts.push(await renderChapter(sections[i], i));
  }

  const finalParts = [introBase];
  for (let i = 0; i < sections.length; i++) {
    finalParts.push(chapterParts[i], ...sections[i].parts);
  }
  finalParts.push(v04Part(13));

  const listPath = path.join(outDir, 'concat_list.txt');
  fs.writeFileSync(listPath, finalParts.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join('\n') + '\n');
  const videoOnly = path.join(outDir, 'video_concat.mp4');
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
    '-shortest',
    output,
  ], 'mux looped music');

  run([
    '-y',
    '-i', output,
    '-vf', 'fps=0.18,scale=360:-1,tile=8x8',
    '-frames:v', '1',
    preview,
  ], 'render preview');

  const log = [
    '# Concetto 2.0 九环节统一章节开头 v05',
    '',
    '本版只处理章节包装：保留 v04 的九环节操作素材与顺序，在每个环节操作前加入统一的暗场悬浮章节卡。前部开头保留开场、升级亮点、新增功能、工作流总览，并截去原 v02 里只服务前策的单独章节卡，改为 01–09 统一生成。',
    '',
    '| 环节 | 章节卡标题 | 副标题 | 操作片段 |',
    '|---|---|---|---|',
    ...sections.map((s) => `| ${s.no} | ${s.title} | ${s.sub} | ${s.parts.map((p) => `\`${path.relative(cwd, p)}\``).join('<br>')} |`),
    '',
    `输出：\`${output}\``,
    `预览：\`${preview}\``,
  ].join('\n');
  fs.writeFileSync(logPath, log);
  console.log(output);
  console.log(preview);
  console.log(logPath);
}

await main();
