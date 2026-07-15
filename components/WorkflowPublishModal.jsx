"use client";

import React from "react";
import { createPortal } from "react-dom";
import { Eye, Plus, Trash2, X } from "lucide-react";
import Button from "./Button";

const FEATURED_ROLEPLAYS = [
  { id: "rp-01", title: "Intermittent dropout - home office", category: "WiFi support", modified: "Jun 21, 2026" },
  { id: "rp-02", title: "Intermittent dropout - home office", category: "WiFi support", modified: "Jun 21, 2026" },
  { id: "rp-03", title: "Intermittent dropout - home office", category: "WiFi support", modified: "Jun 21, 2026" },
  { id: "rp-04", title: "Slow speed after router restart", category: "Connectivity", modified: "Jun 18, 2026", attached: true },
  { id: "rp-05", title: "Intermittent dropout - home office", category: "WiFi support", modified: "Jun 21, 2026", calibration: true, attached: true },
];

const ROLEPLAY_NAMES = [
  "Router light flashing amber", "Unable to connect a new device", "Connection drops during video calls",
  "WiFi unavailable in upstairs bedroom", "Smart meter lost network connection", "Broadband speed below plan",
  "Guest network cannot authenticate", "Router keeps rebooting overnight", "Mobile app cannot find the hub",
  "Ethernet connection intermittently fails", "New router setup assistance", "Weak signal near the garden office",
  "Streaming buffers during peak hours", "VPN disconnects on home broadband", "Password reset does not reconnect devices",
  "Mesh extender showing offline", "Service stopped after power outage", "Video calls freeze when screen sharing",
  "Unable to change WiFi network name", "Devices connect without internet", "Broadband outage status enquiry",
  "Parental controls blocking approved sites", "Landline crackles while internet is active", "Router firmware update failed",
];
const CATEGORIES = ["WiFi support", "Connectivity", "Broadband", "Device setup", "Technical support"];
const PAGE_SIZE = 7;
const ROLEPLAYS = [
  ...FEATURED_ROLEPLAYS,
  ...Array.from({ length: 150 - FEATURED_ROLEPLAYS.length }, (_, index) => ({
    id: `rp-${String(index + FEATURED_ROLEPLAYS.length + 1).padStart(3, "0")}`,
    title: `${ROLEPLAY_NAMES[index % ROLEPLAY_NAMES.length]} · Case ${index + 1}`,
    category: CATEGORIES[index % CATEGORIES.length],
    modified: `Jun ${String(1 + (index % 27)).padStart(2, "0")}, 2026`,
    calibration: index % 17 === 0,
  })),
];

const IDEAS = [
  { id: "summary", label: "1. Persistent summary" },
  { id: "tray", label: "2. Selected-items tray" },
  { id: "dual", label: "3. Dual-list transfer" },
  { id: "first", label: "4. Added moves to page 1" },
];

const pillLabel = (title) => `${title.trim().split(/\s+/)[0]}…`;

