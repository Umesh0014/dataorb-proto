"use client";

import React from "react";
import { ChevronDown, Plus, Check, Download, ExternalLink, Megaphone } from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import PageHeader from "./PageHeader";
import StatusBadge from "./StatusBadge";
import TabsRow from "./TabsRow";
import KebabMenu from "./KebabMenu";
import Modal from "./Modal";
import { LANES } from "./mocks/intervene";

// IntervenePipelineBoard — direction v3 "Pipeline Board". The review IS
// the board: columns are the state machine (Recruited → Shortlisted →
// Dismissed → Exported) and moving a card is the review action. Legal
// moves: recruited↔shortlisted, recruited↔dismissed, shortlisted↔dismissed.
// Shortlisted→Exported happens only via the export button; Exported is
// terminal (kebab offers a mocked Re-export, never a drag out).
const COLUMNS = [
  { id: "recruited", label: "Recruited" },
  { id: "shortlisted", label: "Shortlisted" },
  { id: "dismissed", label: "Dismissed" },
  { id: "exported", label: "Exported" },
];

const LEGAL_DROPS = {
  recruited: ["shortlisted", "dismissed"],
  shortlisted: ["recruited", "dismissed"],
  dismissed: ["recruited", "shortlisted"],
  exported: [],
};

// Kebab move affordances per status — the no-drag path to every legal move.
const MOVE_ITEMS = {
  recruited: [["Shortlist", "shortlisted"], ["Dismiss", "dismissed"]],
  shortlisted: [["Back to recruited", "recruited"], ["Dismiss", "dismissed"]],
  dismissed: [["Shortlist", "shortlisted"], ["Back to recruited", "recruited"]],
};

const prioColor = (p) =>
  p >= 80 ? "var(--color-error)" : p >= 60 ? "var(--color-warning)" : "var(--color-info)";

/**
 * @param {{ pageName: string, campaigns: Array<object>, runs: Array<object>,
 *   recruits: Array<object>,
 *   onSetStatus: (recruitId: string, status: "shortlisted"|"dismissed"|"recruited") => void,
 *   onExport: (ids: string[]) => void, onCreateCampaign: () => void }} props
 */
