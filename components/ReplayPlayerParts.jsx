"use client";

import React from "react";
import {
  ArrowLeft, Play, Pause, GraduationCap, Flag, Sparkles, FileAudio,
} from "lucide-react";

// ReplayPlayerParts — shared atoms for the three ReplayPlayer layout
// variants (Guide · Editorial · Focus). The reusable pieces that read
// identically across all three — header + AI/editor credit, the customer
// profile (full card + slim strip), a transcript line, the single coach
// commentary call-out, the end-mark banner, and the audio play bar — live
// here; each variant file owns its own composition and chrome. Mirrors the
// CreditsUsagePage / CreditsUsageParts split.
//
// Focus rings follow the app convention (a global :focus-visible class, as
// on .skill-card) via the shared `replay-focusable` className below — inline
// styles can't reach :focus-visible.

export const FOCUSABLE = "replay-focusable";

// ---- Header + credit ---------------------------------------------------

export function PlayerHeader({ replay, collectionName, onBack, children }) {
  return (
    <header style={p.header}>
      <div style={p.headerLeft}>
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to collection"
          className={FOCUSABLE}
          style={p.backBtn}
        >
          <ArrowLeft size={18} color="var(--color-text-tertiary)" />
        </button>
        <div style={p.titleBlock}>
          <span style={p.title}>{replay.title}</span>
          <span style={p.subtitle}>{collectionName}</span>
        </div>
      </div>
      <div style={p.headerRight}>
        {children}
        <Credit replay={replay} />
      </div>
    </header>
  );
}

// AI disclaimer until a human edits; then the editor's avatar + credit
// replaces it (Jun 11 transparency rule).
export function Credit({ replay }) {
  if (replay.edited && replay.editor) {
    return (
      <span style={p.credit}>
        <span
          style={{ ...p.creditAvatar, background: replay.editor.bg, color: replay.editor.fg }}
          aria-hidden="true"
        >
          {replay.editor.initial}
        </span>
        Edited by {replay.editor.name}
      </span>
    );
  }
  return (
    <span style={{ ...p.credit, color: "var(--color-icon-tertiary-fg)" }}>
      <Sparkles size={14} /> AI-generated · unedited
    </span>
  );
}

// Source citation — file → collection → source interaction (Jun 12: cite
// the source somewhere, not on the customer profile itself). Consolidated
// into one line rather than sprinkled through the transcript.
export function SourceCite({ collectionName }) {
  return (
    <span style={p.sourceCite}>
      <FileAudio size={13} color="var(--color-text-tertiary)" />
      Generated from 1 interaction · {collectionName}
    </span>
  );
}

// ---- Customer profile --------------------------------------------------

// Full profile card — used where the context gets room to breathe (the
// Guide sidecar, the Focus cover).
export function CustomerProfileCard({ customer, style }) {
  return (
    <div style={{ ...p.profileCard, ...style }}>
      <div style={p.profileTop}>
        <span style={p.profileAvatar} aria-hidden="true">{customer.initial}</span>
        <div style={p.profileName}>
          <span style={p.profileNameText}>{customer.name}</span>
          <span style={p.profileTenure}>{customer.tenure}</span>
        </div>
      </div>
      <div style={p.profileRows}>
        <ProfileRow label="Plan" value={customer.plan} />
        <ProfileRow label="ARPU" value={customer.arpu} />
        <ProfileRow label="Sentiment" value={customer.sentiment} />
      </div>
      <p style={p.profileContext}>{customer.context}</p>
    </div>
  );
}

function ProfileRow({ label, value }) {
  return (
    <div style={p.profileRow}>
      <span style={p.profileRowLabel}>{label}</span>
      <span style={p.profileRowValue}>{value}</span>
    </div>
  );
}

// Slim, single-line context strip — used where the profile must frame
// moment one without crowding the rest (Editorial top frame, Focus
// collapsed strip). Expands to the full card on toggle.
export function CustomerContextStrip({ customer, expanded, onToggle }) {
  return (
    <div style={p.strip}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className={FOCUSABLE}
        style={p.stripHead}
      >
        <span style={p.profileAvatarSm} aria-hidden="true">{customer.initial}</span>
        <span style={p.stripName}>{customer.name}</span>
        <span style={p.stripDot} aria-hidden="true">·</span>
        <span style={p.stripMeta}>{customer.plan}</span>
        <span style={p.stripDot} aria-hidden="true">·</span>
        <span style={p.stripMeta}>{customer.sentiment}</span>
        <span style={p.stripToggle}>{expanded ? "Hide" : "Customer context"}</span>
      </button>
      {expanded && (
        <div style={p.stripBody}>
          <div style={p.profileRows}>
            <ProfileRow label="ARPU" value={customer.arpu} />
            <ProfileRow label="Tenure" value={customer.tenure} />
          </div>
          <p style={{ ...p.profileContext, borderTop: "none", paddingTop: 0 }}>{customer.context}</p>
        </div>
      )}
    </div>
  );
}

