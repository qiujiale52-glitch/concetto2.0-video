import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const cwd = process.cwd();
const ffmpeg = path.join(cwd, '.tools/media-bin/node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg');
const ffprobe = path.join(cwd, '.tools/media-bin/node_modules/@ffprobe-installer/darwin-arm64/ffprobe');
const outDir = path.join(cwd, '06_预览输出', 'original_rhythm_v06_parts');
fs.mkdirSync(outDir, { recursive: true });

const W = 1920;
const H = 1080;
const fps = 30;
const fontRegular = path.join(cwd, '03-正版授权字体库/免费商用字体/思源黑体/NotoSansHans-Regular.otf');
const fontBold = path.join(cwd, '03-正版授权字体库/免费商用字体/思源黑体/NotoSansHans-Bold.otf');
const music = path.join(cwd, '04-正版授权音乐库', '未来科技宽广磅礴音乐15437.wav');
const introBase = path.join(cwd, '06_预览输出/chapter_intro_v05_parts/intro_base_no_front_card.mp4');
const chapter = (no) => path.join(cwd, '06_预览输出/chapter_intro_v05_parts', `chapter_${String(no).padStart(2, '0')}.mp4`);
const local = (p) => path.join(cwd, 'CC 2.0宣发/Resources/local', p);

const output = path.join(cwd, '06_预览输出', 'Concetto_2.0_九环节原片节奏重排样片_v06_低清.mp4');
const preview = path.join(cwd, '06_预览输出', 'Concetto_2.0_九环节原片节奏重排样片_v06_全片预览.jpg');
const logPath = path.join(cwd, '03_脚本与结构', 'Concetto 2.0_九环节原片节奏重排样片_v06_说明.md');

