// guidedDrill — mock data for the assisted "safety wheel" Drill session
// (DrillGuidedSessionPage). The agent practices a retention/billing call
// against a simulated customer while a second AI checks off the steps of
// the attached Guided Workflow in real time and flags skipped mandatory
// steps. Real STT/TTS + live step-detection is out of scope; the page
// drives the same shapes off a short demo timer.
//
// The workflow models the brief's branching call path:
//   who's on the line → validation → bill-higher-than-expected →
//   IPC annual tariff → churn signal? → best-practice offer →
//   agreement recorded → close.

export const GUIDED_DRILL_META = {
  workflowTitle: "Bill-shock retention — IPC tariff",
  scenarioTitle: "Marcus Bell — bill higher than expected",
  customerName: "Marcus Bell",
  scenarioBody:
    "Marcus is calling because his bill rose from £29.90 to £38.50 with no notice. He's a six-year customer and is openly weighing other providers — find what changed and put it right.",
  interactionId: "20471",
  initials: "MB",
  language: "English (UK)",
  totalSeconds: 372, // 06:12
  // Team-lead config (settings in the brief): safety-on sessions allowed
  // per agent per role play, and how many have been used.
  sessionsAllowed: 3,
  sessionsUsed: 1,
};

// Coarse phase strip above the step list (Assisted-mode variant). State:
// "done" | "current" | "pending".
export const GUIDED_DRILL_PHASES = [
  { id: "open", label: "Open", state: "done" },
  { id: "verify", label: "Verify", state: "done" },
  { id: "diagnose", label: "Diagnose", state: "current" },
  { id: "resolve", label: "Resolve", state: "pending" },
  { id: "close", label: "Close", state: "pending" },
];

// Sub-checks ("dos") the listener ticks off within the active step, plus
// the branch paths it's listening for next. Used by the Assisted variant.
export const GUIDED_DRILL_ACTIVE_DOS = [
  { id: "do-1", label: "Pull up this month's charges and read the delta back", hit: true },
  { id: "do-2", label: "Compare line by line against last month", hit: true },
  { id: "do-3", label: "Name the exact line that changed", hit: false },
];

export const GUIDED_DRILL_BRANCHES = [
  { id: "br-1", label: "Charge is the IPC tariff → explain the adjustment & amount" },
  { id: "br-2", label: "An add-on slipped in → itemise it and offer to remove" },
];

// Each step of the guided workflow.
//   id            unique
//   label         short imperative — what the agent should do
//   detail        the evidence the listener looks for
//   mandatory     true = required step; a skipped mandatory step is flagged
//   phase         which of the 5 universal stages this step belongs to
//   branch        optional label when the step belongs to a branch
//   state         "done" | "active" | "pending" | "skipped"
//   at            transcript timestamp the step was satisfied (done only)
//   script        suggested phrasing for this step (the "Script" asset)
//   knowledgeCard linked knowledge snippet (the "Knowledge card" asset)
export const GUIDED_DRILL_STEPS = [
  {
    id: "greet",
    label: "Greeting & brand identification",
    detail: "Agent opens with name + brand and a reason-for-call check.",
    mandatory: true,
    phase: "open",
    state: "done",
    at: "0:04",
    script: "Hi, you’re through to [Brand], my name’s [Your Name]. I can see you’re calling about [reason] — happy to help with that.",
    knowledgeCard: null,
  },
  {
    id: "verify",
    label: "Verify identity (two data points)",
    detail: "Confirm two account identifiers before discussing the bill.",
    mandatory: true,
    phase: "verify",
    state: "skipped",
    at: null,
    script: "Before we look into anything, can I just confirm the postcode and date of birth on the account?",
    knowledgeCard: { title: "Identity verification policy", body: "Two-factor identity check is mandatory before disclosing any account information. Acceptable pairs: postcode + DOB, account number + security word, or email + last 4 of payment card." },
  },
  {
    id: "acknowledge",
    label: "Acknowledge the concern",
    detail: "A one-line empathy beat before moving to diagnosis.",
    mandatory: false,
    phase: "discover",
    state: "done",
    at: "0:22",
    script: "I completely understand — seeing a higher number you weren’t expecting is frustrating. Let’s get to the bottom of it together.",
    knowledgeCard: null,
  },
  {
    id: "diagnose",
    label: "Diagnose the charge",
    detail: "Locate the line-item delta on this month's bill.",
    mandatory: true,
    phase: "discover",
    state: "active",
    at: null,
    script: "Let me pull up this month’s charges and compare them line by line with last month so we can see precisely what moved.",
    knowledgeCard: { title: "Bill comparison tool", body: "Use the Compare Bills screen (CRM → Billing → Compare). Select the two billing periods. The delta column highlights any line that changed by more than £0.50. Export as PDF if the customer asks for a copy." },
  },
  {
    id: "explain-ipc",
    label: "Explain the IPC annual tariff change",
    detail: "Name the adjustment and the amount in plain language.",
    mandatory: true,
    phase: "act",
    branch: "Bill higher than expected",
    state: "pending",
    at: null,
    script: "This is the annual IPC adjustment that applies across all plans each April — on your tariff that’s an extra £2.10 a month, and I can show you how it’s calculated.",
    knowledgeCard: { title: "IPC annual tariff adjustment", body: "The In-Price Change (IPC) is a contractual annual adjustment tied to the Consumer Price Index. It applies every April. Current rate: CPI + 3.9%. The adjustment applies to the line rental and any add-on with an IPC clause. Customers on fixed-price contracts are exempt." },
  },
  {
    id: "churn-signal",
    label: "Check for a churn signal",
    detail: "Listen for competitor mention or switch intent.",
    mandatory: false,
    phase: "act",
    branch: "Bill higher than expected",
    state: "pending",
    at: null,
    script: "I hear you — and I’d hate for that to be the reason you consider moving. Can I take a look at what we can do to make this work for you?",
    knowledgeCard: { title: "Churn signal keywords", body: "Key phrases that indicate switch intent: “looking at other providers”, “thinking of leaving”, “cancel”, “contract end date”, “switching”, competitor names (Sky, BT, Virgin, Vodafone). Flag in CRM under Retention → Churn Risk." },
  },
  {
    id: "offer",
    label: "Present the best-practice retention offer",
    detail: "Offer from the approved matrix; lead with value, not price.",
    mandatory: true,
    phase: "act",
    state: "pending",
    at: null,
    script: "Because you’ve been with us six years, I can hold your effective rate with a loyalty credit — that keeps you below the price you mentioned without changing your plan.",
    knowledgeCard: { title: "Retention offer matrix", body: "Tenure 5+ years: eligible for Loyalty Credit (up to £5/mo for 12 months). Tenure 2–4 years: eligible for Plan Downgrade without penalty. Always lead with value (“what you get”), not discount (“how much less”). Log the offer in CRM → Retention → Offer Made." },
  },
  {
    id: "agreement",
    label: "Confirm agreement & record it",
    detail: "Read back the agreed terms and log them on the account.",
    mandatory: true,
    phase: "close",
    state: "pending",
    at: null,
    script: "So just to confirm — I’ve applied the £4 loyalty credit to your account, which brings your monthly bill to £34.50 for the next 12 months. Does that sound right?",
    knowledgeCard: null,
  },
  {
    id: "close",
    label: "Recap & close",
    detail: "Summarise next steps and confirm nothing else is outstanding.",
    mandatory: true,
    phase: "close",
    state: "pending",
    at: null,
    script: "You’ll see the credit on your next bill. Is there anything else I can help with today? Thank you for staying with us, Marcus.",
    knowledgeCard: null,
  },
];

