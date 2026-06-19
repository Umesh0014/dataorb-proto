"use client";

import React from "react";
import { PanelLeft, ChevronLeft } from "lucide-react";
import {
  fullBleed, COL_H, MetricFace, MetricDetailBody, MetricDetailHeader, MiraColumn,
} from "./MiraWorkspaceBits";
import { SPACE, KPIS } from "./mocks/miraSpace";

// Workspace (new) v3 — Assistant-Forward. The connected-rail card, but Ask Mira
// is a co-equal column open BY DEFAULT and given prominent width, so "ask
// anything, start here" is the first thing you feel. The metric rail inside the
// card collapses to widen the detail when you want to focus.
export default function MiraWorkspaceAssistantForward({
  conversation, pendingTurnId, queriesUsed, queriesTotal, onSubmit, onReset,
}) {
  const [metricId, setMetricId] = React.useState(KPIS[0].id);
  const [hoverId, setHoverId] = React.useState(null);
  const [miraOpen, setMiraOpen] = React.useState(true);
  const [railOpen, setRailOpen] = React.useState(true);
  const metric = KPIS.find((k) => k.id === metricId) || KPIS[0];
  const handleAsk = (t) => { setMiraOpen(true); if (t && t.trim() && !pendingTurnId) onSubmit(t); };

  return (
    <div style={fullBleed}>
      <div style={{ ...s.grid, gridTemplateColumns: `minmax(0, 1fr) ${miraOpen ? "440px" : "56px"}` }}>
        <div style={s.card}>
          {railOpen ? (
            <nav style={s.rail} aria-label="Metrics to investigate">
              <div style={s.railHead}>
                <div style={s.railHeadText}>
                  <span style={s.space}>{SPACE.name}</span>
                  <span style={s.sub}>Metrics</span>
                </div>
                <button type="button" onClick={() => setRailOpen(false)} aria-label="Collapse metrics" style={s.iconBtn}>
                  <ChevronLeft size={18} color="var(--color-text-medium)" />
                </button>
              </div>
              {KPIS.map((k) => {
                const selected = k.id === metricId;
                const hovered = k.id === hoverId && !selected;
                return (
                  <button
                    key={k.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setMetricId(k.id)}
                    onMouseEnter={() => setHoverId(k.id)}
                    onMouseLeave={() => setHoverId((h) => (h === k.id ? null : h))}
                    style={{ ...s.item, ...(hovered ? s.itemHover : null), ...(selected ? s.itemOn : null) }}
                  >
                    <MetricFace kpi={k} />
                  </button>
                );
              })}
            </nav>
          ) : (
            <div style={s.railClosed}>
              <button type="button" onClick={() => setRailOpen(true)} aria-label="Expand metrics" style={s.railClosedBtn}>
                <PanelLeft size={18} color="var(--color-text-medium)" />
                <span style={s.railClosedLabel}>Metrics</span>
              </button>
            </div>
          )}

          <section style={s.detail} aria-label={`${metric.label} detail`}>
            <div style={s.detailScroll}>
              <MetricDetailHeader metric={metric} />
              <MetricDetailBody metric={metric} onAsk={handleAsk} />
            </div>
          </section>
        </div>

        <MiraColumn
          open={miraOpen}
          onToggle={setMiraOpen}
          metric={metric}
          conversation={conversation}
          pendingTurnId={pendingTurnId}
          queriesUsed={queriesUsed}
          queriesTotal={queriesTotal}
          onSubmit={onSubmit}
          onReset={onReset}
        />
      </div>
    </div>
  );
}

const s = {
  grid: { display: "grid", gap: 16, height: COL_H, alignItems: "stretch", transition: "grid-template-columns 220ms ease" },
  card: { display: "flex", minWidth: 0, borderRadius: 16, border: "1px solid var(--color-border-card-soft)", background: "var(--surface-white)", boxShadow: "var(--shadow-1)", overflow: "hidden" },

  rail: { width: 280, flexShrink: 0, background: "var(--surface-white)", padding: "16px 0 16px 16px", display: "flex", flexDirection: "column", gap: 8, overflowY: "auto" },
  railHead: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, padding: "0 12px 8px 4px" },
  railHeadText: { display: "flex", flexDirection: "column", gap: 2 },
  space: { fontSize: 17, fontWeight: 800, letterSpacing: "-0.01em", color: "var(--color-text-deep)" },
  sub: { fontSize: 12, fontWeight: 600, color: "var(--color-text-tertiary)" },
  iconBtn: { width: 30, height: 30, borderRadius: 8, border: "none", background: "transparent", display: "inline-grid", placeItems: "center", cursor: "pointer", flexShrink: 0 },

  railClosed: { width: 48, flexShrink: 0, background: "var(--grey-50)" },
  railClosedBtn: { width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, paddingBlock: 16, border: "none", background: "transparent", cursor: "pointer", fontFamily: "var(--font-sans)" },
  railClosedLabel: { writingMode: "vertical-rl", transform: "rotate(180deg)", fontSize: 12, fontWeight: 700, color: "var(--color-text-tertiary)", letterSpacing: "0.04em", textTransform: "uppercase" },

  item: {
    display: "flex", flexDirection: "column", gap: 8, padding: 14, marginInlineEnd: 16, borderRadius: 12,
    border: "none", background: "var(--grey-200)", cursor: "pointer", textAlign: "start", fontFamily: "var(--font-sans)",
    transition: "background 150ms ease, box-shadow 150ms ease, margin 180ms ease",
  },
  itemHover: { background: "var(--surface-white)", boxShadow: "var(--shadow-2)" },
  itemOn: { background: "var(--surface-white)", marginInlineEnd: -1, borderRadius: "12px 0 0 12px", boxShadow: "-6px 0 16px -10px rgba(16,24,40,0.18)", position: "relative", zIndex: 2 },

  detail: { flex: 1, minWidth: 0, background: "var(--surface-white)", overflow: "hidden" },
  detailScroll: { height: "100%", overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 18, maxWidth: 720 },
};
