"use client";

import React from "react";
import {
  Plus, Search, ArrowUpDown, MoreVertical, ChevronLeft, ChevronRight,
  Info, ExternalLink, ShieldCheck, Sparkles, Clock, FileClock,
  PartyPopper, Trash2, CheckCircle2, Circle,
} from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import TabsRow from "./TabsRow";
import PageHeader from "./PageHeader";
import InlineStatusAffordance from "./InlineStatusAffordance";
import Banner, { AlertCircleFilled } from "./Banner";
import CircularProgress from "./CircularProgress";
import SelectionAccentBar from "./SelectionAccentBar";
import Toast from "./Toast";
import { MissionsIcon } from "./SideNav/icons";
import { DEMO_MISSIONS, deriveGlobalKpis, DRAFT_SETUP_STEPS } from "./mocks/missionsSeedData";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const AVATAR_PALETTE = [
  "#E3867F", "#F0B775", "#8DC99E", "#7CB0D6",
  "#C59BD8", "#6DC6B9", "#E88FA2", "#A7AAD1",
];

function avatarColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length];
}

function getStateTone(state) {
  switch (state) {
    case "ends_today":    return { accent: "var(--color-error)",   progress: "var(--color-error)" };
    case "ending_soon":   return { accent: "var(--color-warning)", progress: "var(--color-warning)" };
    case "on_track":      return { accent: "var(--color-success)", progress: "var(--color-success)" };
    case "just_started":
    default:              return { accent: "#245BFF",              progress: "#245BFF" };
  }
}

function getTimeAffordanceTone(daysLeft) {
  if (daysLeft <= 0)  return "danger";
  if (daysLeft <= 3)  return "warning";
  if (daysLeft <= 14) return "medium";
  return "tertiary";
}

function getTargetMetStyle(pct) {
  if (pct >= 75) return { color: "var(--color-success)", background: "var(--color-success-bg)" };
  if (pct >= 40) return { color: "var(--color-warning)", background: "var(--color-warning-bg)" };
  return { color: "var(--color-error)", background: "var(--color-error-bg)" };
}

function getQAStyle(score) {
  if (score >= 90) return { color: "var(--color-success)" };
  if (score >= 70) return { color: "var(--color-warning)" };
  return { color: "var(--color-error)" };
}

