"use client";

import React from "react";
import {
  Brain,
  Snowflake,
  Check,
  Copy,
  Sparkle,
  ChevronRight,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import { MiraStarIcon } from "./SideNav/icons";

/**
 * MiraConversation — renders the chat thread for Ask Mira Pro.
 *
 * @param {{
 *   turns: Array<{ id: string, question: string, response: object | null }>,
 *   pendingTurnId: string | null,
 *   onSubmitFollowUp: (text: string) => void,
 * }} props
 */
export default function MiraConversation({ turns, pendingTurnId, onSubmitFollowUp }) {
  return (
    <div style={s.thread}>
      {turns.map((turn) => (
        <Turn
          key={turn.id}
          turn={turn}
          pending={pendingTurnId === turn.id}
          onSubmitFollowUp={onSubmitFollowUp}
        />
      ))}
    </div>
  );
}

function Turn({ turn, pending, onSubmitFollowUp }) {
  return (
    <div style={s.turn}>
      <UserMessage text={turn.question} />
      {pending ? <Thinking /> : turn.response && (
        <ResponseBlock response={turn.response} onSubmitFollowUp={onSubmitFollowUp} />
      )}
    </div>
  );
}

function UserMessage({ text }) {
  return (
    <div style={s.userRow}>
      <div style={s.userAvatar} aria-hidden="true">U</div>
      <span style={s.userText}>{text}</span>
    </div>
  );
}

function Thinking() {
  return (
    <div style={s.thinkingRow}>
      <span style={s.thinkingSpinner} aria-hidden="true">
        <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--color-button-primary-bg)" }}>
          progress_activity
        </span>
      </span>
      <span style={s.thinkingText}>Thinking…</span>
    </div>
  );
}

function ResponseBlock({ response, onSubmitFollowUp }) {
  return (
    <div style={s.responseBlock}>
      <ThoughtBlock text={response.thought} />
      <p style={s.narrative}>{response.narrative}</p>
      <ToolChip label={response.tool.label} status={response.tool.status} />
      <AnswerBody answer={response.answer} />
      <TokenChip label={response.tokens} />
      <FollowUpSection items={response.followUps} onSelect={onSubmitFollowUp} />
    </div>
  );
}

function ThoughtBlock({ text }) {
  const [expanded, setExpanded] = React.useState(false);
  return (
    <div style={s.thoughtBlock}>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        style={s.thoughtHeader}
        aria-expanded={expanded}
      >
        <span style={s.thoughtIconWrap} aria-hidden="true">
          <Brain size={16} color="var(--color-secondary-500)" />
        </span>
        <span style={s.thoughtLabel}>Thought</span>
        <div style={{ flex: 1 }} />
        <ChevronDown
          size={18}
          color="var(--color-text-tertiary)"
          style={{
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 200ms",
          }}
        />
      </button>
      {expanded && <p style={s.thoughtBody}>{text}</p>}
    </div>
  );
}

function ToolChip({ label, status }) {
  return (
    <div style={s.toolChip}>
      <span style={s.toolIconWrap} aria-hidden="true">
        <Snowflake size={16} color="var(--color-button-primary-bg)" />
      </span>
      <span style={s.toolLabel}>{label}</span>
      <span style={s.statusBadge}>
        <Check size={12} color="var(--color-success)" />
        <span>{status}</span>
      </span>
    </div>
  );
}

function AnswerBody({ answer }) {
  return (
    <div style={s.answer}>
      <p style={s.answerText}>{answer.intro}</p>
      <ul style={s.answerList}>
        {answer.bullets.map((b) => (
          <li key={b.bold} style={s.answerBullet}>
            <strong style={s.bulletBold}>{b.bold}</strong>
            <span style={s.bulletDash}> – </span>
            <span>{b.rest}</span>
          </li>
        ))}
      </ul>
      <p style={{ ...s.answerText, fontWeight: 700 }}>{answer.followUpHeader}</p>
      <ul style={s.answerList}>
        {answer.followUpBullets.map((line) => (
          <li key={line} style={s.answerBullet}>{line}</li>
        ))}
      </ul>
      <p style={s.answerText}>{answer.closing}</p>
    </div>
  );
}

function TokenChip({ label }) {
  return (
    <div style={s.tokenRow}>
      <button
        type="button"
        aria-label="Copy response"
        style={s.tokenCopyBtn}
        onClick={() => {}}
      >
        <Copy size={14} color="var(--color-text-tertiary)" />
      </button>
      <span style={s.tokenChip}>{label}</span>
    </div>
  );
}

