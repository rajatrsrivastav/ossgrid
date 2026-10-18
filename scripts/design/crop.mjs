/** Slices a tall capture into chunks for review: node scripts/design/crop.mjs <file> <out-prefix> [chunk height] */
import sharp from "sharp";
const [, , file, out, chunk = "1500"] = process.argv;
const img = sharp(file); const m = await img.metadata();
const h = Number(chunk); let i = 0;
for (let y = 0; y < m.height; y += h) {
  await sharp(file).extract({ left: 0, top: y, width: m.width, height: Math.min(h, m.height - y) }).toFile(`${out}-${String(i++).padStart(2, "0")}.webp`);
}
console.log(m.width, m.height, i);
