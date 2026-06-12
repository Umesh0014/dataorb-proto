# Coaching Brief redesign — directions audit

Ticket: [Coaching Brief redesign](https://app.notion.com/p/36e7c826465681e391d7d1b36ba5cec3)
(P1 · `Inprogress` · Assignee Ayushi · Collaborators Vidhi, Neil, Umesh)

## Brief

> Move the focus-area cards off the flat green/yellow treatment so hierarchy isn't lost,
> define the metadata-snapshot fields, switch to inline per-card editing, and adopt the
> slide/presentation layout. Blocked on Neil's field spec.

Reference pattern (per Interaction Record View ticket): the new component-driven,
schema-versioned information-hierarchy pattern that Playbook and Coaching Brief both
inherit. Data shape lives in `components/mocks/coachingBrief.js` — overview · adherence ·
focus-area · coaching-actions, each carrying a `schemaVersion` so v1 content keeps
rendering in v1 UI after v2 ships.

Decisions routed to Neil/Akash (not resolved here):
- **Metadata snapshot fields.** Neil's spec is pending. Variants present a slot layout
  using the data already in the overview section (sample size, period, brand, service,
  team lead, generated-at) so the layout is reviewable; the final field list goes to Neil.

## 10 directions

Concept-stage scoring is against rubric items that are decidable from a concept —
reuse (UI-2), affordance clarity (INT-1), drill-down discoverability (INT-2),
component/schema structure (UI-5), highlight restraint (UI-6), hero-vs-metadata
separation (UI-7), multilingual tolerance (UI-8), editorial-vs-density fit (UI-10),
inline-edit story (INT-7), and any structural gate risk. 0 = misses · 1 = partial ·
2 = fully meets.

### D1 — Slide Deck (one-slide-at-a-time)
Vertical chapter rail + main stage. Each section is a "slide" sized to the content
column; focus areas become 4 sub-slides. Bottom-right pager with prev/next. Inline
edit toggle per slide swaps narrative blocks into `MultiLineInput`. Focus areas use
neutral chrome with a status chip (no green/yellow).
- UI-2: 2 · INT-1: 2 · INT-2: 2 · UI-5: 2 · UI-6: 2 · UI-7: 2 · UI-10: 1 · INT-7: 2 — **Strong slide answer, perfect schema fit**

### D2 — Editorial Reader (long-scroll editorial)
720px readable column, hero + metadata snapshot bar + adherence narrative + benchmarks
table + focus-area grid (Card `outline` tone, status chip + left accent rule, no
tinted backgrounds) + coaching actions. Hover reveals a pencil; click swaps the narrative
into `MultiLineInput`. Layout-shift-free refresh.
- UI-2: 2 · INT-1: 2 · INT-2: 1 (long scroll, no anchored chapter cue beyond a TOC) ·
  UI-6: 2 · UI-7: 2 · UI-10: 2 · INT-7: 2 — **Best editorial treatment, weakest on
  the "slide" requirement**

### D3 — Two-Pane Live Editor (reader + data sidecar)
Left: editable narrative document (sectioned, always-editable feel). Right: read-only
data inspector (KPI strip, benchmarks summary, sample sizes, metadata snapshot). Focus
areas as an accordion in the left pane. Quantitative/narrative separation is structural,
matching INT-7. A small "Present" affordance hints at a future presentation mode (out
of scope, link only).
- UI-2: 2 · INT-1: 2 · INT-2: 2 (sidecar pattern matches UI-9) · UI-7: 2 (data lives
  in the sidecar by construction) · INT-7: 2 · UI-10: 1 · WCAG-9: 2 — **Best
  data-vs-narrative split, weakest on slide feel**

### D4 — Carousel for focus areas
Editorial outer (hero + adherence + actions stay as a long-scroll article), focus
areas become a horizontal one-at-a-time slider with peek of next card. Hybrid.
- UI-2: 2 · INT-2: 2 · UI-6: 2 · UI-10: 2 · INT-7: 2 — **Strong but only the focus
  block presents; rest of the brief doesn't**

### D5 — Section Tabs
TabsRow at the top: Overview / Adherence / Focus Areas / Actions. Each tab is a stage.
Focus areas tab uses a nested accordion or sub-tabs. Inline edit per container.
- UI-2: 2 · INT-1: 2 · INT-2: 2 · UI-5: 2 · UI-7: 2 — **High reuse but tabs ≠ slides;
  brief asks for slide layout**

### D6 — Reading / Presentation toggle
Same brief renders as editorial article (default) or slide-deck. Edit lives in reading
mode; presentation is read-only. Compound — embeds two of the other directions and
ships with two surfaces inside one variant.
- Skipped: covers two directions, would duplicate variants A and B with extra
  switching chrome. Better to ship D1 and D2 as distinct variants.

### D7 — Two-column Quant/Narrative split
Editorial layout where every section is two columns: numbers/data left, narrative
right. Focus areas are paired "What's working" / "Where to focus" columns with
typographic hierarchy and no tints.
- UI-2: 2 · UI-6: 2 · UI-7: 2 · INT-7: 2 — **Strong but no slide affordance and
  visually similar to D3; D3 makes the split structural rather than per-section**

### D8 — Coach's-eye full-bleed slides + sticky controls
Each section is a portrait-ish slide stack; Edit, Generate, Add Action sticky at the
bottom. Focus areas get a left accent rule color-coded by status.
- UI-2: 2 · INT-1: 2 · INT-2: 2 · UI-6: 1 (left accent uses status color — borderline)
  · INT-7: 2 — **Close to D1; sticky chrome is the main delta**

### D9 — Magazine spread
Editorial maximalism — display type for KPIs, generous whitespace, focus areas as
quote-like callouts with clean dividers. No tints; hierarchy through typography.
- UI-2: 2 · UI-6: 2 · UI-10: 2 · UI-8: 1 (display type tightens i18n tolerance) —
  **Type-led but multilingual risk and no slide feel**

### D10 — Stepwise numbered narrative
Treats the brief as a numbered walkthrough (1. The week · 2. Adherence · 3-6.
Focus areas · 7. Reinforcement · 8. Actions). Numbered chips drive a left rail; each
step is a small presentation panel.
- UI-2: 2 · INT-1: 2 · INT-2: 2 · UI-5: 2 — **Strong but the numbering reads as
  procedural; the brief isn't a procedure, it's a coaching artifact**

## Cull — top 3 picked

1. **A — Slide Deck (D1).** The most literal answer to "adopt the slide/presentation
   layout." Vertical chapter rail + main stage cleanly separates hero from metadata
   snapshot (UI-7), each section is one schema-versioned container (UI-5), focus
   areas drop the green/yellow tint and rely on status chips + type hierarchy (UI-6),
   and inline edit per slide gives narrative its own deliberate state (INT-7). Picked
   over D8 because D8's sticky-controls chrome doesn't earn its weight vs D1's
   simpler pager.

2. **B — Editorial Reader (D2).** The strongest reading-mode treatment (UI-10),
   highest reuse of `Card outline` + `MultiLineInput` (UI-2), and the cleanest
   hierarchy when status is expressed via chip + left accent rule rather than card
   background (UI-6). Picked over D9 because D9's display type strains multilingual
   tolerance (UI-8). Picked over D5 because tabs don't satisfy the slide brief; D2
   keeps a narrative scroll with a chapter cue, which reads more "presentation" than
   "tabbed dashboard." Picked over D7 because D7's per-section split is visually
   noisy across four sections; D3 makes the split structural instead.

3. **C — Two-Pane Live Editor (D3).** The strongest INT-7 answer (the document IS
   the editable layer; the sidecar is read-only data) and the strongest UI-9 fit
   (data-as-sidecar is exactly the prescribed pattern). Picked over D4 because
   D4 only re-presents the focus areas; the brief asks for the whole layout to
   change. The "Present" link in this variant gestures at the future slide mode
   without trying to be the slide mode — the deck variant (A) is that.

## What none of the three do (flagged)

- **Define the final metadata-snapshot field list.** Blocked on Neil's spec. Each
  variant lays out a snapshot slot using the fields already in the overview mock
  (sample size, period, brand, service, team lead, generated-at). When Neil's list
  lands, the slot stays; the fields swap in.
- **Activity trail for narrative edits** (INT-7 second half — "last updated by [user]
  plus an activity trail"). Variants render `lastUpdatedBy` from the mock; the trail
  is out of scope for v1 of the redesign and noted for follow-up.
- **PDF download.** Good-to-have; can be added once the layout is settled and the
  print stylesheet is agreed.
