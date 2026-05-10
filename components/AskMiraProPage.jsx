"use client";

import React from "react";
import { ArrowLeft, Plus, RefreshCw } from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import MiraConversation from "./MiraConversation";
import {
  MiraStarIcon,
  TuneIcon,
  FilterFunnelIcon,
  ArrowUpIcon,
} from "./SideNav/icons";

const SUGGESTED_QUESTIONS = [
  "What are the top pain points reported by customers this month?",
  "Which customer segments are most at-risk and what proactive interventions could prevent churn?",
  "Which products generate the highest satisfaction vs. complaint volumes?",
  "What contact reasons take longest to resolve and face the most impediments?",
  "What educational content gaps exist based on common customer questions?",
  "What pricing feedback appears in dissatisfied customer interactions?",
];

/**
 * AskMiraProPage — Ask Mira Pro module home route.
 *
 * Two states share the same route:
 *   - Home  (no conversation)  : centered greeting + suggested-question grid + composer
 *   - Chat  (>= 1 turn)        : header band + conversation thread + composer
 *
 * Conversation, pending, queriesUsed, and panel state are all controlled
 * by the parent (app/page.jsx). Lifting them avoids state loss when
 * PageLayout swaps its inner layout component (DockedRow ↔ CenteredColumn)
 * as the right panel opens/closes.
 *
 * @param {{
 *   userName?: string,
 *   queriesTotal?: number,
 *   conversation: Array<{ id: string, question: string, response: object | null }>,
 *   pendingTurnId: string | null,
 *   queriesUsed: number,
 *   onSubmit: (text: string) => void,
 *   onReset: () => void,
 *   setupContextOpen?: boolean,
 *   onToggleSetupContext?: () => void,
 * }} props
 */
export default function AskMiraProPage({
  userName = "Demo Internal",
  queriesTotal = 1002,
  conversation,
  pendingTurnId,
  queriesUsed,
  onSubmit,
  onReset,
  setupContextOpen = false,
  onToggleSetupContext,
}) {
  const [query, setQuery] = React.useState("");

  const queriesLeft = Math.max(queriesTotal - queriesUsed, 0);
  const inChat = conversation.length > 0;

  const submit = (text) => {
    const value = text.trim();
    if (!value) return;
    if (pendingTurnId) return;
    onSubmit(value);
    setQuery("");
  };

  const resetToHome = () => {
    onReset();
    setQuery("");
  };

  return (
    <div style={s.page}>
      {inChat ? (
        <ChatHeader onBack={resetToHome} onNewChat={resetToHome} />
      ) : null}

      <div style={inChat ? s.chatBody : s.homeHero}>
        {inChat ? (
          <MiraConversation
            turns={conversation}
            pendingTurnId={pendingTurnId}
            onSubmitFollowUp={submit}
          />
        ) : (
          <HomeHero
            userName={userName}
            onPickSuggestion={(q) => setQuery(q)}
          />
        )}
      </div>

      <Composer
        query={query}
        onChange={setQuery}
        onSubmit={() => submit(query)}
        pending={Boolean(pendingTurnId)}
        setupContextOpen={setupContextOpen}
        onToggleSetupContext={onToggleSetupContext}
        queriesLeft={queriesLeft}
        queriesTotal={queriesTotal}
      />
    </div>
  );
}

function ChatHeader({ onBack, onNewChat }) {
  return (
    <Card padX={20} padY={14} style={s.chatHeaderCard}>
      <div style={s.chatHeaderRow}>
        <Button variant="icon" aria-label="Back to home" onClick={onBack}>
          <ArrowLeft size={20} color="var(--color-text-medium)" />
        </Button>
        <span style={s.chatHeaderTitle}>Ask Mira Pro</span>
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
  );
}

