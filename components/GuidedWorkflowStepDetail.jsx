"use client";

import React from "react";
import { Trash2, Plus } from "lucide-react";
import {
  TypeTag,
  RequirementTag,
  GroundingChip,
  ScriptQuote,
  EvidenceCard,
  SuggestedStepCard,
} from "./GuidedWorkflowBits";
import { Overlay } from "./GuidedWorkflowDialogs";
import { gwEvidence, GW_STAGES } from "./mocks/guidedWorkflows";

const STAGE_LABEL = Object.fromEntries(GW_STAGES.map((s) => [s.id, s.label]));

// StepDetailBody — the editable detail for one step, reused inline (Checklist
// expands a row into this) and inside a modal (Board). The title is a text
// field; type and requirement are one-tap cycles; the script shows as
// read-only quoted evidence; the success evidence drills into its calls.
export function StepDetailBody({ step, onUpdateInstruction, onCycleType, onCycleRequirement, onRemove }) {
  const [confirming, setConfirming] = React.useState(false);
  const evidence = step.evidence ?? gwEvidence(step.id);

  return (
    <div style={styles.body}>
      <label style={styles.field}>
        <span style={styles.fieldLabel}>Step</span>
        <input
          value={step.instruction}
          onChange={(e) => onUpdateInstruction?.(step.id, e.target.value)}
          style={styles.input}
          aria-label="Step instruction"
          placeholder="What should the agent do?"
        />
      </label>

      <div style={styles.tagRow}>
        <button type="button" onClick={() => onCycleType?.(step.id)} style={styles.tagBtn} className="gw-focusable" aria-label={`Type: ${step.type}. Tap to change.`}>
          <TypeTag type={step.type} />
        </button>
        <button type="button" onClick={() => onCycleRequirement?.(step.id)} style={styles.tagBtn} className="gw-focusable" aria-label={`Requirement: ${step.requirement}. Tap to change.`}>
          <RequirementTag requirement={step.requirement} />
        </button>
        <div style={{ flex: 1 }} />
        <GroundingChip grounding={step.grounding} />
      </div>

      <p style={styles.detail}>{step.detail}</p>

      {step.script && (
        <section style={styles.section}>
          <span style={styles.sectionLabel}>Script — what agents actually said</span>
          <ScriptQuote script={step.script} grounding={step.grounding} />
        </section>
      )}

      {step.knowledge && (
        <section style={styles.section}>
          <span style={styles.sectionLabel}>Knowledge</span>
          <div style={styles.knowledge}>
            <span style={styles.knowledgeTitle}>{step.knowledge.title}</span>
            <p style={styles.knowledgeBody}>{step.knowledge.body}</p>
          </div>
        </section>
      )}

      {step.subSteps.length > 0 && (
        <section style={styles.section}>
          <span style={styles.sectionLabel}>Conditional sub-steps</span>
          <ul style={styles.subList}>
            {step.subSteps.map((sub) => (
              <li key={sub.id} style={styles.subItem}>
                <span style={styles.subBullet} aria-hidden="true" />
                {sub.label}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section style={styles.section}>
        <span style={styles.sectionLabel}>Evidence</span>
        <EvidenceCard evidence={evidence} />
      </section>

      <div style={styles.deleteRow}>
        {confirming ? (
          <span style={styles.confirmRow}>
            <span style={styles.confirmLabel}>Remove this step?</span>
            <button type="button" onClick={() => onRemove?.(step.id)} style={styles.confirmYes} className="gw-focusable">Remove</button>
            <button type="button" onClick={() => setConfirming(false)} style={styles.confirmNo} className="gw-focusable">Keep</button>
          </span>
        ) : (
          <button type="button" onClick={() => setConfirming(true)} style={styles.deleteBtn} className="gw-focusable">
            <Trash2 size={15} color="var(--color-text-tertiary)" />
            Remove step
          </button>
        )}
      </div>
    </div>
  );
}

// StepModal — Board step editing. Reuses the shared Overlay shell (scrim,
// titled header + close, Esc / scrim-click, focus trap + restore) rather
// than a second bespoke modal; only the body differs.
export function StepModal({ step, onClose, onUpdateInstruction, onCycleType, onCycleRequirement, onRemove }) {
  if (!step) return null;
  return (
    <Overlay onClose={onClose} labelledBy="gw-step-title" title={`Edit step · ${STAGE_LABEL[step.stage]}`}>
      <StepDetailBody
        step={step}
        onUpdateInstruction={onUpdateInstruction}
        onCycleType={onCycleType}
        onCycleRequirement={onCycleRequirement}
        onRemove={(id) => { onRemove?.(id); onClose(); }}
      />
    </Overlay>
  );
}

// SuggestionGrid — the AI suggestions for a stage as glanceable cards, laid
// out in `columns` across (3 in the wide Checklist, 1 in a narrow lane).
export function SuggestionGrid({ stageId, suggestions, columns = 3, onAccept, expanded, onToggle }) {
  const forStage = suggestions.filter((s) => s.stage === stageId);
  if (forStage.length === 0) return null;
  return (
    <div style={styles.grid(columns)}>
      {forStage.map((s) => (
        <SuggestedStepCard
          key={s.id}
          step={s}
          dense={columns > 1}
          expanded={expanded === s.id}
          onToggle={() => onToggle(s.id)}
          onAdd={() => onAccept(s.id)}
        />
      ))}
    </div>
  );
}

// AddStepCta — a clean tinted secondary CTA (not a dashed placeholder).
export function AddStepCta({ onClick, label = "Add step" }) {
  return (
    <button type="button" onClick={onClick} style={styles.cta} className="gw-focusable">
      <Plus size={16} color="var(--color-button-primary-bg)" />
      {label}
    </button>
  );
}

const styles = {
  body: { display: "flex", flexDirection: "column", gap: 16 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  fieldLabel: { fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--color-text-tertiary)" },
  input: {
    width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 8,
    border: "1px solid var(--color-divider-card)", background: "var(--surface-white)", fontFamily: "var(--font-sans)",
    fontSize: 14, fontWeight: 600, color: "var(--color-text-deep)",
  },
  tagRow: { display: "flex", alignItems: "center", gap: 8 },
  tagBtn: { background: "transparent", border: "none", padding: 0, cursor: "pointer", display: "inline-flex" },
  detail: { margin: 0, fontSize: 13, color: "var(--color-text-tertiary)", lineHeight: 1.55 },
  section: { display: "flex", flexDirection: "column", gap: 8 },
  sectionLabel: { fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--color-text-tertiary)" },
  knowledge: { display: "flex", flexDirection: "column", gap: 4, padding: "12px 14px", borderRadius: 10, background: "var(--surface-dim)", border: "1px solid var(--color-border-tab)" },
  knowledgeTitle: { fontSize: 12.5, fontWeight: 700, color: "var(--color-icon-tertiary-fg)" },
  knowledgeBody: { margin: 0, fontSize: 13, color: "var(--color-text-medium)", lineHeight: 1.55 },
  subList: { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 7 },
  subItem: { display: "flex", alignItems: "center", gap: 9, fontSize: 13, color: "var(--color-text-medium)" },
  subBullet: { width: 5, height: 5, borderRadius: 999, background: "var(--color-icon-tertiary-fg)", flexShrink: 0 },
  deleteRow: { paddingTop: 4 },
  deleteBtn: { display: "inline-flex", alignItems: "center", gap: 8, background: "transparent", border: "none", cursor: "pointer", padding: "4px 0", fontFamily: "inherit", fontSize: 13, fontWeight: 600, color: "var(--color-text-tertiary)" },
  confirmRow: { display: "inline-flex", alignItems: "center", gap: 12 },
  confirmLabel: { fontSize: 13, fontWeight: 600, color: "var(--color-text-medium)" },
  confirmYes: { background: "transparent", border: "none", cursor: "pointer", padding: "4px 6px", fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: "var(--color-error-text)" },
  confirmNo: { background: "transparent", border: "none", cursor: "pointer", padding: "4px 6px", fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: "var(--color-text-medium)" },

  grid: (columns) => ({ display: "grid", gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: 10 }),
  cta: {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, alignSelf: "flex-start",
    padding: "9px 16px", borderRadius: 999, border: "1px solid var(--color-button-primary-bg)",
    background: "var(--color-primary-alpha-12)", color: "var(--color-button-primary-bg)",
    cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700,
  },
};
