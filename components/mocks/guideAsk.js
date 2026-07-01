// Guide Ask — agent-side ask surface mocks.
// Sample questions, answers with citation markers, source/play records
// with verification status, and suggested starter questions.

export const GUIDE_ASK_SUGGESTED = [
  {
    id: "sq-1",
    text: "How do I handle a customer threatening to switch to a competitor?",
    topic: "Retention",
  },
  {
    id: "sq-2",
    text: "What's the escalation path for a billing dispute?",
    topic: "Billing",
  },
  {
    id: "sq-3",
    text: "Best approach for upselling during a support call?",
    topic: "Upselling",
  },
  {
    id: "sq-4",
    text: "How should I open a retention call with a high-ARPU customer?",
    topic: "Retention",
  },
  {
    id: "sq-5",
    text: "What's the refund policy for contract cancellations?",
    topic: "Policy",
  },
  {
    id: "sq-6",
    text: "How do I position the new tariff plan to price-sensitive customers?",
    topic: "Sales",
  },
];

export const GUIDE_ASK_TOPICS = [
  { id: "t-retention", label: "Retention", count: 34, icon: "shield" },
  { id: "t-billing", label: "Billing", count: 22, icon: "receipt" },
  { id: "t-upselling", label: "Upselling", count: 18, icon: "trending" },
  { id: "t-compliance", label: "Compliance", count: 15, icon: "check" },
  { id: "t-escalation", label: "Escalation", count: 12, icon: "arrow-up" },
  { id: "t-onboarding", label: "Onboarding", count: 9, icon: "user" },
];

// Source records with verification metadata.
export const GUIDE_ASK_SOURCES = [
  {
    id: "gs-1",
    title: "Empathy-first churn intervention — the saving-grace framework",
    type: "Play",
    author: { initial: "M", name: "María Ruiz" },
    verified: true,
    verifiedBy: "Neil Patel",
    generatedAt: "2026-06-15",
    expiresAt: "2026-09-15",
    interactionId: "INT-18291",
    excerpt: "Lead with acknowledgement before counter. A one-sentence empathy beat — \"Thanks for telling me upfront\" — then a single clarifying question to anchor cost vs. coverage.",
  },
  {
    id: "gs-2",
    title: "Tariff-switch objection handling matrix",
    type: "Play",
    author: { initial: "E", name: "Elena Torres" },
    verified: true,
    verifiedBy: "Prashant Kumar",
    generatedAt: "2026-06-10",
    expiresAt: "2026-09-10",
    interactionId: "INT-17844",
    excerpt: "Move from price to total value in one step. Lead with the bundle the competitor doesn't include — typically a roaming allowance, family-plan discount, or device upgrade window.",
  },
  {
    id: "gs-3",
    title: "High-ARPU retention call opener — the mirror technique",
    type: "Play",
    author: { initial: "L", name: "Liam Chen" },
    verified: false,
    verifiedBy: null,
    generatedAt: "2026-06-28",
    expiresAt: null,
    interactionId: "INT-19012",
    excerpt: "If the customer is naming a specific carrier and tariff, repeat the offer back in your own words. That gives you 4–6 seconds to scan the account for the right counter without dead air.",
  },
  {
    id: "gs-4",
    title: "Goodwill credit escalation — approval tiers & limits",
    type: "SOP",
    author: { initial: "M", name: "María Ruiz" },
    verified: true,
    verifiedBy: "Neil Patel",
    generatedAt: "2026-05-20",
    expiresAt: "2026-08-20",
    interactionId: "INT-16533",
    excerpt: "The matrix lets you offer up to two months free service without supervisor approval. Use that as the close, not the opener.",
  },
  {
    id: "gs-5",
    title: "Bundle positioning for price-anchored customers",
    type: "Play",
    author: { initial: "H", name: "Hassan Ali" },
    verified: true,
    verifiedBy: "Prashant Kumar",
    generatedAt: "2026-06-22",
    expiresAt: "2026-09-22",
    interactionId: "INT-18650",
    excerpt: "Quote the differential as monthly savings over 12 months, not headline tariff. Customers anchor to the number they hear first — make it your number.",
  },
];

// Answer with inline citation markers [1], [2], etc. referencing GUIDE_ASK_SOURCES by index.
export const GUIDE_ASK_SAMPLE_ANSWER = {
  text: `Lead with acknowledgement before jumping to counter-offers. The proven framework calls for a one-sentence empathy beat — "Thanks for telling me upfront" — followed by a single clarifying question to anchor the conversation on cost versus coverage, not just price. [1]

If the customer names a specific carrier and tariff, repeat the offer back in your own words. This buys you 4–6 seconds to scan the account for the right counter-offer without dead air. [3]

When they keep pushing on price, move from price to total value in one step. Lead with the bundle the competitor doesn't include — typically a roaming allowance, family-plan discount, or device upgrade window. Quote the differential as monthly savings over 12 months, not the headline tariff. [2] [5]

If the customer still anchors on the competing price after two counter-offers, escalate to the goodwill credit lane — the matrix lets you offer up to two months free service without supervisor approval. Use that as the close, not the opener. [4]`,
  citationIds: ["gs-1", "gs-3", "gs-2", "gs-4", "gs-5"],
};

// Conversation turns for the chat direction.
export const GUIDE_ASK_TURNS = [
  {
    id: "ga-t1",
    role: "user",
    text: "How do I handle a customer threatening to switch to a competitor?",
    timestamp: "Just now",
  },
  {
    id: "ga-t2",
    role: "guide",
    text: GUIDE_ASK_SAMPLE_ANSWER.text,
    citationIds: GUIDE_ASK_SAMPLE_ANSWER.citationIds,
    timestamp: "Just now",
  },
];

// Source type palette — extends GuideSessionPage's SOURCE_TYPE_TONE.
export const ASK_SOURCE_TYPE_TONE = {
  Play:     { bg: "#DDE1FF", fg: "#6650A5" },
  SOP:      { bg: "#FFEDD5", fg: "#9A3412" },
  FAQ:      { bg: "#E0F2FE", fg: "#0369A1" },
};

export const ASK_VERIFIED_TONE = {
  verified:   { bg: "#ECFDF5", fg: "#059669", label: "Verified" },
  unverified: { bg: "#FEF3C7", fg: "#D97706", label: "Unverified" },
};
