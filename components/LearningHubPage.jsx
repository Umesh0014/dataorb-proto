"use client";

import React from "react";
import { Plus, SlidersHorizontal, Search as SearchIcon } from "lucide-react";
import PageHeader from "./PageHeader";
import TabsRow from "./TabsRow";
import RoleplayLibraryCard from "./RoleplayLibraryCard";
import Banner from "./Banner";
import { ROLEPLAY_LIBRARY, LIBRARY_TABS } from "./mocks/roleplayLibrary";
import { evaluateRoleplayGate, gateCopy } from "./SettingsPage";
import { usePersona } from "./lib/personaContext";

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

// LearningHubPage — Drill / Roleplay Library landing.
//
// Phase 2 (Roleplay Team Lead, Figma "In review - V2") rebuild: replaces
// the prior 2-tab Active/Library layout with the Figma 4-tab structure
// (Active / In Calibration / Draft / Archived). Card grid is 2-up
// (matches Figma) with per-card kebab and a single tag chip. Search +
// filter inputs are presentational — wiring lands in a later branch.
//
// Persona contract (Phase 1 §Q5(b)):
//   • Team Lead — full chrome (CTA, kebab, all four tabs)
//   • Agent    — surfaces stay read-only: hide "+ Roleplay" CTA, hide
//                kebab menus on cards, drop the Draft + Archived tabs
//                (agents don't see authoring states)
//
// Credits & Usage enforcement (spec §4) gates the Team Lead "+ Roleplay"
// CTA:
//   - A1 allowed  → button enabled, existing handler runs unchanged
//   - A2 agentCap → button disabled, danger Banner above tabs
//   - A3 poolMode B → button disabled, danger Banner above tabs
//   - A4 overage → button enabled (informational), warning Banner above
//
// Search filters across title + author + description; the active tab
// scopes which status bucket is queried. Filtering logic is local until
// product fills in the live API.
export default function LearningHubPage({ onOpenDrill, onCreateRoleplay }) {
  const { isAgent } = usePersona();
  const [activeTab, setActiveTab] = React.useState("active");
  const [searchValue, setSearchValue] = React.useState("");

  const gate = evaluateRoleplayGate();
  const isBlocked = gate.kind === "agentCap" || gate.kind === "poolBlocked";
  const copy = gateCopy(gate);

  const handleRoleplayClick = () => {
    if (isBlocked) return;
    onCreateRoleplay?.();
  };

  // Per-tab counts always reflect the full dataset (search-agnostic), so
  // a search miss still shows the tab counts the user expects.
  const countByStatus = React.useMemo(() => {
    return ROLEPLAY_LIBRARY.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {});
  }, []);

  // Agent persona drops the Draft + Archived tabs since they are
  // authoring states. Both also collapse when the active tab gets gated
  // out from beneath the user.
  const visibleTabs = React.useMemo(() => {
    const tabs = isAgent
      ? LIBRARY_TABS.filter((t) => t.id === "active" || t.id === "calibration")
      : LIBRARY_TABS;
    return tabs.map((t) => ({
      ...t,
      label: `${t.label} (${countByStatus[t.id] || 0})`,
    }));
  }, [isAgent, countByStatus]);

  React.useEffect(() => {
    if (!visibleTabs.find((t) => t.id === activeTab)) {
      setActiveTab(visibleTabs[0]?.id || "active");
    }
  }, [visibleTabs, activeTab]);

  const filtered = React.useMemo(() => {
    const q = searchValue.trim().toLowerCase();
    return ROLEPLAY_LIBRARY.filter((p) => p.status === activeTab).filter((p) => {
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q)
        || (p.author || "").toLowerCase().includes(q)
        || (p.description || "").toLowerCase().includes(q)
      );
    });
  }, [activeTab, searchValue]);

  return (
    <div style={lhStyles.column}>
      <PageHeader
        identifier={{
          icon: <DrillAvatarIcon />,
          label: "Drill",
          withDropdown: true,
          onClick: () => {},
        }}
        primaryAction={isAgent ? undefined : {
          label: "Roleplay",
          icon: <Plus size={16} />,
          onClick: handleRoleplayClick,
          disabled: isBlocked,
        }}
        search={{
          value: searchValue,
          onChange: setSearchValue,
          placeholder: "Search by contact reason",
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
      {copy && <Banner tone={copy.tone} heading={copy.heading} body={copy.body} />}
      <TabsRow
        tabs={visibleTabs}
        activeTab={activeTab}
        onTabClick={setActiveTab}
      />

      {filtered.length > 0 ? (
        <div style={lhStyles.grid}>
          {filtered.map((persona) => (
            <RoleplayLibraryCard
              key={persona.id}
              persona={persona}
              showKebab={!isAgent}
              onClick={() => onOpenDrill?.(persona.id)}
              onEdit={() => onOpenDrill?.(persona.id)}
              // Archive / Restore / Delete flows land in the modals branch
              // (Phase 4). Stub them so the kebab still demonstrates the
              // wire-up without throwing.
              // eslint-disable-next-line no-console
              onArchive={(p) => console.log("archive →", p.id)}
              // eslint-disable-next-line no-console
              onRestore={(p) => console.log("restore →", p.id)}
              // eslint-disable-next-line no-console
              onDelete={(p) => console.log("delete →", p.id)}
            />
          ))}
        </div>
      ) : (
        <div style={lhStyles.empty}>
          <SearchIcon size={20} color="var(--color-text-tertiary)" />
          <span style={lhStyles.emptyText}>
            {searchValue
              ? "No personas match your search."
              : "Nothing here yet."}
          </span>
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
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 16,
  },
  empty: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "40px 0",
    color: "var(--color-text-tertiary)",
    fontFamily: "var(--font-sans)",
  },
  emptyText: {
    fontSize: 13,
    fontWeight: 500,
  },
};
