/* eslint-disable no-restricted-syntax --
   Each bento tile is a full clickable surface (varied-size metric tile), not
   a Button.jsx pill/icon/text shape — same precedent as MiraLandingDeck and
   VersionBar. Raw <button> keeps the whole tile one accessible target. */
"use client";

import React from "react";
import { ChevronRight, ArrowUpRight, ArrowDownRight } from "lucide-react";
import MetricSparkline from "./MetricSparkline";
import InteractionsBarChart, { INTERACTIONS_SERIES } from "./InteractionsBarChart";
import { LANDING_METRICS, TREND_MONTHS } from "./mocks/miraLandingMetrics";

const byId = (id) => LANDING_METRICS.find((m) => m.id === id);

/**
 * MiraMetricsBento — bento-grid metric layout for the "Bento" direction.
 *
 * Borrows the inspiration's structure within DataOrb tokens: white tiles of
 * mixed size (the accent only colors the icon, charts, dots, and change pill),
 * an oversized hero number, month-over-month change pills, and a list-style
 * tile. The Interactions hero carries a Calls-vs-WhatsApp bar chart (recharts);
 * the other tiles use trend sparklines. Five tiles; each opens the detail.
 *
 * @param {{ onSelect: (id: string) => void }} props
 */
export default function MiraMetricsBento({ onSelect }) {
  return (
    <div style={b.grid}>
      <HeroTile metric={byId("interactions")} onSelect={onSelect} />
      <ListTile metric={byId("reasons")} onSelect={onSelect} />
      <SentimentTile metric={byId("sentiment")} onSelect={onSelect} />
      <CompactTile metric={byId("resolution")} onSelect={onSelect} />
      <CompactTile metric={byId("churn")} onSelect={onSelect} />
    </div>
  );
}

// palette — every tile is a white card; the accent only colors the icon,
// the trend line, dots, and the change pill (no filled tiles). Text stays on
// DataOrb's standard ink tokens.
function palette(accent) {
  return {
    title: "var(--color-text-deep)",
    value: "var(--color-text-deep)",
    sub: "var(--color-text-tertiary)",
    iconBg: `color-mix(in srgb, ${accent} 16%, var(--surface-white))`,
    iconFg: accent,
    spark: accent,
  };
}

const TONE_COLOR = {
  positive: "var(--color-success)",
  negative: "var(--color-error)",
  neutral: "var(--chart-grey)",
};

function toneColor(tone) {
  return TONE_COLOR[tone] || "var(--color-text-deep)";
}

function useHover() {
  const [hovered, setHovered] = React.useState(false);
  return [hovered, { onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false) }];
}

// Shared button-shell style for every tile: fill from the palette, lift on
// hover. Each archetype renders its own <button> (explicit composition) so
// there's no render-prop indirection.
function tileShell(hovered, span) {
  return {
    ...b.tile,
    ...span,
    boxShadow: hovered ? "var(--shadow-8)" : "var(--shadow-card)",
    transform: hovered ? "translateY(-2px)" : "none",
  };
}

function Head({ metric, p, hovered, chevron = true }) {
  const { Icon, label } = metric;
  return (
    <div style={b.head}>
      <span style={{ ...b.iconWrap, background: p.iconBg }} aria-hidden="true">
        <Icon size={16} color={p.iconFg} />
      </span>
      <span style={{ ...b.label, color: p.title }}>{label}</span>
      {chevron && (
        <ChevronRight
          size={16}
          color={p.sub}
          style={{ opacity: hovered ? 1 : 0, transition: "opacity 120ms ease" }}
        />
      )}
    </div>
  );
}

function ChangePill({ change }) {
  const color = change.good ? "var(--color-success)" : "var(--color-error)";
  const Arrow = change.dir === "up" ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      style={{ ...b.pill, color, background: `color-mix(in srgb, ${color} 14%, var(--surface-white))` }}
    >
      <Arrow size={13} color={color} />
      {change.value}
    </span>
  );
}

function spark(metric, color) {
  return (
    <MetricSparkline
      points={metric.trend}
      target={metric.target}
      labels={TREND_MONTHS}
      color={color}
      formatValue={(v) => `${Math.round(v)}${metric.unit || ""}`}
    />
  );
}

function HeroTile({ metric, onSelect }) {
  const [hovered, bind] = useHover();
  const p = palette(metric.accent);
  const headline = metric.rows[0];
  return (
    <button
      type="button"
      {...bind}
      onClick={() => onSelect(metric.id)}
      aria-label={`Open ${metric.label} report`}
      style={tileShell(hovered,b.feature)}
    >
      <div style={b.headRow}>
        <Head metric={metric} p={p} hovered={hovered} chevron={false} />
        <ChangePill change={metric.change} />
      </div>
      <div style={b.heroValueRow}>
        <span style={{ ...b.heroValue, color: p.value }}>{headline.value}</span>
        <span style={{ ...b.heroValueLabel, color: p.sub }}>{headline.label}</span>
      </div>
      <div style={b.heroChart}>
        <InteractionsBarChart data={metric.bars} />
      </div>
      <div style={b.legend}>
        {metric.rows.slice(1).map((r, i) => (
          <div key={r.label} style={b.legendItem}>
            <span
              style={{ ...b.legendDot, background: INTERACTIONS_SERIES[i].color }}
              aria-hidden="true"
            />
            <span style={{ ...b.legendLabel, color: p.sub }}>{r.label}</span>
            <span style={{ ...b.legendValue, color: p.value }}>{r.value}</span>
          </div>
        ))}
      </div>
    </button>
  );
}

