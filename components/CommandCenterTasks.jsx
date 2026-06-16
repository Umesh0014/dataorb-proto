"use client";

import React from "react";
import { CheckCircle2, X } from "lucide-react";
import Button from "./Button";
import AttentionItemCard from "./AttentionItemCard";
import { SEVERITY_META, rankScore } from "./mocks/commandCenter";

// CommandCenterTasks — the dashboard's action queue. When an agent needs
// assistance, the recommended action (guided drill / replay / probe / 1:1)
// shows as a card, ordered strictly critical → low. The three most critical
// show upfront; "View all" opens the full list in a right-side curtain (not an
// inline expansion). Reuses the shared AttentionItemCard; per-item detail
// opens in the shared drawer on top.
export default function CommandCenterTasks({
  items,
  onLaunch,
  onOpenAgent,
  onSnooze,
  onDismiss,
  onMarkHandled,
}) {
  // Ordered strictly critical → low (severity band), ties broken by the
  // weighted rank score.
  const tasks = React.useMemo(
    () =>
      items
        .filter((it) => it.status === "open")
        .sort((a, b) => SEVERITY_META[a.severity].order - SEVERITY_META[b.severity].order || rankScore(b) - rankScore(a)),
    [items],
  );
  const [curtainOpen, setCurtainOpen] = React.useState(false);

  React.useEffect(() => {
    if (!curtainOpen) return undefined;
    const onKey = (e) => { if (e.key === "Escape") setCurtainOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [curtainOpen]);

  const cardHandlers = { onLaunch, onOpenAgent, onSnooze, onDismiss, onMarkHandled };

  return (
    <section style={tStyles.section}>
      <div style={tStyles.head}>
        <div>
          <h2 style={tStyles.title}>Tasks — agents who need assistance</h2>
          <p style={tStyles.lede}>Most critical first: guided drills, replays, probes, and 1:1s to lift the score.</p>
        </div>
        {tasks.length > 3 && (
          <Button variant="text" uppercase={false} onClick={() => setCurtainOpen(true)}>
            View all {tasks.length}
          </Button>
        )}
      </div>

      {tasks.length === 0 ? (
        <div style={tStyles.empty}>
          <CheckCircle2 size={18} style={{ color: "var(--color-success)", flexShrink: 0 }} aria-hidden="true" />
          <span style={tStyles.emptyText}>No open tasks — every agent who needed help has been actioned.</span>
        </div>
      ) : (
        <div style={tStyles.grid}>
          {tasks.slice(0, 3).map((item) => (
            <TaskCard key={item.id} item={item} {...cardHandlers} />
          ))}
        </div>
      )}

      {/* Side curtain — the full task list */}
      {curtainOpen && <div style={tStyles.scrim} onClick={() => setCurtainOpen(false)} aria-hidden="true" />}
      <aside
        role="complementary"
        aria-label="All tasks"
        aria-hidden={!curtainOpen}
        style={{ ...tStyles.curtain, transform: curtainOpen ? "translateX(0)" : "translateX(100%)", boxShadow: curtainOpen ? "var(--shadow-drawer)" : "none" }}
      >
        <div style={tStyles.curtainHead}>
          <span style={tStyles.curtainTitle}>All tasks ({tasks.length})</span>
          <Button variant="icon" size="sm" aria-label="Close tasks" onClick={() => setCurtainOpen(false)}>
            <X size={18} />
          </Button>
        </div>
        <div style={tStyles.curtainBody}>
          {tasks.map((item) => (
            <TaskCard key={item.id} item={item} {...cardHandlers} />
          ))}
        </div>
      </aside>
    </section>
  );
}

function TaskCard({ item, onLaunch, onOpenAgent, onSnooze, onDismiss, onMarkHandled }) {
  return (
    <AttentionItemCard
      item={item}
      status={item.status}
      onLaunch={() => onLaunch(item.id)}
      onOpenAgent={onOpenAgent}
      onSnooze={() => onSnooze(item.id)}
      onDismiss={() => onDismiss(item.id)}
      onMarkHandled={() => onMarkHandled(item.id)}
    />
  );
}

const tStyles = {
  section: { display: "flex", flexDirection: "column", gap: 14 },
  head: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 },
  title: { margin: 0, fontFamily: "var(--font-sans)", fontSize: 17, fontWeight: 700, color: "var(--color-text-deep)" },
  lede: { margin: "2px 0 0", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 400, color: "var(--text-secondary)" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16, alignItems: "stretch", gridAutoRows: "1fr" },
  empty: {
    display: "flex", alignItems: "center", gap: 10, padding: "16px 18px",
    background: "var(--surface-white)", border: "1px solid var(--color-divider-card)", borderRadius: 12,
  },
  emptyText: { fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 500, color: "var(--color-text-medium)" },

  scrim: { position: "fixed", inset: 0, zIndex: 43, background: "rgba(15, 18, 36, 0.32)" },
  curtain: {
    position: "fixed", top: 0, right: 0, bottom: 0, width: 460, maxWidth: "94vw",
    background: "var(--surface-white)", borderLeft: "1px solid var(--color-divider-card)",
    display: "flex", flexDirection: "column", zIndex: 44, transition: "transform 220ms ease",
  },
  curtainHead: {
    flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "16px 20px", borderBottom: "1px solid var(--color-divider-card)",
  },
  curtainTitle: { fontFamily: "var(--font-sans)", fontSize: 16, fontWeight: 700, color: "var(--color-text-deep)" },
  curtainBody: { flex: 1, minHeight: 0, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 14 },
};
