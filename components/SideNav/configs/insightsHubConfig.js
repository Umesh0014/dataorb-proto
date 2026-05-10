"use client";

import {
  RocketLaunchIcon,
  ChatBubbleIcon,
  AgentSquareIcon,
} from "../icons";

// Per-module config: ONLY the middle-section icon set + their routing data.
// Chrome (rail, brand, app switcher trigger, footer, avatar) is owned by SideNav.
//
// Each item is either:
//   - direct nav: { id, label, Icon, route }
//   - sub-menu:   { id, label, Icon, children: [{ id, label, route }, …] }
// Mutually exclusive — see SideNavItem typedef in SideNav.jsx.
export const insightsHubConfig = {
  moduleId: "insights",
  moduleLabel: "Insights Hub",
  items: [
    {
      id: "rocket",
      label: "Insights",
      Icon: RocketLaunchIcon,
      dot: true,
      children: [
        {
          id: "contact-center",
          label: "Contact Center",
          route: "/insights/contact-center",
        },
        {
          id: "reports",
          label: "Reports",
          route: "/insights/reports",
        },
      ],
    },
    {
      id: "interaction",
      label: "Interaction",
      Icon: ChatBubbleIcon,
      route: "/insights/interaction",
    },
    {
      id: "headset",
      label: "Agents",
      Icon: AgentSquareIcon,
      children: [
        {
          id: "agent-performance",
          label: "Agent Performance",
          route: "/insights/agents/performance",
        },
        {
          id: "session",
          label: "Session",
          route: "/insights/agents/session",
        },
      ],
    },
  ],
};
