/* eslint-disable no-restricted-syntax --
   The ask-box, suggestion cards, citation pills, and source-row buttons are
   clickable surfaces whose shapes don't match Button.jsx's pill/icon/text
   variants — same precedent as AskMiraProPage and MiraConversation. */
"use client";

import React from "react";
import {
  Search, Send, ChevronRight, ChevronDown,
  ShieldCheck, ShieldAlert,
  X, Folder, FolderOpen,
  Sparkles, BookOpen, ArrowUpRight,
} from "lucide-react";
import Card from "./Card";
import VersionBar from "./VersionBar";
import {
  GUIDE_ASK_SUGGESTED,
  GUIDE_ASK_SOURCES,
  GUIDE_ASK_SAMPLE_ANSWER,
  GUIDE_ASK_TOPICS,
  ASK_SOURCE_TYPE_TONE,
  ASK_VERIFIED_TONE,
} from "./mocks/guideAsk";

const DIRECTIONS = [
  { id: "search", label: "Search", iterations: [] },
  { id: "chat", label: "Chat", iterations: [] },
  { id: "hub", label: "Hub", iterations: [] },
];

/**
 * GuideAskPage — Agent-side Guide ask surface.
 *
 * Three structurally distinct directions behind a VersionBar:
 *   1. Search  — Perplexity-style: search bar → synthesized answer + numbered
 *                citations → source cards below.
 *   2. Chat    — AMP-style conversation thread with citation pills, sources drawer.
 *   3. Hub     — Knowledge-index-first: browsable topics + ask bar, answer overlay.
 *
 * All directions share: ask input (text + mic), grounded answers with citation
 * markers, source cards with verified/unverified status, and suggested questions.
 */
export default function GuideAskPage({ locale = "en" }) {
  const [direction, setDirection] = React.useState("search");

  return (
    <>
      {direction === "search" && <SearchDirection />}
      {direction === "chat" && <ChatDirection />}
      {direction === "hub" && <HubDirection />}
      <VersionBar
        versions={DIRECTIONS}
        value={{ versionId: direction }}
        onChange={(v) => setDirection(v.versionId)}
        tabsMode
        help={HELP_CONTENT}
      />
    </>
  );
}

const HELP_CONTENT = (
  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-medium)" }}>
      <strong>Guide Agent Ask Surface</strong> — 3 directions exploring how
      agents access the org&apos;s tribal-wisdom index.
    </p>
    <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-tertiary)" }}>
      <strong>Search:</strong> Perplexity-style — search → answer + citations → sources.<br />
      <strong>Chat:</strong> Conversation thread with inline citations, sources drawer.<br />
      <strong>Hub:</strong> Knowledge index first — browse topics, then ask.
    </p>
  </div>
);

// ============================================================================
// DIRECTION 1 — Search (Perplexity-style)
// ============================================================================

function SearchDirection() {
  const [query, setQuery] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);
  const [expandedSource, setExpandedSource] = React.useState(null);

  const handleSubmit = () => {
    if (!query.trim()) return;
    setSubmitted(true);
  };

  const handleSuggestion = (text) => {
    setQuery(text);
    setSubmitted(true);
  };

  return (
    <div style={s.searchRoot}>
      {!submitted ? (
        <SearchLanding
          query={query}
          onChange={setQuery}
          onSubmit={handleSubmit}
          onSuggestion={handleSuggestion}
        />
      ) : (
        <SearchResults
          query={query}
          onChange={setQuery}
          onSubmit={() => {}}
          onReset={() => { setSubmitted(false); setQuery(""); setExpandedSource(null); }}
          expandedSource={expandedSource}
          onExpandSource={setExpandedSource}
        />
      )}
    </div>
  );
}

function SearchLanding({ query, onChange, onSubmit, onSuggestion }) {
  return (
    <div style={s.searchLanding}>
      <div style={s.searchHero}>
        <span style={s.heroIcon} aria-hidden="true">
          <BookOpen size={24} color="var(--color-icon-tertiary-fg)" />
        </span>
        <h1 style={s.heroHeading}>Ask the Guide</h1>
        <p style={s.heroSub}>
          Search your organization&apos;s best practices — every answer is grounded
          in verified plays from real interactions.
        </p>
      </div>

      <SearchBar query={query} onChange={onChange} onSubmit={onSubmit} large />

      <div style={s.suggestGrid}>
        {GUIDE_ASK_SUGGESTED.slice(0, 4).map((sq) => (
          <SuggestionCard key={sq.id} item={sq} onClick={() => onSuggestion(sq.text)} />
        ))}
      </div>
    </div>
  );
}

