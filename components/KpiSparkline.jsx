"use client";

import React from "react";
import { RAG_HEX } from "./mocks/kpiGoals";

// Compact card sparkline: filled area in the RAG colour + a dashed target
// line. Pure SVG (no recharts) so nine of them stay cheap. width/height are
// the drawing box; the parent controls layout.
export default function KpiSparkline({ trend, target, rag = "grey", width = 280, height = 56 }) {
  const id = React.useId().replace(/:/g, "");
  const lo = Math.min(...trend, target ?? Infinity);
  const hi = Math.max(...trend, target ?? -Infinity);
  const span = hi - lo || 1;
  const x = (i) => (i / (trend.length - 1)) * width;
  const y = (v) => height - ((v - lo) / span) * (height - 8) - 4;
  const line = trend.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const area = `0,${height} ${line} ${width},${height}`;
  const c = RAG_HEX[rag] || RAG_HEX.grey;
  const ty = target != null ? y(target) : null;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={`g${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c.line} stopOpacity={0.28} />
          <stop offset="100%" stopColor={c.line} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#g${id})`} />
      <polyline points={line} fill="none" stroke={c.line} strokeWidth={2} vectorEffect="non-scaling-stroke" />
      {ty != null && (
        <line x1={0} x2={width} y1={ty} y2={ty} stroke="#9AA1B2" strokeWidth={1} strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
      )}
    </svg>
  );
}
