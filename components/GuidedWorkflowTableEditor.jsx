"use client";

import React from "react";
import { Plus, MessageSquareQuote, ArrowUpDown } from "lucide-react";
import { TypeTag, RequirementTag, GroundingChip, SuccessChip, AiMark } from "./GuidedWorkflowBits";
import { gwEvidence, GW_STAGES } from "./mocks/guidedWorkflows";

// Table · workflow grid. Every step is a row; stage / type / requirement /
// script / grounding / success are columns. The lead scans and bulk-edits
// like a spreadsheet — densest at-a-glance audit of the whole workflow.
// Mental model: database/grid — distinct from the bombed list/board/split.

const STAGE_LABEL = Object.fromEntries(GW_STAGES.map((s) => [s.id, s.label]));
const STAGE_ORDER = Object.fromEntries(GW_STAGES.map((s, i) => [s.id, i]));
const COLS = "32px minmax(220px,1fr) 96px 104px 120px 132px 150px";

export default function GuidedWorkflowTableEditor({ steps, onCycleRequirement, onCycleType, onAddBlank }) {
  const ordered = [...steps].sort((a, b) => (STAGE_ORDER[a.stage] - STAGE_ORDER[b.stage]));

  return (
    <div style={styles.wrap}>
      <div style={styles.toolbar}>
        <AiMark label="AI-drafted from 12 interactions" />
        <span style={styles.count}>{steps.length} steps · {steps.filter((s) => s.requirement === "required").length} required</span>
      </div>

      <div style={styles.scroller}>
        <div style={styles.table}>
          <div style={{ ...styles.row, ...styles.headRow }}>
            <Hd>#</Hd><Hd sort>Step</Hd><Hd sort>Stage</Hd><Hd>Type</Hd><Hd sort>Required</Hd><Hd>Grounding</Hd><Hd sort>Success</Hd>
          </div>
          {ordered.map((step, i) => {
            const ev = step.evidence ?? gwEvidence(step.id);
            return (
              <div key={step.id} style={styles.row}>
                <Cell><span style={styles.idx}>{i + 1}</span></Cell>
                <Cell>
                  <span style={styles.stepTitle}>{step.instruction || "Untitled step"}</span>
                  {step.script && <MessageSquareQuote size={12} color="var(--color-button-primary-bg)" aria-label="Has a script" style={{ flexShrink: 0 }} />}
                </Cell>
                <Cell><span style={styles.stagePill}>{STAGE_LABEL[step.stage]}</span></Cell>
                <Cell>
                  <button type="button" onClick={() => onCycleType?.(step.id)} className="gw-focusable" style={styles.cellBtn} aria-label="Change type"><TypeTag type={step.type} /></button>
                </Cell>
                <Cell>
                  <button type="button" onClick={() => onCycleRequirement(step.id)} className="gw-focusable" style={styles.cellBtn} aria-label="Change requirement"><RequirementTag requirement={step.requirement} /></button>
                </Cell>
                <Cell><GroundingChip grounding={step.grounding} /></Cell>
                <Cell>{ev ? <SuccessChip evidence={ev} /> : <span style={styles.dash}>—</span>}</Cell>
              </div>
            );
          })}
          <button type="button" onClick={() => onAddBlank("discover")} className="gw-focusable" style={styles.addRow}>
            <Plus size={14} color="var(--color-button-primary-bg)" /> Add a row
          </button>
        </div>
      </div>
    </div>
  );
}

function Hd({ children, sort }) {
  return <div style={styles.hd}>{children}{sort && <ArrowUpDown size={12} color="var(--color-text-placeholder)" />}</div>;
}
function Cell({ children }) {
  return <div style={styles.cell}>{children}</div>;
}

const styles = {
  wrap: { display: "flex", flexDirection: "column", gap: 14 },
  toolbar: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 },
  count: { fontSize: 12.5, fontWeight: 600, color: "var(--color-text-tertiary)", fontFamily: "var(--font-mono)" },
  scroller: { overflowX: "auto", border: "1px solid var(--color-divider-card)", borderRadius: 12, background: "var(--surface-white)" },
  table: { minWidth: 880, display: "flex", flexDirection: "column" },
  row: { display: "grid", gridTemplateColumns: COLS, alignItems: "center", gap: 12, padding: "10px 16px", borderBottom: "1px solid var(--color-divider-card)" },
  headRow: { background: "var(--surface-dim)", position: "sticky", top: 0 },
  hd: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--color-text-tertiary)" },
  cell: { display: "inline-flex", alignItems: "center", gap: 8, minWidth: 0 },
  idx: { fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "var(--color-text-tertiary)" },
  stepTitle: { fontSize: 13.5, fontWeight: 600, color: "var(--color-text-deep)", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  stagePill: { fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--color-text-tertiary)", background: "var(--surface-dim)", border: "1px solid var(--color-divider-card)", borderRadius: 4, padding: "2px 8px" },
  cellBtn: { background: "transparent", border: "none", padding: 0, cursor: "pointer", display: "inline-flex" },
  dash: { color: "var(--color-text-placeholder)", fontSize: 13 },
  addRow: { display: "inline-flex", alignItems: "center", gap: 7, background: "transparent", border: "none", cursor: "pointer", padding: "12px 16px", fontFamily: "inherit", fontSize: 13, fontWeight: 600, color: "var(--color-button-primary-bg)" },
};
