"use client";

import React from "react";
import { Users, Info } from "lucide-react";
import { Section } from "./CreditsUsageParts";
import Button from "./Button";
import BucketCard from "./BucketCard";
import BucketEditor from "./BucketEditor";
import BucketEditorDialog from "./BucketEditorDialog";
import EditModeToggle from "./EditModeToggle";
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
export default function CreditsUsageC5({
  agents,
  buckets,
  manageTab,
  onManageChange,
  onMove,
  onSave,
  editMode,
  editToggle,
  bucketLayout,
  onEditBucket,
  onAddBucket,
  onRemoveBucket,
}) {
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

  // C6 carries the edit mode as an in-page a/b toggle; C7 fixes it to dialog.
  const [c6Mode, setC6Mode] = React.useState("inline");
  const effectiveMode = editToggle ? c6Mode : editMode;

  // Dialog editing doubles as a folder: clicking a tier selects it and the
  // table shows that tier's agents (editing is the per-card pencil). The
  // inline and read-only tables show the whole roster.
  const isDialog = effectiveMode === "dialog";
  const [selectedBucketId, setSelectedBucketId] = React.useState(buckets[0]?.id);
  const selectedId = buckets.some((b) => b.id === selectedBucketId) ? selectedBucketId : buckets[0]?.id;
  const tableAgents = isDialog ? sorted.filter((a) => a.bucketId === selectedId) : sorted;

  // C7 ("rail") stacks the editable tiers in a left rail beside the table, the
  // way C2 lays out its buckets; the others keep the strip above the table.
  const rail = bucketLayout === "rail";
  const bucketStrip =
    effectiveMode === "inline" ? (
      <BucketEditor buckets={buckets} onEdit={onEditBucket} onAdd={onAddBucket} onRemove={onRemoveBucket} />
    ) : isDialog ? (
      <BucketEditorDialog
        buckets={buckets}
        vertical={rail}
        maxBuckets={rail ? 10 : 5}
        selectedId={selectedId}
        onSelect={setSelectedBucketId}
        onEdit={onEditBucket}
        onAdd={onAddBucket}
        onRemove={onRemoveBucket}
      />
    ) : (
      <div style={styles.bucketRow}>
        {buckets.map((b) => (
          <BucketCard key={b.id} bucket={b} />
        ))}
      </div>
    );
  const table = (
    <AgentBucketTable
      agents={tableAgents}
      buckets={buckets}
      paginate
      showAdjust={false}
      showTag={false}
      emptyLabel="No agents yet — agents appear here once your tenant is provisioned."
    />
  );

  return (
    <>
      <Section
        title="Quota buckets & assignment"
        description={
          effectiveMode
            ? `Edit each tier's name and weekly cap, or add up to ${rail ? 10 : 5} tiers. Every agent draws their cap from the tier they're in.`
            : "Every agent gets a weekly cap from one of three buckets. New agents start in Kickstart (30 min); move people up a tier as they ramp."
        }
        headerRight={
          <Button variant="primary" size="sm" leadingIcon={<Users size={15} />} onClick={() => onManageChange("nearing")}>
            Manage agents
          </Button>
        }
      >
        {rail ? (
          <div style={styles.split}>
            <div style={styles.railCol}>{bucketStrip}</div>
            <div style={styles.main}>{table}</div>
          </div>
        ) : editToggle ? (
          <>
            <div style={styles.toggleRow}>
              <div style={styles.toggleCards}>{bucketStrip}</div>
              <EditModeToggle value={c6Mode} onChange={setC6Mode} />
            </div>
            {table}
          </>
        ) : (
          <>
            {bucketStrip}
            {table}
          </>
        )}
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

// RULES — the fixed (non-editable) practice-limit rules, shared by the in-card
// FYI (C5 / C6) and the on-demand popover (C7).
const RULES = [
  { lead: "Never interrupted mid-session", note: "Sessions in progress always finish. Past the cap, no new ones until moved up a tier." },
  { lead: "New agents start in Kickstart", note: "30 min / week by default." },
  { lead: "Weekly reset", note: "Minutes reset every Sunday at midnight." },
];

function RulesList() {
  return (
    <div style={styles.ruleStack}>
      {RULES.map((r) => (
        <div key={r.lead} style={styles.ruleItem}>
          <span style={styles.ruleLead}>{r.lead}</span>
          <span style={styles.ruleNote}>{r.note}</span>
        </div>
      ))}
    </div>
  );
}

// C5RulesFyi — the rules rendered inside the utilisation card as a read-only
// FYI (C5 / C6a / C6b).
export function C5RulesFyi() {
  return (
    <div style={styles.fyi}>
      <div style={styles.fyiHead}>
        <Info size={14} color="var(--color-icon-tertiary-fg)" style={{ flexShrink: 0 }} aria-hidden="true" />
        <span style={styles.fyiTitle}>How weekly limits work</span>
        <span style={styles.fyiTag}>Fixed</span>
      </div>
      <RulesList />
    </div>
  );
}

// RulesPopover — C7's alternative to the in-card FYI: a "How limits work"
// trigger (docked in the utilisation card header) that drops a small popover
// with the same rules.
export function RulesPopover() {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ position: "relative" }}>
      <Button
        variant="text"
        uppercase={false}
        leadingIcon={<Info size={15} />}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        How limits work
      </Button>
      {open && (
        <>
          <div style={styles.popScrim} onClick={() => setOpen(false)} aria-hidden="true" />
          <div role="dialog" aria-label="How weekly limits work" style={styles.popPanel}>
            <div style={styles.fyiHead}>
              <span style={styles.fyiTitle}>How weekly limits work</span>
              <span style={styles.fyiTag}>Fixed</span>
            </div>
            <RulesList />
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  bucketRow: { display: "flex", gap: 12, alignItems: "stretch" },
  saveBar: { display: "flex", justifyContent: "flex-end", paddingTop: 4 },

  split: { display: "flex", gap: 24, alignItems: "flex-start" },
  railCol: { width: 200, flexShrink: 0 },
  main: { flex: 1, minWidth: 0 },
  toggleRow: { display: "flex", gap: 16, alignItems: "flex-start" },
  toggleCards: { flex: 1, minWidth: 0 },

  popScrim: { position: "fixed", inset: 0, background: "transparent", zIndex: 39 },
  popPanel: {
    position: "absolute",
    top: "calc(100% + 8px)",
    insetInlineEnd: 0,
    zIndex: 40,
    width: 320,
    maxWidth: "calc(100vw - 48px)",
    background: "#FFFFFF",
    border: "1px solid var(--color-border-card-soft)",
    borderRadius: 12,
    boxShadow: "var(--shadow-8)",
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    boxSizing: "border-box",
  },

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
    color: "var(--color-text-tertiary)",
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.6px",
  },
  ruleStack: { display: "flex", flexDirection: "column", gap: 12 },
  ruleItem: { display: "flex", flexDirection: "column", gap: 2 },
  ruleLead: { fontSize: 13, fontWeight: 700, color: "var(--color-text-deep)" },
  ruleNote: { fontSize: 12, fontWeight: 400, lineHeight: "18px", color: "var(--color-text-tertiary)" },
};
