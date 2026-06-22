// kpiGoals.js — Single source of truth for the Collection Hub "KPI's & Goals"
// card. Drives BOTH fork directions (dense + progressive) AND the sidecar, so
// a label/target/gap/status can never disagree between surfaces.
//
// Every feedback point is encoded here as DATA, not per-card UI:
//  • real per-KPI gap (no more "3pp" on every card)
//  • type-aware status labels — inverted metrics (Effort, Failed Comms) read
//    Within / Exceeds Threshold, never Above / Below Target
//  • category (Reach / Recovery / Quality) on every KPI
//  • correct units/subtitles per KPI (fixes the Effort↔Compliance copy mix-up)
//  • Compliance appends "≈ ~N non-compliant calls" to its gap
//
// kpiType: A rate(↑good) · C inverted(↓good) · D 0–100 score(↑good) · E no-target

export const DATE_RANGE = "1–30 Jun 2026";

// 12-point trend helper — gentle, smooth drift from start→end (a soft sine
// ripple, no zig-zag) so the card sparklines read like the Figma design.
const trend = (start, end) =>
  Array.from({ length: 12 }, (_, i) =>
    +(start + (end - start) * (i / 11) + Math.sin(i * 0.8) * (Math.abs(end - start) * 0.06 + 0.4)).toFixed(2));

export const KPIS = [
  // ---- REACH --------------------------------------------------------------
  {
    id: "contactability", name: "Contactability", category: "Reach", type: "A",
    value: 42, suffix: "of total calls", target: 55, deltaPct: 5, deltaDir: "up",
    tip: "Share of dialled calls that reach the right person.", trend: trend(36, 42),
  },
  {
    id: "efficiency", name: "Efficiency", category: "Reach", type: "A",
    value: 60, suffix: "of contacts", target: 65, deltaPct: 1, deltaDir: "down",
    tip: "Contacts handled without rework or transfer.", trend: trend(54, 60),
  },
  {
    id: "effort", name: "Effort", category: "Reach", type: "C",
    value: 19.8, suffix: "calls per positive contact", target: 15, targetDisplay: "<15",
    deltaPct: 8, deltaDir: "up", tip: "Calls needed to land one positive contact. Lower is better.", trend: trend(16, 19.8),
  },
  // ---- RECOVERY -----------------------------------------------------------
  {
    id: "negotiation", name: "Negotiation", category: "Recovery", type: "A",
    value: 18, suffix: "of negotiations", target: 25, deltaPct: 4, deltaDir: "down",
    tip: "Negotiations that reach an agreed outcome.", trend: trend(24, 18),
  },
  {
    id: "rescheduled", name: "Rescheduled Call Success Rate", category: "Recovery", type: "A",
    value: 35, suffix: "of rescheduled calls", target: 40, deltaPct: 6, deltaDir: "down",
    tip: "Rescheduled calls that are honoured.", trend: trend(41, 35),
  },
  {
    id: "point-of-sale", name: "Point of Sale", category: "Recovery", type: "A",
    value: 42, suffix: "of recoveries", target: 40, deltaPct: 1, deltaDir: "down",
    tip: "Recoveries closed at point of sale.", trend: trend(38, 42),
  },
  // ---- QUALITY ------------------------------------------------------------
  {
    id: "compliance", name: "Compliance Score", category: "Quality", type: "D",
    value: 98, suffix: "compliance score", target: 100, deltaPct: 7, deltaDir: "down",
    nonCompliant: 118, tip: "Calls passing the compliance checklist (0–100).", trend: trend(94, 98),
  },
  {
    id: "effective-comms", name: "Effective Communication Rate", category: "Quality", type: "A",
    value: 96, suffix: "of positive contact", target: 95, deltaPct: 12, deltaDir: "up",
    tip: "Calls rated clear and effective by QA.", trend: trend(84, 96),
  },
  {
    id: "failed-comms", name: "Failed Communication Rate", category: "Quality", type: "C",
    value: 8, suffix: "of negative contacts", target: 5, deltaPct: 2, deltaDir: "down",
    tip: "Calls flagged as a communication failure. Lower is better.", trend: trend(10, 8),
  },
];

