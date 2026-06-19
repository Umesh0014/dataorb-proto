"use client";

import React from "react";
import {
  Globe, Lock, Eye, MessageSquare, Pin, Clock, ArrowRight, Sparkles,
  GitCompare, FileText, ChevronRight,
} from "lucide-react";
import { MiraStarIcon, ArrowUpIcon } from "./SideNav/icons";
import { TONE } from "./MiraWorkspaceBits";
import { KPIS } from "./mocks/miraSpace";

// MiraStoriesBits — shared atoms for the "Stories" directions (Jun 19
// sharpening). All directions render from the same STORIES mock; only the
// arrangement differs, so Gate-1 compares mental models, not content. These
// leaves carry the cross-cutting must-haves from research: source/lineage on
// every number, an explicit visibility state, a reuse signal, and an "as of"
// stamp on pinned insights (a pin is a live pointer, never a copy-paste).
// Tokens-only; state in-memory.

const kpiById = (id) => KPIS.find((k) => k.id === id);

// ---- Avatar --------------------------------------------------------------
export function Avatar({ person, size = 24 }) {
  if (!person) return null;
  return (
    <span style={{ ...st.avatar, width: size, height: size, background: person.bg, color: person.fg, fontSize: Math.round(size * 0.42) }}>
      {person.initials}
    </span>
  );
}

// ---- Visibility badge (default-public; private opt-in) -------------------
export function VisibilityBadge({ visibility }) {
  const isPublic = visibility !== "private";
  return (
    <span style={{ ...st.vis, color: isPublic ? "var(--color-text-tertiary)" : "var(--color-warning-text)" }}>
      {isPublic ? <Globe size={13} aria-hidden="true" /> : <Lock size={13} aria-hidden="true" />}
      {isPublic ? "Public" : "Private"}
    </span>
  );
}

// ---- Story meta row (author · date · read · views · comments · vis) -------
export function StoryMeta({ story, showVisibility = true }) {
  return (
    <div style={st.meta}>
      <Avatar person={story.author} size={22} />
      <span style={st.metaName}>{story.author.name}</span>
      <span style={st.dot}>·</span>
      <span style={st.metaDim}>{story.date}</span>
      <span style={st.dot}>·</span>
      <span style={st.metaDim}>{story.readTimeLabel}</span>
      <span style={{ flex: 1 }} />
      {story.viewCount > 0 && <span style={st.metaStat}><Eye size={14} aria-hidden="true" /> {story.viewCount}</span>}
      {story.commentCount > 0 && <span style={st.metaStat}><MessageSquare size={14} aria-hidden="true" /> {story.commentCount}</span>}
      {showVisibility && <VisibilityBadge visibility={story.visibility} />}
    </div>
  );
}

// ---- Reuse hint — "already explored, don't regenerate" -------------------
export function ReuseHint({ story }) {
  return (
    <span style={st.reuse}>
      <Sparkles size={13} aria-hidden="true" /> Authored once · viewed {story.viewCount}×
    </span>
  );
}