function ListTile({ metric, onSelect }) {
  const [hovered, bind] = useHover();
  const p = palette(metric.accent);
  return (
    <button
      type="button"
      {...bind}
      onClick={() => onSelect(metric.id)}
      aria-label={`Open ${metric.label} report`}
      style={tileShell(hovered,b.feature)}
    >
      <div style={b.headRow}>
        <Head metric={metric} p={p} hovered={hovered} chevron={false} />
        <ChangePill change={metric.change} />
      </div>
      <div style={b.list}>
        {metric.rows.map((r) => (
          <div key={r.label} style={b.listRow}>
            <span style={{ ...b.listDot, background: metric.accent }} aria-hidden="true" />
            <span style={b.listLabel}>{r.label}</span>
            <span style={b.listValue}>{r.value}</span>
          </div>
        ))}
      </div>
    </button>
  );
}

function SentimentTile({ metric, onSelect }) {
  const [hovered, bind] = useHover();
  const p = palette(metric.accent);
  return (
    <button
      type="button"
      {...bind}
      onClick={() => onSelect(metric.id)}
      aria-label={`Open ${metric.label} report`}
      style={tileShell(hovered,b.wide)}
    >
      <div style={b.headRow}>
        <Head metric={metric} p={p} hovered={hovered} chevron={false} />
        <ChangePill change={metric.change} />
      </div>
      <div style={b.wideBody}>
        <div style={b.statRow}>
          {metric.rows.map((r) => (
            <div key={r.label} style={b.stat}>
              <span style={{ ...b.statValue, color: toneColor(r.tone) }}>{r.value}</span>
              <span style={b.statLabelRow}>
                <span
                  style={{ ...b.statDot, background: toneColor(r.tone) }}
                  aria-hidden="true"
                />
                <span style={{ ...b.statLabel, color: p.sub }}>{r.label}</span>
              </span>
            </div>
          ))}
        </div>
        <div style={b.wideChart}>{spark(metric, p.spark)}</div>
      </div>
    </button>
  );
}

function CompactTile({ metric, onSelect }) {
  const [hovered, bind] = useHover();
  const p = palette(metric.accent);
  const headline = metric.rows[0];
  return (
    <button
      type="button"
      {...bind}
      onClick={() => onSelect(metric.id)}
      aria-label={`Open ${metric.label} report`}
      style={tileShell(hovered,b.compact)}
    >
      <Head metric={metric} p={p} hovered={hovered} />
      <div style={b.compactValueRow}>
        <span style={{ ...b.compactValue, color: toneColor(headline.tone) }}>{headline.value}</span>
        <ChangePill change={metric.change} />
      </div>
      <div style={b.compactChart}>{spark(metric, p.spark)}</div>
    </button>
  );
}

const b = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gridAutoRows: 150,
    gap: 16,
    gridAutoFlow: "row dense",
  },

  tile: {
    appearance: "none",
    textAlign: "left",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    padding: 18,
    borderRadius: 18,
    background: "var(--surface-white)",
    border: "1px solid var(--color-divider-card)",
    cursor: "pointer",
    fontFamily: "var(--font-sans)",
    transition: "box-shadow 140ms ease, transform 140ms ease",
    overflow: "hidden",
  },
  feature: { gridColumn: "span 2", gridRow: "span 2" },
  wide: { gridColumn: "span 2" },
  compact: { gridColumn: "span 1" },

  head: { display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 },
  headRow: { display: "flex", alignItems: "center", gap: 8 },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 9,
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
  },
  label: {
    flex: 1,
    fontSize: 14,
    fontWeight: 700,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
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

  heroValueRow: { display: "flex", alignItems: "baseline", gap: 8, marginTop: 6 },
  heroValue: { fontSize: 44, fontWeight: 800, lineHeight: 1, fontVariantNumeric: "tabular-nums" },
  heroValueLabel: { fontSize: 13, fontWeight: 500 },
  heroChart: { marginTop: "auto" },
  legend: { display: "flex", gap: 20, flexWrap: "wrap" },
  legendItem: { display: "inline-flex", alignItems: "center", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 2, flexShrink: 0 },
  legendLabel: { fontSize: 12, fontWeight: 500 },
  legendValue: { fontSize: 14, fontWeight: 700, fontVariantNumeric: "tabular-nums" },

  list: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: 4,
    flex: 1,
    marginTop: 4,
  },
  listRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 0",
    borderBottom: "1px solid var(--color-divider-card)",
  },
  listDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  listLabel: { flex: 1, fontSize: 13, fontWeight: 600, color: "var(--color-text-medium)" },
  listValue: {
    fontSize: 14,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    fontVariantNumeric: "tabular-nums",
  },

  wideBody: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 16,
    marginTop: "auto",
  },
  statRow: { display: "flex", gap: 18 },
  stat: { display: "flex", flexDirection: "column", gap: 4 },
  statValue: { fontSize: 20, fontWeight: 800, fontVariantNumeric: "tabular-nums" },
  statLabelRow: { display: "inline-flex", alignItems: "center", gap: 5 },
  statDot: { width: 7, height: 7, borderRadius: 4, flexShrink: 0 },
  statLabel: { fontSize: 12, fontWeight: 500 },
  wideChart: { width: 120, flexShrink: 0 },

  compactValueRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 2,
  },
  compactValue: { fontSize: 26, fontWeight: 800, fontVariantNumeric: "tabular-nums" },
  compactChart: { marginTop: "auto" },
};
