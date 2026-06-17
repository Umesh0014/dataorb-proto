"use client";

import React from "react";
import { X, Trash2, Plus } from "lucide-react";
import {
  TypeTag,
  RequirementTag,
  GroundingChip,
  ScriptQuote,
  EvidenceCard,
  SuggestedStepCard,
} from "./GuidedWorkflowBits";
import { gwEvidence, GW_STAGES } from "./mocks/guidedWorkflows";

const STAGE_LABEL = Object.fromEntries(GW_STAGES.map((s) => [s.id, s.label]));

// StepDrawer — the side curtain that opens when a lead clicks a step in the
// Checklist or Board editor. It's the single place a step is edited: the
// instruction (text), its type and requirement (one-tap cycles), the script
// shown as read-only quoted evidence, the linked knowledge card, the success
// evidence (rate + the phrasing agents used), conditional sub-steps, and a
// confirmed delete. New (blank) steps open here immediately so they're
// editable from the moment they're added.
export default function StepDrawer({
  step,
  onClose,
  onUpdateInstruction,
  onCycleType,
  onCycleRequirement,
  onRemove,
}) {
  const [confirming, setConfirming] = React.useState(false);

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!step) return null;
  const evidence = step.evidence ?? gwEvidence(step.id);

  return (
    <div style={styles.scrim} role="dialog" aria-modal="true" aria-label="Edit step" onMouseDown={onClose}>
      <div className="gw-curtain" style={styles.panel} onMouseDown={(e) => e.stopPropagation()}>
        <header style={styles.head}>
          <span style={styles.stageChip}>{STAGE_LABEL[step.stage]}</span>
          <div style={{ flex: 1 }} />
          <button type="button" onClick={onClose} style={styles.iconBtn} className="gw-focusable" aria-label="Close">
            <X size={18} color="var(--color-text-tertiary)" />
          </button>
        </header>

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
        </div>

        <footer style={styles.foot}>
          {confirming ? (
            <span style={styles.confirmRow}>
              <span style={styles.confirmLabel}>Remove this step?</span>
              <button type="button" onClick={() => { onRemove?.(step.id); onClose(); }} style={styles.confirmYes} className="gw-focusable">Remove</button>
              <button type="button" onClick={() => setConfirming(false)} style={styles.confirmNo} className="gw-focusable">Keep</button>
            </span>
          ) : (
            <button type="button" onClick={() => setConfirming(true)} style={styles.deleteBtn} className="gw-focusable">
              <Trash2 size={15} color="var(--color-text-tertiary)" />
              Remove step
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}

// AddStepCards — the card tray revealed by "Add step" (cards, not strips):
// the AI suggestions mined for that stage, each with its success rate + Add,
// plus a "blank step" card that opens the drawer to author from scratch.
export function AddStepCards({ stageId, suggestions, onAccept, onAddBlank, expandedSuggest, onToggleSuggest, dense = false }) {
  const forStage = suggestions.filter((s) => s.stage === stageId);
  return (
    <div style={styles.tray}>
      {forStage.map((s) => (
        <SuggestedStepCard
          key={s.id}
          step={s}
          dense={dense}
          expanded={expandedSuggest === s.id}
          onToggle={() => onToggleSuggest(s.id)}
          onAdd={() => onAccept(s.id)}
        />
      ))}
      <button type="button" style={dense ? styles.blankCardDense : styles.blankCard} className="gw-focusable" onClick={() => onAddBlank(stageId)}>
        <span style={styles.blankPlus}><Plus size={16} color="var(--color-button-primary-bg)" /></span>
        <span style={styles.blankMain}>
          <span style={styles.blankTitle}>Blank step</span>
          {!dense && <span style={styles.blankSub}>Write your own — it won't carry a success rate until calls run against it.</span>}
        </span>
      </button>
    </div>
  );
}

const styles = {
  scrim: {
    position: "fixed", inset: 0, zIndex: 80, background: "color-mix(in srgb, var(--color-text-deep) 24%, transparent)",
    display: "flex", justifyContent: "flex-end",
  },
  panel: {
    width: "min(440px, 100%)", height: "100%", background: "var(--surface-white)",
    boxShadow: "var(--shadow-drawer)", display: "flex", flexDirection: "column", overflow: "hidden",
  },
  head: { display: "flex", alignItems: "center", gap: 10, padding: "16px 20px", borderBottom: "1px solid var(--color-divider-card)" },
  stageChip: {
    fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase",
    color: "var(--color-icon-tertiary-fg)", background: "var(--color-icon-tertiary-bg)", borderRadius: 4, padding: "3px 9px",
  },
  iconBtn: { background: "transparent", border: "none", cursor: "pointer", padding: 8, display: "inline-flex", borderRadius: 8 },
  body: { flex: 1, overflowY: "auto", padding: "18px 20px", display: "flex", flexDirection: "column", gap: 18 },
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
  knowledge: {
    display: "flex", flexDirection: "column", gap: 4, padding: "12px 14px", borderRadius: 10,
    background: "var(--surface-dim)", border: "1px solid var(--color-border-tab)",
  },
  knowledgeTitle: { fontSize: 12.5, fontWeight: 700, color: "var(--color-icon-tertiary-fg)" },
  knowledgeBody: { margin: 0, fontSize: 13, color: "var(--color-text-medium)", lineHeight: 1.55 },
  subList: { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 7 },
  subItem: { display: "flex", alignItems: "center", gap: 9, fontSize: 13, color: "var(--color-text-medium)" },
  subBullet: { width: 5, height: 5, borderRadius: 999, background: "var(--color-icon-tertiary-fg)", flexShrink: 0 },
  foot: { padding: "14px 20px", borderTop: "1px solid var(--color-divider-card)" },
  deleteBtn: {
    display: "inline-flex", alignItems: "center", gap: 8, background: "transparent", border: "none",
    cursor: "pointer", padding: "4px 0", fontFamily: "inherit", fontSize: 13, fontWeight: 600, color: "var(--color-text-tertiary)",
  },
  confirmRow: { display: "inline-flex", alignItems: "center", gap: 12 },
  confirmLabel: { fontSize: 13, fontWeight: 600, color: "var(--color-text-medium)" },
  confirmYes: { background: "transparent", border: "none", cursor: "pointer", padding: "4px 6px", fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: "var(--color-error-text)" },
  confirmNo: { background: "transparent", border: "none", cursor: "pointer", padding: "4px 6px", fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: "var(--color-text-medium)" },

  tray: { display: "flex", flexDirection: "column", gap: 10 },
  blankCard: {
    display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, textAlign: "left",
    background: "var(--surface-white)", border: "1px dashed var(--color-divider-card)", cursor: "pointer", fontFamily: "inherit",
  },
  blankCardDense: {
    display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, textAlign: "left",
    background: "var(--surface-white)", border: "1px dashed var(--color-divider-card)", cursor: "pointer", fontFamily: "inherit",
  },
  blankPlus: { width: 30, height: 30, borderRadius: 8, background: "var(--color-primary-alpha-12)", display: "inline-grid", placeItems: "center", flexShrink: 0 },
  blankMain: { display: "flex", flexDirection: "column", gap: 2, minWidth: 0 },
  blankTitle: { fontSize: 13.5, fontWeight: 700, color: "var(--color-text-deep)" },
  blankSub: { fontSize: 12, color: "var(--color-text-tertiary)", lineHeight: 1.45 },
};
