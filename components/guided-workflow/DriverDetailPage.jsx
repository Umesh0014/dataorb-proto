"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import Button from "../Button";
import Select from "../Select";
import WorkflowRow from "./WorkflowRow";
import CreateWorkflowModal from "./CreateWorkflowModal";
import { gwWorkflows, GW_LANES } from "../mocks/guidedWorkflowDrivers";

// DriverDetailPage — a single contact driver's workflow list (Image 2).
// Breadcrumb back to the landing, headline + sub-stats, a controls row
// (search · lanes · state · result count), and the workflow rows. Search
// and both filters run in-memory over the mock list. Opening a row (or its
// Edit/Review) drills into the contact-reason view.

const STATE_OPTIONS = [
  { value: "active-drafts", label: "Active & drafts" },
  { value: "active", label: "Active only" },
  { value: "draft", label: "Drafts only" },
  { value: "all", label: "All states" },
];

export default function DriverDetailPage({ driver, onBack, onOpenReasons }) {
  const all = gwWorkflows(driver.id);
  const [query, setQuery] = React.useState("");
  const [lane, setLane] = React.useState("all");
  const [state, setState] = React.useState("active-drafts");
  const [createOpen, setCreateOpen] = React.useState(false);

  const activeCount = all.filter((w) => w.status === "active").length;
  const draftCount = all.filter((w) => w.status === "draft").length;

  const laneOptions = React.useMemo(() => {
    const present = GW_LANES.filter((l) => all.some((w) => w.category === l));
    return [{ value: "all", label: "All lanes" }, ...present.map((l) => ({ value: l, label: laneLabel(l) }))];
  }, [all]);

  const shown = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((w) => {
      if (q && !w.title.toLowerCase().includes(q) && !w.id.toLowerCase().includes(q)) return false;
      if (lane !== "all" && w.category !== lane) return false;
      if (state === "active" && w.status !== "active") return false;
      if (state === "draft" && w.status !== "draft") return false;
      // "active-drafts" and "all" both keep everything in this mock (no archived).
      return true;
    });
  }, [all, query, lane, state]);

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headingText}>
          <nav style={styles.breadcrumb} aria-label="Breadcrumb">
            <button type="button" onClick={onBack} className="gw-focusable" style={styles.crumbLink}>
              <ChevronLeft size={15} aria-hidden="true" />
              Guided Workflows
            </button>
            <ChevronRight size={14} color="var(--color-text-placeholder)" aria-hidden="true" />
            <span style={styles.crumbCurrent}>{driver.name}</span>
          </nav>
          <h1 style={styles.title}>{driver.name}</h1>
          <p style={styles.substats}>
            <strong style={styles.strong}>{all.length}</strong> workflows
            <span style={styles.dotSep}>·</span>
            <strong style={styles.strong}>{activeCount}</strong> active
            <span style={styles.dotSep}>·</span>
            <strong style={styles.strong}>{draftCount}</strong> draft
            <span style={styles.dotSep}>·</span>
            <strong style={styles.strong}>{driver.roleplays}</strong> roleplays attached
          </p>
        </div>
        <Button variant="primary" leadingIcon={<Plus size={16} />} uppercase={false} onClick={() => setCreateOpen(true)}>
          Create workflow
        </Button>
      </header>

      <div style={styles.controls}>
        <label style={styles.search}>
          <Search size={16} color="var(--color-text-placeholder)" aria-hidden="true" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${driver.name} workflows…`}
            aria-label={`Search ${driver.name} workflows`}
            style={styles.searchInput}
            className="gw-search-input"
          />
        </label>
        <Select value={lane} onChange={setLane} options={laneOptions} ariaLabel="Filter by lane" />
        <Select value={state} onChange={setState} options={STATE_OPTIONS} ariaLabel="Filter by state" />
        <span style={styles.count}>
          {shown.length} {shown.length === 1 ? "workflow" : "workflows"}
        </span>
      </div>

      {shown.length > 0 ? (
        <div style={styles.list}>
          {shown.map((w) => (
            <WorkflowRow key={w.id} workflow={w} onOpen={onOpenReasons} />
          ))}
        </div>
      ) : (
        <p style={styles.empty}>No workflows match the current filters.</p>
      )}

      <CreateWorkflowModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}

function laneLabel(lane) {
  return lane.charAt(0).toUpperCase() + lane.slice(1);
}

const styles = {
  page: { display: "flex", flexDirection: "column", gap: 24, width: "100%" },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24 },
  headingText: { display: "flex", flexDirection: "column", gap: 8, minWidth: 0 },
  breadcrumb: { display: "flex", alignItems: "center", gap: 8 },
  crumbLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    background: "transparent",
    border: "none",
    padding: 0,
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text-tertiary)",
    borderRadius: 4,
  },
  crumbCurrent: { fontSize: 13, fontWeight: 600, color: "var(--color-text-deep)" },
  title: { margin: 0, fontSize: 28, fontWeight: 800, color: "var(--color-text-deep)", lineHeight: 1.2 },
  substats: { margin: 0, fontSize: 13.5, color: "var(--color-text-tertiary)", display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" },
  strong: { fontWeight: 700, color: "var(--color-text-deep)" },
  dotSep: { color: "var(--color-text-placeholder)" },
  controls: { display: "flex", alignItems: "center", gap: 12 },
  search: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: 10,
    height: 40,
    padding: "0 14px",
    background: "var(--surface-white)",
    border: "1px solid var(--color-border-card-soft)",
    borderRadius: 999,
    boxShadow: "var(--shadow-card)",
  },
  searchInput: {
    flex: 1,
    border: "none",
    outline: "none",
    background: "transparent",
    fontFamily: "var(--font-sans)",
    fontSize: 13.5,
    color: "var(--color-text-deep)",
  },
  count: { fontSize: 13, color: "var(--color-text-tertiary)", whiteSpace: "nowrap", flexShrink: 0 },
  list: { display: "flex", flexDirection: "column", gap: 12 },
  empty: { fontSize: 14, color: "var(--color-text-tertiary)", paddingTop: 8 },
};
