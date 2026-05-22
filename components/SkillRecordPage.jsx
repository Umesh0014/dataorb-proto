"use client";

import React from "react";
import {
  ArrowLeft,
  ArrowRight,
  Play,
  Info,
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  MinusCircle,
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
import StatCard from "./StatCard";
import MonthlyRunsChart from "./MonthlyRunsChart";
import { getSkillRecord } from "./mocks/skills";
import { formatDate } from "./formatDate";

// SkillRecordPage — Ask Mira Pro skill record view. Static reference page
// for a single skill: what it does, its inputs, and how it has been used.
// Reference-only — the single action is Run Skill (kicks off Create Task,
// out of scope here). Renders inside the PageLayout from app/page.jsx.

const INPUTS_PAGE_SIZE = 4;
const USERS_PAGE_SIZE = 4;
const STALE_MS = 30 * 24 * 60 * 60 * 1000;

// lucide-react icon name → component (skills carry the name as a string).
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

// Deterministic avatar palette — mirrors the inline pattern in MissionsPage.
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
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("");
}

// isStale — true when a run date is more than 30 days behind today.
function isStale(iso) {
  return Date.now() - new Date(iso).getTime() > STALE_MS;
}

export default function SkillRecordPage({ skillId, onBack }) {
  const rec = getSkillRecord(skillId);
  const Icon = ICON_MAP[rec.icon] || Target;
  const tint = TINT[rec.tint] || TINT.purple;

  React.useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const previous = document.title;
    document.title = `${rec.name} — Ask Mira Pro`;
    return () => {
      document.title = previous;
    };
  }, [rec.name]);

  return (
    <div style={s.page}>
      <Card padX={20} padY={16} tone="default">
        <div style={s.headerBar}>
          <Button variant="icon" size="sm" aria-label="Back to Skills" onClick={onBack}>
            <ArrowLeft size={20} color="var(--color-text-medium)" />
          </Button>
          <span style={{ ...s.headerIcon, color: tint.glyph }}>
            <Icon size={18} />
          </span>
          <span style={s.headerName}>{rec.name}</span>
          <span style={s.headerInfo} title={rec.description}>
            <Info size={18} color="var(--color-text-tertiary)" />
          </span>
          <div style={s.headerCta}>
            <Button
              variant="primary"
              leadingIcon={<Play size={16} fill="currentColor" />}
              onClick={() => console.log("run skill")}
            >
              Run Skill
            </Button>
          </div>
        </div>
      </Card>

      <div style={s.grid}>
        <aside style={s.col}>
          <AboutCard rec={rec} Icon={Icon} tint={tint} />
          <TemplateCard rec={rec} />
        </aside>
        <section style={s.col}>
          <InputsSection inputs={rec.inputs} />
          <EngagementSummary engagement={rec.engagement} />
          <MonthlyRunsCard data={rec.monthlyRuns} />
          <RunsByUserTable rows={rec.runsByUser} />
        </section>
      </div>
    </div>
  );
}

// ---- Left column ---------------------------------------------------------

function AboutCard({ rec, Icon, tint }) {
  return (
    <Card padX={24} padY={24} tone="default" style={s.aboutCard}>
      <div style={s.aboutHead}>
        <span style={s.sectionTitle}>About</span>
        <p style={s.aboutDesc}>{rec.description}</p>
      </div>
      <div style={s.divider} />
      <div style={s.metaStack}>
        <MetaBlock label="Created By">
          <div style={s.metaRow}>
            <Avatar name={rec.createdBy.name} />
            <span style={s.metaName}>{rec.createdBy.name}</span>
            <span style={s.metaDot}>·</span>
            <span style={s.metaDate}>{formatDate(rec.createdBy.date)}</span>
          </div>
        </MetaBlock>
        <MetaBlock label="Category">
          <div style={s.metaRow}>
            <span style={{ ...s.metaCatIcon, color: tint.glyph }}>
              <Icon size={16} />
            </span>
            <span style={s.metaName}>{rec.category}</span>
          </div>
        </MetaBlock>
        <MetaBlock label="Runs">
          <span style={s.metaRuns}>{rec.runs.toLocaleString()}</span>
        </MetaBlock>
        <MetaBlock label="Last Updated">
          <div style={s.metaRow}>
            <Avatar name={rec.lastUpdatedBy.name} />
            <span style={s.metaDate}>{formatDate(rec.lastUpdatedBy.date)}</span>
          </div>
        </MetaBlock>
      </div>
    </Card>
  );
}

function MetaBlock({ label, children }) {
  return (
    <div>
      <div style={s.metaLabel}>{label}</div>
      {children}
    </div>
  );
}

