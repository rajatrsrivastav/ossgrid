import { test, expect, type Page } from "@playwright/test";

/**
 * Smoke test for the public routes. Structural assertions always run; the screenshot
 * assertions compare against local baselines when they exist (see playwright.config.ts).
 */
const ORG_SLUG = "kubeedge";

async function settle(page: Page) {
  // Third-party widgets (analytics, support button) can keep the network busy; idle is best-effort.
  await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});
  // Freeze CSS animations and scroll-reveals so screenshots are stable.
  await page.addStyleTag({ content: "*, *::before, *::after { animation: none !important; transition: none !important; }" });
  await page.evaluate(() => window.scrollTo(0, 0));
}

test("landing page renders programs and a link to the LFX explorer", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await settle(page);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("#programs")).toBeVisible();
  // Cinematic hero: live headline, two real routes, panels linking to real organization pages.
  await expect(page.locator("#hero-title")).toHaveText(/find your place\s*in open source\./);
  await expect(page.locator("#hero").getByRole("link", { name: "Explore programs" })).toHaveAttribute("href", "/#programs");
  await expect(page.locator("#hero").getByRole("link", { name: "Discover organizations" })).toHaveAttribute("href", "/gsoc");
  for (const href of await page.locator("#hero .cine-panel").evaluateAll((els) => els.map((e) => e.getAttribute("href")))) {
    expect(href).toMatch(/^\/(gsoc|organization)\/[a-z0-9-]+$/);
  }
  await expect(page.locator('button[aria-controls="mobile-nav"]')).toHaveCount(1);
  await expect(page.getByRole("link", { name: /Browse LFX orgs/i }).first()).toHaveAttribute("href", "/lfx");
  expect(errors).toEqual([]);
  await expect(page).toHaveScreenshot("home.png", { fullPage: false });
});

test("LFX explorer lists organizations and filters from the URL", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/lfx");
  await settle(page);
  await expect(page.getByRole("heading", { level: 1, name: /LFX Mentorship organizations/ })).toBeVisible();
  const cards = page.locator("#grid article");
  await expect(cards.first()).toBeVisible();
  const total = await cards.count();
  expect(total).toBeGreaterThan(50);
  await expect(page.getByText(/^\d+ organizations$/).first()).toBeVisible();
  await expect(page).toHaveScreenshot("lfx.png", { fullPage: false });

  // URL-driven filters stay backward compatible: q, tech and years.
  await page.goto("/lfx?tech=Go&years=2025");
  await settle(page);
  const filtered = await page.locator("#grid article").count();
  expect(filtered).toBeGreaterThan(0);
  expect(filtered).toBeLessThan(total);
  // Phones keep the facets in a drawer.
  const drawerButton = page.getByRole("button", { name: /^Filters/ });
  if (await drawerButton.isVisible()) await drawerButton.click();
  await expect(page.getByRole("checkbox", { name: /^Go\b/ })).toBeChecked();
  await expect(page.getByRole("checkbox", { name: /^2025\b/ })).toBeChecked();
  await page.keyboard.press("Escape");

  await page.goto("/lfx?q=kubernetes");
  await settle(page);
  await expect(page.getByRole("searchbox").first()).toHaveValue("kubernetes");
  expect(await page.locator("#grid article").count()).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

test("LFX explorer filters interactively and syncs the URL", async ({ page }) => {
  await page.goto("/lfx");
  await settle(page);
  const before = await page.locator("#grid article").count();
  await page.getByRole("tab", { name: "Dev tools" }).click();
  await expect(page).toHaveURL(/categories=Development\+Tools/);
  await expect.poll(() => page.locator("#grid article").count()).toBeLessThan(before);
  expect(await page.locator("#grid article").count()).toBeGreaterThan(0);
  await page.getByRole("button", { name: /^Clear \(/ }).click();
  await expect(page).toHaveURL(/\/lfx$/);
  await expect.poll(() => page.locator("#grid article").count()).toBe(before);
});

test("organization page renders projects and structured data", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  // src/proxy.ts rate-limits /organization/* per IP; parallel workers would otherwise share one.
  await page.setExtraHTTPHeaders({ "x-forwarded-for": `10.0.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}` });
  await page.goto(`/organization/${ORG_SLUG}`);
  await settle(page);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("#projects")).toBeVisible();
  expect(await page.locator("script[type='application/ld+json']").count()).toBeGreaterThanOrEqual(2);
  await expect(page.getByRole("link", { name: /LFX organizations/ }).first()).toHaveAttribute("href", "/lfx");
  expect(errors).toEqual([]);
  await expect(page).toHaveScreenshot("organization.png", { fullPage: false });
});

