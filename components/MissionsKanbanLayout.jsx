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

export default function MissionsKanbanLayout({ missions, onCreateMission }) {
  const [query, setQuery] = React.useState("");
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
  // (lowest first — surfaces "who needs attention" at the top).
  const grouped = React.useMemo(() => {
    const out = { draft: [], active: [], at_risk: [], completed: [] };
    for (const m of filtered) {
      const lane = laneOf(m);
      if (out[lane]) out[lane].push(m);
    }
    for (const id of Object.keys(out)) {
      out[id].sort((a, b) => (a.progress ?? 0) - (b.progress ?? 0));
    }
    return out;
  }, [filtered]);

  const visibleLanes = LANES.filter((l) => grouped[l.id].length > 0);

  const selected = React.useMemo(
    () => missions.find((m) => m.id === openId) || null,
    [missions, openId],
  );

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
            primaryAction={{
              label: "Mission",
              icon: <Plus size={16} />,
              onClick: onCreateMission,
            }}
            search={{ value: query, onChange: setQuery, placeholder: "Search missions" }}
            filters={[
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
                openId={openId}
                onOpenMission={setOpenId}
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
                <MissionDetailContent mission={displayMission} compact />
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

function Lane({ lane, missions, openId, onOpenMission }) {
  const isDraft = lane.id === "draft";
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
            />
          ),
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
