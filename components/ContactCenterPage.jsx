"use client";

import React from "react";
import Card from "./Card";
import StatCard from "./StatCard";
import Button from "./Button";
import HeaderCard from "./HeaderCard";
import Pagination from "./Pagination";

const SPARKLINE_DATA = [60, 62, 58, 64, 66, 68, 70, 72, 75, 78, 80, 82];

// Per-skill gradient mapping exported from Figma. New visual treatment
// surfaced as a flag — should be promoted to a tokenized asset set
// once design confirms the canonical icon shapes.
const SKILL_GRADIENTS = {
  "building-rapport":        "linear-gradient(133.41deg, #EC4899 -3.98%, #F43F5E 114.7%)",
  "demonstrating-ownership": "linear-gradient(133.41deg, #06B6D4 -3.98%, #3B82F6 114.7%)",
  "communicating-clearly":   "linear-gradient(133.41deg, #8B5CF6 -3.98%, #D946EF 114.7%)",
  "overcoming-objections":   "linear-gradient(133.41deg, #6366F1 -3.98%, #8B5CF6 114.7%)",
  "closing-sale":            "linear-gradient(133.41deg, #F43F5E -3.98%, #F97316 114.7%)",
};

const SKILLS = [
  { id: "building-rapport",        name: "Building rapport",        interactions: 14870, strength: 47, change:  -4 },
  { id: "demonstrating-ownership", name: "Demonstrating ownership", interactions: 12023, strength: 53, change:  -4 },
  { id: "communicating-clearly",   name: "Communicating clearly",   interactions: 10000, strength: 48, change:   4 },
  { id: "overcoming-objections",   name: "Overcoming objections",   interactions: 15010, strength: 32, change:   3 },
  { id: "closing-sale",            name: "Closing sale",            interactions: 20000, strength: 62, change: -16 },
];

const PAGE_SIZE = 5;
const DEFAULT_DATE = "Last 7 days";

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function rangeLabel({ start, end }) {
  const sameYear = start.getFullYear() === end.getFullYear();
  const sameMonth = sameYear && start.getMonth() === end.getMonth();
  if (sameMonth) return `${start.getDate()}–${end.getDate()} ${MONTHS_SHORT[start.getMonth()]} ${end.getFullYear()}`;
  if (sameYear) return `${start.getDate()} ${MONTHS_SHORT[start.getMonth()]} – ${end.getDate()} ${MONTHS_SHORT[end.getMonth()]} ${end.getFullYear()}`;
  return `${start.getDate()} ${MONTHS_SHORT[start.getMonth()]} ${start.getFullYear()} – ${end.getDate()} ${MONTHS_SHORT[end.getMonth()]} ${end.getFullYear()}`;
}

export default function ContactCenterPage({ onToggleFilters }) {
  const [dateValue, setDateValue] = React.useState(DEFAULT_DATE);
  const [comparison, setComparison] = React.useState(null);
  const [page, setPage] = React.useState(1);

  const totalPages = Math.max(1, Math.ceil(SKILLS.length / PAGE_SIZE));
  const pageRows = SKILLS.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleApplyCompare = (primary, compare) => {
    setComparison({
      primary: { label: rangeLabel(primary), count: 10000 },
      compared: { label: rangeLabel(compare), count: 10400 },
    });
  };

  const handleDismissCompare = () => {
    setComparison(null);
    setDateValue(DEFAULT_DATE);
  };

  return (
    <>
      <HeaderCard
        onFilterToggle={onToggleFilters}
        dateValue={dateValue}
        onDateChange={setDateValue}
        onApplyCompare={handleApplyCompare}
      />

      {comparison && (
        <ComparisonBanner
          primary={comparison.primary}
          compared={comparison.compared}
          onDismiss={handleDismissCompare}
        />
      )}

      <StatCard
        size="lg"
        label={
          <span style={pageStyles.kpiLabel}>
            Total Interactions
            <InfoIcon
              tooltip="Total customer interactions in the selected period."
              align="center"
            />
          </span>
        }
        value={
          <span style={pageStyles.kpiValueRow}>
            <span>{(10000).toLocaleString()}</span>
            <DeltaPill value={4} small />
          </span>
        }
        trailing={<Sparkline data={SPARKLINE_DATA} />}
      />

      <SkillTable
        rows={pageRows}
        totalCount={SKILLS.length}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </>
  );
}

