export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.substring(0, maxLen).replace(/\s+\S*$/, "") + "…";
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural || singular + "s");
}

/**
 * Runtime guard: clean raw organization descriptions from mentoring datasets,
 * removing markdown links, bare URLs, and scraper artifact prefixes.
 */
export function sanitizeDescription(desc: string, orgName: string, _orgId?: string): string {
  void _orgId;
  if (!desc || desc.trim().length === 0) {
    return `${orgName} participates in LFX Mentorship.`;
  }
  // Strip leading punctuation and tags from raw scrape
  const clean = desc
    .replace(/^(\s*[:\-–—]\s*|\s*description:\s*|\s*project\s+description:\s*)/i, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  if (clean.length < 30) {
    return `${orgName} participates in LFX Mentorship.`;
  }
  return clean;
}

