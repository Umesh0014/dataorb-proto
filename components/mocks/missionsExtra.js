// Extra missions seeded only for the sandbox-redesign layouts (Dense
// table / Kanban / Hybrid table) so they have enough rows to feel
// populated. The original DEMO_MISSIONS array stays untouched so the
// "Current" layout shows exactly what it shows today. Layout-specific
// callers compose `[...DEMO_MISSIONS, ...EXTRA_MISSIONS]` themselves.

import { DEMO_MISSIONS } from "./missionsSeedData";

// Re-use the detail data from `mission-b` so every row's expanded view
// and every detail-page visit shares the same content per the spec —
// the demo is about layout exploration, not data variety.
const SOURCE_DETAIL = DEMO_MISSIONS.find((m) => m.id === "mission-b");

function withSharedDetail(base) {
  return {
    ...base,
    kpis: SOURCE_DETAIL.kpis,
    performance: SOURCE_DETAIL.performance,
    interactions: SOURCE_DETAIL.interactions,
    totalInteractions: SOURCE_DETAIL.totalInteractions,
    timeline: SOURCE_DETAIL.timeline,
  };
}

export const EXTRA_MISSIONS = [
  withSharedDetail({
    id: "mission-ex-1",
    name: "Billing Inquiry Mastery",
    description: "Sharpen accuracy and tone on routine billing inquiries.",
    startDate: "2026-04-08",
    endDate: "2026-06-12",
    daysLeft: 31,
    progress: 58,
    agentCount: 24,
    focusAreaCount: 4,
    driverCount: 12,
    state: "on_track",
    ownerInitials: "MK",
    tags: ["Billing Accuracy", "Tone"],
  }),
  withSharedDetail({
    id: "mission-ex-2",
    name: "First-Call Resolution Push",
    description: "Lift FCR across all teams.",
    startDate: "2026-03-15",
    endDate: "2026-05-29",
    daysLeft: 18,
    progress: 72,
    agentCount: 30,
    focusAreaCount: 5,
    driverCount: 18,
    state: "on_track",
    ownerInitials: "AT",
    tags: ["FCR", "Active Listening", "Empathy"],
  }),
  withSharedDetail({
    id: "mission-ex-3",
    name: "Outbound Save Calibration",
    description: "Align outbound talk tracks with new compliance policy.",
    startDate: "2026-04-20",
    endDate: "2026-05-25",
    daysLeft: 14,
    progress: 41,
    agentCount: 14,
    focusAreaCount: 3,
    driverCount: 8,
    state: "on_track",
    ownerInitials: "JR",
    tags: ["Compliance", "Save Tactics"],
  }),
  withSharedDetail({
    id: "mission-ex-4",
    name: "VIP Lounge Quality",
    description: "High-tier customer interactions.",
    startDate: "2026-05-01",
    endDate: "2026-06-30",
    daysLeft: 52,
    progress: 18,
    agentCount: 9,
    focusAreaCount: 6,
    driverCount: 9,
    state: "just_started",
    ownerInitials: "PS",
    tags: ["VIP", "Premium Tone"],
  }),
  withSharedDetail({
    id: "mission-ex-5",
    name: "Cross-sell Confidence",
    description: "Train confident cross-sell framing across product lines.",
    startDate: "2026-02-01",
    endDate: "2026-05-25",
    daysLeft: 14,
    progress: 88,
    agentCount: 20,
    focusAreaCount: 5,
    driverCount: 14,
    state: "ending_soon",
    ownerInitials: "RB",
    tags: ["Cross-Sell", "Product Knowledge"],
  }),
  withSharedDetail({
    id: "mission-ex-6",
    name: "De-escalation Reinforcement",
    description: "Embed empathy framing in every recovery conversation.",
    startDate: "2026-03-04",
    endDate: "2026-05-23",
    daysLeft: 12,
    progress: 64,
    agentCount: 22,
    focusAreaCount: 4,
    driverCount: 10,
    state: "ending_soon",
    ownerInitials: "EC",
    tags: ["De-escalation", "Empathy"],
  }),
  withSharedDetail({
    id: "mission-ex-7",
    name: "Chat Channel Onboarding",
    description: "Onboard new chat-only specialists.",
    startDate: "2026-05-05",
    endDate: "2026-05-22",
    daysLeft: 2,
    progress: 38,
    agentCount: 11,
    focusAreaCount: 3,
    driverCount: 6,
    state: "ends_today",
    ownerInitials: "LF",
    tags: ["Chat", "Onboarding"],
  }),
  withSharedDetail({
    id: "mission-ex-8",
    name: "Payment Plan Coaching",
    description: "Coach payment-plan presentation across collections.",
    startDate: "2026-03-22",
    endDate: "2026-05-12",
    daysLeft: -9,
    progress: 100,
    agentCount: 16,
    focusAreaCount: 4,
    driverCount: 10,
    state: "completed",
    closeOutcome: "all_met",
    closedAt: "2026-05-12",
    originalEndDate: "2026-05-12",
    extendedDays: 0,
    missionDurationDays: 51,
    agentsReachedTarget: 16,
    agentsTotal: 16,
    ownerInitials: "TH",
    tags: ["Payments", "Collections"],
  }),
  withSharedDetail({
    id: "mission-ex-9",
    name: "Refund Workflow Drill",
    description: "Refund policy + workflow drill across retail.",
    startDate: "2026-02-12",
    endDate: "2026-03-30",
    daysLeft: -52,
    progress: 100,
    agentCount: 25,
    focusAreaCount: 6,
    driverCount: 12,
    state: "completed",
    closeOutcome: "some_below",
    closedAt: "2026-03-30",
    originalEndDate: "2026-03-30",
    extendedDays: 0,
    missionDurationDays: 46,
    agentsReachedTarget: 19,
    agentsTotal: 25,
    ownerInitials: "GS",
    tags: ["Refunds", "Policy"],
  }),
  withSharedDetail({
    id: "mission-ex-10",
    name: "Self-Serve Deflection Training",
    description: "Ticket deflection through self-serve guidance.",
    startDate: "2026-04-26",
    endDate: "2026-06-14",
    daysLeft: 34,
    progress: 22,
    agentCount: 17,
    focusAreaCount: 3,
    driverCount: 7,
    state: "on_track",
    ownerInitials: "ND",
    tags: ["Self-Serve", "Deflection"],
  }),
  withSharedDetail({
    id: "mission-ex-11",
    name: "Empathy Pulse Refresh",
    description: "Refresh empathy fundamentals across veteran agents.",
    startDate: "2026-03-30",
    endDate: "2026-05-19",
    daysLeft: 8,
    progress: 76,
    agentCount: 28,
    focusAreaCount: 4,
    driverCount: 12,
    state: "ending_soon",
    ownerInitials: "VG",
    tags: ["Empathy", "Refresher"],
  }),
  withSharedDetail({
    id: "mission-ex-12",
    name: "Disputed Charge Handling",
    description: "Standardize disputed-charge handling.",
    startDate: "2026-04-01",
    endDate: "2026-05-21",
    daysLeft: 0,
    progress: 62,
    agentCount: 19,
    focusAreaCount: 5,
    driverCount: 11,
    state: "ends_today",
    ownerInitials: "MN",
    tags: ["Disputes", "Policy"],
  }),
];

