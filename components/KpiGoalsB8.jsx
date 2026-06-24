"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import KpiTile from "./KpiTile";
import { RagChip } from "./KpiSidecarParts";
import { KPIS, CATEGORIES, ON_TRACK_TOTAL, statusOf } from "./mocks/kpiGoals";

const PER_PAGE = 3;
const POPPINS = "'Poppins', sans-serif";
const RING_COLORS = ["#004BEF", "#6B89FF", "#A5B4FC"];

// b8 — activity rings (left) + attention cards (right). Selecting a card reports
// up via onDrill so the side card renders OUTSIDE this card (separate sibling).
// A category row filters the cards to that goal area.
export default function KpiGoalsB8({ onDrill, drillId }) {
  const [page, setPage] = React.useState(0);
  const [catFilter, setCatFilter] = React.useState(null);
  const open = !!drillId;

  const attention = KPIS.filter((k) => statusOf(k).rag !== "green" && (!catFilter || k.category === catFilter));
  const pages = Math.max(1, Math.ceil(attention.length / PER_PAGE));
  const safePage = Math.min(page, pages - 1);
  const visible = attention.slice(safePage * PER_PAGE, safePage * PER_PAGE + PER_PAGE);
  const cols = open ? 1 : 3;

  const pickCat = (name) => { setCatFilter((c) => (c === name ? null : name)); setPage(0); };
  const select = (k) => onDrill?.(drillId === k.id ? null : k);

  return (
    <div style={s.wrap}>
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
              <KpiTile key={k.id} k={k} fill={!open} selected={drillId === k.id} onClick={() => select(k)} />
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
          <circle cx={size / 2} cy={size / 2} r={ring.r} fill="none" stroke="#EEF1F8" strokeWidth={stroke} />
          <circle cx={size / 2} cy={size / 2} r={ring.r} fill="none" stroke={ring.color} strokeWidth={stroke}
            strokeDasharray={`${(ring.pct / 100) * ring.circ} ${ring.circ}`} strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`} />
        </g>
      ))}
      <text x="50%" y="47%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 18, fontWeight: 800, fill: "#2C2F42", fontFamily: POPPINS }}>{center}</text>
      <text x="50%" y="61%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 10, fill: "#8C90A6", fontFamily: POPPINS }}>on track</text>
    </svg>
  );
}

const s = {
  wrap: { display: "flex", flexDirection: "column", gap: 16, fontFamily: POPPINS },
  header: { display: "flex", flexDirection: "column", gap: 4 },
  title: { fontSize: 16, fontWeight: 500, color: "#171B2C", margin: 0, letterSpacing: "0.1px" },
  subtitle: { fontSize: 14, color: "#5B5E6F", margin: 0, letterSpacing: "0.25px" },
  body: { display: "flex", gap: 24, alignItems: "stretch" },
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
  pagerNav: { display: "flex", alignItems: "center", gap: 14 },
  pageLink: { display: "inline-flex", alignItems: "center", gap: 4, border: "none", background: "none", cursor: "pointer", padding: 0, fontSize: 14, fontWeight: 500, color: "#5A5D72", fontFamily: POPPINS, letterSpacing: "0.25px" },
  pageLinkOn: { color: "#004BEF" },
  pageLinkOff: { color: "#B6B9C7", cursor: "default" },
  pageNum: { fontSize: 14, fontWeight: 500, color: "#2C2F42", textAlign: "center" },
};
