"use client";

import React from "react";
import { Settings2, ChevronRight, X, FileText, Target, MessageSquare, Flag, TrendingDown } from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import PageHeader from "./PageHeader";
import { COMPETENCIES, DEFAULT_THRESHOLDS, DEFAULT_MIN_INTERACTIONS, agentsInLane, laneCountsAll, agentCompetencyDetail } from "./mocks/improveLanes";

// ImproveTable (Direction B) — Tabbed table + persistent sidecar.
// Mental model: "Pick your focus competency, then work the list."
// Carries the Intervene pattern: top lane bar (tabs with counts) → filtered
// table (~70%) + persistent sidecar (~30%). The TL selects one competency
// at a time, sees every agent below threshold in a scannable table, clicks
// a row to load the sidecar with "why" + coaching actions.
// Closest cousin to Intervene's inbox-review-dispatch pattern.

export default function ImproveTable() {
  const [thresholds, setThresholds] = React.useState(DEFAULT_THRESHOLDS);
  const [minInteractions] = React.useState(DEFAULT_MIN_INTERACTIONS);
  const [activeLane, setActiveLane] = React.useState(COMPETENCIES[0].id);
  const [selectedAgent, setSelectedAgent] = React.useState(null);
  const [showConfig, setShowConfig] = React.useState(false);

  const lanes = laneCountsAll(thresholds, minInteractions);
  const agents = agentsInLane(activeLane, thresholds, minInteractions);
  const activeMeta = COMPETENCIES.find((c) => c.id === activeLane);
  const detail = selectedAgent ? agentCompetencyDetail(selectedAgent, activeLane, thresholds) : null;

  return (
    <div style={tStyles.page}>
      <PageHeader
        identifier={{ label: "Improve", withDropdown: false }}
        description="Focus on one competency at a time — review and dispatch coaching"
      />

      {/* Lane bar */}
      <div style={tStyles.laneBar} role="tablist" aria-label="Competency lanes">
        {lanes.map((lane) => {
          const active = lane.id === activeLane;
          return (
            <button
              key={lane.id}
              type="button"
              role="tab"
              className="im-focusable"
              aria-selected={active}
              onClick={() => { setActiveLane(lane.id); setSelectedAgent(null); }}
              style={{ ...tStyles.tab, ...(active ? tStyles.tabActive : {}) }}
            >
              <span style={tStyles.tabLabel}>{lane.label}</span>
              {lane.count > 0 && (
                <span style={{ ...tStyles.tabBadge, ...(active ? tStyles.tabBadgeActive : {}) }}>
                  {lane.count}
                </span>
              )}
            </button>
          );
        })}
        <button
          type="button"
          className="im-focusable"
          onClick={() => setShowConfig(!showConfig)}
          style={tStyles.configBtn}
          aria-label="Configure thresholds"
        >
          <Settings2 size={16} />
        </button>
      </div>

      {/* Threshold config (inline) */}
      {showConfig && (
        <Card padX={20} padY={16}>
          <div style={tStyles.configGrid}>
            {COMPETENCIES.map((c) => (
              <label key={c.id} style={tStyles.configItem}>
                <span style={tStyles.configLabel}>{c.label}</span>
                <div style={tStyles.configInputWrap}>
                  <span style={tStyles.configLt}>&lt;</span>
                  <input
                    type="number"
                    value={thresholds[c.id]}
                    onChange={(e) => setThresholds((t) => ({ ...t, [c.id]: Number(e.target.value) }))}
                    style={tStyles.configInput}
                    min={0}
                    max={100}
                  />
                  <span style={tStyles.configUnit}>{c.unit}</span>
                </div>
              </label>
            ))}
          </div>
        </Card>
      )}

      {/* Body: table + sidecar */}
      <div style={tStyles.body}>
        <div style={tStyles.tableWrap}>
          <Card padX={0} padY={0} style={{ overflow: "hidden" }}>
            <table style={tStyles.table}>
              <thead>
                <tr style={tStyles.headRow}>
                  <th style={tStyles.th}>Agent</th>
                  <th style={tStyles.th}>{activeMeta?.metric || "Score"}</th>
                  <th style={tStyles.th}>Gap</th>
                  <th style={tStyles.th}>Interactions</th>
                  <th style={tStyles.th}>Recommended</th>
                </tr>
              </thead>
              <tbody>
                {agents.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={tStyles.emptyCell}>
                      No agents below the {thresholds[activeLane]}% threshold for {activeMeta?.label}. Adjust threshold or check another lane.
                    </td>
                  </tr>
                ) : (
                  agents.map((agent, i) => {
                    const score = agent.scores[activeLane];
                    const gap = thresholds[activeLane] - score;
                    const isSelected = selectedAgent === agent.id;
                    const detail = agentCompetencyDetail(agent.id, activeLane, thresholds);
                    return (
                      <tr
                        key={agent.id}
                        onClick={() => setSelectedAgent(agent.id)}
                        style={{
                          ...tStyles.row,
                          background: isSelected ? "var(--nav-rail-bg, #E8ECFF)" : undefined,
                          borderBottom: i === agents.length - 1 ? "none" : "1px solid var(--table-row-border, rgba(0,0,0,0.06))",
                        }}
                      >
                        <td style={tStyles.cell}>
                          <span style={tStyles.agentCell}>
                            <span style={tStyles.avatar}>{agent.initials}</span>
                            <span style={tStyles.agentName}>{agent.name}</span>
                          </span>
                        </td>
                        <td style={tStyles.cell}>
                          <span style={tStyles.scoreText}>{score}%</span>
                        </td>
                        <td style={tStyles.cell}>
                          <span style={tStyles.gapChip}>-{gap}%</span>
                        </td>
                        <td style={tStyles.cell}>
                          <span style={tStyles.interactionCount}>{agent.interactions[activeLane]}</span>
                        </td>
                        <td style={tStyles.cell}>
                          <span style={tStyles.actionChip}>
                            {detail?.actions[0]?.label || "—"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </Card>
        </div>

        {/* Sidecar */}
        {detail && (
          <aside style={tStyles.sidecar} role="complementary" aria-label="Agent coaching detail">
            <div style={tStyles.sidecarInner}>
              <div style={tStyles.sidecarHeader}>
                <div>
                  <h3 style={tStyles.sidecarTitle}>{detail.agent.name}</h3>
                  <p style={tStyles.sidecarSub}>{detail.competency.label} — {detail.score}{detail.competency.unit} / {detail.threshold}{detail.competency.unit}</p>
                </div>
                <button type="button" className="im-focusable" onClick={() => setSelectedAgent(null)} style={tStyles.closeBtn} aria-label="Close">
                  <X size={18} />
                </button>
              </div>

              <div style={tStyles.sidecarSection}>
                <h4 style={tStyles.sidecarH4}>Why this agent needs coaching</h4>
                <p style={tStyles.sidecarText}>{detail.whyText}</p>
                {detail.topDrivers.length > 0 && (
                  <p style={tStyles.sidecarText}><strong>Top drivers:</strong> {detail.topDrivers.join(", ")}</p>
                )}
              </div>

              {detail.trend && (
                <div style={tStyles.sidecarSection}>
                  <h4 style={tStyles.sidecarH4}>Trend</h4>
                  <MiniTrend points={detail.trend} threshold={detail.threshold} unit={detail.competency.unit} />
                </div>
              )}

              <div style={tStyles.sidecarSection}>
                <h4 style={tStyles.sidecarH4}>Actions</h4>
                <div style={tStyles.actionsList}>
                  {detail.actions.map((a) => (
                    <ActionButton key={a.kind} action={a} />
                  ))}
                </div>
              </div>

              <p style={tStyles.sampleNote}>Based on {detail.interactions} interactions.</p>
            </div>
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
  const w = 220;
  const h = 52;
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

function ActionButton({ action }) {
  const Icon = ACTION_ICONS[action.kind] || Target;
  return (
    <div style={tStyles.actionRow}>
      <Icon size={16} style={{ color: "var(--do-brand-blue)", flexShrink: 0 }} />
      <span style={tStyles.actionLabel}>{action.label}</span>
      <span style={tStyles.actionDuration}>{action.duration}</span>
    </div>
  );
}

const ACTION_ICONS = {
  drill: Target,
  brief: FileText,
  "one-on-one": MessageSquare,
  mission: Flag,
};

const tStyles = {
  page: { display: "flex", flexDirection: "column", gap: 20 },
  laneBar: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    padding: "4px 6px",
    background: "var(--surface-white)",
    borderRadius: "var(--radius-card)",
    border: "1px solid var(--color-divider-card, rgba(0,0,0,0.06))",
    overflowX: "auto",
  },
  tab: {
    all: "unset",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 14px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text-medium)",
    transition: "background 150ms ease, color 150ms ease",
    whiteSpace: "nowrap",
  },
  tabActive: {
    background: "var(--do-brand-blue)",
    color: "var(--surface-white)",
  },
  tabLabel: {},
  tabBadge: {
    fontSize: 11,
    fontWeight: 700,
    padding: "1px 6px",
    borderRadius: 10,
    background: "var(--color-error-bg)",
    color: "var(--color-error-text)",
  },
  tabBadgeActive: {
    background: "rgba(255,255,255,0.2)",
    color: "var(--surface-white)",
  },
  configBtn: {
    all: "unset",
    cursor: "pointer",
    marginLeft: "auto",
    width: 32,
    height: 32,
    borderRadius: 8,
    display: "grid",
    placeItems: "center",
    color: "var(--color-text-tertiary)",
    flexShrink: 0,
  },
  configGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 },
  configItem: { display: "flex", flexDirection: "column", gap: 4 },
  configLabel: { fontSize: 12, fontWeight: 600, color: "var(--color-text-medium)" },
  configInputWrap: { display: "flex", alignItems: "center", gap: 4 },
  configLt: { fontSize: 12, color: "var(--color-text-tertiary)" },
  configInput: {
    width: 52,
    padding: "4px 8px",
    borderRadius: 6,
    border: "1px solid var(--color-divider-card, rgba(0,0,0,0.12))",
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "var(--font-sans)",
  },
  configUnit: { fontSize: 12, color: "var(--color-text-tertiary)" },
  body: { display: "flex", gap: 20, alignItems: "flex-start" },
  tableWrap: { flex: 1, minWidth: 0 },
  table: { width: "100%", borderCollapse: "collapse", tableLayout: "fixed", fontFamily: "var(--font-sans)" },
  headRow: { borderBottom: "1px solid var(--table-header-border, rgba(0,0,0,0.08))" },
  th: { padding: "12px 16px", textAlign: "start", fontSize: 12, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "0.2px" },
  row: { height: 52, cursor: "pointer", transition: "background 150ms ease" },
  cell: { padding: "0 16px", verticalAlign: "middle", fontSize: 13, color: "var(--do-ink)" },
  emptyCell: { padding: "40px 16px", textAlign: "center", fontSize: 13, color: "var(--color-text-tertiary)" },
  agentCell: { display: "inline-flex", alignItems: "center", gap: 10 },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    background: "var(--color-icon-tertiary-bg)",
    color: "var(--color-icon-tertiary-fg)",
    display: "grid",
    placeItems: "center",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    flexShrink: 0,
  },
  agentName: { fontSize: 13, fontWeight: 600, color: "var(--do-ink)" },
  scoreText: { fontSize: 13, fontWeight: 600, color: "var(--do-ink)" },
  gapChip: {
    fontSize: 12,
    fontWeight: 700,
    padding: "2px 8px",
    borderRadius: 4,
    background: "var(--color-error-bg)",
    color: "var(--color-error-text)",
  },
  interactionCount: { fontSize: 13, color: "var(--color-text-medium)" },
  actionChip: { fontSize: 12, fontWeight: 500, color: "var(--do-brand-blue)" },
  sidecar: {
    width: 320,
    flexShrink: 0,
    position: "sticky",
    top: 24,
    background: "var(--surface-white)",
    borderRadius: "var(--radius-card)",
    border: "1px solid var(--color-divider-card, rgba(0,0,0,0.06))",
    boxShadow: "var(--shadow-card)",
    overflow: "hidden",
  },
  sidecarInner: { padding: "20px 20px 24px" },
  sidecarHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  sidecarTitle: { margin: 0, fontSize: 16, fontWeight: 700, color: "var(--color-text-deep)" },
  sidecarSub: { margin: "4px 0 0", fontSize: 13, color: "var(--color-text-tertiary)" },
  closeBtn: { all: "unset", cursor: "pointer", width: 28, height: 28, borderRadius: 6, display: "grid", placeItems: "center", color: "var(--color-text-tertiary)" },
  sidecarSection: { marginBottom: 16, paddingTop: 12, borderTop: "1px solid var(--color-divider-card, rgba(0,0,0,0.06))" },
  sidecarH4: { margin: "0 0 8px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.4px", color: "var(--color-text-tertiary)" },
  sidecarText: { margin: "0 0 6px", fontSize: 13, lineHeight: 1.5, color: "var(--color-text-medium)" },
  actionsList: { display: "flex", flexDirection: "column", gap: 6 },
  actionRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 8,
    background: "var(--surface-alt, #F1F3F9)",
  },
  actionLabel: { flex: 1, fontSize: 13, fontWeight: 600, color: "var(--color-text-deep)" },
  actionDuration: { fontSize: 12, color: "var(--color-text-tertiary)" },
  sampleNote: { margin: "16px 0 0", fontSize: 11, color: "var(--color-text-tertiary)", fontStyle: "italic" },
};
