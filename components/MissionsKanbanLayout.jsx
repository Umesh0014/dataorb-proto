"use client";

import React from "react";
import { Plus, ArrowDownNarrowWide, X, FileClock, CheckCircle2 } from "lucide-react";
import PageHeader from "./PageHeader";
import { MissionsIcon } from "./SideNav/icons";
import MissionCardCompact, { missionStatusAffordance } from "./MissionCardCompact";
import KanbanDraftCard, { resolveDraftState } from "./KanbanDraftCard";
import MissionDetailContent from "./MissionDetailContent";
import KanbanDraftDetail from "./KanbanDraftDetail";
import InlineStatusAffordance from "./InlineStatusAffordance";
import KebabMenu from "./KebabMenu";
import Modal from "./Modal";
import Toast from "./Toast";
import Button from "./Button";
import { isTeamViewer } from "./lib/currentUser";

// MissionsKanbanLayout — Option 3. Urgency-first swimlanes (Active / At
// Risk / Ending Soon / Completed) derived directly from state + daysLeft,
// a global KPI strip, cross-lane search, a per-lane sort control, and an
// in-place side curtain that hosts the shared MissionDetailContent without
// leaving the board (the board reflows to make room — no navigation, no
// scrim).

const LANES = [
  { id: "draft", label: "Draft" },
  { id: "active", label: "Active" },
  { id: "at_risk", label: "At Risk" },
  { id: "completed", label: "Completed" },
];

// Agent persona lane order — Draft dropped (agents don't see in-flight
// authoring) and Upcoming promoted from a sub-section (Team Leader's
// Part B pattern) to its own top-level column. Part E §E3. Same shape
// is reused by Team Leader's M1 variant (Part F §F4) — Upcoming as own
// column, Draft silently hidden.
const AGENT_LANES = [
  { id: "upcoming",  label: "Upcoming" },
  { id: "active",    label: "Active" },
  { id: "at_risk",   label: "At Risk" },
  { id: "completed", label: "Completed" },
];

// laneOf — mutually exclusive, evaluated top to bottom. Derived from state
// + daysLeft directly (NOT the display-status enum), per spec. Drafts and
// completed short-circuit; running missions split on daysLeft. Iteration 6
// merged the prior Ending Soon (3–14d) bucket into At Risk; the card-level
// status affordance still carries the fine-grained urgency tone.
function laneOf(m) {
  if (m.state === "draft") return "draft";
  if (m.state === "completed") return "completed";
  const d = m.daysLeft;
  if (d == null) return "active";
  if (d <= 14) return "at_risk"; // includes ends-today (0) + 1–2 day + 3–14
  return "active";
}

function matchesSearch(m, q) {
  if (!q) return true;
  const hay = `${m.name} ${m.description || ""} ${(m.tags || []).join(" ")}`.toLowerCase();
  return hay.includes(q.toLowerCase());
}

