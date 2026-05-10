"use client";

import React from "react";
import Card from "./Card";
import useMeasuredWidth from "./useMeasuredWidth";

const CHANNEL_TABS = [
  { key: "chat",     label: "Chat",     count: null, change: null },
  { key: "email",    label: "Email",    count: null, change: null },
  { key: "call",     label: "Call",     count: 6018, change: null },
  { key: "whatsapp", label: "WhatsApp", count: 1117, change: null },
];

const CHANNEL_CHART_DATA = [
  { month: "May 2025", value: 20 },
  { month: "Jun",  value: 15 },
  { month: "Jul",  value: 25 },
  { month: "Aug",  value: 18 },
  { month: "Sep",  value: 22 },
  { month: "Oct",  value: 20 },
  { month: "Nov",  value: 30 },
  { month: "Dec",  value: 45 },
  { month: "Jan 2026", value: 380 },
  { month: "Feb",  value: 3200 },
  { month: "Mar",  value: 3400 },
  { month: "Apr",  value: 2800 },
  { month: "May 2026", value: 50 },
];

const CHART_LABELS_X = ["May 2025", "Sep 2025", "Jan 2026", "May 2026"];
const CHART_LABELS_Y = [0, 1000, 2000, 3000, 4000];

function AreaChart({ data, height = 240, labelsX, labelsY, yLabel = "" }) {
  const [ref, width] = useMeasuredWidth(0);
  const pad = { top: 16, right: 20, bottom: 36, left: 56 };
  const w = Math.max(0, width - pad.left - pad.right);
  const h = height - pad.top - pad.bottom;
  const maxY = Math.max(...labelsY);

  const points = data.map((d, i) => ({
    x: pad.left + (i / (data.length - 1)) * w,
    y: pad.top + h - (d.value / maxY) * h,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = points.length > 0
    ? `${linePath} L${points[points.length - 1].x},${pad.top + h} L${points[0].x},${pad.top + h} Z`
    : "";

  return (
    <div ref={ref} style={{ width: "100%" }}>
      {width > 0 && (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }}>
      <defs>
        <linearGradient id="areaFillCE" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.03" />
        </linearGradient>
      </defs>

      {labelsY.map((v, i) => {
        const y = pad.top + h - (v / maxY) * h;
        return (
          <React.Fragment key={i}>
            <line x1={pad.left} y1={y} x2={width - pad.right} y2={y} stroke="#E8ECFF" strokeWidth="1" />
            <text x={pad.left - 12} y={y + 4} textAnchor="end" fill="rgba(0,0,0,0.38)" fontSize="11" fontFamily="Mulish, sans-serif">
              {v.toLocaleString()}
            </text>
          </React.Fragment>
        );
      })}

      {yLabel && (
        <text x={14} y={pad.top + h / 2} textAnchor="middle" fill="rgba(0,0,0,0.38)" fontSize="11"
          fontFamily="Mulish, sans-serif" transform={`rotate(-90, 14, ${pad.top + h / 2})`}>
          {yLabel} →
        </text>
      )}

      <path d={areaPath} fill="url(#areaFillCE)" />
      <path d={linePath} fill="none" stroke="#245BFF" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#FFFFFF" stroke="#245BFF" strokeWidth="1.5" />
      ))}

      {labelsX.map((label, i) => {
        const x = pad.left + (i / (labelsX.length - 1)) * w;
        return (
          <text key={i} x={x} y={height - 8} textAnchor="middle" fill="rgba(0,0,0,0.38)" fontSize="11" fontFamily="Mulish, sans-serif">
            {label}
          </text>
        );
      })}
        </svg>
      )}
    </div>
  );
}

export default function ChannelEngagementCard() {
  const [activeChannel, setActiveChannel] = React.useState("call");

  return (
    <Card>
      <div style={ceStyles.title}>Channel Engagement</div>
      <div style={ceStyles.subtitle}>Track interaction trends to discern customer channel preferences</div>
      <div style={ceStyles.divider}></div>

      <div style={ceStyles.tabRow}>
        {CHANNEL_TABS.map((tab) => {
          const isActive = activeChannel === tab.key;
          return (
            <div
              key={tab.key}
              style={{
                ...ceStyles.tab,
                borderTop: isActive ? "3px solid #245BFF" : "3px solid transparent",
              }}
              onClick={() => setActiveChannel(tab.key)}
            >
              <span style={{
                ...ceStyles.tabLabel,
                color: isActive ? "#245BFF" : "rgba(0,0,0,0.60)",
                fontWeight: isActive ? 700 : 400,
              }}>
                {tab.label}
              </span>
              <span style={ceStyles.tabCount}>
                {tab.count !== null ? tab.count.toLocaleString() : "– –"}
              </span>
              <span style={ceStyles.tabChange}>
                {tab.change !== null ? tab.change : "–"}
              </span>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 8 }}>
        <AreaChart
          data={CHANNEL_CHART_DATA}
          height={240}
          labelsX={CHART_LABELS_X}
          labelsY={CHART_LABELS_Y}
          yLabel="# Interactions"
        />
      </div>
    </Card>
  );
}

const ceStyles = {
  title: {
    fontFamily: '"Mulish", sans-serif', fontSize: 16, fontWeight: 700,
    color: "#1F232A", lineHeight: 1.4, marginBottom: 2,
  },
  subtitle: {
    fontFamily: '"Mulish", sans-serif', fontSize: 13, fontWeight: 400,
    color: "rgba(0,0,0,0.60)", lineHeight: 1.4,
  },
  divider: { height: 1, background: "#E8ECFF", margin: "16px 0 0" },
  tabRow: { display: "flex", gap: 0 },
  tab: {
    flex: "0 0 auto", minWidth: 120, padding: "12px 24px 8px",
    cursor: "pointer", display: "flex", flexDirection: "column", gap: 2,
  },
  tabLabel: { fontFamily: '"Mulish", sans-serif', fontSize: 13, lineHeight: 1.4 },
  tabCount: {
    fontFamily: '"Mulish", sans-serif', fontSize: 24, fontWeight: 700,
    color: "#1F232A", lineHeight: 1.2,
  },
  tabChange: {
    fontFamily: '"Mulish", sans-serif', fontSize: 12, fontWeight: 400,
    color: "rgba(0,0,0,0.38)", lineHeight: 1.4,
  },
};
