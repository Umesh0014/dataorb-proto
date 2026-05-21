"use client";

import { DrillIcon, InteractionsIcon, AgentsIcon, MissionsIcon } from "../icons";

// Per-module config: ONLY the middle-section icon set + their routing data.
// Chrome (rail, brand, app switcher trigger, footer, avatar) is owned by SideNav.
export const learningHubConfig = {
  moduleId: "learning",
  moduleLabel: "Learning Hub",
  // Short name rendered next to the 9-dot app switcher row when this
  // module is active; also drives the collapsed-state tooltip.
  displayName: "Learning",
  routePrefix: "/learning",
  items: [
    {
      id: "drill",
      label: "Drill",
      Icon: DrillIcon,
      route: "/learning/drill",
    },
    {
      id: "interactions",
      label: "Interactions",
      Icon: InteractionsIcon,
      route: "/learning/interactions",
    },
    {
      id: "agents",
      label: "Agents",
      Icon: AgentsIcon,
      route: "/learning/agents",
    },
    {
      id: "missions",
      label: "Missions",
      Icon: MissionsIcon,
      route: "/learning/missions",
    },
  ],
};
