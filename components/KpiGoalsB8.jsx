"use client";

import React from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import KpiTile from "./KpiTile";
import KpiDrillInline from "./KpiDrillInline";
import { RagChip } from "./KpiSidecarParts";
import { KPIS, CATEGORIES, ON_TRACK_TOTAL, statusOf } from "./mocks/kpiGoals";
import { KPI_CONFIGS, DEFAULT_KPI_ID } from "./mocks/kpiSidecar";

const PER_PAGE = 3;
const POPPINS = "'Poppins', sans-serif";
const RING_COLORS = ["#004BEF", "#6B89FF", "#A5B4FC"];
const shownRange = (page, total) => total === 0 ? "0" : `${page * PER_PAGE + 1}–${Math.min(total, page * PER_PAGE + PER_PAGE)}`;

// b8 — activity rings (left) + attention cards (right). Selecting a card opens
// its drill as a floating side card to the right (the content shifts left); a
// category row filters the cards to that goal area.
export default function KpiGoalsB8() {
  const [sel, setSel] = React.useState(null);
  const [page, setPage] = React.useState(0);
  const [catFilter, setCatFilter] = React.useState(null);

  const attention = KPIS.filter((k) => statusOf(k).rag !== "green" && (!catFilter || k.category === catFilter));
  const pages = Math.max(1, Math.ceil(attention.length / PER_PAGE));
  const safePage = Math.min(page, pages - 1);
  const visible = attention.slice(safePage * PER_PAGE, safePage * PER_PAGE + PER_PAGE);
  const cols = sel ? 2 : 3;
  const drillKpi = sel ? { ...KPI_CONFIGS[DEFAULT_KPI_ID], name: sel.name, subtitle: sel.tip } : null;

  const pickCat = (name) => { setCatFilter((c) => (c === name ? null : name)); setPage(0); };

  return (
    <div style={s.wrap}>
      <div style={s.main}>
        <header style={s.header}>
          <h2 style={s.title}>KPI’s and Goals</h2>
          <p style={s.subtitle}>Activity rings + attention cards</p>
        </header>

        <div style={s.body}>
          {/* left: rings + category filter list */}
          <aside style={s.left}>
            <MultiRing categories={CATEGORIES} center={`${ON_TRACK_TOTAL}/${KPIS.length}`} />
            <div style={s.catList}>
              {CATEGORIES.map((c, i) => {
                const on = catFilter === c.name;
                return (
                  <button key={c.id} type="button" onClick={() => pickCat(c.name)} style={{ ...s.catRow, ...(on ? s.catRowOn : null) }}>
                    <span style={{ ...s.catDot, background: RING_COLORS[i] }} />
                    <span style={s.catName}>{c.name}</span>
                    <span style={s.catScore}>{c.score}/100</span>
                    <RagChip rag={c.rag} label={c.status} />
                    <ChevronRight size={16} color={on ? "#004BEF" : "#8C90A6"} />
                  </button>
                );
              })}
            </div>
          </aside>

          {/* right: attention cards + pagination */}
          <div style={s.right}>
            <span style={s.attnLabel}>{catFilter ? `${catFilter} · needs attention` : "Needs attention"}</span>
            <div style={{ ...s.grid, gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
              {visible.map((k) => (
                <KpiTile key={k.id} k={k} fill selected={sel?.id === k.id} onClick={() => setSel(sel?.id === k.id ? null : k)} />
              ))}
              {!visible.length && <p style={s.empty}>No KPIs need attention here.</p>}
            </div>
            <div style={s.pager}>
              <span style={s.pagerInfo}>{shownRange(safePage, attention.length)} of {attention.length}</span>
              <div style={s.pagerNav}>
                <button type="button" style={{ ...s.pageBtn, ...(safePage === 0 ? s.pageBtnOff : null) }} disabled={safePage === 0} onClick={() => setPage((p) => p - 1)} aria-label="Previous"><ChevronLeft size={16} /></button>
                <span style={s.pageNum}>{safePage + 1}/{pages}</span>
                <button type="button" style={{ ...s.pageBtn, ...(safePage >= pages - 1 ? s.pageBtnOff : null) }} disabled={safePage >= pages - 1} onClick={() => setPage((p) => p + 1)} aria-label="Next"><ChevronRight size={16} /></button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* floating side card — content shifts left, no overlay */}
      {sel && (
        <aside style={s.sideCard}>
          <button type="button" style={s.cardX} onClick={() => setSel(null)} aria-label="Close"><X size={18} /></button>
          <KpiDrillInline kpi={drillKpi} onClose={() => setSel(null)} />
        </aside>
      )}
    </div>
  );
}

function MultiRing({ categories, center }) {
  const size = 132, stroke = 10, gap = 4;
  const rings = categories.map((c, i) => {
    const r = size / 2 - stroke / 2 - i * (stroke + gap);
    const circ = 2 * Math.PI * r;
    return { r, circ, pct: c.score, color: RING_COLORS[i] };
  });
  const [big, sub] = [center, "on track"];
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
      <text x="50%" y="47%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 18, fontWeight: 800, fill: "#2C2F42", fontFamily: POPPINS }}>{big}</text>
      <text x="50%" y="61%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 10, fill: "#8C90A6", fontFamily: POPPINS }}>{sub}</text>
    </svg>
  );
}

