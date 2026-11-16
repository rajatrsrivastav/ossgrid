"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

interface EventSectionRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

/** Matches OrgChartWrapper fade: opacity + y, 0.4s, ease [0.16, 1, 0.3, 1]. */
export default function EventSectionReveal({ children, className, delay = 0 }: EventSectionRevealProps) {
  const reduce = useReducedMotion();
  if (reduce) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -40px 0px" }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
