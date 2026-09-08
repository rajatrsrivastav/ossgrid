// SVG node-cluster brand mark — grid/node motif
// Assembles on first mount (600ms), static under reduced-motion

"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

interface LogoMarkProps {
  size?: number;
  animated?: boolean;
}

function subscribeReducedMotion(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

export default function LogoMark({ size = 32, animated = false }: LogoMarkProps) {
  const prefersReduced = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );
  const [assembled, setAssembled] = useState(!animated);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (animated && !hasAnimated.current && !prefersReduced) {
      hasAnimated.current = true;
      const t = setTimeout(() => setAssembled(true), 80);
      return () => clearTimeout(t);
    }
  }, [animated, prefersReduced]);

  // Node positions (normalized 0-24 viewBox)
  const nodes = [
    { cx: 12, cy: 4,  r: 2.5, delay: 0 },      // top center
    { cx: 4,  cy: 12, r: 2,   delay: 80 },     // left
    { cx: 20, cy: 12, r: 2,   delay: 160 },    // right
    { cx: 8,  cy: 20, r: 1.5, delay: 240 },    // bottom-left
    { cx: 16, cy: 20, r: 1.5, delay: 310 },    // bottom-right
    { cx: 12, cy: 13, r: 1.2, delay: 380 },    // center hub
  ];

  const edges = [
    { x1: 12, y1: 4,  x2: 12, y2: 13, delay: 200 },
    { x1: 12, y1: 4,  x2: 4,  y2: 12, delay: 260 },
    { x1: 12, y1: 4,  x2: 20, y2: 12, delay: 320 },
    { x1: 4,  y1: 12, x2: 12, y2: 13, delay: 380 },
    { x1: 20, y1: 12, x2: 12, y2: 13, delay: 400 },
    { x1: 12, y1: 13, x2: 8,  y2: 20, delay: 430 },
    { x1: 12, y1: 13, x2: 16, y2: 20, delay: 450 },
    { x1: 8,  y1: 20, x2: 16, y2: 20, delay: 470 },
  ];

  const shouldAnimate = animated && !prefersReduced;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Edges */}
      {edges.map((e, i) => {
        const len = Math.sqrt((e.x2 - e.x1) ** 2 + (e.y2 - e.y1) ** 2);
        return (
          <line
            key={i}
            x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
            stroke="white"
            strokeOpacity={assembled ? 0.5 : 0}
            strokeWidth="0.8"
            strokeLinecap="round"
            strokeDasharray={len}
            strokeDashoffset={assembled ? 0 : len}
            style={
              shouldAnimate
                ? {
                    transition: `stroke-dashoffset 0.35s cubic-bezier(0.4, 0, 0.2, 1) ${e.delay}ms,
                                 stroke-opacity 0.2s ease ${e.delay}ms`,
                  }
                : {}
            }
          />
        );
      })}

      {/* Nodes */}
      {nodes.map((n, i) => (
        <circle
          key={i}
          cx={n.cx} cy={n.cy} r={n.r}
          fill="white"
          opacity={assembled ? (i === 0 ? 1 : 0.8) : 0}
          style={
            shouldAnimate
              ? {
                  transition: `opacity 0.25s ease ${n.delay}ms,
                               transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) ${n.delay}ms`,
                  transformOrigin: `${n.cx}px ${n.cy}px`,
                  transform: assembled ? "scale(1)" : "scale(0.2)",
                }
              : {}
          }
        />
      ))}
    </svg>
  );
}
