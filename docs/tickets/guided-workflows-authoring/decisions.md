# Guided Workflows — team-leader authoring build log

Figma: "Learning Hub" file, `P5edYMfQe2DW1EZLJqkH7N`. Team-leader-side authoring
surfaces (Workflows landing → driver detail → create-from-interaction →
workflow editor). This is the *other* track from `docs/tickets/drill-guided-workflow/`
(that one is the agent-side live guided-drill experience — out of scope here per
its own doc's constraint C1).

No single Notion ticket covers this track yet — built directly from a sequence of
Figma frame links shared over several sessions. This doc is the running decisions
log so a future session (or Umesh) doesn't have to re-derive them from git history.

## Screens — done

| Figma frame | Built as | Notes |
|---|---|---|
| 03 · Driver detail — workflows table | `WorkflowDriverDetailPage.jsx` | Built in an earlier session. |
| 04 · Create workflow — source dropdown | `CreateWorkflowMenu` (in `WorkflowDriverDetailPage.jsx`) | "+Workflow" button → 2-option menu (customer interaction / transcript). |
| 05 · Interaction picker — filters (sales) | `InteractionPickerPage.jsx` + `InteractionFilterPanel.jsx` | Table of interactions to pick from; right panel is the Filters facet list. |
| 06 · Interaction picker — summary (sales) | `InteractionSummaryPanel.jsx` | Same picker page — right panel swaps from Filters to "Interaction summary" once ≥1 row is selected. |
| 07 · Interaction picker — select language modal | `GenerateWorkflowModal.jsx` | Multi-select language chips; reuses `Modal.jsx` (extended with `confirmDisabled`/`width` props). |
| 08 · Driver detail — workflow generating row | `WorkflowDriverDetailPage.jsx` (STATUS map + timer) | "Generating" row state (blue pill, cached icon). |
| 09 · Driver detail — generated draft row | `WorkflowDriverDetailPage.jsx` (same timer) | Same row (`GW-12BC`) auto-transitions Generating → Draft + "New" badge 2.5s after mount — 08/09 are one row's lifecycle, not two separate rows. |
| 11 · Archive — confirm detach roleplays | `WorkflowPostPublishPage.jsx` (Archive modal) | Header archive icon → confirm modal (reuses `Modal.jsx`, `confirmTone="danger"`). |
| 03 · Workflow editor — Open stage (default) | `WorkflowPostPublishPage.jsx` (stepper + `StepCard`) | Stepper is now interactive; Open stage shows its 3 real cards incl. the unwritten "Step title will come here…" placeholder. |
| 05 · Workflow editor — Act stage (triage paths) | `WorkflowPostPublishPage.jsx` (`ACT_PATHS` / `ACT_STEPS_BY_PATH`) | Horizontal-scroll path picker (4 of the frame's "5 Paths" — the 5th wasn't legible in the export); selecting a path shows its steps. Only the first path's steps have Figma evidence. |
| 05a.1/05a.2 · Workflow editor — Hints panel (viewing / composing) | `components/HintsPanel.jsx` | A step's hint chip opens this panel. Extracted out of `WorkflowPostPublishPage.jsx` into its own file so `hintsStep` state could be lifted to `page.jsx` and passed through `PageLayout`'s `rightPanel` prop — see decision below. |

## Screens — pending / not fetched

These are referenced (numbered stepper labels, a Figma overview page listing
"1 · Entry — Plus dropdown…", "2 · 'Generate workflow' modal…") but no frame
link was ever shared for them, so nothing was built or guessed at:

- Workflow editor **Verify**, **Discover**, **Close** stages (no step content —
  currently render an honest "No steps configured for this stage yet." empty
  state rather than invented copy).
- Workflow editor Act-stage paths 2–4's own step lists (path cards are real;
  their step content isn't — same empty-state treatment).
- Whatever "01" and "02" are in this numbering sequence (an entry point and a
  two-path generate-workflow modal per the Figma overview page's annotation
  labels — never opened).
- Anything after "11" (Archive) — unknown, no link shared.

**Caveat:** the Figma file's page/section structure didn't let a full,
authoritative frame inventory be pulled in one shot (the "list pages" call only
surfaced one page; the frames actually built live under specific node IDs shared
directly). So "pending" above is *known* gaps, not a verified complete list —
if there are more frames in this flow, they haven't surfaced yet.

## Key decisions / reuse calls

- **`Modal.jsx`** extended (not forked) with `confirmDisabled` and `width` props
  — both the language-select and archive-confirm modals reuse it.
- **Icon fill mismatches fixed against Figma, not assumed**: table check icons
  (FCR/Sales won/Retained) are solid filled circles, not lucide's outlined
  `CheckCircle2` — replaced with a custom filled-circle + `Check` glyph. Metric-card
  tile icons (`electric_bolt` etc.) needed the Material Symbols `FILL` axis turned
  on (`MaterialIcon` gained a `fill` prop, default off — the small trend-pill/row
  icons elsewhere are genuinely outlined in Figma, confirmed before changing anything
  globally).
- **"Guided Workflows" page-header icon** swapped from a mismatched `question_answer`
  glyph to the existing bespoke `WorkflowsIcon` (already used by the SideNav rail),
  matching the established "page header reuses the rail icon" precedent from
  `MissionsIcon`.
- **Color-token gaps surfaced, not invented**: Figma's `#1D4ED8` (Generating pill
  text) and `#FEFBFF`/`#F8FAFC` (a couple of near-white surfaces) have no exact
  token — mapped to the closest existing paired token (`--tile-blue-fg`,
  `--color-surface-header-tinted`) with the mismatch called out in code comments
  rather than adding new one-off hex values.
