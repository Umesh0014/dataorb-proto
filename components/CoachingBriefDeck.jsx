"use client";

import React from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  FileText,
  Crosshair,
  Target,
  ListChecks,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import CoachingBriefEditable from "./CoachingBriefEditable";

/**
 * CoachingBriefDeck — Variant A.
 *
 * One-slide-at-a-time presentation of the brief. A vertical chapter rail
 * surfaces every section (overview · adherence · four focus-area
 * sub-slides · coaching actions). The stage to its right renders the
 * active slide, with a pager at the bottom (prev / next + slide x of n).
 *
 * The legacy green/yellow focus-area cards are replaced by neutral
 * stage cards with a status chip + score dot (UI-6). KPI deltas are
 * trend-tagged with both icon and label (G9). Narrative blocks are
 * editable inline via CoachingBriefEditable (INT-7); quantitative
 * data stays read-only.
 *
 * Props:
 *   brief    full coaching brief object (overview, adherence, focus-area,
 *            coaching-actions sections)
 *   edits    keyed override map of edited narratives
 *   onEdit   (path, value) => void  — commit a narrative edit
 *   onBack   optional back handler (header back button)
 */
export default function CoachingBriefDeck({ brief, edits, onEdit, onBack }) {
  const sections = React.useMemo(() => buildSlides(brief), [brief]);
  const [slideIdx, setSlideIdx] = React.useState(0);
  const current = sections[slideIdx];
  const prev = () => setSlideIdx((i) => Math.max(0, i - 1));
  const next = () => setSlideIdx((i) => Math.min(sections.length - 1, i + 1));
  const goTo = (i) => setSlideIdx(i);

  return (
    <div style={s.column}>
      <Header brief={brief} onBack={onBack} />

      <div style={s.body}>
        <ChapterRail
          sections={sections}
          activeIdx={slideIdx}
          onSelect={goTo}
        />

        <main style={s.stage}>
          <Card padX={32} padY={32} style={s.stageCard}>
            <SlideHead section={current} index={slideIdx} total={sections.length} />
            <SlideBody
              section={current}
              brief={brief}
              edits={edits}
              onEdit={onEdit}
            />
          </Card>

          <Pager
            current={slideIdx}
            total={sections.length}
            onPrev={prev}
            onNext={next}
            currentTitle={current.title}
          />
        </main>
      </div>
    </div>
  );
}

// ---- Slide registry ---------------------------------------------------

function buildSlides(brief) {
  const overview = brief.sections.find((x) => x.type === "overview");
  const adherence = brief.sections.find((x) => x.type === "adherence");
  const focus = brief.sections.find((x) => x.type === "focus-area");
  const actions = brief.sections.find((x) => x.type === "coaching-actions");

  return [
    { id: "overview",  kind: "overview",  title: "Overview",       Icon: FileText,   data: overview },
    { id: "adherence", kind: "adherence", title: "Adherence",      Icon: Crosshair,  data: adherence },
    ...focus.areas.map((area, i) => ({
      id: `focus-${i}`,
      kind: "focus-area",
      title: area.name,
      sectionLabel: "Focus area",
      Icon: Target,
      data: area,
      areaIdx: i,
      sectionMeta: { intro: focus.intro, lastUpdatedBy: focus.lastUpdatedBy },
    })),
    { id: "actions",   kind: "actions",   title: "Coaching Actions", Icon: ListChecks, data: actions },
  ];
}

// ---- Header -----------------------------------------------------------

function Header({ brief, onBack }) {
  const ov = brief.sections.find((x) => x.type === "overview");
  return (
    <Card padX={0} padY={0} style={s.headerCard}>
      <div style={s.headerInner}>
        <Button
          variant="icon"
          size="sm"
          onClick={onBack}
          aria-label="Back to Coaching"
        >
          <ArrowLeft size={20} color="var(--color-text-medium)" />
        </Button>
        <span style={s.headerKind}>Coaching Brief</span>
        <Dot />
        <span style={s.headerAgent}>{ov.agentName}</span>
        <Dot />
        <span style={s.headerPeriod}>{ov.period}</span>
        <div style={{ flex: 1 }} />
        <span style={s.statusPill}>v{ov.schemaVersion} · Auto-generated</span>
      </div>
    </Card>
  );
}

function Dot() {
  return <span style={s.headerDot} aria-hidden="true" />;
}

// ---- Chapter rail -----------------------------------------------------

