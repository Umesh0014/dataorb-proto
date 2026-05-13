const PERF_ROWS_EMPTY = [
  { name: "Refund/Extension Policy", type: "policy", targetScore: null, roleplays: null, targetMet: null },
  { name: "Save/Retention Offer Usage", type: "policy", targetScore: null, roleplays: null, targetMet: null },
  { name: "Step-by-Step Guidance", type: "qualitative", targetScore: null, roleplays: null, targetMet: null },
  { name: "Service Area Awareness", type: "policy", targetScore: null, roleplays: null, targetMet: null },
  { name: "Empathy & Tone", type: "qualitative", targetScore: null, roleplays: null, targetMet: null },
];

const PERF_ROWS_B = [
  { name: "Refund/Extension Policy", type: "policy", targetScore: 45, roleplays: 1, targetMet: 25 },
  { name: "Save/Retention Offer Usage", type: "policy", targetScore: 70, roleplays: 2, targetMet: 38 },
  { name: "Step-by-Step Guidance", type: "qualitative", targetScore: 55, roleplays: 3, targetMet: 64 },
  { name: "Service Area Awareness", type: "policy", targetScore: 60, roleplays: 2, targetMet: 75 },
  { name: "Empathy & Tone", type: "qualitative", targetScore: 86, roleplays: 4, targetMet: 86 },
];

const PERF_ROWS_CD = [
  { name: "Refund/Extension Policy", type: "policy", targetScore: 45, roleplays: 1, targetMet: 25 },
  { name: "Save/Retention Offer Usage", type: "policy", targetScore: 70, roleplays: 2, targetMet: 38 },
  { name: "Step-by-Step Guidance", type: "qualitative", targetScore: 55, roleplays: 3, targetMet: 38 },
  { name: "Service Area Awareness", type: "policy", targetScore: 60, roleplays: 2, targetMet: 40 },
  { name: "Empathy & Tone", type: "qualitative", targetScore: 86, roleplays: 4, targetMet: 70 },
];

const INTERACTIONS = [
  { id: "int-1", name: "Jasper F", initial: "J", contactReason: "Request Payment Extension", duration: "8m 30s", date: "20 Mar 2026", qaScore: 45 },
  { id: "int-2", name: "Willow B", initial: "W", contactReason: "Inquire about billing charge", duration: "8m 15s", date: "20 Mar 2026", qaScore: 56 },
  { id: "int-3", name: "Fiona B", initial: "F", contactReason: "Cancel mobile and internet", duration: "7m 50s", date: "18 Mar 2026", qaScore: 75 },
  { id: "int-4", name: "Gabriel S", initial: "G", contactReason: "Lower monthly bill", duration: "9m 5s", date: "18 Mar 2026", qaScore: 85 },
  { id: "int-5", name: "Hannah L", initial: "H", contactReason: "Cancel a phone line", duration: "9m 20s", date: "18 Mar 2026", qaScore: 92 },
];