function TemplateCard({ rec }) {
  return (
    <Card padX={20} padY={16} tone="outline" style={s.templateCard}>
      <div
        style={s.tplTop}
        role="button"
        tabIndex={0}
        onClick={() => console.log("open template")}
      >
        <FileText size={18} color="var(--color-text-medium)" />
        <span style={s.tplName}>{rec.template.name}</span>
        <span style={s.flexSpacer} />
        <ExternalLink size={16} color="var(--color-text-tertiary)" />
      </div>
      <InertDropdown value={rec.template.version} ariaLabel="Template version" />
      <span style={s.tplCaption}>Updated: {formatDate(rec.template.updated)}</span>
    </Card>
  );
}

// ---- Right column --------------------------------------------------------

function InputsSection({ inputs }) {
  const [page, setPage] = React.useState(1);
  const totalPages = Math.max(1, Math.ceil(inputs.length / INPUTS_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = inputs.slice((safePage - 1) * INPUTS_PAGE_SIZE, safePage * INPUTS_PAGE_SIZE);
  const goToPage = (next) => setPage(Math.min(Math.max(1, next), totalPages));

  return (
    <Card padX={24} padY={20} tone="default" style={s.sectionCard}>
      <span style={s.sectionTitle}>Inputs</span>
      <div>
        <table style={s.table}>
          <colgroup>
            <col style={{ width: 48 }} />
            <col style={{ width: "30%" }} />
            <col />
          </colgroup>
          <thead>
            <tr style={s.headRow}>
              <th style={s.th} scope="col" aria-label="Status" />
              <th style={s.th} scope="col">Name</th>
              <th style={s.th} scope="col">Description</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, i) => (
              <InputRow key={row.name} row={row} isLast={i === pageRows.length - 1} />
            ))}
          </tbody>
        </table>
        <TableFooter
          total={inputs.length}
          noun="Inputs"
          safePage={safePage}
          totalPages={totalPages}
          goToPage={goToPage}
        />
      </div>
    </Card>
  );
}

function InputRow({ row, isLast }) {
  const [hover, setHover] = React.useState(false);
  const required = row.status === "required";
  return (
    <tr
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...s.row,
        borderBottom: isLast ? "none" : "1px solid var(--table-row-border)",
        background: hover ? "var(--table-row-hover)" : "transparent",
      }}
    >
      <td style={s.statusCell}>
        <span style={s.statusIcon}>
          {required ? (
            <CheckCircle
              size={18}
              color="var(--color-success)"
              fill="var(--color-success-bg)"
              aria-label="Required"
            />
          ) : (
            <MinusCircle
              size={18}
              color="var(--color-text-tertiary)"
              aria-label="Optional"
            />
          )}
        </span>
      </td>
      <td style={s.cell}>
        <span style={s.inputName}>{row.name}</span>
      </td>
      <td style={s.cell}>
        <span style={s.inputDesc}>{row.description}</span>
      </td>
    </tr>
  );
}

function EngagementSummary({ engagement }) {
  return (
    <Card padX={24} padY={20} tone="default" style={s.sectionCard}>
      <span style={s.sectionTitle}>Engagement Summary</span>
      <div style={s.statRow}>
        <StatCard
          size="md"
          labelStyle="uppercase"
          label="Total Runs"
          value={engagement.totalRuns.toLocaleString()}
          sublabel="All time"
        />
        <StatCard
          size="md"
          labelStyle="uppercase"
          label="Avg / Month"
          value={String(engagement.avgPerMonth)}
          sublabel="Last 12 months"
        />
        <StatCard
          size="md"
          labelStyle="uppercase"
          label="Active Users"
          value={String(engagement.activeUsers)}
          sublabel="Last 30 days"
        />
        <StatCard
          size="md"
          labelStyle="uppercase"
          label="Last Run"
          value={engagement.lastRun.text}
          sublabel={engagement.lastRun.user}
        />
      </div>
    </Card>
  );
}

function MonthlyRunsCard({ data }) {
  return (
    <Card padX={24} padY={20} tone="default" style={s.sectionCard}>
      <div style={s.sectionHeadRow}>
        <span style={s.sectionTitle}>Monthly Runs</span>
        <span style={s.flexSpacer} />
        <InertDropdown label="Date" value="Last 12 months" ariaLabel="Chart date range" />
      </div>
      <MonthlyRunsChart data={data} />
      <button type="button" style={s.chartCaption} onClick={() => {}}>
        Last 12 Months
        <ArrowRight size={14} />
      </button>
    </Card>
  );
}

