"use client";

import React from "react";
import { Section } from "./CreditsUsageParts";
import Button from "./Button";
import AssignByRuleBuilder from "./AssignByRuleBuilder";
import { estimateMonthlyDelta } from "./mocks/creditsUsage";

// BucketAssignmentRegion — the A/B exploration fork. Same data, same
// buckets; only HOW an admin folds agents into buckets differs. The active
// approach is chosen by the VersionBar (A default). Approach C (bucket-as-
// folder) is a merged surface and lives in BucketFolderPanel instead.
const APPROACH_META = {
  A: { tag: "Approach A — Assign by rule", desc: "Fold agents into buckets with conditional rules that scale to your whole tenant." },
  B: { tag: "Approach B — Select & bulk-move", desc: "Select agents in the table below, then move them to a bucket in one action." },
};

export default function BucketAssignmentRegion({
  mode,
  buckets,
  agents,
  selectedIds = [],
  onBulkMove,
}) {
  const meta = APPROACH_META[mode] || APPROACH_META.A;
  return (
    <Section title="Assignment" description={meta.desc} headerRight={<span style={styles.badge}>{meta.tag}</span>}>
      {mode === "A" && <AssignByRuleBuilder buckets={buckets} />}
      {mode === "B" && (
        <BulkMove agents={agents} buckets={buckets} selectedIds={selectedIds} onBulkMove={onBulkMove} />
      )}
    </Section>
  );
}

// ---- B: select & bulk-move -------------------------------------------------

function BulkMove({ agents, buckets, selectedIds, onBulkMove }) {
  const [targetId, setTargetId] = React.useState("");
  const count = selectedIds.length;

  if (count === 0) {
    return <p style={styles.hint}>Select agents in the table below, then move them in bulk.</p>;
  }

  const target = buckets.find((b) => b.id === targetId);
  const estDelta = target ? estimateMonthlyDelta(count, target.capMin) : 0;

  return (
    <div style={styles.bulkBar}>
      <span style={styles.bulkCount}>
        {count} selected
      </span>
      <select
        value={targetId}
        onChange={(e) => setTargetId(e.target.value)}
        aria-label="Move to bucket"
        style={styles.select}
      >
        <option value="">Move to bucket…</option>
        {buckets.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name} ({b.capMin} min)
          </option>
        ))}
      </select>
      {target && (
        <span style={styles.preview}>
          Moving {count} to {target.name} ({target.capMin} min) · ~${estDelta.toLocaleString()}/mo
        </span>
      )}
      <span style={styles.bulkAction}>
        <Button
          variant="primary"
          disabled={!target}
          onClick={() => {
            onBulkMove(targetId);
            setTargetId("");
          }}
          style={{ height: 36, paddingInline: 18 }}
        >
          Apply
        </Button>
      </span>
    </div>
  );
}

const styles = {
  badge: {
    padding: "3px 10px",
    borderRadius: 999,
    background: "var(--color-icon-tertiary-bg)",
    color: "var(--color-icon-tertiary-fg)",
    fontSize: 11,
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  hint: { margin: 0, fontSize: 13, fontWeight: 500, color: "var(--color-text-tertiary)" },
  bulkBar: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" },
  bulkCount: { fontSize: 13, fontWeight: 700, color: "var(--color-text-deep)" },
  preview: { fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)" },
  bulkAction: { marginLeft: "auto" },
  select: {
    height: 36,
    padding: "0 10px",
    borderRadius: 8,
    border: "1px solid var(--color-border-card-soft)",
    background: "#FFFFFF",
    fontFamily: "inherit",
    fontSize: 12,
    fontWeight: 600,
    color: "var(--color-text-medium)",
    cursor: "pointer",
    appearance: "auto",
  },
};
