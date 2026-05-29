"use client";

import React from "react";
import { createPortal } from "react-dom";
import { ArrowRight } from "lucide-react";
import Button from "./Button";

// CreateDriverModal — Roleplay Driver authoring dialog. Renders inside a
// portal so the scrim covers the full viewport. Two required fields with
// inline character counters (name 60, description 500). The primary
// "Create" button stays disabled until both fields carry at least one
// non-whitespace character — matches the Figma empty + filled states.
//
// The dialog uses the same scrim + panel chrome as PublishGuideModal;
// promote to a shared Dialog primitive when a 3rd authoring modal needs
// the same shell (Modal.jsx covers destructive confirms but lacks form
// support).

const NAME_MAX = 60;
const DESC_MAX = 500;

export default function CreateDriverModal({ open, onClose, onCreate }) {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const dialogRef = React.useRef(null);

  // Reset form fields each time the modal opens fresh.
  React.useEffect(() => {
    if (!open) return undefined;
    setName("");
    setDescription("");
    const handler = (e) => { if (e.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  React.useEffect(() => {
    if (open && dialogRef.current) dialogRef.current.focus();
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  const trimmedName = name.trim();
  const trimmedDesc = description.trim();
  const canCreate = trimmedName.length > 0 && trimmedDesc.length > 0;

  const handleScrimClick = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  const handleCreate = () => {
    if (!canCreate) return;
    onCreate?.({ name: trimmedName, description: trimmedDesc });
  };

  return createPortal(
    <div role="presentation" style={styles.scrim} onClick={handleScrimClick}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-driver-title"
        aria-describedby="create-driver-desc"
        tabIndex={-1}
        style={styles.dialog}
      >
        <div style={styles.headerBlock}>
          <h2 id="create-driver-title" style={styles.title}>Create Drivers</h2>
          <p id="create-driver-desc" style={styles.subtitle}>
            [Description goes here]
          </p>
        </div>

        <div style={styles.field}>
          <label htmlFor="create-driver-name" style={styles.label}>
            Driver name
            <span style={styles.required} aria-hidden="true">*</span>
          </label>
          <div style={styles.inputWrap}>
            <input
              id="create-driver-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, NAME_MAX))}
              placeholder="E.g. Member Acquisition"
              style={styles.input}
            />
            <span style={styles.counter}>{name.length}/{NAME_MAX}</span>
          </div>
        </div>

        <div style={styles.field}>
          <label htmlFor="create-driver-desc-input" style={styles.label}>
            Driver description
            <span style={styles.required} aria-hidden="true">*</span>
          </label>
          <div style={{ ...styles.inputWrap, alignItems: "flex-start" }}>
            <textarea
              id="create-driver-desc-input"
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, DESC_MAX))}
              placeholder="E.g. Outbound recruitment of new socios from cold, warm, event, and emergency-campaign leads"
              rows={2}
              style={styles.textarea}
            />
            <span style={{ ...styles.counter, paddingTop: 8 }}>
              {description.length}/{DESC_MAX}
            </span>
          </div>
        </div>

        <div style={styles.actions}>
          <Button variant="text" uppercase={false} onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            uppercase={false}
            disabled={!canCreate}
            trailingIcon={<ArrowRight size={16} />}
            onClick={handleCreate}
          >
            Create
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

const styles = {
  scrim: {
    position: "fixed",
    inset: 0,
    zIndex: 60,
    background: "rgba(27, 27, 31, 0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  dialog: {
    width: "min(520px, 100%)",
    background: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
    boxShadow: "0 24px 64px rgba(27, 27, 31, 0.24)",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    fontFamily: "var(--font-sans)",
    outline: "none",
  },
  headerBlock: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  title: {
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    lineHeight: 1.3,
  },
  subtitle: {
    margin: 0,
    fontSize: 12,
    fontWeight: 400,
    color: "var(--color-text-tertiary)",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--color-text-deep)",
  },
  required: {
    color: "var(--color-error)",
    marginLeft: 2,
  },
  inputWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    border: "1px solid var(--color-border-card-soft)",
    borderRadius: 8,
    padding: "0 12px",
    background: "#FFFFFF",
    transition: "border-color 120ms ease",
  },
  input: {
    flex: 1,
    minWidth: 0,
    appearance: "none",
    border: "none",
    outline: "none",
    padding: "10px 0",
    background: "transparent",
    fontFamily: "inherit",
    fontSize: 13,
    fontWeight: 400,
    color: "var(--color-text-deep)",
  },
  textarea: {
    flex: 1,
    minWidth: 0,
    appearance: "none",
    border: "none",
    outline: "none",
    padding: "10px 0",
    background: "transparent",
    fontFamily: "inherit",
    fontSize: 13,
    fontWeight: 400,
    color: "var(--color-text-deep)",
    resize: "vertical",
    minHeight: 56,
    lineHeight: 1.5,
  },
  counter: {
    fontSize: 11,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
    fontVariantNumeric: "tabular-nums",
    flexShrink: 0,
  },
  actions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
    paddingTop: 4,
  },
};