// ---- Transcript + coaching ---------------------------------------------

export function TranscriptLine({ speaker, body, accent }) {
  return (
    <div style={p.line}>
      <div style={p.lineHead}>
        <span
          style={{ ...p.lineDot, background: accent ? "var(--color-icon-tertiary-fg)" : "var(--grey-500)" }}
          aria-hidden="true"
        />
        <span style={{ ...p.lineSpeaker, color: accent ? "var(--color-text-deep)" : "var(--color-text-tertiary)" }}>
          {speaker}
        </span>
      </div>
      <p style={{ ...p.lineBody, borderColor: accent ? "var(--color-icon-tertiary-fg)" : "var(--color-divider-card)" }}>
        {body}
      </p>
    </div>
  );
}

// One coach commentary per moment, separated as its own call-out: scenario
// sets the situation, the commentary explains why it works. `compact` trims
// the chrome for the editorial margin.
export function CoachCommentary({ scenario, why, compact }) {
  return (
    <div style={{ ...p.coach, ...(compact ? p.coachCompact : null) }}>
      <div style={p.coachHead}>
        <span style={p.coachIcon} aria-hidden="true">
          <GraduationCap size={15} color="var(--color-icon-tertiary-fg)" />
        </span>
        <span style={p.coachTitle}>Coach commentary</span>
      </div>
      <span style={p.coachScenario}>{scenario}</span>
      <p style={p.coachWhy}>{why}</p>
    </div>
  );
}

export function EndBanner() {
  return (
    <div style={p.endBanner} role="status">
      <Flag size={16} color="var(--color-success)" />
      <span>End of replay — you've reached the last coached moment.</span>
    </div>
  );
}

// ---- Audio play bar ----------------------------------------------------

export function PlayBar({ playing, progress, timestamp, onTogglePlay, children }) {
  return (
    <div style={p.playBar}>
      <button
        type="button"
        onClick={onTogglePlay}
        aria-label={playing ? "Pause" : "Play"}
        className={FOCUSABLE}
        style={p.playBtn}
      >
        {playing
          ? <Pause size={18} color="var(--surface-white)" />
          : <Play size={18} color="var(--surface-white)" style={{ marginLeft: 2 }} />}
      </button>
      <div style={p.trackWrap}>
        <div style={p.track}><div style={{ ...p.trackFill, width: `${progress}%` }} /></div>
      </div>
      <span style={p.playTime}>{timestamp}</span>
      {children}
    </div>
  );
}

// Re-export the icons that variant files reuse so they import from one place.
export { Play, Pause } from "lucide-react";

