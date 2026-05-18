"use client";

import React from "react";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import CoachingRecommendations from "./CoachingRecommendations";
import RoleplayCoverage from "./RoleplayCoverage";
import QualityAdherence from "./QualityAdherence";
import { LEARNING_AGENTS } from "./mocks/learningAgents";

// AgentProfile — Learning Hub agent detail page, opened from an Agents row.
// Structural shell only: a back/title + filter-bar header, then four titled
// cards with empty bodies. Card content lands in follow-up tasks. Reached
// via app/page.jsx state (agentProfileId) — mirrors DrillDetailPage.
export default function AgentProfile({ agentId, onBack }) {
  // TODO: replace this mock lookup with a real agent data fetch.
  const agent = LEARNING_AGENTS.find((a) => a.id === agentId) || LEARNING_AGENTS[0];

  React.useEffect(() => {
    if (typeof document === "undefined") return;
    const previous = document.title;
    document.title = `${agent.name} — Agent Profile`;
    return () => {
      document.title = previous;
    };
  }, [agent]);

  return (
    <div style={profileStyles.page}>
      <ProfileHeader name={agent.name} onBack={onBack} />

      <CoachingRecommendations />

      <SectionCard title="Missions">
        {/* TODO: missions content (active / closed) */}
      </SectionCard>

      <RoleplayCoverage />

      <QualityAdherence />
    </div>
  );
}

// ProfileHeader — title row (back arrow + agent name) above a divider and
// an intentionally-empty filter strip with a filter icon at its right end.
// Back-arrow + title row mirrors DrillDetailPage's DetailHeader; the divider
// + strip mirror PageHeader's row-2 pattern.
function ProfileHeader({ name, onBack }) {
  return (
    <Card padX={0} padY={0}>
      <div style={profileStyles.titleRow}>
        <Button variant="icon" aria-label="Back to Agents" onClick={onBack}>
          <ArrowLeft size={20} />
        </Button>
        <span style={profileStyles.agentName}>{name}</span>
      </div>
      <div style={profileStyles.headerDivider} aria-hidden="true" />
      <div style={profileStyles.filterBar}>
        <Button
          variant="icon"
          aria-label="Filter"
          onClick={() => {
            // TODO: open filter panel
          }}
        >
          <SlidersHorizontal size={20} />
        </Button>
      </div>
    </Card>
  );
}

// SectionCard — standard <Card> surface with a title and an (empty) body.
function SectionCard({ title, children }) {
  return (
    <Card>
      <div style={profileStyles.cardTitle}>{title}</div>
      <div style={profileStyles.cardBody}>{children}</div>
    </Card>
  );
}

const profileStyles = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
    width: "100%",
    flex: 1,
    minHeight: 0,
  },
  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    height: 80,
    paddingInline: 28,
  },
  agentName: {
    fontSize: 18,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    lineHeight: 1.3,
  },
  headerDivider: {
    height: 1,
    background: "var(--color-border-tab)",
  },
  filterBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    height: 56,
    paddingInline: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    lineHeight: 1.4,
  },
  cardBody: {
    // Placeholder min-height so each empty shell card renders with visible
    // room while the layout is built out. Remove when real content lands.
    minHeight: 80,
    marginTop: 12,
  },
};