// ---- type-aware derivations (the single rule set) ------------------------
export function statusOf(k) {
  if (k.type === "E" || k.target == null) return { label: "No target", rag: "grey" };
  const higherBetter = k.type !== "C";
  const ok = higherBetter ? k.value >= k.target : k.value <= k.target;
  const near = Math.abs(k.value - k.target) <= k.target * 0.08;
  const rag = ok ? "green" : near ? "amber" : "red";
  if (k.type === "C") return { label: ok ? "Within Threshold" : "Exceeds Threshold", rag };
  return { label: ok ? "Above Target" : "Below Target", rag };
}

export function gapOf(k) {
  if (k.type === "E" || k.target == null) return null;
  const d = +(k.value - k.target).toFixed(1);
  if (k.type === "C") {
    return `${Math.abs(d)} ${d > 0 ? "above" : "below"} threshold`;
  }
  if (k.type === "D") {
    const base = `${d >= 0 ? "+" : ""}${Math.round(d)} pts`;
    return k.nonCompliant ? `${base} · ≈ ~${k.nonCompliant} non-compliant calls` : base;
  }
  return `${d >= 0 ? "+" : ""}${d}pp`;
}

// Concise gap for the card footer (no long annotations — those live in the
// drill). Keeps the footer single-line like the Figma KPIRow.
export function gapShort(k) {
  if (k.type === "E" || k.target == null) return null;
  const d = +(k.value - k.target).toFixed(1);
  if (k.type === "C") return `${d > 0 ? "+" : ""}${d}`;
  if (k.type === "D") return `${d >= 0 ? "+" : ""}${Math.round(d)} pts`;
  return `${d >= 0 ? "+" : ""}${d}pp`;
}

export const targetLabel = (k) =>
  k.target == null ? "—" : (k.targetDisplay || `${k.target}${k.type === "D" ? "" : "%"}`);

export const valueLabel = (k) => (k.type === "C" || k.type === "D" ? `${k.value}` : `${k.value}%`);

// Delta is "good/bad", not just up/down — for inverted KPIs an up-tick is bad.
export function deltaTone(k) {
  const higherBetter = k.type !== "C";
  const up = k.deltaDir === "up";
  return (higherBetter ? up : !up) ? "green" : "red";
}

// ---- category rollups (the L0 rings) ------------------------------------
const onTrack = (cat) =>
  KPIS.filter((k) => k.category === cat && statusOf(k).rag === "green").length;

export const CATEGORIES = [
  {
    id: "reach", name: "Reach", score: 38, status: "Needs Attention", rag: "red",
    blurb: "How reliably we connect with the right person — and how much effort it takes.",
    onTrack: onTrack("Reach"), total: 3,
  },
  {
    id: "recovery", name: "Recovery", score: 52, status: "Needs Attention", rag: "red",
    blurb: "How effectively those contacts convert into payment.",
    onTrack: onTrack("Recovery"), total: 3,
  },
  {
    id: "quality", name: "Quality", score: 74, status: "Nearly There", rag: "amber",
    blurb: "How well agents handle calls, and whether they stay within the rules.",
    onTrack: onTrack("Quality"), total: 3,
  },
];

export const ON_TRACK_TOTAL = KPIS.filter((k) => statusOf(k).rag === "green").length;
export const RAG_HEX = {
  green: { fg: "#00711D", bg: "#F0FDF4", line: "#34D399" },
  amber: { fg: "#B57E12", bg: "#FFFBEB", line: "#FBBF24" },
  red: { fg: "#BA1A1A", bg: "#FEF2F2", line: "#F87171" },
  grey: { fg: "#5B5E6F", bg: "#F1F3F9", line: "#AAB2C5" },
};
