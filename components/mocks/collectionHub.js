// collectionHub.js — Collection Insights hub mock data.
// All values transcribed from the Figma "Collection Insights" frame.
// Consumed by CollectionHubPage; no component logic here.

// ---- Hero stat ----
export const HERO = {
  label: "Total Calls",
  value: "50,000",
  sparkline: [18, 22, 20, 28, 35, 30, 38, 42, 36, 44, 40, 48],
};

// ---- KPIs and Goals ----
export const KPIS = [
  {
    id: "pos-efficiency",
    label: "POS Efficiency",
    value: "10%",
    trend: { direction: "up", delta: "4%", tone: "success" },
    status: { label: "Needs Attention", color: "#BA1A1A" },
    target: { label: "Target: 43%", pct: 9 },
    bar: { fill: "#F87171", checkpoint: 44 },
  },
  {
    id: "recovery-rate",
    label: "Recovery Rate Conversion",
    value: "18%",
    sub: "of verified contacts",
    trend: { direction: "down", delta: "7%", tone: "error" },
    status: { label: "Nearly There", color: "#B57E12" },
    target: { label: "Target: 25%", pct: 22 },
    bar: { fill: "#FBBF24", checkpoint: 22 },
  },
  {
    id: "useful-contact-rate",
    label: "Useful Contact Rate",
    value: "28%",
    sub: "of total dials",
    trend: { direction: "up", delta: "3%", tone: "success" },
    status: { label: "On Track", color: "#00711D" },
    target: { label: "Target: 35%", pct: 37 },
    bar: { fill: "#34D399", checkpoint: 37 },
  },
];

export const KPI_PAGINATION = { total: 5, current: 1, perPage: 2 };

// ---- V1: Master KPI grouping ----
// Draft taxonomy — flag for Akash/Sandeep, not locked.
// Status rollup = worst-child (not average). A single below-target child
// turns the master red so failing KPIs cannot hide.
// Status levels: flag wording for Neil/Akash.
export const KPI_STATUS_LEGEND = [
  { label: "On Track", color: "#00711D", bg: "#F0FDF4", zone: "#34D399" },
  { label: "Nearly There", color: "#B57E12", bg: "#FFFBEB", zone: "#FBBF24" },
  { label: "Needs Attention", color: "#BA1A1A", bg: "#FEF2F2", zone: "#F87171" },
  { label: "Critical", color: "#7F1D1D", bg: "#FEF2F2", zone: "#EF4444" },
];

export const KPI_V1_MASTERS = [
  {
    id: "reach",
    name: "Reach",
    description: "How reliably we connect with the right party — and how much effort it takes.",
    score: 38,
    children: [
      {
        id: "contactability",
        label: "Contactability",
        value: "42%",
        descriptor: "of total dials",
        trend: { direction: "up", delta: "5%", tone: "success" },
        target: 55,
        gap: -13,
        status: { label: "Nearly There", color: "#B57E12" },
      },
      {
        id: "effort",
        label: "Effort",
        value: "3.2",
        descriptor: "avg attempts per contact",
        trend: { direction: "down", delta: "0.4", tone: "success" },
        target: 2.5,
        gap: 0.7,
        status: { label: "Needs Attention", color: "#BA1A1A" },
      },
      {
        id: "efficiency",
        label: "Efficiency",
        value: "10%",
        descriptor: "POS per useful contact",
        trend: { direction: "up", delta: "4%", tone: "success" },
        target: 43,
        gap: -33,
        status: { label: "Needs Attention", color: "#BA1A1A" },
      },
    ],
  },
  {
    id: "recovery",
    name: "Recovery",
    description: "How effectively those contacts convert into payment.",
    score: 52,
    children: [
      {
        id: "negotiation",
        label: "Negotiation",
        value: "34%",
        descriptor: "successful outcomes",
        trend: { direction: "up", delta: "6%", tone: "success" },
        target: 40,
        gap: -6,
        status: { label: "Nearly There", color: "#B57E12" },
      },
      {
        id: "rescheduled-call",
        label: "Rescheduled Call Success Rate",
        value: "51%",
        descriptor: "of rescheduled contacts",
        trend: { direction: "up", delta: "3%", tone: "success" },
        target: 45,
        gap: 6,
        status: { label: "On Track", color: "#00711D" },
      },
      {
        id: "point-of-sale",
        label: "Point of Sale",
        value: "18%",
        descriptor: "of verified contacts",
        trend: { direction: "down", delta: "7%", tone: "error" },
        target: 25,
        gap: -7,
        status: { label: "Needs Attention", color: "#BA1A1A" },
      },
    ],
  },
  {
    id: "quality-compliance",
    name: "Quality & Compliance",
    description: "How well agents handle calls, and whether they stay within the rules.",
    score: 74,
    children: [
      {
        id: "effective-comm",
        label: "Effective Communication Rate",
        value: "72%",
        descriptor: "of scored interactions",
        trend: { direction: "up", delta: "2%", tone: "success" },
        target: 80,
        gap: -8,
        status: { label: "Nearly There", color: "#B57E12" },
      },
      {
        id: "failed-comm",
        label: "Failed Communication Rate",
        value: "8%",
        descriptor: "of total attempts",
        trend: { direction: "down", delta: "1%", tone: "success" },
        target: 5,
        gap: 3,
        status: { label: "Nearly There", color: "#B57E12" },
      },
      {
        id: "compliance-score",
        label: "Compliance Score",
        value: "91%",
        descriptor: "weighted avg",
        trend: { direction: "up", delta: "1%", tone: "success" },
        target: 85,
        gap: 6,
        status: { label: "On Track", color: "#00711D" },
      },
    ],
  },
];

