"use client";

import React from "react";
import Card from "./Card";

// StatCard — composite for icon + label + value tiles.
//
//   icon       Optional leading icon (material-symbols name or React node)
//   label      Required string
//   value      Required string or number (rendered inside a span)
//   size       "sm" (default) — 16px value, used for the 4-up DrillDetail
//              stat row.
//              "lg" — 36px value, used for the headline KPI tile
//              (TotalInteractions / Contact Center).
//   trailing   Arbitrary right-aligned slot. Common uses: chevron / external-
//              link affordance, sparkline, info icon.
//   onAction   When provided, the trailing slot becomes click-only — used
//              for chevron / external-link affordances.
//
// Re-uses the Card primitive (white, 12px radius, padding via props).
export default function StatCard({
  icon,
  label,
  value,
  size = "sm",
  trailing,
  onAction,
  ariaLabel,
}) {
  const isLarge = size === "lg";
  const padX = isLarge ? 28 : 20;
  const padY = isLarge ? 24 : 16;

  const Trailing = trailing
    ? onAction
      ? (
          <button
            type="button"
            onClick={onAction}
            aria-label={ariaLabel || `Open ${label}`}
            style={statStyles.trailingBtn}
          >
            {trailing}
          </button>
        )
      : <div style={statStyles.trailingStatic}>{trailing}</div>
    : null;

  if (isLarge) {
    return (
      <Card padX={padX} padY={padY}>
        <div style={statStyles.lgRow}>
          <div style={statStyles.lgLeft}>
            <div style={statStyles.headerRow}>
              {icon && <IconSlot icon={icon} />}
              <span style={statStyles.labelLg}>{label}</span>
            </div>
            <div style={statStyles.valueLg}>{value}</div>
          </div>
          {Trailing}
        </div>
      </Card>
    );
  }

  return (
    <Card padX={padX} padY={padY} style={statStyles.cardSm}>
      <div style={statStyles.headerRow}>
        {icon && <IconSlot icon={icon} />}
        <span style={statStyles.labelSm}>{label}</span>
        {Trailing}
      </div>
      <div style={statStyles.valueSm}>{value}</div>
    </Card>
  );
}

function IconSlot({ icon }) {
  if (typeof icon === "string") {
    return (
      <span className="material-symbols-outlined" style={statStyles.icon}>
        {icon}
      </span>
    );
  }
  return <span style={statStyles.icon}>{icon}</span>;
}

const statStyles = {
  cardSm: { display: "flex", flexDirection: "column", gap: 4 },
  headerRow: { display: "flex", alignItems: "center", gap: 8 },
  icon: {
    fontSize: 18,
    color: "var(--color-text-medium)",
    fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
    display: "inline-flex",
    alignItems: "center",
  },
  labelSm: {
    flex: 1,
    fontFamily: '"Mulish", sans-serif',
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text-medium)",
  },
  valueSm: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 16,
    fontWeight: 600,
    color: "var(--color-text-deep)",
    lineHeight: 1.4,
  },
  trailingBtn: {
    border: "none",
    background: "transparent",
    padding: 0,
    cursor: "pointer",
    color: "var(--color-text-tertiary)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  trailingStatic: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--color-text-tertiary)",
  },

  // size="lg"
  lgRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 64,
    gap: 16,
  },
  lgLeft: { display: "flex", flexDirection: "column", gap: 4 },
  labelLg: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 13,
    fontWeight: 400,
    color: "rgba(0,0,0,0.60)",
    lineHeight: 1.4,
  },
  valueLg: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 36,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    lineHeight: 1.1,
    letterSpacing: "-0.015em",
  },
};
