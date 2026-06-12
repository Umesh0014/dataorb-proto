"use client";

import React from "react";
import { ChevronLeft, ChevronRight, GraduationCap, ArrowRight } from "lucide-react";
import Button from "./Button";
import { SAMPLE_CUSTOMER } from "./mocks/replays";
import {
  SourceCite, CustomerProfileCard, CustomerContextStrip, TranscriptLine,
  CoachCommentary, EndBanner, PlayBar, FOCUSABLE,
} from "./ReplayPlayerParts";

// Variant C — Focus mode (chapter deck). Built for the primary persona: a
// new hire (~90% of replay usage) hearing one moment at a time, low
// cognitive load. Step 0 is a customer-context cover that frames the whole
// replay; from there the context collapses to a slim strip and each moment
// is a single full-stage card. Coaching is a first-class skippable step —
// "Reveal coaching" expands the call-out, "Skip" advances without it — so
// the agent can listen first and coach second, or skip coaching entirely.

export default function ReplayPlayerFocus({ collection, replay }) {
  const moments = replay.moments || [];
  // step 0 = customer-context cover; step i (1..n) = moments[i-1].
  const [step, setStep] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);
  const [contextOpen, setContextOpen] = React.useState(false);
  const [revealed, setRevealed] = React.useState(() => new Set());

  const total = moments.length;
  const onCover = step === 0;
  const moment = onCover ? null : moments[step - 1];
  const isLast = step === total;
  const go = (next) => setStep(Math.max(0, Math.min(total, next)));
  const reveal = (id) => setRevealed((prev) => new Set(prev).add(id));

  return (
    <div style={s.body}>
      {!onCover && (
        <div style={s.stripWrap}>
          <CustomerContextStrip
            customer={SAMPLE_CUSTOMER}
            expanded={contextOpen}
            onToggle={() => setContextOpen((v) => !v)}
          />
        </div>
      )}

      <div style={s.stage}>
        {onCover ? (
          <div style={s.cover}>
            <span style={s.coverKicker}>Before you listen — who you're hearing</span>
            <CustomerProfileCard customer={SAMPLE_CUSTOMER} style={s.coverProfile} />
            <Button variant="primary" onClick={() => go(1)} trailingIcon={<ArrowRight size={16} />} style={s.coverCta}>
              Start replay
            </Button>
            <SourceCite collectionName={collection.name} />
          </div>
        ) : !moment ? (
          <div style={s.empty}>
            <span style={s.emptyTitle}>No moments yet</span>
            <p style={s.emptyBody}>The AI hasn't surfaced coached moments for this replay. They appear here once analysis finishes.</p>
          </div>
        ) : (
          <div style={s.card}>
            <div style={s.cardHead}>
              <span style={s.cardNo}>Moment {step} of {total}</span>
              <span style={s.cardLabel}>{moment.label}</span>
            </div>
            <PlayBar
              playing={playing}
              progress={(step / total) * 100}
              timestamp={moment.timestamp}
              onTogglePlay={() => setPlaying((v) => !v)}
            />
            <div style={s.cardBody}>
              <TranscriptLine speaker="Customer" body={moment.customerLine} />
              <TranscriptLine speaker="Agent" body={moment.agentLine} accent />

              {revealed.has(moment.id) ? (
                <CoachCommentary scenario={moment.coach.scenario} why={moment.coach.why} />
              ) : (
                <button type="button" onClick={() => reveal(moment.id)} className={FOCUSABLE} style={s.revealBtn}>
                  <span style={s.revealIcon} aria-hidden="true"><GraduationCap size={15} color="var(--color-icon-tertiary-fg)" /></span>
                  Reveal coaching
                  <span style={s.revealHint}>or skip to the next moment</span>
                </button>
              )}

              {isLast && revealed.has(moment.id) && <EndBanner />}
            </div>
          </div>
        )}
      </div>

      <nav style={s.nav}>
        <button type="button" onClick={() => go(step - 1)} disabled={onCover} className={FOCUSABLE} style={{ ...s.navBtn, opacity: onCover ? 0.4 : 1 }}>
          <ChevronLeft size={16} /> Back
        </button>
        <div style={s.dots}>
          {Array.from({ length: total + 1 }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => go(i)}
              aria-current={i === step ? "true" : undefined}
              aria-label={i === 0 ? "Customer context" : `Go to moment ${i}`}
              className={FOCUSABLE}
              style={s.dotHit}
            >
              <span style={{ ...s.dot, background: i === step ? "var(--color-icon-tertiary-fg)" : "var(--color-divider-card)", width: i === step ? 22 : 7 }} />
            </button>
          ))}
        </div>
        <button type="button" onClick={() => go(step + 1)} disabled={isLast} className={FOCUSABLE} style={{ ...s.navBtn, opacity: isLast ? 0.4 : 1 }}>
          {onCover ? "Start" : "Skip"} <ChevronRight size={16} />
        </button>
      </nav>
    </div>
  );
}

