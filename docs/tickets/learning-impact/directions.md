# Learning Impact — design directions audit

> **Post-review pivot (Jun 13).** After the 3 variants were reviewed, the placement
> question was resolved: Learning Impact is **agent-centric** and lives on the **Agent
> detail page**, reached via the **Agents tab** (Learning Hub › Agents → click an agent).
> The standalone `/learning/impact` rollup and its A/B/C variants were **removed**; the
> shared atoms were kept initially, then the section was simplified again to a single
> **"Learning Hub impact"** timeline chart: two trend lines (QA score + CSAT, Y-axis %)
> over the year since the agent joined, with each Learning Hub activity (drill / guide /
> replay / probe / mission) marked on the time axis — the "news-on-price" model, showing
> practice lifting performance. The method/confidence/sample/caveat chrome was dropped in
> favour of that one chart. The exploration below is retained as the design record that led here.

---


Ticket: **📈 Learning Impact — how Learning Hub improved agent performance**
(Notion `37e7c826-4656-81d6-8f9b-d8f073291636`, P1, Stage = Inprogress).
Surface: a **proof-of-impact** view that quantifies and attributes Learning Hub's
effect on production performance — *intervention → agent acted → metric moved* —
rolled up per **agent / mission / learning path / driver / account**.

Brief anchors honoured throughout:
- Every number carries a **label + unit** (pp gap, % improvement, sample count) — G3 / UI-4.
- Every figure states its **comparison method** (pre/post · completed-vs-not · matched
  cohort) and an **honest caveat** — "never imply causation we can't support".
- **Attribution confidence** (High/Med/Low) is paired with a **text label**, never colour
  alone — G9.
- **Sample-size honesty**: a unit below the minimum-N floor **withholds** its % and says so
  ("based on 12 of 100") rather than printing a noisy claim.
- Quantitative data stays **read-only**; no employment-decision framing — G4.

> **Open product decision routed to Akash (G7), not resolved here:** *where this surface
> lives* — inside Insights, inside Learning Hub, or as a cross-module "Impact" surface
> (Notion open question). For the preview it is mounted on a Learning Hub route
> (`/learning/impact`) **without** claiming a permanent rail slot — placement is Akash's
> call. Default attribution window per metric and the minimum-sample threshold are also
> flagged open (mocked at a 30-day window / N≥25).

## The 10 directions

Scored on the concept-decidable rubric items (UI-2 reuse · INT-1 affordance · INT-2
drill-down · UI-5 schema/containers · UI-6 highlight-distinct · UI-7 identity vs params ·
UI-8 multilingual cards · UI-9 tabular+sidecar · UI-10 editorial vs density · INT-3 one
primitive/VersionBar · INT-5 empty/zero · INT-7 read-only vs editable). 0/1/2 per item;
gate-risk noted separately.

| # | Direction | Idea in one line | Concept score | Gate risk |
|---|-----------|------------------|:-------------:|-----------|
| 1 | **Impact scoreboard + table** | Program KPI tiles, then the units as a dense impact table (baseline→current, Δ, %, method, confidence, N) with row drill-down | **High** | none — density fit, table is its own a11y alt |
| 2 | **Editorial before/after report** | One unit's impact as a webpage-feel artifact: identity → metadata snapshot → "what we did / what moved / how confident" → export | **High** | none — editorial treatment, downloadable GTH |
| 3 | **Attribution ledger (timeline)** | The intervention→outcome ledger as the spine: time-sorted interventions, each with its post-window metric movement + time-to-impact | **High** | none — event stream, every entry labelled |
| 4 | Cohort comparison split | Completed-vs-not two-column comparator with the lift headline + selection-bias caveat | High | V2-leaning; one method only, narrower |
| 5 | Flywheel funnel | Delivered → acted → moved → % → $ as a stage strip | Med | composite/decoration risk (UI-6, G3) unless every stage labelled |
| 6 | Unit explorer master–detail | Left list of units, right detail pane | High | strong, but overlaps #1's drill model |
| 7 | Driver × metric heatmap matrix | Drivers/competencies × metrics, cells = % improvement | Med-high | one view only; reads as colour-heatmap unless cells carry sign+label |
| 8 | Goal-ring impact | Each unit's improvement as an Apple-Watch ring toward target | Med | rings-everywhere flattens hierarchy (UI-6), decoration risk |
| 9 | Agent "My Growth" before/after | Single-persona agent self-view | Med | narrow; this surface is multi-unit, and G4 tone care |
| 10 | Pivot / query builder | Pick unit+metric+method+window, render result | Med-low | INT-11 chatbot-ish; affordance complexity |

