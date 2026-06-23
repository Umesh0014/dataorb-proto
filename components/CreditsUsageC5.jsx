"use client";

import React from "react";
import { Users, Info } from "lucide-react";
import { Section } from "./CreditsUsageParts";
import Button from "./Button";
import BucketCard from "./BucketCard";
import AgentBucketTable, { appliedCap } from "./AgentBucketTable";
import ManageAgentsModal from "./ManageAgentsModal";

// CreditsUsageC5 — the C5 (feedback-incorporated) lower stack. Sits under the
// shared utilisation card (which docks the amber→red over-limit banner and the
// C5RulesFyi notice) and owns the rest of what the product feedback locked:
//   • minutes-only, three fixed buckets (Kickstart 30 default / Momentum 45 /
//     Sprint 60); the shared table reads usedMin / capMin and drops the tenure
//     tags for this surface.
//   • a "Manage agents" button (the renamed + Add agent) opening the 4-tab
//     modal, plus the main roster sorted closest-to-breaking at the top.
//   • Save moved to the very bottom of the page.
// The fixed (non-editable) rules now ride along in the utilisation card as an
// FYI — see C5RulesFyi below. The page owns shared state + the manager's tab.
export default function CreditsUsageC5({ agents, buckets, manageTab, onManageChange, onMove, onSave }) {
  // Bump each agent one tier up the fixed ladder (Kickstart → Momentum →
  // Sprint); already-top agents stay. Grouped by destination so each target
  // is a single move and the bucket counts stay correct.
  const handleUpgradeTier = (ids) => {
    const order = buckets.map((b) => b.id);
    const byTarget = {};
    ids.forEach((id) => {
      const agent = agents.find((a) => a.id === id);
      if (!agent) return;
      const idx = order.indexOf(agent.bucketId);
      if (idx < 0 || idx >= order.length - 1) return;
      (byTarget[order[idx + 1]] = byTarget[order[idx + 1]] || []).push(id);
    });
    Object.entries(byTarget).forEach(([toBucketId, groupIds]) => onMove(groupIds, toBucketId));
  };

  // Closest-to-breaking first: rank every agent by how far into (or past)
  // their cap they are, so the people who need attention sit at the top.
  const ratio = (a) => {
    const cap = appliedCap(a, buckets);
    return cap > 0 ? a.usedMin / cap : 0;
  };
  const sorted = [...agents].sort((a, b) => ratio(b) - ratio(a));

  return (
    <>
      <Section
        title="Quota buckets & assignment"
        description="Every agent gets a weekly cap from one of three buckets. New agents start in Kickstart (30 min); move people up a tier as they ramp."
        headerRight={
          <Button variant="primary" size="sm" leadingIcon={<Users size={15} />} onClick={() => onManageChange("nearing")}>
            Manage agents
          </Button>
        }
      >
        <div style={styles.bucketRow}>
          {buckets.map((b) => (
            <BucketCard key={b.id} bucket={b} />
          ))}
        </div>
        <AgentBucketTable
          agents={sorted}
          buckets={buckets}
          paginate
          showAdjust={false}
          showTag={false}
          emptyLabel="No agents yet — agents appear here once your tenant is provisioned."
        />
      </Section>

      <div style={styles.saveBar}>
        <Button variant="primary" size="lg" onClick={onSave} style={{ height: 40 }}>
          Save changes
        </Button>
      </div>

      <ManageAgentsModal
        open={manageTab !== null}
        initialTab={manageTab || "nearing"}
        buckets={buckets}
        agents={agents}
        onClose={() => onManageChange(null)}
        onMove={onMove}
        onUpgradeTier={handleUpgradeTier}
      />
    </>
  );
}

// C5RulesFyi — the fixed (non-editable) practice-limit rules, rendered inside
// the utilisation card as a read-only FYI rather than a standalone section.
export function C5RulesFyi() {
  return (
    <div style={styles.fyi}>
      <div style={styles.fyiHead}>
        <Info size={14} color="var(--color-icon-tertiary-fg)" style={{ flexShrink: 0 }} aria-hidden="true" />
        <span style={styles.fyiTitle}>How weekly limits work</span>
        <span style={styles.fyiTag}>Fixed</span>
      </div>
      <ul style={styles.fyiList}>
        <li style={styles.fyiItem}>
          <strong style={styles.fyiLead}>Never interrupted mid-session.</strong> An in-progress session finishes (e.g. 39 / 30); once over the cap, no new sessions until a manager moves the agent up a tier (45 / 60).
        </li>
        <li style={styles.fyiItem}>
          <strong style={styles.fyiLead}>New agents start in Kickstart</strong> — 30 min / week by default.
        </li>
        <li style={styles.fyiItem}>
          <strong style={styles.fyiLead}>Weekly reset</strong> — minutes reset every Sunday at midnight.
        </li>
      </ul>
    </div>
  );
}

const styles = {
  bucketRow: { display: "flex", gap: 12, alignItems: "stretch" },
  saveBar: { display: "flex", justifyContent: "flex-end", paddingTop: 4 },

  fyi: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    padding: "12px 16px",
    borderRadius: 10,
    background: "var(--color-icon-tertiary-bg)",
    border: "1px solid rgba(102, 80, 165, 0.12)",
  },
  fyiHead: { display: "flex", alignItems: "center", gap: 8 },
  fyiTitle: { fontSize: 12, fontWeight: 700, color: "var(--color-text-deep)", letterSpacing: "0.01em" },
  fyiTag: {
    marginInlineStart: "auto",
    padding: "1px 8px",
    borderRadius: 999,
    background: "#FFFFFF",
    color: "var(--color-icon-tertiary-fg)",
    fontSize: 10,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.4px",
  },
  fyiList: { margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 },
  fyiItem: { fontSize: 12, fontWeight: 400, lineHeight: "18px", color: "var(--color-text-medium)" },
  fyiLead: { fontWeight: 700, color: "var(--color-text-deep)" },
};
