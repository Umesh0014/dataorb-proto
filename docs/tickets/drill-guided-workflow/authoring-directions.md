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

## Gate 1 outcome (Umesh, Jun 17)

**Funnel: keep all three.** Wide refine constraint applied across A/B/C:
- The editor opens with an **AI-populated base workflow** the lead edits (explicit banner; create flow generates the draft).
- Every step carries **evidence**: a success rate in plain language (*"X% of calls that followed
  this step ended in <outcome>, across N interactions"*) **plus the real phrasing top agents used**
  there (quotes + interaction IDs).
- **AI-suggested steps** the lead can accept, each with its own success rate + evidence.

## DS-compliance + completeness loop (design-evaluator)

Two passes. Pass 1 found a blocking **G14** (Publish/Save draft were present-but-dead CTAs) and a
**G12** (inert `role="tab"` spans); pass 2 (after fixes) **converged — all 14 gates pass on all
three variants.** A third polish pass adopted the DataOrb spec focus ring (`.gw-focusable`).

Scores below are the **final state after the Gate-2 interaction rebuild + a11y pass**
(initial cut was A 88 / C 87 / B 85; an interaction rework briefly regressed A/B on
keyboard reorder, since fixed):

| Variant | Band | Gates | Weighted | Verdict |
|---|---|:--:|:--:|---|
| A · Checklist | 🟢 Safe | 14/14 | 90% | Handoff-ready (inline expand-edit, drag + keyboard reorder, 3-up suggestion grid) |
| B · Board | 🟡 Balanced | 14/14 | 90% | Handoff-ready (swim-lanes, drag + keyboard reorder, modal edit w/ focus trap) |
| C · Studio | 🔴 Ambitious | 14/14 | 88% | Handoff-ready (stage outline + per-step evidence workspace, pencil title-edit) |

### Gate-2 stakeholder feedback folded in (Umesh)
AI-populated base + per-step success rate & quoted-evidence on every step; evidence
drills into the contributing calls; script is read-only quoted evidence (not free text);
Checklist edits inline + drag/keyboard reorder + 3-up suggestion cards + tinted Add-step
CTA; Board edits in a centered modal; Studio flips to a left stage-outline + right
evidence workspace with a pencil (title-only) edit. Keyboard reorder, modal focus
management, and save/publish aria-live announce added to clear the G11/G12/WCAG-10 items.

Standing item routed to **Akash**: the author-monogram palette uses raw hex (app-wide
convention across `guides.js`/`replays.js`) — promote to `--color-avatar-*` tokens.

Gate fixes shipped: real Publish (confirm → Active + "live to N personas") + Save-draft feedback
(G14/INT-8); breadcrumb `<nav>` not fake tabs (G12); script edits lifted to host state + persisted +
attributed across all three editors (INT-7); inline delete confirm (INT-8); Studio `aria-live`
selection/grounding announce (WCAG-10); select-a-step + empty-lane cues (INT-2/INT-5); spec focus
ring + larger hit targets (WCAG-6/G10).

Routed to **Akash** (not settled per-screen): the author-monogram palette uses hardcoded hex
(`mocks/guidedWorkflows.js`), a repo-wide convention (`guides.js`/`replays.js`/`guideArtefacts.js`) —
needs a tokenised author-palette decision.

## Build status

All three build clean (`next build` ✓ TypeScript ✓); `/learning/guided-workflows` SSRs 200; pushed
to `claude/eager-gauss-j45i6z`. **Loop converged — ready for preview review (Gate 2 / stakeholder).**
