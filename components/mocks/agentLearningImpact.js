// agentLearningImpact.js — per-agent "Learning Hub impact" chart data, derived
// deterministically from an agent's existing fields (qaScore, roleplay count,
// missions). The full tenure since the agent joined is modelled (QA + CSAT
// scores, volatile because it's a long window), with Learning Hub activities
// (drill / guide / replay / probe / mission) placed at realistic, irregular
// points — clustered at onboarding and around coaching pushes, not evenly
// spaced. `windowImpact` slices a trailing range (1M / 3M / 6M / 1Y / All) for
// the timeline switcher. Stable mock: same agent always yields the same data.

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const YEAR_MS = 365 * 24 * 60 * 60 * 1000;
const MONTH_MS = YEAR_MS / 12;

export const RANGES = [
  { id: "1M", months: 1 },
  { id: "3M", months: 3 },
  { id: "6M", months: 6 },
  { id: "1Y", months: 12 },
  { id: "All", months: null }, // full tenure
];

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}
function smoothstep(t) {
  return t * t * (3 - 2 * t);
}
// Full label for the scrubber readout, e.g. "Mar 25, 2026".
function fullLabel(d) {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

// valAt — long-run trend (start→end) plus multi-frequency volatility, windowed
// by sin(πt) so the endpoints stay pinned (headline numbers exact) while the
// middle of the window gets jagged.
function valAt(t, start, end, amp, seed) {
  const trend = start + (end - start) * smoothstep(t);
  const i = t * 100;
  const vol =
    (Math.sin(i * 0.13 + seed) +
      Math.sin(i * 0.31 + seed * 1.7) * 0.55 +
      Math.sin(i * 0.7 + seed * 0.3) * 0.32) *
    amp *
    Math.sin(Math.PI * t);
  return Math.round(clamp(trend + vol, 0, 100) * 10) / 10;
}

// Realistic, irregular activity cadence in months-from-join: an onboarding
// cluster, then sporadic practice, then coaching pushes that bunch up. Trimmed
// to the agent's tenure; titles name the competency targeted.
const ACTIVITY_PLAN = [
  { kind: "Drill", at: 0.5, title: "Mock drill — onboarding basics" },
  { kind: "Drill", at: 0.9, title: "Mock drill — call flow" },
  { kind: "Guide", at: 1.4, title: "Guide — empathy openers" },
  { kind: "Replay", at: 3.1, title: "Replay — live call review" },
  { kind: "Drill", at: 3.5, title: "Mock drill — objection handling" },
  { kind: "Probe", at: 5.6, title: "Probe — skills interview" },
  { kind: "Guide", at: 6.9, title: "Guide — de-escalation" },
  { kind: "Replay", at: 7.3, title: "Replay — escalation call" },
  { kind: "Mission", at: 9.7, title: "Mission" },
  { kind: "Drill", at: 12.4, title: "Mock drill — refresh" },
  { kind: "Guide", at: 13.0, title: "Guide — billing scenarios" },
  { kind: "Replay", at: 15.8, title: "Replay — retention save" },
  { kind: "Probe", at: 17.2, title: "Probe — skills re-check" },
  { kind: "Mission", at: 19.6, title: "Mission" },
  { kind: "Guide", at: 21.4, title: "Guide — compliance refresh" },
];

// getAgentImpact — full-tenure chart record for one agent (a LEARNING_AGENTS row).
export function getAgentImpact(agent) {
  const firstName = agent.name.split(/\s+/)[0];
  const qa = agent.qaScore == null ? 70 : agent.qaScore;
  const roleplays = agent.roleplaysCount ?? 0;
  const nowIso = agent.lastRoleplayDate || "2026-03-22";
  const nowTime = new Date(nowIso).getTime();

  // Realistic tenure: ~13–26 months, more for more-practised agents.
  const tenure = clamp(Math.round(roleplays * 0.8) + 12, 13, 26);
  const joinTime = nowTime - tenure * MONTH_MS;

  const rise = clamp(Math.round(roleplays * 0.9) + 8, 10, 26);
  const qaEnd = qa;
  const qaStart = clamp(qa - rise, 30, qa - 4);
  const csatEnd = clamp(Math.round(70 + (qa - 60) / 4), 60, 93);
  const csatStart = clamp(csatEnd - Math.round(rise * 0.8), 40, csatEnd - 3);

  const K = Math.round(tenure * 5) + 1; // ~ every 6 days
  const series = [];
  for (let i = 0; i < K; i += 1) {
    const t = i / (K - 1);
    const date = new Date(joinTime + t * tenure * MONTH_MS);
    series.push({
      x: t * tenure, // months since join
      qa: valAt(t, qaStart, qaEnd, 3.4, 1),
      csat: valAt(t, csatStart, csatEnd, 2.8, 4),
      date: fullLabel(date),
    });
  }

  const missions = agent.missions || [];
  let missionN = 0;
  const activities = ACTIVITY_PLAN.filter((a) => a.at <= tenure).map((a) => {
    const date = new Date(joinTime + a.at * MONTH_MS);
    let title = a.title;
    if (a.kind === "Mission") {
      const m = missions[missionN % Math.max(1, missions.length)];
      missionN += 1;
      title = `Mission — ${m ? m.name : "Customer support enhancement"}`;
    }
    return { kind: a.kind, x: a.at, date: fullLabel(date), title };
  });

  return { firstName, qaEnd, csatEnd, series, activities, tenure };
}

// getTeamImpact — team-level "Learning Hub impact": the team's average QA score
// and CSAT over ~24 months, with every Learning Hub intervention the team ran
// marked along the axis. Lets a team lead see practice translate into lift
// across the whole team. Same record shape as getAgentImpact.
export function getTeamImpact({ qaEnd = 81, csatEnd = 71, compositeEnd = 62, tenure = 24 } = {}) {
  const nowTime = new Date("2026-06-14").getTime();
  const joinTime = nowTime - tenure * MONTH_MS;
  const qaStart = clamp(qaEnd - 16, 30, qaEnd - 4);
  const csatStart = clamp(csatEnd - 13, 40, csatEnd - 3);
  const compositeStart = clamp(compositeEnd - 18, 20, compositeEnd - 4);

  const K = Math.round(tenure * 5) + 1;
  const series = [];
  for (let i = 0; i < K; i += 1) {
    const t = i / (K - 1);
    const date = new Date(joinTime + t * tenure * MONTH_MS);
    series.push({
      x: t * tenure,
      qa: valAt(t, qaStart, qaEnd, 2.2, 2),
      csat: valAt(t, csatStart, csatEnd, 1.9, 5),
      composite: valAt(t, compositeStart, compositeEnd, 1.8, 7),
      date: fullLabel(date),
    });
  }

  const activities = ACTIVITY_PLAN.filter((a) => a.at <= tenure).map((a) => {
    const date = new Date(joinTime + a.at * MONTH_MS);
    return { kind: a.kind, x: a.at, date: fullLabel(date), title: a.title };
  });

  return { firstName: "Your team", qaEnd, csatEnd, compositeEnd, series, activities, tenure };
}

// windowImpact — slice the trailing range for the timeline switcher.
export function windowImpact(data, rangeId) {
  const range = RANGES.find((r) => r.id === rangeId) || RANGES[3];
  const xMax = data.tenure;
  const xMin = range.months == null ? 0 : Math.max(0, xMax - range.months);
  const EPS = 1e-6;
  const series = data.series.filter((p) => p.x >= xMin - EPS);
  const activities = data.activities.filter((a) => a.x >= xMin - EPS);
  return {
    firstName: data.firstName,
    qaEnd: data.qaEnd,
    csatEnd: data.csatEnd,
    compositeEnd: data.compositeEnd,
    series,
    activities,
    xMin,
    xMax,
  };
}
