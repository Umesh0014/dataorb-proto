"use client";

import React from "react";
import { Search, Plus } from "lucide-react";
import { Section } from "./CreditsUsageParts";
import Button from "./Button";
import Toggle from "./Toggle";
import BucketFacepile from "./BucketFacepile";
import AgentBucketTable from "./AgentBucketTable";

// BucketFolderPanel — approach C1 (bucket-as-folder, inline). The quota-
// buckets card and this assignment card stay separate; pick a bucket above
// and its members list here with rows-per-page pagination. Adding agents is
// fully in-page (no dialog): search + an active/all toggle + a checklist
// sit beneath the list. "Active" agents are the unassigned pool; toggling
// widens the pool to agents already folded into another bucket.
export default function BucketFolderPanel({ bucket, agents, buckets, onAssign, onAdjust }) {
  const [query, setQuery] = React.useState("");
  const [showAll, setShowAll] = React.useState(false);
  const [picked, setPicked] = React.useState([]);

  // Reset the picker when the open bucket changes.
  const [prevId, setPrevId] = React.useState(bucket?.id ?? null);
  if ((bucket?.id ?? null) !== prevId) {
    setPrevId(bucket?.id ?? null);
    setQuery("");
    setShowAll(false);
    setPicked([]);
  }

  if (!bucket) {
    return (
      <Section title="Assignment" description="Open a bucket and fold agents into it. Members are listed below.">
        <p style={styles.hint}>Select a bucket above to manage its members.</p>
      </Section>
    );
  }

  const members = agents.filter((a) => a.bucketId === bucket.id);
  const bucketName = (id) => buckets.find((b) => b.id === id)?.name;
  const candidates = agents
    .filter((a) => a.bucketId !== bucket.id)
    .filter((a) => (showAll ? true : !a.bucketId))
    .filter((a) => a.name.toLowerCase().includes(query.trim().toLowerCase()));

  const toggle = (id) =>
    setPicked((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  const add = () => {
    if (picked.length) onAssign(picked, bucket.id);
    setPicked([]);
  };

  return (
    <Section title="Assignment" description="Open a bucket and fold agents into it. Members are listed below.">
      <div style={styles.body}>
        <div style={styles.head}>
          <span style={styles.title}>{bucket.name} · {bucket.capMin} min / week</span>
          <BucketFacepile members={members} />
        </div>

        <AgentBucketTable
          agents={members}
          buckets={buckets}
          onAdjust={onAdjust}
          paginate
          bare
          emptyLabel={`No agents in ${bucket.name} yet — add some below.`}
        />

        <div style={styles.addPanel}>
          <div style={styles.addHead}>
            <span style={styles.addTitle}>Add agents to {bucket.name}</span>
            <div style={styles.toggleWrap}>
              <Toggle enabled={showAll} onChange={setShowAll} ariaLabel="Show all agents" />
              <span style={styles.toggleLabel}>{showAll ? "All agents" : "Active agents"}</span>
            </div>
          </div>

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

          <div style={styles.list}>
            {candidates.length === 0 && (
              <span style={styles.hint}>
                {showAll ? "No agents match your search." : "No active agents to add — toggle to all agents."}
              </span>
            )}
            {candidates.slice(0, 8).map((a) => (
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
            {candidates.length > 8 && (
              <span style={styles.more}>+{candidates.length - 8} more — refine with search</span>
            )}
          </div>

          <Button
            variant="primary"
            disabled={picked.length === 0}
            leadingIcon={<Plus size={15} />}
            onClick={add}
            style={{ alignSelf: "flex-start" }}
          >
            {picked.length ? `Add ${picked.length} to ${bucket.name}` : "Add agents"}
          </Button>
        </div>
      </div>
    </Section>
  );
}

const styles = {
  hint: { margin: 0, fontSize: 13, fontWeight: 500, color: "var(--color-text-tertiary)" },
  body: { display: "flex", flexDirection: "column", gap: 16 },
  head: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" },
  title: { fontSize: 13, fontWeight: 600, color: "var(--color-text-deep)" },
  addPanel: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    background: "var(--color-card-emoji-bg)",
  },
  addHead: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" },
  addTitle: { fontSize: 13, fontWeight: 700, color: "var(--color-text-deep)" },
  toggleWrap: { display: "flex", alignItems: "center", gap: 8 },
  toggleLabel: { fontSize: 12, fontWeight: 600, color: "var(--color-text-medium)", whiteSpace: "nowrap" },
  searchWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    border: "1px solid var(--color-border-card-soft)",
    borderRadius: 8,
    background: "#FFFFFF",
    maxWidth: 360,
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
  list: { display: "flex", flexDirection: "column", gap: 2, maxHeight: 220, overflowY: "auto" },
  row: { display: "flex", alignItems: "center", gap: 10, padding: "8px 4px", cursor: "pointer" },
  checkbox: { width: 16, height: 16, accentColor: "var(--do-brand-blue)", cursor: "pointer", flexShrink: 0 },
  name: { flex: 1, fontSize: 13, fontWeight: 500, color: "var(--color-text-deep)" },
  meta: { fontSize: 11, fontWeight: 500, color: "var(--color-text-tertiary)" },
  more: { padding: "6px 4px", fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)" },
};
