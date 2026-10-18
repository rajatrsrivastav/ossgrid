import { test } from "node:test";
import assert from "node:assert/strict";
import { mergeContributors, type Contributor } from "../../src/lib/contributors";
import { githubRepo, projectRepositoryUrl } from "../../src/lib/github-repos";

const person = (login: string, id?: number): Contributor => ({ login, id, name: login, avatarUrl: `https://github.com/${login}.png`, profileUrl: `https://github.com/${login}` });
test("contributor merge preserves history and deduplicates renamed/case-insensitive accounts", () => {
  const people = mergeContributors([person("old-handle", 123), person("historical", 234)], [{ ...person("new-handle", 123), contributions: 4 }, person("USERAKKU", 186388947)]);
  assert.equal(people.filter((p) => p.id === 123).length, 1);
  assert.equal(people.find((p) => p.id === 123)?.login, "new-handle");
  assert.ok(people.some((p) => p.login === "historical"));
  assert.equal(people.filter((p) => p.login.toLowerCase() === "userakku").length, 1);
  assert.equal(people.find((p) => p.login.toLowerCase() === "userakku")?.name, "Akhilesh Kumar");
});
test("directory excludes creator and bots", () => {
  const people = mergeContributors([person("RAJATRSRIVASTAV"), person("automation[bot]"), { ...person("robot"), type: "Bot" }]);
  assert.ok(!people.some((p) => ["rajatrsrivastav", "automation[bot]", "robot"].includes(p.login.toLowerCase())));
});
test("repository actions only use actual GitHub repository paths", () => {
  for (const url of ["https://github.com/kubernetes", "https://github.com/orgs/kubernetes/repositories", "https://example.com/owner/repo", "javascript:alert(1)"]) assert.equal(githubRepo(url), null);
  assert.deepEqual(githubRepo("https://github.com/owner/repo/blob/main/README.md"), { slug: "owner/repo", url: "https://github.com/owner/repo" });
  assert.deepEqual(githubRepo("https://github.com/owner/repo.git"), { slug: "owner/repo", url: "https://github.com/owner/repo" });
});

test("GitHub pagination is followed and directory ignores external repository queries", async () => {
  const { GET } = await import("../../src/app/api/contributors/route");
  const original = globalThis.fetch;
  const requested: string[] = [];
  globalThis.fetch = async (input) => {
    const url = String(input); requested.push(url);
    if (url.includes("/contributors?")) {
      const page2 = url.includes("page=2");
      return Response.json([{ id: page2 ? 222 : 111, login: page2 ? "historical-test" : "current-test", avatar_url: "https://github.com/test.png", html_url: "https://github.com/test", type: "User", contributions: 2 }], { headers: page2 ? {} : { link: '<https://api.github.com/repos/rajatrsrivastav/ossgrid/contributors?per_page=100&page=2>; rel="next"' } });
    }
    return Response.json({ name: "Verified test name" });
  };
  try {
    const data = await (await GET()).json();
    assert.equal(data.stale, false);
    assert.ok(data.contributors.some((p: Contributor) => p.login === "historical-test"));
    assert.equal(requested.filter((url) => url.includes("/contributors?")).length, 2);
    assert.ok(requested.filter((url) => url.includes("/repos/")).every((url) => url.includes("/repos/rajatrsrivastav/ossgrid/")));
  } finally { globalThis.fetch = original; }
});

test("GitHub rate limits retain verified historical contributors", async () => {
  const { GET } = await import("../../src/app/api/contributors/route");
  const original = globalThis.fetch;
  globalThis.fetch = async () => new Response(null, { status: 429 });
  try {
    const data = await (await GET()).json();
    assert.equal(data.stale, true);
    assert.ok(data.contributors.some((p: Contributor) => p.login === "NSTKrishna"));
    assert.equal(data.contributors.filter((p: Contributor) => p.login.toLowerCase() === "userakku").length, 1);
  } finally { globalThis.fetch = original; }
});

test("project actions prefer upstream repositories and skip mentorship intake", () => {
  assert.equal(projectRepositoryUrl({ upstreamIssueUrl: "https://github.com/kubeedge/ianvs/issues/230", links: ["https://github.com/cncf/mentoring/issues/2004"] }), "https://github.com/kubeedge/ianvs");
  assert.equal(projectRepositoryUrl({ upstreamIssueUrl: "", links: ["https://github.com/cncf/mentoring/issues/2004"] }), undefined);
});
