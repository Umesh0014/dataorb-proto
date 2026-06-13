"use client";

import React from "react";
import CommandCenterTeamStrip from "./CommandCenterTeamStrip";
import AgentScoreRow from "./AgentScoreRow";
import { TEAM_ROSTER, rosterStatus } from "./mocks/commandCenter";

// CommandCenterRoster (Variant A · default) — the team-leader dashboard.
// Team-level org metrics on top, then every agent on the team with their
// CSAT + composite score, each row expanding to that agent's action items
// under an "improve the score" goal. Agents who need help are floated to the
// top; on-track agents sit below so the lead works by exception.

export default function CommandCenterRoster({
  items,
  onLaunch,
  onOpenDetail,
  onOpenAgent,
  onSnooze,
  onDismiss,
  onMarkHandled,
}) {
  const ordered = React.useMemo(() => orderRoster(TEAM_ROSTER), []);
  const needsHelp = ordered.filter((a) => rosterStatus(a) === "needs_help");
  const [onlyAttention, setOnlyAttention] = React.useState(false);
  // Default-open the top-priority agent so action items are visible at a glance.
  const [openIds, setOpenIds] = React.useState(() => new Set(needsHelp[0] ? [needsHelp[0].id] : []));

  const visibleRoster = onlyAttention ? needsHelp : ordered;
  const toggle = (id) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  const itemsFor = (agentId) => items.filter((it) => it.agent.id === agentId);

  return (
    <div style={rStyles.page}>
      <CommandCenterTeamStrip />

      <div style={rStyles.controls}>
        <h2 style={rStyles.heading}>Agents</h2>
        <label style={rStyles.toggle}>
          <input
            type="checkbox"
            checked={onlyAttention}
            onChange={(e) => setOnlyAttention(e.target.checked)}
            style={rStyles.checkbox}
          />
          Needs attention only ({needsHelp.length})
        </label>
      </div>

      <div style={rStyles.list}>
        {visibleRoster.map((agent) => (
          <AgentScoreRow
            key={agent.id}
            agent={agent}
            items={itemsFor(agent.id)}
            expanded={openIds.has(agent.id)}
            onToggle={() => toggle(agent.id)}
            onLaunch={onLaunch}
            onOpenDetail={onOpenDetail}
            onOpenAgent={onOpenAgent}
            onSnooze={onSnooze}
            onDismiss={onDismiss}
            onMarkHandled={onMarkHandled}
          />
        ))}
      </div>
    </div>
  );
}

// orderRoster — needs-help first (lowest composite = most help), on-track
// after (highest composite first). Pure; never mutates input.
function orderRoster(roster) {
  return [...roster].sort((a, b) => {
    const aHelp = rosterStatus(a) === "needs_help" ? 0 : 1;
    const bHelp = rosterStatus(b) === "needs_help" ? 0 : 1;
    if (aHelp !== bHelp) return aHelp - bHelp;
    return aHelp === 0 ? a.composite - b.composite : b.composite - a.composite;
  });
}

const rStyles = {
  page: { display: "flex", flexDirection: "column", gap: 24 },
  controls: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 },
  heading: { margin: 0, fontFamily: "var(--font-sans)", fontSize: 17, fontWeight: 700, color: "var(--color-text-deep)" },
  toggle: {
    display: "inline-flex", alignItems: "center", gap: 8,
    fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: "var(--color-text-medium)",
    cursor: "pointer",
  },
  checkbox: { width: 16, height: 16, accentColor: "var(--color-button-primary-bg)", cursor: "pointer" },
  list: { display: "flex", flexDirection: "column", gap: 12 },
};
