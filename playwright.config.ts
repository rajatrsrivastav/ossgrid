import { defineConfig, devices } from "@playwright/test";

/**
 * Smoke tests against a production build. Run `npm run build` first, then `npm run test:e2e`.
 * Screenshot baselines live in e2e/__screenshots__ (git-ignored, machine specific) and are used
 * locally to prove a refactor left a page pixel-identical: capture with --update-snapshots before,
 * compare after.
 */
const PORT = Number(process.env.E2E_PORT || 3100);

export default defineConfig({
  testDir: "./e2e",
  snapshotPathTemplate: "{testDir}/__screenshots__/{testFilePath}/{projectName}/{arg}{ext}",
  fullyParallel: true,
  retries: 0,
  reporter: [["list"]],
  timeout: 60_000,
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.002, animations: "disabled" } },
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    colorScheme: "dark",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 7"], viewport: { width: 375, height: 812 } } },
  ],
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
