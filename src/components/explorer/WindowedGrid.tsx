"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ExplorerOrg } from "@/lib/explorer/types";

interface WindowedGridProps {
  items: ExplorerOrg[];
  renderItem: (org: ExplorerOrg) => React.ReactNode;
  /** Rows rendered above and below the viewport. */
  overscan?: number;
}

const GAP = 16;
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

function columnsForViewport(): number {
  if (typeof window === "undefined") return 3;
  if (window.matchMedia("(min-width: 1280px)").matches) return 3;
  if (window.matchMedia("(min-width: 768px)").matches) return 2;
  return 1;
}

/**
 * Window-scrolled grid for large result sets. Rows are assumed to share one height (the tallest
 * card in the first rendered row), which keeps the implementation dependency-free and accurate
 * enough for uniform cards. Only rows near the viewport are mounted.
 */
export default function WindowedGrid({ items, renderItem, overscan = 2 }: WindowedGridProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [columns, setColumns] = useState(3);
  const [rowHeight, setRowHeight] = useState(320);
  const [range, setRange] = useState({ start: 0, end: 12 });

  useIsoLayoutEffect(() => {
    const update = () => setColumns(columnsForViewport());
    update();
    const queries = [window.matchMedia("(min-width: 1280px)"), window.matchMedia("(min-width: 768px)")];
    queries.forEach((q) => q.addEventListener("change", update));
    return () => queries.forEach((q) => q.removeEventListener("change", update));
  }, []);

  const rowCount = Math.ceil(items.length / columns);
  const stride = rowHeight + GAP;

  useEffect(() => {
    let frame = 0;
    const compute = () => {
      frame = 0;
      const el = containerRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      const viewTop = window.scrollY - top;
      const viewBottom = viewTop + window.innerHeight;
      const start = Math.max(0, Math.floor(viewTop / stride) - overscan);
      // Always keep a few rows mounted even while the grid sits below the fold.
      const end = Math.min(rowCount, Math.max(Math.ceil(viewBottom / stride) + overscan, start + 4));
      setRange((r) => (r.start === start && r.end === end ? r : { start, end }));
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(compute); };
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [stride, rowCount, overscan, items]);

  // Measure the first mounted row so spacer heights track real card geometry.
  const firstRowRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = firstRowRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      const h = el.getBoundingClientRect().height;
      if (h > 0 && Math.abs(h - rowHeight) > 2) setRowHeight(h);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [rowHeight, range.start, columns]);

  const visible = items.slice(range.start * columns, range.end * columns);
  const paddingTop = range.start * stride;
  const paddingBottom = Math.max(0, (rowCount - range.end) * stride);

  return (
    <div ref={containerRef} style={{ paddingTop, paddingBottom }}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((org, i) => (
          <div key={org.id} ref={i === 0 ? firstRowRef : undefined} className="flex flex-col [&>*]:flex-1">
            {renderItem(org)}
          </div>
        ))}
      </div>
    </div>
  );
}
