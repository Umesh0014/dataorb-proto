"use client";

import React from "react";
import Modal from "./Modal";
import { Field, RingInput } from "./CreditsUsageParts";

// SetAllowanceModal — sets a Usage Group's weekly per-learner allowance (spec
// §6.3.3). Saving begins pacing for that group (§8.5); the over-allocation
// projection lives on the Allocation section, not here, so this modal stays a
// single focused input.
export default function SetAllowanceModal({ open, group, onClose, onSave }) {
  const [n, setN] = React.useState(10);

  const [prevOpen, setPrevOpen] = React.useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setN(group?.capMin || 10);
  }

  if (!open || !group) return null;

  const save = () => {
    onSave(group.id, n || 1);
    onClose();
  };

  const body = (
    <div style={styles.body}>
      <Field label="Weekly allowance">
        <RingInput value={n} onChange={setN} suffix="min / learner / week" ariaLabel="Minutes per learner per week" width={56} />
      </Field>
      <p style={styles.helper}>
        Each learner in this group can use up to {n} minutes of Learning Hub audio per week.
      </p>
    </div>
  );

  return (
    <Modal
      open={open}
      onDismiss={onClose}
      title={`Set weekly allowance — ${group.name}`}
      body={body}
      confirmLabel="Save"
      onConfirm={save}
      cancelLabel="Cancel"
    />
  );
}

const styles = {
  body: { display: "flex", flexDirection: "column", gap: 14 },
  helper: { margin: 0, fontSize: 13, fontWeight: 500, color: "var(--color-text-tertiary)", lineHeight: "19px" },
};
