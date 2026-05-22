# Missions Component Audit

Read-only inventory of every UI primitive used by the Missions feature. Captures location (library / local / inline), variants in use, consumers, inconsistencies, token deltas, and a per-component recommendation.

Scope: Missions landing page, create-mission wizard, detail panes, drawers, modals, banners. Excludes Insights / Learning Hub / Drill / Mira (flagged when shared).

Generated 2026-05-12.

---

## Library primitives (already shared)

### PageHeader

**Purpose:** Two-row module page header — identifier + primary CTA on row 1; filter pills + search + toolbar on row 2.
**Location:** library — [components/PageHeader.jsx](../components/PageHeader.jsx)
**Variants in use:** identifier-only; identifier + CTA; identifier + filters + toolbar; identifier + CTA + filters + toolbar. Filter pill: cycle-onClick legacy + new `options[]` + `onSelect` dropdown.
**Used in:** [components/MissionsPage.jsx](../components/MissionsPage.jsx), [components/InteractionsPage.jsx](../components/InteractionsPage.jsx) (header pattern not shared exactly), [components/DrillHeader.jsx](../components/DrillHeader.jsx) (similar but separate primitive).
**Inconsistencies:** `DrillHeader` and `InteractionsHeader` (inline in InteractionsPage) duplicate parts of this surface. Not in this pass.
**Token deltas:** none observed.
**Recommendation:** keep as-is. Already library. Cross-feature consolidation deferred.

---

### Card

**Purpose:** Surface primitive — white / muted / outline tones, configurable padding and shadow.
**Location:** library — [components/Card.jsx](../components/Card.jsx)
**Variants in use:** `tone="default"` (12px radius white), `tone="muted"` (8px radius tinted), `tone="outline"` (8px radius white + 1px border). `shadow` boolean opt-in.
**Used in:** MissionsPage, MissionWizardPage, PreviewStep, DrillCard, DrillDetailPage, InteractionsPage, many.
**Inconsistencies:** Some Missions consumers override the surface inline (`background: #FFFFFF`, `borderRadius: 8`, custom shadow) rather than reusing Card primitive. See MissionCard / DraftMissionCard / CompletedMissionCard — all render a `<button>` with inline card styling rather than wrapping Card. Reason: outer element must be `<button>` for click semantics; Card always renders `<div>`. Could add `as` prop, but rule-of-three says inline is fine for now.
**Token deltas:** Card's shadow uses inline `"0 2px 4px rgba(69, 70, 79, 0.15)"` (Card.jsx line 50). Same value duplicated as inline shadow on MissionCard / DraftMissionCard / CompletedMissionCard buttons. Should be `--shadow-card` token.
**Recommendation:** add `--shadow-card` token. Keep Card as-is. Mission list cards stay inline (`<button>` requirement).

---

### Button

**Purpose:** Single primitive with 4 variants: primary, text, icon, ai.
**Location:** library — [components/Button.jsx](../components/Button.jsx)
**Variants in use:** All four. Sizes sm/md/lg on icon. `bordered`, `uppercase`, `fullWidth`, `disabled`, `leadingIcon`, `trailingIcon`.
**Used in:** Universally.
**Inconsistencies:** Some wizard step buttons override height inline (`height: 32, minWidth: 0, paddingInline: 16`) repeatedly. Could ship a `size="sm"` for primary/text variants instead of inline overrides. Currently size only affects icon variant.
**Token deltas:** none.
**Recommendation:** keep. Optional: extend `size` to primary/text variants. Out of this pass.

---

### StatCard

**Purpose:** Icon + label + value tile. Two sizes (sm/lg). Optional trailing slot.
**Location:** library — [components/StatCard.jsx](../components/StatCard.jsx)
**Variants in use:** `size="sm"` only in Missions (global KPI row + various). `size="lg"` used elsewhere (Insights TotalInteractions / Contact Center).
**Used in:** MissionsPage (global KPI row), Insights cards.
**Inconsistencies:** Missions detail KPI tiles (Agents Below Target / Last Roleplay / Roleplays / Contact Reasons / Mission Duration) do NOT use StatCard — they're rendered inline via `dkStyles` because they must be flush-edge with vertical dividers between them (grouped row, no per-tile chrome). Different chrome model than StatCard offers. Same for Draft-complete stat tiles (Agents Recruited / Timeline / Minimum Practice Sessions).
**Token deltas:** none.
**Recommendation:** Promote a new `<StatTileRow>` library composite for the grouped-row inline-stat pattern used in Missions. Or extend StatCard with a `bare` (no chrome) variant + a wrapper composite. Either way: net new primitive.

---

### TabsRow

