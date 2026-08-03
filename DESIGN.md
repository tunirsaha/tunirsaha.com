---
name: Tunir Saha Portfolio
description: A brutalist HUD/terminal portfolio — flat color blocks, hard edges, oversized display type, zero dependencies.
colors:
  paper: "#edeae2"
  paper-2: "#e4e0d5"
  ink: "#100f0d"
  ink-2: "#3a3833"
  accent-ultramarine: "#2436ff"
  accent-on-ink: "#8899ff"
  signal-orange: "#ff4d00"
  dark-paper: "#15151c"
  dark-ink: "#e9e7df"
  dark-accent: "#7c88ff"
  dark-signal-orange: "#ff6a2b"
typography:
  display:
    fontFamily: "Archivo Black, system-ui, sans-serif"
    fontSize: "clamp(2.6rem, 13vw, 7rem)"
    fontWeight: 400
    lineHeight: 0.86
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Archivo Black, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 6.5vw, 2.6rem)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Space Grotesk, system-ui, sans-serif"
    fontSize: "clamp(1rem, 3.4vw, 1.15rem)"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  label:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.05em"
rounded:
  none: "0"
  full: "50%"
spacing:
  hairline: "2px"
  sm: "0.6rem"
  md: "1rem"
  lg: "1.6rem"
  pad: "clamp(1.1rem, 5vw, 4.5rem)"
components:
  button-cta:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0.5rem 0.8rem"
  button-cta-hover:
    backgroundColor: "{colors.accent-ultramarine}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
  card-signal:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
    padding: "1.5rem"
  chip-tag:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
    padding: "0.35rem 0.65rem"
  themer:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    size: "42px"
---

# Design System: Tunir Saha Portfolio

## 1. Overview

**Creative North Star: "The Instrument Panel"**

This is a portfolio built like a piece of field hardware — a HUD you'd find bolted to something that ships. Flat color blocks, 2px hard rules, oversized industrial display type, a boot sequence on load, live telemetry pulled from real feeds, and section framing borrowed from mission control (WHAT I BUILD, WORK HISTORY, LIVE STATS, THE LAB). Nothing here is decorative for its own sake: the boot loader, the schematic, the contribution heatmap and the ticker all *do work*. The medium is the proof — the site is hand-coded, zero-dependency, no build step, and it wants you to view source.

The register is **brand**: the design *is* the product. It is deliberately **bold, experimental and loud**, but loudness never beats legibility — a recruiter or client skimming in ten seconds must still parse the hierarchy instantly. Surfaces alternate hard between paper (warm bone) and ink (near-black) so each section reads as its own panel. One ultramarine carries every interactive and structural accent; one signal orange is reserved strictly for "live / now / status heat."

It explicitly rejects the **generic SaaS/template landing page** (cookie-cutter card grids, soft rounded corners, ghost-shadow cards, stock "modern startup" hero) and the **corporate / LinkedIn-bland résumé-in-HTML** look (stiff enterprise tone, stock photography, safe centered columns). This is the current, correct direction — push *within* the brutalist-HUD lane; never soften into a safer look.

**Key Characteristics:**
- Zero border-radius — every corner is square (the `.dot` status light is the only circle).
- Hard-offset shadows only (`Npx Npx 0`), never blurred.
- Two signals, no more: ultramarine (interactive/structural) + orange (live/status).
- Alternating paper ↔ ink panels with a matching light/dark theme flip.
- Every effect is informational: boot, schematic, heatmap, telemetry, ticker.

## 2. Colors

A two-surface, two-signal system: a warm bone paper and a near-black ink, punctuated by one saturated ultramarine and one signal orange. Both surfaces invert cleanly for the dark theme.

### Primary
- **Ultramarine** (`#2436ff`): The single interactive + structural accent — nav numbers, links on hover, the second line of the name (SAHA), skill percentages, the CONTACT surface fill, the mobile menu background, focus-adjacent emphasis. On dark-ink panels it lightens to **Accent-on-Ink** (`#8899ff`) to hold ≥4.5:1 text contrast. In the dark theme it lifts to `#7c88ff`.

### Secondary
- **Signal Orange** (`#ff4d00`, dark theme `#ff6a2b`): Reserved *exclusively* for live/now/status — the blinking `.dot`, the "ONLINE" status word, the strikethrough rule, the schematic pulse, the HUD cursor center. It never appears as a general decorative accent.

