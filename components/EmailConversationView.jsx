"use client";

import React from "react";
import {
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Globe,
  Info,
  Mail,
  User,
  Headphones,
  Layers,
  BarChart3,
  Heart,
  Smile,
  Activity,
} from "lucide-react";
import Button from "./Button";

// EmailConversationView — drill-down screen reached by clicking the Email
// channel icon on an interaction row. Two-column layout: left card lists
// the email thread (one expanded, rest collapsed), right card shows tabbed
// insights for the same interaction.
//
// 🚩 FLAG for Akash — mock data. The thread payload (EMAIL_THREAD) and
// insights rows (INSIGHT_ROWS) are stubbed from the Figma reference and
// reused across every email row in the table. Wire to a real fetch keyed
// by interactionId before production.
// 🚩 FLAG — Insights tab content. Only the Insights tab has content; the
// Quality and Feedback tab bodies render an empty placeholder. Confirm
// scope (i.e. are Quality/Feedback in scope for this milestone).

const EMAIL_THREAD = [
  {
    id: "e1",
    expanded: true,
    role: "customer",
    subject: "Re: FB 12345.Incidencia Subject",
    to: "stark@avengers.com (Agent email)",
    time: "December 14, 2024, 12:30 PM",
    body:
      "Hola María, Nos ponemos en contacto contigo en relación a tu consulta a través de Facebook. Estamos analizando tu consulta. Contactaremos contigo para poder darte una solución lo antes posible. Te facilitamos a continuación el número de seguimiento de estas gestiones por si necesitas contactarnos de nuevo: Pedido 2434629008560 - 14060794 Pedido 2434629008560 - 14083633 Muchas gracias por tu confianza y tu comprensión. Atentamente, \"Haciendo al cliente el protagonista de nuestra historia\" Servicio de Venta y Atención al Cliente Si nos necesitas, contacta con nosotros en: consultas y comentarios de nuestra web o por correo. Buenas tardes, Contactamos con cliente para informar que estamos gestionando su solicitud, se remite al departamento de logística para que la agencia devuelva el pedido y se abone. Un saludo, Héctor Villena Mensaje Cliente: Reclamación. Mercancías y Servicios FB 63690 Título: Incidencia pedido Descripción: Reclama incidencia pedido.",
  },
  {
    id: "e2",
    expanded: false,
    role: "customer",
    subject: "Re: FB 12345.Incidencia Subject",
    to: "stark@avengers.com (Agent email)",
    time: "December 14, 2024, 12:20 PM",
  },
  {
    id: "e3",
    expanded: false,
    role: "customer",
    subject: "Re: FB 12345.Incidencia Subject",
    to: "stark@avengers.com (Agent email)",
    time: "December 12, 2024, 10:19 PM",
  },
  {
    id: "e4",
    expanded: false,
    role: "agent",
    subject: "El Corte Inglés Online Store | Request for Information",
    to: "capta@avengers.es (Customer email)",
    time: "December 12, 2024, 10:13 PM",
  },
];

const TABS = ["Insights", "Quality", "Feedback"];

// Each row optional chip; chips tinted by tone token.
const INSIGHT_ROWS = [
  { id: "contact",  label: "Contact Reason Overview",   Icon: Layers },
  { id: "outcome",  label: "Interaction Outcome Insights", Icon: BarChart3, chip: { text: "Moderate", tone: "amber" } },
  { id: "sentiment", label: "Customer Sentiment",        Icon: Heart,     chip: { text: "Positive", tone: "green" } },
  { id: "playbook", label: "Agent Playbook",             Icon: Headphones },
  { id: "csat",     label: "Predicted CSAT",             Icon: Smile,     chip: { text: "Satisfied", tone: "green" } },
  { id: "session",  label: "Session Insights",           Icon: Activity },
];

export default function EmailConversationView({ row, onBack }) {
  const [activeTab, setActiveTab] = React.useState("Insights");

  return (
    <div style={vStyles.shell}>
      <PageHeaderBar row={row} onBack={onBack} />
      <div style={vStyles.grid}>
        <EmailConversationsCard emails={EMAIL_THREAD} />
        <InsightsPanel
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          rows={INSIGHT_ROWS}
        />
      </div>
    </div>
  );
}

