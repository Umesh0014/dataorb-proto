// Guide artefacts mock — Create Guide Stage 1 (Knowledge Base) source
// lists. Two artefact types: playbooks + brand documents. Each row
// carries title, author initial (drives the deterministic avatar tone),
// updated date, plus a type-specific meta:
//   playbook        → languages[] (first shown as pill, rest as +N)
//   brand-document  → docType ("SOP" | "FAQ" | "Article")
//
// Counts are sized to match the spec sample (Available Playbooks 15 +
// Available Documents 20). Author initials cluster across a small pool
// so the deterministic avatar tone reads consistently across rows.

// Reuse the Settings tile palette so monogram colours stay consistent
// app-wide. Maps author initial → pastel tone via a stable hash.
const AUTHOR_PALETTE = [
  { bg: "#ECFDF5", fg: "#10B981" },
  { bg: "#EFF6FF", fg: "#3B82F6" },
  { bg: "#FFF7ED", fg: "#F97316" },
  { bg: "#F5F3FF", fg: "#8B5CF6" },
  { bg: "#EDE9FE", fg: "#6650A5" },
  { bg: "#FFF1F2", fg: "#F43F5E" },
];
export function authorTone(initial) {
  if (!initial) return AUTHOR_PALETTE[0];
  const i = initial.toUpperCase().charCodeAt(0) % AUTHOR_PALETTE.length;
  return AUTHOR_PALETTE[i];
}

export const AVAILABLE_PLAYBOOKS = [
  { id: "pb-1",  title: "Data analytics for insights — driving decisions with actionable data",       author: "E", updatedAt: "2026-04-25", languages: ["English", "Spanish", "French"] },
  { id: "pb-2",  title: "AI-driven insights — leveraging technology for predictive analytics",        author: "E", updatedAt: "2026-04-24", languages: ["English", "German", "French", "Italian", "Portuguese", "Dutch"] },
  { id: "pb-3",  title: "Customer feedback loops — using input to enhance services",                  author: "E", updatedAt: "2026-04-22", languages: ["English"] },
  { id: "pb-4",  title: "Personalized marketing campaigns — targeting customers based on behavior",   author: "E", updatedAt: "2026-04-12", languages: ["Spanish", "English"] },
  { id: "pb-5",  title: "Cross-selling strategies — maximizing revenue through related offerings",    author: "E", updatedAt: "2026-04-12", languages: ["English (UK)", "French", "German"] },
  { id: "pb-6",  title: "Dynamic pricing tools — adjusting rates based on market demand",             author: "E", updatedAt: "2026-04-25", languages: ["English", "Spanish", "Portuguese"] },
  { id: "pb-7",  title: "Integrated customer support — unifying channels for better service",         author: "E", updatedAt: "2026-04-25", languages: ["English", "Spanish", "French"] },
  { id: "pb-8",  title: "Loyalty program optimisation — keeping retention above 92%",                 author: "M", updatedAt: "2026-04-18", languages: ["English", "Italian"] },
  { id: "pb-9",  title: "Outbound sales discipline — turning warm leads into wins",                   author: "M", updatedAt: "2026-04-15", languages: ["English (UK)"] },
  { id: "pb-10", title: "Empathy-first churn intervention — the saving-grace framework",              author: "L", updatedAt: "2026-04-09", languages: ["English", "Spanish"] },
  { id: "pb-11", title: "First-call resolution playbook — diagnose, decide, deliver",                 author: "L", updatedAt: "2026-04-08", languages: ["English"] },
  { id: "pb-12", title: "Compliance-grade escalation — what scripts to keep, what to drop",           author: "K", updatedAt: "2026-04-05", languages: ["English", "German"] },
  { id: "pb-13", title: "Win-back outreach for lapsed accounts — six-week cadence",                   author: "H", updatedAt: "2026-04-03", languages: ["English", "French"] },
  { id: "pb-14", title: "Outbound prospect qualification — BANT in 90 seconds",                       author: "H", updatedAt: "2026-03-30", languages: ["English"] },
  { id: "pb-15", title: "VOC handling — closing the loop with high-ARPU detractors",                  author: "J", updatedAt: "2026-03-28", languages: ["English", "Spanish", "French"] },
];

