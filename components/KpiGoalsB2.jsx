"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import KpiRing from "./KpiRing";
import KpiSparkline from "./KpiSparkline";
import KpiDrillInline from "./KpiDrillInline";
import { InfoTip, RagChip } from "./KpiSidecarParts";
import {
  KPIS, CATEGORIES, DATE_RANGE, ON_TRACK_TOTAL, RAG_HEX,
  statusOf, gapOf, targetLabel, valueLabel,
} from "./mocks/kpiGoals";
import { KPI_CONFIGS, DEFAULT_KPI_ID } from "./mocks/kpiSidecar";

// b2 — Progressive, polished. Same shape as b1 (rings → triage → inline) with
// a tighter hierarchy, shared rings, a per-row trend peek, and the in-place
// breadcrumb drill (no drawer).
export default function KpiGoalsB2() {
  const [showAll, setShowAll] = React.useState(false);
  const [openId, setOpenId] = React.useState(null);
  const [drill, setDrill] = React.useState(null);
  const ranked = [...KPIS].sort((a, b) => rank(a) - rank(b));
  const rows = showAll ? ranked : ranked.filter((k) => statusOf(k).rag !== "green");
  const drillKpi = drill ? { ...KPI_CONFIGS[DEFAULT_KPI_ID], name: drill.name, subtitle: drill.tip } : null;

  return (
    <div style={s.wrap}>
      <header style={s.header}>
        <div>
          <h2 style={s.title}>KPI’s and Goals</h2>
          <p style={s.subtitle}>Overall health first. Open only what needs attention.</p>
        </div>
        <span style={s.dateBadge}>{DATE_RANGE}</span>
      </header>

      <div style={s.rings}>
        <div style={s.overall}>
          <KpiRing pct={(ON_TRACK_TOTAL / KPIS.length) * 100} rag="amber" size={66} stroke={7} />
          <span style={s.overallLabel}><strong>{ON_TRACK_TOTAL}</strong>/{KPIS.length} on track</span>
        </div>
        {CATEGORIES.map((c) => (
          <div key={c.id} style={s.catCard}>
            <KpiRing pct={c.score} rag={c.rag} size={42} label={c.score} />
            <div style={s.catText}>
              <span style={s.catName}>{c.name}</span>
              <p style={s.catBlurb}>{c.blurb}</p>
              <RagChip rag={c.rag} label={`${c.status} · ${c.onTrack}/${c.total}`} />
            </div>
          </div>
        ))}
      </div>

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
                <span style={s.peek}><KpiSparkline trend={k.trend} target={k.target} rag={st.rag} height={28} /></span>
                <span style={s.rowValue}>{valueLabel(k)}</span>
                <RagChip rag={st.rag} label={st.label} />
                <ChevronDown size={15} color="var(--color-text-tertiary)" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
              </button>
              {open && (
                <div style={s.expand}>
                  <span style={s.metaItem}>Target <strong>{targetLabel(k)}</strong></span>
                  {gap && <span style={s.metaItem}>Gap <strong style={{ color: RAG_HEX[st.rag].fg }}>{gap}</strong></span>}
                  <span style={s.spacer} />
                  <button type="button" style={s.drillBtn} onClick={(e) => { e.stopPropagation(); setDrill(k); }}>View agents</button>
                </div>
              )}
            </div>
          );
        })}
      </section>

      {drill && (
        <section style={s.detail}>
          <KpiDrillInline kpi={drillKpi} onClose={() => setDrill(null)} />
        </section>
      )}
    </div>
  );
}

const rank = (k) => ({ red: 0, amber: 1, grey: 2, green: 3 }[statusOf(k).rag]);

const s = {
  wrap: { display: "flex", flexDirection: "column", gap: 20 },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 },
  title: { fontSize: 18, fontWeight: 800, color: "var(--color-text-deep)", margin: 0 },
  subtitle: { fontSize: 13, color: "var(--color-text-tertiary)", margin: "4px 0 0" },
  dateBadge: { fontSize: 12, fontWeight: 600, color: "var(--color-text-medium)", background: "var(--surface-alt)", borderRadius: 999, padding: "5px 12px" },
  rings: { display: "grid", gridTemplateColumns: "auto repeat(3, 1fr)", gap: 14 },
  overall: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 18px", background: "var(--surface-alt)", borderRadius: 12, minWidth: 116 },
  overallLabel: { fontSize: 13, color: "var(--color-text-medium)" },
  catCard: { display: "flex", gap: 12, padding: "14px 16px", border: "1px solid var(--color-divider-card)", borderRadius: 12, alignItems: "flex-start" },
  catText: { display: "flex", flexDirection: "column", gap: 5, minWidth: 0 },
  catName: { fontSize: 14, fontWeight: 800, color: "var(--color-text-deep)" },
  catBlurb: { fontSize: 11.5, color: "var(--color-text-tertiary)", margin: 0, lineHeight: 1.4 },
  listCard: { border: "1px solid var(--color-divider-card)", borderRadius: 12, overflow: "hidden" },
  listHead: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "var(--surface-alt)" },
  listTitle: { fontSize: 13, fontWeight: 800, color: "var(--color-text-deep)" },
  linkBtn: { border: "none", background: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "var(--do-brand-blue)", fontFamily: "var(--font-sans)" },
  rowWrap: { borderTop: "1px solid var(--color-divider-card)" },
  row: { width: "100%", display: "grid", gridTemplateColumns: "1.4fr 80px 90px 56px auto 18px", alignItems: "center", gap: 14, padding: "12px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left", fontFamily: "var(--font-sans)" },
  rowName: { fontSize: 13.5, fontWeight: 700, color: "var(--color-text-deep)", display: "inline-flex", alignItems: "center" },
  rowCat: { fontSize: 11.5, color: "var(--color-text-tertiary)" },
  peek: { display: "block", width: 90 },
  rowValue: { fontSize: 14, fontWeight: 800, color: "var(--color-text-deep)", textAlign: "right" },
  expand: { display: "flex", alignItems: "center", gap: 16, padding: "0 16px 14px" },
  metaItem: { fontSize: 12, color: "var(--color-text-tertiary)" },
  spacer: { flex: 1 },
  drillBtn: { border: "1px solid var(--color-divider-card)", background: "#fff", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, color: "var(--color-text-deep)", cursor: "pointer", fontFamily: "var(--font-sans)" },
  detail: { border: "1px solid var(--color-divider-card)", borderRadius: 12, padding: "20px 22px", background: "#fff", boxShadow: "var(--shadow-card)" },
};
