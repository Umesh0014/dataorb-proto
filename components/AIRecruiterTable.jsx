"use client";

import React from "react";
import {
  Plus, Search, ArrowUpDown, ListFilter, ChevronRight, X, Sparkles, Pencil,
} from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import Banner from "./Banner";
import TabsRow from "./TabsRow";
import MultiLineInput from "./MultiLineInput";
import { FaceScanIcon } from "./SideNav/icons";
import { formatDate } from "./formatDate";
import { FAMILY_LABELS, STAGE_META } from "./mocks/recruiter";
import {
  CandidateMonogram, StageBadge, CoverageMeter, RecordedTag, AdvanceButton,
  COMPLIANCE_COPY,
} from "./AIRecruiterParts";

// AIRecruiterTable (Variant B · direction R2) — the candidate pipeline as an
// operational, scan-at-volume table reusing the Tasks/MissionsTable pattern.
// Per-candidate detail opens in a right-edge sidecar (UI-9 tabular primary +
// sidecar reveal), not a new page: candidate identity, the AI screening
// evidence (editable narrative, read-only coverage), and the stage-advance
// action — including the "Push to Interview" the hiring manager makes after
// AI screening. The row's name control is a real button so the surface is
// fully keyboard-operable; a visible chevron makes the drill obvious (INT-2).

// Pipeline tabs bucket the stages a hiring manager scans by. "Active" is the
// live funnel; Hired and Community are terminal / off-pipeline pools.
const TAB_BUCKETS = {
  active: ["applied", "ai_screening", "interview", "offer"],
  hired: ["hired"],
  community: ["community"],
};

export default function AIRecruiterTable({ candidates, onAdvance, onOpenCandidate }) {
  const [tab, setTab] = React.useState("active");
  const [search, setSearch] = React.useState("");
  const [openId, setOpenId] = React.useState(null);

  const TABS = [
    { id: "active", label: "Active pipeline", count: candidates.filter((c) => TAB_BUCKETS.active.includes(c.stage)).length },
    { id: "hired", label: "Hired", count: candidates.filter((c) => c.stage === "hired").length },
    { id: "community", label: "Talent Community", count: candidates.filter((c) => c.stage === "community").length },
  ];

  const inTab = candidates.filter((c) => TAB_BUCKETS[tab].includes(c.stage));
  const rows = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return inTab;
    return inTab.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q) ||
        FAMILY_LABELS[c.family].toLowerCase().includes(q),
    );
  }, [inTab, search]);

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
            <Button variant="primary" leadingIcon={<Plus size={16} />} onClick={() => onOpenCandidate?.("new")}>
              Add candidate
            </Button>
          </div>
          <div style={s.row2}>
            <Search size={18} color="var(--color-text-placeholder)" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search candidates by name or role"
              aria-label="Search candidates by name or role"
              style={s.searchInput}
            />
            <div style={s.iconGroup}>
              <Button variant="icon" size="sm" aria-label="Sort candidates"><ArrowUpDown size={18} /></Button>
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

