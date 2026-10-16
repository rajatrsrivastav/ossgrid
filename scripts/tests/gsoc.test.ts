import { test } from "node:test";
import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as path from "node:path";
import { parseCncfGsoc, parseGsocMentors, parseGsocSkills, normalizeSize } from "../lib/cncf-gsoc-parser";
import { canonicalTag } from "../lib/tag-aliases";
import { buildGsocDataset, orgNameKey, stripHtml } from "../fetch-gsoc-data";
import { auditGsocData } from "../audit-gsoc-data";

const fixture = (name: string) => fs.readFileSync(path.join(__dirname, "fixtures", name), "utf8");
const dataDir = path.join(process.cwd(), "public/data/gsoc");
const read = (name: string) => JSON.parse(fs.readFileSync(path.join(dataDir, name), "utf8"));

test("2017 layout: ### org / #### title, Issue: label, bullet-group ideas", () => {
  const doc = parseCncfGsoc(fixture("cncf-gsoc-2017.md"), 2017);
  assert.equal(doc.warnings.length, 0);
  const k8s = doc.projects.filter((p) => p.organization === "Kubernetes");
  assert.equal(k8s.length, 3);
  assert.equal(k8s[0].title, "Improve ThirdPartyResources");
  assert.deepEqual(k8s[0].skills, ["Go"]);
  assert.deepEqual(k8s[0].upstreamIssueUrls, ["https://github.com/kubernetes/features/issues/95"]);
  assert.deepEqual(k8s[0].mentors, [{ name: "Stefan Schimanski", github: "sttts", email: "" }]);
  // A "Likely mentors" field must not swallow the next unlabeled idea bullet.
  const grpc = doc.projects.find((p) => p.organization === "gRPC");
  assert(grpc, "gRPC block parsed");
  assert(grpc!.mentors.every((m) => m.name.length < 40 && !/HPACK/.test(m.name)), JSON.stringify(grpc!.mentors));
});

test("2022 layout: #### org (url) / ##### title (Size: Medium), Difficulty field", () => {
  const doc = parseCncfGsoc(fixture("cncf-gsoc-2022.md"), 2022);
  const kb = doc.projects.filter((p) => p.organization === "Kubebuilder");
  assert.equal(kb.length, 2);
  assert.equal(kb[0].organizationUrl, "https://github.com/kubernetes-sigs/kubebuilder");
  assert.equal(kb[0].title, "New Golang plugin to help Operator authors skill up");
  assert.equal(kb[0].size, "medium");
  assert.equal(kb[0].difficulty, "Medium");
  assert(doc.projects.some((p) => p.organization === "Cluster API Provider GCP"));
  assert(!doc.projects.some((p) => /template/i.test(p.organization)));
});

test("2024 layout: #### org / ##### title, fenced template skipped, nested mentors with primary flag and emails kept in the pipeline", () => {
  const doc = parseCncfGsoc(fixture("cncf-gsoc-2024.md"), 2024);
  assert.equal(doc.warnings.length, 0);
  assert(!doc.projects.some((p) => p.organization === "CNCF Project Name" || p.title === "Project Title"));
  const falco = doc.projects.find((p) => p.organization === "Falco");
  assert(falco);
  assert.equal(falco!.size, "large");
  assert.equal(falco!.mentors.length, 2);
  assert.deepEqual(falco!.mentors[0], { name: "Jason Dellaluce", github: "jasondellaluce", email: "jasondellaluce@gmail.com", primary: true });
  assert.equal(falco!.mentors[1].primary, undefined);
  assert.deepEqual(falco!.upstreamIssueUrls, ["https://github.com/falcosecurity/evolution/issues/362"]);
  assert(falco!.expectedOutcome.length > 50);
  assert(/^[a-f0-9]{64}$/.test(falco!.contentHash));
});

