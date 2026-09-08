"use client";

import { useState } from "react";
import { X, Search, ChevronDown, ChevronRight, Sparkles, Zap, BookOpen } from "lucide-react";
import { FilterState, FilterOptions } from "@/lib/types";

interface SidebarFilterProps {
  filters: FilterState;
  options: FilterOptions;
  activeCount: number;
  onFilterChange: (filters: FilterState) => void;
  onClearAll: () => void;
  isMobile?: boolean;
  onClose?: () => void;
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
        className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
        style={{ color: "var(--text-primary)" }}
      >
        {title}
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
      {open && <div className="mt-1 px-1">{children}</div>}
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
}: SidebarFilterProps) {
  const [termSearch, setTermSearch] = useState("");
  const [techSearch, setTechSearch] = useState("");

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

  const filteredTerms = options.terms.filter((t) =>
    t.value.toLowerCase().includes(termSearch.toLowerCase())
  );

  const filteredTech = options.technologies
    .filter((t) => t.value.toLowerCase().includes(techSearch.toLowerCase()))
    .slice(0, 30);

  return (
    <div
      className={`flex flex-col h-full ${isMobile ? "p-4" : ""}`}
      style={{ color: "var(--text-primary)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--border-card)" }}>
        <span className="text-sm font-bold tracking-tight">Filters</span>
        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <button
              onClick={onClearAll}
              className="text-xs font-medium px-2.5 py-1 rounded-lg transition-colors"
              style={{
                color: "var(--accent-start)",
                background: "rgba(59, 130, 246, 0.1)",
              }}
            >
              Clear all ({activeCount})
            </button>
          )}
          {isMobile && onClose && (
            <button onClick={onClose} style={{ color: "var(--text-muted)" }}>
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {/* Quick Shortcuts */}
        <div className="mb-4">
          <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Quick Filters
          </p>
          <div className="flex flex-wrap gap-1.5 px-2 mt-1">
            {[
              { label: "Beginner Friendly", icon: <Sparkles size={12} />, value: "beginner" },
              { label: "First-Time Orgs", icon: <BookOpen size={12} />, value: "first-time" },
            ].map(({ label, icon, value }) => {
              const isActive = filters.quickFilters.includes(value);
              return (
                <button
                  key={value}
                  onClick={() => {
                    const updated = isActive
                      ? filters.quickFilters.filter((v) => v !== value)
                      : [...filters.quickFilters, value];
                    onFilterChange({ ...filters, quickFilters: updated });
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: isActive
                      ? "linear-gradient(135deg, var(--accent-start), var(--accent-end))"
                      : "var(--bg-input)",
                    color: isActive ? "white" : "var(--text-secondary)",
                    border: `1px solid ${isActive ? "transparent" : "var(--border-card)"}`,
                  }}
                >
                  {icon} {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Years */}
        <FilterSection title="Years">
          <div className="flex flex-wrap gap-1.5 px-2">
            {options.years.map(({ value, count }) => {
              const isActive = filters.years.includes(value);
              return (
                <button
                  key={value}
                  onClick={() => toggleYear(value)}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all"
                  style={{
                    background: isActive
                      ? "linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.3))"
                      : "var(--bg-input)",
                    color: isActive ? "var(--accent-purple)" : "var(--text-secondary)",
                    border: `1px solid ${isActive ? "rgba(139, 92, 246, 0.3)" : "var(--border-card)"}`,
                  }}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </FilterSection>

        {/* Terms */}
        <FilterSection title="Terms">
          <div className="px-2 mb-2">
            <div
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
              style={{
                background: "var(--bg-input)",
                border: "1px solid var(--border-card)",
              }}
            >
              <Search size={13} style={{ color: "var(--text-muted)" }} />
              <input
                type="text"
                placeholder="Search terms..."
                value={termSearch}
                onChange={(e) => setTermSearch(e.target.value)}
                className="bg-transparent text-xs flex-1 outline-none"
                style={{ color: "var(--text-primary)" }}
              />
            </div>
          </div>
          <div className="space-y-0.5 max-h-48 overflow-y-auto px-2">
            {filteredTerms.map(({ value, count }) => (
              <label
                key={value}
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer transition-colors text-xs"
                style={{ color: "var(--text-secondary)" }}
              >
                <input
                  type="checkbox"
                  className="filter-checkbox"
                  checked={filters.terms.includes(value)}
                  onChange={() => toggleFilter("terms", value)}
                />
                <span className="flex-1 truncate">{value}</span>
                <span style={{ color: "var(--text-muted)" }}>{count}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Categories */}
        <FilterSection title="Categories">
          <div className="space-y-0.5 px-2">
            {options.categories.map(({ value, count }) => (
              <label
                key={value}
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer transition-colors text-xs"
                style={{ color: "var(--text-secondary)" }}
              >
                <input
                  type="checkbox"
                  className="filter-checkbox"
                  checked={filters.categories.includes(value)}
                  onChange={() => toggleFilter("categories", value)}
                />
                <span className="flex-1 truncate">{value}</span>
                <span style={{ color: "var(--text-muted)" }}>{count}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Technologies */}
        <FilterSection title="Technologies">
          <div className="px-2 mb-2">
            <div
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
              style={{
                background: "var(--bg-input)",
                border: "1px solid var(--border-card)",
              }}
            >
              <Search size={13} style={{ color: "var(--text-muted)" }} />
              <input
                type="text"
                placeholder="Search technologies..."
                value={techSearch}
                onChange={(e) => setTechSearch(e.target.value)}
                className="bg-transparent text-xs flex-1 outline-none"
                style={{ color: "var(--text-primary)" }}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 px-2 max-h-64 overflow-y-auto">
            {filteredTech.map(({ value, count }) => {
              const isActive = filters.technologies.includes(value);
              return (
                <button
                  key={value}
                  onClick={() => toggleFilter("technologies", value)}
                  className="badge badge-tech transition-all"
                  style={{
                    background: isActive
                      ? "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(6, 182, 212, 0.2))"
                      : "var(--bg-badge)",
                    color: isActive ? "var(--accent-start)" : "var(--text-badge)",
                    borderColor: isActive ? "rgba(59, 130, 246, 0.3)" : "var(--border-card)",
                  }}
                >
                  {value.toLowerCase()}
                  <span className="ml-1 opacity-50">{count}</span>
                </button>
              );
            })}
          </div>
        </FilterSection>
      </div>
    </div>
  );
}