function SearchResults({ query, onChange, onSubmit, onReset, expandedSource, onExpandSource }) {
  return (
    <div style={s.searchResults}>
      <div style={s.searchResultsHeader}>
        <button type="button" onClick={onReset} style={s.backBtn} className="ga-focusable">
          <ChevronRight size={16} color="var(--color-text-tertiary)" style={{ transform: "rotate(180deg)" }} />
          <span style={s.backLabel}>Back</span>
        </button>
        <SearchBar query={query} onChange={onChange} onSubmit={onSubmit} />
      </div>

      <Card padX={24} padY={24}>
        <div style={s.answerMeta}>
          <Sparkles size={14} color="var(--color-icon-tertiary-fg)" />
          <span style={s.answerMetaLabel}>Answer grounded in {GUIDE_ASK_SOURCES.length} plays</span>
        </div>
        <AnswerBlock text={GUIDE_ASK_SAMPLE_ANSWER.text} sources={GUIDE_ASK_SOURCES} />
      </Card>

      <div style={s.sourcesSection}>
        <h3 style={s.sourcesHeading}>Sources ({GUIDE_ASK_SOURCES.length})</h3>
        <ol style={s.sourcesList} role="list">
          {GUIDE_ASK_SOURCES.map((src, i) => (
            <li key={src.id} style={{ listStyle: "none" }}>
              <SourceCard
                source={src}
                index={i + 1}
                expanded={expandedSource === src.id}
                onToggle={() => onExpandSource(expandedSource === src.id ? null : src.id)}
              />
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

// ============================================================================
// DIRECTION 2 — Chat (AMP-style conversation)
// ============================================================================

function ChatDirection() {
  const [query, setQuery] = React.useState("");
  const [turns, setTurns] = React.useState([]);
  const [sourcesOpen, setSourcesOpen] = React.useState(false);
  const threadRef = React.useRef(null);

  const hasConversation = turns.length > 0;

  const handleSubmit = () => {
    if (!query.trim()) return;
    const userTurn = { id: `u-${Date.now()}`, role: "user", text: query.trim(), timestamp: "Just now" };
    const guideTurn = {
      id: `g-${Date.now()}`,
      role: "guide",
      text: GUIDE_ASK_SAMPLE_ANSWER.text,
      citationIds: GUIDE_ASK_SAMPLE_ANSWER.citationIds,
      timestamp: "Just now",
    };
    setTurns((prev) => [...prev, userTurn, guideTurn]);
    setQuery("");
  };

  const handleSuggestion = (text) => {
    const userTurn = { id: `u-${Date.now()}`, role: "user", text, timestamp: "Just now" };
    const guideTurn = {
      id: `g-${Date.now()}`,
      role: "guide",
      text: GUIDE_ASK_SAMPLE_ANSWER.text,
      citationIds: GUIDE_ASK_SAMPLE_ANSWER.citationIds,
      timestamp: "Just now",
    };
    setTurns([userTurn, guideTurn]);
  };

  React.useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [turns]);

  return (
    <div style={s.chatRoot}>
      <div style={{ ...s.chatMain, flex: sourcesOpen ? "1 1 0" : "1 1 100%" }}>
        {!hasConversation ? (
          <ChatLanding onSuggestion={handleSuggestion} />
        ) : (
          <ChatThread ref={threadRef} turns={turns} onOpenSources={() => setSourcesOpen(true)} />
        )}
        <ChatComposer
          query={query}
          onChange={setQuery}
          onSubmit={handleSubmit}
          sourceCount={GUIDE_ASK_SOURCES.length}
          onToggleSources={() => setSourcesOpen((o) => !o)}
          sourcesOpen={sourcesOpen}
        />
      </div>

      {sourcesOpen && (
        <ChatSourcesPanel
          sources={GUIDE_ASK_SOURCES}
          onClose={() => setSourcesOpen(false)}
        />
      )}
    </div>
  );
}

function ChatLanding({ onSuggestion }) {
  return (
    <div style={s.chatLandingWrap}>
      <span style={s.heroIcon} aria-hidden="true">
        <BookOpen size={24} color="var(--color-icon-tertiary-fg)" />
      </span>
      <h2 style={s.heroHeading}>Ask the Guide</h2>
      <p style={s.heroSub}>
        Get answers grounded in your org&apos;s verified best practices.
      </p>
      <div style={s.chatSuggestRow}>
        {GUIDE_ASK_SUGGESTED.slice(0, 3).map((sq) => (
          <button
            key={sq.id}
            type="button"
            onClick={() => onSuggestion(sq.text)}
            style={s.chatSuggestChip}
            className="ga-focusable"
          >
            <span style={s.chatSuggestText}>{sq.text}</span>
            <ArrowUpRight size={14} color="var(--color-text-tertiary)" style={{ flexShrink: 0 }} />
          </button>
        ))}
      </div>
    </div>
  );
}

const ChatThread = React.forwardRef(function ChatThread({ turns, onOpenSources }, ref) {
  return (
    <div ref={ref} style={s.chatThread}>
      {turns.map((turn) => (
        <ChatTurn key={turn.id} turn={turn} onOpenSources={onOpenSources} />
      ))}
    </div>
  );
});

function ChatTurn({ turn, onOpenSources }) {
  const isUser = turn.role === "user";
  return (
    <div style={{ ...s.chatTurn, alignItems: isUser ? "flex-end" : "flex-start" }}>
      {isUser ? (
        <div style={s.chatUserBubble}>
          <p style={s.chatUserText}>{turn.text}</p>
        </div>
      ) : (
        <div style={s.chatGuideBubble}>
          <div style={s.chatGuideHeader}>
            <Sparkles size={14} color="var(--color-icon-tertiary-fg)" />
            <span style={s.chatGuideLabel}>Guide</span>
          </div>
          <AnswerBlock
            text={turn.text}
            sources={GUIDE_ASK_SOURCES}
            compact
          />
          {turn.citationIds && turn.citationIds.length > 0 && (
            <button type="button" onClick={onOpenSources} style={s.chatViewSources}>
              <Folder size={14} color="var(--color-text-tertiary)" />
              <span style={s.chatViewSourcesLabel}>
                {turn.citationIds.length} sources cited
              </span>
              <ChevronRight size={14} color="var(--color-text-tertiary)" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ChatComposer({ query, onChange, onSubmit, sourceCount, onToggleSources, sourcesOpen }) {
  return (
    <div style={s.chatComposerWrap}>
      <div style={s.chatComposerRow}>
        <button
          type="button"
          onClick={onToggleSources}
          style={{ ...s.composerSourceBtn, background: sourcesOpen ? "var(--color-icon-tertiary-bg)" : "transparent" }}
          aria-label={`Sources (${sourceCount})`}
        >
          {sourcesOpen ? <FolderOpen size={16} /> : <Folder size={16} />}
          <span style={s.composerSourceCount}>{sourceCount}</span>
        </button>
        <div style={s.chatInputWrap}>
          <input
            type="text"
            value={query}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") onSubmit(); }}
            placeholder="Ask the guide anything…"
            aria-label="Ask the guide"
            style={s.chatInput}
            className="ga-focusable"
          />
        </div>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!query.trim()}
          aria-label="Send"
          style={{ ...s.sendBtn, opacity: query.trim() ? 1 : 0.4 }}
          className="ga-focusable"
        >
          <Send size={16} color="var(--surface-white)" />
        </button>
      </div>
      <p style={s.disclaimer}>
        Answers are generated from your organization&apos;s indexed plays. Verify critical information with your team lead.
      </p>
    </div>
  );
}

function ChatSourcesPanel({ sources, onClose }) {
  const [search, setSearch] = React.useState("");
  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sources;
    return sources.filter((s) =>
      s.title.toLowerCase().includes(q) || s.type.toLowerCase().includes(q),
    );
  }, [sources, search]);

  return (
    <aside style={s.chatSourcesPanel} aria-label="Sources panel">
      <div style={s.chatSourcesHeader}>
        <span style={s.chatSourcesTitle}>
          <Folder size={16} color="var(--color-text-deep)" />
          Sources ({sources.length})
        </span>
        <button type="button" onClick={onClose} aria-label="Close sources" style={s.iconBtn} className="ga-focusable">
          <X size={16} color="var(--color-text-tertiary)" />
        </button>
      </div>
      <div style={s.chatSourcesSearch}>
        <Search size={14} color="var(--color-text-tertiary)" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search sources…"
          aria-label="Search sources"
          style={s.chatSourcesInput}
          className="ga-focusable"
        />
      </div>
      <div style={s.chatSourcesList}>
        {filtered.map((src, i) => (
          <SourceRow key={src.id} source={src} index={i + 1} />
        ))}
      </div>
    </aside>
  );
}

// ============================================================================
// DIRECTION 3 — Hub (Knowledge-index-first)
// ============================================================================

function HubDirection() {
  const [query, setQuery] = React.useState("");
  const [selectedTopic, setSelectedTopic] = React.useState(null);
  const [showAnswer, setShowAnswer] = React.useState(false);

  const handleSubmit = () => {
    if (!query.trim()) return;
    setShowAnswer(true);
  };

  const handleSuggestion = (text) => {
    setQuery(text);
    setShowAnswer(true);
  };

  return (
    <div style={s.hubRoot}>
      <div style={s.hubHero}>
        <span style={s.heroIcon} aria-hidden="true">
          <BookOpen size={24} color="var(--color-icon-tertiary-fg)" />
        </span>
        <h1 style={s.heroHeading}>Knowledge Guide</h1>
        <p style={s.heroSub}>
          Browse your organization&apos;s best practices or ask a question.
        </p>
      </div>

      <SearchBar query={query} onChange={setQuery} onSubmit={handleSubmit} large />

      {showAnswer ? (
        <HubAnswerOverlay
          query={query}
          onClose={() => { setShowAnswer(false); setQuery(""); }}
        />
      ) : (
        <>
          <div style={s.hubTopicsSection}>
            <h3 style={s.hubSectionTitle}>Popular topics</h3>
            <div style={s.hubTopicGrid}>
              {GUIDE_ASK_TOPICS.map((topic) => (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  selected={selectedTopic === topic.id}
                  onClick={() => setSelectedTopic(selectedTopic === topic.id ? null : topic.id)}
                />
              ))}
            </div>
          </div>

          <div style={s.hubSuggestSection}>
            <h3 style={s.hubSectionTitle}>Frequently asked</h3>
            <div style={s.hubSuggestList}>
              {GUIDE_ASK_SUGGESTED.map((sq) => (
                <button
                  key={sq.id}
                  type="button"
                  onClick={() => handleSuggestion(sq.text)}
                  style={s.hubSuggestRow}
                  className="ga-focusable"
                >
                  <span style={s.hubSuggestTopicPill}>{sq.topic}</span>
                  <span style={s.hubSuggestText}>{sq.text}</span>
                  <ChevronRight size={16} color="var(--color-text-tertiary)" />
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function TopicCard({ topic, selected, onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="ga-focusable"
      style={{
        ...s.topicCard,
        background: selected ? "var(--color-primary-alpha-04)" : "var(--surface-white)",
        borderColor: selected ? "var(--color-button-primary-bg)" : "var(--color-divider-card)",
        boxShadow: hover && !selected ? "0 4px 12px rgba(69,70,79,0.10)" : "none",
      }}
    >
      <span style={s.topicIcon}>
        <BookOpen size={16} color="var(--color-icon-tertiary-fg)" />
      </span>
      <span style={s.topicLabel}>{topic.label}</span>
      <span style={s.topicCount}>{topic.count} plays</span>
    </button>
  );
}

function HubAnswerOverlay({ query, onClose }) {
  const [expandedSource, setExpandedSource] = React.useState(null);
  return (
    <div style={s.hubAnswerWrap}>
      <div style={s.hubAnswerHeader}>
        <button type="button" onClick={onClose} style={s.backBtn} className="ga-focusable">
          <ChevronRight size={16} color="var(--color-text-tertiary)" style={{ transform: "rotate(180deg)" }} />
          <span style={s.backLabel}>Back to topics</span>
        </button>
      </div>

      <Card padX={24} padY={24}>
        <div style={s.answerMeta}>
          <Sparkles size={14} color="var(--color-icon-tertiary-fg)" />
          <span style={s.answerMetaLabel}>Answer grounded in {GUIDE_ASK_SOURCES.length} plays</span>
        </div>
        <AnswerBlock text={GUIDE_ASK_SAMPLE_ANSWER.text} sources={GUIDE_ASK_SOURCES} />
      </Card>

      <div style={s.sourcesSection}>
        <h3 style={s.sourcesHeading}>Sources ({GUIDE_ASK_SOURCES.length})</h3>
        <ol style={s.sourcesList} role="list">
          {GUIDE_ASK_SOURCES.map((src, i) => (
            <li key={src.id} style={{ listStyle: "none" }}>
              <SourceCard
                source={src}
                index={i + 1}
                expanded={expandedSource === src.id}
                onToggle={() => setExpandedSource(expandedSource === src.id ? null : src.id)}
              />
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

// ============================================================================
// SHARED PRIMITIVES
// ============================================================================

function SearchBar({ query, onChange, onSubmit, large }) {
  return (
    <div style={{ ...s.searchBar, ...(large ? s.searchBarLarge : {}) }}>
      <Search size={18} color="var(--color-text-tertiary)" style={{ flexShrink: 0 }} />
      <input
        type="text"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") onSubmit(); }}
        placeholder="Ask the guide anything…"
        aria-label="Ask the guide"
        style={s.searchInput}
        className="ga-focusable"
      />
      <button
        type="button"
        onClick={onSubmit}
        disabled={!query.trim()}
        aria-label="Search"
        style={{ ...s.sendBtn, opacity: query.trim() ? 1 : 0.4 }}
        className="ga-focusable"
      >
        <Send size={16} color="var(--surface-white)" />
      </button>
    </div>
  );
}

function SuggestionCard({ item, onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="ga-focusable"
      style={{
        ...s.suggestCard,
        boxShadow: hover ? "0 4px 12px rgba(69,70,79,0.12)" : "var(--shadow-card)",
      }}
    >
      <span style={s.suggestTopic}>{item.topic}</span>
      <span style={s.suggestText}>{item.text}</span>
      <ChevronRight size={16} color="var(--color-text-tertiary)" style={{ alignSelf: "flex-end" }} />
    </button>
  );
}

function AnswerBlock({ text, sources, compact }) {
  const parts = React.useMemo(() => parseAnswerText(text, sources), [text, sources]);
  return (
    <div style={{ ...s.answerBlock, fontSize: compact ? 13 : 14 }}>
      {parts.map((part, i) =>
        part.type === "text" ? (
          <span key={i}>{part.value}</span>
        ) : (
          <CitationPill key={i} index={part.index} source={part.source} />
        ),
      )}
    </div>
  );
}

function parseAnswerText(text, sources) {
  const parts = [];
  const regex = /\[(\d+)\]/g;
  let last = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      parts.push({ type: "text", value: text.slice(last, match.index) });
    }
    const idx = parseInt(match[1], 10);
    parts.push({ type: "citation", index: idx, source: sources[idx - 1] || null });
    last = regex.lastIndex;
  }
  if (last < text.length) {
    parts.push({ type: "text", value: text.slice(last) });
  }
  return parts;
}

function CitationPill({ index, source }) {
  const [hover, setHover] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  return (
    <span style={{ position: "relative", display: "inline" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        aria-label={`Source ${index}`}
        aria-expanded={open}
        className="ga-focusable"
        style={{
          ...s.citationPill,
          background: hover ? "var(--color-primary-alpha-12)" : "var(--color-primary-alpha-04)",
        }}
      >
        {index}
      </button>
      {open && source && <CitationPopover source={source} index={index} onClose={() => setOpen(false)} />}
    </span>
  );
}

function CitationPopover({ source, index, onClose }) {
  const tone = source.verified ? ASK_VERIFIED_TONE.verified : ASK_VERIFIED_TONE.unverified;
  const typeTone = ASK_SOURCE_TYPE_TONE[source.type] || ASK_SOURCE_TYPE_TONE.Play;
  return (
    <div style={s.citationPopover} role="dialog" aria-label={`Citation ${index} details`}>
      <div style={s.citationPopoverHeader}>
        <span style={s.citationPopoverIndex}>[{index}]</span>
        <span style={s.citationPopoverTitle}>{source.title}</span>
        <button type="button" onClick={onClose} aria-label="Close" style={s.iconBtn} className="ga-focusable">
          <X size={14} color="var(--color-text-tertiary)" />
        </button>
      </div>
      <p style={s.citationExcerpt}>{source.excerpt}</p>
      <div style={s.citationMeta}>
        <span style={{ ...s.verifiedPill, background: tone.bg, color: tone.fg }}>
          {source.verified ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
          {tone.label}
        </span>
        <span style={{ ...s.typePill, background: typeTone.bg, color: typeTone.fg }}>
          {source.type}
        </span>
      </div>
      <div style={s.citationDetails}>
        {source.verifiedBy && (
          <span style={s.citationDetailRow}>Verified by: {source.verifiedBy}</span>
        )}
        <span style={s.citationDetailRow}>Generated: {source.generatedAt}</span>
        {source.expiresAt && (
          <span style={s.citationDetailRow}>Expires: {source.expiresAt}</span>
        )}
        <span style={s.citationDetailRow}>Source: {source.interactionId}</span>
      </div>
    </div>
  );
}

function SourceCard({ source, index, expanded, onToggle }) {
  const tone = source.verified ? ASK_VERIFIED_TONE.verified : ASK_VERIFIED_TONE.unverified;
  const typeTone = ASK_SOURCE_TYPE_TONE[source.type] || ASK_SOURCE_TYPE_TONE.Play;

  return (
    <Card style={s.sourceCardWrap}>
      <button type="button" onClick={onToggle} style={s.sourceCardHeader} className="ga-focusable">
        <span style={s.sourceIndex}>{index}</span>
        <div style={s.sourceCardBody}>
          <span style={s.sourceCardTitle}>{source.title}</span>
          <div style={s.sourceCardMeta}>
            <span style={{ ...s.verifiedPill, background: tone.bg, color: tone.fg }}>
              {source.verified ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
              {tone.label}
            </span>
            <span style={{ ...s.typePill, background: typeTone.bg, color: typeTone.fg }}>
              {source.type}
            </span>
            <span style={s.sourceAuthor}>{source.author.name}</span>
          </div>
        </div>
        <ChevronDown
          size={16}
          color="var(--color-text-tertiary)"
          style={{ flexShrink: 0, transform: expanded ? "rotate(180deg)" : "none", transition: "transform 150ms ease" }}
        />
      </button>
      {expanded && (
        <div style={s.sourceCardExpanded}>
          <p style={s.sourceExcerpt}>{source.excerpt}</p>
          <div style={s.sourceDetailGrid}>
            {source.verifiedBy && (
              <span style={s.sourceDetailItem}>
                <span style={s.sourceDetailLabel}>Verified by</span>
                <span style={s.sourceDetailValue}>{source.verifiedBy}</span>
              </span>
            )}
            <span style={s.sourceDetailItem}>
              <span style={s.sourceDetailLabel}>Generated</span>
              <span style={s.sourceDetailValue}>{source.generatedAt}</span>
            </span>
            {source.expiresAt && (
              <span style={s.sourceDetailItem}>
                <span style={s.sourceDetailLabel}>Expires</span>
                <span style={s.sourceDetailValue}>{source.expiresAt}</span>
              </span>
            )}
            <span style={s.sourceDetailItem}>
              <span style={s.sourceDetailLabel}>Source interaction</span>
              <span style={s.sourceDetailValue}>{source.interactionId}</span>
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}

function SourceRow({ source, index }) {
  const tone = source.verified ? ASK_VERIFIED_TONE.verified : ASK_VERIFIED_TONE.unverified;
  const typeTone = ASK_SOURCE_TYPE_TONE[source.type] || ASK_SOURCE_TYPE_TONE.Play;

  return (
    <div style={s.sourceRow}>
      <div style={s.sourceRowTop}>
        <span style={s.sourceIndex}>{index}</span>
        <span style={s.sourceRowTitle}>{source.title}</span>
      </div>
      <div style={s.sourceRowMeta}>
        <span style={{ ...s.verifiedPillSmall, background: tone.bg, color: tone.fg }}>
          {source.verified ? <ShieldCheck size={10} /> : <ShieldAlert size={10} />}
          {tone.label}
        </span>
        <span style={{ ...s.typePillSmall, background: typeTone.bg, color: typeTone.fg }}>
          {source.type}
        </span>
        <span style={s.sourceRowAuthor}>{source.author.name}</span>
      </div>
      <p style={s.sourceRowExcerpt}>{source.excerpt}</p>
    </div>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const s = {
  // --- Shared hero ---
  heroIcon: {
    width: 48, height: 48, borderRadius: 999,
    background: "var(--color-icon-tertiary-bg)",
    display: "inline-grid", placeItems: "center",
  },
  heroHeading: {
    margin: 0,
    fontSize: 24, fontWeight: 700, lineHeight: "32px",
    color: "var(--color-text-deep)",
    fontFamily: "var(--font-sans)",
  },
  heroSub: {
    margin: 0,
    fontSize: 14, fontWeight: 400, lineHeight: "22px",
    color: "var(--color-text-tertiary)",
    fontFamily: "var(--font-sans)",
    maxWidth: 480, textAlign: "center",
  },

  // --- Search bar ---
  searchBar: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "10px 16px",
    background: "var(--surface-white)",
    border: "1px solid var(--color-divider-card)",
    borderRadius: 12,
    width: "100%", maxWidth: 640,
  },
  searchBarLarge: {
    padding: "14px 20px",
    borderRadius: 16,
    boxShadow: "0 2px 8px rgba(69,70,79,0.08)",
  },
  searchInput: {
    flex: 1, border: "none",
    background: "transparent",
    fontSize: 14, color: "var(--color-text-deep)",
    fontFamily: "var(--font-sans)",
  },
  sendBtn: {
    width: 32, height: 32, borderRadius: 999,
    border: "none",
    background: "var(--color-button-primary-bg)",
    cursor: "pointer", padding: 0,
    display: "inline-grid", placeItems: "center",
    flexShrink: 0,
    transition: "opacity 150ms ease",
  },

  // --- Back button ---
  backBtn: {
    display: "inline-flex", alignItems: "center", gap: 4,
    background: "transparent", border: "none",
    cursor: "pointer", padding: "4px 0",
    fontFamily: "var(--font-sans)",
  },
  backLabel: {
    fontSize: 13, fontWeight: 500, color: "var(--color-text-tertiary)",
  },

  // --- Suggestion cards ---
  suggestGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 12, width: "100%", maxWidth: 640,
  },
  suggestCard: {
    appearance: "none", border: "none",
    background: "var(--surface-white)", borderRadius: 10,
    padding: "16px 16px 12px",
    display: "flex", flexDirection: "column", gap: 8,
    cursor: "pointer", textAlign: "start",
    fontFamily: "var(--font-sans)",
    boxShadow: "var(--shadow-card)",
    transition: "box-shadow 120ms ease",
  },
  suggestTopic: {
    fontSize: 11, fontWeight: 600, letterSpacing: "0.5px",
    color: "var(--color-button-primary-bg)",
    textTransform: "uppercase",
  },
  suggestText: {
    fontSize: 13, fontWeight: 400, lineHeight: "18px",
    color: "var(--color-text-medium)",
  },

  // --- DIRECTION 1: Search ---
  searchRoot: {
    display: "flex", flexDirection: "column", gap: 24,
    width: "100%", fontFamily: "var(--font-sans)",
  },
  searchLanding: {
    display: "flex", flexDirection: "column",
    alignItems: "center", gap: 24,
    paddingTop: 64, paddingBottom: 80,
  },
  searchHero: {
    display: "flex", flexDirection: "column",
    alignItems: "center", gap: 12,
  },
  searchResults: {
    display: "flex", flexDirection: "column", gap: 24,
  },
  searchResultsHeader: {
    display: "flex", alignItems: "center", gap: 16,
  },
  answerMeta: {
    display: "inline-flex", alignItems: "center", gap: 8,
  },
  answerMetaLabel: {
    fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)",
    fontFamily: '"JetBrains Mono", monospace',
  },
  answerBlock: {
    fontSize: 14, fontWeight: 400, lineHeight: "22px",
    color: "var(--color-text-deep)",
    fontFamily: "var(--font-sans)",
    whiteSpace: "pre-wrap",
  },
  sourcesSection: {
    display: "flex", flexDirection: "column", gap: 12,
  },
  sourcesHeading: {
    margin: 0,
    fontSize: 14, fontWeight: 600, color: "var(--color-text-medium)",
    fontFamily: "var(--font-sans)",
  },
  sourcesList: {
    display: "flex", flexDirection: "column", gap: 8,
    margin: 0, padding: 0,
  },

  // --- Citation pill ---
  citationPill: {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    minWidth: 20, height: 18,
    padding: "0 5px",
    borderRadius: 4,
    border: "none", cursor: "pointer",
    fontSize: 11, fontWeight: 700,
    color: "var(--color-button-primary-bg)",
    fontFamily: '"JetBrains Mono", monospace',
    verticalAlign: "super",
    lineHeight: 1,
    transition: "background 120ms ease",
  },
  citationPopover: {
    position: "absolute", top: "100%", left: 0,
    width: 340, zIndex: 10,
    background: "var(--surface-white)",
    borderRadius: 10,
    boxShadow: "0 8px 24px rgba(69,70,79,0.18)",
    padding: 16,
    display: "flex", flexDirection: "column", gap: 12,
    marginTop: 4,
  },
  citationPopoverHeader: {
    display: "flex", alignItems: "flex-start", gap: 8,
  },
  citationPopoverIndex: {
    fontSize: 12, fontWeight: 700,
    color: "var(--color-button-primary-bg)",
    fontFamily: '"JetBrains Mono", monospace',
    flexShrink: 0,
  },
  citationPopoverTitle: {
    flex: 1, minWidth: 0,
    fontSize: 13, fontWeight: 500, lineHeight: "18px",
    color: "var(--color-text-deep)",
  },
  citationExcerpt: {
    margin: 0,
    fontSize: 12, fontWeight: 400, lineHeight: "18px",
    color: "var(--color-text-tertiary)",
    fontStyle: "italic",
  },
  citationMeta: {
    display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
  },
  citationDetails: {
    display: "flex", flexDirection: "column", gap: 4,
    borderTop: "1px solid var(--color-divider-card)",
    paddingTop: 8,
  },
  citationDetailRow: {
    fontSize: 11, fontWeight: 400,
    color: "var(--color-text-tertiary)",
    fontFamily: '"JetBrains Mono", monospace',
  },

  // --- Verified / type pills ---
  verifiedPill: {
    display: "inline-flex", alignItems: "center", gap: 4,
    height: 22, padding: "0 8px",
    borderRadius: 4,
    fontSize: 11, fontWeight: 600,
    fontFamily: "var(--font-sans)",
  },
  verifiedPillSmall: {
    display: "inline-flex", alignItems: "center", gap: 3,
    height: 18, padding: "0 6px",
    borderRadius: 4,
    fontSize: 10, fontWeight: 600,
    fontFamily: "var(--font-sans)",
  },
  typePill: {
    display: "inline-flex", alignItems: "center",
    height: 22, padding: "0 8px",
    borderRadius: 4,
    fontSize: 11, fontWeight: 500,
    fontFamily: '"JetBrains Mono", monospace',
  },
  typePillSmall: {
    display: "inline-flex", alignItems: "center",
    height: 18, padding: "0 6px",
    borderRadius: 4,
    fontSize: 10, fontWeight: 500,
    fontFamily: '"JetBrains Mono", monospace',
  },

  // --- Source card (expandable) ---
  sourceCardWrap: {
    overflow: "hidden",
  },
  sourceCardHeader: {
    display: "flex", alignItems: "flex-start", gap: 12,
    padding: "14px 16px",
    width: "100%",
    background: "transparent", border: "none",
    cursor: "pointer", textAlign: "start",
    fontFamily: "var(--font-sans)",
  },
  sourceIndex: {
    width: 22, height: 22, borderRadius: 999,
    background: "var(--color-primary-alpha-04)",
    color: "var(--color-button-primary-bg)",
    display: "inline-grid", placeItems: "center",
    fontSize: 11, fontWeight: 700,
    fontFamily: '"JetBrains Mono", monospace',
    flexShrink: 0,
  },
  sourceCardBody: {
    flex: 1, minWidth: 0,
    display: "flex", flexDirection: "column", gap: 6,
  },
  sourceCardTitle: {
    fontSize: 13, fontWeight: 500, lineHeight: "18px",
    color: "var(--color-text-deep)",
  },
  sourceCardMeta: {
    display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap",
  },
  sourceAuthor: {
    fontSize: 12, fontWeight: 400,
    color: "var(--color-text-tertiary)",
  },
  sourceCardExpanded: {
    padding: "0 16px 16px 50px",
    display: "flex", flexDirection: "column", gap: 12,
    borderTop: "1px solid var(--color-divider-card)",
  },
  sourceExcerpt: {
    margin: 0, paddingTop: 12,
    fontSize: 13, fontWeight: 400, lineHeight: "20px",
    color: "var(--color-text-medium)",
    fontStyle: "italic",
  },
  sourceDetailGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px 16px",
  },
  sourceDetailItem: {
    display: "flex", flexDirection: "column", gap: 2,
  },
  sourceDetailLabel: {
    fontSize: 11, fontWeight: 600, letterSpacing: "0.3px",
    color: "var(--color-text-tertiary)",
    textTransform: "uppercase",
  },
  sourceDetailValue: {
    fontSize: 12, fontWeight: 400,
    color: "var(--color-text-deep)",
    fontFamily: '"JetBrains Mono", monospace',
  },

  // --- Source row (compact, for chat panel) ---
  sourceRow: {
    display: "flex", flexDirection: "column", gap: 8,
    padding: "12px 0",
    borderBottom: "1px solid var(--color-divider-card)",
  },
  sourceRowTop: {
    display: "flex", alignItems: "flex-start", gap: 8,
  },
  sourceRowTitle: {
    flex: 1, minWidth: 0,
    fontSize: 13, fontWeight: 400, lineHeight: "18px",
    color: "var(--color-text-medium)",
  },
  sourceRowMeta: {
    display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap",
    paddingLeft: 30,
  },
  sourceRowAuthor: {
    fontSize: 11, fontWeight: 400,
    color: "var(--color-text-tertiary)",
  },
  sourceRowExcerpt: {
    margin: 0, paddingLeft: 30,
    fontSize: 12, fontWeight: 400, lineHeight: "17px",
    color: "var(--color-text-tertiary)",
    fontStyle: "italic",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },

  // --- DIRECTION 2: Chat ---
  chatRoot: {
    display: "flex",
    width: "100%", minHeight: 0,
    fontFamily: "var(--font-sans)",
    height: "calc(100vh - 140px)",
  },
  chatMain: {
    display: "flex", flexDirection: "column",
    minWidth: 0,
    transition: "flex 200ms ease",
  },
  chatLandingWrap: {
    flex: 1,
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    gap: 16, padding: 24,
  },
  chatSuggestRow: {
    display: "flex", flexDirection: "column",
    gap: 8, width: "100%", maxWidth: 480,
    marginTop: 8,
  },
  chatSuggestChip: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "12px 16px",
    background: "var(--surface-white)", border: "1px solid var(--color-divider-card)",
    borderRadius: 10, cursor: "pointer",
    fontFamily: "var(--font-sans)",
    textAlign: "start",
    transition: "background 120ms ease",
  },
  chatSuggestText: {
    flex: 1, minWidth: 0,
    fontSize: 13, fontWeight: 400, lineHeight: "18px",
    color: "var(--color-text-medium)",
  },
  chatThread: {
    flex: 1, minHeight: 0,
    overflowY: "auto",
    display: "flex", flexDirection: "column",
    gap: 24, padding: 24,
  },
  chatTurn: {
    display: "flex", flexDirection: "column",
  },
  chatUserBubble: {
    maxWidth: "70%",
    background: "var(--color-primary-alpha-04)",
    borderRadius: "16px 16px 4px 16px",
    padding: "12px 16px",
  },
  chatUserText: {
    margin: 0,
    fontSize: 14, fontWeight: 400, lineHeight: "22px",
    color: "var(--color-text-deep)",
  },
  chatGuideBubble: {
    maxWidth: "85%",
    display: "flex", flexDirection: "column", gap: 12,
  },
  chatGuideHeader: {
    display: "inline-flex", alignItems: "center", gap: 8,
  },
  chatGuideLabel: {
    fontSize: 12, fontWeight: 600, letterSpacing: "0.3px",
    color: "var(--color-text-tertiary)",
    textTransform: "uppercase",
  },
  chatViewSources: {
    display: "inline-flex", alignItems: "center", gap: 8,
    background: "transparent", border: "none",
    cursor: "pointer", padding: "8px 0 0",
    fontFamily: "var(--font-sans)",
  },
  chatViewSourcesLabel: {
    fontSize: 12, fontWeight: 400,
    color: "var(--color-text-tertiary)",
    fontFamily: '"JetBrains Mono", monospace',
  },

  // Chat composer
  chatComposerWrap: {
    borderTop: "1px solid var(--color-divider-card)",
    padding: "16px 24px",
    flexShrink: 0,
    display: "flex", flexDirection: "column", gap: 8,
  },
  chatComposerRow: {
    display: "flex", alignItems: "center", gap: 10,
  },
  composerSourceBtn: {
    display: "inline-flex", alignItems: "center", gap: 6,
    height: 36, padding: "0 10px",
    border: "1px solid var(--color-divider-card)",
    borderRadius: 999, cursor: "pointer",
    fontFamily: "var(--font-sans)",
    color: "var(--color-text-deep)",
    transition: "background 120ms ease",
  },
  composerSourceCount: {
    fontSize: 12, fontWeight: 700,
    fontFamily: '"JetBrains Mono", monospace',
  },
  chatInputWrap: {
    flex: 1, display: "flex", alignItems: "center", gap: 8,
    padding: "8px 12px",
    background: "var(--surface-canvas)",
    borderRadius: 10,
    border: "1px solid var(--color-divider-card)",
  },
  chatInput: {
    flex: 1, border: "none",
    background: "transparent",
    fontSize: 14, color: "var(--color-text-deep)",
    fontFamily: "var(--font-sans)",
  },
  disclaimer: {
    margin: 0,
    fontSize: 11, fontWeight: 400, lineHeight: "16px",
    color: "var(--color-text-tertiary)",
    textAlign: "center",
  },

  // Chat sources panel
  chatSourcesPanel: {
    width: 360, flexShrink: 0,
    borderLeft: "1px solid var(--color-divider-card)",
    display: "flex", flexDirection: "column",
    background: "var(--surface-white)",
  },
  chatSourcesHeader: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "16px 16px",
    borderBottom: "1px solid var(--color-divider-card)",
    flexShrink: 0,
  },
  chatSourcesTitle: {
    display: "inline-flex", alignItems: "center", gap: 8,
    fontSize: 14, fontWeight: 500,
    color: "var(--color-text-deep)",
  },
  chatSourcesSearch: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "10px 16px",
    borderBottom: "1px solid var(--color-divider-card)",
    flexShrink: 0,
  },
  chatSourcesInput: {
    flex: 1, border: "none",
    background: "transparent",
    fontSize: 13, color: "var(--color-text-deep)",
    fontFamily: "var(--font-sans)",
  },
  chatSourcesList: {
    flex: 1, overflowY: "auto",
    padding: "0 16px",
  },

  // --- DIRECTION 3: Hub ---
  hubRoot: {
    display: "flex", flexDirection: "column",
    alignItems: "center", gap: 32,
    width: "100%", fontFamily: "var(--font-sans)",
    paddingTop: 48, paddingBottom: 80,
  },
  hubHero: {
    display: "flex", flexDirection: "column",
    alignItems: "center", gap: 12,
  },
  hubTopicsSection: {
    width: "100%", maxWidth: 640,
    display: "flex", flexDirection: "column", gap: 12,
  },
  hubSectionTitle: {
    margin: 0,
    fontSize: 14, fontWeight: 600, color: "var(--color-text-medium)",
  },
  hubTopicGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 10,
  },
  topicCard: {
    appearance: "none",
    display: "flex", flexDirection: "column",
    alignItems: "center", gap: 8,
    padding: "16px 12px",
    borderRadius: 10,
    border: "1px solid var(--color-divider-card)",
    cursor: "pointer",
    fontFamily: "var(--font-sans)",
    transition: "box-shadow 120ms ease, border-color 120ms ease",
  },
  topicIcon: {
    width: 32, height: 32, borderRadius: 999,
    background: "var(--color-icon-tertiary-bg)",
    display: "inline-grid", placeItems: "center",
  },
  topicLabel: {
    fontSize: 13, fontWeight: 500,
    color: "var(--color-text-deep)",
  },
  topicCount: {
    fontSize: 11, fontWeight: 400,
    color: "var(--color-text-tertiary)",
    fontFamily: '"JetBrains Mono", monospace',
  },
  hubSuggestSection: {
    width: "100%", maxWidth: 640,
    display: "flex", flexDirection: "column", gap: 12,
  },
  hubSuggestList: {
    display: "flex", flexDirection: "column", gap: 0,
    background: "var(--surface-white)",
    borderRadius: 10,
    boxShadow: "var(--shadow-card)",
    overflow: "hidden",
  },
  hubSuggestRow: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "14px 16px",
    background: "transparent", border: "none",
    borderBottom: "1px solid var(--color-divider-card)",
    cursor: "pointer", fontFamily: "var(--font-sans)",
    textAlign: "start",
    transition: "background 120ms ease",
  },
  hubSuggestTopicPill: {
    display: "inline-flex", alignItems: "center",
    height: 22, padding: "0 8px",
    borderRadius: 4,
    background: "var(--color-primary-alpha-04)",
    color: "var(--color-button-primary-bg)",
    fontSize: 11, fontWeight: 600,
    fontFamily: '"JetBrains Mono", monospace',
    flexShrink: 0,
  },
  hubSuggestText: {
    flex: 1, minWidth: 0,
    fontSize: 13, fontWeight: 400, lineHeight: "18px",
    color: "var(--color-text-medium)",
  },
  hubAnswerWrap: {
    width: "100%",
    display: "flex", flexDirection: "column", gap: 20,
  },
  hubAnswerHeader: {
    display: "flex", alignItems: "center",
  },

  // --- Icon button ---
  iconBtn: {
    width: 24, height: 24, borderRadius: 4,
    border: "none", background: "transparent",
    cursor: "pointer", padding: 0,
    display: "inline-grid", placeItems: "center",
    flexShrink: 0,
  },
};
