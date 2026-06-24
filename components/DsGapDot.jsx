"use client";

import React from "react";

// DsGapDot — a lemon-green "notification" circle that flags a component which
// is NOT in the 2.0 Design System (a gap where a real DS component still needs
// to be created). Used in B10 so design-system holes are visible at a glance.
export const DS_GAP_GREEN = "#C6F000";

export default function DsGapDot({ label = "Not in the design system — needs a DS component", size = 12, style }) {
  return (
    <span
      title={label}
      aria-label={label}
      style={{
        position: "absolute",
        top: -5,
        right: -5,
        width: size,
        height: size,
        borderRadius: 999,
        background: DS_GAP_GREEN,
        border: "2px solid #FFFFFF",
        boxShadow: "0 0 0 1px rgba(0,0,0,0.06), 0 0 7px rgba(198,240,0,0.85)",
        zIndex: 6,
        ...style,
      }}
    />
  );
}
