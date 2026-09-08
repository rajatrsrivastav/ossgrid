---
name: expert-frontend-design
description: Expert-level guidance for producing distinctive, professional, non-templated UI design. Use for any new interface work or visual pass over an existing product — landing pages, dashboards, component libraries, and design-token systems.
---

# Expert Frontend & UI Design

Work as a senior product designer, not a component-library assembler. The default output of
most AI-assisted design is instantly recognizable — the goal here is a specific, considered
interface that could only belong to this product, for this audience.

## 1. Start from the subject, not the pattern library

Before choosing a single color or component, answer three questions in writing:
- Who is this for, specifically? (Not "users" — the actual person, their context, their skill level.)
- What is the one task this surface must make effortless?
- What does this product's *domain* look like when done well by people who aren't designers —
  what visual language already exists in this space (terminals, control rooms, transit maps,
  scientific instruments, editorial layouts)? Borrow structure from there, not from generic SaaS.

A developer-facing open-source discovery tool should not look like a generic "AI dashboard."
It should borrow from the visual world developers already trust: terminals, diffs, commit
graphs, package registries, status dashboards, API docs. Ground every choice in that world.

## 2. Build a real token system before writing a single component

Define, in order:
1. **Color** — 4–6 named background/surface tokens (not 20 near-duplicates), one accent used
   sparingly, 2–3 semantic colors (success/warning/danger), and a full second set for light
   mode if the product supports it. Every color used in a component must trace back to a token.
   Zero raw hex in component files — hardcoded `rgba()` and hex values are technical debt from
   day one, not "just prototyping."
2. **Type scale** — pick 6–8 sizes on a deliberate ratio (1.125–1.25 for dense UI, wider for
   marketing pages), assign each a role (display, heading, body, label, caption, mono/data),
   and never introduce a size outside the scale. Arbitrary Tailwind values like `text-[10px]`
   or `text-[13.5px]` are a sign the scale is incomplete — fix the scale, don't route around it.
3. **Radius & shadow scale** — a small ordered set (e.g. 4/6/8/12/16/20/pill), each tied to a
   component tier (input < button < card < modal), applied consistently. Mixed radii on
   same-tier elements (one button at 8px, another at 16px) reads as unfinished, not playful.
4. **Spacing** — one base unit (4 or 8px) and a small multiplier scale. Don't let two routes of
   the same product drift to different gap values for the same pattern.
5. **Motion** — define 2–3 easing curves and 2–3 durations, tied to intent (entrance, hover
   feedback, state change), not per-component ad hoc values.

Only after this system exists should component work begin. If a component needs a value the
system doesn't have, that's a signal to extend the system deliberately — not to inline a value.

## 3. Motion is a design decision, not a decoration

The most common tell of ungrounded AI design is motion sprayed everywhere: every card fades in
on stagger, every button scales on hover, every panel slides. Real product motion is restrained:

- **One orchestrated moment per surface** — a single hero reveal, one meaningful transition —
  lands harder than uniform micro-animations on every element.
- **Motion should answer a user action.** Opening, filtering, confirming, expanding — motion
  that shows *what changed* is welcome. Motion that plays automatically on every scroll or load
  with no user trigger should be used exactly once, deliberately, not as a systemic default.
- **Always respect `prefers-reduced-motion`.** This is not optional polish — treat it as a
  correctness requirement, tested the same way you'd test a broken link. Pick one mechanism
  (either a global CSS media query or a motion library's built-in reduced-motion mode) — never
  both, since they can conflict or double-cancel each other.
- Physically-based easing (spring, not linear/ease-in-out for anything interactive) tends to
  read as more "considered" than default CSS transitions, but should still be sparse.

## 4. Typography carries personality — don't neutralize it

Pick typefaces deliberately for the subject matter, not the first default that comes to mind.
One family is enough; two is fine only if they're clearly distinct in role (display vs. body,
or a monospace for data alongside a humanist sans for prose). Once chosen:
- Set a real scale (see above) with intentional weight and tracking per level — don't rely on
  size alone to create hierarchy.
- Default to line lengths under ~80 characters for body text.
- Avoid the common AI-design tells: single-word accenting inside a headline (one word italic or
  a different color), all-caps for every label regardless of context, and unnecessary eyebrow
  labels stacked above content that doesn't need framing.

## 5. Structural devices must mean something

Borders, numbering, dividers, and eyebrow labels should encode real information, not decorate.
A numbered `01 / 02 / 03` sequence is only correct if the content actually is a sequence (a
process, a timeline) — don't add numbering to a set of parallel, unordered options just because
it looks structured. Ask, for every structural device: what does this tell the user that plain
layout wouldn't?

## 6. Common AI-generated design tells to actively avoid

Calibrate against these — if your design plan matches one of these clusters by default (not by
deliberate choice for this specific brief), revise it:

- Warm cream background + high-contrast serif + terracotta/clay accent.
- Near-black background with a single neon accent and nothing else considered.
- Identical rounded "SaaS cards" everywhere, one border-radius regardless of hierarchy, the
  same soft grey drop-shadow under every card, decorative gradient washes with no data behind
  them.
