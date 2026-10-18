import { test, expect } from "@playwright/test";

test("desktop navigation stays horizontal at supported widths", async ({ page }) => {
  await page.goto("/");
  for (const width of [1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.locator("header nav:visible")).toHaveCount(1);
    await expect(page.getByRole("button", { name: /open menu/i })).toBeHidden();
    await expect(page.getByRole("link", { name: "Support OSSGrid on Buy Me a Coffee" })).toHaveAttribute("href", "https://buymeacoffee.com/rajatrsrivastav");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
  await expect(page.locator("aside")).toHaveCount(0);
});

test("mobile menu supports Escape, scroll lock, and navigation", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  const toggle = page.locator("#mobile-nav-toggle");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
  await page.keyboard.press("Escape");
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  await toggle.click();
  await page.locator("#mobile-nav").getByRole("link", { name: "GSoC", exact: true }).click();
  await expect(page).toHaveURL(/\/gsoc$/);
  await expect(page.locator("#mobile-nav")).toHaveCount(0);
});

test("footer and contributor directory keep creator and external contributors distinct", async ({ page }) => {
  await page.route("**/api/contributors", (route) => route.abort());
  await page.goto("/contributors?repo=unrelated/project");
  const main = page.locator("main");
  await expect(main.getByRole("heading", { name: "OSSGrid contributors" })).toBeVisible();
  await expect(main.locator('a[href="https://github.com/UserAkku"]')).toHaveCount(1);
  await expect(main.getByText("Akhilesh Kumar")).toBeVisible();
  await expect(main.locator('a[href="https://github.com/NSTKrishna"]')).toBeVisible();
  await expect(main.locator('a[href="https://github.com/rajatrsrivastav"]')).toHaveCount(1);
  await expect(main.getByText("Rajat Srivastav")).toBeVisible();
  await expect(main.getByText("Creator", { exact: true })).toBeVisible();
  const footer = page.locator("footer");
  await expect(footer.getByRole("link", { name: "Rajat Srivastav" })).toHaveAttribute("href", "https://x.com/rajatrsrivastav");
  await expect(footer.locator("details, img")).toHaveCount(0);
  await expect(footer.getByRole("link", { name: "Contributors", exact: true })).toHaveAttribute("href", "/contributors");
  // DESIGN.md v4: link labels are sentence case.
  await expect(footer.getByRole("link", { name: "Start contributing", exact: true })).toHaveAttribute("href", "/contribute");
  await page.goto("/contribute");
  await expect(page.getByRole("list", { name: "Contribution steps" }).locator(":scope > li")).toHaveCount(6);
  await expect(page.getByRole("link", { name: "Past contributors", exact: true })).toHaveAttribute("href", "/contributors#past-contributors");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("repository actions use matching repository and respect disabled issues", async ({ page }) => {
  await page.route("**/api/github-repository?**", (route) => route.fulfill({ json: { hasIssues: false, guideUrl: "https://github.com/kubeedge/kubeedge/blob/master/CONTRIBUTING.md" } }));
  await page.goto("/contribute?repo=kubeedge%2Fkubeedge");
  const actions = page.getByRole("navigation", { name: "Contribute to kubeedge/kubeedge" });
  await expect(actions.getByRole("link", { name: "Contribute", exact: true })).toHaveAttribute("href", "https://github.com/kubeedge/kubeedge/blob/master/CONTRIBUTING.md");
  await expect(actions.getByRole("link", { name: "View Contributors" })).toHaveAttribute("href", "https://github.com/kubeedge/kubeedge/graphs/contributors");
  await expect(actions.getByRole("link", { name: "Report Issue" })).toHaveCount(0);
  await page.unroute("**/api/github-repository?**");
  await page.route("**/api/github-repository?**", (route) => route.fulfill({ json: { hasIssues: true, guideUrl: null } }));
  await page.reload();
  await expect(actions.getByRole("link", { name: "Report Issue" })).toHaveAttribute("href", "https://github.com/kubeedge/kubeedge/issues");
  await expect(actions.getByRole("link", { name: "Contribute", exact: true })).toHaveAttribute("href", "https://github.com/kubeedge/kubeedge#readme");
});
