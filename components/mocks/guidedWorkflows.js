// guidedWorkflows — mock data for the TEAM-LEADER authoring experience
// (create / manage / view) of Drill Guided Workflows. This is the other
// half of the agent-side DrillGuidedSessionPage: the lead authors the flat
// checklist here, attaches it to a drill persona, and the agent practises
// against it with the safety wheel on.
//
// Jun 12 / Jun 16 ticket decisions encoded here:
//   - Flat checklist, NO branching ("as easy as a checklist in Asana").
//   - Edit-mode = create-mode; nothing is built from a blank canvas — every
//     workflow starts AI-generated from ≤10 production interactions or a
//     pasted transcript, then the lead edits.
//   - Schema: contact reason → job-to-be-done → success metric → triggers →
//     five universal stages (Open → Verify → Discover → Act → Close) →
//     steps (instruction + script + grounding) → conditional sub-steps.
//   - Each step is typed (compliance / action / decision) and tagged
//     required / conditional / recommended, and carries GROUNDING — which
//     production interaction it was mined from (verifiability).
//   - Auditing is first-class: last edit, who, edit count, attached personas.
//   - V1: unlimited guided attempts per agent (no cap configured yet).
//
// The flagship workflow is a broadband "Home WiFi dropping out" connectivity
// triage so the author side and the practice side stay in sync.

// The five universal conversation stages. Shared with the agent view.
export const GW_STAGES = [
  { id: "open", label: "Open", purpose: "Greet, identify the brand, set the reason for the call." },
  { id: "verify", label: "Verify", purpose: "Confirm identity and locate the line before changing anything." },
  { id: "discover", label: "Discover", purpose: "Find what's actually failing — symptoms, router lights, what changed." },
  { id: "act", label: "Act", purpose: "Fix it — reset the connection, optimise, or book an engineer." },
  { id: "close", label: "Close", purpose: "Confirm they're back online, recap, end the call." },
];

// Lifecycle states a workflow can be in (mirrors the Guide landing).
export const GW_STATES = ["active", "draft", "calibration", "archived"];

// Author monogram → pastel tile palette (matches the Guide/Settings palette).
const AUTHOR_PALETTE = {
  emerald: { bg: "#ECFDF5", fg: "#10B981" },
  blue: { bg: "#EFF6FF", fg: "#3B82F6" },
  violet: { bg: "#F5F3FF", fg: "#8B5CF6" },
  lavender: { bg: "#EDE9FE", fg: "#6650A5" },
  orange: { bg: "#FFF7ED", fg: "#F97316" },
};
function author(initial, name, tone) {
  return { initial, name, ...AUTHOR_PALETTE[tone] };
}

