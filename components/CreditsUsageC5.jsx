"use client";

import React from "react";
import { Users } from "lucide-react";
import { Section } from "./CreditsUsageParts";
import Button from "./Button";
import BucketCard from "./BucketCard";
import AgentBucketTable, { appliedCap } from "./AgentBucketTable";
import ManageAgentsModal from "./ManageAgentsModal";

// CreditsUsageC5 — the C5 (feedback-incorporated) lower stack. Sits under the
// shared utilisation card (which now docks the amber→red over-limit banner)
// and owns everything else the product feedback locked:
//   • minutes-only, three fixed buckets (Kickstart 30 default / Momentum 45 /
//     Sprint 60); the shared table reads usedMin / capMin.
//   • a "Manage agents" button (the renamed + Add agent) opening the 4-tab
//     modal, plus the main roster sorted closest-to-breaking at the top.
//   • never-block rules — practice continues past the cap (shown as 39/30);
//     no hard stop, no "additional minutes" box, no "no weekly limit" option.
//   • Save moved to the very bottom of the page.
// The page owns the shared agents/buckets state, the move handlers, and the
// manager's open/tab state (so the docked banner's "View agents" opens it).
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
          emptyLabel="No agents yet — agents appear here once your tenant is provisioned."
        />
      </Section>

      <Section title="Rules" description="Non-editable — fixed for this tenant.">
        <div style={styles.rules}>
          <RuleLine
            label="When an agent reaches their weekly cap"
            lead="Never interrupted."
            note="Practice continues past the cap — a 10-minute call started with 1 minute left finishes. The overage shows on the dashboard (e.g. 39 / 30 min) so you see real usage."
          />
          <div style={styles.partition} />
          <RuleLine
            label="New agents"
            lead="Start in Kickstart (30 min)."
            note="Every new agent begins with the standard weekly cap and can be moved up a tier from Manage agents."
          />
          <div style={styles.partition} />
          <RuleLine
            label="Weekly reset"
            lead="Sunday, midnight."
            note="Practice minutes reset to zero automatically every Sunday at midnight."
          />
        </div>
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

function RuleLine({ label, lead, note }) {
  return (
    <div style={styles.ruleLine}>
      <span style={styles.ruleLabel}>{label}</span>
      <p style={styles.ruleNote}>
        <strong style={styles.ruleLead}>{lead}</strong> {note}
      </p>
    </div>
  );
}

const styles = {
  bucketRow: { display: "flex", gap: 12, alignItems: "stretch" },

  rules: { display: "flex", flexDirection: "column", gap: 16 },
  partition: { height: 1, background: "var(--color-border-card-soft)" },
  ruleLine: { display: "flex", flexDirection: "column", gap: 6 },
  ruleLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    color: "var(--color-text-tertiary)",
  },
  ruleNote: { margin: 0, fontSize: 13, fontWeight: 400, lineHeight: "20px", color: "var(--color-text-tertiary)" },
  ruleLead: { fontWeight: 700, color: "var(--color-text-deep)" },

  saveBar: { display: "flex", justifyContent: "flex-end", paddingTop: 4 },
};