// Suggested phrasing the agent can pull for the active step. Keyed by
// step id so each step can carry its own hint; the active step's hint is
// what "Suggest phrasing" reveals.
export const GUIDED_DRILL_HINTS = {
  diagnose:
    "Try: “I can see exactly what changed this month — let me walk you through the two lines on your bill so it's clear where the difference is coming from.”",
  "explain-ipc":
    "Try: “This is the annual IPC adjustment that applies across all plans each April — on your tariff that's an extra £2.10 a month, and I can show you how it's calculated.”",
  offer:
    "Try: “Because you've been with us six years, I can hold your effective rate with a loyalty credit — that keeps you below the price you mentioned without changing your plan.”",
};

// Live conversation. speaker "CUSTOMER" (the simulated persona) | "AGENT"
// (the human practising). stepRef links an agent turn to the workflow step
// it satisfied, so the guidance surfaces can highlight the moment.
export const GUIDED_DRILL_TURNS = [
  {
    id: "d-1",
    speaker: "AGENT",
    timestamp: "0:04",
    body: "Hi, you're through to Acme, my name's Sam. I can see you're calling about your latest bill — happy to help with that.",
    stepRef: "greet",
  },
  {
    id: "d-2",
    speaker: "CUSTOMER",
    timestamp: "0:11",
    body: "Yes — my bill's gone up and nobody told me. It was £29.90 and now it's £38.50. I didn't change anything.",
  },
  {
    id: "d-3",
    speaker: "AGENT",
    timestamp: "0:22",
    body: "I completely understand the frustration of seeing a higher number you weren't expecting — let's get to the bottom of it together.",
    stepRef: "acknowledge",
  },
  {
    id: "d-4",
    speaker: "CUSTOMER",
    timestamp: "0:31",
    body: "Please do. I've been with you six years and this is the kind of thing that makes me look at other providers.",
  },
  {
    id: "d-5",
    speaker: "AGENT",
    timestamp: "0:41",
    body: "Let me pull up this month's charges and compare them line by line with last month so we can see precisely what moved.",
    stepRef: "diagnose",
  },
];

// Post-session eval. Produced for visibility but EXCLUDED from the
// readiness profile because the safety wheel was on (new "assisted mode"
// exclusion, mirroring calibration mode). Every figure carries a label.
export const GUIDED_DRILL_EVAL = {
  overallScore: 81, // percent — shown but excluded
  stepsDone: 6,
  stepsTotal: 9,
  mandatorySkipped: 1,
  hintsReviewed: 2,
  branchExecuted: "Bill higher than expected → IPC tariff → retention offer",
  excludedFrom: "Readiness profile",
  exclusionReason: "Assisted mode (safety wheel on)",
};

export function formatDrillTimer(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
