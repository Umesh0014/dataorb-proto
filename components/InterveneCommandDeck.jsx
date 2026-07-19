"use client";

import React from "react";
import { ChevronDown, ChevronUp, Hourglass, ListChecks, Megaphone, Upload, X } from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import StatCard from "./StatCard";
import PageHeader from "./PageHeader";
import { campaignById } from "./mocks/intervene";

const DEFAULT_THRESHOLD = 60;
const ACTIVE_RUN_STATES = ["recruiting", "ready", "review"];

/**
 * InterveneCommandDeck — direction v2 of Intervene. Orientation-first
 * cohort activation: the system proposes a recommended shortlist above a
 * priority threshold; the reviewer accepts-with-modifications in bulk and
 * commits the whole selection at once. Nothing is shortlisted without the
 * explicit commit (human-in-the-loop guardrail).
 *
 * @param {{ pageName: string, campaigns: Array<object>, runs: Array<object>,
 *   recruits: Array<object>, onSetStatus: (id: string, status: string) => void,
 *   onExport: (ids: string[]) => void, onCreateCampaign: () => void }} props
 */
export default function InterveneCommandDeck({
  pageName,
  campaigns,
  runs,
  recruits,
  onSetStatus,
  onExport,
  onCreateCampaign,
}) {
  const [runId, setRunId] = React.useState("run-0714");
  const [threshold, setThreshold] = React.useState(DEFAULT_THRESHOLD);
  const [checked, setChecked] = React.useState({});
  const [expandedId, setExpandedId] = React.useState(null);
  const [confirming, setConfirming] = React.useState(false);
  const [localBriefs, setLocalBriefs] = React.useState({});

  const runRecruits = recruits.filter((r) => r.runId === runId);
  const pending = runRecruits.filter((r) => r.status === "recruited");
  const recommended = pending.filter((r) => r.priority >= threshold);
  const belowCut = pending.filter((r) => r.priority < threshold);
  const shortlisted = runRecruits.filter((r) => r.status === "shortlisted");

  // Explicit toggles persist per recruit id; untouched rows default to the
  // initial recommendation cut, so sliding the threshold never wipes edits.
  const isChecked = (r) => checked[r.id] ?? r.priority >= DEFAULT_THRESHOLD;
  const selectedIds = pending.filter(isChecked).map((r) => r.id);
  const unselectedIds = pending.filter((r) => !isChecked(r)).map((r) => r.id);

  const stats = [
    { icon: <Megaphone size={18} />, label: "Active runs", value: runs.filter((r) => ACTIVE_RUN_STATES.includes(r.state)).length },
    { icon: <Hourglass size={18} />, label: "Awaiting review", value: recruits.filter((r) => r.runId === "run-0714" && r.status === "recruited").length },
    { icon: <ListChecks size={18} />, label: "Shortlisted pending export", value: recruits.filter((r) => r.status === "shortlisted").length },
    { icon: <Upload size={18} />, label: "Exported this month", value: recruits.filter((r) => r.status === "exported").length + runs.filter((r) => r.state === "exported" && r.window.end >= "2026-07-01").reduce((n, r) => n + r.counts.exported, 0) },
  ];

  const generateBrief = (id) => {
    setLocalBriefs((m) => ({ ...m, [id]: "loading" }));
    setTimeout(() => {
      const rec = recruits.find((r) => r.id === id);
      setLocalBriefs((m) => ({
        ...m,
        [id]: {
          summary: `${rec.name}: ${rec.sidecar.whyFlagged}. Last conversation surfaced "${rec.sidecar.painPoint.toLowerCase()}" with no committed follow-up.`,
          bestPlay: "Personal outreach call referencing the open issue — resolves the unanswered thread before it hardens into churn.",
        },
      }));
    }, 900);
  };

  const commitShortlist = () => selectedIds.forEach((id) => onSetStatus(id, "shortlisted"));
  const dismissUnselected = () => {
    unselectedIds.forEach((id) => onSetStatus(id, "dismissed"));
    setConfirming(false);
  };

  return (
    <>
      <PageHeader
        identifier={{ icon: <Megaphone size={18} />, label: pageName || "Intervene" }}
        primaryAction={{ label: "New campaign", onClick: onCreateCampaign }}
      />

      <div style={cdStyles.statRow}>
        {stats.map((s) => (
          <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} />
        ))}
      </div>

      <div style={cdStyles.runsRail}>
        {runs.map((run) => {
          const selected = run.id === runId;
          return (
            <div
              key={run.id}
              role="button"
              tabIndex={0}
              aria-pressed={selected}
              onClick={() => setRunId(run.id)}
              onKeyDown={(e) => e.key === "Enter" && setRunId(run.id)}
              className="cc-focusable"
              style={{ ...cdStyles.runCard, ...(selected ? cdStyles.runCardOn : null) }}
            >
              <div style={cdStyles.runTop}>
                <span style={cdStyles.runLabel}>{run.label}</span>
                <span style={cdStyles.runState}>{run.state}</span>
              </div>
              <span style={cdStyles.runPill}>{campaignById(run.campaignId)?.name}</span>
              <span style={cdStyles.runCounts}>
                {run.counts.recruited} recruited · {run.counts.shortlisted} shortlisted
              </span>
            </div>
          );
        })}
      </div>

      {pending.length === 0 && shortlisted.length === 0 ? (
        <Card>
          <p style={cdStyles.emptyText}>
            {runRecruits.length === 0
              ? "No candidates loaded for this run in the prototype — the counts on the run card reflect its recorded outcome."
              : "All candidates in this run have been reviewed."}
          </p>
        </Card>
      ) : (
        <>
          <div style={cdStyles.thresholdRow}>
            <label htmlFor="cd-threshold" style={cdStyles.thresholdLabel}>
              Recommendation threshold: <strong>{threshold}</strong>
            </label>
            <input
              id="cd-threshold"
              type="range"
              min={40}
              max={90}
              step={5}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              style={cdStyles.slider}
            />
          </div>

          <p style={cdStyles.guardrail}>
            Nothing is shortlisted automatically — review and commit the selection.
          </p>

          <RecruitGroup
            title={`Recommended for outreach (${recommended.length})`}
            rows={recommended}
            isChecked={isChecked}
            onToggle={(id, on) => setChecked((m) => ({ ...m, [id]: on }))}
            expandedId={expandedId}
            onExpand={(id) => setExpandedId((cur) => (cur === id ? null : id))}
            localBriefs={localBriefs}
            onGenerate={generateBrief}
          />
          <RecruitGroup
            title={`Below threshold (${belowCut.length})`}
            rows={belowCut}
            isChecked={isChecked}
            onToggle={(id, on) => setChecked((m) => ({ ...m, [id]: on }))}
            expandedId={expandedId}
            onExpand={(id) => setExpandedId((cur) => (cur === id ? null : id))}
            localBriefs={localBriefs}
            onGenerate={generateBrief}
          />

          {pending.length > 0 && (
            <Card padY={16} style={cdStyles.commitBar}>
              <span style={cdStyles.commitCount}>{selectedIds.length} selected</span>
              <div style={cdStyles.commitActions}>
                {confirming ? (
                  <>
                    <span style={cdStyles.confirmText}>
                      Dismiss {unselectedIds.length} unselected candidate{unselectedIds.length === 1 ? "" : "s"}?
                    </span>
                    <Button variant="text" uppercase={false} onClick={dismissUnselected}>Confirm</Button>
                    <Button variant="text" uppercase={false} onClick={() => setConfirming(false)}>Cancel</Button>
                  </>
                ) : (
                  <Button
                    variant="text"
                    uppercase={false}
                    disabled={unselectedIds.length === 0}
                    onClick={() => setConfirming(true)}
                  >
                    Dismiss unselected ({unselectedIds.length})
                  </Button>
                )}
                <Button size="sm" disabled={selectedIds.length === 0} onClick={commitShortlist}>
                  Shortlist selected
                </Button>
              </div>
            </Card>
          )}

          {shortlisted.length > 0 && (
            <Card padY={16} style={cdStyles.shortlistCard}>
              <div style={cdStyles.commitBar}>
                <span style={cdStyles.commitCount}>Shortlisted ({shortlisted.length})</span>
                <Button size="sm" onClick={() => onExport(shortlisted.map((r) => r.id))}>
                  Export CSV
                </Button>
              </div>
              <div style={cdStyles.shortlistRow}>
                {shortlisted.map((r) => (
                  <span key={r.id} style={cdStyles.shortlistChip}>
                    {r.name}
                    <Button variant="icon" size="sm" aria-label={`Remove ${r.name} from shortlist`} onClick={() => onSetStatus(r.id, "recruited")}>
                      <X size={14} />
                    </Button>
                  </span>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </>
  );
}

function RecruitGroup({ title, rows, isChecked, onToggle, expandedId, onExpand, localBriefs, onGenerate }) {
  return (
    <Card padX={20} padY={16}>
      <h3 style={cdStyles.groupTitle}>{title}</h3>
      {rows.length === 0 && <p style={cdStyles.emptyText}>No candidates in this band at the current threshold.</p>}
      {rows.map((r) => {
        const expanded = expandedId === r.id;
        const brief = r.brief || localBriefs[r.id] || null;
        return (
          <div key={r.id} style={cdStyles.rowWrap}>
            <div style={cdStyles.row}>
              <input
                type="checkbox"
                checked={isChecked(r)}
                onChange={(e) => onToggle(r.id, e.target.checked)}
                aria-label={`Select ${r.name}`}
                style={cdStyles.checkbox}
              />
              <div style={cdStyles.rowIdent}>
                <span style={cdStyles.rowName}>{r.name}</span>
                <span style={cdStyles.rowMeta}>{r.customerId}</span>
              </div>
              <span style={cdStyles.laneTag}>{r.lane}</span>
              {r.signals.slice(0, 2).map((s) => (
                <span key={s} style={cdStyles.signalChip}>{s}</span>
              ))}
              {r.flags.map((f) => (
                <span key={f} style={cdStyles.flagChip}>{f}</span>
              ))}
              <span style={cdStyles.priority}>{r.priority}</span>
              <Button variant="icon" size="sm" aria-label={expanded ? `Collapse ${r.name}` : `Expand ${r.name}`} onClick={() => onExpand(r.id)}>
                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </Button>
            </div>
            {expanded && (
              <div style={cdStyles.detail}>
                <div style={cdStyles.detailCol}>
                  <DetailField label="Why flagged" text={r.sidecar.whyFlagged} />
                  <DetailField label="Last conversation" text={r.sidecar.lastConversation} />
                  <DetailField label="Pain point" text={r.sidecar.painPoint} />
                </div>
                <Card tone="muted" padX={16} padY={12} style={cdStyles.detailCol}>
                  <span style={cdStyles.detailLabel}>Ask Mira brief</span>
                  {brief === "loading" ? (
                    <p style={cdStyles.detailText}>Generating brief…</p>
                  ) : brief ? (
                    <>
                      <p style={cdStyles.detailText}>{brief.summary}</p>
                      <p style={cdStyles.detailText}><strong>Best play:</strong> {brief.bestPlay}</p>
                    </>
                  ) : (
                    <>
                      <Button variant="ai" onClick={() => onGenerate(r.id)}>Generate brief</Button>
                      <span style={cdStyles.helper}>Generated on commit to save tokens</span>
                    </>
                  )}
                </Card>
              </div>
            )}
          </div>
        );
      })}
    </Card>
  );
}

function DetailField({ label, text }) {
  return (
    <div>
      <span style={cdStyles.detailLabel}>{label}</span>
      <p style={cdStyles.detailText}>{text}</p>
    </div>
  );
}

const chipBase = { fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: "var(--radius-pill)", whiteSpace: "nowrap" };

const cdStyles = {
  statRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 },
  runsRail: { display: "flex", gap: 12, overflowX: "auto" },
  runCard: {
    flex: "1 0 200px", background: "var(--surface-white)", border: "1px solid var(--color-divider-card)",
    borderRadius: "var(--radius-md)", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 6, cursor: "pointer",
  },
  runCardOn: { border: "1px solid var(--color-button-primary-bg)", background: "var(--color-primary-alpha-04)" },
  runTop: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 },
  runLabel: { fontSize: 13, fontWeight: 700, color: "var(--color-text-deep)" },
  runState: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-tertiary)" },
  runPill: { ...chipBase, alignSelf: "flex-start", background: "var(--pill-bg)", color: "var(--chip-label)" },
  runCounts: { fontSize: 12, color: "var(--color-text-tertiary)" },
  thresholdRow: { display: "flex", alignItems: "center", gap: 16 },
  thresholdLabel: { fontSize: 13, color: "var(--color-text-medium)" },
  slider: { width: 220, accentColor: "var(--color-button-primary-bg)" },
  guardrail: { fontSize: 12, color: "var(--color-text-tertiary)", margin: 0 },
  groupTitle: { fontSize: 14, fontWeight: 700, color: "var(--color-text-deep)", marginBottom: 8 },
  emptyText: { fontSize: 13, color: "var(--color-text-tertiary)", margin: 0 },
  rowWrap: { borderTop: "1px solid var(--table-row-border)" },
  row: { display: "flex", alignItems: "center", gap: 10, padding: "10px 0" },
  checkbox: { width: 16, height: 16, accentColor: "var(--color-button-primary-bg)", flexShrink: 0 },
  rowIdent: { display: "flex", flexDirection: "column", minWidth: 180, flex: 1 },
  rowName: { fontSize: 13, fontWeight: 700, color: "var(--color-text-deep)" },
  rowMeta: { fontSize: 11, color: "var(--color-text-tertiary)" },
  laneTag: { ...chipBase, background: "var(--color-primary-alpha-08)", color: "var(--color-primary-600)", textTransform: "capitalize" },
  signalChip: { ...chipBase, background: "var(--color-chip-bg)", color: "var(--color-chip-text)", fontWeight: 500 },
  flagChip: { ...chipBase, background: "var(--color-warning-bg)", color: "var(--color-warning-text)" },
  priority: { fontSize: 14, fontWeight: 700, color: "var(--color-text-deep)", width: 32, textAlign: "right" },
  detail: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, padding: "4px 0 14px 26px" },
  detailCol: { display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" },
  detailLabel: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-tertiary)" },
  detailText: { fontSize: 12, lineHeight: 1.5, color: "var(--color-text-medium)", margin: 0 },
  helper: { fontSize: 11, color: "var(--color-text-tertiary)" },
  commitBar: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 },
  commitCount: { fontSize: 13, fontWeight: 700, color: "var(--color-text-deep)" },
  commitActions: { display: "flex", alignItems: "center", gap: 16 },
  confirmText: { fontSize: 13, color: "var(--color-error-dark)" },
  shortlistCard: { display: "flex", flexDirection: "column", gap: 12 },
  shortlistRow: { display: "flex", flexWrap: "wrap", gap: 8 },
  shortlistChip: {
    ...chipBase, display: "inline-flex", alignItems: "center", gap: 2,
    padding: "2px 4px 2px 10px", background: "var(--pill-bg)", color: "var(--chip-value)", fontSize: 12,
  },
};
