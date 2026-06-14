"use client";

import React from "react";
import { ArrowLeft, ChevronDown } from "lucide-react";
import Card from "./Card";
import { TASK_PLAYBOOK } from "./mocks/taskPlaybook";
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

// PlaybookV2 — Hero + Pinned Source Strip (Playbook redesign · variant V2).
//
// Same section order as today, but the contributing-agent strip sits right
// below the hero and stays visually anchored at the top of the reading column.
// Single overview block (no "Overview" label). No left TOC — the source strip
// answers "who built this?" so the page reads top-to-bottom as a single
// editorial column at ~880px ideal width.

export default function PlaybookV2({ taskId, onBack }) {
  const playbook = TASK_PLAYBOOK;

  const handleJumpToSources = () => {
    if (typeof window === "undefined") return;
    const el = document.getElementById("section-sources");
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    try { history.replaceState(null, "", "#sources"); } catch { /* read-only */ }
  };

  return (
    <div style={styles.column}>
      <Hero playbook={playbook} onBack={onBack} taskId={taskId} />

      <SourceStrip
        contributors={playbook.contributors}
        total={playbook.totalSources}
        window={playbook.sourceWindow}
        onJump={handleJumpToSources}
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
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to Tasks"
          style={styles.backBtn}
        >
          <ArrowLeft size={20} color="var(--color-text-medium)" />
        </button>

        <div style={styles.heroTextStack}>
          <div style={styles.heroIdRow}>
            <span style={styles.taskId}>{taskId || playbook.id}</span>
            <Dot />
            <span style={styles.statusTag}>{playbook.tag}</span>
          </div>

          <h1 style={styles.heroTitle}>{playbook.title}</h1>

          <div style={styles.heroMeta}>
            <span style={styles.authorAvatar} aria-hidden="true">{playbook.author.initial}</span>
            <span style={styles.authorName}>{playbook.author.name}</span>
            <Dot />
            <span style={styles.timestamp}>{playbook.timestamp}</span>
          </div>
        </div>
      </div>
      {/* Metadata snapshot — UI-7. Identity sits above; the playbook's
          *parameters* (topics it covers) sit in this band below the divider. */}
      <div style={styles.heroSnapshot} aria-label="Topics">
        {playbook.overview.chips.map((c) => (
          <span key={c} style={styles.chip}>{c}</span>
        ))}
      </div>
    </Card>
  );
}

// ---- Source Strip (the variant's defining element) ------------------------

