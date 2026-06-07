"use client";

import React from "react";
import ContactCenterPage from "./ContactCenterPage";
import CollectionHubPage from "./CollectionHubPage";
import FilterPanel from "./FilterPanel";
import DarkPillSwitcher from "./DarkPillSwitcher";

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
        <ContactCenterPage onToggleFilters={onToggleFilters} />
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
