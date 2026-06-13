"use client";

import React from "react";
import PageHeader from "./PageHeader";
import PerformanceScore from "./PerformanceScore";
import AgentLearningImpact from "./AgentLearningImpact";
import MilestoneSideRail from "./MilestoneSideRail";
import CoachingRecommendations from "./CoachingRecommendations";
import Missions from "./Missions";
import RoleplayCoverage from "./RoleplayCoverage";
import QualityAdherence from "./QualityAdherence";
import AssignModal from "./AssignModal";
import Toast from "./Toast";
import { LEARNING_AGENTS } from "./mocks/learningAgents";

// Auto-dismiss delay for the post-assignment toast.
const TOAST_MS = 3200;

// AgentProfile — Learning Hub agent detail page, opened from an Agents row.
// Header is the shared <PageHeader> in its agent-header mode; the body is the
// Next Best Actions rail followed by the four metric cards. The page owns the
// Assign confirm modal + toast so the Tier 1 rail and the Tier 2 inline
// prompts inside the sections can all trigger them.
export default function AgentProfile({ agentId, onBack, onViewMission }) {
  // TODO: replace this mock lookup with a real agent data fetch.
  const agent = LEARNING_AGENTS.find((a) => a.id === agentId) || LEARNING_AGENTS[0];
  const [dateRange, setDateRange] = React.useState("last_7_days");
  const [scoreMilestone, setScoreMilestone] = React.useState("m1");
  const [assignAsset, setAssignAsset] = React.useState(null);
  const [toastShown, setToastShown] = React.useState(false);

  React.useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const previous = document.title;
    document.title = `${agent.name} — Agent Profile`;
    return () => {
      document.title = previous;
    };
  }, [agent]);

  React.useEffect(() => {
    if (!toastShown) return undefined;
    const timer = window.setTimeout(() => setToastShown(false), TOAST_MS);
    return () => window.clearTimeout(timer);
  }, [toastShown]);

  const confirmAssign = () => {
    setAssignAsset(null);
    setToastShown(true);
  };

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

      <div style={profileStyles.scoreSection}>
        <PerformanceScore
          onAssign={setAssignAsset}
          dateRange={dateRange}
          milestone={scoreMilestone}
        />
        <div style={profileStyles.railMount}>
          <div style={profileStyles.railSticky}>
            <MilestoneSideRail value={scoreMilestone} onChange={setScoreMilestone} />
          </div>
        </div>
      </div>
      <AgentLearningImpact agent={agent} />
      <Missions onViewMission={onViewMission} />
      <CoachingRecommendations onNbaAssign={setAssignAsset} />
      <RoleplayCoverage onNbaAssign={setAssignAsset} />
      <QualityAdherence onNbaAssign={setAssignAsset} />

      <AssignModal
        asset={assignAsset}
        onConfirm={confirmAssign}
        onClose={() => setAssignAsset(null)}
      />
      {toastShown && (
        <Toast
          tone="success"
          message="Assigned to Aaliyah Tillman."
          onDismiss={() => setToastShown(false)}
        />
      )}
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
  // Performance score sits at full page width; the milestone side rail is
  // absolutely positioned out into the right gutter so it never narrows
  // the card. The rail tracks the viewport centre, bounded by card height.
  scoreSection: {
    position: "relative",
    width: "100%",
  },
  railMount: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "100%",
    marginLeft: 12,
    width: 48,
    zIndex: 30,
  },
  railSticky: {
    position: "sticky",
    top: "50vh",
    transform: "translateY(-50%)",
  },
};
