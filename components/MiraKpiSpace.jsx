/* eslint-disable no-restricted-syntax --
   The KPI rail items, suggestion chips, and chat rows are clickable list /
   chip surfaces, not the pill/icon/text shapes Button.jsx models — same
   precedent as MiraLandingDeck and VersionBar. Raw <button> keeps each a
   single accessible target. */
"use client";

import React from "react";
import { ChevronRight, ArrowUpRight, ArrowDownRight, Lock, Globe, Pin } from "lucide-react";
import Card from "./Card";
import KpiTrendChart from "./KpiTrendChart";
import { MiraStarIcon } from "./SideNav/icons";
import { OUTCOME_KPIS, SPACE_STORIES, kpiSuggestions } from "./mocks/miraKpiSpace";
import { formatRelativeTime } from "./mocks/miraConversation";

/**
 * MiraKpiSpace — the "KPI Space" landing direction (outcome-space surface).
 *
 * Three columns: an Outcome-KPI rail (left) selects the outcome; the middle
 * shows that KPI's trend chart plus the space's authored Stories and Chats;
 * the right ~50% is the AMP ask surface for running analysis beside the
 * outcome. State (selected KPI) is local to this direction.
 *
 * @param {{
 *   userName?: string,
 *   composer: React.ReactNode,
 *   conversations: Array<{ id: string, firstQuestion: string, createdAt: number, turns: Array<unknown> }>,
 *   onOpenConversation: (id: string) => void,
 *   onPickSuggestion: (text: string) => void,
 * }} props
 */
