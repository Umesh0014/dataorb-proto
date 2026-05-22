"use client";

import React from "react";
import { Pencil, X, Info, Calendar, ChevronDown, ShieldCheck, Sparkles } from "lucide-react";
import Card from "./Card";
import MultiLineInput from "./MultiLineInput";
import { FOCUS_AREAS } from "./mocks/missionFocusAreas";
import { COVERAGE_DRIVERS, CONTACT_REASONS } from "./mocks/missionCoverage";
import { AGENTS } from "./mocks/missionAgents";
import { formatDate, formatDateRange } from "./formatDate";

const NAME_MAX = 80;
const DESCRIPTION_MAX = 300;
const SESSIONS_MIN = 2;
const SESSIONS_MAX = 10;
const DURATION_OPTIONS = [
  "1 Week", "2 Weeks", "3 Weeks", "4 Weeks",
  "6 Weeks", "8 Weeks", "12 Weeks",
];
// computeEndDate — start ISO + "N Weeks" → end Date (UTC). Date math only;
// rendering routes through the shared formatDate util.
function computeEndDate(startIso, durationLabel) {
  if (!startIso || !durationLabel) return null;
  const match = durationLabel.match(/(\d+)\s*Week/i);
  if (!match) return null;
  const weeks = parseInt(match[1], 10);
  const [y, m, d] = startIso.split("-").map((n) => parseInt(n, 10));
  const end = new Date(Date.UTC(y, m - 1, d));
  end.setUTCDate(end.getUTCDate() + weeks * 7);
  return end;
}

function shortName(fullName) {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length < 2) return fullName;
  return `${parts[0]} ${parts[parts.length - 1][0]}`;
}

function initials(name) {
  return name.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2);
}

