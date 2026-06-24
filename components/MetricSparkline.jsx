"use client";

import React from "react";
import useMeasuredWidth from "./useMeasuredWidth";

// MetricSparkline — filled-area line-chart glyph for a metric cell. The
// component stretches to fill its container's width; the parent sizes
// the slot. Height defaults to 24px (the table-cell glyph) but a taller
// `height` can be passed for card-scale charts. One monotone-cubic line
// through the aggregation buckets with a soft gradient fill underneath. No
// axes, no labels, no default dots. Hovering a vertical hit strip emphasises
// a dot at the underlying value and shows a dark tooltip with the point
// value (and an optional interval label). The parent aggregates and
// supplies `formatValue` to render values in the metric's primary format
// (`81%`, `16/20`). `fillTopOpacity` / `fillBottomOpacity` tune the gradient
// — raise the bottom stop to keep the fill visible all the way down.
const DEFAULT_HEIGHT = 24;
const PAD_X = 1.5;
const PAD_TOP = 2;
const STROKE_WIDTH = 1.5;
const DOT_RADIUS = 2;
const DOT_RING_WIDTH = 1.5;
const FILL_OPACITY_TOP = 0.24;
const FILL_OPACITY_BOTTOM = 0.04;
const GUIDE_OPACITY = 0.24;
const HOVER_FADE_MS = 80;
const TOUCH_DISMISS_MS = 3000;

// monotonePath — Fritsch-Carlson monotone cubic Hermite spline through
// points (same algorithm as d3 curveMonotoneX). Picked over curveBasis /
// curveCardinal because those overshoot peaks/troughs on tight sparkline
// swings, which would visibly disagree with the underlying values.
function monotonePath(pts) {
  const n = pts.length;
  if (n < 2) return "";
  if (n === 2) return `M${pts[0][0]},${pts[0][1]} L${pts[1][0]},${pts[1][1]}`;
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const d = [];
  for (let i = 0; i < n - 1; i += 1) {
    d[i] = (ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]);
  }
  const m = [d[0]];
  for (let i = 1; i < n - 1; i += 1) {
    if (d[i - 1] * d[i] <= 0) {
      m[i] = 0;
    } else {
      const dx0 = xs[i] - xs[i - 1];
      const dx1 = xs[i + 1] - xs[i];
      const sum = dx0 + dx1;
      m[i] = (3 * sum) / ((sum + dx1) / d[i - 1] + (sum + dx0) / d[i]);
    }
  }
  m[n - 1] = d[n - 2];
  let path = `M${xs[0]},${ys[0]}`;
  for (let i = 0; i < n - 1; i += 1) {
    const dx = (xs[i + 1] - xs[i]) / 3;
    path += ` C${xs[i] + dx},${ys[i] + m[i] * dx} ${xs[i + 1] - dx},${ys[i + 1] - m[i + 1] * dx} ${xs[i + 1]},${ys[i + 1]}`;
  }
  return path;
}

