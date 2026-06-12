"use client";

import React from "react";
import { Plus, SlidersHorizontal, ChevronRight } from "lucide-react";
import PageHeader from "./PageHeader";
import TabsRow from "./TabsRow";
import Card from "./Card";
import { FaceScanIcon } from "./SideNav/icons";
import {
  INTERVIEW_PLANS, FAMILY_LABELS, planCounts, aggregateStats, TOPIC_COVERAGE,
} from "./mocks/recruiter";
import {
  FamilyAvatar, StatusChip, CoverageMeter, ModeTag, COMPLIANCE_COPY,
} from "./AIRecruiterParts";

// AIRecruiterPipeline (Variant C · direction D3) — interview plans on the
// left, an aggregate coverage rail on the right. The rail carries Neil's
// strategic "record view across many interviewees" lens into V1 in a
// compliance-safe way: it shows how much of the assigned knowledge is being
// covered across all live interviews (coverage, never mastery), with every
// figure tied to the interview sample it summarises (G3) and drawn as
// labelled bars + readable rows, not an abstract chart (G2).

export default function AIRecruiterPipeline({ onOpenPlan, onCreatePlan }) {
  const [tab, setTab] = React.useState("live");

  const counts = planCounts(INTERVIEW_PLANS);
  const TABS = [
    { id: "live", label: "Live", count: counts.live },
    { id: "draft", label: "Draft", count: counts.draft },
    { id: "archived", label: "Archived", count: counts.archived },
  ];
  const plans = INTERVIEW_PLANS.filter((p) => p.status === tab);
  const stats = aggregateStats(INTERVIEW_PLANS);

  return (
    <div style={s.column}>
      <PageHeader
        identifier={{
          icon: <FaceScanIcon size={18} color="var(--color-icon-tertiary-fg)" />,
          label: "AI Recruiter",
          iconBg: "var(--color-icon-tertiary-bg)",
          iconColor: "var(--color-icon-tertiary-fg)",
        }}
        primaryAction={{ label: "Interview plan", icon: <Plus size={16} />, onClick: onCreatePlan }}
        toolbar={[{ id: "filters", icon: <SlidersHorizontal size={18} />, label: "Filters", onClick: () => {} }]}
      />

      <div style={s.split}>
        <div style={s.leftCol}>
          <TabsRow tabs={TABS} activeTab={tab} onTabClick={setTab} />
          {plans.length === 0 ? (
            <EmptyState tab={TABS.find((t) => t.id === tab)?.label} />
          ) : (
            <div style={s.list}>
              {plans.map((p) => (
                <PlanItem key={p.id} plan={p} onClick={() => onOpenPlan?.(p.id)} />
              ))}
            </div>
          )}
        </div>

        <aside style={s.rail} aria-label="Aggregate coverage across live plans">
          <CoverageRail stats={stats} topics={TOPIC_COVERAGE} />
        </aside>
      </div>
    </div>
  );
}

function PlanItem({ plan, onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      type="button"
      className="recruiter-focusable"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label={`${plan.name} — open interview plan`}
      style={{ ...s.item, boxShadow: hover ? "var(--shadow-card)" : "none", borderColor: hover ? "var(--color-border-tab)" : "var(--color-divider-card)" }}
    >
      <FamilyAvatar family={plan.family} size={40} />
      <div style={s.itemMain}>
        <div style={s.itemTitleRow}>
          <span style={s.itemName}>{plan.name}</span>
          <StatusChip status={plan.status} />
        </div>
        <span style={s.itemSub}>{plan.jobProfile} · {FAMILY_LABELS[plan.family]}</span>
        <div style={s.itemMeterRow}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <CoverageMeter coverage={plan.coverage} compact />
          </div>
          <ModeTag mode={plan.mode} assisted={plan.assisted} />
        </div>
      </div>
      <ChevronRight size={20} color="var(--color-text-tertiary)" style={{ flexShrink: 0, alignSelf: "center", opacity: hover ? 1 : 0.75, transition: "opacity 150ms ease" }} aria-hidden="true" />
    </button>
  );
}

// CoverageRail — the aggregate lens. Headline figures, then per-topic
// coverage bars. "Based on N interviews" is stated up front so the rail is
// honest about its sample size.
function CoverageRail({ stats, topics }) {
  // Zero state — no live plans means no interviews to aggregate. Show a
  // deliberate guiding message instead of a divide-by-zero set of bars.
  if (stats.interviews === 0) {
    return (
      <Card padX={20} padY={24} tone="outline" style={s.railCard}>
        <div style={s.railHead}>
          <span style={s.railEyebrow}>Across live plans</span>
          <span style={s.railTitle}>Knowledge coverage</span>
        </div>
        <div style={s.railEmpty}>
          <span style={s.railEmptyValue}>No interviews yet</span>
          <span style={s.railEmptyBody}>
            Publish an interview plan and coverage across candidates will build here as
            interviews are completed.
          </span>
        </div>
      </Card>
    );
  }

  return (
    <Card padX={20} padY={20} tone="outline" style={s.railCard}>
      <div style={s.railHead}>
        <span style={s.railEyebrow}>Across live plans</span>
        <span style={s.railTitle}>Knowledge coverage</span>
        <span style={s.railBasis}>
          Based on {stats.interviews} interviews across {stats.livePlans} live plans
        </span>
      </div>

      <div style={s.statRow}>
        <Stat value={stats.livePlans} label="Live plans" />
        <Stat value={stats.interviews} label="Interviews" />
        <Stat value={stats.thisWeek} label="This week" />
      </div>

      <ul style={s.topicList}>
        {topics.map((t) => {
          const pct = Math.round((t.covered / t.from) * 100);
          return (
            <li key={t.topic} style={s.topic}>
              <div style={s.topicHead}>
                <span style={s.topicName}>{t.topic}</span>
                <span style={s.topicCount}>{t.covered} of {t.from}</span>
              </div>
              <div
                style={s.topicTrack}
                role="img"
                aria-label={`${t.topic}: covered in ${t.covered} of ${t.from} interviews (${pct}%)`}
              >
                <div style={{ ...s.topicFill, width: `${pct}%` }} />
              </div>
            </li>
          );
        })}
      </ul>

      <div style={s.railNote}>
        <p style={s.railNoteTitle}>{COMPLIANCE_COPY.heading}</p>
        <p style={s.railNoteBody}>
          Coverage shows how much assigned knowledge candidates discussed — not whether
          anyone passed. Decisions stay with you; interviews are recorded for compliance.
        </p>
      </div>
    </Card>
  );
}

