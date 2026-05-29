"use client";

import React from "react";

// MissionDonutGauge — small SVG donut used by the agent-persona
// curtain to surface personal mission progress (Part E §E4). Hollow
// center renders the % as a large number + small "Mission progress"
// label. Ring colour follows the standard semantic thresholds:
//   ≥ 80%  success
//   60–79% warning
//   < 60%  danger
//   pre-start (0% / null) → neutral track only (no red on pre-start
//   data, same rule as Part D).

const SIZE = 144;
const STROKE = 14;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Bands aligned with MissionCardCompact.progressTone so the landing
// card's progress bar and the curtain donut never disagree on color
// at the same %. ≥75 success / ≥40 warning / <40 danger; pre-start
// (0 / null) stays neutral.
function ringColor(pct) {
  if (pct == null || pct === 0) return "var(--color-text-tertiary)";
  if (pct >= 75) return "var(--color-success)";
  if (pct >= 40) return "var(--color-warning)";
  return "var(--color-error)";
}

export default function MissionDonutGauge({ value, label = "Mission progress", showLabel = true }) {
  const pct = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
  const dash = (pct / 100) * CIRCUMFERENCE;
  const color = ringColor(pct);
  return (
    <div style={styles.wrap}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true">
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="var(--color-border-card-soft)"
          strokeWidth={STROKE}
        />
        {pct > 0 && (
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth={STROKE}
            strokeDasharray={`${dash} ${CIRCUMFERENCE}`}
            strokeLinecap="round"
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          />
        )}
      </svg>
      <div style={styles.center}>
        <span style={{ ...styles.pct, color }}>{pct}%</span>
        {showLabel && <span style={styles.label}>{label}</span>}
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    position: "relative",
    width: SIZE,
    height: SIZE,
    flexShrink: 0,
  },
  center: {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  pct: {
    fontFamily: "var(--font-sans)",
    fontSize: 28, fontWeight: 700, lineHeight: "32px",
    fontVariantNumeric: "tabular-nums",
  },
  label: {
    fontFamily: "var(--font-sans)",
    fontSize: 11, fontWeight: 500, letterSpacing: "0.4px",
    color: "var(--color-text-tertiary)",
    textTransform: "uppercase",
  },
};
