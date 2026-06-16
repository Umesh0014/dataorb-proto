"use client";

import React from "react";
import { Plus, SlidersHorizontal } from "lucide-react";
import PageHeader from "./PageHeader";
import TabsRow from "./TabsRow";
import DrillCard from "./DrillCard";
import ComingSoon from "./ComingSoon";
import Banner from "./Banner";
import VersionBar from "./VersionBar";
import { GuidedWorkflowListing } from "./GuidedWorkflowAuthoringPage";
import { DRILL_CARDS } from "./mocks/drillCards";
import { evaluateRoleplayGate, gateCopy } from "./SettingsPage";
import {
  LH_LOCALES,
  lhLocale,
  lhDir,
  lhText,
  lhCategory,
  lhDifficulty,
  lhDrillContent,
} from "./learningHubLocale";

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

// Team Leader ⇄ Agent View switch — driven through the shared VersionBar
// baseline dropdown, identical to the Missions persona switch
// (MissionsLandingShell's PERSONA_BASELINE). Same component, same labels,
// same tokens — the View toggle reads as a first-class view control.
const DRILL_PERSONA_BASELINE = [
  { id: "tl",    label: "Team Leader" },
  { id: "agent", label: "Agent" },
];

// LearningHubPage — Drill page + the localization layer. The page title,
// primary CTA, search, Filters, tabs, and the taxonomy chips (category +
// difficulty) all localize to the selected language; Arabic flips the
// whole app to RTL via the document-level `dir` (set by the router from
// this same locale). The raw scenario body inside each DrillCard stays in
// its source language (handled in DrillCard with dir="auto") —
// eval/transcript content is never translated, per brief.
//
// `locale` is owned by the app root (so the choice is global — the rail,
// every page, and reading direction flip together) and threaded in as a
// controlled prop; `onLocaleChange` lifts a new selection back up.
//
// Credits & Usage enforcement (spec §4) still gates the Roleplay CTA, and
// the existing handlers (onCreateRoleplay / onOpenDrill) are untouched —
// only presentation is localized.
//
// Persona: the Agent view (isAgent) is use-only — no Roleplay create CTA,
// the tab row is dropped, and only active drills are surfaced.
export default function LearningHubPage({
  onOpenDrill,
  onCreateRoleplay,
  onOpenWorkflow,
  locale = "en",
  onLocaleChange,
  isAgent = false,
  onPersonaChange,
}) {
  const [activeTab, setActiveTab] = React.useState("active");
  const [searchValue, setSearchValue] = React.useState("");

  const setLocale = (next) => onLocaleChange?.(next);
  const dir = lhDir(locale);
  const t = (key) => lhText(locale, key);
  const activeLocale = lhLocale(locale);

  const gate = evaluateRoleplayGate();
  const isBlocked = gate.kind === "agentCap" || gate.kind === "poolBlocked";
  const copy = gateCopy(gate);

  // Agent experience (use, don't edit): no Roleplay create CTA, only the
  // active drills are surfaced — the tab row is dropped entirely (Library
  // hidden, an "Active"-only row is redundant). Everything else mirrors the
  // Team Leader landing.
  const showLibrary = !isAgent && activeTab === "library";

  // Guard the existing handler. On the allowed path (and on the A4
  // overage informational path), `onCreateRoleplay` runs verbatim. On
  // A2/A3 the button is also disabled, but the guard exists in case a
  // keyboard or A11Y bypass fires the click anyway.
  const handleRoleplayClick = () => {
    if (isBlocked) return;
    onCreateRoleplay?.();
  };

  const drillTabs = [
    { id: "active", label: t("tabActive") },
    { id: "library", label: t("tabLibrary") },
    { id: "workflows", label: "Guided Workflows" },
  ];

  // Language as an inline header dropdown pill — native name + locale list,
  // lifting the new selection to the app root.
  const localeFilter = {
    id: "language",
    label: t("language"),
    value: activeLocale.native,
    options: LH_LOCALES.map((l) => ({ label: `${l.native} · ${l.label}`, value: l.native })),
    onSelect: (native) => {
      const next = LH_LOCALES.find((l) => l.native === native);
      if (next) setLocale(next.id);
    },
  };

  const filtersTool = {
    id: "filters",
    icon: <SlidersHorizontal size={18} />,
    label: t("filters"),
    onClick: () => {},
  };

  return (
    <>
    <div style={lhStyles.column} dir={dir} lang={locale}>
        <PageHeader
          identifier={{
            icon: <DrillAvatarIcon />,
            label: t("pageTitle"),
            withDropdown: true,
            onClick: () => {},
          }}
          // Agent view is use-only: no Roleplay create/edit CTA.
          primaryAction={isAgent ? undefined : {
            label: t("roleplay"),
            icon: <Plus size={16} />,
            onClick: handleRoleplayClick,
            disabled: isBlocked,
          }}
          search={{
            value: searchValue,
            onChange: setSearchValue,
            placeholder: t("search"),
          }}
          filters={[localeFilter]}
          toolbar={[filtersTool]}
        />

        {!isAgent && copy && <Banner tone={copy.tone} heading={copy.heading} body={copy.body} />}

        {/* Agent sees only active drills — drop the tab row entirely. */}
        {!isAgent && (
          <TabsRow tabs={drillTabs} activeTab={activeTab} onTabClick={setActiveTab} />
        )}

        {!isAgent && activeTab === "workflows" ? (
          <GuidedWorkflowListing onOpenWorkflow={onOpenWorkflow} />
        ) : showLibrary ? (
          <ComingSoon pageName={t("tabLibrary")} />
        ) : (
          <div style={lhStyles.grid}>
            {DRILL_CARDS.map((card) => {
              // Gate 2: when Arabic is active the scenario copy is shown in
              // Arabic too (not just the chrome). Falls back to the source
              // string for locales without an override.
              const content = lhDrillContent(locale, card.id);
              return (
                <DrillCard
                  key={card.id}
                  {...card}
                  title={content?.title ?? card.title}
                  description={content?.description ?? card.description}
                  categoryLabel={lhCategory(locale, card.category)}
                  difficultyLabel={lhDifficulty(locale, card.difficulty)}
                  ctaLabel={t("viewDetails")}
                  onViewDetails={() => onOpenDrill?.(card.id)}
                />
              );
            })}
          </div>
        )}
    </div>
    {/* Team Leader ⇄ Agent View switch — shared VersionBar, mounted like
        Missions' persona switch (same component/states/tokens). */}
    <VersionBar
      versions={[]}
      baselineOptions={DRILL_PERSONA_BASELINE}
      value={{ versionId: isAgent ? "agent" : "tl", iterationId: null }}
      onChange={({ versionId }) => onPersonaChange?.(versionId)}
    />
    </>
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
