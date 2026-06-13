"use client";

import React from "react";
import { Plus, SlidersHorizontal } from "lucide-react";
import PageHeader from "./PageHeader";
import TabsRow from "./TabsRow";
import DrillCard from "./DrillCard";
import ComingSoon from "./ComingSoon";
import Banner from "./Banner";
import { DRILL_CARDS } from "./mocks/drillCards";
import { evaluateRoleplayGate, gateCopy } from "./SettingsPage";

const DrillAvatarIcon = () => (
  <span
    className="material-symbols-outlined"
    style={{
      fontSize: 18,
      color: "#245BFF",
      fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
    }}
  >
    co_present
  </span>
);

const DRILL_TABS = [
  { id: "active",  label: "Active" },
  { id: "library", label: "Library" },
];

// LearningHubPage — Drill page. Default route when entering Learning Hub.
// Header uses the shared PageHeader (same shape MissionsPage adopts) so
// the Drill chrome stops being a one-off: identifier on the left, the
// primary Roleplay CTA on the right of row 1, and a search input plus
// filter toolbar in row 2. The TabsRow below renders Active/Library
// without its trailing-action slot — the CTA now lives in the header.
//
// Credits & Usage enforcement (spec §4) gates the Roleplay CTA:
//   - A1 allowed  → button enabled, existing handler runs unchanged
//   - A2 agentCap → button disabled, danger Banner above tabs
//   - A3 poolMode B → button disabled, danger Banner above tabs
//   - A4 overage → button enabled (informational), warning Banner above tabs
// The gate is a *pre-start* check (spec §2): when allowed, `onCreateRoleplay`
// fires unmodified; when blocked, the click is short-circuited before the
// existing handler runs. Active sessions are never touched.
//
// Search + filter controls are surfaced per the Figma spec but the
// filtering logic itself is not wired here; the inputs are presentational
// stubs until product fills them in.
export default function LearningHubPage({ onOpenDrill, onCreateRoleplay, isAgent = false }) {
  const [activeTab, setActiveTab] = React.useState("active");
  const [searchValue, setSearchValue] = React.useState("");

  const gate = evaluateRoleplayGate();
  const isBlocked = gate.kind === "agentCap" || gate.kind === "poolBlocked";
  const copy = gateCopy(gate);

  // Agent experience (use, don't edit): no Roleplay create CTA, and only
  // the active drills are surfaced — the Library tab is hidden. Everything
  // else mirrors the Team Leader landing.
  const tabs = isAgent ? [{ id: "active", label: "Active" }] : DRILL_TABS;
  const showLibrary = !isAgent && activeTab === "library";

  // Guard the existing handler. On the allowed path (and on the A4
  // overage informational path), `onCreateRoleplay` runs verbatim. On
  // A2/A3 the button is also disabled, but the guard exists in case a
  // keyboard or A11Y bypass fires the click anyway.
  const handleRoleplayClick = () => {
    if (isBlocked) return;
    onCreateRoleplay?.();
  };

  return (
    <div style={lhStyles.column}>
      <PageHeader
        identifier={{
          icon: <DrillAvatarIcon />,
          label: "Drill",
          withDropdown: true,
          // TODO: identifier dropdown menu — decorative for now.
          onClick: () => {},
        }}
        // Agent view is use-only: no Roleplay create/edit CTA.
        primaryAction={isAgent ? undefined : {
          label: "Roleplay",
          icon: <Plus size={16} />,
          onClick: handleRoleplayClick,
          disabled: isBlocked,
        }}
        search={{
          value: searchValue,
          onChange: setSearchValue,
          placeholder: "Search",
        }}
        toolbar={[
          {
            id: "filters",
            icon: <SlidersHorizontal size={18} />,
            label: "Filters",
            // TODO: wire filters drawer when Drill filter set is defined.
            onClick: () => {},
          },
        ]}
      />
      {!isAgent && copy && <Banner tone={copy.tone} heading={copy.heading} body={copy.body} />}
      <TabsRow
        tabs={tabs}
        activeTab={isAgent ? "active" : activeTab}
        onTabClick={setActiveTab}
      />
      {showLibrary ? (
        <ComingSoon pageName="Library" />
      ) : (
        <div style={lhStyles.grid}>
          {DRILL_CARDS.map((card) => (
            <DrillCard
              key={card.id}
              {...card}
              onViewDetails={() => onOpenDrill?.(card.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const lhStyles = {
  column: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
    width: "100%",
    flex: 1,
    minHeight: 0,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 24,
  },
};