// The library — what "manage / view" lists. Audit metadata is first-class.
export const GUIDED_WORKFLOWS = [
  {
    id: "gw-wifi-dropping",
    title: "Home WiFi dropping out — connectivity triage",
    contactReason: "WiFi keeps dropping or won't stay connected",
    outcome: "resolution",
    jobToBeDone: "Find what's breaking the connection, fix it on the call or book the right follow-up, confirm they're back online.",
    state: "active",
    author: author("M", "María Ruiz", "emerald"),
    stepCount: 9,
    requiredCount: 6,
    attachedPersonas: ["Marcus Bell", "Lucía Martín García", "Andrés Navarro"],
    attempts: "Unlimited",
    source: { kind: "interactions", count: 12 },
    groundingPct: 78,
    updatedAt: "2026-06-14",
    editCount: 7,
    lastEditedBy: "María Ruiz",
  },
  {
    id: "gw-no-service",
    title: "Total loss of service — line fault triage",
    contactReason: "No internet at all; router shows no broadband sync",
    outcome: "resolution",
    jobToBeDone: "Confirm it's a line fault, raise it cleanly, book the engineer and set expectations.",
    state: "active",
    author: author("D", "Dev Patel", "blue"),
    stepCount: 8,
    requiredCount: 5,
    attachedPersonas: ["David Evans"],
    attempts: "Unlimited",
    source: { kind: "interactions", count: 9 },
    groundingPct: 71,
    updatedAt: "2026-06-10",
    editCount: 4,
    lastEditedBy: "Dev Patel",
  },
  {
    id: "gw-slow-speeds",
    title: "Slow broadband speeds — diagnose & optimise",
    contactReason: "Connection works but speeds are far below the plan",
    outcome: "resolution",
    jobToBeDone: "Run a like-for-like speed test, isolate WiFi vs line, optimise or escalate.",
    state: "calibration",
    author: author("S", "Sofia Klein", "violet"),
    stepCount: 10,
    requiredCount: 7,
    attachedPersonas: ["Klaus Schmidt"],
    attempts: "Unlimited",
    source: { kind: "interactions", count: 6 },
    groundingPct: 64,
    updatedAt: "2026-06-08",
    editCount: 11,
    lastEditedBy: "Sofia Klein",
  },
  {
    id: "gw-new-router",
    title: "New router self-install support",
    contactReason: "Customer setting up a replacement router and stuck",
    outcome: "setup",
    jobToBeDone: "Walk them through plug-in, sync, and first connection without a truck roll.",
    state: "draft",
    author: author("R", "Raj Mehta", "orange"),
    stepCount: 7,
    requiredCount: 5,
    attachedPersonas: [],
    attempts: "Unlimited",
    source: { kind: "transcript" },
    groundingPct: 0,
    updatedAt: "2026-06-15",
    editCount: 2,
    lastEditedBy: "Raj Mehta",
  },
  {
    id: "gw-intermittent-evening",
    title: "Evening drop-outs — congestion & interference",
    contactReason: "WiFi reliable by day but drops every evening",
    outcome: "resolution",
    jobToBeDone: "Separate interference from congestion, change channel/band, confirm the fix holds.",
    state: "archived",
    author: author("M", "María Ruiz", "emerald"),
    stepCount: 8,
    requiredCount: 5,
    attachedPersonas: [],
    attempts: "Unlimited",
    source: { kind: "interactions", count: 14 },
    groundingPct: 82,
    updatedAt: "2026-04-29",
    editCount: 9,
    lastEditedBy: "Akash Nair",
  },
];

// The flagship workflow's setup fields (the schema head the editor exposes).
export const GW_FLAGSHIP_META = {
  id: "gw-wifi-dropping",
  title: "Home WiFi dropping out — connectivity triage",
  contactReason: "WiFi keeps dropping or won't stay connected",
  jobToBeDone: "Find what's breaking the connection, fix it on the call or book the right follow-up, confirm they're back online.",
  successMetric: "Customer back online (or engineer booked) with the cause recorded; no repeat call within 7 days.",
  triggers: ["“my wifi keeps dropping”", "“there's no internet”", "“the router light is red”"],
};

