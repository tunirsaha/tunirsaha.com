# Product

## Register

brand

## Users

Two human readers, weighted equally:

- **Employers** — recruiters, engineering managers and tech leads screening for a senior/lead frontend or full-stack hire. They arrive skeptical, skim fast, and want proof of depth (11 years, real companies: FICO, IBM, Accenture, Cognizant) before they invest attention.
- **Clients & founders** — people who need something built end-to-end and are deciding whether one person can own frontend, backend and the hardware in between. They care about range and about "ships things that survive real users."

Both land on `/` (single-page site), scan the hero for signal, and either bounce or reach the contact CTA. Success = they email `sahatunir@gmail.com` or open a profile link (GitHub / LinkedIn / LeetCode).

There is also a third reader, and increasingly it reads first:

- **Answer engines** — ChatGPT, Claude, Perplexity, Google AI Overviews. They arrive before the human does, and what they extract is what the human is shown. They do not scroll, hover, or run a click handler. Success = the model can state the role, the range and the contact route correctly, and cite `https://tunirsaha.com/` for it.

This reader constrains design, not just markup: anything reachable only through a JS interaction is invisible to it. Whenever a navigational affordance is a `<button>`, the same destination must also exist as a real `<a href>` somewhere in the document — see **The Parallel Path Rule** in DESIGN.md.

## Product Purpose

A single-page personal portfolio for Tunir Saha — UI engineer / systems builder. It exists to convert a cold visitor into a conversation by proving, not asserting, full-stack range (screen → server → device) and eleven years of shipped work. The site itself is the proof: hand-coded, zero dependencies, no build step, no template. The medium is the message — a portfolio that demonstrates the craft it claims.

## Brand Personality

**Bold · experimental · loud.** A brutalist HUD/terminal aesthetic — flat color blocks, hard edges, oversized display type, a boot sequence, live telemetry, mission/arsenal framing. The voice is confident and receipts-first ("If it can't be demoed, it isn't done" · "things that survive contact with real users"), with dry technical wit. It should feel like an instrument panel built by someone who enjoys building instrument panels — memorable and opinionated, never cautious. Emotional goal: *this person clearly has taste and can obviously build.*

## Anti-references

- **Generic SaaS / template landing pages** — cookie-cutter card grids, stock "modern startup" hero, Bootstrap defaults.
- **Corporate / LinkedIn-bland** — résumé-in-HTML, stiff enterprise tone, stock photography.
- The current brutalist-HUD direction is correct. Refine and push *within* it; do not restart or soften into a safer look.

## Design Principles

1. **Show, don't tell.** Live feeds, real logos, a working boot sequence — the site earns claims instead of stating them. Every effect should carry information, not just decorate.
2. **The medium is the proof.** Zero deps, hand-rolled motion, no build step — the craft of the site *is* the portfolio. Keep it self-evidently hand-built.
3. **Loud, but legible.** Bold and experimental never wins over readability. Oversized type and heavy contrast stay in service of a reader skimming in ten seconds.
4. **One person, whole stack.** Every section reinforces the frontend → backend → hardware loop. That range is the core differentiator; don't dilute it.
5. **Honest over impressive.** Dated build log, "some abandoned mid-solder," strikethrough copy. Candor is the brand — no inflated claims.

## Accessibility & Inclusion

- Target **WCAG 2.1 AA**. Body text ≥4.5:1, large text ≥3:1, in both light and dark themes.
- Existing floors to preserve: minimum font sizes (`--fs-xs:13px`), loud focus-visible outlines, `prefers-color-scheme`-aware theming with a manual toggle.
- Motion must honor `prefers-reduced-motion` — the reveal/stagger/scramble system needs a fail-safe (content visible without JS, calm alternative when reduced).
- Signal orange + ultramarine must not be the *only* channel for status/live state; pair color with text or shape.
