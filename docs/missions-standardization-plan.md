# Missions Standardization Plan

Plan derived from [missions-component-audit.md](missions-component-audit.md). Ordered by leverage + blast radius. Each step lists explicit consumers, proposed API, blast radius (Missions-only vs cross-feature), and migration steps.

Visual + behavioral guarantee: pixel-equivalent output after every step. No state changes.

---

## Ordering (do in this order)

1. **Tokens** — `--shadow-card`, `--shadow-drawer`. Non-breaking.
2. **`<InlineStatusAffordance>`** — promote first. 5+ inline copies, all inside Missions.
3. **`<Banner>`** — consolidate 4 banner variants.
4. **`<CircularProgress>`** — promote (used by Banner summary variant).
5. **`<SelectionAccentBar>`** — promote (3 callsites).
6. **`<ProgressBar>`** — promote (solid + striped tail).
7. **`<StatTileRow>`** — promote (active + completed detail KPI rows + draft-complete summary tiles).
8. **`<Timeline>`** — promote (1 callsite but high-value).
9. **`<Avatar>`** — promote (shared palette + name-hash).
10. **`<Chip>`** — promote (driver / focus area / agent chip specializations).
11. **`<StatusBadge>`** — promote (Met / Not Met / QA buckets).
12. **`<Toast>`** — promote.
13. **`<EmptyState>`** — promote.
14. **`<Checklist>` + `<ChecklistRow>`** — promote.
15. **`<Dropdown>`** — consolidate 4 inline copies (wizard).
16. **`<DateField>`** — promote.
17. **`<SliderInput>`** — consolidate SessionsControl + TargetControl.
18. **`<Drawer>`** — consolidate 4 inline drawers.
19. **`<Checkbox>`** — promote.
20. **`<Stepper>`** — promote.
21. **`<Field>` + `<TextInput>`** — promote.
22. **Delete dead local code** after consumers migrated.

Steps 1–14 are Missions-only blast radius. Steps 15–22 touch wizard step files (still Missions). Steps 18–19 also touch FilterPanel (Insights) — flag, do not migrate Insights consumers.

---

## Phase 3a — Token additions

```css
/* Append to :root in app/globals.css */
--shadow-card:   0 2px 4px rgba(69, 70, 79, 0.15);
--shadow-drawer: -4px 0 24px rgba(0, 0, 0, 0.10);
```

Replace inline hardcoded shadows in:
- [components/Card.jsx](../components/Card.jsx) line 50 → `--shadow-card`
- [components/MissionsPage.jsx](../components/MissionsPage.jsx) `mcStyles.card`, `dmcStyles.card`, completed card shell → `--shadow-card`
- [components/PreviewStep.jsx](../components/PreviewStep.jsx) drawer shadow → `--shadow-drawer`
- [components/RecruitFiltersDrawer.jsx](../components/RecruitFiltersDrawer.jsx) → `--shadow-drawer`
- [components/ContactReasonsPanel.jsx](../components/ContactReasonsPanel.jsx) → `--shadow-drawer`
- [components/PageLayout.jsx](../components/PageLayout.jsx) OverlayPanel → `--shadow-drawer`

Also replace inline `0px 5px 5px -3px rgba(0,0,0,0.20), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)` in wizard menus with existing `var(--shadow-8)`:
- MissionWizardPage Dropdown menu
- CoverageStep picker menu
- FocusAreaStep Dropdown menu

Blast radius: every Card consumer plus 4 drawer/panel files. Visual equivalence: yes — value-for-value swap.

---

## Phase 3b — New library primitives

### `<InlineStatusAffordance>`

```jsx
// components/InlineStatusAffordance.jsx
<InlineStatusAffordance tone="danger" icon={<Clock size={14} />}>
  Ends Today
</InlineStatusAffordance>

// Props
tone: "success" | "warning" | "danger" | "info" | "neutral" | "medium" | "tertiary"
icon: ReactNode
children: ReactNode
size?: "sm" | "md"  // sm = 13px (default), md = 14px (used in detail header)
```

