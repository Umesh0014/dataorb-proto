"use client";

import React from "react";
import CommandCenterScoreboard from "./CommandCenterScoreboard";
import CommandCenterTasks from "./CommandCenterTasks";
import AgentScoreRow from "./AgentScoreRow";
import { TEAM_ROSTER, rosterStatus } from "./mocks/commandCenter";

// CommandCenterRoster (Variant A · default) — the team-leader dashboard:
// the team scoreboard, then the critical Tasks, then every agent as a score
// row (CSAT + composite, number + trendline + dotted target). Clicking an
// agent opens their detail page. Needs-help agents float to the top.
export default function CommandCenterRoster({
  items,
  onLaunch,
  onOpenAgent,
  onSnooze,
  onDismiss,
  onMarkHandled,
}) {
  const ordered = React.useMemo(() => orderRoster(TEAM_ROSTER), []);
  const needsHelp = ordered.filter((a) => rosterStatus(a) === "needs_help");
  const [onlyAttention, setOnlyAttention] = React.useState(false);
  const visibleRoster = onlyAttention ? needsHelp : ordered;

  const taskProps = { items, onLaunch, onOpenAgent, onSnooze, onDismiss, onMarkHandled };

  return (
    <div style={rStyles.page}>
      <CommandCenterScoreboard />
      <CommandCenterTasks {...taskProps} />

      <section style={rStyles.section}>
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

        {visibleRoster.length === 0 ? (
          <p style={rStyles.empty}>No agents need attention right now — the whole team is at or above target.</p>
        ) : (
          <div style={rStyles.list}>
            {visibleRoster.map((agent) => (
              <AgentScoreRow key={agent.id} agent={agent} onOpenAgent={onOpenAgent} />
            ))}
          </div>
        )}
      </section>
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
  page: { display: "flex", flexDirection: "column", gap: 28 },
  section: { display: "flex", flexDirection: "column", gap: 14 },
  controls: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 },
  heading: { margin: 0, fontFamily: "var(--font-sans)", fontSize: 17, fontWeight: 700, color: "var(--color-text-deep)" },
  toggle: {
    display: "inline-flex", alignItems: "center", gap: 8,
    fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: "var(--color-text-medium)", cursor: "pointer",
  },
  checkbox: { width: 16, height: 16, accentColor: "var(--color-button-primary-bg)", cursor: "pointer" },
  list: { display: "flex", flexDirection: "column", gap: 12 },
  empty: { margin: 0, fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text-secondary)" },
};
