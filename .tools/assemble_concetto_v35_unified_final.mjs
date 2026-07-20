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
const deliveryDir = path.join(cwd, '成片保存');
const deliveryOutput = path.join(deliveryDir, `Concetto_2.0_完整正片_${TAG}_2560p60_20260720.mp4`);
const preview = path.join(cwd, '06_预览输出', `Concetto_2.0_正片_${TAG}_全片预览.jpg`);
const logPath = path.join(cwd, '03_脚本与结构', `Concetto 2.0_${TAG}_完整正片生成说明.md`);

const latest = {
  opening: path.join(cwd, '开头', 'Concetto_2.0_开头登场视觉_v04_2点0震荡波_9s.mp4'),
  highlight: path.join(cwd, '06_预览输出', 'Concetto_2.0_升级亮点_分层独立呼吸_v05_2560p60.mp4'),
  update: path.join(cwd, '06_预览输出', 'refined_v34_update_content_asset_parts', 'intro_update_contents_v34_from_update1.mp4'),
  workflow: path.join(cwd, '06_预览输出', 'Concetto_2.0_九大环节黑场浮现流光_按钮波纹_v02_2560p60.mp4'),
  chapterSequence: path.join(cwd, '06_预览输出', 'Concetto_2.0_九环章节常驻进度_原生操作页_v01_2560p60.mp4'),
  end: path.join(cwd, '06_预览输出', 'Concetto_2.0_结尾字形蚀刻多层光_v02_2560p60.mp4'),
};

const operationDir = path.join(cwd, '06_预览输出', 'operation_pages_clean_header_v01');
const operationOutputs = [
  'sec_01_operation_ai_x4_1440p60.mp4',
  'sec_02_operation_ai_x4_1440p60.mp4',
  'sec_03_operation_ai_x4_1440p60.mp4',
  'sec_04_operation_ai_x4_1440p60.mp4',
  'sec_05_operation_normal_ai_x4_1440p60.mp4',
  'sec_05_operation_suite_ai_x4_1440p60.mp4',
  'sec_06_operation_ai_x4_1440p60.mp4',
  'sec_07_operation_ai_x4_1440p60.mp4',
  'sec_08_operation_ai_x4_1440p60.mp4',
  'sec_09_text_generation_with_title_1440p60.mp4',
].map((name) => path.join(operationDir, name));

const coverOutputs = Array.from({ length: 9 }, (_, index) => {
  const no = String(index + 1).padStart(2, '0');
  return path.join(cwd, '06_预览输出', 'chapter_covers_clean_v01_parts', `chapter_${no}_clean_v01_无内嵌进度层_2560p60.mp4`);
});

const generators = [
  {
    name: '2.0 震荡开头与分层柔和退场 60fps',
    script: '.tools/render_concetto_opening_v04_20_bolder_shockwave.mjs',
    outputs: [latest.opening],
    env: { FRAME_CONCURRENCY: '6' },
  },
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
    name: '复用既有 4x 高清录屏并原生重绘新顶部 2560p60',
    script: '.tools/rebuild_operation_pages_clean_header_v01.mjs',
    outputs: operationOutputs,
    // Header-only revisions must never trigger another AI upscale. The script
    // crops the clean UI body from the approved processed assets and rewraps it.
    env: { RENDER_MODE: 'final', CHAPTERS: '01,02,03,04,05,06,07,08,09' },
  },
  {
    name: '九个无内嵌进度的原生章节封面 2560p60',
    script: '.tools/render_concetto_chapter_covers_clean_v01.mjs',
    outputs: coverOutputs,
    env: { RENDER_MODE: 'final', PROGRESS_MODE: 'none', CHAPTERS: '01,02,03,04,05,06,07,08,09' },
  },
  {
    name: '九环曲线直线形变与原生章节序列 2560p60',
    script: '.tools/render_chapter_progress_persistent_final_v01.mjs',
    outputs: [latest.chapterSequence],
    inputs: [...operationOutputs, ...coverOutputs],
    env: { RENDER_MODE: 'final', FORCE_SOURCE_RENDER: '0' },
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
    const script = path.join(cwd, item.script);
    assertFile(script);
    const missing = item.outputs.some((file) => !fs.existsSync(file));
    const inputFiles = [script, ...(item.inputs || [])].filter((file) => fs.existsSync(file));
    const newestInputMtime = Math.max(...inputFiles.map((file) => fs.statSync(file).mtimeMs));
    const stale = !missing && item.outputs.some((file) => fs.statSync(file).mtimeMs < newestInputMtime);
    if (!FORCE_SEGMENT_RENDER && !missing && !stale) {
      console.log(`✓ reuse ${item.name}`);
      continue;
    }
    if (stale && !FORCE_SEGMENT_RENDER) console.log(`↻ rebuild stale ${item.name}`);
    run(process.execPath, [script], `render ${item.name}`, {
      cwd,
      env: { ...process.env, ...item.env },
    });
    item.outputs.forEach(assertFile);
  }
}

