"use client";

import React from "react";
import { ArrowLeft, ExternalLink, ChevronDown } from "lucide-react";
import Card from "./Card";
import Button from "./Button";

// Date-range options for the filter row.
// TODO: confirm the full date-range option list and labels with Akash.
const DATE_RANGE_OPTIONS = [
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "last_30_days", label: "Last 30 Days" },
  { value: "last_90_days", label: "Last 90 Days" },
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "custom", label: "Custom Range" },
];

// initialsOf — first letter of the first two name parts, uppercased.
function initialsOf(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

// AgentHeader — header for the Agent Profile page (and any future Agent
// Detail page). Rendered via <PageHeader agentHeader={...}>. Row 1: back +
// avatar + "name · context" + optional secondary link. Row 2: date-range
// dropdown + filter icon. Avatar styling mirrors the AgentsPage row avatar.
// TODO: no Agent Detail page exists yet — reuse AgentHeader for it when
// built (its own contextLabel; secondaryLink optional).
export default function AgentHeader({
  agentName,
  contextLabel,
  secondaryLink,
  dateRange,
  onDateRangeChange,
  onBack,
}) {
  return (
    <Card padX={0} padY={0} style={ahStyles.outer}>
      <div style={ahStyles.row1}>
        <div style={ahStyles.identity}>
          {/* TODO: no URL router in this app — onBack (supplied by the page)
              clears the profile view. Confirm router.back() vs a route. */}
          <Button variant="icon" aria-label="Back" onClick={onBack}>
            <ArrowLeft size={20} />
          </Button>
          <span style={ahStyles.avatar} aria-hidden="true">
            {initialsOf(agentName)}
          </span>
          <span style={ahStyles.name}>{agentName}</span>
          <span style={ahStyles.dot} aria-hidden="true">
            ·
          </span>
          <span style={ahStyles.context}>{contextLabel}</span>
        </div>
        {secondaryLink && (
          <a
            href={secondaryLink.href}
            style={ahStyles.link}
            onClick={(e) => {
              e.preventDefault();
              // TODO: route to the Production Profile view — confirm path with Akash
            }}
          >
            {secondaryLink.label}
            {secondaryLink.external && <ExternalLink size={14} />}
          </a>
        )}
      </div>

      <div style={ahStyles.rowDivider} aria-hidden="true" />

      <div style={ahStyles.row2}>
        <DateRangeDropdown value={dateRange} onChange={onDateRangeChange} />
      </div>
    </Card>
  );
}

// DateRangeDropdown — "Date {range}" pill that opens a list of range options.
function DateRangeDropdown({ value, onChange }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const selected =
    DATE_RANGE_OPTIONS.find((o) => o.value === value) || DATE_RANGE_OPTIONS[0];

  return (
    <div ref={ref} style={ahStyles.dateWrap}>
      <button type="button" onClick={() => setOpen((o) => !o)} style={ahStyles.dateBtn}>
        <span style={ahStyles.dateLabel}>Date</span>
        <span style={ahStyles.dateValue}>{selected.label}</span>
        <ChevronDown size={14} style={{ color: "var(--color-text-placeholder)" }} />
      </button>
      {open && (
        <div role="menu" style={ahStyles.dateMenu}>
          {DATE_RANGE_OPTIONS.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="menuitemradio"
                aria-checked={isSelected}
                onClick={() => {
                  onChange?.(opt.value);
                  setOpen(false);
                }}
                style={{
                  ...ahStyles.dateMenuItem,
                  background: isSelected ? "var(--pill-bg)" : "transparent",
                  color: isSelected ? "var(--color-text-tab-active)" : "var(--color-text-medium)",
                  fontWeight: isSelected ? 700 : 500,
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const ahStyles = {
  outer: {
    border: "2px solid #FFFFFF",
  },
  row1: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    height: 80,
    paddingInline: 28,
  },
  identity: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    background: "var(--color-icon-tertiary-bg)",
    color: "var(--color-icon-tertiary-fg)",
    display: "grid",
    placeItems: "center",
    fontSize: 11,
    fontWeight: 700,
    flexShrink: 0,
    textTransform: "uppercase",
    letterSpacing: "0.02em",
  },
  name: {
    fontSize: 16,
    fontWeight: 600,
    color: "var(--do-ink)",
    lineHeight: 1.4,
  },
  dot: {
    fontSize: 14,
    color: "var(--color-text-tertiary)",
  },
  context: {
    fontSize: 16,
    fontWeight: 400,
    color: "var(--color-text-tertiary)",
    lineHeight: 1.4,
  },
  link: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-button-primary-bg)",
    textDecoration: "none",
    cursor: "pointer",
    flexShrink: 0,
  },
  rowDivider: {
    height: 1,
    background: "var(--color-border-tab)",
  },
  row2: {
    display: "flex",
    alignItems: "center",
    height: 56,
    paddingInline: 28,
  },
  dateWrap: {
    position: "relative",
  },
  dateBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    height: 32,
    paddingInline: 12,
    borderRadius: 8,
    background: "var(--pill-bg)",
    border: "1px solid var(--color-border-tab)",
    cursor: "pointer",
    fontFamily: "var(--font-sans)",
  },
  dateLabel: {
    fontSize: 13,
    color: "var(--color-text-tertiary)",
  },
  dateValue: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text-medium)",
  },
  dateMenu: {
    position: "absolute",
    top: "calc(100% + 4px)",
    left: 0,
    minWidth: 180,
    background: "var(--surface-white)",
    border: "1px solid var(--color-border-tab)",
    borderRadius: 8,
    boxShadow: "var(--shadow-4)",
    padding: "4px 0",
    zIndex: 40,
  },
  dateMenuItem: {
    display: "block",
    width: "100%",
    padding: "8px 16px",
    border: "none",
    textAlign: "left",
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    cursor: "pointer",
  },
};
