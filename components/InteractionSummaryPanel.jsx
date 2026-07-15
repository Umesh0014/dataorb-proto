"use client";

import React from "react";
import { X, ChevronDown, Rows3, CircleDollarSign, Award, ListChecks, Activity, UserRound, Target } from "lucide-react";
import Button from "./Button";

// InteractionSummaryPanel — "06 · Interaction picker — summary (sales)"
// right panel. Swaps in for InteractionFilterPanel once ≥1 interaction is
// selected (see app/[[...slug]]/page.jsx's showInteractionSummary) — a
// static list of insight categories to review before generating. The
// source frame shows the same seven labels regardless of which rows are
// selected (no per-row data backs these), so this stays display-only, same
// as InteractionFilterPanel's inert facet rows. Icons are close lucide
// equivalents for Figma's Material Symbols (dynamic_feed, paid,
// workspace_premium, ballot, run_circle, person_4, my_location) — same
// "closest available icon" convention as CreateWorkflowMenu.
const SECTIONS = [
  { label: "Contact Reason Overview", Icon: Rows3 },
  { label: "Commercial Offer Insights", Icon: CircleDollarSign },
  { label: "Competitor context", Icon: Award },
  { label: "Interaction Outcome Insights", Icon: ListChecks },
  { label: "Churn-risk Insights", Icon: Activity },
  { label: "Customer Sentiment", Icon: UserRound },
  { label: "CSAT", Icon: Target },
];

export default function InteractionSummaryPanel({ onClose }) {
  return (
    <div style={isStyles.panel}>
      <div style={isStyles.header}>
        <span style={isStyles.heading}>Interaction summary</span>
        <Button variant="icon" size="sm" aria-label="Close interaction summary" onClick={onClose}>
          <X size={20} color="var(--color-text-medium)" />
        </Button>
      </div>
      <div style={isStyles.body}>
        {SECTIONS.map(({ label, Icon }, i) => (
          <SummaryRow key={label} label={label} Icon={Icon} bordered={i < SECTIONS.length - 1} />
        ))}
      </div>
    </div>
  );
}

function SummaryRow({ label, Icon, bordered }) {
  return (
    <Button
      variant="text"
      uppercase={false}
      aria-expanded="false"
      trailingIcon={<ChevronDown size={16} color="var(--color-text-tertiary)" />}
      style={{ ...isStyles.row, borderBottom: bordered ? isStyles.row.borderBottom : "none" }}
    >
      <span style={isStyles.rowContent}>
        <Icon size={16} color="var(--color-text-medium)" />
        <span style={isStyles.rowLabel}>{label}</span>
      </span>
    </Button>
  );
}

const isStyles = {
  panel: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    background: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    height: 56,
    paddingInline: 20,
    flexShrink: 0,
  },
  heading: {
    flex: 1,
    fontFamily: "var(--font-sans)",
    fontSize: 16,
    fontWeight: 600,
    color: "var(--color-text-deep)",
  },
  body: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
    overflowY: "auto",
    paddingBlock: 4,
  },
  row: {
    width: "100%",
    justifyContent: "space-between",
    height: "auto",
    gap: 24,
    padding: "16px 12px",
    borderRadius: 0,
    borderBottom: "1px solid var(--color-border-card-soft)",
  },
  rowContent: { display: "flex", alignItems: "center", gap: 8, minWidth: 0 },
  rowLabel: {
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    color: "var(--color-text-medium)",
  },
};
