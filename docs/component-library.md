# Component Library

Living reference for shared UI primitives. Updated as new primitives land.

Generated 2026-05-12. Reflects Missions standardization pass (Phases 3a–3b partial).

---

## Tokens

### Shadows

| Token | Value | Use |
|---|---|---|
| `--shadow-card` | `0 2px 4px rgba(69, 70, 79, 0.15)` | Standard list-card / panel shadow. Used by `<Card shadow>` + mission list cards. |
| `--shadow-drawer` | `-4px 0 24px rgba(0, 0, 0, 0.10)` | Right-edge fixed drawers + PageLayout overlay panels. |
| `--shadow-8` | (Material-style trio) | Dropdown / popover menus. |

### Other tokens

See [app/globals.css](../app/globals.css) `:root` block for the full token list: brand, neutrals, severity, surfaces, nav, charts, badges, table, chips, radii, fonts, page-layout dimensions.

---

## Primitives

### `<Card>`

[components/Card.jsx](../components/Card.jsx)

Surface primitive — white / muted / outline tones, configurable padding, optional `shadow`.

```jsx
<Card padX={24} padY={24} shadow tone="default">{children}</Card>
```

**Props:** `tone` (`"default" | "muted" | "outline"`), `padX` (number, default 28), `padY` (number, default 24), `shadow` (bool, default false), `style` (escape hatch).

**Used in:** Missions, Insights, Learning Hub, Mira.

---

### `<Button>`

[components/Button.jsx](../components/Button.jsx)

Single primitive with 4 variants.

```jsx
<Button variant="primary" leadingIcon={<Plus size={16} />} onClick={...}>Mission</Button>
<Button variant="text"   uppercase={false}>Cancel</Button>
<Button variant="icon"   size="sm" aria-label="Close"><X size={18} /></Button>
<Button variant="ai">Skip & Generate</Button>
```

**Props:** `variant` (`"primary" | "text" | "icon" | "ai"`), `size` (`"sm" | "md" | "lg"` — affects icon variant), `fullWidth`, `leadingIcon`, `trailingIcon`, `bordered`, `uppercase`, `disabled`, `href`.

**Token dependencies:** `--color-button-primary-bg`, `--color-button-primary-fg`, `--color-text-medium`, `--color-text-tertiary`, `--color-divider-card`.

**Used in:** universal.

---

### `<StatCard>`

[components/StatCard.jsx](../components/StatCard.jsx)

Icon + label + value tile with optional trailing slot. Two sizes.

```jsx
<StatCard icon="mic" label="Total Interactions" value="7,135" size="lg" trailing={<ChevronRight />} onAction={...} />
```

**Used in:** Missions global KPI row, Insights cards.

---

### `<TabsRow>`

[components/TabsRow.jsx](../components/TabsRow.jsx)

Tab strip with active underline + optional right-aligned `action` slot.

**Used in:** Drill, Missions detail (Mission Performance tabs).

---

### `<MultiLineInput>`

[components/MultiLineInput.jsx](../components/MultiLineInput.jsx)

Textarea wrapper with consistent styling.

**Used in:** Mission wizard step 1, Edit Mission drawer, Mira Setup Context, New Roleplay Context.

---

### `<Toggle>`

[components/Toggle.jsx](../components/Toggle.jsx)

Boolean on/off switch.

**Used in:** Drill detail.

---

### `<PageLayout>`

[components/PageLayout.jsx](../components/PageLayout.jsx)

Shared frame for everything right of the SideNav. Owns content max-width, gutter, right-panel dock/overlay behavior.

---

### `<PageHeader>`

[components/PageHeader.jsx](../components/PageHeader.jsx)

Two-row module page header with identifier / primary CTA / filter pills (with dropdown support) / search / toolbar slots.

```jsx
<PageHeader
  identifier={{ icon: <MissionsIcon size={18}/>, label: "Missions", withDropdown: true, onClick: ... }}
  primaryAction={{ label: "Mission", icon: <Plus size={16}/>, onClick: ... }}
  filters={[
    { id: "status", label: "Status", value: "Active",
      options: [{ label: "Active", value: "Active" }, { label: "Draft", value: "Draft" }, { label: "Completed", value: "Completed" }],
      onSelect: setStatus,
    },
  ]}
  toolbar={[
    { id: "search", icon: <Search size={18}/>, label: "Search", onClick: ... },
    { id: "sort",   icon: <ArrowUpDown size={18}/>, label: "Sort", onClick: ... },
  ]}
/>
```

Toolbar group is right-anchored on row 2 via the divider's `margin-left: auto`.

Filter pills accept either legacy `onClick` (cycle behavior) or new `options[]` + `onSelect` (dropdown).

**Used in:** Missions, Drill, Interactions (similar inline header), other module pages.

---

### `<ComingSoon>`

