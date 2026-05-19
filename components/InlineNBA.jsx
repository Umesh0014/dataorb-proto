"use client";

import React from "react";
import { Lightbulb, ArrowRight } from "lucide-react";
import Button from "./Button";

// InlineNBA — Tier 2 "next best action" banner shown inside a section card,
// below the header/subtitle and above the section's content. A low-emphasis
// neutral strip (no status colour) reused by the Coaching Recommendations,
// Roleplay Coverage, and Quality Adherence cards.
// TODO: no neutral low-emphasis banner/callout exists in the codebase —
// Banner.jsx is status-toned (info / success / warning / danger). This is a
// minimal neutral strip; confirm the pattern with the design system.
export default function InlineNBA({ text, ctaLabel, onAction }) {
  return (
    <div style={inStyles.wrap}>
      <Lightbulb size={15} style={inStyles.icon} />
      <span style={inStyles.label}>Next best action</span>
      <span style={inStyles.text}>{text}</span>
      <Button
        variant="text"
        uppercase={false}
        trailingIcon={<ArrowRight size={14} />}
        onClick={onAction}
        style={inStyles.cta}
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
    marginTop: 12,
    padding: "6px 14px",
    background: "var(--surface-alt)",
    borderRadius: "var(--radius-md)",
  },
  icon: {
    color: "var(--color-text-tertiary)",
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
  cta: {
    color: "var(--color-button-primary-bg)",
    flexShrink: 0,
  },
};
