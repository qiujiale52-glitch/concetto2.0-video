import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const cwd = process.cwd();
const ffmpeg = path.join(cwd, '.tools/media-bin/node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg');
const ffprobe = path.join(cwd, '.tools/media-bin/node_modules/@ffprobe-installer/darwin-arm64/ffprobe');

const W = 1920;
const H = 1080;
const fps = 30;
const outDir = path.join(cwd, '06_预览输出', 'original_rhythm_v06_parts');
const fontRegular = path.join(cwd, '03-正版授权字体库/免费商用字体/思源黑体/NotoSansHans-Regular.otf');
const fontBold = path.join(cwd, '03-正版授权字体库/免费商用字体/思源黑体/NotoSansHans-Bold.otf');
const music = path.join(cwd, '04-正版授权音乐库', '未来科技宽广磅礴音乐15437.wav');

const original = path.join(cwd, 'concetto宣发原版视频.mp4');
const sourceList = path.join(outDir, 'concat_list_v07_prestrategy.txt');
const newPart = path.join(outDir, 'sec_04_graph_to_model_original_rhythm_v08.mp4');
const newList = path.join(outDir, 'concat_list_v08_graph_to_model.txt');
const videoOnly = path.join(outDir, 'video_concat_v08_graph_to_model.mp4');
const output = path.join(cwd, '06_预览输出', 'Concetto_2.0_图生模型素材修正_v08_低清.mp4');
const preview = path.join(cwd, '06_预览输出', 'Concetto_2.0_图生模型素材修正_v08_全片预览.jpg');
const sectionPreview = path.join(cwd, '06_预览输出', 'Concetto_2.0_图生模型素材修正_v08_图纸模型段预览.jpg');
const logPath = path.join(cwd, '03_脚本与结构', 'Concetto 2.0_图生模型素材修正_v08_说明.md');

function run(args, label) {
  const r = spawnSync(ffmpeg, args, { stdio: 'inherit' });
  if (r.status !== 0) throw new Error(`${label} failed with status ${r.status}`);
}

