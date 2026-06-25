"use client";

import React from "react";
import { gwCategoryMeta, gwStatusMeta, gwAvatarTone } from "../mocks/guidedWorkflowDrivers";

// Shared atoms for the Guided Workflow browse surface (landing / detail /
// reasons). Each composes existing tokens — no new color system, no
// restyle of a shared primitive. Used at ≥3 callsites, so they earn a
// shared home rather than being inlined per page.

// CategoryChip — the uppercase lane tag (service / complaint / tech support
// / retention / sales). Color always paired with the text label.
export function CategoryChip({ category }) {
  const meta = gwCategoryMeta(category);
  return (
    <span style={{ ...partStyles.category, background: meta.bg, color: meta.fg }}>
      {meta.label}
    </span>
  );
}

// WorkflowStatusPill — Active (green dot) / Draft (amber dot). The dot
// inherits the pill foreground so color never stands alone.
export function WorkflowStatusPill({ status }) {
  const meta = gwStatusMeta(status);
  const tone = meta.tone === "success"
    ? { bg: "var(--color-success-bg)", fg: "var(--color-success-text)" }
    : { bg: "var(--color-warning-bg)", fg: "var(--color-warning-text)" };
  return (
    <span style={{ ...partStyles.pill, background: tone.bg, color: tone.fg }}>
      <span style={{ ...partStyles.dot, background: meta.dot }} />
      {meta.label}
    </span>
  );
}

// UnpublishedPill — the amber "Unpublished changes" flag shown beside an
// Active workflow that has edits not yet published.
export function UnpublishedPill() {
  return (
    <span style={{ ...partStyles.pill, background: "var(--color-warning-bg)", color: "var(--color-warning-text)" }}>
      <span style={{ ...partStyles.dot, background: "var(--color-warning)" }} />
      Unpublished changes
    </span>
  );
}

// Monogram — initials avatar tile in a tone-keyed pastel circle.
export function Monogram({ initials, tone, size = 40 }) {
  const t = gwAvatarTone(tone);
  return (
    <span
      style={{
        ...partStyles.monogram,
        width: size,
        height: size,
        fontSize: Math.round(size * 0.34),
        background: t.bg,
        color: t.fg,
      }}
    >
      {initials}
    </span>
  );
}

const partStyles = {
  category: {
    display: "inline-flex",
    alignItems: "center",
    padding: "3px 8px",
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    fontFamily: "var(--font-sans)",
  },
  pill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "3px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: "nowrap",
    fontFamily: "var(--font-sans)",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    flexShrink: 0,
  },
  monogram: {
    display: "inline-grid",
    placeItems: "center",
    borderRadius: 999,
    fontWeight: 700,
    flexShrink: 0,
    fontFamily: "var(--font-sans)",
  },
};
