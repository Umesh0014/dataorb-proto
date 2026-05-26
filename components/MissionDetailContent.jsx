"use client";

import React from "react";
import { ShieldCheck, Sparkles, ChevronRight } from "lucide-react";
import Card from "./Card";
import TabsRow from "./TabsRow";
import { thresholdTone, ProgressBar, StatusPill } from "./ActiveMissionCard";

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

const FA_COLS = [
  { key: "name", label: "Focus Area", width: "36%" },
  { key: "target", label: "Target", width: "14%" },
  { key: "achieved", label: "Achieved", width: "32%" },
  { key: "status", label: "Status", width: "18%", align: "right" },
];

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

export default function MissionDetailContent({ mission, compact = false }) {
  const [perfTab, setPerfTab] = React.useState("focus");
  const k = mission.kpis || {};

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

      <Card tone="outline" padX={20} padY={20}>
        <div>
          <div style={detailStyles.perfTitle}>Mission Performance</div>
          <div style={detailStyles.perfSubtext}>
            Per-focus-area readiness across the cohort.
          </div>
        </div>
        <div style={detailStyles.perfTabs}>
          <TabsRow tabs={PERF_TABS} activeTab={perfTab} onTabClick={setPerfTab} />
        </div>
        <div style={detailStyles.perfTableWrap}>
          {performance.length === 0 ? (
            <div style={detailStyles.empty}>No performance data yet.</div>
          ) : perfTab === "focus" ? (
            <FocusAreaTable rows={performance} />
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
                <th style={detailStyles.th}>Agent</th>
                <th style={detailStyles.th}>Contact Reason</th>
                <th style={detailStyles.th}>Duration</th>
                <th style={detailStyles.th}>Date</th>
                <th style={detailStyles.thNum}>QA Score</th>
              </tr>
            </thead>
            <tbody>
              {interactions.map((row) => (
                <tr key={row.id}>
                  <td style={detailStyles.td}>{row.name}</td>
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
    </div>
  );
}

// FocusAreaTable — By Focus Area readiness. Reuses the ActiveMissionCard
// bar + status-pill helpers verbatim so the bar fill and pill tone always
// agree (both driven by thresholdTone). The seed (PERF_ROWS_*) carries
// targetScore + targetMet but no explicit actual / status / gapPct, so they
// are derived: achieved = targetMet, met when achieved >= target, and
// gapPct = max(0, target - achieved). The leading icon is type-driven
// (ShieldCheck = policy, Sparkles = qualitative).
function FocusAreaTable({ rows }) {
  return (
    <table style={detailStyles.faTable}>
      <colgroup>
        {FA_COLS.map((c) => (
          <col key={c.key} style={{ width: c.width }} />
        ))}
      </colgroup>
      <thead>
        <tr style={detailStyles.faHeadRow}>
          {FA_COLS.map((c) => (
            <th key={c.key} scope="col" style={{ ...detailStyles.faTh, textAlign: c.align || "left" }}>
              {c.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <FocusAreaRow key={r.name} row={r} isLast={i === rows.length - 1} />
        ))}
      </tbody>
    </table>
  );
}

function FocusAreaRow({ row, isLast }) {
  const [hover, setHover] = React.useState(false);
  const target = row.targetScore;
  const actual = row.targetMet;
  // Some missions seed empty (null) focus-area metrics — render an em-dash
  // rather than a degenerate 0%/Met row.
  const hasData = target != null && actual != null;
  const status = hasData ? (actual >= target ? "met" : "below") : null;
  const gapPct = hasData ? Math.max(0, target - actual) : null;
  const tone = hasData ? thresholdTone(actual) : null;
  const Icon = row.type === "policy" ? ShieldCheck : Sparkles;
  return (
    <tr
      onClick={row.drillable ? () => {} : undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...detailStyles.faRow,
        cursor: row.drillable ? "pointer" : "default",
        borderBottom: isLast ? "none" : "1px solid var(--table-row-border)",
        background: row.drillable && hover ? "var(--table-row-hover)" : "transparent",
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
        {hasData ? (
          <span style={detailStyles.achievedCell}>
            <ProgressBar value={actual} targetPct={target} />
            <span style={{ ...detailStyles.faActual, color: tone.fg }}>{actual}%</span>
          </span>
        ) : (
          <span style={detailStyles.faTarget}>—</span>
        )}
      </td>
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
