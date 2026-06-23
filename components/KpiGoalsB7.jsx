"use client";

import React from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import KpiCategoryCard from "./KpiCategoryCard";
import KpiTile from "./KpiTile";
import KpiDrillInline from "./KpiDrillInline";
import { KPIS, CATEGORIES, statusOf } from "./mocks/kpiGoals";
import { KPI_CONFIGS, DEFAULT_KPI_ID } from "./mocks/kpiSidecar";

const DRAWER = 468;
const PER_PAGE = 3;
const POPPINS = "'Poppins', sans-serif";
const FACETS = [
  { id: "above", label: "Above Target", bg: "#FBFEFC", border: "#B0F0C0", fg: "#00711D" },
  { id: "below", label: "Below Target", bg: "#FFFBFF", border: "#FFDAD6", fg: "#BA1A1A" },
  { id: "other", label: "Other", bg: "#FAFAFA", border: "#DEE1F9", fg: "#5B5E6F" },
];
const facetOf = (k) => {
  const rag = statusOf(k).rag;
  return rag === "green" ? "above" : rag === "red" ? "below" : "other";
};

// b7 — like b3 (filter pills + sidecar drawer) but KPIs stack vertically, 3 per
// page, with pagination below to page through the rest.
export default function KpiGoalsB7() {
  const [sel, setSel] = React.useState(null);
  const [active, setActive] = React.useState(() => new Set());
  const [page, setPage] = React.useState(0);

  const counts = FACETS.reduce((m, f) => ({ ...m, [f.id]: KPIS.filter((k) => facetOf(k) === f.id).length }), {});
  const shown = KPIS.filter((k) => active.size === 0 || active.has(facetOf(k)));
  const pages = Math.max(1, Math.ceil(shown.length / PER_PAGE));
  const safePage = Math.min(page, pages - 1);
  const items = shown.slice(safePage * PER_PAGE, safePage * PER_PAGE + PER_PAGE);
  const drillKpi = sel ? { ...KPI_CONFIGS[DEFAULT_KPI_ID], name: sel.name, subtitle: sel.tip } : null;

  const toggleFacet = (id) => { setActive((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; }); setPage(0); };

  return (
    <div style={{ ...s.wrap, paddingRight: sel ? DRAWER + 8 : 0 }}>
      <header style={s.header}>
        <div>
          <h2 style={s.title}>KPI’s and Goals</h2>
          <p style={s.subtitle}>Track how agents and system performs</p>
        </div>
        <div style={s.filters}>
          {FACETS.map((f) => {
            const on = active.has(f.id);
            const included = active.size === 0 || on;
            return (
              <button key={f.id} type="button" onClick={() => toggleFacet(f.id)}
                style={{ ...s.pill, background: included ? f.bg : "#F5F5F7", borderColor: included ? f.border : "#E5E7EB", color: included ? f.fg : "#9AA1B2", ...(on ? s.pillOn : null) }}>
                {f.label}
                <span style={s.badge}>{counts[f.id]}</span>
              </button>
            );
          })}
        </div>
      </header>

      <div style={s.cats}>
        {CATEGORIES.map((c) => <KpiCategoryCard key={c.id} cat={c} />)}
      </div>

      {/* 3 KPI cards in a horizontal row */}
      <div style={{ ...s.list, gridTemplateColumns: `repeat(${sel ? 2 : 3}, minmax(0, 1fr))` }}>
        {items.map((k) => (
          <KpiTile key={k.id} k={k} selected={sel?.id === k.id} onClick={() => setSel(sel?.id === k.id ? null : k)} />
        ))}
        {!items.length && <p style={s.empty}>No KPIs match the selected filters.</p>}
      </div>

      {/* pagination */}
      <div style={s.pager}>
        <span style={s.pagerInfo}>
          {shown.length === 0 ? "0" : `${safePage * PER_PAGE + 1}–${Math.min(shown.length, safePage * PER_PAGE + PER_PAGE)}`} of {shown.length} KPIs
        </span>
        <div style={s.pagerNav}>
          <button type="button" style={{ ...s.pageBtn, ...(safePage === 0 ? s.pageBtnOff : null) }} disabled={safePage === 0} onClick={() => setPage((p) => p - 1)} aria-label="Previous">
            <ChevronLeft size={18} />
          </button>
          <span style={s.pageNum}>Page {safePage + 1} of {pages}</span>
          <button type="button" style={{ ...s.pageBtn, ...(safePage >= pages - 1 ? s.pageBtnOff : null) }} disabled={safePage >= pages - 1} onClick={() => setPage((p) => p + 1)} aria-label="Next">
            <ChevronRight size={18} />
          </button>
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

const s = {
  wrap: { display: "flex", flexDirection: "column", gap: 18, transition: "padding-right .2s ease", fontFamily: POPPINS },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 },
  title: { fontSize: 16, fontWeight: 500, color: "#171B2C", margin: 0, letterSpacing: "0.1px" },
  subtitle: { fontSize: 14, color: "#5B5E6F", margin: "4px 0 0", letterSpacing: "0.25px" },
  filters: { display: "flex", alignItems: "center", gap: 8, flexShrink: 0 },
  pill: { display: "inline-flex", alignItems: "center", gap: 8, height: 30, padding: "0 16px", borderRadius: 100, border: "1px solid", cursor: "pointer", fontFamily: POPPINS, fontSize: 11, fontWeight: 600, letterSpacing: "0.5px", whiteSpace: "nowrap" },
  pillOn: { boxShadow: "0 0 0 1px currentColor inset" },
  badge: { display: "inline-flex", alignItems: "center", justifyContent: "center", width: 20, height: 20, borderRadius: 999, background: "#EFEFFF", color: "#004BEF", fontSize: 11, fontWeight: 700 },
  cats: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14 },
  list: { display: "grid", gap: 14 },
  empty: { gridColumn: "1 / -1", padding: "24px 0", fontSize: 13, color: "#8C90A6", textAlign: "center" },
  pager: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, borderTop: "1px solid var(--color-divider-card)", paddingTop: 14 },
  pagerInfo: { fontSize: 12, color: "#5B5E6F" },
  pagerNav: { display: "flex", alignItems: "center", gap: 8 },
  pageBtn: { width: 30, height: 30, borderRadius: 8, border: "1px solid var(--color-divider-card)", background: "#fff", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-medium)" },
  pageBtnOff: { opacity: 0.4, cursor: "default" },
  pageNum: { fontSize: 12, fontWeight: 600, color: "#2C2F42", minWidth: 96, textAlign: "center" },
  drawer: { position: "fixed", top: 0, right: 0, height: "100vh", width: DRAWER, background: "#FFFFFF", boxShadow: "-14px 0 36px rgba(20,24,40,0.12)", padding: "24px 24px 40px", overflowY: "auto", zIndex: 50 },
  drawerX: { position: "absolute", top: 18, right: 18, width: 32, height: 32, borderRadius: 8, border: "none", background: "var(--surface-alt)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-medium)", zIndex: 1 },
};
