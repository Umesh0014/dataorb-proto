"use client";

import React from "react";
import { ExternalLink, X } from "lucide-react";
import Button from "./Button";
import Card from "./Card";
import StatusBadge from "./StatusBadge";
import TabsRow from "./TabsRow";

const LANE_LABEL = { retain: "Retain", recover: "Recover", convert: "Convert" };

// Generic mocked output for the on-demand Mira brief (generated on commit
// to save tokens — never pre-computed for the whole run).
const MOCK_BRIEF = {
  summary:
    "Mira reviewed this customer's recent interactions: the recruitment signals trace back to one unresolved driver, and engagement has trended down since the last contact.",
  bestPlay:
    "Personal follow-up call referencing the last conversation — resolved similar cases in comparable accounts.",
};

const COLUMNS = ["Customer", "Lane", "Top signals", "Priority", "Flags", "Last contact", "Status"];

/**
 * InterveneRunReview — the review body rendered inside an expanded run
 * accordion: lane segmented filter, keyboard-first triage table (↑↓/jk move,
 * S shortlist, D dismiss, U undo, Esc close — only while this run holds the
 * selection), locked-open sidecar, and a run-scoped shortlist export.
 *
 * @param {{ run: object, recruits: Array<object>, active: boolean,
 *   selectedId: string|null, sidecarOpen: boolean,
 *   onSelect: (recruitId: string) => void, onCloseSidecar: () => void,
 *   onSetStatus: (recruitId: string, status: string) => void,
 *   onExport: (ids: string[]) => void }} props
 */
