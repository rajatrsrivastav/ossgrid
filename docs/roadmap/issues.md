# Draft issues for the revamp PR plan

Drafts only; nothing here has been opened on GitHub. Each follows the feature template (problem, tasks, acceptance criteria, out of scope). PRs 1 to 7, 9 and 10 landed on `feat/ui-ux-polish-15` as the commits noted; open the issue, then reference it from the PR with `Closes #N`.

## 1. chore(ci): CodeRabbit config, PR/issue templates, linked-issue check (commit 6c2e2ee)
**Problem.** PRs are reviewed by hand against nothing in particular; issues arrive without acceptance criteria.
**Tasks.** Add `.coderabbit.yaml`, PR template, four issue forms, `pr-linked-issue.yml`, a Reviews section in CONTRIBUTING.
**Acceptance.** A PR without `Closes #N` fails the check; CodeRabbit posts the linked-issue assessment and five custom checks on a test PR (needs the GitHub App installed).
**Out of scope.** Any product code.

## 2. feat(core): program registry + accent tokens + audit-programs (commit 8656146)
**Problem.** Program facts and statuses are typed into JSX; the site reads as LFX-only.
**Tasks.** `src/data/programs.ts` with six programs and sourced facts; tokens for four new programs; `scripts/audit-programs.ts` in `audit:data`.
**Acceptance.** Audit fails on a live program without route or data and on a fact without a source; warns past 180 days.
**Out of scope.** Landing layout.

## 3. refactor(explorer): ExplorerShell + per-program data layout (commit 3462e15)
**Problem.** `/lfx` is a one-off; a second dashboard would duplicate it.
**Tasks.** Extract `ExplorerShell`, `ProgramConfig`, `ExplorerOrg`; config-driven `useFilterState`; Playwright smoke test.
**Acceptance.** `/lfx` is pixel-identical before and after (local screenshot baselines); LFX URLs keep working.
**Out of scope.** Moving LFX files under `public/data/lfx/` (deferred: the loader would need a redirect for existing deep links).

## 4. copy(landing): multi-program landing (commit 6ceebe5)
**Problem.** Hero, programs grid, how-it-works, stats, playbook, FAQ and footer frame OSSGrid as LFX-only; marquee duplicates text for screen readers.
**Tasks.** As in section 4 of the revamp prompt; hero layout locked.
**Acceptance.** Every "LFX" on the landing page sits next to GSoC or inside the LFX card; six program cards render from the registry; marquee copies are `aria-hidden` and `inert`.
**Out of scope.** Hero grid, frame or CTA positions.

## 5. feat(data): CNCF GSoC parser + fixtures (#13, commit 572b848)
## 6. feat(data): global GSoC sync + tag aliases + weekly workflow (#14, commit 572b848)
## 7. feat(gsoc): /gsoc dashboard + org pages + flip GSoC to live (#12, commit 1941a24)
Tracked in the existing epic and sub-issues.

## 8. feat(programs): /programs/[id] preview pages (commit 51c0e40)
**Acceptance.** Statically generated for every registry entry; live programs redirect; coming-soon pages show facts with sources, official and tracking links; sitemap lists them.

## 9. feat(proposals): index pipeline + /proposals + org badges (commit 12fd549)
**Acceptance.** Every record links to an original file in a pinned revision; nothing is downloaded; `/proposals` filters by year, org, status, format and archive; GSoC cards show "N proposals".
**Open.** 34 archive org names are still unmatched (see `public/data/proposals/source-coverage.json`); add aliases in `scripts/gsoc-org-aliases.json`.

## 10. feat(guide): /guide playbook (commit 916448c)
**Acceptance.** Sections for readiness, community, the loop (checklist persists per browser), issues, threads, selection, per-program checklists, resources; author credited and linked.

## 11. docs: DESIGN.md, PRODUCT.md, README, ARCHITECTURE, CONTRIBUTING (this commit)

## Follow-ups not in the plan
- **Cross-program org pages.** "Also in GSoC/LFX" badges and a program switcher on org pages (CNCF and its projects appear in both). Needs an alias map between LFX ids and GSoC slugs.
- **Global command palette.** Search all live programs from ⌘K and group results by program; today the palette is scoped to the current dashboard.
- **Logo mirroring.** GSoC logos are loaded from `summerofcode.withgoogle.com` and `lh3.googleusercontent.com` at runtime; copying them into `public/logos/gsoc/` at sync time would remove the third-party request.
- **LFX tag aliases.** The LFX parser keeps its own skill aliases so `check:data` stays reproducible; switching it to `scripts/gsoc-tag-aliases.json` changes `public/data/organizations.json` on the next sync.
- **LFX toolbar tabs.** "AI and ML", "Security" and "Web and mobile" point at category names that do not exist in the LFX data (pre-existing); fix in `lfxConfig.categoryTabs` and update the screenshot baseline.
- **Accessibility audit.** Run axe on `/`, `/gsoc`, `/proposals` and `/guide`; not run in this pass.