Tone → color map uses existing tokens (`--color-success`, `--color-warning`, `--color-error`, `--color-info`, `--color-text-medium`, `--color-text-tertiary`).

Consumers to migrate:
- `mcStyles.timeChip` (MissionCard)
- `dmcStyles.draftChip` (DraftMissionCard)
- `completedStyles.affordance` (CompletedMissionCard + Completed detail header)
- `dhStyles.timeChip` (DetailHeader active)
- `ddStyles.statusAffordance` (Draft detail header)

Blast radius: Missions only.

---

### `<Banner>`

```jsx
<Banner tone="warning" heading="Mission Ends in 3 days" body="..." actions={[...]} leading={<AlertTriangle/>} />
<Banner tone="success" heading="..." body="..." leading={<CircularProgress pct={100}/>} />

// Props
tone: "info" | "success" | "warning" | "danger"
heading: string
body: string
leading?: ReactNode  // defaults to tone-keyed AlertTriangle/CheckCircle/Info etc.
actions?: Array<{ label, onClick, variant }>
```

Tone palette derived from existing tokens.

Consumers to consolidate:
- `AlertBanner` (active warning/danger with actions)
- `SuccessBanner` (completed success/info with circular gauge)
- `SetupIncompleteBanner` (draft incomplete with filled exclamation)
- `AlmostThereBanner` (draft complete with AlertTriangle)

Pixel equivalence: ensure each Banner replacement produces identical computed bg, color, layout. Validate via `preview_inspect`.

Blast radius: Missions only.

---

### `<CircularProgress>`

```jsx
<CircularProgress pct={75} size={56} ringColor="var(--color-success)" trackColor="rgba(255,255,255,0.7)" label />
```

Promote existing local component verbatim.

Blast radius: Missions only.

---

### `<SelectionAccentBar>`

```jsx
<SelectionAccentBar />
```

No props — fixed gradient. Renders 4px-tall top-edge bar. Consumer wraps it conditionally.

Blast radius: Missions only.

---

### `<ProgressBar>`

```jsx
<ProgressBar value={67} tone="success" striped={false} height={4} />
<ProgressBar value={100} tone="success" striped />  // ends_today variant
```

`value` 0–100. `tone` → solid color. `striped=true` adds the 15%-width striped tail.

Consumers:
- MissionCard progress track
- DraftMissionCard progress track
- CompletedMissionCard (100% solid green; no striped tail)

Blast radius: Missions only.

---

### `<StatTileRow>`

```jsx
<StatTileRow
  tiles={[
    { label: "Agents Below Target", value: "1 out of 22", tone: "danger" },
    { label: "Last Roleplay", value: "23 Mar 2026", sublabel: "1 day before close" },
    { label: "Roleplays", value: 156 },
    { label: "Contact Reasons", value: "10/10", info: true },
    { label: "Mission Duration", value: "31 Days", sublabel: "Extended +7 days" },
  ]}
/>
```

Renders flush-edge row inside a single bordered card with vertical dividers between tiles.

Consumers:
- DetailKPIs (active)
- CompletedDetailKPIs
- DraftStatTiles (3-tile complete summary)

Blast radius: Missions only.

---

### `<Timeline>`

```jsx
<Timeline
  events={[
    { date: "23 Apr 2026", title: "Mission Closed", description: "...", tone: "info" },
    ...
  ]}
/>
```

Tone: `success | warning | info | neutral | danger`.

Blast radius: Missions only.

---

### `<Avatar>`

```jsx
<Avatar name="Jasper F" size={28} />
<Avatar name="Malik J" initials="J" size={22} />
```

Deterministic color from name hash. `initials` defaults to first char of name. Exported `AVATAR_PALETTE`.

Consumers:
- AVATAR_PALETTE in MissionsPage (lines 20–23)
- AVATAR_PALETTE in PreviewStep (lines 56–57)
- AVATAR_PALETTE in RecruitStep (lines 116–118)
- Avatar circles in: InteractionsSection, AgentResultsSection, PreviewStep (recruited agents chips), RecruitStep (agent table)

