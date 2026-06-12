"use client";

import React from "react";
import { ChevronLeft, ChevronRight, EyeOff, Eye } from "lucide-react";
import Card from "./Card";
import { SAMPLE_CUSTOMER } from "./mocks/replays";
import {
  SourceCite, CustomerProfileCard, TranscriptLine,
  CoachCommentary, EndBanner, PlayBar, FOCUSABLE,
} from "./ReplayPlayerParts";

// Variant A — Guided two-column (refined baseline). Keeps the locked Guide
// pattern Neil signed off (customer profile + chapters in the left sidecar,
// transcript + coach call-out on the right) and adds the one missing thing
// the ticket asks for: coaching you can skip. Coaching skips two ways —
// globally from the play bar, or per-moment from the call-out — and a
// skipped call-out always leaves a recoverable "Show" stub, never vanishes.

export default function ReplayPlayerGuide({ collection, replay }) {
  const moments = replay.moments || [];
  const [index, setIndex] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);
  const [coachingOn, setCoachingOn] = React.useState(true);
  // Per-moment skips (in-memory only). A moment id in the set = coaching
  // collapsed to its stub for that moment.
  const [skipped, setSkipped] = React.useState(() => new Set());

  const moment = moments[index];
  const isLast = index === moments.length - 1;
  const progress = moments.length ? ((index + 1) / moments.length) * 100 : 0;
  const go = (next) => setIndex(Math.max(0, Math.min(moments.length - 1, next)));
  const toggleSkip = (id) => setSkipped((prev) => {
    const nextSet = new Set(prev);
    if (nextSet.has(id)) nextSet.delete(id); else nextSet.add(id);
    return nextSet;
  });

  return (
    <div style={s.body}>
      <aside style={s.detailCol}>
        <CustomerProfileCard customer={SAMPLE_CUSTOMER} />
        <div style={s.chapters}>
          <span style={s.chaptersLabel}>Chapters</span>
          {moments.map((m, i) => {
            const active = i === index;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => go(i)}
                aria-current={active ? "true" : undefined}
                className={FOCUSABLE}
                style={{ ...s.chapterRow, background: active ? "var(--color-surface-header-tinted)" : "transparent" }}
              >
                <span style={{ ...s.chapterIndex, color: active ? "var(--color-icon-tertiary-fg)" : "var(--color-text-tertiary)", borderColor: active ? "var(--color-icon-tertiary-fg)" : "var(--color-divider-card)" }}>{i + 1}</span>
                <span style={{ ...s.chapterLabel, color: active ? "var(--color-text-deep)" : "var(--color-text-medium)", fontWeight: active ? 700 : 500 }}>{m.label}</span>
                <span style={s.chapterTime}>{m.timestamp}</span>
              </button>
            );
          })}
        </div>
      </aside>

      <section style={s.playCol}>
        {!moment ? (
          <div style={s.playEmpty}>
            <span style={s.emptyTitle}>No moments yet</span>
            <p style={s.emptyBody}>The AI hasn't surfaced coached moments for this replay. They appear here once analysis finishes.</p>
          </div>
        ) : (
          <>
            <PlayBar
              playing={playing}
              progress={progress}
              timestamp={moment.timestamp}
              onTogglePlay={() => setPlaying((v) => !v)}
            >
              <button
                type="button"
                onClick={() => setCoachingOn((v) => !v)}
                aria-pressed={coachingOn}
                className={FOCUSABLE}
                style={{ ...s.coachToggle, color: coachingOn ? "var(--color-icon-tertiary-fg)" : "var(--color-text-tertiary)", borderColor: coachingOn ? "var(--color-border-tab)" : "var(--color-divider-card)" }}
              >
                {coachingOn ? <Eye size={14} /> : <EyeOff size={14} />}
                Coaching {coachingOn ? "on" : "off"}
              </button>
            </PlayBar>

            <div style={s.stage}>
              <span style={s.momentLabel}>{moment.label}</span>
              <TranscriptLine speaker="Customer" body={moment.customerLine} />
              <TranscriptLine speaker="Agent" body={moment.agentLine} accent />

              {coachingOn && (
                skipped.has(moment.id) ? (
                  <button type="button" onClick={() => toggleSkip(moment.id)} className={FOCUSABLE} style={s.coachStub}>
                    <Eye size={14} color="var(--color-text-tertiary)" />
                    Coaching skipped for this moment · Show
                  </button>
                ) : (
                  <div style={s.coachWrap}>
                    <button type="button" onClick={() => toggleSkip(moment.id)} className={FOCUSABLE} style={s.skipBtn} aria-label="Skip coaching for this moment">
                      <EyeOff size={13} /> Skip
                    </button>
                    <CoachCommentary scenario={moment.coach.scenario} why={moment.coach.why} />
                  </div>
                )
              )}

              {isLast && <EndBanner />}
              <SourceCite collectionName={collection.name} />
            </div>

            <nav style={s.chapterNav}>
              <button type="button" onClick={() => go(index - 1)} disabled={index === 0} className={FOCUSABLE} style={{ ...s.navBtn, opacity: index === 0 ? 0.4 : 1 }}>
                <ChevronLeft size={16} /> Previous
              </button>
              <span style={s.navCount}>{index + 1} / {moments.length}</span>
              <button type="button" onClick={() => go(index + 1)} disabled={isLast} className={FOCUSABLE} style={{ ...s.navBtn, opacity: isLast ? 0.4 : 1 }}>
                Next <ChevronRight size={16} />
              </button>
            </nav>
          </>
        )}
      </section>
    </div>
  );
}

