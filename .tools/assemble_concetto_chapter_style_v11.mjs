import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import sharp from './thumbs/node_modules/sharp/dist/index.mjs';

const cwd = process.cwd();
const ffmpeg = path.join(cwd, '.tools/media-bin/node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg');
const ffprobe = path.join(cwd, '.tools/media-bin/node_modules/@ffprobe-installer/darwin-arm64/ffprobe');
const outDir = path.join(cwd, '06_预览输出', 'chapter_style_v11_parts');
const frameRoot = path.join(outDir, 'chapter_frames');
const sideRoot = path.join(outDir, 'side_frames');
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(frameRoot, { recursive: true });
fs.mkdirSync(sideRoot, { recursive: true });

const W = 1920;
const H = 1080;
const fps = 30;
const chapterDur = 3.6;

const fontRegular = path.join(cwd, '.tools/unified_font/MiSans/otf/MiSans-Regular.otf');
const fontBold = path.join(cwd, '.tools/unified_font/MiSans/otf/MiSans-Bold.otf');
const v09Dir = path.join(cwd, '06_预览输出', 'manual_materials_v09_parts');
const v10Intro = path.join(cwd, '06_预览输出', 'manual_materials_v10_parts', 'intro_v10_old_opening_corrected_workflow.mp4');
const music = path.join(cwd, '04-正版授权音乐库', '未来科技宽广磅礴音乐15437.wav');
const output = path.join(cwd, '06_预览输出', 'Concetto_2.0_章节开头统一悬浮样式_v11_低清.mp4');
const preview = path.join(cwd, '06_预览输出', 'Concetto_2.0_章节开头统一悬浮样式_v11_全片预览.jpg');
const logPath = path.join(cwd, '03_脚本与结构', 'Concetto 2.0_章节开头统一悬浮样式_v11_说明.md');

