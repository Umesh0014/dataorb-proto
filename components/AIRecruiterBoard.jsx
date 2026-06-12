"use client";

import React from "react";
import { Plus, SlidersHorizontal, ChevronRight } from "lucide-react";
import PageHeader from "./PageHeader";
import Card from "./Card";
import Banner from "./Banner";
import { FaceScanIcon } from "./SideNav/icons";
import {
  STAGES, COMMUNITY_STAGE, FAMILY_LABELS, stageCounts,
} from "./mocks/recruiter";
import {
  CandidateMonogram, CoverageMeter, AdvanceButton, COMPLIANCE_COPY,
} from "./AIRecruiterParts";

// AIRecruiterBoard (Variant A · direction R1) — the candidate pipeline as
// stage columns (Applied → AI Screening → Interview → Offer → Hired), the most
// literal "pipeline view". The hiring manager reads the funnel left-to-right
// and advances a candidate with an explicit control on the card — including
// the "Push to Interview" move after AI screening — rather than drag-only, so
// the whole board is keyboard-operable (INT-2/G11). A Talent Community strip
// below holds re-activatable candidates (the "community that can be activated
// and hired" loop). Reuses the Card surface + the shared pipeline parts.

export default function AIRecruiterBoard({ candidates, onAdvance, onOpenCandidate }) {
  const [search, setSearch] = React.useState("");

  const q = search.trim().toLowerCase();
  const match = (c) =>
    !q ||
    c.name.toLowerCase().includes(q) ||
    c.role.toLowerCase().includes(q) ||
    FAMILY_LABELS[c.family].toLowerCase().includes(q);

  const visible = candidates.filter(match);
  const counts = stageCounts(candidates);
  const community = visible.filter((c) => c.stage === "community");

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
            <section key={stage.id} style={s.col} aria-label={`${stage.label} — ${counts[stage.id] || 0} candidates`}>
              <div style={s.colHead}>
                <span style={{ ...s.colDot, background: stage.tint.fg }} aria-hidden="true" />
                <span style={s.colTitle}>{stage.label}</span>
                <span style={s.colCount}>{counts[stage.id] || 0}</span>
              </div>
              <div style={s.colBody}>
                {inStage.length === 0 ? (
                  <p style={s.colEmpty}>No candidates</p>
                ) : (
                  inStage.map((c) => (
                    <CandidateCard
                      key={c.id}
                      candidate={c}
                      onAdvance={onAdvance}
                      onOpenCandidate={onOpenCandidate}
                    />
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>

      <CommunityStrip
        candidates={community}
        total={counts.community || 0}
        onAdvance={onAdvance}
        onOpenCandidate={onOpenCandidate}
      />
    </div>
  );
}

function CandidateCard({ candidate, onAdvance, onOpenCandidate }) {
  return (
    <Card padX={14} padY={14} style={s.card}>
      <div style={s.cardTop}>
        <CandidateMonogram candidate={candidate} size={32} />
        <button
          type="button"
          className="recruiter-focusable"
          onClick={() => onOpenCandidate?.(candidate.id)}
          aria-label={`${candidate.name} — open candidate details`}
          style={s.cardNameBtn}
        >
          <span style={s.cardNameText}>
            <span style={s.cardName}>{candidate.name}</span>
            <span style={s.cardRole}>{candidate.role}</span>
          </span>
          <ChevronRight size={16} color="var(--color-text-tertiary)" style={{ flexShrink: 0 }} aria-hidden="true" />
        </button>
      </div>
      <CoverageMeter screen={candidate.screen} compact />
      {STAGE_HAS_ADVANCE[candidate.stage] && (
        <AdvanceButton candidate={candidate} onAdvance={onAdvance} fullWidth />
      )}
    </Card>
  );
}

// Only the live-pipeline stages with a forward move render an action; Hired is
// terminal. Derived once from the stage table so it never drifts.
const STAGE_HAS_ADVANCE = STAGES.reduce((acc, st) => {
  acc[st.id] = Boolean(st.advance);
  return acc;
}, {});

// CommunityStrip — the off-pipeline talent pool. Re-activating a candidate
// drops them back into Applied (the "community that can be activated and hired"
// loop). Horizontal so it reads as a distinct shelf, not a sixth funnel stage.
function CommunityStrip({ candidates, total, onAdvance, onOpenCandidate }) {
  return (
    <Card padX={20} padY={18} tone="outline" style={s.communityCard}>
      <div style={s.communityHead}>
        <span style={{ ...s.colDot, background: COMMUNITY_STAGE.tint.fg }} aria-hidden="true" />
        <span style={s.communityTitle}>{COMMUNITY_STAGE.label}</span>
        <span style={s.colCount}>{total}</span>
        <span style={s.communitySub}>Previously screened — re-activate into the pipeline when a role opens</span>
      </div>
      {candidates.length === 0 ? (
        <p style={s.colEmpty}>No one in the community pool yet</p>
      ) : (
        <div style={s.communityRow}>
          {candidates.map((c) => (
            <div key={c.id} style={s.communityItem}>
              <div style={s.cardTop}>
                <CandidateMonogram candidate={c} size={32} />
                <button
                  type="button"
                  className="recruiter-focusable"
                  onClick={() => onOpenCandidate?.(c.id)}
                  aria-label={`${c.name} — open candidate details`}
                  style={s.cardNameBtn}
                >
                  <span style={s.cardNameText}>
                    <span style={s.cardName}>{c.name}</span>
                    <span style={s.cardRole}>{c.role}</span>
                  </span>
                  <ChevronRight size={16} color="var(--color-text-tertiary)" style={{ flexShrink: 0 }} aria-hidden="true" />
                </button>
              </div>
              <CoverageMeter screen={c.screen} compact />
              <AdvanceButton candidate={c} onAdvance={onAdvance} fullWidth />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

const s = {
  column: { display: "flex", flexDirection: "column", gap: 20, width: "100%", fontFamily: "var(--font-sans)" },

  board: { display: "flex", gap: 12, alignItems: "stretch" },
  col: {
    flex: "1 1 0", minWidth: 0, display: "flex", flexDirection: "column", gap: 12,
    background: "var(--surface-alt)", borderRadius: 12, padding: 12,
  },
  colHead: { display: "flex", alignItems: "center", gap: 8, padding: "2px 4px" },
  colDot: { width: 8, height: 8, borderRadius: 999, flexShrink: 0 },
  colTitle: { fontSize: 12, fontWeight: 700, letterSpacing: "0.2px", color: "var(--color-text-deep)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  colCount: {
    marginLeft: "auto", fontSize: 12, fontWeight: 700, color: "var(--color-text-tertiary)",
    fontVariantNumeric: "tabular-nums", background: "var(--surface-white)", borderRadius: 999,
    minWidth: 22, height: 20, padding: "0 7px", display: "inline-grid", placeItems: "center",
  },
  colBody: { display: "flex", flexDirection: "column", gap: 10, minHeight: 60 },
  colEmpty: { margin: 0, padding: "12px 4px", fontSize: 12, fontWeight: 500, color: "var(--color-text-placeholder)" },

  card: { display: "flex", flexDirection: "column", gap: 12, boxShadow: "var(--shadow-card)" },
  cardTop: { display: "flex", alignItems: "center", gap: 10, minWidth: 0 },
  cardNameBtn: {
    display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: 1,
    background: "transparent", border: "none", padding: 0, cursor: "pointer",
    textAlign: "left", fontFamily: "var(--font-sans)", borderRadius: 6,
  },
  cardNameText: { display: "flex", flexDirection: "column", gap: 2, minWidth: 0, flex: 1 },
  cardName: { fontSize: 13, fontWeight: 700, color: "var(--color-text-deep)", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  cardRole: { fontSize: 11, fontWeight: 500, color: "var(--color-text-tertiary)", lineHeight: 1.35, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },

  communityCard: { display: "flex", flexDirection: "column", gap: 14 },
  communityHead: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  communityTitle: { fontSize: 14, fontWeight: 700, color: "var(--color-text-deep)" },
  communitySub: { flexBasis: "100%", fontSize: 12, fontWeight: 400, color: "var(--color-text-tertiary)", lineHeight: 1.4 },
  communityRow: { display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4 },
  communityItem: {
    flex: "0 0 240px", display: "flex", flexDirection: "column", gap: 12,
    background: "var(--surface-white)", border: "1px solid var(--color-divider-card)",
    borderRadius: 12, padding: 14,
  },
};
