// Cache-buster: v1 — force fresh Vercel bundle for Agent Playbook click wiring.
"use client";

import React from "react";
import {
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Globe,
  Info,
  Layers,
  ClipboardList,
  Heart,
  Headphones,
  Smile,
  Meh,
  Activity,
  User,
  BookOpen,
  Check,
} from "lucide-react";
import Button from "./Button";
import Card from "./Card";
import TabsRow from "./TabsRow";
import VersionBar from "./VersionBar";

// InteractionDetailPage — full-page deep dive for a single interaction.
// Sticky top metadata bar + two-column body (Email Conversations left,
// tabbed Insights / Quality / Feedback right).
//
// 🚩 FLAG for Akash — entry point. This page is currently only reachable
// via /insights/interaction/{id}. The row-detail drawer and the email
// icon's quick conversation view (InteractionsPage) are still in place
// untouched. Decide: drawer-stays-as-quickview vs drawer-is-replaced.
// 🚩 FLAG for Akash — drawer vs page overlap. Drawer "Contact reason
// insights", "Predicted CSAT", etc. duplicate this page's Insights tab
// labels. Confirm whether the drawer's sections should mirror this
// page's wording or one should be deprecated.
// 🚩 FLAG — independent column scroll. The spec asks both columns to
// scroll independently. The page currently shares the document scroll
// (sticky top bar still pins to viewport top). Promote to per-column
// overflow:auto once the page lives in a height-constrained shell.

export default function InteractionDetailPage({ interactionId, onBack }) {
  const interaction = resolveInteraction(interactionId);
  const [activeTab, setActiveTab] = React.useState("insights");
  // Insights list ↔ category-detail swap. Set to a row id (e.g. "playbook")
  // to drill into a category; null shows the list. Switching tabs always
  // resets back to the list so each tab lands on its primary view.
  const [selectedInsightCategory, setSelectedInsightCategory] = React.useState(null);
  // Design version selected from VersionBar's baseline dropdown. "updated"
  // is the current spec (Quality / Feedback tabs + the assessment + 3-opt
  // playbook); "current" mirrors the pre-redesign view (Adherence /
  // Coaching tabs + the simpler Assessment + Present Stages playbook).
  const [designVer, setDesignVer] = React.useState("updated");

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedInsightCategory(null);
  };

  return (
    <div style={pStyles.shell}>
      <TopMetaBar interaction={interaction} onBack={onBack} />
      <div style={pStyles.grid}>
        <EmailConversationsColumn messages={interaction.messages} />
        <InsightsColumn
          activeTab={activeTab}
          onTabChange={handleTabChange}
          insights={interaction.insights}
          selectedCategory={selectedInsightCategory}
          onSelectCategory={setSelectedInsightCategory}
          onClearCategory={() => setSelectedInsightCategory(null)}
          designVer={designVer}
          onDesignVerChange={setDesignVer}
        />
      </div>
    </div>
  );
}

// ---- Top metadata bar ----------------------------------------------------

function TopMetaBar({ interaction, onBack }) {
  return (
    <div style={pStyles.metaBar}>
      <button
        type="button"
        onClick={onBack}
        aria-label="Back"
        style={pStyles.backBtn}
      >
        <ArrowLeft size={16} color="var(--color-text-medium)" />
      </button>

      <span style={pStyles.customerId}>Customer {interaction.customerId}</span>
      <MetaSep />
      <MetaPair label="Interaction" value={interaction.interactionId} />
      <MetaSep />
      <AgentMonogram initials={interaction.agent.initials} />
      <MetaSep />
      <MetaText>{formatDate(interaction.date)}</MetaText>
      <MetaSep />
      <MetaText>{interaction.duration}</MetaText>
      <MetaSep />
      <ChannelDirection channel={interaction.channel} direction={interaction.direction} />

      <div style={{ flex: 1 }} />

      {/* 🚩 FLAG — language pill: display badge today; if a switcher is
          intended, swap for a control (different scope). */}
      <button type="button" style={pStyles.langPill} aria-label={`Language: ${interaction.language}`}>
        <Globe size={14} color="var(--color-text-tertiary)" />
        <span style={pStyles.langText}>{interaction.language}</span>
      </button>

      {/* 🚩 FLAG — info button: stub today. Should it open a tooltip with
          source meta, or relaunch the row-detail drawer as a quick
          overlay? */}
      <Button variant="icon" aria-label="Interaction info">
        <Info size={18} />
      </Button>
    </div>
  );
}

function MetaSep() {
  return <span aria-hidden="true" style={pStyles.metaSep}>•</span>;
}

function MetaText({ children }) {
  return <span style={pStyles.metaText}>{children}</span>;
}

function MetaPair({ label, value }) {
  return (
    <span style={pStyles.metaText}>
      <span style={{ color: "var(--color-text-tertiary)" }}>{label}</span>
      <span style={{ marginLeft: 6, color: "var(--color-text-medium)", fontWeight: 600 }}>{value}</span>
    </span>
  );
}

function AgentMonogram({ initials }) {
  return (
    <span style={pStyles.monogram}>
      {String(initials).slice(0, 2).toUpperCase()}
    </span>
  );
}

function ChannelDirection({ channel, direction }) {
  // Channel set today is email-only; expand by branching on `channel`
  // once a second channel actually reaches this page.
  return (
    <span style={pStyles.channelDirection}>
      <EmailIcon />
      <MetaText>{direction}</MetaText>
    </span>
  );
}

function EmailIcon() {
  return (
    <span style={{ display: "inline-flex", color: "var(--color-text-tertiary)" }}>
      {/* lucide Mail rendered inline for tight alignment with the meta row */}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    </span>
  );
}

// ---- Left column ---------------------------------------------------------

function EmailConversationsColumn({ messages }) {
  return (
    <Card padX={0} padY={0}>
      <div style={pStyles.colHeader}>
        <span style={pStyles.colTitle}>Email Conversations</span>
      </div>
      <div style={pStyles.threadList}>
        {messages.map((m) => (
          <EmailCard key={m.id} message={m} />
        ))}
        <ThreadStartedRow />
      </div>
    </Card>
  );
}

function EmailCard({ message }) {
  const [expanded, setExpanded] = React.useState(Boolean(message.expandedDefault));
  const Chevron = expanded ? ChevronUp : ChevronDown;

  const toggle = () => setExpanded((v) => !v);

  return (
    <div style={pStyles.emailCard}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={expanded}
        style={pStyles.emailHeader}
      >
        <RoleAvatar role={message.senderRole} />
        <div style={pStyles.emailHeaderText}>
          <div style={pStyles.emailHeaderRow}>
            <span style={pStyles.emailSubject}>{message.subject}</span>
            <span style={pStyles.emailTime}>{message.timestamp}</span>
          </div>
          <div style={pStyles.emailToRow}>
            <span style={pStyles.emailTo}>
              To: {message.to.address} ({message.to.role})
            </span>
            <Info size={12} color="var(--color-icon-tertiary-fg)" />
          </div>
        </div>
        <span style={pStyles.emailChevron}>
          <Chevron size={18} color="var(--color-text-medium)" />
        </span>
      </button>
      {expanded && message.body && (
        <div style={pStyles.emailBodyWrap}>
          <div style={pStyles.emailDivider} />
          <p style={pStyles.emailBody}>{message.body}</p>
          <button type="button" onClick={toggle} style={pStyles.seeLess}>
            See less
          </button>
        </div>
      )}
    </div>
  );
}

// 🚩 FLAG for Akash — avatar role mapping. The spec's seed (agent→peach,
// customer→blue, system→grey) reads inverse to the Figma reference, where
// customer-sent messages use the peach/amber avatar and agent-sent ones
// use the purple support-agent avatar. Seeding from the Figma. Confirm
// canonical mapping.
// 🚩 FLAG — exact amber matches Charts/Amber/50+500 (#FFFBEB / #F59E0B)
// in the Figma, which have no existing tokens. Using --color-warning-bg
// / --color-warning until those tokens land.
const ROLE_AVATARS = {
  customer: { bg: "var(--color-warning-bg)", fg: "var(--color-warning)", Icon: User },
  agent:    { bg: "var(--color-icon-tertiary-bg)", fg: "var(--color-icon-tertiary-fg)", Icon: Headphones },
  system:   { bg: "var(--surface-alt)", fg: "var(--color-text-tertiary)", Icon: Info },
};

function RoleAvatar({ role }) {
  const cfg = ROLE_AVATARS[role] || ROLE_AVATARS.system;
  const Icon = cfg.Icon;
  return (
    <span style={{ ...pStyles.roleAvatar, background: cfg.bg }}>
      <Icon size={20} color={cfg.fg} />
    </span>
  );
}

function ThreadStartedRow() {
  return (
    <div style={pStyles.threadStarted}>
      <span style={pStyles.threadLine} />
      <span style={pStyles.threadStartedText}>Thread Started</span>
      <span style={pStyles.threadLine} />
    </div>
  );
}

// ---- Right column --------------------------------------------------------

const TAB_DEFS_UPDATED = [
  { id: "insights", label: "Insights" },
  { id: "quality",  label: "Quality" },
  { id: "feedback", label: "Feedback" },
];
const TAB_DEFS_CURRENT = [
  { id: "insights",  label: "Insights" },
  { id: "adherence", label: "Adherence" },
  { id: "coaching",  label: "Coaching" },
  { id: "feedback",  label: "Feedback" },
];

function InsightsColumn({
  activeTab,
  onTabChange,
  insights,
  selectedCategory,
  onSelectCategory,
  onClearCategory,
  designVer,
  onDesignVerChange,
}) {
  const tabs = designVer === "current" ? TAB_DEFS_CURRENT : TAB_DEFS_UPDATED;
  // 🚩 FLAG — sticky tabs. Spec calls for tabs that stay pinned at the top
  // of the scrolling right column. The column shares document scroll
  // today (see top-of-file FLAG), so sticky tabs would either fight the
  // metadata bar or read as unexpected. Tabs are static for now; promote
  // to sticky once independent column scroll lands.
  return (
    <Card padX={0} padY={0}>
      <div style={pStyles.tabsWrap}>
        <TabsRow
          tabs={tabs}
          activeTab={activeTab}
          onTabClick={onTabChange}
        />
      </div>
      <div style={pStyles.tabBody}>
        {activeTab === "insights" ? (
          selectedCategory ? (
            <CategoryDetail
              categoryId={selectedCategory}
              insights={insights}
              onBack={onClearCategory}
              designVer={designVer}
              onDesignVerChange={onDesignVerChange}
            />
          ) : (
            <InsightsList
              insights={insights}
              onSelectCategory={onSelectCategory}
            />
          )
        ) : (
          <EmptyTabPanel name={activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} />
        )}
      </div>
    </Card>
  );
}

