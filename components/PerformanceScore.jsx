"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import CircularProgress from "./CircularProgress";
import TrendArrow from "./TrendArrow";
import NextBestActions from "./NextBestActions";
import MetricSparkline from "./MetricSparkline";
import ExportButton from "./ExportButton";

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
  evalChip: "38/47 interactions evaluated",
};

// Date-range value (from the page header dropdown) → day count.
const RANGE_DAYS = { last_7_days: 7, last_30_days: 30 };

// bucketFor — sparkline granularity for a range length. Daily for a week,
// weekly up to a quarter, monthly beyond. See 10-design-principles.md §9.
function bucketFor(rangeDays) {
  if (rangeDays <= 7) return "daily";
  if (rangeDays <= 90) return "weekly";
  return "monthly";
}

// makeSeries — deterministic ~1-year daily series for a metric: gentle
// drift plus small repeatable noise, so the sparkline looks organic but
// is stable across reloads. Oldest value first.
function makeSeries(base, seed) {
  const series = [];
  for (let i = 0; i < 365; i += 1) {
    series.push(base + Math.sin(i * 0.1) * 4 + ((seed * (i + 1)) % 5));
  }
  return series;
}

// aggregate — take the trailing `rangeDays` of a series and reduce each
// bucket to one point: mean for percentage metrics, trailing value for
// counts (a count is a level at period end, not an average).
function aggregate(series, rangeDays, type) {
  const recent = series.slice(-rangeDays);
  const bucket = bucketFor(rangeDays);
  const size = bucket === "daily" ? 1 : bucket === "weekly" ? 7 : 30;
  const points = [];
  for (let i = 0; i < recent.length; i += size) {
    const slice = recent.slice(i, i + size);
    points.push(
      type === "count"
        ? slice[slice.length - 1]
        : slice.reduce((sum, v) => sum + v, 0) / slice.length,
    );
  }
  return points;
}

// BANDS — composite-score banding: ring stroke + badge colours by score.
// TODO: confirm the 85 / 75 / 60 thresholds with Akash.
const BANDS = [
  { min: 85, label: "Excellent", ring: "var(--chart-green)", badgeBg: "var(--color-success-bg)", badgeText: "var(--color-success-text)" },
  { min: 75, label: "Strong", ring: "var(--chart-blue)", badgeBg: "var(--color-info-bg)", badgeText: "var(--color-info-text)" },
  { min: 60, label: "Watch", ring: "var(--chart-amber)", badgeBg: "var(--color-warning-bg)", badgeText: "var(--color-warning-dark)" },
  { min: 0, label: "Needs attention", ring: "var(--chart-coral)", badgeBg: "var(--color-error-bg)", badgeText: "var(--color-error)" },
];
function bandFor(score) {
  return BANDS.find((b) => score >= b.min) || BANDS[BANDS.length - 1];
}

// seriesTrend — growing / stable / declining from a points series, by the
// first-to-last percentage change with a ±1.5% dead zone. Drives both the
// sparkline colour and the delta chip.
function seriesTrend(points) {
  if (!points || points.length < 2 || points[0] === 0) return "stable";
  const pct = ((points[points.length - 1] - points[0]) / points[0]) * 100;
  if (pct > 1.5) return "growing";
  if (pct < -1.5) return "declining";
  return "stable";
}

// TREND — sparkline colour + delta-chip treatment per trend direction.
const TREND = {
  growing: { color: "var(--chart-green)", chipBg: "var(--color-success-bg)", chipText: "var(--color-success-text)", arrow: "up" },
  stable: { color: "var(--chart-grey)", chipBg: "var(--grey-50)", chipText: "var(--text-secondary)", arrow: null },
  declining: { color: "var(--chart-coral)", chipBg: "var(--color-error-bg)", chipText: "var(--color-error)", arrow: "down" },
};

// Mock — 2x2 supporting metrics. `base` seeds the deterministic series and
// is the current numeric value; `type` drives aggregation; `target` is the
// metric goal (null for the count metric — the /20 is its goal).
// TODO: confirm real per-metric targets with the data team.
const METRICS = [
  { label: "Quality adherence", value: "81%", deltaText: "2 pts", type: "percent", base: 81, target: 85 },
  { label: "Mission mastery", value: "74%", deltaText: "6 pts", type: "percent", base: 74, target: 85 },
  { label: "Roleplay engagement", value: "16/20", deltaText: "Stable", type: "count", base: 16, target: null },
  { label: "Coaching responsiveness", value: "68%", deltaText: "8 pts", type: "percent", base: 68, target: 75 },
].map((m, i) => ({ ...m, series: makeSeries(m.base, i + 1) }));

