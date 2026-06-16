# Drill — Guided Workflow: 10 Design Directions (Rev 2)

**Ticket:** [Learning hub] Drill — Guided Workflow
**Surface:** Agent-side in-drill experience — how the guided workflow steps surface during a live role-play call
**Scored against:** `design-guidelines.md` (13 gates, 104-point weighted rubric)
**Date:** 2026-06-16
**Replaces:** Rev 1 directions (Sidecar/Coach/Spine/Inline/Assisted explored pre-Jun-16 lock)

## Locked constraints (Jun 16 session — non-negotiable)

1. **Progressive disclosure** — previous/current/next three-position view
2. **No transcript** in the guided view — distracting, no purpose
3. **Step / Script / Knowledge-card** triplet per step
4. **Five universal stages:** Open → Verify → Discover → Act → Close
5. Conversation left, guided card right (not transcript)
6. "Show all / show completed" is a deliberate action, never forced
7. Flat checklist, NO branching flowcharts
8. The guided workflow AI is order-agnostic — checks steps off when evidence found

## What varies across directions

Given the locked decisions, the degrees of freedom are:
- HOW the three-position view is rendered (stacking, sliding, carousel, etc.)
- WHERE the phase strip lives and how prominent it is
- HOW script + knowledge-card are accessed (inline, accordion, popover, drawer)
- The RATIO between conversation space and guidance space
- HOW "show all steps" surfaces when the agent needs it

---

## The 10 directions

### D1 — Vertical Card Stack

Three cards stacked vertically in a right panel (~40% width). Previous card: collapsed 1-liner (faded). Current card: expanded with step label, script accordion, knowledge-card link. Next card: partially visible (teased, 2 lines). Cards animate upward on step-advance (150ms ease). Phase breadcrumb at top of panel. "Show all steps" button at panel bottom.

**Reuse:** Card primitive, PhaseStrip, SuggestPhrasing, stepStateMeta helpers.
**User problem:** Direct mapping of Neil's "where was I / where am I / where am I going" mental model.

### D2 — Sliding Window

Right panel shows a single expanded step at a time. Previous and next steps are visible as thin strips (32px) above and below the current step, showing just the label + status icon. Clicking a strip scrolls it into the expanded position (300ms ease). The expanded step shows step + script + knowledge card inline. Phase strip at top.

**Reuse:** Card, step state helpers, existing phase components.
**User problem:** Maximum reading space for the current step's script and knowledge card — previous/next are present but don't compete for attention.

### D3 — Phase-Gated Columns

The 5 phases render as equal-width vertical columns in the right panel. Each column lists its steps as compact rows. The active phase column is highlighted and its active step is expanded (step + script + knowledge-card). Completed phases collapse to a check mark + phase name. The layout naturally shows "where in the arc" the agent is.

**Reuse:** PhaseStrip concepts, Card, step state helpers.
**User problem:** Phase awareness is primary — the agent sees the full conversation arc at all times, not just the step sequence.

### D4 — Coach Card + Phase Ribbon

Thin horizontal phase ribbon below the session header (40px). Below: the conversation column (left, 55%) and a single coach card (right, 45%). The coach card shows only the current step in full detail: step label, script (always visible), knowledge card (expandable). Below the card: a "peek-next" teaser line. Above the card: a small "previous step" summary. The ribbon pulses on the active phase.

**Reuse:** PhaseStrip, Card, SuggestPhrasing, Banner.
**User problem:** Minimal cognitive load — one thing at a time. The phase ribbon gives orientation; the coach card gives depth.

### D5 — Accordion Rail

Right panel (~38% width) lists ALL steps as collapsed accordion rows (label + status). The current step is auto-expanded showing step + script + knowledge card. Previous steps show green check + at-timestamp. The agent can expand any step to see its script + knowledge card. Phase section headers divide the list. Auto-scrolls to keep current step centered.

**Reuse:** Existing AssistedGuide structure (very close), PhaseStrip, Card.
**User problem:** Full context — the agent sees every step's status at a glance. Current step gets detail space. Agents who want to preview ahead or review behind can expand any row.

### D6 — Floating Focus Pill

No persistent right panel. A floating pill (200px wide, bottom-right, above VersionBar) shows the current step label + phase. Tapping it opens a 320px slide-in panel from the right edge (MOT-7) with the three-position view: previous (collapsed), current (expanded with script + knowledge card), next (teased). Phase strip at panel top. Dismissing the panel returns to the pill.

**Reuse:** Card, drawer enter-from-edge pattern, step state helpers.
**User problem:** Maximum conversation space. Guidance is one tap away but never covers the conversation unless the agent wants it.

### D7 — Split Header + Detail Drawer

The session header extends to include a compact step progress bar (dots for each step, colored by state). Below: full-width conversation. The current step's detail (step + script + knowledge card) opens in a right-edge drawer (300px) when the agent clicks the active dot or a "Current step" button in the header. The drawer shows the three-position view.

**Reuse:** Drawer pattern (MOT-7), step state dots, Card.
**User problem:** The progress bar gives constant progress awareness without consuming vertical space. Detail is on-demand via the drawer.

### D8 — Dual-Track Timeline

Right panel (~42% width) with two parallel vertical tracks: the left track is a thin timeline of all steps (dots + labels, 40px wide), the right track shows the expanded three-position view (prev/current/next cards). The timeline scrolls independently, and tapping any step on the timeline scrolls the cards to that position. Phase labels are inline on the timeline.

**Reuse:** Card, step state meta, PhaseStrip concepts.
**User problem:** Overview + detail side by side — the timeline is the "map", the cards are the "territory". Agents can jump to any step.

### D9 — Tabbed Guidance Panel

