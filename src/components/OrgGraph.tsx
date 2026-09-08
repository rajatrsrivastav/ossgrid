"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import type { SimulationNodeDatum, SimulationLinkDatum } from "d3-force";
import { Organization } from "@/lib/types";
import { useRouter } from "next/navigation";

/* ── Types ─────────────────────────────────────────────────────────────── */
interface NodeDatum extends SimulationNodeDatum {
  id: string;
  name: string;
  projectCount: number;
  foundation: string;
  logoUrl: string;
  radius: number;
  color: string;
  termLabel: string;
}

interface LinkDatum extends SimulationLinkDatum<NodeDatum> {
  source: NodeDatum | string | number;
  target: NodeDatum | string | number;
}

interface OrgGraphProps {
  organizations: Organization[];
  width: number;
  height: number;
}

/**
 * Deterministic color-encoding rule (Issue 1 Requirement 2):
 * Maps each organization to a theme chart token based on its most recent active LFX term:
 * - Term 1 (Mar–May) → --chart-term1 (#4f8eff, electric blue)
 * - Term 2 (Jun–Aug) → --chart-term2 (#34d399, vibrant emerald)
 * - Term 3 (Sep–Nov) → --chart-term3 (#a78bfa, soft purple)
 * - Multi-term / other → --chart-term4 (#fb923c, warm orange)
 */
function getOrgTermCategory(terms: string[]): { label: string; color: string } {
  const latest = terms && terms.length > 0 ? terms[0] : "";
  if (latest.includes("Term 1") || latest.includes("01-Mar-May")) {
    return { label: "Term 1 (Mar–May)", color: "#4f8eff" };
  }
  if (latest.includes("Term 2") || latest.includes("02-Jun-Aug")) {
    return { label: "Term 2 (Jun–Aug)", color: "#34d399" };
  }
  if (latest.includes("Term 3") || latest.includes("03-Sep-Nov")) {
    return { label: "Term 3 (Sep–Nov)", color: "#a78bfa" };
  }
  return { label: "Multi-Term", color: "#fb923c" };
}

/* ── Tooltip ───────────────────────────────────────────────────────────── */
interface TooltipState { x: number; y: number; node: NodeDatum | null }

