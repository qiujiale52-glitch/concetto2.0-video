import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const cwd = process.cwd();
const ffmpeg = path.join(cwd, '.tools/media-bin/node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg');
const ffprobe = path.join(cwd, '.tools/media-bin/node_modules/@ffprobe-installer/darwin-arm64/ffprobe');
const realesr = path.join(cwd, '.tools/ai-upscale/bin/realesrgan-ncnn-vulkan');
const modelDir = path.join(cwd, '.tools/ai-upscale/bin/models');

const inputRoot = path.join(cwd, '高帧率版手动保存素材');
const outputRoot = path.join(cwd, '06_预览输出', '高帧率版手动保存素材_旧版裁切x4_1440p60_样片');
const cacheRoot = path.join(cwd, '.tools', 'ai-upscale', 'cache_old_crop_x4_1440p_samples');
const reportPath = path.join(cwd, '03_脚本与结构', '高帧率版手动保存素材_旧版裁切x4_1440p60_样片说明.md');

const W = 2560;
const H = 1440;
const fps = Number(process.env.AI_FPS || 60);
const sampleSeconds = Number(process.env.SAMPLE_SECONDS || 3.2);
const aiModel = process.env.AI_MODEL || 'realesr-animevideov3';
const aiScale = process.env.AI_SCALE || '4';
const aiTile = process.env.AI_TILE || '256';
const keepFrames = process.env.KEEP_AI_FRAMES === '1';

// 旧版 1920×1080 裁切：1480:740:220:170
// 高帧率素材为 2560×1440，按 4/3 等比放大并取偶数，避免编码/模型边界问题。
const normalCrop = '1974:988:294:226';

const samples = [
  {
    key: '01_前策分析',
    rel: '前策分析/前策分析-1.mov',
    title: '前策分析',
    crop: normalCrop,
  },
  {
    key: '02_场地定位',
    rel: '场地定位/场地定位-1.mov',
    title: '场地定位',
    crop: normalCrop,
  },
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function cleanDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  ensureDir(dir);
}

