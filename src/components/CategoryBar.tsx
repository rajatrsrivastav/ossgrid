"use client";

import { useState } from "react";
import {
  Cloud,
  Wrench,
  Sparkles,
  Shield,
  Globe,
  ChevronDown,
  LayoutGrid,
  List,
  SlidersHorizontal,
  Bookmark,
  RotateCcw,
} from "lucide-react";

export type ViewMode = "grid" | "list";
export type SortOption = "relevance" | "projects" | "name";

interface CategoryBarProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  allCategories?: { value: string; count: number }[];
  resultCount?: number;
  searchQuery?: string;
  isSavedActive?: boolean;
  activeFilterCount?: number;
  onResetFilters?: () => void;
  onOpenMobileFilters?: () => void;
}

const PRIMARY_CATEGORIES = [
  { id: "all", label: "All Tracks", icon: null },
  { id: "Infrastructure & Cloud", label: "Cloud & Infra", icon: Cloud },
  { id: "Development Tools", label: "Dev Tools", icon: Wrench },
  { id: "Machine Learning & AI", label: "AI & ML", icon: Sparkles },
  { id: "Security & Privacy", label: "Security", icon: Shield },
  { id: "Web & Mobile", label: "Web & Mobile", icon: Globe },
];

export default function CategoryBar({
  selectedCategory,
  onSelectCategory,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
  allCategories = [],
  resultCount,
  searchQuery = "",
  isSavedActive = false,
  activeFilterCount = 0,
  onResetFilters,
  onOpenMobileFilters,
}: CategoryBarProps) {
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  return (
    <div className="flex flex-col gap-3 mb-6 p-3 sm:p-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-card)] shadow-sm">
      {/* Top Row: Category Pills and More Dropdown */}
      <div className="flex items-center justify-between gap-3 w-full">
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none flex-1 min-w-0">
          {PRIMARY_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive =
              cat.id === "all"
                ? !selectedCategory || selectedCategory === "all"
                : selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id === "all" ? null : cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 font-semibold shadow-xs"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-input)] border border-transparent"
                }`}
                aria-pressed={isActive}
              >
                {Icon && <Icon size={13} className={isActive ? "text-blue-600 dark:text-blue-400" : "text-[var(--text-muted)]"} />}
                <span>{cat.label}</span>
              </button>
            );
          })}

        </div>

        {/* View Mode Switcher on Top Row (Desktop) */}
        <div
          className="hidden sm:flex items-center p-0.5 rounded-xl border border-[var(--border-card)] bg-[var(--bg-raised)] flex-shrink-0"
          role="group"
          aria-label="View mode switcher"
        >
          <button
            onClick={() => onViewModeChange("grid")}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === "grid"
                ? "bg-[var(--bg-input)] text-[var(--text-primary)] shadow-xs"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
            title="Grid view"
            aria-pressed={viewMode === "grid"}
          >
            <LayoutGrid size={14} />
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === "list"
                ? "bg-[var(--bg-input)] text-[var(--text-primary)] shadow-xs"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
            title="List view"
            aria-pressed={viewMode === "list"}
          >
            <List size={14} />
          </button>
        </div>
      </div>

      {/* Bottom Sub-Row: Results Summary & Sort Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-[var(--border-card)]">
        {/* Left: Results Count & Active Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {resultCount !== undefined && (
            <span className="text-xs font-bold font-mono tracking-tight text-[var(--text-primary)]" style={{ fontFeatureSettings: '"tnum"' }}>
              {resultCount} {resultCount === 1 ? "Organization" : "Organizations"}
            </span>
          )}

          {/* 
          {isSavedActive && (
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1 border border-blue-500/30">
              <Bookmark size={11} className="fill-blue-600 dark:fill-blue-400" />
              Saved Bookmarks
            </span>
          )}
          */}

          {searchQuery && (
            <span className="text-xs text-[var(--text-secondary)]">
              matching &ldquo;<span className="text-[var(--text-primary)] font-medium">{searchQuery}</span>&rdquo;
            </span>
          )}

          {selectedCategory && selectedCategory !== "all" && (
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-[var(--bg-input)] text-[var(--text-secondary)] border border-[var(--border-card)]">
              {selectedCategory}
            </span>
          )}
        </div>

        {/* Right: Mobile Filter Button, Sort Selector, and Reset */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Mobile Filter Button */}
          {onOpenMobileFilters && (
            <button
              onClick={onOpenMobileFilters}
              className="sm:hidden inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-card)] cursor-pointer"
            >
              <SlidersHorizontal size={13} />
              <span>Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ""}</span>
            </button>
          )}

          {/* Sort Selector */}
          <div className="relative">
            <button
              onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
              className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-2.5 py-1.5 rounded-lg bg-[var(--bg-raised)] border border-[var(--border-card)] cursor-pointer"
              aria-expanded={sortDropdownOpen}
            >
              <span className="text-[var(--text-muted)] font-normal">Sort:</span>
              <span className="font-semibold text-[var(--text-primary)] capitalize">
                {sortBy === "projects" ? "Most Projects" : sortBy === "name" ? "Name (A-Z)" : "Relevance"}
              </span>
              <ChevronDown size={12} className="text-[var(--text-muted)] ml-0.5" />
            </button>

            {sortDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setSortDropdownOpen(false)}
                />
                <div
                  className="absolute right-0 mt-1.5 w-40 rounded-xl p-1 shadow-2xl z-40 animate-scale-in"
                  style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-card)",
                  }}
                >
                  {[
                    { id: "relevance", label: "Relevance" },
                    { id: "projects", label: "Most Projects" },
                    { id: "name", label: "Name (A-Z)" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        onSortChange(opt.id as SortOption);
                        setSortDropdownOpen(false);
                      }}
                      className="flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-xs transition-colors hover:bg-[var(--bg-input)] text-left cursor-pointer"
                      style={{
                        color: sortBy === opt.id ? "var(--color-accent-raw)" : "var(--text-secondary)",
                        fontWeight: sortBy === opt.id ? 600 : 400,
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Reset Filters CTA */}
          {activeFilterCount > 0 && onResetFilters && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-600 dark:text-blue-300 font-semibold cursor-pointer transition-colors"
              title="Clear all filters"
            >
              <RotateCcw size={11} />
              <span>Reset ({activeFilterCount})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
