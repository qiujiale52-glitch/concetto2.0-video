import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const cwd = process.cwd();
const ffmpeg = path.join(cwd, '.tools/media-bin/node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg');
const ffprobe = path.join(cwd, '.tools/media-bin/node_modules/@ffprobe-installer/darwin-arm64/ffprobe');

const inputRoot = path.join(cwd, '高帧率版手动保存素材');
const outputRoot = path.join(cwd, '06_预览输出', '高帧率版手动保存素材_清晰化_1080p60');
const previewDir = path.join(outputRoot, '_预览');
const logPath = path.join(cwd, '03_脚本与结构', '高帧率版手动保存素材_60fps清晰化处理说明.md');

const targetW = 1920;
const targetH = 1080;
const fps = 60;

fs.mkdirSync(outputRoot, { recursive: true });
fs.mkdirSync(previewDir, { recursive: true });

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

function probe(file) {
  const raw = runCapture(ffprobe, [
    '-v', 'error',
    '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height,r_frame_rate,avg_frame_rate,duration,codec_name,pix_fmt',
    '-of', 'json',
    file,
  ], `probe ${file}`);
  const stream = JSON.parse(raw).streams?.[0] || {};
  return stream;
}

function probeDuration(file) {
  const out = runCapture(ffprobe, [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=nk=1:nw=1',
    file,
  ], `probe duration ${file}`);
  const n = Number.parseFloat(out);
  return Number.isFinite(n) ? n : 0;
}

function listVideos() {
  const out = [];
  function walk(dir) {
    for (const name of fs.readdirSync(dir)) {
      if (name.startsWith('.')) continue;
      const p = path.join(dir, name);
      const st = fs.statSync(p);
      if (st.isDirectory()) walk(p);
      else if (/\.(mov|mp4|m4v|avi)$/i.test(name)) out.push(p);
    }
  }
  walk(inputRoot);
  return out.sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'));
}

