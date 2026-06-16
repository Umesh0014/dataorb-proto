// guidedDrill — mock data for the assisted "safety wheel" Drill session
// (DrillGuidedSessionPage). The agent practises a retention/billing call
// against a simulated customer while a second AI checks off the steps of
// the attached Guided Workflow in real time and flags skipped mandatory
// steps. Real STT/TTS + live step-detection is out of scope; the page
// drives the same shapes off a short demo timer.
//
// Jun 16 deep-dive model (progressive disclosure): every step belongs to
// one of five universal conversation stages and carries a type
// (compliance / action / decision), an optional Script (phrasing the
// agent can pull) and, on complex steps, a specific Knowledge card. The
// agent view surfaces a moving previous / current / next window over these
// steps — the transcript is deliberately not shown.

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

// The five universal conversation stages (Jun 16): Open → Verify →
// Discover → Act → Close. State is derived in the page from where the
// active step sits, so the spine never drifts from the step list.
export const GUIDED_DRILL_STAGES = [
  { id: "open", label: "Open" },
  { id: "verify", label: "Verify" },
  { id: "discover", label: "Discover" },
  { id: "act", label: "Act" },
  { id: "close", label: "Close" },
];

// Each step of the guided workflow.
//   id          unique
//   label       short imperative — what the agent should do
//   detail      the evidence the listener looks for
//   stage       which of the five stages it belongs to
//   type        "compliance" | "action" | "decision"
//   mandatory   true = required; a skipped mandatory step is flagged
//   state       "done" | "active" | "pending" | "skipped"
//   at          transcript timestamp the step was satisfied (done only)
//   script      optional phrasing the agent can pull ("Suggest phrasing")
//   knowledge   optional specific linked card { title, body } for complex steps
//   subSteps    optional conditional "if" checks under the step [{ id, label, hit }]
export const GUIDED_DRILL_STEPS = [
  {
    id: "greet",
    label: "Greeting & brand identification",
    detail: "Open with name + brand and a reason-for-call check.",
    stage: "open",
    type: "action",
    mandatory: true,
    state: "done",
    at: "0:04",
    script:
      "Try: “Hi, you're through to Acme, my name's Sam — I can see you're calling about your latest bill, happy to help with that.”",
  },
  {
    id: "verify",
    label: "Verify identity (two data points)",
    detail: "Confirm two account identifiers before discussing the bill.",
    stage: "verify",
    type: "compliance",
    mandatory: true,
    state: "skipped",
    at: null,
    script:
      "Try: “Before I pull up the account, can I just confirm two details with you — your date of birth and the first line of your address?”",
    knowledge: {
      title: "Identity verification policy",
      body: "Confirm two account identifiers (DOB, postcode, or last 4 of the account number) before discussing billing. Mandatory under data-protection policy.",
    },
  },
  {
    id: "acknowledge",
    label: "Acknowledge the concern",
    detail: "A one-line empathy beat before moving to diagnosis.",
    stage: "open",
    type: "action",
    mandatory: false,
    state: "done",
    at: "0:22",
  },
  {
    id: "diagnose",
    label: "Diagnose the charge",
    detail: "Locate the line-item delta on this month's bill.",
    stage: "discover",
    type: "action",
    mandatory: true,
    state: "active",
    at: null,
    script:
      "Try: “I can see exactly what changed this month — let me walk you through the two lines on your bill so it's clear where the difference is coming from.”",
    subSteps: [
      { id: "do-1", label: "Pull up this month's charges and read the delta back", hit: true },
      { id: "do-2", label: "Compare line by line against last month", hit: true },
      { id: "do-3", label: "Name the exact line that changed", hit: false },
    ],
  },
  {
    id: "explain-ipc",
    label: "Explain the IPC annual tariff change",
    detail: "Name the adjustment and the amount in plain language.",
    stage: "discover",
    type: "action",
    mandatory: true,
    state: "pending",
    at: null,
    script:
      "Try: “This is the annual IPC adjustment that applies across all plans each April — on your tariff that's an extra £2.10 a month, and I can show you how it's calculated.”",
    knowledge: {
      title: "IPC annual tariff (April)",
      body: "The IPC adjustment applies across all plans every April per the government index. On Marcus's tariff that's +£2.10/mo. Show the exact line and the index basis.",
    },
  },
  {
    id: "churn-signal",
    label: "Check for a churn signal",
    detail: "Listen for competitor mention or switch intent.",
    stage: "discover",
    type: "decision",
    mandatory: false,
    state: "pending",
    at: null,
  },
  {
    id: "offer",
    label: "Present the best-practice retention offer",
    detail: "Offer from the approved matrix; lead with value, not price.",
    stage: "act",
    type: "action",
    mandatory: true,
    state: "pending",
    at: null,
    script:
      "Try: “Because you've been with us six years, I can hold your effective rate with a loyalty credit — that keeps you below the price you mentioned without changing your plan.”",
    knowledge: {
      title: "Retention offer matrix",
      body: "Six-year tenure unlocks a loyalty credit that holds the effective rate without changing the plan. Lead with value, not price; one credit per cycle.",
    },
  },
  {
    id: "agreement",
    label: "Confirm agreement & record it",
    detail: "Read back the agreed terms and log them on the account.",
    stage: "act",
    type: "compliance",
    mandatory: true,
    state: "pending",
    at: null,
  },
  {
    id: "close",
    label: "Recap & close",
    detail: "Summarise next steps and confirm nothing else is outstanding.",
    stage: "close",
    type: "action",
    mandatory: true,
    state: "pending",
    at: null,
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
  scriptsReviewed: 2,
  branchExecuted: "Bill higher than expected → IPC tariff → retention offer",
  excludedFrom: "Readiness profile",
  exclusionReason: "Assisted mode (safety wheel on)",
};

// Human-readable label + intent for a step type. Color is always paired
// with the text label so meaning never rides on color alone (G9).
export function stepTypeMeta(type) {
  switch (type) {
    case "compliance":
      return { label: "Compliance", color: "var(--color-info-text)", bg: "var(--color-info-bg)" };
    case "decision":
      return { label: "Decision", color: "var(--color-icon-tertiary-fg)", bg: "var(--color-icon-tertiary-bg)" };
    default:
      return { label: "Action", color: "var(--color-text-medium)", bg: "var(--color-chip-bg)" };
  }
}

export function formatDrillTimer(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