// 🚩 FLAG — insight row icons. Seeded from the closest lucide match per
// label; confirm against Figma.
// 🚩 FLAG — pill palette vocabulary. Today: Moderate (warning), Positive
// / Satisfied (success). Lock the full status vocabulary across
// categories before extending the palette.
const INSIGHT_ROWS = [
  { id: "contactReason",   label: "Contact Reason Overview",   Icon: Layers },
  { id: "outcome",         label: "Interaction Outcome Insights", Icon: ClipboardList, pillKey: "outcomeStatus" },
  { id: "sentiment",       label: "Customer Sentiment",         Icon: Heart,         pillKey: "sentimentStatus" },
  { id: "playbook",        label: "Agent Playbook",             Icon: Headphones },
  { id: "csat",            label: "Predicted CSAT",             Icon: Smile,         pillKey: "csatStatus" },
  { id: "session",         label: "Session Insights",           Icon: Activity },
];

function InsightsList({ insights, onSelectCategory }) {
  const pillValues = {
    outcomeStatus: insights?.interactionOutcome?.status,
    sentimentStatus: insights?.customerSentiment?.status,
    csatStatus: insights?.predictedCsat?.status,
  };
  return (
    <ul style={pStyles.insightList}>
      {INSIGHT_ROWS.map((r) => (
        <InsightRow
          key={r.id}
          row={r}
          pillValue={r.pillKey ? pillValues[r.pillKey] : null}
          onSelect={() => onSelectCategory(r.id)}
        />
      ))}
    </ul>
  );
}

function InsightRow({ row, pillValue, onSelect }) {
  const { label, Icon } = row;
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        style={pStyles.insightRow}
      >
        <span style={pStyles.insightLeft}>
          <Icon size={16} color="var(--color-icon-tertiary-fg)" />
          <span style={pStyles.insightLabel}>{label}</span>
        </span>
        <span style={pStyles.insightRight}>
          {pillValue && <StatusPill value={pillValue} />}
          <ChevronRight size={16} color="var(--color-text-tertiary)" />
        </span>
      </button>
    </li>
  );
}

// Status pill — reuses the existing severity tokens (success / warning /
// error). Categories with statuses outside this vocabulary will surface
// as the neutral "chip" fallback so we never invent a new colour.
function StatusPill({ value }) {
  const map = {
    Positive:  { bg: "var(--color-success-bg)", fg: "var(--color-success-text)" },
    Satisfied: { bg: "var(--color-success-bg)", fg: "var(--color-success-text)" },
    Moderate:  { bg: "var(--color-warning-bg)", fg: "var(--color-warning-text)" },
    Negative:  { bg: "var(--color-error-bg)",   fg: "var(--color-error-text)" },
    Mixed:     { bg: "var(--color-warning-bg)", fg: "var(--color-warning-text)" },
  };
  const s = map[value] || { bg: "var(--color-chip-bg)", fg: "var(--color-chip-text)" };
  return (
    <span style={{ ...pStyles.pill, background: s.bg, color: s.fg }}>{value}</span>
  );
}

function EmptyTabPanel({ name }) {
  return (
    <div style={pStyles.emptyTab}>
      {name} content TBD.
    </div>
  );
}

// ---- Insight category detail (shell + Agent Playbook content) -----------

// Reusable detail shell. Other categories will plug their own body in;
// only Agent Playbook is fleshed out today per spec.
// 🚩 FLAG — back row stickiness. Defaults to scrolling inline with the
// content. Akash to confirm whether it should pin under the tabs for
// long bodies.
function CategoryDetail({ categoryId, insights, onBack, designVer, onDesignVerChange }) {
  const meta = INSIGHT_ROWS.find((r) => r.id === categoryId);
  if (!meta) return null;
  return (
    <div style={pStyles.detailWrap}>
      <DetailHeader meta={meta} onBack={onBack} />
      <CategoryBody
        categoryId={categoryId}
        insights={insights}
        designVer={designVer}
        onDesignVerChange={onDesignVerChange}
      />
    </div>
  );
}

function DetailHeader({ meta, onBack }) {
  const Icon = meta.Icon;
  return (
    <button
      type="button"
      onClick={onBack}
      style={pStyles.detailHeader}
      aria-label="Back to insights"
    >
      <ArrowLeft size={16} color="var(--color-button-primary-bg)" />
      <span style={pStyles.detailHeaderTitleGroup}>
        <Icon size={16} color="var(--color-text-tertiary)" />
        <span style={pStyles.detailHeaderTitle}>{meta.label}</span>
      </span>
    </button>
  );
}

function CategoryBody({ categoryId, insights, designVer, onDesignVerChange }) {
  if (categoryId === "playbook") {
    return (
      <AgentPlaybookDetail
        data={insights?.agentPlaybook}
        designVer={designVer}
        onDesignVerChange={onDesignVerChange}
      />
    );
  }
  // 🚩 FLAG — other categories (Contact Reason Overview, Interaction
  // Outcome Insights, Customer Sentiment, Predicted CSAT, Session
  // Insights) reuse this shell once their content specs land.
  return (
    <div style={pStyles.detailPlaceholder}>
      Detail content for this category is coming in a follow-up spec.
    </div>
  );
}

// ---- Agent Playbook detail body — 3 layout switcher ---------------------
//
// 🚩 FLAG for Akash — three exploratory layouts share one data model.
// Option A (Editorial timeline), Option B (Evidence-first), Option C
// (Compact) are all rendered from data.stages + data.keyTag + data.why*.
// Pick one for production; the switcher is itself a flag — review-only.
// 🚩 FLAG — agent-attribution palette (SI / AM / TN / RK ramps) is a
// brand-new visual element with no design-system tokens today. Inlined
// here; lift into globals.css once the palette is approved.
// 🚩 FLAG — mood palette (smile / neutral amber vs happy green) reuses
// --color-warning / --color-success for the face icon, with raw hex on
// the dot background until a sentiment-face token lands.

const PB_AGENTS = {
  SI: { name: "Sara I.",   bg: "#E6F1FB", text: "#0C447C", accent: "#185FA5" },
  AM: { name: "Aditi M.",  bg: "#E1F5EE", text: "#085041", accent: "#0F6E56" },
  TN: { name: "Tarun N.",  bg: "#FAECE7", text: "#712B13", accent: "#993C1D" },
  RK: { name: "Rohan K.",  bg: "var(--color-icon-tertiary-bg)", text: "var(--color-icon-tertiary-fg)", accent: "var(--color-icon-tertiary-fg)" },
};

const PB_MOODS = {
  smile:   { Icon: Smile, color: "var(--color-warning)", dotBg: "#FBF0DA" },
  neutral: { Icon: Meh,   color: "var(--color-warning)", dotBg: "#FBF0DA" },
  happy:   { Icon: Smile, color: "var(--color-success)", dotBg: "#EBF3DE" },
};

function getInitials(code) {
  return (PB_AGENTS[code]?.name || code).split(" ").map((s) => s[0]).join("").slice(0, 2);
}

// Maps the floating VersionBar's versionId → the playbook layout option
// it should render. current / v1 stay on O1 (no iteration drill-down);
// v2 + v3 swap to O2 / O3 and own their own iteration sub-pick.
const VERSION_TO_OPT = {
  current: "O1",
  v1: "O1",
  v2: "O2",
  v3: "O3",
};

function AgentPlaybookDetail({ data, designVer = "updated", onDesignVerChange }) {
  // Default to v1 / i1 — the Updated-design canonical view.
  const [opt, setOpt] = React.useState("O1");
  const [iter, setIter] = React.useState("i1");
  const [activeAgent, setActiveAgent] = React.useState(null);

  if (!data) return null;

  const toggleAgent = (agent) => {
    setActiveAgent((cur) => (cur === agent ? null : agent));
  };
  const clearAgent = () => setActiveAgent(null);

  // VersionBar fires { versionId, iterationId } on every change.
  // - "current" / "updated" are baseline-dropdown picks → swap the whole
  //   right-column layout via onDesignVerChange.
  // - "v1" / "v2" / "v3" are chip picks → swap which O1/O2/O3 layout
  //   renders (Updated-design only; ignored under Current design).
  // - iterationId is captured separately; layout variants can render
  //   different content per iteration (today: v2 / i1 → numbered
  //   protocol with outcome chips).
  const handleVersionChange = ({ versionId, iterationId }) => {
    if (versionId === "current" || versionId === "updated") {
      onDesignVerChange?.(versionId);
      clearAgent();
      // Returning to Updated design lands on the canonical v1 / i1 view.
      if (versionId === "updated") {
        setOpt("O1");
        setIter("i1");
      }
      return;
    }
    const nextOpt = VERSION_TO_OPT[versionId];
    if (nextOpt && nextOpt !== opt) {
      clearAgent();
      setOpt(nextOpt);
    }
    if (iterationId && iterationId !== iter) {
      setIter(iterationId);
    }
  };

  // VersionBar.value drives the baseline label (it always tracks the
  // page's designVer so the label and the content can't drift). The
  // chip / opt swap still happens via the onChange handler, but the
  // active highlight stays on the baseline — keeps the bar from
  // visually contradicting the page state.
  const barValue = {
    versionId: designVer === "current" ? "current" : "updated",
    iterationId: null,
  };

  const shared = { data, activeAgent, onSetAgent: toggleAgent, onClearAgent: clearAgent };
  // v1 / i1 = the canonical Updated-design view (campaign title + agent-
  // tinted timeline + evidence grid). v2 / i1 = the evidence-first sister
  // layout. Other iterations fall back to the existing Options A/B/C.
  const showV1I1 = opt === "O1" && iter === "i1";
  const showV1I2 = opt === "O1" && iter === "i2";
  const showV2I1 = opt === "O2" && iter === "i1";

  return (
    <div style={pbStyles.detail}>
      {designVer === "current" ? (
        <CurrentDesignPlaybook data={CURRENT_PLAYBOOK_MOCK} />
      ) : (
        <>
          {showV1I1 && <PlaybookV1I1 data={PLAYBOOK_V1_I1_MOCK} />}
          {showV1I2 && <PlaybookV1I2 data={PLAYBOOK_V1_I1_MOCK} />}
          {opt === "O1" && !showV1I1 && !showV1I2 && <PlaybookOptionA {...shared} />}
          {showV2I1 && <PlaybookV2I1 data={PLAYBOOK_V2_I1_MOCK} />}
          {opt === "O2" && !showV2I1 && <PlaybookOptionB {...shared} />}
          {opt === "O3" && <PlaybookOptionC {...shared} />}
        </>
      )}
      <VersionBar value={barValue} onChange={handleVersionChange} />
    </div>
  );
}


