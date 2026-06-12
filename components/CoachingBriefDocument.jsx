"use client";

import React from "react";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  Presentation,
} from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import CoachingBriefEditable from "./CoachingBriefEditable";

/**
 * CoachingBriefDocument — Variant C.
 *
 * Reader-plus-inspector layout. The left pane is a narrative document
 * whose narratives are inline-editable; the right pane is a sticky
 * read-only data inspector (KPI strip · benchmarks summary · snapshot
 * fields · per-focus-area score cards). This makes the data-as-grounding
 * vs. narrative-as-user-owned split structural — INT-7 by construction —
 * and matches the prescribed sidecar pattern in UI-9.
 *
 * Focus areas render in the document as collapsible blocks (default
 * expanded for the primary-focus area, collapsed elsewhere) so the
 * reader can scan and drill in without losing context. The "Present"
 * affordance at the top right gestures at a future presentation mode
 * (out of scope, routed to Neil per G7).
 *
 * Props match the other variants — brief / edits / onEdit / onBack.
 */
export default function CoachingBriefDocument({ brief, edits, onEdit, onBack }) {
  const overview  = brief.sections.find((x) => x.type === "overview");
  const adherence = brief.sections.find((x) => x.type === "adherence");
  const focus     = brief.sections.find((x) => x.type === "focus-area");
  const actions   = brief.sections.find((x) => x.type === "coaching-actions");

  return (
    <div style={s.column}>
      <Header overview={overview} onBack={onBack} />

      <div style={s.body}>
        <Document
          overview={overview}
          adherence={adherence}
          focus={focus}
          actions={actions}
          edits={edits}
          onEdit={onEdit}
        />
        <Inspector
          overview={overview}
          adherence={adherence}
          focus={focus}
        />
      </div>
    </div>
  );
}

// ---- Header -----------------------------------------------------------

function Header({ overview, onBack }) {
  return (
    <Card padX={0} padY={0} style={s.headerCard}>
      <div style={s.headerInner}>
        <Button variant="icon" size="sm" onClick={onBack} aria-label="Back to Coaching">
          <ArrowLeft size={20} color="var(--color-text-medium)" />
        </Button>
        <span style={s.headerKind}>Coaching Brief</span>
        <Dot />
        <span style={s.headerAgent}>{overview.agentName}</span>
        <Dot />
        <span style={s.headerPeriod}>{overview.period}</span>
        <div style={{ flex: 1 }} />
        <Button
          variant="text"
          uppercase={false}
          leadingIcon={
            <Presentation size={16} color="var(--color-text-medium)" aria-hidden="true" />
          }
          aria-label="Present (coming soon)"
          disabled
        >
          Present
        </Button>
        <span style={s.statusPill}>v{overview.schemaVersion} · Auto-generated</span>
      </div>
    </Card>
  );
}

function Dot() {
  return <span style={s.headerDot} aria-hidden="true" />;
}

// ---- Document (left pane) --------------------------------------------

