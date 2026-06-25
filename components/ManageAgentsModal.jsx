"use client";

import React from "react";
import { createPortal } from "react-dom";
import { Search, X, ArrowUpCircle } from "lucide-react";
import Button from "./Button";
import Select from "./Select";
import TabsRow from "./TabsRow";
import { CapacityBar } from "./CreditsUsageParts";
import { appliedCap, statusOf } from "./AgentBucketTable";

// ManageAgentsModal — the C5 roster manager the "Manage agents" button and the
// over-limit banner both open. Four tabs: "Nearing limit" (every agent near or
// over their weekly cap, across all tiers — where the banner lands) plus one
// tab per bucket. Search filters the active tab by name; checking agents drives
// two batch actions — a one-click "Select all & upgrade tier" (bumps the tab's
// agents up a bucket) and a manual "Move to…". Selection resets on tab switch
// and on open so it never leaks across tiers.
//
// A wider sibling of the shared Modal primitive: the 480px dialog is too narrow
// for a tabbed roster, so this is a 920px management surface that mirrors
// Modal's scrim / portal / Esc and stays on the design-system tokens.
const NEARING = "nearing";
const STATUS_TONE = {
  near_limit: "var(--color-warning)",
  at_cap: "var(--color-error)",
  on_track: "var(--color-success)",
};
const AVATAR_COLORS = [
  "var(--chart-blue)",
  "var(--chart-teal)",
  "var(--chart-lavender)",
  "var(--chart-orange)",
  "var(--chart-pink)",
  "var(--chart-green)",
];

