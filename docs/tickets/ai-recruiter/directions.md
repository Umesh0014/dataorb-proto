# AI Recruiter (AI Interviewer) — design directions

**Ticket:** AI Recruiter (AI Interviewer) · Notion UX Priorities Kanban
**Surface designed:** the **AI Interviewer landing** — the team lead's library of
interview plans (the "survey/mentor landing" model Neil named for Probe, scaled to
the recruiter context). This is the V1 *"bring the user in"* journey; per
`design-guidelines.md` §Journeys, a single primary journey is enough to ship V1, and
the harder aggregate record-view is flagged by Neil as map-first/later.

> Caveat carried from intake: this ticket is `Parking area` / `2027` and Neil asked to
> "map the before/after first." These are **exploratory** directions on a net-new
> surface, not a settled spec. Scored on rubric *alignment* (concept-decidable
> weighted preferences) + structural gate risk, since build-time gates (contrast,
> focus, ARIA) can't be judged at concept stage.

Entity hierarchy assumed (from the brief): **Job Profile → Interview Plan → Interview
runs (candidate sessions) → AI evidence report → human hire decision**. Compliance
spine throughout: *coverage, not mastery*; AI surfaces evidence, the human owns the
decision (G4); conversations recorded for compliance.

## Scoring basis

Concept-decidable weighted preferences from the rubric (others — contrast, focus,
motion timing — are build-time and scored later by the evaluator):

`UI-2 reuse (3)` · `INT-1 affordances (3)` · `INT-2 drill-down (3)` · `UI-5 schema
containers (2)` · `UI-6 highlight only distinct (2)` · `UI-7 identity vs params (2)` ·
`UI-8 multilingual cards (2)` · `UI-9 tabular + sidecar (2)` · `UI-10 editorial vs
density (2)` · `INT-5 empty states (2)` · `INT-7 AI-output-is-starting-state (2)` ·
`INT-11 task-first / anti-chatbot (1)`. Max on this subset = **52**. Each rated 0/1/2.

Gate risk flagged where an *approach* structurally threatens a gate (G2 charts, G3
labelled numbers, G4 employment framing).

---

## The 10 directions

### D1 · Editorial card library
Interview plans as a 3-up card grid (reuses the **Replay/Skills** card pattern):
job-family-tinted avatar, plan name, job profile · domain, footer with `interviews
run` + `coverage` + creator monogram; Active/Draft/Archived tabs; create = new plan.
Leans into *find & scan my plans*. Reuse 2 · affordance 2 · drill-down 2 · highlight 2
· i18n 2 · empty 2 · editorial 2 · AI-start 1. **Weighted 46/52.** Gate risk: none.

### D2 · Operational dense table + sidecar
Paginated table (reuses **Tasks/MissionsTable**): Plan · Job profile · Interviews ·
Coverage · Status · Last run. Row → record; per-row info opens a **sidecar** drawer.
Leans into *operate at volume*. Reuse 2 · affordance 2 · drill-down 2 (visible chevron
+ hover info) · sidecar 2 · density 2 · empty 2 · schema 1 · i18n 1 (table tolerates
less). **Weighted 44/52.** Gate risk: none (numbers carry labels).

