"use client";

import React from "react";
import { Plus, GripVertical, MessageSquareQuote, Target } from "lucide-react";
import {
  TypeTag,
  RequirementTag,
  GroundingChip,
  SuccessChip,
  EvidenceCard,
  SuggestedStepCard,
} from "./GuidedWorkflowBits";
import { gwEvidence } from "./mocks/guidedWorkflows";

// B · Balanced — Stage board. The five universal stages become horizontal
// swim-lanes (Neil's swim-lane lean), so the lead reads the *shape* of the
// conversation at a glance — how front-loaded Discover is, whether Close is
// thin. A pinned outcome lane on the left carries the job-to-be-done and the
// success metric the whole board drives toward. Steps are cards inside their
// stage column; the requirement tag is a one-tap cycle, same as the list.
//
// Mutations owned by the host; this editor scrolls horizontally within the
// page's content width so all five lanes + the outcome lane stay on one row.

export default function GuidedWorkflowBoardEditor({
  meta,
  stagesWithSteps,
  suggestions = [],
  onAcceptSuggestion,
  onCycleRequirement,
  onUpdateScript,
  onAddStep,
}) {
  const [expanded, setExpanded] = React.useState(null);
  const [openSuggest, setOpenSuggest] = React.useState(null);
  const toggle = (id) => setExpanded((cur) => (cur === id ? null : id));

  return (
    <div style={styles.scroller}>
      <div style={styles.board}>
        <OutcomeLane meta={meta} />
        {stagesWithSteps.map((stage, idx) => (
          <section key={stage.id} style={styles.lane} aria-label={`${stage.label} stage`}>
            <header style={styles.laneHead}>
              <span style={styles.laneIndex}>{idx + 1}</span>
              <span style={styles.laneName}>{stage.label}</span>
              <span style={styles.laneCount}>{stage.steps.length}</span>
            </header>
            <p style={styles.lanePurpose}>{stage.purpose}</p>
            <div style={styles.laneBody}>
              {stage.steps.length === 0 && (
                <p style={styles.laneEmpty}>No steps here yet — add one, or accept a suggestion below.</p>
              )}
              {stage.steps.map((step) => (
                <StepCard
                  key={step.id}
                  step={step}
                  expanded={expanded === step.id}
                  onToggle={() => toggle(step.id)}
                  onCycleRequirement={() => onCycleRequirement(step.id)}
                  onUpdateScript={onUpdateScript}
                />
              ))}
              <button type="button" style={styles.addCard} onClick={() => onAddStep(stage.id)}>
                <Plus size={14} color="var(--color-button-primary-bg)" />
                Add step
              </button>
              {suggestions
                .filter((s) => s.stage === stage.id)
                .map((s) => (
                  <SuggestedStepCard
                    key={s.id}
                    step={s}
                    dense
                    expanded={openSuggest === s.id}
                    onToggle={() => setOpenSuggest((cur) => (cur === s.id ? null : s.id))}
                    onAdd={() => onAcceptSuggestion(s.id)}
                  />
                ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function OutcomeLane({ meta }) {
  return (
    <section style={styles.outcomeLane} aria-label="Outcome">
      <header style={styles.outcomeHead}>
        <Target size={15} color="var(--color-button-primary-bg)" aria-hidden="true" />
        <span style={styles.outcomeTitle}>Outcome</span>
      </header>
      <div style={styles.outcomeBlock}>
        <span style={styles.outcomeLabel}>Job to be done</span>
        <p style={styles.outcomeText}>{meta.jobToBeDone}</p>
      </div>
      <div style={styles.outcomeBlock}>
        <span style={styles.outcomeLabel}>Success metric</span>
        <p style={styles.outcomeText}>{meta.successMetric}</p>
      </div>
      <div style={styles.outcomeBlock}>
        <span style={styles.outcomeLabel}>Triggers</span>
        <div style={styles.triggerWrap}>
          {meta.triggers.map((tr) => (
            <span key={tr} style={styles.trigger}>{tr}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function StepCard({ step, expanded, onToggle, onCycleRequirement, onUpdateScript }) {
  const evidence = step.evidence ?? gwEvidence(step.id);
  return (
    <article style={styles.card}>
      <div style={styles.cardTop}>
        <span style={styles.grip} aria-hidden="true">
          <GripVertical size={14} color="var(--color-text-placeholder)" />
        </span>
        <span style={styles.cardInstruction}>{step.instruction}</span>
      </div>
      <div style={styles.cardTags}>
        <TypeTag type={step.type} />
        <button type="button" onClick={onCycleRequirement} style={styles.reqBtn} aria-label={`Requirement: ${step.requirement}. Tap to change.`}>
          <RequirementTag requirement={step.requirement} />
        </button>
      </div>
      {step.subSteps.length > 0 && (
        <span style={styles.subCount}>{step.subSteps.length} conditional sub-steps</span>
      )}
      <div style={styles.cardFoot}>
        <GroundingChip grounding={step.grounding} />
        {step.script && <MessageSquareQuote size={13} color="var(--color-button-primary-bg)" aria-label="Has a script" />}
      </div>
      <button type="button" onClick={onToggle} style={styles.evidenceToggle} aria-expanded={expanded}>
        {evidence ? <SuccessChip evidence={evidence} /> : <span style={styles.noEvidence}>No evidence yet</span>}
        <span style={styles.evidenceCue}>{expanded ? "Hide" : "Why?"}</span>
      </button>
      {expanded && (
        <>
          <EvidenceCard evidence={evidence} />
          {step.script != null && (
            <label style={styles.scriptField}>
              <span style={styles.scriptLabel}>Script {step.editedByLead && <span style={styles.editedNote}>· edited by you</span>}</span>
              <textarea
                value={step.script}
                onChange={(e) => onUpdateScript?.(step.id, e.target.value)}
                style={styles.scriptArea}
                rows={2}
                aria-label="Step script"
              />
            </label>
          )}
        </>
      )}
    </article>
  );
}

const LANE_W = 224;

const styles = {
  // Horizontal scroll within the content column so all six lanes stay one row.
  scroller: { overflowX: "auto", paddingBottom: 8 },
  board: { display: "flex", gap: 14, alignItems: "flex-start", minWidth: "min-content" },

  outcomeLane: {
    width: LANE_W, flexShrink: 0, display: "flex", flexDirection: "column", gap: 14,
    padding: 14, borderRadius: 12, background: "var(--color-icon-tertiary-bg)",
    border: "1px solid var(--color-border-tab)",
  },
  outcomeHead: { display: "inline-flex", alignItems: "center", gap: 7 },
  outcomeTitle: { fontSize: 13, fontWeight: 700, color: "var(--color-icon-tertiary-fg)", textTransform: "uppercase", letterSpacing: "0.06em" },
  outcomeBlock: { display: "flex", flexDirection: "column", gap: 5 },
  outcomeLabel: { fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--color-text-tertiary)" },
  outcomeText: { margin: 0, fontSize: 12.5, color: "var(--color-text-medium)", lineHeight: 1.5 },
  triggerWrap: { display: "flex", flexWrap: "wrap", gap: 5 },
  trigger: {
    fontSize: 11.5, fontWeight: 500, color: "var(--color-text-medium)", background: "var(--surface-white)",
    border: "1px solid var(--color-divider-card)", borderRadius: 999, padding: "2px 9px",
  },

  lane: {
    width: LANE_W, flexShrink: 0, display: "flex", flexDirection: "column", gap: 6,
    padding: 12, borderRadius: 12, background: "var(--surface-dim)",
    border: "1px solid var(--color-border-card-soft)",
  },
  laneHead: { display: "flex", alignItems: "center", gap: 8 },
  laneIndex: {
    width: 20, height: 20, borderRadius: 6, background: "var(--surface-white)",
    border: "1px solid var(--color-divider-card)", color: "var(--color-text-medium)",
    fontSize: 11, fontWeight: 700, display: "inline-grid", placeItems: "center", flexShrink: 0,
  },
  laneName: { fontSize: 13.5, fontWeight: 700, color: "var(--color-text-deep)", flex: 1 },
  laneCount: { fontSize: 12, fontWeight: 700, color: "var(--color-text-tertiary)", fontFamily: "var(--font-mono)" },
  lanePurpose: { margin: "0 0 4px", fontSize: 11.5, color: "var(--color-text-tertiary)", lineHeight: 1.45 },
  laneBody: { display: "flex", flexDirection: "column", gap: 8 },

  card: {
    display: "flex", flexDirection: "column", gap: 8, padding: "11px 12px", borderRadius: 10,
    background: "var(--surface-white)", border: "1px solid var(--color-divider-card)", boxShadow: "var(--shadow-card)",
  },
  cardTop: { display: "flex", gap: 7, alignItems: "flex-start" },
  grip: { display: "inline-flex", paddingTop: 1, cursor: "grab", flexShrink: 0 },
  cardInstruction: { fontSize: 13, fontWeight: 600, color: "var(--color-text-deep)", lineHeight: 1.4 },
  cardTags: { display: "flex", flexWrap: "wrap", gap: 6 },
  reqBtn: { background: "transparent", border: "none", padding: 0, cursor: "pointer", display: "inline-flex" },
  subCount: { fontSize: 11, fontWeight: 600, color: "var(--color-icon-tertiary-fg)" },
  cardFoot: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 },
  evidenceToggle: {
    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 2,
    background: "transparent", border: "none", borderTop: "1px solid var(--color-border-card-soft)",
    paddingTop: 8, cursor: "pointer", fontFamily: "inherit", width: "100%",
  },
  noEvidence: { fontSize: 11, fontStyle: "italic", color: "var(--color-text-tertiary)" },
  evidenceCue: { fontSize: 11.5, fontWeight: 700, color: "var(--color-button-primary-bg)" },
  laneEmpty: { margin: 0, padding: "8px 4px", fontSize: 11.5, fontStyle: "italic", color: "var(--color-text-tertiary)", lineHeight: 1.45 },
  scriptField: { display: "flex", flexDirection: "column", gap: 5 },
  scriptLabel: { fontSize: 11.5, fontWeight: 700, color: "var(--color-text-medium)" },
  editedNote: { fontWeight: 600, fontStyle: "italic", color: "var(--color-icon-tertiary-fg)" },
  scriptArea: {
    width: "100%", boxSizing: "border-box", resize: "vertical", padding: "8px 10px", borderRadius: 8,
    border: "1px solid var(--color-divider-card)", background: "var(--surface-dim)", fontFamily: "var(--font-sans)",
    fontSize: 12, color: "var(--color-text-medium)", lineHeight: 1.5,
  },
  addCard: {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
    background: "transparent", border: "1px dashed var(--color-divider-card)", borderRadius: 10,
    padding: "8px 10px", cursor: "pointer", fontFamily: "inherit", fontSize: 12.5, fontWeight: 600,
    color: "var(--color-button-primary-bg)",
  },
};
