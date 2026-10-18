import { ossgridRepo } from "@/data/contributors";
import type { Contributor } from "./contributors";

/** GitHub credentials are used only by server routes and the local sync script. */
async function github(path: string) {
  const response = await fetch(`https://api.github.com/${path}`, {
    headers: { Accept: "application/vnd.github+json", "User-Agent": "OSSGrid", ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}) },
    next: { revalidate: 86400 },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`GitHub unavailable (${response.status})`);
  return response;
}

export async function fetchContributors(): Promise<Contributor[]> {
  const people: Contributor[] = [];
  // Every page of all-time contributors, not a recent-activity window.
  for (let page = 1; ; page++) {
    const response = await github(`repos/${ossgridRepo}/contributors?per_page=100&page=${page}`);
    const batch = await response.json() as { id: number; login: string; avatar_url: string; html_url: string; type: string; contributions: number }[];
    if (!Array.isArray(batch)) throw new Error("Unexpected GitHub response");
    for (const person of batch) {
      if (person.type !== "User") continue;
      people.push({ id: person.id, login: person.login, name: person.login, avatarUrl: person.avatar_url, profileUrl: person.html_url, contributions: person.contributions });
    }
    if (!response.headers.get("link")?.includes('rel="next"')) break;
  }
  // Resolve display names without discarding contributor records if a profile request fails.
  for (let offset = 0; offset < people.length; offset += 5) {
    await Promise.all(people.slice(offset, offset + 5).map(async (person) => {
      try {
        const profile = await (await github(`users/${person.login}`)).json() as { name?: string };
        if (profile.name) person.name = profile.name;
      } catch { /* The verified GitHub username remains a usable display name. */ }
    }));
  }
  return people;
}
