"use client";

import React from "react";
import { createPortal } from "react-dom";
import { Plus, Trash2, X } from "lucide-react";
import Button from "./Button";

const FEATURED_ROLEPLAYS = [
  { id: "rp-01", title: "Slow speed after router restart", category: "Connectivity", modified: "Jun 18, 2026", attached: true },
  { id: "rp-02", title: "Intermittent dropout - home office", category: "WiFi support", modified: "Jun 21, 2026", calibration: true, attached: true },
  { id: "rp-03", title: "Intermittent dropout - home office", category: "WiFi support", modified: "Jun 21, 2026" },
  { id: "rp-04", title: "Intermittent dropout - home office", category: "WiFi support", modified: "Jun 21, 2026" },
  { id: "rp-05", title: "Intermittent dropout - home office", category: "WiFi support", modified: "Jun 21, 2026" },
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

// "07 · Publish — attach roleplays confirmation" — Draft workflow's publish
// gate: search + paginated roleplay list, each row toggles attached (trash
// icon) vs not (+ Add chip), footer shows path/step count + Cancel/Publish.
export default function WorkflowPublishModal({ workflow, onClose, onPublish }) {
  const dialogRef = React.useRef(null);
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
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
  const totalPages = Math.max(1, Math.ceil(matchingRoleplays.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleRoleplays = matchingRoleplays.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const toggle = (id) => {
    setAttached((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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
          <h2 id="workflow-publish-title" style={wpStyles.title}>Add roleplays to publish</h2>
          <Button variant="icon" size="sm" onClick={onClose} aria-label="Close publish modal"><X size={18} /></Button>
          <span id="workflow-publish-context" style={wpStyles.srOnly}>Choose the roleplays attached to {workflow.id} before publishing.</span>
        </header>

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
          <div style={wpStyles.list}>
            {visibleRoleplays.map((item) => {
              const selected = attached.has(item.id);
              return (
                <article key={item.id} style={wpStyles.card}>
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
          </div>
        </div>

        <div style={wpStyles.pagination}>
          <span>Total {ROLEPLAYS.length} roleplays</span>
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
  header: { minHeight: 64, flexShrink: 0, padding: "20px 24px 12px", boxSizing: "border-box", display: "flex", alignItems: "flex-start", justifyContent: "space-between" },
  title: { margin: 0, fontSize: 20, lineHeight: "32px", fontWeight: 500, letterSpacing: "0.15px", color: "var(--color-text-medium)" },
  body: { flex: 1, padding: "4px 16px", overflowY: "auto", minHeight: 0 },
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
  pagination: { height: 54, flexShrink: 0, borderTop: "1px solid var(--surface-variant)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px 0 16px", boxSizing: "border-box", fontSize: 14, letterSpacing: "0.25px", color: "var(--grey-700)" },
  pageControls: { display: "flex", alignItems: "center", gap: 6 },
  footer: { minHeight: 92, marginTop: "auto", padding: "20px 24px 24px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", boxSizing: "border-box", flexShrink: 0 },
  pathCount: { fontSize: 12, lineHeight: "18px", letterSpacing: "0.5px", color: "var(--grey-700)", fontWeight: 600 },
  actions: { display: "flex", alignItems: "center", gap: 24 },
  srOnly: { position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0 },
};
