# Drill — Guided Workflow · agent-side directions

**Ticket:** [Learning hub] Drill — Guided Workflow · P0 · `In review`
**Notion:** https://app.notion.com/p/37c7c8264656819dbc5dcdab7ebdb322
**Requirements contract:** [requirements.md](requirements.md)

---

## ⭐ Jun 16 run — progressive disclosure (LOCKED direction)

The **Jun 16 deep dive locked the agent-side direction to progressive disclosure** and
explicitly retired the information-dense view: *"keep role play on the left; the guided card
on the right, not the transcript… we do not want to show the transcript… progressive
disclosure is perfectly okay."* The card is a **moving three-position view** — previous /
current / next — "where was I / where am I / where am I going," updating as a second AI
checks steps off, order-agnostic, over the five universal stages **Open → Verify → Discover
→ Act → Close**.

This supersedes the Jun 15 **Inline / Assisted** cut (history preserved below + in git).
The three variants built this run are all progressive-disclosure; they differ only in **how
the prev/current/next card and the five stages are spatially structured**.

Constant across every direction (not a differentiator): the left role-play call column
(persona orb + mic/end + timer), the skipped-mandatory flag, Suggest-phrasing (Script), the
per-step Knowledge card, the deliberate "show all / completed" reveal, the live a11y region,
and the post-session eval + readiness-exclusion banner.

### The 9 directions

Scored 0–2 on rubric preferences decidable at concept stage, ×weight. Columns: UI-2 reuse (3)
· INT-1 affordance (3) · INT-2 drill-down (3) · UI-5 schema-container (2) · UI-6 highlight-
distinct (2) · UI-8 i18n-cards (2) · INT-3 one-primitive (2) · INT-5 empty/zero (2) · MOT-3
choreograph-focus (2) · MOT-6 restrained-easing (2). Gate-risk flags an approach that
structurally fights a gate.

| # | Band | Direction | Reuse·3 | Afford·3 | Drill·3 | Schema·2 | Hl·2 | i18n·2 | Prim·2 | Empty·2 | Focus·2 | Ease·2 | Σ/52 | Gate risk |
|---|------|-----------|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|---|
| **A1** | A·Safe | **Focus stack** — dimmed prev / prominent current / dimmed next, stage label + count, show-all | 6 | 6 | 6 | 4 | 4 | 4 | 4 | 4 | 6 | 4 | **48** | — |
| A2 | A·Safe | Current-only card, prev/next as breadcrumb pips | 6 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 6 | 4 | 44 | thin on prev-viewable (R3) |
| A3 | A·Safe | Two-row peek (current + next; prev behind show-completed) | 6 | 4 | 4 | 2 | 4 | 4 | 4 | 2 | 4 | 4 | 38 | drops prev-viewable (R3) |
| **B1** | B·Balanced | **Stage rail + focus** — 5-stage spine, focus stack under active stage, type/substeps/knowledge | 4 | 6 | 6 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | **44** | — |
| B2 | B·Balanced | Vertical stage timeline, steps nested, current expands | 4 | 4 | 4 | 4 | 2 | 2 | 4 | 4 | 2 | 4 | 34 | density fights progressive-disclosure |
| B3 | B·Balanced | Stage strip + assets in a right sub-drawer | 4 | 4 | 4 | 4 | 4 | 4 | 2 | 4 | 2 | 4 | 36 | second drawer ≠ one-primitive |
| **C1** | C·Ambitious | **Filmstrip / now-lane** — horizontal Prev∣Now∣Next that slides on check-off; knowledge flips in place; show-all overlay sheet | 4 | 6 | 4 | 4 | 4 | 4 | 4 | 4 | 6 | 4 | **44** | — |
| C2 | C·Ambitious | Conveyor arc — current at apex, prev/next on the ring | 2 | 4 | 4 | 2 | 2 | 0 | 2 | 2 | 4 | 2 | 24 | arc ≈ chart, label/contrast (G2/G8) |
| C3 | C·Ambitious | Ambient teleprompter — continuous prev-fades / next-rises scroll | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 4 | 0 | 20 | continuous motion fights MOT-5/6 + reduced-motion |

(Scores are concept-stage rubric *alignment*, not a build measurement — the evaluator
re-scores the built variants against all 13 gates + the full weighted table afterward.)

### The cut — top of each band

Selection rule = highest-scoring direction per band, guaranteeing the full Safe / Balanced /
Ambitious spectrum.

- **A · Safe — Focus stack (A1).** The most literal reading of the lock and the highest
  reuse: the existing left call column is untouched; the right panel becomes a vertical
  three-position card — a dimmed *previous* row, the prominent *current* step (Now pulse,
  Script reveal, Knowledge chip on complex steps), and a dimmed *next* row — with a stage
  label + progress count above and a deliberate "Show all steps" reveal. Lowest risk,
  ships now, clearest current-step affordance.

- **B · Balanced — Stage rail + focus (B1).** Adds one structural idea: a five-stage spine
  (Open → Verify → Discover → Act → Close) across the top of the guided panel for the
  at-a-glance "how far through the outcome am I," with the focus stack nested under the
  active stage. The current step gains its **type tag** (compliance / action / decision),
  **mandatory** badge, conditional **sub-steps**, Script, and a specific **Knowledge card**.
  Strongest orientation + schema-container read without going dense.