export const DEMO_MISSIONS = [
  {
    id: "mission-a",
    name: "Retention Save Readiness — Q2",
    description: "Equip agents to handle cancellation requests with confident objection handling, accurate permanencia explanation, and proactive offer positioning.",
    startDate: "2026-05-12",
    endDate: "2026-06-26",
    daysLeft: 45,
    progress: 0,
    agentCount: 22,
    focusAreaCount: 5,
    driverCount: 15,
    state: "just_started",
    tags: ["Implement Feedback", "Active Listening", "Policy Accuracy"],
    kpis: {
      agentsBelowTarget: { current: 0, total: 22 },
      lastRoleplay: null,
      roleplays: 0,
      contactReasons: { current: 0, total: 10 },
    },
    performance: PERF_ROWS_EMPTY,
    interactions: [],
    totalInteractions: 0,
    timeline: [
      { date: "12 May 2026", title: "Mission Started", description: "22 agents recruited across 5 focus areas, 15 drivers", tone: "success" },
    ],
  },
  {
    id: "mission-b",
    name: "Customer Support Enhancement",
    description: "Improve customer satisfaction through in-call resolution, accurate policy framing, and consistent empathy under pressure.",
    startDate: "2026-04-02",
    endDate: "2026-06-01",
    daysLeft: 20,
    progress: 67,
    agentCount: 18,
    focusAreaCount: 5,
    driverCount: 15,
    state: "on_track",
    tags: ["Implement Feedback", "First-Call Resolution", "Empathy Training", "Policy Accuracy"],
    kpis: {
      agentsBelowTarget: { current: 4, total: 22 },
      lastRoleplay: "23 Mar 2026",
      roleplays: 15,
      contactReasons: { current: 8, total: 10 },
    },
    performance: PERF_ROWS_B,
    interactions: INTERACTIONS,
    totalInteractions: 150,
    timeline: [
      { date: "28 Mar 2026", title: "All Agents Completed First Roleplay", description: "22 of 22 agents completed their first roleplay practice.", tone: "neutral" },
      { date: "23 Mar 2026", title: "Mission Started", description: "22 agents recruited across 5 focus areas, 15 drivers", tone: "success" },
    ],
  },
  {
    id: "mission-c",
    name: "Compliance Readiness — Q1",
    description: "Verify agent compliance with disclosure scripts, payment authorization, and policy handoff timing across all customer touchpoints.",
    startDate: "2026-04-12",
    endDate: "2026-05-12",
    daysLeft: 0,
    progress: 100,
    agentCount: 22,
    focusAreaCount: 5,
    driverCount: 15,
    state: "ends_today",
    tags: ["Demonstrate Empathy", "Compliance Audit"],
    kpis: {
      agentsBelowTarget: { current: 20, total: 22 },
      lastRoleplay: "23 Mar 2026",
      roleplays: 38,
      contactReasons: { current: 6, total: 10 },
    },
    performance: PERF_ROWS_CD,
    interactions: INTERACTIONS,
    totalInteractions: 150,
    alert: {
      tone: "danger",
      heading: "Mission Ends Today",
      body: "20 of 22 agents have not reached their readiness target",
      actions: [
        { label: "Extend Timeline", variant: "primary" },
        { label: "Close Mission", variant: "secondary" },
      ],
    },
    timeline: [
      { date: "28 Mar 2026", title: "All Agents Completed First Roleplay", description: "22 of 22 agents completed their first roleplay practice.", tone: "neutral" },
      { date: "23 Mar 2026", title: "Mission Started", description: "22 agents recruited across 5 focus areas, 15 drivers", tone: "success" },
    ],
  },
  {
    id: "mission-d",
    name: "Digital Support Foundations",
    description: "Build readiness in self-serve guidance, app troubleshooting, and ticket deflection for high-volume digital channels.",
    startDate: "2026-04-15",
    endDate: "2026-05-15",
    daysLeft: 3,
    progress: 90,
    agentCount: 22,
    focusAreaCount: 5,
    driverCount: 15,
    state: "ending_soon",
    tags: ["Demonstrate Empathy", "Digital Troubleshooting", "Ticket Deflection"],
    kpis: {
      agentsBelowTarget: { current: 8, total: 22 },
      lastRoleplay: "23 Mar 2026",
      roleplays: 15,
      contactReasons: { current: 10, total: 10 },
    },
    performance: PERF_ROWS_CD,
    interactions: INTERACTIONS,
    totalInteractions: 150,
    alert: {
      tone: "warning",
      heading: "Mission Ends in 3 days",
      body: "8 of 22 agents have not yet reached their readiness targets",
      actions: [],
    },
    timeline: [
      { date: "16 Apr 2026", title: "Timeline Extended", description: "Extended by 7 days. Original date: 16 Apr 2026", tone: "warning" },
      { date: "28 Mar 2026", title: "All Agents Completed First Roleplay", description: "22 of 22 agents completed their first roleplay practice.", tone: "neutral" },
      { date: "23 Mar 2026", title: "Mission Started", description: "22 agents recruited across 5 focus areas, 15 drivers", tone: "success" },
    ],
  },
];