// Merged set the non-Kanban sandbox layouts iterate over. Drafts are
// excluded here — Table and Hybrid still keep them in their own surfaces.
// The Kanban (Iteration 5) consumes [...SANDBOX_DRAFTS, ...SANDBOX_MISSIONS]
// so the Draft swimlane has rows to render.
export const SANDBOX_MISSIONS = [...DEMO_MISSIONS, ...EXTRA_MISSIONS].filter(
  (m) => m.state !== "draft",
);

// Empty-state draft — seeded so the Kanban can demo the third draft card
// variant (no name, no checklist progress, no metadata at all).
const EMPTY_DRAFT = {
  id: "mission-draft-empty",
  name: "",
  description: "",
  startDate: null,
  endDate: null,
  daysLeft: null,
  progress: 0,
  agentCount: null,
  focusAreaCount: 0,
  driverCount: 0,
  state: "draft",
  ownerInitials: "",
  tags: [],
  setupChecklist: {},
};

// Draft missions surfaced in the Kanban's Draft swimlane. Covers all three
// card states: empty (no name + zero items), incomplete (some items), and
// complete (all six items).
export const SANDBOX_DRAFTS = [
  EMPTY_DRAFT,
  ...DEMO_MISSIONS.filter((m) => m.state === "draft"),
];

// KANBAN_DEMO_MISSIONS — curated to exactly one card per non-draft
// running/closed sub-state described in Iteration 7. Today is treated as
// 2026-05-23 (see formatDate UTC logic). Each card carries the shared
// detail body so the curtain still has populated KPIs / Performance /
// Interactions / Timeline content.
function withDetail(base, kpiOverride) {
  return {
    ...withSharedDetail(base),
    ...(kpiOverride ? { kpis: { ...SOURCE_DETAIL.kpis, ...kpiOverride } } : null),
  };
}

