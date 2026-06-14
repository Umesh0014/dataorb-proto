"use client";

import React from "react";

// MobileGuideSession — the in-frame voice Guide session, shared by all
// three variants (the ticket's V1 priority: Guide is voice-native). It
// carries the two audit fixes the brief names: a calm time-remaining
// warning with a grace/extend before the hard 0:00 end, and a
// post-session summary scorecard.
//
// Two views: "live" (orb + transcript + transport) and "summary"
// (scorecard). The orb pulse reuses the app's orbPulse keyframes and is
// disabled under prefers-reduced-motion (G13). The countdown warning is
// announced via role="status" (WCAG-10), the orb is decorative, and the
// score is a labelled number with its unit (G3). Quantitative output is
// read-only; this is a starting state, not a verdict on the agent (G4).

function fmt(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function MobileGuideSession({ session, onClose }) {
  const [view, setView] = React.useState("live");
  const [remaining, setRemaining] = React.useState(session.totalSec);
  const [paused, setPaused] = React.useState(false);
  const [extended, setExtended] = React.useState(false);
  const [reduceMotion, setReduceMotion] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  React.useEffect(() => {
    if (view !== "live" || paused) return undefined;
    if (remaining <= 0) { setView("summary"); return undefined; }
    const id = window.setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => window.clearTimeout(id);
  }, [view, paused, remaining]);

  const inGrace = view === "live" && remaining <= session.graceSec && remaining > 0;
  const extend = () => { setRemaining((r) => r + 60); setExtended(true); };

  return (
    <div style={styles.shell}>
      <header style={styles.header}>
        <button
          type="button"
          className="cc-focusable"
          aria-label="End session and go back"
          onClick={onClose}
          style={styles.iconBtn}
        >
          <span className="material-symbols-outlined" aria-hidden="true" style={styles.iconGlyph}>close</span>
        </button>
        <div style={styles.headerText}>
          <span style={styles.headerKicker}>Guide · voice practice</span>
          <span style={styles.headerTitle} dir="auto">{session.title}</span>
        </div>
      </header>

      {view === "live" ? (
        <LiveView
          session={session}
          remaining={remaining}
          paused={paused}
          inGrace={inGrace}
          extended={extended}
          reduceMotion={reduceMotion}
          onTogglePause={() => setPaused((p) => !p)}
          onExtend={extend}
          onEnd={() => setView("summary")}
        />
      ) : (
        <SummaryView session={session} onClose={onClose} />
      )}
    </div>
  );
}

function LiveView({ session, remaining, paused, inGrace, extended, reduceMotion, onTogglePause, onExtend, onEnd }) {
  return (
    <>
      <div style={styles.orbStage}>
        <div style={styles.orbWrap} aria-hidden="true">
          <span style={{ ...styles.orbRing, ...styles.orbOuter, animation: reduceMotion || paused ? "none" : "orbPulseOuter 3.2s ease-in-out infinite" }} />
          <span style={{ ...styles.orbRing, ...styles.orbMid, animation: reduceMotion || paused ? "none" : "orbPulseMid 2.4s ease-in-out infinite" }} />
          <span style={styles.orbCore}>
            <span className="material-symbols-outlined" style={styles.orbGlyph}>{paused ? "pause" : "graphic_eq"}</span>
          </span>
        </div>
        <span style={styles.scenario} dir="auto">{session.scenario}</span>
        <span style={styles.clock}>{fmt(remaining)}<span style={styles.clockTotal}> / {fmt(session.totalSec)}</span></span>
      </div>

      {inGrace && (
        <div style={styles.grace} role="status">
          <span style={styles.graceText}>
            <strong>{fmt(remaining)}</strong> left in this session.
          </span>
          <button type="button" className="cc-focusable" onClick={onExtend} style={styles.graceBtn}>
            Extend +1 min
          </button>
        </div>
      )}
      {extended && !inGrace && (
        <div style={styles.extendedNote} role="status">Added a minute — finish your save.</div>
      )}

      <div style={styles.transcript}>
        {session.transcript.map((line, i) => (
          <div
            key={i}
            style={{ ...styles.bubble, ...(line.role === "you" ? styles.bubbleYou : styles.bubbleCoach) }}
            dir="auto"
          >
            <span style={styles.bubbleWho}>{line.role === "you" ? "You" : "Coach"}</span>
            <span style={styles.bubbleText}>{line.text}</span>
          </div>
        ))}
      </div>

      <div style={styles.transport}>
        <button
          type="button"
          className="cc-focusable"
          aria-pressed={paused}
          onClick={onTogglePause}
          style={styles.secondaryBtn}
        >
          <span className="material-symbols-outlined" aria-hidden="true" style={styles.transportGlyph}>{paused ? "play_arrow" : "pause"}</span>
          {paused ? "Resume" : "Pause"}
        </button>
        <button
          type="button"
          className="cc-focusable"
          onClick={onEnd}
          style={styles.endBtn}
        >
          End &amp; review
        </button>
      </div>
    </>
  );
}

function SummaryView({ session, onClose }) {
  const sum = session.summary;
  return (
    <div style={styles.summary}>
      <div style={styles.summaryHead}>
        <span style={styles.summaryKicker}>Session summary</span>
        <span style={styles.summaryDuration}>{sum.durationLabel}</span>
      </div>

      <div style={styles.scoreRow}>
        <span style={styles.scoreNum}>{sum.score}</span>
        <span style={styles.scoreOf}>/ {sum.scoreMax}</span>
        <span style={styles.scoreLabel}>Practice score</span>
      </div>

      <SummaryList title="What worked" glyph="check_circle" tint="var(--color-success)" items={sum.strengths} />
      <SummaryList title="Focus next time" glyph="trending_up" tint="var(--color-icon-tertiary-fg)" items={sum.focus} />

      <div style={styles.summaryActions}>
        <button type="button" className="cc-focusable" onClick={onClose} style={styles.summaryPrimary}>
          Done
        </button>
      </div>
      <p style={styles.disclaimer}>
        A practice aid to help you prepare — not an assessment of you.
      </p>
    </div>
  );
}

function SummaryList({ title, glyph, tint, items }) {
  return (
    <section style={styles.listSection}>
      <span style={styles.listTitle}>{title}</span>
      <ul style={styles.list}>
        {items.map((it, i) => (
          <li key={i} style={styles.listItem}>
            <span className="material-symbols-outlined" aria-hidden="true" style={{ ...styles.listGlyph, color: tint }}>{glyph}</span>
            <span style={styles.listText} dir="auto">{it}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

const styles = {
  shell: { position: "absolute", inset: 0, background: "var(--surface-white)", display: "flex", flexDirection: "column", zIndex: 5 },
  header: { display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "1px solid var(--color-divider-card)", flexShrink: 0 },
  iconBtn: { appearance: "none", border: "none", background: "var(--color-chip-bg)", width: 40, height: 40, borderRadius: 999, display: "inline-grid", placeItems: "center", cursor: "pointer", flexShrink: 0 },
  iconGlyph: { fontSize: 20, color: "var(--color-text-medium)" },
  headerText: { display: "flex", flexDirection: "column", gap: 2, minWidth: 0 },
  headerKicker: { fontSize: 11, fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase", color: "var(--color-icon-tertiary-fg)" },
  headerTitle: { fontSize: 15, fontWeight: 700, color: "var(--color-text-deep)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },

  orbStage: { display: "flex", flexDirection: "column", alignItems: "center", gap: 12, paddingTop: 28, paddingBottom: 16, flexShrink: 0 },
  orbWrap: { position: "relative", width: 132, height: 132, display: "grid", placeItems: "center" },
  orbRing: { position: "absolute", borderRadius: 999, display: "block" },
  orbOuter: { width: 132, height: 132, background: "radial-gradient(circle, rgba(102,80,165,0.28), rgba(102,80,165,0) 70%)", filter: "blur(2px)" },
  orbMid: { width: 96, height: 96, background: "radial-gradient(circle, rgba(0,75,239,0.30), rgba(0,75,239,0) 72%)" },
  orbCore: { position: "relative", width: 72, height: 72, borderRadius: 999, background: "var(--color-button-primary-bg)", display: "grid", placeItems: "center", boxShadow: "var(--shadow-8)" },
  orbGlyph: { fontSize: 34, color: "#FFFFFF" },
  scenario: { fontSize: 13, color: "var(--color-text-tertiary)", textAlign: "center", maxWidth: 280, lineHeight: 1.5 },
  clock: { fontSize: 22, fontWeight: 800, color: "var(--color-text-deep)", fontVariantNumeric: "tabular-nums" },
  clockTotal: { fontSize: 14, fontWeight: 600, color: "var(--color-text-tertiary)" },

  grace: { margin: "0 16px 8px", padding: "10px 14px", borderRadius: 12, background: "var(--color-warning-bg)", border: "1px solid var(--color-warning)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexShrink: 0 },
  graceText: { fontSize: 13, color: "var(--color-warning-text)" },
  graceBtn: { appearance: "none", border: "none", background: "var(--color-warning)", color: "#FFFFFF", fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 700, padding: "8px 12px", borderRadius: 999, cursor: "pointer", flexShrink: 0, minHeight: 36 },
  extendedNote: { margin: "0 16px 8px", fontSize: 12, color: "var(--color-success-text)", flexShrink: 0 },

  transcript: { flex: 1, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, padding: "8px 16px" },
  bubble: { maxWidth: "82%", padding: "10px 14px", borderRadius: 16, display: "flex", flexDirection: "column", gap: 3 },
  bubbleCoach: { alignSelf: "flex-start", background: "var(--color-card-emoji-bg)", borderBottomLeftRadius: 4 },
  bubbleYou: { alignSelf: "flex-end", background: "var(--color-primary-alpha-08)", borderBottomRightRadius: 4 },
  bubbleWho: { fontSize: 10, fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase", color: "var(--color-text-tertiary)" },
  bubbleText: { fontSize: 13, lineHeight: 1.5, color: "var(--color-text-medium)" },

  transport: { display: "flex", gap: 10, padding: "12px 16px 16px", borderTop: "1px solid var(--color-divider-card)", flexShrink: 0 },
  secondaryBtn: { flex: 1, minHeight: 48, appearance: "none", border: "1px solid var(--color-divider-card)", background: "var(--surface-white)", borderRadius: 999, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 700, color: "var(--color-text-medium)" },
  transportGlyph: { fontSize: 20 },
  endBtn: { flex: 1, minHeight: 48, appearance: "none", border: "none", background: "var(--color-button-primary-bg)", color: "#FFFFFF", borderRadius: 999, cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 700 },

  summary: { flex: 1, minHeight: 0, overflowY: "auto", padding: "20px 20px 24px", display: "flex", flexDirection: "column", gap: 18 },
  summaryHead: { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 },
  summaryKicker: { fontSize: 12, fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase", color: "var(--color-text-tertiary)" },
  summaryDuration: { fontSize: 12, fontWeight: 600, color: "var(--color-text-tertiary)", fontVariantNumeric: "tabular-nums" },
  scoreRow: { display: "flex", alignItems: "baseline", gap: 6 },
  scoreNum: { fontSize: 44, fontWeight: 800, color: "var(--color-text-deep)", lineHeight: 1, fontVariantNumeric: "tabular-nums" },
  scoreOf: { fontSize: 18, fontWeight: 700, color: "var(--color-text-tertiary)" },
  scoreLabel: { marginInlineStart: "auto", fontSize: 12, fontWeight: 600, color: "var(--color-text-tertiary)" },

  listSection: { display: "flex", flexDirection: "column", gap: 8 },
  listTitle: { fontSize: 13, fontWeight: 700, color: "var(--color-text-deep)" },
  list: { listStyle: "none", display: "flex", flexDirection: "column", gap: 8, padding: 0, margin: 0 },
  listItem: { display: "flex", gap: 10, alignItems: "flex-start" },
  listGlyph: { fontSize: 18, marginTop: 1, flexShrink: 0 },
  listText: { fontSize: 13, lineHeight: 1.5, color: "var(--color-text-medium)" },

  summaryActions: { marginTop: "auto", paddingTop: 8 },
  summaryPrimary: { width: "100%", minHeight: 48, appearance: "none", border: "none", background: "var(--color-button-primary-bg)", color: "#FFFFFF", borderRadius: 999, cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 700 },
  disclaimer: { margin: 0, fontSize: 11, color: "var(--color-text-tertiary)", textAlign: "center", lineHeight: 1.5 },
};
