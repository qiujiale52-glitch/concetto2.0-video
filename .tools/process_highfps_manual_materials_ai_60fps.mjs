import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const cwd = process.cwd();
const ffmpeg = path.join(cwd, '.tools/media-bin/node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg');
const ffprobe = path.join(cwd, '.tools/media-bin/node_modules/@ffprobe-installer/darwin-arm64/ffprobe');
const realesr = path.join(cwd, '.tools/ai-upscale/bin/realesrgan-ncnn-vulkan');
const modelDir = path.join(cwd, '.tools/ai-upscale/bin/models');

const inputRoot = path.join(cwd, '高帧率版手动保存素材');
const outputRoot = path.join(cwd, '06_预览输出', '高帧率版手动保存素材_AI超分_1080p60');
const previewRoot = path.join(outputRoot, '_预览');
const cacheRoot = path.join(cwd, '.tools', 'ai-upscale', 'cache_highfps_manual_ai_60fps');
const logPath = path.join(cwd, '03_脚本与结构', '高帧率版手动保存素材_AI超分_60fps处理说明.md');

const sourceScale = process.env.AI_SOURCE_SCALE || '1440:810';
const aiFps = Number(process.env.AI_FPS || 60);
const outFps = 60;
const aiModel = process.env.AI_MODEL || 'realesr-animevideov3';
const aiScale = process.env.AI_SCALE || '2';
const aiTile = process.env.AI_TILE || '256';
const keepFrames = process.env.KEEP_AI_FRAMES === '1';
const mode = process.argv.includes('--report-only')
  ? 'report'
  : process.argv.includes('--test')
    ? 'test'
    : 'full';
const testSeconds = Number(process.env.AI_TEST_SECONDS || 2.4);

const clips = [
  ['01_前策分析', '前策分析/前策分析-1.mov'],
  ['02_场地定位', '场地定位/场地定位-1.mov'],
  ['03_图生模型', '图生模型/图生模型-1.mov'],
  ['04_数智建模', '数智建模/数智建模-1.mov'],
  ['05A_AI灵感渲染_普通渲染', '灵感渲染（普通渲染）/灵感渲染（普通渲染）-1.mov'],
  ['05B_AI灵感渲染_生成套图', '灵感渲染（生成套图）/灵感渲染（生成套图）-1.mov'],
  ['06_总图排布_车库智能排布', '车库智能排布/车库智能排布-1.mov'],
  ['07_AI仿真分析', 'ai仿真分析/ai仿真分析-1.mov'],
  ['08_AI成本估算', 'ai成本估算/ai成本估算-1.mov'],
  ['09_文本生成', '文本生成/文本生成-1.mov'],
].map(([key, rel]) => ({
  key,
  rel,
  input: path.join(inputRoot, rel),
  output: path.join(outputRoot, path.dirname(rel), `${path.basename(rel, path.extname(rel))}_AI超分_1080p60.mp4`),
}));

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function run(bin, args, label) {
  console.log(`\n▶ ${label}`);
  const r = spawnSync(bin, args, { stdio: 'inherit' });
  if (r.status !== 0) throw new Error(`${label} failed with status ${r.status}`);
}

function capture(bin, args, label) {
  const r = spawnSync(bin, args, { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`${label} failed with status ${r.status}: ${r.stderr}`);
  return r.stdout.trim();
}

function probe(file) {
  const raw = capture(ffprobe, [
    '-v', 'error',
    '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height,r_frame_rate,avg_frame_rate,nb_frames,duration',
    '-of', 'json',
    file,
  ], `probe ${file}`);
  return JSON.parse(raw).streams?.[0] || {};
}

function probeDuration(file) {
  const v = probe(file);
  const dur = Number(v.duration);
  return Number.isFinite(dur) ? dur : 0;
}

function assertTools() {
  for (const p of [ffmpeg, ffprobe, realesr, modelDir, inputRoot]) {
    if (!fs.existsSync(p)) throw new Error(`missing: ${p}`);
  }
  for (const clip of clips) {
    if (!fs.existsSync(clip.input)) throw new Error(`missing input clip: ${clip.input}`);
  }
}

function cleanDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  ensureDir(dir);
}

