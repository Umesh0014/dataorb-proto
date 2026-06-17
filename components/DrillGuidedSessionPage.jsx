"use client";

import React from "react";
import {
  Mic,
  MicOff,
  PhoneOff,
  X,
  Sparkles,
  CheckCircle2,
  Circle,
  ChevronDown,
  ArrowRight,
  BookOpen,
  EyeOff,
} from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import Banner from "./Banner";
import VersionBar from "./VersionBar";
import {
  GUIDED_DRILL_META,
  GUIDED_DRILL_STEPS,
  GUIDED_DRILL_STAGES,
  STEP_TYPE_LABEL,
  GUIDED_DRILL_SCENARIOS,
  GUIDED_DRILL_EVAL,
  formatDrillTimer,
} from "./mocks/guidedDrill";

// DrillGuidedSessionPage — the agent-side in-drill Guided Workflow view
// (progressive-disclosure direction, locked Jun 16). Role play on the left;
// a guided card on the right that shows only PREVIOUS / CURRENT / NEXT step
// — no transcript (deliberately, per Neil). A second AI checks the
// configured steps off (order-agnostic) and projects the likely next step.
// Viewing all/completed steps is a deliberate action, never forced. After
// the call the eval is shown behind a banner: the score is NOT counted
// toward the readiness profile (safety-on = assisted-mode exclusion).
//
// Three directions ride behind one switcher (audit:
// docs/tickets/drill-guided-workflow/directions.md) — they differ only in
// how the three-position card is laid out:
//   "Triptych"  — vertical prev/current/next stack (D1)
//   "Focus"     — current only, prev/next peek chips (D2)
//   "Filmstrip" — horizontal prev·current·next strip (D3)
//
// Layout note (mirrors GuideSessionPage spec §3): full-bleed session surface
// rendered outside PageLayout — 32px gutter from the 64px nav rail.

const DIRECTIONS = [
  { id: "triptych", label: "Triptych", iterations: [] },
  { id: "focus", label: "Focus", iterations: [] },
  { id: "filmstrip", label: "Filmstrip", iterations: [] },
];

// Step-type tag palette — every pairing is a ≥4.5:1 text token on its tint,
// and the meaning is always carried by the text label (never colour alone).
const TYPE_TONE = {
  compliance: { bg: "var(--color-info-bg)", fg: "var(--color-info-text)" },
  action:     { bg: "var(--color-icon-tertiary-bg)", fg: "var(--color-icon-tertiary-fg)" },
  decision:   { bg: "var(--color-warning-bg)", fg: "var(--color-warning-text)" },
};

// Derive each stage's state from the steps it contains.
function stageStateOf(stageId, steps) {
  const inStage = steps.filter((s) => s.stage === stageId);
  if (inStage.length === 0) return "pending";
  if (inStage.some((s) => s.state === "active")) return "current";
  if (inStage.every((s) => s.state === "done")) return "done";
  return "pending";
}