- **C · Ambitious — Filmstrip / now-lane (C1).** Rethinks the spatial model: the prev /
  current / next become a horizontal three-card **filmstrip** that physically **slides one
  lane left** each time a step checks off — the "where was I / where am I / where am I going"
  mental model made spatial through a single restrained continuity transition (≤300ms ease,
  disabled under reduced-motion). The Now card is centred + largest; prev/next are peeked and
  dimmed at the edges; the Knowledge card flips open in place; "show all" is an overlay sheet.
  The "I didn't think of that" option, still inside the rubric.

Rejected: C2 (arc ≈ chart, fails labelling/contrast intent), C3 (continuous motion fights
MOT restraint + reduced-motion), B2 (density contradicts the locked progressive-disclosure
brief). A2/A3 thin out the prev-viewable position the lock explicitly calls for.

### Requirements coverage matrix (top 3)

| Req | A · Focus stack | B · Stage rail | C · Filmstrip |
|-----|:--:|:--:|:--:|
| R1 role-play left / guided right | ✅ | ✅ | ✅ |
| R2 no transcript | ✅ | ✅ | ✅ |
| R3 prev/current/next moving view | ✅ | ✅ | ✅ |
| R4 live auto-check-off | ✅ | ✅ | ✅ |
| R5 order-agnostic | ✅ | ✅ | ✅ |
| R6 skipped-mandatory flag | ✅ | ✅ | ✅ |
| R7 Script / Suggest phrasing (logged) | ✅ | ✅ | ✅ |
| R8 Knowledge card on complex steps | ✅ | ✅ | ✅ |
| R9 deliberate show-all / completed | ✅ | ✅ | ✅ |
| R10 eval + readiness-exclusion banner | ✅ | ✅ | ✅ |
| R11 eval tracks skip / #scripts / branch | ✅ | ✅ | ✅ |
| R12 "drill without the wheel" CTA | ✅ | ✅ | ✅ |
| R13 safety-on + session N/M header | ✅ | ✅ | ✅ |
| R14 stays focused on the call | ✅ | ✅ | ✅ |
| V1 five stages surfaced | ⚠️ stage label only | ✅ full spine | ⚠️ ambient progress |
| V2 step type + mandatory | ✅ | ✅ | ✅ |
| V3 sub-steps under current | ✅ | ✅ | ✅ |
| V4 step primary, assets secondary | ✅ | ✅ | ✅ |

V1 is the deliberate band variation: Safe shows the stage as a label, Balanced gives the full
five-stage spine, Ambitious carries it as ambient progress — the spectrum lives in the
orientation surface, not in dropping a functional requirement. No ❌ on any R-item.

### Build assessment (design-evaluator, Jun 16)

All three pass **13/13 gates** and land **Handoff-ready**. One refine pass closed the named
weak items (INT-5 edge copy on A/B, MOT-2/MOT-3 lane-focus on C, the C sheet-scrim token, and
the UI-7 identity-vs-snapshot header split across all three); the top variant gained < 5
points, so the loop converged after one pass.

| Variant | Band | Gates | Weighted % (pass 1 → refined) | Reqs | Verdict |
|---------|------|:-----:|:-----------------------------:|:----:|---------|
| A · Focus stack | 🟢 Safe | 13/13 | 91% → ~93% | 25/25 ✅ | Handoff-ready |
| B · Stage rail | 🟡 Balanced | 13/13 | 93% → ~95% | 25/25 ✅ | Handoff-ready (strongest) |
| C · Filmstrip | 🔴 Ambitious | 13/13 | 88% → ~91% | 25/25 ✅ | Handoff-ready |

Carried (low-weight, surfaced not silently fixed): **WCAG-8** — the fixed two/three-column
body is untested at 200% zoom on the ≥1260 desktop surface (mobile is a flagged later layer,
C4). **G1 token gap** routed to Akash: no `:root` scrim/overlay token for modal backdrops —
the C sheet uses `color-mix(--color-text-deep 18%)` as a bound stand-in pending a real token.

---

## Prior history — Jun 15 Inline / Assisted cut (superseded)

> Retired by the Jun 16 lock above; kept for the audit trail and recoverable from git.
> The shipped switcher before this run carried **Inline** and **Assisted**.

| Chip | Direction | One-liner |
|------|-----------|-----------|
| **Sidecar** | D1 | Persistent right-rail checklist, live check-off + skip flags |
| **Coach** | D5 | Single current-step coach card, minimal load |
| **Spine** | D3 | Top progress stepper, branch lights up, expand for detail |
| **Inline** | D2 | Guidance in the chat, no side panel; CTA reveals the full step-by-step guide |
| **Assisted** | E | Two-column persona-call + Guided Workflow with phase strip, auto-detected tags, current-step sub-checklist, peek-phrasing, branch paths. Evaluator: 13/13 gates, 92%, Handoff-ready. |

The Jun 15 exploration scored 10 directions (Sidecar/Coach/Spine top three) against the
rubric; Umesh's review trimmed the runtime switcher to Inline + Assisted. The Jun 16 deep
dive then moved the whole agent-side direction to progressive disclosure, so those variants
were rebuilt rather than extended.
