# OSSGrid — CRED-Inspired Visual Design Specification

**Version:** 1.0 | **Date:** 18 October 2026  
**Target:** https://ossgrid.tech/ | **Local:** http://localhost:3000  
**Reference:** https://cred.club/ | **Primary evidence:** six CRED/current-OSSGrid screenshots supplied by the project owner.

> **Reference disclosure:** This is an original OSSGrid implementation specification *derived from visually observable principles* in the screenshots and CRED's public homepage. It is **not CRED's internal design system**, source code, original font specification, 3D assets, or proprietary motion documentation. Values labeled **proposed** are starting points to verify visually, not measured facts about CRED.

## 1. North-star direction

**“CRED-level cinema, OSSGrid-level usefulness.”** Build an original high-craft experience whose aesthetics draw from CRED's editorial typography, atmospheric lighting, immersive scroll storytelling, metallic visual depth, controlled contrast, and image-led feature showcases. Preserve OSSGrid's meaning: public, free discovery of GSoC/LFX organizations, projects, accepted proposals, mentors and practical contribution opportunities. Never imply partnership with CRED.

This project must not stop at dark colors and large type. The expected difference is **composition + bespoke artwork + animation + spacing rhythm + visual verification**.

## 2. Visual reference breakdown

| Screenshot / element | Direct observation | OSSGrid translation | What not to copy |
|---|---|---|---|
| CRED architectural hero | Oversized high-contrast serif centered against dark architectural backdrop, sparse navigation, atmospheric depth | OSSGrid hero with monumental serif message against **original** open-source-inspired dimensional environment: graphite structures, layered repository panels, subtle emissive edge lighting | Identical architecture image, credit-card messaging, CRED identity |
| CRED multi-phone render | Photorealistic layered product objects against nearly black negative space; precise staged lighting | Original project explorer visualization: dark-metal browser-like panels and floating organization/project objects with realistic material/depth | Phone hardware renders and app screens |
| CRED all-black typographic statement | Large expressive white typography, short subtitle, large voids | Mission section: “great work begins in the open.” Meaningful supporting text and one quiet CTA | Exact headline, copied typography files |
| CRED feature showcases | Tall image-led tiles, small eyebrow labels, strong headings and elegant buttons | GSoC and LFX *program exhibits*, plus featured organizations, with custom art and real links | CRED services, logos, assets |
| CRED surreal reflective sphere scene | Dimensional, physically lit abstract objects and dramatic contrast | Open-source 'constellation' made of original metallic project nodes / repository badges and connected signals | Same spheres/images and product motifs |
| Current OSSGrid | Working navigation, search, program routes, real organization/project catalog | Retain domain content and all working data/actions, overhaul presentation and storytelling | Sidebars, redundant hamburger, unrelated route or database changes |

## 3. Proposed original visual tokens

The following tokens are **starting values, not sampled CRED CSS**. Check actual browser results and adjust.

```css
:root {
  --bg: #050506;
  --bg-raised: #121315;
  --bg-soft: #1b1c20;
  --fg: #f5f3ef;
  --fg-secondary: #b2b1b6;
  --fg-muted: #828188;
  --outline: rgba(255,255,255,.14);
  --accent: #1ac66e; /* restrained OSSGrid identity */
  --content: 1320px;
  --gutter: clamp(20px, 4.5vw, 80px);
  --display: clamp(4rem, 8.5vw, 9.5rem);
  --section-space: clamp(96px, 15vh, 220px);
  --ease: cubic-bezier(.22,1,.36,1);
}
```

### Typography

- **Display:** Evaluate Instrument Serif and Bodoni Moda as accessible licensed alternatives. Neither should be presented as the verified CRED font. Select based on a reference screenshot comparison.
- **UI and prose:** Geist, Inter, or Manrope. **Metadata:** Geist Mono or JetBrains Mono.
- Headlines should be 1–3 short lines with intentional line-break composition; use very large sizes, tight leading (~.87–1.0 depending on font), careful width, and controlled letter spacing. Avoid overlong paragraphs beneath massive headings.
- Preserve excellent text contrast and readability. Use a small uppercase tracking label only where meaningful.

### Color and light

- Prefer true near-black fields, subtle textured graphite, muted silver and soft highlights. Use green as a **rare accent**, not a giant green gradient.
- Make high-end light cues part of the artwork: soft rim light, directional shadows, specular reflections. Avoid overused glassmorphism.
- Use image-backed / rendered original environments for hero and a few section anchors; CSS alone cannot convincingly replace complex photorealistic CGI.

### Layout

- Alternate: cinematic full-bleed section → restrained editorial text → visual exhibit → useful directory. Consistent horizontal gutters and purposeful vertical space.
- At 1440px the hero should feel like a composed poster rather than a centered SaaS container.
- Preserve utility in dense data pages; do not make filters harder to use merely to match the landing page.

