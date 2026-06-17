# Drill — Guided Workflow · agent-side in-drill view (progressive disclosure)

**Ticket:** [Learning hub] Drill — Guided Workflow · **P0** · "In review with PM & Neil"
**Notion:** https://app.notion.com/p/37c7c8264656819dbc5dcdab7ebdb322
**Run:** Jun 16 — rebuild against the **locked** Jun-16 direction. Supersedes the
Jun-15 exploration (Sidecar/Coach/Spine/Inline/Assisted), preserved in git history.

## The locked frame (Neil, Jun 16 — not a free divergence)
- **Progressive disclosure**, NOT the dense assisted view. **No transcript** (distracting).
- Role play on the **left**; a **guided card** on the right that is a **moving
  three-position view** — *previous · current · next* step ("where was I / where am
  I / where am I going"), auto-updating as the AI checks steps off (order-agnostic).
- **Three per-step assets:** Step (always) · Script (phrasing) · Knowledge card
  (a *specific* linked card, complex steps only); "learn more about this step" if stuck.
- **Five stages:** Open → Verify → Discover → Act → Close. Step types: compliance /
  action / decision; mandatory vs optional.
- Viewing **all / completed** steps is a **deliberate** action — never forced.
- Label "AI-assisted mode" up top; post-call eval card + safety-wheel banner stay.

So the 10 directions are **takes on the three-position card within this lock** — not
ten different surfaces. Constant across all: the left role-play column, the stage
strip, the per-step asset reveal, the deliberate "show all/completed", and the eval.

## The 10 directions

Scored 0–2 ×weight on the concept-decidable rubric items: UI-2 reuse (3) · INT-1
affordance (3) · INT-2 drill-down (3) · UI-6 highlight-distinct (2) · UI-7 hero-vs-meta
(2) · INT-3 one-primitive (2) · INT-5 empty/zero (2) · MOT-3 choreograph-focus (2).

| # | Direction | Reuse·3 | Afford·3 | Drill·3 | Hl·2 | Hero·2 | Prim·2 | Empty·2 | Focus·2 | Σ/38 | Gate risk |
|---|-----------|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|---|
| **D1** | **Triptych** — vertical prev/current/next stack | 6 | 6 | 6 | 4 | 4 | 4 | 4 | 4 | **38** | — |
| **D2** | **Focus** — current only, prev/next peek chips | 4 | 6 | 4 | 4 | 4 | 4 | 4 | 6 | **36** | — |
| **D3** | **Filmstrip** — horizontal prev·current·next, slides | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | **32** | — |
| D4 | Asset tabs (Step/Script/Knowledge tabs on current) | 6 | 4 | 2 | 2 | 4 | 4 | 2 | 4 | 30 | tabs hide assets (INT-2) |
| D5 | Stage accordion (5 stages, active expands) | 4 | 4 | 4 | 2 | 2 | 4 | 4 | 2 | 28 | — |
| D6 | Ledger feed (steps stream + pulse on current) | 4 | 4 | 2 | 4 | 2 | 2 | 4 | 4 | 26 | "feed" fights three-position focus |
| D7 | Split current (instruction left / assets right) | 4 | 4 | 2 | 2 | 4 | 2 | 2 | 4 | 24 | sub-split crowds the right panel |
| D8 | Full vertical timeline (all steps, window highlit) | 4 | 4 | 4 | 2 | 2 | 2 | 2 | 0 | 22 | shows all by default — breaks the lock |
| D9 | Card-stack / swipe to advance | 2 | 2 | 2 | 2 | 2 | 0 | 2 | 0 | 12 | motion reads playful (MOT-5/6) |
| D10 | Stage progress ring + current card | 2 | 2 | 4 | 2 | 2 | 2 | 2 | 2 | 18 | ring ≈ chart, contrast/table (G2/G8) |

## The cut — why these 3

Three distinct spatial models of the same locked three-position card, all reusing
`Card`/`Button`/tokens, none breaking the "don't force all steps" lock or a gate:

- **A — Triptych (D1).** Top score. Literal vertical *previous → current → next* stack:
  previous done+collapsed at top, **current** prominent in the middle (Step + Script +
  Knowledge card + type/mandatory), next peeked at the bottom. Cleanest hierarchy
  (UI-7), clearest "where am I" mental model, highest reuse.
- **B — Focus (D2).** The minimal-load opposite: only the **current** step is rendered
  large/centred; previous and next collapse to one-line peek chips. Best embodies
  Neil's "don't overload — show only what's relevant now" (MOT-3). Distinct in kind.
- **C — Filmstrip (D3).** A horizontal **prev · current · next** strip that slides left
  as steps check off — current card emphasised. A third spatial model (horizontal vs
  the two vertical ones) and the most literal "moving" reading of the three-position view.

Runners-up: D4 (asset tabs) and D5 (stage accordion). Rejected on gate/lock risk:
D8 (forces all steps), D9 (playful motion), D10 (ring ≈ chart).

## Switcher legend (for the Notion post)
| Chip | Direction | One-liner |
|------|-----------|-----------|
| **Triptych** | A / D1 | Vertical prev/current/next stack, current prominent |
| **Focus** | B / D2 | Current step only, prev/next as peek chips — least overload |
| **Filmstrip** | C / D3 | Horizontal prev·current·next, slides as steps check off |

## Follow-up pass — assets + the four AI-behaviour scenarios

Layout unchanged (3 variants above); the shared guide gained the content the
overall experience must cover:

**Per-step assets (shown on the current step):**
- **Step** — primary (the largest element; type tag + mandatory).
- **Script support** — the greet step breaks the script into labelled beats:
  *Greet · Self-identify · Warm greeting · Acknowledge*.
- **Knowledge cards** — a *stack* of specific linked cards (e.g. "IPC tariff
  policy" / "Past cases (3)"), opened on demand; "learn more about this step".

**Four AI-behaviour scenarios — made demonstrable via an "AI behaviour · demo"
control** in the guide panel (meta tooling, like the variant switcher):
1. **Active listening** — AI hears a configured step, checks it off, projects next.
2. **Not tracked (blind)** — talk that isn't a configured step → the listening
   pill flips to "not a tracked step" and a note says nothing is logged.
3. **Show remaining** — opens the deliberate full-step list (never forced).
4. **Review AI corrects** — a step the live AI missed is logged in the background
   by a second AI (success banner + a "Review AI" tag on the step); the agent
   never corrects it manually.
