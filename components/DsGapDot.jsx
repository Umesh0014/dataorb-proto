"use client";

import React from "react";

// DsGapDot — a lemon-green "notification" circle that flags a component which
// is NOT in the 2.0 Design System (a gap where a real DS component still needs
// to be created). On hover it explains: the closest DS component you CAN use or
// modify, and why it can't be used as-is. Used in B10 so DS holes are explicit.
export const DS_GAP_GREEN = "#C6F000";

export default function DsGapDot({ component = "Custom component", closest, why, size = 12, style }) {
  const [open, setOpen] = React.useState(false);
  return (
    <span
      style={{ ...wrap, ...style }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <span style={dot} aria-label={`Design-system gap: ${component}`} />
      {open && (
        <span style={tip} role="tooltip">
          <span style={tipHead}><span style={tipHeadDot} />Design-system gap</span>
          <span style={tipName}>{component}</span>
          {closest && (
            <span style={tipRow}><span style={tipLabel}>Use / modify</span>{closest}</span>
          )}
          {why && (
            <span style={tipRow}><span style={tipLabel}>Why not as-is</span>{why}</span>
          )}
        </span>
      )}
    </span>
  );
}

const FONT = "'Poppins', sans-serif";
const wrap = { position: "absolute", top: -5, right: -5, width: 12, height: 12, zIndex: 6 };
const dot = {
  display: "block", width: "100%", height: "100%", borderRadius: 999,
  background: DS_GAP_GREEN, border: "2px solid #FFFFFF", cursor: "help",
  boxShadow: "0 0 0 1px rgba(0,0,0,0.06), 0 0 7px rgba(198,240,0,0.85)",
};
const tip = {
  position: "absolute", top: 18, right: 0, width: 248, display: "flex", flexDirection: "column", gap: 6,
  background: "#1F2024", color: "#F5F5F5", borderRadius: 10, padding: "10px 12px",
  boxShadow: "0 12px 28px rgba(0,0,0,0.35)", zIndex: 50, fontFamily: FONT, textAlign: "left",
  whiteSpace: "normal", lineHeight: 1.45, pointerEvents: "none",
};
const tipHead = { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10, fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase", color: "#C6F000" };
const tipHeadDot = { width: 7, height: 7, borderRadius: 999, background: DS_GAP_GREEN, flexShrink: 0 };
const tipName = { fontSize: 13, fontWeight: 600, color: "#FFFFFF" };
const tipRow = { fontSize: 12, color: "#D4D4D8", display: "flex", flexDirection: "column", gap: 1 };
const tipLabel = { fontSize: 10, fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase", color: "#8C90A6" };
