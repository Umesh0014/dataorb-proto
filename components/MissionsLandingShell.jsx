"use client";

import React from "react";
import MissionsPage from "./MissionsPage";
import MissionsDenseTableLayout from "./MissionsDenseTableLayout";
import MissionsKanbanLayout from "./MissionsKanbanLayout";
import MissionsHybridTableLayout from "./MissionsHybridTableLayout";
import SandboxSwitcher from "./sandbox/SandboxSwitcher";
import { SANDBOX_MISSIONS, SANDBOX_DRAFTS, KANBAN_DEMO_MISSIONS } from "./mocks/missionsExtra";

// MissionsLandingShell — wraps the Missions landing in a layout
// sandbox. Renders one of four layouts based on the persisted demo
// preference and overlays the shared SandboxSwitcher in the
// bottom-right. The "Current" layout delegates to the original
// MissionsPage so the production layout is preserved untouched.

const STORAGE_KEY = "dataorb.missions.layoutSandbox";
const VALID = new Set(["current", "table", "kanban", "hybrid"]);

export const SANDBOX_OPTIONS = [
  { id: "current", label: "Current" },
  { id: "table",   label: "Table" },
  { id: "kanban",  label: "Kanban" },
  { id: "hybrid",  label: "Hybrid" },
];

export default function MissionsLandingShell({
  onCreateMission,
  initialMissionId,
  onOpenMission,
}) {
  const [layout, setLayout] = React.useState(() => {
    if (typeof window === "undefined") return "current";
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored && VALID.has(stored)) return stored;
    } catch {
      // ignore — fall back to default
    }
    return "current";
  });

  const [statusFilter, setStatusFilter] = React.useState("Active");
  const missions = React.useMemo(() => {
    if (statusFilter === "Completed") {
      return SANDBOX_MISSIONS.filter((m) => m.state === "completed");
    }
    if (statusFilter === "Draft") {
      return SANDBOX_MISSIONS.filter((m) => m.state === "draft");
    }
    return SANDBOX_MISSIONS.filter((m) => m.state !== "completed" && m.state !== "draft");
  }, [statusFilter]);

  let content;
  if (layout === "table") {
    content = (
      <MissionsDenseTableLayout
        missions={missions}
        statusFilter={statusFilter}
        onStatusFilter={setStatusFilter}
        onOpenMission={onOpenMission}
        onCreateMission={onCreateMission}
      />
    );
  } else if (layout === "kanban") {
    content = (
      <MissionsKanbanLayout
        missions={[...SANDBOX_DRAFTS, ...KANBAN_DEMO_MISSIONS]}
        onCreateMission={onCreateMission}
      />
    );
  } else if (layout === "hybrid") {
    content = (
      <MissionsHybridTableLayout
        missions={missions}
        statusFilter={statusFilter}
        onStatusFilter={setStatusFilter}
        onCreateMission={onCreateMission}
      />
    );
  } else {
    content = (
      <MissionsPage
        onCreateMission={onCreateMission}
        initialMissionId={initialMissionId}
      />
    );
  }

  return (
    <>
      {content}
      <SandboxSwitcher
        options={SANDBOX_OPTIONS}
        activeId={layout}
        onChange={setLayout}
        storageKey={STORAGE_KEY}
        orientation="horizontal"
      />
    </>
  );
}