/** Figma 07a publish flow: attach roleplays before releasing a Draft workflow. */
export default function WorkflowPublishModal({ workflow, onClose, onPublish }) {
  const dialogRef = React.useRef(null);
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [idea, setIdea] = React.useState("summary");
  const [viewSelected, setViewSelected] = React.useState(false);
  const [attached, setAttached] = React.useState(() => new Set(ROLEPLAYS.filter((item) => item.attached).map((item) => item.id)));

  React.useEffect(() => {
    const previousFocus = document.activeElement;
    const dialog = dialogRef.current;
    const focusables = () => Array.from(dialog?.querySelectorAll('button, input, [tabindex]:not([tabindex="-1"])') || []);
    (focusables()[0] || dialog)?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape") { onClose(); return; }
      if (event.key !== "Tab") return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previousFocus?.focus?.();
    };
  }, [onClose]);

  const matchingRoleplays = ROLEPLAYS.filter((item) =>
    `${item.title} ${item.category}`.toLowerCase().includes(search.trim().toLowerCase()),
  );
  const orderedRoleplays = (viewSelected ? matchingRoleplays.filter((item) => attached.has(item.id)) : matchingRoleplays)
    .slice()
    .sort((a, b) => idea === "first" ? Number(attached.has(b.id)) - Number(attached.has(a.id)) : 0);
  const totalPages = Math.max(1, Math.ceil(orderedRoleplays.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleRoleplays = orderedRoleplays.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const selectedRoleplays = ROLEPLAYS.filter((item) => attached.has(item.id));
  const availableRoleplays = matchingRoleplays.filter((item) => !attached.has(item.id)).slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const toggle = (id) => {
    const isAdding = !attached.has(id);
    setAttached((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    if (idea === "first" && isAdding) setPage(1);
    if (viewSelected && !isAdding) setPage(1);
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div style={wpStyles.scrim} onMouseDown={onClose} role="presentation">
      <section
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="workflow-publish-title"
        aria-describedby="workflow-publish-context"
        style={wpStyles.dialog}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header style={wpStyles.header}>
          <div>
            <h2 id="workflow-publish-title" style={wpStyles.title}>Add roleplays to publish</h2>
            <p style={wpStyles.subtitle}>Choose an interaction idea and try it with the same selection.</p>
          </div>
          <Button variant="icon" size="sm" onClick={onClose} aria-label="Close publish modal"><X size={18} /></Button>
          <span id="workflow-publish-context" style={wpStyles.srOnly}>Choose the roleplays attached to {workflow.id} before publishing.</span>
        </header>

        <div style={wpStyles.ideaBar} role="tablist" aria-label="Compare selection ideas">
          {IDEAS.map((item) => (
            <Button key={item.id} variant="text" uppercase={false} role="tab" aria-selected={idea === item.id} onClick={() => { setIdea(item.id); setViewSelected(false); setPage(1); }} style={{ ...wpStyles.ideaTab, ...(idea === item.id ? wpStyles.ideaTabActive : {}) }}>
              {item.label}
            </Button>
          ))}
        </div>

        <div style={wpStyles.body}>
          <label style={wpStyles.searchLabel}>
            <span style={wpStyles.srOnly}>Search roleplays</span>
            <input
              autoFocus
              value={search}
              onChange={(event) => { setSearch(event.target.value); setPage(1); }}
              placeholder="Search roleplays"
              className="workflow-publish-search"
              style={wpStyles.search}
            />
          </label>
          {idea === "summary" && (
            <div style={wpStyles.summary}>
              <strong>{attached.size} roleplays selected</strong>
              <div style={wpStyles.summaryActions}>
                <Button variant="text" uppercase={false} leadingIcon={<Eye size={16} />} style={wpStyles.linkButton} onClick={() => { setViewSelected((value) => !value); setPage(1); }}>{viewSelected ? "View all" : "View selected"}</Button>
                <Button variant="text" uppercase={false} style={wpStyles.linkButton} onClick={() => setAttached(new Set())}>Clear all</Button>
              </div>
            </div>
          )}
          {idea === "tray" && (
            <div style={wpStyles.tray}>
              <strong style={wpStyles.trayLabel}>Selected ({attached.size})</strong>
              <div style={wpStyles.trayItems}>
                {selectedRoleplays.map((item) => (
                  <Button
                    key={item.id}
                    variant="text"
                    uppercase={false}
                    trailingIcon={<X size={14} />}
                    style={wpStyles.trayChip}
                    onClick={() => toggle(item.id)}
                    title={`Remove ${item.title}`}
                    aria-label={`Remove ${item.title}`}
                  >
                    {pillLabel(item.title)}
                  </Button>
                ))}
                {!attached.size && <span style={wpStyles.trayEmpty}>Added roleplays appear here.</span>}
              </div>
            </div>
          )}
          {idea === "dual" ? (
            <div style={wpStyles.dualGrid}>
              <RoleplayColumn title={`Available (${availableRoleplays.length})`} items={availableRoleplays} attached={attached} toggle={toggle} />
              <RoleplayColumn title={`Selected (${selectedRoleplays.length})`} items={selectedRoleplays} attached={attached} toggle={toggle} selectedColumn />
            </div>
          ) : <div style={wpStyles.list}>
            {visibleRoleplays.map((item) => {
              const selected = attached.has(item.id);
              return (
                <article key={item.id} style={{ ...wpStyles.card, ...(idea === "first" && selected ? wpStyles.selectedCard : {}) }}>
                  <div style={wpStyles.copy}>
                    <strong style={wpStyles.cardTitle}>{item.title}</strong>
                    <div style={wpStyles.meta}>
                      <span style={wpStyles.category}>{item.category}</span>
                      {item.calibration && <span style={wpStyles.calibration}>In calibration</span>}
                      <span>Last modified on {item.modified}</span>
                    </div>
                  </div>
                  <Button
                    variant="icon"
                    size="sm"
                    onClick={() => toggle(item.id)}
                    aria-label={`${selected ? "Remove" : "Add"} ${item.title}`}
                    style={selected ? wpStyles.removeButton : wpStyles.addButton}
                  >
                    {selected ? <Trash2 size={16} /> : <><Plus size={18} /><span style={wpStyles.addText}>Add</span></>}
                  </Button>
                </article>
              );
            })}
            {visibleRoleplays.length === 0 && <div style={wpStyles.empty}>No roleplays match your search.</div>}
          </div>}
        </div>

        <div style={wpStyles.pagination}>
          <span>{viewSelected ? `${orderedRoleplays.length} selected roleplays` : `Total ${ROLEPLAYS.length} roleplays`}</span>
          <div style={wpStyles.pageControls}>
            <Button variant="icon" size="sm" disabled={currentPage === 1} onClick={() => setPage(1)} aria-label="First page"><PaginationIcon glyph="first_page" /></Button>
            <span>Page {currentPage} of {totalPages}</span>
            <Button variant="icon" size="sm" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} aria-label="Previous page"><PaginationIcon glyph="chevron_left" /></Button>
            <Button variant="icon" size="sm" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)} aria-label="Next page"><PaginationIcon glyph="chevron_right" /></Button>
          </div>
        </div>

        <footer style={wpStyles.footer}>
          <strong style={wpStyles.pathCount}>5 paths · 12 steps</strong>
          <div style={wpStyles.actions}>
            <Button variant="text" uppercase={false} onClick={onClose}>Cancel</Button>
            <Button variant="primary" uppercase={false} onClick={() => onPublish(attached.size)}>Publish</Button>
          </div>
        </footer>
      </section>
    </div>,
    document.body,
  );
}

