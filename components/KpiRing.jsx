"use client";

import React from "react";
import { RAG_HEX } from "./mocks/kpiGoals";

// Shared progress ring used by the progressive / tiles / master-detail forks.
export default function KpiRing({ pct, rag = "grey", size = 48, stroke = 6, label }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const col = RAG_HEX[rag] || RAG_HEX.grey;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-alt)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={col.line} strokeWidth={stroke}
        strokeDasharray={`${(pct / 100) * c} ${c}`} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      {label != null && (
        <text x="50%" y="52%" dominantBaseline="middle" textAnchor="middle"
          style={{ fontSize: size * 0.26, fontWeight: 800, fill: "var(--color-text-deep)" }}>{label}</text>
      )}
    </svg>
  );
}
