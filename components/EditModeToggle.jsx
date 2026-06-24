"use client";

import React from "react";

// EditModeToggle — C6's in-page vertical a/b segmented control: pick how tiers
// are edited (a = inline on the card, b = via a dialog). Sits beside the tier
// cards; the C-version selection itself stays in the bottom version bar.
const OPTIONS = [
  { id: "inline", label: "a", title: "Inline — edit on the card" },
  { id: "dialog", label: "b", title: "Dialog — click a card to view, pencil to edit" },
];

export default function EditModeToggle({ value, onChange }) {
  return (
    <div style={styles.wrap} role="radiogroup" aria-label="Tier edit mode">
      {OPTIONS.map((o) => {
        const on = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={on}
            title={o.title}
            onClick={() => onChange(o.id)}
            style={{
              ...styles.btn,
              background: on ? "var(--color-icon-tertiary-fg)" : "#FFFFFF",
              color: on ? "#FFFFFF" : "var(--color-text-medium)",
              borderColor: on ? "var(--color-icon-tertiary-fg)" : "var(--color-border-card-soft)",
              fontWeight: on ? 700 : 500,
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

const styles = {
  wrap: { display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 },
  btn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    border: "1px solid",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: 13,
    transition: "background 120ms ease, color 120ms ease, border-color 120ms ease",
  },
};
