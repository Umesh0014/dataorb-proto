// Mock data for the AI Recruiter — Interview Plans surface.
//
// An Interview Plan is the template the AI Interviewer runs for a role: a Job
// Profile + the assigned knowledge topics it screens a candidate's coverage
// against. Plans are the definition layer above the candidate pipeline
// (Job Profile → Interview Plan → AI screening → evidence → human decision).
// Family tints + labels are shared with the candidate mock.

export const PLAN_STATUS = {
  live:     { label: "Live",     dot: "var(--color-success)",       fg: "var(--color-text-deep)", bg: "var(--color-success-bg)" },
  draft:    { label: "Draft",    dot: "var(--color-info)",          fg: "var(--color-text-deep)", bg: "var(--color-info-bg)" },
  archived: { label: "Archived", dot: "var(--color-text-tertiary)", fg: "var(--color-text-deep)", bg: "var(--pill-bg)" },
};

export const INTERVIEW_PLANS = [
  {
    id: "ip-support-t1",
    name: "Tier 1 Support — bridge knowledge",
    jobProfile: "Tier 1 Support Advisor",
    family: "support",
    mode: "Adaptive interview",
    assisted: false,
    status: "live",
    topics: ["Identity verification", "Billing dispute path", "Plan & tariff changes", "Connectivity triage", "Escalation thresholds", "Disclosure & consent"],
    topicsTotal: 18,
    screened: 25,
    lastRun: "2026-06-11",
  },
  {
    id: "ip-sales-inside",
    name: "Inside Sales — objection handling",
    jobProfile: "Inside Sales Rep",
    family: "sales",
    mode: "Generated set",
    assisted: true,
    status: "live",
    topics: ["Discovery questions", "Pricing & packaging", "Objection handling", "Close & next steps"],
    topicsTotal: 14,
    screened: 18,
    lastRun: "2026-06-10",
  },
  {
    id: "ip-retention-save",
    name: "Retention — save-desk readiness",
    jobProfile: "Retention Specialist",
    family: "retention",
    mode: "Adaptive interview",
    assisted: false,
    status: "live",
    topics: ["Churn signals", "Retention offer rules", "Compliance limits", "De-escalation"],
    topicsTotal: 12,
    screened: 12,
    lastRun: "2026-06-09",
  },
  {
    id: "ip-onboarding-induction",
    name: "Onboarding — induction check",
    jobProfile: "Onboarding Cohort (any LOB)",
    family: "onboarding",
    mode: "Generated set",
    assisted: true,
    status: "live",
    topics: ["Core systems", "Policy basics", "Tooling walkthrough", "Security & access"],
    topicsTotal: 14,
    screened: 41,
    lastRun: "2026-06-11",
  },
  {
    id: "ip-compliance-kyc",
    name: "Compliance — KYC & disclosure",
    jobProfile: "Compliance Associate",
    family: "compliance",
    mode: "Generated set",
    assisted: false,
    status: "draft",
    topics: ["KYC steps", "Disclosure rules", "Recording rules"],
    topicsTotal: 11,
    screened: 0,
    lastRun: null,
  },
  {
    id: "ip-field-warranty",
    name: "Field Tech — warranty process",
    jobProfile: "Field Service Technician",
    family: "field",
    mode: "Adaptive interview",
    assisted: false,
    status: "draft",
    topics: ["Diagnosis flow", "Parts & logistics", "Warranty terms"],
    topicsTotal: 16,
    screened: 0,
    lastRun: null,
  },
  {
    id: "ip-premium-care",
    name: "Premium Care — care-to-upsell",
    jobProfile: "Premium Care Advisor",
    family: "sales",
    mode: "Generated set",
    assisted: true,
    status: "archived",
    topics: ["Needs discovery", "Offer fit", "Consent capture"],
    topicsTotal: 12,
    screened: 9,
    lastRun: "2026-05-28",
  },
];

// planCounts — live / draft / archived tallies for the tab strip.
export function planCounts(plans) {
  return plans.reduce(
    (acc, p) => { acc[p.status] += 1; return acc; },
    { live: 0, draft: 0, archived: 0 },
  );
}
