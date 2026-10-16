import calendar from "@/data/program-calendar.json";
import type { ProgramId } from "@/data/programs";

/**
 * Next application window per live program, derived from program-calendar.json.
 * Used to order hero CTAs: nearest window first, GSoC first on a tie or when unknown.
 */
export function nextApplicationDate(id: ProgramId, now = new Date()): Date | null {
  if (id === "lfx") {
    const upcoming = calendar.lfx.terms.filter((t) => new Date(t.start + "T00:00:00Z") > now).sort((a, b) => a.start.localeCompare(b.start))[0];
    return upcoming ? new Date(upcoming.start + "T00:00:00Z") : null;
  }
  if (id === "gsoc") {
    // Contributor applications open in March every year (official timeline).
    const year = now.getUTCMonth() >= 3 ? now.getUTCFullYear() + 1 : now.getUTCFullYear();
    return new Date(Date.UTC(year, 2, 15));
  }
  return null;
}

export function orderByNextWindow<T extends { id: ProgramId }>(programs: T[], now = new Date()): T[] {
  return [...programs].sort((a, b) => {
    const da = nextApplicationDate(a.id, now)?.getTime() ?? Infinity;
    const db = nextApplicationDate(b.id, now)?.getTime() ?? Infinity;
    if (da !== db) return da - db;
    return (a.id === "gsoc" ? 0 : 1) - (b.id === "gsoc" ? 0 : 1);
  });
}
