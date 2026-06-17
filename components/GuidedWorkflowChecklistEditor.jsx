"use client";

import React from "react";
import { ChevronDown, GripVertical, Plus, MessageSquareQuote, BookOpen, Trash2, BarChart3 } from "lucide-react";
import {
  TypeTag,
  RequirementTag,
  GroundingChip,
  SuccessChip,
  EvidenceCard,
  SuggestedStepCard,
} from "./GuidedWorkflowBits";
import { gwEvidence } from "./mocks/guidedWorkflows";

// A · Safe — Checklist editor. The most literal reading of "as easy as a
// checklist in Asana": one flat vertical list, grouped by the five stages
// as collapsible sections. Each step is an inline row — instruction primary,
// type / requirement / grounding tags inline, the script and any conditional
// sub-steps as a progressive reveal. Add-step sits at the foot of each
// stage. Direct manipulation, no canvas, highest component reuse.
//
// Mutations are owned by the host (GuidedWorkflowsPage) so edits survive a
// variant switch; this editor owns only its expand/collapse UI state.

export default function GuidedWorkflowChecklistEditor({
  stagesWithSteps,
  suggestions = [],
  onAcceptSuggestion,
  onCycleRequirement,
  onUpdateScript,
  onAddStep,
  onRemoveStep,
}) {
  const [collapsed, setCollapsed] = React.useState({});
  const [openScript, setOpenScript] = React.useState(null);
  const [openEvidence, setOpenEvidence] = React.useState(null);
  const [openSuggest, setOpenSuggest] = React.useState(null);

  const toggleStage = (id) => setCollapsed((c) => ({ ...c, [id]: !c[id] }));
  const toggleScript = (id) => setOpenScript((cur) => (cur === id ? null : id));
  const toggleEvidence = (id) => setOpenEvidence((cur) => (cur === id ? null : id));

  return (
    <div style={styles.wrap}>
      {stagesWithSteps.map((stage, stageIdx) => {
        const isCollapsed = collapsed[stage.id];
        return (
          <section key={stage.id} style={styles.stage} aria-label={`${stage.label} stage`}>
            <header style={styles.stageHead}>
              <button
                type="button"
                onClick={() => toggleStage(stage.id)}
                className="gw-focusable"
                style={styles.stageToggle}
                aria-expanded={!isCollapsed}
              >
                <span style={styles.stageIndex}>{stageIdx + 1}</span>
                <span style={styles.stageName}>{stage.label}</span>
                <span style={styles.stageCount}>{stage.steps.length} steps</span>
                <ChevronDown
                  size={16}
                  color="var(--color-text-tertiary)"
                  style={{ transform: isCollapsed ? "rotate(-90deg)" : "none", transition: "transform 150ms ease" }}
                />
              </button>
              <span style={styles.stagePurpose}>{stage.purpose}</span>
            </header>

            {!isCollapsed && (
              <div style={styles.rows}>
                {stage.steps.map((step) => (
                  <StepRow
                    key={step.id}
                    step={step}
                    scriptOpen={openScript === step.id}
                    evidenceOpen={openEvidence === step.id}
                    onToggleScript={() => toggleScript(step.id)}
                    onToggleEvidence={() => toggleEvidence(step.id)}
                    onCycleRequirement={() => onCycleRequirement(step.id)}
                    onUpdateScript={onUpdateScript}
                    onRemove={() => onRemoveStep(step.id)}
                  />
                ))}
                <button type="button" style={styles.addRow} className="gw-focusable" onClick={() => onAddStep(stage.id)}>
                  <Plus size={15} color="var(--color-button-primary-bg)" />
                  Add a step to {stage.label}
                </button>

                {suggestions
                  .filter((s) => s.stage === stage.id)
                  .map((s) => (
                    <SuggestedStepCard
                      key={s.id}
                      step={s}
                      expanded={openSuggest === s.id}
                      onToggle={() => setOpenSuggest((cur) => (cur === s.id ? null : s.id))}
                      onAdd={() => onAcceptSuggestion(s.id)}
                    />
                  ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

function StepRow({ step, scriptOpen, evidenceOpen, onToggleScript, onToggleEvidence, onCycleRequirement, onUpdateScript, onRemove }) {
  const evidence = step.evidence ?? gwEvidence(step.id);
  const [confirming, setConfirming] = React.useState(false);
  return (
    <div style={styles.row}>
      <span style={styles.grip} aria-hidden="true">
        <GripVertical size={16} color="var(--color-text-placeholder)" />
      </span>
      <div style={styles.rowMain}>
        <div style={styles.rowTop}>
          <span style={styles.instruction}>{step.instruction}</span>
          <div style={styles.rowTags}>
            <TypeTag type={step.type} />
            {/* Requirement is the contract the agent-side eval reads — make it
                a one-tap cycle so tagging is frictionless. */}
            <button
              type="button"
              onClick={onCycleRequirement}
              className="gw-focusable"
              style={styles.reqBtn}
              title="Cycle requirement"
              aria-label={`Requirement: ${step.requirement}. Tap to change.`}
            >
              <RequirementTag requirement={step.requirement} />
            </button>
          </div>
        </div>
        <span style={styles.detail}>{step.detail}</span>

        {step.subSteps.length > 0 && (
          <ul style={styles.subList}>
            {step.subSteps.map((sub) => (
              <li key={sub.id} style={styles.subItem}>
                <span style={styles.subBullet} aria-hidden="true" />
                {sub.label}
              </li>
            ))}
          </ul>
        )}

        <div style={styles.rowFoot}>
          <GroundingChip grounding={step.grounding} />
          <SuccessChip evidence={evidence} />
          {step.script && (
            <button type="button" onClick={onToggleScript} className="gw-focusable" style={styles.linkBtn} aria-expanded={scriptOpen}>
              <MessageSquareQuote size={13} color="var(--color-button-primary-bg)" />
              {scriptOpen ? "Hide script" : "Script"}
            </button>
          )}
          {evidence && (
            <button type="button" onClick={onToggleEvidence} className="gw-focusable" style={styles.linkBtn} aria-expanded={evidenceOpen}>
              <BarChart3 size={13} color="var(--color-button-primary-bg)" />
              {evidenceOpen ? "Hide evidence" : "Evidence"}
            </button>
          )}
          {step.knowledge && (
            <span style={styles.knowledgeChip}>
              <BookOpen size={12} color="var(--color-icon-tertiary-fg)" />
              {step.knowledge.title}
            </span>
          )}
          <div style={{ flex: 1 }} />
          {confirming ? (
            <span style={styles.confirmRow}>
              <span style={styles.confirmLabel}>Remove?</span>
              <button type="button" onClick={onRemove} className="gw-focusable" style={styles.confirmYes}>Remove</button>
              <button type="button" onClick={() => setConfirming(false)} className="gw-focusable" style={styles.confirmNo}>Keep</button>
            </span>
          ) : (
            <button type="button" onClick={() => setConfirming(true)} className="gw-focusable" style={styles.iconGhost} aria-label="Remove step">
              <Trash2 size={14} color="var(--color-text-tertiary)" />
            </button>
          )}
        </div>

        {scriptOpen && step.script != null && (
          <>
            <textarea
              value={step.script}
              onChange={(e) => onUpdateScript?.(step.id, e.target.value)}
              style={styles.scriptArea}
              aria-label="Step script"
              rows={2}
            />
            {step.editedByLead && <span style={styles.editedNote}>Edited by you · overrides the AI draft</span>}
          </>
        )}
        {evidenceOpen && <EvidenceCard evidence={evidence} />}
      </div>
    </div>
  );
}

const styles = {
  wrap: { display: "flex", flexDirection: "column", gap: 20 },
  stage: { display: "flex", flexDirection: "column", gap: 10 },
  stageHead: { display: "flex", flexDirection: "column", gap: 2 },
  stageToggle: {
    display: "inline-flex", alignItems: "center", gap: 10, background: "transparent",
    border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit",
  },
  stageIndex: {
    width: 22, height: 22, borderRadius: 6, background: "var(--color-icon-tertiary-bg)",
    color: "var(--color-icon-tertiary-fg)", fontSize: 12, fontWeight: 700,
    display: "inline-grid", placeItems: "center", flexShrink: 0,
  },
  stageName: { fontSize: 15, fontWeight: 700, color: "var(--color-text-deep)" },
  stageCount: { fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)" },
  stagePurpose: { fontSize: 12.5, color: "var(--color-text-tertiary)", lineHeight: 1.5, paddingLeft: 32 },
  rows: { display: "flex", flexDirection: "column", gap: 8, paddingLeft: 32 },
  row: {
    display: "flex", gap: 10, padding: "12px 14px", borderRadius: 10,
    background: "var(--surface-white)", border: "1px solid var(--color-divider-card)",
  },
  grip: { display: "inline-flex", paddingTop: 2, cursor: "grab", flexShrink: 0 },
  rowMain: { display: "flex", flexDirection: "column", gap: 6, minWidth: 0, flex: 1 },
  rowTop: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" },
  instruction: { fontSize: 14, fontWeight: 600, color: "var(--color-text-deep)", lineHeight: 1.4 },
  rowTags: { display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0 },
  reqBtn: { background: "transparent", border: "none", padding: 0, cursor: "pointer", display: "inline-flex" },
  detail: { fontSize: 12.5, color: "var(--color-text-tertiary)", lineHeight: 1.5 },
  subList: { listStyle: "none", margin: "2px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 5 },
  subItem: { display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--color-text-medium)" },
  subBullet: { width: 5, height: 5, borderRadius: 999, background: "var(--color-icon-tertiary-fg)", flexShrink: 0 },
  rowFoot: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginTop: 2 },
  linkBtn: {
    display: "inline-flex", alignItems: "center", gap: 5, background: "transparent", border: "none",
    cursor: "pointer", padding: 0, fontFamily: "inherit", fontSize: 12.5, fontWeight: 700, color: "var(--color-button-primary-bg)",
  },
  knowledgeChip: {
    display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 600,
    color: "var(--color-icon-tertiary-fg)",
  },
  iconGhost: { background: "transparent", border: "none", cursor: "pointer", padding: 10, margin: -6, display: "inline-flex", borderRadius: 8 },
  confirmRow: { display: "inline-flex", alignItems: "center", gap: 8 },
  confirmLabel: { fontSize: 12, fontWeight: 600, color: "var(--color-text-medium)" },
  confirmYes: {
    background: "transparent", border: "none", cursor: "pointer", padding: "4px 6px", fontFamily: "inherit",
    fontSize: 12.5, fontWeight: 700, color: "var(--color-error-text)",
  },
  confirmNo: {
    background: "transparent", border: "none", cursor: "pointer", padding: "4px 6px", fontFamily: "inherit",
    fontSize: 12.5, fontWeight: 700, color: "var(--color-text-medium)",
  },
  editedNote: { fontSize: 11, fontWeight: 600, color: "var(--color-icon-tertiary-fg)" },
  scriptArea: {
    marginTop: 4, width: "100%", boxSizing: "border-box", resize: "vertical",
    padding: "10px 12px", borderRadius: 8, border: "1px solid var(--color-divider-card)",
    background: "var(--surface-dim)", fontFamily: "var(--font-sans)", fontSize: 13,
    color: "var(--color-text-medium)", lineHeight: 1.5,
  },
  addRow: {
    display: "inline-flex", alignItems: "center", gap: 8, alignSelf: "flex-start",
    background: "transparent", border: "1px dashed var(--color-divider-card)", borderRadius: 10,
    padding: "9px 14px", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600,
    color: "var(--color-button-primary-bg)",
  },
};
