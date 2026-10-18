# Visual review log: CRED-inspired redesign

Spec: `CRED_INSPIRED_DESIGN.md` (repo root). Brief: `CLAUDE_OSSGRID_CINEMATIC_REDESIGN_PROMPT.md`.
Status: **Phases 0 to 3 complete (hero approved 2026-10-18, home story approved 2026-10-19).**

## Tools actually used

| Need | What was available | Used |
|---|---|---|
| Read the CRED page | Playwright (Chromium) from the project; built-in browser pane | Yes, cred.club captured at 1440×900 and 390×844 on 2026-10-18 |
| The six supplied CRED screenshots | **Not attached to the request** | No. Observations below come from my own live captures and are labelled as such |
| Image generation | None in this session; no Blender | No |
| 3D art | three.js (dev dependency) rendered offline in headless Chromium | Yes, `scripts/art/render-hero.mjs` |
| Frontend Design skill | Plugin installed; read from `~/.claude/plugins/.../frontend-design/SKILL.md` | Yes |
| Screenshots of localhost | Playwright, built-in browser pane | Yes |

CRED captures live in `design/references/cred/` and are git-ignored: they are third-party material kept for side-by-side review only.

## Phase 0: reference matrix (observed on cred.club, not CRED's internal values)

| Section | Composition | Type silhouette | Rough scale at 1440 | Asset | Motion |
|---|---|---|---|---|---|
| Hero | Centred two-line headline at ~44 % height; sparse chrome; QR box bottom right | Heavy bracketed serif, low-moderate contrast, large x-height, tight tracking, lowercase | ~105–110 px, line ~685 px wide; subtitle ~19 px geometric sans, 2 lines | Rendered corridor of dark glass monoliths, warm rim light on near pillars, haze, reflective floor | Slow background settle; content fades |
| Story | Left-aligned serif paragraph on black, words light up while scrolling | Same serif, ~36 px, regular | One column ~500 px | None | Scroll-linked word reveal |
| Device | One large phone render centred on black | n/a | Phone ~40 % of height | Photoreal product render | Scroll rotate |
| Statement | Huge two-line serif headline centred, tiny caption | Heavy serif | ~60 px | None or one object | Fade |
| Feature tiles | Tall image-led tiles in a horizontal row, small heading + outline button | Sans headings | Tiles ~310×420 | Saturated product renders | Horizontal scroll |
| Surreal scene | Reflective spheres, dramatic contrast, centred headline | Heavy serif | ~60 px | CGI | Parallax |
| Proof | Ratings, light shaft through a doorway | Serif + numerals | ~60 px | Light-shaft render | Fade |
| Footer | Dense link columns on black | Small caps sans | 12 px | None | None |

## Phase 0: OSSGrid translation and decisions

- **Display type:** Newsreader 760, optical size 72 (OFL, Google Fonts). Chosen after rendering eight candidates next to a crop of the CRED headline (`design/iterations/phase0/font-candidates.webp`). It matched the sturdy, bracketed, large-x-height silhouette best. No claim that it is CRED's font.
- **UI type:** Manrope, a geometric sans close to the CRED subtitle feel, instead of defaulting to Inter.
- **Hero art concept:** a contribution graph built as architecture. Graphite columns on a grid floor, a few lit green tops for active days, haze, a horizon glow. It is original to OSSGrid (a "grid" of open-source activity) and avoids CRED's corridor, pillars and products. Column heights are seeded from real GSoC project counts (rank-scaled); it is art, not a chart.
- **Staged explorer:** three real organizations from the index (largest GSoC org, largest LFX org, next GSoC org) as tilted dark-metal panels in the scene, linking to their real pages.
- **Hero is always dark** in both themes, like a poster. The header follows the theme once the page scrolls.

## Asset inventory

