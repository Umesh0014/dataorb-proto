"use client";

import React from "react";
import useMeasuredWidth from "./useMeasuredWidth";

// AgentImpactChart — one chart, two trend lines (QA score + CSAT, both %),
// with Learning Hub activities marked along the time axis. The story: as the
// agent completes drills, guides, replays, probes and missions, their scores
// climb — the same way the CoinMarketCap chart shows news landing on price.
// Y axis is %, X axis is time since the agent joined. Markers are focusable
// (role="img" + aria-label carries the full activity), so the detail is
// reachable by keyboard and screen reader, not hover-only.

const H = 300;
const ML = 44; // left margin — Y labels
const MR = 18;
const MT = 36; // top margin — activity pins sit here
const MB = 30; // bottom margin — X labels

const QA_COLOR = "var(--chart-green)";
const CSAT_COLOR = "var(--chart-blue)";

export default function AgentImpactChart({ data }) {
  const [wrapRef, measured] = useMeasuredWidth(720);
  const W = Math.max(360, measured);
  const [active, setActive] = React.useState(null);

  const all = [...data.qaLine, ...data.csatLine].map((p) => p.v);
  const rawMin = Math.min(...all);
  const yMin = clamp(Math.floor((rawMin - 6) / 20) * 20, 0, 80);
  const yMax = 100;
  const yTicks = [];
  for (let v = yMin; v <= yMax; v += 20) yTicks.push(v);

  const xPix = (m) => ML + (m / 12) * (W - ML - MR);
  const yPix = (v) => MT + (1 - (v - yMin) / (yMax - yMin)) * (H - MT - MB);

  const linePath = (pts) =>
    pts.map((p, i) => `${i ? "L" : "M"}${xPix(p.x).toFixed(1)},${yPix(p.v).toFixed(1)}`).join(" ");

  const activeAct = active != null ? data.activities[active] : null;

  return (
    <div ref={wrapRef} style={chartStyles.wrap}>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} role="img"
        aria-label={`QA score and CSAT over the year since ${data.firstName} joined, with Learning Hub activities marked`}>
        {/* Horizontal gridlines + Y labels (%) */}
        {yTicks.map((v) => (
          <g key={`y-${v}`}>
            <line x1={ML} y1={yPix(v)} x2={W - MR} y2={yPix(v)} stroke="var(--color-divider-card)" strokeWidth={1} />
            <text x={ML - 8} y={yPix(v) + 4} textAnchor="end" style={chartStyles.axisText}>
              {v}%
            </text>
          </g>
        ))}

        {/* X labels (months since joining) */}
        {data.ticks.map((t) => (
          <text key={`x-${t.x}`} x={xPix(t.x)} y={H - 10} textAnchor="middle" style={chartStyles.axisText}>
            {t.label}
          </text>
        ))}

        {/* Activity guide lines */}
        {data.activities.map((a, i) => (
          <line
            key={`g-${i}`}
            x1={xPix(a.x)}
            y1={MT}
            x2={xPix(a.x)}
            y2={H - MB}
            stroke="var(--grey-300)"
            strokeWidth={1}
            strokeDasharray="3 3"
            opacity={active === i ? 0.9 : 0.45}
          />
        ))}

        {/* Trend lines */}
        <path d={linePath(data.csatLine)} fill="none" stroke={CSAT_COLOR} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        <path d={linePath(data.qaLine)} fill="none" stroke={QA_COLOR} strokeWidth={2.4} strokeLinejoin="round" strokeLinecap="round" />

        {/* End-value dots */}
        <circle cx={xPix(12)} cy={yPix(data.csatEnd)} r={3.5} fill={CSAT_COLOR} stroke="#FFFFFF" strokeWidth={1.5} />
        <circle cx={xPix(12)} cy={yPix(data.qaEnd)} r={3.5} fill={QA_COLOR} stroke="#FFFFFF" strokeWidth={1.5} />

        {/* Activity pins */}
        {data.activities.map((a, i) => {
          const cx = xPix(a.x);
          const on = active === i;
          return (
            <g
              key={`p-${i}`}
              tabIndex={0}
              role="img"
              aria-label={`${a.title}, ${a.date}`}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive((c) => (c === i ? null : c))}
              onFocus={() => setActive(i)}
              onBlur={() => setActive((c) => (c === i ? null : c))}
              style={chartStyles.pinGroup}
            >
              {on && <circle cx={cx} cy={16} r={14} fill="none" stroke="var(--do-brand-blue)" strokeWidth={2} />}
              <circle cx={cx} cy={16} r={11} fill="var(--grey-800)" />
              <text x={cx} y={20} textAnchor="middle" style={chartStyles.pinText}>
                {a.code}
              </text>
            </g>
          );
        })}
      </svg>

      {activeAct && (
        <div
          style={{
            ...chartStyles.tooltip,
            left: clamp(xPix(activeAct.x), 70, W - 70),
          }}
        >
          <div style={chartStyles.ttTitle}>{activeAct.title}</div>
          <div style={chartStyles.ttDate}>{activeAct.date}</div>
        </div>
      )}
    </div>
  );
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

const chartStyles = {
  wrap: { position: "relative", width: "100%" },
  axisText: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 11,
    fontWeight: 600,
    fill: "var(--color-text-tertiary)",
  },
  pinGroup: { cursor: "default", outline: "none" },
  pinText: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 11,
    fontWeight: 800,
    fill: "#FFFFFF",
  },
  tooltip: {
    position: "absolute",
    top: 34,
    transform: "translateX(-50%)",
    background: "var(--do-ink)",
    color: "#FFFFFF",
    padding: "8px 12px",
    borderRadius: 8,
    boxShadow: "var(--shadow-8)",
    pointerEvents: "none",
    whiteSpace: "nowrap",
    zIndex: 5,
  },
  ttTitle: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 12,
    fontWeight: 700,
    lineHeight: 1.3,
  },
  ttDate: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 11,
    fontWeight: 500,
    color: "rgba(255,255,255,0.72)",
    marginTop: 2,
  },
};
