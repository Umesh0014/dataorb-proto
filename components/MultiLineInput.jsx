"use client";

import React from "react";

// MultiLineInput — shared multi-line textarea with character counter.
// Used by both wizard steps and any other form needing capped textarea.
export default function MultiLineInput({
  value,
  onChange,
  max,
  placeholder,
  rows = 4,
}) {
  const handle = (e) => {
    const next = e.target.value;
    if (next.length <= max) onChange(next);
  };
  return (
    <div style={mlStyles.wrap}>
      <textarea
        value={value}
        onChange={handle}
        placeholder={placeholder}
        maxLength={max}
        rows={rows}
        style={mlStyles.textarea}
      />
      <span style={mlStyles.counter}>{value.length}/{max}</span>
    </div>
  );
}

const mlStyles = {
  wrap: { position: "relative" },
  textarea: {
    width: "100%",
    minHeight: 96,
    padding: "12px 80px 12px 16px",
    borderRadius: 8,
    border: "1px solid var(--color-divider-card)",
    background: "var(--surface-white)",
    fontFamily: '"Mulish", sans-serif',
    fontSize: 14,
    color: "var(--color-text-deep)",
    outline: "none",
    boxSizing: "border-box",
    resize: "vertical",
    lineHeight: 1.5,
  },
  counter: {
    position: "absolute",
    top: 12,
    right: 16,
    fontFamily: '"Mulish", sans-serif',
    fontSize: 12,
    color: "var(--color-text-tertiary)",
  },
};
