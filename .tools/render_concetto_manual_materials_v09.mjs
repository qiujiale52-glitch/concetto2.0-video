import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const cwd = process.cwd();
const ffmpeg = path.join(cwd, '.tools/media-bin/node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg');
const ffprobe = path.join(cwd, '.tools/media-bin/node_modules/@ffprobe-installer/darwin-arm64/ffprobe');
const outDir = path.join(cwd, '06_预览输出', 'manual_materials_v09_parts');
fs.mkdirSync(outDir, { recursive: true });

const W = 1920;
const H = 1080;
const fps = 30;
const fontRegular = path.join(cwd, '.tools/unified_font/MiSans/otf/MiSans-Regular.otf');
const fontMedium = path.join(cwd, '.tools/unified_font/MiSans/otf/MiSans-Medium.otf');
const fontBold = path.join(cwd, '.tools/unified_font/MiSans/otf/MiSans-Bold.otf');
const music = path.join(cwd, '04-正版授权音乐库', '未来科技宽广磅礴音乐15437.wav');

const output = path.join(cwd, '06_预览输出', 'Concetto_2.0_手动素材重排_v09_低清.mp4');
const preview = path.join(cwd, '06_预览输出', 'Concetto_2.0_手动素材重排_v09_全片预览.jpg');
const workflowPng = path.join(cwd, '06_预览输出', 'Concetto_2.0_九环节总览_新顺序_v09.png');
const renderPreview = path.join(cwd, '06_预览输出', 'Concetto_2.0_手动素材重排_v09_AI灵感渲染段预览.jpg');
const logPath = path.join(cwd, '03_脚本与结构', 'Concetto 2.0_手动素材重排_v09_说明.md');

const manual = (...p) => path.join(cwd, '手动保存素材', ...p);
const image = (...p) => path.join(cwd, '手动保存素材', '图片', ...p);

const sections = [
  {
    no: '01',
    title: '前策分析',
    sub: '多维分析，整合数据与策略',
    desc: '辅助高效决策与成果输出',
    clip: manual('前策分析', '前策分析-1.mov'),
    feature: '多维分析，整合数据与策略',
  },
  {
    no: '02',
    title: '场地定位',
    sub: '多维解析区位与周边资源条件',
    desc: '快速建立场地认知基础',
    clip: manual('场地定位', '场地定位-1.mov'),
    feature: '快速建立场地认知基础',
  },
  {
    no: '03',
    title: '图生模型',
    sub: '支持总平直接生成三维模型',
    desc: '减少重复工作，加速方案迭代',
    clip: manual('图生模型', '图生模型-1.mov'),
    feature: '总平图生成三维模型',
  },
  {
    no: '04',
    title: '数智建模',
    sub: '参数化驱动高效生成',
    desc: '提升建模速度精度',
    clip: manual('数智建模', '数智建模-1.mov'),
    feature: '参数化驱动高效生成',
  },
  {
    no: '05',
    title: 'AI灵感渲染',
    sub: '快速生成多维度结果',
    desc: '输出彩总 / 效果图 / 动态视频',
    clip: null,
    feature: '快速生成多维度结果',
  },
  {
    no: '06',
    title: '总图排布',
    sub: '自动生成高效合规车位',
    desc: '支持修改，指标实时刷新',
    clip: manual('车库智能排布', '车库智能排布-1.mov'),
    feature: '自动生成高效合规车位',
  },
  {
    no: '07',
    title: 'AI仿真分析',
    sub: '集成多项仿真分析能力',
    desc: '实现快速反馈与实时优化',
    clip: manual('ai仿真分析', 'ai仿真分析-1.mov'),
    feature: '仿真分析与成果一体展示',
  },
  {
    no: '08',
    title: 'AI成本估算',
    sub: '海量真实项目数据训练模型',
    desc: '快速完成估算，误差可控',
    clip: manual('ai成本估算', 'ai成本估算-1.mov'),
    feature: '快速完成估算，误差可控',
  },
  {
    no: '09',
    title: '文本生成',
    sub: '整合渲染、估算、分析等成果图',
    desc: '汇报 PPT 自动生成',
    clip: null,
    feature: '素材待补充',
  },
];