export default function IntervenePipelineBoard({ pageName, campaigns, runs, recruits, onSetStatus, onExport, onCreateCampaign }) {
  const [runId, setRunId] = React.useState("run-0714");
  const [laneId, setLaneId] = React.useState("all");
  const [openId, setOpenId] = React.useState(null);
  const [dragStatus, setDragStatus] = React.useState(null);
  const [dragOver, setDragOver] = React.useState(null);
  const [notice, setNotice] = React.useState(null);
  const noticeTimer = React.useRef(null);

  const run = runs.find((r) => r.id === runId) || runs[0];
  const campaign = campaigns.find((c) => c.id === run.campaignId);
  const runRecruits = recruits.filter((r) => r.runId === run.id);
  const visible = laneId === "all" ? runRecruits : runRecruits.filter((r) => r.lane === laneId);
  const open = recruits.find((r) => r.id === openId) || null;

  const flash = (msg) => {
    clearTimeout(noticeTimer.current);
    setNotice(msg);
    noticeTimer.current = setTimeout(() => setNotice(null), 3500);
  };
  React.useEffect(() => () => clearTimeout(noticeTimer.current), []);

  const byCol = (colId) =>
    visible.filter((r) => r.status === colId).sort((a, b) => b.priority - a.priority);
  const laneTabs = [
    { id: "all", label: "All", count: runRecruits.length },
    ...LANES.map((l) => ({ id: l.id, label: l.label, count: runRecruits.filter((r) => r.lane === l.id).length })),
  ];

  return (
    <div style={pbStyles.host}>
      <PageHeader
        identifier={{ icon: <Megaphone size={18} />, label: pageName || "Intervene" }}
        actions={
          <div style={pbStyles.headerActions}>
            <KebabMenu
              ariaLabel="Select run"
              glyph={<span style={pbStyles.runGlyph}>{run.label}<ChevronDown size={14} /></span>}
              triggerStyle={pbStyles.runTrigger}
              items={runs.map((r) => ({ label: r.label, onClick: () => { setRunId(r.id); setLaneId("all"); } }))}
            />
            <StatusBadge tone="info">{campaign?.name}</StatusBadge>
            <Button
              variant="primary"
              leadingIcon={<Plus size={14} />}
              onClick={onCreateCampaign}
              style={{ height: 32, minWidth: 0, paddingInline: 16 }}
            >
              New campaign
            </Button>
          </div>
        }
      />

      <TabsRow tabs={laneTabs} activeTab={laneId} onTabClick={setLaneId} />

      {notice && (
        <div style={pbStyles.noticeRow}>
          <StatusBadge tone="success">{notice}</StatusBadge>
        </div>
      )}

      <div style={pbStyles.board}>
        {COLUMNS.map((col) => {
          const cards = byCol(col.id);
          const count = runRecruits.length ? cards.length : run.counts?.[col.id] ?? 0;
          const droppable = dragStatus != null && LEGAL_DROPS[dragStatus].includes(col.id);
          return (
            <div
              key={col.id}
              onDragOver={(e) => { if (droppable) { e.preventDefault(); setDragOver(col.id); } }}
              onDragLeave={() => setDragOver((o) => (o === col.id ? null : o))}
              onDrop={(e) => {
                if (!droppable) return;
                e.preventDefault();
                const id = e.dataTransfer.getData("text/plain");
                if (id) onSetStatus(id, col.id);
                setDragStatus(null);
                setDragOver(null);
              }}
              style={pbStyles.columnWrap}
            >
              <Card
                tone="muted"
                padX={10}
                padY={12}
                style={{
                  ...pbStyles.column,
                  background: droppable && dragOver === col.id ? "var(--color-primary-alpha-08)" : undefined,
                  outline: droppable ? "1px dashed var(--do-brand-blue)" : "none",
                }}
              >
                <div style={pbStyles.colHead}>
                  <span style={pbStyles.colLabel}>{col.label}</span>
                  <span style={pbStyles.colCount}>{count}</span>
                  {col.id === "exported" && (
                    <Button variant="icon" size="sm" aria-label="Export CSV" onClick={() => flash(`CSV downloaded (${cards.length} rows).`)}>
                      <Download size={14} />
                    </Button>
                  )}
                </div>
                {col.id === "exported" && (
                  <p style={pbStyles.colHint}>Already-sent customers are never exported twice.</p>
                )}
                {cards.length === 0 && (
                  <p style={pbStyles.empty}>
                    {runRecruits.length === 0
                      ? "No cards seeded for this run in the prototype."
                      : "Nothing here yet."}
                  </p>
                )}
                {cards.map((r) => (
                  <RecruitCard
                    key={r.id}
                    r={r}
                    onOpen={() => setOpenId(r.id)}
                    onDrag={setDragStatus}
                    onDragEnd={() => { setDragStatus(null); setDragOver(null); }}
                    onMove={onSetStatus}
                    onReexport={() => flash(`${r.name} re-sent — already in the export, no duplicate created.`)}
                  />
                ))}
                {col.id === "shortlisted" && cards.length > 0 && (
                  <Button variant="primary" size="sm" fullWidth uppercase={false} style={{ marginTop: 4 }} onClick={() => onExport(cards.map((c) => c.id))}>
                    Export CSV ({cards.length})
                  </Button>
                )}
              </Card>
            </div>
          );
        })}
      </div>

      {open && (
        <Modal
          open
          onDismiss={() => setOpenId(null)}
          title={`${open.name} · ${open.customerId}`}
          body={<PopoutBody r={open} onMove={(to) => { onSetStatus(open.id, to); setOpenId(null); }} />}
          confirmLabel={open.status === "exported" ? "Done" : "Shortlist"}
          cancelLabel="Close"
          onConfirm={() => {
            if (open.status !== "exported") onSetStatus(open.id, "shortlisted");
            setOpenId(null);
          }}
        />
      )}
    </div>
  );
}

