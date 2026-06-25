"use client";

import { DrillIcon, InteractionsIcon, MissionsIcon, GuideIcon, ReplayIcon, CommandCenterIcon, SmartphoneIcon, GuidedWorkflowIcon } from "../icons";

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
      id: "dashboard",
      label: "Dashboard",
      Icon: CommandCenterIcon,
      route: "/learning/dashboard",
      beta: true,
    },
    {
      id: "drill",
      label: "Drill",
      Icon: DrillIcon,
      route: "/learning/drill",
    },
    {
      id: "guided-workflow",
      label: "Guided Workflow",
      Icon: GuidedWorkflowIcon,
      route: "/learning/guided-workflow",
    },
    {
      id: "interactions",
      label: "Interactions",
      Icon: InteractionsIcon,
      route: "/learning/interactions",
    },
    {
      id: "missions",
      label: "Missions",
      Icon: MissionsIcon,
      route: "/learning/missions",
      // `beta` flag drives the filled "Beta" badge on the rail icon
      // (revisions Part C). Same NavBadge component as `wip`, filled
      // variant — saturated warning-hue fill + white text.
      beta: true,
    },
    {
      id: "guide",
      label: "Guide",
      Icon: GuideIcon,
      route: "/learning/guide",
      // `wip` flag drives the small "WIP" badge on the rail icon.
      // Reuse-only — SideNav reads this and renders a corner badge
      // without altering the icon centring or rail width.
      wip: true,
    },
    {
      id: "replay",
      label: "Replay",
      Icon: ReplayIcon,
      route: "/learning/replay",
      beta: true,
    },
    {
      id: "mobile",
      label: "Mobile",
      Icon: SmartphoneIcon,
      route: "/learning/mobile",
      wip: true,
    },
  ],
};
