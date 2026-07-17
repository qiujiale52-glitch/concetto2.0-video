import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

// Concetto 2.0 v35 — unified, full-length production assembly.
// This is the single entry point for the currently approved opening, front matter,
// nine workflow chapters, operation/results timeline, and ending.

const cwd = process.cwd();
const ffmpeg = path.join(cwd, '.tools/media-bin/node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg');
const ffprobe = path.join(cwd, '.tools/media-bin/node_modules/@ffprobe-installer/darwin-arm64/ffprobe');
const music = path.join(cwd, '04-正版授权音乐库', '未来科技宽广磅礴音乐15437.wav');
const baseList = path.join(cwd, '06_预览输出', 'refined_v34_final_2560p60_parts', 'concat_list_v34_final_2560p60.txt');

const W = 2560;
const H = 1440;
const FPS = 60;
const TAG = process.env.OUT_TAG || 'v35_unified';
const FORCE_SEGMENT_RENDER = process.env.FORCE_SEGMENT_RENDER === '1';
const PREPARE_SEGMENTS = process.env.PREPARE_SEGMENTS !== '0';
const VALIDATE_ONLY = process.env.VALIDATE_ONLY === '1';

const outDir = path.join(cwd, '06_预览输出', `refined_${TAG}_final_2560p60_parts`);
const normalizedDir = path.join(outDir, 'normalized_2560p60_segments');
const listPath = path.join(outDir, `concat_list_${TAG}.txt`);
const normalizedList = path.join(outDir, `concat_list_${TAG}_normalized.txt`);
const videoOnly = path.join(outDir, `video_concat_${TAG}.mp4`);
const output = path.join(cwd, '06_预览输出', `Concetto_2.0_正片_${TAG}_2560p60.mp4`);
const preview = path.join(cwd, '06_预览输出', `Concetto_2.0_正片_${TAG}_全片预览.jpg`);
const logPath = path.join(cwd, '03_脚本与结构', `Concetto 2.0_${TAG}_完整正片生成说明.md`);

const latest = {
  opening: path.join(cwd, '开头', 'Concetto_2.0_开头登场视觉_v04_2点0震荡波_9s.mp4'),
  highlight: path.join(cwd, '06_预览输出', 'Concetto_2.0_升级亮点_分层独立呼吸_v05_2560p60.mp4'),
  workflow: path.join(cwd, '06_预览输出', 'Concetto_2.0_九大环节黑场浮现流光_按钮波纹_v02_2560p60.mp4'),
  end: path.join(cwd, '06_预览输出', 'Concetto_2.0_结尾字形蚀刻多层光_v02_2560p60.mp4'),
  chapter: (no) => path.join(cwd, '06_预览输出', 'chapter_covers_clean_v01_parts', `chapter_${no}_clean_v01_2560p60.mp4`),
};

const generators = [
  {
    name: '黑场升级亮点 2560p60',
    script: '.tools/render_concetto_highlights_black_reveal_v05.mjs',
    outputs: [latest.highlight],
    env: { RENDER_MODE: 'final' },
  },
  {
    name: '黑场九大环节总览 2560p60',
    script: '.tools/render_workflow_overview_dark_fx_v02.mjs',
    outputs: [latest.workflow],
    env: { RENDER_MODE: 'final' },
  },
  {
    name: '九个章节封面与顶部进度 2560p60',
    script: '.tools/render_concetto_chapter_covers_clean_v01.mjs',
    outputs: Array.from({ length: 9 }, (_, i) => latest.chapter(String(i + 1).padStart(2, '0'))),
    env: { RENDER_MODE: 'final', CHAPTERS: '01,02,03,04,05,06,07,08,09' },
  },
  {
    name: '字形蚀刻结尾 2560p60',
    script: '.tools/render_end_card_fx_v02.mjs',
    outputs: [latest.end],
    env: { RENDER_MODE: 'final' },
  },
];

function assertFile(file) {
  if (!fs.existsSync(file)) throw new Error(`missing file: ${file}`);
}

