"use client";

import React from "react";
import { SlidersHorizontal, Check, Minus, Sparkles, ChevronsLeft, ChevronLeft, ChevronRight } from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import PageHeader from "./PageHeader";
import GenerateWorkflowModal from "./GenerateWorkflowModal";
import { WORKFLOW_INTERACTIONS } from "./mocks/workflowsLanding";

// InteractionPickerPage — "05 · Interaction picker — filters (sales)" /
// "06 · … — summary (sales)" from Figma (06 is the same screen with a
// selection already made — Generate goes from disabled to enabled, which
// the `selected.size === 0` check below already produces; no separate
// component needed for it). Reached from WorkflowDriverDetailPage's
// "+Workflow" create menu → "From a customer interaction". Header (back +
// title + Customer ID field chip + search + filter toggle) over a table of
// interactions to pick from, a pagination footer (display-only — same
// "Total 150 / Page 1 of 22" chrome WorkflowPublishModal already uses for
// the same reason: no real dataset behind the mock), and a bottom
// Cancel/Generate bar. Generate opens GenerateWorkflowModal ("07 · … —
// select language modal"); confirming it returns to the driver detail
// table, which plays the generating→draft transition ("08"/"09").
// The faceted filter panel lives in InteractionFilterPanel and is passed
// to <PageLayout rightPanel> by the host — this page only owns the toggle.
export default function InteractionPickerPage({
  onBack,
  filtersOpen = false,
  onToggleFilters,
  onSelectionChange,
}) {
  const [search, setSearch] = React.useState("");
  const [selected, setSelected] = React.useState(() => new Set());
  const [page, setPage] = React.useState(1);
  const [generateModalOpen, setGenerateModalOpen] = React.useState(false);

  const toggleRow = (id) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Tells the host to swap its right panel from Filters to the "06 ·
  // Interaction picker — summary" insights list once ≥1 row is picked.
  React.useEffect(() => {
    onSelectionChange?.(selected.size > 0);
  }, [selected, onSelectionChange]);

  return (
    <div style={ipStyles.wrap}>
      <PageHeader
        back={onBack}
        identifier={{ label: "Create a workflow" }}
        filters={[{ id: "field", label: "Customer ID", value: "", onClick: () => {} }]}
        search={{ value: search, onChange: setSearch, placeholder: "Search by Customer ID" }}
        toolbar={[{
          id: "filters",
          icon: <SlidersHorizontal size={18} />,
          label: "All Filters",
          onClick: onToggleFilters,
          active: filtersOpen,
        }]}
      />

      <Card padX={0} padY={0} style={ipStyles.tableCard}>
        <div style={ipStyles.tableHeader}>
          <span style={{ ...ipStyles.headerCell, width: 120 }}>Customer ID</span>
          <span style={{ ...ipStyles.headerCell, width: 56 }}>Agent</span>
          <span style={{ ...ipStyles.headerCell, width: 56, textAlign: "center" }}>FCR</span>
          <span style={{ ...ipStyles.headerCell, width: 56, textAlign: "center" }}>Sales won</span>
          <span style={{ ...ipStyles.headerCell, width: 80, textAlign: "center" }}>Retained</span>
          <span style={{ ...ipStyles.headerCell, width: 56, textAlign: "center" }}>CSAT</span>
          <span style={{ ...ipStyles.headerCell, width: 100 }}>Quality</span>
          <span style={{ ...ipStyles.headerCell, width: 80 }}>Duration</span>
          <span style={{ ...ipStyles.headerCell, width: 150, textAlign: "right" }}>Date</span>
        </div>
        <div style={ipStyles.rows}>
          {WORKFLOW_INTERACTIONS.map((row) => (
            <InteractionRow
              key={row.id}
              row={row}
              selected={selected.has(row.id)}
              onToggle={() => toggleRow(row.id)}
            />
          ))}
        </div>
        <div style={ipStyles.pagination}>
          <span>Total 150 interactions</span>
          <div style={ipStyles.pageControls}>
            <Button variant="icon" size="sm" disabled={page === 1} onClick={() => setPage(1)} aria-label="First page">
              <ChevronsLeft size={18} />
            </Button>
            <span>Page {page} of 22</span>
            <Button variant="icon" size="sm" disabled={page === 1} onClick={() => setPage((v) => v - 1)} aria-label="Previous page">
              <ChevronLeft size={18} />
            </Button>
            <Button variant="icon" size="sm" disabled={page === 22} onClick={() => setPage((v) => v + 1)} aria-label="Next page">
              <ChevronRight size={18} />
            </Button>
          </div>
        </div>
      </Card>

      <Card padX={24} padY={16} style={ipStyles.actionBar}>
        <Button variant="text" uppercase={false} onClick={onBack} style={ipStyles.cancelBtn}>
          Cancel
        </Button>
        <Button
          variant="primary"
          uppercase={false}
          disabled={selected.size === 0}
          onClick={() => setGenerateModalOpen(true)}
        >
          Generate
        </Button>
      </Card>

      <GenerateWorkflowModal
        open={generateModalOpen}
        onDismiss={() => setGenerateModalOpen(false)}
        onGenerate={() => { setGenerateModalOpen(false); onBack(); }}
      />
    </div>
  );
}

