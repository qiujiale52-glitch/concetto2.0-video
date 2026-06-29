import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const cwd = process.cwd();
const ffmpeg = path.join(cwd, '.tools/media-bin/node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg');
const ffprobe = path.join(cwd, '.tools/media-bin/node_modules/@ffprobe-installer/darwin-arm64/ffprobe');

const srcDir = path.join(cwd, '06_预览输出', 'refined_v32_final_2560p60_parts', 'ops');
const outRoot = path.join(cwd, '06_预览输出', 'refined_v33_final_2560p60_parts');
const outDir = path.join(outRoot, 'ops');
const report = path.join(cwd, '03_脚本与结构', 'Concetto 2.0_v33_操作素材统一去侧边白线说明.md');

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
  const isSimulation = name.includes('sec_07_operation');
  const isTextTitle = name.includes('sec_09_text_generation_with_title');
  const sideWidth = isSimulation ? 48 : 30;
  const leftX = 118;
  const rightX = 2560 - leftX - sideWidth;
  const sideY = 182;
  const sideH = 1160;

  const filters = [
    // Cover the thin white padding lines left by operation-source normalization.
    // This sits inside the dark demo stage and does not touch the rounded browser UI content.
    `drawbox=x=${leftX}:y=${sideY}:w=${sideWidth}:h=${sideH}:color=0x010104@1:t=fill`,
    `drawbox=x=${rightX}:y=${sideY}:w=${sideWidth}:h=${sideH}:color=0x010104@1:t=fill`,
  ];

  // Keep the previous text-generation smoothness treatment.
  if (isTextTitle) {
    filters.push(
      'minterpolate=fps=120:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1',
      `fps=${FPS}`,
    );
  } else {
    filters.push(`fps=${FPS}`);
  }

  filters.push('format=yuv420p', 'setpts=PTS-STARTPTS');
  return filters.join(',');
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
    ], `v33 unified side matte ${name}`);

    const st = probe(out);
    rows.push(`| ${name} | ${st.width}×${st.height} | ${st.avg_frame_rate} | ${Number(st.duration || 0).toFixed(3)}s |`);
  }

  fs.writeFileSync(report, [
    '# Concetto 2.0 v33 操作素材统一去侧边白线说明',
    '',
    '- 基于 v32 正片级操作段继续修复；',
    '- 对所有操作演示片段左右两侧统一增加暗色遮边，消除细白边；',
    '- AI 仿真分析保留更宽遮边，避免两侧白色 padding 复现；',
    '- 文本生成标题段继续保留运动插帧平滑处理；',
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
