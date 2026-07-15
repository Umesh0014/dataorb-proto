"use client";

import React from "react";
import {
  ArrowLeft,
  Archive,
  Boxes,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  Grid3X3,
  Search,
  Settings,
  Trash2,
  Workflow,
  X,
  Zap,
} from "lucide-react";
import styles from "./RoleplaySelectionPrototype.module.css";

const ROLEPLAYS = [
  { id: 1, title: "Intermittent dropout - home office", category: "WiFi support", modified: "Jun 21, 2026" },
  { id: 2, title: "Intermittent dropout - home office", category: "WiFi support", modified: "Jun 21, 2026" },
  { id: 3, title: "Intermittent dropout - home office", category: "WiFi support", modified: "Jun 21, 2026" },
  { id: 4, title: "Slow speed after router restart", category: "Connectivity", modified: "Jun 18, 2026", selected: true },
  { id: 5, title: "Intermittent dropout - home office", category: "WiFi support", modified: "Jun 21, 2026", calibration: true, selected: true },
];

const WORKFLOWS = [
  ["GW–12BC", "Review customer verification"],
  ["GW–13BC", "Set up a payment plan"],
  ["GW–14BC", "Update direct-debit details"],
  ["GW–15BC", "Dispute an unexpected charge"],
  ["GW–16BC", "Refund a duplicate payment"],
];

export default function RoleplaySelectionPrototype() {
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState(() => new Set([4, 5]));
  const [page, setPage] = React.useState(1);
  const [open, setOpen] = React.useState(true);

  React.useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const visibleRoleplays = ROLEPLAYS.filter((roleplay) =>
    `${roleplay.title} ${roleplay.category}`.toLowerCase().includes(query.toLowerCase()),
  );

  const toggleRoleplay = (id) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <main className={styles.stage}>
      <section className={styles.device} aria-label="Learning Hub workflow prototype">
        <div className={styles.app}>
          <Rail />
          <WorkflowTable onOpen={() => setOpen(true)} />
          <Filters />
          {open && <div className={styles.scrim} aria-hidden="true" />}
          {open && (
            <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="roleplay-title">
              <header className={styles.modalHeader}>
                <h1 id="roleplay-title">Add roleplays to publish</h1>
              </header>

              <div className={styles.modalBody}>
                <label className={styles.searchField}>
                  <span className={styles.srOnly}>Search roleplays</span>
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search roleplays"
                  />
                </label>

                <div className={styles.roleplayList}>
                  {visibleRoleplays.map((roleplay) => {
                    const isSelected = selected.has(roleplay.id);
                    return (
                      <article className={styles.roleplayCard} key={roleplay.id}>
                        <div className={styles.roleplayCopy}>
                          <h2>{roleplay.title}</h2>
                          <div className={styles.roleplayMeta}>
                            <span className={styles.category}>{roleplay.category}</span>
                            {roleplay.calibration && <span className={styles.calibration}>In calibration</span>}
                            <span>Last modified on {roleplay.modified}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className={isSelected ? styles.deleteButton : styles.addButton}
                          onClick={() => toggleRoleplay(roleplay.id)}
                          aria-label={`${isSelected ? "Remove" : "Add"} ${roleplay.title}`}
                        >
                          {isSelected ? <Trash2 aria-hidden="true" /> : <CirclePlus aria-hidden="true" />}
                          {!isSelected && <span>Add</span>}
                        </button>
                      </article>
                    );
                  })}
                  {visibleRoleplays.length === 0 && <p className={styles.empty}>No roleplays found.</p>}
                </div>
              </div>

              <div className={styles.pagination}>
                <span>Total 150 roleplays</span>
                <div className={styles.pageControls}>
                  <button type="button" disabled={page === 1} onClick={() => setPage(1)} aria-label="First page">
                    <ChevronLeft /><ChevronLeft />
                  </button>
                  <span>Page {page} of 22</span>
                  <button type="button" disabled={page === 1} onClick={() => setPage((value) => value - 1)} aria-label="Previous page"><ChevronLeft /></button>
                  <button type="button" disabled={page === 22} onClick={() => setPage((value) => value + 1)} aria-label="Next page"><ChevronRight /></button>
                </div>
              </div>

              <footer className={styles.modalFooter}>
                <strong>5 paths · 12 steps</strong>
                <div>
                  <button type="button" className={styles.cancelButton} onClick={() => setOpen(false)}>Cancel</button>
                  <button type="button" className={styles.publishButton} onClick={() => setOpen(false)}>Publish</button>
                </div>
              </footer>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}

function Rail() {
  return (
    <aside className={styles.rail} aria-label="Primary navigation">
      <img src="/assets/logo-color.svg" alt="DataOrb" className={styles.logo} />
      <nav>
        <button type="button" aria-label="Apps"><Grid3X3 /></button>
        <button type="button" aria-label="Library"><Boxes /></button>
        <button type="button" className={styles.activeRailButton} aria-label="Workflows"><Workflow /></button>
        <button type="button" aria-label="Archive"><Archive /></button>
        <button type="button" aria-label="Automation"><Zap /></button>
      </nav>
      <div className={styles.railBottom}>
        <button type="button" aria-label="Settings"><Settings /></button>
        <span className={styles.avatar}>AT</span>
      </div>
    </aside>
  );
}

function WorkflowTable({ onOpen }) {
  return (
    <section className={styles.workspace}>
      <header className={styles.workspaceHeader}>
        <ArrowLeft />
        <h2>Billing and payments</h2>
        <button type="button" className={styles.workflowButton} onClick={onOpen}><CirclePlus />Workflow</button>
      </header>
      <div className={styles.workspaceSearch}><Search /><span>Search by Workflow names/ Generated workflow ID</span></div>
      <div className={styles.table}>
        <div className={styles.tableHeader}><b>ID</b><b>Workflow name</b></div>
        {WORKFLOWS.map(([id, name]) => <div className={styles.tableRow} key={id}><b>{id}</b><span>{name}</span></div>)}
      </div>
    </section>
  );
}

function Filters() {
  return (
    <aside className={styles.filters}>
      <header><strong>Filters</strong><button type="button" aria-label="Close filters"><X /></button></header>
      <div className={styles.filterSearch}><Search /><span>Search by filter name</span></div>
      <button type="button" className={styles.filterRow}><span>Status</span><ChevronDown /></button>
      <button type="button" className={styles.filterRow}><span>Roleplay category</span><ChevronDown /></button>
      <footer><button type="button">Deselect all</button><button type="button">Cancel</button><button type="button" disabled>Apply</button></footer>
    </aside>
  );
}