export default function MiraKpiSpace({
  userName = "Demo Internal",
  composer,
  conversations,
  onOpenConversation,
  onPickSuggestion,
}) {
  const [selectedId, setSelectedId] = React.useState(OUTCOME_KPIS[0].id);
  const selected = OUTCOME_KPIS.find((k) => k.id === selectedId) || OUTCOME_KPIS[0];

  const recentChats = React.useMemo(
    () => [...conversations].sort((a, b) => b.createdAt - a.createdAt).slice(0, 3),
    [conversations]
  );

  return (
    <div style={s.space}>
      <aside style={s.rail} aria-label="Outcome KPIs">
        <div style={s.railTitle}>Outcomes</div>
        {OUTCOME_KPIS.map((kpi) => (
          <RailItem
            key={kpi.id}
            kpi={kpi}
            active={kpi.id === selectedId}
            onClick={() => setSelectedId(kpi.id)}
          />
        ))}
      </aside>

      <div style={s.center}>
        <div style={s.centerHead}>
          <div>
            <div style={s.centerKpiLabel}>{selected.label}</div>
            <div style={s.centerValueRow}>
              <span style={s.centerValue}>{selected.value}</span>
              <ChangePill change={selected.change} />
            </div>
          </div>
        </div>

        <Card padX={20} padY={20}>
          <div style={s.cardHead}>Trend · last 8 months</div>
          <KpiTrendChart kpi={selected} />
        </Card>

        <section style={s.section} aria-label="Stories">
          <div style={s.sectionHead}>
            <span style={s.sectionTitle}>Stories</span>
            <span style={s.sectionHint}>Authored by Mira · viewable by everyone</span>
          </div>
          <div style={s.storyList}>
            {SPACE_STORIES.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        </section>

        <section style={s.section} aria-label="Chats">
          <div style={s.sectionHead}>
            <span style={s.sectionTitle}>Chats</span>
          </div>
          <Card padX={0} padY={0}>
            <div style={s.chatList}>
              {recentChats.map((c) => (
                <ChatRow key={c.id} conversation={c} onClick={() => onOpenConversation(c.id)} />
              ))}
            </div>
          </Card>
        </section>
      </div>

      <div style={s.amp}>
        <div style={s.ampHead}>
          <div style={s.ampIconWrap} aria-hidden="true">
            <MiraStarIcon size={28} color="var(--color-button-primary-bg)" />
          </div>
          <div>
            <div style={s.ampTitle}>Ask about {selected.label}</div>
            <div style={s.ampSubtitle}>
              Run analysis right beside the outcome, {userName.split(" ")[0]}.
            </div>
          </div>
        </div>

        <div style={s.suggestions} role="list">
          {kpiSuggestions(selected.label).map((q) => (
            <button
              key={q}
              type="button"
              role="listitem"
              style={s.suggestion}
              onClick={() => onPickSuggestion(q)}
            >
              {q}
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        {composer}
      </div>
    </div>
  );
}

function RailItem({ kpi, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{ ...s.railItem, ...(active ? s.railItemActive : null) }}
    >
      <span style={{ ...s.railDot, background: kpi.accent }} aria-hidden="true" />
      <span style={s.railText}>
        <span style={s.railLabel}>{kpi.label}</span>
        <span style={s.railValue}>{kpi.value}</span>
      </span>
    </button>
  );
}

function ChangePill({ change }) {
  const color = change.good ? "var(--color-success)" : "var(--color-error)";
  const Arrow = change.dir === "up" ? ArrowUpRight : ArrowDownRight;
  return (
    <span style={{ ...s.pill, color, background: `color-mix(in srgb, ${color} 14%, var(--surface-white))` }}>
      <Arrow size={13} color={color} />
      {change.value}
    </span>
  );
}

function StoryCard({ story }) {
  const isPublic = story.visibility === "public";
  const VisIcon = isPublic ? Globe : Lock;
  return (
    <div style={s.story}>
      <span style={s.storyIconWrap} aria-hidden="true">
        <MiraStarIcon size={18} color="var(--color-button-primary-bg)" />
      </span>
      <div style={s.storyText}>
        <span style={s.storyTitle}>{story.title}</span>
        <span style={s.storyMeta}>
          <span style={s.storyTag}>
            <VisIcon size={12} color="var(--color-text-tertiary)" />
            {isPublic ? "Public" : "Private"}
          </span>
          <span style={s.metaDot} aria-hidden="true" />
          <span style={s.storyTag}>
            <Pin size={12} color="var(--color-text-tertiary)" />
            {story.pins} pinned
          </span>
          <span style={s.metaDot} aria-hidden="true" />
          {story.date}
        </span>
      </div>
    </div>
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
      style={{ ...s.chatRow, background: hovered ? "var(--color-card-emoji-bg)" : "transparent" }}
    >
      <div style={s.chatText}>
        <span style={s.chatTitle}>{conversation.firstQuestion}</span>
        <span style={s.chatMeta}>
          {formatRelativeTime(conversation.createdAt)} · {count} message{count === 1 ? "" : "s"}
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

const s = {
  space: { display: "flex", gap: 16, flex: 1, minHeight: 0 },

  rail: {
    width: 200,
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    gap: 6,
    overflowY: "auto",
    paddingRight: 4,
  },
  railTitle: {
    fontSize: 12,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    color: "var(--color-text-tertiary)",
    padding: "4px 8px 8px",
  },
  railItem: {
    appearance: "none",
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "100%",
    textAlign: "left",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid transparent",
    background: "transparent",
    cursor: "pointer",
    fontFamily: "var(--font-sans)",
    transition: "background 120ms ease, border-color 120ms ease",
  },
  railItemActive: {
    background: "var(--surface-white)",
    border: "1px solid var(--color-divider-card)",
    boxShadow: "var(--shadow-card)",
  },
  railDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  railText: { display: "flex", flexDirection: "column", gap: 2, minWidth: 0 },
  railLabel: { fontSize: 13, fontWeight: 600, color: "var(--color-text-deep)" },
  railValue: {
    fontSize: 12,
    fontWeight: 600,
    color: "var(--color-text-tertiary)",
    fontVariantNumeric: "tabular-nums",
  },

  center: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 20,
    overflowY: "auto",
    paddingRight: 4,
  },
  centerHead: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  centerKpiLabel: { fontSize: 13, fontWeight: 600, color: "var(--color-text-tertiary)" },
  centerValueRow: { display: "flex", alignItems: "baseline", gap: 10, marginTop: 2 },
  centerValue: {
    fontSize: 30,
    fontWeight: 800,
    color: "var(--color-text-deep)",
    lineHeight: 1.1,
    fontVariantNumeric: "tabular-nums",
  },
  cardHead: { fontSize: 13, fontWeight: 600, color: "var(--color-text-medium)", marginBottom: 12 },

  section: { display: "flex", flexDirection: "column", gap: 10 },
  sectionHead: { display: "flex", alignItems: "baseline", gap: 10 },
  sectionTitle: { fontSize: 15, fontWeight: 700, color: "var(--color-text-deep)" },
  sectionHint: { fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)" },

  storyList: { display: "flex", flexDirection: "column", gap: 10 },
  story: {
    display: "flex",
    gap: 12,
    padding: 14,
    background: "var(--surface-white)",
    border: "1px solid var(--color-divider-card)",
    borderRadius: 12,
  },
  storyIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    background: "var(--color-primary-alpha-12)",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
  },
  storyText: { display: "flex", flexDirection: "column", gap: 4, minWidth: 0 },
  storyTitle: { fontSize: 14, fontWeight: 600, color: "var(--color-text-deep)", lineHeight: 1.4 },
  storyMeta: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 12,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
  },
  storyTag: { display: "inline-flex", alignItems: "center", gap: 4 },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 999,
    background: "var(--color-text-tertiary)",
    flexShrink: 0,
  },

  chatList: { display: "flex", flexDirection: "column" },
  chatRow: {
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
  chatText: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 },
  chatTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "var(--color-text-deep)",
    lineHeight: 1.4,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  chatMeta: { fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)" },

  pill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 2,
    height: 24,
    paddingInline: 8,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 700,
    fontVariantNumeric: "tabular-nums",
  },

  amp: {
    width: "46%",
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    gap: 16,
    minHeight: 0,
    padding: 20,
    background: "var(--surface-white)",
    border: "1px solid var(--color-divider-card)",
    borderRadius: 16,
    boxShadow: "var(--shadow-card)",
  },
  ampHead: { display: "flex", alignItems: "center", gap: 12 },
  ampIconWrap: { width: 40, height: 40, display: "grid", placeItems: "center", flexShrink: 0 },
  ampTitle: { fontSize: 17, fontWeight: 700, color: "var(--color-text-deep)", lineHeight: 1.3 },
  ampSubtitle: { fontSize: 13, fontWeight: 500, color: "var(--color-text-medium)" },

  suggestions: { display: "flex", flexDirection: "column", gap: 8 },
  suggestion: {
    appearance: "none",
    textAlign: "left",
    padding: "12px 14px",
    background: "var(--surface-white)",
    border: "1px solid var(--color-divider-card)",
    borderRadius: 10,
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 500,
    color: "var(--color-text-medium)",
    cursor: "pointer",
    transition: "background 120ms ease",
  },
};
