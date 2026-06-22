"use client";

import React from "react";
import KpiRing from "./KpiRing";
import { RagChip } from "./KpiSidecarParts";

// Reach / Recovery / Quality category card — replica of the Figma reference:
// RAG ring (score centred) · title + description · status chip + "X of 3 on
// track" · chevron.
const POPPINS = "'Poppins', sans-serif";

export default function KpiCategoryCard({ cat, onClick, selected = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ ...s.card, ...(selected ? s.selected : null) }}
    >
      <span style={s.inner}>
        <KpiRing pct={cat.score} rag={cat.rag} size={56} stroke={6} label={cat.score} />
        <span style={s.body}>
          <span style={s.title}>{cat.name}</span>
          <span style={s.desc}>{cat.blurb}</span>
          <span style={s.footer}>
            <RagChip rag={cat.rag} label={cat.status} />
            <span style={s.onTrack}>{cat.onTrack} of {cat.total} on track</span>
          </span>
        </span>
      </span>
    </button>
  );
}

const s = {
  card: { display: "flex", background: "#FFFFFF", border: "1px solid #EFEFFF", borderRadius: 12, overflow: "hidden", cursor: "pointer", textAlign: "left", fontFamily: POPPINS, padding: 0, transition: "box-shadow .15s, border-color .15s" },
  selected: { borderColor: "var(--do-brand-blue)", boxShadow: "0 0 0 1px var(--do-brand-blue)" },
  inner: { display: "flex", gap: 14, padding: "16px 18px", flex: 1, alignItems: "flex-start", minWidth: 0 },
  body: { display: "flex", flexDirection: "column", gap: 8, flex: 1, minWidth: 0 },
  title: { fontFamily: POPPINS, fontWeight: 600, fontSize: 16, lineHeight: "22px", color: "#2C2F42" },
  desc: { fontFamily: POPPINS, fontWeight: 400, fontSize: 13, lineHeight: "18px", color: "#5B5E6F", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" },
  footer: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginTop: 2 },
  onTrack: { fontFamily: POPPINS, fontWeight: 400, fontSize: 12, color: "#8C90A6" },
};
