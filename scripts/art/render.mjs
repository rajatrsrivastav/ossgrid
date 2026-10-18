/**
 * Renders OSSGrid artwork offline and writes optimized AVIF/WebP to public/art/.
 *
 *   node scripts/art/render.mjs            # every scene
 *   node scripts/art/render.mjs gsoc lfx   # selected scenes
 *
 * Each scene is an HTML page in scripts/art/ that renders with three.js (a dev dependency only)
 * in headless Chromium and sets window.__done. Optional window.__meta is written next to the images
 * as <name>.json, e.g. projected node positions for live labels.
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import sharp from "sharp";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "public/art");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json" };

const SCENES = {
  hero: { page: "hero-scene.html", jobs: [
    { variant: "desktop", w: 2560, h: 1440, base: "hero-grid", widths: [2560, 1600, 1080], lqip: "hero-grid-desktop-lqip.txt" },
    { variant: "mobile", w: 1170, h: 2340, base: "hero-grid-mobile", widths: [1170, 780], lqip: "hero-grid-mobile-lqip.txt" },
  ] },
  gsoc: { page: "gsoc-scene.html", jobs: [
    { variant: "desktop", w: 2400, h: 1500, base: "exhibit-gsoc", widths: [2400, 1600, 960] },
    { variant: "mobile", w: 1170, h: 1460, base: "exhibit-gsoc-mobile", widths: [1170, 780] },
  ] },
  lfx: { page: "lfx-scene.html", jobs: [
    { variant: "desktop", w: 2400, h: 1500, base: "exhibit-lfx", widths: [2400, 1600, 960] },
    { variant: "mobile", w: 1170, h: 1460, base: "exhibit-lfx-mobile", widths: [1170, 780] },
  ] },
  network: { page: "network-scene.html", jobs: [
    { variant: "desktop", w: 2880, h: 1240, base: "network", widths: [2880, 1920, 1200], meta: "network.json" },
    { variant: "mobile", w: 1170, h: 1560, base: "network-mobile", widths: [1170, 780], meta: "network-mobile.json" },
  ] },
};

const wanted = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(SCENES);

const server = http.createServer((req, res) => {
  const url = decodeURIComponent(new URL(req.url, "http://x").pathname);
  const file = path.join(ROOT, url);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const port = server.address().port;

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
for (const name of wanted) {
  const scene = SCENES[name];
  if (!scene) throw new Error(`Unknown scene ${name}`);
  for (const job of scene.jobs) {
    const page = await browser.newPage({ viewport: { width: job.w, height: job.h }, deviceScaleFactor: 1 });
    page.on("pageerror", (e) => console.error(`${name} error:`, e.message));
    page.on("console", (m) => { if (m.type() === "error") console.error(`${name} console:`, m.text()); });
    const t = Date.now();
    await page.goto(`http://localhost:${port}/scripts/art/${scene.page}?variant=${job.variant}&w=${job.w}&h=${job.h}`);
    await page.waitForFunction(() => window.__done === true, null, { timeout: 600_000 });
    const png = await page.locator("canvas").screenshot({ type: "png" });
    fs.writeFileSync(path.join(OUT, `.${job.base}-master.png`), png);
    const sizes = [];
    for (const width of job.widths) {
      const img = sharp(png).resize({ width });
      await img.clone().webp({ quality: 80, effort: 6 }).toFile(path.join(OUT, `${job.base}-${width}.webp`));
      await img.clone().avif({ quality: 52, effort: 6 }).toFile(path.join(OUT, `${job.base}-${width}.avif`));
      sizes.push(`${width}: ${Math.round(fs.statSync(path.join(OUT, `${job.base}-${width}.webp`)).size / 1024)}k webp / ${Math.round(fs.statSync(path.join(OUT, `${job.base}-${width}.avif`)).size / 1024)}k avif`);
    }
    if (job.lqip) {
      const lqip = await sharp(png).resize({ width: 32 }).blur(1).webp({ quality: 50 }).toBuffer();
      fs.writeFileSync(path.join(OUT, job.lqip), `data:image/webp;base64,${lqip.toString("base64")}`);
    }
    if (job.meta) {
      const meta = await page.evaluate(() => window.__meta);
      fs.writeFileSync(path.join(OUT, job.meta), JSON.stringify({ width: job.w, height: job.h, ...meta }, null, 2) + "\n");
    }
    console.log(`${name}/${job.variant}: ${((Date.now() - t) / 1000).toFixed(1)}s  ${sizes.join(" | ")}`);
    await page.close();
  }
}
await browser.close();
server.close();
