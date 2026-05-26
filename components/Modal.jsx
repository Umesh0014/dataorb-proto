"use client";

import React from "react";
import { createPortal } from "react-dom";
import Button from "./Button";

// Modal — center-screen confirmation/dialog primitive. Renders a dimmed
// scrim + a centered panel via a portal at document.body (escapes any
// ancestor stacking / overflow). Dismisses on Esc, scrim click, or the
// Cancel action. The Confirm action fires onConfirm — callers close the
// modal from their own handler (so they can run a destructive flow first).
//
// Built for the Missions Kanban delete-draft flow but designed to be the
// shared modal primitive for future destructive flows (Extend Timeline,
// Close Mission, etc.).
//
// Props:
//   open           boolean — render gates on this.
//   onDismiss      () => void — fired by Esc / scrim / Cancel.
//   title          string — modal title (16/700).
//   body           React node — descriptive copy (13/400).
//   confirmLabel   string — confirm button label. Default "Confirm".
//   confirmTone    "danger" | "primary" — danger styles the confirm button
//                  with the error palette. Default "primary".
//   cancelLabel    string — cancel button label. Default "Cancel".
//   onConfirm      () => void — fired on confirm click.
export default function Modal({
  open,
  onDismiss,
  title,
  body,
  confirmLabel = "Confirm",
  confirmTone = "primary",
  cancelLabel = "Cancel",
  onConfirm,
}) {
  // Esc dismisses while open.
  React.useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onDismiss?.();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onDismiss]);

  if (!open || typeof document === "undefined") return null;

  const confirmStyle =
    confirmTone === "danger"
      ? {
          background: "var(--color-error)",
          color: "#FFFFFF",
        }
      : undefined;

  return createPortal(
    <div style={mdStyles.scrim} onClick={onDismiss} role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : undefined}
        onClick={(e) => e.stopPropagation()}
        style={mdStyles.panel}
      >
        {title && <h2 style={mdStyles.title}>{title}</h2>}
        {body && <div style={mdStyles.body}>{body}</div>}
        <div style={mdStyles.actions}>
          <Button variant="text" uppercase={false} onClick={onDismiss}>
            {cancelLabel}
          </Button>
          <Button
            variant="primary"
            uppercase={false}
            onClick={onConfirm}
            style={confirmStyle}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

const mdStyles = {
  scrim: {
    position: "fixed",
    inset: 0,
    zIndex: 60,
    background: "rgba(15, 18, 36, 0.48)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  panel: {
    width: "min(480px, 100%)",
    maxHeight: "calc(100vh - 48px)",
    overflowY: "auto",
    background: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
    boxShadow: "var(--shadow-8)",
    fontFamily: "var(--font-sans)",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  title: {
    margin: 0,
    fontSize: 16,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    lineHeight: 1.4,
  },
  body: {
    fontSize: 13,
    fontWeight: 400,
    color: "var(--color-text-medium)",
    lineHeight: 1.5,
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
};
