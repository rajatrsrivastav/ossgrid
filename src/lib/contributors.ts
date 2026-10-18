import { creatorLogin, creatorGitHubId, manualContributors } from "@/data/contributors";

export interface Contributor {
  id?: number;
  login: string;
  name: string;
  avatarUrl: string;
  profileUrl: string;
  contributions?: number;
  type?: string;
}

/** Preserve historical recognition, merge refreshed records, and exclude the creator/bots. */
export function mergeContributors(...sources: Contributor[][]): Contributor[] {
  const people: Contributor[] = [];
  for (const person of sources.flat()) {
    if (person.id === creatorGitHubId || person.login.toLowerCase() === creatorLogin || person.type === "Bot" || /\[bot\]$/i.test(person.login)) continue;
    const index = people.findIndex((p) => (person.id !== undefined && p.id === person.id) || p.login.toLowerCase() === person.login.toLowerCase());
    if (index < 0) people.push({ ...person });
    else people[index] = { ...people[index], ...person };
  }
  for (const person of manualContributors) {
    const existing = people.find((p) => p.id === person.id || p.login.toLowerCase() === person.login.toLowerCase());
    if (existing) existing.name = person.name;
    else people.push({ ...person, avatarUrl: `https://github.com/${person.login}.png?size=96`, profileUrl: `https://github.com/${person.login}` });
  }
  return people.sort((a, b) => a.name.localeCompare(b.name));
}
