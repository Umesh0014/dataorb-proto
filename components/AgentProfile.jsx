"use client";

import React from "react";
import PageHeader from "./PageHeader";
import CoachingRecommendations from "./CoachingRecommendations";
import Missions from "./Missions";
import RoleplayCoverage from "./RoleplayCoverage";
import QualityAdherence from "./QualityAdherence";
import { LEARNING_AGENTS } from "./mocks/learningAgents";

// AgentProfile — Learning Hub agent detail page, opened from an Agents row.
// Header is the shared <PageHeader> in its agent-header mode; the body is the
// four metric cards. Reached via app/page.jsx state (agentProfileId).
export default function AgentProfile({ agentId, onBack }) {
  // TODO: replace this mock lookup with a real agent data fetch.
  const agent = LEARNING_AGENTS.find((a) => a.id === agentId) || LEARNING_AGENTS[0];
  const [dateRange, setDateRange] = React.useState("last_7_days");

  React.useEffect(() => {
    if (typeof document === "undefined") return;
    const previous = document.title;
    document.title = `${agent.name} — Agent Profile`;
    return () => {
      document.title = previous;
    };
  }, [agent]);

  return (
    <div style={profileStyles.page}>
      <PageHeader
        agentHeader={{
          agentName: agent.name,
          contextLabel: "Readiness Profile",
          secondaryLink: {
            label: "Production Profile",
            // TODO: real Production Profile route — no URL router in this app yet.
            href: "#",
            external: true,
          },
          // TODO: confirm whether a future Agent Detail page shows this link.
          dateRange,
          onDateRangeChange: (value) => {
            setDateRange(value);
            // TODO: connect the date range to a page-level data filter
          },
          onBack,
        }}
      />

      <CoachingRecommendations />
      <Missions />
      <RoleplayCoverage />
      <QualityAdherence />
    </div>
  );
}

const profileStyles = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
    width: "100%",
    flex: 1,
    minHeight: 0,
  },
};
