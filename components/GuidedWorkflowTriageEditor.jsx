"use client";

import React from "react";
import { Lightbulb, GitBranch, GripVertical, X, FileText, Plus } from "lucide-react";
import { TypeTag, RequirementTag } from "./GuidedWorkflowBits";
import { StepDetailBody, SuggestionGrid, AddStepCta } from "./GuidedWorkflowStepDetail";
import { gwGroupStage } from "./mocks/guidedWorkflows";

// 3-Column · triage canvas + sidecar. The Jun-18 authoring layout: the four
// linear stages (Open / Verify / Discover / Close) are plain checklists; the
// Act stage is TRIAGE — one "field card" column per symptom, laid out side by
// side (non-linear). Each checklist item is a 2-line row with a drag handle
// (reorder the sequence) plus type pill + text and a hint counter; clicking a
// row opens the right sidecar with its hints, type, attribution and a future
// answer-card link. The sidecar appears only on selection — until then the
// canvas runs full width. No branching tree — triage is parallel columns.

// Hints are a step property surfaced in the sidecar: a "say" hint (the
// script), a "best-practice" hint (the knowledge card) and an "if-then" hint
// per conditional sub-step. The row shows only the count.
function hintsOf(step) {
  const out = [];
  if (step.script) out.push("Say");
  if (step.knowledge) out.push("Best practice");
  (step.subSteps || []).forEach(() => out.push("If-then"));
  return out;
}

export default function GuidedWorkflowTriageEditor({
  stagesWithSteps,
  steps,
  suggestions = [],
  onAcceptSuggestion,
  onCycleRequirement,
  onCycleType,
  onUpdateInstruction,
  onRemove,
  onAddBlank,
  onReorder,
}) {
  const [selectedId, setSelectedId] = React.useState(null);
  const [openSuggest, setOpenSuggest] = React.useState(null);
  const [dragId, setDragId] = React.useState(null);
  const [overId, setOverId] = React.useState(null);
  const selected = steps.find((s) => s.id === selectedId) || null;

  const drop = (targetId) => {
    if (dragId && dragId !== targetId) onReorder(dragId, targetId);
    setDragId(null);
    setOverId(null);
  };
  const rowProps = {
    selectedId, onSelect: setSelectedId, dragId, overId,
    onDragStart: setDragId, onDragOver: setOverId, onDrop: drop, onDragEnd: () => { setDragId(null); setOverId(null); },
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.canvas}>
        {stagesWithSteps.map((stage, i) => {
          const { alwaysOn, scenarios } = gwGroupStage(stage.steps);
          const isTriage = scenarios.length > 0;
          return (
            <section key={stage.id} style={styles.stage} aria-label={`${stage.label} stage`}>
              <header style={styles.stageHead}>
                <span style={styles.idx}>{i + 1}</span>
                <span style={styles.stageName}>{stage.label}</span>
                {isTriage && <span style={styles.triageTag}>Triage · {scenarios.length} paths</span>}
                <span style={styles.stageCount}>{stage.steps.length}</span>
              </header>
              <span style={styles.purpose}>{stage.purpose}</span>

              {alwaysOn.map((step) => <StepRow key={step.id} step={step} {...rowProps} />)}

              {isTriage ? (
                <div style={styles.triageGrid}>
                  {scenarios.map((sc) => (
                    <div key={sc.id} style={styles.column}>
                      <div style={styles.colHead}>
                        <span style={styles.colLabel}><GitBranch size={13} color="var(--color-icon-tertiary-fg)" />{sc.label}</span>
                        <span style={styles.colTrigger}>{sc.trigger}</span>
                      </div>
                      {sc.steps.map((step) => <StepRow key={step.id} step={step} compact {...rowProps} />)}
                      <AddStepCta onClick={() => onAddBlank(stage.id)} label="Add step" />
                    </div>
                  ))}
                </div>
              ) : (
                <AddStepCta onClick={() => onAddBlank(stage.id)} label={`Add a step to ${stage.label}`} />
              )}

              {suggestions.some((s) => s.stage === stage.id) && (
                <>
                  <span style={styles.subLabel}>Suggested for {stage.label}</span>
                  <SuggestionGrid stageId={stage.id} suggestions={suggestions} columns={isTriage ? 3 : 2} onAccept={onAcceptSuggestion} expanded={openSuggest} onToggle={(id) => setOpenSuggest((c) => (c === id ? null : id))} />
                </>
              )}
            </section>
          );
        })}
      </div>

      {selected && (
        <aside style={styles.sidecar} aria-label="Step sidecar">
          <Sidecar
            step={selected}
            onClose={() => setSelectedId(null)}
            onUpdateInstruction={onUpdateInstruction}
            onCycleType={onCycleType}
            onCycleRequirement={onCycleRequirement}
            onRemove={(id) => { onRemove(id); setSelectedId(null); }}
          />
        </aside>
      )}
    </div>
  );
}

