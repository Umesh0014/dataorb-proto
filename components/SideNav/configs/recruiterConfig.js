"use client";

import { FaceScanIcon, AgentsIcon, GuideIcon } from "../icons";

// Per-module config: ONLY the middle-section icon set + their routing data.
// Chrome (rail, brand, app switcher trigger, footer, avatar) is owned by SideNav.
//
// AI Recruiter is its own top-level product (4th in the app switcher, below
// Ask Mira Pro). Its primary surface is the hiring manager's candidate
// Pipeline; Talent Community and Interview Plans are sub-sections that render
// <ComingSoon> until built (page-creation recipe).
export const recruiterConfig = {
  moduleId: "recruiter",
  moduleLabel: "AI Recruiter",
  // Short name rendered next to the 9-dot app switcher row when this module is
  // active; also drives the collapsed-state tooltip.
  displayName: "Recruiter",
  routePrefix: "/recruiter",
  items: [
    {
      id: "pipeline",
      label: "Pipeline",
      Icon: FaceScanIcon,
      route: "/recruiter/pipeline",
    },
    {
      id: "community",
      label: "Talent Community",
      Icon: AgentsIcon,
      route: "/recruiter/community",
    },
    {
      id: "plans",
      label: "Interview Plans",
      Icon: GuideIcon,
      route: "/recruiter/plans",
      // Exploratory product (Notion ticket parked / 2027) — flagged WIP on the
      // rail so it never reads as a shipped, wired surface.
      wip: true,
    },
  ],
};
