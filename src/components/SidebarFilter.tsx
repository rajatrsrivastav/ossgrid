"use client";

import { useState } from "react";
import {
  X,
  Search,
  ChevronDown,
  ChevronRight,
  SlidersHorizontal,
  Bookmark,
  RotateCcw,
} from "lucide-react";
import { FilterState, FilterOptions } from "@/lib/types";

export type NavItem = "home" | "organizations" | "projects" | "saved" | "about";

interface SidebarFilterProps {
  filters: FilterState;
  options: FilterOptions;
  activeCount: number;
  onFilterChange: (filters: FilterState) => void;
  onClearAll: () => void;
  isMobile?: boolean;
  onClose?: () => void;
  savedCount?: number;
  activeNavItem?: NavItem;
  onSelectNav?: (item: NavItem) => void;
  selectedSizes?: ("large" | "medium" | "small")[];
  onSizeChange?: (sizes: ("large" | "medium" | "small")[]) => void;
  sizeCounts?: { large: number; medium: number; small: number };
}

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-2 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors hover:bg-[var(--bg-input)] cursor-pointer select-none"
        style={{ color: "var(--text-muted)" }}
        aria-expanded={open}
      >
        <span>{title}</span>
        {open ? (
          <ChevronDown size={13} style={{ color: "var(--text-muted)" }} />
        ) : (
          <ChevronRight size={13} style={{ color: "var(--text-muted)" }} />
        )}
      </button>
      {open && <div className="mt-1">{children}</div>}
    </div>
  );
}