// ---- Current-design playbook (image 1, pre-redesign view) ---------------
// Sparser layout: Assessment paragraph + Present Stages list with simple
// face glyphs and #N · #M citation chips. Mock data is a different
// scenario (initial greeting → discovery → information provision →
// resolution → closing) — not the returns/cancellations flow used by the
// updated playbook. Two payloads keep the two designs cleanly separated.
const CURRENT_PLAYBOOK_MOCK = {
  assessment: {
    text:
      "The agent followed a standard playbook, starting with greetings and authentication [3-5]. " +
      "She then moved into discovery and probing by checking the case and previous updates [5-7]. " +
      "Information provision was key, explaining the proposed solution and the status of the investigation [11-23]. " +
      "She closed with a clean resolution check-in and a polite farewell [24-31].",
  },
  presentStages: [
    {
      id: "initial_greeting",
      title: "Initial greeting",
      mood: "smile",
      refs: [3, 3],
      observations: ["Agent introduced herself and offered assistance."],
    },
    {
      id: "discovery_probing",
      title: "Discovery and probing",
      mood: "neutral",
      refs: [5, 10],
      observations: [
        "Agent reviewed case AFR2024091578923.",
        "Agent inquired about previous updates and customer's understanding.",
      ],
    },
    {
      id: "information_provision",
      title: "Information provision",
      mood: "neutral",
      refs: [11, 23],
      observations: [
        "Agent explained the proposed solution of an alternative product.",
        "Agent clarified the status of the investigation and lack of specific details.",
        "Agent explained the process started on the 21st and the search for a substitute.",
      ],
    },
    {
      id: "resolution_confirmation",
      title: "Resolution confirmation",
      mood: "smile",
      refs: [24, 26],
      observations: [
        "Agent recommended waiting 1-2 days for a response.",
        "Agent provided context on previous response times.",
        "Agent confirmed no exact timelines were available.",
      ],
    },
    {
      id: "closing",
      title: "Closing",
      mood: "smile",
      refs: [29, 31],
      observations: [
        "Agent asked if further assistance was needed.",
        "Agent provided a polite closing.",
      ],
    },
  ],
};

const CD_MOOD_FACES = {
  smile:   { Icon: Smile, color: "var(--color-warning)" },
  neutral: { Icon: Meh,   color: "var(--color-warning)" },
  happy:   { Icon: Smile, color: "var(--color-success)" },
};

function CurrentDesignPlaybook({ data }) {
  const [bodyOpen, setBodyOpen] = React.useState(false);
  if (!data) return null;
  return (
    <div style={cdStyles.body}>
      <div style={cdStyles.assessmentBlock}>
        <span style={cdStyles.eyebrow}>ASSESSMENT</span>
        <p style={cdStyles.assessmentText}>
          {bodyOpen
            ? data.assessment.text
            : `${data.assessment.text.slice(0, 220)}…`}
        </p>
        <button
          type="button"
          onClick={() => setBodyOpen((v) => !v)}
          style={cdStyles.seeMore}
          aria-expanded={bodyOpen}
        >
          {bodyOpen ? "See less" : "See more"}
        </button>
      </div>

      <div style={cdStyles.stagesHeading}>Present Stages</div>
      <div style={cdStyles.stagesList}>
        {data.presentStages.map((s) => (
          <CurrentDesignStageRow key={s.id} stage={s} />
        ))}
      </div>
    </div>
  );
}

function CurrentDesignStageRow({ stage }) {
  const cfg = CD_MOOD_FACES[stage.mood] || CD_MOOD_FACES.neutral;
  const Icon = cfg.Icon;
  return (
    <div style={cdStyles.stageRow}>
      <div style={cdStyles.stageHead}>
        <span style={cdStyles.stageHeadLeft}>
          <Icon size={16} color={cfg.color} aria-label={`${stage.mood} sentiment`} />
          <span style={cdStyles.stageTitle}>{stage.title}</span>
        </span>
        <span style={cdStyles.stageRefs}>
          <span style={cdStyles.ref}>#{stage.refs[0]}</span>
          <span style={cdStyles.refDot} aria-hidden="true">·</span>
          <span style={cdStyles.ref}>#{stage.refs[1]}</span>
        </span>
      </div>
      <ul style={cdStyles.bullets}>
        {stage.observations.map((b, i) => (
          <li key={i} style={cdStyles.bullet}>
            <span aria-hidden="true" style={cdStyles.bulletDot}>•</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const cdStyles = {
  body: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    paddingInline: 2,
  },
  assessmentBlock: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    background: "var(--color-card-emoji-bg)",
    borderRadius: 10,
    padding: "14px 16px",
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.08em",
    color: "var(--color-icon-tertiary-fg)",
  },
  assessmentText: {
    margin: 0,
    fontSize: 13,
    lineHeight: 1.6,
    color: "var(--color-text-deep)",
  },
  seeMore: {
    alignSelf: "flex-start",
    background: "none",
    border: "none",
    padding: "2px 0 0",
    color: "var(--color-button-primary-bg)",
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  stagesHeading: {
    fontFamily: '"Poppins", sans-serif',
    fontSize: 15,
    fontWeight: 600,
    color: "var(--color-text-deep)",
    marginTop: 4,
  },
  stagesList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  stageRow: {
    border: "1px solid var(--color-divider-card)",
    borderRadius: 12,
    padding: "12px 14px",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  stageHead: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  stageHeadLeft: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    minWidth: 0,
  },
  stageTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "var(--color-text-deep)",
  },
  stageRefs: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
  },
  ref: {
    fontSize: 12,
    fontWeight: 600,
    color: "var(--color-button-primary-bg)",
    fontFamily: "var(--font-sans)",
  },
  refDot: {
    color: "var(--color-text-tertiary)",
    fontSize: 12,
  },
  bullets: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  bullet: {
    fontSize: 13,
    color: "var(--color-text-deep)",
    lineHeight: 1.55,
    paddingLeft: 16,
    position: "relative",
    marginTop: 2,
  },
  bulletDot: {
    position: "absolute",
    left: 4,
    color: "var(--color-text-tertiary)",
  },
};

// ---- v1 / i1 — campaign-title timeline + agent-tinted refs -------------
// Canonical Updated-design view. Hero shows the campaign name (not the
// generic "Agent playbook" label) + a "{N} stages · {protocol}" subline,
// then three tag chips, the Why callout, a vertical connected timeline
// (#N–M ref chip tinted by the agent who handled that stage), and the
// "Built from {N} agent interactions" evidence grid at the bottom.
// Shared agents-grid payload — identical for v1/i1 and v2/i1 so future
// edits don't drift between the two variants.
const PLAYBOOK_AGENTS_GRID = [
  { id: "SI", name: "Sara I.",   messages: 6, stages: "greeting, Closing",      outcome: "Resolved, 1-touch" },
  { id: "AM", name: "Aditi M.",  messages: 8, stages: "Authentication",         outcome: "Retained" },
  { id: "TN", name: "Tarun N.",  messages: 6, stages: "Discovery",              outcome: "Cancelled cleanly" },
  { id: "RK", name: "Rohan K.",  messages: 8, stages: "Solution, Resolution",   outcome: "Resolved" },
];
const PLAYBOOK_V1_I1_MOCK = {
  campaignName: "Returns & cancellations",
  subline: "6 stages · price-pressure protocol",
  keyTag: "Price pressure",
  secondaryTags: ["Returns", "Marked urgent"],
  whyText:
    "Full authentication up front and an early intent check kept the flow linear, so the price-driven cancellation resolved in a single pass.",
  stages: [
    { n: 1, name: "Initial greeting",         agent: "SI", refs: [1, 2],   bullets: ["Greeted customer and asked for name and concern."] },
    { n: 2, name: "Authentication",           agent: "AM", refs: [5, 12],  bullets: ["Requested and received ID, full name, and last four of order number.", "Confirmed identity before sharing account details."] },
    { n: 3, name: "Discovery & probing",      agent: "TN", refs: [13, 18], bullets: ["Confirmed customer had multiple returns.", "Identified specific handbag and price.", "Confirmed intent to cancel the return."] },
    { n: 4, name: "Solution presentation",    agent: "RK", refs: [19, 23], bullets: ["Explained they would initiate cancellation and forward to the department.", "Marked the request as urgent."] },
    { n: 5, name: "Resolution confirmation",  agent: "RK", refs: [28, 30], bullets: ["Customer confirmed understanding and satisfaction with the action taken.", "Agent confirmed no further assistance needed."] },
    { n: 6, name: "Closing",                  agent: "SI", refs: [29, 32], bullets: ["Wished customer a nice afternoon.", "Customer reciprocated good wishes."] },
  ],
  agents: PLAYBOOK_AGENTS_GRID,
};

function PlaybookV1I1({ data }) {
  const [whyOpen, setWhyOpen] = React.useState(false);
  return (
    <div style={v1i1.body}>
      <div style={v1i1.hero}>
        <span style={v1i1.heroTile}>
          <BookOpen size={22} color="var(--color-icon-tertiary-fg)" />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={v1i1.heroTitle}>{data.campaignName}</h3>
          <div style={v1i1.heroSub}>{data.subline}</div>
        </div>
      </div>

      <div style={v1i1.tagRow}>
        <span style={v1i1.keyTag}>{data.keyTag}</span>
        {data.secondaryTags.map((t) => (
          <span key={t} style={v1i1.outlineTag}>{t}</span>
        ))}
      </div>

      <div style={v1i1.whyCard}>
        <div style={v1i1.whyHeader}>
          <span style={v1i1.whyBulb}>💡</span>
          <span style={v1i1.whyTitle}>Why this approach works</span>
        </div>
        <p style={v1i1.whyText}>
          {whyOpen ? data.whyText : `${data.whyText.slice(0, 130)}…`}
        </p>
        <button
          type="button"
          onClick={() => setWhyOpen((v) => !v)}
          style={v1i1.whyMore}
          aria-expanded={whyOpen}
        >
          {whyOpen ? "See less" : "See more"}
        </button>
      </div>

      <div style={v1i1.timeline}>
        <span style={v1i1.timelineLine} aria-hidden="true" />
        {data.stages.map((s) => (
          <V1I1StageRow key={s.n} stage={s} />
        ))}
      </div>

      <div style={v1i1.evDivider} />

      <div>
        <div style={v1i1.sectLabel}>
          <User size={14} color="var(--color-text-medium)" />
          <span>Built from {data.agents.length} agent interactions</span>
        </div>
        <div style={v1i1.sectSub}>Each card is a source interaction · chip = the outcome it achieved</div>
        <div style={v1i1.agentsGrid}>
          {data.agents.map((a) => (
            <V2I1AgentCard key={a.id} agent={a} />
          ))}
        </div>
      </div>
    </div>
  );
}

function V1I1StageRow({ stage }) {
  const ramp = PB_AGENTS[stage.agent] || PB_AGENTS.SI;
  return (
    <div style={v1i1.stageRow}>
      <span style={v1i1.stageNumber}>{stage.n}</span>
      <div style={v1i1.stageBody}>
        <div style={v1i1.stageHead}>
          <span style={v1i1.stageTitle}>{stage.name}</span>
          <span
            style={{
              ...v1i1.stageRefChip,
              background: ramp.bg,
              color: ramp.text,
            }}
          >
            #{stage.refs[0]}–{stage.refs[1]}
          </span>
        </div>
        <ul style={v1i1.bullets}>
          {stage.bullets.map((b, i) => (
            <li key={i} style={v1i1.bullet}>
              <span aria-hidden="true" style={v1i1.bulletDot}>•</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const v1i1 = {
  body: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
    paddingInline: 2,
  },
  hero: {
    display: "flex",
    alignItems: "flex-start",
    gap: 14,
  },
  heroTile: {
    width: 44,
    height: 44,
    borderRadius: 10,
    background: "var(--color-icon-tertiary-bg)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  heroTitle: {
    margin: 0,
    fontFamily: '"Poppins", sans-serif',
    fontSize: 22,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    lineHeight: 1.15,
  },
  heroSub: {
    fontSize: 13,
    color: "var(--color-text-tertiary)",
    marginTop: 4,
  },
  tagRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  keyTag: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    background: "#FAECE7",
    color: "#712B13",
    fontSize: 12,
    fontWeight: 600,
    padding: "5px 10px",
    borderRadius: 10,
  },
  outlineTag: {
    fontSize: 12,
    color: "var(--color-text-medium)",
    padding: "5px 10px",
    border: "1px solid var(--color-divider-card)",
    borderRadius: 10,
  },
  whyCard: {
    background: "#EFF6FF",
    borderRadius: 10,
    padding: "14px 16px",
  },
  whyHeader: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  whyBulb: { fontSize: 14, lineHeight: 1 },
  whyTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text-deep)",
  },
  whyText: {
    margin: 0,
    fontSize: 13,
    lineHeight: 1.55,
    color: "var(--color-text-deep)",
  },
  whyMore: {
    background: "transparent",
    border: "none",
    color: "var(--color-button-primary-bg)",
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    padding: "6px 0 0",
  },
  timeline: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: 18,
    paddingLeft: 6,
  },
  timelineLine: {
    position: "absolute",
    left: 17,
    top: 18,
    bottom: 18,
    width: 1,
    background: "var(--color-divider-card)",
  },
  stageRow: {
    position: "relative",
    display: "grid",
    gridTemplateColumns: "24px 1fr",
    gap: 16,
    alignItems: "flex-start",
  },
  stageNumber: {
    width: 24,
    height: 24,
    borderRadius: "50%",
    background: "var(--surface-white)",
    border: "1px solid var(--color-divider-card)",
    color: "var(--color-text-medium)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 700,
    flexShrink: 0,
    zIndex: 1,
  },
  stageBody: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    minWidth: 0,
  },
  stageHead: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  stageTitle: {
    fontFamily: '"Poppins", sans-serif',
    fontSize: 16,
    fontWeight: 700,
    color: "var(--color-text-deep)",
  },
  stageRefChip: {
    flexShrink: 0,
    fontSize: 11,
    fontWeight: 600,
    padding: "3px 8px",
    borderRadius: 6,
    whiteSpace: "nowrap",
    fontFamily: "var(--font-sans)",
  },
  bullets: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  bullet: {
    fontSize: 13,
    color: "var(--color-text-tertiary)",
    lineHeight: 1.55,
    paddingLeft: 16,
    position: "relative",
    marginTop: 2,
  },
  bulletDot: {
    position: "absolute",
    left: 4,
    color: "var(--color-text-tertiary)",
  },
  evDivider: {
    height: 1,
    background: "var(--color-divider-card)",
    margin: "4px 0",
  },
  sectLabel: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text-deep)",
  },
  sectSub: {
    fontSize: 12,
    color: "var(--color-text-tertiary)",
    margin: "2px 0 10px",
  },
  agentsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  },
};

