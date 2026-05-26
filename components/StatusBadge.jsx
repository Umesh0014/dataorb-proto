"use client";

import React from "react";

// StatusBadge — small tone-keyed pill for at-a-glance status. Used by the
// Kanban running-mission sub-state badges (Just Started / On Track /
// Ending Soon / Ends Today / Ready to Close) and shares its visual
// language with the focus-area StatusPill in MissionDetailContent.
//
// Props:
//   tone     "success" | "warning" | "danger" | "info"  (default "info")
//   children Label text.

const TONES = {
  success: { bg: "var(--color-success-bg)", fg: "var(--color-success)" },
  warning: { bg: "var(--color-warning-bg)", fg: "var(--color-warning)" },
  danger:  { bg: "var(--color-error-bg)",   fg: "var(--color-error)" },
  info:    { bg: "var(--color-info-bg)",    fg: "var(--color-info)" },
};

export default function StatusBadge({ tone = "info", children }) {
  const t = TONES[tone] || TONES.info;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 8px",
        borderRadius: 4,
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: "nowrap",
        flexShrink: 0,
        background: t.bg,
        color: t.fg,
        fontFamily: "var(--font-sans)",
      }}
    >
      {children}
    </span>
  );
}