// ---- AI Artifacts ----
export const AI_ARTIFACTS = [
  {
    id: "rebuttal-scripts",
    title: "Rebuttal Script Library",
    description: "Provide agents with proven, effective responses to each objection type",
    frequency: "Weekly or on demand per obj. category",
    gradient: "linear-gradient(180deg, #E0C3FC 0%, #8EC5FC 100%)",
  },
  {
    id: "top-performer",
    title: "Top Performer Playbook",
    description: "Codify what top agents do differently so it can be taught to others",
    frequency: "Monthly or when onboarding new agents",
    gradient: "linear-gradient(180deg, #FFDEE9 0%, #B5FFFC 100%)",
  },
  {
    id: "objection-recovery",
    title: "Objection Recovery Analysis",
    description: "Deep dive into how successful agents recover from specific objection types",
    frequency: "Weekly, prioritised by Coaching Priority score",
    gradient: "linear-gradient(180deg, #A1C4FD 0%, #C2E9FB 100%)",
  },
];

// ---- Conversation Flow Analysis ----
export const CONVERSATION_FLOW = {
  tabs: ["Core Collection Path", "Interaction Events", "Coaching Priority"],
  activeTab: "Core Collection Path",
  subtitle: "Stage presence patterns and outcome correlation across useful contacts.",
  compliance: "Full Compliance: All 5 mandatory stages present",
  legend: [
    { label: "On Target (> 90%)", color: "#10B981" },
    { label: "Meets Expectations (70–90%)", color: "#FBBF24" },
    { label: "Needs Attention (< 70%)", color: "#FB7185" },
  ],
  stages: [
    { label: "Agent\nPresentation", green: 78, amber: 16, pink: 6 },
    { label: "Identity\nVerification", green: 94, amber: 4, pink: 2 },
    { label: "GDPR\nNotice", green: 62, amber: 22, pink: 16 },
    { label: "Debt\nCommunication", green: 78, amber: 10, pink: 12 },
    { label: "Call\nConclusion", green: 73, amber: 16, pink: 11 },
  ],
};

// ---- Conversation Flow — Tab 2: Interaction Events ----
export const INTERACTION_EVENTS = {
  subtitle: "Stage adherence and outcome correlation across useful contacts.",
  chartLabel: "Interaction event frequency across call stages — resistance vs standard process.",
  legend: [
    { label: "Resistance", color: "#FBBF24", hasToggle: true },
    { label: "Standard Process", color: "#818CF8" },
  ],
  stages: [
    { label: "Resistance\nEncountered", resistance: 88, standard: 12 },
    { label: "Standard\nProcess", resistance: 57, standard: 43 },
  ],
};

// ---- Conversation Flow — Tab 3: Coaching Priority ----
export const COACHING_PRIORITY = {
  subtitle: "Stage adherence and outcome correlation across useful contacts.",
  columns: ["Call Stage", "Adherence", "Coaching Opportunity Score", "Priority Score"],
  rows: [
    { stage: "Opening Greetings", adherence: "92%", opportunity: 74, priority: "-8%", priorityColor: "#BA1A1A" },
    { stage: "Identity Verification", adherence: "63%", opportunity: 62, priority: "-9%", priorityColor: "#BA1A1A" },
    { stage: "GDPR Notice", adherence: "89%", opportunity: 90, priority: "-9%", priorityColor: "#BA1A1A" },
    { stage: "Debt Communication", adherence: "28%", opportunity: 33, priority: "-8%", priorityColor: "#BA1A1A" },
    { stage: "Call Conclusion", adherence: "27%", opportunity: 93, priority: "-5%", priorityColor: "#BA1A1A" },
  ],
  pagination: { total: 5, current: 1, totalPages: 22 },
};