function PageHeaderBar({ row, onBack }) {
  const dateLabel = formatDateLabel(row.date);
  const durationLabel = formatDurationShort(row.duration);
  return (
    <div style={vStyles.header}>
      <button
        type="button"
        onClick={onBack}
        aria-label="Back to interactions"
        style={vStyles.backBtn}
      >
        <ArrowLeft size={18} color="var(--color-text-medium)" />
      </button>
      <span style={vStyles.title}>Customer ID</span>
      <MetaSeparator />
      <MetaLabel>Interaction ID</MetaLabel>
      <MetaSeparator />
      <MonogramSm initials={row.agent?.initials || "—"} />
      <MetaSeparator />
      <MetaLabel>{dateLabel}</MetaLabel>
      <MetaSeparator />
      <MetaLabel>{durationLabel}</MetaLabel>
      <MetaSeparator />
      <span style={vStyles.metaIconText}>
        <Mail size={14} color="var(--color-icon-tertiary-fg)" />
        <MetaLabel>Outbound</MetaLabel>
      </span>
      <div style={{ flex: 1 }} />
      <button type="button" style={vStyles.langPill}>
        <Globe size={14} color="var(--color-icon-tertiary-fg)" />
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-medium)" }}>Es</span>
      </button>
      <Button variant="icon" aria-label="View page info">
        <Info size={18} />
      </Button>
    </div>
  );
}

function MetaLabel({ children }) {
  return <span style={vStyles.metaLabel}>{children}</span>;
}

function MetaSeparator() {
  return <span aria-hidden="true" style={vStyles.metaDot} />;
}

function MonogramSm({ initials }) {
  return (
    <span style={vStyles.monogramSm}>
      {String(initials).slice(0, 1).toUpperCase()}
    </span>
  );
}

function EmailConversationsCard({ emails }) {
  return (
    <div style={vStyles.card}>
      <div style={vStyles.cardHeader}>
        <span style={vStyles.cardTitle}>Email Conversations</span>
      </div>
      <div style={vStyles.threadList}>
        {emails.map((email) => (
          <EmailItem key={email.id} email={email} />
        ))}
        <ThreadStartedDivider />
      </div>
    </div>
  );
}

function EmailItem({ email }) {
  const [expanded, setExpanded] = React.useState(email.expanded);
  const Chevron = expanded ? ChevronUp : ChevronDown;
  const isAgent = email.role === "agent";
  return (
    <div style={expanded ? vStyles.itemExpanded : vStyles.itemCollapsed}>
      <div style={vStyles.itemRow}>
        <RoleAvatar role={email.role} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={vStyles.itemTitleRow}>
            <span style={vStyles.itemSubject}>{email.subject}</span>
            <span style={vStyles.itemTime}>{email.time}</span>
          </div>
          <div style={vStyles.itemSubRow}>
            <span style={vStyles.itemTo}>To: {email.to}</span>
            <Info size={12} color="var(--color-text-tertiary)" />
          </div>
        </div>
        <button
          type="button"
          aria-label={expanded ? "Collapse email" : "Expand email"}
          onClick={() => setExpanded((v) => !v)}
          style={vStyles.itemChevronBtn}
        >
          <Chevron size={18} color="var(--color-text-deep)" />
        </button>
      </div>
      {expanded && email.body && (
        <div style={vStyles.itemBodyWrap}>
          <p style={vStyles.itemBody}>{email.body}</p>
          <button type="button" style={vStyles.seeMoreBtn}>See more</button>
        </div>
      )}
      {/* Tone hint dot is in the agent variant to mirror the figma purple
          avatar. Other items rely on RoleAvatar alone. */}
      {isAgent && expanded && <div style={{ height: 4 }} />}
    </div>
  );
}

