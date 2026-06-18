"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import VersionBar from "./VersionBar";
import Banner from "./Banner";
import GuidedWorkflowLibrary from "./GuidedWorkflowLibrary";
import GuidedWorkflowChecklistEditor from "./GuidedWorkflowChecklistEditor";
import GuidedWorkflowBoardEditor from "./GuidedWorkflowBoardEditor";
import GuidedWorkflowStudioEditor from "./GuidedWorkflowStudioEditor";
import GuidedWorkflowWizardEditor from "./GuidedWorkflowWizardEditor";
import GuidedWorkflowDocEditor from "./GuidedWorkflowDocEditor";
import GuidedWorkflowTableEditor from "./GuidedWorkflowTableEditor";
import GuidedWorkflowCoauthorEditor from "./GuidedWorkflowCoauthorEditor";
import { CreateOverlay, AttachOverlay, PublishOverlay } from "./GuidedWorkflowDialogs";
import { StepModal } from "./GuidedWorkflowStepDetail";
import { TabContext, EditorChrome, DirectionsHelp } from "./GuidedWorkflowChrome";
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
// Workflows" tab in Drill. Three directions ride one VersionBar — A·Checklist
// (list grouped by stage), B·Board (stage swim-lanes), C·Studio (outline +
// evidence). Library + create + chrome are shared; only the editor body
// differs. Honours the locked decisions: edit-mode = create-mode (nothing
// blank), flat checklist (no branching), unlimited attempts, audit first.

// New directions (this run) ride the VersionBar as primary chips; the earlier
// three are kept but tucked into a "Bombed ideas" dropdown (baselineOptions).
const DIRECTIONS = [
  { id: "wizard", label: "Wizard", iterations: [] },
  { id: "document", label: "Document", iterations: [] },
  { id: "table", label: "Table", iterations: [] },
  { id: "coauthor", label: "Co-author", iterations: [] },
];
const BOMBED = [
  { id: "safe", label: "Checklist (bombed)" },
  { id: "balanced", label: "Board (bombed)" },
  { id: "ambitious", label: "Studio (bombed)" },
];

const REQUIREMENT_CYCLE = ["required", "conditional", "recommended"];
const TYPE_CYCLE = ["action", "compliance", "decision"];
const VALID_STAGES = new Set(GW_STAGES.map((s) => s.id));

