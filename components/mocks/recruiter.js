// Mock data for the AI Recruiter (AI Interviewer) landing surface.
//
// Entity model (from the ticket brief): Job Profile → Interview Plan →
// Interview runs (candidate sessions) → AI evidence report → human hire
// decision. The landing lists Interview Plans (the "survey/mentor"
// template model). Compliance spine: coverage — never mastery; AI surfaces
// evidence, the human owns the decision; sessions recorded for compliance.
//
// Numbers carry their unit at the callsite (coverage % is paired with the
// interview sample it's based on — "18 of 25" — so no figure is unexplained).

// Job family → tint token pair. Tints come straight from the Settings
// pastel tile palette in globals.css (no new tokens). Colour marks a true
// difference in kind (job family), not decoration.
export const FAMILY_TINTS = {
  support:    { bg: "var(--tile-blue-bg)",    fg: "var(--tile-blue-fg)" },
  sales:      { bg: "var(--tile-emerald-bg)", fg: "var(--tile-emerald-fg)" },
  retention:  { bg: "var(--tile-violet-bg)",  fg: "var(--tile-violet-fg)" },
  onboarding: { bg: "var(--tile-orange-bg)",  fg: "var(--tile-orange-fg)" },
  compliance: { bg: "var(--tile-cyan-bg)",    fg: "var(--tile-cyan-fg)" },
  field:      { bg: "var(--tile-rose-bg)",    fg: "var(--tile-rose-fg)" },
};

// Job family → lucide icon name (resolved to a component in the views).
export const FAMILY_ICONS = {
  support:    "Headset",
  sales:      "TrendingUp",
  retention:  "ShieldCheck",
  onboarding: "Rocket",
  compliance: "Scale",
  field:      "Wrench",
};

export const FAMILY_LABELS = {
  support:    "Technical Support",
  sales:      "Sales",
  retention:  "Retention",
  onboarding: "Onboarding",
  compliance: "Compliance",
  field:      "Field Ops",
};

