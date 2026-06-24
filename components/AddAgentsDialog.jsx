"use client";

import React from "react";
import { Search } from "lucide-react";
import Modal from "./Modal";
import Toggle from "./Toggle";
import { TAG_META } from "./mocks/creditsUsage";

// AddAgentsDialog — approach C "Add agents" flow. Opens from the bucket
// folder and assigns agents into the open bucket. The "Unassigned only"
// toggle (on by default) limits the list to agents not yet in any bucket;
// turning it off also surfaces agents already folded into another bucket
// (assigning one moves them). Each row shows the agent's tenure tag. Search
// filters by name. Local picker state resets each time the dialog opens.
export default function AddAgentsDialog({ open, bucket, agents, onClose, onAdd }) {
  const [query, setQuery] = React.useState("");
  const [unassignedOnly, setUnassignedOnly] = React.useState(true);
  const [picked, setPicked] = React.useState([]);

  // Reset the picker whenever the dialog transitions closed → open.
  const [prevOpen, setPrevOpen] = React.useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setQuery("");
      setUnassignedOnly(true);
      setPicked([]);
    }
  }

  if (!open || !bucket) return null;

  const candidates = agents
    .filter((a) => a.bucketId !== bucket.id)
    .filter((a) => (unassignedOnly ? !a.bucketId : true))
    .filter((a) => a.name.toLowerCase().includes(query.trim().toLowerCase()));

  const toggle = (id) =>
    setPicked((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));

  const confirm = () => {
    if (picked.length) onAdd(picked, bucket.id);
    onClose();
  };

  const body = (
    <div style={styles.wrap}>
      <div style={styles.controls}>
        <label style={styles.searchWrap}>
          <Search size={15} color="var(--color-text-tertiary)" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search agents by name"
            aria-label="Search agents by name"
            style={styles.searchInput}
          />
        </label>
        <div style={styles.toggleWrap}>
          <Toggle enabled={unassignedOnly} onChange={setUnassignedOnly} ariaLabel="Unassigned agents only" />
          <span style={styles.toggleLabel}>Unassigned only</span>
        </div>
      </div>

      <div style={styles.list}>
        {candidates.length === 0 && (
          <span style={styles.hint}>
            {unassignedOnly
              ? "No unassigned agents to add — turn off Unassigned only to move agents from other buckets."
              : "No agents match your search."}
          </span>
        )}
        {candidates.map((a) => {
          const tag = TAG_META[a.tag] || TAG_META.new;
          return (
            <label key={a.id} style={styles.row}>
              <input
                type="checkbox"
                checked={picked.includes(a.id)}
                onChange={() => toggle(a.id)}
                style={styles.checkbox}
              />
              <span style={styles.name}>{a.name}</span>
              <span style={{ ...styles.tag, background: tag.bg, color: tag.fg }}>{tag.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );

  return (
    <Modal
      open={open}
      onDismiss={onClose}
      title={`Add agents to ${bucket.name}`}
      body={body}
      confirmLabel={picked.length ? `Add ${picked.length} ${picked.length === 1 ? "agent" : "agents"}` : "Add agents"}
      onConfirm={confirm}
      cancelLabel="Cancel"
    />
  );
}

const styles = {
  wrap: { display: "flex", flexDirection: "column", gap: 14 },
  controls: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" },
  searchWrap: {
    flex: 1,
    minWidth: 200,
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    border: "1px solid var(--color-border-card-soft)",
    borderRadius: 8,
    background: "#FFFFFF",
  },
  searchInput: {
    border: "none",
    outline: "none",
    fontFamily: "inherit",
    fontSize: 13,
    color: "var(--color-text-deep)",
    background: "transparent",
    width: "100%",
  },
  toggleWrap: { display: "flex", alignItems: "center", gap: 8 },
  toggleLabel: { fontSize: 12, fontWeight: 600, color: "var(--color-text-medium)", whiteSpace: "nowrap" },
  list: { display: "flex", flexDirection: "column", gap: 2, maxHeight: 260, overflowY: "auto" },
  hint: { padding: "16px 4px", fontSize: 13, fontWeight: 500, color: "var(--color-text-tertiary)" },
  row: { display: "flex", alignItems: "center", gap: 10, padding: "8px 4px", cursor: "pointer" },
  checkbox: { width: 16, height: 16, accentColor: "var(--do-brand-blue)", cursor: "pointer", flexShrink: 0 },
  name: { flex: 1, fontSize: 13, fontWeight: 500, color: "var(--color-text-deep)" },
  tag: { padding: "1px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600, letterSpacing: "0.2px", whiteSpace: "nowrap" },
};
