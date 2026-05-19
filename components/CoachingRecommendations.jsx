"use client";

import React from "react";
import Card from "./Card";
import InlineNBA from "./InlineNBA";
import TabsRow from "./TabsRow";
import TrendArrow from "./TrendArrow";
import AllRecommendationsTable from "./AllRecommendationsTable";
import useMeasuredWidth from "./useMeasuredWidth";
import { INLINE_NBA } from "./mocks/nextBestActions";

// Seed data for the Top recommendations tab. Each item:
//   id     string
//   name   string             — coaching topic
//   count  number             — sessions where this was recommended
//   trend  "up" | "down"      — direction of count vs. the previous period
const topCoachingRecommendations = [
  { id: "1", name: "Resolution and expectations", count: 10, trend: "up" },
  { id: "2", name: "Acknowledgment statements", count: 8, trend: "up" },
  { id: "3", name: "Correct silence handling", count: 7, trend: "up" },
  { id: "4", name: "Interaction opening", count: 6, trend: "down" },
  { id: "5", name: "Options and benefits", count: 4, trend: "up" },
  { id: "6", name: "Interaction closing", count: 3, trend: "up" },
  { id: "7", name: "Assurance statements", count: 2, trend: "down" },
  { id: "8", name: "Positive outlook", count: 2, trend: "down" },
  { id: "9", name: "Explore needs", count: 2, trend: "up" },
  { id: "10", name: "Upsell attempt", count: 2, trend: "down" },
];

const TABS = [
  { id: "top", label: "Top recommendations" },
  { id: "all", label: "All recommendations" },
];

// Fixed treemap region height — structural. The codebase has no height
// token scale; a treemap needs an explicit height to lay tiles into.
const TREEMAP_HEIGHT = 440;

// Gap between adjacent treemap tiles.
const TILE_GAP = 8;

// CoachingRecommendations — interior of the Agent Profile "Coaching
// recommendations" card: title + subtitle, two sub-tabs, and a treemap of
// coaching topics on the Top recommendations tab. Self-contained <Card>,
// mirroring AdherenceCard and the other DataOrb metric cards.
export default function CoachingRecommendations({
  recommendations = topCoachingRecommendations,
  onNbaAssign,
}) {
  const [tab, setTab] = React.useState("top");

  return (
    <Card>
      <div style={crStyles.title}>Coaching recommendations</div>
      <div style={crStyles.subtitle}>
        Evaluate performance across quality metrics.
      </div>

      <InlineNBA
        text={INLINE_NBA.coaching.text}
        ctaLabel={INLINE_NBA.coaching.ctaLabel}
        onAction={() =>
          onNbaAssign?.({
            name: INLINE_NBA.coaching.asset,
            duration: INLINE_NBA.coaching.duration,
          })
        }
      />

      <div style={crStyles.tabs}>
        <TabsRow tabs={TABS} activeTab={tab} onTabClick={setTab} />
      </div>

      {tab === "top" ? (
        <Treemap items={recommendations} />
      ) : (
        <AllRecommendationsTable />
      )}
    </Card>
  );
}

// Treemap — area-proportional tile layout. Width is measured so tiles lay
// out in real pixels; height is fixed.
function Treemap({ items }) {
  const [ref, width] = useMeasuredWidth(0);

  // TODO: confirm treemap sizing — tile area maps directly to `count` here,
  // not to a normalized weight.
  const sorted = [...items].sort((a, b) => b.count - a.count);
  const tiles =
    width > 0
      ? layoutTreemap(
          sorted.map((it) => ({ item: it, value: it.count })),
          0,
          0,
          width,
          TREEMAP_HEIGHT
        )
      : [];

  return (
    <div ref={ref} style={{ ...crStyles.treemap, height: TREEMAP_HEIGHT }}>
      {tiles.map(({ item, rect }) => (
        <Tile key={item.id} item={item} rect={rect} />
      ))}
    </div>
  );
}

// Tile — one coaching topic, sized and positioned by the treemap layout.
function Tile({ item, rect }) {
  const [hover, setHover] = React.useState(false);
  const isUp = item.trend === "up";
  // TODO: confirm trend semantics with Akash — up-arrow / red = "more
  // sessions flagging this topic" (worse for the agent); down-arrow /
  // green = fewer flags (better). Flip the colour mapping if reversed.
  const trendColor = isUp ? "var(--color-error)" : "var(--color-success)";

  return (
    <button
      type="button"
      // Native tooltip surfaces the full name when the label truncates.
      // TODO: confirm whether a richer hover tooltip is wanted instead.
      title={item.name}
      onClick={() => {
        // TODO: drill into coaching topic detail
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...crStyles.tile,
        left: rect.x + TILE_GAP / 2,
        top: rect.y + TILE_GAP / 2,
        width: Math.max(0, rect.w - TILE_GAP),
        height: Math.max(0, rect.h - TILE_GAP),
        boxShadow: hover ? "var(--shadow-1)" : "none",
      }}
    >
      <span style={crStyles.tileName}>{item.name}</span>
      <span style={{ ...crStyles.tileTrend, color: trendColor }}>
        <TrendArrow up={isUp} size={14} />
        {item.count}
      </span>
    </button>
  );
}

// layoutTreemap — recursive binary-partition treemap (the algorithm d3's
// treemapBinary uses). `nodes` is [{ item, value }]; returns
// [{ item, rect: { x, y, w, h } }] with tile area proportional to value.
function layoutTreemap(nodes, x, y, w, h) {
  if (nodes.length === 0) return [];
  if (nodes.length === 1) {
    return [{ item: nodes[0].item, rect: { x, y, w, h } }];
  }

  const total = nodes.reduce((sum, n) => sum + n.value, 0);

  // Split into two contiguous groups whose left cumulative value is as
  // close to half the total as possible.
  let bestDiff = Infinity;
  let splitIdx = 1;
  let leftValue = nodes[0].value;
  let running = 0;
  for (let i = 0; i < nodes.length - 1; i++) {
    running += nodes[i].value;
    const diff = Math.abs(running - total / 2);
    if (diff < bestDiff) {
      bestDiff = diff;
      splitIdx = i + 1;
      leftValue = running;
    }
  }

  const left = nodes.slice(0, splitIdx);
  const right = nodes.slice(splitIdx);
  const frac = leftValue / total;

  if (w >= h) {
    const lw = w * frac;
    return [
      ...layoutTreemap(left, x, y, lw, h),
      ...layoutTreemap(right, x + lw, y, w - lw, h),
    ];
  }
  const lh = h * frac;
  return [
    ...layoutTreemap(left, x, y, w, lh),
    ...layoutTreemap(right, x, y + lh, w, h - lh),
  ];
}

const crStyles = {
  title: {
    fontSize: 16,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    lineHeight: 1.4,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: 400,
    color: "var(--text-secondary)",
    lineHeight: 1.4,
  },
  tabs: {
    marginTop: 16,
  },
  treemap: {
    position: "relative",
    width: "100%",
    marginTop: 16,
  },
  tile: {
    position: "absolute",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
    padding: 16,
    background: "var(--surface-alt)",
    borderRadius: "var(--radius-md)",
    border: "none",
    cursor: "pointer",
    overflow: "hidden",
    textAlign: "left",
    boxSizing: "border-box",
    transition: "box-shadow 120ms ease",
  },
  tileName: {
    width: "100%",
    fontSize: 14,
    fontWeight: 600,
    color: "var(--color-text-deep)",
    lineHeight: 1.35,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  tileTrend: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    fontSize: 14,
    fontWeight: 700,
  },
};