**Purpose:** Tab strip with active underline + optional right-aligned action slot.
**Location:** library — [components/TabsRow.jsx](../components/TabsRow.jsx)
**Variants in use:** Plain tabs with active indicator. With `action` slot. With per-tab count.
**Used in:** DrillDetailPage, MissionsPage (Mission Performance: By Focus Area / By Agent / By Driver), LearningHubPage.
**Inconsistencies:** none.
**Token deltas:** none.
**Recommendation:** keep as-is.

---

### MultiLineInput

**Purpose:** Textarea wrapper with consistent styling.
**Location:** library — [components/MultiLineInput.jsx](../components/MultiLineInput.jsx)
**Variants in use:** Default; with character limit feedback.
**Used in:** MissionWizardPage (DefineMissionStep), PreviewStep (drawer), NewRoleplayContextPage, MiraSetupContextPanel.
**Inconsistencies:** none.
**Recommendation:** keep.

---

### Toggle

**Purpose:** Boolean on/off switch.
**Location:** library — [components/Toggle.jsx](../components/Toggle.jsx)
**Variants in use:** Default.
**Used in:** DrillDetailPage.
**Inconsistencies:** none.
**Recommendation:** keep.

---

### ComingSoon

**Purpose:** Placeholder page for unbuilt routes.
**Location:** library — [components/ComingSoon.jsx](../components/ComingSoon.jsx)
**Variants in use:** Default.
**Used in:** Many routes.
**Inconsistencies:** none.
**Recommendation:** keep.

---

## Local-to-Missions components (rendered inside MissionsPage.jsx)

### MissionCard

**Purpose:** Active mission list card with progress bar + time-remaining chip.
**Location:** local — [components/MissionsPage.jsx](../components/MissionsPage.jsx) ~line 220
**Variants in use:** state ∈ {just_started, on_track, ending_soon, ends_today} — each maps to an accent + progress tone. `ends_today` adds striped-tail progress.
**Used in:** MissionsPage Active filter list.
**Inconsistencies:** `<button>` with inline shadow + radius. Shadow value duplicated from Card. Cannot use Card primitive directly (Card renders `<div>`).
**Token deltas:** `boxShadow: "0px 2px 4px rgba(69, 70, 79, 0.15)"` (mcStyles.card) — same value 3× across Mission/Draft/Completed cards. Should become `--shadow-card`.
**Recommendation:** keep local. Move shadow to token. Extract `<SelectionAccentBar>`, `<MissionProgressBar>`, `<InlineStatusAffordance>` to library since they are reused.

---

### DraftMissionCard

**Purpose:** Draft mission list card with placeholder fallbacks + Draft inline affordance.
**Location:** local — MissionsPage.jsx
**Variants in use:** any combination of filled/missing fields (description, agentCount, tags, dates).
**Inconsistencies:** Duplicates `mcStyles.card` shell, `countBadge`, `countLabel`, `dot`, `tagChip`, `overflowChip`, `progressTrack`, `dateRange` from MissionCard. Could share via composition or shared style object.
**Token deltas:** same shadow as MissionCard. Plus draft chip uses `var(--color-warning-bg)` + `var(--color-warning)` — fine.
**Recommendation:** keep local. Share base styles via a single `cardShellStyle` module-level constant. Move shadow to token.

---

### CompletedMissionCard

**Purpose:** Completed mission list card — green progress bar + 🎉 Completed affordance.
**Location:** local — MissionsPage.jsx
**Inconsistencies:** Same card-shell duplication as MissionCard + DraftMissionCard.
**Recommendation:** keep local. Share shell. Move shadow to token.

---

### MissionDetail / DraftMissionDetail / CompletedMissionDetail

**Purpose:** Right-column unified card variants per mission state.
**Location:** local — MissionsPage.jsx
**Inconsistencies:** All three wrap `<Card>` with identical inline styles (`flexDirection: column, alignItems: stretch, gap: 16, overflow: hidden`). Could be a shared `<DetailCardShell>` wrapper.
**Recommendation:** extract `<DetailCardShell>` local helper.

---

### DetailHeader (Active) / CompletedDetailHeader / DraftDetailHeader

**Purpose:** Detail-pane title row — title + description + status indicator + kebab/trash.
**Location:** local — MissionsPage.jsx
**Inconsistencies:** Each variant rolls its own header layout. The shared `dhStyles` is reused — good. Header right-side affordance changes per state (time-chip + kebab; Completed affordance + kebab; Draft affordance + trash or kebab). Could be a single `<DetailHeader>` with slots for `statusIndicator` and `actions`.
**Recommendation:** consolidate into one `<DetailHeader title desc statusIndicator actions />`.

---

### SelectionAccentBar

