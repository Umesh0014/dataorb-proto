"use client";

import React from "react";
import { Milestone, X, AlertTriangle, Info } from "lucide-react";

// MILESTONES — the Performance score's milestone story, shown in the side
// rail's info popover. M0 is the current baseline, M1 the target, M2 a
// placeholder. Meta-tooling — not coupled to any global milestone overlay.
const MILESTONES = [
  {
    id: "M0",
    name: "Basic",
    badgeColor: "#3B82F6",
    current: true,
    summary: "Next best action strip only.",
    detail:
      'The score itself is not yet shown — only the surfaced "next best action" for the role (agent: assignment from team lead; team lead: top coaching/assignment queue item).',
  },
  {
    id: "M1",
    name: "Target",
    badgeColor: "#F59E0B",
    summary: "Performance score + next best action.",
    detail:
      "The composite score lands alongside the next-best-action strip, giving an at-a-glance readiness read.",
    blockers: [
      {
        lead: "Compound score weighting is opaque.",
        rest: " As a user, I don't know whether the production version of the agent score or the training version is weighted more in the composite.",
      },
      {
        lead: "Time-to-proficiency not surfaced.",
        rest: " As a team leader, I cannot see the overall progress / time-to-proficiency for this agent.",
      },
      {
        lead: "Calculation method undefined.",
        rest: " As a team leader, I don't know how the score is calculated — the base-level algorithm is yet to be defined.",
      },
    ],
  },
  // TODO: M2 content is a placeholder — finalise when Mission V2 scope
  // lands (see 13-open-questions.md).
  {
    id: "M2",
    name: "Future",
    badgeColor: "#8B5CF6",
    summary: "TBD.",
    detail:
      "Enhancements beyond M1 to be defined. Likely candidates: time-to-proficiency trend, multi-agent comparison view.",
  },
];

// MILESTONE_BUTTONS — the rail's state switcher. M2 is disabled until its
// content is defined (see 13-open-questions.md).
const MILESTONE_BUTTONS = [
  { id: "m0", label: "M0", title: "Basic — NBA only" },
  { id: "m1", label: "M1", title: "Target — Score + NBA" },
  { id: "m2", label: "M2", title: "TBD — see info for blockers", disabled: true },
];

// MilestoneSideRail — a dark vertical rail beside the Performance score
// card. The M0/M1/M2 buttons switch what the card renders (via `value` /
// `onChange`); the info button opens the milestone documentation popover.
// Meta-tooling: deliberately outside the card, not product chrome.
export default function MilestoneSideRail({ value, onChange }) {
  const [infoOpen, setInfoOpen] = React.useState(false);
  const [shown, setShown] = React.useState(false);
  const [blockersOpen, setBlockersOpen] = React.useState(true);
  const [anchor, setAnchor] = React.useState(null);
  const [hovered, setHovered] = React.useState(null);
  const wrapRef = React.useRef(null);
  const infoRef = React.useRef(null);

  React.useEffect(() => {
    if (!infoOpen) return undefined;
    // Fade the popover in on the frame after mount.
    const raf = requestAnimationFrame(() => setShown(true));
    const onPointerDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setInfoOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setInfoOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [infoOpen]);

  const toggleInfo = () => {
    if (!infoOpen) {
      // Anchor the popover to the LEFT of the info icon (over the card).
      const r = infoRef.current.getBoundingClientRect();
      setAnchor({ top: r.top, right: window.innerWidth - r.left + 8 });
      setBlockersOpen(true);
      setShown(false);
    }
    setInfoOpen((o) => !o);
  };

  return (
    <div ref={wrapRef} style={railStyles.rail}>
      <span style={railStyles.railLabel}>M</span>
      <span style={railStyles.railDivider} />
      <div style={railStyles.btnGroup}>
        {MILESTONE_BUTTONS.map((b) => (
          <button
            key={b.id}
            type="button"
            title={b.title}
            aria-pressed={value === b.id}
            disabled={b.disabled}
            onClick={() => onChange(b.id)}
            onMouseEnter={() => setHovered(b.id)}
            onMouseLeave={() => setHovered(null)}
            style={railBtnStyle(value === b.id, hovered === b.id, b.disabled)}
          >
            {b.label}
          </button>
        ))}
      </div>
      <button
        ref={infoRef}
        type="button"
        aria-label="Milestone details"
        aria-expanded={infoOpen}
        onClick={toggleInfo}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "#E5E5E5";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "#737373";
        }}
        style={railStyles.infoBtn}
      >
        <Info size={14} />
      </button>
      {infoOpen && anchor && (
        <MilestonePopover
          anchor={anchor}
          shown={shown}
          blockersOpen={blockersOpen}
          onToggleBlockers={() => setBlockersOpen((b) => !b)}
          onClose={() => setInfoOpen(false)}
        />
      )}
    </div>
  );
}