export default function MetricSparkline({
  points,
  color = "var(--chart-blue)",
  formatValue,
  labels,
  target,
  height = DEFAULT_HEIGHT,
  fillTopOpacity = FILL_OPACITY_TOP,
  fillBottomOpacity = FILL_OPACITY_BOTTOM,
  autoScale = false,
}) {
  const [containerRef, measuredWidth] = useMeasuredWidth(96);
  const width = Math.max(1, measuredWidth);
  const [hoverIdx, setHoverIdx] = React.useState(null);
  const touchTimerRef = React.useRef(null);
  const gradientId = React.useId();

  React.useEffect(() => () => {
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
  }, []);

  if (!points || points.length === 0) {
    return <span ref={containerRef} style={{ ...sparkStyles.wrap, height }} />;
  }

  const n = points.length;
  const hasTarget = typeof target === "number";
  // Zero-baseline by default (magnitude reads honestly); autoScale zooms the
  // y-domain to [min, max] of the data (and target) so high, tightly-banded
  // series still show their shape instead of flat-lining near the top.
  const domainMax = Math.max(...points, hasTarget ? target : 0) || 1;
  const domainMin = autoScale
    ? Math.min(...points, hasTarget ? target : points[0])
    : 0;
  const span = domainMax - domainMin || 1;
  const xAt =
    n === 1 ? () => width / 2 : (i) => PAD_X + (i / (n - 1)) * (width - 2 * PAD_X);
  const yAt = (v) => PAD_TOP + (1 - (v - domainMin) / span) * (height - PAD_TOP);
  const xy = points.map((v, i) => [xAt(i), yAt(v)]);

  const linePath = monotonePath(xy);
  const areaPath =
    n < 2 ? "" : `${linePath} L${xy[n - 1][0]},${height} L${xy[0][0]},${height} Z`;

  const stripWidth = n > 1 ? width / n : width;

  const handleTouch = (i) => {
    setHoverIdx(i);
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    touchTimerRef.current = setTimeout(() => setHoverIdx(null), TOUCH_DISMISS_MS);
  };

  const valueText =
    hoverIdx != null
      ? typeof formatValue === "function"
        ? formatValue(points[hoverIdx])
        : `${Math.round(points[hoverIdx])}`
      : null;
  const labelText = hoverIdx != null && labels ? labels[hoverIdx] : null;

  return (
    <span ref={containerRef} style={{ ...sparkStyles.wrap, height }}>
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        style={sparkStyles.svg}
        onMouseLeave={() => setHoverIdx(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={fillTopOpacity} />
            <stop offset="100%" stopColor={color} stopOpacity={fillBottomOpacity} />
          </linearGradient>
        </defs>

        {n >= 2 && (
          <>
            <path d={areaPath} fill={`url(#${gradientId})`} />
            <path
              d={linePath}
              fill="none"
              stroke={color}
              strokeWidth={STROKE_WIDTH}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </>
        )}

        {hasTarget && (
          <line
            x1={PAD_X}
            y1={yAt(target)}
            x2={width - PAD_X}
            y2={yAt(target)}
            stroke="var(--color-text-tertiary)"
            strokeWidth={1}
            strokeDasharray="3 3"
            opacity={0.7}
          />
        )}

        {xy.map((pt, i) => (
          <g
            key={`marker-${i}`}
            style={{
              opacity: hoverIdx === i ? 1 : 0,
              transition: `opacity ${HOVER_FADE_MS}ms ease`,
              pointerEvents: "none",
            }}
          >
            <line
              x1={pt[0]}
              y1={pt[1]}
              x2={pt[0]}
              y2={height}
              stroke={color}
              strokeOpacity={GUIDE_OPACITY}
              strokeWidth={1}
            />
            <circle
              cx={pt[0]}
              cy={pt[1]}
              r={DOT_RADIUS}
              fill={color}
              stroke="#FFFFFF"
              strokeWidth={DOT_RING_WIDTH}
            />
          </g>
        ))}

        {xy.map((pt, i) => (
          <rect
            key={`hit-${i}`}
            x={pt[0] - stripWidth / 2}
            y={0}
            width={stripWidth}
            height={height}
            fill="transparent"
            style={sparkStyles.hitStrip}
            onMouseEnter={() => setHoverIdx(i)}
            onTouchStart={(e) => {
              e.preventDefault();
              handleTouch(i);
            }}
          />
        ))}
      </svg>

      {hoverIdx != null && (
        <div
          style={{
            ...sparkStyles.tooltip,
            left: xy[hoverIdx][0],
          }}
        >
          <div>{valueText}</div>
          {labelText && <div style={sparkStyles.tooltipLabel}>{labelText}</div>}
        </div>
      )}
    </span>
  );
}

const sparkStyles = {
  wrap: {
    position: "relative",
    display: "block",
    width: "100%",
  },
  svg: {
    display: "block",
    overflow: "visible",
  },
  hitStrip: {
    pointerEvents: "all",
    cursor: "default",
  },
  tooltip: {
    position: "absolute",
    top: -6,
    transform: "translate(-50%, -100%)",
    background: "#1F2440",
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: 500,
    lineHeight: 1.2,
    padding: "6px 8px",
    borderRadius: 6,
    pointerEvents: "none",
    whiteSpace: "nowrap",
    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
    zIndex: 10,
  },
  tooltipLabel: {
    fontSize: 10,
    fontWeight: 500,
    opacity: 0.7,
    marginTop: 2,
  },
};
