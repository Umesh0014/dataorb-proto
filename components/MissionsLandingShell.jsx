"use client";

import React from "react";
import MissionsKanbanLayout from "./MissionsKanbanLayout";
import VariantSwitcher from "./VariantSwitcher";
import { usePersona } from "./lib/personaContext";
import {
  SANDBOX_DRAFTS,
  KANBAN_DEMO_MISSIONS,
  KANBAN_UPCOMING_MISSIONS,
} from "./mocks/missionsExtra";

// MissionsLandingShell — Missions landing entry point. Kanban is the
// single canonical view (revisions Part A).
//
// Persona state was originally page-local (Part E demo affordance). With
// the Roleplay Phase 1 work it now reads from the shell-level
// PersonaContext (PersonaProvider in app/[[...slug]]/page.jsx) so the
// top-right PersonaPill drives the same value, and any other module
// that hides manager-only chrome stays in sync.
//
// Variant state (M1 / M2) stays page-local — variant is a presentation
// choice for Missions only, not an app-wide concern.

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
  const { persona, isAgent } = usePersona();
  // Variant default M2 = current Team Lead view (spec §F3). Persists
  // across persona toggles within the session because the state lives
  // at this level — Agent toggling doesn't unmount it.
  const [variant, setVariant] = React.useState("M2");

  // Source data — Team Lead sees everything; Agent sees only the
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
        variant={variant}
      />
      {/* Variant switcher (M1 / M2) is a demo-only authoring affordance
          for Missions Kanban. Hidden when persona = Agent because the
          M1/M2 distinction is a Team Lead authoring concern. */}
      {!isAgent && (
        <div style={switcherClusterStyles.cluster}>
          <VariantSwitcher variant={variant} onChange={setVariant} />
        </div>
      )}
    </>
  );
}

const switcherClusterStyles = {
  cluster: {
    position: "fixed",
    right: 24,
    bottom: 24,
    zIndex: 50,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 12,
  },
};
