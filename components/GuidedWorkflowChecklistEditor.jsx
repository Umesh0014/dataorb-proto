"use client";

import React from "react";
import { ChevronDown, GripVertical } from "lucide-react";
import { TypeTag, RequirementTag, GroundingChip, SuccessChip } from "./GuidedWorkflowBits";
import { StepDetailBody, SuggestionGrid, AddStepCta } from "./GuidedWorkflowStepDetail";
import { gwEvidence } from "./mocks/guidedWorkflows";

// A · Safe — Checklist editor. One flat list grouped by the five stages.
// Steps are full-width draggable rows that PHYSICALLY reorder as you drag
// (no transparency); clicking a row expands it in place to edit (title,
// type, requirement, script-as-evidence, knowledge, evidence, sub-steps,
// delete) — editing stays "in the card." The stage's AI suggestions render
// as a 3-across card grid you can glance and add; a tinted "Add step" CTA
// adds a blank one. Mutations owned by the host.

export default function GuidedWorkflowChecklistEditor({
  stagesWithSteps,
  suggestions = [],
  onAcceptSuggestion,
  onCycleRequirement,
  onCycleType,
  onUpdateInstruction,
  onRemove,
  onAddBlank,
  onReorder,
  onMove,
}) {
  const [collapsed, setCollapsed] = React.useState({});
  const [openId, setOpenId] = React.useState(null);
  const [expandedSuggest, setExpandedSuggest] = React.useState(null);
  const [dragId, setDragId] = React.useState(null);

  const toggleStage = (id) => setCollapsed((c) => ({ ...c, [id]: !c[id] }));
  const toggleOpen = (id) => setOpenId((cur) => (cur === id ? null : id));

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
                    open={openId === step.id}
                    onToggle={() => toggleOpen(step.id)}
                    onDragStart={() => setDragId(step.id)}
                    onDragEnd={() => setDragId(null)}
                    onDragEnter={() => { if (dragId && dragId !== step.id) onReorder(dragId, step.id); }}
                    onMove={onMove}
                    handlers={{ onCycleRequirement, onCycleType, onUpdateInstruction, onRemove }}
                  />
                ))}

                {suggestions.some((s) => s.stage === stage.id) && (
                  <>
                    <span style={styles.subLabel}>Suggested steps</span>
                    <SuggestionGrid
                      stageId={stage.id}
                      suggestions={suggestions}
                      columns={3}
                      onAccept={onAcceptSuggestion}
                      expanded={expandedSuggest}
                      onToggle={(id) => setExpandedSuggest((cur) => (cur === id ? null : id))}
                    />
                  </>
                )}
                <AddStepCta onClick={() => onAddBlank(stage.id)} label={`Add step to ${stage.label}`} />
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

function StepRow({ step, open, onToggle, onDragStart, onDragEnd, onDragEnter, onMove, handlers }) {
  const evidence = step.evidence ?? gwEvidence(step.id);
  const onGripKey = (e) => {
    if (e.key === "ArrowUp") { e.preventDefault(); onMove(step.id, "up"); }
    else if (e.key === "ArrowDown") { e.preventDefault(); onMove(step.id, "down"); }
  };
  return (
    <div
      draggable={!open}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragEnter={onDragEnter}
      onDragOver={(e) => e.preventDefault()}
      style={{ ...styles.row, ...(open ? styles.rowOpen : null) }}
    >
      <div style={styles.rowSummary}>
        <button type="button" className="gw-focusable" style={styles.grip} onKeyDown={onGripKey} aria-label={`Reorder ${step.instruction || "step"} — press up or down arrow to move`}>
          <GripVertical size={16} color="var(--color-text-placeholder)" />
        </button>
        <button type="button" onClick={onToggle} className="gw-focusable" style={styles.rowBtn} aria-expanded={open} aria-label={`${open ? "Close" : "Edit"} ${step.instruction || "new step"}`}>
          <span style={styles.rowMain}>
            <span style={styles.instruction}>{step.instruction || "Untitled step"}</span>
            <span style={styles.rowMeta}>
              <TypeTag type={step.type} />
              <RequirementTag requirement={step.requirement} />
              <GroundingChip grounding={step.grounding} />
              <SuccessChip evidence={evidence} />
            </span>
          </span>
          <ChevronDown size={18} color="var(--color-text-tertiary)" style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform 150ms ease" }} />
        </button>
      </div>
      {open && (
        <div style={styles.rowDetail}>
          <StepDetailBody step={step} {...handlers} />
        </div>
      )}
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
  row: { background: "var(--surface-white)", border: "1px solid var(--color-divider-card)", borderRadius: 10 },
  rowOpen: { borderColor: "var(--color-icon-tertiary-fg)", boxShadow: "var(--shadow-card)" },
  rowSummary: { display: "flex", gap: 10, alignItems: "stretch" },
  grip: { display: "inline-flex", alignItems: "center", padding: "0 6px 0 10px", cursor: "grab", flexShrink: 0, background: "transparent", border: "none", borderRadius: 8 },
  rowBtn: { flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 12, background: "transparent", border: "none", cursor: "pointer", padding: "12px 14px 12px 0", fontFamily: "inherit", textAlign: "left" },
  rowMain: { display: "flex", flexDirection: "column", gap: 7, minWidth: 0, flex: 1 },
  instruction: { fontSize: 14, fontWeight: 600, color: "var(--color-text-deep)", lineHeight: 1.4 },
  rowMeta: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" },
  rowDetail: { padding: "4px 16px 16px 16px", borderTop: "1px solid var(--color-divider-card)", marginTop: 2 },
  subLabel: { fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--color-text-tertiary)", marginTop: 4 },
};
