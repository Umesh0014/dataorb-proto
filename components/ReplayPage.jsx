"use client";

import React from "react";
import ReplayLanding from "./ReplayLanding";
import ReplayCreateWizard from "./ReplayCreateWizard";
import ReplayRecordView from "./ReplayRecordView";
import ReplayPlayer from "./ReplayPlayer";
import { REPLAY_COLLECTIONS, EMPTY_REPLAY_DRAFT, OUTCOME_LABELS } from "./mocks/replays";

// ReplayPage — Learning Hub Replay module entry point. Renders inside the
// PageLayout supplied by app/page.jsx (no layout primitives here).
//
// The module is a small set of linked surfaces, so the screen state lives
// here rather than in the URL router (it doesn't need to survive a module
// switch — leaving Replay resets to the landing list, matching the other
// in-module flows like the Mission/ Guide wizards). Surfaces:
//   landing → collections list + review sidecar (no top-level actions)
//   create  → 3-step collection wizard (Setup · Configure · Preview)
//   record  → one collection: published + to-review replays, Edit/Approve
//   player  → coached playback of one replay (Guide-pattern two-column)
//
// Collections are held in local state so the demo can publish a new draft
// and approve / archive a suggested replay without a backend.

const NEW_COLLECTION_ID = "col-draft-new";

export default function ReplayPage({ pageName, locale = "en", onLocaleChange }) {
  const [collections, setCollections] = React.useState(REPLAY_COLLECTIONS);
  const [screen, setScreen] = React.useState("landing");
  const [collectionId, setCollectionId] = React.useState(null);
  const [replayId, setReplayId] = React.useState(null);

  // Create-wizard state — null step means the wizard isn't mounted.
  const [draft, setDraft] = React.useState(EMPTY_REPLAY_DRAFT);
  const [wizardStep, setWizardStep] = React.useState("setup");

  React.useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const previous = document.title;
    document.title = pageName || "Replay";
    return () => { document.title = previous; };
  }, [pageName]);

  const collection = collections.find((c) => c.id === collectionId) || null;
  const replay = collection?.replays.find((r) => r.id === replayId) || null;

  const openCreate = () => {
    setDraft(EMPTY_REPLAY_DRAFT);
    setWizardStep("setup");
    setScreen("create");
  };
  const openCollection = (id) => { setCollectionId(id); setScreen("record"); };
  const openPlayer = (id) => { setReplayId(id); setScreen("player"); };
  const backToLanding = () => { setScreen("landing"); setCollectionId(null); setReplayId(null); };

  // Publish a new collection from the wizard. It lands as a draft the team
  // can fill — the AI hasn't sampled any calls yet, so replayCount is 0.
  const publishCollection = () => {
    const newCol = {
      id: NEW_COLLECTION_ID,
      name: draft.name || "Untitled collection",
      outcome: outcomeKeyFor(draft.businessOutcome),
      driver: draft.driver,
      description: draft.description,
      maintainedBy: draft.publishMode === "auto" ? "ai" : "self",
      publishMode: draft.publishMode,
      state: "active",
      createdBy: { name: "You", initial: "Y", bg: "#EDE9FE", fg: "#6650A5" },
      replayCount: 0,
      reviewCount: 0,
      lastUpdated: new Date().toISOString().slice(0, 10),
      objective: draft.objective,
      config: {
        eligibilityWindow: draft.eligibilityWindow,
        maxReplays: draft.maxReplays,
        refreshFrequency: draft.refreshFrequency,
        outputLanguageMode: draft.outputLanguageMode,
      },
      replays: [],
    };
    setCollections((prev) => [newCol, ...prev.filter((c) => c.id !== NEW_COLLECTION_ID)]);
    backToLanding();
  };

  // Review actions (manual-review collections). Approve generates audio
  // (cost-deferred until now) then publishes; archive hides the replay —
  // there is no "reject" anywhere in the flow.
  const updateReplay = (rId, patch) => {
    setCollections((prev) => prev.map((c) =>
      c.id !== collectionId ? c : {
        ...c,
        replays: c.replays.map((r) => (r.id === rId ? { ...r, ...patch } : r)),
      },
    ));
  };
  const approveReplay = (rId) => {
    updateReplay(rId, { status: "generating", audioReady: false });
    window.setTimeout(() => {
      updateReplay(rId, {
        status: "published",
        audioReady: true,
        publishedAt: new Date().toISOString().slice(0, 10),
      });
    }, 2600);
  };
  const archiveReplay = (rId) => updateReplay(rId, { status: "archived" });

  if (screen === "create") {
    return (
      <ReplayCreateWizard
        step={wizardStep}
        draft={draft}
        onChange={setDraft}
        onStepChange={setWizardStep}
        onCancel={backToLanding}
        onPublish={publishCollection}
      />
    );
  }
  if (screen === "record" && collection) {
    return (
      <ReplayRecordView
        collection={collection}
        onBack={backToLanding}
        onPlay={openPlayer}
        onApprove={approveReplay}
        onArchive={archiveReplay}
        onSaveEdit={updateReplay}
      />
    );
  }
  if (screen === "player" && collection && replay) {
    return (
      <ReplayPlayer
        collection={collection}
        replay={replay}
        onBack={() => setScreen("record")}
      />
    );
  }

  return (
    <ReplayLanding
      collections={collections}
      onOpenCollection={openCollection}
      onCreate={openCreate}
      locale={locale}
      onLocaleChange={onLocaleChange}
    />
  );
}

// Map a free-text business-outcome label back to an outcome tint key so a
// freshly created collection still gets a coloured avatar.
function outcomeKeyFor(label) {
  const entry = Object.entries(OUTCOME_LABELS).find(([, v]) => v === label);
  return entry ? entry[0] : "retention";
}
