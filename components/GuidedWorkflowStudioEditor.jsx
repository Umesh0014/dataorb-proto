"use client";

import React from "react";
import { Plus, MessageSquareQuote, FileText, CornerDownRight, Sparkles } from "lucide-react";
import {
  TypeTag,
  RequirementTag,
  GroundingChip,
  AiMark,
  SuccessChip,
  EvidenceCard,
  SuggestedStepCard,
} from "./GuidedWorkflowBits";
import { GW_TRANSCRIPT, GW_STAGES, gwEvidence } from "./mocks/guidedWorkflows";

// C · Ambitious — Evidence studio. The flat checklist (right) sits beside
// the production evidence it was mined from (left). Grounding becomes
// spatial: select a step and its source turns light up in the transcript;
// select a turn and you can mint a step from it. This is the verifiability
// mechanism made the core interaction — a lead accepts AI output because the
// proof is one glance away — while still honouring "no branching" (the right
// pane is a flat list) and "edit = create" (the left pane is pre-populated).

const STAGE_LABEL = Object.fromEntries(GW_STAGES.map((s) => [s.id, s.label]));

export default function GuidedWorkflowStudioEditor({
  steps,
  suggestions = [],
  onAcceptSuggestion,
  onCycleRequirement,
  onUpdateScript,
  onAddStep,
}) {
  const [selectedStep, setSelectedStep] = React.useState(steps[0]?.id ?? null);
  const [openSuggest, setOpenSuggest] = React.useState(null);

  const selected = steps.find((s) => s.id === selectedStep) || null;
  const selectedEvidence = selected ? selected.evidence ?? gwEvidence(selected.id) : null;
  // Turns that ground the selected step (matched by stepId on the transcript).
  const litTurns = new Set(
    selected ? GW_TRANSCRIPT.filter((t) => t.stepId === selected.id).map((t) => t.id) : [],
  );

  return (
    <div style={styles.split}>
      {/* Left — source evidence */}
      <section style={styles.sourcePane} aria-label="Source interactions">
        <header style={styles.paneHead}>
          <span style={styles.paneTitle}>
            <FileText size={15} color="var(--color-icon-tertiary-fg)" aria-hidden="true" />
            Source evidence
          </span>
          <span style={styles.paneMeta}>12 interactions mined</span>
        </header>
        <div style={styles.transcript}>
          {GW_TRANSCRIPT.map((turn) => {
            const lit = litTurns.has(turn.id);
            return (
              <div key={turn.id} style={{ ...styles.turn, ...(lit ? styles.turnLit : null) }}>
                <span style={{ ...styles.speaker, color: turn.speaker === "agent" ? "var(--color-button-primary-bg)" : "var(--color-text-tertiary)" }}>
                  {turn.speaker === "agent" ? "Agent" : "Customer"}
                </span>
                <p style={styles.turnText}>{turn.text}</p>
                <button type="button" style={styles.mintBtn} onClick={() => onAddStep(turn.stepId)}>
                  <Plus size={12} color="var(--color-button-primary-bg)" />
                  Make a step
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Right — the flat checklist being authored */}
      <section style={styles.listPane} aria-label="Guided workflow steps">
        <header style={styles.paneHead}>
          <span style={styles.paneTitle}>Workflow steps</span>
          <AiMark label="AI-drafted from evidence" />
        </header>
        <span style={styles.selectCue}>Select a step to highlight the calls it was mined from →</span>

        {/* Selection feedback for screen readers (WCAG-10): the lit-turn
            count updates here as the lead moves between steps. */}
        <div role="status" aria-live="polite" style={styles.srOnly}>
          {selected && `Selected: ${selected.instruction}. ${litTurns.size > 0 ? `Grounded in ${litTurns.size} source turns.` : "No source turns — added by hand."}`}
        </div>

        <div style={styles.stepList}>
          {steps.map((step, i) => {
            const isSel = step.id === selectedStep;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setSelectedStep(step.id)}
                style={{ ...styles.stepItem, ...(isSel ? styles.stepItemSel : null) }}
                aria-pressed={isSel}
              >
                <span style={styles.stepIndex}>{i + 1}</span>
                <span style={styles.stepBody}>
                  <span style={styles.stepTopRow}>
                    <span style={styles.stageChip}>{STAGE_LABEL[step.stage]}</span>
                    <TypeTag type={step.type} />
                    <RequirementTag requirement={step.requirement} />
                  </span>
                  <span style={styles.stepInstruction}>{step.instruction}</span>
                  <span style={styles.stepFoot}>
                    <GroundingChip grounding={step.grounding} />
                    <SuccessChip evidence={step.evidence ?? gwEvidence(step.id)} />
                    {step.script && <MessageSquareQuote size={12} color="var(--color-button-primary-bg)" aria-label="Has a script" />}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {suggestions.length > 0 && (
          <div style={styles.suggestTray}>
            <span style={styles.trayHead}>
              <Sparkles size={13} color="var(--color-button-primary-bg)" aria-hidden="true" />
              Suggested from the evidence
            </span>
            {suggestions.map((s) => (
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

        {selected && (
          <div style={styles.inspector}>
            <span style={styles.inspectorHead}>
              <CornerDownRight size={13} color="var(--color-text-tertiary)" aria-hidden="true" />
              {litTurns.size > 0
                ? `Grounded in ${litTurns.size} highlighted turn${litTurns.size > 1 ? "s" : ""} on the left`
                : "No source turns highlighted — added by hand"}
            </span>
            <div style={styles.inspectorActions}>
              <button type="button" onClick={() => onCycleRequirement(selected.id)} style={styles.reqBtn} aria-label="Change requirement">
                <RequirementTag requirement={selected.requirement} />
              </button>
            </div>
            {selected.script != null && (
              <label style={styles.scriptField}>
                <span style={styles.scriptLabel}>
                  <MessageSquareQuote size={13} color="var(--color-button-primary-bg)" aria-hidden="true" />
                  Script {selected.editedByLead && <span style={styles.editedNote}>· edited by you</span>}
                </span>
                <textarea
                  value={selected.script}
                  onChange={(e) => onUpdateScript?.(selected.id, e.target.value)}
                  style={styles.scriptArea}
                  rows={2}
                  aria-label="Step script"
                />
              </label>
            )}
            <EvidenceCard evidence={selectedEvidence} />
          </div>
        )}
      </section>
    </div>
  );
}

const styles = {
  split: {
    display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.05fr)", gap: 16,
    alignItems: "start",
  },
  sourcePane: {
    display: "flex", flexDirection: "column", gap: 10, padding: 14, borderRadius: 12,
    background: "var(--surface-dim)", border: "1px solid var(--color-border-card-soft)",
  },
  listPane: { display: "flex", flexDirection: "column", gap: 10 },
  paneHead: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 },
  paneTitle: { display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13.5, fontWeight: 700, color: "var(--color-text-deep)" },
  paneMeta: { fontSize: 11.5, fontWeight: 600, color: "var(--color-text-tertiary)", fontFamily: "var(--font-mono)" },

  transcript: { display: "flex", flexDirection: "column", gap: 8 },
  turn: {
    position: "relative", display: "flex", flexDirection: "column", gap: 3, padding: "9px 11px",
    borderRadius: 9, background: "var(--surface-white)", border: "1px solid transparent",
    transition: "background 150ms ease, border-color 150ms ease",
  },
  turnLit: { background: "var(--color-icon-tertiary-bg)", border: "1px solid var(--color-icon-tertiary-fg)" },
  speaker: { fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" },
  turnText: { margin: 0, fontSize: 12.5, color: "var(--color-text-medium)", lineHeight: 1.5 },
  mintBtn: {
    alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 4, marginTop: 3,
    background: "transparent", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit",
    fontSize: 11.5, fontWeight: 700, color: "var(--color-button-primary-bg)",
  },

  stepList: { display: "flex", flexDirection: "column", gap: 8 },
  stepItem: {
    display: "flex", gap: 11, padding: "11px 12px", borderRadius: 10, textAlign: "left",
    background: "var(--surface-white)", border: "1px solid var(--color-divider-card)",
    cursor: "pointer", fontFamily: "inherit", transition: "border-color 150ms ease, box-shadow 150ms ease",
  },
  stepItemSel: { border: "1.5px solid var(--color-icon-tertiary-fg)", boxShadow: "var(--shadow-card)" },
  stepIndex: { fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "var(--color-text-tertiary)", paddingTop: 2, flexShrink: 0 },
  stepBody: { display: "flex", flexDirection: "column", gap: 6, minWidth: 0, flex: 1 },
  stepTopRow: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 },
  stageChip: {
    fontSize: 10.5, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase",
    color: "var(--color-text-tertiary)", background: "var(--surface-dim)", borderRadius: 4, padding: "1px 7px",
  },
  stepInstruction: { fontSize: 13.5, fontWeight: 600, color: "var(--color-text-deep)", lineHeight: 1.4 },
  stepFoot: { display: "inline-flex", alignItems: "center", gap: 10 },

  suggestTray: { display: "flex", flexDirection: "column", gap: 10, marginTop: 4 },
  trayHead: {
    display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 700,
    letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--color-button-primary-bg)",
  },
  inspector: {
    display: "flex", flexDirection: "column", gap: 10, padding: "12px 14px", borderRadius: 10,
    background: "var(--surface-dim)", border: "1px solid var(--color-border-card-soft)",
  },
  inspectorHead: { display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 600, color: "var(--color-text-medium)" },
  inspectorActions: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" },
  reqBtn: { background: "transparent", border: "none", padding: 0, cursor: "pointer", display: "inline-flex" },
  scriptField: { display: "flex", flexDirection: "column", gap: 5 },
  scriptLabel: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "var(--color-text-medium)" },
  editedNote: { fontSize: 11, fontWeight: 600, fontStyle: "italic", color: "var(--color-icon-tertiary-fg)" },
  scriptArea: {
    width: "100%", boxSizing: "border-box", resize: "vertical", padding: "9px 11px", borderRadius: 8,
    border: "1px solid var(--color-divider-card)", background: "var(--surface-white)", fontFamily: "var(--font-sans)",
    fontSize: 12.5, color: "var(--color-text-medium)", lineHeight: 1.5,
  },
  selectCue: { fontSize: 12, color: "var(--color-text-tertiary)" },
  srOnly: { position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0 },
};
