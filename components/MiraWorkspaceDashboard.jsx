"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
import {
  fullBleed, COL_H, CelebratedMetricCard, MetricDetailBody, MetricDetailHeader, MiraBottomChat,
} from "./MiraWorkspaceBits";
import { SPACE, KPIS, METRIC_GROUPS } from "./mocks/miraSpace";

// Workspace v4 — Dashboard → Focus. Opens as a full overview grid of celebrated
// metric cards (grouped by theme). Click a card to enter a focused detail view
// for that metric; Back returns to the grid. Overview-first navigation. Ask
// Mira is the bottom chat.
export default function MiraWorkspaceDashboard({
  conversation, pendingTurnId, queriesUsed, queriesTotal, onSubmit, onReset,
}) {
  const [focusId, setFocusId] = React.useState(null);
  const [chatOpen, setChatOpen] = React.useState(false);
  const metric = KPIS.find((k) => k.id === focusId) || KPIS[0];
  const handleAsk = (t) => { setChatOpen(true); if (t && t.trim() && !pendingTurnId) onSubmit(t); };

  return (
    <div style={fullBleed}>
      <div style={s.scroll}>
        {focusId ? (
          <div style={s.focus}>
            <button type="button" onClick={() => setFocusId(null)} style={s.back}>
              <ArrowLeft size={16} /> All metrics
            </button>
            <div style={s.focusCard}>
              <MetricDetailHeader metric={metric} />
              <MetricDetailBody metric={metric} onAsk={handleAsk} />
            </div>
          </div>
        ) : (
          <>
            <header style={s.header}>
              <span style={s.space}>{SPACE.name}</span>
              <span style={s.sub}>Every metric at a glance — open one to investigate</span>
            </header>
            {METRIC_GROUPS.map((g) => (
              <section key={g.id} style={s.group}>
                <span style={s.groupLabel}>{g.label}</span>
                <div style={s.grid}>
                  {g.metricIds.map((id) => {
                    const k = KPIS.find((m) => m.id === id);
                    if (!k) return null;
                    return <CelebratedMetricCard key={k.id} kpi={k} active={false} onClick={() => setFocusId(k.id)} />;
                  })}
                </div>
              </section>
            ))}
          </>
        )}
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
  scroll: { height: COL_H, overflowY: "auto", paddingBottom: 40 },
  header: { display: "flex", flexDirection: "column", gap: 2, padding: "2px 2px 18px" },
  space: { fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--color-text-deep)" },
  sub: { fontSize: 13, fontWeight: 600, color: "var(--color-text-tertiary)" },
  group: { display: "flex", flexDirection: "column", gap: 12, marginBottom: 26 },
  groupLabel: { fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--color-text-tertiary)" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(248px, 1fr))", gap: 14 },

  focus: { display: "flex", flexDirection: "column", gap: 14, maxWidth: 820, marginInline: "auto" },
  back: { display: "inline-flex", alignItems: "center", gap: 6, alignSelf: "flex-start", border: "none", background: "transparent", padding: 0, cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 700, color: "var(--color-text-medium)" },
  focusCard: { display: "flex", flexDirection: "column", gap: 18, padding: 24, borderRadius: 16, border: "1px solid var(--color-border-card-soft)", background: "var(--surface-white)", boxShadow: "var(--shadow-1)" },
};
