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
const srcList = path.join(cwd, '06_预览输出', 'refined_v27_workflow_pathpolish_parts', 'concat_list_v27.txt');
const outDir = path.join(cwd, '06_预览输出', 'refined_v28_update_fx_parts');
const frameDir = path.join(outDir, 'frames_update_content_v28');
const updateDir = path.join(cwd, '更新内容');
const output = path.join(cwd, '06_预览输出', 'Concetto_2.0_AI超分操作演示_v28_六大模块描边精修_低清.mp4');
const preview = path.join(cwd, '06_预览输出', 'Concetto_2.0_AI超分操作演示_v28_六大模块描边精修_全片预览.jpg');
const introPreview = path.join(cwd, '06_预览输出', 'Concetto_2.0_AI超分操作演示_v28_前置段预览.jpg');
const updatePreview = path.join(cwd, '06_预览输出', 'Concetto_2.0_AI超分操作演示_v28_六大模块段预览.jpg');
const logPath = path.join(cwd, '03_脚本与结构', 'Concetto 2.0_v28_六大模块描边精修说明.md');

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
  const n = Number.parseFloat(out);
  return Number.isFinite(n) ? n : 0;
}

function quoteFile(p) {
  return p.replace(/'/g, "'\\''");
}

function readConcatList(file) {
  return fs.readFileSync(file, 'utf8')
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^file\s+'/, '').replace(/'$/, '').replace(/'\\''/g, "'"));
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

function updateImages() {
  if (!fs.existsSync(updateDir)) return [];
  return fs.readdirSync(updateDir)
    .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
    .sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'))
    .map((f) => path.join(updateDir, f));
}

function svgDefs() {
  return `
  <defs>
    <radialGradient id="core" cx="50%" cy="54%" r="70%">
      <stop offset="0%" stop-color="#4935a0" stop-opacity="0.48"/>
      <stop offset="52%" stop-color="#080612" stop-opacity="0.82"/>
      <stop offset="100%" stop-color="#010104" stop-opacity="1"/>
    </radialGradient>
    <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#7668ff" stop-opacity="0"/>
      <stop offset="48%" stop-color="#eeeaff" stop-opacity="0.82"/>
      <stop offset="100%" stop-color="#4fa6ff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#7462ff" stop-opacity="0.1"/>
      <stop offset="36%" stop-color="#9b85ff" stop-opacity="0.75"/>
      <stop offset="54%" stop-color="#ffffff" stop-opacity="1"/>
      <stop offset="76%" stop-color="#75e2ff" stop-opacity="0.72"/>
      <stop offset="100%" stop-color="#6251f2" stop-opacity="0.08"/>
    </linearGradient>
    <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#c66bff"/>
      <stop offset="52%" stop-color="#8b73ff"/>
      <stop offset="100%" stop-color="#48a9ff"/>
    </linearGradient>
    <filter id="glow" x="-70%" y="-70%" width="240%" height="240%">
      <feDropShadow dx="0" dy="0" stdDeviation="13" flood-color="#8b76ff" flood-opacity="0.58"/>
      <feDropShadow dx="0" dy="8" stdDeviation="28" flood-color="#23166f" flood-opacity="0.42"/>
    </filter>
    <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="0" stdDeviation="7" flood-color="#ffffff" flood-opacity="0.35"/>
      <feDropShadow dx="0" dy="0" stdDeviation="18" flood-color="#806cff" flood-opacity="0.48"/>
    </filter>
    <filter id="pinGlow" x="-90%" y="-90%" width="280%" height="280%">
      <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="#ffffff" flood-opacity="0.86"/>
      <feDropShadow dx="0" dy="0" stdDeviation="11" flood-color="#8c7cff" flood-opacity="0.68"/>
      <feDropShadow dx="0" dy="0" stdDeviation="22" flood-color="#52d8ff" flood-opacity="0.22"/>
    </filter>
  </defs>`;
}

function updateCardRects(imgX, imgY, imgW, imgH, meta) {
  const sx = imgW / meta.width;
  const sy = imgH / meta.height;
  // Based on the provided 1680×945 update-content page. Kept slightly inset so the glow traces the original card borders.
  const rects = [
    { x: 116, y: 220, w: 490, h: 318 },
    { x: 636, y: 220, w: 448, h: 318 },
    { x: 1108, y: 220, w: 456, h: 318 },
    { x: 116, y: 568, w: 470, h: 288 },
    { x: 616, y: 568, w: 468, h: 288 },
    { x: 1108, y: 508, w: 456, h: 348 },
  ];
  return rects.map((r) => ({
    x: imgX + r.x * sx,
    y: imgY + r.y * sy,
    w: r.w * sx,
    h: r.h * sy,
  }));
}

function roundedRectPath(r, rad = 24) {
  const x = r.x;
  const y = r.y;
  const w = r.w;
  const h = r.h;
  const rr = Math.min(rad, w / 2, h / 2);
  return [
    `M ${x + rr} ${y}`,
    `H ${x + w - rr}`,
    `Q ${x + w} ${y} ${x + w} ${y + rr}`,
    `V ${y + h - rr}`,
    `Q ${x + w} ${y + h} ${x + w - rr} ${y + h}`,
    `H ${x + rr}`,
    `Q ${x} ${y + h} ${x} ${y + h - rr}`,
    `V ${y + rr}`,
    `Q ${x} ${y} ${x + rr} ${y}`,
    'Z',
  ].join(' ');
}

function easeInOut(t) {
  t = clamp(t);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function renderUpdateSvg(t, dur, imgFile, meta) {
  const p = easeOut(t / 1.05);
  const a = smooth(0.04, 0.55, t) * (1 - smooth(dur - 0.48, dur, t));
  const imgUri = dataUri(imgFile);
  const imgW = 1680 * (0.982 + 0.018 * p);
  const imgH = imgW * meta.height / meta.width;
  const imgX = (W - imgW) / 2;
  const imgY = (H - imgH) / 2 + 14 - 9 * p;
  const scanX = -620 + (W + 1240) * (t / dur);
  const cards = updateCardRects(imgX, imgY, imgW, imgH, meta);
  const moduleStart = 0.78;
  const moduleGap = 0.42;
  const moduleDur = 1.34;
  const cardEffects = cards.map((r, i) => {
    const start = moduleStart + i * moduleGap;
    const k = smooth(start, start + 0.46, t);
    const hold = 1 - smooth(dur - 0.85, dur - 0.2, t);
    const pulse = 0.52 + 0.48 * Math.sin(t * 3.1 + i * 1.18);
    const breath = 0.62 + 0.38 * Math.sin(t * 2.2 + i * 0.64);
    const local = easeInOut((t - start) / moduleDur);
    const draw = Math.min(1000, local * 1000);
    const headStart = Math.max(0, draw - 165);
    const headLen = Math.min(210, draw);
    const sweepLocal = (t - (start + 0.18)) / 2.15;
    const sweepA = smooth(0, 0.26, sweepLocal) * (1 - smooth(0.64, 1.0, sweepLocal));
    const sweep = r.x - r.w * 0.48 + r.w * 1.92 * clamp(sweepLocal);
    const alpha = a * k * hold;
    const d = roundedRectPath(r, 26);
    const cornerDots = [
      [r.x + r.w * 0.06, r.y + r.h * 0.06],
      [r.x + r.w * 0.94, r.y + r.h * 0.06],
      [r.x + r.w * 0.94, r.y + r.h * 0.94],
      [r.x + r.w * 0.06, r.y + r.h * 0.94],
    ].map(([x, y], j) => {
      const hit = smooth(start + 0.12 + j * 0.10, start + 0.24 + j * 0.10, t) * (1 - smooth(start + 0.58 + j * 0.08, start + 0.98 + j * 0.08, t));
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(2.6 + hit * 6 + breath * 1.2).toFixed(1)}" fill="#ffffff" opacity="${(0.12 + hit * 0.60 + breath * 0.10).toFixed(3)}" filter="url(#pinGlow)"/>`;
    }).join('');
    return `<g opacity="${alpha.toFixed(3)}">
      <path d="${d}" pathLength="1000" fill="none" stroke="#6d5cff" stroke-width="5.4" stroke-linecap="round" stroke-linejoin="round" stroke-opacity="${(0.055 + 0.045 * breath).toFixed(3)}" filter="url(#glow)"/>
      <path d="${d}" pathLength="1000" fill="none" stroke="#ffffff" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="8 16" stroke-dashoffset="${(-(t * 28 + i * 48)).toFixed(1)}" stroke-opacity="${(0.07 + 0.04 * pulse).toFixed(3)}"/>
      <path d="${d}" pathLength="1000" fill="none" stroke="#927fff" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${draw.toFixed(1)} 1000" stroke-opacity="${(0.13 + 0.08 * breath).toFixed(3)}" filter="url(#glow)"/>
      <path d="${d}" pathLength="1000" fill="none" stroke="url(#edgeGrad)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${draw.toFixed(1)} 1000" stroke-opacity="${(0.54 + 0.25 * breath).toFixed(3)}" filter="url(#pinGlow)"/>
      <path d="${d}" pathLength="1000" fill="none" stroke="#ffffff" stroke-width="2.0" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${headLen.toFixed(1)} 1000" stroke-dashoffset="${(-headStart).toFixed(1)}" stroke-opacity="${(0.72 + 0.22 * pulse).toFixed(3)}" filter="url(#pinGlow)"/>
      <rect x="${sweep.toFixed(1)}" y="${(r.y - 34).toFixed(1)}" width="${(r.w * (0.16 + 0.05 * breath)).toFixed(1)}" height="${(r.h + 68).toFixed(1)}" transform="skewX(-17)" fill="url(#lineGrad)" opacity="${(0.22 * sweepA * (0.72 + 0.28 * breath)).toFixed(3)}"/>
      <rect x="${(r.x + r.w * 0.03).toFixed(1)}" y="${(r.y + r.h * 0.03).toFixed(1)}" width="${(r.w * 0.94).toFixed(1)}" height="${(r.h * 0.94).toFixed(1)}" rx="21" fill="none" stroke="#79dfff" stroke-width="1.0" stroke-dasharray="${(70 + 40 * breath).toFixed(1)} 520" stroke-dashoffset="${(-(t * 52 + i * 60)).toFixed(1)}" stroke-opacity="${(0.07 + 0.07 * breath).toFixed(3)}" filter="url(#softGlow)"/>
      <circle cx="${(r.x + r.w * 0.14).toFixed(1)}" cy="${(r.y + r.h * 0.30).toFixed(1)}" r="${(24 + 9 * pulse).toFixed(1)}" fill="#ffffff" opacity="${(0.09 + 0.09 * pulse).toFixed(3)}" filter="url(#softGlow)"/>
      ${cornerDots}
    </g>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
  <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    ${svgDefs()}
    <rect width="${W}" height="${H}" fill="#010104"/>
    <rect width="${W}" height="${H}" fill="url(#core)" opacity="${(0.92 * a).toFixed(3)}"/>
    <path d="M 104 852 C 590 750, 1220 778, 1818 684" stroke="#7668ff" stroke-opacity="${(0.18 * a).toFixed(3)}" stroke-width="1.3" fill="none"/>
    <path d="M 230 218 C 710 146, 1240 174, 1708 106" stroke="#ffffff" stroke-opacity="${(0.055 * a).toFixed(3)}" stroke-width="1" fill="none"/>
    <rect x="${scanX.toFixed(1)}" y="-80" width="620" height="1240" transform="skewX(-18)" fill="url(#lineGrad)" opacity="${(0.075 * a * (0.74 + 0.26 * Math.sin(t * 2.0))).toFixed(3)}"/>
    <text x="112" y="118" font-family="Avenir Next, Arial" font-size="16" letter-spacing="7" fill="#857be8" opacity="${(0.72 * a).toFixed(3)}">CONCETTO 2.0 / UPDATE CONTENTS</text>
    <rect x="112" y="140" width="${(288 * a).toFixed(1)}" height="1.2" fill="#7668ff" opacity="0.55"/>
    <g opacity="${a.toFixed(3)}" filter="url(#glow)">
      <rect x="${(imgX - 22).toFixed(1)}" y="${(imgY - 22).toFixed(1)}" width="${(imgW + 44).toFixed(1)}" height="${(imgH + 44).toFixed(1)}" rx="42" fill="#151039" opacity="0.78" stroke="#8d7cff" stroke-opacity="0.24"/>
      <image href="${imgUri}" x="${imgX.toFixed(1)}" y="${imgY.toFixed(1)}" width="${imgW.toFixed(1)}" height="${imgH.toFixed(1)}" preserveAspectRatio="xMidYMid meet"/>
    </g>
    ${cardEffects}
    <rect x="${(imgX + imgW * 0.04).toFixed(1)}" y="${(imgY + imgH * 0.155).toFixed(1)}" width="${(imgW * 0.92).toFixed(1)}" height="2.2" fill="url(#lineGrad)" opacity="${(0.34 * smooth(0.72, 1.72, t) * a).toFixed(3)}" filter="url(#glow)"/>
  </svg>`;
}

async function renderUpdateClip() {
  const imgs = updateImages();
  if (imgs.length === 0) throw new Error(`更新内容文件夹没有可用图片：${updateDir}`);
  const img = imgs[0];
  const meta = await sharp(img).metadata();
  const dur = 7.2;
  const count = Math.round(dur * FPS);
  fs.rmSync(frameDir, { recursive: true, force: true });
  fs.mkdirSync(frameDir, { recursive: true });
  for (let i = 0; i < count; i++) {
    const t = i / FPS;
    const out = path.join(frameDir, `frame_${String(i).padStart(4, '0')}.png`);
    await sharp(Buffer.from(renderUpdateSvg(t, dur, img, meta))).png().toFile(out);
  }
  const out = path.join(outDir, 'intro_update_contents_v28_card_edge_fx.mp4');
  run(ffmpeg, [
    '-y',
    '-framerate', String(FPS),
    '-i', path.join(frameDir, 'frame_%04d.png'),
    '-vf', `fade=t=in:st=0:d=0.18,fade=t=out:st=${(dur - 0.32).toFixed(2)}:d=0.32,format=yuv420p`,
    '-an',
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '20',
    '-pix_fmt', 'yuv420p',
    '-r', String(FPS),
    '-movflags', '+faststart',
    out,
  ], 'render update contents v28');
  return out;
}

async function main() {
  for (const p of [ffmpeg, ffprobe, music, srcList]) assertFile(p);
  const updateClip = await renderUpdateClip();
  const baseParts = readConcatList(srcList);
  const parts = [];
  let inserted = false;
  for (const p of baseParts) {
    if (path.basename(p) === 'intro_update_contents_v24.mp4') {
      parts.push(updateClip);
      inserted = true;
    } else {
      parts.push(p);
    }
  }
  if (!inserted) throw new Error('未找到 intro_update_contents_v24.mp4，无法替换更新内容段');

  const list = path.join(outDir, 'concat_list_v28.txt');
  fs.writeFileSync(list, parts.map((p) => `file '${quoteFile(p)}'`).join('\n') + '\n');

  const videoOnly = path.join(outDir, 'video_concat_v28_reencoded.mp4');
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
  ], 'concat v28 full reencode');
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
  ], 'mux v28 music');

  run(ffmpeg, ['-y', '-i', output, '-vf', 'fps=0.24,scale=360:-1,tile=10x7', '-frames:v', '1', preview], 'preview v28');
  run(ffmpeg, ['-y', '-ss', '00:00:00', '-i', output, '-t', '00:00:45', '-vf', 'fps=1,scale=480:-1,tile=10x5', '-frames:v', '1', introPreview], 'intro preview v28');
  run(ffmpeg, ['-y', '-i', updateClip, '-vf', 'fps=1,scale=480:-1,tile=8x1', '-frames:v', '1', updatePreview], 'update preview v28');

  fs.writeFileSync(logPath, [
    '# Concetto 2.0 v28 六大模块描边精修',
    '',
    '- 基于 v27 成片继续制作，仅替换“更新内容 / 六大模块”片段；',
    '- 更新内容素材来自项目文件夹 `更新内容`，保留原图片内字体和页面布局；',
    '- 六个模块按 01→06 顺序单独描边，使用底层虚线、发光边线、头部高光、角点脉冲和卡片呼吸描边；',
    '- 原有斜杠扫光保留，但改为随卡片节奏呼吸，降低生硬感；',
    '- v27 九大环节路径精修光效与后续操作演示保持不变。',
    '',
    `新增片段：\`${updateClip}\``,
    `输出视频：\`${output}\``,
    `前置段预览：\`${introPreview}\``,
    `六大模块段预览：\`${updatePreview}\``,
    '',
  ].join('\n'));

  console.log(`DONE ${output}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