export default function MissionsKanbanLayout({
  missions,
  upcomingMissions = [],
  onCreateMission,
  persona = "Team Lead",
  variant = "M2",
}) {
  const [query, setQuery] = React.useState("");
  const isAgent = persona === "Agent";
  // M1 variant (Team Leader only, Part F §F4) reuses the Agent lane
  // shape — Upcoming as its own column, Draft hidden. The variant prop
  // is only meaningful for Team Leader; Agent ignores it.
  const useUpcomingColumn = isAgent || variant === "M1";
  // Role gate — Upcoming sub-section (Part B) is the Team Leader M2
  // pattern only. Agent and M1 promote Upcoming to a top-level column.
  const showUpcomingSubsection = isTeamViewer() && !isAgent && variant === "M2";
  // Earliest start first; cap to first 5 by default (spec §B5 + §B7 #4).
  const upcomingSorted = React.useMemo(
    () => [...upcomingMissions]
      .filter((m) => m.startDate)
      .sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [upcomingMissions],
  );
  const [openId, setOpenId] = React.useState(null);
  // Delete-draft flow: deletedDraftIds filters cards out of the Draft lane,
  // deleteTarget drives the confirmation modal, and toast carries the Undo
  // action plus its own auto-dismiss timer handle so Undo can cancel it.
  const [deletedDraftIds, setDeletedDraftIds] = React.useState(() => new Set());
  const [deleteTarget, setDeleteTarget] = React.useState(null);
  const [toast, setToast] = React.useState(null);

  // Cancel the auto-dismiss timer when the toast is replaced or unmounted.
  React.useEffect(() => () => { if (toast?.timer) clearTimeout(toast.timer); }, [toast]);

  const filtered = React.useMemo(
    () => missions.filter((m) => matchesSearch(m, query) && !deletedDraftIds.has(m.id)),
    [missions, query, deletedDraftIds],
  );

  // Group into lanes, then sort each lane by % target met ascending
  // (lowest first — surfaces "who needs attention" at the top). When
  // Upcoming is its own column (Agent persona OR Team Leader M1
  // variant), also bucket the upcomingMissions into their own
  // "upcoming" lane (Part E §E3 / Part F §F4).
  const grouped = React.useMemo(() => {
    const out = { draft: [], active: [], at_risk: [], completed: [], upcoming: [] };
    for (const m of filtered) {
      const lane = laneOf(m);
      if (out[lane]) out[lane].push(m);
    }
    if (useUpcomingColumn) {
      out.upcoming = upcomingSorted;
    }
    for (const id of Object.keys(out)) {
      out[id].sort((a, b) => (a.progress ?? 0) - (b.progress ?? 0));
    }
    return out;
  }, [filtered, useUpcomingColumn, upcomingSorted]);

  const lanesForView = useUpcomingColumn ? AGENT_LANES : LANES;
  const visibleLanes = lanesForView.filter((l) => grouped[l.id].length > 0);

  // Curtain-lookup pool covers every clickable card on the board —
  // including Upcoming sub-section cards that don't live in `missions`
  // (Part D2 — universal curtain across all swimlanes).
  const selected = React.useMemo(() => {
    const inLanes = missions.find((m) => m.id === openId);
    if (inLanes) return inLanes;
    return upcomingMissions.find((m) => m.id === openId) || null;
  }, [missions, upcomingMissions, openId]);

  // Keep the last-opened mission mounted through the close animation so the
  // curtain slides out with its content intact rather than blanking first.
  const [displayMission, setDisplayMission] = React.useState(null);
  React.useEffect(() => {
    if (selected) setDisplayMission(selected);
  }, [selected]);

  // Esc closes the curtain.
  React.useEffect(() => {
    if (!openId) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setOpenId(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openId]);

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeletedDraftIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setDeleteTarget(null);
    setOpenId(null);
    const timer = setTimeout(() => setToast(null), 5000);
    setToast({ missionId: id, timer });
  };

  const handleUndo = () => {
    if (!toast) return;
    clearTimeout(toast.timer);
    setDeletedDraftIds((prev) => {
      const next = new Set(prev);
      next.delete(toast.missionId);
      return next;
    });
    setToast(null);
  };

  const handleToastDismiss = () => {
    if (toast?.timer) clearTimeout(toast.timer);
    setToast(null);
  };

  return (
    <div style={layoutStyles.shell}>
      <div style={layoutStyles.boardWrap}>
        <div style={layoutStyles.content}>
          <PageHeader
            identifier={{
              icon: <MissionsIcon size={18} color="#245BFF" />,
              label: "Missions",
              withDropdown: true,
              onClick: () => {},
            }}
            // Agent persona drops authoring chrome (Part E §E3): no
            // "+ Mission" CTA, no Team / Created Date filters (agent
            // only sees their own missions, so cohort filters don't
            // apply). Search stays.
            primaryAction={isAgent ? undefined : {
              label: "Mission",
              icon: <Plus size={16} />,
              onClick: onCreateMission,
            }}
            search={{ value: query, onChange: setQuery, placeholder: "Search missions" }}
            filters={isAgent ? [] : [
              { id: "team", label: "Team", value: "All", onClick: () => {} },
              { id: "created", label: "Created Date", value: "Last 7 days", onClick: () => {} },
            ]}
          />

          <div style={layoutStyles.board}>
            {visibleLanes.map((lane) => (
              <Lane
                key={lane.id}
                lane={lane}
                missions={grouped[lane.id]}
                upcoming={lane.id === "active" && showUpcomingSubsection ? upcomingSorted : null}
                openId={openId}
                onOpenMission={setOpenId}
                hideAgentCount={isAgent}
              />
            ))}
          </div>
        </div>
      </div>

      <aside
        style={{
          ...layoutStyles.curtain,
          transform: openId ? "translateX(0)" : "translateX(100%)",
          transition: `transform 200ms ${openId ? "ease-out" : "ease-in"}`,
          boxShadow: openId ? "-4px 0 16px rgba(0, 0, 0, 0.06)" : "none",
        }}
        aria-hidden={!openId}
      >
        {displayMission && (
          <>
            <CurtainHeader
              mission={displayMission}
              onClose={() => setOpenId(null)}
              onDeleteDraft={() => setDeleteTarget(displayMission)}
            />
            <div style={layoutStyles.curtainBody}>
              {displayMission.state === "draft" ? (
                <KanbanDraftDetail mission={displayMission} />
              ) : (
                <MissionDetailContent mission={displayMission} persona={persona} compact />
              )}
            </div>
          </>
        )}
      </aside>

      <Modal
        open={!!deleteTarget}
        onDismiss={() => setDeleteTarget(null)}
        title="Delete this draft?"
        body={
          deleteTarget
            ? `"${deleteTarget.name || "Untitled draft"}" will be removed from your drafts. You can undo this for 5 seconds.`
            : null
        }
        confirmLabel="Delete"
        confirmTone="danger"
        onConfirm={handleConfirmDelete}
      />

      {toast && (
        <Toast
          tone="info"
          message="Draft deleted"
          action={{ label: "Undo", onClick: handleUndo }}
          onDismiss={handleToastDismiss}
        />
      )}
    </div>
  );
}

