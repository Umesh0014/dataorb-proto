// Outcome metric cards for the Ask Mira Pro "Outcomes" landing. Each entry
// is one tracked outcome: the current attainment vs target, the signed
// delta (in percentage points — the sign drives the success/danger colour),
// and ~12 trend readings for the in-card sparkline.
//
// goalPct === round(value / target * 100) for every entry; it's stored
// rather than derived so the mock stays the single source of truth and the
// card can render without recomputing. The three "… Adherence" outcomes are
// intentionally distinct titles/ids so the Search Outcomes field is testable.

export const OUTCOMES = [
  {
    id: "interactions",
    title: "Interactions",
    value: 81,
    target: 85,
    goalPct: 95,
    deltaPp: -2,
    trend: [85, 84, 86, 83, 82, 84, 83, 81, 82, 80, 82, 81],
  },
  {
    id: "script-adherence",
    title: "Script Adherence",
    value: 88,
    target: 90,
    goalPct: 98,
    deltaPp: 3,
    trend: [80, 81, 83, 82, 84, 85, 86, 85, 87, 86, 88, 88],
  },
  {
    id: "compliance-adherence",
    title: "Compliance Adherence",
    value: 76,
    target: 85,
    goalPct: 89,
    deltaPp: -4,
    trend: [84, 83, 82, 80, 81, 79, 78, 80, 77, 78, 76, 76],
  },
  {
    id: "greeting-adherence",
    title: "Greeting Adherence",
    value: 92,
    target: 90,
    goalPct: 102,
    deltaPp: 1,
    trend: [88, 89, 90, 91, 90, 92, 91, 93, 92, 91, 92, 92],
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
    trend: [78, 77, 76, 75, 76, 74, 75, 73, 74, 72, 73, 73],
  },
  {
    id: "csat-pilot",
    title: "CSAT Pilot",
    value: 84,
    target: 80,
    goalPct: 105,
    deltaPp: 2,
    trend: [76, 77, 79, 78, 80, 81, 82, 81, 83, 82, 84, 84],
  },
  {
    id: "onboarding-adherence",
    title: "Onboarding Adherence",
    value: 79,
    target: 85,
    goalPct: 93,
    deltaPp: -3,
    trend: [85, 84, 83, 82, 83, 81, 80, 82, 79, 80, 78, 79],
  },
];
