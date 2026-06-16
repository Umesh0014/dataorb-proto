# Guided Workflow Authoring — 9 Directions × 3 Bands

**Ticket:** [Learning hub] Drill — Guided Workflow (team leader authoring surface)
**Notion:** https://app.notion.com/p/37c7c8264656819dbc5dcdab7ebdb322
**Surface:** Team leader creates, edits, calibrates, and manages Guided Workflow checklist artifacts.
**Requirements contract:** `docs/tickets/drill-guided-workflow/requirements.md`

This file is the audit trail for the divergence: 9 directions scored against `design-guidelines.md`, culled to the 3 that will be built behind the switcher.

---

## What the surface must do (constant across all directions)

- **Listing view:** shows all guided workflows with lifecycle tabs (active/calibration/draft/archived), search, persona gate (TL sees create/edit; agents see read-only)
- **Authoring view:** create or edit a guided workflow as a flat checklist organized by 5 universal stages (Open → Verify → Discover → Act → Close)
- **Per-step content:** instruction text + script (suggested phrasing) + optional knowledge card link + step type tag (compliance/action/decision) + mandatory/optional flag + grounding source
- **Sub-steps:** conditional items under a step
- **Schema metadata:** contact reason, job-to-be-done, scenario, triggers, success metrics
- **Audit trail:** who changed, when, which role plays attached
- **Publish flow:** calibration vs. publish modes
- **Config:** attempts per agent, safety-wheel on/off

The directions differ in **how the authoring experience is structured and surfaced** — the listing page follows GuidePage's established pattern in all directions.

---

## The 9 directions

Scored 0–2 on rubric preferences decidable at concept stage, ×weight.
Columns: UI-2 reuse (3) · INT-1 affordance (3) · INT-2 drill-down (3) · UI-5 schema (2) · UI-6 highlight (2) · UI-8 i18n (2) · INT-3 primitive (2) · INT-5 empty (2) · INT-7 AI-edit (2) · INT-11 task-first (1).

### Band A — Safe (incremental, minimal new UI)

**A1 — Wizard Extension**
Extend the existing CreateGuideWizardPage with new stages for guided workflow. Reuses the exact 3-stage wizard shell (stepper + footer + back/next) and adds Stages 4-5 for step definition and review. Steps entered as a simple form: one card per stage (Open/Verify/Discover/Act/Close), each with an "Add Step" button that appends a step card with text fields for instruction, script, and tag dropdowns. Publish modal reused as-is.

- Reuses: CreateGuideWizardPage shell, Stepper, PublishGuideModal, Card, Button, MultiLineInput
- New: step-card composition within the wizard
- Reqs: R1-R19 ✅ all addressed; wizard is edit-mode = create-mode by nature (R11 ✅)
- Risk: wizard's linear flow fights iterative editing — you can't quickly jump between stages to tweak steps

| Reuse·3 | Afford·3 | Drill·3 | Schema·2 | Hl·2 | i18n·2 | Prim·2 | Empty·2 | AI-edit·2 | Task·1 | **Σ/46** |
|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| 6 | 4 | 2 | 4 | 4 | 4 | 4 | 4 | 2 | 2 | **36** |

**A2 — Stacked Accordion**
Single-page authoring view. Five collapsible Card sections (one per universal stage). Each section opens to reveal its steps as a vertical list of inline-editable rows. "Add step" button at the bottom of each section. Step rows show instruction + type chip + mandatory badge; click to expand and reveal script + knowledge card fields. Top bar has workflow metadata (title, language, domain) as inline-editable fields. Footer: Save Draft / Publish. Reuses Card, Button, TabsRow for the listing, PageLayout for framing.

- Reuses: Card (as accordion shell), Button, PageLayout, PageHeader
- New: accordion expand/collapse composition, inline-editable step rows
- Reqs: R1-R19 ✅; accordion is naturally edit-mode = create-mode (R11 ✅); stages always visible (R5 ✅)
- Risk: deep nesting (stage → step → sub-step → fields) can feel cramped; accordion state management adds complexity

| Reuse·3 | Afford·3 | Drill·3 | Schema·2 | Hl·2 | i18n·2 | Prim·2 | Empty·2 | AI-edit·2 | Task·1 | **Σ/46** |
|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| 4 | 6 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 2 | **40** |

**A3 — Two-Column Form**
Classic form layout: left column = stage/step tree (collapsible list items with drag handles for reorder); right column = detail panel showing the selected step's full fields (instruction, script, knowledge card, type, mandatory, grounding). Similar to CreateGuideWizardPage's Stage 1 (main + drawer) but the drawer is always visible. Metadata sits in a top Card above the split. Footer: Save / Publish.

