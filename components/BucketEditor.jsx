"use client";

import React from "react";
import { X, Plus } from "lucide-react";
import Button from "./Button";
import { RingInput } from "./CreditsUsageParts";

// BucketEditor — the C6 editable tier strip. Each tier is an inline card with
// an editable name + weekly cap (minutes) and a remove control; an "Add tier"
// tile appends a new bucket up to MAX_BUCKETS. The page owns the buckets state
// and the agent reassignment that happens when a tier is removed; this is pure
// presentation over the onEdit / onAdd / onRemove callbacks.
const MAX_BUCKETS = 5;
const FOCUS_RING = "0 0 0 2px #FFFFFF, 0 0 0 4px var(--do-brand-blue)";

export default function BucketEditor({ buckets, onEdit, onAdd, onRemove }) {
  return (
    <div style={styles.row}>
      {buckets.map((b) => (
        <div key={b.id} style={styles.card}>
          <div style={styles.top}>
            <TierNameInput value={b.name} onChange={(name) => onEdit(b.id, { name })} />
            <Button
              variant="icon"
              size="sm"
              aria-label={`Remove ${b.name}`}
              disabled={buckets.length <= 1}
              onClick={() => onRemove(b.id)}
            >
              <X size={15} />
            </Button>
          </div>
          <RingInput
            value={b.capMin}
            onChange={(capMin) => onEdit(b.id, { capMin })}
            suffix="min / wk"
            ariaLabel={`${b.name} weekly cap`}
            width={52}
          />
          <span style={styles.count}>{b.agentCount.toLocaleString()} agents</span>
        </div>
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

function TierNameInput({ value, onChange }) {
  const [focus, setFocus] = React.useState(false);
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      aria-label="Tier name"
      style={{
        ...styles.nameInput,
        borderColor: focus ? "var(--do-brand-blue)" : "var(--color-border-card-soft)",
        boxShadow: focus ? FOCUS_RING : "none",
      }}
    />
  );
}

const styles = {
  row: { display: "flex", gap: 12, alignItems: "stretch", flexWrap: "wrap" },
  card: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    flex: "1 1 180px",
    minWidth: 180,
    padding: "14px 16px",
    border: "1px solid var(--color-border-card-soft)",
    borderRadius: 12,
    background: "#FFFFFF",
  },
  top: { display: "flex", alignItems: "center", gap: 8 },
  nameInput: {
    flex: 1,
    minWidth: 0,
    padding: "6px 10px",
    border: "1px solid var(--color-border-card-soft)",
    borderRadius: 8,
    background: "#FFFFFF",
    fontFamily: "inherit",
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text-deep)",
    outline: "none",
    transition: "box-shadow 120ms ease, border-color 120ms ease",
  },
  count: { fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)" },
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