function countPng(dir) {
  if (!fs.existsSync(dir)) return 0;
  return fs.readdirSync(dir).filter((x) => x.toLowerCase().endsWith('.png')).length;
}

function processClip(clip, options = {}) {
  const duration = options.duration ?? probeDuration(clip.input);
  const suffix = options.test ? '_AI超分试跑_1080p60.mp4' : '_AI超分_1080p60.mp4';
  const outFile = options.test
    ? path.join(previewRoot, `${clip.key}${suffix}`)
    : clip.output;
  ensureDir(path.dirname(outFile));

  const cache = path.join(cacheRoot, options.test ? `_test_${clip.key}` : clip.key);
  const framesIn = path.join(cache, 'frames_in_60fps');
  const framesAi = path.join(cache, 'frames_ai_x2');
  cleanDir(framesIn);
  cleanDir(framesAi);

  const durationArgs = Number.isFinite(duration) && duration > 0 ? ['-t', duration.toFixed(3)] : [];
  run(ffmpeg, [
    '-y',
    '-i', clip.input,
    ...durationArgs,
    '-vf', `fps=${aiFps},scale=${sourceScale}:flags=lanczos,setsar=1`,
    '-pix_fmt', 'rgb24',
    path.join(framesIn, 'frame_%06d.png'),
  ], `抽帧 ${clip.key} @ ${aiFps}fps, ${sourceScale}`);

  const extracted = countPng(framesIn);
  if (extracted === 0) throw new Error(`no frames extracted for ${clip.key}`);

  run(realesr, [
    '-i', framesIn,
    '-o', framesAi,
    '-m', modelDir,
    '-n', aiModel,
    '-s', aiScale,
    '-t', aiTile,
    '-j', '1:2:2',
  ], `Real-ESRGAN AI超分 ${clip.key} (${extracted} frames)`);

  const upscaled = countPng(framesAi);
  if (upscaled === 0) throw new Error(`no AI frames created for ${clip.key}`);

  run(ffmpeg, [
    '-y',
    '-framerate', String(aiFps),
    '-i', path.join(framesAi, 'frame_%06d.png'),
    '-vf', [
      'scale=1920:1080:flags=lanczos',
      'unsharp=5:5:0.42:3:3:0.12',
      'eq=contrast=1.025:saturation=1.015',
      'format=yuv420p',
    ].join(','),
    '-an',
    '-c:v', 'libx264',
    '-preset', 'slow',
    '-crf', '13',
    '-r', String(outFps),
    '-movflags', '+faststart',
    outFile,
  ], `回封装 ${clip.key} -> 1080p${outFps}`);

  if (!keepFrames) {
    fs.rmSync(cache, { recursive: true, force: true });
  }
  return outFile;
}

function makeCompare(source, enhanced, out) {
  run(ffmpeg, [
    '-y',
    '-ss', '1.000',
    '-i', source,
    '-ss', '1.000',
    '-i', enhanced,
    '-filter_complex',
    '[0:v]scale=960:540:flags=lanczos[left];' +
    '[1:v]scale=960:540:flags=lanczos[right];' +
    '[left][right]hstack=inputs=2,format=yuv420p',
    '-frames:v', '1',
    out,
  ], `生成对比图 ${path.basename(out)}`);
}

function makeConcat(outputs) {
  const listPath = path.join(previewRoot, 'ai_upscale_concat_list.txt');
  const lines = outputs.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join('\n');
  fs.writeFileSync(listPath, `${lines}\n`);
  const out = path.join(previewRoot, '高帧率操作素材_AI超分_快速检查串联.mp4');
  run(ffmpeg, [
    '-y',
    '-f', 'concat',
    '-safe', '0',
    '-i', listPath,
    '-c', 'copy',
    out,
  ], '生成快速检查串联视频');
  return out;
}

