# CNCF project data verification

This change addresses the data-quality findings on PR #5. It retains official source records and makes parser coverage reproducible. An automated integrity check is not a claim that every historical destination remains live or that every upstream statement has been independently fact-checked.

## Source and inclusion policy

- CNCF mentoring revision: `17ef996a1fc7b266dbf2cfa6362752d6bb5c4c3d`.
- All 48 cohort documents are enumerated in `scripts/lfx-source.json`, including 2019, 2020 Q1/Q2/Q3–Q4, and the 2027 placeholder. That lock records each file's SHA-256 and reviewed project-record count.
- Read every cohort README, selected-projects file, project-ideas file and machine-readable export. Fenced templates, sample subtrees, timeline headings, organization headings and subgroup headings are classified separately in `public/data/source-coverage.json`.
- Preserve proposal-only entries and label them **Proposal — acceptance not recorded** in the UI. “Accepted” means listed in the cohort README, selected-projects file, or approved export. It does not imply applications are open.
- The machine-readable export takes precedence, followed by accepted records, then proposal copies. Do not overwrite accepted values with conflicting proposal text. All matching source references are retained in priority order.
- Identity uses cohort and strong project links, with normalized titles as a fallback. Historical CommunityBridge organization-wide links are deliberately not unique project identities. Different non-empty LFX URLs remain separate projects. Repeated titles never justify deleting distinct projects.
- `scripts/source-equivalences.json` documents historical proposal titles consolidated in the 2020 Q1 completed-project table (Fluentd, Kubernetes multi-tenancy, OpenTelemetry and Thanos), plus the shortened CSI-driver title in 2020 Q3–Q4. The table and original proposals are retained as references to the same completed record. Proposal-only details are not used to invent missing fields in the completed table.

## Corrections and provenance

- Handle bold field labels, `*`/`-` bullets, plain-text labels, heading links, inline mentors, `Issue`, `Upstream Issue (URL)`, `Apply` and CommunityBridge labels. Flush final fields at both a heading boundary and EOF.
- Attribute organizations using known source headings, including mixed-depth kube-burner/Kyverno sections and nested Kubernetes subgroups. Unknown organization sections fail import instead of inheriting another organization.
- Restore legitimate GitHub-linked mentors, multiple inline mentors, mailto contacts and source handles. A record with `nameIsHandle: true` uses the explicit source handle as its display label; no personal name was guessed. Source-obfuscated `AT`/`DOT` addresses are normalized. The source annotation “from Grafana also available to help” is removed from Alex Greenbank's name without changing who is listed.
- Preserve all issue URLs and contextual project links instead of concatenating Markdown or mentor text into a URL. Keep actual heading URLs before cleaning titles.
- Preserve exported technologies and recommended skills independently; do not discard long skill phrases. Organization technology/filter values are the union of these source lists.
- Retain each source URL, line, revision and normalized source-block hash. Missing fields are explicitly listed in `missingFields`; the 2019 and 2020 Q1 tables do not provide project descriptions and those remain empty.
- On 2026-09-11, retrieved all 100 individual organization/repository records from GitHub's API. Corrected Drasi to `drasi-project/drasi-core` and kagent to `kagent-dev/kagent`. Followed repository transfers using the API's canonical `html_url` and retained its actual description and absolute website URL. If GitHub provides no description, use only the sourced fact of CNCF mentorship participation. Two joint-project groupings use their CNCF source instead of guessing a single repository.
- The metadata registry retains `metadataSource`, retrieval date and description source. Category labels remain editorial browsing categories, not statements made by the upstream repositories. Official descriptions may be short; a non-empty, sourced short description is valid.
- The UI uses the sourced GitHub/website destinations and exposes per-project source links. Absence of an application URL is labeled “Link unavailable”, not inferred to mean “Closed”.

## Coverage

953 projects across 22 populated cohorts and 102 organizations: 931 accepted records and 22 proposal-only records. The 2027 placeholder contains no projects.

| Cohort | Projects |
|---|---:|
| 2019 Pilot | 4 |
| 2020 Q1 | 12 |
| 2020 Q2 | 32 |
| 2020 Q3–Q4 | 23 |
| 2021 Fall (Sep-Nov) | 34 |
| 2021 Spring (Mar-May) | 41 |
| 2021 Summer (Jun-Aug) | 22 |
| 2022 Spring (Mar-May) | 42 |
| 2022 Summer (Jun-Aug) | 31 |
| 2022 Term 3 (Sep-Nov) | 29 |
| 2023 Term 1 (Mar-May) | 65 |
| 2023 Term 2 (Jun-Aug) | 38 |
| 2023 Term 3 (Sep-Nov) | 43 |
| 2024 Term 1 (Mar-May) | 56 |
| 2024 Term 2 (Jun-Aug) | 48 |
| 2024 Term 3 (Sep-Nov) | 49 |
| 2025 Term 1 (Mar-May) | 66 |
| 2025 Term 2 (Jun-Aug) | 57 |
| 2025 Term 3 (Sep-Nov) | 65 |
| 2026 Term 1 (Mar-May) | 72 |
| 2026 Term 2 (Jun-Aug) | 65 |
| 2026 Term 3 (Sep-Nov) | 59 |

## Validation and maintenance

```sh
npm run test:data
npm run audit:data
npm run check:data
npm run lint
npm run build
```

`check:data` downloads the pinned source and requires byte-for-byte equality with all three public JSON outputs. For an already downloaded official snapshot, append `-- --source-dir /path/to/programs/lfx-mentorship`. Local files are checked against the locked hashes.

The tests use excerpts from the pinned official files and exercise the exact missing-project, wrong-organization, missing-mentor and malformed-link cases. Corruption tests reject empty inputs, missing records, fragmented aliases, empty organization descriptions, bad URLs, missing provenance, mismatched nested data, empty mentor names and incorrect source reconciliation.

Both PR CI and sync CI run data checks. Daily sync resolves one immutable source revision for the entire run. HTTP errors, timeouts, malformed exports, unknown organizations, missing files and changed project counts fail before writing outputs. When CNCF adds/removes project records or source files, manually reconcile every entry and update the source lock's paths/counts/hashes before syncing. Never loosen the counts just to make the audit pass. Review additions and changed fields against the linked sources.

Descriptions and URLs are taken from official sources. Historical upstream inaccuracies and unavailable third-party pages should be recorded and investigated rather than replaced with guesses. This change does not change the site's separate hard-coded program calendar content.
