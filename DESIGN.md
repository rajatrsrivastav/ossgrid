# DESIGN.md — OSSGrid design system v4

Single source of truth for how OSSGrid looks and reads. Tokens live in `src/app/globals.css`. If a component needs a value that is not a token, add the token first.

**v4 (October 2026)** applies the cinematic direction in `CRED_INSPIRED_DESIGN.md`: an art-led home story, a display serif, ink primary buttons, tighter radii, and a masthead on every internal page. **v4.1** makes every cinematic surface follow the theme (graphite and off-white in dark, warm paper and near-black in light), adds scroll-scrubbed program chapters and an interactive ecosystem network, and settles one type system. The review evidence is in `design/visual-review.md`.

## 1. Principles

1. Speed over decoration. Finding an org is never slowed by effects.
2. Every visual element shows real data. No decorative stats, no placeholder cards.
3. One bold moment per surface. On the landing page that is the headline. Everything else is quiet.
4. Tokens only. No one-off hex, radius or shadow values in components.
5. Accessible by default: WCAG 2.2 AA, visible focus, `prefers-reduced-motion` honoured.

## 2. Colour (role-named)

| Token | Dark | Light | Use |
|---|---|---|---|
| `--bg-base` | `#0b0c10` | `#f7f6f3` | Page |
| `--bg-raised` | `#111318` | `#ffffff` | Sections, sidebar, panels |
| `--bg-card` | `#15181f` | `#ffffff` | Cards |
| `--bg-card-hover` | `#1a1e27` | `#f3f1ec` | Card and row hover |
| `--bg-input` | `#191d26` | `#ffffff` | Inputs, chips |
| `--border` | `rgba(255,255,255,.08)` | `rgba(28,25,23,.10)` | All 1 px borders |
| `--border-strong` | `rgba(255,255,255,.14)` | `rgba(28,25,23,.18)` | Inputs, hover borders |
| `--highlight-inset` | `inset 0 1px 0 rgba(255,255,255,.05)` | none | Card top edge, dark only |
| `--text-primary` / `--text-secondary` / `--text-muted` | `#f2f3f5` / `#a3a7b0` / `#80858f` | `#1a1917` / `#55524d` / `#6b675f` | Contrast ≥ 7:1 / 4.5:1 / 4.5:1 |
| `--accent` | `#22c55e` | `#166534` | Primary action, focus ring, active facet |
| `--accent-fg` | `#052e16` | `#ffffff` | Text on the primary button |
| `--accent-soft` / `--accent-ring` | 12% / 35% accent | 8% / 30% accent | Active chip fill and border |
| `--program-lfx` | `#22c55e` | `#166534` | LFX identity |
| `--program-gsoc` | `#f59e0b` | `#b45309` | GSoC identity |
| `--program-outreachy` | `#f472b6` | `#be185d` | Outreachy identity |
| `--program-gssoc` | `#2dd4bf` | `#0f766e` | GirlScript Summer of Code identity |
| `--program-mlh` | `#60a5fa` | `#1d4ed8` | MLH Fellowship identity |
| `--program-sob` | `#fb923c` | `#c2410c` | Summer of Bitcoin identity |
| `--program-other` | `#a78bfa` | `#6d28d9` | Anything not in the registry |
| `--success` / `--warning` / `--danger` | `#22c55e` / `#f59e0b` / `#f43f5e` | AA-safe darker | Status only |

Theme: first visit follows the system setting; the toggle persists the choice (next-themes, `data-theme`). The `.cine` layer has its own tokens (`--cine-bg`, `--cine-fg`, `--cine-fg-2`, `--cine-fg-3`, `--cine-line`, `--cine-accent`, and RGB channels `--cine-shade` / `--cine-ink` for scrims): dark is `#050506` graphite with `#f5f3ef` ink and emerald `#1ac66e`; light is `#f7f6f3` paper with `#1a1917` ink and forest `#166534`.

Rules: no gradients in UI chrome (scrims over artwork and sphere shading are the exception). Program colour appears in three places only: the 2 px left accent rule (`.card-selected`), the status dot, and the active facet chip. Light mode is warm paper, not grey.

