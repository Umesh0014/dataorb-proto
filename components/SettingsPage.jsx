"use client";

import React from "react";
import {
  Settings,
  ClipboardList,
  Podcast,
  BookCopy,
  TrendingUp,
  Users,
  LayoutGrid,
  Network,
  Briefcase,
  LineChart,
  ArrowUpRight,
  Gauge,
  Waves,
} from "lucide-react";
import { ROLEPLAY_DRIVERS } from "./mocks/roleplayDrivers";

// SettingsPage — DataOrb admin Settings landing.
//
// Header band + four stacked white section containers, each holding a
// section heading, a hairline divider, and a responsive grid of pastel
// icon-tile cards. The whole card is the click target; the blue
// ArrowUpRight is a visual cue, not a separate button.
//
// All copy, ordering, and tile/icon assignments come from the Figma
// Settings spec. Cards flagged `placeholder: true` (Nav 2, Nav 3, lorem
// ipsum descriptions) are reproduced verbatim until product fills them
// in — we don't invent labels or icons.
//
// The page renders without <PageLayout>'s max-width clamp because the
// gradient surface needs to span the full main-area width; the inner
// container holds the same 1068 cap used elsewhere in the app.

const TILE = {
  green:    { bg: "var(--tile-green-bg)",    fg: "var(--tile-green-fg)" },
  emerald:  { bg: "var(--tile-emerald-bg)",  fg: "var(--tile-emerald-fg)" },
  blue:     { bg: "var(--tile-blue-bg)",     fg: "var(--tile-blue-fg)" },
  yellow:   { bg: "var(--tile-yellow-bg)",   fg: "var(--tile-yellow-fg)" },
  rose:     { bg: "var(--tile-rose-bg)",     fg: "var(--tile-rose-fg)" },
  orange:   { bg: "var(--tile-orange-bg)",   fg: "var(--tile-orange-fg)" },
  cyan:     { bg: "var(--tile-cyan-bg)",     fg: "var(--tile-cyan-fg)" },
  violet:   { bg: "var(--tile-violet-bg)",   fg: "var(--tile-violet-fg)" },
  fuchsia:  { bg: "var(--tile-fuchsia-bg)",  fg: "var(--tile-fuchsia-fg)" },
  // Lavender re-uses the existing tertiary-icon token pair (same hue the
  // Settings header gear sits in) — no new colour minted. The Credits &
  // Usage card adopts this tone per spec §3.
  lavender: { bg: "var(--color-icon-tertiary-bg)", fg: "var(--color-icon-tertiary-fg)" },
};

// poolBarTone — green < 80%, amber 80–90%, red > 90% / overage. Keeps the
// Settings card's stat bar in sync with the Credits & Usage page widget.
export function poolBarTone(percent) {
  if (percent >= 90) return { fg: "var(--color-error)",   bg: "var(--color-error-bg)" };
  if (percent >= 80) return { fg: "var(--color-warning)", bg: "var(--color-warning-bg)" };
  return { fg: "var(--color-success)", bg: "var(--color-success-bg)" };
}

// CREDITS_USAGE_SAMPLE — single source for the % stat shown on both the
// Settings card and the Credits & Usage page so they stay in sync.
export const CREDITS_USAGE_SAMPLE = {
  poolMinutes: 24000,
  consumedMTD: 14880, // ~62%
};
export function poolPercentUsed(sample = CREDITS_USAGE_SAMPLE) {
  const { poolMinutes, consumedMTD } = sample;
  if (!poolMinutes) return 0;
  return Math.max(0, Math.min(999, Math.round((consumedMTD / poolMinutes) * 100)));
}

// CREDITS_ENFORCEMENT_SAMPLE — tenant-level config + per-agent usage
// that drive the Roleplay/Drill session-start gate. Single source so
// the gate the Drill page reads matches what the Credits & Usage page
// would write. Adjust these values to demo the A2/A3/A4 states (see
// evaluateRoleplayGate below).
export const CREDITS_ENFORCEMENT_SAMPLE = {
  mode: "continue",        // "continue" (Mode A) | "block" (Mode B)
  agentMinutesUsed: 38,
  agentCapMinutes: null,   // null = no cap; set a number to enforce
  agentCapFrequency: "monthly", // "daily" | "weekly" | "monthly"
};

