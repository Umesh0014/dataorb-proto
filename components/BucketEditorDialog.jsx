"use client";

import React from "react";
import { Plus, Pencil } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";
import BucketCard from "./BucketCard";
import { Field, RingInput } from "./CreditsUsageParts";

// BucketEditorDialog — the C6b editable tier strip. Tiers render as the
// read-only BucketCard; clicking one opens the Edit dialog, and the "Add tier"
// tile opens the Add dialog (up to MAX_BUCKETS). All name/cap editing happens
// in the dialog, never inline. `vertical` stacks the tiers in a column (C7,
// optimised for up to 10) instead of the wrapping row. The page owns the
// buckets state + the agent reassignment on remove; this drives onEdit /
// onAdd / onRemove.
const FOCUS_RING = "0 0 0 2px #FFFFFF, 0 0 0 4px var(--do-brand-blue)";

export default function BucketEditorDialog({
  buckets,
  vertical = false,
  maxBuckets = 5,
  selectedId,
  onSelect,
  onEdit,
  onAdd,
  onRemove,
}) {
  // null = closed; otherwise { bucket } where bucket is the tier to edit or
  // null for the add flow.
  const [dialog, setDialog] = React.useState(null);

  // Clicking a card selects the tier (the table shows its agents); the pencil is
  // the separate edit affordance.
  const cards = buckets.map((b) => (
    <div key={b.id} style={vertical ? styles.colItem : styles.rowItem}>
      <BucketCard bucket={b} interactive selected={b.id === selectedId} onClick={() => onSelect(b.id)} />
      <button
        type="button"
        style={styles.editBtn}
        aria-label={`Edit ${b.name}`}
        onClick={(e) => {
          e.stopPropagation();
          setDialog({ bucket: b });
        }}
      >
        <Pencil size={14} />
      </button>
    </div>
  ));
  const addControl =
    buckets.length < maxBuckets ? (
      <button type="button" onClick={() => setDialog({ bucket: null })} style={vertical ? styles.addBar : styles.addTile}>
        <Plus size={18} />
        <span style={styles.addLabel}>Add tier</span>
      </button>
    ) : null;

  // Vertical (rail) caps to the agent-list height: cards scroll, the Add bar
  // floats pinned at the bottom. The wrapping row keeps everything inline.
  return (
    <div style={vertical ? styles.col : styles.row}>
      {vertical ? (
        <>
          <div style={styles.colScroll}>{cards}</div>
          {addControl}
        </>
      ) : (
        <>
          {cards}
          {addControl}
        </>
      )}

      <BucketDialog
        open={dialog !== null}
        bucket={dialog?.bucket || null}
        canRemove={buckets.length > 1}
        onClose={() => setDialog(null)}
        onSave={(patch) => (dialog?.bucket ? onEdit(dialog.bucket.id, patch) : onAdd(patch))}
        onRemove={onRemove}
      />
    </div>
  );
}

function BucketDialog({ open, bucket, canRemove, onClose, onSave, onRemove }) {
  const isEdit = Boolean(bucket);
  const [name, setName] = React.useState("");
  const [cap, setCap] = React.useState(30);
  const [nameFocus, setNameFocus] = React.useState(false);

  // Seed the draft from the tier (or the add defaults) each time it opens.
  const [prevOpen, setPrevOpen] = React.useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setName(bucket?.name || "");
      setCap(bucket?.capMin || 30);
    }
  }

  if (!open) return null;

  const save = () => {
    onSave({ name: name.trim() || "New tier", capMin: cap || 30 });
    onClose();
  };
  const remove = () => {
    onRemove(bucket.id);
    onClose();
  };

  const body = (
    <div style={styles.form}>
      <Field label="Tier name">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onFocus={() => setNameFocus(true)}
          onBlur={() => setNameFocus(false)}
          aria-label="Tier name"
          placeholder="e.g. Momentum"
          style={{
            ...styles.nameInput,
            borderColor: nameFocus ? "var(--do-brand-blue)" : "var(--color-border-card-soft)",
            boxShadow: nameFocus ? FOCUS_RING : "none",
          }}
        />
      </Field>
      <Field label="Weekly cap">
        <RingInput value={cap} onChange={setCap} suffix="min / week" ariaLabel="Weekly cap in minutes" width={72} />
      </Field>
      {isEdit && (
        <div style={styles.removeRow}>
          <Button
            variant="text"
            uppercase={false}
            disabled={!canRemove}
            onClick={remove}
            style={{ paddingInline: 0, color: canRemove ? "var(--color-error)" : undefined }}
          >
            Remove tier
          </Button>
          {!canRemove && <span style={styles.removeHint}>Keep at least one tier.</span>}
        </div>
      )}
    </div>
  );

  return (
    <Modal
      open={open}
      onDismiss={onClose}
      title={isEdit ? `Edit ${bucket.name}` : "Add tier"}
      body={body}
      confirmLabel={isEdit ? "Save changes" : "Add tier"}
      onConfirm={save}
      cancelLabel="Cancel"
    />
  );
}

const styles = {
  row: { display: "flex", gap: 12, alignItems: "stretch", flexWrap: "wrap" },
  col: { display: "flex", flexDirection: "column", gap: 8, height: "100%", minHeight: 0 },
  colScroll: { display: "flex", flexDirection: "column", gap: 8, flex: 1, minHeight: 0, overflowY: "auto", paddingRight: 4 },
  colItem: { position: "relative", display: "flex" },
  rowItem: { position: "relative", display: "flex", flex: "1 1 180px", minWidth: 180 },
  editBtn: {
    position: "absolute",
    bottom: 10,
    insetInlineEnd: 10,
    width: 26,
    height: 26,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid var(--color-border-card-soft)",
    borderRadius: 6,
    background: "#FFFFFF",
    color: "var(--color-text-tertiary)",
    cursor: "pointer",
    zIndex: 1,
    transition: "color 120ms ease, border-color 120ms ease",
  },

  addBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    flexShrink: 0,
    padding: "12px 16px",
    border: "1.5px dashed var(--color-divider-card)",
    borderRadius: 12,
    background: "transparent",
    color: "var(--color-text-tertiary)",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "border-color 120ms ease, color 120ms ease",
  },

  addTile: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    flex: "1 1 140px",
    minWidth: 140,
    padding: "14px 16px",
    border: "1.5px dashed var(--color-divider-card)",
    borderRadius: 12,
    background: "transparent",
    color: "var(--color-text-tertiary)",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "border-color 120ms ease, color 120ms ease",
  },
  addLabel: { fontSize: 13, fontWeight: 600 },

  form: { display: "flex", flexDirection: "column", gap: 16 },
  nameInput: {
    width: "100%",
    maxWidth: 320,
    padding: "8px 12px",
    border: "1px solid var(--color-border-card-soft)",
    borderRadius: 8,
    background: "#FFFFFF",
    fontFamily: "inherit",
    fontSize: 14,
    fontWeight: 500,
    color: "var(--color-text-deep)",
    outline: "none",
    boxSizing: "border-box",
    transition: "box-shadow 120ms ease, border-color 120ms ease",
  },
  removeRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
    paddingTop: 12,
    borderTop: "1px solid var(--color-border-card-soft)",
  },
  removeHint: { fontSize: 12, color: "var(--color-text-tertiary)" },
};