## The cut — top 3

Chosen as **three genuinely distinct mental models** (not three coats of paint), each
scoring well on the decidable rubric and all reusing the same house atoms (`Card`,
`StatCard`, `TabsRow`, `PageHeader`, `MetricSparkline`, `ExportButton`, `TrendArrow`) over
**one shared impact dataset** so the switcher is a true apples-to-apples compare:

- **A — Impact scoreboard (#1).** *Operational dashboard, density for data.* Program-level
  KPI tiles up top (interventions with a measurable delta, agents improved, avg %
  improvement), then the filtered units as a scannable impact table — each row carrying
  baseline→current, absolute Δ, % improvement, method, confidence and sample N. Rows
  drill **in place** (visible chevron → inline evidence timeline + method caveat), keeping
  the primary surface scannable (UI-9 read as tabular-primary + inline reveal, avoiding the
  CLAUDE.md `position:fixed` panel ban). Strongest reuse, lowest risk — the one to beat.

- **B — Editorial before/after report (#2).** *Editorial treatment for content.* The
  QBR/renewal and 1:1 reading: a unit picker, then the selected unit rendered as a
  ~720px readable artifact — hero **identity** (who/what/when) separated from the
  **metadata snapshot** (window, method, sample) per UI-7, then editorial sections (what we
  did · what moved · how confident, with the caveat as a callout), **export-ready** (PDF
  GTH). The "tell the brand their program worked" surface.

- **C — Attribution ledger (#3).** *The recorded ledger made visible.* Leads with the core
  concept literally — a time-sorted stream of completed interventions, each entry showing
  the activity, the unit it applied to, its **time-to-impact**, and the post-window metric
  movement attributed to it, with method + confidence inline. Entries expand for the metric
  detail. Distinct from A/B by being **event-first** (chronological causality) rather than
  unit-first.

Why these three beat the rest: #6 is strong but overlaps A's drill model; #4 and #7 are
single-method / single-view (narrower) and fold in as *sections* inside A and B (cohort
caveat, driver tag); #5/#8 carry decoration/composite-number gate risk; #9 is single-persona
on a multi-unit surface; #10 trades affordance clarity and the task-first stance (INT-11) for
power-user flexibility. A (dashboard), B (artifact) and C (ledger) span the three reading
modes the brief's personas actually need — TL scanning many agents, CS telling one account's
story, and the honest "which intervention moved what, when" audit trail.

## Scores recorded after build (design-evaluator)

Build green. Independent `design-evaluator` subagent, scored against `design-guidelines.md`.

| Variant | Direction | Gates | Weighted | Verdict |
|---|---|:---:|:---:|---|
| **A** | Scoreboard | 13/13 PASS | **92%** | Handoff-ready |
| **B** | Report | 13/13 PASS | **92%** | Handoff-ready |
| **C** | Ledger | 13/13 PASS | **90%** | Handoff-ready |

**Refine pass 1** (targeted only the named weak items):
- **B** — unit picker converted from a half-wired `role="tablist"` to token-bound
  `aria-pressed` selection chips (WCAG-10 → 2), hardcoded `#FFFFFF` removed (G1).
  90% → 92%.
- **C** — added the `ExportButton` table/csv path the other two carry (WCAG-9 → 2),
  and neutralised the uniform brand-blue timeline node so colour stays reserved for the
  genuine signal (UI-6 → 2). 88% → 90%.

**Deliberately not changed (documented):**
- *Shared sparkline tooltip (INT-4/MOT-8, scored 1 on all three).* The tooltip lives in
  the shared `MetricSparkline` primitive, which Agent Profile also consumes; it is a
  scrubber readout where instant value feedback is the correct UX. Changing it would
  alter a shipped surface (G6 — handlers untouched). Left as-is.
- *B's picker not on `VersionBar` (INT-3, 1).* Up to 10 units exceeds VersionBar's tuned
  ≤3 range — the rubric itself says to flag that rather than force it. Flagged with a
  PillGroup-promotion note; not churned.

Converged after one refine pass: all 13 gates pass on every variant and the top variant
gained < 5 points, so the loop terminates per the skill's convergence rule.
