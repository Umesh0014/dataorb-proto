"use client";

import React from "react";
import {
  ArrowLeft,
  Download,
  ArrowUp,
  ArrowDown,
  Minus,
  ChevronDown,
  ChevronUp,
  Info,
  Pencil,
  Target,
  BadgeCheck,
  Gauge,
  RefreshCw,
  Headset,
  Tag,
  AlertTriangle,
} from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import MultiLineInput from "./MultiLineInput";
import { getCoachingBrief } from "./mocks/coachingBrief";
import { formatDateTime } from "./formatDate";

// TaskRecordPage — the AI-generated artifact behind a task (here a
// Coaching Brief). Built as a section-driven, schema-versioned template:
// each section in the brief data carries a `type` + `schemaVersion`, and
// SECTION_RENDERERS dispatches it to a self-contained section component.
// A future v2 schema adds a renderer without touching v1 sections.
// Renders inside the PageLayout from app/page.jsx.

// Edits attribute to the team lead viewing the brief.
const CURRENT_USER = "Javier Ruiz";

// lucide-react icon name → component (skill metadata carries the name).
const ICON_MAP = { Target, BadgeCheck, Gauge, RefreshCw, Headset, Tag, AlertTriangle };

// Category tint → { bg, glyph } token pair — same mapping as SkillsPage.
const TINT = {
  purple: { bg: "var(--color-icon-tertiary-bg)", glyph: "var(--color-icon-tertiary-fg)" },
  green: { bg: "var(--color-success-bg)", glyph: "var(--color-success)" },
  teal: { bg: "var(--color-info-bg)", glyph: "var(--color-info)" },
  pink: { bg: "var(--color-error-bg)", glyph: "var(--color-secondary-500)" },
  orange: { bg: "var(--color-warning-bg)", glyph: "var(--color-warning)" },
  red: { bg: "var(--color-error-bg)", glyph: "var(--color-error)" },
};

// Trend tone → colour + arrow. Semantic, not literal: a worsening metric
// is "negative" (down arrow) even if its raw number rose.
const TREND = {
  positive: { color: "var(--color-success)", Icon: ArrowUp },
  negative: { color: "var(--color-error)", Icon: ArrowDown },
  neutral: { color: "var(--color-text-tertiary)", Icon: Minus },
};

// Pill tabs → the section each one anchor-scrolls to. Adherence has no
// pill; it reads as part of the Overview span while scrolling.
const SECTION_TABS = [
  { id: "overview", label: "Overview", section: "overview" },
  { id: "focus-areas", label: "Focus Areas", section: "focus-area" },
  { id: "actions", label: "Coaching Actions", section: "coaching-actions" },
];

const AVATAR_PALETTE = [
  "#E3867F", "#F0B775", "#8DC99E", "#7CB0D6",
  "#C59BD8", "#6DC6B9", "#E88FA2", "#A7AAD1",
];
function avatarColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i += 1) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length];
}

function initialsOf(name) {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

// scoreColor — QA-score threshold colouring (confirm thresholds w/ Akash).
function scoreColor(score) {
  if (score >= 80) return "var(--color-success)";
  if (score >= 60) return "var(--color-warning)";
  return "var(--color-error)";
}

// ---- Shared bits ---------------------------------------------------------

function Avatar({ name, size = 20 }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        background: avatarColor(name),
        color: "var(--surface-white)",
        display: "grid",
        placeItems: "center",
        fontSize: size <= 20 ? 9 : 11,
        fontWeight: 700,
        flexShrink: 0,
        textTransform: "uppercase",
      }}
    >
      {initialsOf(name)}
    </span>
  );
}

function SkillChip({ skill }) {
  const Icon = ICON_MAP[skill.iconName] || Target;
  const tint = TINT[skill.tint] || TINT.purple;
  return (
    <span style={s.skillChip}>
      <span style={{ ...s.skillChipIcon, background: tint.bg, color: tint.glyph }}>
        <Icon size={16} />
      </span>
      <span style={s.skillChipLabel}>{skill.category}</span>
    </span>
  );
}

