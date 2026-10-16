import aliases from "../gsoc-tag-aliases.json";

/** lower-cased variant → canonical display label. Shared by the LFX and GSoC pipelines. */
export const TAG_ALIASES: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const [canonical, variants] of Object.entries(aliases)) {
    if (canonical.startsWith("_")) continue;
    for (const v of variants as string[]) map[v.toLowerCase()] = canonical;
  }
  return map;
})();

/** Map one raw tag to its canonical label; returns the trimmed input when no alias matches. */
export function canonicalTag(raw: string): { label: string; matched: boolean } {
  const trimmed = raw.replace(/\s+/g, " ").trim();
  const hit = TAG_ALIASES[trimmed.toLowerCase()];
  return hit ? { label: hit, matched: true } : { label: trimmed, matched: false };
}