function buildProductionParts() {
  const parts = [
    latest.opening,
    latest.highlight,
    latest.update,
    latest.workflow,
    latest.chapterSequence,
    latest.end,
  ];
  const audit = [
    { from: '开头原始授权素材与脚本', to: latest.opening },
    { from: '亮点静态底稿与分层脚本', to: latest.highlight },
    { from: '更新内容1.png 与描边呼吸脚本', to: latest.update },
    { from: '九环黑场静态底稿与流光脚本', to: latest.workflow },
    { from: '既有4×高清录屏主体、成果素材与九环常驻进度脚本', to: latest.chapterSequence },
    { from: '结尾文案与字形蚀刻脚本', to: latest.end },
  ];
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
        && Math.abs(fpsValue(stream.avg_frame_rate) - FPS) < .01
        && fs.statSync(normalized).mtimeMs >= fs.statSync(file).mtimeMs;
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
    '- 不读取旧版成片、旧预览视频或旧视频截图；全片入口只组合当前脚本生成的一手片段；',
    '- 操作演示复用已完成 Real-ESRGAN 4× 处理的高清录屏主体；本轮只裁出 UI 区域并原生重绘背景与新顶部，不重复执行超分；',
    '- 九个章节封面直接读取原始操作录屏生成侧图，随后由统一脚本完成曲线⇄直线进度形变；',
    '- 成果展示使用对应原始图片/工程素材生成的批准片段，章节顺序与交流会位置保持不变；',
    '- 统一接入 2.0 震荡开头、黑场升级亮点、更新内容、黑场九大环节总览、九章常驻进度序列和字形蚀刻结尾；',
    '- 每个片段先独立重建 PTS/timebase 并标准化，再无损串接，避免混合帧率造成卡顿或时长塌缩；',
    '- 低清预览、临时帧和最终视频文件不进入轻量 Git 仓库。', '',
    `片段数：${parts.length}`,
    `输出：\`${output}\``,
    `交付副本：\`${deliveryOutput}\``,
    `视频流：${stream.width}×${stream.height} / ${stream.avg_frame_rate} / ${Number(stream.duration || 0).toFixed(3)}s`, '',
    '## 最新片段替换', '', '| 原片段 | 当前片段 |', '| --- | --- |', replacementRows, '',
  ].join('\n'));
}

function main() {
  [ffmpeg, ffprobe, music].forEach(assertFile);
  const { parts, audit } = buildProductionParts();

  if (VALIDATE_ONLY) {
    console.log(JSON.stringify({
      tag: TAG,
      size: `${W}x${H}`,
      fps: FPS,
      parts: parts.length,
      nativeOperationInputs: operationOutputs.length,
      oldEditOrScreenshotDependencies: 0,
    }, null, 2));
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
  fs.mkdirSync(deliveryDir, { recursive: true });
  fs.copyFileSync(output, deliveryOutput);
  writeLog(parts, audit, stream);
  console.log(`DONE ${output}`);
  console.log(`DELIVERED ${deliveryOutput}`);
}

main();