// The flat checklist. One row per step; stage groups them. Each step is
// typed and tagged, carries a script the agent may pull, optional knowledge,
// optional conditional sub-steps, and GROUNDING (mined-from interaction) so
// the lead can verify why the AI proposed it. `grounding: null` = the lead
// added the step by hand (visibly ungrounded).
export const GW_STEPS = [
  {
    id: "greet",
    stage: "open",
    instruction: "Greeting & brand identification",
    detail: "Open with name + brand and a reason-for-call check.",
    type: "action",
    requirement: "required",
    script: "Hi, you're through to Acme Broadband, my name's Sam — I can see you're calling about your WiFi, happy to help get you back online.",
    knowledge: null,
    grounding: { interactionId: "30471", quote: "“Thanks for calling Acme Broadband, this is Sam…”" },
    subSteps: [],
  },
  {
    id: "verify",
    stage: "verify",
    instruction: "Verify identity & locate the line",
    detail: "Confirm two account identifiers before running checks on the line.",
    type: "compliance",
    requirement: "required",
    script: "Before I run any checks on your line, can I confirm two details — your date of birth and the first line of your address?",
    knowledge: {
      title: "Identity verification policy",
      body: "Confirm two account identifiers (DOB, postcode, or last 4 of the account number) before discussing the account or running line tests. Mandatory under data-protection policy.",
    },
    grounding: { interactionId: "30471", quote: "“Can I take your date of birth and postcode?”" },
    subSteps: [],
  },
  {
    id: "acknowledge",
    stage: "open",
    instruction: "Acknowledge the disruption",
    detail: "A one-line empathy beat before moving to diagnosis.",
    type: "action",
    requirement: "recommended",
    script: "I know how disruptive it is when the internet keeps dropping — let's get to the bottom of it together.",
    knowledge: null,
    grounding: null,
    subSteps: [],
  },
  {
    id: "symptoms",
    stage: "discover",
    instruction: "Establish the symptoms",
    detail: "Pin down what's failing, on what, and since when.",
    type: "action",
    requirement: "required",
    script: "Let's pin down exactly what's happening — is it dropping on every device or just one, and does it cut out or never connect at all?",
    knowledge: null,
    grounding: { interactionId: "29980", quote: "“It drops on everything, every few minutes…”" },
    subSteps: [
      { id: "do-1", label: "All devices or just one?" },
      { id: "do-2", label: "Constant drop-outs or intermittent?" },
      { id: "do-3", label: "When did it start / anything change?" },
    ],
  },
  {
    id: "check-lights",
    stage: "discover",
    instruction: "Check the router status lights",
    detail: "Have the customer read the broadband/internet light back to you.",
    type: "action",
    requirement: "required",
    script: "Can you look at the front of the router for me — what colour is the broadband or internet light right now, and is it steady or flashing?",
    knowledge: {
      title: "Router light reference",
      body: "Steady green = line in sync and online. Red or off = no broadband sync (line fault). Flashing = attempting to sync. Use the light to split a line fault from a local WiFi problem before acting.",
    },
    grounding: { interactionId: "29980", quote: "“The broadband light's flashing red.”" },
    subSteps: [],
  },
  {
    id: "line-test",
    stage: "discover",
    instruction: "Run the line/sync test & decide the path",
    detail: "Use the light + a line test to decide reboot vs engineer.",
    type: "decision",
    requirement: "conditional",
    script: null,
    knowledge: null,
    grounding: { interactionId: "30471", quote: "“The line's showing in sync our end…”" },
    subSteps: [
      { id: "ln-1", label: "If the line is up but WiFi is weak → reboot & optimise" },
      { id: "ln-2", label: "If the broadband light is red / no sync → book an engineer" },
    ],
  },
  {
    id: "power-cycle",
    stage: "act",
    scenario: "reboot",
    instruction: "Power-cycle the router",
    detail: "Walk them through a full restart and wait for resync.",
    type: "action",
    requirement: "required",
    script: "Let's restart the router — unplug it at the wall, wait 30 seconds, then plug it back in. The lights will cycle for about two minutes before it's back.",
    knowledge: null,
    grounding: { interactionId: "30102", quote: "“A full restart usually clears the drop-outs…”" },
    subSteps: [],
  },
  {
    id: "optimise",
    stage: "act",
    scenario: "reboot",
    instruction: "Re-test the connection & optimise placement",
    detail: "Confirm it reconnected, then fix common placement causes.",
    type: "action",
    requirement: "required",
    script: "Now it's back, try connecting again. While we're here — keep the router out in the open, not in a cabinet or behind the TV; that alone fixes a lot of drop-outs.",
    knowledge: null,
    grounding: { interactionId: "30102", quote: "“Moving it out of the cabinet sorted the signal.”" },
    subSteps: [],
  },
  {
    id: "raise-fault",
    stage: "act",
    scenario: "engineer",
    instruction: "Raise the line fault & book an engineer",
    detail: "Open the fault and book the earliest engineer slot.",
    type: "action",
    requirement: "required",
    script: "There's a fault on the line itself, so a restart won't fix it — I'm raising it now and booking an engineer. The earliest slot is Thursday morning.",
    knowledge: null,
    grounding: { interactionId: "30188", quote: "“I've logged the fault and booked the engineer.”" },
    subSteps: [],
  },
  {
    id: "confirm-appointment",
    stage: "act",
    scenario: "engineer",
    instruction: "Confirm the appointment & set expectations",
    detail: "Read back the slot, the text reminder, and that there's no charge.",
    type: "compliance",
    requirement: "required",
    script: "So that's Thursday between 8 and 12, you'll get a text the day before, and there's no charge as it's a line fault. I've noted all that on your account.",
    knowledge: null,
    grounding: { interactionId: "30188", quote: "“Thursday morning, no charge — that's all noted.”" },
    subSteps: [],
  },
  {
    id: "check-outage",
    stage: "act",
    scenario: "outage",
    instruction: "Check for a known area outage",
    detail: "Look up network status for the postcode before troubleshooting the router.",
    type: "action",
    requirement: "required",
    script: "Let me check our network status for your area — yes, there's a known outage affecting your postcode and our engineers are already on it.",
    knowledge: {
      title: "Network status check",
      body: "Always check area status before a reboot or engineer booking — a known outage means the customer's kit is fine. Quote the reference and the live ETA, never a reboot.",
    },
    grounding: { interactionId: "30240", quote: "“There's an outage in your area — it's not your router.”" },
    subSteps: [
      { id: "ou-1", label: "If the outage is confirmed → do not reboot or book an engineer" },
    ],
  },
  {
    id: "outage-eta",
    stage: "act",
    scenario: "outage",
    instruction: "Give the restoration ETA & register a text alert",
    detail: "Set a firm expectation and remove the need to call back.",
    type: "compliance",
    requirement: "required",
    script: "The estimated fix is by 6pm today — I'll register you for an automatic text the moment it's resolved, so you won't need to call back.",
    knowledge: null,
    grounding: { interactionId: "30240", quote: "“You'll get a text as soon as it's back — fixed by 6.”" },
    subSteps: [],
  },
  {
    id: "close",
    stage: "close",
    instruction: "Confirm back online & close",
    detail: "Confirm the connection's steady (or the booking's set) and wrap up.",
    type: "action",
    requirement: "required",
    script: "Your connection's back up and steady now. Is there anything else I can help with before we wrap up?",
    knowledge: null,
    grounding: null,
    subSteps: [],
  },
];

