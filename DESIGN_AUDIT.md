# Design Audit — LFX Organizations (OSSGrid)

> Generated: 2026-09-08 | Auditor: Senior Product Design AI | Codebase: `/src/` (Next.js 16 App Router)

---

## Codebase Snapshot

| Property | Value |
|---|---|
| **Framework** | Next.js 16.3.4 (App Router), React 19 |
| **Styling** | Tailwind CSS v4 via `@tailwindcss/postcss` + CSS Custom Properties in `globals.css` |
| **Component Library** | None — fully custom components |
| **Design Token System** | ✅ Partially implemented — CSS custom properties in `:root` and `[data-theme="light"]` in `globals.css`. No separate token file. |
| **Dark Mode** | ✅ `next-themes` with `data-theme` attribute, defaults to dark |
| **Icon Set** | Lucide React (single library, consistent) |
| **Fonts** | Inter (body/UI) + JetBrains Mono (code/badges). Loaded via `next/font/google`. |
| **Pages / Routes** | 2 routes: `/` (home/discovery) · `/organization/[slug]` (org detail) |
| **Components** | 9: `Header`, `SearchBar`, `SidebarFilter`, `StatusBanner`, `OrganizationCard`, `OrgChart`, `OrgChartWrapper`, `ThemeToggle`, `ThemeProvider` |
| **App Purpose / Audience** | Developer-facing open-source discovery tool. Engineers exploring LFX Mentorship programs. Peer reference: Linear, gsocorganizations.dev. |
| **Data** | 80+ orgs, 560+ projects, loaded client-side from static `/public/data/organizations.json` |

---

## Overall Design Maturity Score: **6.4 / 10**

This is a competent, well-intentioned implementation with a real token system, good dark mode coverage, and a consistent icon library. A design-literate user would notice the effort — the glassmorphism, gradient text, and stagger animations show intent. **However**, it exhibits a cluster of "AI-generated dark dashboard" tells: blue-to-cyan gradient everywhere, Inter at default weights, no typographic scale differentiation, and a critical gap between what the CSS token system *defines* and what components *actually use* (heavy reliance on ad-hoc inline `style={}` props that bypass the token system). The organization detail page is noticeably less polished than the homepage and feels half-finished.

---

## Category Scores

