"use client";

import React from "react";
import KpiCategoryCard from "./KpiCategoryCard";
import KpiTile from "./KpiTile";
import KpiDrillInline from "./KpiDrillInline";
import { KPIS, CATEGORIES, DATE_RANGE } from "./mocks/kpiGoals";
import { KPI_CONFIGS, DEFAULT_KPI_ID } from "./mocks/kpiSidecar";

// b5 — parents on top, selectable (B2 logic). The selected parent's children
// stack vertically below it (only that parent's). Selecting a child opens its
// sidecar beside the children. Parents stay full-width, unaffected.
export default function KpiGoalsB5() {
  const [catId, setCatId] = React.useState(CATEGORIES[0].id);
  const [selKpi, setSelKpi] = React.useState(null);
  const cat = CATEGORIES.find((c) => c.id === catId);
  const kids = KPIS.filter((k) => k.category === cat.name);
  const drillKpi = selKpi ? { ...KPI_CONFIGS[DEFAULT_KPI_ID], name: selKpi.name, subtitle: selKpi.tip } : null;

  const pickCat = (id) => { setCatId(id); setSelKpi(null); };

  return (
    <div style={s.wrap}>
      <header style={s.header}>
        <div>
          <h2 style={s.title}>KPI’s and Goals</h2>
          <p style={s.subtitle}>Pick a goal area, then a KPI to see its detail beside.</p>
        </div>
        <span style={s.dateBadge}>{DATE_RANGE}</span>
      </header>

      {/* parents — full width, selectable */}
      <div style={s.parents}>
        {CATEGORIES.map((c) => (
          <KpiCategoryCard key={c.id} cat={c} selected={c.id === catId} onClick={() => pickCat(c.id)} />
        ))}
      </div>

      {/* selected parent's children (left) + detail (right), inside one card */}
      <div style={s.card}>
        <div style={s.children}>
          {kids.map((k) => (
            <KpiTile key={k.id} k={k} selected={selKpi?.id === k.id} onClick={() => setSelKpi(selKpi?.id === k.id ? null : k)} />
          ))}
        </div>
        <div style={s.detail}>
          {selKpi ? (
            <KpiDrillInline kpi={drillKpi} onClose={() => setSelKpi(null)} />
          ) : (
            <div style={s.empty}>Select a KPI on the left to view its detail.</div>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  wrap: { display: "flex", flexDirection: "column", gap: 16 },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 },
  title: { fontSize: 18, fontWeight: 800, color: "var(--color-text-deep)", margin: 0 },
  subtitle: { fontSize: 13, color: "var(--color-text-tertiary)", margin: "4px 0 0" },
  dateBadge: { fontSize: 12, fontWeight: 600, color: "var(--color-text-medium)", background: "var(--surface-alt)", borderRadius: 999, padding: "5px 12px" },
  parents: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14 },
  card: { display: "flex", gap: 20, alignItems: "flex-start", padding: 18, border: "1px solid #6650A5", borderRadius: 12, background: "#FFFFFF" },
  children: { width: 300, flexShrink: 0, display: "flex", flexDirection: "column", gap: 14 },
  detail: { flex: 1, minWidth: 0, borderLeft: "1px solid var(--color-divider-card)", paddingLeft: 20, minHeight: 320 },
  empty: { height: "100%", minHeight: 280, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "var(--color-text-tertiary)" },
};
