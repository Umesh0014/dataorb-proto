"use client";

import React from "react";
import { ChevronDown, ExternalLink, X } from "lucide-react";
import Button from "./Button";
import Card from "./Card";
import StatusBadge from "./StatusBadge";
import TabsRow from "./TabsRow";

const LANE_LABEL = { retain: "Retain", recover: "Recover", convert: "Convert" };

// Generic mocked output for the on-demand Mira brief (generated on commit
// to save tokens — never pre-computed for the whole run).
const MOCK_BRIEF = {
  summary:
    "Mira reviewed the recent interactions for this customer: the pattern points to an unresolved driver behind the recruitment signals, with engagement trending down since the last contact.",
  bestPlay:
    "Personal follow-up call referencing the last conversation — resolved similar cases in comparable accounts.",
};

/**
 * InterveneTriageQueue — direction v1 of Intervene ("Triage Queue").
 * A run is a dated batch work-queue: the team lead triages recruited
 * customers one by one, keyboard-first (↑↓/jk move, S shortlist,
 * D dismiss, U undo, Esc close), with a sidecar that locks open on
 * first row selection and follows the selection thereafter.
 *
 * @param {{
 *   pageName: string,
 *   campaigns: Array<object>,
 *   runs: Array<object>,
 *   recruits: Array<object>,
 *   onSetStatus: (recruitId: string, status: string) => void,
 *   onExport: (ids: string[]) => void,
 *   onCreateCampaign: () => void,
 * }} props
 */
