"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { EcoLink, EcoNode } from "@/lib/home-data";
import { cn } from "@/lib/utils";

const nf = new Intl.NumberFormat("en-US");
const PROGRAM_NAME = { gsoc: "Google Summer of Code", lfx: "LFX Mentorship" } as const;

interface EcosystemProps {
  width: number;
  height: number;
  nodes: EcoNode[];
  links: EcoLink[];
  filters: string[];
  orgCount: number;
}

type ProgramFilter = "all" | "gsoc" | "lfx";

/**
 * The largest organizations as a network you can explore. Spheres are sized by projects run;
 * a line joins two organizations that list four or more of the same technologies. Hover, focus
 * or tap a sphere for details; arrow keys move between spheres; Enter opens the organization.
 */
export default function Ecosystem({ width: W, height: H, nodes, links, filters, orgCount }: EcosystemProps) {
  const router = useRouter();
  const [program, setProgram] = useState<ProgramFilter>("all");
  const [tech, setTech] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [cursor, setCursor] = useState(() => [...nodes].sort((a, b) => b.projects - a.projects)[0]?.id ?? "");
  const pointer = useRef<string>("mouse");
  const [touch, setTouch] = useState(false);
  const refs = useRef(new Map<string, { focus: () => void }>());

  const scroller = useRef<HTMLDivElement>(null);
  // On narrow screens the network is wider than the viewport; start in the middle of it.
  useEffect(() => {
    const el = scroller.current;
    if (el && el.scrollWidth > el.clientWidth) el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
  }, []);

  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const neighbours = useMemo(() => {
    const m = new Map<string, { id: string; shared: string[] }[]>();
    for (const l of links) {
      m.set(l.source, [...(m.get(l.source) ?? []), { id: l.target, shared: l.shared }]);
      m.set(l.target, [...(m.get(l.target) ?? []), { id: l.source, shared: l.shared }]);
    }
    for (const list of m.values()) list.sort((a, b) => b.shared.length - a.shared.length);
    return m;
  }, [links]);

  const matches = useMemo(() => {
    const t = tech?.toLowerCase();
    return new Set(nodes.filter((n) => (program === "all" || n.program === program) && (!t || n.tech.some((x) => x.toLowerCase() === t))).map((n) => n.id));
  }, [nodes, program, tech]);

  const focusNode = selected ? byId.get(selected) : undefined;
  const near = new Set(focusNode ? (neighbours.get(focusNode.id) ?? []).map((n) => n.id) : []);
  // Label the largest organizations whose names do not collide, in viewBox units (about 6 per character).
  const labelled = useMemo(() => {
    const boxes: { x0: number; x1: number; y0: number; y1: number }[] = [];
    const ids = new Set<string>();
    for (const n of [...nodes].sort((a, b) => b.projects - a.projects)) {
      const w = n.name.length * 7.6 + 8;
      const x0 = Math.min(Math.max(n.x - w / 2, 0), W - w), y0 = n.y + n.r + 2;
      const box = { x0, x1: x0 + w, y0, y1: y0 + 18 };
      if (boxes.some((b) => box.x0 < b.x1 && box.x1 > b.x0 && box.y0 < b.y1 && box.y1 > b.y0)) continue;
      boxes.push(box);
      ids.add(n.id);
      if (ids.size === 9) break;
    }
    return ids;
  }, [nodes, W]);

  const move = (from: EcoNode, key: string) => {
    const dir = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowDown: [0, 1], ArrowUp: [0, -1] }[key];
    if (!dir) return;
    let best: EcoNode | undefined;
    let bestScore = Infinity;
    for (const n of nodes) {
      if (n.id === from.id || !matches.has(n.id)) continue;
      const dx = n.x - from.x, dy = n.y - from.y;
      const along = dx * dir[0] + dy * dir[1];
      if (along <= 0) continue;
      const across = Math.abs(dx * dir[1] - dy * dir[0]);
      const score = along + across * 2;
      if (score < bestScore) { bestScore = score; best = n; }
    }
    if (best) {
      setCursor(best.id);
      setSelected(best.id);
      refs.current.get(best.id)?.focus();
    }
  };

  const open = (n: EcoNode) => router.push(n.href);
  const visibleLinks = links.filter((l) => matches.has(l.source) && matches.has(l.target));
  const tabStop = matches.has(cursor) ? cursor : [...matches][0];

  return (
    <section id="ecosystem" aria-labelledby="ecosystem-title" className="cine cine-section">
      <div className="cine-wrap font-ui">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <h2 id="ecosystem-title" className="font-display cine-h2">linked by the tools they share.</h2>
          <p className="cine-lede">
            Each sphere is one of the {nodes.length} largest of {nf.format(orgCount)} organizations, sized by the projects it has run. A line joins two organizations that list four or more of the same technologies. If you can work in one, you can read the code of its neighbours.
          </p>
        </div>

        {/* Filters dim everything that does not match; the graph itself stays in place. */}
        <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div role="radiogroup" aria-label="Program" className="flex items-center gap-1 self-start rounded-[3px] border border-[var(--cine-line-strong)] p-1">
            {(["all", "gsoc", "lfx"] as const).map((p) => (
              <button
                key={p}
                type="button"
                role="radio"
                aria-checked={program === p}
                onClick={() => setProgram(p)}
                className={cn("whitespace-nowrap rounded-[2px] px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-[var(--cine-accent)]", program === p ? "bg-[var(--cine-fg)] text-[var(--cine-bg)]" : "text-[var(--cine-fg-2)] hover:text-[var(--cine-fg)]")}
              >
                {p === "all" ? "Both programs" : p === "gsoc" ? "GSoC" : "LFX"}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Technology">
            {filters.map((f) => (
              <button key={f} type="button" aria-pressed={tech === f} onClick={() => setTech(tech === f ? null : f)} className="cine-chip">
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="eco mt-6">
          <div ref={scroller} className="eco__scroll">
            <div className="eco__frame" onPointerLeave={() => { if (pointer.current === "mouse") setSelected(null); }}>
              <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label={`Network of ${nodes.length} organizations. Use the arrow keys to move between them and Enter to open one.`}>
                <defs>
                  {(["gsoc", "lfx"] as const).map((p) => (
                    <radialGradient key={p} id={`eco-${p}`} cx="34%" cy="30%" r="78%">
                      <stop offset="0%" style={{ stopColor: "#ffffff", stopOpacity: 0.95 }} />
                      <stop offset="28%" style={{ stopColor: `var(--program-${p})` }} />
                      <stop offset="100%" style={{ stopColor: `color-mix(in srgb, var(--program-${p}) 35%, #050506)` }} />
                    </radialGradient>
                  ))}
                </defs>

                <g aria-hidden="true">
                  {visibleLinks.map((l) => {
                    const a = byId.get(l.source)!, b = byId.get(l.target)!;
                    const on = focusNode && (l.source === focusNode.id || l.target === focusNode.id);
                    return <line key={`${l.source}|${l.target}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={cn("eco__link", on && "eco__link--on", focusNode && !on && "eco__link--off")} />;
                  })}
                </g>

                <g>
                  {nodes.map((n) => {
                    const dim = !matches.has(n.id) || (focusNode && n.id !== focusNode.id && !near.has(n.id));
                    const linkedTo = neighbours.get(n.id)?.length ?? 0;
                    return (
                      <a
                        key={n.id}
                        href={n.href}
                        ref={(el) => { if (el) refs.current.set(n.id, el); else refs.current.delete(n.id); }}
                        tabIndex={n.id === tabStop ? 0 : -1}
                        aria-label={`${n.name}, ${PROGRAM_NAME[n.program]}, ${n.projects} projects over ${n.years} years, linked to ${linkedTo} organizations`}
                        className={cn("eco__node", dim && "eco__node--dim", selected === n.id && "eco__node--on")}
                        onPointerDown={(e) => { pointer.current = e.pointerType; setTouch(e.pointerType === "touch"); }}
                        onPointerEnter={(e) => { if (e.pointerType === "mouse") setSelected(n.id); }}
                        onFocus={() => { setCursor(n.id); setSelected(n.id); }}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") { setSelected(null); return; }
                          if (e.key.startsWith("Arrow")) { e.preventDefault(); move(n, e.key); }
                        }}
                        onClick={(e) => {
                          if (e.metaKey || e.ctrlKey || e.shiftKey) return;
                          e.preventDefault();
                          // First tap on a touch screen shows the details; the second opens the page.
                          if (pointer.current === "touch" && selected !== n.id) { setSelected(n.id); setCursor(n.id); return; }
                          open(n);
                        }}
                      >
                        <circle cx={n.x} cy={n.y} r={Math.max(n.r, 14)} className="eco__hit" />
                        <circle cx={n.x} cy={n.y} r={n.r} fill={`url(#eco-${n.program})`} className="eco__sphere" />
                      </a>
                    );
                  })}
                </g>
              </svg>

              {/* Names of the largest organizations, in HTML so they stay readable at every width. */}
              <ul aria-hidden="true">
                {nodes.filter((n) => labelled.has(n.id)).map((n) => (
                  <li
                    key={n.id}
                    className={cn("eco__label", (!matches.has(n.id) || (focusNode && focusNode.id !== n.id && !near.has(n.id))) && "eco__label--dim", focusNode?.id === n.id && "opacity-0")}
                    style={{ left: `${(Math.min(Math.max(n.x, n.name.length * 3.8 + 4), W - n.name.length * 3.1 - 4) / W) * 100}%`, top: `${((n.y + n.r) / H) * 100}%` }}
                  >
                    {n.name}
                  </li>
                ))}
              </ul>

              {focusNode && (
                <div
                  role="status"
                  className={cn("eco__tip", focusNode.y / H < 0.38 && "eco__tip--below")}
                  style={{
                    left: `${Math.min(84, Math.max(16, (focusNode.x / W) * 100))}%`,
                    top: `${((focusNode.y + (focusNode.y / H < 0.38 ? focusNode.r : -focusNode.r)) / H) * 100}%`,
                  }}
                >
                  <p className="text-xs text-[var(--cine-fg-3)]">{PROGRAM_NAME[focusNode.program]}</p>
                  <p className="font-display mt-0.5 text-xl font-bold leading-tight text-[var(--cine-fg)]">{focusNode.name}</p>
                  <p className="mt-1 text-sm text-[var(--cine-fg-2)]">
                    <strong className="text-[var(--cine-fg)]">{focusNode.projects}</strong> projects over {focusNode.years} {focusNode.years === 1 ? "year" : "years"}
                  </p>
                  <p className="mt-2 text-sm text-[var(--cine-fg-2)]">{focusNode.tech.slice(0, 5).join(", ")}</p>
                  {(neighbours.get(focusNode.id)?.length ?? 0) > 0 && (
                    <p className="mt-2 border-t border-[var(--cine-line)] pt-2 text-sm text-[var(--cine-fg-2)]">
                      Shares tools with {neighbours.get(focusNode.id)!.length} {neighbours.get(focusNode.id)!.length === 1 ? "organization" : "organizations"}, most with{" "}
                      <span className="text-[var(--cine-fg)]">{byId.get(neighbours.get(focusNode.id)![0].id)?.name}</span> ({neighbours.get(focusNode.id)![0].shared.slice(0, 4).join(", ")}).
                    </p>
                  )}
                  <p className="mt-2 text-xs text-[var(--cine-fg-3)]">{touch ? "Tap again to open" : "Click or press Enter to open"}</p>
                </div>
              )}
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-[var(--cine-fg-2)]">
            <span className="flex items-center gap-2"><span className="eco__key" style={{ background: "radial-gradient(circle at 34% 30%, #fff, var(--program-gsoc) 40%, color-mix(in srgb, var(--program-gsoc) 35%, #050506))" }} aria-hidden="true" />Google Summer of Code</span>
            <span className="flex items-center gap-2"><span className="eco__key" style={{ background: "radial-gradient(circle at 34% 30%, #fff, var(--program-lfx) 40%, color-mix(in srgb, var(--program-lfx) 35%, #050506))" }} aria-hidden="true" />LFX Mentorship</span>
            <span className="flex items-center gap-2"><span className="h-px w-6 bg-[var(--cine-fg-3)]" aria-hidden="true" />Four or more shared technologies</span>
            <span className="text-[var(--cine-fg-3)] lg:ml-auto">
              <span className="hidden md:inline">Arrow keys move between organizations. Enter opens one.</span>
              <span className="md:hidden">Swipe sideways to see the whole network. Tap a sphere for details.</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
