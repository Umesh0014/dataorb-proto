"use client";

import React from "react";
import Card from "./Card";
import TabsRow from "./TabsRow";
import ActiveMissionCard from "./ActiveMissionCard";
import ClosedMissions from "./ClosedMissions";

// Active missions seed.
const activeMissions = [
  {
    id: "mission-1",
    pageMissionId: "mission-b",
    title: "Customer support enhancement",
    roleplaysCompleted: 9,
    roleplaysTotal: 12,
    daysLeft: 3,
    focusAreas: [
      { id: "fa-1-1", name: "Active listening", target: 60, actual: 56, isAiInsight: false, gapPct: 40, status: "below" },
      { id: "fa-1-2", name: "Solution clarity", target: 86, actual: 90, isAiInsight: false, gapPct: null, status: "met", drillable: true },
      { id: "fa-1-3", name: "Follow-up quality", target: 72, actual: 80, isAiInsight: false, gapPct: null, status: "met" },
      { id: "fa-1-4", name: "Feedback loops", target: 98, actual: 100, isAiInsight: true, gapPct: null, status: "met" },
    ],
  },
  {
    id: "mission-2",
    pageMissionId: "mission-a",
    title: "Retention save readiness — Q2",
    roleplaysCompleted: 4,
    roleplaysTotal: 15,
    daysLeft: 20,
    focusAreas: [
      { id: "fa-2-1", name: "Refund / extension policy", target: 78, actual: 20, isAiInsight: false, gapPct: 80, status: "below" },
      { id: "fa-2-2", name: "Save / retention offer usage", target: 86, actual: 60, isAiInsight: false, gapPct: 40, status: "below", drillable: true },
      { id: "fa-2-3", name: "Step-by-step guidance", target: 60, actual: 56, isAiInsight: false, gapPct: 40, status: "below" },
      { id: "fa-2-4", name: "Service area awareness", target: 72, actual: 80, isAiInsight: false, gapPct: null, status: "met" },
      { id: "fa-2-5", name: "Empathy & tone", target: 98, actual: 100, isAiInsight: true, gapPct: null, status: "met" },
    ],
  },
];

// Closed missions seed — 30 rows, paginated 8 per page (4 pages).
const closedMissionsMetrics = {
  closedMissionsTotal: 30,
  totalRoleplays: { completed: 13, total: 50 },
  targetsAchieved: { met: 25, total: 30 },
};