// Card mirrors KanbanDraftCard's clickable-card treatment; a div (not the
// raw-button pattern) because it hosts a nested KebabMenu and drag handles.
function RecruitCard({ r, onOpen, onDrag, onDragEnd, onMove, onReexport }) {
  const [hover, setHover] = React.useState(false);
  const exported = r.status === "exported";
  const items = exported
    ? [{ label: "Re-export", onClick: onReexport }]
    : MOVE_ITEMS[r.status].map(([label, to]) => ({ label, onClick: () => onMove(r.id, to) }));

  return (
    <div
      role="button"
      tabIndex={0}
      draggable={!exported}
      onDragStart={(e) => { e.dataTransfer.setData("text/plain", r.id); onDrag(r.status); }}
      onDragEnd={onDragEnd}
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === "Enter") onOpen(); }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...pbStyles.card,
        cursor: exported ? "pointer" : "grab",
        boxShadow: hover ? "0 6px 16px rgba(69, 70, 79, 0.16)" : "var(--shadow-card)",
      }}
    >
      <div style={pbStyles.cardTop}>
        <div style={{ minWidth: 0 }}>
          <div style={pbStyles.cardName}>{r.name}</div>
          <div style={pbStyles.cardId}>{r.customerId}</div>
        </div>
        <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
          <KebabMenu ariaLabel={`Actions for ${r.name}`} items={items} />
        </div>
      </div>
      <div style={pbStyles.metaRow}>
        <span style={pbStyles.laneChip}>{LANES.find((l) => l.id === r.lane)?.label}</span>
        <span style={pbStyles.priority}>
          <span style={{ ...pbStyles.priorityDot, background: prioColor(r.priority) }} />
          {r.priority}
        </span>
        {exported && (
          <span style={pbStyles.sent}><Check size={12} /> Sent</span>
        )}
      </div>
      <div style={pbStyles.chipRow}>
        {r.signals.slice(0, 2).map((s) => (
          <span key={s} style={pbStyles.signalChip}>{s}</span>
        ))}
      </div>
      {r.flags.length > 0 && (
        <div style={pbStyles.chipRow}>
          {r.flags.map((f) => <StatusBadge key={f} tone="warning">{f}</StatusBadge>)}
        </div>
      )}
    </div>
  );
}

function PopoutBody({ r, onMove }) {
  const [brief, setBrief] = React.useState(r.brief);
  const [loading, setLoading] = React.useState(false);

  const generate = () => {
    setLoading(true);
    setTimeout(() => {
      setBrief({
        summary: `${r.name} was flagged: ${r.sidecar.whyFlagged}. ${r.contacts30d} contact(s) in the last 30 days; last on ${r.lastContact}.`,
        bestPlay: "Personal outreach referencing the unresolved pain point within 48 hours.",
      });
      setLoading(false);
    }, 900);
  };

  return (
    <div style={pbStyles.popout}>
      <div>
        <p style={pbStyles.sectionLabel}>Why flagged</p>
        <p style={pbStyles.sectionText}>{r.sidecar.whyFlagged}</p>
      </div>
      <Card tone="muted" padX={16} padY={14}>
        <p style={pbStyles.sectionLabel}>Last conversation · {r.sidecar.spokeWith}</p>
        <p style={pbStyles.sectionText}>{r.sidecar.lastConversation}</p>
        <p style={pbStyles.metaLine}><strong>Pain point:</strong> {r.sidecar.painPoint}</p>
        <p style={pbStyles.metaLine}><strong>Resolution offered:</strong> {r.sidecar.resolutionOffered}</p>
      </Card>
      <Card tone="outline" padX={16} padY={14}>
        <p style={pbStyles.sectionLabel}>Ask Mira</p>
        {brief ? (
          <>
            <p style={pbStyles.sectionText}>{brief.summary}</p>
            <p style={pbStyles.metaLine}><strong>Best play:</strong> {brief.bestPlay}</p>
          </>
        ) : loading ? (
          <p style={pbStyles.metaLine}>Mira is drafting the brief…</p>
        ) : (
          <Button variant="ai" onClick={generate}>Generate brief</Button>
        )}
      </Card>
      <div style={pbStyles.popoutActions}>
        {r.status !== "exported" && r.status !== "dismissed" && (
          <Button variant="text" uppercase={false} onClick={() => onMove("dismissed")} style={{ color: "var(--color-error)" }}>
            Dismiss
          </Button>
        )}
        <Button variant="text" uppercase={false} trailingIcon={<ExternalLink size={14} />}>
          Open full interaction
        </Button>
      </div>
    </div>
  );
}