function RoleAvatar({ role }) {
  const isAgent = role === "agent";
  const bg = isAgent ? "var(--color-card-emoji-bg)" : "#FFFBEB";
  const fg = isAgent ? "var(--color-icon-tertiary-fg)" : "#F59E0B";
  return (
    <span style={{ ...vStyles.avatar, background: bg }}>
      {isAgent ? <Headphones size={20} color={fg} /> : <User size={20} color={fg} />}
    </span>
  );
}

function ThreadStartedDivider() {
  return (
    <div style={vStyles.threadStartedRow}>
      <span style={vStyles.threadLine} />
      <span style={vStyles.threadStartedText}>Thread Started</span>
      <span style={vStyles.threadLine} />
    </div>
  );
}

function InsightsPanel({ tabs, activeTab, onTabChange, rows }) {
  return (
    <div style={vStyles.card}>
      <div style={vStyles.tabsBar}>
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={t === activeTab}
            onClick={() => onTabChange(t)}
            style={t === activeTab ? vStyles.tabActive : vStyles.tabInactive}
          >
            {t}
            {t === activeTab && <span style={vStyles.tabIndicator} />}
          </button>
        ))}
      </div>
      <div style={vStyles.tabBody}>
        {activeTab === "Insights" ? (
          <ul style={vStyles.insightList}>
            {rows.map((r) => (
              <InsightRow key={r.id} row={r} />
            ))}
          </ul>
        ) : (
          <div style={vStyles.tabEmpty}>No {activeTab.toLowerCase()} data yet.</div>
        )}
      </div>
    </div>
  );
}

function InsightRow({ row }) {
  const { label, Icon, chip } = row;
  return (
    <li style={vStyles.insightRow}>
      <span style={vStyles.insightLabelGroup}>
        <Icon size={16} color="var(--color-icon-tertiary-fg)" />
        <span style={vStyles.insightLabel}>{label}</span>
      </span>
      <span style={vStyles.insightTrailGroup}>
        {chip && <ToneChip tone={chip.tone}>{chip.text}</ToneChip>}
        <ChevronRight size={16} color="var(--color-text-tertiary)" />
      </span>
    </li>
  );
}

// Tone chip — limited to amber and green for now (the only tones in this
// view). If a 3rd tone joins, lift into a shared Chip primitive.
function ToneChip({ tone, children }) {
  const palette = TONE_PALETTE[tone] || TONE_PALETTE.amber;
  return (
    <span style={{ ...vStyles.chipBase, background: palette.bg, color: palette.fg }}>
      {children}
    </span>
  );
}

const TONE_PALETTE = {
  amber: { bg: "#FFF7E8", fg: "#72768B" },
  green: { bg: "#E6FAEB", fg: "#1F8C45" },
};

