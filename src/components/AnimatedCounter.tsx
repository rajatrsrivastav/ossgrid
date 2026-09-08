"use client";

import { useEffect, useRef } from "react";

interface AnimatedCounterProps {
  value: number;
  className?: string;
}

/**
 * Rolls from prev value to new value when `value` changes.
 * Uses requestAnimationFrame for smooth easing.
 * Respects prefers-reduced-motion (snaps instantly).
 */
export default function AnimatedCounter({ value, className = "" }: AnimatedCounterProps) {
  const displayRef = useRef<HTMLSpanElement>(null);
  const prevRef = useRef<number>(value);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const el = displayRef.current;
    if (!el) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      el.textContent = String(value);
      prevRef.current = value;
      return;
    }

    const from = prevRef.current;
    const to = value;
    const duration = Math.min(Math.abs(to - from) * 6, 400); // fast for small deltas
    const start = performance.now();

    cancelAnimationFrame(rafRef.current);

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(from + (to - from) * eased);
      if (el) el.textContent = String(current);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        prevRef.current = to;
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);

  return (
    <span
      ref={displayRef}
      className={className}
      style={{ fontVariantNumeric: "tabular-nums", fontFamily: "var(--font-mono)" }}
    >
      {value}
    </span>
  );
}
