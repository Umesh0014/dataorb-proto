"use client";

import React from "react";
import { Pencil, Check } from "lucide-react";
import {
  TypeTag,
  RequirementTag,
  GroundingChip,
  ScriptQuote,
  EvidenceCard,
  SuccessChip,
} from "./GuidedWorkflowBits";
import { SuggestionGrid, AddStepCta } from "./GuidedWorkflowStepDetail";
import { gwEvidence } from "./mocks/guidedWorkflows";

// C · Ambitious — Evidence studio. LEFT: the whole workflow as a stage-grouped
// outline; each stage lists its steps, its AI suggestion cards, and ends with
// an "Add step" CTA (outside the steps). Click a step → RIGHT shows its
// evidence workspace: title (edit via the pencil — only the title is free
// text), type/requirement chips, the script as quoted evidence, the knowledge
// card, and the success evidence with a drill into the calls behind it.

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
  const [editingTitle, setEditingTitle] = React.useState(false);

  // Auto-select a freshly added step so the lead lands on it to edit.
  const prevIds = React.useRef(steps.map((s) => s.id));
  React.useEffect(() => {
    const added = steps.find((s) => !prevIds.current.includes(s.id));
    if (added) { setSelectedId(added.id); setEditingTitle(true); }
    prevIds.current = steps.map((s) => s.id);
  }, [steps]);

  const selected = steps.find((s) => s.id === selectedId) || null;
  const evidence = selected ? selected.evidence ?? gwEvidence(selected.id) : null;

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
              {stage.steps.map((step) => {
                const isSel = step.id === selectedId;
                const ev = step.evidence ?? gwEvidence(step.id);
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => { setSelectedId(step.id); setEditingTitle(false); }}
                    className="gw-focusable"
                    style={{ ...styles.outlineItem, ...(isSel ? styles.outlineItemSel : null) }}
                    aria-pressed={isSel}
                  >
                    <span style={styles.outlineLabel}>{step.instruction || "Untitled step"}</span>
                    {ev && <SuccessChip evidence={ev} />}
                  </button>
                );
              })}
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
          </div>
        ))}
      </section>

      {/* Right — selected step's evidence workspace */}
      <section style={styles.detail} aria-label="Step evidence">
        <div role="status" aria-live="polite" style={styles.srOnly}>
          {selected && `Selected ${selected.instruction || "new step"}. ${evidence ? `${evidence.successRate}% success across ${evidence.callCount} calls.` : "No evidence yet."}`}
        </div>

        {selected ? (
          <>
            <header style={styles.detailHead}>
              {editingTitle ? (
                <div style={styles.titleEditRow}>
                  <input
                    value={selected.instruction}
                    onChange={(e) => onUpdateInstruction?.(selected.id, e.target.value)}
                    style={styles.titleInput}
                    aria-label="Step instruction"
                    placeholder="What should the agent do?"
                    autoFocus
                  />
                  <button type="button" onClick={() => setEditingTitle(false)} className="gw-focusable" style={styles.doneBtn} aria-label="Done editing title">
                    <Check size={16} color="var(--color-button-primary-bg)" />
                  </button>
                </div>
              ) : (
                <div style={styles.titleRow}>
                  <h3 style={styles.title}>{selected.instruction || "Untitled step"}</h3>
                  <button type="button" onClick={() => setEditingTitle(true)} className="gw-focusable" style={styles.editBtn} aria-label="Edit title">
                    <Pencil size={14} color="var(--color-text-tertiary)" />
                  </button>
                </div>
              )}
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
          </>
        ) : (
          <p style={styles.placeholder}>Select a step on the left to see its evidence and edit it.</p>
        )}
      </section>
    </div>
  );
}

const styles = {
  split: { display: "grid", gridTemplateColumns: "minmax(0, 0.85fr) minmax(0, 1.15fr)", gap: 16, alignItems: "start" },

  outline: { display: "flex", flexDirection: "column", gap: 14, padding: 14, borderRadius: 12, background: "var(--surface-dim)", border: "1px solid var(--color-border-card-soft)" },
  outlineHead: { fontSize: 13.5, fontWeight: 700, color: "var(--color-text-deep)" },
  stageGroup: { display: "flex", flexDirection: "column", gap: 7 },
  stageRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 },
  stageName: { fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--color-text-tertiary)" },
  stageCount: { fontSize: 11, fontWeight: 700, color: "var(--color-text-tertiary)", fontFamily: "var(--font-mono)" },
  stageSteps: { display: "flex", flexDirection: "column", gap: 6 },
  outlineItem: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "9px 11px", borderRadius: 9, textAlign: "left", background: "var(--surface-white)", border: "1px solid var(--color-divider-card)", cursor: "pointer", fontFamily: "inherit" },
  outlineItemSel: { border: "1.5px solid var(--color-icon-tertiary-fg)", boxShadow: "var(--shadow-card)" },
  outlineLabel: { fontSize: 13, fontWeight: 600, color: "var(--color-text-deep)", lineHeight: 1.35, minWidth: 0 },

  detail: { display: "flex", flexDirection: "column", gap: 18, minWidth: 0 },
  detailHead: { display: "flex", flexDirection: "column", gap: 10 },
  titleRow: { display: "flex", alignItems: "center", gap: 8 },
  title: { margin: 0, fontSize: 18, fontWeight: 700, color: "var(--color-text-deep)", lineHeight: 1.3 },
  titleEditRow: { display: "flex", alignItems: "center", gap: 8 },
  titleInput: { flex: 1, boxSizing: "border-box", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--color-divider-card)", background: "var(--surface-white)", fontFamily: "var(--font-sans)", fontSize: 16, fontWeight: 700, color: "var(--color-text-deep)" },
  editBtn: { background: "transparent", border: "none", cursor: "pointer", padding: 6, display: "inline-flex", borderRadius: 6 },
  doneBtn: { background: "transparent", border: "1px solid var(--color-divider-card)", cursor: "pointer", padding: 8, display: "inline-flex", borderRadius: 8 },
  detailTags: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  tagBtn: { background: "transparent", border: "none", padding: 0, cursor: "pointer", display: "inline-flex" },
  block: { display: "flex", flexDirection: "column", gap: 8 },
  blockLabel: { fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--color-text-tertiary)" },
  knowledge: { display: "flex", flexDirection: "column", gap: 4, padding: "12px 14px", borderRadius: 10, background: "var(--surface-dim)", border: "1px solid var(--color-border-tab)" },
  knowledgeTitle: { fontSize: 12.5, fontWeight: 700, color: "var(--color-icon-tertiary-fg)" },
  knowledgeBody: { margin: 0, fontSize: 13, color: "var(--color-text-medium)", lineHeight: 1.55 },
  placeholder: { margin: 0, fontSize: 13, color: "var(--color-text-tertiary)", lineHeight: 1.55 },
  srOnly: { position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0 },
};
