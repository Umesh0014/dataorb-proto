"use client";

import React from "react";
import { Pencil, Check, X } from "lucide-react";
import MultiLineInput from "./MultiLineInput";

/**
 * CoachingBriefEditable — inline-editable narrative block shared by every
 * Coaching Brief variant. Read mode renders the text and a pencil hint;
 * focusing the pencil swaps to a MultiLineInput with Save / Cancel. The
 * "last updated by" footnote stays visible in both modes per INT-7.
 *
 * Props:
 *   value         current text (override or original)
 *   onChange      committed-edit handler: (next: string) => void
 *   editor        author who last touched the block, e.g. "Javier Ruiz"
 *   label         a11y label for the textarea + edit toggle
 *   placeholder   shown when value is empty
 *   max           character cap; default 1200
 *   variant       "body" (default — paragraph) | "headline" (single-line subject)
 */
export default function CoachingBriefEditable({
  value,
  onChange,
  editor,
  label,
  placeholder = "",
  max = 1200,
  variant = "body",
}) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value);
  const [hover, setHover] = React.useState(false);
  React.useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  const save = () => {
    if (draft !== value) onChange(draft);
    setEditing(false);
  };
  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  if (editing) {
    return (
      <div style={cbeStyles.frame}>
        <MultiLineInput
          value={draft}
          onChange={setDraft}
          max={max}
          placeholder={placeholder}
          rows={variant === "headline" ? 2 : 5}
        />
        <div style={cbeStyles.editorRow}>
          <span style={cbeStyles.editor}>
            Editing — last updated by {editor}
          </span>
          <div style={cbeStyles.editorActions}>
            <button
              type="button"
              onClick={cancel}
              aria-label={`Cancel editing ${label}`}
              style={cbeStyles.iconBtn}
            >
              <X size={16} color="var(--color-text-tertiary)" />
            </button>
            <button
              type="button"
              onClick={save}
              aria-label={`Save edits to ${label}`}
              style={{ ...cbeStyles.iconBtn, ...cbeStyles.iconBtnPrimary }}
            >
              <Check size={16} color="var(--color-button-primary-fg)" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={cbeStyles.frame}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {variant === "headline" ? (
        <h3 style={cbeStyles.headline}>{value || placeholder}</h3>
      ) : (
        <p style={cbeStyles.body}>{value || placeholder}</p>
      )}
      <div style={cbeStyles.editorRow}>
        <span style={cbeStyles.editor}>Last updated by {editor}</span>
        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label={`Edit ${label}`}
          style={{
            ...cbeStyles.editBtn,
            opacity: hover ? 1 : 0.6,
          }}
        >
          <Pencil size={14} color="var(--color-text-medium)" />
          <span style={cbeStyles.editBtnLabel}>Edit</span>
        </button>
      </div>
    </div>
  );
}

const cbeStyles = {
  frame: { display: "flex", flexDirection: "column", gap: 8, width: "100%" },
  body: {
    margin: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    fontWeight: 400,
    lineHeight: "22px",
    letterSpacing: "0.17px",
    color: "var(--color-text-medium)",
    whiteSpace: "pre-wrap",
  },
  headline: {
    margin: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 18,
    fontWeight: 700,
    lineHeight: "26px",
    letterSpacing: "0.1px",
    color: "var(--color-text-deep)",
    whiteSpace: "pre-wrap",
  },
  editorRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  editor: {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
    textTransform: "uppercase",
    letterSpacing: "0.1px",
  },
  editorActions: { display: "inline-flex", alignItems: "center", gap: 8 },
  editBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "4px 10px",
    background: "transparent",
    border: "1px solid var(--color-divider-card)",
    borderRadius: 999,
    cursor: "pointer",
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    fontWeight: 500,
    color: "var(--color-text-medium)",
    transition: "opacity 150ms ease, background 150ms ease",
  },
  editBtnLabel: { letterSpacing: "0.1px" },
  iconBtn: {
    width: 32,
    height: 32,
    minWidth: 32,
    borderRadius: 999,
    border: "1px solid var(--color-divider-card)",
    background: "transparent",
    cursor: "pointer",
    display: "inline-grid",
    placeItems: "center",
    transition: "background 150ms ease",
  },
  iconBtnPrimary: {
    background: "var(--color-button-primary-bg)",
    border: "1px solid var(--color-button-primary-bg)",
  },
};
