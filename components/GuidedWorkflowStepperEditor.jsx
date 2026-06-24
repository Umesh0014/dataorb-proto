"use client";

import React from "react";
import { GitBranch, Plus, X, ChevronDown, ChevronUp, ExternalLink, Sparkles, Trash2, MessageSquareQuote } from "lucide-react";
import { TypeTag, GroundingChip } from "./GuidedWorkflowBits";
import { StepDetailBody } from "./GuidedWorkflowStepDetail";
import { GW_STAGES, GW_SCENARIOS, gwGroupStage, GW_REVIEW_CONTEXT } from "./mocks/guidedWorkflows";

// Stepper + sidecar. The category spine is a horizontal stepper (Open →
// Close), each node a numbered circle. Selecting a category reveals its steps
// as cards in the panel below; Act is triage, so it offers a path selector
// first. Clicking a step card opens a docked sidecar (slide-in) with the full
// step detail. A collapsible context panel sits above the stepper.

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
  const [ctxCollapsed, setCtxCollapsed] = React.useState(false);
  const [selId, setSelId] = React.useState(null);

  const stage = GW_STAGES.find((s) => s.id === stageId);
  const isAct = stageId === "act";
  const steps = isAct ? (actScenarios.find((sc) => sc.id === triage)?.steps || []) : (stagesWithSteps.find((s) => s.id === stageId)?.steps || []);
  const allSteps = stagesWithSteps.flatMap((s) => s.steps);
  const selected = allSteps.find((s) => s.id === selId) || null;

  const pick = (id) => { setStageId(id); setSelId(null); };

  return (
    <div style={styles.wrap}>
      <ContextPanel collapsed={ctxCollapsed} onToggle={() => setCtxCollapsed((c) => !c)} />

      <nav style={styles.stepper} aria-label="Workflow stages">
        {GW_STAGES.map((s, i) => {
          const active = s.id === stageId;
          const stp = stagesWithSteps.find((x) => x.id === s.id)?.steps || [];
          return (
            <React.Fragment key={s.id}>
              {i > 0 && <span style={styles.connector} aria-hidden="true" />}
              <button type="button" onClick={() => pick(s.id)} className="gw-focusable" style={{ ...styles.node, ...(active ? styles.nodeActive : null) }} aria-current={active ? "step" : undefined}>
                <span style={{ ...styles.num, ...(active ? styles.numActive : null) }}>{i + 1}</span>
                <span style={styles.nodeMeta}>
                  <span style={{ ...styles.nodeName, ...(active ? styles.nodeNameActive : null) }}>{s.label}</span>
                  <span style={styles.nodeCt}>{stp.length} step{stp.length === 1 ? "" : "s"}</span>
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
              <div
                key={step.id} role="button" tabIndex={0} aria-pressed={sel}
                onClick={() => setSelId(step.id)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelId(step.id); } }}
                className="gw-focusable" style={{ ...styles.scard, ...(sel ? styles.scardSel : null) }}
              >
                <div style={styles.scardTop}>
                  <span style={styles.ordPill}>{i + 1}</span>
                  <TypeTag type={step.type} />
                  <span style={{ flex: 1 }} />
                  <span style={styles.scardId}>{step.id}</span>
                </div>
                <div style={styles.instr}>{step.instruction || "New step — describe what the agent should do."}</div>
                <div style={styles.scardFoot}>
                  <button type="button" onClick={(e) => { e.stopPropagation(); setSelId(step.id); }} className="gw-focusable" style={styles.hintChip}>
                    <MessageSquareQuote size={14} /> Hints <span style={styles.hintN}>{n}</span>
                  </button>
                  <span style={{ flex: 1 }} />
                  <GroundingChip grounding={step.grounding} />
                  <button type="button" onClick={(e) => { e.stopPropagation(); onRemove(step.id); if (sel) setSelId(null); }} className="gw-focusable" style={styles.del} aria-label="Remove step"><Trash2 size={15} color="var(--color-text-tertiary)" /></button>
                </div>
              </div>
            );
          })}

          <button type="button" onClick={() => onAddBlank(isAct ? "act" : stageId)} className="gw-focusable" style={styles.addStep}>
            <Plus size={16} /> Add a step
          </button>
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