// ---- v1 / i2 — editorial-quote + agent-avatar stages -------------------
// Shares v1/i1's mock (same campaign) but trades the tinted Why callout +
// vertical timeline for an italic blockquote and a stack of stage cards.
// Each stage row swaps the bare number circle for the responsible agent's
// avatar with the stage number badged below; bullets sit inside a subtle
// rounded container instead of running plain underneath the title.
function PlaybookV1I2({ data }) {
  return (
    <div style={v1i2.body}>
      <div style={v1i2.hero}>
        <span style={v1i2.heroTile}>
          <BookOpen size={22} color="var(--color-icon-tertiary-fg)" />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={v1i2.heroTitle}>{data.campaignName}</h3>
          <div style={v1i2.heroSub}>
            {data.stages.length} stages · contributed by {data.agents.length} agents
          </div>
        </div>
      </div>

      <div style={v1i2.tagRow}>
        <span style={v1i2.keyTag}>{data.keyTag}</span>
        {data.secondaryTags.map((t) => (
          <span key={t} style={v1i2.outlineTag}>{t}</span>
        ))}
      </div>

      <blockquote style={v1i2.quote}>
        <p style={v1i2.quoteText}>{data.whyText}</p>
      </blockquote>

      <div style={v1i2.stagesList}>
        {data.stages.map((s) => (
          <V1I2StageRow key={s.n} stage={s} />
        ))}
      </div>

      <div style={v1i2.evDivider} />

      <div>
        <div style={v1i2.sectLabel}>
          <User size={14} color="var(--color-text-medium)" />
          <span>Built from {data.agents.length} agent interactions</span>
        </div>
        <div style={v1i2.sectSub}>Each card is a source interaction · chip = the outcome it achieved</div>
        <div style={v1i2.agentsGrid}>
          {data.agents.map((a) => (
            <V2I1AgentCard key={a.id} agent={a} />
          ))}
        </div>
      </div>
    </div>
  );
}

function V1I2StageRow({ stage }) {
  const ramp = PB_AGENTS[stage.agent] || PB_AGENTS.SI;
  return (
    <div style={v1i2.stageRow}>
      <div style={v1i2.avatarWrap}>
        <span style={{ ...v1i2.stageAvatar, background: ramp.bg, color: ramp.text }}>
          {stage.agent}
        </span>
        <span style={v1i2.stageNum}>{stage.n}</span>
      </div>
      <div style={v1i2.stageBody}>
        <div style={v1i2.stageHead}>
          <span style={v1i2.stageTitle}>{stage.name}</span>
          <span
            style={{
              ...v1i2.stageRefChip,
              background: ramp.bg,
              color: ramp.text,
            }}
          >
            #{stage.refs[0]}–{stage.refs[1]}
          </span>
        </div>
        <div style={v1i2.bulletsCard}>
          {stage.bullets.map((b, i) => (
            <div key={i} style={v1i2.bullet}>
              <span aria-hidden="true" style={v1i2.bulletDot}>•</span>
              <span>{b}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const v1i2 = {
  body: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
    paddingInline: 2,
  },
  hero: {
    display: "flex",
    alignItems: "flex-start",
    gap: 14,
  },
  heroTile: {
    width: 44,
    height: 44,
    borderRadius: 10,
    background: "var(--color-icon-tertiary-bg)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  heroTitle: {
    margin: 0,
    fontFamily: '"Poppins", sans-serif',
    fontSize: 22,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    lineHeight: 1.15,
  },
  heroSub: {
    fontSize: 13,
    color: "var(--color-text-tertiary)",
    marginTop: 4,
  },
  tagRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  keyTag: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    background: "#FAECE7",
    color: "#712B13",
    fontSize: 12,
    fontWeight: 600,
    padding: "5px 10px",
    borderRadius: 10,
  },
  outlineTag: {
    fontSize: 12,
    color: "var(--color-text-medium)",
    padding: "5px 10px",
    border: "1px solid var(--color-divider-card)",
    borderRadius: 10,
  },
  quote: {
    margin: 0,
    paddingLeft: 14,
    borderLeft: "2px solid var(--color-icon-tertiary-fg)",
  },
  quoteText: {
    margin: 0,
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: 15,
    lineHeight: 1.55,
    color: "var(--color-text-deep)",
  },
  stagesList: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  stageRow: {
    display: "grid",
    gridTemplateColumns: "36px 1fr",
    gap: 14,
    alignItems: "flex-start",
  },
  avatarWrap: {
    position: "relative",
    width: 36,
    display: "inline-flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
    flexShrink: 0,
    marginTop: 2,
  },
  stageAvatar: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 700,
  },
  stageNum: {
    fontSize: 10,
    fontWeight: 600,
    color: "var(--color-text-tertiary)",
  },
  stageBody: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    minWidth: 0,
  },
  stageHead: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  stageTitle: {
    fontFamily: '"Poppins", sans-serif',
    fontSize: 16,
    fontWeight: 700,
    color: "var(--color-text-deep)",
  },
  stageRefChip: {
    flexShrink: 0,
    fontSize: 11,
    fontWeight: 600,
    padding: "3px 8px",
    borderRadius: 6,
    whiteSpace: "nowrap",
    fontFamily: "var(--font-sans)",
  },
  bulletsCard: {
    background: "var(--color-card-emoji-bg)",
    border: "1px solid var(--color-divider-card)",
    borderRadius: 10,
    padding: "10px 14px",
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  bullet: {
    fontSize: 13,
    color: "var(--color-text-tertiary)",
    lineHeight: 1.55,
    paddingLeft: 14,
    position: "relative",
  },
  bulletDot: {
    position: "absolute",
    left: 2,
    color: "var(--color-text-tertiary)",
  },
  evDivider: {
    height: 1,
    background: "var(--color-divider-card)",
    margin: "4px 0",
  },
  sectLabel: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text-deep)",
  },
  sectSub: {
    fontSize: 12,
    color: "var(--color-text-tertiary)",
    margin: "2px 0 10px",
  },
  agentsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  },
};

