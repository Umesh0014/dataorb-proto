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
export default function LearningHubPage({
  onOpenDrill,
  onCreateRoleplay,
  locale = "en",
  onLocaleChange,
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

  const handleRoleplayClick = () => {
    if (isBlocked) return;
    onCreateRoleplay?.();
  };

  const drillTabs = [
    { id: "active", label: t("tabActive") },
    { id: "library", label: t("tabLibrary") },
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
    <div style={lhStyles.column} dir={dir} lang={locale}>
        <PageHeader
          identifier={{
            icon: <DrillAvatarIcon />,
            label: t("pageTitle"),
            withDropdown: true,
            onClick: () => {},
          }}
          primaryAction={{
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

        {copy && <Banner tone={copy.tone} heading={copy.heading} body={copy.body} />}

        <TabsRow tabs={drillTabs} activeTab={activeTab} onTabClick={setActiveTab} />

        {activeTab === "active" ? (
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
        ) : (
          <ComingSoon pageName={t("tabLibrary")} />
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
