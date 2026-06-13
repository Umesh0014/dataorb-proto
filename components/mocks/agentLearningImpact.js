// agentLearningImpact.js — per-agent Learning Impact, derived deterministically
// from an agent's existing Learning-Hub fields (qaScore, trend, roleplay count,
// missions). Powers the "Learning impact" section on the Agent detail page:
// how/when this agent got help from Learning Hub (drill / guide / replay /
// probe / mission) and how production performance moved.
//
// Real impl: an impact/attribution service joining the recorded intervention
// ledger to production metrics over a window. Here it's a stable mock — same
// agent always yields the same record — so the honesty rules (method, caveat,
// High/Med/Low confidence, "N of M" sample, withheld-% under the floor) are
// demonstrated across the existing agent roster without new data plumbing.

import { metric, IMPACT_WINDOW } from "./learningImpact";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

// shortDate — "MMM D" label `daysBefore` days before an ISO anchor date.
function shortDate(anchorIso, daysBefore) {
  const d = new Date(anchorIso);
  d.setDate(d.getDate() - daysBefore);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

// confidenceFor — more practice → more interactions to attribute against.
function confidenceFor(roleplays) {
  if (roleplays >= 12) return "high";
  if (roleplays >= 6) return "med";
  return "low";
}

// getAgentImpact — build the agent's impact record. `agent` is a LEARNING_AGENTS
// row (id, name, qaScore, qaScoreTrend, roleplaysCount, lastRoleplayDate,
// missions). Deterministic: no randomness, no state.
export function getAgentImpact(agent) {
  const firstName = agent.name.split(/\s+/)[0];
  const qa = agent.qaScore == null ? 70 : agent.qaScore;
  const trend = agent.qaScoreTrend || { direction: "up", deltaPct: 2 };
  const roleplays = agent.roleplaysCount ?? 0;
  const anchor = agent.lastRoleplayDate || "2026-03-22";

  // Improvement magnitude scales with practice; direction follows the agent's
  // trend so a declining agent honestly shows a smaller / negative movement.
  const magnitude = clamp(Math.round(roleplays * 0.6), 2, 9);
  const signed = trend.direction === "down" ? -clamp(trend.deltaPct + 1, 1, magnitude) : magnitude;

  const qaBaseline = clamp(qa - signed, 30, 99);
  const csatCurrent = clamp(Math.round(70 + (qa - 60) / 4), 58, 94);
  const csatBaseline = clamp(csatCurrent - Math.round(signed * 0.7), 40, 99);

  const metrics = [
    metric("qa", "QA score", "%", qaBaseline, qa, 85, true, 1),
    metric("csat", "CSAT", "%", csatBaseline, csatCurrent, 85, true, 2),
  ];

  // Sample scales with practice; low-practice agents fall below the floor and
  // their % is withheld (honest small-N handling).
  const sampleN = roleplays * 2 + 6;
  const samplePool = sampleN + Math.round(sampleN * 0.4) + 6;

  const mission = agent.missions?.[0];
  const missionState = mission?.status === "on_target" ? "completed" : "partial";

  // The Learning Hub help this agent received, newest first — covers the
  // activity types the agent gets help through: replay, drill, guide, probe,
  // mission. Title carries the competency/driver the activity targeted.
  const interventions = [
    { kind: "Replay", title: "Replay — Reviewed live call, de-escalation", date: shortDate(anchor, 0), state: "completed" },
    { kind: "Drill", title: "Drill — Roleplay practice, objection handling", date: shortDate(anchor, 6), state: "completed" },
    { kind: "Guide", title: "Guide — Empathy openers walkthrough", date: shortDate(anchor, 13), state: roleplays >= 6 ? "completed" : "partial" },
    { kind: "Probe", title: "Probe — Skills interview, billing scenarios", date: shortDate(anchor, 21), state: "completed" },
    {
      kind: "Mission",
      title: `Mission — ${mission ? mission.name : "Customer support enhancement"}`,
      date: shortDate(anchor, 28),
      state: missionState,
    },
  ];

  return {
    firstName,
    window: IMPACT_WINDOW,
    method: "prepost",
    confidence: confidenceFor(roleplays),
    sampleN,
    samplePool,
    timeToImpact: `${clamp(28 - roleplays, 7, 26)} days`,
    metrics,
    interventions,
  };
}
