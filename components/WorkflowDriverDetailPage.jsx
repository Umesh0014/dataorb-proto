"use client";

import React from "react";
import { Plus, SlidersHorizontal, MoreVertical, RotateCcw, Upload, Pencil, Archive, Sparkles, FileText } from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import PageHeader from "./PageHeader";
import KebabMenu from "./KebabMenu";
import WorkflowPublishModal from "./WorkflowPublishModal";
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
  onCreateFromInteraction,
  onEditWorkflow,
}) {
  const [search, setSearch] = React.useState("");
  const [rows, setRows] = React.useState(WORKFLOW_TABLE_ROWS);
  const [publishingId, setPublishingId] = React.useState(null);
  const driver = WORKFLOW_METRIC_CARDS.find((c) => c.id === driverId);
  const publishingWorkflow = rows.find((row) => row.id === publishingId) || null;

  const publishWorkflow = (attachedCount) => {
    setRows((current) => current.map((row) => (
      row.id === publishingId ? { ...row, status: "active", roleplays: attachedCount } : row
    )));
    setPublishingId(null);
  };

  // "08 · Driver detail — workflow generating row" and "09 · … — generated
  // draft row" are the same row before/after generation finishes (see
  // mocks/workflowsLanding.js) — simulate that completion here so landing
  // on this page (fresh from the interaction-picker Generate flow, or on
  // any reload) plays the same transition Figma documents.
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setRows((current) => current.map((row) => (
        row.status === "generating"
          ? { ...row, status: "draft", name: "New workflow - review to confirm", isNew: true }
          : row
      )));
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={wdStyles.wrap}>
      <PageHeader
        back={onBack}
        identifier={{ label: driver?.title ?? "Billing and payments" }}
        actions={<CreateWorkflowMenu onSelectInteraction={onCreateFromInteraction} />}
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
        {rows.map((row) => (
          <WorkflowRow key={row.id} row={row} onPublish={() => setPublishingId(row.id)} onEdit={() => onEditWorkflow?.(row.id)} />
        ))}
      </Card>
      {publishingWorkflow && (
        <WorkflowPublishModal
          workflow={publishingWorkflow}
          onClose={() => setPublishingId(null)}
          onPublish={publishWorkflow}
        />
      )}
    </div>
  );
}

// CreateWorkflowMenu — the header's "+ Workflow" button, from Figma
// "04 · Create workflow — source dropdown". No existing menu primitive
// fits: KebabMenu's items are icon+label only, this needs an icon tile +
// title + subtitle per row, so it's built inline here (1st callsite).
// Icons follow the pair GuidedWorkflowDialogs.jsx already uses for the
// same interactions-vs-transcript choice (Sparkles / FileText) rather than
// literally matching Figma's folder_copy/sticky_note_2 glyphs, for
// in-app icon-vocabulary consistency. Both options are stubbed (no
// downstream creation flow exists yet) — same convention as the kebab
// menu's unimplemented actions below.
function CreateWorkflowMenu({ onSelectInteraction }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ position: "relative" }}>
      <Button
        variant="primary"
        leadingIcon={<Plus size={16} />}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        style={{ height: 32, minWidth: 0, paddingInline: 16 }}
      >
        Workflow
      </Button>
      {open && (
        <>
          <div style={wdStyles.menuScrim} onClick={() => setOpen(false)} aria-hidden="true" />
          <div role="menu" style={wdStyles.createMenu}>
            <CreateMenuItem
              iconBg="var(--tile-blue-bg)"
              icon={<Sparkles size={20} color="var(--tile-blue-fg)" />}
              title="From a customer interaction"
              subtitle="Pick a real positive-outcome call."
              onClick={() => { setOpen(false); onSelectInteraction?.(); }}
            />
            <div style={wdStyles.createMenuDivider} aria-hidden="true" />
            <CreateMenuItem
              iconBg="var(--tile-green-deep-bg)"
              icon={<FileText size={20} color="var(--color-success-deep)" />}
              title="From a transcript"
              subtitle="Paste or upload a conversation transcript."
              onClick={() => setOpen(false)}
            />
          </div>
        </>
      )}
    </div>
  );
}

function CreateMenuItem({ iconBg, icon, title, subtitle, onClick }) {
  return (
    <Button
      variant="text"
      uppercase={false}
      fullWidth
      role="menuitem"
      onClick={onClick}
      style={wdStyles.createMenuItem}
    >
      <span style={wdStyles.createMenuContent}>
        <span style={{ ...wdStyles.createMenuIconTile, background: iconBg }}>{icon}</span>
        <span style={wdStyles.createMenuText}>
          <span style={wdStyles.createMenuTitle}>{title}</span>
          <span style={wdStyles.createMenuSubtitle}>{subtitle}</span>
        </span>
      </span>
    </Button>
  );
}

