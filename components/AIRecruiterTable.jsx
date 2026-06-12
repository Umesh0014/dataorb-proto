"use client";

import React from "react";
import { Plus, Search, ArrowUpDown, ListFilter, ChevronRight, Check } from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import Banner from "./Banner";
import TabsRow from "./TabsRow";
import { FaceScanIcon } from "./SideNav/icons";
import { formatDate } from "./formatDate";
import { FAMILY_LABELS, STAGES } from "./mocks/recruiter";
import {
  CandidateMonogram, StageBadge, CoverageMeter, COMPLIANCE_COPY,
} from "./AIRecruiterParts";
import {
  CandidateDetailHeader, CandidateDetailBody, CandidateDetailFooter,
} from "./CandidateDetail";

// AIRecruiterTable (Variant B · direction R2) — the candidate pipeline as an
// operational, scan-at-volume table reusing the Tasks/MissionsTable pattern.
// Per-candidate detail opens in a right-edge sidecar (UI-9 tabular primary +
// sidecar reveal), not a new page: the shared CandidateDetail surface carries
// the AI screening evidence (editable narrative, read-only coverage) and the
// stage-advance CTA — including the "Push to Interview" the hiring manager
// makes after AI screening. The row's name control is a real button so the
// surface is fully keyboard-operable; a visible chevron makes the drill obvious
// (INT-2).

// Pipeline tabs bucket the stages a hiring manager scans by. "Active" is the
// live funnel; Hired and Community are terminal / off-pipeline pools.
const TAB_BUCKETS = {
  active: ["applied", "ai_screening", "interview", "offer"],
  hired: ["hired"],
  community: ["community"],
};

// Stage rank for the "Pipeline stage" sort — follows the canonical order in
// STAGES so the table can read top-of-funnel → hired.
const STAGE_RANK = STAGES.reduce((acc, st, i) => { acc[st.id] = i; return acc; }, { community: STAGES.length });

// Sort options for the table. Each carries a comparator over candidates;
// coverage uses the completed-screening percentage (in-progress / not-started
// sort to the bottom — they have no settled coverage figure).
const coveragePct = (c) =>
  c.screen.status === "completed" && c.screen.coverage.total > 0
    ? c.screen.coverage.covered / c.screen.coverage.total
    : -1;
const SORTS = [
  { id: "applied_desc", label: "Newest applied", cmp: (a, b) => b.appliedAt.localeCompare(a.appliedAt) },
  { id: "applied_asc", label: "Oldest applied", cmp: (a, b) => a.appliedAt.localeCompare(b.appliedAt) },
  { id: "name", label: "Name (A–Z)", cmp: (a, b) => a.name.localeCompare(b.name) },
  { id: "coverage_desc", label: "Coverage (high–low)", cmp: (a, b) => coveragePct(b) - coveragePct(a) },
  { id: "stage", label: "Pipeline stage", cmp: (a, b) => STAGE_RANK[a.stage] - STAGE_RANK[b.stage] },
];

