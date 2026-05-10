"use client";

import React from "react";
import Card from "./Card";
import Button from "./Button";

const CR_TABS = ["Business Category", "Frequent Contacts"];

const CR_DATA = [
  { title: "Account and Billing Management",       volume: 2316, resolution: "36%", positive: "29%", negative: "33%" },
  { title: "Service Cancellations and Retention",  volume: 947,  resolution: "38%", positive: "32%", negative: "21%" },
  { title: "Internet and Broadband Support",       volume: 609,  resolution: "22%", positive: "27%", negative: "25%" },
  { title: "Mobile Device and Service Management", volume: 584,  resolution: "38%", positive: "41%", negative: "24%" },
  { title: "Mobile Data and Connectivity Support", volume: 531,  resolution: "30%", positive: "35%", negative: "28%" },
  { title: "Contract and Plan Management",         volume: 374,  resolution: "42%", positive: "33%", negative: "24%" },
  { title: "Retention and Portability",            volume: 322,  resolution: "31%", positive: "22%", negative: "37%" },
];

const CR_COLS = [
  { key: "title",      label: "Title",              width: "36%", align: "left" },
  { key: "volume",     label: "Volume",             width: "14%", align: "left" },
  { key: "resolution", label: "Resolution rate",    width: "16%", align: "center" },
  { key: "positive",   label: "Positive sentiment", width: "17%", align: "center", heatmap: "good" },
  { key: "negative",   label: "Negative sentiment", width: "17%", align: "center", heatmap: "bad" },
];

const heatmapCell = (value, type) => {
  const num = parseInt(value);
  if (type === "good") {
    return {
      background: num >= 35 ? "#E8F5E9" : num >= 25 ? "#F1F8E9" : "#FAFAFA",
      color: num >= 35 ? "#2E7D32" : num >= 25 ? "#558B2F" : "rgba(0,0,0,0.87)",
    };
  }
  return {
    background: num >= 30 ? "#FFEBEE" : num >= 25 ? "#FFF3E0" : "#FAFAFA",
    color: num >= 30 ? "#C62828" : num >= 25 ? "#E65100" : "rgba(0,0,0,0.87)",
  };
};

export default function ContactReasonCard() {
  const [activeTab, setActiveTab] = React.useState("Business Category");
  const [page, setPage] = React.useState(0);
  const totalPages = 5;

  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 0 }}>
        <span style={crStyles.title}>Contact Reason Insights</span>
        <span className="material-symbols-outlined" style={{ fontSize: 16, color: "rgba(0,0,0,0.38)" }}>info</span>
      </div>

      <div style={crStyles.tabRow}>
        {CR_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setPage(0); }}
            style={{
              ...crStyles.tabBtn,
              color: activeTab === tab ? "#245BFF" : "rgba(0,0,0,0.60)",
              fontWeight: activeTab === tab ? 600 : 400,
              borderBottom: activeTab === tab ? "2px solid #245BFF" : "2px solid transparent",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={crStyles.tableHeader}>
        {CR_COLS.map((col) => (
          <div key={col.key} style={{
            ...crStyles.th,
            width: col.width,
            textAlign: col.align,
            ...(col.heatmap === "good" ? { background: "#E8F5E9", borderRadius: "4px 4px 0 0", padding: "8px 12px", margin: "-8px 0 0" } : {}),
            ...(col.heatmap === "bad"  ? { background: "#FFEBEE", borderRadius: "4px 4px 0 0", padding: "8px 12px", margin: "-8px 0 0" } : {}),
          }}>
            {col.label}
          </div>
        ))}
      </div>

      {CR_DATA.map((row, i) => (
        <div key={i} style={{
          ...crStyles.tableRow,
          borderBottom: i < CR_DATA.length - 1 ? "1px solid #F0F2FA" : "none",
        }}>
          {CR_COLS.map((col) => {
            const val = row[col.key];
            const heat = col.heatmap ? heatmapCell(val, col.heatmap) : {};
            return (
              <div key={col.key} style={{
                ...crStyles.td,
                width: col.width,
                textAlign: col.align,
                ...(col.heatmap ? { ...heat, padding: "10px 12px", margin: "-10px 0" } : {}),
              }}>
                {col.key === "volume" ? val.toLocaleString() : val}
              </div>
            );
          })}
        </div>
      ))}

      {/* Pagination — table-local. Promote to a shared <Pagination> when a 3rd table appears. */}
      <div style={crStyles.pagination}>
        <Button
          variant="text"
          uppercase={false}
          disabled
          leadingIcon={<span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_left</span>}
        >
          Previous
        </Button>
        <span style={crStyles.pageInfo}>{page + 1}/{totalPages}</span>
        <Button
          variant="text"
          uppercase={false}
          onClick={() => setPage(Math.min(page + 1, totalPages - 1))}
          trailingIcon={<span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>}
          style={{ color: "var(--color-button-primary-bg)" }}
        >
          Next
        </Button>
      </div>
    </Card>
  );
}

const crStyles = {
  title: { fontFamily: '"Mulish", sans-serif', fontSize: 16, fontWeight: 700, color: "#1F232A", lineHeight: 1.4 },
  tabRow: { display: "flex", gap: 0, marginTop: 16, borderBottom: "1px solid #E8ECFF" },
  tabBtn: {
    fontFamily: '"Mulish", sans-serif', fontSize: 13, background: "none",
    border: "none", padding: "10px 20px", cursor: "pointer", lineHeight: 1.4,
  },
  tableHeader: {
    display: "flex", alignItems: "center", padding: "14px 0 10px",
    borderBottom: "1px solid #E8ECFF",
  },
  th: {
    fontFamily: '"Mulish", sans-serif', fontSize: 12, fontWeight: 700,
    color: "rgba(0,0,0,0.87)", lineHeight: 1.4,
  },
  tableRow: { display: "flex", alignItems: "center", padding: "14px 0" },
  td: {
    fontFamily: '"Mulish", sans-serif', fontSize: 13, fontWeight: 400,
    color: "rgba(0,0,0,0.87)", lineHeight: 1.4,
  },
  pagination: {
    display: "flex", alignItems: "center", justifyContent: "flex-end",
    gap: 12, marginTop: 16,
  },
  pageBtn: {
    fontFamily: '"Mulish", sans-serif', fontSize: 13, fontWeight: 500,
    background: "none", border: "none", display: "flex",
    alignItems: "center", gap: 4, padding: 0, cursor: "pointer",
  },
  pageInfo: {
    fontFamily: '"Mulish", sans-serif', fontSize: 13, fontWeight: 400,
    color: "rgba(0,0,0,0.60)",
  },
};
