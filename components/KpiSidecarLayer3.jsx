"use client";

import React from "react";
import { Gauge, Trophy } from "lucide-react";
import { OUTCOME_INSIGHTS } from "./mocks/kpiSidecar";

const POPPINS = "'Poppins', sans-serif";
const BAND = { strength: "#86EFAC", meets: "#FCD34D", needs: "#FCA5A5" };

// Layer 3 — Outcome Insights (Figma node 2349-29143). Reached from the L1
// "Outcome Insights" action. This Agent / Top Performer / Gap tiles, a
// two-line distribution trend, and horizontal impact bars (Strength / Meets /
// Needs Improvement) per outcome.
export default function KpiSidecarLayer3({ kpi }) {
  const oi = OUTCOME_INSIGHTS;

  return (
    <div style={s.wrap}>
      {/* Compare tiles */}
      <div style={s.tiles}>
        <div style={s.tile}>
          <span style={s.tileLabel}>This Agent</span>
          <span style={s.tileVal}><Gauge size={15} color="#6B89FF" /> {oi.thisAgent}%</span>
        </div>
        <div style={s.tile}>
          <span style={s.tileLabel}>Top Performer</span>
          <span style={s.tileVal}><Trophy size={15} color="#00A23A" /> {oi.topPerformer.value}% <span style={s.tileId}>· {oi.topPerformer.id}</span></span>
        </div>
        <div style={{ ...s.tile, ...s.tileGap }}>
          <span style={s.tileLabel}>Gap</span>
          <span style={{ ...s.tileVal, color: "#BA1A1A" }}>⚲ {oi.gap}%</span>
        </div>
      </div>

      {/* Distribution trend */}
      <TrendChart data={oi.trend} target={oi.target} />

      {/* Outcome insights impact bars */}
      <div style={s.insights}>
        <span style={s.insightsTitle}>Outcome Insights</span>
        {oi.impact.map((row) => (
          <div key={row.key} style={s.impactGroup}>
            <span style={s.impactLabel}><span style={s.impactIcon}>{row.icon}</span>{row.label}</span>
            <div style={s.bars}>
              <Bar pct={row.strength} color={BAND.strength} />
              <Bar pct={row.meets} color={BAND.meets} />
              <Bar pct={row.needs} color={BAND.needs} />
            </div>
          </div>
        ))}
        <div style={s.axis}><span>0</span><span>50%</span><span>100%</span></div>
        <span style={s.axisCaption}>(%) Impact →</span>
        <div style={s.legend}>
          <Legend color={BAND.strength} label="Strength" />
          <Legend color={BAND.meets} label="Meets Expectations" />
          <Legend color={BAND.needs} label="Needs Improvement" />
        </div>
      </div>
    </div>
  );
}

function Bar({ pct, color }) {
  return <div style={s.barTrack}><div style={{ ...s.barFill, width: `${pct}%`, background: color }} /></div>;
}

function Legend({ color, label }) {
  return <span style={s.legendItem}><span style={{ ...s.legendDot, background: color }} />{label}</span>;
}

// Two smooth lines (this agent vs top performer) + a dashed target line.
function TrendChart({ data, target }) {
  const W = 380, H = 150, padL = 28, padB = 22, padT = 8;
  const max = 100;
  const x = (i) => padL + (i / (data.length - 1)) * (W - padL - 8);
  const y = (v) => padT + (1 - v / max) * (H - padT - padB);
  const line = (key) => data.map((d, i) => `${i ? "L" : "M"} ${x(i).toFixed(1)} ${y(d[key]).toFixed(1)}`).join(" ");
  const ty = y(target);
  return (
    <div style={s.chartCard}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: "block" }}>
        {[0, 25, 50, 75, 100].map((g) => (
          <g key={g}>
            <line x1={padL} x2={W - 8} y1={y(g)} y2={y(g)} stroke="#EEF1F8" strokeWidth="1" />
            <text x={padL - 6} y={y(g) + 3} textAnchor="end" style={s.axisTick}>{g}%</text>
          </g>
        ))}
        <line x1={padL} x2={W - 8} y1={ty} y2={ty} stroke="#34D399" strokeWidth="1.5" strokeDasharray="4 4" />
        <path d={line("top")} fill="none" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d={line("agent")} fill="none" stroke="#6B89FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((d, i) => (
          <text key={i} x={x(i)} y={H - 6} textAnchor="middle" style={s.axisTick}>{d.x}</text>
        ))}
      </svg>
    </div>
  );
}

const s = {
  wrap: { display: "flex", flexDirection: "column", gap: 18, fontFamily: POPPINS },
  tiles: { display: "flex", gap: 12, border: "1px solid #EEF1F8", borderRadius: 12, padding: 14 },
  tile: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 },
  tileGap: { background: "#F3F0FB", borderRadius: 8, padding: "8px 12px", flex: "0 0 auto" },
  tileLabel: { fontSize: 12, fontWeight: 600, color: "#5B5E6F", letterSpacing: "0.5px" },
  tileVal: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 14, fontWeight: 700, color: "#2C2F42" },
  tileId: { fontSize: 12, fontWeight: 500, color: "#8C90A6" },
  chartCard: { border: "1px solid #EEF1F8", borderRadius: 12, padding: "16px 14px" },
  axisTick: { fontSize: 9, fill: "#8C90A6", fontFamily: POPPINS },
  insights: { border: "1px solid #EEF1F8", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 14 },
  insightsTitle: { fontSize: 14, fontWeight: 600, color: "#171B2C", letterSpacing: "0.1px" },
  impactGroup: { display: "flex", flexDirection: "column", gap: 6 },
  impactLabel: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, color: "#2C2F42" },
  impactIcon: { fontSize: 14 },
  bars: { display: "flex", flexDirection: "column", gap: 5 },
  barTrack: { width: "100%", height: 12, borderRadius: 4, background: "transparent" },
  barFill: { height: "100%", borderRadius: 4 },
  axis: { display: "flex", justifyContent: "space-between", fontSize: 10, color: "#8C90A6", marginTop: 2 },
  axisCaption: { fontSize: 11, color: "#8C90A6", textAlign: "center" },
  legend: { display: "flex", flexWrap: "wrap", gap: "8px 16px", borderTop: "1px solid #EEF1F8", paddingTop: 12 },
  legendItem: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#5B5E6F" },
  legendDot: { width: 8, height: 8, borderRadius: 999, flexShrink: 0 },
};
