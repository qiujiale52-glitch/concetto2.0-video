import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import sharp from './thumbs/node_modules/sharp/dist/index.mjs';

const cwd = process.cwd();
const ffmpeg = path.join(cwd, '.tools/media-bin/node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg');
const ffprobe = path.join(cwd, '.tools/media-bin/node_modules/@ffprobe-installer/darwin-arm64/ffprobe');
const realesr = path.join(cwd, '.tools/ai-upscale/bin/realesrgan-ncnn-vulkan');
const modelDir = path.join(cwd, '.tools/ai-upscale/bin/models');

const inputRoot = path.join(cwd, '高帧率版手动保存素材');
const outRoot = path.join(cwd, '06_预览输出', 'refined_v31_final_2560p60_parts');
const outDir = path.join(outRoot, 'ops');
const bgDir = path.join(outRoot, 'operation_backgrounds');
const cacheRoot = path.join(cwd, '.tools', 'ai-upscale', 'cache_v31_final_ops_x4_1440p60');
const logPath = path.join(cwd, '03_脚本与结构', 'Concetto 2.0_v31_正片级操作素材x4_1440p60说明.md');

const W = 2560;
const H = 1440;
const FPS = Number(process.env.FPS || 60);
const aiModel = process.env.AI_MODEL || 'realesr-animevideov3';
const aiScale = process.env.AI_SCALE || '4';
const aiTile = process.env.AI_TILE || '256';
const keepFrames = process.env.KEEP_AI_FRAMES === '1';
const only = process.env.ONLY ? new Set(process.env.ONLY.split(',').map((s) => s.trim()).filter(Boolean)) : null;

// 旧版 1920×1080 裁切 1480:740:220:170 按 4/3 等比放大。
const normalCrop = '1974:988:294:226';
// 前策留白较多，单独收紧，让中文边缘在正片里更稳。
const preDesignCrop = '1850:924:355:295';
// 仿真分析需要保留底部“视野 / 人行流线 / 碳排放”文字。
const simulationCrop = '2400:1240:80:96';

const ops = [
  {
    key: '01_pre_design',
    no: '01',
    title: '前策分析',
    feature: '从任务书解读，到区位、现状、案例与策略生成',
    rel: '前策分析/前策分析-1.mov',
    crop: preDesignCrop,
    outBase: 'sec_01_operation_ai_x4_1440p60.mp4',
    replaceBases: ['sec_01_operation_ai_x4.mp4'],
  },
  {
    key: '02_site_position',
    no: '02',
    title: '场地定位',
    feature: '快速建立场地认知基础',
    rel: '场地定位/场地定位-1.mov',
    crop: normalCrop,
    outBase: 'sec_02_operation_ai_x4_1440p60.mp4',
    replaceBases: ['sec_02_operation_ai_x4.mp4'],
  },
  {
    key: '03_image_to_model',
    no: '03',
    title: '图生模型',
    feature: '上传总图，一键生成 3D 模型并支持深化编辑',
    rel: '图生模型/图生模型-1.mov',
    crop: normalCrop,
    outBase: 'sec_03_operation_ai_x4_1440p60.mp4',
    replaceBases: ['sec_03_operation_ai_x4.mp4'],
  },
  {
    key: '04_param_modeling',
    no: '04',
    title: '数智建模',
    feature: '参数化驱动高效生成，提升建模速度精度',
    rel: '数智建模/数智建模-1.mov',
    crop: normalCrop,
    outBase: 'sec_04_operation_ai_x4_1440p60.mp4',
    replaceBases: ['sec_04_operation_ai_x4.mp4'],
  },
  {
    key: '05_render_normal',
    no: '05',
    title: 'AI灵感渲染',
    feature: '快速生成多维度渲染结果',
    rel: '灵感渲染（普通渲染）/灵感渲染（普通渲染）-1.mov',
    crop: normalCrop,
    outBase: 'sec_05_operation_normal_ai_x4_1440p60.mp4',
    replaceBases: ['sec_05_operation_normal_ai_x4.mp4'],
  },
  {
    key: '05_render_suite',
    no: '05',
    title: 'AI灵感渲染',
    feature: '上传多视角底图，一键生成一致性套图',
    rel: '灵感渲染（生成套图）/灵感渲染（生成套图）-1.mov',
    crop: normalCrop,
    outBase: 'sec_05_operation_suite_ai_x4_1440p60.mp4',
    replaceBases: ['sec_05_operation_suite_ai_x4.mp4'],
  },
  {
    key: '06_site_layout',
    no: '06',
    title: '车库智能排布',
    feature: '自动生成高效合规车位，指标实时刷新',
    rel: '车库智能排布/车库智能排布-1.mov',
    crop: normalCrop,
    outBase: 'sec_06_operation_ai_x4_1440p60.mp4',
    replaceBases: ['sec_06_operation_ai_x4.mp4'],
  },
  {
    key: '07_simulation',
    no: '07',
    title: 'AI仿真分析',
    feature: '仿真分析与成果一体展示',
    rel: 'ai仿真分析/ai仿真分析-1.mov',
    crop: simulationCrop,
    outBase: 'sec_07_operation_ai_x4_1440p60.mp4',
    replaceBases: ['sec_07_operation_ai_x4.mp4'],
  },
  {
    key: '08_cost',
    no: '08',
    title: 'AI成本估算',
    feature: '快速完成估算，误差可控',
    rel: 'ai成本估算/ai成本估算-1.mov',
    crop: normalCrop,
    outBase: 'sec_08_operation_ai_x4_1440p60.mp4',
    replaceBases: ['sec_08_operation_ai_x4.mp4'],
  },
  {
    key: '09_text_generation',
    no: '09',
    title: '文本生成',
    feature: '整合成果材料，自动生成汇报文本',
    rel: '文本生成/文本生成-1.mov',
    crop: normalCrop,
    outBase: 'sec_09_text_generation_direct_ai_x4_1440p60.mp4',
    titledOutBase: 'sec_09_text_generation_with_title_1440p60.mp4',
    replaceBases: ['sec_09_text_generation_with_title_v22.mp4', 'sec_09_text_generation_direct_ai_x4.mp4'],
  },
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function cleanDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  ensureDir(dir);
}

