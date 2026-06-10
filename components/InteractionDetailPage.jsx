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

  return (
    <div style={pStyles.shell}>
      <TopMetaBar interaction={interaction} onBack={onBack} />
      <div style={pStyles.grid}>
        <EmailConversationsColumn messages={interaction.messages} />
        <InsightsColumn
          activeTab={activeTab}
          onTabChange={setActiveTab}
          insights={interaction.insights}
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

function InsightsColumn({ activeTab, onTabChange, insights }) {
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
        {activeTab === "insights" && <InsightsList insights={insights} />}
        {activeTab === "quality" && <EmptyTabPanel name="Quality" />}
        {activeTab === "feedback" && <EmptyTabPanel name="Feedback" />}
      </div>
    </Card>
  );
}

// 🚩 FLAG — row click target. onInsightCategoryClick is a stub until the
// drill destination (in-page accordion vs. drawer vs. sub-route) is
// decided.
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

function InsightsList({ insights }) {
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
        />
      ))}
    </ul>
  );
}

function InsightRow({ row, pillValue }) {
  const { label, Icon } = row;
  return (
    <li>
      <button
        type="button"
        onClick={() => onInsightCategoryClick(row.id)}
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

function onInsightCategoryClick(_id) {
  // TODO: open the category detail. Target TBD — confirm with Akash.
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
    agentPlaybook:      {},
    predictedCsat:      { status: "Satisfied" },
    sessionInsights:    {},
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
};