| Asset | Source / creator | Licence | Alt text | Sizes | Performance | Where |
|---|---|---|---|---|---|---|
| `public/art/hero-grid-{1080,1600,2560}.{avif,webp}` | Rendered by `scripts/art/hero-scene.html` (three.js r170, MeshPhysical materials, RoomEnvironment reflections, exponential fog, bokeh, bloom), project-owned | Project-owned | Empty (decorative); meaning is carried by live HTML | 16:9 | 6–29 kB each; `fetchpriority=high`; inline 32 px blurred placeholder | Home hero, ≥641 px |
| `public/art/hero-grid-mobile-{780,1170}.{avif,webp}` | Same scene, portrait camera | Project-owned | Empty | 1:2 | 8–20 kB | Home hero, ≤640 px |
| `public/art/exhibit-gsoc-*`, `exhibit-lfx-*` | `scripts/art/gsoc-scene.html`, `lfx-scene.html` via `scripts/art/render.mjs`; shapes from real per-year and per-term counts | Project-owned | Empty (program described beside it) | 16:10 master, shown 21:9 / 4:5 | 4–28 kB, lazy | Program exhibits |
| `public/art/network-*` + `network*.json` | `scripts/art/network-scene.html`; d3-force layout of real orgs; projected label positions exported | Project-owned | Empty; live HTML labels name the orgs | 2880×1240, mobile 1170×1560 | 6–37 kB, lazy | Network chapter |

Compromise disclosed: the hero art is a real 3D render, not photorealistic CGI. Without an image model or Blender, three.js in headless Chromium (software WebGL) is the strongest renderer available. It reads as dimensional art with real lighting, not as CSS gradients.

## Phase 1: iteration log (1440×900 and 390×844, compared with the CRED hero capture)

### Art renders
- **v1** (`phase0/render-v1-desktop.webp`): hard horizon line; centre blown white by bloom; one outlier tower; hard boxes read as a game; flat grey sky.
- **v2**: gradient sky, rank-based heights, rounded geometry, softer metal, horizon glow. Still a faint horizon, towers behind the headline, sparse green, a white near cap.
- **v3**: fog matched to the sky band, skyline lowered into the bottom half, more dim green, bokeh depth of field.

### Round 1 (`phase1/r1-*.webp`): five largest differences
1. Headline too large (109 px, 773 px lines) and too high (centre at 34 %); descenders crowd the second line.
2. Subtitle was three lines over the brightest area of the art; CRED's is two short lines on calm dark.
3. Art put columns evenly behind the CTAs and flared white on a few caps; CRED frames a calm centre.
4. Staged panels read as dashboard cards competing with the CTAs.
5. Header right side had three boxed controls; CRED has one quiet control.

### Round 2 (`phase1/r2-*.webp`): after fixes
Headline 99 px, 705 px lines, centred at 40 %. Two-line subtitle in full white on a soft dark scrim. Re-render with a low central valley and taller side banks. Slimmer, translucent panels lower in the frame. Borderless icons on the art. Remaining: one near column top still flared white; panel tilt barely visible.

### Round 3 (`phase1/r3-*.webp`): after fixes
Rim light lowered and moved back, bloom threshold raised: the flare is now a dim highlight. Panels tilted further and pushed back in the scene. Widths 768, 1024 and 1920, light mode and the mobile menu captured.

### Known differences that remain (intentional or deferred)
- No persistent bottom-right box like CRED's QR code: OSSGrid has nothing to download, and the support button stays in the header.
- The art is less photoreal than CRED's corridor render (see compromise above).
- At 1920×1080 the hero caps at 1000 px, so the next section peeks in; at 1440×900 it fills the screen.

