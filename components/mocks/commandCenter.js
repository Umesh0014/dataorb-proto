// commandCenter.js — mock signal layer for the Team Leader Command Center
// (triage-to-coach home). Every Attention Item is
//   (agent × driver/competency × signal) → recommended intervention.
// Shared by the three switcher variants (Queue / Board / Focus). All values
// are mock; the real surface derives these from Insights + assignment +
// activity-log data the audit flagged as not-yet-wired.
//
// Attention Item shape:
//   id           string
//   agent        { id, name, initials }     links to AgentProfile
//   competency   string                     universal axis (always present)
//   driver       string | null              conditional axis (per Jun-9 framework)
//   signal       one of SIGNAL_META keys
//   evidence     string                     one-line "why", with the number in text
//   metric       { points:[…], unit, labels:[…], current } | null   sparkline data
//   severity     "high" | "medium" | "low"  drives rank + colour
//   centrality   1 | 2 | 3                   journey-centrality weight input
//   reach        number                      agents affected (cohort items > 1)
//   recencyDays  number                      days since the signal first fired
//   overdueDays  number | null               for "learning overdue" floats
//   deadline     string | null              tie-breaker (e.g. mission end)
//   intervention { kind, asset, duration }   recommended next step
//   sampleNote   string | null              statistical-relevance honesty line

// ---- Ranking ------------------------------------------------------------
// Default rank = severity × journey-centrality × reach × recency, with
// learning-overdue items floated to the top, ties broken by soonest
// deadline. Weights are kept here (not buried in a component) so the
// ordering is transparent and tunable — mirrors the audit-rubric
// transparency principle the ticket calls for.
export const RANK_WEIGHTS = {
  severity: { high: 3, medium: 2, low: 1 },
  wSeverity: 10,
  wCentrality: 4,
  wReach: 3,
  wRecency: 2, // applied to a 0–3 recency bucket (fresher = higher)
};

function recencyBucket(recencyDays) {
  if (recencyDays <= 2) return 3;
  if (recencyDays <= 5) return 2;
  if (recencyDays <= 9) return 1;
  return 0;
}

// rankScore — pure, documented, tunable. Higher = more urgent.
export function rankScore(item) {
  const w = RANK_WEIGHTS;
  return (
    w.severity[item.severity] * w.wSeverity +
    item.centrality * w.wCentrality +
    item.reach * w.wReach +
    recencyBucket(item.recencyDays) * w.wRecency
  );
}

// rankItems — overdue-by-due-date floated first, then score desc, then
// soonest deadline. Returns a new array; never mutates input.
export function rankItems(items) {
  return [...items].sort((a, b) => {
    const aFloat = a.overdueDays != null ? 1 : 0;
    const bFloat = b.overdueDays != null ? 1 : 0;
    if (aFloat !== bFloat) return bFloat - aFloat;
    const ds = rankScore(b) - rankScore(a);
    if (ds !== 0) return ds;
    if (a.deadline && b.deadline) return a.deadline.localeCompare(b.deadline);
    return a.deadline ? -1 : b.deadline ? 1 : 0;
  });
}

// ---- Display metadata (color + label + icon name) -----------------------
// Severity always pairs colour with a text label + icon downstream so
// meaning is never carried by colour alone (WCAG-2).
export const SEVERITY_META = {
  high:   { label: "High",   tone: "danger",   order: 0 },
  medium: { label: "Medium", tone: "warning",  order: 1 },
  low:    { label: "Low",    tone: "info",      order: 2 },
};

// Signal source → human label + lucide icon name (resolved in the card).
export const SIGNAL_META = {
  performance: { label: "Performance dip",  icon: "TrendingDown" },
  coverage:    { label: "Coverage gap",     icon: "LayoutGrid" },
  qa:          { label: "QA flag",          icon: "ClipboardCheck" },
  mission:     { label: "Mission at risk",  icon: "Flag" },
  undone:      { label: "Learning overdue", icon: "CalendarClock" },
  regression:  { label: "Regression",       icon: "Activity" },
};

// Recommended-intervention kind → verb + lucide icon name.
export const INTERVENTION_META = {
  replay:          { label: "Assign replay clip",       icon: "Repeat" },
  guide:           { label: "Assign guide",             icon: "GraduationCap" },
  mission:         { label: "Create 2-roleplay mission", icon: "Target" },
  "add-to-mission": { label: "Add to mission",          icon: "Plus" },
  "one-on-one":    { label: "Log a 1:1",                icon: "MessageSquare" },
};