const s = {
  body: { flex: 1, display: "flex", alignItems: "stretch", minHeight: 0 },

  detailCol: { width: 320, flexShrink: 0, borderRight: "2px solid var(--color-border-card-soft)", padding: 20, display: "flex", flexDirection: "column", gap: 20, overflowY: "auto" },
  chapters: { display: "flex", flexDirection: "column", gap: 2 },
  chaptersLabel: { fontSize: 11, fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", color: "var(--color-text-tertiary)", padding: "0 4px 6px" },
  chapterRow: { display: "flex", alignItems: "center", gap: 10, padding: "10px 8px", border: "none", borderRadius: 8, cursor: "pointer", textAlign: "left", fontFamily: "var(--font-sans)", transition: "background 150ms ease" },
  chapterIndex: { width: 20, height: 20, borderRadius: 999, border: "1px solid", display: "inline-grid", placeItems: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 },
  chapterLabel: { flex: 1, fontSize: 13, lineHeight: 1.35, minWidth: 0 },
  chapterTime: { fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-text-tertiary)", flexShrink: 0 },

  playCol: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", background: "var(--color-card-emoji-bg)" },
  playEmpty: { margin: "auto", display: "flex", flexDirection: "column", gap: 8, padding: 32, textAlign: "center", alignItems: "center" },
  emptyTitle: { fontSize: 15, fontWeight: 700, color: "var(--color-text-deep)" },
  emptyBody: { margin: 0, maxWidth: 360, fontSize: 13, lineHeight: 1.5, color: "var(--color-text-tertiary)" },

  coachToggle: { display: "inline-flex", alignItems: "center", gap: 6, height: 36, padding: "0 14px", borderRadius: 999, border: "1px solid", background: "var(--surface-white)", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 700, flexShrink: 0, transition: "color 150ms ease, border-color 150ms ease" },

  stage: { flex: 1, minHeight: 0, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 },
  momentLabel: { fontSize: 12, fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase", color: "var(--color-text-tertiary)" },

  coachWrap: { position: "relative", display: "flex", flexDirection: "column" },
  skipBtn: { position: "absolute", top: 10, right: 10, display: "inline-flex", alignItems: "center", gap: 5, minHeight: 36, padding: "0 12px", borderRadius: 999, border: "1px solid var(--color-border-tab)", background: "var(--surface-white)", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 700, color: "var(--color-text-tertiary)", zIndex: 1 },
  coachStub: { display: "inline-flex", alignItems: "center", gap: 8, alignSelf: "flex-start", minHeight: 44, padding: "10px 16px", borderRadius: 10, border: "1px dashed var(--color-divider-card)", background: "transparent", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: "var(--color-text-tertiary)" },

  chapterNav: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "10px 24px", borderTop: "1px solid var(--color-border-card-soft)", background: "var(--surface-white)" },
  navBtn: { display: "inline-flex", alignItems: "center", gap: 6, minHeight: 44, padding: "0 12px", border: "none", background: "transparent", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: "var(--color-text-medium)" },
  navCount: { fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-text-tertiary)" },
};
