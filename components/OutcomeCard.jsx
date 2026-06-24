/* eslint-disable no-restricted-syntax --
   The card is one drill-in surface with an independent kebab menu. Nested
   <button>s are invalid HTML, so a full-card transparent <button> (the drill-in
   target) sits beneath the content and the kebab is a separate sibling <button>
   on top — same "clickable tile" precedent as MiraMetricsBento, kept accessible.
   Neither is a Button.jsx pill/icon/text shape. */
"use client";

import React from "react";
import { MoreHorizontal, Pin, Archive, Trash2 } from "lucide-react";
import Card from "./Card";
import MetricSparkline from "./MetricSparkline";
import KebabMenu from "./KebabMenu";

// Period axis for the trend. Readings map 1:1 to the last twelve months; the
// peak month is tagged in its hover tooltip ("Peak · Mar").
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/**
 * OutcomeCard — the single metric card for the Ask Mira Pro Outcomes landing.
 *
 * Visual language borrowed from the Transactions reference card: title + kebab
 * on top, an oversized value bottom-left, a sparkline area trend line of the
 * trend across the middle, and a "vs last period" delta on the right. Hovering
 * the sparkline reveals each month's value; the peak point reads "Peak · {mo}"
 * so the line is never an unexplained number (Neil's labelling rule).
 *
 * Colour is driven by the delta SIGN, not by above/below target (Jun 9 rule):
 * deltaPp >= 0 → success, else danger — applied to both the delta and the
 * sparkline stroke. Delta is labelled in `pp` (percentage points) per house
 * standard, not the mock's "pts".
 *
 * @param {{
 *   outcome: {
 *     title: string, value: number, target: number,
 *     goalPct: number, deltaPp: number, trend: number[],
 *   },
 *   onClick?: () => void,
 * }} props
 */
export default function OutcomeCard({ outcome, onClick }) {
  const [hovered, setHovered] = React.useState(false);
  const { title, value, target, goalPct, deltaPp, trend } = outcome;

  const positive = deltaPp >= 0;
  const accent = positive ? "var(--color-success)" : "var(--color-error)";

  // Tag the peak point so its hover tooltip reads "Peak · {month}".
  const peakIdx = trend.indexOf(Math.max(...trend));
  const labels = trend.map((_, i) => {
    const mo = MONTHS[i] ?? `P${i + 1}`;
    return i === peakIdx ? `Peak · ${mo}` : mo;
  });

  return (
    <div
      style={ocStyles.wrap}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Card
        tone="outline"
        padX={24}
        padY={20}
        style={{
          ...ocStyles.card,
          boxShadow: hovered ? "var(--shadow-8)" : "var(--shadow-card)",
          transform: hovered ? "translateY(-2px)" : "none",
        }}
      >
        {/* Full-card drill-in target — sits beneath the content so the whole
            card is one keyboard-focusable click, minus the kebab and the
            sparkline (which captures hover for its tooltip). */}
        <button
          type="button"
          onClick={onClick}
          aria-label={`Open ${title} outcome`}
          style={ocStyles.overlay}
        />

        <div style={ocStyles.head}>
          <span style={ocStyles.title}>{title}</span>
          <span style={ocStyles.kebabSlot}>
            <KebabMenu
              ariaLabel={`${title} outcome options`}
              glyph={<MoreHorizontal size={16} />}
              triggerStyle={ocStyles.kebabTrigger}
              items={[
                { label: "Pin", icon: <Pin size={16} />, onClick: () => {
                  // TODO: pin outcome (next ticket)
                } },
                { label: "Archive", icon: <Archive size={16} />, onClick: () => {
                  // TODO: archive outcome (next ticket)
                } },
                { label: "Delete", icon: <Trash2 size={16} />, tone: "danger", onClick: () => {
                  // TODO: delete outcome (next ticket)
                } },
              ]}
            />
          </span>
        </div>

        <div style={ocStyles.body}>
          <div style={ocStyles.valueBlock}>
            <div style={ocStyles.value}>
              {value}
              <span style={ocStyles.unit}>%</span>
            </div>
            <span style={ocStyles.goalBadge}>{goalPct}% of goal</span>
            <span style={ocStyles.target}>target {target}%</span>
          </div>

          <div style={ocStyles.chartWrap}>
            <MetricSparkline
              points={trend}
              color={accent}
              target={target}
              labels={labels}
              formatValue={(v) => `${Math.round(v)}%`}
              height={56}
              fillTopOpacity={0.32}
              fillBottomOpacity={0.12}
            />
          </div>

          <div style={ocStyles.deltaBlock}>
            <span style={ocStyles.vsLabel}>vs last period</span>
            <span style={{ ...ocStyles.delta, color: accent }}>
              {positive ? "+" : ""}
              {deltaPp} pp
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}

const ocStyles = {
  wrap: {
    display: "block",
    width: "100%",
    height: "100%",
    fontFamily: "var(--font-sans)",
  },
  card: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: 20,
    height: "100%",
    transition: "box-shadow 140ms ease, transform 140ms ease",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    appearance: "none",
    border: "none",
    background: "transparent",
    borderRadius: "inherit",
    cursor: "pointer",
    padding: 0,
    zIndex: 0,
  },

  head: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    pointerEvents: "none",
  },
  title: {
    fontSize: 15,
    fontWeight: 600,
    color: "var(--color-text-deep)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  // Re-enables pointer events for the menu trigger inside the (otherwise
  // click-through) head, so it works without firing the card's drill-in.
  kebabSlot: {
    pointerEvents: "auto",
    display: "inline-flex",
    flexShrink: 0,
  },
  // Restyles KebabMenu's trigger to the reference's circular bordered kebab.
  kebabTrigger: {
    width: 28,
    height: 28,
    padding: 0,
    borderRadius: 999,
    border: "1px solid var(--color-divider-card)",
    background: "var(--surface-white)",
    color: "var(--color-text-tertiary)",
  },

  body: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    alignItems: "center",
    gap: 28,
    pointerEvents: "none",
  },
  valueBlock: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    flexShrink: 0,
  },
  value: {
    display: "flex",
    alignItems: "baseline",
    gap: 1,
    fontSize: 40,
    fontWeight: 800,
    lineHeight: 1,
    color: "var(--color-text-deep)",
    fontVariantNumeric: "tabular-nums",
  },
  unit: {
    fontSize: 20,
    fontWeight: 700,
    color: "var(--color-text-tertiary)",
  },
  goalBadge: {
    alignSelf: "flex-start",
    display: "inline-flex",
    alignItems: "center",
    height: 22,
    paddingInline: 8,
    borderRadius: 6,
    background: "var(--badge-amber-bg)",
    color: "var(--badge-amber)",
    fontSize: 12,
    fontWeight: 700,
    fontVariantNumeric: "tabular-nums",
  },
  target: {
    fontSize: 12,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
    fontVariantNumeric: "tabular-nums",
  },

  // Captures hover so the sparkline tooltip works; clicks here don't drill in
  // (the rest of the card does). Flex-fills the widened card.
  chartWrap: {
    flex: 1,
    minWidth: 0,
    pointerEvents: "auto",
  },

  deltaBlock: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 4,
    flexShrink: 0,
    textAlign: "right",
  },
  vsLabel: {
    fontSize: 12,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
  },
  delta: {
    fontSize: 18,
    fontWeight: 800,
    fontVariantNumeric: "tabular-nums",
  },
};
