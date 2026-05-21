"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import DashboardShell from "../../components/DashboardShell";
import AppSwitcherPopover from "../../components/AppSwitcherPopover";
import InsightsHubPage from "../../components/InsightsHubPage";
import LearningHubPage from "../../components/LearningHubPage";
import DrillDetailPage from "../../components/DrillDetailPage";
import NewRoleplayPage from "../../components/NewRoleplayPage";
import NewRoleplayContextPage from "../../components/NewRoleplayContextPage";
import InteractionsPage from "../../components/InteractionsPage";
import AgentsPage from "../../components/AgentsPage";
import AgentProfile from "../../components/AgentProfile";
import MissionsPage from "../../components/MissionsPage";
import MissionWizardPage, {
  EMPTY_MISSION_DRAFT,
} from "../../components/MissionWizardPage";
import ComingSoon from "../../components/ComingSoon";
import AskMiraProPage from "../../components/AskMiraProPage";
import MiraSetupContextPanel from "../../components/MiraSetupContextPanel";
import MiraChatsPage from "../../components/MiraChatsPage";
import SkillsPage from "../../components/SkillsPage";
import SkillRecordPage from "../../components/SkillRecordPage";
import TasksPage from "../../components/TasksPage";
import TaskRecordPage from "../../components/TaskRecordPage";
import CreateTaskWizardPage, {
  EMPTY_TASK_DRAFT,
  SKILL_CATALOGUE,
} from "../../components/CreateTaskWizardPage";
import { TASKS as INITIAL_TASKS } from "../../components/mocks/tasks";
import {
  RESPONSE_TEMPLATE,
  INITIAL_MIRA_CONVERSATIONS,
} from "../../components/mocks/miraConversation";
import PageLayout from "../../components/PageLayout";
import SideNav from "../../components/SideNav/SideNav";
import FilterPanel from "../../components/FilterPanel";
import { insightsHubConfig } from "../../components/SideNav/configs/insightsHubConfig";
import { learningHubConfig } from "../../components/SideNav/configs/learningHubConfig";
import { askMiraConfig } from "../../components/SideNav/configs/askMiraConfig";

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
  "agents":       { Component: AgentsPage,      pageName: "Agents" },
  "missions":     { Component: MissionsPage,    pageName: "Missions" },
};

const MIRA_PAGES = {
  "chat":    { Component: AskMiraProPage, pageName: "Ask Mira Pro" },
  "history": { Component: MiraChatsPage,  pageName: "Chats" },
  "skills":  { Component: SkillsPage,     pageName: "Skills" },
  "tasks":   { Component: TasksPage,      pageName: "Tasks" },
};

function resolvePage(map, navId, fallbackName = "Page") {
  const entry = map[navId];
  if (entry) return entry;
  return { Component: ComingSoon, pageName: fallbackName };
}

const TASK_ID_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function generateTaskId() {
  let out = "";
  for (let i = 0; i < 6; i += 1) {
    out += TASK_ID_ALPHABET[Math.floor(Math.random() * TASK_ID_ALPHABET.length)];
  }
  return out;
}

// ---- URL ↔ nav state ----------------------------------------------------

const DEFAULT_NAV = {
  currentPage: "insights",
  insightsNav: "contact-center",
  learningNav: "drill",
  miraNav: "chat",
};

// deriveNav — pathname → { currentPage, insightsNav, learningNav, miraNav }.
// Unknown paths fall through to the defaults (no 404). Module-only paths
// (/learning, /insights, /mira) resolve to that module's default sub-section
// for rendering; the redirect-to-canonical-URL is handled separately via a
// router.replace effect.
function deriveNav(pathname) {
  if (!pathname || pathname === "/") return { ...DEFAULT_NAV };
  const segs = pathname.split("/").filter(Boolean);
  if (segs.length === 0) return { ...DEFAULT_NAV };

  const next = { ...DEFAULT_NAV };

  if (segs[0] === "insights") {
    next.currentPage = "insights";
    if (segs.length >= 2) {
      if (segs[1] === "agents") {
        // /insights/agents/performance | /insights/agents/session
        next.insightsNav = segs[2] === "session" ? "session" : "agent-performance";
      } else {
        // /insights/contact-center | /insights/reports | /insights/interaction
        next.insightsNav = segs[1];
      }
    }
  } else if (segs[0] === "learning") {
    next.currentPage = "learning";
    if (segs.length >= 2) next.learningNav = segs[1];
  } else if (segs[0] === "mira") {
    next.currentPage = "mira";
    if (segs.length >= 2) next.miraNav = segs[1];
  }
  return next;
}

