"use client";

import React from "react";
import { Section } from "./CreditsUsageParts";
import AssignByRuleBuilder from "./AssignByRuleBuilder";

// BucketAssignmentRegion — the A/B exploration fork. Same data, same
// buckets; only HOW an admin folds agents into buckets differs. A uses a
// conditional rule builder; B leans on the table's checkbox selection +
// the shared BulkMoveBar (rendered by the page above the table). Approach C
// (bucket-as-folder) is a merged surface and lives in BucketFolderPanel /
// BucketFolderMerged instead.
const APPROACH_META = {
  A: { tag: "Approach A — Assign by rule", desc: "Fold agents into buckets with conditional rules that scale to your whole tenant." },
  B: { tag: "Approach B — Select & bulk-move", desc: "Select agents in the table below, then move them to a bucket in one action." },
};

export default function BucketAssignmentRegion({ mode, buckets }) {
  const meta = APPROACH_META[mode] || APPROACH_META.A;
  return (
    <Section title="Assignment" description={meta.desc} headerRight={<span style={styles.badge}>{meta.tag}</span>}>
      {mode === "A" ? (
        <AssignByRuleBuilder buckets={buckets} />
      ) : (
        <p style={styles.hint}>
          Check agents in the table below — a move bar appears so you can move them to another bucket in one action.
        </p>
      )}
    </Section>
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
};