// CandidateSidecar — right-edge drawer with the per-candidate detail. Esc +
// scrim + close button all dismiss it. Slide-in gated by
// prefers-reduced-motion via the .recruiter-drawer class.
function CandidateSidecar({ candidate, onClose, onAdvance, onOpenCandidate }) {
  const closeRef = React.useRef(null);
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const meta = STAGE_META[candidate.stage];

  return (
    <>
      <div onClick={onClose} aria-hidden="true" style={s.scrim} />
      <aside className="recruiter-drawer" role="dialog" aria-modal="true" aria-label={`${candidate.name} details`} style={s.drawer}>
        <div style={s.drawerHead}>
          <div style={s.drawerIdent}>
            <CandidateMonogram candidate={candidate} size={40} />
            <div style={{ minWidth: 0 }}>
              <div style={s.drawerName}>{candidate.name}</div>
              <div style={s.drawerSub}>{candidate.role}</div>
            </div>
          </div>
          <button ref={closeRef} type="button" className="recruiter-focusable" onClick={onClose} aria-label="Close details" style={s.closeBtn}>
            <X size={18} color="var(--color-text-medium)" />
          </button>
        </div>

        <div style={s.drawerBody}>
          <div style={s.drawerRowTop}>
            <StageBadge stage={candidate.stage} />
            <RecordedTag />
          </div>

          <CoverageMeter screen={candidate.screen} />

          <div style={s.metaGrid}>
            <Meta label="Job family" value={FAMILY_LABELS[candidate.family]} />
            <Meta label="Source" value={candidate.source} />
            <Meta label="Applied" value={formatDate(candidate.appliedAt)} />
            <Meta label="AI screening" value={screeningStatusLabel(candidate)} />
            <Meta label="Last activity" value={candidate.lastActivity} />
            <Meta label="Follow-up topics" value={thinLabel(candidate)} />
          </div>

          <EvidenceBlock candidate={candidate} />

          <div style={s.complianceNote}>
            <p style={s.complianceTitle}>{COMPLIANCE_COPY.heading}</p>
            <p style={s.complianceBody}>{COMPLIANCE_COPY.body}</p>
          </div>
        </div>

        <div style={s.drawerFooter}>
          {meta?.advance && (
            <AdvanceButton candidate={candidate} onAdvance={onAdvance} fullWidth />
          )}
          <Button variant="text" uppercase={false} fullWidth onClick={() => onOpenCandidate?.(candidate.id)}>
            Open candidate record
          </Button>
        </div>
      </aside>
    </>
  );
}

function screeningStatusLabel(c) {
  if (c.screen.status === "completed") return `Completed ${formatDate(c.screen.completedAt)}`;
  if (c.screen.status === "in_progress") return "In progress";
  return "Not started";
}

function thinLabel(c) {
  if (c.screen.status !== "completed") return "—";
  if (!c.thin) return "None — full coverage";
  return `${c.thin} topic${c.thin === 1 ? "" : "s"} to probe`;
}

// evidenceDraft — the AI's starting-state evidence summary, generated from the
// candidate's screening coverage. Deliberately coverage-framed and verdict-free
// (G4): it describes what was discussed, never whether the candidate passed.
function evidenceDraft(c) {
  const { status, coverage } = c.screen;
  const { covered, total } = coverage;
  if (status === "not_started") {
    return `AI screening hasn't run yet — an evidence summary appears here once ${c.name} completes the screening.`;
  }
  if (status === "in_progress") {
    return `AI screening is in progress — ${covered} of ${total} assigned topics covered so far. A full evidence summary appears when it completes.`;
  }
  const thin = c.thin || 0;
  const thinClause = thin > 0
    ? `${thin} topic${thin === 1 ? "" : "s"} show thinner coverage and may be worth probing in the interview`
    : "all assigned topics were covered";
  return (
    `In the AI screening for ${c.role}, ${c.name} covered ${covered} of ${total} ` +
    `assigned topics. Coverage is most consistent on core process steps; ${thinClause}. ` +
    `Evidence only — no hiring recommendation.`
  );
}

// EvidenceBlock — the AI-output-as-starting-state surface (INT-7). The
// narrative is editable inline and user-owned; once edited it carries a "last
// edited by" credit. The quantitative coverage above stays read-only — the
// user owns the words, the system owns the numbers.
function EvidenceBlock({ candidate }) {
  const draft = evidenceDraft(candidate);
  const [text, setText] = React.useState(draft);
  const [editing, setEditing] = React.useState(false);
  const [edited, setEdited] = React.useState(false);
  const completed = candidate.screen.status === "completed";

  // The draft is candidate-specific; reset the editor when the open candidate
  // changes so the sidecar never shows a stale summary.
  React.useEffect(() => {
    setText(draft);
    setEditing(false);
    setEdited(false);
  }, [draft]);

  const save = () => { setEditing(false); setEdited(true); };
  const cancel = () => { setText(draft); setEditing(false); };

  return (
    <div style={s.evidence}>
      <div style={s.evidenceHead}>
        <span style={s.evidenceTitle}>
          <Sparkles size={14} color="var(--color-icon-tertiary-fg)" aria-hidden="true" />
          Evidence summary
        </span>
        {completed && !editing && (
          <button type="button" className="recruiter-focusable" onClick={() => setEditing(true)} style={s.evidenceEdit}>
            <Pencil size={13} aria-hidden="true" /> Edit
          </button>
        )}
      </div>

      {editing ? (
        <>
          <MultiLineInput value={text} onChange={setText} max={420} rows={5} placeholder="Evidence summary" ariaLabel={`Evidence summary for ${candidate.name}`} />
          <div style={s.evidenceActions}>
            <Button variant="text" uppercase={false} onClick={cancel} style={{ height: 32 }}>Cancel</Button>
            <Button variant="primary" onClick={save} style={{ height: 32, minWidth: 0, paddingInline: 16 }}>Save</Button>
          </div>
        </>
      ) : (
        <p style={s.evidenceBody}>{text}</p>
      )}

      {completed && (
        <span style={s.evidenceMeta} role="status" aria-live="polite">
          {edited ? "Last edited by Demo Internal · Today" : "AI draft · not yet edited"}
        </span>
      )}
    </div>
  );
}

