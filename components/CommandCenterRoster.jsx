"use client";

import React from "react";
import CommandCenterScoreboard from "./CommandCenterScoreboard";
import CommandCenterTasks from "./CommandCenterTasks";
import AgentRosterTable from "./AgentRosterTable";
import { TEAM_ROSTER, rosterStatus } from "./mocks/commandCenter";

// CommandCenterRoster (Variant A · default) — the team-leader dashboard: the
// team scoreboard + Learning Hub impact, then the critical Tasks, then the
// team roster as a simple sortable table (CSAT + composite, each number +
// trendline). Clicking a row opens the agent's detail page.
export default function CommandCenterRoster({
  items,
  onLaunch,
  onOpenAgent,
  onSnooze,
  onDismiss,
  onMarkHandled,
}) {
  const needsHelp = React.useMemo(() => TEAM_ROSTER.filter((a) => rosterStatus(a) === "needs_help"), []);
  const [onlyAttention, setOnlyAttention] = React.useState(false);
  const visibleRoster = onlyAttention ? needsHelp : TEAM_ROSTER;

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
          <AgentRosterTable agents={visibleRoster} onOpenAgent={onOpenAgent} />
        )}
      </section>
    </div>
  );
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
  empty: { margin: 0, fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text-secondary)" },
};
