"use client";

import React from "react";
import { createPortal } from "react-dom";
import { X, Search } from "lucide-react";
import Button from "./Button";
import Select from "./Select";
import { CapacityBar } from "./CreditsUsageParts";
import { appliedCap, statusOf } from "./AgentBucketTable";

// MoveToBucketDialog — C8's "Manage agents" flow: the checked agents move to
// one chosen tier. Mirrors the manager's layout — the selected agents are
// listed, with search + a "Move to tier" selector on top and a single Move CTA
// at the bottom. The tier(s) the agents are already in are excluded from the
// options (you can't move them to where they already are).
const AVATAR_COLORS = [
  "var(--chart-blue)",
  "var(--chart-teal)",
  "var(--chart-lavender)",
  "var(--chart-orange)",
  "var(--chart-pink)",
  "var(--chart-green)",
];
const STATUS_TONE = { near_limit: "var(--color-warning)", at_cap: "var(--color-error)", on_track: "var(--color-success)" };

export default function MoveToBucketDialog({ open, agents, buckets, onClose, onConfirm }) {
  const [picked, setPicked] = React.useState([]);
  const [query, setQuery] = React.useState("");
  const [target, setTarget] = React.useState("");

  // Re-seed (all agents checked, cleared filters) each time it opens.
  const [prevOpen, setPrevOpen] = React.useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setPicked(agents.map((a) => a.id));
      setQuery("");
      setTarget("");
    }
  }

  React.useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") { e.stopPropagation(); onClose?.(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  // The source tier(s) of the selected agents are not valid destinations.
  const sourceIds = new Set(agents.map((a) => a.bucketId));
  const options = buckets.filter((b) => !sourceIds.has(b.id)).map((b) => ({ value: b.id, label: `${b.name} (${b.capMin} min)` }));
  const targetBucket = buckets.find((b) => b.id === target);
  // Net weekly minutes the move commits: Σ (new cap − current cap) over the
  // checked agents. Positive when moving up a tier, negative when moving down.
  const deltaMin = targetBucket
    ? picked.reduce((sum, id) => {
        const a = agents.find((x) => x.id === id);
        return a ? sum + (targetBucket.capMin - appliedCap(a, buckets)) : sum;
      }, 0)
    : 0;

  const q = query.trim().toLowerCase();
  const visible = q ? agents.filter((a) => a.name.toLowerCase().includes(q)) : agents;
  const toggle = (id) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const allOn = visible.length > 0 && visible.every((a) => picked.includes(a.id));
  const toggleAll = () => setPicked(allOn ? [] : visible.map((a) => a.id));
  const move = () => {
    if (!target || !picked.length) return;
    onConfirm(target, picked);
    onClose();
  };

  return createPortal(
    <div style={styles.scrim} onClick={onClose} role="presentation">
      <div role="dialog" aria-modal="true" aria-label="Move agents to a tier" onClick={(e) => e.stopPropagation()} style={styles.panel}>
        <header style={styles.head}>
          <div style={styles.headText}>
            <h2 style={styles.title}>Move agents to a tier</h2>
            <p style={styles.sub}>Pick a destination tier for the selected agents. Their current tier isn&apos;t an option.</p>
          </div>
          <Button variant="icon" aria-label="Close" onClick={onClose}>
            <X size={18} />
          </Button>
        </header>

        <div style={styles.toolbar}>
          <label style={styles.searchWrap}>
            <Search size={16} color="var(--color-text-tertiary)" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search agents by name"
              aria-label="Search agents by name"
              style={styles.searchInput}
            />
          </label>
          <Select value={target} onChange={setTarget} placeholder="Move to tier…" ariaLabel="Destination tier" options={options} />
        </div>

        <div style={styles.tableHead}>
          <input type="checkbox" checked={allOn} onChange={toggleAll} aria-label="Select all" style={styles.checkbox} disabled={visible.length === 0} />
          <span style={styles.th}>Agent</span>
          <span style={styles.th}>Tier</span>
          <span style={styles.th}>Weekly usage</span>
        </div>

        <div style={styles.list}>
          {visible.length === 0 && <p style={styles.empty}>No agents match your search.</p>}
          {visible.map((a) => {
            const cap = appliedCap(a, buckets);
            const status = statusOf(a.usedMin, cap);
            const bucket = buckets.find((b) => b.id === a.bucketId);
            const checked = picked.includes(a.id);
            return (
              <label key={a.id} style={{ ...styles.row, background: checked ? "var(--color-icon-tertiary-bg)" : "transparent" }}>
                <input type="checkbox" checked={checked} onChange={() => toggle(a.id)} style={styles.checkbox} aria-label={`Select ${a.name}`} />
                <span style={styles.agentCell}>
                  <span style={{ ...styles.avatar, background: AVATAR_COLORS[a.id % AVATAR_COLORS.length] }}>{initials(a.name)}</span>
                  <span style={styles.name}>{a.name}</span>
                </span>
                <span style={styles.tier}>{bucket ? `${bucket.name} (${bucket.capMin})` : "—"}</span>
                <span style={styles.usageCell}>
                  <span style={styles.usageBar}><CapacityBar used={a.usedMin} total={cap} height={6} /></span>
                  <span style={{ ...styles.usageVal, color: STATUS_TONE[status] }}>{a.usedMin} / {cap}</span>
                </span>
              </label>
            );
          })}
        </div>

        <footer style={styles.foot}>
          <span style={styles.footLead}>
            <strong style={styles.footCount}>{picked.length}</strong> selected
          </span>
          <div style={styles.footRight}>
            {targetBucket && picked.length > 0 && (
              <span style={styles.impact}>
                {deltaMin >= 0 ? "+" : "−"}{Math.abs(deltaMin).toLocaleString()} min / week {deltaMin >= 0 ? "added" : "freed"}
              </span>
            )}
            <Button variant="primary" disabled={!target || !picked.length} onClick={move} style={{ height: 40, paddingInline: 22 }}>
              {targetBucket ? `Move to ${targetBucket.name}` : "Move"}
            </Button>
          </div>
        </footer>
      </div>
    </div>,
    document.body,
  );
}

