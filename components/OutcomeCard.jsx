/* eslint-disable no-restricted-syntax --
   The whole card is one clickable surface (it drills into the outcome
   detail in a later ticket), not a Button.jsx pill/icon/text shape — same
   precedent as MiraMetricsBento's tiles. A transparent <button> wraps the
   reused <Card> so the surface stays one accessible, keyboard-focusable
   target without forking Card's visuals. */
"use client";

import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import Card from "./Card";
import MetricSparkline from "./MetricSparkline";

/**
 * OutcomeCard — the single metric card for the Ask Mira Pro Outcomes
 * landing. Renders a tracked outcome's attainment (value vs target), a
 * "% of goal" badge, a signed delta pill, and a trend sparkline.
 *
 * Colour is driven by the delta SIGN, not by above/below target (Jun 9
 * rule): deltaPp >= 0 → success, else danger. Both the delta pill and the
 * sparkline stroke read from this. The sparkline (reused MetricSparkline —
 * a dependency-free SVG) carries a hover tooltip so the line is never an
 * unexplained number (Neil's labelling rule).
 *
 * Delta is labelled in `pp` (percentage points) per house standard, not
 * the mock's "pts".
 *
 * @param {{
 *   outcome: {
 *     title: string, value: number, target: number,
 *     goalPct: number, deltaPp: number, trend: number[],
 *   },
 *   onClick?: () => void,
 * }} props
 */
export default function OutcomeCard({ outcome, onClick }) {
  const [hovered, setHovered] = React.useState(false);
  const { title, value, target, goalPct, deltaPp, trend } = outcome;

  const positive = deltaPp >= 0;
  const trendColor = positive ? "var(--color-success)" : "var(--color-error)";
  const trendBg = positive ? "var(--color-success-bg)" : "var(--color-error-bg)";
  const TrendIcon = positive ? TrendingUp : TrendingDown;

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={`Open ${title} outcome`}
      style={ocStyles.button}
    >
      <Card
        tone="outline"
        padX={20}
        padY={18}
        style={{
          ...ocStyles.card,
          boxShadow: hovered ? "var(--shadow-8)" : "var(--shadow-card)",
          transform: hovered ? "translateY(-2px)" : "none",
        }}
      >
        <div style={ocStyles.head}>
          <span style={ocStyles.title}>{title}</span>
          <span style={{ ...ocStyles.delta, color: trendColor, background: trendBg }}>
            <TrendIcon size={13} color={trendColor} />
            {Math.abs(deltaPp)} pp
          </span>
        </div>

        <div style={ocStyles.value}>
          {value}
          <span style={ocStyles.valueUnit}>%</span>
        </div>

        <div style={ocStyles.goalRow}>
          <span style={ocStyles.goalBadge}>{goalPct}% of goal</span>
          <span style={ocStyles.target}>target {target}%</span>
        </div>

        <div style={ocStyles.spark}>
          <MetricSparkline
            points={trend}
            color={trendColor}
            target={target}
            formatValue={(v) => `${Math.round(v)}%`}
          />
        </div>
      </Card>
    </button>
  );
}

const ocStyles = {
  button: {
    appearance: "none",
    display: "block",
    width: "100%",
    padding: 0,
    border: "none",
    background: "transparent",
    textAlign: "left",
    cursor: "pointer",
    fontFamily: "var(--font-sans)",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    height: "100%",
    transition: "box-shadow 140ms ease, transform 140ms ease",
  },
  head: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: 600,
    color: "var(--color-text-deep)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  delta: {
    display: "inline-flex",
    alignItems: "center",
    gap: 3,
    height: 24,
    paddingInline: 8,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 700,
    flexShrink: 0,
    fontVariantNumeric: "tabular-nums",
  },
  value: {
    display: "flex",
    alignItems: "baseline",
    gap: 1,
    fontSize: 40,
    fontWeight: 800,
    lineHeight: 1,
    color: "var(--color-text-deep)",
    fontVariantNumeric: "tabular-nums",
  },
  valueUnit: {
    fontSize: 22,
    fontWeight: 700,
    color: "var(--color-text-tertiary)",
  },
  goalRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  goalBadge: {
    display: "inline-flex",
    alignItems: "center",
    height: 22,
    paddingInline: 8,
    borderRadius: 6,
    background: "var(--badge-amber-bg)",
    color: "var(--badge-amber)",
    fontSize: 12,
    fontWeight: 700,
    fontVariantNumeric: "tabular-nums",
  },
  target: {
    fontSize: 12,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
    fontVariantNumeric: "tabular-nums",
  },
  spark: {
    marginTop: "auto",
    paddingTop: 4,
  },
};
