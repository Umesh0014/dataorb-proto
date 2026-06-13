"use client";

import React from "react";
import { X } from "lucide-react";

// Toast — bottom-left ephemeral notification. Used for the post-publish
// success confirmation on the Missions landing page and the post-delete
// Undo affordance on the Kanban delete-draft flow.
//
// Props:
//   tone        "success" (default) | "info" | "warning" | "danger"
//   message     string
//   action?     { label, onClick } — renders an inline action button
//               between the message and the close X (used for "Undo").
//   onDismiss   () => void
//
// Auto-dismiss is owned by the parent (timer + visibility state). This
// component renders + exposes manual close + the optional action.
//
// TODO: stories

const TONE_BG = {
  success: "var(--color-success)",
  info:    "var(--color-info)",
  warning: "var(--color-warning)",
  danger:  "var(--color-error)",
};

export default function Toast({ tone = "success", message, action, onDismiss }) {
  return (
    <div style={wrapStyle} role="status" aria-live="polite">
      <div style={{ ...innerStyle, background: TONE_BG[tone] || TONE_BG.success }}>
        <span style={textStyle}>{message}</span>
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            style={actionStyle}
          >
            {action.label}
          </button>
        )}
        <button type="button" onClick={onDismiss} style={closeStyle} aria-label="Dismiss">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

const wrapStyle = {
  position: "fixed",
  bottom: 24,
  left: 88,
  zIndex: 50,
};
const innerStyle = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  color: "#FFFFFF",
  borderRadius: 8,
  padding: "12px 16px",
  boxShadow: "var(--shadow-8)",
  maxWidth: 480,
};
const textStyle = {
  fontFamily: "var(--font-sans)",
  fontSize: 14,
  fontWeight: 500,
  flex: 1,
};
const actionStyle = {
  background: "transparent",
  border: "none",
  color: "#FFFFFF",
  cursor: "pointer",
  padding: "4px 8px",
  borderRadius: 4,
  fontFamily: "var(--font-sans)",
  fontSize: 13,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  flexShrink: 0,
};
const closeStyle = {
  background: "transparent",
  border: "none",
  color: "#FFFFFF",
  cursor: "pointer",
  padding: 0,
  display: "inline-flex",
  alignItems: "center",
  flexShrink: 0,
};
