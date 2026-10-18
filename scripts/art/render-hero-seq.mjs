/**
 * Renders the hero scroll sequence into public/art/seq/hero-<variant>-<theme>/.
 *
 *   node scripts/art/render-hero-seq.mjs [--theme dark|light] [--variant desktop|mobile]
 *
 * Frame 0 matches the static hero poster. Desktop frames are 1920x1080 (written at 1920 and 1080
 * wide), mobile frames 720x1440. manifest.json lists the frame count and sizes.
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import sharp from "sharp";

const ROOT = process.cwd();
const args = process.argv.slice(2);
const opt = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const themes = opt("--theme") ? [opt("--theme")] : ["dark", "light"];
const JOBS = {
  desktop: { w: 1920, h: 1080, frames: 48, widths: [1920, 1080] },
  mobile: { w: 720, h: 1440, frames: 32, widths: [720] },
};
const variants = opt("--variant") ? [opt("--variant")] : Object.keys(JOBS);
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json" };

const server = http.createServer((req, res) => {
  const file = path.join(ROOT, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const port = server.address().port;
const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });

for (const variant of variants) {
  const job = JOBS[variant];
  for (const theme of themes) {
    const out = path.join(ROOT, "public/art/seq", `hero-${variant}-${theme}`);
    fs.rmSync(out, { recursive: true, force: true });
    fs.mkdirSync(out, { recursive: true });
    const page = await browser.newPage({ viewport: { width: job.w, height: job.h }, deviceScaleFactor: 1 });
    page.on("pageerror", (e) => console.error(`${variant}/${theme} error:`, e.message));
    await page.goto(`http://localhost:${port}/scripts/art/hero-scene.html?variant=${variant}&w=${job.w}&h=${job.h}${theme === "light" ? "&theme=light" : ""}`);
    await page.waitForFunction(() => window.__done === true, null, { timeout: 600_000 });
    const t0 = Date.now();
    let bytes = 0;
    for (let i = 0; i < job.frames; i++) {
      await page.evaluate((t) => window.renderFrame(t), i / (job.frames - 1));
      const png = await page.locator("canvas").screenshot({ type: "png" });
      const name = String(i).padStart(3, "0");
      for (const width of job.widths) {
        const file = path.join(out, `${name}-${width}.webp`);
        await sharp(png).resize({ width }).webp({ quality: 62, effort: 6 }).toFile(file);
        if (width === job.widths[0]) bytes += fs.statSync(file).size;
      }
    }
    fs.writeFileSync(path.join(out, "manifest.json"), JSON.stringify({ variant, theme, frames: job.frames, width: job.w, height: job.h, widths: job.widths }, null, 2) + "\n");
    console.log(`hero ${variant}/${theme}: ${job.frames} frames in ${((Date.now() - t0) / 1000).toFixed(0)}s, ${Math.round(bytes / 1024)} kB at ${job.widths[0]}`);
    await page.close();
  }
}
await browser.close();
server.close();