function InteractionRow({ row, selected, onToggle }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      role="row"
      aria-selected={selected}
      onClick={onToggle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...ipStyles.row,
        background: selected ? "var(--pill-bg)" : hover ? "var(--table-row-hover)" : "transparent",
      }}
    >
      <span style={{ ...ipStyles.cellText, width: 120 }}>{row.id}</span>
      <span style={{ ...ipStyles.cell, width: 56 }}>
        <span style={ipStyles.avatar}>{row.agentInitials}</span>
      </span>
      <span style={{ ...ipStyles.cell, width: 56, justifyContent: "center" }}>
        <TriState value={row.fcr} />
      </span>
      <span style={{ ...ipStyles.cell, width: 56, justifyContent: "center" }}>
        <TriState value={row.salesWon} />
      </span>
      <span style={{ ...ipStyles.cell, width: 80, justifyContent: "center" }}>
        <TriState value={row.retained} />
      </span>
      <span style={{ ...ipStyles.cell, width: 56, justifyContent: "center" }}>
        <CsatDots value={row.csat} />
      </span>
      <span style={{ ...ipStyles.cell, width: 100 }}>
        <span style={ipStyles.qualityBadge}>
          <Sparkles size={12} color="var(--color-text-row)" />
          {row.quality}%
        </span>
      </span>
      <span style={{ ...ipStyles.cellText, width: 80 }}>{row.duration}</span>
      <span style={{ ...ipStyles.cellText, width: 150, textAlign: "right" }}>{row.date}</span>
    </div>
  );
}

// FCR / Sales won / Retained render a check when true, a dash otherwise —
// the source frame only shows a checked or dashed state (see mocks/
// workflowsLanding.js comment on WORKFLOW_INTERACTIONS). Figma's check is a
// filled green circle with a white glyph, not lucide's outlined
// CheckCircle2 — built from a plain circle + Check icon to match.
function TriState({ value }) {
  return value
    ? (
      <span style={ipStyles.filledCheck}>
        <Check size={12} color="#FFFFFF" strokeWidth={3} />
      </span>
    )
    : <Minus size={20} color="var(--color-text-tertiary)" />;
}

// 5-dot CSAT rating — filled dots use the same success green as the
// check-circle cells above; unfilled dots are a light neutral.
function CsatDots({ value }) {
  return (
    <span style={ipStyles.csatDots}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          style={{
            ...ipStyles.csatDot,
            background: i < value ? "var(--color-success)" : "var(--color-divider-card)",
          }}
        />
      ))}
    </span>
  );
}

const ipStyles = {
  wrap: { display: "flex", flexDirection: "column", gap: 16, width: "100%", flex: 1, minHeight: 0 },
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
  rows: { flex: 1, minHeight: 0, overflowY: "auto" },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 24,
    height: 48,
    paddingInline: 24,
    cursor: "pointer",
    transition: "background 120ms ease",
  },
  cellText: {
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    color: "var(--color-text-row)",
  },
  cell: { display: "flex", alignItems: "center" },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: "50%",
    background: "var(--color-icon-tertiary-bg)",
    color: "var(--color-icon-tertiary-fg)",
    fontSize: 11,
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  filledCheck: {
    width: 20,
    height: 20,
    flexShrink: 0,
    borderRadius: "50%",
    background: "var(--color-success)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  qualityBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    height: 24,
    padding: "2px 8px",
    borderRadius: 4,
    background: "var(--chart-gray-50)",
    color: "var(--color-text-row)",
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    fontWeight: 600,
  },
  csatDots: { display: "inline-flex", alignItems: "center", gap: 3 },
  csatDot: { width: 6, height: 6, borderRadius: "50%" },
  pagination: {
    flexShrink: 0,
    height: 54,
    borderTop: "1px solid var(--color-divider-card)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingInline: "16px 32px",
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    letterSpacing: "0.25px",
    color: "var(--color-text-tertiary)",
  },
  pageControls: { display: "flex", alignItems: "center", gap: 12 },
  actionBar: { flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between" },
  cancelBtn: { fontWeight: 500, color: "var(--color-text-medium)" },
};
