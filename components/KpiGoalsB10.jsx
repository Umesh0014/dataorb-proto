"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import KpiTile from "./KpiTile";
import DsGapDot, { DS_GAP_GREEN } from "./DsGapDot";
import { RagChip } from "./KpiSidecarParts";
import { KPIS, CATEGORIES, ON_TRACK_TOTAL, statusOf } from "./mocks/kpiGoals";
import { TYPE, COLORS, RADIUS } from "./designTokens";

const PER_PAGE = 3;
const RING_COLORS = [COLORS.primary, "#6B89FF", "#A5B4FC"];

// b10 — the same rings + attention-cards layout, rebuilt strictly on the 2.0
// Design System tokens (TYPE / COLORS from designTokens). Components that the
// design system does NOT yet provide (activity ring, inline sparkline tile)
// are flagged with a lemon-green DsGapDot.
export default function KpiGoalsB10({ onDrill, drillId }) {
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
      <header style={s.header}>
        <h2 style={s.title}>KPI’s and Goals</h2>
        <p style={s.subtitle}>Activity rings + attention cards · Design System 2.0</p>
      </header>

      <div style={s.body}>
        <aside style={s.left}>
          <div style={s.ringWrap}>
            <MultiRing categories={CATEGORIES} center={`${ON_TRACK_TOTAL}/${KPIS.length}`} />
            <DsGapDot
              component="Activity ring (concentric)"
              closest="Graphs & Charts → Donut / Progress"
              why="DS has bar / line / donut charts, but no concentric multi-arc activity ring. Closest is the Donut — add a multi-ring variant to Graphs & Charts."
              style={{ top: 6, right: 6 }}
            />
          </div>
          <div style={s.catList}>
            {CATEGORIES.map((c, i) => {
              const on = catFilter === c.name;
              return (
                <button key={c.id} type="button" onClick={() => pickCat(c.name)} style={{ ...s.catRow, ...(on ? s.catRowOn : null) }}>
                  <span style={{ ...s.catDot, background: RING_COLORS[i] }} />
                  <span style={s.catName}>{c.name}</span>
                  <RagChip rag={c.rag} label={c.status} />
                </button>
              );
            })}
          </div>
        </aside>

        <div style={s.right}>
          <span style={s.attnLabel}>{catFilter ? `${catFilter} · needs attention` : "Needs attention"}</span>
          <div style={s.grid}>
            {visible.map((k) => (
              <div key={k.id} style={s.tileWrap}>
                <KpiTile k={k} fill selected={drillId === k.id} onClick={() => select(k)} />
                <DsGapDot
                  component="KPI attention tile"
                  closest="Cards → Card (+ a sparkline)"
                  why="DS Card exists, but not a KPI card with inline sparkline + target line + delta pill. Modify Card and add a sparkline (Graphs only ships full charts)."
                  style={{ top: 12, right: 12 }}
                />
              </div>
            ))}
            {!visible.length && <p style={s.empty}>No KPIs need attention here.</p>}
          </div>
          <div style={s.pager}>
            <span style={s.pagerInfo}>Total {attention.length} KPIs</span>
            <div style={s.pagerNav}>
              <button type="button" style={{ ...s.pageLink, ...(safePage === 0 ? s.pageLinkOff : null) }} disabled={safePage === 0} onClick={() => setPage((p) => p - 1)}><ChevronLeft size={16} /> Previous</button>
              <span style={s.pageNum}>{safePage + 1}/{pages}</span>
              <button type="button" style={{ ...s.pageLink, ...(safePage >= pages - 1 ? s.pageLinkOff : s.pageLinkOn) }} disabled={safePage >= pages - 1} onClick={() => setPage((p) => p + 1)}>Next <ChevronRight size={16} /></button>
            </div>
          </div>
        </div>
      </div>
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
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      {rings.map((ring, i) => (
        <g key={i}>
          <circle cx={size / 2} cy={size / 2} r={ring.r} fill="none" stroke={COLORS.divider} strokeWidth={stroke} />
          <circle cx={size / 2} cy={size / 2} r={ring.r} fill="none" stroke={ring.color} strokeWidth={stroke}
            strokeDasharray={`${(ring.pct / 100) * ring.circ} ${ring.circ}`} strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`} />
        </g>
      ))}
      <text x="50%" y="47%" textAnchor="middle" dominantBaseline="middle" style={{ ...TYPE.displaySmall, fill: COLORS.textBody }}>{center}</text>
      <text x="50%" y="61%" textAnchor="middle" dominantBaseline="middle" style={{ ...TYPE.chartXSmall, fill: COLORS.textFaint }}>on track</text>
    </svg>
  );
}

const s = {
  wrap: { display: "flex", flexDirection: "column", gap: 16, fontFamily: TYPE.bodyMedium.fontFamily },
  header: { display: "flex", flexDirection: "column", gap: 4 },
  title: { ...TYPE.titleMedium, color: COLORS.textTitle, margin: 0 },
  subtitle: { ...TYPE.bodySmall, color: COLORS.textMedium, margin: 0 },
  body: { display: "flex", gap: 24, alignItems: "stretch" },
  left: { width: 232, flexShrink: 0, display: "flex", flexDirection: "column", gap: 14, alignItems: "center" },
  ringWrap: { position: "relative", display: "inline-flex" },
  catList: { width: "100%", display: "flex", flexDirection: "column", gap: 6 },
  catRow: { width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", border: "1px solid transparent", borderRadius: RADIUS.md, background: "none", cursor: "pointer", textAlign: "left", fontFamily: TYPE.bodyMedium.fontFamily },
  catRowOn: { borderColor: "#C9D6FF", background: "#F5F7FF" },
  catDot: { width: 8, height: 8, borderRadius: RADIUS.pill, flexShrink: 0 },
  catName: { ...TYPE.labelLarge, flex: 1, fontWeight: 600, color: COLORS.textBody, whiteSpace: "nowrap" },
  right: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 12 },
  attnLabel: { ...TYPE.labelSmall, color: COLORS.textMedium, textTransform: "uppercase" },
  grid: { display: "grid", gap: 16, flex: 1, alignItems: "stretch", gridTemplateColumns: "repeat(3, minmax(0, 1fr))" },
  tileWrap: { position: "relative", display: "flex", minWidth: 0 },
  empty: { ...TYPE.bodySmall, gridColumn: "1 / -1", padding: "24px 0", color: COLORS.textFaint, textAlign: "center" },
  pager: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, borderTop: `1px solid ${COLORS.divider}`, paddingTop: 12 },
  pagerInfo: { ...TYPE.bodySmall, color: COLORS.textMedium },
  pagerNav: { display: "flex", alignItems: "center", gap: 14 },
  pageLink: { ...TYPE.labelLarge, display: "inline-flex", alignItems: "center", gap: 4, border: "none", background: "none", cursor: "pointer", padding: 0, color: COLORS.textMedium },
  pageLinkOn: { color: COLORS.primary },
  pageLinkOff: { color: COLORS.textFaint, cursor: "default" },
  pageNum: { ...TYPE.labelLarge, color: COLORS.textBody },
};