test("2021 layout: sibling ### headings with fields keep the preceding organization", () => {
  const doc = parseCncfGsoc(fixture("cncf-gsoc-2021-siblings.md"), 2021);
  assert.equal(doc.projects.length, 3);
  assert(doc.projects.every((p) => p.organization === "Pravega"));
  assert.equal(doc.warnings.length, 0);
});

test("broken input never throws: orphans, empty titles, odd labels, unterminated fences become warnings", () => {
  const doc = parseCncfGsoc(fixture("cncf-gsoc-broken.md"), 2031);
  assert.equal(doc.projects.length, 1);
  const p = doc.projects[0];
  assert.equal(p.organization, "Widget Project");
  assert.deepEqual(p.skills, ["Rust", "WebAssembly"]);
  assert.equal(p.size, "medium");
  assert.equal(p.difficulty, "Hard");
  assert.deepEqual(p.upstreamIssueUrls, ["https://github.com/example/widget/issues/1", "https://github.com/example/widget/issues/2"]);
  assert.equal(p.mentors.length, 2);
  assert.equal(p.mentors[1].primary, true);
  assert(doc.warnings.some((w) => /no organization heading/.test(w)));
  assert(!doc.projects.some((x) => x.organization === "Not An Org"));
});

test("skill, size and mentor helpers", () => {
  assert.deepEqual(parseGsocSkills("golang, Kubernetes (basic), js; machine learning and/or deep learning"), ["Go", "Kubernetes", "JavaScript", "Machine learning", "Deep learning"]);
  assert.equal(normalizeSize("Large (350 hour project)"), "large");
  assert.equal(normalizeSize("~90 hours"), "small");
  assert.equal(normalizeSize("unknown"), undefined);
  assert.deepEqual(parseGsocMentors("Jane Doe (@jane-github, jane@email.address) - primary"), []);
  assert.deepEqual(canonicalTag("Python3"), { label: "Python", matched: true });
  assert.deepEqual(canonicalTag("Zebra lang"), { label: "Zebra lang", matched: false });
  assert.equal(orgNameKey("The FreeBSD Project"), orgNameKey("FreeBSD"));
  assert.equal(stripHtml("<p>Hello &amp; welcome, mail me@example.com</p>"), "Hello & welcome, mail");
});

