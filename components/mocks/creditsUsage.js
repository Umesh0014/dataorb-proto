// creditsUsage.js — sample data for the Credits & Usage admin surface.
// Team-level quota model per the Jun 11 brief: credit is committed at the
// tenant level, quota is distributed per team, and cadence (day/week/month)
// is a per-team variable because tenured vs new agents consume very
// differently. All mock; no backend.

import { CREDITS_USAGE_SAMPLE } from "../SettingsPage";

export const TENANT_SAMPLE = {
  allocatedCap: CREDITS_USAGE_SAMPLE.poolMinutes, // 24,000 min committed
  additionalCap: 4000, // additional minutes allowed on top, also capped
  usedThisPeriod: CREDITS_USAGE_SAMPLE.consumedMTD, // 14,880 min
  activeAgents: 18,
  totalAgents: 22,
  periodLabel: "This month",
};

export const CADENCES = [
  { id: "day", label: "Per day", short: "/day", adjective: "Daily" },
  { id: "week", label: "Per week", short: "/wk", adjective: "Weekly" },
  { id: "month", label: "Per month", short: "/mo", adjective: "Monthly" },
];

// Teams are inherited from the Contact Center side (same workspace/teams
// hierarchy). tenured vs new split drives why cadence/per-agent quota
// differ team to team. used/allocated set so a few teams sit at critical
// consumption (onboarding + sales at/over cap, billing high) for the bars.
export const TEAMS_SAMPLE = [
  { id: "onboarding", name: "Onboarding cohort", composition: "New", tenured: 0, newAgents: 6, cadence: "day", perAgent: 40, allocated: 6000, used: 6000 },
  { id: "billing", name: "Billing Support", composition: "Mixed", tenured: 2, newAgents: 3, cadence: "week", perAgent: 120, allocated: 5400, used: 5130 },
  { id: "tech", name: "Tech Support", composition: "Mixed", tenured: 3, newAgents: 2, cadence: "week", perAgent: 120, allocated: 5400, used: 2700 },
  { id: "sales", name: "Sales — Tenured", composition: "Tenured", tenured: 4, newAgents: 0, cadence: "month", perAgent: 480, allocated: 3200, used: 3260 },
  { id: "retention", name: "Retention", composition: "Mixed", tenured: 2, newAgents: 1, cadence: "month", perAgent: 600, allocated: 4000, used: 1800 },
];

export const TREND_DATA = [
  { label: "W1", value: 1200 },
  { label: "W2", value: 1800 },
  { label: "W3", value: 2100 },
  { label: "W4", value: 1950 },
  { label: "W5", value: 2400 },
];

// Per-agent overrides. team links each agent to a TEAMS_SAMPLE id (so the
// override table can show which team default a custom limit departs from,
// and so agents can be nested under their team). used = minutes consumed
// this period, for agent-level usage bars on the team drill-down.
export const AGENTS_SAMPLE = [
  { id: 1, name: "Priya Sharma", email: "priya.sharma@eci.com", team: "billing", hasCustom: false, limit: 120, used: 84 },
  { id: 2, name: "Rahul Verma", email: "rahul.verma@eci.com", team: "billing", hasCustom: true, limit: 200, used: 176 },
  { id: 3, name: "Anita Desai", email: "anita.desai@eci.com", team: "tech", hasCustom: false, limit: 120, used: 60 },
  { id: 4, name: "Vikram Patel", email: "vikram.patel@eci.com", team: "sales", hasCustom: true, limit: 600, used: 545 },
  { id: 5, name: "Meera Joshi", email: "meera.joshi@eci.com", team: "onboarding", hasCustom: false, limit: 40, used: 38 },
  { id: 6, name: "Arjun Nair", email: "arjun.nair@eci.com", team: "onboarding", hasCustom: false, limit: 40, used: 22 },
  { id: 7, name: "Kavita Singh", email: "kavita.singh@eci.com", team: "tech", hasCustom: true, limit: 80, used: 80 },
  { id: 8, name: "Deepak Gupta", email: "deepak.gupta@eci.com", team: "billing", hasCustom: false, limit: 120, used: 45 },
  { id: 9, name: "Sneha Reddy", email: "sneha.reddy@eci.com", team: "retention", hasCustom: false, limit: 600, used: 410 },
  { id: 10, name: "Karan Mehta", email: "karan.mehta@eci.com", team: "sales", hasCustom: true, limit: 720, used: 690 },
  { id: 11, name: "Pooja Iyer", email: "pooja.iyer@eci.com", team: "onboarding", hasCustom: false, limit: 40, used: 12 },
  { id: 12, name: "Sanjay Rao", email: "sanjay.rao@eci.com", team: "tech", hasCustom: false, limit: 120, used: 96 },
  { id: 13, name: "Neha Kulkarni", email: "neha.kulkarni@eci.com", team: "billing", hasCustom: true, limit: 160, used: 132 },
  { id: 14, name: "Amit Choudhary", email: "amit.choudhary@eci.com", team: "retention", hasCustom: false, limit: 600, used: 300 },
  { id: 15, name: "Divya Menon", email: "divya.menon@eci.com", team: "onboarding", hasCustom: false, limit: 40, used: 40 },
  { id: 16, name: "Rohit Saxena", email: "rohit.saxena@eci.com", team: "tech", hasCustom: true, limit: 90, used: 72 },
  { id: 17, name: "Ananya Bose", email: "ananya.bose@eci.com", team: "billing", hasCustom: false, limit: 120, used: 30 },
  { id: 18, name: "Manish Agarwal", email: "manish.agarwal@eci.com", team: "sales", hasCustom: false, limit: 480, used: 220 },
  { id: 19, name: "Shreya Pillai", email: "shreya.pillai@eci.com", team: "retention", hasCustom: true, limit: 800, used: 760 },
  { id: 20, name: "Gaurav Bhat", email: "gaurav.bhat@eci.com", team: "onboarding", hasCustom: false, limit: 40, used: 8 },
  { id: 21, name: "Ritu Malhotra", email: "ritu.malhotra@eci.com", team: "tech", hasCustom: false, limit: 120, used: 110 },
  { id: 22, name: "Varun Khanna", email: "varun.khanna@eci.com", team: "billing", hasCustom: true, limit: 140, used: 138 },
];

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---- Jun 15 V1 (per-agent weekly session caps, org-level) -----------------
// V1 deferred team-level distribution: credit is tracked at the tenant and
// limits are a per-agent WEEKLY session cap (with an optional per-day cap),
// over a Mon–Sun window. The fields below are additive — the team variants
// (A/B/C) ignore them. tenure tag (Tenured/New/Onboarding) is surfaced now;
// multi-select filtering by tag is a later version.

