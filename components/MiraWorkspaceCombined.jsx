"use client";

import React from "react";
import {
  fullBleed, COL_H, CelebratedMetricCard, MetricDetailBody, MiraBottomChat,
} from "./MiraWorkspaceBits";
import { SPACE, KPIS } from "./mocks/miraSpace";

// Workspace v1 — Combined Explorer (accordion). Metrics and details are merged
// into one continuous surface: celebrated metric cards stacked in a single
// column; the selected card expands in place to reveal its detail. No separate
// detail pane. Ask Mira is the bottom chat.
export default function MiraWorkspaceCombined({
  conversation, pendingTurnId, queriesUsed, queriesTotal, onSubmit, onReset,
}) {
  const [metricId, setMetricId] = React.useState(KPIS[0].id);
  const [chatOpen, setChatOpen] = React.useState(false);
  const metric = KPIS.find((k) => k.id === metricId) || KPIS[0];
  const handleAsk = (t) => { setChatOpen(true); if (t && t.trim() && !pendingTurnId) onSubmit(t); };

  return (
    <div style={fullBleed}>
      <div style={s.scroll}>
        <header style={s.header}>
          <span style={s.space}>{SPACE.name}</span>
          <span style={s.sub}>Metrics to investigate — open one to dig in</span>
        </header>
        <div style={s.list}>
          {KPIS.map((k) => {
            const active = k.id === metricId;
            return (
              <div key={k.id} style={{ ...s.item, ...(active ? s.itemOn : null) }}>
                <CelebratedMetricCard kpi={k} active={active} onClick={() => setMetricId(active ? null : k.id)} />
                {active && (
                  <div style={s.detail}>
                    <p style={s.source}>{k.source}</p>
                    <MetricDetailBody metric={k} onAsk={handleAsk} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
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
  scroll: { height: COL_H, overflowY: "auto" },
  header: { display: "flex", flexDirection: "column", gap: 2, maxWidth: 860, marginInline: "auto", padding: "2px 4px 16px" },
  space: { fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--color-text-deep)" },
  sub: { fontSize: 13, fontWeight: 600, color: "var(--color-text-tertiary)" },
  list: { display: "flex", flexDirection: "column", gap: 12, maxWidth: 860, marginInline: "auto", paddingBottom: 40 },
  item: { display: "flex", flexDirection: "column", gap: 0 },
  itemOn: { borderRadius: 16 },
  detail: { display: "flex", flexDirection: "column", gap: 18, padding: "20px 18px 4px", marginTop: -6 },
  source: { margin: 0, fontSize: 12, color: "var(--color-text-tertiary)" },
};
