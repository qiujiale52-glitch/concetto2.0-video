import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import sharp from './thumbs/node_modules/sharp/dist/index.mjs';

const cwd = process.cwd();
const ffmpeg = path.join(cwd, '.tools/media-bin/node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg');
const ffprobe = path.join(cwd, '.tools/media-bin/node_modules/@ffprobe-installer/darwin-arm64/ffprobe');
const sourceDir = path.join(cwd, '06_预览输出', 'refined_v33_final_2560p60_parts', 'ops');
const outDir = path.join(cwd, '06_预览输出', 'operation_pages_clean_header_v01');
const bgDir = path.join(outDir, 'backgrounds');
const overlayDir = path.join(outDir, 'text_overlay_frames');
const preview = process.env.RENDER_MODE === 'preview';
const selected = new Set((process.env.CHAPTERS || '').split(',').map((v) => v.trim()).filter(Boolean));

const W = 2560;
const H = 1440;
const FPS = 60;
const UI = { x: 120, y: 182, w: 2320, h: 1160 };

const operations = [
  { no: '01', title: '前策分析', feature: '从任务书解读，到区位、现状、案例与策略生成', file: 'sec_01_operation_ai_x4_1440p60.mp4' },
  { no: '02', title: '场地定位', feature: '快速建立场地认知基础', file: 'sec_02_operation_ai_x4_1440p60.mp4' },
  { no: '03', title: '图生模型', feature: '上传总图，一键生成 3D 模型并支持深化编辑', file: 'sec_03_operation_ai_x4_1440p60.mp4' },
  { no: '04', title: '数智建模', feature: '参数化驱动高效生成，提升建模速度精度', file: 'sec_04_operation_ai_x4_1440p60.mp4' },
  { no: '05A', title: 'AI灵感渲染', feature: '快速生成多维度渲染结果', file: 'sec_05_operation_normal_ai_x4_1440p60.mp4' },
  { no: '05B', title: 'AI灵感渲染', feature: '上传多视角底图，一键生成一致性套图', file: 'sec_05_operation_suite_ai_x4_1440p60.mp4' },
  { no: '06', title: '车库智能排布', feature: '自动生成高效合规车位，指标实时刷新', file: 'sec_06_operation_ai_x4_1440p60.mp4' },
  { no: '07', title: 'AI仿真分析', feature: '仿真分析与成果一体展示', file: 'sec_07_operation_ai_x4_1440p60.mp4' },
  { no: '08', title: 'AI成本估算', feature: '快速完成估算，误差可控', file: 'sec_08_operation_ai_x4_1440p60.mp4' },
  { no: '09', title: '文本生成', feature: '整合成果材料，自动生成汇报文本', file: 'sec_09_text_generation_direct_ai_x4_1440p60.mp4' },
];

