"use client";

import React from "react";
import { Check, ChevronLeft, ChevronRight, Target, MessageSquareQuote } from "lucide-react";
import { TypeTag, RequirementTag, GroundingChip, SuccessChip, AiMark } from "./GuidedWorkflowBits";
import { SuggestionGrid, AddStepCta } from "./GuidedWorkflowStepDetail";
import { gwEvidence } from "./mocks/guidedWorkflows";

// Wizard · guided builder. The lead is interviewed through the schema one
// stage at a time (Open → Verify → Discover → Act → Close), the draft already
// AI-prefilled. A progress stepper anchors "where am I", a context card holds
// the contact-reason / job / success metric, and the active stage shows just
// its steps + suggestions. Sequential, low-cognitive-load — "a 13-year-old
// can build it." Distinct from the bombed list/board/split: nav is a flow.

export default function GuidedWorkflowWizardEditor({
  meta,
  stagesWithSteps,
  suggestions = [],
  onCycleRequirement,
  onAcceptSuggestion,
  onAddBlank,
}) {
  const [idx, setIdx] = React.useState(2); // start on Discover
  const [openSuggest, setOpenSuggest] = React.useState(null);
  const stage = stagesWithSteps[idx];
  const total = stagesWithSteps.length;

  return (
    <div style={styles.wrap}>
      {/* stage stepper */}
      <div style={styles.stepper}>
        {stagesWithSteps.map((s, i) => (
          <React.Fragment key={s.id}>
            <button type="button" onClick={() => setIdx(i)} className="gw-focusable" style={styles.stepBtn} aria-current={i === idx}>
              <span style={{ ...styles.dot, ...(i < idx ? styles.dotDone : i === idx ? styles.dotActive : null) }}>
                {i < idx ? <Check size={13} color="#FFFFFF" /> : <span style={{ ...styles.dotNum, color: i === idx ? "#FFFFFF" : "var(--color-text-tertiary)" }}>{i + 1}</span>}
              </span>
              <span style={{ ...styles.stepLabel, color: i === idx ? "var(--color-text-deep)" : "var(--color-text-tertiary)", fontWeight: i === idx ? 700 : 500 }}>{s.label}</span>
            </button>
            {i < total - 1 && <span style={styles.connector} aria-hidden="true" />}
          </React.Fragment>
        ))}
      </div>

      <div style={styles.bodyRow}>
        {/* context rail */}
        <aside style={styles.context}>
          <span style={styles.ctxHead}><Target size={14} color="var(--color-button-primary-bg)" /> Outcome</span>
          <CtxBlock label="Contact reason" value={meta.contactReason} />
          <CtxBlock label="Job to be done" value={meta.jobToBeDone} />
          <CtxBlock label="Success metric" value={meta.successMetric} />
          <AiMark label="AI-prefilled from 12 calls" />
        </aside>

        {/* active stage */}
        <section style={styles.stagePanel}>
          <div style={styles.stageHead}>
            <h3 style={styles.stageName}>Step {idx + 1} of {total} · {stage.label}</h3>
            <span style={styles.stagePurpose}>{stage.purpose}</span>
          </div>

          <div style={styles.stepList}>
            {stage.steps.map((step) => {
              const ev = step.evidence ?? gwEvidence(step.id);
              return (
                <div key={step.id} style={styles.step}>
                  <span style={styles.stepInstruction}>{step.instruction || "Untitled step"}</span>
                  <div style={styles.stepTags}>
                    <TypeTag type={step.type} />
                    <button type="button" onClick={() => onCycleRequirement(step.id)} className="gw-focusable" style={styles.reqBtn} aria-label="Change requirement">
                      <RequirementTag requirement={step.requirement} />
                    </button>
                    {step.script && <MessageSquareQuote size={13} color="var(--color-button-primary-bg)" aria-label="Has a script" />}
                    <GroundingChip grounding={step.grounding} />
                    <SuccessChip evidence={ev} />
                  </div>
                </div>
              );
            })}
            {stage.steps.length === 0 && <p style={styles.empty}>No steps in this stage yet — add one or accept a suggestion.</p>}
          </div>

          {suggestions.some((s) => s.stage === stage.id) && (
            <>
              <span style={styles.subLabel}>Suggested for {stage.label}</span>
              <SuggestionGrid stageId={stage.id} suggestions={suggestions} columns={2} onAccept={onAcceptSuggestion} expanded={openSuggest} onToggle={(id) => setOpenSuggest((c) => (c === id ? null : id))} />
            </>
          )}
          <AddStepCta onClick={() => onAddBlank(stage.id)} label={`Add a step to ${stage.label}`} />

          <div style={styles.footer}>
            <button type="button" disabled={idx === 0} onClick={() => setIdx((i) => Math.max(0, i - 1))} className="gw-focusable" style={{ ...styles.navBtn, opacity: idx === 0 ? 0.4 : 1 }}>
              <ChevronLeft size={16} /> {idx > 0 ? stagesWithSteps[idx - 1].label : "Back"}
            </button>
            <div style={{ flex: 1 }} />
            <button type="button" onClick={() => setIdx((i) => Math.min(total - 1, i + 1))} className="gw-focusable" style={styles.continueBtn}>
              {idx < total - 1 ? `Continue to ${stagesWithSteps[idx + 1].label}` : "Review & publish"} <ChevronRight size={16} />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function CtxBlock({ label, value }) {
  return (
    <div style={styles.ctxBlock}>
      <span style={styles.ctxLabel}>{label}</span>
      <span style={styles.ctxValue}>{value}</span>
    </div>
  );
}

const styles = {
  wrap: { display: "flex", flexDirection: "column", gap: 22 },
  stepper: { display: "flex", alignItems: "center", gap: 4 },
  stepBtn: { display: "inline-flex", alignItems: "center", gap: 8, background: "transparent", border: "none", cursor: "pointer", padding: "4px 6px", fontFamily: "inherit" },
  dot: { width: 24, height: 24, borderRadius: 999, background: "var(--surface-dim)", border: "1px solid var(--color-divider-card)", display: "inline-grid", placeItems: "center", flexShrink: 0 },
  dotActive: { background: "var(--color-button-primary-bg)", border: "none" },
  dotDone: { background: "var(--color-success)", border: "none" },
  dotNum: { fontSize: 12, fontWeight: 700 },
  stepLabel: { fontSize: 13.5 },
  connector: { width: 26, height: 2, background: "var(--color-divider-card)", flexShrink: 0 },
  bodyRow: { display: "grid", gridTemplateColumns: "260px minmax(0,1fr)", gap: 20, alignItems: "start" },
  context: { display: "flex", flexDirection: "column", gap: 14, padding: 16, borderRadius: 12, background: "var(--color-icon-tertiary-bg)", border: "1px solid var(--color-border-tab)" },
  ctxHead: { display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 700, color: "var(--color-icon-tertiary-fg)", textTransform: "uppercase", letterSpacing: "0.05em" },
  ctxBlock: { display: "flex", flexDirection: "column", gap: 3 },
  ctxLabel: { fontSize: 10.5, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--color-text-tertiary)" },
  ctxValue: { fontSize: 12.5, color: "var(--color-text-medium)", lineHeight: 1.5 },
  stagePanel: { display: "flex", flexDirection: "column", gap: 14, padding: 22, borderRadius: 12, background: "var(--surface-white)", border: "1px solid var(--color-divider-card)" },
  stageHead: { display: "flex", flexDirection: "column", gap: 4 },
  stageName: { margin: 0, fontSize: 17, fontWeight: 700, color: "var(--color-text-deep)" },
  stagePurpose: { fontSize: 13, color: "var(--color-text-tertiary)", lineHeight: 1.5 },
  stepList: { display: "flex", flexDirection: "column", gap: 8 },
  step: { display: "flex", flexDirection: "column", gap: 8, padding: "12px 14px", borderRadius: 10, background: "var(--surface-dim)", border: "1px solid var(--color-border-card-soft)" },
  stepInstruction: { fontSize: 14, fontWeight: 600, color: "var(--color-text-deep)" },
  stepTags: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 },
  reqBtn: { background: "transparent", border: "none", padding: 0, cursor: "pointer", display: "inline-flex" },
  empty: { margin: 0, fontSize: 12.5, fontStyle: "italic", color: "var(--color-text-tertiary)" },
  subLabel: { fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--color-text-tertiary)", marginTop: 4 },
  footer: { display: "flex", alignItems: "center", gap: 12, marginTop: 6, paddingTop: 14, borderTop: "1px solid var(--color-divider-card)" },
  navBtn: { display: "inline-flex", alignItems: "center", gap: 5, background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, color: "var(--color-text-medium)" },
  continueBtn: { display: "inline-flex", alignItems: "center", gap: 6, background: "var(--color-button-primary-bg)", color: "#FFFFFF", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700, padding: "10px 18px", borderRadius: 999 },
};
