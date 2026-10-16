/**
 * Checks src/data/programs.ts: live programs need a dashboard route and a non-empty data file;
 * every fact needs a sourceUrl and a YYYY-MM-DD lastVerified (warn when older than 180 days);
 * coming-soon programs need officialUrl and trackingIssueUrl.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { pathToFileURL } from "node:url";
import assert from "node:assert/strict";
import { PROGRAMS, type Program } from "../src/data/programs";

const STALE_DAYS = 180;

function validUrl(url: string, context: string) {
  let parsed: URL;
  try { parsed = new URL(url); } catch { assert.fail(`Invalid URL: ${context}: ${url}`); }
  assert(parsed.protocol === "https:" && parsed.hostname.includes("."), `Program URLs must be https: ${context}: ${url}`);
}

export function auditPrograms(programs: Program[], root = process.cwd(), now = new Date(), log: (line: string) => void = console.log) {
  assert(programs.length >= 2, "Registry must list at least two programs");
  const ids = new Set<string>();
  const warnings: string[] = [];
  for (const p of programs) {
    assert(!ids.has(p.id), `Duplicate program id: ${p.id}`); ids.add(p.id);
    assert(p.name && p.shortName && p.runBy && p.oneLiner && p.accentVar.startsWith("--program-"), `Incomplete program: ${p.id}`);
    assert(!/[!]|\b(?:seamless|effortless|supercharge|unlock|empower|journey|leverage|robust|cutting-edge|world-class)\b/i.test(p.oneLiner), `Hype in oneLiner: ${p.id}`);
    validUrl(p.officialUrl, `${p.id}.officialUrl`);
    assert(p.dataSources.length >= 1, `No data sources: ${p.id}`);
    for (const s of p.dataSources) validUrl(s.url, `${p.id}.dataSources`);
    for (const [key, fact] of Object.entries(p.facts)) {
      assert(fact.value?.trim(), `Empty fact ${key}: ${p.id}`);
      validUrl(fact.sourceUrl, `${p.id}.facts.${key}.sourceUrl`);
      assert(/^\d{4}-\d{2}-\d{2}$/.test(fact.lastVerified) && !isNaN(Date.parse(fact.lastVerified)), `Bad lastVerified for ${key}: ${p.id}`);
      const age = (now.getTime() - Date.parse(fact.lastVerified)) / 86_400_000;
      if (age > STALE_DAYS) warnings.push(`${p.id}.${key} was last verified ${Math.round(age)} days ago (${fact.lastVerified}); re-check ${fact.sourceUrl}`);
    }
    if (p.status === "live") {
      assert(p.dashboardPath?.startsWith("/"), `Live program without dashboardPath: ${p.id}`);
      const route = path.join(root, "src/app", p.dashboardPath!, "page.tsx");
      assert(fs.existsSync(route), `Live program route missing: ${route}`);
      assert(p.dataFile?.startsWith("/data/"), `Live program without dataFile: ${p.id}`);
      const file = path.join(root, "public", p.dataFile!);
      assert(fs.existsSync(file) && fs.statSync(file).size > 2, `Live program data file missing or empty: ${file}`);
      const data = JSON.parse(fs.readFileSync(file, "utf8"));
      assert(Array.isArray(data) && data.length > 0, `Live program data file has no records: ${file}`);
    } else {
      assert(p.trackingIssueUrl, `Coming-soon program without trackingIssueUrl: ${p.id}`);
      validUrl(p.trackingIssueUrl!, `${p.id}.trackingIssueUrl`);
      assert(!p.dashboardPath, `Coming-soon program must not claim a dashboard: ${p.id}`);
    }
  }
  for (const w of warnings) log(`! ${w}`);
  log(`Program registry: ${programs.filter((p) => p.status === "live").length} live, ${programs.length - programs.filter((p) => p.status === "live").length} coming soon, ${warnings.length} stale-fact warning(s).`);
  return warnings;
}

export function main() {
  auditPrograms(PROGRAMS);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
