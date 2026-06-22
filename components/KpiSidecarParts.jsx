"use client";

import React from "react";
import { Info } from "lucide-react";
import { RAG, TYPE_RULES } from "./mocks/kpiSidecar";

// Shared sidecar primitives. All visuals here are config-driven so both the
// Standard and L1-only variants render identical building blocks.

// RAG status chip — inline-styled span (the codebase has no <RAGChip>).
export function RagChip({ rag, label }) {
  const z = RAG[rag] || RAG.amber;
  return (
    <span style={{ ...s.chip, background: z.bg, color: z.color }}>{label ?? z.label}</span>
  );
}

// ⓘ tooltip — native title attr (the pattern used across the app); the icon
// is keyboard-focusable so the hint is reachable without a pointer.
export function InfoTip({ text }) {
  return (
    <span style={s.infoTip} title={text} tabIndex={0} aria-label={text}>
      <Info size={14} color="var(--color-text-tertiary)" />
    </span>
  );
}

// Avatar (initials) + name cell.
export function AgentCell({ name, initials, muted = false }) {
  return (
    <div style={s.agentCell}>
      <span style={{ ...s.avatar, opacity: muted ? 0.5 : 1 }} aria-hidden="true">{initials}</span>
      <span style={{ ...s.agentName, opacity: muted ? 0.5 : 1 }}>{name}</span>
    </div>
  );
}

// Skeleton rows shown while the next lazy-load page is fetching.
export function SkeletonRows({ count = 3 }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={`sk-${i}`} style={s.skeletonRow}>
          <span style={{ ...s.skelBar, width: 18 }} />
          <span style={{ ...s.skelBar, width: 160 }} />
          <span style={{ ...s.skelBar, width: 64 }} />
          <span style={{ ...s.skelBar, width: 88 }} />
        </div>
      ))}
    </>
  );
}

// One Layer-1 stat pill: label + value, optional RAG chip + trend arrow + sub.
export function StatPill({ label, value, rag, trend, sub, tone }) {
  const toneColor = tone === "green" ? RAG.green.color : tone === "red" ? RAG.red.color : "var(--color-text-deep)";
  return (
    <div style={s.statPill}>
      <span style={s.statLabel}>{label}</span>
      <div style={s.statValueRow}>
        <span style={{ ...s.statValue, color: toneColor }}>{value}</span>
        {trend && <span style={s.trendArrow}>{trend === "up" ? "▲" : "▼"}</span>}
        {rag && <RagChip rag={rag} />}
      </div>
      {sub && <span style={s.statSub}>{sub}</span>}
    </div>
  );
}

// Segmented outcome bar — context only, never clickable.
export function OutcomeBar({ outcomes }) {
  return (
    <div>
      <div style={s.outcomeTrack}>
        {outcomes.map((o) => (
          <div key={o.key} style={{ width: `${o.pct}%`, background: o.color }} title={`${o.label} · ${o.pct}%`} />
        ))}
      </div>
      <div style={s.outcomeLegend}>
        {outcomes.map((o) => (
          <span key={o.key} style={s.legendItem}>
            <span style={{ ...s.legendDot, background: o.color }} />
            {o.label} <strong style={s.legendPct}>{o.pct}%</strong>
          </span>
        ))}
      </div>
    </div>
  );
}

// ✦ AI snippet (replaces the old gear ⚙ icon). Null → italic grey fallback.
export function AiSnippet({ text }) {
  if (!text) return <span style={s.snippetEmpty}>No analysis available.</span>;
  return (
    <span style={s.snippet}>
      <span style={s.snippetMark} aria-hidden="true">✦</span>
      {text}
    </span>
  );
}

// ---- type-aware helpers --------------------------------------------------
export const rule = (kpi) => TYPE_RULES[kpi.kpiType] || TYPE_RULES.A;
export const gapFor = (kpi) => rule(kpi).gap(kpi);
export const statusLabelFor = (kpi, rag) => rule(kpi).statusLabel[rag];
export const sortAgents = (kpi) => [...kpi.agents].sort((a, b) => {
  const az = a.rag === null, bz = b.rag === null;
  if (az !== bz) return az ? 1 : -1; // zero-interaction agents pinned to bottom
  if (az && bz) return 0;
  return rule(kpi).sort(a, b);
});

const s = {
  chip: {
    display: "inline-flex", alignItems: "center", padding: "3px 9px", borderRadius: 6,
    fontSize: 12, fontWeight: 600, fontFamily: "var(--font-sans)", whiteSpace: "nowrap",
  },
  infoTip: { display: "inline-flex", alignItems: "center", cursor: "help", marginLeft: 4, verticalAlign: "middle" },
  agentCell: { display: "flex", alignItems: "center", gap: 10, minWidth: 0 },
  avatar: {
    width: 28, height: 28, borderRadius: 999, background: "var(--surface-alt)", flexShrink: 0,
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    fontSize: 11, fontWeight: 700, color: "var(--color-text-medium)", fontFamily: "var(--font-sans)",
  },
  agentName: { fontSize: 13, fontWeight: 600, color: "var(--color-text-deep)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  skeletonRow: { display: "grid", gridTemplateColumns: "40px 1fr 120px 140px", alignItems: "center", gap: 12, padding: "12px 16px" },
  skelBar: { height: 12, borderRadius: 6, background: "linear-gradient(90deg,#EEF1F6,#E2E8F0,#EEF1F6)", display: "inline-block" },
  statPill: {
    flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6,
    padding: "14px 16px", background: "var(--surface-alt)", borderRadius: 10,
  },
  statLabel: { fontSize: 12, fontWeight: 600, color: "var(--color-text-tertiary)", letterSpacing: "0.02em" },
  statValueRow: { display: "flex", alignItems: "center", gap: 8 },
  statValue: { fontSize: 22, fontWeight: 800, fontFamily: "var(--font-sans)", lineHeight: 1 },
  trendArrow: { fontSize: 11, color: "var(--color-text-tertiary)" },
  statSub: { fontSize: 11, color: "var(--color-text-tertiary)" },
  outcomeTrack: { display: "flex", height: 14, borderRadius: 7, overflow: "hidden", gap: 2 },
  outcomeLegend: { display: "flex", flexWrap: "wrap", gap: "8px 18px", marginTop: 12 },
  legendItem: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--color-text-medium)" },
  legendDot: { width: 8, height: 8, borderRadius: 2, flexShrink: 0 },
  legendPct: { fontWeight: 700, color: "var(--color-text-deep)" },
  snippet: { fontSize: 12.5, color: "var(--color-text-medium)", lineHeight: 1.5 },
  snippetMark: { color: "var(--do-brand-blue)", fontWeight: 700, marginRight: 6 },
  snippetEmpty: { fontSize: 12.5, fontStyle: "italic", color: "var(--color-text-tertiary)" },
};
