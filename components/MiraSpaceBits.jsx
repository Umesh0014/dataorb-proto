"use client";

import React from "react";
import {
  Play, Pause, Languages, ChevronRight, Lock, Users, Sparkles,
  TrendingUp, TrendingDown, Minus, Info, ArrowUpRight,
} from "lucide-react";
import Card from "./Card";
import Button from "./Button";

// MiraSpaceBits — shared leaf atoms for the Ask Mira Pro outcome-space
// directions (Briefing-first / Room / Player). A KPI card is a KPI card in
// every direction; what differs across directions is the *composition* (which
// element is the hero, how the four parts are arranged) — not these leaves.
// Each direction file imports from here and lays them out to a distinct
// mental model. All values resolve through globals.css tokens (G1).

// ---- Simulated playback hook --------------------------------------------
// In-memory only (G5). Advances a 0–1 playhead while "playing"; no audio.
function useSimPlayback(durationSec) {
  const [playing, setPlaying] = React.useState(false);
  const [t, setT] = React.useState(0); // seconds
  const reduce = usePrefersReducedMotion();
  React.useEffect(() => {
    if (!playing) return undefined;
    const step = reduce ? 4 : 1;
    const id = setInterval(() => {
      setT((prev) => {
        const next = prev + step;
        if (next >= durationSec) { setPlaying(false); return durationSec; }
        return next;
      });
    }, reduce ? 1000 : 250);
    return () => clearInterval(id);
  }, [playing, durationSec, reduce]);
  const toggle = () => {
    if (t >= durationSec) setT(0);
    setPlaying((p) => !p);
  };
  const seek = (sec) => setT(Math.max(0, Math.min(durationSec, sec)));
  return { playing, t, progress: durationSec ? t / durationSec : 0, toggle, seek };
}

function usePrefersReducedMotion() {
  const [reduce, setReduce] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const handler = (e) => setReduce(e.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);
  return reduce;
}