function fmtDateShort(iso) {
  const [, m, d] = iso.split("-").map(Number);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${d} ${months[m - 1]}`;
}

function fmtDateRange(start, end) {
  const ey = end.split("-")[0];
  return `${fmtDateShort(start)} - ${fmtDateShort(end)} ${ey}`;
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function MissionsPage({ onCreateMission, initialMissionId }) {
  const hasMissions = DEMO_MISSIONS.length > 0;
  const [selectedId, setSelectedId] = React.useState(initialMissionId || DEMO_MISSIONS[0]?.id);
  const [statusFilter, setStatusFilter] = React.useState("Active");
  const [toastVisible, setToastVisible] = React.useState(true);
  const globalKpis = React.useMemo(() => deriveGlobalKpis(DEMO_MISSIONS), []);

  // TODO: wire to publish handoff
  React.useEffect(() => {
    if (!toastVisible) return;
    const t = setTimeout(() => setToastVisible(false), 5000);
    return () => clearTimeout(t);
  }, [toastVisible]);

  const openCreateMission = () => {
    if (onCreateMission) { onCreateMission(); return; }
    console.log("open create mission");
  };

  if (!hasMissions) {
    return (
      <div style={msStyles.shell}>
        <div style={msStyles.narrowContent}>
          <PageHeader
            identifier={{ icon: <MissionsIcon size={18} color="#245BFF" />, label: "Missions", withDropdown: true, onClick: () => {} }}
            primaryAction={{ label: "Mission", icon: <Plus size={16} />, onClick: openCreateMission }}
            search={{ value: "", onChange: () => {}, placeholder: "Search" }}
            toolbar={[
              { id: "sort", icon: <ArrowUpDown size={18} />, label: "Sort", onClick: () => {} },
            ]}
          />
          <MissionsEmptyState onCreate={openCreateMission} />
        </div>
      </div>
    );
  }

  let filtered;
  if (statusFilter === "Active") {
    filtered = DEMO_MISSIONS.filter((m) => m.state !== "draft" && m.state !== "completed");
  } else if (statusFilter === "Draft") {
    filtered = DEMO_MISSIONS.filter((m) => m.state === "draft");
  } else {
    filtered = DEMO_MISSIONS.filter((m) => m.state === "completed");
  }
  const selected = filtered.find((m) => m.id === selectedId) || filtered[0] || DEMO_MISSIONS[0];

  return (
    <div style={msStyles.shell}>
      <div style={msStyles.wideContent}>
        <PageHeader
          identifier={{ icon: <MissionsIcon size={18} color="#245BFF" />, label: "Missions", withDropdown: true, onClick: () => {} }}
          primaryAction={{ label: "Missions", icon: <Plus size={16} />, onClick: openCreateMission }}
          filters={[
            { id: "team", label: "Team", value: "All", onClick: () => console.log("team filter") },
            { id: "created", label: "Created Date", value: "Last 7 days", onClick: () => console.log("created filter") },
            {
              id: "status",
              label: "Status",
              value: statusFilter,
              options: [
                { label: "Active",    value: "Active" },
                { label: "Draft",     value: "Draft" },
                { label: "Completed", value: "Completed" },
              ],
              onSelect: (v) => setStatusFilter(v),
            },
          ]}
          toolbar={[
            { id: "search", icon: <Search size={18} />, label: "Search", onClick: () => console.log("search") },
            { id: "sort", icon: <ArrowUpDown size={18} />, label: "Sort", onClick: () => console.log("sort") },
          ]}
        />

        <div style={msStyles.kpiCard}>
          {globalKpis.map((k, i) => {
            const tileStyle = {
              ...msStyles.kpiTile,
              paddingLeft:  i === 0                  ? 0 : 24,
              paddingRight: i === globalKpis.length - 1 ? 0 : 24,
            };
            return (
              <React.Fragment key={k.label}>
                {i > 0 && <div style={msStyles.kpiDivider} aria-hidden="true" />}
                <div style={tileStyle}>
                  <div style={msStyles.kpiLabel}>{k.label}</div>
                  <div style={msStyles.kpiValue}>{k.value}</div>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        <div style={msStyles.split}>
          <div style={msStyles.leftCol}>
            {filtered.length === 0 ? (
              <Card style={{ padding: 32, textAlign: "center" }}>
                <p style={{ color: "var(--color-text-tertiary)", fontSize: 14 }}>
                  No missions match the current filter.
                </p>
              </Card>
            ) : (
              filtered.map((m) => {
                const cardProps = {
                  mission: m,
                  selected: m.id === selectedId,
                  onClick: () => setSelectedId(m.id),
                };
                if (m.state === "draft")     return <DraftMissionCard     key={m.id} {...cardProps} />;
                if (m.state === "completed") return <CompletedMissionCard key={m.id} {...cardProps} />;
                return                              <MissionCard          key={m.id} {...cardProps} />;
              })
            )}
          </div>

          <div style={msStyles.rightCol}>
            {selected.state === "draft" ? (
              <DraftMissionDetail mission={selected} />
            ) : selected.state === "completed" ? (
              <CompletedMissionDetail mission={selected} />
            ) : (
              <MissionDetail mission={selected} />
            )}
          </div>
        </div>
      </div>

      {toastVisible && (
        <Toast
          message={`The mission '${DEMO_MISSIONS[0].name}' has been successfully Published`}
          onDismiss={() => setToastVisible(false)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Selection accent bar — top-edge gradient on the currently selected card.
// Library primitive imported from ./SelectionAccentBar.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Mission Card (left column)
// ---------------------------------------------------------------------------

function MissionCard({ mission, selected, onClick }) {
  const tone = getStateTone(mission.state);
  const timeTone = getTimeAffordanceTone(mission.daysLeft);
  const timeLabel = mission.daysLeft <= 0 ? "Ends Today" : `${mission.daysLeft} days left`;
  const firstTag = mission.tags[0].length > 15 ? mission.tags[0].slice(0, 15) + "…" : mission.tags[0];
  const showStripedTail = mission.state === "ends_today";
  const totalPct = Math.max(mission.progress, 2);
  const stripedPct = showStripedTail ? 15 : 0;
  const solidPct = Math.max(0, totalPct - stripedPct);

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...mcStyles.card,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {selected && <SelectionAccentBar />}
      <h3 style={mcStyles.title}>{mission.name}</h3>
      <p style={mcStyles.desc}>{mission.description}</p>

      <div style={mcStyles.divider} />

      <div style={mcStyles.chips}>
        <span style={mcStyles.countBadge}>{mission.agentCount}</span>
        <span style={mcStyles.countLabel}>Agents</span>
        <span style={mcStyles.dot}>·</span>
        <span style={mcStyles.tagChip}>{firstTag}</span>
        {mission.tags.length > 1 && (
          <span style={mcStyles.overflowChip}>+{mission.tags.length - 1}</span>
        )}
      </div>

      <div style={mcStyles.progressTrack}>
        <div
          style={{
            height: "100%",
            width: `${solidPct}%`,
            background: tone.progress,
            borderTopLeftRadius: 2,
            borderBottomLeftRadius: 2,
            borderTopRightRadius: stripedPct > 0 ? 0 : 2,
            borderBottomRightRadius: stripedPct > 0 ? 0 : 2,
          }}
        />
        {stripedPct > 0 && (
          <div
            style={{
              height: "100%",
              width: `${stripedPct}%`,
              background: `repeating-linear-gradient(135deg, ${tone.progress} 0 5px, rgba(255,255,255,0.55) 5px 9px)`,
              borderTopRightRadius: 2,
              borderBottomRightRadius: 2,
            }}
          />
        )}
      </div>

      <div style={mcStyles.footer}>
        <span style={mcStyles.dateRange}>{fmtDateRange(mission.startDate, mission.endDate)}</span>
        <InlineStatusAffordance tone={timeTone} icon={<Clock size={12} />}>
          {timeLabel}
        </InlineStatusAffordance>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Completed Mission Card (left column — completed only)
// Same composition as MissionCard; 100% solid green progress bar (no
// striped tail); bottom-right "🎉 Completed" inline affordance replaces
// the time-remaining chip.
// ---------------------------------------------------------------------------

function CompletedMissionCard({ mission, selected, onClick }) {
  const firstTag = mission.tags[0].length > 15 ? mission.tags[0].slice(0, 15) + "…" : mission.tags[0];

  return (
    <button
      type="button"
      onClick={onClick}
      style={{ ...mcStyles.card, position: "relative", overflow: "hidden" }}
    >
      {selected && <SelectionAccentBar />}
      <h3 style={mcStyles.title}>{mission.name}</h3>
      <p style={mcStyles.desc}>{mission.description}</p>

      <div style={mcStyles.divider} />

      <div style={mcStyles.chips}>
        <span style={mcStyles.countBadge}>{mission.agentCount}</span>
        <span style={mcStyles.countLabel}>Agents</span>
        <span style={mcStyles.dot}>·</span>
        <span style={mcStyles.tagChip}>{firstTag}</span>
        {mission.tags.length > 1 && (
          <span style={mcStyles.overflowChip}>+{mission.tags.length - 1}</span>
        )}
      </div>

      <div style={mcStyles.progressTrack}>
        <div
          style={{
            height: "100%",
            width: "100%",
            background: "var(--color-success)",
            borderRadius: 2,
          }}
        />
      </div>

      <div style={mcStyles.footer}>
        <span style={mcStyles.dateRange}>{fmtDateRange(mission.startDate, mission.endDate)}</span>
        <CompletedAffordance />
      </div>
    </button>
  );
}

function CompletedAffordance() {
  return (
    <InlineStatusAffordance
      tone="success"
      size="md"
      icon={<span aria-hidden="true" style={{ fontSize: 14, lineHeight: 1 }}>🎉</span>}
    >
      Completed
    </InlineStatusAffordance>
  );
}

// ---------------------------------------------------------------------------
// Draft Mission Card (left column — drafts only)
// ---------------------------------------------------------------------------

function DraftMissionCard({ mission, selected, onClick }) {
  const hasDesc = Boolean(mission.description);
  const hasAgents = mission.agentCount != null && mission.agentCount > 0;
  const hasTags = Array.isArray(mission.tags) && mission.tags.length > 0;
  const hasDates = Boolean(mission.startDate && mission.endDate);
  const firstTag = hasTags
    ? mission.tags[0].length > 15 ? mission.tags[0].slice(0, 15) + "…" : mission.tags[0]
    : null;
  const setupProgress = mission.progress || 0;

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...dmcStyles.card,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {selected && <SelectionAccentBar />}
      <h3 style={dmcStyles.title}>{mission.name}</h3>

      <p style={hasDesc ? dmcStyles.desc : dmcStyles.placeholderText}>
        {hasDesc ? mission.description : "--"}
      </p>

      <div style={dmcStyles.divider} />

      <div style={dmcStyles.metaRow}>
        {hasAgents ? (
          <>
            <span style={mcStyles.countBadge}>{mission.agentCount}</span>
            <span style={mcStyles.countLabel}>Agents</span>
          </>
        ) : (
          <>
            <span style={dmcStyles.placeholderBadge}>--</span>
            <span style={mcStyles.countLabel}>Agents</span>
          </>
        )}
        <span style={mcStyles.dot}>·</span>
        {hasTags ? (
          <>
            <span style={mcStyles.tagChip}>{firstTag}</span>
            {mission.tags.length > 1 && (
              <span style={mcStyles.overflowChip}>+{mission.tags.length - 1}</span>
            )}
          </>
        ) : (
          <span style={dmcStyles.placeholderChip}>--</span>
        )}
      </div>

      <div style={dmcStyles.progressTrack}>
        <div style={{ ...dmcStyles.progressFill, width: `${Math.max(setupProgress, 2)}%` }} />
      </div>

      <div style={dmcStyles.bottomRow}>
        <span style={hasDates ? mcStyles.dateRange : dmcStyles.placeholderText}>
          {hasDates ? fmtDateRange(mission.startDate, mission.endDate) : "--"}
        </span>
        <span style={dmcStyles.draftChip}>
          <FileClock size={12} />
          Draft
        </span>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Draft Mission Detail (right column — drafts only)
// ---------------------------------------------------------------------------

function DraftMissionDetail({ mission }) {
  const checklist = mission.setupChecklist || {};
  const completedCount = DRAFT_SETUP_STEPS.reduce((n, s) => n + (checklist[s.id] ? 1 : 0), 0);
  const allComplete = completedCount === DRAFT_SETUP_STEPS.length;
  if (allComplete) return <DraftMissionDetailComplete mission={mission} />;
  return <DraftMissionDetailIncomplete mission={mission} checklist={checklist} />;
}

function DraftMissionDetailIncomplete({ mission, checklist }) {
  const nextIncompleteIdx = DRAFT_SETUP_STEPS.findIndex((s) => !checklist[s.id]);
  return (
    <Card
      padX={24}
      padY={24}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        gap: 16,
        overflow: "hidden",
      }}
    >
      <DraftDetailHeader mission={mission} variant="incomplete" />
      <div style={ddStyles.divider} aria-hidden="true" />
      <SetupIncompleteBanner />
      <DraftSetupChecklist
        checklist={checklist}
        nextIncompleteIdx={nextIncompleteIdx}
        onOpenStep={(stepId) => console.log("open wizard step", stepId)}
      />
    </Card>
  );
}

function DraftMissionDetailComplete({ mission }) {
  return (
    <Card
      padX={24}
      padY={24}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        gap: 16,
        overflow: "hidden",
      }}
    >
      <DraftDetailHeader mission={mission} variant="complete" />
      <div style={ddStyles.divider} aria-hidden="true" />
      <AlmostThereBanner />
      <DraftStatTiles mission={mission} />
      <AdditionalDetailsBlock mission={mission} />
    </Card>
  );
}

function DraftDetailHeader({ mission, variant }) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  return (
    <div style={dhStyles.row}>
      <div style={dhStyles.left}>
        <h2 style={dhStyles.title}>{mission.name}</h2>
        <p style={mission.description ? dhStyles.desc : { ...dhStyles.desc, color: "var(--color-text-placeholder)" }}>
          {mission.description || "--"}
        </p>
      </div>
      <div style={dhStyles.right}>
        <InlineStatusAffordance tone="warning" size="md" icon={<FileClock size={14} />}>
          Draft
        </InlineStatusAffordance>
        {variant === "complete" ? (
          <div style={{ position: "relative" }}>
            <Button
              variant="icon"
              size="sm"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Mission actions"
            >
              <MoreVertical size={18} />
            </Button>
            {menuOpen && (
              <>
                <div style={dhStyles.menuScrim} onClick={() => setMenuOpen(false)} aria-hidden="true" />
                <div style={dhStyles.menu}>
                  {[
                    { label: "Preview & Publish", onClick: () => console.log("preview & publish") },
                    { label: "Delete",            onClick: () => console.log("delete draft") },
                  ].map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      style={dhStyles.menuItem}
                      onClick={() => { item.onClick(); setMenuOpen(false); }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <Button
            variant="icon"
            size="sm"
            aria-label="Delete mission"
            onClick={() => console.log("delete mission")}
          >
            <Trash2 size={18} />
          </Button>
        )}
      </div>
    </div>
  );
}

function SetupIncompleteBanner() {
  return (
    <Banner
      tone="warning"
      heading="Mission Setup Incomplete"
      body="Setup the mission to publish"
      leading={<AlertCircleFilled />}
    />
  );
}

function AlmostThereBanner() {
  return (
    <Banner
      tone="warning"
      heading="Almost There"
      body="All required fields are complete. You can preview this mission to continue."
    />
  );
}

function DraftStatTiles({ mission }) {
  const tiles = [
    { label: "Agents Recruited", value: String(mission.agentCount ?? "--") },
    {
      label: "Timeline",
      value: mission.startDate && mission.endDate
        ? `${fmtDateRange(mission.startDate, mission.endDate)}`
        : "--",
      sublabel: mission.timelineLabel ? `(${mission.timelineLabel})` : null,
    },
    { label: "Minimum Practice Sessions", value: String(mission.minimumPracticeSessions ?? "--") },
  ];
  return (
    <div style={ddcStyles.tilesRow}>
      {tiles.map((t, i) => (
        <div
          key={t.label}
          style={{
            ...ddcStyles.tile,
            borderRight: i === tiles.length - 1 ? "none" : "1px solid var(--color-divider-card)",
          }}
        >
          <span style={ddcStyles.tileLabel}>{t.label}</span>
          <span style={ddcStyles.tileValue}>
            {t.value}
            {t.sublabel && <span style={ddcStyles.tileSublabel}>{" "}{t.sublabel}</span>}
          </span>
        </div>
      ))}
    </div>
  );
}

function AdditionalDetailsBlock({ mission }) {
  return (
    <div style={ddcStyles.detailsGroup}>
      <h3 style={ddcStyles.groupHeading}>Additional Details</h3>
      <div style={ddcStyles.groupDivider} aria-hidden="true" />
      <DetailsSubSection title="Coverage">
        <div style={ddcStyles.chipFlow}>
          {(mission.coverage || []).map((c) => (
            <DriverChip key={c.id} driver={c.driver} count={c.reasonCount} />
          ))}
        </div>
      </DetailsSubSection>
      <DetailsSubSection title="Focus Areas">
        <div style={ddcStyles.chipFlow}>
          {(mission.focusAreas || []).map((fa) => (
            <FocusAreaChip key={fa.id} name={fa.name} type={fa.type} targetScore={fa.targetScore} />
          ))}
        </div>
      </DetailsSubSection>
      <DetailsSubSection title="Recruited Agents">
        <div style={ddcStyles.chipFlow}>
          {(mission.recruitedAgents || []).map((a) => (
            <AgentChip key={a.id} initials={a.initials} name={a.name} title={`${a.name} — ${a.team}`} />
          ))}
        </div>
      </DetailsSubSection>
    </div>
  );
}

function DetailsSubSection({ title, children }) {
  return (
    <div style={ddcStyles.subSection}>
      <h4 style={ddcStyles.subHeader}>{title}</h4>
      {children}
    </div>
  );
}

function DriverChip({ driver, count }) {
  return (
    <span style={ddcStyles.chip}>
      <span style={ddcStyles.chipLabel}>{driver}</span>
      <span style={ddcStyles.chipCountBadge}>{count}</span>
      <Info size={14} color="var(--color-text-tertiary)" />
    </span>
  );
}

function FocusAreaChip({ name, type, targetScore }) {
  return (
    <span style={ddcStyles.chip}>
      <span style={ddcStyles.chipIcon}>
        {type === "policy"
          ? <ShieldCheck size={14} color="var(--color-icon-tertiary-fg)" />
          : <Sparkles    size={14} color="var(--color-icon-tertiary-fg)" />}
      </span>
      <span style={ddcStyles.chipLabel}>{name}</span>
      <span style={ddcStyles.chipPercentBadge}>{targetScore}%</span>
      <Info size={14} color="var(--color-text-tertiary)" />
    </span>
  );
}

function AgentChip({ initials, name, title }) {
  return (
    <span style={ddcStyles.chip} title={title}>
      <span style={{ ...ddcStyles.chipAvatar, background: avatarColor(name) }}>{initials}</span>
      <span style={ddcStyles.chipLabel}>{name}</span>
      <Info size={14} color="var(--color-text-tertiary)" />
    </span>
  );
}

function DraftSetupChecklist({ checklist, nextIncompleteIdx, onOpenStep }) {
  return (
    <div style={ddStyles.checklist} role="list">
      {DRAFT_SETUP_STEPS.map((step, idx) => (
        <DraftSetupRow
          key={step.id}
          step={step}
          done={Boolean(checklist[step.id])}
          isNext={idx === nextIncompleteIdx}
          onClick={() => onOpenStep(step.id)}
        />
      ))}
    </div>
  );
}

function DraftSetupRow({ step, done, isNext, onClick }) {
  const [hover, setHover] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const showChevron = hover || focused || isNext;
  const highlighted = hover || focused || isNext;

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...ddStyles.row,
        background: highlighted ? "var(--color-primary-alpha-08)" : "transparent",
      }}
      role="listitem"
    >
      <span style={ddStyles.rowIcon} aria-hidden="true">
        {done ? (
          <CheckCircle2 size={20} color="var(--color-success)" strokeWidth={2.25} />
        ) : (
          <Circle size={20} color="var(--color-text-tertiary)" strokeWidth={1.75} />
        )}
      </span>
      <span style={ddStyles.rowLabel}>{step.label}</span>
      <span style={{ ...ddStyles.rowChevron, opacity: showChevron ? 1 : 0 }} aria-hidden="true">
        <ChevronRight size={18} color="var(--color-text-tertiary)" />
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Completed Mission Detail (right column — completed only)
// Header status indicator + success summary banner + 5-tile KPI row +
// Agent Results table + updated timeline. Same unified-card shell as
// MissionDetail.
// ---------------------------------------------------------------------------

function CompletedMissionDetail({ mission }) {
  return (
    <Card
      padX={24}
      padY={24}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        gap: 16,
        overflow: "hidden",
      }}
    >
      <CompletedDetailHeader mission={mission} />
      <SuccessBanner mission={mission} />
      <CompletedDetailKPIs mission={mission} />
      <Card tone="outline" padX={24} padY={16} style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        <AgentResultsSection results={mission.agentResults} total={mission.agentResultsTotal} closedAt={mission.closedAt} />
      </Card>
      <Card tone="outline" padX={24} padY={16} style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        <TimelineSection timeline={mission.timeline} />
      </Card>
    </Card>
  );
}

function CompletedDetailHeader({ mission }) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  return (
    <div>
      <div style={dhStyles.row}>
        <div style={dhStyles.left}>
          <h2 style={dhStyles.title}>{mission.name}</h2>
          <p style={dhStyles.desc}>{mission.description}</p>
        </div>
        <div style={dhStyles.right}>
          <CompletedAffordance />
          <div style={{ position: "relative" }}>
            <Button variant="icon" size="sm" onClick={() => setMenuOpen((o) => !o)} aria-label="Mission actions">
              <MoreVertical size={18} />
            </Button>
            {menuOpen && (
              <>
                <div style={dhStyles.menuScrim} onClick={() => setMenuOpen(false)} aria-hidden="true" />
                <div style={dhStyles.menu}>
                  {["Duplicate mission", "Delete mission"].map((label) => (
                    <button
                      key={label}
                      type="button"
                      style={dhStyles.menuItem}
                      onClick={() => { console.log(label); setMenuOpen(false); }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Outcome-driven banner. Three variants per spec.
function SuccessBanner({ mission }) {
  const { closeOutcome, agentsReachedTarget, agentsTotal, closedAt, missionDurationDays, originalEndDate } = mission;
  const pct = Math.round((agentsReachedTarget / agentsTotal) * 100);

  let tone, heading, body;
  if (closeOutcome === "all_met") {
    tone = "success";
    heading = `All ${agentsTotal} agents reached their readiness targets`;
    body = `Mission completed successfully on ${fmtBannerDate(closedAt)}. Mission ran for ${missionDurationDays} days.`;
  } else if (closeOutcome === "closed_early") {
    tone = "info";
    heading = `Mission closed early — ${agentsReachedTarget} of ${agentsTotal} agents reached their readiness target`;
    body = `Closed on ${fmtBannerDate(closedAt)}. Original end date: ${fmtBannerDate(originalEndDate)}.`;
  } else {
    tone = "info";
    heading = `${agentsReachedTarget} of ${agentsTotal} agents reached their readiness target`;
    body = `Mission ended on ${fmtBannerDate(closedAt)}. Closed automatically at deadline.`;
  }

  const ringColor = tone === "success" ? "var(--color-success)" : "var(--color-info)";

  return (
    <Banner
      tone={tone}
      heading={heading}
      body={body}
      leading={<CircularProgress pct={pct} ringColor={ringColor} />}
    />
  );
}

function CompletedDetailKPIs({ mission }) {
  const { kpis } = mission;
  return (
    <div style={dkStyles.row}>
      <div style={dkStyles.tile}>
        <span style={dkStyles.label}>Agents Below Target</span>
        <span style={dkStyles.value}>{kpis.agentsBelowTarget.current} out of {kpis.agentsBelowTarget.total}</span>
      </div>
      <div style={dkStyles.divider} />
      <div style={dkStyles.tile}>
        <span style={dkStyles.label}>Last Roleplay</span>
        <span style={dkStyles.value}>{kpis.lastRoleplay || "--"}</span>
        {kpis.lastRoleplaySubLabel && (
          <span style={dkStyles.subLabel}>{kpis.lastRoleplaySubLabel}</span>
        )}
      </div>
      <div style={dkStyles.divider} />
      <div style={dkStyles.tile}>
        <span style={dkStyles.label}>Roleplays</span>
        <span style={dkStyles.value}>{kpis.roleplays || 0}</span>
      </div>
      <div style={dkStyles.divider} />
      <div style={dkStyles.tile}>
        <div style={dkStyles.labelRow}>
          <span style={dkStyles.label}>Contact Reasons</span>
          <Info size={14} color="var(--color-text-tertiary)" />
        </div>
        <span style={dkStyles.value}>{kpis.contactReasons.current}/{kpis.contactReasons.total}</span>
      </div>
      <div style={dkStyles.divider} />
      <div style={dkStyles.tile}>
        <span style={dkStyles.label}>Mission Duration</span>
        <span style={dkStyles.value}>{kpis.missionDuration} Days</span>
        {kpis.missionDurationSubLabel && (
          <span style={dkStyles.subLabel}>{kpis.missionDurationSubLabel}</span>
        )}
      </div>
    </div>
  );
}

// Stale-activity threshold for "Last Active" cell — more than this many
// days before mission close renders the date in danger tone.
const STALE_ACTIVITY_DAYS = 14;

function AgentResultsSection({ results, total, closedAt }) {
  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const closeMs = parseISODateUTC(closedAt);

  return (
    <div>
      <h3 style={icStyles.title}>Agent Results</h3>
      <p style={icStyles.subtitle}>Final readiness status for each agent at mission close</p>

      <div style={{ ...icStyles.table, marginTop: 16 }}>
        <div style={icStyles.headerRow}>
          <span style={{ ...icStyles.headerCell, flex: 1.4 }}>Agent</span>
          <span style={icStyles.headerCell}>Roleplays Completed</span>
          <span style={icStyles.headerCell}>Last Active</span>
          <span style={icStyles.headerCell}>Target</span>
        </div>
        {results.map((row) => {
          const lastActiveMs = parseISODateUTC(row.lastActive);
          const diffDays = (closeMs - lastActiveMs) / (24 * 60 * 60 * 1000);
          const stale = diffDays > STALE_ACTIVITY_DAYS;
          return (
            <AgentResultRow key={row.id} row={row} stale={stale} />
          );
        })}
      </div>

      <div style={icStyles.pagination}>
        <span style={icStyles.totalLabel}>Total {total} Agents</span>
        <div style={icStyles.pageControls}>
          <Button variant="icon" size="sm" disabled aria-label="First page">
            <ChevronLeft size={14} />
          </Button>
          <span style={icStyles.pageInfo}>Page 1 of {totalPages}</span>
          <Button variant="icon" size="sm" disabled aria-label="Previous page">
            <ChevronLeft size={14} />
          </Button>
          <Button variant="icon" size="sm" onClick={() => console.log("next")} aria-label="Next page">
            <ChevronRight size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}

function AgentResultRow({ row, stale }) {
  const [hover, setHover] = React.useState(false);
  const isMet = row.target === "Met";
  const badgeStyle = isMet
    ? { background: "var(--color-success-bg)", color: "var(--color-success-text)" }
    : { background: "var(--color-error-bg)",   color: "var(--color-error-text)"   };

  return (
    <div
      style={{
        ...icStyles.bodyRow,
        background: hover ? "rgba(0,0,0,0.02)" : "transparent",
        cursor: "pointer",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <span style={{ ...icStyles.bodyCell, flex: 1.4, gap: 8 }}>
        <span style={{ ...icStyles.avatar, background: avatarColor(row.name) }}>
          {row.initial}
        </span>
        {row.name}
      </span>
      <span style={icStyles.bodyCell}>{row.roleplaysCompleted}</span>
      <span style={{ ...icStyles.bodyCell, color: stale ? "var(--color-error)" : "var(--color-text-medium)" }}>
        {fmtFullDate(row.lastActive)}
      </span>
      <span style={{ ...icStyles.bodyCell, justifyContent: "space-between" }}>
        <span style={{ ...pcStyles.badge, ...badgeStyle }}>{row.target}</span>
        {hover && <ExternalLink size={14} color="var(--color-text-tertiary)" />}
      </span>
    </div>
  );
}

function fmtFullDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${d} ${months[m - 1]} ${y}`;
}

