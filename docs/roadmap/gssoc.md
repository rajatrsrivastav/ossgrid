# GirlScript Summer of Code dashboard: roadmap draft

> Paste this into a "new program" issue (`.github/ISSUE_TEMPLATE/new_program.yml`) when work starts. Registry entry: `gssoc` in `src/data/programs.ts` (status `coming-soon`, preview at `/programs/gssoc`).

## Official site
https://gssoc.girlscript.org

## Data sources (what we know on 2026-10-17)
Project lists per edition on gssoc.girlscript.org (HTML; a leaderboard and project pages); past editions on GitHub under GirlScript organisation repos.

## Proposed format
Index projects per edition from the public projects page at a pinned snapshot; map project admins to GitHub handles only; treat points and leaderboards as out of scope.

Pipeline shape, same as GSoC: `scripts/fetch-gssoc-data.ts` with `--refresh/--check/--source-dir`, a pin file, raw cache in `scripts/.cache/`, output `public/data/gssoc/organizations.json` (light DTO) plus per-cycle project files, an audit in `npm run audit:data`, fixtures and tests, a scheduled workflow that opens a PR.

## UI
A `ProgramConfig` in `src/lib/explorer/gssoc.ts` and a route `/gssoc` on `ExplorerShell`; org pages at `/gssoc/[slug]`; metadata, JSON-LD breadcrumb, noscript list and sitemap entries like `/gsoc`. Then flip the registry entry to `live`.

## Open questions
Is there a stable per-edition URL or export? How to handle editions with thousands of contributors (card counts and performance)?

## Done when
- Data syncs on schedule with no manual edits and every record carries a source link.
- The dashboard has the same search, filters and URL state as `/lfx` and `/gsoc`.
- Attribution to every source is visible on the page, and `npm run audit:data` passes.
