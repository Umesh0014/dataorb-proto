"use client";

import React from "react";
import Modal from "./Modal";
import Select from "./Select";
import { Field } from "./CreditsUsageParts";

// MoveToBucketDialog — C8's "Manage agents" flow: the selected agents (all in
// the open tier) move to one chosen tier. Triggered by the card-level button,
// which is only enabled once agents are checked.
export default function MoveToBucketDialog({ open, count, buckets, onClose, onConfirm }) {
  const [target, setTarget] = React.useState("");

  const [prevOpen, setPrevOpen] = React.useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setTarget("");
  }
  if (!open) return null;

  const tgt = buckets.find((b) => b.id === target);
  const confirm = () => {
    if (!target) return;
    onConfirm(target);
    onClose();
  };

  const body = (
    <div style={styles.body}>
      <p style={styles.lead}>
        <strong style={styles.count}>{count}</strong> agent{count === 1 ? "" : "s"} selected.
      </p>
      <Field label="Move to tier">
        <Select
          value={target}
          onChange={setTarget}
          placeholder="Choose a tier…"
          ariaLabel="Destination tier"
          options={buckets.map((b) => ({ value: b.id, label: `${b.name} (${b.capMin} min)` }))}
        />
      </Field>
    </div>
  );

  return (
    <Modal
      open={open}
      onDismiss={onClose}
      title="Move agents to a tier"
      body={body}
      confirmLabel={tgt ? `Move to ${tgt.name}` : "Move"}
      onConfirm={confirm}
      cancelLabel="Cancel"
    />
  );
}

const styles = {
  body: { display: "flex", flexDirection: "column", gap: 14 },
  lead: { margin: 0, fontSize: 13, color: "var(--color-text-medium)" },
  count: { fontWeight: 700, color: "var(--color-text-deep)" },
};
