"use client";

import React from "react";
import { TYPE, COLORS } from "../designTokens";

// DS · Chip — small label/tag. Tones map to the system palette.
const TONES = {
  neutral: { bg: "#F5F5F7", fg: COLORS.textBody },
  blue: { bg: "#EFEFFF", fg: COLORS.primary },
  green: { bg: COLORS.successBg, fg: COLORS.successText },
  amber: { bg: "#FFFBEB", fg: "#B57E12" },
  red: { bg: COLORS.errorBg, fg: COLORS.error },
};

export default function Chip({ children, tone = "neutral", style }) {
  const t = TONES[tone] || TONES.neutral;
  return <span style={{ ...s.chip, background: t.bg, color: t.fg, ...style }}>{children}</span>;
}

const s = {
  chip: { display: "inline-flex", alignItems: "center", padding: "4px 8px", borderRadius: 6, whiteSpace: "nowrap", ...TYPE.labelSmall },
};
