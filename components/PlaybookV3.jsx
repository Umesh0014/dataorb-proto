"use client";

import React from "react";
import { ArrowLeft, Users } from "lucide-react";
import Card from "./Card";
import { TASK_PLAYBOOK, SENTIMENT_TONE } from "./mocks/taskPlaybook";
import {
  ApproachSection,
  CustomerQuestionsSection,
  ChallengesSection,
  PitfallsSection,
  WhyItWorksSection,
  CompetitorContextSection,
  SourcesSection,
  Dot,
  sharedStyles,
} from "./playbookShared";

// PlaybookV3 — Agent-First Mosaic (Playbook redesign · variant V3).
//
// Reframes the page: the agents whose interactions built the playbook are the
// FIRST content block after the hero, before any narrative. Each contributor
// card carries enough detail (name, interactions, adherence band, dominant
// pattern, sample quote) to read as evidence in its own right. Overview block
// follows in a single editorial column. The tabular Source Evidence remains at
// the bottom for the deeper drill-down. No left TOC — the mosaic is the
// orientation device.

export default function PlaybookV3({ taskId, onBack }) {
  const playbook = TASK_PLAYBOOK;

  return (
    <div style={styles.column}>
      <Hero playbook={playbook} onBack={onBack} taskId={taskId} />

      <ContributorsMosaic
        contributors={playbook.contributors}
        total={playbook.totalSources}
        window={playbook.sourceWindow}
      />

      <main style={styles.content}>
        <OverviewBlock data={playbook.overview} />
        <ApproachSection data={playbook.approach} />
        <CustomerQuestionsSection items={playbook.customerQuestions} />
        <ChallengesSection items={playbook.challenges} />
        <PitfallsSection items={playbook.pitfalls} />
        <WhyItWorksSection body={playbook.whyItWorks} />
        <CompetitorContextSection data={playbook.competitorContext} />
        <SourcesSection
          items={playbook.sources}
          total={playbook.totalSources}
          pages={playbook.pagesTotal}
        />
      </main>
    </div>
  );
}

// ---- Hero -----------------------------------------------------------------

function Hero({ playbook, onBack, taskId }) {
  return (
    <Card padX={0} padY={0} style={styles.heroCard}>
      <div style={styles.heroInner}>
        <div style={styles.heroTopRow}>
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to Tasks"
            style={styles.backBtn}
          >
            <ArrowLeft size={20} color="var(--color-text-medium)" />
          </button>
          <span style={styles.statusTag}>{playbook.tag}</span>
        </div>

        <h1 style={styles.heroTitle}>{playbook.title}</h1>

        <div style={styles.heroMeta}>
          <span style={styles.taskId}>{taskId || playbook.id}</span>
          <Dot />
          <span style={styles.authorAvatar} aria-hidden="true">{playbook.author.initial}</span>
          <span style={styles.authorName}>{playbook.author.name}</span>
          <Dot />
          <span style={styles.timestamp}>{playbook.timestamp}</span>
        </div>
      </div>
    </Card>
  );
}

// ---- Contributors Mosaic (the variant's defining block) -------------------

function ContributorsMosaic({ contributors, total, window: windowLabel }) {
  return (
    <Card padX={0} padY={0} style={styles.mosaicCard}>
      <header style={styles.mosaicHead}>
        <span style={styles.mosaicHeadLeft}>
          <Users size={16} color="var(--color-text-tertiary)" />
          <h2 style={styles.mosaicTitle}>Built by these agents</h2>
        </span>
        <span style={styles.mosaicHeadRight}>
          {total} interactions · {contributors.length} agents · {windowLabel}
        </span>
      </header>

      <div style={styles.mosaicBody}>
        <p style={styles.mosaicLead}>
          The playbook was reverse-engineered from the highest-adherence interactions
          handled by these agents. Their patterns — listed below — are the source of
          every step in the approach.
        </p>

        <div style={styles.mosaicGrid}>
          {contributors.map((c) => (
            <ContributorCard key={c.id} agent={c} />
          ))}
        </div>
      </div>
    </Card>
  );
}