export default function AIRecruiterTable({ candidates, onAdvance, onOpenCandidate, onAddCandidate }) {
  const [tab, setTab] = React.useState("active");
  const [search, setSearch] = React.useState("");
  const [sortId, setSortId] = React.useState("applied_desc");
  const [openId, setOpenId] = React.useState(null);

  const TABS = [
    { id: "active", label: "Active pipeline", count: candidates.filter((c) => TAB_BUCKETS.active.includes(c.stage)).length },
    { id: "hired", label: "Hired", count: candidates.filter((c) => c.stage === "hired").length },
    { id: "community", label: "Talent Community", count: candidates.filter((c) => c.stage === "community").length },
  ];

  const inTab = candidates.filter((c) => TAB_BUCKETS[tab].includes(c.stage));
  const rows = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    const matched = q
      ? inTab.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.role.toLowerCase().includes(q) ||
            FAMILY_LABELS[c.family].toLowerCase().includes(q),
        )
      : inTab;
    const sort = SORTS.find((srt) => srt.id === sortId) || SORTS[0];
    return [...matched].sort(sort.cmp);
  }, [inTab, search, sortId]);

  const openCandidate = openId ? candidates.find((c) => c.id === openId) : null;

  return (
    <div style={s.page}>
      <Card padX={28} padY={20} tone="default" style={s.headerCard}>
        <div style={s.headerInner}>
          <div style={s.row1}>
            <div style={s.identifier}>
              <span style={s.identIcon}>
                <FaceScanIcon size={18} color="var(--color-icon-tertiary-fg)" />
              </span>
              <span style={s.identLabel}>AI Recruiter</span>
            </div>
            <Button variant="primary" leadingIcon={<Plus size={16} />} onClick={() => onAddCandidate?.()}>
              Add candidate
            </Button>
          </div>
          <div style={s.row2}>
            <Search size={18} color="var(--color-text-placeholder)" />
            <input
              type="text"
              className="recruiter-focusable"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search candidates by name or role"
              aria-label="Search candidates by name or role"
              style={s.searchInput}
            />
            <div style={s.iconGroup}>
              <SortControl value={sortId} onChange={setSortId} />
              <Button variant="icon" size="sm" aria-label="Filter candidates"><ListFilter size={18} /></Button>
            </div>
          </div>
        </div>
      </Card>

      <Banner tone="info" heading={COMPLIANCE_COPY.heading} body={COMPLIANCE_COPY.body} />

      <TabsRow tabs={TABS} activeTab={tab} onTabClick={setTab} />

      <Card padX={0} padY={0} tone="default" style={s.tableCard}>
        {rows.length > 0 ? (
          <table style={s.table}>
            <colgroup>
              <col style={{ width: "30%" }} />
              <col style={{ width: "22%" }} />
              <col style={{ width: "16%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "12%" }} />
            </colgroup>
            <thead>
              <tr style={s.headRow}>
                <th style={s.th} scope="col">Candidate</th>
                <th style={s.th} scope="col">Role applied</th>
                <th style={s.th} scope="col">Stage</th>
                <th style={s.th} scope="col">AI screening coverage</th>
                <th style={s.th} scope="col">Applied</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c, i) => (
                <CandidateRow
                  key={c.id}
                  candidate={c}
                  isLast={i === rows.length - 1}
                  active={openId === c.id}
                  onOpen={() => setOpenId(c.id)}
                />
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState query={search} tab={TABS.find((t) => t.id === tab)?.label} />
        )}
      </Card>

      {openCandidate && (
        <CandidateSidecar
          candidate={openCandidate}
          onClose={() => setOpenId(null)}
          onAdvance={onAdvance}
          onOpenCandidate={onOpenCandidate}
        />
      )}
    </div>
  );
}

function CandidateRow({ candidate, isLast, active, onOpen }) {
  const [hover, setHover] = React.useState(false);
  return (
    <tr
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...s.row,
        borderBottom: isLast ? "none" : "1px solid var(--table-row-border)",
        background: active ? "var(--overlay-selected)" : hover ? "var(--table-row-hover)" : "transparent",
      }}
    >
      <td style={s.cell}>
        <button
          type="button"
          className="recruiter-focusable"
          onClick={onOpen}
          aria-label={`${candidate.name} — open candidate details`}
          style={s.nameBtn}
        >
          <CandidateMonogram candidate={candidate} size={32} />
          <span style={s.nameText}>
            <span style={s.nameName}>{candidate.name}</span>
            <span style={s.nameSub}>{FAMILY_LABELS[candidate.family]} · {candidate.source}</span>
          </span>
          <ChevronRight size={18} color="var(--color-text-tertiary)" style={{ flexShrink: 0, opacity: hover || active ? 1 : 0.85, transition: "opacity 150ms ease" }} aria-hidden="true" />
        </button>
      </td>
      <td style={s.cell}><span style={s.roleCell}>{candidate.role}</span></td>
      <td style={s.cell}><StageBadge stage={candidate.stage} /></td>
      <td style={s.cell}><CoverageMeter screen={candidate.screen} compact /></td>
      <td style={s.cell}><span style={s.dateCell}>{formatDate(candidate.appliedAt)}</span></td>
    </tr>
  );
}

// CandidateSidecar — right-edge drawer hosting the shared CandidateDetail. Esc
// + scrim + close button all dismiss it. Slide-in gated by
// prefers-reduced-motion via the .recruiter-drawer class.
function CandidateSidecar({ candidate, onClose, onAdvance, onOpenCandidate }) {
  const closeRef = React.useRef(null);
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      <div onClick={onClose} aria-hidden="true" style={s.scrim} />
      <aside className="recruiter-drawer" role="dialog" aria-modal="true" aria-label={`${candidate.name} details`} style={s.drawer}>
        <CandidateDetailHeader candidate={candidate} onClose={onClose} closeRef={closeRef} />
        <CandidateDetailBody candidate={candidate} />
        <CandidateDetailFooter candidate={candidate} onAdvance={onAdvance} onOpenCandidate={onOpenCandidate} />
      </aside>
    </>
  );
}