// Source interactions the lead picks from to generate a workflow (≤10).
// `selected` seeds the demo with a realistic starting set.
export const GW_SOURCE_INTERACTIONS = [
  { id: "30471", customer: "Marcus Bell", reason: "WiFi dropping every few minutes", duration: "6m 12s", outcome: "Resolved", date: "2026-06-02", selected: true },
  { id: "29980", customer: "Priya Shah", reason: "No internet — broadband light red", duration: "4m 48s", outcome: "Engineer booked", date: "2026-05-28", selected: true },
  { id: "30102", customer: "Tom Reilly", reason: "Drops fixed by reboot & placement", duration: "5m 31s", outcome: "Resolved", date: "2026-05-30", selected: true },
  { id: "30188", customer: "Anita Bose", reason: "Line fault — engineer dispatched", duration: "7m 02s", outcome: "Engineer booked", date: "2026-06-01", selected: false },
  { id: "30240", customer: "George Hall", reason: "Intermittent evening drop-outs", duration: "8m 14s", outcome: "Resolved", date: "2026-06-03", selected: false },
  { id: "30311", customer: "Mei Lin", reason: "Slow speeds on WiFi only", duration: "3m 55s", outcome: "Resolved", date: "2026-06-05", selected: false },
  { id: "30356", customer: "Olu Ade", reason: "Won't connect after power cut", duration: "9m 20s", outcome: "Resolved", date: "2026-06-06", selected: false },
  { id: "30402", customer: "Rosa Díaz", reason: "WiFi drops on one device only", duration: "5m 09s", outcome: "Resolved", date: "2026-06-07", selected: false },
];