function ContextPanel({ collapsed, onToggle }) {
  return (
    <div style={{ ...styles.ctx, ...(collapsed ? styles.ctxCollapsedBox : null) }}>
      <div style={styles.ctxBar}>
        <span style={styles.ctxLabel}>Context</span>
        <span style={styles.ctxSrc}>Generated from interaction <b>30471</b></span>
        <button type="button" className="gw-focusable" style={styles.ctxView}>View interaction <ExternalLink size={12} /></button>
        <span style={{ flex: 1 }} />
        <button type="button" onClick={onToggle} className="gw-focusable" style={styles.ctxToggle}>
          {collapsed ? "Show context" : "Hide context"}{collapsed ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
        </button>
      </div>
      {!collapsed && (
        <div style={styles.ctxGrid}>
          <div style={styles.ctxCol}>
            <div style={styles.ctxH}>Customer situation</div>
            <p style={styles.ctxP}>{GW_REVIEW_CONTEXT.situation}</p>
          </div>
          <div style={{ ...styles.ctxCol, ...styles.ctxColAccent }}>
            <div style={styles.ctxH}><Sparkles size={13} color="var(--color-icon-tertiary-fg)" /> Winning insight</div>
            <p style={styles.ctxP}>{GW_REVIEW_CONTEXT.insight}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function STAGE_OF(step, stagesWithSteps) {
  const s = stagesWithSteps.find((x) => x.steps.some((y) => y.id === step.id));
  return s ? s.label : "Step";
}

const styles = {
  wrap: { display: "flex", flexDirection: "column", gap: 20 },

  ctx: { borderRadius: 14, background: "var(--color-icon-tertiary-bg)", border: "1px solid var(--color-border-tab)", overflow: "hidden" },
  ctxCollapsedBox: { background: "var(--surface-dim)" },
  ctxBar: { display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", flexWrap: "wrap" },
  ctxLabel: { fontSize: 11, fontWeight: 700, color: "var(--color-icon-tertiary-fg)", textTransform: "uppercase", letterSpacing: "0.05em" },
  ctxSrc: { fontSize: 12.5, color: "var(--color-text-medium)" },
  ctxView: { display: "inline-flex", alignItems: "center", gap: 4, background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 700, color: "var(--color-button-primary-bg)", padding: "3px 6px", borderRadius: 7 },
  ctxToggle: { display: "inline-flex", alignItems: "center", gap: 5, background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 12.5, fontWeight: 700, color: "var(--color-icon-tertiary-fg)", padding: "5px 10px", borderRadius: 8 },
  ctxGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, padding: "2px 16px 16px" },
  ctxCol: { background: "var(--surface-white)", border: "1px solid var(--color-divider-card)", borderRadius: 12, padding: "13px 15px" },
  ctxColAccent: { borderColor: "var(--color-border-tab)" },
  ctxH: { display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 700, color: "var(--color-icon-tertiary-fg)", textTransform: "uppercase", letterSpacing: "0.03em" },
  ctxP: { margin: "7px 0 0", fontSize: 13, color: "var(--color-text-medium)", lineHeight: 1.55 },

  stepper: { display: "flex", alignItems: "center", gap: 0, background: "var(--surface-white)", border: "1px solid var(--color-divider-card)", borderRadius: 14, boxShadow: "var(--shadow-card)", padding: 8, flexWrap: "wrap" },
  connector: { alignSelf: "center", flex: "0 0 16px", height: 2, borderRadius: 2, background: "var(--color-divider-card)" },
  node: { flex: 1, minWidth: 120, display: "flex", alignItems: "center", gap: 9, padding: "10px 12px", borderRadius: 11, background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left" },
  nodeActive: { background: "var(--color-icon-tertiary-bg)" },
  num: { width: 24, height: 24, flexShrink: 0, borderRadius: 999, display: "inline-grid", placeItems: "center", fontSize: 12, fontWeight: 700, background: "var(--color-chip-bg)", color: "var(--color-text-tertiary)" },
  numActive: { background: "var(--color-button-primary-bg)", color: "#fff" },
  nodeMeta: { minWidth: 0, lineHeight: 1.15 },
  nodeName: { display: "block", fontSize: 12.5, fontWeight: 700, letterSpacing: "0.03em", textTransform: "uppercase", color: "var(--color-text-medium)", whiteSpace: "nowrap" },
  nodeNameActive: { color: "var(--color-button-primary-bg)" },
  nodeCt: { display: "block", fontSize: 10.5, color: "var(--color-text-tertiary)", fontWeight: 500 },

  cols: { display: "flex", gap: 24, alignItems: "flex-start" },
  main: { display: "flex", flexDirection: "column", gap: 12, flex: 1, minWidth: 0 },
  lead: { display: "flex", gap: 11, alignItems: "flex-start", margin: "2px 0 0" },
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

  scard: { background: "var(--surface-white)", border: "1px solid var(--color-divider-card)", borderRadius: 14, boxShadow: "var(--shadow-card)", padding: "16px 18px", cursor: "pointer" },
  scardSel: { borderColor: "var(--color-button-primary-bg)", boxShadow: "inset 0 0 0 1px var(--color-button-primary-bg)" },
  scardTop: { display: "flex", alignItems: "center", gap: 10, marginBottom: 10 },
  ordPill: { width: 24, height: 24, flexShrink: 0, borderRadius: 7, background: "var(--color-chip-bg)", color: "var(--color-text-medium)", display: "inline-grid", placeItems: "center", fontSize: 12, fontWeight: 700 },
  scardId: { fontSize: 11, color: "var(--color-text-tertiary)", fontWeight: 500, background: "var(--surface-dim)", border: "1px solid var(--color-divider-card)", borderRadius: 999, padding: "2px 9px", fontFamily: "var(--font-mono)" },
  instr: { fontSize: 14.5, lineHeight: 1.55, color: "var(--color-text-deep)", fontWeight: 600 },
  scardFoot: { display: "flex", alignItems: "center", gap: 8, marginTop: 13 },
  hintChip: { display: "inline-flex", alignItems: "center", gap: 7, background: "var(--surface-dim)", border: "1px solid var(--color-divider-card)", borderRadius: 999, padding: "5px 12px 5px 10px", fontSize: 12.5, fontWeight: 700, color: "var(--color-text-medium)", cursor: "pointer", fontFamily: "inherit" },
  hintN: { background: "var(--color-button-primary-bg)", color: "#fff", borderRadius: 999, minWidth: 17, height: 17, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10.5, padding: "0 4px" },
  del: { background: "transparent", border: "none", cursor: "pointer", padding: 7, margin: -5, borderRadius: 8, display: "inline-flex" },
  addStep: { width: "100%", border: "1.5px dashed var(--color-divider-card)", background: "transparent", borderRadius: 12, padding: 13, color: "var(--color-text-tertiary)", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, cursor: "pointer", fontFamily: "inherit" },

  sidecar: { width: 360, flexShrink: 0, position: "sticky", top: 16, alignSelf: "flex-start" },
  scInner: { display: "flex", flexDirection: "column", gap: 14, padding: 16, borderRadius: 14, background: "var(--surface-white)", border: "1px solid var(--color-divider-card)", boxShadow: "var(--shadow-card)" },
  scHead: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  scKicker: { fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--color-text-tertiary)" },
  scClose: { background: "transparent", border: "none", cursor: "pointer", padding: 6, margin: -6, borderRadius: 6, display: "inline-flex" },
};
