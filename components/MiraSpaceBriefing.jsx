"use client";

import React from "react";
import { Plus, BarChart3 } from "lucide-react";
import {
  BriefingPlayer, KpiCard, ExplorationCard, CollaboratorRow, AskBar, SectionLabel,
} from "./MiraSpaceBits";
import Button from "./Button";
import { SPACE, OWNER, COLLABORATORS, BRIEFING, KPIS, EXPLORATIONS, SUGGESTED } from "./mocks/miraSpace";

// Direction A — Briefing-first front page (newspaper / Amazon-memo model).
// You ARRIVE TO BE BRIEFED: the narrative audio brief is the hero above the
// fold; the KPI cards are the "inside pages" below; collaborators and
// explorations sit in a sidebar. Strongest fit for "insight arrives to them".
//
// Mental model: a morning briefing you read/listen to, then consult the
// numbers. Chat is a quiet "ask a follow-up" — never the front door.

export default function MiraSpaceBriefing({ onAsk }) {
  return (
    <div style={s.page}>
      <SpaceMasthead />

      {/* Hero: the brief */}
      <BriefingPlayer briefing={BRIEFING} variant="hero" onAsk={onAsk} />

      {/* Inside pages: the numbers behind the brief */}
      <section style={s.section}>
        <SectionLabel icon={<BarChart3 size={16} color="var(--color-text-deep)" />}>
          The numbers behind it
        </SectionLabel>
        <div style={s.kpiGrid}>
          {KPIS.map((k) => <KpiCard key={k.id} kpi={k} onAsk={onAsk} />)}
        </div>
      </section>

      {/* Sidebar content, stacked under the fold on this magazine layout */}
      <div style={s.lower}>
        <section style={s.explorations}>
          <SectionLabel
            action={<Button variant="text" leadingIcon={<Plus size={15} />} onClick={() => onAsk?.("")}>New exploration</Button>}
          >
            Explorations
          </SectionLabel>
          <div style={s.exGrid}>
            {EXPLORATIONS.map((e) => <ExplorationCard key={e.id} exploration={e} onOpen={() => onAsk?.(e.title)} />)}
          </div>
        </section>

        <aside style={s.collabCard}>
          <SectionLabel>Collaborators</SectionLabel>
          <div style={s.collabList}>
            {COLLABORATORS.map((p) => <CollaboratorRow key={p.id} person={p} />)}
          </div>
          <p style={s.quotaNote}>Each collaborator holds a share of this space's monthly query quota.</p>
        </aside>
      </div>

      {/* Chat, demoted to one tool — a closing affordance, not pinned chrome */}
      <section style={s.ask}>
        <SectionLabel>Have a question? Ask Mira</SectionLabel>
        <AskBar suggested={SUGGESTED} onAsk={onAsk} placeholder="Ask a follow-up about Sales…" />
      </section>
    </div>
  );
}

function SpaceMasthead() {
  return (
    <header style={s.masthead}>
      <div style={s.mastLeft}>
        <span style={s.eyebrow}>Your space</span>
        <h1 style={s.spaceName}>{SPACE.name}</h1>
        <p style={s.outcome}>{SPACE.outcome}</p>
      </div>
      <div style={s.avatars} aria-label={`${COLLABORATORS.length} collaborators`}>
        {COLLABORATORS.slice(0, 4).map((p, i) => (
          <span key={p.id} style={{ ...s.avatar, background: p.bg, color: p.fg, marginInlineStart: i === 0 ? 0 : -8, zIndex: COLLABORATORS.length - i }} aria-hidden="true">
            {p.initials}
          </span>
        ))}
      </div>
    </header>
  );
}

const s = {
  page: { display: "flex", flexDirection: "column", gap: 28, paddingBottom: 8, fontFamily: "var(--font-sans)" },
  masthead: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 },
  mastLeft: { display: "flex", flexDirection: "column", gap: 4 },
  eyebrow: { fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--color-text-tertiary)" },
  spaceName: { margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--color-text-deep)", lineHeight: 1.1 },
  outcome: { margin: 0, fontSize: 15, fontWeight: 500, color: "var(--color-text-medium)" },
  avatars: { display: "flex", alignItems: "center", flexShrink: 0, paddingTop: 6 },
  avatar: { width: 34, height: 34, borderRadius: 999, display: "inline-grid", placeItems: "center", fontSize: 12, fontWeight: 700, border: "2px solid var(--surface-white)" },

  section: { display: "flex", flexDirection: "column", gap: 14 },
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(208px, 1fr))", gap: 14 },

  lower: { display: "grid", gridTemplateColumns: "minmax(0, 1.7fr) minmax(0, 1fr)", gap: 24, alignItems: "start" },
  explorations: { display: "flex", flexDirection: "column", gap: 14 },
  exGrid: { display: "grid", gridTemplateColumns: "1fr", gap: 12 },
  collabCard: { display: "flex", flexDirection: "column", gap: 14, padding: 20, borderRadius: 16, background: "var(--color-surface-header-tinted)", border: "1px solid var(--color-border-card-soft)" },
  collabList: { display: "flex", flexDirection: "column", gap: 14 },
  quotaNote: { margin: 0, fontSize: 12, lineHeight: 1.5, color: "var(--color-text-tertiary)", paddingTop: 12, borderTop: "1px solid var(--color-divider-card)" },

  ask: { display: "flex", flexDirection: "column", gap: 14, paddingTop: 24, borderTop: "1px solid var(--color-divider-card)" },
};
