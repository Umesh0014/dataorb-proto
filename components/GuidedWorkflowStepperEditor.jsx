"use client";

import React from "react";
import { GitBranch, Plus, X, ChevronDown, ChevronUp, ExternalLink, Sparkles, Trash2, MessageSquareQuote, BookOpen, Search } from "lucide-react";
import Button from "./Button";
import { TypeTag, GroundingChip } from "./GuidedWorkflowBits";
import { StepDetailBody } from "./GuidedWorkflowStepDetail";
import { Overlay } from "./GuidedWorkflowDialogs";
import { GW_STAGES, GW_SCENARIOS, gwGroupStage, GW_REVIEW_CONTEXT, GW_LIKELY_QUESTIONS, GW_KB_CARDS } from "./mocks/guidedWorkflows";

// Stepper + sidecar. The category spine is a horizontal stepper (Open →
// Close) plus a Knowledge node set off at the end — Knowledge isn't a process
// stage, but it rides the same stepper bar. Selecting a category reveals its
// steps as cards; selecting Knowledge shows the likely-question equip panel.
// Clicking a step card opens a docked sidecar with the full detail. A
// collapsible context panel sits above the stepper.

function hintCount(step) {
  return (step.script ? 1 : 0) + (step.knowledge ? 1 : 0) + (step.subSteps?.length || 0);
}

const DRAFTS = {
  "q-01": { title: "Why a healthy line still drops WiFi", body: "Your line's in sync — the green light confirms it. Drops like this are almost always WiFi reach: distance, walls, or too many devices on one band. Moving the router into the open and splitting the 2.4 and 5GHz bands usually steadies it." },
  "q-02": { title: "When your area outage will clear", body: "There's a confirmed outage in your area, so it's nothing on your side. The current estimate is restoration by early evening, and I'll register you for an automatic text the moment it's back so you don't need to call again." },
  "q-03": { title: "Whether the engineer visit is free", body: "A confirmed line fault is repaired at no charge. The only time a charge applies is if the engineer finds the fault is inside your home — your own wiring or equipment — and I'd flag that risk before booking." },
  "q-04": { title: "Getting full speed back after the fix", body: "Once the line's stable, a device next to the router should see your full plan speed. If it still feels slow further away, that's WiFi range rather than the line — the WiFi app shows per-room signal and where a booster would help." },
};