function RoleplayColumn({ title, items, attached, toggle, selectedColumn = false }) {
  return (
    <section style={wpStyles.column} aria-label={title}>
      <strong style={wpStyles.columnTitle}>{title}</strong>
      <div style={wpStyles.columnList}>
        {items.map((item) => (
          <article key={item.id} style={wpStyles.compactCard}>
            <div style={wpStyles.compactCopy}>
              <strong style={wpStyles.compactTitle}>{item.title}</strong>
              <span style={wpStyles.compactMeta}>{item.category}</span>
            </div>
            <Button variant="icon" size="sm" style={wpStyles.compactAction} onClick={() => toggle(item.id)} aria-label={`${selectedColumn ? "Remove" : "Add"} ${item.title}`}>
              {selectedColumn || attached.has(item.id) ? <Trash2 size={15} /> : <Plus size={16} />}
            </Button>
          </article>
        ))}
        {!items.length && <div style={wpStyles.columnEmpty}>{selectedColumn ? "No roleplays selected." : "No roleplays available."}</div>}
      </div>
    </section>
  );
}

function PaginationIcon({ glyph }) {
  return (
    <span
      className="material-symbols-outlined"
      aria-hidden="true"
      style={{ width: 24, height: 24, fontSize: 24, lineHeight: "24px", flex: "none" }}
    >
      {glyph}
    </span>
  );
}

