import { test } from "node:test";
import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as path from "node:path";
import { parseReadme, parsePeople, extractUrls } from "../lib/lfx-parser";
import { auditData } from "../audit-data";

const read = (name: string) => JSON.parse(fs.readFileSync(path.join(process.cwd(), "public/data", name), "utf8"));
const fixture = (name: string) => fs.readFileSync(path.join(__dirname, "fixtures", name), "utf8");

test("preserves official Markdown field variants, linked title URLs, and EOF fields", () => {
  const { projects } = parseReadme(fixture("markdown-variants.md"), { coredns: "CoreDNS", kyverno: "Kyverno", kubearmor: "KubeArmor", meshery: "Meshery" });
  assert.equal(projects.length, 4);
  assert(projects.every(p => p.description));
  assert.equal(projects[0].lfxUrls[0], "https://mentorship.lfx.linuxfoundation.org/project/beb3a680-3f78-4716-b072-7f547cf417ab");
  assert.equal(projects[0].upstreamIssueUrls[0], "https://github.com/coredns/coredns/issues/3460");
  assert.deepEqual(projects[3].skills, ["Go", "Temporal", "ReactJS"]);
});

test("mixed source headings preserve kube-burner attribution and both Kyverno projects", () => {
  const { projects } = parseReadme(fixture("mixed-headings.md"), { kyverno: "Kyverno", "kube-burner": "kube-burner" });
  assert.equal(projects.length, 4);
  assert.equal(projects[3].organization, "kube-burner");
  assert.equal(projects[3].title, "Enhancements around k8s performance testing");
  assert(projects.slice(0, 3).every(p => p.organization === "Kyverno"));
});

test("sample subtrees and fenced templates never become projects; Mark is not March", () => {
  const { projects } = parseReadme('### Sample\n#### Prometheus\n##### Example\n- Description: Sample only.\n## Participating Projects\n```\n### Fake\n#### Fake project\n- Description: Not a project\n```\n### Prometheus\n#### Mark Out-of-order ingestion as stable\n- Description: Real work\n- Skills: Go', { prometheus: "Prometheus" });
  assert.equal(projects.length, 1);
  assert.equal(projects[0].title, "Mark Out-of-order ingestion as stable");
  assert.deepEqual(projects[0].skills, ["Go"]);
});

test("unknown organizations fail instead of inheriting the last organization", () => {
  assert.throws(() => parseReadme('### Known\n#### First\n- Description: One\n### NewOrg\n#### Second\n- Description: Two', { known: "Known" }), /Unmapped organization/);
});

test("mentor parsing preserves names, handles, mailto links, and multiple people", () => {
  assert.deepEqual(parsePeople('[Arthur Sens](https://github.com/ArthurSens) (arthursens2005@gmail.com)'), [{ name: "Arthur Sens", github: "ArthurSens", email: "arthursens2005@gmail.com" }]);
  assert.deepEqual(parsePeople('Qiuyang Liu (@chrisliu1995, [chrisliu1995@163.com](mailto:chrisliu1995@163.com))'), [{ name: "Qiuyang Liu", github: "chrisliu1995", email: "chrisliu1995@163.com" }]);
  assert.equal(parsePeople('Amit Kumar Das (@amityt, amit.das@harness.io) Sayan Mondal (@S-ayanide, sayan.mondal@harness.io)').length, 2);
  assert.equal(parsePeople('[André Martins](https://github.com/aanm) [Natália Réka Ivánkó](https://github.com/sharlns) [Jed Salazar](https://github.com/jedsalazar)').length, 3);
  assert.deepEqual(parsePeople('@lukehinds'), [{ name: "lukehinds", github: "lukehinds", email: "", nameIsHandle: true }]);
  assert.deepEqual(parsePeople('https://github.com/project/repo/issues/1'), []);
});

test("URL extraction keeps multiple targets without Markdown or following prose", () => {
  assert.deepEqual(extractUrls('[issue](https://github.com/org/repo/issues/1),and <https://github.com/org/repo/issues/2>'), ['https://github.com/org/repo/issues/1', 'https://github.com/org/repo/issues/2']);
});

test("committed dataset satisfies all integrity and coverage assertions", () => {
  auditData(read('organizations.json'), read('projects.json'), read('source-coverage.json'));
});

for (const corruption of ['empty', 'missing-project', 'alias', 'description', 'url', 'provenance', 'nested', 'mentor', 'source-coverage'] as const) {
  test(`audit rejects ${corruption} corruption`, () => {
    const orgs = read('organizations.json'), projects = read('projects.json'), coverage = read('source-coverage.json');
    if (corruption === 'empty') { orgs.length = 0; projects.length = 0; }
    if (corruption === 'missing-project') { projects.pop(); }
    if (corruption === 'alias') orgs[0].id = 'opentelemetry-php';
    if (corruption === 'description') orgs[0].description = '';
    if (corruption === 'url') { projects[0].lfxUrl += ')'; orgs[0].projects[0].lfxUrl = projects[0].lfxUrl; }
    if (corruption === 'provenance') { projects[0].sources = []; orgs[0].projects[0].sources = []; }
    if (corruption === 'nested') orgs[0].projects[0].title = 'Wrong title';
    if (corruption === 'mentor') { projects[0].mentors[0].name = ''; orgs[0].projects[0].mentors[0].name = ''; }
    if (corruption === 'source-coverage') coverage.files[0].sections.find((s: { kind: string }) => s.kind === 'project').projectId = 'missing';
    assert.throws(() => auditData(orgs, projects, coverage));
  });
}

test("historical tables and reviewed regressions are present in the generated data", () => {
  const projects = read('projects.json');
  for (const title of ['Add ACME protocol support for certificate management with DNS', 'Implement DNS visibility with KubeArmor', 'Workflow Engine in Meshery', 'Mark Out-of-order ingestion as stable', 'Extend Kyverno CLI test command for Generate policy rules']) {
    assert(projects.some((p: { title: string }) => p.title === title), `Missing ${title}`);
  }
  assert(projects.some((p: { year: number }) => p.year === 2019));
  assert(projects.some((p: { year: number }) => p.year === 2020));
  assert(!projects.some((p: { id: string }) => p.id === 'kyverno-2025-t3-kube-burner'));
  const prometheus = projects.find((p: { title: string; year: number }) => p.title === 'Client_golang CI/CD improvements' && p.year === 2024);
  assert.deepEqual(prometheus.mentors.map((m: { name: string }) => m.name), ['Arthur Sens', 'Kemal Akkoyun']);
});
