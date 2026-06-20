/* eslint-disable no-restricted-syntax --
   Each bento tile is a full clickable surface (varied-size metric tile),
   not a Button.jsx pill/icon/text shape — same precedent as MiraLandingDeck
   and VersionBar. Raw <button> keeps the whole tile one accessible target. */
"use client";

import React from "react";
import { ChevronRight } from "lucide-react";
import MetricSparkline from "./MetricSparkline";
import { LANDING_METRICS, TREND_MONTHS } from "./mocks/miraLandingMetrics";

const byId = (id) => LANDING_METRICS.find((m) => m.id === id);

/**
 * MiraMetricsBento — the bento-grid metric layout for the "Bento" landing
 * direction. Five tiles of mixed size (one feature, one wide, two compact,
 * one full-width banner) carry a faint accent wash, an accent-colored trend
 * line, and a soft shadow for depth. Each tile opens the metric detail.
 *
 * @param {{ onSelect: (id: string) => void }} props
 */
export default function MiraMetricsBento({ onSelect }) {
  return (
    <div style={b.grid}>
      <FeatureTile metric={byId("interactions")} onSelect={onSelect} />
      <WideTile metric={byId("sentiment")} onSelect={onSelect} />
      <CompactTile metric={byId("resolution")} onSelect={onSelect} />
      <CompactTile metric={byId("churn")} onSelect={onSelect} />
      <BannerTile metric={byId("reasons")} onSelect={onSelect} />
    </div>
  );
}

function useHover() {
  const [hovered, setHovered] = React.useState(false);
  const bind = {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
  };
  return [hovered, bind];
}

function tileStyle(accent, hovered, span) {
  return {
    ...b.tile,
    ...span,
    background: `color-mix(in srgb, ${accent} 7%, var(--surface-white))`,
    borderColor: hovered ? `color-mix(in srgb, ${accent} 50%, var(--color-divider-card))` : "var(--color-divider-card)",
    boxShadow: hovered ? "var(--shadow-8)" : "var(--shadow-card)",
  };
}

function Head({ metric, hovered }) {
  const { Icon, label, accent } = metric;
  return (
    <div style={b.head}>
      <span
        style={{ ...b.iconWrap, background: `color-mix(in srgb, ${accent} 18%, var(--surface-white))` }}
        aria-hidden="true"
      >
        <Icon size={16} color={accent} />
      </span>
      <span style={b.label}>{label}</span>
      <ChevronRight
        size={16}
        color="var(--color-text-tertiary)"
        style={{ opacity: hovered ? 1 : 0, transition: "opacity 120ms ease" }}
      />
    </div>
  );
}

function spark(metric) {
  return (
    <MetricSparkline
      points={metric.trend}
      target={metric.target}
      labels={TREND_MONTHS}
      color={metric.accent}
      formatValue={(v) => `${Math.round(v)}${metric.unit || ""}`}
    />
  );
}

function FeatureTile({ metric, onSelect }) {
  const [hovered, bind] = useHover();
  const headline = metric.rows[0];
  return (
    <button
      type="button"
      {...bind}
      onClick={() => onSelect(metric.id)}
      aria-label={`Open ${metric.label} report`}
      style={tileStyle(metric.accent, hovered, b.feature)}
    >
      <Head metric={metric} hovered={hovered} />
      <div style={b.featureValueRow}>
        <span style={b.bigValue}>{headline.value}</span>
        <span style={b.bigValueLabel}>{headline.label}</span>
      </div>
      <div style={b.featureChart}>{spark(metric)}</div>
      <div style={b.miniRows}>
        {metric.rows.slice(1).map((r) => (
          <div key={r.label} style={b.miniRow}>
            <span style={b.miniLabel}>{r.label}</span>
            <span style={b.miniValue}>{r.value}</span>
          </div>
        ))}
      </div>
    </button>
  );
}

