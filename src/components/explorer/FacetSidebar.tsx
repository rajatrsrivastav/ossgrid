"use client";

import { useState } from "react";
import { X, Search, ChevronDown, ChevronRight, RotateCcw } from "lucide-react";
import type { ExplorerFilterState, FacetDefinition, FacetOption, QuickFilterDefinition } from "@/lib/explorer/types";

interface FacetSidebarProps {
  facets: FacetDefinition[];
  quickFilters?: QuickFilterDefinition[];
  quickFilterCounts?: Record<string, number>;
  options: Record<string, FacetOption[]>;
  filters: ExplorerFilterState;
  activeCount: number;
  onFilterChange: (filters: ExplorerFilterState) => void;
  onClearAll: () => void;
  isMobile?: boolean;
  onClose?: () => void;
}

function FilterSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="mb-2">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-[var(--radius-control)] px-2 py-2 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-card-hover)]"
        aria-expanded={open}
      >
        <span>{title}</span>
        {open ? <ChevronDown size={14} className="text-[var(--text-muted)]" /> : <ChevronRight size={14} className="text-[var(--text-muted)]" />}
      </button>
      {open && <div className="mt-1">{children}</div>}
    </section>
  );
}

function FacetRow({ label, count, checked, onChange, mono = false }: { label: string; count: number; checked: boolean; onChange: () => void; mono?: boolean }) {
  return (
    <label className="facet-row" data-empty={count === 0 && !checked}>
      <span className="flex min-w-0 items-center gap-2.5">
        <input type="checkbox" className="filter-checkbox" checked={checked} onChange={onChange} />
        <span className={mono ? "num truncate" : "truncate"}>{label}</span>
      </span>
      <span className="facet-count">{count}</span>
    </label>
  );
}

function FacetSearch({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="field field-sm mx-2 mb-2">
      <Search size={12} className="shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
      <input type="search" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} aria-label={placeholder} />
    </div>
  );
}

function FacetSection({ def, options, selected, onToggle }: { def: FacetDefinition; options: FacetOption[]; selected: string[]; onToggle: (value: string) => void }) {
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const initial = def.initialLimit ?? Infinity;
  const expanded = def.expandedLimit ?? Infinity;

  const matching = query ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase())) : options;
  const visible = query || showAll ? matching.slice(0, expanded) : matching.slice(0, initial);
  const canExpand = !query && matching.length > initial && expanded > initial;

  const list = (
    <>
      {visible.map((o) => (
        <FacetRow key={o.value} label={o.label} count={o.count} checked={selected.includes(o.value)} onChange={() => onToggle(o.value)} mono={def.mono} />
      ))}
      {def.searchable && visible.length === 0 && (
        <p className="px-2 py-2 text-xs text-[var(--text-muted)]">No {def.label.toLowerCase()} matches &ldquo;{query}&rdquo;.</p>
      )}
      {canExpand && (
        <button type="button" onClick={() => setShowAll(!showAll)} className="mt-1 w-full px-2 py-1.5 text-left text-xs font-medium text-[var(--accent)] hover:underline">
          {showAll ? "Show fewer" : `Show ${matching.length - initial} more`}
        </button>
      )}
    </>
  );

  return (
    <FilterSection title={def.label} defaultOpen={def.defaultOpen ?? true}>
      {def.searchable && <FacetSearch value={query} onChange={setQuery} placeholder={def.searchPlaceholder || `Search ${def.label.toLowerCase()}`} />}
      {def.listClassName ? <div className={`${def.listClassName} overflow-y-auto pr-1`}>{list}</div> : list}
    </FilterSection>
  );
}

export default function FacetSidebar({ facets, quickFilters = [], quickFilterCounts = {}, options, filters, activeCount, onFilterChange, onClearAll, isMobile, onClose }: FacetSidebarProps) {
  const toggle = (facetId: string, value: string) => {
    const current = filters.facets[facetId] || [];
    const updated = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    onFilterChange({ ...filters, facets: { ...filters.facets, [facetId]: updated } });
  };
  const toggleQuick = (id: string) => {
    const updated = filters.quickFilters.includes(id) ? filters.quickFilters.filter((q) => q !== id) : [...filters.quickFilters, id];
    onFilterChange({ ...filters, quickFilters: updated });
  };

  return (
    <div className="flex h-full flex-col text-[var(--text-primary)]">
      <div className="mb-2 flex items-center justify-between border-b border-[var(--border)] px-2 pb-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          Filters
          {activeCount > 0 && <span className="chip chip-active chip-mono h-5 px-1.5"><span>{activeCount}</span></span>}
        </h2>
        <div className="flex items-center gap-1">
          {activeCount > 0 && (
            <button type="button" onClick={onClearAll} className="btn btn-ghost btn-sm h-7 px-2" title="Clear all filters">
              <RotateCcw size={12} /> Clear
            </button>
          )}
          {isMobile && onClose && (
            <button type="button" onClick={onClose} className="icon-btn h-8 w-8" aria-label="Close filters">
              <X size={17} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        {quickFilters.length > 0 && (
          <FilterSection title="Quick filters">
            {quickFilters.map((q) => (
              <FacetRow key={q.id} label={q.label} count={quickFilterCounts[q.id] ?? 0} checked={filters.quickFilters.includes(q.id)} onChange={() => toggleQuick(q.id)} />
            ))}
          </FilterSection>
        )}
        {facets.filter((f) => !f.hidden).map((def) => (
          <FacetSection key={def.id} def={def} options={options[def.id] || []} selected={filters.facets[def.id] || []} onToggle={(v) => toggle(def.id, v)} />
        ))}
      </div>
    </div>
  );
}
