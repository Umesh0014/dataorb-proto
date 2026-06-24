/* eslint-disable no-restricted-syntax --
   StoryDetailPage is a feature page (like DrillDetailPage): the Google-Docs-
   style comment layer + infographics need bespoke surfaces Button.jsx doesn't
   model, and the page legitimately runs long. */
"use client";

import React from "react";
import { ArrowLeft, MessageSquarePlus, Check, CornerUpLeft, Pin, Globe, ArrowRight } from "lucide-react";
import Card from "./Card";
import OutcomeTrendChart from "./OutcomeTrendChart";
import { MiraStarIcon } from "./SideNav/icons";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const ARTICLE_W = 800; // white "paper" card width (content + padding)
const RAIL_W = 300;
const RAIL_GAP = 28;

const PEOPLE = [
  { id: "pn", name: "Priya Nair", initials: "PN", color: "var(--chart-blue)" },
  { id: "mr", name: "Marco Rossi", initials: "MR", color: "var(--chart-lavender)" },
  { id: "sa", name: "Sofia Almeida", initials: "SA", color: "var(--chart-green)" },
  { id: "me", name: "Demo Internal", initials: "DI", color: "var(--chart-orange)" },
];
const ME = PEOPLE[3];

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
    results: {
      caption: `Acting on ${outcome.title} moved the needle across the leading segments this period:`,
      cols: ["Enterprise", "Mid-market"],
      rows: [
        { label: "Attainment", a: `${outcome.value}%`, b: `${Math.max(0, outcome.value - 4)}%` },
        { label: "Period change", a: `${up ? "+" : ""}${outcome.deltaPp} pp`, b: `${up ? "+" : ""}${outcome.deltaPp + 1} pp` },
        { label: "% of goal", a: `${outcome.goalPct}%`, b: `${outcome.goalPct - 3}%` },
      ],
    },
    quote: {
      text: "Once we acted on the signal early and kept the review loop tight, the change held through the noisiest part of the period — that's what turned a blip into a trend.",
      name: "Priya Nair",
      role: "Outcome Owner · Revenue Operations",
    },
    highlight: {
      stat: `${Math.round((outcome.value / outcome.target) * 100)}%`,
      text: `of the target was reached this period, with the leading segment carrying most of the gain — a useful frame for how aggressive the next play should be.`,
    },
    pinned: [
      { text: "The top segment alone accounts for ~60% of the period-over-period move.", by: "Priya Nair" },
      { text: "Sentiment and handle time track the same accounts — this is a real shift, not a data blip.", by: "Marco Rossi" },
    ],
    contributors: [
      { name: "Priya Nair", role: "Outcome Owner, Revenue Operations", org: "DataOrb", initials: "PN" },
      { name: "Marco Rossi", role: "Lead Analyst, Customer Insights", org: "DataOrb", initials: "MR" },
      { name: "Sofia Almeida", role: "Operations Manager, Save Desk", org: "DataOrb", initials: "SA" },
    ],
  };
}

/**
 * StoryDetailPage — the expanded story behind an outcome. The article sits
 * centered until you start a comment, then it shifts left to make room for the
 * margin rail (Google Docs). Comments anchor to a text selection, sit
 * vertically aligned to it, support @mentions, threaded replies, and resolve.
 *
 * @param {{ outcome: object, story: object, onBack: () => void }} props
 */