// Loop status → label + tone. open = no badge. Pairs colour with text.
export const LOOP_META = {
  open:      { label: "Open",                  tone: "tertiary" },
  acted:     { label: "Acted · awaiting result", tone: "info" },
  improved:  { label: "Improved",              tone: "success" },
  no_change: { label: "No change yet",         tone: "tertiary" },
};

const pct = "%";

// ---- Open attention items (the queue) -----------------------------------
export const ATTENTION_ITEMS = [
  {
    id: "ai-willis-deesc",
    agent: { id: "198320", name: "Willis Jast", initials: "WJ" },
    competency: "De-escalation",
    driver: "Billing-retention",
    signal: "performance",
    evidence: "CSAT fell 11pp to 54% over 3 weeks — bottom of the team on billing calls.",
    metric: { points: [72, 70, 66, 61, 54], unit: pct, current: 54, labels: ["5w", "4w", "3w", "2w", "now"] },
    severity: "high",
    centrality: 3,
    reach: 1,
    recencyDays: 2,
    overdueDays: null,
    deadline: null,
    intervention: { kind: "replay", asset: "De-escalation: angry billing dispute", duration: "12 min" },
    sampleNote: "Based on 41 scored calls this window.",
  },
  {
    id: "ai-ravi-resolution",
    agent: { id: "215566", name: "Ravi Patel", initials: "RP" },
    competency: "Resolution & Expectations",
    driver: "Account management",
    signal: "qa",
    evidence: "QA scored 38% — 4 interactions breached the resolution-clarity threshold.",
    metric: { points: [55, 50, 46, 42, 38], unit: pct, current: 38, labels: ["5w", "4w", "3w", "2w", "now"] },
    severity: "high",
    centrality: 2,
    reach: 1,
    recencyDays: 1,
    overdueDays: null,
    deadline: null,
    intervention: { kind: "guide", asset: "Setting Clear Resolutions", duration: "15 min" },
    sampleNote: "Based on 4 of 36 calls flagged.",
  },
  {
    id: "ai-mukesh-overdue",
    agent: { id: "203891", name: "Mukesh Patil", initials: "MP" },
    competency: "Compliance scripting",
    driver: "Compliance",
    signal: "undone",
    evidence: "Assigned 'Compliance refresh' replay not started — 5 days past the due date.",
    metric: null,
    severity: "medium",
    centrality: 2,
    reach: 1,
    recencyDays: 6,
    overdueDays: 5,
    deadline: "2026-06-09",
    intervention: { kind: "one-on-one", asset: "Why the refresh matters", duration: "10 min" },
    sampleNote: null,
  },
  {
    id: "ai-cohort-empathy",
    agent: { id: "cohort-empathy", name: "3 agents · Empathy", initials: "3" },
    competency: "Empathy & Acknowledgment",
    driver: null,
    signal: "coverage",
    evidence: "High-volume empathy moments, no practice coverage for Tod, Hiroshi & Noah.",
    metric: null,
    severity: "medium",
    centrality: 3,
    reach: 3,
    recencyDays: 4,
    overdueDays: null,
    deadline: null,
    intervention: { kind: "mission", asset: "Empathy & tone calibration", duration: "2 roleplays" },
    sampleNote: "Cohort item — 3 agents share this gap.",
  },
  {
    id: "ai-priya-mission",
    agent: { id: "217430", name: "Priya Nair", initials: "PN" },
    competency: "Needs Discovery",
    driver: "Retention",
    signal: "mission",
    evidence: "Retention-save mission ends in 3 days; Priya is at 40% of the readiness target.",
    metric: { points: [10, 18, 26, 33, 40], unit: pct, current: 40, labels: ["d1", "d4", "d7", "d10", "now"] },
    severity: "high",
    centrality: 2,
    reach: 1,
    recencyDays: 1,
    overdueDays: null,
    deadline: "2026-06-16",
    intervention: { kind: "add-to-mission", asset: "Retention save readiness — Q2", duration: "3 roleplays" },
    sampleNote: null,
  },
  {
    id: "ai-hiroshi-pacing",
    agent: { id: "184775", name: "Hiroshi Tanaka", initials: "HT" },
    competency: "Call Pacing",
    driver: "Account management",
    signal: "regression",
    evidence: "Silence-handling regressed 6pp after 2 strong weeks — worth catching early.",
    metric: { points: [58, 64, 70, 67, 61], unit: pct, current: 61, labels: ["5w", "4w", "3w", "2w", "now"] },
    severity: "low",
    centrality: 1,
    reach: 1,
    recencyDays: 3,
    overdueDays: null,
    deadline: null,
    intervention: { kind: "replay", asset: "Advanced Conversation Pacing", duration: "10 min" },
    sampleNote: null,
  },
  {
    id: "ai-liam-resolution",
    agent: { id: "201357", name: "Liam Donovan", initials: "LD" },
    competency: "Resolution & Expectations",
    driver: "Retention",
    signal: "performance",
    evidence: "AHT up 18% on retention saves while resolution held flat — efficiency slipping.",
    metric: { points: [44, 47, 49, 51, 52], unit: pct, current: 52, labels: ["5w", "4w", "3w", "2w", "now"] },
    severity: "medium",
    centrality: 1,
    reach: 1,
    recencyDays: 5,
    overdueDays: null,
    deadline: null,
    intervention: { kind: "guide", asset: "Efficient Resolution Paths", duration: "12 min" },
    sampleNote: null,
  },
  {
    id: "ai-sofia-overdue",
    agent: { id: "213846", name: "Sofia Russo", initials: "SR" },
    competency: "Upsell confidence",
    driver: "Account management",
    signal: "undone",
    evidence: "Assigned 'Upsell confidence' guide untouched — 2 days past due.",
    metric: null,
    severity: "low",
    centrality: 1,
    reach: 1,
    recencyDays: 3,
    overdueDays: 2,
    deadline: "2026-06-11",
    intervention: { kind: "one-on-one", asset: "Quick nudge on the assignment", duration: "5 min" },
    sampleNote: null,
  },
];

