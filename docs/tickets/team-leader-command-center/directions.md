# Team Leader Command Center — design directions audit

Ticket: **🧭 Team Leader Command Center (triage-to-coach home)** (Notion
`37e7c826-4656-8106-a1ea-fd2476bd0b2b`, P1).
Surface: a new cross-module **team-lead home** — a ranked triage queue of *Attention
Items* `(agent × driver/competency × signal → recommended intervention)` that the TL
works top-down: act, snooze, dismiss — then the item closes the loop
(Open → Acted → Improved / No-change). Renders inside `PageLayout`; composes shipped
primitives (`StatCard`, `Card`, `Button`, `InlineStatusAffordance`, `Banner`,
`MetricSparkline`, `Modal`, `Toast`). No new layout system.

Mounted in the prototype as a Learning Hub rail route `/learning/command-center` so the
preview is reachable. **The IA placement question (dedicated Home rail item vs.
role-aware default route) is a product decision — routed to Akash/Neil, not resolved
here** (rubric G7 / INT-10).

## The 10 directions

Scored on the concept-decidable rubric items only (UI-2 reuse, INT-1 affordance, INT-2
drill-down, UI-5 schema/containers, UI-6 highlight-distinct, UI-7 identity vs params,
UI-8 multilingual cards, UI-9 tabular+sidecar, UI-10 editorial vs density, INT-3 one
primitive, INT-5 empty states, INT-7 AI-as-starting-state). 0/1/2 per item; build-time
gates (contrast, focus, ARIA, charts-as-table) are verified at the build/assess step,
not here. Gate-*risk* of the approach is noted separately.

| # | Direction | Idea in one line | Concept score | Gate risk |
|---|-----------|------------------|:-------------:|-----------|
| 1 | **Ranked triage queue + sidecar** | One severity-ranked worklist of attention-item cards; per-item launch; detail opens in a drawer | **High** | none — canonical read of the brief |
| 2 | **Loop pipeline board** | Kanban lanes = the loop itself (Needs attention → Acted → Improved → No change); reuses the Missions lane visual | **High** | 4 lanes inside 1068 is tight — compact cards + scroll-x |
| 3 | **Monday-morning focus digest** | Editorial: one hero "do this first" action + a short ranked list + a "this worked" recap | **High** | none — editorial column, white surface (UI-10) |
| 4 | Master–detail two-pane | Left ranked list, right persistent detail pane (email-client triage) | Med-high | near-duplicate of #1's sidecar; pinned pane tensions UI-9 "keep primary scannable" |
| 5 | Group-by-agent roster accordion | Primary axis = agent; collapsible rows of that agent's items | Med-high | ranking gets buried under the roster grouping (INT-2 weaker) |
| 6 | Driver/Competency coverage matrix | Competency × severity heatmap, drill into agents per cell | Med | brief flags coverage may be org-level (open Q); analytical lens under-serves "do this next" |
| 7 | Dashboard + triage rail | Dense KPI/top-bottom dashboard on top, queue below | Med-high | overlaps #1's team strip; risks "everything highlighted" (UI-6) |
| 8 | Severity-banded stack | Single column sectioned into High / Med / Low bands | Med-high | a layout variation on #1, not a distinct mental model |
| 9 | Attention-item card grid | Responsive grid of NBA-style cards | Med-low | a grid loses ranked scan order; near-clone of the existing NBA rail |
| 10 | Loop-first "This worked" scoreboard | Lead with outcomes/recap, queue secondary | Med | inverts the brief — the *queue* is the home, not the scoreboard |

## The cut — top 3

Chosen for **three genuinely distinct mental models** (operational / pipeline /
editorial) that each score well and share one set of atoms (`AttentionItemCard`,
`AttentionItemDrawer`, the team-strip `StatCard` row) so the comparison is structural,
not three coats of paint:

