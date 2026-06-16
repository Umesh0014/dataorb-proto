// guidedWorkflow — mock data for the team-leader Guided Workflow authoring
// surface. Separate from guidedDrill.js (agent-side session data).
//
// Data shapes mirror the Notion spec (Jun 16 deep-dive):
//   workflow → schema metadata → stages → steps → sub-steps
//   Each step: instruction + script + knowledge card + type + mandatory flag

// ---- Universal conversation stages ----------------------------------------

export const STAGES = [
  { id: "open",     label: "Open",     color: "var(--color-success)" },
  { id: "verify",   label: "Verify",   color: "var(--color-info)" },
  { id: "discover", label: "Discover", color: "var(--color-warning-dark)" },
  { id: "act",      label: "Act",      color: "var(--chip-stage-violet)" },
  { id: "close",    label: "Close",    color: "var(--color-text-tertiary)" },
];

// ---- Step type + mandatory palettes ---------------------------------------

export const STEP_TYPES = [
  { id: "compliance", label: "Compliance", bg: "var(--chip-compliance-bg)", fg: "var(--chip-compliance-fg)" },
  { id: "action",     label: "Action",     bg: "var(--chip-action-bg)",     fg: "var(--chip-action-fg)" },
  { id: "decision",   label: "Decision",   bg: "var(--chip-decision-bg)",   fg: "var(--chip-decision-fg)" },
];

export const MANDATORY_OPTIONS = [
  { id: "required",      label: "Required",      bg: "var(--chip-required-bg)",      fg: "var(--chip-required-fg)" },
  { id: "conditional",   label: "Conditional",   bg: "var(--chip-conditional-bg)",   fg: "var(--chip-conditional-fg)" },
  { id: "recommended",   label: "Recommended",   bg: "var(--chip-recommended-bg)",   fg: "var(--chip-recommended-fg)" },
];

// ---- Full workflow (bill-shock retention scenario) ------------------------

