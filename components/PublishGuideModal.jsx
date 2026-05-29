"use client";

import React from "react";
import { createPortal } from "react-dom";
import { Crown, Headphones, ArrowRight } from "lucide-react";
import Button from "./Button";

// PublishGuideModal — final confirmation step in Create Guide.
//
// Two release modes (single-select radio group):
//   • "calibration" — private trial; default selection
//   • "publish"     — live to agents
//
// Net-new primitive: no Modal/RadioCard exist in the library yet.
// Built inline here using existing design tokens; promote when a second
// modal lands. Portal-rendered so the scrim covers the full viewport
// regardless of where the wizard mounts. Esc + scrim-click dismiss.

export const PUBLISH_MODES = [
  {
    id: "calibration",
    title: "Start Calibration",
    body:  "Try the guide yourself before agents see it. Run sessions, edit, refine — as many times as needed. Calibration is hidden from agents and won't affect their metrics.",
    cta:   "Start Calibration",
  },
  {
    id: "publish",
    title: "Publish to Agents",
    body:  "The guide goes live to your team. Agents can start immediately, and their interaction feed your dashboards.",
    cta:   "Publish To Agents",
  },
];

export default function PublishGuideModal({ open, onClose, onConfirm }) {
  const [selected, setSelected] = React.useState("calibration");
  const dialogRef = React.useRef(null);

  // Esc dismisses; reset selection each time the modal re-opens so the
  // default ("Start Calibration") is sticky per spec §3.3.
  React.useEffect(() => {
    if (!open) return;
    setSelected("calibration");
    const handler = (e) => { if (e.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Initial focus on the active dialog for screen readers + Esc handler.
  React.useEffect(() => {
    if (open && dialogRef.current) dialogRef.current.focus();
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  const activeMode = PUBLISH_MODES.find((m) => m.id === selected) || PUBLISH_MODES[0];

  const handleScrimClick = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  return createPortal(
    <div role="presentation" style={styles.scrim} onClick={handleScrimClick}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="publish-guide-title"
        aria-describedby="publish-guide-desc"
        tabIndex={-1}
        style={styles.dialog}
      >
        <div style={styles.headerBlock}>
          <div style={styles.textBlock}>
            <h2 id="publish-guide-title" style={styles.title}>Publish Guide</h2>
            <p id="publish-guide-desc" style={styles.subtitle}>
              Choose how this persona is released. Once it goes live to agents, the persona locks — create a new version to iterate further.
            </p>
          </div>

          <div style={styles.cardsRow}>
            {PUBLISH_MODES.map((mode) => (
              <ModeCard
                key={mode.id}
                mode={mode}
                selected={selected === mode.id}
                onSelect={() => setSelected(mode.id)}
              />
            ))}
          </div>
        </div>

        <div style={styles.footer}>
          <button type="button" onClick={onClose} style={styles.cancelBtn}>
            Cancel
          </button>
          <Button
            variant="primary"
            uppercase={false}
            onClick={() => onConfirm?.(activeMode.id)}
            trailingIcon={<ArrowRight size={14} />}
            style={{ height: 34, minWidth: 0, paddingInline: 16 }}
          >
            {activeMode.cta}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ---- ModeCard ----------------------------------------------------------

function ModeCard({ mode, selected, onSelect }) {
  const Icon = mode.id === "calibration" ? Crown : Headphones;
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      style={{
        ...styles.modeCard,
        background: selected ? "#FCFBFF" : "#FFFFFF",
        borderColor: selected ? "var(--color-icon-tertiary-fg)" : "var(--color-border-card-soft)",
        boxShadow: selected ? "0 2px 4px rgba(69, 70, 79, 0.15)" : "none",
      }}
    >
      <div style={styles.modeHeader}>
        <span style={styles.modeHeaderLeft}>
          <Icon size={16} color={selected ? "var(--color-icon-tertiary-fg)" : "var(--color-text-tertiary)"} />
          <span style={styles.modeTitle}>{mode.title}</span>
        </span>
        <Radio checked={selected} />
      </div>
      <p style={styles.modeBody}>{mode.body}</p>
    </button>
  );
}

function Radio({ checked }) {
  return (
    <span
      aria-hidden="true"
      style={{
        ...styles.radioOuter,
        borderColor: checked ? "var(--color-button-primary-bg)" : "var(--color-text-tertiary)",
      }}
    >
      {checked && <span style={styles.radioInner} />}
    </span>
  );
}

// ---- Styles ------------------------------------------------------------

const styles = {
  scrim: {
    position: "fixed", inset: 0,
    background: "rgba(27, 27, 31, 0.5)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: 24,
    zIndex: 1000,
  },
  dialog: {
    width: "100%", maxWidth: 800,
    background: "#FFFFFF", borderRadius: 8,
    display: "flex", flexDirection: "column", gap: 24,
    padding: 0,
    outline: "none",
    boxShadow: "0 12px 24px rgba(27, 27, 31, 0.18)",
  },

  // Header block
  headerBlock: {
    display: "flex", flexDirection: "column", gap: 24,
    padding: "24px 24px 0",
  },
  textBlock: { display: "flex", flexDirection: "column", gap: 8 },
  title: {
    margin: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 20, fontWeight: 500, lineHeight: "32px", letterSpacing: "0.15px",
    color: "var(--color-text-medium)",
  },
  subtitle: {
    margin: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 14, fontWeight: 400, lineHeight: "20px", letterSpacing: "0.17px",
    color: "var(--color-text-tertiary)",
  },

  // Mode card row
  cardsRow: { display: "flex", gap: 24, alignItems: "stretch" },
  modeCard: {
    flex: 1, minWidth: 0,
    display: "flex", flexDirection: "column", gap: 16,
    padding: 24,
    border: "1px solid var(--color-border-card-soft)",
    borderRadius: 8,
    background: "#FFFFFF",
    textAlign: "left",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "background 120ms ease, border-color 120ms ease, box-shadow 120ms ease",
  },
  modeHeader: {
    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
    paddingBottom: 12,
    borderBottom: "1px solid #E2E8F0",
  },
  modeHeaderLeft: { display: "inline-flex", alignItems: "center", gap: 8 },
  modeTitle: {
    fontFamily: "var(--font-sans)",
    fontSize: 14, fontWeight: 500, lineHeight: "22px", letterSpacing: "0.1px",
    color: "var(--color-text-deep)",
  },
  modeBody: {
    margin: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 12, fontWeight: 400, lineHeight: "20px", letterSpacing: "0.4px",
    color: "var(--color-text-tertiary)",
  },

  // Radio
  radioOuter: {
    width: 16, height: 16, borderRadius: 999,
    border: "1.5px solid",
    display: "inline-grid", placeItems: "center",
    flexShrink: 0,
    background: "transparent",
  },
  radioInner: {
    width: 8, height: 8, borderRadius: 999,
    background: "var(--color-button-primary-bg)",
  },

  // Footer
  footer: {
    display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 24,
    padding: "16px 20px",
    background: "#FFFFFF",
    borderBottomLeftRadius: 8, borderBottomRightRadius: 8,
  },
  cancelBtn: {
    appearance: "none", background: "transparent", border: "none",
    padding: "0 12px", height: 34, cursor: "pointer",
    fontFamily: "var(--font-sans)",
    fontSize: 14, fontWeight: 500, letterSpacing: "0.4px",
    color: "var(--color-text-medium)",
    textTransform: "capitalize",
  },
};