function FollowUpSection({ items, onSelect }) {
  return (
    <div style={s.followUpSection}>
      <div style={s.followUpHeader}>
        <Sparkle size={16} color="var(--color-button-primary-bg)" />
        <span style={s.followUpHeaderText}>Follow-up Questions</span>
      </div>
      <div style={s.followUpList}>
        {items.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onSelect?.(q)}
            style={s.followUpRow}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-card-emoji-bg)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            <span style={s.followUpText}>{q}</span>
            <ArrowRight size={16} color="var(--color-text-tertiary)" />
          </button>
        ))}
      </div>
    </div>
  );
}

const s = {
  thread: {
    display: "flex",
    flexDirection: "column",
    gap: 32,
    paddingBottom: 16,
  },

  turn: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },

  userRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "var(--color-card-emoji-bg)",
    borderRadius: 10,
    padding: "14px 18px",
  },
  userAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    background: "var(--color-icon-tertiary-bg)",
    color: "var(--color-icon-tertiary-fg)",
    display: "grid",
    placeItems: "center",
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    fontWeight: 700,
    flexShrink: 0,
  },
  userText: {
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    fontWeight: 500,
    color: "var(--color-text-deep)",
    lineHeight: 1.5,
  },

  thinkingRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 14px",
    border: "1px solid var(--color-divider-card)",
    borderRadius: 10,
  },
  thinkingSpinner: {
    width: 22,
    height: 22,
    display: "grid",
    placeItems: "center",
    animation: "spin 1.2s linear infinite",
  },
  thinkingText: {
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text-medium)",
  },

  responseBlock: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },

  thoughtBlock: {
    border: "1px solid var(--color-divider-card)",
    borderRadius: 10,
    overflow: "hidden",
  },
  thoughtHeader: {
    appearance: "none",
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 14px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text-medium)",
    textAlign: "left",
  },
  thoughtIconWrap: {
    display: "grid",
    placeItems: "center",
    width: 22,
    height: 22,
    borderRadius: 11,
    background: "var(--color-icon-tertiary-bg)",
    flexShrink: 0,
  },
  thoughtLabel: {
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text-medium)",
  },
  thoughtBody: {
    margin: 0,
    padding: "0 14px 14px",
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
    lineHeight: 1.6,
  },

  narrative: {
    margin: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    fontWeight: 500,
    color: "var(--color-text-deep)",
    lineHeight: 1.6,
  },

  toolChip: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 14px",
    border: "1px solid var(--color-divider-card)",
    borderRadius: 10,
  },
  toolIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    background: "var(--color-primary-alpha-12)",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
  },
  toolLabel: {
    flex: 1,
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text-deep)",
  },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    height: 22,
    paddingInline: 8,
    borderRadius: 11,
    background: "var(--color-success-bg)",
    color: "var(--color-success)",
    fontFamily: "var(--font-sans)",
    fontSize: 11,
    fontWeight: 700,
  },

  answer: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  answerText: {
    margin: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    fontWeight: 500,
    color: "var(--color-text-deep)",
    lineHeight: 1.6,
  },
  answerList: {
    margin: 0,
    paddingLeft: 24,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  answerBullet: {
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    fontWeight: 500,
    color: "var(--color-text-deep)",
    lineHeight: 1.6,
  },
  bulletBold: { fontWeight: 700 },
  bulletDash: { color: "var(--color-text-medium)" },

  tokenRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
    paddingTop: 4,
  },
  tokenCopyBtn: {
    appearance: "none",
    border: "none",
    background: "transparent",
    width: 28,
    height: 28,
    borderRadius: 6,
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
  },
  tokenChip: {
    display: "inline-flex",
    alignItems: "center",
    height: 28,
    paddingInline: 12,
    borderRadius: 6,
    background: "var(--color-card-emoji-bg)",
    border: "1px solid var(--color-divider-card)",
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    fontWeight: 600,
    color: "var(--color-text-medium)",
  },

  followUpSection: {
    paddingTop: 16,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  followUpHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    paddingBottom: 4,
  },
  followUpHeaderText: {
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 700,
    color: "var(--color-text-deep)",
  },
  followUpList: {
    display: "flex",
    flexDirection: "column",
  },
  followUpRow: {
    appearance: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    padding: "14px 4px",
    background: "transparent",
    border: "none",
    borderBottom: "1px solid var(--color-divider-card)",
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 500,
    color: "var(--color-text-medium)",
    textAlign: "left",
    cursor: "pointer",
    transition: "background 120ms ease",
  },
  followUpText: {
    flex: 1,
    paddingRight: 16,
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 500,
    color: "var(--color-text-medium)",
  },
};