[components/ComingSoon.jsx](../components/ComingSoon.jsx)

Placeholder for unbuilt routes.

---

## New primitives shipped in Missions standardization pass

### `<InlineStatusAffordance>`

[components/InlineStatusAffordance.jsx](../components/InlineStatusAffordance.jsx)

Leading icon + tone-colored text, no background fill. Single primitive for time-remaining chips (`Ends Today`, `45 days left`), inline `🗂 Draft`, `🎉 Completed` indicators.

```jsx
<InlineStatusAffordance tone="danger" icon={<Clock size={12}/>}>Ends Today</InlineStatusAffordance>
<InlineStatusAffordance tone="warning" size="md" icon={<FileClock size={14}/>}>Draft</InlineStatusAffordance>
<InlineStatusAffordance tone="success" size="md" icon={<span aria-hidden>🎉</span>}>Completed</InlineStatusAffordance>
```

**Props:** `tone` (`"success" | "warning" | "danger" | "info" | "medium" | "tertiary"`), `icon`, `size` (`"sm" | "md"`), `children`, `style`.

**Token dependencies:** `--color-success`, `--color-warning`, `--color-error`, `--color-info`, `--color-text-medium`, `--color-text-tertiary`.

**Used in:** Missions Active card + detail header, Draft detail header, Completed card + detail header.

---

### `<Banner>`

[components/Banner.jsx](../components/Banner.jsx)

Tinted-background callout — leading icon + heading + body + optional trailing actions. Consolidates the per-state banners (AlertBanner / SuccessBanner / SetupIncompleteBanner / AlmostThereBanner).

```jsx
<Banner tone="warning" heading="Mission Ends in 3 days" body="..." actions={[
  { label: "Extend Timeline", variant: "primary", onClick: ... },
  { label: "Close Mission",   variant: "secondary", onClick: ... },
]} />

<Banner tone="success"
        heading="All 22 agents reached their readiness targets"
        body="Mission completed successfully on 23 Apr 2026."
        leading={<CircularProgress pct={100} />} />

<Banner tone="warning"
        heading="Mission Setup Incomplete"
        body="Setup the mission to publish"
        leading={<AlertCircleFilled />} />
```

**Props:** `tone` (`"info" | "success" | "warning" | "danger"`), `heading` (string), `body` (string), `leading` (node — overrides tone-default icon), `actions` (array of `{ label, onClick, variant }`).

**Exports:** `AlertCircleFilled` — filled amber exclamation disc SVG used by the draft incomplete state.

**Token dependencies:** `--color-info-{bg,text}`, `--color-success-{bg,text}`, `--color-warning-{bg,text}`, `--color-error-{bg,text}`, `--color-info`, `--color-success`, `--color-warning`, `--color-error`.

**Used in:** Missions Active detail (warning/danger), Completed detail (success/info summary banner), Draft incomplete (warning), Draft complete (warning).

---

### `<CircularProgress>`

[components/CircularProgress.jsx](../components/CircularProgress.jsx)

SVG circular gauge with tone-keyed ring + centered percentage label.

```jsx
<CircularProgress pct={78} size={56} ringColor="var(--color-info)" />
```

**Props:** `pct` (0–100), `size` (px, default 56), `stroke` (px, default 5), `ringColor`, `trackColor`, `label` (bool, default true).

**Used in:** Completed detail Banner leading slot.

---

### `<SelectionAccentBar>`

[components/SelectionAccentBar.jsx](../components/SelectionAccentBar.jsx)

4px-tall blue→violet gradient bar pinned to a card's top edge. Parent must set `position: relative` + `overflow: hidden`.

```jsx
{selected && <SelectionAccentBar />}
```

**Token dependencies:** `--do-brand-blue`, `--color-secondary-500`.

**Used in:** Missions list cards (Active, Draft, Completed).

---

### `<Toast>`

[components/Toast.jsx](../components/Toast.jsx)

Bottom-left ephemeral notification.

```jsx
{visible && <Toast tone="success" message="Mission published" onDismiss={() => setVisible(false)} />}
```

**Props:** `tone` (`"success" | "info" | "warning" | "danger"`, default `"success"`), `message` (string), `onDismiss`.

Auto-dismiss timing is owned by the parent.

**Used in:** Missions post-publish success toast.

---

## Deferred primitives (next standardization pass)

The audit identified the following primitives as candidates for promotion. They remain local-to-Missions in this pass. Each will be promoted when scope permits without risking visual regression.

