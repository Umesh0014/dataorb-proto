"use client";

import React from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { AiSnippet, RagChip } from "./KpiSidecarParts";
import { EFFICIENCY_INTERACTIONS } from "./mocks/kpiSidecar";

// Layer 3 — individual interaction cards for a chosen week. Outcome filter
// dropdown with a per-KPI default. Each card: ID (opens a new tab via ↗),
// status pill, context tags + overflow, outcome badge, and an ✦ AI snippet.
export default function KpiSidecarLayer3({ kpi, agent, week, onBack }) {
  const all = EFFICIENCY_INTERACTIONS[week] || [];
  const outcomeOptions = ["all", ...kpi.outcomes.map((o) => o.label)];
  const [filter, setFilter] = React.useState(
    kpi.defaultOutcomeFilter && kpi.defaultOutcomeFilter !== "all" ? kpi.defaultOutcomeFilter : "all",
  );
  const rows = filter === "all" ? all : all.filter((i) => i.outcome === filter);

  return (
    <div style={s.wrap}>
      <button type="button" style={s.back} onClick={onBack}>
        <ArrowLeft size={15} /> Week trend
      </button>

      <header style={s.header}>
        <div>
          <h3 style={s.title}>{week} ({kpi.dateRange})</h3>
          <p style={s.sub}>{kpi.name} • {agent.name}</p>
        </div>
        <span style={s.countBadge}>{rows.length} interactions</span>
      </header>

      <div style={s.filterRow}>
        <label style={s.filterLabel}>Outcome</label>
        <select style={s.select} value={filter} onChange={(e) => setFilter(e.target.value)}>
          {outcomeOptions.map((o) => (
            <option key={o} value={o}>{o === "all" ? "All outcomes" : o}</option>
          ))}
        </select>
      </div>

      <div style={s.list}>
        {rows.map((it) => (
          <article key={it.id} style={s.card}>
            <div style={s.cardTop}>
              <a style={s.idLink} href="#interaction" target="_blank" rel="noreferrer">
                {it.id}<ExternalLink size={13} />
              </a>
              <span style={{ ...s.statusPill, ...(it.status === "Closed" ? s.statusClosed : s.statusReopen) }}>
                {it.status}
              </span>
            </div>
            <div style={s.tags}>
              {it.tags.map((t) => <span key={t} style={s.tag}>{t}</span>)}
              {it.extraTags > 0 && <span style={s.tagMore}>+{it.extraTags}</span>}
              <span style={s.spacer} />
              <RagChip rag={it.outcomeTone} label={it.outcome} />
            </div>
            <AiSnippet text={it.snippet} />
          </article>
        ))}
        {!rows.length && <p style={s.empty}>No interactions match this outcome.</p>}
      </div>
    </div>
  );
}

const s = {
  wrap: { display: "flex", flexDirection: "column", gap: 14 },
  back: { display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 13, fontWeight: 600, color: "var(--color-text-medium)", fontFamily: "var(--font-sans)" },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 },
  title: { fontSize: 16, fontWeight: 800, color: "var(--color-text-deep)", margin: 0 },
  sub: { fontSize: 13, color: "var(--color-text-tertiary)", margin: "3px 0 0" },
  countBadge: { flexShrink: 0, fontSize: 12, fontWeight: 600, color: "var(--color-text-medium)", background: "var(--surface-alt)", borderRadius: 999, padding: "5px 12px" },
  filterRow: { display: "flex", alignItems: "center", gap: 8 },
  filterLabel: { fontSize: 12, fontWeight: 600, color: "var(--color-text-tertiary)" },
  select: { fontSize: 13, fontFamily: "var(--font-sans)", color: "var(--color-text-deep)", padding: "6px 10px", borderRadius: 8, border: "1px solid var(--color-divider-card)", background: "#fff", cursor: "pointer" },
  list: { display: "flex", flexDirection: "column", gap: 10 },
  card: { display: "flex", flexDirection: "column", gap: 10, padding: "14px 16px", border: "1px solid var(--color-divider-card)", borderRadius: 10 },
  cardTop: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  idLink: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 700, color: "var(--do-brand-blue)", textDecoration: "none", fontFamily: "var(--font-mono)" },
  statusPill: { fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 6 },
  statusClosed: { background: "#F0FDF4", color: "#00711D" },
  statusReopen: { background: "#FFFBEB", color: "#B57E12" },
  tags: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" },
  tag: { fontSize: 11, fontWeight: 600, color: "var(--color-text-medium)", background: "var(--surface-alt)", borderRadius: 6, padding: "3px 8px" },
  tagMore: { fontSize: 11, fontWeight: 600, color: "var(--color-text-tertiary)" },
  spacer: { flex: 1 },
  empty: { padding: "24px 0", fontSize: 13, color: "var(--color-text-tertiary)", textAlign: "center" },
};