function initials(name) {
  return name.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

const COL_GRID = "22px minmax(180px, 1.6fr) 150px minmax(170px, 1.2fr)";

const styles = {
  scrim: {
    position: "fixed",
    inset: 0,
    zIndex: 60,
    background: "rgba(15, 18, 36, 0.48)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  panel: {
    width: "min(680px, 100%)",
    maxHeight: "calc(100vh - 48px)",
    background: "#FFFFFF",
    borderRadius: "var(--radius-card)",
    boxShadow: "var(--shadow-8)",
    fontFamily: "var(--font-sans)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  head: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, padding: "22px 28px 14px" },
  headText: { display: "flex", flexDirection: "column", gap: 4, minWidth: 0 },
  title: { margin: 0, fontSize: 18, fontWeight: 700, color: "var(--color-text-deep)", lineHeight: 1.3, letterSpacing: "-0.01em" },
  sub: { margin: 0, fontSize: 13, fontWeight: 400, color: "var(--color-text-tertiary)", lineHeight: "18px" },

  toolbar: { display: "flex", alignItems: "center", gap: 12, padding: "4px 28px 14px" },
  searchWrap: {
    flex: 1,
    minWidth: 200,
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "9px 14px",
    border: "1px solid var(--color-border-card-soft)",
    borderRadius: "var(--radius-md)",
    background: "#FFFFFF",
  },
  searchInput: { border: "none", outline: "none", fontFamily: "inherit", fontSize: 13, color: "var(--color-text-deep)", background: "transparent", width: "100%" },

  tableHead: {
    display: "grid",
    gridTemplateColumns: COL_GRID,
    alignItems: "center",
    gap: 14,
    padding: "0 28px 10px",
    borderBottom: "1px solid var(--color-divider-card)",
  },
  th: { fontSize: 11, fontWeight: 700, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" },

  list: { flex: 1, overflowY: "auto", padding: "4px 16px" },
  empty: { padding: "40px 0", textAlign: "center", fontSize: 13, fontWeight: 500, color: "var(--color-text-tertiary)" },
  row: {
    display: "grid",
    gridTemplateColumns: COL_GRID,
    alignItems: "center",
    gap: 14,
    padding: "10px 12px",
    margin: "1px 0",
    borderRadius: "var(--radius-md)",
    cursor: "pointer",
  },
  checkbox: { width: 16, height: 16, accentColor: "var(--do-brand-blue)", cursor: "pointer", flexShrink: 0 },
  agentCell: { display: "flex", alignItems: "center", gap: 11, minWidth: 0 },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: "50%",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: 700,
    flexShrink: 0,
  },
  name: { fontSize: 13, fontWeight: 600, color: "var(--color-text-deep)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  tier: { fontSize: 12, fontWeight: 500, color: "var(--color-text-medium)", whiteSpace: "nowrap" },
  usageCell: { display: "flex", alignItems: "center", gap: 10, minWidth: 0 },
  usageBar: { flex: 1, minWidth: 0 },
  usageVal: { fontSize: 12, fontWeight: 700, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" },

  foot: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    padding: "16px 28px",
    borderTop: "1px solid var(--color-divider-card)",
    flexWrap: "wrap",
  },
  footLead: { fontSize: 13, fontWeight: 500, color: "var(--color-text-tertiary)" },
  footCount: { fontWeight: 700, color: "var(--color-text-deep)" },
  footRight: { display: "flex", alignItems: "center", gap: 16 },
  impact: { fontSize: 12, fontWeight: 600, color: "var(--color-text-medium)", whiteSpace: "nowrap" },
};
