// Outcome metric cards for the Ask Mira Pro "Outcomes" landing. Each entry
// is one tracked outcome: the current attainment vs target, the signed
// delta (in percentage points — the sign drives the success/danger colour),
// and ~12 trend readings for the in-card sparkline.
//
// goalPct === round(value / target * 100) for every entry; it's stored
// rather than derived so the mock stays the single source of truth and the
// card can render without recomputing. The three "… Adherence" outcomes are
// intentionally distinct titles/ids so the Search Outcomes field is testable.

// The four cards intentionally span every combination of trend direction
// (delta sign) × target attainment (value vs target), so the landing shows
// all cases at once:
//   Interactions        — trending down, below target
//   Script Adherence     — trending up,   below target
//   Compliance Adherence — trending down, above target
//   Greeting Adherence   — trending up,   above target
// Line/area colour follows the trend sign (success up / danger down); the
// dashed target line shows whether the trend sits above or below target.
export const OUTCOMES = [
  {
    id: "interactions",
    title: "Interactions",
    value: 81,
    target: 85,
    goalPct: 95,
    deltaPp: -2,
    trend: [96, 94, 92, 91, 89, 88, 87, 86, 85, 84, 83, 81],
  },
  {
    id: "script-adherence",
    title: "Script Adherence",
    value: 88,
    target: 90,
    goalPct: 98,
    deltaPp: 3,
    trend: [22, 28, 35, 42, 50, 58, 65, 72, 78, 83, 85, 88],
  },
  {
    id: "compliance-adherence",
    title: "Compliance Adherence",
    value: 86,
    target: 82,
    goalPct: 105,
    deltaPp: -3,
    trend: [98, 97, 96, 95, 94, 93, 92, 91, 90, 89, 89, 86],
  },
  {
    id: "greeting-adherence",
    title: "Greeting Adherence",
    value: 92,
    target: 89,
    goalPct: 103,
    deltaPp: 1,
    trend: [20, 26, 33, 42, 51, 60, 69, 77, 84, 89, 91, 92],
  },
  {
    id: "customer-sentiments",
    title: "Customer Sentiments",
    value: 84,
    target: 80,
    goalPct: 105,
    deltaPp: 2,
    trend: [22, 29, 37, 45, 54, 62, 70, 76, 80, 82, 82, 84],
  },
  {
    id: "resolution-rate",
    title: "Resolution Rate",
    value: 82,
    target: 86,
    goalPct: 95,
    deltaPp: -2,
    trend: [96, 95, 93, 92, 90, 89, 88, 87, 86, 85, 84, 82],
  },
  {
    // Churn Risk is inverted: lower is better, so a falling trend is the
    // success (green) case and `target` is a ceiling the risk should stay under.
    id: "churn-risk",
    title: "Churn Risk",
    value: 9,
    target: 12,
    goalPct: 75,
    deltaPp: -3,
    invert: true,
    trend: [28, 25, 23, 21, 19, 17, 15, 14, 12, 11, 10, 9],
  },
];

export const ARCHIVED_OUTCOMES = [
  {
    id: "fcr-2024",
    title: "First Contact Resolution",
    value: 73,
    target: 80,
    goalPct: 91,
    deltaPp: -1,
    trend: [90, 88, 87, 85, 84, 82, 81, 79, 77, 75, 74, 73],
  },
  {
    id: "csat-pilot",
    title: "CSAT Pilot",
    value: 84,
    target: 80,
    goalPct: 105,
    deltaPp: 2,
    trend: [24, 30, 38, 46, 55, 63, 70, 76, 80, 82, 82, 84],
  },
  {
    id: "onboarding-adherence",
    title: "Onboarding Adherence",
    value: 79,
    target: 85,
    goalPct: 93,
    deltaPp: -3,
    trend: [95, 93, 92, 90, 89, 87, 86, 84, 83, 82, 82, 79],
  },
];
