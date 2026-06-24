/* eslint-disable no-restricted-syntax --
   The card is one drill-in surface with an independent kebab menu. Nested
   <button>s are invalid HTML, so a full-card transparent <button> (the drill-in
   target) sits beneath the content and the kebab is a separate sibling <button>
   on top — same "clickable tile" precedent as MiraMetricsBento, kept accessible.
   Neither is a Button.jsx pill/icon/text shape. */
"use client";

import React from "react";
import { MoreHorizontal } from "lucide-react";
import Card from "./Card";

/**
 * OutcomeCard — the single metric card for the Ask Mira Pro Outcomes landing.
 *
 * Visual language is borrowed from the Transactions reference card: title +
 * kebab on top, an oversized value bottom-left, a dot-matrix bar chart of the
 * trend in the centre (with an always-on "Peak" callout naming the high
 * point — Neil's labelling rule, so the chart is never an unexplained shape),
 * and a "vs last period" delta on the right.
 *
 * Colour is driven by the delta SIGN, not by above/below target (Jun 9 rule):
 * deltaPp >= 0 → success, else danger. Both the delta and the dot-chart fill
 * read from this. Delta is labelled in `pp` (percentage points) per house
 * standard, not the mock's "pts". The dot-matrix is a stylized bar chart —
 * within the allowed chart set (bar / trend / pie / donut / ring).
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
  const accent = positive ? "var(--color-success)" : "var(--color-error)";

  return (
    <div
      style={ocStyles.wrap}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
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
        {/* Full-card drill-in target — sits beneath the content so the whole
            card is one keyboard-focusable click, minus the kebab on top. */}
        <button
          type="button"
          onClick={onClick}
          aria-label={`Open ${title} outcome`}
          style={ocStyles.overlay}
        />

        <div style={ocStyles.head}>
          <span style={ocStyles.title}>{title}</span>
          <button
            type="button"
            onClick={() => {
              // TODO: outcome card menu (next ticket)
            }}
            aria-label={`${title} outcome options`}
            style={ocStyles.kebab}
          >
            <MoreHorizontal size={16} color="var(--color-text-tertiary)" />
          </button>
        </div>

        <div style={ocStyles.body}>
          <div style={ocStyles.valueBlock}>
            <div style={ocStyles.value}>
              {value}
              <span style={ocStyles.unit}>%</span>
            </div>
            <span style={ocStyles.goalBadge}>{goalPct}% of goal</span>
            <span style={ocStyles.target}>target {target}%</span>
          </div>

          <div style={ocStyles.chartWrap}>
            <DotChart points={trend} color={accent} />
          </div>

          <div style={ocStyles.deltaBlock}>
            <span style={ocStyles.vsLabel}>vs last period</span>
            <span style={{ ...ocStyles.delta, color: accent }}>
              {positive ? "+" : ""}
              {deltaPp} pp
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Period axis for the dot-matrix columns. Trend readings map 1:1 to the last
// twelve months; the peak callout names the month of the high point.
const PERIODS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const ROWS = 7;

// DotChart — dependency-free dot-matrix bar chart. Each column's solid-dot
// height is proportional to that period's value; remaining dots render as a
// faint tint of the same colour (the track). The tallest column carries an
// always-on "Peak" tag so the shape is self-explaining.
function DotChart({ points, color }) {
  const n = points.length;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const peakIdx = points.indexOf(max);
  const track = `color-mix(in srgb, ${color} 22%, var(--surface-white))`;

  const filled = (v) =>
    max === min ? ROWS : 1 + Math.round(((v - min) / (max - min)) * (ROWS - 1));

  return (
    <div style={dotStyles.chart}>
      <span
        style={{ ...dotStyles.peak, left: `${((peakIdx + 0.5) / n) * 100}%` }}
      >
        Peak: <b style={dotStyles.peakValue}>{PERIODS[peakIdx] ?? `P${peakIdx + 1}`}</b>
      </span>
      <div style={dotStyles.cols}>
        {points.map((v, i) => {
          const on = filled(v);
          return (
            <div key={i} style={dotStyles.col}>
              {Array.from({ length: ROWS }).map((_, j) => (
                <span
                  key={j}
                  style={{ ...dotStyles.dot, background: j < on ? color : track }}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const ocStyles = {
  wrap: {
    display: "block",
    width: "100%",
    height: "100%",
    fontFamily: "var(--font-sans)",
  },
  card: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: 18,
    height: "100%",
    transition: "box-shadow 140ms ease, transform 140ms ease",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    appearance: "none",
    border: "none",
    background: "transparent",
    borderRadius: "inherit",
    cursor: "pointer",
    padding: 0,
    zIndex: 0,
  },

  head: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    pointerEvents: "none",
  },
  title: {
    fontSize: 15,
    fontWeight: 600,
    color: "var(--color-text-deep)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  kebab: {
    pointerEvents: "auto",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 28,
    height: 28,
    borderRadius: 999,
    border: "1px solid var(--color-divider-card)",
    background: "var(--surface-white)",
    cursor: "pointer",
    flexShrink: 0,
  },

  body: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    alignItems: "center",
    gap: 16,
    pointerEvents: "none",
  },
  valueBlock: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    flexShrink: 0,
  },
  value: {
    display: "flex",
    alignItems: "baseline",
    gap: 1,
    fontSize: 38,
    fontWeight: 800,
    lineHeight: 1,
    color: "var(--color-text-deep)",
    fontVariantNumeric: "tabular-nums",
  },
  unit: {
    fontSize: 20,
    fontWeight: 700,
    color: "var(--color-text-tertiary)",
  },
  goalBadge: {
    alignSelf: "flex-start",
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

  chartWrap: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    justifyContent: "center",
  },

  deltaBlock: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 4,
    flexShrink: 0,
    textAlign: "right",
  },
  vsLabel: {
    fontSize: 12,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
  },
  delta: {
    fontSize: 18,
    fontWeight: 800,
    fontVariantNumeric: "tabular-nums",
  },
};

const dotStyles = {
  chart: {
    position: "relative",
    paddingTop: 20,
    display: "inline-flex",
    justifyContent: "center",
  },
  peak: {
    position: "absolute",
    top: 0,
    transform: "translateX(-50%)",
    whiteSpace: "nowrap",
    display: "inline-flex",
    alignItems: "center",
    gap: 3,
    height: 18,
    paddingInline: 7,
    borderRadius: 9,
    background: "var(--surface-white)",
    border: "1px solid var(--color-divider-card)",
    boxShadow: "var(--shadow-card)",
    fontSize: 10,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
  },
  peakValue: {
    fontWeight: 700,
    color: "var(--color-text-deep)",
  },
  cols: {
    display: "flex",
    alignItems: "flex-end",
    gap: 4,
  },
  col: {
    display: "flex",
    flexDirection: "column-reverse",
    gap: 3,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: "50%",
  },
};