const sections = [
  {
    no: '01',
    title: '前策分析',
    sub: '目标设定与需求分析',
    clips: [
      { src: '2c8f6c525a9714147f7b595ae71420af.mp4', start: 4, dur: 20, speed: 3.2, feature: '输入任务，自动拆解需求' },
      { src: '2c8f6c525a9714147f7b595ae71420af.mp4', start: 24, dur: 8, speed: 3.5, feature: '形成前策分析' },
      { type: 'card', dur: 2.2, feature: '结合场地数据\n整合输出 PPT', kicker: 'RESULT OUTPUT' },
    ],
  },
  {
    no: '02',
    title: '场地定位',
    sub: '地理位置与周边环境分析',
    clips: [
      { src: '851fd789ef880cfe4c24d6f2681751ce.mp4', start: 3, dur: 14, speed: 3.0, feature: '卫星地图锁定场地' },
      { src: '851fd789ef880cfe4c24d6f2681751ce.mp4', start: 17, dur: 30, speed: 4.2, feature: '输入坐标，一键获取场地模型' },
    ],
  },
  {
    no: '03',
    title: '数据建模',
    sub: 'BIM信息模型构建',
    clips: [
      { src: '4c430bc016a79d5b446ff15cc00df2ab.mp4', start: 3, dur: 22, speed: 3.5, feature: '参数化建模，实时生成体块' },
      { src: '1b194a028cdf2b7e306fde5b6d3438e2.mp4', start: 3, dur: 16, speed: 3.2, feature: '模型与指标同步联动' },
    ],
  },
  {
    no: '04',
    title: '图纸模型',
    sub: '2D/3D设计图纸生成',
    clips: [
      { src: 'd5cc189fc5d49465fbd069dbe72cc936.mp4', start: 6, dur: 14, speed: 2.2, feature: '上传总图 / CAD' },
      { src: 'bdf6c7f35f90ffaf04c13c600925989d.mp4', start: 18, dur: 34, speed: 4.8, feature: '上传总图，一键生成 3D 模型' },
      { type: 'card', dur: 2.0, feature: '一键导入\n即刻编辑', kicker: 'DRAWING TO MODEL' },
    ],
  },
  {
    no: '05',
    title: 'AI渲染',
    sub: '智能效果图生成',
    clips: [
      { src: '08f53cdbc384c3861e8bec17b983ff15.mp4', start: 0, dur: 13, speed: 3.0, feature: '海量模板，一键复刻优质同款' },
      { src: '81bdcc47cfffa059ce2f1f6d5318cd28.mp4', start: 2, dur: 28, speed: 4.0, feature: '参考图 + 提示词快速生成' },
      { src: '50d251c9e39412cb5853e438d2b4dc6b.mp4', start: 33, dur: 47, speed: 6.0, feature: '更灵活的 AI 渲染\n快速生成多维度结果' },
      { type: 'card', dur: 2.2, feature: '上传多视角底图\n一键生一致性套图', kicker: 'CONSISTENT RENDER SETS' },
    ],
  },
  {
    no: '06',
    title: 'AI分析',
    sub: '性能与优化分析',
    clips: [
      { src: 'f6aa9cbe5a64dd09dc34a4841d261ae1.mp4', start: 5, dur: 33, speed: 4.2, feature: 'AI 仿真分析' },
      { src: 'e14011992dde10c418d56476dfcf5bfe.mp4', start: 28, dur: 19, speed: 2.8, feature: '多维性能结果，一屏可视化' },
      { type: 'card', dur: 2.0, feature: '性能反馈\n辅助方案优化', kicker: 'SIMULATION RESULT' },
    ],
  },
  {
    no: '07',
    title: 'AI估算',
    sub: '成本与投资估算',
    clips: [
      { src: 'e22d4200e9c271f86d33aa2b68d8b478.mp4', start: 74, dur: 12, speed: 2.0, feature: '关键指标实时汇总' },
      { src: '256c745848b222e892af9b42358cadc3.mp4', start: 1, dur: 16, speed: 2.5, feature: '成本与投资估算自动生成' },
      { type: 'card', dur: 2.0, feature: 'AI 成本估算\n数据自动汇总', kicker: 'AI ESTIMATION' },
    ],
  },
  {
    no: '08',
    title: '车库排布',
    sub: '停车规划与优化',
    clips: [
      { src: 'aeb56ebbfe9401582092208e15547ce7.mp4', start: 9, dur: 19, speed: 3.0, feature: '快速生成多种方案' },
      { src: 'aeb56ebbfe9401582092208e15547ce7.mp4', start: 83, dur: 37, speed: 5.0, feature: '选择方案，轻松编辑' },
      { src: '01f7bfcdd5c3eafc0aec6a1d3a91c1d8.mp4', start: 28, dur: 3, speed: 1.4, feature: '支持导出 DWG 格式' },
      { type: 'card', dur: 2.0, feature: '选择心仪方案\n在 CAD 中继续设计', kicker: 'DWG DELIVERY' },
    ],
  },
  {
    no: '09',
    title: '文本生成',
    sub: '智能报告撰写',
    clips: [
      { src: 'a58e492385ebe042fa4c809a19dc3545.mp4', start: 150, dur: 60, speed: 7.0, feature: '导入任务书，一键输出 PPT' },
      { src: '60a92636018bc3e6543e2b4dce6ca3ef.mp4', start: 222, dur: 22, speed: 5.0, feature: '分析与设计成果自动汇总' },
      { type: 'card', dur: 2.5, feature: '从分析到设计\n最终形成可交付成果', kicker: 'FINAL DELIVERY' },
    ],
  },
];

function run(args, label) {
  const r = spawnSync(ffmpeg, args, { stdio: 'inherit' });
  if (r.status !== 0) throw new Error(`${label} failed with status ${r.status}`);
}

