# [Learning hub] localization — GUI multilingual + RTL (Arabic)

Audit trail for the design pipeline: 10 divergent directions, scored against
`design-guidelines.md`, culled to the top 3 that were built behind the
`Inline / Ribbon / Coverage` switcher.

## Brief (from the Notion ticket)

Carry the Insights GUI-localization approach to Learning Hub: localize **UI
strings, taxonomy/master-data (role-play categories), filters/search,
help/hint text** into the user's selected language. **Do NOT touch the eval
language** and **do NOT translate the raw transcript / user-defined content**
(ground truth). The real open problem: only LTR is supported today — add
**right-to-left (Arabic)** for the PMI UAE + Kuwait deployment, and get RTL
*readiness* legible now.

Surface chosen: the **Drill page** (`LearningHubPage`) — it carries every
class of string the brief enumerates (page title, primary CTA, search
placeholder, Filters, Active/Library tabs, category + difficulty taxonomy
chips, per-card CTA) plus a content body that must *stay* in its source
language. One screen exercises the whole localization contract.

## Scoring basis

Concept-stage scoring uses the decidable weighted preferences: reuse (UI-2),
affordance clarity (INT-1), drill-down discoverability (INT-2), identity vs.
parameters (UI-7), multilingual expansion tolerance (UI-8), one-primitive-per-
pattern / switcher reuse (INT-3), schema/component structure (UI-5), highlight
discipline (UI-6), empty/zero states (INT-5). Gate-structural risks are flagged
where an approach would *structurally* break a gate (layout system, semantics).
Build-time gates (contrast, focus, ARIA, reduced-motion) are verified later by
the evaluator, not here.

## The 10 directions

| # | Direction | Core idea | Notable rubric pull | Verdict |
|---|-----------|-----------|---------------------|---------|
| 1 | **Inline header language pill + full mirror** | Language lives as a `FilterDropdown` pill in the PageHeader row-2; selecting a locale re-strings the whole surface and flips `dir` on Arabic. Ambient, "Insights default". | High reuse (PageHeader/FilterDropdown already ship), affordance + drill-down clear, zero new chrome. | **TOP 3 — A (Inline)** |
| 2 | **Localization context ribbon** | A dedicated strip between header and tabs: native-name segmented language switcher (left) + Region + Direction badges (right). Separates page *identity* from locale *parameters*. | Strong UI-7 (identity vs. parameters), surfaces RTL readiness explicitly (the ticket's ask), schema-clean container. | **TOP 3 — B (Ribbon)** |
| 3 | **Language & region modal w/ coverage** | A globe toolbar button opens a dialog: languages grouped by direction + a coverage list mapping the brief's 5 buckets (what's localized vs. left in source language). Apply mirrors the page. | Makes translation *scope* legible (the 5 buckets), reuses Modal, honest about what is **not** translated (act-responsibly framing). | **TOP 3 — C (Coverage)** |
| 4 | Right-edge full-height language Drawer | Language panel docked via a right drawer. | **Culled** — can't reach `PageLayout.rightPanel` from inside the page without router surgery; `CLAUDE.md` forbids `position:fixed` side panels. Structural conflict with the layout system. |
| 5 | Per-card language badges, mixed-direction cards | Each card flags its own content language/direction; GUI stays mono-lingual. | **Culled** — doesn't solve the GUI-multilingual/RTL *chrome* problem the brief is about; muddies hierarchy (UI-6). Its one good idea (`dir="auto"` on raw content) is folded into all 3 builds. |
| 6 | Global top app-bar locale selector | Account-level language in a new top bar affecting every module. | **Culled** — app has no top bar (SideNav is the chrome); would invent a new top-level layout primitive. Violates reuse + layout constraints. |
| 7 | Settings-page-driven locale | Language chosen in `SettingsPage`; Drill reflects it. | **Culled for build** — realistic, but the reviewable surface shows no affordance and the decision is cross-page; poor single-screen review. Compatible with all 3 as a future "source of truth". |
| 8 | Side-by-side LTR/RTL split preview | English and Arabic rendered together for QA. | **Culled** — a QA tool, not a production UI; density conflict, not how an agent uses the page. |
| 9 | Language toggle in the TabsRow action slot | Locale switch shares the tab strip's right slot. | **Culled** — conflates navigation tabs with a global setting; affordance ambiguity (INT-1) and cramped under expansion (UI-8). |
| 10 | Floating language FAB | A floating language button bottom-left. | **Culled** — invents non-standard chrome and collides with the demo switcher cluster; no precedent. |

## Why the top 3 won

- **A — Inline** is the literal reading of "default to the Insights approach":
  lowest-friction, highest-reuse, the language control is just another header
  pill. It proves the *minimum* viable localization+RTL with no new surface.
- **B — Ribbon** answers the ticket's "get RTL **readiness** legible now" by
  making language / region / direction first-class, explicitly separated from
  the page identity (UI-7). Best for a PM/Neil glance: "is RTL handled?"
- **C — Coverage** answers the brief's five-bucket segmentation and the
  recurring "we do NOT translate the transcript / eval" decision — it states,
  on screen, what is localized and what deliberately stays in source language.

All three share one localization engine (`learningHubLocale.js`): GUI strings,
taxonomy chips, filters/search and tabs localize across **English · Español ·
Deutsch · Français · العربية**; Arabic flips the surface to RTL via a `dir`
wrapper and logical CSS properties; the raw scenario body (customer name +
description) stays in its **source language** via `dir="auto"`, never
translated — faithful to the ground-truth rule. German is included precisely
because it is the worst-case expansion length (UI-8).

Switcher: `DarkPillSwitcher` (the documented 3-way demo primitive) mounted in a
floating bottom-right cluster, options `Inline / Ribbon / Coverage`. `VersionBar`
was considered (INT-3's canonical switcher) but its baseline+iteration model
privileges one option as a baseline; three *peer* design variants read more
honestly as three equal segments, which is exactly `DarkPillSwitcher`'s shape.
Language state is lifted to the page host so it persists across variant flips;
all state is in-memory React (G5).

## Final scorecard (design-evaluator, 2 refine passes)

| Variant | Direction | Gates | Weighted | Verdict |
|---------|-----------|:-----:|:--------:|---------|
| **A** | Inline — language as a `FilterDropdown` pill in the header; `dir` flips the surface | 13/13 ✅ | **88%** | Handoff-ready |
| **B** | Ribbon — locale context strip (native-name switcher + Region/Direction badges) | 13/13 ✅ | **87%** | Handoff-ready |
| **C** | Coverage — text "Language" pill → `Modal` with LTR/RTL groups + 5-bucket coverage map | 13/13 ✅ | **90%** | Handoff-ready |

All three clear the 85% Handoff-ready line with every gate passing. **C is the
strongest** (best primitive reuse via `Modal`, deliberate stage-and-commit
Apply, and the only variant that puts the brief's translate / don't-translate
scope on screen).

**Refined in pass 2:** B raised segment hit targets 32→44px (WCAG-6) and
surfaced the >3-language fork-vs-`VersionBar` decision to Neil (INT-3/G7); C
swapped its icon-only globe for a text-labeled header pill (INT-2) and wrapped
the language chips in a `role="radiogroup"` (WCAG-10).

**Flagged, out of scope (route upstream, not per-variant):** the ~30px header
entry pill is under the 44px effective hit-target (WCAG-6) and the drill grid
has no filtered-empty zero state (INT-5) — both are shared `PageHeader` / grid
traits, best fixed once in the primitive rather than inside this ticket.
</content>
</invoke>
