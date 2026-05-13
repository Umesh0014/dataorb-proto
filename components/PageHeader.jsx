"use client";

import React from "react";
import { Search, ChevronDown } from "lucide-react";
import Card from "./Card";
import Button from "./Button";

// PageHeader — shared page header for every module page.
//
// Composes the existing <Card> primitive (padX/Y:0) with two stacked rows
// inside a single container surface:
//
//   Row 1: identifier (left) ↔ optional primary action (right)
//   Row 2: borderless search (left) ↔ vertical divider ↔ ordered toolbar
//          icon buttons (right)
//
// Row 2 — and the horizontal divider between rows — hides when neither
// `search` nor `toolbar` is supplied. The vertical divider in row 2
// hides when either side of it is empty.
//
// Sub-objects are all optional. Supported combinations:
//   - identifier only
//   - identifier + primary action (row 1 only)
//   - identifier + search (no CTA, no toolbar)
//   - identifier + search + toolbar (no CTA)
//   - identifier + CTA + search + toolbar (full layout)
//
// All inner styling pulls from existing primitives (Card, Button, the
// icon-chip avatar pattern already used by DrillHeader/HeaderCard and
// existing border-tab divider token). No new tokens introduced.
//
// API:
//   identifier:    { icon, label, withDropdown?, onClick? }
//   primaryAction: { label, icon?, onClick, variant?, disabled? }
//   search:        { value, onChange, placeholder? }
//   toolbar:       Array<{ id, icon, label, onClick, active? }>
//   filters:       Array<{ id, label, value, onClick }>
export default function PageHeader({
  identifier,
  primaryAction,
  search,
  toolbar,
  filters,
}) {
  const hasSearch = Boolean(search);
  const hasToolbar = Array.isArray(toolbar) && toolbar.length > 0;
  const hasFilters = Array.isArray(filters) && filters.length > 0;
  const hasRow2 = hasSearch || hasToolbar || hasFilters;

  return (
    <Card padX={0} padY={0} style={phStyles.outer}>
      <div style={phStyles.row1}>
        {identifier ? <Identifier {...identifier} /> : <span />}
        {primaryAction && <PrimaryAction {...primaryAction} />}
      </div>
      {hasRow2 && (
        <>
          <div style={phStyles.rowDivider} aria-hidden="true" />
          <div style={phStyles.row2}>
            {hasFilters && <FilterPills items={filters} />}
            {hasSearch && <SearchInput {...search} />}
            {hasToolbar && (
              <>
                {(hasFilters || hasSearch)
                  ? <div style={phStyles.verticalDividerEnd} aria-hidden="true" />
                  : <span style={{ marginLeft: "auto" }} aria-hidden="true" />}
                <Toolbar items={toolbar} />
              </>
            )}
          </div>
        </>
      )}
    </Card>
  );
}

function Identifier({ icon, label, withDropdown = false, onClick }) {
  const inner = (
    <>
      <div style={phStyles.iconChip}>{icon}</div>
      <span style={phStyles.label}>{label}</span>
      {withDropdown && (
        <span className="material-symbols-outlined" style={phStyles.chevron}>
          expand_more
        </span>
      )}
    </>
  );

  if (withDropdown) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-haspopup="menu"
        style={phStyles.identifierBtn}
      >
        {inner}
      </button>
    );
  }
  return <div style={phStyles.identifierBox}>{inner}</div>;
}

function PrimaryAction({ label, icon, onClick, variant = "primary", disabled = false }) {
  // Map API variant onto existing Button primitive variants. The Button
  // primitive does not ship a "secondary" variant — fall back to "text"
  // for that case (closest neutral-foreground button in the system).
  const buttonVariant = variant === "secondary" ? "text" : "primary";
  return (
    <Button
      variant={buttonVariant}
      leadingIcon={icon}
      onClick={onClick}
      disabled={disabled}
      style={{ height: 32, minWidth: 0, paddingInline: 16 }}
    >
      {label}
    </Button>
  );
}

function SearchInput({ value, onChange, placeholder = "Search" }) {
  return (
    <div style={phStyles.searchWrap}>
      <Search size={18} style={phStyles.searchIcon} aria-hidden="true" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        style={phStyles.searchInput}
      />
    </div>
  );
}

function FilterPills({ items }) {
  return (
    <div style={phStyles.filterPills}>
      {items.map((f) => (
        Array.isArray(f.options) && f.options.length > 0
          ? <FilterDropdown key={f.id} filter={f} />
          : (
            <button
              key={f.id}
              type="button"
              onClick={f.onClick}
              style={phStyles.filterPill}
            >
              <span style={phStyles.filterLabel}>{f.label}</span>
              <span style={phStyles.filterValue}>{f.value}</span>
              <ChevronDown size={14} style={{ color: "var(--color-text-tertiary)", flexShrink: 0 }} />
            </button>
          )
      ))}
    </div>
  );
}

