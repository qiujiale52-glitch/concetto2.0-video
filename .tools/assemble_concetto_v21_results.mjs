import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import sharp from './thumbs/node_modules/sharp/dist/index.mjs';

const cwd = process.cwd();
const ffmpeg = path.join(cwd, '.tools/media-bin/node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg');
const ffprobe = path.join(cwd, '.tools/media-bin/node_modules/@ffprobe-installer/darwin-arm64/ffprobe');
const music = path.join(cwd, '04-正版授权音乐库', '未来科技宽广磅礴音乐15437.wav');

const W = 1920;
const H = 1080;
const FPS = 30;
const prevParts = path.join(cwd, '06_预览输出', 'refined_v22_ai_ops_reencoded_parts');
const v16Parts = path.join(cwd, '06_预览输出', 'refined_v16_parts');
const outDir = path.join(cwd, '06_预览输出', 'refined_v22_layoutfix_parts');
const frameDir = path.join(outDir, 'frames');
const output = path.join(cwd, '06_预览输出', 'Concetto_2.0_AI超分操作演示_v22_低清.mp4');
const preview = path.join(cwd, '06_预览输出', 'Concetto_2.0_AI超分操作演示_v22_全片预览.jpg');
const opPreview = path.join(cwd, '06_预览输出', 'Concetto_2.0_AI超分操作演示_v22_操作段预览.jpg');
const logPath = path.join(cwd, '03_脚本与结构', 'Concetto 2.0_v22_仿真底部与标题错位修正说明.md');

const dwgIcon = path.join(cwd, '车库成果', '3f12ee8614e2555109c1036610f5e2ed.png');
const textBase = path.join(prevParts, 'sec_09_text_generation_direct_ai_x4.mp4');

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(frameDir, { recursive: true });

function assertFile(p) {
  if (!fs.existsSync(p)) throw new Error(`missing file: ${p}`);
}

function run(bin, args, label) {
  const r = spawnSync(bin, args, { stdio: 'inherit' });
  if (r.status !== 0) throw new Error(`${label} failed with status ${r.status}`);
}

