"use client";

import React from "react";
import Card from "./Card";
import useMeasuredWidth from "./useMeasuredWidth";

const SENTIMENT_DATA = [
  { month: "May 2025", positive: 2, negative: 1, neutral: 0 },
  { month: "Jun",  positive: 3, negative: 1, neutral: 1 },
  { month: "Jul",  positive: 2, negative: 2, neutral: 1 },
  { month: "Aug",  positive: 4, negative: 1, neutral: 1 },
  { month: "Sep",  positive: 3, negative: 2, neutral: 1 },
  { month: "Oct",  positive: 5, negative: 2, neutral: 2 },
  { month: "Nov",  positive: 4, negative: 3, neutral: 2 },
  { month: "Dec",  positive: 8, negative: 4, neutral: 3 },
  { month: "Jan 2026", positive: 42, negative: 28, neutral: 12 },
  { month: "Feb",  positive: 55, negative: 35, neutral: 18 },
  { month: "Mar",  positive: 52, negative: 30, neutral: 15 },
  { month: "Apr",  positive: 48, negative: 25, neutral: 14 },
  { month: "May 2026", positive: 5, negative: 3, neutral: 2 },
];

function SentimentChart({ data, height = 240 }) {
  const [ref, width] = useMeasuredWidth(0);
  const pad = { top: 16, right: 20, bottom: 36, left: 56 };
  const w = Math.max(0, width - pad.left - pad.right);
  const h = height - pad.top - pad.bottom;
  const labelsY = ["0", "20%", "40%", "60%", "80%", "100%"];
  const labelsX = ["May 2025", "Sep 2025", "Jan 2026", "May 2026"];

  const stacked = data.map((d) => {
    const total = d.positive + d.negative + d.neutral || 1;
    return {
      positive: (d.positive / total) * 100,
      negative: (d.negative / total) * 100,
      neutral:  (d.neutral / total) * 100,
    };
  });

  const makeLine = (key) => {
    return stacked.map((d, i) => {
      const x = pad.left + (i / (data.length - 1)) * w;
      const y = pad.top + h - (d[key] / 100) * h;
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    }).join(" ");
  };

  const colors = { positive: "#34D399", negative: "#FF6B6B", neutral: "#9CA3AF" };

  return (
    <div ref={ref} style={{ width: "100%" }}>
      {width > 0 && (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }}>
      {labelsY.map((v, i) => {
        const y = pad.top + h - (i / (labelsY.length - 1)) * h;
        return (
          <React.Fragment key={i}>
            <line x1={pad.left} y1={y} x2={width - pad.right} y2={y} stroke="#E8ECFF" strokeWidth="1" />
            <text x={pad.left - 12} y={y + 4} textAnchor="end" fill="rgba(0,0,0,0.38)" fontSize="11" fontFamily="Mulish, sans-serif">{v}</text>
          </React.Fragment>
        );
      })}
      <text x={14} y={pad.top + h / 2} textAnchor="middle" fill="rgba(0,0,0,0.38)" fontSize="11" fontFamily="Mulish, sans-serif"
        transform={`rotate(-90, 14, ${pad.top + h / 2})`}>+ve sentiment →</text>

      {["positive", "negative", "neutral"].map((key) => (
        <path key={key} d={makeLine(key)} fill="none" stroke={colors[key]} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      ))}

      {labelsX.map((label, i) => (
        <text key={i} x={pad.left + (i / (labelsX.length - 1)) * w} y={height - 8} textAnchor="middle"
          fill="rgba(0,0,0,0.38)" fontSize="11" fontFamily="Mulish, sans-serif">{label}</text>
      ))}
        </svg>
      )}
    </div>
  );
}

function SentimentLegend() {
  const items = [
    { label: "Positive", color: "#34D399" },
    { label: "Negative", color: "#FF6B6B" },
    { label: "Neutral",  color: "#9CA3AF" },
  ];
  return (
    <div style={{ display: "flex", gap: 20, justifyContent: "flex-end", marginBottom: 8 }}>
      {items.map((it) => (
        <div key={it.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: 4, background: it.color }}></div>
          <span style={{ fontFamily: '"Mulish", sans-serif', fontSize: 12, color: "rgba(0,0,0,0.60)" }}>{it.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function SentimentCard() {
  return (
    <Card>
      <div style={{ fontFamily: '"Mulish", sans-serif', fontSize: 16, fontWeight: 700, color: "#1F232A", marginBottom: 2 }}>
        Customer Sentiment Over Time
      </div>
      <div style={{ fontFamily: '"Mulish", sans-serif', fontSize: 13, color: "rgba(0,0,0,0.60)", marginBottom: 16 }}>
        Track and interpret trends in customer outcome sentiment to enhance brand perception
      </div>
      <SentimentLegend />
      <SentimentChart data={SENTIMENT_DATA} />
    </Card>
  );
}