- **Dropdown menus render via portal + `getBoundingClientRect` positioning**
  (matching the existing `KebabMenu.jsx` pattern) wherever a menu could be clipped
  by an ancestor's `overflow: auto`/`hidden` — caught live in the browser for both
  the create-workflow menu and the language-select dropdown inside `Modal.jsx`'s
  scrollable body.
- **Hints panel fixed from floating overlay to docked right column**: first pass wired
  the Hints panel as `position: fixed`, which cut off header controls and card content
  behind it — caught against Figma's "Dashboard Sidecar" frame, which is a true sibling
  column, not an overlay. Fixed by extracting the panel to `components/HintsPanel.jsx`
  (no `position: fixed`; `height: "100%"` panel matching `InteractionSummaryPanel.jsx`'s
  convention) and lifting `hintsStep` state up to `page.jsx`, so it flows through the
  same `PageLayout` `rightPanel` docking mechanism (dock ≥1644px, overlay below) as
  every other right panel in this flow — per `CLAUDE.md`'s explicit "no `position: fixed`
  for full-height side panels" rule.
- **`PageLayout` dock/overlay mode made responsive, not locked-at-open**: user reported the
  editor "whole UI broken" after this build — repro turned out to be resizing the browser
  (or a dev-server hot-reload landing) while a right panel was already open. `PageLayout`
  computed dock-vs-overlay once, at the moment a panel opened, and never re-evaluated it —
  so a resize across the 1644px threshold left `DockedRow`'s fixed max-width active in a
  viewport too narrow for it, overflowing horizontally with the panel rendered off-screen.
  This was pre-existing shared behavior (affects every consumer of `rightPanel`, not just
  `HintsPanel`), documented as intentional in `PageLayout.jsx`'s header comment — but it's a
  real bug, so fixed it there: added a `resize` listener that recomputes mode while the
  panel stays open, so dock/overlay always matches the current viewport. Verified in-browser
  both directions: open at 1680px (dock) → resize to 1400px (correctly flips to overlay,
  no overflow) → resize back to 1680px (correctly re-docks).
- **Hints panel remount bug caught in browser verification**: `HintsPanel`'s composer-open
  state (`useState(!hintCount)`) only evaluates on mount, so switching between a hinted
  step and an unhinted step without unmounting the panel left the composer in the wrong
  state (stuck closed/open from whichever step was viewed first). Fixed with
  `key={hintsStep.title}` on the `<HintsPanel>` call in `page.jsx`, forcing a remount —
  and thus a fresh `composerOpen` calculation — on every step switch.
- **Rule of three respected**: `InteractionFilterPanel.jsx` duplicates
  `WorkflowFilterPanel.jsx`'s shape (2nd callsite) rather than extracting a shared
  primitive early; same for the pagination footer (`WorkflowPublishModal.jsx`
  pattern reused inline, not extracted).
