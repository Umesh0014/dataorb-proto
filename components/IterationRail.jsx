/* eslint-disable no-restricted-syntax --
   IterationRail is meta-tooling (a demo iteration switcher), not product
   chrome. Raw <button> is intentional, same precedent as VersionBar. */
"use client";

import React from "react";

// IterationRail — a vertical floating segmented control for the current
// version's iterations (the credit-usage demo's C6 a/b, the bulk study's
// i1/i2/i3). It mirrors the bottom VersionBar's dark pill styling; the version
// selection itself stays in that bottom bar. Hidden when the active version
// has no iterations. Demo meta-tooling, not product chrome — raw <button> is
// intentional, same precedent as VersionBar.
export default function IterationRail({ iterations, value, onChange }) {
  if (!iterations || iterations.length === 0) return null;
  const active = iterations.includes(value) ? value : iterations[0];
  return (
    <div style={hostStyles} aria-label="Iterations">
      <div style={styles.bar} role="radiogroup" aria-label="Iteration">
        {iterations.map((it) => {
          const on = it === active;
          return (
            <button
              key={it}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange(it)}
              style={{
                ...styles.item,
                background: on ? "var(--vb-accent)" : "var(--vb-pill)",
                color: on ? "var(--vb-accent-ink)" : "var(--vb-txt)",
                fontWeight: on ? 700 : 500,
              }}
            >
              {it}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Scopes the dark version-bar tokens locally so the rail reads correctly over
// the light page, matching the bottom VersionBar.
const hostStyles = {
  "--vb-bar": "#27272C",
  "--vb-pill": "#3A3A40",
  "--vb-txt": "#F2F2F4",
  "--vb-accent": "#F4D63E",
  "--vb-accent-ink": "#2A2400",
  "--vb-hairline": "rgba(255,255,255,0.07)",
  "--vb-mono": '"JetBrains Mono", ui-monospace, "SFMono-Regular", Menlo, monospace',
  position: "fixed",
  right: 28,
  top: "50%",
  transform: "translateY(-50%)",
  zIndex: 60,
};

const styles = {
  bar: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    padding: 8,
    background: "var(--vb-bar)",
    border: "1px solid var(--vb-hairline)",
    borderRadius: 18,
    boxShadow: "0 16px 40px -16px rgba(0,0,0,0.7)",
  },
  item: {
    width: 38,
    height: 38,
    borderRadius: 12,
    border: "none",
    cursor: "pointer",
    fontFamily: "var(--vb-mono)",
    fontSize: 13,
    letterSpacing: "0.02em",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 150ms ease, color 150ms ease",
  },
};
