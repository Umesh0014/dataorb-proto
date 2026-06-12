"use client";

import React from "react";
import { Plus, SlidersHorizontal } from "lucide-react";
import PageHeader from "./PageHeader";
import TabsRow from "./TabsRow";
import DrillCard from "./DrillCard";
import ComingSoon from "./ComingSoon";
import Banner from "./Banner";
import Modal from "./Modal";
import DarkPillSwitcher from "./DarkPillSwitcher";
import LocaleRibbon from "./LocaleRibbon";
import LocaleCoverageBody from "./LocaleCoverageBody";
import { DRILL_CARDS } from "./mocks/drillCards";
import { evaluateRoleplayGate, gateCopy } from "./SettingsPage";
import {
  LH_LOCALES,
  lhLocale,
  lhDir,
  lhText,
  lhCategory,
  lhDifficulty,
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

// Localization design variants (ticket: GUI multilingual + RTL/Arabic).
// One localization engine, three affordances for choosing language and
// surfacing RTL readiness. Switcher value matches these strings 1:1.
const VARIANT_OPTIONS = ["Inline", "Ribbon", "Coverage"];

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
  const [variant, setVariant] = React.useState("Inline");
  // Variant C stages the locale in the modal and commits it on Apply.
  const [modalOpen, setModalOpen] = React.useState(false);
  const [pendingLocale, setPendingLocale] = React.useState(locale);

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

  // Variant A — language as an inline header dropdown pill (FilterDropdown).
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
  // Variant C — language is a text-labeled header pill (visible affordance,
  // not an icon-only button) that opens the Language & region modal. No
  // `options` → PageHeader renders it as a plain pill that fires onClick.
  const openLocaleModal = () => {
    setPendingLocale(locale);
    setModalOpen(true);
  };
  const coverageLanguagePill = {
    id: "language",
    label: t("language"),
    value: activeLocale.native,
    onClick: openLocaleModal,
  };

  const isInline = variant === "Inline";
  const isCoverage = variant === "Coverage";
  const headerFilters = isInline
    ? [localeFilter]
    : isCoverage
      ? [coverageLanguagePill]
      : undefined;

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
          filters={headerFilters}
          toolbar={[filtersTool]}
        />

        {variant === "Ribbon" && (
          <LocaleRibbon locale={locale} onChange={setLocale} />
        )}

        {copy && <Banner tone={copy.tone} heading={copy.heading} body={copy.body} />}

        <TabsRow tabs={drillTabs} activeTab={activeTab} onTabClick={setActiveTab} />

        {activeTab === "active" ? (
          <div style={lhStyles.grid}>
            {DRILL_CARDS.map((card) => (
              <DrillCard
                key={card.id}
                {...card}
                categoryLabel={lhCategory(locale, card.category)}
                difficultyLabel={lhDifficulty(locale, card.difficulty)}
                ctaLabel={t("viewDetails")}
                onViewDetails={() => onOpenDrill?.(card.id)}
              />
            ))}
          </div>
        ) : (
          <ComingSoon pageName={t("tabLibrary")} />
        )}
      </div>

      <Modal
        open={modalOpen}
        onDismiss={() => setModalOpen(false)}
        title={lhText(pendingLocale, "langRegion")}
        body={<LocaleCoverageBody pending={pendingLocale} onPick={setPendingLocale} />}
        confirmLabel={lhText(pendingLocale, "apply")}
        cancelLabel={lhText(pendingLocale, "cancel")}
        onConfirm={() => {
          setLocale(pendingLocale);
          setModalOpen(false);
        }}
      />

      {/* Floating demo switcher for the three localization variants. Kept
          LTR (meta-tooling) and outside the dir wrapper. */}
      <div style={lhStyles.dock}>
        <span style={lhStyles.dockCaption}>Localization variant</span>
        <DarkPillSwitcher
          ariaLabel="Localization variant"
          value={variant}
          options={VARIANT_OPTIONS}
          onChange={setVariant}
        />
      </div>
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
  dock: {
    position: "fixed",
    bottom: 28,
    right: 28,
    zIndex: 60,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 6,
  },
  dockCaption: {
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "var(--color-text-tertiary)",
  },
};