function ComparisonBanner({ primary, compared, onDismiss }) {
  return (
    <Card padX={16} padY={14} style={cbStyles.card}>
      <div style={cbStyles.row}>
        <div style={cbStyles.textCol}>
          <div style={cbStyles.label}>
            Compare Periods
            <InfoIcon
              tooltip="Two periods being compared side by side."
              align="right"
            />
          </div>
          <div style={cbStyles.legendRow}>
            <span>
              <span style={cbStyles.legendKey}>Primary</span>{" "}
              {primary.label} ({primary.count.toLocaleString()} interactions)
            </span>
            <span>
              <span style={cbStyles.legendKey}>Compared</span>{" "}
              {compared.label} ({compared.count.toLocaleString()} interactions)
            </span>
          </div>
        </div>
        <Button
          variant="icon"
          size="sm"
          aria-label="Dismiss comparison"
          onClick={onDismiss}
        >
          <span className="material-symbols-outlined" style={cbStyles.closeIcon}>close</span>
        </Button>
      </div>
    </Card>
  );
}

function SkillTable({ rows, totalCount, page, totalPages, onPageChange }) {
  return (
    <Card padX={0} padY={0}>
      <div style={tStyles.heading}>
        <div style={tStyles.title}>Skill Proficiency Index</div>
        <div style={tStyles.subtitle}>Agent strengths across key performance areas</div>
      </div>
      <div style={tStyles.headerRow}>
        <div style={{ ...tStyles.th, ...tStyles.colTitle }}>Title</div>
        <div style={{ ...tStyles.th, ...tStyles.colInteractions }}>
          <span>Interactions</span>
          <span className="material-symbols-outlined" style={tStyles.sortIcon}>arrow_upward</span>
        </div>
        <div style={{ ...tStyles.th, ...tStyles.colStrength }}>
          <span>Strength rate</span>
          <span className="material-symbols-outlined" style={tStyles.sortIcon}>arrow_upward</span>
        </div>
        <div style={{ ...tStyles.th, ...tStyles.colChange }}>
          <span>Change %</span>
          <InfoIcon
            tooltip="Period-over-period change in strength rate."
            align="left"
          />
        </div>
      </div>
      {rows.map((row) => (
        <div key={row.id} style={tStyles.bodyRow}>
          <div style={{ ...tStyles.td, ...tStyles.colTitle, gap: 12 }}>
            <SkillIcon id={row.id} />
            <span style={tStyles.skillName}>{row.name}</span>
          </div>
          <div style={{ ...tStyles.td, ...tStyles.colInteractions }}>
            <span style={tStyles.cellText}>{row.interactions.toLocaleString()}</span>
          </div>
          <div style={{ ...tStyles.td, ...tStyles.colStrength }}>
            <StrengthRateBar value={row.strength} />
          </div>
          <div style={{ ...tStyles.td, ...tStyles.colChange }}>
            <DeltaPill value={row.change} small />
          </div>
        </div>
      ))}
      <Pagination
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        onPageChange={onPageChange}
        noun="Skills"
      />
    </Card>
  );
}

function Sparkline({ data, width = 90, height = 36 }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  const points = data
    .map((v, i) => `${i * stepX},${height - ((v - min) / range) * height}`)
    .join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <polygon
        points={`0,${height} ${points} ${width},${height}`}
        fill="var(--color-primary-alpha-12)"
      />
      <polyline points={points} fill="none" stroke="var(--color-button-primary-bg)" strokeWidth="2" />
    </svg>
  );
}

function SkillIcon({ id }) {
  const bg = SKILL_GRADIENTS[id] || SKILL_GRADIENTS["building-rapport"];
  return <div style={{ ...iconStyles.skill, background: bg }} aria-hidden="true" />;
}

