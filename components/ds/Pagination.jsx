"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TYPE, COLORS } from "../designTokens";

// DS · Pagination — "Total N <unit>" on the left, "‹ Previous  x/y  Next ›" text
// links on the right (Previous grey, Next blue). Matches the live DataOrb app.
export default function Pagination({ total, unit = "items", page, pages, onPrev, onNext }) {
  const atStart = page <= 1;
  const atEnd = page >= pages;
  return (
    <div style={s.row}>
      <span style={s.info}>Total {total} {unit}</span>
      <div style={s.nav}>
        <button type="button" style={{ ...s.link, ...(atStart ? s.off : null) }} disabled={atStart} onClick={onPrev}>
          <ChevronLeft size={16} /> Previous
        </button>
        <span style={s.num}>{page}/{pages}</span>
        <button type="button" style={{ ...s.link, ...(atEnd ? s.off : s.on) }} disabled={atEnd} onClick={onNext}>
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

const s = {
  row: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, borderTop: `1px solid ${COLORS.divider}`, paddingTop: 12 },
  info: { ...TYPE.bodySmall, color: COLORS.textMedium },
  nav: { display: "flex", alignItems: "center", gap: 14 },
  link: { ...TYPE.labelLarge, display: "inline-flex", alignItems: "center", gap: 4, border: "none", background: "none", cursor: "pointer", padding: 0, color: COLORS.textMedium },
  on: { color: COLORS.primary },
  off: { color: COLORS.textFaint, cursor: "default" },
  num: { ...TYPE.labelLarge, color: COLORS.textBody },
};
