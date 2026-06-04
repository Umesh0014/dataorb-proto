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
import DarkPillSwitcher from "./DarkPillSwitcher";
import CollectionHubPage from "./CollectionHubPage";

// InsightsHubPage owns filter open state + experience switcher.
// The dark pill at bottom-right toggles between Experience A
// (Contact Center, default) and Experience B (Collection Hub).
// Only the content region swaps; SideNav + PageLayout persist.
// Switcher state is React-only — no localStorage / sessionStorage.

const EXPERIENCES = ["Contact Center", "Collection Hub"];

export default function InsightsHubPage({ filtersOpen, onToggleFilters }) {
  const [experience, setExperience] = React.useState(EXPERIENCES[0]);

  return (
    <>
      {experience === "Contact Center" ? (
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
      <div style={switcherWrap}>
        <DarkPillSwitcher
          ariaLabel="Experience switcher"
          value={experience}
          options={EXPERIENCES}
          onChange={setExperience}
        />
      </div>
    </>
  );
}

InsightsHubPage.FilterPanel = FilterPanel;

const switcherWrap = {
  position: "fixed",
  bottom: 24,
  right: 24,
  zIndex: 1000,
};
