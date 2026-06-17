"use client";

import React from "react";
import { GripVertical, MessageSquareQuote, Target, Pencil } from "lucide-react";
import { TypeTag, RequirementTag, GroundingChip, SuccessChip } from "./GuidedWorkflowBits";
import { SuggestionGrid, AddStepCta } from "./GuidedWorkflowStepDetail";
import { gwEvidence } from "./mocks/guidedWorkflows";

// B · Balanced — Stage board. Five swim-lanes show the shape of the call; a
// pinned outcome lane carries the goal. Cards are draggable (reorder within a
// lane or across into another stage) and open a centered modal for editing.
// Each lane lists its AI suggestion cards + a tinted "Add step" CTA.

export default function GuidedWorkflowBoardEditor({
  meta,
  stagesWithSteps,
  suggestions = [],
  onAcceptSuggestion,
  onOpenStep,
  onAddBlank,
  onReorder,
}) {
  const [expandedSuggest, setExpandedSuggest] = React.useState(null);
  const [dragId, setDragId] = React.useState(null);

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
            <div
              style={styles.laneBody}
              onDragOver={(e) => e.preventDefault()}
            >
              {stage.steps.length === 0 && <p style={styles.laneEmpty}>No steps here yet.</p>}
              {stage.steps.map((step) => (
                <StepCard
                  key={step.id}
                  step={step}
                  onOpen={() => onOpenStep(step.id)}
                  onDragStart={() => setDragId(step.id)}
                  onDragEnd={() => setDragId(null)}
                  onDragEnter={() => { if (dragId && dragId !== step.id) onReorder(dragId, step.id); }}
                />
              ))}
              <SuggestionGrid
                stageId={stage.id}
                suggestions={suggestions}
                columns={1}
                onAccept={onAcceptSuggestion}
                expanded={expandedSuggest}
                onToggle={(id) => setExpandedSuggest((cur) => (cur === id ? null : id))}
              />
              <AddStepCta onClick={() => onAddBlank(stage.id)} />
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

function StepCard({ step, onOpen, onDragStart, onDragEnd, onDragEnter }) {
  const evidence = step.evidence ?? gwEvidence(step.id);
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragEnter={onDragEnter}
      onDragOver={(e) => e.preventDefault()}
      style={styles.card}
    >
      <div style={styles.cardTop}>
        <span style={styles.grip} aria-hidden="true" title="Drag to reorder">
          <GripVertical size={14} color="var(--color-text-placeholder)" />
        </span>
        <span style={styles.cardInstruction}>{step.instruction || "Untitled step"}</span>
        <button type="button" onClick={onOpen} className="gw-focusable" style={styles.editBtn} aria-label={`Edit ${step.instruction || "new step"}`}>
          <Pencil size={13} color="var(--color-text-tertiary)" />
        </button>
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
    </div>
  );
}

const LANE_W = 232;

const styles = {
  scroller: { overflowX: "auto", paddingBottom: 8 },
  board: { display: "flex", gap: 14, alignItems: "flex-start", minWidth: "min-content" },

  outcomeLane: { width: LANE_W, flexShrink: 0, display: "flex", flexDirection: "column", gap: 14, padding: 14, borderRadius: 12, background: "var(--color-icon-tertiary-bg)", border: "1px solid var(--color-border-tab)" },
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
  laneBody: { display: "flex", flexDirection: "column", gap: 8, minHeight: 40 },
  laneEmpty: { margin: 0, padding: "6px 2px", fontSize: 11.5, fontStyle: "italic", color: "var(--color-text-tertiary)" },

  card: { display: "flex", flexDirection: "column", gap: 8, padding: "11px 12px", borderRadius: 10, background: "var(--surface-white)", border: "1px solid var(--color-divider-card)", boxShadow: "var(--shadow-card)", cursor: "grab" },
  cardTop: { display: "flex", gap: 7, alignItems: "flex-start" },
  grip: { display: "inline-flex", paddingTop: 1, flexShrink: 0 },
  cardInstruction: { fontSize: 13, fontWeight: 600, color: "var(--color-text-deep)", lineHeight: 1.4, flex: 1, minWidth: 0 },
  editBtn: { background: "transparent", border: "none", cursor: "pointer", padding: 4, margin: -4, display: "inline-flex", borderRadius: 6, flexShrink: 0 },
  cardTags: { display: "flex", flexWrap: "wrap", gap: 6 },
  cardFoot: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 },
  noEvidence: { fontSize: 11, fontStyle: "italic", color: "var(--color-text-tertiary)" },
};
