/**
 * Screenshots each home story section at desktop and mobile sizes for visual review.
 *   node scripts/design/capture-sections.mjs <base-url> <tag> [light]
 * Writes design/iterations/phase2/<tag>-<viewport>-<section>.webp and prints basic metrics.
 */
import { chromium } from "@playwright/test";
import sharp from "sharp";

const [, , base = "http://localhost:3011", tag = "s1", scheme = "dark"] = process.argv;
const sections = ["hero", "mission", "live-programs", "featured", "programs", "network", "playbook", "faq", "community", "final-title"];
const browser = await chromium.launch();
for (const [name, vp, mobile] of [["desktop", { width: 1440, height: 900 }, false], ["mobile", { width: 390, height: 844 }, true]]) {
  const ctx = await browser.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile, colorScheme: scheme, reducedMotion: "reduce" });
  if (scheme === "light") await ctx.addInitScript(() => { try { localStorage.setItem("theme", "light"); } catch {} });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error" && !/cloudflareinsights|ERR_FAILED|Failed to load resource/.test(m.text())) errors.push(m.text().slice(0, 160)); });
  await page.goto(base + "/", { waitUntil: "load" });
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } window.scrollTo(0, 0); });
  await page.waitForTimeout(800);
  for (const id of sections) {
    const el = page.locator(`#${id}`).first();
    if (!(await el.count())) { console.log(`${name} missing #${id}`); continue; }
    const target = id === "final-title" ? el.locator("xpath=ancestor::section") : el;
    await target.scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    const png = await target.screenshot({ type: "png" });
    const meta = await sharp(png).metadata();
    const file = `design/iterations/phase2/${tag}-${scheme}-${name}-${id.replace("-title", "")}.webp`;
    await sharp(png).resize({ width: Math.min(meta.width, 1440) }).webp({ quality: 82 }).toFile(file);
    console.log(`${name} #${id}: ${meta.width}x${meta.height}`);
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  console.log(`${name}: overflow=${overflow} errors=${errors.length ? errors.join(" | ") : "none"}`);
  await ctx.close();
}
await browser.close();
