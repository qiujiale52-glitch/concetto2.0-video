import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import sharp from './thumbs/node_modules/sharp/dist/index.mjs';

const cwd = process.cwd();
const ffmpeg = path.join(cwd, '.tools/media-bin/node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg');
const ffprobe = path.join(cwd, '.tools/media-bin/node_modules/@ffprobe-installer/darwin-arm64/ffprobe');
const realesr = path.join(cwd, '.tools/ai-upscale/bin/realesrgan-ncnn-vulkan');
const modelDir = path.join(cwd, '.tools/ai-upscale/bin/models');
const music = path.join(cwd, '04-正版授权音乐库', '未来科技宽广磅礴音乐15437.wav');

const W = 1920;
const H = 1080;
const outFps = 30;
const aiFps = 12;

const prevDir = path.join(cwd, '06_预览输出', 'refined_v16_parts');
const outDir = path.join(cwd, '06_预览输出', 'refined_v22_ai_ops_reencoded_parts');
const cacheRoot = path.join(cwd, '.tools', 'ai-upscale', 'cache_v19_ai_ops');
const bgRoot = path.join(outDir, 'operation_backgrounds');
for (const d of [outDir, cacheRoot, bgRoot]) fs.mkdirSync(d, { recursive: true });

const output = path.join(cwd, '06_预览输出', 'Concetto_2.0_AI超分操作演示_v22_ops_低清.mp4');
const preview = path.join(cwd, '06_预览输出', 'Concetto_2.0_AI超分操作演示_v22_ops_全片预览.jpg');
const opPreview = path.join(cwd, '06_预览输出', 'Concetto_2.0_AI超分操作演示_v22_ops_操作段预览.jpg');
const logPath = path.join(cwd, '03_脚本与结构', 'Concetto 2.0_AI超分操作演示_v22_模板修正说明.md');

const manual = (...p) => path.join(cwd, '手动保存素材', ...p);

const ops = [
  {
    key: '01_pre_design',
    no: '01',
    title: '前策分析',
    feature: '从任务书解读，到区位、现状、案例与策略生成',
    source: manual('前策分析', '前策分析-1.mov'),
    replaceBase: 'sec_01_operation.mp4',
    outBase: 'sec_01_operation_ai_x4.mp4',
  },
  {
    key: '02_site_position',
    no: '02',
    title: '场地定位',
    feature: '快速建立场地认知基础',
    source: manual('场地定位', '场地定位-1.mov'),
    replaceBase: 'sec_02_operation.mp4',
    outBase: 'sec_02_operation_ai_x4.mp4',
  },
  {
    key: '03_image_to_model',
    no: '03',
    title: '图生模型',
    feature: '上传总图，一键生成 3D 模型并支持深化编辑',
    source: manual('图生模型', '图生模型-1.mov'),
    replaceBase: 'sec_03_operation.mp4',
    outBase: 'sec_03_operation_ai_x4.mp4',
  },
  {
    key: '04_param_modeling',
    no: '04',
    title: '数智建模',
    feature: '参数化驱动高效生成，提升建模速度精度',
    source: manual('数智建模', '数智建模-1.mov'),
    replaceBase: 'sec_04_operation.mp4',
    outBase: 'sec_04_operation_ai_x4.mp4',
  },
  {
    key: '05_render_normal',
    no: '05',
    title: 'AI灵感渲染',
    feature: '快速生成多维度渲染结果',
    source: manual('灵感渲染（普通渲染）', '灵感渲染（普通渲染）.mov'),
    replaceBase: 'sec_05_operation_normal.mp4',
    outBase: 'sec_05_operation_normal_ai_x4.mp4',
  },
  {
    key: '05_render_suite',
    no: '05',
    title: 'AI灵感渲染',
    feature: '上传多视角底图，一键生成一致性套图',
    source: manual('灵感渲染（生成套图）', '灵感渲染（生成套图）-1.mov'),
    replaceBase: 'sec_05_operation_suite.mp4',
    outBase: 'sec_05_operation_suite_ai_x4.mp4',
  },
  {
    key: '06_site_layout',
    no: '06',
    title: '总图排布',
    feature: '自动生成高效合规车位，指标实时刷新',
    source: manual('车库智能排布', '车库智能排布-1.mov'),
    replaceBase: 'sec_06_operation.mp4',
    outBase: 'sec_06_operation_ai_x4.mp4',
  },
  {
    key: '07_simulation',
    no: '07',
    title: 'AI仿真分析',
    feature: '仿真分析与成果一体展示',
    source: manual('ai仿真分析', 'ai仿真分析-1.mov'),
    replaceBase: 'sec_07_operation.mp4',
    outBase: 'sec_07_operation_ai_x4.mp4',
    crop: '1800:900:60:110',
    cacheKey: '07_simulation_v22_full_labels',
  },
  {
    key: '08_cost',
    no: '08',
    title: 'AI成本估算',
    feature: '快速完成估算，误差可控',
    source: manual('ai成本估算', 'ai成本估算-1.mov'),
    replaceBase: 'sec_08_operation.mp4',
    outBase: 'sec_08_operation_ai_x4.mp4',
  },
  {
    key: '09_text_generation',
    no: '09',
    title: '文本生成',
    feature: '整合成果材料，自动生成汇报文本',
    source: manual('文本生成', '文本生成-1.mov'),
    replaceBase: 'sec_09_text_generation_direct.mp4',
    outBase: 'sec_09_text_generation_direct_ai_x4.mp4',
  },
];

