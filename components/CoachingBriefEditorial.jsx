"use client";

import React from "react";
import {
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
import CoachingBriefEditable from "./CoachingBriefEditable";
import CoachingBriefHeader from "./CoachingBriefHeader";

/**
 * CoachingBriefEditorial — Variant B.
 *
 * Long-scroll editorial article. A sticky TOC on the left tracks chapters
 * (Overview · Adherence · Focus areas · Actions); narrative blocks render
 * in a 720px readable column; tables and the KPI strip break to full
 * width. Focus areas are a 2-column grid of outlined cards — no green/
 * yellow backgrounds; status is carried by chip + a 4px left accent rule
 * (UI-6). KPI deltas pair an icon with a label so meaning never depends
 * on color (G9). Hover any narrative to reveal the inline edit pencil.
 *
 * Props match CoachingBriefDeck — brief / edits / onEdit / onBack.
 */
export default function CoachingBriefEditorial({ brief, edits, onEdit, onBack }) {
  const overview  = brief.sections.find((x) => x.type === "overview");
  const adherence = brief.sections.find((x) => x.type === "adherence");
  const focus     = brief.sections.find((x) => x.type === "focus-area");
  const actions   = brief.sections.find((x) => x.type === "coaching-actions");

  const [activeId, setActiveId] = React.useState("overview");

  // Scroll-spy — tracks the section closest to the viewport top so the
  // sticky TOC always advertises where the reader is (INT-2). Falls back
  // to the manual selection if IntersectionObserver isn't available.
  React.useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) return undefined;
    const targets = TOC_ITEMS
      .map((item) => document.getElementById(`cb-${item.id}`))
      .filter(Boolean);
    if (!targets.length) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) {
          const id = visible.target.id.replace(/^cb-/, "");
          setActiveId(id);
        }
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: [0, 0.5, 1] },
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleTocClick = (id) => {
    if (typeof document === "undefined") return;
    const el = document.getElementById(`cb-${id}`);
    if (!el) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    setActiveId(id);
  };

  return (
    <div style={s.column}>
      <CoachingBriefHeader overview={overview} onBack={onBack} />

      <div style={s.body}>
        <Toc activeId={activeId} onSelect={handleTocClick} />

        <main style={s.article}>
          <OverviewBlock data={overview} />
          <AdherenceBlock data={adherence} edits={edits} onEdit={onEdit} />
          <FocusAreasBlock data={focus} edits={edits} onEdit={onEdit} />
          <ActionsBlock data={actions} edits={edits} onEdit={onEdit} />
        </main>
      </div>
    </div>
  );
}

// ---- TOC --------------------------------------------------------------

const TOC_ITEMS = [
  { id: "overview",  label: "Overview",         Icon: FileText },
  { id: "adherence", label: "Adherence",        Icon: Crosshair },
  { id: "focus",     label: "Focus areas",      Icon: Target },
  { id: "actions",   label: "Coaching actions", Icon: ListChecks },
];

function Toc({ activeId, onSelect }) {
  return (
    <aside style={s.tocWrap} aria-label="Brief sections">
      <Card padX={12} padY={12} shadow style={s.tocCard}>
        <span style={s.tocTitle}>Sections</span>
        <nav style={s.tocList} aria-label="Brief sections">
          {TOC_ITEMS.map((item) => (
            <TocBtn
              key={item.id}
              item={item}
              active={item.id === activeId}
              onClick={() => onSelect(item.id)}
            />
          ))}
        </nav>
      </Card>
    </aside>
  );
}

function TocBtn({ item, active, onClick }) {
  const [hover, setHover] = React.useState(false);
  const tonal = active || hover;
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-current={active ? "true" : undefined}
      style={{
        ...s.tocBtn,
        background: tonal ? "var(--nav-rail-active-bg)" : "transparent",
        color: tonal ? "var(--nav-rail-active)" : "var(--color-text-medium)",
        fontWeight: active ? 600 : 500,
      }}
    >
      <item.Icon
        size={16}
        color={tonal ? "var(--nav-rail-active)" : "var(--color-text-tertiary)"}
      />
      <span style={s.tocLabel}>{item.label}</span>
    </button>
  );
}

// ---- Overview ---------------------------------------------------------

function OverviewBlock({ data }) {
  return (
    <Section id="overview" eyebrow="Overview">
      <h1 style={s.hero}>
        {data.agentName} — {data.service} brief
      </h1>
      <p style={s.heroLede}>
        {data.period} · {data.brand} · {data.sampleSize}.
      </p>

      <KpiStrip kpis={data.kpis} />
      <SnapshotBar data={data} />
    </Section>
  );
}

