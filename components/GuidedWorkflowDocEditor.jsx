"use client";

import React from "react";
import { Hash, CornerDownRight, MessageSquareQuote } from "lucide-react";
import { TypeTag, RequirementTag, GroundingChip, SuccessChip, AiMark } from "./GuidedWorkflowBits";
import { gwEvidence } from "./mocks/guidedWorkflows";

// Document · living SOP. The workflow reads as a structured document — a
// stage is a heading, a step is a block with its instruction, inline
// metadata, the script as a quote, and grounding as a citation. A "/" affordance
// adds a block. Mental model: writing/maintaining a doc, not filling a form —
// distinct from the bombed list/board/split.

export default function GuidedWorkflowDocEditor({
  meta,
  stagesWithSteps,
  onCycleRequirement,
  onAddBlank,
}) {
  return (
    <div style={styles.canvas}>
      <article style={styles.doc}>
        <div style={styles.docHead}>
          <AiMark label="AI-drafted · self-maintained" />
          <h1 style={styles.h1}>{meta.title}</h1>
          <p style={styles.lede}>{meta.contactReason}. {meta.jobToBeDone}</p>
          <div style={styles.metaCallout}>
            <span style={styles.metaItem}><b>Success</b> · {meta.successMetric}</span>
          </div>
        </div>

        {stagesWithSteps.map((stage, i) => (
          <section key={stage.id} style={styles.stage}>
            <h2 style={styles.h2}><Hash size={16} color="var(--color-icon-tertiary-fg)" />{i + 1}. {stage.label}</h2>
            <p style={styles.stagePurpose}>{stage.purpose}</p>

            {stage.steps.map((step) => {
              const ev = step.evidence ?? gwEvidence(step.id);
              return (
                <div key={step.id} style={styles.block}>
                  <span style={styles.bullet} aria-hidden="true" />
                  <div style={styles.blockBody}>
                    <span style={styles.blockTitle}>{step.instruction || "Untitled step"}</span>
                    <div style={styles.inlineMeta}>
                      <TypeTag type={step.type} />
                      <button type="button" onClick={() => onCycleRequirement(step.id)} className="gw-focusable" style={styles.reqBtn} aria-label="Change requirement"><RequirementTag requirement={step.requirement} /></button>
                      <SuccessChip evidence={ev} />
                      <GroundingChip grounding={step.grounding} />
                    </div>
                    {step.script && (
                      <p style={styles.quote}><MessageSquareQuote size={12} color="var(--color-button-primary-bg)" style={{ verticalAlign: "middle", marginRight: 5 }} />“{step.script}”</p>
                    )}
                    {step.subSteps && step.subSteps.length > 0 && step.subSteps.map((sub) => (
                      <span key={sub.id} style={styles.sub}><CornerDownRight size={12} color="var(--color-text-tertiary)" /> {sub.label}</span>
                    ))}
                  </div>
                </div>
              );
            })}

            <button type="button" onClick={() => onAddBlank(stage.id)} className="gw-focusable" style={styles.addLine}>
              <span style={styles.slash}>/</span> Add a step to {stage.label}
            </button>
          </section>
        ))}
      </article>
    </div>
  );
}

const styles = {
  canvas: { display: "flex", justifyContent: "center", paddingBottom: 8 },
  doc: { width: "min(760px, 100%)", display: "flex", flexDirection: "column", gap: 26 },
  docHead: { display: "flex", flexDirection: "column", gap: 8 },
  h1: { margin: 0, fontSize: 30, fontWeight: 700, color: "var(--color-text-deep)", lineHeight: 1.2 },
  lede: { margin: 0, fontSize: 14.5, color: "var(--color-text-medium)", lineHeight: 1.55 },
  metaCallout: { display: "flex", gap: 16, padding: "10px 14px", borderRadius: 8, background: "var(--surface-dim)", borderLeft: "3px solid var(--color-icon-tertiary-fg)" },
  metaItem: { fontSize: 12.5, color: "var(--color-text-medium)", lineHeight: 1.5 },
  stage: { display: "flex", flexDirection: "column", gap: 8 },
  h2: { display: "flex", alignItems: "center", gap: 8, margin: "8px 0 0", fontSize: 19, fontWeight: 700, color: "var(--color-text-deep)" },
  stagePurpose: { margin: "0 0 6px", fontSize: 13, color: "var(--color-text-tertiary)", lineHeight: 1.5 },
  block: { display: "flex", gap: 12, padding: "8px 0" },
  bullet: { width: 7, height: 7, borderRadius: 2, background: "var(--color-icon-tertiary-fg)", marginTop: 7, flexShrink: 0, transform: "rotate(45deg)" },
  blockBody: { display: "flex", flexDirection: "column", gap: 6, minWidth: 0, flex: 1 },
  blockTitle: { fontSize: 15, fontWeight: 600, color: "var(--color-text-deep)", lineHeight: 1.45 },
  inlineMeta: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 },
  reqBtn: { background: "transparent", border: "none", padding: 0, cursor: "pointer", display: "inline-flex" },
  quote: { margin: "2px 0 0", padding: "8px 12px", borderLeft: "2px solid var(--color-border-tab)", background: "var(--color-icon-tertiary-bg)", borderRadius: "0 8px 8px 0", fontSize: 13, fontStyle: "italic", color: "var(--color-text-medium)", lineHeight: 1.5 },
  sub: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--color-text-medium)" },
  addLine: { display: "inline-flex", alignItems: "center", gap: 8, alignSelf: "flex-start", background: "transparent", border: "none", cursor: "pointer", padding: "6px 0", fontFamily: "inherit", fontSize: 13, color: "var(--color-text-tertiary)" },
  slash: { width: 20, height: 20, borderRadius: 5, background: "var(--surface-dim)", border: "1px solid var(--color-divider-card)", display: "inline-grid", placeItems: "center", fontSize: 12, fontWeight: 700, color: "var(--color-text-medium)" },
};