// EditableNarrative — AI-generated prose or bullet list the user owns
// (design principle #7). View mode shows the text + an Edit Narrative
// affordance; edit mode swaps in a MultiLineInput with Save / Cancel.
function EditableNarrative({ value, variant = "prose", label, accent, onSave }) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value);
  const [linkHover, setLinkHover] = React.useState(false);

  const begin = () => {
    setDraft(value);
    setEditing(true);
  };
  const cancel = () => setEditing(false);
  const commit = () => {
    setEditing(false);
    onSave(draft);
  };

  const bullets = value.split("\n").map((l) => l.trim()).filter(Boolean);
  const paragraphs = value.split("\n\n").map((p) => p.trim()).filter(Boolean);

  return (
    <div style={s.editable}>
      <div style={s.editableHead}>
        {label && (
          <span style={{ ...s.editableLabel, color: accent || "var(--color-text-tertiary)" }}>
            {label}
          </span>
        )}
        <span style={s.flexSpacer} />
        {!editing && (
          <button
            type="button"
            style={{
              ...s.editLink,
              color: linkHover ? "var(--color-button-primary-bg)" : "var(--color-text-medium)",
            }}
            onMouseEnter={() => setLinkHover(true)}
            onMouseLeave={() => setLinkHover(false)}
            onClick={begin}
          >
            <Pencil size={14} />
            <span>Edit Narrative</span>
          </button>
        )}
      </div>

      {editing ? (
        <div style={s.editBody}>
          <MultiLineInput value={draft} onChange={setDraft} max={4000} rows={6} />
          <div style={s.editActions}>
            <Button variant="primary" onClick={commit}>Save</Button>
            <Button variant="text" uppercase={false} onClick={cancel}>Cancel</Button>
          </div>
        </div>
      ) : variant === "bullets" ? (
        <div style={s.bulletList}>
          {bullets.map((line, i) => (
            <div key={i} style={s.bulletItem}>
              <span style={{ ...s.bulletDot, color: accent || "var(--color-text-medium)" }}>•</span>
              <span style={s.bulletText}>{line}</span>
            </div>
          ))}
        </div>
      ) : (
        <div style={s.proseStack}>
          {paragraphs.map((para, i) => (
            <p key={i} style={s.prose}>{para}</p>
          ))}
        </div>
      )}
    </div>
  );
}