// ---- v2 / i1 — evidence-first + numbered protocol w/ outcome chips ------
// Dedicated layout reached by picking v2 → i1 in the VersionBar. Sister
// to PlaybookOptionB but: tag chips collapse to a single secondary, the
// evidence grid surfaces per-agent outcome chips, and the protocol is a
// numbered list with full descriptions instead of mood-faces + bullets.
const PLAYBOOK_V2_I1_MOCK = {
  keyTag: "Price pressure",
  secondaryTag: "Returns · Urgent",
  whyText:
    "Full authentication up front and an early intent check kept the flow linear, so the price-driven cancellation resolved in a single pass.",
  agents: PLAYBOOK_AGENTS_GRID,
  protocol: [
    { n: 1, title: "Initial greeting",       description: "Greeted customer and asked for name and concern.",                                                                                         refs: [1, 2] },
    { n: 2, title: "Authentication",         description: "Requested and received ID, full name, and last four of order number. Confirmed identity before sharing account details.",                  refs: [5, 12] },
    { n: 3, title: "Discovery & probing",    description: "Confirmed customer had multiple returns. Identified specific handbag and price. Confirmed intent to cancel the return.",                   refs: [13, 18] },
    { n: 4, title: "Solution presentation",  description: "Explained they would initiate cancellation and forward to the department. Marked the request as urgent.",                                  refs: [19, 23] },
    { n: 5, title: "Resolution confirmation", description: "Customer confirmed understanding and satisfaction with the action taken. Agent confirmed no further assistance needed.",                  refs: [28, 30] },
    { n: 6, title: "Closing",                description: "Wished customer a nice afternoon. Customer reciprocated good wishes.",                                                                     refs: [29, 32] },
  ],
};

function PlaybookV2I1({ data }) {
  const [whyOpen, setWhyOpen] = React.useState(false);
  return (
    <div style={v2i1.body}>
      <div style={v2i1.hero}>
        <span style={v2i1.heroTile}>
          <BookOpen size={22} color="var(--color-icon-tertiary-fg)" />
        </span>
        <div>
          <h3 style={v2i1.heroTitle}>Agent playbook</h3>
          <div style={v2i1.tagRow}>
            <span style={v2i1.keyTag}>{data.keyTag}</span>
            <span style={v2i1.outlineTag}>{data.secondaryTag}</span>
          </div>
        </div>
      </div>

      <div style={v2i1.whyCard}>
        <div style={v2i1.whyHeader}>
          <span style={v2i1.whyBulb}>💡</span>
          <span style={v2i1.whyTitle}>Why this approach works</span>
        </div>
        <p style={v2i1.whyText}>
          {whyOpen ? data.whyText : `${data.whyText.slice(0, 130)}…`}
        </p>
        <button
          type="button"
          onClick={() => setWhyOpen((v) => !v)}
          style={v2i1.whyMore}
          aria-expanded={whyOpen}
        >
          {whyOpen ? "See less" : "See more"}
        </button>
      </div>

      <div>
        <div style={v2i1.sectLabel}>
          <User size={14} color="var(--color-text-medium)" />
          <span>Built from {data.agents.length} agent interactions</span>
        </div>
        <div style={v2i1.sectSub}>Each card is a source interaction · chip = the outcome it achieved</div>
        <div style={v2i1.agentsGrid}>
          {data.agents.map((a) => (
            <V2I1AgentCard key={a.id} agent={a} />
          ))}
        </div>
      </div>

      <div style={v2i1.protocolHeading}>The protocol</div>
      <div style={v2i1.protocolList}>
        {data.protocol.map((step, i) => (
          <V2I1ProtocolRow key={step.n} step={step} isLast={i === data.protocol.length - 1} />
        ))}
      </div>
    </div>
  );
}

function V2I1AgentCard({ agent }) {
  const ramp = PB_AGENTS[agent.id] || PB_AGENTS.SI;
  return (
    <div style={v2i1.agentCard}>
      <div style={v2i1.agentCardHead}>
        <span style={{ ...v2i1.agentAvatar, background: ramp.bg, color: ramp.text }}>{agent.id}</span>
        <span style={v2i1.agentName}>{agent.name}</span>
      </div>
      <div style={v2i1.agentMeta}>{agent.messages} messages · {agent.stages}</div>
      <span style={v2i1.outcomeChip}>
        <Check size={12} color="#1F8C45" />
        <span>{agent.outcome}</span>
      </span>
    </div>
  );
}

function V2I1ProtocolRow({ step, isLast }) {
  return (
    <div
      style={{
        ...v2i1.protocolRow,
        borderBottom: isLast ? "none" : "1px solid var(--color-divider-card)",
      }}
    >
      <span style={v2i1.stepNumber}>{step.n}</span>
      <div style={v2i1.stepBody}>
        <div style={v2i1.stepHead}>
          <span style={v2i1.stepTitle}>{step.title}</span>
          <span style={v2i1.refChip}>#{step.refs[0]}–{step.refs[1]}</span>
        </div>
        <div style={v2i1.stepDesc}>{step.description}</div>
      </div>
    </div>
  );
}

const v2i1 = {
  body: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
    paddingInline: 2,
  },
  hero: {
    display: "flex",
    alignItems: "flex-start",
    gap: 14,
  },
  heroTile: {
    width: 44,
    height: 44,
    borderRadius: 10,
    background: "var(--color-icon-tertiary-bg)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  heroTitle: {
    margin: 0,
    fontFamily: '"Poppins", sans-serif',
    fontSize: 22,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    lineHeight: 1.15,
  },
  tagRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 8,
  },
  keyTag: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    background: "#FAECE7",
    color: "#712B13",
    fontSize: 12,
    fontWeight: 600,
    padding: "5px 10px",
    borderRadius: 10,
    fontFamily: "var(--font-sans)",
  },
  outlineTag: {
    fontSize: 12,
    color: "var(--color-text-medium)",
    padding: "5px 10px",
    border: "1px solid var(--color-divider-card)",
    borderRadius: 10,
    fontFamily: "var(--font-sans)",
  },
  whyCard: {
    background: "#EFF6FF",
    borderRadius: 10,
    padding: "14px 16px",
  },
  whyHeader: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  whyBulb: { fontSize: 14, lineHeight: 1 },
  whyTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text-deep)",
  },
  whyText: {
    margin: 0,
    fontSize: 13,
    lineHeight: 1.55,
    color: "var(--color-text-deep)",
  },
  whyMore: {
    background: "transparent",
    border: "none",
    color: "var(--color-button-primary-bg)",
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    padding: "6px 0 0",
  },
  sectLabel: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text-deep)",
  },
  sectSub: {
    fontSize: 12,
    color: "var(--color-text-tertiary)",
    margin: "2px 0 10px",
  },
  agentsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  },
  agentCard: {
    border: "1px solid var(--color-divider-card)",
    borderRadius: 10,
    padding: 11,
    display: "flex",
    flexDirection: "column",
    gap: 6,
    background: "var(--surface-white)",
  },
  agentCardHead: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  agentAvatar: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 700,
    flexShrink: 0,
  },
  agentName: {
    fontSize: 13,
    fontWeight: 700,
    color: "var(--color-text-deep)",
  },
  agentMeta: {
    fontSize: 11,
    color: "var(--color-text-tertiary)",
    lineHeight: 1.4,
  },
  outcomeChip: {
    alignSelf: "flex-start",
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    background: "#E6FAEB",
    color: "#1F8C45",
    paddingInline: 8,
    paddingBlock: 3,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
  },
  protocolHeading: {
    fontFamily: '"Poppins", sans-serif',
    fontSize: 15,
    fontWeight: 600,
    color: "var(--color-text-deep)",
    marginTop: 4,
  },
  protocolList: {
    border: "1px solid var(--color-divider-card)",
    borderRadius: 12,
    overflow: "hidden",
  },
  protocolRow: {
    display: "grid",
    gridTemplateColumns: "28px 1fr",
    gap: 12,
    padding: "14px 16px",
    alignItems: "flex-start",
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: "50%",
    background: "var(--color-card-emoji-bg)",
    color: "var(--color-text-medium)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 700,
    marginTop: 2,
  },
  stepBody: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    minWidth: 0,
  },
  stepHead: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "var(--color-text-deep)",
  },
  refChip: {
    flexShrink: 0,
    background: "var(--color-icon-tertiary-bg)",
    color: "var(--color-icon-tertiary-fg)",
    fontSize: 11,
    fontWeight: 600,
    padding: "3px 8px",
    borderRadius: 6,
    fontFamily: "var(--font-sans)",
    whiteSpace: "nowrap",
  },
  stepDesc: {
    fontSize: 13,
    color: "var(--color-text-tertiary)",
    lineHeight: 1.55,
  },
};

// Hero (icon tile + title + subline) — shared across all options.
function PlaybookHero({ sub, compact = false, rightSlot = null }) {
  return (
    <div style={compact ? pbStyles.heroCompact : pbStyles.hero}>
      <span style={compact ? pbStyles.heroTileCompact : pbStyles.heroTile}>
        <Headphones size={compact ? 18 : 22} color="var(--color-icon-tertiary-fg)" />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={compact ? pbStyles.heroTitleCompact : pbStyles.heroTitle}>Agent playbook</h3>
        {sub && <div style={pbStyles.heroSub}>{sub}</div>}
      </div>
      {rightSlot}
    </div>
  );
}

function KeyTag({ children }) {
  return <span style={pbStyles.keyTag}>{children}</span>;
}

function PlaybookTags({ data }) {
  return (
    <div style={pbStyles.tagRow}>
      <KeyTag>{data.keyTag}</KeyTag>
      {data.secondaryTags.map((t) => (
        <span key={t} style={pbStyles.tag}>{t}</span>
      ))}
    </div>
  );
}

function WhyCallout({ data }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={pbStyles.why}>
      <div style={pbStyles.whyEyebrow}>
        <Smile size={14} color="#0C447C" />
        <span>Why this approach works</span>
      </div>
      <p style={pbStyles.whyText}>{open ? data.whyFull : data.whyShort}</p>
      <button type="button" onClick={() => setOpen((v) => !v)} style={pbStyles.whyMore} aria-expanded={open}>
        {open ? "See less" : "See more"}
      </button>
    </div>
  );
}

function MoodDot({ mood }) {
  const cfg = PB_MOODS[mood] || PB_MOODS.smile;
  const Icon = cfg.Icon;
  return (
    <span style={{ ...pbStyles.moodDot, background: cfg.dotBg }}>
      <Icon size={14} color={cfg.color} aria-label={`${mood} sentiment`} />
    </span>
  );
}

