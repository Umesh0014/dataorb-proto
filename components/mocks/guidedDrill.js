// guidedDrill — mock data for the agent-side in-drill Guided Workflow view
// (progressive-disclosure direction locked Jun 16). The agent practises a
// role play against a simulated customer; a second AI listens and checks off
// the configured workflow steps (order-agnostic) and projects the likely
// next step. NO transcript is shown — the guided card surfaces only the
// previous / current / next step. Real STT + live step-detection is out of
// scope; the page drives the same shapes off a short demo timer.
//
// Schema (per the locked spec): five universal stages
//   Open → Verify → Discover → Act → Close
// each step carries an instruction, a Script (phrasing), an optional
// Knowledge card (a specific linked card, complex steps only), a type
// (compliance / action / decision), and mandatory vs optional.

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
  sessionsAllowed: 3,
  sessionsUsed: 1,
};

// The five universal conversation stages.
export const GUIDED_DRILL_STAGES = [
  { id: "open",     label: "Open" },
  { id: "verify",   label: "Verify" },
  { id: "discover", label: "Discover" },
  { id: "act",      label: "Act" },
  { id: "close",    label: "Close" },
];

// Step types — drives the small type tag on each step.
export const STEP_TYPE_LABEL = {
  compliance: "Compliance",
  action: "Action",
  decision: "Decision",
};

// The four AI-behaviour scenarios the guided view must make legible —
// surfaced as a small demo control so a reviewer can trigger each.
export const GUIDED_DRILL_SCENARIOS = [
  {
    id: "listen",
    label: "Active listening",
    note: "AI hears a configured step, checks it off, and projects the next.",
  },
  {
    id: "blind",
    label: "Not tracked",
    note: "Talk that isn't a configured step — the AI logs nothing and stays quiet.",
  },
  {
    id: "remaining",
    label: "Show remaining",
    note: "Agent asks to see what's left — the full list opens on demand.",
  },
  {
    id: "correct",
    label: "Review AI corrects",
    note: "Agent did a step the live AI missed — a second AI logs it in the background. The agent never corrects it.",
  },
];

// The configured workflow steps (the AI only monitors these). state:
//   "done" | "active" | "pending". The page derives previous/current/next
// from this list. `script` = suggested phrasing; `knowledge` = a specific
// linked card (complex steps only); `type` = compliance/action/decision.
export const GUIDED_DRILL_STEPS = [
  {
    id: "greet",
    stage: "open",
    label: "Greeting & self-identification",
    type: "compliance",
    mandatory: true,
    state: "done",
    at: "0:04",
    instruction: "Open with your name + brand and confirm the reason for the call.",
    script: "Hi, you're through to Acme — my name's Sam. I can see you're calling about your latest bill; happy to help.",
    // Script support broken into beats for the opening.
    scriptBeats: [
      { label: "Greet", text: "Hi, thanks for calling Acme." },
      { label: "Self-identify", text: "My name's Sam." },
      { label: "Warm greeting", text: "Good to have you with us." },
      { label: "Acknowledge", text: "I can see you're calling about your bill — happy to help." },
    ],
    knowledgeCards: [],
  },
  {
    id: "disclosure",
    stage: "open",
    label: "Recording disclosure",
    type: "compliance",
    mandatory: true,
    state: "done",
    at: "0:09",
    instruction: "State that the call is recorded for quality and training.",
    script: "Just so you know, this call is recorded for quality and training purposes.",
    knowledgeCards: [],
  },
  {
    id: "verify",
    stage: "verify",
    label: "Verify identity (two data points)",
    type: "compliance",
    mandatory: true,
    state: "done",
    at: "0:48",
    instruction: "Confirm two account identifiers before discussing the bill.",
    script: "Before we look at the account, can you confirm your full name and the first line of your address?",
    knowledgeCards: [],
  },
  {
    id: "locate",
    stage: "discover",
    label: "Locate the disputed charge",
    type: "action",
    mandatory: true,
    state: "active",
    at: null,
    instruction: "Find the line-item that changed on this month's bill and read it back.",
    script: "I can see exactly what changed this month — let me walk you through the two lines so it's clear where the difference is coming from.",
    knowledgeCards: [],
  },
  {
    id: "ipc",
    stage: "discover",
    label: "Explain the IPC annual tariff change",
    type: "action",
    mandatory: true,
    state: "pending",
    at: null,
    instruction: "Name the adjustment and the amount in plain language.",
    script: "This is the annual IPC adjustment that applies to every plan each April — on your tariff that's an extra £2.10 a month, and I can show you how it's worked out.",
    knowledgeCards: [
      {
        title: "IPC tariff policy",
        body: "Part of the annual tariff policy — a govt-linked CPI/IPC uplift applied to every plan each April. 2026 = +£2.10 on the £29.90 tariff; flagged in the March statement.",
      },
      {
        title: "Past cases (3)",
        body: "Three older cases with this exact charge — all resolved with a goodwill loyalty credit, none escalated.",
      },
    ],
  },
  {
    id: "churn",
    stage: "discover",
    label: "Check for a churn / competitor signal",
    type: "decision",
    mandatory: false,
    state: "pending",
    at: null,
    instruction: "Listen for switch intent or a competitor mention.",
    script: "How are you finding the service overall — is anything making you reconsider your plan?",
    knowledgeCards: [],
  },
  {
    id: "offer",
    stage: "act",
    label: "Present the best-practice retention offer",
    type: "action",
    mandatory: true,
    state: "pending",
    at: null,
    instruction: "Offer from the approved matrix; lead with value, not price.",
    script: "Because you've been with us six years, I can hold your effective rate with a loyalty credit — that keeps you below the price you mentioned without changing your plan.",
    knowledgeCards: [
      {
        title: "Retention offer matrix",
        body: "6-yr tenure → loyalty credit up to £4/mo for 12 months, no supervisor approval. Lead with value (roaming, family discount) before price.",
      },
    ],
  },
  {
    id: "record",
    stage: "act",
    label: "Confirm agreement & record it",
    type: "compliance",
    mandatory: true,
    state: "pending",
    at: null,
    instruction: "Read back the agreed terms and log them on the account.",
    script: "So that's the loyalty credit applied from your next bill — I'll note it on your account and you'll get an email confirmation.",
    knowledgeCards: [],
  },
  {
    id: "close",
    stage: "close",
    label: "Recap & close",
    type: "action",
    mandatory: true,
    state: "pending",
    at: null,
    instruction: "Summarise next steps and confirm nothing else is outstanding.",
    script: "To recap: your bill returns to around £29.90 from next month, confirmed by email. Is there anything else I can help with?",
    knowledgeCards: [],
  },
];

// Post-session eval. Produced for visibility but EXCLUDED from the readiness
// profile (safety-on = assisted-mode exclusion, mirroring calibration mode).
// Flat-checklist model: the eval penalizes only missed MANDATORY steps;
// optional misses are coaching, outcome-without-process is "great job".
export const GUIDED_DRILL_EVAL = {
  overallScore: 81, // percent — shown but excluded
  stepsDone: 6,
  stepsTotal: 9,
  mandatoryMissed: 0,
  scriptsViewed: 2,
  stagesReached: "Open → Verify → Discover",
  excludedFrom: "Readiness profile",
  exclusionReason: "Assisted mode (safety wheel on)",
};

export function formatDrillTimer(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
