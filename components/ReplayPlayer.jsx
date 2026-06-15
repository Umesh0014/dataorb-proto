"use client";

import React from "react";
import {
  ArrowLeft, Play, Pause, ChevronLeft, ChevronRight, GraduationCap, Flag,
  Sparkles,
} from "lucide-react";
import Card from "./Card";
import { SAMPLE_CUSTOMER } from "./mocks/replays";
import {
  lhR, lhDir, lhReplayContent, lhReplayTitle, lhEditedBy, lhMoment, lhCustomerField,
} from "./learningHubLocale";

// ReplayPlayer — coached playback of one replay. Follows the Guide
// pattern: header, details on the left, the replay on the right. The
// customer profile stays visible in a sidecar (it frames the first moment
// without crowding the rest), chapters carry next/previous nav, and each
// moment shows exactly one coach commentary, separated out as its own
// call-out. The last moment closes with an end-mark banner.

export default function ReplayPlayer({ collection, replay, onBack, locale = "en" }) {
  const moments = replay.moments || [];
  const [index, setIndex] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);
  const moment = moments[index];
  const isLast = index === moments.length - 1;
  const progress = moments.length ? ((index + 1) / moments.length) * 100 : 0;
  const isRtl = lhDir(locale) === "rtl";
  const collectionName = lhReplayContent(locale, collection.id)?.name ?? collection.name;

  const go = (next) => {
    const clamped = Math.max(0, Math.min(moments.length - 1, next));
    setIndex(clamped);
  };

  return (
    <div style={s.column}>
      <Card padX={0} padY={0} style={s.shell}>
        <Header replay={replay} collectionName={collectionName} onBack={onBack} locale={locale} isRtl={isRtl} />
        <div style={s.body}>
          <DetailColumn
            replay={replay}
            moments={moments}
            activeIndex={index}
            onPick={(i) => go(i)}
            locale={locale}
          />
          <PlaybackColumn
            moment={moment}
            index={index}
            total={moments.length}
            isLast={isLast}
            playing={playing}
            progress={progress}
            onTogglePlay={() => setPlaying((p) => !p)}
            onPrev={() => go(index - 1)}
            onNext={() => go(index + 1)}
            locale={locale}
            isRtl={isRtl}
          />
        </div>
      </Card>
    </div>
  );
}

// ---- Header ------------------------------------------------------------

function Header({ replay, collectionName, onBack, locale = "en", isRtl }) {
  return (
    <header style={s.header}>
      <div style={s.headerLeft}>
        <button type="button" onClick={onBack} aria-label={lhR(locale, "pl_backToCollection")} style={s.backBtn}>
          <ArrowLeft size={18} color="var(--color-text-tertiary)" style={isRtl ? { transform: "scaleX(-1)" } : undefined} />
        </button>
        <div style={s.titleBlock}>
          <span style={s.title} dir="auto">{lhReplayTitle(locale, replay.id, replay.title)}</span>
          <span style={s.subtitle} dir="auto">{collectionName}</span>
        </div>
      </div>
      <Credit replay={replay} locale={locale} />
    </header>
  );
}

function Credit({ replay, locale = "en" }) {
  if (replay.edited && replay.editor) {
    return (
      <span style={s.credit}>
        <span style={{ ...s.creditAvatar, background: replay.editor.bg, color: replay.editor.fg }} aria-hidden="true">{replay.editor.initial}</span>
        {lhEditedBy(locale, replay.editor.name)}
      </span>
    );
  }
  return (
    <span style={{ ...s.credit, color: "var(--color-icon-tertiary-fg)" }}>
      <Sparkles size={14} /> {lhR(locale, "rec_aiGenerated")}
    </span>
  );
}

// ---- Left: details + customer profile + chapters -----------------------

