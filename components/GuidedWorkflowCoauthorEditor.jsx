"use client";

import React from "react";
import { Sparkles, ArrowUp, Check, X } from "lucide-react";
import { TypeTag, RequirementTag, SuccessChip, GroundingChip } from "./GuidedWorkflowBits";
import { gwEvidence } from "./mocks/guidedWorkflows";

// Co-author · conversational. The lead builds the workflow by talking to the
// AI: it presents the draft mined from calls, proposes evidence-backed
// changes, and applies accepted edits to a live preview on the right. Mental
// model: pair-writing with a co-pilot — distinct from the bombed
// list/board/split. (The agent-side chatbot caution doesn't apply here: this
// is authoring, and edits land in a structured preview, not a chat blob.)

export default function GuidedWorkflowCoauthorEditor({
  stagesWithSteps,
  suggestions = [],
  onAcceptSuggestion,
}) {
  const sug = suggestions[0];
  return (
    <div style={styles.split}>
      {/* chat lane */}
      <section style={styles.chat} aria-label="Co-author conversation">
        <div style={styles.thread}>
          <AiMsg>I drafted a <b>9-step workflow</b> from 12 bill-shock calls, grounded in real interactions — it runs Open → Verify → Discover → Act → Close. Have a look on the right; tell me what to change.</AiMsg>
          {sug && (
            <AiMsg>
              Agents who quantified the £ impact retained more often. Want me to add <b>“{sug.instruction}”</b> to Discover?
              <span style={styles.evi}><SuccessChip evidence={sug.evidence} /> grounded in real calls</span>
              <span style={styles.actions}>
                <button type="button" onClick={() => onAcceptSuggestion(sug.id)} className="gw-focusable" style={styles.accept}><Check size={13} /> Add it</button>
                <button type="button" className="gw-focusable" style={styles.dismiss}><X size={13} /> Not now</button>
              </span>
            </AiMsg>
          )}
          <UserMsg>Make the churn-signal step conditional, not required.</UserMsg>
          <AiMsg>Done — <b>“Check for a churn signal”</b> is now <RequirementTag requirement="conditional" /> and only prompts when a competitor is mentioned. Anything else?</AiMsg>
        </div>
        <div style={styles.composer}>
          <span style={styles.composerText}>Ask the AI to add, tighten, re-tag, or ground a step…</span>
          <span style={styles.send}><ArrowUp size={16} color="#FFFFFF" /></span>
        </div>
      </section>

      {/* live preview */}
      <section style={styles.preview} aria-label="Workflow preview">
        <header style={styles.previewHead}>
          <span style={styles.previewTitle}>Workflow preview</span>
          <span style={styles.previewMeta}>Bill-shock retention — IPC tariff</span>
        </header>
        <div style={styles.previewBody}>
          {stagesWithSteps.map((stage) => (
            <div key={stage.id} style={styles.stage}>
              <span style={styles.stageName}>{stage.label} · {stage.steps.length}</span>
              {stage.steps.map((step) => {
                const ev = step.evidence ?? gwEvidence(step.id);
                return (
                  <div key={step.id} style={styles.pStep}>
                    <span style={styles.pInstruction}>{step.instruction || "Untitled step"}</span>
                    <span style={styles.pTags}>
                      <TypeTag type={step.type} />
                      <RequirementTag requirement={step.requirement} />
                      <GroundingChip grounding={step.grounding} />
                      <SuccessChip evidence={ev} />
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function AiMsg({ children }) {
  return (
    <div style={styles.aiRow}>
      <span style={styles.aiAvatar}><Sparkles size={14} color="#FFFFFF" /></span>
      <div style={styles.aiBubble}>{children}</div>
    </div>
  );
}
function UserMsg({ children }) {
  return <div style={styles.userRow}><div style={styles.userBubble}>{children}</div></div>;
}

const styles = {
  split: { display: "grid", gridTemplateColumns: "minmax(0,1.05fr) minmax(0,0.95fr)", gap: 16, alignItems: "stretch" },
  chat: { display: "flex", flexDirection: "column", gap: 12, padding: 16, borderRadius: 12, background: "var(--surface-dim)", border: "1px solid var(--color-border-card-soft)", minHeight: 520 },
  thread: { display: "flex", flexDirection: "column", gap: 14, flex: 1 },
  aiRow: { display: "flex", gap: 10, alignItems: "flex-start" },
  aiAvatar: { width: 28, height: 28, borderRadius: 999, background: "var(--color-button-primary-bg)", display: "inline-grid", placeItems: "center", flexShrink: 0 },
  aiBubble: { display: "flex", flexDirection: "column", gap: 8, padding: "11px 14px", borderRadius: "4px 14px 14px 14px", background: "var(--surface-white)", border: "1px solid var(--color-divider-card)", fontSize: 13.5, color: "var(--color-text-medium)", lineHeight: 1.55, maxWidth: "92%" },
  evi: { display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--color-text-tertiary)" },
  actions: { display: "inline-flex", gap: 8, marginTop: 2 },
  accept: { display: "inline-flex", alignItems: "center", gap: 5, background: "var(--color-button-primary-bg)", color: "#FFFFFF", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 12.5, fontWeight: 700, padding: "6px 12px", borderRadius: 999 },
  dismiss: { display: "inline-flex", alignItems: "center", gap: 5, background: "transparent", color: "var(--color-text-medium)", border: "1px solid var(--color-divider-card)", cursor: "pointer", fontFamily: "inherit", fontSize: 12.5, fontWeight: 600, padding: "6px 12px", borderRadius: 999 },
  userRow: { display: "flex", justifyContent: "flex-end" },
  userBubble: { padding: "11px 14px", borderRadius: "14px 4px 14px 14px", background: "var(--color-primary-alpha-12)", color: "var(--color-text-deep)", fontSize: 13.5, lineHeight: 1.5, maxWidth: "85%" },
  composer: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12, background: "var(--surface-white)", border: "1px solid var(--color-divider-card)" },
  composerText: { flex: 1, fontSize: 13, color: "var(--color-text-placeholder)" },
  send: { width: 32, height: 32, borderRadius: 999, background: "var(--color-button-primary-bg)", display: "inline-grid", placeItems: "center", flexShrink: 0 },

  preview: { display: "flex", flexDirection: "column", gap: 0, borderRadius: 12, background: "var(--surface-white)", border: "1px solid var(--color-divider-card)", overflow: "hidden" },
  previewHead: { display: "flex", flexDirection: "column", gap: 2, padding: "14px 16px", borderBottom: "1px solid var(--color-divider-card)" },
  previewTitle: { fontSize: 13.5, fontWeight: 700, color: "var(--color-text-deep)" },
  previewMeta: { fontSize: 12, color: "var(--color-text-tertiary)" },
  previewBody: { display: "flex", flexDirection: "column", gap: 14, padding: 16, overflowY: "auto" },
  stage: { display: "flex", flexDirection: "column", gap: 6 },
  stageName: { fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--color-text-tertiary)" },
  pStep: { display: "flex", flexDirection: "column", gap: 6, padding: "9px 11px", borderRadius: 9, background: "var(--surface-dim)", border: "1px solid var(--color-border-card-soft)" },
  pInstruction: { fontSize: 13, fontWeight: 600, color: "var(--color-text-deep)", lineHeight: 1.4 },
  pTags: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 },
};
