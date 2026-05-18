// Next Best Action mock data for the Agent Detail Page actionable-insight
// layer. Hard-coded for agent Aaliyah Tillman over the "Last 7 Days" range;
// values intentionally echo what is already visible on the page so the
// layer reads as derived from the existing data.
//
// Shapes:
//   NBA card  { id, priority, title, evidence, action, outcome }
//   action    { type, asset, duration }   priority "critical|recommended|opportunity"
//   inline    { text, ctaLabel, asset, duration }

// NBA_CARDS — Tier 1 horizontal rail, already in priority order.
export const NBA_CARDS = [
  {
    id: "nba-1",
    priority: "critical",
    title: "Strengthen call resolutions",
    evidence:
      "Resolution and Expectations has 10 open recommendations, up 4% this week.",
    action: { type: "Assign drill", asset: "Setting Clear Resolutions", duration: "15 min" },
    outcome: "+18% Resolution adherence in 2 weeks (based on 142-agent cohort)",
  },
  {
    id: "nba-2",
    priority: "critical",
    title: "Improve acknowledgment statements",
    evidence:
      "8 missed acknowledgment moments in the last 7 days, bottom quartile in queue.",
    action: { type: "Assign drill", asset: "Empathy & Acknowledgment Practice", duration: "12 min" },
    outcome: "+15% acknowledgment rate within 4 days",
  },
  {
    id: "nba-3",
    priority: "recommended",
    title: "Reinforce call opening protocol",
    evidence:
      "Interaction Opening regressed by 6. Last roleplay on this skill was 9 days ago.",
    action: { type: "Reassign roleplay", asset: "Proper Greeting Protocol", duration: "10 min" },
    outcome: "Return to baseline within 5 days",
  },
  {
    id: "nba-4",
    priority: "opportunity",
    title: "Build on silence handling momentum",
    evidence:
      "Correct Silence Handling improved by 7. Aaliyah is ready for the advanced module.",
    action: { type: "Assign course", asset: "Advanced Conversation Pacing", duration: "25 min" },
    outcome: "Top-quartile placement in 3 weeks",
  },
];

// NBA_MORE — lower-priority items shown only in the "View all" side sheet,
// derived from the remaining Coaching Recommendations topics. The side sheet
// renders NBA_CARDS followed by these.
export const NBA_MORE = [
  {
    id: "nba-5",
    priority: "recommended",
    title: "Sharpen options and benefits framing",
    evidence: "Options and Benefits surfaced in 4 sessions this week, trending up.",
    action: { type: "Assign drill", asset: "Options and Benefits", duration: "12 min" },
  },
  {
    id: "nba-6",
    priority: "opportunity",
    title: "Layer in assurance statements",
    evidence: "Assurance Statements appeared in 2 sessions, down 4% — steady ground to build on.",
    action: { type: "Assign drill", asset: "Assurance Statements", duration: "10 min" },
  },
  {
    id: "nba-7",
    priority: "opportunity",
    title: "Reinforce positive outlook language",
    evidence: "Positive Outlook flagged in 2 sessions, down 2% this week.",
    action: { type: "Assign drill", asset: "Positive Outlook", duration: "10 min" },
  },
  {
    id: "nba-8",
    priority: "recommended",
    title: "Deepen needs discovery",
    evidence: "Explore Needs appeared in 2 sessions, up 5% — worth an early nudge.",
    action: { type: "Assign drill", asset: "Explore Needs", duration: "15 min" },
  },
];

// INLINE_NBA — Tier 2 inline prompt per existing section. `asset` /
// `duration` feed the shared Confirm assignment modal.
export const INLINE_NBA = {
  coaching: {
    text: "Resolution & Expectations is the highest-impact gap this week.",
    ctaLabel: "Assign drill",
    asset: "Setting Clear Resolutions",
    duration: "15 min",
  },
  roleplay: {
    text: "Aaliyah is at 16 roleplays/day vs the 20 target. Add two more on Empathy Patterns.",
    ctaLabel: "Schedule sessions",
    asset: "Empathy Patterns",
    duration: "10 min",
  },
  quality: {
    text: "Adherence climbed 20% → 60% this week. Stack a complementary drill while momentum is high.",
    ctaLabel: "View suggestion",
    asset: "Advanced Conversation Pacing",
    duration: "25 min",
  },
};