function avatarColor(name) {
  const colors = ["#245BFF", "#2AC5A0", "#F5A623", "#FF6B6B", "#A78BFA", "#38BDF8"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return colors[Math.abs(h) % colors.length];
}

export default function PreviewStep({ draft, onChange, onStepChange }) {
  const [editDrawerOpen, setEditDrawerOpen] = React.useState(false);

  const drivers = draft.coverage?.drivers ?? [];
  const focusRows = draft.focusArea?.rows ?? [];
  const agentIds = draft.recruit?.agentIds ?? [];
  const recruitedAgents = AGENTS.filter((a) => agentIds.includes(a.id));

  const goToStep = (stepId) => onStepChange?.(stepId);

  return (
    <>
      <div style={pvStyles.twoCol}>
        <Card padX={24} padY={24} style={pvStyles.leftCard}>
          <div style={pvStyles.sectionHeader}>
            <span style={pvStyles.sectionTitle}>Mission Overview</span>
            <button
              type="button"
              onClick={() => setEditDrawerOpen(true)}
              aria-label="Edit mission overview"
              style={pvStyles.editBtn}
            >
              <Pencil size={16} />
            </button>
          </div>

          <ReadOnlyField label="Name" value={draft.name} />
          <ReadOnlyField label="Description" value={draft.description} multiline />
          <ReadOnlyField
            label="Duration"
            value={
              draft.startDate
                ? formatDateRange(draft.startDate, computeEndDate(draft.startDate, draft.duration))
                : ""
            }
          />
          <ReadOnlyField label="Minimum practice sessions" value={String(draft.sessions)} />
        </Card>

        <Card padX={24} padY={24} style={pvStyles.rightCard}>
          <div style={pvStyles.sectionHeader}>
            <span style={pvStyles.sectionTitle}>Additional Details</span>
          </div>

          <div style={pvStyles.subsection}>
            <div style={pvStyles.subHeader}>
              <span style={pvStyles.subTitle}>Coverage</span>
              <button
                type="button"
                onClick={() => goToStep("coverage")}
                aria-label="Edit coverage"
                style={pvStyles.editBtn}
              >
                <Pencil size={16} />
              </button>
            </div>
            <div style={pvStyles.chipFlow}>
              {drivers.map((drv) => {
                const driverDef = COVERAGE_DRIVERS.find((d) => d.id === drv.id);
                const reasonLabels = (drv.reasons || [])
                  .map((rid) => CONTACT_REASONS.find((cr) => cr.id === rid)?.label)
                  .filter(Boolean);
                return (
                  <span
                    key={drv.id}
                    style={pvStyles.previewChip}
                    title={reasonLabels.length > 0 ? reasonLabels.join(", ") : "No contact reasons"}
                  >
                    <span>{driverDef?.label ?? drv.id}</span>
                    <Info size={14} style={pvStyles.chipInfo} />
                  </span>
                );
              })}
              {drivers.length === 0 && (
                <span style={pvStyles.emptyText}>No drivers selected</span>
              )}
            </div>
          </div>

          <div style={pvStyles.subsection}>
            <div style={pvStyles.subHeader}>
              <span style={pvStyles.subTitle}>Focus Areas</span>
              <button
                type="button"
                onClick={() => goToStep("focus")}
                aria-label="Edit focus areas"
                style={pvStyles.editBtn}
              >
                <Pencil size={16} />
              </button>
            </div>
            <div style={pvStyles.chipFlow}>
              {focusRows.filter((r) => r.focusAreaId).map((row) => {
                const fa = FOCUS_AREAS.find((f) => f.id === row.focusAreaId);
                if (!fa) return null;
                const TypeIcon = fa.type === "qualitative" ? Sparkles : ShieldCheck;
                return (
                  <span key={row.id} style={pvStyles.previewChip} title={fa.label}>
                    <TypeIcon size={14} style={pvStyles.typeIcon} />
                    <span>{fa.label}</span>
                    <span style={pvStyles.targetBadge}>{row.target}%</span>
                    <Info size={14} style={pvStyles.chipInfo} />
                  </span>
                );
              })}
              {focusRows.filter((r) => r.focusAreaId).length === 0 && (
                <span style={pvStyles.emptyText}>No focus areas selected</span>
              )}
            </div>
          </div>

          <div style={pvStyles.subsection}>
            <div style={pvStyles.subHeader}>
              <span style={pvStyles.subTitle}>Recruited Agents</span>
              <button
                type="button"
                onClick={() => goToStep("recruit")}
                aria-label="Edit recruited agents"
                style={pvStyles.editBtn}
              >
                <Pencil size={16} />
              </button>
            </div>
            <div style={pvStyles.chipFlow}>
              {recruitedAgents.map((agent) => (
                <span
                  key={agent.id}
                  style={pvStyles.previewChip}
                  title={`${agent.name} — ${agent.team}`}
                >
                  <span
                    style={{
                      ...pvStyles.miniAvatar,
                      background: avatarColor(agent.name),
                    }}
                  >
                    {initials(agent.name)}
                  </span>
                  <span>{shortName(agent.name)}</span>
                  <Info size={14} style={pvStyles.chipInfo} />
                </span>
              ))}
              {recruitedAgents.length === 0 && (
                <span style={pvStyles.emptyText}>No agents recruited</span>
              )}
            </div>
          </div>
        </Card>
      </div>

      {editDrawerOpen && (
        <EditMissionOverviewDrawer
          draft={draft}
          onChange={onChange}
          onClose={() => setEditDrawerOpen(false)}
        />
      )}
    </>
  );
}

function ReadOnlyField({ label, value, multiline }) {
  return (
    <div style={pvStyles.roField}>
      <div style={pvStyles.roLabel}>{label}</div>
      <div style={{ ...pvStyles.roValue, whiteSpace: multiline ? "pre-wrap" : "normal" }}>
        {value || "—"}
      </div>
    </div>
  );
}

function EditMissionOverviewDrawer({ draft, onChange, onClose }) {
  const [local, setLocal] = React.useState({
    name: draft.name,
    description: draft.description,
    startDate: draft.startDate,
    duration: draft.duration,
    sessions: draft.sessions,
  });
  const [ddOpen, setDdOpen] = React.useState(false);
  const ddRef = React.useRef(null);

  React.useEffect(() => {
    if (!ddOpen) return;
    const handler = (e) => {
      if (ddRef.current && !ddRef.current.contains(e.target)) setDdOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ddOpen]);

  const setField = (key, val) => setLocal((prev) => ({ ...prev, [key]: val }));

  const hasChanges =
    local.name !== draft.name ||
    local.description !== draft.description ||
    local.startDate !== draft.startDate ||
    local.duration !== draft.duration ||
    local.sessions !== draft.sessions;

  const valid =
    local.name.trim().length > 0 &&
    local.name.length <= NAME_MAX &&
    local.description.length <= DESCRIPTION_MAX &&
    local.startDate &&
    local.duration &&
    Number.isInteger(local.sessions) &&
    local.sessions >= SESSIONS_MIN &&
    local.sessions <= SESSIONS_MAX;

  const canSave = hasChanges && valid;

  const save = () => {
    onChange({ ...draft, ...local });
    onClose();
  };

  const inputRef = React.useRef(null);
  const openPicker = () => {
    const el = inputRef.current;
    if (!el) return;
    if (typeof el.showPicker === "function") el.showPicker();
    else { el.focus(); el.click(); }
  };

  const handleSessions = (e) => {
    const raw = e.target.value;
    if (raw === "") { setField("sessions", SESSIONS_MIN); return; }
    const n = parseInt(raw, 10);
    if (Number.isFinite(n)) setField("sessions", Math.min(SESSIONS_MAX, Math.max(SESSIONS_MIN, n)));
  };

  return (
    <aside style={edStyles.panel}>
      <div style={edStyles.header}>
        <span style={edStyles.title}>Edit Mission Overview</span>
        <button type="button" onClick={onClose} aria-label="Close" style={edStyles.closeBtn}>
          <X size={18} />
        </button>
      </div>

      <div style={edStyles.body}>
        <div style={edStyles.field}>
          <label style={edStyles.label}>Mission name</label>
          <div style={edStyles.inputWrap}>
            <input
              type="text"
              value={local.name}
              onChange={(e) => { if (e.target.value.length <= NAME_MAX) setField("name", e.target.value); }}
              maxLength={NAME_MAX}
              style={edStyles.textInput}
            />
            <span style={edStyles.counter}>{local.name.length}/{NAME_MAX}</span>
          </div>
        </div>

        <div style={edStyles.field}>
          <label style={edStyles.label}>Mission description</label>
          <MultiLineInput
            value={local.description}
            onChange={(v) => setField("description", v)}
            max={DESCRIPTION_MAX}
            rows={4}
          />
        </div>

        <div style={edStyles.row2}>
          <div style={edStyles.field}>
            <label style={edStyles.label}>Start date</label>
            <div style={edStyles.dateWrap}>
              <button type="button" onClick={openPicker} style={edStyles.dateTrigger}>
                <span style={{
                  ...edStyles.dateValue,
                  color: local.startDate ? "var(--color-text-deep)" : "var(--color-text-placeholder)",
                }}>
                  {local.startDate ? formatDate(local.startDate) : "Select a date"}
                </span>
                <Calendar size={18} color="var(--color-text-tertiary)" />
              </button>
              <input
                ref={inputRef}
                type="date"
                value={local.startDate}
                onChange={(e) => setField("startDate", e.target.value)}
                style={edStyles.dateHidden}
                tabIndex={-1}
              />
            </div>
          </div>

          <div style={edStyles.field}>
            <label style={edStyles.label}>Duration</label>
            <div ref={ddRef} style={edStyles.ddWrap}>
              <button type="button" onClick={() => setDdOpen((o) => !o)} style={edStyles.ddTrigger}>
                <span style={edStyles.ddValue}>{local.duration || "Select"}</span>
                <ChevronDown size={18} color="var(--color-text-tertiary)" />
              </button>
              {ddOpen && (
                <div style={edStyles.ddMenu}>
                  {DURATION_OPTIONS.map((opt) => (
                    <div
                      key={opt}
                      onClick={() => { setField("duration", opt); setDdOpen(false); }}
                      style={{
                        ...edStyles.ddOption,
                        fontWeight: opt === local.duration ? 600 : 400,
                      }}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={edStyles.field}>
          <label style={edStyles.label}>
            Minimum practice sessions
            <span
              title="The minimum number of practice sessions each agent must complete during this mission."
              style={edStyles.infoIcon}
            >
              <Info size={14} />
            </span>
          </label>
          <div style={edStyles.sessionsWrap}>
            <input
              type="number"
              min={SESSIONS_MIN}
              max={SESSIONS_MAX}
              value={local.sessions}
              onChange={handleSessions}
              style={edStyles.sessionsInput}
            />
            <span style={edStyles.sessionsSuffix}>sessions</span>
          </div>
        </div>
      </div>

      <div style={edStyles.footer}>
        <button
          type="button"
          onClick={save}
          disabled={!canSave}
          style={{
            ...edStyles.saveBtn,
            opacity: canSave ? 1 : 0.5,
            cursor: canSave ? "pointer" : "default",
          }}
        >
          Save
        </button>
      </div>
    </aside>
  );
}

export function isPreviewValid(draft) {
  const nameOk = draft.name.trim().length > 0 && draft.name.length <= NAME_MAX;
  const descOk = draft.description.length <= DESCRIPTION_MAX;
  const dateOk = Boolean(draft.startDate);
  const durOk = Boolean(draft.duration);
  const sessOk = Number.isInteger(draft.sessions) && draft.sessions >= SESSIONS_MIN && draft.sessions <= SESSIONS_MAX;
  const coverageOk = (draft.coverage?.drivers ?? []).length >= 1;
  const focusOk = (draft.focusArea?.rows ?? []).some((r) => r.focusAreaId);
  const recruitOk = (draft.recruit?.agentIds ?? []).length >= 1;
  return nameOk && descOk && dateOk && durOk && sessOk && coverageOk && focusOk && recruitOk;
}

export const DEMO_DRAFT_PREVIEW = {
  name: "Retention Save Readiness — Q2",
  description:
    "Equip agents to handle cancellation requests with confident objection handling, accurate permanencia explanation, and proactive offer positioning.",
  startDate: "2026-03-23",
  duration: "4 Weeks",
  sessions: 9,
  coverage: {
    drivers: [
      { id: "billing",   reasons: [] },
      { id: "retention", reasons: [] },
      { id: "digital",   reasons: [] },
    ],
  },
  focusArea: {
    rows: [
      { id: "pv-fa-1", focusAreaId: "fa-refund-extension",      target: 80 },
      { id: "pv-fa-2", focusAreaId: "fa-policy-accuracy",       target: 80 },
      { id: "pv-fa-3", focusAreaId: "fa-retention-churn",       target: 80 },
      { id: "pv-fa-4", focusAreaId: "fa-empathy-deescalation",  target: 80 },
    ],
    userClearedAll: false,
  },
  recruit: {
    agentIds: ["ag-malik", "ag-priya", "ag-kenji", "ag-omar"],
    filters: { lastActive: "all", teams: [], activeMissions: [], qaScore: [] },
    sort: { field: "qaScore", direction: "asc" },
    search: "",
  },
};

const pvStyles = {
  twoCol: {
    display: "grid",
    gridTemplateColumns: "340px 1fr",
    gap: 24,
    flex: 1,
    minHeight: 0,
  },
  leftCard: {
    display: "flex",
    flexDirection: "column",
    gap: 0,
    alignSelf: "flex-start",
  },
  rightCard: {
    display: "flex",
    flexDirection: "column",
    gap: 0,
    alignSelf: "flex-start",
  },

  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 16,
    fontWeight: 700,
    color: "var(--color-text-deep)",
  },
  editBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
    color: "var(--color-text-tertiary)",
  },

  roField: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    paddingBlock: 16,
    borderBottom: "1px solid var(--color-divider-card)",
  },
  roLabel: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 12,
    fontWeight: 600,
    color: "var(--color-text-tertiary)",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  roValue: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 14,
    fontWeight: 500,
    color: "var(--color-text-deep)",
    lineHeight: 1.5,
  },

  subsection: {
    paddingBlock: 16,
    borderBottom: "1px solid var(--color-divider-card)",
  },
  subHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  subTitle: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 14,
    fontWeight: 700,
    color: "var(--color-text-deep)",
  },

  chipFlow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  previewChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    height: 32,
    paddingInline: 12,
    borderRadius: 999,
    border: "1px solid var(--color-divider-card)",
    background: "var(--surface-white)",
    fontFamily: '"Mulish", sans-serif',
    fontSize: 13,
    fontWeight: 500,
    color: "var(--color-text-deep)",
    whiteSpace: "nowrap",
  },
  chipInfo: {
    color: "var(--color-text-tertiary)",
    cursor: "help",
    flexShrink: 0,
  },
  typeIcon: {
    color: "var(--color-icon-tertiary-fg)",
    flexShrink: 0,
  },
  targetBadge: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 11,
    fontWeight: 700,
    color: "var(--color-text-tertiary)",
    background: "var(--pill-bg)",
    borderRadius: 999,
    paddingInline: 6,
    paddingBlock: 1,
  },
  miniAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: '"Mulish", sans-serif',
    fontSize: 9,
    fontWeight: 700,
    color: "#fff",
    flexShrink: 0,
  },
  emptyText: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 13,
    color: "var(--color-text-tertiary)",
    fontStyle: "italic",
  },
};