function probeDur(file) {
  const r = spawnSync(ffprobe, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nk=1:nw=1', file], { encoding: 'utf8' });
  const n = Number.parseFloat(r.stdout.trim());
  return Number.isFinite(n) ? n : 0;
}

function fp(p) {
  return p.replace(/:/g, '\\:');
}

function q(s) {
  return String(s)
    .replace(/\\/g, '\\\\')
    .replace(/:/g, '\\:')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n');
}

function quoteFile(p) {
  return p.replace(/'/g, "'\\''");
}

function renderGraphToModelPart() {
  // 原片 0:39.55–0:49.05 是“图生模型”完整表达：
  // 上传总平图入口 → 总图预览 → 一键生成 3D 模型 → 导入编辑。
  const start = 39.55;
  const dur = 9.5;
  const fReg = fp(fontRegular);
  const fBold = fp(fontBold);
  const filter = [
    `[0:v]setpts=PTS-STARTPTS,scale=1510:760:force_original_aspect_ratio=decrease,pad=1510:760:(ow-iw)/2:(oh-ih)/2:color=0x05040a,setsar=1,fps=${fps}[vid]`,
    `[1:v]format=yuv420p,drawbox=x=0:y=0:w=${W}:h=${H}:color=0x010104@1:t=fill,drawbox=x=0:y=0:w=${W}:h=${H}:color=0x171238@0.55:t=fill[bg]`,
    `[bg]drawbox=x=185:y=145:w=1550:h=820:color=0x7b6aff@0.20:t=2,drawbox=x=205:y=165:w=1510:h=780:color=0xffffff@0.035:t=fill[stage]`,
    `[stage][vid]overlay=x=205:y=190:format=auto[v0]`,
    `[v0]drawbox=x=205:y=190:w=1510:h=760:color=0x7668ff@0.14:t=2,drawbox=x=205:y=190:w=1510:h=760:color=0x010104@0.03:t=fill[v1]`,
    `[v1]drawtext=fontfile='${fReg}':text='04':x=900:y=73:fontsize=24:fontcolor=0x7d72e6:alpha=0.9,drawtext=fontfile='${fReg}':text='图纸模型':x=945:y=68:fontsize=39:fontcolor=0xf2f0ff:alpha=0.96,drawtext=fontfile='${fReg}':text='2D/3D设计图纸生成':x=(w-text_w)/2:y=124:fontsize=20:fontcolor=0xaaa2df:alpha=0.82,drawbox=x=110:y=103:w=290:h=1:color=0x7668ff@0.45:t=fill[v2]`,
    `[v2]drawtext=fontfile='${fReg}':text='CONCETTO 2.0 / GRAPH TO MODEL':x=1325:y=78:fontsize=17:fontcolor=0x8f86db:alpha=0.62[v3]`,
    `[v3]drawtext=fontfile='${fBold}':text='${q('上传总图，一键生成 3D 模型')}':x=(w-text_w)/2:y=880:fontsize=39:fontcolor=0xf4f1ff:shadowcolor=0x7767ff@0.55:shadowx=0:shadowy=0:alpha='if(lt(t,0.28),t/0.28,if(gt(t,6.55),max(0,(6.95-t)/0.4),0.96))'[v4]`,
    `[v4]drawtext=fontfile='${fBold}':text='${q('一键导入，即刻编辑')}':x=(w-text_w)/2:y=880:fontsize=39:fontcolor=0xf4f1ff:shadowcolor=0x7767ff@0.55:shadowx=0:shadowy=0:alpha='if(lt(t,6.55),0,if(lt(t,6.9),(t-6.55)/0.35,if(gt(t,9.15),max(0,(9.5-t)/0.35),0.96)))'[v5]`,
    `[v5]fade=t=in:st=0:d=0.18,fade=t=out:st=9.25:d=0.25[v]`,
  ].join(';');

  run([
    '-y',
    '-ss', String(start),
    '-t', String(dur),
    '-i', original,
    '-f', 'lavfi',
    '-t', String(dur),
    '-i', `color=c=0x010104:s=${W}x${H}:r=${fps}:d=${dur}`,
    '-filter_complex', filter,
    '-map', '[v]',
    '-an',
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '20',
    '-pix_fmt', 'yuv420p',
    '-r', String(fps),
    newPart,
  ], 'render graph-to-model v08 part');
}

function rebuildConcat() {
  const lines = fs.readFileSync(sourceList, 'utf8').trim().split(/\n+/);
  const outLines = [];
  for (const line of lines) {
    if (line.includes('sec_04_clip_00.mp4')) {
      outLines.push(`file '${quoteFile(newPart)}'`);
      continue;
    }
    if (line.includes('sec_04_clip_01.mp4') || line.includes('sec_04_card_02.mp4')) {
      continue;
    }
    outLines.push(line);
  }
  fs.writeFileSync(newList, outLines.join('\n') + '\n');

  run(['-y', '-f', 'concat', '-safe', '0', '-i', newList, '-c', 'copy', videoOnly], 'concat v08 video');
  const totalDur = probeDur(videoOnly);

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
  ], 'mux v08 music');

  run([
    '-y',
    '-i', output,
    '-vf', 'fps=0.28,scale=360:-1,tile=10x7',
    '-frames:v', '1',
    preview,
  ], 'render full preview');

  run([
    '-y',
    '-ss', '00:01:14',
    '-i', output,
    '-t', '00:00:18',
    '-vf', 'fps=1,scale=640:-1,tile=6x3',
    '-frames:v', '1',
    sectionPreview,
  ], 'render section preview');

  const partDur = probeDur(newPart);
  fs.writeFileSync(logPath, [
    '# Concetto 2.0 图生模型素材修正 v08',
    '',
    '本版只针对第 04「图纸模型 / 图生模型」段进行替换，其它段落沿用 v07。',
    '',
    `输出视频：\`${output}\``,
    `图纸模型段预览：\`${sectionPreview}\``,
    `全片预览：\`${preview}\``,
    `总时长：约 ${Math.floor(totalDur / 60)}:${String(Math.round(totalDur % 60)).padStart(2, '0')}`,
    '',
    '修改说明：',
    '',
    '- 参考宣发原片 0:39.55–0:49.05 的图生模型段；',
    '- 用原片同组动态素材替换当前 v07 中误混入的空场地建模/普通参数建模素材；',
    '- 保留原片节奏：上传总图入口 → 总图预览 → 一键生成 3D 模型 → 导入编辑；',
    '- 同步调整卖点文字：`上传总图，一键生成 3D 模型` / `一键导入，即刻编辑`；',
    '- 移除原来的 `sec_04_clip_00.mp4`、`sec_04_clip_01.mp4`、`sec_04_card_02.mp4`，改为单段原片节奏动态素材。',
    '',
    '替换文件：',
    '',
    `- 新段落：\`${newPart}\`（${partDur.toFixed(1)}s）`,
    `- 拼接清单：\`${newList}\``,
  ].join('\n'));

  return totalDur;
}

renderGraphToModelPart();
const totalDur = rebuildConcat();
console.log(`v08 done: ${output}`);
console.log(`duration: ${totalDur.toFixed(2)}s`);
