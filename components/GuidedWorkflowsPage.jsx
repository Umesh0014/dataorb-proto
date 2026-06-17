"use client";

import React from "react";
import { ArrowLeft, Link2, Sparkles, Check, X, Target, FileText } from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import StatusBadge from "./StatusBadge";
import VersionBar from "./VersionBar";
import GuidedWorkflowLibrary from "./GuidedWorkflowLibrary";
import GuidedWorkflowChecklistEditor from "./GuidedWorkflowChecklistEditor";
import GuidedWorkflowBoardEditor from "./GuidedWorkflowBoardEditor";
import GuidedWorkflowStudioEditor from "./GuidedWorkflowStudioEditor";
import { AiMark } from "./GuidedWorkflowBits";
import {
  GUIDED_WORKFLOWS,
  GW_STEPS,
  GW_STAGES,
  GW_FLAGSHIP_META,
  GW_SOURCE_INTERACTIONS,
  GW_PERSONAS,
  gwStepsByStage,
} from "./mocks/guidedWorkflows";

// GuidedWorkflowsPage — the TEAM-LEADER authoring experience for Drill
// guided workflows (create / manage / view), reached from a "Guided
// Workflows" tab in the Drill page. Three directions ride one VersionBar:
//   A · Checklist — linear list grouped by stage (Asana-simple, top reuse)
//   B · Board     — five stage swim-lanes + an outcome lane
//   C · Studio    — flat checklist beside the evidence it was mined from
// Library + create entry + editor chrome are shared; only the editor body
// differs. The whole flow honours the locked decisions: edit-mode = create-
// mode (nothing starts blank), flat checklist (no branching), unlimited
// guided attempts in V1, and audit/attachment as first-class data.

const DIRECTIONS = [
  { id: "safe", label: "A · Checklist", iterations: [] },
  { id: "balanced", label: "B · Board", iterations: [] },
  { id: "ambitious", label: "C · Studio", iterations: [] },
];

const REQUIREMENT_CYCLE = ["required", "conditional", "recommended"];
const VALID_STAGES = new Set(GW_STAGES.map((s) => s.id));

export default function GuidedWorkflowsPage({ onBack }) {
  const [variant, setVariant] = React.useState("balanced");
  const [view, setView] = React.useState("library"); // library | editor
  const [isNew, setIsNew] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [attachOpen, setAttachOpen] = React.useState(false);
  const [steps, setSteps] = React.useState(GW_STEPS);
  const [attached, setAttached] = React.useState(GW_PERSONAS.filter((p) => p.attached).map((p) => p.id));

  const stagesWithSteps = gwStepsByStage(steps);

  const cycleRequirement = (stepId) =>
    setSteps((prev) =>
      prev.map((s) =>
        s.id === stepId
          ? { ...s, requirement: REQUIREMENT_CYCLE[(REQUIREMENT_CYCLE.indexOf(s.requirement) + 1) % REQUIREMENT_CYCLE.length] }
          : s,
      ),
    );

  const addStep = (stageHint) => {
    const stage = VALID_STAGES.has(stageHint) ? stageHint : "discover";
    setSteps((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        stage,
        instruction: "New step",
        detail: "Describe what the agent should do here.",
        type: "action",
        requirement: "recommended",
        script: null,
        knowledge: null,
        grounding: null,
        subSteps: [],
      },
    ]);
  };

  const removeStep = (stepId) => setSteps((prev) => prev.filter((s) => s.id !== stepId));

  const openExisting = () => { setIsNew(false); setSteps(GW_STEPS); setView("editor"); };
  const startCreate = () => setCreateOpen(true);
  const confirmCreate = () => { setCreateOpen(false); setIsNew(true); setSteps(GW_STEPS); setView("editor"); };

  const editorProps = { meta: GW_FLAGSHIP_META, steps, stagesWithSteps, onCycleRequirement: cycleRequirement, onAddStep: addStep, onRemoveStep: removeStep };

  return (
    <>
      <div style={styles.column}>
        <TabContext onBack={onBack} />

        {view === "library" ? (
          <GuidedWorkflowLibrary workflows={GUIDED_WORKFLOWS} onOpen={openExisting} onCreate={startCreate} />
        ) : (
          <div style={styles.editorWrap}>
            <EditorChrome
              isNew={isNew}
              attachedCount={attached.length}
              onBack={() => setView("library")}
              onAttach={() => setAttachOpen(true)}
            />
            {variant === "safe" ? (
              <GuidedWorkflowChecklistEditor {...editorProps} />
            ) : variant === "balanced" ? (
              <GuidedWorkflowBoardEditor {...editorProps} />
            ) : (
              <GuidedWorkflowStudioEditor {...editorProps} />
            )}
          </div>
        )}
      </div>

      {createOpen && <CreateOverlay variant={variant} onClose={() => setCreateOpen(false)} onConfirm={confirmCreate} />}
      {attachOpen && (
        <AttachOverlay
          attached={attached}
          onToggle={(id) => setAttached((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]))}
          onClose={() => setAttachOpen(false)}
        />
      )}

      <VersionBar
        tabsMode
        versions={DIRECTIONS}
        baselineOptions={[]}
        value={{ versionId: variant, iterationId: null }}
        onChange={({ versionId }) => setVariant(versionId)}
        help={<DirectionsHelp />}
      />
    </>
  );
}

