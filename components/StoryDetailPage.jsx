/* eslint-disable no-restricted-syntax, max-lines-per-function --
   StoryDetailPage is a feature page (like DrillDetailPage): the Google-Docs-
   style comment layer needs bespoke selection/anchor surfaces that Button.jsx
   doesn't model, and the page legitimately exceeds the soft size limit. */
"use client";

import React from "react";
import { ArrowLeft, MessageSquarePlus, Check, CornerUpLeft, Pin, Globe } from "lucide-react";
import Card from "./Card";
import OutcomeTrendChart from "./OutcomeTrendChart";
import { MiraStarIcon } from "./SideNav/icons";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Collaborators available to @mention / assign on a comment.
const PEOPLE = [
  { id: "pn", name: "Priya Nair", initials: "PN", color: "var(--chart-blue)" },
  { id: "mr", name: "Marco Rossi", initials: "MR", color: "var(--chart-lavender)" },
  { id: "sa", name: "Sofia Almeida", initials: "SA", color: "var(--chart-green)" },
  { id: "me", name: "Demo Internal", initials: "DI", color: "var(--chart-orange)" },
];
const ME = PEOPLE[3];

// Highlight chrome for the comment ranges (Custom Highlight API). Tokens
// resolve inside ::highlight(); active range gets the stronger amber.
const HL_STYLE = `
::highlight(story-comment) { background-color: var(--badge-amber-bg); }
::highlight(story-comment-active) { background-color: var(--chart-amber); }
`;

let threadSeq = 0;
const nextId = () => `t${(threadSeq += 1)}`;

function buildDoc(outcome, story) {
  const up = outcome.deltaPp >= 0;
  const aboveTarget = outcome.value >= outcome.target;
  return {
    title: `Why did ${outcome.title} ${up ? "climb" : "slip"} this period?`,
    tldr: `${outcome.title} moved ${up ? "up" : "down"} ${Math.abs(outcome.deltaPp)} pp to ${outcome.value}% — now ${aboveTarget ? "above" : "below"} the ${outcome.target}% target. ${story.title}.`,
    sections: [
      {
        head: "What happened",
        body: "The metric moved outside its recent band this period. The shift is concentrated in a subset of segments rather than spread evenly, so the headline number understates how sharp the change is where it's happening.",
      },
      {
        head: "Why it happened",
        body: "Two drivers explain most of the move: a process change that landed mid-period, and a shift in the mix of contacts. Sentiment and handle-time signals line up with the same segments, which rules out a one-off data artifact.",
      },
      {
        head: "Recommended next step",
        body: "Focus on the one segment carrying most of the delta. A short, weekly review loop there will tell us within two weeks whether the change holds — before committing a broader playbook.",
      },
    ],
    pinned: [
      { text: "The top segment alone accounts for ~60% of the period-over-period move.", by: "Priya Nair" },
      { text: "Sentiment and handle time track the same accounts — this is a real shift, not a data blip.", by: "Marco Rossi" },
    ],
  };
}

/**
 * StoryDetailPage — the expanded "story" behind an outcome, with Google-Docs
 * style commenting: select any text in the article to drop an anchored comment
 * (highlighted via the Custom Highlight API), @mention collaborators, reply on
 * a thread, and resolve it. A general comments thread sits at the bottom.
 *
 * @param {{ outcome: object, story: object, onBack: () => void }} props
 */
