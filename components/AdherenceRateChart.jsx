"use client";

import React from "react";
import Card from "./Card";
import useMeasuredWidth from "./useMeasuredWidth";
import { formatDate } from "./formatDate";

// Seed data for the Adherence rate tab. Each point:
//   date (ISO), agent (int %), orgAverage (int %)
const adherenceRateData = [
  { date: "2026-03-20", agent: 20, orgAverage: 80 },
  { date: "2026-03-21", agent: 20, orgAverage: 80 },
  { date: "2026-03-22", agent: 13, orgAverage: 79 },
  { date: "2026-03-23", agent: 40, orgAverage: 80 },
  { date: "2026-03-24", agent: 48, orgAverage: 81 },
  { date: "2026-03-25", agent: 40, orgAverage: 80 },
  { date: "2026-03-26", agent: 60, orgAverage: 80 },
];

const CHART_HEIGHT = 300;
const Y_TICKS = [0, 20, 40, 60, 80, 100];

// AdherenceRateChart — hand-rolled SVG line chart with two series (agent's
// daily adherence rate, solid + markers; org. average, dashed). Mirrors the
// chart treatment in RoleplayCoverage / ChannelEngagementCard.
export default function AdherenceRateChart({ data = adherenceRateData }) {
  const [ref, width] = useMeasuredWidth(0);
  const [hover, setHover] = React.useState(null); // { index, rect }

  const pad = { top: 16, right: 20, bottom: 36, left: 56 };
  const innerW = Math.max(0, width - pad.left - pad.right);
  const innerH = CHART_HEIGHT - pad.top - pad.bottom;
  const maxY = 100;

  const xAt = (i) =>
    pad.left + (data.length <= 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
  const yAt = (v) => pad.top + innerH - (v / maxY) * innerH;

  const agentPts = data.map((d, i) => ({ x: xAt(i), y: yAt(d.agent) }));
  const orgPts = data.map((d, i) => ({ x: xAt(i), y: yAt(d.orgAverage) }));
  const toPath = (pts) => pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");

  return (
    <div style={arcStyles.wrap}>
      <div style={arcStyles.legend}>
        <span style={arcStyles.legendItem}>
          <span style={arcStyles.legendSolid} />
          <span style={arcStyles.legendLabel}>Adherence rate</span>
        </span>
        <span style={arcStyles.legendItem}>
          <span style={arcStyles.legendDashed} />
          <span style={arcStyles.legendLabel}>Org. average</span>
        </span>
      </div>

      <div ref={ref} style={arcStyles.chartArea}>
        {width > 0 && (
          <svg
            width={width}
            height={CHART_HEIGHT}
            viewBox={`0 0 ${width} ${CHART_HEIGHT}`}
            style={{ display: "block" }}
          >
            {Y_TICKS.map((v) => {
              const y = yAt(v);
              return (
                <g key={v}>
                  <line
                    x1={pad.left}
                    y1={y}
                    x2={width - pad.right}
                    y2={y}
                    style={{ stroke: "var(--table-header-border)" }}
                    strokeWidth={1}
                  />
                  <text
                    x={pad.left - 12}
                    y={y + 4}
                    textAnchor="end"
                    fontSize={11}
                    style={{ fill: "var(--text-disabled)" }}
                  >
                    {v}
                  </text>
                </g>
              );
            })}

            <text
              x={16}
              y={pad.top + innerH / 2}
              textAnchor="middle"
              fontSize={11}
              style={{ fill: "var(--text-disabled)" }}
              transform={`rotate(-90, 16, ${pad.top + innerH / 2})`}
            >
              Adherence rate
            </text>

            {/* Org. average — dashed secondary series, no markers. */}
            <path
              d={toPath(orgPts)}
              fill="none"
              style={{ stroke: "var(--chart-grey)" }}
              strokeWidth={2}
              strokeDasharray="5 4"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Agent — solid primary series with markers. */}
            <path
              d={toPath(agentPts)}
              fill="none"
              style={{ stroke: "var(--chart-blue)" }}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {agentPts.map((p, i) => (
              <g key={i}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={hover && hover.index === i ? 6 : 4}
                  style={{ fill: "var(--surface-white)", stroke: "var(--chart-blue)" }}
                  strokeWidth={2}
                />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={16}
                  fill="transparent"
                  style={{ cursor: "pointer" }}
                  onMouseEnter={(e) =>
                    setHover({ index: i, rect: e.currentTarget.getBoundingClientRect() })
                  }
                  onMouseLeave={() => setHover(null)}
                  onClick={() => {
                    // TODO: drill into adherence for this date
                  }}
                />
              </g>
            ))}

            {data.map((d, i) => {
              const last = data.length - 1;
              const anchor = i === 0 ? "start" : i === last ? "end" : "middle";
              return (
                <text
                  key={i}
                  x={xAt(i)}
                  y={CHART_HEIGHT - 12}
                  textAnchor={anchor}
                  fontSize={11}
                  style={{ fill: "var(--text-disabled)" }}
                >
                  {formatDate(d.date)}
                </text>
              );
            })}
          </svg>
        )}
        {hover && <ChartTooltip rect={hover.rect} point={data[hover.index]} />}
      </div>
    </div>
  );
}

// ChartTooltip — per-date hover card showing both series' values.
function ChartTooltip({ rect, point }) {
  return (
    <Card
      shadow
      padX={16}
      padY={14}
      style={{
        position: "fixed",
        left: rect.left + rect.width / 2,
        top: rect.bottom + 8,
        transform: "translateX(-50%)",
        width: 220,
        zIndex: 1000,
        pointerEvents: "none",
      }}
    >
      <div style={arcStyles.tipDate}>{formatDate(point.date)}</div>
      <div style={arcStyles.tipDivider} />
      <div style={arcStyles.tipRow}>
        <span style={arcStyles.tipKey}>
          <span style={{ ...arcStyles.tipDot, background: "var(--chart-blue)" }} />
          Adherence rate
        </span>
        <span style={arcStyles.tipVal}>{point.agent}%</span>
      </div>
      <div style={arcStyles.tipRow}>
        <span style={arcStyles.tipKey}>
          <span style={{ ...arcStyles.tipDot, background: "var(--chart-grey)" }} />
          Org. average
        </span>
        <span style={arcStyles.tipVal}>{point.orgAverage}%</span>
      </div>
    </Card>
  );
}

const arcStyles = {
  wrap: {
    marginTop: 16,
  },
  legend: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 20,
    marginBottom: 8,
  },
  legendItem: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  },
  legendSolid: {
    width: 16,
    height: 2,
    borderRadius: 1,
    background: "var(--chart-blue)",
  },
  legendDashed: {
    width: 16,
    borderTop: "2px dashed var(--chart-grey)",
  },
  legendLabel: {
    fontSize: 12,
    color: "var(--color-text-tertiary)",
  },
  chartArea: {
    position: "relative",
    width: "100%",
  },
  tipDate: {
    fontSize: 13,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    lineHeight: 1.4,
  },
  tipDivider: {
    height: 1,
    background: "var(--color-divider-card)",
    margin: "10px 0",
  },
  tipRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    padding: "3px 0",
  },
  tipKey: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    fontWeight: 500,
    color: "var(--color-text-medium)",
  },
  tipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  tipVal: {
    fontSize: 13,
    fontWeight: 700,
    color: "var(--color-text-deep)",
  },
};
