import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import sharp from './thumbs/node_modules/sharp/dist/index.mjs';

// Production-native nine-chapter sequence.
// Every operation page is regenerated from the original high-frame-rate recording.
// This script never crops or extracts frames from an earlier Concetto edit/preview.
const cwd = process.cwd();
const ffmpeg = path.join(cwd, '.tools/media-bin/node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg');
const ffprobe = path.join(cwd, '.tools/media-bin/node_modules/@ffprobe-installer/darwin-arm64/ffprobe');
const previewMode = process.env.RENDER_MODE !== 'final';
const forceSourceRender = process.env.FORCE_SOURCE_RENDER === '1';
const validateOnly = process.env.VALIDATE_ONLY === '1';
const outDir = path.join(cwd, '06_预览输出', 'chapter_progress_persistent_final_v01_parts');
const overlayDir = path.join(outDir, 'overlay_frames');
const baseVideo = path.join(outDir, previewMode ? 'base_nine_chapters_720p30.mp4' : 'base_nine_chapters_2560p60.mp4');
const output = path.join(cwd, '06_预览输出', previewMode
  ? 'Concetto_2.0_九环章节常驻进度_原生操作页_v01_低清预览.mp4'
  : 'Concetto_2.0_九环章节常驻进度_原生操作页_v01_2560p60.mp4');

const W = previewMode ? 1280 : 2560;
const H = previewMode ? 720 : 1440;
const FPS = previewMode ? 30 : 60;
const COVER_DUR = 3.6;
const FRAME_CONCURRENCY = Math.max(1, Number.parseInt(process.env.FRAME_CONCURRENCY || (previewMode ? '4' : '2'), 10) || 2);
// Reuse the already AI-upscaled recordings, but rebuild their surrounding
// header/background natively so legacy labels can never flash through.
const opDir = path.join(cwd, '06_预览输出', 'operation_pages_clean_header_v01');
const coverDir = path.join(cwd, '06_预览输出', 'chapter_covers_clean_v01_parts');
const generated = (...parts) => path.join(cwd, '06_预览输出', ...parts);

const chapters = [
  {
    no: '01', title: '前策分析', sub: '从任务书解读，到区位、现状、案例与策略生成',
    content: [
      path.join(opDir, 'sec_01_operation_ai_x4_1440p60.mp4'),
      generated('original_rhythm_v06_parts', 'sec_01_result_materials_v07.mp4'),
    ],
  },
  { no: '02', title: '场地定位', sub: '快速建立场地认知基础', content: [path.join(opDir, 'sec_02_operation_ai_x4_1440p60.mp4')] },
  { no: '03', title: '图生模型', sub: '上传总平图，一键生成可编辑三维模型', content: [path.join(opDir, 'sec_03_operation_ai_x4_1440p60.mp4')] },
  { no: '04', title: '数智建模', sub: '参数化驱动高效生成，提升建模速度精度', content: [path.join(opDir, 'sec_04_operation_ai_x4_1440p60.mp4')] },
  {
    no: '05', title: 'AI灵感渲染', sub: '快速生成多维度渲染结果',
    content: [
      path.join(opDir, 'sec_05_operation_normal_ai_x4_1440p60.mp4'),
      generated('refined_v16_parts', 'sec_05_normal_render_result_redesign.mp4'),
      path.join(opDir, 'sec_05_operation_suite_ai_x4_1440p60.mp4'),
      generated('refined_v16_parts', 'sec_05_suite_result_redesign.mp4'),
    ],
  },
  {
    no: '06', title: '车库智能排布', sub: '自动生成高效合规车位，指标实时刷新',
    content: [
      path.join(opDir, 'sec_06_operation_ai_x4_1440p60.mp4'),
      generated('refined_v22_layoutfix_parts', 'sec_06_dwg_result_v22.mp4'),
    ],
  },
  { no: '07', title: 'AI仿真分析', sub: '仿真分析与成果一体展示', content: [path.join(opDir, 'sec_07_operation_ai_x4_1440p60.mp4')] },
  { no: '08', title: 'AI成本估算', sub: '快速完成估算，误差可控', content: [path.join(opDir, 'sec_08_operation_ai_x4_1440p60.mp4')] },
  {
    no: '09', title: '文本生成', sub: '整合成果材料，自动生成汇报文本',
    content: [
      path.join(opDir, 'sec_09_text_generation_with_title_1440p60.mp4'),
      generated('refined_v16_parts', 'sec_09_meeting_followup.mp4'),
    ],
  },
];

