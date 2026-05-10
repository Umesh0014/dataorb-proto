"use client";

import React from "react";
import Button from "./Button";

const FILTER_ITEMS = [
  "Agent", "Channel", "Direction", "Agent Skill", "Service",
  "Subservice", "Service Provider Location", "Last Agent Group",
  "Product Type", "Campaign", "Customer Seniority",
  "Customer Journey Stage", "Business Category", "Business Aspect",
  "Customer Intent", "Issue Type", "Inquiry Type",
];

// FilterPanel — inner content only. Width/height/positioning come from
// PageLayout (dock vs overlay mode). Component renders nothing if !open
// so PageLayout's panel slot stays empty.
export default function FilterPanel({ open, onClose }) {
  const [search, setSearch] = React.useState("");
  if (!open) return null;

  const filtered = FILTER_ITEMS.filter((f) =>
    f.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={fpStyles.panel}>
      <div style={fpStyles.header}>
        <span style={fpStyles.title}>Filters</span>
        <Button variant="icon" aria-label="Close filters" onClick={onClose}>
          <span className="material-symbols-outlined" style={{ fontSize: 22, color: "#5A5D72" }}>close</span>
        </Button>
      </div>

      <div style={fpStyles.searchWrap}>
        <span className="material-symbols-outlined" style={fpStyles.searchIcon}>search</span>
        <input
          type="text"
          placeholder="Search by filter name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={fpStyles.searchInput}
        />
      </div>

      <div style={fpStyles.list}>
        {filtered.map((name) => (
          <FilterRow key={name} label={name} />
        ))}
      </div>

      <div style={fpStyles.footer}>
        <Button variant="text" uppercase={false}>Deselect all</Button>
        <div style={{ flex: 1 }}></div>
        <Button variant="text" uppercase={false} onClick={onClose}>Cancel</Button>
        <Button variant="text" uppercase={false} style={{ color: "var(--color-button-primary-bg)", fontWeight: 600 }}>
          Apply
        </Button>
      </div>
    </div>
  );
}

function FilterRow({ label }) {
  const [expanded, setExpanded] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);

  return (
    <div>
      <div
        style={{
          ...fpStyles.filterRow,
          background: hovered ? "rgba(0,0,0,0.02)" : "transparent",
        }}
        onClick={() => setExpanded(!expanded)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <span style={fpStyles.filterLabel}>{label}</span>
        <span className="material-symbols-outlined" style={{
          ...fpStyles.chevron,
          transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
        }}>
          expand_more
        </span>
      </div>
      {expanded && (
        <div style={fpStyles.filterContent}>
          <div style={fpStyles.filterPlaceholder}>
            <span style={{ fontFamily: '"Mulish", sans-serif', fontSize: 12, color: "rgba(0,0,0,0.38)" }}>
              No options selected
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

const fpStyles = {
  panel: {
    background: "#FFFFFF",
    display: "flex", flexDirection: "column",
    fontFamily: '"Mulish", sans-serif',
    flex: 1,
    minHeight: 0,
  },
  header: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "24px 24px 16px", flexShrink: 0,
  },
  title: { fontSize: 20, fontWeight: 700, color: "#1F232A" },
  searchWrap: {
    display: "flex", alignItems: "center", gap: 10,
    margin: "0 24px 8px", padding: "10px 14px", borderRadius: 8,
    border: "1px solid #E8ECFF", background: "#FAFAFA",
  },
  searchIcon: {
    fontSize: 18, color: "#AAB2C5",
    fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
  },
  searchInput: {
    flex: 1, border: "none", background: "transparent",
    fontFamily: '"Mulish", sans-serif', fontSize: 14, color: "#1F232A",
    outline: "none",
  },
  list: { flex: 1, overflowY: "auto", padding: "0 0" },
  filterRow: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "14px 24px", cursor: "pointer", transition: "background 100ms",
    borderBottom: "1px solid #F0F2FA",
  },
  filterLabel: { fontSize: 14, fontWeight: 500, color: "#1F232A", lineHeight: 1.4 },
  chevron: {
    fontSize: 20, color: "#AAB2C5", transition: "transform 200ms",
    fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
  },
  filterContent: { padding: "8px 24px 16px", borderBottom: "1px solid #F0F2FA" },
  filterPlaceholder: {
    padding: "12px 16px", background: "#F5F6FA",
    borderRadius: 8, textAlign: "center",
  },
  footer: {
    display: "flex", alignItems: "center", gap: 16,
    padding: "16px 24px", borderTop: "1px solid #E8ECFF", flexShrink: 0,
  },
};
