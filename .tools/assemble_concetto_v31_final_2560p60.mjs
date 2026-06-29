import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const cwd = process.cwd();
const ffmpeg = path.join(cwd, '.tools/media-bin/node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg');
const ffprobe = path.join(cwd, '.tools/media-bin/node_modules/@ffprobe-installer/darwin-arm64/ffprobe');
const music = path.join(cwd, '04-正版授权音乐库', '未来科技宽广磅礴音乐15437.wav');

const W = 2560;
const H = 1440;
const FPS = 60;
const tag = process.env.OUT_TAG || 'v31';

const v30List = process.env.BASE_LIST
  ? path.resolve(cwd, process.env.BASE_LIST)
  : path.join(cwd, '06_预览输出', 'refined_v30_highlight_richer_fx_parts', 'concat_list_v30.txt');
const opsDir = process.env.OPS_DIR
  ? path.resolve(cwd, process.env.OPS_DIR)
  : path.join(cwd, '06_预览输出', 'refined_v31_final_2560p60_parts', 'ops');
const outDir = path.join(cwd, '06_预览输出', `refined_${tag}_final_2560p60_parts`);
const listPath = path.join(outDir, `concat_list_${tag}_final_2560p60.txt`);
const normalizedDir = path.join(outDir, 'normalized_2560p60_segments');
const normalizedListPath = path.join(outDir, `concat_list_${tag}_final_2560p60_normalized.txt`);
const videoOnly = path.join(outDir, `video_concat_${tag}_final_2560p60.mp4`);
const output = path.join(cwd, '06_预览输出', `Concetto_2.0_正片_${tag}_2560p60.mp4`);
const preview = path.join(cwd, '06_预览输出', `Concetto_2.0_正片_${tag}_2560p60_全片预览.jpg`);
const opPreview = path.join(cwd, '06_预览输出', `Concetto_2.0_正片_${tag}_2560p60_操作段预览.jpg`);
const frontPreview = path.join(cwd, '06_预览输出', `Concetto_2.0_正片_${tag}_2560p60_前置段预览.jpg`);
const logPath = path.join(cwd, '03_脚本与结构', `Concetto 2.0_${tag}_2560p60正片生成说明.md`);

const replacements = new Map([
  ['sec_01_operation_ai_x4.mp4', 'sec_01_operation_ai_x4_1440p60.mp4'],
  ['sec_02_operation_ai_x4.mp4', 'sec_02_operation_ai_x4_1440p60.mp4'],
  ['sec_03_operation_ai_x4.mp4', 'sec_03_operation_ai_x4_1440p60.mp4'],
  ['sec_04_operation_ai_x4.mp4', 'sec_04_operation_ai_x4_1440p60.mp4'],
  ['sec_05_operation_normal_ai_x4.mp4', 'sec_05_operation_normal_ai_x4_1440p60.mp4'],
  ['sec_05_operation_suite_ai_x4.mp4', 'sec_05_operation_suite_ai_x4_1440p60.mp4'],
  ['sec_06_operation_ai_x4.mp4', 'sec_06_operation_ai_x4_1440p60.mp4'],
  ['sec_07_operation_ai_x4.mp4', 'sec_07_operation_ai_x4_1440p60.mp4'],
  ['sec_08_operation_ai_x4.mp4', 'sec_08_operation_ai_x4_1440p60.mp4'],
  ['sec_09_text_generation_with_title_v22.mp4', 'sec_09_text_generation_with_title_1440p60.mp4'],
]);

