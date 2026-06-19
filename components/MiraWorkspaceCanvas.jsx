"use client";

import React from "react";
import {
  fullBleed, COL_H, CelebratedMetricCard, MetricDetailBody, MetricDetailHeader, MiraBottomChat,
} from "./MiraWorkspaceBits";
import { SPACE, KPIS } from "./mocks/miraSpace";

// Workspace v2 — Full-Canvas Master–Detail. Metrics + details own the whole
// width: a celebrated metric-card rail on the left, a persistent detail panel
// on the right, both always visible. Ask Mira is the bottom chat.
export default function MiraWorkspaceCanvas({
  conversation, pendingTurnId, queriesUsed, queriesTotal, onSubmit, onReset,
}) {
  const [metricId, setMetricId] = React.useState(KPIS[0].id);
  const [chatOpen, setChatOpen] = React.useState(false);
  const metric = KPIS.find((k) => k.id === metricId) || KPIS[0];
  const handleAsk = (t) => { setChatOpen(true); if (t && t.trim() && !pendingTurnId) onSubmit(t); };

  return (
    <div style={fullBleed}>
      <div style={s.grid}>
        <aside style={s.rail} aria-label="Metrics to investigate">
          <header style={s.railHead}>
            <span style={s.space}>{SPACE.name}</span>
            <span style={s.sub}>Metrics to investigate</span>
          </header>
          <div style={s.cards}>
            {KPIS.map((k) => (
              <CelebratedMetricCard key={k.id} kpi={k} active={k.id === metricId} onClick={() => setMetricId(k.id)} />
            ))}
          </div>
        </aside>

        <section style={s.detail} aria-label={`${metric.label} detail`}>
          <div style={s.detailScroll}>
            <MetricDetailHeader metric={metric} />
            <MetricDetailBody metric={metric} onAsk={handleAsk} />
          </div>
        </section>
      </div>

      <MiraBottomChat
        open={chatOpen}
        onOpenChange={setChatOpen}
        metric={metric}
        conversation={conversation}
        pendingTurnId={pendingTurnId}
        queriesUsed={queriesUsed}
        queriesTotal={queriesTotal}
        onSubmit={onSubmit}
        onReset={onReset}
      />
    </div>
  );
}

const s = {
  grid: { display: "grid", gridTemplateColumns: "340px minmax(0, 1fr)", gap: 16, height: COL_H, alignItems: "start" },
  rail: { height: "100%", display: "flex", flexDirection: "column", gap: 12, overflow: "hidden" },
  railHead: { display: "flex", flexDirection: "column", gap: 2, flexShrink: 0, padding: "2px 2px 0" },
  space: { fontSize: 18, fontWeight: 800, letterSpacing: "-0.01em", color: "var(--color-text-deep)" },
  sub: { fontSize: 12, fontWeight: 600, color: "var(--color-text-tertiary)" },
  cards: { display: "flex", flexDirection: "column", gap: 12, overflowY: "auto", paddingBottom: 16, paddingInlineEnd: 2 },
  detail: { height: "100%", borderRadius: 16, border: "1px solid var(--color-border-card-soft)", background: "var(--surface-white)", boxShadow: "var(--shadow-1)", overflow: "hidden", minWidth: 0 },
  detailScroll: { height: "100%", overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 18, maxWidth: 760 },
};
