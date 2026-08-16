"use client";

import React from "react";
import { RagChip } from "./KpiSidecarParts";
import { PageHeader, Pagination, ActivityRing, KpiTile } from "./ds";
import { KPIS, CATEGORIES, ON_TRACK_TOTAL, statusOf } from "./mocks/kpiGoals";
import { TYPE, COLORS, RADIUS } from "./designTokens";

const PER_PAGE = 3;
const RING_COLORS = [COLORS.primary, "#6B89FF", "#A5B4FC"];

// b10 — rings + attention-cards, rebuilt strictly on the 2.0 Design System
// tokens. The ring and category list are linked: hovering / clicking either an
// arc or a row highlights both and filters the cards. Components the DS does not
// yet provide are flagged with a lemon-green DsGapDot (hover for details).
export default function KpiGoalsB10({ onDrill, drillId, creditUsage = false }) {
  const [page, setPage] = React.useState(0);
  const [catFilter, setCatFilter] = React.useState(null);
  const [hover, setHover] = React.useState(null);
  const active = hover || catFilter; // category name currently emphasised

  const attention = KPIS.filter((k) => statusOf(k).rag !== "green" && (!catFilter || k.category === catFilter));
  const pages = Math.max(1, Math.ceil(attention.length / PER_PAGE));
  const safePage = Math.min(page, pages - 1);
  const visible = attention.slice(safePage * PER_PAGE, safePage * PER_PAGE + PER_PAGE);

  const pickCat = (name) => { setCatFilter((c) => (c === name ? null : name)); setPage(0); };
  const select = (k) => onDrill?.(drillId === k.id ? null : k);

  return (
    <div style={s.wrap}>
      <PageHeader
        title="KPI’s and Goals"
        subtitle={creditUsage
          ? "Credit-Usage recreation · built from the components/ds library"
          : "Activity rings + attention cards · Design System 2.0"}
      />

      <div style={s.body}>
        <aside style={s.left}>
          <ActivityRing categories={CATEGORIES} total={KPIS.length} onTrack={ON_TRACK_TOTAL}
            ringColors={RING_COLORS} activeName={active} onHover={setHover} onPick={pickCat} />
          <div style={s.catList}>
            {CATEGORIES.map((c, i) => {
              const on = catFilter === c.name;
              const hot = active === c.name;
              return (
                <button key={c.id} type="button"
                  onClick={() => pickCat(c.name)}
                  onMouseEnter={() => setHover(c.name)} onMouseLeave={() => setHover(null)}
                  aria-pressed={on}
                  style={{ ...s.catRow, ...(hot ? s.catRowHot : null), ...(on ? s.catRowOn : null) }}>
                  <span style={{ ...s.catDot, background: RING_COLORS[i] }} />
                  <span style={s.catName}>{c.name}</span>
                  <RagChip rag={c.rag} label={c.status} />
                </button>
              );
            })}
          </div>
          {catFilter && (
            <button type="button" style={s.clearBtn} onClick={() => { setCatFilter(null); setPage(0); }}>
              Clear filter
            </button>
          )}
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
  header: { display: "flex", flexDirection: "column", gap: 4 },
  title: { ...TYPE.titleMedium, color: COLORS.textTitle, margin: 0 },
  subtitle: { ...TYPE.bodySmall, color: COLORS.textMedium, margin: 0 },
  body: { display: "flex", gap: 24, alignItems: "stretch" },
  left: { width: 216, flexShrink: 0, display: "flex", flexDirection: "column", gap: 18, alignItems: "center", justifyContent: "center" },
  ringWrap: { position: "relative", display: "inline-flex" },
  catList: { width: "100%", display: "flex", flexDirection: "column", gap: 6 },
  catRow: { width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", border: "1px solid transparent", borderRadius: RADIUS.md, background: "none", cursor: "pointer", textAlign: "left", fontFamily: TYPE.bodyMedium.fontFamily, transition: "background .12s, border-color .12s" },
  catRowHot: { background: "#F7F8FC" },
  catRowOn: { borderColor: "#C9D6FF", background: "#F5F7FF" },
  catDot: { width: 8, height: 8, borderRadius: RADIUS.pill, flexShrink: 0 },
  catName: { ...TYPE.labelLarge, flex: 1, fontWeight: 600, color: COLORS.textBody, whiteSpace: "nowrap" },
  clearBtn: { ...TYPE.labelMedium, alignSelf: "center", border: "none", background: "none", cursor: "pointer", color: COLORS.primary, padding: "2px 6px" },
  right: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 12 },
  attnLabel: { ...TYPE.labelSmall, color: COLORS.textMedium, textTransform: "uppercase" },
  grid: { display: "grid", gap: 16, flex: 1, alignItems: "stretch", gridTemplateColumns: "repeat(3, minmax(0, 1fr))" },
  tileWrap: { position: "relative", display: "flex", minWidth: 0 },
  empty: { gridColumn: "1 / -1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, padding: "32px 0", border: `1px dashed ${COLORS.divider}`, borderRadius: RADIUS.lg },
  emptyTitle: { ...TYPE.labelLarge, fontWeight: 600, color: COLORS.textBody },
  emptySub: { ...TYPE.bodySmall, color: COLORS.textFaint },
  pager: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, borderTop: `1px solid ${COLORS.divider}`, paddingTop: 12 },
  pagerInfo: { ...TYPE.bodySmall, color: COLORS.textMedium },
  pagerNav: { display: "flex", alignItems: "center", gap: 14 },
  pageLink: { ...TYPE.labelLarge, display: "inline-flex", alignItems: "center", gap: 4, border: "none", background: "none", cursor: "pointer", padding: 0, color: COLORS.textMedium },
  pageLinkOn: { color: COLORS.primary },
  pageLinkOff: { color: COLORS.textFaint, cursor: "default" },
  pageNum: { ...TYPE.labelLarge, color: COLORS.textBody },
};
