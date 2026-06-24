"use client";

import React from "react";
import { Gauge } from "lucide-react";
import PageHeader from "./PageHeader";
import PageLayout from "./PageLayout";
import { Section } from "./CreditsUsageParts";
import CreditUtilisationCard from "./CreditUtilisationCard";
import BucketCard from "./BucketCard";
import EstimatedImpactBanner from "./EstimatedImpactBanner";
import BucketAssignmentRegion from "./BucketAssignmentRegion";
import BucketFolderPanel from "./BucketFolderPanel";
import BucketFolderMerged from "./BucketFolderMerged";
import BulkMoveBar from "./BulkMoveBar";
import AgentBucketTable, { appliedCap, statusOf } from "./AgentBucketTable";
import LimitRuleControl from "./LimitRuleControl";
import BucketDecisionControls from "./BucketDecisionControls";
import CreditsUsageAdjustPanel from "./CreditsUsageAdjustPanel";
import CreditsUsageC5, { C5RulesFyi } from "./CreditsUsageC5";
import {
  WEEKLY_QUOTA,
  QUOTA_BUCKETS,
  QUOTA_BUCKETS_4,
  QUOTA_BUCKETS_3,
  AGENT_BUCKET_SAMPLE,
  AGENT_BUCKET_SAMPLE_4,
  AGENT_BUCKET_SAMPLE_3,
  RULE_DEFAULTS,
  estimateMonthlyDelta,
} from "./mocks/creditsUsage";

