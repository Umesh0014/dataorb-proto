"use client";

import React from "react";
import { Gauge } from "lucide-react";
import PageHeader from "./PageHeader";
import PageLayout from "./PageLayout";
import StatCard from "./StatCard";
import { Section, CapacityBar, CapAlertBanner } from "./CreditsUsageParts";
import BucketCard from "./BucketCard";
import EstimatedImpactBanner from "./EstimatedImpactBanner";
import BucketAssignmentRegion from "./BucketAssignmentRegion";
import BucketFolderPanel from "./BucketFolderPanel";
import BucketFolderMerged from "./BucketFolderMerged";
import AgentBucketTable, { appliedCap } from "./AgentBucketTable";
import LimitRuleControl from "./LimitRuleControl";
import BucketDecisionControls from "./BucketDecisionControls";
import CreditsUsageAdjustPanel from "./CreditsUsageAdjustPanel";
import {
  WEEKLY_QUOTA,
  QUOTA_BUCKETS,
  AGENT_BUCKET_SAMPLE,
  RULE_DEFAULTS,
  estimateMonthlyDelta,
} from "./mocks/creditsUsage";

// CreditsUsagePage — the Credit & Usage admin surface (bucket / folding
// model). The weekly cap belongs to the agent; a bucket is a fixed-cap
// folding you sort agents into. This page owns all state and the right-
// panel; the VersionBar (in CreditsUsageShell) swaps only the Assignment
// region between approaches A/B/C — table, buckets, utilisation and rules
// stay mounted. All data is mock.
export default function CreditsUsagePage({ onBack, assignmentMode = "A" }) {
  const [agents, setAgents] = React.useState(AGENT_BUCKET_SAMPLE);
  const [buckets, setBuckets] = React.useState(QUOTA_BUCKETS);
  const [rules, setRules] = React.useState(RULE_DEFAULTS);
  const [selectedIds, setSelectedIds] = React.useState([]);
  const [selectedBucketId, setSelectedBucketId] = React.useState(QUOTA_BUCKETS[0].id);
  const [adjustAgent, setAdjustAgent] = React.useState(null);
  const [pendingChange, setPendingChange] = React.useState(null);

  // Swapping assignment approach resets only the approach-local selection —
  // the shared data (agents / buckets / rules) stays put. Done with the
  // documented "adjust state during render on prop change" pattern rather
  // than an effect (no cascading render).
  const [prevMode, setPrevMode] = React.useState(assignmentMode);
  if (assignmentMode !== prevMode) {
    setPrevMode(assignmentMode);
    setSelectedIds([]);
  }

  const agentsRef = React.useRef(null);
  const scrollToAgents = () => agentsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const setRule = (key, value) => setRules((prev) => ({ ...prev, [key]: value }));

  // moveAgents — fold a set of agents into a bucket, optionally with a
  // manual cap override. Adjusts tenant bucket counts and recomputes the
  // bill-impact forecast.
  const moveAgents = (ids, toBucketId, overrideCap = null) => {
    const idSet = new Set(ids);
    const moving = agents.filter((a) => idSet.has(a.id));
    const target = buckets.find((b) => b.id === toBucketId);
    if (!target) return;

    setAgents((prev) =>
      prev.map((a) =>
        idSet.has(a.id)
          ? { ...a, bucketId: toBucketId, override: overrideCap != null ? { capMin: overrideCap } : null }
          : a,
      ),
    );

    setBuckets((prev) => {
      const fromCounts = {};
      let into = 0;
      moving.forEach((a) => {
        if (a.bucketId !== toBucketId) {
          fromCounts[a.bucketId] = (fromCounts[a.bucketId] || 0) + 1;
          into += 1;
        }
      });
      return prev.map((b) => {
        let c = b.agentCount;
        if (fromCounts[b.id]) c -= fromCounts[b.id];
        if (b.id === toBucketId) c += into;
        return { ...b, agentCount: c };
      });
    });

    const capMin = overrideCap ?? target.capMin;
    const count = ids.length;
    setPendingChange({ count, bucketName: target.name, capMin, estDelta: estimateMonthlyDelta(count, capMin) });
  };

  const handleSaveAdjust = (agentId, { bucketId, manualCap }) => moveAgents([agentId], bucketId, manualCap);
  const handleBulkMove = (toBucketId) => {
    moveAgents(selectedIds, toBucketId);
    setSelectedIds([]);
  };

  const toggleSelect = (id) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  const toggleSelectAll = () =>
    setSelectedIds((prev) => (prev.length === agents.length ? [] : agents.map((a) => a.id)));

  // Over-cap consequence only applies when the rule actually pauses practice.
  const overCapCount = agents.filter((a) => a.usedMin >= appliedCap(a, buckets)).length;
  const overCap =
    rules.limitBehavior !== "allow_additional" && overCapCount > 0
      ? { count: overCapCount, resetDay: WEEKLY_QUOTA.resetDay }
      : null;

  const consumedPct = Math.round((WEEKLY_QUOTA.consumedMin / WEEKLY_QUOTA.totalMin) * 100);

  const adjustPanel = adjustAgent ? (
    <CreditsUsageAdjustPanel
      agent={adjustAgent}
      buckets={buckets}
      onClose={() => setAdjustAgent(null)}
      onSave={handleSaveAdjust}
    />
  ) : null;

  return (
    <PageLayout rightPanel={adjustPanel} onPanelClose={() => setAdjustAgent(null)}>
      <div style={styles.column}>
        <PageHeader
          back={onBack}
          identifier={{
            icon: <Gauge size={16} color="var(--color-icon-tertiary-fg)" />,
            label: "Credit & Usage",
            iconBg: "var(--color-icon-tertiary-bg)",
            iconColor: "var(--color-icon-tertiary-fg)",
          }}
          subtitle="Set weekly practice limits and track how your tenant's quota is used."
          primaryAction={{ label: "Save changes", onClick: () => console.log("save credits & usage") }}
        />

        {/* Tenant utilisation — shared header across approaches A/B/C */}
        <Section
          title="Credit utilisation"
          description={`${WEEKLY_QUOTA.consumedMin.toLocaleString()} of ${WEEKLY_QUOTA.totalMin.toLocaleString()} committed min used · ${WEEKLY_QUOTA.periodLabel}`}
        >
          <div style={styles.consumedLine}>
            <span style={styles.consumedPct}>{consumedPct}%</span>
            <span style={styles.consumedCaption}>of committed capacity consumed</span>
          </div>
          <CapacityBar used={WEEKLY_QUOTA.consumedMin} total={WEEKLY_QUOTA.totalMin} height={10} />
          <div style={styles.statRow}>
            <StatCard size="md" labelStyle="uppercase" label="Total pool" value={`${WEEKLY_QUOTA.totalMin.toLocaleString()} min`} sublabel={WEEKLY_QUOTA.totalSub} />
            <StatCard size="md" labelStyle="uppercase" label="Consumed" value={`${WEEKLY_QUOTA.consumedMin.toLocaleString()} min`} sublabel={WEEKLY_QUOTA.consumedSub} />
            <StatCard size="md" labelStyle="uppercase" label="Remaining" value={`${WEEKLY_QUOTA.remainingMin.toLocaleString()} min`} sublabel={WEEKLY_QUOTA.remainingSub} />
          </div>
          {overCap && (
            <CapAlertBanner
              count={overCap.count}
              resetDay={overCap.resetDay}
              onViewAgents={scrollToAgents}
            />
          )}
        </Section>

        <EstimatedImpactBanner pendingChange={pendingChange} />

        {/* Fixed quota buckets — C2 / C3 fold these into their merged card,
            so the standalone section is shown for every other approach. */}
        {assignmentMode !== "C2" && assignmentMode !== "C3" && (
          <Section
            title="Quota buckets"
            description="Each agent gets a weekly cap from one bucket. Buckets are fixed — move agents between them; the values don't change."
          >
            <div style={styles.bucketRow}>
              {buckets.map((b) => (
                <BucketCard
                  key={b.id}
                  bucket={b}
                  interactive={assignmentMode === "C1"}
                  selected={assignmentMode === "C1" && selectedBucketId === b.id}
                  onClick={() => setSelectedBucketId(b.id)}
                />
              ))}
            </div>
          </Section>
        )}

        {/* Assignment fork — A/B: region + standalone table; C1: inline
            bucket-folder; C2: merged buckets-and-folder card. */}
        {assignmentMode === "C1" && (
          <BucketFolderPanel
            bucket={buckets.find((b) => b.id === selectedBucketId) || null}
            agents={agents}
            buckets={buckets}
            onAssign={(ids, bucketId) => moveAgents(ids, bucketId)}
            onAdjust={setAdjustAgent}
          />
        )}
        {(assignmentMode === "C2" || assignmentMode === "C3") && (
          <BucketFolderMerged
            layout={assignmentMode === "C3" ? "top" : "rail"}
            buckets={buckets}
            agents={agents}
            selectedBucketId={selectedBucketId}
            onSelectBucket={setSelectedBucketId}
            onAssign={(ids, bucketId) => moveAgents(ids, bucketId)}
            onAdjust={setAdjustAgent}
          />
        )}
        {(assignmentMode === "A" || assignmentMode === "B") && (
          <>
            <BucketAssignmentRegion
              mode={assignmentMode}
              buckets={buckets}
              agents={agents}
              selectedIds={selectedIds}
              onBulkMove={handleBulkMove}
            />

            <div ref={agentsRef} style={styles.tableHead}>
              <span style={styles.tableTitle}>Agent usage</span>
              <span style={styles.count}>{agents.length} shown</span>
            </div>
            <AgentBucketTable
              agents={agents}
              buckets={buckets}
              paginate
              selectable={assignmentMode === "B"}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              onToggleSelectAll={toggleSelectAll}
              onAdjust={setAdjustAgent}
            />
          </>
        )}

        {/* Rules + decisions to confirm — two cards side by side */}
        <Section title="Rules">
          <div style={styles.rulesGrid}>
            <div style={styles.rulesPanel}>
              <LimitRuleControl
                value={rules.limitBehavior}
                onChange={(v) => setRule("limitBehavior", v)}
                additionalCapMin={rules.additionalCapMin}
                onAdditionalCapMin={(v) => setRule("additionalCapMin", v)}
              />
            </div>
            <div style={styles.rulesPanel}>
              <BucketDecisionControls rules={rules} onRuleChange={setRule} />
            </div>
          </div>
        </Section>
      </div>
    </PageLayout>
  );
}

const styles = {
  column: { display: "flex", flexDirection: "column", gap: 16, width: "100%", fontFamily: "var(--font-sans)" },
  consumedLine: { display: "flex", alignItems: "baseline", gap: 8 },
  consumedPct: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 28,
    fontWeight: 700,
    lineHeight: 1,
    color: "var(--color-text-deep)",
    fontVariantNumeric: "tabular-nums",
  },
  consumedCaption: { fontSize: 13, fontWeight: 500, color: "var(--color-text-tertiary)" },
  statRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 },
  bucketRow: { display: "flex", gap: 12, alignItems: "stretch" },
  tableHead: { display: "flex", alignItems: "center", gap: 12, marginTop: 8 },
  tableTitle: { fontSize: 14, fontWeight: 600, color: "var(--color-text-deep)" },
  count: {
    padding: "3px 10px",
    borderRadius: 999,
    background: "var(--color-card-emoji-bg)",
    fontSize: 11,
    fontWeight: 600,
    color: "var(--color-text-tertiary)",
  },
  rulesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 16,
    alignItems: "start",
  },
  rulesPanel: {
    padding: 16,
    borderRadius: 12,
    border: "1px solid var(--color-border-card-soft)",
    background: "#FFFFFF",
  },
};