const s = {
  wrap: { display: "flex", gap: 18, alignItems: "stretch", fontFamily: POPPINS },
  main: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 16 },
  header: { display: "flex", flexDirection: "column", gap: 4 },
  title: { fontSize: 16, fontWeight: 500, color: "#171B2C", margin: 0, letterSpacing: "0.1px" },
  subtitle: { fontSize: 14, color: "#5B5E6F", margin: 0, letterSpacing: "0.25px" },
  body: { display: "flex", gap: 24, alignItems: "stretch", flex: 1 },
  left: { width: 232, flexShrink: 0, display: "flex", flexDirection: "column", gap: 14, alignItems: "center" },
  catList: { width: "100%", display: "flex", flexDirection: "column", gap: 6 },
  catRow: { width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", border: "1px solid transparent", borderRadius: 10, background: "none", cursor: "pointer", textAlign: "left", fontFamily: POPPINS },
  catRowOn: { borderColor: "#C9D6FF", background: "#F5F7FF" },
  catDot: { width: 10, height: 10, borderRadius: 999, flexShrink: 0 },
  catName: { fontSize: 13, fontWeight: 600, color: "#2C2F42", whiteSpace: "nowrap" },
  catScore: { flex: 1, fontSize: 12, color: "#8C90A6" },
  right: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 12 },
  attnLabel: { fontSize: 13, fontWeight: 800, color: "#2C2F42", textTransform: "uppercase", letterSpacing: "0.04em" },
  grid: { display: "grid", gap: 14, flex: 1, alignItems: "stretch" },
  empty: { gridColumn: "1 / -1", padding: "24px 0", fontSize: 13, color: "#8C90A6", textAlign: "center" },
  pager: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, borderTop: "1px solid var(--color-divider-card)", paddingTop: 12 },
  pagerInfo: { fontSize: 12, color: "#5B5E6F" },
  pagerNav: { display: "flex", alignItems: "center", gap: 6 },
  pageBtn: { width: 28, height: 28, borderRadius: 8, border: "1px solid var(--color-divider-card)", background: "#fff", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-medium)" },
  pageBtnOff: { opacity: 0.4, cursor: "default" },
  pageNum: { fontSize: 12, fontWeight: 600, color: "#2C2F42", minWidth: 32, textAlign: "center" },
  sideCard: { position: "sticky", top: 16, width: 440, flexShrink: 0, minWidth: 0, alignSelf: "flex-start", background: "#FFFFFF", border: "1px solid var(--color-divider-card)", borderRadius: 16, boxShadow: "0 12px 32px rgba(20,24,40,0.10)", padding: "22px 22px 28px", maxHeight: "calc(100vh - 32px)", overflowY: "auto" },
  cardX: { position: "absolute", top: 16, right: 16, width: 32, height: 32, borderRadius: 8, border: "none", background: "var(--surface-alt)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-medium)", zIndex: 1 },
};