function esc(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function run(bin, args, label, capture = false) {
  const result = spawnSync(bin, args, capture ? { encoding: 'utf8' } : { stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`${label} failed: ${result.status}${capture ? `\n${result.stderr}` : ''}`);
  return capture ? result.stdout.trim() : '';
}

function duration(file) {
  return Number.parseFloat(run(ffprobe, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nk=1:nw=1', file], `probe ${file}`, true));
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function easeOutCubic(value) {
  const t = clamp01(value);
  return 1 - Math.pow(1 - t, 3);
}

function easeInOutCubic(value) {
  const t = clamp01(value);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function backgroundSvg(op) {
  return `<?xml version="1.0" encoding="UTF-8"?>
  <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="core" cx="50%" cy="52%" r="70%"><stop offset="0" stop-color="#31236e" stop-opacity=".54"/><stop offset=".54" stop-color="#070611" stop-opacity=".62"/><stop offset="1" stop-color="#000"/></radialGradient>
      <filter id="glow" x="-60%" y="-60%" width="220%" height="220%"><feDropShadow dx="0" dy="0" stdDeviation="19" flood-color="#7465ff" flood-opacity=".56"/><feDropShadow dx="0" dy="11" stdDeviation="37" flood-color="#22175f" flood-opacity=".48"/></filter>
    </defs>
    <rect width="${W}" height="${H}" fill="#010104"/>
    <rect width="${W}" height="${H}" fill="url(#core)"/>
    <path d="M139 1167 C787 1013 1651 1053 2424 927" stroke="#7668ff" stroke-opacity=".22" stroke-width="1.6" fill="none"/>
    <path d="M387 237 C1013 171 1667 195 2213 128" stroke="#fff" stroke-opacity=".055" stroke-width="1.3" fill="none"/>
    <rect x="93" y="173" width="2373" height="1213" rx="45" fill="#05050d" opacity=".50" filter="url(#glow)"/>
    <rect x="83" y="163" width="2395" height="1235" rx="51" fill="none" stroke="#7d6dff" stroke-opacity=".34" stroke-width="1.7" filter="url(#glow)"/>
    <rect x="101" y="181" width="2357" height="1197" rx="40" fill="none" stroke="#fff" stroke-opacity=".08" stroke-width="1.3"/>
    <text x="149" y="109" font-family="Avenir Next, Arial" font-size="20" letter-spacing="8" fill="#857be8" opacity=".78">CONCETTO 2.0</text>
    <rect x="149" y="139" width="327" height="1.6" fill="#7668ff" opacity=".55"/>
    <text x="520" y="112" font-family="MiSans, PingFang SC, Arial" font-size="32" fill="#8f84dc" opacity=".82">${op.no.replace(/[AB]/g, '')}</text>
    <text x="584" y="115" font-family="MiSans, PingFang SC, Arial" font-size="48" font-weight="700" fill="#f3f0ff">${esc(op.title)}</text>
    <text x="840" y="112" font-family="MiSans, PingFang SC, Arial" font-size="25" fill="#aaa2df" opacity=".92">${esc(op.feature)}</text>
  </svg>`;
}

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(bgDir, { recursive: true });

async function renderTextTitleOverlay(baseFile) {
  const out = path.join(outDir, 'sec_09_text_generation_with_title_1440p60.mp4');
  const dur = duration(baseFile);
  const total = Math.ceil(dur * FPS);
  fs.rmSync(overlayDir, { recursive: true, force: true });
  fs.mkdirSync(overlayDir, { recursive: true });

  for (let i = 0; i < total; i += 1) {
    const t = i / Math.max(1, total - 1);
    const p = easeOutCubic(t / 0.38);
    const shine = easeInOutCubic(clamp01((t - 0.18) / 0.46));
    const x = Math.round(156 - 70 * (1 - p));
    const alpha = clamp01(t / 0.18);
    const lineW = Math.round(426 * easeOutCubic((t - 0.20) / 0.28));
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="txt" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#d060ff"/><stop offset="58%" stop-color="#9270ff"/><stop offset="100%" stop-color="#4b8cff"/></linearGradient>
        <filter id="glow" x="-50%" y="-60%" width="200%" height="220%"><feDropShadow dx="0" dy="0" stdDeviation="11" flood-color="#966eff" flood-opacity=".60"/><feDropShadow dx="0" dy="0" stdDeviation="30" flood-color="#4b8cff" flood-opacity=".30"/></filter>
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
      <rect x="${Math.round(x + 52 + shine * 340)}" y="692" width="120" height="226" fill="#fff" opacity="${(0.12 * alpha).toFixed(3)}" transform="skewX(-18)"/>
    </svg>`;
    await sharp(Buffer.from(svg)).png().toFile(path.join(overlayDir, `frame_${String(i + 1).padStart(6, '0')}.png`));
  }

  run(ffmpeg, [
    '-y', '-i', baseFile, '-framerate', String(FPS), '-i', path.join(overlayDir, 'frame_%06d.png'),
    '-filter_complex', `[0:v]scale=${W}:${H},setsar=1[base];[1:v]format=rgba[ov];[base][ov]overlay=0:0:format=auto,fps=${FPS},format=yuv420p,setpts=PTS-STARTPTS[v]`,
    '-map', '[v]', '-an', '-c:v', 'libx264', '-preset', preview ? 'veryfast' : 'slow', '-crf', preview ? '15' : '10',
    '-pix_fmt', 'yuv420p', '-r', String(FPS), '-video_track_timescale', '60000', '-movflags', '+faststart', out,
  ], 'rebuild clean operation 09 title overlay');
  fs.rmSync(overlayDir, { recursive: true, force: true });
}

for (const op of operations) {
  const chapterKey = op.no.replace(/[AB]/g, '');
  if (selected.size && !selected.has(op.no) && !selected.has(chapterKey)) continue;
  const source = path.join(sourceDir, op.file);
  if (!fs.existsSync(source)) throw new Error(`missing source: ${source}`);
  const bg = path.join(bgDir, `${op.no}_${op.title}.png`);
  await sharp(Buffer.from(backgroundSvg(op))).png().toFile(bg);
  const out = path.join(outDir, op.file);
  const dur = duration(source);
  const fadeOut = Math.max(0.1, dur - 0.25);
  run(ffmpeg, [
    '-y', '-i', source, '-loop', '1', '-t', dur.toFixed(3), '-i', bg,
    '-filter_complex',
    `[0:v]crop=${UI.w}:${UI.h}:${UI.x}:${UI.y},setsar=1[ui];` +
    `[1:v]scale=${W}:${H},setsar=1[bg];` +
    `[bg][ui]overlay=${UI.x}:${UI.y}:format=auto,fade=t=in:st=0:d=0.16,fade=t=out:st=${fadeOut.toFixed(3)}:d=0.25,fps=${FPS},format=yuv420p,setpts=PTS-STARTPTS[v]`,
    '-map', '[v]', '-an', '-c:v', 'libx264', '-preset', preview ? 'veryfast' : 'slow', '-crf', preview ? '15' : '10',
    '-pix_fmt', 'yuv420p', '-r', String(FPS), '-video_track_timescale', '60000', '-movflags', '+faststart', out,
  ], `rebuild clean operation ${op.no}`);

  if (op.no === '09') await renderTextTitleOverlay(out);
}

console.log(outDir);