// railBtnStyle — per-state style for an M0/M1/M2 switcher button.
function railBtnStyle(active, isHover, disabled) {
  if (disabled) {
    return {
      ...railStyles.btn,
      background: "#171717",
      color: "#525252",
      border: "1px dashed #262626",
      cursor: "not-allowed",
    };
  }
  if (active) {
    return { ...railStyles.btn, background: "#FDE047", color: "#171717", border: "none" };
  }
  if (isHover) {
    return { ...railStyles.btn, background: "#404040", color: "#F5F5F5", border: "1px solid #525252" };
  }
  return { ...railStyles.btn, background: "#262626", color: "#D4D4D4", border: "1px solid #404040" };
}

// MilestonePopover — 320px dark popover, fixed-positioned left of the rail
// info button. Documents the milestones and the M1 blockers.
function MilestonePopover({ anchor, shown, blockersOpen, onToggleBlockers, onClose }) {
  return (
    <div
      role="dialog"
      aria-label="Milestone progress — Performance score"
      style={{
        ...milestoneStyles.popover,
        top: anchor.top,
        right: anchor.right,
        opacity: shown ? 1 : 0,
      }}
    >
      <div style={milestoneStyles.popHeader}>
        <span style={milestoneStyles.popHeaderLabel}>
          <Milestone size={14} />
          Milestones — Performance score
        </span>
        <button
          type="button"
          aria-label="Close milestone details"
          onClick={onClose}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#E5E5E5";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#737373";
          }}
          style={milestoneStyles.popClose}
        >
          <X size={14} />
        </button>
      </div>

      <div style={milestoneStyles.rows}>
        {MILESTONES.map((m) => (
          <MilestoneRow
            key={m.id}
            milestone={m}
            blockersOpen={blockersOpen}
            onToggleBlockers={onToggleBlockers}
          />
        ))}
      </div>

      <div style={milestoneStyles.footer}>
        Inline view. See the global Milestone Overlay (bottom-right) for
        cross-component view.
      </div>
    </div>
  );
}