// UpcomingSubSection — sticks inside the Active swimlane below the
// running cards. Sub-divider matches the column header type ramp at a
// smaller size + reuses the same count pill. Card variant comes from
// MissionCardCompact's upcoming branch (no progress bar + "Starts in
// N days" footer line) — no fork.
//
// `maxCardsInUpcoming` caps the visible card count (Part D1). Demo
// default = 1 so the upcoming UX-sync screenshot stays compact. The
// header pill always reflects items.length (the real total); cards
// beyond the cap surface via an inline "+ N more" link that expands
// the rest in place (no modal / route nav — spec §D5 #5 default).
function UpcomingSubSection({ items, maxCardsInUpcoming = 1, openId, onOpenMission }) {
  const [showAll, setShowAll] = React.useState(false);
  const visible = showAll ? items : items.slice(0, maxCardsInUpcoming);
  const overflow = items.length - visible.length;
  return (
    <div style={layoutStyles.upcomingWrap}>
      <div style={layoutStyles.upcomingDivider}>
        <div style={layoutStyles.upcomingDividerLeft}>
          <span style={layoutStyles.upcomingTitle}>Upcoming</span>
          <span style={layoutStyles.countPill}>{items.length}</span>
        </div>
      </div>
      {visible.map((m) => (
        <MissionCardCompact
          key={m.id}
          mission={m}
          selected={openId === m.id}
          onClick={() => onOpenMission(m.id)}
        />
      ))}
      {overflow > 0 && (
        <button type="button" onClick={() => setShowAll(true)} style={layoutStyles.showAllBtn}>
          + {overflow} more
        </button>
      )}
    </div>
  );
}

