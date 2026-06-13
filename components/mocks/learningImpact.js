// learningImpact.js — shared impact primitives for the Learning Impact
// feature (proof that Learning Hub moved production metrics). Surface lives
// on the Agent detail page (per-agent before/after + the Learning Hub help
// history); these helpers + tokens are consumed by LearningImpactParts and
// the per-agent mock (agentLearningImpact.js).
//
// Honesty rules these encode (per the brief / design-guidelines G3,G9):
//   - every metric states its `unit` and whether higher is better;
//   - every figure states its comparison `method` + a `caveat`;
//   - `confidence` is High/Med/Low and is always shown with its text label;
//   - a unit under MIN_SAMPLE withholds its % (see `belowSample`).

// Minimum evaluated interactions before we show a % — avoids noisy small-N
// claims. TODO(Akash): confirm the real floor (and whether it varies by metric).
export const MIN_SAMPLE = 25;

// Default attribution window. TODO(Akash): per-metric windows — CSAT and sales
// lag differently after an intervention.
export const IMPACT_WINDOW = "30-day post-window";

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
export function makeSeries(baseline, current, seed) {
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
export function metric(key, label, unit, baseline, current, target, higherIsBetter, seed) {
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

// belowSample — true when a unit hasn't cleared MIN_SAMPLE, so the surface
// withholds its % and shows the honest "not enough yet" state instead.
export function belowSample(unit) {
  return unit.sampleN < MIN_SAMPLE;
}
