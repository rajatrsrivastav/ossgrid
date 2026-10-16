# Outreachy dashboard: roadmap draft

> Paste this into a "new program" issue (`.github/ISSUE_TEMPLATE/new_program.yml`) when work starts. Registry entry: `outreachy` in `src/data/programs.ts` (status `coming-soon`, preview at `/programs/outreachy`).

## Official site
https://www.outreachy.org

## Data sources (what we know on 2026-10-17)
Outreachy publishes each cohort's projects at outreachy.org/apply/project-selection/ (HTML, per round) and alumni pages; there is no public JSON. Internship rounds: May to August and December to March.

## Proposed format
Scrape the project-selection page per round at a pinned snapshot date; one record per community and project; store round id (e.g. 2026-05) instead of year; confirm scraping is allowed by the site terms before shipping.

Pipeline shape, same as GSoC: `scripts/fetch-outreachy-data.ts` with `--refresh/--check/--source-dir`, a pin file, raw cache in `scripts/.cache/`, output `public/data/outreachy/organizations.json` (light DTO) plus per-cycle project files, an audit in `npm run audit:data`, fixtures and tests, a scheduled workflow that opens a PR.

## UI
A `ProgramConfig` in `src/lib/explorer/outreachy.ts` and a route `/outreachy` on `ExplorerShell`; org pages at `/outreachy/[slug]`; metadata, JSON-LD breadcrumb, noscript list and sitemap entries like `/gsoc`. Then flip the registry entry to `live`.

## Open questions
Is an API or data export available from the organizers? How to merge communities that rename between rounds? Which fields are safe to show (no intern names unless already public on an alumni page)?

## Done when
- Data syncs on schedule with no manual edits and every record carries a source link.
- The dashboard has the same search, filters and URL state as `/lfx` and `/gsoc`.
- Attribution to every source is visible on the page, and `npm run audit:data` passes.