// CreditsUsagePage — the Credit & Usage admin surface (bucket / folding
// model). The weekly cap belongs to the agent; a bucket is a fixed-cap
// folding you sort agents into. This page owns all state and the right-
// panel; the VersionBar (in CreditsUsageShell) swaps only the Assignment
// region between approaches A/B/C — table, buckets, utilisation and rules
// stay mounted. All data is mock.
export default function CreditsUsagePage({ onBack, assignmentMode = "A", bulkPlacement = null }) {
  // C4 (four-tier) and C5 (three-tier, feedback-incorporated) each carry
  // their own bucket ladder + roster; the page is remounted across those
  // boundaries (see CreditsUsageShell) so the seed data is chosen once here.
  const isC4 = assignmentMode === "C4";
  const isC5 = assignmentMode === "C5";
  // C6a/C6b/C7 are C5 with editable + addable tiers. C6a edits inline, C6b/C7
  // via a dialog; C7 stacks tiers vertically (up to 10) and shares rules via a
  // modal instead of the in-card FYI. All share C5's three-tier seed + chrome.
  const isC6a = assignmentMode === "C6A";
  const isC6b = assignmentMode === "C6B";
  const isC7 = assignmentMode === "C7";
  const isC5Like = isC5 || isC6a || isC6b || isC7;
  const editMode = isC6a ? "inline" : isC6b || isC7 ? "dialog" : undefined;
  const seedBuckets = isC4 ? QUOTA_BUCKETS_4 : isC5Like ? QUOTA_BUCKETS_3 : QUOTA_BUCKETS;
  const seedAgents = isC4 ? AGENT_BUCKET_SAMPLE_4 : isC5Like ? AGENT_BUCKET_SAMPLE_3 : AGENT_BUCKET_SAMPLE;
  // C4 uses the auto-bump cap rule; C5/C6 render their own fixed rules.
  const seedRules = isC4 ? { ...RULE_DEFAULTS, limitBehavior: "auto_bump" } : RULE_DEFAULTS;

  const [agents, setAgents] = React.useState(seedAgents);
  const [buckets, setBuckets] = React.useState(seedBuckets);
  const [rules, setRules] = React.useState(seedRules);
  const [selectedIds, setSelectedIds] = React.useState([]);
  const [selectedBucketId, setSelectedBucketId] = React.useState(seedBuckets[0].id);
  const [adjustAgent, setAdjustAgent] = React.useState(null);
  const [pendingChange, setPendingChange] = React.useState(null);
  // C5 manager: null = closed, otherwise the tab to open on ("nearing" | id).
  const [manageTab, setManageTab] = React.useState(null);
  const { editBucket, addBucket, removeBucket } = useBucketEditor(buckets, setBuckets, setAgents, isC7 ? 10 : 5);

  // Swapping assignment approach resets only the approach-local selection —
  // the shared data (agents / buckets / rules) stays put. Done with the
  // documented "adjust state during render on prop change" pattern rather
  // than an effect (no cascading render).
  const [prevMode, setPrevMode] = React.useState(assignmentMode);
  if (assignmentMode !== prevMode) {
    setPrevMode(assignmentMode);
    setSelectedIds([]);
  }

  // Switching the open bucket (folder views) clears any in-flight selection
  // so checked agents never leak across buckets.
  const [prevBucket, setPrevBucket] = React.useState(selectedBucketId);
  if (selectedBucketId !== prevBucket) {
    setPrevBucket(selectedBucketId);
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
  // Select-all toggles every id in the table that called it (the full
  // roster for A/B, the open bucket's members for the folder views).
  const toggleSelectAll = (ids) =>
    setSelectedIds((prev) => (prev.length === ids.length ? [] : ids));

  // Over-cap consequence only applies when the rule actually pauses practice
  // — i.e. not when it lets the agent continue automatically (legacy
  // "allow_additional" or C4 "auto_bump").
  const capContinues = rules.limitBehavior === "allow_additional" || rules.limitBehavior === "auto_bump";
  const overCapCount = agents.filter((a) => a.usedMin >= appliedCap(a, buckets)).length;
  const overCap =
    !capContinues && overCapCount > 0
      ? { count: overCapCount, resetDay: WEEKLY_QUOTA.resetDay }
      : null;

  // C5/C6 docked alert: the amber/red over-limit notice; View agents opens the manager.
  const c5Alert = isC5Like ? c5OverAlert(agents, buckets) : null;

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
          primaryAction={
            isC5Like ? undefined : { label: "Save changes", size: "lg", onClick: () => console.log("save credits & usage") }
          }
        />

        {/* Tenant utilisation — shared header. C5 docks the amber/red
            over-limit notice here and routes View agents into the manager. */}
        <CreditUtilisationCard
          quota={WEEKLY_QUOTA}
          consumedPct={consumedPct}
          overCap={isC5Like ? c5Alert : overCap}
          onViewAgents={isC5Like ? () => setManageTab("nearing") : scrollToAgents}
          fyi={isC5Like && !isC7 ? <C5RulesFyi /> : null}
        />

        <EstimatedImpactBanner pendingChange={pendingChange} />

        {/* Standalone quota buckets — the merged approaches fold these in, and
            C5/C6 own their bucket strip, so this is for A/B/C1 only. */}
        <StandaloneBuckets
          mode={assignmentMode}
          buckets={buckets}
          selectedBucketId={selectedBucketId}
          onSelect={setSelectedBucketId}
        />

        {/* Assignment fork — A/B: region + standalone table; C1: inline
            bucket-folder; C2: merged buckets-and-folder card. */}
        {assignmentMode === "C1" && (
          <BucketFolderPanel
            bucket={buckets.find((b) => b.id === selectedBucketId) || null}
            agents={agents}
            buckets={buckets}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={toggleSelectAll}
            onBulkMove={handleBulkMove}
            onAssign={(ids, bucketId) => moveAgents(ids, bucketId)}
            onAdjust={setAdjustAgent}
          />
        )}
        {(assignmentMode === "C2" || assignmentMode === "C3" || assignmentMode === "C4" || assignmentMode === "BULK") && (
          <BucketFolderMerged
            layout={assignmentMode === "C2" ? "rail" : assignmentMode === "C4" ? "attached" : "top"}
            bulkPlacement={assignmentMode === "BULK" ? (bulkPlacement || "floating") : "top"}
            buckets={buckets}
            agents={agents}
            selectedBucketId={selectedBucketId}
            onSelectBucket={setSelectedBucketId}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={toggleSelectAll}
            onBulkMove={handleBulkMove}
            onAssign={(ids, bucketId) => moveAgents(ids, bucketId)}
          />
        )}
        {isC5Like && (
          <CreditsUsageC5
            agents={agents}
            buckets={buckets}
            manageTab={manageTab}
            onManageChange={setManageTab}
            onMove={(ids, bucketId) => moveAgents(ids, bucketId)}
            onSave={() => console.log("save credits & usage")}
            editMode={editMode}
            bucketLayout={isC7 ? "vertical" : undefined}
            rulesMode={isC7 ? "popover" : undefined}
            onEditBucket={editBucket}
            onAddBucket={addBucket}
            onRemoveBucket={removeBucket}
          />
        )}
        {(assignmentMode === "A" || assignmentMode === "B") && (
          <>
            <BucketAssignmentRegion mode={assignmentMode} buckets={buckets} />

            <div ref={agentsRef} style={styles.tableHead}>
              <span style={styles.tableTitle}>Agent usage</span>
              <span style={styles.count}>{agents.length} shown</span>
            </div>
            {selectedIds.length > 0 && (
              <BulkMoveBar count={selectedIds.length} buckets={buckets} onApply={handleBulkMove} />
            )}
            <AgentBucketTable
              agents={agents}
              buckets={buckets}
              paginate
              selectable
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              onToggleSelectAll={toggleSelectAll}
              onAdjust={setAdjustAgent}
            />
          </>
        )}

        {/* Rules + decisions to confirm. C5 owns its own fixed (never-block)
            rules, so the shared controls are skipped there. */}
        {!isC5Like && <RulesSection rules={rules} isC4={isC4} onRule={setRule} />}
      </div>
    </PageLayout>
  );
}