// ---- Recently closed-loop items (the "this worked" recap + board lanes) --
// status: "improved" | "no_change". delta carries the post-intervention move
// with an explicit sign + unit so it never relies on colour alone.
export const RESOLVED_ITEMS = [
  {
    id: "rs-aaliyah",
    agent: { id: "193845", name: "Aaliyah Tillman", initials: "AT" },
    competency: "Acknowledgment statements",
    driver: "Billing-retention",
    status: "improved",
    intervention: { kind: "replay", asset: "Empathy & Acknowledgment Practice", duration: "12 min" },
    delta: { label: "Acknowledgment rate", value: "+15pp", direction: "up", window: "in 4 days" },
  },
  {
    id: "rs-grace",
    agent: { id: "222019", name: "Grace Okafor", initials: "GO" },
    competency: "Compliance scripting",
    driver: "Compliance",
    status: "improved",
    intervention: { kind: "guide", asset: "Compliance scripting refresh", duration: "15 min" },
    delta: { label: "QA score", value: "+9pp", direction: "up", window: "in 1 week" },
  },
  {
    id: "rs-marcus",
    agent: { id: "195602", name: "Marcus Lowe", initials: "ML" },
    competency: "Empathy & Acknowledgment",
    driver: null,
    status: "improved",
    intervention: { kind: "mission", asset: "Empathy & tone calibration", duration: "2 roleplays" },
    delta: { label: "CSAT", value: "+7pp", direction: "up", window: "in 2 weeks" },
  },
  {
    id: "rs-noah",
    agent: { id: "190644", name: "Noah Bergstrom", initials: "NB" },
    competency: "Resolution & Expectations",
    driver: "Account management",
    status: "no_change",
    intervention: { kind: "guide", asset: "Setting Clear Resolutions", duration: "15 min" },
    delta: { label: "QA score", value: "0pp", direction: "flat", window: "in 1 week" },
  },
];

// ---- Team strip KPIs (StatCard row) -------------------------------------
// Every value carries a label + unit (WCAG composite-number rule). Trend
// sublabels pair the arrow glyph with text, never colour alone.
export const TEAM_KPIS = [
  { id: "attention", label: "Needs attention", value: "6 agents", sublabel: "of 18 on your team" },
  { id: "coverage",  label: "Coaching coverage", value: "11 / 18", sublabel: "agents touched this week" },
  { id: "improved",  label: "Interventions improved", value: "4", sublabel: "of 7 in last cycle" },
  { id: "ttfa",      label: "Time to first action", value: "1.4 days", sublabel: "↓ 0.6 vs last week" },
];

export const TEAM_CONTEXT = {
  team: "Billing & Retention",
  lead: "Maria Santos",
};
