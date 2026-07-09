"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { Section, CapacityBar } from "./CreditsUsageParts";
import StatCard from "./StatCard";
import Button from "./Button";
import AgentBucketTable from "./AgentBucketTable";
import GroupCard from "./GroupCard";
import SetAllowanceModal from "./SetAllowanceModal";
import MoveToBucketDialog from "./MoveToBucketDialog";
import { GOV_PLAN, GOV_GROUPS, GOV_LEARNERS, AVG_WEEKS_PER_MONTH } from "./mocks/creditsUsage";

// CreditsUsageGov — the Usage Governance page (C100), built to spec V1.1. Two
// sections: Plan & Allowance (the DataOrb-set tenant ceiling, read-only) and
// Allocation (the four fixed Usage Groups, admin-editable). Groups stand in for
// buckets and learners for agents, so the existing roster table + move dialog
// are reused; the governance model (ceiling, weekly allowance, default, the
// over-allocation projection) is what's new.
const fmt = (n) => n.toLocaleString();

export default function CreditsUsageGov() {
  const [groups, setGroups] = React.useState(GOV_GROUPS);
  const [learners, setLearners] = React.useState(GOV_LEARNERS);
  const [selectedId, setSelectedId] = React.useState(GOV_GROUPS.find((g) => g.isDefault)?.id || GOV_GROUPS[0].id);
  const [allowanceGroup, setAllowanceGroup] = React.useState(null);
  const [picked, setPicked] = React.useState([]);
  const [moveOpen, setMoveOpen] = React.useState(false);

  // Clear the learner selection when the open group changes.
  const [prevSel, setPrevSel] = React.useState(selectedId);
  if (selectedId !== prevSel) {
    setPrevSel(selectedId);
    setPicked([]);
  }

  const setAllowance = (id, capMin) => setGroups((gs) => gs.map((g) => (g.id === id ? { ...g, capMin } : g)));
  const setDefault = (id) => setGroups((gs) => gs.map((g) => ({ ...g, isDefault: g.id === id })));
  const rename = (id, name) => setGroups((gs) => gs.map((g) => (g.id === id ? { ...g, name } : g)));
  const togglePick = (lid) => setPicked((p) => (p.includes(lid) ? p.filter((x) => x !== lid) : [...p, lid]));
  const togglePickAll = (ids) => setPicked((p) => (p.length === ids.length ? [] : ids));
  const move = (targetId, ids) => {
    const next = learners.map((l) => (ids.includes(l.id) ? { ...l, bucketId: targetId } : l));
    setLearners(next);
    setGroups((gs) => gs.map((g) => ({ ...g, agentCount: next.filter((l) => l.bucketId === g.id).length })));
    setPicked([]);
  };

  // Over-allocation projection (§8.4): only groups with an allowance set count.
  const weekly = groups.reduce((s, g) => s + (g.capMin != null ? g.capMin * g.agentCount : 0), 0);
  const monthly = Math.round(weekly * AVG_WEEKS_PER_MONTH);
  const proj = projection(weekly, monthly, GOV_PLAN.monthlyAllowanceMin);

  const selectedGroup = groups.find((g) => g.id === selectedId) || groups[0];
  const tableLearners = learners.filter((l) => l.bucketId === selectedId);
  const moveBtn = (
    <Button variant="primary" size="sm" disabled={picked.length === 0} onClick={() => setMoveOpen(true)}>
      Move to group
    </Button>
  );

  return (
    <>
      <PlanSection plan={GOV_PLAN} />

      <Section title="Allocation" description="Distribute your monthly minutes into weekly allowances per group. Your plan allowance is the hard limit.">
        {proj && <GovBanner tone={proj.loud ? "error" : "warn"} message={proj.message} />}
        <div style={styles.groupGrid}>
          {groups.map((g) => (
            <GroupCard
              key={g.id}
              group={g}
              selected={g.id === selectedId}
              onSelect={setSelectedId}
              onSetAllowance={setAllowanceGroup}
              onSetDefault={setDefault}
              onRename={rename}
            />
          ))}
        </div>

        <div style={styles.detailHead}>
          <span style={styles.detailTitle}>{selectedGroup.name}</span>
          <span style={styles.detailMeta}>
            {selectedGroup.capMin != null ? `${selectedGroup.capMin} min / learner / week · ` : "No allowance set · "}
            {fmt(selectedGroup.agentCount)} learners
          </span>
        </div>
        <AgentBucketTable
          agents={tableLearners}
          buckets={groups}
          paginate
          showAdjust={false}
          showTag={false}
          showBucket={false}
          selectable
          selectedIds={picked}
          onToggleSelect={togglePick}
          onToggleSelectAll={togglePickAll}
          toolbarAction={moveBtn}
          emptyLabel="No learners in this group yet. Move learners here, or set it as the default."
        />
      </Section>

      <SetAllowanceModal open={allowanceGroup !== null} group={allowanceGroup} onClose={() => setAllowanceGroup(null)} onSave={setAllowance} />
      <MoveToBucketDialog
        open={moveOpen}
        agents={learners.filter((l) => picked.includes(l.id))}
        buckets={groups}
        onClose={() => setMoveOpen(false)}
        onConfirm={(groupId, ids) => move(groupId, ids)}
      />
    </>
  );
}

