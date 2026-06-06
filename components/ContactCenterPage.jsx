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

export default function ContactCenterPage({ onToggleFilters }) {
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