// Completed missions — terminal state. closeOutcome drives banner copy + tone.
// kpis adds missionDuration (with optional sub-label for extended timelines).
// agentResults replaces interactions in the detail pane.
DEMO_MISSIONS.push(
  {
    id: "mission-completed-all-met",
    name: "Retention Save Readiness — Q2",
    description: "Equip agents to handle cancellation requests with confident objection handling, accurate permanencia explanation, and proactive offer positioning.",
    startDate: "2026-03-23",
    endDate: "2026-04-23",
    daysLeft: -19,
    progress: 100,
    agentCount: 22,
    focusAreaCount: 5,
    driverCount: 15,
    state: "completed",
    closeOutcome: "all_met",
    closedAt: "2026-04-23",
    originalEndDate: "2026-04-16",
    extendedDays: 7,
    missionDurationDays: 31,
    agentsReachedTarget: 22,
    agentsTotal: 22,
    tags: ["Implement Feedback", "Active Listening", "Policy Accuracy"],
    kpis: {
      agentsBelowTarget: { current: 1, total: 22 },
      lastRoleplay: "23 Mar 2026",
      lastRoleplaySubLabel: "1 day before close",
      roleplays: 156,
      contactReasons: { current: 10, total: 10 },
      missionDuration: 31,
      missionDurationSubLabel: "Extended +7 days",
    },
    agentResults: [
      { id: "ag-1",  name: "Jasper F",   initial: "J",  roleplaysCompleted: 12, lastActive: "2026-03-20", target: "Met" },
      { id: "ag-2",  name: "Willow B",   initial: "W",  roleplaysCompleted: 11, lastActive: "2026-03-20", target: "Met" },
      { id: "ag-3",  name: "Fiona B",    initial: "F",  roleplaysCompleted: 10, lastActive: "2026-03-18", target: "Met" },
      { id: "ag-4",  name: "Gabriel S",  initial: "G",  roleplaysCompleted: 8,  lastActive: "2026-03-18", target: "Met" },
      { id: "ag-5",  name: "Hannah L",   initial: "H",  roleplaysCompleted: 8,  lastActive: "2026-02-18", target: "Met" },
    ],
    agentResultsTotal: 22,
    timeline: [
      { date: "23 Apr 2026", title: "Mission Closed",                 description: "Auto-closed at the end of extended timeline. 18 of 22 agents met target", tone: "info" },
      { date: "22 Apr 2026", title: "Last Roleplay Completed",        description: "The last roleplay for the mission was completed",                          tone: "neutral" },
      { date: "16 Apr 2026", title: "Timeline Extended",              description: "Extended by 7 days. Original date: 16 Apr 2026",                           tone: "warning" },
      { date: "28 Mar 2026", title: "All Agents Completed First Roleplay", description: "22 of 22 agents completed their first roleplay practice.",          tone: "neutral" },
      { date: "23 Mar 2026", title: "Mission Started",                description: "22 agents recruited across 5 focus areas, 15 drivers",                    tone: "success" },
    ],
  },
  {
    id: "mission-completed-some-below",
    name: "Empathy & De-escalation — Q1",
    description: "Build agent confidence in empathy-led de-escalation and recovery framing across high-tension billing conversations.",
    startDate: "2026-01-15",
    endDate: "2026-02-15",
    daysLeft: -86,
    progress: 100,
    agentCount: 18,
    focusAreaCount: 4,
    driverCount: 12,
    state: "completed",
    closeOutcome: "some_below",
    closedAt: "2026-02-15",
    originalEndDate: "2026-02-15",
    extendedDays: 0,
    missionDurationDays: 31,
    agentsReachedTarget: 14,
    agentsTotal: 18,
    tags: ["Empathy Training", "De-escalation"],
    kpis: {
      agentsBelowTarget: { current: 4, total: 18 },
      lastRoleplay: "13 Feb 2026",
      lastRoleplaySubLabel: "2 days before close",
      roleplays: 122,
      contactReasons: { current: 7, total: 10 },
      missionDuration: 31,
      missionDurationSubLabel: null,
    },
    agentResults: [
      { id: "ag-1", name: "Adrian T", initial: "A", roleplaysCompleted: 10, lastActive: "2026-02-12", target: "Met"     },
      { id: "ag-2", name: "Bex K",    initial: "B", roleplaysCompleted: 9,  lastActive: "2026-02-12", target: "Met"     },
      { id: "ag-3", name: "Camila O", initial: "C", roleplaysCompleted: 5,  lastActive: "2026-01-22", target: "Not Met" },
      { id: "ag-4", name: "Diego P",  initial: "D", roleplaysCompleted: 8,  lastActive: "2026-02-10", target: "Met"     },
      { id: "ag-5", name: "Eli R",    initial: "E", roleplaysCompleted: 4,  lastActive: "2026-01-18", target: "Not Met" },
    ],
    agentResultsTotal: 18,
    timeline: [
      { date: "15 Feb 2026", title: "Mission Closed",                 description: "Auto-closed at the end of timeline. 14 of 18 agents met target", tone: "info" },
      { date: "13 Feb 2026", title: "Last Roleplay Completed",        description: "The last roleplay for the mission was completed",                tone: "neutral" },
      { date: "28 Jan 2026", title: "All Agents Completed First Roleplay", description: "18 of 18 agents completed their first roleplay practice.", tone: "neutral" },
      { date: "15 Jan 2026", title: "Mission Started",                description: "18 agents recruited across 4 focus areas, 12 drivers",          tone: "success" },
    ],
  },
  {
    id: "mission-completed-closed-early",
    name: "Compliance Spot-Check — Pilot",
    description: "Short pilot mission to validate the new compliance disclosure script before broader rollout.",
    startDate: "2026-03-01",
    endDate: "2026-04-30",
    daysLeft: -25,
    progress: 100,
    agentCount: 10,
    focusAreaCount: 2,
    driverCount: 4,
    state: "completed",
    closeOutcome: "closed_early",
    closedAt: "2026-04-17",
    originalEndDate: "2026-04-30",
    extendedDays: 0,
    missionDurationDays: 47,
    agentsReachedTarget: 9,
    agentsTotal: 10,
    tags: ["Compliance Audit"],
    kpis: {
      agentsBelowTarget: { current: 1, total: 10 },
      lastRoleplay: "16 Apr 2026",
      lastRoleplaySubLabel: "1 day before close",
      roleplays: 48,
      contactReasons: { current: 5, total: 8 },
      missionDuration: 47,
      missionDurationSubLabel: null,
    },
    agentResults: [
      { id: "ag-1", name: "Marco V",  initial: "M", roleplaysCompleted: 6, lastActive: "2026-04-16", target: "Met"     },
      { id: "ag-2", name: "Nadia S",  initial: "N", roleplaysCompleted: 5, lastActive: "2026-04-15", target: "Met"     },
      { id: "ag-3", name: "Owen R",   initial: "O", roleplaysCompleted: 5, lastActive: "2026-04-15", target: "Met"     },
      { id: "ag-4", name: "Priya K",  initial: "P", roleplaysCompleted: 4, lastActive: "2026-04-14", target: "Met"     },
      { id: "ag-5", name: "Quincy A", initial: "Q", roleplaysCompleted: 2, lastActive: "2026-03-20", target: "Not Met" },
    ],
    agentResultsTotal: 10,
    timeline: [
      { date: "17 Apr 2026", title: "Mission Closed Early",           description: "Closed on 17 Apr 2026.",                                          tone: "info" },
      { date: "16 Apr 2026", title: "Last Roleplay Completed",        description: "The last roleplay for the mission was completed",                tone: "neutral" },
      { date: "10 Mar 2026", title: "All Agents Completed First Roleplay", description: "10 of 10 agents completed their first roleplay practice.", tone: "neutral" },
      { date: "1 Mar 2026",  title: "Mission Started",                description: "10 agents recruited across 2 focus areas, 4 drivers",            tone: "success" },
    ],
  },
);

