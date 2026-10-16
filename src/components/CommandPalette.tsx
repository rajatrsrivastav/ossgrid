"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, X, ArrowRight } from "lucide-react";
import type { ExplorerOrg } from "@/lib/explorer/types";
import { cn } from "@/lib/utils";

type CommandPaletteOrg = Pick<ExplorerOrg, "id" | "name" | "href" | "logoUrl" | "category" | "technologies" | "projectCount">;

interface CommandPaletteProps {
  organizations: CommandPaletteOrg[];
  open: boolean;
  onClose: () => void;
}

export default function CommandPalette({ organizations, open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const [prevOpen, setPrevOpen] = useState(open);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setQuery("");
      setSelected(0);
    }
  }

  const q = query.trim().toLowerCase();
  const filtered = q
    ? organizations
        .filter(
          (o) =>
            o.name.toLowerCase().includes(q) ||
            o.category.toLowerCase().includes(q) ||
            o.technologies.some((t) => t.toLowerCase().includes(q))
        )
        .slice(0, 8)
    : organizations.slice(0, 8);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 30);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    const item = listRef.current?.children[selected] as HTMLElement | undefined;
    item?.scrollIntoView({ block: "nearest" });
  }, [selected]);

  const navigate = useCallback(
    (org: CommandPaletteOrg) => {
      onClose();
      router.push(org.href);
    },
    [router, onClose]
  );

  const handleKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelected((s) => Math.min(s + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelected((s) => Math.max(s - 1, 0));
      } else if (e.key === "Enter" && filtered[selected]) {
        navigate(filtered[selected]);
      } else if (e.key === "Escape") {
        onClose();
      }
    },
    [filtered, selected, navigate, onClose]
  );

  if (!open) return null;

  return (
    <div className="cmd-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Quick search">
      <div
        className="cmd-palette mx-4"
        onClick={(e) => e.stopPropagation()}
        role="combobox"
        aria-expanded={true}
        aria-haspopup="listbox"
        aria-controls="cmd-listbox"
      >
        <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3">
          <Search size={16} className="shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelected(0); }}
            onKeyDown={handleKey}
            placeholder="Jump to an organization"
            aria-label="Search organizations"
            aria-autocomplete="list"
            className="flex-1 bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
          />
          <kbd className="key hidden sm:inline-flex">esc</kbd>
          <button type="button" onClick={onClose} className="icon-btn h-8 w-8" aria-label="Close quick search">
            <X size={14} />
          </button>
        </div>

        <div id="cmd-listbox" ref={listRef} role="listbox" aria-label="Organizations" className="max-h-[min(60vh,420px)] overflow-y-auto p-1.5">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-1 py-10 text-center">
              <p className="text-sm text-[var(--text-primary)]">No organization matches &ldquo;{query}&rdquo;.</p>
              <p className="text-xs text-[var(--text-muted)]">Try a technology like Rust, or a category like Security.</p>
            </div>
          ) : (
            filtered.map((org, i) => (
              <button
                key={org.id}
                type="button"
                role="option"
                aria-selected={i === selected}
                onClick={() => navigate(org)}
                onMouseEnter={() => setSelected(i)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-[var(--radius-control)] px-3 py-2.5 text-left transition-colors",
                  i === selected ? "bg-[var(--bg-card-hover)]" : "hover:bg-[var(--bg-card-hover)]"
                )}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-chip)] border border-[var(--border)] bg-white">
                  <Image src={org.logoUrl || "/placeholder.svg"} alt="" width={32} height={32} unoptimized className="h-full w-full object-contain p-1" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-[var(--text-primary)]">{org.name}</span>
                  <span className="num block truncate text-xs text-[var(--text-muted)]">
                    {org.category} · {org.projectCount} {org.projectCount === 1 ? "project" : "projects"}
                  </span>
                </span>
                <ArrowRight size={14} className={cn("shrink-0 text-[var(--text-muted)]", i === selected ? "opacity-100" : "opacity-0")} aria-hidden="true" />
              </button>
            ))
          )}
        </div>

        <div className="flex items-center gap-4 border-t border-[var(--border)] px-4 py-2 text-xs text-[var(--text-muted)]">
          <span className="flex items-center gap-1.5"><kbd className="key">↑↓</kbd> Move</span>
          <span className="flex items-center gap-1.5"><kbd className="key">↵</kbd> Open</span>
          <span className="ml-auto flex items-center gap-1.5"><kbd className="key">⌘K</kbd> Toggle</span>
        </div>
      </div>
    </div>
  );
}