const DRAWER_WIDTH = 400;

const edStyles = {
  panel: {
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    background: "var(--surface-white)",
    borderLeft: "1px solid var(--color-divider-card)",
    boxShadow: "var(--shadow-drawer)",
    display: "flex",
    flexDirection: "column",
    zIndex: 40,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingInline: 24,
    height: 56,
    borderBottom: "1px solid var(--color-divider-card)",
    flexShrink: 0,
  },
  title: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 16,
    fontWeight: 700,
    color: "var(--color-text-deep)",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
    color: "var(--color-text-medium)",
  },
  body: {
    flex: 1,
    overflowY: "auto",
    padding: 24,
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  label: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontFamily: '"Mulish", sans-serif',
    fontSize: 14,
    fontWeight: 600,
    color: "var(--color-text-deep)",
  },
  infoIcon: {
    display: "inline-flex",
    alignItems: "center",
    color: "var(--color-text-tertiary)",
    cursor: "help",
  },
  inputWrap: { position: "relative" },
  textInput: {
    width: "100%",
    height: 44,
    padding: "0 60px 0 16px",
    borderRadius: 8,
    border: "1px solid var(--color-divider-card)",
    background: "var(--surface-white)",
    fontFamily: '"Mulish", sans-serif',
    fontSize: 14,
    color: "var(--color-text-deep)",
    outline: "none",
    boxSizing: "border-box",
  },
  counter: {
    position: "absolute",
    top: "50%",
    right: 12,
    transform: "translateY(-50%)",
    fontFamily: '"Mulish", sans-serif',
    fontSize: 12,
    color: "var(--color-text-tertiary)",
  },
  row2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
  },
  dateWrap: { position: "relative" },
  dateTrigger: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    height: 44,
    padding: "0 16px",
    borderRadius: 8,
    border: "1px solid var(--color-divider-card)",
    background: "var(--surface-white)",
    cursor: "pointer",
  },
  dateValue: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 14,
    fontWeight: 400,
  },
  dateHidden: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    opacity: 0,
    pointerEvents: "none",
  },
  ddWrap: { position: "relative" },
  ddTrigger: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    height: 44,
    padding: "0 16px",
    borderRadius: 8,
    border: "1px solid var(--color-divider-card)",
    background: "var(--surface-white)",
    cursor: "pointer",
  },
  ddValue: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 14,
    fontWeight: 400,
    color: "var(--color-text-deep)",
  },
  ddMenu: {
    position: "absolute",
    top: "calc(100% + 4px)",
    left: 0,
    right: 0,
    background: "var(--surface-white)",
    border: "1px solid var(--color-divider-card)",
    borderRadius: 8,
    boxShadow: "var(--shadow-8)",
    zIndex: 60,
    overflow: "hidden",
  },
  ddOption: {
    padding: "12px 16px",
    fontFamily: '"Mulish", sans-serif',
    fontSize: 14,
    color: "var(--color-text-deep)",
    cursor: "pointer",
  },
  sessionsWrap: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    height: 44,
    border: "1px solid var(--color-divider-card)",
    borderRadius: 8,
    background: "var(--surface-white)",
    paddingInline: 12,
    boxSizing: "border-box",
  },
  sessionsInput: {
    flex: 1,
    border: "none",
    outline: "none",
    fontFamily: '"Mulish", sans-serif',
    fontSize: 14,
    fontWeight: 600,
    color: "var(--color-text-deep)",
    background: "transparent",
    width: "100%",
    minWidth: 0,
  },
  sessionsSuffix: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 13,
    color: "var(--color-text-tertiary)",
    marginLeft: 8,
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    height: 56,
    paddingInline: 24,
    borderTop: "1px solid var(--color-divider-card)",
    flexShrink: 0,
  },
  saveBtn: {
    height: 36,
    paddingInline: 20,
    borderRadius: 8,
    border: "none",
    background: "var(--color-button-primary-bg)",
    color: "var(--color-button-primary-fg)",
    fontFamily: '"Mulish", sans-serif',
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
};
