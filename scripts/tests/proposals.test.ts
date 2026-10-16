import { test } from "node:test";
import assert from "node:assert/strict";
import { parseMarkdownTable, parseMarkdownList, recordsFromTree, type ProposalSource } from "../lib/proposals-parser";

const rev = "a".repeat(40);

test("markdown table and list archives yield links, not copies", () => {
  const rows = parseMarkdownTable("| Project Title | Proposal | Project |\n| --- |:---:| ---:|\n|Add CRDs | [Link](https://drive.google.com/file/d/x/view) | [Link](https://summerofcode.withgoogle.com/archive/2019/projects/1/) |\n");
  assert.deepEqual(rows, [{ title: "Add CRDs", url: "https://drive.google.com/file/d/x/view" }]);
  assert.deepEqual(parseMarkdownList("# 2020\n\n- [Aryan Gupta](https://docs.google.com/document/d/1/edit)\n* [Someone](https://example.org/p.pdf)\n"), [
    { label: "Aryan Gupta", url: "https://docs.google.com/document/d/1/edit" },
    { label: "Someone", url: "https://example.org/p.pdf" },
  ]);
});

test("every tree layout produces records with year, org, status, format and a GitHub blob link", () => {
  const cases: [ProposalSource, string[], Partial<ReturnType<typeof recordsFromTree>[number]>][] = [
    [{ repo: "a/b", branch: "main", layout: "org-file", year: 2025, status: "accepted", license: "MIT" }, ["AOSSIE/GSoC'25_RahulHarpal.pdf", "README.md", ".DS_Store"], { year: 2025, orgName: "AOSSIE", status: "accepted", format: "pdf" }],
    [{ repo: "a/b", branch: "main", layout: "org-status-file", year: 2026 }, ["CNCF/Accepted/Reactive_Agents_JeffreyJPZ.pdf", "X/Rejected/Thing_user1.pdf"], { year: 2026, orgName: "CNCF", status: "accepted", author: "JeffreyJPZ" }],
    [{ repo: "a/b", branch: "main", layout: "year-org-file", status: "unknown" }, ["2021/Apertium/Apertium.pdf"], { year: 2021, orgName: "Apertium", status: "unknown" }],
    [{ repo: "a/b", branch: "master", layout: "year-org-year-name", status: "accepted" }, ["2020/CERN-HSF - 2020 - Shivansh Saini.pdf"], { year: 2020, orgName: "CERN-HSF", author: "Shivansh Saini", status: "accepted" }],
    [{ repo: "a/b", branch: "master", layout: "fos" }, ["GSoC-2013/Accepted/Genome-Informatics-SaketChoudhary-eQTL-Pipeline/Genome-Informatics-SaketChoudhary-eQTL-Pipeline.md", "GSoC-2013/Accepted/Genome-Informatics-SaketChoudhary-eQTL-Pipeline/media/image_0.png"], { year: 2013, orgName: "Genome", status: "accepted", format: "md" }],
    [{ repo: "a/b", branch: "master", layout: "flat-pdf" }, ["proposals/GSOC-mozilla-CVW.pdf"], { year: null, format: "pdf", status: "unknown" }],
  ];
  for (const [source, paths, expected] of cases) {
    const records = recordsFromTree(source, paths.map((p) => ({ path: p, type: "blob" })), rev);
    assert(records.length >= 1, `${source.layout} produced nothing`);
    const r = records[0];
    for (const [k, v] of Object.entries(expected)) assert.equal(r[k as keyof typeof r], v, `${source.layout}.${k}`);
    assert(r.url.startsWith(`https://github.com/a/b/blob/${rev}/`), `${source.layout} url`);
    assert(r.id && r.sourceRepo === "a/b");
  }
  const tables = recordsFromTree({ repo: "a/b", branch: "master", layout: "org-year-md-table", status: "accepted" }, [{ path: "CNCF/2019-proposals.md", type: "blob" }], rev, new Map([["CNCF/2019-proposals.md", "| Project Title | Proposal |\n|---|---|\n| Dashboard CRDs | [Link](https://drive.google.com/file/d/1/view) |\n"]]));
  assert.equal(tables.length, 1);
  assert.equal(tables[0].format, "link");
  assert.equal(tables[0].orgName, "CNCF");
  assert.equal(recordsFromTree({ repo: "a/b", branch: "main", layout: "skip" }, [{ path: "README.md", type: "blob" }], rev).length, 0);
});