export const SAMPLE_WORKFLOW = {
  id: "gw-1",
  title: "Bill-shock retention — IPC tariff",
  description:
    "Guided resolution for handling customers calling about unexpected bill increases due to the annual IPC tariff adjustment. Covers greeting through retention offer and close.",
  contactReason: "Billing query — amount higher than expected",
  jobToBeDone: "Retain the customer by explaining the tariff change and offering a loyalty credit",
  scenario: "Customer received a higher bill with no prior notification; is a long-tenure customer openly considering switching providers",
  triggers: ["Bill amount increase", "No notification sent", "Competitor mention"],
  successMetrics: ["Customer retained", "Tariff explained clearly", "Loyalty offer accepted"],
  language: "English (UK)",
  domain: "Retention",
  state: "active",
  author: { name: "Prashant K.", initial: "P", bg: "var(--avatar-violet-bg)", fg: "var(--avatar-violet-fg)" },
  createdAt: "2026-06-12",
  updatedAt: "2026-06-15",
  attachedPersonas: ["Marcus Bell — bill higher than expected", "Sofia Chen — service complaint"],
  attemptsAllowed: 3,
  safetyWheelOn: true,
  stages: [
    {
      id: "open",
      steps: [
        {
          id: "s-1",
          label: "Greeting & brand identification",
          detail: "Open with your name, the brand, and a reason-for-call check.",
          script: "Hi, you're through to [Brand], my name's [Name]. I can see you're calling about your latest bill — happy to help with that.",
          knowledgeCard: null,
          type: "compliance",
          mandatory: "required",
          grounding: "Interaction #18204, #19331, #20471",
          subSteps: [],
        },
        {
          id: "s-2",
          label: "Acknowledge the concern",
          detail: "A one-line empathy beat before moving to verification.",
          script: "I completely understand — seeing a higher number you weren't expecting is frustrating. Let's get to the bottom of it.",
          knowledgeCard: null,
          type: "action",
          mandatory: "recommended",
          grounding: "Interaction #20471",
          subSteps: [],
        },
      ],
    },
    {
      id: "verify",
      steps: [
        {
          id: "s-3",
          label: "Verify identity (two data points)",
          detail: "Confirm two account identifiers before discussing billing details.",
          script: "Before I pull up your account, could I just confirm your date of birth and the postcode on the account?",
          knowledgeCard: { id: "kc-1", title: "Identity Verification Policy", snippet: "Two-factor verification required: DOB + postcode OR account number + last payment amount." },
          type: "compliance",
          mandatory: "required",
          grounding: "Interaction #18204, #19331",
          subSteps: [
            { id: "ss-1", label: "If customer refuses → explain regulatory requirement", mandatory: "conditional" },
            { id: "ss-2", label: "If data doesn't match → escalate to supervisor", mandatory: "conditional" },
          ],
        },
      ],
    },
    {
      id: "discover",
      steps: [
        {
          id: "s-4",
          label: "Diagnose the charge",
          detail: "Locate the line-item delta on this month's bill.",
          script: "Let me pull up this month's charges and compare them line by line with last month so we can see precisely what moved.",
          knowledgeCard: { id: "kc-2", title: "Billing Comparison Tool", snippet: "Use the side-by-side view in CRM > Billing > Compare to show month-over-month delta." },
          type: "action",
          mandatory: "required",
          grounding: "Interaction #20471, #19012",
          subSteps: [
            { id: "ss-3", label: "Name the exact line that changed", mandatory: "required" },
            { id: "ss-4", label: "Compare line by line against last month", mandatory: "required" },
          ],
        },
        {
          id: "s-5",
          label: "Explain the IPC annual tariff change",
          detail: "Name the adjustment and the amount in plain language.",
          script: "This is the annual IPC adjustment that applies across all plans each April — on your tariff that's an extra £2.10 a month, and I can show you how it's calculated.",
          knowledgeCard: { id: "kc-3", title: "IPC Tariff FAQ", snippet: "Annual IPC (Index of Prices and Costs) adjustment applies in April. Rate = CPI + 3.9%. All plans affected." },
          type: "action",
          mandatory: "required",
          grounding: "Interaction #20471",
          subSteps: [],
        },
      ],
    },
    {
      id: "act",
      steps: [
        {
          id: "s-6",
          label: "Check for a churn signal",
          detail: "Listen for competitor mention or switch intent.",
          script: null,
          knowledgeCard: null,
          type: "decision",
          mandatory: "recommended",
          grounding: "Interaction #20471, #18990",
          subSteps: [
            { id: "ss-5", label: "If churn signal detected → escalate to retention offer", mandatory: "conditional" },
            { id: "ss-6", label: "If no churn signal → proceed to standard close", mandatory: "conditional" },
          ],
        },
        {
          id: "s-7",
          label: "Present the retention offer",
          detail: "Offer from the approved matrix; lead with value, not price.",
          script: "Because you've been with us six years, I can hold your effective rate with a loyalty credit — that keeps you below the price you mentioned without changing your plan.",
          knowledgeCard: { id: "kc-4", title: "Retention Offer Matrix", snippet: "Tenure 5+ years: loyalty credit up to £5/month for 12 months. Must not exceed 15% of plan value." },
          type: "action",
          mandatory: "required",
          grounding: "Interaction #20471, #19331",
          subSteps: [],
        },
        {
          id: "s-8",
          label: "Confirm agreement & record it",
          detail: "Read back the agreed terms and log them on the account.",
          script: "So just to confirm — I've applied a £3.50 loyalty credit for the next 12 months, bringing your bill back to £35.00. I'll note that on your account now.",
          knowledgeCard: null,
          type: "compliance",
          mandatory: "required",
          grounding: "Interaction #20471",
          subSteps: [],
        },
      ],
    },
    {
      id: "close",
      steps: [
        {
          id: "s-9",
          label: "Recap & close",
          detail: "Summarise next steps and confirm nothing else is outstanding.",
          script: "You'll see the credit on your next bill. Is there anything else I can help with today?",
          knowledgeCard: null,
          type: "action",
          mandatory: "required",
          grounding: "Interaction #20471, #18204",
          subSteps: [],
        },
      ],
    },
  ],
};

// ---- Audit log entries ----------------------------------------------------

