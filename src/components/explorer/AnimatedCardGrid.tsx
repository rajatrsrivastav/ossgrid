"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { ExplorerOrg } from "@/lib/explorer/types";

/**
 * framer-motion lives only here so programs with animateCards=false never download it.
 * Loaded through next/dynamic from ExplorerShell.
 */
const motionProps = {
  layout: true,
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.18, ease: "easeOut" as const },
};

export type CardRoot = React.ComponentType<{ className?: string; style?: React.CSSProperties; children?: React.ReactNode }>;

const MotionArticle: CardRoot = ({ className, style, children }) => (
  <motion.article {...motionProps} className={className} style={style}>
    {children}
  </motion.article>
);

interface AnimatedCardGridProps {
  items: ExplorerOrg[];
  renderCard: (org: ExplorerOrg, Root: CardRoot) => React.ReactNode;
}

export default function AnimatedCardGrid({ items, renderCard }: AnimatedCardGridProps) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      {items.map((org) => renderCard(org, MotionArticle))}
    </AnimatePresence>
  );
}
