"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onCommandPaletteOpen?: () => void;
  compact?: boolean;
  placeholder?: string;
  ariaLabel?: string;
}

export default function SearchBar({
  value,
  onChange,
  onCommandPaletteOpen,
  compact = false,
  placeholder = "Search orgs, projects, technologies, mentors",
  ariaLabel = "Search organizations, projects, technologies and mentors",
}: SearchBarProps) {
  return (
    <div className={cn("field w-full", compact && "field-sm")} role="search">
      <Search size={15} className="shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
      <input
        type="search"
        inputMode="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
        autoComplete="off"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="rounded-[var(--radius-chip)] p-0.5 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        >
          <X size={14} />
        </button>
      ) : onCommandPaletteOpen ? (
        <button
          type="button"
          onClick={onCommandPaletteOpen}
          className="key hidden hover:text-[var(--text-primary)] md:inline-flex"
          aria-label="Open quick search"
          title="Quick search (⌘K)"
        >
          ⌘K
        </button>
      ) : null}
    </div>
  );
}
