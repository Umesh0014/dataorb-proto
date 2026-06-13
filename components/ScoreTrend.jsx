"use client";

import React from "react";
import MetricSparkline from "./MetricSparkline";

// ScoreTrend — a labelled score with its trendline. Renders the current
// number next to a sparkline that carries a dotted target line, plus a
// "target N" caption so the dotted line is never read by position alone.
// Shared by every CSAT / composite score across the Command Center (agent
// rows, scorecards, and the team scoreboard).

const TREND_COLOR = {
  up: "var(--chart-green)",
  down: "var(--chart-coral)",
  flat: "var(--chart-grey)",
};

function dirOf(points) {
  if (!points || points.length < 2) return "flat";
  const delta = points[points.length - 1] - points[0];
  if (delta > 1) return "up";
  if (delta < -1) return "down";
  return "flat";
}

export default function ScoreTrend({ label, value, unit = "", points, target, width = 96, size = "md" }) {
  const dir = dirOf(points);
  const big = size === "lg";
  return (
    <div style={stStyles.wrap}>
      {label && <span style={stStyles.label}>{label}</span>}
      <div style={stStyles.row}>
        <span style={big ? stStyles.valueLg : stStyles.value}>{value}</span>
        <span
          style={{ ...stStyles.spark, width }}
          role="img"
          aria-label={`${label || "Score"} ${value}, target ${target}${unit}, trending ${dir === "up" ? "up" : dir === "down" ? "down" : "flat"}`}
        >
          <MetricSparkline
            points={points}
            target={target}
            color={TREND_COLOR[dir]}
            formatValue={(v) => `${Math.round(v)}${unit}`}
          />
        </span>
      </div>
      <span style={stStyles.target}>
        <span aria-hidden="true" style={stStyles.targetDash} /> target {target}{unit}
      </span>
    </div>
  );
}

const stStyles = {
  wrap: { display: "flex", flexDirection: "column", gap: 4, minWidth: 0 },
  label: {
    fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
    textTransform: "uppercase", color: "var(--color-text-tertiary)",
  },
  row: { display: "flex", alignItems: "center", gap: 10 },
  value: { fontFamily: "var(--font-sans)", fontSize: 18, fontWeight: 700, color: "var(--color-text-deep)", flexShrink: 0 },
  valueLg: { fontFamily: "var(--font-sans)", fontSize: 28, fontWeight: 800, color: "var(--color-text-deep)", flexShrink: 0, lineHeight: 1 },
  spark: { flexShrink: 0 },
  target: {
    display: "inline-flex", alignItems: "center", gap: 5,
    fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 600, color: "var(--color-text-tertiary)",
  },
  targetDash: {
    width: 12, height: 0, borderTop: "1px dashed var(--color-text-tertiary)", display: "inline-block",
  },
};
