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
import AgentBucketTable, { appliedCap } from "./AgentBucketTable";
import LimitRuleControl from "./LimitRuleControl";
import BucketDecisionControls from "./BucketDecisionControls";
import CreditsUsageAdjustPanel from "./CreditsUsageAdjustPanel";
import {
  WEEKLY_QUOTA,
  QUOTA_BUCKETS,
  QUOTA_BUCKETS_4,
  AGENT_BUCKET_SAMPLE,
  AGENT_BUCKET_SAMPLE_4,
  RULE_DEFAULTS,
  estimateMonthlyDelta,
} from "./mocks/creditsUsage";

// CreditsUsagePage — the Credit & Usage admin surface (bucket / folding
// model). The weekly cap belongs to the agent; a bucket is a fixed-cap
// folding you sort agents into. This page owns all state and the right-
// panel; the VersionBar (in CreditsUsageShell) swaps only the Assignment
// region between approaches A/B/C — table, buckets, utilisation and rules
// stay mounted. All data is mock.
export default function CreditsUsagePage({ onBack, assignmentMode = "A", c5Placement = null }) {
  // C4 explores a four-tier ladder; the page is remounted across that
  // boundary (see CreditsUsageShell) so the seed data is chosen once here.
  const isC4 = assignmentMode === "C4";
  const seedBuckets = isC4 ? QUOTA_BUCKETS_4 : QUOTA_BUCKETS;
  const seedAgents = isC4 ? AGENT_BUCKET_SAMPLE_4 : AGENT_BUCKET_SAMPLE;
  // C4 uses the bucket-model cap rule (auto-bump default); the others keep
  // the legacy minute-based rule (hard-stop default).
  const seedRules = isC4 ? { ...RULE_DEFAULTS, limitBehavior: "auto_bump" } : RULE_DEFAULTS;

  const [agents, setAgents] = React.useState(seedAgents);
  const [buckets, setBuckets] = React.useState(seedBuckets);
  const [rules, setRules] = React.useState(seedRules);
  const [selectedIds, setSelectedIds] = React.useState([]);
  const [selectedBucketId, setSelectedBucketId] = React.useState(seedBuckets[0].id);
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
          primaryAction={{ label: "Save changes", size: "lg", onClick: () => console.log("save credits & usage") }}
        />

        {/* Tenant utilisation — shared header across approaches A/B/C */}
        <CreditUtilisationCard
          quota={WEEKLY_QUOTA}
          consumedPct={consumedPct}
          overCap={overCap}
          onViewAgents={scrollToAgents}
        />

        <EstimatedImpactBanner pendingChange={pendingChange} />

        {/* Fixed quota buckets — the merged approaches (C2 / C3 / C4) fold
            these into their card, so the standalone section is shown for the
            other approaches only. */}
        {assignmentMode !== "C2" && assignmentMode !== "C3" && assignmentMode !== "C4" && assignmentMode !== "C5" && (
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
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={toggleSelectAll}
            onBulkMove={handleBulkMove}
            onAssign={(ids, bucketId) => moveAgents(ids, bucketId)}
            onAdjust={setAdjustAgent}
          />
        )}
        {(assignmentMode === "C2" || assignmentMode === "C3" || assignmentMode === "C4" || assignmentMode === "C5") && (
          <BucketFolderMerged
            layout={assignmentMode === "C2" ? "rail" : assignmentMode === "C4" ? "attached" : "top"}
            bulkPlacement={assignmentMode === "C5" ? (c5Placement || "floating") : "top"}
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

        {/* Rules + decisions to confirm — two cards side by side */}
        <Section title="Rules">
          <div style={styles.rulesGrid}>
            <div style={styles.rulesPanel}>
              <LimitRuleControl
                variant={isC4 ? "bucket" : "legacy"}
                value={rules.limitBehavior}
                onChange={(v) => setRule("limitBehavior", v)}
                additionalCapMin={rules.additionalCapMin}
                onAdditionalCapMin={(v) => setRule("additionalCapMin", v)}
                bumpScope={rules.bumpScope}
                onBumpScope={(v) => setRule("bumpScope", v)}
              />
            </div>
            <div style={styles.rulesPanel}>
              <BucketDecisionControls variant={isC4 ? "bucket" : "legacy"} rules={rules} onRuleChange={setRule} />
            </div>
          </div>
        </Section>
      </div>
    </PageLayout>
  );
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
