"use client";

import React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { InfoTip, RagChip } from "./KpiSidecarParts";
import KpiSparkline from "./KpiSparkline";
import {
  KPIS, CATEGORIES, DATE_RANGE, ON_TRACK_TOTAL, RAG_HEX,
  statusOf, gapOf, targetLabel, valueLabel,
} from "./mocks/kpiGoals";

// Fork B — Progressive / shallow. Reads top-down by depth: 3 category rings
// answer "are we OK?" first; a triage list shows only what's off; each row
// expands INLINE to reveal trend + gap (the L1→L2 essential) without leaving
// the page. The full sidecar opens only for agent/week/call detail.
export default function KpiCardsProgressive({ onOpenKpi }) {
  const [showAll, setShowAll] = React.useState(false);
  const [openId, setOpenId] = React.useState(null);
  const ranked = [...KPIS].sort((a, b) => rank(a) - rank(b));
  const rows = showAll ? ranked : ranked.filter((k) => statusOf(k).rag !== "green");

  return (
    <div style={s.wrap}>
      <header style={s.header}>
        <div>
          <h2 style={s.title}>KPI’s and Goals</h2>
          <p style={s.subtitle}>Overall health first — open only what needs attention.</p>
        </div>
        <span style={s.dateBadge}>{DATE_RANGE}</span>
      </header>

      {/* L0 — category rings */}
      <div style={s.rings}>
        <div style={s.overall}>
          <Ring pct={(ON_TRACK_TOTAL / KPIS.length) * 100} rag="amber" big />
          <span style={s.overallLabel}><strong>{ON_TRACK_TOTAL}/{KPIS.length}</strong> on track</span>
        </div>
        {CATEGORIES.map((c) => (
          <button key={c.id} type="button" style={s.catCard} onClick={() => onOpenKpi?.({ category: c.name })}>
            <div style={s.catTop}>
              <Ring pct={c.score} rag={c.rag} />
              <ChevronRight size={16} color="var(--color-text-tertiary)" />
            </div>
            <span style={s.catName}>{c.name}</span>
            <p style={s.catBlurb}>{c.blurb}</p>
            <div style={s.catFoot}>
              <RagChip rag={c.rag} label={c.status} />
              <span style={s.catMeta}>{c.onTrack} of {c.total} on track</span>
            </div>
          </button>
        ))}
      </div>

      {/* Triage list — off-target first, expandable inline */}
      <section style={s.listCard}>
        <div style={s.listHead}>
          <span style={s.listTitle}>{showAll ? "All KPIs" : "Needs attention"}</span>
          <button type="button" style={s.linkBtn} onClick={() => setShowAll((v) => !v)}>
            {showAll ? "Show only off-target" : `Show all ${KPIS.length}`}
          </button>
        </div>
        {rows.map((k) => {
          const st = statusOf(k);
          const gap = gapOf(k);
          const open = openId === k.id;
          return (
            <div key={k.id} style={s.rowWrap}>
              <button type="button" style={s.row} onClick={() => setOpenId(open ? null : k.id)}>
                <span style={s.rowName}>{k.name}<InfoTip text={k.tip} /></span>
                <span style={s.rowCat}>{k.category}</span>
                <span style={s.rowValue}>{valueLabel(k)}</span>
                <RagChip rag={st.rag} label={st.label} />
                <ChevronDown size={15} color="var(--color-text-tertiary)" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
              </button>
              {open && (
                <div style={s.expand}>
                  <div style={s.expandMeta}>
                    <span style={s.metaItem}>Target <strong>{targetLabel(k)}</strong></span>
                    {gap && <span style={s.metaItem}>Gap <strong style={{ color: RAG_HEX[st.rag].fg }}>{gap}</strong></span>}
                    <span style={s.spacer} />
                    <button type="button" style={s.drillBtn} onClick={(e) => { e.stopPropagation(); onOpenKpi?.(k); }}>
                      Open agents <ChevronRight size={14} />
                    </button>
                  </div>
                  <KpiSparkline trend={k.trend} target={k.target} rag={st.rag} height={64} />
                </div>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}

const rank = (k) => ({ red: 0, amber: 1, grey: 2, green: 3 }[statusOf(k).rag]);

function Ring({ pct, rag, big = false }) {
  const size = big ? 76 : 48;
  const sw = big ? 8 : 6;
  const r = (size - sw) / 2;
  const c = 2 * Math.PI * r;
  const col = RAG_HEX[rag] || RAG_HEX.grey;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-alt)" strokeWidth={sw} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={col.line} strokeWidth={sw}
        strokeDasharray={`${(pct / 100) * c} ${c}`} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x="50%" y="52%" dominantBaseline="middle" textAnchor="middle"
        style={{ fontSize: big ? 11 : 13, fontWeight: 800, fill: "var(--color-text-deep)" }}>
        {big ? "" : Math.round(pct)}
      </text>
    </svg>
  );
}

const s = {
  wrap: { display: "flex", flexDirection: "column", gap: 20 },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 },
  title: { fontSize: 18, fontWeight: 800, color: "var(--color-text-deep)", margin: 0 },
  subtitle: { fontSize: 13, color: "var(--color-text-tertiary)", margin: "4px 0 0" },
  dateBadge: { fontSize: 12, fontWeight: 600, color: "var(--color-text-medium)", background: "var(--surface-alt)", borderRadius: 999, padding: "5px 12px" },
  rings: { display: "grid", gridTemplateColumns: "auto repeat(3, 1fr)", gap: 14, alignItems: "stretch" },
  overall: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 18px", background: "var(--surface-alt)", borderRadius: 12, minWidth: 120 },
  overallLabel: { fontSize: 13, color: "var(--color-text-medium)" },
  catCard: { display: "flex", flexDirection: "column", gap: 8, padding: "14px 16px", border: "1px solid var(--color-divider-card)", borderRadius: 12, background: "#fff", cursor: "pointer", textAlign: "left", fontFamily: "var(--font-sans)" },
  catTop: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  catName: { fontSize: 14, fontWeight: 800, color: "var(--color-text-deep)" },
  catBlurb: { fontSize: 12, color: "var(--color-text-tertiary)", margin: 0, lineHeight: 1.4 },
  catFoot: { display: "flex", alignItems: "center", gap: 10, marginTop: 2 },
  catMeta: { fontSize: 11.5, color: "var(--color-text-tertiary)" },
  listCard: { border: "1px solid var(--color-divider-card)", borderRadius: 12, overflow: "hidden" },
  listHead: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "var(--surface-alt)" },
  listTitle: { fontSize: 13, fontWeight: 800, color: "var(--color-text-deep)" },
  linkBtn: { border: "none", background: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "var(--do-brand-blue)", fontFamily: "var(--font-sans)" },
  rowWrap: { borderTop: "1px solid var(--color-divider-card)" },
  row: { width: "100%", display: "grid", gridTemplateColumns: "1fr 90px 64px auto 18px", alignItems: "center", gap: 12, padding: "12px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left", fontFamily: "var(--font-sans)" },
  rowName: { fontSize: 13.5, fontWeight: 700, color: "var(--color-text-deep)", display: "inline-flex", alignItems: "center" },
  rowCat: { fontSize: 11.5, color: "var(--color-text-tertiary)" },
  rowValue: { fontSize: 14, fontWeight: 800, color: "var(--color-text-deep)", textAlign: "right" },
  expand: { padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 10 },
  expandMeta: { display: "flex", alignItems: "center", gap: 16 },
  metaItem: { fontSize: 12, color: "var(--color-text-tertiary)" },
  spacer: { flex: 1 },
  drillBtn: { display: "inline-flex", alignItems: "center", gap: 4, border: "1px solid var(--color-divider-card)", background: "#fff", borderRadius: 8, padding: "5px 10px", fontSize: 12, fontWeight: 700, color: "var(--color-text-deep)", cursor: "pointer", fontFamily: "var(--font-sans)" },
};