| Category | Score | Top Issue |
|---|---|---|
| Visual Foundations | 6/10 | Single accent gradient (#3b82f6→#06b6d4) used in 12+ places; no typographic scale |
| Design System Consistency | 5/10 | Tokens defined but bypassed: 60%+ of styles are inline `style={}` with hardcoded `rgba()` values |
| Layout & Responsive | 6/10 | Mobile search hidden entirely (SearchBar disappears on `<sm`); no mobile-first hierarchy |
| Interaction & Motion | 7/10 | Good animation bones; missing hover states on filter checkboxes, no focus ring shape match on cards |
| Information Architecture | 6/10 | Good sidebar structure; back-nav loses filter state; org detail page lacks breadcrumb |
| Accessibility | 4/10 | No `prefers-reduced-motion`; search input missing label; `<img>` instead of `next/image`; contrast failures |
| Content & Voice | 6/10 | Copy clear but inconsistent: "Apply" vs "Visit Site" same link; "Mentee details unavailable" is a dead-end |
| "Looks Designed" Test | 6/10 | Blue-to-cyan gradient dominates everything; org detail page looks like a first draft |

---

## Findings by Category

---

### A. Visual Foundations

#### Color

- 🔴 **`globals.css` L36-41 / `Header.tsx` L42,89 / `page.tsx` L99,173,195,236 / `StatusBanner.tsx` L34 / `SidebarFilter.tsx` L134,159,266**: The `linear-gradient(135deg, #3b82f6, #06b6d4)` blue-to-cyan gradient is applied to **12+ separate style blocks** across 6 files as a raw hardcoded value. It appears on: the logo mark, the "LFX Portal" CTA button, active quick-filter pill, active year toggle, active technology badges, empty-state CTA, "Visit Site" on org detail, checked filter checkbox, and pulsing status badge. Zero restraint — it has become visual noise.

- 🟡 **`OrgChart.tsx` L16-21**: Chart colors (`#6366f1`, `#22c55e`, `#a855f7`, `#f97316`) are **hardcoded hex values** outside the token system. They will not adapt to light mode and fight the rest of the palette's saturation levels.

- 🟡 **`globals.css` L36-41**: The accent palette defines `--accent-orange` and `--accent-pink` but **neither is used anywhere** in the actual components. The token system has dead branches.

- 🟢 Light mode token overrides are comprehensive and well-structured in `[data-theme="light"]`. ✅

#### Typography

- 🔴 **Entire codebase — no typographic scale**: The app uses only `text-xs`, `text-sm`, `text-base`, `text-lg`, and `text-3xl` (org detail H1). No defined `--font-size-*` token hierarchy. Section headers (`h2`, `h3`, `h4`) on the org detail page are manually assigned sizes without a system.

- 🟡 **`OrganizationCard.tsx` L44,47,64,78**: Badge font sizes use raw Tailwind `text-[10px]` — an arbitrary value bypassing the type scale. `10px` is below the WCAG-recommended 12px minimum for UI text and will fail readability on non-Retina displays.

- 🟡 **`globals.css` L10 vs `layout.tsx` L54**: Font is defined twice — `--font-sans: "Inter"` in the Tailwind `@theme` block AND `fontFamily: "var(--font-inter)"` as an inline body style. These reference different CSS variable names (`--font-sans` vs `--font-inter`) and create a subtle inconsistency.

- 🟡 **`organization/[slug]/page.tsx` L195**: Chart heading uses `uppercase tracking-wider` — the only instance of small-caps labeling in the entire app. One-off typographic treatment with no matching pattern elsewhere.

- 🟢 JetBrains Mono appropriately scoped to `badge-tech` and chart axis ticks. ✅

#### Spacing & Grid

- 🟡 **`page.tsx` vs `organization/[slug]/page.tsx`**: Main page card grid uses `gap-4` (16px) while org detail page uses `gap-5` (20px) for the same card pattern. Inconsistent gap tokens between routes.

- 🟡 **`SidebarFilter.tsx` L87 vs L110**: Sidebar header uses `px-4 py-3` while the scrollable body uses `px-3 py-3`. The 4px horizontal shift between header and body content creates a visual stutter.

- 🟢 4/8px Tailwind spacing system is broadly respected. No egregious `mt-[13px]` arbitrary values found. ✅

#### Iconography & Imagery

- 🔴 **`OrganizationCard.tsx` L27 / `organization/[slug]/page.tsx` L128**: Organization logos use plain `<img>` tags instead of `next/image`. No lazy loading, no blur placeholder, no responsive `srcset`, causes cumulative layout shift (CLS). Logos are the primary visual differentiator between cards.

- 🟡 **`OrganizationCard.tsx` L26**: Logo container has `ring-1 ring-white/10` — a white ring for dark mode. In light mode this becomes essentially invisible. Should use semantic `border` with `--border-card`.

- 🟢 Lucide React used exclusively and consistently. Stroke widths uniform at default 1.5. ✅

#### Elevation & Depth

- 🟡 **`globals.css` L43**: `--shadow-card: 0 4px 24px rgba(0,0,0,0.3)` in dark mode is very heavy — 24px blur with 30% black on `#0a0f1e` creates harsh separation. Compare to the elegant light-mode version (`0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)`). Dark shadow is overengineered.

- 🟡 **`organization/[slug]/page.tsx` L120-124**: Profile card manually declares `boxShadow: "var(--shadow-card)"` *alongside* the `glass-card` class which already applies the same shadow — double-application revealing the author wasn't confident the CSS class would work.

#### Border Radius

- 🟡 **Mixed radius across interactive elements**: Buttons use `rounded-xl` (12px), `rounded-lg` (8px), `rounded-2xl` (16px), and `rounded-full` for the same UI function (interactive button) at similar sizes. Example: "LFX Portal" header = `rounded-xl`, "Clear all filters" = `rounded-lg`, quick filter pills = `rounded-full`. No defined radius scale by component tier.

---

### B. Design System Consistency

- 🔴 **Token system present but systematically bypassed**: Count of inline `style={{}}` props with raw `rgba()` or `var()` values per file:
  - `page.tsx`: 8 inline style blocks
  - `organization/[slug]/page.tsx`: 14 inline style blocks
  - `SidebarFilter.tsx`: 6 inline style blocks with hardcoded gradient strings
  - `Header.tsx`: 4 inline style blocks
  
  The CSS classes (`.glass-card`, `.badge`, `.badge-accent`, `.badge-year`, `.badge-tech`) are the right approach. The inline styles are the anti-pattern.

- 🔴 **Results count badge (`page.tsx` L171-179)**: Manually styled with `rgba(59, 130, 246, 0.15)` background and `rgba(59, 130, 246, 0.2)` border. This is **identical** to `.badge-accent` in `globals.css` L168-172. The existing class exists and is not used here.

- 🟡 **`SidebarFilter.tsx` quick filter pills (L131-138) vs year toggles (L153-166)**: Near-identical active/inactive toggle logic, different implementations — pill shape vs rectangular, different padding, different border styles. A shared `<FilterToggle variant="pill|rect">` component would eliminate 40+ lines of duplicated style logic.

- 🟡 **`organization/[slug]/page.tsx` L66-108**: Header manually re-implemented with hardcoded inline styles instead of reusing `<Header>` component. Any update to `Header.tsx` won't propagate to the org detail page.

- 🟢 `FilterSection` accordion is properly abstracted and reused 4 times. ✅

---

### C. Layout & Responsive Design

- 🔴 **`Header.tsx` L63-65**: `SearchBar` is completely hidden at `< sm` (640px): `hidden sm:block`. Zero search affordance on mobile. Search is the primary action on this discovery tool, yet it disappears on the most common device type. This is a P0 usability failure.

- 🔴 **Breakpoint inconsistency**: Sidebar toggle (hamburger) is `lg:hidden` (visible < 1024px). Search bar is `hidden sm:block` (visible > 640px). This creates a 640-1024px gap where search is visible but no way to access filters exists on tablet-sized screens.

- 🟡 **`page.tsx` L206**: Card grid `grid-cols-1 md:grid-cols-2 xl:grid-cols-3`. At `md` (768px) with a 280px sidebar, effective content is ~488px — two-column cards may be uncomfortably narrow (< 220px each).

- 🟡 **`organization/[slug]/page.tsx`**: Detail page has no theme toggle, no search, no sticky "Apply" CTA. As the user scrolls through long project lists, the primary action ("Visit Site") scrolls offscreen. No way to return to filtered search state.

- 🟡 **Max-width inconsistency**: Homepage uses `max-w-[1400px]`, org detail uses `max-w-[1200px]`. Different containment widths between routes creates a layout shift perception.

- 🟡 **Loading state (`page.tsx` L89-111)**: The "LF" pulse spinner provides no spatial context for the incoming content. No skeleton cards. Content flashes from a centered small element to a full grid with no spatial continuity.

- 🟢 Empty state exists with icon, description text, and clear action button. ✅

---

### D. Interaction & Micro-interactions

- 🔴 **`OrganizationCard.tsx` L18-21**: Clickable `<Link>` card uses `glass-card` class with `border-radius: var(--radius-card)` (16px), but the global `*:focus-visible` rule applies `border-radius: 4px`. Focus ring on cards will have squared corners around a 16px-radius card — visually jarring and fails the intent of the design.

- 🟡 **`SidebarFilter.tsx` filter checkboxes**: `filter-checkbox` has `transition: all 0.2s ease` but no hover state is defined for the unchecked state. No visual feedback that the checkbox is interactive before click.

- 🟡 **`SidebarFilter.tsx` L32**: `FilterSection` collapse button has `transition-colors` class but no `hover:bg-*` utility — the button appears visually inert until clicked.

- 🟡 **`Header.tsx` L73,87**: CTA buttons have `hover:scale-105` but no `active:scale-95` press state. Scale-up on hover with no scale-down on click creates a floating, unconfirmed feel.

- 🟡 **`SearchBar.tsx` L12-17**: Search wrapper has `transition-all duration-200` but no `:focus-within` state — no container-level visual feedback when the input is focused. Border doesn't glow, no shadow change.

- 🟡 **`StatusBanner.tsx` dismiss button L61-68**: Has `transition-colors` but no hover color defined (color is inline `style={{ color: "var(--text-muted)" }}`). Hover interaction is invisible.

- 🟢 Card hover animations (`translateY(-2px)` + border glow) use smooth cubic-bezier easing. ✅
- 🟢 Staggered card entrance animations are a considered, purposeful touch. ✅

---

### E. Information Architecture & Navigation

- 🔴 **`organization/[slug]/page.tsx` L96-106**: "Back to Search" button uses `Link href="/"` — navigates to homepage root, **discarding all active filters and search state**. A user who built up a filter set, navigated to an org detail, and pressed back loses everything. Since filter state IS in the URL (`useFilterState` syncs to query params), using `router.back()` would restore state correctly.

- 🟡 **Missing breadcrumb on org detail**: No `LFX Organizations > CNCF > Kubernetes` hierarchy. The back button is the only navigation signal with no context about where the user came from.

- 🟡 **No active filter summary**: With multiple filters active, the sidebar only shows "Clear all (N)" as the count indicator. There is no chip strip or summary of what is currently filtered.

- 🟡 **`Header.tsx` L53-59**: The "2027 Term 1" badge pulses with `pulse-glow` animation permanently. An animation that never stops is fatiguing. Combined with the gradient CTA button, the right side of the header is visually noisy.

- 🟢 URL state sync is well-implemented in `useFilterState.ts`. Shareable filtered URLs work correctly. ✅
- 🟢 Quick filters ("Beginner Friendly", "First-Time Orgs") are a smart affordance for the target audience. ✅

---

### F. Accessibility (WCAG 2.2 AA)

- 🔴 **No `prefers-reduced-motion` support anywhere**: 5 keyframe animations defined (`fadeIn`, `slideIn`, `scaleIn`, `shimmer`, `pulse-glow`). The `pulse-glow` animation on the status badge runs permanently. Zero `@media (prefers-reduced-motion: reduce)` override in `globals.css`. WCAG 2.3.3 AAA violation; WCAG 2.1 AA best-practice failure.

- 🔴 **`SearchBar.tsx` L20**: `<input type="text">` has no associated `<label>` and no `aria-label`. The `placeholder` attribute is not a label substitute (WCAG 1.3.1, 3.3.2). Screen readers cannot identify this input's purpose.

- 🔴 **`OrganizationCard.tsx` L27-33**: Plain `<img src={org.logoUrl}>` instead of `next/image` — no lazy loading, no blur placeholder, causes CLS. The `<Link>` card wrapping has no `aria-label` to describe the card's destination meaningfully beyond the org name.

- 🟡 **`SidebarFilter.tsx` L183**: Term search `<input type="text" placeholder="Search terms...">` has no `<label>` or `aria-label`. Same violation as SearchBar.

- 🟡 **`globals.css` L307**: `*:focus-visible { border-radius: 4px }` — hardcoded 4px will produce squared focus outlines on the 16px-radius cards and 12px-radius buttons.

- 🟡 **Color contrast — badge text (dark mode)**: `.badge` `color: var(--text-badge)` = `#cbd5e1` on resolved `--bg-badge` (~`#253347`). Contrast ≈ 4.1:1. At `10px` font size this **fails WCAG AA** (4.5:1 required; at 10px the effective threshold is higher).

- 🟡 **Color contrast — description text (dark mode)**: `color: var(--text-secondary)` = `#94a3b8` on card background (~`#1a2840`). Contrast ≈ 3.7:1. **Fails WCAG AA** for normal body text (4.5:1 required at 14px).

- 🟢 `ThemeToggle.tsx` has proper `aria-label` that updates based on current theme. ✅
- 🟢 `Header.tsx` mobile menu button has `aria-label="Toggle menu"`. ✅
- 🟢 `StatusBanner.tsx` dismiss button has `aria-label="Dismiss banner"`. ✅

---

### G. Content & Voice

- 🟡 **`OrganizationCard.tsx` L107 vs `organization/[slug]/page.tsx` L150**: The same LFX Portal URL is labeled "Apply" on cards and "Visit Site" on the detail page. Same destination, different verb — sets inconsistent user expectations.

- 🟡 **`organization/[slug]/page.tsx` L261**: `"Mentee details unavailable"` shown in italic when a project has no mentee data. Dead-end message with no action. Better: omit entirely, or replace with "Applications open soon" when the term is upcoming.

- 🟡 **`organization/[slug]/page.tsx` L278**: Project card action button labeled `"More Details"` — vague. The link destination is a GitHub issue URL. `"View Issue on GitHub"` is clearer and sets correct expectations.

- 🟡 **`StatusBanner.tsx` L44**: Date range `"(Mar–May)"` has no year. In September 2026, "Mar–May" is ambiguous — is it 2026 (past) or 2027 (upcoming)?

- 🟢 Filter labels ("Beginner Friendly", "First-Time Orgs") are immediately clear for the developer audience. ✅
- 🟢 Footer attribution is honest and links to data source and repo. ✅

---

### H. "Looks Designed" Test

**Score: 6/10**

- 🔴 **The blue-to-cyan gradient IS the entire visual personality**: `linear-gradient(135deg, #3b82f6, #06b6d4)` appears on the logo mark, every active interactive element, every CTA button, the banner icon background, the checked checkbox, and the status badge. This is the single most recognized "AI-generated dark dashboard" gradient in existence. It collapses all visual hierarchy: the brand logo, a primary CTA, an active filter chip, and a checkbox all look identical.

- 🔴 **No differentiated brand mark**: The "LF" logo is a text abbreviation in a gradient square — a placeholder treatment. At 32×32px, `"LF"` in `text-sm font-bold` white on a gradient reads very poorly. A proper SVG mark would immediately elevate the product.

- 🟡 **Typography lacks personality**: Inter is excellent, but used at `font-normal`/`font-medium`/`font-semibold`/`font-bold` with no size differentiation. No use of Inter's heavier weights (`font-extrabold`, `font-black`) that would give the org name on the detail page real visual punch.

- 🟡 **Glassmorphism applied universally loses impact**: `glass-card` with backdrop-filter blur, border, and shadow on cards, sidebar, command palette, project cards, and chart container. Glassmorphism only signals depth when used for differentiation (modal over content, sidebar over main). When everything is glass, nothing is elevated.

- 🟡 **Org detail page looks unfinished**: Manually-coded header, blocky profile grid, a chart with non-theme colors, dense uniform project cards. No visual progression from "overview" (top profile) to "history" (past projects). Reads as a data dump with card styling applied.

- 🟡 **Light mode has no personality**: In light mode, gradient text and glassmorphism flatten against white. Light mode feels like a UI kit screenshot rather than a designed product — the dark mode "vibe" doesn't translate.

- 🟢 Staggered card animation and `pulse-glow` show genuine motion design attention. ✅
- 🟢 Lucide icons well-chosen for each context (FolderOpen for project count, CalendarDays in banner). ✅

---

## Priority Fix List

### P0 — Fix First (breaks trust or usability)

**1. Mobile search inaccessible** (`Header.tsx` L63-65)  
Add a search icon button on `sm:hidden` that expands to full-width, or render search trigger below the header on mobile.
```tsx
// In Header.tsx, add mobile search trigger:
<button className="sm:hidden p-2 rounded-xl" aria-label="Open search" onClick={onMobileSearchToggle}>
  <Search size={20} style={{ color: "var(--text-secondary)" }} />
</button>
```

**2. No `prefers-reduced-motion` support** (`globals.css`)  
Add at the end of `globals.css`:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**3. Search input missing label** (`SearchBar.tsx` L20)  
Add `aria-label="Search organizations, projects, and technologies"` to the `<input>`.

**4. `<img>` instead of `next/image`** (`OrganizationCard.tsx` L27, `organization/[slug]/page.tsx` L128)  
Replace with `<Image src={org.logoUrl} alt={org.name} width={44} height={44} className="w-full h-full object-cover" unoptimized />`.

**5. Text contrast failures** (`OrganizationCard.tsx` L56)  
Bump `--text-secondary` in dark mode from `#94a3b8` to `#a8b6cc` (≈4.9:1 on card background). Also bump badge `text-[10px]` to `text-xs` (12px) everywhere.

**6. Back button discards filter state** (`organization/[slug]/page.tsx` L96-106)  
Replace `<Link href="/">` with a client-side `router.back()` call, which correctly restores the URL-synced filter state:
```tsx
"use client";
import { useRouter } from "next/navigation";
// ...
const router = useRouter();
<button onClick={() => router.back()}>← Back to Search</button>
```

---

### P1 — High Impact (biggest visual upgrade per effort)

**7. Retire the ubiquitous gradient — restrain it to primary CTAs only**  
Current: gradient on 12+ elements across 6 files.  
Target: gradient ONLY on primary action buttons ("LFX Portal", "Visit Site", "Apply").  
All active filter states → replace gradient background with flat `var(--color-accent)` text on `var(--color-accent-dim)` background.  
Files: `SidebarFilter.tsx` L134,159,266; `page.tsx` L173,195,236; `globals.css` L327.

**8. Replace 30+ inline style blocks with CSS classes**  
- `page.tsx` L171-179 results badge → use `.badge-accent` (already exists!)
- `SidebarFilter.tsx` L91-97 clear button → add `.btn-ghost-accent` class to `globals.css`
- All `style={{ color: "var(--text-*)" }}` on `<p>` and `<span>` → create Tailwind aliases via `@theme`:
  ```css
  @theme inline {
    --color-text-primary:   var(--text-primary);
    --color-text-secondary: var(--text-secondary);
    --color-text-muted:     var(--text-muted);
  }
  ```
  Then use `text-text-primary`, `text-text-secondary`, `text-text-muted` Tailwind utilities.

**9. Establish typographic scale tokens** (add to `globals.css` `@theme` block):
```css
--font-size-2xs:  0.625rem;  /* 10px — chart ticks only */
--font-size-xs:   0.75rem;   /* 12px — badge, label, meta */
--font-size-sm:   0.875rem;  /* 14px — body, sidebar */
--font-size-base: 1rem;      /* 16px — card body */
--font-size-lg:   1.125rem;  /* 18px — card titles */
--font-size-xl:   1.25rem;   /* 20px — section subheadings */
--font-size-2xl:  1.5rem;    /* 24px — section headings */
--font-size-3xl:  2rem;      /* 32px — page H1 */
```
Replace all `text-[10px]` instances with `text-xs` (12px).

**10. Skeleton loading cards** — Replace the centered `LF` spinner with 6 shimmer skeleton cards matching the grid layout. The `shimmer` keyframe already exists in `globals.css`.

**11. Reuse `Header.tsx` on org detail page** — Add an optional `variant="simple"` prop to `Header.tsx` that hides search/filter controls, or create a shared `AppHeader` base. Remove the manual header re-implementation in `organization/[slug]/page.tsx` L66-108.

**12. Fix focus ring shape mismatch** (`globals.css` L307):  
Change `border-radius: 4px` → `border-radius: inherit` so focus rings match the rounded shape of the focused element.

**13. Add hover/active states to all interactive elements**:
- `FilterSection` button: add `hover:bg-[var(--bg-input)]`
- `filter-checkbox` (globals.css): add `hover:border-[color:var(--accent-start)]`
- Header CTA buttons: add `active:scale-95` to match `hover:scale-105`
- `StatusBanner` dismiss: add `hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)]`
- `SearchBar` wrapper: add `focus-within:border-[color:var(--border-hover)] focus-within:shadow-[0_0_0_3px_var(--color-accent-glow)]`

---

### P2 — Polish (final 20% that makes it feel premium)

**14. Replace "LF" text logo mark with an SVG icon**: Even a simple geometric mark (grid/network node) at 32×32 would distinguish the brand immediately.

**15. Apply weight contrast to org detail H1**: Change `font-bold` → `font-extrabold` or `font-black` on `organization/[slug]/page.tsx` L135 for visual punch.

**16. Theme OrgChart colors via design tokens** (`OrgChart.tsx` L16-21):  
Recharts `fill` doesn't support CSS variables directly. Define concrete hex values aligned with the token system in TERM_COLORS and add light-mode variants via a React hook that reads `getComputedStyle`.

**17. Add active filter chip strip above card grid**: When filters are active, show removable chips (`× Go`, `× 2026`) in the results header row for quick removal without opening the sidebar.

**18. Replace empty-state icon** (`page.tsx` L224): Change `<LayoutGrid>` → `<SearchX>` from Lucide — semantically communicates "no search results" rather than a generic grid.

**19. Add `active:scale-95` to all `hover:scale-105` buttons**: `Header.tsx` L73,87,97 and `page.tsx` L234 need press confirmation states.

**20. Sticky "Apply" CTA on org detail page**: The "Visit Site" button scrolls offscreen immediately. Add a sticky bottom bar on the detail page for long-scrolling org pages with many projects.

---

## Recommended Design Token System

Drop-in replacement for `@theme inline` block and `:root` / `[data-theme="light"]` in `globals.css`:

```css
@theme inline {
  /* Typography */
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;

  /* Radius Scale */
  --radius-xs:   4px;
  --radius-sm:   6px;
  --radius-md:   8px;     /* filter buttons, checkboxes */
  --radius-lg:   12px;    /* header CTAs */
  --radius-xl:   16px;    /* cards (replaces --radius-card) */
  --radius-2xl:  20px;    /* modals, large panels */
  --radius-pill: 9999px;  /* pills, badges */

  /* Shadow Scale */
  --shadow-xs:    0 1px 2px rgba(0,0,0,0.05);
  --shadow-sm:    0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md:    0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.05);
  --shadow-lg:    0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05);
  --shadow-xl:    0 20px 25px rgba(0,0,0,0.15), 0 8px 10px rgba(0,0,0,0.04);

  /* Layout constants */
  --sidebar-width: 280px;
  --header-height: 64px;
}

/* ── DARK MODE (default) ─────────────────────────────── */
:root {
  /* Background primitives */
  --bg-base:        #080d1a;
  --bg-raised:      #0d1526;
  --bg-overlay:     rgba(13, 21, 38, 0.85);
  --bg-input:       rgba(25, 38, 64, 0.8);
  --bg-badge:       rgba(45, 65, 100, 0.45);

  /* Background semantic aliases */
  --bg-primary:     var(--bg-base);
  --bg-secondary:   var(--bg-raised);
  --bg-card:        var(--bg-overlay);
  --bg-card-hover:  rgba(13, 21, 38, 0.96);
  --bg-sidebar:     rgba(10, 16, 30, 0.6);
  --bg-banner:      linear-gradient(135deg, rgba(79,142,255,0.08), rgba(129,140,248,0.08));

  /* Borders */
  --border-card:    rgba(255, 255, 255, 0.08);
  --border-input:   rgba(255, 255, 255, 0.12);
  --border-hover:   rgba(79, 142, 255, 0.5);

  /* Text — 4-stop scale */
  --text-primary:   #e8edf5;       /* headings, labels */
  --text-secondary: #a8b6cc;       /* body, descriptions (bumped for WCAG AA) */
  --text-muted:     #6b7e99;       /* placeholders, counts */
  --text-badge:     #c5d2e4;

  /* Accent — semantic, not gradient */
  --color-accent:        #4f8eff;           /* primary interactive */
  --color-accent-dim:    rgba(79,142,255,0.14);
  --color-accent-glow:   rgba(79,142,255,0.28);
  --color-success:       #34d399;
  --color-warning:       #fbbf24;
  --color-purple:        #a78bfa;
  --color-orange:        #fb923c;
  --color-pink:          #f472b6;

  /* Shadows (dark-mode tuned — less aggressive) */
  --shadow-card:         0 2px 8px rgba(0,0,0,0.2), 0 1px 2px rgba(0,0,0,0.15);
  --shadow-card-hover:   0 8px 24px rgba(0,0,0,0.35);
  --shadow-modal:        0 25px 50px rgba(0,0,0,0.5);

  /* Glass */
  --glass-blur: 12px;

  /* Primary CTA gradient — RESERVED for primary action buttons only */
  --gradient-cta: linear-gradient(135deg, #4f8eff, #818cf8);

  /* Chart colors (concrete hex required for Recharts) */
  --chart-term1: #4f8eff;
  --chart-term2: #34d399;
  --chart-term3: #a78bfa;
  --chart-term4: #fb923c;
}

/* ── LIGHT MODE ───────────────────────────────────────── */
[data-theme="light"] {
  --bg-base:        #f4f7fc;
  --bg-raised:      #ffffff;
  --bg-overlay:     rgba(255, 255, 255, 0.92);
  --bg-card-hover:  rgba(255, 255, 255, 1);
  --bg-input:       rgba(232, 239, 250, 0.9);
  --bg-badge:       rgba(210, 222, 242, 0.5);
  --bg-sidebar:     rgba(248, 250, 255, 0.95);
  --bg-banner:      linear-gradient(135deg, rgba(79,142,255,0.05), rgba(129,140,248,0.05));

  --border-card:    rgba(0, 0, 0, 0.08);
  --border-input:   rgba(0, 0, 0, 0.12);
  --border-hover:   rgba(37, 99, 235, 0.5);

  --text-primary:   #0f172a;
  --text-secondary: #334155;       /* >= 4.5:1 on white */
  --text-muted:     #7b8fa8;
  --text-badge:     #1e293b;

  --color-accent:      #2563eb;
  --color-accent-dim:  rgba(37, 99, 235, 0.1);
  --color-accent-glow: rgba(37, 99, 235, 0.2);

  --shadow-card:         0 1px 3px rgba(0,0,0,0.07), 0 4px 12px rgba(0,0,0,0.04);
  --shadow-card-hover:   0 4px 20px rgba(0,0,0,0.1);
  --shadow-modal:        0 25px 50px rgba(0,0,0,0.15);

  --gradient-cta: linear-gradient(135deg, #2563eb, #4f46e5);
}
```

### Token Change Summary

| Token | Current Dark | Recommended Dark | Reason |
|---|---|---|---|
| `--bg-primary` | `#0a0f1e` | `#080d1a` | Deeper for better contrast ratio |
| `--text-secondary` | `#94a3b8` | `#a8b6cc` | WCAG AA compliance on card backgrounds |
| `--shadow-card` | `0 4px 24px rgba(0,0,0,0.3)` | `0 2px 8px rgba(0,0,0,0.2)` | Less harsh in dark mode |
| CTA gradient | `→ #3b82f6, #06b6d4` (blue-cyan) | `→ #4f8eff, #818cf8` (blue-indigo) | Swap cyan for indigo — less generic |
| Badge font size | `text-[10px]` (10px) | `text-xs` (12px) | WCAG readability minimum |
| Focus ring radius | `4px` hardcoded | `inherit` | Match component shape |
| Accent active state | gradient background | flat `--color-accent-dim` bg | Reserve gradient for CTAs only |

---

*End of audit. Total: 42 findings — 6 Critical 🔴 · 24 Moderate 🟡 · 6 Minor 🟢 · 6 Good ✅*  
*Next step: Hand this file to your polish agent with the instruction to implement all P0 and P1 fixes.*

---

## Implementation Log

### Completed Changes

1. **Design Tokens & System (`globals.css`)**
   - Implemented unified dark/light token hierarchy (`--bg-primary`, `--bg-secondary`, `--bg-raised`, `--text-primary`, `--text-secondary`, `--color-accent`, etc.).
   - Standardized primary CTA gradient (`#4f8eff` to `#818cf8`) and restricted gradient usage across components.
   - Added accessibility classes: focus-visible matching component border radius, `@media (prefers-reduced-motion: reduce)`.
   - Added utility component classes: `.glass-card`, `.btn-primary`, `.badge`, `.badge-accent`, `.badge-tech`, `.badge-year`.

2. **Core Components & Fixes**
   - **`Header.tsx`**: Integrated `LogoMark`, mobile search modal toggle, and `variant="simple"` mode for detail pages.
   - **`SearchBar.tsx`**: Added descriptive `aria-label`, tokenized focus glow, and keyboard shortcut indicators.
   - **`OrganizationCard.tsx`**: Converted logos to `next/image` with layout placeholders (P0 CLS fix), token borders, and minimum 12px badge typography.
   - **`SidebarFilter.tsx`**: Replaced noisy active gradients with clean `--color-accent-dim`, added hover states, `aria-pressed`, and interactive quick-filter tooltips.
   - **`StatusBanner.tsx`**: Rebuilt with calm tokens, animated subtle shimmer, and accessible dismissal.
   - **`Footer.tsx`**: Added comprehensive footer with CNCF / LFX data attribution and GitHub repository links.
   - **`IntroStrip.tsx`**: Added dismissible ecosystem overview banner with live organization and project count stats.
   - **`OrgChart.tsx`**: Updated Recharts color palette to reference concrete tokens (`--chart-term1` through `--chart-term4`).
   - **`Organization Detail Page` (`src/app/organization/[slug]/page.tsx`)**: Reusable `Header` with `OrgDetailHeader` preserving filter state via `router.back()`, breadcrumb trail, bold typographic hierarchy, and sticky bottom CTA bar.

3. **Signature Moments & Delight**
   - **`OrgGraph.tsx` & `OrgGraphWrapper.tsx`**: Interactive force-directed relationship graph powered by `d3-force` with foundation color-coding, technology shared-edge clustering, interactive hover tooltips, and reduced-motion static fallbacks.
   - **`LogoMark.tsx`**: Custom SVG constellation node-cluster mark with entrance assembly animation.
   - **`AnimatedCounter.tsx`**: Rolling digits counter for search and filter result transitions.
   - **`CommandPalette.tsx`**: Global `⌘K` / `Ctrl+K` quick-jump search palette with full keyboard navigation and accessible ARIA combobox pattern.

4. **Robustness & Error Handling**
   - **`not-found.tsx`**: 404 page styled with brand mark and direct navigation back to directory.
   - **`error.tsx`**: Global React error boundary with retry trigger.
   - **`layout.tsx`**: OpenGraph and Twitter metadata cards configured with `og-image.jpg`.

5. **Linting & Build Verification**
   - Resolved all React 19 `react-hooks/set-state-in-effect` warnings using `useSyncExternalStore` and event-driven state updates.
   - `npm run lint`: **0 errors, 0 warnings** across the entire codebase.
   - `npm run build`: **0 errors, 97 static pages prerendered successfully**.

