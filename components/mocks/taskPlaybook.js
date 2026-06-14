// Task playbook mock — long-form artifact behind a task. Models the
// "Bill shock to better plan" billing-collections playbook shown in
// the spec. Sections render top-to-bottom; the same shape powers the
// TOC items in the left rail. Verification Checklist / Key
// Terminologies / Learning are placeholders (no items yet).

export const TASK_PLAYBOOK = {
  id: "654321",
  title: "Billing and collection",
  tag: "Retention",
  author: { name: "Javier Ruiz", initial: "J" },
  timestamp: "24 Mar 2026, 06:00 CET",

  overview: {
    headline: "How top agents use the billing inquiry as a natural entry point to place the customer on a plan that's better for them and better for the business — without ever feeling like a sales call.",
    body: "Triggered by a promotional rate expiring, or a plan that no longer matches their usage. They're not calling to buy — they're calling to complain. The company raised their price without warning.",
    chips: [
      "Billing & Collections",
      "Plan Optimisation",
      "Tariff Change",
      "Promotion Expiry",
      "Offer Accepted",
    ],
    whenToUse: "Triggered by a promotional rate expiring, or a plan that no longer matches their usage. They're not calling to buy — they're calling to complain. The company raised their price without warning.",
    customerProfile: "They'll tell the full story before asking for help. Decision-making is initially hesitant but becomes decisive once they see specific numbers that make sense.",
    keyPattern: "They'll tell the full story before asking for help. Decision-making is initially hesitant but becomes decisive once they see specific numbers that make sense.",
    emotionalContext: 'Customers arrive frustrated and often feel misled — they believe they were promised a rate that wasn\'t honoured, or that the company raised prices without warning. Some use language like "crooked" or "taken advantage of." This emotion is legitimate and must be addressed before any plan discussion. The agents who tried to shortcut the empathy phase and jump to "I have a great plan for you" lost the customer\'s attention. Resolve the feeling first, then present the solution.',
  },

  approach: {
    intro: "The approach below was reverse-engineered from the 150 highest-adherence interactions across Q1 2026. Six steps in order; each builds on the last. The first step is the one most agents skip.",
    steps: [
      {
        id: "step-1",
        title: "Listen without defending",
        body: "Let them tell the full story — what they expected, what they saw, how it made them feel. Do not interrupt, do not explain yet, and absolutely do not pitch yet. The customer needs to feel heard before they can hear you.",
        label: "OPENING",
        example: '"I hear you, and I can understand why that\'s frustrating — especially when you were expecting a specific amount. Let me pull up your account and we\'ll figure this out together."',
      },
      { id: "step-2", title: "Name the problem back", body: "Restate what the customer just told you in your own words. Don't paraphrase — repeat the specifics. They need to hear that you actually heard them, not that you're following a template." },
      { id: "step-3", title: "Explain the root cause", body: "Walk through why the bill increased. Promotion expiry, plan change, taxes — name the line item. Don't apologize for the price; explain what happened. Customers handle bad news once they understand it." },
      { id: "step-4", title: "Present the right plan", body: "Move from the problem to the solution in one step. Lead with the plan that fits their actual usage — not the highest tier you can sell. Quote the total with taxes included." },
      { id: "step-5", title: "Handle objections with patience", body: "Objections are not rejections — they're requests for clarity. If the customer pushes back on price, restate the value. If they push back on commitment, explain the trade-off. Never argue." },
      { id: "step-6", title: "Close, confirm, and set expectations", body: "Ask the direct question: \"Would you like me to go ahead with this?\" Then read back the plan, the total monthly cost, and the end date of any promotional pricing. The customer should leave the call knowing exactly what they signed up for." },
    ],
  },

  customerQuestions: [
    {
      id: "q-1",
      question: '"Is that price before or after taxes?"',
      step: 4,
      answer: "Always quote the total including taxes and fees. The number on the bill is the number the customer remembers. If you quote pre-tax, the first bill will feel like another surprise.",
    },
    { id: "q-2", question: '"What happens when this promotion ends?"', step: 5, answer: "Tell them the exact end date and the post-promotion rate. Then confirm whether you'll proactively notify them 30 days before. Surprise rate increases are why they called in the first place." },
    { id: "q-3", question: '"Is this a contract?"', step: 5, answer: "Most plans are no-contract. If yours is, state the term length and the early-termination fee upfront. Don't bury it." },
    { id: "q-4", question: '"Do I need the streaming services that come with it?"', step: 4, answer: "If they don't use them, offer the lower-tier plan without bundles. Right-sizing builds trust. A customer who feels oversold leaves at the next opportunity." },
    { id: "q-5", question: '"Can I get a credit for the months I overpaid?"', step: 6, answer: "Check the goodwill credit matrix — up to two months of service is in-policy without supervisor approval. Apply the credit, name it on the call, and confirm it'll appear on the next bill." },
  ],

  challenges: [
    {
      id: "c-1",
      title: '"Can you get it any lower? / I want my old rate back."',
      tag: { label: "Price Pressure", tone: "danger" },
      answer: "Don't apologize for the price — explain what it includes. If a lower-tier option exists, present it honestly with the tradeoffs. Let the customer choose between value and savings rather than arguing about a number.",
    },
    { id: "c-2", title: '"How do I know the price won\'t jump again?"', tag: { label: "Trust Gap", tone: "warning" }, answer: "Confirm the rate-lock window in writing. Set the expectation that you (or someone on the team) will proactively reach out 30 days before any promotional period ends." },
    { id: "c-3", title: '"I don\'t need all that / I barely use what I have."', tag: { label: "Right-Size", tone: "info" }, answer: "Move to the smaller plan with no hesitation. Customers who hear \"the smaller plan would save you $X/month\" remember that exchange next time they consider switching carriers." },
  ],

  pitfalls: [
    { id: "p-1", label: "PITCHING BEFORE RESOLVING", body: "The customer called about a billing problem. If you present a new plan before explaining why their bill increased, it feels like a sales call — and they'll resist everything you offer." },
    { id: "p-2", label: "QUOTING PRE-TAX PRICES",      body: 'The customer compares what they see on their bill. If you say "$65" and the bill says "$86.29," you\'ve just recreated the problem they called about. Always quote the total.' },
    { id: "p-3", label: "OVERSELLING THE PLAN",        body: "Pushing a higher tier when the customer says they don't use much. Right-sizing builds trust. A customer who feels oversold will leave at the next opportunity." },
    { id: "p-4", label: "HIDING THE END DATE",         body: "Not telling the customer when the guarantee ends. They'll find out in 12 months when the same bill shock happens — and next time, they won't call. They'll just leave." },
  ],

  whyItWorks: "The customer didn't call to buy a new plan. They called because their bill felt wrong. The agents who succeeded treated the plan change as the resolution to the billing problem — not as a separate commercial pitch. The plan is the fix. That framing is everything. When the agent explains why the bill increased (step 3) and then says \"here's what I can do to fix that\" (step 4), the customer hears a solution, not a pitch. The objection handling that follows isn't adversarial — it's the customer making sure the solution is real. The critical insight: the closing technique across all source interactions was a simple direct ask — \"Would you like me to go ahead with this?\" No pressure, no urgency tactics, no limited-time framing. When the foundation is right, the close is easy.",

  competitorContext: {
    intro: "Customers regularly bring up the competition mid-call. Don't disparage; acknowledge the specific concern and redirect to the actual differentiator.",
    competitors: [
      {
        id: "comp-1",
        name: "Verizon",
        mention: "coverage quality in rural areas, mobile service loyalty",
        guidance: "Acknowledge coverage needs without disparaging. Note that Xfinity uses the same towers — don't claim superiority, state the fact.",
      },
      { id: "comp-2", name: "Unspecified Competitor", mention: "generic price comparison without a named carrier", guidance: 'Ask "which carrier and which plan?" before counter-pricing. Customers often quote a tariff that doesn\'t exist or includes promotional pricing that\'ll expire in months.' },
    ],
  },

  sources: [
    { id: "src-1", topic: "Opening Greetings",     channel: "voice",    date: "Dec 4, 2019 1:42 pm", agent: "WW", sentiment: "positive", adherence: 68 },
    { id: "src-2", topic: "Resolution Quality",    channel: "chat",     date: "Dec 4, 2019 1:42 pm", agent: "JM", sentiment: "negative", adherence: 72 },
    { id: "src-3", topic: "Communication",         channel: "voice",    date: "Dec 4, 2019 1:42 pm", agent: "AR", sentiment: "positive", adherence: 78 },
    { id: "src-4", topic: "Proactive Follow-Up",   channel: "email",    date: "Dec 4, 2019 1:42 pm", agent: "SP", sentiment: "mixed",    adherence: 58 },
    { id: "src-5", topic: "Tone",                  channel: "whatsapp", date: "Dec 4, 2019 1:42 pm", agent: "DK", sentiment: "neutral",  adherence: 90 },
  ],
  totalSources: 150,
  pagesTotal: 22,

  // contributors — the agents whose interactions built this playbook. Distilled
  // from the 150 source interactions; ordered by contribution count. Each card
  // carries the agent's dominant pattern + a sample quote (what they typically
  // said at the step they exemplify). Drives the source-evidence grid in V1/V3
  // and the pinned-source-strip avatar cluster in V2.
  contributors: [
    {
      id: "WW",
      initial: "WW",
      name: "Whitney Wong",
      interactions: 47,
      adherenceLow: 64,
      adherenceHigh: 92,
      dominantSentiment: "positive",
      pattern: "Strongest at step 1 — listening without defending.",
      quote: "I hear you, and I can understand why that's frustrating — especially when you were expecting a specific amount.",
    },
    {
      id: "JM",
      initial: "JM",
      name: "Jamal Morris",
      interactions: 34,
      adherenceLow: 58,
      adherenceHigh: 88,
      dominantSentiment: "negative",
      pattern: "Re-frames objections as requests for clarity — step 5.",
      quote: "That's a fair concern. Let me walk you through exactly what changes after the promo and what stays the same.",
    },
    {
      id: "AR",
      initial: "AR",
      name: "Ana Rivera",
      interactions: 31,
      adherenceLow: 70,
      adherenceHigh: 94,
      dominantSentiment: "positive",
      pattern: "Quotes the total post-tax number, every time — step 4.",
      quote: "Your total each month, with taxes and the equipment fee, will be $86.29. Same number you'll see on the bill.",
    },
    {
      id: "SP",
      initial: "SP",
      name: "Sam Patel",
      interactions: 24,
      adherenceLow: 52,
      adherenceHigh: 80,
      dominantSentiment: "mixed",
      pattern: "Sets the end-date expectation upfront — step 6.",
      quote: "This rate is locked in through March 2027. Around February I'll reach out — no surprises.",
    },
    {
      id: "DK",
      initial: "DK",
      name: "Diane Kim",
      interactions: 14,
      adherenceLow: 76,
      adherenceHigh: 96,
      dominantSentiment: "neutral",
      pattern: "Right-sizes — moves customers to a smaller plan without hesitation.",
      quote: "Looking at what you actually use, the smaller plan saves you about $18 a month. Want me to switch you over?",
    },
  ],
  sourceWindow: "Q1 2026",
};

// Sentiment → chip palette. Matches existing app tone tokens — Positive
// green, Negative red, Neutral gray, Mixed amber. Confirmed in spec §A8 #5.
export const SENTIMENT_TONE = {
  positive: { bg: "var(--color-success-bg)",  fg: "var(--color-success-text)" },
  negative: { bg: "var(--color-error-bg)",    fg: "var(--color-error-text)"   },
  neutral:  { bg: "#F1F5F9",                  fg: "#475569"                   },
  mixed:    { bg: "var(--color-warning-bg)",  fg: "var(--color-warning-text)" },
};

// Adherence color thresholds — ≥70 green / 50–70 amber / <50 red.
export function adherenceTone(pct) {
  if (pct >= 70) return "var(--color-success)";
  if (pct >= 50) return "var(--color-warning)";
  return "var(--color-error)";
}

// Challenge-row label palette
export const CHALLENGE_TONE = {
  danger:  { bg: "#FFEDEA", fg: "#690005" },
  warning: { bg: "#FFF7E8", fg: "#7A4B00" },
  info:    { bg: "var(--color-icon-tertiary-bg)", fg: "var(--color-icon-tertiary-fg)" },
};