function fmt(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

// ---- Briefing player -----------------------------------------------------
// The hero audio affordance, reused at three sizes. `variant`:
//   "hero"    — large, transcript inline-toggle (Briefing-first / Player)
//   "block"   — medium card, fits a room block (Room)
// Carries: play/pause, scrubbable track, chapter markers, EN↔AR language
// toggle (with a determinate "regenerating" state), a text TL;DR peer to the
// audio (usable muted), and a transcript disclosure.
export function BriefingPlayer({ briefing, variant = "hero", onAsk }) {
  const { playing, t, progress, toggle, seek } = useSimPlayback(briefing.durationSec);
  const [lang, setLang] = React.useState("en");
  const [regenerating, setRegenerating] = React.useState(false);
  const [showTranscript, setShowTranscript] = React.useState(false);
  const isAr = lang === "ar";

  const switchLang = (next) => {
    if (next === lang) return;
    setRegenerating(true);
    // Async re-render: generate in English, listen in Arabic (~1.1s).
    setTimeout(() => { setLang(next); setRegenerating(false); }, 1100);
  };

  const title = isAr ? briefing.titleAr : briefing.title;
  const tldr = isAr ? briefing.tldrAr : briefing.tldr;
  const isHero = variant === "hero";

  return (
    <div style={{ ...bp.wrap, padding: isHero ? 24 : 20 }} dir={isAr ? "rtl" : "ltr"}>
      <div style={bp.topRow}>
        <span style={bp.eyebrow}>
          <Sparkles size={13} /> {briefing.episodeLabel} · {briefing.date}
        </span>
        <LangToggle lang={lang} onSwitch={switchLang} busy={regenerating} />
      </div>

      <h2 style={{ ...bp.title, fontSize: isHero ? 22 : 17 }} dir="auto">{title}</h2>

      {/* TL;DR — the brief, equally usable muted */}
      <p style={bp.tldr} dir="auto">{tldr}</p>

      <div style={bp.playRow}>
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pause briefing" : "Play briefing"}
          style={bp.playBtn}
        >
          {playing
            ? <Pause size={20} color="#FFFFFF" />
            : <Play size={20} color="#FFFFFF" style={{ marginInlineStart: 2 }} />}
        </button>
        <div style={bp.trackCol}>
          <Track
            progress={progress}
            chapters={briefing.chapters}
            durationSec={briefing.durationSec}
            onSeekChapter={(at) => { seek(at); }}
          />
          <div style={bp.trackMeta}>
            <span style={bp.time}>{fmt(t)} / {briefing.durationLabel}</span>
            <span style={bp.sourceNote} dir="auto">
              <Info size={12} /> {briefing.source}
            </span>
          </div>
        </div>
      </div>

      {/* Chapter chips — jump to a KPI theme (podcast chapter UX) */}
      <div style={bp.chapters} role="list">
        {briefing.chapters.map((c) => {
          const active = t >= chapterStart(briefing, c) &&
            t < chapterEnd(briefing, c);
          return (
            <button
              key={c.id}
              type="button"
              role="listitem"
              onClick={() => seek(chapterStart(briefing, c))}
              style={{ ...bp.chapter, ...(active ? bp.chapterOn : null) }}
            >
              <span style={bp.chapterAt}>{c.at}</span>
              <span dir="auto">{c.label}</span>
            </button>
          );
        })}
      </div>

      <div style={bp.footRow}>
        <button
          type="button"
          onClick={() => setShowTranscript((v) => !v)}
          style={bp.transcriptToggle}
          aria-expanded={showTranscript}
        >
          {showTranscript ? "Hide transcript" : "Show transcript"}
          <ChevronRight
            size={14}
            style={{ transform: showTranscript ? "rotate(90deg)" : "none", transition: "transform 150ms ease" }}
          />
        </button>
        {onAsk && (
          <Button variant="text" onClick={() => onAsk(briefing.chapters[0] ? "Why did we lose the three Northwind deals?" : "")}>
            Ask a follow-up
          </Button>
        )}
      </div>

      {showTranscript && (
        <div style={bp.transcript}>
          {briefing.transcript.map((row, i) => (
            <p key={i} style={bp.line} dir="auto">
              <span style={bp.speaker}>{row.speaker}</span>
              {row.line}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function chapterStart(briefing, c) {
  const [m, s] = c.at.split(":").map(Number);
  return m * 60 + s;
}
function chapterEnd(briefing, c) {
  const idx = briefing.chapters.indexOf(c);
  const next = briefing.chapters[idx + 1];
  return next ? chapterStart(briefing, next) : briefing.durationSec;
}

function Track({ progress, chapters, durationSec, onSeekChapter }) {
  return (
    <div style={bp.track} aria-hidden="true">
      <div style={{ ...bp.trackFill, width: `${progress * 100}%` }} />
      {chapters.map((c) => {
        const [m, s] = c.at.split(":").map(Number);
        const left = ((m * 60 + s) / durationSec) * 100;
        return (
          <button
            key={c.id}
            type="button"
            aria-label={`Jump to ${c.label}`}
            onClick={() => onSeekChapter(m * 60 + s)}
            style={{ ...bp.trackMarker, insetInlineStart: `${left}%` }}
          />
        );
      })}
    </div>
  );
}

function LangToggle({ lang, onSwitch, busy }) {
  return (
    <div style={bp.langWrap} role="group" aria-label="Briefing language">
      {busy ? (
        <span style={bp.langBusy} role="status">
          <span style={bp.spinner} aria-hidden="true" /> Regenerating…
        </span>
      ) : (
        <>
          <Languages size={14} color="var(--color-text-tertiary)" />
          {[{ id: "en", label: "EN" }, { id: "ar", label: "العربية" }].map((o) => {
            const on = o.id === lang;
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => onSwitch(o.id)}
                aria-pressed={on}
                style={{ ...bp.langBtn, ...(on ? bp.langBtnOn : null) }}
              >
                {o.label}
              </button>
            );
          })}
        </>
      )}
    </div>
  );
}

// ---- KPI card ------------------------------------------------------------
// label + value + labelled/unit-bearing delta (G3) + mini sparkline + a real
// (text, not icon-only) source line for lineage. Whole card opens a
// KPI-scoped ask (drill discoverable, not hover-only — INT-2).
const TONE_META = {
  up: { color: "var(--color-success)", Icon: TrendingUp },
  down: { color: "var(--color-error)", Icon: TrendingDown },
  warn: { color: "var(--color-warning)", Icon: TrendingDown },
  flat: { color: "var(--color-text-tertiary)", Icon: Minus },
};

export function KpiCard({ kpi, onAsk, compact = false }) {
  const [showSource, setShowSource] = React.useState(false);
  const meta = TONE_META[kpi.tone] || TONE_META.flat;
  const { Icon } = meta;
  return (
    <Card padX={compact ? 16 : 20} padY={compact ? 14 : 16} style={kc.card}>
      <div style={kc.head}>
        <span style={kc.label}>{kpi.label}</span>
        {kpi.spark && <MiniSparkline points={kpi.spark} color={meta.color} />}
      </div>
      <div style={kc.valueRow}>
        <span style={{ ...kc.value, fontSize: compact ? 22 : 26 }}>{kpi.value}</span>
      </div>
      <div style={{ ...kc.delta, color: meta.color }}>
        <Icon size={14} aria-hidden="true" />
        <span>{kpi.delta}</span>
      </div>

      <div style={kc.foot}>
        <button
          type="button"
          onClick={() => setShowSource((v) => !v)}
          style={kc.sourceBtn}
          aria-expanded={showSource}
        >
          <Info size={13} /> Source
        </button>
        <button
          type="button"
          onClick={() => onAsk?.(`Tell me more about ${kpi.label.toLowerCase()}.`)}
          style={kc.askBtn}
        >
          Ask <ArrowUpRight size={13} />
        </button>
      </div>
      {showSource && <p style={kc.source}>{kpi.source}</p>}
    </Card>
  );
}

export function MiniSparkline({ points, color, w = 56, h = 20 }) {
  if (!points || points.length < 2) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const d = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((p - min) / span) * h;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true" style={{ display: "block" }}>
      <path d={d} fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ---- Exploration card ----------------------------------------------------
// First-class, persistent, nameable. Visibility is explicit and visible
// (icon + label, not colour alone) — fixes "private vs shared got it wrong".
export function ExplorationCard({ exploration, onOpen }) {
  const isShared = exploration.visibility === "shared";
  return (
    <button type="button" onClick={() => onOpen?.(exploration)} style={ex.card}>
      <div style={ex.head}>
        <span style={{ ...ex.badge, ...(isShared ? ex.badgeShared : ex.badgePrivate) }}>
          {isShared ? <Users size={11} /> : <Lock size={11} />}
          {isShared ? "Shared" : "Private"}
        </span>
        <span style={ex.updated}>{exploration.updated}</span>
      </div>
      <span style={ex.title} dir="auto">{exploration.title}</span>
      <p style={ex.summary} dir="auto">{exploration.summary}</p>
      <div style={ex.foot}>
        <span style={{ ...ex.avatar, background: exploration.author.bg, color: exploration.author.fg }} aria-hidden="true">
          {exploration.author.initials}
        </span>
        <span style={ex.author}>{exploration.author.name}</span>
      </div>
    </button>
  );
}

// ---- Collaborator row (with quota) --------------------------------------
export function CollaboratorRow({ person, compact = false }) {
  const pct = Math.round((person.quotaUsed / person.quotaTotal) * 100);
  return (
    <div style={co.row}>
      <span style={{ ...co.avatar, background: person.bg, color: person.fg }} aria-hidden="true">
        {person.initials}
      </span>
      <div style={co.meta}>
        <span style={co.name}>{person.name}</span>
        {!compact && <span style={co.role}>{person.role}</span>}
      </div>
      <div style={co.quota}>
        <div style={co.quotaBar} aria-hidden="true">
          <div style={{ ...co.quotaFill, width: `${pct}%`, background: pct >= 90 ? "var(--color-warning)" : "var(--color-primary-500)" }} />
        </div>
        <span style={co.quotaText}>{person.quotaUsed}/{person.quotaTotal} queries</span>
      </div>
    </div>
  );
}

// ---- Section header ------------------------------------------------------
export function SectionLabel({ icon, children, action }) {
  return (
    <div style={sl.row}>
      <span style={sl.label}>
        {icon}{children}
      </span>
      {action}
    </div>
  );
}

// ==== Styles ==============================================================

const bp = {
  wrap: {
    background: "linear-gradient(180deg, var(--color-surface-header-tinted) 0%, #FFFFFF 60%)",
    border: "1px solid var(--color-border-card-soft)",
    borderRadius: 16,
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  topRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 },
  eyebrow: {
    display: "inline-flex", alignItems: "center", gap: 6,
    fontSize: 12, fontWeight: 700, letterSpacing: "0.02em",
    color: "var(--color-icon-tertiary-fg)", textTransform: "uppercase",
  },
  title: { margin: 0, fontWeight: 800, lineHeight: 1.25, color: "var(--color-text-deep)", letterSpacing: "-0.01em" },
  tldr: { margin: 0, fontSize: 15, lineHeight: 1.6, color: "var(--color-text-medium)", fontWeight: 500 },
  playRow: { display: "flex", alignItems: "center", gap: 16 },
  playBtn: {
    width: 52, height: 52, borderRadius: 999, flexShrink: 0, border: "none",
    background: "var(--color-icon-tertiary-fg)", display: "inline-grid", placeItems: "center",
    cursor: "pointer", boxShadow: "var(--shadow-4)",
    transition: "background 150ms ease, box-shadow 150ms ease",
  },
  trackCol: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 8 },
  track: { position: "relative", height: 6, borderRadius: 999, background: "var(--color-divider-card)" },
  trackFill: { position: "absolute", insetInlineStart: 0, top: 0, height: "100%", borderRadius: 999, background: "var(--color-icon-tertiary-fg)", transition: "width 220ms linear" },
  trackMarker: {
    position: "absolute", top: "50%", width: 3, height: 12, transform: "translateX(-50%)",
    marginTop: -6, borderRadius: 2, border: "none", padding: 0,
    background: "var(--color-icon-tertiary-fg)", opacity: 0.5, cursor: "pointer",
  },
  trackMeta: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" },
  time: { fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-text-tertiary)" },
  sourceNote: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--color-text-tertiary)" },
  chapters: { display: "flex", flexWrap: "wrap", gap: 8 },
  chapter: {
    display: "inline-flex", alignItems: "center", gap: 8, height: 30, paddingInline: 12,
    borderRadius: 999, border: "1px solid var(--color-divider-card)", background: "var(--surface-white)",
    fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: "var(--color-text-medium)",
    cursor: "pointer", transition: "background 150ms ease, border-color 150ms ease",
  },
  chapterOn: { borderColor: "var(--color-icon-tertiary-fg)", background: "var(--color-icon-tertiary-bg)", color: "var(--color-icon-tertiary-fg)" },
  chapterAt: { fontFamily: "var(--font-mono)", fontSize: 11, opacity: 0.7 },
  footRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" },
  transcriptToggle: {
    display: "inline-flex", alignItems: "center", gap: 6, border: "none", background: "transparent",
    padding: 0, cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 700,
    color: "var(--color-text-medium)",
  },
  transcript: {
    display: "flex", flexDirection: "column", gap: 10, paddingTop: 14,
    borderTop: "1px solid var(--color-divider-card)",
  },
  line: { margin: 0, fontSize: 14, lineHeight: 1.6, color: "var(--color-text-deep)" },
  speaker: { fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "var(--color-icon-tertiary-fg)", marginInlineEnd: 8 },
  langWrap: { display: "inline-flex", alignItems: "center", gap: 6, height: 30, paddingInline: 8, borderRadius: 999, background: "var(--surface-white)", border: "1px solid var(--color-divider-card)" },
  langBtn: { border: "none", background: "transparent", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 700, color: "var(--color-text-tertiary)", padding: "2px 8px", borderRadius: 999 },
  langBtnOn: { background: "var(--color-icon-tertiary-bg)", color: "var(--color-icon-tertiary-fg)" },
  langBusy: { display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 600, color: "var(--color-text-tertiary)", paddingInline: 4 },
  spinner: {
    width: 12, height: 12, borderRadius: 999, border: "2px solid var(--color-divider-card)",
    borderTopColor: "var(--color-icon-tertiary-fg)", display: "inline-block",
    animation: "mira-spin 0.7s linear infinite",
  },
};

const kc = {
  card: { display: "flex", flexDirection: "column", gap: 6, border: "1px solid var(--color-border-card-soft)", height: "100%", boxSizing: "border-box" },
  head: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 },
  label: { fontSize: 13, fontWeight: 600, color: "var(--color-text-medium)", lineHeight: 1.35 },
  valueRow: { display: "flex", alignItems: "baseline", gap: 8 },
  value: { fontWeight: 800, color: "var(--color-text-deep)", lineHeight: 1.1, letterSpacing: "-0.015em" },
  delta: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, fontWeight: 700 },
  foot: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 4 },
  sourceBtn: { display: "inline-flex", alignItems: "center", gap: 5, border: "none", background: "transparent", padding: 0, cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: "var(--color-text-tertiary)" },
  askBtn: { display: "inline-flex", alignItems: "center", gap: 4, border: "none", background: "transparent", padding: 0, cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 700, color: "var(--color-primary-600)" },
  source: { margin: "2px 0 0", fontSize: 12, lineHeight: 1.5, color: "var(--color-text-tertiary)", paddingTop: 8, borderTop: "1px solid var(--color-divider-card)" },
};

const ex = {
  card: {
    display: "flex", flexDirection: "column", gap: 8, textAlign: "start", width: "100%",
    padding: 16, borderRadius: 12, border: "1px solid var(--color-border-card-soft)",
    background: "var(--surface-white)", cursor: "pointer", fontFamily: "var(--font-sans)",
    transition: "border-color 150ms ease, box-shadow 150ms ease",
  },
  head: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 },
  badge: { display: "inline-flex", alignItems: "center", gap: 5, height: 22, paddingInline: 8, borderRadius: 999, fontSize: 11, fontWeight: 700 },
  badgeShared: { background: "var(--color-icon-tertiary-bg)", color: "var(--color-icon-tertiary-fg)" },
  badgePrivate: { background: "var(--color-chip-bg)", color: "var(--color-text-medium)" },
  updated: { fontSize: 12, color: "var(--color-text-tertiary)" },
  title: { fontSize: 14, fontWeight: 700, color: "var(--color-text-deep)", lineHeight: 1.4 },
  summary: { margin: 0, fontSize: 13, lineHeight: 1.55, color: "var(--color-text-medium)" },
  foot: { display: "flex", alignItems: "center", gap: 8, marginTop: 2 },
  avatar: { width: 22, height: 22, borderRadius: 999, display: "inline-grid", placeItems: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 },
  author: { fontSize: 12, fontWeight: 600, color: "var(--color-text-tertiary)" },
};

const co = {
  row: { display: "flex", alignItems: "center", gap: 12 },
  avatar: { width: 34, height: 34, borderRadius: 999, display: "inline-grid", placeItems: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 },
  meta: { display: "flex", flexDirection: "column", gap: 1, minWidth: 0, flex: 1 },
  name: { fontSize: 13, fontWeight: 700, color: "var(--color-text-deep)" },
  role: { fontSize: 12, color: "var(--color-text-tertiary)" },
  quota: { display: "flex", flexDirection: "column", gap: 4, width: 120, flexShrink: 0 },
  quotaBar: { height: 5, borderRadius: 999, background: "var(--color-divider-card)", overflow: "hidden" },
  quotaFill: { height: "100%", borderRadius: 999, transition: "width 200ms ease" },
  quotaText: { fontSize: 11, color: "var(--color-text-tertiary)", textAlign: "end", fontFamily: "var(--font-mono)" },
};

const sl = {
  row: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 2 },
  label: { display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, letterSpacing: "0.02em", color: "var(--color-text-deep)" },
};
