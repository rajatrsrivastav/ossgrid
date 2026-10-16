import React from "react";
import { cn } from "@/lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  containerClass?: string;
  bleed?: boolean;
}

/** Section gap: 40px mobile / 64px desktop (DESIGN.md A5). */
export function Section({ children, className, containerClass, bleed = false, ...props }: SectionProps) {
  return (
    <section className={cn("relative w-full py-10 md:py-16", className)} {...props}>
      <div className={cn(!bleed && "relative z-10 mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8", containerClass)}>
        {children}
      </div>
    </section>
  );
}