export const AUDIT_LOG = [
  { id: "a-1", author: "Prashant K.", action: "Created workflow", timestamp: "2026-06-12 09:15" },
  { id: "a-2", author: "Prashant K.", action: "Added 9 steps across 5 stages", timestamp: "2026-06-12 10:30" },
  { id: "a-3", author: "Neil R.",     action: "Reviewed and approved step scripts", timestamp: "2026-06-13 14:20" },
  { id: "a-4", author: "Prashant K.", action: "Attached to persona: Marcus Bell", timestamp: "2026-06-14 11:00" },
  { id: "a-5", author: "Prashant K.", action: "Published to active", timestamp: "2026-06-15 16:45" },
];

// ---- Workflow listing entries ----------------------------------------------

export const WORKFLOWS = [
  {
    id: "gw-1",
    title: "Bill-shock retention — IPC tariff",
    description: "Guided resolution for billing queries when the annual IPC tariff adjustment causes unexpected increases.",
    state: "active",
    author: { initial: "P", bg: "var(--avatar-violet-bg)", fg: "var(--avatar-violet-fg)" },
    stepsCount: 9,
    stagesCount: 5,
    attachedCount: 2,
    updatedAt: "2026-06-15",
    language: "English (UK)",
  },
  {
    id: "gw-2",
    title: "New connection onboarding",
    description: "First-call experience for new customers setting up their account and choosing a plan.",
    state: "active",
    author: { initial: "N", bg: "var(--avatar-blue-bg)", fg: "var(--avatar-blue-fg)" },
    stepsCount: 12,
    stagesCount: 5,
    attachedCount: 3,
    updatedAt: "2026-06-14",
    language: "English (UK)",
  },
  {
    id: "gw-3",
    title: "Technical fault triage",
    description: "Step-by-step diagnostic for broadband/network faults before escalating to engineering.",
    state: "active",
    author: { initial: "A", bg: "var(--avatar-emerald-bg)", fg: "var(--avatar-emerald-fg)" },
    stepsCount: 15,
    stagesCount: 5,
    attachedCount: 1,
    updatedAt: "2026-06-13",
    language: "English (UK)",
  },
  {
    id: "gw-4",
    title: "Contract renewal — loyalty",
    description: "Retention workflow for customers approaching end-of-contract with competitor offers.",
    state: "calibration",
    author: { initial: "P", bg: "var(--avatar-violet-bg)", fg: "var(--avatar-violet-fg)" },
    stepsCount: 8,
    stagesCount: 5,
    attachedCount: 0,
    updatedAt: "2026-06-12",
    language: "English (UK)",
  },
  {
    id: "gw-5",
    title: "Service complaint escalation",
    description: "Structured resolution path for formal complaints with regulatory disclosure requirements.",
    state: "draft",
    author: { initial: "N", bg: "var(--avatar-blue-bg)", fg: "var(--avatar-blue-fg)" },
    stepsCount: 11,
    stagesCount: 5,
    attachedCount: 0,
    updatedAt: "2026-06-11",
    language: "English (UK)",
  },
  {
    id: "gw-6",
    title: "Sales upsell — broadband upgrade",
    description: "Guided conversation for identifying upgrade opportunities during support calls.",
    state: "active",
    author: { initial: "A", bg: "var(--avatar-emerald-bg)", fg: "var(--avatar-emerald-fg)" },
    stepsCount: 7,
    stagesCount: 5,
    attachedCount: 2,
    updatedAt: "2026-06-10",
    language: "English (UK)",
  },
];

export const WORKFLOW_TAB_COUNTS = {
  active: 4,
  calibration: 1,
  draft: 1,
  archived: 0,
};

// ---- Step-level metrics (success rate + agent best practices) ---------------