// "generating" pairs with `--tile-blue-bg`/`--tile-blue-fg` — the existing
// blue tile pair (used elsewhere for icon tiles), reused here as the
// closest token pair for Figma's #EFF6FF/#1D4ED8 status pill. The fg hex
// doesn't match exactly (#3B82F6 vs #1D4ED8, a lighter blue) — no exact
// token exists; flagged rather than hardcoding a new one.
const STATUS = {
  generating: { label: "Generating", bg: "var(--tile-blue-bg)",      fg: "var(--tile-blue-fg)",       icon: true },
  draft:      { label: "Draft",      bg: "var(--chart-gray-50)",     fg: "var(--chart-gray-700)" },
  active:     { label: "Active",     bg: "var(--tile-green-deep-bg)", fg: "var(--color-success-deep)" },
  archived:   { label: "Archived",   bg: "var(--chart-gray-50)",     fg: "var(--chart-gray-700)" },
};

// Kebab menu items per row status, from Figma "03a · Driver detail — kebab
// menu actions". Icons: Retry (RotateCcw), Publish (Upload), Edit (Pencil),
// Archive (Archive) — sized 18 to match KebabMenu's default glyph, uncolored
// so each item inherits the menu row's text color.
// The frame documents generating / draft / active only; `archived` has no
// kebab in the design, so those rows render without one (surfaced below,
// not invented).
function statusActions(status, { onPublish, onEdit }) {
  switch (status) {
    case "generating":
      return [{ label: "Retry", icon: <RotateCcw size={18} />, onClick: () => {} }];
    case "draft":
      return [
        { label: "Publish", icon: <Upload size={18} />, onClick: onPublish },
        { label: "Edit", icon: <Pencil size={18} />, onClick: onEdit },
        { label: "Archive", icon: <Archive size={18} />, onClick: () => {} },
      ];
    case "active":
      return [
        { label: "Edit", icon: <Pencil size={18} />, onClick: onEdit },
        { label: "Archive", icon: <Archive size={18} />, onClick: () => {} },
      ];
    default:
      return [];
  }
}

function WorkflowRow({ row, onPublish, onEdit }) {
  const [hover, setHover] = React.useState(false);
  const status = STATUS[row.status] || STATUS.draft;
  const actions = statusActions(row.status, { onPublish, onEdit });
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ ...wdStyles.row, background: hover ? "var(--table-row-hover)" : "transparent" }}
    >
      <span style={{ ...wdStyles.cellText, width: 120 }}>{row.id}</span>
      <span style={wdStyles.nameGroup}>
        <span style={{ ...wdStyles.cellText, ...wdStyles.nameCell }}>{row.name}</span>
        {row.isNew && (
          <span style={{ ...wdStyles.statusPill, flexShrink: 0, background: "var(--tile-blue-bg)", color: "var(--tile-blue-fg)" }}>
            New
          </span>
        )}
      </span>
      <span style={{ ...wdStyles.cellText, width: 160, textAlign: "center" }}>{row.roleplays}</span>
      <span style={{ width: 120 }}>
        <span style={{ ...wdStyles.statusPill, background: status.bg, color: status.fg }}>
          {status.icon && <MaterialIcon glyph="cached" size={12} color={status.fg} />}
          {status.label}
        </span>
      </span>
      <span style={wdStyles.actionsCell}>
        <Button
          variant="text"
          uppercase={false}
          onClick={onEdit}
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
        {actions.length > 0 && (
          <KebabMenu
            ariaLabel={`More actions for ${row.id}`}
            items={actions}
            glyph={<MoreVertical size={20} color="var(--color-text-tertiary)" />}
          />
        )}
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
  // instead of the card shrink-wrapping its rows and leaving bare page
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
  nameGroup: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flex: 1,
    minWidth: 0,
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
  menuScrim: {
    position: "fixed",
    inset: 0,
    zIndex: 39,
    background: "transparent",
  },
  createMenu: {
    position: "absolute",
    top: "calc(100% + 8px)",
    insetInlineEnd: 0,
    width: 400,
    background: "#FFFFFF",
    borderRadius: 16,
    boxShadow: "var(--shadow-8)",
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    zIndex: 40,
  },
  createMenuItem: {
    width: "100%",
    justifyContent: "flex-start",
    height: "auto",
    gap: 10,
    padding: "12px 20px",
    borderRadius: 4,
  },
  createMenuContent: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 10,
    textAlign: "left",
  },
  createMenuIconTile: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  createMenuText: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 2,
    minWidth: 0,
  },
  createMenuTitle: {
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    color: "var(--color-text-deep)",
  },
  createMenuSubtitle: {
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    color: "var(--color-text-row)",
  },
  createMenuDivider: {
    height: 1,
    background: "var(--color-border-tab)",
  },
};
