"use client";

import React from "react";
import { Search } from "lucide-react";
import useMeasuredWidth from "./useMeasuredWidth";
import { ReplayIcon, GuideIcon, DrillIcon, MissionsIcon } from "./SideNav/icons";

// AgentImpactChart — two trend lines (QA score + CSAT, both %) with Learning
// Hub activities pinned along the x-axis. Interaction borrows from Robinhood:
// the x-axis carries no date ticks (only the activity pins), and scrubbing the
// chart drops a vertical tracking line with the date above it, moves a dot
// along each line, and reports the scrubbed point up via `onScrub` so the
// headline QA/CSAT numbers change live. Pins are focusable (role="img" +
// aria-label), so activity detail is reachable by keyboard and screen reader.

const H = 300;
const ML = 46;
const MR = 18;
const MT = 30;
const MB = 22;
const PLOT_BOTTOM = H - MB;
const PIN_CY = PLOT_BOTTOM - 13;

const QA_COLOR = "var(--chart-green)";
const CSAT_COLOR = "var(--chart-blue)";

const KIND_ICONS = { Replay: ReplayIcon, Guide: GuideIcon, Drill: DrillIcon, Mission: MissionsIcon };

// ActivityIcon — reuses the existing module icons for replay / guide / drill /
// mission; probe has no house icon, so a lucide magnifier stands in.
export function ActivityIcon({ kind, color = "#FFFFFF", size = 14 }) {
  if (kind === "Probe") return <Search size={size - 1} color={color} />;
  const Ic = KIND_ICONS[kind];
  return Ic ? <Ic size={size} color={color} /> : null;
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

export default function AgentImpactChart({ data, onScrub }) {
  const [wrapRef, measured] = useMeasuredWidth(720);
  const W = Math.max(360, measured);
  const [hoverIdx, setHoverIdx] = React.useState(null);
  const [marker, setMarker] = React.useState(null);

  const series = data.series;
  const N = series.length;
  const { xMin, xMax } = data;

  const all = series.flatMap((p) => [p.qa, p.csat]);
  const yMin = clamp(Math.floor((Math.min(...all) - 6) / 20) * 20, 0, 80);
  const yMax = 100;
  const yTicks = [];
  for (let v = yMin; v <= yMax; v += 20) yTicks.push(v);

  const xPix = (m) => ML + ((m - xMin) / (xMax - xMin)) * (W - ML - MR);
  const yPix = (v) => MT + (1 - (v - yMin) / (yMax - yMin)) * (PLOT_BOTTOM - MT);

  const linePath = (key) =>
    series.map((p, i) => `${i ? "L" : "M"}${xPix(p.x).toFixed(1)},${yPix(p[key]).toFixed(1)}`).join(" ");
  const qaArea =
    `${linePath("qa")} L${xPix(series[N - 1].x).toFixed(1)},${PLOT_BOTTOM} L${xPix(series[0].x).toFixed(1)},${PLOT_BOTTOM} Z`;

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const t = (e.clientX - rect.left - ML) / (W - ML - MR);
    if (t < -0.03 || t > 1.03) {
      setHoverIdx(null);
      onScrub?.(null);
      return;
    }
    const idx = Math.round(clamp(t, 0, 1) * (N - 1));
    setHoverIdx(idx);
    onScrub?.(series[idx]);
  };
  const onLeave = () => {
    setHoverIdx(null);
    onScrub?.(null);
  };

  const hp = hoverIdx != null ? series[hoverIdx] : null;
  const activeAct = marker != null ? data.activities[marker] : null;

  return (
    <div ref={wrapRef} style={chartStyles.wrap} onMouseMove={onMove} onMouseLeave={onLeave}>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} role="img"
        aria-label={`QA score and CSAT over the period, with Learning Hub activities marked`}>
        <defs>
          <linearGradient id="qaArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={QA_COLOR} stopOpacity={0.2} />
            <stop offset="100%" stopColor={QA_COLOR} stopOpacity={0.02} />
          </linearGradient>
        </defs>

        {/* Y gridlines + % labels (x-axis carries no date ticks, by design) */}
        {yTicks.map((v) => (
          <g key={`y-${v}`}>
            <line x1={ML} y1={yPix(v)} x2={W - MR} y2={yPix(v)} stroke="var(--color-divider-card)" strokeWidth={1} />
            <text x={ML - 8} y={yPix(v) + 4} textAnchor="end" style={chartStyles.axisText}>{v}%</text>
          </g>
        ))}

        {/* Activity guide lines — pin sits at the bottom near the axis */}
        {data.activities.map((a, i) => (
          <line key={`g-${i}`} x1={xPix(a.x)} y1={MT} x2={xPix(a.x)} y2={PLOT_BOTTOM}
            stroke="var(--grey-300)" strokeWidth={1} strokeDasharray="3 3" opacity={marker === i ? 0.85 : 0.4} />
        ))}

        <path d={qaArea} fill="url(#qaArea)" />
        <path d={linePath("csat")} fill="none" stroke={CSAT_COLOR} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        <path d={linePath("qa")} fill="none" stroke={QA_COLOR} strokeWidth={2.4} strokeLinejoin="round" strokeLinecap="round" />

        {/* Scrubber — tracking line, date above, a dot on each line */}
        {hp && (
          <g pointerEvents="none">
            <line x1={xPix(hp.x)} y1={MT} x2={xPix(hp.x)} y2={PLOT_BOTTOM} stroke="var(--grey-500)" strokeWidth={1} />
            <text
              x={clamp(xPix(hp.x), ML + 34, W - MR - 34)}
              y={14}
              textAnchor="middle"
              style={chartStyles.scrubDate}
            >
              {hp.date.toUpperCase()}
            </text>
            <circle cx={xPix(hp.x)} cy={yPix(hp.csat)} r={4} fill={CSAT_COLOR} stroke="#FFFFFF" strokeWidth={1.5} />
            <circle cx={xPix(hp.x)} cy={yPix(hp.qa)} r={4} fill={QA_COLOR} stroke="#FFFFFF" strokeWidth={1.5} />
          </g>
        )}
      </svg>

      {/* Activity pins — HTML overlay so they use the real module icons */}
      {data.activities.map((a, i) => (
        <div
          key={`pin-${i}`}
          role="img"
          tabIndex={0}
          aria-label={`${a.title}, ${a.date}`}
          onMouseEnter={() => setMarker(i)}
          onMouseLeave={() => setMarker((c) => (c === i ? null : c))}
          onFocus={() => setMarker(i)}
          onBlur={() => setMarker((c) => (c === i ? null : c))}
          style={{
            ...chartStyles.pin,
            left: xPix(a.x),
            top: PIN_CY,
            borderColor: marker === i ? "var(--do-brand-blue)" : "var(--surface-white)",
          }}
        >
          <ActivityIcon kind={a.kind} />
        </div>
      ))}

      {activeAct && (
        <div style={{ ...chartStyles.tooltip, left: clamp(xPix(activeAct.x), 80, W - 80), bottom: H - PIN_CY + 16 }}>
          <div style={chartStyles.ttTitle}>{activeAct.title}</div>
          <div style={chartStyles.ttDate}>{activeAct.date}</div>
        </div>
      )}
    </div>
  );
}

const chartStyles = {
  wrap: { position: "relative", width: "100%" },
  axisText: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 11,
    fontWeight: 600,
    fill: "var(--color-text-tertiary)",
  },
  scrubDate: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.06em",
    fill: "var(--color-text-tertiary)",
  },
  pin: {
    position: "absolute",
    transform: "translate(-50%, -50%)",
    width: 26,
    height: 26,
    borderRadius: 13,
    background: "var(--grey-800)",
    border: "2px solid var(--surface-white)",
    boxShadow: "var(--shadow-2)",
    display: "grid",
    placeItems: "center",
    cursor: "default",
    outlineOffset: 2,
  },
  tooltip: {
    position: "absolute",
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
  ttTitle: { fontFamily: '"Mulish", sans-serif', fontSize: 12, fontWeight: 700, lineHeight: 1.3 },
  ttDate: { fontFamily: '"Mulish", sans-serif', fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.72)" },
};