export const STEP_METRICS = {
  "s-1": {
    successRate: 94,
    bestPractices: [
      { agent: "Marcus Bell", verbatim: "Always use the customer's name within the first 10 seconds — it reduces call anxiety by 22%." },
      { agent: "Sofia Chen", verbatim: "Mirror the customer's tone before introducing yourself. Rushing the brand line when they're upset backfires." },
    ],
  },
  "s-2": {
    successRate: 88,
    bestPractices: [
      { agent: "Sofia Chen", verbatim: "Pause for 2 seconds after the empathy statement. Jumping straight to action makes it sound rehearsed." },
      { agent: "James Okafor", verbatim: "Reference what the customer said specifically — 'I can see why a £12 jump with no warning is frustrating' beats generic empathy." },
    ],
  },
  "s-3": {
    successRate: 91,
    bestPractices: [
      { agent: "Marcus Bell", verbatim: "Frame verification as helping them, not gatekeeping — 'so I can pull up your account and help straight away'." },
      { agent: "Priya Sharma", verbatim: "If the customer pushes back on verification, offer the alternative method immediately — don't repeat the same ask." },
    ],
  },
  "s-4": {
    successRate: 85,
    bestPractices: [
      { agent: "James Okafor", verbatim: "Name the exact line item that changed and the exact amount — vague explanations erode trust." },
      { agent: "Sofia Chen", verbatim: "Share your screen or describe the comparison view step by step so the customer follows along." },
    ],
  },
  "s-5": {
    successRate: 82,
    bestPractices: [
      { agent: "Marcus Bell", verbatim: "Lead with what the adjustment IS, then how it's calculated. Don't start with the formula — that feels evasive." },
      { agent: "Priya Sharma", verbatim: "Mention that the increase applies industry-wide. Customers feel less targeted when they know it's universal." },
    ],
  },
  "s-6": {
    successRate: 78,
    bestPractices: [
      { agent: "Sofia Chen", verbatim: "Listen for exact phrases: 'I've been looking at…', 'my friend switched to…', 'I might have to…' — these are the real churn signals." },
      { agent: "James Okafor", verbatim: "Don't ask 'are you thinking of leaving?' directly — it plants the idea. Let the signal emerge naturally." },
    ],
  },
  "s-7": {
    successRate: 76,
    bestPractices: [
      { agent: "Marcus Bell", verbatim: "Lead with what they KEEP, not what the credit IS. '£35 a month, same as you've been paying' beats '£3.50 off'." },
      { agent: "Priya Sharma", verbatim: "Frame the loyalty credit as recognition of their tenure — 'because you've been with us six years' creates emotional anchor." },
    ],
  },
  "s-8": {
    successRate: 92,
    bestPractices: [
      { agent: "James Okafor", verbatim: "Read back exact numbers and duration — ambiguity here causes callbacks. '£3.50 credit, 12 months, bill stays at £35.'" },
      { agent: "Sofia Chen", verbatim: "Always confirm by asking the customer to repeat back the key terms — it catches misunderstandings before they become complaints." },
    ],
  },
  "s-9": {
    successRate: 96,
    bestPractices: [
      { agent: "Marcus Bell", verbatim: "Mention when they'll see the change — 'on your next bill' gives them a concrete expectation to check against." },
      { agent: "Priya Sharma", verbatim: "End on the customer's name. 'Is there anything else I can help with today, Marcus?' personalises the close." },
    ],
  },
};

// ---- Suggested steps per stage (single-click add) ---------------------------

export const SUGGESTED_STEPS = {
  open: [
    { id: "sug-o1", label: "Confirm preferred name" },
    { id: "sug-o2", label: "Set call duration expectation" },
    { id: "sug-o3", label: "Check for previous interactions" },
  ],
  verify: [
    { id: "sug-v1", label: "Offer alternative verification" },
    { id: "sug-v2", label: "Log failed verification attempt" },
  ],
  discover: [
    { id: "sug-d1", label: "Check for bundled services" },
    { id: "sug-d2", label: "Review 12-month account history" },
    { id: "sug-d3", label: "Identify related open tickets" },
  ],
  act: [
    { id: "sug-a1", label: "Offer plan comparison" },
    { id: "sug-a2", label: "Schedule follow-up call" },
    { id: "sug-a3", label: "Apply temporary discount" },
  ],
  close: [
    { id: "sug-c1", label: "Send confirmation SMS" },
    { id: "sug-c2", label: "Request NPS rating" },
  ],
};

// ---- AI-populated new workflow template ------------------------------------
// When a TL creates a new guided workflow, AI pre-populates stages with
// common conversation steps. These serve as starting scaffolding the TL
// edits, removes, or extends — never blank.

