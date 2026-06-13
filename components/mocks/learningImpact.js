// learningImpact.js — mock dataset for the Learning Impact surface (proof
// that Learning Hub moved production metrics). One shared dataset feeds all
// three variants (Scoreboard / Report / Ledger) so the switcher compares
// the same numbers three ways. Real impl: an impact/attribution service that
// joins the recorded intervention ledger to production metrics over a window.
//
// Honesty rules baked into the data (per the brief / design-guidelines G3,G9):
//   - every metric states its `unit` and whether higher is better;
//   - every unit states its comparison `method` + a `caveat`;
//   - `confidence` is High/Med/Low and is always shown with its text label;
//   - `sampleN` / `samplePool` carry the "based on N of M" honesty; a unit
//     under MIN_SAMPLE withholds its % (see `belowSample`).

// Minimum evaluated interactions before we show a % — avoids noisy small-N
// claims. TODO(Akash): confirm the real floor (and whether it varies by metric).
export const MIN_SAMPLE = 25;

// Default attribution window. TODO(Akash): per-metric windows — CSAT and sales
// lag differently after an intervention.
export const IMPACT_WINDOW = "30-day post-window";

export const UNIT_TYPES = [
  { id: "all", label: "All" },
  { id: "agent", label: "Agents" },
  { id: "path", label: "Learning paths" },
  { id: "mission", label: "Missions" },
  { id: "driver", label: "Drivers" },
  { id: "account", label: "Accounts" },
];

// Method → short label + the caveat we must surface on every number using it.
export const METHODS = {
  prepost: {
    label: "Pre / post",
    caveat: "Correlation, not causation — the metric moved after the intervention, but external factors aren't controlled for.",
  },
  "completed-vs-not": {
    label: "Completed vs. not",
    caveat: "Compares agents who completed the path against those who didn't — subject to selection bias; not yet matched.",
  },
  matched: {
    label: "Matched cohort",
    caveat: "Causal-ish lift against a comparable held-out group — the strongest read available, still window-bounded.",
  },
};

export const CONFIDENCE = {
  high: { label: "High confidence", tone: "success" },
  med: { label: "Medium confidence", tone: "warning" },
  low: { label: "Low confidence", tone: "neutral" },
};

// makeSeries — deterministic post-window daily series that drifts from
// `baseline` toward `current` with small repeatable noise, oldest first.
// Stable across reloads so sparklines don't jitter (mirrors PerformanceScore).
function makeSeries(baseline, current, seed) {
  const n = 30;
  const out = [];
  for (let i = 0; i < n; i += 1) {
    const t = i / (n - 1);
    const drift = baseline + (current - baseline) * t;
    out.push(drift + Math.sin(i * 0.6 + seed) * Math.abs(current - baseline) * 0.06);
  }
  return out;
}

// metric — build one metric record. `higherIsBetter:false` (e.g. AHT) flips
// improvement so a drop counts as a gain.
function metric(key, label, unit, baseline, current, target, higherIsBetter, seed) {
  const deltaAbs = +(current - baseline).toFixed(unit === "min" ? 1 : 0);
  const rawPct = ((current - baseline) / Math.abs(baseline)) * 100;
  const improvedPct = +(higherIsBetter ? rawPct : -rawPct).toFixed(0);
  return {
    key,
    label,
    unit,
    baseline,
    current,
    target,
    higherIsBetter,
    deltaAbs,
    improvedPct,
    improved: improvedPct > 0,
    series: makeSeries(baseline, current, seed),
  };
}