export const AVAILABLE_BRAND_DOCUMENTS = [
  { id: "bd-1",  title: "Technology aid in customer retention?",                  author: "J", updatedAt: "2026-04-27", docType: "SOP" },
  { id: "bd-2",  title: "How to handle customer complaints effectively?",         author: "F", updatedAt: "2026-04-25", docType: "FAQ" },
  { id: "bd-3",  title: "How to effectively segment your customer base.",         author: "L", updatedAt: "2026-03-13", docType: "SOP" },
  { id: "bd-4",  title: "Engaging customers effectively",                         author: "K", updatedAt: "2026-03-10", docType: "Article" },
  { id: "bd-5",  title: "Brand voice — written tone & rejected phrases",          author: "K", updatedAt: "2026-03-08", docType: "Article" },
  { id: "bd-6",  title: "What are the key metrics for measuring retention?",      author: "J", updatedAt: "2026-05-04", docType: "FAQ" },
  { id: "bd-7",  title: "Refund-policy escalation matrix — Tier 1/2/3 owners",    author: "M", updatedAt: "2026-05-02", docType: "SOP" },
  { id: "bd-8",  title: "How do we describe our renewal pricing on calls?",       author: "M", updatedAt: "2026-04-30", docType: "FAQ" },
  { id: "bd-9",  title: "Why empathy-first openings outperform script-first",     author: "L", updatedAt: "2026-04-28", docType: "Article" },
  { id: "bd-10", title: "GDPR data-subject request — agent walkthrough",          author: "H", updatedAt: "2026-04-25", docType: "SOP" },
  { id: "bd-11", title: "How to position the new tariff to high-ARPU customers",  author: "H", updatedAt: "2026-04-22", docType: "FAQ" },
  { id: "bd-12", title: "Customer journey insights — Q1 2026 readout",            author: "E", updatedAt: "2026-04-20", docType: "Article" },
  { id: "bd-13", title: "Inbound triage rubric — which questions to forward",     author: "E", updatedAt: "2026-04-18", docType: "SOP" },
  { id: "bd-14", title: "What's allowed in a goodwill credit, what isn't?",       author: "F", updatedAt: "2026-04-15", docType: "FAQ" },
  { id: "bd-15", title: "Empathy phrasing library — German, French, Spanish",     author: "F", updatedAt: "2026-04-12", docType: "Article" },
  { id: "bd-16", title: "Tariff change announcements — agent talking points",     author: "J", updatedAt: "2026-04-10", docType: "SOP" },
  { id: "bd-17", title: "When do we escalate to engineering vs. ops?",            author: "L", updatedAt: "2026-04-07", docType: "FAQ" },
  { id: "bd-18", title: "Onboarding the new agent in week one — the syllabus",    author: "K", updatedAt: "2026-04-05", docType: "Article" },
  { id: "bd-19", title: "Compliance script — billing-dispute checklist",          author: "M", updatedAt: "2026-04-02", docType: "SOP" },
  { id: "bd-20", title: "How do we handle out-of-policy concession requests?",    author: "H", updatedAt: "2026-03-30", docType: "FAQ" },
];

// EMPTY_GUIDE_DRAFT — wizard state shape. Owned by the wizard host (the
// app/page.jsx Learning branch). The wizard itself is controlled.
export const EMPTY_GUIDE_DRAFT = {
  // Stage 1 — Knowledge Base
  playbookIds: [],
  documentIds: [],
  // Stage 2 — Define Guide
  name: "",
  language: "",
  description: "",
  learnersOutcome: "",
  subjectAnchors: "",
  targetLearnerProfile: "",
  domain: "",
  maxSessionLength: 5,
};

export const GUIDE_LANGUAGE_OPTIONS = [
  "English (UK)",
  "English (US)",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Dutch",
];

export const GUIDE_DOMAIN_OPTIONS = [
  "Process",
  "Product",
  "Compliance",
  "Sales",
  "Retention",
  "Support",
  "Technical",
];

export const GUIDE_SESSION_LENGTH_OPTIONS = [
  "5 Mins",
  "10 Mins",
  "15 Mins",
  "20 Mins",
];

export const GUIDE_FIELD_MAX = {
  name: 60,
  description: 500,
  learnersOutcome: 500,
  subjectAnchors: 500,
  targetLearnerProfile: 500,
};
