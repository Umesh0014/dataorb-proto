"use client";

import React from "react";
import Card from "./Card";
import Button from "./Button";

const DATE_OPTIONS = [
  { label: "Today", type: "radio" },
  { label: "Last 7 days", type: "radio" },
  { label: "Last 30 days", type: "radio" },
  { label: "Last 90 days", type: "radio" },
  { label: "Last 12 months", type: "radio" },
  { label: "Custom Date Range", type: "submenu" },
  { label: "Compare Periods", type: "special", icon: "compare_arrows" },
];

export default function HeaderCard({ onFilterToggle }) {
  const [dateValue, setDateValue] = React.useState("Last 12 months");
  const [dateOpen, setDateOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);

  React.useEffect(() => {
    if (!dateOpen) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDateOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dateOpen]);

  const handleSelect = (label) => { setDateValue(label); setDateOpen(false); };

  return (
    <Card>
      <div style={hcStyles.titleRow}>
        <div style={hcStyles.titleLeft}>
          <div style={hcStyles.avatar}>
            <span className="material-symbols-outlined" style={hcStyles.avatarIcon}>shield_person</span>
          </div>
          <span style={hcStyles.titleText}>Contact Center</span>
          <span className="material-symbols-outlined" style={hcStyles.chevronTitle}>expand_more</span>
        </div>
      </div>

      <div style={hcStyles.filterRow}>
        <div style={hcStyles.filterGroups}>
          <div style={{ position: "relative" }} ref={dropdownRef}>
            <div style={hcStyles.filterGroup} onClick={() => setDateOpen(!dateOpen)}>
              <span style={hcStyles.filterLabel}>Date</span>
              <span style={hcStyles.filterValue}>{dateValue}</span>
              <span className="material-symbols-outlined" style={hcStyles.chevronFilter}>expand_more</span>
            </div>

            {dateOpen && (
              <DateDropdown options={DATE_OPTIONS} selected={dateValue} onSelect={handleSelect} />
            )}
          </div>

          <FilterGroup label="Workspaces" value="All" />
          <FilterGroup label="Teams" value="All" />
        </div>

        <div style={hcStyles.filterRight}>
          <div style={hcStyles.divider}></div>
          <Button
            variant="icon"
            size="lg"
            bordered
            aria-label="Toggle filters"
            onClick={onFilterToggle}
          >
            <span className="material-symbols-outlined" style={hcStyles.filterIcon}>tune</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}

function DateDropdown({ options, selected, onSelect }) {
  const [hoveredIdx, setHoveredIdx] = React.useState(-1);
  return (
    <div style={ddStyles.container}>
      <div style={ddStyles.list}>
        {options.map((opt, i) => {
          const isSelected = selected === opt.label;
          const isHovered = hoveredIdx === i;
          return (
            <div
              key={opt.label}
              style={{ ...ddStyles.row, background: isHovered ? "#F6F5FA" : "transparent" }}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(-1)}
              onClick={() => { if (opt.type === "radio") onSelect(opt.label); }}
            >
              {opt.type === "special" ? (
                <span className="material-symbols-outlined" style={ddStyles.specialIcon}>{opt.icon}</span>
              ) : (
                <div style={{
                  ...ddStyles.radio,
                  borderColor: isSelected ? "#245BFF" : "#8C90A6",
                  background: isSelected ? "#245BFF" : "transparent",
                }}>
                  {isSelected && <div style={ddStyles.radioDot}></div>}
                </div>
              )}

              <span style={{
                ...ddStyles.label,
                fontWeight: isSelected ? 600 : 400,
                color: "#1F232A",
              }}>
                {opt.label}
              </span>

              {(opt.type === "submenu" || opt.type === "special") && (
                <span className="material-symbols-outlined" style={ddStyles.chevronRight}>chevron_right</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FilterGroup({ label, value }) {
  return (
    <div style={hcStyles.filterGroup}>
      <span style={hcStyles.filterLabel}>{label}</span>
      <span style={hcStyles.filterValue}>{value}</span>
      <span className="material-symbols-outlined" style={hcStyles.chevronFilter}>expand_more</span>
    </div>
  );
}

const ddStyles = {
  container: {
    position: "absolute", top: "calc(100% + 8px)", left: 0, width: 320,
    background: "#FFFFFF", borderRadius: 12,
    boxShadow: "0px 5px 5px -3px rgba(0,0,0,0.20), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)",
    zIndex: 50, overflow: "hidden",
  },
  list: { padding: "4px 0" },
  row: {
    display: "flex", alignItems: "center", gap: 16,
    padding: "14px 20px", cursor: "pointer", transition: "background 150ms",
  },
  radio: {
    width: 20, height: 20, borderRadius: 10, border: "2px solid #8C90A6",
    display: "grid", placeItems: "center", flexShrink: 0, boxSizing: "border-box",
  },
  radioDot: { width: 8, height: 8, borderRadius: 4, background: "#FFFFFF" },
  specialIcon: {
    fontSize: 20, color: "#1F232A",
    fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24",
  },
  label: {
    fontFamily: '"Mulish", sans-serif', fontSize: 15, color: "#1F232A",
    flex: 1, lineHeight: 1.4,
  },
  chevronRight: {
    fontSize: 20, color: "#8C90A6",
    fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
  },
};

const hcStyles = {
  titleRow: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  titleLeft: { display: "flex", alignItems: "center", gap: 0 },
  avatar: {
    width: 32, height: 32, borderRadius: 16, background: "#E8ECFF",
    display: "grid", placeItems: "center", flexShrink: 0, marginRight: 12,
  },
  avatarIcon: {
    fontSize: 18, color: "#245BFF",
    fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
  },
  titleText: {
    fontFamily: '"Mulish", sans-serif', fontSize: 16, fontWeight: 600,
    color: "#1F232A", lineHeight: 1.4, marginRight: 6,
  },
  chevronTitle: {
    fontSize: 18, color: "#8C90A6",
    fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20",
  },
  filterRow: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  filterGroups: { display: "flex", alignItems: "center", gap: 32 },
  filterGroup: { display: "flex", alignItems: "center", gap: 6, cursor: "pointer" },
  filterLabel: {
    fontFamily: '"Mulish", sans-serif', fontSize: 13, fontWeight: 400,
    color: "#8C90A6", lineHeight: 1.4,
  },
  filterValue: {
    fontFamily: '"Mulish", sans-serif', fontSize: 13, fontWeight: 600,
    color: "#1F232A", lineHeight: 1.4,
  },
  chevronFilter: {
    fontSize: 14, color: "#AAB2C5",
    fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20",
  },
  filterRight: { display: "flex", alignItems: "center", gap: 16 },
  divider: { width: 1, height: 24, background: "#E8ECFF" },
  filterIcon: {
    fontSize: 20, color: "#5A5D72",
    fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
  },
};