export default function ManageAgentsModal({
  open,
  initialTab = NEARING,
  buckets,
  agents,
  onClose,
  onMove,
  onUpgradeTier,
}) {
  const [tab, setTab] = React.useState(initialTab);
  const [query, setQuery] = React.useState("");
  const [picked, setPicked] = React.useState([]);
  const [moveTo, setMoveTo] = React.useState("");

  // Reset to the requested tab + clear selection whenever the dialog opens.
  const [prevOpen, setPrevOpen] = React.useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setTab(initialTab);
      setQuery("");
      setPicked([]);
      setMoveTo("");
    }
  }

  // Switching tabs clears the in-flight selection so checks never carry from
  // one tier (or the nearing view) into another.
  const [prevTab, setPrevTab] = React.useState(tab);
  if (tab !== prevTab) {
    setPrevTab(tab);
    setQuery("");
    setPicked([]);
    setMoveTo("");
  }

  // Esc dismisses while open (mirrors Modal).
  React.useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") { e.stopPropagation(); onClose?.(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  const nearing = agents.filter((a) => statusOf(a.usedMin, appliedCap(a, buckets)) !== "on_track");
  const inTab = tab === NEARING ? nearing : agents.filter((a) => a.bucketId === tab);
  const q = query.trim().toLowerCase();
  const visible = q ? inTab.filter((a) => a.name.toLowerCase().includes(q)) : inTab;
  const activeBucket = tab === NEARING ? null : buckets.find((b) => b.id === tab);
  const caption = tab === NEARING
    ? `${inTab.length} agent${inTab.length === 1 ? "" : "s"} at or near a weekly cap, across all tiers`
    : `${inTab.length} agent${inTab.length === 1 ? "" : "s"} in ${activeBucket?.name} · ${activeBucket?.capMin} min / week`;

  const tabs = [
    { id: NEARING, label: "Nearing limit", count: nearing.length },
    ...buckets.map((b) => ({ id: b.id, label: b.name, count: agents.filter((a) => a.bucketId === b.id).length })),
  ];

  const toggle = (id) =>
    setPicked((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  const allVisibleSelected = visible.length > 0 && picked.length === visible.length;
  const toggleAll = () => setPicked(allVisibleSelected ? [] : visible.map((a) => a.id));

  // Upgrade the whole visible (nearing) set one tier — the banner's one-click fix.
  const upgradeVisible = () => {
    onUpgradeTier(visible.map((a) => a.id));
    setPicked([]);
  };
  const applyMove = () => {
    if (!moveTo || !picked.length) return;
    onMove(picked, moveTo);
    setPicked([]);
    setMoveTo("");
  };

  const moveOptions = buckets.map((b) => ({ value: b.id, label: `${b.name} (${b.capMin} min)` }));
  const moveTarget = buckets.find((b) => b.id === moveTo);

  return createPortal(
    <div style={styles.scrim} onClick={onClose} role="presentation">
      <style>{KEYFRAMES}</style>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Manage agents"
        onClick={(e) => e.stopPropagation()}
        style={styles.panel}
        className="mam-panel"
      >
        <header style={styles.head}>
          <div style={styles.headText}>
            <h2 style={styles.title}>Manage agents</h2>
            <p style={styles.sub}>Move agents between tiers, or upgrade everyone nearing their weekly limit in one step.</p>
          </div>
          <Button variant="icon" aria-label="Close" onClick={onClose}>
            <X size={18} />
          </Button>
        </header>

        <div style={styles.tabsWrap}>
          <TabsRow tabs={tabs} activeTab={tab} onTabClick={setTab} />
        </div>

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
          <div style={styles.toolbarActions}>
            <Select
              value={moveTo}
              onChange={setMoveTo}
              ariaLabel="Destination tier for selected agents"
              placeholder="Move to tier…"
              options={moveOptions}
            />
          </div>
        </div>

        <p style={styles.caption}>{caption}</p>

        <div style={styles.tableHead}>
          <input
            type="checkbox"
            checked={allVisibleSelected}
            onChange={toggleAll}
            aria-label="Select all shown"
            style={styles.checkbox}
            disabled={visible.length === 0}
          />
          <span style={styles.th}>Agent</span>
          <span style={styles.th}>Tier</span>
          <span style={styles.th}>Weekly usage</span>
        </div>

        <div style={styles.list}>
          {visible.length === 0 && (
            <p style={styles.empty}>
              {tab === NEARING ? "No agents are near or over their weekly limit." : "No agents match your search."}
            </p>
          )}
          {visible.map((a, i) => {
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
                <span style={styles.tierCell}>
                  <span style={styles.tierName}>{bucket ? bucket.name : "—"}</span>
                  <span style={styles.tierCap}>{bucket ? `${bucket.capMin} min` : ""}</span>
                </span>
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
            {picked.length > 0
              ? <><strong style={styles.footCount}>{picked.length} selected</strong>{moveTarget ? "" : " — pick a destination tier above"}</>
              : "Check agents and pick a destination tier above, then move them."}
          </span>
          <div style={styles.footActions}>
            {tab === NEARING && (
              <Button
                variant="text"
                leadingIcon={<ArrowUpCircle size={16} />}
                disabled={visible.length === 0}
                onClick={upgradeVisible}
                style={{ height: 40 }}
              >
                Select all &amp; upgrade tier
              </Button>
            )}
            <Button
              variant="primary"
              disabled={!moveTo || picked.length === 0}
              onClick={applyMove}
              style={{ height: 40, paddingInline: 24 }}
            >
              {moveTarget && picked.length > 0 ? `Move ${picked.length} to ${moveTarget.name}` : "Move"}
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

// Subtle entrance: scrim fades, panel rises 8px and settles (ease-out). Held
// off under reduced-motion. Scoped with the mam- prefix.
const KEYFRAMES = `
@keyframes mamScrim { from { opacity: 0 } to { opacity: 1 } }
@keyframes mamPanel { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
.mam-panel { animation: mamPanel 180ms cubic-bezier(.22,1,.36,1) both; }
@media (prefers-reduced-motion: reduce) { .mam-panel { animation: none; } }
`;

const COL_GRID = "22px minmax(220px, 1.8fr) 132px minmax(190px, 1.3fr)";

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
    animation: "mamScrim 160ms ease both",
  },
  panel: {
    width: "min(920px, 100%)",
    maxHeight: "calc(100vh - 48px)",
    background: "#FFFFFF",
    borderRadius: "var(--radius-card)",
    boxShadow: "var(--shadow-8)",
    fontFamily: "var(--font-sans)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  head: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, padding: "22px 28px 16px" },
  headText: { display: "flex", flexDirection: "column", gap: 5, minWidth: 0 },
  title: { margin: 0, fontSize: 18, fontWeight: 700, color: "var(--color-text-deep)", lineHeight: 1.3, letterSpacing: "-0.01em" },
  sub: { margin: 0, fontSize: 13, fontWeight: 400, color: "var(--color-text-tertiary)", lineHeight: "18px" },
  tabsWrap: { paddingInline: 28 },
  toolbar: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "16px 28px 10px", flexWrap: "wrap" },
  toolbarActions: { display: "flex", alignItems: "center", gap: 10, flexShrink: 0 },
  searchWrap: {
    flex: 1,
    minWidth: 220,
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "9px 14px",
    border: "1px solid var(--color-border-card-soft)",
    borderRadius: "var(--radius-md)",
    background: "#FFFFFF",
  },
  searchInput: { border: "none", outline: "none", fontFamily: "inherit", fontSize: 13, color: "var(--color-text-deep)", background: "transparent", width: "100%" },
  caption: { margin: 0, padding: "6px 28px 24px", fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)" },

  tableHead: {
    display: "grid",
    gridTemplateColumns: COL_GRID,
    alignItems: "center",
    gap: 14,
    padding: "0 28px 10px",
    margin: "0 0 0",
    borderBottom: "1px solid var(--color-divider-card)",
  },
  th: { fontSize: 11, fontWeight: 700, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" },

  list: { flex: 1, overflowY: "auto", padding: "4px 16px 4px" },
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
    transition: "background 150ms ease",
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
    letterSpacing: "0.2px",
    flexShrink: 0,
  },
  name: { fontSize: 13, fontWeight: 600, color: "var(--color-text-deep)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  tierCell: { display: "flex", flexDirection: "column", gap: 2, minWidth: 0 },
  tierName: { fontSize: 13, fontWeight: 600, color: "var(--color-text-medium)", whiteSpace: "nowrap" },
  tierCap: { fontSize: 11, fontWeight: 500, color: "var(--color-text-tertiary)" },
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
  footActions: { display: "flex", alignItems: "center", gap: 12 },
};
