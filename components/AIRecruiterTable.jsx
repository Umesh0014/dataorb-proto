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
import { INTERVIEW_PLANS, FAMILY_LABELS, planCounts } from "./mocks/recruiter";
import {
  FamilyAvatar, StatusChip, CoverageMeter, ModeTag, MaintainedTag,
  RecordedTag, COMPLIANCE_COPY,
} from "./AIRecruiterParts";

// AIRecruiterTable (Variant B · direction D2) — the interview-plan library
// as an operational, scan-at-volume table reusing the Tasks/MissionsTable
// pattern. Per-plan detail opens in a right-edge sidecar (UI-9 tabular
// primary + sidecar reveal), not a new page. The row's plan-name control
// is a real button so the surface is fully keyboard-operable; a visible
// chevron makes the drill-down obvious (INT-2), never hover-only.

export default function AIRecruiterTable({ onOpenPlan, onCreatePlan }) {
  const [tab, setTab] = React.useState("live");
  const [search, setSearch] = React.useState("");
  const [openId, setOpenId] = React.useState(null);

  const counts = planCounts(INTERVIEW_PLANS);
  const TABS = [
    { id: "live", label: "Live", count: counts.live },
    { id: "draft", label: "Draft", count: counts.draft },
    { id: "archived", label: "Archived", count: counts.archived },
  ];

  const inTab = INTERVIEW_PLANS.filter((p) => p.status === tab);
  const rows = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return inTab;
    return inTab.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.jobProfile.toLowerCase().includes(q) ||
        p.domain.toLowerCase().includes(q),
    );
  }, [inTab, search]);

  const openPlan = openId ? INTERVIEW_PLANS.find((p) => p.id === openId) : null;

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
            <Button variant="primary" leadingIcon={<Plus size={16} />} onClick={onCreatePlan}>
              Interview plan
            </Button>
          </div>
          <div style={s.row2}>
            <Search size={18} color="var(--color-text-placeholder)" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search interview plans"
              aria-label="Search interview plans"
              style={s.searchInput}
            />
            <div style={s.iconGroup}>
              <Button variant="icon" size="sm" aria-label="Sort plans"><ArrowUpDown size={18} /></Button>
              <Button variant="icon" size="sm" aria-label="Filter plans"><ListFilter size={18} /></Button>
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
              <col style={{ width: "34%" }} />
              <col style={{ width: "16%" }} />
              <col style={{ width: "16%" }} />
              <col style={{ width: "22%" }} />
              <col style={{ width: "12%" }} />
            </colgroup>
            <thead>
              <tr style={s.headRow}>
                <th style={s.th} scope="col">Interview plan</th>
                <th style={s.th} scope="col">Mode</th>
                <th style={s.th} scope="col">Interviews</th>
                <th style={s.th} scope="col">Knowledge coverage</th>
                <th style={s.th} scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p, i) => (
                <PlanRow
                  key={p.id}
                  plan={p}
                  isLast={i === rows.length - 1}
                  active={openId === p.id}
                  onOpen={() => setOpenId(p.id)}
                />
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState query={search} />
        )}
      </Card>

      {openPlan && (
        <PlanSidecar plan={openPlan} onClose={() => setOpenId(null)} onOpenPlan={onOpenPlan} />
      )}
    </div>
  );
}

function PlanRow({ plan, isLast, active, onOpen }) {
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
          aria-label={`${plan.name} — open details`}
          style={s.planBtn}
        >
          <FamilyAvatar family={plan.family} size={32} />
          <span style={s.planText}>
            <span style={s.planName}>{plan.name}</span>
            <span style={s.planSub}>{plan.jobProfile} · {FAMILY_LABELS[plan.family]}</span>
          </span>
          <ChevronRight size={18} color="var(--color-text-tertiary)" style={{ flexShrink: 0, opacity: hover || active ? 1 : 0.85, transition: "opacity 150ms ease" }} aria-hidden="true" />
        </button>
      </td>
      <td style={s.cell}><ModeTag mode={plan.mode} assisted={plan.assisted} /></td>
      <td style={s.cell}>
        <span style={s.interviews}>
          <span style={s.interviewsNum}>{plan.interviewsRun}</span> run
          <span style={s.interviewsDim}> · {plan.candidatesInvited} invited</span>
        </span>
      </td>
      <td style={s.cell}><CoverageMeter coverage={plan.coverage} compact /></td>
      <td style={s.cell}><StatusChip status={plan.status} /></td>
    </tr>
  );
}

