"use client";

import React from "react";
import { ChevronDown, ChevronRight, Megaphone } from "lucide-react";
import Button from "./Button";
import Card from "./Card";
import PageHeader from "./PageHeader";
import StatusBadge from "./StatusBadge";
import InterveneRunReview from "./InterveneRunReview";

const RUN_STATE_TONE = { recruiting: "info", ready: "info", review: "warning", exported: "success", archived: "info" };

/**
 * InterveneTriageQueue — direction v1 of Intervene ("Triage Queue").
 * Campaign-first IA: L0 lists all campaigns with run counts and aggregate
 * review tallies; clicking one drills into L1, the campaign detail, where
 * every run stacks as a manually-expanded accordion (newest first). An
 * expanded run hosts the full review experience (lane filter, keyboard
 * triage table, locked-open sidecar, run-scoped shortlist export) via
 * InterveneRunReview.
 *
 * @param {{ pageName: string, campaigns: Array<object>, runs: Array<object>,
 *   recruits: Array<object>, onSetStatus: (recruitId: string, status: string) => void,
 *   onExport: (ids: string[]) => void, onCreateCampaign: () => void }} props
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
  const [campaignId, setCampaignId] = React.useState(null);
  const [openRunIds, setOpenRunIds] = React.useState({});
  const [selectedRunId, setSelectedRunId] = React.useState(null);
  const [selectedRecruitId, setSelectedRecruitId] = React.useState(null);
  const [sidecarOpen, setSidecarOpen] = React.useState(false);

  React.useEffect(() => {
    document.title = `DataOrb — ${pageName}`;
  }, [pageName]);

  const campaign = campaigns.find((c) => c.id === campaignId) || null;

  const openCampaign = (id) => {
    setCampaignId(id);
    setOpenRunIds({});
    setSelectedRunId(null);
    setSelectedRecruitId(null);
    setSidecarOpen(false);
  };

  const toggleRun = (runId) => {
    setOpenRunIds((m) => ({ ...m, [runId]: !m[runId] }));
    if (openRunIds[runId] && selectedRunId === runId) {
      setSelectedRunId(null);
      setSelectedRecruitId(null);
      setSidecarOpen(false);
    }
  };

  const selectRecruit = (runId, recruitId) => {
    setSelectedRunId(runId);
    setSelectedRecruitId(recruitId);
    setSidecarOpen(true);
  };

  return (
    <div style={tqStyles.host}>
      <PageHeader
        identifier={{ icon: <Megaphone size={18} />, label: pageName || "Intervene" }}
        breadcrumb={campaign
          ? [{ label: "All campaigns", onClick: () => openCampaign(null) }, { label: campaign.name }]
          : undefined}
        subtitle={campaign
          ? "Expand a run to triage its recruited customers, then export the shortlist for outreach."
          : "Pick a campaign to review its recruitment runs."}
        primaryAction={{ label: "New campaign", onClick: onCreateCampaign }}
      />

      {campaign ? (
        <CampaignDetail
          campaign={campaign}
          runs={runs.filter((r) => r.campaignId === campaign.id).sort((a, b) => (a.window.start < b.window.start ? 1 : -1))}
          recruits={recruits}
          openRunIds={openRunIds}
          onToggleRun={toggleRun}
          selectedRunId={selectedRunId}
          selectedRecruitId={selectedRecruitId}
          sidecarOpen={sidecarOpen}
          onSelectRecruit={selectRecruit}
          onCloseSidecar={() => setSidecarOpen(false)}
          onSetStatus={onSetStatus}
          onExport={onExport}
        />
      ) : (
        <div style={tqStyles.campaignList}>
          {campaigns.map((c) => (
            <CampaignRow key={c.id} campaign={c} runs={runs.filter((r) => r.campaignId === c.id)} onOpen={() => openCampaign(c.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function CampaignRow({ campaign: c, runs, onOpen }) {
  const totals = runs.reduce(
    (acc, r) => ({ recruited: acc.recruited + r.counts.recruited, shortlisted: acc.shortlisted + r.counts.shortlisted }),
    { recruited: 0, shortlisted: 0 },
  );
  return (
    <div role="button" tabIndex={0} onClick={onOpen} onKeyDown={(e) => e.key === "Enter" && onOpen()} style={{ cursor: "pointer" }}>
      <Card padX={20} padY={16}>
        <div style={tqStyles.campaignRowInner}>
          <div style={tqStyles.campaignMain}>
            <div style={tqStyles.campaignNameRow}>
              <span style={tqStyles.campaignName}>{c.name}</span>
              <StatusBadge tone={c.status === "active" ? "success" : "info"}>
                {c.status === "active" ? "Active" : "Archived"}
              </StatusBadge>
            </div>
            <div style={tqStyles.pillRow}>
              <CoveragePills coverage={c.coverage} />
            </div>
          </div>
          <div style={tqStyles.campaignStats}>
            <CampaignStat label="Gating signals" value={c.gating.length} />
            <CampaignStat label="Runs" value={runs.length} />
            <CampaignStat label="Recruited" value={totals.recruited} />
            <CampaignStat label="Shortlisted" value={totals.shortlisted} />
          </div>
          <ChevronRight size={16} style={{ color: "var(--color-text-tertiary)", flexShrink: 0 }} />
        </div>
      </Card>
    </div>
  );
}

function CampaignStat({ label, value }) {
  return (
    <div style={tqStyles.statCell}>
      <span style={tqStyles.statValue}>{value}</span>
      <span style={tqStyles.statLabel}>{label}</span>
    </div>
  );
}

function CoveragePills({ coverage }) {
  return [coverage.lineOfBusiness, coverage.queue, coverage.skill].map((v) => (
    <span key={v} style={tqStyles.coveragePill}>{v}</span>
  ));
}

function CampaignDetail({
  campaign,
  runs,
  recruits,
  openRunIds,
  onToggleRun,
  selectedRunId,
  selectedRecruitId,
  sidecarOpen,
  onSelectRecruit,
  onCloseSidecar,
  onSetStatus,
  onExport,
}) {
  return (
    <div style={tqStyles.detailHost}>
      <div style={tqStyles.detailTitleRow}>
        <h2 style={tqStyles.detailTitle}>{campaign.name}</h2>
        <CoveragePills coverage={campaign.coverage} />
      </div>

      {runs.map((run) => {
        const open = !!openRunIds[run.id];
        const runRecruits = recruits.filter((r) => r.runId === run.id);
        return (
          <Card key={run.id} padX={0} padY={0} style={{ overflow: "hidden" }}>
            <div
              role="button"
              tabIndex={0}
              onClick={() => onToggleRun(run.id)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggleRun(run.id); } }}
              aria-expanded={open}
              style={tqStyles.accordionHead}
            >
              <span style={tqStyles.accordionLeft}>
                <span style={tqStyles.accordionChevron}>
                  <ChevronDown size={16} style={{ transform: open ? "none" : "rotate(-90deg)", transition: "transform 120ms ease" }} />
                </span>
                <span style={tqStyles.accordionTitleCol}>
                  <span style={tqStyles.runLabel}>{run.label}</span>
                  <span style={tqStyles.runCutoff}>Recruitment cutoff {run.cutoff}</span>
                </span>
                <StatusBadge tone={RUN_STATE_TONE[run.state] || "info"}>{run.state}</StatusBadge>
              </span>
              <span style={tqStyles.accordionStats}>
                <CampaignStat label="Recruited" value={run.counts.recruited} />
                <CampaignStat label="Shortlisted" value={run.counts.shortlisted} />
                <CampaignStat label="Dismissed" value={run.counts.dismissed} />
                <CampaignStat label="Exported" value={run.counts.exported} />
              </span>
            </div>
            {open && (
              <div style={tqStyles.accordionBody}>
                <InterveneRunReview
                  run={run}
                  recruits={runRecruits}
                  active={selectedRunId === run.id}
                  selectedId={selectedRunId === run.id ? selectedRecruitId : null}
                  sidecarOpen={sidecarOpen}
                  onSelect={(id) => onSelectRecruit(run.id, id)}
                  onCloseSidecar={onCloseSidecar}
                  onSetStatus={onSetStatus}
                  onExport={onExport}
                />
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

const tqStyles = {
  host: { display: "flex", flexDirection: "column", gap: "var(--page-header-gap)" },
  campaignList: { display: "flex", flexDirection: "column", gap: 12 },
  campaignRowInner: { display: "flex", alignItems: "center", gap: 24 },
  campaignMain: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 8 },
  campaignNameRow: { display: "flex", alignItems: "center", gap: 10 },
  campaignName: { fontSize: 15, fontWeight: 700, color: "var(--color-text-deep)" },
  pillRow: { display: "flex", gap: 6, flexWrap: "wrap" },
  coveragePill: { padding: "2px 10px", borderRadius: "var(--radius-pill)", background: "var(--pill-bg)", border: "1px solid var(--chip-border)", fontSize: 12, fontWeight: 600, color: "var(--chip-label)", whiteSpace: "nowrap" },
  campaignStats: { display: "flex", gap: 24, flexShrink: 0 },
  statCell: { display: "flex", flexDirection: "column", gap: 2, alignItems: "flex-end", minWidth: 64 },
  statValue: { fontSize: 16, fontWeight: 700, color: "var(--color-text-deep)", fontVariantNumeric: "tabular-nums" },
  statLabel: { fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-tertiary)" },
  detailHost: { display: "flex", flexDirection: "column", gap: 16 },
  detailTitleRow: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  detailTitle: { fontSize: 17, fontWeight: 700, color: "var(--color-text-deep)", fontFamily: "var(--font-sans)" },
  // div-as-button (same pattern as the campaign rows): the head is a
  // two-line container Button's fixed control frame can't hold.
  accordionHead: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, width: "100%", boxSizing: "border-box", padding: "20px 24px", cursor: "pointer", color: "var(--color-text-deep)" },
  accordionLeft: { display: "flex", alignItems: "center", gap: 14, minWidth: 0 },
  // Chevron sits in its own soft chip so the toggle affordance reads at a
  // glance — same emoji-chip token the PageHeader back chip uses.
  accordionChevron: { width: 28, height: 28, borderRadius: 6, background: "var(--color-card-emoji-bg)", display: "inline-grid", placeItems: "center", color: "var(--color-text-tertiary)", flexShrink: 0 },
  accordionTitleCol: { display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2, minWidth: 0 },
  runLabel: { fontSize: 15, fontWeight: 700, color: "var(--color-text-deep)", whiteSpace: "nowrap" },
  runCutoff: { fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)", whiteSpace: "nowrap" },
  accordionStats: { display: "flex", gap: 28, flexShrink: 0, paddingInlineEnd: 4 },
  accordionBody: { padding: "0 24px 24px", borderTop: "1px solid var(--color-divider-card)", paddingTop: 16 },
};