export default function StoryDetailPage({ outcome, story, onBack }) {
  const doc = React.useMemo(() => buildDoc(outcome, story), [outcome, story]);
  const labels = outcome.trend.map((_, i) => MONTHS[i] ?? `P${i + 1}`);

  const articleRef = React.useRef(null);
  const [threads, setThreads] = React.useState(() => [
    {
      id: nextId(),
      anchored: false,
      resolved: false,
      range: null,
      quote: null,
      comments: [
        { id: "c0", author: PEOPLE[2], text: "Pulling logistics into this — the hand-off delay is on our side. Will add notes.", mentions: [], at: "1 day ago" },
      ],
    },
  ]);
  const [activeId, setActiveId] = React.useState(null);
  const [sel, setSel] = React.useState(null); // { rect, range, quote } | null
  const [showResolved, setShowResolved] = React.useState(false);

  // Paint comment highlights from the live ranges (unresolved + active).
  React.useEffect(() => {
    if (typeof CSS === "undefined" || !CSS.highlights) return undefined;
    const base = new Highlight();
    const active = new Highlight();
    threads.forEach((t) => {
      if (!t.range || t.resolved) return;
      if (t.id === activeId) active.add(t.range);
      else base.add(t.range);
    });
    CSS.highlights.set("story-comment", base);
    CSS.highlights.set("story-comment-active", active);
    return () => {
      CSS.highlights.delete("story-comment");
      CSS.highlights.delete("story-comment-active");
    };
  }, [threads, activeId]);

  const onMouseUp = () => {
    const s = window.getSelection();
    if (!s || s.isCollapsed || s.rangeCount === 0) {
      setSel(null);
      return;
    }
    const range = s.getRangeAt(0);
    if (!articleRef.current || !articleRef.current.contains(range.commonAncestorContainer)) {
      setSel(null);
      return;
    }
    const quote = s.toString().trim();
    if (!quote) {
      setSel(null);
      return;
    }
    const rect = range.getBoundingClientRect();
    setSel({ rect, range: range.cloneRange(), quote });
  };

  // Click on an existing highlight opens its thread.
  const onArticleClick = (e) => {
    if (!document.caretRangeFromPoint) return;
    const caret = document.caretRangeFromPoint(e.clientX, e.clientY);
    if (!caret) return;
    const hit = threads.find(
      (t) => t.range && !t.resolved && t.range.isPointInRange(caret.startContainer, caret.startOffset),
    );
    if (hit) setActiveId(hit.id);
  };

  const startComment = () => {
    if (!sel) return;
    const id = nextId();
    setThreads((prev) => [
      ...prev,
      { id, anchored: true, resolved: false, range: sel.range, quote: sel.quote, comments: [], composing: true },
    ]);
    setActiveId(id);
    setSel(null);
    window.getSelection()?.removeAllRanges();
  };

  const addComment = (threadId, text, mentions) => {
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? {
              ...t,
              composing: false,
              comments: [...t.comments, { id: `c${Date.now()}`, author: ME, text, mentions, at: "just now" }],
            }
          : t,
      ),
    );
  };

  const cancelDraft = (threadId) =>
    setThreads((prev) => prev.filter((t) => !(t.id === threadId && t.comments.length === 0)));

  const setResolved = (threadId, resolved) =>
    setThreads((prev) => prev.map((t) => (t.id === threadId ? { ...t, resolved } : t)));

  const anchored = threads.filter((t) => t.anchored);
  const openAnchored = anchored.filter((t) => !t.resolved);
  const resolvedAnchored = anchored.filter((t) => t.resolved);
  const general = threads.filter((t) => !t.anchored);

  return (
    <div style={s.page}>
      <style>{HL_STYLE}</style>
      <div style={s.scroll}>
        <div style={s.inner}>
          <div
            ref={articleRef}
            style={s.article}
            onMouseUp={onMouseUp}
            onClick={onArticleClick}
          >
            <button type="button" onClick={onBack} style={s.back}>
              <ArrowLeft size={16} color="var(--color-text-tertiary)" />
              BACK
            </button>

            <h1 style={s.title}>{doc.title}</h1>

            <div style={s.byline}>
              <MiraStarIcon size={18} />
              <span style={s.bylineName}>Mira</span>
              <span style={s.dot}>·</span>
              <span style={s.bylineMeta}>2 days ago</span>
              <span style={s.dot}>·</span>
              <Globe size={13} color="var(--color-text-tertiary)" />
              <span style={s.bylineMeta}>Public</span>
              <div style={{ flex: 1 }} />
              <Facepile />
            </div>

            <Card tone="muted" padX={20} padY={18} style={s.tldr}>
              <span style={s.tldrKicker}>TL;DR</span>
              <span style={s.tldrText}>{doc.tldr}</span>
            </Card>

            <div style={s.chartFrame}>
              <span style={s.chartLabel}>{outcome.title} · last {outcome.trend.length} months</span>
              <OutcomeTrendChart
                points={outcome.trend}
                labels={labels}
                target={outcome.target}
                color="var(--chart-blue)"
                onScrub={() => {}}
              />
            </div>

            {doc.sections.map((sec) => (
              <section key={sec.head} style={s.section}>
                <h2 style={s.sectionHead}>{sec.head}</h2>
                <p style={s.sectionBody}>{sec.body}</p>
              </section>
            ))}

            <h2 style={s.sectionHead}>Pinned insights</h2>
            <div style={s.pinnedList}>
              {doc.pinned.map((p) => (
                <div key={p.text} style={s.pinnedCard}>
                  <Pin size={15} color="var(--color-button-primary-bg)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={s.pinnedText}>{p.text}</div>
                    <div style={s.pinnedBy}>Pinned by {p.by}</div>
                  </div>
                </div>
              ))}
            </div>

            <h2 style={s.sectionHead}>Comments</h2>
            <div style={s.generalList}>
              {general.map((t) => (
                <Thread
                  key={t.id}
                  thread={t}
                  active={activeId === t.id}
                  onActivate={() => setActiveId(t.id)}
                  onAdd={addComment}
                  onCancel={cancelDraft}
                  onResolve={setResolved}
                />
              ))}
              <NewGeneralComment onAdd={addComment} threads={threads} setThreads={setThreads} />
            </div>
          </div>

          {/* Margin rail — anchored comment threads (Google-Docs style) */}
          <div style={s.rail}>
            {openAnchored.length === 0 && (
              <p style={s.railEmpty}>Select any text in the story to leave a comment.</p>
            )}
            {openAnchored.map((t) => (
              <Thread
                key={t.id}
                thread={t}
                active={activeId === t.id}
                onActivate={() => setActiveId(t.id)}
                onAdd={addComment}
                onCancel={cancelDraft}
                onResolve={setResolved}
              />
            ))}
            {resolvedAnchored.length > 0 && (
              <>
                <button type="button" style={s.resolvedToggle} onClick={() => setShowResolved((v) => !v)}>
                  {showResolved ? "Hide" : "Show"} resolved ({resolvedAnchored.length})
                </button>
                {showResolved &&
                  resolvedAnchored.map((t) => (
                    <Thread
                      key={t.id}
                      thread={t}
                      active={false}
                      onActivate={() => setActiveId(t.id)}
                      onAdd={addComment}
                      onCancel={cancelDraft}
                      onResolve={setResolved}
                    />
                  ))}
              </>
            )}
          </div>
        </div>
      </div>

      {sel && (
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={startComment}
          style={{
            ...s.selectBtn,
            top: sel.rect.top - 44,
            left: sel.rect.left + sel.rect.width / 2,
          }}
        >
          <MessageSquarePlus size={15} color="#FFFFFF" />
          Comment
        </button>
      )}
    </div>
  );
}

