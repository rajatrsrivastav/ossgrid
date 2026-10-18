/**
 * Full-page captures of a route at several widths and both themes, tiled for review.
 *   node scripts/design/capture-full.mjs <base> <route> <tag> [widths comma list]
 */
import { chromium } from "@playwright/test";
import sharp from "sharp";
const [, , base = "http://localhost:3011", route = "/", tag = "a0", widthsArg = "1440,390"] = process.argv;
const widths = widthsArg.split(",").map(Number);
const browser = await chromium.launch();
for (const scheme of ["dark", "light"]) {
  for (const w of widths) {
    const mobile = w < 768;
    const ctx = await browser.newContext({ viewport: { width: w, height: mobile ? 844 : 900 }, isMobile: mobile, hasTouch: mobile, colorScheme: scheme, reducedMotion: "reduce" });
    await ctx.addInitScript((t) => { try { localStorage.setItem("theme", t); } catch {} }, scheme);
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message.slice(0, 120)));
    await page.goto(base + route, { waitUntil: "load" });
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 50)); } window.scrollTo(0, 0); });
    await page.waitForTimeout(900);
    const png = await page.screenshot({ fullPage: true });
    const m = await sharp(png).metadata();
    const slug = route === "/" ? "home" : route.replace(/^\//, "").replace(/[^a-z0-9]+/gi, "-");
    const outW = Math.min(w, 960);
    // WebP tops out at 16383px; keep the top of very long pages.
    const maxH = Math.floor(16000 * w / outW);
    await sharp(png).extract({ left: 0, top: 0, width: m.width, height: Math.min(m.height, maxH) }).resize({ width: outW }).webp({ quality: 74 }).toFile(`design/iterations/phase4/${tag}-${slug}-${scheme}-${w}.webp`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    console.log(`${scheme} ${w}: ${m.height}px overflow=${overflow}${errors.length ? " ERR " + errors.join(" | ") : ""}`);
    await ctx.close();
  }
}
await browser.close();
