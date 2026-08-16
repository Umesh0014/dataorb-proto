// kpiSidecar.js — Data + config layer for the standardized KPI Sidecar.
//
// One per-KPI config object drives every label, tooltip, outcome bucket,
// sort rule and unit. The layout never branches on a KPI id — it reads the
// config + the KPI's `type` and applies the shared TYPE_RULES deltas.
//
// kpiType:
//   A  standard rate (higher is better)        — Efficiency, built end-to-end
//   C  inverted absolute (lower is better)      — Effort
//   D  0–100 score (higher is better)           — Quality
//   E  no target (volume context only)          — Handled Volume
//
// Only TARGET_KPI ("efficiency") carries real agent/week/interaction data.
// The other 13 are stubbed (config only) so they become a pure data-swap.

// ---- RAG palette (matches the Collection Hub status legend) --------------
export const RAG = {
  green: { label: "On Track", color: "#00711D", bg: "#F0FDF4", zone: "#34D399" },
  amber: { label: "Nearly There", color: "#B57E12", bg: "#FFFBEB", zone: "#FBBF24" },
  red: { label: "Needs Attention", color: "#BA1A1A", bg: "#FEF2F2", zone: "#F87171" },
};

// ---- Type rules: the standard built once, deltas applied per type --------
// Each rule knows how to render the Gap pill, sort the agent table, label a
// row's status chip, and annotate the trend chart. The Effort (Type C) label
// fix lives here: inverted metrics use Within / Exceeds Threshold, never
// Above / Below Target.
export const TYPE_RULES = {
  A: {
    higherIsBetter: true,
    gap: (k) => {
      const d = +(k.campaignRate - k.target).toFixed(1);
      return { hidden: false, value: `${d >= 0 ? "+" : ""}${d}pp`, tone: d >= 0 ? "green" : "red" };
    },
    sort: (a, b) => a.value - b.value, // worst-first (ascending)
    statusLabel: { green: "Above Target", amber: "Near Target", red: "Below Target" },
    chartNote: null,
  },
  C: {
    higherIsBetter: false,
    gap: (k) => {
      const above = Math.round((k.campaignRate - k.target) * k.total / 100);
      return {
        hidden: false,
        value: `${Math.abs(above).toLocaleString()} calls ${above > 0 ? "above" : "below"} threshold`,
        tone: above > 0 ? "red" : "green",
      };
    },
    sort: (a, b) => b.value - a.value, // worst (highest) first
    statusLabel: { green: "Within Threshold", amber: "Near Threshold", red: "Exceeds Threshold" },
    chartNote: "Lower is better",
  },
  D: {
    higherIsBetter: true,
    gap: (k) => {
      const d = Math.round(k.campaignRate - k.target);
      return { hidden: false, value: `${d >= 0 ? "+" : ""}${d} pts`, tone: d >= 0 ? "green" : "red" };
    },
    sort: (a, b) => a.value - b.value,
    statusLabel: { green: "Above Target", amber: "Near Target", red: "Below Target" },
    chartNote: null,
  },
  E: {
    higherIsBetter: true,
    gap: () => ({ hidden: true }),
    sort: (a, b) => b.interactions - a.interactions, // by volume desc
    statusLabel: { green: "—", amber: "—", red: "—" },
    chartNote: null,
  },
};

// ---- Deterministic agent generator (no backend, stable per render) -------
const NAMES = [
  "Lucía Fernández", "Marc Oliver", "Priya Nair", "Tom Becker", "Sofía Romero",
  "Daniel Cho", "Amara Okafor", "Liam Walsh", "Noa Levi", "Hiro Tanaka",
  "Elena Costa", "Omar Haddad", "Grace Mbeki", "Pavel Novak", "Ines Duarte",
  "Khalid Aziz", "Mei Lin", "Jonas Berg", "Carla Vidal", "Yusuf Demir",
  "Anya Petrova", "Diego Suárez", "Hana Kim", "Ben Carter", "Fatima Zahra",
  "Leo Rossi", "Zara Khan", "Theo Janssen", "Maya Singh", "Pedro Alves",
];
const initialsOf = (n) => n.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
const ragFor = (value, target, higherIsBetter) => {
  const ok = higherIsBetter ? value >= target : value <= target;
  const near = Math.abs(value - target) <= target * 0.08;
  if (ok) return "green";
  return near ? "amber" : "red";
};

