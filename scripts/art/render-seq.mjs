/**
 * Renders scroll-sequence frames for the home program chapters into public/art/seq/<scene>-<theme>/.
 *
 *   node scripts/art/render-seq.mjs [gsoc|lfx ...] [--frames 40] [--theme dark|light]
 *
 * Each frame is written at two widths (1600 and 960) as WebP. A manifest.json per scene and theme
 * lists the frames and the data state at each frame (for example the term or year shown).
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import sharp from "sharp";

const ROOT = process.cwd();
const args = process.argv.slice(2);
const opt = (name, fallback) => (args.includes(name) ? args[args.indexOf(name) + 1] : fallback);
const FRAMES = Number(opt("--frames", 40));
const themes = opt("--theme") ? [opt("--theme")] : ["dark", "light"];
const scenes = args.filter((a) => !a.startsWith("--") && !/^\d+$/.test(a) && !["dark", "light"].includes(a));
const wanted = scenes.length ? scenes : ["lfx", "gsoc"];
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

for (const scene of wanted) {
  for (const theme of themes) {
    const out = path.join(ROOT, "public/art/seq", `${scene}-${theme}`);
    fs.rmSync(out, { recursive: true, force: true });
    fs.mkdirSync(out, { recursive: true });
    const W = 1600, H = 1000;
    const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
    page.on("pageerror", (e) => console.error(`${scene}/${theme} error:`, e.message));
    await page.goto(`http://localhost:${port}/scripts/art/seq-scene.html?scene=${scene}&theme=${theme}&w=${W}&h=${H}`);
    await page.waitForFunction(() => window.__done === true, null, { timeout: 600_000 });
    const states = [];
    let bytes = 0;
    const t0 = Date.now();
    for (let i = 0; i < FRAMES; i++) {
      const t = i / (FRAMES - 1);
      const state = await page.evaluate((tt) => window.renderFrame(tt), t);
      const png = await page.locator("canvas").screenshot({ type: "png" });
      const name = String(i).padStart(3, "0");
      await sharp(png).webp({ quality: 60, effort: 6 }).toFile(path.join(out, `${name}-1600.webp`));
      await sharp(png).resize({ width: 960 }).webp({ quality: 60, effort: 6 }).toFile(path.join(out, `${name}-960.webp`));
      bytes += fs.statSync(path.join(out, `${name}-1600.webp`)).size;
      states.push({ t: +t.toFixed(4), ...state });
    }
    fs.writeFileSync(path.join(out, "manifest.json"), JSON.stringify({ scene, theme, frames: FRAMES, width: W, height: H, states }, null, 2) + "\n");
    console.log(`${scene}/${theme}: ${FRAMES} frames in ${((Date.now() - t0) / 1000).toFixed(0)}s, ${Math.round(bytes / 1024)} kB at 1600`);
    await page.close();
  }
}
await browser.close();
server.close();
