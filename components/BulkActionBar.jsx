"use client";

import React from "react";
import { X } from "lucide-react";

// BulkActionBar — floating bar that appears when multiple agents are selected.
// Shows count + bulk coaching actions. Sits at the bottom of the table area.

const BULK_ACTIONS = [
  { id: "drill", label: "Assign Drill" },
  { id: "one-on-one", label: "Schedule 1:1" },
  { id: "brief", label: "Generate Brief" },
  { id: "mission", label: "Add to Mission" },
];

export default function BulkActionBar({ count, onAction, onClear }) {
  if (count === 0) return null;
  return (
    <div style={styles.bar}>
      <span style={styles.count}>{count} selected</span>
      <div style={styles.actions}>
        {BULK_ACTIONS.map((a) => (
          <button
            key={a.id}
            type="button"
            className="im-focusable"
            style={styles.actionBtn}
            onClick={() => onAction?.(a.id)}
          >
            {a.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="im-focusable"
        style={styles.clearBtn}
        onClick={onClear}
        aria-label="Clear selection"
      >
        <X size={14} />
      </button>
    </div>
  );
}

const styles = {
  bar: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 16px",
    background: "var(--do-ink, #1A1A2E)",
    borderRadius: 10,
    marginTop: 12,
  },
  count: {
    fontSize: 13,
    fontWeight: 700,
    color: "#FDE047",
    whiteSpace: "nowrap",
  },
  actions: {
    display: "flex",
    gap: 8,
    flex: 1,
  },
  actionBtn: {
    all: "unset",
    cursor: "pointer",
    padding: "6px 12px",
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    color: "#F5F5F5",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    transition: "background 120ms ease",
  },
  clearBtn: {
    all: "unset",
    cursor: "pointer",
    width: 24,
    height: 24,
    borderRadius: 6,
    display: "grid",
    placeItems: "center",
    color: "rgba(255,255,255,0.5)",
  },
};
