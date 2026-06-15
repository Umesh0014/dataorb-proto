# Credit & Usage tracking — design directions audit

Ticket: **[Settings] Credit & Usage tracking** (Notion `36e7c826-4656-8161-bd49-f771f96f2a1d`, P0).
Surface: `settings/credits-usage` admin page.

Locked model (Jun 2 + Jun 11 calls): credit committed at the **tenant**, quota
distributed at the **team** level (tenured vs new consume differently), cadence a
per-team variable (day/week/month). When capacity runs out the tenant either **caps
spend** (hard stop) or **allows additional — but capped** (the word "overage" is
dropped). Out-of-quota agents raise a **request** routed to one configured email
(Teams routing is future). The **additional-cap approval** path is designed now for
V1.1.

The existing `CreditsUsagePage` already implements this model as a single stacked
column. The job here is to put **three structurally distinct directions** behind a
switcher so Umesh can compare against the incumbent, not reskin it three times.

## The 10 directions

Scored on the concept-decidable rubric items (UI-2 reuse, INT-1 affordance, INT-2
drill-down, UI-5 schema/containers, UI-6 highlight-distinct, UI-7 identity vs params,
UI-8 multilingual cards, UI-9 tabular+sidecar, UI-10 editorial vs density, INT-3 one
primitive, INT-5 empty states). 0/1/2 per item; gate-risk noted separately.

| # | Direction | Idea in one line | Concept score | Gate risk |
|---|-----------|------------------|:-------------:|-----------|
| 1 | **Stacked sections** (incumbent) | Hero + team rows w/ inline drill + paired control cards, one column | **High** | none — already shipped |
| 2 | Setup wizard | Capacity → distribute → spend control → routing as guided steps | Med-low | weak for a revisited settings surface |
| 3 | Allocation budget board | Tenant capacity as an envelope that depletes as you allocate to teams; live "unallocated" meter; over-allocation flagged | High | drag would risk INT-1/keyboard — avoid, use numeric inputs |
| 4 | **Master–detail two-pane** | Left rail = teams + tenant controls; right = detail of the selected item; capacity strip pinned on top | **High** | none if kept in-content (not a fixed panel) |
| 5 | Dense data table | Teams as a sortable table, row-expand for agents | High | near-duplicate of incumbent's row layout |
| 6 | Tabbed config | Capacity / Teams / Spend / Requests tabs | Med | hides cross-relationships (UI-7) |
| 7 | **Monitoring dashboard + edit-on-demand** | Read-first KPI + trend summary; teams as a usage table; edit revealed inline per row/control | **High** | none — inline edit avoids fixed drawer |
| 8 | Team card grid | Teams as a responsive card grid w/ usage rings | Med-high | side-by-side comparison harder than rows |
| 9 | Inline spreadsheet | Everything editable in one grid incl. nested agents | Med-low | INT-1 affordance ambiguity (clickable vs not) |
| 10 | Goal-ring focus | Apple-Watch ring for tenant capacity, allocation rows feed it | Med | risks decoration over function (UI-6/MOT-2) |

## The cut — top 3

Chosen for **distinct mental models** (not three coats of paint) that each score well
and reuse the existing `CreditsUsageParts` atoms (CapacityBar, MetricTile,
CompositionBadge, AdditionalUsageChoice, RequestRoutingField, AgentBannerPreview,
UsageTrendChart):

- **A — Stacked sections (#1, incumbent).** Kept as the baseline to compare against.
  Config-first: every control visible in one scannable column. Strongest reuse, lowest
  risk; the thing to beat.
- **B — Master–detail two-pane (#4).** Management-first. Left rail lists teams plus the
  tenant-level controls (Spend control, Requests); the right pane shows the selected
  item's detail. Capacity strip pinned on top. Scales to many teams, classic settings
  IA, clean tabular-primary + sidecar-reveal (UI-9).
- **C — Monitoring dashboard + edit-on-demand (#7).** Reads as "how are we tracking"
  first — KPI tiles + tenant bar + usage trend up top, teams as a read-only usage table,
  with cadence/quota and the spend/routing controls revealed inline only when you choose
  to edit. Separates monitoring from configuration (UI-7, UI-10).

Why these three beat the rest: #2/#6/#9/#10 each trade away a rubric strength (revisit-
ability, cross-relationship visibility, affordance clarity, or function-over-decoration).
#5 and #8 are good but #5 overlaps the incumbent's row layout and #8 weakens team-to-team
comparison — B and C cover their strengths (density, sidecar) with more distinct IAs.

Variant keys map A/B/C to the switcher in `CreditsUsageShell`.
