"use client";

import React from "react";
import { Plus } from "lucide-react";
import { Section } from "./CreditsUsageParts";
import Button from "./Button";
import BucketCard from "./BucketCard";
import BucketFacepile from "./BucketFacepile";
import AgentBucketTable from "./AgentBucketTable";
import AddAgentsDialog from "./AddAgentsDialog";

// BucketFolderMerged — bucket-as-folder with the quota buckets and the
// assignment list in one card. Two layouts:
//   layout="rail" (C2) — a vertical bucket rail on the left, list on the
//                        right; the rail doubles as the cap/count cards.
//   layout="top"  (C3) — the bucket cards stacked horizontally on top, the
//                        full-width list below.
// Both keep the dialog for adding agents (the C1 panel does it inline).
export default function BucketFolderMerged({
  buckets,
  agents,
  selectedBucketId,
  onSelectBucket,
  onAssign,
  onAdjust,
  layout = "rail",
}) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const bucket = buckets.find((b) => b.id === selectedBucketId) || null;
  const members = bucket ? agents.filter((a) => a.bucketId === bucket.id) : [];

  const list = !bucket ? (
    <p style={styles.hint}>Select a bucket to manage its members.</p>
  ) : (
    <>
      <div style={styles.head}>
        <span style={styles.title}>{bucket.name} · {bucket.capMin} min / week</span>
        <BucketFacepile members={members} />
      </div>
      <AgentBucketTable
        agents={members}
        buckets={buckets}
        onAdjust={onAdjust}
        paginate
        bare
        emptyLabel={`No agents in ${bucket.name} yet — use Add agent to fold some in.`}
      />
    </>
  );

  return (
    <Section
      title="Quota buckets & assignment"
      description="Pick a bucket, then fold agents into it. Buckets are fixed — only membership changes."
      headerRight={
        <Button
          variant="primary"
          leadingIcon={<Plus size={15} />}
          disabled={!bucket}
          onClick={() => setDialogOpen(true)}
        >
          Add agent
        </Button>
      }
    >
      {layout === "top" ? (
        <div style={styles.stack}>
          <div style={styles.bucketRow}>
            {buckets.map((b) => (
              <BucketCard
                key={b.id}
                bucket={b}
                interactive
                selected={b.id === selectedBucketId}
                onClick={() => onSelectBucket(b.id)}
              />
            ))}
          </div>
          <div style={styles.main}>{list}</div>
        </div>
      ) : (
        <div style={styles.split}>
          <div style={styles.rail} role="radiogroup" aria-label="Quota buckets">
            {buckets.map((b) => {
              const on = b.id === selectedBucketId;
              return (
                <button
                  key={b.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => onSelectBucket(b.id)}
                  style={{
                    ...styles.railItem,
                    borderColor: on ? "var(--color-icon-tertiary-fg)" : "var(--color-divider-card)",
                    background: on ? "var(--color-icon-tertiary-bg)" : "#FFFFFF",
                  }}
                >
                  <span style={styles.railTop}>
                    <span style={styles.railName}>{b.name}</span>
                    {b.note && <span style={styles.railNote}>{b.note}</span>}
                  </span>
                  <span style={styles.railCap}>
                    {b.capMin}<span style={styles.railUnit}>min / week</span>
                  </span>
                  <span style={styles.railCount}>{b.agentCount.toLocaleString()} agents</span>
                </button>
              );
            })}
          </div>
          <div style={styles.main}>{list}</div>
        </div>
      )}

      <AddAgentsDialog
        open={dialogOpen}
        bucket={bucket}
        agents={agents}
        onClose={() => setDialogOpen(false)}
        onAdd={onAssign}
      />
    </Section>
  );
}

const styles = {
  // C3 — stacked on top
  stack: { display: "flex", flexDirection: "column", gap: 20 },
  bucketRow: { display: "flex", gap: 12, alignItems: "stretch" },

  // C2 — rail on the left
  split: { display: "flex", gap: 20, alignItems: "flex-start" },
  rail: { display: "flex", flexDirection: "column", gap: 8, width: 220, flexShrink: 0 },
  railItem: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    padding: "12px 14px",
    borderRadius: 10,
    border: "1.5px solid",
    cursor: "pointer",
    textAlign: "left",
    fontFamily: "inherit",
    transition: "border-color 120ms ease, background 120ms ease",
  },
  railTop: { display: "flex", alignItems: "center", gap: 8 },
  railName: { fontSize: 13, fontWeight: 600, color: "var(--color-text-deep)" },
  railNote: {
    padding: "1px 8px",
    borderRadius: 999,
    background: "var(--color-icon-tertiary-bg)",
    color: "var(--color-icon-tertiary-fg)",
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.2px",
    whiteSpace: "nowrap",
  },
  railCap: {
    display: "flex",
    alignItems: "baseline",
    gap: 6,
    fontSize: 20,
    fontWeight: 600,
    color: "var(--color-text-deep)",
    fontVariantNumeric: "tabular-nums",
  },
  railUnit: { fontSize: 11, fontWeight: 500, color: "var(--color-text-tertiary)" },
  railCount: { fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)" },

  // shared
  main: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 8 },
  hint: { margin: 0, fontSize: 13, fontWeight: 500, color: "var(--color-text-tertiary)" },
  head: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" },
  title: { fontSize: 13, fontWeight: 600, color: "var(--color-text-deep)" },
};
