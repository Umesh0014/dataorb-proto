"use client";

import React from "react";
import { ArrowLeft, Link2, Sparkles, Target, Check } from "lucide-react";
import Button from "./Button";
import StatusBadge from "./StatusBadge";
import VersionBar from "./VersionBar";
import GuidedWorkflowLibrary from "./GuidedWorkflowLibrary";
import GuidedWorkflowChecklistEditor from "./GuidedWorkflowChecklistEditor";
import GuidedWorkflowBoardEditor from "./GuidedWorkflowBoardEditor";
import GuidedWorkflowStudioEditor from "./GuidedWorkflowStudioEditor";
import { CreateOverlay, AttachOverlay, PublishOverlay } from "./GuidedWorkflowDialogs";
import { AiMark } from "./GuidedWorkflowBits";
import {
  GUIDED_WORKFLOWS,
  GW_STEPS,
  GW_STAGES,
  GW_FLAGSHIP_META,
  GW_SUGGESTED_STEPS,
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
  const [suggestions, setSuggestions] = React.useState(GW_SUGGESTED_STEPS);
  const [attached, setAttached] = React.useState(GW_PERSONAS.filter((p) => p.attached).map((p) => p.id));
  // Publish / save journeys (G14, INT-8): a workflow is draft or active;
  // Publish is confirmed before it goes live; Save draft gives transient
  // feedback. State seeds from whether this is a new or existing workflow.
  const [workflowState, setWorkflowState] = React.useState("active");
  const [confirmPublish, setConfirmPublish] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  const stagesWithSteps = gwStepsByStage(steps);

  // Edits to a step's script are lifted here so they persist across a
  // collapse or a variant switch and are attributed (INT-7: the AI draft is
  // a starting point; the lead's edit is owned and kept).
  const updateScript = (stepId, value) =>
    setSteps((prev) => prev.map((s) => (s.id === stepId ? { ...s, script: value, editedByLead: true } : s)));

  const saveDraft = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };
  const doPublish = () => {
    setConfirmPublish(false);
    setWorkflowState("active");
  };

  // Accept an AI suggestion → it folds into the checklist as a normal step
  // (keeping its grounding) and leaves the suggestions tray.
  const acceptSuggestion = (id) => {
    const sug = suggestions.find((s) => s.id === id);
    if (!sug) return;
    // Keep its inline evidence on the step so the proof survives acceptance
    // (base steps resolve evidence from the mock map; accepted ones carry it).
    setSteps((prev) => [...prev, { ...sug }]);
    setSuggestions((prev) => prev.filter((s) => s.id !== id));
  };

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

  const openExisting = () => { setIsNew(false); setWorkflowState("active"); setSteps(GW_STEPS); setView("editor"); };
  const startCreate = () => setCreateOpen(true);
  const confirmCreate = () => { setCreateOpen(false); setIsNew(true); setWorkflowState("draft"); setSteps(GW_STEPS); setView("editor"); };

  const editorProps = {
    meta: GW_FLAGSHIP_META,
    steps,
    stagesWithSteps,
    suggestions,
    onAcceptSuggestion: acceptSuggestion,
    onCycleRequirement: cycleRequirement,
    onUpdateScript: updateScript,
    onAddStep: addStep,
    onRemoveStep: removeStep,
  };

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
              state={workflowState}
              saved={saved}
              attachedCount={attached.length}
              onBack={() => setView("library")}
              onAttach={() => setAttachOpen(true)}
              onSave={saveDraft}
              onPublish={() => setConfirmPublish(true)}
            />
            <div style={styles.baseBanner}>
              <Sparkles size={16} color="var(--color-button-primary-bg)" aria-hidden="true" />
              <span style={styles.baseBannerText}>
                <b>AI drafted this base workflow</b> from {isNew ? 3 : 12} interactions, grounded in real
                calls. Edit any step, change what's required, or accept a suggested step below — each
                one carries the success rate and the phrasing agents used.
              </span>
            </div>
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
      {confirmPublish && (
        <PublishOverlay attachedCount={attached.length} onClose={() => setConfirmPublish(false)} onConfirm={doPublish} />
      )}
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

// Real breadcrumb navigation, not simulated tabs (G12): the sibling Drill
// sections are buttons that route back to Drill; the current page is marked
// aria-current. No inert role="tab" spans.
function TabContext({ onBack }) {
  return (
    <nav style={styles.tabContext} aria-label="Drill sections">
      <button type="button" onClick={onBack} style={styles.backLink}>
        <ArrowLeft size={15} color="var(--color-text-medium)" />
        Drill
      </button>
      <span style={styles.crumbDot} aria-hidden="true" />
      <div style={styles.miniTabs}>
        <button type="button" onClick={onBack} style={styles.miniTab}>Active drills</button>
        <button type="button" onClick={onBack} style={styles.miniTab}>Library</button>
        <span style={{ ...styles.miniTab, ...styles.miniTabActive }} aria-current="page">Guided workflows</span>
      </div>
    </nav>
  );
}

function EditorChrome({ isNew, state, saved, attachedCount, onBack, onAttach, onSave, onPublish }) {
  const meta = GW_FLAGSHIP_META;
  const isDraft = state === "draft";
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
          <Button variant="text" uppercase={false} onClick={onSave} leadingIcon={saved ? <Check size={15} /> : undefined}>
            {saved ? "Saved" : "Save draft"}
          </Button>
          <Button variant="primary" onClick={onPublish}>{isDraft ? "Publish" : "Update & republish"}</Button>
        </div>
      </div>

      <div style={styles.chromeTitleRow}>
        <h2 style={styles.chromeTitle}>{isNew ? "Untitled guided workflow" : meta.title}</h2>
        <StatusBadge tone={isDraft ? "info" : "success"}>{isDraft ? "Draft" : "Active"}</StatusBadge>
        {!isDraft && (
          <span style={styles.liveNote}>
            <Check size={13} color="var(--color-success-text)" aria-hidden="true" />
            Live to {attachedCount} persona{attachedCount === 1 ? "" : "s"}
          </span>
        )}
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
  miniTab: {
    fontSize: 13, fontWeight: 500, color: "var(--color-text-tertiary)", padding: "4px 10px", borderRadius: 999,
    background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit",
  },
  miniTabActive: { color: "var(--color-button-primary-bg)", background: "var(--color-primary-alpha-12)", fontWeight: 700, cursor: "default" },
  liveNote: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: "var(--color-success-text)" },

  editorWrap: { display: "flex", flexDirection: "column", gap: 20 },
  baseBanner: {
    display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 16px", borderRadius: 10,
    background: "var(--color-primary-alpha-12)", border: "1px solid var(--color-button-primary-bg)",
  },
  baseBannerText: { fontSize: 13, color: "var(--color-text-medium)", lineHeight: 1.55 },
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
};

const vbHelp = {
  title: { fontSize: 13, fontWeight: 700, color: "var(--vb-txt)" },
  text: { margin: 0, fontSize: 12, lineHeight: 1.5, color: "var(--vb-txt)" },
  hint: { margin: "4px 0 0", fontSize: 11, lineHeight: 1.5, color: "var(--vb-muted)" },
};
