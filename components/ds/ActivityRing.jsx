"use client";

import React from "react";
import { TYPE, COLORS } from "../designTokens";

// DS · ActivityRing — concentric multi-arc progress ring (fills the Figma-DS
// gap: the DS has donut/bar/line charts but no activity ring). Each arc is
// hoverable/clickable and the centre swaps to the active category's score.
export default function ActivityRing({
  categories, total, onTrack, ringColors, activeName, onHover, onPick,
  size = 132, stroke = 10, gap = 4,
}) {
  const rings = categories.map((c, i) => {
    const r = size / 2 - stroke / 2 - i * (stroke + gap);
    return { r, circ: 2 * Math.PI * r, pct: c.score, color: ringColors[i % ringColors.length], cat: c };
  });
  const activeCat = categories.find((c) => c.name === activeName);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      {rings.map((ring, i) => {
        const dim = activeName && ring.cat.name !== activeName;
        return (
          <g key={i} style={{ cursor: onPick ? "pointer" : "default", transition: "opacity .15s" }}
            opacity={dim ? 0.3 : 1}
            onMouseEnter={() => onHover?.(ring.cat.name)} onMouseLeave={() => onHover?.(null)}
            onClick={() => onPick?.(ring.cat.name)}>
            <title>{ring.cat.name}: {ring.cat.score}/100 · {ring.cat.status}</title>
            <circle cx={size / 2} cy={size / 2} r={ring.r} fill="none" stroke={COLORS.divider} strokeWidth={stroke} />
            <circle cx={size / 2} cy={size / 2} r={ring.r} fill="none" stroke={ring.color}
              strokeWidth={ring.cat.name === activeName ? stroke + 2 : stroke}
              strokeDasharray={`${(ring.pct / 100) * ring.circ} ${ring.circ}`} strokeLinecap="round"
              transform={`rotate(-90 ${size / 2} ${size / 2})`} />
          </g>
        );
      })}
      {activeCat ? (
        <>
          <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle" style={{ ...TYPE.displaySmall, fill: COLORS.textBody }}>{activeCat.score}</text>
          <text x="50%" y="61%" textAnchor="middle" dominantBaseline="middle" style={{ ...TYPE.chartXSmall, fill: COLORS.textFaint }}>{activeCat.name}</text>
        </>
      ) : (
        <>
          <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle" style={{ ...TYPE.displaySmall, fill: COLORS.textBody }}>{onTrack}/{total}</text>
          <text x="50%" y="61%" textAnchor="middle" dominantBaseline="middle" style={{ ...TYPE.chartXSmall, fill: COLORS.textFaint }}>on track</text>
        </>
      )}
    </svg>
  );
}
