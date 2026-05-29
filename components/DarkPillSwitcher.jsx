"use client";

import React from "react";

// DarkPillSwitcher — demo-only horizontal dark switcher matching the
// MilestoneSideRail M0/M1/M2 button family (Part F). Two callsites today
// — PersonaSwitcher and VariantSwitcher — and both must read as visual
// siblings per spec §F2/§F3, so the chrome lives in one place to prevent
// drift. Not in CONVENTIONS.md's standard inventory: this is meta-tooling
// (demo affordance), kept out of product chrome.
//
// Iteration: dropped the small-caps label above the pill + tightened the
// corner radius to a rectangle. Selected segment uses the M1 milestone-
// rail yellow (#FDE047) by default (spec §F2 / §F8 #1). Unselected
// segments are muted on the dark pill.

export default function DarkPillSwitcher({
  value,
  options,
  onChange,
  ariaLabel,
}) {
  const [hovered, setHovered] = React.useState(null);
  return (
    <div style={styles.pill} role="group" aria-label={ariaLabel}>
      {options.map((opt) => {
        const selected = value === opt;
        const isHover = hovered === opt;
        return (
          <button
            key={opt}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange?.(opt)}
            onMouseEnter={() => setHovered(opt)}
            onMouseLeave={() => setHovered((h) => (h === opt ? null : h))}
            style={segmentStyle(selected, isHover)}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

// segmentStyle — mirrors MilestoneSideRail.railBtnStyle states (active /
// hover / default). Horizontal variant: wider min-width, side padding,
// rectangular corners to match the outer container.
function segmentStyle(active, isHover) {
  if (active) {
    return { ...styles.segment, background: "#FDE047", color: "#171717", border: "1px solid #FDE047" };
  }
  if (isHover) {
    return { ...styles.segment, background: "#404040", color: "#F5F5F5", border: "1px solid #525252" };
  }
  return { ...styles.segment, background: "transparent", color: "#D4D4D4", border: "1px solid transparent" };
}

const styles = {
  pill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: 4,
    background: "#171717",
    border: "1px solid #404040",
    borderRadius: 8,
    boxShadow: "0 12px 32px rgba(0, 0, 0, 0.4)",
    fontFamily: "var(--font-sans)",
  },
  segment: {
    appearance: "none",
    minWidth: 64,
    height: 30,
    padding: "0 14px",
    borderRadius: 6,
    fontFamily: "var(--font-mono)",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.04em",
    cursor: "pointer",
    transition: "background 120ms ease, color 120ms ease, border-color 120ms ease",
  },
};