// ---- Customer Sentiment Analysis ----
export const SENTIMENT = {
  tabs: ["By Outcome", "Critical Stages", "Sentiment Breakdown"],
  activeTab: "By Outcome",
  subtitle: "Sentiment impact on Collection Outcomes",
  chartLabel: "Shows % of calls with positive sentiment at each stage",
  legend: [
    { label: "Payment secured", color: "#34D399", style: "pill-filled" },
    { label: "Pipeline", color: "#60A5FA", style: "pill-outline" },
    { label: "Refused", color: "#FB7185", style: "pill-outline" },
  ],
  series: {
    "Payment secured": [35, 50, 55, 48, 30],
    Pipeline: [28, 32, 42, 38, 22],
    Refused: [20, 25, 18, 22, 8],
  },
  xLabels: [
    "Agent\nPresentation",
    "Identity\nVerification",
    "GDPR\nNotice",
    "Debt\nCommunication",
    "Call\nConclusion",
  ],
  yLabels: ["100%", "75%", "50%", "25%", "0%"],
};

// ---- Customer Objections ----
export const OBJECTIONS = {
  tabs: ["By Category", "By Outcome", "Coaching Priority"],
  activeTab: "By Category",
  subtitle: "Objection patterns and rebuttal effectiveness",
  stats: [
    { label: "Objection Rate", value: "29%", sub: "(14,400)" },
    { label: "Resistance Intensity", value: "1.4", sub: "avg per disputed call" },
    { label: "Rebuttal Success", value: "43%", sub: "rated effective" },
    { label: "Objection Recovery", value: "34%", sub: "ending in payment" },
  ],
  chartLabel: "Effectiveness of agent responses by objection type",
  legend: [
    { label: "Effective", color: "#34D399" },
    { label: "Neutral", color: "#60A5FA" },
    { label: "Ineffective", color: "#FB7185" },
  ],
  categories: [
    { label: "Dispute", effective: 34, neutral: 25, ineffective: 41 },
    { label: "Non Recog.", effective: 44, neutral: 22, ineffective: 34 },
    { label: "Financial", effective: 34, neutral: 32, ineffective: 34 },
    { label: "Timing", effective: 44, neutral: 22, ineffective: 34 },
    { label: "3rd Party", effective: 69, neutral: 21, ineffective: 10 },
    { label: "Channel", effective: 35, neutral: 29, ineffective: 36 },
    { label: "Hard Refuse", effective: 3, neutral: 5, ineffective: 92 },
    { label: "Already Paid", effective: 93, neutral: 4, ineffective: 3 },
    { label: "Other", effective: 39, neutral: 22, ineffective: 39 },
  ],
};

// ---- Contact Outcome ----
export const CONTACT_OUTCOME = {
  tabs: ["By Outcome", "By Disposition", "Outcome Trends"],
  activeTab: "By Outcome",
  subtitle: "Call disposition and conversion rates",
  summary: [
    { label: "Useful Outcome", value: "55%", sub: "(21,500 calls)" },
    { label: "Not Useful Outcome", value: "45%", sub: "(22,000 calls)" },
  ],
  donut: [
    { label: "Payment Secured", count: 12500, pct: 30, color: "#34D399" },
    { label: "Pipeline", count: 15000, pct: 36, color: "#60A5FA" },
    { label: "Refused", count: 14000, pct: 34, color: "#F87171" },
    { label: "Contact Failed", count: 14000, pct: 34, color: "#9CA3AF" },
  ],
  tableHeader: "Useful Call Outcomes",
  tableColumns: ["", "Distribution", "% Distribution"],
};

// ---- Quality Adherence ----
export const QUALITY_ADHERENCE = {
  tabs: ["Trend", "By Scorecard", "By Category", "By Metric"],
  activeTab: "Trend",
  subtitle:
    "Track how every interaction measures up against your quality, process, and performance standards.",
  toggleOptions: ["Trend", "Compare"],
  activeToggle: "Trend",
  legend: [
    { label: "Sales Scorecard", color: "#2DD4BF", style: "solid" },
    { label: "Select Scorecard 2", color: "#E879F9", style: "dropdown" },
    { label: "Select Scorecard 3", color: "#22D3EE", style: "dropdown" },
    { label: "Target", color: "#004BEF", style: "dashed" },
  ],
  xLabels: [
    "Jan 25", "Feb 25", "Mar 25", "Apr 25", "May 25", "Jun 25",
    "Jul 25", "Aug 25", "Sep 25", "Oct 25", "Nov 25", "Dec 25",
  ],
  yLabels: ["100%", "80%", "60%", "40%", "20%", "0%"],
  series: {
    "Sales Scorecard": [30, 35, 38, 32, 36, 40, 55, 48, 58, 64, 78, 70],
  },
  targetLine: 60,
};

