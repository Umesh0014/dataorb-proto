"use client";

import React from "react";
import { RAG_HEX } from "./mocks/kpiGoals";

// Compact card sparkline matching the Figma KPIRow: a smooth (quadratic)
// area curve in the RAG colour + a dashed grey target line. Pure SVG.
export default function KpiSparkline({ trend, target, rag = "grey", width = 280, height = 40, fill = false }) {
  const id = React.useId().replace(/:/g, "");
  const lo = Math.min(...trend, target ?? Infinity);
  const hi = Math.max(...trend, target ?? -Infinity);
  const span = hi - lo || 1;
  const x = (i) => (i / (trend.length - 1)) * width;
  const y = (v) => height - ((v - lo) / span) * (height - 6) - 3;
  const pts = trend.map((v, i) => [x(i), y(v)]);

  // Smooth path via midpoint quadratic curves.
  let line = `M ${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length; i += 1) {
    const [px, py] = pts[i - 1];
    const [cx, cy] = pts[i];
    line += ` Q ${px},${py} ${(px + cx) / 2},${(py + cy) / 2}`;
  }
  line += ` L ${pts[pts.length - 1][0]},${pts[pts.length - 1][1]}`;
  const area = `${line} L ${width},${height} L 0,${height} Z`;
  const c = RAG_HEX[rag] || RAG_HEX.grey;
  const ty = target != null ? y(target) : null;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={fill ? "100%" : height} style={fill ? { display: "block" } : undefined} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={`g${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c.line} stopOpacity={0.22} />
          <stop offset="100%" stopColor={c.line} stopOpacity={0.0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#g${id})`} />
      <path d={line} fill="none" stroke={c.line} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
      {ty != null && (
        <line x1={0} x2={width} y1={ty} y2={ty} stroke="#C4C9D6" strokeWidth={1} strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
      )}
    </svg>
  );
}
