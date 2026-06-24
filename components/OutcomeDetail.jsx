/* eslint-disable no-restricted-syntax --
   The audio-briefing play control is a single bespoke pill surface (dark pill
   + waveform), not a Button.jsx pill/icon/text shape — same precedent as the
   composer's visibility switch. Raw <button> keeps it one accessible target. */
"use client";

import React from "react";
import { Share2, Play, Pause, Target } from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import PageHeader from "./PageHeader";
import MetricSparkline from "./MetricSparkline";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// Facepile of folks the outcome space is shared with (mock).
const SHARED_PEOPLE = [
  { initials: "VS", color: "var(--chart-blue)" },
  { initials: "CF", color: "var(--chart-lavender)" },
  { initials: "ML", color: "var(--chart-green)" },
  { initials: "MK", color: "var(--chart-orange)" },
];
const SHARED_MORE = 7;

/**
 * OutcomeDetail — drill-in for a single outcome card.
 *
 * Vertical reading order (per spec): top bar (back + facepiles + Share) →
 * outcome title → metric in big type → trend line → supporting metrics →
 * audio briefing → authored stories. The Ask Mira Pro composer is docked
 * sticky at the bottom (passed down from AskMiraProPage so submitting opens
 * a chat just like the rest of the surface).
 *
 * @param {{ outcome: object, composer?: React.ReactNode, onBack: () => void }} props
 */
