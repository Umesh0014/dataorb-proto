// Mock skill library for the Ask Mira Pro Skills page. Each entry is a
// composable, prompt-engineered analytical workflow a user can run.
// `icon` is a lucide-react icon name (mapped to a component in SkillsPage);
// `tint` is the category colour band. Replace with a real fetch once the
// Skills backend lands.
export const SKILLS = [
  {
    id: "coaching-brief",
    name: "Coaching Brief",
    publisher: "DataOrb",
    category: "Coaching",
    description:
      "Pre-coaching workflow that turns AutoQA scorecards into a weekly per-agent brief, surfacing the two or three behaviours each agent should work on next.",
    icon: "Target",
    tint: "purple",
    runs: 247,
    lastUpdated: "2026-03-23T00:00:00Z",
  },
  {
    id: "quality-trends",
    name: "Quality Trends",
    publisher: "DataOrb",
    category: "Quality Assurance",
    description:
      "Tracks evaluation scores across teams and time, flagging which quality dimensions are improving, sliding, or stuck below benchmark.",
    icon: "BadgeCheck",
    tint: "green",
    runs: 182,
    lastUpdated: "2026-04-02T00:00:00Z",
  },
  {
    id: "csat-diagnostic",
    name: "CSAT Diagnostic",
    publisher: "DataOrb",
    category: "Customer Experience",
    description:
      "Breaks customer satisfaction down by driver, channel, and segment to pinpoint where the experience is slipping and why.",
    icon: "Gauge",
    tint: "green",
    runs: 311,
    lastUpdated: "2026-03-18T00:00:00Z",
  },
  {
    id: "business-improvement-brief",
    name: "Business Improvement Brief",
    publisher: "DataOrb",
    category: "Operations",
    description:
      "Synthesises volume, resolution, and sentiment signals into a ranked set of operational improvements with the largest expected payoff.",
    icon: "RefreshCw",
    tint: "teal",
    runs: 96,
    lastUpdated: "2026-04-11T00:00:00Z",
  },
  {
    id: "csat-playbook",
    name: "CSAT Playbook",
    publisher: "DataOrb",
    category: "Customer Experience",
    description:
      "Generates a targeted action plan to lift satisfaction on the channels and intents dragging the overall score down.",
    icon: "Gauge",
    tint: "green",
    runs: 154,
    lastUpdated: "2026-02-27T00:00:00Z",
  },
  {
    id: "fcr-impediment-brief",
    name: "FCR Impediment Brief",
    publisher: "DataOrb",
    category: "Resolution",
    description:
      "Identifies the workflow gaps and knowledge blockers stopping agents from resolving contacts on the first attempt.",
    icon: "Headset",
    tint: "pink",
    runs: 73,
    lastUpdated: "2026-04-08T00:00:00Z",
  },
  {
    id: "sales-objections-analysis",
    name: "Sales Objections Analysis",
    publisher: "DataOrb",
    category: "Sales",
    description:
      "Mines won and lost conversations for the objections that recur most and the rebuttals that actually move deals forward.",
    icon: "Tag",
    tint: "orange",
    runs: 208,
    lastUpdated: "2026-03-30T00:00:00Z",
  },
  {
    id: "fcr-optimization-playbook",
    name: "FCR Optimization Playbook",
    publisher: "DataOrb",
    category: "Resolution",
    description:
      "Lays out a step-by-step plan to raise first-contact resolution, from routing fixes to the coaching priorities that compound fastest.",
    icon: "Headset",
    tint: "pink",
    runs: 119,
    lastUpdated: "2026-04-15T00:00:00Z",
  },
  {
    id: "churn-risk-diagnostic",
    name: "Churn Risk Diagnostic",
    publisher: "DataOrb",
    category: "Retention",
    description:
      "Scores accounts on churn signals from recent interactions and explains the behaviours driving the highest-risk segment.",
    icon: "AlertTriangle",
    tint: "red",
    runs: 264,
    lastUpdated: "2026-04-05T00:00:00Z",
  },
];