export default function DrillGuidedSessionPage({ onEnd }) {
  const meta = GUIDED_DRILL_META;

  const [variant, setVariant] = React.useState("triptych");
  const [steps, setSteps] = React.useState(GUIDED_DRILL_STEPS);
  const [muted, setMuted] = React.useState(false);
  const [secondsLeft, setSecondsLeft] = React.useState(meta.totalSeconds);
  const [scriptOpen, setScriptOpen] = React.useState(false);
  // Which grounding knowledge card (by title) is expanded under the script.
  const [openGround, setOpenGround] = React.useState(null);
  const [showAll, setShowAll] = React.useState(false); // deliberate "show all steps"
  const [ended, setEnded] = React.useState(false);
  // AI-behaviour demo: which scenario is being shown.
  const [scenario, setScenario] = React.useState("listen");
  const [blind, setBlind] = React.useState(false); // S2: talk not matched to a configured step
  const [correction, setCorrection] = React.useState(null); // S4: review-AI corrected step label

  const currentIdx = steps.findIndex((s) => s.state === "active");
  const currentStep = currentIdx >= 0 ? steps[currentIdx] : null;
  const prevStep =
    currentIdx >= 0
      ? steps.slice(0, currentIdx).filter((s) => s.state === "done").pop() || null
      : null;
  const nextStep =
    currentIdx >= 0
      ? steps.slice(currentIdx + 1).find((s) => s.state === "pending") || null
      : null;
  const doneCount = steps.filter((s) => s.state === "done").length;
  const stages = GUIDED_DRILL_STAGES.map((st) => ({ ...st, state: stageStateOf(st.id, steps) }));

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

  // One safe live-detection demo: the active "locate" step checks off and
  // "ipc" becomes the current step, exercising the moving three-position
  // view + auto check-off.
  React.useEffect(() => {
    const id = window.setTimeout(() => {
      setSteps((prev) =>
        prev.map((s) => {
          if (s.id === "locate") return { ...s, state: "done", at: "1:12" };
          if (s.id === "ipc") return { ...s, state: "active" };
          return s;
        }),
      );
      setScriptOpen(false);
      setOpenGround(null);
    }, 7000);
    return () => window.clearTimeout(id);
  }, []);

  const endCall = () => setEnded(true);

  // The four AI-behaviour scenarios, triggered from the demo control.
  const runScenario = (id) => {
    setScenario(id);
    if (id === "blind") {
      setBlind(true);
      setCorrection(null);
    } else if (id === "remaining") {
      setBlind(false);
      setCorrection(null);
      setShowAll(true);
    } else if (id === "correct") {
      setBlind(false);
      // The agent covered "churn" but the live AI didn't log it — a second
      // (review) AI checks it off in the background. The agent never corrects.
      setSteps((prev) =>
        prev.map((s) => (s.id === "churn" ? { ...s, state: "done", at: "2:30", corrected: true } : s)),
      );
      setCorrection("Check for a churn / competitor signal");
    } else {
      setBlind(false);
      setCorrection(null);
    }
  };

  const guideProps = {
    prevStep,
    currentStep,
    nextStep,
    steps,
    stages,
    doneCount,
    scriptOpen,
    onToggleScript: () => setScriptOpen((o) => !o),
    openGround,
    onToggleGround: (title) => setOpenGround((cur) => (cur === title ? null : title)),
    showAll,
    onToggleShowAll: () => setShowAll((o) => !o),
    scenario,
    onScenario: runScenario,
    blind,
    correction,
    onDismissCorrection: () => setCorrection(null),
  };

  return (
    <div style={styles.outer}>
      <div style={styles.card}>
        <SessionHeader meta={meta} doneCount={doneCount} total={steps.length} onClose={onEnd} />

        {/* Live region — announces the moving three-position view so a
            screen-reader user gets the same signal the visual card carries. */}
        <div role="status" aria-live="polite" style={styles.srOnly}>
          {!ended && currentStep &&
            `Now: ${currentStep.label}. ${doneCount} of ${steps.length} steps done.` +
            (nextStep ? ` Next: ${nextStep.label}.` : "")}
        </div>

        {ended ? (
          <EvalResult onBackToDrill={onEnd} onUnassisted={onEnd} />
        ) : (
          <div style={styles.body}>
            <RolePlayColumn
              meta={meta}
              muted={muted}
              secondsLeft={secondsLeft}
              onToggleMute={() => setMuted((m) => !m)}
              onEnd={endCall}
            />
            {variant === "triptych" && <TriptychGuide {...guideProps} />}
            {variant === "focus" && <FocusGuide {...guideProps} />}
            {variant === "filmstrip" && <FilmstripGuide {...guideProps} />}
          </div>
        )}
      </div>

      {!ended && (
        <VersionBar
          tabsMode
          versions={DIRECTIONS}
          baselineOptions={[]}
          value={{ versionId: variant, iterationId: null }}
          onChange={({ versionId }) => setVariant(versionId)}
        />
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
        <span style={styles.aiPill}>
          <Sparkles size={13} color="var(--color-icon-tertiary-fg)" aria-hidden="true" />
          <span style={styles.aiPillLabel}>AI-assisted mode</span>
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

// ---- Left: the role play (persona orb + mic/end) -----------------------

function RolePlayColumn({ meta, muted, secondsLeft, onToggleMute, onEnd }) {
  return (
    <aside style={styles.rolePlayCol}>
      <div style={styles.orbStack}>
        <Orb initials={meta.initials} muted={muted} />
        <div style={styles.statusBlock}>
          <span style={styles.statusHead}>{meta.customerName}</span>
          <span style={styles.statusSub}>
            {muted ? "Mic muted — tap to resume" : "Simulated customer • live"}
          </span>
        </div>
        <TimerPill secondsLeft={secondsLeft} />
        <p style={styles.scenarioBody}>{meta.scenarioBody}</p>
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
  // Orb gradient + pulse rings reuse GuideSessionPage's established session
  // visual verbatim (sibling live-session surface); the keyframes live in
  // globals.css and are reduced-motion guarded there.
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

// ---- Shared guide pieces ------------------------------------------------

function GuidePanelHeader({ doneCount, total, blind }) {
  return (
    <div style={styles.guideHead}>
      <span style={styles.guideTitle}>Guided workflow</span>
      <span style={{ ...styles.listenPill, ...(blind ? styles.listenPillBlind : null) }}>
        {blind
          ? <EyeOff size={13} color="var(--color-text-tertiary)" aria-hidden="true" />
          : <span style={styles.listenDot} aria-hidden="true" />}
        {blind ? "Listening — not a tracked step" : "AI listening"}
      </span>
      <div style={{ flex: 1 }} />
      <span style={styles.guideProg}>
        <b style={styles.guideProgNum}>{doneCount}</b>/{total} steps
      </span>
    </div>
  );
}

// The shared guide-panel shell: header + stage strip + (correction banner /
// blind note) + the variant's three-position body + deliberate show-all +
// the AI-behaviour demo control. The three variants only supply the body.
function GuideShell({
  doneCount, steps, stages, blind, correction, onDismissCorrection,
  showAll, onToggleShowAll, scenario, onScenario, scrollStyle, children,
}) {
  const total = steps.length;
  return (
    <aside style={styles.guidePanel} aria-label="Guided workflow">
      <GuidePanelHeader doneCount={doneCount} total={total} blind={blind} />
      <StageStrip stages={stages} />
      <div style={scrollStyle}>
        {correction && (
          <div style={styles.correctionBanner} role="status">
            <CheckCircle2 size={16} color="var(--color-success)" aria-hidden="true" />
            <span style={styles.correctionText}>
              Logged by the review AI: <b>{correction}</b> — heard on the recording, no action needed.
            </span>
            <button
              type="button"
              onClick={onDismissCorrection}
              aria-label="Dismiss"
              className="drill-focusable"
              style={styles.correctionDismiss}
            >
              <X size={14} color="var(--color-text-tertiary)" />
            </button>
          </div>
        )}
        {blind && (
          <div style={styles.blindNote} role="status">
            <EyeOff size={14} color="var(--color-text-tertiary)" aria-hidden="true" />
            <span style={styles.blindText}>
              The AI is listening but this isn't one of the configured steps — nothing to log. Keep going.
            </span>
          </div>
        )}
        {children}
        {showAll && <AllStepsList steps={steps} />}
        <ShowAllToggle showAll={showAll} onToggle={onToggleShowAll} doneCount={doneCount} total={total} />
      </div>
      <ScenarioBar scenario={scenario} onScenario={onScenario} />
    </aside>
  );
}

// AI-behaviour demo control — lets a reviewer trigger each of the four
// scenarios. Demo/meta tooling (like the variant switcher), not product
// chrome the agent would normally touch.
function ScenarioBar({ scenario, onScenario }) {
  const active = GUIDED_DRILL_SCENARIOS.find((s) => s.id === scenario) || GUIDED_DRILL_SCENARIOS[0];
  return (
    <div style={styles.scenarioBar}>
      <span style={styles.scenarioKicker}>AI behaviour · demo</span>
      <div style={styles.scenarioBtns} role="group" aria-label="AI behaviour scenarios">
        {GUIDED_DRILL_SCENARIOS.map((s) => {
          const on = s.id === scenario;
          return (
            <button
              key={s.id}
              type="button"
              aria-pressed={on}
              onClick={() => onScenario(s.id)}
              className="drill-focusable"
              style={{ ...styles.scenarioBtn, ...(on ? styles.scenarioBtnOn : null) }}
            >
              {s.label}
            </button>
          );
        })}
      </div>
      <span style={styles.scenarioNote}>{active.note}</span>
    </div>
  );
}

function StageStrip({ stages }) {
  const labelColor = (state) =>
    state === "pending" ? "var(--color-text-tertiary)" : "var(--color-icon-tertiary-fg)";
  const barColor = (state) =>
    state === "current"
      ? "var(--color-icon-tertiary-fg)"
      : state === "done"
      ? "var(--color-border-tab)"
      : "var(--color-divider-card)";
  return (
    <ol style={styles.stageStrip} role="list" aria-label="Conversation stages">
      {stages.map((st) => (
        <li
          key={st.id}
          role="listitem"
          aria-current={st.state === "current" ? "step" : undefined}
          style={styles.stageItem}
        >
          <span style={{ ...styles.stageLabel, color: labelColor(st.state) }}>{st.label}</span>
          <span style={{ ...styles.stageBar, background: barColor(st.state) }} aria-hidden="true" />
        </li>
      ))}
    </ol>
  );
}

function TypeTag({ type }) {
  const tone = TYPE_TONE[type] || TYPE_TONE.action;
  return (
    <span style={{ ...styles.metaTag, background: tone.bg, color: tone.fg }}>
      {STEP_TYPE_LABEL[type] || type}
    </span>
  );
}

function MandatoryTag({ mandatory }) {
  return (
    <span
      style={{
        ...styles.metaTag,
        color: mandatory ? "var(--color-text-medium)" : "var(--color-text-tertiary)",
        background: mandatory ? "var(--color-chip-bg)" : "transparent",
        border: mandatory ? "none" : "1px solid var(--color-divider-card)",
      }}
    >
      {mandatory ? "Mandatory" : "Optional"}
    </span>
  );
}

// PositionLabel — "Previous" / "Now · AI listening" / "Next".
function PositionLabel({ position }) {
  if (position === "current") {
    return (
      <span style={styles.posNow}>
        <span style={styles.activeDot} aria-hidden="true" />
        Now · AI listening here
      </span>
    );
  }
  return <span style={styles.posMuted}>{position === "previous" ? "Previous step" : "Next step"}</span>;
}

// The full current-step card: Step + type/mandatory + instruction + the two
// reveal-able assets (Script, Knowledge card) + "learn more".
function CurrentStepCard({ step, scriptOpen, onToggleScript, openGround, onToggleGround }) {
  if (!step) {
    return (
      <Card tone="outline" padX={20} padY={20} style={styles.stepCardCurrent}>
        <span style={styles.posMuted}>Listening…</span>
        <span style={styles.stepLabelLg}>Keep the conversation going</span>
        <span style={styles.stepInstruction}>
          Nothing to action right now — the AI will surface the next step when it hears it. When
          you're ready, recap and close, or use <b>Show all steps</b> below for the full list.
        </span>
      </Card>
    );
  }
  const grounds = step.knowledgeCards || [];
  return (
    <div aria-current="step" style={styles.currentCardWrap}>
    <Card tone="outline" padX={20} padY={20} style={styles.stepCardCurrent}>
      <PositionLabel position="current" />
      <div style={styles.tagRow}>
        <TypeTag type={step.type} />
        <MandatoryTag mandatory={step.mandatory} />
      </div>
      <span style={styles.stepLabelLg}>{step.label}</span>
      <span style={styles.stepInstruction}>{step.instruction}</span>

      <div style={styles.assetRow}>
        <Button variant="ai" uppercase={false} onClick={onToggleScript} className="drill-focusable" aria-expanded={scriptOpen} style={{ minHeight: 44, paddingBlock: 6 }}>
          {scriptOpen ? "Hide script support" : "Show script support"}
        </Button>
      </div>

      {scriptOpen && (
        <div style={styles.scriptBox}>
          <span style={styles.scriptKicker}>Suggested phrasing</span>
          {step.scriptBeats ? (
            <ul style={styles.beatList}>
              {step.scriptBeats.map((b) => (
                <li key={b.label} style={styles.beatItem}>
                  <span style={styles.beatLabel}>{b.label}</span>
                  <span style={styles.beatText}>“{b.text}”</span>
                </li>
              ))}
            </ul>
          ) : (
            <p style={styles.scriptText}>{step.script}</p>
          )}

          {/* Knowledge cards connected to the suggestion as its grounding —
              the AI suggests this because of these sources. */}
          {grounds.length > 0 && (
            <div style={styles.groundWrap}>
              <span style={styles.groundLabel}>Grounded in</span>
              <div style={styles.groundChips}>
                {grounds.map((k) => {
                  const on = openGround === k.title;
                  return (
                    <button
                      key={k.title}
                      type="button"
                      aria-expanded={on}
                      onClick={() => onToggleGround(k.title)}
                      className="drill-focusable"
                      style={{ ...styles.groundChip, ...(on ? styles.groundChipOn : null) }}
                    >
                      <BookOpen size={12} color={on ? "var(--surface-white)" : "var(--color-icon-tertiary-fg)"} aria-hidden="true" />
                      {k.title}
                    </button>
                  );
                })}
              </div>
              {grounds.filter((k) => k.title === openGround).map((k) => (
                <div key={k.title} style={styles.knowledgeCard}>
                  <span style={styles.knowledgeTitle}>{k.title}</span>
                  <p style={styles.knowledgeText}>{k.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => { /* out of scope — deep-link to the step's knowledge */ }}
        className="drill-focusable"
        style={styles.learnMore}
      >
        Learn more about this step
      </button>
    </Card>
    </div>
  );
}

// A one-line collapsed peek for the previous / next step.
function PeekCard({ step, position }) {
  return (
    <Card tone="muted" padX={16} padY={12} style={styles.peekCard}>
      <PositionLabel position={position} />
      <span style={styles.peekRow}>
        {position === "previous" ? (
          <CheckCircle2 size={15} color="var(--color-success)" aria-hidden="true" />
        ) : (
          <Circle size={14} color="var(--color-text-tertiary)" aria-hidden="true" />
        )}
        <span style={styles.peekLabel}>{step ? step.label : position === "previous" ? "Start of call" : "End of call"}</span>
        {step?.at && <span style={styles.peekAt}>{step.at}</span>}
      </span>
    </Card>
  );
}

// A thin inline peek line (Focus variant): "‹ previous   next ›".
function PeekLine({ step, position }) {
  return (
    <span style={styles.peekLine}>
      {position === "previous" && step && (
        <CheckCircle2 size={13} color="var(--color-success)" aria-hidden="true" />
      )}
      <span style={styles.peekLineLabel}>
        {position === "previous" ? "Prev: " : "Next: "}
        {step ? step.label : position === "previous" ? "—" : "Close & wrap up"}
      </span>
      {position === "next" && step && (
        <ArrowRight size={13} color="var(--color-text-tertiary)" aria-hidden="true" />
      )}
    </span>
  );
}

// The deliberate "show all steps" list — never forced; opened from a button.
function AllStepsList({ steps }) {
  return (
    <ol style={styles.allList} role="list">
      {steps.map((s, i) => {
        const done = s.state === "done";
        const active = s.state === "active";
        return (
          <li key={s.id} role="listitem" style={styles.allRow} aria-current={active ? "step" : undefined}>
            <span style={styles.allIcon} aria-hidden="true">
              {done
                ? <CheckCircle2 size={15} color="var(--color-success)" />
                : active
                ? <span style={styles.activeDot} />
                : <Circle size={14} color="var(--color-text-tertiary)" />}
            </span>
            <span style={styles.allIndex}>{i + 1}</span>
            <span style={{ ...styles.allLabel, color: done || active ? "var(--color-text-deep)" : "var(--color-text-tertiary)" }}>
              {s.label}
            </span>
            {s.corrected && <span style={styles.reviewTag}>Review AI</span>}
            <TypeTag type={s.type} />
          </li>
        );
      })}
    </ol>
  );
}

function ShowAllToggle({ showAll, onToggle, doneCount, total }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={showAll}
      className="drill-focusable"
      style={styles.showAllBtn}
    >
      <span>{showAll ? "Hide all steps" : `Show all steps (${doneCount}/${total} done)`}</span>
      <ChevronDown
        size={16}
        color="var(--color-text-tertiary)"
        style={{ transform: showAll ? "rotate(180deg)" : "none", transition: "transform 150ms ease" }}
      />
    </button>
  );
}

// ---- Variant A — Triptych ----------------------------------------------

function TriptychGuide(props) {
  const { prevStep, currentStep, nextStep, scriptOpen, onToggleScript, openGround, onToggleGround } = props;
  return (
    <GuideShell {...props} scrollStyle={styles.guideScroll}>
      <PeekCard step={prevStep} position="previous" />
      <CurrentStepCard
        step={currentStep}
        scriptOpen={scriptOpen}
        onToggleScript={onToggleScript}
        openGround={openGround}
        onToggleGround={onToggleGround}
      />
      <PeekCard step={nextStep} position="next" />
    </GuideShell>
  );
}

// ---- Variant B — Focus -------------------------------------------------

function FocusGuide(props) {
  const { prevStep, currentStep, nextStep, scriptOpen, onToggleScript, openGround, onToggleGround } = props;
  return (
    <GuideShell {...props} scrollStyle={styles.focusScroll}>
      <div style={styles.peekLineRow}>
        <PeekLine step={prevStep} position="previous" />
      </div>
      <div style={styles.focusCardWrap}>
        <CurrentStepCard
          step={currentStep}
          scriptOpen={scriptOpen}
          onToggleScript={onToggleScript}
          openGround={openGround}
          onToggleGround={onToggleGround}
        />
      </div>
      <div style={styles.peekLineRow}>
        <PeekLine step={nextStep} position="next" />
      </div>
    </GuideShell>
  );
}

// ---- Variant C — Filmstrip ---------------------------------------------

function FilmstripGuide(props) {
  const { prevStep, currentStep, nextStep, scriptOpen, onToggleScript, openGround, onToggleGround } = props;
  return (
    <GuideShell {...props} scrollStyle={styles.filmScroll}>
      <div style={styles.filmstrip}>
        <div style={styles.filmSide}>
          <PeekCard step={prevStep} position="previous" />
        </div>
        <div style={styles.filmCenter}>
          <CurrentStepCard
            step={currentStep}
            scriptOpen={scriptOpen}
            onToggleScript={onToggleScript}
        openGround={openGround}
        onToggleGround={onToggleGround}
          />
        </div>
        <div style={styles.filmSide}>
          <PeekCard step={nextStep} position="next" />
        </div>
      </div>
    </GuideShell>
  );
}

// ---- Post-session eval (shared) ----------------------------------------

function EvalResult({ onBackToDrill, onUnassisted }) {
  const e = GUIDED_DRILL_EVAL;
  const tiles = [
    { label: "Overall score (excluded)", value: `${e.overallScore}%` },
    { label: "Steps completed", value: `${e.stepsDone} of ${e.stepsTotal}` },
    { label: "Mandatory steps missed", value: String(e.mandatoryMissed) },
    { label: "Scripts viewed", value: String(e.scriptsViewed) },
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
            <span style={styles.evalTileLabel}>Stages reached</span>
            <span style={styles.evalBranchValue}>{e.stagesReached}</span>
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
            <Button variant="text" uppercase={false} onClick={onBackToDrill} className="drill-focusable">
              Back to Drill library
            </Button>
          </div>
        </Card>
      </div>
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
    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
    padding: "14px 20px 14px 24px",
    borderBottom: "2px solid var(--color-border-card-soft)", flexShrink: 0,
  },
  headerLeft: { display: "inline-flex", alignItems: "center", gap: 12, minWidth: 0, flexWrap: "wrap" },
  workflowTitle: { fontSize: 16, fontWeight: 700, lineHeight: 1.3, color: "var(--color-text-deep)" },
  scenarioTitle: { fontSize: 14, fontWeight: 500, lineHeight: 1.3, color: "var(--color-text-medium)" },
  headerDot: { width: 3, height: 3, borderRadius: 999, background: "var(--color-text-tertiary)", flexShrink: 0 },
  interactionId: {
    fontSize: 13, fontWeight: 400, letterSpacing: "0.25px",
    color: "var(--color-text-tertiary)", fontFamily: "var(--font-mono)",
  },
  headerRight: { display: "inline-flex", alignItems: "center", gap: 12, flexShrink: 0 },
  aiPill: {
    display: "inline-flex", alignItems: "center", gap: 6, height: 26, padding: "0 10px",
    background: "var(--color-icon-tertiary-bg)", borderRadius: 999,
  },
  aiPillLabel: { fontSize: 12, fontWeight: 700, letterSpacing: "0.2px", color: "var(--color-icon-tertiary-fg)" },
  sessionsCount: { fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)", fontFamily: "var(--font-mono)" },
  progressCount: { fontSize: 13, fontWeight: 700, color: "var(--color-text-deep)", fontFamily: "var(--font-mono)" },

  // Body
  body: { flex: 1, display: "flex", alignItems: "stretch", minHeight: 0 },

  // Left role-play column (50/50 with the guide panel)
  rolePlayCol: {
    width: "50%", flexShrink: 1, display: "flex", flexDirection: "column",
    background: "var(--surface-white)", borderRight: "2px solid var(--color-border-card-soft)",
    padding: "24px 24px 0",
  },
  orbStack: {
    flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18,
    minHeight: 0,
  },
  orbWrap: { position: "relative", width: 168, height: 168, display: "inline-grid", placeItems: "center" },
  orbRingOuter: {
    position: "absolute", inset: 0, borderRadius: "50%",
    background: "radial-gradient(circle at 30% 30%, rgba(247, 217, 235, 0.7), rgba(195, 199, 242, 0.5) 60%, transparent 80%)",
    filter: "blur(8px)", animation: "orbPulseOuter 4s ease-in-out infinite",
  },
  orbRingMid: {
    position: "absolute", inset: 22, borderRadius: "50%",
    background: "radial-gradient(circle at 35% 35%, rgba(247, 217, 235, 0.9), rgba(220, 195, 240, 0.7) 65%)",
    filter: "blur(4px)", animation: "orbPulseMid 3s ease-in-out infinite",
  },
  orb: {
    position: "relative", width: 120, height: 120, borderRadius: "50%",
    background: "radial-gradient(circle at 32% 32%, #FFFFFF 0%, #F7D9EB 35%, #C3C7F2 90%)",
    boxShadow: "inset 0 -10px 20px rgba(102, 80, 165, 0.18), 0 8px 24px rgba(102, 80, 165, 0.15)",
    display: "inline-grid", placeItems: "center",
  },
  orbInitials: { fontFamily: "var(--font-sans)", fontSize: 28, fontWeight: 700, letterSpacing: "0.5px", color: "#6650A5" },
  statusBlock: { display: "flex", flexDirection: "column", alignItems: "center", gap: 4, textAlign: "center" },
  statusHead: { fontSize: 14, fontWeight: 700, color: "var(--color-text-deep)" },
  statusSub: { fontSize: 12, fontWeight: 400, letterSpacing: "0.2px", color: "var(--color-text-tertiary)" },
  timerPill: {
    display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 12px",
    background: "var(--color-chip-bg)", borderRadius: 4,
  },
  timerDot: { width: 6, height: 6, borderRadius: 999, background: "var(--color-success)" },
  timerLabel: {
    fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 500, letterSpacing: "0.1px",
    color: "var(--color-text-medium)",
  },
  scenarioBody: {
    margin: 0, maxWidth: 360, textAlign: "center",
    fontSize: 13, fontWeight: 400, lineHeight: 1.6, color: "var(--color-text-tertiary)",
  },
  controlsRow: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 16, padding: "24px 0", flexShrink: 0,
  },
  mutePill: {
    width: 72, height: 44, background: "var(--surface-white)",
    border: "1px solid var(--color-divider-card)", borderRadius: 8,
    cursor: "pointer", display: "inline-grid", placeItems: "center", padding: 0, transition: "background 150ms ease",
  },
  endPill: {
    width: 66, height: 44, background: "var(--color-error-dark)", border: "none", borderRadius: 8,
    cursor: "pointer", display: "inline-grid", placeItems: "center", padding: 0, transition: "background 150ms ease",
  },
  disclaimer: {
    margin: 0, padding: "16px 8px", borderTop: "1px solid var(--color-border-card-soft)",
    fontSize: 12, fontWeight: 400, lineHeight: 1.5, color: "var(--color-text-tertiary)", textAlign: "center",
  },

  // Guide panel (right)
  guidePanel: {
    flex: 1, minWidth: 0, display: "flex", flexDirection: "column",
    background: "var(--surface-white)", minHeight: 0,
  },
  guideHead: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "16px 22px 12px", flexShrink: 0,
  },
  guideTitle: { fontSize: 15, fontWeight: 700, color: "var(--color-text-deep)" },
  listenPill: {
    display: "inline-flex", alignItems: "center", gap: 7,
    fontSize: 12, fontWeight: 600, color: "var(--color-icon-tertiary-fg)",
    background: "var(--color-icon-tertiary-bg)", borderRadius: 999, padding: "4px 11px",
  },
  listenDot: {
    width: 7, height: 7, borderRadius: 999, background: "var(--color-icon-tertiary-fg)",
    boxShadow: "0 0 0 3px var(--color-primary-alpha-08)",
  },
  guideProg: { fontSize: 12, color: "var(--color-text-tertiary)", fontFamily: "var(--font-mono)" },
  guideProgNum: { color: "var(--color-text-deep)", fontWeight: 700 },

  // Stage strip
  stageStrip: { listStyle: "none", margin: 0, padding: "0 22px 8px", display: "flex", gap: 5 },
  stageItem: { flex: 1, textAlign: "center", display: "flex", flexDirection: "column", gap: 7, paddingBottom: 6 },
  stageLabel: { fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" },
  stageBar: { height: 3, borderRadius: 2 },

  // Scroll bodies
  guideScroll: {
    flex: 1, minHeight: 0, overflowY: "auto", padding: "10px 22px 22px",
    display: "flex", flexDirection: "column", gap: 12,
  },
  focusScroll: {
    flex: 1, minHeight: 0, overflowY: "auto", padding: "12px 22px 22px",
    display: "flex", flexDirection: "column", gap: 14,
  },
  filmScroll: {
    flex: 1, minHeight: 0, overflowY: "auto", padding: "10px 18px 22px",
    display: "flex", flexDirection: "column", gap: 14,
  },

  // Current step card
  stepCardCurrent: {
    display: "flex", flexDirection: "column", gap: 8,
    borderColor: "var(--color-icon-tertiary-fg)", boxShadow: "var(--shadow-card)",
    animation: "drillStepIn 150ms ease",
  },
  tagRow: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" },
  posNow: {
    display: "inline-flex", alignItems: "center", gap: 8,
    fontSize: 12, fontWeight: 700, letterSpacing: "0.2px", color: "var(--color-button-primary-bg)",
  },
  posMuted: {
    fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
    color: "var(--color-text-tertiary)",
  },
  activeDot: {
    width: 9, height: 9, borderRadius: 999, background: "var(--color-button-primary-bg)",
    boxShadow: "0 0 0 3px var(--color-primary-alpha-12)", display: "inline-block",
  },
  stepLabelLg: { fontSize: 17, fontWeight: 700, color: "var(--color-text-deep)", lineHeight: 1.35 },
  stepInstruction: { fontSize: 13, fontWeight: 400, color: "var(--color-text-tertiary)", lineHeight: 1.55 },
  metaTag: {
    display: "inline-flex", alignItems: "center", height: 20, padding: "0 8px",
    borderRadius: 4, fontSize: 11, fontWeight: 700, letterSpacing: "0.3px",
  },
  assetRow: { display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginTop: 2 },
  // Grounding — knowledge cards attached to the suggestion as its source.
  groundWrap: {
    display: "flex", flexDirection: "column", gap: 8,
    marginTop: 8, paddingTop: 10, borderTop: "1px dashed var(--color-icon-tertiary-fg)",
  },
  groundLabel: {
    fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
    color: "var(--color-icon-tertiary-fg)",
  },
  groundChips: { display: "flex", gap: 6, flexWrap: "wrap" },
  groundChip: {
    display: "inline-flex", alignItems: "center", gap: 5, minHeight: 28, padding: "4px 10px",
    borderRadius: 999, cursor: "pointer", border: "1px solid var(--color-icon-tertiary-fg)",
    background: "var(--surface-white)", fontFamily: "inherit", fontSize: 12, fontWeight: 600,
    color: "var(--color-icon-tertiary-fg)", transition: "background 150ms ease, color 150ms ease",
  },
  groundChipOn: { background: "var(--color-icon-tertiary-fg)", color: "var(--surface-white)" },
  currentCardWrap: { minWidth: 0 },
  scriptBox: {
    display: "flex", flexDirection: "column", gap: 4, padding: "10px 12px", borderRadius: 8,
    background: "var(--color-icon-tertiary-bg)", animation: "drillStepIn 150ms ease",
  },
  scriptKicker: {
    fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
    color: "var(--color-icon-tertiary-fg)",
  },
  scriptText: { margin: 0, fontSize: 13, fontWeight: 500, lineHeight: 1.5, color: "var(--color-text-medium)" },
  knowledgeCard: {
    display: "flex", flexDirection: "column", gap: 4, padding: "12px 14px", borderRadius: 8,
    background: "var(--surface-dim)", border: "1px solid var(--color-divider-card)",
    animation: "drillStepIn 150ms ease",
  },
  knowledgeTitle: { fontSize: 13, fontWeight: 700, color: "var(--color-text-deep)" },
  knowledgeText: { margin: 0, fontSize: 12, fontWeight: 400, lineHeight: 1.55, color: "var(--color-text-tertiary)" },
  learnMore: {
    alignSelf: "flex-start", background: "transparent", border: "none", cursor: "pointer",
    padding: "10px 0", minHeight: 44,
    fontFamily: "inherit", fontSize: 12, fontWeight: 600, color: "var(--color-button-primary-bg)",
    textDecoration: "underline",
  },

  // Peek cards
  peekCard: { display: "flex", flexDirection: "column", gap: 6 },
  peekRow: { display: "inline-flex", alignItems: "center", gap: 8 },
  peekLabel: { fontSize: 13, fontWeight: 600, color: "var(--color-text-medium)", lineHeight: 1.4 },
  peekAt: { marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-text-tertiary)" },

  // Peek line (Focus) — a defined chip, not a faint caption, so prev/next
  // read as part of the guidance (raises affordance — INT-1).
  peekLineRow: { display: "flex", justifyContent: "center" },
  peekLine: {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "6px 12px", borderRadius: 999,
    background: "var(--color-chip-bg)", border: "1px solid var(--color-divider-card)",
    maxWidth: "100%",
  },
  peekLineLabel: {
    fontSize: 12, fontWeight: 600, color: "var(--color-text-medium)",
    minWidth: 0, overflowWrap: "anywhere",
  },
  focusCardWrap: { display: "flex", justifyContent: "center" },

  // Filmstrip — side cards keep a min-width and the strip scrolls rather
  // than clipping when ES/FR/NL step labels run long (UI-8 expansion
  // tolerance instead of truncation).
  filmstrip: { display: "flex", alignItems: "flex-start", gap: 12, overflowX: "auto" },
  filmSide: { flex: "1 1 132px", minWidth: 132 },
  filmCenter: { flex: "1.6 1 220px", minWidth: 220 },

  // Show-all list
  showAllBtn: {
    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, minHeight: 44,
    background: "transparent", border: "none", cursor: "pointer", padding: "12px 2px", marginTop: 2,
    fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: "var(--color-text-medium)",
  },
  allList: {
    listStyle: "none", margin: 0, padding: "12px 0 0", borderTop: "1px solid var(--color-border-card-soft)",
    display: "flex", flexDirection: "column", gap: 10, animation: "drillStepIn 150ms ease",
  },
  allRow: { display: "flex", alignItems: "center", gap: 10 },
  allIcon: { width: 16, display: "inline-grid", placeItems: "center", flexShrink: 0 },
  allIndex: { fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "var(--color-text-tertiary)", width: 14, flexShrink: 0 },
  allLabel: { flex: 1, fontSize: 13, fontWeight: 500, lineHeight: 1.4, minWidth: 0 },

  // Generic icon button (40px clears 44px effective target — WCAG-6)
  iconBtn: {
    width: 40, height: 40, borderRadius: 8, border: "none", background: "transparent",
    cursor: "pointer", padding: 0, display: "inline-grid", placeItems: "center", flexShrink: 0,
  },
  srOnly: {
    position: "absolute", width: 1, height: 1, padding: 0, margin: -1,
    overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0,
  },

  // Listening pill — "not tracked" (blind) state
  listenPillBlind: { background: "var(--color-chip-bg)", color: "var(--color-text-tertiary)" },

  // Correction banner (S4 — review AI logged a step)
  correctionBanner: {
    display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 12px", borderRadius: 8,
    background: "var(--color-success-bg)", border: "1px solid var(--color-success)",
    animation: "drillStepIn 150ms ease",
  },
  correctionText: { flex: 1, fontSize: 12.5, fontWeight: 500, lineHeight: 1.5, color: "var(--color-success-text)" },
  correctionDismiss: {
    width: 28, height: 28, borderRadius: 6, border: "none", background: "transparent",
    cursor: "pointer", padding: 0, display: "inline-grid", placeItems: "center", flexShrink: 0,
  },

  // Blind note (S2 — talk not matched to a configured step)
  blindNote: {
    display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 12px", borderRadius: 8,
    background: "var(--surface-dim)", border: "1px solid var(--color-divider-card)",
  },
  blindText: { flex: 1, fontSize: 12.5, fontWeight: 400, lineHeight: 1.5, color: "var(--color-text-tertiary)" },

  // Script support beats
  beatList: { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6 },
  beatItem: { display: "flex", flexDirection: "column", gap: 1 },
  beatLabel: {
    fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase",
    color: "var(--color-icon-tertiary-fg)",
  },
  beatText: { fontSize: 13, fontWeight: 500, lineHeight: 1.45, color: "var(--color-text-medium)" },

  // Knowledge cards (multiple)
  reviewTag: {
    display: "inline-flex", alignItems: "center", height: 20, padding: "0 8px", borderRadius: 4,
    fontSize: 11, fontWeight: 700, letterSpacing: "0.2px",
    background: "var(--color-success-bg)", color: "var(--color-success-text)",
  },

  // AI-behaviour demo control
  scenarioBar: {
    flexShrink: 0, display: "flex", flexDirection: "column", gap: 6,
    padding: "12px 22px 16px", borderTop: "1px solid var(--color-border-card-soft)",
    background: "var(--color-surface-header-tinted)",
  },
  scenarioKicker: {
    fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: "0.4px",
    textTransform: "uppercase", color: "var(--color-text-tertiary)",
  },
  scenarioBtns: { display: "flex", gap: 6, flexWrap: "wrap" },
  scenarioBtn: {
    minHeight: 32, padding: "6px 12px", borderRadius: 999, cursor: "pointer",
    // text-tertiary border clears the 3:1 non-text control-boundary floor on
    // the tinted bar (WCAG-1), so the pill reads as a control independent of
    // its label.
    border: "1px solid var(--color-text-tertiary)", background: "var(--surface-white)",
    fontFamily: "inherit", fontSize: 12, fontWeight: 600, color: "var(--color-text-medium)",
    transition: "background 150ms ease, color 150ms ease, border-color 150ms ease",
  },
  scenarioBtnOn: {
    background: "var(--color-icon-tertiary-bg)", borderColor: "var(--color-icon-tertiary-fg)",
    color: "var(--color-icon-tertiary-fg)",
  },
  scenarioNote: { fontSize: 12, fontWeight: 400, lineHeight: 1.45, color: "var(--color-text-tertiary)" },

  // Eval
  evalScroll: { flex: 1, minHeight: 0, overflowY: "auto", background: "var(--surface-dim)" },
  evalInner: { maxWidth: 720, margin: "0 auto", padding: "32px 24px 40px", display: "flex", flexDirection: "column", gap: 20 },
  evalCard: { display: "flex", flexDirection: "column", gap: 16 },
  evalCardTitle: { fontSize: 16, fontWeight: 700, color: "var(--color-text-deep)" },
  evalTiles: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 },
  evalTile: {
    display: "flex", flexDirection: "column", gap: 4, padding: "14px 16px", borderRadius: 8,
    background: "var(--surface-dim)",
  },
  evalTileValue: { fontSize: 22, fontWeight: 700, color: "var(--color-text-deep)" },
  evalTileLabel: { fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)" },
  evalBranchRow: { display: "flex", flexDirection: "column", gap: 4, paddingTop: 16, borderTop: "1px solid var(--color-divider-card)" },
  evalBranchValue: { fontSize: 14, fontWeight: 600, color: "var(--color-text-medium)" },
  evalReadyCard: { display: "flex", flexDirection: "column", gap: 8 },
  evalReadyTitle: { fontSize: 16, fontWeight: 700, color: "var(--color-text-deep)" },
  evalReadyBody: { fontSize: 13, fontWeight: 400, color: "var(--color-text-tertiary)", lineHeight: 1.55 },
  evalActions: { display: "flex", alignItems: "center", gap: 12, marginTop: 8, flexWrap: "wrap" },
};