// Drill personas the workflow can be attached to (subset of the drill
// library). `attached` seeds which personas already carry this workflow.
export const GW_PERSONAS = [
  { id: "marcus-bell", customer: "Marcus Bell", category: "Connectivity", difficulty: "Complex", attached: true },
  { id: "lucia-martin-garcia", customer: "Lucía Martín García", category: "Connectivity", difficulty: "Complex", attached: true },
  { id: "andres-navarro", customer: "Andrés Navarro", category: "Connectivity", difficulty: "Complex", attached: true },
  { id: "amelie-dubois", customer: "Amélie Dubois", category: "Connectivity", difficulty: "Simple", attached: false },
  { id: "javier-sanz", customer: "Javier Sanz", category: "Technical", difficulty: "Complex", attached: false },
  { id: "david-evans", customer: "David Evans", category: "Setup", difficulty: "Complex", attached: false },
];

// Sample transcript for the C·Studio evidence pane. Turns tagged with a
// `stepId` are the passages a step was grounded in — selecting a step
// highlights its evidence here.
export const GW_TRANSCRIPT = [
  { id: "t1", speaker: "agent", text: "Thanks for calling Acme Broadband, this is Sam — happy to help get your WiFi back online.", stepId: "greet" },
  { id: "t2", speaker: "customer", text: "My WiFi keeps dropping out — every few minutes, on all my devices.", stepId: "symptoms" },
  { id: "t3", speaker: "agent", text: "Can I take your date of birth and postcode so I can run some checks on the line?", stepId: "verify" },
  { id: "t4", speaker: "customer", text: "Sure — 14th of March, and it's AC1 4ME.", stepId: "verify" },
  { id: "t5", speaker: "agent", text: "Thank you. Can you tell me what colour the broadband light on the router is right now?", stepId: "check-lights" },
  { id: "t6", speaker: "customer", text: "It's green, but it's been cutting out.", stepId: "check-lights" },
  { id: "t7", speaker: "agent", text: "The line's showing in sync our end, so let's try a full restart of the router.", stepId: "line-test" },
  { id: "t8", speaker: "agent", text: "Unplug it at the wall, wait 30 seconds, then plug it back in — it'll take about two minutes.", stepId: "power-cycle" },
  { id: "t9", speaker: "customer", text: "Okay, it's back on and I'm connected again.", stepId: "optimise" },
  { id: "t10", speaker: "agent", text: "Great — keep it out in the open and it should stay steady. Anything else before we wrap up?", stepId: "close" },
];

