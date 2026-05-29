// Guides mock data — Learning Hub Guide landing.
// Six sample entries lifted from the Figma reference; the seventh entry
// is repeated verbatim in the spec table to demonstrate duplicate-title
// behaviour and lane density.

export const GUIDE_LIFECYCLE_STATES = ["active", "calibration", "draft", "archived"];

// Author monogram → pastel tile palette mapping. Reuses the Settings
// tile palette so monogram colours stay consistent across the app.
const AUTHOR_PALETTE = {
  emerald: { bg: "#ECFDF5", fg: "#10B981" },
  blue:    { bg: "#EFF6FF", fg: "#3B82F6" },
  orange:  { bg: "#FFF7ED", fg: "#F97316" },
  violet:  { bg: "#F5F3FF", fg: "#8B5CF6" },
  lavender:{ bg: "#EDE9FE", fg: "#6650A5" },
};

function author(initial, tone) {
  return { initial, ...AUTHOR_PALETTE[tone] };
}

export const GUIDES = [
  {
    id: "guide-tariff-change-1",
    title: "Handling Tariff Change Conversation",
    description:
      "Use when handling Vodafone switch threats from high-ARPU customers who have a competing offer already in hand. Built on María's retention framework — the one that closed 34 saves last quarter.",
    state: "active",
    author: author("M", "emerald"),
    artefacts: 22,
    updatedAt: "2026-04-20",
    languages: ["English", "Spanish", "French"],
  },
  {
    id: "guide-upselling-opportunities",
    title: "Upselling Opportunities",
    description:
      "Engage with customers showing interest in higher-tier plans. Highlight exclusive benefits and features that align with their usage patterns.",
    state: "active",
    author: author("M", "blue"),
    artefacts: 30,
    updatedAt: "2026-04-10",
    languages: ["English", "German", "French", "Italian", "Portuguese"],
  },
  {
    id: "guide-customer-loyalty",
    title: "Customer Loyalty Engagement",
    description:
      "Apply this strategy to enhance customer retention among users at risk of churn. Focus on personalized communication tactics that highlight value and loyalty rewards.",
    state: "active",
    author: author("L", "orange"),
    artefacts: 18,
    updatedAt: "2026-03-15",
    languages: ["English", "Spanish", "French", "Portuguese"],
  },
  {
    id: "guide-feedback-loop",
    title: "Feedback Loop Implementation",
    description:
      "Incorporate customer feedback into service enhancements. Use survey data to inform product development and customer service improvements.",
    state: "active",
    author: author("M", "orange"),
    artefacts: 15,
    updatedAt: "2026-03-05",
    languages: ["English", "Spanish", "German"],
  },
  {
    id: "guide-retention-improvement",
    title: "Retention Improvement Strategy",
    description:
      "Utilize this approach for customers who have expressed dissatisfaction. Address their concerns proactively and offer tailored solutions to improve overall satisfaction.",
    state: "active",
    author: author("M", "emerald"),
    artefacts: 25,
    updatedAt: "2026-02-28",
    languages: ["English", "Spanish"],
  },
  {
    id: "guide-tariff-change-2",
    title: "Handling Tariff Change Conversation",
    description:
      "Use when handling Vodafone switch threats from high-ARPU customers who have a competing offer already in hand. Built on María's retention framework — the one that closed 34 saves last quarter.",
    state: "active",
    author: author("H", "violet"),
    artefacts: 22,
    updatedAt: "2026-02-20",
    languages: ["English", "Spanish", "French"],
  },
  {
    id: "guide-onboarding-pulse",
    title: "Onboarding Welcome Pulse",
    description:
      "Set the tone for new-customer interactions in the first 14 days. Focus on activation milestones and first-call expectations.",
    state: "calibration",
    author: author("L", "blue"),
    artefacts: 12,
    updatedAt: "2026-05-02",
    languages: ["English", "Spanish"],
  },
  {
    id: "guide-billing-recovery",
    title: "Billing Recovery Playbook",
    description:
      "Recover stalled invoices through empathetic acknowledgement followed by a clear payment path. Stop before the second concession.",
    state: "draft",
    author: author("M", "orange"),
    artefacts: 8,
    updatedAt: "2026-05-12",
    languages: ["English"],
  },
  {
    id: "guide-network-incident-q4",
    title: "Network Incident Q4 — Retired",
    description:
      "Archived. Use only for back-reference; replaced by the unified Incident Comms playbook in March 2026.",
    state: "archived",
    author: author("H", "lavender"),
    artefacts: 6,
    updatedAt: "2025-12-18",
    languages: ["English", "German"],
  },
];

export const GUIDE_COUNTS = GUIDES.reduce(
  (acc, g) => {
    acc[g.state] = (acc[g.state] || 0) + 1;
    return acc;
  },
  { active: 0, calibration: 0, draft: 0, archived: 0 },
);

// Pad the Active lane to the screenshot's "Active (20)" count so the tab
// label matches without inventing 14 more bespoke entries. Calibration /
// Draft / Archived counts come from real seed data.
export const GUIDE_TAB_COUNTS = {
  active: 20,
  calibration: 5,
  draft: 2,
  archived: 1,
};