// status: "live" (collecting interviews) · "draft" (not published) ·
// "archived". mode: how questions are chosen. maintainedBy: who keeps the
// knowledge current. coverage.pct is knowledge coverage; coverage.of /
// coverage.from is the interview sample it summarises.
export const INTERVIEW_PLANS = [
  {
    id: "ip-bridge-support",
    name: "Bridge-knowledge — Tier 1 Support",
    jobProfile: "Tier 1 Support Advisor",
    family: "support",
    domain: "Billing · Account · Connectivity",
    mode: "Adaptive interview",
    assisted: false,
    status: "live",
    interviewsRun: 25,
    candidatesInvited: 31,
    coverage: { pct: 72, covered: 13, total: 18, from: 25 }, // 13 of 18 topics, across 25 interviews
    lastRun: "2026-06-11",
    maintainedBy: "ai",
    createdBy: { name: "Umesh Pisal", initial: "U" },
  },
  {
    id: "ip-objection-sales",
    name: "Objection handling — Inside Sales",
    jobProfile: "Inside Sales Rep",
    family: "sales",
    domain: "Discovery · Pricing · Close",
    mode: "Generated set",
    assisted: true,
    status: "live",
    interviewsRun: 18,
    candidatesInvited: 22,
    coverage: { pct: 64, covered: 9, total: 14, from: 18 },
    lastRun: "2026-06-10",
    maintainedBy: "self",
    createdBy: { name: "Carlos Mendes", initial: "C" },
  },
  {
    id: "ip-retention-saves",
    name: "Save-desk readiness — Retention",
    jobProfile: "Retention Specialist",
    family: "retention",
    domain: "Churn signals · Offers · Compliance",
    mode: "Adaptive interview",
    assisted: false,
    status: "live",
    interviewsRun: 12,
    candidatesInvited: 20,
    coverage: { pct: 58, covered: 7, total: 12, from: 12 },
    lastRun: "2026-06-09",
    maintainedBy: "ai",
    createdBy: { name: "Ayushi Rana", initial: "A" },
  },
  {
    id: "ip-onboarding-induction",
    name: "Induction check — New-hire Onboarding",
    jobProfile: "Onboarding Cohort (any LOB)",
    family: "onboarding",
    domain: "Systems · Policy · Tooling",
    mode: "Generated set",
    assisted: true,
    status: "live",
    interviewsRun: 41,
    candidatesInvited: 45,
    coverage: { pct: 86, covered: 12, total: 14, from: 41 },
    lastRun: "2026-06-11",
    maintainedBy: "ai",
    createdBy: { name: "Saurabh Nehe", initial: "S" },
  },
  {
    id: "ip-field-warranty",
    name: "Warranty process — Field Technician",
    jobProfile: "Field Service Technician",
    family: "field",
    domain: "Diagnosis · Parts · Logistics",
    mode: "Adaptive interview",
    assisted: false,
    status: "draft",
    interviewsRun: 0,
    candidatesInvited: 0,
    coverage: { pct: 0, covered: 0, total: 16, from: 0 },
    lastRun: null,
    maintainedBy: "self",
    createdBy: { name: "Umesh Pisal", initial: "U" },
  },
  {
    id: "ip-compliance-kyc",
    name: "KYC & disclosure — Compliance screen",
    jobProfile: "Compliance Associate",
    family: "compliance",
    domain: "KYC · Disclosure · Recording rules",
    mode: "Generated set",
    assisted: false,
    status: "draft",
    interviewsRun: 0,
    candidatesInvited: 0,
    coverage: { pct: 0, covered: 0, total: 11, from: 0 },
    lastRun: null,
    maintainedBy: "self",
    createdBy: { name: "Neil Desai", initial: "N" },
  },
  {
    id: "ip-tribal-supply",
    name: "Tribal-knowledge map — Supply Chain",
    jobProfile: "Supply Partner Liaison",
    family: "field",
    domain: "Component · Supplier · Escalation",
    mode: "Adaptive interview",
    assisted: false,
    status: "archived",
    interviewsRun: 6,
    candidatesInvited: 6,
    coverage: { pct: 49, covered: 5, total: 13, from: 6 },
    lastRun: "2026-05-20",
    maintainedBy: "self",
    createdBy: { name: "Sandeep Roy", initial: "S" },
  },
  {
    id: "ip-upsell-care",
    name: "Care-to-upsell — Premium Desk",
    jobProfile: "Premium Care Advisor",
    family: "sales",
    domain: "Needs · Offer fit · Consent",
    mode: "Generated set",
    assisted: true,
    status: "archived",
    interviewsRun: 9,
    candidatesInvited: 14,
    coverage: { pct: 67, covered: 8, total: 12, from: 9 },
    lastRun: "2026-05-28",
    maintainedBy: "ai",
    createdBy: { name: "Carlos Mendes", initial: "C" },
  },
];

export const STATUS_META = {
  live:     { label: "Live", tone: "success" },
  draft:    { label: "Draft", tone: "info" },
  archived: { label: "Archived", tone: "neutral" },
};

// tabCounts — live / draft / archived tallies for the tab strip.
export function planCounts(plans) {
  return plans.reduce(
    (acc, p) => { acc[p.status] += 1; return acc; },
    { live: 0, draft: 0, archived: 0 },
  );
}

// Aggregate coverage rail (variant C). Each topic carries the interviews
// that touched it AND the sample it's drawn from, so the figure is never
// unexplained ("covered in 22 of 25 interviews"). Across live plans only.
export const TOPIC_COVERAGE = [
  { topic: "Identity verification",   covered: 24, from: 25 },
  { topic: "Billing dispute path",    covered: 21, from: 25 },
  { topic: "Plan & tariff changes",   covered: 18, from: 25 },
  { topic: "Retention offer rules",   covered: 12, from: 25 },
  { topic: "Disclosure & consent",    covered: 9,  from: 25 },
  { topic: "Escalation thresholds",   covered: 6,  from: 25 },
];

// Headline figures for the aggregate rail — each rendered with its unit
// and, where it's a coverage figure, its sample basis.
export function aggregateStats(plans) {
  const live = plans.filter((p) => p.status === "live");
  const interviews = live.reduce((n, p) => n + p.interviewsRun, 0);
  const invited = live.reduce((n, p) => n + p.candidatesInvited, 0);
  return {
    livePlans: live.length,
    interviews,
    invited,
    // Interviews logged in the trailing 7 days (demo-fixed).
    thisWeek: 14,
  };
}
