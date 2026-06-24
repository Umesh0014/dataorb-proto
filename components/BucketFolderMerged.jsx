"use client";

import React from "react";
import { Plus } from "lucide-react";
import { Section } from "./CreditsUsageParts";
import Button from "./Button";
import BucketCard from "./BucketCard";
import AgentBucketTable from "./AgentBucketTable";
import AddAgentsDialog from "./AddAgentsDialog";
import BulkMoveBar from "./BulkMoveBar";

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
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onBulkMove,
  onAssign,
  layout = "rail",
  bulkPlacement = "top",
}) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const bucket = buckets.find((b) => b.id === selectedBucketId) || null;
  const members = bucket ? agents.filter((a) => a.bucketId === bucket.id) : [];

  const showBulk = selectedIds.length > 0 && bucket;
  const bulkBar = showBulk ? (
    <BulkMoveBar
      count={selectedIds.length}
      buckets={buckets}
      excludeBucketId={bucket.id}
      onApply={onBulkMove}
    />
  ) : null;

  const list = !bucket ? (
    <p style={styles.hint}>Select a bucket to manage its members.</p>
  ) : (
    <>
      {bulkPlacement === "top" && bulkBar}
      <AgentBucketTable
        agents={members}
        buckets={buckets}
        showAdjust={false}
        paginate
        bare
        selectable
        selectedIds={selectedIds}
        onToggleSelect={onToggleSelect}
        onToggleSelectAll={onToggleSelectAll}
        bulkBar={bulkPlacement === "inline" || bulkPlacement === "footer" ? bulkBar : null}
        bulkPlacement={bulkPlacement}
        emptyLabel={`No agents in ${bucket.name} yet — use Add agent to fold some in.`}
      />
    </>
  );

  const bucketCards = (
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
  );

  const desc = bulkPlacement === "top"
    ? "Pick a bucket, then fold agents into it. Buckets are fixed — only membership changes."
    : `Selected-agents action: ${PLACEMENT_LABELS[bulkPlacement] || bulkPlacement} — select agents to preview it.`;

  return (
    <Section
      title="Quota buckets & assignment"
      description={desc}
      headerRight={
        <Button
          variant="primary"
          size="sm"
          leadingIcon={<Plus size={15} />}
          disabled={!bucket}
          onClick={() => setDialogOpen(true)}
        >
          Add agent
        </Button>
      }
    >
      {layout === "attached" ? (
        <div style={styles.stackAttached}>
          {bucketCards}
          <div style={styles.attachedCard}>{list}</div>
        </div>
      ) : layout === "top" ? (
        <div style={styles.stack}>
          {bucketCards}
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
                    {b.agentCount.toLocaleString()}<span style={styles.railUnit}>agents</span>
                  </span>
                  <span style={styles.railCount}>{b.capMin} min / week</span>
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

      {bulkPlacement === "floating" && bulkBar && (
        <div style={styles.floating}>{bulkBar}</div>
      )}
    </Section>
  );
}

const PLACEMENT_LABELS = {
  floating: "Floating bar (bottom)",
  inline: "Inline in the toolbar",
  footer: "Docked at the footer",
};

const styles = {
  // Floating placement — a centred pill pinned near the bottom of the
  // viewport, clear of the version bar at bottom-right.
  floating: {
    position: "fixed",
    bottom: 28,
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 50,
    boxShadow: "var(--shadow-8)",
    borderRadius: 10,
  },

  // C3 — stacked on top (extra gap between the bucket cards and the list)
  stack: { display: "flex", flexDirection: "column", gap: 32 },
  bucketRow: { display: "flex", gap: 12, alignItems: "stretch" },

  // C4 — the list lives in a card "attached" to the selected bucket above.
  stackAttached: { display: "flex", flexDirection: "column", gap: 12 },
  attachedCard: {
    border: "1.5px solid var(--color-icon-tertiary-fg)",
    borderRadius: 12,
    padding: "16px 20px",
    background: "#FFFFFF",
  },

  // C2 — rail on the left
  split: { display: "flex", gap: 28, alignItems: "flex-start" },
  rail: { display: "flex", flexDirection: "column", gap: 8, width: 176, flexShrink: 0 },
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
};
