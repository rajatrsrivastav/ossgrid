/**
 * Renders the OSSGrid hero artwork offline and writes optimized WebP/AVIF files to public/art/.
 *
 *   node scripts/art/render-hero.mjs
 *
 * Serves the repo on a local port, opens scripts/art/hero-scene.html in headless Chromium
 * (WebGL via SwiftShader if no GPU), screenshots the canvas, then resizes with sharp.
 * Output is deterministic for a given dataset; re-run after a GSoC data sync if wanted.
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import sharp from "sharp";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "public/art");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json" };

const server = http.createServer((req, res) => {
  const url = decodeURIComponent(new URL(req.url, "http://x").pathname);
  const file = path.join(ROOT, url);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const port = server.address().port;

const jobs = [
  { variant: "desktop", w: 2560, h: 1440, outputs: [["hero-grid-2560", 2560, 82], ["hero-grid-1600", 1600, 80], ["hero-grid-1080", 1080, 78]] },
  { variant: "mobile", w: 1170, h: 2340, outputs: [["hero-grid-mobile-1170", 1170, 80], ["hero-grid-mobile-780", 780, 78]] },
];

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
for (const job of jobs) {
  const page = await browser.newPage({ viewport: { width: job.w, height: job.h }, deviceScaleFactor: 1 });
  page.on("pageerror", (e) => console.error("scene error:", e.message));
  page.on("console", (m) => { if (m.type() === "error") console.error("scene console:", m.text()); });
  const t = Date.now();
  await page.goto(`http://localhost:${port}/scripts/art/hero-scene.html?variant=${job.variant}&w=${job.w}&h=${job.h}`);
  await page.waitForFunction(() => window.__done === true, null, { timeout: 600_000 });
  const png = await page.locator("canvas").screenshot({ type: "png" });
  console.log(`${job.variant}: rendered ${job.w}x${job.h} in ${((Date.now() - t) / 1000).toFixed(1)}s`);
  fs.writeFileSync(path.join(OUT, `.${job.variant}-master.png`), png);
  for (const [name, width, quality] of job.outputs) {
    const img = sharp(png).resize({ width });
    await img.clone().webp({ quality, effort: 6 }).toFile(path.join(OUT, `${name}.webp`));
    await img.clone().avif({ quality: quality - 30, effort: 6 }).toFile(path.join(OUT, `${name}.avif`));
    const kb = (f) => Math.round(fs.statSync(path.join(OUT, f)).size / 1024);
    console.log(`  ${name}: webp ${kb(`${name}.webp`)} kB, avif ${kb(`${name}.avif`)} kB`);
  }
  // A 32 px blurred placeholder, inlined as the hero background until the image loads.
  const lqip = await sharp(png).resize({ width: 32 }).blur(1).webp({ quality: 50 }).toBuffer();
  fs.writeFileSync(path.join(OUT, `hero-grid-${job.variant}-lqip.txt`), `data:image/webp;base64,${lqip.toString("base64")}`);
  await page.close();
}
await browser.close();
server.close();
