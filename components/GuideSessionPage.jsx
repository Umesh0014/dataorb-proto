"use client";

import React from "react";
import {
  Folder,
  FolderOpen,
  Mic,
  MicOff,
  PhoneOff,
  X,
  Search,
  FileText,
  ExternalLink,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import {
  GUIDE_SESSION_META,
  GUIDE_TURNS_PHASE1,
  GUIDE_TURNS_PHASE2,
  GUIDE_SOURCES,
  SOURCE_TYPE_TONE,
  formatTimer,
} from "./mocks/guideSession";
import {
  lhGS, lhDir, lhRetrieved, lhSourceType, lhGuideTurn, lhGuideSource,
} from "./learningHubLocale";

// GuideSessionPage — Guide AI Tutor runtime (the page an Advisor lands
// on after starting a published Guide). Voice-first: a soft orb on the
// left, streaming GUIDE↔ADVISOR transcript on the right, and a push-in
// Sources panel listing the artifacts the Guide is drawing from.
//
// Phases (single state, no combinations):
//   1 "greeting"  — only the GUIDE greeting in the transcript
//   2 "active"    — full back-and-forth conversation
//   3 "thinking"  — Phase 2 layout + "thinking…" indicator at bottom
//   4 "sources"   — any phase + the Sources panel pushed in on the right
//
// Layout note (spec §3): this page intentionally diverges from the
// other module pages — 32px gutter on all sides between the nav rail
// and the outer white card. Rendered outside PageLayout in the app
// router so the 1068 content max-width doesn't apply here.

// Avatar palette mirrors authorTone() in CreateGuideWizardPage — pastel
// monogram tones keyed off the initial. Single-source palette would be
// a future shared module (TODO promote).
const AUTHOR_PALETTE = [
  { bg: "#ECFDF5", fg: "#10B981" },
  { bg: "#EFF6FF", fg: "#3B82F6" },
  { bg: "#FFF7ED", fg: "#F97316" },
  { bg: "#DDE1FF", fg: "#6650A5" },
  { bg: "#EDE9FE", fg: "#6650A5" },
  { bg: "#FFF1F2", fg: "#F43F5E" },
];
function authorTone(initial) {
  if (!initial) return AUTHOR_PALETTE[0];
  const i = initial.toUpperCase().charCodeAt(0) % AUTHOR_PALETTE.length;
  return AUTHOR_PALETTE[i];
}

export default function GuideSessionPage({ guide, onEnd, locale = "en" }) {
  const meta = { ...GUIDE_SESSION_META, ...(guide || {}) };
  const title = locale === "ar" && meta.title === GUIDE_SESSION_META.title ? lhGS(locale, "title") : meta.title;

  // Phase state machine. Sources visibility is orthogonal — when true,
  // the conversation column narrows + panel pushes in regardless of
  // whether we're in greeting / active / thinking underneath.
  const [phase, setPhase] = React.useState("greeting");
  const [sourcesOpen, setSourcesOpen] = React.useState(false);
  const [muted, setMuted] = React.useState(false);
  const [secondsLeft, setSecondsLeft] = React.useState(meta.totalSeconds);
  const [search, setSearch] = React.useState("");

  // Timer countdown. At 0:00 we hard-end the session (spec §10 #4
  // default). Grace period flagged for product review.
  React.useEffect(() => {
    if (secondsLeft <= 0) { onEnd?.(); return; }
    const id = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [secondsLeft, onEnd]);

  // Demo state-machine auto-advance so the page exercises all four
  // phases without real voice plumbing. Real implementation would
  // drive these off transcription events.
  React.useEffect(() => {
    const t1 = window.setTimeout(() => setPhase("active"), 5000);
    const t2 = window.setTimeout(() => setPhase("thinking"), 11000);
    const t3 = window.setTimeout(() => setPhase("active"), 15000);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, []);

  const turns = phase === "greeting" ? GUIDE_TURNS_PHASE1 : GUIDE_TURNS_PHASE2;
  const thinking = phase === "thinking";

  // Auto-scroll transcript to bottom whenever turns/phase changes.
  const transcriptRef = React.useRef(null);
  React.useEffect(() => {
    const el = transcriptRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [turns, thinking]);

  const filteredSources = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return GUIDE_SOURCES;
    return GUIDE_SOURCES.filter((s) =>
      s.title.toLowerCase().includes(q) ||
      s.type.toLowerCase().includes(q) ||
      s.author.toLowerCase().includes(q),
    );
  }, [search]);

  return (
    <div style={styles.outer}>
      <div style={styles.card}>
        <Header
          title={title}
          interactionId={meta.interactionId}
          sourceCount={GUIDE_SOURCES.length}
          onSources={() => setSourcesOpen(true)}
          sourcesActive={sourcesOpen}
          locale={locale}
        />

        <div style={styles.body}>
          <OrbColumn
            initials={meta.initials}
            muted={muted}
            secondsLeft={secondsLeft}
            onToggleMute={() => setMuted((m) => !m)}
            onEnd={onEnd}
            compact={sourcesOpen}
            locale={locale}
          />

          <ConversationColumn
            ref={transcriptRef}
            turns={turns}
            thinking={thinking}
            onOpenSources={() => setSourcesOpen(true)}
            compact={sourcesOpen}
            locale={locale}
          />

          {sourcesOpen && (
            <SourcesPanel
              count={GUIDE_SOURCES.length}
              search={search}
              onSearchChange={setSearch}
              onClose={() => setSourcesOpen(false)}
              items={filteredSources}
              locale={locale}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ---- Header ------------------------------------------------------------

function Header({ title, interactionId, sourceCount, onSources, sourcesActive, locale = "en" }) {
  return (
    <header style={styles.header}>
      <div style={styles.headerLeft}>
        <span style={styles.guideTitle} dir="auto">{title}</span>
        <span style={styles.headerDot} aria-hidden="true" />
        <span style={styles.interactionId}>{lhGS(locale, "interactionId")} {interactionId}</span>
      </div>
      <button
        type="button"
        onClick={onSources}
        aria-label={`${lhGS(locale, "sources")} (${sourceCount})`}
        style={{
          ...styles.sourcesBadge,
          background: sourcesActive ? "var(--color-icon-tertiary-bg)" : "#FFFFFF",
        }}
      >
        {sourcesActive
          ? <FolderOpen size={16} color="var(--color-text-deep)" />
          : <Folder size={16} color="var(--color-text-deep)" />
        }
        <span style={styles.sourcesCount}>{sourceCount}</span>
      </button>
    </header>
  );
}

// ---- Orb column --------------------------------------------------------

function OrbColumn({ initials, muted, secondsLeft, onToggleMute, onEnd, compact, locale = "en" }) {
  return (
    <aside style={{ ...styles.orbCol, width: compact ? 360 : 544, flexShrink: 0 }}>
      <div style={styles.orbStack}>
        <Orb initials={initials} muted={muted} />
        <div style={styles.statusBlock}>
          <span style={styles.statusHead}>
            {muted ? lhGS(locale, "micMuted") : lhGS(locale, "listening")}
          </span>
          <span style={styles.statusSub}>
            {muted ? lhGS(locale, "tapResume") : lhGS(locale, "pauseDone")}
          </span>
        </div>
        <TimerPill secondsLeft={secondsLeft} locale={locale} />
      </div>

      <div style={styles.controlsRow}>
        <button
          type="button"
          onClick={onToggleMute}
          aria-label={muted ? lhGS(locale, "unmute") : lhGS(locale, "mute")}
          style={styles.mutePill}
        >
          {muted
            ? <MicOff size={22} color="var(--color-text-deep)" />
            : <Mic size={22} color="var(--color-text-deep)" />
          }
        </button>
        <button
          type="button"
          onClick={onEnd}
          aria-label={lhGS(locale, "endSession")}
          style={styles.endPill}
        >
          <PhoneOff size={22} color="#FFFFFF" />
        </button>
      </div>

      <p style={styles.disclaimer}>
        {lhGS(locale, "disclaimer")}
      </p>
    </aside>
  );
}

function Orb({ initials, muted }) {
  return (
    <div style={styles.orbWrap}>
      <span style={{ ...styles.orbRingOuter, opacity: muted ? 0.4 : 1 }} aria-hidden="true" />
      <span style={{ ...styles.orbRingMid, opacity: muted ? 0.5 : 1 }} aria-hidden="true" />
      <span style={styles.orb} aria-hidden="true">
        <span style={styles.orbInitials}>{initials}</span>
      </span>
    </div>
  );
}

function TimerPill({ secondsLeft, locale = "en" }) {
  return (
    <span style={styles.timerPill}>
      <span style={styles.timerDot} aria-hidden="true" />
      <span style={styles.timerLabel}>{formatTimer(secondsLeft)} {lhGS(locale, "minLeft")}</span>
    </span>
  );
}

// ---- Conversation column ----------------------------------------------

const ConversationColumn = React.forwardRef(function ConversationColumn(
  { turns, thinking, onOpenSources, compact, locale = "en" },
  ref,
) {
  return (
    <section
      style={{ ...styles.convCol, flex: 1, minWidth: 0, padding: compact ? "16px 16px" : "24px 24px" }}
    >
      <div ref={ref} style={styles.transcript}>
        {turns.map((turn) => (
          <ConversationTurn key={turn.id} turn={turn} onOpenSources={onOpenSources} locale={locale} />
        ))}
        {thinking && <ThinkingIndicator locale={locale} />}
      </div>
    </section>
  );
});

function ConversationTurn({ turn, onOpenSources, locale = "en" }) {
  const isGuide = turn.speaker === "GUIDE";
  return (
    <div style={styles.turn}>
      <div style={styles.turnHead}>
        <span style={styles.turnDot} aria-hidden="true" />
        <span style={{ ...styles.turnSpeaker, color: isGuide ? "var(--color-text-deep)" : "var(--color-text-tertiary)" }}>
          {lhGS(locale, isGuide ? "guide" : "advisor")}
        </span>
        <span style={styles.turnTimestamp}>{turn.timestamp}</span>
      </div>
      <div style={styles.turnBodyWrap}>
        <p style={{ ...styles.turnBody, color: isGuide ? "var(--color-text-deep)" : "var(--color-text-tertiary)" }} dir="auto">
          {lhGuideTurn(locale, turn.id, turn.body)}
        </p>
      </div>
      {isGuide && turn.retrieved > 0 && (
        <button type="button" onClick={onOpenSources} style={styles.retrievedRow}>
          <FileText size={14} color="var(--color-text-tertiary)" />
          <span style={styles.retrievedLabel}>
            {lhRetrieved(locale, turn.retrieved)}
          </span>
          <ChevronDown size={14} color="var(--color-text-tertiary)" />
        </button>
      )}
    </div>
  );
}

function ThinkingIndicator({ locale = "en" }) {
  return (
    <div style={styles.thinking}>
      <Sparkles size={14} color="var(--color-text-tertiary)" />
      <span style={styles.thinkingLabel}>{lhGS(locale, "thinking")}</span>
    </div>
  );
}

// ---- Sources panel -----------------------------------------------------

function SourcesPanel({ count, search, onSearchChange, onClose, items, locale = "en" }) {
  return (
    <aside style={styles.sourcesPanel}>
      <div style={styles.sourcesHeader}>
        <span style={styles.sourcesHeaderLeft}>
          <Folder size={18} color="var(--color-text-deep)" />
          <span style={styles.sourcesHeaderTitle}>{lhGS(locale, "sources")} ({count})</span>
        </span>
        <button type="button" onClick={onClose} aria-label={lhGS(locale, "closeSources")} style={styles.iconBtn}>
          <X size={16} color="var(--color-text-tertiary)" />
        </button>
      </div>

      <div style={styles.sourcesSearch}>
        <Search size={16} color="var(--color-text-tertiary)" style={{ flexShrink: 0 }} />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={lhGS(locale, "searchSources")}
          aria-label={lhGS(locale, "searchSources")}
          style={styles.sourcesSearchInput}
        />
      </div>

      <div style={styles.sourcesList}>
        {items.length === 0 ? (
          <div style={styles.sourcesEmpty}>{lhGS(locale, "noSources")}</div>
        ) : (
          items.map((item) => <SourceRow key={item.id} item={item} locale={locale} />)
        )}
      </div>
    </aside>
  );
}

function SourceRow({ item, locale = "en" }) {
  const tone = authorTone(item.author);
  const typeTone = SOURCE_TYPE_TONE[item.type] || SOURCE_TYPE_TONE.Playbook;
  const c = lhGuideSource(locale, item.id);
  const titleText = c?.title ?? item.title;
  return (
    <div style={styles.sourceRow}>
      <div style={styles.sourceRowTop}>
        <span style={styles.sourceTitle} title={titleText} dir="auto">{titleText}</span>
        <button
          type="button"
          aria-label={`${lhGS(locale, "open")} ${titleText}`}
          onClick={() => {
            // Open-artefact destination is out of scope; stub for now.
            // eslint-disable-next-line no-console
            console.log("open source", item.id);
          }}
          style={styles.iconBtn}
        >
          <ExternalLink size={14} color="var(--color-text-tertiary)" />
        </button>
      </div>
      <div style={styles.sourceMeta}>
        <span
          aria-hidden="true"
          style={{ ...styles.sourceAvatar, background: tone.bg, color: tone.fg }}
        >
          {item.author}
        </span>
        <span style={styles.sourceDate} dir="auto">{c?.date ?? item.date}</span>
        <span style={styles.sourceMetaDot} aria-hidden="true" />
        <span style={{ ...styles.sourceTypePill, background: typeTone.bg, color: typeTone.fg }}>
          {lhSourceType(locale, item.type)}
        </span>
      </div>
    </div>
  );
}

// ---- Styles ------------------------------------------------------------

const styles = {
  // Outer 32px gutter on all sides (relative to the 64px nav rail —
  // app router renders this outside PageLayout so the 1068 max-width
  // doesn't constrain it). Page lavender gradient shows through.
  outer: {
    position: "fixed",
    top: 0, bottom: 0,
    insetInlineStart: 64,
    insetInlineEnd: 0,
    padding: 32,
    display: "flex",
    background: "transparent",
    fontFamily: "var(--font-sans)",
  },
  card: {
    flex: 1,
    background: "#FFFFFF",
    borderRadius: 12,
    boxShadow: "var(--shadow-card)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },

  // Header
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    padding: "16px 24px",
    borderBottom: "2px solid var(--color-border-card-soft)",
    flexShrink: 0,
  },
  headerLeft: {
    display: "inline-flex",
    alignItems: "center",
    gap: 12,
    minWidth: 0,
  },
  guideTitle: {
    fontSize: 20, fontWeight: 500, lineHeight: "29px", letterSpacing: "0.17px",
    color: "var(--color-text-medium)",
  },
  headerDot: {
    width: 3, height: 3, borderRadius: 999,
    background: "var(--color-text-tertiary)",
    flexShrink: 0,
  },
  interactionId: {
    fontSize: 14, fontWeight: 400, lineHeight: "22px", letterSpacing: "0.25px",
    color: "var(--color-text-tertiary)",
    fontFamily: '"JetBrains Mono", monospace',
  },
  sourcesBadge: {
    display: "inline-flex", alignItems: "center", gap: 8,
    height: 40, padding: "0 12px",
    border: "1px solid var(--color-border-card-soft)",
    borderRadius: 999,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "background 120ms ease",
  },
  sourcesCount: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 14, fontWeight: 700, letterSpacing: "0.1px",
    color: "var(--color-text-deep)",
  },

  // Body
  body: {
    flex: 1,
    display: "flex",
    alignItems: "stretch",
    minHeight: 0,
  },

  // Left orb column
  orbCol: {
    display: "flex",
    flexDirection: "column",
    background: "#FFFFFF",
    borderInlineEnd: "2px solid var(--color-border-card-soft)",
    padding: "24px 24px 0",
    transition: "width 200ms ease",
  },
  orbStack: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },

  // Orb
  orbWrap: {
    position: "relative",
    width: 192,
    height: 192,
    display: "inline-grid",
    placeItems: "center",
  },
  orbRingOuter: {
    position: "absolute", inset: 0,
    borderRadius: "50%",
    background: "radial-gradient(circle at 30% 30%, rgba(247, 217, 235, 0.7), rgba(195, 199, 242, 0.5) 60%, transparent 80%)",
    filter: "blur(8px)",
    animation: "orbPulseOuter 4s ease-in-out infinite",
  },
  orbRingMid: {
    position: "absolute",
    inset: 24,
    borderRadius: "50%",
    background: "radial-gradient(circle at 35% 35%, rgba(247, 217, 235, 0.9), rgba(220, 195, 240, 0.7) 65%)",
    filter: "blur(4px)",
    animation: "orbPulseMid 3s ease-in-out infinite",
  },
  orb: {
    position: "relative",
    width: 138, height: 138,
    borderRadius: "50%",
    background: "radial-gradient(circle at 32% 32%, #FFFFFF 0%, #F7D9EB 35%, #C3C7F2 90%)",
    boxShadow: "inset 0 -10px 20px rgba(102, 80, 165, 0.18), 0 8px 24px rgba(102, 80, 165, 0.15)",
    display: "inline-grid",
    placeItems: "center",
  },
  orbInitials: {
    fontFamily: "var(--font-sans)",
    fontSize: 32, fontWeight: 700, letterSpacing: "0.5px",
    color: "#6650A5",
  },

  statusBlock: {
    display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
  },
  statusHead: {
    fontFamily: "var(--font-sans)",
    fontSize: 12, fontWeight: 600, lineHeight: "20px", letterSpacing: "0.4px",
    color: "var(--color-text-tertiary)",
  },
  statusSub: {
    fontFamily: "var(--font-sans)",
    fontSize: 12, fontWeight: 400, lineHeight: "20px", letterSpacing: "0.4px",
    color: "#8C90A6",
  },

  // Timer pill
  timerPill: {
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "5px 12px",
    background: "#F5F5F5",
    borderRadius: 4,
  },
  timerDot: {
    width: 6, height: 6, borderRadius: 999,
    background: "#00711D",
  },
  timerLabel: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 12, fontWeight: 500, lineHeight: "19px", letterSpacing: "0.1px",
    color: "#424659",
  },

  // Controls
  controlsRow: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 16,
    padding: "24px 0",
    flexShrink: 0,
  },
  mutePill: {
    width: 72, height: 40,
    background: "#FFFFFF",
    border: "1px solid var(--color-border-card-soft)",
    borderRadius: 8,
    cursor: "pointer",
    display: "inline-grid", placeItems: "center",
    padding: 0,
    transition: "background 120ms ease",
  },
  endPill: {
    width: 66, height: 40,
    background: "#BA1A1A",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    display: "inline-grid", placeItems: "center",
    padding: 0,
    transition: "background 120ms ease",
  },

  // Disclaimer
  disclaimer: {
    margin: 0,
    padding: "16px 24px",
    borderTop: "1px solid var(--color-border-card-soft)",
    fontFamily: "var(--font-sans)",
    fontSize: 12, fontWeight: 400, lineHeight: "17px",
    color: "#8C90A6",
    textAlign: "center",
  },

  // Conversation column
  convCol: {
    display: "flex",
    flexDirection: "column",
    background: "#F9FAFB",
    minWidth: 0,
    transition: "padding 200ms ease",
  },
  transcript: {
    flex: 1, minHeight: 0,
    overflowY: "auto",
    display: "flex", flexDirection: "column",
    paddingBottom: 16,
  },

  // Turn
  turn: {
    display: "flex", flexDirection: "column",
    padding: "12px",
    gap: 4,
  },
  turnHead: {
    display: "inline-flex", alignItems: "center", gap: 12,
  },
  turnDot: {
    width: 4, height: 4, borderRadius: 999,
    background: "var(--color-text-deep)",
  },
  turnSpeaker: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 12, fontWeight: 500, lineHeight: "19px", letterSpacing: "0.1px",
  },
  turnTimestamp: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 12, fontWeight: 400, lineHeight: "20px", letterSpacing: "0.4px",
    color: "#8C90A6",
  },
  turnBodyWrap: {
    paddingInlineStart: 16,
    borderInlineStart: "2px solid var(--color-text-deep)",
  },
  turnBody: {
    margin: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 14, fontWeight: 400, lineHeight: "20px", letterSpacing: "0.17px",
    whiteSpace: "pre-wrap",
  },

  // "Retrieved from N artifacts"
  retrievedRow: {
    display: "inline-flex", alignItems: "center", gap: 12,
    padding: "16px 0 0",
    background: "transparent", border: "none",
    cursor: "pointer",
    fontFamily: "inherit",
    alignSelf: "flex-start",
  },
  retrievedLabel: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 12, fontWeight: 400, letterSpacing: "0.4px",
    color: "var(--color-text-tertiary)",
  },

  // Thinking
  thinking: {
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "12px",
  },
  thinkingLabel: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 12, fontStyle: "italic", letterSpacing: "0.4px",
    color: "var(--color-text-tertiary)",
  },

  // Sources panel
  sourcesPanel: {
    width: 400, flexShrink: 0,
    background: "#FFFFFF",
    borderInlineStart: "2px solid var(--color-border-card-soft)",
    display: "flex", flexDirection: "column",
    minHeight: 0,
    animation: "panelSlideIn 200ms ease",
  },
  sourcesHeader: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    paddingBlock: 16,
    paddingInlineStart: 20,
    paddingInlineEnd: 16,
    borderBottom: "1px solid var(--color-border-card-soft)",
    flexShrink: 0,
  },
  sourcesHeaderLeft: {
    display: "inline-flex", alignItems: "center", gap: 12,
  },
  sourcesHeaderTitle: {
    fontFamily: "var(--font-sans)",
    fontSize: 16, fontWeight: 400, lineHeight: "28px", letterSpacing: "0.15px",
    color: "var(--color-text-medium)",
  },
  sourcesSearch: {
    display: "flex", alignItems: "center", gap: 12,
    paddingBlock: 12,
    paddingInlineStart: 20,
    paddingInlineEnd: 16,
    borderBottom: "1px solid var(--color-border-card-soft)",
    flexShrink: 0,
  },
  sourcesSearchInput: {
    flex: 1,
    border: "none", outline: "none",
    background: "transparent",
    fontFamily: "var(--font-sans)",
    fontSize: 14, color: "var(--color-text-deep)",
  },
  sourcesList: {
    flex: 1, minHeight: 0,
    overflowY: "auto",
    paddingInlineStart: 20,
    paddingInlineEnd: 18,
  },
  sourcesEmpty: {
    padding: "24px 0",
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    color: "var(--color-text-tertiary)",
    textAlign: "center",
  },

  // Source row
  sourceRow: {
    display: "flex", flexDirection: "column", gap: 16,
    padding: "16px 0",
    borderBottom: "1px solid var(--color-border-card-soft)",
  },
  sourceRowTop: {
    display: "flex", alignItems: "flex-start", justifyContent: "space-between",
    gap: 8,
  },
  sourceTitle: {
    flex: 1, minWidth: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 14, fontWeight: 400, lineHeight: "22px", letterSpacing: "0.1px",
    color: "var(--color-text-medium)",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  sourceMeta: {
    display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
  },
  sourceAvatar: {
    width: 16, height: 16, borderRadius: 999,
    display: "inline-grid", placeItems: "center",
    fontFamily: "var(--font-sans)",
    fontSize: 9, fontWeight: 700, letterSpacing: "0.15px",
    flexShrink: 0,
  },
  sourceDate: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 12, fontWeight: 400, lineHeight: "20px", letterSpacing: "0.4px",
    color: "var(--color-text-tertiary)",
  },
  sourceMetaDot: {
    width: 3, height: 3, borderRadius: 999,
    background: "#A7AAC1",
    flexShrink: 0,
  },
  sourceTypePill: {
    display: "inline-flex", alignItems: "center",
    height: 24, padding: "0 6px",
    borderRadius: 4,
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 12, fontWeight: 400, letterSpacing: "0.4px",
  },

  // Generic icon button
  iconBtn: {
    width: 24, height: 24, borderRadius: 4,
    border: "none", background: "transparent",
    cursor: "pointer", padding: 0,
    display: "inline-grid", placeItems: "center",
    flexShrink: 0,
  },
};