**Purpose:** Gradient bar at top edge of selected list card.
**Location:** local — MissionsPage.jsx ~line 199
**Inconsistencies:** Hard-coded gradient `linear-gradient(90deg, var(--do-brand-blue) 0%, var(--color-secondary-500) 100%)`. Stops reference existing tokens.
**Recommendation:** promote to library as `<SelectionAccentBar>`. Used 3× already. Optional: add `--gradient-selection-accent` token for reuse.

---

### Inline status affordance (time chip / Draft / Completed)

**Purpose:** Icon + colored text, no chip wrapper. Tone keyed by state.
**Location:** inline — 3 separate inline implementations across `mcStyles.timeChip`, `ddStyles.statusAffordance`, `completedStyles.affordance`. Plus `dhStyles.timeChip` (active detail header).
**Variants in use:** time chips (`Ends Today`, `3 days left`, `45 days left` — danger/warning/medium/tertiary), Draft (amber), Completed (success).
**Token deltas:** uses existing tone tokens. No new tokens.
**Recommendation:** **promote** to library as `<InlineStatusAffordance tone icon>{children}</InlineStatusAffordance>` with tone enum {success, warning, danger, info, neutral}. High-leverage promotion — 5+ inline copies.

---

### AlertBanner / SuccessBanner / SetupIncompleteBanner / AlmostThereBanner

**Purpose:** Tinted-background banner — leading icon + heading + body + optional trailing action.
**Location:** local — MissionsPage.jsx — 4 distinct render functions
**Variants in use:**
- danger tone with actions (`AlertBanner` for `ends_today` mission)
- warning tone with actions (`AlertBanner` for `ending_soon`)
- success tone with embedded circular progress (`SuccessBanner` for `all_met` completed)
- info tone with embedded circular progress (`SuccessBanner` for `some_below` / `closed_early`)
- warning tone with filled exclamation circle (`SetupIncompleteBanner`)
- warning tone with AlertTriangle icon + no actions (`AlmostThereBanner`)
- success tone with Publish CTA (legacy `DraftSetupBanner` complete path — now unused / can be deleted)
**Inconsistencies:** Same banner shell, 4 separate implementations.
**Token deltas:** uses existing `--color-{success,warning,error,info}-{bg,text}` tokens.
**Recommendation:** **consolidate** into single `<Banner tone heading body icon actions leading?>` primitive. `leading` slot accepts a custom node (e.g., circular progress for the Completed summary variant).

---

### CircularProgress

**Purpose:** SVG circular gauge with percentage label.
**Location:** local — MissionsPage.jsx — used inside SuccessBanner
**Variants in use:** 56px diameter, configurable ring color.
**Token deltas:** none.
**Recommendation:** **promote** to library as `<CircularProgress pct size ringColor>`. Reusable.

---

### DetailKPIs (active) / CompletedDetailKPIs

**Purpose:** Grouped inline-stat row — N tiles separated by vertical dividers, wrapped in single bordered card.
**Location:** local — MissionsPage.jsx via `dkStyles`
**Variants in use:** 4 tiles (active state) + 5 tiles (completed state, adds Mission Duration). Optional sub-label under value. Optional info-icon trailing label. Optional `bg-error` highlight on tile (active ends_today).
**Token deltas:** none.
**Recommendation:** **promote** to library as `<StatTileRow tiles[]>` where each tile has `{ label, value, sublabel?, info?, tone? }`.

---

### PerformanceSection

**Purpose:** Tabs + table for mission performance (By Focus Area / By Agent / By Driver).
**Location:** local — MissionsPage.jsx
**Variants in use:** focus area tab (live data) + agent + driver tabs (placeholder).
**Inconsistencies:** Renders its own table chrome via `pcStyles`. Similar table chrome appears in InteractionsSection, AgentResultsSection — three slightly different inline table implementations.
**Token deltas:** uses existing border/divider tokens.
**Recommendation:** **promote** a `<DataTable columns rows footer>` primitive. Cross-feature also used in InteractionsPage. Defer cross-feature consolidation; build the primitive and migrate Missions consumers only.

---

### InteractionsSection / AgentResultsSection

**Purpose:** Mission detail tables — Roleplay Interactions + Agent Results.
**Location:** local — MissionsPage.jsx
**Recommendation:** migrate to `<DataTable>` once promoted.

---

### TimelineSection

**Purpose:** Vertical event log with tone-keyed dots + connector lines.
**Location:** local — MissionsPage.jsx ~line 750
**Variants in use:** dots in tone {success, warning, info, neutral}.
**Token deltas:** none.
**Recommendation:** **promote** as `<Timeline events>` with `event.tone ∈ {success,warning,info,neutral,danger}`.

---

### SuccessToast