// ---- V1: Next Best Actions ----
// Collection-hub NBA cards — each targets a specific metric/master with
// estimated point uplift. Basis = cohort/model estimate (Akash to define).
// Shape mirrors Agent Profile NBA_CARDS for visual consistency.
export const KPI_V1_NBAS = [
  {
    id: "kpi-nba-1",
    priority: "critical",
    title: "Reinforce call opening protocol",
    evidence: "Opening Greetings adherence dropped 8% — dragging Reach score down.",
    action: { type: "Assign drill", asset: "Proper Greeting Protocol", duration: "10 min" },
    outcome: "+5 pts · Reach",
    basis: "Based on 142-agent cohort over 30 days",
    master: "reach",
  },
  {
    id: "kpi-nba-2",
    priority: "critical",
    title: "Improve debt communication scripts",
    evidence: "Debt Communication at 28% adherence — lowest stage across all teams.",
    action: { type: "Assign drill", asset: "Debt Communication Mastery", duration: "15 min" },
    outcome: "+8 pts · Recovery",
    basis: "Based on top-performer playbook analysis",
    master: "recovery",
  },
  {
    id: "kpi-nba-3",
    priority: "recommended",
    title: "Strengthen GDPR notice delivery",
    evidence: "GDPR Notice at 62% on-target — 16% in Needs Attention zone.",
    action: { type: "Assign course", asset: "GDPR Compliance Training", duration: "20 min" },
    outcome: "+4 pts · Quality & Compliance",
    basis: "Based on 89-agent cohort with similar gap",
    master: "quality-compliance",
  },
  {
    id: "kpi-nba-4",
    priority: "recommended",
    title: "Target POS conversion uplift",
    evidence: "POS Efficiency at 10% vs 43% target — biggest gap-to-target in portfolio.",
    action: { type: "Assign drill", asset: "Closing Techniques for Collections", duration: "12 min" },
    outcome: "+6 pts · Reach",
    basis: "Based on rescheduled-call conversion patterns",
    master: "reach",
  },
];

// ---- V2: At risk / On track categories ----
// All 9 KPIs. category: "at-risk" | "on-track" | "no-data".
// At-risk cards sorted worst-first; critical flag = 2px accent border.
// Fix uses typed Learning Hub asset: Guide / Drill / Mission / Probe.
// Categorisation threshold is an open decision (Akash).
export const KPI_V2_ALL = [
  // -- At risk (below target, worst-first by gap) --
  {
    id: "v2-efficiency",
    label: "POS Efficiency",
    value: "10%",
    descriptor: "POS per useful contact",
    target: 43,
    gapLabel: "33 pts below",
    trend: { direction: "up", delta: "4%", tone: "success" },
    category: "at-risk",
    critical: true,
    fix: {
      type: "Mission",
      asset: "POS Conversion Uplift",
      cohort: "12 agents below 15% POS",
    },
  },
  {
    id: "v2-contactability",
    label: "Contactability",
    value: "42%",
    descriptor: "of total dials",
    target: 55,
    gapLabel: "13 pts below",
    trend: { direction: "up", delta: "5%", tone: "success" },
    category: "at-risk",
    critical: true,
    fix: {
      type: "Guide",
      asset: "Right-Party Contact Playbook",
      cohort: "8 agents below 40%",
    },
  },
  {
    id: "v2-effective-comm",
    label: "Effective Communication",
    value: "72%",
    descriptor: "of scored interactions",
    target: 80,
    gapLabel: "8 pts below",
    trend: { direction: "up", delta: "2%", tone: "success" },
    category: "at-risk",
    critical: false,
    fix: {
      type: "Drill",
      asset: "Objection Handling",
      cohort: "18 agents below 75%",
    },
  },
  {
    id: "v2-pos",
    label: "Point of Sale",
    value: "18%",
    descriptor: "of verified contacts",
    target: 25,
    gapLabel: "7 pts below",
    trend: { direction: "down", delta: "7%", tone: "error" },
    category: "at-risk",
    critical: false,
    fix: {
      type: "Drill",
      asset: "Debt Communication Mastery",
      cohort: "22 agents below 20%",
    },
  },
  {
    id: "v2-negotiation",
    label: "Negotiation",
    value: "34%",
    descriptor: "successful outcomes",
    target: 40,
    gapLabel: "6 pts below",
    trend: { direction: "up", delta: "6%", tone: "success" },
    category: "at-risk",
    critical: false,
    fix: {
      type: "Probe",
      asset: "Negotiation Barrier Diagnostic",
      cohort: "9 agents below 30%",
    },
  },
  {
    id: "v2-effort",
    label: "Effort",
    value: "3.2",
    descriptor: "avg attempts per contact",
    target: 2.5,
    gapLabel: "0.7 above target",
    trend: { direction: "down", delta: "0.4", tone: "success" },
    category: "at-risk",
    critical: false,
    fix: {
      type: "Guide",
      asset: "Efficient Dialing Patterns",
      cohort: "14 agents above 3.0",
    },
  },
  // -- On track (meeting or above target) --
  {
    id: "v2-rescheduled",
    label: "Rescheduled Call Success",
    value: "51%",
    descriptor: "of rescheduled contacts",
    target: 45,
    gapLabel: "6 pts above",
    trend: { direction: "up", delta: "3%", tone: "success" },
    category: "on-track",
  },
  {
    id: "v2-compliance",
    label: "Compliance Score",
    value: "91%",
    descriptor: "weighted avg",
    target: 85,
    gapLabel: "6 pts above",
    trend: { direction: "up", delta: "1%", tone: "success" },
    category: "on-track",
  },
  // -- No data --
  {
    id: "v2-failed-comm",
    label: "Failed Communication",
    value: "—",
    descriptor: "of total attempts",
    target: 5,
    gapLabel: null,
    trend: null,
    category: "no-data",
  },
];