## Phase 1 functional checks
- Keyboard: logo, six nav links, theme, support, header CTA, both hero CTAs, three org panels; every stop has a visible focus ring.
- Links: `/#programs`, `/gsoc`, `/gsoc/numfocus`, `/organization/kubeedge`, `/gsoc/python-software-foundation`.
- Reduced motion: no hero animations run; the title is fully visible immediately.
- Navigation: horizontal links from 1024 px up with no menu button; exactly one menu button below that; Escape closes it and returns focus.
- No horizontal overflow at 390, 768, 1024, 1440 or 1920 px. No console errors from the site (the Cloudflare beacon rejects localhost by design).
- Gates: lint, typecheck, check:copy, test:data 34/34, audit:data, build (647 pages), Playwright 24/24.
- Home route JS: 240 kB gzipped (unchanged; the art is images, three.js is dev-only).


## Phase 2: home story (after hero approval)

### Story map (CRED reference → OSSGrid chapter)

| CRED (observed) | OSSGrid chapter | Original visual | Theme |
|---|---|---|---|
| Serif story paragraph whose words light up while scrolling | Mission: "great work begins / in the open." | Type only; words brighten with a CSS scroll timeline | Always dark |
| Tall image-led feature tiles | Program exhibits: GSoC and LFX | `exhibit-gsoc` (11 monoliths, one per year, warm low sun) and `exhibit-lfx` (22-terrace ziggurat, one per term, cool light), heights from real counts | Always dark |
| Product objects on black | Featured organizations | Real logos, a year strip per org (lit squares = years active), real recent project titles | Always dark |
| (no CRED equivalent; usefulness) | Programs directory | Search into a dashboard; six registry programs as an editorial list with sourced facts | Follows theme |
| Reflective spheres scene | Network | `network`: chrome spheres for the 46 largest GSoC/LFX orgs, links where 4+ technologies are shared; live labels placed from the render's projection | Always dark |
| Proof / doorway | Playbook and FAQ (kept) | Existing content, headings moved to the display serif | Follows theme |
| — | Community | Real OSSGrid contributors from the verified snapshot; explicit split from indexed projects | Always dark |
| Closing statement | Final CTA | Type only | Always dark |

Removed: logo marquee, dashboards strip, how-it-works cards, stats band (their information now lives in the exhibits, directory and mission).

### Art iterations
- **v1** (`phase2/art-v1.webp`): GSoC monoliths pure silhouettes with a specular floor blob; LFX rings read as a vinyl record with thick green bands; network camera inside the cluster, links slashing across the frame, mirror artefacts.
- **v2** (`phase2/art-v2.webp`): warm fill and matte floor for GSoC; LFX rebuilt as a ziggurat with the newest term on top; network still oversized and clumped.
- **v3–v4** (`phase2/network-v3.webp`, `network-v4*.webp`): smaller spheres with collision separation, spread layout, black floor, visible links.

### Round 1 (`phase2/s1-*.webp`): largest differences
1. Mission set two display-size elements side by side; CRED uses one at a time.
2. Header fell back to the old green style once scrolled.
3. Exhibits were text-led: tall text column, art floating with dead space, title clipped.
4. LFX art had a hard horizon band; GSoC floor read as a flat orange plane.
5. Showcase large tile stretched over three rows with an empty middle; network crop showed a third of empty floor; community grid had an empty cell; playbook and FAQ kept uppercase mono eyebrows.

### Round 2 (`phase2/s2-*.webp`): after fixes
Story paragraph at 34ch and ~2 rem; header stays cinematic with a dark backdrop when scrolled; exhibits are full-width 21:9 art with the program name set on the art and details in a row below; LFX sky blends into fog; showcase is a banner plus three tiles; network cropped to the cluster; "Your name here" cell links to /contribute; sentence-case section labels. Mobile network labels kept 24 % from the edges after one ran off screen.

### Known differences that remain
- The large showcase tile still stacks its details in one column on desktop rather than splitting into two.
- The GSoC exhibit crop at 21:9 shows mostly the upper half of the monoliths.
- Renders are three.js in software WebGL, not photoreal CGI (no image model or Blender available).
- Playbook and FAQ internals (cards, green buttons) keep the site-wide style until Phase 3.

