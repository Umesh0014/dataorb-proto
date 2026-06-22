/* eslint-disable no-restricted-syntax --
   The suggestion cards (Welcome Mat) and the private/public visibility
   switcher in the composer are clickable card / segmented surfaces, not the
   pill/icon/text shapes Button.jsx models — same precedent as VersionBar and
   MiraChatsPage rows. Raw <button> keeps each a single accessible target. */
"use client";

import React from "react";
import { ArrowLeft, Plus, RefreshCw, Lock, Globe } from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import MiraConversation from "./MiraConversation";
import MiraLandingDeck from "./MiraLandingDeck";
import MiraKpiSpace from "./MiraKpiSpace";
import MiraMetricDetail from "./MiraMetricDetail";
import VersionBar from "./VersionBar";
import { LANDING_METRICS } from "./mocks/miraLandingMetrics";
import { MiraStarIcon, ArrowUpIcon } from "./SideNav/icons";

// Named landing directions ride one VersionBar (no "v1/v2" alphabets).
// Launchpad is the adopted ChatGPT-style home (ask box → metric pulse →
// chats); Bento is the same shell with a mixed-size white-tile metric grid;
// KPI Space is the outcome-space surface (KPI rail → trend + stories + chats
// → AMP ask surface); Welcome Mat is the previous centered-greeting design.
const DIRECTIONS = [
  { id: "launchpad", label: "Launchpad", iterations: [] },
  { id: "bento", label: "Bento", iterations: [] },
  { id: "kpispace", label: "KPI Space", iterations: [] },
  { id: "welcome", label: "Welcome Mat", iterations: [] },
];

// Launchpad and Bento share the input-first shell; only the metric band
// differs. Welcome Mat is the parked centered-greeting layout.
const isLaunchpadDirection = (d) => d === "launchpad" || d === "bento";

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
 *   conversations?: Array<{ id: string, firstQuestion: string, createdAt: number, turns: Array<unknown> }>,
 *   onOpenConversation?: (id: string) => void,
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
  conversations = [],
  onOpenConversation,
}) {
  const [query, setQuery] = React.useState("");
  const [direction, setDirection] = React.useState("launchpad");
  const [visibility, setVisibility] = React.useState("public");
  const [selectedMetricId, setSelectedMetricId] = React.useState(null);

  const queriesLeft = Math.max(queriesTotal - queriesUsed, 0);
  const inChat = conversation.length > 0;
  const selectedMetric =
    selectedMetricId != null
      ? LANDING_METRICS.find((m) => m.id === selectedMetricId)
      : null;

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

  const composer = (
    <Composer
      query={query}
      onChange={setQuery}
      onSubmit={() => submit(query)}
      pending={Boolean(pendingTurnId)}
      visibility={visibility}
      onVisibilityChange={setVisibility}
      queriesLeft={queriesLeft}
      queriesTotal={queriesTotal}
    />
  );

  if (inChat) {
    return (
      <div style={s.page}>
        <div style={s.readable}>
          <ChatHeader onBack={resetToHome} onNewChat={resetToHome} />
          <div style={s.chatBody}>
            <MiraConversation
              turns={conversation}
              pendingTurnId={pendingTurnId}
              onSubmitFollowUp={submit}
            />
          </div>
          {composer}
        </div>
      </div>
    );
  }

  if (isLaunchpadDirection(direction) && selectedMetric) {
    return (
      <div style={s.page}>
        <MiraMetricDetail
          metric={selectedMetric}
          onBack={() => setSelectedMetricId(null)}
        />
      </div>
    );
  }

  return (
    <div style={s.page}>
      {isLaunchpadDirection(direction) ? (
        <MiraLandingDeck
          userName={userName}
          composer={composer}
          conversations={conversations}
          onSelectMetric={setSelectedMetricId}
          onOpenConversation={onOpenConversation}
          variant={direction === "bento" ? "bento" : "grid"}
        />
      ) : direction === "kpispace" ? (
        <MiraKpiSpace
          userName={userName}
          composer={composer}
          conversations={conversations}
          onOpenConversation={onOpenConversation}
          onPickSuggestion={(q) => setQuery(q)}
        />
      ) : (
        <div style={s.readable}>
          <div style={s.homeHero}>
            <HomeHero userName={userName} onPickSuggestion={(q) => setQuery(q)} />
          </div>
          {composer}
        </div>
      )}

      <VersionBar
        tabsMode
        versions={DIRECTIONS}
        baselineOptions={[]}
        value={{ versionId: direction, iterationId: null }}
        onChange={({ versionId }) => setDirection(versionId)}
        help={<MiraDirectionsHelp />}
      />
    </div>
  );
}

