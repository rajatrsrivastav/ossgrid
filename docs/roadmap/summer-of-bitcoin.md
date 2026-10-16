# Summer of Bitcoin dashboard: roadmap draft

> Paste this into a "new program" issue (`.github/ISSUE_TEMPLATE/new_program.yml`) when work starts. Registry entry: `summer-of-bitcoin` in `src/data/programs.ts` (status `coming-soon`, preview at `/programs/summer-of-bitcoin`).

## Official site
https://www.summerofbitcoin.org

## Data sources (what we know on 2026-10-17)
Organizations and projects are listed on summerofbitcoin.org and guide.summerofbitcoin.org (HTML); past cohorts on the site's archive pages.

## Proposed format
Index organizations per year from the public pages at a pinned snapshot; link to each organization's project list and student guide section.

Pipeline shape, same as GSoC: `scripts/fetch-summer-of-bitcoin-data.ts` with `--refresh/--check/--source-dir`, a pin file, raw cache in `scripts/.cache/`, output `public/data/summer-of-bitcoin/organizations.json` (light DTO) plus per-cycle project files, an audit in `npm run audit:data`, fixtures and tests, a scheduled workflow that opens a PR.

## UI
A `ProgramConfig` in `src/lib/explorer/summer-of-bitcoin.ts` and a route `/summer-of-bitcoin` on `ExplorerShell`; org pages at `/summer-of-bitcoin/[slug]`; metadata, JSON-LD breadcrumb, noscript list and sitemap entries like `/gsoc`. Then flip the registry entry to `live`.

## Open questions
Is there a machine-readable list? Are stipend and eligibility facts published on a stable page we can cite?

## Done when
- Data syncs on schedule with no manual edits and every record carries a source link.
- The dashboard has the same search, filters and URL state as `/lfx` and `/gsoc`.
- Attribution to every source is visible on the page, and `npm run audit:data` passes.
