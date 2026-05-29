"use client";

import React from "react";
import MissionsKanbanLayout from "./MissionsKanbanLayout";
import PersonaSwitcher from "./PersonaSwitcher";
import {
  SANDBOX_DRAFTS,
  KANBAN_DEMO_MISSIONS,
  KANBAN_UPCOMING_MISSIONS,
} from "./mocks/missionsExtra";

// MissionsLandingShell — Missions landing entry point. Kanban is the
// single canonical view (revisions Part A). Hosts the demo-only
// persona state (Part E) and the floating switcher. Persona state is
// in-memory only — when the session ends the page resets to the
// "Team Leader" default (deletable in a single commit).

// Demo agent — used by the Agent persona to filter visible missions.
// Pick ids that span Active / At Risk / Completed / Upcoming so every
// swimlane has at least one card during the demo. Real impl: derive
// from the signed-in user + their mission assignments.
const AGENT_MISSION_IDS = new Set([
  "kanban-on-track",          // Active (Customer Support Enhancement)
  "kanban-ending-soon",       // At Risk (if present)
  "kanban-at-risk",           // At Risk
  "kanban-ends-today",        // At Risk
  "kanban-completed",         // Completed
  "kanban-upcoming-1",        // Upcoming (Premium Loyalty Save Drill)
  "kanban-upcoming-2",        // Upcoming
]);

export default function MissionsLandingShell({
  onCreateMission,
  onOpenMission,
}) {
  const [persona, setPersona] = React.useState("Team Leader");
  const isAgent = persona === "Agent";

  // Source data — Team Leader sees everything; Agent sees only the
  // missions assigned to them (sample filter for the demo).
  const allMissions = React.useMemo(
    () => [...SANDBOX_DRAFTS, ...KANBAN_DEMO_MISSIONS],
    [],
  );
  const visibleMissions = isAgent
    ? allMissions.filter((m) => AGENT_MISSION_IDS.has(m.id))
    : allMissions;
  const visibleUpcoming = isAgent
    ? KANBAN_UPCOMING_MISSIONS.filter((m) => AGENT_MISSION_IDS.has(m.id))
    : KANBAN_UPCOMING_MISSIONS;

  return (
    <>
      <MissionsKanbanLayout
        missions={visibleMissions}
        upcomingMissions={visibleUpcoming}
        onCreateMission={onCreateMission}
        onOpenMission={onOpenMission}
        persona={persona}
      />
      <PersonaSwitcher persona={persona} onChange={setPersona} />
    </>
  );
}