export default function InterveneTriageQueue({
  pageName,
  campaigns,
  runs,
  recruits,
  onSetStatus,
  onExport,
  onCreateCampaign,
}) {
  const [runId, setRunId] = React.useState("run-0714");
  const [runMenuOpen, setRunMenuOpen] = React.useState(false);
  const [lane, setLane] = React.useState("all");
  const [selectedId, setSelectedId] = React.useState(null);
  const [sidecarOpen, setSidecarOpen] = React.useState(false);

  React.useEffect(() => {
    document.title = `DataOrb — ${pageName}`;
  }, [pageName]);

  const run = runs.find((r) => r.id === runId) || runs[0];
  const campaign = campaigns.find((c) => c.id === run.campaignId);
  const runRecruits = recruits.filter((r) => r.runId === runId);
  const visible = runRecruits
    .filter((r) => lane === "all" || r.lane === lane)
    .sort((a, b) => b.priority - a.priority);
  const selected = visible.find((r) => r.id === selectedId) || null;
  const shortlistedIds = runRecruits
    .filter((r) => r.status === "shortlisted")
    .map((r) => r.id);

  const selectRow = (id) => {
    setSelectedId(id);
    setSidecarOpen(true);
  };

  React.useEffect(() => {
    const onKey = (e) => {
      const t = e.target;
      if (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable) return;
      const idx = visible.findIndex((r) => r.id === selectedId);
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        if (visible.length) selectRow(visible[Math.min(idx + 1, visible.length - 1)].id);
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        if (visible.length) selectRow(visible[Math.max(idx - 1, 0)].id);
      } else if (e.key === "Escape") {
        setSidecarOpen(false);
      } else if (selected && (e.key === "s" || e.key === "S")) {
        onSetStatus(selected.id, "shortlisted");
      } else if (selected && (e.key === "d" || e.key === "D")) {
        onSetStatus(selected.id, "dismissed");
      } else if (selected && (e.key === "u" || e.key === "U")) {
        onSetStatus(selected.id, "recruited");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, selectedId, selected, onSetStatus]);

  const laneTabs = [
    { id: "all", label: "All", count: runRecruits.length },
    { id: "retain", label: "Retain", count: runRecruits.filter((r) => r.lane === "retain").length },
    { id: "recover", label: "Recover", count: runRecruits.filter((r) => r.lane === "recover").length },
    { id: "convert", label: "Convert", count: runRecruits.filter((r) => r.lane === "convert").length },
  ];

  return (
    <div style={tqStyles.host}>
      <div style={tqStyles.headerRow}>
        <div>
          <h1 style={tqStyles.title}>Intervene</h1>
          <p style={tqStyles.subtitle}>
            Triage this run&apos;s recruited customers, then export the shortlist for outreach.
          </p>
        </div>
        <div style={tqStyles.headerActions}>
          <Button variant="text" onClick={onCreateCampaign}>New campaign</Button>
          <Button
            variant="primary"
            size="sm"
            disabled={shortlistedIds.length === 0}
            onClick={() => onExport(shortlistedIds)}
          >
            Export shortlist ({shortlistedIds.length})
          </Button>
        </div>
      </div>

      <div style={tqStyles.runRow}>
        <Button
          variant="text"
          uppercase={false}
          onClick={() => setRunMenuOpen((o) => !o)}
          trailingIcon={<ChevronDown size={14} />}
          style={tqStyles.runTrigger}
          aria-expanded={runMenuOpen}
        >
          Run · {run.label}
        </Button>
        {campaign && <span style={tqStyles.campaignPill}>{campaign.name}</span>}
        {runMenuOpen && (
          <Card tone="outline" padX={8} padY={8} style={tqStyles.runMenu}>
            {runs.map((r) => (
              <Button
                key={r.id}
                variant="text"
                uppercase={false}
                onClick={() => {
                  setRunId(r.id);
                  setRunMenuOpen(false);
                  setSelectedId(null);
                  setSidecarOpen(false);
                  setLane("all");
                }}
                style={{
                  ...tqStyles.runMenuItem,
                  fontWeight: r.id === runId ? 700 : 500,
                }}
              >
                {r.label} · {r.state}
              </Button>
            ))}
          </Card>
        )}
      </div>

      <TabsRow tabs={laneTabs} activeTab={lane} onTabClick={setLane} />

      <div style={tqStyles.body}>
        <div style={tqStyles.tableArea}>
          <Card padX={0} padY={0} style={{ overflow: "hidden" }}>
            {visible.length === 0 ? (
              <div style={tqStyles.empty}>
                <p style={tqStyles.emptyTitle}>This run&apos;s review is complete</p>
                <p style={tqStyles.emptyMeta}>
                  {run.counts.recruited} recruited · {run.counts.shortlisted} shortlisted ·{" "}
                  {run.counts.dismissed} dismissed · {run.counts.exported} exported
                </p>
              </div>
            ) : (
              <table style={tqStyles.table}>
                <thead>
                  <tr>
                    {["Customer", "Lane", "Top signals", "Priority", "Flags", "Last contact", "Status"].map((h) => (
                      <th key={h} style={tqStyles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visible.map((r) => (
                    <RecruitRow
                      key={r.id}
                      recruit={r}
                      selected={r.id === selectedId}
                      onSelect={() => selectRow(r.id)}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </Card>
          <p style={tqStyles.hints}>↑↓ navigate · S shortlist · D dismiss · U undo · Esc close</p>
        </div>

        {sidecarOpen && selected && (
          <Sidecar
            recruit={selected}
            onClose={() => setSidecarOpen(false)}
            onSetStatus={onSetStatus}
          />
        )}
      </div>
    </div>
  );
}

function RecruitRow({ recruit: r, selected, onSelect }) {
  const dismissed = r.status === "dismissed";
  const signals = r.signals.slice(0, 2);
  return (
    <tr
      onClick={onSelect}
      style={{
        ...tqStyles.row,
        background: selected ? "var(--color-primary-alpha-08)" : undefined,
        opacity: dismissed ? 0.5 : 1,
        cursor: "pointer",
      }}
    >
      <td style={tqStyles.td}>
        <span style={tqStyles.custName}>{r.name}</span>
        <span style={tqStyles.custId}>{r.customerId}</span>
      </td>
      <td style={tqStyles.td}>
        <span style={tqStyles.laneTag}>{LANE_LABEL[r.lane]}</span>
      </td>
      <td style={tqStyles.td}>
        <span style={tqStyles.chipRow}>
          {signals.map((s) => (
            <span key={s} style={tqStyles.signalChip} title={s}>{s}</span>
          ))}
          {r.signals.length > 2 && (
            <span style={tqStyles.signalOverflow} title={r.signals.slice(2).join("\n")}>
              +{r.signals.length - 2}
            </span>
          )}
        </span>
      </td>
      <td style={tqStyles.td}>
        <span style={tqStyles.priorityCell}>
          <span style={tqStyles.priorityNum}>{r.priority}</span>
          <span style={tqStyles.priorityTrack}>
            <span style={{ ...tqStyles.priorityFill, width: `${r.priority}%` }} />
          </span>
        </span>
      </td>
      <td style={tqStyles.td}>
        <span style={tqStyles.chipRow}>
          {r.flags.length === 0 && <span style={tqStyles.muted}>—</span>}
          {r.flags.map((f) => (
            <span key={f} style={tqStyles.flagChip}>{f}</span>
          ))}
        </span>
      </td>
      <td style={{ ...tqStyles.td, whiteSpace: "nowrap" }}>{r.lastContact}</td>
      <td style={tqStyles.td}>
        {r.status === "shortlisted" && <StatusBadge tone="success">Shortlisted</StatusBadge>}
        {r.status === "exported" && <StatusBadge tone="info">Exported</StatusBadge>}
        {r.status === "dismissed" && <span style={tqStyles.muted}>Dismissed</span>}
        {r.status === "recruited" && <span style={tqStyles.muted}>Recruited</span>}
      </td>
    </tr>
  );
}

function Sidecar({ recruit: r, onClose, onSetStatus }) {
  // Brief generation is mocked locally: "loading" -> generated flag per id.
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
    <Card tone="outline" padX={20} padY={20} style={tqStyles.sidecar}>
      <div style={tqStyles.scHeader}>
        <div>
          <span style={tqStyles.custName}>{r.name}</span>
          <span style={tqStyles.custId}>{r.customerId} · {r.interactionId}</span>
        </div>
        <Button variant="icon" size="sm" onClick={onClose} aria-label="Close sidecar">
          <X size={16} />
        </Button>
      </div>

      <div style={tqStyles.scHighlights}>
        <Highlight label="Priority" value={r.priority} />
        <Highlight label="Lane" value={LANE_LABEL[r.lane]} />
        <Highlight label="Last contact" value={`${r.lastContact} · ${r.contacts30d} in 30d`} />
      </div>

      <p style={tqStyles.scLabel}>Why flagged</p>
      <p style={tqStyles.scText}>{r.sidecar.whyFlagged}</p>

      <p style={tqStyles.scLabel}>Last conversation</p>
      <p style={tqStyles.scText}>{r.sidecar.lastConversation}</p>
      <p style={tqStyles.scMetaLine}><strong>Spoke with</strong> {r.sidecar.spokeWith}</p>
      <p style={tqStyles.scMetaLine}><strong>Pain point</strong> {r.sidecar.painPoint}</p>
      <p style={tqStyles.scMetaLine}><strong>Resolution offered</strong> {r.sidecar.resolutionOffered}</p>

      <Card tone="muted" padX={14} padY={12} style={tqStyles.scMira}>
        <p style={tqStyles.scLabel}>Ask Mira</p>
        {brief ? (
          <>
            <p style={tqStyles.scText}>{brief.summary}</p>
            <p style={tqStyles.scMetaLine}><strong>Best play</strong> {brief.bestPlay}</p>
          </>
        ) : (
          <>
            <Button variant="ai" disabled={loadingId === r.id} onClick={generate}>
              {loadingId === r.id ? "Generating…" : "Generate brief & best play"}
            </Button>
            <p style={tqStyles.scHelper}>Generated on commit to save tokens</p>
          </>
        )}
      </Card>

      <div style={tqStyles.scActions}>
        {r.status === "recruited" ? (
          <>
            <Button variant="primary" size="sm" onClick={() => onSetStatus(r.id, "shortlisted")}>
              Shortlist
            </Button>
            <Button variant="text" onClick={() => onSetStatus(r.id, "dismissed")}>Dismiss</Button>
          </>
        ) : (
          <Button variant="text" onClick={() => onSetStatus(r.id, "recruited")}>Undo</Button>
        )}
      </div>
      <Button
        variant="text"
        uppercase={false}
        href="#"
        trailingIcon={<ExternalLink size={12} />}
        style={tqStyles.scLink}
      >
        Open full interaction
      </Button>
    </Card>
  );
}

function Highlight({ label, value }) {
  return (
    <div style={tqStyles.hlCell}>
      <span style={tqStyles.hlLabel}>{label}</span>
      <span style={tqStyles.hlValue}>{value}</span>
    </div>
  );
}

const tqStyles = {
  host: { display: "flex", flexDirection: "column", gap: "var(--page-header-gap)" },
  headerRow: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 },
  title: { fontSize: 22, fontWeight: 700, color: "var(--color-text-deep)", fontFamily: "var(--font-sans)" },
  subtitle: { marginTop: 4, fontSize: 13, color: "var(--color-text-tertiary)" },
  headerActions: { display: "flex", alignItems: "center", gap: 16, flexShrink: 0 },
  runRow: { position: "relative", display: "flex", alignItems: "center", gap: 10 },
  runTrigger: { fontWeight: 700, color: "var(--color-text-deep)", fontSize: 14 },
  campaignPill: {
    padding: "2px 10px",
    borderRadius: "var(--radius-pill)",
    background: "var(--pill-bg)",
    border: "1px solid var(--chip-border)",
    fontSize: 12,
    fontWeight: 600,
    color: "var(--chip-label)",
    whiteSpace: "nowrap",
  },
  runMenu: {
    position: "absolute",
    top: "calc(100% + 4px)",
    left: 0,
    zIndex: 20,
    minWidth: 220,
    display: "flex",
    flexDirection: "column",
    boxShadow: "var(--shadow-4)",
  },
  runMenuItem: { justifyContent: "flex-start", paddingInline: 10, width: "100%" },
  body: { display: "flex", alignItems: "flex-start", gap: 24 },
  tableArea: { flex: 1, minWidth: 0 },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: "var(--font-sans)" },
  th: {
    height: 44,
    padding: "0 12px",
    textAlign: "left",
    fontSize: 12,
    fontWeight: 600,
    color: "var(--color-text-tertiary)",
    borderBottom: "1.5px solid var(--color-divider-card)",
    whiteSpace: "nowrap",
  },
  row: { borderBottom: "1px solid var(--table-row-border)", transition: "background 120ms ease" },
  td: { padding: "12px", verticalAlign: "middle", color: "var(--color-text-deep)" },
  custName: { display: "block", fontWeight: 600, fontSize: 13, color: "var(--color-text-deep)" },
  custId: { display: "block", fontSize: 11, color: "var(--color-text-tertiary)" },
  laneTag: {
    display: "inline-flex",
    padding: "2px 8px",
    borderRadius: "var(--radius-sm)",
    background: "var(--color-chip-bg)",
    color: "var(--color-chip-text)",
    fontSize: 11,
    fontWeight: 600,
  },
  chipRow: { display: "inline-flex", gap: 4, flexWrap: "wrap" },
  signalChip: {
    padding: "2px 8px",
    borderRadius: "var(--radius-pill)",
    background: "var(--pill-bg)",
    color: "var(--chip-label)",
    fontSize: 11,
    fontWeight: 600,
    whiteSpace: "nowrap",
    maxWidth: 130,
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  signalOverflow: { fontSize: 11, fontWeight: 600, color: "var(--color-text-tertiary)", alignSelf: "center" },
  priorityCell: { display: "inline-flex", alignItems: "center", gap: 8 },
  priorityNum: { fontWeight: 700, fontVariantNumeric: "tabular-nums", minWidth: 22 },
  priorityTrack: {
    width: 44,
    height: 4,
    borderRadius: "var(--radius-sm)",
    background: "var(--grey-50)",
    overflow: "hidden",
  },
  priorityFill: { display: "block", height: "100%", background: "var(--chart-blue)" },
  flagChip: {
    padding: "2px 8px",
    borderRadius: "var(--radius-pill)",
    background: "var(--color-warning-bg)",
    color: "var(--color-warning-text)",
    fontSize: 11,
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  muted: { color: "var(--color-text-tertiary)", fontSize: 12 },
  hints: { marginTop: 8, fontSize: 12, color: "var(--color-text-placeholder)", textAlign: "center" },
  empty: { padding: "48px 24px", textAlign: "center" },
  emptyTitle: { fontSize: 14, fontWeight: 600, color: "var(--color-text-medium)" },
  emptyMeta: { marginTop: 6, fontSize: 12, color: "var(--color-text-tertiary)" },
  sidecar: { width: "var(--page-right-panel-width)", flexShrink: 0 },
  scHeader: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 },
  scHighlights: {
    display: "flex",
    gap: 8,
    paddingBottom: 12,
    marginBottom: 12,
    borderBottom: "1px solid var(--color-divider-card)",
  },
  hlCell: { flex: 1, display: "flex", flexDirection: "column", gap: 2, minWidth: 0 },
  hlLabel: { fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-tertiary)" },
  hlValue: { fontSize: 12, fontWeight: 600, color: "var(--color-text-deep)" },
  scLabel: {
    margin: "0 0 4px",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "var(--color-text-tertiary)",
  },
  scText: { margin: "0 0 8px", fontSize: 12, lineHeight: 1.5, color: "var(--color-text-medium)" },
  scMetaLine: { margin: "0 0 4px", fontSize: 12, color: "var(--color-text-medium)" },
  scMira: { marginTop: 12 },
  scHelper: { marginTop: 4, fontSize: 11, color: "var(--color-text-placeholder)" },
  scActions: { display: "flex", alignItems: "center", gap: 16, marginTop: 16 },
  scLink: { marginTop: 8, fontSize: 12, color: "var(--color-button-primary-bg)" },
};