## 4. Required custom artwork / asset plan

**Visual assets are a dependency, not an afterthought.** Before hero coding, create an asset inventory and choose the method for each.

1. **Hero environment**: an original open-source-inspired dark graphite architectural scene, with repository panels, green emissive edges and atmospheric light. Option: professionally created/AI-generated **original** background approved for usage, or Blender/WebGL scene. Do not place screenshot text directly in background art; live HTML should carry headlines.
2. **Floating product explorer**: actual OSSGrid organization/project names from the dataset, composited into a dimensional scene via CSS 3D or WebGL / pre-rendered assets; never dummy finance content.
3. **GSoC / LFX exhibits**: two original distinct 16:9 or taller artworks supporting real program identity. Do not imply endorsement.
4. **Abstract contribution network**: a separate moody, luminous original asset or lightweight interactive visualization.
5. **Practical fallback**: if none of the asset tools exist, acknowledge the limitation and build one coherent custom SVG/HTML/CSS visual rather than claiming photorealism. Never use CRED's protected artwork.

For every asset record: source/creator, license or ownership, alt text, dimensions, performance strategy, and where it appears. Export responsive WebP/AVIF where sensible, optimize file sizes, and avoid layout shifts.

## 5. Homepage narrative — layout and interactions

### A. Navigation (existing functionality preserved)
- Desktop: a single discreet horizontal header. OSSGrid logo left; Programs, GSoC, LFX, Proposals, Playbook, FAQ visible when space permits; theme switch and one prominent CTA right.
- **Never** add a left sidebar or a second hamburger on desktop. One collapsible accessible mobile navigation only at constrained widths.
- Use restrained transitions and a solid or translucent treatment only if legibility holds.

### B. Cinematic hero (reference: CRED architectural hero)
- Viewport-dominant composition with original image/scene. Display hierarchy: small eyebrow; exceptionally large serif title “find your place / in open source.”; one-sentence explanation; primary “Explore programs” and secondary “Discover organizations”.
- Keep factual organization/project counts derived from real data, not hardcoded invented numbers.
- Stage motion: background reveal, headline reveal, then CTAs; no jarring auto-rotation. Ensure background and foreground have strong separation.
- At 375px, deliberately crop/recompose the scene; avoid microscopic desktop text and horizontal scroll.

### C. Editorial mission statement
- Nearly black panel; giant typographic narrative: “great work begins / in the open.” with short, useful subtitle. Minimal decoration. Give text room to breathe without wasting an entire blank viewport.

### D. Featured programs
- Two large art-directed exhibit panels: GSoC and LFX. Distinct visual environments, metadata and real CTA routes. Use meaningful hover/focus states. Do not force animated carousels.

### E. Project discovery exhibit + working directory
- First show a few real organizations in large editorial compositions. Then provide the functional filtering/search experience beneath.
- Maintain search, tags, categories, year/program filters, sorting, detail routes, proposals and mentors where already available.
- Design cards with strong typography and information hierarchy rather than gaudy animation.

### F. Cinematic contribution story
- A full-bleed original visual showing interconnected real repos/organizations. Optional subtle motion based on scroll; remain fully understandable without animations. No scroll-hijacking.

### G. Community / contribution CTA
- Clear distinction between **OSSGrid contributors** and **contributors to third-party indexed repositories**. Present a teaser only, with routes to `/contributors` and `/contribute`.
- Final editorial CTA with a meaningful action to explore or contribute.

### H. Footer
- Keep it clean and informative. No contributor names grid in footer.
- Links: Contributors, Start Contributing, GitHub source, program and resource routes.
- Bottommost non-collapsible line: “Built with ❤️ by Rajat Srivastav” with name linked to https://x.com/rajatrsrivastav.

## 6. Contributors and repository actions — product rules