export const POOL_SAMPLE = {
  totalMinutes: 24000,
  consumedMinutes: 14880,
  remainingMinutes: 9120,
  periodLabel: "Jun 1 – Jun 30",
  daysToReset: 2, // days to the weekly (Mon–Sun) reset
};

export const AGENT_CAP_DEFAULTS = {
  weeklySessionCap: 15,
  perDayEnabled: true,
  perDayCap: 10,
  limitRule: "block", // "block" | "manual" | "additional"
};

export const AGENT_TAGS = ["Tenured", "New", "Onboarding"];

// Per-agent weekly session usage. sessionsUsed is this Mon–Sun window;
// override is the per-agent exception to the global overage rule.
export const AGENT_SESSION_SAMPLE = [
  { id: 5, name: "Meera Joshi", tag: "Onboarding", sessionsUsed: 15, lastActive: "2h ago", override: "default" },
  { id: 6, name: "Arjun Nair", tag: "Onboarding", sessionsUsed: 18, lastActive: "1h ago", override: "default" },
  { id: 11, name: "Pooja Iyer", tag: "Onboarding", sessionsUsed: 17, lastActive: "4h ago", override: "allow" },
  { id: 15, name: "Divya Menon", tag: "Onboarding", sessionsUsed: 14, lastActive: "Yesterday", override: "default" },
  { id: 20, name: "Gaurav Bhat", tag: "Onboarding", sessionsUsed: 16, lastActive: "3h ago", override: "default" },
  { id: 1, name: "Priya Sharma", tag: "New", sessionsUsed: 13, lastActive: "5h ago", override: "default" },
  { id: 2, name: "Rahul Verma", tag: "New", sessionsUsed: 16, lastActive: "1h ago", override: "default" },
  { id: 13, name: "Neha Kulkarni", tag: "New", sessionsUsed: 11, lastActive: "Yesterday", override: "default" },
  { id: 3, name: "Anita Desai", tag: "Tenured", sessionsUsed: 6, lastActive: "2d ago", override: "default" },
  { id: 4, name: "Vikram Patel", tag: "Tenured", sessionsUsed: 9, lastActive: "Yesterday", override: "default" },
  { id: 9, name: "Sneha Reddy", tag: "Tenured", sessionsUsed: 4, lastActive: "3d ago", override: "default" },
  { id: 10, name: "Karan Mehta", tag: "Tenured", sessionsUsed: 17, lastActive: "2h ago", override: "manual" },
  { id: 18, name: "Manish Agarwal", tag: "Tenured", sessionsUsed: 7, lastActive: "Yesterday", override: "default" },
  { id: 21, name: "Ritu Malhotra", tag: "New", sessionsUsed: 14, lastActive: "6h ago", override: "default" },
];

// Single "what happens when an agent reaches their limit" control.
// "additional" is last and reveals the additional-cap config when chosen.
export const OVERAGE_RULES = [
  { id: "block", label: "Hard stop", description: "No more practice until the weekly cap resets." },
  { id: "manual", label: "Manual override per agent", description: "You decide, per agent, who can practise past the cap." },
  { id: "additional", label: "Allow additional — capped", description: "Practice continues past the cap, up to an additional cap you set." },
];
