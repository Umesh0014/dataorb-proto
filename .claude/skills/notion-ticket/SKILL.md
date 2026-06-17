---
name: notion-ticket
description: >-
  Turn a DataOrb (or any) Notion ticket into shipped design — end to end. Reads the
  ticket's full context (requirements, decisions, owners, betas), researches the
  problem for insights, generates N genuinely distinct directions as live coded
  prototypes shown in a version bar, takes your funnel feedback, builds the chosen
  directions into a pixel-perfect Figma using existing design-system components,
  runs stakeholder + compliance + completeness loops, and produces a prototype +
  detailed Figma ready for developer handoff. Use this whenever the user drops a
  Notion ticket link, says "/notion-ticket", "build this ticket", "take this
  ticket", "explore directions for this", "run the factory on this", or otherwise
  gestures at moving a ticket from brief to finished design. Trigger it even when
  the user just pastes a ticket and says "go".
---

# Notion Ticket → Direction Factory

Take one Notion ticket and run it through the full divergence→convergence pipeline.
You (the agent) do the mechanical work and the self-correcting loops; the human
stands at four gates where taste, strategy, and politics actually live.

**Core principle:** automate the *convergence* loops (does this match the spec /
the design system / the pixels?), gate the *divergence* decisions (which idea, is
this the right bet, will leadership buy it?). Never gate what an evaluator can
judge; always gate what only the human can.

**Ownership flips at Gate 1:** before Gate 1 the **coded prototype is the source of
truth** (fast, disposable). The moment a direction survives the funnel, **Figma
becomes canonical** and the prototype is regenerated *from* Figma — never the
reverse. This keeps the sync one-directional and closeable.

## Configure before first run

Fill these in (or confirm) at the top of each run — don't assume:

- **Notion**: ticket source DB + the status/decision-log fields. Ticket link is the entry point.
- **Design system**: the component library name, the **version-bar** component id, and where the **design guidelines** live.
- **Figma**: target file + the page naming convention for converted directions.
- **Prototype**: Vercel project for preview deploys (branch-per-ticket).
- **Mode**: `avoid-editing` (default — human leaves comments/verbs, agent makes every change) or `edit-and-feed-back` (human edits Figma directly, agent syncs prototype to match). Pick per ticket.

## The two filters that govern everything

1. **Distinctness gate (per direction).** Every generated direction must differ on a
   *structural* axis — mental model, navigation, density, or core interaction — not
   just styling. Two restyles of the same idea = one direction. Regenerate the
   weaker twin with an explicit "must differ on X" constraint.

2. **Insight ≠ information gate (research).** Every research finding must end in
   "…therefore, for our direction: ___." A fact with no design implication is
   information — drop it. Only implications survive into the "?" popover.

## Workflow

Run in order. Each AI phase carries a loop with a hard exit condition; each gate
stops and waits for the human.

### Phase 0 — Ingest the ticket  · then **GATE 0**

Read the ticket and everything it links: requirements, the discussion thread, who
decided what, owners, and each person's beta/stance. Produce a **structured brief**:
problem, constraints, decisions-already-made, open questions, success signal.
Stop and have the human confirm the brief is accurate before spending any cycles.
Catch hallucinated context here, where it's cheap.

### Phase 1 — Research for insights (comes first)

Before generating anything, research the problem space: similar use cases on the
web, how comparable products solve and *position* this, what patterns convert.
Apply the insight≠information gate. Output, per emerging angle: references →
insight → pro/con. This is the raw material directions are *built from*, not
decorated with afterwards.

### Phase 2 — Generate N distinct directions (from the insights)

Generate `n` directions (n = 1…∞ — as many as are genuinely distinct; do not pad to
hit a number). Each is a **live coded prototype** on a branch, deployed to Vercel.
Each inherits its pros/cons and reference→insight chain from Phase 1.
- **Loop exit:** all directions pass the distinctness gate (pairwise-similarity check).
- Render them in the **version-bar** component so the human can switch between live versions.
- Each version carries a **"?"** affordance → popover. Top layer: scannable pros/cons.
  "More detail" tab: the references pulled and the insights derived (the reasoning chain).