function fmtBannerDate(iso) {
  return fmtFullDate(iso);
}

function parseISODateUTC(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

// ---------------------------------------------------------------------------
// Mission Detail (right column)
// ---------------------------------------------------------------------------

function MissionDetail({ mission }) {
  return (
    <Card
      padX={24}
      padY={24}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        gap: 16,
        overflow: "hidden",
      }}
    >
      <DetailHeader mission={mission} />
      {mission.alert && <AlertBanner alert={mission.alert} />}
      <DetailKPIs mission={mission} />
      <Card tone="outline" padX={24} padY={16} style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        <PerformanceSection performance={mission.performance} />
      </Card>
      <Card tone="outline" padX={24} padY={16} style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        <InteractionsSection interactions={mission.interactions} total={mission.totalInteractions} />
      </Card>
      <Card tone="outline" padX={24} padY={16} style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        <TimelineSection timeline={mission.timeline} />
      </Card>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Detail Header + Kebab
// ---------------------------------------------------------------------------

function DetailHeader({ mission }) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const timeTone = getTimeAffordanceTone(mission.daysLeft);
  const timeLabel = mission.daysLeft <= 0 ? "Ends Today" : `${mission.daysLeft} days left`;

  return (
    <div>
      <div style={dhStyles.row}>
        <div style={dhStyles.left}>
          <h2 style={dhStyles.title}>{mission.name}</h2>
          <p style={dhStyles.desc}>{mission.description}</p>
        </div>
        <div style={dhStyles.right}>
          <InlineStatusAffordance
            tone={timeTone}
            size="md"
            icon={<Clock size={14} />}
            style={{ padding: "4px 12px", borderRadius: 999 }}
          >
            {timeLabel}
          </InlineStatusAffordance>
          <div style={{ position: "relative" }}>
            <Button variant="icon" size="sm" onClick={() => setMenuOpen((o) => !o)} aria-label="Mission actions">
              <MoreVertical size={18} />
            </Button>
            {menuOpen && (
              <>
                <div style={dhStyles.menuScrim} onClick={() => setMenuOpen(false)} aria-hidden="true" />
                <div style={dhStyles.menu}>
                  {["Edit mission", "Duplicate mission", "Close mission", "Delete mission"].map((label) => (
                    <button
                      key={label}
                      type="button"
                      style={dhStyles.menuItem}
                      onClick={() => { console.log(label); setMenuOpen(false); }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Alert Banner
// ---------------------------------------------------------------------------

function AlertBanner({ alert }) {
  return (
    <Banner
      tone={alert.tone === "danger" ? "danger" : "warning"}
      heading={alert.heading}
      body={alert.body}
      actions={alert.actions.map((a) => ({
        label: a.label,
        variant: a.variant,
        onClick: () => console.log(a.label),
      }))}
    />
  );
}

// ---------------------------------------------------------------------------
// Detail KPIs
// ---------------------------------------------------------------------------

function DetailKPIs({ mission }) {
  const { kpis, state } = mission;
  const isDanger = state === "ends_today";

  return (
    <div style={dkStyles.row}>
      <div style={{ ...dkStyles.tile, ...(isDanger ? { background: "var(--color-error-bg)" } : {}) }}>
        <span style={dkStyles.label}>Agents Below Target</span>
        <span style={dkStyles.value}>{kpis.agentsBelowTarget.current} out of {kpis.agentsBelowTarget.total}</span>
      </div>
      <div style={dkStyles.divider} />
      <div style={dkStyles.tile}>
        <span style={dkStyles.label}>Last Roleplay</span>
        <span style={dkStyles.value}>{kpis.lastRoleplay || "--"}</span>
      </div>
      <div style={dkStyles.divider} />
      <div style={dkStyles.tile}>
        <span style={dkStyles.label}>Roleplays</span>
        <span style={dkStyles.value}>{kpis.roleplays || 0}</span>
      </div>
      <div style={dkStyles.divider} />
      <div style={dkStyles.tile}>
        <div style={dkStyles.labelRow}>
          <span style={dkStyles.label}>Contact Reasons</span>
          <Info size={14} color="var(--color-text-tertiary)" />
        </div>
        <span style={dkStyles.value}>{kpis.contactReasons.current}/{kpis.contactReasons.total}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mission Performance Card
// ---------------------------------------------------------------------------

function PerformanceSection({ performance }) {
  const [activeTab, setActiveTab] = React.useState("focus");

  const tabs = [
    { id: "focus", label: "By Focus Area" },
    { id: "agent", label: "By Agent" },
    { id: "driver", label: "By Driver" },
  ];

  return (
    <div>
      <h3 style={pcStyles.title}>Mission Performance</h3>
      <p style={pcStyles.subtitle}>How agents are tracking against each focus area target</p>

      <TabsRow tabs={tabs} activeTab={activeTab} onTabClick={setActiveTab} />

      {activeTab === "focus" ? (
        <div style={pcStyles.table}>
          <div style={pcStyles.headerRow}>
            <span style={{ ...pcStyles.headerCell, flex: 2 }}>Focus Area</span>
            <span style={pcStyles.headerCell}>Target Score</span>
            <span style={pcStyles.headerCell}>Roleplays</span>
            <span style={pcStyles.headerCell}>
              Target Met
              <Info size={14} color="var(--color-text-tertiary)" style={{ marginLeft: 4 }} />
            </span>
          </div>
          {performance.map((row) => (
            <div key={row.name} style={pcStyles.bodyRow}>
              <span style={{ ...pcStyles.bodyCell, flex: 2, gap: 10 }}>
                <span style={pcStyles.faIcon}>
                  {row.type === "policy"
                    ? <ShieldCheck size={14} color="var(--color-icon-tertiary-fg)" />
                    : <Sparkles size={14} color="var(--color-icon-tertiary-fg)" />}
                </span>
                {row.name}
              </span>
              <span style={pcStyles.bodyCell}>
                {row.targetScore != null ? `${row.targetScore}%` : "--"}
              </span>
              <span style={pcStyles.bodyCell}>
                {row.roleplays != null ? row.roleplays : "--"}
              </span>
              <span style={pcStyles.bodyCell}>
                {row.targetMet != null ? (
                  <span style={{ ...pcStyles.badge, ...getTargetMetStyle(row.targetMet) }}>
                    {row.targetMet}%
                  </span>
                ) : "--"}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div style={pcStyles.placeholder}>
          <p style={{ color: "var(--color-text-tertiary)", fontSize: 14 }}>
            {activeTab === "agent" ? "Agent-level breakdown" : "Driver-level breakdown"} coming soon.
          </p>
          {/* TODO: By Agent and By Driver tabs */}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Roleplay Interactions Section
// ---------------------------------------------------------------------------

function InteractionsSection({ interactions, total }) {
  const hasData = interactions.length > 0;
  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <h3 style={icStyles.title}>Roleplay Interactions</h3>
      <p style={icStyles.subtitle}>Individual roleplay sessions in this mission</p>

      {!hasData ? (
        <div style={icStyles.emptyWrap}>
          <EmptyStateIllustration />
          <h4 style={icStyles.emptyHeading}>No interactions practiced yet</h4>
          <p style={icStyles.emptyBody}>Agents have not started on any interactions. Remind them to get started</p>
        </div>
      ) : (
        <>
          <div style={icStyles.filterRow}>
            <button type="button" style={icStyles.dropdown} onClick={() => console.log("drivers filter")}>
              All Drivers <ChevronLeft size={14} style={{ transform: "rotate(-90deg)" }} />
            </button>
            <button type="button" style={icStyles.dropdown} onClick={() => console.log("agents filter")}>
              All Agents <ChevronLeft size={14} style={{ transform: "rotate(-90deg)" }} />
            </button>
          </div>

          <div style={icStyles.table}>
            <div style={icStyles.headerRow}>
              <span style={{ ...icStyles.headerCell, flex: 1.2 }}>Agents</span>
              <span style={{ ...icStyles.headerCell, flex: 1.5 }}>Contact Reason</span>
              <span style={icStyles.headerCell}>Duration</span>
              <span style={icStyles.headerCell}>Date</span>
              <span style={icStyles.headerCell}>QA Score</span>
            </div>
            {interactions.map((row, idx) => (
              <div key={row.id} style={icStyles.bodyRow}>
                <span style={{ ...icStyles.bodyCell, flex: 1.2, gap: 8 }}>
                  <span style={{ ...icStyles.avatar, background: avatarColor(row.name) }}>
                    {row.initial}
                  </span>
                  {row.name}
                </span>
                <span style={{ ...icStyles.bodyCell, flex: 1.5 }}>{row.contactReason}</span>
                <span style={icStyles.bodyCell}>{row.duration}</span>
                <span style={icStyles.bodyCell}>{row.date}</span>
                <span style={{ ...icStyles.bodyCell, justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 700, ...getQAStyle(row.qaScore) }}>{row.qaScore}%</span>
                  {idx === 1 && <ExternalLink size={14} color="var(--color-text-tertiary)" />}
                </span>
              </div>
            ))}
          </div>

          <div style={icStyles.pagination}>
            <span style={icStyles.totalLabel}>Total {total} Interaction</span>
            <div style={icStyles.pageControls}>
              <Button variant="icon" size="sm" disabled aria-label="First page">
                <ChevronLeft size={14} />
              </Button>
              <Button variant="icon" size="sm" disabled aria-label="Previous page">
                <ChevronLeft size={14} />
              </Button>
              <span style={icStyles.pageInfo}>Page 1 of {totalPages}</span>
              <Button variant="icon" size="sm" onClick={() => console.log("next")} aria-label="Next page">
                <ChevronRight size={14} />
              </Button>
              <Button variant="icon" size="sm" onClick={() => console.log("last")} aria-label="Last page">
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mission Timeline Section
// ---------------------------------------------------------------------------

function TimelineSection({ timeline }) {
  const dotColor = (tone) => {
    if (tone === "success") return "var(--color-success)";
    if (tone === "warning") return "var(--color-warning)";
    if (tone === "info")    return "var(--color-info)";
    return "var(--grey-400)";
  };

  return (
    <div>
      <h3 style={tlStyles.title}>Mission Timeline</h3>
      <p style={tlStyles.subtitle}>Key events during this mission</p>

      <div style={tlStyles.list}>
        {timeline.map((evt, idx) => (
          <div key={idx} style={tlStyles.event}>
            <div style={tlStyles.rail}>
              <div style={{ ...tlStyles.dot, background: dotColor(evt.tone) }} />
              {idx < timeline.length - 1 && <div style={tlStyles.line} />}
            </div>
            <div style={tlStyles.body}>
              <span style={tlStyles.date}>{evt.date}</span>
              <span style={tlStyles.evtTitle}>{evt.title}</span>
              <span style={tlStyles.evtDesc}>{evt.description}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Success Toast — library primitive imported as <Toast>.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Empty State (preserved from original)
// ---------------------------------------------------------------------------

function EmptyStateIllustration() {
  return (
    <svg width="177" height="121" viewBox="0 0 177 121" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ marginBottom: 12 }}>
      <path d="M89.1109 108.5C118.811 108.5 143.011 84.4 143.011 54.8C142.911 25.1 118.811 1 89.1109 1C59.3109 1 35.2109 25.1 35.2109 54.7C35.2109 84.4 59.3109 108.5 89.1109 108.5Z" fill="#9CA3AF" stroke="#6B7280" strokeWidth="2" strokeMiterlimit="10" />
      <path d="M146.212 61.5998C146.212 73.0998 136.912 82.3998 125.312 82.3998C125.112 82.3998 123.412 82.3998 110.912 82.3998C102.212 82.3998 88.3117 82.3998 66.1117 82.3998H55.5117C41.6117 82.6998 30.5117 71.5998 30.5117 58.1998C30.5117 44.6998 41.7117 33.4998 55.8117 34.1998C67.9117 -3.60016 123.312 1.69984 128.012 40.7998C138.412 42.0998 146.212 50.8998 146.212 61.5998Z" fill="white" stroke="#6B7280" strokeWidth="2" strokeMiterlimit="10" />
      <path d="M127.712 40.9008C126.912 40.8008 126.112 40.8008 125.312 40.8008C121.212 40.8008 117.312 42.0008 114.012 44.1008" fill="white" />
      <path d="M127.712 40.9008C126.912 40.8008 126.112 40.8008 125.312 40.8008C121.212 40.8008 117.312 42.0008 114.012 44.1008" stroke="#6B7280" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" />
      <path d="M55.8117 34.1992C54.6117 37.7992 54.0117 41.5992 54.0117 45.5992C54.0117 47.1992 54.1117 48.6992 54.3117 50.1992" fill="white" />
      <path d="M55.8117 34.1992C54.6117 37.7992 54.0117 41.5992 54.0117 45.5992C54.0117 47.1992 54.1117 48.6992 54.3117 50.1992" stroke="#6B7280" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M78.2234 57.6871C79.7981 57.6871 81.1305 56.3547 81.1305 54.7801C81.1305 53.2054 79.7981 51.873 78.2234 51.873C76.6488 51.873 75.3164 53.2054 75.3164 54.7801C75.3164 56.3547 76.6488 57.6871 78.2234 57.6871Z" fill="#6B7280" />
      <path d="M100.509 57.6871C102.083 57.6871 103.416 56.3547 103.416 54.7801C103.416 53.2054 102.083 51.873 100.509 51.873C98.9339 51.873 97.6016 53.2054 97.6016 54.7801C97.6016 56.4759 98.9339 57.6871 100.509 57.6871Z" fill="#6B7280" />
      <path d="M78.1096 45.1624L71.7148 48.6152L72.5781 50.2139L78.9728 46.7611L78.1096 45.1624Z" fill="#6B7280" />
      <path d="M100.117 45.116L99.2539 46.7148L105.649 50.1669L106.512 48.5681L100.117 45.116Z" fill="#6B7280" />
      <path d="M89.3681 64.4701C91.2412 64.4701 92.7597 63.3313 92.7597 61.9265C92.7597 60.5216 91.2412 59.3828 89.3681 59.3828C87.495 59.3828 85.9766 60.5216 85.9766 61.9265C85.9766 63.3313 87.495 64.4701 89.3681 64.4701Z" fill="#6B7280" />
      <path d="M18.085 15.3613C18.085 15.3613 4.10641 18.9104 8.34234 21.7497C12.5783 24.447 22.6033 29.1319 32.0635 26.0086C41.5237 22.8854 32.0635 18.4845 32.2047 18.4845C32.3459 18.4845 18.085 15.3613 18.085 15.3613Z" fill="#F1F3F9" stroke="#6B7280" strokeWidth="2" strokeMiterlimit="10" />
      <path d="M1 14.2253C6.08311 15.7869 21.756 13.2315 31.781 6.70117C39.6881 16.4967 42.6532 19.052 45.4772 19.336C41.1001 23.7369 26.5567 30.8351 18.3673 21.6074C8.76586 27.7119 1 14.2253 1 14.2253Z" fill="white" stroke="#6B7280" strokeWidth="2" strokeMiterlimit="10" strokeLinejoin="round" />
      <path d="M131.07 49.722C136.436 50.006 150.979 43.4756 158.886 34.6738C169.052 42.1979 172.441 43.9015 175.406 43.4756C172.159 48.8702 162.275 60.6533 148.296 61.5051C138.13 55.5426 131.07 49.722 131.07 49.722Z" fill="white" stroke="#6B7280" strokeWidth="2" strokeMiterlimit="10" strokeLinejoin="round" />
      <path d="M88.2379 116.312C87.1764 111.045 77.2292 98.5868 66.7352 93.1214C71.4898 81.4014 72.2956 77.6952 71.1445 74.9296C77.178 76.731 91.0517 83.3682 95.3586 96.6939C92.1164 108.025 88.2379 116.312 88.2379 116.312Z" fill="white" stroke="#6B7280" strokeWidth="2" strokeMiterlimit="10" strokeLinejoin="round" />
    </svg>
  );
}

function MissionsEmptyState({ onCreate }) {
  return (
    <Card style={{ flex: 1, display: "flex" }}>
      <div style={msStyles.emptyState}>
        <EmptyStateIllustration />
        <h2 style={msStyles.emptyHeading}>No missions yet</h2>
        <p style={msStyles.emptyBody}>
          Set the scenarios, targets, and teams — then track readiness as agents practice
        </p>
        <div style={msStyles.emptyCtaSpacer}>
          <Button variant="primary" leadingIcon={<Plus size={16} />} onClick={onCreate}>
            Mission
          </Button>
        </div>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const msStyles = {
  shell: {
    marginLeft: "var(--sidenav-width)",
    minHeight: "100vh",
    background: "var(--surface-canvas)",
    display: "flex",
    flexDirection: "column",
    paddingTop: "var(--page-padding-top)",
    paddingBottom: "var(--page-padding-bottom)",
    paddingInline: "var(--page-gutter)",
    boxSizing: "border-box",
  },
  narrowContent: {
    maxWidth: "var(--page-content-max-width)",
    marginInline: "auto",
    width: "100%",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "var(--page-card-gap)",
  },
  wideContent: {
    maxWidth: 1440,
    marginInline: "auto",
    width: "100%",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 20,
    minHeight: 0,
  },
  kpiCard: {
    display: "flex",
    alignItems: "stretch",
    padding: "12px 24px",
    background: "#FFFFFF",
    borderRadius: 12,
    boxShadow: "var(--shadow-card)",
    width: "100%",
    height: 76,
  },
  kpiTile: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: 2,
  },
  kpiDivider: {
    width: 1,
    alignSelf: "stretch",
    background: "var(--color-divider-card)",
    flexShrink: 0,
  },
  kpiLabel: {
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
    lineHeight: 1.2,
    letterSpacing: 0,
  },
  kpiValue: {
    fontFamily: "var(--font-sans)",
    fontSize: 20,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    lineHeight: 1.2,
    letterSpacing: 0,
  },
  split: {
    flex: 1,
    display: "flex",
    gap: 24,
    minHeight: 0,
    alignItems: "flex-start",
  },
  leftCol: {
    width: 320,
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  rightCol: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 20,
    minHeight: 0,
    minWidth: 0,
  },
  emptyState: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    gap: 12,
    paddingBlock: 56,
  },
  emptyHeading: {
    fontFamily: "var(--font-sans)",
    fontSize: 20,
    fontWeight: 700,
    color: "var(--do-ink)",
    lineHeight: 1.3,
    margin: 0,
  },
  emptyBody: {
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
    maxWidth: 480,
    margin: 0,
    lineHeight: 1.5,
  },
  emptyCtaSpacer: { marginTop: 16 },
};

const mcStyles = {
  card: {
    width: "100%",
    textAlign: "left",
    padding: 24,
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    fontFamily: '"Mulish", sans-serif',
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    background: "#FFFFFF",
    boxShadow: "var(--shadow-card)",
  },
  title: {
    fontSize: 14,
    fontWeight: 700,
    color: "var(--do-ink)",
    lineHeight: 1.3,
    margin: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    width: "100%",
  },
  desc: {
    fontSize: 13,
    fontWeight: 400,
    color: "var(--color-text-tertiary)",
    lineHeight: 1.4,
    margin: 0,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    width: "100%",
  },
  divider: {
    height: 1,
    background: "var(--color-border-tab)",
    width: "100%",
  },
  chips: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    flexWrap: "nowrap",
    width: "100%",
  },
  countBadge: {
    fontSize: 12,
    fontWeight: 700,
    color: "#245BFF",
    background: "#E8ECFF",
    borderRadius: 999,
    padding: "2px 10px",
    whiteSpace: "nowrap",
    display: "inline-flex",
    alignItems: "center",
    minWidth: 24,
    justifyContent: "center",
  },
  countLabel: {
    fontSize: 12,
    fontWeight: 500,
    color: "var(--color-text-medium)",
    whiteSpace: "nowrap",
  },
  dot: { fontSize: 12, color: "var(--grey-400)" },
  tagChip: {
    fontSize: 12,
    fontWeight: 500,
    color: "var(--color-text-medium)",
    background: "var(--pill-bg)",
    borderRadius: 999,
    padding: "2px 8px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: 120,
  },
  overflowChip: {
    fontSize: 12,
    fontWeight: 600,
    color: "var(--color-text-tertiary)",
    background: "var(--pill-bg)",
    borderRadius: 999,
    padding: "2px 8px",
    whiteSpace: "nowrap",
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    background: "#E8ECFF",
    width: "100%",
    display: "flex",
    overflow: "hidden",
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  dateRange: {
    fontSize: 12,
    fontWeight: 400,
    color: "var(--color-text-tertiary)",
  },
  timeChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
};

const dmcStyles = {
  card: {
    width: "100%",
    textAlign: "left",
    padding: 24,
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    fontFamily: '"Mulish", sans-serif',
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    background: "#FFFFFF",
    boxShadow: "var(--shadow-card)",
  },
  topRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    width: "100%",
  },
  title: {
    fontSize: 14,
    fontWeight: 700,
    color: "var(--do-ink)",
    lineHeight: 1.3,
    margin: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    flex: 1,
    minWidth: 0,
  },
  ownerAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: 700,
    flexShrink: 0,
  },
  desc: {
    fontSize: 13,
    fontWeight: 400,
    color: "var(--color-text-tertiary)",
    lineHeight: 1.4,
    margin: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  placeholderText: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--color-text-placeholder)",
    lineHeight: 1.4,
    margin: 0,
  },
  placeholderChip: {
    fontSize: 12,
    fontWeight: 500,
    color: "var(--color-text-placeholder)",
    background: "var(--pill-bg)",
    borderRadius: 999,
    padding: "2px 8px",
    whiteSpace: "nowrap",
  },
  placeholderBadge: {
    fontSize: 12,
    fontWeight: 700,
    color: "var(--color-text-placeholder)",
    background: "var(--pill-bg)",
    borderRadius: 999,
    padding: "2px 10px",
    whiteSpace: "nowrap",
    display: "inline-flex",
    alignItems: "center",
    minWidth: 24,
    justifyContent: "center",
  },
  divider: {
    height: 1,
    background: "var(--color-border-tab)",
    width: "100%",
  },
  metaRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    width: "100%",
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    background: "#E8ECFF",
    width: "100%",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
    background: "var(--grey-500)",
  },
  bottomRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  draftChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    fontSize: 12,
    fontWeight: 600,
    borderRadius: 999,
    padding: "2px 8px",
    background: "var(--color-warning-bg)",
    color: "var(--color-warning)",
    whiteSpace: "nowrap",
  },
};

const dhStyles = {
  row: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 24,
  },
  left: { flex: 1, minWidth: 0 },
  title: {
    fontFamily: "var(--font-sans)",
    fontSize: 20,
    fontWeight: 700,
    color: "var(--do-ink)",
    lineHeight: 1.3,
    margin: 0,
  },
  desc: {
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    fontWeight: 400,
    color: "var(--color-text-tertiary)",
    lineHeight: 1.5,
    margin: "8px 0 0",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexShrink: 0,
  },
  timeChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    fontSize: 13,
    fontWeight: 600,
    borderRadius: 999,
    padding: "4px 12px",
    whiteSpace: "nowrap",
  },
  menuScrim: {
    position: "fixed",
    inset: 0,
    zIndex: 39,
  },
  menu: {
    position: "absolute",
    top: "100%",
    right: 0,
    marginTop: 4,
    width: 200,
    background: "#FFFFFF",
    borderRadius: 8,
    boxShadow: "var(--shadow-8)",
    padding: "4px 0",
    zIndex: 40,
  },
  menuItem: {
    display: "block",
    width: "100%",
    padding: "8px 16px",
    background: "transparent",
    border: "none",
    textAlign: "left",
    fontFamily: '"Mulish", sans-serif',
    fontSize: 14,
    fontWeight: 500,
    color: "var(--color-text-medium)",
    cursor: "pointer",
  },
};

const dkStyles = {
  row: {
    display: "flex",
    alignItems: "stretch",
    background: "#FFFFFF",
    border: "1px solid var(--color-divider-card)",
    borderRadius: 8,
    overflow: "hidden",
  },
  tile: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 4,
    padding: "16px 20px",
    minWidth: 0,
  },
  divider: {
    width: 1,
    background: "var(--color-divider-card)",
    flexShrink: 0,
  },
  label: {
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text-medium)",
    display: "block",
    marginBottom: 4,
  },
  value: {
    fontFamily: "var(--font-sans)",
    fontSize: 16,
    fontWeight: 600,
    color: "var(--color-text-deep)",
  },
  labelRow: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  subLabel: {
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    fontWeight: 400,
    color: "var(--color-text-tertiary)",
    marginTop: 2,
    lineHeight: 1.4,
  },
};

const ddStyles = {
  divider: {
    height: 1,
    background: "var(--color-border-tab)",
    width: "100%",
  },
  checklist: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 16px",
    borderRadius: 8,
    border: "none",
    background: "transparent",
    width: "100%",
    textAlign: "left",
    cursor: "pointer",
    fontFamily: '"Mulish", sans-serif',
    transition: "background 120ms ease",
  },
  rowIcon: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 20,
    height: 20,
    flexShrink: 0,
  },
  rowLabel: {
    flex: 1,
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    fontWeight: 500,
    color: "var(--color-text-deep)",
    lineHeight: 1.4,
  },
  rowChevron: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 18,
    height: 18,
    flexShrink: 0,
    transition: "opacity 120ms ease",
  },
};

const ddcStyles = {
  tilesRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 0,
    background: "#FFFFFF",
    border: "1px solid var(--color-divider-card)",
    borderRadius: 8,
    overflow: "hidden",
  },
  tile: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    padding: "16px 20px",
    minWidth: 0,
  },
  tileLabel: {
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text-medium)",
  },
  tileValue: {
    fontFamily: "var(--font-sans)",
    fontSize: 16,
    fontWeight: 600,
    color: "var(--color-text-deep)",
    lineHeight: 1.4,
  },
  tileSublabel: {
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 400,
    color: "var(--color-text-tertiary)",
    marginLeft: 4,
  },
  detailsGroup: {
    background: "#FFFFFF",
    border: "1px solid var(--color-divider-card)",
    borderRadius: 8,
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  groupHeading: {
    fontFamily: "var(--font-sans)",
    fontSize: 15,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    margin: 0,
  },
  groupDivider: {
    height: 1,
    background: "var(--color-border-tab)",
    width: "100%",
  },
  subSection: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  subHeader: {
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 700,
    color: "var(--color-text-medium)",
    margin: 0,
  },
  chipFlow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  chip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    height: 32,
    padding: "0 12px",
    borderRadius: 999,
    background: "var(--pill-bg)",
    fontFamily: '"Mulish", sans-serif',
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text-deep)",
    whiteSpace: "nowrap",
  },
  chipLabel: {
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text-deep)",
  },
  chipIcon: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  chipCountBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 22,
    height: 18,
    padding: "0 6px",
    borderRadius: 999,
    background: "#E8ECFF",
    color: "#245BFF",
    fontFamily: '"Mulish", sans-serif',
    fontSize: 12,
    fontWeight: 700,
  },
  chipPercentBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 32,
    height: 18,
    padding: "0 6px",
    borderRadius: 999,
    background: "var(--color-primary-alpha-08)",
    color: "var(--color-text-medium)",
    fontFamily: '"Mulish", sans-serif',
    fontSize: 12,
    fontWeight: 700,
  },
  chipAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    display: "inline-grid",
    placeItems: "center",
    color: "#FFFFFF",
    fontFamily: '"Mulish", sans-serif',
    fontSize: 11,
    fontWeight: 700,
    flexShrink: 0,
  },
};

const pcStyles = {
  title: {
    fontFamily: "var(--font-sans)",
    fontSize: 16,
    fontWeight: 700,
    color: "var(--do-ink)",
    margin: 0,
  },
  subtitle: {
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 400,
    color: "var(--color-text-tertiary)",
    margin: "4px 0 16px",
  },
  table: { marginTop: 16 },
  headerRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "8px 0",
    borderBottom: "1px solid var(--table-header-border)",
  },
  headerCell: {
    flex: 1,
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text-medium)",
    display: "inline-flex",
    alignItems: "center",
  },
  bodyRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 0",
    borderBottom: "1px solid var(--table-row-border)",
  },
  bodyCell: {
    flex: 1,
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    fontWeight: 500,
    color: "var(--color-text-medium)",
    display: "inline-flex",
    alignItems: "center",
  },
  faIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    background: "var(--color-icon-tertiary-bg)",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "2px 8px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 700,
  },
  placeholder: {
    padding: "32px 0",
    textAlign: "center",
  },
};

