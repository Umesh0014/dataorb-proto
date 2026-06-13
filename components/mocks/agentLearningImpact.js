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
function dayLabel(d) {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
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
      date: dayLabel(date),
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
    return { kind: a.kind, x: a.at, date: dayLabel(date), title };
  });

  return { firstName, qaEnd, csatEnd, series, activities, tenure, joinTime };
}

// buildTicks — ~5 evenly spaced x ticks across [xMin, xMax] (months from join).
// Short spans label the day ("Mar 12"); longer spans label the month and show
// the year only when it changes ("Mar '25 · Jun · Sep").
function buildTicks(joinTime, xMin, xMax) {
  const span = xMax - xMin;
  const count = 5;
  const ticks = [];
  let prevYear = null;
  for (let i = 0; i < count; i += 1) {
    const m = xMin + (span * i) / (count - 1);
    const d = new Date(joinTime + m * MONTH_MS);
    let label;
    if (span <= 3.5) {
      label = dayLabel(d);
    } else {
      const yr = d.getFullYear();
      const show = prevYear === null || yr !== prevYear;
      prevYear = yr;
      label = show ? `${MONTHS[d.getMonth()]} '${String(yr).slice(2)}` : MONTHS[d.getMonth()];
    }
    ticks.push({ x: m, label });
  }
  return ticks;
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
    series,
    activities,
    ticks: buildTicks(data.joinTime, xMin, xMax),
    xMin,
    xMax,
  };
}