### Phase 3 — **GATE 1** · direction review (the big one)

The human reviews directions in the version bar. Feedback is a fixed verb schema so
you parse it deterministically — **always echo your parsed reading back for a
one-line confirm before acting:**

- Per direction: `keep` · `discard` · `refine <scoped note>` · `merge <a+b>` · `branch <into variants>`
- Global: `funnel <keep these, drop rest>` · `reject-all <reason>`

`refine` feedback is either **crisp** (anchored to a version + element — drops into a
scoped refine loop) or **wide** (directional, applies across all survivors as a
constraint). `reject-all` is the escape hatch: the reason becomes a hard negative
constraint and you regenerate Phase 2 — never repeat the same miss.

### Phase 4 — Build the base Figma (chosen directions)

Convert each surviving direction into Figma pages. **Figma is now canonical.**
- **Reuse first:** search the design system and instantiate existing components
  (`figma_search_components`, `figma_instantiate_component`). Build a new component
  only when nothing fits — and standardize it to the library.
- **Loop exit (runs unattended):** design-system audit clean (`figma_audit_design_system`,
  `figma_lint_design`) — no hardcoded values, tokens used, component-reuse high; AND
  every interactive element has all states defined (hover/active/disabled/loading/empty/error).

### Phase 5 — **GATE 2** · stakeholder review

Human gathers PM / CEO feedback in Figma. The only gate the human doesn't fully
control — that's the point; it's where politics lives. On "request changes":
- `avoid-editing` mode → stakeholders/human comment; agent makes the edits.
- `edit-and-feed-back` mode → human edits Figma directly; proceed to Phase 6 to sync.

### Phase 6 — Figma → code sync (pixel-perfect)

One direction only: extract tokens/CSS/layout from Figma via MCP
(`get_design_context`, `get_variable_defs`, `download_assets`, `get_code_connect_map`),
patch the prototype to match, render, visual-diff.
- **Loop exit:** visual diff ≈ 0.
- Embed the prototype **play-link inside Figma** so the version plays from a button.

### Phase 7 — Completeness + standardization · then **GATE 3**

Final unattended pass: design guidelines satisfied; all micro-interactions carried
over and finalized; consistent with the other files in Figma (so it doesn't look
like it came from a different studio). Then the human signs off → **developer handoff**:
detailed Figma + embedded playable prototype + token/spec parity.

### Phase 8 — Write status back to Notion

Update the ticket: chosen direction(s), the feedback log (verbs + decisions),
Figma + prototype links, and final status. Notion stays the system of record.

## The loops, and what stops each (quick reference)

- **Distinctness** (Phase 2) — stop when all directions are structurally orthogonal.
- **Insight ≠ info** (Phase 1) — drop any finding without a design implication.
- **DS-compliance + completeness** (Phase 4) — stop when audit clean + all states defined.
- **Pixel-match** (Phase 6) — stop when visual diff ≈ 0.
- **Standardization** (Phase 7) — stop when consistent with sibling Figma files.

Only the first two ever surface to the human (at Gate 1). The rest run silent and
report pass/fail.

## Principles

- **Research feeds generation; never decorate after.** Directions are built from
  insights, not retro-fitted with them.
- **Distinct on structure, not skin.** If two directions could be a theme toggle,
  they're one direction.
- **Echo feedback before acting.** One-line parsed-readback prevents a wasted cycle
  from a misread verb.
- **One source of truth per phase.** Code leads divergence, Figma leads convergence.
  Sync is one-directional. No bidirectional drift.
- **Reuse beats invent.** Borrow components from the library; build new only when
  forced, and standardize it immediately.
- **Gates are few and load-bearing.** Four human gates, no more. Everything else is
  a loop with an exit condition.