function HomeHero({ userName, onPickSuggestion }) {
  return (
    <div style={s.heroInner}>
      <div style={s.greetingRow}>
        <div style={s.greetingIconWrap} aria-hidden="true">
          <MiraStarIcon size={40} color="var(--color-button-primary-bg)" />
        </div>
        <div style={s.greetingText}>
          <div style={s.greetingHeading}>Hello, {userName}!</div>
          <div style={s.greetingSubtitle}>
            Unlock actionable insights from every customer interaction.
          </div>
        </div>
      </div>

      <div style={s.grid} role="list">
        {SUGGESTED_QUESTIONS.map((q) => (
          <button
            key={q}
            type="button"
            role="listitem"
            onClick={() => onPickSuggestion(q)}
            style={s.suggestionCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--color-card-emoji-bg)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--surface-white)";
            }}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

function Composer({
  query,
  onChange,
  onSubmit,
  pending,
  setupContextOpen,
  onToggleSetupContext,
  queriesLeft,
  queriesTotal,
}) {
  return (
    <div style={s.composerWrap}>
      <Card tone="outline" padX={20} padY={16} style={s.composerCard}>
        <input
          type="text"
          value={query}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") onSubmit(); }}
          placeholder="Ask a question..."
          aria-label="Ask a question"
          style={s.input}
        />

        <div style={s.composerFooter}>
          <div style={s.chipRow}>
            <button type="button" style={s.chip} onClick={() => {}}>
              <TuneIcon size={16} color="var(--color-text-medium)" />
              <span>Graph</span>
            </button>
            <button
              type="button"
              style={{
                ...s.chip,
                ...(setupContextOpen ? s.chipActive : null),
              }}
              onClick={() => onToggleSetupContext?.()}
            >
              <FilterFunnelIcon size={16} color={setupContextOpen ? "var(--color-button-primary-bg)" : "var(--color-text-medium)"} />
              <span style={setupContextOpen ? { color: "var(--color-button-primary-bg)" } : null}>Setup Context</span>
              <span style={s.chipBadge}>1</span>
            </button>
          </div>

          <Button
            variant="icon"
            size="md"
            aria-label={pending ? "Generating" : "Send"}
            onClick={pending ? () => {} : onSubmit}
            style={s.sendBtn}
          >
            {pending ? (
              <RefreshCw size={16} color="var(--color-text-medium)" />
            ) : (
              <ArrowUpIcon size={18} color="var(--color-text-medium)" />
            )}
          </Button>
        </div>
      </Card>

      <div style={s.disclaimerRow}>
        <span style={s.disclaimerText}>
          MIRA can make mistakes, please check the answers
        </span>
        <span style={s.disclaimerText}>
          {queriesLeft} of {queriesTotal} queries left.
        </span>
      </div>
    </div>
  );
}

const s = {
  page: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
    fontFamily: "var(--font-sans)",
    gap: 16,
  },

  chatHeaderCard: {
    flexShrink: 0,
  },
  chatHeaderRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  chatHeaderTitle: {
    fontFamily: "var(--font-sans)",
    fontSize: 16,
    fontWeight: 700,
    color: "var(--color-text-deep)",
  },

  homeHero: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    minHeight: 0,
  },
  heroInner: {
    display: "flex",
    flexDirection: "column",
    gap: 32,
    width: "100%",
    maxWidth: 760,
    marginInline: "auto",
  },

  chatBody: {
    flex: 1,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
  },

  greetingRow: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  greetingIconWrap: {
    width: 48,
    height: 48,
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
  },
  greetingText: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  greetingHeading: {
    fontSize: 20,
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

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 16,
  },
  suggestionCard: {
    appearance: "none",
    textAlign: "left",
    padding: "20px 20px",
    minHeight: 116,
    background: "var(--surface-white)",
    border: "1px solid var(--color-divider-card)",
    borderRadius: 12,
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 500,
    color: "var(--color-text-medium)",
    lineHeight: 1.5,
    cursor: "pointer",
    transition: "background 120ms ease",
  },

  composerWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    flexShrink: 0,
  },
  composerCard: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  input: {
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    color: "var(--color-text-deep)",
    padding: "4px 0",
  },
  composerFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  chipRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  chip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    height: 32,
    paddingInline: 12,
    borderRadius: 8,
    border: "1px solid var(--color-divider-card)",
    background: "var(--surface-white)",
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 500,
    color: "var(--color-text-medium)",
    cursor: "pointer",
  },
  chipActive: {
    border: "1px solid var(--color-button-primary-bg)",
    background: "var(--color-primary-alpha-04)",
  },
  chipBadge: {
    minWidth: 18,
    height: 18,
    padding: "0 5px",
    borderRadius: 9,
    background: "var(--color-primary-alpha-12)",
    color: "var(--color-button-primary-bg)",
    fontFamily: "var(--font-sans)",
    fontSize: 11,
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtn: {
    border: "1px solid var(--color-divider-card)",
  },

  disclaimerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingInline: 4,
  },
  disclaimerText: {
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
  },
};