export default function InterveneRunReview({
  run,
  recruits,
  active,
  selectedId,
  sidecarOpen,
  onSelect,
  onCloseSidecar,
  onSetStatus,
  onExport,
}) {
  const [lane, setLane] = React.useState("all");

  const visible = recruits
    .filter((r) => lane === "all" || r.lane === lane)
    .sort((a, b) => b.priority - a.priority);
  const selected = active ? visible.find((r) => r.id === selectedId) || null : null;
  const shortlistedIds = recruits.filter((r) => r.status === "shortlisted").map((r) => r.id);

  React.useEffect(() => {
    if (!active) return undefined;
    const onKey = (e) => {
      const t = e.target;
      if (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable) return;
      const idx = visible.findIndex((r) => r.id === selectedId);
      const key = e.key.toLowerCase();
      if (e.key === "ArrowDown" || key === "j") {
        e.preventDefault();
        if (visible.length) onSelect(visible[Math.min(idx + 1, visible.length - 1)].id);
      } else if (e.key === "ArrowUp" || key === "k") {
        e.preventDefault();
        if (visible.length) onSelect(visible[Math.max(idx - 1, 0)].id);
      } else if (e.key === "Escape") {
        onCloseSidecar();
      } else if (selected && key === "s") {
        onSetStatus(selected.id, "shortlisted");
      } else if (selected && key === "d") {
        onSetStatus(selected.id, "dismissed");
      } else if (selected && key === "u") {
        onSetStatus(selected.id, "recruited");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, visible, selectedId, selected, onSelect, onCloseSidecar, onSetStatus]);

  if (recruits.length === 0) {
    return (
      <div style={rrStyles.empty}>
        <p style={rrStyles.emptyTitle}>No recruits in this run</p>
        <p style={rrStyles.emptyMeta}>
          {run.counts.recruited} recruited · {run.counts.shortlisted} shortlisted · {run.counts.dismissed} dismissed · {run.counts.exported} exported
        </p>
      </div>
    );
  }

  const laneTabs = [{ id: "all", label: "All", count: recruits.length }].concat(
    ["retain", "recover", "convert"].map((id) => ({
      id,
      label: LANE_LABEL[id],
      count: recruits.filter((r) => r.lane === id).length,
    })),
  );

  return (
    <div style={rrStyles.host}>
      <div style={rrStyles.controlsRow}>
        <TabsRow tabs={laneTabs} activeTab={lane} onTabClick={setLane} />
        <Button variant="primary" size="sm" disabled={shortlistedIds.length === 0} onClick={() => onExport(shortlistedIds)}>
          Export shortlist ({shortlistedIds.length})
        </Button>
      </div>

      <div style={rrStyles.body}>
        <div style={rrStyles.tableArea}>
          <Card padX={0} padY={0} style={{ overflow: "hidden" }}>
            <table style={rrStyles.table}>
              <thead>
                <tr>{COLUMNS.map((h) => <th key={h} style={rrStyles.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {visible.map((r) => (
                  <RecruitRow key={r.id} recruit={r} selected={active && r.id === selectedId} onSelect={() => onSelect(r.id)} />
                ))}
              </tbody>
            </table>
          </Card>
          <p style={rrStyles.hints}>↑↓ navigate · S shortlist · D dismiss · U undo · Esc close</p>
        </div>

        {active && sidecarOpen && selected && (
          <Sidecar recruit={selected} onClose={onCloseSidecar} onSetStatus={onSetStatus} />
        )}
      </div>
    </div>
  );
}

function RecruitRow({ recruit: r, selected, onSelect }) {
  const dismissed = r.status === "dismissed";
  const background = selected
    ? "var(--color-primary-alpha-08)"
    : r.status === "shortlisted"
      ? "var(--color-success-bg)"
      : undefined;
  return (
    <tr
      onClick={onSelect}
      style={{ ...rrStyles.row, background, opacity: dismissed ? 0.5 : 1, cursor: "pointer" }}
    >
      <td style={rrStyles.td}>
        <span style={rrStyles.custName}>{r.name}</span>
        <span style={rrStyles.custId}>{r.customerId}</span>
      </td>
      <td style={rrStyles.td}><span style={rrStyles.laneTag}>{LANE_LABEL[r.lane]}</span></td>
      <td style={rrStyles.td}>
        <span style={rrStyles.chipRow}>
          {r.signals.slice(0, 2).map((s) => <span key={s} style={rrStyles.signalChip} title={s}>{s}</span>)}
          {r.signals.length > 2 && (
            <span style={rrStyles.signalOverflow} title={r.signals.slice(2).join("\n")}>+{r.signals.length - 2}</span>
          )}
        </span>
      </td>
      <td style={rrStyles.td}>
        <span style={rrStyles.priorityCell}>
          <span style={rrStyles.priorityNum}>{r.priority}</span>
          <span style={rrStyles.priorityTrack}>
            <span style={{ ...rrStyles.priorityFill, width: `${r.priority}%` }} />
          </span>
        </span>
      </td>
      <td style={rrStyles.td}>
        <span style={rrStyles.chipRow}>
          {r.flags.length === 0 && <span style={rrStyles.muted}>—</span>}
          {r.flags.map((f) => <span key={f} style={rrStyles.flagChip}>{f}</span>)}
        </span>
      </td>
      <td style={{ ...rrStyles.td, whiteSpace: "nowrap" }}>{r.lastContact}</td>
      <td style={rrStyles.td}>
        {r.status === "shortlisted" ? <StatusBadge tone="success">Shortlisted</StatusBadge>
          : r.status === "exported" ? <StatusBadge tone="info">Exported</StatusBadge>
          : <span style={rrStyles.muted}>{dismissed ? "Dismissed" : "Recruited"}</span>}
      </td>
    </tr>
  );
}

function Sidecar({ recruit: r, onClose, onSetStatus }) {
  // Brief generation mocked locally: per-id "loading" -> generated flag.
  const [generated, setGenerated] = React.useState({});
  const [loadingId, setLoadingId] = React.useState(null);
  const brief = r.brief || (generated[r.id] ? MOCK_BRIEF : null);

  const generate = () => {
    setLoadingId(r.id);
    setTimeout(() => {
      setGenerated((m) => ({ ...m, [r.id]: true }));
      setLoadingId(null);
    }, 900);
  };

  return (
    <Card tone="outline" padX={20} padY={20} style={rrStyles.sidecar}>
      <div style={rrStyles.scHeader}>
        <div>
          <span style={rrStyles.custName}>{r.name}</span>
          <span style={rrStyles.custId}>{r.customerId} · {r.interactionId}</span>
        </div>
        <Button variant="icon" size="sm" onClick={onClose} aria-label="Close sidecar"><X size={16} /></Button>
      </div>

      <div style={rrStyles.scHighlights}>
        <Highlight label="Priority" value={r.priority} />
        <Highlight label="Lane" value={LANE_LABEL[r.lane]} />
        <Highlight label="Last contact" value={`${r.lastContact} · ${r.contacts30d} in 30d`} />
      </div>

      <p style={rrStyles.scLabel}>Why flagged</p>
      <p style={rrStyles.scText}>{r.sidecar.whyFlagged}</p>
      <p style={rrStyles.scLabel}>Last conversation</p>
      <p style={rrStyles.scText}>{r.sidecar.lastConversation}</p>
      <p style={rrStyles.scMetaLine}><strong>Spoke with</strong> {r.sidecar.spokeWith}</p>
      <p style={rrStyles.scMetaLine}><strong>Pain point</strong> {r.sidecar.painPoint}</p>
      <p style={rrStyles.scMetaLine}><strong>Resolution offered</strong> {r.sidecar.resolutionOffered}</p>

      <Card tone="muted" padX={14} padY={12} style={rrStyles.scMira}>
        <p style={rrStyles.scLabel}>Ask Mira</p>
        {brief ? (
          <>
            <p style={rrStyles.scText}>{brief.summary}</p>
            <p style={rrStyles.scMetaLine}><strong>Best play</strong> {brief.bestPlay}</p>
          </>
        ) : (
          <>
            <Button variant="ai" disabled={loadingId === r.id} onClick={generate}>
              {loadingId === r.id ? "Generating…" : "Generate brief & best play"}
            </Button>
            <p style={rrStyles.scHelper}>Generated on commit to save tokens</p>
          </>
        )}
      </Card>

      <div style={rrStyles.scActions}>
        {r.status === "recruited" ? (
          <>
            <Button variant="primary" size="sm" onClick={() => onSetStatus(r.id, "shortlisted")}>Shortlist</Button>
            <Button variant="text" onClick={() => onSetStatus(r.id, "dismissed")}>Dismiss</Button>
          </>
        ) : (
          <Button variant="text" onClick={() => onSetStatus(r.id, "recruited")}>Undo</Button>
        )}
      </div>
      <Button variant="text" uppercase={false} href="#" trailingIcon={<ExternalLink size={12} />} style={rrStyles.scLink}>
        Open full interaction
      </Button>
    </Card>
  );
}

function Highlight({ label, value }) {
  return (
    <div style={rrStyles.hlCell}>
      <span style={rrStyles.hlLabel}>{label}</span>
      <span style={rrStyles.hlValue}>{value}</span>
    </div>
  );
}

const sectionLabel = { margin: "0 0 4px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-tertiary)" };

const rrStyles = {
  host: { display: "flex", flexDirection: "column", gap: 12 },
  controlsRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 },
  body: { display: "flex", alignItems: "flex-start", gap: 24 },
  tableArea: { flex: 1, minWidth: 0 },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: "var(--font-sans)" },
  th: { height: 44, padding: "0 12px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--color-text-tertiary)", borderBottom: "1.5px solid var(--color-divider-card)", whiteSpace: "nowrap" },
  row: { borderBottom: "1px solid var(--table-row-border)", transition: "background 120ms ease" },
  td: { padding: 12, verticalAlign: "middle", color: "var(--color-text-deep)" },
  custName: { display: "block", fontWeight: 600, fontSize: 13, color: "var(--color-text-deep)" },
  custId: { display: "block", fontSize: 11, color: "var(--color-text-tertiary)" },
  laneTag: { display: "inline-flex", padding: "2px 8px", borderRadius: "var(--radius-sm)", background: "var(--color-chip-bg)", color: "var(--color-chip-text)", fontSize: 11, fontWeight: 600 },
  chipRow: { display: "inline-flex", gap: 4, flexWrap: "wrap" },
  signalChip: { padding: "2px 8px", borderRadius: "var(--radius-pill)", background: "var(--pill-bg)", color: "var(--chip-label)", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis" },
  signalOverflow: { fontSize: 11, fontWeight: 600, color: "var(--color-text-tertiary)", alignSelf: "center" },
  priorityCell: { display: "inline-flex", alignItems: "center", gap: 8 },
  priorityNum: { fontWeight: 700, fontVariantNumeric: "tabular-nums", minWidth: 22 },
  priorityTrack: { width: 44, height: 4, borderRadius: "var(--radius-sm)", background: "var(--grey-50)", overflow: "hidden" },
  priorityFill: { display: "block", height: "100%", background: "var(--chart-blue)" },
  flagChip: { padding: "2px 8px", borderRadius: "var(--radius-pill)", background: "var(--color-warning-bg)", color: "var(--color-warning-text)", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" },
  muted: { color: "var(--color-text-tertiary)", fontSize: 12 },
  hints: { marginTop: 8, fontSize: 12, color: "var(--color-text-placeholder)", textAlign: "center" },
  empty: { padding: "32px 24px", textAlign: "center" },
  emptyTitle: { fontSize: 14, fontWeight: 600, color: "var(--color-text-medium)" },
  emptyMeta: { marginTop: 6, fontSize: 12, color: "var(--color-text-tertiary)" },
  sidecar: { width: "var(--page-right-panel-width)", flexShrink: 0 },
  scHeader: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 },
  scHighlights: { display: "flex", gap: 8, paddingBottom: 12, marginBottom: 12, borderBottom: "1px solid var(--color-divider-card)" },
  hlCell: { flex: 1, display: "flex", flexDirection: "column", gap: 2, minWidth: 0 },
  hlLabel: { ...sectionLabel, margin: 0, fontSize: 10 },
  hlValue: { fontSize: 12, fontWeight: 600, color: "var(--color-text-deep)" },
  scLabel: sectionLabel,
  scText: { margin: "0 0 8px", fontSize: 12, lineHeight: 1.5, color: "var(--color-text-medium)" },
  scMetaLine: { margin: "0 0 4px", fontSize: 12, color: "var(--color-text-medium)" },
  scMira: { marginTop: 12 },
  scHelper: { marginTop: 4, fontSize: 11, color: "var(--color-text-placeholder)" },
  scActions: { display: "flex", alignItems: "center", gap: 16, marginTop: 16 },
  scLink: { marginTop: 8, fontSize: 12, color: "var(--color-button-primary-bg)" },
};