### Neutral
- **Paper** (`#edeae2`) / **Paper-2** (`#e4e0d5`): The base body surface (warm bone) and a slightly deeper variant for subtle layering. Also the text/foreground color *on* ink panels.
- **Ink** (`#100f0d`) / **Ink-2** (`#3a3833`): Near-black primary text on paper, and the fill for alternating `.block--alt` panels. Ink-2 is muted body/secondary text.
- **Dark theme flips**: base becomes charcoal (`#15151c`), text becomes warm off-white (`#e9e7df`) — the same roles, inverted.

### Named Rules
**The Two-Signal Rule.** There are exactly two signals. Ultramarine means *interactive or structural*. Orange means *live / now / status heat* and nothing else. If a new element needs a third color, it doesn't — it needs one of these two or a neutral.

**The Inversion Rule.** `.block--alt` panels flip to an ink background. On those panels the accent MUST shift to Accent-on-Ink (`#8899ff`); raw ultramarine on ink fails contrast. This flip is already wired for every static label class — extend it, never bypass it.

## 3. Typography

**Display Font:** Archivo Black (with system-ui, sans-serif)
**Body Font:** Space Grotesk (with system-ui, sans-serif)
**Label/Mono Font:** JetBrains Mono (with ui-monospace, monospace)

**Character:** A heavy industrial grotesque for headlines, a clean geometric-humanist sans for reading, and a monospace for every piece of instrumentation (labels, coordinates, timestamps, tags). The three pair on a hard contrast axis — weight/width and proportional/mono — never two similar sans.

### Hierarchy
- **Display** (Archivo Black 400, `clamp(2.6rem, 13vw, 7rem)`, lh 0.86, `-0.02/-0.03em`): Section titles and the hero name. Set in uppercase, tight leading, deliberately oversized.
- **Headline** (Archivo Black 400, `clamp(1.5rem, 6.5vw, 2.6rem)`, lh 1): Accordion roles, lab card names, capability headings, live-stat numbers.
- **Title** (Archivo Black 400, `1.4rem`, uppercase): Small panel titles (signal titles, kicker labels via `.tk__lbl`).
- **Body** (Space Grotesk 400, `clamp(1rem, 3.4vw, 1.15rem)`, lh 1.55, color Ink-2): Paragraphs and list copy. Line length capped ~48–75ch depending on context.
- **Label** (JetBrains Mono 500, 13–15px, `0.04–0.12em`, uppercase): All instrumentation — nav, meta, timestamps, tags, coordinates, status. The mono is the "machine voice" of the interface.

### Named Rules
**The One-Weight Display Rule.** All display type is Archivo Black at weight 400 — its single native weight. Never fake bold/black on another family for headings; the weight *is* Archivo Black.

**The Machine-Voice Rule.** Every label, number, timestamp, tag and coordinate is set in JetBrains Mono, uppercase, tracked. Mono = data/instrumentation; the proportional sans is only for prose.

**The A11y Floor Rule.** No text below 13px (`--fs-xs`). The old 9–11px micro-labels are forbidden; the floor tokens (`--fs-xs:13`, `--fs-sm:14`, `--fs-md:15`) exist to enforce it.

## 4. Elevation

The system is **flat with hard-offset shadows** — there is no soft, blurred, ambient elevation anywhere. Depth is conveyed two ways: (1) alternating paper/ink panel surfaces separated by 2px rules, and (2) solid drop shadows offset with **zero blur** (`box-shadow: Npx Npx 0 <color>`), which read as die-cut sticker layers, not lifted cards.

### Shadow Vocabulary
- **Button/toggle shadow** (`box-shadow: 3px 3px 0 var(--ink)`): CTAs, theme toggle, contact links. On hover the offset grows (`4–5px`) and the element translates up-left to feel physically pressed forward.
- **Card shadow** (`box-shadow: 4px 4px 0 var(--ink)` / `5px 5px 0 var(--line-alt-2)`): Lab cards and signal panels.
- **Accent panel shadow** (`box-shadow: 10px 10px 0 var(--accent)`): The lab detail panel — a single loud, oversized ultramarine offset as a deliberate focal moment.

### Named Rules
**The Hard-Shadow Rule.** Every shadow is a solid color at zero blur radius (`Npx Npx 0`). Blurred, soft, or ambient shadows are forbidden — they read as generic SaaS and break the die-cut logic. If it needs a blur, it doesn't belong.

**The Zero-Radius Rule.** Every corner is square (`border-radius: 0`). The only exceptions are the 8px `.dot` status light and the mobile-menu divider — both `50%`/hairlines by necessity. Rounded cards, pills on cards, or any `border-radius ≥ 4px` on a panel violate the system.

