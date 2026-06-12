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
  interactionId: "20471",
  initials: "MB",
  language: "English (UK)",
  totalSeconds: 372, // 06:12
  // Team-lead config (settings in the brief): safety-on sessions allowed
  // per agent per role play, and how many have been used.
  sessionsAllowed: 3,
  sessionsUsed: 1,
};

// Each step of the guided workflow.
//   id          unique
//   label       short imperative — what the agent should do
//   detail      the evidence the listener looks for
//   mandatory   true = required step; a skipped mandatory step is flagged
//   branch      optional label when the step belongs to a branch the call took
//   state       "done" | "active" | "pending" | "skipped"
//   at          transcript timestamp the step was satisfied (done only)
export const GUIDED_DRILL_STEPS = [
  {
    id: "greet",
    label: "Greeting & brand identification",
    detail: "Agent opens with name + brand and a reason-for-call check.",
    mandatory: true,
    state: "done",
    at: "0:04",
  },
  {
    id: "verify",
    label: "Verify identity (two data points)",
    detail: "Confirm two account identifiers before discussing the bill.",
    mandatory: true,
    state: "skipped",
    at: null,
  },
  {
    id: "acknowledge",
    label: "Acknowledge the concern",
    detail: "A one-line empathy beat before moving to diagnosis.",
    mandatory: false,
    state: "done",
    at: "0:22",
  },
  {
    id: "diagnose",
    label: "Diagnose the charge",
    detail: "Locate the line-item delta on this month's bill.",
    mandatory: true,
    state: "active",
    at: null,
  },
  {
    id: "explain-ipc",
    label: "Explain the IPC annual tariff change",
    detail: "Name the adjustment and the amount in plain language.",
    mandatory: true,
    branch: "Bill higher than expected",
    state: "pending",
    at: null,
  },
  {
    id: "churn-signal",
    label: "Check for a churn signal",
    detail: "Listen for competitor mention or switch intent.",
    mandatory: false,
    branch: "Bill higher than expected",
    state: "pending",
    at: null,
  },
  {
    id: "offer",
    label: "Present the best-practice retention offer",
    detail: "Offer from the approved matrix; lead with value, not price.",
    mandatory: true,
    state: "pending",
    at: null,
  },
  {
    id: "agreement",
    label: "Confirm agreement & record it",
    detail: "Read back the agreed terms and log them on the account.",
    mandatory: true,
    state: "pending",
    at: null,
  },
  {
    id: "close",
    label: "Recap & close",
    detail: "Summarise next steps and confirm nothing else is outstanding.",
    mandatory: true,
    state: "pending",
    at: null,
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
