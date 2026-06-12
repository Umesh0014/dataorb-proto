"use client";

import { DrillIcon, InteractionsIcon, AgentsIcon, MissionsIcon, GuideIcon, ReplayIcon, FaceScanIcon } from "../icons";

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
      id: "recruiter",
      label: "AI Recruiter",
      Icon: FaceScanIcon,
      route: "/learning/recruiter",
      // Exploratory surface (Notion ticket parked / 2027) — flagged WIP on
      // the rail so it never reads as a shipped module.
      wip: true,
    },
  ],
};