function Stat({ value, label }) {
  return (
    <div style={s.stat}>
      <span style={s.statValue}>{value}</span>
      <span style={s.statLabel}>{label}</span>
    </div>
  );
}

function EmptyState({ tab }) {
  return (
    <Card padX={32} padY={40} style={s.empty}>
      <span style={s.emptyIcon}><FaceScanIcon size={24} color="var(--color-icon-tertiary-fg)" /></span>
      <span style={s.emptyHeading}>No {tab?.toLowerCase()} interview plans</span>
      <span style={s.emptyBody}>Plans in this status will appear here.</span>
    </Card>
  );
}

const s = {
  column: { display: "flex", flexDirection: "column", gap: 20, width: "100%", fontFamily: "var(--font-sans)" },
  split: { display: "flex", gap: 24, alignItems: "flex-start" },
  leftCol: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 16 },
  list: { display: "flex", flexDirection: "column", gap: 12 },

  item: {
    display: "flex", alignItems: "flex-start", gap: 14, width: "100%",
    padding: 16, textAlign: "left", cursor: "pointer", boxSizing: "border-box",
    background: "var(--surface-white)", border: "1px solid var(--color-divider-card)",
    borderRadius: 12, fontFamily: "var(--font-sans)",
    transition: "box-shadow 150ms ease, border-color 150ms ease",
  },
  itemMain: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 8 },
  itemTitleRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 },
  itemName: { fontSize: 15, fontWeight: 700, color: "var(--color-text-deep)", lineHeight: 1.35, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  itemSub: { fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)" },
  itemMeterRow: { display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginTop: 2 },

  // Rail
  rail: { width: 320, flexShrink: 0 },
  railCard: { display: "flex", flexDirection: "column", gap: 18 },
  railHead: { display: "flex", flexDirection: "column", gap: 4 },
  railEyebrow: { fontSize: 11, fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase", color: "var(--color-text-tertiary)" },
  railTitle: { fontSize: 16, fontWeight: 700, color: "var(--color-text-deep)" },
  railBasis: { fontSize: 12, fontWeight: 400, color: "var(--color-text-tertiary)", lineHeight: 1.5 },

  statRow: { display: "flex", gap: 8, paddingBottom: 16, borderBottom: "1px solid var(--color-divider-card)" },
  stat: { flex: 1, display: "flex", flexDirection: "column", gap: 2, minWidth: 0 },
  statValue: { fontSize: 22, fontWeight: 700, color: "var(--color-text-deep)", lineHeight: 1.1, fontVariantNumeric: "tabular-nums" },
  statLabel: { fontSize: 11, fontWeight: 600, color: "var(--color-text-tertiary)" },

  topicList: { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 14 },
  topic: { display: "flex", flexDirection: "column", gap: 6 },
  topicHead: { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 },
  topicName: { fontSize: 13, fontWeight: 600, color: "var(--color-text-medium)", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  topicCount: { fontSize: 12, fontWeight: 600, color: "var(--color-text-tertiary)", fontVariantNumeric: "tabular-nums", flexShrink: 0 },
  topicTrack: { height: 6, borderRadius: 999, background: "var(--grey-200)", overflow: "hidden" },
  topicFill: { height: "100%", borderRadius: 999, background: "var(--chart-blue)", transition: "width 150ms ease" },

  railEmpty: { display: "flex", flexDirection: "column", gap: 6, paddingTop: 4 },
  railEmptyValue: { fontSize: 15, fontWeight: 700, color: "var(--color-text-deep)" },
  railEmptyBody: { fontSize: 12, fontWeight: 400, color: "var(--color-text-tertiary)", lineHeight: 1.5 },

  railNote: { background: "var(--color-info-bg)", borderRadius: 8, padding: "12px 14px" },
  railNoteTitle: { margin: 0, fontSize: 12, fontWeight: 700, color: "var(--color-info)" },
  railNoteBody: { margin: "4px 0 0", fontSize: 12, fontWeight: 400, color: "var(--color-info-text)", lineHeight: 1.5 },

  empty: { display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center" },
  emptyIcon: { width: 52, height: 52, borderRadius: 999, background: "var(--color-icon-tertiary-bg)", display: "inline-grid", placeItems: "center" },
  emptyHeading: { fontSize: 16, fontWeight: 700, color: "var(--color-text-deep)" },
  emptyBody: { fontSize: 13, fontWeight: 400, color: "var(--color-text-tertiary)", maxWidth: 320, lineHeight: 1.5 },
};