function Facepile() {
  return (
    <div style={s.facepile} aria-label="Shared with">
      {PEOPLE.slice(0, 3).map((p, i) => (
        <span key={p.id} style={{ ...s.avatar, background: p.color, marginLeft: i ? -8 : 0 }} aria-hidden="true">
          {p.initials}
        </span>
      ))}
    </div>
  );
}

// Thread — one comment thread (anchored quote optional), its comments, a
// reply composer, and resolve / re-open. Used in the rail and the general list.
function Thread({ thread, active, onActivate, onAdd, onCancel, onResolve }) {
  const { id, quote, comments, resolved, composing } = thread;
  const [replying, setReplying] = React.useState(false);

  return (
    <div
      style={{ ...s.thread, ...(active ? s.threadActive : null), ...(resolved ? s.threadResolved : null) }}
      onClick={onActivate}
    >
      {quote && <div style={s.quote}>{quote}</div>}

      {comments.map((c) => (
        <div key={c.id} style={s.comment}>
          <span style={{ ...s.avatar, ...s.avatarSm, background: c.author.color }} aria-hidden="true">
            {c.author.initials}
          </span>
          <div style={s.commentBody}>
            <div style={s.commentHead}>
              <span style={s.commentAuthor}>{c.author.name}</span>
              <span style={s.commentAt}>{c.at}</span>
            </div>
            <div style={s.commentText}>{renderMentions(c.text)}</div>
          </div>
        </div>
      ))}

      {composing ? (
        <CommentComposer autoFocus placeholder="Comment…" onSubmit={(text, m) => onAdd(id, text, m)} onCancel={() => onCancel(id)} />
      ) : !resolved ? (
        <div style={s.threadActions}>
          {replying ? (
            <CommentComposer
              autoFocus
              placeholder="Reply…"
              onSubmit={(text, m) => { onAdd(id, text, m); setReplying(false); }}
              onCancel={() => setReplying(false)}
            />
          ) : (
            <>
              <button type="button" style={s.threadBtn} onClick={(e) => { e.stopPropagation(); setReplying(true); }}>
                <CornerUpLeft size={13} /> Reply
              </button>
              <button type="button" style={s.threadBtn} onClick={(e) => { e.stopPropagation(); onResolve(id, true); }}>
                <Check size={13} /> Resolve
              </button>
            </>
          )}
        </div>
      ) : (
        <button type="button" style={s.threadBtn} onClick={(e) => { e.stopPropagation(); onResolve(id, false); }}>
          Re-open
        </button>
      )}
    </div>
  );
}