Right panel (~40% width) with 3 tabs at the top: **Guide** (the three-position step view), **Script** (the current step's full script, always visible, no accordion), **Knowledge** (the current step's linked knowledge card, full display). Only one tab active at a time. Phase strip below the tabs. The Guide tab is default; Script and Knowledge tabs light up with a badge when they have content for the current step.

**Reuse:** TabsRow, Card, PhaseStrip.
**User problem:** Each asset type (step, script, knowledge) gets full panel space — no cramming three things into one card. Clean separation of concerns.

### D10 — Contextual Inline Notes

No right panel. Guidance surfaces as contextual notes WITHIN the conversation column (similar to existing Inline variant but redesigned for the locked constraints). Instead of a transcript, the conversation column shows: the persona orb + controls on the left half, and on the right half, the three-position step view (prev/current/next) rendered as inline cards. Script + knowledge card are accordion items inside the current step card. Phase strip at the top of the right half.

**Reuse:** Existing Inline patterns, Card, PhaseStrip, SuggestPhrasing.
**User problem:** No split — everything lives in one flow. The conversation controls and the guidance are co-located. Works well for mobile-first (single column on narrow screens).

---

## Scoring (concept-level rubric alignment)

Scored 0–2 on weighted preferences decidable at concept stage, multiplied by weight.

| Dir | UI-2 Reuse (×3) | INT-1 Affordance (×3) | INT-2 Drill-down (×3) | UI-8 i18n (×2) | UI-9 Tab+sidecar (×2) | UI-10 Edit/dense (×2) | INT-3 One-prim (×2) | INT-5 Empty (×2) | MOT-7 Edge (×1) | INT-11 Task-first (×1) | Raw/42 | % | Gate risk |
|-----|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|---|
| D1 Vertical Card Stack | 6 | 6 | 6 | 4 | 4 | 4 | 4 | 4 | 2 | 2 | **42** | **100%** | None |
| D4 Coach Card + Phase Ribbon | 6 | 6 | 4 | 4 | 4 | 4 | 4 | 4 | 2 | 2 | **40** | **95%** | None |
| D5 Accordion Rail | 6 | 6 | 6 | 4 | 4 | 2 | 4 | 4 | 2 | 2 | **40** | **95%** | None |
| D2 Sliding Window | 4 | 6 | 4 | 4 | 4 | 4 | 4 | 4 | 2 | 2 | **38** | **90%** | None |
| D9 Tabbed Guidance | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 2 | 2 | **36** | **86%** | Tabs split triplet |
| D10 Contextual Inline | 4 | 4 | 4 | 4 | 2 | 4 | 4 | 4 | 0 | 2 | **32** | **76%** | No edge entry |
| D6 Floating Focus Pill | 4 | 4 | 2 | 4 | 4 | 4 | 4 | 4 | 2 | 2 | **34** | **81%** | INT-2: guidance hidden |
| D3 Phase-Gated Columns | 4 | 4 | 6 | 2 | 2 | 2 | 2 | 2 | 0 | 2 | **26** | **62%** | 5 columns is dense |
| D7 Split Header + Drawer | 4 | 2 | 4 | 4 | 4 | 4 | 4 | 4 | 2 | 2 | **34** | **81%** | INT-1: dots ambiguous |
| D8 Dual-Track Timeline | 2 | 4 | 4 | 2 | 2 | 2 | 2 | 2 | 0 | 2 | **22** | **52%** | Novel primitive, dense |

---

## Top 3 — why each won

### Winner A: D1 — Vertical Card Stack (100%)

Top score. Direct implementation of Neil's locked "moving three-position view." Three vertically stacked cards — previous (collapsed), current (expanded with script + knowledge-card), next (teased). Maximum rubric alignment: reuses Card/PhaseStrip/VersionBar, progressive disclosure IS the structural approach, drill-down is built into the card expansion, i18n-safe cards absorb text expansion naturally. The step/script/knowledge-card triplet maps 1:1 to the current card's sections.

### Winner B: D4 — Coach Card + Phase Ribbon (95%)

Structurally distinct from D1: a thin phase ribbon at the top + a single large coach card. The card shows ONLY the current step in full detail (step + script + always-visible knowledge card). Previous and next are minimal teasers above and below. Lowest cognitive load — one thing at a time, with the ribbon providing orientation. Best for agents who want to focus on execution, not awareness.

### Winner C: D5 — Accordion Rail (95%)

Tied score with D4, different philosophy: the full step list is always visible as collapsed accordion rows. Only the current step is auto-expanded. The agent sees every step's status at a glance and can expand any step to preview its script + knowledge card. Closest to the existing Assisted variant (maximum code reuse), upgraded with the script/knowledge-card triplet. Best for agents who want full context and the freedom to look ahead.

---

## Eliminated — reasons

| Dir | Score | Reason |
|-----|-------|--------|
| D2 Sliding Window | 90% | Good score but structurally similar to D1 — replaced by the stronger version |
| D9 Tabbed Guidance | 86% | Tabs split the step/script/knowledge-card triplet across views — fights the "one card per step" model |
| D6 Floating Focus Pill | 81% | Guidance hidden by default — new agents need the safety wheel visible, not behind a tap (INT-2) |
| D7 Split Header + Drawer | 81% | Dot affordances in the header are ambiguous (INT-1); the drawer is a good pattern but dots are risky |
| D10 Contextual Inline | 76% | No edge-entry motion; similar to the existing Inline variant that the Jun 16 lock supersedes |
| D3 Phase-Gated Columns | 62% | 5 vertical columns is too dense for a training surface; i18n expansion truncates column labels |
| D8 Dual-Track Timeline | 52% | Novel dual-track primitive has no precedent in the codebase; dense, hard to parse |
