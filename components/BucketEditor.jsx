"use client";

import React from "react";
import { X, Plus } from "lucide-react";
import Card from "./Card";
import Button from "./Button";

// BucketEditor — the C6 editable tier strip. Each tier mirrors the read-only
// BucketCard structure (name + note, the agent count as the headline figure,
// the weekly cap below) but the name and cap are quiet editable fields, with a
// remove control. An "Add tier" tile appends a new bucket up to MAX_BUCKETS.
// The page owns the buckets state + the agent reassignment that happens on
// remove; this is presentation over onEdit / onAdd / onRemove.
const MAX_BUCKETS = 5;
const FOCUS_RING = "0 0 0 2px #FFFFFF, 0 0 0 4px var(--do-brand-blue)";

export default function BucketEditor({ buckets, onEdit, onAdd, onRemove }) {
  return (
    <div style={styles.row}>
      {buckets.map((b) => (
        <Card key={b.id} tone="outline" padX={16} padY={14} style={styles.card}>
          <div style={styles.head}>
            <EditField
              value={b.name}
              onChange={(name) => onEdit(b.id, { name })}
              ariaLabel="Tier name"
              style={styles.nameInput}
            />
            {b.note && <span style={styles.note}>{b.note}</span>}
            <span style={styles.removeWrap}>
              <Button
                variant="icon"
                size="sm"
                aria-label={`Remove ${b.name}`}
                disabled={buckets.length <= 1}
                onClick={() => onRemove(b.id)}
              >
                <X size={15} />
              </Button>
            </span>
          </div>
          <div style={styles.cap}>
            {b.agentCount.toLocaleString()}
            <span style={styles.capUnit}>agents</span>
          </div>
          <div style={styles.capRow}>
            <EditField
              type="number"
              value={b.capMin}
              onChange={(capMin) => onEdit(b.id, { capMin })}
              ariaLabel={`${b.name} weekly cap in minutes`}
              style={styles.capInput}
            />
            <span style={styles.capLabel}>min / week</span>
          </div>
        </Card>
      ))}
      {buckets.length < MAX_BUCKETS && (
        <button type="button" onClick={onAdd} style={styles.addTile}>
          <Plus size={18} />
          <span style={styles.addLabel}>Add tier</span>
        </button>
      )}
    </div>
  );
}

// EditField — a quiet input that sits in the card like text until focused,
// then lifts to the brand border + documented focus ring.
function EditField({ type = "text", value, onChange, ariaLabel, style }) {
  const [focus, setFocus] = React.useState(false);
  return (
    <input
      type={type}
      min={type === "number" ? 1 : undefined}
      value={value}
      onChange={(e) => onChange(type === "number" ? Number(e.target.value) || 0 : e.target.value)}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      aria-label={ariaLabel}
      style={{
        ...styles.input,
        ...style,
        borderColor: focus ? "var(--do-brand-blue)" : "var(--color-border-card-soft)",
        boxShadow: focus ? FOCUS_RING : "none",
      }}
    />
  );
}

const styles = {
  row: { display: "flex", gap: 12, alignItems: "stretch", flexWrap: "wrap" },
  card: { display: "flex", flexDirection: "column", gap: 6, flex: "1 1 180px", minWidth: 180 },

  head: { display: "flex", alignItems: "center", gap: 8, minWidth: 0 },
  note: {
    padding: "1px 8px",
    borderRadius: 999,
    background: "var(--color-icon-tertiary-bg)",
    color: "var(--color-icon-tertiary-fg)",
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.2px",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
  removeWrap: { marginInlineStart: "auto", flexShrink: 0 },

  cap: {
    display: "flex",
    alignItems: "baseline",
    gap: 6,
    fontSize: 22,
    fontWeight: 600,
    color: "var(--color-text-deep)",
    fontVariantNumeric: "tabular-nums",
  },
  capUnit: { fontSize: 11, fontWeight: 500, color: "var(--color-text-tertiary)" },
  capRow: { display: "flex", alignItems: "center", gap: 8 },
  capLabel: { fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)" },

  input: {
    border: "1px solid var(--color-border-card-soft)",
    borderRadius: 6,
    padding: "3px 8px",
    background: "#FFFFFF",
    fontFamily: "inherit",
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text-deep)",
    outline: "none",
    appearance: "textfield",
    boxSizing: "border-box",
    transition: "box-shadow 120ms ease, border-color 120ms ease",
  },
  nameInput: { flex: "0 1 150px", minWidth: 0 },
  capInput: { width: 52, flexShrink: 0 },

  addTile: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    flex: "1 1 140px",
    minWidth: 140,
    padding: "14px 16px",
    border: "1.5px dashed var(--color-divider-card)",
    borderRadius: 12,
    background: "transparent",
    color: "var(--color-text-tertiary)",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "border-color 120ms ease, color 120ms ease",
  },
  addLabel: { fontSize: 13, fontWeight: 600 },
};