// ---- Drill-tab context + editor chrome ---------------------------------

function TabContext({ onBack }) {
  const tabs = ["Active drills", "Library", "Guided workflows"];
  return (
    <div style={styles.tabContext}>
      <button type="button" onClick={onBack} style={styles.backLink}>
        <ArrowLeft size={15} color="var(--color-text-medium)" />
        Drill
      </button>
      <span style={styles.crumbDot} aria-hidden="true" />
      <div style={styles.miniTabs} role="tablist" aria-label="Drill sections">
        {tabs.map((t) => {
          const active = t === "Guided workflows";
          return (
            <span
              key={t}
              role="tab"
              aria-selected={active}
              style={{ ...styles.miniTab, ...(active ? styles.miniTabActive : null) }}
            >
              {t}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function EditorChrome({ isNew, attachedCount, onBack, onAttach }) {
  const meta = GW_FLAGSHIP_META;
  return (
    <div style={styles.chrome}>
      <div style={styles.chromeTop}>
        <button type="button" onClick={onBack} style={styles.backLink}>
          <ArrowLeft size={15} color="var(--color-text-medium)" />
          Guided workflows
        </button>
        <div style={styles.chromeActions}>
          <Button variant="text" uppercase={false} leadingIcon={<Link2 size={15} />} onClick={onAttach}>
            {attachedCount > 0 ? `Attached to ${attachedCount}` : "Attach to persona"}
          </Button>
          <Button variant="text" uppercase={false}>Save draft</Button>
          <Button variant="primary">Publish</Button>
        </div>
      </div>

      <div style={styles.chromeTitleRow}>
        <h2 style={styles.chromeTitle}>{isNew ? "Untitled guided workflow" : meta.title}</h2>
        <StatusBadge tone={isNew ? "info" : "success"}>{isNew ? "Draft" : "Active"}</StatusBadge>
      </div>

      <div style={styles.chromeMeta}>
        <span style={styles.chromeMetaItem}><Target size={13} color="var(--color-text-tertiary)" />{meta.jobToBeDone}</span>
      </div>

      <div style={styles.auditStrip}>
        <AiMark label={isNew ? "Drafted from 3 interactions" : "AI-generated · last edited by María Ruiz today"} />
        <span style={styles.auditDot} aria-hidden="true" />
        <span style={styles.auditText}>Unlimited guided attempts per agent</span>
        <span style={styles.auditDot} aria-hidden="true" />
        <span style={styles.auditText}>Flat checklist · no branching</span>
      </div>
    </div>
  );
}

// ---- Create overlay (variant-aware entry) ------------------------------

function CreateOverlay({ variant, onClose, onConfirm }) {
  const [mode, setMode] = React.useState("interactions");
  const [picked, setPicked] = React.useState(GW_SOURCE_INTERACTIONS.filter((i) => i.selected).map((i) => i.id));
  const generateFirst = variant === "balanced";
  const studio = variant === "ambitious";

  const toggle = (id) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length < 10 ? [...p, id] : p));

  const cta = studio ? "Open the studio" : generateFirst ? "Generate workflow" : mode === "paste" ? "Convert to workflow" : "Generate workflow";

  return (
    <Overlay onClose={onClose} title="Create a guided workflow" labelledBy="gw-create-title">
      <p style={styles.ovLead}>
        {studio
          ? "Pick the interactions to mine, or paste a transcript — both open in the studio with a first draft already in place."
          : "Nothing starts from a blank page. Generate a first draft from production interactions, or paste a transcript to convert — then edit."}
      </p>

      <div style={styles.modeRow}>
        <ModeChip active={mode === "interactions"} onClick={() => setMode("interactions")} primary={generateFirst}>
          <Sparkles size={14} /> Pick interactions {generateFirst && "· recommended"}
        </ModeChip>
        <ModeChip active={mode === "paste"} onClick={() => setMode("paste")}>
          <FileText size={14} /> Paste a transcript
        </ModeChip>
      </div>

      {mode === "interactions" ? (
        <div style={styles.intList}>
          <span style={styles.intHint}>Choose up to 10 — {picked.length} selected</span>
          {GW_SOURCE_INTERACTIONS.map((i) => {
            const on = picked.includes(i.id);
            return (
              <button key={i.id} type="button" onClick={() => toggle(i.id)} style={{ ...styles.intRow, ...(on ? styles.intRowOn : null) }} aria-pressed={on}>
                <span style={{ ...styles.check, ...(on ? styles.checkOn : null) }}>{on && <Check size={12} color="var(--surface-white)" />}</span>
                <span style={styles.intMain}>
                  <span style={styles.intCustomer}>{i.customer}</span>
                  <span style={styles.intReason}>{i.reason}</span>
                </span>
                <span style={styles.intMeta}>{i.duration} · {i.outcome}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <textarea
          style={styles.paste}
          rows={7}
          placeholder="Paste a call transcript or a few bullet points describing the conversation…"
          aria-label="Transcript to convert"
        />
      )}

      <div style={styles.ovFoot}>
        <Button variant="text" uppercase={false} onClick={onClose}>Cancel</Button>
        <Button variant="primary" leadingIcon={<Sparkles size={16} />} onClick={onConfirm}>{cta}</Button>
      </div>
    </Overlay>
  );
}

function ModeChip({ active, primary, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...styles.modeChip,
        borderColor: active ? "var(--color-button-primary-bg)" : "var(--color-divider-card)",
        background: active ? "var(--color-primary-alpha-12)" : "var(--surface-white)",
        color: active ? "var(--color-button-primary-bg)" : "var(--color-text-medium)",
        fontWeight: primary || active ? 700 : 500,
      }}
    >
      {children}
    </button>
  );
}

// ---- Attach overlay -----------------------------------------------------

function AttachOverlay({ attached, onToggle, onClose }) {
  return (
    <Overlay onClose={onClose} title="Attach to drill personas" labelledBy="gw-attach-title">
      <p style={styles.ovLead}>
        Agents practise this workflow on the personas you attach it to. In V1 they get unlimited
        guided attempts per persona.
      </p>
      <div style={styles.intList}>
        {GW_PERSONAS.map((p) => {
          const on = attached.includes(p.id);
          return (
            <button key={p.id} type="button" onClick={() => onToggle(p.id)} style={{ ...styles.intRow, ...(on ? styles.intRowOn : null) }} aria-pressed={on}>
              <span style={{ ...styles.check, ...(on ? styles.checkOn : null) }}>{on && <Check size={12} color="var(--surface-white)" />}</span>
              <span style={styles.intMain}>
                <span style={styles.intCustomer}>{p.customer}</span>
                <span style={styles.intReason}>{p.category} · {p.difficulty}</span>
              </span>
              {on && <span style={styles.attachedTag}>Attached</span>}
            </button>
          );
        })}
      </div>
      <div style={styles.ovFoot}>
        <Button variant="primary" onClick={onClose}>Done</Button>
      </div>
    </Overlay>
  );
}

// ---- Shared overlay shell ----------------------------------------------

function Overlay({ title, labelledBy, onClose, children }) {
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div style={styles.scrim} role="dialog" aria-modal="true" aria-labelledby={labelledBy} onMouseDown={onClose}>
      <div style={styles.dialog} onMouseDown={(e) => e.stopPropagation()}>
        <div style={styles.dialogHead}>
          <span id={labelledBy} style={styles.dialogTitle}>{title}</span>
          <button type="button" onClick={onClose} style={styles.closeBtn} aria-label="Close">
            <X size={18} color="var(--color-text-tertiary)" />
          </button>
        </div>
        <div style={styles.dialogBody}>{children}</div>
      </div>
    </div>
  );
}

// ---- VersionBar "?" reasoning chain ------------------------------------

function DirectionsHelp() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <span style={vbHelp.title}>Three ways to author</span>
      <p style={vbHelp.text}>
        <b>A · Checklist</b> — one flat list grouped by stage. Asana-simple, highest reuse. Safest.
      </p>
      <p style={vbHelp.text}>
        <b>B · Board</b> — five stage swim-lanes + an outcome lane; read the shape of the call at a glance.
      </p>
      <p style={vbHelp.text}>
        <b>C · Studio</b> — checklist beside the evidence it was mined from; click a step to see its proof.
      </p>
      <p style={vbHelp.hint}>
        Research: Scribe/Tango show nobody writes SOPs from scratch → generate-first. Process Street →
        the requirement/type tags are the eval contract. All three: flat checklist, no branching.
      </p>
    </div>
  );
}

const styles = {
  column: { display: "flex", flexDirection: "column", gap: 24, width: "100%", flex: 1, minHeight: 0 },

  tabContext: { display: "flex", alignItems: "center", gap: 12 },
  backLink: {
    display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", border: "none",
    cursor: "pointer", padding: 0, fontFamily: "inherit", fontSize: 13, fontWeight: 600, color: "var(--color-text-medium)",
  },
  crumbDot: { width: 3, height: 3, borderRadius: 999, background: "var(--color-text-tertiary)" },
  miniTabs: { display: "inline-flex", alignItems: "center", gap: 4 },
  miniTab: { fontSize: 13, fontWeight: 500, color: "var(--color-text-tertiary)", padding: "4px 10px", borderRadius: 999 },
  miniTabActive: { color: "var(--color-button-primary-bg)", background: "var(--color-primary-alpha-12)", fontWeight: 700 },

  editorWrap: { display: "flex", flexDirection: "column", gap: 20 },
  chrome: { display: "flex", flexDirection: "column", gap: 12, paddingBottom: 16, borderBottom: "1px solid var(--color-divider-card)" },
  chromeTop: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 },
  chromeActions: { display: "inline-flex", alignItems: "center", gap: 16 },
  chromeTitleRow: { display: "flex", alignItems: "center", gap: 12 },
  chromeTitle: { margin: 0, fontSize: 22, fontWeight: 700, color: "var(--color-text-deep)" },
  chromeMeta: { display: "flex", flexWrap: "wrap", gap: 16 },
  chromeMetaItem: { display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13, color: "var(--color-text-medium)", lineHeight: 1.5 },
  auditStrip: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  auditDot: { width: 3, height: 3, borderRadius: 999, background: "var(--color-text-tertiary)" },
  auditText: { fontSize: 12, color: "var(--color-text-tertiary)" },

  // Overlay shell
  scrim: {
    position: "fixed", inset: 0, zIndex: 80, background: "color-mix(in srgb, var(--color-text-deep) 28%, transparent)",
    display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
  },
  dialog: {
    width: "min(560px, 100%)", maxHeight: "86vh", display: "flex", flexDirection: "column",
    background: "var(--surface-white)", borderRadius: 14, boxShadow: "var(--shadow-drawer)", overflow: "hidden",
  },
  dialogHead: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--color-divider-card)" },
  dialogTitle: { fontSize: 16, fontWeight: 700, color: "var(--color-text-deep)" },
  closeBtn: { background: "transparent", border: "none", cursor: "pointer", padding: 6, display: "inline-flex", borderRadius: 8 },
  dialogBody: { padding: 20, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 },
  ovLead: { margin: 0, fontSize: 13, color: "var(--color-text-tertiary)", lineHeight: 1.55 },

  modeRow: { display: "flex", gap: 10, flexWrap: "wrap" },
  modeChip: {
    display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 14px", borderRadius: 10,
    border: "1px solid var(--color-divider-card)", cursor: "pointer", fontFamily: "inherit", fontSize: 13,
  },
  intList: { display: "flex", flexDirection: "column", gap: 8 },
  intHint: { fontSize: 12, fontWeight: 600, color: "var(--color-text-tertiary)" },
  intRow: {
    display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, textAlign: "left",
    background: "var(--surface-white)", border: "1px solid var(--color-divider-card)", cursor: "pointer", fontFamily: "inherit",
  },
  intRowOn: { borderColor: "var(--color-button-primary-bg)", background: "var(--color-primary-alpha-12)" },
  check: {
    width: 18, height: 18, borderRadius: 5, border: "1.5px solid var(--color-divider-card)", flexShrink: 0,
    display: "inline-grid", placeItems: "center", background: "var(--surface-white)",
  },
  checkOn: { background: "var(--color-button-primary-bg)", borderColor: "var(--color-button-primary-bg)" },
  intMain: { display: "flex", flexDirection: "column", gap: 2, minWidth: 0, flex: 1 },
  intCustomer: { fontSize: 13.5, fontWeight: 600, color: "var(--color-text-deep)" },
  intReason: { fontSize: 12, color: "var(--color-text-tertiary)" },
  intMeta: { fontSize: 11.5, fontWeight: 500, color: "var(--color-text-tertiary)", fontFamily: "var(--font-mono)", flexShrink: 0 },
  attachedTag: { fontSize: 11, fontWeight: 700, color: "var(--color-success-text)", flexShrink: 0 },
  paste: {
    width: "100%", boxSizing: "border-box", resize: "vertical", padding: "12px 14px", borderRadius: 10,
    border: "1px solid var(--color-divider-card)", background: "var(--surface-dim)", fontFamily: "var(--font-sans)",
    fontSize: 13, color: "var(--color-text-medium)", lineHeight: 1.55,
  },
  ovFoot: { display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12 },
};

const vbHelp = {
  title: { fontSize: 13, fontWeight: 700, color: "var(--vb-txt)" },
  text: { margin: 0, fontSize: 12, lineHeight: 1.5, color: "var(--vb-txt)" },
  hint: { margin: "4px 0 0", fontSize: 11, lineHeight: 1.5, color: "var(--vb-muted)" },
};
