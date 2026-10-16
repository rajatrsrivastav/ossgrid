# DESIGN.md — OSSGrid design system v3

Single source of truth for how OSSGrid looks and reads. Tokens live in `src/app/globals.css`. If a component needs a value that is not a token, add the token first.

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
| `--program-other` | `#a78bfa` | `#6d28d9` | Future programs |
| `--success` / `--warning` / `--danger` | `#22c55e` / `#f59e0b` / `#f43f5e` | AA-safe darker | Status only |

Rules: no gradients. Program colour appears in three places only: the 2 px left accent rule (`.card-selected`), the status dot, and the active facet chip. Light mode is warm paper, not grey.

## 3. Type

- Instrument Sans for display headings (`.display`), Inter for UI, JetBrains Mono with `tnum` for numbers, dates, counts and code (`.num`). Mono is never used for sentences.
- Scale: 12 / 14 / 16 / 18 / 20 / 24 / 32 / 40. Headline on the landing page may go to 64 px.
- Weights: 400 body, 500 labels, 600 card titles and buttons, 600 section H2. No 800 or 900.
- Section eyebrow (`.eyebrow`): 12 px, mono, uppercase, `letter-spacing: .08em`, `--text-muted`. The only uppercase style.
- Line length: `.prose-measure` caps prose at 68ch.
- Minimum UI text size is 12 px. 10 px is not used anywhere.

## 4. Shape and depth

| Tier | Radius | Class | Examples |
|---|---|---|---|
| Chip | 6 px | `.chip`, `kbd.key` | Tech tags, year labels |
| Control | 8 px | `.btn`, `.field`, `.icon-btn`, facet rows | Buttons, inputs, toggles |
| Card | 12 px | `.card` | Org, program, project, term cards |
| Panel | 16 px | `.panel`, `.cmd-palette` | Sidebar, modals, toolbar, FAQ list |
| Hero | 24 px | `rounded-[var(--radius-hero)]` | Landing preview frame only |
| Pill | 9999 px | `.pill` | Status badges only |

Dark mode: no drop shadows on cards; depth is surface step + `--border` + `--highlight-inset`. Shadows only on overlays (`--shadow-lg`, `--shadow-modal`). Light mode: `--shadow-card` on cards, `--shadow-lg` on overlays. No glow blobs, no blur circles, no ring+shadow stacks.

## 5. Spacing and layout

4 px grid. Card padding 20 px (`p-5`); card gap 16 px (`gap-4`); section gap 40 px mobile / 64 px desktop (`Section`); sidebar 280 px; header 64 px; max content width 1440 px. Grids: 1 / 2 / 3 columns at 0 / 768 / 1280 px in the explorer; 1 / 2 / 4 for landing feature cards.

## 6. Components

- **Header**: 64 px, sticky, blurred background once scrolled. On the explorer the search field is always visible, including a second row on phones. Theme toggle in every variant.
- **Explorer**: intro (H1, one paragraph, facts strip) → term schedule → toolbar (`CategoryBar`: category pills, result count, sort, view toggle) → sidebar facets + grid. Phones get a left drawer for filters.
- **Org card**: 40 px logo plate on white, name 16/600, meta line (category · year span), two-line description, up to 3 mono tech chips + "+N", five-year activity bars in the program colour, footer with mono counts and "View details". The whole card is one link (stretched), one focus ring.
- **Facet section**: title 14/600, optional search field, checkbox rows with right-aligned mono counts, "Show N more".
- **Program card**: sponsor, status pill, name, one sentence, three-fact table from `src/data/program-calendar.json`, one CTA, a "Source" link.
- **Empty state**: 24 px muted icon, one sentence saying exactly what did not match, one sentence of advice, one button.
- **Loading**: skeletons that match card geometry. No spinners.
- **Error**: plain sentence, "Try again", link to the issue tracker.
- **Buttons**: `.btn-primary` (solid accent, dark text in dark mode), `.btn-secondary` (bordered), `.btn-ghost`. Sizes `.btn-sm` 32 px, default 40 px, `.btn-lg` 48 px. Never scale on hover.

## 7. Motion

150 to 200 ms ease-out for hover and focus; 180 to 250 ms for panels and reveals. Scroll reveals once, small distance (16 to 28 px). Above-the-fold content animates on mount, not on intersection. No scale on hover anywhere. Everything is disabled under `prefers-reduced-motion`.

## 8. Copy

Voice: a senior contributor explaining things to a friend one year behind. Plain words, specific nouns, short sentences, no hype.

- Sentence case for headings, buttons, labels and tooltips. Title Case only for proper nouns (Google Summer of Code, Linux Foundation).
- Buttons are verbs: "Browse LFX orgs", "Clear all filters".
- Numbers come from data. Counts are derived in `src/lib/stats.ts` (floor to ten, "+"). Dates, stipends and eligibility live in `src/data/program-calendar.json` with `sourceUrl` and `lastVerified`.
- Every external link says where it goes ("Source file on GitHub", "Official LFX portal").
- Third-party brands are named as their owners write them, and OSSGrid is never implied to be official.
- Banned words are enforced by `npm run check:copy` (see `scripts/check-copy.ts`), which runs in CI.
