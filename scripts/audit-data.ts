import * as fs from "fs";
import * as path from "path";
import { Organization, Project } from "../src/lib/types";

function audit() {
  console.log("=================================================");
  console.log("🔍 OSSGrid Data Quality & Verification Audit");
  console.log("=================================================\n");

  const orgsPath = path.join(process.cwd(), "public", "data", "organizations.json");
  const projsPath = path.join(process.cwd(), "public", "data", "projects.json");

  if (!fs.existsSync(orgsPath) || !fs.existsSync(projsPath)) {
    console.error("❌ Data files missing! Run `npx tsx scripts/fetch-lfx-data.ts` first.");
    process.exit(1);
  }

  const orgs: Organization[] = JSON.parse(fs.readFileSync(orgsPath, "utf8"));
  const projs: Project[] = JSON.parse(fs.readFileSync(projsPath, "utf8"));

  let errors = 0;
  let warnings = 0;

  console.log(`📊 Total Organizations: ${orgs.length}`);
  console.log(`📊 Total Projects:      ${projs.length}\n`);

  // 1. Check for duplicate project IDs
  const seenIds = new Set<string>();
  const duplicateIds: string[] = [];
  for (const p of projs) {
    if (seenIds.has(p.id)) {
      duplicateIds.push(p.id);
      errors++;
    }
    seenIds.add(p.id);
  }

  if (duplicateIds.length === 0) {
    console.log("✅ Project IDs: 0 collisions detected");
  } else {
    console.error(`❌ Project IDs: ${duplicateIds.length} collisions! Examples:`, duplicateIds.slice(0, 5));
  }

  // 2. Check for fragmented or unmapped organizations
  const knownBadOrgs = [
    "add-guac-support",
    "headlamp-a-kubernetes-ui",
    "tuf",
    "wasmedge-runtime",
    "volcano-agentcube",
    "volcano-kthena",
    "knative-functions",
    "cilium-tetragon",
    "konveyor-ai",
    "krkn-chaos",
    "cncf-tag-network-and-observability",
    "cncf-tag-contributor-strategy-ii",
  ];

  const foundBadOrgs = orgs.filter((o) => knownBadOrgs.includes(o.id));
  if (foundBadOrgs.length === 0) {
    console.log("✅ Organization Aliasing: All fragmented aliases cleanly unified");
  } else {
    errors += foundBadOrgs.length;
    console.error(`❌ Organization Aliasing: Found ${foundBadOrgs.length} unmerged fragmented orgs:`, foundBadOrgs.map((o) => o.name));
  }

  // 3. Check for URLs or issue links in mentor names
  let invalidMentorsCount = 0;
  for (const p of projs) {
    for (const m of p.mentors) {
      if (/^https?:\/\//i.test(m.name) || m.name.includes("github.com") || m.name.includes("issues/")) {
        invalidMentorsCount++;
        errors++;
      }
    }
  }

  if (invalidMentorsCount === 0) {
    console.log("✅ Mentors Validation: 0 URL/issue artifacts in mentor records");
  } else {
    console.error(`❌ Mentors Validation: Found ${invalidMentorsCount} mentor entries containing URLs`);
  }

  // 4. Check organization descriptions quality
  let emptyOrTruncatedOrgs = 0;
  for (const o of orgs) {
    if (!o.description || o.description.length < 30 || o.description.startsWith(":") || o.description.endsWith("singl")) {
      emptyOrTruncatedOrgs++;
      warnings++;
    }
  }

  if (emptyOrTruncatedOrgs === 0) {
    console.log("✅ Org Descriptions: 100% of organizations have clean, verified descriptions");
  } else {
    console.warn(`⚠️ Org Descriptions: ${emptyOrTruncatedOrgs} organizations have low-quality or truncated descriptions`);
  }

  // 5. Term distribution
  const termCounts = new Map<string, number>();
  for (const p of projs) {
    termCounts.set(p.term, (termCounts.get(p.term) || 0) + 1);
  }

  console.log("\n📅 Term Distribution Across Cohorts:");
  Array.from(termCounts.entries())
    .sort()
    .forEach(([term, count]) => {
      console.log(`   • ${term.padEnd(28)} : ${count} projects`);
    });

  console.log("\n=================================================");
  if (errors === 0) {
    console.log("🎉 AUDIT PASSED: Data integrity verified with 0 errors.");
    console.log("=================================================\n");
  } else {
    console.error(`💥 AUDIT FAILED: ${errors} errors found.`);
    console.log("=================================================\n");
    process.exit(1);
  }
}

audit();
