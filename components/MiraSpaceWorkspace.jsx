"use client";

import React from "react";
import {
  Play, Pause, ChevronRight, ChevronLeft, Lock, Users, Sparkles, TrendingUp,
  TrendingDown, Minus, Info, Plus, RefreshCw, PanelLeft,
} from "lucide-react";
import MiraConversation from "./MiraConversation";
import Button from "./Button";
import { MiraStarIcon, TuneIcon, FilterFunnelIcon, ArrowUpIcon } from "./SideNav/icons";
import {
  SPACE, KPIS, METRIC_GROUPS, METRIC_THREADS, SUGGESTED,
} from "./mocks/miraSpace";

// Direction D — Workspace (NotebookLM-style three-column investigation surface).
// Full-bleed: it breaks out of PageLayout's 1068 cap to use the whole content
// area as a fixed three-pane app. Each column is its own card panel; the left
// (metrics) column collapses to a slim rail.
//   LEFT   — every metric to investigate, grouped by theme (master, collapsible).
//   MIDDLE — selected metric's trend + AI read + its own 2-voice clip + chats.
//   RIGHT  — Ask Mira, with a private/public visibility switcher + starters.

const TONE = {
  up: { color: "var(--color-success)", Icon: TrendingUp },
  down: { color: "var(--color-error)", Icon: TrendingDown },
  warn: { color: "var(--color-warning)", Icon: TrendingDown },
  flat: { color: "var(--color-text-tertiary)", Icon: Minus },
};

export default function MiraSpaceWorkspace({
  conversation, pendingTurnId, queriesUsed, queriesTotal, onSubmit, onReset,
}) {
  const [metricId, setMetricId] = React.useState(KPIS[0].id);
  const [leftOpen, setLeftOpen] = React.useState(true);
  const metric = KPIS.find((k) => k.id === metricId) || KPIS[0];

  const cols = `${leftOpen ? "256px" : "48px"} minmax(0, 1fr) 380px`;

  return (
    <div style={s.root}>
      <div style={{ ...s.grid, gridTemplateColumns: cols }}>
        {leftOpen
          ? <MetricList activeId={metricId} onPick={setMetricId} onCollapse={() => setLeftOpen(false)} />
          : <CollapsedRail onExpand={() => setLeftOpen(true)} />}
        <MetricDetail metric={metric} onAsk={(t) => onSubmit(t)} pending={Boolean(pendingTurnId)} />
        <WorkspaceChat
          metric={metric}
          conversation={conversation}
          pendingTurnId={pendingTurnId}
          queriesUsed={queriesUsed}
          queriesTotal={queriesTotal}
          onSubmit={onSubmit}
          onReset={onReset}
        />
      </div>
    </div>
  );
}

