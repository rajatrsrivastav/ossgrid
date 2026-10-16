"use client";

import { useState } from "react";
import { ChevronDown, LayoutGrid, List, SlidersHorizontal, RotateCcw } from "lucide-react";
import type { CategoryTab, SortDefinition } from "@/lib/explorer/types";
import { cn } from "@/lib/utils";

export type ViewMode = "grid" | "list";

interface ExplorerToolbarProps {
  tabs: CategoryTab[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortOptions: SortDefinition[];
  sortBy: string;
  onSortChange: (sort: string) => void;
  resultCount?: number;
  searchQuery?: string;
  activeFilterCount?: number;
  onResetFilters?: () => void;
  onOpenMobileFilters?: () => void;
}

export default function ExplorerToolbar({
  tabs,
  selectedCategory,
  onSelectCategory,
  viewMode,
  onViewModeChange,
  sortOptions,
  sortBy,
  onSortChange,
  resultCount,
  searchQuery = "",
  activeFilterCount = 0,
  onResetFilters,
  onOpenMobileFilters,
}: ExplorerToolbarProps) {
  const [sortOpen, setSortOpen] = useState(false);
  const sortLabel = sortOptions.find((o) => o.id === sortBy)?.label ?? sortOptions[0]?.label ?? "Relevance";
  const allTabs: CategoryTab[] = [{ id: "all", label: "All" }, ...tabs];

  return (
    <div className="panel mb-4 flex flex-col gap-3 p-3">
      {/* Row 1: category pills + view toggle */}
      <div className="flex w-full items-center justify-between gap-3">
        <div className="scrollbar-none flex min-w-0 flex-1 items-center gap-1 overflow-x-auto" role="tablist" aria-label="Category">
          {allTabs.map((cat) => {
            const Icon = cat.icon;
            const isActive = cat.id === "all" ? !selectedCategory : selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onSelectCategory(cat.id === "all" ? null : cat.id)}
                className={cn(
                  "flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[var(--radius-control)] border px-3 text-xs font-medium transition-colors",
                  isActive
                    ? "border-[var(--accent-ring)] bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]"
                )}
              >
                {Icon && <Icon size={13} aria-hidden="true" className={isActive ? "" : "text-[var(--text-muted)]"} />}
                {cat.label}
              </button>
            );
          })}
        </div>

        <div
          className="hidden shrink-0 items-center rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--bg-base)] p-0.5 sm:flex"
          role="group"
          aria-label="View"
        >
          {(["grid", "list"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onViewModeChange(mode)}
              className={cn(
                "flex h-7 w-8 items-center justify-center rounded-[6px] transition-colors",
                viewMode === mode
                  ? "bg-[var(--bg-card-hover)] text-[var(--text-primary)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              )}
              title={mode === "grid" ? "Grid view" : "List view"}
              aria-label={mode === "grid" ? "Grid view" : "List view"}
              aria-pressed={viewMode === mode}
            >
              {mode === "grid" ? <LayoutGrid size={14} /> : <List size={14} />}
            </button>
          ))}
        </div>
      </div>

      {/* Row 2: result count + sort + reset */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-3">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[var(--text-secondary)]" aria-live="polite">
          {resultCount !== undefined && (
            <span className="num font-semibold text-[var(--text-primary)]">
              {resultCount} {resultCount === 1 ? "organization" : "organizations"}
            </span>
          )}
          {searchQuery && (
            <span>
              matching <span className="font-medium text-[var(--text-primary)]">&ldquo;{searchQuery}&rdquo;</span>
            </span>
          )}
          {selectedCategory && <span className="chip"><span>{selectedCategory}</span></span>}
        </p>

        <div className="ml-auto flex items-center gap-2">
          {onOpenMobileFilters && (
            <button type="button" onClick={onOpenMobileFilters} className="btn btn-secondary btn-sm lg:hidden">
              <SlidersHorizontal size={13} />
              Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
            </button>
          )}

          <div className="relative">
            <button
              type="button"
              onClick={() => setSortOpen((o) => !o)}
              className="btn btn-secondary btn-sm"
              aria-haspopup="listbox"
              aria-expanded={sortOpen}
            >
              <span className="font-normal text-[var(--text-muted)]">Sort</span>
              {sortLabel}
              <ChevronDown size={12} className="text-[var(--text-muted)]" aria-hidden="true" />
            </button>
            {sortOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setSortOpen(false)} aria-hidden="true" />
                <ul
                  role="listbox"
                  aria-label="Sort by"
                  className="panel absolute right-0 z-40 mt-1.5 w-44 p-1 shadow-[var(--shadow-lg)] animate-scale-in"
                >
                  {sortOptions.map((opt) => (
                    <li key={opt.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={sortBy === opt.id}
                        onClick={() => { onSortChange(opt.id); setSortOpen(false); }}
                        className={cn(
                          "flex w-full items-center rounded-[var(--radius-control)] px-2.5 py-2 text-left text-xs transition-colors hover:bg-[var(--bg-card-hover)]",
                          sortBy === opt.id ? "font-semibold text-[var(--accent)]" : "text-[var(--text-secondary)]"
                        )}
                      >
                        {opt.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {activeFilterCount > 0 && onResetFilters && (
            <button type="button" onClick={onResetFilters} className="btn btn-ghost btn-sm" title="Clear all filters">
              <RotateCcw size={12} />
              Clear ({activeFilterCount})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