test("GSoC explorer loads 2016 to 2026 organizations and filters by year, technology and quick filter", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/gsoc");
  await settle(page);
  await expect(page.getByRole("heading", { level: 1, name: /Google Summer of Code organizations/ })).toBeVisible();
  await expect(page.locator("#grid article").first()).toBeVisible();
  const count = page.getByText(/^\d+ organizations$/).first();
  await expect(count).toBeVisible();
  const total = Number((await count.textContent())!.match(/\d+/)![0]);
  expect(total).toBeGreaterThan(400);
  // Windowed: not every org is mounted at once.
  expect(await page.locator("#grid article").count()).toBeLessThan(total);

  const drawerButton = page.getByRole("button", { name: /^Filters/ });
  const mobile = await drawerButton.isVisible();
  if (mobile) await drawerButton.click();
  await page.getByRole("checkbox", { name: /^2024\b/ }).check();
  await expect(page).toHaveURL(/years=2024/);
  await expect.poll(async () => Number((await count.textContent())!.match(/\d+/)![0])).toBeLessThan(total);
  const y2016 = Number((await count.textContent())!.match(/\d+/)![0]);
  expect(y2016).toBeGreaterThan(100);
  await page.getByRole("checkbox", { name: /^2024\b/ }).uncheck();
  // 2016 is the oldest year in the data and sits behind "Show more".
  await page.getByRole("button", { name: /^Show \d+ more$/ }).first().click();
  await expect(page.getByRole("checkbox", { name: /^2016\b/ })).toBeVisible();
  await page.getByRole("checkbox", { name: /^Python\b/ }).check();
  await expect(page).toHaveURL(/tech=Python/);
  await page.getByRole("checkbox", { name: /^Veteran/ }).check();
  await expect(page).toHaveURL(/quick=veteran/);
  await expect.poll(async () => Number((await count.textContent())!.match(/\d+/)![0])).toBeLessThan(y2016);
  if (mobile) await page.keyboard.press("Escape");

  await page.goto("/gsoc?q=kubernetes&categories=Infrastructure+and+cloud");
  await settle(page);
  await expect(page.getByRole("searchbox").first()).toHaveValue("kubernetes");
  await expect(page.locator("#grid article").first()).toBeVisible();
  expect(errors).toEqual([]);
  await expect(page).toHaveScreenshot("gsoc.png", { fullPage: false });
});

test("GSoC organization page renders projects by year and structured data", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/gsoc/cncf");
  await settle(page);
  await expect(page.getByRole("heading", { level: 1, name: "CNCF" })).toBeVisible();
  await expect(page.locator("#projects")).toBeVisible();
  expect(await page.locator("#projects details").count()).toBeGreaterThan(5);
  expect(await page.locator("script[type='application/ld+json']").count()).toBeGreaterThanOrEqual(2);
  await expect(page.getByRole("link", { name: /GSoC organizations/ }).first()).toHaveAttribute("href", "/gsoc");
  expect(await page.content()).not.toMatch(/[\w.+-]+@gmail\.com/);
  expect(errors).toEqual([]);
  await expect(page).toHaveScreenshot("gsoc-org.png", { fullPage: false });
});

test("proposals library filters by year and organization from the URL", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/proposals");
  await settle(page);
  await expect(page.getByRole("heading", { level: 1, name: /Public GSoC proposals/ })).toBeVisible();
  const count = page.locator('[aria-live="polite"]').first();
  await expect(count).toContainText(/proposals?/);
  const total = Number((await count.textContent())!.match(/\d+/)![0]);
  expect(total).toBeGreaterThan(100);
  await page.goto("/proposals?status=accepted&years=2026");
  await settle(page);
  await expect.poll(async () => Number((await count.textContent())!.match(/\d+/)![0])).toBeLessThan(total);
  expect(await page.locator("main, body").first().locator("a[href^='https://github.com/']").count()).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

test("guide page renders every section and a per-program checklist", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/guide");
  await settle(page);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  for (const id of ["readiness", "community", "loop", "issues", "threads", "selection", "programs", "resources"]) {
    await expect(page.locator(`#${id}`)).toBeAttached();
  }
  const first = page.locator("#loop").locator("..").getByRole("checkbox").first();
  await first.check();
  await page.reload();
  await settle(page);
  await expect(page.locator("#loop").locator("..").getByRole("checkbox").first()).toBeChecked();
  expect(await page.locator("details").count()).toBeGreaterThanOrEqual(6);
  expect(errors).toEqual([]);
});
