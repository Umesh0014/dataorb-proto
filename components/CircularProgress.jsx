"use client";

import React from "react";

// CircularProgress — SVG circular gauge with a tone-keyed ring + centered
// percentage label. Used inside the Completed-state Banner's leading slot
// to show the percentage of agents who met their readiness target.
//
// Props:
//   pct         0–100, integer
//   size        diameter in px (default 56)
//   stroke      ring thickness in px (default 5)
//   ringColor   CSS color (default `var(--color-success)`)
//   trackColor  CSS color for the background track (default `rgba(255,255,255,0.7)`)
//   label       boolean — render `{pct}%` text in center (default true)
//
// TODO: stories

export default function CircularProgress({
  pct,
  size = 56,
  stroke = 5,
  ringColor = "var(--color-success)",
  trackColor = "rgba(255,255,255,0.7)",
  label = true,
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  const cx = size / 2;
  const cy = size / 2;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={ringColor}
        strokeWidth={stroke}
        strokeDasharray={`${dash} ${c - dash}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
      />
      {label && (
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily='"Mulish", sans-serif'
          fontSize={11}
          fontWeight={700}
          fill={ringColor}
        >
          {pct}%
        </text>
      )}
    </svg>
  );
}