### D3 · Pipeline + aggregate coverage rail
Two-column inside content width: left = plan list, right = a **coverage rail** showing
aggregate *topics covered vs not* across interviews, with sample-size honesty ("based
on 18 of 25"). Brings Neil's strategic *aggregate record-view* lens forward in a
V1-safe, coverage-framed way. Reuse 2 (Card + tabular rail) · affordance 2 · drill 2 ·
highlight 2 · identity/params 2 · empty 2 · AI-start 2 · i18n 1. **Weighted 45/52.**
Gate risk: coverage viz must stay **bar/segment + table** (G2) and every number
labelled (G3) — designed in deliberately.

### D4 · Job-profile-first accordion
Group plans under their Job Profile (top of the hierarchy); each profile is a
section header with nested plan rows (mirrors the **KPI grouping accordion**). Clear
hierarchy, but adds a layer before the user reaches a plan; drill-down to a single
plan is one level deeper. Reuse 1 · affordance 2 · drill 1 · schema 2 · hierarchy-clear
· i18n 2 · empty 2. **Weighted 38/52.** Distinct but a slower path in.

### D5 · Lifecycle Kanban
Columns Draft · Live · Collecting · Review-ready · Closed; plan cards flow across
(reuses **MissionsKanban**). Strong lifecycle visibility but heavy chrome for what is
mostly a *manage-a-list* job, and it structurally duplicates the Missions board's lane
model on a different noun. Reuse 1 · affordance 2 · drill 2 · highlight 1 · density 1 ·
empty 2. **Weighted 36/52.** Overlaps Missions; deprioritised.

### D6 · Survey-template gallery
Big "start from a template" tiles (Bridge-knowledge / Objection-handling / Tribal-
knowledge) above "your plans". Good for first-run creation, but two competing primary
zones flatten hierarchy on the *returning* user's surface, and templates are a create-
flow concern more than a landing one. Reuse 1 · affordance 2 · highlight 1 · editorial
2 · empty 2 · task-first 1. **Weighted 34/52.**

### D7 · Setup vs runtime tabs
Top-level split into **Plans** (definitions: name + knowledge + domain) and **Runs**
(scheduled sessions, bulk-assign at runtime) — encodes the create-vs-runtime split
Neil flagged and maps cleanly to *identity vs parameters* (UI-7). Strong, but splits
one surface into two half-populated ones at V1 when run volume is thin. Reuse 2 ·
affordance 2 · drill 2 · identity/params 2 · schema 2 · empty 2 · i18n 1. **Weighted
43/52.** Strong runner-up — folded into D2/D3 as a tab, not its own variant.

### D8 · Coverage-led stat hero + table
Hero row of StatCards (interviews this week · plans live · avg coverage) over a plans
table. Good overview, but a composite "avg coverage" headline risks an unexplained
number (G3) and the hero competes with the list for the *manage* task. Reuse 2 ·
affordance 2 · drill 2 · editorial+density 2 · empty 2. **Weighted 40/52.** Gate risk:
G3 unless every stat is explicitly labelled + sample-sized. Hero idea absorbed into D3's
rail.

### D9 · Review-queue-forward feed
Landing leads with recent completed interviews (candidate · plan · coverage · evidence
snippet) — the review journey first, plan management second. Surfaces the AI-evidence /
human-judgment split (G4, INT-7) well, but demotes the primary *manage plans* job and
leans toward a feed the brief says to design *later*. Reuse 1 · affordance 2 · drill 2 ·
AI-start 2 · empty 2. **Weighted 38/52.** Review lens absorbed into D2's sidecar + D3's
rail.

### D10 · Authoring canvas
A drag-to-assemble interview builder with AI preview. High craft but **low reuse**
(net-new primitives), heaviest build, and flirts with the "another chatbot/canvas"
anti-pattern the rubric calls out (INT-11). Reuse 0 · affordance 1 · task-first 0 ·
schema 1. **Weighted 22/52.** A create-flow concept, not a landing; out.

---

## The cut — top 3

| Rank | Direction | Weighted | Why it won |
|---|---|:--:|---|
| 1 | **D1 · Editorial card library** | 46/52 | Highest rubric alignment; maximal reuse of the Replay/Skills card pattern; best multilingual + empty-state tolerance; the most legible *"bring the user in"* surface. The editorial anchor of the trio. |
| 2 | **D3 · Pipeline + aggregate coverage rail** | 45/52 | The only direction that carries the strategic *aggregate record-view* intent into V1 without violating Neil's "map it later" — kept V1-safe via coverage framing + sample-size honesty. Distinct third lens (identity/params separation, AI-as-evidence). |
| 3 | **D2 · Operational dense table + sidecar** | 44/52 | Best density/scan-at-volume answer and the canonical *tabular-primary + sidecar reveal* (UI-9); reuses the Tasks table wholesale. Clean structural contrast to the editorial D1. |

**Why this trio over the runners-up:** D1/D2/D3 are genuinely distinct *structures*
(editorial grid / dense table / two-pane aggregate), each anchored to a different
existing pattern (Replay grid · Tasks table · Card rail), and together they let Umesh
compare the three real tensions on this surface — **scannability vs density vs
strategic-overview**. The strongest runner-up, D7 (setup/runtime split), is an
orthogonal *tabbing* idea rather than a distinct layout, so it's folded in as a tab
affordance instead of spending a variant slot. D5/D6/D9/D10 each overlap another
variant or carry gate/anti-pattern risk.

**Mapped to the switcher:** A → D1 (Library) · B → D2 (Table) · C → D3 (Pipeline).

---

## Build + self-assessment (design-evaluator, 3 refine passes → converged)

The three variants were built behind the A/B/C switcher (`AIRecruiterShell.jsx`,
route `/learning/recruiter`), then scored by the `design-evaluator` subagent against
the full rubric and refined over three passes until convergence (all gates pass; top
variant gained 0 pts on the final pass, inside the <5 bar).

| Variant | Direction | Gates | Weighted | Verdict |
|---|---|:--:|:--:|---|
| **B** | Table + sidecar | 13/13 | **94%** | Handoff-ready *(leader)* |
| **A** | Editorial card library | 13/13 | **91%** | Handoff-ready |
| **C** | Pipeline + coverage rail | 13/13 | **88%** | Handoff-ready |

**Refine history:** Pass 1 — A *Blocked* (G1: hardcoded monogram hex), B 88%, C 81%.
Pass 2 — fixed A's palette to `:root` chart tokens (→91%); added INT-7 editable
AI-evidence starting-state to B's sidecar (→would-be 94%); added C's rail zero-state
(→88%); B caught *Blocked* on a fresh G1 scrim literal. Pass 3 — B scrim → `--overlay-hover`
(gate cleared), drawer `aria-modal` + initial focus, resting chevron opacity raised
across all three (INT-2). **Converged.**

**Why B leads:** it's the only direction that fulfils the rubric's headline UI-9
(tabular primary + sidecar reveal) *and* INT-7 (AI output as an editable, user-owned
starting state with an activity credit; quantitative coverage stays read-only) — earning
two good-to-haves. A is the cleanest reuse story; C carries the strategic aggregate
record-view lens with the best compliance framing.

**Flagged (route, not resolved):** `onOpenPlan` / `onCreatePlan` are logged-not-wired —
the downstream plan-record + create flows are open scope for **Akash**. The focus ring
uses an outline form (visible, gate-passing) rather than the canonical double-ring token,
and B's sidecar forks a bespoke drawer rather than a shared `Drawer` shell — both for
**Neil**. And the parent ticket is still `Parking area` / `2027` with Neil's "map before
build" note — these remain exploratory directions, not a committed build.

---

# Rework — candidate pipeline for the hiring manager (Notion comments, 12 Jun)

Umesh's review re-pointed the surface. The first build designed the **team lead's
interview-plan library**; the comments ask for the **hiring manager's end-to-end
recruitment workflow**, candidate-first:

> "There should be candidate pipeline view for AI recruiter for hiring manager.
> I can't see any candidate details here, and after AI interview push for Interview
> stage is missing." · "Create end-to-end hiring manager workflow of recruitment via
> AI — screening round via AI, build a community of candidates which can get
> activated and hired; business benefit: low time-to-hire, less manhours + budget."
> · "It should be the 4th product on the left navigation below Ask Mira Pro."

**Surface re-scoped** from *plan library* → **candidate pipeline**. New entity spine:
**Candidate → AI Screening (AI Interviewer) → [AI evidence: coverage, not a verdict]
→ human decides → Push to Interview → Offer → Hired**, with a **Talent Community**
pool that can be re-activated. Three asks fold in across every variant: (1) a pipeline
view, (2) candidate details, (3) a **Push to Interview** stage-advance after AI
screening. Business value (time-to-hire, screening hours saved, cost per hire) is
surfaced as labelled stats. Compliance spine unchanged: the AI reports coverage +
evidence, never a verdict; the human owns every stage move (G4); screenings recorded.

**Nav:** promoted out of Learning Hub into its own top-level **product**, 4th in the
app switcher **below Ask Mira Pro** (`/recruiter/*`, default `/recruiter/pipeline`).

## 10 candidate-pipeline directions

- **R1 · Stage board (Kanban).** Candidate cards in stage columns (Applied · AI
  Screening · Interview · Offer · Hired). Reuses MissionsKanban. Push-to-Interview =
  explicit advance control on screened cards (no drag — keyboard-safe). The most
  literal "pipeline view". Reuse 2 · affordance 2 · drill 2 · empty 2 · i18n 1. **45/52.**
- **R2 · Candidate table + sidecar.** Dense table (Candidate · Role · Stage · AI
  coverage · Applied · Last activity); row → sidecar with full candidate detail,
  editable AI evidence (INT-7), and the Push-to-Interview / advance action. Reuses
  Tasks table + the existing recruiter sidecar. Best for "candidate details" + UI-9.
  Reuse 2 · affordance 2 · drill 2 · sidecar 2 · AI-start 2 · density 2. **48/52.**
- **R3 · Funnel + ROI rail.** A stage funnel (counts + conversion) and the business
  case (time-to-hire, screening hours saved, cost-per-hire — each labelled + based)
  on the rail; a stage-filtered candidate list beside it; the Talent Community as a
  re-activatable pool. Carries asks #1+#4. Reuse 2 · affordance 2 · drill 2 · empty 2
  · identity/params 2 · AI-start 1. **45/52.**
- **R4 · Single-candidate review-first feed.** Lead with the just-completed AI
  screenings awaiting a decision. Strong for the decision moment, weak as the primary
  *manage-the-pipeline* surface; demotes the funnel. **38/52.** Folded into R2's sidecar.
- **R5 · Req-grouped accordion.** Group candidates under each open role/req. Clear
  hierarchy but an extra layer before a candidate; slower scan. **38/52.**
- **R6 · Split screening-queue vs. shortlist.** Two panes: AI-screening queue ↔
  human-interview shortlist. Encodes the hand-off but halves each list at V1 volume.
  **42/52.** Folded into R1 columns / R2 stage filter.
- **R7 · Talent-community-first.** Lead with the pooled community + "activate" actions.
  Good for ask #4's community loop, but buries the active pipeline. **36/52.** Community
  absorbed into R3's rail + R1's column.
- **R8 · Map/heat by coverage.** Candidates plotted on a coverage matrix. Risks an
  abstract chart (G2) and a coverage-as-score read (G4). **30/52.** Out.
- **R9 · Calendar/scheduling-led.** Interview scheduling as the spine. A downstream
  concern, not the screening pipeline; needs backend. **28/52.** Hold.
- **R10 · Conversational "ask the recruiter".** Free-form Q&A over candidates.
  Hits the anti-chatbot rule (INT-11) head-on. **20/52.** Out.

## The cut — top 3

| Rank | Direction | Weighted | Why it won |
|---|---|:--:|---|
| 1 | **R2 · Candidate table + sidecar** → **B** | 48/52 | Directly answers "I can't see candidate details" + houses Push-to-Interview and the editable AI evidence (UI-9 + INT-7). Reuses the Tasks table and the existing sidecar wholesale. |
| 2 | **R1 · Stage board** → **A** | 45/52 | The literal "candidate pipeline view" Umesh named; stage columns make the funnel legible; advance controls are explicit, not drag-only (keyboard-safe). |
| 3 | **R3 · Funnel + ROI rail** → **C** | 45/52 | The only direction that surfaces the business case (time-to-hire, hours saved, cost) + the Talent-Community re-activation loop — asks #1 and #4 together. |

**Mapped to the switcher:** A → R1 (Board) · B → R2 (Table) · C → R3 (Funnel).
Old plan-library trio (D1/D2/D3) retired — candidate spine replaces it.