Blast radius: Missions only.

---

### `<Chip>`

```jsx
<Chip leading={<ShieldCheck />} trailing={<Info />}>Refund/Extension Policy</Chip>
<Chip leading={<Avatar size={22} />}>Malik J</Chip>
<Chip trailing={<><CountBadge value={50} /><Info /></>}>Billing and Payment</Chip>
```

Pill primitive — leading + label + trailing slots. Solid neutral pill background.

Consumers:
- DriverChip (replace with `<Chip>` + count badge slot)
- FocusAreaChip (replace with `<Chip leading={<TypeIcon type={fa.type}/>} trailing={<PercentBadge/>} />`)
- AgentChip (replace with `<Chip leading={<Avatar/>} trailing={<Info/>} />`)

Plus expose `<FocusAreaTypeIcon type={fa.type}>` helper mapping `policy → ShieldCheck`, `qualitative → Sparkles` with `--color-icon-tertiary-fg` color.

Blast radius: Missions only.

---

### `<StatusBadge>`

```jsx
<StatusBadge tone="success">Met</StatusBadge>
<StatusBadge tone="danger">Not Met</StatusBadge>
<StatusBadge tone="warning">{score}%</StatusBadge>
```

Pill-shaped tone-keyed badge.

Consumers:
- Agent Results Met/Not Met
- Performance section Target Met % buckets
- RecruitStep QA score buckets

Cross-feature note: RecruitStep is part of Missions wizard, still in scope.

Blast radius: Missions only.

---

### `<Toast>`

```jsx
<Toast tone="success" message="..." onDismiss={...} />
```

Bottom-left ephemeral. Existing SuccessToast moved verbatim.

Blast radius: Missions only.

---

### `<EmptyState>`

```jsx
<EmptyState
  illustration={<MissionsIllustration />}
  heading="No missions yet"
  body="Set the scenarios..."
  cta={<Button>...</Button>}
/>
```

Consumers:
- MissionsEmptyState
- InteractionsSection empty state

Blast radius: Missions only.

---

### `<Checklist>` + `<ChecklistRow>`

```jsx
<Checklist>
  {DRAFT_SETUP_STEPS.map((s, i) => (
    <ChecklistRow
      key={s.id}
      status={done ? "done" : "pending"}
      label={s.label}
      highlighted={i === nextIncompleteIdx}
      onClick={...}
    />
  ))}
</Checklist>
```

Blast radius: Missions only.

---

### `<Dropdown>`

```jsx
<Dropdown
  value={v}
  onChange={setV}
  options={[{ label, value, disabled? }]}
  placeholder="..."
  width?={number}
/>
```

Single primitive replacing 4 inline copies (MissionWizardPage, CoverageStep, FocusAreaStep, PreviewStep drawer).

Blast radius: Missions wizard only.

---

### `<DateField>`

Promote MissionWizardPage's DateField. Consumers: MissionWizardPage + PreviewStep drawer.

---

### `<SliderInput>`

```jsx
<SliderInput value onChange min={2} max={10} step={1} suffix="sessions" inputWidth={160} />
```

Consolidates SessionsControl + TargetControl.

---

### `<Drawer>`

```jsx
<Drawer open width={400} onClose={...} header={...} footer={...}>
  {body}
</Drawer>
```

Consolidates EditMissionOverviewDrawer, RecruitFiltersDrawer, ContactReasonsPanel inline shells.

Cross-feature warning: FilterPanel (Insights) uses the same pattern. **Do not migrate FilterPanel in this pass.**

---

### `<Checkbox>`

```jsx
<Checkbox checked onChange aria-label={...} />
```

Promote shared custom 18×18 checkbox.

Consumers: RecruitStep, RecruitFiltersDrawer, ContactReasonsPanel.

---

### `<Stepper>`

Promote MissionWizardPage's Stepper verbatim.

