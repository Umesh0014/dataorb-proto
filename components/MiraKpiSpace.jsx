/* eslint-disable no-restricted-syntax --
   The KPI list items, story rows, suggestion chips, chat rows, AMP collapse
   button, and the floating action button are clickable list / row / icon
   surfaces, not the pill/icon/text shapes Button.jsx models — same precedent
   as MiraLandingDeck and VersionBar. Raw <button> keeps each a single
   accessible target. */
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
 * Two cards on the canvas surface. The left card has one background but two
 * columns inside: an Outcome rail (KPI selector) and the Outcome details
 * (trend, Stories, Chats). Clicking a Story opens its authored detail inline
 * inside the left card (back arrow; the AMP card stays put). The right card
 * is the AMP ask surface, collapsible into a labelled floating button.
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

  return (
    <div style={s.space}>
      <div style={s.col}>
        {openStory ? (
          <div style={s.storyWrap}>
            <MiraStoryDetail story={openStory} onBack={() => setOpenStoryId(null)} />
          </div>
        ) : (
          <div style={s.cardInner}>
            <div style={s.outcomeCol}>
              <div style={s.outcomeColTitle}>Outcomes</div>
              {OUTCOME_KPIS.map((kpi) => (
                <KpiListItem
                  key={kpi.id}
                  kpi={kpi}
                  active={kpi.id === selectedId}
                  onClick={() => setSelectedId(kpi.id)}
                />
              ))}
            </div>

            <div style={s.vSep} />

            <div style={s.detailsCol}>
              <div style={s.outcomeHeader}>
                <span style={s.outcomeLabel}>{selected.label}</span>
                <div style={s.outcomeValueRow}>
                  <span style={s.outcomeValue}>{selected.value}</span>
                  <ChangePill change={selected.change} />
                </div>
              </div>

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
          </div>
        )}
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
          aria-label="Open Ask Mira Pro"
          style={s.fab}
        >
          <span style={s.fabIcon} aria-hidden="true">
            <MiraStarIcon size={20} color="var(--surface-white)" />
          </span>
          Ask Mira Pro
        </button>
      )}
    </div>
  );
}

function KpiListItem({ kpi, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{ ...s.kpiItem, ...(active ? s.kpiItemActive : null) }}
    >
      <span style={{ ...s.kpiDot, background: kpi.accent }} aria-hidden="true" />
      <span style={s.kpiText}>
        <span style={s.kpiLabel}>{kpi.label}</span>
        <span style={s.kpiValue}>{kpi.value}</span>
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

  // Left card: single background, two columns inside (or the inline story).
  col: {
    ...CARD,
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
    overflow: "hidden",
  },
  cardInner: { flex: 1, display: "flex", flexDirection: "row", minHeight: 0 },
  storyWrap: { flex: 1, minHeight: 0, display: "flex", flexDirection: "column", padding: 20 },

  outcomeCol: {
    width: 220,
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    gap: 4,
    padding: 16,
    overflowY: "auto",
  },
  outcomeColTitle: {
    fontSize: 12,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    color: "var(--color-text-tertiary)",
    padding: "2px 10px 8px",
  },
  kpiItem: {
    appearance: "none",
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "100%",
    textAlign: "left",
    padding: "10px 10px",
    borderRadius: 10,
    border: "1px solid transparent",
    background: "transparent",
    cursor: "pointer",
    fontFamily: "var(--font-sans)",
    transition: "background 120ms ease, border-color 120ms ease",
  },
  kpiItemActive: {
    background: "var(--color-primary-alpha-04)",
    borderColor: "var(--color-button-primary-bg)",
  },
  kpiDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  kpiText: { display: "flex", flexDirection: "column", gap: 2, minWidth: 0 },
  kpiLabel: { fontSize: 13, fontWeight: 600, color: "var(--color-text-deep)" },
  kpiValue: { fontSize: 12, fontWeight: 600, color: "var(--color-text-tertiary)", fontVariantNumeric: "tabular-nums" },

  vSep: { width: 1, background: "var(--color-divider-card)", flexShrink: 0 },

  detailsCol: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 16,
    padding: 20,
    overflowY: "auto",
  },
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
    height: 52,
    paddingInline: 18,
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    borderRadius: 26,
    border: "none",
    background: "var(--color-button-primary-bg)",
    boxShadow: "var(--shadow-16)",
    color: "var(--surface-white)",
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    zIndex: 60,
  },
  fabIcon: { display: "grid", placeItems: "center", flexShrink: 0 },
};
