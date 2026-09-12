"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, X, ArrowRight, Command } from "lucide-react";
import { Organization } from "@/lib/types";
import LogoMark from "./LogoMark";

interface CommandPaletteProps {
  organizations: Organization[];
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

  const filtered = query.trim()
    ? organizations
        .filter((o) =>
          o.name.toLowerCase().includes(query.toLowerCase()) ||
          o.category.toLowerCase().includes(query.toLowerCase()) ||
          o.technologies.some((t) => t.toLowerCase().includes(query.toLowerCase()))
        )
        .slice(0, 8)
    : organizations.slice(0, 8);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Scroll selected item into view
  useEffect(() => {
    const item = listRef.current?.children[selected] as HTMLElement;
    item?.scrollIntoView({ block: "nearest" });
  }, [selected]);

  const navigate = useCallback(
    (org: Organization) => {
      onClose();
      router.push(`/organization/${org.id}`);
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
    <div
      className="cmd-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette — quick navigation"
    >
      <div
        className="cmd-palette mx-4"
        onClick={(e) => e.stopPropagation()}
        role="combobox"
        aria-expanded={true}
        aria-haspopup="listbox"
        aria-controls="cmd-listbox"
      >
        {/* Input row */}
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{ borderBottom: "1px solid var(--border-card)" }}
        >
          <Search size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelected(0); }}
            onKeyDown={handleKey}
            placeholder="Jump to organization…"
            aria-label="Search organizations"
            aria-autocomplete="list"
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "var(--text-primary)" }}
          />
          <kbd
            className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono"
            style={{
              background: "var(--bg-input)",
              color: "var(--text-muted)",
              border: "1px solid var(--border-card)",
            }}
          >
            esc
          </kbd>
          <button
            onClick={onClose}
            className="p-1 rounded-md transition-colors"
            style={{ color: "var(--text-muted)" }}
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>

        {/* Results */}
        <div
          id="cmd-listbox"
          ref={listRef}
          role="listbox"
          aria-label="Organizations"
          className="overflow-y-auto"
          style={{ maxHeight: "min(60vh, 420px)" }}
        >
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <LogoMark size={28} />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                No organizations match &ldquo;{query}&rdquo;
              </p>
            </div>
          ) : (
            filtered.map((org, i) => (
              <button
                key={org.id}
                role="option"
                aria-selected={i === selected}
                onClick={() => navigate(org)}
                onMouseEnter={() => setSelected(i)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                style={{
                  background: i === selected ? "var(--color-accent-dim)" : "transparent",
                  borderBottom: "1px solid var(--border-card)",
                }}
              >
                {/* Logo */}
                <div
                  className="flex-shrink-0 w-8 h-8 rounded-md overflow-hidden flex items-center justify-center"
                  style={{ border: "1px solid var(--border-card)", background: "var(--bg-raised)" }}
                >
                  <Image
                    src={org.logoUrl || "/placeholder.svg"}
                    alt={`${org.name} logo`}
                    width={32}
                    height={32}
                    unoptimized
                    className="w-full h-full object-contain p-0.5"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium truncate"
                    style={{
                      color: i === selected ? "var(--color-accent-raw)" : "var(--text-primary)",
                    }}
                  >
                    {org.name}
                  </p>
                  <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                    {org.category} · {org.projectCount} project{org.projectCount !== 1 ? "s" : ""}
                  </p>
                </div>

                <ArrowRight
                  size={14}
                  style={{
                    color: "var(--text-muted)",
                    opacity: i === selected ? 1 : 0,
                    flexShrink: 0,
                  }}
                />
              </button>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div
          className="flex items-center gap-4 px-4 py-2 text-[11px]"
          style={{
            borderTop: "1px solid var(--border-card)",
            color: "var(--text-muted)",
          }}
        >
          <span className="flex items-center gap-1">
            <kbd className="font-mono px-1 rounded" style={{ background: "var(--bg-input)", border: "1px solid var(--border-card)" }}>↑↓</kbd>
            Navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="font-mono px-1 rounded" style={{ background: "var(--bg-input)", border: "1px solid var(--border-card)" }}>↵</kbd>
            Open
          </span>
          <span className="flex items-center gap-1 ml-auto">
            <Command size={10} />
            <kbd className="font-mono px-1 rounded" style={{ background: "var(--bg-input)", border: "1px solid var(--border-card)" }}>K</kbd>
            Toggle
          </span>
        </div>
      </div>
    </div>
  );
}
