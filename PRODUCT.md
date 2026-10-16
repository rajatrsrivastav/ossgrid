# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Students and early-career developers preparing for open-source mentorship programs, first LFX Mentorship and next Google Summer of Code. Primary job: find organizations whose stack they already know, read what those orgs have run before, and learn how selection works. Secondary audience: mentors and community members tracking program history. Used mostly on laptops, with phones for quick checks.

## Product Purpose

OSSGrid is a free, no-login, fully static index of mentorship programs. Today it covers every LFX Mentorship organization and project in `cncf/mentoring`, searchable by name, project, technology and mentor, with URL-synced filters and a detail page per organization. Success: a visitor shortlists two or three organizations in under a minute and leaves knowing what to do before applying.

## Positioning

The one place to prepare for GSoC and LFX. Unlike the official portals, OSSGrid shows history across every term, filters by technology, and explains the selection process in plain words. It never takes applications and never claims to be official.

## Operating Context

Used next to the official portal, a project's GitHub repo and its community chat. Visitors are technically fluent but new to the programs. Search is the primary action; sidebar filters narrow; the organization page is where they decide.

## Capabilities and Constraints

- 100% static: all data is pre-built JSON in `public/data/`; no runtime server fetches, no database server, no auth.
- Data is regenerated from pinned upstream commits by GitHub Actions and lands through pull requests, never direct pushes.
- Facts that change (stipends, term dates, eligibility) live in `src/data/program-calendar.json` with a source URL and a last-verified date. Counts are derived from the JSON at build time.
- Dark-first with full light mode via `next-themes`.
- Performance budget: search → click → detail under 2 seconds.

## Brand Commitments

- Name: OSSGrid. Programs are referred to by their owners' names: LFX Mentorship, Google Summer of Code.
- Logo: three grid squares and an outward arrow.
- Attribution to `cncf/mentoring` stays visible on every data surface. Every new source gets the same treatment.
- LFX, Linux Foundation, CNCF, GSoC and Google are third-party brands. OSSGrid is not affiliated with them.
- Mentor emails may exist in the pipeline but are never rendered.

## Evidence on Hand

- `public/data/organizations.json`, `public/data/projects.json`, `public/data/source-coverage.json` with line-level provenance.
- Logos in `public/logos/`.
- No photography beyond the four stock flower images used as a soft backdrop; no testimonials.

## Product Principles

1. Speed over decoration.
2. Real data, not UI chrome.
3. One bold moment per surface.
4. Token-first; see `DESIGN.md`.
5. Accessible by default: WCAG 2.2 AA, `prefers-reduced-motion` always honoured.

## Roadmap (tracked in GitHub issues)

- `/gsoc`: organizations 2016 to present from `gsocorganizations.dev` and `cncf/mentoring`, same explorer shell as `/lfx` (epic #12, sub-issues #13 and #14).
- `/proposals`: an index of publicly shared GSoC proposals, linked to the original files.
- `/guide`: the contributor playbook as a full page with program checklists.
