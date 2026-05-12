"use client";

import React from "react";
import DashboardShell from "../components/DashboardShell";
import AppSwitcherPopover from "../components/AppSwitcherPopover";
import InsightsHubPage from "../components/InsightsHubPage";
import LearningHubPage from "../components/LearningHubPage";
import DrillDetailPage from "../components/DrillDetailPage";
import NewRoleplayPage from "../components/NewRoleplayPage";
import NewRoleplayContextPage from "../components/NewRoleplayContextPage";
import InteractionsPage from "../components/InteractionsPage";
import MissionsPage from "../components/MissionsPage";
import MissionWizardPage, {
  EMPTY_MISSION_DRAFT,
} from "../components/MissionWizardPage";
import ComingSoon from "../components/ComingSoon";
import AskMiraProPage from "../components/AskMiraProPage";
import MiraSetupContextPanel from "../components/MiraSetupContextPanel";
import MiraChatsPage from "../components/MiraChatsPage";
import {
  RESPONSE_TEMPLATE,
  INITIAL_MIRA_CONVERSATIONS,
} from "../components/mocks/miraConversation";

const MIRA_RESPONSE_DELAY_MS = 800;

const EMPTY_ROLEPLAY = {
  persona: {
    category: "",
    language: "",
    reason: "",
    objective: "",
    complexity: "",
    duration: 5,
  },
  context: {
    objections: "",
    products: "",
    context: "",
  },
};
import PageLayout from "../components/PageLayout";
import SideNav from "../components/SideNav/SideNav";
import FilterPanel from "../components/FilterPanel";
import { insightsHubConfig } from "../components/SideNav/configs/insightsHubConfig";
import { learningHubConfig } from "../components/SideNav/configs/learningHubConfig";
import { askMiraConfig } from "../components/SideNav/configs/askMiraConfig";

// Single page-resolver per module. Built routes map to real components;
// missing routes map to <ComingSoon pageName=… />. No 404s, no blank screens.
const INSIGHTS_PAGES = {
  // rocket → children
  "contact-center":     { Component: InsightsHubPage,  pageName: "Contact Center" },
  "reports":            { Component: ComingSoon,        pageName: "Reports" },
  // direct
  "interaction":        { Component: ComingSoon,        pageName: "Interaction" },
  // headset → children
  "agent-performance":  { Component: ComingSoon,        pageName: "Agent Performance" },
  "session":            { Component: ComingSoon,        pageName: "Session" },
  // parent ids fall back to first child
  "rocket":             { Component: InsightsHubPage,  pageName: "Contact Center" },
  "headset":            { Component: ComingSoon,        pageName: "Agent Performance" },
};

const LEARNING_PAGES = {
  "drill":        { Component: LearningHubPage, pageName: "Drill" },
  "interactions": { Component: InteractionsPage, pageName: "Interactions" },
  "agents":       { Component: ComingSoon,      pageName: "Agents" },
  "missions":     { Component: MissionsPage,    pageName: "Missions" },
};

const MIRA_PAGES = {
  "chat":    { Component: AskMiraProPage,  pageName: "Ask Mira Pro" },
  "history": { Component: MiraChatsPage,   pageName: "Chats" },
};

function resolvePage(map, navId, fallbackName = "Page") {
  const entry = map[navId];
  if (entry) return entry;
  return { Component: ComingSoon, pageName: fallbackName };
}

