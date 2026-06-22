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
import CollectionHubPage, { OUR_ITERATIONS, KPI_VERSIONS } from "./CollectionHubPage";
import { ChevronDown } from "lucide-react";

// InsightsHubPage owns filter open state + experience switcher.
// The dark pill at bottom-right toggles between Experience A
// (Contact Center, default) and Experience B (Collection Hub). When on
// Collection Hub, two explorations dropdowns sit beside it — Ajinkya's
// (B2–B6) and Umesh's (V0–V3) — driving the KPI section's `view`.

const EXPERIENCES = ["Contact Center", "Collection Hub"];

export default function InsightsHubPage({ filtersOpen, onToggleFilters }) {
  const [experience, setExperience] = React.useState(EXPERIENCES[0]);
  const [kpiView, setKpiView] = React.useState("b3");
  const onCollection = experience === "Collection Hub";

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
        <CollectionHubPage kpiView={kpiView} />
      )}
      <div style={switcherWrap}>
        {onCollection && (
          <>
            <ExplorationsMenu label="Ajinkya’s explorations" items={OUR_ITERATIONS} value={kpiView} onChange={setKpiView} />
            <ExplorationsMenu label="Umesh’s explorations" items={KPI_VERSIONS} value={kpiView} onChange={setKpiView} />
          </>
        )}
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

// Dark dropdown matching the experience pill; menu opens upward (bar is
// pinned to the bottom). Highlights when the active view is in this group.
function ExplorationsMenu({ label, items, value, onChange }) {
  const [open, setOpen] = React.useState(false);
  const active = items.find((i) => i.id === value);
  return (
    <div style={em.wrap}>
      {open && (
        <div style={em.menu}>
          {items.map((it) => (
            <button key={it.id} type="button" onClick={() => { onChange(it.id); setOpen(false); }}
              style={{ ...em.item, ...(value === it.id ? em.itemOn : null) }}>
              <span style={em.itemLabel}>{it.label}</span>
              <span style={em.itemTitle}>{it.title}</span>
            </button>
          ))}
        </div>
      )}
      <button type="button" style={{ ...em.trigger, ...(active ? em.triggerOn : null) }} onClick={() => setOpen((o) => !o)}>
        <span>{label}{active ? ` · ${active.label}` : ""}</span>
        <ChevronDown size={13} />
      </button>
    </div>
  );
}

InsightsHubPage.FilterPanel = FilterPanel;

const switcherWrap = {
  position: "fixed",
  bottom: 24,
  right: 24,
  zIndex: 1000,
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const em = {
  wrap: { position: "relative" },
  trigger: {
    display: "inline-flex", alignItems: "center", gap: 6, height: 36, padding: "0 12px",
    borderRadius: 999, border: "none", cursor: "pointer", background: "#1F2024", color: "#F5F5F5",
    fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", whiteSpace: "nowrap",
  },
  triggerOn: { background: "#FDE047", color: "#171717" },
  menu: {
    position: "absolute", bottom: "calc(100% + 8px)", right: 0, minWidth: 240, background: "#1F2024",
    borderRadius: 12, padding: 6, boxShadow: "0 12px 32px rgba(0,0,0,0.35)", display: "flex", flexDirection: "column", gap: 2,
  },
  item: {
    display: "flex", flexDirection: "column", gap: 1, padding: "8px 10px", border: "none", background: "none",
    borderRadius: 8, cursor: "pointer", textAlign: "left", fontFamily: "var(--font-sans)",
  },
  itemOn: { background: "#33343A" },
  itemLabel: { fontSize: 12, fontWeight: 800, color: "#F5F5F5" },
  itemTitle: { fontSize: 11, color: "#A3A3A3" },
};