function ChapterRail({ sections, activeIdx, onSelect }) {
  return (
    <aside style={s.railWrap} aria-label="Brief slides">
      <Card padX={12} padY={12} style={s.railCard}>
        <span style={s.railTitle}>Slides</span>
        <nav style={s.railList} aria-label="Brief slides">
          {sections.map((sec, i) => {
            const active = i === activeIdx;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => onSelect(i)}
                aria-current={active ? "true" : undefined}
                style={{
                  ...s.railBtn,
                  background: active ? "var(--nav-rail-active-bg)" : "transparent",
                  color: active ? "var(--nav-rail-active)" : "var(--color-text-medium)",
                  fontWeight: active ? 600 : 500,
                }}
              >
                <span style={s.railIdx}>{String(i + 1).padStart(2, "0")}</span>
                <sec.Icon
                  size={16}
                  color={active ? "var(--nav-rail-active)" : "var(--color-text-tertiary)"}
                />
                <span style={s.railLabel}>{sec.title}</span>
              </button>
            );
          })}
        </nav>
      </Card>
    </aside>
  );
}

// ---- Slide head -------------------------------------------------------

function SlideHead({ section, index, total }) {
  return (
    <header style={s.slideHead}>
      <div style={s.slideHeadLeft}>
        <span style={s.slideEyebrow}>
          {section.sectionLabel || section.title}
        </span>
        <h1 style={s.slideTitle}>{section.title}</h1>
      </div>
      <span style={s.slideCount} aria-label={`Slide ${index + 1} of ${total}`}>
        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </span>
    </header>
  );
}

// ---- Slide body -------------------------------------------------------

function SlideBody({ section, brief, edits, onEdit }) {
  if (section.kind === "overview") {
    return <OverviewSlide data={section.data} />;
  }
  if (section.kind === "adherence") {
    return (
      <AdherenceSlide
        data={section.data}
        edits={edits}
        onEdit={onEdit}
      />
    );
  }
  if (section.kind === "focus-area") {
    return (
      <FocusAreaSlide
        area={section.data}
        areaIdx={section.areaIdx}
        meta={section.sectionMeta}
        edits={edits}
        onEdit={onEdit}
      />
    );
  }
  if (section.kind === "actions") {
    return (
      <ActionsSlide
        data={section.data}
        edits={edits}
        onEdit={onEdit}
      />
    );
  }
  return null;
}

// ---- Overview slide ---------------------------------------------------

function OverviewSlide({ data }) {
  return (
    <div style={s.slideContent}>
      <p style={s.lede}>
        Coaching brief for <strong>{data.agentName}</strong> covering{" "}
        <strong>{data.period}</strong>. {data.sampleSize} on the
        {" "}{data.service.toLowerCase()} desk.
      </p>

      <div style={s.kpiStrip}>
        {data.kpis.map((kpi) => (
          <KpiTile key={kpi.label} kpi={kpi} />
        ))}
      </div>

      <SnapshotBlock data={data} />
    </div>
  );
}

function KpiTile({ kpi }) {
  const trend = TREND_STYLES[kpi.trend] || TREND_STYLES.neutral;
  const TrendIcon = trend.Icon;
  return (
    <div style={s.kpiTile}>
      <span style={s.kpiLabel}>{kpi.label}</span>
      <span style={s.kpiValue}>{kpi.value}</span>
      <span style={{ ...s.kpiDelta, color: trend.fg }}>
        <TrendIcon size={14} color={trend.fg} aria-hidden="true" />
        {kpi.delta}
      </span>
    </div>
  );
}

