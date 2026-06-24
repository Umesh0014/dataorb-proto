"use client";

import React from "react";
import {
  ChevronDown, ChevronUp, Plus, Trash2, X, MessageSquareQuote, BookOpen,
  GitBranch, ArrowRight, ArrowLeft, Sparkles, ExternalLink, Search, Check,
} from "lucide-react";
import Button from "./Button";
import { Overlay } from "./GuidedWorkflowDialogs";
import { TypeTag, RequirementTag, GroundingChip } from "./GuidedWorkflowBits";
import {
  GW_STAGES, gwGroupStage, GW_SCENARIOS, GW_LIKELY_QUESTIONS, GW_KB_CARDS, GW_REVIEW_CONTEXT,
} from "./mocks/guidedWorkflows";

// Review & publish · vertical stepper with progressive disclosure. One stage
// on screen at a time, driven by a horizontal stepper (Open → Close, then a
// Knowledge node). Act is triage: a path selector + a "run this path when"
// decision banner with trigger cues. Step cards open a Hints drawer (say /
// listen-for / if-then / best-practice). The Knowledge stage equips each
// likely customer question with an answer card — attach an existing one or
// draft one from raw knowledge. The context panel carries the winning insight
// and steps aside the moment curation begins.

const ORDER = [...GW_STAGES.map((s) => s.id), "knowledge"];
const STAGE_LABEL = Object.fromEntries(GW_STAGES.map((s) => [s.id, s.label]));

const HINT_META = {
  say: { label: "Say", color: "var(--color-icon-tertiary-fg)", bg: "var(--color-icon-tertiary-bg)" },
  listenFor: { label: "Listen for", color: "var(--color-info-text)", bg: "var(--color-info-bg)" },
  ifThen: { label: "If / then", color: "var(--color-text-medium)", bg: "var(--color-chip-bg)" },
  bestPractice: { label: "Best practice", color: "var(--color-success-text)", bg: "var(--color-success-bg)" },
};

// Hints are synthesised from a step's existing assets: the script reads as a
// "say" hint, each conditional sub-step as an "if-then", the knowledge card as
// a "best-practice". Edits live in local prototype state.
function seedHints(step) {
  const h = [];
  if (step.script) h.push({ type: "say", text: step.script });
  (step.subSteps || []).forEach((s) => h.push({ type: "ifThen", text: s.label }));
  if (step.knowledge) h.push({ type: "bestPractice", text: step.knowledge.body });
  return h;
}

const DRAFTS = {
  "q-01": { title: "Why a healthy line still drops WiFi", body: "Your line's in sync — the green light confirms it. Drops like this are almost always WiFi reach: distance, walls, or too many devices on one band. Moving the router into the open and splitting the 2.4 and 5GHz bands usually steadies it." },
  "q-02": { title: "When your area outage will clear", body: "There's a confirmed outage in your area, so it's nothing on your side. The current estimate is restoration by early evening, and I'll register you for an automatic text the moment it's back so you don't need to call again." },
  "q-03": { title: "Whether the engineer visit is free", body: "A confirmed line fault is repaired at no charge. The only time a charge applies is if the engineer finds the fault is inside your home — your own wiring or equipment — and I'd flag that risk before booking." },
  "q-04": { title: "Getting full speed back after the fix", body: "Once the line's stable, a device next to the router should see your full plan speed. If it still feels slow further away, that's WiFi range rather than the line — the WiFi app shows per-room signal and where a booster would help." },
};

