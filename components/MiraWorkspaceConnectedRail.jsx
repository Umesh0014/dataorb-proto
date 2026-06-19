"use client";

import React from "react";
import {
  fullBleed, COL_H, MetricFace, MetricDetailBody, MetricDetailHeader, MiraColumn,
} from "./MiraWorkspaceBits";
import { SPACE, KPIS } from "./mocks/miraSpace";

// Workspace (new) v1 — Connected Rail. Metric list + detail live in ONE
// unified white card. Unselected metrics are flat gray (no border); hover
// raises them to a white card; the selected metric is white and connects
// flush into the detail pane (its white bleeds across the rail/detail seam).
// Ask Mira is a full collapsible column (button → column), never a bubble.
export default function MiraWorkspaceConnectedRail({
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
          <nav style={s.rail} aria-label="Metrics to investigate">
            <div style={s.railHead}>
              <span style={s.space}>{SPACE.name}</span>
              <span style={s.sub}>Metrics</span>
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

  rail: { width: 300, flexShrink: 0, background: "var(--surface-white)", padding: "16px 0 16px 16px", display: "flex", flexDirection: "column", gap: 8, overflowY: "auto" },
  railHead: { display: "flex", flexDirection: "column", gap: 2, padding: "0 16px 8px 4px" },
  space: { fontSize: 17, fontWeight: 800, letterSpacing: "-0.01em", color: "var(--color-text-deep)" },
  sub: { fontSize: 12, fontWeight: 600, color: "var(--color-text-tertiary)" },

  item: {
    display: "flex", flexDirection: "column", gap: 8, padding: 14, marginInlineEnd: 16,
    borderRadius: 12, border: "none", background: "var(--grey-200)", cursor: "pointer",
    textAlign: "start", width: "auto", fontFamily: "var(--font-sans)",
    transition: "background 150ms ease, box-shadow 150ms ease, margin 180ms ease",
  },
  itemHover: { background: "var(--surface-white)", boxShadow: "var(--shadow-2)" },
  // Selected: white, flush to the right edge (no gap), square right corners,
  // a hair into the detail — so its white merges with the white detail pane.
  itemOn: {
    background: "var(--surface-white)", marginInlineEnd: -1, borderRadius: "12px 0 0 12px",
    boxShadow: "-6px 0 16px -10px rgba(16,24,40,0.18)", position: "relative", zIndex: 2,
  },

  detail: { flex: 1, minWidth: 0, background: "var(--surface-white)", overflow: "hidden" },
  detailScroll: { height: "100%", overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 18, maxWidth: 760 },
};
