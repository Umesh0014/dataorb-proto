"use client";

import React from "react";
import { ChevronRight, ChevronDown, Info, ArrowUp, ArrowDown, Download, RefreshCw, AlertTriangle, MoreHorizontal, Target, TrendingUp } from "lucide-react";
import Card from "./Card";
import TabsRow from "./TabsRow";
import CircularProgress from "./CircularProgress";
import {
  HERO, KPIS, KPI_PAGINATION, AI_ARTIFACTS,
  CONVERSATION_FLOW, INTERACTION_EVENTS, COACHING_PRIORITY,
  SENTIMENT, OBJECTIONS,
  CONTACT_OUTCOME, QUALITY_ADHERENCE, PAGE_FILTERS,
  KPI_V1_MASTERS, KPI_STATUS_LEGEND, KPI_V1_NBAS,
  KPI_V2_ALL, KPI_V3_ATTENTION, KPI_V3_CALM,
} from "./mocks/collectionHub";

// CollectionHubPage — Collection Insights hub (Experience B).
// Pixel-perfect from the Figma "Collection Insights" frame. Reuses the
// same section-card + chart vocabulary as the Contact Center page so both
// experiences read as siblings, not alien pages.
//
// Sections:
//   0. Page header row (title + filter pills)
//   1. Hero stat — Total Calls + sparkline
//   2. KPIs and Goals — 3 KPI cards + pagination
//   3. AI Artifacts — 3 gradient artifact cards
//   4. Conversation Flow Analysis — horizontal stacked bars
//   5. Customer Sentiment Analysis — multi-series line chart
//   6. Customer Objections — vertical stacked bar chart
//   7. Contact Outcome — donut + breakdown table
//   8. Quality Adherence — trend line chart

export default function CollectionHubPage() {
  return (
    <>
      <CollectionHeader />
      <HeroCard />
      <KPIsAndGoalsCard />
      <AIArtifactsCard />
      <ConversationFlowCard />
      <SentimentCard />
      <ObjectionsCard />
      <ContactOutcomeCard />
      <QualityAdherenceCard />
    </>
  );
}

// ---- 0. Page header -------------------------------------------------------

function CollectionHeader() {
  return (
    <Card padX={0} padY={0} style={chStyles.headerCard}>
      <div style={chStyles.headerPrimary}>
        <div style={chStyles.headerLeft}>
          <div style={chStyles.headerIcon}>
            <svg width={16} height={16} viewBox="0 0 20 20" fill="none">
              <path d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14.4A6.4 6.4 0 1 1 10 3.6a6.4 6.4 0 0 1 0 12.8z" fill="#6650A5" />
              <path d="M10 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm0 3.5c-.55 0-1 .45-1 1V14c0 .55.45 1 1 1s1-.45 1-1v-3.5c0-.55-.45-1-1-1z" fill="#6650A5" />
            </svg>
          </div>
          <div style={chStyles.headerTitleRow}>
            <span style={chStyles.headerTitle}>Collection Insights</span>
            <ChevronDown size={18} color="#2C2F42" />
          </div>
        </div>
      </div>
      <div style={chStyles.headerSecondary}>
        <div style={chStyles.filterRow}>
          {Object.values(PAGE_FILTERS).map((f) => (
            <button key={f.label} type="button" style={chStyles.filterPill}>
              <span style={chStyles.filterLabel}>{f.label}</span>
              <span style={chStyles.filterValue}>{f.value}</span>
              <ChevronDown size={18} color="#2C2F42" />
            </button>
          ))}
          <div style={chStyles.filterDivider} />
          <button type="button" style={chStyles.filterIconBtn}>
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M7 12h10M10 18h4" stroke="#2C2F42" strokeWidth={2} strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </Card>
  );
}

// ---- 1. Hero — Total Calls ------------------------------------------------

function HeroCard() {
  return (
    <Card padX={24} padY={24} style={chStyles.heroCard}>
      <div style={chStyles.heroLeft}>
        <div style={chStyles.heroLabelRow}>
          <span style={chStyles.heroLabel}>{HERO.label}</span>
          <Info size={16} color="#5B5E6F" />
        </div>
        <span style={chStyles.heroValue}>{HERO.value}</span>
      </div>
      <MiniSparkline data={HERO.sparkline} width={378} height={42} color="#006DAA" />
    </Card>
  );
}

function MiniSparkline({ data, width, height, color }) {
  const max = Math.max(...data);
  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - (v / max) * height * 0.85,
  }));
  const line = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const area = `${line} L ${width} ${height} L 0 ${height} Z`;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", maxWidth: width, height: "auto" }}>
      <defs>
        <linearGradient id="heroFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#heroFill)" />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ---- 2. KPIs and Goals ----------------------------------------------------
// Version switcher: V0 = original 3-up tiles + pagination (untouched),
// V1 = master-KPI grouping (no pagination, worst-child rollup).
// KpiVersionRail mirrors MilestoneSideRail visuals exactly — same dark
// pill, yellow active chip, info icon. Separate component because
// MilestoneSideRail has hardcoded milestone data; flag for Umesh.

const KPI_VERSIONS = [
  { id: "v0", label: "V0", title: "Current — paginated KPI tiles" },
  { id: "v1", label: "V1", title: "Master KPI grouping view" },
  { id: "v2", label: "V2", title: "Attention-ranked triage" },
  { id: "v3", label: "V3", title: "Activity rings + attention cards" },
];

function KPIsAndGoalsCard() {
  const [version, setVersion] = React.useState("v0");
  return (
    <div style={kpiSectionStyles.wrap}>
      <div style={kpiSectionStyles.cardArea}>
        {version === "v0" && <KPIsV0 />}
        {version === "v1" && <KPIsV1 />}
        {version === "v2" && <KPIsV2 />}
        {version === "v3" && <KPIsV3 />}
      </div>
      <div style={kpiSectionStyles.railMount}>
        <div style={kpiSectionStyles.railSticky}>
          <KpiVersionRail value={version} onChange={setVersion} />
        </div>
      </div>
    </div>
  );
}

// V0 — untouched original
function KPIsV0() {
  return (
    <SectionCard title="KPI's and Goals" subtitle="Track how agents and system performs">
      <div style={chStyles.kpiRow}>
        {KPIS.map((kpi) => (
          <KPITile key={kpi.id} kpi={kpi} />
        ))}
      </div>
      <div style={chStyles.kpiPagination}>
        <span style={chStyles.kpiPagLabel}>Total {KPI_PAGINATION.total} KPI's</span>
        <div style={chStyles.kpiPagRight}>
          <span style={chStyles.kpiPagLabel}>Page {KPI_PAGINATION.current} of 2</span>
          <ChevronRight size={20} color="#5B5E6F" />
        </div>
      </div>
    </SectionCard>
  );
}

// V1 — master-KPI grouping: 3-up cards with radial ring, shared detail
// region below, and Next Best Actions section.
function KPIsV1() {
  const [expandedId, setExpandedId] = React.useState(null);

  // Sort worst-first
  const sorted = [...KPI_V1_MASTERS].sort((a, b) => {
    const worstRank = (children) => {
      const ranks = { "On Track": 0, "Nearly There": 1, "Needs Attention": 2, "Critical": 3 };
      return Math.max(...children.map((c) => ranks[c.status.label] ?? 0));
    };
    return worstRank(b.children) - worstRank(a.children);
  });

  const expandedMaster = sorted.find((m) => m.id === expandedId);

  return (
    <Card padX={0} padY={0} style={chStyles.sectionCard}>
      <div style={chStyles.sectionHeader}>
        <div style={chStyles.sectionTitleBlock}>
          <span style={chStyles.sectionTitle}>KPI's and Goals</span>
          <span style={chStyles.sectionSubtitle}>Master KPI grouping — worst-child rollup</span>
        </div>
      </div>
      <div style={chStyles.sectionBody}>
        <StatusLegend />
        <div style={v1Styles.mastersRow}>
          {sorted.map((master) => (
            <MasterKPICard
              key={master.id}
              master={master}
              expanded={expandedId === master.id}
              onToggle={() => setExpandedId((prev) => (prev === master.id ? null : master.id))}
            />
          ))}
        </div>
        {expandedMaster && <MasterDetailRegion master={expandedMaster} />}
        <KpiNbaSection />
      </div>
    </Card>
  );
}

// Status legend
function StatusLegend() {
  return (
    <div style={v1Styles.legendRow}>
      <span style={v1Styles.legendLabel}>Status:</span>
      {KPI_STATUS_LEGEND.map((s) => (
        <span key={s.label} style={v1Styles.legendChip}>
          <span style={{ ...v1Styles.legendDot, background: s.zone }} />
          <span style={{ ...v1Styles.legendText, color: s.color }}>{s.label}</span>
        </span>
      ))}
    </div>
  );
}

// Helpers — worst-child rollup
const STATUS_RANKS = { "On Track": 0, "Nearly There": 1, "Needs Attention": 2, "Critical": 3 };
function rollup(master) {
  const worst = master.children.reduce((w, c) =>
    (STATUS_RANKS[c.status.label] ?? 0) > (STATUS_RANKS[w.status.label] ?? 0) ? c : w
  , master.children[0]);
  const status = worst.status;
  const onTrack = master.children.filter((c) => c.status.label === "On Track").length;
  const zone = KPI_STATUS_LEGEND.find((s) => s.label === status.label) || KPI_STATUS_LEGEND[0];
  return { status, onTrack, zone };
}

// Ring color mapped from zone — reuses severity palette
function ringColorForZone(zone) {
  const map = { "#34D399": "#10B981", "#FBBF24": "#F59E0B", "#F87171": "#EF4444", "#EF4444": "#DC2626" };
  return map[zone.zone] || "#94A3B8";
}

