import fs from 'fs';
import path from 'path';
import sharp from './thumbs/node_modules/sharp/dist/index.mjs';

const cwd = process.cwd();
const src = path.join(cwd, '更新内容', 'ea5f712f7973b46ffb1cfba395ff4301.png');
const outDir = path.join(cwd, '更新内容_修正版');
const out = path.join(outDir, 'ea5f712f7973b46ffb1cfba395ff4301_删除点数两行.png');
const preview = path.join(cwd, '06_预览输出', 'debug_update_asset', 'update_content_clean_text_preview.png');

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(path.dirname(preview), { recursive: true });

const meta = await sharp(src).metadata();
const W = meta.width;
const H = meta.height;

// Native coordinates calibrated on the 1672×941 update-content artwork.
// Instead of trying to inpaint only the deleted glyphs (which leaves ghosting
// on this translucent glass card), rebuild the whole bullet-list area and keep
// only the three wanted rows:
//   交互界面焕新
//   子账号共享主账号
//   免费用户账号权益升级
// The title/number/icon/card border remain from the original bitmap.
const patch = `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cardWash" x1="0%" y1="0%" x2="95%" y2="100%">
      <stop offset="0%" stop-color="#f2eeff" stop-opacity="0.98"/>
      <stop offset="45%" stop-color="#ebe6ff" stop-opacity="0.96"/>
      <stop offset="100%" stop-color="#ded8ff" stop-opacity="0.88"/>
    </linearGradient>
    <radialGradient id="softBloom" cx="30%" cy="40%" r="85%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.26"/>
      <stop offset="58%" stop-color="#ece7ff" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#d6d0ff" stop-opacity="0"/>
    </radialGradient>
    <filter id="feather" x="-20%" y="-45%" width="140%" height="190%">
      <feGaussianBlur stdDeviation="1.8"/>
    </filter>
  </defs>

  <!-- glass wash over the whole list area -->
  <rect x="255" y="342" width="390" height="176" rx="8" fill="url(#cardWash)" opacity="0.99" filter="url(#feather)"/>
  <rect x="266" y="350" width="366" height="156" rx="5" fill="url(#cardWash)" opacity="0.97"/>
  <rect x="266" y="350" width="366" height="156" rx="5" fill="url(#softBloom)" opacity="0.52"/>
  <path d="M 274 402 C 380 394, 505 397, 628 386" fill="none" stroke="#ffffff" stroke-opacity="0.10" stroke-width="1.1"/>
  <path d="M 274 486 C 380 478, 505 481, 628 470" fill="none" stroke="#ffffff" stroke-opacity="0.08" stroke-width="1.1"/>

  <g font-family="'PingFang SC','Microsoft YaHei','Noto Sans CJK SC',Arial,sans-serif" font-size="24" font-weight="600" fill="#4b5fd6" opacity="0.92">
    <text x="324" y="371">·</text><text x="352" y="371">交互界面焕新</text>
    <text x="324" y="404">·</text><text x="352" y="404">子账号共享主账号</text>
    <text x="324" y="437">·</text><text x="352" y="437">免费用户账号权益升级</text>
  </g>
</svg>`;

await sharp(src)
  .composite([{ input: Buffer.from(patch), blend: 'over' }])
  .png()
  .toFile(out);

await sharp(out)
  .extract({ left: 300, top: 310, width: 390, height: 240 })
  .resize({ width: 1170, kernel: sharp.kernel.nearest })
  .png()
  .toFile(preview);

console.log(out);
console.log(preview);
