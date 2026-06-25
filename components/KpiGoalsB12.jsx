"use client";

import React from "react";
import KpiCategoryCard from "./KpiCategoryCard";
import { PageHeader, Pagination, KpiTile } from "./ds";
import { KPIS, CATEGORIES, statusOf } from "./mocks/kpiGoals";
import { TYPE, COLORS } from "./designTokens";

const PER_PAGE = 3;

// b12 "Vertical cards" — the Reach / Recovery / Quality cards stacked vertically
// on the left as a segmented filter (selected one highlighted), in place of the
// donut ring. Right: the attention KPI tiles + pagination. All DS components.
export default function KpiGoalsB12({ onDrill, drillId }) {
  const [page, setPage] = React.useState(0);
  const [catFilter, setCatFilter] = React.useState(null);

  const attention = KPIS.filter((k) => statusOf(k).rag !== "green" && (!catFilter || k.category === catFilter));
  const pages = Math.max(1, Math.ceil(attention.length / PER_PAGE));
  const safePage = Math.min(page, pages - 1);
  const visible = attention.slice(safePage * PER_PAGE, safePage * PER_PAGE + PER_PAGE);

  const pickCat = (name) => { setCatFilter((c) => (c === name ? null : name)); setPage(0); };
  const select = (k) => onDrill?.(drillId === k.id ? null : k);

  return (
    <div style={s.wrap}>
      <PageHeader title="KPI’s and Goals" subtitle="Category cards (vertical) + attention cards" />

      <div style={s.body}>
        <aside style={s.left}>
          {CATEGORIES.map((c) => (
            <KpiCategoryCard key={c.id} cat={c} selected={catFilter === c.name} onClick={() => pickCat(c.name)} />
          ))}
        </aside>

        <div style={s.right}>
          <span style={s.attnLabel}>{catFilter ? `${catFilter} · needs attention` : "Needs attention"}</span>
          <div style={s.grid}>
            {visible.map((k) => (
              <KpiTile key={k.id} k={k} fill elevated selected={drillId === k.id} onClick={() => select(k)} />
            ))}
            {!visible.length && (
              <div style={s.empty}>
                <span style={s.emptyTitle}>Nothing needs attention{catFilter ? ` in ${catFilter}` : ""}</span>
                <span style={s.emptySub}>All KPIs here are on track.</span>
              </div>
            )}
          </div>
          <Pagination total={attention.length} unit="KPIs" page={safePage + 1} pages={pages}
            onPrev={() => setPage((p) => p - 1)} onNext={() => setPage((p) => p + 1)} />
        </div>
      </div>
    </div>
  );
}

const s = {
  wrap: { display: "flex", flexDirection: "column", gap: 16, fontFamily: TYPE.bodyMedium.fontFamily },
  body: { display: "flex", gap: 24, alignItems: "stretch" },
  left: { width: 300, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12 },
  right: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 12 },
  attnLabel: { ...TYPE.labelSmall, color: COLORS.textMedium, textTransform: "uppercase" },
  grid: { display: "grid", gap: 16, flex: 1, alignItems: "stretch", gridTemplateColumns: "repeat(3, minmax(0, 1fr))" },
  empty: { gridColumn: "1 / -1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, padding: "32px 0", border: `1px dashed ${COLORS.divider}`, borderRadius: 12 },
  emptyTitle: { ...TYPE.labelLarge, fontWeight: 600, color: COLORS.textBody },
  emptySub: { ...TYPE.bodySmall, color: COLORS.textFaint },
};
