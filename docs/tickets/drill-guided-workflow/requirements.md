# Requirements Checklist — Team Leader Guided Workflow Authoring

Source: https://app.notion.com/p/37c7c8264656819dbc5dcdab7ebdb322
Surface: Team leader creates, edits, calibrates, and manages Guided Workflow artifacts. The agent-side guided drill session is already built (DrillGuidedSessionPage.jsx) — this checklist covers only the authoring/management side.

---

## Functional requirements

- [ ] R1: Team lead can create a new guided workflow (assistant-mode from start — never a blank canvas; AI helps populate even if no source data)
- [ ] R2: Create path A — paste text/transcripts, AI converts to workflow steps
- [ ] R3: Create path B — pick up to 10 production interactions, AI generates workflow (queued), team lead edits, publishes
- [ ] R4: Flat checklist structure — NO branching, node-graphs, or decision trees (complexity cap: "as easy as building a checklist in Asana")
- [ ] R5: Five universal conversation stages: Open → Verify → Discover → Act → Close
- [ ] R6: Each stage contains steps with: instruction text + script (suggested phrasing) + optional linked knowledge card
- [ ] R7: Steps can have sub-steps (conditional if-questions; flexible, not rigid order)
- [ ] R8: Each step tagged: required / conditional / recommended (mandatory vs optional)
- [ ] R9: Each step typed: compliance / action / decision
- [ ] R10: Each step carries grounding info — which production interaction it was mined from (verifiability)
- [ ] R11: Edit-mode = create-mode (one GUI for both; edits are accounted for)
- [ ] R12: Team lead can edit the workflow any number of times; audit trail tracks all edits
- [ ] R13: Auditing visible: who made the last change, when, which role plays the workflow is attached to
- [ ] R14: Attach guided workflow to a drill persona — workflow must exist in the system first, then team lead links it to a persona
- [ ] R15: Configure how many guided-workflow sessions per agent per role play (attempts config at role/persona level, default open)
- [ ] R16: Variable to turn guidance on/off so unbiased scoring is visible (guided scores excluded from readiness profile)
- [ ] R17: Publish modes: calibration (trial run) vs. publish (live) — matching existing Guide pattern
- [ ] R18: Schema drives the experience: contact reason → job-to-be-done → scenario → triggers → success metrics → stages → steps → sub-steps
- [ ] R19: Per-step assets: (1) Step instruction — always visible; (2) Script — phrasing guidance; (3) Knowledge card — specific linked card (e.g., policy snippet), not the whole knowledge base
- [ ] R20: "Learn more about this step" affordance for complex steps with knowledge cards
- [ ] R21: Post-session eval shows an additional card for guided workflow adherence + exclusion banner ("result not counted toward readiness profile because safety-on")

## Visual / layout requirements

- [ ] V1: Lives in Knowledge Library area / Guide section of Learning Hub (reuse existing GuidePage listing pattern for workflow listing)
- [ ] V2: Simplicity is the north star — "a 13-year-old should be able to build it"; clean, minimal, accessible
- [ ] V3: Stage-based organization — swim-lane or vertical sections for the 5 universal stages (Open/Verify/Discover/Act/Close)
- [ ] V4: Reuse existing design tokens and components (Card, Button, TabsRow, PageHeader, PageLayout)
- [ ] V5: Team leader view persona-gated (agents see listing read-only; team leads see create/edit/configure)
- [ ] V6: Deliberate empty states: no workflows yet, no steps in a stage, no knowledge cards attached
- [ ] V7: Search and filter for finding existing workflows (title, status, language)
- [ ] V8: Lifecycle tabs matching existing pattern (active / calibration / draft / archived)
- [ ] V9: Step cards absorb multilingual expansion (Spanish/French/Dutch run longer) — card-based, not fixed-width tables
- [ ] V10: Inline editing — click to edit step text, script, tags directly in the checklist view

## Data / content requirements

- [ ] D1: Workflow metadata: title, description, language, domain, contact reason, job-to-be-done, outcome metrics
- [ ] D2: Step data shape: id, label, detail (instruction), mandatory flag, type (compliance/action/decision), script text, knowledge card reference, grounding source, stage assignment
- [ ] D3: Session config: attempts allowed per agent per role play, current usage count, safety-wheel on/off state
- [ ] D4: Audit log entries: author name, timestamp, change description, attached role play IDs
- [ ] D5: Mock data for at least one complete guided workflow with all 5 stages populated, showing the bill-shock retention scenario from the spec

## Constraints / out-of-scope (from ticket)

- C1: NO branching UIs / node-graphs / decision trees — flat checklist only
- C2: No new dependencies
- C3: JSX only, inline styles + CSS-var tokens
- C4: State in-memory React only (no localStorage/sessionStorage)
- C5: Edit-mode = create-mode — one GUI, not two separate flows
- C6: "A 13-year-old should be able to build it" — complexity cap on the authoring UX
- C7: Real-time assist flavor is out of scope (tracked on separate Real-time co-pilot card)
- C8: Post-call audit flavor is out of scope
- C9: AI auto-generation engine (the "self-maintained by AI" weekly updates) is out of scope for V1 — focus on administering the function
- C10: Mobile compatibility mentioned but not V1 — desktop-first, min viewport 1260px
- C11: Agent-side guided drill session already built — don't rebuild, only wire the attachment point