function KpiStrip({ kpis }) {
  return (
    <ul style={s.kpiStrip}>
      {kpis.map((kpi) => {
        const trend = TREND_STYLES[kpi.trend] || TREND_STYLES.neutral;
        const TrendIcon = trend.Icon;
        return (
          <li key={kpi.label} style={s.kpiTile}>
            <span style={s.kpiLabel}>{kpi.label}</span>
            <span style={s.kpiValue}>{kpi.value}</span>
            <span style={{ ...s.kpiDelta, color: trend.fg }}>
              <TrendIcon size={14} color={trend.fg} aria-hidden="true" />
              {kpi.delta}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function SnapshotBar({ data }) {
  return (
    <div style={s.snapshot}>
      <div style={s.snapshotHead}>
        <span style={s.snapshotLabel}>Snapshot</span>
        <span style={s.snapshotNote}>
          Field list pending Neil's spec — current data shown for layout
        </span>
      </div>
      <dl style={s.snapshotGrid}>
        <SnapshotField label="Sample"    value={data.sampleSize} />
        <SnapshotField label="Period"    value={data.period} />
        <SnapshotField label="Brand"     value={data.brand} />
        <SnapshotField label="Service"   value={data.service} />
        <SnapshotField label="Team lead" value={data.teamLead} />
        <SnapshotField label="Generated" value={formatDate(data.generatedAt)} />
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

// ---- Adherence --------------------------------------------------------

function AdherenceBlock({ data, edits, onEdit }) {
  return (
    <Section id="adherence" eyebrow="Adherence">
      <h2 style={s.h2}>Adherence vs. organisation</h2>
      <div style={s.readingColumn}>
        <CoachingBriefEditable
          value={edits["adherence.exec"] ?? data.execNarrative}
          onChange={(v) => onEdit("adherence.exec", v)}
          editor={data.lastUpdatedBy}
          label="adherence executive narrative"
        />
      </div>

      <BenchmarksTable data={data} />

      <div style={s.readingColumn}>
        <CoachingBriefEditable
          value={edits["adherence.closing"] ?? data.closingNarrative}
          onChange={(v) => onEdit("adherence.closing", v)}
          editor={data.lastUpdatedBy}
          label="adherence closing narrative"
        />
      </div>

      <p style={s.sourceLine}>
        <span style={s.sourceKey}>Source</span> {data.source}
        <span style={{ ...s.sourceKey, marginLeft: 16 }}>Benchmark</span> {data.benchmark}
      </p>
    </Section>
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

// ---- Focus areas ------------------------------------------------------

function FocusAreasBlock({ data, edits, onEdit }) {
  return (
    <Section id="focus" eyebrow="Focus areas">
      <h2 style={s.h2}>Where to lean in</h2>
      <p style={s.h2Lede}>{data.intro}</p>

      <div style={s.focusGrid}>
        {data.areas.map((area, i) => (
          <FocusCard
            key={area.name}
            area={area}
            areaIdx={i}
            editor={data.lastUpdatedBy}
            edits={edits}
            onEdit={onEdit}
          />
        ))}
      </div>
    </Section>
  );
}

function FocusCard({ area, areaIdx, editor, edits, onEdit }) {
  const accent = FOCUS_ACCENT[area.statusChip?.kind] || FOCUS_ACCENT.neutral;
  const hasFocus = !area.whereToFocus?.empty;
  const band = scoreBand(area.score);

  return (
    <Card
      tone="outline"
      padX={20}
      padY={20}
      style={{
        ...s.focusCard,
        borderInlineStartColor: accent,
        borderInlineStartWidth: 4,
        borderInlineStartStyle: "solid",
      }}
    >
      <header style={s.focusHead}>
        <div style={s.focusTitleBlock}>
          <h3 style={s.focusTitle}>{area.name}</h3>
          <StatusChip chip={area.statusChip} />
        </div>
        <div style={s.focusScore} aria-label={`Adherence ${area.score} percent — ${band.label}`}>
          <span style={{ ...s.focusScoreVal, color: band.fg }}>
            {area.score}<span style={s.focusScoreUnit}>%</span>
          </span>
          <span style={{ ...s.focusScoreBand, color: band.fg }}>
            <span style={{ ...s.toneDot, background: band.fg }} aria-hidden="true" />
            {band.label}
          </span>
        </div>
      </header>

      <FocusSubBlock
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
      </FocusSubBlock>

      <FocusSubBlock
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
      </FocusSubBlock>
    </Card>
  );
}

function FocusSubBlock({ label, sample, accent, children }) {
  return (
    <div style={{ ...s.focusSub, borderInlineStartColor: accent }}>
      <div style={s.focusSubHead}>
        <span style={s.focusSubLabel}>{label}</span>
        {sample && <span style={s.focusSubSample}>{sample}</span>}
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

// ---- Coaching actions -------------------------------------------------

function ActionsBlock({ data, edits, onEdit }) {
  return (
    <Section id="actions" eyebrow="Coaching actions">
      <h2 style={s.h2}>This week's 1:1</h2>

      <div style={s.reinforceBlock}>
        <div style={s.reinforceLabelRow}>
          <Sparkles size={16} color="var(--color-icon-tertiary-fg)" aria-hidden="true" />
          <span style={s.reinforceLabel}>Reinforcement</span>
        </div>
        <CoachingBriefEditable
          value={edits["actions.subject"] ?? data.reinforcementSubject}
          onChange={(v) => onEdit("actions.subject", v)}
          editor={data.lastUpdatedBy}
          label="reinforcement subject"
          variant="headline"
        />
        <CoachingBriefEditable
          value={edits["actions.reinforcement"] ?? data.reinforcementNarrative}
          onChange={(v) => onEdit("actions.reinforcement", v)}
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

      <div style={s.readingColumn}>
        <CoachingBriefEditable
          value={edits["actions.closing"] ?? data.closingNarrative}
          onChange={(v) => onEdit("actions.closing", v)}
          editor={data.lastUpdatedBy}
          label="closing narrative"
        />
      </div>
    </Section>
  );
}

// ---- Section frame ----------------------------------------------------

function Section({ id, eyebrow, children }) {
  return (
    <Card padX={32} padY={32} shadow>
      <section id={`cb-${id}`} style={s.section}>
        <span style={s.sectionEyebrow}>{eyebrow}</span>
        {children}
      </section>
    </Card>
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

const FOCUS_ACCENT = {
  primary: "var(--color-button-primary-bg)",
  neutral: "var(--color-divider-card)",
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

  // Body
  body: {
    display: "flex",
    alignItems: "flex-start",
    gap: 24,
    width: "100%",
  },

  // TOC
  tocWrap: {
    width: 220,
    flexShrink: 0,
    position: "sticky",
    top: 16,
    alignSelf: "flex-start",
  },
  tocCard: {},
  tocTitle: {
    display: "block",
    padding: "8px 12px",
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    fontWeight: 700,
    color: "var(--color-text-tertiary)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  tocList: { display: "flex", flexDirection: "column", gap: 2 },
  tocBtn: {
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
    fontWeight: 500,
    textAlign: "left",
    transition: "background 150ms ease, color 150ms ease",
  },
  tocLabel: { flex: 1, minWidth: 0 },

  // Article
  article: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 16 },

  // Section
  section: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
    scrollMarginTop: 16,
  },
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
    fontSize: 32,
    fontWeight: 700,
    lineHeight: "40px",
    color: "var(--color-text-deep)",
    letterSpacing: "-0.2px",
  },
  heroLede: {
    margin: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 16,
    fontWeight: 400,
    lineHeight: "26px",
    color: "var(--color-text-medium)",
  },

  h2: {
    margin: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 22,
    fontWeight: 700,
    lineHeight: "30px",
    color: "var(--color-text-deep)",
    letterSpacing: "-0.1px",
  },
  h2Lede: {
    margin: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 15,
    fontWeight: 400,
    lineHeight: "24px",
    color: "var(--color-text-medium)",
    maxWidth: 720,
  },

  readingColumn: { maxWidth: 720 },

  // KPI strip
  kpiStrip: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 12,
    padding: 0,
    margin: 0,
    listStyle: "none",
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
  tableDeltaCell: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    justifyContent: "flex-end",
  },
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

  // Focus grid
  focusGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 16,
  },
  focusCard: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  focusHead: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  focusTitleBlock: { display: "flex", flexDirection: "column", gap: 6, flex: 1, minWidth: 0 },
  focusTitle: {
    margin: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 16,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    letterSpacing: "0.1px",
  },
  focusScore: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 2,
    flexShrink: 0,
  },
  focusScoreVal: {
    fontFamily: "var(--font-sans)",
    fontSize: 26,
    fontWeight: 700,
    lineHeight: 1,
    letterSpacing: "-0.3px",
  },
  focusScoreUnit: { fontSize: 14, fontWeight: 700, marginLeft: 1 },
  focusScoreBand: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    fontWeight: 600,
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
  focusSub: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    paddingInlineStart: 16,
    borderInlineStartWidth: 3,
    borderInlineStartStyle: "solid",
  },
  focusSubHead: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 8,
  },
  focusSubLabel: {
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    letterSpacing: "0.1px",
  },
  focusSubSample: {
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

  // Actions
  reinforceBlock: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    padding: 20,
    background: "var(--color-card-emoji-bg)",
    border: "1px solid var(--color-border-card-soft)",
    borderRadius: 12,
    maxWidth: 720,
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
};
