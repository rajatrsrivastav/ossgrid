/**
 * Full-page screenshots of internal routes for visual review (height capped).
 *   node scripts/design/capture-pages.mjs <base-url> <tag> [dark|light] [route ...]
 */
import { chromium } from "@playwright/test";
import sharp from "sharp";
import fs from "node:fs";

const [, , base = "http://localhost:3011", tag = "p3", scheme = "dark", ...only] = process.argv;
const ROUTES = only.length ? only : ["/gsoc", "/gsoc/numfocus", "/lfx", "/organization/kubeedge", "/proposals", "/guide", "/programs/outreachy", "/contributors", "/contribute", "/does-not-exist"];
fs.mkdirSync("design/iterations/phase3", { recursive: true });
const browser = await chromium.launch();
for (const [name, vp, mobile] of [["desktop", { width: 1440, height: 900 }, false], ["mobile", { width: 390, height: 844 }, true]]) {
  const ctx = await browser.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile, colorScheme: scheme, reducedMotion: "reduce" });
  if (scheme === "light") await ctx.addInitScript(() => { try { localStorage.setItem("theme", "light"); } catch {} });
  let ip = 1;
  for (const route of ROUTES) {
    const page = await ctx.newPage();
    await page.setExtraHTTPHeaders({ "x-forwarded-for": `10.8.${ip++}.2` });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message.slice(0, 140)));
    page.on("console", (m) => { if (m.type() === "error" && !/cloudflareinsights|ERR_FAILED|Failed to load resource|404/.test(m.text())) errors.push(m.text().slice(0, 140)); });
    await page.goto(base + route, { waitUntil: "load" });
    await page.waitForTimeout(1500);
    const png = await page.screenshot({ fullPage: true, type: "png" });
    const meta = await sharp(png).metadata();
    const h = Math.min(meta.height, name === "desktop" ? 4200 : 5200);
    const slug = route.replace(/^\//, "").replace(/[^a-z0-9]+/gi, "-") || "home";
    await sharp(png).extract({ left: 0, top: 0, width: meta.width, height: h }).resize({ width: name === "desktop" ? 1200 : 390 }).webp({ quality: 78 }).toFile(`design/iterations/phase3/${tag}-${scheme}-${name}-${slug}.webp`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    console.log(`${name} ${route}: ${meta.height}px overflow=${overflow}${errors.length ? " ERRORS " + errors.join(" | ") : ""}`);
    await page.close();
  }
  await ctx.close();
}
await browser.close();