// Master KPI card — 3-up, radial ring + status + description + chevron
function MasterKPICard({ master, expanded, onToggle }) {
  const { status, onTrack, zone } = rollup(master);
  const ChevronIcon = expanded ? ChevronDown : ChevronRight;

  return (
    <div style={{ ...v1Styles.masterCard, borderLeft: `4px solid ${zone.zone}` }}>
      <div style={v1Styles.masterTop}>
        <div style={v1Styles.ringCol}>
          <div style={v1Styles.ringWrap}>
            <CircularProgress
              pct={master.score}
              size={64}
              stroke={6}
              ringColor={ringColorForZone(zone)}
              trackColor="#F1F5F9"
              label={false}
            />
            <div style={v1Styles.ringCenter}>
              <span style={v1Styles.ringScore}>{master.score}</span>
            </div>
          </div>
        </div>
        <div style={v1Styles.masterMeta}>
          <span style={v1Styles.masterName}>{master.name}</span>
          <span style={v1Styles.masterDesc}>{master.description}</span>
        </div>
      </div>
      <div style={v1Styles.masterBottom}>
        <span style={{ ...v1Styles.masterStatusBadge, background: zone.bg, color: status.color }}>
          {status.label}
        </span>
        <span style={v1Styles.masterSummary}>
          {onTrack} of {master.children.length} on track
        </span>
      </div>
      <button
        type="button"
        style={v1Styles.expandBtn}
        onClick={onToggle}
        aria-expanded={expanded}
        aria-label={`${expanded ? "Collapse" : "Expand"} ${master.name} detail`}
      >
        <ChevronIcon size={18} color="#5B5E6F" />
      </button>
    </div>
  );
}

// Detail region — child KPIs shown below the 3-up row when a master is expanded
function MasterDetailRegion({ master }) {
  const { zone } = rollup(master);
  return (
    <div style={{ ...v1Styles.detailRegion, borderLeft: `4px solid ${zone.zone}` }}>
      <span style={v1Styles.detailTitle}>{master.name} — Detail</span>
      <div style={v1Styles.childHeader}>
        <span style={{ ...v1Styles.childHeaderCell, flex: "1 1 0" }}>KPI</span>
        <span style={{ ...v1Styles.childHeaderCell, flex: "0 0 80px" }}>Value</span>
        <span style={{ ...v1Styles.childHeaderCell, flex: "0 0 68px" }}>Trend</span>
        <span style={{ ...v1Styles.childHeaderCell, flex: "0 0 120px" }}>Target / Gap</span>
        <span style={{ ...v1Styles.childHeaderCell, flex: "0 0 110px" }}>Status</span>
      </div>
      {master.children.map((child) => (
        <ChildKPIRow key={child.id} child={child} />
      ))}
    </div>
  );
}

// Child KPI row — value + descriptor, trend chip, target + gap, status
function ChildKPIRow({ child }) {
  const trendUp = child.trend.direction === "up";
  const TrendIcon = trendUp ? ArrowUp : ArrowDown;
  const trendBg = child.trend.tone === "success" ? "#F0FDF4" : "#FEF2F2";
  const trendColor = child.trend.tone === "success" ? "#00711D" : "#BA1A1A";
  const gapSign = child.gap > 0 ? "+" : "";
  const gapColor = child.gap >= 0 ? "#00711D" : "#BA1A1A";

  return (
    <div style={v1Styles.childRow}>
      <div style={{ ...v1Styles.childCell, flex: "1 1 0" }}>
        <span style={v1Styles.childLabel}>{child.label}</span>
        {child.descriptor && <span style={v1Styles.childDesc}>{child.descriptor}</span>}
      </div>
      <span style={{ ...v1Styles.childCell, flex: "0 0 80px", fontWeight: 600, color: "#000" }}>
        {child.value}
      </span>
      <div style={{ ...v1Styles.childCell, flex: "0 0 68px" }}>
        <span style={{ ...chStyles.trendPill, background: trendBg }}>
          <TrendIcon size={12} color={trendColor} />
          <span style={{ ...chStyles.trendDelta, color: trendColor }}>{child.trend.delta}</span>
        </span>
      </div>
      <div style={{ ...v1Styles.childCell, flex: "0 0 120px" }}>
        <span style={v1Styles.targetText}>{child.target}%</span>
        <span style={{ ...v1Styles.gapText, color: gapColor }}>{gapSign}{child.gap}pp</span>
      </div>
      <div style={{ ...v1Styles.childCell, flex: "0 0 110px" }}>
        <span style={{ ...v1Styles.childStatusBadge, color: child.status.color }}>
          {child.status.label}
        </span>
      </div>
    </div>
  );
}

