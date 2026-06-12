"use client";

import React from "react";
import { Plus, SlidersHorizontal, ChevronRight } from "lucide-react";
import PageHeader from "./PageHeader";
import Card from "./Card";
import { FaceScanIcon } from "./SideNav/icons";
import {
  STAGES, COMMUNITY_STAGE, FAMILY_LABELS, funnelStats, funnelRows,
} from "./mocks/recruiter";
import {
  CandidateMonogram, CoverageMeter, AdvanceButton, COMPLIANCE_COPY,
} from "./AIRecruiterParts";

// AIRecruiterFunnel (Variant C · direction R3) — the candidate pipeline as a
// conversion funnel on the left, with the business case on the right rail
// (avg time-to-hire, screening hours saved, cost per hire — each labelled with
// its unit and its basis, never an unexplained number — G3). Clicking a funnel
// stage filters the candidate list beneath it; the rail also surfaces the
// Talent Community re-activation loop. This is the lens that answers "what is
// AI screening buying us" — low time-to-hire, fewer manhours, less budget —
// without ever implying the AI judged anyone (G4).

export default function AIRecruiterFunnel({ candidates, onAdvance, onOpenCandidate }) {
  // Default the focus to AI Screening — the stage where the hiring manager's
  // "Push to Interview" decision happens, so the headline action lands first.
  const [stage, setStage] = React.useState("ai_screening");

  const rows = funnelRows(candidates);
  const stats = funnelStats(candidates);
  const maxCount = Math.max(1, ...rows.map((r) => r.count));
  const livePipeline = rows.reduce((n, r) => n + r.count, 0);

  const inStage = candidates.filter((c) => c.stage === stage);
  const community = candidates.filter((c) => c.stage === "community");
  const stageLabel = STAGES.find((st) => st.id === stage)?.label ?? "";

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
        toolbar={[{ id: "filters", icon: <SlidersHorizontal size={18} />, label: "Filters", onClick: () => {} }]}
      />

      <div style={s.split}>
        <div style={s.leftCol}>
          <Card padX={24} padY={22} style={s.funnelCard}>
            <div style={s.funnelHead}>
              <span style={s.funnelTitle}>Pipeline funnel</span>
              <span style={s.funnelBasis}>{livePipeline} candidates in the live pipeline</span>
            </div>
            <ul style={s.funnelList}>
              {rows.map((r) => {
                const selected = r.id === stage;
                const pct = Math.round((r.count / maxCount) * 100);
                return (
                  <li key={r.id}>
                    <button
                      type="button"
                      className="recruiter-focusable"
                      onClick={() => setStage(r.id)}
                      aria-pressed={selected}
                      aria-label={`${r.label}: ${r.count} candidates — filter the list`}
                      style={{ ...s.funnelRow, background: selected ? "var(--overlay-selected)" : "transparent" }}
                    >
                      <span style={s.funnelRowHead}>
                        <span style={{ ...s.funnelDot, background: r.tint.fg }} aria-hidden="true" />
                        <span style={s.funnelStage}>{r.label}</span>
                        <span style={s.funnelCount}>{r.count}</span>
                      </span>
                      <span style={s.funnelTrack} aria-hidden="true">
                        <span style={{ ...s.funnelFill, width: `${pct}%`, background: r.tint.fg, opacity: r.count === 0 ? 0.25 : 1 }} />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>

          <div style={s.listHead}>
            <span style={s.listTitle}>{stageLabel}</span>
            <span style={s.listCount}>{inStage.length} candidate{inStage.length === 1 ? "" : "s"}</span>
          </div>

          {inStage.length === 0 ? (
            <Card padX={28} padY={36} style={s.empty}>
              <span style={s.emptyHeading}>No candidates in {stageLabel}</span>
              <span style={s.emptyBody}>Candidates appear here as they move into this stage.</span>
            </Card>
          ) : (
            <div style={s.list}>
              {inStage.map((c) => (
                <CandidateItem key={c.id} candidate={c} onAdvance={onAdvance} onOpenCandidate={onOpenCandidate} />
              ))}
            </div>
          )}
        </div>

        <aside style={s.rail} aria-label="Business impact and talent community">
          <Card padX={20} padY={20} tone="outline" style={s.railCard}>
            <div style={s.railHead}>
              <span style={s.railEyebrow}>Business impact</span>
              <span style={s.railTitle}>What AI screening is buying</span>
            </div>
            <div style={s.statList}>
              <RoiStat value={`${stats.timeToHire.days} days`} label="Avg time-to-hire" basis={`down from ${stats.timeToHire.baselineDays} days (manual)`} />
              <RoiStat value={`${stats.hoursSaved.hours} hrs`} label="Screening hours saved" basis={`${stats.hoursSaved.period} vs. manual first round`} />
              <RoiStat value={`${stats.costPerHire.pctLower}% lower`} label="Cost per hire" basis={stats.costPerHire.basis} />
              <RoiStat value={stats.screened} label="AI screenings completed" basis="candidates with evidence on file" />
            </div>
          </Card>

          <Card padX={20} padY={18} tone="outline" style={s.railCard}>
            <div style={s.railHead}>
              <span style={{ ...s.funnelDot, background: COMMUNITY_STAGE.tint.fg }} aria-hidden="true" />
              <span style={s.railTitle}>{COMMUNITY_STAGE.label}</span>
              <span style={s.railBasis}>{community.length} previously screened — re-activate when a role opens</span>
            </div>
            {community.length === 0 ? (
              <p style={s.colEmpty}>No one in the community pool yet</p>
            ) : (
              <ul style={s.communityList}>
                {community.map((c) => (
                  <li key={c.id} style={s.communityRow}>
                    <CandidateMonogram candidate={c} size={32} />
                    <div style={s.communityMain}>
                      <span style={s.itemName}>{c.name}</span>
                      <span style={s.itemSub}>{FAMILY_LABELS[c.family]}</span>
                    </div>
                    <AdvanceButton candidate={c} onAdvance={onAdvance} />
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <div style={s.railNote}>
            <p style={s.railNoteTitle}>{COMPLIANCE_COPY.heading}</p>
            <p style={s.railNoteBody}>{COMPLIANCE_COPY.body}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function CandidateItem({ candidate, onAdvance, onOpenCandidate }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ ...s.item, boxShadow: hover ? "var(--shadow-card)" : "none", borderColor: hover ? "var(--color-border-tab)" : "var(--color-divider-card)" }}
    >
      <CandidateMonogram candidate={candidate} size={40} />
      <div style={s.itemMain}>
        <button
          type="button"
          className="recruiter-focusable"
          onClick={() => onOpenCandidate?.(candidate.id)}
          aria-label={`${candidate.name} — open candidate details`}
          style={s.itemNameBtn}
        >
          <span style={s.itemName}>{candidate.name}</span>
          <ChevronRight size={16} color="var(--color-text-tertiary)" style={{ flexShrink: 0, opacity: hover ? 1 : 0.85, transition: "opacity 150ms ease" }} aria-hidden="true" />
        </button>
        <span style={s.itemSub}>{candidate.role} · {candidate.source}</span>
        <div style={s.itemMeter}>
          <CoverageMeter screen={candidate.screen} compact />
        </div>
      </div>
      <div style={s.itemAction}>
        <AdvanceButton candidate={candidate} onAdvance={onAdvance} />
      </div>
    </div>
  );
}

function RoiStat({ value, label, basis }) {
  return (
    <div style={s.roi}>
      <span style={s.roiValue}>{value}</span>
      <span style={s.roiLabel}>{label}</span>
      <span style={s.roiBasis}>{basis}</span>
    </div>
  );
}

const s = {
  column: { display: "flex", flexDirection: "column", gap: 20, width: "100%", fontFamily: "var(--font-sans)" },
  split: { display: "flex", gap: 24, alignItems: "flex-start" },
  leftCol: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 16 },

  funnelCard: { display: "flex", flexDirection: "column", gap: 16 },
  funnelHead: { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" },
  funnelTitle: { fontSize: 16, fontWeight: 700, color: "var(--color-text-deep)" },
  funnelBasis: { fontSize: 12, fontWeight: 400, color: "var(--color-text-tertiary)" },
  funnelList: { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6 },
  funnelRow: {
    width: "100%", display: "flex", flexDirection: "column", gap: 8, cursor: "pointer",
    border: "none", borderRadius: 10, padding: "10px 12px", textAlign: "left",
    fontFamily: "var(--font-sans)", transition: "background 150ms ease",
  },
  funnelRowHead: { display: "flex", alignItems: "center", gap: 8 },
  funnelDot: { width: 8, height: 8, borderRadius: 999, flexShrink: 0 },
  funnelStage: { fontSize: 13, fontWeight: 600, color: "var(--color-text-deep)" },
  funnelCount: { marginLeft: "auto", fontSize: 14, fontWeight: 700, color: "var(--color-text-deep)", fontVariantNumeric: "tabular-nums" },
  funnelTrack: { height: 8, borderRadius: 999, background: "var(--grey-200)", overflow: "hidden" },
  funnelFill: { display: "block", height: "100%", borderRadius: 999, transition: "width 150ms ease" },

  listHead: { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, paddingInline: 2 },
  listTitle: { fontSize: 14, fontWeight: 700, color: "var(--color-text-deep)" },
  listCount: { fontSize: 12, fontWeight: 600, color: "var(--color-text-tertiary)" },

  list: { display: "flex", flexDirection: "column", gap: 12 },
  item: {
    display: "flex", alignItems: "flex-start", gap: 14, width: "100%",
    padding: 16, boxSizing: "border-box",
    background: "var(--surface-white)", border: "1px solid var(--color-divider-card)",
    borderRadius: 12, fontFamily: "var(--font-sans)",
    transition: "box-shadow 150ms ease, border-color 150ms ease",
  },
  itemMain: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 },
  itemNameBtn: {
    display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "none",
    padding: 0, cursor: "pointer", textAlign: "left", fontFamily: "var(--font-sans)", borderRadius: 6,
  },
  itemName: { fontSize: 15, fontWeight: 700, color: "var(--color-text-deep)", lineHeight: 1.3, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  itemSub: { fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)" },
  itemMeter: { marginTop: 2, maxWidth: 280 },
  itemAction: { flexShrink: 0, alignSelf: "center" },

  // Rail
  rail: { width: 320, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16 },
  railCard: { display: "flex", flexDirection: "column", gap: 16 },
  railHead: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  railEyebrow: { flexBasis: "100%", fontSize: 11, fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase", color: "var(--color-text-tertiary)" },
  railTitle: { fontSize: 16, fontWeight: 700, color: "var(--color-text-deep)" },
  railBasis: { flexBasis: "100%", fontSize: 12, fontWeight: 400, color: "var(--color-text-tertiary)", lineHeight: 1.45 },

  statList: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
  roi: { display: "flex", flexDirection: "column", gap: 2, minWidth: 0 },
  roiValue: { fontSize: 22, fontWeight: 700, color: "var(--color-text-deep)", lineHeight: 1.1, fontVariantNumeric: "tabular-nums" },
  roiLabel: { fontSize: 12, fontWeight: 700, color: "var(--color-text-medium)" },
  roiBasis: { fontSize: 11, fontWeight: 400, color: "var(--color-text-tertiary)", lineHeight: 1.4 },

  communityList: { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 },
  communityRow: { display: "flex", alignItems: "center", gap: 12 },
  communityMain: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 },

  colEmpty: { margin: 0, fontSize: 12, fontWeight: 500, color: "var(--color-text-placeholder)" },

  empty: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6, textAlign: "center" },
  emptyHeading: { fontSize: 15, fontWeight: 700, color: "var(--color-text-deep)" },
  emptyBody: { fontSize: 13, fontWeight: 400, color: "var(--color-text-tertiary)", maxWidth: 320, lineHeight: 1.5 },

  railNote: { background: "var(--color-info-bg)", borderRadius: 8, padding: "12px 14px" },
  railNoteTitle: { margin: 0, fontSize: 12, fontWeight: 700, color: "var(--color-info)" },
  railNoteBody: { margin: "4px 0 0", fontSize: 12, fontWeight: 400, color: "var(--color-info-text)", lineHeight: 1.5 },
};