// NewGeneralComment — composer to start an unanchored comment in the bottom list.
function NewGeneralComment({ onAdd, threads, setThreads }) {
  const [open, setOpen] = React.useState(false);
  if (!open) {
    return (
      <button type="button" style={s.addGeneral} onClick={() => setOpen(true)}>
        <MessageSquarePlus size={15} color="var(--color-text-tertiary)" /> Add a comment
      </button>
    );
  }
  return (
    <div style={s.thread}>
      <CommentComposer
        autoFocus
        placeholder="Comment…"
        onSubmit={(text, m) => {
          const id = nextId();
          setThreads([...threads, { id, anchored: false, resolved: false, range: null, quote: null, comments: [{ id: `c${Date.now()}`, author: ME, text, mentions: m, at: "just now" }] }]);
          setOpen(false);
        }}
        onCancel={() => setOpen(false)}
      />
    </div>
  );
}

// CommentComposer — textarea with an @mention dropdown. Returns the text and
// the set of mentioned people on submit.
function CommentComposer({ placeholder, autoFocus, onSubmit, onCancel }) {
  const [text, setText] = React.useState("");
  const [mentions, setMentions] = React.useState([]);
  const [menu, setMenu] = React.useState(null); // { query } | null
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  const onChange = (e) => {
    const v = e.target.value;
    setText(v);
    const m = /(^|\s)@(\w*)$/.exec(v.slice(0, e.target.selectionStart));
    setMenu(m ? { query: m[2].toLowerCase() } : null);
  };

  const pick = (person) => {
    setText((v) => v.replace(/(^|\s)@(\w*)$/, `$1@${person.name} `));
    setMentions((prev) => (prev.some((p) => p.id === person.id) ? prev : [...prev, person]));
    setMenu(null);
    ref.current?.focus();
  };

  const submit = () => {
    const t = text.trim();
    if (!t) return;
    const named = PEOPLE.filter((p) => t.includes(`@${p.name}`));
    const merged = [...mentions];
    named.forEach((p) => { if (!merged.some((x) => x.id === p.id)) merged.push(p); });
    onSubmit(t, merged.map((p) => p.id));
    setText("");
    setMentions([]);
  };

  const candidates = menu ? PEOPLE.filter((p) => p.name.toLowerCase().includes(menu.query)) : [];

  return (
    <div style={s.composer} onClick={(e) => e.stopPropagation()}>
      <textarea
        ref={ref}
        value={text}
        onChange={onChange}
        placeholder={placeholder}
        rows={2}
        style={s.textarea}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
          if (e.key === "Escape") onCancel?.();
        }}
      />
      {menu && candidates.length > 0 && (
        <div style={s.mentionMenu}>
          {candidates.map((p) => (
            <button key={p.id} type="button" style={s.mentionItem} onClick={() => pick(p)}>
              <span style={{ ...s.avatar, ...s.avatarSm, background: p.color }} aria-hidden="true">{p.initials}</span>
              {p.name}
            </button>
          ))}
        </div>
      )}
      {mentions.length > 0 && (
        <div style={s.mentionChips}>
          {mentions.map((p) => (
            <span key={p.id} style={s.mentionChip}>@{p.name}</span>
          ))}
        </div>
      )}
      <div style={s.composerActions}>
        <button type="button" style={s.composerCancel} onClick={onCancel}>Cancel</button>
        <button type="button" style={s.composerSend} onClick={submit} disabled={!text.trim()}>Comment</button>
      </div>
    </div>
  );
}