function assertFile(p) {
  if (!fs.existsSync(p)) throw new Error(`missing file: ${p}`);
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

function quoteFile(p) {
  return p.replace(/'/g, "'\\''");
}

function readConcatList(file) {
  return fs.readFileSync(file, 'utf8')
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^file\s+'/, '').replace(/'$/, '').replace(/'\\''/g, "'"));
}

function probeDur(file) {
  const out = capture(ffprobe, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nk=1:nw=1', file], `probe ${file}`);
  const n = Number.parseFloat(out);
  return Number.isFinite(n) ? n : 0;
}

function probeStream(file) {
  const out = capture(ffprobe, [
    '-v', 'error',
    '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height,avg_frame_rate,duration',
    '-of', 'json',
    file,
  ], `probe stream ${file}`);
  return JSON.parse(out).streams?.[0] || {};
}

function safeBase(s) {
  return s.replace(/[^\p{L}\p{N}._-]+/gu, '_');
}

function fpsValue(rate) {
  if (!rate || !rate.includes('/')) return Number(rate) || 0;
  const [a, b] = rate.split('/').map(Number);
  return b ? a / b : 0;
}

function buildParts() {
  const baseParts = readConcatList(v30List);
  const rows = [];
  const parts = baseParts.map((p) => {
    const name = path.basename(p);
    const next = replacements.get(name);
    if (!next) return p;
    const np = path.join(opsDir, next);
    assertFile(np);
    rows.push({ from: p, to: np });
    return np;
  });
  return { parts, rows };
}

function main() {
  for (const p of [ffmpeg, ffprobe, music, v30List]) assertFile(p);
  fs.mkdirSync(outDir, { recursive: true });

  const { parts, rows } = buildParts();
  fs.writeFileSync(listPath, parts.map((p) => `file '${quoteFile(p)}'`).join('\n') + '\n');
  fs.mkdirSync(normalizedDir, { recursive: true });

  // Normalize every segment independently before concatenation. This avoids concat-level
  // timestamp collisions from mixed 30/60fps sources, which can otherwise collapse the full edit.
  const normalizedParts = [];
  parts.forEach((p, i) => {
    const out = path.join(normalizedDir, `${String(i + 1).padStart(2, '0')}_${safeBase(path.basename(p, path.extname(p)))}_2560p60.mp4`);
    let reusable = false;
    if (fs.existsSync(out)) {
      try {
        const srcDur = probeDur(p);
        const outDur = probeDur(out);
        const st = probeStream(out);
        reusable = Math.abs(srcDur - outDur) < 0.08
          && Number(st.width) === W
          && Number(st.height) === H
          && Math.abs(fpsValue(st.avg_frame_rate) - FPS) < 0.01;
      } catch {
        reusable = false;
      }
    }
    if (!reusable) {
      run(ffmpeg, [
        '-y',
        '-fflags', '+genpts',
        '-i', p,
        '-vf',
        [
          `scale=${W}:${H}:force_original_aspect_ratio=decrease:flags=lanczos`,
          `pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:color=black`,
          `setsar=1,settb=AVTB,setpts=PTS-STARTPTS,fps=${FPS}`,
          'format=yuv420p',
        ].join(','),
        '-an',
        '-c:v', 'libx264',
        '-preset', 'medium',
        '-crf', '12',
        '-pix_fmt', 'yuv420p',
        '-r', String(FPS),
        '-video_track_timescale', '60000',
        '-movflags', '+faststart',
        out,
      ], `normalize segment ${String(i + 1).padStart(2, '0')}/${parts.length}`);
    } else {
      console.log(`skip normalized segment ${String(i + 1).padStart(2, '0')}/${parts.length}: ${path.basename(out)}`);
    }
    normalizedParts.push(out);
  });

  fs.writeFileSync(normalizedListPath, normalizedParts.map((p) => `file '${quoteFile(p)}'`).join('\n') + '\n');

  run(ffmpeg, [
    '-y',
    '-f', 'concat',
    '-safe', '0',
    '-i', normalizedListPath,
    '-c', 'copy',
    '-movflags', '+faststart',
    videoOnly,
  ], `${tag} 2560p60 normalized concat`);

  const totalDur = probeDur(videoOnly);
  run(ffmpeg, [
    '-y',
    '-i', videoOnly,
    '-stream_loop', '-1',
    '-i', music,
    '-filter_complex', `[1:a]atrim=0:${totalDur.toFixed(3)},afade=t=in:st=0:d=1.2,afade=t=out:st=${Math.max(0, totalDur - 3).toFixed(3)}:d=3,volume=0.72[a]`,
    '-map', '0:v',
    '-map', '[a]',
    '-c:v', 'copy',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-movflags', '+faststart',
    '-shortest',
    output,
  ], `${tag} mux music`);

  run(ffmpeg, ['-y', '-i', output, '-vf', 'fps=0.20,scale=420:-1,tile=10x6', '-frames:v', '1', preview], `${tag} full preview`);
  run(ffmpeg, ['-y', '-ss', '00:00:00', '-i', output, '-t', '00:00:45', '-vf', 'fps=1,scale=520:-1,tile=9x5', '-frames:v', '1', frontPreview], `${tag} front preview`);
  run(ffmpeg, ['-y', '-ss', '00:00:38', '-i', output, '-t', '00:02:10', '-vf', 'fps=0.5,scale=520:-1,tile=10x7', '-frames:v', '1', opPreview], `${tag} operation preview`);

  const stream = probeStream(output);
  const replaceRows = rows.map((r) => `| ${path.basename(r.from)} | ${path.relative(cwd, r.to)} |`).join('\n');
  fs.writeFileSync(logPath, [
    `# Concetto 2.0 ${tag} 2560p60 正片生成说明`,
    '',
    '- 基于 v30 已确认视觉版本的分段清单；',
    '- 仅替换操作演示相关素材引用，其他片段顺序与视觉逻辑保持不变；',
    `- 操作演示引用 ${tag} 正片级 4x 超分/修复 1440p60 片段；`,
    '- 输出阶段先逐段统一 CFR 60fps、2560×1440、H.264 CRF 12，再串接，避免混合片段 timebase/PTS 造成全片压缩或卡顿；',
    '- 音频重新铺底并使用 192kbps AAC。',
    '',
    `输出视频：\`${output}\``,
    `视频流：${stream.width}×${stream.height} / ${stream.avg_frame_rate} / ${Number(stream.duration || 0).toFixed(3)}s`,
    `操作段预览：\`${opPreview}\``,
    '',
    '## 素材引用替换',
    '',
    '| 原 basename | 新素材 |',
    '| --- | --- |',
    replaceRows,
    '',
  ].join('\n'));

  console.log(`DONE ${output}`);
}

main();
