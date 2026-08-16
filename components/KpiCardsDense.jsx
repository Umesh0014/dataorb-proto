"use client";

import React from "react";
import { ChevronRight } from "lucide-react";
import { InfoTip, RagChip } from "./KpiSidecarParts";
import KpiSparkline from "./KpiSparkline";
import {
  KPIS, CATEGORIES, DATE_RANGE, RAG_HEX,
  statusOf, gapOf, targetLabel, valueLabel, deltaTone,
} from "./mocks/kpiGoals";

// Fork A — Decision-dense. Every KPI card answers "is this healthy, by how
// much, and which way is it moving" without opening anything. The sidecar is
// the optional deep dive. Filter chips triage by status; cards group by
// category so Reach/Recovery/Quality stay legible at a glance.
const FILTERS = [
  { id: "all", label: "All" },
  { id: "off", label: "Needs attention" },
  { id: "ok", label: "On track" },
];

export default function KpiCardsDense({ onOpenKpi }) {
  const [filter, setFilter] = React.useState("all");
  const shown = KPIS.filter((k) => {
    if (filter === "all") return true;
    const ok = statusOf(k).rag === "green";
    return filter === "ok" ? ok : !ok;
  });

  return (
    <div style={s.wrap}>
      <header style={s.header}>
        <div>
          <h2 style={s.title}>KPI’s and Goals</h2>
          <p style={s.subtitle}>Every KPI with the detail to act — click any card to drill into agents.</p>
        </div>
        <div style={s.headerRight}>
          <span style={s.dateBadge}>{DATE_RANGE}</span>
          <div style={s.filters}>
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                style={{ ...s.filterChip, ...(filter === f.id ? s.filterOn : null) }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {CATEGORIES.map((cat) => {
        const cards = shown.filter((k) => k.category === cat.name);
        if (!cards.length) return null;
        return (
          <section key={cat.id} style={s.group}>
            <div style={s.groupHead}>
              <span style={s.groupName}>{cat.name}</span>
              <span style={s.groupMeta}>{cat.onTrack}/{cat.total} on track</span>
            </div>
            <div style={s.grid}>
              {cards.map((k) => <DenseCard key={k.id} k={k} onOpen={() => onOpenKpi?.(k)} />)}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function DenseCard({ k, onOpen }) {
  const st = statusOf(k);
  const gap = gapOf(k);
  const dTone = deltaTone(k);
  const rag = RAG_HEX[st.rag];
  return (
    <button type="button" style={s.card} onClick={onOpen}>
      <div style={s.cardTop}>
        <span style={s.kpiName}>{k.name}<InfoTip text={k.tip} /></span>
        <span style={{ ...s.delta, color: dTone === "green" ? RAG_HEX.green.fg : RAG_HEX.red.fg, background: dTone === "green" ? RAG_HEX.green.bg : RAG_HEX.red.bg }}>
          {k.deltaDir === "up" ? "↑" : "↓"} {k.deltaPct}%
        </span>
      </div>
      <div style={s.valueRow}>
        <span style={s.value}>{valueLabel(k)}</span>
        <span style={s.suffix}>{k.suffix}</span>
        <span style={s.spacer} />
        <ChevronRight size={16} color="var(--color-text-tertiary)" />
      </div>
      <KpiSparkline trend={k.trend} target={k.target} rag={st.rag} />
      <div style={s.footer}>
        <RagChip rag={st.rag} label={st.label} />
        <span style={s.footMeta}>
          <span style={s.footItem}>Target <strong>{targetLabel(k)}</strong></span>
          {gap && <span style={s.footItem}>Gap <strong style={{ color: rag.fg }}>{gap}</strong></span>}
        </span>
      </div>
    </button>
  );
}

const s = {
  wrap: { display: "flex", flexDirection: "column", gap: 22 },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 },
  title: { fontSize: 18, fontWeight: 800, color: "var(--color-text-deep)", margin: 0 },
  subtitle: { fontSize: 13, color: "var(--color-text-tertiary)", margin: "4px 0 0" },
  headerRight: { display: "flex", alignItems: "center", gap: 12, flexShrink: 0 },
  dateBadge: { fontSize: 12, fontWeight: 600, color: "var(--color-text-medium)", background: "var(--surface-alt)", borderRadius: 999, padding: "5px 12px" },
  filters: { display: "flex", gap: 4, background: "var(--surface-alt)", borderRadius: 999, padding: 3 },
  filterChip: { border: "none", background: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "var(--color-text-tertiary)", padding: "5px 12px", borderRadius: 999, fontFamily: "var(--font-sans)" },
  filterOn: { background: "#fff", color: "var(--color-text-deep)", boxShadow: "var(--shadow-card)" },
  group: { display: "flex", flexDirection: "column", gap: 10 },
  groupHead: { display: "flex", alignItems: "baseline", gap: 10 },
  groupName: { fontSize: 13, fontWeight: 800, color: "var(--color-text-deep)", textTransform: "uppercase", letterSpacing: "0.04em" },
  groupMeta: { fontSize: 12, color: "var(--color-text-tertiary)" },
  grid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 },
  card: { display: "flex", flexDirection: "column", gap: 10, padding: "16px 18px", border: "1px solid var(--color-divider-card)", borderRadius: 12, background: "#fff", cursor: "pointer", textAlign: "left", fontFamily: "var(--font-sans)" },
  cardTop: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 },
  kpiName: { fontSize: 13.5, fontWeight: 700, color: "var(--color-text-deep)", display: "inline-flex", alignItems: "center" },
  delta: { fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 6, whiteSpace: "nowrap" },
  valueRow: { display: "flex", alignItems: "baseline", gap: 6 },
  value: { fontSize: 26, fontWeight: 800, color: "var(--color-text-deep)", lineHeight: 1 },
  suffix: { fontSize: 12, color: "var(--color-text-tertiary)" },
  spacer: { flex: 1 },
  footer: { display: "flex", flexDirection: "column", gap: 6 },
  footMeta: { display: "flex", gap: 14, flexWrap: "wrap" },
  footItem: { fontSize: 12, color: "var(--color-text-tertiary)" },
};
