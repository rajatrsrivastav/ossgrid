/** Extract a repository from an existing GitHub repository, file, or issue URL. */
export function githubRepo(url: string | undefined): { slug: string; url: string } | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || parsed.hostname.toLowerCase() !== "github.com") return null;
    const parts = parsed.pathname.replace(/\/$/, "").split("/").filter(Boolean);
    if (["orgs", "users", "topics", "collections", "settings", "marketplace", "features", "sponsors", "search"].includes(parts[0]?.toLowerCase())) return null;
    if (parts.length < 2 || !parts.slice(0, 2).every((part) => /^[\w.-]+$/.test(part))) return null;
    if (parts[1].toLowerCase().endsWith(".git")) parts[1] = parts[1].slice(0, -4);
    if (parts.slice(0, 2).some((part) => !part || part === "." || part === "..")) return null;
    const slug = `${parts[0]}/${parts[1]}`;
    return { slug, url: `https://github.com/${slug}` };
  } catch {
    return null;
  }
}

/** Prefer the upstream project's issue over the mentorship intake repository. */
export function projectRepositoryUrl(project: { upstreamIssueUrl: string; links: string[] }): string | undefined {
  for (const url of [project.upstreamIssueUrl, ...project.links]) {
    const repo = githubRepo(url);
    if (repo && repo.slug.toLowerCase() !== "cncf/mentoring") return repo.url;
  }
  return undefined;
}
