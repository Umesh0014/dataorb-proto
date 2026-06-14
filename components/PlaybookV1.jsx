"use client";

import React from "react";
import {
  ArrowLeft,
  Crosshair,
  UserSearch,
  Flame,
  TrendingDown,
  CheckCircle2,
  GitMerge,
  Quote,
} from "lucide-react";
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

// PlaybookV1 — Editorial Long-form (Playbook redesign · variant V1).
//
// Hero header + sticky left TOC + single overview block (no "Overview" label,
// sub-blocks merged) + the body sections + Source Evidence with an in-section
// agent-grid card row above the existing table. Most conservative of the three
// variants: keeps the TOC pattern, keeps section card chrome, surfaces
// contributing agents inside the existing Source Evidence section.

const TOC_ITEMS = [
  { id: "overview",   label: "Summary",            Icon: Quote },
  { id: "approach",   label: "The Approach",       Icon: Crosshair },
  { id: "questions",  label: "Customer Questions", Icon: UserSearch },
  { id: "challenges", label: "Challenges",         Icon: Flame },
  { id: "pitfalls",   label: "Pitfalls",           Icon: TrendingDown },
  { id: "why-works",  label: "Why It Works",       Icon: CheckCircle2 },
  { id: "competitor", label: "Competitor Context", Icon: GitMerge },
  { id: "sources",    label: "Source Evidence",    Icon: Quote },
];

