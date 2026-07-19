"use client";

import React from "react";
import { SlidersHorizontal, X, ArrowUp, ArrowDown } from "lucide-react";
import Card from "./Card";
import PageHeader from "./PageHeader";
import BulkActionBar from "./BulkActionBar";
import ThresholdConfig from "./ThresholdConfig";
import { COMPETENCIES, DEFAULT_THRESHOLDS, DEFAULT_MIN_INTERACTIONS, matrixData, agentCompetencyDetail } from "./mocks/improveLanes";

// ImproveMatrix (Direction C) — Agent × Competency heatmap matrix.
// Mental model: "See the whole picture at a glance, spot clusters, then drill."
// Structure: PageHeader with filter toggle → compact grid (agents as rows,
// competencies as columns), each cell colored by status. Filter config Card
// docked on the right. Click a cell → coaching detail on right.

export default function ImproveMatrix() {
  const [thresholds, setThresholds] = React.useState(DEFAULT_THRESHOLDS);
  const [minInteractions] = React.useState(DEFAULT_MIN_INTERACTIONS);
  const [selected, setSelected] = React.useState(null);
  const [selectedAgents, setSelectedAgents] = React.useState(new Set());
  const [showConfig, setShowConfig] = React.useState(false);
  const [highlightCol, setHighlightCol] = React.useState(null);
  const [sortCol, setSortCol] = React.useState(null); // { col: index, dir: "asc" | "desc" }

  const rawData = matrixData(thresholds, minInteractions);
  const data = React.useMemo(() => {
    if (sortCol == null) return rawData;
    const { col, dir } = sortCol;
    return [...rawData].sort((a, b) => {
      const aScore = a.cells[col].score ?? -1;
      const bScore = b.cells[col].score ?? -1;
      return dir === "asc" ? aScore - bScore : bScore - aScore;
    });
  }, [rawData, sortCol]);
  const detail = selected ? agentCompetencyDetail(selected.agentId, selected.competencyId, thresholds) : null;

  const colCounts = COMPETENCIES.map((c, ci) => ({
    ...c,
    count: data.filter((row) => row.cells[ci].status === "critical" || row.cells[ci].status === "warning").length,
  }));

  return (
    <div style={styles.page}>
      <PageHeader
        identifier={{ label: "Improve", withDropdown: false }}
        toolbar={[
          { id: "config", icon: <SlidersHorizontal size={18} />, label: "Thresholds", onClick: () => setShowConfig(!showConfig), active: showConfig },
        ]}
      />

      <div style={styles.legend}>
        <span style={{ ...styles.dot, background: "var(--color-error)" }} /> Critical
        <span style={{ ...styles.dot, background: "var(--color-warning)", marginLeft: 12 }} /> Warning
        <span style={{ ...styles.dot, background: "var(--color-success)", marginLeft: 12 }} /> On track
        <span style={{ ...styles.dot, background: "var(--color-text-tertiary)", opacity: 0.3, marginLeft: 12 }} /> Insufficient data
      </div>

      <div style={styles.body}>
        <div style={styles.matrixWrap}>
          <Card padX={0} padY={0} style={{ overflow: "auto" }}>
            <table style={styles.table} role="grid" aria-label="Agent competency matrix">
              <thead>
                <tr>
                  <th style={styles.cornerThCheck}>
                    <input
                      type="checkbox"
                      checked={data.length > 0 && selectedAgents.size === data.length}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedAgents(new Set(data.map((r) => r.id)));
                        else setSelectedAgents(new Set());
                      }}
                      style={styles.checkbox}
                      aria-label="Select all agents"
                    />
                  </th>
                  <th style={styles.cornerTh}>Agent</th>
                  {colCounts.map((c, ci) => (
                    <th
                      key={c.id}
                      style={{
                        ...styles.colTh,
                        ...(highlightCol === ci ? styles.colThHighlight : {}),
                      }}
                    >
                      <button
                        type="button"
                        className="im-focusable"
                        style={styles.colBtn}
                        onClick={() => {
                          setHighlightCol(highlightCol === ci ? null : ci);
                          setSortCol((prev) => {
                            if (prev?.col === ci) return prev.dir === "asc" ? { col: ci, dir: "desc" } : null;
                            return { col: ci, dir: "asc" };
                          });
                        }}
                        aria-pressed={highlightCol === ci}
                      >
                        <span style={styles.colLabel}>
                          {c.label}
                          {sortCol?.col === ci && (
                            sortCol.dir === "asc"
                              ? <ArrowUp size={10} style={{ marginLeft: 2, verticalAlign: "middle" }} />
                              : <ArrowDown size={10} style={{ marginLeft: 2, verticalAlign: "middle" }} />
                          )}
                        </span>
                        {c.count > 0 && <span style={styles.colBadge}>{c.count}</span>}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.id} style={selectedAgents.has(row.id) ? { background: "var(--color-success-bg, #E8F5E9)" } : undefined}>
                    <td style={styles.checkTd}>
                      <input
                        type="checkbox"
                        checked={selectedAgents.has(row.id)}
                        onChange={() => {
                          setSelectedAgents((prev) => {
                            const next = new Set(prev);
                            if (next.has(row.id)) next.delete(row.id);
                            else next.add(row.id);
                            return next;
                          });
                        }}
                        style={styles.checkbox}
                        aria-label={`Select ${row.name}`}
                      />
                    </td>
                    <td style={styles.agentTd}>
                      <span style={styles.agentCell}>
                        <span style={styles.avatar}>{row.initials}</span>
                        <span style={styles.agentName}>{row.name}</span>
                      </span>
                    </td>
                    {row.cells.map((cell, ci) => {
                      const isSelected = selected?.agentId === row.id && selected?.competencyId === COMPETENCIES[ci].id;
                      const isHighlighted = highlightCol === ci && (cell.status === "critical" || cell.status === "warning");
                      const trend = row.trends?.[COMPETENCIES[ci].id];
                      return (
                        <td key={ci} style={styles.cellTd}>
                          <button
                            type="button"
                            className="im-focusable im-no-motion"
                            onClick={() => {
                              if (cell.status === "na") return;
                              setSelected({ agentId: row.id, competencyId: COMPETENCIES[ci].id });
                            }}
                            disabled={cell.status === "na"}
                            style={{
                              ...styles.cellBtn,
                              ...CELL_STYLES[cell.status],
                              ...(isSelected ? styles.cellSelected : {}),
                              ...(isHighlighted ? styles.cellHighlighted : {}),
                            }}
                            aria-label={`${row.name} — ${COMPETENCIES[ci].label}: ${cell.score != null ? cell.score + "%" : "N/A"}`}
                          >
                            <span>{cell.score != null ? cell.score : "—"}</span>
                            {trend && <CellSparkline points={trend} />}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <BulkActionBar
            count={selectedAgents.size}
            onAction={(actionId) => { /* TODO: dispatch bulk action */ }}
            onClear={() => setSelectedAgents(new Set())}
          />
        </div>

        {(showConfig || detail) && (
          <aside style={styles.rightPanel}>
            {showConfig && (
              <ThresholdConfig
                thresholds={thresholds}
                onChange={setThresholds}
                onClose={() => setShowConfig(false)}
              />
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

function CellSparkline({ points }) {
  if (!points || points.length < 2) return null;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const w = 36;
  const h = 12;
  const coords = points.map((p, i) => `${(i / (points.length - 1)) * w},${h - ((p - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block" }} aria-hidden="true">
      <polyline points={coords} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" opacity={0.6} />
    </svg>
  );
}

const CELL_STYLES = {
  critical: { background: "var(--color-error-bg)", color: "var(--color-error-text)" },
  warning: { background: "var(--color-warning-bg, #FFF3E0)", color: "var(--color-warning-text)" },
  ok: { background: "var(--color-success-bg, #E8F5E9)", color: "var(--color-success-text, #2E7D32)" },
  na: { background: "var(--surface-alt, #F1F3F9)", color: "var(--color-text-tertiary)", opacity: 0.5, cursor: "default" },
};

const styles = {
  page: { display: "flex", flexDirection: "column", gap: 16 },
  legend: { margin: 0, fontSize: 12, color: "var(--color-text-tertiary)", display: "flex", alignItems: "center", gap: 5 },
  dot: { width: 10, height: 10, borderRadius: 3, display: "inline-block" },
  body: { display: "flex", gap: 20, alignItems: "flex-start" },
  matrixWrap: { flex: 1, minWidth: 0 },
  table: { width: "100%", borderCollapse: "separate", borderSpacing: 3, fontFamily: "var(--font-sans)" },
  cornerThCheck: { padding: "10px 8px", width: 32, verticalAlign: "middle" },
  checkbox: { width: 16, height: 16, cursor: "pointer", accentColor: "var(--do-brand-blue)" },
  checkTd: { padding: "4px 8px", verticalAlign: "middle", width: 32 },
  cornerTh: { padding: "10px 12px", textAlign: "start", fontSize: 12, fontWeight: 700, color: "var(--text-primary)", width: 150 },
  colTh: { padding: "6px 4px", textAlign: "center", verticalAlign: "bottom" },
  colThHighlight: { background: "var(--nav-rail-bg, #E8ECFF)", borderRadius: 6 },
  colBtn: { all: "unset", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, width: "100%" },
  colLabel: { fontSize: 11, fontWeight: 700, color: "var(--color-text-medium)", whiteSpace: "nowrap" },
  colBadge: { fontSize: 10, fontWeight: 700, padding: "1px 5px", borderRadius: 8, background: "var(--color-error-bg)", color: "var(--color-error-text)" },
  agentTd: { padding: "4px 12px" },
  agentCell: { display: "inline-flex", alignItems: "center", gap: 8 },
  avatar: { width: 24, height: 24, borderRadius: 12, background: "var(--color-icon-tertiary-bg)", color: "var(--color-icon-tertiary-fg)", display: "grid", placeItems: "center", fontSize: 9, fontWeight: 700, textTransform: "uppercase", flexShrink: 0 },
  agentName: { fontSize: 12, fontWeight: 600, color: "var(--do-ink)", whiteSpace: "nowrap" },
  cellTd: { padding: 2, textAlign: "center" },
  cellBtn: {
    all: "unset",
    cursor: "pointer",
    minWidth: 64,
    height: 36,
    padding: "0 6px",
    borderRadius: 6,
    display: "inline-flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    fontSize: 12,
    fontWeight: 700,
    transition: "transform 150ms ease, box-shadow 150ms ease",
  },
  cellSelected: { outline: "2px solid var(--do-brand-blue)", outlineOffset: -2, transform: "scale(1.08)" },
  cellHighlighted: { boxShadow: "0 0 0 2px var(--do-brand-blue)" },
  rightPanel: { width: 320, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 24 },
  closeBtn: { all: "unset", cursor: "pointer", width: 28, height: 28, borderRadius: 6, display: "grid", placeItems: "center", color: "var(--color-text-tertiary)" },
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