// Efficiency (Type A): a rate % where higher is better. Spread agents around
// a 70% target so the worst-first sort and RAG mix are visible. Two agents
// carry zero interactions to exercise the pinned "No data" rows.
function buildEfficiencyAgents() {
  const target = 70;
  const values = [
    41, 48, 52, 55, 58, 61, 63, 64, 66, 67, 68, 69, 70, 71, 72,
    73, 74, 76, 78, 80, 82, 84, 85, 88, 90, 92, 0, 0,
  ];
  return NAMES.slice(0, values.length).map((name, i) => {
    const value = values[i];
    const interactions = value === 0 ? 0 : 120 + ((i * 37) % 260);
    return {
      id: `eff-agent-${i + 1}`,
      name,
      initials: initialsOf(name),
      interactions,
      value,
      rag: value === 0 ? null : ragFor(value, target, true),
    };
  });
}

// Eight-week trend for the Layer-2 chart: agent line + org avg + target line.
const EFFICIENCY_TREND = [
  { week: "W1", agent: 54, orgAvg: 63 },
  { week: "W2", agent: 56, orgAvg: 64 },
  { week: "W3", agent: 59, orgAvg: 64 },
  { week: "W4", agent: 58, orgAvg: 65 },
  { week: "W5", agent: 61, orgAvg: 66 },
  { week: "W6", agent: 64, orgAvg: 66 },
  { week: "W7", agent: 66, orgAvg: 67 },
  { week: "W8", agent: 68, orgAvg: 67 },
];

const OUTCOMES = [
  { key: "resolved", label: "Resolved first contact", color: "#34D399", pct: 46 },
  { key: "transferred", label: "Transferred", color: "#60A5FA", pct: 27 },
  { key: "repeat", label: "Repeat contact", color: "#FBBF24", pct: 18 },
  { key: "abandoned", label: "Abandoned", color: "#FB7185", pct: 9 },
];

const SNIPPETS = [
  "Agent resolved the billing query on first contact; clear ownership, no transfer needed.",
  "Long hold while agent searched the knowledge base — efficiency dipped on this call.",
  "Customer rerouted twice before resolution; handoff notes were incomplete.",
  null,
  "Crisp diagnosis and a documented fix path — textbook first-contact resolution.",
  "Repeat contact from an unresolved earlier ticket; root cause never closed out.",
];

const toneFromColor = (c = "") => /34D399|009225|00A23A|00711D/i.test(c) ? "green"
  : /FB7185|BA1A1A|BE123C/i.test(c) ? "red" : "amber";

// Interaction cards carry the KPI's real outcome buckets (PRD §7) so the
// outcome badge + Layer-3 filter options match the KPI.
function buildInteractions(weekId, n, outcomes) {
  const buckets = outcomes && outcomes.length ? outcomes : OUTCOMES;
  return Array.from({ length: n }, (_, i) => {
    const b = buckets[(i + weekId.length) % buckets.length];
    return {
      id: `${weekId}-INT-${4100 + i}`,
      status: b.label,
      tags: ["Tier 1", i % 2 ? "Callback" : "Email"].slice(0, 1 + (i % 2)),
      extraTags: i % 3,
      outcome: b.label,
      outcomeTone: toneFromColor(b.color),
      snippet: SNIPPETS[(i + weekId.length) % SNIPPETS.length],
    };
  });
}

