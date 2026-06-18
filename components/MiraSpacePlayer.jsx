"use client";

import React from "react";
import { Play, Headphones, ListMusic } from "lucide-react";
import {
  BriefingPlayer, KpiCard, ExplorationCard, AskBar, SectionLabel,
} from "./MiraSpaceBits";
import { SPACE, COLLABORATORS, BRIEFING, KPIS, EXPLORATIONS, SUGGESTED } from "./mocks/miraSpace";

// Direction D — Player-centric (Spotify / NotebookLM model).
// Your outcome HAS A PODCAST: the audio briefing is the hero object, with an
// episode feed of past briefings beside it. KPIs and explorations are the
// "show notes" beneath the player. Audio-forward — best for the exec who
// consumes insight in dead-time (commute, between meetings).
//
// Distinct from A/B: the BRIEF AS A SERIAL is the organizing spine (now
// playing + episode queue), not a magazine or a room of blocks.

export default function MiraSpacePlayer({ onAsk }) {
  const [episode, setEpisode] = React.useState(BRIEFING.id);
  const allEpisodes = [
    { id: BRIEFING.id, title: BRIEFING.title, episodeLabel: BRIEFING.episodeLabel, date: BRIEFING.date, durationLabel: BRIEFING.durationLabel },
    ...BRIEFING.past,
  ];

  return (
    <div style={s.page}>
      <PlayerHeader />

      <div style={s.stage}>
        {/* Now playing — the hero */}
        <div style={s.now}>
          <BriefingPlayer briefing={BRIEFING} variant="hero" onAsk={onAsk} />
        </div>

        {/* Episode feed — the spine */}
        <aside style={s.feed}>
          <SectionLabel icon={<ListMusic size={16} color="var(--color-text-deep)" />}>Briefings</SectionLabel>
          <div style={s.episodes} role="list">
            {allEpisodes.map((ep, i) => {
              const current = ep.id === episode;
              return (
                <button
                  key={ep.id}
                  type="button"
                  role="listitem"
                  onClick={() => setEpisode(ep.id)}
                  style={{ ...s.episode, ...(current ? s.episodeOn : null) }}
                  aria-current={current ? "true" : undefined}
                >
                  <span style={{ ...s.epIcon, ...(current ? s.epIconOn : null) }} aria-hidden="true">
                    {current ? <Headphones size={15} /> : <Play size={14} />}
                  </span>
                  <span style={s.epMeta}>
                    <span style={s.epTitle} dir="auto">{ep.title}</span>
                    <span style={s.epSub}>{ep.episodeLabel} · {ep.date} · {ep.durationLabel}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </aside>
      </div>

      {/* Show notes — KPIs + explorations referenced by the brief */}
      <section style={s.notes}>
        <SectionLabel>In this briefing — the numbers</SectionLabel>
        <div style={s.kpiRow}>
          {KPIS.map((k) => <div key={k.id} style={s.kpiCell}><KpiCard kpi={k} onAsk={onAsk} compact /></div>)}
        </div>
      </section>

      <section style={s.notes}>
        <SectionLabel>Explorations from this space</SectionLabel>
        <div style={s.exGrid}>
          {EXPLORATIONS.map((e) => <ExplorationCard key={e.id} exploration={e} onOpen={() => onAsk?.(e.title)} />)}
        </div>
      </section>

      <section style={s.ask}>
        <SectionLabel>Have a question? Ask a follow-up</SectionLabel>
        <AskBar suggested={SUGGESTED} onAsk={onAsk} placeholder="Ask a follow-up about this briefing…" />
      </section>
    </div>
  );
}

function PlayerHeader() {
  return (
    <header style={s.header}>
      <span style={s.kicker}><Headphones size={14} /> The {SPACE.name} briefing</span>
      <h1 style={s.title}>{SPACE.outcome}</h1>
      <div style={s.subRow}>
        <div style={s.avatars} aria-label={`${COLLABORATORS.length} subscribers`}>
          {COLLABORATORS.slice(0, 4).map((p, i) => (
            <span key={p.id} style={{ ...s.avatar, background: p.bg, color: p.fg, marginInlineStart: i === 0 ? 0 : -8 }} aria-hidden="true">{p.initials}</span>
          ))}
        </div>
        <span style={s.subText}>{COLLABORATORS.length} people follow this briefing</span>
      </div>
    </header>
  );
}

const s = {
  page: { display: "flex", flexDirection: "column", gap: 26, paddingBottom: 8, fontFamily: "var(--font-sans)" },

  header: { display: "flex", flexDirection: "column", gap: 8 },
  kicker: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--color-icon-tertiary-fg)" },
  title: { margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--color-text-deep)", lineHeight: 1.15, maxWidth: 720 },
  subRow: { display: "flex", alignItems: "center", gap: 10 },
  avatars: { display: "flex", alignItems: "center" },
  avatar: { width: 28, height: 28, borderRadius: 999, display: "inline-grid", placeItems: "center", fontSize: 11, fontWeight: 700, border: "2px solid var(--surface-white)" },
  subText: { fontSize: 13, fontWeight: 500, color: "var(--color-text-tertiary)" },

  stage: { display: "grid", gridTemplateColumns: "minmax(0, 1.55fr) minmax(0, 1fr)", gap: 20, alignItems: "start" },
  now: { minWidth: 0 },
  feed: { display: "flex", flexDirection: "column", gap: 12, padding: 16, borderRadius: 16, background: "var(--color-surface-header-tinted)", border: "1px solid var(--color-border-card-soft)" },
  episodes: { display: "flex", flexDirection: "column", gap: 4 },
  episode: { display: "flex", alignItems: "center", gap: 12, padding: 10, borderRadius: 10, border: "none", background: "transparent", cursor: "pointer", textAlign: "start", width: "100%", fontFamily: "var(--font-sans)", transition: "background 150ms ease" },
  episodeOn: { background: "var(--surface-white)", boxShadow: "var(--shadow-1)" },
  epIcon: { width: 34, height: 34, borderRadius: 999, flexShrink: 0, display: "inline-grid", placeItems: "center", background: "var(--color-chip-bg)", color: "var(--color-text-medium)" },
  epIconOn: { background: "var(--color-icon-tertiary-fg)", color: "#FFFFFF" },
  epMeta: { display: "flex", flexDirection: "column", gap: 2, minWidth: 0 },
  epTitle: { fontSize: 13, fontWeight: 700, color: "var(--color-text-deep)", lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" },
  epSub: { fontSize: 11.5, color: "var(--color-text-tertiary)" },

  notes: { display: "flex", flexDirection: "column", gap: 14 },
  kpiRow: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(196px, 1fr))", gap: 12 },
  kpiCell: { minWidth: 0 },
  exGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 },

  ask: { display: "flex", flexDirection: "column", gap: 14, paddingTop: 20, borderTop: "1px solid var(--color-divider-card)" },
};
