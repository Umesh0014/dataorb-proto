"use client";

import React from "react";
import { Settings2, X, TrendingDown } from "lucide-react";
import Card from "./Card";
import PageHeader from "./PageHeader";
import { COMPETENCIES, DEFAULT_THRESHOLDS, DEFAULT_MIN_INTERACTIONS, agentsInLane, laneCountsAll, agentCompetencyDetail } from "./mocks/improveLanes";

// ImproveTable (Direction B) — Severity-ranked combined table.
// Mental model: "See everyone who needs help, sorted by gap size — worst first."
// Structure: PageHeader with filter toggle → single table of ALL agents below
// threshold across ALL competencies, ranked by gap descending. Filter config
// Card docked on the right. Click a row → coaching detail replaces config Card.

export default function ImproveTable() {
  const [thresholds, setThresholds] = React.useState(DEFAULT_THRESHOLDS);
  const [minInteractions] = React.useState(DEFAULT_MIN_INTERACTIONS);
  const [selected, setSelected] = React.useState(null);
  const [showConfig, setShowConfig] = React.useState(false);

  const allBelow = React.useMemo(() => {
    const items = [];
    COMPETENCIES.forEach((c) => {
      agentsInLane(c.id, thresholds, minInteractions).forEach((agent) => {
        const score = agent.scores[c.id];
        const gap = thresholds[c.id] - score;
        items.push({ agent, competency: c, score, gap, interactions: agent.interactions[c.id] });
      });
    });
    items.sort((a, b) => b.gap - a.gap);
    return items;
  }, [thresholds, minInteractions]);

  const detail = selected ? agentCompetencyDetail(selected.agentId, selected.competencyId, thresholds) : null;

  return (
    <div style={styles.page}>
      <PageHeader
        identifier={{ label: "Improve", withDropdown: false }}
        toolbar={[
          { id: "config", icon: <Settings2 size={18} />, label: "Thresholds", onClick: () => setShowConfig(!showConfig), active: showConfig },
        ]}
      />

      <div style={styles.body}>
        <div style={styles.tableWrap}>
          <Card padX={0} padY={0} style={{ overflow: "hidden" }}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.headRow}>
                  <th style={styles.th}>Agent</th>
                  <th style={styles.th}>Competency</th>
                  <th style={styles.th}>Score</th>
                  <th style={styles.th}>Gap</th>
                  <th style={styles.th}>Interactions</th>
                </tr>
              </thead>
              <tbody>
                {allBelow.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={styles.emptyCell}>
                      All agents are above threshold across every competency.
                    </td>
                  </tr>
                ) : (
                  allBelow.map((item, i) => {
                    const isSelected = selected?.agentId === item.agent.id && selected?.competencyId === item.competency.id;
                    return (
                      <tr
                        key={`${item.agent.id}-${item.competency.id}`}
                        onClick={() => setSelected({ agentId: item.agent.id, competencyId: item.competency.id })}
                        style={{
                          ...styles.row,
                          background: isSelected ? "var(--nav-rail-bg, #E8ECFF)" : undefined,
                          borderBottom: i === allBelow.length - 1 ? "none" : "1px solid var(--table-row-border, rgba(0,0,0,0.06))",
                        }}
                      >
                        <td style={styles.cell}>
                          <span style={styles.agentCell}>
                            <span style={styles.avatar}>{item.agent.initials}</span>
                            <span style={styles.agentName}>{item.agent.name}</span>
                          </span>
                        </td>
                        <td style={styles.cell}>
                          <span style={styles.compChip}>{item.competency.label}</span>
                        </td>
                        <td style={styles.cell}>
                          <span style={styles.scoreText}>{item.score}%</span>
                        </td>
                        <td style={styles.cell}>
                          <span style={styles.gapChip}>-{item.gap}%</span>
                        </td>
                        <td style={styles.cell}>
                          <span style={styles.interactionCount}>{item.interactions}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </Card>
        </div>

        {(showConfig || detail) && (
          <aside style={styles.rightPanel}>
            {showConfig && (
              <Card padX={20} padY={16}>
                <div style={styles.configHeader}>
                  <h4 style={styles.configTitle}>Thresholds</h4>
                  <button type="button" className="im-focusable" onClick={() => setShowConfig(false)} style={styles.closeBtn} aria-label="Close config">
                    <X size={16} />
                  </button>
                </div>
                <div style={styles.configGrid}>
                  {COMPETENCIES.map((c) => (
                    <label key={c.id} style={styles.configItem}>
                      <span style={styles.configLabel}>{c.label}</span>
                      <input
                        type="number"
                        value={thresholds[c.id]}
                        onChange={(e) => setThresholds((t) => ({ ...t, [c.id]: Number(e.target.value) }))}
                        style={styles.configInput}
                        min={0}
                        max={100}
                      />
                    </label>
                  ))}
                </div>
              </Card>
            )}

            {detail && (
              <Card padX={20} padY={16}>
                <div style={styles.sidecarHeader}>
                  <div>
                    <h3 style={styles.sidecarTitle}>{detail.agent.name}</h3>
                    <p style={styles.sidecarSub}>{detail.competency.label} — {detail.score}{detail.competency.unit} / {detail.threshold}{detail.competency.unit}</p>
                  </div>
                  <button type="button" className="im-focusable" onClick={() => setSelected(null)} style={styles.closeBtn} aria-label="Close">
                    <X size={16} />
                  </button>
                </div>

                <div style={styles.section}>
                  <h4 style={styles.sectionH4}>Why</h4>
                  <p style={styles.sectionText}>{detail.whyText}</p>
                  {detail.topDrivers.length > 0 && (
                    <p style={styles.sectionText}>Top drivers: {detail.topDrivers.join(", ")}</p>
                  )}
                </div>

                {detail.trend && (
                  <div style={styles.section}>
                    <h4 style={styles.sectionH4}>Trend</h4>
                    <MiniTrend points={detail.trend} threshold={detail.threshold} unit={detail.competency.unit} />
                  </div>
                )}

                <div style={styles.section}>
                  <h4 style={styles.sectionH4}>Actions</h4>
                  <div style={styles.actionsList}>
                    {detail.actions.map((a) => (
                      <div key={a.kind} style={styles.actionRow}>
                        <span style={styles.actionLabel}>{a.label}</span>
                        <span style={styles.actionDuration}>{a.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <p style={styles.sampleNote}>Based on {detail.interactions} interactions.</p>
              </Card>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}

function MiniTrend({ points, threshold, unit }) {
  if (!points || points.length === 0) return null;
  const max = Math.max(...points, threshold);
  const min = Math.min(...points) - 5;
  const range = max - min || 1;
  const w = 200;
  const h = 48;
  const coords = points.map((p, i) => `${(i / (points.length - 1)) * w},${h - ((p - min) / range) * h}`).join(" ");
  const threshY = h - ((threshold - min) / range) * h;
  return (
    <svg width={w} height={h + 16} style={{ display: "block" }} aria-hidden="true">
      <line x1={0} y1={threshY} x2={w} y2={threshY} stroke="var(--color-error)" strokeWidth={1} strokeDasharray="4 3" />
      <polyline points={coords} fill="none" stroke="var(--do-brand-blue)" strokeWidth={2} strokeLinejoin="round" />
      <text x={w + 4} y={threshY + 4} style={{ fontSize: 10, fill: "var(--color-error)" }}>{threshold}{unit}</text>
    </svg>
  );
}

const styles = {
  page: { display: "flex", flexDirection: "column", gap: 16 },
  body: { display: "flex", gap: 20, alignItems: "flex-start" },
  tableWrap: { flex: 1, minWidth: 0 },
  table: { width: "100%", borderCollapse: "collapse", tableLayout: "fixed", fontFamily: "var(--font-sans)" },
  headRow: { borderBottom: "1px solid var(--table-header-border, rgba(0,0,0,0.08))" },
  th: { padding: "12px 16px", textAlign: "start", fontSize: 12, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "0.2px" },
  row: { height: 52, cursor: "pointer", transition: "background 150ms ease" },
  cell: { padding: "0 16px", verticalAlign: "middle", fontSize: 13, color: "var(--do-ink)" },
  emptyCell: { padding: "40px 16px", textAlign: "center", fontSize: 13, color: "var(--color-text-tertiary)" },
  agentCell: { display: "inline-flex", alignItems: "center", gap: 10 },
  avatar: { width: 28, height: 28, borderRadius: 14, background: "var(--color-icon-tertiary-bg)", color: "var(--color-icon-tertiary-fg)", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700, textTransform: "uppercase", flexShrink: 0 },
  agentName: { fontSize: 13, fontWeight: 600, color: "var(--do-ink)" },
  compChip: { fontSize: 12, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: "var(--surface-alt, #F1F3F9)", color: "var(--color-text-medium)" },
  scoreText: { fontSize: 13, fontWeight: 600, color: "var(--do-ink)" },
  gapChip: { fontSize: 12, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: "var(--color-error-bg)", color: "var(--color-error-text)" },
  interactionCount: { fontSize: 13, color: "var(--color-text-medium)" },
  rightPanel: { width: 320, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 24 },
  configHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  configTitle: { margin: 0, fontSize: 14, fontWeight: 700, color: "var(--color-text-deep)" },
  closeBtn: { all: "unset", cursor: "pointer", width: 28, height: 28, borderRadius: 6, display: "grid", placeItems: "center", color: "var(--color-text-tertiary)" },
  configGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  configItem: { display: "flex", flexDirection: "column", gap: 4 },
  configLabel: { fontSize: 12, fontWeight: 600, color: "var(--color-text-medium)" },
  configInput: { width: "100%", padding: "4px 8px", borderRadius: 6, border: "1px solid var(--color-divider-card, rgba(0,0,0,0.12))", fontSize: 13, fontWeight: 600, fontFamily: "var(--font-sans)" },
  sidecarHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  sidecarTitle: { margin: 0, fontSize: 16, fontWeight: 700, color: "var(--color-text-deep)" },
  sidecarSub: { margin: "4px 0 0", fontSize: 13, color: "var(--color-text-tertiary)" },
  section: { marginBottom: 12, paddingTop: 10, borderTop: "1px solid var(--color-divider-card, rgba(0,0,0,0.06))" },
  sectionH4: { margin: "0 0 6px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.4px", color: "var(--color-text-tertiary)" },
  sectionText: { margin: "0 0 6px", fontSize: 13, lineHeight: 1.5, color: "var(--color-text-medium)" },
  actionsList: { display: "flex", flexDirection: "column", gap: 6 },
  actionRow: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, background: "var(--surface-alt, #F1F3F9)" },
  actionLabel: { flex: 1, fontSize: 13, fontWeight: 600, color: "var(--color-text-deep)" },
  actionDuration: { fontSize: 12, color: "var(--color-text-tertiary)" },
  sampleNote: { margin: "12px 0 0", fontSize: 11, color: "var(--color-text-tertiary)", fontStyle: "italic" },
};
