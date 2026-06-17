"use client";

import React from "react";
import { GripVertical, MessageSquareQuote, Target, ChevronRight } from "lucide-react";
import { TypeTag, RequirementTag, GroundingChip, SuccessChip } from "./GuidedWorkflowBits";
import { AddStepCards } from "./GuidedWorkflowStepDrawer";
import { gwEvidence } from "./mocks/guidedWorkflows";

// B · Balanced — Stage board. The five universal stages become horizontal
// swim-lanes so the lead reads the *shape* of the conversation at a glance;
// a pinned outcome lane carries the job-to-be-done and success metric. Each
// step is a card showing its success rate; clicking it opens the side-curtain
// drawer for editing. Under each lane the stage's AI suggestions + a blank
// option render as cards. Mutations owned by the host.

export default function GuidedWorkflowBoardEditor({
  meta,
  stagesWithSteps,
  suggestions = [],
  onAcceptSuggestion,
  onOpenStep,
  onAddBlank,
}) {
  const [expandedSuggest, setExpandedSuggest] = React.useState(null);

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
                <p style={styles.laneEmpty}>No steps here yet — add one below.</p>
              )}
              {stage.steps.map((step) => (
                <StepCard key={step.id} step={step} onOpen={() => onOpenStep(step.id)} />
              ))}
              <span style={styles.addLabel}>Add a step</span>
              <AddStepCards
                stageId={stage.id}
                suggestions={suggestions}
                onAccept={onAcceptSuggestion}
                onAddBlank={onAddBlank}
                expandedSuggest={expandedSuggest}
                onToggleSuggest={(id) => setExpandedSuggest((cur) => (cur === id ? null : id))}
                dense
              />
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

function StepCard({ step, onOpen }) {
  const evidence = step.evidence ?? gwEvidence(step.id);
  return (
    <button type="button" onClick={onOpen} className="gw-focusable" style={styles.card} aria-label={`Open ${step.instruction || "new step"}`}>
      <div style={styles.cardTop}>
        <span style={styles.grip} aria-hidden="true">
          <GripVertical size={14} color="var(--color-text-placeholder)" />
        </span>
        <span style={styles.cardInstruction}>{step.instruction || "Untitled step"}</span>
        <ChevronRight size={15} color="var(--color-text-tertiary)" style={{ flexShrink: 0 }} />
      </div>
      <div style={styles.cardTags}>
        <TypeTag type={step.type} />
        <RequirementTag requirement={step.requirement} />
      </div>
      <div style={styles.cardFoot}>
        <GroundingChip grounding={step.grounding} />
        {step.script && <MessageSquareQuote size={13} color="var(--color-button-primary-bg)" aria-label="Has a script" />}
      </div>
      {evidence ? <SuccessChip evidence={evidence} /> : <span style={styles.noEvidence}>No evidence yet</span>}
    </button>
  );
}

const LANE_W = 232;

const styles = {
  scroller: { overflowX: "auto", paddingBottom: 8 },
  board: { display: "flex", gap: 14, alignItems: "flex-start", minWidth: "min-content" },

  outcomeLane: {
    width: LANE_W, flexShrink: 0, display: "flex", flexDirection: "column", gap: 14,
    padding: 14, borderRadius: 12, background: "var(--color-icon-tertiary-bg)", border: "1px solid var(--color-border-tab)",
  },
  outcomeHead: { display: "inline-flex", alignItems: "center", gap: 7 },
  outcomeTitle: { fontSize: 13, fontWeight: 700, color: "var(--color-icon-tertiary-fg)", textTransform: "uppercase", letterSpacing: "0.06em" },
  outcomeBlock: { display: "flex", flexDirection: "column", gap: 5 },
  outcomeLabel: { fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--color-text-tertiary)" },
  outcomeText: { margin: 0, fontSize: 12.5, color: "var(--color-text-medium)", lineHeight: 1.5 },
  triggerWrap: { display: "flex", flexWrap: "wrap", gap: 5 },
  trigger: { fontSize: 11.5, fontWeight: 500, color: "var(--color-text-medium)", background: "var(--surface-white)", border: "1px solid var(--color-divider-card)", borderRadius: 999, padding: "2px 9px" },

  lane: { width: LANE_W, flexShrink: 0, display: "flex", flexDirection: "column", gap: 6, padding: 12, borderRadius: 12, background: "var(--surface-dim)", border: "1px solid var(--color-border-card-soft)" },
  laneHead: { display: "flex", alignItems: "center", gap: 8 },
  laneIndex: { width: 20, height: 20, borderRadius: 6, background: "var(--surface-white)", border: "1px solid var(--color-divider-card)", color: "var(--color-text-medium)", fontSize: 11, fontWeight: 700, display: "inline-grid", placeItems: "center", flexShrink: 0 },
  laneName: { fontSize: 13.5, fontWeight: 700, color: "var(--color-text-deep)", flex: 1 },
  laneCount: { fontSize: 12, fontWeight: 700, color: "var(--color-text-tertiary)", fontFamily: "var(--font-mono)" },
  lanePurpose: { margin: "0 0 4px", fontSize: 11.5, color: "var(--color-text-tertiary)", lineHeight: 1.45 },
  laneBody: { display: "flex", flexDirection: "column", gap: 8 },
  laneEmpty: { margin: 0, padding: "6px 2px", fontSize: 11.5, fontStyle: "italic", color: "var(--color-text-tertiary)", lineHeight: 1.45 },
  addLabel: { fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--color-text-tertiary)", marginTop: 4 },

  card: {
    display: "flex", flexDirection: "column", gap: 8, padding: "11px 12px", borderRadius: 10, textAlign: "left",
    background: "var(--surface-white)", border: "1px solid var(--color-divider-card)", boxShadow: "var(--shadow-card)",
    cursor: "pointer", fontFamily: "inherit", width: "100%",
  },
  cardTop: { display: "flex", gap: 7, alignItems: "flex-start" },
  grip: { display: "inline-flex", paddingTop: 1, flexShrink: 0 },
  cardInstruction: { fontSize: 13, fontWeight: 600, color: "var(--color-text-deep)", lineHeight: 1.4, flex: 1, minWidth: 0 },
  cardTags: { display: "flex", flexWrap: "wrap", gap: 6 },
  cardFoot: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 },
  noEvidence: { fontSize: 11, fontStyle: "italic", color: "var(--color-text-tertiary)" },
};