function RefChip({ stage, activeAgent, onSetAgent, compact = false }) {
  const ramp = PB_AGENTS[stage.agent];
  const dim = activeAgent && activeAgent !== stage.agent;
  const label = compact ? `#${stage.refs[0]}–${stage.refs[1]}` : `#${stage.refs[0]} · #${stage.refs[1]}`;
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onSetAgent(stage.agent); }}
      style={{
        ...pbStyles.ref,
        background: ramp.bg,
        color: ramp.text,
        opacity: dim ? 0.42 : 1,
      }}
      aria-label={`Messages ${stage.refs[0]} to ${stage.refs[1]}, from ${ramp.name}`}
    >
      {label}
    </button>
  );
}

function AgentCard({ code, data, activeAgent, onSetAgent }) {
  const ramp = PB_AGENTS[code];
  const stages = data.stages.filter((s) => s.agent === code);
  const msgs = stages.reduce((n, s) => n + s.refs.length, 0);
  const stageList = stages
    .map((s) => s.name.replace(" & probing", "").replace("Initial ", "").replace(" confirmation", "").replace(" presentation", ""))
    .join(", ");
  const dim = activeAgent && activeAgent !== code;
  const on = activeAgent === code;
  return (
    <button
      type="button"
      onClick={() => onSetAgent(code)}
      style={{
        ...pbStyles.agentCard,
        borderColor: on ? ramp.accent : "var(--color-divider-card)",
        opacity: dim ? 0.42 : 1,
      }}
    >
      <span style={pbStyles.agentCardHead}>
        <span style={{ ...pbStyles.agentAvatar, background: ramp.bg, color: ramp.text }}>
          {getInitials(code)}
        </span>
        <span style={pbStyles.agentName}>{ramp.name}</span>
      </span>
      <span style={pbStyles.agentMeta}>{msgs} messages · {stageList}</span>
    </button>
  );
}

function EvidenceGrid({ data, activeAgent, onSetAgent }) {
  return (
    <div>
      <div style={pbStyles.sectLabel}>
        <User size={14} color="var(--color-text-medium)" />
        <span>Built from {Object.keys(PB_AGENTS).length} agent interactions</span>
      </div>
      <div style={pbStyles.evGrid}>
        {Object.keys(PB_AGENTS).map((code) => (
          <AgentCard key={code} code={code} data={data} activeAgent={activeAgent} onSetAgent={onSetAgent} />
        ))}
      </div>
    </div>
  );
}

// ---- Option A — Editorial timeline -----------------------------------
function PlaybookOptionA({ data, activeAgent, onSetAgent }) {
  return (
    <div style={pbStyles.optBody}>
      <PlaybookHero sub={data.contextLine} />
      <PlaybookTags data={data} />
      <WhyCallout data={data} />
      <div style={pbStyles.track}>
        <span style={pbStyles.trackLine} aria-hidden="true" />
        {data.stages.map((s) => (
          <TimelineNode key={s.id} stage={s} activeAgent={activeAgent} onSetAgent={onSetAgent} />
        ))}
      </div>
      <div style={pbStyles.evDivider}>
        <EvidenceGrid data={data} activeAgent={activeAgent} onSetAgent={onSetAgent} />
      </div>
    </div>
  );
}

function TimelineNode({ stage, activeAgent, onSetAgent }) {
  const dim = activeAgent && activeAgent !== stage.agent;
  const on = activeAgent === stage.agent;
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSetAgent(stage.agent)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSetAgent(stage.agent);
        }
      }}
      style={{
        ...pbStyles.node,
        background: on ? "#F3F6FB" : "transparent",
        opacity: dim ? 0.42 : 1,
      }}
    >
      <span style={pbStyles.nodeDot}>
        <MoodDot mood={stage.mood} />
      </span>
      <div style={pbStyles.nodeHead}>
        <span style={pbStyles.nodeName}>{stage.name}</span>
        <RefChip stage={stage} activeAgent={activeAgent} onSetAgent={onSetAgent} />
      </div>
      <ul style={pbStyles.bullets}>
        {stage.bullets.map((b, i) => (
          <li key={i} style={pbStyles.bullet}>
            <span aria-hidden="true" style={pbStyles.bulletDot}>•</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---- Option B — Evidence-first ---------------------------------------
function PlaybookOptionB({ data, activeAgent, onSetAgent }) {
  return (
    <div style={pbStyles.optBody}>
      <PlaybookHero />
      <PlaybookTags data={data} />
      <WhyCallout data={data} />
      <EvidenceGrid data={data} activeAgent={activeAgent} onSetAgent={onSetAgent} />
      <div style={pbStyles.protocolLabel}>The protocol</div>
      <div style={pbStyles.list}>
        {data.stages.map((s, i) => (
          <ListRow
            key={s.id}
            stage={s}
            isLast={i === data.stages.length - 1}
            activeAgent={activeAgent}
            onSetAgent={onSetAgent}
          />
        ))}
      </div>
    </div>
  );
}

function ListRow({ stage, isLast, activeAgent, onSetAgent }) {
  const dim = activeAgent && activeAgent !== stage.agent;
  const on = activeAgent === stage.agent;
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSetAgent(stage.agent)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSetAgent(stage.agent);
        }
      }}
      style={{
        ...pbStyles.li,
        borderBottom: isLast ? "none" : "1px solid var(--color-divider-card)",
        background: on ? "#F3F6FB" : "transparent",
        opacity: dim ? 0.42 : 1,
      }}
    >
      <MoodDot mood={stage.mood} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={pbStyles.liTop}>
          <span style={pbStyles.liName}>{stage.name}</span>
          <RefChip stage={stage} activeAgent={activeAgent} onSetAgent={onSetAgent} />
        </div>
        <div style={pbStyles.liBody}>{stage.bullets.join(" ")}</div>
      </div>
    </div>
  );
}

// ---- Option C — Compact ----------------------------------------------
function PlaybookOptionC({ data, activeAgent, onSetAgent, onClearAgent }) {
  const [expanded, setExpanded] = React.useState({});
  const toggle = (id) => setExpanded((m) => ({ ...m, [id]: !m[id] }));
  return (
    <div style={pbStyles.optBody}>
      <PlaybookHero compact rightSlot={<KeyTag>{data.keyTag}</KeyTag>} />
      <div style={pbStyles.lead}>{data.leadLine}</div>
      <div style={pbStyles.cmp}>
        {data.stages.map((s, i) => (
          <CompactRow
            key={s.id}
            stage={s}
            expanded={!!expanded[s.id]}
            onToggle={() => toggle(s.id)}
            activeAgent={activeAgent}
            onSetAgent={onSetAgent}
            isLast={i === data.stages.length - 1}
          />
        ))}
      </div>
      <EvidenceStrip
        data={data}
        activeAgent={activeAgent}
        onSetAgent={onSetAgent}
        onClearAgent={onClearAgent}
      />
    </div>
  );
}