function writeLog(outputs, extra = {}) {
  const rows = outputs.map((file) => {
    const v = probe(file);
    const rel = path.relative(cwd, file);
    const mb = (fs.statSync(file).size / 1024 / 1024).toFixed(1);
    return `| ${rel} | ${v.width}×${v.height} | ${v.avg_frame_rate || v.r_frame_rate} | ${Number(v.duration || 0).toFixed(3)}s | ${mb} MB |`;
  }).join('\n');
  const text = `# 高帧率版手动保存素材 AI 超分处理说明

- 输入目录：\`${path.relative(cwd, inputRoot)}\`
- 输出目录：\`${path.relative(cwd, outputRoot)}\`
- AI 工具：Real-ESRGAN ncnn Vulkan
- 模型：\`${aiModel}\`
- 处理方式：原始素材按 ${aiFps}fps 抽帧 → 缩放到 ${sourceScale} → AI x${aiScale} 超分 → 下采样封装为 1920×1080 / 60fps H.264。
- 帧率策略：本轮保持真实 60fps 抽帧处理，避免此前低帧率超分再插帧带来的 UI 拖影。
- 输出用途：后续正片操作演示段的高帧率高清素材替换源。
${extra.note ? `\n${extra.note}\n` : ''}

| 文件 | 分辨率 | 帧率 | 时长 | 大小 |
| --- | --- | --- | --- | --- |
${rows}
`;
  ensureDir(path.dirname(logPath));
  fs.writeFileSync(logPath, text);
}

async function main() {
  assertTools();
  ensureDir(outputRoot);
  ensureDir(previewRoot);
  ensureDir(cacheRoot);

  if (mode === 'test') {
    const clip = clips.find((x) => x.key === '02_场地定位') || clips[0];
    const out = processClip(clip, { test: true, duration: testSeconds });
    const compare = path.join(previewRoot, `${clip.key}_原始_vs_AI超分_对比.jpg`);
    makeCompare(clip.input, out, compare);
    writeLog([out], { note: `\n试跑文件：\`${path.relative(cwd, out)}\`\n对比图：\`${path.relative(cwd, compare)}\`\n` });
    console.log(`\n✅ 试跑完成：${out}`);
    console.log(`✅ 对比图：${compare}`);
    return;
  }

  if (mode === 'report') {
    const outputs = clips.map((clip) => clip.output).filter((file) => fs.existsSync(file));
    const concat = path.join(previewRoot, '高帧率操作素材_AI超分_快速检查串联.mp4');
    const compare = path.join(previewRoot, `02_场地定位_原始_vs_AI超分_对比.jpg`);
    if (fs.existsSync(clips[1].output)) makeCompare(clips[1].input, clips[1].output, compare);
    writeLog(fs.existsSync(concat) ? [...outputs, concat] : outputs, {
      note: `\n快速检查串联视频：\`${path.relative(cwd, concat)}\`\n对比图：\`${path.relative(cwd, compare)}\`\n`,
    });
    console.log(`\n✅ 已补写报告：${logPath}`);
    return;
  }

  const outputs = [];
  for (const clip of clips) {
    outputs.push(processClip(clip));
  }
  const concat = makeConcat(outputs);
  const compare = path.join(previewRoot, `02_场地定位_原始_vs_AI超分_对比.jpg`);
  makeCompare(clips[1].input, clips[1].output, compare);
  writeLog([...outputs, concat], { note: `\n快速检查串联视频：\`${path.relative(cwd, concat)}\`\n对比图：\`${path.relative(cwd, compare)}\`\n` });
  console.log(`\n✅ 全量 AI 超分完成：${outputRoot}`);
  console.log(`✅ 快速检查串联：${concat}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