- **A — Ranked triage queue + sidecar (#1).** Operational. The most literal read of
  "promote `NextBestActions` from a card to the page-level home": one severity-ranked
  worklist, group-by Agent/Driver/Severity, per-item 1-click launch, detail in a
  drawer. Strongest on reuse, tabular-primary + sidecar (UI-9), discoverable drill-in
  (INT-2). The baseline to beat.
- **B — Loop pipeline board (#2).** Pipeline. Makes *closing the loop* the structure —
  lanes are Needs attention → Acted → Improved → No change, reusing the shipped Missions
  Kanban lane treatment. Foregrounds JTBD-3 ("did last week's coaching work?") and the
  intervention→acted→improved flywheel the audit cares about.
- **C — Monday-morning focus digest (#3).** Editorial. Leads with the single
  highest-priority action as a hero ("in 5 minutes, who needs me and what do I do" —
  JTBD-1/2), a short ranked "also needs you" list, and a "this worked last week" recap.
  Readable ~720px column, white surface, generous whitespace (UI-10 editorial-for-content).

Why these beat the rest: #4/#8 are layout variations on #1 rather than new models;
#5 buries ranking; #6 is an analytical lens that under-serves the 1-click "do this
next" and leans on an open scope question; #7 risks flattening hierarchy; #9 loses
ranked scan order; #10 inverts the brief's priority. A/B/C cover the operational,
pipeline, and editorial strengths with the most distinct IAs.

## Direction change (Jun 13) — agent-roster dashboard

After the first build, Umesh redirected: the Command Center should be a **team-leader
dashboard**, not a board/kanban. Concretely — team-level org metrics on top, then
*every agent* on the team with their **CSAT + composite score**, each expandable to
per-agent **action items** ("this agent isn't taking help from Learning Hub", "needs
help in this area"), all oriented to **improving that agent's score**.

The kanban (old Variant B) was dropped outright, and the item-first triage queue was
re-centred on the agent. The three switcher variants are now three *dashboard* layouts
of the same agent-roster concept (shared atoms: the team-metrics strip, `AgentScoreRow`
with a composite ScoreBar, and the nested `AttentionItemCard` action items):

- **A — Roster (default):** team metrics, then every agent as an expandable row with
  CSAT + composite-vs-target bar + engagement; expand reveals that agent's action items
  under a "lift composite X → Y" goal. Needs-help agents float up; on-track sit below.
- **B — Scorecards:** the same roster as an at-a-glance card grid — CSAT, composite bar,
  and the single highest-priority action per agent with a 1-click launch.
- **C — Focus:** the 5-minute Monday read — the one agent who needs the most help
  featured with their full plan, then the rest of the at-risk roster, then a downloadable
  "this worked" recap.

The original 10-direction exploration below still informs the atoms (reuse, sidecar
drawer, severity affordances, the loop); the *primary surface* is now the agent dashboard.

## Final scores (design-evaluator — agent-roster dashboard)

The first dashboard pass found one shared weak item (WCAG-10 — the `Toast`
confirmations weren't announced) and a thin drill path on Scorecards (INT-2). Both
fixed (`Toast` got `role="status"`/`aria-live`; Scorecards now surfaces the open-action
count + "View plan"). The re-score confirmed all three clear 13/13 gates and the top
variant held at 88% (gain < 5), so the loop converged.

| Variant | Layout | Gates | Weighted | GTH | Verdict |
|---------|--------|:-----:|:--------:|:---:|---------|
| **A — Roster** (default) | Expandable agent rows, CSAT + composite, nested action items | 13/13 | **88%** | +2 | Handoff-ready |
| **C — Focus** | Most-at-risk agent featured + at-risk roster + downloadable recap | 13/13 | **88%** | +3 | Handoff-ready |
| **B — Scorecards** | Agent scorecard grid, top action per card | 13/13 | **85%** | +1 | Handoff-ready |

Remaining (non-gate) partials, carried not blocking:
- **INT-5 (A, B)** — the "needs-attention-only" filtered-empty case (Roster) and the
  all-on-track grid case (Scorecards) don't yet have a designed zero-state message;
  Focus already solves this with its all-on-track Banner. Lift that pattern across to
  push A/B toward ~90%.
- **UI-9 (A, B)** — per-agent detail expands inline / opens via the nested card rather
  than the row itself being a tabular-primary + sidecar; acceptable for a dashboard.
- **WCAG-6** — the kebab (36px) / text buttons (32px) sit just under the 44px target.
- **UI-5** — flat mock; no per-container schema/version field (fine for a prototype).

## Carried as flagged (not built in v1)

- **Loading / connection-error states.** The empty/all-clear (zero) state is built and
  reachable (handle every open item → the team is on track). Loading and connection-
  error are real states the brief lists but depend on the mocked signal/data layer;
  building them now would be unreachable dead code. Flagged for the data-layer pass.
- **Truly pre-filled launch.** Per-item "Launch" runs the in-shell confirm → loop
  transition (Open → Acted → toast) so the flywheel is demonstrable. Wiring it to the
  real `MissionWizardPage` pre-seeded with cohort + driver crosses module routes and
  touches handler/fetch logic (G6) — flagged for the wiring pass.
- **Auto-QA + driver-coverage signals (V2), manager rollup (V2), auto-assign (V3).**
  Out of scope per the ticket's phasing.