// evaluateRoleplayGate — pre-start check spec §4. Returns one of:
//   { kind: "allowed" }                                 — A1, no UI
//   { kind: "agentCap", capMinutes, frequency }         — A2, hard block
//   { kind: "poolBlocked" }                             — A3, hard block
//   { kind: "overage" }                                 — A4, info banner
export function evaluateRoleplayGate(
  sample = CREDITS_USAGE_SAMPLE,
  enforcement = CREDITS_ENFORCEMENT_SAMPLE,
) {
  if (
    typeof enforcement.agentCapMinutes === "number"
    && enforcement.agentMinutesUsed >= enforcement.agentCapMinutes
  ) {
    return {
      kind: "agentCap",
      capMinutes: enforcement.agentCapMinutes,
      frequency: enforcement.agentCapFrequency,
    };
  }
  const pct = poolPercentUsed(sample);
  if (pct >= 100 && enforcement.mode === "block") return { kind: "poolBlocked" };
  if (pct >= 100 && enforcement.mode === "continue") return { kind: "overage" };
  return { kind: "allowed" };
}

// gateCopy — DRAFT agent-facing copy from spec §4. Translates the gate
// kind into the heading/body the Banner renders. Reset wording inside
// the agentCap heading follows the cap frequency (daily/weekly/monthly).
export function gateCopy(gate) {
  if (!gate || gate.kind === "allowed") return null;
  if (gate.kind === "agentCap") {
    const { capMinutes, frequency } = gate;
    const windowLabel = frequency === "daily" ? "today" : frequency === "weekly" ? "this week" : "this month";
    const resetLabel  = frequency === "daily" ? "tomorrow" : frequency === "weekly" ? "on Monday" : "on the 1st";
    return {
      tone: "danger",
      heading: "You've reached your practice limit",
      body: `You've used all your practice minutes for ${windowLabel} (${capMinutes} min). New sessions unlock when your limit resets ${resetLabel}.`,
    };
  }
  if (gate.kind === "poolBlocked") {
    return {
      tone: "danger",
      heading: "Practice is paused this month",
      body: "Your team has used all its Learning Hub practice minutes for this month. Sessions will be available again when the pool refreshes on the 1st — or sooner if your admin adds more.",
    };
  }
  if (gate.kind === "overage") {
    return {
      tone: "warning",
      heading: "Monthly practice pool used up",
      body: "Your team's monthly practice pool is used up. Sessions can continue — extra minutes are billed at your agreed rate.",
    };
  }
  return null;
}

const SECTIONS = [
  {
    id: "quality-coaching",
    label: "Quality & Coaching",
    // Subheader per Credits & Usage spec §6. Section label itself stays
    // "Quality & Coaching" pending stakeholder confirmation on the
    // Learning Hub relabel (spec §10 #1).
    subheader: "Manage roleplay practice credits, scorecards, and metrics for Learning Hub.",
    cards: [
      {
        id: "credits-usage",
        title: "Credits & Usage",
        description: "View credit balance, set usage thresholds, and configure roleplay and agent limits.",
        Icon: Gauge,
        tone: "lavender",
        // Stat slot — the Settings card extends the base pastel-tile
        // template with a single % + thin progress bar (spec §3). The
        // tone follows poolBarTone() so card + page agree.
        stat: { kind: "poolUsage", sample: CREDITS_USAGE_SAMPLE },
      },
      {
        id: "scorecards",
        title: "Scorecards",
        description: "Performance tracking through key metrics for strategic progress.",
        Icon: ClipboardList,
        tone: "green",
      },
      {
        id: "coach-skills",
        title: "Coach Skills",
        description: "Agent training hub filled with vital coaching skills.",
        Icon: Podcast,
        tone: "emerald",
      },
      {
        id: "library",
        title: "Library",
        description: "Metric library for both auto and manual evaluations.",
        Icon: BookCopy,
        tone: "blue",
      },
      {
        id: "performance-area",
        title: "Performance Area",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        Icon: TrendingUp,
        tone: "yellow",
        placeholder: true,
      },
    ],
  },
  {
    // Learning Hub — new Settings section added for the Figma "In review
    // - V2" Roleplay Drivers card. Currently surfaces a single live card
    // (Roleplay Drivers); the other Learning Hub admin surfaces (Roleplay
    // Scorecards / Roleplay Metrics) ship in a later branch and fall back
    // to ComingSoon at the route level.
    id: "learning-hub",
    label: "Learning Hub",
    subheader: "Evaluate agent performance using configurable scorecards and quality metrics.",
    cards: [
      {
        id: "roleplay-drivers",
        title: "Roleplay Drivers",
        // Roleplay Drivers card surfaces its current live count, matching
        // the "{N} Drivers Available" copy in the Figma Settings card.
        description: "View available contact drivers linked contact reasons",
        Icon: Waves,
        tone: "violet",
        stat: { kind: "driverCount" },
      },
    ],
  },
  {
    id: "user-management",
    label: "User management",
    cards: [
      {
        id: "users",
        title: "Users",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        Icon: Users,
        tone: "rose",
        placeholder: true,
      },
      {
        id: "workspaces",
        title: "Workspaces",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        Icon: LayoutGrid,
        tone: "orange",
        placeholder: true,
      },
      {
        id: "groups",
        title: "Groups",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        Icon: Network,
        tone: "cyan",
        placeholder: true,
      },
    ],
  },
  {
    id: "interaction-typology",
    label: "Interaction typology",
    cards: [
      {
        id: "business-category",
        title: "Business Category",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        Icon: Briefcase,
        tone: "violet",
        placeholder: true,
      },
      {
        id: "nav-2",
        title: "Nav 2",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        Icon: Briefcase,
        tone: "violet",
        placeholder: true,
      },
      {
        id: "nav-3",
        title: "Nav 3",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        Icon: Briefcase,
        tone: "violet",
        placeholder: true,
      },
    ],
  },
  {
    id: "system-processing",
    label: "System processing",
    cards: [
      {
        id: "processing-data",
        title: "Processing data",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        Icon: LineChart,
        tone: "fuchsia",
        placeholder: true,
      },
    ],
  },
];

