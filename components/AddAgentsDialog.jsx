"use client";

import React from "react";
import { Search } from "lucide-react";
import Modal from "./Modal";
import Toggle from "./Toggle";
import { QUOTA_BUCKETS } from "./mocks/creditsUsage";

// AddAgentsDialog — approach C "Add agents" flow. Opens from the bucket
// folder and assigns agents into the open bucket. By default it lists only
// active (unassigned) agents; the toggle beside the search widens it to all
// agents, including those already folded into another bucket (assigning one
// moves them). Search filters the list by name. Local picker state resets
// each time the dialog opens. Reuses the shared Modal primitive.
export default function AddAgentsDialog({ open, bucket, agents, onClose, onAdd }) {
  const [query, setQuery] = React.useState("");
  const [showAll, setShowAll] = React.useState(false);
  const [picked, setPicked] = React.useState([]);

  // Reset the picker whenever the dialog transitions closed → open.
  const [prevOpen, setPrevOpen] = React.useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setQuery("");
      setShowAll(false);
      setPicked([]);
    }
  }

  if (!open || !bucket) return null;

  const bucketName = (id) => QUOTA_BUCKETS.find((b) => b.id === id)?.name;
  const candidates = agents
    .filter((a) => a.bucketId !== bucket.id)
    .filter((a) => (showAll ? true : !a.bucketId))
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
          <Toggle enabled={showAll} onChange={setShowAll} ariaLabel="Show all agents" />
          <span style={styles.toggleLabel}>{showAll ? "All agents" : "Active agents"}</span>
        </div>
      </div>

      <div style={styles.list}>
        {candidates.length === 0 && (
          <span style={styles.hint}>
            {showAll ? "No agents match your search." : "No active agents to add — toggle to all agents."}
          </span>
        )}
        {candidates.map((a) => (
          <label key={a.id} style={styles.row}>
            <input
              type="checkbox"
              checked={picked.includes(a.id)}
              onChange={() => toggle(a.id)}
              style={styles.checkbox}
            />
            <span style={styles.name}>{a.name}</span>
            <span style={styles.meta}>{a.bucketId ? bucketName(a.bucketId) : "Unassigned"}</span>
          </label>
        ))}
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
  meta: { fontSize: 11, fontWeight: 500, color: "var(--color-text-tertiary)" },
};
