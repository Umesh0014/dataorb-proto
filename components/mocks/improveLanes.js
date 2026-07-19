// improveLanes.js — mock data for the "Improve" surface (Jul 17 pivot).
// The core model: competency lanes, each with a configurable threshold and
// min-interaction filter. Agents below threshold surface for coaching.
// Shared across all 3 direction variants.

export const COMPETENCIES = [
  { id: "sales", label: "Sales", metric: "Sales attempt rate", unit: "%" },
  { id: "fcr", label: "FCR", metric: "First-contact resolution", unit: "%" },
  { id: "de-escalation", label: "De-escalation", metric: "CSAT on escalated calls", unit: "%" },
  { id: "resolution", label: "Resolution", metric: "Resolution clarity score", unit: "%" },
  { id: "empathy", label: "Empathy", metric: "Acknowledgment rate", unit: "%" },
  { id: "compliance", label: "Compliance", metric: "QA compliance score", unit: "%" },
];

export const DEFAULT_THRESHOLDS = {
  sales: 25,
  fcr: 60,
  "de-escalation": 55,
  resolution: 50,
  empathy: 60,
  compliance: 70,
};

export const DEFAULT_MIN_INTERACTIONS = 15;

// Agent performance data per competency. Each agent has scores for a
// subset of competencies (not all agents handle all queues — the
// min-interaction filter means some won't appear in certain lanes).
const AGENTS_RAW = [
  {
    id: "215566", name: "Ravi Patel", initials: "RP",
    scores: { sales: 18, fcr: 42, "de-escalation": 48, resolution: 38, empathy: 55, compliance: 62 },
    interactions: { sales: 34, fcr: 52, "de-escalation": 22, resolution: 52, empathy: 45, compliance: 30 },
    trends: { sales: [22, 21, 20, 19, 18], fcr: [50, 48, 45, 43, 42], resolution: [45, 42, 40, 39, 38] },
    topDrivers: ["Billing-retention", "Account management"],
  },
  {
    id: "203891", name: "Mukesh Patil", initials: "MP",
    scores: { sales: 20, fcr: 55, "de-escalation": 50, resolution: 46, empathy: 58, compliance: 48 },
    interactions: { sales: 28, fcr: 41, "de-escalation": 18, resolution: 41, empathy: 38, compliance: 25 },
    trends: { sales: [25, 23, 22, 21, 20], fcr: [60, 58, 57, 56, 55], compliance: [55, 52, 50, 49, 48] },
    topDrivers: ["Compliance", "Billing-retention"],
  },
  {
    id: "198320", name: "Willis Jast", initials: "WJ",
    scores: { sales: 30, fcr: 58, "de-escalation": 40, resolution: 52, empathy: 48, compliance: 74 },
    interactions: { sales: 45, fcr: 60, "de-escalation": 35, resolution: 60, empathy: 50, compliance: 40 },
    trends: { "de-escalation": [52, 50, 47, 44, 40], empathy: [55, 53, 50, 49, 48] },
    topDrivers: ["Billing-retention", "Technical support"],
  },
  {
    id: "217430", name: "Priya Nair", initials: "PN",
    scores: { sales: 22, fcr: 65, "de-escalation": 60, resolution: 55, empathy: 62, compliance: 75 },
    interactions: { sales: 38, fcr: 55, "de-escalation": 30, resolution: 55, empathy: 42, compliance: 35 },
    trends: { sales: [28, 26, 25, 23, 22] },
    topDrivers: ["Retention", "Account management"],
  },
  {
    id: "184775", name: "Hiroshi Tanaka", initials: "HT",
    scores: { sales: 32, fcr: 70, "de-escalation": 58, resolution: 62, empathy: 65, compliance: 80 },
    interactions: { sales: 50, fcr: 65, "de-escalation": 28, resolution: 65, empathy: 55, compliance: 42 },
    trends: { sales: [35, 34, 33, 32, 32] },
    topDrivers: ["Account management"],
  },
  {
    id: "201357", name: "Liam Donovan", initials: "LD",
    scores: { sales: 15, fcr: 48, "de-escalation": 52, resolution: 44, empathy: 56, compliance: 68 },
    interactions: { sales: 42, fcr: 58, "de-escalation": 25, resolution: 58, empathy: 48, compliance: 38 },
    trends: { sales: [20, 18, 17, 16, 15], fcr: [55, 52, 50, 49, 48], resolution: [50, 48, 46, 45, 44] },
    topDrivers: ["Retention", "Billing-retention"],
  },
  {
    id: "213846", name: "Sofia Russo", initials: "SR",
    scores: { sales: 28, fcr: 62, "de-escalation": 56, resolution: 58, empathy: 64, compliance: 72 },
    interactions: { sales: 30, fcr: 48, "de-escalation": 20, resolution: 48, empathy: 40, compliance: 32 },
    trends: { sales: [30, 29, 29, 28, 28] },
    topDrivers: ["Account management", "Retention"],
  },
  {
    id: "188214", name: "Devon Hartmann", initials: "DH",
    scores: { sales: 42, fcr: 82, "de-escalation": 78, resolution: 80, empathy: 85, compliance: 90 },
    interactions: { sales: 55, fcr: 70, "de-escalation": 40, resolution: 70, empathy: 60, compliance: 45 },
    trends: {},
    topDrivers: [],
  },
  {
    id: "209188", name: "Elena Vasquez", initials: "EV",
    scores: { sales: 38, fcr: 85, "de-escalation": 80, resolution: 82, empathy: 88, compliance: 92 },
    interactions: { sales: 48, fcr: 72, "de-escalation": 38, resolution: 72, empathy: 58, compliance: 48 },
    trends: {},
    topDrivers: [],
  },
  {
    id: "222019", name: "Grace Okafor", initials: "GO",
    scores: { sales: 40, fcr: 88, "de-escalation": 82, resolution: 85, empathy: 90, compliance: 94 },
    interactions: { sales: 52, fcr: 75, "de-escalation": 42, resolution: 75, empathy: 62, compliance: 50 },
    trends: {},
    topDrivers: [],
  },
  {
    id: "193845", name: "Aaliyah Tillman", initials: "AT",
    scores: { sales: 45, fcr: 90, "de-escalation": 85, resolution: 88, empathy: 92, compliance: 95 },
    interactions: { sales: 60, fcr: 80, "de-escalation": 45, resolution: 80, empathy: 65, compliance: 55 },
    trends: {},
    topDrivers: [],
  },
];

