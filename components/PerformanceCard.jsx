"use client";

import React from "react";
import Card from "./Card";
import Button from "./Button";

const PERF_TABS = ["Volume Driver", "Negative Sentiment", "Unresolved Interactions", "Predicted CSAT"];

const PERF_DATA = [
  { title: "Billing and collections",    volume: 2131, pct: "31%", change: "– –" },
  { title: "Cancellation and retention", volume: 1224, pct: "18%", change: "– –" },
  { title: "Technical support fixed",    volume: 866,  pct: "13%", change: "– –" },
  { title: "Technical support mobile",   volume: 798,  pct: "12%", change: "– –" },
  { title: "Commercial and sales",       volume: 670,  pct: "10%", change: "– –" },
  { title: "Account administration",     volume: 336,  pct: "5%",  change: "– –" },
  { title: "Logistics and fulfillment",  volume: 285,  pct: "4%",  change: "– –" },
  { title: "Network operations",         volume: 198,  pct: "3%",  change: "– –" },
  { title: "Compliance inquiries",       volume: 142,  pct: "2%",  change: "– –" },
];

const PERF_COLS = [
  { key: "title",  label: "Title",     width: "50%", align: "left" },
  { key: "volume", label: "Volume",    width: "16%", align: "right", sorted: true },
  { key: "pct",    label: "Volume %",  width: "17%", align: "center" },
  { key: "change", label: "Change %",  width: "17%", align: "center" },
];

export default function PerformanceCard() {
  const [activeTab, setActiveTab] = React.useState("Volume Driver");
  const [page, setPage] = React.useState(0);
  const pageSize = 7;
  const totalPages = Math.ceil(PERF_DATA.length / pageSize);
  const pageData = PERF_DATA.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <Card>
      <div style={pfStyles.title}>Contact Center Performance</div>
      <div style={pfStyles.subtitle}>Key drivers on volume, negative customer sentiment, unresolved interactions, and Predicted CSAT</div>

      <div style={pfStyles.tabRow}>
        {PERF_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setPage(0); }}
            style={{
              ...pfStyles.tabBtn,
              color: activeTab === tab ? "#245BFF" : "rgba(0,0,0,0.60)",
              fontWeight: activeTab === tab ? 600 : 400,
              borderBottom: activeTab === tab ? "2px solid #245BFF" : "2px solid transparent",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={pfStyles.tableHeader}>
        {PERF_COLS.map((col) => (
          <div key={col.key} style={{ ...pfStyles.th, width: col.width, textAlign: col.align }}>
            <span>{col.label}</span>
            {col.sorted && (
              <span className="material-symbols-outlined" style={{ fontSize: 14, color: "rgba(0,0,0,0.60)" }}>arrow_downward</span>
            )}
          </div>
        ))}
      </div>

      {pageData.map((row, i) => (
        <div key={i} style={{
          ...pfStyles.tableRow,
          borderBottom: i < pageData.length - 1 ? "1px solid #F0F2FA" : "none",
        }}>
          <div style={{ ...pfStyles.td, width: "50%", textAlign: "left" }}>{row.title}</div>
          <div style={{ ...pfStyles.td, width: "16%", textAlign: "right" }}>{row.volume.toLocaleString()}</div>
          <div style={{ ...pfStyles.td, width: "17%", textAlign: "center" }}>{row.pct}</div>
          <div style={{ ...pfStyles.td, width: "17%", textAlign: "center", color: "rgba(0,0,0,0.38)" }}>{row.change}</div>
        </div>
      ))}

      {totalPages > 1 && (
        // Pagination — table-local. Promote to a shared <Pagination> when a 3rd table appears.
        <div style={pfStyles.pagination}>
          <Button
            variant="text"
            uppercase={false}
            disabled={page === 0}
            onClick={() => page > 0 && setPage(page - 1)}
            leadingIcon={<span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_left</span>}
          >
            Previous
          </Button>
          <span style={pfStyles.pageInfo}>{page + 1}/{totalPages}</span>
          <Button
            variant="text"
            uppercase={false}
            disabled={page >= totalPages - 1}
            onClick={() => page < totalPages - 1 && setPage(page + 1)}
            trailingIcon={<span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>}
            style={{ color: page >= totalPages - 1 ? undefined : "var(--color-button-primary-bg)" }}
          >
            Next
          </Button>
        </div>
      )}
    </Card>
  );
}

const pfStyles = {
  title: { fontFamily: '"Mulish", sans-serif', fontSize: 16, fontWeight: 700, color: "#1F232A", lineHeight: 1.4, marginBottom: 2 },
  subtitle: { fontFamily: '"Mulish", sans-serif', fontSize: 13, fontWeight: 400, color: "rgba(0,0,0,0.60)", lineHeight: 1.4 },
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
    color: "rgba(0,0,0,0.87)", display: "flex", alignItems: "center", gap: 4,
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
