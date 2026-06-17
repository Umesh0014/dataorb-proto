"use client";

import React from "react";
import { ChevronDown } from "lucide-react";

// Select — the app's styled dropdown. A native <select> (keyboard + a11y
// intact) with the platform chevron hidden and a consistent box + lucide
// chevron drawn instead, matching the search inputs and filter controls.
// Used across the Credit & Usage surface for filters, page size, bucket
// moves, and rule scopes. There is no shared Dropdown menu primitive yet;
// this keeps every select visually consistent without bespoke popovers.
//
//   options   [{ value, label }]
//   size      "sm" 32 / "md" 36 (default)
//   placeholder  optional leading empty option
export default function Select({
  value,
  onChange,
  options,
  ariaLabel,
  size = "md",
  placeholder,
  fullWidth = false,
  style,
}) {
  const compact = size === "sm";
  return (
    <span style={{ ...styles.wrap, width: fullWidth ? "100%" : undefined, ...style }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
        style={{ ...styles.select, height: compact ? 32 : 36, fontSize: compact ? 12 : 13 }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown size={15} color="var(--color-text-tertiary)" style={styles.chevron} aria-hidden="true" />
    </span>
  );
}

const styles = {
  wrap: { position: "relative", display: "inline-flex", alignItems: "center" },
  select: {
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    width: "100%",
    padding: "0 32px 0 12px",
    borderRadius: 8,
    border: "1px solid var(--color-border-card-soft)",
    background: "#FFFFFF",
    fontFamily: "inherit",
    fontWeight: 600,
    color: "var(--color-text-deep)",
    cursor: "pointer",
    outline: "none",
  },
  chevron: { position: "absolute", right: 10, pointerEvents: "none" },
};