// PlanSection — Section 1 (read-only tenant ceiling): the % consumed, the
// monthly bar, the three figures, and the threshold banner (§6.2).
function PlanSection({ plan }) {
  const { monthlyAllowanceMin: allowance, overageBufferMin: overage, usedThisMonthMin: used, resetLabel } = plan;
  const pct = Math.round((used / allowance) * 100);
  const banner = monthlyBanner(used, allowance, overage, resetLabel);
  return (
    <Section title="Plan & Allowance" description="Your plan and this month's usage. Set by DataOrb in your agreement.">
      <div style={styles.consumedLine}>
        <span style={styles.consumedPct}>{pct}%</span>
        <span style={styles.consumedCaption}>of this month&apos;s allowance used</span>
      </div>
      <CapacityBar used={used} total={allowance} height={10} />
      <div style={styles.statRow}>
        <StatCard size="md" labelStyle="uppercase" label="Monthly allowance" value={`${fmt(allowance)} min`} sublabel="Resets on the 1st" />
        <StatCard size="md" labelStyle="uppercase" label="Overage buffer" value={`+${fmt(overage)} min`} sublabel="Billed at your overage rate" />
        <StatCard size="md" labelStyle="uppercase" label="Used this month" value={`${fmt(used)} min`} sublabel={`${pct}% · Resets ${resetLabel}`} />
      </div>
      {banner && <GovBanner tone={banner.tone} message={banner.message} />}
    </Section>
  );
}

function GovBanner({ tone, message }) {
  const t =
    tone === "error"
      ? { bg: "var(--color-error-bg)", border: "rgba(211,47,47,0.18)", fg: "var(--color-error)", text: "var(--color-error-text)" }
      : { bg: "var(--color-warning-bg)", border: "rgba(239,108,0,0.18)", fg: "var(--color-warning)", text: "var(--color-warning-text)" };
  return (
    <div style={{ ...styles.banner, background: t.bg, borderColor: t.border }}>
      <span style={{ ...styles.bannerIcon, color: t.fg }}>
        <AlertTriangle size={16} />
      </span>
      <span style={{ ...styles.bannerText, color: t.text }}>{message}</span>
    </div>
  );
}

// §6.2 monthly-bar threshold states.
function monthlyBanner(used, allowance, overage, resetLabel) {
  if (used >= allowance + overage) return { tone: "error", message: `Monthly limit reached. New Learning Hub audio sessions are paused until ${resetLabel}.` };
  if (used >= allowance) return { tone: "error", message: `Monthly allowance reached — now drawing from your ${fmt(overage)}-minute overage buffer.` };
  if (used / allowance >= 0.8) return { tone: "warn", message: "You've used 80% of this month's allowance." };
  return null;
}

// §8.4 two trip-wires: A (weekly over-projection) is loud, B (monthly) advisory.
function projection(weekly, monthly, allowance) {
  if (weekly > allowance) {
    return { loud: true, message: `Your weekly allowances project ~${fmt(weekly)} min/week — more than your entire ${fmt(allowance)} monthly plan. Consumption will stop when the monthly limit is reached.` };
  }
  if (monthly > allowance) {
    return { loud: false, message: `Your groups project ~${fmt(monthly)} min/month, above your ${fmt(allowance)} plan. The monthly limit still applies and stops consumption first.` };
  }
  return null;
}

const styles = {
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
  banner: { display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 10, border: "1px solid", marginTop: 4, marginBottom: 14 },
  bannerIcon: { display: "inline-flex", flexShrink: 0 },
  bannerText: { fontSize: 13, fontWeight: 600 },
  groupGrid: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 },
  detailHead: { display: "flex", alignItems: "baseline", gap: 10, marginTop: 20, marginBottom: 10 },
  detailTitle: { fontSize: 15, fontWeight: 700, color: "var(--color-text-deep)" },
  detailMeta: { fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)" },
};
