import { mkdir, mkdtemp, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const [owner, repo] = (process.env.GITHUB_REPOSITORY || "").split("/");
const token = process.env.GITHUB_TOKEN;
if (!owner || !repo || !token) throw new Error("GITHUB_REPOSITORY and GITHUB_TOKEN are required");
const root = resolve(import.meta.dirname, "..");
const site = join(root, "pages-site");
await rm(site, { recursive: true, force: true });
await mkdir(site);

async function api(path) {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
  });
  if (!response.ok) throw new Error(`GitHub API ${path}: ${response.status}`);
  return response.json();
}

async function pages(path, key) {
  const all = [];
  for (let page = 1; ; page++) {
    const data = await api(`${path}${path.includes("?") ? "&" : "?"}per_page=100&page=${page}`);
    const batch = key ? data[key] : data;
    all.push(...batch);
    if (batch.length < 100) return all;
  }
}

const pulls = await pages("/pulls?state=open&base=main", null);
const artifacts = await pages("/actions/artifacts", "artifacts");
const published = [];
let totalBytes = 0;
for (const pull of pulls) {
  const number = pull.number;
  const artifact = artifacts.find((item) => item.name === `pages-pr-${number}` && !item.expired);
  if (!artifact) continue;
  const zipResponse = await fetch(artifact.archive_download_url, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
  });
  if (!zipResponse.ok) throw new Error(`Cannot download preview artifact for PR #${number}: ${zipResponse.status}`);
  const scratch = await mkdtemp(join(tmpdir(), `ossgrid-pr-${number}-`));
  try {
    const zip = join(scratch, "preview.zip");
    await writeFile(zip, Buffer.from(await zipResponse.arrayBuffer()));
    const destination = join(site, `pr-${number}`);
    await mkdir(destination);
    const extract = spawnSync("python3", [join(root, "scripts/extract-preview-artifact.py"), zip, destination], { encoding: "utf8" });
    if (extract.status !== 0) throw new Error(`Cannot extract PR #${number}: ${extract.stderr}`);
    const marker = JSON.parse(await readFile(join(destination, "preview.json"), "utf8"));
    if (marker.pr !== number || marker.sha !== pull.head.sha) {
      await rm(destination, { recursive: true, force: true });
      continue;
    }
    // Protect the single Pages deployment from exceeding GitHub Pages' size limit.
    async function size(dir) {
      let bytes = 0;
      for (const entry of await readdir(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name);
        bytes += entry.isDirectory() ? await size(path) : (await stat(path)).size;
      }
      return bytes;
    }
    totalBytes += await size(destination);
    if (totalBytes > 900_000_000) throw new Error("Open PR previews exceed the Pages size budget; close old PRs or use a server preview host");
    published.push(number);
  } finally {
    await rm(scratch, { recursive: true, force: true });
  }
}
await writeFile(join(site, ".nojekyll"), "");
await writeFile(join(site, "index.html"), `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>OSSGrid PR previews</title><h1>OSSGrid PR previews</h1><ul>${published.map((pr) => `<li><a href="./pr-${pr}/">PR #${pr}</a></li>`).join("")}</ul></html>`);
await writeFile(join(root, "published-previews.json"), JSON.stringify(published));
console.log(`Prepared ${published.length} PR preview(s)`);