// Per-step EVIDENCE — why the AI proposed this step, made auditable. Mined
// from the grounded interactions: how often following the step correlated
// with the outcome, across how many calls, and the actual phrasing top
// agents used (real examples the lead can lift into the script). Steps the
// lead added by hand have no evidence (returns null) — visibly unproven.
export const GW_STEP_EVIDENCE = {
  greet: {
    successRate: 96, callCount: 240, outcome: "a smooth open",
    examples: [
      { interactionId: "30471", quote: "Thanks for calling Acme Broadband, this is Sam — let's get your WiFi sorted." },
      { interactionId: "30102", quote: "You're through to Acme Broadband, my name's Priya — I can see your line here." },
    ],
  },
  acknowledge: {
    successRate: 84, callCount: 150, outcome: "the customer staying patient through the checks",
    examples: [
      { interactionId: "30471", quote: "I know how disruptive constant drop-outs are — let's sort it out together." },
      { interactionId: "30402", quote: "That's frustrating, and I'm glad you called so we can look at it properly." },
    ],
  },
  verify: {
    successRate: 88, callCount: 240, outcome: "compliant handling",
    examples: [
      { interactionId: "30471", quote: "Before I run any line checks, can I confirm your date of birth and postcode?" },
      { interactionId: "29980", quote: "Just two quick security details and I'll have you verified." },
    ],
  },
  symptoms: {
    successRate: 81, callCount: 180, outcome: "the right fix first time",
    examples: [
      { interactionId: "29980", quote: "Is it every device or just one, and does it drop or never connect?" },
      { interactionId: "30240", quote: "When did the drop-outs start, and did anything change around then?" },
    ],
  },
  "check-lights": {
    successRate: 79, callCount: 160, outcome: "a line fault caught before a pointless reboot",
    examples: [
      { interactionId: "29980", quote: "What colour is the broadband light — steady green, or red and flashing?" },
      { interactionId: "30356", quote: "If that light's red, it's the line, not the WiFi — good to know now." },
    ],
  },
  "line-test": {
    successRate: 74, callCount: 90, outcome: "the call routed to the right resolution",
    examples: [
      { interactionId: "30471", quote: "The line's in sync our end, so a restart should clear it." },
      { interactionId: "30188", quote: "No sync showing here — that's a line fault, I'll book an engineer." },
    ],
  },
  "power-cycle": {
    successRate: 82, callCount: 120, outcome: "the connection restored on the call",
    examples: [
      { interactionId: "30102", quote: "Unplug at the wall, 30 seconds, plug back in — give it two minutes." },
      { interactionId: "30356", quote: "A full power-cycle usually clears it after a power cut." },
    ],
  },
  optimise: {
    successRate: 77, callCount: 96, outcome: "no repeat call within 7 days",
    examples: [
      { interactionId: "30102", quote: "Keep it out in the open, not in a cabinet — that fixed the signal." },
      { interactionId: "30402", quote: "Moving it off the floor and away from the TV steadied it right up." },
    ],
  },
  "raise-fault": {
    successRate: 86, callCount: 70, outcome: "the fault resolved at the engineer visit",
    examples: [
      { interactionId: "30188", quote: "There's no sync on the line — I'm raising the fault and booking an engineer." },
    ],
  },
  "confirm-appointment": {
    successRate: 90, callCount: 66, outcome: "no missed appointment",
    examples: [
      { interactionId: "30188", quote: "Thursday between 8 and 12, text the day before, no charge — all noted." },
    ],
  },
  "check-outage": {
    successRate: 88, callCount: 54, outcome: "the customer reassured without a needless truck roll",
    examples: [
      { interactionId: "30240", quote: "Good news — it's an area outage, not your router, so nothing to fix your end." },
    ],
  },
  "outage-eta": {
    successRate: 91, callCount: 50, outcome: "no repeat call within 7 days",
    examples: [
      { interactionId: "30240", quote: "Fixed by 6pm and I've set a text alert — you won't need to call back." },
    ],
  },
  close: {
    successRate: 93, callCount: 200, outcome: "no repeat call within 7 days",
    examples: [
      { interactionId: "30102", quote: "You're back online and steady. Anything else before we wrap up?" },
      { interactionId: "30402", quote: "Glad we got you connected again — have a good rest of your day." },
    ],
  },
};

export function gwEvidence(stepId) {
  return GW_STEP_EVIDENCE[stepId] || null;
}

// AI-SUGGESTED steps not yet in the workflow. The lead reviews them with the
// same evidence the base steps carry and accepts the ones worth keeping —
// the "self-improving knowledge" loop surfaced as an editable suggestion.
export const GW_SUGGESTED_STEPS = [
  {
    id: "sg-speedtest",
    stage: "discover",
    instruction: "Run a live speed test together",
    detail: "Get a real number so WiFi weakness vs line trouble is obvious.",
    type: "action",
    requirement: "recommended",
    script: "Let's run a quick speed test on a device next to the router — that tells us straight away whether it's the WiFi or the line.",
    knowledge: null,
    grounding: { interactionId: "30311", quote: "“Right next to the router it's only 4 megs…”" },
    subSteps: [],
    evidence: {
      successRate: 73, callCount: 64, outcome: "the cause isolated faster",
      examples: [
        { interactionId: "30311", quote: "Next to the router we got the full speed — so it's WiFi range, not the line." },
      ],
    },
  },
  {
    id: "sg-app",
    stage: "act",
    instruction: "Point them to the WiFi app for ongoing checks",
    detail: "Leave the customer able to self-check signal and reboot remotely.",
    type: "action",
    requirement: "recommended",
    script: "I'll get the Acme WiFi app set up on your phone — it lets you see your signal per room and restart the router yourself if it ever drops again.",
    knowledge: null,
    grounding: { interactionId: "30402", quote: "“The app lets you reboot it without unplugging…”" },
    subSteps: [],
    evidence: {
      successRate: 78, callCount: 88, outcome: "no repeat call within 7 days",
      examples: [
        { interactionId: "30402", quote: "I set up the app so they can check signal and reboot without calling in." },
      ],
    },
  },
  {
    id: "sg-followup",
    stage: "close",
    instruction: "Set a proactive follow-up checkpoint",
    detail: "Tell them when you'll check the line held, so the fix sticks.",
    type: "action",
    requirement: "recommended",
    script: "I'll have the line monitored for 48 hours and we'll check in to make sure it's stayed stable.",
    knowledge: null,
    grounding: null,
    subSteps: [],
    evidence: {
      successRate: 69, callCount: 52, outcome: "fewer repeat faults",
      examples: [
        { interactionId: "30102", quote: "We'll monitor the line for two days and confirm it held." },
      ],
    },
  },
];

