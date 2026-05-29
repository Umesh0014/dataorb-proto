// Guide AI Tutor session mocks — sample turns, sources, and meta used
// by GuideSessionPage. Two transcript variants ship: PHASE1 (greeting
// only) and PHASE2_PLUS (greeting + multi-turn back-and-forth). The
// session page progresses from PHASE1 → PHASE2_PLUS on a short timer
// to demonstrate the state machine. Real STT/TTS wiring is out of scope.

export const GUIDE_SESSION_META = {
  title: "Vodafone Retention",
  interactionId: "18534",
  initials: "AA",
  totalSeconds: 402, // 06:42
};

// Each turn:
//   id        unique
//   speaker   "GUIDE" | "ADVISOR"
//   timestamp "0:08" format
//   body      string (paragraphs joined with \n\n)
//   retrieved number (only on GUIDE turns that cite artifacts)

export const GUIDE_TURNS_PHASE1 = [
  {
    id: "t-1",
    speaker: "GUIDE",
    timestamp: "0:08",
    body: "Hi Aanya — ready when you are. Ask me anything about handling Vodafone-switch threats from high-ARPU customers and I'll pull from María's retention framework plus the most recent playbooks.",
  },
];

export const GUIDE_TURNS_PHASE2 = [
  ...GUIDE_TURNS_PHASE1,
  {
    id: "t-2",
    speaker: "ADVISOR",
    timestamp: "0:18",
    body: "What's the cleanest way to open when the customer leads with the competing offer?",
  },
  {
    id: "t-3",
    speaker: "GUIDE",
    timestamp: "1:25",
    body: "Lead with acknowledgement before counter. The framework calls for a one-sentence empathy beat — \"Thanks for telling me upfront\" — then a single clarifying question to anchor cost vs. coverage. Skip the price match until you've heard what's actually missing.\n\nIf the customer is naming a specific carrier and tariff, repeat the offer back in your own words. That gives you 4–6 seconds to scan the account for the right counter without dead air.",
    retrieved: 3,
  },
  {
    id: "t-4",
    speaker: "ADVISOR",
    timestamp: "1:34",
    body: "And if they keep pushing on price?",
  },
  {
    id: "t-5",
    speaker: "GUIDE",
    timestamp: "1:57",
    body: "Move from price to total value in one step. Lead with the bundle the competitor doesn't include — typically a roaming allowance, family-plan discount, or device upgrade window. Quote the differential as monthly savings over 12 months, not headline tariff.\n\nIf the customer still anchors on the competing price after two counters, escalate to the goodwill credit lane — the matrix lets you offer up to two months free service without supervisor approval. Use that as the close, not the opener.",
    retrieved: 4,
  },
];

export const GUIDE_SOURCES = [
  {
    id: "s-1",
    title: "Bill shock to better plan — turning a billing complaint into a plan optimization",
    author: "E",
    date: "April 20, 2026",
    type: "Playbook",
  },
  {
    id: "s-2",
    title: "Process for retaining customers effectively.",
    author: "M",
    date: "April 16, 2026",
    type: "SOP",
  },
  {
    id: "s-3",
    title: "What are some effective customer retention strategies?",
    author: "L",
    date: "April 12, 2026",
    type: "FAQ",
  },
  {
    id: "s-4",
    title: "Customer feedback loops — using input to enhance services",
    author: "E",
    date: "August 22, 2025",
    type: "Playbook",
  },
  {
    id: "s-5",
    title: "Cross-selling strategies — maximizing revenue through related offerings",
    author: "E",
    date: "July 15, 2025",
    type: "Playbook",
  },
  {
    id: "s-6",
    title: "Empathy-first churn intervention — the saving-grace framework",
    author: "L",
    date: "April 9, 2026",
    type: "Playbook",
  },
  {
    id: "s-7",
    title: "Refund-policy escalation matrix — Tier 1/2/3 owners",
    author: "M",
    date: "May 2, 2026",
    type: "SOP",
  },
  {
    id: "s-8",
    title: "How to position the new tariff to high-ARPU customers",
    author: "H",
    date: "April 22, 2026",
    type: "FAQ",
  },
  {
    id: "s-9",
    title: "Brand voice — written tone & rejected phrases",
    author: "K",
    date: "March 8, 2026",
    type: "Playbook",
  },
  {
    id: "s-10",
    title: "Loyalty program optimisation — keeping retention above 92%",
    author: "M",
    date: "April 18, 2026",
    type: "Playbook",
  },
  {
    id: "s-11",
    title: "When do we escalate to engineering vs. ops?",
    author: "L",
    date: "April 7, 2026",
    type: "FAQ",
  },
  {
    id: "s-12",
    title: "Compliance script — billing-dispute checklist",
    author: "M",
    date: "April 2, 2026",
    type: "SOP",
  },
];

// Doc-type pill palette — peach across all three (matches the Stage 1
// drawer's DocTypePill so the visual language stays consistent).
export const SOURCE_TYPE_TONE = {
  Playbook: { bg: "#FFEDD5", fg: "#9A3412" },
  SOP:      { bg: "#FFEDD5", fg: "#9A3412" },
  FAQ:      { bg: "#FFEDD5", fg: "#9A3412" },
};

export function formatTimer(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
