"use client";

import React from "react";
import {
  fullBleed, COL_H, MetricFace, MetricDetailBody, MetricDetailHeader, MiraColumn,
} from "./MiraWorkspaceBits";
import { SPACE, KPIS } from "./mocks/miraSpace";

// Workspace (new) v2 — Connected Tabs. Same unified white card, but metrics
// are a horizontal strip of cards along the top; the selected one is white and
// connects DOWNWARD into a full-width detail beneath it (tab → panel).
// Unselected = flat gray, hover raises to a card. Ask Mira is a full column.
export default function MiraWorkspaceConnectedTabs({
  conversation, pendingTurnId, queriesUsed, queriesTotal, onSubmit, onReset,
}) {
  const [metricId, setMetricId] = React.useState(KPIS[0].id);
  const [hoverId, setHoverId] = React.useState(null);
  const [miraOpen, setMiraOpen] = React.useState(false);
  const metric = KPIS.find((k) => k.id === metricId) || KPIS[0];
  const handleAsk = (t) => { setMiraOpen(true); if (t && t.trim() && !pendingTurnId) onSubmit(t); };

  return (
    <div style={fullBleed}>
      <div style={{ ...s.grid, gridTemplateColumns: `minmax(0, 1fr) ${miraOpen ? "384px" : "56px"}` }}>
        <div style={s.card}>
          <div style={s.strip} role="tablist" aria-label="Metrics to investigate">
            {KPIS.map((k) => {
              const selected = k.id === metricId;
              const hovered = k.id === hoverId && !selected;
              return (
                <button
                  key={k.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setMetricId(k.id)}
                  onMouseEnter={() => setHoverId(k.id)}
                  onMouseLeave={() => setHoverId((h) => (h === k.id ? null : h))}
                  style={{ ...s.tab, ...(hovered ? s.tabHover : null), ...(selected ? s.tabOn : null) }}
                >
                  <MetricFace kpi={k} />
                </button>
              );
            })}
          </div>

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
  card: { display: "flex", flexDirection: "column", minWidth: 0, borderRadius: 16, border: "1px solid var(--color-border-card-soft)", background: "var(--surface-white)", boxShadow: "var(--shadow-1)", overflow: "hidden" },

  strip: { display: "flex", gap: 10, padding: "16px 16px 0", background: "var(--surface-white)", overflowX: "auto", flexShrink: 0 },
  tab: {
    flexShrink: 0, width: 196, display: "flex", flexDirection: "column", gap: 8, padding: 14,
    borderRadius: "12px 12px 0 0", border: "none", background: "var(--grey-200)", cursor: "pointer",
    textAlign: "start", fontFamily: "var(--font-sans)", marginBottom: 0,
    transition: "background 150ms ease, box-shadow 150ms ease",
  },
  tabHover: { background: "var(--surface-white)", boxShadow: "var(--shadow-2)" },
  // Selected: white, connects down into the white detail (no bottom seam).
  tabOn: { background: "var(--surface-white)", marginBottom: -1, boxShadow: "0 -6px 16px -10px rgba(16,24,40,0.18)", position: "relative", zIndex: 2 },

  detail: { flex: 1, minHeight: 0, background: "var(--surface-white)", overflow: "hidden" },
  detailScroll: { height: "100%", overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 18 },
};
