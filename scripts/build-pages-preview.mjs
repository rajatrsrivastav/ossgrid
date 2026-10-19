import { cp, mkdtemp, readFile, readdir, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(import.meta.dirname, "..");
const pr = process.argv[2];
if (!/^\d+$/.test(pr || "")) throw new Error("Usage: node scripts/build-pages-preview.mjs <PR number>");
const basePath = `/ossgrid/pr-${pr}`;
const stage = await mkdtemp(join(tmpdir(), "ossgrid-pages-"));
try {
  for (const path of ["src", "public", "package.json", "package-lock.json", "tsconfig.json", "postcss.config.mjs"]) {
    await cp(join(root, path), join(stage, path), { recursive: true });
  }
  // next-env.d.ts is gitignored; generate the minimal reference so tsc is happy
  // before `next build` overwrites it with the full version.
  await writeFile(join(stage, "next-env.d.ts"), '/// <reference types="next" />\n/// <reference types="next/image-types/global" />\n// NOTE: This file is auto-generated and should not be edited.\n');
  await symlink(join(root, "node_modules"), join(stage, "node_modules"), "dir");
  await rm(join(stage, "src/app/api"), { recursive: true });
  await rm(join(stage, "src/proxy.ts"));
  async function* files(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) yield* files(path);
      else yield path;
    }
  }
  for await (const path of files(join(stage, "src/app"))) {
    if (path.endsWith("/opengraph-image.tsx")) await rm(path);
  }
  await writeFile(join(stage, "next.config.ts"), `import type { NextConfig } from "next";\nconst config: NextConfig = { output: "export", basePath: ${JSON.stringify(basePath)}, images: { unoptimized: true }, trailingSlash: true };\nexport default config;\n`);

  // The contributor page's query-dependent server render cannot be exported.
  const contribute = join(stage, "src/app/contribute/page.tsx");
  let source = await readFile(contribute, "utf8");
  source = source.replace(/export default async function ContributePage\([^)]*\) \{\n  const \{ repo: requestedRepo \} = await searchParams;\n  const selectedRepo = [^\n]+\n/, "export default function ContributePage() {\n  const selectedRepo = null;\n");
  source = source.replace(/\n      \{selectedRepo && <section[\s\S]*?<\/section>\}\n/, "\n");
  await writeFile(contribute, source);

  // Use system fonts in this optional preview so the build never depends on
  // Google's font endpoint being reachable from the Actions runner.
  const layout = join(stage, "src/app/layout.tsx");
  let layoutSource = await readFile(layout, "utf8");
  layoutSource = layoutSource.replace(/import \{ JetBrains_Mono, Newsreader, Manrope \} from "next\/font\/google";\n/, "");
  layoutSource = layoutSource.replace(/const jetbrainsMono = JetBrains_Mono\([\s\S]*?const manrope = Manrope\([\s\S]*?\n\}\);\n/, "const jetbrainsMono = { variable: \"\" };\nconst newsreader = { variable: \"\" };\nconst manrope = { variable: \"\" };\n");
  layoutSource = layoutSource.replace("index: true,\n    follow: true,", "index: false,\n    follow: false,");
  await writeFile(layout, layoutSource);

  // Links handled by Next respect basePath. Public files referenced with literal
  // root paths need the PR prefix when several previews share one Pages site.
  for await (const path of files(join(stage, "src"))) {
    if (!/\.(ts|tsx|css)$/.test(path)) continue;
    const before = await readFile(path, "utf8");
    let after = before.replace(/(["'`(])\/(art|data|logos|images|og-image\.jpg|placeholder\.svg|icon\.svg|apple-icon)(?=[/"'`)?#])/g, `$1${basePath}/$2`);
    if (path.endsWith("/app/manifest.ts")) after = after.replace('start_url: "/"', `start_url: "${basePath}/"`);
    if (/(opengraph-image|apple-icon|manifest|robots|sitemap)\.tsx?$/.test(path)) after = `export const dynamic = "force-static";\n${after}`;
    if (after !== before) await writeFile(path, after);
  }
  for await (const path of files(join(stage, "public/data"))) {
    if (!path.endsWith(".json")) continue;
    const before = await readFile(path, "utf8");
    const after = before.replace(/"\/(logos|images|art|placeholder\.svg)(?=[/"])/g, `"${basePath}/$1`);
    if (after !== before) await writeFile(path, after);
  }
  const result = spawnSync(join(root, "node_modules/.bin/next"), ["build", "--webpack"], { cwd: stage, stdio: "inherit", env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" } });
  if (result.status !== 0) throw new Error(`Static preview build failed (${result.status})`);
  await rm(join(root, "pages-preview-output"), { recursive: true, force: true });
  await cp(join(stage, "out"), join(root, "pages-preview-output"), { recursive: true, force: true });
  await writeFile(join(root, "pages-preview-output/.nojekyll"), "");
  await writeFile(join(root, "pages-preview-output/preview.json"), JSON.stringify({ pr: Number(pr), sha: process.env.PREVIEW_HEAD_SHA || "local" }));
} finally {
  await rm(stage, { recursive: true, force: true });
}