export const EMPTY_WORKFLOW = {
  id: null,
  title: "New Guided Workflow",
  description: "AI-generated conversation scaffold — edit each step to match your use case.",
  contactReason: "",
  jobToBeDone: "",
  scenario: "",
  triggers: [],
  successMetrics: [],
  language: "English (UK)",
  domain: "",
  state: "draft",
  author: { name: "AI Generated", initial: "AI", bg: "var(--avatar-violet-bg)", fg: "var(--avatar-violet-fg)" },
  createdAt: "2026-06-16",
  updatedAt: "2026-06-16",
  attachedPersonas: [],
  attemptsAllowed: 3,
  safetyWheelOn: true,
  stages: [
    {
      id: "open",
      steps: [
        {
          id: "new-s1",
          label: "Greet and identify the caller",
          detail: "Open with your name, brand, and confirm the reason for the call.",
          script: "Hello, you're through to [Brand], my name is [Name]. How can I help you today?",
          knowledgeCard: null,
          type: "compliance",
          mandatory: "required",
          grounding: "AI-generated — edit grounding references",
          subSteps: [],
        },
        {
          id: "new-s2",
          label: "Acknowledge and empathise",
          detail: "Show the customer you understand their situation before moving forward.",
          script: "I completely understand — let me look into this for you right away.",
          knowledgeCard: null,
          type: "action",
          mandatory: "recommended",
          grounding: "AI-generated — edit grounding references",
          subSteps: [],
        },
      ],
    },
    {
      id: "verify",
      steps: [
        {
          id: "new-s3",
          label: "Verify caller identity",
          detail: "Confirm at least two data points before accessing account details.",
          script: "For security, could I confirm your date of birth and the postcode on the account?",
          knowledgeCard: null,
          type: "compliance",
          mandatory: "required",
          grounding: "AI-generated — edit grounding references",
          subSteps: [
            { id: "new-ss1", label: "If verification fails → offer alternative method", mandatory: "conditional" },
          ],
        },
      ],
    },
    {
      id: "discover",
      steps: [
        {
          id: "new-s4",
          label: "Investigate the root cause",
          detail: "Use probing questions to understand the customer's actual need.",
          script: "Let me take a closer look at your account so we can understand exactly what's happened.",
          knowledgeCard: null,
          type: "action",
          mandatory: "required",
          grounding: "AI-generated — edit grounding references",
          subSteps: [],
        },
        {
          id: "new-s5",
          label: "Summarise findings to the customer",
          detail: "Play back what you've found in plain language to confirm alignment.",
          script: "So what I can see is [finding] — does that match what you're experiencing?",
          knowledgeCard: null,
          type: "action",
          mandatory: "required",
          grounding: "AI-generated — edit grounding references",
          subSteps: [],
        },
      ],
    },
    {
      id: "act",
      steps: [
        {
          id: "new-s6",
          label: "Present the resolution",
          detail: "Offer the best available solution, leading with value to the customer.",
          script: "Based on what we've found, here's what I can do for you — [resolution].",
          knowledgeCard: null,
          type: "action",
          mandatory: "required",
          grounding: "AI-generated — edit grounding references",
          subSteps: [
            { id: "new-ss2", label: "If customer declines → offer alternative", mandatory: "conditional" },
          ],
        },
        {
          id: "new-s7",
          label: "Confirm agreement and apply",
          detail: "Read back the agreed terms and apply the change on the account.",
          script: "Just to confirm — I've applied [action]. You'll see this reflected [when].",
          knowledgeCard: null,
          type: "compliance",
          mandatory: "required",
          grounding: "AI-generated — edit grounding references",
          subSteps: [],
        },
      ],
    },
    {
      id: "close",
      steps: [
        {
          id: "new-s8",
          label: "Recap and close",
          detail: "Summarise what was done and check if anything else is needed.",
          script: "We've taken care of [summary]. Is there anything else I can help with today?",
          knowledgeCard: null,
          type: "action",
          mandatory: "required",
          grounding: "AI-generated — edit grounding references",
          subSteps: [],
        },
      ],
    },
  ],
};
