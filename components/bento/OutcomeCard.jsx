"use client";

import React from "react";
import { ArrowUpRight, ArrowDownRight, Pin } from "lucide-react";
import KebabMenu from "../KebabMenu";
import MetricSparkline from "../MetricSparkline";
import { OUTCOME_MONTHS } from "../mocks/outcomes";

/**
 * OutcomeCard — a single outcome tile for the Outcomes bento grid.
 *
 * Orientation follows the tile's span (set by the grid via `data` order):
 *   - "wide" : metric block left, sparkline right (landscape).
 *   - "tall" : sparkline top, metric block bottom (portrait).
 * Both carry the same parts — name + current value + delta, a compact trend
 * line, and a kebab (Pin/Unpin · Archive · Delete) pinned top-right. The
 * adjacent value + delta label the sparkline, so the trend never stands alone.
 * Pinned tiles show a small pin affordance beside the name.
 *
 * @param {{
 *   outcome: {
 *     id: string, name: string, value: string,
 *     delta: { value: string, dir: "up" | "down", good: boolean },
 *     series: number[], accent: string, span: "wide" | "tall",
 *     pinned: boolean, archived: boolean,
 *   },
 *   onTogglePin: (id: string) => void,
 *   onArchive: (id: string) => void,
 *   onRequestDelete: (id: string) => void,
 * }} props
 */
export default function OutcomeCard({ outcome, onTogglePin, onArchive, onRequestDelete }) {
  const { id, name, value, delta, series, accent, span, pinned, archived } = outcome;
  const isWide = span === "wide";

  const menuItems = [
    { label: pinned ? "Unpin" : "Pin", onClick: () => onTogglePin(id) },
    { label: archived ? "Unarchive" : "Archive", onClick: () => onArchive(id) },
    { label: "Delete", onClick: () => onRequestDelete(id) },
  ];

  const metric = (
    <div style={c.metric}>
      <div style={c.nameRow}>
        {pinned && <Pin size={13} color={accent} fill={accent} aria-label="Pinned" />}
        <span style={c.name}>{name}</span>
      </div>
      <div style={c.valueRow}>
        <span style={c.value}>{value}</span>
        <DeltaPill delta={delta} />
      </div>
    </div>
  );

  const spark = (
    <div style={isWide ? c.sparkWide : c.sparkTall}>
      <MetricSparkline
        points={series}
        labels={OUTCOME_MONTHS}
        color={accent}
        formatValue={(v) => `${value.includes("%") ? `${Math.round(v)}%` : Math.round(v)}`}
      />
    </div>
  );

  return (
    <div style={{ ...c.tile, ...(isWide ? c.wide : c.tall) }}>
      <div style={c.kebab}>
        <KebabMenu ariaLabel={`${name} actions`} items={menuItems} />
      </div>
      {isWide ? (
        <div style={c.wideBody}>
          {metric}
          {spark}
        </div>
      ) : (
        <div style={c.tallBody}>
          {spark}
          {metric}
        </div>
      )}
    </div>
  );
}

function DeltaPill({ delta }) {
  const color = delta.good ? "var(--color-success)" : "var(--color-error)";
  const Arrow = delta.dir === "up" ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      style={{ ...c.pill, color, background: `color-mix(in srgb, ${color} 14%, var(--surface-white))` }}
    >
      <Arrow size={13} color={color} />
      {delta.value}
    </span>
  );
}

const c = {
  tile: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    padding: 18,
    borderRadius: 16,
    background: "var(--surface-white)",
    border: "1px solid var(--color-divider-card)",
    fontFamily: "var(--font-sans)",
    overflow: "hidden",
  },
  wide: { gridColumn: "span 2" },
  tall: { gridColumn: "span 1" },

  kebab: {
    position: "absolute",
    top: 8,
    right: 8,
  },

  wideBody: {
    flex: 1,
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 16,
  },
  tallBody: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: 16,
  },

  metric: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    minWidth: 0,
  },
  nameRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    paddingRight: 28,
  },
  name: {
    fontSize: 14,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  valueRow: {
    display: "flex",
    alignItems: "baseline",
    gap: 10,
  },
  value: {
    fontSize: 32,
    fontWeight: 800,
    lineHeight: 1,
    color: "var(--color-text-deep)",
    fontVariantNumeric: "tabular-nums",
  },
  pill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 2,
    height: 24,
    paddingInline: 8,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 700,
    flexShrink: 0,
    fontVariantNumeric: "tabular-nums",
  },

  sparkWide: { width: 160, flexShrink: 0 },
  sparkTall: { width: "100%", marginTop: 4 },
};
