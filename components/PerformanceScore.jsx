"use client";

import React from "react";
import Card from "./Card";
import CircularProgress from "./CircularProgress";
import TrendArrow from "./TrendArrow";
import NextBestActions from "./NextBestActions";

// PerformanceScore — Agent Detail Page hero card. Merges the composite
// performance score (radial ring + 2x2 supporting metrics) and the Next
// Best Actions rail into one card. `onAssign` is forwarded to the NBA zone
// so its cards can open the page-level Confirm assignment modal.
//
// TODO: no "Performance Snapshot" component exists in the codebase to
// borrow from — the eval chip, metric label/value pairing and trend chip
// here are sourced from StatCard / the Closed Missions metric tiles / the
// AgentsPage trend chip. Confirm the intended pattern with design.

const RING_SIZE = 150;

// Mock — composite score zone.
const SCORE = {
  composite: 78,
  outOf: 100,
  trend: { dir: "up", text: "4 pts this week" },
  // TODO: confirm score -> tier thresholds with Akash (At Risk / Developing
  // / Strong / Excellent). "Strong" is a hard-coded mock value.
  tier: "Strong",
  evalChip: "38/47 interactions evaluated",
};

// Mock — 2x2 supporting metrics.
const METRICS = [
  { label: "Quality adherence", value: "81%", trend: { dir: "up", text: "2 pts" } },
  { label: "Mission mastery", value: "74%", trend: { dir: "up", text: "6 pts" } },
  { label: "Roleplay engagement", value: "16/20", trend: { dir: "flat", text: "Stable" } },
  { label: "Coaching responsiveness", value: "68%", trend: { dir: "up", text: "8 pts" } },
];

export default function PerformanceScore({ onAssign }) {
  return (
    <Card>
      <div style={psStyles.header}>
        <div>
          <div style={psStyles.title}>Performance score</div>
          <div style={psStyles.subtitle}>
            Weighted composite of quality, mastery, engagement, and responsiveness.
          </div>
        </div>
        <span style={psStyles.evalChip}>{SCORE.evalChip}</span>
      </div>

      <div style={psStyles.scoreZone}>
        <div style={psStyles.ringColumn}>
          <div style={psStyles.ringWrap}>
            <CircularProgress
              pct={SCORE.composite}
              size={RING_SIZE}
              stroke={12}
              ringColor="var(--color-button-primary-bg)"
              trackColor="var(--color-divider-card)"
              label={false}
            />
            <div style={psStyles.ringCenter}>
              <span style={psStyles.ringScore}>{SCORE.composite}</span>
              <span style={psStyles.ringOutOf}>/ {SCORE.outOf}</span>
            </div>
          </div>
          <div style={psStyles.ringChips}>
            <TrendChip trend={SCORE.trend} />
            {/* TODO: no "On target" lavender chip exists in the codebase —
                using a neutral pill with --chart-lavender text as the closest
                available. Confirm a tier-chip token with the design system. */}
            <span style={psStyles.tierChip}>{SCORE.tier}</span>
          </div>
        </div>

        <div style={psStyles.zoneDivider} />

        <div style={psStyles.metricGrid}>
          {METRICS.map((m) => (
            <div key={m.label} style={psStyles.metricCell}>
              <span style={psStyles.metricLabel}>{m.label}</span>
              <span style={psStyles.metricValue}>{m.value}</span>
              <TrendChip trend={m.trend} />
            </div>
          ))}
        </div>
      </div>

      <div style={psStyles.rowDivider} />

      <NextBestActions onAssign={onAssign} />
    </Card>
  );
}

// TrendChip — green up-chip for positive movement, neutral chip for a
// stable metric. Mirrors the AgentsPage QA-score trend chip.
function TrendChip({ trend }) {
  if (trend.dir === "flat") {
    return (
      <span
        style={{
          ...psStyles.trendChip,
          background: "var(--pill-bg)",
          color: "var(--color-text-tertiary)",
        }}
      >
        {trend.text}
      </span>
    );
  }
  return (
    <span
      style={{
        ...psStyles.trendChip,
        background: "var(--color-success-bg)",
        color: "var(--color-success)",
      }}
    >
      <TrendArrow up={trend.dir === "up"} />
      {trend.text}
    </span>
  );
}

const psStyles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    lineHeight: 1.4,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: 400,
    color: "var(--text-secondary)",
    lineHeight: 1.4,
  },
  evalChip: {
    flexShrink: 0,
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 12px",
    borderRadius: 6,
    background: "var(--pill-bg)",
    color: "var(--color-text-tertiary)",
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  scoreZone: {
    display: "flex",
    alignItems: "stretch",
    gap: 28,
    marginTop: 20,
  },
  ringColumn: {
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 14,
  },
  ringWrap: {
    position: "relative",
    width: RING_SIZE,
    height: RING_SIZE,
  },
  ringCenter: {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  ringScore: {
    fontSize: 36,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    lineHeight: 1.1,
  },
  ringOutOf: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
  },
  ringChips: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  tierChip: {
    display: "inline-flex",
    alignItems: "center",
    padding: "3px 10px",
    borderRadius: 4,
    background: "var(--pill-bg)",
    color: "var(--chart-lavender)",
    fontSize: 12,
    fontWeight: 700,
  },
  zoneDivider: {
    width: 1,
    alignSelf: "stretch",
    background: "var(--color-divider-card)",
    flexShrink: 0,
  },
  metricGrid: {
    flex: 1,
    minWidth: 0,
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px 24px",
    alignContent: "center",
  },
  metricCell: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 4,
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    lineHeight: 1.2,
  },
  trendChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 3,
    padding: "3px 8px",
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 700,
  },
  rowDivider: {
    height: 1,
    background: "var(--color-divider-card)",
    margin: "20px 0",
  },
};
