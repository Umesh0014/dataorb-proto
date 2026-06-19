"use client";

import React from "react";
import {
  Play, Pause, ChevronRight, Lock, Users, Sparkles, TrendingUp, TrendingDown,
  Minus, Info, Plus, RefreshCw, MessageSquare, X, HelpCircle, GitCompare,
  Layers, FileText,
} from "lucide-react";
import MiraConversation from "./MiraConversation";
import Button from "./Button";
import { MiraStarIcon, TuneIcon, FilterFunnelIcon, ArrowUpIcon } from "./SideNav/icons";
import { SPACE, METRIC_THREADS, SUGGESTED } from "./mocks/miraSpace";

// MiraWorkspaceBits — shared atoms for the four Workspace directions
// (Combined / Canvas / Three-Pane / Dashboard). The directions differ only in
// how they arrange metrics + detail; these leaves (celebrated metric card, the
// metric detail body, starter cards, the compact public/private toggle, and
// the bottom Facebook-style chat) are identical across them. Tokens-only;
// state in-memory.

export const TONE = {
  up: { color: "var(--color-success)", bg: "var(--color-success-bg)", text: "var(--color-success-text)", Icon: TrendingUp },
  down: { color: "var(--color-error)", bg: "var(--color-error-bg)", text: "var(--color-error-text)", Icon: TrendingDown },
  warn: { color: "var(--color-warning)", bg: "var(--color-warning-bg)", text: "var(--color-warning-text)", Icon: TrendingDown },
  flat: { color: "var(--color-text-tertiary)", bg: "var(--color-chip-bg)", text: "var(--color-text-medium)", Icon: Minus },
};

// Full-bleed: break out of PageLayout's 1068 cap to the whole content area.
export const BLEED_W = "calc(100vw - var(--sidenav-width) - 2 * var(--page-gutter))";
export const COL_H = "calc(100vh - var(--page-padding-top, 32px) - var(--page-padding-bottom, 32px))";
export const fullBleed = { width: BLEED_W, marginInline: `calc((100% - ${BLEED_W}) / 2)`, fontFamily: "var(--font-sans)" };

// ---- Celebrated metric card ----------------------------------------------
export function CelebratedMetricCard({ kpi, active, onClick }) {
  const meta = TONE[kpi.tone] || TONE.flat;
  const { Icon } = meta;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{ ...mc.card, ...(active ? mc.cardOn : null) }}
    >
      <div style={mc.head}>
        <span style={mc.label}>{kpi.label}</span>
        {kpi.spark && <Spark points={kpi.spark} color={meta.color} />}
      </div>
      <span style={mc.value}>{kpi.value}</span>
      <span style={{ ...mc.delta, background: meta.bg, color: meta.text }}>
        <Icon size={13} aria-hidden="true" /> {kpi.delta}
      </span>
    </button>
  );
}