// NBA section — mirrors NextBestActions NbaCard visual pattern with
// collection-hub-specific data. Not importing NextBestActions directly
// (hardcoded to Agent Profile mock); matching the pattern inline instead.
function KpiNbaSection() {
  return (
    <div style={nbaS.wrap}>
      <div style={nbaS.header}>
        <span style={nbaS.headerLabel}>Next best actions</span>
      </div>
      <div style={nbaS.rail}>
        {KPI_V1_NBAS.map((card) => (
          <KpiNbaCard key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}

// Action icon mapping — matches NextBestActions ACTION_ICON
const NBA_ICON = { "Assign drill": Target, "Assign course": Target };

function KpiNbaCard({ card }) {
  const Icon = NBA_ICON[card.action.type] || Target;
  const PRIORITY_TONES = {
    critical: { bg: "#FEF2F2", fg: "#BA1A1A" },
    recommended: { bg: "#FFFBEB", fg: "#B57E12" },
    opportunity: { bg: "#EFF6FF", fg: "#1D4ED8" },
  };
  const pr = PRIORITY_TONES[card.priority] || PRIORITY_TONES.recommended;

  return (
    <Card padX={20} padY={20} shadow style={nbaS.card}>
      <div style={nbaS.topGroup}>
        <span style={{ ...nbaS.chip, background: pr.bg, color: pr.fg }}>
          {card.priority.charAt(0).toUpperCase() + card.priority.slice(1)}
        </span>
        <div style={nbaS.cardTitle}>{card.title}</div>
        <div style={nbaS.evidence}>{card.evidence}</div>
      </div>
      <div style={nbaS.drillBlock}>
        <div style={nbaS.drillRow}>
          <span style={nbaS.drillTitle}>
            <Icon size={14} style={{ flexShrink: 0, color: "#5B5E6F" }} />
            <span style={nbaS.assetName}>{card.action.asset}</span>
          </span>
          <span style={nbaS.durationChip}>{card.action.duration}</span>
        </div>
        <span style={nbaS.drillDesc}>
          <TrendingUp size={12} style={{ flexShrink: 0, marginTop: 2, color: "#60A5FA" }} />
          {card.outcome}
        </span>
        <span style={nbaS.basisText}>{card.basis}</span>
      </div>
      <div style={nbaS.ctaRow}>
        <button type="button" style={nbaS.assignBtn}>Assign</button>
        <button type="button" style={nbaS.kebabBtn} aria-label="More actions">
          <MoreHorizontal size={16} />
        </button>
      </div>
    </Card>
  );
}

// ---- V2: At risk / On track categories -----------------------------------
// Two named category groups with colour washes. At-risk = below target
// (red wash), On track = meeting/above (green wash), No data = neutral.
// Critical at-risk cards get 2px accent; rest get standard 0.5px border.
// Fix uses typed Learning Hub assets: Mission / Guide / Probe / Drill.

const FIX_ICONS = { Mission: Target, Guide: Target, Probe: Target, Drill: Target };

function KPIsV2() {
  const atRisk = KPI_V2_ALL.filter((k) => k.category === "at-risk");
  const onTrack = KPI_V2_ALL.filter((k) => k.category === "on-track");
  const noData = KPI_V2_ALL.filter((k) => k.category === "no-data");

  return (
    <Card padX={0} padY={0} style={chStyles.sectionCard}>
      <div style={chStyles.sectionHeader}>
        <div style={chStyles.sectionTitleBlock}>
          <span style={chStyles.sectionTitle}>KPI's and Goals</span>
          <span style={chStyles.sectionSubtitle}>At risk / On track — all 9 metrics</span>
        </div>
      </div>
      <div style={{ ...chStyles.sectionBody, gap: 20 }}>
        {/* At risk — red wash */}
        <div style={arS.categoryWrap}>
          <div style={arS.catHeader}>
            <span style={arS.catDot("#F87171")} />
            <span style={arS.catLabel}>At risk</span>
            <span style={arS.catCount}>{atRisk.length} metrics</span>
          </div>
          <div style={arS.atRiskWash}>
            <div style={arS.cardsGrid}>
              {atRisk.map((kpi) => (
                <AtRiskCard key={kpi.id} kpi={kpi} />
              ))}
            </div>
          </div>
        </div>

        {/* On track — green wash */}
        <div style={arS.categoryWrap}>
          <div style={arS.catHeader}>
            <span style={arS.catDot("#34D399")} />
            <span style={arS.catLabel}>On track</span>
            <span style={arS.catCount}>{onTrack.length} metrics</span>
          </div>
          <div style={arS.onTrackWash}>
            <div style={arS.cardsGrid}>
              {onTrack.map((kpi) => (
                <OnTrackCard key={kpi.id} kpi={kpi} />
              ))}
            </div>
          </div>
        </div>

        {/* No data — neutral */}
        {noData.length > 0 && (
          <div style={arS.categoryWrap}>
            <div style={arS.catHeader}>
              <span style={arS.catDot("#94A3B8")} />
              <span style={arS.catLabel}>No data</span>
            </div>
            <div style={arS.noDataWash}>
              <div style={arS.cardsGrid}>
                {noData.map((kpi) => (
                  <NoDataCard key={kpi.id} kpi={kpi} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

// At-risk card — value + gap + typed fix + Assign
function AtRiskCard({ kpi }) {
  const border = kpi.critical
    ? "2px solid #F87171"
    : "0.5px solid rgba(248,113,113,0.3)";
  const FixIcon = FIX_ICONS[kpi.fix?.type] || Target;

  return (
    <div style={{ ...arS.card, border }}>
      <div style={arS.cardHeader}>
        <span style={arS.cardName}>{kpi.label}</span>
        <span style={arS.atRiskStatus}>Needs attention</span>
      </div>
      <span style={arS.cardValue}>{kpi.value}</span>
      <span style={arS.cardTargetLine}>
        target {kpi.target}% · <span style={arS.gapText}>{kpi.gapLabel}</span>
      </span>
      {kpi.trend && (
        <div style={arS.trendRow}>
          {kpi.trend.direction === "up"
            ? <ArrowUp size={12} color={kpi.trend.tone === "success" ? "#00711D" : "#BA1A1A"} />
            : <ArrowDown size={12} color={kpi.trend.tone === "success" ? "#00711D" : "#BA1A1A"} />}
          <span style={{ fontSize: 11, fontWeight: 600, color: kpi.trend.tone === "success" ? "#00711D" : "#BA1A1A" }}>
            {kpi.trend.delta}
          </span>
        </div>
      )}
      {kpi.fix && (
        <div style={arS.fixWrap}>
          <div style={arS.fixTypeRow}>
            <FixIcon size={13} style={{ flexShrink: 0, color: "#5B5E6F" }} />
            <span style={arS.fixType}>{kpi.fix.type}</span>
            <span style={arS.fixSep}>·</span>
            <span style={arS.fixAsset}>{kpi.fix.asset}</span>
          </div>
          {kpi.fix.cohort && <span style={arS.fixCohort}>{kpi.fix.cohort}</span>}
          <button type="button" style={arS.assignBtn}>
            Assign {kpi.fix.type.toLowerCase()}
          </button>
        </div>
      )}
    </div>
  );
}

// On-track card — calm, confirmatory
function OnTrackCard({ kpi }) {
  return (
    <div style={arS.okCard}>
      <div style={arS.cardHeader}>
        <span style={arS.cardName}>{kpi.label}</span>
        <span style={arS.onTrackStatus}>On track</span>
      </div>
      <span style={arS.okValue}>{kpi.value}</span>
      <span style={arS.okTargetLine}>
        target {kpi.target}% · {kpi.gapLabel}
      </span>
    </div>
  );
}

// No-data card — neutral
function NoDataCard({ kpi }) {
  return (
    <div style={arS.ndCard}>
      <span style={arS.ndName}>{kpi.label}</span>
      <span style={arS.ndNote}>No data this period</span>
    </div>
  );
}

// V2 At-risk / On-track styles
// Washes use lightest existing ramp tints — no new tokens.
const arS = {
  categoryWrap: { display: "flex", flexDirection: "column", gap: 8 },
  catHeader: { display: "flex", alignItems: "center", gap: 8 },
  catDot: (color) => ({
    width: 10, height: 10, borderRadius: 999, background: color, flexShrink: 0,
  }),
  catLabel: {
    fontSize: 14, fontWeight: 700, color: "#171B2C", letterSpacing: "0.1px",
    fontFamily: "var(--font-sans)",
  },
  catCount: { fontSize: 12, fontWeight: 400, color: "#5B5E6F", letterSpacing: "0.4px" },

  // Red wash — lightest existing error ramp
  atRiskWash: {
    background: "#FEF2F2", borderRadius: 14, padding: 16,
  },
  cardsGrid: {
    display: "flex", flexWrap: "wrap", gap: 12,
  },

  // At-risk card
  card: {
    flex: "1 1 calc(33.333% - 8px)", minWidth: 200, display: "flex", flexDirection: "column",
    gap: 6, padding: 16, borderRadius: 12, background: "#FFFFFF",
  },
  cardHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 },
  cardName: { fontSize: 13, fontWeight: 600, color: "#171B2C", letterSpacing: "0.1px" },
  atRiskStatus: {
    fontSize: 11, fontWeight: 700, color: "#BA1A1A", letterSpacing: "0.4px",
  },
  cardValue: {
    fontSize: 24, fontWeight: 700, color: "#000", lineHeight: 1.1,
    fontFamily: "var(--font-sans)",
  },
  cardTargetLine: { fontSize: 12, fontWeight: 400, color: "#5B5E6F", letterSpacing: "0.4px" },
  gapText: { fontWeight: 600, color: "#BA1A1A" },
  trendRow: { display: "flex", alignItems: "center", gap: 4 },

  // Fix block
  fixWrap: {
    marginTop: 4, padding: "10px 12px", background: "#FEF2F2", borderRadius: 8,
    display: "flex", flexDirection: "column", gap: 6,
  },
  fixTypeRow: { display: "flex", alignItems: "center", gap: 6 },
  fixType: { fontSize: 12, fontWeight: 700, color: "#424659", letterSpacing: "0.4px" },
  fixSep: { fontSize: 12, color: "#94A3B8" },
  fixAsset: {
    fontSize: 12, fontWeight: 500, color: "#171B2C", letterSpacing: "0.1px",
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  fixCohort: { fontSize: 11, fontWeight: 400, color: "#5B5E6F", letterSpacing: "0.4px" },
  assignBtn: {
    alignSelf: "flex-start", display: "inline-flex", alignItems: "center",
    height: 32, padding: "0 14px", border: "none", borderRadius: 999,
    background: "#004BEF", color: "#FFFFFF", fontFamily: "var(--font-sans)",
    fontSize: 12, fontWeight: 700, letterSpacing: "0.04em",
    cursor: "pointer",
  },

  // Green wash
  onTrackWash: {
    background: "#F0FDF4", borderRadius: 14, padding: 16,
  },
  okCard: {
    flex: "1 1 calc(50% - 6px)", minWidth: 200, display: "flex", flexDirection: "column",
    gap: 4, padding: 16, borderRadius: 12, background: "#FFFFFF",
  },
  onTrackStatus: {
    fontSize: 11, fontWeight: 700, color: "#00711D", letterSpacing: "0.4px",
  },
  okValue: {
    fontSize: 20, fontWeight: 600, color: "#424659", lineHeight: 1.2,
    fontFamily: "var(--font-sans)",
  },
  okTargetLine: { fontSize: 12, fontWeight: 400, color: "#5B5E6F", letterSpacing: "0.4px" },

  // No data — neutral
  noDataWash: {
    background: "#F8FAFC", borderRadius: 14, padding: 16,
  },
  ndCard: {
    flex: "1 1 auto", minWidth: 200, display: "flex", flexDirection: "column",
    gap: 4, padding: 14, borderRadius: 10, background: "#FFFFFF",
    border: "0.5px solid #E2E8F0",
  },
  ndName: { fontSize: 13, fontWeight: 500, color: "#64748B", letterSpacing: "0.1px" },
  ndNote: { fontSize: 11, fontWeight: 400, color: "#94A3B8", letterSpacing: "0.4px" },
};

// ---- V3: Activity rings + attention cards --------------------------------
// Left ~1/3: concentric three-ring donut (Reach/Recovery/QC) + legend.
// Right ~2/3: six at-risk attention cards with typed fix + Assign.
// On-track children rolled into rings; expandable via legend click.

// Ring config — outer to inner. Colours from existing severity ramp.
const RING_DEFS = [
  { masterId: "reach", label: "Reach", stroke: 14 },
  { masterId: "recovery", label: "Recovery", stroke: 12 },
  { masterId: "quality-compliance", label: "Quality", stroke: 10 },
];

function statusRingColor(statusLabel) {
  const map = {
    "On Track": "#10B981", "Nearly There": "#F59E0B",
    "Needs Attention": "#EF4444", "Critical": "#DC2626",
  };
  return map[statusLabel] || "#94A3B8";
}

function KPIsV3() {
  const [expandedMaster, setExpandedMaster] = React.useState(null);
  const [showMore, setShowMore] = React.useState(false);
  const masters = KPI_V1_MASTERS;
  const onTrackTotal = masters.reduce((n, m) =>
    n + m.children.filter((c) => c.status.label === "On Track").length, 0);
  const totalChildren = masters.reduce((n, m) => n + m.children.length, 0);

  return (
    <Card padX={0} padY={0} style={chStyles.sectionCard}>
      <div style={chStyles.sectionHeader}>
        <div style={chStyles.sectionTitleBlock}>
          <span style={chStyles.sectionTitle}>KPI's and Goals</span>
          <span style={chStyles.sectionSubtitle}>Activity rings + attention cards</span>
        </div>
      </div>
      <div style={v3S.twoCol}>
        {/* Left — rings + legend */}
        <div style={v3S.leftCol}>
          <ConcentricRings masters={masters} onTrackTotal={onTrackTotal} totalChildren={totalChildren} />
          <RingLegend
            masters={masters}
            expandedMaster={expandedMaster}
            onToggle={(id) => setExpandedMaster((prev) => (prev === id ? null : id))}
          />
        </div>
        {/* Right — attention + calm cards */}
        <div style={v3S.rightCol}>
          <span style={v3S.rightLabel}>Needs attention</span>
          <div style={v3S.cardsGrid}>
            {KPI_V3_ATTENTION.map((kpi) => (
              <V3Card key={kpi.id} kpi={kpi} hue="red" />
            ))}
          </div>
          {showMore && (
            <>
              <span style={{ ...v3S.rightLabel, marginTop: 8 }}>On track</span>
              <div style={v3S.cardsGrid}>
                {KPI_V3_CALM.map((kpi) => (
                  <V3Card key={kpi.id} kpi={kpi} hue="green" />
                ))}
              </div>
            </>
          )}
          <button
            type="button"
            style={v3S.showMoreBtn}
            onClick={() => setShowMore((s) => !s)}
          >
            {showMore ? "Show fewer" : "Show more"} ({KPI_V3_CALM.length})
          </button>
        </div>
      </div>
    </Card>
  );
}

// Concentric three-ring donut — SVG, Apple Health style
function ConcentricRings({ masters, onTrackTotal, totalChildren }) {
  const SIZE = 180;
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const GAP = 4; // gap between rings

  return (
    <div style={v3S.ringContainer}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {RING_DEFS.map((def, i) => {
          const master = masters.find((m) => m.id === def.masterId);
          if (!master) return null;
          const r = (SIZE / 2) - (def.stroke / 2) - i * (def.stroke + GAP);
          const circ = 2 * Math.PI * r;
          const pct = master.score / 100;
          const dash = pct * circ;
          const { status } = rollup(master);
          const color = statusRingColor(status.label);
          return (
            <g key={def.masterId}>
              {/* Track */}
              <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F1F5F9" strokeWidth={def.stroke} />
              {/* Fill */}
              <circle
                cx={cx} cy={cy} r={r} fill="none"
                stroke={color} strokeWidth={def.stroke}
                strokeDasharray={`${dash} ${circ - dash}`}
                strokeLinecap="round"
                transform={`rotate(-90 ${cx} ${cy})`}
              />
            </g>
          );
        })}
      </svg>
      <div style={v3S.ringCenterLabel}>
        <span style={v3S.ringCenterBig}>{onTrackTotal}/{totalChildren}</span>
        <span style={v3S.ringCenterSub}>on track</span>
      </div>
    </div>
  );
}

// Ring legend — maps ring → master → score → status, clickable to expand children
function RingLegend({ masters, expandedMaster, onToggle }) {
  return (
    <div style={v3S.legendWrap}>
      {RING_DEFS.map((def) => {
        const master = masters.find((m) => m.id === def.masterId);
        if (!master) return null;
        const { status, onTrack, zone } = rollup(master);
        const color = statusRingColor(status.label);
        const isOpen = expandedMaster === master.id;
        return (
          <div key={master.id} style={v3S.legendGroup}>
            <button
              type="button"
              style={v3S.legendRow}
              onClick={() => onToggle(master.id)}
              aria-expanded={isOpen}
            >
              <span style={{ ...v3S.legendDot, background: color }} />
              <span style={v3S.legendName}>{master.name}</span>
              <span style={v3S.legendScore}>{master.score}/100</span>
              <span style={{ ...v3S.legendStatus, color: status.color }}>{status.label}</span>
              <ChevronRight size={14} color="#5B5E6F" style={{ transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 150ms ease" }} />
            </button>
            {isOpen && (
              <div style={v3S.legendChildren}>
                {master.children.map((child) => {
                  const childZone = KPI_STATUS_LEGEND.find((s) => s.label === child.status.label);
                  return (
                    <div key={child.id} style={v3S.legendChildRow}>
                      <span style={{ ...v3S.legendChildDot, background: childZone?.zone || "#94A3B8" }} />
                      <span style={v3S.legendChildLabel}>{child.label}</span>
                      <span style={v3S.legendChildValue}>{child.value}</span>
                      <span style={{ ...v3S.legendChildStatus, color: child.status.color }}>
                        {child.status.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// V3 Card — used for both need-attention (red hue) and calm (green hue)
function V3Card({ kpi, hue }) {
  const statusMeta = KPI_STATUS_LEGEND.find((s) => s.label === kpi.status.label) || KPI_STATUS_LEGEND[2];
  const lineColor = statusRingColor(kpi.status.label);
  const cardBg = hue === "green" ? "#F0FDF4" : "#FEF2F2";
  const gapTagBg = hue === "green" ? "#DCFCE7" : "#FEE2E2";
  const gapTagColor = hue === "green" ? "#00711D" : kpi.status.color;

  return (
    <div style={{ ...v3S.card, background: cardBg }}>
      {/* Top row: dot + name … area pill */}
      <div style={v3S.cardTopRow}>
        <span style={{ ...v3S.cardDot, background: statusMeta.zone }} />
        <span style={v3S.cardName}>{kpi.label}</span>
        <span style={v3S.cardAreaPill}>{kpi.area}</span>
      </div>
      {/* Value */}
      <span style={v3S.cardValue}>{kpi.value}</span>
      {/* Target + gap tag */}
      <div style={v3S.cardTargetRow}>
        <span style={v3S.cardTargetText}>target {kpi.target}%</span>
        <span style={{ ...v3S.cardGapTag, background: gapTagBg, color: gapTagColor }}>
          {kpi.gapTag}
        </span>
      </div>
      {/* Area-fill trend chart below */}
      {kpi.sparkline && (
        <div style={v3S.cardChartWrap}>
          <AreaSparkline data={kpi.sparkline} target={kpi.targetLine} color={lineColor} />
        </div>
      )}
    </div>
  );
}

// Area-fill sparkline with dashed target line — hand-rolled SVG.
// Reuses existing trend-line approach + adds area fill under the line.
function AreaSparkline({ data, target, color }) {
  const W = 160;
  const H = 52;
  const PAD = { t: 6, b: 4, l: 2, r: 2 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;

  const allVals = [...data, target];
  const min = Math.min(...allVals);
  const max = Math.max(...allVals);
  const range = max - min || 1;

  function toY(v) {
    return PAD.t + chartH - ((v - min) / range) * chartH;
  }

  const points = data.map((v, i) => ({
    x: PAD.l + (i / (data.length - 1)) * chartW,
    y: toY(v),
  }));
  const line = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const area = `${line} L ${points[points.length - 1].x} ${H} L ${points[0].x} ${H} Z`;
  const targetY = toY(target);
  const lastPt = points[points.length - 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
      {/* Area fill */}
      <path d={area} fill={color} fillOpacity="0.12" />
      {/* Target dashed line */}
      <line x1={PAD.l} x2={W - PAD.r} y1={targetY} y2={targetY} stroke="#94A3B8" strokeWidth="1" strokeDasharray="4 3" />
      {/* Trend line */}
      <path d={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Last-point dot */}
      <circle cx={lastPt.x} cy={lastPt.y} r={2.5} fill={color} />
    </svg>
  );
}

// V3 styles
const v3S = {
  twoCol: {
    display: "flex", gap: 32, padding: "20px 24px",
  },
  // Left column — rings
  leftCol: {
    flex: "0 0 280px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
  },
  ringContainer: { position: "relative", width: 180, height: 180 },
  ringCenterLabel: {
    position: "absolute", inset: 0, display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
  },
  ringCenterBig: {
    fontSize: 22, fontWeight: 700, color: "#171B2C", lineHeight: 1,
    fontFamily: "var(--font-sans)",
  },
  ringCenterSub: {
    fontSize: 11, fontWeight: 500, color: "#5B5E6F", letterSpacing: "0.4px", marginTop: 2,
  },

  // Legend
  legendWrap: { width: "100%", display: "flex", flexDirection: "column", gap: 4 },
  legendGroup: { display: "flex", flexDirection: "column" },
  legendRow: {
    appearance: "none", width: "100%", display: "flex", alignItems: "center", gap: 8,
    padding: "8px 10px", border: "none", background: "transparent", borderRadius: 8,
    cursor: "pointer", fontFamily: "var(--font-sans)",
  },
  legendDot: { width: 10, height: 10, borderRadius: 999, flexShrink: 0 },
  legendName: { flex: 1, fontSize: 13, fontWeight: 600, color: "#171B2C", textAlign: "left" },
  legendScore: { fontSize: 12, fontWeight: 600, color: "#424659", letterSpacing: "0.1px" },
  legendStatus: { fontSize: 11, fontWeight: 600, letterSpacing: "0.4px" },
  legendChildren: {
    display: "flex", flexDirection: "column", gap: 2, padding: "4px 10px 8px 28px",
  },
  legendChildRow: { display: "flex", alignItems: "center", gap: 8, padding: "4px 0" },
  legendChildDot: { width: 6, height: 6, borderRadius: 999, flexShrink: 0 },
  legendChildLabel: { flex: 1, fontSize: 12, fontWeight: 500, color: "#424659" },
  legendChildValue: { fontSize: 12, fontWeight: 600, color: "#171B2C" },
  legendChildStatus: { fontSize: 11, fontWeight: 600, letterSpacing: "0.4px" },

  // Right column
  rightCol: { flex: 1, display: "flex", flexDirection: "column", gap: 10 },
  rightLabel: {
    fontSize: 12, fontWeight: 700, color: "#5A5D72", letterSpacing: "0.5px",
    textTransform: "uppercase",
  },
  cardsGrid: {
    display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12,
  },

  // V3 card — stacked: top row, value, gap tag, chart below
  card: {
    display: "flex", flexDirection: "column", gap: 6, padding: 14, borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.04)",
  },
  cardTopRow: { display: "flex", alignItems: "center", gap: 6 },
  cardDot: { width: 7, height: 7, borderRadius: 999, flexShrink: 0 },
  cardName: {
    flex: 1, fontSize: 12, fontWeight: 600, color: "#171B2C", letterSpacing: "0.1px",
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  cardAreaPill: {
    flexShrink: 0, fontSize: 10, fontWeight: 600, color: "#5B5E6F",
    letterSpacing: "0.5px", padding: "2px 6px", background: "rgba(255,255,255,0.7)",
    borderRadius: 4,
  },
  cardValue: {
    fontSize: 22, fontWeight: 700, color: "#000", lineHeight: 1.1,
    fontFamily: "var(--font-sans)",
  },
  cardTargetRow: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" },
  cardTargetText: { fontSize: 11, fontWeight: 400, color: "#5B5E6F", letterSpacing: "0.4px" },
  cardGapTag: {
    display: "inline-flex", padding: "2px 7px", borderRadius: 4,
    fontSize: 10, fontWeight: 700, letterSpacing: "0.4px",
  },
  cardChartWrap: { marginTop: 2 },

  // Show more
  showMoreBtn: {
    alignSelf: "flex-start", appearance: "none", display: "inline-flex",
    alignItems: "center", padding: "6px 14px", border: "1px solid #EFEFFF",
    borderRadius: 8, background: "#FFFFFF", cursor: "pointer",
    fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600,
    color: "#424659", letterSpacing: "0.1px",
  },
};

// KpiVersionRail — dark vertical rail matching MilestoneSideRail visuals.
// Uses same dimensions, colors, radius, shadow, and chip sizing.
// Cannot reuse MilestoneSideRail directly (hardcoded milestone data).
function KpiVersionRail({ value, onChange }) {
  const [hovered, setHovered] = React.useState(null);
  return (
    <div style={railS.rail}>
      <span style={railS.railLabel}>V</span>
      <span style={railS.railDivider} />
      <div style={railS.btnGroup}>
        {KPI_VERSIONS.map((b) => (
          <button
            key={b.id}
            type="button"
            title={b.title}
            aria-pressed={value === b.id}
            onClick={() => onChange(b.id)}
            onMouseEnter={() => setHovered(b.id)}
            onMouseLeave={() => setHovered(null)}
            style={kpiRailBtnStyle(value === b.id, hovered === b.id)}
          >
            {b.label}
          </button>
        ))}
      </div>
      <div style={railS.infoBtn}>
        <Info size={14} />
      </div>
    </div>
  );
}

function kpiRailBtnStyle(active, isHover) {
  if (active) {
    return { ...railS.btn, background: "#FDE047", color: "#171717", border: "none" };
  }
  if (isHover) {
    return { ...railS.btn, background: "#404040", color: "#F5F5F5", border: "1px solid #525252" };
  }
  return { ...railS.btn, background: "#262626", color: "#D4D4D4", border: "1px solid #404040" };
}

// Rail styles — mirrors MilestoneSideRail railStyles exactly
const railS = {
  rail: {
    position: "relative", flexShrink: 0, width: 48,
    display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
    padding: "8px 0", background: "#171717", border: "1px solid #404040",
    borderRadius: 10, boxShadow: "0 12px 32px rgba(0, 0, 0, 0.4)",
  },
  railLabel: {
    fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700,
    letterSpacing: "0.12em", color: "#737373",
  },
  railDivider: { width: 24, height: 1, background: "#262626" },
  btnGroup: { display: "flex", flexDirection: "column", gap: 4 },
  btn: {
    width: 36, height: 36, display: "inline-flex", alignItems: "center",
    justifyContent: "center", padding: 0, borderRadius: 6,
    fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700,
    cursor: "pointer", transition: "background 120ms ease, color 120ms ease, border-color 120ms ease",
  },
  infoBtn: {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    width: 28, height: 28, padding: 0, border: "none", background: "transparent",
    borderRadius: 6, color: "#737373",
  },
};

// KPI section layout — card + rail side-by-side
const kpiSectionStyles = {
  wrap: { position: "relative", width: "100%" },
  cardArea: { width: "100%" },
  railMount: {
    position: "absolute", top: 0, bottom: 0, left: "100%",
    marginLeft: 12, width: 48, zIndex: 30,
  },
  railSticky: { position: "sticky", top: "50vh", transform: "translateY(-50%)" },
};

// V1 master-KPI styles
const v1Styles = {
  mastersRow: { display: "flex", gap: 16 },
  legendRow: {
    display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
    padding: "4px 0", marginBottom: 4,
  },
  legendLabel: {
    fontSize: 12, fontWeight: 600, color: "#5A5D72", letterSpacing: "0.5px",
    fontFamily: "var(--font-sans)",
  },
  legendChip: { display: "flex", alignItems: "center", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 999, flexShrink: 0 },
  legendText: { fontSize: 12, fontWeight: 500, letterSpacing: "0.4px", fontFamily: "var(--font-sans)" },

  // Master card — 3-up
  masterCard: {
    flex: 1, position: "relative", display: "flex", flexDirection: "column", gap: 12,
    padding: "20px 20px 16px", border: "1px solid #EFEFFF", borderRadius: 12,
    background: "#FFFFFF", overflow: "hidden",
  },
  masterTop: { display: "flex", alignItems: "flex-start", gap: 14 },
  ringCol: { flexShrink: 0 },
  ringWrap: { position: "relative", width: 64, height: 64 },
  ringCenter: {
    position: "absolute", inset: 0, display: "flex", alignItems: "center",
    justifyContent: "center",
  },
  ringScore: {
    fontSize: 18, fontWeight: 700, color: "#171B2C", fontFamily: "var(--font-sans)",
    lineHeight: 1,
  },
  masterMeta: { flex: 1, display: "flex", flexDirection: "column", gap: 4, minWidth: 0 },
  masterName: { fontSize: 16, fontWeight: 600, color: "#171B2C", lineHeight: "22px" },
  masterDesc: {
    fontSize: 12, fontWeight: 400, color: "#5B5E6F", lineHeight: "16px",
    letterSpacing: "0.4px",
  },
  masterBottom: { display: "flex", alignItems: "center", gap: 10 },
  masterStatusBadge: {
    display: "inline-flex", padding: "4px 10px", borderRadius: 6,
    fontSize: 12, fontWeight: 600, letterSpacing: "0.4px",
  },
  masterSummary: { fontSize: 12, fontWeight: 400, color: "#5B5E6F", letterSpacing: "0.4px" },
  expandBtn: {
    position: "absolute", top: 16, right: 16, appearance: "none", display: "inline-flex",
    alignItems: "center", justifyContent: "center", width: 28, height: 28,
    padding: 0, border: "none", background: "transparent", borderRadius: 6,
    cursor: "pointer",
  },

  // Detail region — shared below 3-up row
  detailRegion: {
    padding: "16px 20px", borderRadius: 12, background: "#FCFBFF",
    border: "1px solid #EFEFFF", display: "flex", flexDirection: "column", gap: 8,
  },
  detailTitle: {
    fontSize: 14, fontWeight: 600, color: "#171B2C", letterSpacing: "0.1px",
    marginBottom: 4,
  },
  childHeader: {
    display: "flex", alignItems: "center", gap: 8, padding: "10px 0",
    borderBottom: "1px solid #F5F5F7",
  },
  childHeaderCell: {
    fontSize: 11, fontWeight: 600, color: "#5A5D72", letterSpacing: "0.5px",
    fontFamily: "var(--font-sans)",
  },
  childRow: {
    display: "flex", alignItems: "center", gap: 8, padding: "10px 0",
    borderBottom: "1px solid #F5F5F7",
  },
  childCell: {
    display: "flex", flexDirection: "column", gap: 2, fontSize: 14,
    fontWeight: 400, color: "#2C2F42", letterSpacing: "0.25px",
  },
  childLabel: { fontSize: 14, fontWeight: 500, color: "#171B2C", lineHeight: "20px" },
  childDesc: { fontSize: 11, fontWeight: 400, color: "#5B5E6F", letterSpacing: "0.4px" },
  targetText: { fontSize: 13, fontWeight: 500, color: "#424659", letterSpacing: "0.1px" },
  gapText: { fontSize: 12, fontWeight: 600, letterSpacing: "0.4px" },
  childStatusBadge: { fontSize: 12, fontWeight: 600, letterSpacing: "0.4px" },
};

// NBA section styles — mirrors NextBestActions nbaStyles
const nbaS = {
  wrap: { display: "flex", flexDirection: "column", gap: 8, marginTop: 8 },
  header: { display: "flex", alignItems: "center", gap: 16 },
  headerLabel: { fontSize: 13, fontWeight: 700, color: "#171B2C" },
  rail: {
    display: "flex", gap: 16, overflowX: "auto", scrollSnapType: "x mandatory",
    scrollbarWidth: "none", paddingBottom: 4,
  },
  card: {
    width: 280, flexShrink: 0, scrollSnapAlign: "start", borderRadius: 16,
    border: "1px solid #EFEFFF", display: "flex", flexDirection: "column", gap: 20,
  },
  chip: {
    alignSelf: "flex-start", display: "inline-flex", alignItems: "center",
    padding: "3px 10px", borderRadius: 4, fontSize: 12, fontWeight: 700,
  },
  topGroup: { display: "flex", flexDirection: "column" },
  cardTitle: {
    marginTop: 6, fontSize: 15, fontWeight: 600, color: "#171B2C", lineHeight: 1.3,
    display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: 2, overflow: "hidden",
  },
  evidence: {
    marginTop: 4, fontSize: 13, fontWeight: 400, color: "#5B5E6F", lineHeight: 1.4,
    display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: 2, overflow: "hidden",
  },
  drillBlock: {
    flex: 1, background: "#F8F7FF", borderRadius: 12, padding: 12,
    display: "flex", flexDirection: "column",
  },
  drillRow: {
    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
  },
  drillTitle: { display: "flex", alignItems: "center", gap: 8, minWidth: 0 },
  assetName: {
    fontSize: 13, fontWeight: 600, color: "#171B2C", minWidth: 0,
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  durationChip: {
    flexShrink: 0, display: "inline-flex", alignItems: "center", padding: "2px 6px",
    borderRadius: 4, background: "#FFFFFF", border: "1px solid #EFEFFF",
    color: "#5B5E6F", fontSize: 11, fontWeight: 500,
  },
  drillDesc: {
    marginTop: 8, display: "flex", alignItems: "flex-start", gap: 6,
    fontSize: 12, fontWeight: 600, color: "#171B2C", lineHeight: 1.4,
  },
  basisText: {
    marginTop: 4, fontSize: 11, fontWeight: 400, color: "#5B5E6F",
    letterSpacing: "0.4px", lineHeight: 1.4,
  },
  ctaRow: { display: "flex", alignItems: "center", gap: 8 },
  assignBtn: {
    flex: 1, height: 38, display: "inline-flex", alignItems: "center",
    justifyContent: "center", border: "none", borderRadius: 999,
    background: "#004BEF", color: "#FFFFFF", fontFamily: "var(--font-sans)",
    fontSize: 13, fontWeight: 700, letterSpacing: "0.05em",
    textTransform: "uppercase", cursor: "pointer",
  },
  kebabBtn: {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    width: 38, height: 38, padding: 0, borderRadius: 999,
    border: "1px solid #EFEFFF", background: "#FFFFFF", color: "#5B5E6F",
    cursor: "pointer",
  },
};

function KPITile({ kpi }) {
  const trendUp = kpi.trend.direction === "up";
  const TrendIcon = trendUp ? ArrowUp : ArrowDown;
  const trendBg = trendUp ? "#F0FDF4" : "#FEF2F2";
  const trendColor = trendUp ? "#00711D" : "#BA1A1A";
  return (
    <div style={chStyles.kpiTile}>
      <div style={chStyles.kpiHeader}>
        <div style={chStyles.kpiLabelRow}>
          <span style={chStyles.kpiLabel}>{kpi.label}</span>
          <Info size={16} color="#5B5E6F" />
          <ChevronRight size={24} color="#5B5E6F" />
        </div>
        <div style={chStyles.kpiValueRow}>
          <span style={chStyles.kpiValue}>{kpi.value}</span>
          {kpi.sub && <span style={chStyles.kpiSub}>{kpi.sub}</span>}
          <span style={{ ...chStyles.trendPill, background: trendBg }}>
            <TrendIcon size={12} color={trendColor} />
            <span style={{ ...chStyles.trendDelta, color: trendColor }}>{kpi.trend.delta}</span>
          </span>
        </div>
      </div>
      <div style={chStyles.kpiBottom}>
        <ProgressBar fill={kpi.bar.fill} pct={kpi.bar.checkpoint} />
        <div style={chStyles.kpiStatusRow}>
          <span style={{ ...chStyles.kpiStatus, color: kpi.status.color }}>{kpi.status.label}</span>
          <div style={chStyles.kpiTargetChip}>
            <AlertTriangle size={18} color={kpi.status.color} />
            <span style={chStyles.kpiTargetLabel}>{kpi.target.label}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ fill, pct }) {
  return (
    <div style={chStyles.progressOuter}>
      <div style={{ ...chStyles.progressFill, width: `${pct}%`, background: fill }} />
      <div style={{ ...chStyles.progressCheckpoint, left: `${pct}%` }} />
    </div>
  );
}

// ---- 3. AI Artifacts ------------------------------------------------------

function AIArtifactsCard() {
  return (
    <SectionCard title="AI Artifacts" subtitle="Track how the interactions work in each call stage">
      <div style={chStyles.artifactRow}>
        {AI_ARTIFACTS.map((a) => (
          <div key={a.id} style={chStyles.artifactCard}>
            <div style={{ ...chStyles.artifactGradientStrip, background: a.gradient }} />
            <div style={chStyles.artifactBody}>
              <div style={chStyles.artifactMeta}>
                <div style={chStyles.artifactTitleRow}>
                  <span style={chStyles.artifactTitle}>{a.title}</span>
                  <ChevronRight size={24} color="#5B5E6F" />
                </div>
                <span style={chStyles.artifactDesc}>{a.description}</span>
              </div>
              <div style={chStyles.artifactFreqRow}>
                <RefreshCw size={12} color="#5B5E6F" />
                <span style={chStyles.artifactFreq}>{a.frequency}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

// ---- 4. Conversation Flow Analysis (3 tabs) --------------------------------
// Tab state managed here so each tab renders its own body. Card + TabsRow
// composed directly (not via SectionCard) to enable per-tab content swap.

function ConversationFlowCard() {
  const flow = CONVERSATION_FLOW;
  const [tab, setTab] = React.useState(flow.activeTab);
  return (
    <Card padX={0} padY={0} style={chStyles.sectionCard}>
      <div style={chStyles.sectionHeader}>
        <div style={chStyles.sectionTitleBlock}>
          <span style={chStyles.sectionTitle}>Conversation Flow Analysis</span>
          <span style={chStyles.sectionSubtitle}>{flow.subtitle}</span>
        </div>
      </div>
      <TabsRow
        tabs={flow.tabs.map((t) => ({ id: t, label: t }))}
        activeTab={tab}
        onTabClick={setTab}
      />
      <div style={chStyles.sectionBody}>
        {tab === "Core Collection Path" && <CoreCollectionPathTab />}
        {tab === "Interaction Events" && <InteractionEventsTab />}
        {tab === "Coaching Priority" && <CoachingPriorityTab />}
      </div>
    </Card>
  );
}

// ---- Tab 1: Core Collection Path ------------------------------------------

function CoreCollectionPathTab() {
  const flow = CONVERSATION_FLOW;
  return (
    <>
      <div style={chStyles.chartMeta}>
        <span style={chStyles.chartMetaText}>{flow.compliance}</span>
        <div style={chStyles.legendRow}>
          {flow.legend.map((l) => (
            <span key={l.label} style={chStyles.legendItem}>
              <span style={{ ...chStyles.legendDot, background: l.color }} />
              {l.label}
            </span>
          ))}
        </div>
      </div>
      <HorizontalStackedBarChart stages={flow.stages} />
    </>
  );
}

function HorizontalStackedBarChart({ stages }) {
  return (
    <div style={chStyles.hBarWrap}>
      {stages.map((s) => (
        <div key={s.label} style={chStyles.hBarRow}>
          <span style={chStyles.hBarLabel}>{s.label.replace("\n", " ")}</span>
          <div style={chStyles.hBarTrack}>
            <div style={{ ...chStyles.hBarSeg, width: `${s.green}%`, background: "#34D399" }} />
            <div style={{ ...chStyles.hBarSeg, width: `${s.amber}%`, background: "#FBBF24" }} />
            <div style={{ ...chStyles.hBarSeg, width: `${s.pink}%`, background: "#FB7185" }} />
          </div>
        </div>
      ))}
      <div style={chStyles.hBarXAxis}>
        {["0%", "20%", "40%", "60%", "80%", "100%"].map((t) => (
          <span key={t} style={chStyles.hBarXLabel}>{t}</span>
        ))}
      </div>
    </div>
  );
}

// ---- Tab 2: Interaction Events --------------------------------------------

function InteractionEventsTab() {
  const ie = INTERACTION_EVENTS;
  return (
    <>
      <div style={chStyles.chartMeta}>
        <span style={chStyles.chartMetaText}>{ie.chartLabel}</span>
        <div style={chStyles.legendRow}>
          {ie.legend.map((l) => (
            <span key={l.label} style={chStyles.legendItem}>
              <span style={{ ...chStyles.legendDot, background: l.color }} />
              {l.label}
              {l.hasToggle && (
                <span style={chStyles.ieMiniToggle}>
                  <span style={chStyles.ieMiniToggleTrack}>
                    <span style={chStyles.ieMiniToggleKnob} />
                  </span>
                </span>
              )}
            </span>
          ))}
        </div>
      </div>
      <div style={chStyles.hBarWrap}>
        {ie.stages.map((s) => (
          <div key={s.label} style={chStyles.hBarRow}>
            <span style={chStyles.hBarLabel}>{s.label.replace("\n", " ")}</span>
            <div style={chStyles.hBarTrack}>
              <div style={{ ...chStyles.hBarSeg, width: `${s.resistance}%`, background: "#FACC15", borderRadius: "4px 0 0 4px" }} />
            </div>
          </div>
        ))}
        <div style={chStyles.hBarXAxis}>
          {["0%", "20%", "40%", "60%", "80%", "100%"].map((t) => (
            <span key={t} style={chStyles.hBarXLabel}>{t}</span>
          ))}
        </div>
      </div>
    </>
  );
}

// ---- Tab 3: Coaching Priority ---------------------------------------------

function CoachingPriorityTab() {
  const cp = COACHING_PRIORITY;
  return (
    <div style={chStyles.cpWrap}>
      <div style={chStyles.cpHeader}>
        <span style={{ ...chStyles.cpHeaderCell, flex: "0 0 33%" }}>
          {cp.columns[0]}
        </span>
        <span style={{ ...chStyles.cpHeaderCell, flex: "0 0 17%" }}>
          {cp.columns[1]}
        </span>
        <span style={{ ...chStyles.cpHeaderCell, flex: "0 0 33%" }}>
          {cp.columns[2]}
        </span>
        <span style={{ ...chStyles.cpHeaderCell, flex: "0 0 17%" }}>
          {cp.columns[3]}
        </span>
      </div>
      {cp.rows.map((row) => (
        <div key={row.stage} style={chStyles.cpRow}>
          <span style={{ ...chStyles.cpCell, flex: "0 0 33%", color: "#171B2C" }}>
            {row.stage}
          </span>
          <span style={{ ...chStyles.cpCell, flex: "0 0 17%" }}>
            {row.adherence}
          </span>
          <div style={{ ...chStyles.cpCell, flex: "0 0 33%", display: "flex", alignItems: "center", gap: 16 }}>
            <span style={chStyles.cpBarLabel}>{row.opportunity}%</span>
            <div style={chStyles.cpBarTrack}>
              <div style={{ ...chStyles.cpBarFill, width: `${row.opportunity}%` }} />
            </div>
          </div>
          <span style={{ ...chStyles.cpCell, flex: "0 0 17%", color: row.priorityColor }}>
            {row.priority}
          </span>
        </div>
      ))}
      <div style={chStyles.cpPagination}>
        <span style={chStyles.cpPagText}>
          Showing {cp.rows.length} stages
        </span>
        <div style={chStyles.cpPagRight}>
          <span style={chStyles.cpPagText}>
            Page {cp.pagination.current} of {cp.pagination.totalPages}
          </span>
          <ChevronRight size={20} color="#5B5E6F" />
        </div>
      </div>
    </div>
  );
}

// ---- 5. Customer Sentiment Analysis ---------------------------------------

function SentimentCard() {
  const s = SENTIMENT;
  return (
    <SectionCard title="Customer Sentiment Analysis" subtitle={s.subtitle} tabs={s.tabs} activeTab={s.activeTab}>
      <div style={chStyles.chartMeta}>
        <span style={chStyles.chartMetaText}>{s.chartLabel}</span>
        <div style={chStyles.legendRow}>
          {s.legend.map((l) => (
            <span
              key={l.label}
              style={{
                ...chStyles.legendPill,
                background: l.style === "pill-filled" ? "#F0FDF4" : "#FFFFFF",
                border: l.style === "pill-outline" ? "1px solid #EFEFFF" : "none",
              }}
            >
              <span style={{ ...chStyles.legendDot, background: l.color }} />
              {l.label}
            </span>
          ))}
        </div>
      </div>
      <SentimentLineChart data={s} />
    </SectionCard>
  );
}

function SentimentLineChart({ data }) {
  const W = 900;
  const H = 300;
  const PAD = { t: 16, b: 40, l: 40, r: 16 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;
  const xLabels = data.xLabels.map((l) => l.replace("\n", " "));
  const yVals = [100, 75, 50, 25, 0];
  const seriesEntries = Object.entries(data.series);

  function toPoint(val, idx, count) {
    return {
      x: PAD.l + (idx / (count - 1)) * chartW,
      y: PAD.t + chartH - (val / 100) * chartH,
    };
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={chStyles.svgFull}>
      {yVals.map((v) => {
        const y = PAD.t + chartH - (v / 100) * chartH;
        return <line key={v} x1={PAD.l} x2={W - PAD.r} y1={y} y2={y} stroke="#F2F0F4" strokeDasharray="4 4" />;
      })}
      {yVals.map((v) => {
        const y = PAD.t + chartH - (v / 100) * chartH;
        return (
          <text key={`yl-${v}`} x={PAD.l - 6} y={y + 4} textAnchor="end" style={chStyles.axisText}>
            {v}%
          </text>
        );
      })}
      {xLabels.map((l, i) => {
        const x = PAD.l + (i / (xLabels.length - 1)) * chartW;
        return (
          <text key={l} x={x} y={H - 8} textAnchor="middle" style={chStyles.axisText}>
            {l}
          </text>
        );
      })}
      {seriesEntries.map(([name, vals]) => {
        const color = data.legend.find((l) => l.label === name)?.color || "#999";
        const pts = vals.map((v, i) => toPoint(v, i, vals.length));
        const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
        return (
          <g key={name}>
            <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {pts.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={3} fill={color} />
            ))}
          </g>
        );
      })}
    </svg>
  );
}

// ---- 6. Customer Objections -----------------------------------------------

function ObjectionsCard() {
  const o = OBJECTIONS;
  return (
    <SectionCard title="Customer Objections" subtitle={o.subtitle} tabs={o.tabs} activeTab={o.activeTab}>
      <div style={chStyles.objStatsRow}>
        {o.stats.map((s) => (
          <div key={s.label} style={chStyles.objStat}>
            <span style={chStyles.objStatLabel}>{s.label}</span>
            <div style={chStyles.objStatValueRow}>
              <span style={chStyles.objStatValue}>{s.value}</span>
              <span style={chStyles.objStatSub}>{s.sub}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={chStyles.chartMeta}>
        <span style={chStyles.chartMetaText}>{o.chartLabel}</span>
        <div style={chStyles.legendRow}>
          {o.legend.map((l) => (
            <span key={l.label} style={chStyles.legendItem}>
              <span style={{ ...chStyles.legendDot, background: l.color }} />
              {l.label}
            </span>
          ))}
        </div>
      </div>
      <StackedBarChart categories={o.categories} />
    </SectionCard>
  );
}

function StackedBarChart({ categories }) {
  const W = 900;
  const H = 260;
  const PAD = { t: 8, b: 32, l: 40, r: 16 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;
  const barW = Math.min(20, chartW / categories.length - 12);
  const yVals = [100, 75, 50, 25, 0];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={chStyles.svgFull}>
      {yVals.map((v) => {
        const y = PAD.t + chartH - (v / 100) * chartH;
        return <line key={v} x1={PAD.l} x2={W - PAD.r} y1={y} y2={y} stroke="#F2F0F4" strokeDasharray="4 4" />;
      })}
      {yVals.map((v) => {
        const y = PAD.t + chartH - (v / 100) * chartH;
        return (
          <text key={`yl-${v}`} x={PAD.l - 6} y={y + 4} textAnchor="end" style={chStyles.axisText}>
            {v}%
          </text>
        );
      })}
      {categories.map((cat, i) => {
        const cx = PAD.l + ((i + 0.5) / categories.length) * chartW;
        const baseY = PAD.t + chartH;
        const eH = (cat.effective / 100) * chartH;
        const nH = (cat.neutral / 100) * chartH;
        const iH = (cat.ineffective / 100) * chartH;
        return (
          <g key={cat.label}>
            <rect x={cx - barW / 2} y={baseY - eH} width={barW} height={eH} rx={0} fill="#34D399" />
            <rect x={cx - barW / 2} y={baseY - eH - nH} width={barW} height={nH} rx={0} fill="#60A5FA" />
            <rect x={cx - barW / 2} y={baseY - eH - nH - iH} width={barW} height={iH} rx={barW > 6 ? 4 : 2} fill="#FB7185" />
            <text x={cx} y={H - 6} textAnchor="middle" style={chStyles.axisText}>
              {cat.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ---- 7. Contact Outcome ---------------------------------------------------

function ContactOutcomeCard() {
  const c = CONTACT_OUTCOME;
  return (
    <SectionCard title="Contact Outcome" subtitle={c.subtitle} tabs={c.tabs} activeTab={c.activeTab}>
      <div style={chStyles.outcomeStatsRow}>
        {c.summary.map((s) => (
          <div key={s.label} style={chStyles.outcomeStat}>
            <span style={chStyles.outcomeStatLabel}>{s.label}</span>
            <div style={chStyles.outcomeStatValueRow}>
              <span style={chStyles.outcomeStatValue}>{s.value}</span>
              <span style={chStyles.outcomeStatSub}>{s.sub}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={chStyles.outcomeBody}>
        <div style={chStyles.donutWrap}>
          <DonutChart segments={c.donut} />
        </div>
        <div style={chStyles.outcomeTable}>
          <div style={chStyles.outcomeTableHeader}>
            <span style={chStyles.outcomeTableHeaderLabel}>{c.tableHeader}</span>
            <span style={chStyles.outcomeTableHeaderLabel}>Distribution</span>
            <span style={chStyles.outcomeTableHeaderLabel}>% Distribution</span>
          </div>
          {c.donut.map((seg) => (
            <div key={seg.label} style={chStyles.outcomeTableRow}>
              <div style={chStyles.outcomeRowLabel}>
                <span style={{ ...chStyles.legendDot, background: seg.color }} />
                <span>{seg.label}</span>
              </div>
              <span>{seg.count.toLocaleString()}</span>
              <span>{seg.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}

function DonutChart({ segments }) {
  const size = 160;
  const stroke = 28;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const total = segments.reduce((s, seg) => s + seg.count, 0);
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {segments.map((seg) => {
        const pct = seg.count / total;
        const dashLen = pct * circ;
        const dashOff = -offset * circ;
        offset += pct;
        return (
          <circle
            key={seg.label}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={stroke}
            strokeDasharray={`${dashLen} ${circ - dashLen}`}
            strokeDashoffset={dashOff}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        );
      })}
    </svg>
  );
}

// ---- 8. Quality Adherence -------------------------------------------------

function QualityAdherenceCard() {
  const q = QUALITY_ADHERENCE;
  return (
    <SectionCard
      title="Quality Adherence"
      subtitle={q.subtitle}
      tabs={q.tabs}
      activeTab={q.activeTab}
      headerRight={
        <button type="button" style={chStyles.downloadBtn}>
          <Download size={18} color="#004BEF" />
          <span style={chStyles.downloadLabel}>Download</span>
        </button>
      }
    >
      <div style={chStyles.chartMeta}>
        <span style={chStyles.chartMetaText}>
          View trends using 3 scorecards
        </span>
        <div style={chStyles.legendRow}>
          {q.legend.map((l) => (
            <span key={l.label} style={chStyles.legendItem}>
              {l.style === "dashed" ? (
                <span style={{ width: 16, height: 0, borderTop: "2px dashed #004BEF", display: "inline-block" }} />
              ) : (
                <span style={{ ...chStyles.legendDot, background: l.color }} />
              )}
              {l.label}
            </span>
          ))}
        </div>
        <div style={chStyles.toggleRow}>
          <span style={chStyles.toggleLabel}>Trend</span>
          <span style={chStyles.toggleDivider} />
          <span style={chStyles.toggleLabel}>Compare</span>
        </div>
      </div>
      <AdherenceLineChart data={q} />
    </SectionCard>
  );
}

function AdherenceLineChart({ data }) {
  const W = 900;
  const H = 260;
  const PAD = { t: 16, b: 32, l: 40, r: 16 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;
  const yVals = [100, 80, 60, 40, 20, 0];
  const xLabels = data.xLabels;
  const vals = data.series["Sales Scorecard"];

  function toPoint(val, idx) {
    return {
      x: PAD.l + (idx / (xLabels.length - 1)) * chartW,
      y: PAD.t + chartH - (val / 100) * chartH,
    };
  }

  const pts = vals.map((v, i) => toPoint(v, i));
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const targetY = PAD.t + chartH - (data.targetLine / 100) * chartH;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={chStyles.svgFull}>
      {yVals.map((v) => {
        const y = PAD.t + chartH - (v / 100) * chartH;
        return <line key={v} x1={PAD.l} x2={W - PAD.r} y1={y} y2={y} stroke="#F2F0F4" strokeDasharray="4 4" />;
      })}
      <line x1={PAD.l} x2={W - PAD.r} y1={targetY} y2={targetY} stroke="#004BEF" strokeWidth="1" strokeDasharray="6 4" />
      {yVals.map((v) => {
        const y = PAD.t + chartH - (v / 100) * chartH;
        return (
          <text key={`yl-${v}`} x={PAD.l - 6} y={y + 4} textAnchor="end" style={chStyles.axisText}>
            {v}%
          </text>
        );
      })}
      {xLabels.map((l, i) => {
        const x = PAD.l + (i / (xLabels.length - 1)) * chartW;
        return (
          <text key={l} x={x} y={H - 6} textAnchor="middle" style={chStyles.axisText}>
            {l}
          </text>
        );
      })}
      <path d={d} fill="none" stroke="#2DD4BF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="#2DD4BF" stroke="#fff" strokeWidth="1" />
      ))}
    </svg>
  );
}

// ---- Shared section card --------------------------------------------------

function SectionCard({ title, subtitle, tabs, activeTab, headerRight, children }) {
  const [tab, setTab] = React.useState(activeTab || (tabs ? tabs[0] : null));
  return (
    <Card padX={0} padY={0} style={chStyles.sectionCard}>
      <div style={chStyles.sectionHeader}>
        <div style={chStyles.sectionTitleBlock}>
          <span style={chStyles.sectionTitle}>{title}</span>
          {subtitle && <span style={chStyles.sectionSubtitle}>{subtitle}</span>}
        </div>
        {headerRight}
      </div>
      {tabs && (
        <TabsRow
          tabs={tabs.map((t) => ({ id: t, label: t }))}
          activeTab={tab}
          onTabClick={setTab}
        />
      )}
      <div style={chStyles.sectionBody}>{children}</div>
    </Card>
  );
}

// ---- Styles ---------------------------------------------------------------

const chStyles = {
  // Page header
  headerCard: { border: "2px solid #FFFFFF", overflow: "hidden" },
  headerPrimary: {
    display: "flex", alignItems: "center", padding: "8px 12px", gap: 12,
    background: "#FCFBFF", borderBottom: "none",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 12 },
  headerIcon: {
    width: 32, height: 32, borderRadius: 999, background: "#F5EEFF",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  headerTitleRow: { display: "flex", alignItems: "center", gap: 8 },
  headerTitle: {
    fontSize: 16, fontWeight: 600, lineHeight: "24px", color: "#2C2F42",
    fontFamily: "var(--font-sans)",
  },
  headerSecondary: { padding: "8px 12px", background: "#FFFFFF" },
  filterRow: { display: "flex", alignItems: "center", gap: 8 },
  filterPill: {
    appearance: "none", display: "flex", alignItems: "center", gap: 8,
    padding: "6px 8px 6px 12px", borderRadius: 8, border: "none",
    background: "#FCFBFF", cursor: "pointer", fontFamily: "var(--font-sans)",
  },
  filterLabel: { fontSize: 14, fontWeight: 400, color: "#424659", letterSpacing: "0.25px" },
  filterValue: { fontSize: 14, fontWeight: 600, color: "#45464F", letterSpacing: "0.1px" },
  filterDivider: { width: 1, height: 32, background: "#DDE1FF", marginLeft: 4 },
  filterIconBtn: {
    appearance: "none", width: 32, height: 32, borderRadius: 4,
    border: "none", background: "#FFFFFF", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
  },

  // Hero
  heroCard: {
    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24,
  },
  heroLeft: { display: "flex", flexDirection: "column", gap: 3 },
  heroLabelRow: { display: "flex", alignItems: "center", gap: 4 },
  heroLabel: {
    fontSize: 12, fontWeight: 600, letterSpacing: "0.5px", color: "#5A5D72",
    fontFamily: "var(--font-sans)",
  },
  heroValue: {
    fontSize: 22, fontWeight: 600, lineHeight: "34px", color: "#000000",
    fontFamily: "var(--font-sans)",
  },

  // Section card
  sectionCard: { display: "flex", flexDirection: "column" },
  sectionHeader: {
    display: "flex", alignItems: "flex-start", justifyContent: "space-between",
    padding: "16px 24px", gap: 4, borderBottom: "1px solid #EFEFFF",
  },
  sectionTitleBlock: { display: "flex", flexDirection: "column", gap: 4 },
  sectionTitle: {
    fontSize: 16, fontWeight: 500, lineHeight: "24px", color: "#171B2C",
    letterSpacing: "0.1px", fontFamily: "var(--font-sans)",
  },
  sectionSubtitle: {
    fontSize: 12, fontWeight: 400, lineHeight: "18px", color: "#5B5E6F",
    letterSpacing: "0.4px", fontFamily: "var(--font-sans)",
  },
  sectionBody: { padding: "16px 24px", display: "flex", flexDirection: "column", gap: 16 },

  // KPIs
  kpiRow: { display: "flex", gap: 16 },
  kpiTile: {
    flex: 1, display: "flex", flexDirection: "column", gap: 24,
    padding: 24, border: "1px solid #EFEFFF", borderRadius: 12, background: "#FFFFFF",
  },
  kpiHeader: { display: "flex", flexDirection: "column", gap: 3 },
  kpiLabelRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 },
  kpiLabel: {
    fontSize: 12, fontWeight: 600, letterSpacing: "0.5px", color: "#5A5D72",
    fontFamily: "var(--font-sans)",
  },
  kpiValueRow: { display: "flex", alignItems: "center", gap: 8 },
  kpiValue: { fontSize: 22, fontWeight: 600, lineHeight: "34px", color: "#000000", fontFamily: "var(--font-sans)" },
  kpiSub: { fontSize: 12, fontWeight: 400, color: "#5B5E6F", letterSpacing: "0.4px" },
  trendPill: {
    display: "inline-flex", alignItems: "center", gap: 4, padding: 4, borderRadius: 4,
  },
  trendDelta: { fontSize: 11, fontWeight: 600, letterSpacing: "0.5px" },
  kpiBottom: { display: "flex", flexDirection: "column", gap: 8 },
  kpiStatusRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  kpiStatus: { fontSize: 12, fontWeight: 400, letterSpacing: "0.4px" },
  kpiTargetChip: { display: "flex", alignItems: "center", gap: 4 },
  kpiTargetLabel: { fontSize: 12, fontWeight: 400, color: "#424659", letterSpacing: "0.4px" },
  progressOuter: {
    position: "relative", width: "100%", height: 8, background: "#F1F5F9", borderRadius: 100,
  },
  progressFill: { height: 8, borderRadius: "100px 0 0 100px" },
  progressCheckpoint: {
    position: "absolute", top: -2, width: 2, height: 12, background: "#1D4ED8", borderRadius: 100,
  },
  kpiPagination: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "15px 32px", borderTop: "1px solid #DEE1F9",
  },
  kpiPagLabel: { fontSize: 14, fontWeight: 400, color: "#5A5D72", letterSpacing: "0.25px" },
  kpiPagRight: { display: "flex", alignItems: "center", gap: 12 },

  // AI Artifacts
  artifactRow: { display: "flex", gap: 24 },
  artifactCard: {
    flex: 1, display: "flex", border: "1px solid #DDE1FF", borderRadius: 8,
    background: "#FFFFFF", overflow: "hidden", height: 150,
  },
  artifactGradientStrip: { width: 20, flexShrink: 0 },
  artifactBody: {
    flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between",
    padding: 24, gap: 24,
  },
  artifactMeta: { display: "flex", flexDirection: "column", gap: 4 },
  artifactTitleRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  artifactTitle: {
    fontSize: 14, fontWeight: 500, lineHeight: "22px", color: "#2C2F42",
    letterSpacing: "0.1px", fontFamily: "var(--font-sans)",
  },
  artifactDesc: {
    fontSize: 12, fontWeight: 400, lineHeight: "18px", color: "#5B5E6F",
    letterSpacing: "0.4px",
  },
  artifactFreqRow: { display: "flex", alignItems: "center", gap: 4 },
  artifactFreq: { fontSize: 11, fontWeight: 400, lineHeight: "14px", color: "#5B5E6F", letterSpacing: "0.4px" },

  // Chart shared
  chartMeta: {
    display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap",
  },
  chartMetaText: { fontSize: 12, fontWeight: 400, color: "#5B5E6F", letterSpacing: "0.4px" },
  legendRow: { display: "flex", alignItems: "center", gap: 16 },
  legendItem: {
    display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 400,
    color: "#2C2F42", letterSpacing: "0.4px",
  },
  legendDot: { width: 8, height: 8, borderRadius: 999, flexShrink: 0 },
  legendPill: {
    display: "flex", alignItems: "center", gap: 8, padding: "4px 8px", borderRadius: 4,
    fontSize: 12, fontWeight: 400, color: "#2C2F42", letterSpacing: "0.4px",
  },
  svgFull: { width: "100%", height: "auto", display: "block" },
  axisText: { fontSize: 9, fill: "#5B5E6F", fontFamily: "Lato, var(--font-sans)", letterSpacing: "0.5px" },

  // Horizontal bar chart
  hBarWrap: { display: "flex", flexDirection: "column", gap: 8, padding: "8px 0" },
  hBarRow: { display: "flex", alignItems: "center", gap: 12 },
  hBarLabel: {
    width: 82, flexShrink: 0, fontSize: 11, fontWeight: 400, color: "#5B5E6F",
    textAlign: "right", letterSpacing: "0.5px", lineHeight: "13px",
  },
  hBarTrack: {
    flex: 1, display: "flex", height: 20, borderRadius: "4px 4px 0 0", overflow: "hidden",
  },
  hBarSeg: { height: 20 },
  hBarXAxis: { display: "flex", justifyContent: "space-between", paddingLeft: 94 },
  hBarXLabel: { fontSize: 11, color: "#5B5E6F", letterSpacing: "0.5px" },

  // Interaction Events — mini toggle (decorative)
  ieMiniToggle: { display: "inline-flex", marginLeft: 4 },
  ieMiniToggleTrack: {
    width: 26, height: 10, borderRadius: 100, background: "rgba(23,27,44,0.38)",
    position: "relative", display: "inline-block",
  },
  ieMiniToggleKnob: {
    position: "absolute", top: -3, left: 0, width: 16, height: 16,
    borderRadius: "50%", background: "#FFFFFF",
    boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 1px rgba(0,0,0,0.14)",
  },

  // Coaching Priority table
  cpWrap: { display: "flex", flexDirection: "column" },
  cpHeader: {
    display: "flex", alignItems: "center", background: "#FCFBFF", gap: 2,
  },
  cpHeaderCell: {
    padding: "12px 16px", fontSize: 12, fontWeight: 600, color: "#2C2F42",
    letterSpacing: "0.5px", lineHeight: "18px",
  },
  cpRow: {
    display: "flex", alignItems: "center", gap: 2,
    borderBottom: "1px solid #F5F5F7",
  },
  cpCell: {
    padding: "12px 16px", fontSize: 14, fontWeight: 400, color: "#2C2F42",
    letterSpacing: "0.25px", lineHeight: "22px",
  },
  cpBarLabel: {
    fontSize: 14, fontWeight: 500, color: "#424659", letterSpacing: "0.1px",
    width: 35, flexShrink: 0,
  },
  cpBarTrack: {
    flex: 1, height: 8, background: "#F1F5F9", borderRadius: 100,
  },
  cpBarFill: {
    height: 8, background: "#34D399", borderRadius: 100,
  },
  cpPagination: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "16px 24px", borderTop: "1px solid #DEE1F9",
  },
  cpPagText: {
    fontSize: 14, fontWeight: 400, color: "#5A5D72", letterSpacing: "0.25px",
  },
  cpPagRight: { display: "flex", alignItems: "center", gap: 12 },

  // Objection stats
  objStatsRow: { display: "flex", gap: 24 },
  objStat: {
    flex: 1, display: "flex", flexDirection: "column", gap: 2,
    padding: 16, background: "#FCFBFF", borderRadius: 8,
  },
  objStatLabel: { fontSize: 14, fontWeight: 400, color: "#5B5E6F", letterSpacing: "0.25px" },
  objStatValueRow: { display: "flex", alignItems: "center", gap: 4 },
  objStatValue: { fontSize: 14, fontWeight: 600, color: "#2C2F42", letterSpacing: "0.1px" },
  objStatSub: { fontSize: 12, fontWeight: 400, color: "#5B5E6F", letterSpacing: "0.4px" },

  // Contact outcome
  outcomeStatsRow: { display: "flex", gap: 24 },
  outcomeStat: {
    flex: 1, display: "flex", flexDirection: "column", gap: 2,
    padding: 16, background: "#FCFBFF", borderRadius: 8,
  },
  outcomeStatLabel: { fontSize: 14, fontWeight: 400, color: "#5B5E6F", letterSpacing: "0.25px" },
  outcomeStatValueRow: { display: "flex", alignItems: "center", gap: 4 },
  outcomeStatValue: { fontSize: 14, fontWeight: 600, color: "#2C2F42", letterSpacing: "0.1px" },
  outcomeStatSub: { fontSize: 12, fontWeight: 400, color: "#5B5E6F", letterSpacing: "0.4px" },
  outcomeBody: { display: "flex", gap: 40, alignItems: "center" },
  donutWrap: { display: "flex", justifyContent: "center", width: 232, flexShrink: 0 },
  outcomeTable: { flex: 1, display: "flex", flexDirection: "column" },
  outcomeTableHeader: {
    display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24,
    padding: "0 24px", height: 40, alignItems: "center", background: "#FCFBFF",
  },
  outcomeTableHeaderLabel: {
    fontSize: 12, fontWeight: 600, color: "#2C2F42", letterSpacing: "0.5px",
  },
  outcomeTableRow: {
    display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24,
    padding: "12px 24px", fontSize: 14, fontWeight: 400, color: "#2C2F42",
    letterSpacing: "0.25px", borderBottom: "none",
  },
  outcomeRowLabel: { display: "flex", alignItems: "center", gap: 12 },

  // Quality adherence
  downloadBtn: {
    appearance: "none", display: "flex", alignItems: "center", gap: 8,
    padding: "10px 16px 10px 12px", border: "none", background: "transparent",
    cursor: "pointer", borderRadius: 8,
  },
  downloadLabel: {
    fontSize: 14, fontWeight: 700, color: "#004BEF", letterSpacing: "0.1px",
    fontFamily: "var(--font-sans)",
  },
  toggleRow: { display: "flex", alignItems: "center", gap: 8 },
  toggleLabel: { fontSize: 14, fontWeight: 400, color: "#45464F", letterSpacing: "0.25px" },
  toggleDivider: { width: 1, height: 16, background: "#DEE1F9" },
};
