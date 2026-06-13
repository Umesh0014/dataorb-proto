"use client";

import React from "react";
import Card from "./Card";
import CircularProgress from "./CircularProgress";
import MetricSparkline from "./MetricSparkline";
import ScoreTrend from "./ScoreTrend";
import { TEAM_SCORE, TEAM_KPIS, TEAM_CONTEXT } from "./mocks/commandCenter";

// CommandCenterScoreboard — the dashboard's top band: page identity, then a
// "team performance" card with the four team metrics in a 2×2 grid. The
// composite (ring + trendline) and CSAT (number + trendline) carry deltas and
// dotted targets; engagement and needs-attention are supporting counts.
// Reuses CircularProgress + MetricSparkline + ScoreTrend.

const RING = 92;

// Composite-score banding → ring colour only (the score number + target carry
// the meaning; no tier-label tag).
const BANDS = [
  { min: 85, ring: "var(--chart-green)" },
  { min: 75, ring: "var(--chart-blue)" },
  { min: 60, ring: "var(--chart-amber)" },
  { min: 0, ring: "var(--chart-coral)" },
];
const bandFor = (s) => BANDS.find((b) => s >= b.min) || BANDS[BANDS.length - 1];

export default function CommandCenterScoreboard({ subtitle }) {
  const { composite, csat } = TEAM_SCORE;
  const band = bandFor(composite.value);
  const engagement = TEAM_KPIS.find((k) => k.id === "engagement");
  const attention = TEAM_KPIS.find((k) => k.id === "attention");

  return (
    <div style={sbStyles.wrap}>
      <div style={sbStyles.identity}>
        <h1 style={sbStyles.title}>Dashboard</h1>
        <p style={sbStyles.context}>
          {subtitle || `${TEAM_CONTEXT.team} · ${TEAM_CONTEXT.lead} (you) · coach by exception`}
        </p>
      </div>

      <Card padX={24} padY={24}>
        <div style={sbStyles.cardHead}>
          <div>
            <div style={sbStyles.cardTitle}>Team performance</div>
            <div style={sbStyles.cardSub}>Weighted composite of quality, mastery, engagement, and CSAT.</div>
          </div>
          <span style={sbStyles.evalChip}>{TEAM_CONTEXT.size} agents · last 30 days</span>
        </div>

        <div style={sbStyles.grid}>
          {/* Composite — ring + trendline */}
          <div style={sbStyles.tile}>
            <span style={sbStyles.tileLabel}>Composite score</span>
            <div style={sbStyles.compositeRow}>
              <div style={sbStyles.ringWrap}>
                <CircularProgress pct={composite.value} size={RING} stroke={9} ringColor={band.ring} trackColor="var(--color-divider-card)" label={false} />
                <div style={sbStyles.ringCenter}>
                  <span style={sbStyles.ringScore}>{composite.value}</span>
                  <span style={sbStyles.ringOutOf}>/ {composite.outOf}</span>
                </div>
              </div>
              <div style={sbStyles.compositeRight}>
                <DeltaChip text={composite.delta} dir={composite.dir} />
                <span style={sbStyles.spark} role="img" aria-label={`Composite trend, now ${composite.value}, target ${composite.target}`}>
                  <MetricSparkline points={composite.trend} target={composite.target} color="var(--chart-green)" formatValue={(v) => `${Math.round(v)}`} />
                </span>
                <span style={sbStyles.targetCap}><span aria-hidden="true" style={sbStyles.dash} /> target {composite.target}</span>
              </div>
            </div>
          </div>

          {/* CSAT — number + trendline */}
          <div style={sbStyles.tile}>
            <div style={sbStyles.csatTop}>
              <ScoreTrend label="Team CSAT" value={`${csat.value}%`} unit="%" points={csat.trend} target={csat.target} width={150} size="lg" />
              <DeltaChip text={csat.delta} dir={csat.dir} />
            </div>
          </div>

          {/* Learning engagement */}
          <div style={sbStyles.tile}>
            <span style={sbStyles.tileLabel}>{engagement.label}</span>
            <span style={sbStyles.statValue}>{engagement.value}</span>
            <span style={sbStyles.statSub}>{engagement.sublabel}</span>
          </div>

          {/* Needs attention */}
          <div style={sbStyles.tile}>
            <span style={sbStyles.tileLabel}>{attention.label}</span>
            <span style={sbStyles.statValue}>{attention.value}</span>
            <span style={sbStyles.statSub}>{attention.sublabel}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

function DeltaChip({ text, dir }) {
  const up = dir === "up";
  const palette = up
    ? { bg: "var(--color-success-bg)", fg: "var(--color-success-text)" }
    : dir === "down"
      ? { bg: "var(--color-error-bg)", fg: "var(--color-error-text)" }
      : { bg: "var(--grey-50)", fg: "var(--text-secondary)" };
  return (
    <span style={{ ...sbStyles.deltaChip, background: palette.bg, color: palette.fg }}>
      {dir !== "flat" && <span aria-hidden="true">{up ? "↑" : "↓"}</span>} {text}
    </span>
  );
}

const sbStyles = {
  wrap: { display: "flex", flexDirection: "column", gap: 16 },
  identity: { display: "flex", flexDirection: "column", gap: 4 },
  title: { margin: 0, fontFamily: "var(--font-sans)", fontSize: 24, fontWeight: 800, color: "var(--color-text-deep)", lineHeight: 1.2 },
  context: { margin: 0, fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 400, color: "var(--text-secondary)" },
  cardHead: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20 },
  cardTitle: { fontFamily: "var(--font-sans)", fontSize: 16, fontWeight: 700, color: "var(--color-text-deep)", marginBottom: 2 },
  cardSub: { fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 400, color: "var(--text-secondary)" },
  evalChip: {
    flexShrink: 0, display: "inline-flex", alignItems: "center", padding: "4px 12px", borderRadius: 6,
    background: "var(--pill-bg)", color: "var(--color-text-tertiary)", fontFamily: "var(--font-sans)",
    fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
  },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  tile: {
    display: "flex", flexDirection: "column", gap: 8,
    background: "var(--color-card-emoji-bg)", borderRadius: 12, padding: "16px 18px",
    minHeight: 116, justifyContent: "center",
  },
  tileLabel: { fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--color-text-tertiary)" },
  compositeRow: { display: "flex", alignItems: "center", gap: 16 },
  ringWrap: { position: "relative", width: RING, height: RING, flexShrink: 0 },
  ringCenter: { position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" },
  ringScore: { fontFamily: "var(--font-sans)", fontSize: 24, fontWeight: 800, color: "var(--color-text-deep)", lineHeight: 1 },
  ringOutOf: { fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 500, color: "var(--color-text-tertiary)" },
  compositeRight: { display: "flex", flexDirection: "column", gap: 6, minWidth: 0, flex: 1 },
  spark: { display: "block", width: "100%", maxWidth: 160 },
  targetCap: { display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 600, color: "var(--color-text-tertiary)" },
  dash: { width: 12, height: 0, borderTop: "1px dashed var(--color-text-tertiary)", display: "inline-block" },
  csatTop: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 },
  statValue: { fontFamily: "var(--font-sans)", fontSize: 28, fontWeight: 800, color: "var(--color-text-deep)", lineHeight: 1 },
  statSub: { fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 400, color: "var(--text-secondary)" },
  deltaChip: { display: "inline-flex", alignItems: "center", gap: 3, padding: "3px 8px", borderRadius: 4, fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", alignSelf: "flex-start" },
};
