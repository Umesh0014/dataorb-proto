"use client";

import React from "react";
import MissionsKanbanLayout from "./MissionsKanbanLayout";
import VersionBar from "./VersionBar";
import {
  SANDBOX_DRAFTS,
  KANBAN_DEMO_MISSIONS,
  KANBAN_UPCOMING_MISSIONS,
} from "./mocks/missionsExtra";

// MissionsLandingShell — Missions landing entry point. Kanban is the
// single canonical view (revisions Part A). Hosts the demo-only persona
// state (Part E) + variant state (Part F) and the floating switcher
// cluster. Both states are in-memory only — when the session ends the
// page resets to "Team Leader" + "M2" defaults (deletable in a single
// commit).
// (Cache-buster: v1.)
//
// Switcher chrome is VersionBar (replaces the stacked Persona +
// Variant DarkPillSwitchers): persona lives in the baseline-block
// dropdown (Team Leader / Agent), variant lives in M1 / M2 chips
// that only appear when persona = Team Leader, matching the original
// gating rule.

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
  locale = "en",
  onLocaleChange,
}) {
  const [persona, setPersona] = React.useState("Team Leader");
  // Variant default M2 = current Team Leader view (spec §F3). Persists
  // across persona toggles within the session (spec §F8 #6) because the
  // state lives at this level — Agent toggling doesn't unmount it.
  const [variant, setVariant] = React.useState("M2");
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

  // M1/M2 chips render only when persona = Team Leader; Agent persona
  // shows the baseline-only bar (matches the original VariantSwitcher
  // gating rule).
  const versionsForBar = isAgent ? [] : VARIANT_VERSIONS;
  // VersionBar.value follows page state: TL → the active variant chip;
  // Agent → the Agent baseline option.
  const activeVersionId = isAgent ? "agent" : variant.toLowerCase();

  const handleVersionChange = ({ versionId }) => {
    if (versionId === "tl") setPersona("Team Leader");
    else if (versionId === "agent") setPersona("Agent");
    else if (versionId === "m1") setVariant("M1");
    else if (versionId === "m2") setVariant("M2");
  };

  return (
    <>
      <MissionsKanbanLayout
        missions={visibleMissions}
        upcomingMissions={visibleUpcoming}
        onCreateMission={onCreateMission}
        onOpenMission={onOpenMission}
        persona={persona}
        variant={variant}
        locale={locale}
        onLocaleChange={onLocaleChange}
      />
      <VersionBar
        versions={versionsForBar}
        baselineOptions={PERSONA_BASELINE}
        value={{ versionId: activeVersionId, iterationId: null }}
        onChange={handleVersionChange}
      />
    </>
  );
}

// VersionBar data — persona drives the baseline-block dropdown;
// variant drives the chips. Agent persona has no chips (gated).
const PERSONA_BASELINE = [
  { id: "tl",    label: "Team Leader" },
  { id: "agent", label: "Agent" },
];
const VARIANT_VERSIONS = [
  { id: "m1", label: "M1", iterations: [] },
  { id: "m2", label: "M2", iterations: [] },
];
