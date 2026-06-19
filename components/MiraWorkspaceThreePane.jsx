"use client";

import React from "react";
import {
  fullBleed, COL_H, CelebratedMetricCard, MetricDetailBody, MetricDetailHeader, MiraBottomChat,
} from "./MiraWorkspaceBits";
import { CollaboratorRow } from "./MiraSpaceBits";
import { SPACE, KPIS, COLLABORATORS, METRIC_THREADS } from "./mocks/miraSpace";

// Workspace v3 — Three-Pane Pro. Everything visible at once: a celebrated
// metric-card rail (left), the detail (centre), and a context rail (right)
// carrying the space's collaborators-with-quota and the chats shared about the
// selected metric. Ask Mira is the bottom chat.
export default function MiraWorkspaceThreePane({
  conversation, pendingTurnId, queriesUsed, queriesTotal, onSubmit, onReset,
}) {
  const [metricId, setMetricId] = React.useState(KPIS[0].id);
  const [chatOpen, setChatOpen] = React.useState(false);
  const metric = KPIS.find((k) => k.id === metricId) || KPIS[0];
  const handleAsk = (t) => { setChatOpen(true); if (t && t.trim() && !pendingTurnId) onSubmit(t); };
  const related = METRIC_THREADS.filter((t) => t.metricId === metric.id);

  return (
    <div style={fullBleed}>
      <div style={s.grid}>
        <aside style={s.rail} aria-label="Metrics to investigate">
          <header style={s.railHead}>
            <span style={s.space}>{SPACE.name}</span>
            <span style={s.sub}>Metrics</span>
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

        <aside style={s.context} aria-label="Context">
          <div style={s.contextScroll}>
            <div style={s.ctxBlock}>
              <span style={s.ctxLabel}>Collaborators</span>
              <div style={s.collabList}>
                {COLLABORATORS.map((p) => <CollaboratorRow key={p.id} person={p} compact />)}
              </div>
              <p style={s.ctxNote}>Members hold a share of this space's query quota.</p>
            </div>
            <div style={s.ctxBlock}>
              <span style={s.ctxLabel}>Shared on this metric</span>
              {related.length === 0
                ? <p style={s.ctxNote}>No shared chats on this metric yet.</p>
                : related.map((t) => (
                    <button key={t.id} type="button" onClick={() => handleAsk(t.title)} style={s.ctxThread}>
                      {t.title}
                    </button>
                  ))}
            </div>
          </div>
        </aside>
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
  grid: { display: "grid", gridTemplateColumns: "300px minmax(0, 1fr) 300px", gap: 16, height: COL_H, alignItems: "start" },
  rail: { height: "100%", display: "flex", flexDirection: "column", gap: 12, overflow: "hidden" },
  railHead: { display: "flex", flexDirection: "column", gap: 2, flexShrink: 0, padding: "2px 2px 0" },
  space: { fontSize: 18, fontWeight: 800, letterSpacing: "-0.01em", color: "var(--color-text-deep)" },
  sub: { fontSize: 12, fontWeight: 600, color: "var(--color-text-tertiary)" },
  cards: { display: "flex", flexDirection: "column", gap: 12, overflowY: "auto", paddingBottom: 16, paddingInlineEnd: 2 },

  detail: { height: "100%", borderRadius: 16, border: "1px solid var(--color-border-card-soft)", background: "var(--surface-white)", boxShadow: "var(--shadow-1)", overflow: "hidden", minWidth: 0 },
  detailScroll: { height: "100%", overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 18 },

  context: { height: "100%", borderRadius: 16, border: "1px solid var(--color-border-card-soft)", background: "var(--surface-white)", boxShadow: "var(--shadow-1)", overflow: "hidden" },
  contextScroll: { height: "100%", overflowY: "auto", padding: 18, display: "flex", flexDirection: "column", gap: 22 },
  ctxBlock: { display: "flex", flexDirection: "column", gap: 12 },
  ctxLabel: { fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--color-text-tertiary)" },
  collabList: { display: "flex", flexDirection: "column", gap: 14 },
  ctxNote: { margin: 0, fontSize: 12, lineHeight: 1.5, color: "var(--color-text-tertiary)" },
  ctxThread: { display: "block", textAlign: "start", width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--color-border-card-soft)", background: "var(--surface-white)", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: "var(--color-text-deep)", lineHeight: 1.4 },
};
