"use client";

import React from "react";
import { Search, ChevronDown, X } from "lucide-react";
import Button from "./Button";

// InteractionFilterPanel — the faceted filter panel from "05 · Interaction
// picker — filters (sales)". Same shape as WorkflowFilterPanel (header +
// search + facet rows + footer) but a different row set, so it's a sibling
// file rather than a shared primitive — 2nd callsite of this composition,
// promote at the 3rd (rule of three). Facet rows are display-only
// accordions in the source frame; Deselect all / Apply render disabled.
const ROWS = ["Date", "Outcome achieved", "CSAT", "Quality", "Sentiment", "Duration", "Agent"];

export default function InteractionFilterPanel({ onClose }) {
  const [search, setSearch] = React.useState("");

  return (
    <div style={ifStyles.panel}>
      <div style={ifStyles.header}>
        <span style={ifStyles.heading}>Filters</span>
        <Button variant="icon" size="sm" aria-label="Close filters" onClick={onClose}>
          <X size={20} color="var(--color-text-medium)" />
        </Button>
      </div>

      <div style={ifStyles.searchRow}>
        <Search size={16} color="var(--color-text-placeholder)" style={{ flexShrink: 0 }} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by filter name"
          aria-label="Search by filter name"
          style={ifStyles.searchInput}
        />
      </div>

      <div style={ifStyles.body}>
        {ROWS.map((label, i) => <FacetRow key={label} label={label} bordered={i < ROWS.length - 1} />)}
      </div>

      <div style={ifStyles.footer}>
        <Button variant="text" uppercase={false} disabled style={ifStyles.footerBtnDisabled}>
          Deselect all
        </Button>
        <div style={ifStyles.footerRight}>
          <Button variant="text" uppercase={false} onClick={onClose} style={ifStyles.footerBtn}>
            Cancel
          </Button>
          <Button variant="text" uppercase={false} disabled style={ifStyles.footerBtnDisabled}>
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}

function FacetRow({ label, bordered }) {
  return (
    <Button
      variant="text"
      uppercase={false}
      aria-expanded="false"
      trailingIcon={<ChevronDown size={16} color="var(--color-text-tertiary)" />}
      style={{ ...ifStyles.facetRow, borderBottom: bordered ? ifStyles.facetRow.borderBottom : "none" }}
    >
      <span style={ifStyles.facetLabel}>{label}</span>
    </Button>
  );
}

const ifStyles = {
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
  body: { flex: 1, display: "flex", flexDirection: "column", minHeight: 0, overflowY: "auto" },
  facetRow: {
    width: "100%",
    justifyContent: "space-between",
    height: "auto",
    gap: 16,
    padding: "16px 20px",
    borderRadius: 0,
    borderBottom: "1px solid var(--color-border-card-soft)",
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
