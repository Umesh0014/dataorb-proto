"use client";

import React from "react";
import { ArrowLeft, Pencil, CheckCircle2, Sparkles, User } from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import { formatDate } from "./formatDate";
import { FAMILY_TINTS, FAMILY_LABELS } from "./mocks/recruiter";
import { PLAN_STATUS } from "./mocks/interviewPlans";

// InterviewPlanRecordPage — the full plan detail (reached from a plan card).
// Details out the definition: the job profile, the full set of assigned
// knowledge topics the AI Interviewer screens coverage against, how questions
// are chosen, and the screening tally. Compliance framing matches the
// pipeline: a plan defines what knowledge is screened, never a pass bar.

export default function InterviewPlanRecordPage({ plan, onBack }) {
  const tint = FAMILY_TINTS[plan.family] || FAMILY_TINTS.support;
  const st = PLAN_STATUS[plan.status] || PLAN_STATUS.draft;
  // Edit is a net-new flow — logged, not wired (the plan editor is open scope
  // for Akash); the CTA is present so the affordance is reviewable.
  const onEdit = () => console.log("AI Recruiter — edit interview plan", plan.id);

  return (
    <div style={s.column}>
      <div style={s.backRow}>
        <Button variant="icon" size="sm" aria-label="Back to interview plans" onClick={onBack}>
          <ArrowLeft size={20} />
        </Button>
        <span style={s.crumb}>Interview Plans / Plan</span>
      </div>

      <Card padX={28} padY={24} style={s.hero}>
        <div style={{ minWidth: 0 }}>
          <div style={s.heroChips}>
            <span style={{ ...s.familyChip, background: tint.bg, color: tint.fg }}>{FAMILY_LABELS[plan.family]}</span>
            <span style={{ ...s.statusPill, background: st.bg, color: st.fg }}>
              <span style={{ ...s.statusDot, background: st.dot }} aria-hidden="true" />
              {st.label}
            </span>
          </div>
          <h1 style={s.heroName}>{plan.name}</h1>
          <div style={s.heroSub}>{plan.jobProfile}</div>
        </div>
        <Button variant="text" uppercase={false} leadingIcon={<Pencil size={15} />} onClick={onEdit}>
          Edit plan
        </Button>
      </Card>

      <div style={s.split}>
        <div style={s.main}>
          <Card padX={24} padY={22} style={s.section}>
            <div style={s.sectionHead}>
              <span style={s.sectionTitle}>Assigned knowledge topics</span>
              <span style={s.sectionMeta}>{plan.topicsTotal} topics</span>
            </div>
            <p style={s.sectionLead}>
              The AI Interviewer measures each candidate's coverage against these topics —
              it reports how much was discussed, never whether the candidate passed.
            </p>
            <ul style={s.topicList}>
              {plan.topics.map((t) => (
                <li key={t} style={s.topicRow}>
                  <CheckCircle2 size={15} color="var(--color-text-tertiary)" aria-hidden="true" style={{ flexShrink: 0 }} />
                  <span style={s.topicText}>{t}</span>
                </li>
              ))}
              {plan.topicsTotal > plan.topics.length && (
                <li style={s.topicMore}>+{plan.topicsTotal - plan.topics.length} more assigned topics</li>
              )}
            </ul>
          </Card>

          <Card padX={24} padY={22} style={s.section}>
            <span style={s.sectionTitle}>How it screens</span>
            <div style={s.modeRow}>
              {plan.assisted
                ? <Sparkles size={16} color="var(--color-icon-tertiary-fg)" aria-hidden="true" />
                : <User size={16} color="var(--color-text-tertiary)" aria-hidden="true" />}
              <span style={s.modeText}>{plan.mode}{plan.assisted ? " · AI-assisted question selection" : ""}</span>
            </div>
          </Card>
        </div>

        <aside style={s.rail} aria-label="Plan at a glance">
          <Card padX={20} padY={20} tone="outline" style={s.section}>
            <span style={s.sectionTitle}>At a glance</span>
            <div style={s.metaList}>
              <Meta label="Job profile" value={plan.jobProfile} />
              <Meta label="Job family" value={FAMILY_LABELS[plan.family]} />
              <Meta label="Interview mode" value={plan.mode} />
              <Meta label="Assigned topics" value={`${plan.topicsTotal} topics`} />
              <Meta label="Candidates screened" value={`${plan.screened}`} />
              <Meta label="Last screening" value={plan.lastRun ? formatDate(plan.lastRun) : "Not run yet"} />
            </div>
          </Card>

          <div style={s.complianceNote}>
            <p style={s.complianceTitle}>Evidence, not a verdict</p>
            <p style={s.complianceBody}>
              A plan defines the knowledge a candidate is screened on. The AI reports coverage of
              that knowledge — the hiring decision stays with you, and screenings are recorded.
            </p>
          </div>
        </aside>
      </div>
    </div>
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
  heroChips: { display: "flex", alignItems: "center", gap: 8, marginBottom: 10 },
  familyChip: { display: "inline-flex", alignItems: "center", height: 22, padding: "0 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: "0.2px", whiteSpace: "nowrap" },
  statusPill: { display: "inline-flex", alignItems: "center", gap: 6, height: 22, padding: "0 8px", borderRadius: 999, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" },
  statusDot: { width: 6, height: 6, borderRadius: 999, flexShrink: 0 },
  heroName: { margin: 0, fontSize: 20, fontWeight: 700, color: "var(--color-text-deep)", lineHeight: 1.3 },
  heroSub: { fontSize: 14, fontWeight: 500, color: "var(--color-text-medium)", marginTop: 2 },

  split: { display: "flex", gap: 24, alignItems: "flex-start" },
  main: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 20 },
  rail: { width: 320, flexShrink: 0, display: "flex", flexDirection: "column", gap: 20 },

  section: { display: "flex", flexDirection: "column", gap: 14 },
  sectionHead: { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" },
  sectionTitle: { fontSize: 15, fontWeight: 700, color: "var(--color-text-deep)" },
  sectionMeta: { fontSize: 12, fontWeight: 600, color: "var(--color-text-tertiary)" },
  sectionLead: { margin: 0, fontSize: 13, fontWeight: 400, color: "var(--color-text-medium)", lineHeight: 1.5 },

  topicList: { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 },
  topicRow: { display: "flex", alignItems: "center", gap: 10 },
  topicText: { fontSize: 13, fontWeight: 500, color: "var(--color-text-deep)" },
  topicMore: { fontSize: 12, fontWeight: 500, color: "var(--color-text-placeholder)", paddingLeft: 25 },

  modeRow: { display: "flex", alignItems: "center", gap: 8 },
  modeText: { fontSize: 13, fontWeight: 500, color: "var(--color-text-medium)" },

  metaList: { display: "flex", flexDirection: "column", gap: 14 },
  meta: { display: "flex", flexDirection: "column", gap: 4, minWidth: 0 },
  metaLabel: { fontSize: 11, fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase", color: "var(--color-text-tertiary)" },
  metaValue: { fontSize: 13, fontWeight: 500, color: "var(--color-text-deep)", lineHeight: 1.4 },

  complianceNote: { background: "var(--color-info-bg)", borderRadius: 8, padding: "14px 16px" },
  complianceTitle: { margin: 0, fontSize: 12, fontWeight: 700, color: "var(--color-info)" },
  complianceBody: { margin: "4px 0 0", fontSize: 12, fontWeight: 400, color: "var(--color-info-text)", lineHeight: 1.5 },
};
