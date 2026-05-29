"use client";

import React from "react";
import { ShieldCheck, Sparkles, ChevronRight } from "lucide-react";
import Card from "./Card";
import TabsRow from "./TabsRow";
import { thresholdTone, ProgressBar, StatusPill } from "./ActiveMissionCard";
import MissionDonutGauge from "./MissionDonutGauge";
import MetricSparkline from "./MetricSparkline";
import MissionActivityHeatmap from "./MissionActivityHeatmap";

// MissionDetailContent — the shared inner content of a mission's detail
// view. Renders three blocks: a 4-tile KPI strip, a Mission Performance
// card with the existing By Focus Area / By Agent / By Driver tab row,
// and a Roleplay Interactions table. Used by:
//   - the standalone `/learning/missions/{missionId}` page (Options 2/3)
//   - the expanded row in the Hybrid table layout (Option 4)
//
// The Current layout still renders its own bespoke detail in the right
// sidecar; that surface is untouched.

const PERF_TABS = [
  { id: "focus", label: "By Focus Area" },
  { id: "agent", label: "By Agent" },
  { id: "driver", label: "By Driver" },
];

// Status column dropped in Upcoming-state curtain (Part D4). Computed
// inside FocusAreaTable so the table renders the same columns the rest
// of the app expects when state is not upcoming.
const FA_COLS_FULL = [
  { key: "name", label: "Focus Area", width: "36%" },
  { key: "target", label: "Target", width: "14%" },
  { key: "achieved", label: "Achieved", width: "32%" },
  { key: "status", label: "Status", width: "18%", align: "right" },
];
const FA_COLS_UPCOMING = [
  { key: "name", label: "Focus Area", width: "42%" },
  { key: "target", label: "Target", width: "16%" },
  { key: "achieved", label: "Achieved", width: "42%" },
];

