"use client";

import { motion, HTMLMotionProps, type Variants } from "framer-motion";
import { ReactNode } from "react";

export type RevealDirection = "up" | "down" | "left" | "right" | "none";

interface ScrollRevealProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  direction?: RevealDirection;
  delay?: number;
  duration?: number;
  distance?: number;
  amount?: "some" | "all" | number;
  once?: boolean;
}

const EASE = [0.25, 0.1, 0.25, 1] as const;

export function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.5,
  distance = 24,
  amount = "some",
  once = true,
  className,
  ...props
}: ScrollRevealProps) {
  const sign = direction === "up" || direction === "left" ? 1 : -1;
  const axis = direction === "left" || direction === "right" ? "x" : "y";
  const offset = direction === "none" ? 0 : sign * distance;

  return (
    <motion.div
      initial={{ opacity: 0, [axis]: offset }}
      whileInView={{ opacity: 1, [axis]: 0 }}
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: EASE }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export const staggerContainerVariant: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

export const staggerItemVariant: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
};

interface StaggerProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  amount?: "some" | "all" | number;
  once?: boolean;
}

export function StaggerContainer({ children, amount = "some", once = true, className, ...props }: StaggerProps) {
  return (
    <motion.div variants={staggerContainerVariant} initial="hidden" whileInView="show" viewport={{ once, amount }} className={className} {...props}>
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div variants={staggerItemVariant} className={className} {...props}>
      {children}
    </motion.div>
  );
}
