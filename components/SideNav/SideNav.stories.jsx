"use client";

import React from "react";
import SideNav from "./SideNav";
import { insightsHubConfig } from "./configs/insightsHubConfig";
import { learningHubConfig } from "./configs/learningHubConfig";
import {
  DrillIcon,
  InteractionsIcon,
  AgentsIcon,
  ChatBubbleIcon,
  SupportAgentIcon,
} from "./icons";

// Visual stories for SideNav. Storybook-compatible default export so the
// file works as-is once Storybook is installed. Not rendered by any app
// route — kept here as a dev artifact only.

export default {
  title: "Navigation/SideNav",
  component: SideNav,
};

// Forward-looking config — proves contract supports Coaching unchanged.
const coachingHubConfig = {
  moduleId: "coaching",
  moduleLabel: "Coaching",
  items: [
    { id: "sessions",   label: "Sessions",    Icon: ChatBubbleIcon,   route: "/coaching/sessions" },
    { id: "agents",     label: "Agents",      Icon: AgentsIcon,       route: "/coaching/agents" },
    { id: "calibration",label: "Calibration", Icon: InteractionsIcon, route: "/coaching/calibration" },
    { id: "drills",     label: "Drills",      Icon: DrillIcon,        route: "/coaching/drills", dot: true },
    { id: "support",    label: "Support",     Icon: SupportAgentIcon, route: "/coaching/support" },
  ],
};

export const InsightsHubDefault = () => (
  <SideNav config={insightsHubConfig} activeId="insights" />
);

export const InsightsHubChatActive = () => (
  <SideNav config={insightsHubConfig} activeId="chat" />
);

export const LearningHubDefault = () => (
  <SideNav config={learningHubConfig} activeId="drill" />
);

export const LearningHubAgentsActive = () => (
  <SideNav config={learningHubConfig} activeId="agents" />
);

export const CoachingHubFiveItems = () => (
  <SideNav config={coachingHubConfig} activeId="sessions" />
);

export const STORIES = [
  { id: "insights-default", label: "Insights — default (dot)",  Story: InsightsHubDefault },
  { id: "insights-chat",    label: "Insights — Chat active",    Story: InsightsHubChatActive },
  { id: "learning-default", label: "Learning — Drill active",   Story: LearningHubDefault },
  { id: "learning-agents",  label: "Learning — Agents active",  Story: LearningHubAgentsActive },
  { id: "coaching-five",    label: "Coaching — 5-item config",  Story: CoachingHubFiveItems },
];