function run(bin, args, label, options = {}) {
  console.log(`\n▶ ${label}`);
  const result = spawnSync(bin, args, { stdio: 'inherit', ...options });
  if (result.status !== 0) throw new Error(`${label} failed with status ${result.status}`);
}

function capture(bin, args, label) {
  const result = spawnSync(bin, args, { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`${label} failed with status ${result.status}: ${result.stderr}`);
  return result.stdout.trim();
}

function quoteFile(file) { return file.replace(/'/g, "'\\''"); }
function safeBase(value) { return value.replace(/[^\p{L}\p{N}._-]+/gu, '_'); }

function readConcatList(file) {
  return fs.readFileSync(file, 'utf8')
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^file\s+'/, '').replace(/'$/, '').replace(/'\\''/g, "'"));
}

function probeDur(file) {
  const value = capture(ffprobe, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nk=1:nw=1', file], `probe duration ${path.basename(file)}`);
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function probeStream(file) {
  const value = capture(ffprobe, [
    '-v', 'error', '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height,avg_frame_rate,duration', '-of', 'json', file,
  ], `probe stream ${path.basename(file)}`);
  return JSON.parse(value).streams?.[0] || {};
}

function fpsValue(rate) {
  if (!rate || !rate.includes('/')) return Number(rate) || 0;
  const [a, b] = rate.split('/').map(Number);
  return b ? a / b : 0;
}

function prepareLatestSegments() {
  for (const item of generators) {
    const missing = item.outputs.some((file) => !fs.existsSync(file));
    if (!FORCE_SEGMENT_RENDER && !missing) {
      console.log(`✓ reuse ${item.name}`);
      continue;
    }
    const script = path.join(cwd, item.script);
    assertFile(script);
    run(process.execPath, [script], `render ${item.name}`, {
      cwd,
      env: { ...process.env, ...item.env },
    });
    item.outputs.forEach(assertFile);
  }
}

function replaceWithLatest(baseParts) {
  const audit = [];
  const parts = baseParts.map((file) => {
    const name = path.basename(file);
    let replacement = null;
    if (name === 'intro_opening_folder_direct_v16.mp4') replacement = latest.opening;
    else if (/^intro_highlight_/.test(name)) replacement = latest.highlight;
    else if (/^intro_workflow_overview_/.test(name)) replacement = latest.workflow;
    else if (/^end_card_/.test(name)) replacement = latest.end;
    else {
      const chapter = name.match(/^chapter_(\d{2})_v05_card_style\.mp4$/);
      if (chapter) replacement = latest.chapter(chapter[1]);
    }
    if (!replacement) return file;
    audit.push({ from: file, to: replacement });
    return replacement;
  });

  const expected = 13; // opening + highlight + workflow + 9 chapter covers + ending
  if (audit.length !== expected) {
    throw new Error(`latest segment replacement count mismatch: expected ${expected}, got ${audit.length}`);
  }
  return { parts, audit };
}

function normalizeSegment(file, index, total) {
  const normalized = path.join(normalizedDir, `${String(index + 1).padStart(2, '0')}_${safeBase(path.basename(file, path.extname(file)))}_2560p60.mp4`);
  let reusable = false;
  if (fs.existsSync(normalized)) {
    try {
      const sourceDuration = probeDur(file);
      const outputDuration = probeDur(normalized);
      const stream = probeStream(normalized);
      reusable = Math.abs(sourceDuration - outputDuration) < .08
        && Number(stream.width) === W
        && Number(stream.height) === H
        && Math.abs(fpsValue(stream.avg_frame_rate) - FPS) < .01;
    } catch {
      reusable = false;
    }
  }
  if (reusable) {
    console.log(`✓ reuse normalized ${index + 1}/${total}: ${path.basename(normalized)}`);
    return normalized;
  }

  run(ffmpeg, [
    '-y', '-fflags', '+genpts', '-i', file,
    '-vf', [
      `scale=${W}:${H}:force_original_aspect_ratio=decrease:flags=lanczos`,
      `pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:color=black`,
      `setsar=1,settb=AVTB,setpts=PTS-STARTPTS,fps=${FPS}`,
      'format=yuv420p',
    ].join(','),
    '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '12',
    '-pix_fmt', 'yuv420p', '-r', String(FPS), '-video_track_timescale', '60000',
    '-movflags', '+faststart', normalized,
  ], `normalize segment ${index + 1}/${total}`);
  return normalized;
}

function writeLog(parts, audit, stream) {
  const replacementRows = audit.map((row) => `| ${path.basename(row.from)} | ${path.relative(cwd, row.to)} |`).join('\n');
  fs.writeFileSync(logPath, [
    `# Concetto 2.0 ${TAG} 完整正片生成说明`, '',
    '- 单一入口脚本：`.tools/assemble_concetto_v35_unified_final.mjs`；',
    '- 正片输出：2560×1440、CFR 60fps、H.264 CRF 12；',
    '- 基于 v34 最终操作素材清单，操作演示、成果展示、交流会等顺序保持不变；',
    '- 统一接入 2.0 震荡开头、黑场升级亮点、黑场九大环节总览、九个顶部进度章节封面和字形蚀刻结尾；',
    '- 每个片段先独立重建 PTS/timebase 并标准化，再无损串接，避免混合帧率造成卡顿或时长塌缩；',
    '- 低清预览、临时帧和最终视频文件不进入轻量 Git 仓库。', '',
    `片段数：${parts.length}`,
    `输出：\`${output}\``,
    `视频流：${stream.width}×${stream.height} / ${stream.avg_frame_rate} / ${Number(stream.duration || 0).toFixed(3)}s`, '',
    '## 最新片段替换', '', '| 原片段 | 当前片段 |', '| --- | --- |', replacementRows, '',
  ].join('\n'));
}

function main() {
  [ffmpeg, ffprobe, music, baseList, latest.opening].forEach(assertFile);
  const baseParts = readConcatList(baseList);
  const { parts, audit } = replaceWithLatest(baseParts);

  if (VALIDATE_ONLY) {
    console.log(JSON.stringify({ tag: TAG, size: `${W}x${H}`, fps: FPS, parts: parts.length, replacements: audit.length }, null, 2));
    return;
  }

  if (PREPARE_SEGMENTS) prepareLatestSegments();
  parts.forEach(assertFile);
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(normalizedDir, { recursive: true });
  fs.writeFileSync(listPath, parts.map((file) => `file '${quoteFile(file)}'`).join('\n') + '\n');

  const normalizedParts = parts.map((file, index) => normalizeSegment(file, index, parts.length));
  fs.writeFileSync(normalizedList, normalizedParts.map((file) => `file '${quoteFile(file)}'`).join('\n') + '\n');

  run(ffmpeg, ['-y', '-f', 'concat', '-safe', '0', '-i', normalizedList, '-c', 'copy', '-movflags', '+faststart', videoOnly], `${TAG} normalized concat`);
  const duration = probeDur(videoOnly);
  run(ffmpeg, [
    '-y', '-i', videoOnly, '-stream_loop', '-1', '-i', music,
    '-filter_complex', `[1:a]atrim=0:${duration.toFixed(3)},afade=t=in:st=0:d=1.2,afade=t=out:st=${Math.max(0, duration - 3).toFixed(3)}:d=3,volume=0.72[a]`,
    '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k',
    '-movflags', '+faststart', '-shortest', output,
  ], `${TAG} mux music`);

  run(ffmpeg, ['-y', '-i', output, '-vf', 'fps=0.20,scale=420:-1,tile=10x6', '-frames:v', '1', preview], `${TAG} contact sheet`);
  const stream = probeStream(output);
  if (Number(stream.width) !== W || Number(stream.height) !== H || Math.abs(fpsValue(stream.avg_frame_rate) - FPS) > .01) {
    throw new Error(`final stream verification failed: ${JSON.stringify(stream)}`);
  }
  writeLog(parts, audit, stream);
  console.log(`DONE ${output}`);
}

main();