// Conditional SCENARIOS — within a stage, a scenario is a short run of
// show/hide steps under a plain-language "If <trigger>" header (Process
// Street model: conditional tasks, not a branching tree). Steps carry a
// `scenario` id; steps with none are always-on.
export const GW_SCENARIOS = {
  reboot: {
    label: "Reboot & optimise",
    trigger: "If the line is up but WiFi is weak or dropping",
    triggerScenario: "Is the line in sync but the customer's WiFi is weak, intermittent, or dropping on some devices or rooms?",
    cues: [
      "Broadband light is steady green",
      "Drops affect some devices or rooms, not all",
      "Problem worsens with distance from the router",
      "Started after moving the router or adding devices",
    ],
  },
  engineer: {
    label: "Engineer visit",
    trigger: "If the broadband light is red or no line sync is detected",
    triggerScenario: "Is there no broadband sync — a red or off broadband light pointing to a line fault?",
    cues: [
      "Broadband / DSL light is red or off",
      "No connection on any device",
      "A full reboot did not restore sync",
      "Fault confirmed on the line test",
    ],
  },
  outage: {
    label: "Area outage",
    trigger: "If there's a known outage in the customer's area",
    triggerScenario: "Is there a known outage affecting the customer's area right now?",
    cues: [
      "Network status shows an outage for the postcode",
      "Multiple customers in the area are affected",
      "The customer's equipment shows no fault",
      "The outage has a published restoration ETA",
    ],
  },
};
export function gwScenario(id) {
  return GW_SCENARIOS[id] || null;
}

// Group a stage's steps into { alwaysOn: [...], scenarios: [{id,label,trigger,steps}] }
// preserving order — used by the sectioned checklist editor.
export function gwGroupStage(steps) {
  const alwaysOn = steps.filter((s) => !s.scenario);
  const order = [];
  const byId = {};
  steps.filter((s) => s.scenario).forEach((s) => {
    if (!byId[s.scenario]) { byId[s.scenario] = { id: s.scenario, ...GW_SCENARIOS[s.scenario], steps: [] }; order.push(s.scenario); }
    byId[s.scenario].steps.push(s);
  });
  return { alwaysOn, scenarios: order.map((id) => byId[id]) };
}

// Review-&-publish context — the situation the workflow was mined from plus
// the winning insight (why this call resolved). Shown in the stepper
// direction's collapsible context panel; collapses once curation begins.
export const GW_REVIEW_CONTEXT = {
  situation:
    "A customer calls because their home WiFi keeps dropping out — on every device, every few minutes. They're frustrated, have already rebooted once themselves, and want it fixed today rather than booking a visit.",
  insight:
    "The agent didn't jump to a reboot or an engineer. They read the router's broadband light first, split a local WiFi problem from a line fault on the spot, and only then ran the matching path — restoring the connection on the call instead of dispatching a needless truck roll.",
};

