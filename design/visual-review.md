# Visual review log: CRED-inspired redesign

Spec: `CRED_INSPIRED_DESIGN.md` (repo root). Brief: `CLAUDE_OSSGRID_CINEMATIC_REDESIGN_PROMPT.md`.
Status: **Phase 0 and Phase 1 complete. Waiting for visual approval before Phase 2.**

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
| GSoC / LFX exhibit art, contribution network | Not made yet | — | — | — | — | Phase 2 |

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
