# MLH Fellowship dashboard: roadmap draft

> Paste this into a "new program" issue (`.github/ISSUE_TEMPLATE/new_program.yml`) when work starts. Registry entry: `mlh-fellowship` in `src/data/programs.ts` (status `coming-soon`, preview at `/programs/mlh-fellowship`).

## Official site
https://fellowship.mlh.com

## Data sources (what we know on 2026-10-17)
Partner projects are listed per batch on fellowship.mlh.com (HTML); no public JSON. Batches run several times a year.

## Proposed format
Index partner projects per batch from the public page at a pinned snapshot; one record per project and batch; link to the project repository.

Pipeline shape, same as GSoC: `scripts/fetch-mlh-fellowship-data.ts` with `--refresh/--check/--source-dir`, a pin file, raw cache in `scripts/.cache/`, output `public/data/mlh-fellowship/organizations.json` (light DTO) plus per-cycle project files, an audit in `npm run audit:data`, fixtures and tests, a scheduled workflow that opens a PR.

## UI
A `ProgramConfig` in `src/lib/explorer/mlh-fellowship.ts` and a route `/mlh-fellowship` on `ExplorerShell`; org pages at `/mlh-fellowship/[slug]`; metadata, JSON-LD breadcrumb, noscript list and sitemap entries like `/gsoc`. Then flip the registry entry to `live`.

## Open questions
Does MLH publish an export or allow indexing? What is the batch naming scheme and how far back do public pages go?

## Done when
- Data syncs on schedule with no manual edits and every record carries a source link.
- The dashboard has the same search, filters and URL state as `/lfx` and `/gsoc`.
- Attribution to every source is visible on the page, and `npm run audit:data` passes.