test("dataset builder merges historical names, strips emails, and ships CNCF ideas under the cncf slug", () => {
  const orgsJson = JSON.stringify([
    { name: "FreeBSD Project", url: "https://www.freebsd.org", image_url: "https://img.example.org/x.png", image_background_color: "#fff", description: "<p>OS</p>", category: "Operating systems", topics: ["os"], technologies: ["c", "golang"], ideas_url: "https://wiki.freebsd.org/ideas", guide_url: "", irc_channel: "#freebsd on Libera.chat", contact_email: "mailto:x@y.org", mailing_list: "", twitter_url: "", blog_url: "", years: { "2025": { projects_url: "https://summerofcode.withgoogle.com/archive/2025/organizations/freebsd", num_projects: 1, projects: [] } } },
    { name: "CNCF", url: "https://cncf.io", image_url: "https://img.example.org/c.png", image_background_color: "#fff", description: "Cloud native", category: "Infrastructure and cloud", topics: ["cloud"], technologies: ["kubernetes"], ideas_url: "", guide_url: "", irc_channel: "", contact_email: "", mailing_list: "", twitter_url: "", blog_url: "", years: { "2024": { projects_url: "https://summerofcode.withgoogle.com/archive/2024/organizations/cncf", num_projects: 1, projects: [] } } },
  ]);
  const year2016 = JSON.stringify({ year: 2016, archive_url: "https://summerofcode.withgoogle.com/archive/2016", organizations: [
    { name: "FreeBSD", url: "https://freebsd.org", image_url: "https://img.example.org/old.png", image_background_color: "#fff", description: "Old", category: "Operating systems", projects_url: "https://summerofcode.withgoogle.com/archive/2016/organizations/freebsd", topics: [], technologies: ["c"], irc_channel: "", contact_email: "", mailing_list: "", twitter_url: "", blog_url: "", num_projects: 1,
      projects: [{ title: "Port thing", short_description: "Contact me at a@b.com please", description: "<p>Port <b>thing</b></p>", student_name: "Sam", code_url: "https://github.com/x/y", project_url: "https://summerofcode.withgoogle.com/archive/2016/projects/1" }] },
  ] });
  const year2024 = JSON.stringify({ year: 2024, archive_url: "", organizations: [
    { name: "CNCF", url: "https://cncf.io", image_url: "https://img.example.org/c.png", image_background_color: "#fff", description: "Cloud native", category: "Infrastructure and cloud", projects_url: "https://summerofcode.withgoogle.com/archive/2024/organizations/cncf", topics: ["cloud"], technologies: ["kubernetes"], irc_channel: "", contact_email: "", mailing_list: "", twitter_url: "", blog_url: "", num_projects: 1,
      projects: [{ title: "Accepted thing", short_description: "s", description: "d", student_name: "Kim", code_url: "", project_url: "" }] },
  ] });
  const revision = "a".repeat(40);
  const result = buildGsocDataset({ orgsJson, yearJson: new Map([[2016, year2016], [2024, year2024]]), cncfMarkdown: new Map([[2024, fixture("cncf-gsoc-2024.md")]]), cncfRevision: revision, aliases: {}, minOrgs: 1 });
  assert.equal(result.organizations.length, 2);
  const freebsd = result.organizations.find((o) => o.slug === "freebsd-project")!;
  assert.deepEqual(freebsd.years, [2016, 2025]);
  assert.equal(freebsd.name, "FreeBSD Project");
  assert.equal(freebsd.links.chat, "https://web.libera.chat/#freebsd");
  assert.deepEqual(freebsd.technologies, ["C", "Go"]);
  const p2016 = result.projectsByYear.get(2016)!;
  assert.equal(p2016[0].orgSlug, "freebsd-project");
  assert.equal(p2016[0].summary, "Contact me at please");
  assert.equal(p2016[0].description, "Port thing");
  const p2024 = result.projectsByYear.get(2024)!;
  const ideas = p2024.filter((p) => p.origin === "cncf");
  assert(ideas.length >= 3);
  assert(ideas.every((p) => p.orgSlug === "cncf" && p.status === "proposed" && p.subProject && p.sources[0].revision === revision));
  assert(!JSON.stringify(p2024).includes("@gmail.com"), "mentor emails must not reach the shipped projects");
  assert(ideas.some((p) => p.mentors.some((m) => m.primary)));
  // The audit accepts the result once the org list is large enough; here we only assert it rejects an email leak.
  const leaked = structuredClone(p2024); leaked[0].title = "mail me at x@y.org";
  assert.throws(() => auditGsocData(Array.from({ length: 100 }, (_, i) => ({ ...freebsd, slug: `${freebsd.slug}-${i}` })).concat(result.organizations), new Map([[2024, { year: 2024, projects: leaked }]]), result.coverage, () => {}), /Email address/);
});

test("committed GSoC dataset passes the audit, covers 2016 to 2026 and ships no emails", () => {
  if (!fs.existsSync(path.join(dataDir, "organizations.json"))) return;
  const orgs = read("organizations.json");
  const years = new Map<number, { year: number; projects: unknown[] }>();
  for (const f of fs.readdirSync(dataDir)) { const m = f.match(/^projects-(\d{4})\.json$/); if (m) years.set(Number(m[1]), read(f)); }
  auditGsocData(orgs, years as never, read("source-coverage.json"), () => {});
  const covered = new Set<number>(orgs.flatMap((o: { years: number[] }) => o.years));
  for (let y = 2016; y <= 2026; y++) assert(covered.has(y), `no organization for ${y}`);
  assert(orgs.some((o: { slug: string }) => o.slug === "cncf"));
  for (const [, file] of years) assert(!/"email"/.test(JSON.stringify(file)), "email field shipped");
});
