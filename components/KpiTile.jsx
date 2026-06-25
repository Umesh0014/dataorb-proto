"use client";

import React from "react";
import { Info } from "lucide-react";
import KpiSparkline from "./KpiSparkline";
import { SHADOWS } from "./designTokens";
import {
  RAG_HEX, statusOf, gapShort, targetLabel, valueLabel, deltaTone,
} from "./mocks/kpiGoals";

// 1:1 replica of the Figma "KPIRow" card (node 2174-50926).
// Type: Poppins (title/value/suffix/legend) + Lato (status). Exact tokens:
// border #EFEFFF · title #5A5D72/14 · value #2C2F42/16 bold · suffix #5B5E6F/12
// · legend #424659/11 · status = RAG colour/Lato 11 · padding 17 · gap 16.
const POPPINS = "'Poppins', sans-serif";
const LATO = "'Lato', sans-serif";

export default function KpiTile({ k, onClick, selected = false, fill = false, elevated = false }) {
  const st = statusOf(k);
  const gap = gapShort(k);
  const dTone = deltaTone(k);
  const rag = RAG_HEX[st.rag];
  const pill = dTone === "green"
    ? { bg: "#F0FDF4", fg: "#00711D" }
    : { bg: "#FEF2F2", fg: "#BA1A1A" };
  return (
    <button type="button" onClick={onClick} style={{ ...s.card, ...(elevated ? s.elevated : null), ...(selected ? s.selected : null), ...(fill ? s.cardFill : null) }}>
      {/* header */}
      <div style={s.header}>
        <div style={s.titleRow}>
          <span style={s.title}>{k.name}</span>
          <span style={s.info} title={k.tip} aria-label={k.tip}><Info size={16} color="#5A5D72" /></span>
        </div>
        <div style={s.valueRow}>
          <span style={s.value}>{valueLabel(k)}</span>
          <span style={s.suffix}>{k.suffix}</span>
          <span style={{ ...s.pill, background: pill.bg, color: pill.fg }}>
            {k.deltaDir === "up" ? "↑" : "↓"} {k.deltaPct}%
          </span>
        </div>
      </div>

      {/* sparkline */}
      <div style={fill ? s.sparkFill : s.spark}><KpiSparkline trend={k.trend} target={k.target} rag={st.rag} height={40} fill={fill} /></div>

      {/* footer */}
      <div style={s.footer}>
        <span style={{ ...s.status, color: rag.fg }}>{st.label}</span>
        <div style={s.legend}>
          <span style={s.legItem}>
            <span style={s.swatchDashed} />
            <span style={s.legText}>Target: {targetLabel(k)}</span>
          </span>
          <span style={s.legItem}>
            <span style={{ ...s.swatchSolid, background: rag.line }} />
            <span style={s.legText}>Gap: {gap || "—"}</span>
          </span>
        </div>
      </div>
    </button>
  );
}

const s = {
  card: { display: "flex", flexDirection: "column", gap: 16, padding: 17, background: "#FFFFFF", border: "1px solid #EFEFFF", borderRadius: 8, cursor: "pointer", textAlign: "left", fontFamily: POPPINS, transition: "box-shadow .15s, border-color .15s" },
  elevated: { border: "1px solid #F2F2F7", boxShadow: SHADOWS.card },
  selected: { border: "1px solid #6650A5", boxShadow: "0 0 0 1px #6650A5" },
  header: { display: "flex", flexDirection: "column", gap: 4 },
  titleRow: { display: "flex", alignItems: "center", gap: 8 },
  title: { fontFamily: POPPINS, fontWeight: 500, fontSize: 14, lineHeight: "22px", letterSpacing: "0.1px", color: "#5A5D72", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  info: { display: "inline-flex", alignItems: "center", cursor: "help", flexShrink: 0 },
  valueRow: { display: "flex", alignItems: "center", gap: 4 },
  value: { fontFamily: POPPINS, fontWeight: 700, fontSize: 16, lineHeight: "24px", letterSpacing: "-0.31px", color: "#2C2F42" },
  suffix: { flex: 1, minWidth: 0, fontFamily: POPPINS, fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: "0.4px", color: "#5B5E6F", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  pill: { display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 4px", borderRadius: 4, fontFamily: POPPINS, fontWeight: 600, fontSize: 11, lineHeight: "18px", letterSpacing: "0.5px", whiteSpace: "nowrap", flexShrink: 0 },
  spark: { width: "100%", height: 40 },
  cardFill: { height: "100%" },
  sparkFill: { width: "100%", flex: 1, minHeight: 56, display: "flex" },
  footer: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, rowGap: 4, flexWrap: "wrap", borderTop: "1px solid #EFEFFF", paddingTop: 8 },
  status: { fontFamily: LATO, fontWeight: 400, fontSize: 11, lineHeight: "14px", letterSpacing: "0.4px", whiteSpace: "nowrap" },
  legend: { display: "flex", alignItems: "flex-end", gap: 8 },
  legItem: { display: "inline-flex", alignItems: "center", gap: 4 },
  legText: { fontFamily: POPPINS, fontWeight: 400, fontSize: 11, lineHeight: "18px", letterSpacing: "0.4px", color: "#424659", whiteSpace: "nowrap" },
  swatchDashed: { display: "inline-block", width: 8, height: 0, borderTop: "1px dashed #C4C9D6" },
  swatchSolid: { display: "inline-block", width: 8, height: 2, borderRadius: 2 },
};