- `/contributors`: list historical OSSGrid project contributors; add **Akhilesh Kumar (https://github.com/UserAkku)**; include accessible GitHub links/avatars. Exclude founder Rajat Srivastav from regular contributors showcase, but preserve historical credit in GitHub itself. Never merge external indexed-repo contributors into OSSGrid's own list.
- `/contribute`: beginner-friendly pathway: discover → choose an OSSGrid issue → fork → develop → PR → verified recognition. Explicitly separate OSSGrid-specific contribution from joining third-party projects.
- Indexed repository actions when supported: View repository, Contribute (actual guide or useful default), Report issue (if enabled), View contributors (for that specific repo). Use real repository URLs; don't invent endpoints.
- Preserve working GSoC/LFX data model, routing, search, API and SEO.

## 7. Motion specification

**Proposed durations:** hover 140–220ms; panel transitions 250–400ms; major entrance reveals 500–850ms. Prefer gentle easing and transform/opacity where possible.

- Use motion to reinforce hierarchy: staggered headline words, a single slow hero environment reveal, discreet image-mask reveals on scroll, mild parallax for decorative layers.
- Avoid generic `fade-in` on every element, 3D card spins, floating random blobs, endless moving backgrounds, scroll-jacking and motion that obscures controls.
- Respect `prefers-reduced-motion: reduce` with non-animated alternatives. Pause offscreen updates; avoid heavy main-thread paint effects.

## 8. Reference-first visual verification (non-negotiable)

**No code-only completion claims.** Set up Claude in Chrome or Playwright MCP, and screenshot both sites at the **same browser zoom, viewport, DPR and scroll position**.

Create local artifacts under `design/references/` (only original user-supplied screenshots or authorized local captures), `design/iterations/`, and a `design/visual-review.md` checklist.

### Measurements to capture
- Layout viewport (width/height), grid gutters, section boundaries, heading bounding rectangles, hero imagery focal area, text column widths, line-height, section heights and CTA placements.
- Desktop at 1440×900; mobile at 390×844; tablet at 768×1024. Use additional 1920px width if needed.
- Capture screenshot for each hero/mission/program section and corresponding local implementation. If public site inspection fails, rely on user-provided CRED screenshots and label inferred values.

### Iteration loop (repeat for each section)
1. Observe and record the relevant reference screenshot, including a concise composition map.
2. Choose original OSSGrid-specific assets with equivalent visual weight.
3. Implement exactly one section.
4. Start localhost and capture screenshot at matching viewport.
5. Compare side-by-side. Write the **five largest visible mismatches** (font silhouette, scale, crop, lighting, whitespace, alignment, etc.).
6. Fix those mismatches, recapture and repeat; minimum two intentional review rounds for hero.
7. Check interaction, mobile adaptation, keyboard navigation and reduced motion.
8. Proceed only when section passes its own design and functional checks.

When pixel diffing, compare geometry and structure; screenshots have different *content and original artwork*, so a low raw pixel difference is neither expected nor desired. Do not claim 1:1 pixel identity.

## 9. Execution protocol for Claude Code

**Phase 0 — Reference and feasibility (read-only):** Inspect repo and live pages, list available browser/art tools. Generate CRED observation notes, component map, asset inventory and page wireframe. Record what is observed vs assumed.

**Phase 1 — Hero prototype only:** Implement original hero, header and required custom art; screenshot, critique and iterate. **Do not redesign all pages yet.** Save a useful Git commit or checkpoint once accepted.

**Phase 2 — Homepage story:** Mission, programs, features, community, CTA and footer; screenshot each.

**Phase 3 — App surfaces:** Organization/project directories and details, proposals, playbook, FAQ, contributors and onboarding, with practical usability intact.

**Phase 4 — QA:** Test routing, data, links, mobile, keyboard, reduced motion, lint, type-check, build and performance. Summarize actual screenshots inspected and outstanding differences.

## 10. Explicit anti-regression rules

- Never add desktop sidebar, floating rail or redundant hamburger; do not replace functional directory with a static showcase.
- Founder credit must **not** be collapsible and **must** link to real X profile.
- Do not invent data counts, mentor names, contribution stats, GitHub URLs or external partnerships.
- Do not insert banking or finance visuals, QR donation widget or CRED copy into OSSGrid.
- Do not substitute gradients and CSS-only particles for the requested sophisticated hero artwork without disclosing the compromise.
- Do not change backend/database unless the feature strictly requires it and impacts are assessed.
- Do not claim a full redesign after changing type, colors and a few card borders.

## 11. Definition of done

1. Visual direction is unmistakably cinematic/editorial, not another standard SaaS template.
2. Original designed visual assets, section compositions and meaningful motion are present; no copied CRED assets.
3. Desktop and mobile browser screenshots are captured, compared and iterated on; known mismatches documented.
4. Desktop navigation is horizontal only; mobile one accessible menu.
5. Search, GSoC, LFX, organizations, projects, proposals and other existing features still work.
6. Contributor recognition, onboarding and repository-specific GitHub actions follow the product rules above.
7. Founder credit exactly links to https://x.com/rajatrsrivastav in the bottom footer (no accordion).
8. Accessibility, reduced motion, performance and basic automated checks pass (or limitations are honestly reported).

## 12. Public research references

- CRED homepage — https://cred.club/
- Claude Code Chrome integration — https://code.claude.com/docs/en/chrome
- Claude Code MCP setup — https://code.claude.com/docs/en/mcp
- Anthropic frontend-design plugin — https://github.com/anthropics/claude-code/tree/main/plugins/frontend-design
- Microsoft Playwright MCP — https://github.com/microsoft/playwright-mcp
- Chrome DevTools MCP — https://github.com/ChromeDevTools/chrome-devtools-mcp

**Important:** The references above validate public homepage structure and tool capability. They do **not** validate exact CRED design tokens, fonts, proprietary assets, animation code, or intellectual-property rights to reuse them.