function WideTile({ metric, onSelect }) {
  const [hovered, bind] = useHover();
  return (
    <button
      type="button"
      {...bind}
      onClick={() => onSelect(metric.id)}
      aria-label={`Open ${metric.label} report`}
      style={tileStyle(metric.accent, hovered, b.wide)}
    >
      <Head metric={metric} hovered={hovered} />
      <div style={b.wideBody}>
        <div style={b.statRow}>
          {metric.rows.map((r) => (
            <div key={r.label} style={b.stat}>
              <span style={{ ...b.statValue, ...toneStyle(r.tone) }}>{r.value}</span>
              <span style={b.statLabel}>{r.label}</span>
            </div>
          ))}
        </div>
        <div style={b.wideChart}>{spark(metric)}</div>
      </div>
    </button>
  );
}

function CompactTile({ metric, onSelect }) {
  const [hovered, bind] = useHover();
  const headline = metric.rows[0];
  return (
    <button
      type="button"
      {...bind}
      onClick={() => onSelect(metric.id)}
      aria-label={`Open ${metric.label} report`}
      style={tileStyle(metric.accent, hovered, b.compact)}
    >
      <Head metric={metric} hovered={hovered} />
      <div style={b.compactValueRow}>
        <span style={{ ...b.bigValue, ...toneStyle(headline.tone) }}>{headline.value}</span>
        <span style={b.bigValueLabel}>{headline.label}</span>
      </div>
      <div style={b.compactChart}>{spark(metric)}</div>
    </button>
  );
}

function BannerTile({ metric, onSelect }) {
  const [hovered, bind] = useHover();
  return (
    <button
      type="button"
      {...bind}
      onClick={() => onSelect(metric.id)}
      aria-label={`Open ${metric.label} report`}
      style={tileStyle(metric.accent, hovered, b.banner)}
    >
      <div style={b.bannerLeft}>
        <Head metric={metric} hovered={hovered} />
      </div>
      <div style={b.bannerRows}>
        {metric.rows.map((r) => (
          <div key={r.label} style={b.bannerStat}>
            <span style={b.bannerValue}>{r.value}</span>
            <span style={b.bannerLabel}>{r.label}</span>
          </div>
        ))}
      </div>
    </button>
  );
}

function toneStyle(tone) {
  if (tone === "positive") return { color: "var(--color-success)" };
  if (tone === "negative") return { color: "var(--color-error)" };
  return null;
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
    borderRadius: 16,
    border: "1px solid var(--color-divider-card)",
    cursor: "pointer",
    fontFamily: "var(--font-sans)",
    transition: "box-shadow 140ms ease, border-color 140ms ease",
    overflow: "hidden",
  },
  feature: { gridColumn: "span 2", gridRow: "span 2" },
  wide: { gridColumn: "span 2" },
  compact: { gridColumn: "span 1" },
  banner: {
    gridColumn: "1 / -1",
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },

  head: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
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
    color: "var(--color-text-deep)",
  },

  bigValue: {
    fontSize: 34,
    fontWeight: 800,
    lineHeight: 1,
    color: "var(--color-text-deep)",
    fontVariantNumeric: "tabular-nums",
  },
  bigValueLabel: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
  },

  featureValueRow: {
    display: "flex",
    alignItems: "baseline",
    gap: 8,
    marginTop: 4,
  },
  featureChart: {
    marginTop: "auto",
  },
  miniRows: {
    display: "flex",
    gap: 20,
  },
  miniRow: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  miniLabel: {
    fontSize: 11,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
  },
  miniValue: {
    fontSize: 14,
    fontWeight: 700,
    color: "var(--color-text-medium)",
    fontVariantNumeric: "tabular-nums",
  },

  wideBody: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 16,
    marginTop: "auto",
  },
  statRow: {
    display: "flex",
    gap: 18,
  },
  stat: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 800,
    color: "var(--color-text-deep)",
    fontVariantNumeric: "tabular-nums",
  },
  statLabel: {
    fontSize: 12,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
  },
  wideChart: {
    width: 120,
    flexShrink: 0,
  },

  compactValueRow: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    marginTop: 2,
  },
  compactChart: {
    marginTop: "auto",
  },

  bannerLeft: {
    width: 220,
    flexShrink: 0,
  },
  bannerRows: {
    flex: 1,
    display: "flex",
    gap: 32,
  },
  bannerStat: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  bannerValue: {
    fontSize: 22,
    fontWeight: 800,
    color: "var(--color-text-deep)",
    fontVariantNumeric: "tabular-nums",
  },
  bannerLabel: {
    fontSize: 12,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
  },
};
