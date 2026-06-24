"use client";

import React from "react";
import { ChevronDown, ChevronRight, Rocket, Settings2 } from "lucide-react";

const POPPINS = "'Poppins', sans-serif";
// %Change pill tints (Figma 2349-28348): a down move is the "bad" red, an up
// move the "good" green — independent of the metric's own RAG.
const DELTA = {
  up: { bg: "#F0FDF4", fg: "#00711D", arrow: "↑" },
  down: { bg: "#FEF2F2", fg: "#BA1A1A", arrow: "↓" },
};
const ACTION_ICON = { "Feedback Summary": Settings2, "Outcome Insights": Rocket, "Adherence Trend": Settings2, "Assessment Summary": Settings2 };

// Layer 1 — sidecar overview (Figma node 2349-28348). A summary card
// (Interaction Data → metric headline + delta + action buttons) over a
// Week-over-Week Trend table. Header/back is owned by KpiDrillInline.
export default function KpiSidecarLayer1({ kpi, onSelectAgent }) {
  const rows = kpi.weeklyRows || [];
  const deltaTone = (kpi.priorDelta ?? 0) >= 0 ? "up" : "down";
  const dt = DELTA[deltaTone];
  const filter = kpi.wowFilter || { label: kpi.name, value: "All" };

  return (
    <div style={s.wrap}>
      {/* Summary card */}
      <div style={s.summary}>
        <div style={s.sumTop}>
          <span style={s.kicker}>Interaction Data</span>
          <span style={s.dataLine}>
            Total <strong style={s.strong}>{kpi.total.toLocaleString()}</strong>
            <span style={s.dot}>•</span>
            Evaluated <strong style={s.strong}>{kpi.evaluatedPct}%</strong> ({(kpi.evaluatedCount ?? 0).toLocaleString()} Interactions)
          </span>
        </div>
        <div style={s.sumBody}>
          <span style={s.kicker}>{kpi.summaryKicker || "Performance"}</span>
          <span style={s.metricName}>{kpi.name}</span>
          <span style={s.metricRate}>
            {kpi.campaignRate}{kpi.unit}
            <span style={s.metricCount}> ({(kpi.metricCount ?? kpi.total).toLocaleString()} interactions)</span>
          </span>
          <span style={s.deltaRow}>
            <span style={{ ...s.deltaPill, background: dt.bg, color: dt.fg }}>{dt.arrow} {Math.abs(kpi.priorDelta ?? 0)}%</span>
            <span style={s.deltaText}>compared to prior period</span>
          </span>
          <div style={s.actions}>
            {(kpi.actions || []).map((label) => {
              const Icon = ACTION_ICON[label] || Settings2;
              return (
                <button key={label} type="button" style={s.actionBtn}>
                  <Icon size={15} color="#004BEF" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Week over week trend */}
      <div style={s.trendHead}>
        <span style={s.trendTitle}>Week Over Week Trend</span>
        <button type="button" style={s.filterBtn}>
          <span style={s.filterLabel}>{filter.label}</span>
          <span style={s.filterValue}>{filter.value}</span>
          <ChevronDown size={16} color="#5B5E6F" />
        </button>
      </div>

      <div style={s.table}>
        <div style={s.thead}>
          <span style={s.thWeek}>Week</span>
          <span style={s.thNum}>Evaluated</span>
          <span style={s.thNum}>{kpi.name}</span>
          <span style={s.thChange}>%Change</span>
          <span style={s.thChevron} />
        </div>
        <div style={s.yearRow}>2025</div>
        {rows.map((r) => {
          const tone = r.change >= 0 ? "up" : "down";
          const p = DELTA[tone];
          return (
            <button key={r.week} type="button" style={s.row}
              onClick={() => onSelectAgent?.({ id: r.week, name: `${r.week} (${r.range})`, ...r })}>
              <span style={s.tdWeek}>
                <span style={s.weekName}>{r.week}</span>
                <span style={s.weekRange}>({r.range})</span>
              </span>
              <span style={s.tdNum}>{r.evaluated.toLocaleString()}</span>
              <span style={s.tdMetric}>{r.metric}%</span>
              <span style={s.tdChange}>
                <span style={{ ...s.changePill, background: p.bg, color: p.fg }}>{p.arrow} {Math.abs(r.change)}%</span>
              </span>
              <span style={s.tdChevron}><ChevronRight size={16} color="#C4C9D6" /></span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const s = {
  wrap: { display: "flex", flexDirection: "column", gap: 18, fontFamily: POPPINS },
  // Summary
  summary: { background: "#FCFBFF", borderRadius: 12, padding: 18, display: "flex", flexDirection: "column" },
  sumTop: { display: "flex", flexDirection: "column", gap: 6, paddingBottom: 16, borderBottom: "1px solid #EEF1F8" },
  sumBody: { display: "flex", flexDirection: "column", gap: 8, paddingTop: 16 },
  kicker: { fontSize: 12, fontWeight: 500, color: "#5B5E6F", letterSpacing: "0.25px" },
  dataLine: { fontSize: 13, color: "#5B5E6F", letterSpacing: "0.25px", display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" },
  strong: { color: "#2C2F42", fontWeight: 700 },
  dot: { color: "#C4C9D6" },
  metricName: { fontSize: 18, fontWeight: 700, color: "#171B2C", letterSpacing: "0.1px" },
  metricRate: { fontSize: 18, fontWeight: 700, color: "#171B2C" },
  metricCount: { fontSize: 13, fontWeight: 400, color: "#8C90A6" },
  deltaRow: { display: "flex", alignItems: "center", gap: 10, marginTop: 2 },
  deltaPill: { display: "inline-flex", alignItems: "center", gap: 3, height: 24, padding: "0 8px", borderRadius: 6, fontSize: 12, fontWeight: 700 },
  deltaText: { fontSize: 13, color: "#5B5E6F" },
  actions: { display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" },
  actionBtn: { display: "inline-flex", alignItems: "center", gap: 8, height: 38, padding: "0 16px", borderRadius: 8, border: "1px solid #D7DBF5", background: "#fff", cursor: "pointer", fontFamily: POPPINS, fontSize: 13, fontWeight: 600, color: "#2C2F42" },
  // Trend header
  trendHead: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 },
  trendTitle: { fontSize: 14, fontWeight: 600, color: "#171B2C", letterSpacing: "0.1px" },
  filterBtn: { display: "inline-flex", alignItems: "center", gap: 6, height: 34, padding: "0 12px", borderRadius: 8, border: "1px solid var(--color-divider-card)", background: "#fff", cursor: "pointer", fontFamily: POPPINS },
  filterLabel: { fontSize: 13, color: "#5B5E6F" },
  filterValue: { fontSize: 13, fontWeight: 700, color: "#2C2F42" },
  // Table
  table: { display: "flex", flexDirection: "column" },
  thead: { display: "grid", gridTemplateColumns: "1.4fr 0.9fr 0.9fr 0.9fr 24px", alignItems: "center", height: 40, background: "#F7F8FC", borderRadius: 6, padding: "0 12px" },
  thWeek: { fontSize: 11, fontWeight: 600, color: "#5B5E6F", letterSpacing: "0.5px" },
  thNum: { fontSize: 11, fontWeight: 600, color: "#5B5E6F", letterSpacing: "0.5px" },
  thChange: { fontSize: 11, fontWeight: 600, color: "#5B5E6F", letterSpacing: "0.5px" },
  thChevron: {},
  yearRow: { fontSize: 12, fontWeight: 700, color: "#004BEF", padding: "14px 12px 8px", borderBottom: "1px solid #EEF1F8" },
  row: { width: "100%", display: "grid", gridTemplateColumns: "1.4fr 0.9fr 0.9fr 0.9fr 24px", alignItems: "center", background: "#fff", border: "none", borderBottom: "1px solid #F4F4FB", cursor: "pointer", textAlign: "left", fontFamily: POPPINS, padding: "0 12px", height: 56 },
  tdWeek: { display: "flex", alignItems: "baseline", gap: 6, minWidth: 0 },
  weekName: { fontSize: 14, fontWeight: 500, color: "#2C2F42" },
  weekRange: { fontSize: 12, color: "#8C90A6", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  tdNum: { fontSize: 14, fontWeight: 700, color: "#2C2F42" },
  tdMetric: { fontSize: 14, color: "#2C2F42" },
  tdChange: {},
  changePill: { display: "inline-flex", alignItems: "center", gap: 3, height: 24, padding: "0 8px", borderRadius: 6, fontSize: 12, fontWeight: 600 },
  tdChevron: { display: "flex", alignItems: "center", justifyContent: "flex-end" },
};