## 3. Type

- **Newsreader** (optical size 72, weight 700–760) for display headings and large figures (`.display`, `.masthead-title`, `.cine-title`, `.cine-h2`, stat values). **Manrope** for UI and prose. JetBrains Mono only for metadata: dates, counts in chips and code (`.num`). Mono is never used for sentences or headline numbers. No other families are loaded.
- Home and story headlines are lowercase and short (one to three deliberate lines); internal page titles keep normal capitalisation because they name things.
- Scale: 13 / 15 / 16 / 18 / 20 / 24 / 32 / 40, with display sizes in `clamp()` so they grow with the viewport up to 1920 px. Tailwind `text-xs` is 13 px and `text-sm` is 15 px.
- Weights: 400 body, 500 labels, 600 card titles and buttons, 600 section H2. No 800 or 900.
- Labels (`.eyebrow`): 14 px sentence case in the UI sans, `--text-muted`. No tracked uppercase labels.
- Line length: `.prose-measure` caps prose at 68ch.
- Minimum UI text size is 13 px. Anything smaller is not used.

## 4. Shape and depth

| Tier | Radius | Class | Examples |
|---|---|---|---|
| Chip | 3 px | `.chip`, `kbd.key` | Tech tags, year labels |
| Control | 4 px | `.btn`, `.field`, `.icon-btn`, facet rows | Buttons, inputs, toggles (cinematic buttons `.cine-btn` use 2 px) |
| Card | 6 px | `.card` | Org, program, project, term cards |
| Panel | 8 px | `.panel`, `.cmd-palette` | Sidebar, modals, toolbar, FAQ list |
| Hero | 12 px | `rounded-[var(--radius-hero)]` | Reserved |
| Pill | 9999 px | `.pill` | Status badges only |

Dark mode: no drop shadows on cards; depth is surface step + `--border` + `--highlight-inset`. Shadows only on overlays (`--shadow-lg`, `--shadow-modal`). Light mode: `--shadow-card` on cards, `--shadow-lg` on overlays. No glow blobs, no blur circles, no ring+shadow stacks.

## 5. Spacing and layout

4 px grid. Card padding 20 px (`p-5`); card gap 16 px (`gap-4`); section gap 40 px mobile / 64 px desktop (`Section`); sidebar 280 px; header 64 px; max content width 1600 px (`.cine-wrap` and page containers), so 1920 px screens are used rather than leaving a narrow column. Grids: 1 / 2 / 3 columns at 0 / 768 / 1280 px in the explorer; 1 / 2 / 4 for landing feature cards.

## 6. Components

