"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FaqItem } from "@/lib/community-types";

interface DiscloseFaqProps {
  items: FaqItem[];
  idPrefix?: string;
  /** Use cinematic tokens (home FAQ style) vs page tokens. */
  variant?: "page" | "cine";
}

/** FAQ list using the same `.disclose` pattern as the home FAQ. */
export default function DiscloseFaq({ items, idPrefix = "faq", variant = "page" }: DiscloseFaqProps) {
  const [open, setOpen] = useState<number | null>(0);
  const cine = variant === "cine";

  return (
    <ul className="panel divide-y divide-[var(--border)] overflow-hidden">
      {items.map((item, idx) => {
        const isOpen = open === idx;
        const buttonId = `${idPrefix}-button-${idx}`;
        const panelId = `${idPrefix}-panel-${idx}`;
        return (
          <li key={item.question}>
            <button
              type="button"
              id={buttonId}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpen(isOpen ? null : idx)}
              className={cn(
                "flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition-colors duration-200",
                "hover:bg-[var(--bg-card-hover)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--accent)]",
              )}
            >
              <span className={cn("text-base font-semibold", cine ? "text-[var(--cine-fg)]" : "text-[var(--text-primary)]")}>
                {item.question}
              </span>
              <Plus
                aria-hidden
                className={cn(
                  "mt-0.5 h-5 w-5 shrink-0 text-[var(--text-muted)] transition-transform duration-300",
                  isOpen && "rotate-45",
                )}
              />
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className="disclose"
              data-open={isOpen}
              inert={!isOpen}
            >
              <div>
                <p
                  className={cn(
                    "faq-answer max-w-[44rem] px-5 pb-5 text-sm leading-relaxed md:text-base",
                    cine ? "text-[var(--cine-fg-2)]" : "text-[var(--text-secondary)]",
                  )}
                >
                  {item.answer}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
