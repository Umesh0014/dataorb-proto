"use client";

import React from "react";
import { ChevronRight } from "lucide-react";
import {
  TypeTag,
  RequirementTag,
  GroundingChip,
  ScriptQuote,
  EvidenceCard,
  SuccessChip,
} from "./GuidedWorkflowBits";
import { AddStepCards } from "./GuidedWorkflowStepDrawer";
import { gwEvidence } from "./mocks/guidedWorkflows";

// C · Ambitious — Evidence studio. LEFT: a high-level outline of the whole
// workflow, grouped by the five stages, so the lead reads it like a table of
// contents (Open has 3 steps, Discover has 3…). Click a step and the RIGHT
// pane becomes that step's evidence workspace: the success rate, the actual
// agent phrasing it was mined from (quoted, read-only), the knowledge card,
// and — mined from that same evidence — suggested steps to add, each with a
// one-click Add. Verifiability and authoring happen side by side.

export default function GuidedWorkflowStudioEditor({
  stagesWithSteps,
  steps,
  suggestions = [],
  onAcceptSuggestion,
  onCycleRequirement,
  onCycleType,
  onUpdateInstruction,
  onAddBlank,
}) {
  const [selectedId, setSelectedId] = React.useState(steps[0]?.id ?? null);
  const [expandedSuggest, setExpandedSuggest] = React.useState(null);

  const selected = steps.find((s) => s.id === selectedId) || null;
  const evidence = selected ? selected.evidence ?? gwEvidence(selected.id) : null;
  const stageSuggestions = selected ? suggestions.filter((s) => s.stage === selected.stage) : [];

  return (
    <div style={styles.split}>
      {/* Left — stage-grouped outline */}
      <section style={styles.outline} aria-label="Workflow outline">
        <span style={styles.outlineHead}>Workflow steps</span>
        {stagesWithSteps.map((stage) => (
          <div key={stage.id} style={styles.stageGroup}>
            <div style={styles.stageRow}>
              <span style={styles.stageName}>{stage.label}</span>
              <span style={styles.stageCount}>{stage.steps.length}</span>
            </div>
            <div style={styles.stageSteps}>
              {stage.steps.length === 0 && <span style={styles.stageEmpty}>No steps yet</span>}
              {stage.steps.map((step) => {
                const isSel = step.id === selectedId;
                const ev = step.evidence ?? gwEvidence(step.id);
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => setSelectedId(step.id)}
                    className="gw-focusable"
                    style={{ ...styles.outlineItem, ...(isSel ? styles.outlineItemSel : null) }}
                    aria-pressed={isSel}
                  >
                    <span style={styles.outlineLabel}>{step.instruction || "Untitled step"}</span>
                    {ev && <SuccessChip evidence={ev} />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      {/* Right — selected step's evidence + add-from-evidence */}
      <section style={styles.detail} aria-label="Step evidence">
        <div role="status" aria-live="polite" style={styles.srOnly}>
          {selected && `Selected ${selected.instruction || "new step"}. ${evidence ? `${evidence.successRate}% success across ${evidence.callCount} calls.` : "No evidence yet."}`}
        </div>

        {selected ? (
          <>
            <header style={styles.detailHead}>
              <input
                value={selected.instruction}
                onChange={(e) => onUpdateInstruction?.(selected.id, e.target.value)}
                style={styles.titleInput}
                aria-label="Step instruction"
                placeholder="What should the agent do?"
              />
              <div style={styles.detailTags}>
                <button type="button" onClick={() => onCycleType?.(selected.id)} className="gw-focusable" style={styles.tagBtn} aria-label={`Type: ${selected.type}. Tap to change.`}>
                  <TypeTag type={selected.type} />
                </button>
                <button type="button" onClick={() => onCycleRequirement?.(selected.id)} className="gw-focusable" style={styles.tagBtn} aria-label={`Requirement: ${selected.requirement}. Tap to change.`}>
                  <RequirementTag requirement={selected.requirement} />
                </button>
                <GroundingChip grounding={selected.grounding} />
              </div>
            </header>

            {selected.script && (
              <section style={styles.block}>
                <span style={styles.blockLabel}>Script — what agents actually said</span>
                <ScriptQuote script={selected.script} grounding={selected.grounding} />
              </section>
            )}

            {selected.knowledge && (
              <section style={styles.block}>
                <span style={styles.blockLabel}>Knowledge</span>
                <div style={styles.knowledge}>
                  <span style={styles.knowledgeTitle}>{selected.knowledge.title}</span>
                  <p style={styles.knowledgeBody}>{selected.knowledge.body}</p>
                </div>
              </section>
            )}

            <section style={styles.block}>
              <span style={styles.blockLabel}>Evidence</span>
              <EvidenceCard evidence={evidence} />
            </section>

            <section style={styles.block}>
              <span style={styles.blockLabel}>Add a step to {stageLabel(stagesWithSteps, selected.stage)}, mined from the evidence</span>
              <AddStepCards
                stageId={selected.stage}
                suggestions={suggestions}
                onAccept={onAcceptSuggestion}
                onAddBlank={onAddBlank}
                expandedSuggest={expandedSuggest}
                onToggleSuggest={(id) => setExpandedSuggest((cur) => (cur === id ? null : id))}
              />
              {stageSuggestions.length === 0 && (
                <span style={styles.noSuggest}>No more suggestions for this stage — add a blank step above.</span>
              )}
            </section>
          </>
        ) : (
          <p style={styles.placeholder}>Select a step on the left to see its evidence and what you can add.</p>
        )}
      </section>
    </div>
  );
}

function stageLabel(stages, id) {
  return stages.find((s) => s.id === id)?.label ?? id;
}

const styles = {
  split: { display: "grid", gridTemplateColumns: "minmax(0, 0.8fr) minmax(0, 1.2fr)", gap: 16, alignItems: "start" },

  outline: { display: "flex", flexDirection: "column", gap: 14, padding: 14, borderRadius: 12, background: "var(--surface-dim)", border: "1px solid var(--color-border-card-soft)" },
  outlineHead: { fontSize: 13.5, fontWeight: 700, color: "var(--color-text-deep)" },
  stageGroup: { display: "flex", flexDirection: "column", gap: 7 },
  stageRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 },
  stageName: { fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--color-text-tertiary)" },
  stageCount: { fontSize: 11, fontWeight: 700, color: "var(--color-text-tertiary)", fontFamily: "var(--font-mono)" },
  stageSteps: { display: "flex", flexDirection: "column", gap: 5 },
  stageEmpty: { fontSize: 11.5, fontStyle: "italic", color: "var(--color-text-placeholder)" },
  outlineItem: {
    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "9px 11px", borderRadius: 9,
    textAlign: "left", background: "var(--surface-white)", border: "1px solid var(--color-divider-card)", cursor: "pointer", fontFamily: "inherit",
  },
  outlineItemSel: { border: "1.5px solid var(--color-icon-tertiary-fg)", boxShadow: "var(--shadow-card)" },
  outlineLabel: { fontSize: 13, fontWeight: 600, color: "var(--color-text-deep)", lineHeight: 1.35, minWidth: 0 },

  detail: { display: "flex", flexDirection: "column", gap: 18, minWidth: 0 },
  detailHead: { display: "flex", flexDirection: "column", gap: 10 },
  titleInput: {
    width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 8,
    border: "1px solid var(--color-divider-card)", background: "var(--surface-white)", fontFamily: "var(--font-sans)",
    fontSize: 16, fontWeight: 700, color: "var(--color-text-deep)",
  },
  detailTags: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  tagBtn: { background: "transparent", border: "none", padding: 0, cursor: "pointer", display: "inline-flex" },
  block: { display: "flex", flexDirection: "column", gap: 8 },
  blockLabel: { fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--color-text-tertiary)" },
  knowledge: { display: "flex", flexDirection: "column", gap: 4, padding: "12px 14px", borderRadius: 10, background: "var(--surface-dim)", border: "1px solid var(--color-border-tab)" },
  knowledgeTitle: { fontSize: 12.5, fontWeight: 700, color: "var(--color-icon-tertiary-fg)" },
  knowledgeBody: { margin: 0, fontSize: 13, color: "var(--color-text-medium)", lineHeight: 1.55 },
  noSuggest: { fontSize: 12, fontStyle: "italic", color: "var(--color-text-tertiary)" },
  placeholder: { margin: 0, fontSize: 13, color: "var(--color-text-tertiary)", lineHeight: 1.55 },
  srOnly: { position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0 },
};
