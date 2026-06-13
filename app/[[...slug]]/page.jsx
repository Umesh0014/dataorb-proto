"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import AppSwitcherPopover from "../../components/AppSwitcherPopover";
import InsightsHubPage from "../../components/InsightsHubPage";
import LearningHubPage from "../../components/LearningHubPage";
import DrillDetailPage from "../../components/DrillDetailPage";
import NewRoleplayPage from "../../components/NewRoleplayPage";
import NewRoleplayContextPage from "../../components/NewRoleplayContextPage";
import InteractionsPage from "../../components/InteractionsPage";
import AgentsPage from "../../components/AgentsPage";
import AgentProfile from "../../components/AgentProfile";
import MissionsLandingShell from "../../components/MissionsLandingShell";
import MissionDetailPage from "../../components/MissionDetailPage";
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
import SettingsPage from "../../components/SettingsPage";
import CreditsUsagePage from "../../components/CreditsUsagePage";
import GuidePage from "../../components/GuidePage";
import GuideSessionPage from "../../components/GuideSessionPage";
import ReplayPage from "../../components/ReplayPage";
import CreateGuideWizardPage, {
  EMPTY_GUIDE_DRAFT,
} from "../../components/CreateGuideWizardPage";
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
import { lhDir, lhWizard, localizeLearningConfig } from "../../components/learningHubLocale";

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
  "interaction":        { Component: InteractionsPage,  pageName: "Interactions" },
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
  "missions":     { Component: MissionsLandingShell, pageName: "Missions" },
  "guide":        { Component: GuidePage,       pageName: "Guide" },
  "replay":       { Component: ReplayPage,      pageName: "Replay" },
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

// MODULE_REGISTRY — short list of shipped modules keyed by route prefix.
// Drives the active-module label rendered beside the 9-dot app switcher
// row (expanded sidenav) and its collapsed-state tooltip. Coaching does
// not have a config yet; its prefix is matched inline below until the
// module ships.
const MODULE_REGISTRY = [insightsHubConfig, learningHubConfig, askMiraConfig];

function resolveAppSwitcherLabel(pathname) {
  if (pathname?.startsWith("/coaching")) return "Coaching";
  if (pathname?.startsWith("/settings")) return "Settings";
  const matched = MODULE_REGISTRY.find((c) => pathname?.startsWith(c.routePrefix));
  return matched?.displayName ?? "Apps";
}

// ---- URL ↔ nav state ----------------------------------------------------