**Purpose:** Bottom-left ephemeral success message.
**Location:** local — MissionsPage.jsx
**Token deltas:** none. Uses `--shadow-8`.
**Recommendation:** **promote** as `<Toast tone>{message}</Toast>` (default success). Auto-dismiss timer optional.

---

### DriverChip / FocusAreaChip / AgentChip

**Purpose:** Pill chip variants for the Draft-complete `Additional Details` block.
**Location:** local — MissionsPage.jsx ~line 600
**Variants in use:**
- DriverChip: label + count badge + info
- FocusAreaChip: type icon (seal/sparkle) + label + percent badge + info
- AgentChip: avatar + name + info
**Inconsistencies:** Each chip is a distinct local component with overlapping shell (`ddcStyles.chip`, `chipLabel`, etc.). Could be a single `<Chip>` primitive with leading + trailing slots.
**Token deltas:** seal/sparkle palette uses `--color-icon-tertiary-fg`. Count badge uses inline `#E8ECFF` / `#245BFF` (matches existing `--nav-rail-bg` / `--nav-rail-active` but those are nav-specific). Should align to a generic `--badge-info-bg` / `--badge-info-fg` or reuse existing pill tokens.
**Recommendation:** **consolidate** to `<Chip leading? trailing? label />` primitive. Then keep DriverChip / FocusAreaChip / AgentChip as thin specializations OR pass slots inline. PartialFocusAreaTypeIcon maps focusArea.type → seal|sparkle (codify mapping in helper).

---

### DraftSetupChecklist + DraftSetupRow

**Purpose:** Vertical list of setup steps with status indicator + label + chevron + hover/next-up highlight.
**Location:** local — MissionsPage.jsx
**Variants in use:** done (green check) vs incomplete (gray circle). Hover / focused / next-up state.
**Token deltas:** uses `--color-primary-alpha-08`.
**Recommendation:** **promote** as `<ChecklistRow status label onClick highlighted?>` + `<Checklist>` container.

---

### AlertCircleFilled

**Purpose:** Filled amber exclamation disc (SVG inline).
**Location:** local — MissionsPage.jsx ~line 510
**Recommendation:** keep local. One callsite. If reused, promote.

---

## Local-to-wizard components (rendered inside wizard step files)

### Stepper (MissionWizardPage)

**Purpose:** Horizontal breadcrumb stepper with back chevron.
**Location:** local — MissionWizardPage.jsx ~line 178
**Variants:** active step bold + primary color, completed steps bold + ink, future steps light.
**Recommendation:** **promote** as `<Stepper steps activeIndex onBack>` to library. Reusable for future wizards (NewRoleplay flow already has its own).

---

### Field (MissionWizardPage)

**Purpose:** Label + optional info icon + child input wrapper.
**Recommendation:** **promote** as `<Field label info?>{children}</Field>`. Reused in DefineMissionStep + inline in PreviewStep drawer.

---

### SingleLineInput

**Purpose:** Single-line text input with optional character counter overlay.
**Location:** local — MissionWizardPage.jsx ~line 315
**Recommendation:** **promote** as `<TextInput value onChange max? placeholder?>`. Used by mission name input. Also useful elsewhere (search inputs are different shape).

---

### Dropdown (wizard generic)

**Purpose:** Pill-style trigger + portal menu with options, optional `disabled` per option.
**Location:** inline-duplicated in MissionWizardPage, CoverageStep, FocusAreaStep, PreviewStep drawer.
**Inconsistencies:** Four near-identical dropdown implementations. All use the same hardcoded menu shadow.
**Token deltas:** menu shadow `0px 5px 5px -3px rgba(...), 0px 8px 10px 1px rgba(...), 0px 3px 14px 2px rgba(...)` appears 4× inline. Same value as existing `--shadow-8` token in globals.css. Replace inline with `var(--shadow-8)`.
**Recommendation:** **promote** unified `<Dropdown value onChange options placeholder>` primitive. Replace 4 inline dupes.

---

### DateField

**Purpose:** Styled button trigger + hidden native `<input type="date">`. Displays formatted DD MMM YYYY.
**Location:** local — MissionWizardPage.jsx ~line 393. Duplicated inline in PreviewStep drawer.
**Recommendation:** **promote** as `<DateField value onChange placeholder?>`. Used twice.

---

### SessionsControl / TargetControl (slider + numeric input composite)

**Purpose:** Range slider with linear-gradient fill + numeric input, two-way bound, clamped.
**Location:** local — MissionWizardPage.jsx (SessionsControl) + FocusAreaStep.jsx (TargetControl).
**Inconsistencies:** Two near-identical implementations differing only in min/max + value suffix.
**Token deltas:** Slider gradient uses `var(--color-button-primary-bg)` + `var(--color-divider-card)`. Slider thumb / track radius 999. Height 6.
**Recommendation:** **promote** unified `<SliderInput value onChange min max step suffix? width?>` to library.

