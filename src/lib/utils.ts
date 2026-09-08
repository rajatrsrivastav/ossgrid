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
 * Runtime guard: if a description contains bare URLs or has < 30 chars of
 * real prose, return a clean fallback. Applied at render time so existing
 * bad data in organizations.json is caught without a full pipeline re-run.
 */
export function sanitizeDescription(desc: string, orgName: string): string {
  if (!desc || desc.trim().length === 0) {
    return `${orgName} participates in LFX Mentorship`;
  }
  // Reject if it contains a bare HTTP URL
  if (/https?:\/\//i.test(desc)) {
    return `${orgName} participates in LFX Mentorship`;
  }
  // Reject if prose (after stripping inline markdown links) is < 30 chars
  const prose = desc
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/https?:\/\/\S+/g, "")
    .trim();
  if (prose.length < 30) {
    return `${orgName} participates in LFX Mentorship`;
  }
  return desc;
}