function ContributorCard({ agent }) {
  const sentTone = SENTIMENT_TONE[agent.dominantSentiment] || SENTIMENT_TONE.neutral;
  return (
    <article style={styles.contribCard}>
      <div style={styles.contribHead}>
        <span style={styles.contribAvatar} aria-hidden="true">{agent.initial}</span>
        <div style={styles.contribMeta}>
          <span style={styles.contribName}>{agent.name}</span>
          <span style={styles.contribCount}>
            {agent.interactions} interactions
          </span>
        </div>
      </div>

      <div style={styles.contribStats}>
        <div style={styles.contribStat}>
          <span style={styles.contribStatLabel}>Adherence</span>
          <span style={styles.contribStatValue}>
            {agent.adherenceLow}–{agent.adherenceHigh}%
          </span>
        </div>
        <div style={styles.contribStat}>
          <span style={styles.contribStatLabel}>Dominant sentiment</span>
          <span style={{ ...styles.contribSentiment, background: sentTone.bg, color: sentTone.fg }}>
            {agent.dominantSentiment.charAt(0).toUpperCase() + agent.dominantSentiment.slice(1)}
          </span>
        </div>
      </div>

      <p style={styles.contribPattern}>{agent.pattern}</p>

      <blockquote style={styles.contribQuote}>
        <span style={styles.contribQuoteText}>{agent.quote}</span>
      </blockquote>
    </article>
  );
}

// ---- Overview (single primary block, no section label) --------------------

