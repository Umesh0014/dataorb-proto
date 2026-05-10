"use client";

import { MiraStarIcon, HistoryIcon } from "../icons";

// Per-module config: ONLY the middle-section icon set + their routing data.
// Chrome (rail, brand, app switcher trigger, footer, avatar) is owned by SideNav.
export const askMiraConfig = {
  moduleId: "mira",
  moduleLabel: "Ask Mira Pro",
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
  ],
};
