"use client";

import React from "react";
import Toggle from "./Toggle";

// BucketDecisionControls — the three still-open product decisions, built as
// live controls with sensible defaults and a "Decision to confirm" flag so
// the open questions stay visible rather than buried. Same in all three
// assignment approaches. Bucket-value editing is intentionally NOT exposed
// yet — the lock is a decision toggle, not a value editor.
const CONFLICT_OPTIONS = [
  { id: "higher_cap", label: "Use the higher cap" },
  { id: "manual_wins", label: "Manual override wins" },
  { id: "last_assigned", label: "Last assigned wins" },
];

const UNASSIGNED_OPTIONS = [
  { id: "none", label: "No weekly limit" },
  { id: "lowest", label: "Lowest bucket (10 min)" },
  { id: "blocked", label: "Blocked from practice" },
];

const TIER_EDITING_OPTIONS = [
  { id: "locked", label: "Locked" },
  { id: "edit_caps", label: "Admins edit caps" },
  { id: "add_tiers", label: "Admins add tiers" },
];

// On the C4 bucket model an agent lives in exactly one bucket, so the
// "matches two buckets" conflict is dropped, and bucket-value control
// becomes a three-state permission instead of a lock toggle.
export default function BucketDecisionControls({ variant = "legacy", rules, onRuleChange }) {
  const bucket = variant === "bucket";
  return (
    <div style={styles.wrap}>
      {!bucket && (
        <>
          <DecisionRow label="If an agent matches two buckets">
            <Segmented
              options={CONFLICT_OPTIONS}
              value={rules.conflictRule}
              onChange={(v) => onRuleChange("conflictRule", v)}
              ariaLabel="If an agent matches two buckets"
            />
          </DecisionRow>
          <div style={styles.partition} />
        </>
      )}

      {bucket ? (
        <DecisionRow label="Who can change bucket caps">
          <Segmented
            options={TIER_EDITING_OPTIONS}
            value={rules.tierEditing}
            onChange={(v) => onRuleChange("tierEditing", v)}
            ariaLabel="Who can change bucket caps"
          />
        </DecisionRow>
      ) : (
        <DecisionRow label="Bucket values are DataOrb-managed (locked)" inline>
          <div style={styles.toggleRow}>
            {!rules.bucketValuesLocked && (
              <span style={styles.helper}>Admins can edit bucket values.</span>
            )}
            <Toggle
              enabled={rules.bucketValuesLocked}
              onChange={(v) => onRuleChange("bucketValuesLocked", v)}
              ariaLabel="Bucket values are DataOrb-managed (locked)"
            />
          </div>
        </DecisionRow>
      )}

      <div style={styles.partition} />

      <DecisionRow label="Agents not in any bucket">
        <Segmented
          options={UNASSIGNED_OPTIONS}
          value={rules.unassignedDefault}
          onChange={(v) => onRuleChange("unassignedDefault", v)}
          ariaLabel="Agents not in any bucket"
        />
      </DecisionRow>
    </div>
  );
}

function DecisionRow({ label, children, inline = false }) {
  const head = (
    <div style={styles.labelRow}>
      <span style={styles.label}>{label}</span>
      <span
        style={styles.flagDot}
        role="img"
        aria-label="Decision to confirm"
        title="Decision to confirm"
      />
    </div>
  );

  return (
    <div style={inline ? styles.rowInline : styles.row}>
      {head}
      {children}
    </div>
  );
}

function Segmented({ options, value, onChange, ariaLabel }) {
  return (
    <div style={styles.segmented} role="radiogroup" aria-label={ariaLabel}>
      {options.map((o) => {
        const selected = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(o.id)}
            style={{
              ...styles.segment,
              borderColor: selected ? "var(--color-icon-tertiary-fg)" : "var(--color-border-card-soft)",
              background: selected ? "var(--color-icon-tertiary-bg)" : "#FFFFFF",
              color: selected ? "var(--color-icon-tertiary-fg)" : "var(--color-text-medium)",
              fontWeight: selected ? 700 : 500,
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

const styles = {
  wrap: { display: "flex", flexDirection: "column", gap: 18 },
  partition: { height: 1, background: "var(--color-border-card-soft)" },
  row: { display: "flex", flexDirection: "column", gap: 10 },
  rowInline: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 },
  labelRow: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  label: { fontSize: 13, fontWeight: 600, color: "var(--color-text-deep)" },
  flagDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "var(--chart-amber)",
    flexShrink: 0,
  },
  segmented: { display: "inline-flex", gap: 8, flexWrap: "wrap" },
  segment: {
    padding: "8px 14px",
    borderRadius: 8,
    border: "1.5px solid",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: 12,
    transition: "border-color 120ms ease, background 120ms ease, color 120ms ease",
  },
  toggleRow: { display: "flex", alignItems: "center", gap: 12 },
  helper: { fontSize: 12, fontWeight: 400, color: "var(--color-text-tertiary)" },
};
