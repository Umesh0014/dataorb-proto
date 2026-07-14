"use client";

import React from "react";
import { Search, ChevronDown, X } from "lucide-react";
import Button from "./Button";

// WorkflowFilterPanel — the faceted filter panel from "03 · Driver detail —
// workflows table". Passed as <PageLayout rightPanel> by the host route;
// PageLayout owns width (320 vs Figma's 310 — layout system wins) and
// dock-vs-overlay behaviour. Facet rows are display-only accordions in the
// source frame (no expanded state drawn) — clicking is wired but inert.
// Deselect all / Apply render disabled, matching the frame.
export default function WorkflowFilterPanel({ onClose }) {
  const [search, setSearch] = React.useState("");

  return (
    <div style={wfStyles.panel}>
      <div style={wfStyles.header}>
        <span style={wfStyles.heading}>Filters</span>
        <Button variant="icon" size="sm" aria-label="Close filters" onClick={onClose}>
          <X size={20} color="var(--color-text-medium)" />
        </Button>
      </div>

      <div style={wfStyles.searchRow}>
        <Search size={16} color="var(--color-text-placeholder)" style={{ flexShrink: 0 }} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by filter name"
          aria-label="Search by filter name"
          style={wfStyles.searchInput}
        />
      </div>

      <div style={wfStyles.body}>
        <FacetRow label="Status" bordered />
        <FacetRow label="Roleplay category" />
      </div>

      <div style={wfStyles.footer}>
        <Button
          variant="text"
          uppercase={false}
          disabled
          style={wfStyles.footerBtnDisabled}
        >
          Deselect all
        </Button>
        <div style={wfStyles.footerRight}>
          <Button variant="text" uppercase={false} onClick={onClose} style={wfStyles.footerBtn}>
            Cancel
          </Button>
          <Button variant="text" uppercase={false} disabled style={wfStyles.footerBtnDisabled}>
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}

function FacetRow({ label, bordered = false }) {
  return (
    <button
      type="button"
      aria-expanded="false"
      style={{
        ...wfStyles.facetRow,
        borderBottom: bordered ? "1px solid var(--color-border-card-soft)" : "none",
      }}
    >
      <span style={wfStyles.facetLabel}>{label}</span>
      <ChevronDown size={16} color="var(--color-text-tertiary)" />
    </button>
  );
}

const wfStyles = {
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
  searchRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    height: 54,
    paddingInline: 20,
    borderTop: "1px solid var(--color-border-card-soft)",
    borderBottom: "1px solid var(--color-border-card-soft)",
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    color: "var(--color-text-medium)",
    minWidth: 0,
  },
  body: { flex: 1, display: "flex", flexDirection: "column", minHeight: 0 },
  // FacetRow renders a real <button>; exempt from the Button-primitive rule
  // the same way GuidedWorkflowLibrary's rowBtn is — it's a full-width row
  // affordance, not a button-shaped control.
  facetRow: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "16px 20px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    textAlign: "start",
    width: "100%",
  },
  facetLabel: {
    flex: 1,
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    fontWeight: 500,
    color: "var(--color-text-row)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 8px",
    flexShrink: 0,
  },
  footerRight: { display: "flex", alignItems: "center", gap: 12 },
  footerBtn: { fontWeight: 700, fontSize: 14, color: "var(--grey-900)", paddingInline: 12 },
  footerBtnDisabled: { fontWeight: 700, fontSize: 14, color: "var(--grey-900)", opacity: 0.38, paddingInline: 12 },
};