export default function GuidedWorkflowStepperEditor({
  stagesWithSteps, onUpdateInstruction, onCycleType, onCycleRequirement, onRemove, onAddBlank,
}) {
  const actSteps = (stagesWithSteps.find((s) => s.id === "act") || {}).steps || [];
  const actScenarios = gwGroupStage(actSteps).scenarios;
  const [stageId, setStageId] = React.useState("open");
  const [triage, setTriage] = React.useState(actScenarios[0]?.id || null);
  const [ctxCollapsed, setCtxCollapsed] = React.useState(false);
  const [selId, setSelId] = React.useState(null);
  const [answers, setAnswers] = React.useState({});
  const [knQ, setKnQ] = React.useState(null);

  const stage = GW_STAGES.find((s) => s.id === stageId);
  const isAct = stageId === "act";
  const isKnowledge = stageId === "knowledge";
  const steps = isAct ? (actScenarios.find((sc) => sc.id === triage)?.steps || []) : (stagesWithSteps.find((s) => s.id === stageId)?.steps || []);
  const allSteps = stagesWithSteps.flatMap((s) => s.steps);
  const selected = allSteps.find((s) => s.id === selId) || null;
  const assigned = Object.keys(answers).length;

  const pick = (id) => { setStageId(id); setSelId(null); };

  return (
    <div style={styles.wrap}>
      <ContextPanel collapsed={ctxCollapsed} onToggle={() => setCtxCollapsed((c) => !c)} />

      <nav style={styles.stepper} aria-label="Workflow stages">
        {GW_STAGES.map((s, i) => {
          const active = s.id === stageId;
          const stp = stagesWithSteps.find((x) => x.id === s.id)?.steps || [];
          return (
            <React.Fragment key={s.id}>
              {i > 0 && <span style={styles.connector} aria-hidden="true" />}
              <button type="button" onClick={() => pick(s.id)} className="gw-focusable" style={{ ...styles.node, ...(active ? styles.nodeActive : null) }} aria-current={active ? "step" : undefined}>
                <span style={{ ...styles.num, ...(active ? styles.numActive : null) }}>{i + 1}</span>
                <span style={styles.nodeMeta}>
                  <span style={{ ...styles.nodeName, ...(active ? styles.nodeNameActive : null) }}>{s.label}</span>
                  <span style={styles.nodeCt}>{stp.length} step{stp.length === 1 ? "" : "s"}</span>
                </span>
              </button>
            </React.Fragment>
          );
        })}
        <span style={styles.navDiv} aria-hidden="true" />
        <button type="button" onClick={() => pick("knowledge")} className="gw-focusable" style={{ ...styles.node, ...(isKnowledge ? styles.nodeActive : null) }} aria-current={isKnowledge ? "step" : undefined}>
          <span style={{ ...styles.num, ...(isKnowledge ? styles.numActive : null) }}><BookOpen size={13} /></span>
          <span style={styles.nodeMeta}>
            <span style={{ ...styles.nodeName, ...(isKnowledge ? styles.nodeNameActive : null) }}>Knowledge</span>
            <span style={styles.nodeCt}>{assigned}/{GW_LIKELY_QUESTIONS.length} assigned</span>
          </span>
        </button>
      </nav>

      <div style={styles.cols}>
        <div style={styles.main}>
          {isKnowledge ? (
            <KnowledgeStage
              answers={answers}
              onOpen={(q, mode) => setKnQ({ q, mode })}
              onDetach={(qid) => setAnswers((a) => { const n = { ...a }; delete n[qid]; return n; })}
            />
          ) : (
          <>
          <div style={styles.lead}><span style={styles.leadBar} aria-hidden="true" /><span style={styles.leadTxt}>{stage.purpose}</span></div>

          {isAct && (
            <>
              <div style={styles.triageTabs}>
                {actScenarios.map((sc) => (
                  <button key={sc.id} type="button" onClick={() => { setTriage(sc.id); setSelId(null); }} className="gw-focusable" style={{ ...styles.triageTab, ...(sc.id === triage ? styles.triageTabActive : null) }}>
                    <span style={styles.lanePill}><GitBranch size={12} color="var(--color-icon-tertiary-fg)" />{sc.label}</span>
                    <span style={styles.triageCt}>{sc.steps.length} steps</span>
                  </button>
                ))}
              </div>
              {GW_SCENARIOS[triage] && (
                <div style={styles.fork}><span style={styles.forkLbl}>Run this path when</span><span style={styles.forkQ}>{GW_SCENARIOS[triage].triggerScenario}</span></div>
              )}
            </>
          )}

          {steps.map((step, i) => {
            const sel = selId === step.id;
            const n = hintCount(step);
            return (
              <div
                key={step.id} role="button" tabIndex={0} aria-pressed={sel}
                onClick={() => setSelId(step.id)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelId(step.id); } }}
                className="gw-focusable" style={{ ...styles.scard, ...(sel ? styles.scardSel : null) }}
              >
                <div style={styles.scardTop}>
                  <span style={styles.ordPill}>{i + 1}</span>
                  <TypeTag type={step.type} />
                  <span style={{ flex: 1 }} />
                  <span style={styles.scardId}>{step.id}</span>
                </div>
                <div style={styles.instr}>{step.instruction || "New step — describe what the agent should do."}</div>
                <div style={styles.scardFoot}>
                  <button type="button" onClick={(e) => { e.stopPropagation(); setSelId(step.id); }} className="gw-focusable" style={styles.hintChip}>
                    <MessageSquareQuote size={14} /> Hints <span style={styles.hintN}>{n}</span>
                  </button>
                  <span style={{ flex: 1 }} />
                  <GroundingChip grounding={step.grounding} />
                  <button type="button" onClick={(e) => { e.stopPropagation(); onRemove(step.id); if (sel) setSelId(null); }} className="gw-focusable" style={styles.del} aria-label="Remove step"><Trash2 size={15} color="var(--color-text-tertiary)" /></button>
                </div>
              </div>
            );
          })}

          <button type="button" onClick={() => onAddBlank(isAct ? "act" : stageId)} className="gw-focusable" style={styles.addStep}>
            <Plus size={16} /> Add a step
          </button>
          </>
          )}
        </div>

        {!isKnowledge && selected && (
          <aside style={styles.sidecar} className="gw-curtain" aria-label="Step detail">
            <div style={styles.scInner}>
              <header style={styles.scHead}>
                <span style={styles.scKicker}>{STAGE_OF(selected, stagesWithSteps)} · step detail</span>
                <button type="button" onClick={() => setSelId(null)} className="gw-focusable" style={styles.scClose} aria-label="Close detail"><X size={16} color="var(--color-text-tertiary)" /></button>
              </header>
              <StepDetailBody
                step={selected}
                onUpdateInstruction={onUpdateInstruction}
                onCycleType={onCycleType}
                onCycleRequirement={onCycleRequirement}
                onRemove={(id) => { onRemove(id); setSelId(null); }}
              />
            </div>
          </aside>
        )}
      </div>

      {knQ && (
        <KnowledgeDrawer
          q={knQ.q} mode={knQ.mode}
          onClose={() => setKnQ(null)}
          onAttach={(card) => { setAnswers((a) => ({ ...a, [knQ.q.id]: card })); setKnQ(null); }}
        />
      )}
    </div>
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
    if (tab !== "generate") return undefined;
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

