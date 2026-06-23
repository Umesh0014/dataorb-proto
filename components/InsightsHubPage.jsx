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
import CollectionHubPage, { OUR_ITERATIONS, OUR_DISCARDED, KPI_VERSIONS } from "./CollectionHubPage";
import { ChevronDown } from "lucide-react";

// InsightsHubPage owns filter open state + experience switcher.
// The dark pill at bottom-right toggles between Experience A
// (Contact Center, default) and Experience B (Collection Hub). When on
// Collection Hub, two explorations dropdowns sit beside it — Ajinkya's
// (B2–B6) and Umesh's (V0–V3) — driving the KPI section's `view`.

// Default iteration per exploration group.
const GROUP_DEFAULT = { ajinkya: "b7", umesh: "v0" };

export default function InsightsHubPage({ filtersOpen, onToggleFilters }) {
  const [experience, setExperience] = React.useState("Contact Center");
  const [group, setGroup] = React.useState("ajinkya");
  const [kpiView, setKpiView] = React.useState("b7");
  const items = group === "umesh" ? KPI_VERSIONS : OUR_ITERATIONS;
  const discarded = group === "umesh" ? [] : OUR_DISCARDED;

  const selectGroup = (g) => {
    setGroup(g);
    setExperience("Collection Hub");
    setKpiView(GROUP_DEFAULT[g]);
  };

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
        <CollectionHubPage kpiView={kpiView} onKpiView={setKpiView} kpiItems={items} kpiDiscarded={discarded} />
      )}
      <div style={switcherWrap}>
        <ExperienceBar
          experience={experience}
          group={group}
          onContactCenter={() => setExperience("Contact Center")}
          onSelectGroup={selectGroup}
        />
      </div>
    </>
  );
}

// Bottom toggle: a Contact Center pill + a Collection Hub dropdown whose menu
// lists the two exploration groups. The active group's iterations show in the
// vertical rail inside the KPI section.
function ExperienceBar({ experience, group, onContactCenter, onSelectGroup }) {
  const [open, setOpen] = React.useState(false);
  const onCC = experience === "Contact Center";
  const groupLabel = group === "umesh" ? "Umesh" : "Ajinkya";
  return (
    <div style={eb.bar}>
      <button type="button" style={{ ...eb.pill, ...(onCC ? eb.pillOn : null) }} onClick={onContactCenter}>
        Contact Center
      </button>
      <div style={eb.ddWrap}>
        {open && (
          <div style={eb.menu}>
            <button type="button" style={{ ...eb.item, ...(group === "ajinkya" && !onCC ? eb.itemOn : null) }} onClick={() => { onSelectGroup("ajinkya"); setOpen(false); }}>
              Ajinkya’s exploration
            </button>
            <button type="button" style={{ ...eb.item, ...(group === "umesh" && !onCC ? eb.itemOn : null) }} onClick={() => { onSelectGroup("umesh"); setOpen(false); }}>
              Umesh’s exploration
            </button>
          </div>
        )}
        <button type="button" style={{ ...eb.pill, ...(!onCC ? eb.pillOn : null) }} onClick={() => setOpen((o) => !o)}>
          Collection Hub{!onCC ? ` · ${groupLabel}` : ""}
          <ChevronDown size={13} style={{ marginLeft: 4 }} />
        </button>
      </div>
    </div>
  );
}

InsightsHubPage.FilterPanel = FilterPanel;

const switcherWrap = { position: "fixed", bottom: 24, right: 24, zIndex: 1000 };

const eb = {
  bar: { display: "inline-flex", alignItems: "center", gap: 4, background: "#1F2024", borderRadius: 10, padding: 4, boxShadow: "0 8px 24px rgba(0,0,0,0.28)" },
  pill: {
    display: "inline-flex", alignItems: "center", height: 34, padding: "0 16px", borderRadius: 6, border: "none",
    cursor: "pointer", background: "transparent", color: "#D4D4D8",
    fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", whiteSpace: "nowrap",
  },
  pillOn: { background: "#FDE047", color: "#171717" },
  ddWrap: { position: "relative" },
  menu: {
    position: "absolute", bottom: "calc(100% + 10px)", right: 0, minWidth: 220, background: "#1F2024",
    borderRadius: 12, padding: 6, boxShadow: "0 12px 32px rgba(0,0,0,0.4)", display: "flex", flexDirection: "column", gap: 2,
  },
  item: {
    padding: "9px 12px", border: "none", background: "none", borderRadius: 8, cursor: "pointer", textAlign: "left",
    fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: "#F5F5F5",
  },
  itemOn: { background: "#33343A" },
};
