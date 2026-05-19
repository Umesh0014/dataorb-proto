"use client";

import React from "react";

// MetricSparkline — a 96x24 trend glyph for a metric cell: one SVG line,
// a faint area fill, and a dot on the last point. No axes, labels, hover
// or tooltip — it shows the *shape* the delta chip states in words. With
// fewer than two points it falls back to a flat dashed line and stays
// silent (no "N/A"). The parent aggregates; this component only plots.
export default function MetricSparkline({ points, width = 96, color = "var(--chart-blue)" }) {
  const height = 24;
  const pad = 3;

  if (!points || points.length < 2) {
    const mid = height / 2;
    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ display: "block" }}
      >
        <line
          x1={pad}
          y1={mid}
          x2={width - pad}
          y2={mid}
          fill="none"
          strokeWidth={1.5}
          strokeDasharray="3 3"
          strokeLinecap="round"
          style={{ stroke: "var(--chart-grey)" }}
        />
      </svg>
    );
  }

  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const stepX = (width - pad * 2) / (points.length - 1);
  const coords = points.map((value, i) => {
    const x = pad + i * stepX;
    const y = pad + (1 - (value - min) / span) * (height - pad * 2);
    return [x, y];
  });

  const line = coords
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`)
    .join(" ");
  const baseline = height - pad;
  const area = `${line} L${coords[coords.length - 1][0].toFixed(2)} ${baseline} L${coords[0][0].toFixed(2)} ${baseline} Z`;
  const [endX, endY] = coords[coords.length - 1];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: "block" }}
    >
      <path
        d={area}
        stroke="none"
        style={{ fill: color, fillOpacity: "var(--chart-area-opacity)" }}
      />
      <path
        d={line}
        fill="none"
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        style={{ stroke: color }}
      />
      <circle
        cx={endX}
        cy={endY}
        r={2}
        strokeWidth={1}
        style={{ fill: color, stroke: "var(--surface-white)" }}
      />
    </svg>
  );
}
