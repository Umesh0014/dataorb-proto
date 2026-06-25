"use client";

import React from "react";
import { Plus, Search } from "lucide-react";
import Button from "../Button";
import DriverCard from "./DriverCard";
import CreateWorkflowModal from "./CreateWorkflowModal";
import { GW_DRIVERS, gwWorkflows } from "../mocks/guidedWorkflowDrivers";

// GuidedWorkflowLandingPage — the contact-driver landing (Image 1). Header
// + Create CTA, a full-width search that filters driver cards by contact
// reason (driver name or any of its workflow titles), and the 3-up driver
// grid. Each card navigates to that driver's detail. Create state is
// in-memory and local to this surface.

export default function GuidedWorkflowLandingPage({ onOpenDriver }) {
  const [query, setQuery] = React.useState("");
  const [createOpen, setCreateOpen] = React.useState(false);

  const drivers = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return GW_DRIVERS;
    return GW_DRIVERS.filter((d) => {
      if (d.name.toLowerCase().includes(q)) return true;
      return gwWorkflows(d.id).some((w) => w.title.toLowerCase().includes(q));
    });
  }, [query]);

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headingText}>
          <h1 style={styles.title}>Guided Workflows</h1>
          <p style={styles.subtitle}>
            The proven path for each contact reason — captured from winning calls and ready to
            practise. Pick a contact driver to see its workflows.
          </p>
        </div>
        <Button variant="primary" leadingIcon={<Plus size={16} />} uppercase={false} onClick={() => setCreateOpen(true)}>
          Create workflow
        </Button>
      </header>

      <div style={styles.searchRow}>
        <label style={styles.search}>
          <Search size={16} color="var(--color-text-placeholder)" aria-hidden="true" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search all workflows by contact reason…"
            aria-label="Search all workflows by contact reason"
            style={styles.searchInput}
            className="gw-search-input"
          />
        </label>
        <span style={styles.count}>
          {drivers.length} contact {drivers.length === 1 ? "driver" : "drivers"}
        </span>
      </div>

      {drivers.length > 0 ? (
        <div style={styles.grid}>
          {drivers.map((d) => (
            <DriverCard key={d.id} driver={d} onOpen={() => onOpenDriver(d.id)} />
          ))}
        </div>
      ) : (
        <p style={styles.empty}>No contact drivers match “{query}”.</p>
      )}

      <CreateWorkflowModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}

const styles = {
  page: { display: "flex", flexDirection: "column", gap: 24, width: "100%" },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24 },
  headingText: { display: "flex", flexDirection: "column", gap: 8, maxWidth: 620 },
  title: { margin: 0, fontSize: 28, fontWeight: 800, color: "var(--color-text-deep)", lineHeight: 1.2 },
  subtitle: { margin: 0, fontSize: 14, color: "var(--color-text-tertiary)", lineHeight: 1.55 },
  searchRow: { display: "flex", alignItems: "center", gap: 20 },
  search: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: 10,
    height: 44,
    padding: "0 16px",
    background: "var(--surface-white)",
    border: "1px solid var(--color-border-card-soft)",
    borderRadius: 10,
    boxShadow: "var(--shadow-card)",
  },
  searchInput: {
    flex: 1,
    border: "none",
    outline: "none",
    background: "transparent",
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    color: "var(--color-text-deep)",
  },
  count: { fontSize: 13, color: "var(--color-text-tertiary)", whiteSpace: "nowrap", flexShrink: 0 },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 20,
    alignItems: "stretch",
  },
  empty: { fontSize: 14, color: "var(--color-text-tertiary)", paddingTop: 8 },
};