---

### `<Field>` + `<TextInput>`

Promote both from MissionWizardPage. Reused inline in PreviewStep drawer.

---

## Phase 3c — Consumer migration

Per primitive: edit consumers in MissionsPage.jsx + wizard step files. Import library, replace inline. Run preview, screenshot, compare.

Pixel-equivalence checkpoint: after every primitive's consumer migration, capture screenshots at Active list / Active detail / Draft incomplete / Draft complete / Completed (success) / Completed (some below) / Completed (closed early) / Wizard step 1 / Step 3 (Coverage) / Step 4 (Focus Areas) / Step 5 (Preview). 11 screens.

If any state shifts visually, halt and surface as question.

---

## Phase 3d — Dead code cleanup

After migration, delete:
- Local `AlertBanner`, `SuccessBanner`, `SetupIncompleteBanner`, `AlmostThereBanner`, `AlertCircleFilled` (Banner consumes the icons internally)
- Local `CircularProgress`
- Local `SelectionAccentBar`
- Local `TimelineSection` (replaced by `<Timeline>`)
- Local `SuccessToast`
- Local `MissionsEmptyState`, `EmptyStateIllustration` (kept as illustration export only)
- Local `DraftSetupChecklist`, `DraftSetupRow`
- Local `DriverChip`, `FocusAreaChip`, `AgentChip`
- Local `DraftSetupBanner` (unused after Banner migration — was internal to incomplete/complete split)
- Wizard step local `Dropdown`, `DateField`, `SessionsControl`, `TargetControl`, `Stepper`, `Field`, `SingleLineInput`
- Wizard inline drawer + checkbox dupes

Avatar palettes consolidated to a single export in `<Avatar>` module; remove the 3 local AVATAR_PALETTE constants.

---

## Phase 4 — Documentation

`docs/component-library.md` — one-line purpose + props API + variants + tone enum + consumer feature list per primitive. Includes a "Token dependencies" section pointing at the relevant `--color-*` / `--shadow-*` tokens.

Skipped: Storybook stories. No Storybook in this project. `// TODO: stories` comments added per new component file.

---

## Naming consistency rules

| Concern | Prop name | Values |
|---|---|---|
| Color / intent | `tone` | `success` `warning` `danger` `info` `neutral` |
| Size | `size` | `sm` `md` `lg` |
| Structural variant | `variant` | component-specific |

Existing `Button.variant` is structural (primary/text/icon/ai) — keep. Existing `Card.tone` is color-intent — keep. New primitives use `tone` for color, `size` for sizing.

---

## Blast radius summary

| Phase | Files touched | Risk |
|---|---|---|
| 3a tokens | globals.css + 6 component files | low — value-for-value swap |
| 3b new primitives | new files only | low — additive |
| 3c migration | MissionsPage + 4 wizard steps + 3 drawer files | medium — many inline-to-import swaps |
| 3d cleanup | MissionsPage + wizards | low — deleting only |
| 4 docs | docs/ | none |

---

## Do not do in this pass

- Refactor DrillHeader, InteractionsHeader (cross-feature, not blocking Missions).
- Refactor FilterPanel.jsx (Insights consumer) — flag, don't migrate.
- Custom tooltip primitive — no existing tooltip beyond `title=""`. Future work.
- Modal primitive — Missions has none. Future work.
- Rename `Button.variant` → `tone`. Touches every page. Defer.
- Storybook setup. Project has none.
- Cross-feature visual regression sweeps. Phase 5+.

---

## Pragmatic execution note

Phase 3 is large (~20 primitives, ~9 consumer files, ~2.5k lines of refactor). To maintain auto-mode forward momentum while preserving pixel-equivalence, execution proceeds in steps 1–14 first (Missions-only, high leverage). Steps 15–22 (wizard refactor) cycle through after steps 1–14 verify. Each step is committed mentally before moving to the next so any regression is locally bounded.

If verification at any step shows pixel drift, halt that step's migration and surface the divergence rather than continue.