function FilterDropdown({ filter }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open ? "true" : "false"}
        style={phStyles.filterPill}
      >
        <span style={phStyles.filterLabel}>{filter.label}</span>
        <span style={phStyles.filterValue}>{filter.value}</span>
        <ChevronDown size={14} style={{ color: "var(--color-text-tertiary)", flexShrink: 0 }} />
      </button>
      {open && (
        <>
          <div style={phStyles.menuScrim} onClick={() => setOpen(false)} aria-hidden="true" />
          <div role="menu" style={phStyles.menu}>
            {filter.options.map((opt) => {
              const isSelected = opt.value === filter.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="menuitemradio"
                  aria-checked={isSelected}
                  onClick={() => { filter.onSelect?.(opt.value); setOpen(false); }}
                  style={{
                    ...phStyles.menuItem,
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
        </>
      )}
    </div>
  );
}

function Toolbar({ items }) {
  return (
    <div style={phStyles.toolbar}>
      {items.map((it) => (
        <Button
          key={it.id}
          variant="icon"
          size="md"
          onClick={it.onClick}
          aria-label={it.label}
          aria-pressed={it.active ? "true" : undefined}
          style={it.active ? phStyles.toolbarBtnActive : undefined}
        >
          {it.icon}
        </Button>
      ))}
    </div>
  );
}

const phStyles = {
  // 2px same-color halo against the tinted page canvas — preserves the
  // 12px radius silhouette. Existing pattern (see InteractionsHeader).
  // Card primitive already provides background #FFFFFF, radius 12, and
  // box-sizing: border-box; only the halo is additive here.
  outer: {
    border: "2px solid #FFFFFF",
  },
  row1: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    paddingInline: 28,
    height: 80,
  },
  identifierBox: { display: "flex", alignItems: "center", gap: 0 },
  identifierBtn: {
    display: "flex",
    alignItems: "center",
    gap: 0,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 0,
    fontFamily: '"Mulish", sans-serif',
    color: "inherit",
  },
  iconChip: {
    width: 32,
    height: 32,
    borderRadius: 16,
    background: "#E8ECFF",
    color: "#245BFF",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    marginRight: 12,
  },
  label: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 16,
    fontWeight: 600,
    color: "#1F232A",
    lineHeight: 1.4,
    marginRight: 6,
  },
  chevron: {
    fontSize: 18,
    color: "#8C90A6",
    fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20",
  },
  rowDivider: {
    height: 1,
    background: "var(--color-border-tab)",
  },
  row2: {
    display: "flex",
    alignItems: "stretch",
    height: 56,
  },
  searchWrap: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: 10,
    paddingInline: 20,
    minWidth: 0,
  },
  searchIcon: {
    color: "var(--color-text-tertiary)",
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    background: "transparent",
    border: "none",
    outline: "none",
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    color: "var(--color-text-medium)",
    minWidth: 0,
  },
  verticalDivider: {
    width: 1,
    alignSelf: "stretch",
    margin: "12px 0",
    background: "var(--color-border-tab)",
  },
  // Same as verticalDivider but right-anchored — pushes itself + the
  // following toolbar to the right edge of row 2.
  verticalDividerEnd: {
    width: 1,
    alignSelf: "stretch",
    margin: "12px 0",
    marginLeft: "auto",
    background: "var(--color-border-tab)",
  },
  filterPills: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    paddingLeft: 20,
  },
  filterPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "6px 12px",
    borderRadius: 999,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontFamily: '"Mulish", sans-serif',
    fontSize: 13,
    whiteSpace: "nowrap",
  },
  filterLabel: {
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
  },
  filterValue: {
    fontWeight: 600,
    color: "var(--color-text-deep)",
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    paddingInline: 12,
  },
  toolbarBtnActive: {
    background: "var(--pill-bg)",
    color: "var(--color-text-tab-active)",
  },
  menuScrim: {
    position: "fixed",
    inset: 0,
    background: "transparent",
    zIndex: 39,
  },
  menu: {
    position: "absolute",
    top: "calc(100% + 4px)",
    left: 0,
    minWidth: 180,
    background: "#FFFFFF",
    borderRadius: 8,
    border: "1px solid var(--color-border-tab)",
    boxShadow: "0 4px 12px rgba(15, 20, 60, 0.10)",
    padding: "4px 0",
    zIndex: 40,
    overflow: "hidden",
  },
  menuItem: {
    display: "block",
    width: "100%",
    padding: "8px 16px",
    background: "transparent",
    border: "none",
    textAlign: "left",
    fontFamily: '"Mulish", sans-serif',
    fontSize: 13,
    cursor: "pointer",
  },
};
