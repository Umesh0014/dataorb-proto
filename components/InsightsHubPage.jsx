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

// InsightsHubPage owns filter open state. The panel itself is hosted by
// PageLayout via the rightPanel prop, which decides dock vs overlay.
// We expose openFilters / panel via context so this component still
// reads as a flat list of cards.
export default function InsightsHubPage({ filtersOpen, onToggleFilters }) {
  return (
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
  );
}

InsightsHubPage.FilterPanel = FilterPanel;
