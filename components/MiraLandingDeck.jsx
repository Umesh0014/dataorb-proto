/* eslint-disable no-restricted-syntax --
   The pulse cards and chat rows are full clickable surfaces (a metric tile
   and a list row), not the pill/icon/text shapes Button.jsx models — same
   precedent as MiraChatsPage's rows and the suggestion cards in
   AskMiraProPage. Raw <button> is intentional so the whole surface is one
   accessible hit target with bespoke layout. */
"use client";

import React from "react";
import { ChevronRight } from "lucide-react";
import Card from "./Card";
import { MiraStarIcon } from "./SideNav/icons";
import { LANDING_METRICS } from "./mocks/miraLandingMetrics";
import { formatRelativeTime } from "./mocks/miraConversation";

const RECENT_LIMIT = 4;

/**
 * MiraLandingDeck — the "Launchpad" home direction for Ask Mira Pro.
 *
 * Stacks three bands top-to-bottom: the greeting, the composer (passed in
 * so a single Composer implementation is shared with the chat + Welcome Mat
 * states), a grid of metric-category pulse cards, then the user's recent
 * chat interactions. Clicking a pulse card seeds a question about that
 * category into the composer; clicking a chat row opens that conversation.
 *
 * @param {{
 *   userName?: string,
 *   composer: React.ReactNode,
 *   conversations: Array<{ id: string, firstQuestion: string, createdAt: number, turns: Array<unknown> }>,
 *   onAskAbout: (text: string) => void,
 *   onOpenConversation: (id: string) => void,
 *   onViewAll: () => void,
 * }} props
 */
export default function MiraLandingDeck({
  userName = "Demo Internal",
  composer,
  conversations,
  onAskAbout,
  onOpenConversation,
  onViewAll,
}) {
  const recent = React.useMemo(
    () => [...conversations].sort((a, b) => b.createdAt - a.createdAt).slice(0, RECENT_LIMIT),
    [conversations]
  );

  return (
    <div style={s.scroll}>
      <div style={s.deck}>
        <div style={s.greeting}>
          <div style={s.greetingIconWrap} aria-hidden="true">
            <MiraStarIcon size={40} color="var(--color-button-primary-bg)" />
          </div>
          <div style={s.greetingHeading}>Hello, {userName}!</div>
          <div style={s.greetingSubtitle}>
            Ask anything, or pick up where you left off.
          </div>
        </div>

        {composer}

        <section style={s.section} aria-label="Metric highlights">
          <div style={s.grid} role="list">
            {LANDING_METRICS.map((metric) => (
              <PulseCard
                key={metric.id}
                metric={metric}
                onClick={() => onAskAbout(metric.ask)}
              />
            ))}
          </div>
        </section>

        <section style={s.section} aria-label="Your chats">
          <div style={s.sectionHeader}>
            <span style={s.sectionTitle}>Your chats</span>
            <button type="button" style={s.viewAll} onClick={onViewAll}>
              View all
            </button>
          </div>
          <Card padX={0} padY={0}>
            <div style={s.list}>
              {recent.map((c) => (
                <ChatRow
                  key={c.id}
                  conversation={c}
                  onClick={() => onOpenConversation(c.id)}
                />
              ))}
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}

function PulseCard({ metric, onClick }) {
  const { Icon, label, rows, ask } = metric;
  const [hovered, setHovered] = React.useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ ...s.pulse, ...(hovered ? s.pulseHover : null) }}
      aria-label={`Ask Mira: ${ask}`}
    >
      <div style={s.pulseHead}>
        <span style={s.pulseIconWrap} aria-hidden="true">
          <Icon size={16} color="var(--color-button-primary-bg)" />
        </span>
        <span style={s.pulseLabel}>{label}</span>
        <ChevronRight
          size={16}
          color="var(--color-text-tertiary)"
          style={{ opacity: hovered ? 1 : 0, transition: "opacity 120ms ease" }}
        />
      </div>
      <div style={s.pulseRows}>
        {rows.map((row, i) => (
          <div key={row.label} style={s.pulseRow}>
            <span style={i === 0 ? s.pulseRowLabelLead : s.pulseRowLabel}>
              {row.label}
            </span>
            <span style={{ ...s.pulseRowValue, ...toneStyle(row.tone, i === 0) }}>
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </button>
  );
}

function ChatRow({ conversation, onClick }) {
  const [hovered, setHovered] = React.useState(false);
  const count = conversation.turns?.length ?? 0;
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ ...s.row, background: hovered ? "var(--color-card-emoji-bg)" : "transparent" }}
    >
      <div style={s.rowText}>
        <span style={s.rowTitle}>{conversation.firstQuestion}</span>
        <span style={s.rowMeta}>
          {formatRelativeTime(conversation.createdAt)} · {count} message
          {count === 1 ? "" : "s"}
        </span>
      </div>
      <ChevronRight
        size={18}
        color="var(--color-text-tertiary)"
        style={{ opacity: hovered ? 1 : 0, transition: "opacity 120ms ease", flexShrink: 0 }}
      />
    </button>
  );
}

function toneStyle(tone, isLead) {
  if (tone === "positive") return { color: "var(--color-success)" };
  if (tone === "negative") return { color: "var(--color-error)" };
  return isLead ? { color: "var(--color-text-deep)" } : { color: "var(--color-text-medium)" };
}

const s = {
  scroll: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
  },
  deck: {
    display: "flex",
    flexDirection: "column",
    gap: 28,
    width: "100%",
    maxWidth: 860,
    marginInline: "auto",
    paddingBottom: 8,
  },

  greeting: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    textAlign: "center",
    paddingTop: 8,
  },
  greetingIconWrap: {
    width: 48,
    height: 48,
    display: "grid",
    placeItems: "center",
  },
  greetingHeading: {
    fontSize: 24,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    lineHeight: 1.3,
  },
  greetingSubtitle: {
    fontSize: 14,
    fontWeight: 500,
    color: "var(--color-text-medium)",
    lineHeight: 1.4,
  },

  section: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: "var(--color-text-deep)",
  },
  viewAll: {
    appearance: "none",
    border: "none",
    background: "transparent",
    padding: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-button-primary-bg)",
    cursor: "pointer",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 16,
  },
  pulse: {
    appearance: "none",
    textAlign: "left",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    padding: 16,
    background: "var(--surface-white)",
    border: "1px solid var(--color-divider-card)",
    borderRadius: 12,
    cursor: "pointer",
    fontFamily: "var(--font-sans)",
    transition: "border-color 120ms ease, background 120ms ease",
  },
  pulseHover: {
    borderColor: "var(--color-button-primary-bg)",
    background: "var(--color-primary-alpha-04)",
  },
  pulseHead: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  pulseIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    background: "var(--color-primary-alpha-12)",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
  },
  pulseLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: 700,
    color: "var(--color-text-deep)",
  },
  pulseRows: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  pulseRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  pulseRowLabelLead: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text-medium)",
  },
  pulseRowLabel: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
  },
  pulseRowValue: {
    fontSize: 13,
    fontWeight: 700,
    fontVariantNumeric: "tabular-nums",
  },

  list: {
    display: "flex",
    flexDirection: "column",
  },
  row: {
    appearance: "none",
    border: "none",
    background: "transparent",
    width: "100%",
    textAlign: "left",
    padding: "14px 20px",
    display: "flex",
    alignItems: "center",
    gap: 12,
    borderBottom: "1px solid var(--color-divider-card)",
    cursor: "pointer",
    transition: "background 120ms ease",
  },
  rowText: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "var(--color-text-deep)",
    lineHeight: 1.4,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  rowMeta: {
    fontSize: 12,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
  },
};
