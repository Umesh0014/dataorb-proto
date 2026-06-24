"use client";

import React from "react";
import useMeasuredWidth from "./useMeasuredWidth";

// OutcomeTrendChart — single-series area/line trend for the outcome detail
// page. Borrows the Learning Hub impact chart's interaction + chrome
// (AgentImpactChart): %-labelled y gridlines, a soft gradient area, and a
// scrubber that drops a vertical tracking line with the period above it and a
// dot on the line, reporting the scrubbed point up via `onScrub` so the
// headline metric changes live. Y-domain fits the data (with the target) so
// the trend keeps its shape instead of flat-lining.

const H = 200;
const ML = 40;
const MR = 16;
const MT = 20;
const MB = 16;
const PLOT_BOTTOM = H - MB;

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

export default function OutcomeTrendChart({ points, labels, target, color, onScrub }) {
  const [wrapRef, measured] = useMeasuredWidth(640);
  const W = Math.max(320, measured);
  const [hoverIdx, setHoverIdx] = React.useState(null);
  const gid = React.useId();

  const N = points.length;
  const hasTarget = typeof target === "number";
  const lo = Math.min(...points, hasTarget ? target : Infinity);
  const hi = Math.max(...points, hasTarget ? target : -Infinity);
  const padY = Math.max(2, (hi - lo) * 0.12);
  const yMin = lo - padY;
  const yMax = hi + padY;

  const gridVals = [hi, Math.round((hi + lo) / 2), lo];

  const xPix = (i) => ML + (N === 1 ? 0.5 : i / (N - 1)) * (W - ML - MR);
  const yPix = (v) => MT + (1 - (v - yMin) / (yMax - yMin || 1)) * (PLOT_BOTTOM - MT);

  const linePath = points
    .map((v, i) => `${i ? "L" : "M"}${xPix(i).toFixed(1)},${yPix(v).toFixed(1)}`)
    .join(" ");
  const areaPath =
    `${linePath} L${xPix(N - 1).toFixed(1)},${PLOT_BOTTOM} L${xPix(0).toFixed(1)},${PLOT_BOTTOM} Z`;

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const t = (e.clientX - rect.left - ML) / (W - ML - MR);
    if (t < -0.03 || t > 1.03) {
      setHoverIdx(null);
      onScrub?.(null);
      return;
    }
    const idx = Math.round(clamp(t, 0, 1) * (N - 1));
    setHoverIdx(idx);
    onScrub?.({ value: points[idx], label: labels?.[idx], index: idx });
  };
  const onLeave = () => {
    setHoverIdx(null);
    onScrub?.(null);
  };

  const hx = hoverIdx != null ? xPix(hoverIdx) : null;

  return (
    <div ref={wrapRef} style={s.wrap} onMouseMove={onMove} onMouseLeave={onLeave}>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Outcome trend">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.22} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>

        {gridVals.map((v, i) => (
          <g key={`y-${i}`}>
            <line x1={ML} y1={yPix(v)} x2={W - MR} y2={yPix(v)} stroke="var(--color-divider-card)" strokeWidth={1} />
            <text x={ML - 8} y={yPix(v) + 4} textAnchor="end" style={s.axisText}>{v}%</text>
          </g>
        ))}

        {hasTarget && (
          <line
            x1={ML}
            y1={yPix(target)}
            x2={W - MR}
            y2={yPix(target)}
            stroke="var(--color-text-tertiary)"
            strokeWidth={1}
            strokeDasharray="3 3"
            opacity={0.7}
          />
        )}

        <path d={areaPath} fill={`url(#${gid})`} />
        <path d={linePath} fill="none" stroke={color} strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round" />

        {hoverIdx != null && (
          <g pointerEvents="none">
            <line x1={hx} y1={MT} x2={hx} y2={PLOT_BOTTOM} stroke="var(--grey-500)" strokeWidth={1} />
            {labels?.[hoverIdx] && (
              <text x={clamp(hx, ML + 28, W - MR - 28)} y={12} textAnchor="middle" style={s.scrubLabel}>
                {String(labels[hoverIdx]).toUpperCase()}
              </text>
            )}
            <circle cx={hx} cy={yPix(points[hoverIdx])} r={4} fill={color} stroke="#FFFFFF" strokeWidth={1.5} />
          </g>
        )}
      </svg>
    </div>
  );
}

const s = {
  wrap: { position: "relative", width: "100%" },
  axisText: {
    fontFamily: "var(--font-sans)",
    fontSize: 11,
    fontWeight: 600,
    fill: "var(--color-text-tertiary)",
  },
  scrubLabel: {
    fontFamily: "var(--font-sans)",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.06em",
    fill: "var(--color-text-tertiary)",
  },
};