function MiraDirectionsHelp() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <span style={vbHelp.title}>Four landing directions</span>
      <p style={vbHelp.text}>
        <b>Launchpad</b> — ask box up top, a pulse of every metric category (each
        with a trend vs target), then your recent chats. Open a card for the full
        report and the public chats others have run on it.
      </p>
      <p style={vbHelp.text}>
        <b>Bento</b> — same shell, fewer metrics in a mixed-size grid of white
        tiles: one feature tile, change pills, and bolder numbers. Scan-first.
      </p>
      <p style={vbHelp.text}>
        <b>KPI Space</b> — the outcome-space surface from the ticket: an outcome-KPI
        rail, the selected KPI&apos;s trend with authored Stories + Chats, and the
        AMP ask surface beside it. Outcome-first, not chatbot-first.
      </p>
      <p style={vbHelp.text}>
        <b>Welcome Mat</b> — a calm centered greeting with starter prompts and the
        composer anchored below. The previous design, parked here.
      </p>
      <p style={vbHelp.hint}>
        Ticket: rework Mira&apos;s front surface into a collaborative outcome space —
        authored stories over a blank prompt, default-public explorations, KPIs
        pre-populated. KPI Space is the direct take; the others are lighter homes.
      </p>
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
  visibility,
  onVisibilityChange,
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
          <VisibilitySwitch value={visibility} onChange={onVisibilityChange} />

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

// Private / Public visibility for the chat being composed. Public is the
// default — chats are shareable to the team unless explicitly kept private.
function VisibilitySwitch({ value, onChange }) {
  const options = [
    { id: "private", label: "Private", Icon: Lock },
    { id: "public", label: "Public", Icon: Globe },
  ];
  return (
    <div style={s.visSwitch} role="group" aria-label="Chat visibility">
      {options.map(({ id, label, Icon }) => {
        const active = value === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-pressed={active}
            style={{ ...s.visSeg, ...(active ? s.visSegActive : null) }}
          >
            <Icon
              size={14}
              color={active ? "var(--color-button-primary-bg)" : "var(--color-text-medium)"}
            />
            <span>{label}</span>
          </button>
        );
      })}
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

  // Centered, readable cap for the states that shouldn't stretch when the
  // landing route runs full-width (chat thread, Welcome Mat). KPI Space and
  // the Launchpad/Bento decks self-size instead.
  readable: {
    width: "100%",
    maxWidth: 880,
    marginInline: "auto",
    flex: 1,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
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
  visSwitch: {
    display: "inline-flex",
    alignItems: "center",
    gap: 2,
    padding: 2,
    borderRadius: 8,
    border: "1px solid var(--color-divider-card)",
    background: "var(--surface-white)",
  },
  visSeg: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    height: 28,
    paddingInline: 10,
    borderRadius: 6,
    border: "none",
    background: "transparent",
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 500,
    color: "var(--color-text-medium)",
    cursor: "pointer",
  },
  visSegActive: {
    background: "var(--color-primary-alpha-12)",
    color: "var(--color-button-primary-bg)",
    fontWeight: 600,
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

const vbHelp = {
  title: { fontSize: 13, fontWeight: 700, color: "var(--vb-txt)" },
  text: { margin: 0, fontSize: 12, lineHeight: 1.5, color: "var(--vb-txt)" },
  hint: { margin: "4px 0 0", fontSize: 11, lineHeight: 1.5, color: "var(--vb-muted)" },
};
