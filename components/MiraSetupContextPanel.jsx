"use client";

import React from "react";
import Button from "./Button";
import { SETUP_CONTEXT_FILTERS } from "./mocks/miraConversation";

// MiraSetupContextPanel — inner content for the Ask Mira Pro Setup Context
// right panel. Same shell pattern as <FilterPanel>: PageLayout owns the
// width/positioning (dock vs overlay); this component owns header / search /
// accordion list. Renders nothing if !open so PageLayout's panel slot stays
// empty (matches FilterPanel contract).
export default function MiraSetupContextPanel({ open, onClose }) {
  const [search, setSearch] = React.useState("");
  if (!open) return null;

  const filtered = SETUP_CONTEXT_FILTERS.filter((f) =>
    f.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={s.panel}>
      <div style={s.header}>
        <span style={s.title}>Context</span>
        <Button variant="icon" aria-label="Close context" onClick={onClose}>
          <span className="material-symbols-outlined" style={{ fontSize: 22, color: "#5A5D72" }}>close</span>
        </Button>
      </div>

      <div style={s.searchWrap}>
        <span className="material-symbols-outlined" style={s.searchIcon}>search</span>
        <input
          type="text"
          placeholder="Search by filter name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={s.searchInput}
        />
      </div>

      <div style={s.list}>
        {filtered.map((f) => (
          <FilterRow key={f.id} label={f.label} value={f.value} />
        ))}
      </div>
    </div>
  );
}

function FilterRow({ label, value }) {
  const [expanded, setExpanded] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);

  return (
    <div>
      <div
        style={{
          ...s.filterRow,
          background: hovered ? "rgba(0,0,0,0.02)" : "transparent",
        }}
        onClick={() => setExpanded(!expanded)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <span style={s.filterLabel}>{label}</span>
        <div style={s.filterRight}>
          {value && <span style={s.filterValue}>{value}</span>}
          <span className="material-symbols-outlined" style={{
            ...s.chevron,
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
          }}>
            expand_more
          </span>
        </div>
      </div>
      {expanded && (
        <div style={s.filterContent}>
          <div style={s.filterPlaceholder}>
            <span style={{ fontFamily: '"Mulish", sans-serif', fontSize: 12, color: "rgba(0,0,0,0.38)" }}>
              {value ? value : "No options selected"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
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
  list: { flex: 1, overflowY: "auto" },
  filterRow: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "14px 24px", cursor: "pointer", transition: "background 100ms",
    borderBottom: "1px solid #F0F2FA",
  },
  filterLabel: { fontSize: 14, fontWeight: 500, color: "#1F232A", lineHeight: 1.4 },
  filterRight: { display: "flex", alignItems: "center", gap: 8 },
  filterValue: { fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)" },
  chevron: {
    fontSize: 20, color: "#AAB2C5", transition: "transform 200ms",
    fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
  },
  filterContent: { padding: "8px 24px 16px", borderBottom: "1px solid #F0F2FA" },
  filterPlaceholder: {
    padding: "12px 16px", background: "#F5F6FA",
    borderRadius: 8, textAlign: "center",
  },
};
