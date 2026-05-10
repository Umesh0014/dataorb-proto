"use client";

import React from "react";
import { Plus, Search } from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import { formatRelativeTime } from "./mocks/miraConversation";

/**
 * MiraChatsPage — Ask Mira Pro module's "Chats" history view.
 *
 * Top-level page accessed from the History side-nav icon. Lists all
 * Mira conversations newest-first; clicking a row loads that
 * conversation into the home route's chat state.
 *
 * @param {{
 *   conversations: Array<{ id: string, firstQuestion: string, createdAt: number }>,
 *   onOpen: (id: string) => void,
 *   onNewChat: () => void,
 * }} props
 */
export default function MiraChatsPage({ conversations, onOpen, onNewChat }) {
  const [search, setSearch] = React.useState("");
  const sorted = React.useMemo(
    () => [...conversations].sort((a, b) => b.createdAt - a.createdAt),
    [conversations]
  );

  return (
    <div style={s.page}>
      <Card padX={28} padY={20} style={s.headerCard}>
        <div style={s.headerRow}>
          <span style={s.headerTitle}>Chats</span>
          <div style={{ flex: 1 }} />
          <Button
            variant="primary"
            leadingIcon={<Plus size={16} />}
            onClick={onNewChat}
          >
            New Chat
          </Button>
        </div>
      </Card>

      <Card padX={28} padY={24} style={s.listCard}>
        <div style={s.searchWrap}>
          <Search size={18} color="var(--color-text-placeholder)" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chats..."
            aria-label="Search chats"
            style={s.searchInput}
          />
        </div>

        <div style={s.sectionLabel}>{sorted.length} chats with Mira</div>

        <div style={s.list}>
          {sorted.map((c) => (
            <ChatRow
              key={c.id}
              conversation={c}
              onClick={() => onOpen(c.id)}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}

function ChatRow({ conversation, onClick }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...s.row,
        background: hovered ? "var(--color-card-emoji-bg)" : "transparent",
      }}
    >
      <span style={s.rowTitle}>{conversation.firstQuestion}</span>
      <span style={s.rowTimestamp}>
        {formatRelativeTime(conversation.createdAt)}
      </span>
    </button>
  );
}

const s = {
  page: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 24,
    minHeight: 0,
    fontFamily: "var(--font-sans)",
  },

  headerCard: { flexShrink: 0 },
  headerRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  headerTitle: {
    fontFamily: "var(--font-sans)",
    fontSize: 20,
    fontWeight: 700,
    color: "var(--color-text-deep)",
  },

  listCard: {
    flex: 1,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },

  searchWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid var(--color-divider-card)",
    background: "var(--surface-white)",
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    border: "none",
    outline: "none",
    background: "transparent",
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    color: "var(--color-text-deep)",
  },

  sectionLabel: {
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text-tertiary)",
    flexShrink: 0,
    paddingTop: 4,
    borderBottom: "1px solid var(--color-divider-card)",
    paddingBottom: 12,
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
    padding: "16px 12px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
    borderBottom: "1px solid var(--color-divider-card)",
    cursor: "pointer",
    transition: "background 120ms ease",
    borderRadius: 6,
  },
  rowTitle: {
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    fontWeight: 600,
    color: "var(--color-text-deep)",
    lineHeight: 1.4,
  },
  rowTimestamp: {
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
  },
};
