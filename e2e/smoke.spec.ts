import { test, expect, type Page } from "@playwright/test";

/**
 * Smoke test for the public routes. Structural assertions always run; the screenshot
 * assertions compare against local baselines when they exist (see playwright.config.ts).
 */
const ORG_SLUG = "kubeedge";

async function settle(page: Page) {
  await page.waitForLoadState("networkidle");
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
  await expect(page.getByRole("link", { name: /Browse LFX orgs/i }).first()).toHaveAttribute("href", "/lfx");
  expect(errors).toEqual([]);
  await expect(page).toHaveScreenshot("home.png", { fullPage: true });
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