// SKILL_RECORD — shared detail block for the skill record view. The
// prototype maps every skill onto the same template (mirrors how
// miraConversation.js shares one RESPONSE_TEMPLATE); only the per-skill
// fields above vary. Replace with a real per-skill fetch later.
const SKILL_RECORD = {
  createdBy: { name: "Akash Pathak", date: "2025-11-12T00:00:00Z" },
  // Only the avatar + date render for Last Updated (spec Q2); name still
  // drives the avatar.
  updatedByName: "DataOrb Studio",
  template: {
    version: "v3.2 (current)",
    versions: ["v3.2 (current)", "v3.1", "v3.0", "v2.4", "v2.0"],
  },
  inputs: [
    {
      status: "required",
      name: "Date range",
      description: "Reporting window the skill analyses.",
    },
    {
      status: "required",
      name: "Workspace",
      description: "Workspace whose interactions feed the analysis.",
    },
    {
      status: "optional",
      name: "Teams",
      description: "Limit the analysis to specific teams. Defaults to all teams.",
    },
    {
      status: "optional",
      name: "Agents",
      description: "Limit the analysis to specific agents. Defaults to all agents.",
    },
    {
      status: "required",
      name: "Scorecard",
      description: "AutoQA scorecard the brief is built from.",
    },
    {
      status: "optional",
      name: "Channel",
      description: "Limit to a single channel. Defaults to all channels.",
    },
  ],
  engagement: {
    activeUsers: 18,
    lastRun: { text: "2 mins ago", user: "Pathik Patel" },
  },
  // Monthly run counts, oldest first — drives the Monthly Runs line chart.
  monthlyRuns: [
    { month: "Jun", runs: 312 },
    { month: "Jul", runs: 408 },
    { month: "Aug", runs: 376 },
    { month: "Sep", runs: 521 },
    { month: "Oct", runs: 604 },
    { month: "Nov", runs: 548 },
    { month: "Dec", runs: 690 },
    { month: "Jan", runs: 742 },
    { month: "Feb", runs: 688 },
    { month: "Mar", runs: 815 },
    { month: "Apr", runs: 874 },
    { month: "May", runs: 938 },
  ],
  runsByUser: [
    { name: "Pathik Patel", role: "QA Manager", runs: 142, lastRun: "2026-05-19T00:00:00Z" },
    { name: "Sara Greene", role: "Team Lead", runs: 98, lastRun: "2026-05-12T00:00:00Z" },
    { name: "Marcus Lee", role: "Contact Center Director", runs: 76, lastRun: "2026-05-03T00:00:00Z" },
    { name: "Ravi Patel", role: "QA Analyst", runs: 54, lastRun: "2026-04-28T00:00:00Z" },
    { name: "Elena Cruz", role: "Team Lead", runs: 41, lastRun: "2026-02-18T00:00:00Z" },
    { name: "Tod Blick", role: "QA Analyst", runs: 33, lastRun: "2026-03-09T00:00:00Z" },
  ],
};

// getSkillRecord — merge a skill's own fields with the shared detail
// template into the shape the record view consumes. Falls back to the
// first skill for an unknown id.
export function getSkillRecord(id) {
  const skill = SKILLS.find((s) => s.id === id) || SKILLS[0];
  return {
    ...skill,
    createdBy: SKILL_RECORD.createdBy,
    lastUpdatedBy: { name: SKILL_RECORD.updatedByName, date: skill.lastUpdated },
    template: {
      name: `${skill.name} Template`,
      version: SKILL_RECORD.template.version,
      versions: SKILL_RECORD.template.versions,
      updated: skill.lastUpdated,
    },
    inputs: SKILL_RECORD.inputs,
    engagement: {
      totalRuns: skill.runs,
      avgPerMonth: Math.round(skill.runs / 12),
      activeUsers: SKILL_RECORD.engagement.activeUsers,
      lastRun: SKILL_RECORD.engagement.lastRun,
    },
    monthlyRuns: SKILL_RECORD.monthlyRuns,
    runsByUser: SKILL_RECORD.runsByUser,
  };
}