---

### CustomCheckbox (Recruit + ContactReasons + RecruitFilters)

**Purpose:** 18×18 custom-styled checkbox with rounded check icon when on.
**Location:** inline duplicated across RecruitStep, RecruitFiltersDrawer, ContactReasonsPanel.
**Recommendation:** **promote** as `<Checkbox checked onChange>`.

---

### Drawer shell (right-edge fixed)

**Purpose:** Fixed-position right-edge panel with header + body + footer + close button.
**Location:** inline — EditMissionOverviewDrawer (PreviewStep), RecruitFiltersDrawer, ContactReasonsPanel, FilterPanel (Insights, also Missions context).
**Variants:** width 360–400 (varies). Same shadow `-4px 0 24px rgba(0,0,0,0.10)`. Same z-index 40.
**Token deltas:** shadow duplicated across 4 inline drawers — should be `--shadow-drawer`.
**Recommendation:** **promote** as `<Drawer open onClose width? header footer>{body}</Drawer>` library primitive.

---

### Avatar (initials chip with deterministic color)

**Purpose:** Circular initials chip with hash-keyed background color.
**Location:** inline — PreviewStep (recruited agents), RecruitStep (agent table), MissionsPage (interactions table + agent results table).
**Variants:** sizes 22 / 26 / 28 / 30. Deterministic color via name hash (same `AVATAR_PALETTE` defined twice — MissionsPage + PreviewStep + RecruitStep).
**Token deltas:** 6-color palette inline. Should be `--avatar-palette-*` tokens OR shared exported constant.
**Recommendation:** **promote** as `<Avatar name initials? size?>` library primitive with the palette exported as a constant. Shared color hash function consolidated.

---

### QA Score badge / Target badge (Met/Not Met)

**Purpose:** Pill-shaped tone-keyed badge for score thresholds + status.
**Location:** inline — RecruitStep (QA score buckets ≥90/70–89/<70), MissionsPage (Met/Not Met agent results + Target Met % buckets ≥75/40–74/<40).
**Variants:** success / warning / danger via `--color-{success,warning,error}-bg` + `*-text`.
**Recommendation:** **promote** as `<StatusBadge tone>{label}</StatusBadge>`. Used 4+ inline.

---

### EmptyState

**Purpose:** Illustration + heading + body + optional CTA — centered in card.
**Location:** local — MissionsPage (`MissionsEmptyState` + `InteractionsSection` empty), DrillCard (different shape).
**Recommendation:** **promote** as `<EmptyState illustration heading body cta?>`. Used 2+ times in Missions.

---

### Tooltip

**Purpose:** Hover-revealed info tooltip on `<info>` icons.
**Location:** native `title=""` attribute only — no custom tooltip primitive exists.
**Token deltas:** N/A.
**Recommendation:** out of scope for this pass. Flag as future work — custom tooltip primitive would enable richer content (driver chip lists contact reasons, focus area chip explains target, etc.).

---

### Modal / dialog

**Purpose:** Center-screen confirm dialog (Delete Mission, Extend Timeline, Close Mission).
**Location:** **none implemented.** MissionWizardPage uses native `window.confirm()` for cancel. Kebab menu items log to console only.
**Recommendation:** out of scope for this pass — modal primitive doesn't exist yet, and the spec didn't require us to implement Delete/Extend/Close in real form. Flag as future work.

---

### Progress bar — striped tail variant

**Purpose:** Solid-tone fill + diagonal striped tail (15%) for `ends_today` state to signal "running out".
**Location:** inline — MissionCard.
**Token deltas:** stripe rendered via `repeating-linear-gradient(135deg, {tone} 0 5px, rgba(255,255,255,0.55) 5px 9px)`. Pattern not tokenized.
**Recommendation:** **promote** `<ProgressBar value tone striped? height?>` primitive. Reused across Active/Draft/Completed cards.

---

## Token deltas (consolidated)

Unavoidable additions:

| Token | Value | Reason |
|---|---|---|
| `--shadow-card` | `0 2px 4px rgba(69, 70, 79, 0.15)` | Card.jsx inline + 3 mission card inline copies. Already de-facto a single value. |
| `--shadow-drawer` | `-4px 0 24px rgba(0, 0, 0, 0.10)` | 4 inline drawers all use same value. |

Avoidable (already mapped to existing tokens):

