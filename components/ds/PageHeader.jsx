"use client";

import React from "react";
import { TYPE, COLORS } from "../designTokens";

// DS · PageHeader — section/page title (Title/Large) + optional subtitle
// (Body/Small) on the left, with an optional actions/filters slot on the right.
export default function PageHeader({ title, subtitle, right }) {
  return (
    <header style={s.row}>
      <div style={s.titles}>
        <span style={s.title}>{title}</span>
        {subtitle && <span style={s.subtitle}>{subtitle}</span>}
      </div>
      {right && <div style={s.right}>{right}</div>}
    </header>
  );
}

const s = {
  row: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 },
  titles: { display: "flex", flexDirection: "column", gap: 4, minWidth: 0 },
  title: { ...TYPE.titleLarge, color: COLORS.textTitle },
  subtitle: { ...TYPE.bodySmall, color: COLORS.textMedium },
  right: { flexShrink: 0, display: "flex", alignItems: "center", gap: 8 },
};