function StrengthRateBar({ value }) {
  const color =
    value < 50 ? "var(--color-error)" :
    value < 80 ? "var(--color-warning)" :
                 "var(--color-success)";
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div style={barStyles.wrap}>
      <span style={barStyles.value}>{value}%</span>
      <div style={barStyles.track}>
        <div style={{ ...barStyles.fill, width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

// Clamps wildly large deltas to a readable range so mock anomalies
// (e.g. "↓ 2452%") don't blow up the layout. Real data should be
// validated upstream.
function DeltaPill({ value, small = false }) {
  const clamped = Math.max(-999, Math.min(999, value));
  const isPositive = clamped >= 0;
  return (
    <span style={{
      ...pillStyles.pill,
      padding: small ? "2px 6px" : "4px 8px",
      fontSize: small ? 11 : 12,
      background: isPositive ? "var(--color-success-bg)" : "var(--color-error-bg)",
      color: isPositive ? "var(--color-success)" : "var(--color-error)",
    }}>
      <span style={{ fontSize: small ? 10 : 12, lineHeight: 1 }}>{isPositive ? "↑" : "↓"}</span>
      <span>{Math.abs(clamped)}%</span>
    </span>
  );
}

// InfoIcon — hoverable / focusable ⓘ that anchors a fixed-positioned tooltip.
// Mirrors the ChartTooltip positioning approach from AdherenceRateChart.jsx
// (also reused by InteractionsPage's SkillsPopover): tooltip is rendered
// in a fixed layer, placed from the trigger's getBoundingClientRect.
//
// align controls horizontal anchoring relative to the trigger:
//   "center" — under the trigger, centered (Total Interactions)
//   "right"  — under the trigger, growing right (Compare Periods)
//   "left"   — under the trigger, growing left  (Change %)
let infoTipSeq = 0;
function InfoIcon({ tooltip, align = "center" }) {
  const [open, setOpen] = React.useState(false);
  const [rect, setRect] = React.useState(null);
  const triggerRef = React.useRef(null);
  const openTimer = React.useRef(null);
  const tipId = React.useMemo(() => `info-tip-${++infoTipSeq}`, []);

  const show = React.useCallback(() => {
    if (openTimer.current) clearTimeout(openTimer.current);
    openTimer.current = setTimeout(() => {
      if (triggerRef.current) setRect(triggerRef.current.getBoundingClientRect());
      setOpen(true);
    }, 150);
  }, []);

  const hide = React.useCallback(() => {
    if (openTimer.current) { clearTimeout(openTimer.current); openTimer.current = null; }
    setOpen(false);
  }, []);

  React.useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  React.useEffect(() => () => {
    if (openTimer.current) clearTimeout(openTimer.current);
  }, []);

  return (
    <>
      <span
        ref={triggerRef}
        role="button"
        tabIndex={0}
        aria-label={tooltip}
        aria-describedby={open ? tipId : undefined}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        className="material-symbols-outlined"
        style={iconStyles.info}
      >
        info
      </span>
      {open && rect && <InfoTooltip id={tipId} rect={rect} align={align}>{tooltip}</InfoTooltip>}
    </>
  );
}

function InfoTooltip({ id, rect, align, children }) {
  const TIP_W = 240;
  const GUTTER = 8;
  const viewportW = typeof window !== "undefined" ? window.innerWidth : 1440;
  let left;
  if (align === "right") left = rect.left;
  else if (align === "left") left = rect.right - TIP_W;
  else left = rect.left + rect.width / 2 - TIP_W / 2;
  left = Math.max(GUTTER, Math.min(left, viewportW - TIP_W - GUTTER));
  const top = rect.bottom + GUTTER;

  return (
    <div
      id={id}
      role="tooltip"
      style={{
        position: "fixed",
        left,
        top,
        width: TIP_W,
        zIndex: 1000,
        pointerEvents: "none",
      }}
    >
      <Card shadow padX={12} padY={10}>
        <div style={iconStyles.tipText}>{children}</div>
      </Card>
    </div>
  );
}

const pageStyles = {
  kpiLabel: { display: "inline-flex", alignItems: "center", gap: 4 },
  kpiValueRow: { display: "inline-flex", alignItems: "baseline", gap: 8 },
};

const cbStyles = {
  card: { background: "var(--color-card-emoji-bg)", borderRadius: 8 },
  row: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 },
  textCol: { display: "flex", flexDirection: "column", gap: 4, flex: 1 },
  label: {
    display: "inline-flex", alignItems: "center", gap: 4,
    fontFamily: '"Poppins", sans-serif', fontSize: 12, fontWeight: 600,
    color: "var(--color-text-tertiary)", letterSpacing: "0.04em",
  },
  legendRow: {
    display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap",
    fontFamily: '"Poppins", sans-serif', fontSize: 14,
    color: "var(--color-text-tertiary)",
  },
  legendKey: { fontWeight: 600, color: "var(--color-text-medium)" },
  closeIcon: {
    fontSize: 18, color: "var(--color-text-medium)",
    fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20",
  },
};

const tStyles = {
  heading: { padding: "24px 24px 16px", borderBottom: "1px solid #EFEFFF" },
  title: {
    fontFamily: '"Poppins", sans-serif', fontSize: 16, fontWeight: 500,
    color: "#1B1B1F", lineHeight: 1.5,
  },
  subtitle: {
    fontFamily: '"Poppins", sans-serif', fontSize: 14,
    color: "var(--color-text-tertiary)", marginTop: 4,
  },
  headerRow: {
    display: "flex", alignItems: "center",
    background: "#FCFBFF",
    borderBottom: "1px solid var(--color-border-tab)",
  },
  th: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "8px 0",
    fontFamily: '"Poppins", sans-serif', fontSize: 12, fontWeight: 400,
    color: "var(--color-text-deep)",
  },
  sortIcon: {
    fontSize: 12, color: "var(--color-text-tertiary)",
    fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20",
  },
  bodyRow: {
    display: "flex", alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid #F1F5F9",
  },
  td: {
    display: "flex", alignItems: "center",
  },
  colTitle:        { width: "42%", paddingLeft: 24, paddingRight: 12 },
  colInteractions: { width: "14%", paddingRight: 12 },
  colStrength:     { width: "32%", paddingRight: 24 },
  colChange:       { width: "12%", paddingLeft: 12, paddingRight: 12 },
  skillName: {
    fontFamily: '"Poppins", sans-serif', fontSize: 14,
    color: "var(--color-text-deep)",
  },
  cellText: {
    fontFamily: '"Poppins", sans-serif', fontSize: 14,
    color: "var(--color-text-deep)",
  },
};

const barStyles = {
  wrap: { display: "flex", flexDirection: "column", gap: 4, width: "100%", maxWidth: 272 },
  value: {
    fontFamily: '"Poppins", sans-serif', fontSize: 14, fontWeight: 500,
    color: "var(--color-text-medium)",
  },
  track: {
    width: "100%", height: 8, background: "#F1F5F9",
    borderRadius: 100, overflow: "hidden",
  },
  fill: { height: 8, borderRadius: 100, transition: "width 200ms ease" },
};

const pillStyles = {
  pill: {
    display: "inline-flex", alignItems: "center", gap: 4,
    borderRadius: 4,
    fontFamily: '"Poppins", sans-serif', fontWeight: 600, lineHeight: 1,
  },
};

const iconStyles = {
  skill: { width: 24, height: 24, borderRadius: 4, flexShrink: 0 },
  info: {
    fontSize: 12,
    color: "var(--color-text-tertiary)",
    cursor: "help",
    display: "inline-flex",
    alignItems: "center",
    outline: "none",
    fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20",
  },
  tipText: {
    fontFamily: '"Poppins", sans-serif',
    fontSize: 12,
    lineHeight: 1.45,
    color: "var(--color-text-medium)",
  },
};
