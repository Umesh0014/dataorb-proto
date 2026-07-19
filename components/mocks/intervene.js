// Mock data for Intervene — customer-side proactive outreach command center.
// Architecture: Campaign (static cohort setting) -> Run (dated recruitment
// cycle, the audit boundary) -> recruited customers reviewed into
// shortlisted / dismissed / exported.

export const CAMPAIGNS = [
  {
    id: "camp-retention-b2b",
    name: "B2B Premium Retention",
    coverage: { lineOfBusiness: "B2B Premium", queue: "Retention", skill: "Account Care" },
    gating: ["Churn risk", "Relationship health low"],
    compounding: [
      { signal: "Repeat contacts (30d)", weight: 40 },
      { signal: "Negative sentiment", weight: 35 },
      { signal: "Competitor mention", weight: 25 },
    ],
    status: "active",
    createdAt: "2026-06-28",
  },
  {
    id: "camp-recover-billing",
    name: "Billing Recovery",
    coverage: { lineOfBusiness: "Consumer", queue: "Billing", skill: "Disputes" },
    gating: ["Unresolved issue"],
    compounding: [
      { signal: "Escalation flag", weight: 50 },
      { signal: "Repeat contacts (30d)", weight: 50 },
    ],
    status: "active",
    createdAt: "2026-07-02",
  },
  {
    id: "camp-convert-upsell",
    name: "Missed-Sale Follow-up",
    coverage: { lineOfBusiness: "Consumer", queue: "Sales", skill: "Upgrades" },
    gating: ["Buying signal, no close"],
    compounding: [
      { signal: "High LTV", weight: 60 },
      { signal: "Positive sentiment", weight: 40 },
    ],
    status: "archived",
    createdAt: "2026-05-19",
  },
];

export const RUNS = [
  {
    id: "run-0714",
    campaignId: "camp-retention-b2b",
    label: "Jul 14 – Jul 20",
    window: { start: "2026-07-14", end: "2026-07-20" },
    cutoff: "2026-07-14 00:00",
    state: "review", // recruiting | ready | review | exported | archived
    counts: { recruited: 14, shortlisted: 3, dismissed: 2, exported: 0 },
  },
  {
    id: "run-0707",
    campaignId: "camp-recover-billing",
    label: "Jul 7 – Jul 13",
    window: { start: "2026-07-07", end: "2026-07-13" },
    cutoff: "2026-07-07 00:00",
    state: "review",
    counts: { recruited: 9, shortlisted: 5, dismissed: 1, exported: 0 },
  },
  {
    id: "run-0630",
    campaignId: "camp-retention-b2b",
    label: "Jun 30 – Jul 6",
    window: { start: "2026-06-30", end: "2026-07-06" },
    cutoff: "2026-06-30 00:00",
    state: "exported",
    counts: { recruited: 11, shortlisted: 6, dismissed: 5, exported: 6 },
  },
  {
    id: "run-0623",
    campaignId: "camp-convert-upsell",
    label: "Jun 23 – Jun 29",
    window: { start: "2026-06-23", end: "2026-06-29" },
    cutoff: "2026-06-23 00:00",
    state: "archived",
    counts: { recruited: 18, shortlisted: 8, dismissed: 10, exported: 8 },
  },
];

// Lanes: retain (churn risk) / recover (unresolved issue) / convert (missed sale)
export const LANES = [
  { id: "retain", label: "Retain" },
  { id: "recover", label: "Recover" },
  { id: "convert", label: "Convert" },
];

