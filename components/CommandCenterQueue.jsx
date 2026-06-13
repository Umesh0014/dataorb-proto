"use client";

import React from "react";
import { PartyPopper } from "lucide-react";
import Banner from "./Banner";
import AttentionItemCard from "./AttentionItemCard";
import CommandCenterTeamStrip from "./CommandCenterTeamStrip";
import { rankItems, rankScore, SEVERITY_META } from "./mocks/commandCenter";

// CommandCenterQueue (Variant A) — operational ranked worklist. One
// severity-ranked column of attention items, grouped by Agent / Driver /
// Severity, each item 1-click launchable, detail in the shared drawer.
// The zero state is deliberate: clear every open item and the team reads as
// on track, with the week's improvements recapped (INT-5).

const GROUPS = [
  { id: "agent", label: "Agent" },
  { id: "driver", label: "Driver" },
  { id: "severity", label: "Severity" },
];

export default function CommandCenterQueue({
  items,
  resolved,
  onLaunch,
  onOpenDetail,
  onOpenAgent,
  onSnooze,
  onDismiss,
  onMarkHandled,
}) {
  const [groupBy, setGroupBy] = React.useState("agent");
  const open = items.filter((it) => it.status === "open");
  const groups = React.useMemo(() => buildGroups(open, groupBy), [open, groupBy]);
  const improved = resolved.filter((r) => r.status === "improved");

  return (
    <div style={qStyles.page}>
      <CommandCenterTeamStrip />

      <div style={qStyles.controls}>
        <div style={qStyles.groupControl} role="group" aria-label="Group attention items by">
          <span style={qStyles.controlLabel}>Group by</span>
          {GROUPS.map((g) => {
            const on = groupBy === g.id;
            return (
              <button
                key={g.id}
                type="button"
                className="cc-focusable"
                aria-pressed={on}
                onClick={() => setGroupBy(g.id)}
                style={{
                  ...qStyles.groupBtn,
                  background: on ? "var(--color-button-primary-bg)" : "var(--surface-white)",
                  color: on ? "var(--color-button-primary-fg)" : "var(--color-text-medium)",
                  borderColor: on ? "var(--color-button-primary-bg)" : "var(--color-divider-card)",
                }}
              >
                {g.label}
              </button>
            );
          })}
        </div>
        <span style={qStyles.rankNote}>Sorted by priority — severity × reach × recency</span>
      </div>

      {open.length === 0 ? (
        <AllClear improved={improved} onOpenAgent={onOpenAgent} />
      ) : (
        <div style={qStyles.groupList}>
          {groups.map((group) => (
            <section key={group.key} style={qStyles.group}>
              <div style={qStyles.groupHeader}>
                <span style={qStyles.groupTitle}>{group.label}</span>
                <span style={qStyles.countPill}>{group.items.length}</span>
              </div>
              <div style={qStyles.cardList}>
                {group.items.map((item) => (
                  <AttentionItemCard
                    key={item.id}
                    item={item}
                    status={item.status}
                    onLaunch={() => onLaunch(item.id)}
                    onOpenDetail={() => onOpenDetail(item.id)}
                    onOpenAgent={onOpenAgent}
                    onSnooze={() => onSnooze(item.id)}
                    onDismiss={() => onDismiss(item.id)}
                    onMarkHandled={() => onMarkHandled(item.id)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

// AllClear — the deliberate zero state: a success banner plus the week's
// improvements so an empty queue still tells the lead something happened.
function AllClear({ improved, onOpenAgent }) {
  return (
    <div style={qStyles.allClear}>
      <Banner
        tone="success"
        leading={<PartyPopper size={20} style={{ color: "var(--color-success)", flexShrink: 0 }} />}
        heading="Your team is on track"
        body={`No open attention items right now. ${improved.length} interventions improved a metric this cycle.`}
      />
      {improved.length > 0 && (
        <div style={qStyles.recap}>
          <span style={qStyles.recapTitle}>Recently improved</span>
          {improved.map((r) => (
            <button
              key={r.id}
              type="button"
              className="cc-focusable"
              onClick={() => onOpenAgent?.(r.agent.id)}
              style={qStyles.recapRow}
            >
              <span style={qStyles.recapName}>{r.agent.name}</span>
              <span style={qStyles.recapComp}>{r.competency}</span>
              <span style={qStyles.recapDelta}>↑ {r.delta.label} {r.delta.value}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// buildGroups — rank within each group, then order groups by their strongest
// item (severity groups keep their fixed High → Low order).
function buildGroups(open, groupBy) {
  if (groupBy === "severity") {
    return ["high", "medium", "low"]
      .map((sev) => ({
        key: sev,
        label: SEVERITY_META[sev].label,
        items: rankItems(open.filter((it) => it.severity === sev)),
      }))
      .filter((g) => g.items.length > 0);
  }
  const keyOf = (it) => (groupBy === "agent" ? it.agent.id : it.driver || "No specific driver");
  const labelOf = (it) => (groupBy === "agent" ? it.agent.name : it.driver || "No specific driver");
  const map = new Map();
  for (const it of open) {
    const k = keyOf(it);
    if (!map.has(k)) map.set(k, { key: k, label: labelOf(it), items: [] });
    map.get(k).items.push(it);
  }
  const groups = [...map.values()].map((g) => ({ ...g, items: rankItems(g.items) }));
  // Order groups by the strongest-ranking item in each.
  return groups.sort((a, b) => rankScore(b.items[0]) - rankScore(a.items[0]));
}

const qStyles = {
  page: { display: "flex", flexDirection: "column", gap: 24 },
  controls: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
  },
  groupControl: { display: "inline-flex", alignItems: "center", gap: 6 },
  controlLabel: {
    fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600,
    color: "var(--color-text-tertiary)", marginRight: 2,
  },
  groupBtn: {
    height: 30,
    paddingInline: 14,
    borderRadius: 999,
    border: "1px solid",
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
  },
  rankNote: {
    fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 500,
    color: "var(--color-text-tertiary)",
  },
  groupList: { display: "flex", flexDirection: "column", gap: 24 },
  group: { display: "flex", flexDirection: "column", gap: 12 },
  groupHeader: { display: "flex", alignItems: "center", gap: 8 },
  groupTitle: { fontFamily: "var(--font-sans)", fontSize: 15, fontWeight: 700, color: "var(--color-text-deep)" },
  countPill: {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    minWidth: 22, padding: "2px 8px", borderRadius: 999,
    background: "var(--pill-bg)", border: "1px solid var(--color-divider-card)",
    fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 700, color: "var(--color-text-medium)",
  },
  cardList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: 16,
    alignItems: "start",
  },
  allClear: { display: "flex", flexDirection: "column", gap: 16 },
  recap: {
    display: "flex", flexDirection: "column", gap: 4,
    background: "var(--surface-white)", border: "1px solid var(--color-divider-card)",
    borderRadius: 12, padding: 16,
  },
  recapTitle: {
    fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em",
    textTransform: "uppercase", color: "var(--color-text-tertiary)", marginBottom: 4,
  },
  recapRow: {
    display: "flex", alignItems: "center", gap: 12, width: "100%",
    background: "transparent", border: "none", cursor: "pointer",
    padding: "8px 6px", borderRadius: 8, textAlign: "left",
  },
  recapName: { fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 700, color: "var(--color-text-deep)", minWidth: 140 },
  recapComp: { flex: 1, fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 400, color: "var(--text-secondary)" },
  recapDelta: { fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 700, color: "var(--color-success)" },
};