export default function PlaybookV1({ taskId, onBack }) {
  const playbook = TASK_PLAYBOOK;

  const handleTocClick = (id) => {
    if (typeof window === "undefined") return;
    const el = document.getElementById(`section-${id}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    try { history.replaceState(null, "", `#${id}`); } catch { /* read-only */ }
  };

  return (
    <div style={styles.column}>
      <Hero playbook={playbook} onBack={onBack} taskId={taskId} />

      <div style={styles.body}>
        <TocColumn onItemClick={handleTocClick} />

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
            header={<AgentGrid contributors={playbook.contributors} window={playbook.sourceWindow} total={playbook.totalSources} />}
          />
        </main>
      </div>
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

// ---- TOC ------------------------------------------------------------------

function TocColumn({ onItemClick }) {
  return (
    <aside style={styles.tocWrap}>
      <nav style={styles.tocInner} aria-label="Sections">
        {TOC_ITEMS.map((item) => (
          <TocItem key={item.id} item={item} onClick={() => onItemClick(item.id)} />
        ))}
      </nav>
    </aside>
  );
}

function TocItem({ item, onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...styles.tocBtn,
        background: hover ? "var(--color-card-emoji-bg)" : "transparent",
      }}
    >
      <item.Icon size={16} color="var(--color-text-tertiary)" />
      <span style={styles.tocLabel}>{item.label}</span>
    </button>
  );
}

// ---- Overview (single primary block, no section label) -------------------

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

// ---- Agent grid (sits inside the Source Evidence section, above the table)

function AgentGrid({ contributors, window: windowLabel, total }) {
  return (
    <div style={styles.agentGridWrap}>
      <div style={styles.agentGridLead}>
        <span style={styles.agentGridLabel}>BUILT FROM</span>
        <p style={styles.agentGridSummary}>
          <strong>{total} interactions</strong> across{" "}
          <strong>{contributors.length} agents</strong> · {windowLabel}
        </p>
      </div>
      <div style={styles.agentGrid}>
        {contributors.map((c) => (
          <AgentCard key={c.id} agent={c} />
        ))}
      </div>
    </div>
  );
}

function AgentCard({ agent }) {
  const sentTone = SENTIMENT_TONE[agent.dominantSentiment] || SENTIMENT_TONE.neutral;
  return (
    <div style={styles.agentCard}>
      <div style={styles.agentCardHead}>
        <span style={styles.agentCardAvatar} aria-hidden="true">{agent.initial}</span>
        <div style={styles.agentCardMeta}>
          <span style={styles.agentCardName}>{agent.name}</span>
          <span style={styles.agentCardCount}>
            {agent.interactions} interactions
          </span>
        </div>
      </div>
      <div style={styles.agentCardRow}>
        <span style={styles.agentCardStatLabel}>Adherence</span>
        <span style={styles.agentCardStatValue}>
          {agent.adherenceLow}–{agent.adherenceHigh}%
        </span>
      </div>
      <div style={styles.agentCardRow}>
        <span style={styles.agentCardStatLabel}>Dominant sentiment</span>
        <span style={{ ...styles.agentCardSentiment, background: sentTone.bg, color: sentTone.fg }}>
          {agent.dominantSentiment.charAt(0).toUpperCase() + agent.dominantSentiment.slice(1)}
        </span>
      </div>
      <p style={styles.agentCardPattern}>{agent.pattern}</p>
    </div>
  );
}

// ---- Styles ---------------------------------------------------------------

const styles = {
  column: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
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

  // Body
  body: {
    display: "flex", alignItems: "flex-start", gap: 24,
    width: "100%",
  },
  content: {
    flex: 1, minWidth: 0,
    display: "flex", flexDirection: "column", gap: 16,
  },

  // TOC
  tocWrap: {
    width: 220,
    flexShrink: 0,
    position: "sticky",
    top: 16,
    alignSelf: "flex-start",
  },
  tocInner: {
    display: "flex", flexDirection: "column",
    padding: 12,
    background: "#FFFFFF",
    borderRadius: 12,
    boxShadow: "var(--shadow-card)",
  },
  tocBtn: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "12px 12px",
    width: "100%",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontFamily: "inherit",
    textAlign: "left",
    transition: "background 150ms ease",
  },
  tocLabel: {
    fontFamily: "var(--font-sans)",
    fontSize: 13, fontWeight: 500, letterSpacing: "0.1px",
    color: "var(--color-text-medium)",
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

  // Agent grid (inside Source Evidence section)
  agentGridWrap: {
    display: "flex", flexDirection: "column", gap: 12,
    marginBottom: 8,
  },
  agentGridLead: {
    display: "flex", flexDirection: "column", gap: 4,
  },
  agentGridLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: 11, fontWeight: 600, letterSpacing: "0.1px",
    color: "var(--color-text-tertiary)",
    textTransform: "uppercase",
  },
  agentGridSummary: {
    margin: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 14, fontWeight: 400, lineHeight: "22px",
    color: "var(--color-text-medium)",
  },
  agentGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: 12,
  },
  agentCard: {
    display: "flex", flexDirection: "column", gap: 8,
    padding: 16,
    border: "1px solid var(--color-border-card-soft)",
    borderRadius: 8,
    background: "#FFFFFF",
  },
  agentCardHead: {
    display: "flex", alignItems: "center", gap: 12,
  },
  agentCardAvatar: {
    width: 32, height: 32, borderRadius: 999,
    background: "#DDE1FF",
    display: "inline-grid", placeItems: "center",
    fontFamily: "var(--font-sans)",
    fontSize: 12, fontWeight: 700, letterSpacing: "0.5px",
    color: "var(--color-icon-tertiary-fg)",
  },
  agentCardMeta: {
    display: "flex", flexDirection: "column",
    flex: 1, minWidth: 0,
  },
  agentCardName: {
    fontFamily: "var(--font-sans)",
    fontSize: 14, fontWeight: 600, letterSpacing: "0.1px",
    color: "var(--color-text-deep)",
  },
  agentCardCount: {
    fontFamily: "var(--font-mono)",
    fontSize: 11, fontWeight: 500, letterSpacing: "0.4px",
    color: "var(--color-text-tertiary)",
  },
  agentCardRow: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    gap: 8,
  },
  agentCardStatLabel: {
    fontFamily: "var(--font-sans)",
    fontSize: 12, fontWeight: 400, letterSpacing: "0.4px",
    color: "var(--color-text-tertiary)",
  },
  agentCardStatValue: {
    fontFamily: "var(--font-mono)",
    fontSize: 12, fontWeight: 600, letterSpacing: "0.4px",
    color: "var(--color-text-medium)",
  },
  agentCardSentiment: {
    display: "inline-flex", alignItems: "center",
    padding: "2px 8px",
    borderRadius: 4,
    fontFamily: "var(--font-sans)",
    fontSize: 11, fontWeight: 500, letterSpacing: "0.4px",
  },
  agentCardPattern: {
    margin: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 13, fontWeight: 400, letterSpacing: "0.1px", lineHeight: "20px",
    color: "var(--color-text-tertiary)",
  },
};