// StandaloneBuckets — the fixed quota-bucket cards for A/B/C1. The merged
// approaches (C2–C4, bulk) fold buckets into their own card, and C5/C6 own
// their bucket strip, so this renders nothing for those.
function StandaloneBuckets({ mode, buckets, selectedBucketId, onSelect }) {
  if (["C2", "C3", "C4", "BULK", "C5", "C6A", "C6B", "C7"].includes(mode)) return null;
  return (
    <Section
      title="Quota buckets"
      description="Each agent gets a weekly cap from one bucket. Buckets are fixed — move agents between them; the values don't change."
    >
      <div style={styles.bucketRow}>
        {buckets.map((b) => (
          <BucketCard
            key={b.id}
            bucket={b}
            interactive={mode === "C1"}
            selected={mode === "C1" && selectedBucketId === b.id}
            onClick={() => onSelect(b.id)}
          />
        ))}
      </div>
    </Section>
  );
}

// RulesSection — the two shared rule cards (limit behaviour + decisions to
// confirm). Same in every approach except C5/C6, which render their own fixed
// rules; kept out of the page body so the page function stays in budget.
function RulesSection({ rules, isC4, onRule }) {
  return (
    <Section title="Rules">
      <div style={styles.rulesGrid}>
        <div style={styles.rulesPanel}>
          <LimitRuleControl
            variant={isC4 ? "bucket" : "legacy"}
            value={rules.limitBehavior}
            onChange={(v) => onRule("limitBehavior", v)}
            additionalCapMin={rules.additionalCapMin}
            onAdditionalCapMin={(v) => onRule("additionalCapMin", v)}
            bumpScope={rules.bumpScope}
            onBumpScope={(v) => onRule("bumpScope", v)}
          />
        </div>
        <div style={styles.rulesPanel}>
          <BucketDecisionControls variant={isC4 ? "bucket" : "legacy"} rules={rules} onRuleChange={onRule} />
        </div>
      </div>
    </Section>
  );
}

// c5OverAlert — the docked over-limit notice for C5: amber while agents are
// only nearing their weekly cap, red once any is over it, null when everyone
// is on track. C5 never blocks, so the copy says practice continues.
function c5OverAlert(agents, buckets) {
  const over = agents.filter((a) => statusOf(a.usedMin, appliedCap(a, buckets)) === "at_cap").length;
  const near = agents.filter((a) => statusOf(a.usedMin, appliedCap(a, buckets)) === "near_limit").length;
  if (!over && !near) return null;
  if (over) {
    return { tone: "red", count: over, message: `${over} agent${over === 1 ? " is" : "s are"} over their weekly limit — they keep practising; review and upgrade their tier.` };
  }
  return { tone: "amber", count: near, message: `${near} agent${near === 1 ? " is" : "s are"} nearing their weekly limit.` };
}

// useBucketEditor — C6/C7 tier mutations over the page's buckets/agents state.
// Edits patch a tier; add appends a tier (from an optional {name, capMin} spec,
// capped at maxBuckets); remove reassigns the tier's agents to the first
// remaining tier and folds its count in.
function useBucketEditor(buckets, setBuckets, setAgents, maxBuckets = 5) {
  const seq = React.useRef(0);
  const editBucket = (id, patch) =>
    setBuckets((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  const addBucket = (spec) =>
    setBuckets((prev) =>
      prev.length >= maxBuckets
        ? prev
        : [...prev, { id: `tier-${seq.current++}`, name: spec?.name || "New tier", capMin: spec?.capMin || 30, agentCount: 0 }],
    );
  const removeBucket = (id) => {
    if (buckets.length <= 1) return;
    const removed = buckets.find((b) => b.id === id);
    const fallback = buckets.find((b) => b.id !== id);
    if (!fallback) return;
    setAgents((prev) => prev.map((a) => (a.bucketId === id ? { ...a, bucketId: fallback.id } : a)));
    setBuckets((prev) =>
      prev
        .filter((b) => b.id !== id)
        .map((b) => (b.id === fallback.id ? { ...b, agentCount: b.agentCount + (removed?.agentCount || 0) } : b)),
    );
  };
  return { editBucket, addBucket, removeBucket };
}

const styles = {
  column: { display: "flex", flexDirection: "column", gap: 16, width: "100%", fontFamily: "var(--font-sans)" },
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