// Recruited customers for run-0714 (the active review run).
// status: recruited | shortlisted | dismissed | exported
export const RECRUITS = [
  {
    id: "cust-4471",
    runId: "run-0714",
    customerId: "CU-4471",
    name: "Meridian Logistics",
    interactionId: "INT-88213",
    lane: "retain",
    priority: 92,
    signals: ["Churn risk", "Repeat contacts (30d)", "Competitor mention"],
    flags: ["In another run"],
    lastContact: "2026-07-12",
    contacts30d: 4,
    status: "recruited",
    sidecar: {
      lastConversation:
        "Called about renewal pricing. Asked twice whether the contract auto-renews and mentioned an offer from a competitor.",
      spokeWith: "Agent D. Okafor",
      painPoint: "Renewal price increase without notice",
      resolutionOffered: "Escalated to account team; no follow-up logged",
      whyFlagged: "Churn-risk model high; 4 contacts in 30 days; competitor named twice",
    },
    brief: null,
  },
  {
    id: "cust-2093",
    runId: "run-0714",
    customerId: "CU-2093",
    name: "Halstead & Co",
    interactionId: "INT-87904",
    lane: "retain",
    priority: 87,
    signals: ["Churn risk", "Negative sentiment"],
    flags: [],
    lastContact: "2026-07-11",
    contacts30d: 3,
    status: "recruited",
    sidecar: {
      lastConversation:
        "Frustrated about repeated outages affecting their storefront. Agent apologised; customer said 'this keeps happening'.",
      spokeWith: "Agent L. Mehta",
      painPoint: "Recurring service outages",
      resolutionOffered: "Credit applied; root cause not communicated",
      whyFlagged: "Negative sentiment trend across last 3 interactions",
    },
    brief: {
      summary:
        "Halstead & Co has contacted support 3 times in 30 days about recurring outages. Sentiment declined each time. A credit was applied but no root-cause explanation was given — the unresolved 'why' is the churn driver.",
      bestPlay: "Proactive reliability review call — worked for 8 of 11 similar outage-driven churn cases.",
    },
  },
  {
    id: "cust-8830",
    runId: "run-0714",
    customerId: "CU-8830",
    name: "Nova Retail Group",
    interactionId: "INT-88410",
    lane: "recover",
    priority: 81,
    signals: ["Unresolved issue", "Escalation flag"],
    flags: ["Previously contacted"],
    lastContact: "2026-07-13",
    contacts30d: 2,
    status: "recruited",
    sidecar: {
      lastConversation:
        "Billing dispute over duplicate invoice. Promised a callback within 48 hours; none logged.",
      spokeWith: "Agent S. Brandt",
      painPoint: "Duplicate invoice, broken callback promise",
      resolutionOffered: "Callback promised, not completed",
      whyFlagged: "Open escalation past SLA; broken commitment detected",
    },
    brief: null,
  },
  {
    id: "cust-1657",
    runId: "run-0714",
    customerId: "CU-1657",
    name: "Brightline Media",
    interactionId: "INT-87772",
    lane: "convert",
    priority: 78,
    signals: ["Buying signal, no close", "High LTV"],
    flags: [],
    lastContact: "2026-07-10",
    contacts30d: 1,
    status: "recruited",
    sidecar: {
      lastConversation:
        "Asked detailed questions about the analytics add-on and seat pricing. Agent answered but did not offer a follow-up.",
      spokeWith: "Agent J. Reyes",
      painPoint: "Wants advanced analytics; unclear on pricing tiers",
      resolutionOffered: "Questions answered; no next step set",
      whyFlagged: "Strong buying signals with no close attempt",
    },
    brief: null,
  },
  {
    id: "cust-5512",
    runId: "run-0714",
    customerId: "CU-5512",
    name: "Cobalt Financial",
    interactionId: "INT-88098",
    lane: "retain",
    priority: 74,
    signals: ["Churn risk", "Relationship health low"],
    flags: [],
    lastContact: "2026-07-09",
    contacts30d: 2,
    status: "shortlisted",
    sidecar: {
      lastConversation:
        "Requested usage export 'for an internal review'. Short, transactional tone; declined agent's offer to walk through new features.",
      spokeWith: "Agent D. Okafor",
      painPoint: "Disengaged; possible internal vendor review",
      resolutionOffered: "Export provided",
      whyFlagged: "Relationship-health score dropped 2 tiers this quarter",
    },
    brief: {
      summary:
        "Cobalt Financial is showing classic pre-churn disengagement: transactional requests, declined engagement, falling relationship-health score. The usage export request suggests an internal vendor review is underway.",
      bestPlay: "Executive check-in with ROI recap — retained 5 of 7 accounts in similar internal-review situations.",
    },
  },
  {
    id: "cust-3348",
    runId: "run-0714",
    customerId: "CU-3348",
    name: "Perch Home Goods",
    interactionId: "INT-88301",
    lane: "recover",
    priority: 71,
    signals: ["Unresolved issue", "Repeat contacts (30d)"],
    flags: [],
    lastContact: "2026-07-12",
    contacts30d: 3,
    status: "shortlisted",
    sidecar: {
      lastConversation:
        "Third call about a delayed integration fix. Customer is calm but noted they are 'keeping a log of all of this'.",
      spokeWith: "Agent L. Mehta",
      painPoint: "Integration bug open for 3 weeks",
      resolutionOffered: "Ticket escalated to engineering",
      whyFlagged: "3 repeat contacts on the same unresolved issue",
    },
    brief: null,
  },
  {
    id: "cust-9174",
    runId: "run-0714",
    customerId: "CU-9174",
    name: "Atlas Fitness",
    interactionId: "INT-87680",
    lane: "convert",
    priority: 66,
    signals: ["Buying signal, no close"],
    flags: [],
    lastContact: "2026-07-08",
    contacts30d: 1,
    status: "shortlisted",
    sidecar: {
      lastConversation:
        "Asked whether multi-location plans exist while resolving a password issue. Agent said yes; conversation ended there.",
      spokeWith: "Agent P. Nguyen",
      painPoint: "Expanding to new locations; unaware of multi-site plans",
      resolutionOffered: "Password reset completed",
      whyFlagged: "Expansion buying signal buried in a support call",
    },
    brief: null,
  },
  {
    id: "cust-6620",
    runId: "run-0714",
    customerId: "CU-6620",
    name: "Juniper Travel",
    interactionId: "INT-88155",
    lane: "retain",
    priority: 63,
    signals: ["Churn risk"],
    flags: [],
    lastContact: "2026-07-11",
    contacts30d: 2,
    status: "recruited",
    sidecar: {
      lastConversation:
        "Asked how to download historical reports. Mentioned 'wrapping things up before the busy season'.",
      spokeWith: "Agent S. Brandt",
      painPoint: "Ambiguous disengagement language",
      resolutionOffered: "Walked through report download",
      whyFlagged: "Churn-risk model medium-high; download-everything pattern",
    },
    brief: null,
  },
  {
    id: "cust-7385",
    runId: "run-0714",
    customerId: "CU-7385",
    name: "Redwood Dental",
    interactionId: "INT-87821",
    lane: "recover",
    priority: 58,
    signals: ["Unresolved issue"],
    flags: [],
    lastContact: "2026-07-10",
    contacts30d: 1,
    status: "dismissed",
    sidecar: {
      lastConversation:
        "Reported a minor display glitch in invoices. Workaround provided; fix scheduled in next release.",
      spokeWith: "Agent P. Nguyen",
      painPoint: "Cosmetic invoice glitch",
      resolutionOffered: "Workaround + fix scheduled",
      whyFlagged: "Issue technically open until release ships",
    },
    brief: null,
  },
  {
    id: "cust-1029",
    runId: "run-0714",
    customerId: "CU-1029",
    name: "Fairbanks Supply",
    interactionId: "INT-88367",
    lane: "convert",
    priority: 55,
    signals: ["Buying signal, no close", "Positive sentiment"],
    flags: [],
    lastContact: "2026-07-13",
    contacts30d: 1,
    status: "recruited",
    sidecar: {
      lastConversation:
        "Praised the new dashboard, asked 'what else is on the roadmap'. Agent shared the public roadmap link.",
      spokeWith: "Agent J. Reyes",
      painPoint: "None — expansion curiosity",
      resolutionOffered: "Roadmap shared",
      whyFlagged: "Positive engagement + roadmap interest = upsell window",
    },
    brief: null,
  },
  {
    id: "cust-4456",
    runId: "run-0714",
    customerId: "CU-4456",
    name: "Orchard Insurance",
    interactionId: "INT-87599",
    lane: "retain",
    priority: 52,
    signals: ["Relationship health low"],
    flags: [],
    lastContact: "2026-07-07",
    contacts30d: 1,
    status: "recruited",
    sidecar: {
      lastConversation:
        "Routine data question, answered quickly. No engagement with follow-up offer.",
      spokeWith: "Agent D. Okafor",
      painPoint: "Low engagement over two quarters",
      resolutionOffered: "Question answered",
      whyFlagged: "Relationship-health trending down slowly",
    },
    brief: null,
  },
  {
    id: "cust-8811",
    runId: "run-0714",
    customerId: "CU-8811",
    name: "Kestrel Labs",
    interactionId: "INT-88422",
    lane: "recover",
    priority: 49,
    signals: ["Unresolved issue"],
    flags: ["In another run"],
    lastContact: "2026-07-13",
    contacts30d: 2,
    status: "recruited",
    sidecar: {
      lastConversation:
        "API rate-limit questions after hitting caps twice this week. Agent raised a limit-increase request.",
      spokeWith: "Agent L. Mehta",
      painPoint: "API caps blocking their integration",
      resolutionOffered: "Limit increase requested, pending",
      whyFlagged: "Open request; also recruited in Billing Recovery run",
    },
    brief: null,
  },
  {
    id: "cust-2764",
    runId: "run-0714",
    customerId: "CU-2764",
    name: "Summit Auto Parts",
    interactionId: "INT-87730",
    lane: "convert",
    priority: 44,
    signals: ["Buying signal, no close"],
    flags: [],
    lastContact: "2026-07-09",
    contacts30d: 1,
    status: "dismissed",
    sidecar: {
      lastConversation:
        "Asked about API pricing casually while closing an unrelated ticket. No urgency expressed.",
      spokeWith: "Agent S. Brandt",
      painPoint: "None significant",
      resolutionOffered: "Pricing page shared",
      whyFlagged: "Weak buying signal, low confidence",
    },
    brief: null,
  },
  {
    id: "cust-9902",
    runId: "run-0714",
    customerId: "CU-9902",
    name: "Lumen Estates",
    interactionId: "INT-88477",
    lane: "retain",
    priority: 41,
    signals: ["Churn risk"],
    flags: [],
    lastContact: "2026-07-14",
    contacts30d: 1,
    status: "recruited",
    sidecar: {
      lastConversation:
        "Asked about contract end date. Said they were 'just checking' when the agent offered help with renewal.",
      spokeWith: "Agent P. Nguyen",
      painPoint: "Contract-end curiosity",
      resolutionOffered: "Date confirmed",
      whyFlagged: "Contract-end query is a leading churn indicator",
    },
    brief: null,
  },
];

// Signal options for the campaign-creation wizard.
export const GATING_SIGNALS = [
  "Churn risk",
  "Relationship health low",
  "Unresolved issue",
  "Buying signal, no close",
  "Escalation flag",
];

export const COMPOUNDING_SIGNALS = [
  "Repeat contacts (30d)",
  "Negative sentiment",
  "Competitor mention",
  "High LTV",
  "Positive sentiment",
  "Escalation flag",
];

export const COVERAGE_OPTIONS = {
  lineOfBusiness: ["B2B Premium", "Consumer", "SMB"],
  queue: ["Retention", "Billing", "Sales", "Support"],
  skill: ["Account Care", "Disputes", "Upgrades", "General"],
};

export function campaignById(id) {
  return CAMPAIGNS.find((c) => c.id === id) || null;
}

export function runById(id) {
  return RUNS.find((r) => r.id === id) || null;
}

export function recruitsForRun(runId) {
  return RECRUITS.filter((r) => r.runId === runId);
}