// ---- Interactions list (Figma 2349-28544 / 28635) ------------------------
// Dated groups of interaction cards: sentiment face + title + resolution +
// emoji reactions + ✦ AI insight + a "See more" CTA (some open in a new tab).
export const INTERACTION_GROUPS = [
  {
    date: "Jun 30, 2025",
    items: [
      { id: "int-1", title: "Resolve Billing Issue", sentiment: "neutral", resolution: "Unresolved", reactions: ["👎", "⚠️"], insight: "The agent should follow up more effectively and provide additional information about the product.", cta: "See more", link: true },
      { id: "int-2", title: "Provide Technical Support", sentiment: "positive", resolution: "Unresolved", reactions: ["🤔", "🔔"], insight: "The customer needs an update on the status of their repair request.", cta: "See updates" },
    ],
  },
  {
    date: "Jun 28, 2025",
    items: [
      { id: "int-3", title: "Customer contacted: Sales Department", sentiment: "positive", resolution: "Resolved", reactions: ["🥇", "🎉"], insight: "The customer expressed satisfaction with the service and recommended the product to a colleague.", cta: "See more", link: true },
      { id: "int-4", title: "Account verification call", sentiment: "negative", resolution: "Unresolved", reactions: ["👎", "⏱️"], insight: "Identity verification took too long; the agent should use the streamlined flow next time.", cta: "See more" },
    ],
  },
];

// ---- Outcome Insights (Figma 2349-29143) ---------------------------------
// This Agent / Top Performer / Gap tiles, the multi-line distribution trend,
// and the horizontal impact bars split into Strength / Meets / Needs.
export const OUTCOME_INSIGHTS = {
  thisAgent: 25,
  topPerformer: { value: 81, id: "45F321" },
  gap: 20,
  trend: [
    { x: "Mar 26", agent: 42, top: 30 },
    { x: "Apr 12", agent: 52, top: 48 },
    { x: "Apr 28", agent: 58, top: 56 },
    { x: "May 10", agent: 62, top: 64 },
    { x: "May 28", agent: 68, top: 78 },
    { x: "Jun 24", agent: 79, top: 93 },
  ],
  target: 80,
  impact: [
    { key: "resolution", label: "Resolution rate", icon: "✅", strength: 62, meets: 50, needs: 78 },
    { key: "sentiment", label: "Positive sentiment", icon: "🙂", strength: 55, meets: 48, needs: 70 },
    { key: "offer", label: "Accepted offer", icon: "🤝", strength: 60, meets: 82, needs: 56 },
  ],
};

// ---- Per-KPI generator (PRD §5) — real-ish data for every KPI ------------
// Spread agents around the target with type-correct values + RAG, an 8-week
// trend, and per-week interaction lists, so each KPI opens its own sidecar.
function buildAgentsFor(type, target, rate) {
  const higher = (TYPE_RULES[type] || TYPE_RULES.A).higherIsBetter;
  const base = target ?? rate;
  const list = NAMES.slice(0, 24).map((name, i) => {
    const spread = (i - 11.5) / 11.5; // -1 … +1
    let value;
    if (type === "C") value = Math.max(1, +(base * (1 + spread * 0.7)).toFixed(1));
    else value = Math.max(1, Math.min(type === "D" ? 100 : 99, Math.round(base + spread * base * 0.45)));
    return {
      id: `${type}-agent-${i + 1}`, name, initials: initialsOf(name),
      interactions: 120 + ((i * 37) % 260), value,
      rag: target == null ? "amber" : ragFor(value, target, higher),
    };
  });
  list.push({ id: `${type}-z1`, name: NAMES[24], initials: initialsOf(NAMES[24]), interactions: 0, value: 0, rag: null });
  list.push({ id: `${type}-z2`, name: NAMES[25], initials: initialsOf(NAMES[25]), interactions: 0, value: 0, rag: null });
  return list;
}
const buildTrendFor = (rate) => Array.from({ length: 8 }, (_, i) => ({
  week: `W${23 + i}`, agent: Math.max(1, +(rate + (i - 4) * 1.4).toFixed(1)), orgAvg: +rate.toFixed(1),
}));
function makeConfig(seed) {
  const trend = buildTrendFor(seed.campaignRate);
  return {
    id: seed.id, name: seed.name, kpiType: seed.type, subtitle: seed.subtitle,
    unit: seed.unit ?? "%", dateRange: "1–30 Jun 2026", total: seed.total,
    campaignRate: seed.campaignRate, target: seed.target,
    interactionsTip: seed.interactionsTip || "", metricTip: seed.metricTip || "",
    outcomes: seed.outcomes, agents: buildAgentsFor(seed.type, seed.target, seed.campaignRate),
    trend, weeks: trend.map((w) => w.week),
    interactions: Object.fromEntries(trend.map((w, i) => [w.week, buildInteractions(w.week, 5 + (i % 4), seed.outcomes)])),
    defaultOutcomeFilter: seed.defaultOutcomeFilter || "all", stubbed: false,
    mixedPopulation: seed.mixedPopulation || null,   // §8.2 info callout
    gapVolumeLabel: seed.gapVolumeLabel || null,     // §1 Compliance volume estimate
  };
}

