// Coaching Brief artifact mock for the Ask Mira Pro task record view.
// Section-driven and schema-versioned: each section carries a `type` and
// a `schemaVersion` so a v1 brief always renders in v1 UI even after a
// later schema ships. The prototype maps every task onto this one brief —
// only the task id varies. Replace with a real per-task fetch later.

const SECTIONS = [
  {
    type: "overview",
    schemaVersion: 1,
    agentName: "María González",
    generatedAt: "2026-03-24T06:00:00Z",
    period: "21 Apr – 27 Apr",
    brand: "MasOrange B2C",
    service: "Retention",
    teamLead: "Javier Ruiz",
    sampleSize: "38/47 interactions evaluated",
    kpis: [
      { label: "Churn Prevention", value: "82%", trend: "positive", delta: "4 pp vs prior week" },
      { label: "Overall QA Score", value: "88%", trend: "positive", delta: "3 pp vs prior week" },
      { label: "Avg. Handle Time", value: "7m 12s", trend: "negative", delta: "18s vs prior week" },
      { label: "Sentiment Improved", value: "71%", trend: "neutral", delta: "On target" },
    ],
  },
  {
    type: "adherence",
    schemaVersion: 1,
    lastUpdatedBy: "Javier Ruiz",
    execNarrative:
      "María delivered a strong week on retention calls, holding churn-prevention outcomes four points above her prior week and well clear of the org average. Discovery and rapport-building were consistent strengths — she opened nearly every call by surfacing the customer's underlying reason for leaving before discussing price.\n\nThe one consistent gap is offer positioning. On calls where the first retention offer was declined, María moved to the next discount rather than re-framing the value of the current plan. Closing that gap is the fastest route to lifting her save rate further.",
    benchmarks: [
      { area: "Discovery & Needs Assessment", agentRate: "91%", orgAvg: "84%", topAvg: "95%", vsOrg: "+7.0pp", vsOrgTone: "positive" },
      { area: "Retention Offer Positioning", agentRate: "68%", orgAvg: "76%", topAvg: "89%", vsOrg: "−8.0pp", vsOrgTone: "negative" },
      { area: "Objection Handling", agentRate: "54%", orgAvg: "71%", topAvg: "86%", vsOrg: "−17.0pp", vsOrgTone: "negative" },
      { area: "Empathy & Sentiment Recovery", agentRate: "88%", orgAvg: "80%", topAvg: "92%", vsOrg: "+8.0pp", vsOrgTone: "positive" },
      { area: "GDPR & Compliance Adherence", agentRate: "100%", orgAvg: "97%", topAvg: "100%", vsOrg: "+3.0pp", vsOrgTone: "positive" },
    ],
    closingNarrative:
      "Overall adherence is healthy and trending up. Prioritising objection handling and offer positioning in this week's 1:1 should compound across every retention call María takes.",
    source: "AutoQA Scorecard · 38 Evaluated Interactions",
    benchmark: "Org Avg (N=312 Agents) · Top Performer (P90, N=31)",
  },
  {
    type: "focus-area",
    schemaVersion: 1,
    lastUpdatedBy: "Javier Ruiz",
    intro:
      "This section breaks down the five focus areas locked when this brief was generated. Each area pairs what is already working with the one or two changes that would move the score most.",
    areas: [
      {
        name: "Discovery & Needs Assessment",
        score: 91,
        statusChip: { label: "34/38 effective", kind: "neutral" },
        whatsWorking: {
          bullets:
            "Opens calls by asking why the customer is considering leaving before any price discussion.\nParaphrases the customer's stated reason back to them, confirming she understood it correctly.\nUses open questions to surface secondary pain points the customer did not raise first.",
          sample: "25/25 Observations Sampled",
        },
        whereToFocus: {
          bullets:
            "On four calls she moved to an offer before fully confirming the customer's primary concern.",
          sample: "4 Coaching Flags This Period",
        },
      },
      {
        name: "Retention Offer Positioning",
        score: 68,
        statusChip: { label: "Primary Focus", kind: "primary" },
        whatsWorking: {
          bullets:
            "Presents the first retention offer clearly, with the monthly figure and contract term stated up front.\nChecks the customer's reaction before moving on rather than stacking offers.",
          sample: "21/31 Observations Sampled",
        },
        whereToFocus: {
          bullets:
            "When the first offer is declined, she jumps to a deeper discount instead of re-framing the value of the current plan.\nRarely connects the offer back to the specific pain point raised during discovery.\nDoes not anchor the discount against the cost of switching providers.",
          sample: "10 Coaching Flags This Period",
        },
      },
      {
        name: "Objection Handling",
        score: 54,
        statusChip: { label: "19/38 effective", kind: "neutral" },
        whatsWorking: {
          bullets:
            "Stays calm and does not interrupt when the customer pushes back.",
          sample: "8/19 Observations Sampled",
        },
        whereToFocus: {
          bullets:
            "Treats objections as a signal to end the call rather than a question to answer.\nDoes not acknowledge the objection before responding, so customers repeat themselves.\nMisses the chance to isolate the objection — checking whether price is the only blocker.",
          sample: "19 Coaching Flags This Period",
        },
      },
      {
        name: "GDPR & Compliance Adherence",
        score: 100,
        statusChip: { label: "38/38 effective", kind: "neutral" },
        whatsWorking: {
          bullets:
            "Completes identity verification on every call before discussing account details.\nReads the data-handling disclosure verbatim and confirms consent before proceeding.",
          sample: "38/38 Observations Sampled",
        },
        whereToFocus: { empty: true },
      },
    ],
  },
  {
    type: "coaching-actions",
    schemaVersion: 1,
    lastUpdatedBy: "Javier Ruiz",
    reinforcementSubject: "RECOGNIZE GDPR EXCELLENCE + SENTIMENT RECOVERY",
    reinforcementNarrative:
      "Open the 1:1 by recognising María's flawless compliance record and her eight-point lead on sentiment recovery. She has earned the credibility to take on a harder skill — name that explicitly before moving into the focus areas.",
    actions: [
      {
        title: "Re-frame value before discounting",
        description:
          "Role-play the moment a first offer is declined. Practise restating the value of the customer's current plan against their stated pain point before any deeper discount is offered.",
        impact: "Lifts offer-positioning adherence toward the 76% org average.",
      },
      {
        title: "Acknowledge, then isolate the objection",
        description:
          "Coach a two-step habit: acknowledge the objection in the customer's own words, then ask one question to confirm whether price is the only blocker before responding.",
        impact: "Targets the 17pp objection-handling gap vs. org.",
      },
      {
        title: "Confirm the primary concern before offering",
        description:
          "Reinforce the discovery habit on the four flagged calls — confirm and paraphrase the customer's main reason for leaving before introducing any retention offer.",
        impact: "Protects the existing 91% discovery score as offer skills grow.",
      },
    ],
    closingNarrative:
      "Actions are prioritised by expected impact on María's retention outcomes. Objection handling is the largest gap, but offer positioning is the fastest to move — start there if only one habit can change this week.",
  },
];

export const COACHING_BRIEF = {
  agentName: "María González",
  skill: { category: "Coaching", tint: "purple", iconName: "Target" },
  sections: SECTIONS,
};

// getCoachingBrief — the brief for a task. Every task resolves to the
// same artifact in the prototype; only the task id is stamped in.
export function getCoachingBrief(taskId) {
  return { ...COACHING_BRIEF, taskId: taskId || "654321" };
}