const covers = chapters.map(({ no }) => path.join(coverDir, `chapter_${no}_clean_v01_无内嵌进度层_${previewMode ? 'preview' : '2560p60'}.mp4`));
let timeline = [];
let chapterRanges = [];
let totalDur = 0;

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(overlayDir, { recursive: true });
for (const file of [ffmpeg, ffprobe]) {
  if (!fs.existsSync(file)) throw new Error(`Missing file: ${file}`);
}

function run(args, label) {
  const result = spawnSync(ffmpeg, args, { stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`${label} failed with status ${result.status}`);
}

function capture(bin, args, label) {
  const result = spawnSync(bin, args, { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`${label} failed with status ${result.status}: ${result.stderr}`);
  return result.stdout.trim();
}

function probeDur(file) {
  const value = capture(ffprobe, [
    '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nk=1:nw=1', file,
  ], `probe duration ${path.basename(file)}`);
  const duration = Number.parseFloat(value);
  if (!Number.isFinite(duration) || duration <= 0) throw new Error(`invalid duration: ${file}`);
  return duration;
}

function buildTimeline() {
  timeline = [];
  chapterRanges = [];
  let cursor = 0;
  chapters.forEach((chapter, chapterIndex) => {
    const coverStart = cursor;
    timeline.push({ type: 'cover', chapter: chapterIndex, duration: COVER_DUR, source: covers[chapterIndex] });
    cursor += COVER_DUR;
    const contentStart = cursor;
    chapter.content.forEach((source, contentIndex) => {
      const duration = probeDur(source);
      timeline.push({
        type: 'content', chapter: chapterIndex, contentIndex,
        lastContent: contentIndex === chapter.content.length - 1,
        duration, source,
      });
      cursor += duration;
    });
    chapterRanges.push({ coverStart, contentStart, end: cursor });
  });
  totalDur = cursor;
}

function clamp(value, min = 0, max = 1) { return Math.max(min, Math.min(max, value)); }
function smooth(a, b, value) {
  const t = clamp((value - a) / (b - a));
  return t * t * (3 - 2 * t);
}
function smoother(a, b, value) {
  const t = clamp((value - a) / (b - a));
  return t * t * t * (t * (t * 6 - 15) + 10);
}
function mix(a, b, t) { return a + (b - a) * t; }

function locate(time) {
  let start = 0;
  for (const segment of timeline) {
    const end = start + segment.duration;
    if (time < end || segment === timeline.at(-1)) return { ...segment, start, local: time - start };
    start = end;
  }
  return { ...timeline.at(-1), start: totalDur - timeline.at(-1).duration, local: timeline.at(-1).duration };
}

const icons = ['documentSpark', 'pin', 'cube', 'model', 'imageSpark', 'grid', 'target', 'calculator', 'document'];

function iconSvg(name, x, y, scale, opacity) {
  const tr = `translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${scale.toFixed(3)})`;
  const white = `fill="#fff" opacity="${opacity.toFixed(3)}"`;
  const purple = '#7464df';
  const map = {
    documentSpark: `<g transform="${tr}"><path ${white} d="M-13-17h17l9 9v21a4 4 0 0 1-4 4h-22a4 4 0 0 1-4-4v-26a4 4 0 0 1 4-4z"/><path fill="${purple}" opacity="${opacity}" d="M3-17v10h10zM-10-2H3v4h-13zm0 8H8v4h-18z"/><path ${white} d="M13-22l4 8 8 4-8 4-4 8-4-8-8-4 8-4z"/></g>`,
    pin: `<g transform="${tr}"><path ${white} d="M0-18c-10 0-18 8-18 18 0 13 18 29 18 29S18 13 18 0c0-10-8-18-18-18zm0 25a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"/></g>`,
    cube: `<g transform="${tr}"><path ${white} d="M0-20 19-10 0 1-19-10zM-19-5 0 6v22L-19 17zm38 0L0 6v22l19-11z"/></g>`,
    model: `<g transform="${tr}"><path ${white} d="M0-20 7-7H-7zM0 20l-7-13H7zM-19 14h15L3-3l-7-3zm38 0H4L-3-3l7-3z"/><circle ${white} cx="0" cy="-2" r="4"/></g>`,
    imageSpark: `<g transform="${tr}"><rect ${white} x="-18" y="-15" width="30" height="25" rx="4"/><circle fill="${purple}" opacity="${opacity}" cx="-8" cy="-6" r="3"/><path fill="${purple}" opacity="${opacity}" d="m-16 7 9-10 7 7 5-6 10 9z"/><path ${white} d="M15-20l3 7 8 3-8 3-3 8-3-8-8-3 8-3z"/></g>`,
    grid: `<g transform="${tr}">${[-13, 0, 13].flatMap((xx) => [-13, 0, 13].map((yy) => `<rect ${white} x="${xx - 5}" y="${yy - 5}" width="10" height="10" rx="2"/>`)).join('')}</g>`,
    target: `<g transform="${tr}"><circle cx="0" cy="0" r="15" fill="none" stroke="#fff" stroke-width="4" opacity="${opacity}"/><circle ${white} cx="0" cy="0" r="5"/><path stroke="#fff" stroke-width="4" opacity="${opacity}" d="M0-24v9M0 15v9M-24 0h9M15 0h9"/></g>`,
    calculator: `<g transform="${tr}"><rect ${white} x="-14" y="-19" width="28" height="38" rx="5"/><rect fill="${purple}" opacity="${opacity}" x="-9" y="-14" width="18" height="7" rx="2"/>${[-7, 0, 7].flatMap((xx) => [1, 9].map((yy) => `<circle fill="${purple}" opacity="${opacity}" cx="${xx}" cy="${yy}" r="2.5"/>`)).join('')}</g>`,
    document: `<g transform="${tr}"><path ${white} d="M-13-19h18l10 10v23a4 4 0 0 1-4 4h-24a4 4 0 0 1-4-4v-29a4 4 0 0 1 4-4z"/><path fill="${purple}" opacity="${opacity}" d="M4-19v11h11zM-10-2H5v4h-15zm0 8H8v4h-18z"/></g>`,
  };
  return map[name];
}

function progressState(time) {
  const segment = locate(time);
  let morph = segment.type === 'content' ? 1 : 0;
  let activeA = segment.chapter;
  let activeB = segment.chapter;
  let activeMix = 0;
  let coverSweep = 0;
  let coverSweepAlpha = 0;

  // The curve begins to flatten only after the cover body is nearly gone, and
  // completes over the first 0.55 s of the first native content segment.
  for (let chapter = 0; chapter < chapterRanges.length; chapter++) {
    const boundary = chapterRanges[chapter].contentStart;
    if (time >= boundary - 0.18 && time <= boundary + 0.55) {
      morph = smooth(boundary - 0.18, boundary + 0.55, time);
      activeA = chapter;
      activeB = chapter;
      activeMix = 0;
      break;
    }
  }

  // At the end of the complete chapter content group (operation + result
  // segments), restore the curve while keeping the previous chapter active.
  for (let chapter = 0; chapter < chapterRanges.length - 1; chapter++) {
    const boundary = chapterRanges[chapter].end;
    if (time >= boundary - 0.18 && time <= boundary + 0.55) {
      const reverse = smooth(boundary - 0.18, boundary + 0.55, time);
      morph = 1 - reverse;
      activeA = chapter;
      activeB = chapter;
      activeMix = 0;
      break;
    }
  }

  // 曲线完全恢复之后，才调用原封面式的章节交接：上一球熄灭、下一球放大点亮，
  // 并让精细光头沿整条原始曲线从左向右推进。时序刻意晚于主体转场。
  if (segment.type === 'cover' && segment.chapter > 0 && segment.local >= 0.55) {
    morph = 0;
    activeA = segment.chapter - 1;
    activeB = segment.chapter;
    activeMix = smoother(0.72, 1.92, segment.local);
    coverSweep = smoother(0.70, 2.24, segment.local);
    coverSweepAlpha = smooth(0.62, 0.82, segment.local) * (1 - smooth(2.16, 2.48, segment.local));
  } else if (segment.type === 'cover' && segment.chapter === 0) {
    coverSweep = smoother(0.48, 2.02, segment.local);
    coverSweepAlpha = smooth(0.39, 0.58, segment.local) * (1 - smooth(1.94, 2.26, segment.local));
  }
  return { segment, morph, activeA, activeB, activeMix, coverSweep, coverSweepAlpha };
}

function progressPath(nodes) {
  let d = `M${nodes[0].x.toFixed(2)} ${nodes[0].y.toFixed(2)}`;
  for (let i = 0; i < nodes.length - 1; i++) {
    const a = nodes[i];
    const b = nodes[i + 1];
    const mid = (a.x + b.x) / 2;
    d += ` C${mid.toFixed(2)} ${a.y.toFixed(2)} ${mid.toFixed(2)} ${b.y.toFixed(2)} ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
  }
  return d;
}

function progressPoint(nodes, progress) {
  const p = clamp(progress) * (nodes.length - 1);
  const index = Math.min(nodes.length - 2, Math.floor(p));
  const u = p - index;
  const v = 1 - u;
  const a = nodes[index];
  const b = nodes[index + 1];
  const mid = (a.x + b.x) / 2;
  return {
    x: v*v*v*a.x + 3*v*v*u*mid + 3*v*u*u*mid + u*u*u*b.x,
    y: v*v*v*a.y + 3*v*v*u*a.y + 3*v*u*u*b.y + u*u*u*b.y,
  };
}

function progressSlice(nodes, from, to, samples = 64) {
  const start = clamp(Math.min(from, to));
  const end = clamp(Math.max(from, to));
  if (end - start < 0.0001) return '';
  const points = [];
  const count = Math.max(2, Math.ceil(samples * (end - start)));
  for (let i = 0; i <= count; i++) {
    const point = progressPoint(nodes, mix(start, end, i / count));
    points.push(`${point.x.toFixed(2)} ${point.y.toFixed(2)}`);
  }
  return `M${points.join(' L')}`;
}

function renderOverlaySvg(time) {
  const state = progressState(time);
  const { segment, morph, activeA, activeB, activeMix, coverSweep, coverSweepAlpha } = state;
  // 封面端严格继承原脚本 progressNodes + translate(33 21) 后的实际位置，
  // 再按 1920→1280 的比例换算；直线端由这些节点连续插值衍生。
  const curveX = [450, 534, 618, 702, 786, 870, 954, 1038, 1122];
  const curveY = [100.67, 143.33, 101.33, 143.33, 101.33, 143.33, 101.33, 143.33, 101.33];
  const lineStartX = 785;
  const lineEndX = 1185;
  const lineY = 46.5;
  const nodes = icons.map((icon, index) => ({
    icon,
    x: mix(curveX[index], lineStartX + index * (lineEndX - lineStartX) / 8, morph),
    y: mix(curveY[index], lineY, morph),
  }));
  const d = progressPath(nodes);
  const flow = (-time * 31).toFixed(2);
  const firstCoverReveal = segment.chapter === 0 && segment.type === 'cover'
    ? smooth(0.48, 1.62, segment.local)
    : 1;
  const pulse = 0.5 + 0.5 * Math.sin(time * 2.7);
  // “活跃用户 / 交流会”是九大环节结束后的独立品牌板块，不继承第 09
  // 环节进度。进度层在 PPT 生成片段结束前先柔和淡出，进入该板块时
  // 已完全消失。
  let progressOpacity = 1;
  if (segment.chapter === 8 && segment.type === 'content') {
    if (segment.contentIndex === 0) {
      progressOpacity = 1 - smooth(Math.max(0, segment.duration - 0.62), Math.max(0.01, segment.duration - 0.08), segment.local);
    } else if (segment.contentIndex >= 1) {
      progressOpacity = 0;
    }
  }

  // 原封面式左→右光头。保留低亮呼吸尾迹，越靠近右端越宽、越亮；
  // 位移使用 quintic smootherstep，形成慢起步—中段加速—末端减速。
  const sweepHead = clamp(coverSweep);
  const sweepTail = clamp(sweepHead - 0.17);
  const sweepTip = progressPoint(nodes, sweepHead);
  const retainedTrail = progressSlice(nodes, 0, sweepHead, 88);
  const breath = 0.72 + 0.28 * (0.5 + 0.5 * Math.sin(time * 3.15));
  const headSegments = [];
  const headSegmentCount = 11;
  for (let index = 0; index < headSegmentCount; index++) {
    const p0 = index / headSegmentCount;
    const p1 = (index + 1) / headSegmentCount;
    const localFrom = mix(sweepTail, sweepHead, p0);
    const localTo = mix(sweepTail, sweepHead, p1);
    const p = p1;
    const width = 1.15 + 6.7 * Math.pow(p, 1.55);
    const alpha = 0.10 + 0.90 * Math.pow(p, 1.35);
    const color = p > 0.82 ? '#ffffff' : p > 0.56 ? '#e8ddff' : p > 0.28 ? '#b79cff' : '#765be1';
    headSegments.push(`<path d="${progressSlice(nodes, localFrom, localTo, 18)}" fill="none" stroke="${color}" stroke-width="${width.toFixed(2)}" stroke-linecap="round" stroke-linejoin="round" opacity="${alpha.toFixed(3)}" ${p > 0.50 ? 'filter="url(#headGlow)"' : ''}/>`);
  }
  const sweepCore = coverSweepAlpha <= 0.001 ? '' : `<g opacity="${coverSweepAlpha.toFixed(3)}">
    <path d="${retainedTrail}" fill="none" stroke="#725be1" stroke-width="6.8" stroke-linecap="round" stroke-linejoin="round" opacity="${(0.052 * breath).toFixed(3)}" filter="url(#lineGlow)"/>
    <path d="${retainedTrail}" fill="none" stroke="url(#flowGrad)" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" opacity="${(0.20 * breath).toFixed(3)}"/>
    <path d="${retainedTrail}" fill="none" stroke="url(#flowGrad)" stroke-width="0.78" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="8 34" stroke-dashoffset="${(-time * 14).toFixed(2)}" opacity="${(0.25 * breath).toFixed(3)}"/>
    ${headSegments.join('')}
    <circle cx="${sweepTip.x.toFixed(2)}" cy="${sweepTip.y.toFixed(2)}" r="13.5" fill="#8c72ff" filter="url(#wideGlow)" opacity=".24"/>
    <circle cx="${sweepTip.x.toFixed(2)}" cy="${sweepTip.y.toFixed(2)}" r="6.4" fill="#f5f1ff" filter="url(#ballGlow)" opacity=".96"/>
    <circle cx="${sweepTip.x.toFixed(2)}" cy="${sweepTip.y.toFixed(2)}" r="2.35" fill="#ffffff" opacity="1"/>
  </g>`;

  const nodeMarkup = nodes.map((node, index) => {
    const strengthA = index === activeA ? 1 - activeMix : 0;
    const strengthB = index === activeB ? activeMix : 0;
    const strength = Math.max(strengthA, strengthB);
    const idleR = mix(14.67, 7, morph);
    const activeR = mix(27.33, 15, morph);
    const r = mix(idleR, activeR, strength);
    const iconScale = mix(mix(0.413, 0.20, morph), mix(0.693, 0.43, morph), strength);
    const iconOpacity = mix(0.13, 0.96, strength);
    const halo = (0.08 + 0.04 * pulse) * strength;
    const rotation = (time * 90 + index * 11) % 360;
    return `<g>
      ${strength > 0.01 ? `<circle cx="${node.x}" cy="${node.y}" r="${(r + 17).toFixed(2)}" fill="#7f69ff" opacity="${halo.toFixed(3)}" filter="url(#wideGlow)"/>
      <ellipse cx="${node.x}" cy="${node.y}" rx="${(r + 9).toFixed(2)}" ry="${(r + 4).toFixed(2)}" fill="none" stroke="#e4dcff" stroke-width="0.9" stroke-dasharray="6 13" opacity="${(0.38 * strength).toFixed(3)}" transform="rotate(${rotation.toFixed(1)} ${node.x} ${node.y})"/>` : ''}
      <circle cx="${node.x}" cy="${node.y}" r="${r.toFixed(2)}" fill="url(#${strength > 0.01 ? 'activeBall' : 'idleBall'})" opacity="${(0.18 + 0.58 * strength).toFixed(3)}" stroke="#fff" stroke-width="${(0.7 + 1.1 * strength).toFixed(2)}" stroke-opacity="${(0.08 + 0.70 * strength).toFixed(3)}" ${strength > 0.01 ? 'filter="url(#ballGlow)"' : ''}/>
      ${iconSvg(node.icon, node.x, node.y, iconScale, iconOpacity)}
    </g>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
  <svg width="${W}" height="${H}" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="activeBall" cx="38%" cy="27%" r="76%"><stop offset="0" stop-color="#fff"/><stop offset=".28" stop-color="#d7ceff"/><stop offset=".65" stop-color="#826fff"/><stop offset="1" stop-color="#2e226f"/></radialGradient>
      <radialGradient id="idleBall" cx="40%" cy="30%" r="75%"><stop offset="0" stop-color="#7e77b7"/><stop offset="1" stop-color="#171625"/></radialGradient>
      <linearGradient id="pathGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4d458e" stop-opacity=".16"/><stop offset=".5" stop-color="#9486ff" stop-opacity=".40"/><stop offset="1" stop-color="#4d458e" stop-opacity=".13"/></linearGradient>
      <linearGradient id="flowGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7c68e8"/><stop offset=".48" stop-color="#bb9fff"/><stop offset=".75" stop-color="#e8e2ff"/><stop offset="1" stop-color="#7caeff"/></linearGradient>
      <filter id="ballGlow" x="-160%" y="-160%" width="420%" height="420%"><feDropShadow dx="0" dy="0" stdDeviation="2.5" flood-color="#fff" flood-opacity=".85"/><feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#a28cff" flood-opacity=".66"/><feDropShadow dx="0" dy="4" stdDeviation="15" flood-color="#5f46e2" flood-opacity=".42"/></filter>
      <filter id="wideGlow" x="-180%" y="-180%" width="460%" height="460%"><feGaussianBlur stdDeviation="8"/></filter>
      <filter id="lineGlow" x="-20%" y="-220%" width="140%" height="540%"><feGaussianBlur stdDeviation="3.5"/></filter>
      <filter id="headGlow" x="-55%" y="-260%" width="210%" height="620%"><feGaussianBlur stdDeviation="2.2"/><feDropShadow dx="0" dy="0" stdDeviation="4.6" flood-color="#b79cff" flood-opacity=".72"/></filter>
    </defs>
    <g opacity="${progressOpacity.toFixed(3)}">
      <path d="${d}" pathLength="1" fill="none" stroke="#302c55" stroke-width="4.6" stroke-dasharray="${firstCoverReveal.toFixed(4)} 1" opacity=".13" filter="url(#lineGlow)"/>
      <path d="${d}" pathLength="1" fill="none" stroke="url(#pathGrad)" stroke-width="1.35" stroke-dasharray="${firstCoverReveal.toFixed(4)} 1" opacity=".92"/>
      <path d="${d}" pathLength="1" fill="none" stroke="url(#flowGrad)" stroke-width="3.2" stroke-linecap="round" stroke-dasharray=".002 .044" stroke-dashoffset="${(Number(flow) / 1000).toFixed(4)}" opacity="${(0.14 * firstCoverReveal).toFixed(3)}" filter="url(#lineGlow)"/>
      <path d="${d}" pathLength="1" fill="none" stroke="url(#flowGrad)" stroke-width=".85" stroke-linecap="round" stroke-dasharray=".008 .057" stroke-dashoffset="${(Number(flow) / 1000).toFixed(4)}" opacity="${(0.29 * firstCoverReveal).toFixed(3)}"/>
      ${sweepCore}
      ${nodeMarkup}
    </g>
  </svg>`;
}

function renderBase() {
  const args = ['-y'];
  timeline.forEach((segment) => args.push('-i', segment.source));
  const filters = timeline.map((segment, index) => {
    return `[${index}:v]trim=duration=${segment.duration},setpts=PTS-STARTPTS,scale=${W}:${H}:flags=lanczos,setsar=1,fps=${FPS},format=yuv420p[v${index}]`;
  });
  filters.push(`${timeline.map((_, index) => `[v${index}]`).join('')}concat=n=${timeline.length}:v=1:a=0[base]`);
  args.push(
    '-filter_complex', filters.join(';'), '-map', '[base]', '-an',
    '-c:v', 'libx264', '-preset', previewMode ? 'veryfast' : 'medium',
    '-crf', previewMode ? '22' : '12', '-pix_fmt', 'yuv420p', '-r', String(FPS),
    '-video_track_timescale', '60000', '-movflags', '+faststart', baseVideo,
  );
  run(args, 'render native nine-chapter base');
}

function ensureOriginalCoverBases() {
  if (!forceSourceRender && covers.every((file) => fs.existsSync(file))) return;
  const generator = path.join(cwd, '.tools', 'render_concetto_chapter_covers_clean_v01.mjs');
  const result = spawnSync(process.execPath, [generator], {
    cwd,
    stdio: 'inherit',
    env: {
      ...process.env,
      RENDER_MODE: previewMode ? 'preview' : 'final',
      CHAPTERS: '01,02,03,04,05,06,07,08,09',
      PROGRESS_MODE: 'none',
      FRAME_CONCURRENCY: String(FRAME_CONCURRENCY),
    },
  });
  if (result.status !== 0) throw new Error(`original cover base render failed with status ${result.status}`);
  covers.forEach((file) => {
    if (!fs.existsSync(file)) throw new Error(`original cover base missing after render: ${file}`);
  });
}

function ensureNativeOperationPages() {
  const required = chapters.flatMap((chapter) => chapter.content.filter((file) => file.startsWith(opDir)));
  if (!forceSourceRender && required.every((file) => fs.existsSync(file))) return;
  const generator = path.join(cwd, '.tools', 'rebuild_operation_pages_clean_header_v01.mjs');
  const result = spawnSync(process.execPath, [generator], {
    cwd,
    stdio: 'inherit',
    env: { ...process.env, RENDER_MODE: 'final' },
  });
  if (result.status !== 0) throw new Error(`native operation page render failed with status ${result.status}`);
  required.forEach((file) => {
    if (!fs.existsSync(file)) throw new Error(`native operation page missing after render: ${file}`);
  });
}

function assertNativeSources() {
  covers.forEach((file) => {
    if (!fs.existsSync(file)) throw new Error(`missing native cover: ${file}`);
  });
  chapters.flatMap((chapter) => chapter.content).forEach((file) => {
    if (!fs.existsSync(file)) throw new Error(`missing native chapter content: ${file}`);
  });
}

function validatePlan() {
  const forbidden = /operation_pages_clean_header|rebuild_operation_pages|refined_v33|三段试验|qa_operation|screenshot|截图/i;
  const allSources = [...covers, ...chapters.flatMap((chapter) => chapter.content)];
  const forbiddenSources = allSources.filter((file) => forbidden.test(file));
  if (chapters.length !== 9) throw new Error(`chapter count must be 9, got ${chapters.length}`);
  if (forbiddenSources.length) throw new Error(`forbidden prior-edit dependency: ${forbiddenSources.join(', ')}`);
  console.log(JSON.stringify({
    mode: previewMode ? 'preview' : 'final',
    chapters: chapters.length,
    nativeOperationSegments: chapters.flatMap((chapter) => chapter.content).filter((file) => file.startsWith(opDir)).length,
    priorEditOrScreenshotDependencies: 0,
    output,
  }, null, 2));
}

async function renderOverlayFrames() {
  const resume = process.env.RESUME_FRAMES === '1';
  if (!resume) fs.rmSync(overlayDir, { recursive: true, force: true });
  fs.mkdirSync(overlayDir, { recursive: true });
  const frameCount = Math.round(totalDur * FPS);
  let next = 0;
  async function worker() {
    while (true) {
      const index = next++;
      if (index >= frameCount) return;
      const time = index / FPS;
      const outputFrame = path.join(overlayDir, `frame_${String(index).padStart(5, '0')}.png`);
      if (!resume || !fs.existsSync(outputFrame)) {
        await sharp(Buffer.from(renderOverlaySvg(time))).png().toFile(outputFrame);
      }
    }
  }
  await Promise.all(Array.from({ length: FRAME_CONCURRENCY }, () => worker()));
}

function compositeFinal() {
  run([
    '-y', '-i', baseVideo,
    '-framerate', String(FPS), '-i', path.join(overlayDir, 'frame_%05d.png'),
    '-filter_complex', '[0:v][1:v]overlay=0:0:shortest=1,format=yuv420p[v]',
    '-map', '[v]', '-an',
    '-c:v', 'libx264', '-preset', previewMode ? 'veryfast' : 'medium',
    '-crf', previewMode ? '20' : '12', '-pix_fmt', 'yuv420p', '-r', String(FPS),
    '-video_track_timescale', '60000', '-movflags', '+faststart', output,
  ], 'composite production-native persistent progress');
}

if (validateOnly) {
  validatePlan();
} else {
  ensureOriginalCoverBases();
  ensureNativeOperationPages();
  assertNativeSources();
  buildTimeline();
  renderBase();
  await renderOverlayFrames();
  compositeFinal();
  console.log(output);
}
