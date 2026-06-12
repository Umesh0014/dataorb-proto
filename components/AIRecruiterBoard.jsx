"use client";

import React from "react";
import { Plus, SlidersHorizontal, ChevronRight } from "lucide-react";
import PageHeader from "./PageHeader";
import Banner from "./Banner";
import SelectionAccentBar from "./SelectionAccentBar";
import { FaceScanIcon } from "./SideNav/icons";
import {
  STAGES, COMMUNITY_STAGE, FAMILY_LABELS, stageCounts,
} from "./mocks/recruiter";
import { COMPLIANCE_COPY } from "./AIRecruiterParts";
import {
  CandidateDetailHeader, CandidateDetailBody, CandidateDetailFooter,
} from "./CandidateDetail";

// AIRecruiterBoard (Variant A · direction R1) — the candidate pipeline as
// urgency-first swimlanes, matching the Missions Kanban landing UI: tinted
// lanes (--color-card-emoji-bg) with a count pill, lightweight cards (the
// whole card is the click target), and an in-place detail surface. Per the
// 12 Jun review the card stays lightweight and carries NO upfront CTA — the
// stage-advance ("Push to Interview") is parked in the candidate detail
// curtain that slides in when a card is opened (the shared CandidateDetail).
// A Talent Community shelf below holds re-activatable candidates.