// Likely customer questions for the Knowledge stage — surfaced in the
// customer's own voice with the intent behind them, each tied to the triage
// path it most relates to. The TL attaches an answer card (existing or
// AI-drafted) to each before publishing.
export const GW_LIKELY_QUESTIONS = [
  { id: "q-01", topic: "Drops with a green light", customerVoiced: "Why does my WiFi keep cutting out even though the light is green?", intent: "Understand why a healthy line still drops — usually WiFi range, interference or device count rather than the broadband connection itself.", relatedScenario: "reboot" },
  { id: "q-02", topic: "Outage restoration time", customerVoiced: "There's an outage in my area — when will my internet be back?", intent: "Get a firm restoration ETA and know they'll be told when it's resolved without having to call again.", relatedScenario: "outage" },
  { id: "q-03", topic: "Engineer visit charge", customerVoiced: "Will I be charged for an engineer to come and fix the line?", intent: "Understand whether a line-fault engineer visit is free and what happens if the fault turns out to be inside the home.", relatedScenario: "engineer" },
  { id: "q-04", topic: "Speed after the fix", customerVoiced: "Will my speed go back to normal once this is sorted?", intent: "Know whether the fix restores full plan speed and what to do if it still feels slow afterwards.", relatedScenario: "reboot" },
];

// Knowledge-base answer cards the TL can attach to a likely question —
// cliff-notes, not a full article. `topics` lists the question ids each card
// answers (drives the "Suggested match" surfacing).
export const GW_KB_CARDS = [
  { id: "KC-201", title: "Why a healthy line still drops WiFi", topics: ["q-01"], body: "A green broadband light means the line is in sync — drops then come from WiFi: distance from the router, walls, interference, or too many devices on one band. Move the router into the open and split 2.4/5GHz before escalating." },
  { id: "KC-202", title: "Area outages — ETA & text alerts", topics: ["q-02"], body: "When network status shows an area outage, the customer's kit is fine. Quote the published restoration ETA and register them for an automatic text when it clears — never reboot or book an engineer for a confirmed outage." },
  { id: "KC-203", title: "Engineer visits — when they're free", topics: ["q-03"], body: "A confirmed line fault (no sync) is repaired at no charge. If the engineer finds the fault is inside the home (customer wiring or equipment), a visit charge may apply — disclose this before booking." },
  { id: "KC-204", title: "Restoring full speed after a fix", topics: ["q-01", "q-04"], body: "Once the line is stable, a device beside the router should see full plan speed. If it's still slow, it's WiFi reach — suggest the WiFi app's per-room check or a booster rather than re-opening the line fault." },
];

// ---- meta helpers -------------------------------------------------------

// Step type — color is always paired with the text label (never color alone).
export function gwTypeMeta(type) {
  switch (type) {
    case "compliance":
      return { label: "Compliance", color: "var(--color-info-text)", bg: "var(--color-info-bg)" };
    case "decision":
      return { label: "Decision", color: "var(--color-icon-tertiary-fg)", bg: "var(--color-icon-tertiary-bg)" };
    default:
      return { label: "Action", color: "var(--color-text-medium)", bg: "var(--color-chip-bg)" };
  }
}

// Requirement tag — required carries the most weight (it's what the eval
// penalises a skip on); recommended is the lightest.
export function gwRequirementMeta(requirement) {
  switch (requirement) {
    case "required":
      return { label: "Required", color: "var(--color-text-deep)", bg: "var(--color-chip-bg)", weight: 700 };
    case "conditional":
      return { label: "Conditional", color: "var(--color-icon-tertiary-fg)", bg: "var(--color-icon-tertiary-bg)", weight: 700 };
    default:
      return { label: "Recommended", color: "var(--color-text-tertiary)", bg: "transparent", weight: 500 };
  }
}

// State badge tone for the library.
export function gwStateTone(state) {
  switch (state) {
    case "active":
      return { tone: "success", label: "Active" };
    case "calibration":
      return { tone: "warning", label: "Calibration" };
    case "archived":
      return { tone: "info", label: "Archived" };
    default:
      return { tone: "info", label: "Draft" };
  }
}

export function gwStepsByStage(steps) {
  return GW_STAGES.map((stage) => ({
    ...stage,
    steps: steps.filter((s) => s.stage === stage.id),
  }));
}
