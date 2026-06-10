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
  Frown,
  Quote,
  Activity,
  User,
} from "lucide-react";
import Button from "./Button";
import Card from "./Card";
import TabsRow from "./TabsRow";

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

const TAB_DEFS = [
  { id: "insights", label: "Insights" },
  { id: "quality",  label: "Quality" },
  { id: "feedback", label: "Feedback" },
];

function InsightsColumn({ activeTab, onTabChange, insights, selectedCategory, onSelectCategory, onClearCategory }) {
  // 🚩 FLAG — sticky tabs. Spec calls for tabs that stay pinned at the top
  // of the scrolling right column. The column shares document scroll
  // today (see top-of-file FLAG), so sticky tabs would either fight the
  // metadata bar or read as unexpected. Tabs are static for now; promote
  // to sticky once independent column scroll lands.
  return (
    <Card padX={0} padY={0}>
      <div style={pStyles.tabsWrap}>
        <TabsRow
          tabs={TAB_DEFS}
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
            />
          ) : (
            <InsightsList
              insights={insights}
              onSelectCategory={onSelectCategory}
            />
          )
        ) : activeTab === "quality" ? (
          <EmptyTabPanel name="Quality" />
        ) : (
          <EmptyTabPanel name="Feedback" />
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
function CategoryDetail({ categoryId, insights, onBack }) {
  const meta = INSIGHT_ROWS.find((r) => r.id === categoryId);
  if (!meta) return null;
  return (
    <div style={pStyles.detailWrap}>
      <DetailHeader meta={meta} onBack={onBack} />
      <CategoryBody categoryId={categoryId} insights={insights} />
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

function CategoryBody({ categoryId, insights }) {
  if (categoryId === "playbook") {
    return <AgentPlaybookDetail data={insights?.agentPlaybook} />;
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

// ---- Agent Playbook detail body -----------------------------------------

// 🚩 FLAG — "Present Stages" semantics. Reading "Present" as stages that
// occurred during the call. No "Missing Stages" sibling block today;
// confirm whether one is intended.
function AgentPlaybookDetail({ data }) {
  if (!data) return null;
  return (
    <div style={pStyles.detailBody}>
      <AssessmentCard assessment={data.assessment} />
      <PresentStagesCard stages={data.presentStages} />
    </div>
  );
}

function AssessmentCard({ assessment }) {
  const [open, setOpen] = React.useState(false);
  if (!assessment) return null;
  return (
    <div style={pStyles.assessmentCard}>
      <span style={pStyles.eyebrow}>ASSESSMENT</span>
      <div style={pStyles.assessmentRow}>
        <p style={open ? pStyles.assessmentBodyOpen : pStyles.assessmentBodyClamp}>
          {renderTextWithCitations(assessment.text)}
        </p>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          style={pStyles.linkBtn}
          aria-expanded={open}
        >
          {open ? "See less" : "See more"}
        </button>
        <CitationBadge count={assessment.citationCount} />
      </div>
    </div>
  );
}

function PresentStagesCard({ stages = [] }) {
  return (
    <div style={pStyles.stagesCard}>
      <span style={pStyles.stagesHeading}>Present Stages</span>
      <div style={pStyles.stagesList}>
        {stages.map((s, i) => (
          <StageRow key={s.id} stage={s} isLast={i === stages.length - 1} />
        ))}
      </div>
    </div>
  );
}

function StageRow({ stage, isLast }) {
  return (
    <div style={{ ...pStyles.stageRow, borderBottom: isLast ? "none" : "1px solid var(--color-border-tab)" }}>
      <div style={pStyles.stageTopRow}>
        <span style={pStyles.stageLeft}>
          <SentimentFace sentiment={stage.sentiment} />
          <span style={pStyles.stageTitle}>{stage.title}</span>
        </span>
        <CitationRefs references={stage.references} />
      </div>
      {stage.observations?.length > 0 && (
        <ul style={pStyles.observationList}>
          {stage.observations.map((obs, i) => (
            <li key={i} style={pStyles.observationItem}>
              <span style={pStyles.observationBullet}>•</span>
              <span>{obs}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// 🚩 FLAG — sentiment-face icon source. The design system has no canonical
// face icons today; using lucide Smile / Meh / Frown as placeholders.
// 🚩 FLAG — face palette. Figma uses #00711D / #FFC24C / #C54600 which
// don't have direct tokens. Mapping to the closest existing severity
// tokens (--color-success / --color-warning / --color-error). Stage title
// is purple (--color-icon-tertiary-fg) across all sentiments per the
// Figma; only the face icon is sentiment-coloured.
const SENTIMENT_FACES = {
  positive: { Icon: Smile, color: "var(--color-success)" },
  neutral:  { Icon: Meh,   color: "var(--color-warning)" },
  negative: { Icon: Frown, color: "var(--color-error)" },
};

function SentimentFace({ sentiment }) {
  const cfg = SENTIMENT_FACES[sentiment] || SENTIMENT_FACES.neutral;
  const Icon = cfg.Icon;
  return <Icon size={16} color={cfg.color} aria-label={`${sentiment} sentiment`} />;
}

function CitationRefs({ references = [] }) {
  return (
    <span style={pStyles.citationRefs}>
      {references.map((n, i) => (
        <React.Fragment key={`${n}-${i}`}>
          {i > 0 && <span style={pStyles.citationDot} aria-hidden="true" />}
          <CitationLink n={n} label={`#${n}`} />
        </React.Fragment>
      ))}
    </span>
  );
}

function CitationLink({ n, label }) {
  return (
    <button
      type="button"
      onClick={() => onCitationClick(n)}
      style={pStyles.citationLink}
    >
      {label}
    </button>
  );
}

function CitationBadge({ count }) {
  if (!count) return null;
  return (
    <span style={pStyles.citationBadge} aria-label={`${count} citations`}>
      <Quote size={12} color="var(--color-text-tertiary)" />
      <span style={pStyles.citationBadgeCount}>{count}</span>
    </span>
  );
}

// Inline citation parser — splits the assessment text on [N] / [N-N]
// markers and renders each marker as a CitationLink. The non-marker
// chunks render as plain text nodes.
function renderTextWithCitations(text) {
  if (!text) return null;
  const parts = [];
  const regex = /\[(\d+(?:-\d+)?)\]/g;
  let lastIndex = 0;
  let match;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <CitationLink key={`c-${key++}`} n={match[1]} label={match[0]} />,
    );
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

// 🚩 FLAG for Akash — citation behavior. Stub today: clicking a [N] in
// the assessment or a #N on a stage row logs the target. Confirm:
// (a) are [N] and #N the same index space? (b) target = scroll-to +
// highlight on the left column? open the email card expanded? show a
// popover? (c) does N point to a message id or a moment inside a
// message?
function onCitationClick(n) {
  // eslint-disable-next-line no-console
  console.log("citation click", n);
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
      assessment: {
        text:
          "The agent maintained control of the call flow, moving logically from authentication [11] to diagnosis [16] and solution presentation [44]. " +
          "The interaction was efficient until standard troubleshooting (power reset) failed [59-69]. " +
          "The agent successfully navigated an unscripted technical hurdle by suggesting a physical intervention (using a stick to clear the rotor) [93-102]. " +
          "This step was critical and effective. The main friction point was the initial loop of failed standard steps. " +
          "The agent missed a formal recap of the final steps (let it rest 10-15 mins) being explicitly confirmed by the customer, although the instruction was given [176].",
        citationCount: 4,
      },
      presentStages: [
        { id: "initial_greeting",   title: "Initial Greeting",      sentiment: "neutral",  references: [1, 3],     observations: ["Agent greeting and identification"] },
        { id: "authentication",     title: "Authentication",        sentiment: "neutral",  references: [11, 15],   observations: ["Customer provided name and address"] },
        { id: "discovery_probing",  title: "Discovery and Probing", sentiment: "neutral",  references: [16, 19],   observations: ["Agent asked about light patterns", "Customer confirmed orange light"] },
        { id: "troubleshooting_a",  title: "Troubleshooting Steps", sentiment: "negative", references: [44, 70],   observations: ["Customer performed power reset", "Reset failed to clear error"] },
        { id: "discovery_probing_b",title: "Discovery and Probing", sentiment: "neutral",  references: [70, 81],   observations: ["Agent confirmed prior cleaning efforts", "Agent inquired about machine temperature"] },
        { id: "solution",           title: "Solution Presentation", sentiment: "neutral",  references: [93, 102],  observations: ["Agent suggested physical intervention (stick)"] },
        { id: "troubleshooting_b",  title: "Troubleshooting Steps", sentiment: "positive", references: [102, 110], observations: ["Customer cleared internal path with stick", "Water flow confirmed"] },
        { id: "recap",              title: "Recap",                 sentiment: "positive", references: [176, 180], observations: ["Agent instructed machine to rest 10-15 mins", "Customer confirmed understanding"] },
        { id: "closing",            title: "Closing",               sentiment: "positive", references: [185, 190], observations: ["Mutual thanks and farewell"] },
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
    gridTemplateColumns: "minmax(0, 1.45fr) minmax(0, 1fr)",
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
