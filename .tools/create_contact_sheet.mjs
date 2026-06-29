import fs from 'node:fs/promises';
import path from 'node:path';

const sharp = (await import(path.join(process.cwd(), '.tools/thumbs/node_modules/sharp/dist/index.mjs'))).default;
const [inputDir, outputPrefix] = process.argv.slice(2);
const cellWidth = 180;
const cellHeight = 132;
const columns = 8;
const perPage = 48;
const files = (await fs.readdir(inputDir))
  .filter((name) => /\.(png|jpe?g|webp)$/i.test(name))
  .sort();

for (let start = 0, page = 1; start < files.length; start += perPage, page += 1) {
  const pageFiles = files.slice(start, start + perPage);
  const rows = Math.ceil(pageFiles.length / columns);
  const canvas = sharp({
    create: {
      width: columns * cellWidth,
      height: rows * cellHeight,
      channels: 4,
      background: '#090512',
    },
  });
  const composites = await Promise.all(pageFiles.map(async (name, index) => {
    const image = await sharp(path.join(inputDir, name))
      .resize({ width: cellWidth - 8, height: cellHeight - 26, fit: 'contain', background: '#171027' })
      .png()
      .toBuffer();
    const label = Buffer.from(`<svg width="${cellWidth - 8}" height="18"><text x="2" y="14" font-family="Arial" font-size="10" fill="#d9c9ff">${name.slice(0, 14)}</text></svg>`);
    const left = (index % columns) * cellWidth + 4;
    const top = Math.floor(index / columns) * cellHeight + 4;
    return [
      { input: image, left, top },
      { input: label, left, top: top + cellHeight - 22 },
    ];
  }));
  await canvas.composite(composites.flat()).png().toFile(`${outputPrefix}_${page}.png`);
}