function Meta({ label, value }) {
  return (
    <div style={s.meta}>
      <span style={s.metaLabel}>{label}</span>
      <span style={s.metaValue}>{value}</span>
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
  searchInput: { flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent", fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--color-text-deep)" },
  iconGroup: { display: "flex", alignItems: "center", gap: 8, flexShrink: 0 },

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

  // Sidecar
  scrim: { position: "fixed", inset: 0, background: "var(--overlay-hover)", zIndex: 39 },
  drawer: {
    position: "fixed", top: 0, right: 0, bottom: 0, width: 360,
    background: "var(--surface-white)", boxShadow: "var(--shadow-drawer)",
    display: "flex", flexDirection: "column", zIndex: 40, fontFamily: "var(--font-sans)",
  },
  drawerHead: {
    display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12,
    padding: "20px 20px 16px", borderBottom: "1px solid var(--color-divider-card)",
  },
  drawerIdent: { display: "flex", alignItems: "center", gap: 12, minWidth: 0 },
  drawerName: { fontSize: 15, fontWeight: 700, color: "var(--color-text-deep)", lineHeight: 1.35 },
  drawerSub: { fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)", marginTop: 2 },
  closeBtn: {
    width: 32, height: 32, borderRadius: 8, border: "none", background: "var(--color-card-emoji-bg)",
    display: "inline-grid", placeItems: "center", cursor: "pointer", flexShrink: 0,
  },
  drawerBody: { flex: 1, minHeight: 0, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 20 },
  drawerRowTop: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" },
  metaGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  meta: { display: "flex", flexDirection: "column", gap: 3, minWidth: 0 },
  metaLabel: { fontSize: 11, fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase", color: "var(--color-text-tertiary)" },
  metaValue: { fontSize: 13, fontWeight: 500, color: "var(--color-text-deep)", lineHeight: 1.4 },
  evidence: { display: "flex", flexDirection: "column", gap: 8 },
  evidenceHead: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 },
  evidenceTitle: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase", color: "var(--color-text-tertiary)" },
  evidenceEdit: {
    display: "inline-flex", alignItems: "center", gap: 4, background: "transparent", border: "none",
    padding: "2px 4px", cursor: "pointer", borderRadius: 6, color: "var(--color-button-primary-bg)",
    fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 700,
  },
  evidenceBody: { margin: 0, fontSize: 13, fontWeight: 400, color: "var(--color-text-medium)", lineHeight: 1.55 },
  evidenceActions: { display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 },
  evidenceMeta: { fontSize: 11, fontWeight: 500, color: "var(--color-text-placeholder)" },

  complianceNote: { background: "var(--color-info-bg)", borderRadius: 8, padding: "12px 14px" },
  complianceTitle: { margin: 0, fontSize: 12, fontWeight: 700, color: "var(--color-info)" },
  complianceBody: { margin: "4px 0 0", fontSize: 12, fontWeight: 400, color: "var(--color-info-text)", lineHeight: 1.5 },
  drawerFooter: { padding: 20, borderTop: "1px solid var(--color-divider-card)", display: "flex", flexDirection: "column", gap: 4 },
};