function run(bin, args, label) {
  console.log(`\n▶ ${label}`);
  const result = spawnSync(bin, args, { stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`${label} failed: ${result.status}`);
}

function capture(bin, args, label) {
  const result = spawnSync(bin, args, { encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(`${label} failed: ${result.status}\n${result.stderr}`);
  }
  return result.stdout.trim();
}

function probe(file) {
  const raw = capture(ffprobe, [
    '-v', 'error',
    '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height,avg_frame_rate,r_frame_rate,duration',
    '-of', 'json',
    file,
  ], `probe ${file}`);
  return JSON.parse(raw).streams?.[0] || {};
}

function countPng(dir) {
  if (!fs.existsSync(dir)) return 0;
  return fs.readdirSync(dir).filter((x) => x.toLowerCase().endsWith('.png')).length;
}

function assertReady() {
  for (const p of [ffmpeg, ffprobe, realesr, modelDir, inputRoot]) {
    if (!fs.existsSync(p)) throw new Error(`missing: ${p}`);
  }
  for (const sample of samples) {
    const input = path.join(inputRoot, sample.rel);
    if (!fs.existsSync(input)) throw new Error(`missing sample input: ${input}`);
  }
}

function processSample(sample) {
  const input = path.join(inputRoot, sample.rel);
  const safeName = `${sample.key}_${sample.title}_旧版裁切x4_1440p60_${sampleSeconds.toFixed(1)}s.mp4`;
  const output = path.join(outputRoot, safeName);
  ensureDir(outputRoot);

  const cache = path.join(cacheRoot, sample.key);
  const framesIn = path.join(cache, 'frames_in_crop_60fps');
  const framesAi = path.join(cache, 'frames_ai_x4');
  cleanDir(framesIn);
  cleanDir(framesAi);

  run(ffmpeg, [
    '-y',
    '-i', input,
    '-t', sampleSeconds.toFixed(3),
    '-vf', `fps=${fps},crop=${sample.crop},setsar=1`,
    '-pix_fmt', 'rgb24',
    path.join(framesIn, 'frame_%06d.png'),
  ], `抽帧并裁切 ${sample.key} ${sample.crop}`);

  const extracted = countPng(framesIn);
  if (extracted === 0) throw new Error(`no frames extracted: ${sample.key}`);

  run(realesr, [
    '-i', framesIn,
    '-o', framesAi,
    '-m', modelDir,
    '-n', aiModel,
    '-s', aiScale,
    '-t', aiTile,
    '-j', '1:2:2',
  ], `Real-ESRGAN x${aiScale} ${sample.key} (${extracted} frames)`);

  const upscaled = countPng(framesAi);
  if (upscaled === 0) throw new Error(`no AI frames created: ${sample.key}`);

  // 旧版窗口 1740×870 在 1920×1080 里约占 90.6% 宽、80.6% 高。
  // 等比放到 2560×1440 后为 2320×1160；这里略放大到 2380×1190，贴近用户标注的红框。
  const uiW = 2380;
  const uiH = 1190;
  const uiX = Math.round((W - uiW) / 2);
  const uiY = 150;
  const borderX = uiX - 18;
  const borderY = uiY - 18;
  const borderW = uiW + 36;
  const borderH = uiH + 36;

  run(ffmpeg, [
    '-y',
    '-framerate', String(fps),
    '-i', path.join(framesAi, 'frame_%06d.png'),
    '-vf', [
      `scale=${uiW}:${uiH}:force_original_aspect_ratio=decrease:flags=lanczos`,
      `pad=${uiW}:${uiH}:(ow-iw)/2:(oh-ih)/2:color=white`,
      // 旧版的克制锐化：只收边，不强行改字形。
      'unsharp=3:3:0.20:3:3:0.08',
      `pad=${W}:${H}:${uiX}:${uiY}:color=0x03030a`,
      `drawbox=x=${borderX}:y=${borderY}:w=${borderW}:h=${borderH}:color=0x8d7cff@0.30:t=3`,
      `drawbox=x=${borderX - 8}:y=${borderY - 8}:w=${borderW + 16}:h=${borderH + 16}:color=0x6557ff@0.12:t=2`,
      'eq=contrast=1.012:saturation=1.006',
      'format=yuv420p',
    ].join(','),
    '-an',
    '-c:v', 'libx264',
    '-preset', 'slow',
    '-crf', '13',
    '-r', String(fps),
    '-movflags', '+faststart',
    output,
  ], `封装 2560×1440 / ${fps}fps ${sample.key}`);

  const still = path.join(outputRoot, `${sample.key}_${sample.title}_样片帧.jpg`);
  run(ffmpeg, [
    '-y',
    '-ss', '1.000',
    '-i', output,
    '-frames:v', '1',
    '-q:v', '2',
    still,
  ], `导出样片截图 ${sample.key}`);

  if (!keepFrames) fs.rmSync(cache, { recursive: true, force: true });

  return { input, output, still, extracted, upscaled, crop: sample.crop };
}

function writeReport(results) {
  const rows = results.map((r) => {
    const v = probe(r.output);
    const size = (fs.statSync(r.output).size / 1024 / 1024).toFixed(1);
    return `| ${path.relative(cwd, r.output)} | ${v.width}×${v.height} | ${v.avg_frame_rate || v.r_frame_rate} | ${Number(v.duration || 0).toFixed(3)}s | ${size} MB | ${r.crop} |`;
  }).join('\n');

  const text = `# 旧版裁切 x4 高帧率操作演示 1440p60 样片说明

本轮用于验证：早期低帧率版本的“先裁切 UI 有效区域 → Real-ESRGAN x4 → 降采样轻锐化”能否迁移到 2560×1440 / 60fps 正片规格。

- 输入目录：\`${path.relative(cwd, inputRoot)}\`
- 输出目录：\`${path.relative(cwd, outputRoot)}\`
- 输出规格：2560×1440 / 60fps
- AI 模型：\`${aiModel}\`
- AI 倍率：x${aiScale}
- 抽帧帧率：${fps}fps
- 样片长度：${sampleSeconds}s
- 常规裁切：\`${normalCrop}\`
- 锐化策略：沿用旧版轻锐化 \`unsharp=3:3:0.20:3:3:0.08\`

| 文件 | 分辨率 | 帧率 | 时长 | 大小 | 裁切 |
| --- | --- | --- | --- | --- | --- |
${rows}

截图：
${results.map((r) => `- ${path.relative(cwd, r.still)}`).join('\n')}
`;
  ensureDir(path.dirname(reportPath));
  fs.writeFileSync(reportPath, text);
}

function main() {
  assertReady();
  ensureDir(outputRoot);
  ensureDir(cacheRoot);
  const results = samples.map(processSample);
  writeReport(results);
  console.log('\n✅ 2560×1440 旧版裁切 x4 样片完成：');
  for (const r of results) {
    console.log(`- ${r.output}`);
    console.log(`  ${r.still}`);
  }
  console.log(`\n说明文档：${reportPath}`);
}

main();