function runCapture(bin, args, label) {
  const r = spawnSync(bin, args, { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`${label} failed with status ${r.status}: ${r.stderr}`);
  return r.stdout.trim();
}

function probeDur(file) {
  const out = runCapture(ffprobe, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nk=1:nw=1', file], `probe ${file}`);
  return Number.parseFloat(out);
}

function quoteFile(p) {
  return p.replace(/'/g, "'\\''");
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

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function baseDarkSvg(extra = '') {
  return `<?xml version="1.0" encoding="UTF-8"?>
  <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="core" cx="50%" cy="50%" r="72%">
        <stop offset="0%" stop-color="#382886" stop-opacity="0.54"/>
        <stop offset="58%" stop-color="#090713" stop-opacity="0.82"/>
        <stop offset="100%" stop-color="#010104" stop-opacity="1"/>
      </radialGradient>
      <linearGradient id="purpleBlue" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#c559ff"/>
        <stop offset="54%" stop-color="#8d6bff"/>
        <stop offset="100%" stop-color="#4a8bff"/>
      </linearGradient>
      <linearGradient id="softLine" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#806cff" stop-opacity="0"/>
        <stop offset="50%" stop-color="#dad5ff" stop-opacity="0.7"/>
        <stop offset="100%" stop-color="#806cff" stop-opacity="0"/>
      </linearGradient>
      <filter id="glow" x="-80%" y="-80%" width="260%" height="260%">
        <feDropShadow dx="0" dy="0" stdDeviation="16" flood-color="#866cff" flood-opacity="0.62"/>
        <feDropShadow dx="0" dy="10" stdDeviation="32" flood-color="#2c1a80" flood-opacity="0.42"/>
      </filter>
      <filter id="textGlow" x="-35%" y="-60%" width="170%" height="220%">
        <feDropShadow dx="0" dy="0" stdDeviation="5" flood-color="#ffffff" flood-opacity="0.45"/>
        <feDropShadow dx="0" dy="0" stdDeviation="16" flood-color="#7c61ff" flood-opacity="0.62"/>
      </filter>
    </defs>
    <rect width="${W}" height="${H}" fill="#010104"/>
    <rect width="${W}" height="${H}" fill="url(#core)"/>
    <path d="M 104 875 C 590 760, 1238 790, 1818 695" stroke="#7668ff" stroke-opacity="0.22" stroke-width="1.2" fill="none"/>
    <path d="M 260 230 C 760 148, 1260 180, 1720 116" stroke="#ffffff" stroke-opacity="0.055" stroke-width="1" fill="none"/>
    <path d="M 150 948 C 655 840, 1290 868, 1804 745" stroke="url(#softLine)" opacity="0.18" stroke-width="1.8" fill="none"/>
    ${extra}
  </svg>`;
}

async function renderDwgResultClip() {
  const out = path.join(outDir, 'sec_06_dwg_result_v22.mp4');
  const local = path.join(frameDir, 'dwg_result');
  fs.rmSync(local, { recursive: true, force: true });
  fs.mkdirSync(local, { recursive: true });

  const total = 105;
  for (let i = 0; i < total; i++) {
    const t = i / (total - 1);
    const inP = easeOutCubic(t / 0.34);
    const breathe = Math.sin(t * Math.PI * 4) * 0.018;
    const iconScale = 0.98 + 0.14 * inP + breathe;
    const iconW = 220 * iconScale;
    const iconH = 260 * iconScale;
    const iconLeft = Math.round(W / 2 - iconW / 2);
    const iconTop = Math.round(238 - 42 * (1 - inP) + 10 * Math.sin(t * Math.PI * 2));
    const headlineAlpha = clamp01((t - 0.25) / 0.22);
    const smallAlpha = clamp01((t - 0.16) / 0.20);
    const beamX = Math.round(-360 + t * (W + 720));
    const sparkAlpha = clamp01(Math.sin(Math.PI * clamp01((t - 0.05) / 0.65)));
    const bg = baseDarkSvg(`
      <linearGradient id="fileGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#755cff"/>
        <stop offset="58%" stop-color="#9f8cff"/>
        <stop offset="100%" stop-color="#d6ccff"/>
      </linearGradient>
      <linearGradient id="foldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#eee9ff"/>
        <stop offset="100%" stop-color="#b7a8ff"/>
      </linearGradient>
      <rect x="320" y="260" width="1280" height="560" rx="56" fill="#b49bff" opacity="${0.09 + 0.08 * inP}" filter="url(#glow)"/>
      <ellipse cx="960" cy="650" rx="${220 + 120 * inP}" ry="${34 + 10 * inP}" fill="#816dff" opacity="${0.18 * inP}"/>
      <rect x="${beamX}" y="0" width="170" height="1080" fill="#ffffff" opacity="${0.055 * sparkAlpha}" transform="skewX(-18)"/>
      <g transform="translate(${iconLeft} ${iconTop}) scale(${iconScale.toFixed(4)})" filter="url(#glow)" opacity="${inP.toFixed(3)}">
        <path d="M 28 0 L 145 0 L 220 72 L 220 228 C 220 246 207 260 188 260 L 39 260 C 20 260 7 248 5 229 L 0 38 C -1 16 9 3 28 0 Z" fill="url(#fileGrad)"/>
        <path d="M 145 0 L 145 56 C 145 68 153 75 165 75 L 220 72 Z" fill="url(#foldGrad)" opacity="0.95"/>
        <path d="M 145 0 L 145 56 C 145 68 153 75 165 75 L 220 72" fill="none" stroke="#ffffff" stroke-opacity="0.26" stroke-width="2"/>
        <text x="110" y="160" text-anchor="middle" font-family="Avenir Next, Arial" font-size="58" font-weight="900" fill="#ffffff" letter-spacing="1">DWG</text>
        <path d="M 20 230 C 78 256, 157 257, 205 224" fill="none" stroke="#ffffff" stroke-opacity="0.10" stroke-width="3"/>
      </g>
      <text x="960" y="574" text-anchor="middle" font-family="MiSans, PingFang SC, Arial" font-size="35" font-weight="700" fill="#8d78ff" opacity="${smallAlpha.toFixed(3)}" filter="url(#textGlow)">支持导出DWG格式</text>
      <text x="960" y="638" text-anchor="middle" font-family="MiSans, PingFang SC, Arial" font-size="58" font-weight="800" fill="url(#purpleBlue)" opacity="${Math.min(1, headlineAlpha * 1.08).toFixed(3)}" filter="url(#textGlow)">选择心仪的方案在CAD中继续设计</text>
      <text x="112" y="82" font-family="Avenir Next, Arial" font-size="15" letter-spacing="6" fill="#857be8" opacity="0.78">CONCETTO 2.0 / RESULT OUTPUT</text>
      <rect x="112" y="104" width="245" height="1.2" fill="#7668ff" opacity="0.55"/>
    `);
    await sharp(Buffer.from(bg))
      .png()
      .toFile(path.join(local, `frame_${String(i + 1).padStart(4, '0')}.png`));
  }

  run(ffmpeg, [
    '-y',
    '-framerate', String(FPS),
    '-i', path.join(local, 'frame_%04d.png'),
    '-vf', `fade=t=in:st=0:d=0.22,fade=t=out:st=${(total / FPS - 0.35).toFixed(3)}:d=0.35,format=yuv420p`,
    '-an',
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '17',
    '-pix_fmt', 'yuv420p',
    '-r', String(FPS),
    '-movflags', '+faststart',
    out,
  ], 'render dwg result clip');
  return out;
}

async function renderTextTitleOverlayClip() {
  const out = path.join(outDir, 'sec_09_text_generation_with_title_v22.mp4');
  const overlay = path.join(frameDir, 'text_overlay');
  fs.rmSync(overlay, { recursive: true, force: true });
  fs.mkdirSync(overlay, { recursive: true });
  const dur = probeDur(textBase);
  const total = Math.ceil(dur * FPS);

  for (let i = 0; i < total; i++) {
    const t = i / Math.max(1, total - 1);
    const p = easeOutCubic(t / 0.38);
    const shine = easeInOutCubic(clamp01((t - 0.18) / 0.46));
    const x = Math.round(118 - 52 * (1 - p));
    const alpha = clamp01(t / 0.18);
    const lineW = Math.round(320 * easeOutCubic((t - 0.20) / 0.28));
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="txt" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#d060ff"/>
          <stop offset="58%" stop-color="#9270ff"/>
          <stop offset="100%" stop-color="#4b8cff"/>
        </linearGradient>
        <filter id="glow" x="-50%" y="-60%" width="200%" height="220%">
          <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#966eff" flood-opacity="0.60"/>
          <feDropShadow dx="0" dy="0" stdDeviation="22" flood-color="#4b8cff" flood-opacity="0.30"/>
        </filter>
      </defs>
      <rect width="${W}" height="${H}" fill="none"/>
      <rect x="0" y="0" width="670" height="1080" fill="#080710" opacity="${(0.42 * alpha).toFixed(3)}"/>
      <rect x="${x + 4}" y="348" width="84" height="84" rx="20" fill="#8d6bff" opacity="${alpha.toFixed(3)}" filter="url(#glow)"/>
      <path d="M ${x + 32} 377 h25 l18 18 v35 h-43 z" fill="#f7f4ff" opacity="${alpha.toFixed(3)}"/>
      <path d="M ${x + 57} 377 v18 h18" fill="none" stroke="#d8cbff" stroke-width="4" opacity="${alpha.toFixed(3)}"/>
      <path d="M ${x + 40} 411 c16 -18 20 -18 36 0 c-16 18 -20 18 -36 0 z" fill="none" stroke="#8d6bff" stroke-width="4" opacity="${alpha.toFixed(3)}"/>
      <text x="${x}" y="560" font-family="MiSans, PingFang SC, Arial" font-size="40" font-weight="700" fill="url(#txt)" opacity="${alpha.toFixed(3)}" filter="url(#glow)">导入任务书</text>
      <text x="${x}" y="632" font-family="MiSans, PingFang SC, Arial" font-size="58" font-weight="850" fill="url(#txt)" opacity="${alpha.toFixed(3)}" filter="url(#glow)">一键输出PPT</text>
      <rect x="${x}" y="662" width="${lineW}" height="7" rx="4" fill="url(#txt)" opacity="${(0.82 * alpha).toFixed(3)}"/>
      <rect x="${Math.round(x + 40 + shine * 255)}" y="520" width="90" height="170" fill="#ffffff" opacity="${(0.13 * alpha).toFixed(3)}" transform="skewX(-18)"/>
    </svg>`;
    await sharp(Buffer.from(svg)).png().toFile(path.join(overlay, `frame_${String(i + 1).padStart(4, '0')}.png`));
  }

  run(ffmpeg, [
    '-y',
    '-i', textBase,
    '-framerate', String(FPS),
    '-i', path.join(overlay, 'frame_%04d.png'),
    '-filter_complex', `[0:v]scale=${W}:${H},setsar=1[base];[1:v]format=rgba[ov];[base][ov]overlay=0:0:format=auto,fade=t=in:st=0:d=0.15,fade=t=out:st=${Math.max(0.1, dur - 0.25).toFixed(3)}:d=0.25,fps=${FPS},format=yuv420p[v]`,
    '-map', '[v]',
    '-an',
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '17',
    '-pix_fmt', 'yuv420p',
    '-r', String(FPS),
    '-movflags', '+faststart',
    out,
  ], 'render text generation title overlay');
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
  for (const p of [ffmpeg, ffprobe, music, dwgIcon, textBase, path.join(prevParts, 'concat_list_v22.txt')]) assertFile(p);

  const dwgClip = await renderDwgResultClip();
  const textClip = await renderTextTitleOverlayClip();

  const baseParts = readConcatList(path.join(prevParts, 'concat_list_v22.txt'));
  const parts = [];
  for (const p of baseParts) {
    if (path.basename(p) === 'sec_09_text_generation_direct_ai_x4.mp4') {
      parts.push(textClip);
      continue;
    }
    parts.push(p);
    if (path.basename(p) === 'sec_06_operation_ai_x4.mp4') {
      parts.push(dwgClip);
    }
  }

  const list = path.join(outDir, 'concat_list_v22.txt');
  fs.writeFileSync(list, parts.map((p) => `file '${quoteFile(p)}'`).join('\n') + '\n');

  const videoOnly = path.join(outDir, 'video_concat_v22_reencoded.mp4');
  run(ffmpeg, [
    '-y',
    '-f', 'concat',
    '-safe', '0',
    '-i', list,
    '-vf', `scale=${W}:${H}:force_original_aspect_ratio=decrease:flags=lanczos,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:color=black,fps=${FPS},format=yuv420p,setpts=PTS-STARTPTS`,
    '-an',
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '17',
    '-pix_fmt', 'yuv420p',
    '-r', String(FPS),
    '-movflags', '+faststart',
    videoOnly,
  ], 'concat v22 full reencode');
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
  ], 'mux v22 music');

  run(ffmpeg, ['-y', '-i', output, '-vf', 'fps=0.24,scale=360:-1,tile=10x7', '-frames:v', '1', preview], 'preview v22');
  run(ffmpeg, ['-y', '-ss', '00:01:10', '-i', output, '-t', '00:01:20', '-vf', 'fps=1,scale=480:-1,tile=10x7', '-frames:v', '1', opPreview], 'operation preview v22');

  fs.writeFileSync(logPath, [
    '# Concetto 2.0 v22 调整说明',
    '',
    '- 基于 v20 稳定封装版本继续制作；',
    '- 在“总图排布/车库生成”操作演示后新增 DWG 成果展示段：支持导出 DWG 格式，选择方案后可进入 CAD 继续设计；',
    '- 替换第九环节文本生成展示段：保留 PPT 成果飞散素材，并加入左侧“导入任务书 / 一键输出PPT”文字动效；',
    '- 最终仍统一重编码为 1920×1080、30fps、H.264、yuv420p，并写入 faststart。',
    '- v22 修正：操作演示顶部编号与主标题整体右移，避免与左侧英文标题重叠；',
    '- v22 修正：AI 仿真分析段单独调整操作演示取景，保留底部“视野 / 人行流线 / 碳排放”一行文字。',
    '',
    `输出视频：\`${output}\``,
    `车库成果段：\`${dwgClip}\``,
    `文本生成展示段：\`${textClip}\``,
    `预览图：\`${opPreview}\``,
    '',
  ].join('\n'));

  console.log(`DONE ${output}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