// MilestoneRow — one milestone: colored badge + title + description. The
// M1 row also renders its expandable blocker list (expanded by default).
function MilestoneRow({ milestone, blockersOpen, onToggleBlockers }) {
  const { id, name, badgeColor, current, summary, detail, blockers } = milestone;
  return (
    <div style={milestoneStyles.row}>
      <div style={milestoneStyles.badgeCol}>
        <span style={{ ...milestoneStyles.badge, background: badgeColor }}>{id}</span>
        {current && (
          <span style={milestoneStyles.currentDot} title="Current milestone" />
        )}
      </div>
      <div style={milestoneStyles.rowContent}>
        <span style={milestoneStyles.rowTitle}>{name}</span>
        <span style={milestoneStyles.rowSummary}>{summary}</span>
        <span style={milestoneStyles.rowDetail}>{detail}</span>
        {blockers && (
          <div style={milestoneStyles.blockers}>
            <button
              type="button"
              aria-expanded={blockersOpen}
              onClick={onToggleBlockers}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = "underline";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = "none";
              }}
              style={milestoneStyles.blockerToggle}
            >
              {blockersOpen ? "▼" : "▶"} Blockers ({blockers.length})
            </button>
            {blockersOpen && (
              <div style={milestoneStyles.blockerList}>
                {blockers.map((b) => (
                  <div key={b.lead} style={milestoneStyles.blockerRow}>
                    <AlertTriangle size={12} style={milestoneStyles.blockerIcon} />
                    <span style={milestoneStyles.blockerText}>
                      <strong style={milestoneStyles.blockerLead}>{b.lead}</strong>
                      {b.rest}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const railStyles = {
  rail: {
    position: "relative",
    flexShrink: 0,
    width: 48,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    padding: "8px 0",
    background: "#171717",
    border: "1px solid #404040",
    borderRadius: 10,
    boxShadow: "0 12px 32px rgba(0, 0, 0, 0.4)",
  },
  railLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.12em",
    color: "#737373",
  },
  railDivider: {
    width: 24,
    height: 1,
    background: "#262626",
  },
  btnGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  btn: {
    width: 36,
    height: 36,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    borderRadius: 6,
    fontFamily: "var(--font-mono)",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    transition: "background 120ms ease, color 120ms ease, border-color 120ms ease",
  },
  infoBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 28,
    height: 28,
    padding: 0,
    border: "none",
    background: "transparent",
    borderRadius: 6,
    cursor: "pointer",
    color: "#737373",
    transition: "color 120ms ease",
  },
};

// Meta-tooling popover styles — dark palette with literal hex, kept out of
// the product design tokens: dev/review tooling, not product chrome.
const milestoneStyles = {
  popover: {
    position: "fixed",
    zIndex: 1000,
    width: 320,
    padding: 16,
    background: "#171717",
    border: "1px solid #404040",
    borderRadius: 10,
    boxShadow: "0 16px 40px rgba(0, 0, 0, 0.5)",
    color: "#F5F5F5",
    transition: "opacity 100ms ease",
  },
  popHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 14,
  },
  popHeaderLabel: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.07em",
    textTransform: "uppercase",
    color: "#E5E5E5",
  },
  popClose: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 22,
    height: 22,
    padding: 0,
    border: "none",
    background: "transparent",
    borderRadius: 4,
    cursor: "pointer",
    color: "#737373",
    flexShrink: 0,
    transition: "color 120ms ease",
  },
  rows: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  row: {
    display: "flex",
    gap: 12,
  },
  badgeCol: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 5,
    flexShrink: 0,
  },
  badge: {
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    fontWeight: 700,
    color: "#FFFFFF",
    padding: "2px 6px",
    borderRadius: 4,
    letterSpacing: "0.03em",
  },
  currentDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#FDE047",
  },
  rowContent: {
    display: "flex",
    flexDirection: "column",
    gap: 3,
    minWidth: 0,
  },
  rowTitle: {
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    fontWeight: 600,
    color: "#F5F5F5",
    lineHeight: 1.3,
  },
  rowSummary: {
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    fontWeight: 500,
    color: "#D4D4D4",
    lineHeight: 1.45,
  },
  rowDetail: {
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    fontWeight: 400,
    color: "#A3A3A3",
    lineHeight: 1.55,
  },
  blockers: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginTop: 8,
  },
  blockerToggle: {
    alignSelf: "flex-start",
    padding: 0,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.02em",
    color: "#FDE047",
  },
  blockerList: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  blockerRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 7,
  },
  blockerIcon: {
    flexShrink: 0,
    marginTop: 1,
    color: "#FBBF24",
  },
  blockerText: {
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    fontWeight: 400,
    color: "#E5E5E5",
    lineHeight: 1.55,
  },
  blockerLead: {
    fontWeight: 700,
    color: "#F5F5F5",
  },
  footer: {
    marginTop: 14,
    paddingTop: 10,
    borderTop: "1px solid #404040",
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    color: "#737373",
    lineHeight: 1.5,
  },
};