| Inline value | Existing token |
|---|---|
| Menu/dropdown shadow trio | `--shadow-8` (already in globals.css) |
| `#E8ECFF` count-badge bg | `--nav-rail-bg` — but semantic mismatch; consider `--badge-info-bg` future addition (skip this pass — reuse `--color-primary-alpha-08` where possible) |
| `#245BFF` count-badge fg | `--nav-rail-active` — same semantic mismatch. Skip. |

Recommended naming inconsistencies to fix in this pass:

- Existing components use `variant` (Button), `tone` (Card), `size` (Button, StatCard). New primitives should standardize: **`tone`** for color/intent, **`size`** for sizing. **`variant`** reserved for structural type (Button's structural variants).

---

## Recurring inline patterns summary

| Pattern | Inline copies | Recommendation |
|---|---|---|
| Mission card shell (`<button>` + radius + shadow + flex column) | 3 | Share local style constant `cardShellStyle` |
| Inline status affordance (icon + tone-colored text) | 5+ | Promote `<InlineStatusAffordance>` |
| Banner shell | 4 | Consolidate `<Banner>` |
| Dropdown trigger + menu | 4 | Promote `<Dropdown>` |
| Slider + numeric input | 2 | Promote `<SliderInput>` |
| Drawer shell | 4 | Promote `<Drawer>` |
| Custom checkbox | 3 | Promote `<Checkbox>` |
| Avatar circle | 4 sites | Promote `<Avatar>` |
| Pill chip with leading/trailing slots | 3 site-specific variants | Promote `<Chip>` |
| Status / tone badge | 4 sites | Promote `<StatusBadge>` |
| Vertical timeline | 1 (Missions) | Promote `<Timeline>` (single consumer but high-value reusable) |
| Circular gauge | 1 | Promote `<CircularProgress>` |
| Stepper | 1 (Mission wizard) | Promote `<Stepper>` |
| Selection accent bar | 3 | Promote `<SelectionAccentBar>` |
| Striped progress bar | 1 | Promote `<ProgressBar>` |
| Setup checklist | 1 | Promote `<Checklist>` + `<ChecklistRow>` |
| EmptyState | 2 | Promote `<EmptyState>` |
| Toast | 1 | Promote `<Toast>` |

---

---

## Addendum — Sandbox redesign standardization (2026-05-21)

The four-layout Missions landing sandbox (Current / Table / Kanban /
Hybrid) and the new `MissionDetailPage` were audited against the
standardization addendum. Canonical resolutions for every surface they
touch:

| Surface                                | Canonical primitive used                                                                            |
|----------------------------------------|------------------------------------------------------------------------------------------------------|
| Module page header (3 new layouts)     | [`PageHeader`](../components/PageHeader.jsx) with `identifier / primaryAction / filters / toolbar`. |
| Detail page header                     | `<Card padX={20} padY={16} shadow>` + `<Button variant="icon">` back arrow — same shell as [`TaskRecordPage`](../components/TaskRecordPage.jsx) / [`SkillRecordPage`](../components/SkillRecordPage.jsx). |
| Card containers (detail body)          | [`Card`](../components/Card.jsx) (`padX/padY` props). KPI tiles + Mission Performance + Roleplay Interactions all use the same primitive. |
| Tab row inside cards                   | [`TabsRow`](../components/TabsRow.jsx) — drives the `By Focus Area / By Agent / By Driver` tabs in `MissionDetailContent`. |
| Buttons                                | [`Button`](../components/Button.jsx) with `variant="icon" / "text" / "primary"`. Detail-page back, kebab, and action chips all consume it. |
| Status pill                            | Inline pill using `STATUS_TONE` map → existing `--color-info / --color-error / --color-warning / --pill-bg` tokens. Same map used for Kanban column accents. |
| Progress bar                           | Inline track + fill using `--color-success / --color-warning / --color-error` thresholds via `progressColor`. Shared across MissionsTable and MissionCardCompact. |
| Avatar (initials)                      | `AVATAR_PALETTE` + `avatarColor(seed)` hashing, exported from [`MissionsTable`](../components/MissionsTable.jsx). |
| Sandbox switcher                       | [`SandboxSwitcher`](../components/sandbox/SandboxSwitcher.jsx) — token-aligned with [`MilestoneSideRail`](../components/MilestoneSideRail.jsx). |

### Narrow Agents-chassis adoption (Dense Table only)

The Dense Table landing and the Mission detail page both render inside
[`PageLayout`](../components/PageLayout.jsx) — the same primitive
[`AgentsPage`](../components/AgentsPage.jsx) and
[`AgentProfile`](../components/AgentProfile.jsx) consume. That sets the
content column to `--page-content-max-width: 1068px`, centered with
`--page-gutter: 64px` on each side. Kanban and Hybrid keep their wider
1440px chassis (per addendum §4: kanban columns + inline-expanded rows
need horizontal room).

Verified widths in browser:

| Surface             | Content width |
|---------------------|---------------|
| Dense Table landing | 1068px        |
| Mission detail page | 1068px        |
| Kanban landing      | 1440px        |
| Hybrid landing      | 1440px        |

The table's fixed-column widths were shrunk to fit the narrow column
(sum of fixed widths ≈ 812px + Mission flex min 200px = 1012px). Cell
horizontal padding tuned to 12px from 16px so columns finish inside the
table card.

### Dense table polish (§1 of the polish addendum)

| Spec item                | Implementation                                                                                                       |
|--------------------------|---------------------------------------------------------------------------------------------------------------------|
| Body row min-height 56px | `padding: 16px` on every body cell + intrinsic content height.                                                       |
| Header row 48px          | `th { height: 48px }` + heavier `1.5px var(--color-divider-card)` bottom border.                                    |
| Horizontal cell padding 16px | Uniform across header + body.                                                                                   |
| Fit-in-viewport          | `table-layout: fixed` + explicit `<colgroup>` widths matching the spec table. Mission column flexes; others fixed.   |
| Status + Days-left placement | Two adjacent columns (Status then Days-left). Independent sortability preserved.                                 |
| Mission truncation       | `text-overflow: ellipsis` + `title={mission.name}` for the full string on hover.                                     |
| Focus-area `+N` overflow | Max 2 chips visible + `+N` overflow chip carrying the hidden labels via `title` (newline-separated).                 |
| Sort UI                  | Chevron renders only on the active sort column; inactive sortable headers carry no chevron and hover-tint to `#F5F4FB`. |
| Default sort             | Status asc (workflow order: Active → At Risk → Ending Soon → Completed) with Days-left asc as a stable secondary.    |
| Sort persistence         | `dataorb.missions.tableSort` localStorage key, JSON-encoded `{ key, dir }`.                                          |

### Known deviations / follow-ups

1. **Dark tooltip on truncation.** Spec asks for the `#1F2440` dark
   tooltip surface (same as the sparkline hover bubble) with 300 ms
   hover delay. V1 ships native `title=""` to avoid building a positioned
   tooltip primitive. The platform has no shared `Tooltip` yet — promote
   from `MetricSparkline`'s inline implementation once a third surface
   needs it (rule of three).
2. **Column visibility / resize / multi-column sort.** Not in V1.
3. **Kanban card.** [`MissionCardCompact`](../components/MissionCardCompact.jsx)
   is a bespoke card; `<Card>` did not accept the column-padding density
   Kanban needed without overrides. Promote a `<CompactCard>` (or add a
   `density` prop) once another Kanban-style surface ships.
4. **Status enum order.** Workflow order shipped per V1 default. Flag if
   Akash prefers urgency-first (`At Risk < Ending Soon < Active < Completed`).
5. **Date formatting.** ✓ RESOLVED (2026-05-22). Superseded — the
   `23 Mar 2026` convention is retired. Every date in DataOrb now routes
   through the shared [`formatDate`](../components/formatDate.js) util:
   - `formatDate` → `Mar 23, 2026`
   - `formatDateRange` → `Mar 23 – Apr 1, 2026` (same year, en-dash, year
     once) / `Dec 28, 2025 – Jan 4, 2026` (cross-year)
   - `formatDateTime` → `Mar 23, 2026, 3:45 PM` (12-hour)

   Migrated off inlined formatters (local `MONTHS`/`fmt*`/`formatDate`
   deleted): AgentsPage, RoleplayCoverage, AdherenceRateChart,
   ContactDriverTable, SkillsPage, SkillRecordPage, MissionWizardPage,
   PreviewStep (computeEndDate keeps date math, returns a Date),
   RecruitStep, CreateTaskWizardPage, ClosedMissions, MissionsPage
   (fmtDateShort/fmtDateRange/fmtFullDate/fmtBannerDate), InteractionsPage
   (→ formatDateTime), TaskRecordPage (→ formatDateTime). All UTC, ISO
   stays the wire format, null → `—`. `CHURN_MONTHS`/`SALES_MONTHS` in
   ChurnRiskCard/SalesOutcomesCard are chart data series (month buckets +
   metric values), not date formatters — intentionally untouched.
   Verified in browser: `Mar 22, 2026` (Agents), `May 12 – Jun 26, 2026`
   (mission cards), `May 7, 2026, 4:50 PM` (Interactions),
   `Mar 24, 2026, 6:00 AM` (Coaching Brief).
6. **PageHeader detail-page slots.** `PageHeader` exposes
   identifier/primaryAction/filters/search/toolbar — no
   title/back/subtitle/accessory slots needed by detail pages. Detail
   pages across the prototype (TaskRecordPage / SkillRecordPage / now
   MissionDetailPage) all use the `<Card padX={20} padY={16}>` shell
   instead. Long-term, extracting a shared `DetailHeader` primitive is
   worth doing.
7. **KebabMenu portal + smart positioning.** ✓ RESOLVED (2026-05-22).
   The per-row kebab menu was clipped by adjacent row cells — a
   stacking-context + `overflow: hidden` trap, not a z-index problem.
   [`KebabMenu`](../components/KebabMenu.jsx) now renders its surface via
   `createPortal(…, document.body)` so it escapes the table card's
   clipping entirely. Position is computed from the trigger's
   `getBoundingClientRect()` in viewport coordinates (`position: fixed`):
   - [x] Renders in a portal (parent is `<body>`, not the row cell).
   - [x] Opens downward by default with an 8 px gap; **flips upward** when
     `spaceBelow < menuHeight + 8` (verified on the bottom-most row at the
     viewport bottom — menu sits above the trigger, fully in view).
   - [x] Right-edge aligns with the trigger; clamps 8 px from the left and
     right viewport edges (defensive — the narrow chassis never pushes the
     menu past the left edge in practice).
   - [x] Two-pass `useLayoutEffect` measure (`visibility: hidden` until
     coords are set) — no position flash.
   - [x] Closes on: item click (handler fires first), scrim click, Escape,
     window scroll (capture phase), and resize. Focus returns to the
     trigger on item/scrim/Escape close.
   - [x] Verified on Missions Dense Table rows **and** the Current option's
     active `DetailHeader`. `CompletedDetailHeader` and the complete-variant
     `DraftDetailHeader` were migrated off their inline `dhStyles.menu`
     duplicates (identical chrome → zero visual change) and now consume the
     same shared component; `dhStyles.menu/menuScrim/menuItem` deleted.

   **Not migrated (flagged):**
   - `NextBestActions` keeps its own local kebab — a deliberately distinct
     visual (round bordered `MoreHorizontal` button; `shadow-4` + bordered
     `minWidth: 160` menu). Folding it into the shared `KebabMenu` would
     change its appearance (the spec's "do not change visual styling"
     guardrail), so it was left as-is. True single-source would require
     either NBA adopting the standard kebab visuals or `KebabMenu` gaining
     trigger/menu style variants — needs a design call.
   - `MissionDetailPage`'s header kebab is a stub `<Button>` with no menu
     (logs only) — nothing to clip, so not converted to a full menu (that
     would be net-new behavior). Revisit when its actions are specified.
   - Arrow-key navigation within the menu (Up/Down cycling) is a follow-up;
     V1 ships focus-first-item + Escape + DOM-order tab, per spec §6.
8. **Agent Profile Missions card — Active stack → accordion.** ✓ SHIPPED
   (2026-05-22). The Active Missions stack in
   [`Missions`](../components/Missions.jsx) is now a single-open accordion;
   [`ActiveMissionCard`](../components/ActiveMissionCard.jsx) gained
   `expanded`/`onToggle` props. First mission expanded on load, one open at a
   time, collapse-all is a valid state. Collapsed header: leading
   `ChevronRight` (rotates 90° on expand, 120 ms), title, roleplay +
   days-left meta, and a focus-area summary via `<InlineStatusAffordance>`
   (`All N met` / `N met, M below` / `All N below`). The summary is hidden
   when expanded (the table below carries per-area status). Header is one
   `role="button"` toggle target (Enter/Space, `aria-expanded` +
   `aria-controls`); `View mission` stops propagation so it navigates
   without toggling. Body animates via `max-height` (200 ms ease-out).
   **Deviation:** spec §8 says unmount the table when collapsed, but §5/§6
   make the `max-height` transition the V1 default — and animating both
   directions needs the body mounted. Chose always-mounted (render cost is
   nil at the ≤3-mission `MISSION_CAP`); true unmount + animation needs a
   measured-height state machine (follow-up). **Open question (spec §9.1):**
   summary tone is `success` (none below) / `danger` (none met) / `warning`
   (mixed) — confirm whether a majority-below mission should read `danger`
   rather than `warning`. Other §9 items (pill in expanded state, count
   badges, urgency auto-expand, persistence) intentionally not built.

---

## Out-of-scope for this pass

- Cross-feature components (DrillHeader, InteractionsHeader inline) — flagged, not refactored.
- Custom tooltip primitive — not yet implemented, feature work not blocked.
- Modal/dialog primitive — Missions doesn't render any real modal yet (kebab logs, wizard uses native confirm). Future spec.
- Renaming Button `variant` → `tone` — would touch every page. Defer.
- StatCard `bare` mode — promote `<StatTileRow>` separately to avoid conflating.
