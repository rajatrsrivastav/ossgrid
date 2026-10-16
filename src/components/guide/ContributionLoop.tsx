"use client";

import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";
import { LOOP_STEPS } from "@/data/guide";

const KEY = "ossgrid_guide_loop_v1";

/** The contribution loop as a checklist. Progress is a per-browser convenience in localStorage. */
export default function ContributionLoop() {
  const [done, setDone] = useState<boolean[]>(() => LOOP_STEPS.map(() => false));
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setDone(LOOP_STEPS.map((_, i) => parsed[i] === true));
        }
      } catch {
        /* storage unavailable: start fresh */
      }
      setLoaded(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const update = (next: boolean[]) => {
    setDone(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
  };
  const count = done.filter(Boolean).length;

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="num text-sm text-[var(--text-secondary)]" aria-live="polite">{count} of {LOOP_STEPS.length} done{loaded ? "" : "…"}</p>
        {count > 0 && (
          <button type="button" onClick={() => update(LOOP_STEPS.map(() => false))} className="btn btn-ghost btn-sm">
            <RotateCcw size={12} aria-hidden="true" /> Reset
          </button>
        )}
      </div>
      <ol className="grid grid-cols-1 gap-1 md:grid-cols-2">
        {LOOP_STEPS.map((step, i) => (
          <li key={step}>
            <label className="facet-row">
              <span className="flex min-w-0 items-center gap-2.5">
                <input type="checkbox" className="filter-checkbox" checked={done[i]} onChange={() => update(done.map((d, j) => (j === i ? !d : d)))} />
                <span className={done[i] ? "line-through text-[var(--text-muted)]" : ""}>{step}</span>
              </span>
              <span className="num text-xs text-[var(--text-muted)]">{String(i + 1).padStart(2, "0")}</span>
            </label>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-xs text-[var(--text-muted)]">Saved in this browser only. Nothing leaves your device.</p>
    </div>
  );
}
