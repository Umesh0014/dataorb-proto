"use client";

import React from "react";
import { X, Sparkles, Pencil } from "lucide-react";
import Button from "./Button";
import MultiLineInput from "./MultiLineInput";
import { formatDate } from "./formatDate";
import { FAMILY_LABELS } from "./mocks/recruiter";
import {
  CandidateMonogram, StageBadge, CoverageMeter, RecordedTag, AdvanceButton,
  COMPLIANCE_COPY,
} from "./AIRecruiterParts";

// CandidateDetail — the shared per-candidate record surface. It is the home
// for the candidate's detail AND the stage-advance CTA ("Push to Interview"),
// so the pipeline cards/rows stay lightweight and the action lives in one
// deliberate place. Composed by the Table variant's right sidecar and the
// Board variant's detail curtain (one detail body, two shells).

export function CandidateDetailHeader({ candidate, onClose, closeRef }) {
  return (
    <div style={s.head}>
      <div style={s.ident}>
        <CandidateMonogram candidate={candidate} size={40} />
        <div style={{ minWidth: 0 }}>
          <div style={s.name}>{candidate.name}</div>
          <div style={s.sub}>{candidate.role}</div>
        </div>
      </div>
      <button ref={closeRef} type="button" className="recruiter-focusable" onClick={onClose} aria-label="Close candidate details" style={s.closeBtn}>
        <X size={18} color="var(--color-text-medium)" />
      </button>
    </div>
  );
}

export function CandidateDetailBody({ candidate }) {
  return (
    <div style={s.body}>
      <div style={s.rowTop}>
        <StageBadge stage={candidate.stage} />
        <RecordedTag />
      </div>

      <CoverageMeter screen={candidate.screen} />

      <div style={s.metaGrid}>
        <Meta label="Job family" value={FAMILY_LABELS[candidate.family]} />
        <Meta label="Source" value={candidate.source} />
        <Meta label="Applied" value={formatDate(candidate.appliedAt)} />
        <Meta label="AI screening" value={screeningStatusLabel(candidate)} />
        <Meta label="Last activity" value={candidate.lastActivity} />
        <Meta label="Follow-up topics" value={thinLabel(candidate)} />
      </div>

      <EvidenceBlock candidate={candidate} />

      <div style={s.complianceNote}>
        <p style={s.complianceTitle}>{COMPLIANCE_COPY.heading}</p>
        <p style={s.complianceBody}>{COMPLIANCE_COPY.body}</p>
      </div>
    </div>
  );
}

// CandidateDetailFooter — the parked CTA. The stage-advance ("Push to
// Interview", "Move to Offer", "Activate candidate"…) lives here, not on the
// card, plus a secondary route into the full candidate record.
export function CandidateDetailFooter({ candidate, onAdvance, onOpenCandidate }) {
  return (
    <div style={s.footer}>
      <AdvanceButton candidate={candidate} onAdvance={onAdvance} fullWidth />
      <Button variant="text" uppercase={false} fullWidth onClick={() => onOpenCandidate?.(candidate.id)}>
        Open candidate record
      </Button>
    </div>
  );
}

export function screeningStatusLabel(c) {
  if (c.screen.status === "completed") return `Completed ${formatDate(c.screen.completedAt)}`;
  if (c.screen.status === "in_progress") return "In progress";
  return "Not started";
}

export function thinLabel(c) {
  if (c.screen.status !== "completed") return "—";
  if (!c.thin) return "None — full coverage";
  return `${c.thin} topic${c.thin === 1 ? "" : "s"} to probe`;
}

// evidenceDraft — the AI's starting-state evidence summary, generated from the
// candidate's screening coverage. Deliberately coverage-framed and verdict-free
// (G4): it describes what was discussed, never whether the candidate passed.
function evidenceDraft(c) {
  const { status, coverage } = c.screen;
  const { covered, total } = coverage;
  if (status === "not_started") {
    return `AI screening hasn't run yet — an evidence summary appears here once ${c.name} completes the screening.`;
  }
  if (status === "in_progress") {
    return `AI screening is in progress — ${covered} of ${total} assigned topics covered so far. A full evidence summary appears when it completes.`;
  }
  const thin = c.thin || 0;
  const thinClause = thin > 0
    ? `${thin} topic${thin === 1 ? "" : "s"} show thinner coverage and may be worth probing in the interview`
    : "all assigned topics were covered";
  return (
    `In the AI screening for ${c.role}, ${c.name} covered ${covered} of ${total} ` +
    `assigned topics. Coverage is most consistent on core process steps; ${thinClause}. ` +
    `Evidence only — no hiring recommendation.`
  );
}