function RunsByUserTable({ rows }) {
  const [page, setPage] = React.useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / USERS_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = rows.slice((safePage - 1) * USERS_PAGE_SIZE, safePage * USERS_PAGE_SIZE);
  const goToPage = (next) => setPage(Math.min(Math.max(1, next), totalPages));

  return (
    <Card padX={24} padY={20} tone="default" style={s.sectionCard}>
      <div style={s.sectionHeadRow}>
        <span style={s.sectionTitle}>Runs By User</span>
        <span style={s.flexSpacer} />
        <InertDropdown label="Date" value="Last 12 months" ariaLabel="Table date range" />
      </div>
      <div>
        <table style={s.table}>
          <colgroup>
            <col style={{ width: "36%" }} />
            <col style={{ width: "24%" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: "26%" }} />
          </colgroup>
          <thead>
            <tr style={s.headRow}>
              <th style={s.th} scope="col">Users</th>
              <th style={s.th} scope="col">Role</th>
              <th style={s.th} scope="col">Runs</th>
              <th style={s.th} scope="col">Last Run</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, i) => (
              <UserRow key={row.name} row={row} isLast={i === pageRows.length - 1} />
            ))}
          </tbody>
        </table>
        <TableFooter
          total={rows.length}
          noun="Runs"
          safePage={safePage}
          totalPages={totalPages}
          goToPage={goToPage}
        />
      </div>
    </Card>
  );
}

function UserRow({ row, isLast }) {
  const [hover, setHover] = React.useState(false);
  const stale = isStale(row.lastRun);
  return (
    <tr
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...s.row,
        borderBottom: isLast ? "none" : "1px solid var(--table-row-border)",
        background: hover ? "var(--table-row-hover)" : "transparent",
      }}
    >
      <td style={s.cell}>
        <span style={s.userCell}>
          <Avatar name={row.name} />
          <span style={s.userName}>{row.name}</span>
        </span>
      </td>
      <td style={s.cell}>
        <span style={s.roleText}>{row.role}</span>
      </td>
      <td style={s.cell}>
        <span style={s.runsText}>{row.runs}</span>
      </td>
      <td style={s.cell}>
        <span
          style={{
            ...s.dateText,
            color: stale ? "var(--color-error)" : "var(--color-text-tertiary)",
          }}
          title={stale ? "Last run more than 30 days ago" : undefined}
        >
          {formatDate(row.lastRun)}
        </span>
      </td>
    </tr>
  );
}

// ---- Shared bits ---------------------------------------------------------

function Avatar({ name }) {
  return (
    <span aria-hidden="true" style={{ ...s.avatar, background: avatarColor(name) }}>
      {initialsOf(name)}
    </span>
  );
}

// InertDropdown — styled-but-inert dropdown trigger. The version selector
// and the two date-range pickers are no-ops in V1 (spec Q-template / Q8).
function InertDropdown({ label, value, ariaLabel }) {
  return (
    <button type="button" style={s.dropdown} aria-label={ariaLabel} onClick={() => {}}>
      {label && <span style={s.dropdownLabel}>{label}</span>}
      <span style={s.dropdownValue}>{value}</span>
      <ChevronDown size={14} color="var(--color-text-medium)" />
    </button>
  );
}

function TableFooter({ total, noun, safePage, totalPages, goToPage }) {
  return (
    <div style={s.footer}>
      <span style={s.footerTotal}>
        Total {total} {noun}
      </span>
      <div style={s.footerCtrls}>
        <PageBtn ariaLabel="First page" disabled={safePage <= 1} onClick={() => goToPage(1)}>
          <ChevronsLeft size={16} />
        </PageBtn>
        <span style={s.pageLabel} aria-live="polite">
          Page {safePage} of {totalPages}
        </span>
        <PageBtn ariaLabel="Previous page" disabled={safePage <= 1} onClick={() => goToPage(safePage - 1)}>
          <ChevronLeft size={16} />
        </PageBtn>
        <PageBtn ariaLabel="Next page" disabled={safePage >= totalPages} onClick={() => goToPage(safePage + 1)}>
          <ChevronRight size={16} />
        </PageBtn>
      </div>
    </div>
  );
}