| Primitive | Status | Rationale for deferral |
|---|---|---|
| `<ProgressBar>` (solid + striped tail) | local | 3 visual variants (active, draft, completed-100%) — consolidation needs careful per-state pixel verification. |
| `<StatTileRow>` (grouped inline stats) | local | 3 callsites diverge on tile count + sublabel + tone — variant API needs more thought. |
| `<Timeline>` (event dots + connectors) | local | 1 callsite — no urgency. |
| `<EmptyState>` (illustration + heading + body + CTA) | local | 2 callsites in Missions. |
| `<Avatar>` (initials + hash color) | inline | 4+ inline copies across Missions + wizard. Shared palette de-duplication has cross-file blast radius. |
| `<Chip>` + `<DriverChip>` / `<FocusAreaChip>` / `<AgentChip>` | local | 3 callsite-specific chip variants on Draft-complete pane. |
| `<StatusBadge>` (Met / Not Met / QA buckets) | inline | 4 inline tone-keyed pill badges. |
| `<Checklist>` + `<ChecklistRow>` | local | Single callsite (Draft setup checklist). |
| `<Dropdown>` (wizard generic) | inline ×4 | Wizard step files — separate refactor pass to avoid mixing with Missions list refactor. |
| `<DateField>` | inline ×2 | Wizard. |
| `<SliderInput>` (`SessionsControl` + `TargetControl`) | inline ×2 | Wizard. |
| `<Drawer>` (right-edge fixed) | inline ×4 | Cross-feature (Insights `FilterPanel` also uses pattern). Don't migrate Insights in Missions pass. |
| `<Checkbox>` (18×18 custom) | inline ×3 | Wizard + drawers. |
| `<Stepper>` (5-step horizontal) | local | Wizard only. |
| `<Field>` + `<TextInput>` | local | Wizard generic form fields. |

The plan in [missions-standardization-plan.md](missions-standardization-plan.md) details proposed APIs + consumer mapping for each deferred primitive.

---

## Not in scope this pass

- Tooltip primitive — currently `title=""` only. Future spec.
- Modal/dialog primitive — Missions has none today.
- Renaming `Button.variant` → `tone` — touches every page. Defer.
- Cross-feature consolidation (DrillHeader, InteractionsPage header) — flagged in audit, not migrated.
- Storybook stories — project doesn't ship Storybook. New components carry `// TODO: stories` comments.

---

## Naming conventions

- `tone` → color / intent prop (`"success" | "warning" | "danger" | "info" | "neutral" | …`).
- `size` → sizing prop (`"sm" | "md" | "lg"`).
- `variant` → structural prop (Button: `primary | text | icon | ai`; reserved for similar shape-changes only).

---

## Token deltas introduced this pass

| Token | Value |
|---|---|
| `--shadow-card` | `0 2px 4px rgba(69, 70, 79, 0.15)` |
| `--shadow-drawer` | `-4px 0 24px rgba(0, 0, 0, 0.10)` |

No other tokens added.

---

## Files migrated (this pass)

- [components/Card.jsx](../components/Card.jsx) — shadow → `--shadow-card`
- [components/MissionsPage.jsx](../components/MissionsPage.jsx) — `--shadow-card` x3, `InlineStatusAffordance` x4 consumers, `Banner` x4 consumers, `CircularProgress` (via Banner), `SelectionAccentBar` import (existing JSX usage already references it), `Toast` x1 consumer. Local `AlertBanner`, `SuccessBanner`, `SetupIncompleteBanner`, `AlmostThereBanner`, `CircularProgress`, `AlertCircleFilled`, `SelectionAccentBar`, `SuccessToast` removed.
- [components/PageHeader.jsx](../components/PageHeader.jsx) — Status filter dropdown support (`options[]` + `onSelect`); right-anchored divider+toolbar group via `marginLeft:auto`.
- [components/PageLayout.jsx](../components/PageLayout.jsx) — overlay panel shadow → `--shadow-drawer`.
- [components/RecruitFiltersDrawer.jsx](../components/RecruitFiltersDrawer.jsx) — shadow → `--shadow-drawer`.
- [components/ContactReasonsPanel.jsx](../components/ContactReasonsPanel.jsx) — shadow → `--shadow-drawer`.
- [components/PreviewStep.jsx](../components/PreviewStep.jsx) — drawer shadow → `--shadow-drawer`.
- [components/CoverageStep.jsx](../components/CoverageStep.jsx) — menu shadow → `--shadow-8`.
- [components/FocusAreaStep.jsx](../components/FocusAreaStep.jsx) — menu shadow → `--shadow-8`.
- [components/MissionWizardPage.jsx](../components/MissionWizardPage.jsx) — menu shadow → `--shadow-8`.

New library files:
- [components/InlineStatusAffordance.jsx](../components/InlineStatusAffordance.jsx)
- [components/Banner.jsx](../components/Banner.jsx)
- [components/CircularProgress.jsx](../components/CircularProgress.jsx)
- [components/SelectionAccentBar.jsx](../components/SelectionAccentBar.jsx)
- [components/Toast.jsx](../components/Toast.jsx)
