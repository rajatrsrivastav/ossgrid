import { githubRepo } from "@/lib/github-repos";

const slugPattern = /^[\w.-]+\/[\w.-]+$/;

async function githubJson(url: string): Promise<Response> {
  return fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "OSSGrid-repository-actions",
      ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
    },
    next: { revalidate: 86400 },
    signal: AbortSignal.timeout(8000),
  });
}

export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("repo");
  if (!slug || !slugPattern.test(slug) || githubRepo(`https://github.com/${slug}`)?.slug !== slug) return Response.json({ error: "Invalid repository" }, { status: 400 });
  try {
    const [repoResponse, communityResponse] = await Promise.all([
      githubJson(`https://api.github.com/repos/${slug}`),
      githubJson(`https://api.github.com/repos/${slug}/community/profile`),
    ]);
    if (!repoResponse.ok) return Response.json({ error: "Repository details unavailable" }, { status: repoResponse.status === 404 ? 404 : 503 });
    const repo = await repoResponse.json() as { has_issues?: boolean };
    const community = communityResponse.ok ? await communityResponse.json() as { files?: { contributing?: { html_url?: string } } } : null;
    const guide = community?.files?.contributing?.html_url;
    const guideRepo = githubRepo(guide)?.slug.toLowerCase();
    const isProjectGuide = guideRepo === slug.toLowerCase() || guideRepo === `${slug.split("/")[0].toLowerCase()}/.github`;
    return Response.json({ hasIssues: repo.has_issues === true, guideUrl: guide && isProjectGuide ? guide : null }, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
  } catch {
    return Response.json({ error: "Repository details unavailable" }, { status: 503 });
  }
}