// Render "@Name" runs as styled mention chips inside comment text.
function renderMentions(text) {
  const names = PEOPLE.map((p) => p.name).sort((a, b) => b.length - a.length);
  const re = new RegExp(`@(${names.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g");
  const out = [];
  let last = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(<span key={m.index} style={s.mention}>@{m[1]}</span>);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const s = {
  page: { flex: 1, minHeight: 0, display: "flex", flexDirection: "column", fontFamily: "var(--font-sans)" },
  scroll: { flex: 1, minHeight: 0, overflowY: "auto" },
  inner: { width: "100%", maxWidth: 1040, marginInline: "auto", paddingTop: 16, paddingBottom: 48, display: "flex", gap: 32, alignItems: "flex-start" },
  article: { flex: 1, minWidth: 0, maxWidth: 680 },

  back: { display: "inline-flex", alignItems: "center", gap: 8, background: "transparent", border: "none", padding: 0, cursor: "pointer", fontSize: 13, fontWeight: 700, letterSpacing: "0.04em", color: "var(--color-text-tertiary)" },
  title: { marginTop: 16, fontSize: 30, fontWeight: 800, color: "var(--color-text-deep)", lineHeight: 1.2 },
  byline: { display: "flex", alignItems: "center", gap: 8, marginTop: 14 },
  bylineName: { fontSize: 14, fontWeight: 700, color: "var(--color-text-deep)" },
  bylineMeta: { fontSize: 13, fontWeight: 500, color: "var(--color-text-tertiary)" },
  dot: { color: "var(--color-text-tertiary)" },

  facepile: { display: "inline-flex", alignItems: "center" },
  avatar: { width: 28, height: 28, borderRadius: 999, border: "2px solid var(--surface-white)", color: "#FFFFFF", fontSize: 10, fontWeight: 700, display: "grid", placeItems: "center", flexShrink: 0 },
  avatarSm: { width: 24, height: 24, border: "none", fontSize: 9 },

  tldr: { display: "flex", flexDirection: "column", gap: 8, marginTop: 20 },
  tldrKicker: { fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--color-button-primary-bg)" },
  tldrText: { fontSize: 15, lineHeight: 1.6, color: "var(--color-text-medium)" },

  chartFrame: { marginTop: 24, display: "flex", flexDirection: "column", gap: 8 },
  chartLabel: { fontSize: 13, fontWeight: 600, color: "var(--color-text-medium)" },

  section: { marginTop: 24 },
  sectionHead: { marginTop: 28, fontSize: 18, fontWeight: 700, color: "var(--color-text-deep)" },
  sectionBody: { marginTop: 8, fontSize: 15, lineHeight: 1.7, color: "var(--color-text-medium)" },

  pinnedList: { marginTop: 12, display: "flex", flexDirection: "column", gap: 12 },
  pinnedCard: { display: "flex", gap: 12, padding: "14px 16px", borderRadius: 12, background: "var(--color-primary-alpha-04)", borderInlineStart: "3px solid var(--color-button-primary-bg)" },
  pinnedText: { fontSize: 14, fontWeight: 600, color: "var(--color-text-deep)", lineHeight: 1.5 },
  pinnedBy: { marginTop: 4, fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)" },

  generalList: { marginTop: 12, display: "flex", flexDirection: "column", gap: 12 },
  addGeneral: { display: "inline-flex", alignItems: "center", gap: 8, alignSelf: "flex-start", background: "transparent", border: "1px dashed var(--color-divider-card)", borderRadius: 10, padding: "10px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "var(--color-text-tertiary)", fontFamily: "var(--font-sans)" },

  rail: { width: 300, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12, position: "sticky", top: 16 },
  railEmpty: { fontSize: 13, lineHeight: 1.5, color: "var(--color-text-tertiary)", padding: "4px 2px" },
  resolvedToggle: { alignSelf: "flex-start", background: "transparent", border: "none", padding: "4px 2px", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "var(--color-button-primary-bg)", fontFamily: "var(--font-sans)" },

  thread: { background: "var(--surface-white)", border: "1px solid var(--color-divider-card)", borderRadius: 12, padding: 14, boxShadow: "var(--shadow-card)", cursor: "default", display: "flex", flexDirection: "column", gap: 10 },
  threadActive: { borderColor: "var(--color-button-primary-bg)", boxShadow: "var(--shadow-8)" },
  threadResolved: { opacity: 0.7 },
  quote: { fontSize: 12, fontStyle: "italic", color: "var(--color-text-tertiary)", borderInlineStart: "3px solid var(--chart-amber)", paddingInlineStart: 8, lineHeight: 1.4 },

  comment: { display: "flex", gap: 10 },
  commentBody: { flex: 1, minWidth: 0 },
  commentHead: { display: "flex", alignItems: "baseline", gap: 8 },
  commentAuthor: { fontSize: 13, fontWeight: 700, color: "var(--color-text-deep)" },
  commentAt: { fontSize: 11, fontWeight: 500, color: "var(--color-text-tertiary)" },
  commentText: { marginTop: 2, fontSize: 13, lineHeight: 1.5, color: "var(--color-text-medium)" },
  mention: { color: "var(--color-button-primary-bg)", fontWeight: 700 },

  threadActions: { display: "flex", gap: 8 },
  threadBtn: { display: "inline-flex", alignItems: "center", gap: 5, background: "transparent", border: "none", padding: "4px 6px", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "var(--color-text-tertiary)", fontFamily: "var(--font-sans)" },

  composer: { display: "flex", flexDirection: "column", gap: 8, position: "relative" },
  textarea: { width: "100%", resize: "vertical", border: "1px solid var(--color-divider-card)", borderRadius: 8, padding: "8px 10px", fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--color-text-deep)", outline: "none", boxSizing: "border-box" },
  mentionMenu: { position: "absolute", top: 52, left: 0, zIndex: 10, minWidth: 200, background: "var(--surface-white)", border: "1px solid var(--color-divider-card)", borderRadius: 8, boxShadow: "var(--shadow-8)", padding: 4, display: "flex", flexDirection: "column" },
  mentionItem: { display: "flex", alignItems: "center", gap: 8, background: "transparent", border: "none", borderRadius: 6, padding: "6px 8px", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "var(--color-text-deep)", textAlign: "left", fontFamily: "var(--font-sans)" },
  mentionChips: { display: "flex", flexWrap: "wrap", gap: 6 },
  mentionChip: { fontSize: 11, fontWeight: 700, color: "var(--color-button-primary-bg)", background: "var(--color-primary-alpha-12)", borderRadius: 999, padding: "2px 8px" },
  composerActions: { display: "flex", justifyContent: "flex-end", gap: 8 },
  composerCancel: { background: "transparent", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "var(--color-text-tertiary)", fontFamily: "var(--font-sans)" },
  composerSend: { background: "var(--color-button-primary-bg)", border: "none", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#FFFFFF", fontFamily: "var(--font-sans)" },

  selectBtn: { position: "fixed", transform: "translateX(-50%)", zIndex: 60, display: "inline-flex", alignItems: "center", gap: 6, height: 34, paddingInline: 12, borderRadius: 999, border: "none", background: "var(--grey-900)", color: "#FFFFFF", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "var(--shadow-8)", fontFamily: "var(--font-sans)" },
};