function CompactRow({ stage, expanded, onToggle, isLast, activeAgent, onSetAgent }) {
  const dim = activeAgent && activeAgent !== stage.agent;
  return (
    <div style={{ opacity: dim ? 0.42 : 1 }}>
      <div
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        style={{
          ...pbStyles.crow,
          borderBottom: isLast ? "none" : "1px solid var(--color-divider-card)",
        }}
      >
        <MoodDot mood={stage.mood} />
        <span style={pbStyles.crowName}>{stage.name}</span>
        <RefChip stage={stage} activeAgent={activeAgent} onSetAgent={onSetAgent} compact />
        <span style={{ ...pbStyles.crowChev, transform: expanded ? "rotate(180deg)" : "rotate(0)" }}>
          <ChevronDown size={16} color="var(--color-text-tertiary)" />
        </span>
      </div>
      {expanded && (
        <ul style={pbStyles.crowDetail}>
          {stage.bullets.map((b, i) => (
            <li key={i} style={pbStyles.bullet}>
              <span aria-hidden="true" style={pbStyles.bulletDot}>•</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EvidenceStrip({ data, activeAgent, onSetAgent, onClearAgent }) {
  const totalMsgs = data.stages.reduce((n, s) => n + s.refs.length, 0);
  const agentCount = Object.keys(PB_AGENTS).length;
  return (
    <div style={pbStyles.evRow}>
      <div style={pbStyles.evStack}>
        {Object.keys(PB_AGENTS).map((code, i) => {
          const ramp = PB_AGENTS[code];
          const dim = activeAgent && activeAgent !== code;
          return (
            <button
              key={code}
              type="button"
              onClick={() => onSetAgent(code)}
              style={{
                ...pbStyles.stackAvatar,
                background: ramp.bg,
                color: ramp.text,
                marginLeft: i === 0 ? 0 : -8,
                opacity: dim ? 0.42 : 1,
              }}
              aria-label={ramp.name}
              title={ramp.name}
            >
              {getInitials(code)}
            </button>
          );
        })}
      </div>
      <span style={pbStyles.evRowText}>
        Built from {agentCount} agents · {totalMsgs} referenced messages
      </span>
      <button type="button" onClick={onClearAgent} style={pbStyles.evRowTrace}>
        Trace
      </button>
    </div>
  );
}

// ---- Mock data + helpers -------------------------------------------------

// 🚩 FLAG for Akash — mock interaction payload. Single fixture today;
// every id resolves to the same content. Wire to a fetch by id once the
// upstream entry point lands.
const MOCK_INTERACTION = {
  customerId: "000028",
  interactionId: "7123456",
  agent: { initials: "GA", name: "G Agent" },
  date: "2024-12-12",
  duration: "2d 11h 12m",
  channel: "email",
  direction: "Outbound",
  language: "Es",
  messages: [
    {
      id: "m1",
      senderRole: "customer",
      subject: "Re: FB 12345.Incidencia Subject",
      to: { address: "stark@avengers.com", role: "Agent email" },
      timestamp: "December 14, 2024, 12:30 PM",
      expandedDefault: true,
      body:
        "Hola María,\n" +
        "Nos ponemos en contacto contigo en relación a tu consulta a través de Facebook.\n" +
        "Estamos analizando tu consulta. Contactaremos contigo para poder darte una solución lo antes posible.\n" +
        "Te facilitamos a continuación el número de seguimiento de estas gestiones por si necesitas contactarnos de nuevo:\n" +
        "Pedido 2434629008560 - 14060794\n" +
        "Pedido 2434629008560 - 14083633\n" +
        "Muchas gracias por tu confianza y tu comprensión.\n\n" +
        "Atentamente,\n" +
        "“Haciendo al cliente el protagonista de nuestra historia”\n" +
        "Servicio de Venta y Atención al Cliente\n" +
        "Si nos necesitas, contacta con nosotros en: consultas y comentarios de nuestra web o por correo.\n\n" +
        "Buenas tardes,\n" +
        "Contactamos con cliente para informar que estamos gestionando su solicitud, se remite al departamento de logística para que la agencia devuelva el pedido y se abone.\n\n" +
        "Un saludo,\n" +
        "Héctor Villena",
    },
    {
      id: "m2",
      senderRole: "customer",
      subject: "Re: FB 12345.Incidencia Subject",
      to: { address: "stark@avengers.com", role: "Agent email" },
      timestamp: "December 14, 2024, 12:20 PM",
    },
    {
      id: "m3",
      senderRole: "customer",
      subject: "Re: FB 12345.Incidencia Subject",
      to: { address: "stark@avengers.com", role: "Agent email" },
      timestamp: "December 12, 2024, 10:19 PM",
    },
    {
      id: "m4",
      senderRole: "agent",
      subject: "El Corte Inglés Online Store | Request for Information",
      to: { address: "capta@avengers.es", role: "Customer email" },
      timestamp: "December 12, 2024, 10:13 PM",
    },
  ],
  insights: {
    contactReasonOverview: {},
    interactionOutcome: { status: "Moderate" },
    customerSentiment:  { status: "Positive" },
    agentPlaybook: {
      contextLine: "Returns & cancellations · 6 stages",
      keyTag: "Price pressure",
      secondaryTags: ["Returns", "Marked urgent"],
      whyShort:
        "The agent followed a standard, efficient protocol: professional greeting, thorough authentication, clear discovery…",
      whyFull:
        "The agent followed a standard, efficient protocol — professional greeting, thorough authentication, clear discovery, a forwarded solution, confirmation of understanding, and a clean close. Full authentication up front and an early intent check kept the flow linear, so the price-driven cancellation resolved in a single pass with minimal customer effort.",
      leadLine:
        "Up-front authentication and an early intent check kept the flow linear — resolved in one pass, no repetition.",
      stages: [
        { id: "greeting",   name: "Initial greeting",        mood: "smile",   refs: [1, 2],   agent: "SI", bullets: ["Greeted customer and asked for name and concern."] },
        { id: "auth",       name: "Authentication",          mood: "neutral", refs: [5, 12],  agent: "AM", bullets: ["Requested and received ID, full name, and last four of order number.", "System loading time noted."] },
        { id: "discovery",  name: "Discovery & probing",     mood: "smile",   refs: [13, 18], agent: "TN", bullets: ["Confirmed customer had multiple returns.", "Identified specific handbag and price.", "Confirmed intent to cancel the return."] },
        { id: "solution",   name: "Solution presentation",   mood: "smile",   refs: [19, 23], agent: "RK", bullets: ["Explained they would initiate cancellation and forward to the department.", "Marked the request as urgent."] },
        { id: "resolution", name: "Resolution confirmation", mood: "happy",   refs: [28, 30], agent: "RK", bullets: ["Customer confirmed understanding and satisfaction with the action taken.", "Agent confirmed no further assistance needed."] },
        { id: "closing",    name: "Closing",                 mood: "happy",   refs: [29, 32], agent: "SI", bullets: ["Wished customer a nice afternoon.", "Customer reciprocated good wishes."] },
      ],
    },
    predictedCsat: { status: "Satisfied" },
    sessionInsights: {},
  },
};

function resolveInteraction(id) {
  return { ...MOCK_INTERACTION, interactionId: id || MOCK_INTERACTION.interactionId };
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ---- Styles --------------------------------------------------------------

const pStyles = {
  shell: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    width: "100%",
    fontFamily: "var(--font-sans)",
  },
  metaBar: {
    position: "sticky",
    top: 0,
    zIndex: 20,
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "8px 12px",
    minHeight: 56,
    background: "var(--surface-white)",
    border: "2px solid var(--surface-white)",
    borderRadius: 12,
    boxShadow: "var(--shadow-card)",
  },
  backBtn: {
    width: 24,
    height: 24,
    borderRadius: 4,
    background: "var(--color-card-emoji-bg)",
    border: "none",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  customerId: {
    fontFamily: '"Poppins", sans-serif',
    fontSize: 16,
    fontWeight: 600,
    color: "var(--color-text-deep)",
    whiteSpace: "nowrap",
  },
  metaSep: {
    color: "var(--color-text-tertiary)",
    fontSize: 12,
    lineHeight: 1,
    flexShrink: 0,
  },
  metaText: {
    fontSize: 13,
    color: "var(--color-text-medium)",
    whiteSpace: "nowrap",
    display: "inline-flex",
    alignItems: "center",
  },
  monogram: {
    width: 24,
    height: 24,
    borderRadius: "50%",
    background: "var(--color-icon-tertiary-bg)",
    color: "var(--color-icon-tertiary-fg)",
    fontFamily: '"Mulish", sans-serif',
    fontSize: 11,
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  channelDirection: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  },
  langPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    height: 28,
    paddingInline: 10,
    borderRadius: 6,
    border: "1px solid var(--color-divider-card)",
    background: "var(--surface-white)",
    cursor: "pointer",
    fontFamily: "var(--font-sans)",
  },
  langText: {
    fontSize: 13,
    fontWeight: 700,
    color: "var(--color-text-medium)",
    letterSpacing: "0.1px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
    gap: 16,
    alignItems: "start",
  },
  colHeader: {
    display: "flex",
    alignItems: "center",
    paddingInline: 20,
    height: 56,
    borderBottom: "1px solid var(--color-divider-card)",
  },
  colTitle: {
    fontFamily: '"Poppins", sans-serif',
    fontSize: 14,
    fontWeight: 600,
    color: "var(--color-text-deep)",
    letterSpacing: "0.1px",
  },
  threadList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    padding: 16,
  },
  emailCard: {
    border: "1px solid var(--color-border-tab)",
    borderRadius: 12,
    background: "var(--surface-white)",
    overflow: "hidden",
  },
  emailHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: 16,
    width: "100%",
    padding: "16px 20px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    textAlign: "left",
    fontFamily: "var(--font-sans)",
  },
  emailHeaderText: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  emailHeaderRow: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    minWidth: 0,
  },
  emailSubject: {
    flex: 1,
    minWidth: 0,
    fontFamily: '"Poppins", sans-serif',
    fontSize: 14,
    fontWeight: 600,
    color: "var(--color-text-deep)",
    letterSpacing: "0.1px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  emailTime: {
    fontSize: 12,
    color: "var(--color-text-placeholder)",
    whiteSpace: "nowrap",
    letterSpacing: "0.4px",
  },
  emailToRow: {
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  emailTo: {
    fontSize: 12,
    color: "var(--color-text-tertiary)",
    letterSpacing: "0.4px",
  },
  emailChevron: {
    width: 24,
    height: 24,
    borderRadius: 999,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  roleAvatar: {
    width: 40,
    height: 40,
    borderRadius: 999,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  emailBodyWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    padding: "0 20px 16px 76px",
  },
  emailDivider: {
    height: 1,
    background: "var(--color-divider-card)",
    marginRight: -56,
  },
  emailBody: {
    margin: 0,
    fontSize: 12,
    lineHeight: "18px",
    color: "var(--color-text-tertiary)",
    letterSpacing: "0.4px",
    whiteSpace: "pre-wrap",
  },
  seeLess: {
    alignSelf: "flex-start",
    background: "transparent",
    border: "none",
    padding: 0,
    fontSize: 12,
    color: "var(--color-button-primary-bg)",
    cursor: "pointer",
    letterSpacing: "0.4px",
    fontFamily: "var(--font-sans)",
  },
  threadStarted: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    paddingInline: 4,
    marginTop: 4,
  },
  threadLine: {
    flex: 1,
    height: 1,
    background: "var(--color-divider-card)",
  },
  threadStartedText: {
    fontSize: 12,
    color: "var(--color-text-placeholder)",
    letterSpacing: "0.4px",
    fontFamily: '"Mulish", sans-serif',
    fontWeight: 500,
  },
  tabsWrap: {
    paddingInline: 32,
    paddingTop: 4,
    borderBottom: "none",
  },
  tabBody: {
    paddingBlock: 8,
  },
  insightList: {
    margin: 0,
    padding: 0,
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
  },
  insightRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 24,
    width: "100%",
    paddingInline: 32,
    height: 56,
    background: "transparent",
    border: "none",
    borderBottom: "1px solid var(--color-divider-card)",
    cursor: "pointer",
    textAlign: "left",
    fontFamily: "var(--font-sans)",
  },
  insightLeft: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    minWidth: 0,
    flex: 1,
  },
  insightLabel: {
    fontSize: 14,
    color: "var(--color-text-deep)",
    letterSpacing: "0.25px",
  },
  insightRight: {
    display: "inline-flex",
    alignItems: "center",
    gap: 12,
    flexShrink: 0,
  },
  pill: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 88,
    paddingInline: 8,
    paddingBlock: 2,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 500,
    letterSpacing: "0.5px",
    fontFamily: '"Poppins", sans-serif',
  },
  emptyTab: {
    padding: "32px 24px",
    color: "var(--color-text-tertiary)",
    fontSize: 13,
    textAlign: "center",
  },

  // ---- Category detail shell ----
  detailWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
    padding: "16px 12px",
  },
  detailHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "transparent",
    border: "none",
    padding: 0,
    cursor: "pointer",
    textAlign: "left",
    width: "100%",
    fontFamily: "var(--font-sans)",
  },
  detailHeaderTitleGroup: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  detailHeaderTitle: {
    flex: 1,
    minWidth: 0,
    fontFamily: '"Poppins", sans-serif',
    fontSize: 14,
    fontWeight: 500,
    color: "var(--color-text-medium)",
    letterSpacing: "0.1px",
  },
  detailPlaceholder: {
    padding: "32px 24px",
    color: "var(--color-text-tertiary)",
    fontSize: 13,
    textAlign: "center",
    border: "1px solid var(--color-border-tab)",
    borderRadius: 12,
  },
  detailBody: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },

  // ---- Assessment card ----
  assessmentCard: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    padding: "12px 24px",
    background: "var(--color-card-emoji-bg)",
    borderRadius: 8,
  },
  // 🚩 FLAG — eyebrow color. Figma uses #6650A5 (violet) which matches
  // --color-icon-tertiary-fg; that's our canonical "section accent" today.
  eyebrow: {
    fontFamily: '"Poppins", sans-serif',
    fontSize: 11,
    fontWeight: 600,
    lineHeight: "18px",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    color: "var(--color-icon-tertiary-fg)",
  },
  assessmentRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  assessmentBodyClamp: {
    margin: 0,
    flex: 1,
    minWidth: 0,
    fontFamily: '"Poppins", sans-serif',
    fontSize: 14,
    lineHeight: "22px",
    letterSpacing: "0.25px",
    color: "var(--color-text-medium)",
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 3,
    overflow: "hidden",
  },
  assessmentBodyOpen: {
    margin: 0,
    flex: 1,
    minWidth: 0,
    fontFamily: '"Poppins", sans-serif',
    fontSize: 14,
    lineHeight: "22px",
    letterSpacing: "0.25px",
    color: "var(--color-text-medium)",
  },
  linkBtn: {
    background: "transparent",
    border: "none",
    padding: 0,
    cursor: "pointer",
    fontFamily: '"Poppins", sans-serif',
    fontSize: 14,
    fontWeight: 500,
    color: "var(--color-button-primary-bg)",
    letterSpacing: "0.1px",
    flexShrink: 0,
  },
  citationBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 2,
    padding: "2px 6px",
    background: "var(--grey-100)",
    borderRadius: 100,
    flexShrink: 0,
    alignSelf: "flex-start",
  },
  citationBadgeCount: {
    fontFamily: '"Poppins", sans-serif',
    fontSize: 12,
    fontWeight: 600,
    lineHeight: "20px",
    letterSpacing: "0.5px",
    color: "var(--color-text-tertiary)",
  },

  // ---- Present Stages card ----
  stagesCard: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    padding: "16px 24px",
    background: "var(--surface-white)",
    border: "1px solid var(--color-border-tab)",
    borderRadius: 12,
  },
  stagesHeading: {
    fontFamily: '"Poppins", sans-serif',
    fontSize: 14,
    fontWeight: 500,
    lineHeight: "22px",
    letterSpacing: "0.1px",
    color: "var(--color-text-medium)",
  },
  stagesList: {
    display: "flex",
    flexDirection: "column",
  },
  stageRow: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    padding: "16px 0",
  },
  stageTopRow: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  stageLeft: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  stageTitle: {
    fontFamily: '"Poppins", sans-serif',
    fontSize: 11,
    fontWeight: 600,
    lineHeight: "18px",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    color: "var(--color-icon-tertiary-fg)",
    flex: 1,
    minWidth: 0,
  },
  citationRefs: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
  },
  citationDot: {
    width: 3,
    height: 3,
    borderRadius: "50%",
    background: "var(--color-divider-card)",
    display: "inline-block",
  },
  citationLink: {
    background: "transparent",
    border: "none",
    padding: 0,
    cursor: "pointer",
    fontFamily: '"Poppins", sans-serif',
    fontSize: 12,
    fontWeight: 400,
    lineHeight: "20px",
    letterSpacing: "0.4px",
    color: "var(--color-button-primary-bg)",
  },
  observationList: {
    margin: 0,
    padding: 0,
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  observationItem: {
    display: "flex",
    gap: 8,
    fontFamily: '"Poppins", sans-serif',
    fontSize: 14,
    lineHeight: "22px",
    letterSpacing: "0.25px",
    color: "var(--color-text-medium)",
  },
  observationBullet: {
    color: "var(--color-text-tertiary)",
    flexShrink: 0,
  },
};

