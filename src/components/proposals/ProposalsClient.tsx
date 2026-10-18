"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, FileText, SearchX } from "lucide-react";
import Fuse from "fuse.js";
import type { ProposalRecord } from "@/lib/types";
import type { ExplorerFilterState, FacetDefinition } from "@/lib/explorer/types";
import { activeFilterCount, allFacetOptions, filterOrgs } from "@/lib/explorer/filter";
import { useFilterState } from "@/hooks/useFilterState";
import Header from "@/components/Header";
import PageMasthead from "@/components/PageMasthead";
import FacetSidebar from "@/components/explorer/FacetSidebar";
import { cn } from "@/lib/utils";

interface ProposalsClientProps {
  proposals: ProposalRecord[];
  orgNames: Record<string, string>;
}

const FORMAT_LABEL: Record<ProposalRecord["format"], string> = { pdf: "PDF", md: "Markdown", docx: "Word", link: "Link" };

export default function ProposalsClient({ proposals, orgNames }: ProposalsClientProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const config = useMemo(() => {
    const facets: FacetDefinition[] = [
      { id: "years", label: "Year", urlKey: "years", match: "any", sort: "valueDesc", mono: true, initialLimit: 8, expandedLimit: 30 },
      { id: "status", label: "Status", urlKey: "status", match: "any", options: [{ value: "accepted", label: "Accepted" }, { value: "rejected", label: "Rejected" }, { value: "unknown", label: "Not recorded" }] },
      { id: "orgs", label: "Organization", urlKey: "orgs", match: "any", searchable: true, searchPlaceholder: "Search organizations", initialLimit: 10, expandedLimit: 200, listClassName: "max-h-64", formatLabel: (v) => orgNames[v] || v },
      { id: "format", label: "Format", urlKey: "format", match: "any", options: [{ value: "pdf", label: "PDF" }, { value: "md", label: "Markdown" }, { value: "docx", label: "Word" }, { value: "link", label: "External link" }] },
      { id: "repo", label: "Source archive", urlKey: "repo", match: "any", defaultOpen: false, initialLimit: 10, expandedLimit: 20 },
    ];
    return { facets, quickFilters: [] };
  }, [orgNames]);
  const { filters, setFilters, clearFilters, initialized } = useFilterState(config);

  const items = useMemo(() => proposals.map((p) => ({
    ...p,
    id: p.id,
    orgLabel: p.orgId ? orgNames[p.orgId] || p.orgName : p.orgName || "Organization not recorded",
    facets: { years: p.year ? [String(p.year)] : [], status: [p.status], orgs: p.orgId ? [p.orgId] : [], format: [p.format], repo: [p.sourceRepo] },
  })), [proposals, orgNames]);

  const fuse = useMemo(() => new Fuse(items, { keys: [{ name: "title", weight: 3 }, { name: "orgLabel", weight: 2 }, { name: "author", weight: 1 }], threshold: 0.35, ignoreLocation: true, minMatchCharLength: 2 }), [items]);

  const results = useMemo(() => {
    if (!initialized) return items;
    let list = items;
    if (filters.search.trim().length >= 2) list = fuse.search(filters.search.trim()).map((r) => r.item);
    return filterOrgs(list, filters, config);
  }, [items, filters, fuse, config, initialized]);

  const options = useMemo(() => allFacetOptions(config, items, results), [config, items, results]);
  const active = activeFilterCount(filters);
  const years = useMemo(() => items.map((i) => i.year).filter((y): y is number => !!y), [items]);
  const yearMin = years.length ? Math.min(...years) : 0, yearMax = years.length ? Math.max(...years) : 0;
  const repos = useMemo(() => [...new Set(proposals.map((p) => p.sourceRepo))], [proposals]);

  const sidebar = (isMobile: boolean) => (
    <FacetSidebar facets={config.facets} options={options} filters={filters} activeCount={active} onFilterChange={setFilters} onClearAll={clearFilters} isMobile={isMobile} onClose={() => setFiltersOpen(false)} />
  );

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg-base)] text-[var(--text-primary)]">
      <Header
        variant="full"
        searchQuery={filters.search}
        onSearchChange={(q) => setFilters((prev: ExplorerFilterState) => ({ ...prev, search: q }))}
        searchPlaceholder="Search proposals by title, org or author"
        searchAriaLabel="Search proposals by title, organization or author"
      />
      <main id="main" className="flex w-full flex-1 flex-col">
      <PageMasthead
        art="gsoc"
        crumbs={[{ label: "Home", href: "/" }, { label: "Proposals library" }]}
        label="Proposals library"
        title={<>Public GSoC proposals, {yearMin} to {yearMax}</>}
        lede={<p>{proposals.length.toLocaleString("en-US")} proposals that contributors chose to publish, indexed from {repos.length} community archives on GitHub. Every row links to the original file; OSSGrid never stores a copy.</p>}
      >
        <p className="max-w-2xl border-l-2 border-[var(--cine-line-strong)] pl-4 text-sm leading-relaxed text-[var(--cine-fg)]">
          Read these to learn structure: how a problem is framed, how a schedule is laid out, what a mentor could check each week. Do not copy them. Programs screen for it, and your own merged work matters more.
        </p>
      </PageMasthead>
      <div className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-8 sm:px-6 lg:px-8">

        <div className="flex flex-col items-start gap-4 lg:flex-row">
          <aside className="panel sticky top-20 hidden w-[280px] shrink-0 overflow-y-auto p-3 lg:block" style={{ maxHeight: "calc(100vh - 6rem)" }} aria-label="Filters">
            {sidebar(false)}
          </aside>
          <div className="w-full min-w-0 flex-1">
            <div className="panel mb-4 flex flex-wrap items-center justify-between gap-3 p-3">
              <p className="num text-sm font-semibold" aria-live="polite">{results.length} {results.length === 1 ? "proposal" : "proposals"}{filters.search ? <span className="font-normal text-[var(--text-secondary)]"> matching &ldquo;{filters.search}&rdquo;</span> : null}</p>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setFiltersOpen(true)} className="btn btn-secondary btn-sm lg:hidden">Filters{active ? ` (${active})` : ""}</button>
                {active > 0 && <button type="button" onClick={clearFilters} className="btn btn-ghost btn-sm">Clear ({active})</button>}
              </div>
            </div>

            {results.length === 0 ? (
              <div className="card flex flex-col items-center px-6 py-16 text-center">
                <SearchX size={24} className="mb-3 text-[var(--text-muted)]" aria-hidden="true" />
                <p className="text-base font-semibold">No proposal matches these filters.</p>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">Try another year or clear the organization filter.</p>
                <button type="button" onClick={clearFilters} className="btn btn-secondary mt-5">Clear all filters</button>
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {results.map((p) => (
                  <li key={p.id} className="card relative flex items-start gap-3 px-4 py-3 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-[var(--accent)]">
                    <FileText size={16} className="mt-0.5 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <a href={p.url} target="_blank" rel="noopener noreferrer" className="block min-h-6 py-0.5 text-sm font-semibold text-[var(--text-primary)] hover:underline">
                        {p.title} <ExternalLink size={12} className="ml-0.5 inline text-[var(--text-muted)]" aria-hidden="true" />
                      </a>
                      <span className="num mt-0.5 block text-xs text-[var(--text-muted)]">
                        {p.year ?? "Year not recorded"} · {p.orgId ? <Link href={`/gsoc/${p.orgId}`} className="underline underline-offset-4 hover:text-[var(--text-primary)]">{p.orgLabel}</Link> : p.orgLabel}{p.author ? ` · ${p.author}` : ""} · {FORMAT_LABEL[p.format]} · from {p.sourceRepo}{p.license !== "unknown" ? ` (${p.license})` : ""}
                      </span>
                    </span>
                    <span className={cn("pill shrink-0", p.status === "accepted" ? "pill-success" : p.status === "rejected" ? "pill-warning" : "pill-muted")}>
                      {p.status === "accepted" ? "Accepted" : p.status === "rejected" ? "Rejected" : "Not recorded"}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <p className="mt-8 text-center text-xs text-[var(--text-muted)]">
              Indexed from {repos.map((r, i) => (<span key={r}>{i > 0 && ", "}<a href={`https://github.com/${r}`} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-[var(--text-primary)]">{r}</a></span>))}. Each archive keeps its own licence; OSSGrid links out and stores nothing.
            </p>
          </div>
        </div>
      </div>

      </main>

      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="absolute inset-0 bg-black/60 animate-fade-in" onClick={() => setFiltersOpen(false)} aria-hidden="true" />
          <div className="absolute inset-y-0 left-0 w-[min(100%,360px)] overflow-y-auto bg-[var(--bg-raised)] p-4 shadow-[var(--shadow-modal)]">
            {sidebar(true)}
            <button type="button" onClick={() => setFiltersOpen(false)} className="btn btn-primary mt-4 w-full">Show {results.length} {results.length === 1 ? "proposal" : "proposals"}</button>
          </div>
        </div>
      )}
    </div>
  );
}