- Reuses: Card, Button, MultiLineInput, the split-panel pattern from CreateGuideWizardPage Stage 1
- New: tree-list composition, persistent right panel
- Reqs: R1-R19 ✅; two-column is natural for edit/create (R11 ✅); tree gives stage overview (R5 ✅)
- Risk: the tree list can feel like a file manager, not a checklist; loses the "Asana simplicity" feel

| Reuse·3 | Afford·3 | Drill·3 | Schema·2 | Hl·2 | i18n·2 | Prim·2 | Empty·2 | AI-edit·2 | Task·1 | **Σ/46** |
|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| 4 | 4 | 4 | 4 | 4 | 2 | 4 | 4 | 4 | 2 | **36** |

---

### Band B — Balanced (1-2 new structural ideas, grounded in existing patterns)

**B1 — Kanban Stages**
The 5 universal stages rendered as horizontal swim-lanes (like MissionsKanbanLayout). Each lane is a Card with the stage label as header. Steps are draggable cards within each lane. Click a step card to reveal a sidecar drawer (right edge, reusing DrawerShell pattern from DrillDetailPage) with the full step editor: instruction, script, knowledge card picker, type/mandatory dropdowns, grounding source. "Add step" floating + button at each lane bottom. Top bar: workflow title + metadata as an inline-editable hero. This reframes checklist-building as a board — familiar to anyone who's used Trello/Asana board view.

- Reuses: Card (lane + step cards), Button, the kanban spatial model from MissionsKanbanLayout, sidecar/drawer pattern
- New: horizontal stage lanes for workflow authoring, step-card drag affordance (visual only — no actual DnD in prototype)
- Reqs: R1-R19 ✅; kanban is inherently edit-mode = create-mode (R11 ✅); stages are first-class columns (R5 ✅)
- Risk: horizontal scroll if many steps per stage; "board view" may feel odd for a linear process

| Reuse·3 | Afford·3 | Drill·3 | Schema·2 | Hl·2 | i18n·2 | Prim·2 | Empty·2 | AI-edit·2 | Task·1 | **Σ/46** |
|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| 4 | 6 | 6 | 4 | 4 | 4 | 4 | 4 | 4 | 2 | **42** |

**B2 — Stage Rail + Editor Canvas**
Vertical stage rail on the left (narrow, 200px, fixed) with the 5 stages as clickable items — active stage highlighted. Main canvas renders the selected stage's steps as a vertical card list with inline editing. Each step is a Card with all fields visible (instruction as heading, script as secondary text, chips for type/mandatory, knowledge card as a linked pill). "Add step" button at bottom. Sub-steps appear as indented child cards. Top: workflow metadata bar. This borrows the SideNav's rail-and-content spatial model but applied to stages.

- Reuses: the rail-content spatial model (SideNav pattern), Card, Button, chip compositions
- New: stage rail navigation for workflow authoring, inline step cards with all fields
- Reqs: R1-R19 ✅; rail + canvas is edit = create (R11 ✅); stage rail gives always-visible stage context (R5 ✅)
- Risk: the rail may feel over-engineered for just 5 items; if stages have few steps, canvas feels empty

| Reuse·3 | Afford·3 | Drill·3 | Schema·2 | Hl·2 | i18n·2 | Prim·2 | Empty·2 | AI-edit·2 | Task·1 | **Σ/46** |
|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| 4 | 6 | 6 | 4 | 4 | 4 | 4 | 4 | 4 | 2 | **42** |

