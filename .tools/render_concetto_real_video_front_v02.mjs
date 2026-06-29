import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const cwd = process.cwd();
const ffmpeg = path.join(cwd, '.tools/media-bin/node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg');
const outDir = path.join(cwd, '06_预览输出', 'real_video_front_v02_parts');
fs.mkdirSync(outDir, { recursive: true });

const font = path.join(cwd, '03-正版授权字体库/免费商用字体/思源黑体/NotoSansHans-Regular.otf');
const output = path.join(cwd, '06_预览输出', 'Concetto_2.0_主体前半段_真实操作视频_v02_55s.mp4');

const scenes = [
  {
    type: 'image',
    dur: 5.5,
    src: 'CC 2.0宣发/Resources/local/32136d7756e1aed58bd505284ce6fe5e.png',
    title: '九大环节串联，进入主体工作流',
    sub: '从任务书解读到模型生成，系统开始推进方案全过程',
    step: 'WORKFLOW OVERVIEW',
  },
  {
    type: 'video',
    start: 22,
    dur: 10,
    src: 'CC 2.0宣发/Resources/local/2c8f6c525a9714147f7b595ae71420af.mp4',
    title: '前策分析：从任务理解开始',
    sub: '真实操作界面展示任务输入、信息生成与策略准备',
    step: '01 / SITE INTELLIGENCE',
  },
  {
    type: 'video',
    start: 50,
    dur: 8,
    src: 'CC 2.0宣发/Resources/local/2c8f6c525a9714147f7b595ae71420af.mp4',
    title: '前策延伸：区位与周边条件浮现',
    sub: '半径、点位与周边资源进入分析视野',
    step: '02 / LOCATION CONTEXT',
  },
  {
    type: 'video',
    start: 3,
    dur: 11,
    src: 'CC 2.0宣发/Resources/local/851fd789ef880cfe4c24d6f2681751ce.mp4',
    title: '场地定位：从地图进入三维场地',
    sub: '场地锁定后，三维环境与地块模型逐步建立',
    step: '03 / MAP TO SITE MODEL',
  },
  {
    type: 'video',
    start: 10,
    dur: 10,
    src: 'CC 2.0宣发/Resources/local/4c430bc016a79d5b446ff15cc00df2ab.mp4',
    title: '数据建模：体块与参数同步推进',
    sub: '真实建模操作中，模型体块与右侧参数面板联动',
    step: '04 / DATA MODELING',
  },
  {
    type: 'video',
    start: 18,
    dur: 11,
    src: 'CC 2.0宣发/Resources/local/bdf6c7f35f90ffaf04c13c600925989d.mp4',
    title: 'Web 端建模：从空场地生成设计对象',
    sub: '绘制、生成、推拉与形体编辑，承接图生模后的可编辑流程',
    step: '05 / WEB MODELING',
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

  const srcPrep = isImage
    ? `[0:v]scale=1500:760:force_original_aspect_ratio=decrease,setsar=1[vid]`
    : `[0:v]crop=iw:ih-100:0:70,scale=1500:760:force_original_aspect_ratio=decrease,setsar=1,fps=30[vid]`;

  return [
    srcPrep,
    `[1:v]format=yuv420p,drawbox=x=0:y=0:w=1920:h=1080:color=0x010104@1:t=fill[bg0]`,
    `[bg0]drawbox=x=165:y=135:w=1590:h=860:color=0x6d5cff@0.10:t=fill,drawbox=x=185:y=155:w=1550:h=820:color=0x9d90ff@0.24:t=2,drawbox=x=205:y=175:w=1510:h=780:color=0xffffff@0.035:t=fill[stage]`,
    `[stage][vid]overlay=x=(W-w)/2:y=215:format=auto[comp0]`,
    `[comp0]drawbox=x=205:y=175:w=1510:h=780:color=0xb8afff@0.18:t=2[comp1]`,
    `[comp1]drawtext=fontfile='${fontfile}':text='${title}':x=(w-text_w)/2:y=74:fontsize=40:fontcolor=0xf2f0ff:alpha=0.98,drawtext=fontfile='${fontfile}':text='${sub}':x=(w-text_w)/2:y=123:fontsize=20:fontcolor=0xaaa2df:alpha=0.92,drawtext=fontfile='${fontfile}':text='${step}':x=112:y=78:fontsize=17:fontcolor=0x837acf:alpha=0.72,drawbox=x=112:y=96:w=260:h=1:color=0x7668ff@0.45:t=fill,drawtext=fontfile='${fontfile}':text='CONCETTO 2.0':x=1510:y=78:fontsize=18:fontcolor=0xaaa2df:alpha=0.7,fade=t=in:st=0:d=0.35,fade=t=out:st=${Math.max(0.1, scene.dur - 0.45)}:d=0.45[v]`,
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
const duration = scenes.reduce((sum, s) => sum + s.dur, 0);
const videoOnly = path.join(outDir, 'video_concat.mp4');
run(['-y', '-f', 'concat', '-safe', '0', '-i', listPath, '-c', 'copy', videoOnly], 'concat scenes');

run([
  '-y',
  '-i', videoOnly,
  '-f', 'lavfi',
  '-i', `aevalsrc=0.026*sin(2*PI*36*t)*(1-exp(-t*0.5))+0.035*sin(2*PI*74*t)*exp(-4*(t-5.5)*(t-5.5))+0.026*sin(2*PI*80*t)*exp(-4*(t-15.5)*(t-15.5))+0.042*sin(2*PI*62*t)*exp(-4*(t-25.5)*(t-25.5))+0.034*sin(2*PI*92*t)*exp(-4*(t-38)*(t-38))+0.028*sin(2*PI*118*t)*exp(-5*(t-52)*(t-52)):s=48000:d=${duration}`,
  '-map', '0:v',
  '-map', '1:a',
  '-c:v', 'copy',
  '-c:a', 'aac',
  '-b:a', '160k',
  '-shortest',
  output,
], 'mux audio');

console.log(output);
