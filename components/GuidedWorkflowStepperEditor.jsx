"use client";

import React from "react";
import { GitBranch, Lightbulb, Plus, X, Check } from "lucide-react";
import { TypeTag, RequirementTag, GroundingChip } from "./GuidedWorkflowBits";
import { StepDetailBody, AddStepCta } from "./GuidedWorkflowStepDetail";
import { GW_STAGES, GW_SCENARIOS, gwGroupStage, gwTypeMeta } from "./mocks/guidedWorkflows";

// Stepper + sidecar. The category spine is a horizontal stepper (Open →
// Close) with each stage's steps marked as type-coloured pips on its node.
// Selecting a category reveals its steps in the panel below; Act is triage,
// so it offers a path selector first. Clicking a step opens a docked sidecar
// (slide-in) with the full step detail. Three nested interactions, each one
// click: pick a stage → read its steps → open a step.

function hintCount(step) {
  return (step.script ? 1 : 0) + (step.knowledge ? 1 : 0) + (step.subSteps?.length || 0);
}

export default function GuidedWorkflowStepperEditor({
  stagesWithSteps, onUpdateInstruction, onCycleType, onCycleRequirement, onRemove, onAddBlank,
}) {
  const actSteps = (stagesWithSteps.find((s) => s.id === "act") || {}).steps || [];
  const actScenarios = gwGroupStage(actSteps).scenarios;
  const [stageId, setStageId] = React.useState("open");
  const [triage, setTriage] = React.useState(actScenarios[0]?.id || null);
  const [visited, setVisited] = React.useState(() => new Set(["open"]));
  const [selId, setSelId] = React.useState(null);

  const stage = GW_STAGES.find((s) => s.id === stageId);
  const isAct = stageId === "act";
  const steps = isAct ? (actScenarios.find((sc) => sc.id === triage)?.steps || []) : (stagesWithSteps.find((s) => s.id === stageId)?.steps || []);
  const allSteps = stagesWithSteps.flatMap((s) => s.steps);
  const selected = allSteps.find((s) => s.id === selId) || null;

  const pick = (id) => { setStageId(id); setVisited((v) => new Set(v).add(id)); setSelId(null); };

  return (
    <div style={styles.wrap}>
      <nav style={styles.stepper} aria-label="Workflow stages">
        {GW_STAGES.map((s, i) => {
          const active = s.id === stageId;
          const done = visited.has(s.id) && !active;
          const stp = stagesWithSteps.find((x) => x.id === s.id)?.steps || [];
          return (
            <React.Fragment key={s.id}>
              {i > 0 && <span style={styles.connector} aria-hidden="true" />}
              <button type="button" onClick={() => pick(s.id)} className="gw-focusable" style={{ ...styles.node, ...(active ? styles.nodeActive : null) }} aria-current={active ? "step" : undefined}>
                <span style={styles.nodeHead}>
                  <span style={{ ...styles.num, ...(active ? styles.numActive : done ? styles.numDone : null) }}>{done ? <Check size={13} /> : i + 1}</span>
                  <span style={styles.nodeMeta}>
                    <span style={{ ...styles.nodeName, ...(active ? styles.nodeNameActive : null) }}>{s.label}</span>
                    <span style={styles.nodeCt}>{stp.length} step{stp.length === 1 ? "" : "s"}</span>
                  </span>
                </span>
                <span style={styles.pips}>
                  {stp.map((st) => <span key={st.id} title={st.instruction} style={{ ...styles.pip, background: gwTypeMeta(st.type).color }} />)}
                  {stp.length === 0 && <span style={styles.pipEmpty} />}
                </span>
              </button>
            </React.Fragment>
          );
        })}
      </nav>

      <div style={styles.cols}>
        <div style={styles.main}>
          <div style={styles.lead}><span style={styles.leadBar} aria-hidden="true" /><span style={styles.leadTxt}>{stage.purpose}</span></div>

          {isAct && (
            <>
              <div style={styles.triageTabs}>
                {actScenarios.map((sc) => (
                  <button key={sc.id} type="button" onClick={() => { setTriage(sc.id); setSelId(null); }} className="gw-focusable" style={{ ...styles.triageTab, ...(sc.id === triage ? styles.triageTabActive : null) }}>
                    <span style={styles.lanePill}><GitBranch size={12} color="var(--color-icon-tertiary-fg)" />{sc.label}</span>
                    <span style={styles.triageCt}>{sc.steps.length} steps</span>
                  </button>
                ))}
              </div>
              {GW_SCENARIOS[triage] && (
                <div style={styles.fork}><span style={styles.forkLbl}>Run this path when</span><span style={styles.forkQ}>{GW_SCENARIOS[triage].triggerScenario}</span></div>
              )}
            </>
          )}

          {steps.map((step, i) => {
            const sel = selId === step.id;
            const n = hintCount(step);
            return (
              <button key={step.id} type="button" onClick={() => setSelId(step.id)} className="gw-focusable" style={{ ...styles.row, ...(sel ? styles.rowSel : null) }} aria-pressed={sel}>
                <span style={styles.ord}>{i + 1}</span>
                <span style={styles.rowMain}>
                  <span style={styles.rowL1}><TypeTag type={step.type} /><span style={styles.instr}>{step.instruction || "Untitled step"}</span></span>
                  <span style={styles.rowL2}>
                    <span style={styles.hintCount}><Lightbulb size={12} color={n ? "var(--color-icon-tertiary-fg)" : "var(--color-text-placeholder)"} />{n ? `${n} hint${n > 1 ? "s" : ""}` : "No hints"}</span>
                    {step.requirement === "required" && <RequirementTag requirement="required" />}
                    <GroundingChip grounding={step.grounding} />
                  </span>
                </span>
              </button>
            );
          })}

          <AddStepCta onClick={() => onAddBlank(isAct ? "act" : stageId)} label={`Add a step to ${stage.label}`} />
        </div>

        {selected && (
          <aside style={styles.sidecar} className="gw-curtain" aria-label="Step detail">
            <div style={styles.scInner}>
              <header style={styles.scHead}>
                <span style={styles.scKicker}>{STAGE_OF(selected, stagesWithSteps)} · step detail</span>
                <button type="button" onClick={() => setSelId(null)} className="gw-focusable" style={styles.scClose} aria-label="Close detail"><X size={16} color="var(--color-text-tertiary)" /></button>
              </header>
              <StepDetailBody
                step={selected}
                onUpdateInstruction={onUpdateInstruction}
                onCycleType={onCycleType}
                onCycleRequirement={onCycleRequirement}
                onRemove={(id) => { onRemove(id); setSelId(null); }}
              />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

function STAGE_OF(step, stagesWithSteps) {
  const s = stagesWithSteps.find((x) => x.steps.some((y) => y.id === step.id));
  return s ? s.label : "Step";
}

const styles = {
  wrap: { display: "flex", flexDirection: "column", gap: 20 },

  stepper: { display: "flex", alignItems: "stretch", gap: 0, background: "var(--surface-white)", border: "1px solid var(--color-divider-card)", borderRadius: 14, boxShadow: "var(--shadow-card)", padding: 8, flexWrap: "wrap" },
  connector: { alignSelf: "center", flex: "0 0 16px", height: 2, borderRadius: 2, background: "var(--color-divider-card)" },
  node: { flex: 1, minWidth: 120, display: "flex", flexDirection: "column", gap: 8, padding: "10px 12px", borderRadius: 11, background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left" },
  nodeActive: { background: "var(--color-icon-tertiary-bg)" },
  nodeHead: { display: "flex", alignItems: "center", gap: 9 },
  num: { width: 24, height: 24, flexShrink: 0, borderRadius: 999, display: "inline-grid", placeItems: "center", fontSize: 12, fontWeight: 700, background: "var(--color-chip-bg)", color: "var(--color-text-tertiary)" },
  numActive: { background: "var(--color-button-primary-bg)", color: "#fff" },
  numDone: { background: "var(--color-success-text)", color: "#fff" },
  nodeMeta: { minWidth: 0, lineHeight: 1.15 },
  nodeName: { display: "block", fontSize: 12.5, fontWeight: 700, letterSpacing: "0.03em", textTransform: "uppercase", color: "var(--color-text-medium)", whiteSpace: "nowrap" },
  nodeNameActive: { color: "var(--color-button-primary-bg)" },
  nodeCt: { display: "block", fontSize: 10.5, color: "var(--color-text-tertiary)", fontWeight: 500 },
  pips: { display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap", paddingLeft: 33 },
  pip: { width: 7, height: 7, borderRadius: 999 },
  pipEmpty: { width: 7, height: 7, borderRadius: 999, border: "1px dashed var(--color-divider-card)" },

  cols: { display: "flex", gap: 24, alignItems: "flex-start" },
  main: { display: "flex", flexDirection: "column", gap: 10, flex: 1, minWidth: 0 },
  lead: { display: "flex", gap: 11, alignItems: "flex-start", margin: "2px 0 4px" },
  leadBar: { flexShrink: 0, width: 3, alignSelf: "stretch", borderRadius: 3, background: "var(--color-button-primary-bg)", minHeight: 30 },
  leadTxt: { fontSize: 14, lineHeight: 1.55, color: "var(--color-text-medium)" },

  triageTabs: { display: "flex", gap: 8, flexWrap: "wrap" },
  triageTab: { flex: 1, minWidth: 180, textAlign: "left", background: "var(--surface-white)", border: "1px solid var(--color-divider-card)", borderRadius: 12, padding: "10px 13px", cursor: "pointer", fontFamily: "inherit" },
  triageTabActive: { borderColor: "var(--color-button-primary-bg)", boxShadow: "inset 0 0 0 1px var(--color-button-primary-bg)", background: "var(--color-primary-alpha-12)" },
  lanePill: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, fontWeight: 700, color: "var(--color-text-deep)" },
  triageCt: { display: "block", fontSize: 11.5, color: "var(--color-text-tertiary)", marginTop: 3 },
  fork: { display: "flex", flexDirection: "column", gap: 3, padding: "11px 14px", borderRadius: 12, background: "var(--surface-dim)", borderLeft: "3px solid var(--color-icon-tertiary-fg)" },
  forkLbl: { fontSize: 11, fontWeight: 700, color: "var(--color-icon-tertiary-fg)", textTransform: "uppercase", letterSpacing: "0.03em" },
  forkQ: { fontSize: 13.5, color: "var(--color-text-deep)", lineHeight: 1.5, fontWeight: 500 },

  row: { display: "flex", gap: 11, padding: "12px 14px", borderRadius: 12, background: "var(--surface-white)", border: "1px solid var(--color-divider-card)", cursor: "pointer", textAlign: "left", fontFamily: "inherit", width: "100%", boxSizing: "border-box" },
  rowSel: { borderColor: "var(--color-button-primary-bg)", background: "var(--color-primary-alpha-12)" },
  ord: { width: 22, height: 22, flexShrink: 0, borderRadius: 7, background: "var(--color-chip-bg)", color: "var(--color-text-medium)", display: "inline-grid", placeItems: "center", fontSize: 12, fontWeight: 700, marginTop: 1 },
  rowMain: { display: "flex", flexDirection: "column", gap: 6, minWidth: 0, flex: 1 },
  rowL1: { display: "flex", alignItems: "flex-start", gap: 7, flexWrap: "wrap" },
  instr: { fontSize: 14, fontWeight: 600, color: "var(--color-text-deep)", lineHeight: 1.4 },
  rowL2: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  hintCount: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 600, color: "var(--color-text-tertiary)" },

  sidecar: { width: 360, flexShrink: 0, position: "sticky", top: 16, alignSelf: "flex-start" },
  scInner: { display: "flex", flexDirection: "column", gap: 14, padding: 16, borderRadius: 14, background: "var(--surface-white)", border: "1px solid var(--color-divider-card)", boxShadow: "var(--shadow-card)" },
  scHead: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  scKicker: { fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--color-text-tertiary)" },
  scClose: { background: "transparent", border: "none", cursor: "pointer", padding: 6, margin: -6, borderRadius: 6, display: "inline-flex" },
};