**B3 — Outline Editor**
Structured outline (think Notion's block editor or Workflowy) — the entire workflow is one scrollable document. Stage headers are H2-level blocks. Steps are indented blocks under each stage. Sub-steps are further indented. Each block is inline-editable with a left gutter showing: drag handle, type icon, mandatory badge. Click a block to expand it and reveal script + knowledge card fields below the instruction. Right margin shows grounding source as a subtle link. This is the "Asana task list" mental model made literal — closest to the "13-year-old can build it" directive.

- Reuses: Card (as the document container), Button, the inline-edit pattern
- New: outline/document metaphor for workflow authoring, block-level expand/collapse
- Reqs: R1-R19 ✅; outline is inherently edit = create (R11 ✅); stages are structural headers (R5 ✅)
- Risk: without careful visual hierarchy, the outline can feel like a wall of text; distinguishing stages from steps requires strong typographic treatment

| Reuse·3 | Afford·3 | Drill·3 | Schema·2 | Hl·2 | i18n·2 | Prim·2 | Empty·2 | AI-edit·2 | Task·1 | **Σ/46** |
|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| 4 | 6 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 2 | **40** |

---

### Band C — Ambitious (rethinks the surface structure)

**C1 — Conversation Simulator Preview**
Split-screen authoring: left side is the checklist editor (stacked accordion per stage), right side is a **live preview** showing how the guided workflow will appear to the agent during a drill session. As the team lead adds/edits steps, the preview updates in real time — showing the progressive-disclosure coach card (current step / previous / next) exactly as the agent would see it. This makes the abstract checklist concrete: "when the agent reaches this stage, they'll see THIS." Toggle between "full checklist" and "agent view" on the right panel. Grounding sources shown as links in the left editor; the preview strips them (agents don't see grounding).

- Reuses: Card, Button, the coach-card UI from DrillGuidedSessionPage (already built)
- New: split-screen with live preview, real-time sync between editor and preview
- Reqs: R1-R19 ✅ all addressed; R19 (per-step assets) directly visible in preview; edit = create (R11 ✅)
- Risk: maintaining sync between editor and preview is complex; preview may set false expectations about AI behavior (the AI detection isn't previewed, just the step sequence)

| Reuse·3 | Afford·3 | Drill·3 | Schema·2 | Hl·2 | i18n·2 | Prim·2 | Empty·2 | AI-edit·2 | Task·1 | **Σ/46** |
|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| 4 | 6 | 6 | 4 | 4 | 2 | 4 | 4 | 4 | 2 | **40** |

**C2 — Timeline Composer**
Reimagines the workflow as a horizontal timeline — stages are time segments on a visual timeline bar (like a video editor's timeline). Each stage segment is expandable vertically to reveal its steps. Steps are blocks on the timeline, with width proportional to expected conversation duration. Click a step block to open its editor (inline below the timeline). Sub-steps appear as nested tracks. The metaphor: you're composing a conversation's structure the way you'd edit a video — sequence, duration, transitions. A "playback" button walks through the timeline step-by-step, simulating the agent experience.

- Reuses: Card, Button
- New: timeline/track metaphor, proportional-width step blocks, playback simulation
- Reqs: R1-R19 ✅; timeline addresses R5 (stages) and R18 (schema) spatially; edit = create (R11 ✅)
- Risk: the timeline metaphor is visually compelling but may violate the "13-year-old" simplicity cap (C6); proportional width requires duration estimates that may not exist

| Reuse·3 | Afford·3 | Drill·3 | Schema·2 | Hl·2 | i18n·2 | Prim·2 | Empty·2 | AI-edit·2 | Task·1 | **Σ/46** |
|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| 2 | 4 | 4 | 4 | 4 | 2 | 2 | 2 | 4 | 2 | **30** |

**C3 — Recipe Card Builder**
Borrows from the "recipe card" metaphor — each guided workflow is presented as a "recipe" for achieving an outcome. The authoring view shows a large Card with: a hero section (outcome name, success metrics, scenario context — like a recipe's title + photo), then the "ingredients" section (knowledge cards + linked documents needed), then the "method" section (the 5 stages as numbered sections, each with step "instructions"). Steps are short, imperative sentences ("Greet the customer by name and state your brand") with expandable detail (script, knowledge card, grounding). The entire thing reads like a cooking recipe — sequential, clear, actionable. Add step = add an instruction line. Reorder by drag. This fundamentally reframes what a "guided workflow" is: not a configuration form, but a **readable recipe** that happens to be editable.

- Reuses: Card (hero + sections), Button, the editorial treatment (UI-10 — content surfaces get webpage feel)
- New: recipe-card metaphor, hero-section composition, ingredients/method structure
- Reqs: R1-R19 ✅; recipe structure naturally maps to stages (R5 ✅) and schema (R18 ✅); the "readable document" framing uniquely serves the "13-year-old" goal; edit = create (R11 ✅)
- Risk: the recipe metaphor may feel informal for enterprise; the editorial treatment trades density for clarity — users with many workflows may want a denser view

| Reuse·3 | Afford·3 | Drill·3 | Schema·2 | Hl·2 | i18n·2 | Prim·2 | Empty·2 | AI-edit·2 | Task·1 | **Σ/46** |
|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| 4 | 6 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 2 | **40** |

---

## Score summary

| # | Direction | Band | Score /46 | Gate risk |
|---|-----------|------|:---------:|-----------|
| A2 | Stacked Accordion | Safe | **40** | — |
| A1 | Wizard Extension | Safe | 36 | — |
| A3 | Two-Column Form | Safe | 36 | — |
| B1 | Kanban Stages | Balanced | **42** | — |
| B2 | Stage Rail + Editor Canvas | Balanced | **42** | — |
| B3 | Outline Editor | Balanced | 40 | — |
| C1 | Conversation Simulator Preview | Ambitious | **40** | preview may mislead on AI behavior |
| C3 | Recipe Card Builder | Ambitious | **40** | informal metaphor risk |
| C2 | Timeline Composer | Ambitious | 30 | violates C6 simplicity cap |

---

## The cut — top 1 per band

### A · Safe → A2 (Stacked Accordion) — 40/46

**Why A2 over A1/A3:** The accordion is the closest thing to "building a checklist" — stages are sections, steps are list items, everything is visible and editable in one scrollable page. A1 (wizard) forces a linear flow that fights iterative editing. A3 (two-column) adds a spatial split that's over-engineered for what's essentially a checklist. A2 is the most Asana-like.

### B · Balanced → B1 (Kanban Stages) — 42/46

**Why B1 over B2/B3:** B1 and B2 tied at 42, but B1's kanban metaphor is more immediately legible — every team lead has used a board tool. B2's rail is a strong second but the rail-for-5-items feels heavy. B3 (outline) is close at 40 but lacks the spatial separation that makes stages instantly scannable. B1 also uniquely supports the "see all stages at once, zoom into one" workflow that B2 only partially achieves.

### C · Ambitious → C3 (Recipe Card Builder) — 40/46

**Why C3 over C1/C2:** C1 (simulator preview) tied at 40, but C3 is the more genuinely surprising direction. The recipe metaphor directly addresses the "13-year-old" directive in a way no other direction does — it makes the workflow *readable* as a document, not just *configurable* as a form. C1's live preview is technically interesting but adds complexity that fights the simplicity cap. C2 (timeline) at 30 falls too far behind and risks violating the complexity constraint.

---

## Requirements coverage matrix

### A2 — Stacked Accordion (Safe)

| Req | Status | Notes |
|-----|--------|-------|
| R1-R4 | ✅ | Flat checklist in accordion sections |
| R5 | ✅ | 5 accordion sections = 5 stages |
| R6-R10 | ✅ | Step cards with all fields |
| R11 | ✅ | Accordion is inherently edit = create |
| R12-R13 | ✅ | Audit trail in header metadata |
| R14-R16 | ✅ | Config section at top or footer |
| R17 | ✅ | Reuse PublishGuideModal |
| R18-R19 | ✅ | Schema metadata in top bar; per-step assets in step cards |
| R20 | ✅ | Knowledge card link on step cards |
| R21 | ⚠️ | Post-session eval is agent-side; show banner config here |
| V1-V10 | ✅ | All visual requirements addressed |
| D1-D5 | ✅ | All data requirements addressed |

### B1 — Kanban Stages (Balanced)

| Req | Status | Notes |
|-----|--------|-------|
| R1-R4 | ✅ | Step cards in kanban lanes |
| R5 | ✅ | 5 lanes = 5 stages |
| R6-R10 | ✅ | Sidecar drawer for full step editor |
| R11 | ✅ | Board is inherently edit = create |
| R12-R13 | ✅ | Audit trail in workflow header |
| R14-R16 | ✅ | Config in drawer or top bar |
| R17 | ✅ | Reuse PublishGuideModal |
| R18-R19 | ✅ | Schema in header; per-step in sidecar |
| R20 | ✅ | Knowledge card picker in sidecar |
| R21 | ⚠️ | Post-session eval is agent-side; show banner config here |
| V1-V10 | ✅ | All visual requirements addressed |
| D1-D5 | ✅ | All data requirements addressed |

### C3 — Recipe Card Builder (Ambitious)

| Req | Status | Notes |
|-----|--------|-------|
| R1-R4 | ✅ | Recipe method = flat checklist |
| R5 | ✅ | 5 method sections = 5 stages |
| R6-R10 | ✅ | Step instructions with expandable detail |
| R11 | ✅ | Recipe is inherently edit = create |
| R12-R13 | ✅ | Audit trail in recipe hero section |
| R14-R16 | ✅ | Config as a "serving size" / settings section |
| R17 | ✅ | Reuse PublishGuideModal |
| R18-R19 | ✅ | Schema in hero (outcome, contact reason); per-step in method |
| R20 | ✅ | "Learn more" expandable on complex steps |
| R21 | ⚠️ | Post-session eval is agent-side; show banner config here |
| V1-V10 | ✅ | V10 (editorial treatment) is C3's strongest feature |
| D1-D5 | ✅ | All data requirements addressed |

**Note on R21:** Post-session eval display is the agent-side DrillGuidedSessionPage's responsibility (already built). The team-leader authoring surface shows the *configuration* for the exclusion banner, not the banner itself. This is ⚠️ partially addressed — all 3 variants will include a "scoring exclusion" toggle/config, but the actual eval card rendering is out of scope for this surface.

---

## Switcher labels

| Chip | Direction | Band | One-liner |
|------|-----------|------|-----------|
| **Accordion** | A2 | 🟢 Safe | Collapsible stage sections, inline step editing, single scroll |
| **Board** | B1 | 🟡 Balanced | Kanban lanes per stage, step cards, sidecar editor drawer |
| **Recipe** | C3 | 🔴 Ambitious | Editorial recipe-card, hero + ingredients + method sections |