function PillTabs({ tabs, activeId, onPick }) {
  return (
    <div style={s.pillRow}>
      {tabs.map((tab) => {
        const active = tab.id === activeId;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onPick(tab.id)}
            style={{ ...s.pill, ...(active ? s.pillActive : s.pillInactive) }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function UpdatedBy({ name }) {
  return (
    <span style={s.updatedBy}>
      <span style={s.updatedByLabel}>Last Updated by:</span>
      <Avatar name={name} size={20} />
      <span style={s.updatedByName}>{name}</span>
      <button
        type="button"
        style={s.updatedByInfo}
        aria-label="View edit history"
        onClick={() => console.log("open activity log")}
      >
        <Info size={16} color="var(--color-text-tertiary)" />
      </button>
    </span>
  );
}

// ---- Section 1 — Overview ------------------------------------------------

function KpiTile({ kpi }) {
  const t = TREND[kpi.trend] || TREND.neutral;
  const TrendIcon = t.Icon;
  return (
    <div style={s.kpiTile}>
      <span style={s.kpiLabel}>{kpi.label}</span>
      <span style={s.kpiValue}>{kpi.value}</span>
      <span style={{ ...s.kpiTrend, color: t.color }}>
        <TrendIcon size={12} />
        {kpi.delta}
      </span>
    </div>
  );
}

function OverviewSection({ section }) {
  return (
    <Card padX={32} padY={28} tone="default" style={s.sectionCard}>
      <div style={s.sectionHeadRow}>
        <span style={s.sectionTitle}>Overview</span>
        <span style={s.flexSpacer} />
        <span style={s.generatedOn}>Generated on: {formatDateTime(section.generatedAt)}</span>
      </div>

      <div style={s.heroBlock}>
        <h2 style={s.heroHeading}>Weekly Coaching Brief — {section.agentName}</h2>
        <div style={s.metaRow}>
          <span style={s.metaItem}>
            <span style={s.metaLabel}>Period:</span>
            <span style={s.metaValue}>{section.period}</span>
          </span>
          <span style={s.metaSep}>·</span>
          <span style={s.metaItem}>
            <span style={s.metaLabel}>Brand:</span>
            <span style={s.metaValue}>{section.brand}</span>
          </span>
          <span style={s.metaSep}>·</span>
          <span style={s.metaItem}>
            <span style={s.metaLabel}>Service:</span>
            <span style={s.metaValue}>{section.service}</span>
          </span>
          <span style={s.metaSep}>·</span>
          <span style={s.metaItem}>
            <span style={s.metaLabel}>Team Lead:</span>
            <Avatar name={section.teamLead} size={20} />
            <span style={s.metaValue}>{section.teamLead}</span>
          </span>
        </div>
        <span style={s.sampleSize}>{section.sampleSize}</span>
      </div>

      <div style={s.kpiGrid}>
        {section.kpis.map((kpi) => (
          <KpiTile key={kpi.label} kpi={kpi} />
        ))}
      </div>
    </Card>
  );
}

// ---- Section 2 — Adherence -----------------------------------------------

function AdherenceSection({ section }) {
  const [execText, setExecText] = React.useState(section.execNarrative);
  const [closingText, setClosingText] = React.useState(section.closingNarrative);

  return (
    <Card padX={32} padY={28} tone="default" style={s.sectionCard}>
      <span style={s.sectionTitle}>Adherence</span>

      <EditableNarrative value={execText} variant="prose" onSave={setExecText} />

      <div>
        <div style={s.subHeading}>Focus Area Adherence vs. Benchmarks</div>
        <table style={s.table}>
          <colgroup>
            <col style={{ width: "36%" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: "18%" }} />
            <col style={{ width: "18%" }} />
          </colgroup>
          <thead>
            <tr style={s.headRow}>
              <th style={s.th} scope="col">Focus Area</th>
              <th style={s.th} scope="col">Agent Rate</th>
              <th style={s.th} scope="col">Org. Avg.</th>
              <th style={s.th} scope="col">Top Performer Avg.</th>
              <th style={s.th} scope="col">Vs. Org</th>
            </tr>
          </thead>
          <tbody>
            {section.benchmarks.map((row, i) => (
              <tr
                key={row.area}
                style={{
                  ...s.bRow,
                  borderBottom:
                    i === section.benchmarks.length - 1
                      ? "none"
                      : "1px solid var(--color-divider-card)",
                }}
              >
                <td style={s.bCell}><span style={s.bArea}>{row.area}</span></td>
                <td style={s.bCell}><span style={s.bAgent}>{row.agentRate}</span></td>
                <td style={s.bCell}><span style={s.bMuted}>{row.orgAvg}</span></td>
                <td style={s.bCell}><span style={s.bMuted}>{row.topAvg}</span></td>
                <td style={s.bCell}>
                  <span
                    style={{
                      ...s.bDelta,
                      color:
                        row.vsOrgTone === "negative"
                          ? "var(--color-error)"
                          : "var(--color-success)",
                    }}
                  >
                    {row.vsOrg}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EditableNarrative value={closingText} variant="prose" onSave={setClosingText} />

      <div style={s.chipRow}>
        <SourceChip label="SOURCE" value={section.source} />
        <SourceChip label="BENCHMARK" value={section.benchmark} />
      </div>
    </Card>
  );
}

function SourceChip({ label, value }) {
  return (
    <span style={s.sourceChip}>
      <span style={s.sourceChipLabel}>{label}:</span>
      <span style={s.sourceChipValue}>{value}</span>
    </span>
  );
}

// ---- Section 3 — Focus Area Analysis -------------------------------------

function FocusAreaSection({ section, agentName }) {
  const [lastUpdatedBy, setLastUpdatedBy] = React.useState(section.lastUpdatedBy);

  return (
    <Card padX={32} padY={28} tone="default" style={s.sectionCard}>
      <div style={s.sectionHeadRow}>
        <span style={s.sectionTitle}>Focus Area Analysis</span>
        <span style={s.flexSpacer} />
        <UpdatedBy name={lastUpdatedBy} />
      </div>
      <p style={s.sectionIntro}>{section.intro}</p>
      <div style={s.areaList}>
        {section.areas.map((area, i) => (
          <FocusAreaRow
            key={area.name}
            area={area}
            agentName={agentName}
            defaultExpanded={i === 0}
            isLast={i === section.areas.length - 1}
            onEdited={() => setLastUpdatedBy(CURRENT_USER)}
          />
        ))}
      </div>
    </Card>
  );
}

function StatusChip({ chip }) {
  const primary = chip.kind === "primary";
  return (
    <span
      style={{
        ...s.statusChip,
        background: primary ? "var(--color-error-bg)" : "var(--color-card-emoji-bg)",
        color: primary ? "var(--color-error)" : "var(--color-text-medium)",
      }}
    >
      {chip.label}
    </span>
  );
}

function FocusAreaRow({ area, agentName, defaultExpanded, isLast, onEdited }) {
  const [expanded, setExpanded] = React.useState(defaultExpanded);
  const Chevron = expanded ? ChevronUp : ChevronDown;
  return (
    <div
      style={{
        ...s.areaRow,
        borderBottom: isLast ? "none" : "1px solid var(--color-divider-card)",
      }}
    >
      <button
        type="button"
        style={s.areaHeader}
        aria-expanded={expanded}
        onClick={() => setExpanded((x) => !x)}
      >
        <span style={s.areaName}>{area.name}</span>
        <span style={s.flexSpacer} />
        <span style={{ ...s.areaScore, color: scoreColor(area.score) }}>{area.score}%</span>
        <StatusChip chip={area.statusChip} />
        <Chevron size={18} color="var(--color-text-medium)" style={{ flexShrink: 0 }} />
      </button>
      {expanded && (
        <div style={s.areaBody}>
          <InsightCard kind="positive" label="WHAT'S WORKING" data={area.whatsWorking} onEdited={onEdited} />
          <InsightCard
            kind="attention"
            label="WHERE TO FOCUS"
            data={area.whereToFocus}
            agentName={agentName}
            onEdited={onEdited}
          />
        </div>
      )}
    </div>
  );
}

// InsightCard — the What's Working (green) / Where to Focus (amber) card.
// Tint sits on this nested card, never on the section card.
function InsightCard({ kind, label, data, agentName, onEdited }) {
  const accent = kind === "positive" ? "var(--color-success)" : "var(--color-warning)";
  const bg = kind === "positive" ? "var(--color-success-bg)" : "var(--color-warning-bg)";
  const [bullets, setBullets] = React.useState((data && data.bullets) || "");

  if (data && data.empty) {
    return (
      <div style={{ ...s.insightCard, background: bg }}>
        <span style={{ ...s.insightLabel, color: accent }}>{label}</span>
        <p style={s.insightEmpty}>
          {`No coaching observations for this metric. ${agentName || "The agent"}'s `}
          compliance is exemplary and can be used as a reference model for team training.
        </p>
        <span style={s.sampleChip}>0 Coaching Flags This Period</span>
      </div>
    );
  }

  return (
    <div style={{ ...s.insightCard, background: bg }}>
      <EditableNarrative
        value={bullets}
        variant="bullets"
        label={label}
        accent={accent}
        onSave={(v) => {
          setBullets(v);
          onEdited();
        }}
      />
      {data && data.sample && <span style={s.sampleChip}>{data.sample}</span>}
    </div>
  );
}

// ---- Section 4 — Recommended Coaching Actions ----------------------------

function CoachingActionsSection({ section }) {
  const [lastUpdatedBy, setLastUpdatedBy] = React.useState(section.lastUpdatedBy);
  const [reinforcement, setReinforcement] = React.useState(section.reinforcementNarrative);
  const [closing, setClosing] = React.useState(section.closingNarrative);
  const markEdited = () => setLastUpdatedBy(CURRENT_USER);

  return (
    <Card padX={32} padY={28} tone="default" style={s.sectionCard}>
      <div style={s.sectionHeadRow}>
        <span style={s.sectionTitle}>Recommended Coaching Actions</span>
        <span style={s.flexSpacer} />
        <UpdatedBy name={lastUpdatedBy} />
      </div>

      <div style={{ ...s.insightCard, background: "var(--color-success-bg)" }}>
        <EditableNarrative
          value={reinforcement}
          variant="prose"
          label={`REINFORCEMENT: ${section.reinforcementSubject}`}
          accent="var(--color-success)"
          onSave={(v) => {
            setReinforcement(v);
            markEdited();
          }}
        />
      </div>

      <div style={s.actionList}>
        {section.actions.map((action, i) => (
          <ActionItem key={action.title} index={i + 1} action={action} />
        ))}
      </div>

      <EditableNarrative
        value={closing}
        variant="prose"
        onSave={(v) => {
          setClosing(v);
          markEdited();
        }}
      />
    </Card>
  );
}

function ActionItem({ index, action }) {
  return (
    <div style={s.actionItem}>
      <div style={s.actionTitleRow}>
        <span style={s.actionNumber}>{String(index).padStart(2, "0")}</span>
        <span style={s.actionTitle}>{action.title}</span>
      </div>
      <p style={s.actionDesc}>{action.description}</p>
      <div style={s.impactCallout}>
        <span style={s.impactText}>Expected Impact: {action.impact}</span>
      </div>
    </div>
  );
}

// ---- Section registry ----------------------------------------------------

const SECTION_RENDERERS = {
  overview: OverviewSection,
  adherence: AdherenceSection,
  "focus-area": FocusAreaSection,
  "coaching-actions": CoachingActionsSection,
};

export default function TaskRecordPage({ taskId, onBack }) {
  const brief = React.useMemo(() => getCoachingBrief(taskId), [taskId]);
  const [activeTab, setActiveTab] = React.useState("overview");

  React.useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const previous = document.title;
    document.title = `${brief.agentName} — Weekly Coaching Brief`;
    return () => {
      document.title = previous;
    };
  }, [brief.agentName]);

  // Scroll-spy — the section nearest the top sets the active pill.
  React.useEffect(() => {
    const els = SECTION_TABS.map((t) => document.getElementById(`brief-${t.section}`)).filter(
      Boolean,
    );
    if (!els.length) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (!visible.length) return;
        const sectionId = visible[0].target.id.replace("brief-", "");
        const tab = SECTION_TABS.find((t) => t.section === sectionId);
        if (tab) setActiveTab(tab.id);
      },
      { rootMargin: "-100px 0px -65% 0px", threshold: 0 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [brief]);

  const pickTab = (tabId) => {
    setActiveTab(tabId);
    const tab = SECTION_TABS.find((t) => t.id === tabId);
    const el = tab && document.getElementById(`brief-${tab.section}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div style={s.page}>
      <Card padX={20} padY={16} tone="default" shadow style={s.headerBar}>
        <div style={s.headerInner}>
          <Button variant="icon" size="sm" aria-label="Back to Tasks" onClick={onBack}>
            <ArrowLeft size={20} color="var(--color-text-medium)" />
          </Button>
          <span style={s.taskIdText}>{brief.taskId}</span>
          <span style={s.flexSpacer} />
          <SkillChip skill={brief.skill} />
          <Button
            variant="text"
            uppercase={false}
            leadingIcon={<Download size={16} />}
            onClick={() => console.log("download brief")}
          >
            Download
          </Button>
        </div>
      </Card>

      <PillTabs tabs={SECTION_TABS} activeId={activeTab} onPick={pickTab} />

      {brief.sections.map((section) => {
        const Renderer = SECTION_RENDERERS[section.type];
        if (!Renderer) return null;
        return (
          <div key={section.type} id={`brief-${section.type}`} style={s.sectionAnchor}>
            <Renderer section={section} agentName={brief.agentName} />
          </div>
        );
      })}
    </div>
  );
}

const s = {
  page: {
    flex: 1,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    gap: "var(--page-card-gap)",
    fontFamily: "var(--font-sans)",
  },
  headerBar: {
    position: "sticky",
    top: 0,
    zIndex: 10,
    flexShrink: 0,
  },
  headerInner: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  taskIdText: {
    fontSize: 18,
    fontWeight: 700,
    color: "var(--color-text-deep)",
  },
  flexSpacer: { flex: 1 },
  skillChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "var(--color-card-emoji-bg)",
    borderRadius: 999,
    padding: "4px 12px 4px 4px",
    flexShrink: 0,
  },
  skillChipIcon: {
    width: 24,
    height: 24,
    borderRadius: 999,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  skillChipLabel: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--color-text-deep)",
  },

  pillRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  pill: {
    padding: "8px 16px",
    borderRadius: 999,
    border: "none",
    cursor: "pointer",
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    fontWeight: 500,
  },
  pillActive: {
    background: "var(--color-secondary-500)",
    color: "var(--surface-white)",
  },
  pillInactive: {
    background: "transparent",
    color: "var(--color-text-medium)",
  },

  sectionAnchor: { scrollMarginTop: 90 },
  sectionCard: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  sectionHeadRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    lineHeight: 1.4,
  },
  generatedOn: {
    fontSize: 13,
    fontWeight: 400,
    color: "var(--color-text-tertiary)",
  },

  heroBlock: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  heroHeading: {
    margin: 0,
    fontSize: 22,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    lineHeight: 1.35,
  },
  metaRow: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  metaItem: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  },
  metaLabel: {
    fontSize: 13,
    fontWeight: 400,
    color: "var(--color-text-medium)",
  },
  metaValue: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text-deep)",
  },
  metaSep: {
    fontSize: 13,
    color: "var(--color-text-tertiary)",
  },
  sampleSize: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--color-text-deep)",
  },

  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 24,
  },
  kpiTile: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  kpiLabel: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--color-text-medium)",
  },
  kpiValue: {
    fontSize: 28,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    lineHeight: 1.2,
  },
  kpiTrend: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
    fontSize: 13,
    fontWeight: 500,
  },

  editable: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  editableHead: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    minHeight: 20,
  },
  editableLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  editLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    background: "transparent",
    border: "none",
    padding: 0,
    cursor: "pointer",
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 500,
  },
  editBody: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  editActions: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  proseStack: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    maxWidth: 720,
  },
  prose: {
    margin: 0,
    fontSize: 14,
    fontWeight: 400,
    color: "var(--color-text-medium)",
    lineHeight: 1.6,
  },
  bulletList: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    maxWidth: 720,
  },
  bulletItem: {
    display: "flex",
    gap: 8,
    alignItems: "flex-start",
  },
  bulletDot: {
    fontSize: 14,
    lineHeight: 1.55,
    flexShrink: 0,
  },
  bulletText: {
    fontSize: 14,
    fontWeight: 400,
    color: "var(--color-text-deep)",
    lineHeight: 1.55,
  },

  subHeading: {
    fontSize: 14,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    marginBottom: 16,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    tableLayout: "fixed",
    fontFamily: "var(--font-sans)",
  },
  headRow: {
    borderBottom: "1px solid var(--color-divider-card)",
  },
  th: {
    padding: "10px 12px 10px 0",
    textAlign: "left",
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text-medium)",
  },
  bRow: {},
  bCell: {
    padding: "14px 12px 14px 0",
    verticalAlign: "middle",
  },
  bArea: {
    fontSize: 14,
    fontWeight: 500,
    color: "var(--color-text-deep)",
  },
  bAgent: {
    fontSize: 14,
    fontWeight: 500,
    color: "var(--color-text-deep)",
  },
  bMuted: {
    fontSize: 14,
    fontWeight: 400,
    color: "var(--color-text-medium)",
  },
  bDelta: {
    fontSize: 14,
    fontWeight: 500,
  },

  chipRow: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },
  sourceChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
    background: "var(--color-card-emoji-bg)",
    borderRadius: 6,
    padding: "8px 12px",
  },
  sourceChipLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "var(--color-text-tertiary)",
  },
  sourceChipValue: {
    fontSize: 12,
    fontWeight: 500,
    color: "var(--color-text-medium)",
    fontFamily: "var(--font-mono)",
  },

  sectionIntro: {
    margin: 0,
    fontSize: 14,
    fontWeight: 400,
    color: "var(--color-text-medium)",
    lineHeight: 1.6,
    maxWidth: 720,
  },
  areaList: {
    display: "flex",
    flexDirection: "column",
  },
  areaRow: {
    display: "flex",
    flexDirection: "column",
  },
  areaHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "16px 0",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontFamily: "var(--font-sans)",
    textAlign: "left",
    width: "100%",
  },
  areaName: {
    fontSize: 15,
    fontWeight: 600,
    color: "var(--color-text-deep)",
  },
  areaScore: {
    fontSize: 14,
    fontWeight: 600,
    flexShrink: 0,
  },
  statusChip: {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 500,
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
  areaBody: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    paddingBottom: 20,
  },
  insightCard: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    padding: "20px 24px",
    borderRadius: 8,
  },
  insightLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  insightEmpty: {
    margin: 0,
    fontSize: 14,
    fontWeight: 400,
    color: "var(--color-text-medium)",
    lineHeight: 1.6,
    maxWidth: 720,
  },
  sampleChip: {
    alignSelf: "flex-start",
    background: "var(--surface-white)",
    borderRadius: 6,
    padding: "6px 10px",
    fontSize: 12,
    fontWeight: 500,
    color: "var(--color-text-medium)",
    fontFamily: "var(--font-mono)",
  },

  updatedBy: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
  },
  updatedByLabel: {
    fontSize: 12,
    fontWeight: 400,
    color: "var(--color-text-tertiary)",
  },
  updatedByName: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--color-text-medium)",
  },
  updatedByInfo: {
    display: "inline-flex",
    alignItems: "center",
    background: "transparent",
    border: "none",
    padding: 0,
    marginLeft: -2,
    cursor: "pointer",
  },

  actionList: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },
  actionItem: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  actionTitleRow: {
    display: "flex",
    gap: 12,
    alignItems: "baseline",
  },
  actionNumber: {
    fontSize: 14,
    fontWeight: 700,
    color: "var(--color-text-deep)",
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    lineHeight: 1.4,
  },
  actionDesc: {
    margin: 0,
    marginLeft: 28,
    fontSize: 14,
    fontWeight: 400,
    color: "var(--color-text-medium)",
    lineHeight: 1.6,
    maxWidth: 720,
  },
  impactCallout: {
    marginLeft: 28,
    borderLeft: "3px solid var(--color-secondary-500)",
    padding: "8px 12px",
    background: "var(--color-card-emoji-bg)",
  },
  impactText: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--color-text-medium)",
    fontFamily: "var(--font-mono)",
  },
};