// Path builders — used wherever the app used to call setCurrentPage /
// setXxxNav. The strings match the `route` fields in the per-module configs.
function pathForCurrentPage(currentPage) {
  if (currentPage === "learning") return "/learning/drill";
  if (currentPage === "mira") return "/mira/chat";
  return "/insights/contact-center";
}

function pathForInsights(id) {
  if (id === "agent-performance") return "/insights/agents/performance";
  if (id === "session") return "/insights/agents/session";
  // Parent ids fall through to their first child's path.
  if (id === "rocket") return "/insights/contact-center";
  if (id === "headset") return "/insights/agents/performance";
  return `/insights/${id}`;
}

function pathForLearning(id) {
  return `/learning/${id}`;
}

function pathForMira(id) {
  return `/mira/${id}`;
}

export default function Page() {
  const pathname = usePathname();
  const router = useRouter();

  // URL is the source of truth for module + sub-section. Derive the four
  // nav ids on every render from the pathname; nav-driving setState calls
  // are replaced with router.push() against the same URL schema.
  const { currentPage, insightsNav, learningNav, miraNav } = React.useMemo(
    () => deriveNav(pathname),
    [pathname],
  );

  // Module-only paths (/insights | /learning | /mira) redirect to the
  // module's default sub-section so the address bar always shows a
  // canonical leaf path. router.replace keeps the redirect out of history.
  React.useEffect(() => {
    if (pathname === "/learning") router.replace(pathForLearning("drill"));
    else if (pathname === "/insights") router.replace(pathForInsights("contact-center"));
    else if (pathname === "/mira") router.replace(pathForMira("chat"));
  }, [pathname, router]);

  const [sidenavExpanded, setSidenavExpanded] = React.useState(false);

  // Restore the SideNav expand/collapse state from localStorage on first
  // mount. Default is collapsed; one-frame flash on first paint is
  // acceptable for V1 (sidenav spec §8).
  React.useEffect(() => {
    if (typeof window === "undefined") return undefined;
    try {
      const stored = window.localStorage.getItem("dataorb.sidenav.expanded");
      if (stored === "true") setSidenavExpanded(true);
    } catch {
      // localStorage blocked (private window etc.) — fall back to default.
    }
    return undefined;
  }, []);

  const handleToggleSidenav = () => {
    const next = !sidenavExpanded;
    try {
      window.localStorage.setItem("dataorb.sidenav.expanded", String(next));
    } catch {
      // ignore write errors
    }
    setSidenavExpanded(next);
  };

  const [skillRecordId, setSkillRecordId] = React.useState(null);
  const [taskRecordId, setTaskRecordId] = React.useState(null);
  const [tasks, setTasks] = React.useState(INITIAL_TASKS);
  const [taskWizardStep, setTaskWizardStep] = React.useState(null);
  const [taskDraft, setTaskDraft] = React.useState(EMPTY_TASK_DRAFT);
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
    router.push(pathForMira("chat"));
  }, [router]);

  const openMiraConversation = React.useCallback((id) => {
    setMiraActiveId(id);
    setMiraPendingTurnId(null);
    router.push(pathForMira("chat"));
  }, [router]);

  const [drillDetailId, setDrillDetailId] = React.useState(null);
  const [agentProfileId, setAgentProfileId] = React.useState(null);
  const [selectedMissionId, setSelectedMissionId] = React.useState(null);
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

  const openTaskWizard = () => {
    setTaskDraft(EMPTY_TASK_DRAFT);
    setTaskWizardStep("skill");
  };
  const closeTaskWizard = () => {
    setTaskWizardStep(null);
    setTaskDraft(EMPTY_TASK_DRAFT);
  };
  const saveTaskDraft = (draft) => {
    // TODO: persist draft task server-side; logging for prototype.
    console.log("save task draft", draft);
  };
  const publishTask = () => {
    const skill = SKILL_CATALOGUE.find((s) => s.id === taskDraft.skillId);
    if (!skill) return;
    const id = generateTaskId();
    const newTask = {
      id,
      skill: {
        id: skill.id,
        name: skill.name,
        category: skill.name,
        tint: skill.tint,
        iconName: skill.iconName,
      },
      runBy: { id: "current-user", name: "Demo Internal", initials: "DI" },
      status: "queued",
      createdAt: new Date().toISOString(),
      completedAt: null,
    };
    setTasks((prev) => [newTask, ...prev]);
    closeTaskWizard();
    // Cosmetic status transitions: queued → generating after 3s, then
    // generating → completed after another 8s. No real generation runs.
    window.setTimeout(() => {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: "generating" } : t)),
      );
    }, 3000);
    window.setTimeout(() => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, status: "completed", completedAt: new Date().toISOString() }
            : t,
        ),
      );
    }, 11000);
  };
  // openMission — from an agent's mission card to the Missions module,
  // with that mission's detail panel open (team-leader view).
  const openMission = (missionId) => {
    setAgentProfileId(null);
    setSelectedMissionId(missionId);
    router.push(pathForLearning("missions"));
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
    } else if (miraNav === "skills" && skillRecordId) {
      miraContent = (
        <SkillRecordPage
          skillId={skillRecordId}
          onBack={() => setSkillRecordId(null)}
        />
      );
    } else if (miraNav === "tasks" && taskWizardStep !== null) {
      miraContent = (
        <CreateTaskWizardPage
          step={taskWizardStep}
          draft={taskDraft}
          onChange={setTaskDraft}
          onStepChange={setTaskWizardStep}
          onCancel={closeTaskWizard}
          onSave={saveTaskDraft}
          onPublish={publishTask}
        />
      );
    } else if (miraNav === "tasks" && taskRecordId) {
      miraContent = (
        <TaskRecordPage
          taskId={taskRecordId}
          onBack={() => setTaskRecordId(null)}
        />
      );
    } else {
      miraContent = (
        <MiraPage
          pageName={pageName}
          tasks={tasks}
          onOpenSkill={setSkillRecordId}
          onOpenTask={setTaskRecordId}
          onCreateTask={openTaskWizard}
        />
      );
    }

    return (
      <>
        <SideNav
          config={askMiraConfig}
          activeId={miraNav}
          onSelect={(id) => {
            if (id !== "chat") setMiraSetupOpen(false);
            setSkillRecordId(null);
            setTaskRecordId(null);
            setTaskWizardStep(null);
            setTaskDraft(EMPTY_TASK_DRAFT);
            router.push(pathForMira(id));
          }}
          appSwitcherTriggerRef={appMenuTriggerRef}
          onAppSwitcherClick={() => setAppMenuOpen((o) => !o)}
          isExpanded={sidenavExpanded}
          onToggleExpanded={handleToggleSidenav}
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
            setSkillRecordId(null);
            setTaskRecordId(null);
            setTaskWizardStep(null);
            setTaskDraft(EMPTY_TASK_DRAFT);
            setAppMenuOpen(false);
            router.push(pathForCurrentPage(page));
          }}
        />
      </>
    );
  }

  if (currentPage === "learning") {
    const { Component: LearningPage, pageName } = resolvePage(LEARNING_PAGES, learningNav, "Learning Hub");
    const onDrill = learningNav === "drill";
    const onMissions = learningNav === "missions";
    const onAgents = learningNav === "agents";
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
    } else if (onAgents && agentProfileId) {
      drillContent = (
        <AgentProfile
          agentId={agentProfileId}
          onBack={() => setAgentProfileId(null)}
          onViewMission={openMission}
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
          onOpenAgent={(id) => setAgentProfileId(id)}
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
            setAgentProfileId(null);
            setSelectedMissionId(null);
            cancelRoleplay();
            closeMissionWizard();
            router.push(pathForLearning(id));
          }}
          appSwitcherTriggerRef={appMenuTriggerRef}
          onAppSwitcherClick={() => setAppMenuOpen((o) => !o)}
          isExpanded={sidenavExpanded}
          onToggleExpanded={handleToggleSidenav}
        />
        {missionsPopulated ? (
          <MissionsPage
            onCreateMission={openMissionWizard}
            initialMissionId={selectedMissionId}
          />
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
            setAgentProfileId(null);
            cancelRoleplay();
            closeMissionWizard();
            setAppMenuOpen(false);
            router.push(pathForCurrentPage(page));
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
        router.push(pathForInsights(id));
      }}
      onAppMenuClick={() => setAppMenuOpen((o) => !o)}
      appMenuTriggerRef={appMenuTriggerRef}
      rightPanel={insightsRightPanel}
      onPanelClose={() => setFiltersOpen(false)}
      isExpanded={sidenavExpanded}
      onToggleExpanded={handleToggleSidenav}
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
          setAppMenuOpen(false);
          router.push(pathForCurrentPage(page));
        }}
      />
    </DashboardShell>
  );
}