// EvidenceBlock — the AI-output-as-starting-state surface (INT-7). The
// narrative is editable inline and user-owned; once edited it carries a "last
// edited by" credit. The quantitative coverage above stays read-only — the
// user owns the words, the system owns the numbers. Exported so the full
// candidate record page renders the same editable evidence as the sidecar.
export function EvidenceBlock({ candidate }) {
  const draft = evidenceDraft(candidate);
  const [text, setText] = React.useState(draft);
  const [editing, setEditing] = React.useState(false);
  const [edited, setEdited] = React.useState(false);
  const completed = candidate.screen.status === "completed";

  // The draft is candidate-specific; reset the editor when the open candidate
  // changes so the panel never shows a stale summary.
  React.useEffect(() => {
    setText(draft);
    setEditing(false);
    setEdited(false);
  }, [draft]);

  const save = () => { setEditing(false); setEdited(true); };
  const cancel = () => { setText(draft); setEditing(false); };

  return (
    <div style={s.evidence}>
      <div style={s.evidenceHead}>
        <span style={s.evidenceTitle}>
          <Sparkles size={14} color="var(--color-icon-tertiary-fg)" aria-hidden="true" />
          Evidence summary
        </span>
        {completed && !editing && (
          <button type="button" className="recruiter-focusable" onClick={() => setEditing(true)} style={s.evidenceEdit}>
            <Pencil size={13} aria-hidden="true" /> Edit
          </button>
        )}
      </div>

      {editing ? (
        <>
          <MultiLineInput value={text} onChange={setText} max={420} rows={5} placeholder="Evidence summary" ariaLabel={`Evidence summary for ${candidate.name}`} />
          <div style={s.evidenceActions}>
            <Button variant="text" uppercase={false} onClick={cancel} style={{ height: 32 }}>Cancel</Button>
            <Button variant="primary" onClick={save} style={{ height: 32, minWidth: 0, paddingInline: 16 }}>Save</Button>
          </div>
        </>
      ) : (
        <p style={s.evidenceBody}>{text}</p>
      )}

      {completed && (
        <span style={s.evidenceMeta} role="status" aria-live="polite">
          {edited ? "Last edited by Demo Internal · Today" : "AI draft · not yet edited"}
        </span>
      )}
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
  head: {
    flexShrink: 0, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12,
    padding: "20px 20px 16px", borderBottom: "1px solid var(--color-divider-card)",
  },
  ident: { display: "flex", alignItems: "center", gap: 12, minWidth: 0 },
  name: { fontSize: 15, fontWeight: 700, color: "var(--color-text-deep)", lineHeight: 1.35 },
  sub: { fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)", marginTop: 2 },
  closeBtn: {
    width: 32, height: 32, borderRadius: 8, border: "none", background: "var(--color-card-emoji-bg)",
    display: "inline-grid", placeItems: "center", cursor: "pointer", flexShrink: 0,
  },

  body: { flex: 1, minHeight: 0, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 20 },
  rowTop: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" },
  metaGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  meta: { display: "flex", flexDirection: "column", gap: 3, minWidth: 0 },
  metaLabel: { fontSize: 11, fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase", color: "var(--color-text-tertiary)" },
  metaValue: { fontSize: 13, fontWeight: 500, color: "var(--color-text-deep)", lineHeight: 1.4 },

  evidence: { display: "flex", flexDirection: "column", gap: 8 },
  evidenceHead: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 },
  evidenceTitle: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase", color: "var(--color-text-tertiary)" },
  evidenceEdit: {
    display: "inline-flex", alignItems: "center", gap: 4, background: "transparent", border: "none",
    padding: "2px 4px", cursor: "pointer", borderRadius: 6, color: "var(--color-button-primary-bg)",
    fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 700,
  },
  evidenceBody: { margin: 0, fontSize: 13, fontWeight: 400, color: "var(--color-text-medium)", lineHeight: 1.55 },
  evidenceActions: { display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 },
  evidenceMeta: { fontSize: 11, fontWeight: 500, color: "var(--color-text-placeholder)" },

  complianceNote: { background: "var(--color-info-bg)", borderRadius: 8, padding: "12px 14px" },
  complianceTitle: { margin: 0, fontSize: 12, fontWeight: 700, color: "var(--color-info)" },
  complianceBody: { margin: "4px 0 0", fontSize: 12, fontWeight: 400, color: "var(--color-info-text)", lineHeight: 1.5 },

  footer: { flexShrink: 0, padding: 20, borderTop: "1px solid var(--color-divider-card)", display: "flex", flexDirection: "column", gap: 4 },
};
