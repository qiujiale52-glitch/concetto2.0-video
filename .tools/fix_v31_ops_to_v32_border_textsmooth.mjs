import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const cwd = process.cwd();
const ffmpeg = path.join(cwd, '.tools/media-bin/node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg');
const ffprobe = path.join(cwd, '.tools/media-bin/node_modules/@ffprobe-installer/darwin-arm64/ffprobe');

const srcDir = path.join(cwd, '06_预览输出', 'refined_v31_final_2560p60_parts', 'ops');
const outRoot = path.join(cwd, '06_预览输出', 'refined_v32_final_2560p60_parts');
const outDir = path.join(outRoot, 'ops');
const report = path.join(cwd, '03_脚本与结构', 'Concetto 2.0_v32_操作素材去边框与文本流畅度修复说明.md');

const FPS = 60;

const files = [
  'sec_01_operation_ai_x4_1440p60.mp4',
  'sec_02_operation_ai_x4_1440p60.mp4',
  'sec_03_operation_ai_x4_1440p60.mp4',
  'sec_04_operation_ai_x4_1440p60.mp4',
  'sec_05_operation_normal_ai_x4_1440p60.mp4',
  'sec_05_operation_suite_ai_x4_1440p60.mp4',
  'sec_06_operation_ai_x4_1440p60.mp4',
  'sec_07_operation_ai_x4_1440p60.mp4',
  'sec_08_operation_ai_x4_1440p60.mp4',
  'sec_09_text_generation_direct_ai_x4_1440p60.mp4',
  'sec_09_text_generation_with_title_1440p60.mp4',
];

function assertFile(p) {
  if (!fs.existsSync(p)) throw new Error(`missing file: ${p}`);
}

function run(args, label) {
  console.log(`\n▶ ${label}`);
  const r = spawnSync(ffmpeg, args, { stdio: 'inherit' });
  if (r.status !== 0) throw new Error(`${label} failed: ${r.status}`);
}

function capture(args) {
  const r = spawnSync(ffprobe, args, { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(r.stderr);
  return r.stdout.trim();
}

function probe(file) {
  const raw = capture([
    '-v', 'error',
    '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height,avg_frame_rate,duration,nb_frames',
    '-of', 'json',
    file,
  ]);
  return JSON.parse(raw).streams?.[0] || {};
}

function fixFilter(name) {
  const coverOuterFrame = [
    // Cover the extra square drawbox added in v31. The rounded background frame remains.
    'drawbox=x=92:y=154:w=2376:h=1216:color=0x010104@1:t=2',
    'drawbox=x=100:y=162:w=2360:h=1200:color=0x010104@1:t=3',
  ];
  if (name.includes('sec_07_operation')) {
    coverOuterFrame.push(
      // v31 simulation crop had white side padding because its aspect ratio is narrower.
      'drawbox=x=120:y=182:w=45:h=1160:color=0x010104@1:t=fill',
      'drawbox=x=2395:y=182:w=45:h=1160:color=0x010104@1:t=fill',
    );
  }
  if (name.includes('sec_09_text_generation_with_title')) {
    coverOuterFrame.push(
      // Smooth the page movement on the right side of the text-generation section.
      `minterpolate=fps=120:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1`,
      `fps=${FPS}`,
    );
  } else {
    coverOuterFrame.push(`fps=${FPS}`);
  }
  coverOuterFrame.push('format=yuv420p', 'setpts=PTS-STARTPTS');
  return coverOuterFrame.join(',');
}

function main() {
  assertFile(ffmpeg);
  assertFile(ffprobe);
  fs.mkdirSync(outDir, { recursive: true });
  const rows = [];
  for (const name of files) {
    const src = path.join(srcDir, name);
    const out = path.join(outDir, name);
    assertFile(src);
    run([
      '-y',
      '-i', src,
      '-vf', fixFilter(name),
      '-an',
      '-c:v', 'libx264',
      '-preset', 'slow',
      '-crf', '10',
      '-pix_fmt', 'yuv420p',
      '-r', String(FPS),
      '-video_track_timescale', '60000',
      '-movflags', '+faststart',
      out,
    ], `v32 op fix ${name}`);
    const st = probe(out);
    rows.push(`| ${name} | ${st.width}×${st.height} | ${st.avg_frame_rate} | ${Number(st.duration || 0).toFixed(3)}s |`);
  }

  fs.writeFileSync(report, [
    '# Concetto 2.0 v32 操作素材修复说明',
    '',
    '- 基于 v31 正片级 4x 超分操作素材快速修复；',
    '- 去除 v31 操作段额外叠加的方形外框，保留背景本身的圆角舞台框；',
    '- AI 仿真分析额外覆盖两侧白色 padding；',
    '- 文本生成标题版加入 120fps 中间运动估计后回落 60fps，提升右侧素材运动观感；',
    '',
    '| 文件 | 分辨率 | 帧率 | 时长 |',
    '| --- | --- | --- | --- |',
    ...rows,
    '',
    `输出目录：\`${outDir}\``,
    '',
  ].join('\n'));
  console.log(`DONE ${outDir}`);
}

main();