function formatDateLabel(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatDurationShort({ h = 0, m = 0, s = 0 } = {}) {
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

const vStyles = {
  shell: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    width: "100%",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "8px 16px",
    minHeight: 56,
    background: "var(--surface-white)",
    border: "2px solid var(--surface-white)",
    borderRadius: 12,
    fontFamily: "var(--font-sans)",
  },
  backBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    background: "var(--surface-white)",
    border: "1px solid var(--color-divider-card)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
  },
  title: {
    fontFamily: '"Poppins", sans-serif',
    fontSize: 16,
    fontWeight: 600,
    color: "var(--color-text-deep)",
    whiteSpace: "nowrap",
  },
  metaLabel: {
    fontSize: 13,
    color: "var(--color-text-medium)",
    fontWeight: 500,
    whiteSpace: "nowrap",
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: "50%",
    background: "#8C90A6",
    display: "inline-block",
    flexShrink: 0,
  },
  metaIconText: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  },
  monogramSm: {
    width: 18,
    height: 18,
    borderRadius: "50%",
    background: "var(--color-card-emoji-bg)",
    color: "var(--color-icon-tertiary-fg)",
    fontSize: 11,
    fontWeight: 700,
    fontFamily: "var(--font-sans)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
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
  grid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(0, 480px)",
    gap: 16,
    alignItems: "start",
  },
  card: {
    background: "var(--surface-white)",
    border: "4px solid var(--surface-white)",
    borderRadius: 12,
    overflow: "hidden",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    paddingInline: 20,
    height: 56,
    borderBottom: "1px solid var(--color-divider-card)",
  },
  cardTitle: {
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
  itemExpanded: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    border: "1px solid var(--color-border-tab)",
    borderRadius: 12,
    padding: "16px 20px",
    background: "var(--surface-white)",
  },
  itemCollapsed: {
    display: "flex",
    flexDirection: "column",
    border: "1px solid var(--color-border-tab)",
    borderRadius: 12,
    padding: "16px 20px",
    background: "var(--surface-white)",
  },
  itemRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 999,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  itemTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    minWidth: 0,
  },
  itemSubject: {
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
  itemTime: {
    fontSize: 12,
    color: "var(--color-text-tertiary)",
    whiteSpace: "nowrap",
    letterSpacing: "0.4px",
  },
  itemSubRow: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  itemTo: {
    fontSize: 12,
    color: "var(--color-text-medium)",
    letterSpacing: "0.4px",
  },
  itemChevronBtn: {
    width: 24,
    height: 24,
    borderRadius: 999,
    background: "transparent",
    border: "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
  },
  itemBodyWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    paddingLeft: 56,
  },
  itemBody: {
    margin: 0,
    fontSize: 12,
    lineHeight: "18px",
    color: "var(--color-text-medium)",
    letterSpacing: "0.4px",
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 12,
    overflow: "hidden",
  },
  seeMoreBtn: {
    alignSelf: "flex-start",
    background: "transparent",
    border: "none",
    padding: 0,
    color: "var(--color-button-primary-bg)",
    fontSize: 12,
    cursor: "pointer",
    letterSpacing: "0.4px",
  },
  threadStartedRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    paddingInline: 20,
    marginTop: 4,
  },
  threadLine: {
    flex: 1,
    height: 1,
    background: "var(--color-divider-card)",
  },
  threadStartedText: {
    fontSize: 12,
    color: "var(--color-text-tertiary)",
    letterSpacing: "0.4px",
  },
  tabsBar: {
    display: "flex",
    gap: 32,
    paddingInline: 32,
    borderBottom: "1px solid var(--color-divider-card)",
    height: 48,
    alignItems: "flex-end",
  },
  tabActive: {
    position: "relative",
    background: "transparent",
    border: "none",
    padding: 0,
    paddingBlock: 12,
    fontFamily: '"Poppins", sans-serif',
    fontSize: 14,
    fontWeight: 600,
    color: "var(--color-button-primary-bg)",
    cursor: "pointer",
    letterSpacing: "0.1px",
  },
  tabInactive: {
    background: "transparent",
    border: "none",
    padding: 0,
    paddingBlock: 12,
    fontFamily: '"Poppins", sans-serif',
    fontSize: 14,
    fontWeight: 400,
    color: "var(--color-text-medium)",
    cursor: "pointer",
    letterSpacing: "0.25px",
  },
  tabIndicator: {
    position: "absolute",
    left: -2,
    right: -2,
    bottom: 0,
    height: 3,
    borderRadius: "100px 100px 0 0",
    background: "var(--color-button-primary-bg)",
  },
  tabBody: {
    padding: "8px 0",
  },
  tabEmpty: {
    padding: "32px 20px",
    color: "var(--color-text-tertiary)",
    fontSize: 13,
    textAlign: "center",
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
    paddingInline: 20,
    height: 56,
    borderBottom: "1px solid var(--color-divider-card)",
    cursor: "pointer",
  },
  insightLabelGroup: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    minWidth: 0,
    flex: 1,
  },
  insightLabel: {
    fontSize: 14,
    color: "var(--color-text-deep)",
    fontFamily: "var(--font-sans)",
    letterSpacing: "0.25px",
  },
  insightTrailGroup: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  chipBase: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80,
    paddingInline: 8,
    paddingBlock: 2,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 500,
    letterSpacing: "0.5px",
    fontFamily: '"Poppins", sans-serif',
  },
};
