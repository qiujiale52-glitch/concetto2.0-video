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
const outDir = path.join(cwd, '06_预览输出', 'operation_scale_trial');
fs.mkdirSync(outDir, { recursive: true });

function run(args, label) {
  const r = spawnSync(ffmpeg, args, { stdio: 'inherit' });
  if (r.status !== 0) throw new Error(`${label} failed`);
}

function probeDur(file) {
  const r = spawnSync(ffprobe, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nk=1:nw=1', file], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`ffprobe failed: ${file}`);
  return Number(r.stdout.trim());
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[m]));
}

function defs() {
  return `<defs>
    <radialGradient id="core" cx="50%" cy="44%" r="70%">
      <stop offset="0%" stop-color="#26215f" stop-opacity="0.62"/>
      <stop offset="58%" stop-color="#080617" stop-opacity="0.84"/>
      <stop offset="100%" stop-color="#010104" stop-opacity="1"/>
    </radialGradient>
    <filter id="panelGlow" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="10" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#5b73ff" stop-opacity="0"/>
      <stop offset="52%" stop-color="#bda4ff" stop-opacity="0.88"/>
      <stop offset="100%" stop-color="#5b73ff" stop-opacity="0"/>
    </linearGradient>
  </defs>`;
}

function bgSvg(section) {
  const panel = { x: 62, y: 92, w: 1796, h: 978 };
  const screen = { x: 88, y: 122, w: 1744, h: 900 };
  return `<?xml version="1.0" encoding="UTF-8"?>
  <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    ${defs()}
    <rect width="${W}" height="${H}" fill="#010104"/>
    <rect width="${W}" height="${H}" fill="url(#core)" opacity="0.84"/>
    <path d="M 105 870 C 565 770, 1220 790, 1815 700" stroke="#7668ff" stroke-opacity="0.20" stroke-width="1.2" fill="none"/>
    <path d="M 290 185 C 780 135, 1240 150, 1660 95" stroke="#ffffff" stroke-opacity="0.055" stroke-width="1" fill="none"/>
    <rect x="${panel.x}" y="${panel.y}" width="${panel.w}" height="${panel.h}" rx="34" fill="#12102a" opacity="0.72" filter="url(#panelGlow)"/>
    <rect x="${panel.x}" y="${panel.y}" width="${panel.w}" height="${panel.h}" rx="34" fill="none" stroke="#8375ff" stroke-opacity="0.42" stroke-width="1.4"/>
    <rect x="${screen.x}" y="${screen.y}" width="${screen.w}" height="${screen.h}" rx="24" fill="#080714" opacity="0.52"/>
    <text x="112" y="82" font-family="Avenir Next, Arial" font-size="15" letter-spacing="6" fill="#857be8" opacity="0.78">CONCETTO 2.0 / WORKFLOW DEMO</text>
    <rect x="112" y="105" width="245" height="1.2" fill="#7668ff" opacity="0.55"/>
    <text x="1748" y="82" text-anchor="end" font-family="Avenir Next, Arial" font-size="18" letter-spacing="4" fill="#8f84dc" opacity="0.78">${section.no} / ${esc(section.title).toUpperCase()}</text>
    <text x="548" y="84" font-family="MiSans, PingFang SC, Arial" font-size="24" fill="#8f84dc" opacity="0.82">${section.no}</text>
    <text x="592" y="85" font-family="MiSans, PingFang SC, Arial" font-size="34" font-weight="700" fill="#f3f0ff">${esc(section.title)}</text>
    <text x="800" y="84" font-family="MiSans, PingFang SC, Arial" font-size="20" fill="#aaa2df" opacity="0.92">${esc(section.feature)}</text>
  </svg>`;
}

async function renderBg(section) {
  const out = path.join(outDir, `bg_${section.no}.png`);
  await sharp(Buffer.from(bgSvg(section))).png().toFile(out);
  return out;
}

const sections = [
  {
    no: '02',
    title: '场地定位',
    feature: '快速建立场地认知基础',
    clip: path.join(cwd, '手动保存素材/场地定位/场地定位-1.mov'),
  },
  {
    no: '04',
    title: '数智建模',
    feature: '参数化驱动高效生成，提升建模速度精度',
    clip: path.join(cwd, '手动保存素材/数智建模/数智建模-1.mov'),
  },
  {
    no: '08',
    title: 'AI成本估算',
    feature: '项目数据训练，估算误差可控',
    clip: path.join(cwd, '手动保存素材/ai成本估算/ai成本估算-1.mov'),
  },
];

async function renderTrial(section) {
  const bg = await renderBg(section);
  const out = path.join(outDir, `trial_${section.no}_${section.title}.mp4`);
  const dur = Math.min(probeDur(section.clip), 5.2);
  const filter = [
    `[0:v]setpts=PTS-STARTPTS,crop=1480:740:220:170,scale=1744:900:force_original_aspect_ratio=decrease:flags=lanczos,pad=1744:900:(ow-iw)/2:(oh-ih)/2:color=0x080714,unsharp=5:5:0.70:3:3:0.32,eq=contrast=1.04:saturation=1.02,setsar=1,fps=${fps}[vid]`,
    `[1:v]scale=${W}:${H},setsar=1[bg]`,
    `[bg][vid]overlay=x=88:y=122:format=auto[v0]`,
    `[v0]drawbox=x=88:y=122:w=1744:h=900:color=0x8d7cff@0.22:t=2,fade=t=in:st=0:d=0.18,fade=t=out:st=${Math.max(0.1, dur - 0.25)}:d=0.25[v]`,
  ].join(';');
  run([
    '-y',
    '-i', section.clip,
    '-loop', '1',
    '-t', String(dur),
    '-i', bg,
    '-filter_complex', filter,
    '-map', '[v]',
    '-an',
    '-c:v', 'libx264',
    '-preset', 'slow',
    '-crf', '16',
    '-pix_fmt', 'yuv420p',
    '-r', String(fps),
    out,
  ], `trial ${section.no}`);
  return out;
}

const clips = [];
for (const s of sections) clips.push(await renderTrial(s));

const list = path.join(outDir, 'concat_trial.txt');
fs.writeFileSync(list, clips.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join('\n') + '\n');
const trialVideo = path.join(cwd, '06_预览输出', '操作演示放大清晰化_三段试验.mp4');
run(['-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', trialVideo], 'concat trial');

const preview = path.join(cwd, '06_预览输出', '操作演示放大清晰化_三段试验_预览.jpg');
run(['-y', '-i', trialVideo, '-vf', 'fps=1,scale=480:-1,tile=6x3', '-frames:v', '1', preview], 'trial preview');

const compare = path.join(cwd, '06_预览输出', '操作演示放大清晰化_场地定位对比.jpg');
run([
  '-y',
  '-ss', '2',
  '-i', path.join(cwd, '06_预览输出/refined_v16_parts/sec_02_operation.mp4'),
  '-ss', '2',
  '-i', clips[0],
  '-filter_complex',
  '[0:v]scale=960:540[left];[1:v]scale=960:540[right];[left][right]hstack=inputs=2[v]',
  '-map', '[v]',
  '-frames:v', '1',
  compare,
], 'compare 02');

console.log(trialVideo);
console.log(preview);
console.log(compare);
