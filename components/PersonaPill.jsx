"use client";

import React from "react";
import { PERSONAS, usePersona } from "./lib/personaContext";

// PersonaPill — top-right product-chrome persona switcher (Roleplay
// Phase 1, spec Q4(a)). Persistent control across every module surface;
// makes the current persona visible at all times so reviewers see why
// chrome flips between Team Lead and Agent.
//
// Visual: light segmented pill — white surface, divider border, brand-
// blue selected segment with white text. Distinct from the dark
// DarkPillSwitcher used for the demo-only variant pill at the bottom-
// right of Missions; this is product chrome, not a debug affordance.
//
// Position: fixed top: 16 / right: 24, zIndex above PageHeader. Reads +
// writes the PersonaContext so any consumer (`usePersona()`) sees the
// same source of truth.

export default function PersonaPill() {
  const { persona, setPersona } = usePersona();
  return (
    <div
      role="group"
      aria-label="Persona — Team Lead or Agent"
      style={styles.wrap}
    >
      <div style={styles.pill}>
        {PERSONAS.map((p) => {
          const selected = persona === p;
          return (
            <button
              key={p}
              type="button"
              aria-pressed={selected}
              onClick={() => setPersona(p)}
              style={segmentStyle(selected)}
            >
              {p}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function segmentStyle(selected) {
  return {
    ...styles.segment,
    background: selected ? "var(--do-brand-blue)" : "transparent",
    color: selected ? "#FFFFFF" : "var(--color-text-medium)",
  };
}

const styles = {
  wrap: {
    position: "fixed",
    top: 16,
    right: 24,
    zIndex: 50,
    fontFamily: "var(--font-sans)",
  },
  pill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 0,
    padding: 4,
    background: "#FFFFFF",
    border: "1px solid var(--color-border-card-soft)",
    borderRadius: 999,
    boxShadow: "0 4px 16px rgba(27, 27, 31, 0.08)",
  },
  segment: {
    appearance: "none",
    border: "none",
    minWidth: 84,
    height: 28,
    padding: "0 14px",
    borderRadius: 999,
    fontFamily: "inherit",
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: "0.1px",
    cursor: "pointer",
    transition: "background 120ms ease, color 120ms ease",
  },
};
