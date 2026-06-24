"use client";

import React from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import KpiTile from "./KpiTile";
import KpiDrillInline from "./KpiDrillInline";
import { RagChip } from "./KpiSidecarParts";
import { KPIS, CATEGORIES, ON_TRACK_TOTAL, statusOf } from "./mocks/kpiGoals";
import { KPI_CONFIGS, DEFAULT_KPI_ID } from "./mocks/kpiSidecar";

const DRAWER = 468;
const PER_PAGE = 3;
const POPPINS = "'Poppins', sans-serif";
const RING_COLORS = ["#004BEF", "#6B89FF", "#A5B4FC"];

// b8 — activity rings replace the parent cards. Left: a concentric ring chart
// (overall on-track) + the category list. Right: the needs-attention KPI cards,
// horizontally aligned. Selecting a card opens its drill in a side drawer.
export default function KpiGoalsB8() {
  const [sel, setSel] = React.useState(null);
  const [page, setPage] = React.useState(0);

  const attention = KPIS.filter((k) => statusOf(k).rag !== "green");
  const pages = Math.max(1, Math.ceil(attention.length / PER_PAGE));
  const safePage = Math.min(page, pages - 1);
  const visible = attention.slice(safePage * PER_PAGE, safePage * PER_PAGE + PER_PAGE);
  const drillKpi = sel ? { ...KPI_CONFIGS[DEFAULT_KPI_ID], name: sel.name, subtitle: sel.tip } : null;

  return (
    <div style={{ ...s.wrap, paddingRight: sel ? DRAWER + 8 : 0 }}>
      <header style={s.header}>
        <h2 style={s.title}>KPI’s and Goals</h2>
        <p style={s.subtitle}>Activity rings + attention cards</p>
      </header>

      <div style={s.body}>
        {/* left: rings + category list */}
        <aside style={s.left}>
          <MultiRing categories={CATEGORIES} center={`${ON_TRACK_TOTAL}/${KPIS.length}`} />
          <div style={s.catList}>
            {CATEGORIES.map((c) => (
              <button key={c.id} type="button" style={s.catRow}>
                <span style={{ ...s.catDot, background: RING_COLORS[CATEGORIES.indexOf(c)] }} />
                <span style={s.catName}>{c.name}</span>
                <span style={s.catScore}>{c.score}/100</span>
                <RagChip rag={c.rag} label={c.status} />
                <ChevronRight size={16} color="#8C90A6" />
              </button>
            ))}
          </div>
        </aside>

        {/* right: 3 attention KPI cards in a row */}
        <div style={s.right}>
          <div style={s.rightHead}>
            <span style={s.attnLabel}>Needs attention</span>
            <div style={s.pagerNav}>
              <button type="button" style={{ ...s.pageBtn, ...(safePage === 0 ? s.pageBtnOff : null) }} disabled={safePage === 0} onClick={() => setPage((p) => p - 1)} aria-label="Previous"><ChevronLeft size={16} /></button>
              <span style={s.pageNum}>{safePage + 1}/{pages}</span>
              <button type="button" style={{ ...s.pageBtn, ...(safePage >= pages - 1 ? s.pageBtnOff : null) }} disabled={safePage >= pages - 1} onClick={() => setPage((p) => p + 1)} aria-label="Next"><ChevronRight size={16} /></button>
            </div>
          </div>
          <div style={{ ...s.grid, gridTemplateColumns: `repeat(${sel ? 1 : 3}, minmax(0, 1fr))` }}>
            {visible.map((k) => (
              <KpiTile key={k.id} k={k} selected={sel?.id === k.id} onClick={() => setSel(sel?.id === k.id ? null : k)} />
            ))}
          </div>
        </div>
      </div>

      {sel && (
        <aside style={s.drawer}>
          <button type="button" style={s.drawerX} onClick={() => setSel(null)} aria-label="Close"><X size={18} /></button>
          <KpiDrillInline kpi={drillKpi} onClose={() => setSel(null)} />
        </aside>
      )}
    </div>
  );
}

// Concentric activity rings — one arc per category, decreasing radius.
function MultiRing({ categories, center }) {
  const size = 180, stroke = 13, gap = 5;
  const rings = categories.map((c, i) => {
    const r = size / 2 - stroke / 2 - i * (stroke + gap);
    const circ = 2 * Math.PI * r;
    return { r, circ, pct: c.score, color: RING_COLORS[i] };
  });
  const [big, sub] = center.split("/").length ? [center, "on track"] : [center, ""];
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      {rings.map((ring, i) => (
        <g key={i}>
          <circle cx={size / 2} cy={size / 2} r={ring.r} fill="none" stroke="#EEF1F8" strokeWidth={stroke} />
          <circle cx={size / 2} cy={size / 2} r={ring.r} fill="none" stroke={ring.color} strokeWidth={stroke}
            strokeDasharray={`${(ring.pct / 100) * ring.circ} ${ring.circ}`} strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`} />
        </g>
      ))}
      <text x="50%" y="48%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 22, fontWeight: 800, fill: "#2C2F42", fontFamily: POPPINS }}>{big}</text>
      <text x="50%" y="60%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 11, fill: "#8C90A6", fontFamily: POPPINS }}>{sub}</text>
    </svg>
  );
}

const s = {
  wrap: { display: "flex", flexDirection: "column", gap: 18, transition: "padding-right .2s ease", fontFamily: POPPINS },
  header: { display: "flex", flexDirection: "column", gap: 4 },
  title: { fontSize: 16, fontWeight: 500, color: "#171B2C", margin: 0, letterSpacing: "0.1px" },
  subtitle: { fontSize: 14, color: "#5B5E6F", margin: 0, letterSpacing: "0.25px" },
  body: { display: "flex", gap: 24, alignItems: "flex-start" },
  left: { width: 300, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16, alignItems: "center" },
  catList: { width: "100%", display: "flex", flexDirection: "column", gap: 6 },
  catRow: { width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", border: "1px solid transparent", borderRadius: 10, background: "none", cursor: "pointer", textAlign: "left", fontFamily: POPPINS },
  catDot: { width: 10, height: 10, borderRadius: 999, flexShrink: 0 },
  catName: { fontSize: 13, fontWeight: 600, color: "#2C2F42", whiteSpace: "nowrap" },
  catScore: { flex: 1, fontSize: 12, color: "#8C90A6" },
  right: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 12 },
  rightHead: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 },
  attnLabel: { fontSize: 13, fontWeight: 800, color: "#2C2F42", textTransform: "uppercase", letterSpacing: "0.04em" },
  grid: { display: "grid", gap: 14 },
  pagerNav: { display: "flex", alignItems: "center", gap: 6 },
  pageBtn: { width: 28, height: 28, borderRadius: 8, border: "1px solid var(--color-divider-card)", background: "#fff", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-medium)" },
  pageBtnOff: { opacity: 0.4, cursor: "default" },
  pageNum: { fontSize: 12, fontWeight: 600, color: "#2C2F42", minWidth: 32, textAlign: "center" },
  drawer: { position: "fixed", top: 0, right: 0, height: "100vh", width: DRAWER, background: "#FFFFFF", boxShadow: "-14px 0 36px rgba(20,24,40,0.12)", padding: "24px 24px 40px", overflowY: "auto", zIndex: 50 },
  drawerX: { position: "absolute", top: 18, right: 18, width: 32, height: 32, borderRadius: 8, border: "none", background: "var(--surface-alt)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-medium)", zIndex: 1 },
};
