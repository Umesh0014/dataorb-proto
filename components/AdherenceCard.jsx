"use client";

import React from "react";
import Card from "./Card";
import Button from "./Button";

const ADH_TABS = ["Quality Standards", "Performance Metrics", "Process Compliance", "Flags & Exceptions", "Handle Time"];

const ADH_DATA = [
  { metric: "Engage Actively",          evaluated: 7069, met: 4292, notMet: 2770, na: 7,   adherence: "61%", adhColor: "#D32F2F" },
  { metric: "Make It Effortless",       evaluated: 7069, met: 4581, notMet: 2473, na: 15,  adherence: "65%", adhColor: "#D32F2F" },
  { metric: "Show Appreciation",        evaluated: 7069, met: 5528, notMet: 1508, na: 33,  adherence: "79%", adhColor: null },
  { metric: "Customer Acknowledgme...", evaluated: 7069, met: 5641, notMet: 1425, na: 3,   adherence: "80%", adhColor: null },
  { metric: "Discover Needs",           evaluated: 7069, met: 4675, notMet: 1398, na: 996, adherence: "77%", adhColor: null },
];

const ADH_COLS = [
  { key: "metric",    label: "",                 width: "24%" },
  { key: "evaluated", label: "Evaluated",        width: "14%" },
  { key: "met",       label: "Met",              width: "14%" },
  { key: "notMet",    label: "Not Met",          width: "14%", sorted: true },
  { key: "na",        label: "Not Applicable",   width: "16%" },
  { key: "adherence", label: "Adherence",        width: "18%", align: "center" },
];

export default function AdherenceCard() {
  const [activeTab, setActiveTab] = React.useState("Quality Standards");
  const [page, setPage] = React.useState(0);
  const totalPages = 3;

  return (
    <Card>
      <div style={adhStyles.title}>Adherence Overview</div>
      <div style={adhStyles.subtitle}>
        Track how every interaction measures up against your quality, process, handle time, and performance standards.
      </div>

      <div style={adhStyles.tabRow}>
        {ADH_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setPage(0); }}
            style={{
              ...adhStyles.tabBtn,
              color: activeTab === tab ? "#245BFF" : "rgba(0,0,0,0.60)",
              fontWeight: activeTab === tab ? 600 : 400,
              borderBottom: activeTab === tab ? "2px solid #245BFF" : "2px solid transparent",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 0 4px" }}>
        <span className="material-symbols-outlined" style={{ fontSize: 16, color: "rgba(0,0,0,0.60)" }}>calendar_view_month</span>
        <span style={{ fontFamily: '"Mulish", sans-serif', fontSize: 13, color: "rgba(0,0,0,0.60)" }}>For</span>
        <span style={{ fontFamily: '"Mulish", sans-serif', fontSize: 13, fontWeight: 700, color: "#1F232A" }}>All Metrics</span>
        <span className="material-symbols-outlined" style={{ fontSize: 14, color: "#AAB2C5" }}>expand_more</span>
      </div>

      <div style={adhStyles.tableHeader}>
        {ADH_COLS.map((col) => (
          <div key={col.key} style={{ ...adhStyles.th, width: col.width, textAlign: col.align || "left" }}>
            <span>{col.label}</span>
            {col.sorted && (
              <span className="material-symbols-outlined" style={{ fontSize: 14, color: "rgba(0,0,0,0.60)" }}>arrow_downward</span>
            )}
          </div>
        ))}
      </div>

      <div style={{ ...adhStyles.tableRow, borderBottom: "1px solid #F0F2FA" }}>
        <div style={{ ...adhStyles.td, width: "24%", fontWeight: 600 }}>Total metrics (14)</div>
        <div style={{ ...adhStyles.td, width: "14%" }}></div>
        <div style={{ ...adhStyles.td, width: "14%" }}></div>
        <div style={{ ...adhStyles.td, width: "14%" }}></div>
        <div style={{ ...adhStyles.td, width: "16%" }}></div>
        <div style={{ ...adhStyles.td, width: "18%", textAlign: "center" }}>
          <span style={adhStyles.adhBadge}>79%</span>
        </div>
      </div>

      {ADH_DATA.map((row, i) => (
        <div key={i} style={{ ...adhStyles.tableRow, borderBottom: i < ADH_DATA.length - 1 ? "1px solid #F0F2FA" : "none" }}>
          <div style={{ ...adhStyles.td, width: "24%" }}>{row.metric}</div>
          <div style={{ ...adhStyles.td, width: "14%" }}>{row.evaluated.toLocaleString()}</div>
          <div style={{ ...adhStyles.td, width: "14%" }}>{row.met.toLocaleString()}</div>
          <div style={{ ...adhStyles.td, width: "14%" }}>{row.notMet.toLocaleString()}</div>
          <div style={{ ...adhStyles.td, width: "16%" }}>{row.na}</div>
          <div style={{
            ...adhStyles.td,
            width: "18%",
            textAlign: "center",
            color: row.adhColor || "rgba(0,0,0,0.87)",
            fontWeight: row.adhColor ? 600 : 400,
          }}>
            {row.adherence}
          </div>
        </div>
      ))}

      {/* Pagination — table-local. Promote to a shared <Pagination> when a 3rd table appears. */}
      <div style={adhStyles.pagination}>
        <Button
          variant="text"
          uppercase={false}
          disabled
          leadingIcon={<span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_left</span>}
        >
          Previous
        </Button>
        <span style={adhStyles.pageInfo}>{page + 1}/{totalPages}</span>
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

const adhStyles = {
  title: { fontFamily: '"Mulish", sans-serif', fontSize: 16, fontWeight: 700, color: "#1F232A", lineHeight: 1.4, marginBottom: 2 },
  subtitle: { fontFamily: '"Mulish", sans-serif', fontSize: 13, fontWeight: 400, color: "rgba(0,0,0,0.60)", lineHeight: 1.4 },
  tabRow: { display: "flex", gap: 0, marginTop: 16, borderBottom: "1px solid #E8ECFF" },
  tabBtn: {
    fontFamily: '"Mulish", sans-serif', fontSize: 13, background: "none",
    border: "none", padding: "10px 16px", cursor: "pointer", lineHeight: 1.4,
  },
  tableHeader: {
    display: "flex", alignItems: "center", padding: "14px 0 10px",
    borderBottom: "1px solid #E8ECFF",
  },
  th: {
    fontFamily: '"Mulish", sans-serif', fontSize: 12, fontWeight: 700,
    color: "rgba(0,0,0,0.87)", display: "flex", alignItems: "center", gap: 4,
  },
  tableRow: { display: "flex", alignItems: "center", padding: "14px 0" },
  td: {
    fontFamily: '"Mulish", sans-serif', fontSize: 13, fontWeight: 400,
    color: "rgba(0,0,0,0.87)", lineHeight: 1.4,
  },
  adhBadge: {
    display: "inline-block", background: "#EAA907", color: "#FFFFFF",
    fontFamily: '"Mulish", sans-serif', fontSize: 12, fontWeight: 700,
    padding: "3px 10px", borderRadius: 4,
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