function OverviewBlock({ data }) {
  return (
    <div id="section-overview" style={{ scrollMarginTop: 16 }}>
      <Card padX={0} padY={0} style={sharedStyles.sectionCard}>
        <div style={styles.overviewBody}>
          <p style={styles.overviewLead}>{data.headline}</p>
          <p style={styles.overviewPara}>{data.body}</p>
          <p style={styles.overviewPara}>{data.whenToUse}</p>
          <p style={styles.overviewPara}>{data.customerProfile}</p>
          <p style={styles.overviewPara}>
            <strong style={styles.overviewStrong}>Emotional context. </strong>
            {data.emotionalContext}
          </p>
          <div style={styles.chipRow}>
            {data.chips.map((c) => (
              <span key={c} style={styles.chip}>{c}</span>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

// ---- Styles ---------------------------------------------------------------

const styles = {
  column: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    width: "100%",
    fontFamily: "var(--font-sans)",
  },

  // Hero
  heroCard: { boxShadow: "var(--shadow-card)" },
  heroInner: {
    display: "flex", flexDirection: "column", gap: 16,
    padding: "20px 32px 24px",
  },
  heroTopRow: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    gap: 12,
  },
  backBtn: {
    width: 32, height: 32, borderRadius: 6,
    border: "none", background: "transparent", cursor: "pointer",
    display: "inline-grid", placeItems: "center",
    padding: 0,
  },
  statusTag: {
    display: "inline-flex", alignItems: "center",
    padding: "4px 10px",
    background: "var(--color-icon-tertiary-bg)",
    color: "var(--color-icon-tertiary-fg)",
    borderRadius: 999,
    fontFamily: "var(--font-mono)",
    fontSize: 12, fontWeight: 700, letterSpacing: "0.1px",
    flexShrink: 0,
  },
  heroTitle: {
    margin: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 32, fontWeight: 700, lineHeight: "40px", letterSpacing: "-0.2px",
    color: "var(--color-text-deep)",
  },
  heroMeta: {
    display: "inline-flex", alignItems: "center", gap: 12, flexWrap: "wrap",
    minHeight: 24,
  },
  taskId: {
    fontSize: 13, fontWeight: 600, color: "var(--color-text-medium)",
    fontFamily: "var(--font-mono)",
  },
  authorAvatar: {
    width: 20, height: 20, borderRadius: 999,
    background: "#DDE1FF", color: "var(--color-icon-tertiary-fg)",
    display: "inline-grid", placeItems: "center",
    fontSize: 10, fontWeight: 700, letterSpacing: "0.15px",
  },
  authorName: { fontSize: 13, fontWeight: 500, color: "var(--color-text-medium)" },
  timestamp: { fontSize: 13, fontWeight: 400, color: "var(--color-text-tertiary)" },

  // Mosaic
  mosaicCard: { boxShadow: "var(--shadow-card)" },
  mosaicHead: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    gap: 8, padding: "16px 24px",
    borderBottom: "1px solid var(--color-border-card-soft)",
  },
  mosaicHeadLeft: { display: "inline-flex", alignItems: "center", gap: 8 },
  mosaicHeadRight: {
    fontFamily: "var(--font-mono)",
    fontSize: 12, fontWeight: 500, letterSpacing: "0.1px",
    color: "var(--color-text-tertiary)",
  },
  mosaicTitle: {
    margin: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 16, fontWeight: 600, letterSpacing: "0.25px", lineHeight: "22px",
    color: "var(--color-text-medium)",
  },
  mosaicBody: {
    padding: 24,
    display: "flex", flexDirection: "column", gap: 16,
  },
  mosaicLead: {
    margin: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 14, fontWeight: 400, letterSpacing: "0.1px", lineHeight: "22px",
    color: "var(--color-text-medium)",
  },
  mosaicGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: 16,
  },

  // Contributor card
  contribCard: {
    display: "flex", flexDirection: "column", gap: 12,
    padding: 16,
    border: "1px solid var(--color-border-card-soft)",
    borderRadius: 8,
    background: "#FFFFFF",
  },
  contribHead: {
    display: "flex", alignItems: "center", gap: 12,
  },
  contribAvatar: {
    width: 40, height: 40, borderRadius: 999,
    background: "#DDE1FF",
    display: "inline-grid", placeItems: "center",
    fontFamily: "var(--font-sans)",
    fontSize: 14, fontWeight: 700, letterSpacing: "0.5px",
    color: "var(--color-icon-tertiary-fg)",
    flexShrink: 0,
  },
  contribMeta: {
    display: "flex", flexDirection: "column",
    minWidth: 0,
  },
  contribName: {
    fontFamily: "var(--font-sans)",
    fontSize: 15, fontWeight: 600, letterSpacing: "0.1px",
    color: "var(--color-text-deep)",
  },
  contribCount: {
    fontFamily: "var(--font-mono)",
    fontSize: 11, fontWeight: 500, letterSpacing: "0.4px",
    color: "var(--color-text-tertiary)",
  },
  contribStats: {
    display: "flex", flexDirection: "column", gap: 6,
    padding: "8px 0",
    borderTop: "1px solid var(--color-border-card-soft)",
    borderBottom: "1px solid var(--color-border-card-soft)",
  },
  contribStat: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    gap: 8,
  },
  contribStatLabel: {
    fontFamily: "var(--font-sans)",
    fontSize: 12, fontWeight: 400, letterSpacing: "0.4px",
    color: "var(--color-text-tertiary)",
  },
  contribStatValue: {
    fontFamily: "var(--font-mono)",
    fontSize: 12, fontWeight: 600, letterSpacing: "0.4px",
    color: "var(--color-text-medium)",
  },
  contribSentiment: {
    display: "inline-flex", alignItems: "center",
    padding: "2px 8px",
    borderRadius: 4,
    fontFamily: "var(--font-sans)",
    fontSize: 11, fontWeight: 500, letterSpacing: "0.4px",
  },
  contribPattern: {
    margin: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 13, fontWeight: 500, letterSpacing: "0.1px", lineHeight: "20px",
    color: "var(--color-text-medium)",
  },
  contribQuote: {
    margin: 0,
    paddingLeft: 12,
    borderLeft: "2px solid var(--color-icon-tertiary-fg)",
  },
  contribQuoteText: {
    fontFamily: "var(--font-sans)",
    fontSize: 13, fontStyle: "italic", fontWeight: 400, letterSpacing: "0.1px", lineHeight: "20px",
    color: "var(--color-text-tertiary)",
  },

  // Body
  content: {
    display: "flex", flexDirection: "column", gap: 16,
    width: "100%", minWidth: 0,
  },

  // Overview
  overviewBody: {
    padding: 32,
    display: "flex", flexDirection: "column", gap: 16,
  },
  overviewLead: {
    margin: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 22, fontWeight: 500, lineHeight: "32px", letterSpacing: "-0.1px",
    color: "var(--color-text-deep)",
  },
  overviewPara: {
    margin: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 15, fontWeight: 400, letterSpacing: "0.1px", lineHeight: "24px",
    color: "var(--color-text-medium)",
  },
  overviewStrong: {
    fontWeight: 600,
    color: "var(--color-text-deep)",
  },
  chipRow: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 },
  chip: {
    display: "inline-flex", alignItems: "center",
    padding: "4px 12px",
    background: "var(--color-icon-tertiary-bg)",
    color: "var(--color-text-medium)",
    borderRadius: 4,
    fontSize: 12, fontWeight: 400, letterSpacing: "0.4px",
  },
};