const closedMissions = [
  { id: "cm-1", title: "Empathy in communication", target: "met", roleplays: 15, closingDate: "2026-04-30", completionStatus: "closed" },
  { id: "cm-2", title: "Conflict resolution", target: "met", roleplays: 12, closingDate: "2026-04-27", completionStatus: "expired" },
  { id: "cm-3", title: "Persuasive communication", target: "below", roleplays: 12, closingDate: "2026-04-21", completionStatus: "completed" },
  { id: "cm-4", title: "Clarity of speech", target: "met", roleplays: 12, closingDate: "2026-04-02", completionStatus: "completed" },
  { id: "cm-5", title: "Active listening", target: "below", roleplays: 11, closingDate: "2026-04-01", completionStatus: "expired" },
  { id: "cm-6", title: "Empathy in communication", target: "met", roleplays: 10, closingDate: "2026-03-30", completionStatus: "expired" },
  { id: "cm-7", title: "Non-verbal cues", target: "below", roleplays: 10, closingDate: "2026-03-05", completionStatus: "closed" },
  { id: "cm-8", title: "Non-verbal cues", target: "below", roleplays: 10, closingDate: "2026-03-01", completionStatus: "expired" },
  { id: "cm-9", title: "Tone modulation", target: "met", roleplays: 14, closingDate: "2026-02-26", completionStatus: "completed" },
  { id: "cm-10", title: "Closing the sale", target: "met", roleplays: 13, closingDate: "2026-02-22", completionStatus: "closed" },
  { id: "cm-11", title: "Handling escalations", target: "below", roleplays: 9, closingDate: "2026-02-18", completionStatus: "expired" },
  { id: "cm-12", title: "Product knowledge depth", target: "met", roleplays: 12, closingDate: "2026-02-14", completionStatus: "completed" },
  { id: "cm-13", title: "Discovery questioning", target: "met", roleplays: 11, closingDate: "2026-02-09", completionStatus: "closed" },
  { id: "cm-14", title: "Objection reframing", target: "below", roleplays: 8, closingDate: "2026-02-03", completionStatus: "expired" },
  { id: "cm-15", title: "Call control", target: "met", roleplays: 13, closingDate: "2026-01-29", completionStatus: "completed" },
  { id: "cm-16", title: "Summarizing accurately", target: "met", roleplays: 10, closingDate: "2026-01-24", completionStatus: "closed" },
  { id: "cm-17", title: "Setting expectations", target: "below", roleplays: 7, closingDate: "2026-01-20", completionStatus: "expired" },
  { id: "cm-18", title: "Cross-sell timing", target: "met", roleplays: 12, closingDate: "2026-01-15", completionStatus: "completed" },
  { id: "cm-19", title: "Compliance adherence", target: "met", roleplays: 14, closingDate: "2026-01-11", completionStatus: "closed" },
  { id: "cm-20", title: "Rapport building", target: "met", roleplays: 11, closingDate: "2026-01-06", completionStatus: "completed" },
  { id: "cm-21", title: "Note-taking discipline", target: "below", roleplays: 6, closingDate: "2025-12-30", completionStatus: "expired" },
  { id: "cm-22", title: "Warm transfers", target: "met", roleplays: 10, closingDate: "2025-12-22", completionStatus: "closed" },
  { id: "cm-23", title: "Hold etiquette", target: "met", roleplays: 9, closingDate: "2025-12-17", completionStatus: "completed" },
  { id: "cm-24", title: "Upsell positioning", target: "below", roleplays: 8, closingDate: "2025-12-11", completionStatus: "expired" },
  { id: "cm-25", title: "Sentiment recovery", target: "met", roleplays: 13, closingDate: "2025-12-04", completionStatus: "completed" },
  { id: "cm-26", title: "First-contact resolution", target: "met", roleplays: 12, closingDate: "2025-11-28", completionStatus: "closed" },
  { id: "cm-27", title: "Knowledge base usage", target: "below", roleplays: 7, closingDate: "2025-11-21", completionStatus: "expired" },
  { id: "cm-28", title: "Brand voice consistency", target: "met", roleplays: 11, closingDate: "2025-11-14", completionStatus: "completed" },
  { id: "cm-29", title: "Callback commitment", target: "met", roleplays: 10, closingDate: "2025-11-07", completionStatus: "closed" },
  { id: "cm-30", title: "Survey invitation", target: "below", roleplays: 6, closingDate: "2025-10-31", completionStatus: "expired" },
];

const SCOPE_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "closed", label: "Closed" },
];

// Missions — interior of the Agent Profile "Missions" card. A tabs row below
// the title switches between the Active Missions stack (mission sub-cards
// with spider charts) and the Closed Missions metric strip + table.
export default function Missions({ onViewMission }) {
  const [scope, setScope] = React.useState("active");
  // Single-open accordion: the first active mission is expanded on load; one
  // open at a time. null means every mission is collapsed (a valid state —
  // clicking the open mission's header collapses it without opening another).
  const [openMissionId, setOpenMissionId] = React.useState(activeMissions[0]?.id ?? null);

  const handleToggle = (id) => {
    setOpenMissionId((current) => (current === id ? null : id));
  };

  return (
    <Card>
      <div style={mxStyles.header}>
        <div>
          <div style={mxStyles.title}>Missions</div>
          <div style={mxStyles.subtitle}>Evaluate performance across quality metrics.</div>
        </div>
      </div>

      <div style={mxStyles.tabs}>
        <TabsRow
          tabs={SCOPE_OPTIONS.map((o) => ({ id: o.value, label: o.label }))}
          activeTab={scope}
          onTabClick={setScope}
        />
      </div>

      {scope === "active" ? (
        <div style={mxStyles.activeStack}>
          {activeMissions.map((mission) => (
            <ActiveMissionCard
              key={mission.id}
              mission={mission}
              expanded={openMissionId === mission.id}
              onToggle={() => handleToggle(mission.id)}
              onViewMission={onViewMission}
            />
          ))}
        </div>
      ) : (
        <ClosedMissions metrics={closedMissionsMetrics} rows={closedMissions} />
      )}
    </Card>
  );
}

const mxStyles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    lineHeight: 1.4,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: 400,
    color: "var(--text-secondary)",
    lineHeight: 1.4,
  },
  tabs: {
    marginTop: 16,
  },
  activeStack: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    marginTop: 16,
  },
};
