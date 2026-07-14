"use client";

import React from "react";
import { Plus, SlidersHorizontal, ChevronRight } from "lucide-react";
import Card from "./Card";
import PageHeader from "./PageHeader";
import StatusBadge from "./StatusBadge";
import { WORKFLOW_METRIC_CARDS, WORKFLOW_DRIVER_ROWS } from "./mocks/workflowsLanding";

// "Deep" tiles (pale-50 bg + near-black 900-level icon color) match the
// Figma metric-card icon treatment exactly — verified against the actual
// exported icon asset fills, not estimated from the screenshot.
const TILE = {
  emerald: { bg: "var(--tile-green-deep-bg)", fg: "var(--tile-green-deep-fg)" },
  rose: { bg: "var(--tile-red-deep-bg)", fg: "var(--tile-red-deep-fg)" },
  fuchsia: { bg: "var(--tile-pink-deep-bg)", fg: "var(--tile-pink-deep-fg)" },
  yellow: { bg: "var(--tile-yellow-deep-bg)", fg: "var(--tile-yellow-deep-fg)" },
  blue: { bg: "var(--tile-blue-bg)", fg: "var(--tile-blue-fg)" },
};

// WorkflowsLandingPage — "Workflows landing — driver grid" direction from
// Figma (Learning Hub → Workflows, rail item flagged wip). Metric-card grid
// summarizing workflow coverage per contact-reason category, plus a table
// of drivers not yet linked to any workflow.
//
// Figma's source node carries two open PM annotations: whether driver-card
// kebab actions should exist, and whether the driver list stays card-only
// or keeps this card/table split. Built exactly as currently drawn — the
// (visually inconsistent) trailing affordance per row is reproduced
// faithfully rather than "cleaned up", since that decision is still
// pending grooming. See WORKFLOW_DRIVER_ROWS in mocks/workflowsLanding.js.
//
// Type family: rendered in the codebase's standard var(--font-sans)
// (Mulish) rather than the Poppins the raw Figma export references —
// CLAUDE.md forbids introducing a second font family, and every other
// page in this codebase already standardizes on Mulish.
export default function WorkflowsLandingPage({ pageName = "Guided Workflows" }) {
  const [search, setSearch] = React.useState("");

  return (
    <div style={wlStyles.wrap}>
      <PageHeader
        identifier={{
          icon: <MaterialIcon glyph="question_answer" size={16} />,
          label: pageName,
          iconBg: "var(--color-icon-tertiary-bg)",
          iconColor: "var(--color-icon-tertiary-fg)",
        }}
        primaryAction={{ label: "Workflow", icon: <Plus size={16} />, onClick: () => {} }}
        search={{ value: search, onChange: setSearch, placeholder: "Search by contact reason" }}
        toolbar={[{ id: "filters", icon: <SlidersHorizontal size={18} />, label: "All Filters", onClick: () => {} }]}
      />

      <div style={wlStyles.grid}>
        {WORKFLOW_METRIC_CARDS.map((card) =>
          card.spacer ? (
            <div key={card.id} aria-hidden="true" style={wlStyles.spacer} />
          ) : (
            <MetricCard key={card.id} card={card} />
          ),
        )}
      </div>

      <div style={wlStyles.tableSection}>
        <h2 style={wlStyles.tableHeading}>Drivers not linked to any workflow</h2>
        <Card padX={0} padY={0} style={wlStyles.tableCard}>
          <div style={wlStyles.tableHeader}>
            <span style={{ ...wlStyles.headerCell, width: 352 }}>Driver</span>
            <span style={{ ...wlStyles.headerCell, width: 240 }}>Category</span>
            <span style={{ ...wlStyles.headerCell, width: 180 }}>Coverage</span>
          </div>
          <div style={wlStyles.rowList}>
            {WORKFLOW_DRIVER_ROWS.map((row) => (
              <DriverRow key={row.id} row={row} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ card }) {
  const tile = TILE[card.tile] || TILE.blue;
  return (
    <Card shadow padX={24} padY={24} style={wlStyles.metricCard}>
      <div style={wlStyles.metricHeader}>
        <span style={{ ...wlStyles.iconBubble, background: tile.bg }} aria-hidden="true">
          <MaterialIcon glyph={card.icon} size={24} color={tile.fg} />
        </span>
        <div style={wlStyles.metricTitleCol}>
          <span style={wlStyles.metricTitle}>{card.title}</span>
          <div style={wlStyles.chipRow}>
            {card.chips.map((c) => (
              <span key={c.label} style={wlStyles.neutralChip}>{c.label}</span>
            ))}
          </div>
        </div>
      </div>
      <div style={wlStyles.divider} />
      <div style={wlStyles.metricFooter}>
        <div style={wlStyles.footerCol}>
          <span style={wlStyles.footerLabel}>Workflow</span>
          <div style={wlStyles.trendRow}>
            <span style={wlStyles.trendPillSuccess}>
              <MaterialIcon glyph="schema" size={12} color="var(--color-success-text)" />
              {card.workflow.active} Active
            </span>
            <span style={wlStyles.trendPillNeutral}>{card.workflow.draft} Draft</span>
          </div>
        </div>
        <div style={{ ...wlStyles.footerCol, alignItems: "flex-end" }}>
          <span style={{ ...wlStyles.footerLabel, textAlign: "right" }}>Replays</span>
          <span style={wlStyles.trendPillReplays}>
            <MaterialIcon glyph="play_arrow" size={12} color="var(--color-text-medium)" />
            {card.replays.active} Active
          </span>
        </div>
      </div>
    </Card>
  );
}

function DriverRow({ row }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ ...wlStyles.row, background: hover ? "var(--color-surface-header-tinted)" : "transparent" }}
    >
      <div style={wlStyles.rowIdentity}>
        <span style={wlStyles.rowIconBubble} aria-hidden="true">
          <MaterialIcon glyph={row.icon} size={10} color="var(--tile-blue-fg)" />
        </span>
        <span style={wlStyles.rowName}>{row.name}</span>
      </div>
      <div style={wlStyles.rowCategories}>
        {row.categories.map((c) => (
          <span key={c.label} style={c.shade === "100" ? wlStyles.neutralChip100 : wlStyles.neutralChip}>
            {c.label}
          </span>
        ))}
      </div>
      <div style={wlStyles.rowCoverage}>
        <StatusBadge tone="warning">{row.coverage}</StatusBadge>
      </div>
      <div style={wlStyles.rowTrailing}>
        {row.trailing === "dash" && <span style={wlStyles.rowDash}>--</span>}
      </div>
      <div style={wlStyles.rowAction}>
        {row.trailing === "chevron" && <ChevronRight size={24} color="var(--color-text-tertiary)" />}
      </div>
    </div>
  );
}

