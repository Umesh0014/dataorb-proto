# Requirements Checklist — [Learning hub] Drill — Guided Workflow (agent-side, progressive disclosure)
Source: https://app.notion.com/p/37c7c8264656819dbc5dcdab7ebdb322

Scope for this build: the **agent-facing live guided-drill experience** + its post-session
eval/exclusion. Per the **Jun 16 deep dive (LOCKED)**, the direction is **progressive
disclosure** — this supersedes the earlier Inline/Assisted cut (Jun 15), which is preserved
in git history. Team-lead authoring (Knowledge Library → Guided Workflow tab) is explicitly
the *other* track and out of scope here (Neil still iterating the schema).

### Functional requirements
- [ ] R1: Role play stays on the **left**; the **guided card is on the right** (Jun 16: "keep role play on the left; the guided card on the right, not the transcript").
- [ ] R2: **Do not show the transcript** — it distracts and has no purpose in the agent view.
- [ ] R3: The guided card is a **moving three-position view**: **previous step** (viewable), **current step** ("likely next step / where the AI is listening"), **next step** — the "where was I / where am I / where am I going" mental model. It updates as steps check off.
- [ ] R4: A **second AI listens and auto-checks steps off** in real time; the agent never manually corrects it. Demonstrate at least one live auto-check-off + advance.
- [ ] R5: Detection is **order-agnostic** and only over **configured** steps; a step done out of displayed order is checked off in the background.
- [ ] R6: **Flag skipped mandatory steps** ("this step is skipped — no evidence found"); the agent can still cover it before the call ends.
- [ ] R7: **Suggest phrasing / Script** affordance per step — phrasing the agent can pull mid-call (e.g. de-escalation, greeting + self-ID). Viewing it is logged.
- [ ] R8: **Knowledge card** asset — a *specific* linked card on complex steps (e.g. IPC tariff +£ snippet, retention-offer matrix), with a "learn more about this step" path. Easy steps = script only; complex = script + knowledge card.
- [ ] R9: Viewing **all steps / completed steps is a deliberate action**, never forced; offer a "show all / show completed" control (esp. near call-end).
- [ ] R10: Post-session **eval still produced**, but a **banner makes explicit the score is NOT counted toward the readiness profile** (safety-on = new "assisted mode" exclusion, mirroring calibration mode).
- [ ] R11: Eval tracks for visibility only: steps detected/done, **skip behaviour**, **# hints/scripts reviewed**, overall score, branch executed — all excluded from readiness.
- [ ] R12: Eval offers the CTA **"ready to drill without the training wheel?"** → unassisted practice (score that counts).
- [ ] R13: Header surfaces **safety-wheel-on** state and the **session N of M** allowance (team-lead config: guided sessions per agent per role play).
- [ ] R14: The agent **stays focused on the call** — detection happens behind the scenes (progressive disclosure, not an information-dense panel).

### Visual / layout requirements
- [ ] V1: **Five universal conversation stages** surfaced — Open → Verify → **Discover** (renamed from "Diagnose") → Act → Close — as the orientation spine ("how far through the outcome am I").
- [ ] V2: Each step carries **metadata**: mandatory vs optional, and **step type — compliance / action / decision**. Mandatory examples: recording disclosure, identity verification.
- [ ] V3: **Sub-steps** (conditional "if" checks) render under the current step where present — flexible, not rigid.
- [ ] V4: Step is **primary, always visible**; script + knowledge card are secondary reveals (progressive disclosure of per-step assets).
- [ ] V5: Full-bleed session surface (mirrors `GuideSessionPage`/current `DrillGuidedSessionPage` — bypasses PageLayout, own 32px gutter, 64px nav rail respected).
- [ ] V6: Three directions ride one **VersionBar** switcher labelled by ambition band (`A · Safe`, `B · Balanced`, `C · Ambitious`); only the guided-card surfacing differs.
- [ ] V7: Live region announces real-time check-off + skipped-mandatory flags (screen-reader parity with the visual signal).

### Data / content requirements
- [ ] D1: Reuse the existing bill-shock retention scenario (Marcus Bell — IPC tariff) and the 9-step workflow; map every step to one of the five stages and a step type.
- [ ] D2: Provide **script** content for steps where the agent may not know the phrasing.
- [ ] D3: Provide **knowledge-card** content for complex steps (IPC tariff explanation, retention-offer matrix).
- [ ] D4: Every number in the eval carries a label + unit; the overall score is explicitly tagged "excluded".

### Constraints / out-of-scope (from ticket)
- C1: Team-lead **authoring** (Knowledge Library → Guided Workflow tab; paste/convert or pick ≤10 interactions → generate → edit → publish) — out of scope for this agent-side build (Neil still finalizing schema).
- C2: **Flat checklist, no branching** is the authoring target; the agent view stays progressive (prev/current/next), order-agnostic — do not build a node-graph / decision-tree.
- C3: Real STT/TTS + live native-voice detection — out of scope; drive the same shapes off a short demo timer.
- C4: Mobile compatibility — flagged by Neil as a layer to add later; this build targets the ≥1260 desktop surface (note it, don't build it).
- C5: Manager/eval aggregate comparison (assisted vs non-assisted across a cohort) — separate manager-side surface, out of scope here.
- C6: Real-time-assist flavor (live on the call) and post-call-audit flavor — same engine, separate cards; Learning Hub flavor ships first.
- C7: No new dependencies; JSX + inline styles + `:root` tokens; `Button`/`Card` primitives; interaction handlers/fetch untouched.
