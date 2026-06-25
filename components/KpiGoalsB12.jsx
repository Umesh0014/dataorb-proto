"use client";

import React from "react";
import KpiRing from "./KpiRing";
import { RagChip, InfoTip } from "./KpiSidecarParts";
import { PageHeader, Pagination, KpiTile } from "./ds";
import { KPIS, CATEGORIES, statusOf } from "./mocks/kpiGoals";
import { TYPE, COLORS, RADIUS } from "./designTokens";

const PER_PAGE = 3;

// b12 "Vertical cards" — Reach / Recovery / Quality as COMPACT cards stacked
// vertically (segmented filter) in place of the donut. Description moves to an
// ⓘ tooltip so three cards stack to roughly one attention-tile's height.
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
            <CompactCategoryCard key={c.id} cat={c} selected={catFilter === c.name} onClick={() => pickCat(c.name)} />
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

// Compact category card: small ring + name + ⓘ (blurb) + status chip + on-track.
function CompactCategoryCard({ cat, selected, onClick }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={selected}
      style={{ ...cc.card, ...(selected ? cc.selected : null) }}>
      <KpiRing pct={cat.score} rag={cat.rag} size={36} stroke={4} label={cat.score} />
      <span style={cc.body}>
        <span style={cc.titleRow}>
          <span style={cc.name}>{cat.name}</span>
          <InfoTip text={cat.blurb} />
        </span>
        <span style={cc.footer}>
          <RagChip rag={cat.rag} label={cat.status} />
          <span style={cc.onTrack}>{cat.onTrack}/{cat.total} on track</span>
        </span>
      </span>
    </button>
  );
}

const s = {
  wrap: { display: "flex", flexDirection: "column", gap: 16, fontFamily: TYPE.bodyMedium.fontFamily },
  body: { display: "flex", gap: 24, alignItems: "stretch" },
  left: { width: 264, flexShrink: 0, display: "flex", flexDirection: "column", gap: 14, justifyContent: "space-between" },
  right: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 12 },
  attnLabel: { ...TYPE.labelSmall, color: COLORS.textMedium, textTransform: "uppercase" },
  grid: { display: "grid", gap: 16, flex: 1, alignItems: "stretch", gridTemplateColumns: "repeat(3, minmax(0, 1fr))" },
  empty: { gridColumn: "1 / -1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, padding: "32px 0", border: `1px dashed ${COLORS.divider}`, borderRadius: 12 },
  emptyTitle: { ...TYPE.labelLarge, fontWeight: 600, color: COLORS.textBody },
  emptySub: { ...TYPE.bodySmall, color: COLORS.textFaint },
};

const cc = {
  card: { display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: "#FFFFFF", border: `1px solid ${COLORS.divider}`, borderRadius: RADIUS.lg, cursor: "pointer", textAlign: "left", fontFamily: TYPE.bodyMedium.fontFamily, transition: "box-shadow .15s, border-color .15s" },
  selected: { border: "1px solid #6650A5", boxShadow: "0 0 0 1px #6650A5" },
  body: { display: "flex", flexDirection: "column", gap: 6, flex: 1, minWidth: 0 },
  titleRow: { display: "flex", alignItems: "center", gap: 4 },
  name: { ...TYPE.titleSmall, fontWeight: 600, color: COLORS.textBody },
  footer: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  onTrack: { ...TYPE.bodySmall, color: COLORS.textFaint },
};