function formatStartDate(iso) {
  if (!iso) return "the start date";
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

function formatShortDate(iso) {
  if (!iso) return "—";
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

// Sample data generators (Part E.1). Sparkline points are monotonically
// non-decreasing 0 → completed; heatmap activity sprinkles `completed`
// sessions across the mission lifetime on a deterministic pattern so
// the same mission renders the same matrix every render. Real impl
// reads from interaction logs.
function generateCumulativeSpark(completed) {
  const n = 12;
  if (!completed || completed <= 0) return Array(n).fill(0);
  // Smooth S-shape from 0 to completed.
  const out = [];
  for (let i = 0; i < n; i += 1) {
    const t = i / (n - 1);
    const eased = Math.round(completed * (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t));
    out.push(Math.min(completed, Math.max(out[out.length - 1] || 0, eased)));
  }
  return out;
}

function generateActivity(startISO, totalRoleplays) {
  if (!startISO || !totalRoleplays) return [];
  const start = new Date(`${startISO}T00:00:00Z`);
  if (Number.isNaN(start.getTime())) return [];
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const dayMs = 1000 * 60 * 60 * 24;
  const span = Math.max(1, Math.floor((today - start) / dayMs));
  // Distribute roleplays across ~half the days within the window with
  // a deterministic pseudo-random pattern so reloads are stable.
  const out = [];
  let remaining = totalRoleplays;
  for (let i = 0; i < span && remaining > 0; i += 1) {
    const day = new Date(start);
    day.setUTCDate(day.getUTCDate() + i);
    if (day > today) break;
    // Skip weekends + sparser distribution.
    const dow = day.getUTCDay();
    if (dow === 0 || dow === 6) continue;
    // Deterministic seeded boolean — only ~40% of weekdays have activity.
    const seed = (i * 9301 + 49297) % 233280;
    const rng = seed / 233280;
    if (rng > 0.42) continue;
    const count = Math.min(remaining, 1 + Math.floor(rng * 4));
    out.push({
      date: `${day.getUTCFullYear()}-${String(day.getUTCMonth() + 1).padStart(2, "0")}-${String(day.getUTCDate()).padStart(2, "0")}`,
      count,
    });
    remaining -= count;
  }
  return out;
}

function targetMetColor(pct) {
  if (pct == null) return { color: "var(--color-text-tertiary)", bg: "var(--pill-bg)" };
  if (pct >= 75) return { color: "var(--color-success)", bg: "var(--color-success-bg)" };
  if (pct >= 40) return { color: "var(--color-warning)", bg: "var(--color-warning-bg)" };
  return { color: "var(--color-error)", bg: "var(--color-error-bg)" };
}

function qaColor(score) {
  if (score >= 90) return "var(--color-success)";
  if (score >= 70) return "var(--color-warning)";
  return "var(--color-error)";
}

export default function MissionDetailContent({ mission, persona = "Team Lead", compact = false }) {
  const [perfTab, setPerfTab] = React.useState("focus");
  const k = mission.kpis || {};
  // Upcoming-state curtain strips the top stats row + Roleplay
  // Interactions table, drops the Status column from Mission
  // Performance, and replaces achieved values with 0 (spec Part D3).
  const upcoming = mission.state === "upcoming";
  // Agent persona (Part E §E4): donut + personal stats replace the
  // top stats row; focus areas render as a single list (no tabs);
  // Status column dropped; Roleplay Interactions filtered to agent.
  const isAgent = persona === "Agent";
  // Personal % completed default = mission.progress (stand-in for
  // % of required roleplays completed per spec §E7 #1 default).
  const personalPct = upcoming ? 0 : (mission.progress ?? 0);
  const personalStats = {
    roleplaysCompleted: k.roleplays != null ? k.roleplays : 0,
    roleplaysRequired: k.roleplays != null ? Math.max(k.roleplays + 2, 6) : 6,
    lastRoleplay: k.lastRoleplay || "—",
  };

  const tiles = [
    {
      label: "Agents Below Target",
      value: k.agentsBelowTarget
        ? `${k.agentsBelowTarget.current}/${k.agentsBelowTarget.total}`
        : "—",
    },
    { label: "Last Roleplay", value: k.lastRoleplay || "—" },
    { label: "Roleplays", value: k.roleplays != null ? String(k.roleplays) : "—" },
    {
      label: "Contact Reasons",
      value: k.contactReasons
        ? `${k.contactReasons.current}/${k.contactReasons.total}`
        : "—",
    },
  ];

  const performance = mission.performance || [];
  const interactions = mission.interactions || [];

  return (
    <div style={detailStyles.container(compact)}>
      {/* Top section. Team Leader sees the 4-tile cohort stats row
          (skipped for upcoming per Part D). Agent sees 3 equal-width
          metric cards: donut + cumulative-roleplays sparkline + dot
          matrix (Part E.1 §E1.1). All three reuse existing primitives
          and render the upcoming-state at 0/empty. */}
      {isAgent && (
        <div style={detailStyles.agentMetricRow}>
          <AgentMetricCard title="Mission progress">
            <div style={detailStyles.donutSlot}>
              <MissionDonutGauge value={personalPct} showLabel={false} />
            </div>
          </AgentMetricCard>

          <AgentMetricCard title="Roleplays completed">
            <span style={detailStyles.agentMetricNumber}>
              {upcoming
                ? `0 / ${personalStats.roleplaysRequired}`
                : `${personalStats.roleplaysCompleted} / ${personalStats.roleplaysRequired}`
              }
            </span>
            <div style={detailStyles.sparkSlot}>
              {upcoming || personalStats.roleplaysCompleted === 0 ? (
                <span style={detailStyles.metricEmpty}>No roleplays yet</span>
              ) : (
                <MetricSparkline
                  points={generateCumulativeSpark(personalStats.roleplaysCompleted)}
                  color="var(--do-brand-blue)"
                  formatValue={(v) => `${Math.round(v)}`}
                />
              )}
            </div>
          </AgentMetricCard>

          {/* Part E.3 — Last Roleplay card uses a bespoke 30/70
              internal split (title + date stacked left, heatmap right)
              instead of the shared AgentMetricCard wrapper. Only this
              card uses the split; Cards 1+2 stay vertical. */}
          <Card
            tone="outline"
            padX={20}
            padY={20}
            style={{ ...detailStyles.agentMetricCard, ...detailStyles.agentMetricCardFull, ...detailStyles.lastRoleplaySplit }}
          >
            <div style={detailStyles.lastRoleplayLeft}>
              <span style={detailStyles.agentMetricTitle}>Last roleplay</span>
              <span style={{
                ...detailStyles.agentMetricNumber,
                color: upcoming ? "var(--color-text-tertiary)" : "var(--color-text-deep)",
              }}>
                {upcoming ? "—" : personalStats.lastRoleplay}
              </span>
            </div>
            <div style={detailStyles.lastRoleplayRight}>
              <MissionActivityHeatmap
                activity={generateActivity(mission.startDate, upcoming ? 0 : personalStats.roleplaysCompleted)}
                startDate={mission.startDate}
                endDate={mission.endDate}
                weekdays="weekday"
              />
            </div>
          </Card>
        </div>
      )}
      {!upcoming && !isAgent && (
        <Card tone="outline" padX={20} padY={20} style={detailStyles.kpiCard}>
          {tiles.map((t, i) => (
            <React.Fragment key={t.label}>
              {i > 0 && <div style={detailStyles.kpiDivider} aria-hidden="true" />}
              <div style={detailStyles.kpiTile}>
                <span style={detailStyles.kpiLabel}>{t.label}</span>
                <span style={detailStyles.kpiValue}>{t.value}</span>
              </div>
            </React.Fragment>
          ))}
        </Card>
      )}

      <Card tone="outline" padX={20} padY={20}>
        <div>
          <div style={detailStyles.perfTitle}>Mission Performance</div>
          <div style={detailStyles.perfSubtext}>
            {upcoming
              ? `Performance metrics will populate once the mission starts on ${formatStartDate(mission.startDate)}.`
              : isAgent
                ? "Your readiness across this mission's focus areas."
                : "Per-focus-area readiness across the cohort."
            }
          </div>
        </div>
        {/* Agent persona drops the cohort comparison tabs — only the
            focus-area view is meaningful for a single agent. */}
        {!isAgent && (
          <div style={detailStyles.perfTabs}>
            <TabsRow tabs={PERF_TABS} activeTab={perfTab} onTabClick={setPerfTab} />
          </div>
        )}
        <div style={detailStyles.perfTableWrap}>
          {performance.length === 0 ? (
            <div style={detailStyles.empty}>No performance data yet.</div>
          ) : isAgent || perfTab === "focus" ? (
            <FocusAreaTable rows={performance} upcoming={upcoming} hideStatus={isAgent || upcoming} />
          ) : (
            <table style={detailStyles.table}>
              <thead>
                <tr>
                  <th style={detailStyles.th}>Focus Area</th>
                  <th style={detailStyles.th}>Type</th>
                  <th style={detailStyles.thNum}>Target Score</th>
                  <th style={detailStyles.thNum}>Roleplays</th>
                  <th style={detailStyles.thNum}>% Target Met</th>
                </tr>
              </thead>
              <tbody>
                {performance.map((r) => {
                  const tone = targetMetColor(r.targetMet);
                  return (
                    <tr key={r.name}>
                      <td style={detailStyles.td}>{r.name}</td>
                      <td style={detailStyles.tdMuted}>{r.type}</td>
                      <td style={detailStyles.tdNum}>
                        {r.targetScore != null ? r.targetScore : "—"}
                      </td>
                      <td style={detailStyles.tdNum}>
                        {r.roleplays != null ? r.roleplays : "—"}
                      </td>
                      <td style={detailStyles.tdNum}>
                        {r.targetMet != null ? (
                          <span
                            style={{
                              ...detailStyles.pill,
                              color: tone.color,
                              background: tone.bg,
                            }}
                          >
                            {r.targetMet}%
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {!upcoming && (
      <Card tone="outline" padX={20} padY={20}>
        <div style={detailStyles.cardHeader}>
          <div>
            <div style={detailStyles.cardTitle}>Roleplay Interactions</div>
            <div style={detailStyles.cardSubtitle}>
              Sessions completed across this mission's agents.
            </div>
          </div>
        </div>

        {interactions.length === 0 ? (
          <div style={detailStyles.empty}>No interactions recorded yet.</div>
        ) : (
          <table style={detailStyles.table}>
            <thead>
              <tr>
                {!isAgent && <th style={detailStyles.th}>Agent</th>}
                <th style={detailStyles.th}>Contact Reason</th>
                <th style={detailStyles.th}>Duration</th>
                <th style={detailStyles.th}>Date</th>
                <th style={detailStyles.thNum}>QA Score</th>
              </tr>
            </thead>
            <tbody>
              {interactions.map((row) => (
                <tr key={row.id}>
                  {!isAgent && <td style={detailStyles.td}>{row.name}</td>}
                  <td style={detailStyles.tdMuted}>{row.contactReason}</td>
                  <td style={detailStyles.tdMuted}>{row.duration}</td>
                  <td style={detailStyles.tdMuted}>{row.date}</td>
                  <td style={{ ...detailStyles.tdNum, color: qaColor(row.qaScore), fontWeight: 600 }}>
                    {row.qaScore}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
      )}
    </div>
  );
}

function AgentStat({ label, value }) {
  return (
    <div style={detailStyles.agentStatRow}>
      <span style={detailStyles.agentStatLabel}>{label}</span>
      <span style={detailStyles.agentStatValue}>{value}</span>
    </div>
  );
}

// AgentMetricCard — header (small caps title) + body content slot.
// Three of these compose the Agent curtain's Overview row (Part E.1).
// Same Card primitive as everything else; the title row mirrors the
// existing card header treatment.
function AgentMetricCard({ title, children, fullWidth = false }) {
  return (
    <Card
      tone="outline"
      padX={20}
      padY={20}
      style={{
        ...detailStyles.agentMetricCard,
        ...(fullWidth ? detailStyles.agentMetricCardFull : null),
      }}
    >
      <span style={detailStyles.agentMetricTitle}>{title}</span>
      <div style={detailStyles.agentMetricBody}>{children}</div>
    </Card>
  );
}

// FocusAreaTable — By Focus Area readiness. Reuses the ActiveMissionCard
// bar + status-pill helpers verbatim so the bar fill and pill tone always
// agree (both driven by thresholdTone). The seed (PERF_ROWS_*) carries
// targetScore + targetMet but no explicit actual / status / gapPct, so they
// are derived: achieved = targetMet, met when achieved >= target, and
// gapPct = max(0, target - achieved). The leading icon is type-driven
// (ShieldCheck = policy, Sparkles = qualitative).
function FocusAreaTable({ rows, upcoming = false, hideStatus = false }) {
  // FA_COLS_UPCOMING already drops Status; reuse for the Agent
  // hide-Status case so the column metadata stays in one place.
  const cols = (upcoming || hideStatus) ? FA_COLS_UPCOMING : FA_COLS_FULL;
  const dropStatus = upcoming || hideStatus;
  return (
    <table style={detailStyles.faTable}>
      <colgroup>
        {cols.map((c) => (
          <col key={c.key} style={{ width: c.width }} />
        ))}
      </colgroup>
      <thead>
        <tr style={detailStyles.faHeadRow}>
          {cols.map((c) => (
            <th key={c.key} scope="col" style={{ ...detailStyles.faTh, textAlign: c.align || "left" }}>
              {c.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <FocusAreaRow
            key={r.name}
            row={r}
            isLast={i === rows.length - 1}
            upcoming={upcoming}
            hideStatus={dropStatus}
          />
        ))}
      </tbody>
    </table>
  );
}

function FocusAreaRow({ row, isLast, upcoming = false, hideStatus = false }) {
  const dropStatus = upcoming || hideStatus;
  const [hover, setHover] = React.useState(false);
  const target = row.targetScore;
  // Upcoming missions force actual to 0 + render a muted/neutral
  // progress track regardless of the seed data. Status column is
  // dropped entirely for Upcoming (Part D4).
  const actual = upcoming ? 0 : row.targetMet;
  const hasData = upcoming ? (target != null) : (target != null && actual != null);
  const status = !upcoming && hasData ? (actual >= target ? "met" : "below") : null;
  const gapPct = !upcoming && hasData ? Math.max(0, target - actual) : null;
  const tone = !upcoming && hasData ? thresholdTone(actual) : null;
  const Icon = row.type === "policy" ? ShieldCheck : Sparkles;
  const drillable = row.drillable && !upcoming;
  return (
    <tr
      onClick={drillable ? () => {} : undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...detailStyles.faRow,
        cursor: drillable ? "pointer" : "default",
        borderBottom: isLast ? "none" : "1px solid var(--table-row-border)",
        background: drillable && hover ? "var(--table-row-hover)" : "transparent",
      }}
    >
      <td style={detailStyles.faCell}>
        <span style={detailStyles.faName}>
          <Icon size={14} style={{ flexShrink: 0, color: "var(--color-icon-tertiary-fg)" }} />
          <span style={detailStyles.faNameText}>{row.name}</span>
        </span>
      </td>
      <td style={detailStyles.faCell}>
        <span style={detailStyles.faTarget}>{target != null ? `${target}%` : "—"}</span>
      </td>
      <td style={detailStyles.faCell}>
        {upcoming ? (
          <span style={detailStyles.achievedCell}>
            <ProgressBar value={0} targetPct={target} />
            <span style={{ ...detailStyles.faActual, color: "var(--color-text-tertiary)" }}>0%</span>
          </span>
        ) : hasData ? (
          <span style={detailStyles.achievedCell}>
            <ProgressBar value={actual} targetPct={target} />
            <span style={{ ...detailStyles.faActual, color: tone.fg }}>{actual}%</span>
          </span>
        ) : (
          <span style={detailStyles.faTarget}>—</span>
        )}
      </td>
      {!dropStatus && (
        <td style={detailStyles.faCell}>
          {hasData ? (
            <span style={detailStyles.statusCell}>
              <StatusPill status={status} gapPct={gapPct} actual={actual} />
              {row.drillable && (
                <ChevronRight size={14} style={{ color: "var(--color-text-tertiary)", flexShrink: 0 }} />
              )}
            </span>
          ) : (
            <span style={{ ...detailStyles.statusCell, color: "var(--color-text-tertiary)", fontSize: 13 }}>—</span>
          )}
        </td>
      )}
    </tr>
  );
}

const detailStyles = {
  container: (compact) => ({
    display: "flex",
    flexDirection: "column",
    gap: compact ? 16 : 20,
  }),
  kpiCard: {
    display: "flex",
    alignItems: "stretch",
  },
  // Agent persona top section — donut left, stat list right.
  agentTopCard: {
    display: "flex",
    alignItems: "center",
    gap: 24,
  },
  // Part E.2 — 2-row Overview layout: row 1 = Mission Progress +
  // Roleplays Completed (50/50), row 2 = Last Roleplay full-width
  // (`grid-column: 1 / -1`). Same gap as other inter-card spacing in
  // the curtain. Row-1 cards take equal heights via CSS Grid (each
  // grid item stretches its row automatically).
  agentMetricRow: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 16,
  },
  agentMetricCard: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    minWidth: 0,
  },
  agentMetricCardFull: {
    gridColumn: "1 / -1",
  },
  // Part E.3 — Last Roleplay internal 50/50 split (per follow-up
  // patch). Both columns top-aligned; gap matches the row 1 inter-
  // card gap (16px).
  lastRoleplaySplit: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 16,
    alignItems: "start",
  },
  lastRoleplayLeft: {
    display: "flex", flexDirection: "column", gap: 16,
    minWidth: 0,
  },
  lastRoleplayRight: {
    minWidth: 0,
    display: "flex",
    justifyContent: "flex-end",
  },
  agentMetricTitle: {
    fontFamily: "var(--font-sans)",
    fontSize: 11, fontWeight: 600, letterSpacing: "0.4px",
    color: "var(--color-text-tertiary)",
    textTransform: "uppercase",
  },
  agentMetricBody: {
    flex: 1,
    display: "flex", flexDirection: "column", gap: 12,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 0,
  },
  agentMetricNumber: {
    alignSelf: "stretch",
    fontFamily: "var(--font-sans)",
    fontSize: 24, fontWeight: 600, lineHeight: "32px", letterSpacing: "0.17px",
    color: "var(--color-text-deep)",
    textAlign: "left",
    fontVariantNumeric: "tabular-nums",
  },
  donutSlot: {
    width: "100%",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  sparkSlot: {
    width: "100%",
    minHeight: 32,
    display: "flex", alignItems: "center",
  },
  heatmapSlot: {
    width: "100%",
  },
  metricEmpty: {
    fontFamily: "var(--font-sans)",
    fontSize: 12, color: "var(--color-text-tertiary)",
    fontStyle: "italic",
    width: "100%", textAlign: "center",
  },
  agentStatList: {
    flex: 1, minWidth: 0,
    display: "flex", flexDirection: "column", gap: 16,
  },
  agentStatRow: {
    display: "flex", flexDirection: "column", gap: 4,
    paddingBottom: 12,
    borderBottom: "1px solid var(--color-border-card-soft)",
  },
  agentStatLabel: {
    fontFamily: "var(--font-sans)",
    fontSize: 11, fontWeight: 600, letterSpacing: "0.4px",
    color: "var(--color-text-tertiary)",
    textTransform: "uppercase",
  },
  agentStatValue: {
    fontFamily: "var(--font-sans)",
    fontSize: 18, fontWeight: 600, lineHeight: "24px",
    color: "var(--color-text-deep)",
  },
  kpiDivider: {
    width: 1,
    background: "var(--color-divider-card)",
    alignSelf: "stretch",
    flexShrink: 0,
  },
  kpiTile: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: 4,
    paddingInline: 16,
  },
  kpiLabel: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
    lineHeight: 1.2,
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    lineHeight: 1.2,
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    lineHeight: 1.4,
  },
  cardSubtitle: {
    fontSize: 13,
    fontWeight: 400,
    color: "var(--text-secondary)",
    marginTop: 2,
  },
  perfTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    lineHeight: 1.4,
  },
  perfSubtext: {
    fontSize: 13,
    fontWeight: 400,
    color: "var(--color-text-tertiary)",
    marginTop: 2,
    lineHeight: 1.4,
  },
  perfTabs: {
    marginTop: 16,
  },
  perfTableWrap: {
    marginTop: 12,
  },
  faTable: {
    width: "100%",
    borderCollapse: "collapse",
    tableLayout: "fixed",
    fontFamily: "var(--font-sans)",
  },
  faHeadRow: {
    borderBottom: "1px solid var(--table-header-border)",
  },
  faTh: {
    padding: "10px 0",
    textAlign: "left",
    fontSize: 12,
    fontWeight: 700,
    color: "var(--text-primary)",
    letterSpacing: "0.2px",
    whiteSpace: "nowrap",
  },
  faRow: {
    height: 52,
    transition: "background 120ms ease",
  },
  faCell: {
    padding: 0,
    verticalAlign: "middle",
  },
  faName: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    width: "100%",
    minWidth: 0,
  },
  faNameText: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text-deep)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    minWidth: 0,
  },
  faTarget: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
  },
  achievedCell: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "100%",
    paddingRight: 16,
  },
  faActual: {
    fontSize: 13,
    fontWeight: 600,
    flexShrink: 0,
    fontVariantNumeric: "tabular-nums",
  },
  statusCell: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
    width: "100%",
  },
  empty: {
    padding: "32px 0",
    textAlign: "center",
    color: "var(--color-text-tertiary)",
    fontSize: 13,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 13,
  },
  th: {
    textAlign: "left",
    padding: "10px 12px",
    fontSize: 12,
    fontWeight: 600,
    color: "var(--color-text-tertiary)",
    borderBottom: "1px solid var(--color-divider-card)",
  },
  thNum: {
    textAlign: "right",
    padding: "10px 12px",
    fontSize: 12,
    fontWeight: 600,
    color: "var(--color-text-tertiary)",
    borderBottom: "1px solid var(--color-divider-card)",
  },
  td: {
    padding: "10px 12px",
    color: "var(--color-text-deep)",
    fontWeight: 500,
  },
  tdMuted: {
    padding: "10px 12px",
    color: "var(--text-secondary)",
  },
  tdNum: {
    padding: "10px 12px",
    color: "var(--color-text-deep)",
    textAlign: "right",
    fontVariantNumeric: "tabular-nums",
  },
  pill: {
    display: "inline-flex",
    alignItems: "center",
    padding: "2px 8px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
  },
};