// MaterialIcon — thin wrapper matching StatCard's IconSlot pattern; renders
// a Material Symbols Outlined glyph by name (font already loaded globally
// in app/layout.jsx). Used instead of lucide here since every icon in this
// Figma frame is a named Material Symbols glyph (the source node's
// data-name matches the font ligature exactly).
function MaterialIcon({ glyph, size = 24, color = "currentColor" }) {
  return (
    <span
      className="material-symbols-outlined"
      style={{
        fontSize: size,
        color,
        fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        lineHeight: 1,
      }}
    >
      {glyph}
    </span>
  );
}

const wlStyles = {
  wrap: { display: "flex", flexDirection: "column", gap: 16, width: "100%" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 24,
  },
  spacer: { visibility: "hidden" },
  metricCard: { display: "flex", flexDirection: "column", gap: 16, borderRadius: 8 },
  metricHeader: { display: "flex", alignItems: "flex-start", gap: 12 },
  iconBubble: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 56,
    flexShrink: 0,
  },
  metricTitleCol: { display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 0 },
  metricTitle: {
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    fontWeight: 600,
    color: "var(--color-text-deep)",
  },
  chipRow: { display: "flex", flexWrap: "wrap", gap: 4 },
  neutralChip: {
    display: "inline-flex",
    alignItems: "center",
    padding: "3px 10px",
    borderRadius: 4,
    background: "var(--color-chip-bg)",
    color: "var(--color-chip-text)",
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    fontWeight: 400,
    whiteSpace: "nowrap",
  },
  neutralChip100: {
    display: "inline-flex",
    alignItems: "center",
    padding: "3px 10px",
    borderRadius: 4,
    background: "var(--grey-100)",
    color: "var(--color-chip-text)",
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    fontWeight: 400,
    whiteSpace: "nowrap",
  },
  divider: { height: 1, background: "var(--color-divider-card)" },
  metricFooter: { display: "flex", alignItems: "flex-start", justifyContent: "space-between" },
  footerCol: { display: "flex", flexDirection: "column", gap: 4 },
  footerLabel: { fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--color-text-tertiary)" },
  trendRow: { display: "flex", alignItems: "center", gap: 4 },
  trendPillSuccess: {
    display: "inline-flex",
    alignItems: "center",
    height: 24,
    padding: "4px 8px",
    borderRadius: 4,
    background: "var(--color-success-bg)",
    color: "var(--color-success-text)",
    fontFamily: "var(--font-sans)",
    fontSize: 11,
    fontWeight: 400,
  },
  trendPillNeutral: {
    display: "inline-flex",
    alignItems: "center",
    height: 24,
    padding: "4px 8px",
    borderRadius: 4,
    background: "var(--grey-50)",
    color: "var(--grey-700)",
    fontFamily: "var(--font-sans)",
    fontSize: 11,
    fontWeight: 400,
  },
  trendPillReplays: {
    display: "inline-flex",
    alignItems: "center",
    height: 24,
    padding: "4px 8px",
    borderRadius: 4,
    background: "var(--color-border-card-soft)",
    color: "var(--color-text-medium)",
    fontFamily: "var(--font-sans)",
    fontSize: 11,
    fontWeight: 400,
  },

  tableSection: { display: "flex", flexDirection: "column", gap: 16 },
  tableHeading: {
    margin: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 16,
    fontWeight: 600,
    color: "var(--color-text-medium)",
  },
  tableCard: { display: "flex", flexDirection: "column", overflow: "hidden" },
  tableHeader: {
    display: "flex",
    alignItems: "center",
    gap: 24,
    height: 40,
    paddingInline: 24,
    background: "var(--color-surface-header-tinted)",
  },
  headerCell: {
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    fontWeight: 600,
    color: "var(--color-text-tertiary)",
  },
  rowList: { display: "flex", flexDirection: "column" },
  row: {
    display: "flex",
    alignItems: "center",
    gap: 24,
    height: 52,
    paddingInline: 24,
    borderRadius: 999,
    transition: "background 120ms ease",
  },
  rowIdentity: { display: "flex", alignItems: "center", gap: 8, width: 352, minWidth: 0 },
  rowIconBubble: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 24,
    height: 24,
    borderRadius: 24,
    background: "var(--tile-blue-bg)",
    flexShrink: 0,
  },
  rowName: {
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    color: "var(--color-text-medium)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  rowCategories: { display: "flex", alignItems: "center", gap: 12, width: 240 },
  rowCoverage: { width: 180 },
  rowTrailing: { flex: 1, display: "flex", alignItems: "center" },
  rowDash: {
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    fontWeight: 500,
    color: "var(--color-text-medium)",
  },
  rowAction: { width: 40, display: "flex", alignItems: "center", justifyContent: "flex-end" },
};