function probeDur(file) {
  const r = spawnSync(ffprobe, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nk=1:nw=1', file], { encoding: 'utf8' });
  const n = Number.parseFloat(r.stdout.trim());
  return Number.isFinite(n) ? n : 0;
}

function q(s) {
  return String(s)
    .replace(/\\/g, '\\\\')
    .replace(/:/g, '\\:')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n');
}

function fontPath(p) {
  return p.replace(/:/g, '\\:');
}

function quoteFile(p) {
  return p.replace(/'/g, "'\\''");
}

function splitLines(text) {
  return String(text).split('\n');
}

function featureTextFilters(inputLabel, item, section, outDur) {
  const lines = splitLines(item.feature);
  const fBold = fontPath(fontBold);
  const fReg = fontPath(fontRegular);
  const fadeOutAt = Math.max(0.1, outDur - 0.25);
  let label = inputLabel;
  const parts = [];
  parts.push(`[${label}]drawtext=fontfile='${fReg}':text='${q(section.no + ' / ' + section.title)}':x=110:y=78:fontsize=19:fontcolor=0x8f86db:alpha='if(lt(t,0.25),t/0.25,if(gt(t,${fadeOutAt}),max(0,(${outDur}-t)/0.25),0.88))'[t0]`);
  label = 't0';
  parts.push(`[${label}]drawtext=fontfile='${fReg}':text='CONCETTO 2.0 / WORKFLOW DEMO':x=1325:y=78:fontsize=17:fontcolor=0x8f86db:alpha=0.62[t1]`);
  label = 't1';
  lines.forEach((line, i) => {
    const out = `ft${i}`;
    const y = lines.length === 1 ? 885 : 852 + i * 47;
    const size = lines.length === 1 ? 39 : 37;
    parts.push(`[${label}]drawtext=fontfile='${fBold}':text='${q(line)}':x=(w-text_w)/2:y=${y}:fontsize=${size}:fontcolor=0xf4f1ff:shadowcolor=0x7767ff@0.55:shadowx=0:shadowy=0:alpha='if(lt(t,0.32),t/0.32,if(gt(t,${fadeOutAt}),max(0,(${outDur}-t)/0.25),0.96))'[${out}]`);
    label = out;
  });
  return { filters: parts, out: label };
}

function renderClip(item, section, index, globalIndex) {
  const src = local(item.src);
  const fileDur = probeDur(src);
  const safeDur = fileDur ? Math.max(0.1, Math.min(item.dur, fileDur - item.start)) : item.dur;
  const outDur = safeDur / item.speed;
  const out = path.join(outDir, `sec_${section.no}_clip_${String(index).padStart(2, '0')}.mp4`);

  const fReg = fontPath(fontRegular);
  const title = q(section.title);
  const sub = q(section.sub);
  const prep = `[0:v]setpts=PTS/${item.speed},scale=1510:760:force_original_aspect_ratio=decrease,pad=1510:760:(ow-iw)/2:(oh-ih)/2:color=0x05040a,setsar=1,fps=${fps}[vid]`;
  const base = [
    prep,
    `[1:v]format=yuv420p,drawbox=x=0:y=0:w=${W}:h=${H}:color=0x010104@1:t=fill,drawbox=x=0:y=0:w=${W}:h=${H}:color=0x171238@0.55:t=fill[bg]`,
    `[bg]drawbox=x=185:y=145:w=1550:h=820:color=0x7b6aff@0.20:t=2,drawbox=x=205:y=165:w=1510:h=780:color=0xffffff@0.035:t=fill[stage]`,
    `[stage][vid]overlay=x=205:y=190:format=auto[v0]`,
    `[v0]drawbox=x=205:y=190:w=1510:h=760:color=0x7668ff@0.16:t=2,drawbox=x=205:y=190:w=1510:h=760:color=0x010104@0.05:t=fill[v1]`,
    `[v1]drawtext=fontfile='${fReg}':text='${section.no}':x=900:y=73:fontsize=24:fontcolor=0x7d72e6:alpha=0.9,drawtext=fontfile='${fReg}':text='${title}':x=945:y=68:fontsize=39:fontcolor=0xf2f0ff:alpha=0.96,drawtext=fontfile='${fReg}':text='${sub}':x=(w-text_w)/2:y=124:fontsize=20:fontcolor=0xaaa2df:alpha=0.82,drawbox=x=110:y=103:w=290:h=1:color=0x7668ff@0.45:t=fill[v2]`,
  ];
  const ft = featureTextFilters('v2', item, section, outDur);
  const fadeAt = Math.max(0.05, outDur - 0.25);
  const filter = [...base, ...ft.filters, `[${ft.out}]fade=t=in:st=0:d=0.18,fade=t=out:st=${fadeAt}:d=0.25[v]`].join(';');

  run([
    '-y',
    '-ss', String(item.start),
    '-t', String(safeDur),
    '-i', src,
    '-f', 'lavfi',
    '-t', String(outDur),
    '-i', `color=c=0x010104:s=${W}x${H}:r=${fps}:d=${outDur}`,
    '-filter_complex', filter,
    '-map', '[v]',
    '-an',
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '20',
    '-pix_fmt', 'yuv420p',
    '-r', String(fps),
    out,
  ], `render clip ${section.no}-${index}`);

  return { file: out, dur: outDur, source: item.src, range: `${item.start}s–${(item.start + safeDur).toFixed(1)}s`, speed: item.speed, feature: item.feature };
}

function renderCard(item, section, index) {
  const out = path.join(outDir, `sec_${section.no}_card_${String(index).padStart(2, '0')}.mp4`);
  const fBold = fontPath(fontBold);
  const fReg = fontPath(fontRegular);
  const lines = splitLines(item.feature);
  let filter = `[0:v]format=yuv420p,drawbox=x=0:y=0:w=${W}:h=${H}:color=0x010104@1:t=fill,drawbox=x=300:y=235:w=1320:h=610:color=0x34226f@0.36:t=fill,drawbox=x=330:y=265:w=1260:h=550:color=0xa994ff@0.35:t=2,drawbox=x=350:y=285:w=1220:h=510:color=0xffffff@0.035:t=fill`;
  filter += `,drawtext=fontfile='${fReg}':text='${q(section.no + ' / ' + section.title)}':x=380:y=328:fontsize=22:fontcolor=0x9e94ef:alpha=0.9`;
  filter += `,drawtext=fontfile='${fReg}':text='${q(item.kicker || 'FEATURE')}':x=380:y=372:fontsize=16:fontcolor=0x8177cf:alpha=0.78`;
  filter += `,drawbox=x=380:y=405:w=360:h=1:color=0x7668ff@0.65:t=fill`;
  lines.forEach((line, i) => {
    const y = lines.length === 1 ? 515 : 482 + i * 75;
    filter += `,drawtext=fontfile='${fBold}':text='${q(line)}':x=(w-text_w)/2:y=${y}:fontsize=54:fontcolor=0xf7f4ff:shadowcolor=0x806cff@0.7:shadowx=0:shadowy=0:alpha=0.98`;
  });
  filter += `,drawtext=fontfile='${fReg}':text='CONCETTO 2.0':x=(w-text_w)/2:y=735:fontsize=20:fontcolor=0x8d84dc:alpha=0.72`;
  filter += `,fade=t=in:st=0:d=0.22,fade=t=out:st=${Math.max(0.05, item.dur - 0.25)}:d=0.25[v]`;

  run([
    '-y',
    '-f', 'lavfi',
    '-i', `color=c=0x010104:s=${W}x${H}:r=${fps}:d=${item.dur}`,
    '-filter_complex', filter,
    '-map', '[v]',
    '-an',
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '20',
    '-pix_fmt', 'yuv420p',
    '-r', String(fps),
    out,
  ], `render card ${section.no}-${index}`);
  return { file: out, dur: item.dur, source: 'generated feature card', range: `${item.dur}s`, speed: 1, feature: item.feature };
}

function renderEndCard() {
  const out = path.join(outDir, 'end_card.mp4');
  const logoBg = local('69843c8696b27a065e3e01a568d58702.png');
  const dur = 7;
  const fBold = fontPath(fontBold);
  const fReg = fontPath(fontRegular);
  const filter = [
    `[0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1,format=yuv420p[img]`,
    `[img]drawbox=x=0:y=0:w=${W}:h=${H}:color=0x020104@0.45:t=fill,drawtext=fontfile='${fBold}':text='AI 重塑建筑方案设计师的完整旅程':x=(w-text_w)/2:y=750:fontsize=38:fontcolor=0xf4f1ff:shadowcolor=0x806cff@0.55:shadowx=0:shadowy=0,drawtext=fontfile='${fReg}':text='CONCETTO 2.0':x=(w-text_w)/2:y=815:fontsize=23:fontcolor=0xaaa2df:alpha=0.82,fade=t=in:st=0:d=0.35,fade=t=out:st=${dur - 1}:d=1[v]`,
  ].join(';');
  run([
    '-y',
    '-loop', '1',
    '-t', String(dur),
    '-i', logoBg,
    '-filter_complex', filter,
    '-map', '[v]',
    '-an',
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '20',
    '-pix_fmt', 'yuv420p',
    '-r', String(fps),
    out,
  ], 'render end card');
  return { file: out, dur, source: 'end card', range: `${dur}s`, speed: 1, feature: '品牌收束' };
}

const allParts = [introBase];
const records = [];

for (const section of sections) {
  allParts.push(chapter(Number(section.no)));
  records.push({ title: `${section.no} ${section.title}`, type: 'chapter', dur: probeDur(chapter(Number(section.no))).toFixed(2) });
  section.clips.forEach((item, idx) => {
    const rendered = item.type === 'card'
      ? renderCard(item, section, idx)
      : renderClip(item, section, idx);
    allParts.push(rendered.file);
    records.push({ title: `${section.no} ${section.title}`, type: item.type || 'clip', ...rendered });
  });
}
records.unshift({ title: '开头/升级亮点/工作流总览', type: 'intro', file: introBase, dur: probeDur(introBase).toFixed(2), feature: '保留 v05 前段，截去旧前策单独卡' });
const end = renderEndCard();
allParts.push(end.file);
records.push({ title: '结尾', type: 'end', ...end });

const listPath = path.join(outDir, 'concat_list.txt');
fs.writeFileSync(listPath, allParts.map((p) => `file '${quoteFile(p)}'`).join('\n') + '\n');
const videoOnly = path.join(outDir, 'video_concat.mp4');
run(['-y', '-f', 'concat', '-safe', '0', '-i', listPath, '-c', 'copy', videoOnly], 'concat v06');
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
], 'mux v06 music');

