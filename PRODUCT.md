# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Developers and students exploring the LFX Mentorship program ecosystem. Primary job: discover organizations to apply to, evaluate their technology stacks, and find projects that match their skills. Secondary audience: open-source community members tracking program growth over time. Used on desktop primarily; mobile access for quick checks.

## Product Purpose

A fast, no-login-required explorer for LFX Mentorship organizations and projects. Users search, filter, and browse 80+ organizations and 560+ projects across 11 terms (2022–present) sourced from cncf/mentoring on GitHub. Success = a user finds a relevant organization or project to apply to in under 60 seconds.

## Positioning

The only purpose-built visual explorer for the LFX Mentorship ecosystem. Unlike the official LFX portal, it surfaces historical data (all terms, not just the current one), technology-based filtering, and a shareable URL state — all with no login requirement.

## Operating Context

Used at a desk or laptop, often alongside a browser tab to the official LFX portal or a GitHub repository. Users are technically fluent (developers, students in CS/engineering). Search is the primary action; sidebar filters are used for narrowing results; org detail pages are used for final evaluation before applying.

## Capabilities and Constraints

- 100% static: all data is pre-built JSON in /public/data/; no server-side data fetching at runtime.
- Data auto-synced daily from cncf/mentoring via GitHub Actions.
- No authentication, no user accounts, no user-generated content.
- Theme: dark-first with full light-mode support via next-themes.
- Performance budget: search → click → detail under 2 seconds including any new animations.

## Brand Commitments

- Name: "LFX Organizations" (product name), "OSSGrid" (repo name)
- Logo: node-cluster SVG mark (grid/node motif established in v2 design system)
- Data attribution to cncf/mentoring must be preserved in UI
- LFX and Linux Foundation are third-party brands — cannot be modified or claimed

## Evidence on Hand

- /public/data/organizations.json — 80+ organizations with projects, terms, years, technologies
- Live data: org count, project count derivable from organizations.json at runtime
- No photography, illustration assets, or user testimonials on hand

## Product Principles

1. Speed over decoration — the core task (find an org) must never be slowed by visual effects.
2. Real data, not UI chrome — every visual element should represent actual information.
3. One bold moment per surface — memorable in 2-3 places, disciplined everywhere else.
4. Token-first — all visual decisions flow from the token system; no one-off inline values.
5. Accessible by default — WCAG AA minimum; prefers-reduced-motion always honored.

## Accessibility & Inclusion

WCAG 2.2 AA required. prefers-reduced-motion: all animations must have static fallbacks. Target users include developers with motor or visual disabilities using keyboard navigation or screen readers.
