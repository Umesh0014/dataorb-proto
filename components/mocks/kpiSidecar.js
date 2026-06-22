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

function buildInteractions(weekId, n) {
  return Array.from({ length: n }, (_, i) => {
    const resolved = (i + weekId.length) % 3 !== 0;
    return {
      id: `${weekId}-INT-${4100 + i}`,
      status: resolved ? "Closed" : "Reopened",
      tags: ["Billing", "Tier 1", i % 2 ? "Callback" : "Email"].slice(0, 2 + (i % 2)),
      extraTags: i % 4,
      outcome: resolved ? "Resolved first contact" : "Repeat contact",
      outcomeTone: resolved ? "green" : "amber",
      snippet: SNIPPETS[(i + weekId.length) % SNIPPETS.length],
    };
  });
}

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
  },
  // ---- Stubbed siblings — config-only, swap in data to light them up -----
  effort: { id: "effort", name: "Effort", kpiType: "C", unit: "", target: 1.5, stubbed: true },
  quality: { id: "quality", name: "Quality Score", kpiType: "D", unit: "pts", target: 80, stubbed: true },
  "handled-volume": { id: "handled-volume", name: "Handled Volume", kpiType: "E", unit: "", target: null, stubbed: true },
};

// Per-week interaction lookup for Efficiency (Layer 3).
export const EFFICIENCY_INTERACTIONS = Object.fromEntries(
  EFFICIENCY_TREND.map((w, i) => [w.week, buildInteractions(w.week, 5 + (i % 4))]),
);

export const DEFAULT_KPI_ID = "efficiency";