// ---- Agent Playbook (3-option switcher) styles --------------------------
//
// 🚩 FLAG — raw hex values below (agent ramps + mood face backgrounds +
// row hover tint #F3F6FB) have no design-system equivalent today. Inlined
// to ship the review; promote to tokens once the palette lands.
const pbStyles = {
  detail: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    paddingInline: 2,
  },
  optBody: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
    paddingTop: 4,
  },
  hero: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  heroCompact: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  heroTile: {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: "var(--color-icon-tertiary-bg)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  heroTileCompact: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: "var(--color-icon-tertiary-bg)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  heroTitle: {
    margin: 0,
    fontFamily: '"Poppins", sans-serif',
    fontSize: 20,
    fontWeight: 600,
    color: "var(--color-text-deep)",
    lineHeight: 1.15,
  },
  heroTitleCompact: {
    margin: 0,
    fontFamily: '"Poppins", sans-serif',
    fontSize: 18,
    fontWeight: 600,
    color: "var(--color-text-deep)",
    lineHeight: 1.15,
  },
  heroSub: {
    fontSize: 12,
    color: "var(--color-text-tertiary)",
    marginTop: 2,
  },
  heroInlineTags: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    flexWrap: "wrap",
  },
  tagRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 7,
    alignItems: "center",
  },
  keyTag: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    background: "#FAECE7",
    color: "#712B13",
    fontSize: 12,
    fontWeight: 600,
    padding: "5px 10px",
    borderRadius: 10,
    fontFamily: "var(--font-sans)",
  },
  tag: {
    fontSize: 12,
    color: "var(--color-text-tertiary)",
    padding: "5px 10px",
    border: "1px solid var(--color-divider-card)",
    borderRadius: 10,
  },
  why: {
    background: "#E6F1FB",
    borderRadius: 10,
    padding: "13px 15px",
  },
  whyEyebrow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    fontWeight: 600,
    color: "#0C447C",
    marginBottom: 5,
  },
  whyText: {
    margin: 0,
    fontSize: 13,
    lineHeight: 1.6,
    color: "var(--color-text-deep)",
  },
  whyMore: {
    background: "none",
    border: "none",
    color: "#185FA5",
    fontFamily: "inherit",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    padding: "6px 0 0",
  },
  track: {
    position: "relative",
    paddingLeft: 30,
  },
  trackLine: {
    position: "absolute",
    left: 9,
    top: 6,
    bottom: 6,
    width: 2,
    background: "var(--color-divider-card)",
  },
  node: {
    position: "relative",
    marginBottom: 18,
    marginLeft: -4,
    cursor: "pointer",
    borderRadius: 8,
    padding: "2px 4px",
    fontFamily: "var(--font-sans)",
    transition: "background 150ms ease, opacity 200ms ease",
  },
  nodeDot: {
    position: "absolute",
    left: -30,
    top: 0,
  },
  nodeHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: 8,
    flexWrap: "wrap",
  },
  nodeName: {
    fontSize: 15,
    fontWeight: 600,
    color: "var(--color-text-deep)",
  },
  bullets: {
    listStyle: "none",
    padding: 0,
    margin: "3px 0 0",
  },
  bullet: {
    fontSize: 13,
    color: "var(--color-text-tertiary)",
    lineHeight: 1.55,
    paddingLeft: 14,
    position: "relative",
    display: "block",
  },
  bulletDot: {
    position: "absolute",
    left: 4,
    color: "var(--color-text-tertiary)",
  },
  moodDot: {
    width: 22,
    height: 22,
    borderRadius: "50%",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  ref: {
    fontSize: 11,
    fontWeight: 500,
    padding: "2px 7px",
    borderRadius: 6,
    cursor: "pointer",
    border: "1px solid transparent",
    whiteSpace: "nowrap",
    fontFamily: "var(--font-sans)",
    transition: "opacity 200ms ease",
  },
  sectLabel: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12.5,
    fontWeight: 600,
    color: "var(--color-text-deep)",
    marginBottom: 11,
  },
  evGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 9,
  },
  evDivider: {
    marginTop: 24,
    paddingTop: 18,
    borderTop: "1px solid var(--color-divider-card)",
  },
  agentCard: {
    border: "1px solid var(--color-divider-card)",
    borderRadius: 10,
    padding: 11,
    cursor: "pointer",
    background: "transparent",
    textAlign: "left",
    fontFamily: "var(--font-sans)",
    display: "block",
    width: "100%",
    transition: "border-color 150ms ease, opacity 200ms ease",
  },
  agentCardHead: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  agentAvatar: {
    width: 30,
    height: 30,
    borderRadius: "50%",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 600,
    flexShrink: 0,
  },
  agentName: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text-deep)",
  },
  agentMeta: {
    display: "block",
    fontSize: 11,
    color: "var(--color-text-tertiary)",
    marginTop: 6,
    lineHeight: 1.4,
  },
  protocolLabel: {
    fontSize: 12.5,
    fontWeight: 600,
    color: "var(--color-text-tertiary)",
    margin: "8px 0 4px",
  },
  list: {
    border: "1px solid var(--color-divider-card)",
    borderRadius: 14,
    overflow: "hidden",
  },
  li: {
    display: "flex",
    gap: 11,
    padding: "13px 15px",
    cursor: "pointer",
    fontFamily: "var(--font-sans)",
    textAlign: "left",
    transition: "background 150ms ease, opacity 200ms ease",
  },
  liTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 8,
    alignItems: "baseline",
  },
  liName: {
    fontSize: 14,
    fontWeight: 600,
    color: "var(--color-text-deep)",
  },
  liBody: {
    fontSize: 13,
    color: "var(--color-text-tertiary)",
    marginTop: 2,
    lineHeight: 1.5,
  },
  lead: {
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: 15,
    lineHeight: 1.55,
    paddingLeft: 14,
    borderLeft: "2px solid var(--color-divider-card)",
    color: "var(--color-text-deep)",
    margin: "4px 0 6px",
  },
  cmp: {
    display: "flex",
    flexDirection: "column",
  },
  crow: {
    display: "flex",
    alignItems: "center",
    gap: 11,
    padding: "11px 4px",
    cursor: "pointer",
    background: "transparent",
    fontFamily: "var(--font-sans)",
    textAlign: "left",
  },
  crowName: {
    flex: 1,
    fontSize: 14,
    fontWeight: 600,
    color: "var(--color-text-deep)",
  },
  crowChev: {
    display: "inline-flex",
    transition: "transform 200ms ease",
  },
  crowDetail: {
    listStyle: "none",
    padding: "0 4px 12px 37px",
    margin: 0,
  },
  evRow: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    padding: "11px 12px",
    background: "var(--color-card-emoji-bg)",
    borderRadius: 10,
    marginTop: 16,
  },
  evStack: {
    display: "flex",
  },
  stackAvatar: {
    width: 27,
    height: 27,
    borderRadius: "50%",
    border: "2px solid var(--color-card-emoji-bg)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 600,
    cursor: "pointer",
    transition: "opacity 200ms ease",
  },
  evRowText: {
    flex: 1,
    fontSize: 12,
    color: "var(--color-text-tertiary)",
  },
  evRowTrace: {
    fontSize: 12,
    color: "#185FA5",
    fontWeight: 500,
    cursor: "pointer",
    background: "transparent",
    border: "none",
    padding: 0,
    fontFamily: "var(--font-sans)",
  },
};
