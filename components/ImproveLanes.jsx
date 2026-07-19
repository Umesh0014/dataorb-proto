"use client";

import React from "react";
import { Settings2, ChevronRight, X, FileText, Target, MessageSquare, Flag, TrendingDown, AlertTriangle } from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import PageHeader from "./PageHeader";
import { COMPETENCIES, DEFAULT_THRESHOLDS, DEFAULT_MIN_INTERACTIONS, agentsInLane, laneCountsAll, agentCompetencyDetail } from "./mocks/improveLanes";

// ImproveLanes (Direction A) — Competency-lane swimlanes.
// Mental model: "Browse my team's gaps by competency — all lanes visible at once."
// Structure: vertical scroll of horizontal swimlane bands, one per competency.
// Each lane header shows competency name + threshold + count of agents below.
// Agent cards within each lane; click a card → sidecar opens with "why" + actions.
// Highest information density at a glance — the TL sees the whole landscape.

export default function ImproveLanes() {
  const [thresholds, setThresholds] = React.useState(DEFAULT_THRESHOLDS);
  const [minInteractions] = React.useState(DEFAULT_MIN_INTERACTIONS);
  const [selected, setSelected] = React.useState(null); // { agentId, competencyId }
  const [editingLane, setEditingLane] = React.useState(null);

  const lanes = laneCountsAll(thresholds, minInteractions);
  const activeLanes = lanes.filter((l) => l.count > 0);
  const detail = selected ? agentCompetencyDetail(selected.agentId, selected.competencyId, thresholds) : null;

  return (
    <div style={styles.page}>
      <PageHeader
        identifier={{ label: "Improve", withDropdown: false }}
        description="Competency lanes — who needs coaching, by skill area"
      />

      <div style={styles.body}>
        <div style={{ ...styles.lanesArea, flex: selected ? "1 1 0" : "1 1 100%" }}>
          {activeLanes.length === 0 && (
            <Card>
              <p style={styles.emptyText}>All agents are at or above threshold across every competency. Adjust thresholds to surface coaching opportunities.</p>
            </Card>
          )}
          {activeLanes.map((lane) => (
            <LaneBand
              key={lane.id}
              lane={lane}
              thresholds={thresholds}
              minInteractions={minInteractions}
              selected={selected}
              onSelect={(agentId) => setSelected({ agentId, competencyId: lane.id })}
              editingLane={editingLane}
              onEditLane={setEditingLane}
              onThresholdChange={(val) => setThresholds((t) => ({ ...t, [lane.id]: val }))}
            />
          ))}
        </div>

        {detail && (
          <aside style={styles.sidecar} role="complementary" aria-label="Agent coaching detail">
            <SidecarContent detail={detail} onClose={() => setSelected(null)} />
          </aside>
        )}
      </div>
    </div>
  );
}

function LaneBand({ lane, thresholds, minInteractions, selected, onSelect, editingLane, onEditLane, onThresholdChange }) {
  const agents = agentsInLane(lane.id, thresholds, minInteractions);
  const isEditing = editingLane === lane.id;

  return (
    <section style={styles.lane} aria-label={`${lane.label} competency lane`}>
      <div style={styles.laneHeader}>
        <div style={styles.laneTitle}>
          <span style={styles.laneName}>{lane.label}</span>
          <span style={styles.laneCount}>{agents.length} below threshold</span>
        </div>
        <div style={styles.laneControls}>
          <span style={styles.thresholdLabel}>
            &lt; {thresholds[lane.id]}{lane.unit}
          </span>
          <button
            type="button"
            onClick={() => onEditLane(isEditing ? null : lane.id)}
            style={styles.settingsBtn}
            aria-label={`Configure ${lane.label} threshold`}
          >
            <Settings2 size={16} />
          </button>
        </div>
      </div>

      {isEditing && (
        <div style={styles.thresholdEditor}>
          <label style={styles.thresholdEditorLabel}>
            Threshold ({lane.unit})
            <input
              type="number"
              value={thresholds[lane.id]}
              onChange={(e) => onThresholdChange(Number(e.target.value))}
              style={styles.thresholdInput}
              min={0}
              max={100}
            />
          </label>
        </div>
      )}

      <div style={styles.laneCards}>
        {agents.map((agent) => {
          const isSelected = selected?.agentId === agent.id && selected?.competencyId === lane.id;
          return (
            <button
              key={agent.id}
              type="button"
              onClick={() => onSelect(agent.id)}
              style={{ ...styles.agentCard, ...(isSelected ? styles.agentCardSelected : {}) }}
              aria-pressed={isSelected}
            >
              <span style={styles.avatar}>{agent.initials}</span>
              <span style={styles.cardBody}>
                <span style={styles.agentName}>{agent.name}</span>
                <span style={styles.agentScore}>
                  {agent.scores[lane.id]}{lane.unit}
                  <span style={styles.gap}>({thresholds[lane.id] - agent.scores[lane.id]}{lane.unit} gap)</span>
                </span>
              </span>
              <ChevronRight size={14} style={{ color: "var(--color-text-tertiary)", flexShrink: 0 }} />
            </button>
          );
        })}
      </div>
    </section>
  );
}