function StepRow({ step, compact, selectedId, onSelect, dragId, overId, onDragStart, onDragOver, onDrop, onDragEnd }) {
  const hints = hintsOf(step);
  const isSel = selectedId === step.id;
  const isOver = overId === step.id && dragId !== step.id;
  const isDragging = dragId === step.id;
  return (
    <div
      draggable
      onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; onDragStart(step.id); }}
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; onDragOver(step.id); }}
      onDrop={(e) => { e.preventDefault(); onDrop(step.id); }}
      onDragEnd={onDragEnd}
      style={{
        ...styles.row,
        ...(compact ? styles.rowCompact : null),
        ...(isSel ? styles.rowSelected : null),
        ...(isOver ? styles.rowOver : null),
        ...(isDragging ? styles.rowDragging : null),
      }}
    >
      <span style={styles.grip} aria-hidden="true"><GripVertical size={16} color="var(--color-text-placeholder)" /></span>
      <button type="button" onClick={() => onSelect(step.id)} className="gw-focusable" style={styles.rowMain} aria-pressed={isSel}>
        <span style={styles.line1}>
          <TypeTag type={step.type} />
          <span style={styles.instruction}>{step.instruction || "Untitled step"}</span>
        </span>
        <span style={styles.line2}>
          <span style={styles.hintCount}>
            <Lightbulb size={12} color={hints.length ? "var(--color-icon-tertiary-fg)" : "var(--color-text-placeholder)"} />
            {hints.length ? `${hints.length} hint${hints.length > 1 ? "s" : ""}` : "No hints"}
          </span>
          {step.requirement === "required" && <RequirementTag requirement="required" />}
        </span>
      </button>
    </div>
  );
}

function Sidecar({ step, onClose, ...handlers }) {
  const hints = hintsOf(step);
  return (
    <div style={styles.scInner}>
      <header style={styles.scHead}>
        <span style={styles.scKicker}>Step sidecar</span>
        <button type="button" onClick={onClose} className="gw-focusable" style={styles.scClose} aria-label="Close sidecar"><X size={16} color="var(--color-text-tertiary)" /></button>
      </header>

      <div style={styles.scHints}>
        <span style={styles.scHintsLabel}><Lightbulb size={13} color="var(--color-icon-tertiary-fg)" />{hints.length} hint{hints.length === 1 ? "" : "s"}</span>
        <span style={styles.scHintTypes}>{hints.length ? hints.join(" · ") : "None yet"}</span>
      </div>

      <StepDetailBody step={step} {...handlers} />

      <button type="button" style={styles.answerCard} className="gw-focusable">
        <FileText size={15} color="var(--color-button-primary-bg)" />
        <span style={styles.answerCardText}>Link an answer card</span>
        <Plus size={15} color="var(--color-text-tertiary)" style={{ marginLeft: "auto" }} />
      </button>
    </div>
  );
}

