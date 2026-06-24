"use client";

import React from "react";
import { X } from "lucide-react";
import Button from "./Button";
import Select from "./Select";
import { Field, FieldNote, RingInput } from "./CreditsUsageParts";

// CreditsUsageAdjustPanel — per-agent limit editor, mounted as PageLayout's
// rightPanel (docks ≥1644px, overlays below — PageLayout owns that). Move
// the agent to a different bucket, or set a manual cap that overrides the
// bucket value for this agent. Saving recomputes the page's bill-impact.
export default function CreditsUsageAdjustPanel({ agent, buckets, onClose, onSave }) {
  const startBucket = agent.bucketId;
  const startCap = agent.override
    ? agent.override.capMin
    : (buckets.find((b) => b.id === agent.bucketId)?.capMin ?? 0);

  const [bucketId, setBucketId] = React.useState(startBucket);
  const [manualCap, setManualCap] = React.useState(startCap);

  const bucketCap = buckets.find((b) => b.id === bucketId)?.capMin ?? 0;
  const isCustom = manualCap !== bucketCap;

  const save = () => {
    onSave(agent.id, { bucketId, manualCap: isCustom ? manualCap : null });
    onClose();
  };

  return (
    <div style={styles.panel}>
      <header style={styles.header}>
        <span style={styles.title}>Adjust limit — {agent.name}</span>
        <Button variant="icon" onClick={onClose} aria-label="Close panel">
          <X size={16} />
        </Button>
      </header>

      <div style={styles.body}>
        <Field label="Move to bucket">
          <Select
            value={bucketId}
            onChange={(next) => {
              setBucketId(next);
              setManualCap(buckets.find((b) => b.id === next)?.capMin ?? 0);
            }}
            ariaLabel="Move to bucket"
            fullWidth
            options={buckets.map((b) => ({ value: b.id, label: `${b.name} (${b.capMin} min)` }))}
          />
        </Field>

        <Field label="Manual cap (min)">
          <RingInput
            value={manualCap}
            onChange={setManualCap}
            suffix="min / week"
            ariaLabel="Manual cap minutes"
            width={72}
          />
          {isCustom && (
            <FieldNote>Overrides the {bucketCap}-min bucket cap for this agent only.</FieldNote>
          )}
        </Field>
      </div>

      <footer style={styles.footer}>
        <Button variant="primary" fullWidth onClick={save}>
          Save change
        </Button>
      </footer>
    </div>
  );
}

const styles = {
  panel: { display: "flex", flexDirection: "column", height: "100%", minHeight: 0, fontFamily: "var(--font-sans)" },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "20px 20px 16px",
    borderBottom: "1px solid var(--color-divider-card)",
  },
  title: { fontSize: 14, fontWeight: 700, color: "var(--color-text-deep)" },
  body: { display: "flex", flexDirection: "column", gap: 20, padding: 20, flex: 1, minHeight: 0 },
  footer: { padding: "16px 20px", borderTop: "1px solid var(--color-divider-card)" },
};
