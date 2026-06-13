// agentLearningImpact.js — per-agent "Learning Hub impact" chart data, derived
// deterministically from an agent's existing fields (qaScore, trend, roleplay
// count, missions). A year of weekly QA and CSAT scores since the agent joined
// (volatile, since it's a long window), plus the Learning Hub activities
// (drill / guide / replay / probe / mission) placed on that timeline — so the
// chart shows practice turning into performance. Stable mock: same agent
// always yields the same data.

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const YEAR_MS = 365 * 24 * 60 * 60 * 1000;
const N = 49; // weekly-ish points across the year

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}
function smoothstep(t) {
  return t * t * (3 - 2 * t);
}
function dayLabel(d) {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

// valAt — trend from start→end plus multi-frequency volatility. The volatility
// is windowed by sin(πt) so the endpoints stay pinned to start/end (the
// headline numbers stay exact) while the middle of the long window gets jagged.
function valAt(t, start, end, amp, seed) {
  const trend = start + (end - start) * smoothstep(t);
  const i = t * (N - 1);
  const vol =
    (Math.sin(i * 0.55 + seed) +
      Math.sin(i * 1.3 + seed * 1.7) * 0.55 +
      Math.sin(i * 2.7 + seed * 0.3) * 0.32) *
    amp *
    Math.sin(Math.PI * t);
  return Math.round(clamp(trend + vol, 0, 100) * 10) / 10;
}

// Activity templates in calendar order across the year. monthPos is the point
// on the 0–12 month axis; the title names the competency the activity targeted.
const ACTIVITY_PLAN = [
  { kind: "Drill", monthPos: 1.6, title: "Mock drill — objection handling" },
  { kind: "Guide", monthPos: 3.2, title: "Guide — empathy openers" },
  { kind: "Replay", monthPos: 4.7, title: "Replay — live call review" },
  { kind: "Drill", monthPos: 6.2, title: "Mock drill — de-escalation" },
  { kind: "Probe", monthPos: 7.6, title: "Probe — skills interview" },
  { kind: "Guide", monthPos: 9.1, title: "Guide — billing scenarios" },
  { kind: "Mission", monthPos: 10.9, title: "Mission" },
];

// getAgentImpact — chart-ready record for one agent (a LEARNING_AGENTS row).
export function getAgentImpact(agent) {
  const firstName = agent.name.split(/\s+/)[0];
  const qa = agent.qaScore == null ? 70 : agent.qaScore;
  const roleplays = agent.roleplaysCount ?? 0;
  const nowIso = agent.lastRoleplayDate || "2026-03-22";
  const nowTime = new Date(nowIso).getTime();
  const joinTime = nowTime - YEAR_MS;

  const rise = clamp(Math.round(roleplays * 0.9) + 7, 9, 24);
  const qaEnd = qa;
  const qaStart = clamp(qa - rise, 32, qa - 3);
  const csatEnd = clamp(Math.round(70 + (qa - 60) / 4), 60, 93);
  const csatStart = clamp(csatEnd - Math.round(rise * 0.8), 42, csatEnd - 3);

  const series = [];
  for (let i = 0; i < N; i += 1) {
    const t = i / (N - 1);
    const date = new Date(joinTime + t * YEAR_MS);
    series.push({
      x: t * 12,
      qa: valAt(t, qaStart, qaEnd, 3.0, 1),
      csat: valAt(t, csatStart, csatEnd, 2.6, 4),
      date: dayLabel(date),
    });
  }

  const plan = roleplays >= 8 ? ACTIVITY_PLAN : ACTIVITY_PLAN.filter((a) => a.monthPos !== 6.2);
  const mission = agent.missions?.[0];
  const activities = plan.map((a) => {
    const date = new Date(joinTime + (a.monthPos / 12) * YEAR_MS);
    return {
      kind: a.kind,
      x: a.monthPos,
      date: dayLabel(date),
      title: a.kind === "Mission" ? `Mission — ${mission ? mission.name : "Customer support enhancement"}` : a.title,
    };
  });

  // Axis ticks every quarter. Year is shown only when it first appears or
  // changes, so labels read "Mar '25 · Jun · Sep · Dec · Mar '26".
  let prevYear = null;
  const ticks = [0, 3, 6, 9, 12].map((i) => {
    const d = new Date(joinTime + (i / 12) * YEAR_MS);
    const year = d.getFullYear();
    const showYear = prevYear === null || year !== prevYear;
    prevYear = year;
    return {
      x: i,
      label: showYear ? `${MONTHS[d.getMonth()]} '${String(year).slice(2)}` : MONTHS[d.getMonth()],
    };
  });

  return { firstName, series, qaEnd, csatEnd, activities, ticks };
}