export function Spark({ points, color, w = 64, h = 22 }) {
  if (!points || points.length < 2) return null;
  const min = Math.min(...points), max = Math.max(...points), span = max - min || 1;
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"}${((i / (points.length - 1)) * w).toFixed(1)},${(h - ((p - min) / span) * h).toFixed(1)}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true" style={{ display: "block" }}>
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ---- Metric detail body (trend + AI read + clip + chats) -----------------
export function MetricDetailBody({ metric, onAsk }) {
  const meta = TONE[metric.tone] || TONE.flat;
  const threads = METRIC_THREADS.filter((t) => t.metricId === metric.id);
  return (
    <div style={db.wrap}>
      {metric.spark ? <TrendChart points={metric.spark} color={meta.color} /> : <NoTrend value={metric.value} />}

      <div style={db.explain}>
        <span style={db.aiTag}><Sparkles size={13} /> Mira's read</span>
        <p style={db.explainText}>{metric.explain}</p>
      </div>

      <MetricClip clip={metric.clip} label={metric.label} />

      <div style={db.threads}>
        <div style={db.threadsHead}>
          <span style={db.sectionLabel}>Chats about this metric</span>
          <button type="button" onClick={() => onAsk(`Why did ${metric.label.toLowerCase()} change this week?`)} style={db.startChat}>
            <Plus size={14} /> Start a chat
          </button>
        </div>
        {threads.length === 0
          ? <p style={db.empty}>No chats about this metric yet. Start one to investigate.</p>
          : threads.map((t) => <ThreadRow key={t.id} thread={t} onOpen={() => onAsk(t.title)} />)}
      </div>
    </div>
  );
}

export function MetricDetailHeader({ metric }) {
  const meta = TONE[metric.tone] || TONE.flat;
  const { Icon } = meta;
  return (
    <div style={db.head}>
      <h2 style={db.title}>{metric.label}</h2>
      <div style={db.valueRow}>
        <span style={db.value}>{metric.value}</span>
        <span style={{ ...db.delta, color: meta.color }}><Icon size={15} /> {metric.delta}</span>
      </div>
      <p style={db.source}><Info size={13} /> {metric.source}</p>
    </div>
  );
}

function TrendChart({ points, color, w = 560, h = 150 }) {
  const min = Math.min(...points), max = Math.max(...points), span = max - min || 1;
  const pad = 8, innerH = h - pad * 2;
  const x = (i) => (i / (points.length - 1)) * w;
  const y = (p) => pad + innerH - ((p - min) / span) * innerH;
  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p).toFixed(1)}`).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;
  const gid = `wsTrend-${color.replace(/[^a-z]/gi, "")}`;
  return (
    <figure style={db.chartFig}>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none" role="img" aria-label={`Trend, ${min} to ${max} over 7 weeks`}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#${gid})`} />
        <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <figcaption style={db.chartCaption}><span>Trailing 7 weeks</span><span>{min}–{max} range</span></figcaption>
    </figure>
  );
}

function NoTrend({ value }) {
  return (
    <div style={db.noTrend}>
      <span style={db.noTrendValue}>{value}</span>
      <span style={db.noTrendNote}>Categorical — no time trend</span>
    </div>
  );
}

function MetricClip({ clip, label }) {
  const [playing, setPlaying] = React.useState(false);
  const [t, setT] = React.useState(0);
  const [showText, setShowText] = React.useState(false);
  React.useEffect(() => {
    if (!playing) return undefined;
    const id = setInterval(() => setT((p) => { if (p + 1 >= clip.durationSec) { setPlaying(false); return clip.durationSec; } return p + 1; }), 250);
    return () => clearInterval(id);
  }, [playing, clip.durationSec]);
  const progress = clip.durationSec ? (t / clip.durationSec) * 100 : 0;
  const fmt = (sec) => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;
  return (
    <div style={db.clip}>
      <button type="button" onClick={() => { if (t >= clip.durationSec) setT(0); setPlaying((p) => !p); }} aria-label={playing ? `Pause ${label} explainer` : `Play ${label} explainer`} style={db.clipBtn}>
        {playing ? <Pause size={16} color="#FFFFFF" /> : <Play size={16} color="#FFFFFF" style={{ marginInlineStart: 2 }} />}
      </button>
      <div style={db.clipBody}>
        <div style={db.clipTop}>
          <span style={db.clipTitle}>{label} — 2-voice explainer</span>
          <span style={db.clipTime}>{fmt(t)} / {clip.durationLabel}</span>
        </div>
        <div style={db.clipTrack}><div style={{ ...db.clipFill, width: `${progress}%` }} /></div>
        <button type="button" onClick={() => setShowText((v) => !v)} style={db.clipToggle} aria-expanded={showText}>{showText ? "Hide transcript" : "Transcript"}</button>
        {showText && <div style={db.clipTranscript}>{clip.transcript.map((r, i) => <p key={i} style={db.clipLine}><span style={db.clipSpeaker}>{r.speaker}</span>{r.line}</p>)}</div>}
      </div>
    </div>
  );
}

export function ThreadRow({ thread, onOpen }) {
  const shared = thread.visibility === "shared";
  return (
    <button type="button" onClick={onOpen} style={db.threadRow}>
      <span style={{ ...db.threadBadge, ...(shared ? db.badgeShared : db.badgePrivate) }}>{shared ? <Users size={11} /> : <Lock size={11} />}</span>
      <span style={db.threadMeta}>
        <span style={db.threadTitle}>{thread.title}</span>
        <span style={db.threadSub}>{thread.author.name} · {thread.updated}</span>
      </span>
      <ChevronRight size={15} color="var(--color-text-tertiary)" />
    </button>
  );
}