export default function OrgGraph({ organizations, width, height }: OrgGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<NodeDatum[]>([]);
  const [links, setLinks] = useState<LinkDatum[]>([]);
  const [viewBox, setViewBox] = useState<string>("");
  const [tooltip, setTooltip] = useState<TooltipState>({ x: 0, y: 0, node: null });
  const router = useRouter();
  const prefersReduced = useRef(false);

  // Top 14 organizations by project count receive persistent visible labels at rest
  const topNodeIds = useMemo(() => {
    const sorted = [...organizations].sort((a, b) => b.projectCount - a.projectCount);
    return new Set(sorted.slice(0, 14).map((o) => o.id));
  }, [organizations]);

  /* Calculate responsive bounding box with padding to center and frame the layout (Issue 1 Requirement 5) */
  const computeViewBox = useCallback((nodeList: NodeDatum[]): string => {
    if (!nodeList.length || !width || !height) return `0 0 ${width || 600} ${height || 400}`;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const n of nodeList) {
      const pad = n.radius + 24; // include label padding
      if (n.x != null && n.y != null) {
        minX = Math.min(minX, n.x - pad);
        maxX = Math.max(maxX, n.x + pad);
        minY = Math.min(minY, n.y - pad);
        maxY = Math.max(maxY, n.y + pad);
      }
    }
    if (!isFinite(minX)) return `0 0 ${width} ${height}`;
    const margin = 28;
    const vbX = minX - margin;
    const vbY = minY - margin;
    const vbW = Math.max(100, (maxX - minX) + margin * 2);
    const vbH = Math.max(100, (maxY - minY) + margin * 2);
    return `${vbX} ${vbY} ${vbW} ${vbH}`;
  }, [width, height]);

  /* Build initial node positions synchronously for reduced-motion and simulation start */
  const buildNodes = useCallback((): NodeDatum[] => {
    const maxProjects = Math.max(...organizations.map((o) => o.projectCount), 1);
    return organizations.map((org, i) => {
      const angle = (i / organizations.length) * Math.PI * 2;
      const r = Math.sqrt(org.projectCount / maxProjects) * 16 + 7;
      const spread = (Math.min(width, height) / 2) * 0.72;
      const termInfo = getOrgTermCategory(org.terms);
      return {
        id: org.id,
        name: org.name,
        projectCount: org.projectCount,
        foundation: org.foundation,
        logoUrl: org.logoUrl,
        radius: r,
        color: termInfo.color,
        termLabel: termInfo.label,
        x: width / 2 + Math.cos(angle) * spread * (0.45 + Math.random() * 0.55),
        y: height / 2 + Math.sin(angle) * spread * (0.45 + Math.random() * 0.55),
      };
    });
  }, [organizations, width, height]);

  /* Build edges between orgs sharing a technology */
  const buildLinks = useCallback(
    (nodeList: NodeDatum[]): LinkDatum[] => {
      const nodeMap = new Map(nodeList.map((n) => [n.id, n]));
      const edges: LinkDatum[] = [];
      const seen = new Set<string>();

      organizations.forEach((orgA) => {
        organizations.forEach((orgB) => {
          if (orgA.id === orgB.id) return;
          const key = [orgA.id, orgB.id].sort().join("|");
          if (seen.has(key)) return;
          const shared = orgA.technologies.some((t) =>
            orgB.technologies.includes(t)
          );
          if (shared) {
            seen.add(key);
            const s = nodeMap.get(orgA.id);
            const t = nodeMap.get(orgB.id);
            if (s && t) edges.push({ source: s, target: t });
          }
        });
      });

      // Cap edges for performance — representative sample
      return edges.slice(0, 180);
    },
    [organizations]
  );

  useEffect(() => {
    if (!organizations.length || !width || !height) return;
    prefersReduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const initNodes = buildNodes();

    // Under reduced-motion skip simulation entirely — use static radial layout
    if (prefersReduced.current) {
      setNodes([...initNodes]);
      setLinks(buildLinks(initNodes) as LinkDatum[]);
      setViewBox(computeViewBox(initNodes));
      return;
    }

    // Dynamic import d3-force so it doesn't affect initial bundle size
    import("d3-force").then(({ forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide, forceX, forceY }) => {
      const sim = forceSimulation<NodeDatum>(initNodes)
        .force("link", forceLink<NodeDatum, LinkDatum>(buildLinks(initNodes) as LinkDatum[])
          .id((d) => d.id)
          .distance(70)
          .strength(0.12))
        .force("charge", forceManyBody().strength(-140))
        .force("center", forceCenter(width / 2, height / 2))
        .force("collide", forceCollide<NodeDatum>((d) => d.radius + 8).strength(0.85))
        .force("x", forceX(width / 2).strength(0.04))
        .force("y", forceY(height / 2).strength(0.04))
        .alphaDecay(0.035);

      let ticks = 0;
      sim.on("tick", () => {
        ticks++;
        initNodes.forEach((n) => {
          n.x = Math.max(n.radius + 10, Math.min(width - n.radius - 10, n.x ?? width / 2));
          n.y = Math.max(n.radius + 10, Math.min(height - n.radius - 10, n.y ?? height / 2));
        });
        if (ticks % 8 === 0 || sim.alpha() < 0.01) {
          setNodes([...initNodes]);
        }
      });

      sim.on("end", () => {
        setNodes([...initNodes]);
        setLinks(sim.force<ReturnType<typeof forceLink>>("link")?.links() as LinkDatum[] ?? []);
        setViewBox(computeViewBox(initNodes));
        sim.stop();
      });
    });
  }, [organizations, width, height, buildNodes, buildLinks, computeViewBox]);

  const handleNodeClick = useCallback(
    (node: NodeDatum) => {
      router.push(`/organization/${node.id}`);
    },
    [router]
  );

  if (!nodes.length) return null;

  return (
    <div
      className="relative w-full h-full select-none overflow-hidden rounded-2xl"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-card)",
        cursor: "default",
      }}
    >
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={viewBox || `0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 w-full h-full"
        role="img"
        aria-label="Organization relationship graph — click a node to view details"
      >
        <defs>
          {/* Theme-adaptive subtle background dot grid */}
          <pattern id="graph-grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="var(--border-card)" opacity="0.8" />
          </pattern>

          {/* Radial gradients for colorful nodes */}
          {nodes.map((n) => (
            <radialGradient key={n.id + "_grad"} id={`ng_${n.id}`} cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor={n.color} stopOpacity="0.95" />
              <stop offset="100%" stopColor={n.color} stopOpacity="0.5" />
            </radialGradient>
          ))}
        </defs>

        {/* Background Grid Pattern */}
        <rect width="100%" height="100%" fill="url(#graph-grid)" />

        {/* Edges */}
        <g opacity="0.22">
          {links.map((l, i) => {
            const s = typeof l.source === "object" ? (l.source as NodeDatum) : null;
            const t = typeof l.target === "object" ? (l.target as NodeDatum) : null;
            if (!s || !t) return null;
            return (
              <line
                key={i}
                x1={s.x ?? 0} y1={s.y ?? 0}
                x2={t.x ?? 0} y2={t.y ?? 0}
                stroke="var(--text-muted)"
                strokeWidth="0.9"
              />
            );
          })}
        </g>

        {/* Nodes & Labels */}
        {nodes.map((n) => (
          <g
            key={n.id}
            transform={`translate(${n.x ?? 0},${n.y ?? 0})`}
            style={{ cursor: "pointer" }}
            role="button"
            aria-label={`${n.name} — ${n.projectCount} projects, ${n.termLabel}`}
            tabIndex={0}
            onClick={() => handleNodeClick(n)}
            onKeyDown={(e) => e.key === "Enter" && handleNodeClick(n)}
            onMouseEnter={() => {
              setTooltip({
                x: (n.x ?? 0) + 12,
                y: (n.y ?? 0) - 12,
                node: n,
              });
            }}
            onMouseLeave={() => setTooltip({ x: 0, y: 0, node: null })}
            onFocus={() => {
              setTooltip({ x: (n.x ?? 0) + 12, y: (n.y ?? 0) - 12, node: n });
            }}
            onBlur={() => setTooltip({ x: 0, y: 0, node: null })}
          >
            {/* Glow ring on hover */}
            <circle
              r={n.radius + 5}
              fill="none"
              stroke={n.color}
              strokeWidth="1.5"
              opacity="0"
              className="node-ring"
            />
            {/* Main node bubble */}
            <circle
              r={n.radius}
              fill={`url(#ng_${n.id})`}
              stroke={n.color}
              strokeWidth="1.4"
              strokeOpacity="0.85"
            />
            {/* Center dot accent */}
            {n.radius > 10 && (
              <circle r={2.5} fill={n.color} opacity="0.9" />
            )}

            {/* Persistent label for top N nodes at rest (Issue 1 Requirement 4) */}
            {topNodeIds.has(n.id) && (
              <text
                y={n.radius + 12}
                textAnchor="middle"
                fontSize="10.5"
                fontWeight="600"
                fill="var(--text-primary)"
                fontFamily="var(--font-sans), Inter, sans-serif"
                className="pointer-events-none select-none"
                style={{
                  paintOrder: "stroke",
                  stroke: "var(--bg-base)",
                  strokeWidth: "3px",
                  strokeLinejoin: "round",
                }}
              >
                {n.name.length > 14 ? n.name.slice(0, 13) + "…" : n.name}
              </text>
            )}
          </g>
        ))}

        {/* Hover Tooltip inside SVG */}
        {tooltip.node && (
          <g transform={`translate(${tooltip.x},${tooltip.y})`} pointerEvents="none" className="z-20">
            <rect
              x={-4} y={-22}
              width={Math.max(tooltip.node.name.length * 7.5, 140)}
              height={56}
              rx={8}
              fill="var(--bg-raised)"
              stroke="var(--border-card)"
              strokeWidth="1"
              filter="drop-shadow(0 4px 14px rgba(0,0,0,0.25))"
            />
            <text
              x={8} y={-3}
              fontSize="12.5"
              fontWeight="600"
              fill="var(--text-primary)"
              fontFamily="var(--font-sans), Inter, sans-serif"
            >
              {tooltip.node.name.length > 22
                ? tooltip.node.name.slice(0, 22) + "…"
                : tooltip.node.name}
            </text>
            <text
              x={8} y={15}
              fontSize="10.5"
              fill="var(--text-muted)"
              fontFamily="var(--font-mono), monospace"
            >
              {tooltip.node.projectCount} project{tooltip.node.projectCount !== 1 ? "s" : ""}
            </text>
            <text
              x={8} y={29}
              fontSize="10"
              fill={tooltip.node.color}
              fontWeight="600"
              fontFamily="var(--font-sans), Inter, sans-serif"
            >
              {tooltip.node.termLabel} · CNCF
            </text>
          </g>
        )}
      </svg>

      {/* Persistent corner legend (Issue 1 Requirement 3) */}
      <div
        className="absolute bottom-3 left-3 flex flex-col gap-1.5 p-2.5 sm:p-3 rounded-xl pointer-events-none z-10"
        style={{
          background: "var(--bg-overlay)",
          border: "1px solid var(--border-card)",
          backdropFilter: "blur(var(--glass-blur))",
          WebkitBackdropFilter: "blur(var(--glass-blur))",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div className="flex items-center justify-between gap-3 pb-1 border-b border-[var(--border-card)]">
          <span className="text-[10.5px] font-semibold tracking-wider uppercase" style={{ color: "var(--text-muted)" }}>
            Primary Term
          </span>
          <span className="text-[10px] font-mono opacity-80" style={{ color: "var(--text-muted)" }}>
            Size = Projects
          </span>
        </div>
        <div className="flex flex-col gap-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: "#4f8eff" }} />
            <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>Term 1 (Mar–May)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: "#34d399" }} />
            <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>Term 2 (Jun–Aug)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: "#a78bfa" }} />
            <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>Term 3 (Sep–Nov)</span>
          </div>
        </div>
      </div>

      {/* CSS for hover ring & reduced motion */}
      <style>{`
        .node-ring { transition: opacity 0.15s ease; }
        g:hover .node-ring, g:focus .node-ring { opacity: 0.65; }
        @media (prefers-reduced-motion: reduce) {
          circle, g { transition: none !important; }
        }
      `}</style>
    </div>
  );
}