function ContextPanel({ collapsed, onToggle }) {
  return (
    <div style={{ ...styles.ctx, ...(collapsed ? styles.ctxCollapsedBox : null) }}>
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

function STAGE_OF(step, stagesWithSteps) {
  const s = stagesWithSteps.find((x) => x.steps.some((y) => y.id === step.id));
  return s ? s.label : "Step";
}

const styles = {
  wrap: { display: "flex", flexDirection: "column", gap: 20 },

  ctx: { borderRadius: 14, background: "var(--color-icon-tertiary-bg)", border: "1px solid var(--color-border-tab)", overflow: "hidden" },
  ctxCollapsedBox: { background: "var(--surface-dim)" },
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

  stepper: { display: "flex", alignItems: "center", gap: 0, background: "var(--surface-white)", border: "1px solid var(--color-divider-card)", borderRadius: 14, boxShadow: "var(--shadow-card)", padding: 8, flexWrap: "wrap" },
  connector: { alignSelf: "center", flex: "0 0 16px", height: 2, borderRadius: 2, background: "var(--color-divider-card)" },
  navDiv: { flexShrink: 0, width: 1, height: 28, background: "var(--color-divider-card)", margin: "0 8px" },
  node: { flex: 1, minWidth: 120, display: "flex", alignItems: "center", gap: 9, padding: "10px 12px", borderRadius: 11, background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left" },
  nodeActive: { background: "var(--color-icon-tertiary-bg)" },
  num: { width: 24, height: 24, flexShrink: 0, borderRadius: 999, display: "inline-grid", placeItems: "center", fontSize: 12, fontWeight: 700, background: "var(--color-chip-bg)", color: "var(--color-text-tertiary)" },
  numActive: { background: "var(--color-button-primary-bg)", color: "#fff" },
  nodeMeta: { minWidth: 0, lineHeight: 1.15 },
  nodeName: { display: "block", fontSize: 12.5, fontWeight: 700, letterSpacing: "0.03em", textTransform: "uppercase", color: "var(--color-text-medium)", whiteSpace: "nowrap" },
  nodeNameActive: { color: "var(--color-button-primary-bg)" },
  nodeCt: { display: "block", fontSize: 10.5, color: "var(--color-text-tertiary)", fontWeight: 500 },

  cols: { display: "flex", gap: 24, alignItems: "flex-start" },
  main: { display: "flex", flexDirection: "column", gap: 12, flex: 1, minWidth: 0 },
  lead: { display: "flex", gap: 11, alignItems: "flex-start", margin: "2px 0 0" },
  leadBar: { flexShrink: 0, width: 3, alignSelf: "stretch", borderRadius: 3, background: "var(--color-button-primary-bg)", minHeight: 30 },
  leadTxt: { fontSize: 14, lineHeight: 1.55, color: "var(--color-text-medium)" },

  triageTabs: { display: "flex", gap: 8, flexWrap: "wrap" },
  triageTab: { flex: 1, minWidth: 180, textAlign: "left", background: "var(--surface-white)", border: "1px solid var(--color-divider-card)", borderRadius: 12, padding: "10px 13px", cursor: "pointer", fontFamily: "inherit" },
  triageTabActive: { borderColor: "var(--color-button-primary-bg)", boxShadow: "inset 0 0 0 1px var(--color-button-primary-bg)", background: "var(--color-primary-alpha-12)" },
  lanePill: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, fontWeight: 700, color: "var(--color-text-deep)" },
  triageCt: { display: "block", fontSize: 11.5, color: "var(--color-text-tertiary)", marginTop: 3 },
  fork: { display: "flex", flexDirection: "column", gap: 3, padding: "11px 14px", borderRadius: 12, background: "var(--surface-dim)", borderLeft: "3px solid var(--color-icon-tertiary-fg)" },
  forkLbl: { fontSize: 11, fontWeight: 700, color: "var(--color-icon-tertiary-fg)", textTransform: "uppercase", letterSpacing: "0.03em" },
  forkQ: { fontSize: 13.5, color: "var(--color-text-deep)", lineHeight: 1.5, fontWeight: 500 },

  scard: { background: "var(--surface-white)", border: "1px solid var(--color-divider-card)", borderRadius: 14, boxShadow: "var(--shadow-card)", padding: "16px 18px", cursor: "pointer" },
  scardSel: { borderColor: "var(--color-button-primary-bg)", boxShadow: "inset 0 0 0 1px var(--color-button-primary-bg)" },
  scardTop: { display: "flex", alignItems: "center", gap: 10, marginBottom: 10 },
  ordPill: { width: 24, height: 24, flexShrink: 0, borderRadius: 7, background: "var(--color-chip-bg)", color: "var(--color-text-medium)", display: "inline-grid", placeItems: "center", fontSize: 12, fontWeight: 700 },
  scardId: { fontSize: 11, color: "var(--color-text-tertiary)", fontWeight: 500, background: "var(--surface-dim)", border: "1px solid var(--color-divider-card)", borderRadius: 999, padding: "2px 9px", fontFamily: "var(--font-mono)" },
  instr: { fontSize: 14.5, lineHeight: 1.55, color: "var(--color-text-deep)", fontWeight: 600 },
  scardFoot: { display: "flex", alignItems: "center", gap: 8, marginTop: 13 },
  hintChip: { display: "inline-flex", alignItems: "center", gap: 7, background: "var(--surface-dim)", border: "1px solid var(--color-divider-card)", borderRadius: 999, padding: "5px 12px 5px 10px", fontSize: 12.5, fontWeight: 700, color: "var(--color-text-medium)", cursor: "pointer", fontFamily: "inherit" },
  hintN: { background: "var(--color-button-primary-bg)", color: "#fff", borderRadius: 999, minWidth: 17, height: 17, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10.5, padding: "0 4px" },
  del: { background: "transparent", border: "none", cursor: "pointer", padding: 7, margin: -5, borderRadius: 8, display: "inline-flex" },
  addStep: { width: "100%", border: "1.5px dashed var(--color-divider-card)", background: "transparent", borderRadius: 12, padding: 13, color: "var(--color-text-tertiary)", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, cursor: "pointer", fontFamily: "inherit" },

  sidecar: { width: 360, flexShrink: 0, position: "sticky", top: 16, alignSelf: "flex-start" },
  scInner: { display: "flex", flexDirection: "column", gap: 14, padding: 16, borderRadius: 14, background: "var(--surface-white)", border: "1px solid var(--color-divider-card)", boxShadow: "var(--shadow-card)" },
  scHead: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  scKicker: { fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--color-text-tertiary)" },
  scClose: { background: "transparent", border: "none", cursor: "pointer", padding: 6, margin: -6, borderRadius: 6, display: "inline-flex" },

  knProg: { display: "flex", alignItems: "center", gap: 12, margin: "0 0 2px" },
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

  drawerBody: { display: "flex", flexDirection: "column", gap: 11 },
  drawerIntro: { margin: 0, fontSize: 12.5, color: "var(--color-text-tertiary)", lineHeight: 1.5 },
  drawerFoot: { display: "flex", alignItems: "center", gap: 10, justifyContent: "flex-end", marginTop: 16 },
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