export default function GuidedWorkflowReviewEditor({
  stagesWithSteps, onUpdateInstruction, onCycleType, onCycleRequirement, onRemove, onAddBlank,
}) {
  const actScenarios = gwGroupStage((stagesWithSteps.find((s) => s.id === "act") || {}).steps || []).scenarios;
  const [stage, setStage] = React.useState("open");
  const [triage, setTriage] = React.useState(actScenarios[0]?.id || null);
  const [visited, setVisited] = React.useState(() => new Set(["open"]));
  const [ctxCollapsed, setCtxCollapsed] = React.useState(false);
  const [hintsStep, setHintsStep] = React.useState(null);
  const [hintMap, setHintMap] = React.useState({});
  const [answers, setAnswers] = React.useState({});
  const [knQ, setKnQ] = React.useState(null);

  const go = (s) => { setStage(s); setVisited((v) => new Set(v).add(s)); };
  const touch = () => setCtxCollapsed(true);
  const hintsFor = (step) => hintMap[step.id] || seedHints(step);

  const stageObj = GW_STAGES.find((s) => s.id === stage);
  const steps = stage === "act"
    ? (actScenarios.find((sc) => sc.id === triage)?.steps || [])
    : (stagesWithSteps.find((s) => s.id === stage)?.steps || []);
  const idx = ORDER.indexOf(stage);
  const assignedCount = Object.keys(answers).length;

  return (
    <div style={styles.wrap}>
      <ContextPanel collapsed={ctxCollapsed} onToggle={() => setCtxCollapsed((c) => !c)} />

      <nav style={styles.stepper} aria-label="Workflow stages">
        {GW_STAGES.map((s, i) => {
          const done = visited.has(s.id) && s.id !== stage;
          const active = s.id === stage;
          const count = s.id === "act" ? `${actScenarios.length} paths` : `${s.steps?.length ?? stagesWithSteps.find((x) => x.id === s.id)?.steps.length ?? 0} steps`;
          return (
            <button key={s.id} type="button" onClick={() => go(s.id)} className="gw-focusable" style={{ ...styles.node, ...(active ? styles.nodeActive : null) }}>
              <span style={{ ...styles.num, ...(active ? styles.numActive : done ? styles.numDone : null) }}>{done ? <Check size={13} /> : i + 1}</span>
              <span style={styles.nodeMeta}>
                <span style={{ ...styles.nodeName, ...(active ? styles.nodeNameActive : null) }}>{s.label}</span>
                <span style={styles.nodeCt}>{count}</span>
              </span>
            </button>
          );
        })}
        <span style={styles.navDiv} aria-hidden="true" />
        <button type="button" onClick={() => go("knowledge")} className="gw-focusable" style={{ ...styles.node, ...(stage === "knowledge" ? styles.nodeActive : null) }}>
          <span style={{ ...styles.num, ...(stage === "knowledge" ? styles.numActive : assignedCount === GW_LIKELY_QUESTIONS.length ? styles.numDone : null) }}>
            {assignedCount === GW_LIKELY_QUESTIONS.length ? <Check size={13} /> : <BookOpen size={13} />}
          </span>
          <span style={styles.nodeMeta}>
            <span style={{ ...styles.nodeName, ...(stage === "knowledge" ? styles.nodeNameActive : null) }}>Knowledge</span>
            <span style={styles.nodeCt}>{assignedCount}/{GW_LIKELY_QUESTIONS.length} assigned</span>
          </span>
        </button>
      </nav>

      <section style={styles.panel}>
        {stage === "knowledge" ? (
          <KnowledgeStage answers={answers} onOpen={(q, mode) => setKnQ({ q, mode })} onDetach={(qid) => { setAnswers((a) => { const n = { ...a }; delete n[qid]; return n; }); touch(); }} />
        ) : (
          <>
            <div style={styles.lead}><span style={styles.leadBar} aria-hidden="true" /><span style={styles.leadTxt}>{stageObj.purpose}</span></div>

            {stage === "act" && (
              <>
                <div style={styles.triageTabs}>
                  {actScenarios.map((sc) => (
                    <button key={sc.id} type="button" onClick={() => setTriage(sc.id)} className="gw-focusable" style={{ ...styles.triageTab, ...(sc.id === triage ? styles.triageTabActive : null) }}>
                      <span style={styles.lanePill}><GitBranch size={12} color="var(--color-icon-tertiary-fg)" />{sc.label}</span>
                      <span style={styles.triageName}>{sc.trigger}</span>
                      <span style={styles.triageCt}>{sc.steps.length} steps · {GW_SCENARIOS[sc.id]?.cues.length || 0} cues</span>
                    </button>
                  ))}
                </div>
                <ForkBanner scenario={GW_SCENARIOS[triage]} />
              </>
            )}

            {steps.map((step, i) => (
              <StepCard
                key={step.id} step={step} ord={i + 1} hintCount={hintsFor(step).length}
                onEdit={(v) => { onUpdateInstruction(step.id, v); touch(); }}
                onType={() => { onCycleType(step.id); touch(); }}
                onReq={() => { onCycleRequirement(step.id); touch(); }}
                onHints={() => setHintsStep(step)}
                onRemove={() => { onRemove(step.id); touch(); }}
              />
            ))}

            <button type="button" onClick={() => { onAddBlank(stage === "act" ? "act" : stage); touch(); }} className="gw-focusable" style={styles.addStep}>
              <Plus size={16} /> Add a step
            </button>

            <div style={styles.panelNav}>
              {idx > 0 ? (
                <Button variant="text" uppercase={false} leadingIcon={<ArrowLeft size={15} />} onClick={() => go(ORDER[idx - 1])}>
                  {ORDER[idx - 1] === "knowledge" ? "Knowledge" : STAGE_LABEL[ORDER[idx - 1]]}
                </Button>
              ) : <span />}
              <Button variant="primary" onClick={() => go(ORDER[idx + 1])}>
                <span style={styles.nextInner}>{ORDER[idx + 1] === "knowledge" ? "Assign knowledge" : STAGE_LABEL[ORDER[idx + 1]]} <ArrowRight size={15} /></span>
              </Button>
            </div>
          </>
        )}
      </section>

      {hintsStep && (
        <HintsDrawer
          step={hintsStep} hints={hintsFor(hintsStep)}
          onChange={(next) => { setHintMap((m) => ({ ...m, [hintsStep.id]: next })); touch(); }}
          onClose={() => setHintsStep(null)}
        />
      )}
      {knQ && (
        <KnowledgeDrawer
          q={knQ.q} mode={knQ.mode}
          onClose={() => setKnQ(null)}
          onAttach={(card) => { setAnswers((a) => ({ ...a, [knQ.q.id]: card })); touch(); setKnQ(null); }}
        />
      )}
    </div>
  );
}