function run(bin, args, label) {
  console.log(`\n▶ ${label}`);
  const result = spawnSync(bin, args, { stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`${label} failed: ${result.status}`);
}

function capture(bin, args, label) {
  const result = spawnSync(bin, args, { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`${label} failed: ${result.status}\n${result.stderr}`);
  return result.stdout.trim();
}

function assertFile(p) {
  if (!fs.existsSync(p)) throw new Error(`missing file: ${p}`);
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function probeDur(file) {
  const out = capture(ffprobe, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nk=1:nw=1', file], `probe ${file}`);
  const n = Number.parseFloat(out);
  return Number.isFinite(n) ? n : 0;
}

function countPng(dir) {
  if (!fs.existsSync(dir)) return 0;
  return fs.readdirSync(dir).filter((f) => /\.png$/i.test(f)).length;
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function easeOutCubic(t) {
  t = clamp01(t);
  return 1 - Math.pow(1 - t, 3);
}

function easeInOutCubic(t) {
  t = clamp01(t);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function bgSvg(op) {
  const s = W / 1920;
  const S = (v) => Math.round(v * s);
  const titleUnits = Array.from(op.title).reduce((sum, char) => sum + (/^[\x00-\x7F]$/.test(char) ? 0.62 : 1), 0);
  const featureX = Math.min(760, Math.max(630, 438 + titleUnits * 37 + 34));
  return `<?xml version="1.0" encoding="UTF-8"?>
  <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="core" cx="50%" cy="52%" r="70%">
        <stop offset="0%" stop-color="#31236e" stop-opacity="0.54"/>
        <stop offset="54%" stop-color="#070611" stop-opacity="0.62"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="1"/>
      </radialGradient>
      <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
        <feDropShadow dx="0" dy="0" stdDeviation="${S(14)}" flood-color="#7465ff" flood-opacity="0.56"/>
        <feDropShadow dx="0" dy="${S(8)}" stdDeviation="${S(28)}" flood-color="#22175f" flood-opacity="0.48"/>
      </filter>
    </defs>
    <rect width="${W}" height="${H}" fill="#010104"/>
    <rect width="${W}" height="${H}" fill="url(#core)"/>
    <path d="M ${S(104)} ${S(875)} C ${S(590)} ${S(760)}, ${S(1238)} ${S(790)}, ${S(1818)} ${S(695)}" stroke="#7668ff" stroke-opacity="0.22" stroke-width="${(1.2 * s).toFixed(2)}" fill="none"/>
    <path d="M ${S(290)} ${S(178)} C ${S(760)} ${S(128)}, ${S(1250)} ${S(146)}, ${S(1660)} ${S(96)}" stroke="#ffffff" stroke-opacity="0.055" stroke-width="${(1 * s).toFixed(2)}" fill="none"/>
    <rect x="${S(70)}" y="${S(130)}" width="${S(1780)}" height="${S(910)}" rx="${S(34)}" fill="#05050d" opacity="0.50" filter="url(#glow)"/>
    <rect x="${S(62)}" y="${S(122)}" width="${S(1796)}" height="${S(926)}" rx="${S(38)}" fill="none" stroke="#7d6dff" stroke-opacity="0.34" stroke-width="${(1.3 * s).toFixed(2)}" filter="url(#glow)"/>
    <rect x="${S(76)}" y="${S(136)}" width="${S(1768)}" height="${S(898)}" rx="${S(30)}" fill="none" stroke="#ffffff" stroke-opacity="0.08" stroke-width="${(1 * s).toFixed(2)}"/>
    <text x="${S(112)}" y="${S(82)}" font-family="Avenir Next, Arial" font-size="${S(15)}" letter-spacing="${S(6)}" fill="#857be8" opacity="0.78">CONCETTO 2.0</text>
    <rect x="${S(112)}" y="${S(104)}" width="${S(245)}" height="${(1.2 * s).toFixed(2)}" fill="#7668ff" opacity="0.55"/>
    <text x="${S(390)}" y="${S(84)}" font-family="MiSans, PingFang SC, Arial" font-size="${S(24)}" fill="#8f84dc" opacity="0.82">${op.no}</text>
    <text x="${S(438)}" y="${S(86)}" font-family="MiSans, PingFang SC, Arial" font-size="${S(36)}" font-weight="700" fill="#f3f0ff">${esc(op.title)}</text>
    <text x="${S(featureX)}" y="${S(84)}" font-family="MiSans, PingFang SC, Arial" font-size="${S(19)}" fill="#aaa2df" opacity="0.92">${esc(op.feature)}</text>
  </svg>`;
}

async function renderBg(op) {
  ensureDir(bgDir);
  const out = path.join(bgDir, `${op.key}_bg_1440p.png`);
  // Background/header is code-native and intentionally regenerated every run;
  // this prevents an older baked header from surviving after layout changes.
  await sharp(Buffer.from(bgSvg(op))).png().toFile(out);
  return out;
}

function extractFrames(op, input, inDir, expected) {
  if (countPng(inDir) >= expected) return;
  cleanDir(inDir);
  run(ffmpeg, [
    '-y',
    '-i', input,
    '-vf', `fps=${FPS},crop=${op.crop},setsar=1`,
    '-pix_fmt', 'rgb24',
    path.join(inDir, 'frame_%06d.png'),
  ], `抽帧裁切 ${op.no} ${op.title} ${op.crop}`);
}

function upscaleFrames(op, inDir, aiDir, expected) {
  if (countPng(aiDir) >= expected) return;
  cleanDir(aiDir);
  run(realesr, [
    '-i', inDir,
    '-o', aiDir,
    '-m', modelDir,
    '-n', aiModel,
    '-s', String(aiScale),
    '-t', String(aiTile),
    '-j', '1:2:2',
  ], `Real-ESRGAN x${aiScale} ${op.no} ${op.title}`);
}

async function renderOperation(op) {
  const input = path.join(inputRoot, op.rel);
  assertFile(input);
  const dur = probeDur(input);
  const expected = Math.max(1, Math.round(dur * FPS));
  const cache = path.join(cacheRoot, op.key);
  const inDir = path.join(cache, 'frames_in_crop_60fps');
  const aiDir = path.join(cache, 'frames_ai_x4');
  ensureDir(cache);

  extractFrames(op, input, inDir, expected);
  if (countPng(inDir) === 0) throw new Error(`no frames extracted: ${op.key}`);
  upscaleFrames(op, inDir, aiDir, expected);
  if (countPng(aiDir) === 0) throw new Error(`no AI frames created: ${op.key}`);

  const bg = await renderBg(op);
  const out = path.join(outDir, op.outBase);
  ensureDir(outDir);

  const uiW = 2320;
  const uiH = 1160;
  const uiX = Math.round((W - uiW) / 2);
  const uiY = 182;
  const padColor = op.key === '07_simulation' ? '0x010104' : 'white';
  const filter = [
    `[0:v]scale=${uiW}:${uiH}:force_original_aspect_ratio=decrease:flags=lanczos,pad=${uiW}:${uiH}:(ow-iw)/2:(oh-ih)/2:color=${padColor},unsharp=5:5:0.34:3:3:0.12,eq=contrast=1.018:saturation=1.004,setsar=1[ui]`,
    `[1:v]scale=${W}:${H},setsar=1[bg]`,
    `[bg][ui]overlay=x=${uiX}:y=${uiY}:format=auto[v0]`,
    `[v0]fade=t=in:st=0:d=0.16,fade=t=out:st=${Math.max(0.1, dur - 0.25).toFixed(3)}:d=0.25,fps=${FPS},format=yuv420p,setpts=PTS-STARTPTS[v]`,
  ].join(';');

  run(ffmpeg, [
    '-y',
    '-framerate', String(FPS),
    '-i', path.join(aiDir, 'frame_%06d.png'),
    '-loop', '1',
    '-t', dur.toFixed(3),
    '-i', bg,
    '-filter_complex', filter,
    '-map', '[v]',
    '-an',
    '-c:v', 'libx264',
    '-preset', 'slow',
    '-crf', '10',
    '-pix_fmt', 'yuv420p',
    '-r', String(FPS),
    '-movflags', '+faststart',
    out,
  ], `封装操作段 ${op.no} ${op.title}`);

  if (!keepFrames) fs.rmSync(cache, { recursive: true, force: true });
  return { op, input, out, dur, crop: op.crop };
}

async function renderTextTitleOverlay(baseFile, op) {
  const out = path.join(outDir, op.titledOutBase);
  const overlayDir = path.join(cacheRoot, '09_text_title_overlay_frames');
  const dur = probeDur(baseFile);
  const total = Math.ceil(dur * FPS);
  cleanDir(overlayDir);

  for (let i = 0; i < total; i++) {
    const t = i / Math.max(1, total - 1);
    const p = easeOutCubic(t / 0.38);
    const shine = easeInOutCubic(clamp01((t - 0.18) / 0.46));
    const x = Math.round(156 - 70 * (1 - p));
    const alpha = clamp01(t / 0.18);
    const lineW = Math.round(426 * easeOutCubic((t - 0.20) / 0.28));
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="txt" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#d060ff"/>
          <stop offset="58%" stop-color="#9270ff"/>
          <stop offset="100%" stop-color="#4b8cff"/>
        </linearGradient>
        <filter id="glow" x="-50%" y="-60%" width="200%" height="220%">
          <feDropShadow dx="0" dy="0" stdDeviation="11" flood-color="#966eff" flood-opacity="0.60"/>
          <feDropShadow dx="0" dy="0" stdDeviation="30" flood-color="#4b8cff" flood-opacity="0.30"/>
        </filter>
      </defs>
      <rect width="${W}" height="${H}" fill="none"/>
      <rect x="0" y="0" width="900" height="${H}" fill="#080710" opacity="${(0.34 * alpha).toFixed(3)}"/>
      <rect x="${x + 6}" y="464" width="112" height="112" rx="27" fill="#8d6bff" opacity="${alpha.toFixed(3)}" filter="url(#glow)"/>
      <path d="M ${x + 44} 502 h33 l24 24 v47 h-57 z" fill="#f7f4ff" opacity="${alpha.toFixed(3)}"/>
      <path d="M ${x + 77} 502 v24 h24" fill="none" stroke="#d8cbff" stroke-width="5" opacity="${alpha.toFixed(3)}"/>
      <path d="M ${x + 54} 548 c21 -24 27 -24 48 0 c-21 24 -27 24 -48 0 z" fill="none" stroke="#8d6bff" stroke-width="5" opacity="${alpha.toFixed(3)}"/>
      <text x="${x}" y="746" font-family="MiSans, PingFang SC, Arial" font-size="54" font-weight="700" fill="url(#txt)" opacity="${alpha.toFixed(3)}" filter="url(#glow)">导入任务书</text>
      <text x="${x}" y="842" font-family="MiSans, PingFang SC, Arial" font-size="77" font-weight="850" fill="url(#txt)" opacity="${alpha.toFixed(3)}" filter="url(#glow)">一键输出PPT</text>
      <rect x="${x}" y="882" width="${lineW}" height="9" rx="5" fill="url(#txt)" opacity="${(0.82 * alpha).toFixed(3)}"/>
      <rect x="${Math.round(x + 52 + shine * 340)}" y="692" width="120" height="226" fill="#ffffff" opacity="${(0.12 * alpha).toFixed(3)}" transform="skewX(-18)"/>
    </svg>`;
    await sharp(Buffer.from(svg)).png().toFile(path.join(overlayDir, `frame_${String(i + 1).padStart(6, '0')}.png`));
  }

  run(ffmpeg, [
    '-y',
    '-i', baseFile,
    '-framerate', String(FPS),
    '-i', path.join(overlayDir, 'frame_%06d.png'),
    '-filter_complex', `[0:v]scale=${W}:${H},setsar=1,minterpolate=fps=${FPS}:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1[base];[1:v]format=rgba[ov];[base][ov]overlay=0:0:format=auto,fps=${FPS},format=yuv420p,setpts=PTS-STARTPTS[v]`,
    '-map', '[v]',
    '-an',
    '-c:v', 'libx264',
    '-preset', 'slow',
    '-crf', '10',
    '-pix_fmt', 'yuv420p',
    '-r', String(FPS),
    '-movflags', '+faststart',
    out,
  ], '封装文本生成左侧文字动效');

  if (!keepFrames) fs.rmSync(overlayDir, { recursive: true, force: true });
  return out;
}

function probeStream(file) {
  const raw = capture(ffprobe, [
    '-v', 'error',
    '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height,avg_frame_rate,duration',
    '-of', 'json',
    file,
  ], `probe stream ${file}`);
  return JSON.parse(raw).streams?.[0] || {};
}

function writeReport(results, textOverlayOut) {
  const rows = results.map((r) => {
    const v = probeStream(r.out);
    const mb = (fs.statSync(r.out).size / 1024 / 1024).toFixed(1);
    return `| ${r.op.no} ${r.op.title} | ${path.relative(cwd, r.input)} | ${path.relative(cwd, r.out)} | ${v.width}×${v.height} | ${v.avg_frame_rate} | ${Number(v.duration || r.dur).toFixed(3)}s | ${mb} MB | ${r.crop} |`;
  }).join('\n');

  const mapLines = [];
  for (const r of results) {
    const target = r.op.titledOutBase && textOverlayOut ? textOverlayOut : r.out;
    for (const base of r.op.replaceBases) {
      mapLines.push(`| ${base} | ${path.relative(cwd, target)} |`);
    }
  }

  fs.writeFileSync(logPath, [
    '# Concetto 2.0 v31 正片级操作素材 x4 / 1440p60',
    '',
    '- 输入：`高帧率版手动保存素材` 中 2560×1440/60fps 录屏；',
    '- 处理：先裁切 UI 有效区域，再 Real-ESRGAN x4，最后回落到 2560×1440/60fps 包装段；',
    '- 前策分析单独使用更紧裁切，减少文字边缘发虚；',
    '- AI 仿真分析单独保留更高纵向范围，避免底部说明文字被裁掉；',
    '- 输出为 H.264 CRF 10 / yuv420p / 60fps，可直接用于正片拼接。',
    '',
    '| 环节 | 输入 | 输出 | 分辨率 | 帧率 | 时长 | 大小 | 裁切 |',
    '| --- | --- | --- | --- | --- | --- | --- | --- |',
    rows,
    '',
    '## 正片脚本替换映射',
    '',
    '| 旧素材 basename | 新素材 |',
    '| --- | --- |',
    ...mapLines,
    '',
  ].join('\n'));
}

async function main() {
  for (const p of [ffmpeg, ffprobe, realesr, modelDir, inputRoot]) assertFile(p);
  ensureDir(outDir);
  ensureDir(cacheRoot);
  const selected = ops.filter((op) => !only || only.has(op.key) || only.has(op.no) || only.has(op.title));
  const results = [];
  let textOverlayOut = null;
  for (const op of selected) {
    const r = await renderOperation(op);
    results.push(r);
    if (op.key === '09_text_generation' && op.titledOutBase) {
      textOverlayOut = await renderTextTitleOverlay(r.out, op);
    }
  }
  writeReport(results, textOverlayOut);
  console.log('\n✅ 正片级操作素材完成');
  console.log(outDir);
  console.log(logPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
