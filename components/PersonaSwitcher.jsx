"use client";

import React from "react";

// PersonaSwitcher — demo-only floating pill anchored to the
// bottom-right of the viewport (Part E). Mirrors the segmented-pill
// pattern from CreditsUsagePage (the closest existing M1/M2-style
// segmented control in the app) so no new switcher style is invented.
// The "View as:" label frames the affordance as a preview tool, not
// permanent product chrome.
//
// Removability: when the demo ends, delete this file + the persona
// state in MissionsLandingShell + the persona prop chain through
// MissionsKanbanLayout / MissionDetailContent. Persona logic never
// enters shared components (gated at page level only).

export const PERSONAS = ["Team Leader", "Agent"];

export default function PersonaSwitcher({ persona, onChange }) {
  return (
    <div style={styles.wrap} role="group" aria-label="Persona preview switcher">
      <span style={styles.label}>View as</span>
      <div style={styles.pill}>
        {PERSONAS.map((p) => {
          const selected = persona === p;
          return (
            <button
              key={p}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange?.(p)}
              style={{
                ...styles.segment,
                background: selected ? "var(--do-brand-blue)" : "transparent",
                color: selected ? "#FFFFFF" : "var(--color-text-medium)",
              }}
            >
              {p}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    position: "fixed",
    right: 24,
    bottom: 24,
    zIndex: 50,
    display: "inline-flex",
    alignItems: "center",
    gap: 12,
    padding: "8px 12px",
    background: "#FFFFFF",
    border: "1px solid var(--color-border-card-soft)",
    borderRadius: 999,
    boxShadow: "0 4px 16px rgba(27, 27, 31, 0.12)",
    fontFamily: "var(--font-sans)",
  },
  label: {
    fontSize: 11, fontWeight: 600, letterSpacing: "0.5px",
    textTransform: "uppercase",
    color: "var(--color-text-tertiary)",
  },
  pill: {
    display: "inline-flex",
    padding: 2,
    background: "var(--color-card-emoji-bg)",
    border: "1px solid var(--color-border-card-soft)",
    borderRadius: 999,
  },
  segment: {
    appearance: "none",
    border: "none",
    padding: "6px 14px",
    borderRadius: 999,
    fontFamily: "inherit",
    fontSize: 13, fontWeight: 600, letterSpacing: "0.1px",
    cursor: "pointer",
    transition: "background 120ms ease, color 120ms ease",
  },
};