// ---- Key-moments chart (annotated trend; the stock-tracker pattern) -------
// One outcome metric over time with pinned "key moments"; click a marker for
// the on-demand "what happened here?" note. `compare` overlays the prior
// window (compare-across-windows, faint).
export function KeyMomentsChart({ kpi, keyMoments = [], height = 160, compare = false, activeIndex }) {
  const [internal, setInternal] = React.useState(null);
  const controlled = activeIndex !== undefined;
  const active = controlled ? activeIndex : internal;
  const setActive = (v) => { if (!controlled) setInternal(v); };
  if (!kpi || !kpi.spark) return null;
  const meta = TONE[kpi.tone] || TONE.flat;
  const pts = kpi.spark;
  const min = Math.min(...pts), max = Math.max(...pts), span = max - min || 1;
  const X = (i) => (i / (pts.length - 1)) * 100;
  const Y = (v) => 34 - ((v - min) / span) * 30 + 3;
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${X(i).toFixed(1)},${Y(p).toFixed(1)}`).join(" ");
  const area = `${line} L100,40 L0,40 Z`;
  const prior = compare ? pts.map((p, i) => `${i === 0 ? "M" : "L"}${X(i).toFixed(1)},${Y(p + 3).toFixed(1)}`).join(" ") : null;
  // Markers sit in the recent portion of the trend (where the action is).
  const markerFrac = [0.5, 0.72, 0.9];

  return (
    <div style={st.chartWrap}>
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" style={{ width: "100%", height, display: "block" }} aria-hidden="true">
        <defs>
          <linearGradient id={`kmg-${kpi.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={meta.color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={meta.color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#kmg-${kpi.id})`} />
        {prior && <path d={prior} fill="none" stroke="var(--color-text-tertiary)" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" vectorEffect="non-scaling-stroke" />}
        <path d={line} fill="none" stroke={meta.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        {keyMoments.map((m, i) => {
          const x = (markerFrac[i] ?? 0.5) * 100;
          return <line key={m.at} x1={x} y1="2" x2={x} y2="40" stroke={active === i ? meta.color : "var(--color-divider-card)"} strokeWidth="1" strokeDasharray="3 2" vectorEffect="non-scaling-stroke" />;
        })}
      </svg>
      {/* Markers as positioned buttons over the svg */}
      <div style={st.markerLayer}>
        {keyMoments.map((m, i) => (
          <button key={m.at} type="button" onClick={() => setActive(active === i ? null : i)}
            style={{ ...st.marker, left: `${(markerFrac[i] ?? 0.5) * 100}%`, ...(active === i ? { background: meta.color, color: "#fff", borderColor: meta.color } : null) }}
            aria-label={`Key moment: ${m.label}`}>
            {i + 1}
          </button>
        ))}
      </div>
      <div style={st.chartFoot}>
        <span style={st.chartCap}>{compare ? "This window vs. prior (dashed)" : `Trailing ${pts.length} weeks`}</span>
        {keyMoments.length > 0 && <span style={st.chartHint}>Tap a marker for "what happened here?"</span>}
      </div>
      {active != null && keyMoments[active] && (
        <div style={st.moment}>
          <span style={{ ...st.momentNum, background: meta.color }}>{active + 1}</span>
          <div>
            <p style={st.momentLabel}>{keyMoments[active].label} <span style={st.momentAt}>· {keyMoments[active].at}</span></p>
            <p style={st.momentNote}>{keyMoments[active].note}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Pinned insight (live pointer: number + source + "as of" + who) ------
export function PinnedInsight({ insight, asOf = "as of Jun 18" }) {
  return (
    <div style={st.pin}>
      <div style={st.pinHead}>
        <span style={st.pinTag}><Pin size={13} aria-hidden="true" /> Pinned insight</span>
        {insight.pinnedBy && (
          <span style={st.pinBy}><Avatar person={insight.pinnedBy} size={18} /> {insight.pinnedBy.name}</span>
        )}
      </div>
      <p style={st.pinText}>{insight.text}</p>
      <div style={st.pinFoot}>
        <span style={st.pinSource}><FileText size={12} aria-hidden="true" /> {insight.source}</span>
        <span style={st.pinAsOf}><Clock size={12} aria-hidden="true" /> {asOf}</span>
      </div>
    </div>
  );
}

// ---- Story body — renders the ordered blocks (the artifact content) -------
export function StoryBody({ story, onAsk }) {
  return (
    <div style={st.body}>
      {story.blocks.map((b) => {
        if (b.type === "narrative") return <p key={b.id} style={st.para}>{b.text}</p>;
        if (b.type === "recommendation") return (
          <div key={b.id} style={st.rec}>
            <span style={st.recTag}><ArrowRight size={14} aria-hidden="true" /> Recommended</span>
            <p style={st.recText}>{b.text}</p>
          </div>
        );
        if (b.type === "insight") return <PinnedInsight key={b.id} insight={b} />;
        if (b.type === "chart") {
          const kpi = kpiById(b.kpiId);
          return (
            <figure key={b.id} style={st.fig}>
              <KeyMomentsChart kpi={kpi} keyMoments={b.keyMoments} />
              <figcaption style={st.figCap}>
                {b.caption}
                {kpi && <span style={st.figSrc}> · {kpi.source}</span>}
              </figcaption>
            </figure>
          );
        }
        return null;
      })}
      {onAsk && (
        <button type="button" style={st.askInline} onClick={() => onAsk(story.question)}>
          <MiraStarIcon size={16} color="var(--color-button-primary-bg)" /> Ask a follow-up about this story
        </button>
      )}
    </div>
  );
}

// ---- Comments thread (collaboration) -------------------------------------
export function CommentThread({ comments }) {
  if (!comments || comments.length === 0) return null;
  return (
    <div style={st.comments}>
      <p style={st.commentsHead}>{comments.length} comment{comments.length === 1 ? "" : "s"}</p>
      {comments.map((c) => (
        <div key={c.id} style={st.comment}>
          <Avatar person={c.author} size={26} />
          <div style={st.commentBody}>
            <div style={st.commentMeta}><span style={st.commentName}>{c.author.name}</span><span style={st.dot}>·</span><span style={st.metaDim}>{c.at}</span>{c.anchorBlockId && <span style={st.commentAnchor}><Pin size={11} /> on a highlight</span>}</div>
            <p style={st.commentText}>{c.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---- KPI chip + Story card (shared across all three landings) ------------
export function KpiChip({ kpiId }) {
  const k = kpiById(kpiId);
  if (!k) return null;
  const meta = TONE[k.tone] || TONE.flat;
  return <span style={st.chip}><span style={{ ...st.chipDot, background: meta.color }} aria-hidden="true" /> {k.label}</span>;
}

export function StoryCard({ story, onOpen }) {
  const isDraft = story.status === "draft";
  return (
    <button type="button" onClick={() => onOpen?.(story.id)} style={st.scard}>
      <div style={st.scardTop}>
        <VisibilityBadge visibility={story.visibility} />
        {isDraft && <span style={st.draft}>Draft</span>}
      </div>
      <h3 style={st.scardTitle}>{story.title}</h3>
      <p style={st.scardTldr}>{story.tldr}</p>
      <div style={st.scardChips}>{story.kpiIds.slice(0, 3).map((id) => <KpiChip key={id} kpiId={id} />)}</div>
      <div style={st.scardFoot}>
        <Avatar person={story.author} size={22} />
        <span style={st.scardAuthor}>{story.author.name}</span>
        <span style={{ flex: 1 }} />
        {story.viewCount > 0 && <span style={st.metaStat}><Eye size={13} aria-hidden="true" /> {story.viewCount}</span>}
        {story.commentCount > 0 && <span style={st.metaStat}><MessageSquare size={13} aria-hidden="true" /> {story.commentCount}</span>}
      </div>
    </button>
  );
}

// ---- Ask bar (no blank prompt; carries a reuse hint) ---------------------
export function AskBar({ placeholder = "Ask about this outcome…", onSubmit, hint }) {
  const [v, setV] = React.useState("");
  const submit = () => { const t = v.trim(); if (!t) return; onSubmit?.(t); setV(""); };
  return (
    <div style={st.askWrap}>
      <div style={st.ask}>
        <MiraStarIcon size={18} color="var(--color-button-primary-bg)" />
        <input value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") submit(); }} placeholder={placeholder} aria-label="Ask Mira" style={st.askInput} />
        <button type="button" onClick={submit} aria-label="Ask" style={st.askSend}><ArrowUpIcon size={18} color="var(--color-text-medium)" /></button>
      </div>
      {hint && <span style={st.askHint}>{hint}</span>}
    </div>
  );
}

// ==== Styles ==============================================================
const st = {
  avatar: { display: "inline-grid", placeItems: "center", borderRadius: 999, fontWeight: 700, flexShrink: 0 },

  vis: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600 },

  meta: { display: "flex", alignItems: "center", gap: 6, fontSize: 13 },
  metaName: { fontWeight: 600, color: "var(--color-text-deep)" },
  metaDim: { color: "var(--color-text-tertiary)" },
  dot: { color: "var(--color-text-tertiary)" },
  metaStat: { display: "inline-flex", alignItems: "center", gap: 4, color: "var(--color-text-tertiary)", fontWeight: 500 },

  reuse: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: "var(--color-button-primary-bg)" },

  chartWrap: { position: "relative" },
  markerLayer: { position: "absolute", top: 0, left: 0, right: 0, height: 0 },
  marker: { position: "absolute", top: -2, transform: "translateX(-50%)", width: 22, height: 22, borderRadius: 999, border: "1px solid var(--color-divider-card)", background: "var(--surface-white)", color: "var(--color-text-medium)", fontSize: 11, fontWeight: 700, cursor: "pointer", boxShadow: "var(--shadow-1)" },
  chartFoot: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 6 },
  chartCap: { fontSize: 12, color: "var(--color-text-tertiary)" },
  chartHint: { fontSize: 12, color: "var(--color-button-primary-bg)", fontWeight: 600 },
  moment: { display: "flex", gap: 10, marginTop: 10, padding: 12, borderRadius: 12, background: "var(--grey-50)", border: "1px solid var(--color-divider-card)" },
  momentNum: { display: "inline-grid", placeItems: "center", width: 22, height: 22, borderRadius: 999, color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0 },
  momentLabel: { margin: 0, fontSize: 13.5, fontWeight: 700, color: "var(--color-text-deep)" },
  momentAt: { fontWeight: 500, color: "var(--color-text-tertiary)" },
  momentNote: { margin: "2px 0 0", fontSize: 13, lineHeight: 1.5, color: "var(--color-text-medium)" },

  pin: { borderRadius: 12, border: "1px solid var(--color-border-card-soft)", borderLeft: "3px solid var(--color-button-primary-bg)", background: "var(--grey-50)", padding: 14 },
  pinHead: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 6 },
  pinTag: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 700, letterSpacing: "0.03em", textTransform: "uppercase", color: "var(--color-button-primary-bg)" },
  pinBy: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--color-text-medium)" },
  pinText: { margin: 0, fontSize: 15, lineHeight: 1.5, fontWeight: 600, color: "var(--color-text-deep)" },
  pinFoot: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 8, flexWrap: "wrap" },
  pinSource: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--color-text-tertiary)" },
  pinAsOf: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--color-text-tertiary)" },

  body: { display: "flex", flexDirection: "column", gap: 16 },
  para: { margin: 0, fontSize: 15.5, lineHeight: 1.6, color: "var(--color-text-medium)" },
  rec: { borderRadius: 12, background: "var(--color-success-bg)", padding: 14 },
  recTag: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 700, letterSpacing: "0.03em", textTransform: "uppercase", color: "var(--color-success-text)" },
  recText: { margin: "4px 0 0", fontSize: 15, lineHeight: 1.55, fontWeight: 600, color: "var(--color-text-deep)" },
  fig: { margin: 0, padding: 16, borderRadius: 12, border: "1px solid var(--color-divider-card)", background: "var(--surface-white)" },
  figCap: { marginTop: 10, fontSize: 12.5, color: "var(--color-text-tertiary)" },
  figSrc: { color: "var(--color-text-tertiary)" },
  askInline: { alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 8, height: 40, paddingInline: 14, borderRadius: 999, border: "1px solid var(--color-border-tab)", background: "var(--surface-white)", fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600, color: "var(--color-text-medium)", cursor: "pointer" },

  comments: { display: "flex", flexDirection: "column", gap: 12 },
  commentsHead: { margin: 0, fontSize: 13, fontWeight: 700, color: "var(--color-text-deep)" },
  comment: { display: "flex", gap: 10 },
  commentBody: { flex: 1, minWidth: 0 },
  commentMeta: { display: "flex", alignItems: "center", gap: 6, fontSize: 12 },
  commentName: { fontWeight: 600, color: "var(--color-text-deep)" },
  commentAnchor: { display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11, color: "var(--color-button-primary-bg)", fontWeight: 600 },
  commentText: { margin: "2px 0 0", fontSize: 14, lineHeight: 1.5, color: "var(--color-text-medium)" },

  chip: { display: "inline-flex", alignItems: "center", gap: 5, height: 26, paddingInline: 9, borderRadius: 7, background: "var(--grey-50)", border: "1px solid var(--color-divider-card)", fontSize: 12, fontWeight: 600, color: "var(--color-text-medium)" },
  chipDot: { width: 7, height: 7, borderRadius: 999, flexShrink: 0 },

  scard: { display: "flex", flexDirection: "column", gap: 10, padding: 18, borderRadius: 16, border: "1px solid var(--color-border-card-soft)", background: "var(--surface-white)", boxShadow: "var(--shadow-1)", cursor: "pointer", textAlign: "start", fontFamily: "var(--font-sans)", height: "100%" },
  scardTop: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 },
  draft: { fontSize: 11, fontWeight: 700, color: "var(--color-warning-text)", background: "var(--color-warning-bg)", padding: "2px 8px", borderRadius: 999 },
  scardTitle: { margin: 0, fontSize: 18, lineHeight: 1.3, letterSpacing: "-0.01em", fontWeight: 700, color: "var(--color-text-deep)" },
  scardTldr: { margin: 0, fontSize: 13.5, lineHeight: 1.5, color: "var(--color-text-medium)", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" },
  scardChips: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 2 },
  scardFoot: { display: "flex", alignItems: "center", gap: 7, marginTop: "auto", paddingTop: 6, fontSize: 12.5 },
  scardAuthor: { fontWeight: 600, color: "var(--color-text-medium)" },

  askWrap: { display: "flex", flexDirection: "column", gap: 6 },
  ask: { display: "flex", alignItems: "center", gap: 10, height: 52, paddingInline: 16, borderRadius: 999, border: "1px solid var(--color-border-tab)", background: "var(--surface-white)", boxShadow: "var(--shadow-1)" },
  askInput: { flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: "var(--font-sans)", fontSize: 15, color: "var(--color-text-deep)" },
  askSend: { width: 36, height: 36, borderRadius: 999, border: "1px solid var(--color-divider-card)", background: "var(--surface-white)", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 },
  askHint: { paddingInline: 16, fontSize: 12.5, color: "var(--color-text-tertiary)" },
};

export { st as storyStyles };