export default function OutcomeDetail({ outcome, composer, onBack }) {
  const { title, value, target, goalPct, deltaPp, trend, invert } = outcome;
  const positive = deltaPp >= 0;
  const good = invert ? deltaPp < 0 : deltaPp >= 0;
  const accent = good ? "var(--color-success)" : "var(--color-error)";

  const peakIdx = trend.indexOf(Math.max(...trend));
  const labels = trend.map((_, i) => {
    const mo = MONTHS[i] ?? `P${i + 1}`;
    return i === peakIdx ? `Peak · ${mo}` : mo;
  });

  const stories = buildStories(outcome, good);

  return (
    <div style={d.page}>
      <div style={d.scroll}>
        <div style={d.inner}>
          <PageHeader
            back={onBack}
            identifier={{ icon: <Target size={18} />, label: "Outcomes" }}
            actions={
              <div style={d.headerActions}>
                <Facepile />
                <Button
                  variant="text"
                  uppercase={false}
                  leadingIcon={<Share2 size={15} />}
                  style={d.shareBtn}
                >
                  Share
                </Button>
              </div>
            }
          />

          <Card shadow padX={28} padY={24} style={d.heroCard}>
            <div style={d.breadcrumb}>OUTCOME SPACE · ASK MIRA PRO</div>
            <h1 style={d.title}>{title}</h1>

            <div style={d.metricRow}>
              <div style={d.value}>
                {value}
                <span style={d.unit}>%</span>
              </div>
              <div style={d.deltaCol}>
                <span style={d.vsLabel}>vs last period</span>
                <span style={{ ...d.delta, color: accent }}>
                  {positive ? "+" : ""}{deltaPp} pp
                </span>
              </div>
            </div>

            <div style={d.trend}>
              <MetricSparkline
                points={trend}
                color={accent}
                target={target}
                labels={labels}
                formatValue={(v) => `${Math.round(v)}%`}
                height={84}
                fillTopOpacity={0.32}
                fillBottomOpacity={0.12}
                autoScale
              />
            </div>

            <div style={d.stats}>
              <StatCell label="Target" value={`${target}%`} first />
              <StatCell label="% of goal" value={`${goalPct}%`} />
              <StatCell
                label="vs last period"
                value={`${positive ? "+" : ""}${deltaPp} pp`}
                color={accent}
              />
            </div>

            <AudioBriefing />
          </Card>

          <div style={d.storiesHead}>Stories</div>
          <div style={d.stories}>
            {stories.map((st) => (
              <Card key={st.kind} tone="outline" padX={18} padY={16} style={d.storyCard}>
                <span style={{ ...d.storyKind, color: st.tone }}>{st.kind}</span>
                <span style={d.storyTitle}>{st.title}</span>
                <span style={d.storyBody}>{st.body}</span>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {composer && (
        <div style={d.composerDock}>
          <div style={d.composerInner}>{composer}</div>
        </div>
      )}
    </div>
  );
}

function Facepile() {
  return (
    <div style={d.facepile} aria-label="Shared with">
      {SHARED_PEOPLE.map((p, i) => (
        <span
          key={p.initials}
          style={{ ...d.avatar, background: p.color, marginLeft: i === 0 ? 0 : -8 }}
          aria-hidden="true"
        >
          {p.initials}
        </span>
      ))}
      <span style={{ ...d.avatar, ...d.avatarMore }} aria-hidden="true">+{SHARED_MORE}</span>
    </div>
  );
}

// StatCell — one cell of the in-card stat row. Cells after the first carry a
// thin divider so the three read as one strip, not separate cards.
function StatCell({ label, value, color, first }) {
  return (
    <div style={{ ...d.statCell, ...(first ? null : d.statCellDivided) }}>
      <span style={d.statLabel}>{label}</span>
      <span style={{ ...d.statValue, color: color || "var(--color-text-deep)" }}>{value}</span>
    </div>
  );
}

// AudioBriefing — dark "this week's briefing" pill with a play/pause toggle
// and a decorative waveform. Playback is mocked (toggles the glyph only).
function AudioBriefing() {
  const [playing, setPlaying] = React.useState(false);
  return (
    <div style={d.audioWrap}>
      <button
        type="button"
        onClick={() => setPlaying((p) => !p)}
        aria-label={playing ? "Pause briefing" : "Play briefing"}
        style={d.audioPill}
      >
        <span style={d.audioIcon}>
          {playing ? <Pause size={15} color="#FFFFFF" /> : <Play size={15} color="#FFFFFF" />}
        </span>
        <span style={d.waveform} aria-hidden="true">
          {WAVE_BARS.map((h, i) => (
            <span key={i} style={{ ...d.waveBar, height: h }} />
          ))}
        </span>
        <span style={d.audioLabel}>This week&apos;s briefing</span>
        <span style={d.audioDuration}>2 min</span>
      </button>
    </div>
  );
}

const WAVE_BARS = [6, 11, 8, 14, 9, 13, 7, 12, 8, 10];

function buildStories(o, good) {
  const dir = o.deltaPp >= 0 ? "up" : "down";
  const vsTarget = o.value >= o.target ? "above" : "below";
  return [
    {
      kind: "WHAT MOVED",
      tone: "var(--color-success)",
      title: `${o.title} is ${good ? "improving" : "slipping"}`,
      body: `${o.title} moved to ${o.value}% this period — ${dir} ${Math.abs(o.deltaPp)} pp versus last period, now ${vsTarget} the ${o.target}% target.`,
    },
    {
      kind: "WHAT'S AT RISK",
      tone: "var(--color-warning)",
      title: `Holding the ${o.target}% target`,
      body: `The recent swing is concentrated in a few cohorts. If it continues, ${o.title.toLowerCase()} drifts ${vsTarget === "above" ? "back below" : "further from"} target within two cycles.`,
    },
    {
      kind: "THE DECISION",
      tone: "var(--color-button-primary-bg)",
      title: "Approve the next play",
      body: `Run the recommended intervention and re-check ${o.title.toLowerCase()} next week. Ask Mira Pro below to simulate the impact before committing.`,
    },
  ];
}

const d = {
  page: {
    flex: 1,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    fontFamily: "var(--font-sans)",
  },
  scroll: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
  },
  inner: {
    width: "100%",
    maxWidth: 860,
    marginInline: "auto",
    paddingTop: 16,
    paddingBottom: 24,
    display: "flex",
    flexDirection: "column",
  },

  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  shareBtn: {
    border: "1px solid var(--color-divider-card)",
    borderRadius: 999,
    paddingInline: 14,
    color: "var(--color-text-medium)",
  },
  facepile: {
    display: "inline-flex",
    alignItems: "center",
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 999,
    border: "2px solid var(--surface-white)",
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: 700,
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
  },
  avatarMore: {
    background: "var(--color-chip-bg)",
    color: "var(--color-text-medium)",
    marginLeft: -8,
  },

  // Single white card holding the whole hero block (breadcrumb → audio). The
  // audio pill is absolutely anchored to the bottom edge, so the card is
  // position: relative and carries extra bottom padding to clear it.
  heroCard: {
    position: "relative",
    marginTop: 16,
    paddingBottom: 40,
  },
  breadcrumb: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.12em",
    color: "var(--color-text-tertiary)",
  },
  title: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 30,
    fontWeight: 800,
    color: "var(--color-text-deep)",
    lineHeight: 1.2,
  },

  metricRow: {
    marginTop: 20,
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 20,
  },
  value: {
    display: "flex",
    alignItems: "baseline",
    gap: 2,
    fontSize: 64,
    fontWeight: 800,
    lineHeight: 1,
    color: "var(--color-text-deep)",
    fontVariantNumeric: "tabular-nums",
  },
  unit: {
    fontSize: 32,
    fontWeight: 700,
    color: "var(--color-text-tertiary)",
  },
  deltaCol: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    paddingBottom: 6,
  },
  vsLabel: {
    fontSize: 12,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
  },
  delta: {
    fontSize: 20,
    fontWeight: 800,
    fontVariantNumeric: "tabular-nums",
  },

  // Borderless trend — sits directly inside the hero card.
  trend: {
    marginTop: 20,
  },

  stats: {
    marginTop: 20,
    paddingTop: 20,
    borderTop: "1px solid var(--color-divider-card)",
    display: "flex",
    alignItems: "stretch",
  },
  statCell: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 6,
    paddingInline: 20,
  },
  statCellDivided: {
    borderInlineStart: "1px solid var(--color-divider-card)",
  },
  statLabel: {
    fontSize: 12,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
  },
  statValue: {
    fontSize: 20,
    fontWeight: 800,
    fontVariantNumeric: "tabular-nums",
  },

  // Straddles the hero card's bottom edge — centered, pulled down so half the
  // pill sits outside the card (heroCard is position: relative, padded at the
  // bottom so the pill's top half clears the stat row).
  audioWrap: {
    position: "absolute",
    left: "50%",
    bottom: 0,
    transform: "translate(-50%, 50%)",
  },
  audioPill: {
    appearance: "none",
    border: "none",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 12,
    height: 52,
    paddingInline: 18,
    borderRadius: 999,
    background: "var(--grey-900)",
    boxShadow: "var(--shadow-8)",
    fontFamily: "var(--font-sans)",
  },
  audioIcon: {
    width: 30,
    height: 30,
    borderRadius: 999,
    background: "var(--color-button-primary-bg)",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
  },
  waveform: {
    display: "inline-flex",
    alignItems: "center",
    gap: 3,
    height: 18,
  },
  waveBar: {
    width: 3,
    borderRadius: 2,
    background: "var(--chart-green)",
  },
  audioLabel: {
    fontSize: 14,
    fontWeight: 600,
    color: "#FFFFFF",
  },
  audioDuration: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--grey-500)",
  },

  storiesHead: {
    marginTop: 48,
    marginBottom: 12,
    fontSize: 16,
    fontWeight: 700,
    color: "var(--color-text-deep)",
  },
  stories: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 16,
  },
  storyCard: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  storyKind: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.08em",
  },
  storyTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    lineHeight: 1.3,
  },
  storyBody: {
    fontSize: 13,
    fontWeight: 500,
    lineHeight: 1.5,
    color: "var(--color-text-medium)",
  },

  composerDock: {
    flexShrink: 0,
    borderTop: "1px solid var(--color-divider-card)",
    background: "var(--surface-canvas)",
    paddingTop: 12,
    paddingBottom: 4,
  },
  composerInner: {
    width: "100%",
    maxWidth: 860,
    marginInline: "auto",
  },
};

