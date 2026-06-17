"use client";

import React from "react";
import { ChevronDown, ChevronRight, GripVertical } from "lucide-react";
import { TypeTag, RequirementTag, GroundingChip, SuccessChip } from "./GuidedWorkflowBits";
import { AddStepCards } from "./GuidedWorkflowStepDrawer";
import { gwEvidence } from "./mocks/guidedWorkflows";

// A · Safe — Checklist editor. One flat list grouped by the five stages
// (Asana-simple). Each step is a draggable row: drag the handle to reorder
// (within or across stages); click the row to open it in the side-curtain
// drawer for editing. Under every stage, the AI suggestions for that stage
// plus a blank-step option render as CARDS (not strips) so adding a step is
// always a card-based, evidence-led choice. Every step carries its success
// rate; mutations are owned by the host.

export default function GuidedWorkflowChecklistEditor({
  stagesWithSteps,
  suggestions = [],
  onAcceptSuggestion,
  onOpenStep,
  onAddBlank,
  onReorder,
}) {
  const [collapsed, setCollapsed] = React.useState({});
  const [expandedSuggest, setExpandedSuggest] = React.useState(null);
  const [dragId, setDragId] = React.useState(null);

  const toggleStage = (id) => setCollapsed((c) => ({ ...c, [id]: !c[id] }));

  return (
    <div style={styles.wrap}>
      {stagesWithSteps.map((stage, stageIdx) => {
        const isCollapsed = collapsed[stage.id];
        return (
          <section key={stage.id} style={styles.stage} aria-label={`${stage.label} stage`}>
            <header style={styles.stageHead}>
              <button type="button" onClick={() => toggleStage(stage.id)} className="gw-focusable" style={styles.stageToggle} aria-expanded={!isCollapsed}>
                <span style={styles.stageIndex}>{stageIdx + 1}</span>
                <span style={styles.stageName}>{stage.label}</span>
                <span style={styles.stageCount}>{stage.steps.length} steps</span>
                <ChevronDown size={16} color="var(--color-text-tertiary)" style={{ transform: isCollapsed ? "rotate(-90deg)" : "none", transition: "transform 150ms ease" }} />
              </button>
              <span style={styles.stagePurpose}>{stage.purpose}</span>
            </header>

            {!isCollapsed && (
              <div style={styles.rows}>
                {stage.steps.map((step) => (
                  <StepRow
                    key={step.id}
                    step={step}
                    dragging={dragId === step.id}
                    onOpen={() => onOpenStep(step.id)}
                    onDragStart={() => setDragId(step.id)}
                    onDragEnd={() => setDragId(null)}
                    onDrop={() => { if (dragId) onReorder(dragId, step.id); setDragId(null); }}
                  />
                ))}

                <span style={styles.addLabel}>Add a step to {stage.label}</span>
                <AddStepCards
                  stageId={stage.id}
                  suggestions={suggestions}
                  onAccept={onAcceptSuggestion}
                  onAddBlank={onAddBlank}
                  expandedSuggest={expandedSuggest}
                  onToggleSuggest={(id) => setExpandedSuggest((cur) => (cur === id ? null : id))}
                />
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

function StepRow({ step, dragging, onOpen, onDragStart, onDragEnd, onDrop }) {
  const evidence = step.evidence ?? gwEvidence(step.id);
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      style={{ ...styles.row, opacity: dragging ? 0.5 : 1 }}
    >
      <span style={styles.grip} aria-hidden="true" title="Drag to reorder">
        <GripVertical size={16} color="var(--color-text-placeholder)" />
      </span>
      <button type="button" onClick={onOpen} className="gw-focusable" style={styles.rowBtn} aria-label={`Open ${step.instruction || "new step"}`}>
        <span style={styles.rowMain}>
          <span style={styles.instruction}>{step.instruction || "Untitled step"}</span>
          <span style={styles.rowMeta}>
            <TypeTag type={step.type} />
            <RequirementTag requirement={step.requirement} />
            <GroundingChip grounding={step.grounding} />
            <SuccessChip evidence={evidence} />
          </span>
        </span>
        <ChevronRight size={18} color="var(--color-text-tertiary)" style={{ flexShrink: 0 }} />
      </button>
    </div>
  );
}

const styles = {
  wrap: { display: "flex", flexDirection: "column", gap: 20 },
  stage: { display: "flex", flexDirection: "column", gap: 10 },
  stageHead: { display: "flex", flexDirection: "column", gap: 2 },
  stageToggle: { display: "inline-flex", alignItems: "center", gap: 10, background: "transparent", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" },
  stageIndex: { width: 22, height: 22, borderRadius: 6, background: "var(--color-icon-tertiary-bg)", color: "var(--color-icon-tertiary-fg)", fontSize: 12, fontWeight: 700, display: "inline-grid", placeItems: "center", flexShrink: 0 },
  stageName: { fontSize: 15, fontWeight: 700, color: "var(--color-text-deep)" },
  stageCount: { fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)" },
  stagePurpose: { fontSize: 12.5, color: "var(--color-text-tertiary)", lineHeight: 1.5, paddingLeft: 32 },
  rows: { display: "flex", flexDirection: "column", gap: 8, paddingLeft: 32 },
  row: { display: "flex", gap: 10, alignItems: "stretch", background: "var(--surface-white)", border: "1px solid var(--color-divider-card)", borderRadius: 10 },
  grip: { display: "inline-flex", alignItems: "center", paddingLeft: 10, cursor: "grab", flexShrink: 0 },
  rowBtn: { flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 12, background: "transparent", border: "none", cursor: "pointer", padding: "12px 14px 12px 0", fontFamily: "inherit", textAlign: "left" },
  rowMain: { display: "flex", flexDirection: "column", gap: 7, minWidth: 0, flex: 1 },
  instruction: { fontSize: 14, fontWeight: 600, color: "var(--color-text-deep)", lineHeight: 1.4 },
  rowMeta: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" },
  addLabel: { fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--color-text-tertiary)", marginTop: 4 },
};
