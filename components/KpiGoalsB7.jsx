"use client";

import React from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import KpiCategoryCard from "./KpiCategoryCard";
import KpiTile from "./KpiTile";
import KpiDrillInline from "./KpiDrillInline";
import { KPIS, CATEGORIES, statusOf } from "./mocks/kpiGoals";
import { KPI_CONFIGS, DEFAULT_KPI_ID } from "./mocks/kpiSidecar";

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

// b7 — like b3 (filter pills) but KPIs are a row of 3 with pagination, and the
// detail opens in an in-flow SIDE CARD on the right (not a full-bleed drawer).
export default function KpiGoalsB7() {
  const [sel, setSel] = React.useState(null);
  const [active, setActive] = React.useState(() => new Set());
  const [page, setPage] = React.useState(0);

  const counts = FACETS.reduce((m, f) => ({ ...m, [f.id]: KPIS.filter((k) => facetOf(k) === f.id).length }), {});
  const shown = KPIS.filter((k) => active.size === 0 || active.has(facetOf(k)));
  const pages = Math.max(1, Math.ceil(shown.length / PER_PAGE));
  const safePage = Math.min(page, pages - 1);
  const items = shown.slice(safePage * PER_PAGE, safePage * PER_PAGE + PER_PAGE);
  const cols = sel ? 2 : 3;
  const drillKpi = sel ? { ...KPI_CONFIGS[DEFAULT_KPI_ID], name: sel.name, subtitle: sel.tip } : null;

  const toggleFacet = (id) => { setActive((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; }); setPage(0); };

  return (
    <div style={s.wrap}>
      <div style={s.main}>
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

        <div style={{ ...s.list, gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {items.map((k) => (
            <KpiTile key={k.id} k={k} selected={sel?.id === k.id} onClick={() => setSel(sel?.id === k.id ? null : k)} />
          ))}
          {!items.length && <p style={s.empty}>No KPIs match the selected filters.</p>}
        </div>

        <div style={s.pager}>
          <span style={s.pagerInfo}>Total {shown.length} KPIs</span>
          <div style={s.pagerNav}>
            <button type="button" style={{ ...s.pageLink, ...(safePage === 0 ? s.pageLinkOff : null) }} disabled={safePage === 0} onClick={() => setPage((p) => p - 1)}><ChevronLeft size={16} /> Previous</button>
            <span style={s.pageNum}>{safePage + 1}/{pages}</span>
            <button type="button" style={{ ...s.pageLink, ...(safePage >= pages - 1 ? s.pageLinkOff : s.pageLinkOn) }} disabled={safePage >= pages - 1} onClick={() => setPage((p) => p + 1)}>Next <ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      {sel && (
        <aside style={s.sideCard}>
          <button type="button" style={s.cardX} onClick={() => setSel(null)} aria-label="Close"><X size={18} /></button>
          <KpiDrillInline kpi={drillKpi} onClose={() => setSel(null)} />
        </aside>
      )}
    </div>
  );
}

const s = {
  wrap: { display: "flex", gap: 18, alignItems: "flex-start", fontFamily: POPPINS },
  main: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 18 },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 },
  title: { fontSize: 16, fontWeight: 500, color: "#171B2C", margin: 0, letterSpacing: "0.1px" },
  subtitle: { fontSize: 14, color: "#5B5E6F", margin: "4px 0 0", letterSpacing: "0.25px" },
  filters: { display: "flex", alignItems: "center", gap: 8, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" },
  pill: { display: "inline-flex", alignItems: "center", gap: 8, height: 30, padding: "0 16px", borderRadius: 100, border: "1px solid", cursor: "pointer", fontFamily: POPPINS, fontSize: 11, fontWeight: 600, letterSpacing: "0.5px", whiteSpace: "nowrap" },
  pillOn: { boxShadow: "0 0 0 1px currentColor inset" },
  badge: { display: "inline-flex", alignItems: "center", justifyContent: "center", width: 20, height: 20, borderRadius: 999, background: "#EFEFFF", color: "#004BEF", fontSize: 11, fontWeight: 700 },
  cats: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14 },
  list: { display: "grid", gap: 14 },
  empty: { gridColumn: "1 / -1", padding: "24px 0", fontSize: 13, color: "#8C90A6", textAlign: "center" },
  pager: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, borderTop: "1px solid var(--color-divider-card)", paddingTop: 14 },
  pagerInfo: { fontSize: 12, color: "#5B5E6F" },
  pagerNav: { display: "flex", alignItems: "center", gap: 14 },
  pageLink: { display: "inline-flex", alignItems: "center", gap: 4, border: "none", background: "none", cursor: "pointer", padding: 0, fontSize: 14, fontWeight: 500, color: "#5A5D72", fontFamily: POPPINS, letterSpacing: "0.25px" },
  pageLinkOn: { color: "#004BEF" },
  pageLinkOff: { color: "#B6B9C7", cursor: "default" },
  pageNum: { fontSize: 14, fontWeight: 500, color: "#2C2F42", textAlign: "center" },
  sideCard: { position: "sticky", top: 16, width: 440, flexShrink: 0, minWidth: 0, background: "#FFFFFF", border: "1px solid var(--color-divider-card)", borderRadius: 16, boxShadow: "0 12px 32px rgba(20,24,40,0.10)", padding: "22px 22px 28px", maxHeight: "calc(100vh - 32px)", overflowY: "auto" },
  cardX: { position: "absolute", top: 16, right: 16, width: 32, height: 32, borderRadius: 8, border: "none", background: "var(--surface-alt)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-medium)", zIndex: 1 },
};
