"use client";

import React from "react";
import { ChevronRight, Plus, RefreshCw } from "lucide-react";
import MiraConversation from "./MiraConversation";
import Button from "./Button";
import {
  MiraStarIcon, TuneIcon, FilterFunnelIcon, ArrowUpIcon,
} from "./SideNav/icons";
import { SUGGESTED, SPACE } from "./mocks/miraSpace";

// MiraChatColumn — chat demoted to a collapsible right-hand column inside the
// outcome space (not a takeover surface). Collapsed = a slim sticky rail with
// an open affordance; expanded = a ~360px column carrying the conversation
// thread (or a scoped empty state) over a composer. Reuses MiraConversation
// for the thread and the existing Setup Context wiring untouched (G6). State
// (open/closed, draft) is in-memory only (G5).

export default function MiraChatColumn({
  open,
  onToggle,
  conversation,
  pendingTurnId,
  queriesUsed,
  queriesTotal = 1002,
  onSubmit,
  onReset,
  setupContextOpen,
  onToggleSetupContext,
}) {
  const [query, setQuery] = React.useState("");
  const inChat = conversation.length > 0;
  const pending = Boolean(pendingTurnId);
  const queriesLeft = Math.max(queriesTotal - queriesUsed, 0);

  const submit = (text) => {
    const value = (text ?? query).trim();
    if (!value || pending) return;
    onSubmit(value);
    setQuery("");
  };

  if (!open) {
    return (
      <aside style={s.rail}>
        <button
          type="button"
          onClick={() => onToggle(true)}
          aria-label="Open Ask Mira chat"
          aria-expanded={false}
          style={s.railBtn}
        >
          <MiraStarIcon size={20} color="var(--color-button-primary-bg)" />
          <span style={s.railLabel}>Ask Mira</span>
          {inChat && <span style={s.railDot} aria-hidden="true" />}
        </button>
      </aside>
    );
  }

  return (
    <aside style={s.col} aria-label="Ask Mira chat">
      <header style={s.head}>
        <span style={s.headTitle}>
          <MiraStarIcon size={18} color="var(--color-button-primary-bg)" />
          Ask Mira
        </span>
        <div style={{ flex: 1 }} />
        {inChat && (
          <Button variant="icon" size="sm" aria-label="New chat" onClick={onReset}>
            <Plus size={16} color="var(--color-text-medium)" />
          </Button>
        )}
        <Button variant="icon" size="sm" aria-label="Collapse chat" onClick={() => onToggle(false)}>
          <ChevronRight size={18} color="var(--color-text-medium)" />
        </Button>
      </header>

      <div style={s.body}>
        {inChat ? (
          <MiraConversation
            turns={conversation}
            pendingTurnId={pendingTurnId}
            onSubmitFollowUp={submit}
          />
        ) : (
          <Empty onPick={(q) => submit(q)} />
        )}
      </div>

      <footer style={s.composerWrap}>
        <div style={s.composerCard}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            placeholder={`Ask about ${SPACE.name}…`}
            aria-label="Ask a question"
            style={s.input}
          />
          <div style={s.composerFooter}>
            <div style={s.chipRow}>
              <button type="button" style={s.chip} onClick={() => {}}>
                <TuneIcon size={15} color="var(--color-text-medium)" />
                <span>Graph</span>
              </button>
              <button
                type="button"
                style={{ ...s.chip, ...(setupContextOpen ? s.chipActive : null) }}
                onClick={() => onToggleSetupContext?.()}
              >
                <FilterFunnelIcon size={15} color={setupContextOpen ? "var(--color-button-primary-bg)" : "var(--color-text-medium)"} />
                <span style={setupContextOpen ? { color: "var(--color-button-primary-bg)" } : null}>Context</span>
              </button>
            </div>
            <Button
              variant="icon"
              size="md"
              aria-label={pending ? "Generating" : "Send"}
              onClick={pending ? () => {} : () => submit()}
              style={s.sendBtn}
            >
              {pending
                ? <RefreshCw size={16} color="var(--color-text-medium)" />
                : <ArrowUpIcon size={18} color="var(--color-text-medium)" />}
            </Button>
          </div>
        </div>
        <div style={s.disclaimer}>
          <span>Mira can make mistakes — check the answers.</span>
          <span>{queriesLeft} of {queriesTotal} left</span>
        </div>
      </footer>
    </aside>
  );
}

