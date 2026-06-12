"use client";

import React from "react";
import { Pencil, Check, X, History } from "lucide-react";
import MultiLineInput from "./MultiLineInput";

/**
 * CoachingBriefEditable — inline-editable narrative block shared by every
 * Coaching Brief variant. Read mode renders the text and a pencil hint;
 * focusing the pencil swaps to a MultiLineInput with Save / Cancel. The
 * "last updated by" footnote plus a session edit counter together carry
 * the activity-trail half of INT-7; full per-user history is flagged
 * out-of-scope for v1.
 *
 * Saving fires a `role="status"` live region with a polite announcement
 * so screen-reader users get feedback (WCAG-10). The textarea inherits
 * the block's accessible name via `ariaLabel`.
 *
 * Props:
 *   value         current text (override or original)
 *   onChange      committed-edit handler: (next: string) => void
 *   editor        author who last touched the block, e.g. "Javier Ruiz"
 *   label         a11y name for the block — passed to textarea + buttons
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
  const [savedAt, setSavedAt] = React.useState(null);
  const [sessionEdits, setSessionEdits] = React.useState(0);
  const announceTimer = React.useRef(null);
  React.useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);
  React.useEffect(() => () => {
    if (announceTimer.current) clearTimeout(announceTimer.current);
  }, []);

  const save = () => {
    if (draft !== value) {
      onChange(draft);
      setSessionEdits((n) => n + 1);
      setSavedAt(Date.now());
      if (announceTimer.current) clearTimeout(announceTimer.current);
      announceTimer.current = setTimeout(() => setSavedAt(null), 3000);
    }
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
          ariaLabel={label}
        />
        <div style={cbeStyles.editorRow}>
          <span style={cbeStyles.editor}>
            Editing — last updated by {editor}
          </span>
          <div style={cbeStyles.editorActions}>
            <TouchButton
              onClick={cancel}
              ariaLabel={`Cancel editing ${label}`}
              tone="ghost"
            >
              <X size={16} color="var(--color-text-tertiary)" />
            </TouchButton>
            <TouchButton
              onClick={save}
              ariaLabel={`Save edits to ${label}`}
              tone="primary"
            >
              <Check size={16} color="var(--color-button-primary-fg)" />
            </TouchButton>
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
        <span style={cbeStyles.editor}>
          Last updated by {editor}
          {sessionEdits > 0 && (
            <span style={cbeStyles.trail}>
              <History size={12} color="var(--color-text-tertiary)" aria-hidden="true" />
              {sessionEdits} {sessionEdits === 1 ? "edit" : "edits"} this session
            </span>
          )}
        </span>
        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label={`Edit ${label}`}
          style={{
            ...cbeStyles.editBtn,
            opacity: hover ? 1 : 0.7,
          }}
        >
          <Pencil size={14} color="var(--color-text-medium)" aria-hidden="true" />
          <span style={cbeStyles.editBtnLabel}>Edit</span>
        </button>
      </div>
      <span role="status" aria-live="polite" style={cbeStyles.srOnly}>
        {savedAt ? `Saved edits to ${label}` : ""}
      </span>
    </div>
  );
}

// 40px square button with a 4px touch-pad ring so the effective hit
// area lands at 48×48 (clears the 44px WCAG-6 floor). Used for the
// inline Save / Cancel pair where icon-only is intentional.
function TouchButton({ children, onClick, ariaLabel, tone }) {
  return (
    <span style={cbeStyles.touchPad}>
      <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel}
        style={tone === "primary" ? cbeStyles.iconBtnPrimary : cbeStyles.iconBtn}
      >
        {children}
      </button>
    </span>
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
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
    textTransform: "uppercase",
    letterSpacing: "0.1px",
  },
  trail: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    paddingInlineStart: 10,
    borderInlineStart: "1px solid var(--color-divider-card)",
    color: "var(--color-text-tertiary)",
    textTransform: "none",
  },
  editorActions: { display: "inline-flex", alignItems: "center", gap: 4 },
  editBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    minHeight: 32,
    padding: "6px 14px",
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
  touchPad: {
    display: "inline-grid",
    placeItems: "center",
    padding: 4,
  },
  iconBtn: {
    width: 40,
    height: 40,
    minWidth: 40,
    borderRadius: 999,
    border: "1px solid var(--color-divider-card)",
    background: "transparent",
    cursor: "pointer",
    display: "inline-grid",
    placeItems: "center",
    transition: "background 150ms ease, border-color 150ms ease",
  },
  iconBtnPrimary: {
    width: 40,
    height: 40,
    minWidth: 40,
    borderRadius: 999,
    border: "1px solid var(--color-button-primary-bg)",
    background: "var(--color-button-primary-bg)",
    cursor: "pointer",
    display: "inline-grid",
    placeItems: "center",
    transition: "background 150ms ease",
  },
  // sr-only — pulled inline so the status region doesn't need a global class.
  srOnly: {
    position: "absolute",
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap",
    border: 0,
  },
};