const DEFAULT_NAV = {
  currentPage: "insights",
  insightsNav: "contact-center",
  learningNav: "drill",
  miraNav: "chat",
  missionDetailId: null,
  settingsSubpage: null,
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
    // /learning/missions/{id} — surface the trailing id so the route can
    // mount the standalone Mission detail page used by sandbox Options
    // 2 (Dense table) and 3 (Kanban).
    if (segs[1] === "missions" && segs.length >= 3) {
      next.missionDetailId = segs[2];
    }
  } else if (segs[0] === "mira") {
    next.currentPage = "mira";
    if (segs.length >= 2) next.miraNav = segs[1];
  } else if (segs[0] === "settings") {
    next.currentPage = "settings";
    if (segs.length >= 2) next.settingsSubpage = segs[1];
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

// Settings is a cross-module utility surface — when the user opens it
// the SideNav keeps the module rail they came from (no rail item turns
// active). We remember the last non-settings module so a direct load on
// /settings still picks a sensible rail (defaulting to insights).
function resolveSettingsRailModule(previous) {
  return previous === "learning" || previous === "mira" || previous === "insights"
    ? previous
    : "insights";
}

export default function Page() {
  const pathname = usePathname();
  const router = useRouter();

  // URL is the source of truth for module + sub-section. Derive the four
  // nav ids on every render from the pathname; nav-driving setState calls
  // are replaced with router.push() against the same URL schema.
  const { currentPage, insightsNav, learningNav, miraNav, missionDetailId, settingsSubpage } = React.useMemo(
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

  // Track the most recently visited module so /settings can render with
  // that module's rail (since Settings has no rail of its own). Loading
  // /settings directly falls back to insights via resolveSettingsRailModule.
  const lastModuleRef = React.useRef(currentPage === "settings" ? "insights" : currentPage);
  React.useEffect(() => {
    if (currentPage !== "settings") lastModuleRef.current = currentPage;
  }, [currentPage]);

  // Read the persisted SideNav expand/collapse preference synchronously in
  // the initializer so first paint already matches the user's choice. A
  // post-mount useEffect would force a second render and a visible
  // 64 → 260px width animation on every route change.
  const [sidenavExpanded, setSidenavExpanded] = React.useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.localStorage.getItem("dataorb.sidenav.expanded") === "true";
    } catch {
      return false;
    }
  });

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

  // Global GUI locale. Chosen on the Learning Hub Drill page but held at
  // the app root so the whole shell flips together: Arabic sets the
  // document `dir="rtl"` (rail moves to the right, layout mirrors via
  // logical CSS properties) and `lang`. In-memory only (no storage).
  const [locale, setLocale] = React.useState("en");
  React.useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("dir", lhDir(locale));
    root.setAttribute("lang", locale);
  }, [locale]);
  // Rail config with its module + item labels translated for the active
  // locale, so the navigation itself reads in the selected language.
  const learningNavConfig = React.useMemo(
    () => localizeLearningConfig(learningHubConfig, locale),
    [locale],
  );

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
  // Create Guide wizard — null means closed (GuidePage renders); any
  // step id ('knowledge-base' | 'define' | 'preview') means the wizard
  // is mounted.
  const [guideWizardStep, setGuideWizardStep] = React.useState(null);
  const [guideDraft, setGuideDraft] = React.useState(EMPTY_GUIDE_DRAFT);
  // Guide AI Tutor session — null = list view; a guide id = runtime mounted.
  const [guideSessionId, setGuideSessionId] = React.useState(null);
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

  const openGuideWizard = () => {
    setGuideDraft(EMPTY_GUIDE_DRAFT);
    setGuideWizardStep("knowledge-base");
  };
  const closeGuideWizard = () => {
    setGuideWizardStep(null);
    setGuideDraft(EMPTY_GUIDE_DRAFT);
  };
  const openGuideSession = (id) => setGuideSessionId(id);
  const closeGuideSession = () => setGuideSessionId(null);
  const saveGuideDraft = (draft) => {
    // TODO: persist draft guide server-side; logging for prototype.
    // eslint-disable-next-line no-console
    console.log("save guide draft", draft);
  };
  const publishGuide = (mode) => {
    // mode is "calibration" or "publish" — picked in PublishGuideModal.
    // Post-confirm destinations (calibration workspace vs. live publish
    // success) still pending product spec; closing the wizard for now.
    // eslint-disable-next-line no-console
    console.log("publish guide", { mode, draft: guideDraft });
    closeGuideWizard();
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

  // Build module-specific SideNav config + content here so the single
  // return below renders SideNav + AppSwitcherPopover at one persistent
  // JSX position. React reconciles the same SideNav instance across
  // module switches, which means the rail never re-mounts and the
  // expanded width never resets to 64px between routes.
  let sidenavConfig;
  let sidenavActiveId;
  let handleSidenavSelect;
  let handleAppSelectPage;
  let moduleContent;

  if (currentPage === "settings") {
    // Settings is a cross-module surface. Pick whichever module rail the
    // user most recently visited so the chrome stays continuous; no rail
    // item is "active" while on /settings.
    const railModule = resolveSettingsRailModule(lastModuleRef.current);
    if (railModule === "mira") {
      sidenavConfig = askMiraConfig;
      handleSidenavSelect = (id) => router.push(pathForMira(id));
    } else if (railModule === "learning") {
      sidenavConfig = learningNavConfig;
      handleSidenavSelect = (id) => router.push(pathForLearning(id));
    } else {
      sidenavConfig = insightsHubConfig;
      handleSidenavSelect = (id) => router.push(pathForInsights(id));
    }
    sidenavActiveId = "__settings__"; // matches no item, suppresses active state
    handleAppSelectPage = (page) => {
      setAppMenuOpen(false);
      router.push(pathForCurrentPage(page));
    };
    const settingsContent = settingsSubpage === "credits-usage"
      ? <CreditsUsagePage onBack={() => router.push("/settings")} />
      : <SettingsPage onSelectCard={(cardId) => {
          if (cardId === "credits-usage") router.push("/settings/credits-usage");
        }} />;
    moduleContent = (
      <PageLayout>
        {settingsContent}
      </PageLayout>
    );
  } else if (currentPage === "mira") {
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

    sidenavConfig = askMiraConfig;
    sidenavActiveId = miraNav;
    handleSidenavSelect = (id) => {
      if (id !== "chat") setMiraSetupOpen(false);
      setSkillRecordId(null);
      setTaskRecordId(null);
      setTaskWizardStep(null);
      setTaskDraft(EMPTY_TASK_DRAFT);
      router.push(pathForMira(id));
    };
    handleAppSelectPage = (page) => {
      setMiraSetupOpen(false);
      setSkillRecordId(null);
      setTaskRecordId(null);
      setTaskWizardStep(null);
      setTaskDraft(EMPTY_TASK_DRAFT);
      setAppMenuOpen(false);
      router.push(pathForCurrentPage(page));
    };
    moduleContent = (
      <PageLayout
        rightPanel={miraRightPanel}
        onPanelClose={() => setMiraSetupOpen(false)}
      >
        {miraContent}
      </PageLayout>
    );
  } else if (currentPage === "learning") {
    const { Component: LearningPage, pageName } = resolvePage(LEARNING_PAGES, learningNav, "Learning Hub");
    const onDrill = learningNav === "drill";
    const onMissions = learningNav === "missions";
    const onAgents = learningNav === "agents";
    const onGuide = learningNav === "guide";
    const missionsPopulated = onMissions && !missionWizardStep;

    let drillContent;
    if (onGuide && guideWizardStep) {
      drillContent = (
        <CreateGuideWizardPage
          step={guideWizardStep}
          draft={guideDraft}
          onChange={setGuideDraft}
          onStepChange={setGuideWizardStep}
          onCancel={closeGuideWizard}
          onSave={saveGuideDraft}
          onPublish={publishGuide}
        />
      );
    } else if (onMissions && missionWizardStep) {
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
      drillContent = <ComingSoon pageName={lhWizard(locale, "genTitle")} />;
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
          locale={locale}
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
          locale={locale}
        />
      );
    } else if (onDrill && drillDetailId) {
      drillContent = (
        <DrillDetailPage
          cardId={drillDetailId}
          onBack={() => setDrillDetailId(null)}
          locale={locale}
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
          onCreateGuide={openGuideWizard}
          onOpenGuide={openGuideSession}
          onOpenAgent={(id) => setAgentProfileId(id)}
          locale={locale}
          onLocaleChange={setLocale}
        />
      );
    }

    sidenavConfig = learningNavConfig;
    sidenavActiveId = learningNav;
    handleSidenavSelect = (id) => {
      setDrillDetailId(null);
      setAgentProfileId(null);
      setSelectedMissionId(null);
      cancelRoleplay();
      closeMissionWizard();
      closeGuideWizard();
      closeGuideSession();
      router.push(pathForLearning(id));
    };
    handleAppSelectPage = (page) => {
      setDrillDetailId(null);
      setAgentProfileId(null);
      cancelRoleplay();
      closeMissionWizard();
      closeGuideWizard();
      closeGuideSession();
      setAppMenuOpen(false);
      router.push(pathForCurrentPage(page));
    };
    if (onGuide && guideSessionId && !guideWizardStep) {
      // Guide session bypasses PageLayout — owns its own 32px outer
      // gutter so the chrome diverges from other module pages (spec §3).
      moduleContent = (
        <GuideSessionPage
          guide={{ id: guideSessionId }}
          onEnd={closeGuideSession}
        />
      );
    } else if (onMissions && missionDetailId && !missionWizardStep) {
      moduleContent = (
        <MissionDetailPage
          missionId={missionDetailId}
          onBack={() => router.push("/learning/missions")}
        />
      );
    } else if (missionsPopulated) {
      moduleContent = (
        <MissionsLandingShell
          onCreateMission={openMissionWizard}
          onOpenMission={(id) => router.push(`/learning/missions/${id}`)}
        />
      );
    } else {
      moduleContent = <PageLayout>{drillContent}</PageLayout>;
    }
  } else {
    const { Component: InsightsPage, pageName } = resolvePage(INSIGHTS_PAGES, insightsNav, "Insights Hub");
    const isInsightsHome = insightsNav === "contact-center";
    const insightsRightPanel = isInsightsHome && filtersOpen
      ? <FilterPanel open onClose={() => setFiltersOpen(false)} />
      : null;

    sidenavConfig = insightsHubConfig;
    sidenavActiveId = insightsNav;
    handleSidenavSelect = (id) => {
      if (id !== "contact-center") setFiltersOpen(false);
      router.push(pathForInsights(id));
    };
    handleAppSelectPage = (page) => {
      setAppMenuOpen(false);
      router.push(pathForCurrentPage(page));
    };
    moduleContent = (
      <PageLayout
        rightPanel={insightsRightPanel}
        onPanelClose={() => setFiltersOpen(false)}
      >
        <InsightsPage
          pageName={pageName}
          filtersOpen={filtersOpen}
          onToggleFilters={() => setFiltersOpen((o) => !o)}
        />
      </PageLayout>
    );
  }

  return (
    <>
      <SideNav
        config={sidenavConfig}
        activeId={sidenavActiveId}
        onSelect={handleSidenavSelect}
        appSwitcherTriggerRef={appMenuTriggerRef}
        appSwitcherLabel={resolveAppSwitcherLabel(pathname)}
        onAppSwitcherClick={() => setAppMenuOpen((o) => !o)}
        onSettingsClick={() => router.push("/settings")}
        isExpanded={sidenavExpanded}
        onToggleExpanded={handleToggleSidenav}
      />
      {moduleContent}
      <AppSwitcherPopover
        open={appMenuOpen}
        onClose={() => setAppMenuOpen(false)}
        anchorRef={appMenuTriggerRef}
        currentPage={currentPage}
        onSelectPage={handleAppSelectPage}
      />
    </>
  );
}
