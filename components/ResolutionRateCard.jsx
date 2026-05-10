"use client";

import React from "react";
import Card from "./Card";

const RES_TABS = [
  { key: "summary",  label: "Summary",   value: "36%", change: null },
  { key: "call",     label: "Call",      value: "35%", change: null },
  { key: "whatsapp", label: "WhatsApp",  value: "39%", change: null },
];

const RES_CHART_DATA = [
  { month: "May 2025", value: 2 },
  { month: "Jun",  value: 3 },
  { month: "Jul",  value: 2 },
  { month: "Aug",  value: 4 },
  { month: "Sep",  value: 3 },
  { month: "Oct",  value: 5 },
  { month: "Nov",  value: 4 },
  { month: "Dec",  value: 8 },
  { month: "Jan 2026", value: 28 },
  { month: "Feb",  value: 38 },
  { month: "Mar",  value: 35 },
  { month: "Apr",  value: 22 },
  { month: "May 2026", value: 3 },
];

function ResAreaChart({ data, width = 560, height = 220 }) {
  const pad = { top: 16, right: 16, bottom: 36, left: 56 };
  const w = width - pad.left - pad.right;
  const h = height - pad.top - pad.bottom;
  const labelsY = ["0 %", "20 %", "40 %", "60 %", "80 %", "100 %"];
  const labelsX = ["May 2025", "Sep 2025", "Jan 2026", "May 2026"];
  const maxY = 100;

  const points = data.map((d, i) => ({
    x: pad.left + (i / (data.length - 1)) * w,
    y: pad.top + h - (d.value / maxY) * h,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1].x},${pad.top + h} L${points[0].x},${pad.top + h} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }}>
      <defs>
        <linearGradient id="areaFillRes" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#245BFF" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#245BFF" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {labelsY.map((v, i) => {
        const y = pad.top + h - (i / (labelsY.length - 1)) * h;
        return (
          <React.Fragment key={i}>
            <line x1={pad.left} y1={y} x2={width - pad.right} y2={y} stroke="#E8ECFF" strokeWidth="1" />
            <text x={pad.left - 12} y={y + 4} textAnchor="end" fill="rgba(0,0,0,0.38)" fontSize="11" fontFamily="Mulish, sans-serif">{v}</text>
          </React.Fragment>
        );
      })}
      <text x={14} y={pad.top + h / 2} textAnchor="middle" fill="rgba(0,0,0,0.38)" fontSize="11"
        fontFamily="Mulish, sans-serif" transform={`rotate(-90, 14, ${pad.top + h / 2})`}>% Resolved Topics →</text>
      <path d={areaPath} fill="url(#areaFillRes)" />
      <path d={linePath} fill="none" stroke="#245BFF" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#FFFFFF" stroke="#245BFF" strokeWidth="1.5" />
      ))}
      {labelsX.map((label, i) => (
        <text key={i} x={pad.left + (i / (labelsX.length - 1)) * w} y={height - 8} textAnchor="middle"
          fill="rgba(0,0,0,0.38)" fontSize="11" fontFamily="Mulish, sans-serif">{label}</text>
      ))}
    </svg>
  );
}

export default function ResolutionRateCard() {
  const [activeTab, setActiveTab] = React.useState("summary");

  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <span style={rrStyles.title}>Resolution Rate</span>
        <span className="material-symbols-outlined" style={{ fontSize: 16, color: "rgba(0,0,0,0.38)" }}>info</span>
      </div>

      <div style={rrStyles.divider}></div>

      <div style={rrStyles.tabRow}>
        {RES_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <div
              key={tab.key}
              style={{
                ...rrStyles.tab,
                borderTop: isActive ? "3px solid #245BFF" : "3px solid transparent",
              }}
              onClick={() => setActiveTab(tab.key)}
            >
              <span style={{
                ...rrStyles.tabLabel,
                color: isActive ? "#245BFF" : "rgba(0,0,0,0.60)",
                fontWeight: isActive ? 700 : 400,
              }}>
                {tab.label}
              </span>
              <span style={rrStyles.tabValue}>{tab.value}</span>
              <span style={rrStyles.tabChange}>–</span>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 0, marginTop: 8 }}>
        <div style={{ flex: "0 0 auto" }}>
          <ResAreaChart data={RES_CHART_DATA} width={580} height={220} />
        </div>
        <Card tone="outline" padX={20} padY={20} style={rrStyles.sidePanel}>
          <div style={rrStyles.sidePanelTitle}>Resolution topic distribution by status</div>
          <div style={rrStyles.emptyState}>
            <span className="material-symbols-outlined" style={{ fontSize: 48, color: "#D6DCE8" }}>pie_chart</span>
            <span style={{ fontFamily: '"Mulish", sans-serif', fontSize: 12, color: "rgba(0,0,0,0.38)", marginTop: 8 }}>
              Select a topic to view
            </span>
          </div>
        </Card>
      </div>
    </Card>
  );
}

const rrStyles = {
  title: { fontFamily: '"Mulish", sans-serif', fontSize: 16, fontWeight: 700, color: "#1F232A", lineHeight: 1.4 },
  divider: { height: 1, background: "#E8ECFF" },
  tabRow: { display: "flex", gap: 0 },
  tab: {
    minWidth: 110, padding: "12px 24px 8px", cursor: "pointer",
    display: "flex", flexDirection: "column", gap: 2,
  },
  tabLabel: { fontFamily: '"Mulish", sans-serif', fontSize: 13, lineHeight: 1.4 },
  tabValue: { fontFamily: '"Mulish", sans-serif', fontSize: 24, fontWeight: 700, color: "#1F232A", lineHeight: 1.2 },
  tabChange: { fontFamily: '"Mulish", sans-serif', fontSize: 12, color: "rgba(0,0,0,0.38)", lineHeight: 1.4 },
  sidePanel: {
    flex: 1, marginLeft: 16, display: "flex", flexDirection: "column",
  },
  sidePanelTitle: {
    fontFamily: '"Mulish", sans-serif', fontSize: 13, fontWeight: 600,
    color: "#1F232A", marginBottom: 16,
  },
  emptyState: {
    flex: 1, display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
  },
};