// Setup checklist order (Draft detail pane). 6 rows: Define-wizard step
// splits into 3 (Mission Overview / Mission Timeline / Minimum Practice
// Sessions); remaining 3 map 1:1 to Coverage / Focus Areas / Recruit.
// Preview & Publish is omitted — it's the publishing act, not a field.
export const DRAFT_SETUP_STEPS = [
  { id: "overview",  label: "Mission Overview" },
  { id: "timeline",  label: "Mission Timeline" },
  { id: "practice",  label: "Minimum Practice Sessions" },
  { id: "coverage",  label: "Coverage" },
  { id: "focus",     label: "Focus Areas" },
  { id: "recruit",   label: "Recruit Agent" },
];

// Draft missions — partially filled from create-mission wizard.
// Render via DraftMissionCard in left column; null fields → "--" placeholders.
// setupChecklist: { [stepId]: boolean }; true = complete, missing/false = incomplete.
DEMO_MISSIONS.push(
  {
    id: "mission-g-draft",
    name: "Outbound Sales Calibration",
    description: "Sharpen agent talk tracks for outbound prospecting calls.",
    startDate: "2026-06-01",
    endDate: "2026-07-01",
    daysLeft: null,
    progress: 60,
    agentCount: 12,
    focusAreaCount: 2,
    driverCount: null,
    state: "draft",
    ownerInitials: "MK",
    tags: ["Discovery", "Objection Handling"],
    setupChecklist: { overview: true, timeline: true, practice: true, coverage: true },
    kpis: null,
    performance: [],
    interactions: [],
    totalInteractions: 0,
    timeline: [],
  },
  {
    id: "mission-i-draft-complete",
    name: "Win-Back Readiness — Q3",
    description: "Equip agents to handle cancellation requests with confident objection handling, accurate permanencia explanation, and proactive offer positioning.",
    startDate: "2026-03-23",
    endDate: "2026-04-23",
    timelineLabel: "4 Weeks",
    minimumPracticeSessions: 9,
    daysLeft: null,
    progress: 100,
    agentCount: 22,
    focusAreaCount: 4,
    driverCount: 3,
    state: "draft",
    ownerInitials: "WB",
    tags: ["Implement Feedback", "Active Listening", "Policy Accuracy"],
    setupChecklist: { overview: true, timeline: true, practice: true, coverage: true, focus: true, recruit: true },
    coverage: [
      { id: "billing",   driver: "Billing and Payment", reasonCount: 50 },
      { id: "retention", driver: "Retention and Churn", reasonCount: 2  },
      { id: "digital",   driver: "Digital Support",     reasonCount: 2  },
    ],
    focusAreas: [
      { id: "fa-refund",  name: "Refund/Extension Policy",    type: "policy",      targetScore: 80 },
      { id: "fa-payment", name: "Payment Arrangement Logic",  type: "policy",      targetScore: 80 },
      { id: "fa-save",    name: "Save/Retention Offer Usage", type: "policy",      targetScore: 80 },
      { id: "fa-empathy", name: "Empathy & Tone",             type: "qualitative", targetScore: 80 },
    ],
    recruitedAgents: [
      { id: "ra-malik", initials: "J", name: "Malik J", team: "Retention Team A" },
      { id: "ra-priya", initials: "J", name: "Priya P", team: "Retention Team A" },
      { id: "ra-kenij", initials: "J", name: "Kenij T", team: "Retention Team B" },
      { id: "ra-omar",  initials: "J", name: "Omar H",  team: "Retention Team B" },
    ],
    kpis: null,
    performance: [],
    interactions: [],
    totalInteractions: 0,
    timeline: [],
  },
);

