"use client";

import React from "react";
import { Plus, Users } from "lucide-react";
import { fullBleed } from "./MiraWorkspaceBits";
import { StoryCard, AskBar } from "./MiraStoriesBits";
import MiraStoryPublished from "./MiraStoryPublished";
import { SPACE, STORIES, COLLABORATORS } from "./mocks/miraSpace";

// Stories — Landing A · Story Board (default). The Sales space is a board of
// authored story-objects: the story is the atomic unit, KPIs live inside cards,
// and "run analysis" creates a new card. Default-public cards fill the board
// for everyone; cross-team stories drop in. Research angle 5 (board/canvas) —
// the strongest home for multi-story, multi-team scale and "pull in other teams".
export default function MiraStoriesBoard(props) {
  const { conversation, pendingTurnId, onSubmit, onReset } = props;
  const [openId, setOpenId] = React.useState(null);

  if (openId) return <MiraStoryPublished storyId={openId} onBack={() => setOpenId(null)} {...props} />;

  return (
    <div style={fullBleed}>
      <header style={s.head}>
        <div style={s.headText}>
          <span style={s.kicker}>{SPACE.name} space</span>
          <h1 style={s.outcome}>{SPACE.outcome}</h1>
        </div>
        <div style={s.collab}>
          <div style={s.avatars}>{COLLABORATORS.slice(0, 4).map((c) => (
            <span key={c.id} style={{ ...s.av, background: c.bg, color: c.fg }}>{c.initials}</span>
          ))}</div>
          <span style={s.collabNote}><Users size={14} /> 4 collaborators</span>
        </div>
      </header>

      <div style={s.askRow}>
        <AskBar placeholder={`Ask about ${SPACE.name.toLowerCase()}…`} onSubmit={(t) => onSubmit?.(t)}
          hint="Mira checks existing stories first — reuse, don't regenerate." />
      </div>

      <div style={s.boardHead}>
        <span style={s.boardTitle}>Stories in this space</span>
        <span style={s.boardCount}>{STORIES.length}</span>
      </div>

      <div style={s.board}>
        <button type="button" style={s.newCard} onClick={() => onSubmit?.("Start a new analysis for the Sales space")}>
          <span style={s.newIcon}><Plus size={20} /></span>
          <span style={s.newTitle}>Run an analysis</span>
          <span style={s.newSub}>Explore a question, then publish it as a story.</span>
        </button>
        {STORIES.map((story) => (
          <StoryCard key={story.id} story={story} onOpen={setOpenId} />
        ))}
      </div>
    </div>
  );
}

const s = {
  head: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, paddingBottom: 18 },
  headText: { display: "flex", flexDirection: "column", gap: 4 },
  kicker: { fontSize: 13, fontWeight: 700, letterSpacing: "0.03em", textTransform: "uppercase", color: "var(--color-text-tertiary)" },
  outcome: { margin: 0, fontSize: 26, lineHeight: 1.2, letterSpacing: "-0.02em", fontWeight: 800, color: "var(--color-text-deep)", maxWidth: 640 },
  collab: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 },
  avatars: { display: "flex" },
  av: { display: "inline-grid", placeItems: "center", width: 32, height: 32, borderRadius: 999, fontSize: 12, fontWeight: 700, border: "2px solid var(--surface-white)", marginInlineStart: -8 },
  collabNote: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, color: "var(--color-text-tertiary)" },

  askRow: { maxWidth: 720, marginBottom: 26 },

  boardHead: { display: "flex", alignItems: "center", gap: 8, marginBottom: 14 },
  boardTitle: { fontSize: 15, fontWeight: 700, color: "var(--color-text-deep)" },
  boardCount: { display: "inline-grid", placeItems: "center", minWidth: 22, height: 22, paddingInline: 6, borderRadius: 999, background: "var(--grey-100)", fontSize: 12, fontWeight: 700, color: "var(--color-text-medium)" },

  board: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, paddingBottom: 32 },
  newCard: { display: "flex", flexDirection: "column", gap: 6, padding: 18, borderRadius: 16, border: "1.5px dashed var(--color-border-tab)", background: "var(--surface-white)", cursor: "pointer", textAlign: "start", fontFamily: "var(--font-sans)", minHeight: 180, justifyContent: "center" },
  newIcon: { display: "inline-grid", placeItems: "center", width: 40, height: 40, borderRadius: 12, background: "var(--grey-100)", color: "var(--color-button-primary-bg)" },
  newTitle: { fontSize: 16, fontWeight: 700, color: "var(--color-text-deep)", marginTop: 4 },
  newSub: { fontSize: 13, lineHeight: 1.45, color: "var(--color-text-tertiary)" },
};
