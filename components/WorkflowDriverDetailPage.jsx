"use client";

import React from "react";
import { Plus, SlidersHorizontal, MoreVertical } from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import PageHeader from "./PageHeader";
import { WORKFLOW_METRIC_CARDS, WORKFLOW_TABLE_ROWS } from "./mocks/workflowsLanding";

// WorkflowDriverDetailPage — "03 · Driver detail — workflows table" from
// Figma. Drill-in from a Workflows-landing metric card: header (back +
// driver title + Workflow CTA + search + filter toggle) over a table of
// that driver's guided workflows (ID / name / roleplays / status pill /
// row actions). The faceted filter panel lives in WorkflowFilterPanel and
// is passed to <PageLayout rightPanel> by the host — this page only owns
// the toggle.
//
// Figma hides its pagination footer (opacity 0) — deliberately not built.
// The Edit action shows on row hover only (source shows it on the hovered
// first row and opacity-0 elsewhere); the kebab is always visible.
export default function WorkflowDriverDetailPage({
  driverId,
  onBack,
  filtersOpen = false,
  onToggleFilters,
}) {
  const [search, setSearch] = React.useState("");
  const driver = WORKFLOW_METRIC_CARDS.find((c) => c.id === driverId);

  return (
    <div style={wdStyles.wrap}>
      <PageHeader
        back={onBack}
        identifier={{ label: driver?.title ?? "Billing and payments" }}
        primaryAction={{ label: "Workflow", icon: <Plus size={16} />, onClick: () => {} }}
        search={{ value: search, onChange: setSearch, placeholder: "Search by Workflow names/ Contact Reason" }}
        toolbar={[{
          id: "filters",
          icon: <SlidersHorizontal size={18} />,
          label: "All Filters",
          onClick: onToggleFilters,
          active: filtersOpen,
        }]}
      />

      <Card padX={0} padY={0} style={wdStyles.tableCard}>
        <div style={wdStyles.tableHeader}>
          <span style={{ ...wdStyles.headerCell, width: 120 }}>ID</span>
          <span style={{ ...wdStyles.headerCell, flex: 1, minWidth: 0 }}>Workflow name</span>
          <span style={{ ...wdStyles.headerCell, width: 160, textAlign: "center" }}>Roleplays</span>
          <span style={{ ...wdStyles.headerCell, width: 120 }}>Status</span>
          <span style={{ width: 71 }} aria-hidden="true" />
        </div>
        {WORKFLOW_TABLE_ROWS.map((row) => (
          <WorkflowRow key={row.id} row={row} />
        ))}
      </Card>
    </div>
  );
}

const STATUS = {
  draft:    { label: "Draft",    bg: "var(--chart-gray-50)",      fg: "var(--chart-gray-700)" },
  active:   { label: "Active",   bg: "var(--tile-green-deep-bg)", fg: "var(--color-success-deep)" },
  archived: { label: "Archived", bg: "var(--chart-gray-50)",      fg: "var(--chart-gray-700)" },
};

function WorkflowRow({ row }) {
  const [hover, setHover] = React.useState(false);
  const status = STATUS[row.status] || STATUS.draft;
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ ...wdStyles.row, background: hover ? "var(--table-row-hover)" : "transparent" }}
    >
      <span style={{ ...wdStyles.cellText, width: 120 }}>{row.id}</span>
      <span style={{ ...wdStyles.cellText, ...wdStyles.nameCell }}>{row.name}</span>
      <span style={{ ...wdStyles.cellText, width: 160, textAlign: "center" }}>{row.roleplays}</span>
      <span style={{ width: 120 }}>
        <span style={{ ...wdStyles.statusPill, background: status.bg, color: status.fg }}>
          <MaterialIcon glyph="schema" size={12} color={status.fg} />
          {status.label}
        </span>
      </span>
      <span style={wdStyles.actionsCell}>
        <Button
          variant="text"
          uppercase={false}
          onClick={() => {}}
          style={{
            fontWeight: 500,
            fontSize: 14,
            color: "var(--do-brand-blue)",
            paddingInline: 12,
            visibility: hover ? "visible" : "hidden",
          }}
        >
          Edit
        </Button>
        <Button variant="icon" size="sm" aria-label={`More actions for ${row.id}`} onClick={() => {}}>
          <MoreVertical size={20} color="var(--color-text-tertiary)" />
        </Button>
      </span>
    </div>
  );
}

// 2nd callsite of this helper (1st: WorkflowsLandingPage) — promote to a
// shared primitive at the 3rd (rule of three).
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

const wdStyles = {
  wrap: { display: "flex", flexDirection: "column", gap: 16, width: "100%", flex: 1, minHeight: 0 },
  // flex: 1 + minHeight: 0 stretches the table's white rounded surface to
  // fill the page (matching the faceted filter panel's full-height look)
  // instead of the card shrink-wrapping its 6 rows and leaving bare page
  // background below it.
  tableCard: { display: "flex", flexDirection: "column", overflow: "hidden", flex: 1, minHeight: 0 },
  tableHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 24,
    height: 40,
    paddingInline: 24,
    background: "var(--color-surface-header-tinted)",
  },
  headerCell: {
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "0.5px",
    color: "var(--color-text-tertiary)",
  },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 24,
    height: 64,
    paddingInline: 24,
    transition: "background 120ms ease",
  },
  cellText: {
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    fontWeight: 500,
    color: "var(--color-text-row)",
  },
  nameCell: {
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  statusPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    height: 24,
    padding: "4px 6px",
    borderRadius: 4,
    fontFamily: "var(--font-sans)",
    fontSize: 11,
    fontWeight: 400,
  },
  actionsCell: {
    width: 71,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
  },
};