// ---- V3: Activity rings + attention cards ----
// Six at-risk children (worst-first by absolute gap) with area tag, typed
// fix, and causing cohort. Derived from V1 masters' children; on-track
// children (Rescheduled Call, Compliance Score, Point of Sale) are rolled
// into the ring and reachable via expand.
export const KPI_V3_ATTENTION = [
  {
    id: "v3-efficiency",
    label: "Efficiency",
    area: "Reach",
    value: "10%",
    target: 43,
    gapLabel: "33 pts below",
    status: { label: "Needs Attention", color: "#BA1A1A" },
    sparkline: [4, 5, 6, 7, 6, 8, 9, 10],
    targetLine: 43,
  },
  {
    id: "v3-contactability",
    label: "Contactability",
    area: "Reach",
    value: "42%",
    target: 55,
    gapLabel: "13 pts below",
    status: { label: "Nearly There", color: "#B57E12" },
    sparkline: [30, 33, 36, 35, 38, 40, 39, 42],
    targetLine: 55,
  },
  {
    id: "v3-effective-comm",
    label: "Effective Comms",
    area: "Quality",
    value: "72%",
    target: 80,
    gapLabel: "8 pts below",
    status: { label: "Nearly There", color: "#B57E12" },
    sparkline: [62, 65, 64, 68, 70, 69, 71, 72],
    targetLine: 80,
  },
  {
    id: "v3-effort",
    label: "Effort",
    area: "Reach",
    value: "3.2",
    target: 2.5,
    gapLabel: "0.7 above target",
    status: { label: "Needs Attention", color: "#BA1A1A" },
    sparkline: [4.1, 3.9, 3.8, 3.7, 3.5, 3.4, 3.3, 3.2],
    targetLine: 2.5,
  },
  {
    id: "v3-negotiation",
    label: "Negotiation",
    area: "Recovery",
    value: "34%",
    target: 40,
    gapLabel: "6 pts below",
    status: { label: "Nearly There", color: "#B57E12" },
    sparkline: [22, 24, 26, 28, 30, 31, 33, 34],
    targetLine: 40,
  },
  {
    id: "v3-failed-comm",
    label: "Failed Comms",
    area: "Quality",
    value: "8%",
    target: 5,
    gapLabel: "3 pts above",
    status: { label: "Nearly There", color: "#B57E12" },
    sparkline: [12, 11, 10, 10, 9, 9, 8, 8],
    targetLine: 5,
  },
];

// ---- Page-level filters (header pills) ----
export const PAGE_FILTERS = {
  date: { label: "Date", value: "Last 12 Months" },
  workspaces: { label: "Workspaces", value: "All" },
  teams: { label: "Teams", value: "All" },
};