- Chrome that appears regardless of subject: tracked-out all-caps eyebrows above every heading,
  meta strings joined with middle dots ("A · B · C"), labels in the shape "WORD — fragment"
  with a spaced em dash, a monospace face slapped onto small labels for no functional reason, a
  "→" appended to every button and link.
- A single blue-to-cyan (or similar) gradient reused on every interactive element — logo, CTA,
  active filter chip, checkbox — until it stops signaling anything because it signals
  everything. Reserve gradients for exactly one tier of element (usually the primary CTA).

If a brief pins down a direction explicitly, follow it even if it matches one of these — the
brief's own words always win. Where the brief leaves an axis open, don't default to these; make
a choice specific to the subject.

## 7. Copy is part of the design, not filler

Words earn their place by making the interface easier to use, not by selling it. Practical
rules:
- Write from the end user's vocabulary, not the system's internals — "notifications," not
  "webhook config."
- Keep an action's name consistent through its entire flow: a button that says "Publish"
  produces a toast that says "Published," never "Submitted" or "Done."
- Errors state what happened and how to fix it, plainly, without apologizing or hedging.
- Empty states are an invitation to act, not a dead end — always pair "nothing here" with what
  to do next.
- Cut every word that doesn't help someone understand or navigate. Sentence case over
  ALL CAPS by default; reserve caps for genuine short data labels (units, codes), not headlines.

## 8. UX correctness is part of design — not a separate QA pass

Visual taste means nothing if the content underneath it is broken. Before shipping any surface
that renders derived, scraped, or user-generated content, check these — they are UX defects,
not edge cases:

- **Truncation must respect meaning, not just character count.** A `.substring(0, N)` that cuts
  a live sentence in half ("...describe how") is worse than showing less text. Truncate at a
  word boundary at minimum, prefer the last complete sentence that fits within budget, and only
  append an ellipsis when text was actually cut.
- **Never let a data-quality failure surface as content.** If a field extracted from an external
  source (a README, a CMS, a scrape) doesn't look like what it's supposed to be — a bare URL
  where a description belongs, a sentence fragment where a tag belongs, an empty string where a
  name belongs — fall back to a sane default rather than rendering the garbage. The fallback
  path is part of the design, not an afterthought for engineering to handle.
- **A capped or "top N" display is only trustworthy if what's being ranked is real.** Capping a
  list to "top 5 most frequent" is meaningless if the underlying extraction is broken — you'll
  confidently display the 5 most-frequent pieces of garbage. Fix extraction before adding
  display limits on top of it.
- **Auxiliary panels must earn their space.** A detail drawer, sidebar, or modal that mostly
  repeats what's already visible on the element the user just interacted with is a UX cost
  (reduced density, more clicks, more scrolling) with no offsetting benefit. Before adding or
  keeping a secondary panel, name the specific new information it provides that isn't already
  on the primary surface — if you can't name it, cut the panel.
- **Repeated near-duplicate content should be grouped, not listed.** If a data set naturally
  produces near-identical rows (the same template applied across several parameters — "for AWS
  services" / "for GCP services" / "for Azure services"), collapse them into one row with a
  disclosure for the variants. Listing them separately in full turns scanning into fatigue and
  quietly increases the effective length of every list on the page.
- **Visual state must track logical state.** An accent color, active border, or bold weight
  applied to a list item must always correspond to a real state change (selected, expanded,
  current). If a sibling item in a repeated list renders differently with no corresponding state
  difference, that's a bug, not a stylistic accent — audit every conditional className applied
  inside a `.map()` for this before shipping.
- **Decorative visuals still need to be grounded in the subject** (see section 1). A generic 3D
  globe, abstract gradient blob, or stock "network" illustration signals "template" even when
  everything else about the page is bespoke — a visual built from the product's own real
  structure (an actual dependency graph, a commit timeline, a terminal transcript) costs the
  same to build and earns far more trust from a technical audience.

## 9. Process: plan → critique against the brief → build → self-critique

1. **Plan first, in writing**: a compact token proposal (color/type/layout/motion) plus one or
   two ASCII wireframes for the primary layout concept, before any code.
2. **Critique the plan against section 6** before building: if it resembles what you'd produce
   for any generic brief in this category, revise the specific axis that's generic and note
   what changed and why.
3. **Build**, keeping selector specificity clean — watch for type-based and element-based CSS
   selectors canceling each other out (a common source of "why isn't my padding token working"
   bugs).
4. **Self-critique before calling it done**: responsive down to mobile, visible keyboard focus
   that matches the focused element's shape, reduced motion respected, color contrast checked
   (not eyeballed), and one deliberate moment of boldness with everything else disciplined
   around it. If in doubt, remove one decoration rather than add one more.
5. **Run the section 8 UX-correctness checklist against real data**, not placeholder/lorem
   content. A design that looks perfect with three clean sample rows and breaks on the 40th real
   row (mid-sentence truncation, a scraped garbage field, a stray active state) has not actually
   been finished — test against the messiest real records in the data set, not the cleanest.