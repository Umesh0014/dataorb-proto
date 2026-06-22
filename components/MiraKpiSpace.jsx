/* eslint-disable no-restricted-syntax --
   The KPI selector chips, story rows, suggestion chips, chat rows, AMP
   collapse button, and the floating action button are clickable chip / row /
   icon surfaces, not the pill/icon/text shapes Button.jsx models — same
   precedent as MiraLandingDeck and VersionBar. Raw <button> keeps each a
   single accessible target. */
"use client";

import React from "react";
import { ChevronRight, ArrowUpRight, ArrowDownRight, Lock, Globe, Pin, Minimize2 } from "lucide-react";
import KpiTrendChart from "./KpiTrendChart";
import MiraStoryDetail from "./MiraStoryDetail";
import { MiraStarIcon } from "./SideNav/icons";
import { OUTCOME_KPIS, SPACE_STORIES, kpiSuggestions } from "./mocks/miraKpiSpace";
import { formatRelativeTime } from "./mocks/miraConversation";

/**
 * MiraKpiSpace — the "KPI Space" landing direction (outcome-space surface).
 *
 * Two cards on the canvas surface: the left card holds the Outcome (KPI
 * selector + headline) and, below a separator, the Outcome details (trend,
 * Stories, Chats); the right card is the AMP ask surface, collapsible into a
 * floating action button. Clicking a Story opens its authored detail.
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
  const [openStoryId, setOpenStoryId] = React.useState(null);
  const [ampCollapsed, setAmpCollapsed] = React.useState(false);
  const selected = OUTCOME_KPIS.find((k) => k.id === selectedId) || OUTCOME_KPIS[0];

  const recentChats = React.useMemo(
    () => [...conversations].sort((a, b) => b.createdAt - a.createdAt).slice(0, 3),
    [conversations]
  );

  const openStory = openStoryId ? SPACE_STORIES.find((st) => st.id === openStoryId) : null;
  if (openStory) {
    return <MiraStoryDetail story={openStory} onBack={() => setOpenStoryId(null)} />;
  }

  return (
    <div style={s.space}>
      <div style={s.col}>
        {/* Outcome */}
        <div style={s.chips} role="list" aria-label="Outcome KPIs">
          {OUTCOME_KPIS.map((kpi) => (
            <KpiChip
              key={kpi.id}
              kpi={kpi}
              active={kpi.id === selectedId}
              onClick={() => setSelectedId(kpi.id)}
            />
          ))}
        </div>
        <div style={s.outcomeHeader}>
          <span style={s.outcomeLabel}>{selected.label}</span>
          <div style={s.outcomeValueRow}>
            <span style={s.outcomeValue}>{selected.value}</span>
            <ChangePill change={selected.change} />
          </div>
        </div>

        <div style={s.separator} />

        {/* Outcome details */}
        <div style={s.detailBlock}>
          <div style={s.detailHead}>Trend · last 8 months</div>
          <KpiTrendChart kpi={selected} />
        </div>

        <div style={s.detailBlock}>
          <div style={s.sectionTitle}>
            Stories
            <span style={s.sectionHint}>Authored by Mira · viewable by everyone</span>
          </div>
          <div style={s.storyList}>
            {SPACE_STORIES.map((story) => (
              <StoryRow key={story.id} story={story} onClick={() => setOpenStoryId(story.id)} />
            ))}
          </div>
        </div>

        <div style={s.detailBlock}>
          <div style={s.sectionTitle}>Chats</div>
          <div style={s.chatList}>
            {recentChats.map((c) => (
              <ChatRow key={c.id} conversation={c} onClick={() => onOpenConversation(c.id)} />
            ))}
          </div>
        </div>
      </div>

      {!ampCollapsed && (
        <div style={s.amp}>
          <div style={s.ampHead}>
            <div style={s.ampIconWrap} aria-hidden="true">
              <MiraStarIcon size={28} color="var(--color-button-primary-bg)" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={s.ampTitle}>Ask about {selected.label}</div>
              <div style={s.ampSubtitle}>
                Run analysis right beside the outcome, {userName.split(" ")[0]}.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAmpCollapsed(true)}
              aria-label="Collapse Mira"
              title="Collapse Mira"
              style={s.ampCollapseBtn}
            >
              <Minimize2 size={16} color="var(--color-text-medium)" />
            </button>
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
      )}

      {ampCollapsed && (
        <button
          type="button"
          onClick={() => setAmpCollapsed(false)}
          aria-label="Open Mira"
          title="Open Mira"
          style={s.fab}
        >
          <MiraStarIcon size={26} color="var(--surface-white)" />
        </button>
      )}
    </div>
  );
}

