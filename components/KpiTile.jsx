"use client";

import React from "react";
import { ChevronRight } from "lucide-react";
import { InfoTip, RagChip } from "./KpiSidecarParts";
import KpiSparkline from "./KpiSparkline";
import {
  RAG_HEX, statusOf, gapOf, targetLabel, valueLabel, deltaTone,
} from "./mocks/kpiGoals";

// The Figma KPI card (image 2): name+ⓘ, value+unit, delta chip, sparkline with
// target line, and a Status · Target · Gap footer. `compact` trims it to a
// tile; `selected` raises it when its detail is open below.
export default function KpiTile({ k, onClick, selected = false, compact = false }) {
  const st = statusOf(k);
  const gap = gapOf(k);
  const dTone = deltaTone(k);
  const rag = RAG_HEX[st.rag];
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ ...s.card, ...(selected ? s.selected : null), ...(compact ? s.compact : null) }}
    >
      <div style={s.top}>
        <span style={s.name}>{k.name}<InfoTip text={k.tip} /></span>
        <span style={{ ...s.delta, color: dTone === "green" ? RAG_HEX.green.fg : RAG_HEX.red.fg, background: dTone === "green" ? RAG_HEX.green.bg : RAG_HEX.red.bg }}>
          {k.deltaDir === "up" ? "↑" : "↓"} {k.deltaPct}%
        </span>
      </div>
      <div style={s.valueRow}>
        <span style={{ ...s.value, fontSize: compact ? 20 : 26 }}>{valueLabel(k)}</span>
        <span style={s.suffix}>{k.suffix}</span>
        <span style={s.spacer} />
        <ChevronRight size={16} color={selected ? "var(--do-brand-blue)" : "var(--color-text-tertiary)"} />
      </div>
      <KpiSparkline trend={k.trend} target={k.target} rag={st.rag} height={compact ? 40 : 52} />
      <div style={s.footer}>
        <RagChip rag={st.rag} label={st.label} />
        {!compact && (
          <span style={s.meta}>
            <span>Target <strong>{targetLabel(k)}</strong></span>
            {gap && <span>Gap <strong style={{ color: rag.fg }}>{gap}</strong></span>}
          </span>
        )}
      </div>
    </button>
  );
}

const s = {
  card: { display: "flex", flexDirection: "column", gap: 10, padding: "16px 18px", border: "1px solid var(--color-divider-card)", borderRadius: 12, background: "#fff", cursor: "pointer", textAlign: "left", fontFamily: "var(--font-sans)", transition: "box-shadow .15s, border-color .15s" },
  selected: { borderColor: "var(--do-brand-blue)", boxShadow: "0 0 0 1px var(--do-brand-blue)" },
  compact: { padding: "13px 14px", gap: 8 },
  top: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 },
  name: { fontSize: 13.5, fontWeight: 700, color: "var(--color-text-deep)", display: "inline-flex", alignItems: "center" },
  delta: { fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 6, whiteSpace: "nowrap" },
  valueRow: { display: "flex", alignItems: "baseline", gap: 6 },
  value: { fontWeight: 800, color: "var(--color-text-deep)", lineHeight: 1 },
  suffix: { fontSize: 12, color: "var(--color-text-tertiary)" },
  spacer: { flex: 1 },
  footer: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" },
  meta: { display: "flex", gap: 12, fontSize: 11.5, color: "var(--color-text-tertiary)" },
};
