"use client";

import React from "react";
import { Search, X, Plus, Check } from "lucide-react";

// ContactReasonsPanel — right-edge fixed-position drawer that lists the
// 49 contact reasons from the catalogue. Used by step 2 of the Create
// Mission wizard.
//
// Behavior:
//   - Always targets `activeDriverId`; switching the active driver
//     while the panel is open does NOT close the panel — it just
//     remaps the "already added" state of each list row.
//   - Search filters the list. Section label reflects the *visible*
//     count (post-filter).
//   - Click a row (or the trailing `+`) → adds that reason to the
//     active driver. Already-added reasons render in a muted/checked
//     state and stop responding to clicks.
//   - "Add All" adds every currently visible (filtered) reason to the
//     active driver in one pass.
//
// Renders nothing when `open` is false.
//
// Position pattern matches FilterPanel's fixed overlay approach so the
// page content underneath remains layout-stable while the panel is
// open. PageLayout's `rightPanel` slot is not used here.

const PANEL_WIDTH = 360;
const REASON_CAP = 50;

export default function ContactReasonsPanel({
  open,
  onClose,
  catalogue,
  activeDriverReasonIds,
  onAddReason,
  onAddManyReasons,
}) {
  const [query, setQuery] = React.useState("");

  if (!open) return null;

  const q = query.trim().toLowerCase();
  const visible = q
    ? catalogue.filter((r) => r.label.toLowerCase().includes(q))
    : catalogue;
  const addedSet = new Set(activeDriverReasonIds || []);
  const reasonsLeft = Math.max(0, REASON_CAP - addedSet.size);
  const bulkAddCount = visible.filter((r) => !addedSet.has(r.id)).length;
  const canBulkAdd = bulkAddCount > 0 && reasonsLeft > 0;

  const handleAddAll = () => {
    const toAdd = visible
      .filter((r) => !addedSet.has(r.id))
      .slice(0, reasonsLeft);
    if (toAdd.length === 0) return;
    onAddManyReasons?.(toAdd);
  };

  return (
    <aside
      role="complementary"
      aria-label="Contact Reasons"
      style={crpStyles.panel}
    >
      <div style={crpStyles.header}>
        <span style={crpStyles.title}>Contact Reasons</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close panel"
          style={crpStyles.closeBtn}
        >
          <X size={18} />
        </button>
      </div>

      <div style={crpStyles.searchWrap}>
        <Search size={16} style={crpStyles.searchIcon} aria-hidden="true" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          aria-label="Search contact reasons"
          style={crpStyles.searchInput}
        />
      </div>

      <div style={crpStyles.sectionHeader}>
        <div style={crpStyles.sectionTitle}>
          Contact Reasons <span style={crpStyles.sectionCount}>({visible.length})</span>
        </div>
        <div style={crpStyles.sectionHelp}>
          To add contact reasons, drag and drop, or click to add
        </div>
      </div>

      <div style={crpStyles.list}>
        {visible.map((r) => {
          const added = addedSet.has(r.id);
          const disabled = added || reasonsLeft <= 0;
          return (
            <button
              key={r.id}
              type="button"
              disabled={disabled}
              onClick={() => onAddReason?.(r)}
              style={{
                ...crpStyles.row,
                ...(added ? crpStyles.rowAdded : null),
                cursor: disabled ? "default" : "pointer",
              }}
              // TODO: drag-and-drop — no DnD pattern exists in the
              // prototype, click-to-add is the current affordance.
            >
              <span style={crpStyles.rowLabel}>{r.label}</span>
              <span style={crpStyles.rowAction} aria-hidden="true">
                {added ? <Check size={16} /> : <Plus size={16} />}
              </span>
            </button>
          );
        })}
        {visible.length === 0 && (
          <div style={crpStyles.emptyList}>No contact reasons match "{query}".</div>
        )}
      </div>

      <div style={crpStyles.footer}>
        <button
          type="button"
          onClick={handleAddAll}
          disabled={!canBulkAdd}
          style={{
            ...crpStyles.addAllBtn,
            color: canBulkAdd
              ? "var(--color-button-primary-bg)"
              : "var(--color-text-tertiary)",
            cursor: canBulkAdd ? "pointer" : "default",
          }}
        >
          Add All
        </button>
      </div>
    </aside>
  );
}

const crpStyles = {
  panel: {
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    width: PANEL_WIDTH,
    background: "var(--surface-white)",
    borderLeft: "1px solid var(--color-divider-card)",
    boxShadow: "var(--shadow-drawer)",
    display: "flex",
    flexDirection: "column",
    zIndex: 40,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingInline: 20,
    height: 56,
    borderBottom: "1px solid var(--color-divider-card)",
    flexShrink: 0,
  },
  title: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 16,
    fontWeight: 700,
    color: "var(--color-text-deep)",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
    color: "var(--color-text-medium)",
  },
  searchWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    height: 44,
    paddingInline: 20,
    borderBottom: "1px solid var(--color-divider-card)",
    flexShrink: 0,
  },
  searchIcon: { color: "var(--color-text-tertiary)", flexShrink: 0 },
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
  sectionHeader: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    padding: "16px 20px 8px",
    flexShrink: 0,
  },
  sectionTitle: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 15,
    fontWeight: 700,
    color: "var(--color-text-deep)",
  },
  sectionCount: { fontWeight: 600, color: "var(--color-text-medium)" },
  sectionHelp: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 12,
    color: "var(--color-text-tertiary)",
    lineHeight: 1.5,
  },
  list: {
    flex: 1,
    overflowY: "auto",
    padding: "4px 12px 8px",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    width: "100%",
    border: "none",
    borderRadius: 6,
    background: "var(--color-card-emoji-bg)",
    padding: "10px 12px",
    fontFamily: "var(--font-sans)",
    color: "var(--color-text-deep)",
    fontSize: 13,
    textAlign: "left",
  },
  rowAdded: {
    background: "var(--pill-bg)",
    color: "var(--color-text-tertiary)",
  },
  rowLabel: { flex: 1, lineHeight: 1.4 },
  rowAction: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--color-text-medium)",
    flexShrink: 0,
  },
  emptyList: {
    padding: "12px 8px",
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    color: "var(--color-text-tertiary)",
    textAlign: "center",
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    height: 56,
    paddingInline: 20,
    borderTop: "1px solid var(--color-divider-card)",
    flexShrink: 0,
  },
  addAllBtn: {
    border: "none",
    background: "transparent",
    fontFamily: '"Mulish", sans-serif',
    fontSize: 13,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    padding: 0,
  },
};
