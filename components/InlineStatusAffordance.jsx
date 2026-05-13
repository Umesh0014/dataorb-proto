"use client";

import React from "react";

// InlineStatusAffordance — leading icon + tone-colored text, no chip
// wrapper / no background fill. Used for time-remaining chips on Active
// cards (e.g. "45 days left", "Ends Today"), the inline `🗂 Draft`
// indicator on Draft cards / detail headers, and the `🎉 Completed`
// indicator on Completed cards / detail headers.
//
// Props:
//   tone     "success" | "warning" | "danger" | "info" | "medium" | "tertiary"
//   icon     React node (rendered before the children)
//   size     "sm" (13px, default) | "md" (14px — used in detail headers)
//   children Label text
//
// TODO: stories

const TONE_COLOR = {
  success:  "var(--color-success)",
  warning:  "var(--color-warning)",
  danger:   "var(--color-error)",
  info:     "var(--color-info)",
  medium:   "var(--color-text-medium)",
  tertiary: "var(--color-text-tertiary)",
};

export default function InlineStatusAffordance({
  tone = "medium",
  icon = null,
  size = "sm",
  children,
  style,
}) {
  return (
    <span
      style={{
        ...baseStyle,
        color: TONE_COLOR[tone] || TONE_COLOR.medium,
        fontSize: size === "md" ? 13 : 12,
        ...style,
      }}
    >
      {icon}
      {children}
    </span>
  );
}

const baseStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  fontFamily: '"Mulish", sans-serif',
  fontWeight: 600,
  whiteSpace: "nowrap",
};
