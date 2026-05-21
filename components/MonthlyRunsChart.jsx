"use client";

import React from "react";
import Card from "./Card";
import useMeasuredWidth from "./useMeasuredWidth";

// MonthlyRunsChart — hand-rolled single-series SVG line chart for the
// skill record view: monthly run counts, a soft area fill, and a dashed
// reference line at the series mean. Mirrors the SVG chart treatment in
// AdherenceRateChart / RoleplayCoverage. Plotting only — the card frame,
// title, and date selector are composed by the parent.
const CHART_HEIGHT = 240;
const Y_TICKS = [0, 200, 400, 600, 800, 1000];
const MAX_Y = 1000;
const LINE = "var(--color-icon-tertiary-fg)";

export default function MonthlyRunsChart({ data = [] }) {
  const [ref, width] = useMeasuredWidth(0);
  const [hover, setHover] = React.useState(null); // { index, rect }
  const gradId = `mrc-${React.useId().replace(/:/g, "")}`;

  const pad = { top: 16, right: 20, bottom: 36, left: 56 };
  const innerW = Math.max(0, width - pad.left - pad.right);
  const innerH = CHART_HEIGHT - pad.top - pad.bottom;
  const baseline = pad.top + innerH;

  const xAt = (i) =>
    pad.left + (data.length <= 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
  const yAt = (v) => pad.top + innerH - (v / MAX_Y) * innerH;

  const avg = data.reduce((sum, d) => sum + d.runs, 0) / Math.max(1, data.length);
  const pts = data.map((d, i) => ({ x: xAt(i), y: yAt(d.runs) }));
  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = pts.length
    ? `${linePath} L${pts[pts.length - 1].x},${baseline} L${pts[0].x},${baseline} Z`
    : "";

  return (
    <div ref={ref} style={mrcStyles.chartArea}>
      {width > 0 && (
        <svg
          width={width}
          height={CHART_HEIGHT}
          viewBox={`0 0 ${width} ${CHART_HEIGHT}`}
          style={{ display: "block" }}
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={LINE} stopOpacity="0.12" />
              <stop offset="1" stopColor={LINE} stopOpacity="0" />
            </linearGradient>
          </defs>

          {Y_TICKS.map((v) => {
            const y = yAt(v);
            return (
              <g key={v}>
                <line
                  x1={pad.left}
                  y1={y}
                  x2={width - pad.right}
                  y2={y}
                  style={{ stroke: "var(--color-divider-card)" }}
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
                <text
                  x={pad.left - 12}
                  y={y + 4}
                  textAnchor="end"
                  fontSize={11}
                  style={{ fill: "var(--color-text-tertiary)" }}
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
            style={{ fill: "var(--color-text-tertiary)" }}
            transform={`rotate(-90, 16, ${pad.top + innerH / 2})`}
          >
            # Runs
          </text>

          {areaPath && <path d={areaPath} stroke="none" fill={`url(#${gradId})`} />}

          {/* Dashed reference line at the series mean. */}
          <line
            x1={pad.left}
            y1={yAt(avg)}
            x2={width - pad.right}
            y2={yAt(avg)}
            style={{ stroke: LINE, opacity: 0.4 }}
            strokeWidth={1.5}
            strokeDasharray="6 6"
          />

          <path
            d={linePath}
            fill="none"
            style={{ stroke: LINE }}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {pts.map((p, i) => (
            <g key={i}>
              {hover && hover.index === i && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={4}
                  style={{ fill: "var(--surface-white)", stroke: LINE }}
                  strokeWidth={2}
                />
              )}
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
              />
            </g>
          ))}

          {data.map((d, i) => {
            const last = data.length - 1;
            const anchor = i === 0 ? "start" : i === last ? "end" : "middle";
            return (
              <text
                key={d.month}
                x={xAt(i)}
                y={CHART_HEIGHT - 12}
                textAnchor={anchor}
                fontSize={12}
                style={{ fill: "var(--color-text-tertiary)" }}
              >
                {d.month}
              </text>
            );
          })}
        </svg>
      )}
      {hover && <ChartTooltip rect={hover.rect} point={data[hover.index]} />}
    </div>
  );
}

// ChartTooltip — per-month hover card.
function ChartTooltip({ rect, point }) {
  return (
    <Card
      shadow
      padX={14}
      padY={12}
      style={{
        position: "fixed",
        left: rect.left + rect.width / 2,
        top: rect.bottom + 8,
        transform: "translateX(-50%)",
        zIndex: 1000,
        pointerEvents: "none",
      }}
    >
      <div style={mrcStyles.tipMonth}>{point.month}</div>
      <div style={mrcStyles.tipValue}>{point.runs.toLocaleString()} runs</div>
    </Card>
  );
}

const mrcStyles = {
  chartArea: { position: "relative", width: "100%" },
  tipMonth: {
    fontSize: 12,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
  },
  tipValue: {
    fontSize: 14,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    lineHeight: 1.4,
  },
};