run([
  '-y',
  '-i', output,
  '-vf', 'fps=0.28,scale=360:-1,tile=10x7',
  '-frames:v', '1',
  preview,
], 'render preview');

const md = [
  '# Concetto 2.0 九环节原片节奏重排样片 v06',
  '',
  '目标：在 v05 已确认的九个章节开头基础上，按原宣发片的节奏重新压缩九环节内部素材。操作段不做教程式完整等待，尽量跳过“排队中 / 生成中 / 纯转圈”等低信息画面；保留关键操作、成果展示与卖点文字。',
  '',
  `输出视频：\`${output}\``,
  `预览图：\`${preview}\``,
  `总时长：约 ${Math.floor(totalDur / 60)}:${String(Math.round(totalDur % 60)).padStart(2, '0')}`,
  '',
  '| 段落 | 类型 | 素材/区间 | 加速 | 输出时长 | 卖点文字 |',
  '|---|---|---|---:|---:|---|',
  ...records.map((r) => `| ${r.title} | ${r.type} | ${r.source ? `\`${r.source}\` ${r.range || ''}` : ''} | ${r.speed || ''} | ${Number(r.dur || 0).toFixed(1)}s | ${String(r.feature || '').replace(/\n/g, '<br>')} |`),
  '',
  '剪辑规则：',
  '',
  '- 操作段整体靠近原片快节奏，只保留关键动作和结果；',
  '- 明显等待、排队、生成中、纯转圈画面尽量跳过或高速压缩；',
  '- 每个环节保留“章节开头 → 操作演示 → 成果/卖点文字”的结构；',
  '- 转场和包装继续沿用 v05 的黑场、发光、发布会感。',
  '',
].join('\n');
fs.writeFileSync(logPath, md);

console.log(output);
console.log(preview);
console.log(logPath);
console.log(`duration=${totalDur}`);
