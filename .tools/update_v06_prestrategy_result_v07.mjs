import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import sharp from './thumbs/node_modules/sharp/dist/index.mjs';

const cwd = process.cwd();
const ffmpeg = path.join(cwd, '.tools/media-bin/node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg');
const ffprobe = path.join(cwd, '.tools/media-bin/node_modules/@ffprobe-installer/darwin-arm64/ffprobe');
const partDir = path.join(cwd, '06_预览输出', 'original_rhythm_v06_parts');
const frameDir = path.join(partDir, 'sec_01_result_materials_frames_v07');
fs.mkdirSync(frameDir, { recursive: true });

const W = 1920;
const H = 1080;
const fps = 30;
const dur = 4.4;
const frames = Math.round(dur * fps);
const local = (p) => path.join(cwd, 'CC 2.0宣发/Resources/local', p);

const outPart = path.join(partDir, 'sec_01_result_materials_v07.mp4');
const oldPart = path.join(partDir, 'sec_01_card_02.mp4');
const oldList = path.join(partDir, 'concat_list.txt');
const newList = path.join(partDir, 'concat_list_v07_prestrategy.txt');
const videoOnly = path.join(partDir, 'video_concat_v07_prestrategy.mp4');
const music = path.join(cwd, '04-正版授权音乐库', '未来科技宽广磅礴音乐15437.wav');
const output = path.join(cwd, '06_预览输出', 'Concetto_2.0_前策成果页调整_v07_低清.mp4');
const preview = path.join(cwd, '06_预览输出', 'Concetto_2.0_前策成果页调整_v07_全片预览.jpg');
const localPreview = path.join(cwd, '06_预览输出', 'Concetto_2.0_前策成果页调整_v07_前策段预览.jpg');
const logPath = path.join(cwd, '03_脚本与结构', 'Concetto 2.0_前策成果页调整_v07_说明.md');

const pages = [
  { file: '64d0dee3e9c55ced6944f09745a1c588.JPG', x: 560, y: 224, w: 395, rot: -3, sx: -640, sy: 80, delay: 0.05 },
  { file: '49a54be3b5ab4a06249e28a0197aadd5.JPG', x: 930, y: 154, w: 405, rot: 2, sx: 930, sy: -330, delay: 0.16 },
  { file: 'bf16040dd441cb8be0611841e665c695.JPG', x: 1210, y: 284, w: 395, rot: -1, sx: 2080, sy: 140, delay: 0.26 },
  { file: 'b8b0886e8f5c3e984870cf807731b362.JPG', x: 710, y: 420, w: 430, rot: 1.5, sx: 420, sy: 1120, delay: 0.38 },
  { file: '68449ba9fc25e7c325644c583f058936.JPG', x: 1108, y: 520, w: 390, rot: 4, sx: 2020, sy: 930, delay: 0.50 },
  { file: 'c8d720db5e5c35e2dd9bdb47b3d59dab.JPG', x: 508, y: 640, w: 386, rot: 2.5, sx: -450, sy: 980, delay: 0.62 },
  { file: 'd3a4418a9dd6f5132f02a113f078035a.JPG', x: 825, y: 690, w: 342, rot: -5, sx: 800, sy: 1250, delay: 0.72 },
  { file: '3d40652776ef7563210f0a14a946c564.JPG', x: 1290, y: 705, w: 370, rot: -2.2, sx: 2100, sy: 1140, delay: 0.82 },
  { file: 'f94181d8a428b0dda5eb7af4b6af60eb.JPG', x: 1130, y: 780, w: 360, rot: 2.8, sx: 1580, sy: 1260, delay: 0.92 },
];

function run(args, label) {
  const r = spawnSync(ffmpeg, args, { stdio: 'inherit' });
  if (r.status !== 0) throw new Error(`${label} failed with ${r.status}`);
}

