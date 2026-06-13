"use client";

import React from "react";
import { PartyPopper } from "lucide-react";
import Card from "./Card";
import Banner from "./Banner";
import AttentionItemCard from "./AttentionItemCard";
import CommandCenterTeamStrip from "./CommandCenterTeamStrip";
import InlineStatusAffordance from "./InlineStatusAffordance";
import { rankItems } from "./mocks/commandCenter";

// CommandCenterBoard (Variant B) — pipeline view. The lanes ARE the loop:
// Needs attention → Acted → Improved → No change. Reuses the Missions Kanban
// lane treatment (muted lane surface, count pill, hidden-until-hover
// scrollbars) so the board reads as house style. Open/Acted cards reuse the
// shared AttentionItemCard (dense); resolved lanes use a compact outcome
// card carrying the metric delta.

export default function CommandCenterBoard({
  items,
  resolved,
  onLaunch,
  onOpenDetail,
  onOpenAgent,
  onSnooze,
  onDismiss,
  onMarkHandled,
}) {
  const open = rankItems(items.filter((it) => it.status === "open"));
  const acted = items.filter((it) => it.status === "acted");
  const improved = resolved.filter((r) => r.status === "improved");
  const noChange = resolved.filter((r) => r.status === "no_change");

  const lanes = [
    { id: "attention", label: "Needs attention", count: open.length },
    { id: "acted", label: "Acted · awaiting result", count: acted.length },
    { id: "improved", label: "Improved", count: improved.length },
    { id: "nochange", label: "No change yet", count: noChange.length },
  ];

  return (
    <div style={bStyles.page}>
      <CommandCenterTeamStrip subtitle="Pipeline view — intervention → acted → improved" />
      <div style={bStyles.board}>
        {lanes.map((lane) => (
          <section key={lane.id} style={bStyles.lane} className="kanbanLane">
            <div style={bStyles.laneHeader}>
              <span style={bStyles.laneTitle}>{lane.label}</span>
              <span style={bStyles.countPill}>{lane.count}</span>
            </div>
            <div style={bStyles.laneScroll} className="kanbanLaneScroll">
              {lane.id === "attention" && (
                open.length === 0 ? (
                  <Banner
                    tone="success"
                    leading={<PartyPopper size={18} style={{ color: "var(--color-success)", flexShrink: 0 }} />}
                    heading="On track"
                    body="No open attention items."
                  />
                ) : (
                  open.map((item) => (
                    <AttentionItemCard
                      key={item.id}
                      item={item}
                      status="open"
                      dense
                      onLaunch={() => onLaunch(item.id)}
                      onOpenDetail={() => onOpenDetail(item.id)}
                      onOpenAgent={onOpenAgent}
                      onSnooze={() => onSnooze(item.id)}
                      onDismiss={() => onDismiss(item.id)}
                      onMarkHandled={() => onMarkHandled(item.id)}
                    />
                  ))
                )
              )}

              {lane.id === "acted" && (
                acted.length === 0
                  ? <LaneEmpty text="Launched interventions land here while their metric window runs." />
                  : acted.map((item) => (
                    <AttentionItemCard
                      key={item.id}
                      item={item}
                      status="acted"
                      dense
                      onOpenDetail={() => onOpenDetail(item.id)}
                      onOpenAgent={onOpenAgent}
                    />
                  ))
              )}

              {lane.id === "improved" && improved.map((r) => (
                <OutcomeCard key={r.id} item={r} onOpenAgent={onOpenAgent} />
              ))}
              {lane.id === "nochange" && (
                noChange.length === 0
                  ? <LaneEmpty text="Nothing stalled." />
                  : noChange.map((r) => <OutcomeCard key={r.id} item={r} onOpenAgent={onOpenAgent} />)
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

// OutcomeCard — compact closed-loop card for the Improved / No change lanes.
// The delta pairs an arrow glyph + signed value with its label, so the
// outcome never reads by colour alone.
function OutcomeCard({ item, onOpenAgent }) {
  const up = item.delta.direction === "up";
  const tone = up ? "success" : "tertiary";
  const arrow = up ? "↑" : "→";
  return (
    <Card tone="outline" padX={16} padY={14} style={bStyles.outcome}>
      <button
        type="button"
        className="cc-focusable"
        onClick={() => onOpenAgent?.(item.agent.id)}
        style={bStyles.outcomeHead}
        aria-label={`Open ${item.agent.name}'s profile`}
      >
        <span style={bStyles.outcomeAvatar}>{item.agent.initials}</span>
        <span style={bStyles.outcomeName}>{item.agent.name}</span>
      </button>
      <span style={bStyles.outcomeComp}>{item.competency}</span>
      <InlineStatusAffordance tone={tone}>
        {arrow} {item.delta.label} {item.delta.value} {item.delta.window}
      </InlineStatusAffordance>
    </Card>
  );
}

function LaneEmpty({ text }) {
  return <p style={bStyles.laneEmpty}>{text}</p>;
}

const bStyles = {
  page: { display: "flex", flexDirection: "column", gap: 24 },
  board: {
    display: "flex",
    flexDirection: "row",
    gap: 16,
    alignItems: "flex-start",
    overflowX: "auto",
    paddingBottom: 4,
  },
  lane: {
    flex: 1,
    minWidth: 244,
    background: "var(--color-card-emoji-bg)",
    borderRadius: 12,
    padding: 14,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  laneHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    paddingBottom: 10,
    boxShadow: "0 1px 0 var(--color-divider-card)",
  },
  laneTitle: { fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 700, color: "var(--color-text-deep)", lineHeight: 1.3 },
  countPill: {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    minWidth: 22, padding: "2px 8px", borderRadius: 999,
    background: "var(--surface-white)", border: "1px solid var(--color-divider-card)",
    fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 700, color: "var(--color-text-medium)",
  },
  laneScroll: { display: "flex", flexDirection: "column", gap: 12 },
  laneEmpty: {
    margin: 0, fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 400,
    color: "var(--color-text-tertiary)", lineHeight: 1.5, padding: "8px 2px",
  },
  outcome: { display: "flex", flexDirection: "column", gap: 8 },
  outcomeHead: {
    display: "flex", alignItems: "center", gap: 8, background: "transparent",
    border: "none", padding: 0, cursor: "pointer", textAlign: "left",
  },
  outcomeAvatar: {
    flexShrink: 0, width: 28, height: 28, borderRadius: "50%",
    background: "var(--grey-100)", color: "var(--color-text-medium)",
    fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 700,
    display: "inline-flex", alignItems: "center", justifyContent: "center",
  },
  outcomeName: { fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 700, color: "var(--color-text-deep)" },
  outcomeComp: { fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 400, color: "var(--text-secondary)" },
};