function run(args, label) {
  const r = spawnSync(ffmpeg, args, { stdio: 'inherit' });
  if (r.status !== 0) throw new Error(`${label} failed with status ${r.status}`);
}

function ffprobeDur(file) {
  const r = spawnSync(ffprobe, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', file], { encoding: 'utf8' });
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

const fReg = fp(fontRegular);
const fMed = fp(fontMedium);
const fBold = fp(fontBold);

function dt(text, x, y, size, color, alpha = 1, font = fReg, extra = '') {
  return `drawtext=fontfile='${font}':text='${q(text)}':x=${x}:y=${y}:fontsize=${size}:fontcolor=${color}:alpha=${alpha}${extra}`;
}

function renderWorkflowImageAndClip() {
  const boxes = [
    { s: sections[0], x: 235, y: 245 },
    { s: sections[1], x: 765, y: 245 },
    { s: sections[2], x: 1295, y: 245 },
    { s: sections[5], x: 235, y: 485 },
    { s: sections[4], x: 765, y: 485 },
    { s: sections[3], x: 1295, y: 485 },
    { s: sections[6], x: 235, y: 725 },
    { s: sections[7], x: 765, y: 725 },
    { s: sections[8], x: 1295, y: 725 },
  ];
  const cardW = 390;
  const cardH = 142;
  let filter = [
    `format=yuv420p`,
    `drawbox=x=0:y=0:w=${W}:h=${H}:color=0xf4f2ff@1:t=fill`,
    `drawbox=x=0:y=0:w=${W}:h=${H}:color=0xded6ff@0.45:t=fill`,
    dt('AI 重塑建筑方案设计师的完整旅程', '(w-text_w)/2', 70, 50, '0x07142f', 1, fBold),
    dt('九大环节串联，从任务书解读到汇报材料合成，一条工作流走完方案全过程', '(w-text_w)/2', 145, 21, '0x647095', 0.85, fReg),
    `drawbox=x=320:y=1008:w=1280:h=1:color=0x8b76ff@0.18:t=fill`,
  ];

  // Flow lines and arrows, simple enough to keep the visual readable.
  filter.push(`drawbox=x=640:y=315:w=82:h=5:color=0x7b68ff@0.75:t=fill`);
  filter.push(`drawtext=fontfile='${fBold}':text='›':x=705:y=284:fontsize=64:fontcolor=0x7b68ff:alpha=0.8`);
  filter.push(`drawbox=x=1170:y=315:w=82:h=5:color=0x7b68ff@0.75:t=fill`);
  filter.push(`drawtext=fontfile='${fBold}':text='›':x=1235:y=284:fontsize=64:fontcolor=0x7b68ff:alpha=0.8`);
  filter.push(`drawbox=x=1515:y=390:w=5:h=74:color=0x9b65ff@0.7:t=fill`);
  filter.push(`drawtext=fontfile='${fBold}':text='⌄':x=1494:y=425:fontsize=54:fontcolor=0x9b65ff:alpha=0.8`);
  filter.push(`drawbox=x=1170:y=555:w=82:h=5:color=0x7b68ff@0.75:t=fill`);
  filter.push(`drawtext=fontfile='${fBold}':text='‹':x=1164:y=524:fontsize=64:fontcolor=0x7b68ff:alpha=0.8`);
  filter.push(`drawbox=x=640:y=555:w=82:h=5:color=0x7b68ff@0.75:t=fill`);
  filter.push(`drawtext=fontfile='${fBold}':text='‹':x=634:y=524:fontsize=64:fontcolor=0x7b68ff:alpha=0.8`);
  filter.push(`drawbox=x=405:y=630:w=5:h=74:color=0x9b65ff@0.7:t=fill`);
  filter.push(`drawtext=fontfile='${fBold}':text='⌄':x=384:y=665:fontsize=54:fontcolor=0x9b65ff:alpha=0.8`);
  filter.push(`drawbox=x=640:y=795:w=82:h=5:color=0x7b68ff@0.75:t=fill`);
  filter.push(`drawtext=fontfile='${fBold}':text='›':x=705:y=764:fontsize=64:fontcolor=0x7b68ff:alpha=0.8`);
  filter.push(`drawbox=x=1170:y=795:w=82:h=5:color=0x7b68ff@0.75:t=fill`);
  filter.push(`drawtext=fontfile='${fBold}':text='›':x=1235:y=764:fontsize=64:fontcolor=0x7b68ff:alpha=0.8`);

  for (const { s, x, y } of boxes) {
    filter.push(`drawbox=x=${x}:y=${y}:w=${cardW}:h=${cardH}:color=0xffffff@0.68:t=fill`);
    filter.push(`drawbox=x=${x}:y=${y}:w=${cardW}:h=${cardH}:color=0x7b68ff@0.92:t=4`);
    filter.push(`drawbox=x=${x + 20}:y=${y + 26}:w=56:h=56:color=0x6d76ff@0.95:t=fill`);
    filter.push(dt(s.no, x + 33, y + 36, 28, '0xffffff', 1, fBold));
    filter.push(dt(s.title, x + 95, y + 28, 35, '0x4d55e8', 1, fBold));
    filter.push(dt(s.sub, x + 95, y + 78, 19, '0x394163', 0.9, fMed));
    filter.push(dt(s.desc, x + 95, y + 107, 18, '0x394163', 0.82, fReg));
  }

  const filterString = filter.join(',');
  run([
    '-y',
    '-f', 'lavfi',
    '-i', `color=c=0xf4f2ff:s=${W}x${H}:r=${fps}:d=1`,
    '-vf', filterString,
    '-frames:v', '1',
    workflowPng,
  ], 'render workflow png');

  const clip = path.join(outDir, 'intro_workflow_v09.mp4');
  run([
    '-y',
    '-f', 'lavfi',
    '-i', `color=c=0xf4f2ff:s=${W}x${H}:r=${fps}:d=9`,
    '-vf', `${filterString},fade=t=in:st=0:d=0.35,fade=t=out:st=8.55:d=0.35`,
    '-an',
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '20',
    '-pix_fmt', 'yuv420p',
    '-r', String(fps),
    clip,
  ], 'render workflow clip');
  return clip;
}

function renderIntro(workflowClip) {
  const introA = path.join(outDir, 'intro_launch_v09.mp4');
  const introB = path.join(outDir, 'intro_highlights_v09.mp4');
  const introC = path.join(outDir, 'intro_updates_v09.mp4');
  const list = path.join(outDir, 'intro_list.txt');
  const out = path.join(outDir, 'intro_base_v09.mp4');

  const launchFilter = [
    `format=yuv420p`,
    `drawbox=x=0:y=0:w=${W}:h=${H}:color=0x010104@1:t=fill`,
    `drawbox=x='${W / 2 - 420}+60*sin(t*0.8)':y=505:w=840:h=2:color=0x7b68ff@0.48:t=fill`,
    dt('CONCETTO', '(w-text_w)/2', 430, 52, '0xf7f4ff', `'if(lt(t,1.2),t/1.2,if(gt(t,6.6),max(0,(7.2-t)/0.6),1))'`, fBold, `:shadowcolor=0x806cff@0.65:shadowx=0:shadowy=0`),
    dt('2.0', '(w-text_w)/2', 500, 30, '0xdcd5ff', `'if(lt(t,2.1),(t-1.1)/1.0,if(gt(t,6.6),max(0,(7.2-t)/0.6),0.96))'`, fMed),
    dt('从分析到设计，一站式方案平台全面升级', '(w-text_w)/2', 560, 24, '0xbab1ee', `'if(lt(t,2.8),(t-1.8)/1.0,if(gt(t,6.6),max(0,(7.2-t)/0.6),0.82))'`, fReg),
    `fade=t=in:st=0:d=0.5,fade=t=out:st=7.3:d=0.7`,
  ].join(',');
  run(['-y', '-f', 'lavfi', '-i', `color=c=0x010104:s=${W}x${H}:r=${fps}:d=8`, '-vf', launchFilter, '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-r', String(fps), introA], 'intro launch');

  const highCards = [
    ['一个环境', '走完方案全流程'],
    ['三大空间', '沉浸式切换'],
    ['Web & 客户端', '协同更轻量'],
    ['全流程提效', '数据可量化'],
  ];
  let hf = [`format=yuv420p`, `drawbox=x=0:y=0:w=${W}:h=${H}:color=0xf4f2ff@1:t=fill`, `drawbox=x=0:y=0:w=${W}:h=${H}:color=0xded6ff@0.36:t=fill`, dt('CONCETTO 2.0 升级亮点', 100, 90, 58, '0x06152f', 1, fBold), dt('全新体验，全方位升级，让专注更简单、更高效', 105, 170, 25, '0x5d668b', 0.9, fReg)];
  highCards.forEach((c, i) => {
    const x = i % 2 === 0 ? 120 : 1010;
    const y = i < 2 ? 285 : 595;
    hf.push(`drawbox=x=${x}:y=${y}:w=790:h=225:color=0xffffff@0.66:t=fill`);
    hf.push(`drawbox=x=${x}:y=${y}:w=790:h=225:color=0x9b8aff@0.55:t=2`);
    hf.push(dt(c[0], x + 100, y + 65, 34, '0x07142f', 1, fBold));
    hf.push(dt(c[1], x + 100, y + 120, 23, '0x4f5a7d', 0.92, fReg));
    hf.push(`drawbox=x=${x + 40}:y=${y + 60}:w=36:h=36:color=0x7d69ff@0.9:t=fill`);
  });
  hf.push(`fade=t=in:st=0:d=0.35,fade=t=out:st=7.65:d=0.35`);
  run(['-y', '-f', 'lavfi', '-i', `color=c=0xf4f2ff:s=${W}x${H}:r=${fps}:d=8`, '-vf', hf.join(','), '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-r', String(fps), introB], 'intro highlights');

  const updateCards = [
    ['01', '系统更新'], ['02', '渲染2.0'], ['03', '图生模'],
    ['04', '前策分析'], ['05', '车库智能排布'], ['06', 'WEB端建模'],
  ];
  let uf = [`format=yuv420p`, `drawbox=x=0:y=0:w=${W}:h=${H}:color=0xded6ff@1:t=fill`, dt('CONCETTO 2.0', '(w-text_w)/2', 70, 66, '0xffffff', 1, fBold, `:shadowcolor=0x7b68ff@0.55:shadowx=0:shadowy=0`)];
  updateCards.forEach((c, i) => {
    const x = 95 + (i % 3) * 610;
    const y = i < 3 ? 250 : 610;
    uf.push(`drawbox=x=${x}:y=${y}:w=520:h=245:color=0xffffff@0.42:t=fill`);
    uf.push(`drawbox=x=${x}:y=${y}:w=520:h=245:color=0xffffff@0.8:t=2`);
    uf.push(dt(c[0], x + 45, y + 52, 68, i % 2 ? '0x5872ff' : '0x9b5cff', 0.95, fBold));
    uf.push(dt(c[1], x + 170, y + 74, 42, '0x5667f2', 0.98, fBold));
    uf.push(`drawbox=x=${x + 170}:y=${y + 142}:w=250:h=1:color=0xffffff@0.75:t=fill`);
  });
  uf.push(`fade=t=in:st=0:d=0.35,fade=t=out:st=7.65:d=0.35`);
  run(['-y', '-f', 'lavfi', '-i', `color=c=0xded6ff:s=${W}x${H}:r=${fps}:d=8`, '-vf', uf.join(','), '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-r', String(fps), introC], 'intro updates');

  fs.writeFileSync(list, [introA, introB, introC, workflowClip].map((p) => `file '${quoteFile(p)}'`).join('\n') + '\n');
  run(['-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', out], 'concat intro');
  return out;
}

function renderChapter(section) {
  const out = path.join(outDir, `chapter_${section.no}.mp4`);
  const dur = 3.2;
  const filter = [
    `format=yuv420p`,
    `drawbox=x=0:y=0:w=${W}:h=${H}:color=0x010104@1:t=fill`,
    `drawbox=x=0:y=0:w=${W}:h=${H}:color=0x171238@0.45:t=fill`,
    `drawbox=x=650:y=370:w=620:h=250:color=0x6d62ff@0.85:t=fill`,
    `drawbox=x=630:y=350:w=660:h=290:color=0x8b7aff@0.35:t=2`,
    dt(`CONCETTO 2.0 / LAUNCH SEQUENCE`, 120, 145, 22, '0x8f86db', 0.72, fMed),
    `drawbox=x=120:y=190:w=260:h=2:color=0x7668ff@0.5:t=fill`,
    dt(`从工作流的第 ${section.no} 步，进入${section.title}`, '(w-text_w)/2', 240, 30, '0x0e0c20', 0.22, fReg),
    dt(section.title, '(w-text_w)/2', 430, 58, '0xffffff', 1, fBold, `:shadowcolor=0x3020ff@0.6:shadowx=0:shadowy=0`),
    dt(section.sub, '(w-text_w)/2', 515, 27, '0xf3efff', 0.9, fReg),
    dt(`${section.no}`, 720, 446, 42, '0xe7e1ff', 0.85, fBold),
    `fade=t=in:st=0:d=0.22,fade=t=out:st=${dur - 0.28}:d=0.28`,
  ].join(',');
  run(['-y', '-f', 'lavfi', '-i', `color=c=0x010104:s=${W}x${H}:r=${fps}:d=${dur}`, '-vf', filter, '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-r', String(fps), out], `chapter ${section.no}`);
  return out;
}

function renderOperationClip(section) {
  const clipKey = path.basename(section.clip, path.extname(section.clip)).replace(/[^\p{L}\p{N}_-]+/gu, '_');
  const out = path.join(outDir, `sec_${section.no}_operation_${clipKey}.mp4`);
  const dur = ffprobeDur(section.clip);
  const filter = [
    `[0:v]setpts=PTS-STARTPTS,scale=1510:760:force_original_aspect_ratio=decrease,pad=1510:760:(ow-iw)/2:(oh-ih)/2:color=0x05040a,setsar=1,fps=${fps}[vid]`,
    `[1:v]format=yuv420p,drawbox=x=0:y=0:w=${W}:h=${H}:color=0x010104@1:t=fill,drawbox=x=0:y=0:w=${W}:h=${H}:color=0x171238@0.55:t=fill[bg]`,
    `[bg]drawbox=x=185:y=145:w=1550:h=820:color=0x7b6aff@0.20:t=2,drawbox=x=205:y=165:w=1510:h=780:color=0xffffff@0.035:t=fill[stage]`,
    `[stage][vid]overlay=x=205:y=190:format=auto[v0]`,
    `[v0]drawbox=x=205:y=190:w=1510:h=760:color=0x7668ff@0.14:t=2,drawbox=x=205:y=190:w=1510:h=760:color=0x010104@0.03:t=fill[v1]`,
    `[v1]drawtext=fontfile='${fReg}':text='${q(section.no)}':x=900:y=73:fontsize=24:fontcolor=0x7d72e6:alpha=0.9,drawtext=fontfile='${fReg}':text='${q(section.title)}':x=945:y=68:fontsize=39:fontcolor=0xf2f0ff:alpha=0.96,drawtext=fontfile='${fReg}':text='${q(section.sub)}':x=(w-text_w)/2:y=124:fontsize=20:fontcolor=0xaaa2df:alpha=0.82,drawbox=x=110:y=103:w=290:h=1:color=0x7668ff@0.45:t=fill[v2]`,
    `[v2]drawtext=fontfile='${fBold}':text='${q(section.feature)}':x=(w-text_w)/2:y=885:fontsize=38:fontcolor=0xf4f1ff:shadowcolor=0x7767ff@0.55:shadowx=0:shadowy=0:alpha='if(lt(t,0.3),t/0.3,if(gt(t,${Math.max(0.5, dur - 0.35)}),max(0,(${dur}-t)/0.35),0.96))'[v3]`,
    `[v3]fade=t=in:st=0:d=0.18,fade=t=out:st=${Math.max(0.1, dur - 0.25)}:d=0.25[v]`,
  ].join(';');
  run([
    '-y',
    '-i', section.clip,
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
    out,
  ], `operation ${section.no}`);
  return out;
}

function renderNormalRenderResult() {
  const src = image('0b58f775ed9dba6e413d8fb8f0c2168f.png');
  const out = path.join(outDir, 'sec_05_normal_render_result.mp4');
  const dur = 4.6;
  const cols = 5;
  const rows = 4;
  const cropW = 500;
  const cropH = 650;
  const startX = 800;
  const startY = 380;
  const positions = [
    [120, 95], [410, 120], [720, 95], [1030, 120], [1330, 95],
    [85, 360], [390, 380], [710, 340], [1030, 375], [1360, 360],
    [145, 635], [460, 690], [780, 620], [1110, 690], [1430, 630],
    [280, 820], [610, 845], [940, 830], [1270, 840], [1550, 815],
  ];
  const splits = Array.from({ length: cols * rows }, (_, i) => `[s${i}]`).join('');
  let fc = [`[0:v]split=${cols * rows}${splits}`];
  let labels = [];
  for (let i = 0; i < cols * rows; i++) {
    const cx = (i % cols) * cropW;
    const cy = Math.floor(i / cols) * 780 + 120;
    fc.push(`[s${i}]crop=${cropW}:${cropH}:${cx}:${cy},scale=260:-1,setsar=1[t${i}]`);
    labels.push(`t${i}`);
  }
  fc.push(`[1:v]format=yuv420p,drawbox=x=0:y=0:w=${W}:h=${H}:color=0xe5d8ff@1:t=fill[base0]`);
  let cur = 'base0';
  labels.forEach((lab, i) => {
    const [fx, fy] = positions[i];
    const xexpr = `${startX}+(${fx}-${startX})*min(max((t-0.35)/1.45\\,0)\\,1)`;
    const yexpr = `${startY}+(${fy}-${startY})*min(max((t-0.35)/1.45\\,0)\\,1)`;
    const next = `ov${i}`;
    fc.push(`[${cur}][${lab}]overlay=x='${xexpr}':y='${yexpr}':eval=frame:shortest=1[${next}]`);
    cur = next;
  });
  fc.push(`[${cur}]drawbox=x=0:y=0:w=${W}:h=${H}:color=0xe5d8ff@0.06:t=fill,drawtext=fontfile='${fBold}':text='${q('更灵活的 AI 渲染')}':x=(w-text_w)/2:y=88:fontsize=66:fontcolor=0x8057ff:shadowcolor=0xffffff@0.9:shadowx=0:shadowy=0,drawtext=fontfile='${fMed}':text='${q('快速生成多维度结果')}':x=(w-text_w)/2:y=170:fontsize=36:fontcolor=0x9967ff,drawtext=fontfile='${fBold}':text='${q('住宅   公建   城市更新   工业园区   市政基建')}':x=(w-text_w)/2:y=236:fontsize=28:fontcolor=0xffffff:box=1:boxcolor=0x9a60ff@0.88:boxborderw=12,fade=t=in:st=0:d=0.25,fade=t=out:st=${dur - 0.35}:d=0.35[v]`);

  run([
    '-y',
    '-loop', '1',
    '-t', String(dur),
    '-i', src,
    '-f', 'lavfi',
    '-t', String(dur),
    '-i', `color=c=0xe5d8ff:s=${W}x${H}:r=${fps}:d=${dur}`,
    '-filter_complex', fc.join(';'),
    '-map', '[v]',
    '-an',
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '20',
    '-pix_fmt', 'yuv420p',
    '-r', String(fps),
    out,
  ], 'normal render result');
  return out;
}

function renderSuiteResult() {
  const imgs = [
    image('f3ba1e172bc2fa416bd86c018310179f.jpg'),
    image('ea285d03baa21b726e84d4d736f102d4.jpg'),
    image('d762819b713649d93c6ac46192f8d75a.jpg'),
    image('2aa273d96cd9cfdcb067f3955d5cd315.jpg'),
  ];
  const out = path.join(outDir, 'sec_05_suite_result.mp4');
  const dur = 4.2;
  const final = [
    [160, 105],
    [1000, 105],
    [160, 575],
    [1000, 575],
  ];
  const center = [600, 335];
  let fc = [
    `[4:v]format=yuv420p,drawbox=x=0:y=0:w=${W}:h=${H}:color=0xe5d8ff@1:t=fill[base]`,
  ];
  for (let i = 0; i < 4; i++) {
    fc.push(`[${i}:v]scale=760:430:force_original_aspect_ratio=increase,crop=760:430,setsar=1[img${i}]`);
  }
  let cur = 'base';
  for (let i = 0; i < 4; i++) {
    const [fx, fy] = final[i];
    const delay = 0.25 + i * 0.08;
    const xexpr = `${center[0]}+(${fx}-${center[0]})*min(max((t-${delay})/1.25\\,0)\\,1)`;
    const yexpr = `${center[1]}+(${fy}-${center[1]})*min(max((t-${delay})/1.25\\,0)\\,1)`;
    const next = `suite${i}`;
    fc.push(`[${cur}][img${i}]overlay=x='${xexpr}':y='${yexpr}':eval=frame:shortest=1[${next}]`);
    cur = next;
  }
  fc.push(`[${cur}]drawbox=x=0:y=0:w=${W}:h=${H}:color=0xe5d8ff@0.04:t=fill,drawtext=fontfile='${fBold}':text='${q('上传多视角底图')}':x=(w-text_w)/2:y=405:fontsize=42:fontcolor=0xb450ff:shadowcolor=0xffffff@0.9:shadowx=0:shadowy=0,drawtext=fontfile='${fBold}':text='${q('一键生一致性套图')}':x=(w-text_w)/2:y=462:fontsize=68:fontcolor=0x6f6cff:shadowcolor=0xffffff@0.95:shadowx=0:shadowy=0,fade=t=in:st=0:d=0.25,fade=t=out:st=${dur - 0.35}:d=0.35[v]`);

  run([
    '-y',
    ...imgs.flatMap((p) => ['-loop', '1', '-t', String(dur), '-i', p]),
    '-f', 'lavfi',
    '-t', String(dur),
    '-i', `color=c=0xe5d8ff:s=${W}x${H}:r=${fps}:d=${dur}`,
    '-filter_complex', fc.join(';'),
    '-map', '[v]',
    '-an',
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '20',
    '-pix_fmt', 'yuv420p',
    '-r', String(fps),
    out,
  ], 'suite result');
  return out;
}

function renderAiRenderSection(section) {
  const parts = [];
  const normal = { ...section, clip: manual('灵感渲染（普通渲染）', '灵感渲染（普通渲染）.mov'), feature: '快速生成多维度结果' };
  const suite = { ...section, clip: manual('灵感渲染（生成套图）', '灵感渲染（生成套图）-1.mov'), feature: '上传多视角底图，一键生成一致性套图' };
  parts.push(renderOperationClip(normal));
  parts.push(renderNormalRenderResult());
  parts.push(renderOperationClip(suite));
  parts.push(renderSuiteResult());
  return parts;
}

function renderEndCard() {
  const out = path.join(outDir, 'end_card_v09.mp4');
  const dur = 5.5;
  const filter = [
    `format=yuv420p`,
    `drawbox=x=0:y=0:w=${W}:h=${H}:color=0x010104@1:t=fill`,
    dt('CONCETTO 2.0', '(w-text_w)/2', 430, 54, '0xf7f4ff', 1, fBold, `:shadowcolor=0x806cff@0.7:shadowx=0:shadowy=0`),
    dt('从分析到设计，完成建筑方案工作流闭环', '(w-text_w)/2', 512, 28, '0xbab1ee', 0.9, fReg),
    `drawbox=x=660:y=600:w=600:h=2:color=0x7b68ff@0.5:t=fill`,
    `fade=t=in:st=0:d=0.4,fade=t=out:st=${dur - 0.8}:d=0.8`,
  ].join(',');
  run(['-y', '-f', 'lavfi', '-i', `color=c=0x010104:s=${W}x${H}:r=${fps}:d=${dur}`, '-vf', filter, '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-r', String(fps), out], 'end card');
  return out;
}

function main() {
  for (const p of [fontRegular, fontMedium, fontBold]) {
    if (!fs.existsSync(p)) throw new Error(`missing font: ${p}`);
  }
  const parts = [];
  const records = [];

  const workflowClip = renderWorkflowImageAndClip();
  const intro = renderIntro(workflowClip);
  parts.push(intro);
  records.push({ segment: '开头 / 升级亮点 / 新顺序工作流总览', file: intro, duration: ffprobeDur(intro) });

  for (const section of sections) {
    const chapter = renderChapter(section);
    parts.push(chapter);
    records.push({ segment: `${section.no} ${section.title} 章节开头`, file: chapter, duration: ffprobeDur(chapter) });

    if (section.no === '05') {
      for (const p of renderAiRenderSection(section)) {
        parts.push(p);
        records.push({ segment: `${section.no} ${section.title}`, file: p, duration: ffprobeDur(p) });
      }
    } else if (section.clip) {
      const p = renderOperationClip(section);
      parts.push(p);
      records.push({ segment: `${section.no} ${section.title} 操作演示`, file: p, duration: ffprobeDur(p) });
    } else {
      // 文本生成素材暂缺：只保留章节开头，按用户要求先空着。
      records.push({ segment: `${section.no} ${section.title} 操作演示`, file: '素材暂缺，未放入成片', duration: 0 });
    }
  }

  const end = renderEndCard();
  parts.push(end);
  records.push({ segment: '结尾', file: end, duration: ffprobeDur(end) });

  const list = path.join(outDir, 'concat_list.txt');
  fs.writeFileSync(list, parts.map((p) => `file '${quoteFile(p)}'`).join('\n') + '\n');
  const videoOnly = path.join(outDir, 'video_concat_v09.mp4');
  run(['-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', videoOnly], 'concat v09');
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
  ], 'mux music');

  run(['-y', '-i', output, '-vf', 'fps=0.25,scale=360:-1,tile=10x6', '-frames:v', '1', preview], 'preview');
  run(['-y', '-ss', '00:01:20', '-i', output, '-t', '00:00:36', '-vf', 'fps=1,scale=480:-1,tile=9x4', '-frames:v', '1', renderPreview], 'ai render preview');

  fs.writeFileSync(logPath, [
    '# Concetto 2.0 手动素材重排 v09',
    '',
    '本版目标：按用户最新顺序重排九大环节；所有操作演示仅使用 `手动保存素材` 内对应文件；新增 AI 灵感渲染两段成果展示动效；新增文字统一使用 `统一字体.zip` 中的 MiSans。',
    '',
    `输出视频：\`${output}\``,
    `新九环节总览图：\`${workflowPng}\``,
    `全片预览：\`${preview}\``,
    `AI 灵感渲染段预览：\`${renderPreview}\``,
    `总时长：约 ${Math.floor(totalDur / 60)}:${String(Math.round(totalDur % 60)).padStart(2, '0')}`,
    '',
    '## 九大环节顺序',
    '',
    '| 顺序 | 环节 | 操作素材 |',
    '|---:|---|---|',
    ...sections.map((s) => `| ${s.no} | ${s.title} | ${s.clip ? `\`${path.relative(cwd, s.clip)}\`` : '暂缺，先空着'} |`),
    '',
    '## 成片段落',
    '',
    '| 段落 | 文件 | 时长 |',
    '|---|---|---:|',
    ...records.map((r) => `| ${r.segment} | ${typeof r.file === 'string' && r.file.startsWith(cwd) ? `\`${path.relative(cwd, r.file)}\`` : r.file} | ${Number(r.duration || 0).toFixed(1)}s |`),
    '',
    '## AI 灵感渲染段',
    '',
    '- 普通渲染操作：`手动保存素材/灵感渲染（普通渲染）/灵感渲染（普通渲染）.mov`；',
    '- 普通渲染成果：`手动保存素材/图片/0b58f775ed9dba6e413d8fb8f0c2168f.png`，切分为小图卡片，从中心叠放后向外喷发；',
    '- 套图操作：`手动保存素材/灵感渲染（生成套图）/灵感渲染（生成套图）-1.mov`；',
    '- 套图成果：四张 ConcettoAI JPG 从中心叠放后移动到四角。',
  ].join('\n'));

  console.log(`v09 done: ${output}`);
  console.log(`duration: ${totalDur.toFixed(2)}s`);
}

main();