// Empty state — chat opens with scoped prompts so the exec never starts from a
// blank box (research: non-technical users don't know the question).
function Empty({ onPick }) {
  return (
    <div style={s.empty}>
      <span style={s.emptyIcon} aria-hidden="true">
        <MiraStarIcon size={28} color="var(--color-button-primary-bg)" />
      </span>
      <p style={s.emptyTitle}>Ask anything about {SPACE.name}</p>
      <p style={s.emptyBody}>Mira answers from this space's data. Try one of these:</p>
      <div style={s.suggested}>
        {SUGGESTED.map((q) => (
          <button key={q} type="button" onClick={() => onPick(q)} style={s.suggestion}>
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

const COL_TOP = "var(--page-padding-top, 32px)";
const COL_HEIGHT = "calc(100vh - var(--page-padding-top, 32px) - var(--page-padding-bottom, 32px))";

const s = {
  // Collapsed rail
  rail: { flexShrink: 0, width: 56, position: "sticky", top: COL_TOP, alignSelf: "flex-start", height: COL_HEIGHT },
  railBtn: {
    width: 56, height: "100%", minHeight: 220, display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
    paddingBlock: 18, borderRadius: 16, border: "1px solid var(--color-border-card-soft)", background: "var(--surface-white)",
    cursor: "pointer", fontFamily: "var(--font-sans)", position: "relative", boxShadow: "var(--shadow-1)",
    transition: "background 150ms ease, box-shadow 150ms ease",
  },
  railLabel: { writingMode: "vertical-rl", transform: "rotate(180deg)", fontSize: 13, fontWeight: 700, color: "var(--color-text-medium)", letterSpacing: "0.02em" },
  railDot: { position: "absolute", top: 14, insetInlineEnd: 14, width: 8, height: 8, borderRadius: 999, background: "var(--color-button-primary-bg)" },

  // Expanded column
  col: {
    flexShrink: 0, width: 360, position: "sticky", top: COL_TOP, alignSelf: "flex-start", height: COL_HEIGHT,
    display: "flex", flexDirection: "column", borderRadius: 16, border: "1px solid var(--color-border-card-soft)",
    background: "var(--surface-white)", overflow: "hidden", boxShadow: "var(--shadow-1)",
  },
  head: { display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", borderBottom: "1px solid var(--color-divider-card)", flexShrink: 0 },
  headTitle: { display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, color: "var(--color-text-deep)" },
  body: { flex: 1, minHeight: 0, overflowY: "auto", padding: 16 },

  composerWrap: { flexShrink: 0, padding: 12, borderTop: "1px solid var(--color-divider-card)", display: "flex", flexDirection: "column", gap: 6 },
  composerCard: { display: "flex", flexDirection: "column", gap: 10, padding: "12px 14px", borderRadius: 12, border: "1px solid var(--color-border-tab)" },
  input: { width: "100%", border: "none", outline: "none", background: "transparent", fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--color-text-deep)" },
  composerFooter: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 },
  chipRow: { display: "flex", alignItems: "center", gap: 6 },
  chip: { display: "inline-flex", alignItems: "center", gap: 5, height: 30, paddingInline: 10, borderRadius: 8, border: "1px solid var(--color-divider-card)", background: "var(--surface-white)", fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: "var(--color-text-medium)", cursor: "pointer" },
  chipActive: { border: "1px solid var(--color-button-primary-bg)", background: "var(--color-primary-alpha-04)" },
  sendBtn: { border: "1px solid var(--color-divider-card)" },
  disclaimer: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, paddingInline: 4, fontSize: 11, fontWeight: 500, color: "var(--color-text-tertiary)" },

  empty: { display: "flex", flexDirection: "column", gap: 8, paddingTop: 8 },
  emptyIcon: { width: 48, height: 48, borderRadius: 12, display: "grid", placeItems: "center", background: "var(--color-icon-tertiary-bg)" },
  emptyTitle: { margin: "8px 0 0", fontSize: 15, fontWeight: 700, color: "var(--color-text-deep)" },
  emptyBody: { margin: 0, fontSize: 13, lineHeight: 1.5, color: "var(--color-text-medium)" },
  suggested: { display: "flex", flexDirection: "column", gap: 8, marginTop: 6 },
  suggestion: {
    appearance: "none", textAlign: "start", padding: "12px 14px", borderRadius: 10, border: "1px solid var(--color-divider-card)",
    background: "var(--surface-white)", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 500, color: "var(--color-text-medium)",
    lineHeight: 1.45, cursor: "pointer", transition: "background 150ms ease, border-color 150ms ease",
  },
};