function SnapshotBlock({ data }) {
  return (
    <div style={s.snapshot}>
      <div style={s.snapshotHead}>
        <span style={s.snapshotLabel}>Snapshot</span>
        <span style={s.snapshotNote}>
          Field list pending Neil's spec — current data shown for layout
        </span>
      </div>
      <dl style={s.snapshotGrid}>
        <SnapshotField label="Sample"     value={data.sampleSize} />
        <SnapshotField label="Period"     value={data.period} />
        <SnapshotField label="Brand"      value={data.brand} />
        <SnapshotField label="Service"    value={data.service} />
        <SnapshotField label="Team lead"  value={data.teamLead} />
        <SnapshotField label="Generated"  value={formatDate(data.generatedAt)} />
      </dl>
    </div>
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

// ---- Adherence slide --------------------------------------------------

function AdherenceSlide({ data, edits, onEdit }) {
  const execKey = "adherence.exec";
  const closingKey = "adherence.closing";
  return (
    <div style={s.slideContent}>
      <CoachingBriefEditable
        value={edits[execKey] ?? data.execNarrative}
        onChange={(v) => onEdit(execKey, v)}
        editor={data.lastUpdatedBy}
        label="adherence executive narrative"
      />

      <BenchmarksTable data={data} />

      <CoachingBriefEditable
        value={edits[closingKey] ?? data.closingNarrative}
        onChange={(v) => onEdit(closingKey, v)}
        editor={data.lastUpdatedBy}
        label="adherence closing narrative"
      />

      <SourceLine source={data.source} benchmark={data.benchmark} />
    </div>
  );
}

function BenchmarksTable({ data }) {
  return (
    <div style={s.tableWrap}>
      <table style={s.table}>
        <caption style={s.tableCaption}>
          Adherence vs. organisation — accessible alternative to the same data
          as a chart per WCAG-9.
        </caption>
        <thead>
          <tr>
            <th scope="col" style={{ ...s.th, textAlign: "left" }}>Focus area</th>
            <th scope="col" style={s.th}>Agent (%)</th>
            <th scope="col" style={s.th}>Org avg (%)</th>
            <th scope="col" style={s.th}>Top P90 (%)</th>
            <th scope="col" style={s.th}>vs. Org (pp)</th>
          </tr>
        </thead>
        <tbody>
          {data.benchmarks.map((row) => {
            const tone = TREND_STYLES[row.vsOrgTone] || TREND_STYLES.neutral;
            return (
              <tr key={row.area}>
                <td style={{ ...s.td, textAlign: "left", fontWeight: 500 }}>{row.area}</td>
                <td style={s.td}>{row.agentRate}</td>
                <td style={s.td}>{row.orgAvg}</td>
                <td style={s.td}>{row.topAvg}</td>
                <td style={{ ...s.td, color: tone.fg, fontWeight: 600 }}>
                  <span style={s.tableDeltaCell}>
                    <span style={{ ...s.toneDot, background: tone.fg }} aria-hidden="true" />
                    {row.vsOrg}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function SourceLine({ source, benchmark }) {
  return (
    <p style={s.sourceLine}>
      <span style={s.sourceKey}>Source</span> {source}
      <span style={{ ...s.sourceKey, marginLeft: 16 }}>Benchmark</span> {benchmark}
    </p>
  );
}

// ---- Focus-area slide -------------------------------------------------

function FocusAreaSlide({ area, areaIdx, meta, edits, onEdit }) {
  const workingKey  = `focus.${areaIdx}.working`;
  const focusKey    = `focus.${areaIdx}.focus`;
  const hasWhereToFocus = !area.whereToFocus?.empty;
  return (
    <div style={s.slideContent}>
      <div style={s.focusHead}>
        <ScoreBlock score={area.score} />
        <div style={s.focusHeadMeta}>
          <StatusChip chip={area.statusChip} />
          <span style={s.focusIntroMeta}>{meta.intro}</span>
        </div>
      </div>

      <div style={s.focusGrid}>
        <FocusBlock
          tone="working"
          title="What's working"
          sample={area.whatsWorking.sample}
        >
          <CoachingBriefEditable
            value={edits[workingKey] ?? area.whatsWorking.bullets}
            onChange={(v) => onEdit(workingKey, v)}
            editor={meta.lastUpdatedBy}
            label={`what's working for ${area.name}`}
          />
        </FocusBlock>

        <FocusBlock
          tone={hasWhereToFocus ? "focus" : "empty"}
          title="Where to focus"
          sample={hasWhereToFocus ? area.whereToFocus.sample : null}
        >
          {hasWhereToFocus ? (
            <CoachingBriefEditable
              value={edits[focusKey] ?? area.whereToFocus.bullets}
              onChange={(v) => onEdit(focusKey, v)}
              editor={meta.lastUpdatedBy}
              label={`where to focus for ${area.name}`}
            />
          ) : (
            <EmptyState
              title="No flags this period"
              body="Compliance is at 100 percent for this window. This block stays empty until a coaching flag is raised."
            />
          )}
        </FocusBlock>
      </div>
    </div>
  );
}

function ScoreBlock({ score }) {
  const band = scoreBand(score);
  return (
    <div style={s.scoreBlock} aria-label={`Adherence score ${score} percent — ${band.label}`}>
      <span style={{ ...s.scoreBig, color: band.fg }}>{score}<span style={s.scoreUnit}>%</span></span>
      <span style={s.scoreLabel}>adherence</span>
      <span style={{ ...s.scoreBand, color: band.fg }}>
        <span style={{ ...s.toneDot, background: band.fg }} aria-hidden="true" />
        {band.label}
      </span>
    </div>
  );
}

function FocusBlock({ tone, title, sample, children }) {
  const accent = FOCUS_ACCENT[tone];
  return (
    <div style={{ ...s.focusBlock, borderInlineStartColor: accent }}>
      <div style={s.focusBlockHead}>
        <span style={s.focusBlockTitle}>{title}</span>
        {sample && <span style={s.focusBlockSample}>{sample}</span>}
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

// ---- Actions slide ----------------------------------------------------

function ActionsSlide({ data, edits, onEdit }) {
  const subjectKey   = "actions.subject";
  const reinKey      = "actions.reinforcement";
  const closingKey   = "actions.closing";
  return (
    <div style={s.slideContent}>
      <div style={s.reinforceBlock}>
        <div style={s.reinforceLabelRow}>
          <Sparkles size={16} color="var(--color-icon-tertiary-fg)" aria-hidden="true" />
          <span style={s.reinforceLabel}>Reinforcement</span>
        </div>
        <CoachingBriefEditable
          value={edits[subjectKey] ?? data.reinforcementSubject}
          onChange={(v) => onEdit(subjectKey, v)}
          editor={data.lastUpdatedBy}
          label="reinforcement subject"
          variant="headline"
        />
        <CoachingBriefEditable
          value={edits[reinKey] ?? data.reinforcementNarrative}
          onChange={(v) => onEdit(reinKey, v)}
          editor={data.lastUpdatedBy}
          label="reinforcement narrative"
        />
      </div>

      <ol style={s.actionList}>
        {data.actions.map((action, i) => (
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
        value={edits[closingKey] ?? data.closingNarrative}
        onChange={(v) => onEdit(closingKey, v)}
        editor={data.lastUpdatedBy}
        label="closing narrative"
      />
    </div>
  );
}

// ---- Pager ------------------------------------------------------------

function Pager({ current, total, onPrev, onNext, currentTitle }) {
  return (
    <div style={s.pager} aria-label="Slide navigation">
      <Button
        variant="icon"
        size="sm"
        bordered
        onClick={onPrev}
        disabled={current === 0}
        aria-label="Previous slide"
      >
        <ChevronLeft size={18} color="var(--color-text-medium)" />
      </Button>
      <span style={s.pagerLabel}>
        <span style={s.pagerCount}>
          {String(current + 1).padStart(2, "0")} of {String(total).padStart(2, "0")}
        </span>
        <span style={s.pagerTitle}>{currentTitle}</span>
      </span>
      <Button
        variant="icon"
        size="sm"
        bordered
        onClick={onNext}
        disabled={current === total - 1}
        aria-label="Next slide"
      >
        <ChevronRight size={18} color="var(--color-text-medium)" />
      </Button>
    </div>
  );
}

// ---- Helpers ----------------------------------------------------------

const TREND_STYLES = {
  positive: { fg: "var(--color-success)",  Icon: TrendingUp },
  negative: { fg: "var(--color-error)",    Icon: TrendingDown },
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

const FOCUS_ACCENT = {
  working: "var(--color-success)",
  focus:   "var(--color-button-primary-bg)",
  empty:   "var(--color-divider-card)",
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

  // Chapter rail
  railWrap: {
    width: 220,
    flexShrink: 0,
    position: "sticky",
    top: 16,
    alignSelf: "flex-start",
  },
  railCard: { boxShadow: "var(--shadow-card)" },
  railTitle: {
    display: "block",
    padding: "8px 12px",
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    fontWeight: 700,
    color: "var(--color-text-tertiary)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  railList: { display: "flex", flexDirection: "column", gap: 2 },
  railBtn: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "100%",
    padding: "10px 12px",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: 13,
    textAlign: "left",
    transition: "background 150ms ease, color 150ms ease",
  },
  railIdx: {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    fontWeight: 700,
    color: "var(--color-text-tertiary)",
    letterSpacing: "0.05em",
    width: 22,
    flexShrink: 0,
  },
  railLabel: { flex: 1, minWidth: 0 },

  // Stage
  stage: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 16 },
  stageCard: { boxShadow: "var(--shadow-card)" },

  slideHead: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 16,
    paddingBottom: 20,
    borderBottom: "1px solid var(--color-border-card-soft)",
  },
  slideHeadLeft: { display: "flex", flexDirection: "column", gap: 4 },
  slideEyebrow: {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    fontWeight: 700,
    color: "var(--color-icon-tertiary-fg)",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
  },
  slideTitle: {
    margin: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 28,
    fontWeight: 700,
    lineHeight: "36px",
    color: "var(--color-text-deep)",
  },
  slideCount: {
    fontFamily: "var(--font-mono)",
    fontSize: 12,
    fontWeight: 700,
    color: "var(--color-text-tertiary)",
    letterSpacing: "0.05em",
  },

  slideContent: { display: "flex", flexDirection: "column", gap: 24, paddingTop: 24 },
  lede: {
    margin: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 16,
    fontWeight: 400,
    lineHeight: "26px",
    color: "var(--color-text-medium)",
  },

  // KPI strip
  kpiStrip: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 12,
  },
  kpiTile: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    padding: 16,
    background: "var(--surface-white)",
    border: "1px solid var(--color-divider-card)",
    borderRadius: 12,
  },
  kpiLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    fontWeight: 700,
    color: "var(--color-text-tertiary)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  kpiValue: {
    fontFamily: "var(--font-sans)",
    fontSize: 24,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    letterSpacing: "0.1px",
  },
  kpiDelta: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    fontWeight: 600,
  },

  // Snapshot
  snapshot: {
    padding: 20,
    background: "var(--color-card-emoji-bg)",
    borderRadius: 12,
    border: "1px solid var(--color-border-card-soft)",
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  snapshotHead: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 12,
  },
  snapshotLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    fontWeight: 700,
    color: "var(--color-text-medium)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  snapshotNote: {
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    fontStyle: "italic",
    color: "var(--color-text-tertiary)",
  },
  snapshotGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 12,
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
    fontSize: 14,
    fontWeight: 500,
    color: "var(--color-text-deep)",
    margin: 0,
  },

  // Table
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  tableCaption: {
    captionSide: "bottom",
    paddingTop: 8,
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    color: "var(--color-text-tertiary)",
    textAlign: "left",
  },
  th: {
    padding: "10px 12px",
    background: "var(--color-card-emoji-bg)",
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    fontWeight: 600,
    color: "var(--color-text-tertiary)",
    letterSpacing: "0.05em",
    textAlign: "right",
    borderBottom: "1px solid var(--color-border-card-soft)",
  },
  td: {
    padding: "12px 12px",
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    color: "var(--color-text-medium)",
    textAlign: "right",
    borderBottom: "1px solid var(--color-border-card-soft)",
  },
  tableDeltaCell: { display: "inline-flex", alignItems: "center", gap: 6, justifyContent: "flex-end" },
  toneDot: { width: 8, height: 8, borderRadius: 999 },

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

  // Focus slide
  focusHead: {
    display: "flex",
    alignItems: "flex-start",
    gap: 24,
    padding: 24,
    background: "var(--color-card-emoji-bg)",
    border: "1px solid var(--color-border-card-soft)",
    borderRadius: 12,
  },
  focusHeadMeta: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  focusIntroMeta: {
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    color: "var(--color-text-tertiary)",
    lineHeight: "20px",
  },

  scoreBlock: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    minWidth: 110,
  },
  scoreBig: {
    fontFamily: "var(--font-sans)",
    fontSize: 40,
    fontWeight: 700,
    lineHeight: 1,
    letterSpacing: "-0.5px",
  },
  scoreUnit: {
    fontSize: 20,
    fontWeight: 700,
    marginLeft: 2,
  },
  scoreLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    fontWeight: 700,
    color: "var(--color-text-tertiary)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  scoreBand: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 600,
    marginTop: 4,
  },

  statusChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "4px 10px",
    border: "1px solid",
    borderRadius: 999,
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    fontWeight: 600,
    width: "fit-content",
  },

  focusGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 16,
  },
  focusBlock: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    padding: "18px 20px",
    background: "var(--surface-white)",
    border: "1px solid var(--color-divider-card)",
    borderInlineStartWidth: 4,
    borderInlineStartStyle: "solid",
    borderRadius: 8,
  },
  focusBlockHead: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 8,
  },
  focusBlockTitle: {
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    letterSpacing: "0.1px",
  },
  focusBlockSample: {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
    letterSpacing: "0.05em",
  },

  emptyState: { display: "flex", flexDirection: "column", gap: 6 },
  emptyTitle: {
    fontFamily: "var(--font-sans)",
    fontSize: 14,
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

  // Actions
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
  actionList: { display: "flex", flexDirection: "column", gap: 12, padding: 0, margin: 0, listStyle: "none" },
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

  // Pager
  pager: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "10px 16px",
    background: "var(--surface-white)",
    border: "1px solid var(--color-divider-card)",
    borderRadius: 999,
  },
  pagerLabel: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
    flex: 1,
    minWidth: 0,
  },
  pagerCount: {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    fontWeight: 700,
    color: "var(--color-text-tertiary)",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  pagerTitle: {
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text-deep)",
  },
};