function probeDur(file) {
  const r = spawnSync(ffprobe, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nk=1:nw=1', file], { encoding: 'utf8' });
  const n = Number.parseFloat(r.stdout.trim());
  return Number.isFinite(n) ? n : 0;
}

function dataUri(file) {
  const ext = path.extname(file).toLowerCase();
  const mime = ext === '.jpg' || ext === '.jpeg' || ext === '.JPG' ? 'image/jpeg' : 'image/png';
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

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const pageUris = pages.map((p) => dataUri(local(p.file)));

function svgFrame(t) {
  const globalIn = smooth(0, 0.35, t);
  const globalOut = 1 - smooth(dur - 0.48, dur, t);
  const pageA = globalIn * globalOut;
  const light = smooth(0.9, 2.2, t) * globalOut;
  const textIn = smooth(0.45, 1.2, t) * globalOut;
  const gather = smooth(3.3, 4.15, t);
  const beamX = 1440 + 210 * gather;
  const beamA = smooth(3.45, 4.15, t);

  const pageGroups = pages.map((p, i) => {
    const inT = easeOut(smooth(p.delay, p.delay + 0.9, t));
    const outPull = gather;
    const targetX = p.x;
    const targetY = p.y;
    const x = p.sx + (targetX - p.sx) * inT + (beamX - targetX) * outPull * 0.35;
    const y = p.sy + (targetY - p.sy) * inT + (540 - targetY) * outPull * 0.22;
    const scale = (0.78 + 0.22 * inT) * (1 - 0.22 * outPull);
    const rot = p.rot * inT + (i % 2 ? 6 : -6) * outPull;
    const opacity = pageA * inT * (1 - 0.38 * gather);
    return `
      <g transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${rot.toFixed(3)}) scale(${scale.toFixed(4)})" opacity="${opacity.toFixed(3)}">
        <rect x="-10" y="-10" width="${p.w + 20}" height="${p.w * 0.5625 + 20}" rx="10" fill="#7e70ff" opacity="0.18" filter="url(#cardGlow)"/>
        <rect x="-6" y="-6" width="${p.w + 12}" height="${p.w * 0.5625 + 12}" rx="8" fill="#ffffff" opacity="0.96"/>
        <image href="${pageUris[i]}" x="0" y="0" width="${p.w}" height="${p.w * 0.5625}" preserveAspectRatio="xMidYMid slice"/>
      </g>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
  <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="bg" cx="50%" cy="54%" r="72%">
        <stop offset="0%" stop-color="#2d216d" stop-opacity="0.48"/>
        <stop offset="48%" stop-color="#0b0820" stop-opacity="0.70"/>
        <stop offset="100%" stop-color="#010104" stop-opacity="1"/>
      </radialGradient>
      <linearGradient id="titleGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#b75cff"/>
        <stop offset="55%" stop-color="#7b69ff"/>
        <stop offset="100%" stop-color="#56b9ff"/>
      </linearGradient>
      <linearGradient id="beam" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#7567ff" stop-opacity="0"/>
        <stop offset="58%" stop-color="#ffffff" stop-opacity="0.95"/>
        <stop offset="100%" stop-color="#8f7cff" stop-opacity="0"/>
      </linearGradient>
      <filter id="blur30"><feGaussianBlur stdDeviation="30"/></filter>
      <filter id="blur12"><feGaussianBlur stdDeviation="12"/></filter>
      <filter id="cardGlow" x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#000000" flood-opacity="0.45"/>
        <feDropShadow dx="0" dy="0" stdDeviation="12" flood-color="#8373ff" flood-opacity="0.36"/>
      </filter>
    </defs>
    <rect width="${W}" height="${H}" fill="#010104"/>
    <rect width="${W}" height="${H}" fill="url(#bg)" opacity="${(0.92 * pageA).toFixed(3)}"/>
    <path d="M 160 850 C 530 710, 1180 720, 1780 610" fill="none" stroke="#7668ff" stroke-opacity="${(0.18 * pageA).toFixed(3)}" stroke-width="1.2"/>
    <path d="M 220 300 C 720 230, 1260 270, 1700 210" fill="none" stroke="#ffffff" stroke-opacity="${(0.055 * pageA).toFixed(3)}" stroke-width="1"/>

    <g opacity="${textIn.toFixed(3)}">
      <text x="142" y="384" font-family="PingFang SC, Hiragino Sans GB, Arial" font-size="61" font-weight="750" fill="url(#titleGrad)" filter="url(#blur12)" opacity="0.32">${esc('结合场地数据')}</text>
      <text x="142" y="452" font-family="PingFang SC, Hiragino Sans GB, Arial" font-size="61" font-weight="750" fill="url(#titleGrad)" filter="url(#blur12)" opacity="0.32">${esc('整合输出PPT')}</text>
      <text x="142" y="384" font-family="PingFang SC, Hiragino Sans GB, Arial" font-size="61" font-weight="750" fill="url(#titleGrad)">${esc('结合场地数据')}</text>
      <text x="142" y="452" font-family="PingFang SC, Hiragino Sans GB, Arial" font-size="61" font-weight="750" fill="url(#titleGrad)">${esc('整合输出PPT')}</text>
      <text x="146" y="512" font-family="Avenir Next, Arial" font-size="18" letter-spacing="6" fill="#9f94ea" opacity="0.76">RESULT OUTPUT / PRE-DESIGN ANALYSIS</text>
    </g>

    <g opacity="${(0.45 * light).toFixed(3)}">
      <ellipse cx="1120" cy="530" rx="610" ry="290" fill="#6d5cff" filter="url(#blur30)" opacity="0.16"/>
    </g>

    ${pageGroups}

    <g opacity="${(0.86 * beamA).toFixed(3)}" transform="translate(${(1220 + 120 * gather).toFixed(1)} 505) rotate(-4)">
      <rect x="0" y="-14" width="520" height="28" fill="url(#beam)" filter="url(#blur12)" opacity="0.78"/>
      <rect x="120" y="-1" width="340" height="2" fill="#ffffff" opacity="0.75"/>
    </g>

    <text x="105" y="82" font-family="Avenir Next, Arial" font-size="17" letter-spacing="7" fill="#857be8" opacity="${(0.70 * pageA).toFixed(3)}">CONCETTO 2.0 / PRE-DESIGN RESULT</text>
    <rect x="105" y="104" width="${(330 * pageA).toFixed(1)}" height="1.2" fill="#7668ff" opacity="0.58"/>
  </svg>`;
}

for (let i = 0; i < frames; i++) {
  const out = path.join(frameDir, `frame_${String(i).padStart(4, '0')}.png`);
  const t = i / fps;
  await sharp(Buffer.from(svgFrame(t))).png().toFile(out);
}

run([
  '-y',
  '-framerate', String(fps),
  '-i', path.join(frameDir, 'frame_%04d.png'),
  '-c:v', 'libx264',
  '-preset', 'medium',
  '-crf', '20',
  '-pix_fmt', 'yuv420p',
  '-r', String(fps),
  outPart,
], 'render prestrategy result part');

const oldContent = fs.readFileSync(oldList, 'utf8');
const replaced = oldContent.replace(quoteLine(oldPart), quoteLine(outPart));
fs.writeFileSync(newList, replaced);

function quoteLine(file) {
  return `file '${file.replace(/'/g, "'\\''")}'`;
}

run(['-y', '-f', 'concat', '-safe', '0', '-i', newList, '-c', 'copy', videoOnly], 'concat v07 video');
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
], 'mux v07');

run(['-y', '-i', output, '-vf', 'fps=0.28,scale=360:-1,tile=10x7', '-frames:v', '1', preview], 'preview v07');

run([
  '-y',
  '-ss', '35',
  '-t', '19',
  '-i', output,
  '-vf', 'fps=1.1,scale=420:-1,tile=6x4',
  '-frames:v', '1',
  localPreview,
], 'local front preview');

const md = [
  '# Concetto 2.0 前策成果页调整 v07',
  '',
  '本版在 v06 基础上只替换前策分析成果段：将原来的纯文字卡替换为资料页/PPT 页飞入汇聚效果。',
  '',
  `替换前：\`${oldPart}\``,
  `替换后：\`${outPart}\``,
  `输出视频：\`${output}\``,
  `全片预览：\`${preview}\``,
  `前策段预览：\`${localPreview}\``,
  `总时长：约 ${Math.floor(totalDur / 60)}:${String(Math.round(totalDur % 60)).padStart(2, '0')}`,
  '',
  '使用的资料页素材：',
  '',
  ...pages.map((p) => `- \`CC 2.0宣发/Resources/local/${p.file}\``),
  '',
  '调整原则：',
  '',
  '- 前策操作录屏不动，仍保留输入任务、选择条件、生成结果的动作；',
  '- 成果段加入多资料页从两侧/上下飞入并汇聚，表达“分析资料 → 汇报材料”；',
  '- 文案保留“结合场地数据，整合输出 PPT”；',
  '- 结尾资料卡片收束为光束，衔接后续场地定位。',
  '',
].join('\n');
fs.writeFileSync(logPath, md);

console.log(output);
console.log(preview);
console.log(localPreview);
console.log(logPath);
console.log(`duration=${totalDur}`);