const icStyles = {
  title: {
    fontFamily: "var(--font-sans)",
    fontSize: 16,
    fontWeight: 700,
    color: "var(--do-ink)",
    margin: 0,
  },
  subtitle: {
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 400,
    color: "var(--color-text-tertiary)",
    margin: "4px 0 0",
  },
  emptyWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "40px 0",
    gap: 8,
  },
  emptyHeading: {
    fontFamily: "var(--font-sans)",
    fontSize: 16,
    fontWeight: 700,
    color: "var(--do-ink)",
    margin: 0,
  },
  emptyBody: {
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    fontWeight: 400,
    color: "var(--color-text-tertiary)",
    margin: 0,
    maxWidth: 400,
  },
  filterRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    marginBottom: 12,
  },
  dropdown: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 12px",
    borderRadius: 8,
    border: "1px solid var(--color-divider-card)",
    background: "#FFFFFF",
    fontFamily: '"Mulish", sans-serif',
    fontSize: 13,
    fontWeight: 500,
    color: "var(--color-text-medium)",
    cursor: "pointer",
  },
  table: { },
  headerRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "8px 0",
    borderBottom: "1px solid var(--table-header-border)",
  },
  headerCell: {
    flex: 1,
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text-medium)",
  },
  bodyRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 0",
    borderBottom: "1px solid var(--table-row-border)",
  },
  bodyCell: {
    flex: 1,
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    fontWeight: 500,
    color: "var(--color-text-medium)",
    display: "inline-flex",
    alignItems: "center",
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: 700,
    flexShrink: 0,
  },
  pagination: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 8,
  },
  totalLabel: {
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
  },
  pageControls: {
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  pageInfo: {
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 500,
    color: "var(--color-text-medium)",
    padding: "0 8px",
  },
};

const tlStyles = {
  title: {
    fontFamily: "var(--font-sans)",
    fontSize: 16,
    fontWeight: 700,
    color: "var(--do-ink)",
    margin: 0,
  },
  subtitle: {
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 400,
    color: "var(--color-text-tertiary)",
    margin: "4px 0 16px",
  },
  list: {
    display: "flex",
    flexDirection: "column",
  },
  event: {
    display: "flex",
    gap: 16,
  },
  rail: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: 12,
    flexShrink: 0,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flexShrink: 0,
    marginTop: 4,
  },
  line: {
    width: 2,
    flex: 1,
    background: "var(--grey-300)",
    minHeight: 24,
  },
  body: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    paddingBottom: 20,
  },
  date: {
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    fontWeight: 400,
    color: "var(--color-text-tertiary)",
  },
  evtTitle: {
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    fontWeight: 700,
    color: "var(--do-ink)",
  },
  evtDesc: {
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 400,
    color: "var(--color-text-tertiary)",
    lineHeight: 1.4,
  },
};