export const IMPROVE_AGENTS = AGENTS_RAW;

// agentsInLane — agents below threshold for a given competency, filtered
// by min interactions. Returns sorted by score ascending (worst first).
export function agentsInLane(competencyId, thresholds = DEFAULT_THRESHOLDS, minInteractions = DEFAULT_MIN_INTERACTIONS) {
  const threshold = thresholds[competencyId];
  return AGENTS_RAW
    .filter((a) => {
      const score = a.scores[competencyId];
      const interactions = a.interactions[competencyId];
      return score != null && interactions >= minInteractions && score < threshold;
    })
    .sort((a, b) => a.scores[competencyId] - b.scores[competencyId]);
}

// laneCountsAll — quick summary: how many agents below threshold per lane.
export function laneCountsAll(thresholds = DEFAULT_THRESHOLDS, minInteractions = DEFAULT_MIN_INTERACTIONS) {
  return COMPETENCIES.map((c) => ({
    ...c,
    count: agentsInLane(c.id, thresholds, minInteractions).length,
    threshold: thresholds[c.id],
  }));
}

// agentCompetencyDetail — sidecar data for one agent in one competency.
export function agentCompetencyDetail(agentId, competencyId, thresholds = DEFAULT_THRESHOLDS) {
  const agent = AGENTS_RAW.find((a) => a.id === agentId);
  if (!agent) return null;
  const competency = COMPETENCIES.find((c) => c.id === competencyId);
  const score = agent.scores[competencyId];
  const threshold = thresholds[competencyId];
  const gap = threshold - score;
  const trend = agent.trends[competencyId] || null;
  const interactions = agent.interactions[competencyId];

  const actions = [];
  if (gap > 20) {
    actions.push({ kind: "drill", label: "Assign guided drill", icon: "Target", duration: "12 min" });
    actions.push({ kind: "one-on-one", label: "Schedule 1:1", icon: "MessageSquare", duration: "15 min" });
  } else if (gap > 10) {
    actions.push({ kind: "drill", label: "Assign guided drill", icon: "Target", duration: "12 min" });
    actions.push({ kind: "brief", label: "Generate coaching brief", icon: "FileText", duration: "auto" });
  } else {
    actions.push({ kind: "brief", label: "Generate coaching brief", icon: "FileText", duration: "auto" });
  }
  actions.push({ kind: "mission", label: "Add to mission", icon: "Flag", duration: "2 roleplays" });

  return {
    agent,
    competency,
    score,
    threshold,
    gap,
    trend,
    interactions,
    topDrivers: agent.topDrivers,
    actions,
    whyText: `${agent.name} scored ${score}${competency.unit} on ${competency.metric} across ${interactions} interactions — ${gap}${competency.unit} below the ${threshold}${competency.unit} threshold.`,
  };
}

// matrixData — agent × competency status for the heatmap direction.
export function matrixData(thresholds = DEFAULT_THRESHOLDS, minInteractions = DEFAULT_MIN_INTERACTIONS) {
  return AGENTS_RAW.map((agent) => ({
    ...agent,
    cells: COMPETENCIES.map((c) => {
      const score = agent.scores[c.id];
      const interactions = agent.interactions[c.id];
      if (score == null || interactions < minInteractions) return { status: "na", score: null };
      const threshold = thresholds[c.id];
      if (score < threshold - 15) return { status: "critical", score };
      if (score < threshold) return { status: "warning", score };
      return { status: "ok", score };
    }),
  }));
}