function DetailColumn({ replay, moments, activeIndex, onPick, locale = "en" }) {
  const c = SAMPLE_CUSTOMER;
  return (
    <aside style={s.detailCol}>
      <div style={s.profileCard}>
        <div style={s.profileTop}>
          <span style={s.profileAvatar} aria-hidden="true">{c.initial}</span>
          <div style={s.profileName}>
            <span style={s.profileNameText} dir="auto">{c.name}</span>
            <span style={s.profileTenure}>{lhCustomerField(locale, "tenure", c.tenure)}</span>
          </div>
        </div>
        <div style={s.profileRows}>
          <ProfileRow label={lhR(locale, "pl_plan")} value={lhCustomerField(locale, "plan", c.plan)} />
          <ProfileRow label={lhR(locale, "pl_arpu")} value={lhCustomerField(locale, "arpu", c.arpu)} />
          <ProfileRow label={lhR(locale, "pl_sentiment")} value={lhCustomerField(locale, "sentiment", c.sentiment)} />
        </div>
        <p style={s.profileContext} dir="auto">{lhCustomerField(locale, "context", c.context)}</p>
      </div>

      <div style={s.chapters}>
        <span style={s.chaptersLabel}>{lhR(locale, "pl_chapters")}</span>
        {moments.map((m, i) => {
          const active = i === activeIndex;
          const label = lhMoment(locale, m.id)?.label ?? m.label;
          return (
            <button key={m.id} type="button" onClick={() => onPick(i)} style={{ ...s.chapterRow, background: active ? "var(--color-surface-header-tinted)" : "transparent" }}>
              <span style={{ ...s.chapterIndex, color: active ? "var(--color-icon-tertiary-fg)" : "var(--color-text-tertiary)", borderColor: active ? "var(--color-icon-tertiary-fg)" : "var(--color-divider-card)" }}>{i + 1}</span>
              <span style={{ ...s.chapterLabel, color: active ? "var(--color-text-deep)" : "var(--color-text-medium)", fontWeight: active ? 700 : 500 }} dir="auto">{label}</span>
              <span style={s.chapterTime}>{m.timestamp}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

function ProfileRow({ label, value }) {
  return (
    <div style={s.profileRow}>
      <span style={s.profileRowLabel}>{label}</span>
      <span style={s.profileRowValue} dir="auto">{value}</span>
    </div>
  );
}

// ---- Right: playback ---------------------------------------------------

function PlaybackColumn({ moment, index, total, isLast, playing, progress, onTogglePlay, onPrev, onNext, locale = "en", isRtl }) {
  if (!moment) {
    return <section style={s.playCol}><div style={s.playEmpty}>{lhR(locale, "pl_noMoments")}</div></section>;
  }
  const m = lhMoment(locale, moment.id);
  const flip = isRtl ? { transform: "scaleX(-1)" } : undefined;
  return (
    <section style={s.playCol}>
      <PlayBar playing={playing} progress={progress} index={index} total={total} onTogglePlay={onTogglePlay} timestamp={moment.timestamp} locale={locale} />

      <div style={s.stage}>
        <span style={s.momentLabel} dir="auto">{m?.label ?? moment.label}</span>

        <Line speaker={lhR(locale, "pl_customer")} body={m?.customerLine ?? moment.customerLine} />
        <Line speaker={lhR(locale, "pl_agent")} body={m?.agentLine ?? moment.agentLine} accent />

        <CoachCommentary scenario={m?.scenario ?? moment.coach.scenario} why={m?.why ?? moment.coach.why} locale={locale} />

        {isLast && <EndBanner locale={locale} />}
      </div>

      <nav style={s.chapterNav}>
        <button type="button" onClick={onPrev} disabled={index === 0} style={{ ...s.navBtn, opacity: index === 0 ? 0.4 : 1 }}>
          <ChevronLeft size={16} style={flip} /> {lhR(locale, "pl_previous")}
        </button>
        <span style={s.navCount}>{index + 1} / {total}</span>
        <button type="button" onClick={onNext} disabled={isLast} style={{ ...s.navBtn, opacity: isLast ? 0.4 : 1 }}>
          {lhR(locale, "pl_next")} <ChevronRight size={16} style={flip} />
        </button>
      </nav>
    </section>
  );
}

function PlayBar({ playing, progress, index, total, onTogglePlay, timestamp, locale = "en" }) {
  return (
    <div style={s.playBar}>
      <button type="button" onClick={onTogglePlay} aria-label={playing ? lhR(locale, "pl_pause") : lhR(locale, "pl_play")} style={s.playBtn}>
        {playing ? <Pause size={18} color="#FFFFFF" /> : <Play size={18} color="#FFFFFF" style={{ marginInlineStart: 2 }} />}
      </button>
      <div style={s.trackWrap}>
        <div style={s.track}><div style={{ ...s.trackFill, width: `${progress}%` }} /></div>
      </div>
      <span style={s.playTime}>{timestamp}</span>
    </div>
  );
}

function Line({ speaker, body, accent }) {
  return (
    <div style={s.line}>
      <div style={s.lineHead}>
        <span style={{ ...s.lineDot, background: accent ? "var(--color-icon-tertiary-fg)" : "var(--grey-500)" }} aria-hidden="true" />
        <span style={{ ...s.lineSpeaker, color: accent ? "var(--color-text-deep)" : "var(--color-text-tertiary)" }}>{speaker}</span>
      </div>
      <p style={{ ...s.lineBody, borderColor: accent ? "var(--color-icon-tertiary-fg)" : "var(--color-divider-card)" }} dir="auto">{body}</p>
    </div>
  );
}

// One coach commentary per moment, separated as its own call-out:
// scenario sets the situation, the commentary explains why it works.
function CoachCommentary({ scenario, why, locale = "en" }) {
  return (
    <div style={s.coach}>
      <div style={s.coachHead}>
        <span style={s.coachIcon} aria-hidden="true"><GraduationCap size={15} color="var(--color-icon-tertiary-fg)" /></span>
        <span style={s.coachTitle}>{lhR(locale, "pl_coach")}</span>
      </div>
      <span style={s.coachScenario} dir="auto">{scenario}</span>
      <p style={s.coachWhy} dir="auto">{why}</p>
    </div>
  );
}

function EndBanner({ locale = "en" }) {
  return (
    <div style={s.endBanner}>
      <Flag size={16} color="var(--color-success)" />
      <span>{lhR(locale, "pl_endOfReplay")}</span>
    </div>
  );
}

const s = {
  column: { display: "flex", flexDirection: "column", width: "100%", fontFamily: "var(--font-sans)" },
  shell: { display: "flex", flexDirection: "column", minHeight: 640, overflow: "hidden", border: "1px solid var(--color-border-card-soft)" },

  header: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "16px 24px", borderBottom: "2px solid var(--color-border-card-soft)" },
  headerLeft: { display: "inline-flex", alignItems: "center", gap: 12, minWidth: 0 },
  backBtn: { width: 32, height: 32, borderRadius: 8, border: "none", background: "var(--color-card-emoji-bg)", display: "inline-grid", placeItems: "center", cursor: "pointer", padding: 0, flexShrink: 0 },
  titleBlock: { display: "flex", flexDirection: "column", gap: 2, minWidth: 0 },
  title: { fontSize: 18, fontWeight: 700, color: "var(--color-text-deep)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  subtitle: { fontSize: 13, fontWeight: 400, color: "var(--color-text-tertiary)" },
  credit: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "var(--color-text-tertiary)", flexShrink: 0 },
  creditAvatar: { width: 20, height: 20, borderRadius: 999, display: "inline-grid", placeItems: "center", fontSize: 10, fontWeight: 700 },

  body: { flex: 1, display: "flex", alignItems: "stretch", minHeight: 0 },

  // Left detail column
  detailCol: { width: 320, flexShrink: 0, borderInlineEnd: "2px solid var(--color-border-card-soft)", padding: 20, display: "flex", flexDirection: "column", gap: 20, overflowY: "auto" },
  profileCard: { display: "flex", flexDirection: "column", gap: 14, padding: 16, borderRadius: 12, background: "var(--color-surface-header-tinted)", border: "1px solid var(--color-border-card-soft)" },
  profileTop: { display: "flex", alignItems: "center", gap: 12 },
  profileAvatar: { width: 40, height: 40, borderRadius: 999, background: "#EDE9FE", color: "#6650A5", display: "inline-grid", placeItems: "center", fontSize: 16, fontWeight: 700, flexShrink: 0 },
  profileName: { display: "flex", flexDirection: "column", gap: 2, minWidth: 0 },
  profileNameText: { fontSize: 15, fontWeight: 700, color: "var(--color-text-deep)" },
  profileTenure: { fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)" },
  profileRows: { display: "flex", flexDirection: "column", gap: 8 },
  profileRow: { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 },
  profileRowLabel: { fontSize: 12, fontWeight: 600, color: "var(--color-text-tertiary)" },
  profileRowValue: { fontSize: 12, fontWeight: 600, color: "var(--color-text-deep)", textAlign: "end" },
  profileContext: { margin: 0, fontSize: 12, lineHeight: 1.5, color: "var(--color-text-medium)", paddingTop: 12, borderTop: "1px solid var(--color-border-card-soft)" },

  chapters: { display: "flex", flexDirection: "column", gap: 2 },
  chaptersLabel: { fontSize: 11, fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", color: "var(--color-text-tertiary)", padding: "0 4px 6px" },
  chapterRow: { display: "flex", alignItems: "center", gap: 10, padding: "10px 8px", border: "none", borderRadius: 8, cursor: "pointer", textAlign: "start", fontFamily: "var(--font-sans)", transition: "background 120ms ease" },
  chapterIndex: { width: 20, height: 20, borderRadius: 999, border: "1px solid", display: "inline-grid", placeItems: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 },
  chapterLabel: { flex: 1, fontSize: 13, lineHeight: 1.35, minWidth: 0 },
  chapterTime: { fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-text-tertiary)", flexShrink: 0 },

  // Right playback column
  playCol: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", background: "#F9FAFB" },
  playEmpty: { padding: 32, color: "var(--color-text-tertiary)", fontSize: 14 },

  playBar: { display: "flex", alignItems: "center", gap: 16, padding: "16px 24px", borderBottom: "1px solid var(--color-border-card-soft)", background: "#FFFFFF" },
  playBtn: { width: 44, height: 44, borderRadius: 999, border: "none", background: "var(--color-icon-tertiary-fg)", display: "inline-grid", placeItems: "center", cursor: "pointer", flexShrink: 0 },
  trackWrap: { flex: 1, minWidth: 0 },
  track: { height: 6, borderRadius: 999, background: "var(--color-divider-card)", overflow: "hidden" },
  trackFill: { height: "100%", borderRadius: 999, background: "var(--color-icon-tertiary-fg)", transition: "width 200ms ease" },
  playTime: { fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-text-tertiary)", flexShrink: 0 },

  stage: { flex: 1, minHeight: 0, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 },
  momentLabel: { fontSize: 12, fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase", color: "var(--color-text-tertiary)" },
  line: { display: "flex", flexDirection: "column", gap: 4 },
  lineHead: { display: "inline-flex", alignItems: "center", gap: 8 },
  lineDot: { width: 6, height: 6, borderRadius: 999, flexShrink: 0 },
  lineSpeaker: { fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600 },
  lineBody: { margin: 0, paddingInlineStart: 16, borderInlineStart: "2px solid", fontSize: 14, lineHeight: 1.55, color: "var(--color-text-deep)" },

  coach: { display: "flex", flexDirection: "column", gap: 8, padding: 16, borderRadius: 12, background: "var(--color-surface-header-tinted)", border: "1px solid var(--color-border-tab)" },
  coachHead: { display: "inline-flex", alignItems: "center", gap: 8 },
  coachIcon: { width: 26, height: 26, borderRadius: 999, background: "var(--color-icon-tertiary-bg)", display: "inline-grid", placeItems: "center", flexShrink: 0 },
  coachTitle: { fontSize: 13, fontWeight: 700, color: "var(--color-icon-tertiary-fg)", letterSpacing: "0.2px" },
  coachScenario: { fontSize: 13, fontWeight: 700, color: "var(--color-text-deep)" },
  coachWhy: { margin: 0, fontSize: 13, lineHeight: 1.6, color: "var(--color-text-medium)" },

  endBanner: { display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 10, background: "var(--color-success-bg)", color: "var(--color-success-text)", fontSize: 13, fontWeight: 600 },

  chapterNav: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 24px", borderTop: "1px solid var(--color-border-card-soft)", background: "#FFFFFF" },
  navBtn: { display: "inline-flex", alignItems: "center", gap: 6, border: "none", background: "transparent", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: "var(--color-text-medium)" },
  navCount: { fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-text-tertiary)" },
};
