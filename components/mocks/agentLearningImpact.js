// agentLearningImpact.js — per-agent "Learning Hub impact" chart data, derived
// deterministically from an agent's existing fields (qaScore, trend, roleplay
// count, missions). One year of monthly QA and CSAT scores since the agent
// joined, plus the Learning Hub activities (drill / guide / replay / probe /
// mission) placed on that same timeline — so the chart shows practice turning
// into performance. Stable mock: same agent always yields the same data.

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const YEAR_MS = 365 * 24 * 60 * 60 * 1000;

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}
function smoothstep(t) {
  return t * t * (3 - 2 * t);
}
function dayLabel(d) {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}
function monthLabel(d) {
  return `${MONTHS[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`;
}

// buildLine — 13 monthly points easing from `start` to `end` with small,
// repeatable noise so the rise reads as organic, not a ruler line.
function buildLine(start, end, seed) {
  const pts = [];
  for (let i = 0; i <= 12; i += 1) {
    const t = i / 12;
    const base = start + (end - start) * smoothstep(t);
    const noise = Math.sin(i * 0.9 + seed) * 1.1;
    pts.push({ x: i, v: Math.round((base + noise) * 10) / 10 });
  }
  return pts;
}

// Activity templates in calendar order across the year. monthPos is the point
// on the 0–12 month axis; the title names the competency the activity targeted.
const ACTIVITY_PLAN = [
  { kind: "Drill", code: "D", monthPos: 1.6, title: "Mock drill — objection handling" },
  { kind: "Guide", code: "G", monthPos: 3.2, title: "Guide — empathy openers" },
  { kind: "Replay", code: "R", monthPos: 4.7, title: "Replay — live call review" },
  { kind: "Drill", code: "D", monthPos: 6.2, title: "Mock drill — de-escalation" },
  { kind: "Probe", code: "P", monthPos: 7.6, title: "Probe — skills interview" },
  { kind: "Guide", code: "G", monthPos: 9.1, title: "Guide — billing scenarios" },
  { kind: "Mission", code: "M", monthPos: 10.9, title: "Mission" },
];

// getAgentImpact — chart-ready record for one agent (a LEARNING_AGENTS row).
export function getAgentImpact(agent) {
  const firstName = agent.name.split(/\s+/)[0];
  const qa = agent.qaScore == null ? 70 : agent.qaScore;
  const roleplays = agent.roleplaysCount ?? 0;
  const nowIso = agent.lastRoleplayDate || "2026-03-22";
  const nowTime = new Date(nowIso).getTime();
  const joinTime = nowTime - YEAR_MS;

  // A year of growth: starts well below today's score, climbs to it. More
  // practice → a bigger journey.
  const rise = clamp(Math.round(roleplays * 0.9) + 7, 9, 24);
  const qaEnd = qa;
  const qaStart = clamp(qa - rise, 32, qa - 3);
  const csatEnd = clamp(Math.round(70 + (qa - 60) / 4), 60, 93);
  const csatStart = clamp(csatEnd - Math.round(rise * 0.8), 42, csatEnd - 3);

  const qaLine = buildLine(qaStart, qaEnd, 1);
  const csatLine = buildLine(csatStart, csatEnd, 4);

  // Fewer activities for low-practice agents (drop the 2nd drill).
  const plan = roleplays >= 8 ? ACTIVITY_PLAN : ACTIVITY_PLAN.filter((a) => a.monthPos !== 6.2);
  const mission = agent.missions?.[0];
  const activities = plan.map((a) => {
    const date = new Date(joinTime + (a.monthPos / 12) * YEAR_MS);
    return {
      kind: a.kind,
      code: a.code,
      x: a.monthPos,
      date: dayLabel(date),
      title: a.kind === "Mission" ? `Mission — ${mission ? mission.name : "Customer support enhancement"}` : a.title,
    };
  });

  // Axis ticks every quarter.
  const ticks = [0, 3, 6, 9, 12].map((i) => ({
    x: i,
    label: monthLabel(new Date(joinTime + (i / 12) * YEAR_MS)),
  }));

  return {
    firstName,
    joinedLabel: monthLabel(new Date(joinTime)),
    qaLine,
    csatLine,
    qaEnd,
    csatEnd,
    activities,
    ticks,
  };
}
