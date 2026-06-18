"use client";

import React from "react";
import { MessageSquare, Plus, Pin } from "lucide-react";
import {
  BriefingPlayer, KpiCard, ExplorationCard, CollaboratorRow, AskBar, SectionLabel,
} from "./MiraSpaceBits";
import Button from "./Button";
import { SPACE, COLLABORATORS, BRIEFING, KPIS, EXPLORATIONS, SUGGESTED } from "./mocks/miraSpace";

// Direction B — The Room (Notion / Coda "document as application" model).
// The space is a FURNISHED ROOM YOU INHABIT WITH YOUR TEAM: heterogeneous
// blocks (briefing, KPI grid, collaborators-with-quota, pinned explorations)
// that members comment on and pin to. Collaboration is the spine — every
// block carries presence + a comment affordance; chat opens scoped from a
// block, never as the front door.
//
// Distinct from A (vertical magazine) by being a two-column board of titled,
// commentable blocks where people — not the brief — frame the surface.

export default function MiraSpaceRoom({ onAsk }) {
  return (
    <div style={s.page}>
      <RoomHeader />

      <div style={s.board}>
        {/* Left column — wide content blocks */}
        <div style={s.col}>
          <Block title="This week's briefing" comments={3} pinnedBy="Priya">
            <BriefingPlayer briefing={BRIEFING} variant="block" onAsk={onAsk} />
          </Block>

          <Block title="KPIs we're watching" comments={1} action={<BlockAction label="Add KPI" onClick={() => onAsk?.("")} />}>
            <div style={s.kpiGrid}>
              {KPIS.slice(0, 6).map((k) => <KpiCard key={k.id} kpi={k} onAsk={onAsk} compact />)}
            </div>
          </Block>
        </div>

        {/* Right column — narrow people/exploration blocks */}
        <div style={s.col}>
          <Block title="In this room" comments={0}>
            <div style={s.collabList}>
              {COLLABORATORS.map((p) => <CollaboratorRow key={p.id} person={p} compact />)}
            </div>
            <p style={s.note}>Members hold a share of this space's query quota.</p>
          </Block>

          <Block title="Explorations" comments={2} action={<BlockAction label="New" onClick={() => onAsk?.("")} icon={<Plus size={14} />} />}>
            <div style={s.exList}>
              {EXPLORATIONS.map((e) => <ExplorationCard key={e.id} exploration={e} onOpen={() => onAsk?.(e.title)} />)}
            </div>
          </Block>
        </div>
      </div>

      <section style={s.ask}>
        <SectionLabel>Have a question? Ask the room</SectionLabel>
        <AskBar suggested={SUGGESTED} onAsk={onAsk} placeholder="Ask the room about Sales…" />
      </section>
    </div>
  );
}

function RoomHeader() {
  return (
    <header style={s.header}>
      <div style={s.headerLeft}>
        <span style={s.crumb}>Spaces / {SPACE.name}</span>
        <h1 style={s.title}># {SPACE.name} room</h1>
        <p style={s.outcome}>{SPACE.outcome}</p>
      </div>
      <div style={s.headerRight}>
        <div style={s.avatars} aria-label={`${COLLABORATORS.length} members`}>
          {COLLABORATORS.map((p, i) => (
            <span key={p.id} style={{ ...s.avatar, background: p.bg, color: p.fg, marginInlineStart: i === 0 ? 0 : -8 }} aria-hidden="true">{p.initials}</span>
          ))}
        </div>
        <Button variant="text" uppercase={false} leadingIcon={<Plus size={15} />} onClick={() => {}}>Invite</Button>
      </div>
    </header>
  );
}

// A room block — titled container with presence + comment affordance, the
// unit of collaboration in this model.
function Block({ title, comments = 0, pinnedBy, action, children }) {
  return (
    <section style={s.block}>
      <div style={s.blockHead}>
        <div style={s.blockTitleWrap}>
          {pinnedBy && <Pin size={13} color="var(--color-icon-tertiary-fg)" aria-hidden="true" />}
          <span style={s.blockTitle}>{title}</span>
          {pinnedBy && <span style={s.pinnedBy}>pinned by {pinnedBy}</span>}
        </div>
        <div style={s.blockTools}>
          {action}
          <button type="button" style={s.commentBtn} aria-label={`${comments} comments`}>
            <MessageSquare size={14} />
            {comments > 0 && <span>{comments}</span>}
          </button>
        </div>
      </div>
      <div style={s.blockBody}>{children}</div>
    </section>
  );
}

function BlockAction({ label, onClick, icon }) {
  return (
    <button type="button" onClick={onClick} style={s.blockAction}>
      {icon}{label}
    </button>
  );
}

const s = {
  page: { display: "flex", flexDirection: "column", gap: 20, paddingBottom: 8, fontFamily: "var(--font-sans)" },

  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, paddingBottom: 16, borderBottom: "1px solid var(--color-divider-card)" },
  headerLeft: { display: "flex", flexDirection: "column", gap: 4 },
  crumb: { fontSize: 12, fontWeight: 600, color: "var(--color-text-tertiary)" },
  title: { margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--color-text-deep)", lineHeight: 1.1 },
  outcome: { margin: 0, fontSize: 14, fontWeight: 500, color: "var(--color-text-medium)" },
  headerRight: { display: "flex", alignItems: "center", gap: 12, flexShrink: 0, paddingTop: 4 },
  avatars: { display: "flex", alignItems: "center" },
  avatar: { width: 32, height: 32, borderRadius: 999, display: "inline-grid", placeItems: "center", fontSize: 12, fontWeight: 700, border: "2px solid var(--surface-white)" },

  board: { display: "grid", gridTemplateColumns: "minmax(0, 1.8fr) minmax(0, 1fr)", gap: 20, alignItems: "start" },
  col: { display: "flex", flexDirection: "column", gap: 20, minWidth: 0 },

  block: { display: "flex", flexDirection: "column", borderRadius: 16, border: "1px solid var(--color-border-card-soft)", background: "var(--surface-white)", overflow: "hidden" },
  blockHead: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 16px", borderBottom: "1px solid var(--color-divider-card)", background: "var(--color-surface-header-tinted)" },
  blockTitleWrap: { display: "inline-flex", alignItems: "center", gap: 8, minWidth: 0 },
  blockTitle: { fontSize: 13, fontWeight: 700, color: "var(--color-text-deep)" },
  pinnedBy: { fontSize: 11, fontWeight: 600, color: "var(--color-text-tertiary)" },
  blockTools: { display: "inline-flex", alignItems: "center", gap: 8, flexShrink: 0 },
  blockAction: { display: "inline-flex", alignItems: "center", gap: 5, height: 28, paddingInline: 10, borderRadius: 8, border: "1px solid var(--color-divider-card)", background: "var(--surface-white)", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 700, color: "var(--color-text-medium)" },
  commentBtn: { display: "inline-flex", alignItems: "center", gap: 5, height: 28, paddingInline: 10, borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 700, color: "var(--color-text-tertiary)" },
  blockBody: { padding: 16 },

  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 },
  collabList: { display: "flex", flexDirection: "column", gap: 14 },
  note: { margin: "14px 0 0", fontSize: 12, lineHeight: 1.5, color: "var(--color-text-tertiary)", paddingTop: 12, borderTop: "1px solid var(--color-divider-card)" },
  exList: { display: "flex", flexDirection: "column", gap: 12 },

  ask: { display: "flex", flexDirection: "column", gap: 14, paddingTop: 20, borderTop: "1px solid var(--color-divider-card)" },
};
