"use client";

import { MiraStarIcon, HistoryIcon, SkillsIcon, TasksIcon } from "../icons";

// Per-module config: ONLY the middle-section icon set + their routing data.
// Chrome (rail, brand, app switcher trigger, footer, avatar) is owned by SideNav.
// Setup Context is intentionally NOT a rail item — it's a chip in the
// composer that opens MiraSetupContextPanel as a right-docked panel.
export const askMiraConfig = {
  moduleId: "mira",
  moduleLabel: "Ask Mira Pro",
  // Short name rendered next to the 9-dot app switcher row when this
  // module is active; also drives the collapsed-state tooltip.
  displayName: "Mira",
  routePrefix: "/mira",
  items: [
    {
      id: "chat",
      label: "Mira",
      Icon: MiraStarIcon,
      route: "/mira/chat",
    },
    {
      id: "history",
      label: "History",
      Icon: HistoryIcon,
      route: "/mira/history",
    },
    {
      id: "skills",
      label: "Skills",
      Icon: SkillsIcon,
      route: "/mira/skills",
    },
    {
      id: "tasks",
      label: "Tasks",
      Icon: TasksIcon,
      route: "/mira/tasks",
    },
  ],
};
