import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const cwd = process.cwd();
const ffmpeg = path.join(cwd, '.tools/media-bin/node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg');
const ffprobe = path.join(cwd, '.tools/media-bin/node_modules/@ffprobe-installer/darwin-arm64/ffprobe');
const outDir = path.join(cwd, '06_预览输出', 'manual_materials_v10_parts');
fs.mkdirSync(outDir, { recursive: true });

const v09Dir = path.join(cwd, '06_预览输出', 'manual_materials_v09_parts');
const baseIntro = path.join(cwd, '06_预览输出', 'Concetto_2.0_开头升级工作流前策_v02_38s.mp4');
const workflow = path.join(cwd, '06_预览输出', 'Concetto_2.0_九环节总览_原版局部重排_v10.jpg');
const music = path.join(cwd, '04-正版授权音乐库', '未来科技宽广磅礴音乐15437.wav');

const intro = path.join(outDir, 'intro_v10_old_opening_corrected_workflow.mp4');
const videoOnly = path.join(outDir, 'video_concat_v10.mp4');
const concatList = path.join(outDir, 'concat_list.txt');
const output = path.join(cwd, '06_预览输出', 'Concetto_2.0_手动素材重排_v10_低清.mp4');
const preview = path.join(cwd, '06_预览输出', 'Concetto_2.0_手动素材重排_v10_全片预览.jpg');
const workflowPreview = path.join(cwd, '06_预览输出', 'Concetto_2.0_九环节总览_原版局部重排_v10.jpg');
const logPath = path.join(cwd, '03_脚本与结构', 'Concetto 2.0_手动素材重排_v10_说明.md');

function run(args, label) {
  const r = spawnSync(ffmpeg, args, { stdio: 'inherit' });
  if (r.status !== 0) throw new Error(`${label} failed with status ${r.status}`);
}

function ffprobeDur(file) {
  const r = spawnSync(ffprobe, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', file], { encoding: 'utf8' });
  const n = Number.parseFloat(r.stdout.trim());
  return Number.isFinite(n) ? n : 0;
}

function quoteFile(p) {
  return p.replace(/'/g, "'\\''");
}

function assertFile(p) {
  if (!fs.existsSync(p)) throw new Error(`missing file: ${p}`);
}

assertFile(baseIntro);
assertFile(workflow);
assertFile(music);

// 片头沿用此前较好的黑场登场与旧版前导序列；只在九环节总览出现的时间段覆盖修正版原版图。
run([
  '-y',
  '-i', baseIntro,
  '-loop', '1',
  '-t', '38',
  '-i', workflow,
  '-filter_complex',
  [
    `[1:v]scale=1380:776,format=rgba,fade=t=in:st=25.25:d=0.45:alpha=1,fade=t=out:st=32.0:d=0.45:alpha=1[wf]`,
    `[0:v][wf]overlay=x=270:y=186:enable='between(t,25.25,32.45)'[v]`,
  ].join(';'),
  '-map', '[v]',
  '-an',
  '-c:v', 'libx264',
  '-preset', 'medium',
  '-crf', '20',
  '-pix_fmt', 'yuv420p',
  '-r', '30',
  intro,
], 'render v10 intro');

const v09List = fs.readFileSync(path.join(v09Dir, 'concat_list.txt'), 'utf8')
  .split(/\r?\n/)
  .filter(Boolean)
  .map((line) => line.replace(/^file '/, '').replace(/'$/, ''));

const bodyParts = v09List.slice(1);
const parts = [intro, ...bodyParts];
fs.writeFileSync(concatList, parts.map((p) => `file '${quoteFile(p)}'`).join('\n') + '\n');

run(['-y', '-f', 'concat', '-safe', '0', '-i', concatList, '-c', 'copy', videoOnly], 'concat v10');
const totalDur = ffprobeDur(videoOnly);

run([
  '-y',
  '-i', videoOnly,
  '-stream_loop', '-1',
  '-i', music,
  '-filter_complex', `[1:a]atrim=0:${totalDur.toFixed(3)},afade=t=in:st=0:d=1.2,afade=t=out:st=${Math.max(0, totalDur - 3).toFixed(3)}:d=3,volume=0.72[a]`,
  '-map', '0:v',
  '-map', '[a]',
  '-c:v', 'copy',
  '-c:a', 'aac',
  '-b:a', '160k',
  '-shortest',
  output,
], 'mux v10 music');

run(['-y', '-i', output, '-vf', 'fps=0.25,scale=360:-1,tile=10x6', '-frames:v', '1', preview], 'preview v10');

fs.writeFileSync(logPath, [
  '# Concetto 2.0 手动素材重排 v10',
  '',
  '本版针对用户反馈做最小改动：',
  '',
  '- 片头还原为此前较好的黑场 CONCETTO 登场与旧前导序列；',
  '- 升级亮点、更新内容等现成图片素材不再重绘，不替换其字体；',
  '- 九环节总览以原版图片为底，只局部覆盖节点标题/说明来调整顺序，背景、弧线、底部按钮与整体版式保持；',
  '- v09 后半段的章节与手动保存素材操作演示继续复用，新加文字仍使用统一字体方案。',
  '',
  `输出视频：\`${output}\``,
  `九环节总览修正版：\`${workflowPreview}\``,
  `全片预览：\`${preview}\``,
  `总时长：约 ${Math.floor(totalDur / 60)}:${String(Math.round(totalDur % 60)).padStart(2, '0')}`,
].join('\n'));

console.log(`v10 done: ${output}`);
console.log(`duration: ${totalDur.toFixed(2)}s`);