function Document({ overview, adherence, focus, actions, edits, onEdit }) {
  return (
    <main style={s.document}>
      <DocSection eyebrow="The week">
        <h1 style={s.hero}>{overview.agentName}</h1>
        <p style={s.heroSub}>
          {overview.period} · {overview.brand} · {overview.service}.
        </p>
        <p style={s.heroLede}>
          {overview.sampleSize}. Score values, benchmarks, and snapshot fields
          live in the inspector on the right; this column is the editable
          narrative layer.
        </p>
      </DocSection>

      <DocSection eyebrow="Adherence">
        <h2 style={s.h2}>How the week landed</h2>
        <CoachingBriefEditable
          value={edits["adherence.exec"] ?? adherence.execNarrative}
          onChange={(v) => onEdit("adherence.exec", v)}
          editor={adherence.lastUpdatedBy}
          label="adherence executive narrative"
        />
        <CoachingBriefEditable
          value={edits["adherence.closing"] ?? adherence.closingNarrative}
          onChange={(v) => onEdit("adherence.closing", v)}
          editor={adherence.lastUpdatedBy}
          label="adherence closing narrative"
        />
        <p style={s.sourceLine}>
          <span style={s.sourceKey}>Source</span> {adherence.source}
        </p>
      </DocSection>

      <DocSection eyebrow="Focus areas">
        <h2 style={s.h2}>Per-area read</h2>
        <p style={s.h2Lede}>{focus.intro}</p>
        <div style={s.areaList}>
          {focus.areas.map((area, i) => (
            <AreaBlock
              key={area.name}
              area={area}
              areaIdx={i}
              editor={focus.lastUpdatedBy}
              edits={edits}
              onEdit={onEdit}
            />
          ))}
        </div>
      </DocSection>

      <DocSection eyebrow="Coaching actions">
        <h2 style={s.h2}>This week's 1:1</h2>
        <div style={s.reinforceBlock}>
          <div style={s.reinforceLabelRow}>
            <Sparkles size={16} color="var(--color-icon-tertiary-fg)" aria-hidden="true" />
            <span style={s.reinforceLabel}>Reinforcement</span>
          </div>
          <CoachingBriefEditable
            value={edits["actions.subject"] ?? actions.reinforcementSubject}
            onChange={(v) => onEdit("actions.subject", v)}
            editor={actions.lastUpdatedBy}
            label="reinforcement subject"
            variant="headline"
          />
          <CoachingBriefEditable
            value={edits["actions.reinforcement"] ?? actions.reinforcementNarrative}
            onChange={(v) => onEdit("actions.reinforcement", v)}
            editor={actions.lastUpdatedBy}
            label="reinforcement narrative"
          />
        </div>

        <ol style={s.actionList}>
          {actions.actions.map((action, i) => (
            <li key={action.title} style={s.actionRow}>
              <span style={s.actionIdx}>{String(i + 1).padStart(2, "0")}</span>
              <div style={s.actionBody}>
                <h3 style={s.actionTitle}>{action.title}</h3>
                <p style={s.actionDesc}>{action.description}</p>
                <p style={s.actionImpact}>
                  <span style={s.actionImpactKey}>Expected impact</span>
                  {action.impact}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <CoachingBriefEditable
          value={edits["actions.closing"] ?? actions.closingNarrative}
          onChange={(v) => onEdit("actions.closing", v)}
          editor={actions.lastUpdatedBy}
          label="closing narrative"
        />
      </DocSection>
    </main>
  );
}

function DocSection({ eyebrow, children }) {
  return (
    <Card padX={28} padY={28} style={s.docCard}>
      <section style={s.section}>
        <span style={s.sectionEyebrow}>{eyebrow}</span>
        {children}
      </section>
    </Card>
  );
}

function AreaBlock({ area, areaIdx, editor, edits, onEdit }) {
  const isPrimary = area.statusChip?.kind === "primary";
  const [open, setOpen] = React.useState(isPrimary);
  const band = scoreBand(area.score);
  const hasFocus = !area.whereToFocus?.empty;
  const accent = isPrimary
    ? "var(--color-button-primary-bg)"
    : "var(--color-divider-card)";

  return (
    <div style={{ ...s.area, borderInlineStartColor: accent }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={`area-${areaIdx}`}
        style={s.areaHead}
      >
        <div style={s.areaHeadLeft}>
          <span style={{ ...s.areaScore, color: band.fg }}>
            {area.score}<span style={s.areaScoreUnit}>%</span>
          </span>
          <div style={s.areaTitleBlock}>
            <h3 style={s.areaTitle}>{area.name}</h3>
            <StatusChip chip={area.statusChip} />
          </div>
        </div>
        <span style={s.areaToggle} aria-hidden="true">
          {open
            ? <ChevronUp size={18} color="var(--color-text-tertiary)" />
            : <ChevronDown size={18} color="var(--color-text-tertiary)" />}
        </span>
      </button>

      {open && (
        <div id={`area-${areaIdx}`} style={s.areaBody}>
          <SubBlock
            label="What's working"
            sample={area.whatsWorking.sample}
            accent="var(--color-success)"
          >
            <CoachingBriefEditable
              value={edits[`focus.${areaIdx}.working`] ?? area.whatsWorking.bullets}
              onChange={(v) => onEdit(`focus.${areaIdx}.working`, v)}
              editor={editor}
              label={`what's working for ${area.name}`}
            />
          </SubBlock>

          <SubBlock
            label="Where to focus"
            sample={hasFocus ? area.whereToFocus.sample : null}
            accent={hasFocus ? "var(--color-button-primary-bg)" : "var(--color-divider-card)"}
          >
            {hasFocus ? (
              <CoachingBriefEditable
                value={edits[`focus.${areaIdx}.focus`] ?? area.whereToFocus.bullets}
                onChange={(v) => onEdit(`focus.${areaIdx}.focus`, v)}
                editor={editor}
                label={`where to focus for ${area.name}`}
              />
            ) : (
              <EmptyState
                title="No flags this period"
                body="Compliance is at 100 percent for this window. This block stays empty until a coaching flag is raised."
              />
            )}
          </SubBlock>
        </div>
      )}
    </div>
  );
}

function SubBlock({ label, sample, accent, children }) {
  return (
    <div style={{ ...s.subBlock, borderInlineStartColor: accent }}>
      <div style={s.subBlockHead}>
        <span style={s.subBlockLabel}>{label}</span>
        {sample && <span style={s.subBlockSample}>{sample}</span>}
      </div>
      {children}
    </div>
  );
}

function StatusChip({ chip }) {
  if (!chip) return null;
  const tone = STATUS_CHIP_TONE[chip.kind] || STATUS_CHIP_TONE.neutral;
  return (
    <span style={{ ...s.statusChip, ...tone }}>
      {chip.kind === "primary" && (
        <span style={{ ...s.toneDot, background: tone.color }} aria-hidden="true" />
      )}
      {chip.label}
    </span>
  );
}

function EmptyState({ title, body }) {
  return (
    <div style={s.emptyState}>
      <span style={s.emptyTitle}>{title}</span>
      <p style={s.emptyBody}>{body}</p>
    </div>
  );
}

// ---- Inspector (right pane) -------------------------------------------

function Inspector({ overview, adherence, focus }) {
  return (
    <aside style={s.inspectorWrap} aria-label="Brief data inspector">
      <Card padX={20} padY={20} style={s.inspectorCard}>
        <span style={s.inspectorTitle}>Inspector</span>
        <span style={s.inspectorSub}>Read-only grounding · {overview.sampleSize}</span>

        <InspectorBlock title="KPIs">
          <ul style={s.kpiMiniList}>
            {overview.kpis.map((kpi) => {
              const trend = TREND_STYLES[kpi.trend] || TREND_STYLES.neutral;
              const TrendIcon = trend.Icon;
              return (
                <li key={kpi.label} style={s.kpiMiniItem}>
                  <span style={s.kpiMiniLabel}>{kpi.label}</span>
                  <span style={s.kpiMiniRow}>
                    <span style={s.kpiMiniValue}>{kpi.value}</span>
                    <span style={{ ...s.kpiMiniDelta, color: trend.fg }}>
                      <TrendIcon size={12} color={trend.fg} aria-hidden="true" />
                      {kpi.delta}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </InspectorBlock>

        <InspectorBlock title="Benchmarks (vs. Org)">
          <ul style={s.benchList}>
            {adherence.benchmarks.map((row) => {
              const tone = TREND_STYLES[row.vsOrgTone] || TREND_STYLES.neutral;
              return (
                <li key={row.area} style={s.benchRow}>
                  <span style={s.benchArea}>{row.area}</span>
                  <span style={{ ...s.benchDelta, color: tone.fg }}>
                    <span
                      style={{ ...s.toneDot, background: tone.fg }}
                      aria-hidden="true"
                    />
                    {row.vsOrg}
                  </span>
                </li>
              );
            })}
          </ul>
          <p style={s.benchFootnote}>{adherence.benchmark}</p>
        </InspectorBlock>

        <InspectorBlock title="Focus scores">
          <ul style={s.areaScoreList}>
            {focus.areas.map((area) => {
              const band = scoreBand(area.score);
              return (
                <li key={area.name} style={s.areaScoreRow}>
                  <span style={s.areaScoreLabel}>{area.name}</span>
                  <span style={{ ...s.areaScorePct, color: band.fg }}>
                    <span
                      style={{ ...s.toneDot, background: band.fg }}
                      aria-hidden="true"
                    />
                    {area.score}%
                  </span>
                </li>
              );
            })}
          </ul>
        </InspectorBlock>

        <InspectorBlock
          title="Snapshot"
          subtitle="Field list pending Neil's spec"
        >
          <dl style={s.snapshotMini}>
            <SnapshotField label="Sample"    value={overview.sampleSize} />
            <SnapshotField label="Period"    value={overview.period} />
            <SnapshotField label="Brand"     value={overview.brand} />
            <SnapshotField label="Service"   value={overview.service} />
            <SnapshotField label="Team lead" value={overview.teamLead} />
            <SnapshotField label="Generated" value={formatDate(overview.generatedAt)} />
          </dl>
        </InspectorBlock>
      </Card>
    </aside>
  );
}

function InspectorBlock({ title, subtitle, children }) {
  return (
    <section style={s.inspectorBlock}>
      <div style={s.inspectorBlockHead}>
        <span style={s.inspectorBlockTitle}>{title}</span>
        {subtitle && <span style={s.inspectorBlockSub}>{subtitle}</span>}
      </div>
      {children}
    </section>
  );
}

function SnapshotField({ label, value }) {
  return (
    <div style={s.snapshotField}>
      <dt style={s.snapshotKey}>{label}</dt>
      <dd style={s.snapshotVal}>{value}</dd>
    </div>
  );
}

// ---- Helpers ----------------------------------------------------------

const TREND_STYLES = {
  positive: { fg: "var(--color-success)", Icon: TrendingUp },
  negative: { fg: "var(--color-error)",   Icon: TrendingDown },
  neutral:  { fg: "var(--color-text-tertiary)", Icon: Minus },
};

const STATUS_CHIP_TONE = {
  primary: {
    background: "var(--color-primary-alpha-08)",
    color: "var(--color-button-primary-bg)",
    borderColor: "var(--color-primary-alpha-12)",
  },
  neutral: {
    background: "var(--color-chip-bg)",
    color: "var(--color-text-medium)",
    borderColor: "var(--color-divider-card)",
  },
};

function scoreBand(score) {
  if (score >= 90) return { label: "Excellent",  fg: "var(--color-success)" };
  if (score >= 75) return { label: "On track",   fg: "var(--color-text-medium)" };
  if (score >= 60) return { label: "Watch",      fg: "var(--color-warning)" };
  return { label: "Primary focus", fg: "var(--color-button-primary-bg)" };
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

// ---- Styles -----------------------------------------------------------

const s = {
  column: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    width: "100%",
    fontFamily: "var(--font-sans)",
  },

  // Header
  headerCard: { boxShadow: "var(--shadow-card)" },
  headerInner: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 20px",
    minHeight: 56,
  },
  headerKind: {
    fontFamily: "var(--font-mono)",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.06em",
    color: "var(--color-text-tertiary)",
    textTransform: "uppercase",
  },
  headerAgent: {
    fontFamily: "var(--font-sans)",
    fontSize: 16,
    fontWeight: 600,
    color: "var(--color-text-deep)",
    letterSpacing: "0.1px",
  },
  headerPeriod: {
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    fontWeight: 500,
    color: "var(--color-text-medium)",
  },
  headerDot: {
    width: 3,
    height: 3,
    borderRadius: 999,
    background: "var(--color-text-placeholder)",
  },
  statusPill: {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 10px",
    background: "var(--color-icon-tertiary-bg)",
    color: "var(--color-icon-tertiary-fg)",
    borderRadius: 999,
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.05em",
  },

  // Body
  body: {
    display: "flex",
    alignItems: "flex-start",
    gap: 24,
    width: "100%",
  },

  // Document
  document: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  docCard: { boxShadow: "var(--shadow-card)" },
  section: { display: "flex", flexDirection: "column", gap: 16 },
  sectionEyebrow: {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    fontWeight: 700,
    color: "var(--color-icon-tertiary-fg)",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
  },

  hero: {
    margin: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 30,
    fontWeight: 700,
    lineHeight: "38px",
    color: "var(--color-text-deep)",
    letterSpacing: "-0.2px",
  },
  heroSub: {
    margin: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 15,
    fontWeight: 500,
    color: "var(--color-text-medium)",
  },
  heroLede: {
    margin: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    fontWeight: 400,
    lineHeight: "22px",
    color: "var(--color-text-tertiary)",
  },

  h2: {
    margin: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 20,
    fontWeight: 700,
    lineHeight: "28px",
    color: "var(--color-text-deep)",
  },
  h2Lede: {
    margin: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    color: "var(--color-text-medium)",
    lineHeight: "22px",
  },

  sourceLine: {
    margin: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    color: "var(--color-text-tertiary)",
  },
  sourceKey: {
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    fontWeight: 700,
    color: "var(--color-text-medium)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginRight: 6,
  },

  // Areas
  areaList: { display: "flex", flexDirection: "column", gap: 12 },
  area: {
    display: "flex",
    flexDirection: "column",
    background: "var(--surface-white)",
    border: "1px solid var(--color-divider-card)",
    borderInlineStartWidth: 4,
    borderInlineStartStyle: "solid",
    borderRadius: 8,
    overflow: "hidden",
  },
  areaHead: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    width: "100%",
    padding: "14px 18px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontFamily: "inherit",
    textAlign: "left",
  },
  areaHeadLeft: { display: "inline-flex", alignItems: "center", gap: 16, flex: 1, minWidth: 0 },
  areaScore: {
    fontFamily: "var(--font-sans)",
    fontSize: 24,
    fontWeight: 700,
    letterSpacing: "-0.2px",
    flexShrink: 0,
    minWidth: 60,
  },
  areaScoreUnit: { fontSize: 14, fontWeight: 700, marginLeft: 1 },
  areaTitleBlock: { display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 0 },
  areaTitle: {
    margin: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 15,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    letterSpacing: "0.1px",
  },
  areaToggle: {
    display: "inline-grid",
    placeItems: "center",
    flexShrink: 0,
    width: 24,
    height: 24,
  },
  areaBody: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    padding: "0 18px 18px",
  },
  statusChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "3px 10px",
    border: "1px solid",
    borderRadius: 999,
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    fontWeight: 600,
    width: "fit-content",
  },
  toneDot: { width: 8, height: 8, borderRadius: 999 },

  subBlock: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    paddingInlineStart: 14,
    borderInlineStartWidth: 3,
    borderInlineStartStyle: "solid",
  },
  subBlockHead: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 8,
  },
  subBlockLabel: {
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    letterSpacing: "0.1px",
  },
  subBlockSample: {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
    letterSpacing: "0.05em",
  },

  emptyState: { display: "flex", flexDirection: "column", gap: 6 },
  emptyTitle: {
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text-medium)",
  },
  emptyBody: {
    margin: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    color: "var(--color-text-tertiary)",
    lineHeight: "20px",
  },

  // Reinforcement + actions
  reinforceBlock: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    padding: 20,
    background: "var(--color-card-emoji-bg)",
    border: "1px solid var(--color-border-card-soft)",
    borderRadius: 12,
  },
  reinforceLabelRow: { display: "inline-flex", alignItems: "center", gap: 8 },
  reinforceLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    fontWeight: 700,
    color: "var(--color-icon-tertiary-fg)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  actionList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    padding: 0,
    margin: 0,
    listStyle: "none",
  },
  actionRow: {
    display: "flex",
    gap: 16,
    padding: "16px 18px",
    background: "var(--surface-white)",
    border: "1px solid var(--color-divider-card)",
    borderRadius: 8,
  },
  actionIdx: {
    fontFamily: "var(--font-mono)",
    fontSize: 14,
    fontWeight: 700,
    color: "var(--color-text-tertiary)",
    letterSpacing: "0.05em",
    flexShrink: 0,
  },
  actionBody: { display: "flex", flexDirection: "column", gap: 6, flex: 1, minWidth: 0 },
  actionTitle: {
    margin: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 15,
    fontWeight: 700,
    color: "var(--color-text-deep)",
  },
  actionDesc: {
    margin: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    color: "var(--color-text-medium)",
    lineHeight: "21px",
  },
  actionImpact: {
    margin: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    color: "var(--color-text-tertiary)",
  },
  actionImpactKey: {
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    fontWeight: 700,
    color: "var(--color-text-tertiary)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginRight: 6,
  },

  // Inspector
  inspectorWrap: {
    width: 320,
    flexShrink: 0,
    position: "sticky",
    top: 16,
    alignSelf: "flex-start",
  },
  inspectorCard: { boxShadow: "var(--shadow-card)" },
  inspectorTitle: {
    display: "block",
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    fontWeight: 700,
    color: "var(--color-text-medium)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  inspectorSub: {
    display: "block",
    marginTop: 2,
    marginBottom: 16,
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    color: "var(--color-text-tertiary)",
  },

  inspectorBlock: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    paddingTop: 14,
    marginTop: 12,
    borderTop: "1px solid var(--color-border-card-soft)",
  },
  inspectorBlockHead: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  inspectorBlockTitle: {
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    letterSpacing: "0.1px",
  },
  inspectorBlockSub: {
    fontFamily: "var(--font-sans)",
    fontSize: 11,
    fontStyle: "italic",
    color: "var(--color-text-tertiary)",
  },

  kpiMiniList: { display: "flex", flexDirection: "column", gap: 10, padding: 0, margin: 0, listStyle: "none" },
  kpiMiniItem: { display: "flex", flexDirection: "column", gap: 2 },
  kpiMiniLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    fontWeight: 700,
    color: "var(--color-text-tertiary)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  kpiMiniRow: { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 },
  kpiMiniValue: {
    fontFamily: "var(--font-sans)",
    fontSize: 16,
    fontWeight: 700,
    color: "var(--color-text-deep)",
  },
  kpiMiniDelta: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    fontFamily: "var(--font-sans)",
    fontSize: 11,
    fontWeight: 600,
  },

  benchList: { display: "flex", flexDirection: "column", gap: 8, padding: 0, margin: 0, listStyle: "none" },
  benchRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  benchArea: {
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    color: "var(--color-text-medium)",
    flex: 1,
    minWidth: 0,
  },
  benchDelta: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    fontWeight: 600,
  },
  benchFootnote: {
    margin: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 11,
    color: "var(--color-text-tertiary)",
    lineHeight: "16px",
  },

  areaScoreList: { display: "flex", flexDirection: "column", gap: 8, padding: 0, margin: 0, listStyle: "none" },
  areaScoreRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  areaScoreLabel: {
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    color: "var(--color-text-medium)",
    flex: 1,
    minWidth: 0,
  },
  areaScorePct: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 700,
  },

  snapshotMini: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    margin: 0,
  },
  snapshotField: { display: "flex", flexDirection: "column", gap: 2 },
  snapshotKey: {
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    fontWeight: 700,
    color: "var(--color-text-tertiary)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    margin: 0,
  },
  snapshotVal: {
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 500,
    color: "var(--color-text-deep)",
    margin: 0,
  },
};
