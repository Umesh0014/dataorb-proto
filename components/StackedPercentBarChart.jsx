"use client";

import React from "react";
import useMeasuredWidth from "./useMeasuredWidth";

export function StackedPercentBarChart({ months, colorMap, keys, height = 240 }) {
  const [ref, width] = useMeasuredWidth(0);
  const pad = { top: 16, right: 20, bottom: 36, left: 56 };
  const w = Math.max(0, width - pad.left - pad.right);
  const h = height - pad.top - pad.bottom;
  const labelsY = [0, 20, 40, 60, 80, 100];
  const labelsX = ["May 2025", "Sep 2025", "Jan 2026", "May 2026"];
  const barW = Math.min(36, (w / months.length) * 0.55);

  return (
    <div ref={ref} style={{ width: "100%" }}>
      {width > 0 && (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }}>
      {labelsY.map((v, i) => {
        const y = pad.top + h - (v / 100) * h;
        return (
          <React.Fragment key={i}>
            <line x1={pad.left} y1={y} x2={width - pad.right} y2={y} stroke="#E8ECFF" strokeWidth="1" />
            <text x={pad.left - 12} y={y + 4} textAnchor="end" fill="rgba(0,0,0,0.38)" fontSize="11"
              fontFamily="Mulish, sans-serif">{v === 0 ? "0" : v + "%"}</text>
          </React.Fragment>
        );
      })}

      <text x={14} y={pad.top + h / 2} textAnchor="middle" fill="rgba(0,0,0,0.38)" fontSize="11"
        fontFamily="Mulish, sans-serif" transform={`rotate(-90, 14, ${pad.top + h / 2})`}>% Sales Interactions →</text>

      {months.map((m, mi) => {
        const total = keys.reduce((s, k) => s + (m[k] || 0), 0);
        if (total === 0) return null;
        const cx = pad.left + ((mi + 0.5) / months.length) * w;
        let y0 = pad.top + h;
        return (
          <React.Fragment key={mi}>
            {keys.map((k) => {
              const val = m[k] || 0;
              if (val === 0) return null;
              const pct = val / total;
              const barH = pct * h;
              y0 -= barH;
              return <rect key={k} x={cx - barW / 2} y={y0} width={barW} height={barH} fill={colorMap[k]} rx="2" />;
            })}
          </React.Fragment>
        );
      })}

      {labelsX.map((label, i) => (
        <text key={i} x={pad.left + (i / (labelsX.length - 1)) * w} y={height - 8} textAnchor="middle"
          fill="rgba(0,0,0,0.38)" fontSize="11" fontFamily="Mulish, sans-serif">{label}</text>
      ))}
        </svg>
      )}
    </div>
  );
}

export function DistributionRow({ items }) {
  const distStyles = {
    row: {
      display: "flex", gap: 0, padding: "16px 0 0",
      borderTop: "1px solid #E8ECFF",
    },
    item: {
      flex: 1, display: "flex", alignItems: "center", gap: 10, padding: "8px 0",
    },
    label: { fontFamily: '"Mulish", sans-serif', fontSize: 12, color: "rgba(0,0,0,0.60)", lineHeight: 1.4 },
    value: { fontFamily: '"Mulish", sans-serif', fontSize: 13, fontWeight: 600, color: "#1F232A", lineHeight: 1.4 },
  };

  return (
    <div style={distStyles.row}>
      {items.map((it, i) => (
        <div key={i} style={distStyles.item}>
          <span style={{ fontSize: 20 }}>{it.emoji}</span>
          <div>
            <div style={distStyles.label}>{it.label}</div>
            <div style={distStyles.value}>{it.count.toLocaleString()} ({it.pct})</div>
          </div>
        </div>
      ))}
    </div>
  );
}
