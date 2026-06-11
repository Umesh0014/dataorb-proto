"use client";

import React from "react";
import HeaderCard from "./HeaderCard";
import TotalInteractionsCard from "./TotalInteractionsCard";
import SkillProficiencyCard from "./SkillProficiencyCard";
import ChannelEngagementCard from "./ChannelEngagementCard";
import PerformanceCard from "./PerformanceCard";
import SentimentCard from "./SentimentCard";
import SalesOutcomesCard from "./SalesOutcomesCard";
import ChurnRiskCard from "./ChurnRiskCard";
import AdherenceCard from "./AdherenceCard";
import ResolutionRateCard from "./ResolutionRateCard";
import ContactReasonCard from "./ContactReasonCard";
import ManualEvalCard from "./ManualEvalCard";
import FilterPanel from "./FilterPanel";
import VersionBar from "./VersionBar";
import CollectionHubPage from "./CollectionHubPage";

// InsightsHubPage owns filter open state + experience switcher.
// The floating bar at bottom-right toggles between Experience A
// (Contact Center, default) and Experience B (Collection Hub).
// Only the content region swaps; SideNav + PageLayout persist.
// Switcher state is React-only — no localStorage / sessionStorage.

// Canonical view list — the source of truth shared between the screen
// renderer below and the floating VersionBar control. Add a new
// experience here and wire it in the render branch + EXPERIENCE_BY_ID.
const VIEWS = [
  { id: "contact-center", label: "Contact Center" },
  { id: "collection-hub", label: "Collection Hub" },
];
const DEFAULT_VIEW_ID = VIEWS[0].id;

export default function InsightsHubPage({ filtersOpen, onToggleFilters }) {
  const [viewId, setViewId] = React.useState(DEFAULT_VIEW_ID);

  return (
    <>
      {viewId === "contact-center" ? (
        <>
          <HeaderCard onFilterToggle={onToggleFilters} />
          <TotalInteractionsCard />
          <SkillProficiencyCard />
          <ChannelEngagementCard />
          <PerformanceCard />
          <SentimentCard />
          <SalesOutcomesCard />
          <ChurnRiskCard />
          <AdherenceCard />
          <ResolutionRateCard />
          <ContactReasonCard />
          <ManualEvalCard />
        </>
      ) : (
        <CollectionHubPage />
      )}
      {/* Floating bar (bottom-right). The baseline-block dropdown IS the
          view switcher: the two views are baseline options, no chips. */}
      <VersionBar
        versions={[]}
        baselineOptions={VIEWS}
        value={{ versionId: viewId, iterationId: null }}
        onChange={({ versionId }) => {
          if (VIEWS.some((v) => v.id === versionId)) setViewId(versionId);
        }}
      />
    </>
  );
}

InsightsHubPage.FilterPanel = FilterPanel;