// PlanSidecar — right-edge drawer with the per-plan detail. Esc + scrim +
// close button all dismiss it (one consistent dismissal set). Slide-in is
// gated by prefers-reduced-motion via the .recruiter-drawer class.
function PlanSidecar({ plan, onClose, onOpenPlan }) {
  const closeRef = React.useRef(null);
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    // Move focus into the dialog on open so keyboard users land inside it.
    closeRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      <div onClick={onClose} aria-hidden="true" style={s.scrim} />
      <aside className="recruiter-drawer" role="dialog" aria-modal="true" aria-label={`${plan.name} details`} style={s.drawer}>
        <div style={s.drawerHead}>
          <div style={s.drawerIdent}>
            <FamilyAvatar family={plan.family} size={40} />
            <div style={{ minWidth: 0 }}>
              <div style={s.drawerName}>{plan.name}</div>
              <div style={s.drawerSub}>{plan.jobProfile} · {FAMILY_LABELS[plan.family]}</div>
            </div>
          </div>
          <button ref={closeRef} type="button" className="recruiter-focusable" onClick={onClose} aria-label="Close details" style={s.closeBtn}>
            <X size={18} color="var(--color-text-medium)" />
          </button>
        </div>

        <div style={s.drawerBody}>
          <div style={s.drawerRowTop}>
            <StatusChip status={plan.status} />
            <RecordedTag />
            <MaintainedTag maintainedBy={plan.maintainedBy} />
          </div>

          <CoverageMeter coverage={plan.coverage} />

          <div style={s.metaGrid}>
            <Meta label="Interview mode" value={plan.assisted ? `${plan.mode} · Assisted` : plan.mode} />
            <Meta label="Domain" value={plan.domain} />
            <Meta label="Interviews run" value={`${plan.interviewsRun} of ${plan.candidatesInvited} invited`} />
            <Meta label="Last interview" value={formatDate(plan.lastRun)} />
          </div>

          <EvidenceBlock plan={plan} />

          <div style={s.complianceNote}>
            <p style={s.complianceTitle}>{COMPLIANCE_COPY.heading}</p>
            <p style={s.complianceBody}>{COMPLIANCE_COPY.body}</p>
          </div>
        </div>

        <div style={s.drawerFooter}>
          <Button variant="primary" fullWidth onClick={() => onOpenPlan?.(plan.id)}>
            Open plan record
          </Button>
        </div>
      </aside>
    </>
  );
}

// evidenceDraft — the AI's starting-state evidence summary, generated from
// the plan's coverage. Deliberately coverage-framed and verdict-free (G4):
// it describes what was discussed, never whether a candidate passed.
function evidenceDraft(plan) {
  const c = plan.coverage;
  if (c.from === 0) {
    return "No interviews yet — an evidence summary appears here once candidates complete this interview.";
  }
  const thin = c.total - c.covered;
  return (
    `Across ${c.from} interviews, candidates covered ${c.covered} of ${c.total} ` +
    `assigned topics in ${plan.domain.toLowerCase()}. Coverage is most consistent on ` +
    `core verification and process steps; ${thin} topic${thin === 1 ? "" : "s"} show thinner ` +
    `coverage and may warrant follow-up. Evidence only — no hiring recommendation.`
  );
}

// EvidenceBlock — the AI-output-as-starting-state surface (INT-7). The
// narrative is editable inline and user-owned; once edited it carries a
// "last edited by" credit + activity line. The quantitative coverage above
// stays read-only — the user owns the words, the system owns the numbers.
function EvidenceBlock({ plan }) {
  const draft = evidenceDraft(plan);
  const [text, setText] = React.useState(draft);
  const [editing, setEditing] = React.useState(false);
  const [edited, setEdited] = React.useState(false);
  const hasInterviews = plan.coverage.from > 0;

  const save = () => { setEditing(false); setEdited(true); };
  const cancel = () => { setText(draft); setEditing(false); };

  return (
    <div style={s.evidence}>
      <div style={s.evidenceHead}>
        <span style={s.evidenceTitle}>
          <Sparkles size={14} color="var(--color-icon-tertiary-fg)" aria-hidden="true" />
          Evidence summary
        </span>
        {hasInterviews && !editing && (
          <button type="button" className="recruiter-focusable" onClick={() => setEditing(true)} style={s.evidenceEdit}>
            <Pencil size={13} aria-hidden="true" /> Edit
          </button>
        )}
      </div>

      {editing ? (
        <>
          <MultiLineInput value={text} onChange={setText} max={400} rows={5} placeholder="Evidence summary" />
          <div style={s.evidenceActions}>
            <Button variant="text" uppercase={false} onClick={cancel} style={{ height: 32 }}>Cancel</Button>
            <Button variant="primary" onClick={save} style={{ height: 32, minWidth: 0, paddingInline: 16 }}>Save</Button>
          </div>
        </>
      ) : (
        <p style={s.evidenceBody}>{text}</p>
      )}

      {hasInterviews && (
        <span style={s.evidenceMeta}>
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

function EmptyState({ query }) {
  return (
    <div style={s.empty}>
      <span style={s.emptyIcon}><Search size={26} color="var(--color-text-placeholder)" /></span>
      <span style={s.emptyHeading}>{query ? "No plans match your search" : "No interview plans here"}</span>
      <span style={s.emptyBody}>
        {query ? "Try a different keyword or clear the search." : "Plans in this status will appear here."}
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

  planBtn: {
    display: "flex", alignItems: "center", gap: 12, width: "100%",
    background: "transparent", border: "none", padding: 0, cursor: "pointer",
    textAlign: "left", fontFamily: "var(--font-sans)", borderRadius: 8,
  },
  planText: { display: "flex", flexDirection: "column", gap: 2, minWidth: 0, flex: 1 },
  planName: { fontSize: 14, fontWeight: 700, color: "var(--color-text-deep)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  planSub: { fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },

  interviews: { fontSize: 13, fontWeight: 400, color: "var(--color-text-medium)" },
  interviewsNum: { fontWeight: 700, color: "var(--color-text-deep)", fontVariantNumeric: "tabular-nums" },
  interviewsDim: { color: "var(--color-text-tertiary)" },

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
  drawerFooter: { padding: 20, borderTop: "1px solid var(--color-divider-card)" },
};
