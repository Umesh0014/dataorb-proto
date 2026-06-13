"use client";

import React from "react";
import {
  ArrowLeft,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import StatCard from "./StatCard";
import TabsRow from "./TabsRow";
import Toggle from "./Toggle";
import ComingSoon from "./ComingSoon";
import { DRILL_CARDS } from "./mocks/drillCards";

const DIFFICULTY_PALETTE = {
  Simple:   { bg: "var(--color-success-bg)",  text: "var(--color-success-text)" },
  Moderate: { bg: "var(--color-warning-bg)",  text: "var(--color-warning-text)" },
  Complex:  { bg: "var(--color-error-bg)",    text: "var(--color-error-text)"   },
};

// DrillDetailPage — detail view for one Drill scenario.
// Composed from existing primitives: Card, TabsRow, Toggle, ComingSoon.
// All visual decisions inherit from existing tokens (no new colors,
// fonts, shadows, or component primitives).
export default function DrillDetailPage({ cardId, onBack, onStartGuided, isAgent }) {
  const card = DRILL_CARDS.find((c) => c.id === cardId);

  React.useEffect(() => {
    if (typeof document !== "undefined") {
      const previous = document.title;
      document.title = card ? `${card.customer} — Drill Details` : "Drill Details";
      return () => {
        document.title = previous;
      };
    }
  }, [card]);

  if (!card) return <ComingSoon pageName="Drill Details" />;

  return (
    <div style={dpStyles.page}>
      <DetailHeader card={card} onBack={onBack} onStartGuided={onStartGuided} isAgent={isAgent} />
      <StatRow card={card} />
      <AgentBriefSection card={card} />
      {/* Persona Details are manager-only — hidden in the Agent (use,
          don't edit) view. */}
      {!isAgent && <PersonaDetailsSection card={card} />}
    </div>
  );
}

// ---------- Header ----------

function DetailHeader({ card, onBack, onStartGuided, isAgent }) {
  const palette = DIFFICULTY_PALETTE[card.difficulty] || DIFFICULTY_PALETTE.Simple;
  return (
    <Card>
      <div style={dpStyles.headerRow}>
        <Button
          variant="icon"
          aria-label="Back to Drill"
          onClick={onBack}
        >
          <ArrowLeft size={20} />
        </Button>
        <span style={dpStyles.headerEmoji} aria-hidden="true">{card.mood}</span>
        <span style={dpStyles.headerName}>{card.customer}</span>
        <span style={dpStyles.headerBullet}>•</span>
        <span
          style={{
            ...dpStyles.chip,
            background: palette.bg,
            color: palette.text,
          }}
        >
          {card.difficulty}
        </span>

        <div style={{ flex: 1 }} />

        {onStartGuided && (
          <Button
            variant="primary"
            leadingIcon={<ShieldCheck size={16} />}
            uppercase={false}
            onClick={onStartGuided}
            style={{ height: 36, minWidth: 0, paddingInline: 18 }}
          >
            Run drill
          </Button>
        )}

        {/* The Active toggle is a management control — only the Team Leader
            view can edit it; the Agent view is use-only. */}
        {!isAgent && (
          <div style={dpStyles.activeRow}>
            <Toggle defaultEnabled ariaLabel="Toggle scenario active" />
            <span style={dpStyles.activeLabel}>Active</span>
          </div>
        )}
      </div>
    </Card>
  );
}

// ---------- Stat row ----------

function StatRow({ card }) {
  const stats = [
    {
      icon: "mic",
      label: "Total Interactions",
      value: String(card.totalInteractions),
      affordance: "chevron",
      onAction: () => console.log("Drill detail: total interactions chevron — out of scope"),
    },
    {
      icon: "schedule",
      label: "Average Duration",
      value: card.averageDuration,
    },
    {
      icon: "list_alt",
      label: "Roleplay Category",
      value: card.category,
    },
    {
      icon: "folder",
      label: "Source",
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

function AgentBriefSection({ card }) {
  return (
    <Card>
      <SectionHeader icon="headset_mic" title="Agent Brief" />
      <p style={dpStyles.body}>{card.agentBrief}</p>
      <div style={dpStyles.subCardRow}>
        <SubCard label="Contact Reason" value={card.contactReason} />
        <SubCard label="Max Allowed Duration" value={card.maxAllowedDuration} />
        <SubCard label="Language" value={card.language} />
      </div>
    </Card>
  );
}

function SubCard({ label, value }) {
  return (
    <Card tone="muted" padX={16} padY={12} style={dpStyles.subCardLayout}>
      <div style={dpStyles.subCardLabel}>{label}</div>
      <div style={dpStyles.subCardValue}>{value}</div>
    </Card>
  );
}

// ---------- Persona Details ----------

function PersonaDetailsSection({ card }) {
  const [tab, setTab] = React.useState("current");
  const tabs = [
    { id: "current", label: "Current situation" },
    { id: "goals",   label: "Goals" },
  ];
  const list = tab === "current" ? card.currentSituation : card.goals;

  return (
    <Card>
      <div style={dpStyles.personaTitleRow}>
        <span className="material-symbols-outlined" style={dpStyles.sectionIcon}>lock</span>
        <span style={dpStyles.sectionTitle}>Persona Details</span>
        <span style={dpStyles.personaAnnotation}>(For Managers Only)</span>
      </div>

      <div style={dpStyles.subSectionGap}>
        <div style={dpStyles.subHeaderRow}>
          <span className="material-symbols-outlined" style={dpStyles.subHeaderIcon}>person</span>
          <span style={dpStyles.subHeaderTitle}>Character Overview</span>
        </div>
        <p style={dpStyles.body}>{card.characterOverview}</p>
      </div>

      <div style={dpStyles.tabBlock}>
        <TabsRow tabs={tabs} activeTab={tab} onTabClick={setTab} />
        <Card tone="muted" padX={24} padY={16} style={dpStyles.bulletPanel}>
          <ul style={dpStyles.bulletList}>
            {list.map((item, i) => (
              <li key={i} style={dpStyles.bulletItem}>{item}</li>
            ))}
          </ul>
        </Card>
      </div>

      <div style={dpStyles.subSectionGap}>
        <div style={dpStyles.subHeaderRow}>
          <span className="material-symbols-outlined" style={dpStyles.subHeaderIcon}>check_circle</span>
          <span style={dpStyles.subHeaderTitle}>Resolution</span>
        </div>
        <div style={dpStyles.resolutionRow}>
          <ResolutionColumn emoji="🤙" label="Ideal" body={card.resolution.ideal} />
          <ResolutionColumn emoji="👍" label="Minimum" body={card.resolution.minimum} />
          <ResolutionColumn emoji="🤝" label="Compromised" body={card.resolution.compromised} />
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
      <p style={dpStyles.body}>{body}</p>
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
    color: "var(--color-icon-tertiary-fg)", marginLeft: 4,
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
    paddingLeft: 20,
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
