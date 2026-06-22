"use client";

import React from "react";
import { ChevronDown, GripVertical, Plus, MessageSquareQuote, BarChart3, Trash2, GitBranch } from "lucide-react";
import { TypeTag, RequirementTag, GroundingChip, SuccessChip, EvidenceCard, ScriptQuote } from "./GuidedWorkflowBits";
import { SuggestionGrid, AddStepCta } from "./GuidedWorkflowStepDetail";
import { gwEvidence, gwGroupStage } from "./mocks/guidedWorkflows";

// Checklist · sectioned with conditional scenarios. The research-grounded
// simple checklist: stages are collapsible sections (Todoist-style), steps
// are inline rows with drag/keyboard reorder + inline add. Where a stage has
// multiple scenarios (e.g. Act → Retention save vs Billing correction), the
// scenario steps sit under a plain "If <trigger>" header — show/hide
// conditional tasks (Process Street model), never a branching tree.

export default function GuidedWorkflowSectionedEditor({
  stagesWithSteps,
  suggestions = [],
  onCycleRequirement,
  onAcceptSuggestion,
  onAddBlank,
  onRemove,
  onMove,
}) {
  const [collapsed, setCollapsed] = React.useState({});
  const [openScript, setOpenScript] = React.useState(null);
  const [openEvi, setOpenEvi] = React.useState(null);
  const [openSuggest, setOpenSuggest] = React.useState(null);
  const toggle = (m, id) => m((c) => (c === id ? null : id));

  const rowProps = { openScript, setOpenScript, openEvi, setOpenEvi, onCycleRequirement, onRemove, onMove };

  return (
    <div style={styles.wrap}>
      {stagesWithSteps.map((stage, i) => {
        const isOpen = !collapsed[stage.id];
        const { alwaysOn, scenarios } = gwGroupStage(stage.steps);
        return (
          <section key={stage.id} style={styles.section} aria-label={`${stage.label} stage`}>
            <header style={styles.head}>
              <button type="button" onClick={() => setCollapsed((c) => ({ ...c, [stage.id]: !c[stage.id] }))} className="gw-focusable" style={styles.toggle} aria-expanded={isOpen}>
                <ChevronDown size={16} color="var(--color-text-tertiary)" style={{ transform: isOpen ? "none" : "rotate(-90deg)", transition: "transform 150ms ease" }} />
                <span style={styles.idx}>{i + 1}</span>
                <span style={styles.name}>{stage.label}</span>
                <span style={styles.count}>{stage.steps.length}</span>
              </button>
              <span style={styles.purpose}>{stage.purpose}</span>
            </header>

            {isOpen && (
              <div style={styles.body}>
                {alwaysOn.map((step) => <StepRow key={step.id} step={step} {...rowProps} />)}
                <AddStepCta onClick={() => onAddBlank(stage.id)} label={`Add a step to ${stage.label}`} />

                {scenarios.map((sc) => (
                  <div key={sc.id} style={styles.scenario}>
                    <div style={styles.scHead}>
                      <GitBranch size={14} color="var(--color-icon-tertiary-fg)" />
                      <span style={styles.scIf}>If</span>
                      <span style={styles.scTrigger}>{sc.trigger}</span>
                      <span style={styles.scTag}>Conditional scenario</span>
                    </div>
                    <div style={styles.scBody}>
                      {sc.steps.map((step) => <StepRow key={step.id} step={step} scenario {...rowProps} />)}
                      <AddStepCta onClick={() => onAddBlank(stage.id)} label="Add a step to this scenario" />
                    </div>
                  </div>
                ))}

                {suggestions.some((s) => s.stage === stage.id) && (
                  <>
                    <span style={styles.subLabel}>Suggested for {stage.label}</span>
                    <SuggestionGrid stageId={stage.id} suggestions={suggestions} columns={3} onAccept={onAcceptSuggestion} expanded={openSuggest} onToggle={(id) => toggle(setOpenSuggest, id)} />
                  </>
                )}
                <button type="button" onClick={() => onAddBlank(stage.id)} className="gw-focusable" style={styles.addScenario}>
                  <GitBranch size={13} color="var(--color-text-tertiary)" /> Add a conditional scenario
                </button>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

function StepRow({ step, scenario, openScript, setOpenScript, openEvi, setOpenEvi, onCycleRequirement, onRemove, onMove }) {
  const evidence = step.evidence ?? gwEvidence(step.id);
  const scriptOpen = openScript === step.id;
  const eviOpen = openEvi === step.id;
  const onGripKey = (e) => {
    if (e.key === "ArrowUp") { e.preventDefault(); onMove(step.id, "up"); }
    else if (e.key === "ArrowDown") { e.preventDefault(); onMove(step.id, "down"); }
  };
  return (
    <div style={{ ...styles.row, ...(scenario ? styles.rowScenario : null) }}>
      <button type="button" onKeyDown={onGripKey} className="gw-focusable" style={styles.grip} aria-label={`Reorder ${step.instruction || "step"} — arrow keys to move`}>
        <GripVertical size={15} color="var(--color-text-placeholder)" />
      </button>
      <span style={styles.box} aria-hidden="true" />
      <div style={styles.main}>
        <span style={styles.instruction}>{step.instruction || "Untitled step"}</span>
        <div style={styles.tags}>
          <TypeTag type={step.type} />
          <button type="button" onClick={() => onCycleRequirement(step.id)} className="gw-focusable" style={styles.iconBtn} aria-label="Change requirement"><RequirementTag requirement={step.requirement} /></button>
          <GroundingChip grounding={step.grounding} />
          <SuccessChip evidence={evidence} />
        </div>
        <div style={styles.foot}>
          {step.script && (
            <button type="button" onClick={() => setOpenScript(scriptOpen ? null : step.id)} className="gw-focusable" style={styles.link} aria-expanded={scriptOpen}>
              <MessageSquareQuote size={13} color="var(--color-button-primary-bg)" />{scriptOpen ? "Hide script" : "Script"}
            </button>
          )}
          {evidence && (
            <button type="button" onClick={() => setOpenEvi(eviOpen ? null : step.id)} className="gw-focusable" style={styles.link} aria-expanded={eviOpen}>
              <BarChart3 size={13} color="var(--color-button-primary-bg)" />{eviOpen ? "Hide evidence" : "Evidence"}
            </button>
          )}
          <div style={{ flex: 1 }} />
          <button type="button" onClick={() => onRemove(step.id)} className="gw-focusable" style={styles.trash} aria-label="Remove step"><Trash2 size={14} color="var(--color-text-tertiary)" /></button>
        </div>
        {scriptOpen && step.script && <ScriptQuote script={step.script} grounding={step.grounding} />}
        {eviOpen && <EvidenceCard evidence={evidence} />}
      </div>
    </div>
  );
}

const styles = {
  wrap: { display: "flex", flexDirection: "column", gap: 18 },
  section: { display: "flex", flexDirection: "column", gap: 10 },
  head: { display: "flex", flexDirection: "column", gap: 2 },
  toggle: { display: "inline-flex", alignItems: "center", gap: 9, background: "transparent", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" },
  idx: { width: 22, height: 22, borderRadius: 6, background: "var(--color-icon-tertiary-bg)", color: "var(--color-icon-tertiary-fg)", fontSize: 12, fontWeight: 700, display: "inline-grid", placeItems: "center" },
  name: { fontSize: 15, fontWeight: 700, color: "var(--color-text-deep)" },
  count: { fontSize: 12, fontWeight: 700, color: "var(--color-text-tertiary)", fontFamily: "var(--font-mono)" },
  purpose: { fontSize: 12.5, color: "var(--color-text-tertiary)", lineHeight: 1.5, paddingLeft: 31 },
  body: { display: "flex", flexDirection: "column", gap: 8, paddingLeft: 31 },
  row: { display: "flex", gap: 8, padding: "11px 14px", borderRadius: 10, background: "var(--surface-white)", border: "1px solid var(--color-divider-card)" },
  rowScenario: { background: "var(--surface-dim)" },
  grip: { display: "inline-flex", alignItems: "flex-start", paddingTop: 2, background: "transparent", border: "none", cursor: "grab", borderRadius: 6 },
  box: { width: 16, height: 16, borderRadius: 4, border: "1.6px solid var(--color-divider-card)", marginTop: 1, flexShrink: 0 },
  main: { display: "flex", flexDirection: "column", gap: 6, minWidth: 0, flex: 1 },
  instruction: { fontSize: 14, fontWeight: 600, color: "var(--color-text-deep)", lineHeight: 1.4 },
  tags: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 },
  iconBtn: { background: "transparent", border: "none", padding: 0, cursor: "pointer", display: "inline-flex" },
  foot: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" },
  link: { display: "inline-flex", alignItems: "center", gap: 5, background: "transparent", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit", fontSize: 12.5, fontWeight: 700, color: "var(--color-button-primary-bg)" },
  trash: { background: "transparent", border: "none", cursor: "pointer", padding: 8, margin: -6, display: "inline-flex", borderRadius: 6 },
  scenario: { display: "flex", flexDirection: "column", gap: 8, padding: "12px 14px", borderRadius: 10, background: "var(--color-icon-tertiary-bg)", border: "1px solid var(--color-border-tab)", borderLeft: "3px solid var(--color-icon-tertiary-fg)" },
  scHead: { display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" },
  scIf: { fontSize: 12, fontWeight: 700, color: "var(--color-icon-tertiary-fg)", textTransform: "uppercase", letterSpacing: "0.05em" },
  scTrigger: { fontSize: 13, fontWeight: 600, color: "var(--color-text-deep)" },
  scTag: { fontSize: 10.5, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--color-icon-tertiary-fg)", background: "var(--surface-white)", border: "1px solid var(--color-border-tab)", borderRadius: 4, padding: "2px 7px" },
  scBody: { display: "flex", flexDirection: "column", gap: 8 },
  subLabel: { fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--color-text-tertiary)", marginTop: 4 },
  addScenario: { display: "inline-flex", alignItems: "center", gap: 7, alignSelf: "flex-start", background: "transparent", border: "1px dashed var(--color-divider-card)", borderRadius: 999, padding: "8px 14px", cursor: "pointer", fontFamily: "inherit", fontSize: 12.5, fontWeight: 600, color: "var(--color-text-tertiary)" },
};
