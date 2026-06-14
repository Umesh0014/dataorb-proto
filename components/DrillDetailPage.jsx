"use client";

import React from "react";
import {
  ArrowLeft,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import StatCard from "./StatCard";
import TabsRow from "./TabsRow";
import Toggle from "./Toggle";
import ComingSoon from "./ComingSoon";
import { DRILL_CARDS } from "./mocks/drillCards";
import { lhDetail, lhDrillContent, lhCategory, lhDifficulty } from "./learningHubLocale";

const DIFFICULTY_PALETTE = {
  Simple:   { bg: "var(--color-success-bg)",  text: "var(--color-success-text)" },
  Moderate: { bg: "var(--color-warning-bg)",  text: "var(--color-warning-text)" },
  Complex:  { bg: "var(--color-error-bg)",    text: "var(--color-error-text)"   },
};

// DrillDetailPage — detail view for one Drill scenario.
// Composed from existing primitives: Card, TabsRow, Toggle, ComingSoon.
// All visual decisions inherit from existing tokens (no new colors,
// fonts, shadows, or component primitives).
//
// Localization (ticket: GUI multilingual + RTL/Arabic): static chrome
// localizes via lhDetail; the scenario content (brief, persona, situation,
// goals, resolution) localizes via lhDrillContent for Arabic and otherwise
// falls back to the source mock. Customer name stays a proper noun
// (dir="auto"); the page mirrors under the document-level RTL.
export default function DrillDetailPage({ cardId, onBack, locale = "en" }) {
  const card = DRILL_CARDS.find((c) => c.id === cardId);
  const d = (key) => lhDetail(locale, key);
  const content = lhDrillContent(locale, cardId);

  React.useEffect(() => {
    if (typeof document !== "undefined") {
      const previous = document.title;
      document.title = card ? `${card.customer} — ${d("detailTitle")}` : d("detailTitle");
      return () => {
        document.title = previous;
      };
    }
  }, [card, locale]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!card) return <ComingSoon pageName={d("detailTitle")} />;

  return (
    <div style={dpStyles.page}>
      <DetailHeader card={card} onBack={onBack} locale={locale} d={d} />
      <StatRow card={card} locale={locale} d={d} />
      <AgentBriefSection card={card} content={content} d={d} />
      <PersonaDetailsSection card={card} content={content} d={d} />
    </div>
  );
}

// ---------- Header ----------

function DetailHeader({ card, onBack, locale, d }) {
  const palette = DIFFICULTY_PALETTE[card.difficulty] || DIFFICULTY_PALETTE.Simple;
  return (
    <Card>
      <div style={dpStyles.headerRow}>
        <Button
          variant="icon"
          aria-label={d("back")}
          onClick={onBack}
        >
          <ArrowLeft size={20} />
        </Button>
        <span style={dpStyles.headerEmoji} aria-hidden="true">{card.mood}</span>
        <span style={dpStyles.headerName} dir="auto">{card.customer}</span>
        <span style={dpStyles.headerBullet}>•</span>
        <span
          style={{
            ...dpStyles.chip,
            background: palette.bg,
            color: palette.text,
          }}
        >
          {lhDifficulty(locale, card.difficulty)}
        </span>

        <div style={{ flex: 1 }} />

        <div style={dpStyles.activeRow}>
          <Toggle defaultEnabled ariaLabel={d("active")} />
          <span style={dpStyles.activeLabel}>{d("active")}</span>
        </div>
      </div>
    </Card>
  );
}

// ---------- Stat row ----------

function StatRow({ card, locale, d }) {
  const stats = [
    {
      icon: "mic",
      label: d("totalInteractions"),
      value: String(card.totalInteractions),
      affordance: "chevron",
      onAction: () => console.log("Drill detail: total interactions chevron — out of scope"),
    },
    {
      icon: "schedule",
      label: d("averageDuration"),
      value: card.averageDuration,
    },
    {
      icon: "list_alt",
      label: d("roleplayCategory"),
      value: lhCategory(locale, card.category),
    },
    {
      icon: "folder",
      label: d("source"),
      value: card.source,
      affordance: "external",
      onAction: () => console.log("Drill detail: open source — out of scope"),
    },
  ];

  return (
    <div style={dpStyles.statRow}>
      {stats.map((s) => (
        <StatCard
          key={s.label}
          icon={s.icon}
          label={s.label}
          value={s.value}
          trailing={
            s.affordance === "chevron"
              ? <ChevronRight size={18} />
              : s.affordance === "external"
              ? <ExternalLink size={16} />
              : null
          }
          onAction={s.onAction}
        />
      ))}
    </div>
  );
}

// ---------- Agent Brief ----------

function AgentBriefSection({ card, content, d }) {
  return (
    <Card>
      <SectionHeader icon="headset_mic" title={d("agentBrief")} />
      <p style={dpStyles.body} dir="auto">{content?.agentBrief ?? card.agentBrief}</p>
      <div style={dpStyles.subCardRow}>
        <SubCard label={d("contactReason")} value={content?.contactReason ?? card.contactReason} />
        <SubCard label={d("maxDuration")} value={content?.maxAllowedDuration ?? card.maxAllowedDuration} />
        <SubCard label={d("languageField")} value={content?.language ?? card.language} />
      </div>
    </Card>
  );
}

function SubCard({ label, value }) {
  return (
    <Card tone="muted" padX={16} padY={12} style={dpStyles.subCardLayout}>
      <div style={dpStyles.subCardLabel}>{label}</div>
      <div style={dpStyles.subCardValue} dir="auto">{value}</div>
    </Card>
  );
}

// ---------- Persona Details ----------

function PersonaDetailsSection({ card, content, d }) {
  const [tab, setTab] = React.useState("current");
  const tabs = [
    { id: "current", label: d("tabCurrent") },
    { id: "goals",   label: d("tabGoals") },
  ];
  const currentSituation = content?.currentSituation ?? card.currentSituation;
  const goals = content?.goals ?? card.goals;
  const resolution = content?.resolution ?? card.resolution;
  const list = tab === "current" ? currentSituation : goals;

  return (
    <Card>
      <div style={dpStyles.personaTitleRow}>
        <span className="material-symbols-outlined" style={dpStyles.sectionIcon}>lock</span>
        <span style={dpStyles.sectionTitle}>{d("personaDetails")}</span>
        <span style={dpStyles.personaAnnotation}>{d("forManagers")}</span>
      </div>

      <div style={dpStyles.subSectionGap}>
        <div style={dpStyles.subHeaderRow}>
          <span className="material-symbols-outlined" style={dpStyles.subHeaderIcon}>person</span>
          <span style={dpStyles.subHeaderTitle}>{d("characterOverview")}</span>
        </div>
        <p style={dpStyles.body} dir="auto">{content?.characterOverview ?? card.characterOverview}</p>
      </div>

      <div style={dpStyles.tabBlock}>
        <TabsRow tabs={tabs} activeTab={tab} onTabClick={setTab} />
        <Card tone="muted" padX={24} padY={16} style={dpStyles.bulletPanel}>
          <ul style={dpStyles.bulletList}>
            {list.map((item, i) => (
              <li key={i} style={dpStyles.bulletItem} dir="auto">{item}</li>
            ))}
          </ul>
        </Card>
      </div>

      <div style={dpStyles.subSectionGap}>
        <div style={dpStyles.subHeaderRow}>
          <span className="material-symbols-outlined" style={dpStyles.subHeaderIcon}>check_circle</span>
          <span style={dpStyles.subHeaderTitle}>{d("resolution")}</span>
        </div>
        <div style={dpStyles.resolutionRow}>
          <ResolutionColumn emoji="🤙" label={d("resIdeal")} body={resolution.ideal} />
          <ResolutionColumn emoji="👍" label={d("resMinimum")} body={resolution.minimum} />
          <ResolutionColumn emoji="🤝" label={d("resCompromised")} body={resolution.compromised} />
        </div>
      </div>
    </Card>
  );
}

function ResolutionColumn({ emoji, label, body }) {
  return (
    <div style={dpStyles.resolutionCol}>
      <div style={dpStyles.resolutionHead}>
        <span style={dpStyles.resolutionEmoji} aria-hidden="true">{emoji}</span>
        <span style={dpStyles.resolutionLabel}>{label}</span>
      </div>
      <p style={dpStyles.body} dir="auto">{body}</p>
    </div>
  );
}

// ---------- Shared section header ----------

function SectionHeader({ icon, title }) {
  return (
    <div style={dpStyles.sectionHeader}>
      <span className="material-symbols-outlined" style={dpStyles.sectionIcon}>{icon}</span>
      <span style={dpStyles.sectionTitle}>{title}</span>
    </div>
  );
}

// ---------- Styles ----------

const dpStyles = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
    width: "100%",
    flex: 1,
    minHeight: 0,
  },

  // Header
  headerRow: { display: "flex", alignItems: "center", gap: 12 },
  headerEmoji: { fontSize: 22, lineHeight: 1 },
  headerName: {
    fontFamily: '"Mulish", sans-serif', fontSize: 18, fontWeight: 700,
    color: "var(--color-text-deep)", lineHeight: 1.3,
  },
  headerBullet: { color: "var(--color-text-tertiary)", fontSize: 14 },
  chip: {
    display: "inline-flex", alignItems: "center", height: 24,
    padding: "3px 10px", borderRadius: 999,
    fontFamily: '"Mulish", sans-serif', fontSize: 12, fontWeight: 500, lineHeight: 1.4,
  },
  activeRow: { display: "flex", alignItems: "center", gap: 8 },
  activeLabel: {
    fontFamily: '"Mulish", sans-serif', fontSize: 14, fontWeight: 500,
    color: "var(--color-text-medium)",
  },

  // Stat row
  statRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 16,
  },

  // Section blocks
  sectionHeader: { display: "flex", alignItems: "center", gap: 8, marginBottom: 12 },
  sectionIcon: {
    fontSize: 20, color: "var(--color-text-deep)",
    fontVariationSettings: "'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24",
  },
  sectionTitle: {
    fontFamily: '"Mulish", sans-serif', fontSize: 16, fontWeight: 700,
    color: "var(--color-text-deep)", lineHeight: 1.4,
  },
  body: {
    fontFamily: '"Mulish", sans-serif', fontSize: 14, fontWeight: 400,
    color: "var(--color-text-medium)", lineHeight: 1.6, margin: 0,
  },

  // Agent Brief sub cards
  subCardRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 16,
    marginTop: 16,
  },
  subCardLayout: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  subCardLabel: {
    fontFamily: '"Mulish", sans-serif', fontSize: 13, fontWeight: 600,
    color: "var(--color-text-medium)", lineHeight: 1.4,
  },
  subCardValue: {
    fontFamily: '"Mulish", sans-serif', fontSize: 13, fontWeight: 400,
    color: "var(--color-text-tertiary)", lineHeight: 1.5,
  },

  // Persona Details
  personaTitleRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 16 },
  personaAnnotation: {
    fontFamily: '"Mulish", sans-serif', fontSize: 13, fontWeight: 500,
    color: "var(--color-icon-tertiary-fg)", marginInlineStart: 4,
  },
  subSectionGap: { display: "flex", flexDirection: "column", gap: 8, marginTop: 16 },
  subHeaderRow: { display: "flex", alignItems: "center", gap: 8 },
  subHeaderIcon: {
    fontSize: 18, color: "var(--color-text-deep)",
    fontVariationSettings: "'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24",
  },
  subHeaderTitle: {
    fontFamily: '"Mulish", sans-serif', fontSize: 15, fontWeight: 700,
    color: "var(--color-text-deep)", lineHeight: 1.4,
  },

  tabBlock: { display: "flex", flexDirection: "column", marginTop: 16 },
  bulletPanel: { marginTop: 16 },
  bulletList: {
    margin: 0,
    paddingInlineStart: 20,
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  bulletItem: {
    fontFamily: '"Mulish", sans-serif', fontSize: 14, fontWeight: 400,
    color: "var(--color-text-medium)", lineHeight: 1.55,
  },

  // Resolution
  resolutionRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 16,
    marginTop: 8,
  },
  resolutionCol: { display: "flex", flexDirection: "column", gap: 8 },
  resolutionHead: { display: "flex", alignItems: "center", gap: 8 },
  resolutionEmoji: { fontSize: 18, lineHeight: 1 },
  resolutionLabel: {
    fontFamily: '"Mulish", sans-serif', fontSize: 14, fontWeight: 700,
    color: "var(--color-text-deep)",
  },
};