function PageBtn({ children, onClick, disabled, ariaLabel }) {
  return (
    <Button variant="icon" size="sm" aria-label={ariaLabel} disabled={disabled} onClick={onClick}>
      {children}
    </Button>
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
    display: "flex",
    alignItems: "center",
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 999,
    background: "var(--color-card-emoji-bg)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    flexShrink: 0,
  },
  headerName: {
    marginLeft: 8,
    minWidth: 0,
    fontSize: 20,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    lineHeight: 1.4,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  headerInfo: {
    marginLeft: 4,
    display: "inline-flex",
    alignItems: "center",
    cursor: "default",
    flexShrink: 0,
  },
  headerCta: {
    marginLeft: "auto",
    paddingLeft: 12,
    flexShrink: 0,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "340px 1fr",
    gap: "var(--page-card-gap)",
    alignItems: "start",
  },
  col: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--page-card-gap)",
  },
  flexSpacer: { flex: 1 },

  aboutCard: { display: "flex", flexDirection: "column", gap: 16 },
  aboutHead: { display: "flex", flexDirection: "column", gap: 8 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    lineHeight: 1.4,
  },
  aboutDesc: {
    margin: 0,
    fontSize: 14,
    fontWeight: 400,
    color: "var(--color-text-medium)",
    lineHeight: 1.6,
  },
  divider: { height: 1, background: "var(--color-divider-card)" },
  metaStack: { display: "flex", flexDirection: "column", gap: 16 },
  metaLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "var(--color-text-tertiary)",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  metaRow: { display: "flex", alignItems: "center", gap: 8 },
  metaName: { fontSize: 14, fontWeight: 500, color: "var(--color-text-deep)" },
  metaDot: { fontSize: 14, color: "var(--color-text-tertiary)" },
  metaDate: { fontSize: 13, fontWeight: 400, color: "var(--color-text-tertiary)" },
  metaRuns: { fontSize: 18, fontWeight: 700, color: "var(--color-text-deep)" },
  metaCatIcon: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  templateCard: { display: "flex", flexDirection: "column", gap: 8 },
  tplTop: { display: "flex", alignItems: "center", gap: 8, cursor: "pointer" },
  tplName: { fontSize: 14, fontWeight: 600, color: "var(--color-text-deep)" },
  tplCaption: { fontSize: 12, fontWeight: 400, color: "var(--color-text-tertiary)" },

  dropdown: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    background: "transparent",
    border: "1px solid var(--color-divider-card)",
    borderRadius: 8,
    padding: "6px 10px",
    cursor: "pointer",
    fontFamily: "var(--font-sans)",
    alignSelf: "flex-start",
  },
  dropdownLabel: { fontSize: 13, fontWeight: 400, color: "var(--color-text-tertiary)" },
  dropdownValue: { fontSize: 13, fontWeight: 500, color: "var(--color-text-deep)" },

  sectionCard: { display: "flex", flexDirection: "column", gap: 16 },
  sectionHeadRow: { display: "flex", alignItems: "center" },
  statRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    tableLayout: "fixed",
    fontFamily: "var(--font-sans)",
  },
  headRow: { borderBottom: "1px solid var(--table-header-border)" },
  th: {
    padding: "12px 0",
    textAlign: "left",
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text-medium)",
    whiteSpace: "nowrap",
  },
  row: { height: 52, transition: "background 120ms ease" },
  cell: { padding: "0 16px 0 0", verticalAlign: "middle" },
  statusCell: { padding: 0, verticalAlign: "middle" },
  statusIcon: { display: "flex", alignItems: "center", justifyContent: "center" },
  inputName: { fontSize: 14, fontWeight: 500, color: "var(--color-text-deep)" },
  inputDesc: { fontSize: 14, fontWeight: 400, color: "var(--color-text-tertiary)" },

  userCell: { display: "inline-flex", alignItems: "center", gap: 8 },
  userName: { fontSize: 14, fontWeight: 500, color: "var(--color-text-deep)" },
  roleText: { fontSize: 14, fontWeight: 400, color: "var(--color-text-medium)" },
  runsText: { fontSize: 14, fontWeight: 500, color: "var(--color-text-deep)" },
  dateText: { fontSize: 14, fontWeight: 400 },

  avatar: {
    width: 24,
    height: 24,
    borderRadius: 999,
    color: "var(--surface-white)",
    display: "grid",
    placeItems: "center",
    fontSize: 10,
    fontWeight: 700,
    flexShrink: 0,
    textTransform: "uppercase",
  },

  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 0 0",
    borderTop: "1px solid var(--table-header-border)",
  },
  footerTotal: { fontSize: 13, fontWeight: 500, color: "var(--color-text-tertiary)" },
  footerCtrls: { display: "flex", alignItems: "center", gap: 8 },
  pageLabel: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--do-ink)",
    padding: "0 4px",
  },

  chartCaption: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    background: "transparent",
    border: "none",
    padding: 0,
    cursor: "pointer",
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    fontWeight: 500,
    color: "var(--color-text-medium)",
  },
};