export default function AIRecruiterBoard({ candidates, onAdvance, onOpenCandidate }) {
  const [search, setSearch] = React.useState("");
  const [openId, setOpenId] = React.useState(null);

  const q = search.trim().toLowerCase();
  const match = (c) =>
    !q ||
    c.name.toLowerCase().includes(q) ||
    c.role.toLowerCase().includes(q) ||
    FAMILY_LABELS[c.family].toLowerCase().includes(q);

  const visible = candidates.filter(match);
  const counts = stageCounts(candidates);
  const community = visible.filter((c) => c.stage === "community");
  const openCandidate = openId ? candidates.find((c) => c.id === openId) : null;

  return (
    <div style={s.column}>
      <PageHeader
        identifier={{
          icon: <FaceScanIcon size={18} color="var(--color-icon-tertiary-fg)" />,
          label: "AI Recruiter",
          iconBg: "var(--color-icon-tertiary-bg)",
          iconColor: "var(--color-icon-tertiary-fg)",
        }}
        primaryAction={{ label: "Add candidate", icon: <Plus size={16} />, onClick: () => onOpenCandidate?.("new") }}
        search={{ value: search, onChange: setSearch, placeholder: "Search candidates by name or role" }}
        toolbar={[{ id: "filters", icon: <SlidersHorizontal size={18} />, label: "Filters", onClick: () => {} }]}
      />

      <Banner tone="info" heading={COMPLIANCE_COPY.heading} body={COMPLIANCE_COPY.body} />

      <div style={s.board}>
        {STAGES.map((stage) => {
          const inStage = visible.filter((c) => c.stage === stage.id);
          return (
            <section key={stage.id} style={s.lane} aria-label={`${stage.label} — ${counts[stage.id] || 0} candidates`}>
              <div style={s.laneHeader}>
                <span style={{ ...s.laneDot, background: stage.tint.fg }} aria-hidden="true" />
                <span style={s.laneTitle}>{stage.label}</span>
                <span style={s.countPill}>{counts[stage.id] || 0}</span>
              </div>
              <div style={s.laneScroll}>
                {inStage.length === 0 ? (
                  <p style={s.laneEmpty}>No candidates</p>
                ) : (
                  inStage.map((c) => (
                    <CandidateCard key={c.id} candidate={c} selected={openId === c.id} onOpen={() => setOpenId(c.id)} />
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>

      <CommunityShelf
        candidates={community}
        total={counts.community || 0}
        openId={openId}
        onOpen={setOpenId}
      />

      {openCandidate && (
        <CandidateCurtain
          candidate={openCandidate}
          onClose={() => setOpenId(null)}
          onAdvance={onAdvance}
          onOpenCandidate={onOpenCandidate}
        />
      )}
    </div>
  );
}

// coverageLabel — the one-line, judgement-free coverage cue on a lightweight
// card. Coverage is never framed as a score (G4); a draft reads "Not screened",
// in progress reads "Screening…", never a bare 0%.
function coverageLabel(screen) {
  const { status, coverage } = screen;
  if (status === "completed") {
    const pct = coverage.total > 0 ? Math.round((coverage.covered / coverage.total) * 100) : 0;
    return `${pct}% covered · ${coverage.covered}/${coverage.total} topics`;
  }
  if (status === "in_progress") return "AI screening in progress";
  return "Not screened yet";
}

function CandidateCard({ candidate, selected, onOpen }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      type="button"
      className="recruiter-focusable"
      onClick={onOpen}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label={`${candidate.name} — open candidate details`}
      style={{ ...s.card, boxShadow: hover ? "0 6px 16px rgba(69, 70, 79, 0.16)" : "var(--shadow-card)" }}
    >
      {selected && <SelectionAccentBar />}
      <div style={s.cardTitleRow}>
        <span style={s.cardTitle}>{candidate.name}</span>
        <ChevronRight
          size={16}
          color="var(--color-text-tertiary)"
          style={{ flexShrink: 0, opacity: hover ? 1 : 0.7, transition: "opacity 150ms ease" }}
          aria-hidden="true"
        />
      </div>
      <span style={s.cardRole}>{candidate.role}</span>
      <div style={s.cardDivider} aria-hidden="true" />
      <div style={s.cardMetaRow}>
        <span style={s.familyChip}>{FAMILY_LABELS[candidate.family]}</span>
        <span style={s.coverageText}>{coverageLabel(candidate.screen)}</span>
      </div>
    </button>
  );
}

// CommunityShelf — the off-pipeline talent pool, styled as its own lane below
// the board. Cards open the same detail curtain, where "Activate candidate"
// (drops them back to Applied) is the parked CTA. Horizontal so it reads as a
// distinct shelf, not a sixth funnel stage.
function CommunityShelf({ candidates, total, openId, onOpen }) {
  return (
    <section style={s.shelf} aria-label={`${COMMUNITY_STAGE.label} — ${total} candidates`}>
      <div style={s.laneHeader}>
        <span style={{ ...s.laneDot, background: COMMUNITY_STAGE.tint.fg }} aria-hidden="true" />
        <span style={s.laneTitle}>{COMMUNITY_STAGE.label}</span>
        <span style={s.countPill}>{total}</span>
        <span style={s.shelfSub}>Previously screened — re-activate into the pipeline when a role opens</span>
      </div>
      {candidates.length === 0 ? (
        <p style={s.laneEmpty}>No one in the community pool yet</p>
      ) : (
        <div style={s.shelfRow}>
          {candidates.map((c) => (
            <div key={c.id} style={{ width: 260, flexShrink: 0 }}>
              <CandidateCard candidate={c} selected={openId === c.id} onOpen={() => onOpen(c.id)} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// CandidateCurtain — in-place detail surface mirroring the Missions Kanban
// side curtain: slides in from the right edge (.recruiter-drawer, gated by
// prefers-reduced-motion), no scrim so the board stays live behind it. Esc or
// the close button dismisses; opening another card swaps the content in place.
// Hosts the shared CandidateDetail, including the parked stage-advance CTA.
function CandidateCurtain({ candidate, onClose, onAdvance, onOpenCandidate }) {
  const closeRef = React.useRef(null);
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <aside className="recruiter-drawer" role="complementary" aria-label={`${candidate.name} details`} style={s.curtain}>
      <CandidateDetailHeader candidate={candidate} onClose={onClose} closeRef={closeRef} />
      <CandidateDetailBody candidate={candidate} />
      <CandidateDetailFooter candidate={candidate} onAdvance={onAdvance} onOpenCandidate={onOpenCandidate} />
    </aside>
  );
}

const s = {
  column: { display: "flex", flexDirection: "column", gap: 20, width: "100%", fontFamily: "var(--font-sans)" },

  board: { display: "flex", gap: 16, alignItems: "flex-start" },
  lane: {
    flex: "1 1 0", minWidth: 0, display: "flex", flexDirection: "column", gap: 12,
    background: "var(--color-card-emoji-bg)", borderRadius: 12, padding: 16,
  },
  shelf: {
    display: "flex", flexDirection: "column", gap: 12,
    background: "var(--color-card-emoji-bg)", borderRadius: 12, padding: 16,
  },
  laneHeader: {
    display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
    paddingBottom: 12, boxShadow: "0 1px 0 var(--color-divider-card)", flexWrap: "wrap",
  },
  laneDot: { width: 8, height: 8, borderRadius: 999, flexShrink: 0 },
  laneTitle: { fontSize: 15, fontWeight: 700, color: "var(--color-text-deep)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  countPill: {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    padding: "2px 8px", borderRadius: 10, background: "var(--surface-white)",
    border: "1px solid var(--color-divider-card)", fontSize: 13, fontWeight: 500,
    color: "var(--color-text-medium)", lineHeight: 1.2, minWidth: 24,
  },
  shelfSub: { flexBasis: "100%", fontSize: 12, fontWeight: 400, color: "var(--color-text-tertiary)", lineHeight: 1.4 },
  laneScroll: { display: "flex", flexDirection: "column", gap: 12, minHeight: 40 },
  laneEmpty: { margin: 0, padding: "8px 2px", fontSize: 12, fontWeight: 500, color: "var(--color-text-placeholder)" },
  shelfRow: { display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4 },

  card: {
    position: "relative", overflow: "hidden", appearance: "none", textAlign: "left",
    cursor: "pointer", width: "100%", flexShrink: 0, background: "var(--surface-white)",
    border: "none", borderRadius: 8, padding: 14, display: "flex", flexDirection: "column",
    gap: 10, transition: "box-shadow 120ms ease", fontFamily: "var(--font-sans)",
  },
  cardTitleRow: { display: "flex", alignItems: "center", gap: 8 },
  cardTitle: { flex: 1, minWidth: 0, fontSize: 14, fontWeight: 700, color: "var(--color-text-deep)", lineHeight: 1.3, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" },
  cardRole: { fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)", lineHeight: 1.35, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" },
  cardDivider: { height: 1, width: "100%", background: "var(--color-divider-card)" },
  cardMetaRow: { display: "flex", flexDirection: "column", gap: 6, minWidth: 0 },
  familyChip: {
    alignSelf: "flex-start", display: "inline-flex", alignItems: "center", height: 20,
    padding: "0 8px", borderRadius: 4, background: "var(--pill-bg)", color: "var(--color-text-medium)",
    fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis",
  },
  coverageText: { fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)", fontVariantNumeric: "tabular-nums" },

  // Detail curtain
  curtain: {
    position: "fixed", top: 0, right: 0, bottom: 0, width: 420, maxWidth: "92vw",
    background: "var(--surface-white)", boxShadow: "var(--shadow-drawer)",
    borderLeft: "1px solid var(--color-divider-card)",
    display: "flex", flexDirection: "column", zIndex: 45, fontFamily: "var(--font-sans)",
  },
};