export default function GuidedWorkflowsPage({ onBack }) {
  const [variant, setVariant] = React.useState("wizard");
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
  const [justPublished, setJustPublished] = React.useState(false);
  // The step shown in the side-curtain drawer (Checklist + Board). Studio
  // edits in-pane, so it ignores this.
  const [openStepId, setOpenStepId] = React.useState(null);

  const stagesWithSteps = gwStepsByStage(steps);
  const openStep = steps.find((s) => s.id === openStepId) || null;

  const saveDraft = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };
  const doPublish = () => {
    setConfirmPublish(false);
    setWorkflowState("active");
    setJustPublished(true);
    window.setTimeout(() => setJustPublished(false), 2600);
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

  const cycleField = (stepId, field, cycle) =>
    setSteps((prev) =>
      prev.map((s) =>
        s.id === stepId ? { ...s, [field]: cycle[(cycle.indexOf(s[field]) + 1) % cycle.length] } : s,
      ),
    );
  const cycleRequirement = (stepId) => cycleField(stepId, "requirement", REQUIREMENT_CYCLE);
  const cycleType = (stepId) => cycleField(stepId, "type", TYPE_CYCLE);
  const updateInstruction = (stepId, value) =>
    setSteps((prev) => prev.map((s) => (s.id === stepId ? { ...s, instruction: value, editedByLead: true } : s)));

  // Add a blank step to a stage and open it in the drawer so it's editable
  // from the moment it appears.
  const addBlankStep = (stageHint) => {
    const stage = VALID_STAGES.has(stageHint) ? stageHint : "discover";
    const id = `new-${Date.now()}`;
    setSteps((prev) => [
      ...prev,
      { id, stage, instruction: "", detail: "Describe what the agent should do here.", type: "action", requirement: "recommended", script: null, knowledge: null, grounding: null, subSteps: [] },
    ]);
    setOpenStepId(id);
  };

  const removeStep = (stepId) => setSteps((prev) => prev.filter((s) => s.id !== stepId));

  // Drag-and-drop reorder (Checklist). Dropping onto a target moves the
  // dragged step before it and adopts the target's stage (cross-stage move).
  const reorderStep = (draggedId, targetId) => {
    if (draggedId === targetId) return;
    setSteps((prev) => {
      const arr = [...prev];
      const from = arr.findIndex((s) => s.id === draggedId);
      const target = arr.find((s) => s.id === targetId);
      if (from < 0 || !target) return prev;
      const [moved] = arr.splice(from, 1);
      moved.stage = target.stage;
      arr.splice(arr.findIndex((s) => s.id === targetId), 0, moved);
      return arr;
    });
  };

  // Keyboard-operable reorder (G11): move a step up/down in the visual order
  // (stage order, then within-stage order). Crossing a stage boundary makes
  // the step adopt the neighbouring stage — the keyboard equivalent of the
  // drag-across move.
  const moveStep = (stepId, dir) =>
    setSteps((prev) => {
      const order = [];
      GW_STAGES.forEach((st) => prev.forEach((s) => { if (s.stage === st.id) order.push(s); }));
      const i = order.findIndex((s) => s.id === stepId);
      const j = dir === "up" ? i - 1 : i + 1;
      if (i < 0 || j < 0 || j >= order.length) return prev;
      const next = order.slice();
      next[i] = next[j];
      next[j] = { ...order[i], stage: order[j].stage };
      return next;
    });

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
    onCycleType: cycleType,
    onUpdateInstruction: updateInstruction,
    onRemove: removeStep,
    onOpenStep: setOpenStepId,
    onAddBlank: addBlankStep,
    onReorder: reorderStep,
    onMove: moveStep,
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
              justPublished={justPublished}
              attachedCount={attached.length}
              onBack={() => setView("library")}
              onAttach={() => setAttachOpen(true)}
              onSave={saveDraft}
              onPublish={() => setConfirmPublish(true)}
            />
            <Banner
              tone="info"
              leading={<Sparkles size={20} color="var(--color-button-primary-bg)" style={{ flexShrink: 0 }} aria-hidden="true" />}
              heading="AI drafted this base workflow"
              body={`From ${isNew ? 3 : 12} interactions, grounded in real calls — edit any step, change what's required, or accept a suggested step below. Each carries its success rate and the phrasing agents used.`}
            />
            {variant === "wizard" ? (
              <GuidedWorkflowWizardEditor {...editorProps} />
            ) : variant === "document" ? (
              <GuidedWorkflowDocEditor {...editorProps} />
            ) : variant === "table" ? (
              <GuidedWorkflowTableEditor {...editorProps} />
            ) : variant === "coauthor" ? (
              <GuidedWorkflowCoauthorEditor {...editorProps} />
            ) : variant === "safe" ? (
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
      {/* Board edits a step in a centered modal; Checklist expands the card
          inline and Studio edits in its right pane, so neither uses this. */}
      {variant === "balanced" && openStep && (
        <StepModal
          step={openStep}
          onClose={() => setOpenStepId(null)}
          onUpdateInstruction={updateInstruction}
          onCycleType={cycleType}
          onCycleRequirement={cycleRequirement}
          onRemove={removeStep}
        />
      )}

      <VersionBar
        versions={DIRECTIONS}
        baselineOptions={BOMBED}
        baselineLabel="Bombed ideas"
        value={{ versionId: variant, iterationId: null }}
        onChange={({ versionId }) => setVariant(versionId)}
        help={<DirectionsHelp />}
      />
    </>
  );
}

const styles = {
  column: { display: "flex", flexDirection: "column", gap: 24, width: "100%", flex: 1, minHeight: 0 },
  editorWrap: { display: "flex", flexDirection: "column", gap: 20 },
};