export default function PerformanceScore({ onAssign, dateRange, milestone }) {
  const rangeDays = RANGE_DAYS[dateRange] || 7;
  // Milestone state switcher (side rail). M0 strips the card to the NBA
  // strip only; M1 (and the disabled M2) render the full card.
  const showFull = milestone !== "m0";
  const [nbaSheetOpen, setNbaSheetOpen] = React.useState(false);

  const band = bandFor(SCORE.composite);
  const scoreTrendKey =
    SCORE.trend.dir === "down" ? "declining" : SCORE.trend.dir === "up" ? "growing" : "stable";

  return (
    <Card padX={24} padY={24}>
      <div style={psStyles.header}>
        <div>
          <div style={psStyles.title}>
            {showFull ? "Performance score" : "Next best actions"}
          </div>
          {showFull && (
            <div style={psStyles.subtitle}>
              Weighted composite of quality, mastery, engagement, and responsiveness.
            </div>
          )}
        </div>
        <div style={{ ...psStyles.headerActions, gap: showFull ? 4 : 12 }}>
          {showFull && <span style={psStyles.evalChip}>{SCORE.evalChip}</span>}
          <ExportButton formats={["image-copy", "png", "pdf"]} />
          {!showFull && (
            <Button
              variant="text"
              uppercase={false}
              trailingIcon={<ArrowRight size={16} />}
              onClick={() => setNbaSheetOpen(true)}
            >
              View all
            </Button>
          )}
        </div>
      </div>

      {showFull && (
        <div style={psStyles.metricsPanel}>
        <div style={psStyles.scoreZone}>
          <div style={psStyles.ringColumn}>
            <div style={psStyles.ringWrap}>
              <CircularProgress
                pct={SCORE.composite}
                size={RING_SIZE}
                stroke={12}
                ringColor={band.ring}
                trackColor="var(--color-divider-card)"
                label={false}
              />
              <div style={psStyles.ringCenter}>
                <span style={psStyles.ringScore}>{SCORE.composite}</span>
                <span style={psStyles.ringOutOf}>/ {SCORE.outOf}</span>
              </div>
            </div>
            <div style={psStyles.ringChips}>
              <TrendChip text={SCORE.trend.text} trend={scoreTrendKey} />
              <span
                style={{
                  ...psStyles.tierChip,
                  background: band.badgeBg,
                  color: band.badgeText,
                }}
              >
                {band.label}
              </span>
            </div>
          </div>

          <div style={psStyles.metricGrid}>
            {METRICS.map((m) => {
              const points = aggregate(m.series, rangeDays, m.type);
              const trend = seriesTrend(points);
              const belowT = m.target != null && m.base < m.target;
              return (
                <div key={m.label} style={psStyles.metricCell}>
                  <span style={psStyles.metricLabel}>{m.label}</span>
                  <div style={psStyles.metricValueRow}>
                    <span style={psStyles.metricValue}>{m.value}</span>
                    {m.target != null && (
                      <GoalChip base={m.base} target={m.target} />
                    )}
                    <MetricSparkline
                      points={points}
                      width={m.type === "count" ? 80 : 96}
                      color={TREND[trend].color}
                    />
                  </div>
                  {m.target != null && (
                    <span
                      style={{
                        ...psStyles.metricTarget,
                        color: belowT ? "var(--chart-coral)" : "var(--text-secondary)",
                      }}
                    >
                      target {m.target}%
                    </span>
                  )}
                  <TrendChip text={m.deltaText} trend={trend} />
                </div>
              );
            })}
          </div>
        </div>
        </div>
      )}

      <NextBestActions
        onAssign={onAssign}
        hideHeader={!showFull}
        sheetOpen={nbaSheetOpen}
        onSheetOpenChange={setNbaSheetOpen}
      />
    </Card>
  );
}

// TrendChip — delta pill coloured by trend direction. `trend` is the key
// into TREND (growing / stable / declining); `text` is the delta label.
function TrendChip({ text, trend }) {
  const t = TREND[trend] || TREND.stable;
  return (
    <span style={{ ...psStyles.trendChip, background: t.chipBg, color: t.chipText }}>
      {t.arrow && <TrendArrow up={t.arrow === "up"} />}
      {text}
    </span>
  );
}

// GoalChip — achievement-ratio pill shown inline with a percentage
// metric's value: the current value as a percentage of its target,
// colour-banded (success ≥ 100, amber 90–99, error below 90). Count
// metrics omit it — their fraction already carries the ratio.
function GoalChip({ base, target }) {
  const ratio = Math.round((base / target) * 100);
  const band =
    ratio >= 100
      ? { bg: "var(--color-success-bg)", text: "var(--color-success-text)" }
      : ratio >= 90
        ? { bg: "var(--badge-amber-bg)", text: "var(--badge-amber)" }
        : { bg: "var(--color-error-bg)", text: "var(--color-error)" };
  return (
    <span style={{ ...psStyles.goalChip, background: band.bg, color: band.text }}>
      {ratio}% of goal
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
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    flexShrink: 0,
  },
  metricsPanel: {
    padding: "24px 0",
  },
  scoreZone: {
    display: "flex",
    alignItems: "stretch",
    gap: 32,
  },
  ringColumn: {
    flex: 1,
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
    fontSize: 12,
    fontWeight: 700,
  },
  metricGrid: {
    flex: 2,
    minWidth: 0,
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 24,
    alignContent: "center",
  },
  metricCell: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 4,
  },
  metricTarget: {
    fontSize: 11,
    fontWeight: 500,
    marginTop: 2,
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
  },
  metricValue: {
    fontSize: 28,
    fontWeight: 600,
    color: "var(--color-text-deep)",
    lineHeight: 1.2,
  },
  metricValueRow: {
    display: "flex",
    alignItems: "baseline",
    gap: 12,
  },
  goalChip: {
    display: "inline-flex",
    alignItems: "center",
    flexShrink: 0,
    padding: "2px 8px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
    whiteSpace: "nowrap",
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
};