export default function StoryDetailPage({ outcome, story, onBack }) {
  const doc = React.useMemo(() => buildDoc(outcome, story), [outcome, story]);
  const labels = outcome.trend.map((_, i) => MONTHS[i] ?? `P${i + 1}`);

  const wrapRef = React.useRef(null);
  const articleRef = React.useRef(null);
  const [threads, setThreads] = React.useState([]);
  const [activeId, setActiveId] = React.useState(null);
  const [sel, setSel] = React.useState(null);
  const [tops, setTops] = React.useState({});
  const [showResolved, setShowResolved] = React.useState(false);

  const openAnchored = threads.filter((t) => !t.resolved);
  const resolved = threads.filter((t) => t.resolved);
  const commentsActive = openAnchored.length > 0;

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

  // Vertically align each thread to the center of its highlighted selection.
  const measure = React.useCallback(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const wrapTop = wrap.getBoundingClientRect().top;
    const next = {};
    threads.forEach((t) => {
      if (t.resolved || !t.range) return;
      const r = t.range.getBoundingClientRect();
      next[t.id] = r.top - wrapTop + r.height / 2;
    });
    setTops(next);
  }, [threads]);

  React.useLayoutEffect(() => { measure(); }, [measure]);
  React.useEffect(() => {
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  const onMouseUp = () => {
    const s = window.getSelection();
    if (!s || s.isCollapsed || s.rangeCount === 0) { setSel(null); return; }
    const range = s.getRangeAt(0);
    if (!articleRef.current || !articleRef.current.contains(range.commonAncestorContainer)) { setSel(null); return; }
    const quote = s.toString().trim();
    if (!quote) { setSel(null); return; }
    setSel({ rect: range.getBoundingClientRect(), range: range.cloneRange(), quote });
  };

  const onArticleClick = (e) => {
    if (!document.caretRangeFromPoint) return;
    const caret = document.caretRangeFromPoint(e.clientX, e.clientY);
    if (!caret) return;
    const hit = threads.find((t) => t.range && !t.resolved && t.range.isPointInRange(caret.startContainer, caret.startOffset));
    if (hit) setActiveId(hit.id);
  };

  const startComment = () => {
    if (!sel) return;
    const id = nextId();
    setThreads((prev) => [...prev, { id, resolved: false, range: sel.range, quote: sel.quote, comments: [], composing: true }]);
    setActiveId(id);
    setSel(null);
    window.getSelection()?.removeAllRanges();
  };

  const addComment = (threadId, text, mentions) =>
    setThreads((prev) => prev.map((t) => (t.id === threadId
      ? { ...t, composing: false, comments: [...t.comments, { id: `c${Date.now()}`, author: ME, text, mentions, at: "just now" }] }
      : t)));
  const cancelDraft = (threadId) => setThreads((prev) => prev.filter((t) => !(t.id === threadId && t.comments.length === 0)));
  const setResolved = (threadId, val) => setThreads((prev) => prev.map((t) => (t.id === threadId ? { ...t, resolved: val } : t)));

  return (
    <div style={s.page}>
      <style>{HL_STYLE}</style>
      <div style={s.scroll}>
        <div
          ref={wrapRef}
          style={{ ...s.wrap, width: commentsActive ? ARTICLE_W + RAIL_GAP + RAIL_W : ARTICLE_W }}
        >
          <div ref={articleRef} style={s.article} onMouseUp={onMouseUp} onClick={onArticleClick}>
            <div style={s.header}>
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
            </div>

            <Card tone="muted" padX={20} padY={18} style={s.tldr}>
              <span style={s.tldrKicker}>TL;DR</span>
              <span style={s.tldrText}>{doc.tldr}</span>
            </Card>

            <div style={s.chartFrame}>
              <span style={s.chartLabel}>{outcome.title} · last {outcome.trend.length} months</span>
              <OutcomeTrendChart points={outcome.trend} labels={labels} target={outcome.target} color="var(--chart-blue)" onScrub={() => {}} />
            </div>

            <Section sec={doc.sections[0]} />
            <ResultsInfographic results={doc.results} />
            <Section sec={doc.sections[1]} />
            <QuoteInfographic quote={doc.quote} />
            <Section sec={doc.sections[2]} />
            <HighlightInfographic highlight={doc.highlight} />

            <div style={s.block}>
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
            </div>

            <div style={s.block}>
              <h2 style={s.sectionHead}>Contributors</h2>
              <div style={s.authors}>
                {doc.contributors.map((c) => (
                  <div key={c.name} style={s.authorRow}>
                    <div>
                      <div style={s.authorName}>{c.name}</div>
                      <div style={s.authorRole}>{c.role}</div>
                      <div style={s.authorOrg}>{c.org}</div>
                    </div>
                    <span style={s.authorAvatar} aria-hidden="true">{c.initials}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Margin rail — anchored threads, each aligned to its selection. */}
          <div style={{ ...s.rail, opacity: commentsActive ? 1 : 0, pointerEvents: commentsActive ? "auto" : "none" }}>
            {openAnchored.map((t) => (
              <div key={t.id} style={{ ...s.railSlot, top: tops[t.id] ?? 0 }}>
                <Thread thread={t} active={activeId === t.id} onActivate={() => setActiveId(t.id)} onAdd={addComment} onCancel={cancelDraft} onResolve={setResolved} />
              </div>
            ))}
          </div>
        </div>

        {resolved.length > 0 && (
          <div style={s.resolvedBar}>
            <button type="button" style={s.resolvedToggle} onClick={() => setShowResolved((v) => !v)}>
              {showResolved ? "Hide" : "Show"} resolved comments ({resolved.length})
            </button>
            {showResolved && (
              <div style={s.resolvedList}>
                {resolved.map((t) => (
                  <Thread key={t.id} thread={t} active={false} onActivate={() => {}} onAdd={addComment} onCancel={cancelDraft} onResolve={setResolved} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {sel && (
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={startComment}
          style={{ ...s.selectBtn, top: sel.rect.top - 44, left: sel.rect.left + sel.rect.width / 2 }}
        >
          <MessageSquarePlus size={15} color="#FFFFFF" />
          Comment
        </button>
      )}
    </div>
  );
}

function Section({ sec }) {
  return (
    <section style={s.section}>
      <h2 style={s.sectionHead}>{sec.head}</h2>
      <p style={s.sectionBody}>{sec.body}</p>
    </section>
  );
}

function ResultsInfographic({ results }) {
  return (
    <div style={s.infoCard}>
      <div style={s.infoTitle}>{results.caption}</div>
      <div style={s.resultsHead}>
        <span />
        {results.cols.map((c) => <span key={c} style={s.resultsCol}>{c}</span>)}
      </div>
      {results.rows.map((r) => (
        <div key={r.label} style={s.resultsRow}>
          <span style={s.resultsLabel}>{r.label}</span>
          <span style={s.resultsValue}>{r.a}</span>
          <span style={s.resultsValue}>{r.b}</span>
        </div>
      ))}
    </div>
  );
}

function QuoteInfographic({ quote }) {
  return (
    <div style={{ ...s.infoCard, ...s.quoteCard }}>
      <div style={s.quoteBody}>
        <p style={s.quoteText}>&ldquo;{quote.text}&rdquo;</p>
        <div style={s.quoteName}><ArrowRight size={14} /> {quote.name}</div>
        <div style={s.quoteRole}>{quote.role}</div>
      </div>
      <span style={s.quotePhoto} aria-hidden="true">{quote.name.split(" ").map((w) => w[0]).join("")}</span>
    </div>
  );
}

function HighlightInfographic({ highlight }) {
  return (
    <div style={{ ...s.infoCard, ...s.highlightCard }}>
      <span style={s.highlightPhoto} aria-hidden="true" />
      <div>
        <div style={s.highlightStat}>{highlight.stat}</div>
        <div style={s.highlightText}>{highlight.text}</div>
      </div>
    </div>
  );
}

function Facepile() {
  return (
    <div style={s.facepile} aria-label="Shared with">
      {PEOPLE.slice(0, 3).map((p, i) => (
        <span key={p.id} style={{ ...s.avatar, background: p.color, marginLeft: i ? -8 : 0 }} aria-hidden="true">{p.initials}</span>
      ))}
    </div>
  );
}

function Thread({ thread, active, onActivate, onAdd, onCancel, onResolve }) {
  const { id, quote, comments, resolved, composing } = thread;
  const [replying, setReplying] = React.useState(false);
  return (
    <div style={{ ...s.thread, ...(active ? s.threadActive : null), ...(resolved ? s.threadResolved : null) }} onClick={onActivate}>
      {quote && <div style={s.quote}>{quote}</div>}
      {comments.map((c) => (
        <div key={c.id} style={s.comment}>
          <span style={{ ...s.avatar, ...s.avatarSm, background: c.author.color }} aria-hidden="true">{c.author.initials}</span>
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
            <CommentComposer autoFocus placeholder="Reply…" onSubmit={(text, m) => { onAdd(id, text, m); setReplying(false); }} onCancel={() => setReplying(false)} />
          ) : (
            <>
              <button type="button" style={s.threadBtn} onClick={(e) => { e.stopPropagation(); setReplying(true); }}><CornerUpLeft size={13} /> Reply</button>
              <button type="button" style={s.threadBtn} onClick={(e) => { e.stopPropagation(); onResolve(id, true); }}><Check size={13} /> Resolve</button>
            </>
          )}
        </div>
      ) : (
        <button type="button" style={s.threadBtn} onClick={(e) => { e.stopPropagation(); onResolve(id, false); }}>Re-open</button>
      )}
    </div>
  );
}

function CommentComposer({ placeholder, autoFocus, onSubmit, onCancel }) {
  const [text, setText] = React.useState("");
  const [mentions, setMentions] = React.useState([]);
  const [menu, setMenu] = React.useState(null);
  const ref = React.useRef(null);
  React.useEffect(() => { if (autoFocus) ref.current?.focus(); }, [autoFocus]);

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
    const merged = [...mentions];
    PEOPLE.filter((p) => t.includes(`@${p.name}`)).forEach((p) => { if (!merged.some((x) => x.id === p.id)) merged.push(p); });
    onSubmit(t, merged.map((p) => p.id));
    setText(""); setMentions([]);
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
        onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(); if (e.key === "Escape") onCancel?.(); }}
      />
      {menu && candidates.length > 0 && (
        <div style={s.mentionMenu}>
          {candidates.map((p) => (
            <button key={p.id} type="button" style={s.mentionItem} onClick={() => pick(p)}>
              <span style={{ ...s.avatar, ...s.avatarSm, background: p.color }} aria-hidden="true">{p.initials}</span>{p.name}
            </button>
          ))}
        </div>
      )}
      {mentions.length > 0 && (
        <div style={s.mentionChips}>{mentions.map((p) => <span key={p.id} style={s.mentionChip}>@{p.name}</span>)}</div>
      )}
      <div style={s.composerActions}>
        <button type="button" style={s.composerCancel} onClick={onCancel}>Cancel</button>
        <button type="button" style={s.composerSend} onClick={submit} disabled={!text.trim()}>Comment</button>
      </div>
    </div>
  );
}

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

const GREEN = "color-mix(in srgb, var(--color-button-primary-bg) 9%, var(--surface-white))";
const GREEN_DEEP = "color-mix(in srgb, var(--color-button-primary-bg) 16%, var(--surface-white))";

const s = {
  // Screen stays on the canvas; the report is a white "paper" card on top.
  page: { flex: 1, minHeight: 0, display: "flex", flexDirection: "column", fontFamily: "var(--font-sans)" },
  scroll: { flex: 1, minHeight: 0, overflowY: "auto", paddingBottom: 64 },
  wrap: { position: "relative", marginInline: "auto", paddingTop: 8, transition: "width 260ms cubic-bezier(.2,.7,.2,1)" },
  // White paper card; 64px vertical rhythm between every top-level section.
  article: {
    width: ARTICLE_W,
    maxWidth: "100%",
    background: "var(--surface-white)",
    borderRadius: 24,
    padding: "64px 80px",
    display: "flex",
    flexDirection: "column",
    gap: 64,
  },
  header: {},

  back: { display: "inline-flex", alignItems: "center", gap: 8, background: "transparent", border: "none", padding: 0, cursor: "pointer", fontSize: 13, fontWeight: 700, letterSpacing: "0.04em", color: "var(--color-text-tertiary)" },
  title: { marginTop: 20, fontSize: 80, fontWeight: 500, color: "var(--color-text-deep)", lineHeight: 1.06, letterSpacing: "-0.02em" },
  byline: { display: "flex", alignItems: "center", gap: 8, marginTop: 14 },
  bylineName: { fontSize: 14, fontWeight: 700, color: "var(--color-text-deep)" },
  bylineMeta: { fontSize: 13, fontWeight: 500, color: "var(--color-text-tertiary)" },
  dot: { color: "var(--color-text-tertiary)" },

  facepile: { display: "inline-flex", alignItems: "center" },
  avatar: { width: 28, height: 28, borderRadius: 999, border: "2px solid var(--surface-white)", color: "#FFFFFF", fontSize: 10, fontWeight: 700, display: "grid", placeItems: "center", flexShrink: 0 },
  avatarSm: { width: 24, height: 24, border: "none", fontSize: 9 },

  tldr: { display: "flex", flexDirection: "column", gap: 8 },
  tldrKicker: { fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--color-button-primary-bg)" },
  tldrText: { fontSize: 15, lineHeight: 1.6, color: "var(--color-text-medium)" },

  chartFrame: { display: "flex", flexDirection: "column", gap: 8 },
  chartLabel: { fontSize: 13, fontWeight: 600, color: "var(--color-text-medium)" },

  section: {},
  block: {},
  sectionHead: { fontSize: 18, fontWeight: 700, color: "var(--color-text-deep)" },
  sectionBody: { marginTop: 8, fontSize: 15, lineHeight: 1.7, color: "var(--color-text-medium)" },

  // Infographic cards — green tint + a stacked-paper shadow, like the reference.
  infoCard: {
    background: GREEN,
    borderRadius: 16,
    padding: 24,
    boxShadow: `6px 6px 0 -2px ${GREEN_DEEP}, 12px 12px 0 -4px ${GREEN_DEEP}`,
  },
  infoTitle: { fontSize: 15, fontWeight: 700, color: "var(--color-text-deep)", lineHeight: 1.4, marginBottom: 16, maxWidth: 480 },
  resultsHead: { display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", alignItems: "center", marginBottom: 6 },
  resultsCol: { textAlign: "center", fontSize: 13, fontWeight: 700, color: "#FFFFFF", background: "var(--grey-900)", borderRadius: 8, padding: "6px 4px", marginInline: 4 },
  resultsRow: { display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", alignItems: "center", padding: "14px 0", borderTop: "1px solid color-mix(in srgb, var(--color-button-primary-bg) 18%, transparent)" },
  resultsLabel: { fontSize: 13, fontWeight: 600, color: "var(--color-text-medium)" },
  resultsValue: { textAlign: "center", fontSize: 28, fontWeight: 800, color: "var(--color-text-deep)", fontVariantNumeric: "tabular-nums" },

  quoteCard: { display: "flex", alignItems: "center", gap: 24 },
  quoteBody: { flex: 1, minWidth: 0 },
  quoteText: { margin: 0, fontSize: 16, lineHeight: 1.5, color: "var(--color-text-deep)", fontWeight: 600 },
  quoteName: { marginTop: 16, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700, color: "var(--color-text-deep)" },
  quoteRole: { marginTop: 4, fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)" },
  quotePhoto: { width: 110, height: 130, borderRadius: 12, background: "var(--grey-900)", color: "#FFFFFF", display: "grid", placeItems: "center", fontSize: 22, fontWeight: 800, flexShrink: 0 },

  highlightCard: { display: "flex", alignItems: "center", gap: 20 },
  highlightPhoto: { width: 120, height: 90, borderRadius: 12, background: GREEN_DEEP, flexShrink: 0 },
  highlightStat: { fontSize: 44, fontWeight: 800, color: "var(--color-button-primary-bg)", lineHeight: 1 },
  highlightText: { marginTop: 6, fontSize: 14, lineHeight: 1.5, color: "var(--color-text-medium)" },

  pinnedList: { marginTop: 12, display: "flex", flexDirection: "column", gap: 12 },
  pinnedCard: { display: "flex", gap: 12, padding: "14px 16px", borderRadius: 12, background: "var(--color-primary-alpha-04)", borderInlineStart: "3px solid var(--color-button-primary-bg)" },
  pinnedText: { fontSize: 14, fontWeight: 600, color: "var(--color-text-deep)", lineHeight: 1.5 },
  pinnedBy: { marginTop: 4, fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)" },

  authors: { marginTop: 12 },
  authorRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "20px 0", borderTop: "1px solid var(--color-divider-card)" },
  authorName: { fontSize: 15, fontWeight: 700, color: "var(--color-text-deep)" },
  authorRole: { marginTop: 4, fontSize: 13, fontWeight: 500, color: "var(--color-text-tertiary)" },
  authorOrg: { marginTop: 10, fontSize: 13, fontWeight: 500, color: "var(--color-text-medium)" },
  authorAvatar: { width: 64, height: 64, borderRadius: 999, background: "var(--grey-900)", color: "#FFFFFF", display: "grid", placeItems: "center", fontSize: 16, fontWeight: 700, flexShrink: 0 },

  rail: { position: "absolute", top: 16, left: ARTICLE_W + RAIL_GAP, width: RAIL_W, height: "100%", transition: "opacity 200ms ease" },
  railSlot: { position: "absolute", left: 0, width: RAIL_W, transform: "translateY(-50%)", transition: "top 200ms cubic-bezier(.2,.7,.2,1)" },

  resolvedBar: { width: ARTICLE_W, maxWidth: "100%", marginInline: "auto", marginTop: 8 },
  resolvedToggle: { background: "transparent", border: "none", padding: "8px 2px", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "var(--color-button-primary-bg)", fontFamily: "var(--font-sans)" },
  resolvedList: { display: "flex", flexDirection: "column", gap: 12, marginTop: 8 },

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