export default function SettingsPage({ onSelectCard }) {
  const handleSelect = (cardId) => {
    if (onSelectCard) {
      onSelectCard(cardId);
    } else {
      // No router hook in scope here — stubbed for parity with other
      // Settings landings until each sub-route ships.
      // eslint-disable-next-line no-console
      console.log("settings card →", cardId);
    }
  };

  return (
    <div style={styles.column}>
      <HeaderCard />
      {SECTIONS.map((section) => (
        <SectionContainer
          key={section.id}
          label={section.label}
          subheader={section.subheader}
        >
          <div style={styles.grid}>
            {section.cards.map((card) => (
              <SettingsCard
                key={card.id}
                card={card}
                onClick={() => handleSelect(card.id)}
              />
            ))}
          </div>
        </SectionContainer>
      ))}
    </div>
  );
}

// ---- Header ------------------------------------------------------------

function HeaderCard() {
  return (
    <div style={styles.headerCard}>
      <span style={styles.headerIconTile} aria-hidden="true">
        <Settings size={16} color="var(--color-icon-tertiary-fg)" strokeWidth={2} />
      </span>
      <span style={styles.headerTitle}>Settings</span>
    </div>
  );
}

// ---- Section container -------------------------------------------------

function SectionContainer({ label, subheader, children }) {
  return (
    <section style={styles.sectionCard}>
      <header style={subheader ? styles.sectionHeaderStacked : styles.sectionHeader}>
        <span style={styles.sectionHeading}>{label}</span>
        {subheader && <span style={styles.sectionSubheader}>{subheader}</span>}
      </header>
      {children}
    </section>
  );
}

// ---- Card --------------------------------------------------------------

function SettingsCard({ card, onClick }) {
  const [hover, setHover] = React.useState(false);
  const [focus, setFocus] = React.useState(false);
  const tile = TILE[card.tone] || TILE.violet;
  const Icon = card.Icon;
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      aria-label={card.title}
      style={{
        ...styles.card,
        borderColor: hover || focus ? "var(--color-divider-card)" : "var(--color-border-card-soft)",
        boxShadow: hover ? "var(--shadow-card)" : "none",
        outline: focus ? "2px solid var(--do-brand-blue)" : "none",
        outlineOffset: focus ? 2 : 0,
      }}
    >
      <div style={styles.cardInner}>
        <div style={styles.cardHeader}>
          <span style={{ ...styles.cardIconTile, background: tile.bg }} aria-hidden="true">
            <Icon size={16} color={tile.fg} strokeWidth={2} />
          </span>
          <div style={styles.cardTitleRow}>
            <span style={styles.cardTitle}>{card.title}</span>
            <ArrowUpRight
              size={16}
              color="var(--do-brand-blue)"
              strokeWidth={2}
              aria-hidden="true"
            />
          </div>
        </div>
        <p style={styles.cardDescription}>{card.description}</p>
        {card.stat?.kind === "poolUsage" && <PoolUsageStat sample={card.stat.sample} />}
        {card.stat?.kind === "driverCount" && <DriverCountStat />}
      </div>
    </button>
  );
}

