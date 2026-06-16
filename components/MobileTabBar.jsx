"use client";

import React from "react";
import { MOBILE_TABS } from "./mocks/mobileLearning";

// MobileTabBar — the bottom navigation shared by all three mobile
// variants. Real <button>s in a <nav role="navigation">, the active tab
// carries aria-current="page", icons are decorative (label carries the
// meaning, never colour alone), and every target clears 44px. Focus rings
// reuse the app's `.cc-focusable` token (white halo + brand-blue ring).

export default function MobileTabBar({ active, onSelect }) {
  return (
    <nav style={styles.bar} aria-label="Mobile Learning Hub">
      {MOBILE_TABS.map((tab) => {
        const on = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            className="cc-focusable"
            aria-current={on ? "page" : undefined}
            onClick={() => onSelect?.(tab.id)}
            style={styles.tab}
          >
            <span
              className="material-symbols-outlined"
              style={{ ...styles.glyph, color: on ? "var(--color-button-primary-bg)" : "var(--color-text-tertiary)" }}
              aria-hidden="true"
            >
              {tab.glyph}
            </span>
            <span style={{ ...styles.label, color: on ? "var(--color-button-primary-bg)" : "var(--color-text-tertiary)", fontWeight: on ? 700 : 500 }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

const styles = {
  bar: {
    flexShrink: 0,
    display: "flex",
    alignItems: "stretch",
    justifyContent: "space-around",
    gap: 4,
    paddingInline: 8,
    paddingTop: 8,
    background: "var(--surface-white)",
    borderTop: "1px solid var(--color-divider-card)",
  },
  tab: {
    appearance: "none",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    flex: 1,
    minHeight: 48,
    display: "inline-flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    borderRadius: 12,
    fontFamily: "var(--font-sans)",
  },
  glyph: { fontSize: 22 },
  label: { fontSize: 11, letterSpacing: "0.2px" },
};
