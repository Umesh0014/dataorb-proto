"use client";

import React from "react";
import { TYPE, COLORS } from "../designTokens";

// DS · OutcomeBar — a thin segmented bar + inline legend (a compact variant of
// the DS stacked bar). `outcomes` = [{ key, label, color, pct }].
export default function OutcomeBar({ outcomes }) {
  return (
    <div>
      <div style={s.track}>
        {outcomes.map((o) => (
          <div key={o.key} style={{ width: `${o.pct}%`, background: o.color }} title={`${o.label} · ${o.pct}%`} />
        ))}
      </div>
      <div style={s.legend}>
        {outcomes.map((o) => (
          <span key={o.key} style={s.item}>
            <span style={{ ...s.dot, background: o.color }} />
            {o.label} <strong style={s.pct}>{o.pct}%</strong>
          </span>
        ))}
      </div>
    </div>
  );
}

const s = {
  track: { display: "flex", height: 14, borderRadius: 7, overflow: "hidden", gap: 2 },
  legend: { display: "flex", flexWrap: "wrap", gap: "8px 18px", marginTop: 12 },
  item: { ...TYPE.bodySmall, display: "inline-flex", alignItems: "center", gap: 6, color: COLORS.textMedium },
  dot: { width: 8, height: 8, borderRadius: 2, flexShrink: 0 },
  pct: { fontWeight: 700, color: COLORS.textBody },
};
