"use client";

import React from "react";
import Card from "./Card";
import TabsRow from "./TabsRow";

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
      <Card padX={24} padY={20} style={detailStyles.kpiCard}>
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

      <Card padX={24} padY={20}>
        <div style={detailStyles.cardHeader}>
          <div>
            <div style={detailStyles.cardTitle}>Mission Performance</div>
            <div style={detailStyles.cardSubtitle}>
              Per-focus-area readiness across the cohort.
            </div>
          </div>
          <TabsRow tabs={PERF_TABS} activeTab={perfTab} onTabClick={setPerfTab} />
        </div>

        {performance.length === 0 ? (
          <div style={detailStyles.empty}>No performance data yet.</div>
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
      </Card>

      <Card padX={24} padY={20}>
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

const detailStyles = {
  container: (compact) => ({
    display: "flex",
    flexDirection: "column",
    gap: compact ? 12 : 20,
  }),
  kpiCard: {
    display: "flex",
    alignItems: "stretch",
    padding: "16px 24px",
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
