"use client";

import React from "react";
import { ArrowLeft, Play, CheckCircle2, Circle, Clock } from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import { formatDate } from "./formatDate";
import { FAMILY_LABELS } from "./mocks/recruiter";
import {
  CandidateMonogram, StageBadge, CoverageMeter, RecordedTag, AdvanceButton,
  COMPLIANCE_COPY,
} from "./AIRecruiterParts";
import { EvidenceBlock, screeningStatusLabel, thinLabel } from "./CandidateDetail";

// CandidateRecordPage — the full-page candidate record (reached from "Open
// candidate record" in the pipeline detail). It details out what the sidecar
// summarises: the AI screening evidence (editable narrative + read-only
// coverage breakdown), the screening-recording affordance, an activity
// timeline, and an at-a-glance rail. The stage-advance CTA stays parked here
// in the hero. Compliance spine unchanged: coverage, never a verdict (G4);
// the human owns the stage move; screenings recorded.

export default function CandidateRecordPage({ candidate, onBack, onAdvance }) {
  const { screen } = candidate;
  const completed = screen.status === "completed";
  const toProbe = Math.max(0, screen.coverage.total - screen.coverage.covered);

  return (
    <div style={s.column}>
      <div style={s.backRow}>
        <Button variant="icon" size="sm" aria-label="Back to pipeline" onClick={onBack}>
          <ArrowLeft size={20} />
        </Button>
        <span style={s.crumb}>Pipeline / Candidate</span>
      </div>

      <Card padX={28} padY={24} style={s.hero}>
        <div style={s.heroIdent}>
          <CandidateMonogram candidate={candidate} size={56} />
          <div style={{ minWidth: 0 }}>
            <h1 style={s.heroName}>{candidate.name}</h1>
            <div style={s.heroRole}>{candidate.role}</div>
            <div style={s.heroChips}>
              <span style={s.metaChip}>{FAMILY_LABELS[candidate.family]}</span>
              <span style={s.metaChip}>{candidate.source}</span>
              <RecordedTag />
            </div>
          </div>
        </div>
        <div style={s.heroAction}>
          <StageBadge stage={candidate.stage} />
          <AdvanceButton candidate={candidate} onAdvance={onAdvance} />
        </div>
      </Card>

      <div style={s.split}>
        <div style={s.main}>
          <Card padX={24} padY={22} style={s.section}>
            <div style={s.sectionHead}>
              <span style={s.sectionTitle}>AI screening</span>
              <span style={s.sectionMeta}>{screeningStatusLabel(candidate)}</span>
            </div>

            <CoverageMeter screen={screen} />

            {completed && (
              <div style={s.breakdown}>
                <div style={s.breakdownBar} role="img" aria-label={`${screen.coverage.covered} of ${screen.coverage.total} assigned topics covered, ${toProbe} to probe in interview`}>
                  <span style={{ ...s.breakCovered, flex: screen.coverage.covered }} />
                  {toProbe > 0 && <span style={{ ...s.breakProbe, flex: toProbe }} />}
                </div>
                <div style={s.breakdownLegend}>
                  <span style={s.legendItem}><span style={{ ...s.legendDot, background: "var(--chart-blue)" }} aria-hidden="true" />{screen.coverage.covered} covered</span>
                  <span style={s.legendItem}><span style={{ ...s.legendDot, background: "var(--grey-300)" }} aria-hidden="true" />{toProbe} to probe in interview</span>
                </div>
              </div>
            )}

            <EvidenceBlock candidate={candidate} />

            <div style={s.recordRow}>
              <RecordedTag />
              <Button variant="icon" size="sm" aria-label="Play screening recording — coming soon" disabled>
                <Play size={16} />
              </Button>
              <span style={s.recordNote}>Recording playback — coming soon</span>
            </div>
          </Card>

          <Card padX={24} padY={22} style={s.section}>
            <span style={s.sectionTitle}>Activity</span>
            <Timeline candidate={candidate} />
          </Card>
        </div>

        <aside style={s.rail} aria-label="Candidate at a glance">
          <Card padX={20} padY={20} tone="outline" style={s.section}>
            <span style={s.sectionTitle}>At a glance</span>
            <div style={s.metaList}>
              <Meta label="Stage" value={<StageBadge stage={candidate.stage} />} />
              <Meta label="Job family" value={FAMILY_LABELS[candidate.family]} />
              <Meta label="Source" value={candidate.source} />
              <Meta label="Applied" value={formatDate(candidate.appliedAt)} />
              <Meta label="AI screening" value={screeningStatusLabel(candidate)} />
              <Meta label="Follow-up topics" value={thinLabel(candidate)} />
            </div>
          </Card>

          <div style={s.complianceNote}>
            <p style={s.complianceTitle}>{COMPLIANCE_COPY.heading}</p>
            <p style={s.complianceBody}>{COMPLIANCE_COPY.body}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

// Timeline — a small stage history derived from the candidate's dates. Each
// row pairs an icon with text (never colour alone, G9): done / current /
// pending. Coverage-framed throughout — no verdict language.
function Timeline({ candidate }) {
  const { screen, stage } = candidate;
  const steps = [
    { label: "Application received", date: candidate.appliedAt, state: "done" },
    screen.status === "completed"
      ? { label: "AI screening completed", date: screen.completedAt, state: "done" }
      : screen.status === "in_progress"
        ? { label: "AI screening in progress", date: null, state: "current" }
        : { label: "AI screening not started", date: null, state: "pending" },
  ];
  if (stage !== "applied" && stage !== "ai_screening") {
    steps.push({ label: candidate.lastActivity, date: null, state: "current" });
  }

  return (
    <ul style={s.timeline}>
      {steps.map((step, i) => {
        const Icon = step.state === "done" ? CheckCircle2 : step.state === "current" ? Clock : Circle;
        const color = step.state === "pending" ? "var(--color-text-placeholder)" : "var(--color-text-tertiary)";
        return (
          <li key={i} style={s.timelineRow}>
            <Icon size={16} color={color} aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={s.timelineLabel}>{step.label}</span>
            {step.date && <span style={s.timelineDate}>{formatDate(step.date)}</span>}
          </li>
        );
      })}
    </ul>
  );
}

function Meta({ label, value }) {
  return (
    <div style={s.meta}>
      <span style={s.metaLabel}>{label}</span>
      <span style={s.metaValue}>{value}</span>
    </div>
  );
}

const s = {
  column: { display: "flex", flexDirection: "column", gap: 20, width: "100%", fontFamily: "var(--font-sans)" },
  backRow: { display: "flex", alignItems: "center", gap: 10 },
  crumb: { fontSize: 13, fontWeight: 600, color: "var(--color-text-tertiary)" },

  hero: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap" },
  heroIdent: { display: "flex", alignItems: "center", gap: 16, minWidth: 0 },
  heroName: { margin: 0, fontSize: 20, fontWeight: 700, color: "var(--color-text-deep)", lineHeight: 1.3 },
  heroRole: { fontSize: 14, fontWeight: 500, color: "var(--color-text-medium)", marginTop: 2 },
  heroChips: { display: "flex", alignItems: "center", gap: 10, marginTop: 10, flexWrap: "wrap" },
  metaChip: {
    display: "inline-flex", alignItems: "center", height: 22, padding: "0 10px", borderRadius: 999,
    background: "var(--pill-bg)", color: "var(--color-text-medium)", fontSize: 12, fontWeight: 600,
  },
  heroAction: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12, flexShrink: 0 },

  split: { display: "flex", gap: 24, alignItems: "flex-start" },
  main: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 20 },
  rail: { width: 320, flexShrink: 0, display: "flex", flexDirection: "column", gap: 20 },

  section: { display: "flex", flexDirection: "column", gap: 16 },
  sectionHead: { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" },
  sectionTitle: { fontSize: 15, fontWeight: 700, color: "var(--color-text-deep)" },
  sectionMeta: { fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)" },

  breakdown: { display: "flex", flexDirection: "column", gap: 8 },
  breakdownBar: { display: "flex", height: 10, borderRadius: 999, overflow: "hidden", background: "var(--grey-200)" },
  breakCovered: { background: "var(--chart-blue)" },
  breakProbe: { background: "var(--grey-300)" },
  breakdownLegend: { display: "flex", gap: 16, flexWrap: "wrap" },
  legendItem: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 500, color: "var(--color-text-medium)", fontVariantNumeric: "tabular-nums" },
  legendDot: { width: 8, height: 8, borderRadius: 999, flexShrink: 0 },

  recordRow: { display: "flex", alignItems: "center", gap: 10, paddingTop: 4, borderTop: "1px solid var(--color-divider-card)" },
  recordNote: { fontSize: 12, fontWeight: 400, color: "var(--color-text-placeholder)" },

  timeline: { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 },
  timelineRow: { display: "flex", alignItems: "flex-start", gap: 10 },
  timelineLabel: { flex: 1, minWidth: 0, fontSize: 13, fontWeight: 500, color: "var(--color-text-deep)", lineHeight: 1.4 },
  timelineDate: { fontSize: 12, fontWeight: 400, color: "var(--color-text-tertiary)", fontVariantNumeric: "tabular-nums", flexShrink: 0 },

  metaList: { display: "flex", flexDirection: "column", gap: 14 },
  meta: { display: "flex", flexDirection: "column", gap: 4, minWidth: 0 },
  metaLabel: { fontSize: 11, fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase", color: "var(--color-text-tertiary)" },
  metaValue: { fontSize: 13, fontWeight: 500, color: "var(--color-text-deep)", lineHeight: 1.4 },

  complianceNote: { background: "var(--color-info-bg)", borderRadius: 8, padding: "14px 16px" },
  complianceTitle: { margin: 0, fontSize: 12, fontWeight: 700, color: "var(--color-info)" },
  complianceBody: { margin: "4px 0 0", fontSize: 12, fontWeight: 400, color: "var(--color-info-text)", lineHeight: 1.5 },
};