const p = {
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "16px 24px", borderBottom: "2px solid var(--color-border-card-soft)" },
  headerLeft: { display: "inline-flex", alignItems: "center", gap: 12, minWidth: 0 },
  headerRight: { display: "inline-flex", alignItems: "center", gap: 16, flexShrink: 0 },
  backBtn: { width: 32, height: 32, borderRadius: 8, border: "none", background: "var(--color-card-emoji-bg)", display: "inline-grid", placeItems: "center", cursor: "pointer", padding: 0, flexShrink: 0 },
  titleBlock: { display: "flex", flexDirection: "column", gap: 2, minWidth: 0 },
  title: { fontSize: 18, fontWeight: 700, color: "var(--color-text-deep)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  subtitle: { fontSize: 13, fontWeight: 400, color: "var(--color-text-tertiary)" },
  credit: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "var(--color-text-tertiary)", flexShrink: 0 },
  creditAvatar: { width: 20, height: 20, borderRadius: 999, display: "inline-grid", placeItems: "center", fontSize: 10, fontWeight: 700 },
  sourceCite: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)" },

  profileCard: { display: "flex", flexDirection: "column", gap: 14, padding: 16, borderRadius: 12, background: "var(--color-surface-header-tinted)", border: "1px solid var(--color-border-card-soft)" },
  profileTop: { display: "flex", alignItems: "center", gap: 12 },
  profileAvatar: { width: 40, height: 40, borderRadius: 999, background: "var(--color-icon-tertiary-bg)", color: "var(--color-icon-tertiary-fg)", display: "inline-grid", placeItems: "center", fontSize: 16, fontWeight: 700, flexShrink: 0 },
  profileAvatarSm: { width: 26, height: 26, borderRadius: 999, background: "var(--color-icon-tertiary-bg)", color: "var(--color-icon-tertiary-fg)", display: "inline-grid", placeItems: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 },
  profileName: { display: "flex", flexDirection: "column", gap: 2, minWidth: 0 },
  profileNameText: { fontSize: 15, fontWeight: 700, color: "var(--color-text-deep)" },
  profileTenure: { fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)" },
  profileRows: { display: "flex", flexDirection: "column", gap: 8 },
  profileRow: { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 },
  profileRowLabel: { fontSize: 12, fontWeight: 600, color: "var(--color-text-tertiary)" },
  profileRowValue: { fontSize: 12, fontWeight: 600, color: "var(--color-text-deep)", textAlign: "right" },
  profileContext: { margin: 0, fontSize: 12, lineHeight: 1.5, color: "var(--color-text-medium)", paddingTop: 12, borderTop: "1px solid var(--color-border-card-soft)" },

  strip: { display: "flex", flexDirection: "column", borderRadius: 12, background: "var(--color-surface-header-tinted)", border: "1px solid var(--color-border-card-soft)", overflow: "hidden" },
  stripHead: { display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "12px 16px", border: "none", background: "transparent", cursor: "pointer", textAlign: "left", fontFamily: "var(--font-sans)" },
  stripName: { fontSize: 13, fontWeight: 700, color: "var(--color-text-deep)", flexShrink: 0 },
  stripDot: { color: "var(--color-text-placeholder)", flexShrink: 0 },
  stripMeta: { fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  stripToggle: { marginLeft: "auto", fontSize: 12, fontWeight: 700, color: "var(--color-icon-tertiary-fg)", flexShrink: 0 },
  stripBody: { padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 10 },

  line: { display: "flex", flexDirection: "column", gap: 4 },
  lineHead: { display: "inline-flex", alignItems: "center", gap: 8 },
  lineDot: { width: 6, height: 6, borderRadius: 999, flexShrink: 0 },
  lineSpeaker: { fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600 },
  lineBody: { margin: 0, paddingLeft: 16, borderLeft: "2px solid", fontSize: 14, lineHeight: 1.55, color: "var(--color-text-deep)" },

  coach: { display: "flex", flexDirection: "column", gap: 8, padding: 16, borderRadius: 12, background: "var(--color-surface-header-tinted)", border: "1px solid var(--color-border-tab)" },
  coachCompact: { padding: 14, borderRadius: 10, gap: 6 },
  coachHead: { display: "inline-flex", alignItems: "center", gap: 8 },
  coachIcon: { width: 26, height: 26, borderRadius: 999, background: "var(--color-icon-tertiary-bg)", display: "inline-grid", placeItems: "center", flexShrink: 0 },
  coachTitle: { fontSize: 13, fontWeight: 700, color: "var(--color-icon-tertiary-fg)", letterSpacing: "0.2px" },
  coachScenario: { fontSize: 13, fontWeight: 700, color: "var(--color-text-deep)" },
  coachWhy: { margin: 0, fontSize: 13, lineHeight: 1.6, color: "var(--color-text-medium)" },

  endBanner: { display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 10, background: "var(--color-success-bg)", color: "var(--color-success-text)", fontSize: 13, fontWeight: 600 },

  playBar: { display: "flex", alignItems: "center", gap: 16, padding: "16px 24px", borderBottom: "1px solid var(--color-border-card-soft)", background: "var(--surface-white)" },
  playBtn: { width: 44, height: 44, borderRadius: 999, border: "none", background: "var(--color-icon-tertiary-fg)", display: "inline-grid", placeItems: "center", cursor: "pointer", flexShrink: 0 },
  trackWrap: { flex: 1, minWidth: 0 },
  track: { height: 6, borderRadius: 999, background: "var(--color-divider-card)", overflow: "hidden" },
  trackFill: { height: "100%", borderRadius: 999, background: "var(--color-icon-tertiary-fg)", transition: "width 200ms ease" },
  playTime: { fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-text-tertiary)", flexShrink: 0 },
};