const wpStyles = {
  scrim: { position: "fixed", inset: 0, zIndex: 1100, background: "var(--workflow-modal-scrim)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 },
  dialog: { width: 720, maxWidth: "calc(100vw - 48px)", height: 726, maxHeight: "calc(100vh - 48px)", overflow: "hidden", background: "var(--surface-white)", borderRadius: 12, boxShadow: "var(--shadow-8)", display: "flex", flexDirection: "column", fontFamily: "var(--font-sans)", outline: "none" },
  header: { minHeight: 86, flexShrink: 0, padding: "20px 24px 12px", boxSizing: "border-box", display: "flex", alignItems: "flex-start", justifyContent: "space-between" },
  title: { margin: 0, fontSize: 20, lineHeight: "32px", fontWeight: 500, letterSpacing: "0.15px", color: "var(--color-text-medium)" },
  subtitle: { margin: 0, fontSize: 12, lineHeight: "18px", color: "var(--color-text-tertiary)" },
  ideaBar: { minHeight: 46, flexShrink: 0, margin: "0 16px", padding: 4, borderRadius: 10, background: "var(--surface-alt)", display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 4 },
  ideaTab: { minWidth: 0, border: 0, borderRadius: 8, padding: "7px 5px", background: "transparent", color: "var(--grey-700)", fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 600, lineHeight: "16px", cursor: "pointer", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  ideaTabActive: { background: "var(--surface-white)", color: "var(--color-primary)", boxShadow: "var(--shadow-2)" },
  body: { padding: "4px 16px", overflowY: "auto", minHeight: 0 },
  searchLabel: { display: "block", height: 48, padding: "8px 0", boxSizing: "border-box" },
  search: { width: 480, maxWidth: "100%", height: 32, boxSizing: "border-box", border: "1px solid var(--workflow-search-border)", borderRadius: 6, padding: "0 12px", fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--color-text-medium)", outline: "none" },
  list: { display: "flex", flexDirection: "column", gap: 8 },
  card: { minHeight: 84, border: "1px solid var(--color-border-card-soft)", borderRadius: 12, padding: 16, boxSizing: "border-box", display: "flex", alignItems: "flex-start", gap: 4, background: "var(--surface-white)" },
  copy: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4, justifyContent: "center" },
  cardTitle: { fontSize: 16, lineHeight: "24px", fontWeight: 500, letterSpacing: "0.1px", color: "var(--color-text-medium)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  meta: { display: "flex", alignItems: "center", gap: 8, minHeight: 24, color: "var(--grey-700)", fontSize: 10, lineHeight: "14px", letterSpacing: "0.4px", whiteSpace: "nowrap" },
  category: { height: 24, borderRadius: 4, padding: "5px 6px", boxSizing: "border-box", background: "var(--chart-gray-50)", color: "var(--chart-gray-700)", fontSize: 11, lineHeight: "14px" },
  calibration: { height: 24, borderRadius: 4, padding: "5px 6px", boxSizing: "border-box", background: "var(--chart-amber-50)", color: "var(--chart-amber-600)", fontSize: 11, lineHeight: "14px" },
  addButton: { width: 61, height: 32, paddingInline: 10, gap: 5, background: "var(--color-border-card-soft)", color: "var(--color-text-medium)", flexShrink: 0 },
  removeButton: { width: 32, height: 32, background: "var(--color-border-card-soft)", color: "var(--color-text-medium)", flexShrink: 0 },
  addText: { fontSize: 14, fontWeight: 500, lineHeight: "24px", letterSpacing: "0.4px", textTransform: "uppercase" },
  empty: { height: 84, border: "1px dashed var(--workflow-search-border)", borderRadius: 12, display: "grid", placeItems: "center", color: "var(--color-text-tertiary)", fontSize: 14 },
  summary: { minHeight: 52, marginBottom: 8, padding: "0 12px", border: "1px solid var(--color-primary-200)", borderRadius: 10, background: "var(--color-primary-50)", display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--color-text-medium)", fontSize: 13 },
  summaryActions: { display: "flex", alignItems: "center", gap: 16 },
  linkButton: { border: 0, padding: 0, background: "transparent", color: "var(--color-primary)", fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 5, cursor: "pointer" },
  tray: { marginBottom: 8, padding: 10, border: "1px solid var(--color-border-card-soft)", borderRadius: 10, background: "var(--surface-alt)" },
  trayLabel: { display: "block", marginBottom: 7, fontSize: 12, color: "var(--grey-700)" },
  trayItems: { display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 },
  trayChip: { maxWidth: 150, height: 30, flexShrink: 0, border: "1px solid var(--color-primary-200)", borderRadius: 16, padding: "0 9px 0 11px", background: "var(--color-primary-50)", color: "var(--color-primary)", fontFamily: "var(--font-sans)", fontSize: 11, whiteSpace: "nowrap", overflow: "hidden", gap: 6, cursor: "pointer" },
  trayEmpty: { fontSize: 12, color: "var(--color-text-tertiary)" },
  selectedCard: { borderColor: "var(--color-primary-200)", background: "var(--color-primary-50)" },
  dualGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, minHeight: 300 },
  column: { minWidth: 0, border: "1px solid var(--color-border-card-soft)", borderRadius: 10, overflow: "hidden", background: "var(--surface-alt)" },
  columnTitle: { height: 38, padding: "0 12px", display: "flex", alignItems: "center", borderBottom: "1px solid var(--color-border-card-soft)", fontSize: 12, color: "var(--grey-700)" },
  columnList: { padding: 8, display: "flex", flexDirection: "column", gap: 7 },
  compactCard: { minHeight: 58, padding: 9, border: "1px solid var(--color-border-card-soft)", borderRadius: 8, background: "var(--surface-white)", display: "flex", alignItems: "center", gap: 8 },
  compactCopy: { minWidth: 0, flex: 1, display: "flex", flexDirection: "column", gap: 3 },
  compactTitle: { fontSize: 11, lineHeight: "16px", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  compactMeta: { fontSize: 10, color: "var(--color-text-tertiary)" },
  compactAction: { width: 28, height: 28, flexShrink: 0, border: 0, borderRadius: 7, background: "var(--color-primary-50)", color: "var(--color-primary)", display: "grid", placeItems: "center", cursor: "pointer" },
  columnEmpty: { minHeight: 80, display: "grid", placeItems: "center", textAlign: "center", color: "var(--color-text-tertiary)", fontSize: 11 },
  pagination: { height: 54, flexShrink: 0, borderTop: "1px solid var(--surface-variant)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px 0 16px", boxSizing: "border-box", fontSize: 14, letterSpacing: "0.25px", color: "var(--grey-700)" },
  pageControls: { display: "flex", alignItems: "center", gap: 6 },
  footer: { minHeight: 92, marginTop: "auto", padding: "20px 24px 24px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", boxSizing: "border-box", flexShrink: 0 },
  pathCount: { fontSize: 12, lineHeight: "18px", letterSpacing: "0.5px", color: "var(--grey-700)", fontWeight: 600 },
  actions: { display: "flex", alignItems: "center", gap: 24 },
  srOnly: { position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0 },
};
