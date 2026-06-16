"use client";

import React from "react";

// MobileStreakRing — the one chart on the mobile surface: a goal-progress
// ring (the Apple-watch "did I hit my goal" mental model the guidelines
// name explicitly). It is a *gauge of a goal*, never a verdict on the
// person (G4).
//
// Labelling is built in, not hover-revealed: the value/max sits in the
// centre, a caption sits below, and the same numbers are exposed as text
// — so the ring is never the only way to read the data (G2 colour-alone,
// G3 labelled number, WCAG-9 reachable-as-text). Track + progress also
// differ in lightness, so the fill reads without relying on hue.

export default function MobileStreakRing({
  value,
  max,
  centerTop,
  centerSub,
  size = 96,
  stroke = 9,
}) {
  const safeMax = Math.max(max, 1);
  const pct = Math.min(value / safeMax, 1);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * pct;

  return (
    <div
      style={styles.wrap}
      role="img"
      aria-label={`${centerTop} of ${centerSub}: ${value} of ${max}`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-divider-card)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-button-primary-bg)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text
          x="50%"
          y="46%"
          textAnchor="middle"
          dominantBaseline="middle"
          style={styles.centerTop}
        >
          {centerTop}
        </text>
        <text
          x="50%"
          y="64%"
          textAnchor="middle"
          dominantBaseline="middle"
          style={styles.centerSub}
        >
          {centerSub}
        </text>
      </svg>
    </div>
  );
}

const styles = {
  wrap: { display: "inline-flex", flexShrink: 0 },
  centerTop: {
    fontFamily: "var(--font-sans)",
    fontSize: 22,
    fontWeight: 800,
    fill: "var(--color-text-deep)",
  },
  centerSub: {
    fontFamily: "var(--font-sans)",
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.4px",
    fill: "var(--color-text-tertiary)",
    textTransform: "uppercase",
  },
};