export default function SidebarFilter({
  filters,
  options,
  activeCount,
  onFilterChange,
  onClearAll,
  isMobile,
  onClose,
  savedCount = 0,
  activeNavItem = "home",
  onSelectNav,
  selectedSizes = [],
  onSizeChange,
  sizeCounts = { large: 20, medium: 36, small: 28 },
}: SidebarFilterProps) {
  const [termSearch, setTermSearch] = useState("");
  const [techSearch, setTechSearch] = useState("");
  const [showAllTech, setShowAllTech] = useState(false);
  const [showAllTerms, setShowAllTerms] = useState(false);

  const toggleFilter = (
    key: keyof Pick<FilterState, "terms" | "categories" | "technologies">,
    value: string
  ) => {
    const current = filters[key] as string[];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFilterChange({ ...filters, [key]: updated });
  };

  const toggleYear = (year: number) => {
    const updated = filters.years.includes(year)
      ? filters.years.filter((y) => y !== year)
      : [...filters.years, year];
    onFilterChange({ ...filters, years: updated });
  };

  const toggleSize = (size: "large" | "medium" | "small") => {
    if (!onSizeChange) return;
    const updated = selectedSizes.includes(size)
      ? selectedSizes.filter((s) => s !== size)
      : [...selectedSizes, size];
    onSizeChange(updated);
  };

  // Progressive disclosure & search filters
  const matchingTerms = options.terms.filter((t) =>
    t.value.toLowerCase().includes(termSearch.toLowerCase())
  );
  const visibleTerms = termSearch || showAllTerms
    ? matchingTerms
    : matchingTerms.slice(0, 6);

  const matchingTech = options.technologies.filter((t) =>
    t.value.toLowerCase().includes(techSearch.toLowerCase())
  );
  const visibleTech = techSearch || showAllTech
    ? matchingTech.slice(0, 50)
    : matchingTech.slice(0, 10);

  return (
    <div
      className={`flex flex-col h-full ${isMobile ? "p-4" : "p-2"}`}
      style={{ color: "var(--text-primary)" }}
    >
      {/* Mobile-Only Header with Dismiss */}
      {isMobile ? (
        <div className="flex items-center justify-between px-2 py-3 mb-3 border-b border-[var(--border-card)]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-bold tracking-tight text-[var(--text-primary)]">
              Filter Organizations
            </span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg transition-colors hover:bg-[var(--bg-input)] text-[var(--text-muted)] cursor-pointer"
              aria-label="Close filters"
            >
              <X size={18} />
            </button>
          )}
        </div>
      ) : (
        /* Desktop Dedicated Filter Rail Header */
        <div className="flex items-center justify-between px-2 py-2 mb-3 border-b border-[var(--border-card)]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={14} className="text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Filters
            </span>
            {activeCount > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold">
                {activeCount}
              </span>
            )}
          </div>
          {activeCount > 0 && (
            <button
              onClick={onClearAll}
              className="flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:text-blue-600 dark:text-blue-300 transition-colors cursor-pointer"
              title="Reset all active filters"
            >
              <RotateCcw size={11} />
              <span>Reset</span>
            </button>
          )}
        </div>
      )}

      {/* Quick Filter Presets Strip
      <div className="mb-4 px-1 flex flex-col gap-1">
        <button
          onClick={() => {
            if (activeNavItem === "saved") {
              onSelectNav?.("home");
            } else {
              onSelectNav?.("saved");
            }
          }}
          className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            activeNavItem === "saved"
              ? "bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/40"
              : "text-[var(--text-secondary)] hover:bg-[var(--bg-input)] border border-transparent"
          }`}
        >
          <div className="flex items-center gap-2">
            <Bookmark size={13} className={activeNavItem === "saved" ? "fill-blue-600 dark:fill-blue-400 text-blue-600 dark:text-blue-400" : "text-[var(--text-muted)]"} />
            <span>Saved Bookmarks</span>
          </div>
          <span className="text-[11px] font-mono text-[var(--text-muted)]">
            {savedCount}
          </span>
        </button>
      </div>
      */}

      {/* Scrollable Filters Rail */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-1 scrollbar-thin">
        {/* Year Filter */}
        <FilterSection title="Term Year">
          <div className="space-y-0.5">
            {options.years.slice(0, 5).map(({ value, count }) => {
              const checked = filters.years.includes(value);
              return (
                <label
                  key={value}
                  className="flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer transition-colors hover:bg-[var(--bg-input)] text-xs select-none"
                  style={{
                    color: count === 0 && !checked ? "var(--text-muted)" : "var(--text-secondary)",
                    opacity: count === 0 && !checked ? 0.45 : 1,
                  }}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <input
                      type="checkbox"
                      className="filter-checkbox"
                      checked={checked}
                      onChange={() => toggleYear(value)}
                    />
                    <span className="font-mono font-medium">{value}</span>
                  </div>
                  <span className="text-[11px] font-mono text-[var(--text-muted)]" style={{ fontFeatureSettings: '"tnum"' }}>
                    {count}
                  </span>
                </label>
              );
            })}
          </div>
        </FilterSection>

        {/* Organization Scale / Size */}
        <FilterSection title="Organization Size">
          <div className="space-y-0.5">
            {[
              { id: "large" as const, label: "Large (15+ projects)", count: sizeCounts.large },
              { id: "medium" as const, label: "Medium (5–14 projects)", count: sizeCounts.medium },
              { id: "small" as const, label: "Focused (<5 projects)", count: sizeCounts.small },
            ].map((sizeItem) => {
              const checked = selectedSizes.includes(sizeItem.id);
              return (
                <label
                  key={sizeItem.id}
                  className="flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer transition-colors hover:bg-[var(--bg-input)] text-xs text-[var(--text-secondary)] select-none"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <input
                      type="checkbox"
                      className="filter-checkbox"
                      checked={checked}
                      onChange={() => toggleSize(sizeItem.id)}
                    />
                    <span>{sizeItem.label}</span>
                  </div>
                  <span className="text-[11px] font-mono text-[var(--text-muted)]" style={{ fontFeatureSettings: '"tnum"' }}>
                    {sizeItem.count}
                  </span>
                </label>
              );
            })}
          </div>
        </FilterSection>

        {/* Technologies Filter with Search */}
        <FilterSection title="Technologies">
          <div className="mb-2">
            <div
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[var(--border-input)] bg-[var(--bg-input)]"
            >
              <Search size={12} className="text-[var(--text-muted)] flex-shrink-0" />
              <input
                type="text"
                placeholder="Search technologies..."
                value={techSearch}
                onChange={(e) => setTechSearch(e.target.value)}
                className="bg-transparent text-xs flex-1 outline-none text-[var(--text-primary)] placeholder-[var(--text-muted)]"
              />
            </div>
          </div>
          <div className="space-y-0.5 max-h-56 overflow-y-auto pr-1">
            {visibleTech.map(({ value, count }) => {
              const checked = filters.technologies.includes(value);
              return (
                <label
                  key={value}
                  className="flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer transition-colors hover:bg-[var(--bg-input)] text-xs select-none"
                  style={{
                    color: count === 0 && !checked ? "var(--text-muted)" : "var(--text-secondary)",
                    opacity: count === 0 && !checked ? 0.45 : 1,
                  }}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <input
                      type="checkbox"
                      className="filter-checkbox"
                      checked={checked}
                      onChange={() => toggleFilter("technologies", value)}
                    />
                    <span className="truncate">{value}</span>
                  </div>
                  <span className="text-[11px] font-mono text-[var(--text-muted)]" style={{ fontFeatureSettings: '"tnum"' }}>
                    {count}
                  </span>
                </label>
              );
            })}
            {matchingTech.length > 10 && !techSearch && (
              <button
                onClick={() => setShowAllTech(!showAllTech)}
                className="w-full mt-1.5 py-1 text-xs text-left px-2 text-blue-600 dark:text-blue-400 hover:text-blue-600 dark:text-blue-300 font-medium cursor-pointer"
              >
                {showAllTech ? "Show fewer" : `Show all (${matchingTech.length})`}
              </button>
            )}
          </div>
        </FilterSection>

        {/* Specific Terms Filter */}
        <FilterSection title="Historical Terms" defaultOpen={false}>
          <div className="mb-2">
            <div
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[var(--border-input)] bg-[var(--bg-input)]"
            >
              <Search size={12} className="text-[var(--text-muted)] flex-shrink-0" />
              <input
                type="text"
                placeholder="Search terms…"
                value={termSearch}
                onChange={(e) => setTermSearch(e.target.value)}
                className="bg-transparent text-xs flex-1 outline-none text-[var(--text-primary)] placeholder-[var(--text-muted)]"
              />
            </div>
          </div>
          <div className="space-y-0.5 max-h-48 overflow-y-auto pr-1">
            {visibleTerms.map(({ value, count }) => (
              <label
                key={value}
                className="flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer transition-colors hover:bg-[var(--bg-input)] text-xs select-none"
                style={{
                  color: count === 0 && !filters.terms.includes(value) ? "var(--text-muted)" : "var(--text-secondary)",
                  opacity: count === 0 && !filters.terms.includes(value) ? 0.45 : 1,
                }}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <input
                    type="checkbox"
                    className="filter-checkbox"
                    checked={filters.terms.includes(value)}
                    onChange={() => toggleFilter("terms", value)}
                  />
                  <span className="truncate">{value}</span>
                </div>
                <span className="text-[11px] font-mono text-[var(--text-muted)]" style={{ fontFeatureSettings: '"tnum"' }}>
                  {count}
                </span>
              </label>
            ))}
            {matchingTerms.length > 6 && !termSearch && (
              <button
                onClick={() => setShowAllTerms(!showAllTerms)}
                className="w-full mt-1 py-1 text-xs text-left px-2 text-blue-600 dark:text-blue-400 hover:text-blue-600 dark:text-blue-300 font-medium cursor-pointer"
              >
                {showAllTerms ? "Show fewer" : `Show all (${matchingTerms.length})`}
              </button>
            )}
          </div>
        </FilterSection>
      </div>
    </div>
  );
}