const s = {
  body: { flex: 1, display: "flex", flexDirection: "column", minHeight: 0, background: "var(--color-card-emoji-bg)" },
  stripWrap: { padding: "16px 24px 0" },

  stage: { flex: 1, minHeight: 0, overflowY: "auto", padding: 24, display: "flex", justifyContent: "center" },
  empty: { margin: "auto", display: "flex", flexDirection: "column", gap: 8, padding: 32, textAlign: "center", alignItems: "center" },
  emptyTitle: { fontSize: 15, fontWeight: 700, color: "var(--color-text-deep)" },
  emptyBody: { margin: 0, maxWidth: 360, fontSize: 13, lineHeight: 1.5, color: "var(--color-text-tertiary)" },

  cover: { width: "100%", maxWidth: 460, margin: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 18, textAlign: "center" },
  coverKicker: { fontSize: 12, fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase", color: "var(--color-text-tertiary)" },
  coverProfile: { width: "100%", textAlign: "left" },
  coverCta: { marginTop: 4 },

  card: { width: "100%", maxWidth: 680, display: "flex", flexDirection: "column", borderRadius: 16, border: "1px solid var(--color-border-card-soft)", background: "var(--surface-white)", overflow: "hidden", boxShadow: "var(--shadow-card)", alignSelf: "flex-start" },
  cardHead: { display: "flex", flexDirection: "column", gap: 4, padding: "18px 24px 14px" },
  cardNo: { fontSize: 12, fontWeight: 700, letterSpacing: "0.3px", color: "var(--color-icon-tertiary-fg)" },
  cardLabel: { fontSize: 18, fontWeight: 700, color: "var(--color-text-deep)" },
  cardBody: { padding: 24, display: "flex", flexDirection: "column", gap: 16 },

  revealBtn: { display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "16px 18px", borderRadius: 12, border: "1px dashed var(--color-border-tab)", background: "var(--color-surface-header-tinted)", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 700, color: "var(--color-icon-tertiary-fg)" },
  revealIcon: { width: 26, height: 26, borderRadius: 999, background: "var(--color-icon-tertiary-bg)", display: "inline-grid", placeItems: "center", flexShrink: 0 },
  revealHint: { marginLeft: "auto", fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)" },

  nav: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "8px 24px", borderTop: "1px solid var(--color-border-card-soft)", background: "var(--surface-white)" },
  navBtn: { display: "inline-flex", alignItems: "center", gap: 6, minHeight: 44, padding: "0 12px", border: "none", background: "transparent", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: "var(--color-text-medium)" },
  dots: { display: "inline-flex", alignItems: "center", gap: 2 },
  dotHit: { display: "inline-grid", placeItems: "center", width: 28, height: 44, border: "none", background: "transparent", cursor: "pointer", padding: 0 },
  dot: { height: 7, borderRadius: 999, transition: "width 150ms ease, background 150ms ease" },
};
