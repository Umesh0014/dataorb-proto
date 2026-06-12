"use client";

import React from "react";
import { GraduationCap, EyeOff, Eye } from "lucide-react";
import { SAMPLE_CUSTOMER } from "./mocks/replays";
import {
  SourceCite, CustomerContextStrip, TranscriptLine,
  CoachCommentary, EndBanner, PlayBar, FOCUSABLE,
} from "./ReplayPlayerParts";

// Variant B — Editorial transcript-spine with margin coaching. Reads the
// replay as one story about one call: a single reading column runs the full
// transcript as a chaptered spine, and coach commentary sits in the right
// margin aligned to its moment — a calm annotation layer, not a competing
// pane. Customer context is a slim sticky frame at the top (frames moment
// one without crowding the rest). Coaching is skippable: hide the whole
// margin to read the raw call, or dismiss one note (it leaves a "show" stub).

function fmt(totalSec) {
  const m = Math.floor(totalSec / 60);
  const sec = String(totalSec % 60).padStart(2, "0");
  return `${m}:${sec}`;
}

export default function ReplayPlayerEditorial({ collection, replay }) {
  const moments = replay.moments || [];
  const [playing, setPlaying] = React.useState(false);
  const [contextOpen, setContextOpen] = React.useState(false);
  const [notesOn, setNotesOn] = React.useState(true);
  const [dismissed, setDismissed] = React.useState(() => new Set());
  const momentRefs = React.useRef([]);

  const toggleDismiss = (id) => setDismissed((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  // Jump to a chapter in the spine. `block: nearest` (no smooth behavior)
  // so it respects reduced-motion; sections carry scroll-margin for the
  // sticky play bar.
  const jumpTo = (i) => momentRefs.current[i]?.scrollIntoView({ block: "nearest" });

  return (
    <div style={s.scroll}>
      <div style={s.frame}>
        <CustomerContextStrip
          customer={SAMPLE_CUSTOMER}
          expanded={contextOpen}
          onToggle={() => setContextOpen((v) => !v)}
        />
        <div style={s.playBarWrap}>
          <PlayBar
            playing={playing}
            progress={0}
            timestamp={fmt(replay.durationSec || 0)}
            onTogglePlay={() => setPlaying((v) => !v)}
          >
            <button
              type="button"
              onClick={() => setNotesOn((v) => !v)}
              aria-pressed={notesOn}
              className={FOCUSABLE}
              style={{ ...s.notesToggle, color: notesOn ? "var(--color-icon-tertiary-fg)" : "var(--color-text-tertiary)", borderColor: notesOn ? "var(--color-border-tab)" : "var(--color-divider-card)" }}
            >
              {notesOn ? <Eye size={14} /> : <EyeOff size={14} />}
              Coach notes {notesOn ? "on" : "off"}
            </button>
          </PlayBar>
          {moments.length > 0 && (
            <nav style={s.chapterBar} aria-label="Jump to chapter">
              {moments.map((m, i) => (
                <button key={m.id} type="button" onClick={() => jumpTo(i)} className={FOCUSABLE} style={s.chapterChip}>
                  <span style={s.chipNo}>{String(i + 1).padStart(2, "0")}</span>
                  {m.label}
                </button>
              ))}
            </nav>
          )}
        </div>

        <article style={s.article}>
          {moments.length === 0 && (
            <div style={s.empty}>
              <span style={s.emptyTitle}>No moments yet</span>
              <p style={s.emptyBody}>The AI hasn't surfaced coached moments for this replay. They appear here once analysis finishes.</p>
            </div>
          )}
          {moments.map((m, i) => {
            const isLast = i === moments.length - 1;
            return (
              <section key={m.id} ref={(el) => { momentRefs.current[i] = el; }} style={s.momentRow}>
                <div style={s.transcriptCol}>
                  <div style={s.chapterHead}>
                    <span style={s.chapterNo}>{String(i + 1).padStart(2, "0")}</span>
                    <span style={s.chapterTitle}>{m.label}</span>
                    <span style={s.chapterStamp}>{m.timestamp}</span>
                  </div>
                  <TranscriptLine speaker="Customer" body={m.customerLine} />
                  <TranscriptLine speaker="Agent" body={m.agentLine} accent />
                  {isLast && <div style={s.endWrap}><EndBanner /></div>}
                </div>

                {notesOn && (
                  <div style={s.marginCol}>
                    {dismissed.has(m.id) ? (
                      <button type="button" onClick={() => toggleDismiss(m.id)} className={FOCUSABLE} style={s.noteStub} aria-label="Show coach note">
                        <GraduationCap size={14} color="var(--color-text-tertiary)" /> Show note
                      </button>
                    ) : (
                      <div style={s.noteWrap}>
                        <button type="button" onClick={() => toggleDismiss(m.id)} className={FOCUSABLE} style={s.dismissBtn} aria-label="Hide this coach note">
                          <EyeOff size={13} />
                        </button>
                        <CoachCommentary scenario={m.coach.scenario} why={m.coach.why} compact />
                      </div>
                    )}
                  </div>
                )}
              </section>
            );
          })}

          <footer style={s.footer}>
            <SourceCite collectionName={collection.name} />
          </footer>
        </article>
      </div>
    </div>
  );
}

const s = {
  scroll: { flex: 1, minHeight: 0, overflowY: "auto", background: "var(--color-card-emoji-bg)" },
  frame: { maxWidth: 940, margin: "0 auto", padding: "24px 24px 48px", display: "flex", flexDirection: "column", gap: 16 },

  playBarWrap: { borderRadius: 12, border: "1px solid var(--color-border-card-soft)", overflow: "hidden", position: "sticky", top: 0, zIndex: 2, boxShadow: "var(--shadow-card)", background: "var(--surface-white)" },
  notesToggle: { display: "inline-flex", alignItems: "center", gap: 6, height: 36, padding: "0 14px", borderRadius: 999, border: "1px solid", background: "var(--surface-white)", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 700, flexShrink: 0, transition: "color 150ms ease, border-color 150ms ease" },
  chapterBar: { display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderTop: "1px solid var(--color-border-card-soft)", overflowX: "auto" },
  chapterChip: { display: "inline-flex", alignItems: "center", gap: 8, minHeight: 36, padding: "0 12px", borderRadius: 999, border: "1px solid var(--color-divider-card)", background: "var(--surface-white)", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: "var(--color-text-medium)", whiteSpace: "nowrap", flexShrink: 0 },
  chipNo: { fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "var(--color-icon-tertiary-fg)" },

  article: { display: "flex", flexDirection: "column", gap: 28 },
  empty: { display: "flex", flexDirection: "column", gap: 8, padding: 32, textAlign: "center", alignItems: "center" },
  emptyTitle: { fontSize: 15, fontWeight: 700, color: "var(--color-text-deep)" },
  emptyBody: { margin: 0, maxWidth: 360, fontSize: 13, lineHeight: 1.5, color: "var(--color-text-tertiary)" },

  momentRow: { display: "flex", gap: 24, alignItems: "flex-start", scrollMarginTop: 140 },
  transcriptCol: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 12 },
  chapterHead: { display: "flex", alignItems: "baseline", gap: 10, paddingBottom: 4, borderBottom: "1px solid var(--color-border-card-soft)" },
  chapterNo: { fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "var(--color-icon-tertiary-fg)" },
  chapterTitle: { flex: 1, fontSize: 16, fontWeight: 700, color: "var(--color-text-deep)" },
  chapterStamp: { fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-text-tertiary)" },
  endWrap: { paddingTop: 4 },

  marginCol: { width: 280, flexShrink: 0 },
  noteWrap: { position: "relative" },
  dismissBtn: { position: "absolute", top: 10, right: 10, width: 36, height: 36, display: "inline-grid", placeItems: "center", borderRadius: 999, border: "1px solid var(--color-border-tab)", background: "var(--surface-white)", cursor: "pointer", color: "var(--color-text-tertiary)", zIndex: 1 },
  noteStub: { display: "inline-flex", alignItems: "center", gap: 8, minHeight: 44, padding: "10px 16px", borderRadius: 10, border: "1px dashed var(--color-divider-card)", background: "transparent", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: "var(--color-text-tertiary)" },

  footer: { paddingTop: 8, borderTop: "1px solid var(--color-border-card-soft)" },
};
