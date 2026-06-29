import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const cwd = process.cwd();
const ffmpeg = path.join(cwd, '.tools/media-bin/node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg');
const ffprobe = path.join(cwd, '.tools/media-bin/node_modules/@ffprobe-installer/darwin-arm64/ffprobe');
const outDir = path.join(cwd, '06_预览输出', 'workflow_strict_v04_parts');
fs.mkdirSync(outDir, { recursive: true });

const font = path.join(cwd, '03-正版授权字体库/免费商用字体/思源黑体/NotoSansHans-Regular.otf');
const intro = path.join(cwd, '06_预览输出', 'Concetto_2.0_开头升级工作流前策_v02_38s.mp4');
const music = path.join(cwd, '04-正版授权音乐库', '未来科技宽广磅礴音乐15437.wav');
const output = path.join(cwd, '06_预览输出', 'Concetto_2.0_九环节严格顺序样片_v04_低清.mp4');
const preview = path.join(cwd, '06_预览输出', 'Concetto_2.0_九环节严格顺序样片_v04_全片预览.jpg');

// 严格对应用户给出的九环节图：顺序与主标题不可改。
// 每个环节使用识别出的完整相关操作段，只做时间加速，不做几秒钟裁短式闪现。
const scenes = [
  {
    src: 'CC 2.0宣发/Resources/local/2c8f6c525a9714147f7b595ae71420af.mp4',
    start: 4,
    dur: 38,
    speed: 2.0,
    title: '01 前策分析',
    sub: '目标设定与需求分析',
    step: '01 / PRE-DESIGN ANALYSIS',
  },
  {
    src: 'CC 2.0宣发/Resources/local/851fd789ef880cfe4c24d6f2681751ce.mp4',
    start: 3,
    dur: 44,
    speed: 2.2,
    title: '02 场地定位',
    sub: '地理位置与周边环境分析',
    step: '02 / SITE LOCATION',
  },
  {
    src: 'CC 2.0宣发/Resources/local/4c430bc016a79d5b446ff15cc00df2ab.mp4',
    start: 3,
    dur: 35,
    speed: 2.0,
    title: '03 数据建模',
    sub: 'BIM信息模型构建',
    step: '03 / DATA MODELING',
  },
  {
    src: 'CC 2.0宣发/Resources/local/d5cc189fc5d49465fbd069dbe72cc936.mp4',
    start: 6,
    dur: 14,
    speed: 1.5,
    title: '04 图纸模型',
    sub: '2D/3D设计图纸生成',
    step: '04 / DRAWING TO MODEL',
  },
  {
    src: 'CC 2.0宣发/Resources/local/bdf6c7f35f90ffaf04c13c600925989d.mp4',
    start: 18,
    dur: 50,
    speed: 2.3,
    title: '04 图纸模型',
    sub: '2D/3D设计图纸生成',
    step: '04 / DRAWING TO MODEL',
  },
  {
    src: 'CC 2.0宣发/Resources/local/81bdcc47cfffa059ce2f1f6d5318cd28.mp4',
    start: 2,
    dur: 35,
    speed: 2.0,
    title: '05 AI渲染',
    sub: '智能效果图生成',
    step: '05 / AI RENDERING',
  },
  {
    src: 'CC 2.0宣发/Resources/local/50d251c9e39412cb5853e438d2b4dc6b.mp4',
    start: 33,
    dur: 67,
    speed: 2.8,
    title: '05 AI渲染',
    sub: '智能效果图生成',
    step: '05 / AI RENDERING',
  },
  {
    src: 'CC 2.0宣发/Resources/local/f6aa9cbe5a64dd09dc34a4841d261ae1.mp4',
    start: 5,
    dur: 58,
    speed: 2.5,
    title: '06 AI分析',
    sub: '性能与优化分析',
    step: '06 / AI ANALYSIS',
  },
  {
    src: 'CC 2.0宣发/Resources/local/e14011992dde10c418d56476dfcf5bfe.mp4',
    start: 28,
    dur: 19,
    speed: 1.8,
    title: '06 AI分析',
    sub: '性能与优化分析',
    step: '06 / AI ANALYSIS',
  },
  {
    src: 'CC 2.0宣发/Resources/local/e22d4200e9c271f86d33aa2b68d8b478.mp4',
    start: 74,
    dur: 12,
    speed: 1.2,
    title: '07 AI估算',
    sub: '成本与投资估算',
    step: '07 / AI ESTIMATION',
  },
  {
    src: 'CC 2.0宣发/Resources/local/256c745848b222e892af9b42358cadc3.mp4',
    start: 1,
    dur: 16,
    speed: 1.5,
    title: '07 AI估算',
    sub: '成本与投资估算',
    step: '07 / AI ESTIMATION',
  },
  {
    src: 'CC 2.0宣发/Resources/local/aeb56ebbfe9401582092208e15547ce7.mp4',
    start: 9,
    dur: 111,
    speed: 3.0,
    title: '08 车库排布',
    sub: '停车规划与优化',
    step: '08 / PARKING LAYOUT',
  },
  {
    src: 'CC 2.0宣发/Resources/local/a58e492385ebe042fa4c809a19dc3545.mp4',
    start: 150,
    dur: 188,
    speed: 4.0,
    title: '09 文本生成',
    sub: '智能报告撰写',
    step: '09 / TEXT GENERATION',
  },
  {
    type: 'image',
    src: 'CC 2.0宣发/Resources/local/69843c8696b27a065e3e01a568d58702.png',
    dur: 6,
    title: 'CONCETTO 2.0',
    sub: 'AI 重塑建筑方案设计师的完整旅程',
    step: 'FROM ANALYSIS TO DELIVERY',
  },
];

