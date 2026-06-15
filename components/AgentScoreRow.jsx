"use client";

import React from "react";
import { ChevronRight, CheckCircle2 } from "lucide-react";
import Button from "./Button";
import InlineStatusAffordance from "./InlineStatusAffordance";
import AttentionItemCard from "./AttentionItemCard";
import { ENGAGEMENT_META, rosterStatus, toneInk } from "./mocks/commandCenter";

// AgentScoreRow — one agent on the team-leader dashboard: avatar, name,
// Learning Hub engagement, CSAT, and a composite-score bar with its target
// marker. Expands to reveal that agent's action items (the nested
// AttentionItemCards, agent identity hidden since the row carries it) under
// an explicit "improve the score" goal line. Shared by the Roster and Focus
// dashboards.
//
// Props:
//   agent     roster entry { id, name, initials, csat, composite, target, engagement }
//   items     this agent's open action items (already status-annotated)
//   expanded  controlled open state
//   onToggle  () => void
//   on*       item action handlers passed straight to AttentionItemCard
//   onOpenAgent (agentId) => void
export default function AgentScoreRow({
  agent,
  items,
  expanded,
  onToggle,
  onLaunch,
  onOpenDetail,
  onOpenAgent,
  onSnooze,
  onDismiss,
  onMarkHandled,
}) {
  const status = rosterStatus(agent);
  const onTrack = status === "on_track";
  const eng = ENGAGEMENT_META[agent.engagement];
  const gap = agent.target - agent.composite;
  const panelId = `agent-panel-${agent.id}`;

  return (
    <div style={rowStyles.shell}>
      <button
        type="button"
        className="cc-focusable"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={onToggle}
        style={rowStyles.header}
      >
        <span style={rowStyles.avatar}>{agent.initials}</span>
        <span style={rowStyles.identity}>
          <span style={rowStyles.name}>{agent.name}</span>
          <InlineStatusAffordance tone={eng.tone} icon={<Dot tone={eng.tone} />} style={{ color: toneInk(eng.tone) }}>
            {eng.label}
          </InlineStatusAffordance>
        </span>

        <span style={rowStyles.metricCell}>
          <span style={rowStyles.metricLabel}>CSAT</span>
          <span style={rowStyles.metricValue}>{agent.csat}%</span>
        </span>

        <span style={rowStyles.scoreCell}>
          <span style={rowStyles.scoreTop}>
            <span style={rowStyles.metricLabel}>Composite</span>
            <span style={rowStyles.metricValue}>
              {agent.composite} <span style={rowStyles.scoreMax}>/ 100</span>
            </span>
          </span>
          <ScoreBar composite={agent.composite} target={agent.target} onTrack={onTrack} />
        </span>

        <span style={{ ...rowStyles.chev, transform: expanded ? "rotate(90deg)" : "rotate(0deg)" }}>
          <ChevronRight size={18} aria-hidden="true" />
        </span>
      </button>

      {expanded && (
        <div id={panelId} style={rowStyles.panel}>
          {onTrack ? (
            <div style={rowStyles.onTrack}>
              <CheckCircle2 size={16} style={{ color: "var(--color-success)", flexShrink: 0 }} aria-hidden="true" />
              <span style={rowStyles.onTrackText}>
                On track — composite {agent.composite} is above the {agent.target} target. No action needed.
              </span>
              <Button variant="text" uppercase={false} onClick={() => onOpenAgent?.(agent.id)}>View profile</Button>
            </div>
          ) : (
            <>
              <div style={rowStyles.goalRow}>
                <span style={rowStyles.goalText}>
                  Goal — lift composite {agent.composite} → {agent.target} (+{gap} pts)
                </span>
                <Button variant="text" uppercase={false} onClick={() => onOpenAgent?.(agent.id)}>View profile</Button>
              </div>
              <div style={rowStyles.items}>
                {items.length === 0 ? (
                  <p style={rowStyles.noItems}>Below target, but no specific signal yet — open the profile to dig in.</p>
                ) : (
                  items.map((item) => (
                    <AttentionItemCard
                      key={item.id}
                      item={item}
                      status={item.status}
                      hideAgent
                      onLaunch={() => onLaunch(item.id)}
                      onOpenDetail={() => onOpenDetail(item.id)}
                      onOpenAgent={onOpenAgent}
                      onSnooze={() => onSnooze(item.id)}
                      onDismiss={() => onDismiss(item.id)}
                      onMarkHandled={() => onMarkHandled(item.id)}
                    />
                  ))
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ScoreBar — composite score (0–100) as a filled track with a target marker.
// Colour follows on-track vs. below-target, but the numeric value + "target N"
// label always carry the meaning (never colour alone).
export function ScoreBar({ composite, target, onTrack }) {
  const fill = Math.max(0, Math.min(100, composite));
  const tone = onTrack ? "success" : composite < target * 0.75 ? "danger" : "warning";
  const fillColor = {
    success: "var(--color-success)",
    warning: "var(--color-warning)",
    danger: "var(--color-error)",
  }[tone];
  return (
    <span style={rowStyles.barWrap}>
      <span
        style={rowStyles.barTrack}
        role="img"
        aria-label={`Composite score ${composite} of 100, target ${target}`}
      >
        <span style={{ ...rowStyles.barFill, width: `${fill}%`, background: fillColor }} />
        <span style={{ ...rowStyles.barTarget, left: `${target}%` }} aria-hidden="true" />
      </span>
      <span style={rowStyles.barTargetLabel}>target {target}</span>
    </span>
  );
}

function Dot({ tone }) {
  const color = {
    danger: "var(--color-error)", warning: "var(--color-warning)",
    info: "var(--color-info)", success: "var(--color-success)", tertiary: "var(--color-text-tertiary)",
  }[tone] || "var(--color-text-tertiary)";
  return <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />;
}

const rowStyles = {
  shell: {
    background: "var(--surface-white)",
    border: "1px solid var(--color-divider-card)",
    borderRadius: 12,
    overflow: "hidden",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    width: "100%",
    background: "var(--surface-white)",
    border: "none",
    cursor: "pointer",
    padding: "14px 18px",
    textAlign: "left",
  },
  avatar: {
    flexShrink: 0,
    width: 38,
    height: 38,
    borderRadius: "50%",
    background: "var(--grey-100)",
    color: "var(--color-text-medium)",
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  identity: { display: "flex", flexDirection: "column", gap: 4, minWidth: 0, flex: 1 },
  name: { fontFamily: "var(--font-sans)", fontSize: 15, fontWeight: 700, color: "var(--color-text-deep)" },
  metricCell: { display: "flex", flexDirection: "column", gap: 4, flexShrink: 0, width: 72 },
  metricLabel: {
    fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
    textTransform: "uppercase", color: "var(--color-text-tertiary)",
  },
  metricValue: { fontFamily: "var(--font-sans)", fontSize: 16, fontWeight: 700, color: "var(--color-text-deep)" },
  scoreMax: { fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)" },
  scoreCell: { display: "flex", flexDirection: "column", gap: 6, flexShrink: 0, width: 200 },
  scoreTop: { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 },
  barWrap: { display: "flex", flexDirection: "column", gap: 3 },
  barTrack: {
    position: "relative",
    display: "block",
    height: 8,
    borderRadius: 999,
    background: "var(--grey-100)",
    overflow: "visible",
  },
  barFill: { position: "absolute", left: 0, top: 0, bottom: 0, borderRadius: 999 },
  barTarget: {
    position: "absolute",
    top: -2,
    bottom: -2,
    width: 2,
    borderRadius: 1,
    background: "var(--color-text-medium)",
  },
  barTargetLabel: {
    fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 600, color: "var(--color-text-tertiary)",
    alignSelf: "flex-end",
  },
  chev: { flexShrink: 0, color: "var(--color-text-tertiary)", display: "inline-flex", transition: "transform 150ms ease" },
  panel: {
    padding: "4px 18px 18px",
    display: "flex",
    flexDirection: "column",
    gap: 14,
    borderTop: "1px solid var(--color-divider-card)",
  },
  goalRow: {
    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
    paddingTop: 14,
  },
  goalText: { fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 700, color: "var(--color-text-deep)" },
  items: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14, alignItems: "start" },
  noItems: { margin: 0, fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text-secondary)" },
  onTrack: { display: "flex", alignItems: "center", gap: 10, paddingTop: 14 },
  onTrackText: { flex: 1, fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 400, color: "var(--text-secondary)" },
};
