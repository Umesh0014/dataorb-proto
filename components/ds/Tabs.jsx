"use client";

import React from "react";
import { TYPE, COLORS } from "../designTokens";

// DS · Tabs — underlined active tab (blue), per the DS Tabs component.
// `tabs` is an array of strings or { id, label }.
export default function Tabs({ tabs, value, onChange }) {
  return (
    <div style={s.row} role="tablist">
      {tabs.map((t) => {
        const id = t.id ?? t;
        const active = id === value;
        return (
          <button key={id} type="button" role="tab" aria-selected={active}
            onClick={() => onChange?.(id)}
            style={{ ...s.tab, ...(active ? s.active : null) }}>
            {t.label ?? t}
          </button>
        );
      })}
    </div>
  );
}

const s = {
  row: { display: "flex", gap: 18, borderBottom: `1px solid ${COLORS.divider}` },
  tab: { ...TYPE.titleSmall, border: "none", background: "none", cursor: "pointer", padding: "10px 2px", color: COLORS.textMedium, borderBottom: "2px solid transparent", marginBottom: -1 },
  active: { color: COLORS.primary, borderBottomColor: COLORS.primary },
};