// Outcome bucket sets per KPI (PRD §5.2 — Tab 2 column).
const OC_PAYMENT = [
  { key: "secured", label: "Payment Secured", color: "#34D399", pct: 42 },
  { key: "pipeline", label: "Pipeline", color: "#60A5FA", pct: 18 },
  { key: "refused", label: "Refused", color: "#FB7185", pct: 34 },
  { key: "failed", label: "Contact Failed", color: "#CBD5E1", pct: 6 },
];
const OC_CONTACT = [
  { key: "made", label: "Contact Made", color: "#34D399", pct: 58 },
  { key: "failed", label: "Contact Failed", color: "#CBD5E1", pct: 42 },
];
const OC_COMPLIANCE = [
  { key: "compliant", label: "Compliant", color: "#34D399", pct: 92 },
  { key: "non", label: "Non-Compliant", color: "#FB7185", pct: 8 },
];
const OC_EFFORT = [
  { key: "productive", label: "Productive Contacts", color: "#34D399", pct: 64 },
  { key: "failed", label: "Failed Contacts", color: "#CBD5E1", pct: 36 },
];
const OC_FAILED = [
  { key: "refusal", label: "Refusal", color: "#FB7185", pct: 38 },
  { key: "disconnect", label: "Hard Disconnect", color: "#BE123C", pct: 30 },
  { key: "wrong", label: "Wrong Person", color: "#CBD5E1", pct: 22 },
  { key: "other", label: "Other", color: "#E2E8F0", pct: 10 },
];

// Seeds for the 8 non-Efficiency Collections KPIs (Efficiency keeps its rich
// hand-authored config below). Types corrected to the PRD (Appendix A):
// Compliance = A (100% target), Failed Communication = E (no target).
const KPI_SEEDS = [
  { id: "contactability", name: "Contactability", type: "A", unit: "%", subtitle: "of total dials", total: 50000, campaignRate: 42, target: 55, outcomes: OC_CONTACT, mixedPopulation: "Includes all dials, not only verified contacts. Reflects list quality and dialing strategy as well as agent performance.", interactionsTip: "Total outbound dials placed by this agent in the selected period — all calls regardless of outcome.", metricTip: "Percentage of total dials where the agent confirmed the debtor's identity. Target: 55%. Higher is better." },
  { id: "effort", name: "Effort", type: "C", unit: " calls", subtitle: "calls per positive contact", total: 50000, campaignRate: 19.8, target: 15, outcomes: OC_EFFORT, interactionsTip: "Total outbound dials placed by this agent — used to calculate dials per productive outcome.", metricTip: "Average dials to reach one verified contact. Target: < 15. Lower is better." },
  { id: "negotiation", name: "Negotiation", type: "A", unit: "%", subtitle: "of verified contacts", total: 28000, campaignRate: 48, target: 25, outcomes: OC_PAYMENT, metricTip: "Percentage of verified contacts where the agent navigated the negotiation stage. Target: 25%." },
  { id: "rescheduled", name: "Rescheduled Call Success Rate", type: "A", unit: "%", subtitle: "of rescheduled callbacks", total: 9000, campaignRate: 38, target: 40, outcomes: OC_PAYMENT, metricTip: "Percentage of rescheduled callbacks that converted to a payment. Target: 40%." },
  { id: "point-of-sale", name: "Point of Sale", type: "A", unit: "%", subtitle: "of recoveries", total: 12000, campaignRate: 44, target: 40, outcomes: OC_PAYMENT, metricTip: "Percentage of recoveries collected via instant POS payment. Target: 40%." },
  { id: "compliance", name: "Compliance Score", type: "A", unit: "%", subtitle: "of verified contacts", total: 47000, campaignRate: 98, target: 100, outcomes: OC_COMPLIANCE, defaultOutcomeFilter: "Non-Compliant", gapVolumeLabel: "non-compliant calls", metricTip: "Percentage of verified contacts where both security protocol steps were completed. Target: 100%. Any score below 100% indicates real compliance failures at scale." },
  { id: "effective-comms", name: "Effective Communication Rate", type: "A", unit: "%", subtitle: "of verified contacts", total: 46000, campaignRate: 88, target: 95, outcomes: OC_PAYMENT, metricTip: "Percentage of verified contacts that reached the Debt Communication stage. Target: 95%." },
  { id: "failed-comms", name: "Failed Communication Rate", type: "E", unit: "%", subtitle: "Explore negative contact patterns", total: 15000, campaignRate: 24, target: null, outcomes: OC_FAILED, metricTip: "Percentage of useful contacts that ended with no progress. No target — use for pattern exploration." },
];

