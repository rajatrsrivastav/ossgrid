import React from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  /** Heading level. One H1 per page, so sections default to H2. */
  as?: "h1" | "h2" | "h3";
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  as: Tag = "h2",
  className,
  children,
  ...props
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-8 flex flex-col gap-3 md:mb-12",
        align === "center" ? "mx-auto items-center text-center" : "items-start text-left",
        className
      )}
      {...props}
    >
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <Tag className="display text-3xl font-semibold text-[var(--text-primary)] md:text-4xl">{title}</Tag>
      {description && (
        <p className="prose-measure text-base leading-relaxed text-[var(--text-secondary)] md:text-lg">{description}</p>
      )}
      {children}
    </div>
  );
}