## 5. Components

### Buttons
- **Shape:** Square (`border-radius: 0`), 2px solid border.
- **Primary / CTA** (`.topbar__cta`, `.contact__link`): Bordered in ink (or accent-ink on the contact surface), `3px 3px 0` hard shadow, mono uppercase 600.
- **Hover:** Fills ultramarine, text flips to paper, translates `-1/-2px` up-left, shadow grows to `4–5px`. Tactile "press-forward" feedback, not a fade.
- **Focus-visible:** 3px solid signal-orange outline, 3px offset — loud and honest for keyboard users (global rule, never removed).

### Chips / Tags (`.cap__tags li`)
- **Style:** 1px hairline border, transparent fill, mono uppercase 13px, square.
- **State:** On hover invert to paper fill / ink text. Used for tech-stack enumeration inside capability cards.

### Cards / Containers (`.sig`, `.exp`)
- **Corner Style:** Square (`border-radius: 0`).
- **Background:** Ink panels (signals) or paper (lab cards), matching the parent block surface.
- **Shadow Strategy:** Hard-offset only (see Elevation) — `4–5px Npx 0`.
- **Border:** 2px solid (paper on ink panels, ink on paper panels).
- **Internal Padding:** `1.4–1.5rem`.
- **Hover (lab):** Fills ultramarine, lifts `-2/-2px`, shadow grows to `6px`.

### Inputs / Fields
No form inputs exist in the current build (contact is a `mailto:` link, not a form). If added, follow the system: 2px solid border, square corners, no soft focus glow — use a border-color shift to ultramarine plus the standard orange focus-visible outline.

### Navigation (`.topbar`)
- **Style:** Fixed bar, 2px bottom rule, paper background, translates in after boot.
- **Typography:** Mono uppercase, each item prefixed with a two-digit number (`01`–`04`) in ultramarine.
- **States:** Hover → ultramarine text. Mobile → full-screen ultramarine overlay menu with Archivo Black links.
- **Signature detail:** The identity mark carries a `/UI-ENG` mono superscript in ultramarine.

### Signature Components
- **Boot loader:** Full-screen ink panel with a typed boot log, name, percentage counter and a fill bar; slides up on completion. The first impression and a proof-of-craft moment.
- **System schematic (`.schem`):** An inline SVG FRONTEND → BACKEND → HARDWARE loop with animated dashed flow lines and a pulsing node — visualizes the "one person, whole stack" thesis.
- **Live telemetry (`.sig`):** GitHub contribution heatmap, LeetCode and Chess.com panels pulling real data on load, with skeleton shimmer states. "Show, don't tell" made literal.
- **Ticker:** Full-bleed ink marquee of capability keywords in Archivo Black.

## 6. Do's and Don'ts

### Do:
- **Do** keep every corner square (`border-radius: 0`); reserve `50%` for the `.dot` status light only.
- **Do** use hard-offset shadows (`Npx Npx 0`) and grow the offset on hover for a press-forward feel.
- **Do** hold the two-signal discipline: ultramarine = interactive/structural, orange = live/status heat, nothing else.
- **Do** shift accent to Accent-on-Ink (`#8899ff`) on every `.block--alt` ink panel to keep text ≥4.5:1.
- **Do** set all instrumentation (labels, numbers, tags, timestamps) in JetBrains Mono, uppercase, tracked.
- **Do** make every effect informational — if a flourish carries no data, cut it (medium-is-the-proof).
- **Do** keep the reduced-motion path intact: content visible without JS, animations collapsed under `prefers-reduced-motion`.
- **Do** honor the 13px type floor and the loud orange focus-visible outline.

### Don't:
- **Don't** ship the **generic SaaS/template look** — no cookie-cutter identical card grids, no soft rounded corners, no ghost-shadow cards.
- **Don't** ship the **corporate / LinkedIn-bland résumé-in-HTML** — no stiff enterprise tone, no stock photography, no safe centered single column.
- **Don't** use blurred or ambient `box-shadow` (any nonzero blur radius). Solid-offset only.
- **Don't** pair a 1px border with a soft wide drop shadow ("ghost card") — it's the exact SaaS tell this system rejects.
- **Don't** introduce a third accent color; the palette is two signals plus neutrals by rule.
- **Don't** put raw ultramarine text on an ink surface (fails contrast) — use Accent-on-Ink.
- **Don't** fake a bold weight on the display face; Archivo Black is already the weight.
- **Don't** round card corners `≥ 4px` or pill-ify panels; that breaks the die-cut brutalist logic.
