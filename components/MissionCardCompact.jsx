"use client";

import React from "react";
import { progressColor } from "./MissionsTable";

// MissionCardCompact — kanban-column card. Compact summary: name +
// stats line + progress bar + days-left affordance. Click → navigate to
// the mission's detail page.

export default function MissionCardCompact({ mission, onClick }) {
  const [hover, setHover] = React.useState(false);
  const pct = Math.max(0, Math.min(100, mission.progress ?? 0));
  const pctColor = progressColor(pct);
  const daysLeft = mission.daysLeft;
  const urgent = daysLeft != null && daysLeft <= 3 && daysLeft >= 0;
  const closed = daysLeft != null && daysLeft < 0;

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...kcStyles.card,
        borderColor: hover ? "#004BEF" : "#E4E2EE",
        boxShadow: hover ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
      }}
    >
      <div style={kcStyles.name}>{mission.name}</div>
      <div style={kcStyles.stats}>
        {mission.agentCount} Agents · {mission.focusAreaCount} focus areas
      </div>
      <div style={kcStyles.progressRow}>
        <span style={kcStyles.progressTrack}>
          <span style={{ ...kcStyles.progressFill, width: `${pct}%`, background: pctColor }} />
        </span>
        <span style={{ ...kcStyles.progressLabel, color: pctColor }}>{pct}%</span>
      </div>
      <div
        style={{
          ...kcStyles.daysLeft,
          color: urgent
            ? "var(--color-error)"
            : closed
              ? "var(--color-text-tertiary)"
              : "var(--text-secondary)",
        }}
      >
        {daysLeft == null
          ? "—"
          : closed
            ? "Closed"
            : daysLeft === 0
              ? "Ends today"
              : `${daysLeft} days left`}
      </div>
    </button>
  );
}

const kcStyles = {
  card: {
    appearance: "none",
    textAlign: "left",
    cursor: "pointer",
    width: "100%",
    background: "#FFFFFF",
    border: "1px solid #E4E2EE",
    borderRadius: 12,
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    transition: "border-color 120ms ease, box-shadow 120ms ease",
    fontFamily: "var(--font-sans)",
  },
  name: {
    fontSize: 14,
    fontWeight: 600,
    color: "#1F2440",
    lineHeight: 1.3,
    overflow: "hidden",
    display: "-webkit-box",
    WebkitLineClamp: 1,
    WebkitBoxOrient: "vertical",
    textOverflow: "ellipsis",
  },
  stats: {
    fontSize: 12,
    fontWeight: 500,
    color: "var(--text-secondary)",
  },
  progressRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 4,
    background: "#EEEEF8",
    overflow: "hidden",
  },
  progressFill: {
    display: "block",
    height: "100%",
    transition: "width 200ms ease",
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: 700,
    fontVariantNumeric: "tabular-nums",
  },
  daysLeft: {
    fontSize: 12,
    fontWeight: 600,
  },
};