// ---- The KPI registry ----------------------------------------------------
const efficiencyAgents = buildEfficiencyAgents();

export const KPI_CONFIGS = {
  efficiency: {
    id: "efficiency",
    name: "Efficiency",
    kpiType: "A",
    subtitle: "First-contact resolution rate across the campaign",
    unit: "%",
    dateRange: "1–30 Jun 2026",
    total: 49820,
    campaignRate: 64,
    target: 70,
    interactionsTip: "Total interactions handled by the agent in the selected date range.",
    metricTip: "Share of the agent's interactions resolved on first contact.",
    outcomes: OUTCOMES,
    agents: efficiencyAgents,
    trend: EFFICIENCY_TREND,
    weeks: EFFICIENCY_TREND.map((w) => w.week),
    defaultOutcomeFilter: "all",
    stubbed: false,
    // ---- New L1 (Figma 2349-28348) summary + Week-over-Week ----------------
    summaryKicker: "Strength",          // sub-label above the metric name
    evaluatedPct: 50,                   // % of total interactions evaluated
    evaluatedCount: 24910,              // count evaluated (≈ 50% of total)
    metricCount: 20000,                 // interactions behind the headline rate
    priorDelta: -6,                     // pp change vs the prior period
    actions: ["Feedback Summary", "Outcome Insights"],
    wowFilter: { label: "Strength Rate", value: "70–90%" },
    weeklyRows: [
      { week: "W29", range: "Jul 15–Jul 21", evaluated: 2998, metric: 76, change: -4 },
      { week: "W27", range: "Jul 1–Jul 7", evaluated: 5678, metric: 91, change: -4 },
      { week: "W26", range: "Jun 24–Jun 30", evaluated: 3245, metric: 85, change: -4 },
      { week: "W24", range: "Jun 10–Jun 16", evaluated: 4876, metric: 89, change: 2 },
      { week: "W23", range: "May 27–Jun 2", evaluated: 5432, metric: 75, change: -4 },
    ],
  },
  // ---- Generated per-KPI configs (PRD §5) — each opens its own data -------
  ...Object.fromEntries(KPI_SEEDS.map((s) => [s.id, makeConfig(s)])),
};

// Per-week interaction lookup for Efficiency (Layer 3).
export const EFFICIENCY_INTERACTIONS = Object.fromEntries(
  EFFICIENCY_TREND.map((w, i) => [w.week, buildInteractions(w.week, 5 + (i % 4))]),
);

export const DEFAULT_KPI_ID = "efficiency";