// Compact one-line entries — the block would otherwise push the file past
// the 350-line hard limit (CONVENTIONS §5).
const chip = { display: "inline-flex", alignItems: "center", height: 20, borderRadius: 4, fontWeight: 500, whiteSpace: "nowrap" };
const pbStyles = {
  host: { display: "flex", flexDirection: "column", gap: 16, fontFamily: "var(--font-sans)" },
  headerActions: { display: "flex", alignItems: "center", gap: 12 },
  runGlyph: { display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" },
  runTrigger: { width: "auto", minWidth: 0, height: 32, paddingInline: 12, borderRadius: 999, border: "1px solid var(--chip-border)", fontSize: 13, fontWeight: 600, color: "var(--color-text-medium)" },
  noticeRow: { display: "flex" },
  board: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, alignItems: "start" },
  columnWrap: { display: "flex", minWidth: 0 },
  column: { flex: 1, display: "flex", flexDirection: "column", gap: 10, minWidth: 0 },
  colHead: { display: "flex", alignItems: "center", gap: 8, paddingInline: 4 },
  colLabel: { fontSize: 13, fontWeight: 700, color: "var(--color-text-deep)", flex: 1 },
  colCount: { ...chip, justifyContent: "center", minWidth: 22, padding: "0 6px", borderRadius: 999, background: "var(--pill-bg)", color: "var(--color-text-tertiary)", fontSize: 12, fontWeight: 600 },
  colHint: { margin: 0, paddingInline: 4, fontSize: 11, color: "var(--color-text-tertiary)", lineHeight: 1.4 },
  empty: { margin: 0, padding: "16px 4px", fontSize: 12, color: "var(--color-text-tertiary)", lineHeight: 1.4 },
  card: { background: "#FFFFFF", borderRadius: 12, padding: 14, display: "flex", flexDirection: "column", gap: 8, transition: "box-shadow 120ms ease" },
  cardTop: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 4 },
  cardName: { fontSize: 13, fontWeight: 700, color: "var(--color-text-deep)", lineHeight: 1.3, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" },
  cardId: { fontSize: 11, fontWeight: 500, color: "var(--color-text-tertiary)" },
  metaRow: { display: "flex", alignItems: "center", gap: 8 },
  laneChip: { ...chip, padding: "0 8px", background: "var(--pill-bg)", color: "var(--color-text-medium)", fontSize: 12 },
  priority: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: "var(--color-text-medium)", fontVariantNumeric: "tabular-nums" },
  priorityDot: { width: 8, height: 8, borderRadius: 999, flexShrink: 0 },
  sent: { display: "inline-flex", alignItems: "center", gap: 4, marginLeft: "auto", fontSize: 12, fontWeight: 600, color: "var(--color-success)" },
  chipRow: { display: "flex", flexWrap: "wrap", gap: 4 },
  signalChip: { ...chip, padding: "0 8px", background: "var(--color-card-emoji-bg)", color: "var(--color-text-tertiary)", fontSize: 11 },
  popout: { display: "flex", flexDirection: "column", gap: 14 },
  sectionLabel: { margin: "0 0 4px", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--color-text-tertiary)" },
  sectionText: { margin: "0 0 6px", fontSize: 13, lineHeight: 1.5, color: "var(--color-text-medium)" },
  metaLine: { margin: 0, fontSize: 12, lineHeight: 1.6, color: "var(--color-text-tertiary)" },
  popoutActions: { display: "flex", alignItems: "center", gap: 16 },
};