function SidecarContent({ detail, onClose }) {
  const { agent, competency, score, threshold, gap, trend, interactions, topDrivers, actions, whyText } = detail;
  return (
    <div style={styles.sidecarInner}>
      <div style={styles.sidecarHeader}>
        <div>
          <h3 style={styles.sidecarTitle}>{agent.name}</h3>
          <p style={styles.sidecarSub}>{competency.label} — {score}{competency.unit} / {threshold}{competency.unit} threshold</p>
        </div>
        <button type="button" onClick={onClose} style={styles.closeBtn} aria-label="Close detail">
          <X size={18} />
        </button>
      </div>

      <div style={styles.sidecarSection}>
        <h4 style={styles.sidecarH4}>Why this agent is here</h4>
        <p style={styles.sidecarText}>{whyText}</p>
        {topDrivers.length > 0 && (
          <p style={styles.sidecarText}>Top contact drivers: {topDrivers.join(", ")}</p>
        )}
      </div>

      {trend && (
        <div style={styles.sidecarSection}>
          <h4 style={styles.sidecarH4}>Trend (last 5 periods)</h4>
          <MiniTrend points={trend} threshold={threshold} unit={competency.unit} />
        </div>
      )}

      <div style={styles.sidecarSection}>
        <h4 style={styles.sidecarH4}>Recommended actions</h4>
        <div style={styles.actionsList}>
          {actions.map((a) => (
            <ActionRow key={a.kind} action={a} />
          ))}
        </div>
      </div>

      <p style={styles.sampleNote}>Based on {interactions} scored interactions this window.</p>
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

function ActionRow({ action }) {
  const Icon = ACTION_ICONS[action.kind] || Target;
  return (
    <button type="button" style={styles.actionRow}>
      <Icon size={16} style={{ color: "var(--do-brand-blue)", flexShrink: 0 }} />
      <span style={styles.actionLabel}>{action.label}</span>
      <span style={styles.actionDuration}>{action.duration}</span>
    </button>
  );
}

const ACTION_ICONS = {
  drill: Target,
  brief: FileText,
  "one-on-one": MessageSquare,
  mission: Flag,
};

const styles = {
  page: { display: "flex", flexDirection: "column", gap: 24 },
  body: { display: "flex", gap: 24, alignItems: "flex-start" },
  lanesArea: { display: "flex", flexDirection: "column", gap: 20, minWidth: 0, transition: "flex 200ms ease" },
  emptyText: { margin: 0, fontSize: 14, color: "var(--color-text-tertiary)", padding: "24px 0", textAlign: "center" },
  lane: {
    background: "var(--surface-white)",
    borderRadius: "var(--radius-card)",
    border: "1px solid var(--color-divider-card, rgba(0,0,0,0.06))",
    padding: "16px 20px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  laneHeader: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  laneTitle: { display: "flex", alignItems: "baseline", gap: 10 },
  laneName: { fontSize: 15, fontWeight: 700, color: "var(--color-text-deep)" },
  laneCount: { fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)" },
  laneControls: { display: "flex", alignItems: "center", gap: 8 },
  thresholdLabel: { fontSize: 12, fontWeight: 600, color: "var(--color-error-text)", background: "var(--color-error-bg)", padding: "2px 8px", borderRadius: 4 },
  settingsBtn: {
    all: "unset",
    cursor: "pointer",
    width: 28,
    height: 28,
    borderRadius: 6,
    display: "grid",
    placeItems: "center",
    color: "var(--color-text-tertiary)",
    transition: "background 150ms ease",
  },
  thresholdEditor: {
    padding: "8px 0",
    borderTop: "1px solid var(--color-divider-card, rgba(0,0,0,0.06))",
  },
  thresholdEditorLabel: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--color-text-medium)" },
  thresholdInput: {
    width: 60,
    padding: "4px 8px",
    borderRadius: 6,
    border: "1px solid var(--color-divider-card, rgba(0,0,0,0.12))",
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "var(--font-sans)",
  },
  laneCards: { display: "flex", flexDirection: "column", gap: 6 },
  agentCard: {
    all: "unset",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 8,
    transition: "background 150ms ease",
    background: "var(--surface-alt, #F1F3F9)",
  },
  agentCardSelected: {
    background: "var(--nav-rail-bg, #E8ECFF)",
    outline: "2px solid var(--do-brand-blue)",
    outlineOffset: -2,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    background: "var(--color-icon-tertiary-bg)",
    color: "var(--color-icon-tertiary-fg)",
    display: "grid",
    placeItems: "center",
    fontSize: 11,
    fontWeight: 700,
    flexShrink: 0,
    textTransform: "uppercase",
  },
  cardBody: { display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 },
  agentName: { fontSize: 13, fontWeight: 600, color: "var(--color-text-deep)" },
  agentScore: { fontSize: 12, color: "var(--color-text-medium)" },
  gap: { marginLeft: 4, color: "var(--color-error-text)", fontWeight: 600 },
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
    all: "unset",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 8,
    background: "var(--surface-alt, #F1F3F9)",
    transition: "background 150ms ease",
  },
  actionLabel: { flex: 1, fontSize: 13, fontWeight: 600, color: "var(--color-text-deep)" },
  actionDuration: { fontSize: 12, color: "var(--color-text-tertiary)" },
  sampleNote: { margin: "16px 0 0", fontSize: 11, color: "var(--color-text-tertiary)", fontStyle: "italic" },
};