// DriverCountStat — small "{N} Drivers Available" tag matching the Figma
// Settings card affordance. Pulls the live count from the shared seed
// list so the Settings landing and the Roleplay Drivers list always
// agree on how many active drivers exist out of the box.
function DriverCountStat() {
  const activeCount = ROLEPLAY_DRIVERS.filter((d) => !d.archived).length;
  return (
    <div style={styles.statBlock}>
      <span style={styles.driverCountChip}>{activeCount} Drivers Available</span>
    </div>
  );
}

// PoolUsageStat — "{N}% pool used this month" + thin tinted progress bar.
// Tone tracks poolBarTone (success / warning / danger). Shared with the
// Credits & Usage page widget; both read the same sample so they stay in
// sync.
function PoolUsageStat({ sample }) {
  const pct = poolPercentUsed(sample);
  const tone = poolBarTone(pct);
  const fillPct = Math.min(100, pct);
  return (
    <div style={styles.statBlock}>
      <span style={styles.statLabel}>{pct}% pool used this month</span>
      <span style={{ ...styles.statTrack, background: tone.bg }} aria-hidden="true">
        <span
          style={{
            ...styles.statFill,
            width: `${fillPct}%`,
            background: tone.fg,
          }}
        />
      </span>
    </div>
  );
}

// ---- Styles ------------------------------------------------------------

const styles = {
  // Content column — sits inside <PageLayout>'s CenteredColumn, which
  // already owns the 1068 max-width, side gutters, and page padding.
  // Settings only manages its internal vertical stack so the surface
  // (--surface-canvas) matches every other landing page.
  column: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    width: "100%",
    fontFamily: "var(--font-sans)",
  },

  // Header card
  headerCard: {
    width: "100%",
    minHeight: 56,
    background: "#FFFFFF",
    borderRadius: 12,
    border: "2px solid #FFFFFF",
    padding: "8px 12px",
    display: "flex",
    alignItems: "center",
    gap: 12,
    boxSizing: "border-box",
  },
  headerIconTile: {
    width: 32,
    height: 32,
    borderRadius: 999,
    background: "var(--color-icon-tertiary-bg)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 600,
    lineHeight: "24px",
    color: "var(--color-text-medium)",
  },

  // Section container
  sectionCard: {
    width: "100%",
    background: "#FFFFFF",
    borderRadius: 12,
    padding: "0 20px 20px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    boxSizing: "border-box",
  },
  sectionHeader: {
    height: 48,
    display: "flex",
    alignItems: "center",
    borderBottom: "1px solid #F9F9FF",
  },
  sectionHeaderStacked: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottom: "1px solid #F9F9FF",
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: 500,
    lineHeight: "22px",
    letterSpacing: "0.15px",
    color: "var(--color-text-deep)",
  },
  sectionSubheader: {
    fontSize: 12,
    fontWeight: 400,
    lineHeight: "18px",
    color: "var(--color-text-tertiary)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 12,
    width: "100%",
  },

  // Card
  card: {
    appearance: "none",
    border: "1px solid var(--color-border-card-soft)",
    borderRadius: 12,
    background: "#FFFFFF",
    padding: "12px 0 16px",
    cursor: "pointer",
    textAlign: "left",
    width: "100%",
    minHeight: 108,
    boxSizing: "border-box",
    fontFamily: "inherit",
    transition: "box-shadow 120ms ease, border-color 120ms ease",
  },
  cardInner: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    paddingInline: 16,
    width: "100%",
    boxSizing: "border-box",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    minHeight: 32,
  },
  cardIconTile: {
    width: 32,
    height: 32,
    borderRadius: 8,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cardTitleRow: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 500,
    lineHeight: "24px",
    color: "var(--color-text-medium)",
    minWidth: 0,
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  },
  cardDescription: {
    margin: 0,
    fontSize: 12,
    fontWeight: 400,
    lineHeight: "18px",
    letterSpacing: "0.25px",
    color: "var(--color-text-tertiary)",
    minHeight: 36,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  statBlock: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: 500,
    color: "var(--color-text-medium)",
    fontVariantNumeric: "tabular-nums",
  },
  statTrack: {
    width: "100%",
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
    display: "block",
  },
  statFill: {
    display: "block",
    height: "100%",
    borderRadius: 2,
    transition: "width 200ms ease",
  },
  driverCountChip: {
    display: "inline-flex",
    alignItems: "center",
    alignSelf: "flex-start",
    height: 22,
    padding: "0 10px",
    borderRadius: 999,
    background: "var(--tile-violet-bg)",
    color: "var(--tile-violet-fg)",
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    fontWeight: 500,
    fontVariantNumeric: "tabular-nums",
  },
};