// Global KPI tile row — derived from the active mission set.
//
// `ACTIVE_STATES` / `AT_RISK_STATES` define which states the row counts.
// `GLOBAL_KPI_BASELINE` carries demo-only constants representing the
// workspace context that lives outside the demo mission cards (full
// agent roster + missions not surfaced in the card list). In a real
// deployment these would be replaced by a workspace-scoped read.
//
// Derivation rules:
//   Active Missions     = activeMissions.length + baseline.hiddenActiveMissions
//   Agents in Training  = baseline.agentsInTrainingCurrent / baseline.agentsInTrainingTotal
//   Total Roleplays     = baseline.totalRoleplaysOverride  (demo)
//   Agents Below Target = baseline.agentsBelowTargetOverride  (demo)
//   Missions at Risk    = max(derivedAtRisk, baseline.missionsAtRiskFloor)
//
// State changes flow through derivation: e.g. transitioning a mission
// from `on_track` to `ending_soon` bumps Missions at Risk; publishing
// a draft (state → `just_started`) bumps Active Missions.
const ACTIVE_STATES  = new Set(["just_started", "on_track", "ending_soon", "ends_today", "ends_today_behind"]);
const AT_RISK_STATES = new Set(["ending_soon", "ends_today_behind"]);

export const GLOBAL_KPI_BASELINE = {
  hiddenActiveMissions:     6,
  agentsInTrainingCurrent:  16,
  agentsInTrainingTotal:    18,
  totalRoleplaysOverride:   15,
  agentsBelowTargetOverride: 4,
  missionsAtRiskFloor:      1,
};

export function deriveGlobalKpis(missions, baseline = GLOBAL_KPI_BASELINE) {
  const active = missions.filter((m) => ACTIVE_STATES.has(m.state));
  const derivedAtRisk = active.filter((m) => AT_RISK_STATES.has(m.state)).length;
  return [
    { label: "Active Missions",     value: String(active.length + baseline.hiddenActiveMissions) },
    { label: "Agents in Training",  value: `${baseline.agentsInTrainingCurrent}/${baseline.agentsInTrainingTotal}` },
    { label: "Total Roleplays",     value: String(baseline.totalRoleplaysOverride) },
    { label: "Agents Below Target", value: String(baseline.agentsBelowTargetOverride) },
    { label: "Missions at Risk",    value: String(Math.max(derivedAtRisk, baseline.missionsAtRiskFloor)) },
  ];
}