function KpiChip({ kpi, active, onClick }) {
  return (
    <button
      type="button"
      role="listitem"
      onClick={onClick}
      aria-pressed={active}
      style={{ ...s.chip, ...(active ? s.chipActive : null) }}
    >
      <span style={{ ...s.chipDot, background: kpi.accent }} aria-hidden="true" />
      <span style={s.chipLabel}>{kpi.label}</span>
      <span style={s.chipValue}>{kpi.value}</span>
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

function StoryRow({ story, onClick }) {
  const [hovered, setHovered] = React.useState(false);
  const isPublic = story.visibility === "public";
  const VisIcon = isPublic ? Globe : Lock;
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ ...s.storyRow, background: hovered ? "var(--color-card-emoji-bg)" : "transparent" }}
    >
      <span style={s.storyIconWrap} aria-hidden="true">
        <MiraStarIcon size={16} color="var(--color-button-primary-bg)" />
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
      <ChevronRight
        size={18}
        color="var(--color-text-tertiary)"
        style={{ opacity: hovered ? 1 : 0, transition: "opacity 120ms ease", flexShrink: 0, alignSelf: "center" }}
      />
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

const CARD = {
  background: "var(--surface-white)",
  border: "1px solid var(--color-divider-card)",
  borderRadius: 16,
  boxSizing: "border-box",
};

const s = {
  space: { display: "flex", gap: 16, flex: 1, minHeight: 0, fontFamily: "var(--font-sans)" },

  col: {
    ...CARD,
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 16,
    padding: 20,
    overflowY: "auto",
  },

  chips: { display: "flex", flexWrap: "wrap", gap: 8 },
  chip: {
    appearance: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    height: 34,
    paddingInline: 12,
    borderRadius: 10,
    border: "1px solid var(--color-divider-card)",
    background: "var(--surface-white)",
    cursor: "pointer",
    fontFamily: "var(--font-sans)",
    transition: "border-color 120ms ease, background 120ms ease",
  },
  chipActive: {
    borderColor: "var(--color-button-primary-bg)",
    background: "var(--color-primary-alpha-12)",
  },
  chipDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  chipLabel: { fontSize: 13, fontWeight: 600, color: "var(--color-text-deep)" },
  chipValue: { fontSize: 13, fontWeight: 700, color: "var(--color-text-tertiary)", fontVariantNumeric: "tabular-nums" },

  outcomeHeader: { display: "flex", flexDirection: "column", gap: 2 },
  outcomeLabel: { fontSize: 13, fontWeight: 600, color: "var(--color-text-tertiary)" },
  outcomeValueRow: { display: "flex", alignItems: "baseline", gap: 10 },
  outcomeValue: {
    fontSize: 30,
    fontWeight: 800,
    color: "var(--color-text-deep)",
    lineHeight: 1.1,
    fontVariantNumeric: "tabular-nums",
  },

  separator: { height: 1, background: "var(--color-divider-card)", flexShrink: 0 },

  detailBlock: { display: "flex", flexDirection: "column", gap: 10 },
  detailHead: { fontSize: 13, fontWeight: 600, color: "var(--color-text-medium)" },
  sectionTitle: {
    display: "flex",
    alignItems: "baseline",
    gap: 10,
    fontSize: 15,
    fontWeight: 700,
    color: "var(--color-text-deep)",
  },
  sectionHint: { fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)" },

  storyList: { display: "flex", flexDirection: "column" },
  storyRow: {
    appearance: "none",
    border: "none",
    width: "100%",
    textAlign: "left",
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    padding: "12px 10px",
    borderBottom: "1px solid var(--color-divider-card)",
    borderRadius: 8,
    cursor: "pointer",
    fontFamily: "var(--font-sans)",
    transition: "background 120ms ease",
  },
  storyIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 8,
    background: "var(--color-primary-alpha-12)",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    marginTop: 1,
  },
  storyText: { display: "flex", flexDirection: "column", gap: 4, minWidth: 0, flex: 1 },
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
  metaDot: { width: 3, height: 3, borderRadius: 999, background: "var(--color-text-tertiary)", flexShrink: 0 },

  chatList: { display: "flex", flexDirection: "column" },
  chatRow: {
    appearance: "none",
    border: "none",
    width: "100%",
    textAlign: "left",
    padding: "12px 10px",
    display: "flex",
    alignItems: "center",
    gap: 12,
    borderBottom: "1px solid var(--color-divider-card)",
    borderRadius: 8,
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
    ...CARD,
    width: "38%",
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    gap: 16,
    minHeight: 0,
    padding: 20,
  },
  ampHead: { display: "flex", alignItems: "center", gap: 12 },
  ampIconWrap: { width: 40, height: 40, display: "grid", placeItems: "center", flexShrink: 0 },
  ampTitle: { fontSize: 17, fontWeight: 700, color: "var(--color-text-deep)", lineHeight: 1.3 },
  ampSubtitle: { fontSize: 13, fontWeight: 500, color: "var(--color-text-medium)" },
  ampCollapseBtn: {
    appearance: "none",
    width: 32,
    height: 32,
    borderRadius: 8,
    border: "1px solid var(--color-divider-card)",
    background: "var(--surface-white)",
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
    flexShrink: 0,
  },

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

  fab: {
    position: "fixed",
    bottom: 96,
    insetInlineEnd: 28,
    width: 56,
    height: 56,
    borderRadius: 28,
    border: "none",
    background: "var(--color-button-primary-bg)",
    boxShadow: "var(--shadow-16)",
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
    zIndex: 60,
  },
};
