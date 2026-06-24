"use client";

import React from "react";
import Card from "./Card";

// BucketCard — one fixed quota bucket: name, member count as the primary
// figure, weekly cap as the secondary line, and an optional footer note
// (e.g. the tenant default). Buckets never change
// value, so there is no inline editing here — agents move between buckets.
// When `interactive` (assignment approach C, bucket-as-folder), the whole
// card is a button that opens the bucket; `selected` lifts the border.
export default function BucketCard({ bucket, interactive = false, selected = false, onClick }) {
  const body = (
    <>
      <div style={styles.head}>
        <span style={styles.name}>{bucket.name}</span>
        {bucket.note && <span style={styles.note}>{bucket.note}</span>}
      </div>
      <div style={styles.cap}>
        {bucket.agentCount.toLocaleString()}
        <span style={styles.capUnit}>agents</span>
      </div>
      <span style={styles.count}>{bucket.capMin} min / week</span>
    </>
  );

  if (!interactive) {
    return (
      <Card tone="outline" padX={16} padY={14} style={styles.card}>
        {body}
      </Card>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      style={{
        ...styles.card,
        ...styles.button,
        borderColor: selected ? "var(--color-icon-tertiary-fg)" : "var(--color-divider-card)",
        background: selected ? "var(--color-icon-tertiary-bg)" : "#FFFFFF",
      }}
    >
      {body}
    </button>
  );
}

const styles = {
  card: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    flex: 1,
    minWidth: 0,
  },
  button: {
    borderRadius: 8,
    border: "1px solid",
    padding: "14px 16px",
    cursor: "pointer",
    textAlign: "left",
    fontFamily: "inherit",
    transition: "border-color 120ms ease, background 120ms ease",
  },
  head: { display: "flex", alignItems: "center", gap: 8, minWidth: 0 },
  name: { fontSize: 13, fontWeight: 600, color: "var(--color-text-deep)", whiteSpace: "nowrap" },
  note: {
    padding: "1px 8px",
    borderRadius: 999,
    background: "var(--color-icon-tertiary-bg)",
    color: "var(--color-icon-tertiary-fg)",
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.2px",
    whiteSpace: "nowrap",
  },
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
  count: { fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)" },
};