const manual = (...p) => path.join(cwd, '手动保存素材', ...p);
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
    body: ['sec_01_operation_前策分析-1.mp4'],
  },
  {
    no: '02',
    title: '场地定位',
    sub: '地理位置与周边环境分析',
    desc: '多维解析区位与周边资源条件，快速建立场地认知基础',
    clip: manual('场地定位', '场地定位-1.mov'),
    body: ['sec_02_operation_场地定位-1.mp4'],
  },
  {
    no: '03',
    title: '图生模型',
    sub: '支持总平直接生成三维模型',
    desc: '上传总平图，快速生成可编辑三维模型，减少重复工作',
    clip: manual('图生模型', '图生模型-1.mov'),
    body: ['sec_03_operation_图生模型-1.mp4'],
  },
  {
    no: '04',
    title: '数智建模',
    sub: '参数化驱动高效生成',
    desc: '以参数化能力提升建模速度与精度，让方案生成更高效',
    clip: manual('数智建模', '数智建模-1.mov'),
    body: ['sec_04_operation_数智建模-1.mp4'],
  },
  {
    no: '05',
    title: 'AI灵感渲染',
    sub: '快速生成多维度结果',
    desc: '输出彩总、效果图与动态视频，让创意表达更灵活',
    clip: manual('灵感渲染（普通渲染）', '灵感渲染（普通渲染）.mov'),
    body: [
      'sec_05_operation_灵感渲染_普通渲染_.mp4',
      'sec_05_normal_render_result.mp4',
      'sec_05_operation_灵感渲染_生成套图_-1.mp4',
      'sec_05_suite_result.mp4',
    ],
  },
  {
    no: '06',
    title: '总图排布',
    sub: '自动生成高效合规车位',
    desc: '支持修改与指标实时刷新，让专项排布快速进入可优化状态',
    clip: manual('车库智能排布', '车库智能排布-1.mov'),
    body: ['sec_06_operation_车库智能排布-1.mp4'],
  },
  {
    no: '07',
    title: 'AI仿真分析',
    sub: '集成多项仿真分析能力',
    desc: '实现快速反馈与实时优化，让方案性能判断更直观',
    clip: manual('ai仿真分析', 'ai仿真分析-1.mov'),
    body: ['sec_07_operation_ai仿真分析-1.mp4'],
  },
  {
    no: '08',
    title: 'AI成本估算',
    sub: '海量真实项目数据训练模型',
    desc: '快速完成估算，误差可控，为方案决策提供量化依据',
    clip: manual('ai成本估算', 'ai成本估算-1.mov'),
    body: ['sec_08_operation_ai成本估算-1.mp4'],
  },
  {
    no: '09',
    title: '文本生成',
    sub: '整合成果图，自动生成汇报 PPT',
    desc: '文本生成操作素材暂缺，本版先保留统一章节登场',
    clip: null,
    body: [],
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

function quoteFile(p) {
  return p.replace(/'/g, "'\\''");
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
    run([
      '-y',
      '-ss', String(ts),
      '-i', section.clip,
      '-frames:v', '1',
      '-vf', 'scale=720:-1',
      out,
    ], `extract side ${section.no}-${i}`);
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
    <clipPath id="sideClip"><rect x="0" y="0" width="430" height="260" rx="8"/></clipPath>
  </defs>`;
}

function renderSvg(section, sideFiles, t) {
  const inA = smooth(0.05, 0.8, t);
  const outA = 1 - smooth(chapterDur - 0.55, chapterDur, t);
  const a = inA * outA;
  const cardScale = 0.86 + 0.14 * easeOut(t / 1.05);
  const cardW = 620;
  const cardH = 305;
  const cardX = 650 + (1 - cardScale) * cardW / 2;
  const cardY = 410 + (1 - cardScale) * cardH / 2;
  const scan = -500 + (W + 1000) * ((t / chapterDur) * 0.65);
  const drift = easeOut(t / chapterDur);
  const sideA = smooth(0.45, 1.25, t) * outA;
  const titleA = smooth(0.7, 1.25, t) * outA;
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

    <text x="960" y="188" text-anchor="middle" font-family="MiSans, PingFang SC, Hiragino Sans GB, Arial" font-size="42" font-weight="700" letter-spacing="1.2" fill="#d9d4ff" opacity="${(0.32 * titleA).toFixed(3)}" filter="url(#blur8)">从工作流的第 ${section.no} 步，进入${esc(section.title)}</text>
    <text x="960" y="188" text-anchor="middle" font-family="MiSans, PingFang SC, Hiragino Sans GB, Arial" font-size="42" font-weight="700" letter-spacing="1.2" fill="#f2f0ff" opacity="${(0.94 * titleA).toFixed(3)}">从工作流的第 ${section.no} 步，进入${esc(section.title)}</text>
    <text x="960" y="230" text-anchor="middle" font-family="MiSans, PingFang SC, Hiragino Sans GB, Arial" font-size="20" font-weight="400" letter-spacing="1.5" fill="#aaa2df" opacity="${(0.82 * titleA).toFixed(3)}">${esc(section.sub)}</text>

    <g opacity="${a.toFixed(3)}" transform="translate(${cardX.toFixed(2)} ${cardY.toFixed(2)}) scale(${cardScale.toFixed(4)})">
      <rect x="-28" y="-28" width="${cardW + 56}" height="${cardH + 56}" rx="56" fill="#151039" stroke="#8d7cff" stroke-opacity="0.30" filter="url(#glow)"/>
      <rect x="0" y="0" width="${cardW}" height="${cardH}" rx="42" fill="url(#cardGrad)" opacity="0.96"/>
      <rect x="0" y="0" width="${cardW}" height="${cardH}" rx="42" fill="none" stroke="#d9d3ff" stroke-opacity="0.24" stroke-width="1.5"/>
      <text x="132" y="145" text-anchor="middle" font-family="MiSans, Avenir Next, Arial" font-size="46" font-weight="800" fill="#f2efff" opacity="0.82">${section.no}</text>
      <text x="335" y="146" text-anchor="middle" font-family="MiSans, PingFang SC, Hiragino Sans GB, Arial" font-size="58" font-weight="800" fill="#ffffff">${esc(section.title)}</text>
      <text x="310" y="220" text-anchor="middle" font-family="MiSans, PingFang SC, Hiragino Sans GB, Arial" font-size="27" font-weight="500" fill="#f3efff" opacity="0.88">${esc(section.sub)}</text>
      <rect x="58" y="70" width="80" height="80" rx="22" fill="#ffffff" opacity="0.16"/>
      <path d="M82 109 L101 126 L136 85" stroke="#ffffff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.92"/>
    </g>

    <text x="960" y="805" text-anchor="middle" font-family="MiSans, PingFang SC, Hiragino Sans GB, Arial" font-size="22" letter-spacing="1.2" fill="#bdb6ea" opacity="${(0.74 * titleA).toFixed(3)}">${esc(section.desc)}</text>
    <text x="960" y="875" text-anchor="middle" font-family="Avenir Next, Arial" font-size="18" letter-spacing="7" fill="#8f84dc" opacity="${(0.70 * a).toFixed(3)}">${section.no} / ${esc(section.title).toUpperCase()}</text>
  </svg>`;
}

async function renderChapter(section) {
  const sideFiles = extractSideFrames(section);
  const dir = path.join(frameRoot, section.no);
  fs.mkdirSync(dir, { recursive: true });
  const count = Math.round(chapterDur * fps);
  for (let i = 0; i < count; i++) {
    const out = path.join(dir, `frame_${String(i).padStart(4, '0')}.png`);
    const t = i / fps;
    await sharp(Buffer.from(renderSvg(section, sideFiles, t))).png().toFile(out);
  }
  const part = path.join(outDir, `chapter_${section.no}_floating.mp4`);
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
  ], `render floating chapter ${section.no}`);
  return part;
}

