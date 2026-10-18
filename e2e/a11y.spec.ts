import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/** Fails on serious or critical axe violations (WCAG 2.2 AA rules) on every main route. */
const ROUTES = ["/", "/gsoc", "/lfx", "/gsoc/numfocus", "/organization/kubeedge", "/proposals", "/guide", "/programs/outreachy", "/contributors", "/contribute"];

for (const route of ROUTES) {
  test(`no serious accessibility violations on ${route}`, async ({ page }, info) => {
    await page.setExtraHTTPHeaders({ "x-forwarded-for": `10.6.${ROUTES.indexOf(route)}.${info.project.name === "mobile" ? 2 : 1}` });
    await page.goto(route);
    await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious.map((v) => `${v.id}: ${v.nodes.length} node(s), e.g. ${v.nodes[0]?.target.join(" ")}`)).toEqual([]);
  });
}
