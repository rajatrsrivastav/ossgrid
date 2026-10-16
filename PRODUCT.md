# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Students and early-career developers preparing for open-source mentorship programs: Google Summer of Code, LFX Mentorship, and next Outreachy, GirlScript Summer of Code, MLH Fellowship and Summer of Bitcoin. Primary job: find organizations whose stack they already know, read what those orgs have run before, and learn how selection works. Secondary audience: mentors and community members tracking program history. Used mostly on laptops, with phones for quick checks.

## Product Purpose

OSSGrid is a free, no-login, fully static index of every major open-source mentorship program. Today it covers every Google Summer of Code organization since 2016 and every LFX Mentorship organization since 2019, with projects by year, technologies, mentors' GitHub handles, ideas lists and a library of public proposals, all searchable with URL-synced filters and a detail page per organization. Four more programs have registry entries and preview pages until their dashboards ship. Success: a visitor shortlists two or three organizations in under a minute and leaves knowing what to do before applying.

## Positioning

The one place to prepare for any open-source mentorship. No program is shown as the main one. Unlike the official portals, OSSGrid shows history across every year and term, filters by technology, compares programs side by side with sourced facts, and explains the selection process in plain words. It never takes applications and never claims to be official.

## Operating Context

Used next to the official portal, a project's GitHub repo and its community chat. Visitors are technically fluent but new to the programs. Search is the primary action; sidebar filters narrow; the organization page is where they decide.

## Capabilities and Constraints

- 100% static: all data is pre-built JSON in `public/data/`; no runtime server fetches, no database server, no auth.
- Data is regenerated from pinned upstream commits by GitHub Actions and lands through pull requests, never direct pushes.
- Program facts (stipend, length, eligibility, cadence) live in the registry `src/data/programs.ts`, each with a source URL and a last-verified date; dates and cycles live in `src/data/program-calendar.json`. `npm run audit:data` fails on a missing source and warns after 180 days. Counts are derived from the JSON at build time.
- A program goes live by flipping one registry field once its route and data file exist; header, landing, footer, sitemap and search read from the registry.
- Dark-first with full light mode via `next-themes`.
- Performance budget: search → click → detail under 2 seconds.

## Brand Commitments

- Name: OSSGrid. Programs are referred to by their owners' names: Google Summer of Code, LFX Mentorship, Outreachy, GirlScript Summer of Code, MLH Fellowship, Summer of Bitcoin.
- Logo: three grid squares and an outward arrow.
- Attribution to every data source (`cncf/mentoring`, gsocorganizations.dev, the GSoC archive, each proposals archive) stays visible on the surface that uses it; the footer generates it from the registry.
- Every program name and sponsor is a third-party brand. OSSGrid is not affiliated with any of them.
- Mentor emails may exist in the pipeline but are never rendered.

## Evidence on Hand

- `public/data/organizations.json`, `public/data/projects.json`, `public/data/source-coverage.json` (LFX) with line-level provenance.
- `public/data/gsoc/` (organizations, projects per year, search index, source coverage) and `public/data/proposals/`.
- Logos in `public/logos/`.
- No photography beyond the four stock flower images used as a soft backdrop; no testimonials.

## Product Principles

1. Speed over decoration.
2. Real data, not UI chrome.
3. One bold moment per surface.
4. Token-first; see `DESIGN.md`.
5. Accessible by default: WCAG 2.2 AA, `prefers-reduced-motion` always honoured.

## Roadmap (tracked in GitHub issues)

- Dashboards for Outreachy, GirlScript Summer of Code, MLH Fellowship and Summer of Bitcoin; drafts in `docs/roadmap/`.
- Cross-program organization pages ("also in LFX") once a second program shares enough organizations.
- Proposals: more archives, and status for records that only say "unknown" today.