function ContextPanel({ collapsed, onToggle }) {
  return (
    <div style={{ ...styles.ctx, ...(collapsed ? styles.ctxCollapsed : null) }}>
      <div style={styles.ctxBar}>
        <span style={styles.ctxLabel}>Context</span>
        <span style={styles.ctxSrc}>Generated from interaction <b>30471</b></span>
        <button type="button" className="gw-focusable" style={styles.ctxView}>View interaction <ExternalLink size={12} /></button>
        <span style={{ flex: 1 }} />
        <button type="button" onClick={onToggle} className="gw-focusable" style={styles.ctxToggle}>
          {collapsed ? "Show context" : "Hide context"}{collapsed ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
        </button>
      </div>
      {!collapsed && (
        <div style={styles.ctxGrid}>
          <div style={styles.ctxCol}>
            <div style={styles.ctxH}>Customer situation</div>
            <p style={styles.ctxP}>{GW_REVIEW_CONTEXT.situation}</p>
          </div>
          <div style={{ ...styles.ctxCol, ...styles.ctxColAccent }}>
            <div style={styles.ctxH}><Sparkles size={13} color="var(--color-icon-tertiary-fg)" /> Winning insight</div>
            <p style={styles.ctxP}>{GW_REVIEW_CONTEXT.insight}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ForkBanner({ scenario }) {
  const [open, setOpen] = React.useState(false);
  if (!scenario) return null;
  return (
    <div style={styles.fork}>
      <div style={styles.forkTtl}><GitBranch size={13} color="var(--color-icon-tertiary-fg)" /> Decision · run this path when</div>
      <div style={styles.forkQ}>{scenario.triggerScenario}</div>
      <button type="button" onClick={() => setOpen((o) => !o)} className="gw-focusable" style={styles.cuesToggle}>
        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />} {scenario.cues.length} trigger cues
      </button>
      {open && (
        <div style={styles.cues}>
          {scenario.cues.map((c) => <div key={c} style={styles.cue}><span style={styles.cueB} aria-hidden="true">▸</span><span>{c}</span></div>)}
        </div>
      )}
    </div>
  );
}

function StepCard({ step, ord, hintCount, onEdit, onType, onReq, onHints, onRemove }) {
  return (
    <div style={styles.scard}>
      <div style={styles.scardTop}>
        <span style={styles.ordPill}>{ord}</span>
        <button type="button" onClick={onType} className="gw-focusable" style={styles.tagBtn} aria-label="Change type"><TypeTag type={step.type} /></button>
        <span style={{ flex: 1 }} />
        <GroundingChip grounding={step.grounding} />
        <span style={styles.scardId}>{step.id}</span>
      </div>
      <div
        contentEditable suppressContentEditableWarning spellCheck={false}
        style={styles.instr} className="gw-focusable"
        onBlur={(e) => { const v = e.currentTarget.textContent.trim(); if (v && v !== step.instruction) onEdit(v); }}
      >{step.instruction || "New step — describe what the agent should do."}</div>
      <div style={styles.scardFoot}>
        <button type="button" onClick={onHints} className="gw-focusable" style={styles.hintChip}>
          <MessageSquareQuote size={14} /> Hints <span style={styles.hintN}>{hintCount}</span>
        </button>
        <button type="button" onClick={onReq} className="gw-focusable" style={styles.tagBtn} aria-label="Change requirement"><RequirementTag requirement={step.requirement} /></button>
        <span style={{ flex: 1 }} />
        <button type="button" onClick={onRemove} className="gw-focusable" style={styles.del} aria-label="Remove step"><Trash2 size={15} color="var(--color-text-tertiary)" /></button>
      </div>
    </div>
  );
}

function HintsDrawer({ step, hints, onChange, onClose }) {
  const set = (next) => onChange(next);
  return (
    <Overlay onClose={onClose} labelledBy="gw-hints-title" title={`Coaching hints · ${step.id}`}>
      <div style={styles.drawerBody}>
        <p style={styles.drawerIntro}>Hints power the live navigator and the roleplay coach. Edit the wording, or remove anything not grounded in the source call.</p>
        {hints.map((h, i) => {
          const m = HINT_META[h.type] || HINT_META.bestPractice;
          return (
            <div key={i} style={styles.hintRow}>
              <div style={styles.hintRowTop}>
                <span style={{ ...styles.hintType, color: m.color, background: m.bg }}>{m.label}</span>
                <span style={{ flex: 1 }} />
                <button type="button" onClick={() => set(hints.filter((_, j) => j !== i))} className="gw-focusable" style={styles.del} aria-label="Remove hint"><Trash2 size={14} color="var(--color-text-tertiary)" /></button>
              </div>
              <div
                contentEditable suppressContentEditableWarning spellCheck={false}
                style={{ ...styles.hintText, ...(h.type === "say" ? styles.hintSay : null) }} className="gw-focusable"
                onBlur={(e) => { const v = e.currentTarget.textContent.trim(); if (v && v !== h.text) set(hints.map((x, j) => (j === i ? { ...x, text: v } : x))); }}
              >{h.text}</div>
            </div>
          );
        })}
        {hints.length === 0 && <p style={styles.drawerIntro}>No hints yet — add the first one.</p>}
        <button type="button" onClick={() => set([...hints, { type: "bestPractice", text: "New best-practice hint." }])} className="gw-focusable" style={styles.addHint}>
          <Plus size={15} /> Add hint
        </button>
      </div>
    </Overlay>
  );
}

function KnowledgeStage({ answers, onOpen, onDetach }) {
  const total = GW_LIKELY_QUESTIONS.length;
  const assigned = Object.keys(answers).length;
  return (
    <>
      <div style={styles.lead}>
        <span style={{ ...styles.leadBar, background: "var(--color-icon-tertiary-fg)" }} aria-hidden="true" />
        <span style={styles.leadTxt}>Path verified — now equip it. Assign a knowledge asset to each question an agent is likely to face: attach an existing card or draft one from raw knowledge. Assets travel with the published workflow.</span>
      </div>
      <div style={styles.knProg}>
        <div style={styles.knBar}><span style={{ ...styles.knBarFill, width: `${total ? Math.round((assigned / total) * 100) : 0}%` }} /></div>
        <span style={styles.knProgTxt}>{assigned} of {total} questions assigned</span>
      </div>
      {GW_LIKELY_QUESTIONS.map((q) => {
        const a = answers[q.id];
        return (
          <div key={q.id} style={styles.qcard}>
            <div style={styles.qTop}><span style={styles.qTopic}>{q.topic}</span><span style={{ flex: 1 }} /><span style={styles.qRef}>{q.relatedScenario}</span></div>
            <div style={styles.voiced}>“{q.customerVoiced}”</div>
            <p style={styles.qIntent}><b>Intent:</b> {q.intent}</p>
            {a ? (
              <div style={styles.answerCard}>
                <div style={styles.acTop}>
                  <span style={styles.acSrc}>{a.source === "ai" ? "✨ AI-generated" : a.id}</span>
                  <span style={styles.acTtl}>{a.title}</span>
                </div>
                <p style={styles.acBody}>{a.body}</p>
                <div style={styles.acActions}>
                  <button type="button" onClick={() => onOpen(q, a.source === "ai" ? "generate" : "attach")} className="gw-focusable" style={styles.linkBtn}>Replace</button>
                  <button type="button" onClick={() => onDetach(q.id)} className="gw-focusable" style={{ ...styles.linkBtn, color: "var(--color-text-tertiary)" }}>Detach</button>
                </div>
              </div>
            ) : (
              <div style={styles.qFoot}>
                <Button variant="text" uppercase={false} leadingIcon={<BookOpen size={15} />} onClick={() => onOpen(q, "attach")}>Attach knowledge card</Button>
                <Button variant="text" uppercase={false} leadingIcon={<Sparkles size={15} />} onClick={() => onOpen(q, "generate")}>Generate answer</Button>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

function KnowledgeDrawer({ q, mode, onClose, onAttach }) {
  const [tab, setTab] = React.useState(mode === "generate" ? "generate" : "attach");
  const [query, setQuery] = React.useState("");
  const [sel, setSel] = React.useState(null);
  const [gen, setGen] = React.useState(null);
  const [genLoading, setGenLoading] = React.useState(false);

  React.useEffect(() => {
    if (tab !== "generate") return;
    setGen(null); setGenLoading(true);
    const t = window.setTimeout(() => { setGen(DRAFTS[q.id] || { title: "Drafted answer", body: "Grounded answer drawn from stored raw knowledge." }); setGenLoading(false); }, 1200);
    return () => window.clearTimeout(t);
  }, [tab, q.id]);

  const matches = GW_KB_CARDS
    .filter((k) => k.title.toLowerCase().includes(query.toLowerCase()) || k.body.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => (b.topics.includes(q.id) ? 1 : 0) - (a.topics.includes(q.id) ? 1 : 0));

  const ready = tab === "attach" ? !!sel : !!gen;
  const commit = () => {
    if (tab === "generate" && gen) onAttach({ source: "ai", id: "AI", title: gen.title, body: gen.body });
    else if (sel) { const k = GW_KB_CARDS.find((x) => x.id === sel); onAttach({ source: "kb", id: k.id, title: k.title, body: k.body }); }
  };

  return (
    <Overlay onClose={onClose} labelledBy="gw-kn-title" title="Resolve customer question">
      <div style={styles.drawerBody}>
        <div style={styles.kbCtx}>
          <span style={styles.kbCtxLbl}>Customer scenario to answer</span>
          <div style={styles.kbVoiced}>“{q.customerVoiced}”</div>
          <p style={styles.kbIntent}>{q.intent}</p>
        </div>
        <div style={styles.seg}>
          <button type="button" onClick={() => setTab("attach")} className="gw-focusable" style={{ ...styles.segBtn, ...(tab === "attach" ? styles.segActive : null) }}>Attach existing</button>
          <button type="button" onClick={() => setTab("generate")} className="gw-focusable" style={{ ...styles.segBtn, ...(tab === "generate" ? styles.segActive : null) }}>Generate from raw</button>
        </div>

        {tab === "attach" ? (
          <>
            <div style={styles.searchWrap}><Search size={15} color="var(--color-text-tertiary)" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search knowledge base…" style={styles.searchInput} /></div>
            {matches.map((k) => (
              <button key={k.id} type="button" onClick={() => setSel(k.id)} className="gw-focusable" style={{ ...styles.kcItem, ...(sel === k.id ? styles.kcItemSel : null) }}>
                <div style={styles.kcH}><span style={styles.kcId}>{k.id}</span>{k.topics.includes(q.id) && <span style={styles.kcMatch}>Suggested match</span>}</div>
                <div style={styles.kcTtl}>{k.title}</div>
                <div style={styles.kcBody}>{k.body}</div>
              </button>
            ))}
            {matches.length === 0 && <p style={styles.drawerIntro}>No cards match. Try generating from raw knowledge instead.</p>}
          </>
        ) : genLoading ? (
          <div style={styles.genBox}><div className="gw-spin" style={styles.genSpinner} /><p style={styles.drawerIntro}>Drafting a grounded answer from stored raw knowledge…</p></div>
        ) : gen ? (
          <div style={styles.answerCard}>
            <div style={styles.acTop}><span style={styles.acSrc}>✨ AI draft</span><span style={styles.acTtl}>{gen.title}</span></div>
            <p style={styles.acBody}>{gen.body}</p>
            <p style={styles.genNote}>Grounded in stored raw knowledge for this driver. Review before attaching — nothing publishes until you do.</p>
          </div>
        ) : null}
      </div>
      <div style={styles.drawerFoot}>
        <Button variant="text" uppercase={false} onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={commit} disabled={!ready}>Attach answer card</Button>
      </div>
    </Overlay>
  );
}

const styles = {
  wrap: { display: "flex", flexDirection: "column", gap: 18 },

  ctx: { borderRadius: 14, background: "var(--color-icon-tertiary-bg)", border: "1px solid var(--color-border-tab)", overflow: "hidden" },
  ctxCollapsed: { background: "var(--surface-dim)" },
  ctxBar: { display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", flexWrap: "wrap" },
  ctxLabel: { fontSize: 11, fontWeight: 700, color: "var(--color-icon-tertiary-fg)", textTransform: "uppercase", letterSpacing: "0.05em" },
  ctxSrc: { fontSize: 12.5, color: "var(--color-text-medium)" },
  ctxView: { display: "inline-flex", alignItems: "center", gap: 4, background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 700, color: "var(--color-button-primary-bg)", padding: "3px 6px", borderRadius: 7 },
  ctxToggle: { display: "inline-flex", alignItems: "center", gap: 5, background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 12.5, fontWeight: 700, color: "var(--color-icon-tertiary-fg)", padding: "5px 10px", borderRadius: 8 },
  ctxGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, padding: "2px 16px 16px" },
  ctxCol: { background: "var(--surface-white)", border: "1px solid var(--color-divider-card)", borderRadius: 12, padding: "13px 15px" },
  ctxColAccent: { borderColor: "var(--color-border-tab)" },
  ctxH: { display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 700, color: "var(--color-icon-tertiary-fg)", textTransform: "uppercase", letterSpacing: "0.03em" },
  ctxP: { margin: "7px 0 0", fontSize: 13, color: "var(--color-text-medium)", lineHeight: 1.55 },

  stepper: { display: "flex", alignItems: "center", gap: 2, background: "var(--surface-white)", border: "1px solid var(--color-divider-card)", borderRadius: 14, boxShadow: "var(--shadow-card)", padding: 6, flexWrap: "wrap" },
  node: { flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 9, padding: "8px 11px", borderRadius: 11, background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left" },
  nodeActive: { background: "var(--color-icon-tertiary-bg)" },
  num: { width: 24, height: 24, flexShrink: 0, borderRadius: 999, display: "inline-grid", placeItems: "center", fontSize: 12, fontWeight: 700, background: "var(--color-chip-bg)", color: "var(--color-text-tertiary)" },
  numActive: { background: "var(--color-button-primary-bg)", color: "#fff" },
  numDone: { background: "var(--color-success-text)", color: "#fff" },
  nodeMeta: { minWidth: 0, lineHeight: 1.15 },
  nodeName: { display: "block", fontSize: 12, fontWeight: 700, letterSpacing: "0.035em", textTransform: "uppercase", color: "var(--color-text-medium)", whiteSpace: "nowrap" },
  nodeNameActive: { color: "var(--color-button-primary-bg)" },
  nodeCt: { display: "block", fontSize: 10.5, color: "var(--color-text-tertiary)", fontWeight: 500, whiteSpace: "nowrap" },
  navDiv: { flexShrink: 0, width: 1, height: 28, background: "var(--color-divider-card)", margin: "0 7px" },

  panel: { display: "flex", flexDirection: "column", gap: 12 },
  lead: { display: "flex", gap: 11, alignItems: "flex-start", margin: "2px 0 6px" },
  leadBar: { flexShrink: 0, width: 3, alignSelf: "stretch", borderRadius: 3, background: "var(--color-button-primary-bg)", minHeight: 34 },
  leadTxt: { fontSize: 14, lineHeight: 1.55, color: "var(--color-text-medium)" },

  triageTabs: { display: "flex", gap: 8, flexWrap: "wrap" },
  triageTab: { flex: 1, minWidth: 220, textAlign: "left", background: "var(--surface-white)", border: "1px solid var(--color-divider-card)", borderRadius: 12, padding: "12px 14px", cursor: "pointer", fontFamily: "inherit" },
  triageTabActive: { borderColor: "var(--color-button-primary-bg)", boxShadow: "inset 0 0 0 1px var(--color-button-primary-bg)", background: "var(--color-primary-alpha-12)" },
  lanePill: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: "var(--color-icon-tertiary-fg)" },
  triageName: { display: "block", fontSize: 13, fontWeight: 600, color: "var(--color-text-deep)", lineHeight: 1.35, marginTop: 5 },
  triageCt: { display: "block", fontSize: 11.5, color: "var(--color-text-tertiary)", marginTop: 4 },

  fork: { background: "var(--surface-white)", border: "1px solid var(--color-divider-card)", borderLeft: "3px solid var(--color-icon-tertiary-fg)", borderRadius: 12, padding: "13px 15px" },
  forkTtl: { display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 700, color: "var(--color-icon-tertiary-fg)", textTransform: "uppercase", letterSpacing: "0.03em" },
  forkQ: { fontSize: 14, color: "var(--color-text-deep)", marginTop: 6, lineHeight: 1.5, fontWeight: 500 },
  cuesToggle: { marginTop: 11, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "var(--color-icon-tertiary-fg)", background: "var(--color-icon-tertiary-bg)", border: "1px solid var(--color-border-tab)", borderRadius: 999, padding: "5px 11px", cursor: "pointer", fontFamily: "inherit" },
  cues: { display: "flex", flexDirection: "column", gap: 7, marginTop: 12 },
  cue: { display: "flex", gap: 8, fontSize: 12.5, color: "var(--color-text-medium)", lineHeight: 1.45 },
  cueB: { color: "var(--color-icon-tertiary-fg)", flexShrink: 0, fontWeight: 700 },

  scard: { background: "var(--surface-white)", border: "1px solid var(--color-divider-card)", borderRadius: 14, boxShadow: "var(--shadow-card)", padding: "16px 18px" },
  scardTop: { display: "flex", alignItems: "center", gap: 10, marginBottom: 10 },
  ordPill: { width: 24, height: 24, flexShrink: 0, borderRadius: 7, background: "var(--color-chip-bg)", color: "var(--color-text-medium)", display: "inline-grid", placeItems: "center", fontSize: 12, fontWeight: 700 },
  tagBtn: { background: "transparent", border: "none", padding: 0, cursor: "pointer", display: "inline-flex" },
  scardId: { fontSize: 11, color: "var(--color-text-tertiary)", fontWeight: 500, background: "var(--surface-dim)", border: "1px solid var(--color-divider-card)", borderRadius: 999, padding: "2px 9px", fontFamily: "var(--font-mono)" },
  instr: { fontSize: 14.5, lineHeight: 1.55, color: "var(--color-text-deep)", outline: "none", borderRadius: 8, padding: "2px 4px", margin: "-2px -4px" },
  scardFoot: { display: "flex", alignItems: "center", gap: 8, marginTop: 13 },
  hintChip: { display: "inline-flex", alignItems: "center", gap: 7, background: "var(--surface-dim)", border: "1px solid var(--color-divider-card)", borderRadius: 999, padding: "5px 12px 5px 10px", fontSize: 12.5, fontWeight: 700, color: "var(--color-text-medium)", cursor: "pointer", fontFamily: "inherit" },
  hintN: { background: "var(--color-button-primary-bg)", color: "#fff", borderRadius: 999, minWidth: 17, height: 17, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10.5, padding: "0 4px" },
  del: { background: "transparent", border: "none", cursor: "pointer", padding: 7, margin: -5, borderRadius: 8, display: "inline-flex" },

  addStep: { width: "100%", border: "1.5px dashed var(--color-divider-card)", background: "transparent", borderRadius: 12, padding: 12, color: "var(--color-text-tertiary)", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, cursor: "pointer", fontFamily: "inherit" },
  panelNav: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
  nextInner: { display: "inline-flex", alignItems: "center", gap: 7 },

  drawerBody: { display: "flex", flexDirection: "column", gap: 11 },
  drawerIntro: { margin: 0, fontSize: 12.5, color: "var(--color-text-tertiary)", lineHeight: 1.5 },
  drawerFoot: { display: "flex", alignItems: "center", gap: 10, justifyContent: "flex-end", marginTop: 16 },
  hintRow: { border: "1px solid var(--color-divider-card)", borderRadius: 12, padding: "13px 14px", background: "var(--surface-dim)" },
  hintRowTop: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 },
  hintType: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.03em", borderRadius: 999, padding: "2px 9px" },
  hintText: { fontSize: 13.5, lineHeight: 1.55, color: "var(--color-text-deep)", outline: "none", borderRadius: 8, padding: "6px 8px", margin: "-6px -8px" },
  hintSay: { fontStyle: "italic", color: "var(--color-text-medium)" },
  addHint: { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, alignSelf: "flex-start", padding: "9px 14px", borderRadius: 999, border: "1px solid var(--color-divider-card)", background: "var(--surface-white)", color: "var(--color-text-medium)", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700 },

  knProg: { display: "flex", alignItems: "center", gap: 12, margin: "0 0 6px" },
  knBar: { flex: "0 1 280px", height: 7, background: "var(--color-chip-bg)", borderRadius: 999, overflow: "hidden" },
  knBarFill: { display: "block", height: "100%", background: "var(--color-icon-tertiary-fg)", borderRadius: 999, transition: "width 300ms ease" },
  knProgTxt: { fontSize: 12.5, color: "var(--color-text-medium)", fontWeight: 600 },
  qcard: { background: "var(--surface-white)", border: "1px solid var(--color-divider-card)", borderRadius: 14, boxShadow: "var(--shadow-card)", padding: "15px 17px" },
  qTop: { display: "flex", alignItems: "center", gap: 9, marginBottom: 10 },
  qTopic: { fontSize: 13, fontWeight: 600, color: "var(--color-text-medium)" },
  qRef: { fontSize: 11, fontWeight: 700, color: "var(--color-text-tertiary)", background: "var(--color-chip-bg)", borderRadius: 999, padding: "2px 9px", fontFamily: "var(--font-mono)" },
  voiced: { fontSize: 15.5, fontWeight: 600, color: "var(--color-text-deep)", lineHeight: 1.5, paddingLeft: 13, borderLeft: "3px solid var(--color-icon-tertiary-bg)" },
  qIntent: { fontSize: 12.5, color: "var(--color-text-tertiary)", marginTop: 9, lineHeight: 1.5 },
  qFoot: { marginTop: 14, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },

  answerCard: { background: "var(--color-primary-alpha-12)", border: "1px solid var(--color-border-tab)", borderRadius: 12, padding: "13px 15px", marginTop: 13 },
  acTop: { display: "flex", alignItems: "center", gap: 8, marginBottom: 7, flexWrap: "wrap" },
  acSrc: { fontSize: 11, fontWeight: 700, color: "var(--color-button-primary-bg)", background: "var(--surface-white)", borderRadius: 999, padding: "2px 9px" },
  acTtl: { fontSize: 13.5, fontWeight: 700, color: "var(--color-text-deep)" },
  acBody: { margin: 0, fontSize: 13, color: "var(--color-text-medium)", lineHeight: 1.55 },
  acActions: { marginTop: 10, display: "flex", gap: 7 },
  linkBtn: { fontSize: 12.5, fontWeight: 700, color: "var(--color-button-primary-bg)", padding: "4px 8px", borderRadius: 8, background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit" },

  kbCtx: { background: "var(--color-icon-tertiary-bg)", borderRadius: 12, padding: "13px 15px" },
  kbCtxLbl: { fontSize: 11, fontWeight: 700, color: "var(--color-icon-tertiary-fg)", textTransform: "uppercase", letterSpacing: "0.03em" },
  kbVoiced: { fontSize: 14, fontWeight: 600, color: "var(--color-text-deep)", marginTop: 6, lineHeight: 1.45 },
  kbIntent: { fontSize: 12, color: "var(--color-text-medium)", marginTop: 8, lineHeight: 1.5 },
  seg: { display: "flex", background: "var(--color-chip-bg)", borderRadius: 11, padding: 3 },
  segBtn: { flex: 1, padding: 8, fontSize: 12.5, fontWeight: 700, color: "var(--color-text-medium)", borderRadius: 8, background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit" },
  segActive: { background: "var(--surface-white)", color: "var(--color-text-deep)", boxShadow: "var(--shadow-card)" },
  searchWrap: { display: "flex", alignItems: "center", gap: 9, border: "1px solid var(--color-divider-card)", borderRadius: 11, padding: "10px 12px" },
  searchInput: { flex: 1, background: "transparent", border: "none", outline: "none", fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--color-text-deep)" },
  kcItem: { width: "100%", textAlign: "left", border: "1px solid var(--color-divider-card)", borderRadius: 12, padding: "13px 14px", cursor: "pointer", background: "var(--surface-white)", fontFamily: "inherit" },
  kcItemSel: { borderColor: "var(--color-button-primary-bg)", boxShadow: "inset 0 0 0 1px var(--color-button-primary-bg)" },
  kcH: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6 },
  kcId: { fontSize: 10.5, fontWeight: 700, color: "var(--color-text-tertiary)", fontFamily: "var(--font-mono)" },
  kcMatch: { marginLeft: "auto", fontSize: 10.5, fontWeight: 700, color: "var(--color-success-text)", background: "var(--color-success-bg)", borderRadius: 999, padding: "2px 8px" },
  kcTtl: { fontSize: 14, fontWeight: 700, color: "var(--color-text-deep)" },
  kcBody: { fontSize: 12.5, color: "var(--color-text-medium)", lineHeight: 1.5, marginTop: 5 },
  genBox: { border: "1px solid var(--color-divider-card)", borderRadius: 12, padding: 16, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 },
  genSpinner: { width: 34, height: 34, border: "3px solid var(--color-chip-bg)", borderTopColor: "var(--color-button-primary-bg)", borderRadius: "50%" },
  genNote: { margin: "8px 0 0", fontSize: 12, color: "var(--color-text-tertiary)", lineHeight: 1.5 },
};
