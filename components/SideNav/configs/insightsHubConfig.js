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
  // Short name rendered next to the 9-dot app switcher row when this
  // module is active; also drives the collapsed-state tooltip.
  displayName: "Insights",
  routePrefix: "/insights",
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
        {
          id: "kpi-sidecar",
          label: "KPI Sidecar",
          route: "/insights/kpi-sidecar",
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
