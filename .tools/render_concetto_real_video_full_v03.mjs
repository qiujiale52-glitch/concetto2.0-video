import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const cwd = process.cwd();
const ffmpeg = path.join(cwd, '.tools/media-bin/node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg');
const outDir = path.join(cwd, '06_预览输出', 'real_video_full_v03_parts');
fs.mkdirSync(outDir, { recursive: true });

const font = path.join(cwd, '03-正版授权字体库/免费商用字体/思源黑体/NotoSansHans-Regular.otf');
const intro = path.join(cwd, '06_预览输出', 'Concetto_2.0_开头升级工作流前策_v02_38s.mp4');
const music = path.join(cwd, '04-正版授权音乐库', '未来科技宽广磅礴音乐15437.wav');
const output = path.join(cwd, '06_预览输出', 'Concetto_2.0_完整工作流真实操作样片_v03_低清.mp4');
const preview = path.join(cwd, '06_预览输出', 'Concetto_2.0_完整工作流真实操作样片_v03_预览.jpg');

const scenes = [
  {
    type: 'video',
    start: 6,
    dur: 12,
    src: 'CC 2.0宣发/Resources/local/2c8f6c525a9714147f7b595ae71420af.mp4',
    title: '01 前策分析：从任务书进入策略生成',
    sub: '任务输入、需求解析与生成过程，作为方案设计的第一步',
    step: '01 / PRE-DESIGN ANALYSIS',
  },
  {
    type: 'video',
    start: 50,
    dur: 8,
    src: 'CC 2.0宣发/Resources/local/2c8f6c525a9714147f7b595ae71420af.mp4',
    title: '02 场地定位：区位、半径与周边资源浮现',
    sub: '从前策延伸到地图，场地条件进入可视化分析视野',
    step: '02 / LOCATION CONTEXT',
  },
  {
    type: 'video',
    start: 3,
    dur: 12,
    src: 'CC 2.0宣发/Resources/local/851fd789ef880cfe4c24d6f2681751ce.mp4',
    title: '03 数据建模：从真实场地进入三维模型',
    sub: '锁定场地后，三维环境、地块与设计对象开始建立',
    step: '03 / SITE TO MODEL',
  },
  {
    type: 'video',
    start: 10,
    dur: 11,
    src: 'CC 2.0宣发/Resources/local/4c430bc016a79d5b446ff15cc00df2ab.mp4',
    title: '04 图纸模型：体块与参数同步推进',
    sub: '模型体块、右侧参数与设计反馈在同一界面联动',
    step: '04 / PARAMETRIC MODELING',
  },
  {
    type: 'video',
    start: 18,
    dur: 11,
    src: 'CC 2.0宣发/Resources/local/bdf6c7f35f90ffaf04c13c600925989d.mp4',
    title: '05 AI 渲染前置：Web 端建模与形体编辑',
    sub: '从空场地到可编辑模型，为后续渲染与分析承接数据底座',
    step: '05 / WEB MODELING',
  },
  {
    type: 'video',
    start: 2,
    dur: 12,
    src: 'CC 2.0宣发/Resources/local/81bdcc47cfffa059ce2f1f6d5318cd28.mp4',
    title: '06 AI 渲染：参考图、提示词与生成流程',
    sub: '真实操作展示参考输入与灵感渲染生成链路',
    step: '06 / AI RENDERING',
  },
  {
    type: 'video',
    start: 33,
    dur: 9,
    src: 'CC 2.0宣发/Resources/local/50d251c9e39412cb5853e438d2b4dc6b.mp4',
    title: '渲染结果：高质量效果图形成发布会视觉峰值',
    sub: '把操作结果推向更强视觉记忆点，作为中段高潮',
    step: 'RESULT / VISUAL CLIMAX',
  },
  {
    type: 'video',
    start: 5,
    dur: 12,
    src: 'CC 2.0宣发/Resources/local/f6aa9cbe5a64dd09dc34a4841d261ae1.mp4',
    title: '07 AI 分析：任务配置与模型性能分析',
    sub: '模型不只被展示，也被系统持续计算、评估与反馈',
    step: '07 / AI ANALYSIS',
  },
  {
    type: 'video',
    start: 28,
    dur: 8,
    src: 'CC 2.0宣发/Resources/local/e14011992dde10c418d56476dfcf5bfe.mp4',
    title: '分析结果：指标层与热力结果叠加',
    sub: '彩色分析层将方案判断转化为可读数据',
    step: 'DATA / PERFORMANCE LAYER',
  },
  {
    type: 'video',
    start: 74,
    dur: 8,
    src: 'CC 2.0宣发/Resources/local/e22d4200e9c271f86d33aa2b68d8b478.mp4',
    title: '08 AI 估算：指标、成本与投资数据锁定',
    sub: '让方案比较从经验判断进入可量化决策',
    step: '08 / COST ESTIMATION',
  },
  {
    type: 'video',
    start: 9,
    dur: 10,
    src: 'CC 2.0宣发/Resources/local/aeb56ebbfe9401582092208e15547ce7.mp4',
    title: '09 车库智能排布：参数输入与自动生成',
    sub: '从地库条件到车位排布，复杂专项进入自动化流程',
    step: '09 / PARKING LAYOUT',
  },
  {
    type: 'video',
    start: 106,
    dur: 10,
    src: 'CC 2.0宣发/Resources/local/162c9549484618a282a91800b89f5e68.mp4',
    title: '车库结果：车位图、方案列表与指标面板',
    sub: '生成结果进入比较、优化与交付前检查',
    step: 'PARKING / RESULT',
  },
  {
    type: 'video',
    start: 150,
    dur: 14,
    src: 'CC 2.0宣发/Resources/local/a58e492385ebe042fa4c809a19dc3545.mp4',
    title: '10 文本生成：成果汇聚为汇报材料',
    sub: '从分析到设计，最终形成 PPT / 报告等可交付成果',
    step: '10 / REPORT GENERATION',
  },
  {
    type: 'image',
    dur: 6,
    src: 'CC 2.0宣发/Resources/local/69843c8696b27a065e3e01a568d58702.png',
    title: 'CONCETTO 2.0',
    sub: '从前策分析到设计交付，一站式方案设计工作流',
    step: 'FROM ANALYSIS TO DESIGN',
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
  if (r.status !== 0) {
    throw new Error(`${label} failed with status ${r.status}`);
  }
}

function sceneFilter(scene, isImage) {
  const title = qText(scene.title);
  const sub = qText(scene.sub);
  const step = qText(scene.step);
  const fontfile = font.replace(/:/g, '\\:');
  const fadeOutAt = Math.max(0.1, scene.dur - 0.42);

  const srcPrep = isImage
    ? `[0:v]scale=1500:760:force_original_aspect_ratio=decrease,setsar=1[vid]`
    : `[0:v]crop=iw:ih-100:0:70,scale=1500:760:force_original_aspect_ratio=decrease,setsar=1,fps=30[vid]`;

  return [
    srcPrep,
    `[1:v]format=yuv420p,drawbox=x=0:y=0:w=1920:h=1080:color=0x010104@1:t=fill[bg0]`,
    `[bg0]drawbox=x=0:y=0:w=1920:h=1080:color=0x24195d@0.18:t=fill,drawbox=x=165:y=135:w=1590:h=860:color=0x6d5cff@0.10:t=fill,drawbox=x=185:y=155:w=1550:h=820:color=0x9d90ff@0.24:t=2,drawbox=x=205:y=175:w=1510:h=780:color=0xffffff@0.035:t=fill[stage]`,
    `[stage][vid]overlay=x=(W-w)/2:y=215:format=auto[comp0]`,
    `[comp0]drawbox=x=205:y=175:w=1510:h=780:color=0xb8afff@0.18:t=2,drawbox=x=205:y=175:w=1510:h=780:color=0x010104@0.12:t=fill[comp1]`,
    `[comp1]drawtext=fontfile='${fontfile}':text='${title}':x=(w-text_w)/2:y=74:fontsize=38:fontcolor=0xf2f0ff:alpha=0.98,drawtext=fontfile='${fontfile}':text='${sub}':x=(w-text_w)/2:y=123:fontsize=20:fontcolor=0xaaa2df:alpha=0.92,drawtext=fontfile='${fontfile}':text='${step}':x=112:y=78:fontsize=17:fontcolor=0x837acf:alpha=0.72,drawbox=x=112:y=96:w=310:h=1:color=0x7668ff@0.45:t=fill,drawtext=fontfile='${fontfile}':text='CONCETTO 2.0':x=1510:y=78:fontsize=18:fontcolor=0xaaa2df:alpha=0.7,fade=t=in:st=0:d=0.32,fade=t=out:st=${fadeOutAt}:d=0.42[v]`,
  ].join(';');
}

const partFiles = [];

for (let i = 0; i < scenes.length; i++) {
  const scene = scenes[i];
  const part = path.join(outDir, `part_${String(i).padStart(2, '0')}.mp4`);
  partFiles.push(part);
  const commonOut = ['-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-r', '30', part];

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
      ...commonOut,
    ], `render scene ${i}`);
  } else {
    run([
      '-y',
      '-ss', String(scene.start),
      '-t', String(scene.dur),
      '-i', abs(scene.src),
      '-f', 'lavfi',
      '-t', String(scene.dur),
      '-i', `color=c=0x010104:s=1920x1080:r=30:d=${scene.dur}`,
      '-filter_complex', sceneFilter(scene, false),
      '-map', '[v]',
      ...commonOut,
    ], `render scene ${i}`);
  }
}

const listPath = path.join(outDir, 'concat_list.txt');
fs.writeFileSync(listPath, partFiles.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join('\n') + '\n');
const operationOnly = path.join(outDir, 'operation_concat.mp4');
run(['-y', '-f', 'concat', '-safe', '0', '-i', listPath, '-c', 'copy', operationOnly], 'concat operation scenes');

const finalDuration = 38 + scenes.reduce((sum, s) => sum + s.dur, 0);
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
  '-vf', 'fps=1,scale=360:-1,tile=8x8',
  '-frames:v', '1',
  preview,
], 'render preview sheet');

console.log(output);
console.log(preview);
