"use client";

import React from "react";
import { InfoTip } from "./KpiSidecarParts";
import KpiSparkline from "./KpiSparkline";
import {
  RAG_HEX, statusOf, gapOf, targetLabel, valueLabel, deltaTone,
} from "./mocks/kpiGoals";

// Exact replica of the Figma "KPIRow" card (node 2174-50926). Layout:
// name+ⓘ · delta pill (top) → value + suffix → area sparkline w/ dashed
// target → footer: coloured status text (left) + a dashed "Target" swatch and
// a solid "Gap" swatch (right). No chevron, no status chip — matches Figma.
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
        <span style={{ ...s.value, fontSize: compact ? 20 : 22 }}>{valueLabel(k)}</span>
        <span style={s.suffix}>{k.suffix}</span>
      </div>

      <KpiSparkline trend={k.trend} target={k.target} rag={st.rag} height={compact ? 40 : 48} />

      <div style={s.footer}>
        <span style={{ ...s.status, color: rag.fg }}>{st.label}</span>
        <span style={s.legend}>
          <span style={s.swatchDashed} />
          <span style={s.legendText}>Target: {targetLabel(k)}</span>
          <span style={{ ...s.swatchSolid, borderTopColor: rag.line }} />
          <span style={s.legendText}>Gap: {gap || "—"}</span>
        </span>
      </div>
    </button>
  );
}

const s = {
  card: { display: "flex", flexDirection: "column", gap: 12, padding: 16, border: "1px solid var(--color-divider-card)", borderRadius: 8, background: "#fff", cursor: "pointer", textAlign: "left", fontFamily: "var(--font-sans)", transition: "box-shadow .15s, border-color .15s" },
  selected: { borderColor: "var(--do-brand-blue)", boxShadow: "0 0 0 1px var(--do-brand-blue)" },
  compact: { padding: 14, gap: 10 },
  top: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 },
  name: { fontSize: 14, fontWeight: 600, color: "var(--color-text-deep)", display: "inline-flex", alignItems: "center" },
  delta: { fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 6, whiteSpace: "nowrap" },
  valueRow: { display: "flex", alignItems: "baseline", gap: 6 },
  value: { fontWeight: 800, color: "var(--color-text-deep)", lineHeight: 1 },
  suffix: { fontSize: 12, color: "var(--color-text-tertiary)" },
  footer: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" },
  status: { fontSize: 12.5, fontWeight: 600 },
  legend: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--color-text-tertiary)" },
  legendText: { whiteSpace: "nowrap" },
  swatchDashed: { display: "inline-block", width: 8, height: 0, borderTop: "1.5px dashed #9AA1B2", marginRight: 1 },
  swatchSolid: { display: "inline-block", width: 8, height: 0, borderTop: "2px solid", marginLeft: 4, marginRight: 1 },
};