async function main() {
  assertFile(v10Intro);
  assertFile(music);
  assertFile(fontRegular);
  assertFile(fontBold);

  const parts = [v10Intro];
  const records = [{ segment: '开头/升级亮点/更新内容/九环节总览', file: v10Intro }];

  for (const section of sections) {
    const chapter = await renderChapter(section);
    parts.push(chapter);
    records.push({ segment: `${section.no} ${section.title} 悬浮章节开头`, file: chapter });
    for (const body of section.body) {
      const p = path.join(v09Dir, body);
      assertFile(p);
      parts.push(p);
      records.push({ segment: `${section.no} ${section.title} 操作/成果`, file: p });
    }
  }

  const end = path.join(v09Dir, 'end_card_v09.mp4');
  assertFile(end);
  parts.push(end);
  records.push({ segment: '结尾', file: end });

  const list = path.join(outDir, 'concat_list.txt');
  fs.writeFileSync(list, parts.map((p) => `file '${quoteFile(p)}'`).join('\n') + '\n');
  const videoOnly = path.join(outDir, 'video_concat_v11.mp4');
  run(['-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', videoOnly], 'concat v11');
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
  ], 'mux v11 music');

  run(['-y', '-i', output, '-vf', 'fps=0.25,scale=360:-1,tile=10x6', '-frames:v', '1', preview], 'preview v11');

  fs.writeFileSync(logPath, [
    '# Concetto 2.0 章节开头统一悬浮样式 v11',
    '',
    '根据反馈：所有九大环节章节开头均取消蓝色平面信息卡，统一使用“暗场 + 顶部发光标题 + 周围漂浮素材 + 中心发光功能卡”的前策式登场。',
    '',
    `输出视频：\`${output}\``,
    `全片预览：\`${preview}\``,
    `总时长：约 ${Math.floor(totalDur / 60)}:${String(Math.round(totalDur % 60)).padStart(2, '0')}`,
    '',
    '| 段落 | 文件 |',
    '|---|---|',
    ...records.map((r) => `| ${r.segment} | \`${path.relative(cwd, r.file)}\` |`),
  ].join('\n'));

  console.log(`v11 done: ${output}`);
  console.log(`duration: ${totalDur.toFixed(2)}s`);
}

await main();
