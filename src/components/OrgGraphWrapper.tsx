"use client";

import dynamic from "next/dynamic";
import { Organization } from "@/lib/types";
import { useEffect, useRef, useState } from "react";

const OrgGraph = dynamic(() => import("@/components/OrgGraph"), { ssr: false });

interface OrgGraphWrapperProps {
  organizations: Organization[];
}

export default function OrgGraphWrapper({ organizations }: OrgGraphWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width: Math.floor(width), height: Math.floor(height) });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      {dimensions.width > 0 && dimensions.height > 0 && (
        <OrgGraph
          organizations={organizations}
          width={dimensions.width}
          height={dimensions.height}
        />
      )}
    </div>
  );
}
