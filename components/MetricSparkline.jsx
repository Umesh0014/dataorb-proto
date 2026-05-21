"use client";

import React from "react";

// MetricSparkline — a 96x24 bar-chart trend glyph for a metric cell:
// one vertical bar per aggregation bucket, no axes, labels, hover or
// tooltip. Bars are anchored to the baseline and scaled to the series
// max, so a flat metric reads flat and a growing one ascends. Completed
// bars take the trend `color`; the final bar — the current, still
// in-progress period — renders faded grey to signal it is not yet
// finalised. The parent aggregates; this component only plots.
const HEIGHT = 24;
const BAR_GAP = 2;
const BAR_RADIUS = 2;
const IN_PROGRESS = "var(--chart-grey)";
const IN_PROGRESS_OPACITY = 0.5;

// barPath — a rect with only its top two corners rounded, so the bar
// sits flush on the baseline. (x, y) is the top-left corner; the bar
// runs down to y + h.
function barPath(x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h);
  return (
    `M${x},${y + rr}` +
    `Q${x},${y} ${x + rr},${y}` +
    `L${x + w - rr},${y}` +
    `Q${x + w},${y} ${x + w},${y + rr}` +
    `L${x + w},${y + h}` +
    `L${x},${y + h}Z`
  );
}

export default function MetricSparkline({ points, width = 96, color = "var(--chart-blue)" }) {
  if (!points || points.length === 0) {
    return <svg width={width} height={HEIGHT} style={{ display: "block" }} />;
  }

  const count = points.length;
  const max = Math.max(...points) || 1;
  const barWidth = width / count - BAR_GAP;

  return (
    <svg
      width={width}
      height={HEIGHT}
      viewBox={`0 0 ${width} ${HEIGHT}`}
      style={{ display: "block" }}
    >
      {points.map((value, i) => {
        const barHeight = (value / max) * HEIGHT;
        const x = i * (barWidth + BAR_GAP);
        const inProgress = i === count - 1;
        return (
          <path
            key={i}
            d={barPath(x, HEIGHT - barHeight, barWidth, barHeight, BAR_RADIUS)}
            style={{
              fill: inProgress ? IN_PROGRESS : color,
              fillOpacity: inProgress ? IN_PROGRESS_OPACITY : 1,
            }}
          />
        );
      })}
    </svg>
  );
}
