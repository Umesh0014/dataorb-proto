"use client";

import React from "react";
import { X } from "lucide-react";

// Toast — bottom-left ephemeral notification. Currently used for the
// post-publish success confirmation on the Missions landing page.
//
// Props:
//   tone        "success" (default) | "info" | "warning" | "danger"
//   message     string
//   onDismiss   () => void
//   autoDismissMs?  number — when supplied, the toast auto-closes after
//                   this many ms via the parent's onDismiss callback.
//
// Auto-dismiss is owned by the parent (timer + visibility state). This
// component only renders + provides the manual close affordance.
//
// TODO: stories

const TONE_BG = {
  success: "var(--color-success)",
  info:    "var(--color-info)",
  warning: "var(--color-warning)",
  danger:  "var(--color-error)",
};

export default function Toast({ tone = "success", message, onDismiss }) {
  return (
    <div style={wrapStyle}>
      <div style={{ ...innerStyle, background: TONE_BG[tone] || TONE_BG.success }}>
        <span style={textStyle}>{message}</span>
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
