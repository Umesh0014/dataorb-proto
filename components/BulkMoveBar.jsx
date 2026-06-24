"use client";

import React from "react";
import Button from "./Button";
import Select from "./Select";
import { estimateMonthlyDelta } from "./mocks/creditsUsage";

// BulkMoveBar — appears above any agent table once one or more agents are
// checked. Pick a target bucket and apply; the page moves the selection and
// clears it. `excludeBucketId` drops the current bucket from the options in
// the folder views (you can't move agents into the bucket they're already
// in). This is the bulk form of the per-row Adjust action.
export default function BulkMoveBar({ count, buckets, onApply, excludeBucketId }) {
  const [targetId, setTargetId] = React.useState("");
  const options = buckets.filter((b) => b.id !== excludeBucketId);
  const target = buckets.find((b) => b.id === targetId);
  const estDelta = target ? estimateMonthlyDelta(count, target.capMin) : 0;

  return (
    <div style={styles.bar}>
      <span style={styles.count}>{count} selected</span>
      <Select
        value={targetId}
        onChange={setTargetId}
        ariaLabel="Move to bucket"
        placeholder="Move to bucket…"
        options={options.map((b) => ({ value: b.id, label: `${b.name} (${b.capMin} min)` }))}
      />
      {target && (
        <span style={styles.preview}>
          Moving {count} to {target.name} ({target.capMin} min) · ~${estDelta.toLocaleString()}/mo
        </span>
      )}
      <span style={styles.action}>
        <Button
          variant="primary"
          disabled={!target}
          onClick={() => { onApply(targetId); setTargetId(""); }}
          style={{ height: 36, paddingInline: 18 }}
        >
          Move
        </Button>
      </span>
    </div>
  );
}

const styles = {
  bar: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    padding: "10px 14px",
    borderRadius: 10,
    background: "var(--color-icon-tertiary-bg)",
    border: "1px solid rgba(102, 80, 165, 0.12)",
  },
  count: { fontSize: 13, fontWeight: 700, color: "var(--color-icon-tertiary-fg)" },
  preview: { fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)" },
  action: { marginLeft: "auto" },
};