// SortControl — icon-button trigger + a radio menu of sort keys. Mirrors the
// Missions Kanban SortControl pattern (icon Button, scrim-dismissed menu,
// menuitemradio rows) so the table's sort affordance reads the same as the
// board's everywhere it appears.
function SortControl({ value, onChange }) {
  const [open, setOpen] = React.useState(false);
  const active = SORTS.find((srt) => srt.id === value) || SORTS[0];
  return (
    <div style={s.sortWrap}>
      <Button
        variant="icon"
        size="sm"
        aria-label={`Sort candidates — ${active.label}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        style={{ background: open ? "var(--pill-bg)" : undefined }}
      >
        <ArrowUpDown size={18} />
      </Button>
      {open && (
        <>
          <div style={s.sortScrim} onClick={() => setOpen(false)} aria-hidden="true" />
          <div role="menu" aria-label="Sort candidates" style={s.sortMenu}>
            {SORTS.map((srt) => {
              const on = srt.id === value;
              return (
                <button
                  key={srt.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={on}
                  className="recruiter-focusable"
                  onClick={() => { onChange(srt.id); setOpen(false); }}
                  style={{ ...s.sortItem, color: on ? "var(--color-text-deep)" : "var(--color-text-medium)", fontWeight: on ? 700 : 500 }}
                >
                  {srt.label}
                  {on && <Check size={15} aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function EmptyState({ query, tab }) {
  return (
    <div style={s.empty}>
      <span style={s.emptyIcon}><Search size={26} color="var(--color-text-placeholder)" /></span>
      <span style={s.emptyHeading}>{query ? "No candidates match your search" : `No candidates in ${tab}`}</span>
      <span style={s.emptyBody}>
        {query ? "Try a different keyword or clear the search." : "Candidates in this stage will appear here as they move through the pipeline."}
      </span>
    </div>
  );
}

const s = {
  page: { flex: 1, minHeight: 0, display: "flex", flexDirection: "column", gap: "var(--page-card-gap)", fontFamily: "var(--font-sans)" },
  headerCard: { flexShrink: 0 },
  headerInner: { display: "flex", flexDirection: "column", gap: 16 },
  row1: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 },
  identifier: { display: "inline-flex", alignItems: "center" },
  identIcon: {
    width: 32, height: 32, borderRadius: 999, background: "var(--color-icon-tertiary-bg)",
    display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  identLabel: { marginLeft: 8, fontSize: 18, fontWeight: 600, color: "var(--color-text-deep)", lineHeight: 1.4 },
  row2: { display: "flex", alignItems: "center", gap: 12 },
  searchInput: { flex: 1, minWidth: 0, border: "none", background: "transparent", fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--color-text-deep)" },
  iconGroup: { display: "flex", alignItems: "center", gap: 8, flexShrink: 0 },

  sortWrap: { position: "relative", flexShrink: 0 },
  sortScrim: { position: "fixed", inset: 0, zIndex: 39 },
  sortMenu: {
    position: "absolute", top: "calc(100% + 6px)", right: 0, minWidth: 200, zIndex: 40,
    background: "var(--surface-white)", border: "1px solid var(--color-divider-card)",
    borderRadius: 10, boxShadow: "var(--shadow-8)", padding: 6, display: "flex", flexDirection: "column", gap: 2,
  },
  sortItem: {
    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
    width: "100%", padding: "8px 12px", borderRadius: 8, border: "none", background: "transparent",
    cursor: "pointer", textAlign: "left", fontFamily: "var(--font-sans)", fontSize: 13,
  },

  tableCard: { overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse", tableLayout: "fixed", fontFamily: "var(--font-sans)" },
  headRow: { borderBottom: "1px solid var(--table-row-border)" },
  th: { padding: "14px 24px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "var(--color-text-medium)", whiteSpace: "nowrap" },
  row: { transition: "background 150ms ease" },
  cell: { padding: "14px 24px", verticalAlign: "middle" },

  nameBtn: {
    display: "flex", alignItems: "center", gap: 12, width: "100%",
    background: "transparent", border: "none", padding: 0, cursor: "pointer",
    textAlign: "left", fontFamily: "var(--font-sans)", borderRadius: 8,
  },
  nameText: { display: "flex", flexDirection: "column", gap: 2, minWidth: 0, flex: 1 },
  nameName: { fontSize: 14, fontWeight: 700, color: "var(--color-text-deep)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  nameSub: { fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  roleCell: { fontSize: 13, fontWeight: 500, color: "var(--color-text-medium)", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  dateCell: { fontSize: 13, fontWeight: 400, color: "var(--color-text-tertiary)", fontVariantNumeric: "tabular-nums" },

  empty: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 8, padding: "64px 24px" },
  emptyIcon: { width: 64, height: 64, borderRadius: 999, background: "var(--color-card-emoji-bg)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 },
  emptyHeading: { fontSize: 16, fontWeight: 700, color: "var(--color-text-deep)", lineHeight: 1.4 },
  emptyBody: { fontSize: 14, fontWeight: 400, color: "var(--color-text-tertiary)", lineHeight: 1.5, maxWidth: 360 },

  // Sidecar shell
  scrim: { position: "fixed", inset: 0, background: "var(--overlay-hover)", zIndex: 39 },
  drawer: {
    position: "fixed", top: 0, right: 0, bottom: 0, width: 360,
    background: "var(--surface-white)", boxShadow: "var(--shadow-drawer)",
    display: "flex", flexDirection: "column", zIndex: 40, fontFamily: "var(--font-sans)",
  },
};