### Phase 2 checks
- No horizontal overflow and no site console errors at 1440×900 and 390×844, dark and light.
- Reduced motion: scroll-driven word and image reveals are off; content fully visible.
- Gates: lint, typecheck, check:copy, test:data 34/34, audit:data, build, Playwright 24/24 (landing test now asserts every chapter, the exhibit routes, the community link and every network/featured link pattern).
- Home route JS: 241 kB gzipped (unchanged; all art is AVIF/WebP, 4–44 kB per size, lazy-loaded below the hero).


## Phase 3: internal pages (after home story approval)

Routes reviewed at 1440×900 and 390×844, dark and light: `/gsoc`, `/gsoc/[slug]`, `/lfx`, `/organization/[slug]`, `/proposals`, `/guide`, `/programs/[id]`, `/contributors`, `/contribute`, 404.

### Before (`phase3/b0-overview.webp`)
Every internal page still wore the v3 dashboard look: sans headings around 36 px, green primary buttons, tracked uppercase mono eyebrows, 12–16 px card radii. `/contributors` listed the creator as the first card in the contributor grid.

### System pass (DESIGN.md v4)
Display serif and Manrope site-wide; ink-on-paper primary buttons (green only as a rare accent); radii 3/4/6/8 px; sentence-case labels; purple chart series replaced with silver; dark grouped footer from the registry with the non-collapsible founder credit.

### Round 1 (`phase3/r1-overview.webp`): largest differences
1. Page openings were small headings on plain background; the home story opens with monumental serif and art.
2. The GSoC and LFX exhibit art existed but was unused on their own pages.
3. Organization pages opened with a raised dashboard panel.
4. Guide, proposals, program previews, contributors and contribute all repeated the small-heading pattern.
5. The organization chart still used a purple series.

### Round 2 (`phase3/r2-overview.webp`, `phase3/r2-light-mobile.webp`): after fixes
`PageMasthead` gives every internal page an always-dark opening band with a large serif title; GSoC, LFX, proposals and organization pages fade their exhibit art in behind the copy. Facts strips sit inside the masthead. Light mode pairs the dark masthead with paper content, matching the home rhythm.

### Product rules checked
- `/contributors`: OSSGrid contributors only (snapshot plus GitHub refresh), Akhilesh Kumar included once; the creator is credited on a separate labelled line, not in the directory.
- `/contribute`: separates contributing to OSSGrid from contributing to indexed projects; six-step path; selected-repo actions.
- Repository actions (from main, restyled only): View Repository, Contribute (contributing guide or README), Report Issue only when issues are enabled, View Contributors, all from the real GitHub URL.
- Footer: no contributor names, groups from the registry, bottom line "Built with ❤️ by Rajat Srivastav" linking to https://x.com/rajatrsrivastav, nothing collapsible.

### Accessibility
- One `main` per page, starting with its masthead; h1 inside `main` on all ten routes (three pages previously had no `main`, seven had the h1 outside it).
- New `e2e/a11y.spec.ts` runs axe (WCAG 2.0/2.1/2.2 A and AA rules) on ten routes at both viewports; serious and critical violations fail the build. Found and fixed: dimmed mission words below AA contrast, network labels too close on mobile, proposal title links under the 24 px target size.

### Checks
- Gates: lint, typecheck, check:copy, test:data 34/34, audit:data, build.
- Playwright: 44 tests (smoke, contribution, repository actions, accessibility) at desktop and mobile, run twice: 88/88.
- Route JS gzipped: home 241 kB, /gsoc and /lfx 216 kB, /proposals 200 kB, /guide 188 kB, /contributors 192 kB.

### Known differences that remain
- Explorer organization cards and filter sidebars keep their v3 structure (now in v4 type, colour and radii); a deeper redesign of the dense directory would trade away scanning speed.
- The 404 and error pages use the v4 tokens but no masthead.
