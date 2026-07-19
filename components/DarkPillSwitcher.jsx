"use client";

import React from "react";

// DarkPillSwitcher — demo-only horizontal dark switcher matching the
// MilestoneSideRail M0/M1/M2 button family (Part F). Supports two modes:
// single-select (value is a string) and multi-select (value is an array).
// In multi-select mode, clicking toggles that option on/off; at least one
// must remain selected.

export default function DarkPillSwitcher({
  value,
  options,
  onChange,
  ariaLabel,
  multiSelect = false,
}) {
  const [hovered, setHovered] = React.useState(null);

  const isSelected = (opt) => {
    if (multiSelect) return Array.isArray(value) && value.includes(opt);
    return value === opt;
  };

  const handleClick = (opt) => {
    if (!multiSelect) {
      onChange?.(opt);
      return;
    }
    const current = Array.isArray(value) ? value : [value];
    if (current.includes(opt)) {
      if (current.length <= 1) return;
      onChange?.(current.filter((v) => v !== opt));
    } else {
      onChange?.([...current, opt]);
    }
  };

  return (
    <div style={styles.pill} role="group" aria-label={ariaLabel}>
      {options.map((opt) => {
        const selected = isSelected(opt);
        const isHover = hovered === opt;
        return (
          <button
            key={opt}
            type="button"
            aria-pressed={selected}
            onClick={() => handleClick(opt)}
            onMouseEnter={() => setHovered(opt)}
            onMouseLeave={() => setHovered((h) => (h === opt ? null : h))}
            style={segmentStyle(selected, isHover)}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function segmentStyle(active, isHover) {
  if (active) {
    return { ...styles.segment, background: "#FDE047", color: "#171717", border: "1px solid #FDE047" };
  }
  if (isHover) {
    return { ...styles.segment, background: "#404040", color: "#F5F5F5", border: "1px solid #525252" };
  }
  return { ...styles.segment, background: "transparent", color: "#D4D4D4", border: "1px solid transparent" };
}

const styles = {
  pill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: 4,
    background: "#171717",
    border: "1px solid #404040",
    borderRadius: 8,
    boxShadow: "0 12px 32px rgba(0, 0, 0, 0.4)",
    fontFamily: "var(--font-sans)",
  },
  segment: {
    appearance: "none",
    minWidth: 64,
    height: 30,
    padding: "0 14px",
    borderRadius: 6,
    fontFamily: "var(--font-mono)",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.04em",
    cursor: "pointer",
    transition: "background 120ms ease, color 120ms ease, border-color 120ms ease",
  },
};
