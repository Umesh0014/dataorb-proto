"use client";

import React from "react";
import { Lightbulb, ArrowRight } from "lucide-react";
import Button from "./Button";

// InlineNBA — Tier 2 inline "next best action" prompt for a section header
// row. One line: lightbulb + muted label + recommendation sentence + a
// text-link CTA. Reused by the Coaching Recommendations, Roleplay Coverage,
// and Quality Adherence section headers. `style` lets the consumer flex it
// inside a header row so the sentence ellipsizes rather than wrapping.
export default function InlineNBA({ text, ctaLabel, onAction, style }) {
  return (
    <div style={{ ...inStyles.wrap, ...style }}>
      <Lightbulb size={15} style={inStyles.icon} />
      <span style={inStyles.label}>Next best action</span>
      <span style={inStyles.text}>{text}</span>
      <Button
        variant="text"
        uppercase={false}
        trailingIcon={<ArrowRight size={14} />}
        onClick={onAction}
      >
        {ctaLabel}
      </Button>
    </div>
  );
}

const inStyles = {
  wrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    minWidth: 0,
  },
  icon: {
    color: "var(--color-warning)",
    flexShrink: 0,
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: "var(--color-text-tertiary)",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
  text: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    fontWeight: 400,
    color: "var(--text-secondary)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
};
