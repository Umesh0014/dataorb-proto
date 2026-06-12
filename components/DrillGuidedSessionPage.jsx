"use client";

import React from "react";
import {
  Mic,
  MicOff,
  PhoneOff,
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Circle,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import Banner from "./Banner";
import DarkPillSwitcher from "./DarkPillSwitcher";
import {
  GUIDED_DRILL_META,
  GUIDED_DRILL_STEPS,
  GUIDED_DRILL_HINTS,
  GUIDED_DRILL_TURNS,
  GUIDED_DRILL_EVAL,
  formatDrillTimer,
} from "./mocks/guidedDrill";

// DrillGuidedSessionPage — the assisted "safety wheel" Drill experience.
// The agent practises a role play against a simulated customer while a
// second AI checks off the steps of the attached Guided Workflow in real
// time and flags skipped mandatory steps. After the call the eval is shown
// but a banner makes explicit that the score is NOT counted toward the
// readiness profile (safety-on = new "assisted mode" exclusion).
//
// Three design directions ride behind one switcher (ticket audit:
// docs/tickets/drill-guided-workflow/directions.md) — they differ only in
// how the live guidance is surfaced; the conversation, controls, skip
// flag, Suggest-phrasing and the post-session eval are constant:
//   "Sidecar" — persistent right-rail checklist (D1)
//   "Coach"   — single current-step coach card, peek-next (D5)
//   "Spine"   — top progress stepper, expand for detail (D3)
//
// Layout note (mirrors GuideSessionPage spec §3): full-bleed session
// surface rendered outside PageLayout — 32px gutter between the 64px nav
// rail and the white card; the 1068 content max-width does not apply.

const VARIANTS = ["Sidecar", "Coach", "Spine"];

// Per-state visual meta. Color is always paired with an icon + a text
// label so meaning never rides on color alone (G9). iconColor and
// labelColor are split: the icon (a non-text UI component, ≥3:1) keeps the
// semantic tint, while the text label uses a ≥4.5:1 token so meaningful
// status text clears the contrast floor (G8).
function stepStateMeta(state) {
  switch (state) {
    case "done":
      return {
        Icon: CheckCircle2,
        iconColor: "var(--color-success)",
        labelColor: "var(--color-success-text)",
        label: "Done",
      };
    case "active":
      return {
        Icon: null, // rendered as a pulsing dot + "Now" label
        iconColor: "var(--color-button-primary-bg)",
        labelColor: "var(--color-button-primary-bg)",
        label: "Now",
      };
    case "skipped":
      return {
        Icon: AlertTriangle,
        // warning-dark (not warning) so the icon clears ≥3:1 even on the
        // tinted warning-bg skipped row, not just on white (G8).
        iconColor: "var(--color-warning-dark)",
        labelColor: "var(--color-warning-text)",
        label: "Skipped — no evidence",
      };
    default:
      return {
        Icon: Circle,
        iconColor: "var(--color-text-tertiary)",
        labelColor: "var(--color-text-tertiary)",
        label: "Pending",
      };
  }
}

export default function DrillGuidedSessionPage({ onEnd }) {
  const meta = GUIDED_DRILL_META;

  const [variant, setVariant] = React.useState("Sidecar");
  const [steps, setSteps] = React.useState(GUIDED_DRILL_STEPS);
  const [muted, setMuted] = React.useState(false);
  const [secondsLeft, setSecondsLeft] = React.useState(meta.totalSeconds);
  const [hintOpen, setHintOpen] = React.useState(false);
  const [ended, setEnded] = React.useState(false);

  const activeStep = steps.find((s) => s.state === "active") || null;
  const nextStep = steps.find((s) => s.state === "pending") || null;
  const skippedSteps = steps.filter((s) => s.state === "skipped" && s.mandatory);
  const doneCount = steps.filter((s) => s.state === "done").length;
  const activeHint = activeStep ? GUIDED_DRILL_HINTS[activeStep.id] : null;

  // Call timer. At 0:00 the call hard-ends into the eval (no real audio).
  React.useEffect(() => {
    if (ended) return undefined;
    if (secondsLeft <= 0) {
      setEnded(true);
      return undefined;
    }
    const id = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [secondsLeft, ended]);

  // One safe live-detection demo step: the active "diagnose" step checks
  // off and "explain-ipc" becomes active, exercising the real-time
  // check-off without mutating layout height (MOT-9 — same row count).
  React.useEffect(() => {
    const id = window.setTimeout(() => {
      setSteps((prev) =>
        prev.map((s) => {
          if (s.id === "diagnose") return { ...s, state: "done", at: "0:58" };
          if (s.id === "explain-ipc") return { ...s, state: "active" };
          return s;
        }),
      );
      setHintOpen(false);
    }, 7000);
    return () => window.clearTimeout(id);
  }, []);

  const endCall = () => setEnded(true);

  return (
    <div style={styles.outer}>
      <div style={styles.card}>
        <SessionHeader meta={meta} doneCount={doneCount} total={steps.length} onClose={onEnd} />

        {/* Live region — announces real-time check-off + skipped-mandatory
            flags so a screen-reader user gets the same signal the visual
            check-marks carry (WCAG-10). */}
        <div role="status" aria-live="polite" style={styles.srOnly}>
          {!ended && activeStep && `Current step: ${activeStep.label}. ${doneCount} of ${steps.length} steps done.`}
          {!ended && skippedSteps.length > 0 &&
            ` ${skippedSteps.length} mandatory step skipped: ${skippedSteps.map((s) => s.label).join(", ")}.`}
        </div>

        {ended ? (
          <EvalResult onBackToDrill={onEnd} onUnassisted={onEnd} />
        ) : (
          <div style={variant === "Spine" ? styles.bodyStacked : styles.body}>
            {variant === "Spine" ? (
              <>
                <ProgressSpine
                  steps={steps}
                  activeHint={activeHint}
                  hintOpen={hintOpen}
                  onToggleHint={() => setHintOpen((o) => !o)}
                />
                <div style={styles.spineLower}>
                  <ControlsColumn
                    meta={meta}
                    muted={muted}
                    secondsLeft={secondsLeft}
                    onToggleMute={() => setMuted((m) => !m)}
                    onEnd={endCall}
                    compact
                  />
                  <Transcript turns={GUIDED_DRILL_TURNS} steps={steps} />
                </div>
              </>
            ) : (
              <>
                <ControlsColumn
                  meta={meta}
                  muted={muted}
                  secondsLeft={secondsLeft}
                  onToggleMute={() => setMuted((m) => !m)}
                  onEnd={endCall}
                />
                <Transcript turns={GUIDED_DRILL_TURNS} steps={steps} />
                {variant === "Sidecar" && (
                  <ChecklistRail
                    steps={steps}
                    skippedSteps={skippedSteps}
                    activeStepId={activeStep?.id}
                    activeHint={activeHint}
                    hintOpen={hintOpen}
                    onToggleHint={() => setHintOpen((o) => !o)}
                  />
                )}
                {variant === "Coach" && (
                  <CoachPanel
                    activeStep={activeStep}
                    nextStep={nextStep}
                    steps={steps}
                    skippedSteps={skippedSteps}
                    doneCount={doneCount}
                    activeHint={activeHint}
                    hintOpen={hintOpen}
                    onToggleHint={() => setHintOpen((o) => !o)}
                  />
                )}
              </>
            )}
          </div>
        )}
      </div>

      {!ended && (
        <FloatingSwitcher value={variant} onChange={setVariant} />
      )}
    </div>
  );
}

// ---- Header ------------------------------------------------------------

function SessionHeader({ meta, doneCount, total, onClose }) {
  return (
    <header style={styles.header}>
      <div style={styles.headerLeft}>
        <span style={styles.workflowTitle}>{meta.workflowTitle}</span>
        <span style={styles.headerDot} aria-hidden="true" />
        <span style={styles.scenarioTitle}>{meta.scenarioTitle}</span>
        <span style={styles.headerDot} aria-hidden="true" />
        <span style={styles.interactionId}>Interaction ID – {meta.interactionId}</span>
      </div>
      <div style={styles.headerRight}>
        <span style={styles.safetyPill}>
          <ShieldCheck size={14} color="var(--color-info-text)" aria-hidden="true" />
          <span style={styles.safetyPillLabel}>Safety wheel on</span>
        </span>
        <span style={styles.sessionsCount}>
          Session {meta.sessionsUsed} of {meta.sessionsAllowed}
        </span>
        <span style={styles.headerDot} aria-hidden="true" />
        <span style={styles.progressCount}>
          {doneCount}/{total} steps
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Exit guided drill"
          className="drill-focusable"
          style={styles.iconBtn}
        >
          <X size={18} color="var(--color-text-tertiary)" />
        </button>
      </div>
    </header>
  );
}

// ---- Left controls column (persona orb + mic/end) ----------------------

function ControlsColumn({ meta, muted, secondsLeft, onToggleMute, onEnd, compact }) {
  return (
    <aside style={{ ...styles.controlsCol, width: compact ? 300 : 380 }}>
      <div style={styles.orbStack}>
        <Orb initials={meta.initials} muted={muted} />
        <div style={styles.statusBlock}>
          <span style={styles.statusHead}>{meta.scenarioTitle.split(" — ")[0]}</span>
          <span style={styles.statusSub}>
            {muted ? "Mic muted — tap to resume" : "Simulated customer • live"}
          </span>
        </div>
        <TimerPill secondsLeft={secondsLeft} />
      </div>

      <div style={styles.controlsRow}>
        <button
          type="button"
          onClick={onToggleMute}
          aria-label={muted ? "Unmute microphone" : "Mute microphone"}
          aria-pressed={muted}
          className="drill-focusable"
          style={styles.mutePill}
        >
          {muted
            ? <MicOff size={20} color="var(--color-text-deep)" />
            : <Mic size={20} color="var(--color-text-deep)" />}
        </button>
        <button
          type="button"
          onClick={onEnd}
          aria-label="End call and see result"
          className="drill-focusable"
          style={styles.endPill}
        >
          <PhoneOff size={20} color="var(--surface-white)" />
        </button>
      </div>

      <p style={styles.disclaimer}>
        Practice mode — the safety wheel is on, so this attempt won't count toward your
        readiness profile.
      </p>
    </aside>
  );
}

function Orb({ initials, muted }) {
  // Orb gradient + pulse rings reuse GuideSessionPage's established
  // session visual verbatim (sibling live-session surface) rather than
  // inventing new pink tokens — the keyframes already live in globals.css.
  return (
    <div style={styles.orbWrap}>
      <span
        className="orbPulseAnimated"
        style={{ ...styles.orbRingOuter, opacity: muted ? 0.4 : 1 }}
        aria-hidden="true"
      />
      <span
        className="orbPulseAnimated"
        style={{ ...styles.orbRingMid, opacity: muted ? 0.5 : 1 }}
        aria-hidden="true"
      />
      <span style={styles.orb} aria-hidden="true">
        <span style={styles.orbInitials}>{initials}</span>
      </span>
    </div>
  );
}

function TimerPill({ secondsLeft }) {
  return (
    <span style={styles.timerPill}>
      <span style={styles.timerDot} aria-hidden="true" />
      <span style={styles.timerLabel}>{formatDrillTimer(secondsLeft)} min left</span>
    </span>
  );
}

// ---- Transcript --------------------------------------------------------

function Transcript({ turns, steps }) {
  const transcriptRef = React.useRef(null);
  React.useEffect(() => {
    const el = transcriptRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [turns]);

  const labelForStep = (id) => steps.find((s) => s.id === id)?.label;

  return (
    <section style={styles.convCol}>
      <div ref={transcriptRef} style={styles.transcript}>
        {turns.map((turn) => (
          <ConversationTurn key={turn.id} turn={turn} stepLabel={labelForStep(turn.stepRef)} />
        ))}
      </div>
    </section>
  );
}

function ConversationTurn({ turn, stepLabel }) {
  const isAgent = turn.speaker === "AGENT";
  return (
    <div style={styles.turn}>
      <div style={styles.turnHead}>
        <span style={styles.turnDot} aria-hidden="true" />
        <span
          style={{
            ...styles.turnSpeaker,
            color: isAgent ? "var(--color-text-deep)" : "var(--color-text-tertiary)",
          }}
        >
          {turn.speaker}
        </span>
        <span style={styles.turnTimestamp}>{turn.timestamp}</span>
      </div>
      <div style={styles.turnBodyWrap}>
        <p
          style={{
            ...styles.turnBody,
            color: isAgent ? "var(--color-text-deep)" : "var(--color-text-tertiary)",
          }}
        >
          {turn.body}
        </p>
      </div>
      {stepLabel && (
        <span style={styles.turnStepTag}>
          <CheckCircle2 size={13} color="var(--color-success)" aria-hidden="true" />
          <span style={styles.turnStepTagLabel}>Checked off — {stepLabel}</span>
        </span>
      )}
    </div>
  );
}

// ---- Shared step pieces ------------------------------------------------

function MandatoryTag({ mandatory }) {
  return (
    <span
      style={{
        ...styles.metaTag,
        color: mandatory ? "var(--color-text-medium)" : "var(--color-text-placeholder)",
        background: mandatory ? "var(--color-chip-bg)" : "transparent",
      }}
    >
      {mandatory ? "Mandatory" : "Optional"}
    </span>
  );
}

function StepStatus({ state }) {
  const meta = stepStateMeta(state);
  if (state === "active") {
    return (
      <span style={styles.statusInline}>
        <span style={styles.activeDot} aria-hidden="true" />
        <span style={{ ...styles.statusLabel, color: meta.labelColor }}>{meta.label}</span>
      </span>
    );
  }
  const Icon = meta.Icon;
  return (
    <span style={styles.statusInline}>
      <Icon size={15} color={meta.iconColor} aria-hidden="true" />
      <span style={{ ...styles.statusLabel, color: meta.labelColor }}>{meta.label}</span>
    </span>
  );
}

function SuggestPhrasing({ hint, open, onToggle }) {
  if (!hint) return null;
  return (
    <div style={styles.hintWrap}>
      <Button
        variant="ai"
        onClick={onToggle}
        uppercase={false}
        className="drill-focusable"
        aria-expanded={open}
      >
        {open ? "Hide phrasing" : "Suggest phrasing"}
      </Button>
      {open && (
        <p style={styles.hintBody}>{hint}</p>
      )}
    </div>
  );
}

function SkipAlert({ steps }) {
  if (steps.length === 0) return null;
  const labels = steps.map((s) => s.label).join(", ");
  return (
    <Banner
      tone="warning"
      heading={`${steps.length} mandatory step skipped`}
      body={`No evidence found for: ${labels}. You can still cover it before the call ends.`}
    />
  );
}

// ---- Sidecar (D1) ------------------------------------------------------

function ChecklistRail({ steps, skippedSteps, activeStepId, activeHint, hintOpen, onToggleHint }) {
  return (
    <aside style={styles.rail} aria-label="Guided workflow checklist">
      <div style={styles.railHeader}>
        <span style={styles.railTitle}>Guided workflow</span>
        <span style={styles.railSub}>AI checks each step off as you go</span>
      </div>
      <div style={styles.railAlert}>
        {skippedSteps.length > 0 ? (
          <SkipAlert steps={skippedSteps} />
        ) : (
          <span style={styles.railOnTrack}>
            <CheckCircle2 size={14} color="var(--color-success)" aria-hidden="true" />
            On track — no mandatory steps skipped yet.
          </span>
        )}
      </div>
      <ol style={styles.railList} role="list">
        {steps.map((step) => {
          const isActive = step.id === activeStepId;
          return (
            <li
              key={step.id}
              role="listitem"
              aria-current={isActive ? "step" : undefined}
              style={{
                ...styles.railRow,
                ...(isActive ? styles.railRowActive : null),
                ...(step.state === "skipped" ? styles.railRowSkipped : null),
              }}
            >
              <div style={styles.railRowTop}>
                <StepStatus state={step.state} />
                {step.at && <span style={styles.railAt}>{step.at}</span>}
              </div>
              <span style={styles.railRowLabel}>{step.label}</span>
              <span style={styles.railRowDetail}>{step.detail}</span>
              <div style={styles.railRowMeta}>
                <MandatoryTag mandatory={step.mandatory} />
                {step.branch && <span style={styles.branchTag}>{step.branch}</span>}
              </div>
              {isActive && (
                <SuggestPhrasing hint={activeHint} open={hintOpen} onToggle={onToggleHint} />
              )}
            </li>
          );
        })}
      </ol>
    </aside>
  );
}

// ---- Coach (D5) --------------------------------------------------------

function CoachPanel({
  activeStep,
  nextStep,
  steps,
  skippedSteps,
  doneCount,
  activeHint,
  hintOpen,
  onToggleHint,
}) {
  // Default-open so the full workflow is discoverable on first encounter
  // rather than hidden behind a collapsed toggle (INT-2).
  const [allOpen, setAllOpen] = React.useState(true);
  return (
    <aside style={styles.coachCol} aria-label="Current step coach">
      {skippedSteps.length > 0 && (
        <SkipAlert steps={skippedSteps} />
      )}

      {activeStep && (
        <Card tone="outline" padX={20} padY={20} style={styles.coachCard}>
          <span style={styles.coachNowLabel}>
            <span style={styles.activeDot} aria-hidden="true" />
            Now
          </span>
          <span style={styles.coachStepLabel}>{activeStep.label}</span>
          <span style={styles.coachStepDetail}>{activeStep.detail}</span>
          <div style={styles.railRowMeta}>
            <MandatoryTag mandatory={activeStep.mandatory} />
            {activeStep.branch && <span style={styles.branchTag}>{activeStep.branch}</span>}
          </div>
          <SuggestPhrasing hint={activeHint} open={hintOpen} onToggle={onToggleHint} />
        </Card>
      )}

      {nextStep ? (
        <div style={styles.coachNext}>
          <span style={styles.coachNextLabel}>Up next</span>
          <span style={styles.coachNextStep}>
            <ChevronRight size={14} color="var(--color-text-tertiary)" aria-hidden="true" />
            {nextStep.label}
          </span>
        </div>
      ) : (
        <div style={styles.coachNext}>
          <span style={styles.coachNextLabel}>Up next</span>
          <span style={styles.coachNextStep}>
            <CheckCircle2 size={14} color="var(--color-success)" aria-hidden="true" />
            All steps covered — wrap up and close the call.
          </span>
        </div>
      )}

      <button
        type="button"
        onClick={() => setAllOpen((o) => !o)}
        aria-expanded={allOpen}
        className="drill-focusable"
        style={styles.coachAllToggle}
      >
        <span>All steps ({doneCount}/{steps.length} done)</span>
        <ChevronDown
          size={16}
          color="var(--color-text-tertiary)"
          style={{ transform: allOpen ? "rotate(180deg)" : "none", transition: "transform 150ms ease" }}
        />
      </button>

      {allOpen && (
        <ol style={styles.coachAllList} role="list">
          {steps.map((step) => (
            <li key={step.id} role="listitem" style={styles.coachAllRow}>
              <StepStatus state={step.state} />
              <span style={styles.coachAllRowLabel}>{step.label}</span>
            </li>
          ))}
        </ol>
      )}
    </aside>
  );
}

// ---- Spine (D3) --------------------------------------------------------

function ProgressSpine({ steps, activeHint, hintOpen, onToggleHint }) {
  const [openId, setOpenId] = React.useState(null);
  const activeStep = steps.find((s) => s.state === "active");
  // Default the expanded segment to the active step on first render.
  const expandedId = openId ?? activeStep?.id ?? null;
  const expanded = steps.find((s) => s.id === expandedId) || null;

  return (
    <section style={styles.spine} aria-label="Guided workflow progress">
      <div style={styles.spineHeaderRow}>
        <span style={styles.railTitle}>Guided workflow</span>
        <span style={styles.railSub}>Branch: Bill higher than expected</span>
      </div>
      <ol style={styles.spineTrack} role="list">
        {steps.map((step, i) => {
          const meta = stepStateMeta(step.state);
          const isExpanded = step.id === expandedId;
          return (
            <li key={step.id} role="listitem" style={styles.spineSeg}>
              <button
                type="button"
                onClick={() => setOpenId(isExpanded ? "__none__" : step.id)}
                aria-expanded={isExpanded}
                aria-current={step.state === "active" ? "step" : undefined}
                className="drill-focusable"
                style={{
                  ...styles.spineNode,
                  ...(isExpanded ? styles.spineNodeOpen : null),
                }}
              >
                <span style={styles.spineNodeTop}>
                  {step.state === "active" ? (
                    <span style={styles.activeDot} aria-hidden="true" />
                  ) : (
                    <meta.Icon size={15} color={meta.iconColor} aria-hidden="true" />
                  )}
                  <span style={styles.spineIndex}>{i + 1}</span>
                  {step.mandatory && (
                    <span style={styles.spineReqTag}>Required</span>
                  )}
                </span>
                <span style={styles.spineNodeLabel}>{step.label}</span>
              </button>
              {i < steps.length - 1 && <span style={styles.spineConnector} aria-hidden="true" />}
            </li>
          );
        })}
      </ol>

      {expanded && expandedId !== "__none__" && (
        <div style={styles.spineDetail}>
          <div style={styles.spineDetailHead}>
            <StepStatus state={expanded.state} />
            <MandatoryTag mandatory={expanded.mandatory} />
            {expanded.at && <span style={styles.railAt}>{expanded.at}</span>}
          </div>
          <span style={styles.spineDetailLabel}>{expanded.label}</span>
          <span style={styles.coachStepDetail}>{expanded.detail}</span>
          {expanded.state === "active" && (
            <SuggestPhrasing hint={activeHint} open={hintOpen} onToggle={onToggleHint} />
          )}
        </div>
      )}
    </section>
  );
}

// ---- Post-session eval (shared) ---------------------------------------

function EvalResult({ onBackToDrill, onUnassisted }) {
  const e = GUIDED_DRILL_EVAL;
  const tiles = [
    { label: "Overall score (excluded)", value: `${e.overallScore}%` },
    { label: "Steps completed", value: `${e.stepsDone} of ${e.stepsTotal}` },
    { label: "Mandatory steps skipped", value: String(e.mandatorySkipped) },
    { label: "Phrasing hints reviewed", value: String(e.hintsReviewed) },
  ];
  return (
    <div style={styles.evalScroll}>
      <div style={styles.evalInner}>
        <Banner
          tone="info"
          heading="This attempt isn't counted toward your readiness profile"
          body="The safety wheel was on, so the score below is for your visibility only — it's an assisted-mode attempt, the same exclusion used for calibration mode. Your readiness comes from unassisted practice."
        />

        <Card tone="outline" padX={28} padY={24} style={styles.evalCard}>
          <span style={styles.evalCardTitle}>How the guided attempt went</span>
          <div style={styles.evalTiles}>
            {tiles.map((t) => (
              <div key={t.label} style={styles.evalTile}>
                <span style={styles.evalTileValue}>{t.value}</span>
                <span style={styles.evalTileLabel}>{t.label}</span>
              </div>
            ))}
          </div>
          <div style={styles.evalBranchRow}>
            <span style={styles.evalTileLabel}>Branch executed</span>
            <span style={styles.evalBranchValue}>{e.branchExecuted}</span>
          </div>
        </Card>

        <Card tone="muted" padX={28} padY={24} style={styles.evalReadyCard}>
          <span style={styles.evalReadyTitle}>Ready to drill without the training wheel?</span>
          <span style={styles.evalReadyBody}>
            Run the same scenario unassisted to get a score that counts toward your readiness
            profile.
          </span>
          <div style={styles.evalActions}>
            <Button variant="primary" onClick={onUnassisted} className="drill-focusable">
              Practice without the wheel
            </Button>
            <Button
              variant="text"
              uppercase={false}
              onClick={onBackToDrill}
              className="drill-focusable"
            >
              Back to Drill library
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ---- Floating variant switcher ----------------------------------------

function FloatingSwitcher({ value, onChange }) {
  return (
    <div style={styles.switcherCluster}>
      <span style={styles.switcherLabel}>Direction</span>
      <DarkPillSwitcher
        ariaLabel="Guided drill design direction"
        value={value}
        options={VARIANTS}
        onChange={onChange}
      />
    </div>
  );
}

// ---- Styles ------------------------------------------------------------

const styles = {
  outer: {
    position: "fixed",
    top: 0, right: 0, bottom: 0,
    left: 64,
    padding: 32,
    display: "flex",
    background: "transparent",
    fontFamily: "var(--font-sans)",
  },
  card: {
    flex: 1,
    background: "var(--surface-white)",
    borderRadius: 12,
    boxShadow: "var(--shadow-card)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    minWidth: 0,
  },

  // Header
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    padding: "14px 20px 14px 24px",
    borderBottom: "2px solid var(--color-border-card-soft)",
    flexShrink: 0,
  },
  headerLeft: {
    display: "inline-flex", alignItems: "center", gap: 12, minWidth: 0, flexWrap: "wrap",
  },
  workflowTitle: {
    fontSize: 16, fontWeight: 700, lineHeight: 1.3,
    color: "var(--color-text-deep)",
  },
  scenarioTitle: {
    fontSize: 14, fontWeight: 500, lineHeight: 1.3,
    color: "var(--color-text-medium)",
  },
  headerDot: {
    width: 3, height: 3, borderRadius: 999,
    background: "var(--color-text-tertiary)", flexShrink: 0,
  },
  interactionId: {
    fontSize: 13, fontWeight: 400, letterSpacing: "0.25px",
    color: "var(--color-text-tertiary)",
    fontFamily: "var(--font-mono)",
  },
  headerRight: {
    display: "inline-flex", alignItems: "center", gap: 12, flexShrink: 0,
  },
  safetyPill: {
    display: "inline-flex", alignItems: "center", gap: 6,
    height: 26, padding: "0 10px",
    background: "var(--color-info-bg)", borderRadius: 999,
  },
  safetyPillLabel: {
    fontSize: 12, fontWeight: 700, letterSpacing: "0.2px",
    color: "var(--color-info-text)",
  },
  sessionsCount: {
    fontSize: 12, fontWeight: 500,
    color: "var(--color-text-tertiary)",
    fontFamily: "var(--font-mono)",
  },
  progressCount: {
    fontSize: 13, fontWeight: 700,
    color: "var(--color-text-deep)",
    fontFamily: "var(--font-mono)",
  },

  // Body containers
  body: {
    flex: 1, display: "flex", alignItems: "stretch", minHeight: 0,
  },
  bodyStacked: {
    flex: 1, display: "flex", flexDirection: "column", minHeight: 0,
  },
  spineLower: {
    flex: 1, display: "flex", alignItems: "stretch", minHeight: 0,
  },

  // Left controls column
  controlsCol: {
    display: "flex", flexDirection: "column",
    background: "var(--surface-white)",
    borderRight: "2px solid var(--color-border-card-soft)",
    padding: "24px 24px 0",
    flexShrink: 0,
  },
  orbStack: {
    flex: 1, display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", gap: 20,
  },
  orbWrap: {
    position: "relative", width: 168, height: 168,
    display: "inline-grid", placeItems: "center",
  },
  orbRingOuter: {
    position: "absolute", inset: 0, borderRadius: "50%",
    background: "radial-gradient(circle at 30% 30%, rgba(247, 217, 235, 0.7), rgba(195, 199, 242, 0.5) 60%, transparent 80%)",
    filter: "blur(8px)",
    animation: "orbPulseOuter 4s ease-in-out infinite",
  },
  orbRingMid: {
    position: "absolute", inset: 22, borderRadius: "50%",
    background: "radial-gradient(circle at 35% 35%, rgba(247, 217, 235, 0.9), rgba(220, 195, 240, 0.7) 65%)",
    filter: "blur(4px)",
    animation: "orbPulseMid 3s ease-in-out infinite",
  },
  orb: {
    position: "relative", width: 120, height: 120, borderRadius: "50%",
    background: "radial-gradient(circle at 32% 32%, #FFFFFF 0%, #F7D9EB 35%, #C3C7F2 90%)",
    boxShadow: "inset 0 -10px 20px rgba(102, 80, 165, 0.18), 0 8px 24px rgba(102, 80, 165, 0.15)",
    display: "inline-grid", placeItems: "center",
  },
  orbInitials: {
    fontFamily: "var(--font-sans)", fontSize: 28, fontWeight: 700, letterSpacing: "0.5px",
    color: "#6650A5",
  },
  statusBlock: {
    display: "flex", flexDirection: "column", alignItems: "center", gap: 4, textAlign: "center",
  },
  statusHead: {
    fontSize: 14, fontWeight: 700, color: "var(--color-text-deep)",
  },
  statusSub: {
    fontSize: 12, fontWeight: 400, letterSpacing: "0.2px",
    color: "var(--color-text-placeholder)",
  },
  timerPill: {
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "5px 12px", background: "var(--color-chip-bg)", borderRadius: 4,
  },
  timerDot: {
    width: 6, height: 6, borderRadius: 999, background: "var(--color-success)",
  },
  timerLabel: {
    fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 500, letterSpacing: "0.1px",
    color: "var(--color-text-medium)",
  },
  controlsRow: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 16,
    padding: "24px 0", flexShrink: 0,
  },
  mutePill: {
    width: 72, height: 44, background: "var(--surface-white)",
    border: "1px solid var(--color-divider-card)", borderRadius: 8,
    cursor: "pointer", display: "inline-grid", placeItems: "center", padding: 0,
    transition: "background 150ms ease",
  },
  endPill: {
    width: 66, height: 44, background: "var(--color-error-dark)", border: "none",
    borderRadius: 8, cursor: "pointer", display: "inline-grid", placeItems: "center", padding: 0,
    transition: "background 150ms ease",
  },
  disclaimer: {
    margin: 0, padding: "16px 8px",
    borderTop: "1px solid var(--color-border-card-soft)",
    fontSize: 12, fontWeight: 400, lineHeight: 1.5,
    color: "var(--color-text-placeholder)", textAlign: "center",
  },

  // Conversation column
  convCol: {
    flex: 1, minWidth: 0, display: "flex", flexDirection: "column",
    background: "var(--surface-dim)", padding: "16px 24px",
  },
  transcript: {
    flex: 1, minHeight: 0, overflowY: "auto",
    display: "flex", flexDirection: "column", paddingBottom: 16,
  },
  turn: { display: "flex", flexDirection: "column", padding: "12px", gap: 4 },
  turnHead: { display: "inline-flex", alignItems: "center", gap: 12 },
  turnDot: { width: 4, height: 4, borderRadius: 999, background: "var(--color-text-deep)" },
  turnSpeaker: {
    fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 500, letterSpacing: "0.1px",
  },
  turnTimestamp: {
    fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 400, letterSpacing: "0.4px",
    color: "var(--color-text-placeholder)",
  },
  turnBodyWrap: { paddingLeft: 16, borderLeft: "2px solid var(--color-text-deep)" },
  turnBody: {
    margin: 0, fontSize: 14, fontWeight: 400, lineHeight: 1.5, letterSpacing: "0.17px",
    whiteSpace: "pre-wrap",
  },
  turnStepTag: {
    display: "inline-flex", alignItems: "center", gap: 6, paddingLeft: 16, marginTop: 2,
  },
  turnStepTagLabel: {
    fontSize: 12, fontWeight: 600, color: "var(--color-success)",
  },

  // Shared step meta
  metaTag: {
    display: "inline-flex", alignItems: "center", height: 20, padding: "0 8px",
    borderRadius: 4, fontSize: 11, fontWeight: 700, letterSpacing: "0.3px",
  },
  branchTag: {
    display: "inline-flex", alignItems: "center", height: 20, padding: "0 8px",
    borderRadius: 4, fontSize: 11, fontWeight: 600,
    background: "var(--color-icon-tertiary-bg)", color: "var(--color-icon-tertiary-fg)",
  },
  statusInline: { display: "inline-flex", alignItems: "center", gap: 6 },
  statusLabel: { fontSize: 12, fontWeight: 700, letterSpacing: "0.2px" },
  activeDot: {
    width: 9, height: 9, borderRadius: 999,
    background: "var(--color-button-primary-bg)",
    boxShadow: "0 0 0 3px var(--color-primary-alpha-12)",
  },

  // Suggest phrasing
  hintWrap: { display: "flex", flexDirection: "column", gap: 6, marginTop: 4 },
  hintBody: {
    margin: 0, padding: "10px 12px", borderRadius: 8,
    background: "var(--color-icon-tertiary-bg)", color: "var(--color-text-medium)",
    fontSize: 13, fontWeight: 500, lineHeight: 1.5, animation: "drillStepIn 150ms ease",
  },

  // Sidecar rail
  rail: {
    width: 360, flexShrink: 0, background: "var(--surface-white)",
    borderLeft: "2px solid var(--color-border-card-soft)",
    display: "flex", flexDirection: "column", minHeight: 0,
    animation: "panelSlideIn 200ms ease",
  },
  railHeader: {
    display: "flex", flexDirection: "column", gap: 2,
    padding: "16px 20px", borderBottom: "1px solid var(--color-border-card-soft)", flexShrink: 0,
  },
  railTitle: { fontSize: 15, fontWeight: 700, color: "var(--color-text-deep)" },
  railSub: { fontSize: 12, fontWeight: 400, color: "var(--color-text-placeholder)" },
  railAlert: { padding: "12px 16px 0" },
  railList: {
    listStyle: "none", margin: 0, padding: "8px 12px 16px",
    flex: 1, minHeight: 0, overflowY: "auto",
    display: "flex", flexDirection: "column", gap: 4,
  },
  railRow: {
    display: "flex", flexDirection: "column", gap: 4,
    padding: "12px", borderRadius: 8, border: "1px solid transparent",
  },
  railRowActive: {
    background: "var(--color-primary-alpha-04)",
    border: "1px solid var(--color-border-tab)",
  },
  railRowSkipped: { background: "var(--color-warning-bg)" },
  railRowTop: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  railAt: {
    fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-text-placeholder)",
  },
  railRowLabel: { fontSize: 14, fontWeight: 600, color: "var(--color-text-deep)", lineHeight: 1.4 },
  railRowDetail: { fontSize: 12, fontWeight: 400, color: "var(--color-text-tertiary)", lineHeight: 1.5 },
  railRowMeta: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginTop: 2 },

  // Coach column
  coachCol: {
    width: 340, flexShrink: 0, background: "var(--surface-white)",
    borderLeft: "2px solid var(--color-border-card-soft)",
    display: "flex", flexDirection: "column", gap: 16, minHeight: 0,
    padding: "16px", overflowY: "auto",
  },
  coachCard: {
    display: "flex", flexDirection: "column", gap: 8,
    boxShadow: "var(--shadow-card)",
  },
  coachNowLabel: {
    display: "inline-flex", alignItems: "center", gap: 8,
    fontSize: 12, fontWeight: 700, letterSpacing: "0.3px",
    color: "var(--color-button-primary-bg)",
  },
  coachStepLabel: { fontSize: 18, fontWeight: 700, color: "var(--color-text-deep)", lineHeight: 1.35 },
  coachStepDetail: { fontSize: 13, fontWeight: 400, color: "var(--color-text-tertiary)", lineHeight: 1.55 },
  coachNext: {
    display: "flex", flexDirection: "column", gap: 4,
    padding: "12px 16px", borderRadius: 8, background: "var(--color-card-emoji-bg)",
  },
  coachNextLabel: {
    fontSize: 11, fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase",
    color: "var(--color-text-placeholder)",
  },
  coachNextStep: {
    display: "inline-flex", alignItems: "center", gap: 6,
    fontSize: 14, fontWeight: 600, color: "var(--color-text-medium)",
  },
  coachAllToggle: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    background: "transparent", border: "none", cursor: "pointer", padding: "8px 4px",
    fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: "var(--color-text-medium)",
  },
  coachAllList: {
    listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8,
  },
  coachAllRow: { display: "flex", alignItems: "center", gap: 10, padding: "4px 4px" },
  coachAllRowLabel: { fontSize: 13, fontWeight: 500, color: "var(--color-text-medium)" },

  // Spine
  spine: {
    flexShrink: 0, background: "var(--surface-white)",
    borderBottom: "2px solid var(--color-border-card-soft)", padding: "16px 24px 20px",
  },
  spineHeaderRow: {
    display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16,
  },
  spineTrack: {
    listStyle: "none", margin: 0, padding: "0 0 4px",
    display: "flex", alignItems: "flex-start", width: "100%",
    // Longer languages (ES/FR/NL) scroll rather than clip — expansion
    // tolerance instead of truncation on the fixed horizontal track (UI-8).
    overflowX: "auto",
  },
  spineSeg: {
    position: "relative", flex: 1, minWidth: 132,
    display: "flex", flexDirection: "column",
  },
  spineNode: {
    display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start",
    background: "transparent", border: "1px solid transparent", borderRadius: 8,
    padding: "8px 10px", cursor: "pointer", textAlign: "left", fontFamily: "inherit",
    width: "calc(100% - 8px)", transition: "background 150ms ease",
  },
  spineNodeOpen: {
    background: "var(--color-primary-alpha-04)", border: "1px solid var(--color-border-tab)",
  },
  spineNodeTop: { display: "inline-flex", alignItems: "center", gap: 8 },
  spineIndex: {
    fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "var(--color-text-tertiary)",
  },
  spineReqTag: {
    fontSize: 10, fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase",
    color: "var(--color-text-tertiary)", background: "var(--color-chip-bg)",
    padding: "1px 6px", borderRadius: 4,
  },
  spineNodeLabel: {
    fontSize: 12, fontWeight: 600, color: "var(--color-text-medium)", lineHeight: 1.35,
  },
  spineConnector: {
    position: "absolute", top: 19, left: "calc(50% + 12px)", right: "-50%", height: 2,
    background: "var(--color-border-card-soft)",
  },
  spineDetail: {
    display: "flex", flexDirection: "column", gap: 6, marginTop: 12,
    padding: "16px", borderRadius: 8, background: "var(--surface-dim)",
    animation: "drillStepIn 150ms ease",
  },
  spineDetailHead: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" },
  spineDetailLabel: { fontSize: 16, fontWeight: 700, color: "var(--color-text-deep)" },

  // Eval
  evalScroll: { flex: 1, minHeight: 0, overflowY: "auto", background: "var(--surface-dim)" },
  evalInner: {
    maxWidth: 720, margin: "0 auto", padding: "32px 24px 40px",
    display: "flex", flexDirection: "column", gap: 20,
  },
  evalCard: { display: "flex", flexDirection: "column", gap: 16 },
  evalCardTitle: { fontSize: 16, fontWeight: 700, color: "var(--color-text-deep)" },
  evalTiles: {
    display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12,
  },
  evalTile: {
    display: "flex", flexDirection: "column", gap: 4,
    padding: "14px 16px", borderRadius: 8, background: "var(--surface-dim)",
  },
  evalTileValue: { fontSize: 22, fontWeight: 700, color: "var(--color-text-deep)" },
  evalTileLabel: { fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)" },
  evalBranchRow: {
    display: "flex", flexDirection: "column", gap: 4,
    paddingTop: 16, borderTop: "1px solid var(--color-divider-card)",
  },
  evalBranchValue: { fontSize: 14, fontWeight: 600, color: "var(--color-text-medium)" },
  evalReadyCard: { display: "flex", flexDirection: "column", gap: 8 },
  evalReadyTitle: { fontSize: 16, fontWeight: 700, color: "var(--color-text-deep)" },
  evalReadyBody: { fontSize: 13, fontWeight: 400, color: "var(--color-text-tertiary)", lineHeight: 1.55 },
  evalActions: { display: "flex", alignItems: "center", gap: 12, marginTop: 8, flexWrap: "wrap" },

  // Generic icon button — 40px clears the 44px effective target with its
  // padding (WCAG-6, per the guideline's 40px-icon-button note).
  iconBtn: {
    width: 40, height: 40, borderRadius: 8, border: "none", background: "transparent",
    cursor: "pointer", padding: 0, display: "inline-grid", placeItems: "center", flexShrink: 0,
  },

  // Visually-hidden live region (announced, not shown).
  srOnly: {
    position: "absolute", width: 1, height: 1, padding: 0, margin: -1,
    overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0,
  },

  railOnTrack: {
    display: "inline-flex", alignItems: "center", gap: 6,
    fontSize: 12, fontWeight: 600, color: "var(--color-success-text)",
  },

  // Floating switcher
  switcherCluster: {
    position: "fixed", right: 24, bottom: 24, zIndex: 50,
    display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6,
  },
  switcherLabel: {
    fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: "0.4px",
    textTransform: "uppercase", color: "var(--color-text-tertiary)",
    background: "var(--surface-white)", padding: "2px 8px", borderRadius: 4,
    boxShadow: "var(--shadow-card)",
  },
};
