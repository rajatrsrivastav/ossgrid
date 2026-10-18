"use client";

import { useEffect, useRef, useState } from "react";
import type { ExplorerOrg } from "@/lib/explorer/types";

interface WindowedGridProps {
  items: ExplorerOrg[];
  renderItem: (org: ExplorerOrg) => React.ReactNode;
}

const BATCH_SIZE = 72;

/**
 * Add cards as they approach the viewport without estimating variable card heights.
 */
export default function WindowedGrid({ items, renderItem }: WindowedGridProps) {
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || visibleCount >= items.length) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        setVisibleCount((count) => Math.min(count + BATCH_SIZE, items.length));
      }
    }, { rootMargin: "1200px 0px" });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [visibleCount, items.length]);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.slice(0, visibleCount).map((org) => renderItem(org))}
      </div>
      {visibleCount < items.length && <div ref={sentinelRef} aria-hidden="true" />}
    </>
  );
}