function Lane({ lane, missions, upcoming, openId, onOpenMission, hideAgentCount = false }) {
  const isDraft = lane.id === "draft";
  // Upcoming sub-section (active lane, team viewer only, k > 0). Hide
  // the divider entirely when empty per spec §B7 #6. Cap collapsed at
  // 5 with a "Show all" toggle per §B5 / §B7 #4.
  return (
    <section style={layoutStyles.lane} className="kanbanLane">
      <div style={layoutStyles.laneHeader}>
        <div style={layoutStyles.laneHeaderLeft}>
          <span style={layoutStyles.laneTitle}>{lane.label}</span>
          <span style={layoutStyles.countPill}>{missions.length}</span>
        </div>
        {/* No sort in Draft (no % target met) or Completed (uniformly 100%). */}
        {lane.id !== "completed" && lane.id !== "draft" && <SortControl />}
      </div>
      <div style={layoutStyles.laneScroll} className="kanbanLaneScroll">
        {missions.map((m) =>
          isDraft ? (
            <KanbanDraftCard
              key={m.id}
              mission={m}
              selected={openId === m.id}
              onClick={() => onOpenMission(m.id)}
            />
          ) : (
            <MissionCardCompact
              key={m.id}
              mission={m}
              selected={openId === m.id}
              onClick={() => onOpenMission(m.id)}
              hideAgentCount={hideAgentCount}
            />
          ),
        )}

        {upcoming && upcoming.length > 0 && (
          <UpcomingSubSection items={upcoming} openId={openId} onOpenMission={onOpenMission} />
        )}
      </div>
    </section>
  );
}

