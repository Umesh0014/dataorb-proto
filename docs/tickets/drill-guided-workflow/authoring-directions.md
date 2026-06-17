# Drill — Guided Workflow · team-leader authoring directions

**Ticket:** [Learning hub] Drill — Guided Workflow · P0 · `In progress`
**Notion:** https://app.notion.com/p/37c7c8264656819dbc5dcdab7ebdb322
**Scope:** the *team-leader* track — create / manage / view guided workflows. This is the
other half of the agent-side progressive-disclosure build (see [directions.md](directions.md));
the lead authors the flat checklist here and the agent practises against it.

---

## Gate 0 decisions (locked with Umesh, Jun 17)

- Authoring lives as a **tab inside the Drill experience** (`/learning/guided-workflows`,
  reached from a "Guided Workflows" tab in Drill, Team-Leader view only) — not a separate
  Knowledge Library route, for now.
- **Unlimited guided attempts** per agent in V1 (no cap configured yet; the editor states it).
- Delivery: **coded variants in-repo** on one VersionBar (no Figma wired for this ticket).
- Directions actively differ on: **editor layout · nav placement · assignment/attempts · generate-vs-paste entry**.

## Research → insight (insight ≠ information)

| Reference | Insight | For our direction |
|---|---|---|
| Scribe / Tango auto-capture dominate SOP creation | Nobody writes SOPs from a blank page | Lead with generate-from-interactions / paste-to-convert; never an empty editor (validates "edit = create"). |
| Tango's persistent live transcript "may be distracting" | Source belongs behind an affordance, not always-on | Grounding tucked per-step (A/B); the one exception is C, where evidence *is* the interaction. |
| Process Street = checklist that *enforces* compliance | The tags are a contract, not decoration | `type` + `requirement` are what the agent-side eval reads → one-tap inline tagging. |
| Scribe's workspace library wins for managing many SOPs | Manage/view = a library with audit + attachment | Reuse the Guide-landing pattern; audit metadata first-class. |
| Asana-simplicity mandate ("a 13-year-old can build it") | Editor must be direct-manipulation | Wizard frames only *setup*; the step list is inline rows/cards, no node-graph. |

## The three directions (one VersionBar, A/B/C)

Constant across all three (not differentiators): the library landing + audit/attachment map, the
create entry (pick ≤10 interactions / paste transcript), the editor chrome (title, state, audit
strip, Attach-to-persona, Publish), the step schema (type · requirement · script · grounding ·
sub-steps), the five universal stages, and the attach dialog. They differ only on the **editor
mental model** + the framing of the four forks.

| | A · Checklist (Safe) | B · Board (Balanced) | C · Studio (Ambitious) |
|---|---|---|---|
| **Mental model** | One flat list, grouped by stage (Asana) | Five stage swim-lanes + outcome lane | Flat checklist beside its source evidence |
| **Editor layout fork** | Linear collapsible sections | Horizontal Kanban-per-stage | Two-pane split (evidence ⇄ list) |
| **Core interaction** | Inline rows, drag to reorder, one-tap requirement cycle | Step cards in stage columns; read the *shape* of the call | Select a step → its source turns light up; mint a step from a turn |
| **Generate-vs-paste fork** | Two equal entry tabs | Generate-first (paste secondary) | Both entries land in the studio pre-drafted |
| **Assignment fork** | Attach via chrome button | Attach via chrome + outcome lane context | Attach surfaced at publish |
| **Nav fork** | Drill tab | Drill tab | Drill tab now; reads as a candidate full-screen studio later |
| **Reuse** | Highest | Medium | Medium |
| **Bet** | Ships now, lowest risk | Best orientation / "shape" read | Strongest trust mechanism (verifiability spatial) |

## Requirements coverage (all three)

✅ Library list w/ audit (last edit, who, edit count) + attachment map · ✅ Create from ≤10
interactions OR paste transcript (edit = create) · ✅ Flat checklist, no branching · ✅ Schema:
contact reason → JTBD → success metric → triggers → 5 stages → steps (instruction + script) →
conditional sub-steps · ✅ Step `type` (compliance/action/decision) + `requirement`
(required/conditional/recommended), one-tap to change · ✅ Grounding chip per step
(mined-from interaction; hand-added steps visibly ungrounded) · ✅ Attach to drill persona ·
✅ Unlimited attempts stated · ✅ AI-generated framing, self-maintained note.

Out of scope (noted, not built): real generation/STT engine, agent live view (already shipped),
real-time-assist & post-call-audit flavors, manager assisted-vs-unassisted analytics, mobile.

## Build status

All three build clean (`next build` ✓ TypeScript ✓); `/learning/guided-workflows` SSRs 200.
Awaiting **Gate 1** — Umesh funnels the directions in the VersionBar (keep / discard / refine /
merge). Surviving direction(s) then go to the DS-compliance + completeness loop.
