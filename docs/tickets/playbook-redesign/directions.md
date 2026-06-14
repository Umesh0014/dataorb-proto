# Playbook redesign — design directions audit

Ticket: [Playbook redesign](https://app.notion.com/p/36e7c826465681649981e9dd5b0a59a3) · P1 · Inprogress · Assignee Ayushi

**Brief (verbatim from the Notion ticket).** *"Restructure the Playbook page: promote
the title to a hero header, drop the 'overview' section label, collapse the playbook
into a single primary block, and add a source-evidence grid that surfaces which
agents' interactions built it. Move checklist and key-terminology out for now."*

**Surface.** `components/TaskRecordPage.jsx` — the long-form playbook artifact behind
a task. Sticky left TOC + content stack. Current layout has 11 TOC items including a
named "Overview" section and two empty placeholders (Verification Checklist, Key
Terminologies, Learning).

Below: 10 directions generated, scored against `design-guidelines.md`, top 3 picked
for build behind a VersionBar switcher.

---

## 10 directions

### D1 — Editorial Long-form
Title becomes a hero block (~32px). The Overview card drops its label, collapses
"When to use / Customer Profile / Emotional Context" into one editorial body with
chips below. Source Evidence section gains an agent-grid card row above the existing
table — one card per contributing agent (avatar + interactions-contributed + dominant
sentiment). TOC stays as the left rail. Reuses Card, accordion, table, VersionBar.

### D2 — Magazine Cover Hero
Hero with title + 1-line subtitle + an inline stat strip (interactions count, agents
count, time window). Source Evidence becomes a horizontal agent-chip filter strip
above the existing table — clicking an agent narrows the table to that agent's rows.
Single block overview. Conceptually editorial but introduces a new filter-chip
interaction primitive.

### D3 — Two-Column Spec Sheet
Drops the sticky TOC. Hero is full-width. Body is a 70/30 split with a persistent
right rail showing metadata snapshot (source count, contributing agents avatars, last
updated, tag). Inline section anchors replace TOC. Hero ↔ metadata split scores well
for UI-7 but the rail competes with PageLayout's docked right panel — possible
collision with the layout system.

### D4 — Agent-First Mosaic
Hero with title, then a "Built by these agents" mosaic is promoted to the **first**
content block, before any narrative. Each agent card: avatar, name, interactions
contributed, adherence range, sample quote, dominant pattern they exhibited. Then
the overview block + sections follow. Restructures section order to put humans
first; strongest interpretation of "surface which agents' interactions built it."

### D5 — Notion-Style Doc
Hero header + single body block + no TOC, no section cards. Document feel: anchor
headings inline, light separators, ~720px column. Source Evidence relegated to a
citations-style footer. Maximizes editorial restraint but loses scannability and
drops the existing tabular Source Evidence (drill-down regression).

### D6 — Tabbed Hero
Hero + a TabsRow (Overview / Approach / Sources / Challenges). Each tab is a single
block. Source Evidence becomes a tab in its own right. Tabs hide content behind
clicks — drill-down discoverability regression. Hero gains visibility but the user
can't see the whole playbook on one scroll.

### D7 — Inline Citations + Footer Grid
Narrative carries small superscript citation markers (e.g. "¹") that anchor into a
footer grid organized **by agent** (rows = agents, columns = the interactions they
contributed). Reframes evidence as a tutor-style "built from these humans" rather
than "built from N interactions." Strong on agent surfacing but the superscript
pattern is new chrome and would need a new primitive — fails UI-2 (reuse).

### D8 — Compact Top-bar Hero + Wide Body
Keeps the TOC. Replaces the current cramped identification bar with a real hero
(title 24-32px, meta below). Single overview block. Source Evidence table gains an
agent column and dual sort (by agent / by adherence) but no agent grid above.
Conservative — mostly typographic upgrades + table column. Lowest design risk but
weakest interpretation of "agent surfacing."

### D9 — Hero + Pinned Source Strip
Hero header with title, then a horizontal source strip sits **right below** the
hero, persistently visible as you scroll past it: "Built from 150 interactions
across 5 agents · Q1 2026" + agent avatar cluster + a "jump to evidence" anchor.
Single overview block follows. Source Evidence table stays at the bottom but is
reachable via the strip. Surfaces agent provenance without restructuring section
order.

### D10 — Card Stack with Hero
Hero header card, then every section becomes its own card in a vertical deck. A
"Contributors" card group appears as a top-of-deck row (5 agent cards). Section
cards are heavy chrome — adds visual weight where editorial restraint was the
direction (regression vs UI-10 editorial), but the contributors-card-row pattern is
clean.

---

## Scoring against `design-guidelines.md`

Concept-stage scoring: rubric alignment on weighted items decidable from a concept
(reuse, affordance clarity, drill-down discoverability, hierarchy, editorial-vs-
density, schema-driven, multilingual tolerance, switcher pattern) + structural gate
violations the approach implies. Built-time gates (contrast, focus rings, ARIA,
motion timing) deferred to the per-variant evaluator pass after the build.

| Dir | Hero/identity (UI-7) | Editorial vs density (UI-10) | Drill-down (INT-2) | Reuse (UI-2) | Agent surfacing (brief) | Multilingual tolerance (UI-8) | Switcher fit (INT-3) | Structural gate risk | **Concept score** |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|---|:--:|
| D1 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | none | **14** |
| D2 | 2 | 1 | 1 | 1 | 1 | 2 | 2 | new filter-chip primitive | 10 |
| D3 | 2 | 2 | 2 | 1 | 1 | 1 | 2 | PageLayout right-rail collision risk | 11 |
| D4 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | none | **14** |
| D5 | 2 | 2 | 0 | 1 | 1 | 2 | 2 | citations footer drops the evidence table → INT-2 fail-class | 10 |
| D6 | 1 | 1 | 0 | 1 | 1 | 2 | 2 | tabs hide content → INT-2 fail-class | 8 |
| D7 | 2 | 2 | 1 | 0 | 2 | 1 | 2 | new superscript citation chrome | 10 |
| D8 | 2 | 2 | 2 | 2 | 1 | 2 | 2 | none | 13 |
| D9 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | none | **14** |
| D10 | 2 | 1 | 2 | 2 | 2 | 1 | 2 | card-on-card-on-card may flatten hierarchy | 12 |

---

## Top 3 — built behind a VersionBar switcher

**V1 — Editorial Long-form (D1).** *Why it won:* most conservative, strongest reuse,
hits every weighted preference at concept stage with no novel chrome. The agent-
grid card row sits inside the existing Source Evidence section, so it adds value
without restructuring the table or moving sections. Safe baseline that the other
two can be judged against.

**V2 — Hero + Pinned Source Strip (D9).** *Why it won:* keeps the same section order
as today but surfaces "5 agents · 150 interactions · Q1 2026" persistently — the
single change that most directly answers the brief's "surface which agents'
interactions built it" without inventing new primitives. Pinned strip is a familiar
pattern (sticky meta), reuses the avatar + counter elements already in the file.

**V3 — Agent-First Mosaic (D4).** *Why it won:* the boldest read of the brief.
Promotes contributing agents to the first block after the hero, before any
narrative — structurally telling the reader "this knowledge came from these
humans." Each agent card carries enough detail (interactions count, adherence band,
sample quote) to function as evidence on its own; the table below becomes a deeper
drill-down. Highest editorial restatement of the page's intent.

**Cut.** D2 introduces a new filter-chip interaction primitive that competes with
the existing table sort. D3 risks collision with PageLayout's docked right panel.
D5 and D6 fail-class on drill-down (INT-2). D7 needs a new citation primitive. D8
is mostly a typographic upgrade — D1 covers the same ground with more agent
surfacing. D10 over-chromes a page that should stay editorial.

All three winners drop the Verification Checklist and Key Terminology placeholders
per the brief, drop the "Overview" section label, and collapse overview sub-blocks
into a single primary block. All three swap the cramped identification bar for a
real hero header.
