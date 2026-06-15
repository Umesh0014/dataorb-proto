# Drill — Guided Workflow (assisted "safety wheel" mode)

**Ticket:** [Learning hub] Drill — Guided Workflow (assisted "safety wheel" mode) · P1 · `Inprogress`
**Notion:** https://app.notion.com/p/37c7c8264656819dbc5dcdab7ebdb322
**Surface built:** the **live guided drill experience** (agent-facing) + its post-session eval
banner. Chosen with Umesh over the team-lead authoring tool (Neil still sending HTML
reference screens for that) and the standalone eval surface (narrower).

This file is the audit trail for the divergence: 10 directions, scored against
`design-guidelines.md`, culled to the 3 that were built behind the switcher.

---

## What the surface must do (from the brief)

- Agent converses with a simulated customer; **a second AI listens and checks off the
  steps** of the conversation's guided workflow (greeting ✓, verification ✓, …) in real
  time, and **flags skipped mandatory steps** ("no evidence found").
- A **Suggest phrasing** affordance the agent can pull mid-call (e.g. how to de-escalate).
- The workflow is a **branching call path** (who's on the line → validation →
  bill-higher → IPC tariff → churn signal? → offer → agreement → close).
- After the call, the eval shows the result **but a banner makes clear the score is NOT
  counted toward the readiness profile** (safety-on = new "assisted mode" exclusion,
  mirroring calibration mode), with a CTA: "ready to drill without the training wheel?"
- The agent must **stay focused on the call** — detection happens behind the scenes.

Constant across every direction (not a differentiator): the live conversation column,
the mic/end controls, the skipped-mandatory flag, suggest-phrasing, and the post-session
eval + exclusion banner. The directions differ in **how the live guidance is structured
and surfaced**.

---

## The 10 directions

Scored 0–2 on the rubric preferences decidable at concept stage, ×weight. Columns:
UI-2 reuse (3) · INT-1 affordance (3) · INT-2 drill-down (3) · UI-6 highlight-distinct (2)
· UI-8 multilingual-cards (2) · INT-3 one-primitive (2) · INT-5 empty/zero (2) · MOT-3
choreograph-focus (2). Gate-risk column flags any approach that structurally fights a gate.

| # | Direction | Reuse·3 | Afford·3 | Drill·3 | Hl·2 | i18n·2 | Prim·2 | Empty·2 | Focus·2 | Σ/48 | Gate risk |
|---|-----------|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|---|
| **D1** | **Sidecar checklist rail** (right panel, live check-off) | 6 | 6 | 6 | 4 | 4 | 4 | 4 | 4 | **42** | — |
| **D5** | **Coach focus** (one current step, peek-next) | 4 | 6 | 4 | 4 | 4 | 4 | 4 | 6 | **36** | — |
| **D3** | **Progress spine** (top stepper + expand) | 4 | 6 | 6 | 4 | 2 | 2 | 4 | 4 | **32** | — |
| D9 | Tabbed guidance (Steps / Phrasing / Path) | 6 | 4 | 2 | 2 | 4 | 4 | 4 | 4 | 30 | tabs hide path |
| D2 | Inline transcript annotations | 4 | 2 | 2 | 4 | 2 | 4 | 4 | 6 | 28 | color-only risk (G9) |
| D7 | Bottom HUD control bar | 2 | 4 | 4 | 4 | 2 | 2 | 4 | 4 | 26 | — |
| D6 | Split: checklist-primary left | 4 | 4 | 4 | 2 | 4 | 2 | 2 | 2 | 24 | — |
| D8 | Dedicated "skips" alert lane | 2 | 4 | 4 | 2 | 2 | 2 | 6 | 2 | 24 | thin without a base layout |
| D4 | Branching call-path flowchart | 2 | 2 | 4 | 2 | 0 | 2 | 2 | 2 | 16 | node-graph ≈ chart, fails table-export + contrast (G2/G8) |
| D10 | Card-stack / swipe-to-advance | 2 | 2 | 2 | 2 | 2 | 0 | 2 | 0 | 12 | motion reads playful, fights MOT-5/6 restraint |

(Scores are concept-stage rubric *alignment*, not a build measurement — the evaluator
re-scores the built variants against all 13 gates + the full weighted table afterward.)

---

## The cut — why these 3

The trio is chosen for **rubric score AND structural variety**: three genuinely different
spatial models (right rail / centred card / top spine), each leaning into a different user
problem, and all three reuse `GuideSessionPage`'s full-bleed session shell + existing
primitives with no gate risk.

- **A — Sidecar checklist rail (D1).** Top score. The comprehensive, reference-grade view:
  a persistent right panel mirrors `GuideSessionPage`'s push-in `SourcesPanel`, listing
  every workflow step with live check-off, mandatory badges, the skipped-step flag, and
  Suggest-phrasing inline on the active step. Highest reuse, clearest affordances, every
  step is a schema container (UI-5). Wins on the "did I hit my goal" comprehensiveness axis.

- **B — Coach focus (D5).** The opposite philosophy: surface **only the current step** as a
  prominent coach card with a peek at what's next, so the agent's attention stays on the
  call (MOT-3, "one thing at a time"). The full checklist is a secondary reveal. Lowest
  cognitive load; best embodies "stay focused on the call, detection happens behind the
  scenes." Distinct from A in kind, not just layout.

- **C — Progress spine (D3).** A horizontal stepper across the top gives the Apple-Watch-ring
  "how far through the outcome am I" read at a glance; each step expands to its detail and
  the branch lights up live. Strongest at-a-glance orientation and drill-down
  discoverability, and a third distinct spatial model (top vs. side vs. centre).

Runners-up D9 (tabbed) and D2 (inline) are the next iteration candidates if Umesh wants a
fourth; D4 and D10 are rejected on gate risk and are not worth building.

---

> **Final cut (per Umesh's review):** the shipped switcher carries only
> **Inline** and **Assisted**. Sidecar, Coach and Spine were explored and
> reviewed (history below + in the branch's git log) but removed from the
> runtime switcher before the merge to keep the two directions Umesh chose.

## Switcher legend (for the Notion post)

| Chip | Direction | One-liner |
|------|-----------|-----------|
| **Sidecar** | A / D1 | Persistent right-rail checklist, live check-off + skip flags |
| **Coach** | B / D5 | Single current-step coach card, minimal load |
| **Spine** | C / D3 | Top progress stepper, branch lights up, expand for detail |
| **Inline** | D / D2 | Added in review — guidance lives in the chat, no side panel; a CTA reveals the full step-by-step guide |
| **Assisted** | E | Added in review from Umesh's supplied HTML reference — two-column persona-call + Guided Workflow with a phase strip, auto-detected step tags, a current-step sub-checklist (nested "dos"), peek-phrasing, and the branch paths the listener is waiting on. Rebuilt on DataOrb tokens. Evaluator: 13/13 gates, 92%, Handoff-ready. |