// ---- Starter cards (NotebookLM Studio style grid) ------------------------
export function StarterCards({ metric, onPick }) {
  const cards = [
    { icon: HelpCircle, label: `Why did ${metric.label.toLowerCase()} move?`, q: `Why did ${metric.label.toLowerCase()} change this week?` },
    { icon: GitCompare, label: "Compare vs last quarter", q: `How does ${metric.label.toLowerCase()} compare to last quarter?` },
    { icon: Layers, label: "Break down by segment", q: `Break ${metric.label.toLowerCase()} down by segment.` },
    { icon: FileText, label: "Summarise for my team", q: `Draft a short summary of ${metric.label.toLowerCase()} for my team.` },
  ];
  return (
    <div style={sc.grid}>
      {cards.map((c) => {
        const CIcon = c.icon;
        return (
          <button key={c.label} type="button" onClick={() => onPick(c.q)} style={sc.card}>
            <span style={sc.icon} aria-hidden="true"><CIcon size={16} color="var(--color-icon-tertiary-fg)" /></span>
            <span style={sc.label}>{c.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ---- Compact public/private toggle (Public default, on the left) ---------
export function PublicPrivateToggle({ value, onChange }) {
  return (
    <div style={pp.toggle} role="group" aria-label="Chat visibility">
      {[{ id: "public", label: "Public", Icon: Users }, { id: "private", label: "Private", Icon: Lock }].map((o) => {
        const on = o.id === value;
        const OIcon = o.Icon;
        return (
          <button key={o.id} type="button" onClick={() => onChange(o.id)} aria-pressed={on} style={{ ...pp.btn, ...(on ? pp.btnOn : null) }}>
            <OIcon size={12} /> {o.label}
          </button>
        );
      })}
    </div>
  );
}

// ---- Bottom Facebook-style chat (collapsed bar → floating panel) ---------
// `open` is controlled by the host direction so a metric's "Start a chat" /
// thread click can open it pre-scoped.
export function MiraBottomChat({ open, onOpenChange, metric, conversation, pendingTurnId, queriesUsed, queriesTotal = 1002, onSubmit, onReset }) {
  const [query, setQuery] = React.useState("");
  const [visibility, setVisibility] = React.useState("public");
  const inChat = conversation.length > 0;
  const pending = Boolean(pendingTurnId);
  const queriesLeft = Math.max(queriesTotal - queriesUsed, 0);
  const submit = (text) => {
    const v = (text ?? query).trim();
    if (!v || pending) return;
    onSubmit(v);
    setQuery("");
    onOpenChange(true);
  };

  if (!open) {
    return (
      <button type="button" onClick={() => onOpenChange(true)} style={bc.fab} aria-label="Open Ask Mira chat">
        <MiraStarIcon size={20} color="#FFFFFF" />
        <span style={bc.fabLabel}>Ask Mira</span>
        {inChat && <span style={bc.fabDot} aria-hidden="true" />}
      </button>
    );
  }

  return (
    <aside style={bc.panel} aria-label="Ask Mira chat">
      <header style={bc.head}>
        <span style={bc.headTitle}><MiraStarIcon size={18} color="var(--color-button-primary-bg)" /> Ask Mira</span>
        <div style={{ flex: 1 }} />
        {inChat && <Button variant="icon" size="sm" aria-label="New chat" onClick={onReset}><Plus size={16} color="var(--color-text-medium)" /></Button>}
        <Button variant="icon" size="sm" aria-label="Minimise chat" onClick={() => onOpenChange(false)}><X size={16} color="var(--color-text-medium)" /></Button>
      </header>

      <div style={bc.visWrap}>
        <PublicPrivateToggle value={visibility} onChange={setVisibility} />
        <span style={bc.visNote}>{visibility === "public" ? `Shared with the ${SPACE.name} space.` : "Only you can see this chat."}</span>
      </div>

      <div style={bc.body}>
        {inChat
          ? <MiraConversation turns={conversation} pendingTurnId={pendingTurnId} onSubmitFollowUp={submit} />
          : <div style={bc.starters}><p style={bc.startersLabel}>Start from a topic</p><StarterCards metric={metric} onPick={submit} /></div>}
      </div>

      <footer style={bc.composerWrap}>
        <div style={bc.composerCard}>
          <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") submit(); }} placeholder={`Ask about ${metric.label.toLowerCase()}…`} aria-label="Ask a question" style={bc.input} />
          <div style={bc.composerFooter}>
            <div style={bc.chipRow}>
              <button type="button" style={bc.chip} onClick={() => {}}><TuneIcon size={15} color="var(--color-text-medium)" /> Graph</button>
              <button type="button" style={bc.chip} onClick={() => {}}><FilterFunnelIcon size={15} color="var(--color-text-medium)" /> Context</button>
            </div>
            <Button variant="icon" size="md" aria-label={pending ? "Generating" : "Send"} onClick={pending ? () => {} : () => submit()} style={bc.sendBtn}>
              {pending ? <RefreshCw size={16} color="var(--color-text-medium)" /> : <ArrowUpIcon size={18} color="var(--color-text-medium)" />}
            </Button>
          </div>
        </div>
        <div style={bc.disclaimer}><span>Mira can make mistakes.</span><span>{queriesLeft} of {queriesTotal} left</span></div>
      </footer>
    </aside>
  );
}

// ==== Styles ==============================================================

const mc = {
  card: { display: "flex", flexDirection: "column", gap: 8, padding: 18, borderRadius: 14, border: "1px solid var(--color-border-card-soft)", background: "var(--surface-white)", cursor: "pointer", textAlign: "start", width: "100%", fontFamily: "var(--font-sans)", boxShadow: "var(--shadow-1)", transition: "border-color 150ms ease, box-shadow 150ms ease, background 150ms ease" },
  cardOn: { borderColor: "var(--color-icon-tertiary-fg)", boxShadow: "var(--shadow-4)", background: "var(--color-surface-header-tinted)" },
  head: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 },
  label: { fontSize: 13, fontWeight: 600, color: "var(--color-text-medium)", lineHeight: 1.35 },
  value: { fontSize: 30, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--color-text-deep)", lineHeight: 1 },
  delta: { display: "inline-flex", alignItems: "center", gap: 5, alignSelf: "flex-start", height: 24, paddingInline: 9, borderRadius: 999, fontSize: 12, fontWeight: 700 },
};

const db = {
  wrap: { display: "flex", flexDirection: "column", gap: 18 },
  head: { display: "flex", flexDirection: "column", gap: 4 },
  title: { margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: "-0.01em", color: "var(--color-text-deep)" },
  valueRow: { display: "flex", alignItems: "baseline", gap: 12, marginTop: 2 },
  value: { fontSize: 34, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--color-text-deep)", lineHeight: 1 },
  delta: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 700 },
  source: { margin: "4px 0 0", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--color-text-tertiary)" },

  chartFig: { margin: 0, display: "flex", flexDirection: "column", gap: 6 },
  chartCaption: { display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11, fontWeight: 600, color: "var(--color-text-tertiary)" },
  noTrend: { display: "flex", flexDirection: "column", gap: 4, padding: "12px 0" },
  noTrendValue: { fontSize: 30, fontWeight: 800, color: "var(--color-text-deep)" },
  noTrendNote: { fontSize: 12, color: "var(--color-text-tertiary)" },

  explain: { display: "flex", flexDirection: "column", gap: 8, padding: 16, borderRadius: 12, background: "var(--color-surface-header-tinted)", border: "1px solid var(--color-border-card-soft)" },
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
  empty: { margin: 0, fontSize: 13, color: "var(--color-text-tertiary)", padding: "8px 0" },
  threadRow: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, border: "1px solid var(--color-border-card-soft)", background: "var(--surface-white)", cursor: "pointer", textAlign: "start", width: "100%", fontFamily: "var(--font-sans)" },
  threadBadge: { width: 24, height: 24, borderRadius: 999, display: "inline-grid", placeItems: "center", flexShrink: 0 },
  badgeShared: { background: "var(--color-icon-tertiary-bg)", color: "var(--color-icon-tertiary-fg)" },
  badgePrivate: { background: "var(--color-chip-bg)", color: "var(--color-text-medium)" },
  threadMeta: { display: "flex", flexDirection: "column", gap: 1, minWidth: 0, flex: 1 },
  threadTitle: { fontSize: 13, fontWeight: 600, color: "var(--color-text-deep)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  threadSub: { fontSize: 11.5, color: "var(--color-text-tertiary)" },
};

const sc = {
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  card: { display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10, padding: 14, borderRadius: 12, border: "1px solid var(--color-border-card-soft)", background: "var(--surface-white)", cursor: "pointer", textAlign: "start", fontFamily: "var(--font-sans)", minHeight: 84, transition: "border-color 150ms ease, box-shadow 150ms ease" },
  icon: { width: 30, height: 30, borderRadius: 8, background: "var(--color-icon-tertiary-bg)", display: "inline-grid", placeItems: "center", flexShrink: 0 },
  label: { fontSize: 13, fontWeight: 600, color: "var(--color-text-deep)", lineHeight: 1.35 },
};

const pp = {
  toggle: { display: "inline-flex", padding: 2, borderRadius: 999, background: "var(--color-chip-bg)", gap: 2 },
  btn: { display: "inline-flex", alignItems: "center", gap: 5, height: 26, paddingInline: 10, borderRadius: 999, border: "none", background: "transparent", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 700, color: "var(--color-text-tertiary)" },
  btnOn: { background: "var(--surface-white)", color: "var(--color-text-deep)", boxShadow: "var(--shadow-1)" },
};

const bc = {
  fab: { position: "fixed", right: 24, bottom: 96, zIndex: 50, display: "inline-flex", alignItems: "center", gap: 10, height: 52, paddingInline: 18, borderRadius: 999, border: "none", background: "var(--color-button-primary-bg)", color: "#FFFFFF", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 700, boxShadow: "var(--shadow-16)" },
  fabLabel: { color: "#FFFFFF" },
  fabDot: { width: 9, height: 9, borderRadius: 999, background: "var(--color-warning)", border: "2px solid var(--color-button-primary-bg)" },

  panel: { position: "fixed", right: 24, bottom: 96, zIndex: 50, width: 384, maxWidth: "calc(100vw - 48px)", height: "min(560px, calc(100vh - 150px))", display: "flex", flexDirection: "column", borderRadius: 16, border: "1px solid var(--color-border-card-soft)", background: "var(--surface-white)", boxShadow: "var(--shadow-24)", overflow: "hidden" },
  head: { display: "flex", alignItems: "center", gap: 6, padding: "12px 12px 12px 14px", borderBottom: "1px solid var(--color-divider-card)", flexShrink: 0 },
  headTitle: { display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, color: "var(--color-text-deep)" },
  visWrap: { display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: "1px solid var(--color-divider-card)", flexShrink: 0 },
  visNote: { fontSize: 11.5, color: "var(--color-text-tertiary)", minWidth: 0 },
  body: { flex: 1, minHeight: 0, overflowY: "auto", padding: 16 },
  starters: { display: "flex", flexDirection: "column", gap: 10 },
  startersLabel: { margin: 0, fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--color-text-tertiary)" },
  composerWrap: { flexShrink: 0, padding: 12, borderTop: "1px solid var(--color-divider-card)", display: "flex", flexDirection: "column", gap: 6 },
  composerCard: { display: "flex", flexDirection: "column", gap: 10, padding: "12px 14px", borderRadius: 12, border: "1px solid var(--color-border-tab)" },
  input: { width: "100%", border: "none", outline: "none", background: "transparent", fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--color-text-deep)" },
  composerFooter: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 },
  chipRow: { display: "flex", alignItems: "center", gap: 6 },
  chip: { display: "inline-flex", alignItems: "center", gap: 5, height: 30, paddingInline: 10, borderRadius: 8, border: "1px solid var(--color-divider-card)", background: "var(--surface-white)", fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: "var(--color-text-medium)", cursor: "pointer" },
  sendBtn: { border: "1px solid var(--color-divider-card)" },
  disclaimer: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, paddingInline: 4, fontSize: 11, fontWeight: 500, color: "var(--color-text-tertiary)" },
};