// ---- LEFT: metrics grouped by theme (collapsible) ------------------------
function MetricList({ activeId, onPick, onCollapse }) {
  return (
    <aside style={s.colCard} aria-label="Metrics to investigate">
      <div style={s.leftHead}>
        <div style={s.leftHeadText}>
          <span style={s.spaceName}>{SPACE.name}</span>
          <span style={s.leftSub}>Metrics to investigate</span>
        </div>
        <button type="button" onClick={onCollapse} aria-label="Collapse metrics" style={s.iconBtn}>
          <ChevronLeft size={18} color="var(--color-text-medium)" />
        </button>
      </div>
      <div style={s.groups}>
        {METRIC_GROUPS.map((g) => (
          <div key={g.id} style={s.group}>
            <span style={s.groupLabel}>{g.label}</span>
            {g.metricIds.map((id) => {
              const k = KPIS.find((m) => m.id === id);
              if (!k) return null;
              const meta = TONE[k.tone] || TONE.flat;
              const active = k.id === activeId;
              const { Icon } = meta;
              return (
                <button
                  key={k.id}
                  type="button"
                  onClick={() => onPick(k.id)}
                  aria-current={active ? "true" : undefined}
                  style={{ ...s.metricRow, ...(active ? s.metricRowOn : null) }}
                >
                  <span style={s.metricLabel}>{k.label}</span>
                  <span style={s.metricRight}>
                    <span style={s.metricValue}>{k.value}</span>
                    <Icon size={13} color={meta.color} aria-hidden="true" />
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </aside>
  );
}

function CollapsedRail({ onExpand }) {
  return (
    <aside style={s.railCard} aria-label="Metrics (collapsed)">
      <button type="button" onClick={onExpand} aria-label="Expand metrics" style={s.railBtn}>
        <PanelLeft size={18} color="var(--color-text-medium)" />
        <span style={s.railLabel}>Metrics</span>
      </button>
    </aside>
  );
}

// ---- MIDDLE: selected metric detail --------------------------------------
function MetricDetail({ metric, onAsk, pending }) {
  const meta = TONE[metric.tone] || TONE.flat;
  const { Icon } = meta;
  const threads = METRIC_THREADS.filter((t) => t.metricId === metric.id);
  return (
    <section style={s.midCard} aria-label={`${metric.label} detail`}>
      <div style={s.midScroll}>
        <header style={s.midHead}>
          <h2 style={s.midTitle}>{metric.label}</h2>
          <div style={s.midValueRow}>
            <span style={s.midValue}>{metric.value}</span>
            <span style={{ ...s.midDelta, color: meta.color }}>
              <Icon size={15} aria-hidden="true" /> {metric.delta}
            </span>
          </div>
          <p style={s.sourceLine}><Info size={13} /> {metric.source}</p>
        </header>

        {metric.spark
          ? <TrendChart points={metric.spark} color={meta.color} />
          : <NoTrend value={metric.value} />}

        <div style={s.explainCard}>
          <span style={s.aiTag}><Sparkles size={13} /> Mira's read</span>
          <p style={s.explainText}>{metric.explain}</p>
        </div>

        <MetricClip clip={metric.clip} label={metric.label} />

        <div style={s.threads}>
          <div style={s.threadsHead}>
            <span style={s.sectionLabel}>Chats about this metric</span>
            <button
              type="button"
              onClick={() => onAsk(`Why did ${metric.label.toLowerCase()} change this week?`)}
              style={s.startChat}
              disabled={pending}
            >
              <Plus size={14} /> Start a chat
            </button>
          </div>
          {threads.length === 0 ? (
            <p style={s.threadsEmpty}>No chats about this metric yet. Start one to investigate.</p>
          ) : (
            threads.map((t) => <ThreadRow key={t.id} thread={t} onOpen={() => onAsk(t.title)} />)
          )}
        </div>
      </div>
    </section>
  );
}

function TrendChart({ points, color, w = 560, h = 150 }) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const pad = 8;
  const innerH = h - pad * 2;
  const x = (i) => (i / (points.length - 1)) * w;
  const y = (p) => pad + innerH - ((p - min) / span) * innerH;
  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p).toFixed(1)}`).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;
  return (
    <figure style={s.chartFig}>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none" role="img" aria-label={`Trend, ${min} to ${max} over 7 weeks`}>
        <defs>
          <linearGradient id="wsTrend" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#wsTrend)" />
        <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <figcaption style={s.chartCaption}>
        <span>Trailing 7 weeks</span>
        <span>{min}–{max} range</span>
      </figcaption>
    </figure>
  );
}

function NoTrend({ value }) {
  return (
    <div style={s.noTrend}>
      <span style={s.noTrendValue}>{value}</span>
      <span style={s.noTrendNote}>Categorical — no time trend</span>
    </div>
  );
}

function MetricClip({ clip, label }) {
  const [playing, setPlaying] = React.useState(false);
  const [t, setT] = React.useState(0);
  const [showText, setShowText] = React.useState(false);
  React.useEffect(() => {
    if (!playing) return undefined;
    const id = setInterval(() => {
      setT((p) => { if (p + 1 >= clip.durationSec) { setPlaying(false); return clip.durationSec; } return p + 1; });
    }, 250);
    return () => clearInterval(id);
  }, [playing, clip.durationSec]);
  const progress = clip.durationSec ? (t / clip.durationSec) * 100 : 0;
  const fmt = (sec) => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;
  return (
    <div style={s.clip}>
      <button
        type="button"
        onClick={() => { if (t >= clip.durationSec) setT(0); setPlaying((p) => !p); }}
        aria-label={playing ? `Pause ${label} explainer` : `Play ${label} explainer`}
        style={s.clipBtn}
      >
        {playing ? <Pause size={16} color="#FFFFFF" /> : <Play size={16} color="#FFFFFF" style={{ marginInlineStart: 2 }} />}
      </button>
      <div style={s.clipBody}>
        <div style={s.clipTop}>
          <span style={s.clipTitle}>{label} — 2-voice explainer</span>
          <span style={s.clipTime}>{fmt(t)} / {clip.durationLabel}</span>
        </div>
        <div style={s.clipTrack}><div style={{ ...s.clipFill, width: `${progress}%` }} /></div>
        <button type="button" onClick={() => setShowText((v) => !v)} style={s.clipToggle} aria-expanded={showText}>
          {showText ? "Hide transcript" : "Transcript"}
        </button>
        {showText && (
          <div style={s.clipTranscript}>
            {clip.transcript.map((r, i) => (
              <p key={i} style={s.clipLine}><span style={s.clipSpeaker}>{r.speaker}</span>{r.line}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ThreadRow({ thread, onOpen }) {
  const shared = thread.visibility === "shared";
  return (
    <button type="button" onClick={onOpen} style={s.threadRow}>
      <span style={{ ...s.threadBadge, ...(shared ? s.badgeShared : s.badgePrivate) }}>
        {shared ? <Users size={11} /> : <Lock size={11} />}
      </span>
      <span style={s.threadMeta}>
        <span style={s.threadTitle}>{thread.title}</span>
        <span style={s.threadSub}>{thread.author.name} · {thread.updated}</span>
      </span>
      <ChevronRight size={15} color="var(--color-text-tertiary)" />
    </button>
  );
}

// ---- RIGHT: Ask Mira with private/public switcher + starters -------------
function WorkspaceChat({ metric, conversation, pendingTurnId, queriesUsed, queriesTotal = 1002, onSubmit, onReset }) {
  const [query, setQuery] = React.useState("");
  const [visibility, setVisibility] = React.useState("private");
  const inChat = conversation.length > 0;
  const pending = Boolean(pendingTurnId);
  const queriesLeft = Math.max(queriesTotal - queriesUsed, 0);
  const submit = (text) => {
    const v = (text ?? query).trim();
    if (!v || pending) return;
    onSubmit(v);
    setQuery("");
  };
  const starters = [
    `Why did ${metric.label.toLowerCase()} change this week?`,
    ...SUGGESTED.slice(0, 3),
  ];

  return (
    <aside style={s.rightCard} aria-label="Ask Mira">
      <header style={s.rightHead}>
        <span style={s.headTitle}>
          <MiraStarIcon size={18} color="var(--color-button-primary-bg)" /> Ask Mira
        </span>
        {inChat && (
          <Button variant="icon" size="sm" aria-label="New chat" onClick={onReset}>
            <Plus size={16} color="var(--color-text-medium)" />
          </Button>
        )}
      </header>

      <div style={s.visWrap}>
        <div style={s.visToggle} role="group" aria-label="Chat visibility">
          {[{ id: "private", label: "Private", Icon: Lock }, { id: "public", label: "Public", Icon: Users }].map((o) => {
            const on = o.id === visibility;
            const OIcon = o.Icon;
            return (
              <button key={o.id} type="button" onClick={() => setVisibility(o.id)} aria-pressed={on} style={{ ...s.visBtn, ...(on ? s.visBtnOn : null) }}>
                <OIcon size={13} /> {o.label}
              </button>
            );
          })}
        </div>
        <span style={s.visNote}>
          {visibility === "private" ? "Only you can see this chat." : `Shared with the ${SPACE.name} space.`}
        </span>
      </div>

      <div style={s.rightBody}>
        {inChat ? (
          <MiraConversation turns={conversation} pendingTurnId={pendingTurnId} onSubmitFollowUp={submit} />
        ) : (
          <div style={s.starters}>
            <p style={s.startersLabel}>Start from a topic</p>
            {starters.map((q) => (
              <button key={q} type="button" onClick={() => submit(q)} style={s.starter}>{q}</button>
            ))}
          </div>
        )}
      </div>

      <footer style={s.composerWrap}>
        <div style={s.composerCard}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            placeholder={`Ask about ${metric.label.toLowerCase()}…`}
            aria-label="Ask a question"
            style={s.input}
          />
          <div style={s.composerFooter}>
            <div style={s.chipRow}>
              <button type="button" style={s.chip} onClick={() => {}}>
                <TuneIcon size={15} color="var(--color-text-medium)" /> Graph
              </button>
              <button type="button" style={s.chip} onClick={() => {}}>
                <FilterFunnelIcon size={15} color="var(--color-text-medium)" /> Context
              </button>
            </div>
            <Button variant="icon" size="md" aria-label={pending ? "Generating" : "Send"} onClick={pending ? () => {} : () => submit()} style={s.sendBtn}>
              {pending ? <RefreshCw size={16} color="var(--color-text-medium)" /> : <ArrowUpIcon size={18} color="var(--color-text-medium)" />}
            </Button>
          </div>
        </div>
        <div style={s.disclaimer}>
          <span>Mira can make mistakes.</span>
          <span>{queriesLeft} of {queriesTotal} left</span>
        </div>
      </footer>
    </aside>
  );
}

// Full-bleed: expand past PageLayout's 1068 cap to the whole content area.
const BLEED_W = "calc(100vw - var(--sidenav-width) - 2 * var(--page-gutter))";
const COL_H = "calc(100vh - var(--page-padding-top, 32px) - var(--page-padding-bottom, 32px))";

const s = {
  root: {
    width: BLEED_W,
    marginInline: `calc((100% - ${BLEED_W}) / 2)`,
    fontFamily: "var(--font-sans)",
  },
  grid: { display: "grid", gap: 16, alignItems: "start", height: COL_H, transition: "grid-template-columns 200ms ease" },

  // Shared column-card chrome
  colCard: { height: "100%", display: "flex", flexDirection: "column", borderRadius: 16, border: "1px solid var(--color-border-card-soft)", background: "var(--surface-white)", boxShadow: "var(--shadow-1)", overflow: "hidden" },

  // Left
  leftHead: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "14px 14px 12px", borderBottom: "1px solid var(--color-divider-card)", flexShrink: 0 },
  leftHeadText: { display: "flex", flexDirection: "column", gap: 2, minWidth: 0 },
  spaceName: { fontSize: 16, fontWeight: 800, letterSpacing: "-0.01em", color: "var(--color-text-deep)" },
  leftSub: { fontSize: 11.5, fontWeight: 600, color: "var(--color-text-tertiary)" },
  iconBtn: { width: 30, height: 30, borderRadius: 8, border: "none", background: "transparent", display: "inline-grid", placeItems: "center", cursor: "pointer", flexShrink: 0 },
  groups: { display: "flex", flexDirection: "column", gap: 18, overflowY: "auto", padding: 12 },
  group: { display: "flex", flexDirection: "column", gap: 4 },
  groupLabel: { fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--color-text-tertiary)", paddingInline: 4, marginBottom: 2 },
  metricRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "9px 10px", borderRadius: 10, border: "1px solid transparent", background: "transparent", cursor: "pointer", textAlign: "start", width: "100%", fontFamily: "var(--font-sans)", transition: "background 150ms ease, border-color 150ms ease" },
  metricRowOn: { background: "var(--color-surface-header-tinted)", border: "1px solid var(--color-border-card-soft)" },
  metricLabel: { fontSize: 13, fontWeight: 600, color: "var(--color-text-medium)", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  metricRight: { display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0 },
  metricValue: { fontSize: 13, fontWeight: 700, color: "var(--color-text-deep)" },

  // Collapsed rail
  railCard: { height: "100%", display: "flex", flexDirection: "column", alignItems: "center", borderRadius: 16, border: "1px solid var(--color-border-card-soft)", background: "var(--surface-white)", boxShadow: "var(--shadow-1)", overflow: "hidden" },
  railBtn: { width: "100%", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, paddingBlock: 16, border: "none", background: "transparent", cursor: "pointer", fontFamily: "var(--font-sans)" },
  railLabel: { writingMode: "vertical-rl", transform: "rotate(180deg)", fontSize: 12, fontWeight: 700, color: "var(--color-text-tertiary)", letterSpacing: "0.04em", textTransform: "uppercase" },

  // Middle
  midCard: { height: "100%", borderRadius: 16, border: "1px solid var(--color-border-card-soft)", background: "var(--surface-white)", boxShadow: "var(--shadow-1)", overflow: "hidden", minWidth: 0 },
  midScroll: { height: "100%", overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 18 },
  midHead: { display: "flex", flexDirection: "column", gap: 4 },
  midTitle: { margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: "-0.01em", color: "var(--color-text-deep)" },
  midValueRow: { display: "flex", alignItems: "baseline", gap: 12, marginTop: 2 },
  midValue: { fontSize: 34, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--color-text-deep)", lineHeight: 1 },
  midDelta: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 700 },
  sourceLine: { margin: "4px 0 0", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--color-text-tertiary)" },

  chartFig: { margin: 0, display: "flex", flexDirection: "column", gap: 6 },
  chartCaption: { display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11, fontWeight: 600, color: "var(--color-text-tertiary)" },
  noTrend: { display: "flex", flexDirection: "column", gap: 4, padding: "12px 0" },
  noTrendValue: { fontSize: 30, fontWeight: 800, color: "var(--color-text-deep)" },
  noTrendNote: { fontSize: 12, color: "var(--color-text-tertiary)" },

  explainCard: { display: "flex", flexDirection: "column", gap: 8, padding: 16, borderRadius: 12, background: "var(--color-surface-header-tinted)", border: "1px solid var(--color-border-card-soft)" },
  aiTag: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, letterSpacing: "0.03em", textTransform: "uppercase", color: "var(--color-icon-tertiary-fg)" },
  explainText: { margin: 0, fontSize: 14, lineHeight: 1.6, color: "var(--color-text-deep)" },

  clip: { display: "flex", gap: 14, padding: 14, borderRadius: 12, border: "1px solid var(--color-border-card-soft)", background: "var(--color-surface-header-tinted)" },
  clipBtn: { width: 40, height: 40, borderRadius: 999, flexShrink: 0, border: "none", background: "var(--color-icon-tertiary-fg)", display: "inline-grid", placeItems: "center", cursor: "pointer" },
  clipBody: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 8 },
  clipTop: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 },
  clipTitle: { fontSize: 13, fontWeight: 700, color: "var(--color-text-deep)" },
  clipTime: { fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-text-tertiary)" },
  clipTrack: { height: 5, borderRadius: 999, background: "var(--color-divider-card)", overflow: "hidden" },
  clipFill: { height: "100%", borderRadius: 999, background: "var(--color-icon-tertiary-fg)", transition: "width 220ms linear" },
  clipToggle: { alignSelf: "flex-start", border: "none", background: "transparent", padding: 0, cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 700, color: "var(--color-text-medium)" },
  clipTranscript: { display: "flex", flexDirection: "column", gap: 6, paddingTop: 4 },
  clipLine: { margin: 0, fontSize: 13, lineHeight: 1.5, color: "var(--color-text-deep)" },
  clipSpeaker: { fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "var(--color-icon-tertiary-fg)", marginInlineEnd: 8 },

  threads: { display: "flex", flexDirection: "column", gap: 8 },
  threadsHead: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 },
  sectionLabel: { fontSize: 13, fontWeight: 700, color: "var(--color-text-deep)" },
  startChat: { display: "inline-flex", alignItems: "center", gap: 5, height: 28, paddingInline: 10, borderRadius: 8, border: "1px solid var(--color-divider-card)", background: "var(--surface-white)", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 700, color: "var(--color-text-medium)" },
  threadsEmpty: { margin: 0, fontSize: 13, color: "var(--color-text-tertiary)", padding: "8px 0" },
  threadRow: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, border: "1px solid var(--color-border-card-soft)", background: "var(--surface-white)", cursor: "pointer", textAlign: "start", width: "100%", fontFamily: "var(--font-sans)" },
  threadBadge: { width: 24, height: 24, borderRadius: 999, display: "inline-grid", placeItems: "center", flexShrink: 0 },
  badgeShared: { background: "var(--color-icon-tertiary-bg)", color: "var(--color-icon-tertiary-fg)" },
  badgePrivate: { background: "var(--color-chip-bg)", color: "var(--color-text-medium)" },
  threadMeta: { display: "flex", flexDirection: "column", gap: 1, minWidth: 0, flex: 1 },
  threadTitle: { fontSize: 13, fontWeight: 600, color: "var(--color-text-deep)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  threadSub: { fontSize: 11.5, color: "var(--color-text-tertiary)" },

  // Right
  rightCard: { height: "100%", display: "flex", flexDirection: "column", borderRadius: 16, border: "1px solid var(--color-border-card-soft)", background: "var(--surface-white)", boxShadow: "var(--shadow-1)", overflow: "hidden" },
  rightHead: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "12px 14px", borderBottom: "1px solid var(--color-divider-card)", flexShrink: 0 },
  headTitle: { display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, color: "var(--color-text-deep)" },
  visWrap: { display: "flex", flexDirection: "column", gap: 6, padding: "12px 14px", borderBottom: "1px solid var(--color-divider-card)", flexShrink: 0 },
  visToggle: { display: "inline-flex", padding: 3, borderRadius: 999, background: "var(--color-chip-bg)", gap: 2 },
  visBtn: { flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, height: 30, borderRadius: 999, border: "none", background: "transparent", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 12.5, fontWeight: 700, color: "var(--color-text-tertiary)" },
  visBtnOn: { background: "var(--surface-white)", color: "var(--color-text-deep)", boxShadow: "var(--shadow-1)" },
  visNote: { fontSize: 11.5, color: "var(--color-text-tertiary)", paddingInline: 2 },
  rightBody: { flex: 1, minHeight: 0, overflowY: "auto", padding: 16 },
  starters: { display: "flex", flexDirection: "column", gap: 8 },
  startersLabel: { margin: "0 0 2px", fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--color-text-tertiary)" },
  starter: { appearance: "none", textAlign: "start", padding: "12px 14px", borderRadius: 10, border: "1px solid var(--color-divider-card)", background: "var(--surface-white)", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 500, color: "var(--color-text-medium)", lineHeight: 1.45, cursor: "pointer", transition: "background 150ms ease, border-color 150ms ease" },

  composerWrap: { flexShrink: 0, padding: 12, borderTop: "1px solid var(--color-divider-card)", display: "flex", flexDirection: "column", gap: 6 },
  composerCard: { display: "flex", flexDirection: "column", gap: 10, padding: "12px 14px", borderRadius: 12, border: "1px solid var(--color-border-tab)" },
  input: { width: "100%", border: "none", outline: "none", background: "transparent", fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--color-text-deep)" },
  composerFooter: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 },
  chipRow: { display: "flex", alignItems: "center", gap: 6 },
  chip: { display: "inline-flex", alignItems: "center", gap: 5, height: 30, paddingInline: 10, borderRadius: 8, border: "1px solid var(--color-divider-card)", background: "var(--surface-white)", fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: "var(--color-text-medium)", cursor: "pointer" },
  sendBtn: { border: "1px solid var(--color-divider-card)" },
  disclaimer: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, paddingInline: 4, fontSize: 11, fontWeight: 500, color: "var(--color-text-tertiary)" },
};
