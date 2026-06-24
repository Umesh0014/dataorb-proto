"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, MinusCircle, ExternalLink } from "lucide-react";
import { EFFICIENCY_INTERACTIONS } from "./mocks/kpiSidecar";
import DsGapDot from "./DsGapDot";

const POPPINS = "'Poppins', sans-serif";
const LATO = "'Lato', sans-serif";
// Sentiment / outcome icon + tint per tone.
const TONE = {
  green: { Icon: CheckCircle2, bg: "#F1FEF5", fg: "#00711D", res: "Positive Sale" },
  amber: { Icon: MinusCircle, bg: "#F9F9FF", fg: "#8C90A6", res: "Pipeline" },
  red: { Icon: AlertTriangle, bg: "#FEF2F2", fg: "#BA1A1A", res: "Refusal" },
};

// Layer 3 — interaction detail (Figma node 1887-70825). Summary line + outcome
// filter + interaction cards (sentiment icon · id · tags · resolution · ↗) each
// with a ✦ Mira AI snippet. Header/back owned by KpiDrillInline.
export default function KpiSidecarLayer3({ kpi, week, markGaps = false }) {
  const all = (kpi.interactions || EFFICIENCY_INTERACTIONS)[week] || [];
  const outcomes = ["all", ...kpi.outcomes.map((o) => o.label)];
  const [filter, setFilter] = React.useState("all");
  const rows = filter === "all" ? all : all.filter((i) => i.outcome === filter);

  return (
    <div style={s.wrap}>
      <div style={s.summary}>
        <span style={s.sumLabel}>{kpi.name}</span>
        <span style={s.sumStat}><strong>{all.length}</strong> interactions · {week}</span>
      </div>

      <div style={{ ...s.filterRow, position: "relative" }}>
        {markGaps && (
          <DsGapDot
            component="Interaction card"
            closest="Organisms → Lists + Chips"
            why="The card composes an ID + context chips + resolution + ✦ AI snippet — not a single DS component. Assemble from a DS List row + DS Chips + the AI-snippet pattern."
            style={{ top: -2, right: -2 }}
          />
        )}
        <span style={s.filterLabel}>Interactions</span>
        <select style={s.select} value={filter} onChange={(e) => setFilter(e.target.value)}>
          {outcomes.map((o) => <option key={o} value={o}>{o === "all" ? "All outcomes" : o}</option>)}
        </select>
      </div>

      <div style={s.list}>
        {rows.map((it) => {
          const t = TONE[it.outcomeTone] || TONE.amber;
          const Icon = t.Icon;
          return (
            <article key={it.id} style={s.card}>
              <div style={s.cardTop}>
                <span style={{ ...s.iconWrap, background: t.bg }}><Icon size={15} color={t.fg} /></span>
                <div style={s.cardBody}>
                  <span style={s.id}>{it.id}</span>
                  <div style={s.tags}>
                    {it.tags.map((tag) => <span key={tag} style={s.tag}>{tag}</span>)}
                    {it.extraTags > 0 && <span style={s.tag}>+{it.extraTags}</span>}
                    <span style={s.dot} />
                    <span style={{ ...s.res, color: t.fg }}>{it.outcome}</span>
                  </div>
                </div>
                <a href="#interaction" target="_blank" rel="noreferrer" style={s.openLink} aria-label="Open">
                  <ExternalLink size={15} color="var(--color-text-tertiary)" />
                </a>
              </div>
              <div style={s.suggest}>
                <span style={s.mira} aria-hidden="true">✦</span>
                <p style={s.snippet}>{it.snippet || <span style={s.empty}>No analysis available.</span>}</p>
              </div>
            </article>
          );
        })}
        {!rows.length && <p style={s.none}>No interactions match this outcome.</p>}
      </div>
    </div>
  );
}

const s = {
  wrap: { display: "flex", flexDirection: "column", gap: 16, fontFamily: POPPINS },
  summary: { background: "#FCFBFF", borderRadius: 12, padding: 12, display: "flex", flexDirection: "column", gap: 2 },
  sumLabel: { fontSize: 12, color: "#5B5E6F", letterSpacing: "0.4px" },
  sumStat: { fontSize: 16, fontWeight: 600, color: "#2C2F42" },
  filterRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, borderTop: "1px solid #EFEFFF", paddingTop: 16 },
  filterLabel: { fontSize: 14, fontWeight: 500, color: "#5B5E6F", letterSpacing: "0.1px" },
  select: { fontSize: 12, fontFamily: POPPINS, color: "#2C2F42", padding: "6px 10px", borderRadius: 8, border: "1px solid #EFEFFF", background: "#FCFBFF", cursor: "pointer" },
  list: { display: "flex", flexDirection: "column", gap: 12 },
  card: { border: "1px solid #EFEFFF", borderRadius: 12, overflow: "hidden", background: "#fff" },
  cardTop: { display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px" },
  iconWrap: { width: 32, height: 32, borderRadius: 999, flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center" },
  cardBody: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 },
  id: { fontSize: 14, fontWeight: 400, color: "#2C2F42", letterSpacing: "0.25px", fontFamily: "var(--font-mono)" },
  tags: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  tag: { display: "inline-flex", alignItems: "center", padding: "4px 8px", borderRadius: 4, background: "#F5F5F5", color: "#424659", fontSize: 11, fontWeight: 500, letterSpacing: "0.5px", fontFamily: POPPINS },
  dot: { width: 3, height: 3, borderRadius: 999, background: "#8C90A6" },
  res: { fontSize: 12, fontWeight: 500 },
  openLink: { flexShrink: 0, display: "inline-flex", marginTop: 2 },
  suggest: { borderTop: "1px solid #F9F9FF", display: "flex", gap: 6, alignItems: "flex-start", padding: "10px 16px 12px" },
  mira: { color: "#6650A5", fontWeight: 700, fontSize: 13, flexShrink: 0, lineHeight: "18px" },
  snippet: { margin: 0, fontSize: 12, color: "#424659", letterSpacing: "0.4px", lineHeight: "18px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" },
  empty: { fontStyle: "italic", color: "#8C90A6" },
  none: { padding: "24px 0", fontSize: 13, color: "#8C90A6", textAlign: "center" },
};
