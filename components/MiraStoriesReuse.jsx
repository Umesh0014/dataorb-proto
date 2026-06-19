"use client";

import React from "react";
import { Sparkles, ArrowRight, Search } from "lucide-react";
import { fullBleed } from "./MiraWorkspaceBits";
import { StoryCard, AskBar, Avatar } from "./MiraStoriesBits";
import MiraStoryPublished from "./MiraStoryPublished";
import { SPACE, STORIES, SUGGESTED } from "./mocks/miraSpace";

const words = (str) => (str || "").toLowerCase().match(/[a-z]{4,}/g) || [];
function matchStories(query) {
  const q = new Set(words(query));
  if (!q.size) return [];
  return STORIES
    .filter((s) => s.status === "authored")
    .map((s) => {
      const hay = words(`${s.title} ${s.question} ${s.tldr}`);
      const score = hay.filter((w) => q.has(w)).length;
      return { s, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.s);
}

// Stories — Landing B · Ask-to-Reuse. "Author once, viewable by everyone"
// is the Stack-Overflow problem: a typed question searches existing stories +
// public explorations FIRST and intercepts with "Marco already explored this"
// before Mira spends a token — with an explicit "ask fresh anyway" escape.
// Makes token discipline a felt feature. Research angle 2 (knowledge reuse).
export default function MiraStoriesReuse(props) {
  const { onSubmit } = props;
  const [query, setQuery] = React.useState("");
  const [openId, setOpenId] = React.useState(null);
  const matches = matchStories(query);

  if (openId) return <MiraStoryPublished storyId={openId} onBack={() => setOpenId(null)} {...props} />;

  return (
    <div style={fullBleed}>
      <div style={s.center}>
        <span style={s.kicker}>{SPACE.name} space</span>
        <h1 style={s.h1}>What do you want to understand about {SPACE.name.toLowerCase()}?</h1>
        <p style={s.sub}>Ask in plain language. We check what's already been explored first — so you reuse a story instead of regenerating the same answer.</p>

        <div style={s.askRow}>
          <AskBar placeholder="e.g. Why did we lose the Northwind deals?" onSubmit={setQuery} />
        </div>

        {!query && (
          <div style={s.chips}>
            {SUGGESTED.map((qn) => (
              <button key={qn} type="button" style={s.chip} onClick={() => setQuery(qn)}>{qn}</button>
            ))}
          </div>
        )}

        {query && (
          <div style={s.intercept}>
            {matches.length > 0 ? (
              <>
                <div style={s.interceptHead}>
                  <Sparkles size={16} color="var(--color-button-primary-bg)" />
                  <span><b>{matches.length} existing {matches.length === 1 ? "story" : "stories"}</b> already answer this — view instead of regenerating.</span>
                </div>
                <div style={s.matchList}>
                  {matches.map((st) => (
                    <button key={st.id} type="button" style={s.match} onClick={() => setOpenId(st.id)}>
                      <Avatar person={st.author} size={30} />
                      <div style={s.matchBody}>
                        <span style={s.matchTitle}>{st.title}</span>
                        <span style={s.matchMeta}>{st.author.name} explored this · {st.date} · viewed {st.viewCount}×</span>
                      </div>
                      <ArrowRight size={16} color="var(--color-text-tertiary)" />
                    </button>
                  ))}
                </div>
                <button type="button" style={s.fresh} onClick={() => onSubmit?.(query)}>
                  None of these fit — ask Mira fresh anyway <ArrowRight size={15} />
                </button>
              </>
            ) : (
              <div style={s.noMatch}>
                <Search size={18} color="var(--color-text-tertiary)" />
                <p style={s.noMatchText}>No one's explored this yet. Mira will generate a fresh analysis you can publish as a story for the team.</p>
                <button type="button" style={s.freshSolo} onClick={() => onSubmit?.(query)}>Ask Mira <ArrowRight size={15} /></button>
              </div>
            )}
          </div>
        )}
      </div>

      {!query && (
        <div style={s.recent}>
          <p style={s.recentHead}>Recently authored in this space</p>
          <div style={s.recentGrid}>
            {STORIES.filter((st) => st.status === "authored").slice(0, 3).map((st) => (
              <StoryCard key={st.id} story={st} onOpen={setOpenId} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  center: { maxWidth: 680, margin: "0 auto", paddingTop: 24, textAlign: "center" },
  kicker: { fontSize: 13, fontWeight: 700, letterSpacing: "0.03em", textTransform: "uppercase", color: "var(--color-text-tertiary)" },
  h1: { margin: "8px 0 10px", fontSize: 30, lineHeight: 1.2, letterSpacing: "-0.02em", fontWeight: 800, color: "var(--color-text-deep)" },
  sub: { margin: "0 auto 22px", maxWidth: 560, fontSize: 15, lineHeight: 1.55, color: "var(--color-text-medium)" },
  askRow: { textAlign: "start" },

  chips: { display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 18 },
  chip: { height: 36, paddingInline: 14, borderRadius: 999, border: "1px solid var(--color-border-tab)", background: "var(--surface-white)", fontFamily: "var(--font-sans)", fontSize: 13.5, fontWeight: 600, color: "var(--color-text-medium)", cursor: "pointer" },

  intercept: { marginTop: 20, padding: 18, borderRadius: 16, border: "1px solid var(--color-border-card-soft)", background: "var(--surface-white)", boxShadow: "var(--shadow-1)", textAlign: "start" },
  interceptHead: { display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "var(--color-text-medium)", marginBottom: 12 },
  matchList: { display: "flex", flexDirection: "column", gap: 8 },
  match: { display: "flex", alignItems: "center", gap: 12, padding: 12, borderRadius: 12, border: "1px solid var(--color-divider-card)", background: "var(--surface-white)", cursor: "pointer", textAlign: "start", fontFamily: "var(--font-sans)" },
  matchBody: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 },
  matchTitle: { fontSize: 14.5, fontWeight: 700, color: "var(--color-text-deep)" },
  matchMeta: { fontSize: 12.5, color: "var(--color-text-tertiary)" },
  fresh: { display: "inline-flex", alignItems: "center", gap: 6, marginTop: 14, height: 38, paddingInline: 14, borderRadius: 10, border: "1px solid var(--color-border-tab)", background: "var(--surface-white)", fontFamily: "var(--font-sans)", fontSize: 13.5, fontWeight: 600, color: "var(--color-text-medium)", cursor: "pointer" },
  noMatch: { display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center", padding: "12px 0" },
  noMatchText: { margin: 0, fontSize: 14.5, lineHeight: 1.5, color: "var(--color-text-medium)", maxWidth: 440 },
  freshSolo: { display: "inline-flex", alignItems: "center", gap: 6, height: 42, paddingInline: 18, borderRadius: 999, border: "none", background: "var(--color-button-primary-bg)", color: "var(--color-button-primary-text, #fff)", fontFamily: "var(--font-sans)", fontSize: 14.5, fontWeight: 600, cursor: "pointer" },

  recent: { maxWidth: 980, margin: "40px auto 32px" },
  recentHead: { margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: "var(--color-text-deep)" },
  recentGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 },
};