function run(bin, args, label) {
  const r = spawnSync(bin, args, { stdio: 'inherit' });
  if (r.status !== 0) throw new Error(`${label} failed with status ${r.status}`);
}

function runCapture(bin, args, label) {
  const r = spawnSync(bin, args, { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`${label} failed with status ${r.status}: ${r.stderr}`);
  return r.stdout.trim();
}

function assertFile(p) {
  if (!fs.existsSync(p)) throw new Error(`missing file: ${p}`);
}

function quoteFile(p) {
  return p.replace(/'/g, "'\\''");
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function probeDur(file) {
  const out = runCapture(ffprobe, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nk=1:nw=1', file], `probe ${file}`);
  const n = Number.parseFloat(out);
  return Number.isFinite(n) ? n : 0;
}

function countPng(dir) {
  if (!fs.existsSync(dir)) return 0;
  return fs.readdirSync(dir).filter((f) => /\.png$/i.test(f)).length;
}

function bgSvg(op) {
  return `<?xml version="1.0" encoding="UTF-8"?>
  <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="core" cx="50%" cy="52%" r="70%">
        <stop offset="0%" stop-color="#31236e" stop-opacity="0.54"/>
        <stop offset="54%" stop-color="#070611" stop-opacity="0.62"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="1"/>
      </radialGradient>
      <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#7668ff" stop-opacity="0"/>
        <stop offset="48%" stop-color="#cfc9ff" stop-opacity="0.75"/>
        <stop offset="100%" stop-color="#7668ff" stop-opacity="0"/>
      </linearGradient>
      <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
        <feDropShadow dx="0" dy="0" stdDeviation="14" flood-color="#7465ff" flood-opacity="0.56"/>
        <feDropShadow dx="0" dy="8" stdDeviation="28" flood-color="#22175f" flood-opacity="0.48"/>
      </filter>
    </defs>
    <rect width="${W}" height="${H}" fill="#010104"/>
    <rect width="${W}" height="${H}" fill="url(#core)"/>
    <path d="M 104 875 C 590 760, 1238 790, 1818 695" stroke="#7668ff" stroke-opacity="0.22" stroke-width="1.2" fill="none"/>
    <path d="M 290 178 C 760 128, 1250 146, 1660 96" stroke="#ffffff" stroke-opacity="0.055" stroke-width="1" fill="none"/>
    <rect x="92" y="132" width="1736" height="894" rx="30" fill="#070612" opacity="0.58" filter="url(#glow)"/>
    <rect x="78" y="118" width="1764" height="922" rx="36" fill="none" stroke="#7d6dff" stroke-opacity="0.36" stroke-width="1.2" filter="url(#glow)"/>
    <rect x="92" y="132" width="1736" height="894" rx="28" fill="none" stroke="#ffffff" stroke-opacity="0.08" stroke-width="1"/>
    <text x="112" y="82" font-family="Avenir Next, Arial" font-size="15" letter-spacing="6" fill="#857be8" opacity="0.78">CONCETTO 2.0 / WORKFLOW DEMO</text>
    <rect x="112" y="104" width="245" height="1.2" fill="#7668ff" opacity="0.55"/>
    <text x="1748" y="82" text-anchor="end" font-family="Avenir Next, Arial" font-size="18" letter-spacing="4" fill="#8f84dc" opacity="0.78">${op.no} / ${esc(op.title)}</text>
    <text x="610" y="84" font-family="MiSans, PingFang SC, Arial" font-size="24" fill="#8f84dc" opacity="0.82">${op.no}</text>
    <text x="665" y="86" font-family="MiSans, PingFang SC, Arial" font-size="36" font-weight="700" fill="#f3f0ff">${esc(op.title)}</text>
    <text x="930" y="84" font-family="MiSans, PingFang SC, Arial" font-size="20" fill="#aaa2df" opacity="0.92">${esc(op.feature)}</text>
  </svg>`;
}

async function renderBg(op) {
  const out = path.join(bgRoot, `${op.key}_bg.png`);
  if (!fs.existsSync(out)) await sharp(Buffer.from(bgSvg(op))).png().toFile(out);
  return out;
}

function extractFrames(op, inDir, expected) {
  if (countPng(inDir) >= expected) return;
  fs.rmSync(inDir, { recursive: true, force: true });
  fs.mkdirSync(inDir, { recursive: true });
  run(ffmpeg, [
    '-y',
    '-i', op.source,
    '-vf', `fps=${aiFps},crop=${op.crop || '1480:740:220:170'}`,
    path.join(inDir, 'frame_%04d.png'),
  ], `extract frames ${op.key}`);
}

function upscaleFrames(op, inDir, aiDir, expected) {
  if (countPng(aiDir) >= expected) return;
  fs.rmSync(aiDir, { recursive: true, force: true });
  fs.mkdirSync(aiDir, { recursive: true });
  run(realesr, [
    '-i', inDir,
    '-o', aiDir,
    '-m', modelDir,
    '-n', 'realesr-animevideov3',
    '-s', '4',
    '-t', '256',
    '-j', '1:2:2',
  ], `ai upscale ${op.key}`);
}

async function renderOperation(op) {
  const dur = probeDur(op.source);
  const expected = Math.max(1, Math.round(dur * aiFps));
  const cache = path.join(cacheRoot, op.cacheKey || op.key);
  const inDir = path.join(cache, 'frames_in');
  const aiDir = path.join(cache, 'frames_ai_x4_line_ui');
  fs.mkdirSync(cache, { recursive: true });
  extractFrames(op, inDir, expected);
  upscaleFrames(op, inDir, aiDir, expected);

  const bg = await renderBg(op);
  const out = path.join(outDir, op.outBase);
  const filter = [
    `[0:v]scale=1740:870:force_original_aspect_ratio=decrease:flags=lanczos,pad=1740:870:(ow-iw)/2:(oh-ih)/2:color=white,unsharp=3:3:0.20:3:3:0.08,setsar=1[ui]`,
    `[1:v]scale=${W}:${H},setsar=1[bg]`,
    `[bg][ui]overlay=x=90:y=145:format=auto[v0]`,
    `[v0]drawbox=x=90:y=145:w=1740:h=870:color=0x8d7cff@0.22:t=2,fade=t=in:st=0:d=0.16,fade=t=out:st=${Math.max(0.1, dur - 0.25).toFixed(3)}:d=0.25,fps=${outFps}[v]`,
  ].join(';');
  run(ffmpeg, [
    '-y',
    '-framerate', String(aiFps),
    '-pattern_type', 'glob',
    '-i', path.join(aiDir, '*.png'),
    '-loop', '1',
    '-t', dur.toFixed(3),
    '-i', bg,
    '-filter_complex', filter,
    '-map', '[v]',
    '-an',
    '-c:v', 'libx264',
    '-preset', 'slow',
    '-crf', '16',
    '-pix_fmt', 'yuv420p',
    '-r', String(outFps),
    out,
  ], `render operation ${op.key}`);
  return out;
}

function readConcatList(file) {
  return fs.readFileSync(file, 'utf8')
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^file\s+'/, '').replace(/'$/, '').replace(/'\\''/g, "'"));
}

async function main() {
  for (const p of [ffmpeg, ffprobe, realesr, modelDir, music, path.join(prevDir, 'concat_list.txt')]) assertFile(p);
  for (const op of ops) assertFile(op.source);

  const replacements = new Map();
  for (const op of ops) {
    const opOut = await renderOperation(op);
    replacements.set(op.replaceBase, opOut);
  }

  const previousList = path.join(prevDir, 'concat_list.txt');
  const parts = readConcatList(previousList).map((p) => replacements.get(path.basename(p)) || p);
  const list = path.join(outDir, 'concat_list_v22.txt');
  fs.writeFileSync(list, parts.map((p) => `file '${quoteFile(p)}'`).join('\n') + '\n');

  const videoOnly = path.join(outDir, 'video_concat_v22_ops_reencoded.mp4');
  run(ffmpeg, [
    '-y',
    '-f', 'concat',
    '-safe', '0',
    '-i', list,
    '-vf', `scale=${W}:${H}:force_original_aspect_ratio=decrease:flags=lanczos,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:color=black,fps=${outFps},format=yuv420p,setpts=PTS-STARTPTS`,
    '-an',
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '17',
    '-pix_fmt', 'yuv420p',
    '-r', String(outFps),
    '-movflags', '+faststart',
    videoOnly,
  ], 'concat v22 ops full reencode');
  const totalDur = probeDur(videoOnly);

  run(ffmpeg, [
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
    '-movflags', '+faststart',
    '-shortest',
    output,
  ], 'mux v22 ops music');

  run(ffmpeg, ['-y', '-i', output, '-vf', 'fps=0.24,scale=360:-1,tile=10x7', '-frames:v', '1', preview], 'preview v22 ops');
  run(ffmpeg, ['-y', '-ss', '00:00:32', '-i', output, '-t', '00:01:50', '-vf', 'fps=1,scale=480:-1,tile=10x7', '-frames:v', '1', opPreview], 'operation preview v22 ops');

  const rows = ops.map((op) => `| ${op.no} ${op.title} | ${path.basename(op.source)} | ${op.outBase} |`).join('\n');
  fs.writeFileSync(logPath, [
    '# Concetto 2.0 AI 超分操作演示 v22 模板修正',
    '',
    '- 基于 v18/v16 的既有合成列表，仅替换所有操作演示片段；',
    '- 修复 v19 在部分播放器中操作演示段黑屏的问题：最终拼接从 `-c copy` 改为统一 1920×1080、30fps、yuv420p 全片重编码，并写入 `faststart`；',
    '- 操作录屏统一裁切掉冗余边框，并放大到接近全画面内容区；',
    '- 使用项目本地 Real-ESRGAN ncnn Vulkan，模型：`realesr-animevideov3`，x4 超分；',
    `- AI 处理帧率：${aiFps}fps，最终封装：${outFps}fps；`,
    '- 输出使用 CRF 16，降低二次压缩导致的糊化。',
    '- v22 修正：统一右移操作演示顶部编号与标题，避免编号和左侧英文标题重叠；',
    '- v22 修正：AI 仿真分析段单独扩大纵向取景，保留成果展示底部“视野 / 人行流线 / 碳排放”文字。',
    '',
    '| 环节 | 源素材 | 新片段 |',
    '|---|---|---|',
    rows,
    '',
    `输出视频：\`${output}\``,
    `全片预览：\`${preview}\``,
    `操作段预览：\`${opPreview}\``,
    '',
  ].join('\n'));

  console.log(`DONE ${output}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