- **Header**: 64 px, sticky, blurred background once scrolled. On the explorer the search field is always visible, including a second row on phones. Theme toggle in every variant.
- **Explorer**: intro (H1, one paragraph, facts strip) → term schedule → toolbar (`CategoryBar`: category pills, result count, sort, view toggle) → sidebar facets + grid. Phones get a left drawer for filters.
- **Org card**: 40 px logo plate on white, name 16/600, meta line (category · year span), two-line description, up to 3 mono tech chips + "+N", five-year activity bars in the program colour, footer with mono counts and "View details". The whole card is one link (stretched), one focus ring.
- **Facet section**: title 14/600, optional search field, checkbox rows with right-aligned mono counts, "Show N more".
- **Program card**: sponsor, status pill, name, one sentence, four-fact table from the registry (`src/data/programs.ts`) with a source link per fact, derived counts, one CTA plus "Official site". Coming-soon cards use the compact variant with "Official site" and "Follow progress"; never a disabled button.
- **Explorer shell**: every dashboard (`/lfx`, `/gsoc`) is `ExplorerShell` driven by a `ProgramConfig`; cards, facets, toolbar and empty states come from one place. The program colour only reaches the card accent rule, the activity bars, the status dot and the active chip.
- **Empty state**: 24 px muted icon, one sentence saying exactly what did not match, one sentence of advice, one button.
- **Loading**: skeletons that match card geometry. No spinners.
- **Error**: plain sentence, "Try again", link to the issue tracker.
- **Buttons**: `.btn-primary` is ink on paper (light) or paper on ink (dark), never green; `.btn-secondary` (bordered), `.btn-ghost`. On always-dark surfaces use `.cine-btn--solid` and `.cine-btn--line` (52 px). Sizes `.btn-sm` 32 px, default 40 px, `.btn-lg` 48 px. Never scale on hover. Green is a rare accent: focus rings, active facets, a few lit details in artwork.
- **Masthead** (`PageMasthead`): every internal page opens with a `.cine` band: breadcrumb, sentence-case label, `.masthead-title`, lede, actions, optional facts strip. GSoC and LFX pages fade their program art in behind the copy (`data-art`), using the light render in light mode.
- **Home story** (`src/components/home/`), in order: hero, mission, programs (GSoC and LFX as scroll chapters, then programs on the way), explore organizations (search, technology chips, three insights, long-running organizations), ecosystem network, playbook (three stages), FAQ, closing call to action with OSSGrid's own contributors. Every section uses `.cine` tokens, which follow the theme.
- **Program chapter** (`ProgramChapter`): at 1280 px and wider with motion allowed, a 440vh track pins a full-screen stage; scroll position picks one of 40 pre-rendered frames (`public/art/seq/<program>-<theme>/`) drawn on a canvas. The readout shows the year or term in that frame with its real count and a bar per step; facts arrive in the second half. Below 1280 px or with reduced motion it is the final frame as a still with the same text. Frames come from `scripts/art/render-seq.mjs`.
- **Ecosystem network** (`Ecosystem`): the 56 largest organizations as SVG spheres sized by projects, laid out once on the server with d3-force, linked where they list four or more of the same technologies. Program and technology filters dim non-matches; hover, focus or tap shows a tooltip; arrow keys move between spheres (roving tab stop), Enter opens, Escape clears. Phones scroll the network sideways inside its frame.
- **Disclosure** (`.disclose`): playbook stages and FAQ answers expand with a 0fr to 1fr grid-row transition; closed panels are `inert`.
- **Chips** (`.cine-chip`): 36 px pill links and toggle buttons for technologies; pressed state is ink-filled.
- **Artwork**: original renders from `scripts/art/` (three.js offline), shipped as AVIF/WebP in dark and light variants (`.art-dark` / `.art-light`). Shapes come from real data; live HTML carries all text. Never use third-party artwork.
- **Footer**: always dark; three link groups from the registry (Programs, Resources, Community), data attribution, and a non-collapsible bottom line "Built with ❤️ by Rajat Srivastav" linking to https://x.com/rajatrsrivastav. No contributor names in the footer.

## 7. Motion

150 to 200 ms ease-out for hover and focus; 180 to 250 ms for panels and reveals. Scroll reveals once, small distance (16 to 28 px). Above-the-fold content animates on mount, not on intersection. Scroll-scrubbed scenes are pre-rendered frames on a canvas, never a live 3D engine, and only run at 1280 px and wider. No scale on hover anywhere. Everything is disabled under `prefers-reduced-motion`.

## 8. Copy

Voice: a senior contributor explaining things to a friend one year behind. Plain words, specific nouns, short sentences, no hype.

- Sentence case for headings, buttons, labels and tooltips. Title Case only for proper nouns (Google Summer of Code, Linux Foundation).
- Buttons are verbs: "Browse LFX orgs", "Clear all filters".
- Numbers come from data. Counts are derived in `src/lib/stats.ts` (floor to ten, "+"). Dates, stipends and eligibility live in `src/data/program-calendar.json` with `sourceUrl` and `lastVerified`.
- Every external link says where it goes ("Source file on GitHub", "Official LFX portal").
- Third-party brands are named as their owners write them, and OSSGrid is never implied to be official.
- Banned words are enforced by `npm run check:copy` (see `scripts/check-copy.ts`), which runs in CI.