export default function Page() {
  const [currentPage, setCurrentPage] = React.useState("insights"); // 'insights' | 'learning' | 'mira'
  const [insightsNav, setInsightsNav] = React.useState("contact-center");
  const [learningNav, setLearningNav] = React.useState("drill");
  const [miraNav, setMiraNav] = React.useState("chat");
  const [miraSetupOpen, setMiraSetupOpen] = React.useState(false);
  const [miraConversations, setMiraConversations] = React.useState(INITIAL_MIRA_CONVERSATIONS);
  const [miraActiveId, setMiraActiveId] = React.useState(null);
  const [miraPendingTurnId, setMiraPendingTurnId] = React.useState(null);
  const [miraQueriesUsed, setMiraQueriesUsed] = React.useState(13);
  const [appMenuOpen, setAppMenuOpen] = React.useState(false);
  const [filtersOpen, setFiltersOpen] = React.useState(false);

  const submitMiraQuestion = React.useCallback((value) => {
    const now = Date.now();
    const turnId = `turn-${now}`;
    const newTurn = { id: turnId, question: value, response: null };
    const newConvId = miraActiveId ? null : `conv-${now}`;

    setMiraConversations((prev) => {
      if (miraActiveId) {
        return prev.map((c) =>
          c.id === miraActiveId
            ? { ...c, turns: [...c.turns, newTurn] }
            : c
        );
      }
      return [
        ...prev,
        {
          id: newConvId,
          firstQuestion: value,
          createdAt: now,
          turns: [newTurn],
        },
      ];
    });

    if (newConvId) setMiraActiveId(newConvId);
    setMiraPendingTurnId(turnId);
    setMiraQueriesUsed((n) => n + 1);

    setTimeout(() => {
      setMiraConversations((prev) =>
        prev.map((c) => ({
          ...c,
          turns: c.turns.map((t) =>
            t.id === turnId ? { ...t, response: RESPONSE_TEMPLATE } : t
          ),
        }))
      );
      setMiraPendingTurnId(null);
    }, MIRA_RESPONSE_DELAY_MS);
  }, [miraActiveId]);

  const startNewMiraChat = React.useCallback(() => {
    setMiraActiveId(null);
    setMiraPendingTurnId(null);
    setMiraNav("chat");
  }, []);

  const openMiraConversation = React.useCallback((id) => {
    setMiraActiveId(id);
    setMiraPendingTurnId(null);
    setMiraNav("chat");
  }, []);
  const [drillDetailId, setDrillDetailId] = React.useState(null);
  const [roleplayStep, setRoleplayStep] = React.useState(null); // null | 'persona' | 'context' | 'generated'
  const [roleplay, setRoleplay] = React.useState(EMPTY_ROLEPLAY);
  // Create Mission wizard — null means closed (MissionsPage renders); any
  // step id ('define' | 'coverage' | 'focus' | 'recruit' | 'preview')
  // means the wizard is mounted.
  const [missionWizardStep, setMissionWizardStep] = React.useState(null);
  const [missionDraft, setMissionDraft] = React.useState(EMPTY_MISSION_DRAFT);
  const appMenuTriggerRef = React.useRef(null);

  const cancelRoleplay = () => {
    setRoleplayStep(null);
    setRoleplay(EMPTY_ROLEPLAY);
  };

  const openMissionWizard = () => {
    setMissionDraft(EMPTY_MISSION_DRAFT);
    setMissionWizardStep("define");
  };
  const closeMissionWizard = () => {
    setMissionWizardStep(null);
    setMissionDraft(EMPTY_MISSION_DRAFT);
  };
  const saveMissionDraft = (draft) => {
    // TODO: persist draft mission server-side; logging for prototype.
    console.log("save draft", draft);
  };
  const publishMission = () => {
    // TODO: publish flow lands in a later wizard update.
    console.log("publish mission", missionDraft);
    closeMissionWizard();
  };

  if (currentPage === "mira") {
    const { Component: MiraPage, pageName } = resolvePage(MIRA_PAGES, miraNav, "Ask Mira Pro");
    const isChat = miraNav === "chat";
    const isHistory = miraNav === "history";
    const activeConv = miraActiveId
      ? miraConversations.find((c) => c.id === miraActiveId)
      : null;
    const miraRightPanel = isChat && miraSetupOpen
      ? <MiraSetupContextPanel open onClose={() => setMiraSetupOpen(false)} />
      : null;
    // Panel is gated on isChat (history route doesn't show the composer),
    // but allowed in both home + chat conversation states since the chip
    // lives in the composer that persists across both.

    let miraContent;
    if (isChat) {
      miraContent = (
        <MiraPage
          pageName={pageName}
          conversation={activeConv?.turns ?? []}
          pendingTurnId={miraPendingTurnId}
          queriesUsed={miraQueriesUsed}
          onSubmit={submitMiraQuestion}
          onReset={startNewMiraChat}
          setupContextOpen={miraSetupOpen}
          onToggleSetupContext={() => setMiraSetupOpen((o) => !o)}
        />
      );
    } else if (isHistory) {
      miraContent = (
        <MiraPage
          conversations={miraConversations}
          onOpen={openMiraConversation}
          onNewChat={startNewMiraChat}
        />
      );
    } else {
      miraContent = <MiraPage pageName={pageName} />;
    }

    return (
      <>
        <SideNav
          config={askMiraConfig}
          activeId={miraNav}
          onSelect={(id) => {
            if (id !== "chat") setMiraSetupOpen(false);
            setMiraNav(id);
          }}
          appSwitcherTriggerRef={appMenuTriggerRef}
          onAppSwitcherClick={() => setAppMenuOpen((o) => !o)}
        />
        <PageLayout
          rightPanel={miraRightPanel}
          onPanelClose={() => setMiraSetupOpen(false)}
        >
          {miraContent}
        </PageLayout>
        <AppSwitcherPopover
          open={appMenuOpen}
          onClose={() => setAppMenuOpen(false)}
          anchorRef={appMenuTriggerRef}
          currentPage={currentPage}
          onSelectPage={(page) => {
            setMiraSetupOpen(false);
            setCurrentPage(page);
            setAppMenuOpen(false);
          }}
        />
      </>
    );
  }

  if (currentPage === "learning") {
    const { Component: LearningPage, pageName } = resolvePage(LEARNING_PAGES, learningNav, "Learning Hub");
    const onDrill = learningNav === "drill";
    const onMissions = learningNav === "missions";
    const missionsPopulated = onMissions && !missionWizardStep;

    let drillContent;
    if (onMissions && missionWizardStep) {
      drillContent = (
        <MissionWizardPage
          step={missionWizardStep}
          draft={missionDraft}
          onChange={setMissionDraft}
          onStepChange={setMissionWizardStep}
          onCancel={closeMissionWizard}
          onSave={saveMissionDraft}
          onPublish={publishMission}
        />
      );
    } else if (onDrill && roleplayStep === "generated") {
      drillContent = <ComingSoon pageName="Roleplay Generation" />;
    } else if (onDrill && roleplayStep === "context") {
      drillContent = (
        <NewRoleplayContextPage
          value={roleplay.context}
          onChange={(next) => setRoleplay((r) => ({ ...r, context: next }))}
          onCancel={cancelRoleplay}
          onPrevious={() => setRoleplayStep("persona")}
          onGenerate={() => setRoleplayStep("generated")}
          onSkipAndGenerate={() => setRoleplayStep("generated")}
          onViewSample={() => console.log("View sample — out of scope")}
        />
      );
    } else if (onDrill && roleplayStep === "persona") {
      drillContent = (
        <NewRoleplayPage
          value={roleplay.persona}
          onChange={(next) => setRoleplay((r) => ({ ...r, persona: next }))}
          onCancel={cancelRoleplay}
          onNext={() => setRoleplayStep("context")}
          onViewSample={() => console.log("View sample — out of scope")}
        />
      );
    } else if (onDrill && drillDetailId) {
      drillContent = (
        <DrillDetailPage
          cardId={drillDetailId}
          onBack={() => setDrillDetailId(null)}
        />
      );
    } else if (!missionsPopulated) {
      drillContent = (
        <LearningPage
          pageName={pageName}
          onOpenDrill={(id) => setDrillDetailId(id)}
          onCreateRoleplay={() => {
            setRoleplay(EMPTY_ROLEPLAY);
            setRoleplayStep("persona");
          }}
          onCreateMission={openMissionWizard}
        />
      );
    }

    return (
      <>
        <SideNav
          config={learningHubConfig}
          activeId={learningNav}
          onSelect={(id) => {
            setDrillDetailId(null);
            cancelRoleplay();
            closeMissionWizard();
            setLearningNav(id);
          }}
          appSwitcherTriggerRef={appMenuTriggerRef}
          onAppSwitcherClick={() => setAppMenuOpen((o) => !o)}
        />
        {missionsPopulated ? (
          <MissionsPage onCreateMission={openMissionWizard} />
        ) : (
          <PageLayout>{drillContent}</PageLayout>
        )}
        <AppSwitcherPopover
          open={appMenuOpen}
          onClose={() => setAppMenuOpen(false)}
          anchorRef={appMenuTriggerRef}
          currentPage={currentPage}
          onSelectPage={(page) => {
            setDrillDetailId(null);
            cancelRoleplay();
            setDrillDetailId(null);
            cancelRoleplay();
            closeMissionWizard();
            setCurrentPage(page);
            setAppMenuOpen(false);
          }}
        />
      </>
    );
  }

  const { Component: InsightsPage, pageName } = resolvePage(INSIGHTS_PAGES, insightsNav, "Insights Hub");
  const isInsightsHome = insightsNav === "contact-center";
  const insightsRightPanel = isInsightsHome && filtersOpen
    ? <FilterPanel open onClose={() => setFiltersOpen(false)} />
    : null;

  return (
    <DashboardShell
      config={insightsHubConfig}
      activeId={insightsNav}
      onSelect={(id) => {
        if (id !== "contact-center") setFiltersOpen(false);
        setInsightsNav(id);
      }}
      onAppMenuClick={() => setAppMenuOpen((o) => !o)}
      appMenuTriggerRef={appMenuTriggerRef}
      rightPanel={insightsRightPanel}
      onPanelClose={() => setFiltersOpen(false)}
    >
      <InsightsPage
        pageName={pageName}
        filtersOpen={filtersOpen}
        onToggleFilters={() => setFiltersOpen((o) => !o)}
      />

      <AppSwitcherPopover
        open={appMenuOpen}
        onClose={() => setAppMenuOpen(false)}
        anchorRef={appMenuTriggerRef}
        currentPage={currentPage}
        onSelectPage={(page) => {
          setCurrentPage(page);
          setAppMenuOpen(false);
        }}
      />
    </DashboardShell>
  );
}