const styles = {
  wrap: { display: "flex", gap: 24, alignItems: "flex-start" },
  canvas: { display: "flex", flexDirection: "column", gap: 22, flex: 1, minWidth: 0 },
  stage: { display: "flex", flexDirection: "column", gap: 8 },
  stageHead: { display: "flex", alignItems: "center", gap: 9 },
  idx: { width: 22, height: 22, borderRadius: 6, background: "var(--color-icon-tertiary-bg)", color: "var(--color-icon-tertiary-fg)", fontSize: 12, fontWeight: 700, display: "inline-grid", placeItems: "center", flexShrink: 0 },
  stageName: { fontSize: 15, fontWeight: 700, color: "var(--color-text-deep)" },
  triageTag: { fontSize: 10.5, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--color-icon-tertiary-fg)", background: "var(--color-icon-tertiary-bg)", borderRadius: 4, padding: "2px 7px" },
  stageCount: { marginLeft: "auto", fontSize: 12, fontWeight: 700, color: "var(--color-text-tertiary)", fontFamily: "var(--font-mono)" },
  purpose: { fontSize: 12.5, color: "var(--color-text-tertiary)", lineHeight: 1.5, paddingLeft: 31, marginTop: -2, marginBottom: 2 },

  triageGrid: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12, alignItems: "start" },
  column: { display: "flex", flexDirection: "column", gap: 8, padding: 12, borderRadius: 12, background: "var(--surface-dim)", border: "1px solid var(--color-border-tab)" },
  colHead: { display: "flex", flexDirection: "column", gap: 3, paddingBottom: 2 },
  colLabel: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "var(--color-text-deep)" },
  colTrigger: { fontSize: 11.5, color: "var(--color-text-tertiary)", lineHeight: 1.4 },

  row: { display: "flex", gap: 8, padding: "10px 12px", borderRadius: 10, background: "var(--surface-white)", border: "1px solid var(--color-divider-card)", boxSizing: "border-box" },
  rowCompact: { padding: "9px 10px" },
  rowSelected: { borderColor: "var(--color-button-primary-bg)", background: "var(--color-primary-alpha-12)" },
  rowOver: { boxShadow: "inset 0 2px 0 var(--color-button-primary-bg)" },
  rowDragging: { opacity: 0.5 },
  grip: { display: "inline-flex", alignItems: "flex-start", paddingTop: 2, cursor: "grab", flexShrink: 0 },
  rowMain: { display: "flex", flexDirection: "column", gap: 6, minWidth: 0, flex: 1, background: "transparent", border: "none", padding: 0, margin: 0, cursor: "pointer", textAlign: "left", fontFamily: "inherit" },
  line1: { display: "flex", alignItems: "flex-start", gap: 7, flexWrap: "wrap" },
  instruction: { fontSize: 13.5, fontWeight: 600, color: "var(--color-text-deep)", lineHeight: 1.4 },
  line2: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  hintCount: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 600, color: "var(--color-text-tertiary)" },

  subLabel: { fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--color-text-tertiary)", marginTop: 6, paddingLeft: 31 },

  sidecar: { width: 340, flexShrink: 0, position: "sticky", top: 16, alignSelf: "flex-start" },
  scInner: { display: "flex", flexDirection: "column", gap: 14, padding: 16, borderRadius: 14, background: "var(--surface-white)", border: "1px solid var(--color-divider-card)", boxShadow: "var(--shadow-card)" },
  scHead: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  scKicker: { fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--color-text-tertiary)" },
  scClose: { background: "transparent", border: "none", cursor: "pointer", padding: 6, margin: -6, borderRadius: 6, display: "inline-flex" },
  scHints: { display: "flex", flexDirection: "column", gap: 3, padding: "10px 12px", borderRadius: 10, background: "var(--color-icon-tertiary-bg)" },
  scHintsLabel: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 700, color: "var(--color-icon-tertiary-fg)" },
  scHintTypes: { fontSize: 11.5, color: "var(--color-text-tertiary)", paddingLeft: 19 },
  answerCard: { display: "flex", alignItems: "center", gap: 9, padding: "11px 12px", borderRadius: 10, border: "1px dashed var(--color-divider-card)", background: "transparent", cursor: "pointer", fontFamily: "inherit", width: "100%", boxSizing: "border-box" },
  answerCardText: { fontSize: 13, fontWeight: 600, color: "var(--color-text-medium)" },
};