// Each unit: identity (who/what) + metadata (window/method/sample) +
// primary metric (metrics[0]) + supporting metrics + the evidence ledger
// (which activities, when, completion state) that the movement is attributed to.
export const IMPACT_UNITS = [
  {
    id: "agent-aaliyah",
    type: "agent",
    name: "Aaliyah Tillman",
    sub: "Senior Agent · Billing",
    tag: { kind: "competency", label: "De-escalation" },
    method: "prepost",
    confidence: "high",
    sampleN: 38,
    samplePool: 47,
    timeToImpact: "12 days",
    metrics: [
      metric("csat", "CSAT", "%", 72, 81, 85, true, 1),
      metric("qa", "QA score", "%", 79, 86, 90, true, 2),
      metric("aht", "Avg handle time", "min", 7.4, 6.6, 6.5, false, 3),
    ],
    evidence: [
      { activity: "Replay — Billing de-escalation", kind: "Replay", date: "May 2", state: "completed" },
      { activity: "Guide — Empathy openers", kind: "Guide", date: "May 6", state: "completed" },
      { activity: "Mission — Q2 readiness", kind: "Mission", date: "May 9", state: "completed" },
    ],
  },
  {
    id: "agent-marcus",
    type: "agent",
    name: "Marcus Chen",
    sub: "Agent · Retention",
    tag: { kind: "driver", label: "Account management" },
    method: "prepost",
    confidence: "med",
    sampleN: 22,
    samplePool: 40,
    timeToImpact: "19 days",
    metrics: [
      metric("sales", "Sales conversion", "%", 18, 23, 26, true, 4),
      metric("csat", "CSAT", "%", 70, 73, 80, true, 5),
    ],
    evidence: [
      { activity: "Replay — Save-the-account", kind: "Replay", date: "May 4", state: "completed" },
      { activity: "Guide — Objection handling", kind: "Guide", date: "May 11", state: "partial" },
    ],
  },
  {
    id: "agent-priya",
    type: "agent",
    name: "Priya Nair",
    sub: "Agent · Tech Support",
    tag: { kind: "competency", label: "Efficiency" },
    method: "prepost",
    confidence: "high",
    sampleN: 31,
    samplePool: 35,
    timeToImpact: "8 days",
    metrics: [
      metric("aht", "Avg handle time", "min", 8.1, 7.0, 7.0, false, 6),
      metric("resolution", "Resolution rate", "%", 74, 82, 85, true, 7),
    ],
    evidence: [
      { activity: "Guide — Diagnostic shortcuts", kind: "Guide", date: "Apr 28", state: "completed" },
      { activity: "Drill — Warranty triage", kind: "Drill", date: "May 1", state: "completed" },
    ],
  },
  {
    id: "path-deesc",
    type: "path",
    name: "De-escalation Mastery",
    sub: "Learning path · 6 competencies",
    tag: { kind: "competency", label: "De-escalation" },
    method: "completed-vs-not",
    confidence: "high",
    sampleN: 64,
    samplePool: 120,
    timeToImpact: "21 days",
    metrics: [
      metric("csat", "CSAT", "%", 71, 80, 85, true, 8),
      metric("qa", "QA score", "%", 77, 84, 88, true, 9),
    ],
    evidence: [
      { activity: "Path completion (cohort)", kind: "Path", date: "Apr–May", state: "completed" },
      { activity: "12 linked Replays", kind: "Replay", date: "Apr–May", state: "completed" },
    ],
  },
  {
    id: "path-billing",
    type: "path",
    name: "Billing Resolution",
    sub: "Learning path · 4 competencies",
    tag: { kind: "driver", label: "Billing" },
    method: "completed-vs-not",
    confidence: "med",
    sampleN: 41,
    samplePool: 90,
    timeToImpact: "17 days",
    metrics: [
      metric("resolution", "Resolution rate", "%", 73, 79, 85, true, 10),
      metric("aht", "Avg handle time", "min", 7.8, 7.2, 7.0, false, 11),
    ],
    evidence: [
      { activity: "Path completion (cohort)", kind: "Path", date: "Apr–May", state: "completed" },
      { activity: "Guide — Refund policy", kind: "Guide", date: "Apr 22", state: "completed" },
    ],
  },
  {
    id: "mission-premium",
    type: "mission",
    name: "Q2 Premium Save Drill",
    sub: "Closed mission · 20 agents",
    tag: { kind: "driver", label: "Account management" },
    method: "prepost",
    confidence: "high",
    sampleN: 18,
    samplePool: 20,
    timeToImpact: "14 days",
    goal: { label: "Sales conversion ≥ 25%", hit: true },
    metrics: [
      metric("sales", "Sales conversion", "%", 19, 27, 25, true, 12),
      metric("csat", "CSAT", "%", 74, 78, 80, true, 13),
    ],
    evidence: [
      { activity: "Mission run (cohort)", kind: "Mission", date: "May 1–15", state: "completed" },
      { activity: "Replay — Premium save", kind: "Replay", date: "May 3", state: "completed" },
    ],
  },
  {
    id: "mission-warranty",
    type: "mission",
    name: "Warranty Calls Readiness",
    sub: "Closed mission · 24 agents",
    tag: { kind: "competency", label: "Efficiency" },
    method: "prepost",
    confidence: "med",
    sampleN: 15,
    samplePool: 24,
    timeToImpact: "10 days",
    goal: { label: "QA score ≥ 88%", hit: false },
    metrics: [
      metric("qa", "QA score", "%", 80, 85, 88, true, 14),
      metric("resolution", "Resolution rate", "%", 76, 80, 85, true, 15),
    ],
    evidence: [
      { activity: "Mission run (cohort)", kind: "Mission", date: "Apr 18–30", state: "completed" },
      { activity: "Drill — Warranty triage", kind: "Drill", date: "Apr 20", state: "partial" },
    ],
  },
  {
    id: "driver-billing",
    type: "driver",
    name: "Billing",
    sub: "Contact driver · high volume",
    tag: { kind: "driver", label: "Billing" },
    method: "matched",
    confidence: "med",
    sampleN: 120,
    samplePool: 300,
    timeToImpact: "23 days",
    metrics: [
      metric("resolution", "Resolution rate", "%", 72, 78, 85, true, 16),
      metric("csat", "CSAT", "%", 69, 74, 80, true, 17),
    ],
    evidence: [
      { activity: "De-escalation + Billing paths", kind: "Path", date: "Q2", state: "completed" },
      { activity: "Matched holdout group", kind: "Cohort", date: "Q2", state: "completed" },
    ],
  },
  {
    id: "driver-account",
    type: "driver",
    name: "Account management",
    sub: "Contact driver · ramping",
    tag: { kind: "driver", label: "Account management" },
    method: "matched",
    confidence: "low",
    // Below MIN_SAMPLE → % is withheld and the surface says why.
    sampleN: 12,
    samplePool: 100,
    timeToImpact: "—",
    metrics: [
      metric("sales", "Sales conversion", "%", 17, 19, 26, true, 18),
    ],
    evidence: [
      { activity: "Account mgmt path (partial rollout)", kind: "Path", date: "Q2", state: "partial" },
    ],
  },
  {
    id: "account-acme",
    type: "account",
    name: "Acme Retail",
    sub: "Program rollup · 7 teams",
    tag: { kind: "competency", label: "Program-wide" },
    method: "completed-vs-not",
    confidence: "high",
    sampleN: 210,
    samplePool: 420,
    timeToImpact: "28 days",
    metrics: [
      metric("csat", "CSAT (blended)", "%", 73, 81, 85, true, 19),
      metric("sales", "Sales conversion", "%", 20, 24, 26, true, 20),
      metric("aht", "Avg handle time", "min", 7.6, 7.0, 7.0, false, 21),
    ],
    evidence: [
      { activity: "5 learning paths across teams", kind: "Path", date: "Q2", state: "completed" },
      { activity: "11 closed missions", kind: "Mission", date: "Q2", state: "completed" },
    ],
  },
];

// belowSample — true when a unit hasn't cleared MIN_SAMPLE, so the surface
// withholds its % and shows the honest "not enough yet" state instead.
export function belowSample(unit) {
  return unit.sampleN < MIN_SAMPLE;
}

// primaryMetric — the headline metric for a unit (first in its list).
export function primaryMetric(unit) {
  return unit.metrics[0];
}