export const KANBAN_DEMO_MISSIONS = [
  // Active — Just Started (started 3 days ago, 48 days left)
  withDetail({
    id: "kanban-just-started",
    name: "Win-Back Pulse — June Cohort",
    description: "Initial coaching pass for newly onboarded win-back specialists.",
    startDate: "2026-05-20",
    endDate: "2026-07-10",
    daysLeft: 48,
    progress: 0,
    agentCount: 12,
    focusAreaCount: 4,
    driverCount: 6,
    state: "on_track",
    ownerInitials: "NB",
    tags: ["Onboarding", "Initial Coaching"],
  }),
  // Active — On Track (started 18 days ago, 30 days left, healthy progress)
  withDetail({
    id: "kanban-on-track",
    name: "Customer Support Enhancement",
    description: "Improve customer satisfaction through in-call resolution and consistent empathy under pressure.",
    startDate: "2026-05-05",
    endDate: "2026-06-22",
    daysLeft: 30,
    progress: 60,
    agentCount: 18,
    focusAreaCount: 5,
    driverCount: 12,
    state: "on_track",
    ownerInitials: "MK",
    tags: ["First-Call Resolution", "Empathy", "Implement Feedback"],
  }),
  // At Risk — Ending Soon (8 days left, healthy progress but window closing)
  withDetail({
    id: "kanban-ending-soon",
    name: "Empathy Pulse Refresh",
    description: "Refresh empathy fundamentals across veteran agents before quarterly review.",
    startDate: "2026-03-30",
    endDate: "2026-05-31",
    daysLeft: 8,
    progress: 76,
    agentCount: 28,
    focusAreaCount: 4,
    driverCount: 12,
    state: "ending_soon",
    ownerInitials: "VG",
    tags: ["Empathy", "Refresher"],
  }),
  // At Risk — Ends Today — Agents Behind (closing today, 14 of 22 still below)
  withDetail(
    {
      id: "kanban-ends-today-behind",
      name: "Chat Channel Onboarding",
      description: "Onboard new chat-only specialists.",
      startDate: "2026-05-05",
      endDate: "2026-05-23",
      daysLeft: 0,
      progress: 38,
      agentCount: 22,
      focusAreaCount: 3,
      driverCount: 6,
      state: "ends_today",
      ownerInitials: "LF",
      tags: ["Chat", "Onboarding"],
    },
    { agentsBelowTarget: { current: 14, total: 22 } },
  ),
  // At Risk — Ready to Close (closing today, every agent at target)
  withDetail(
    {
      id: "kanban-ready-to-close",
      name: "Compliance Readiness — Q1",
      description: "Disclosure scripts, payment authorization, policy handoff timing.",
      startDate: "2026-04-23",
      endDate: "2026-05-23",
      daysLeft: 0,
      progress: 100,
      agentCount: 22,
      focusAreaCount: 5,
      driverCount: 8,
      state: "ends_today",
      ownerInitials: "AC",
      tags: ["Compliance", "Disclosure"],
    },
    { agentsBelowTarget: { current: 0, total: 22 } },
  ),
  // Completed — representative closed mission, all targets met
  withDetail({
    id: "kanban-completed",
    name: "Payment Plan Coaching",
    description: "Coach payment-plan presentation across collections.",
    startDate: "2026-03-22",
    endDate: "2026-05-12",
    daysLeft: -11,
    progress: 100,
    agentCount: 16,
    focusAreaCount: 4,
    driverCount: 10,
    state: "completed",
    closeOutcome: "all_met",
    closedAt: "2026-05-12",
    originalEndDate: "2026-05-12",
    extendedDays: 0,
    missionDurationDays: 51,
    agentsReachedTarget: 16,
    agentsTotal: 16,
    ownerInitials: "TH",
    tags: ["Payments", "Collections"],
  }),
];

// KANBAN_UPCOMING_MISSIONS — feeds the Upcoming sub-section inside the
// Active swimlane (team-viewer role only, revisions Part B). Inclusion
// rule per spec §B5: state !== "active" + start_date > today. Sorted
// here in earliest-first order so consumers can splice the first N
// directly.
export const KANBAN_UPCOMING_MISSIONS = [
  withDetail({
    id: "kanban-upcoming-1",
    name: "Premium Loyalty Save Drill",
    description: "Practice the saving-grace framework against high-ARPU churn threats before the August surge.",
    startDate: "2026-06-03",
    endDate: "2026-07-15",
    daysLeft: null,
    progress: 0,
    agentCount: 8,
    focusAreaCount: 3,
    driverCount: 5,
    state: "upcoming",
    ownerInitials: "MR",
    tags: ["Retention", "Loyalty"],
  }),
  withDetail({
    id: "kanban-upcoming-2",
    name: "Q3 Compliance Refresher",
    description: "Quarterly compliance pass covering tariff disclosure + concession-cap escalation.",
    startDate: "2026-06-15",
    endDate: "2026-07-30",
    daysLeft: null,
    progress: 0,
    agentCount: 22,
    focusAreaCount: 4,
    driverCount: 7,
    state: "upcoming",
    ownerInitials: "AC",
    tags: ["Compliance"],
  }),
  withDetail({
    id: "kanban-upcoming-3",
    name: "Empathy Reinforcement — Tier 2",
    description: "Second-pass coaching for agents who scored below the empathy bar in May.",
    startDate: "2026-07-01",
    endDate: "2026-08-12",
    daysLeft: null,
    progress: 0,
    agentCount: 14,
    focusAreaCount: 2,
    driverCount: 4,
    state: "upcoming",
    ownerInitials: "JV",
    tags: ["Coaching", "Soft Skills"],
  }),
];
