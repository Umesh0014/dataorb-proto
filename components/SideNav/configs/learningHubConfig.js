"use client";

import { DrillIcon, InteractionsIcon, AgentsIcon, MissionsIcon } from "../icons";

// Per-module config: ONLY the middle-section icon set + their routing data.
// Chrome (rail, brand, app switcher trigger, footer, avatar) is owned by SideNav.
export const learningHubConfig = {
  moduleId: "learning",
  moduleLabel: "Learning Hub",
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