function SourceStrip({ contributors, total, window: windowLabel, onJump }) {
  if (contributors.length === 0) {
    // INT-5: deliberate zero-state. A playbook without ingested source
    // interactions still surfaces the absence rather than a blank strip.
    return (
      <Card padX={0} padY={0} style={styles.stripCard}>
        <div style={styles.stripInner}>
          <div style={styles.stripText}>
            <span style={styles.stripLabel}>BUILT FROM</span>
            <p style={styles.stripSummaryEmpty}>
              No source interactions ingested yet — the contributing agents and
              citation count will appear here once the first batch is processed.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // WCAG-7: visually the cluster is decorative initials, but the
  // contributors are load-bearing content; provide the full agent + count
  // list as the cluster's accessible name so an SR user gets the same info.
  const clusterLabel =
    "Contributing agents — " +
    contributors
      .map((c) => `${c.name}, ${c.interactions} interactions`)
      .join("; ");

  return (
    <Card padX={0} padY={0} style={styles.stripCard}>
      <div style={styles.stripInner}>
        <div style={styles.stripText}>
          <span style={styles.stripLabel}>BUILT FROM</span>
          <p style={styles.stripSummary}>
            <strong>{total} interactions</strong> across{" "}
            <strong>{contributors.length} agents</strong> · {windowLabel}
          </p>
        </div>

        <div style={styles.stripCluster}>
          <AgentAvatarCluster contributors={contributors} ariaLabel={clusterLabel} />
          <button
            type="button"
            onClick={onJump}
            style={styles.jumpBtn}
            aria-label="Jump to source evidence"
          >
            Jump to evidence
            <ChevronDown size={14} color="var(--color-text-medium)" />
          </button>
        </div>
      </div>
    </Card>
  );
}

function AgentAvatarCluster({ contributors, ariaLabel }) {
  return (
    <div
      style={styles.cluster}
      role="img"
      aria-label={ariaLabel}
    >
      {contributors.map((c, idx) => (
        <span
          key={c.id}
          style={{
            ...styles.clusterAvatar,
            marginLeft: idx === 0 ? 0 : -8,
            zIndex: contributors.length - idx,
          }}
          aria-hidden="true"
        >
          {c.initial}
        </span>
      ))}
    </div>
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
    display: "flex", alignItems: "flex-start", gap: 12,
    padding: "20px 32px 24px",
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 8,
    border: "none", background: "transparent", cursor: "pointer",
    display: "inline-grid", placeItems: "center",
    padding: 0,
    flexShrink: 0,
    marginTop: 2,
    transition: "background 150ms ease",
  },
  heroTextStack: {
    flex: 1, minWidth: 0,
    display: "flex", flexDirection: "column", gap: 8,
  },
  heroIdRow: {
    display: "inline-flex", alignItems: "center", gap: 8,
  },
  taskId: {
    fontSize: 13, fontWeight: 600, color: "var(--color-text-medium)",
    fontFamily: "var(--font-mono)",
  },
  statusTag: {
    display: "inline-flex", alignItems: "center",
    padding: "3px 10px",
    background: "var(--color-icon-tertiary-bg)",
    color: "var(--color-icon-tertiary-fg)",
    borderRadius: 999,
    fontFamily: "var(--font-mono)",
    fontSize: 11, fontWeight: 700, letterSpacing: "0.1px",
    flexShrink: 0,
  },
  heroTitle: {
    margin: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 32, fontWeight: 700, lineHeight: "40px", letterSpacing: "-0.2px",
    color: "var(--color-text-deep)",
  },
  heroMeta: {
    display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap",
    marginTop: 4,
  },
  authorAvatar: {
    width: 20, height: 20, borderRadius: 999,
    background: "#DDE1FF", color: "var(--color-icon-tertiary-fg)",
    display: "inline-grid", placeItems: "center",
    fontSize: 10, fontWeight: 700, letterSpacing: "0.15px",
  },
  authorName: { fontSize: 13, fontWeight: 500, color: "var(--color-text-medium)" },
  timestamp: { fontSize: 13, fontWeight: 400, color: "var(--color-text-tertiary)" },
  heroSnapshot: {
    display: "flex", flexWrap: "wrap", gap: 8,
    padding: "16px 32px",
    borderTop: "1px solid var(--color-border-card-soft)",
    background: "#FCFBFF",
    borderBottomLeftRadius: 12, borderBottomRightRadius: 12,
  },

  // Source strip — visually anchored under the hero as the page's first
  // content block. Earlier iterations used position:sticky here, but that
  // created a z-index/layout-shift risk (MOT-9) against PageLayout
  // primitives without a clear scroll-container contract. A prominent
  // non-sticky strip carries the same "5 agents · 150 interactions"
  // surfacing without that fragility.
  stripCard: {
    boxShadow: "var(--shadow-card)",
  },
  stripInner: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    gap: 16, flexWrap: "wrap",
    padding: "14px 24px",
  },
  stripText: {
    display: "flex", flexDirection: "column", gap: 2,
    minWidth: 0,
  },
  stripLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: 11, fontWeight: 600, letterSpacing: "0.1px",
    color: "var(--color-text-tertiary)",
    textTransform: "uppercase",
  },
  stripSummary: {
    margin: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 14, fontWeight: 400, lineHeight: "22px",
    color: "var(--color-text-medium)",
  },
  stripSummaryEmpty: {
    margin: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 13, fontWeight: 400, lineHeight: "20px",
    color: "var(--color-text-tertiary)",
  },
  stripCluster: {
    display: "inline-flex", alignItems: "center", gap: 16,
  },
  cluster: {
    display: "inline-flex", alignItems: "center",
  },
  clusterAvatar: {
    width: 28, height: 28, borderRadius: 999,
    background: "#DDE1FF",
    border: "2px solid #FFFFFF",
    display: "inline-grid", placeItems: "center",
    fontFamily: "var(--font-sans)",
    fontSize: 11, fontWeight: 700, letterSpacing: "0.5px",
    color: "var(--color-icon-tertiary-fg)",
    flexShrink: 0,
  },
  jumpBtn: {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "8px 16px",
    height: 40,
    border: "1px solid var(--color-divider-card)",
    borderRadius: 999,
    background: "#FFFFFF",
    cursor: "pointer",
    fontFamily: "var(--font-sans)",
    fontSize: 13, fontWeight: 500, letterSpacing: "0.1px",
    color: "var(--color-text-medium)",
    transition: "background 150ms ease, box-shadow 150ms ease",
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
  chip: {
    display: "inline-flex", alignItems: "center",
    padding: "4px 12px",
    background: "var(--color-icon-tertiary-bg)",
    color: "var(--color-text-medium)",
    borderRadius: 4,
    fontSize: 12, fontWeight: 400, letterSpacing: "0.4px",
  },
};