function safeName(s) {
  return s.replace(/[\\/:"*?<>|]/g, '_');
}

function relToOut(input) {
  const rel = path.relative(inputRoot, input);
  const dir = path.dirname(rel);
  const base = path.basename(rel, path.extname(rel));
  const outDir = path.join(outputRoot, dir);
  fs.mkdirSync(outDir, { recursive: true });
  return path.join(outDir, `${safeName(base)}_清晰化_1080p60.mp4`);
}

function quoteFile(p) {
  return p.replace(/'/g, "'\\''");
}

function processOne(input) {
  const output = relToOut(input);
  const vf = [
    // High quality 2K→1080p downsample. Keeps UI edges clean before light enhancement.
    `scale=${targetW}:${targetH}:force_original_aspect_ratio=decrease:flags=lanczos`,
    `pad=${targetW}:${targetH}:(ow-iw)/2:(oh-ih)/2:color=white`,
    'setsar=1',
    `fps=${fps}`,
    // Gentle sharpening only; avoids ringing around UI text.
    'unsharp=5:5:0.42:3:3:0.16',
    // Mild UI-friendly lift, not a stylized grade.
    'eq=contrast=1.035:saturation=1.018:brightness=0.002',
    'format=yuv420p',
  ].join(',');

  run(ffmpeg, [
    '-y',
    '-i', input,
    '-vf', vf,
    '-an',
    '-c:v', 'libx264',
    '-preset', 'slow',
    '-crf', '14',
    '-pix_fmt', 'yuv420p',
    '-r', String(fps),
    '-movflags', '+faststart',
    output,
  ], `process ${path.relative(cwd, input)}`);

  return output;
}

function previewOne(input, output) {
  const label = safeName(path.basename(path.dirname(input)) || path.basename(input));
  const dur = Math.max(0.1, probeDuration(output));
  const at = Math.max(0, Math.min(dur * 0.45, dur - 0.05));
  const compare = path.join(previewDir, `${label}_前后对比.jpg`);
  run(ffmpeg, [
    '-y',
    '-ss', at.toFixed(3),
    '-i', input,
    '-ss', at.toFixed(3),
    '-i', output,
    '-filter_complex',
    `[0:v]scale=960:540:flags=lanczos,setsar=1[left];[1:v]scale=960:540:flags=lanczos,setsar=1[right];[left][right]hstack=inputs=2[v]`,
    '-map', '[v]',
    '-frames:v', '1',
    compare,
  ], `preview ${label}`);
  return compare;
}

function contactSheet(outputs) {
  const list = path.join(previewDir, 'processed_list.txt');
  fs.writeFileSync(list, outputs.map((p) => `file '${quoteFile(p)}'`).join('\n') + '\n');
  const concat = path.join(previewDir, '高帧率清晰化素材_快速检查串联.mp4');
  run(ffmpeg, [
    '-y',
    '-f', 'concat',
    '-safe', '0',
    '-i', list,
    '-vf', `scale=${targetW}:${targetH},fps=${fps},format=yuv420p`,
    '-an',
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-crf', '20',
    '-pix_fmt', 'yuv420p',
    '-r', String(fps),
    concat,
  ], 'concat processed quick check');
  const sheet = path.join(previewDir, '高帧率清晰化素材_抽帧总览.jpg');
  run(ffmpeg, [
    '-y',
    '-i', concat,
    '-vf', 'fps=1,scale=480:-1,tile=5x4',
    '-frames:v', '1',
    sheet,
  ], 'processed contact sheet');
  return { concat, sheet };
}

async function main() {
  for (const p of [ffmpeg, ffprobe, inputRoot]) assertFile(p);
  const inputs = listVideos();
  if (inputs.length === 0) throw new Error(`没有找到视频素材：${inputRoot}`);

  const rows = [];
  const outputs = [];
  const previews = [];

  for (const input of inputs) {
    const before = probe(input);
    const output = processOne(input);
    const after = probe(output);
    const preview = previewOne(input, output);
    outputs.push(output);
    previews.push(preview);
    rows.push({ input, output, before, after, preview });
  }

  const { concat, sheet } = contactSheet(outputs);

  const lines = [
    '# 高帧率版手动保存素材 60fps 清晰化处理说明',
    '',
    `输入目录：\`${inputRoot}\``,
    `输出目录：\`${outputRoot}\``,
    '',
    '处理规格：',
    '',
    '- 输出：1920×1080，60fps，H.264，yuv420p，无音频；',
    '- 原始素材均为 2560×1440 / 60fps，本次采用 Lanczos 高质量降采样到正片工作规格；',
    '- 做轻度 UI 锐化、轻微对比度与饱和度整理，避免过度 AI 超分造成文字伪影；',
    '- 原始素材不覆盖，全部输出到独立文件夹，后续正片可直接引用。',
    '',
    `快速检查串联视频：\`${concat}\``,
    `抽帧总览：\`${sheet}\``,
    '',
    '| 环节/素材 | 输入规格 | 输出规格 | 输出文件 |',
    '| --- | --- | --- | --- |',
  ];
  for (const r of rows) {
    const name = path.relative(inputRoot, r.input);
    const inSpec = `${r.before.width}×${r.before.height}, ${r.before.avg_frame_rate || r.before.r_frame_rate}, ${Number.parseFloat(r.before.duration || 0).toFixed(2)}s`;
    const outSpec = `${r.after.width}×${r.after.height}, ${r.after.avg_frame_rate || r.after.r_frame_rate}, ${Number.parseFloat(r.after.duration || 0).toFixed(2)}s`;
    lines.push(`| ${name} | ${inSpec} | ${outSpec} | \`${r.output}\` |`);
  }
  lines.push('', '前后对比图：', '');
  for (const p of previews) lines.push(`- \`${p}\``);
  lines.push('');
  fs.writeFileSync(logPath, lines.join('\n'));

  console.log(`DONE ${outputRoot}`);
  console.log(`LOG ${logPath}`);
  console.log(`SHEET ${sheet}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
