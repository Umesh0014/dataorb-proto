"use client";

import React from "react";
import { ChevronRight } from "lucide-react";
import InlineStatusAffordance from "./InlineStatusAffordance";
import ScoreTrend from "./ScoreTrend";
import { ENGAGEMENT_META, toneInk } from "./mocks/commandCenter";

// AgentScoreRow — one agent on the dashboard roster: avatar, name, Learning
// Hub engagement, and their CSAT + composite scores, each a number + trendline
// with a dotted target line. The whole row is a button that opens the agent's
// detail page (AgentProfile); coaching actions live in the Tasks section, not
// nested here.
export default function AgentScoreRow({ agent, onOpenAgent }) {
  const eng = ENGAGEMENT_META[agent.engagement];
  return (
    <button
      type="button"
      className="cc-focusable"
      onClick={() => onOpenAgent?.(agent.id)}
      style={rowStyles.row}
      aria-label={`Open ${agent.name}'s detail page`}
    >
      <span style={rowStyles.avatar}>{agent.initials}</span>
      <span style={rowStyles.identity}>
        <span style={rowStyles.name}>{agent.name}</span>
        <InlineStatusAffordance tone={eng.tone} icon={<Dot tone={eng.tone} />} style={{ color: toneInk(eng.tone) }}>
          {eng.label}
        </InlineStatusAffordance>
      </span>
      <span style={rowStyles.scoreCell}>
        <ScoreTrend label="CSAT" value={`${agent.csat}%`} unit="%" points={agent.csatTrend} target={agent.csatTarget} width={84} />
      </span>
      <span style={rowStyles.scoreCell}>
        <ScoreTrend label="Composite" value={`${agent.composite}`} points={agent.compositeTrend} target={agent.target} width={84} />
      </span>
      <span style={rowStyles.chev}><ChevronRight size={18} aria-hidden="true" /></span>
    </button>
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
  row: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    width: "100%",
    background: "var(--surface-white)",
    border: "1px solid var(--color-divider-card)",
    borderRadius: 12,
    cursor: "pointer",
    padding: "14px 18px",
    textAlign: "left",
  },
  avatar: {
    flexShrink: 0, width: 38, height: 38, borderRadius: "50%",
    background: "var(--grey-100)", color: "var(--color-text-medium)",
    fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 700,
    display: "inline-flex", alignItems: "center", justifyContent: "center",
  },
  identity: { display: "flex", flexDirection: "column", gap: 4, minWidth: 0, flex: 1 },
  name: { fontFamily: "var(--font-sans)", fontSize: 15, fontWeight: 700, color: "var(--color-text-deep)" },
  scoreCell: { flexShrink: 0, width: 150 },
  chev: { flexShrink: 0, color: "var(--color-text-tertiary)", display: "inline-flex" },
};