// SortControl — V1 ships a single sort key (% target met, ascending). The
// control still renders as a dropdown so additional keys can land in V1.1
// without restructuring the lane header.
function SortControl() {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={sortStyles.wrap}>
      <Button
        variant="icon"
        size="sm"
        aria-label="Sort: % target met (ascending)"
        title="Sort: % target met (ascending)"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        style={{ background: open ? "var(--pill-bg)" : undefined }}
      >
        <ArrowDownNarrowWide size={16} color="var(--color-text-medium)" />
      </Button>
      {open && (
        <>
          <div style={sortStyles.scrim} onClick={() => setOpen(false)} aria-hidden="true" />
          <div role="menu" style={sortStyles.menu}>
            <button
              type="button"
              role="menuitemradio"
              aria-checked="true"
              style={sortStyles.item}
              onClick={() => setOpen(false)}
            >
              % target met
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function CurtainHeader({ mission, onClose, onDeleteDraft }) {
  const isDraft = mission.state === "draft";
  const completed = mission.state === "completed";

  // Draft status + kebab are derived from setupChecklist completion, not
  // the days-left signals that drive missionStatusAffordance for running
  // and completed missions.
  let status;
  let items;
  let title;

  if (isDraft) {
    const { state: draftState } = resolveDraftState(mission);
    title = mission.name && mission.name.trim() ? mission.name : "Untitled draft";
    status =
      draftState === "complete"
        ? { tone: "success", icon: <CheckCircle2 size={14} />, label: "Ready to publish" }
        : { tone: "warning", icon: <FileClock size={14} />, label: "Draft" };
    items = [
      { label: "Delete draft", onClick: () => onDeleteDraft?.() },
    ];
  } else {
    title = mission.name;
    status = missionStatusAffordance(mission);
    items = completed
      ? [
          { label: "Duplicate mission", onClick: () => console.log("duplicate mission") },
          { label: "Delete mission", onClick: () => console.log("delete mission") },
        ]
      : [
          { label: "Edit mission", onClick: () => console.log("edit mission") },
          { label: "Duplicate mission", onClick: () => console.log("duplicate mission") },
          { label: "Close mission", onClick: () => console.log("close mission") },
          { label: "Delete mission", onClick: () => console.log("delete mission") },
        ];
  }

  return (
    <div style={curtainHeaderStyles.wrap}>
      <div style={curtainHeaderStyles.topRow}>
        <h2 style={curtainHeaderStyles.title}>{title}</h2>
        <div style={curtainHeaderStyles.actions}>
          <InlineStatusAffordance tone={status.tone} icon={status.icon} size="md">
            {status.label}
          </InlineStatusAffordance>
          <KebabMenu ariaLabel="Mission actions" items={items} />
          <Button variant="icon" size="sm" aria-label="Close" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>
      </div>
      {mission.description && <p style={curtainHeaderStyles.desc}>{mission.description}</p>}
    </div>
  );
}

const layoutStyles = {
  shell: {
    marginLeft: "var(--sidenav-width)",
    minHeight: "100vh",
    height: "100vh",
    background: "var(--surface-canvas)",
    display: "flex",
    flexDirection: "row",
    boxSizing: "border-box",
    overflow: "hidden",
  },
  boardWrap: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    paddingTop: "var(--page-padding-top)",
    paddingBottom: "var(--page-padding-bottom)",
    paddingInline: "var(--page-gutter)",
    boxSizing: "border-box",
    overflow: "hidden",
  },
  content: {
    maxWidth: 1440,
    marginInline: "auto",
    width: "100%",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 20,
    minHeight: 0,
  },
  board: {
    flex: 1,
    minHeight: 0,
    display: "flex",
    flexDirection: "row",
    gap: 16,
    alignItems: "stretch",
  },
  lane: {
    flex: 1,
    minWidth: 0,
    background: "var(--color-card-emoji-bg)",
    borderRadius: 12,
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    minHeight: 0,
  },
  laneHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    flexShrink: 0,
    paddingBottom: 12,
    boxShadow: "0 1px 0 var(--color-divider-card)",
  },
  laneHeaderLeft: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    minWidth: 0,
  },
  laneTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "var(--color-text-deep)",
  },
  countPill: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2px 8px",
    borderRadius: 10,
    background: "#FFFFFF",
    border: "1px solid var(--color-divider-card)",
    fontSize: 13,
    fontWeight: 500,
    color: "var(--color-text-medium)",
    lineHeight: 1.2,
  },
  laneScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    paddingRight: 4,
  },
  curtain: {
    position: "fixed",
    top: 0,
    right: 0,
    width: "40vw",
    height: "100vh",
    zIndex: 40,
    boxSizing: "border-box",
    background: "#FFFFFF",
    borderLeft: "1px solid var(--color-divider-card)",
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
  },
  curtainBody: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    padding: 24,
  },

  // Upcoming sub-section (active lane only, team viewer role)
  upcomingWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    paddingTop: 16,
    marginTop: 4,
  },
  upcomingDivider: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 8,
    borderTop: "1px solid var(--color-border-card-soft)",
    paddingTop: 12,
  },
  upcomingDividerLeft: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  },
  upcomingTitle: {
    fontFamily: "var(--font-sans)",
    fontSize: 13, fontWeight: 600, letterSpacing: "0.1px",
    color: "var(--color-text-tertiary)",
    textTransform: "uppercase",
  },
  showAllBtn: {
    alignSelf: "flex-start",
    appearance: "none", border: "none", background: "transparent",
    padding: "4px 0",
    cursor: "pointer",
    fontFamily: "var(--font-sans)",
    fontSize: 13, fontWeight: 500, letterSpacing: "0.1px",
    color: "var(--do-brand-blue)",
  },
};

const sortStyles = {
  wrap: {
    position: "relative",
    flexShrink: 0,
  },
  scrim: {
    position: "fixed",
    inset: 0,
    zIndex: 39,
  },
  menu: {
    position: "absolute",
    top: "calc(100% + 4px)",
    right: 0,
    minWidth: 160,
    background: "#FFFFFF",
    border: "1px solid var(--color-divider-card)",
    borderRadius: 8,
    boxShadow: "var(--shadow-8)",
    padding: "4px 0",
    zIndex: 40,
  },
  item: {
    display: "block",
    width: "100%",
    appearance: "none",
    border: "none",
    background: "var(--pill-bg)",
    textAlign: "left",
    padding: "8px 16px",
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text-deep)",
    cursor: "pointer",
  },
};

const curtainHeaderStyles = {
  wrap: {
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    padding: "20px 24px",
    borderBottom: "1px solid var(--color-divider-card)",
  },
  topRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    lineHeight: 1.3,
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  desc: {
    margin: 0,
    fontSize: 14,
    fontWeight: 400,
    color: "var(--text-secondary)",
    lineHeight: 1.5,
  },
};
