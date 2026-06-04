"use client";

import React from "react";
import { ChevronRight, ChevronDown, Info, ArrowUp, ArrowDown, Download, RefreshCw, AlertTriangle } from "lucide-react";
import Card from "./Card";
import TabsRow from "./TabsRow";
import {
  HERO, KPIS, KPI_PAGINATION, AI_ARTIFACTS,
  CONVERSATION_FLOW, INTERACTION_EVENTS, COACHING_PRIORITY,
  SENTIMENT, OBJECTIONS,
  CONTACT_OUTCOME, QUALITY_ADHERENCE, PAGE_FILTERS,
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

function KPIsAndGoalsCard() {
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