function abs(p) {
  return path.join(cwd, p);
}

function qText(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/:/g, '\\:').replace(/'/g, "\\'");
}

function run(args, label) {
  const r = spawnSync(ffmpeg, args, { stdio: 'inherit' });
  if (r.status !== 0) throw new Error(`${label} failed with status ${r.status}`);
}

function probeDur(file) {
  const r = spawnSync(ffprobe, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nk=1:nw=1', file], { encoding: 'utf8' });
  if (r.status !== 0) return null;
  const n = Number.parseFloat(r.stdout.trim());
  return Number.isFinite(n) ? n : null;
}

function sceneFilter(scene, isImage) {
  const title = qText(scene.title);
  const sub = qText(scene.sub);
  const step = qText(scene.step);
  const fontfile = font.replace(/:/g, '\\:');
  const outDur = scene.type === 'image' ? scene.dur : scene.dur / scene.speed;
  const fadeOutAt = Math.max(0.1, outDur - 0.42);

  // 注意：这里不再裁掉录屏上下区域，完整保留操作界面，只缩放放入发布会舞台框。
  const srcPrep = isImage
    ? `[0:v]scale=1500:760:force_original_aspect_ratio=decrease,pad=1500:760:(ow-iw)/2:(oh-ih)/2:color=0x05040a,setsar=1[vid]`
    : `[0:v]setpts=PTS/${scene.speed},scale=1500:760:force_original_aspect_ratio=decrease,pad=1500:760:(ow-iw)/2:(oh-ih)/2:color=0x05040a,setsar=1,fps=30[vid]`;

  return [
    srcPrep,
    `[1:v]format=yuv420p,drawbox=x=0:y=0:w=1920:h=1080:color=0x010104@1:t=fill[bg0]`,
    `[bg0]drawbox=x=0:y=0:w=1920:h=1080:color=0x211656@0.18:t=fill,drawbox=x=165:y=135:w=1590:h=860:color=0x6d5cff@0.10:t=fill,drawbox=x=185:y=155:w=1550:h=820:color=0x9d90ff@0.24:t=2,drawbox=x=205:y=175:w=1510:h=780:color=0xffffff@0.035:t=fill[stage]`,
    `[stage][vid]overlay=x=(W-w)/2:y=215:format=auto[comp0]`,
    `[comp0]drawbox=x=205:y=175:w=1510:h=780:color=0xb8afff@0.18:t=2,drawbox=x=205:y=175:w=1510:h=780:color=0x010104@0.08:t=fill[comp1]`,
    `[comp1]drawtext=fontfile='${fontfile}':text='${title}':x=(w-text_w)/2:y=70:fontsize=42:fontcolor=0xf2f0ff:alpha=0.98,drawtext=fontfile='${fontfile}':text='${sub}':x=(w-text_w)/2:y=124:fontsize=21:fontcolor=0xaaa2df:alpha=0.94,drawtext=fontfile='${fontfile}':text='${step}':x=112:y=78:fontsize=17:fontcolor=0x837acf:alpha=0.72,drawbox=x=112:y=96:w=310:h=1:color=0x7668ff@0.45:t=fill,drawtext=fontfile='${fontfile}':text='CONCETTO 2.0':x=1510:y=78:fontsize=18:fontcolor=0xaaa2df:alpha=0.7,fade=t=in:st=0:d=0.25,fade=t=out:st=${fadeOutAt}:d=0.42[v]`,
  ].join(';');
}

const partFiles = [];
const chapterLog = [];

for (let i = 0; i < scenes.length; i++) {
  const scene = scenes[i];
  const part = path.join(outDir, `part_${String(i).padStart(2, '0')}.mp4`);
  partFiles.push(part);
  const outDur = scene.type === 'image' ? scene.dur : scene.dur / scene.speed;

  if (scene.type === 'image') {
    run([
      '-y',
      '-loop', '1',
      '-t', String(scene.dur),
      '-i', abs(scene.src),
      '-f', 'lavfi',
      '-t', String(scene.dur),
      '-i', `color=c=0x010104:s=1920x1080:r=30:d=${scene.dur}`,
      '-filter_complex', sceneFilter(scene, true),
      '-map', '[v]',
      '-an',
      '-c:v', 'libx264',
      '-preset', 'medium',
      '-crf', '20',
      '-pix_fmt', 'yuv420p',
      '-r', '30',
      part,
    ], `render scene ${i}`);
    chapterLog.push({ title: scene.title, sub: scene.sub, source: scene.src, sourceRange: `${scene.dur}s still`, speed: 1, outputDur: outDur });
  } else {
    const fileDur = probeDur(abs(scene.src));
    const safeDur = fileDur ? Math.max(0.1, Math.min(scene.dur, fileDur - scene.start)) : scene.dur;
    const realOutDur = safeDur / scene.speed;
    run([
      '-y',
      '-ss', String(scene.start),
      '-t', String(safeDur),
      '-i', abs(scene.src),
      '-f', 'lavfi',
      '-t', String(realOutDur),
      '-i', `color=c=0x010104:s=1920x1080:r=30:d=${realOutDur}`,
      '-filter_complex', sceneFilter({ ...scene, dur: safeDur }, false),
      '-map', '[v]',
      '-an',
      '-c:v', 'libx264',
      '-preset', 'medium',
      '-crf', '20',
      '-pix_fmt', 'yuv420p',
      '-r', '30',
      part,
    ], `render scene ${i}`);
    chapterLog.push({ title: scene.title, sub: scene.sub, source: scene.src, sourceRange: `${scene.start}s–${(scene.start + safeDur).toFixed(1)}s`, speed: scene.speed, outputDur: realOutDur });
  }
}

const listPath = path.join(outDir, 'concat_list.txt');
fs.writeFileSync(listPath, partFiles.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join('\n') + '\n');
const operationOnly = path.join(outDir, 'operation_concat.mp4');
run(['-y', '-f', 'concat', '-safe', '0', '-i', listPath, '-c', 'copy', operationOnly], 'concat operation scenes');

const operationDur = scenes.reduce((sum, s) => sum + (s.type === 'image' ? s.dur : s.dur / s.speed), 0);
const finalDuration = 38 + operationDur;
run([
  '-y',
  '-i', intro,
  '-i', operationOnly,
  '-i', music,
  '-filter_complex',
  `[0:v]scale=1920:1080,setsar=1[v0];[1:v]scale=1920:1080,setsar=1[v1];[v0][v1]concat=n=2:v=1:a=0[v];[2:a]atrim=0:${finalDuration.toFixed(3)},afade=t=in:st=0:d=1.2,afade=t=out:st=${Math.max(0, finalDuration - 3).toFixed(3)}:d=3,volume=0.72[a]`,
  '-map', '[v]',
  '-map', '[a]',
  '-c:v', 'libx264',
  '-preset', 'medium',
  '-crf', '22',
  '-pix_fmt', 'yuv420p',
  '-r', '30',
  '-c:a', 'aac',
  '-b:a', '160k',
  '-shortest',
  output,
], 'render final');

run([
  '-y',
  '-i', output,
  '-vf', 'fps=0.25,scale=360:-1,tile=8x8',
  '-frames:v', '1',
  preview,
], 'render preview sheet');

const logPath = path.join(cwd, '03_脚本与结构', 'Concetto 2.0_九环节严格顺序样片_v04_素材清单.md');
const log = [
  '# Concetto 2.0 九环节严格顺序样片 v04 素材清单',
  '',
  '说明：严格按工作流图中的 01–09 顺序与标题组织；操作段使用完整识别区间，只做加速，不做几秒裁短式展示。',
  '',
  '| 顺序 | 标题 | 副标题 | 素材区间 | 加速 | 输出约时长 |',
  '|---:|---|---|---|---:|---:|',
  ...chapterLog.map((c, idx) => `| ${idx + 1} | ${c.title} | ${c.sub} | \`${c.source}\` ${c.sourceRange} | ${c.speed}x | ${c.outputDur.toFixed(1)}s |`),
  '',
  `输出：\`${output}\``,
].join('\n');
fs.writeFileSync(logPath, log);

console.log(output);
console.log(preview);
console.log(logPath);
