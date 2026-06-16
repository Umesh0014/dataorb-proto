---
name: take-ticket
description: Pick up one design ticket from the DataOrb UX Priorities Kanban (Notion), generate 10 design directions, score them against the DataOrb design rubric, cull to the top 3, build those 3 as UI variants behind a switcher, then self-assess and refine the build until it converges — all hands-off. Push to a branch named after the Notion ticket, post the Vercel preview link plus the scorecard back onto the ticket, and move the ticket to "In review". Umesh reviews the preview and merges himself. Use this whenever Umesh says "take a ticket", "pick up the next design ticket", "build variants for [ticket]", "run a dataorb ticket", "do [ticket name]", or otherwise wants a Notion design ticket turned into reviewable, refined UI options on a preview branch. Trigger even when he names a specific ticket without saying the word "skill".
---

# Take Ticket — DataOrb autonomous design pipeline

Turn one Notion design ticket into 3 scored, self-refined UI variants on a preview
branch, with the link and scorecard posted back to the ticket. One ticket per run,
hands-off from intake to preview. **The only human gate is the merge.** Umesh opens
the preview, reads the scorecard, and merges the branch himself — the skill never
merges to `main` and never decides the ticket is "done". Everything upstream of the
merge runs without him.

## Ground truth (stable references)

- **Repo:** `https://github.com/Umesh0014/dataorb-proto.git`
- **Working clone:** the directory this skill is invoked from. If not inside the
  repo, ask for the path (do not assume `/tmp` — it wipes on reboot).
- **Stack:** Next.js 16, React 19, **JSX (not TS)**, inline styles + CSS-var
  tokens, `Button`/`Card` primitives, **no new dependencies**.
- **Design rubric (read live, every run):** `design-guidelines.md` at the repo
  root. This is the single source of truth for what "good" means — 13 gates, the
  weighted preference table (max 104), good-to-haves, and the verdict thresholds.
  Both the direction-scoring step and the evaluator subagent score against THIS
  file, not against anything summarized here. If Umesh has updated it since last
  run, the new rules apply automatically — that is the whole point of keeping it
  separate. If the file is missing, **stop** and say so.
- **Notion board (data source):** `collection://1c63c9a9-bdb7-4c21-9989-d94aed7438b4`
  — "🚿 DataOrb — UX Priorities Kanban". Title field is `Item`. Tickets in scope
  have `Design task = true`.
- **Pickup stage:** `Inprogress`. **Handback stage:** `In review`.
- **Switcher pattern (read live, don't trust this summary):**
  `components/DarkPillSwitcher.jsx` (generic `options` array — supports 3-way as
  is), `components/VariantSwitcher.jsx` (wraps it), and
  `components/MissionsLandingShell.jsx` (where the variant `React.useState` lives
  and where the switcher mounts in a floating bottom-right cluster).
- **Conventions:** read `CLAUDE.md` and `CONVENTIONS.md` at the repo root before
  writing code. Honor every constraint there.

## Preconditions (check once, fail loud if missing)

1. Inside the cloned repo, on a clean working tree (`git status`).
2. `design-guidelines.md` exists at the repo root and is readable.
3. `gh auth status` and `vercel whoami` both succeed (needed to push and read the
   preview URL — Vercel MCP is unreliable for this project, see Step 8).
4. Repo is wired to Vercel with Preview Deployments on (a branch push auto-creates
   a preview). If unsure, say so rather than guessing.

## Pipeline

### 0. Check for existing product brief
Before starting, check if `docs/tickets/<slug>/directions-final.md` exists on the
current branch. If it does, a **product-brief** run has already completed for this
ticket — skip Steps 1–4 entirely and jump to **Step 5 (Build)** using:
- `docs/tickets/<slug>/requirements.md` as the requirements contract
- `docs/tickets/<slug>/directions-final.md` for the 3 approved directions
- `docs/tickets/<slug>/research.md` for UX context

Log: "Product brief found — skipping to build." If the brief artifacts are incomplete
(e.g. `directions-final.md` exists but `requirements.md` doesn't), stop and flag the
gap rather than building without a requirements contract.

### 1. Pick the ticket
Query the board for `Stage = Inprogress` AND `Design task = true`, sorted by
`Priority`. List matches and let Umesh confirm one — OR, if he named a ticket or
pasted its URL, go straight to it. Never start on a ticket he didn't confirm.

### 2. Read the spec + the rubric → extract requirements checklist
Fetch the ticket page (`Item`, `Description`, page body) — that is the brief. Read
`design-guidelines.md` in full. Identify the page/component the ticket concerns and
read its current implementation plus `MissionsLandingShell.jsx` +
`DarkPillSwitcher.jsx` live, so everything matches house style. If the brief is too
thin to design from, **stop and ask** — don't invent requirements.

#### 2a. Requirements extraction (mandatory)
Before moving to directions, produce an explicit **requirements checklist** extracted
from the Notion ticket. Every discrete requirement, constraint, and acceptance
criterion from the ticket body becomes a numbered line item:

```
## Requirements Checklist — [ticket title]
Source: [Notion page URL]

### Functional requirements
- [ ] R1: [requirement from ticket]
- [ ] R2: [requirement from ticket]
...

### Visual / layout requirements
- [ ] V1: [requirement from ticket]
...

### Data / content requirements
- [ ] D1: [requirement from ticket]
...

### Constraints / out-of-scope (from ticket)
- C1: [constraint]
...
```

**Rules:**
- Extract **every** requirement — err on the side of too many, not too few. If a
  sentence in the ticket implies a need, it's a requirement.
- If the ticket references other pages, screens, or context ("like the agent card
  in Learning Hub"), read those too and extract implicit requirements.
- Write this checklist to `docs/tickets/<slug>/requirements.md` on the branch.
- This checklist is the **contract**. Steps 3–7 are scored against it. A variant
  that doesn't address every R/V/D item is incomplete, not a design choice.
- During build (Step 5), check off each item as implemented. During assessment
  (Step 7), the evaluator verifies every unchecked item and flags gaps.

### 3. Diverge — 9 directions across 3 ambition bands
Generate **9 genuinely distinct design directions** for the surface, structured into
**3 bands of 3 directions each**:

| Band | Label | What it means |
|------|-------|---------------|
| **A — Safe** | Incremental | Reuses existing patterns and components almost entirely. Minimal new UI. Solves the ticket with the smallest possible change. Low risk, fast to build, easy to review. |
| **B — Balanced** | Considered | Introduces 1–2 new structural ideas while staying grounded in existing patterns. Pushes the UX forward without rewriting the surface. The "if we had a bit more time" option. |
| **C — Ambitious** | Provocative | Rethinks the surface structure. May propose a new interaction model, a different information hierarchy, or a layout that breaks from the current page's approach. High thought-provoking value — challenges assumptions about how this surface should work. Not reckless — still grounded in the rubric — but deliberately pushes boundaries. |

**Per direction, write:**
- Band (A/B/C) + direction number (e.g. B-2)
- Concept note: what it does differently, which user problem it leans into
- Which existing patterns it reuses vs. what's new
- **Requirements coverage:** which items from the requirements checklist (Step 2a) it
  addresses and how — a direction that drops requirements is flagged, not quietly accepted
- Risk/tradeoff: what could go wrong, what's hard to build

**Variety rules:**
- Within each band, the 3 directions must be structurally distinct — different layout
  approaches, different information hierarchies, different interaction models. Not reskins.
- The ambitious band (C) must contain at least one direction that would make Umesh say
  "I didn't think of that." If all 3 ambitious directions feel safe-with-extra-steps,
  the band fails — rethink before proceeding.
- Every direction in every band must address **all** functional requirements (R-items)
  from the checklist. Visual/layout requirements (V-items) may vary by band — that's
  where the ambition lives.

### 4. Score the 9 directions → pick top 1 per band → 3 variants
Score all 9 against `design-guidelines.md`. At concept stage you can't verify
build-time gates (contrast, focus rings, ARIA), so score on **rubric alignment**:
the weighted preferences that are decidable from a concept (reuse, affordance
clarity, drill-down discoverability, hierarchy, editorial-vs-density fit,
component/schema structure, multilingual tolerance), and flag any direction whose
*approach* structurally violates a gate (e.g. leans on a radar chart, or needs a
composite number with no label).

**Selection rule: pick the highest-scoring direction from each band.** The final 3
variants are always one Safe (A), one Balanced (B), one Ambitious (C). This
guarantees Umesh always sees the full spectrum — a safe ship-now option, a considered
middle, and a provocative stretch. Never let all 3 collapse to the same risk level.

**Also score requirements coverage.** For each of the top 3, list every requirement
from the checklist and mark it: ✅ addressed / ⚠️ partially addressed / ❌ missing.
Any ❌ on a functional requirement (R-item) must be resolved before build — either
the direction adapts to include it, or the requirement is flagged back to Umesh as
potentially conflicting with the approach.

Write the 9 directions + their scores + band selection rationale + requirements
coverage matrix to `docs/tickets/<slug>/directions.md`. This makes the cut
reviewable later and matches how the board is kept — the decision is never silent.

### 5. Build the top 3 (Safe / Balanced / Ambitious)
Build the 3 winning directions as distinct UI variants of the surface:
- **Label them explicitly:** switcher options are `["A · Safe", "B · Balanced", "C · Ambitious"]`
  so Umesh knows the risk band at a glance.
- Wire them through a **3-way switcher** reusing the existing pattern — thread an
  `options` prop through `VariantSwitcher`, or use `DarkPillSwitcher` directly.
  Do not duplicate switcher chrome.
- Lift variant state **locally in the relevant shell/page** via `React.useState`,
  mirroring the existing `const [variant, setVariant] = React.useState(...)` flow,
  and mount the switcher in the same floating cluster.
- Follow every convention: JSX, inline styles, `:root` tokens (no hardcoded hex),
  `Button`/`Card`, **no new deps**, interaction handlers and fetch logic untouched.

#### 5a. Requirements verification during build
As each variant is built, walk through the requirements checklist
(`docs/tickets/<slug>/requirements.md`) and check off every item implemented.
**Every functional requirement (R-item) must be checked off in every variant.**
Visual/layout requirements (V-items) may differ between variants — that's expected
and is part of what makes Safe vs. Ambitious distinct — but missing V-items must be
a conscious choice noted in the directions file, not an oversight.

### 6. Verify the build
Run `npm run build`. It **must pass** before assessment or push. If it fails, stop,
report, fix, re-run. Never proceed on a red build.

### 7. Assess + refine (the autonomous loop)
Hand the 3 built variants to the **`design-evaluator` subagent** (`.claude/agents/
design-evaluator.md`). It scores each variant against the full rubric — all 13
gates, the weighted table, good-to-haves — and returns, per variant: gate pass/fail,
weighted %, verdict, and the **specific weak weighted items to fix**. Using a fresh
subagent context here is deliberate: it judges the work without anchoring on the
direction it just built.

**The evaluator also receives `docs/tickets/<slug>/requirements.md`** and verifies
every requirement against the built output. Any unchecked R-item is reported as a
**requirements gap** — treated with the same severity as a gate failure. The refine
loop must close requirements gaps before addressing weighted-score improvements.
Requirements gaps > weighted score improvements in priority.

Then refine, targeting only the weak items the evaluator named (don't rewrite what
already scores 2). Re-run `npm run build`, then **commit + push + run sub-step 8a**
(this updates the Notion ticket with the latest preview link and posts a progress
comment with current scores). Re-assess. **Repeat until:**
- every variant passes all 13 gates AND the top variant's weighted % gained < 5
  points over the previous pass, **or**
- 3 refine passes are done.

Whichever comes first. Record the final scores. If any variant still fails a gate
after 3 passes, keep it but flag the failing gate prominently in the Notion post —
a blocked variant is information, not a reason to hide the result.

Each refine pass produces a push → 8a fires → Notion stays current. Umesh can watch
progress in real time on the ticket without waiting for the full pipeline to finish.

### 8. Branch + commit + push + sync to Notion (runs on EVERY push)
Branch name: `ticket/<slug>` — `<slug>` is the kebab-cased Notion ticket title
(e.g. ticket "Agent Score Card" → `ticket/agent-score-card`). Commit the 3 variants
+ the `directions.md` audit file, message referencing the ticket. Push the branch.
This is a throwaway preview branch, never `main` — the merge to `main` is Umesh's
and his alone.
> Note: this assumes `CLAUDE.md` permits auto-push to `ticket/*` branches. If
> `CLAUDE.md` still requires confirmation before any push, either relax it to scope
> the gate to `main` only, or treat this step as a single confirm checkpoint.
> Flag this to Umesh on the first run rather than guessing.

**After every push — including mid-refinement pushes in Step 7 — immediately run
sub-step 8a.**

#### 8a. Resolve Vercel preview URL and update Notion ticket

This sub-step fires after **every** `git push` to the branch, not just the final one.
It keeps the Notion ticket always pointing at the latest deployed preview.

1. **Resolve the preview URL** (Vercel MCP returns 403 for this project — don't
   rely on it):
   - `vercel ls dataorb-proto` — find this branch's deployment.
   - Else `gh api` on the branch's deployment status (the Vercel GitHub App posts it).
   - Wait for the build to finish before grabbing the URL.

2. **Update the Notion ticket page property.** Use the Notion MCP
   (`notion-update-page`) to set a `Preview URL` property (URL type) on the ticket
   page. If the property doesn't exist yet, add it as a rich-text or URL property.
   This is a **property update, not a comment** — so the link is always visible at
   the top of the ticket, not buried in the comment thread.

3. **Post or update a progress comment** on the ticket. The comment body depends on
   pipeline stage:

   | When 8a fires | Comment content |
   |---------------|-----------------|
   | After Step 5 (first build push) | `🔨 Initial build pushed. Preview: <URL>. Branch: <branch>. Refinement in progress.` |
   | After each Step 7 refine pass | `🔄 Refine pass N complete. Preview updated: <URL>. Scores: [brief per-variant summary]. Still refining.` |
   | After final push (Step 9) | Full scorecard comment (see Step 10 below). |

   If a previous progress comment exists from an earlier pass, **post a new comment**
   (don't edit the old one) — this gives Umesh a timeline of how the variants evolved.

4. **If the preview URL can't be resolved** after 2 minutes, log the failure and
   continue the pipeline. Post a comment: `⚠️ Preview URL not yet available for
   commit <sha>. Vercel build may still be running. Will retry on next push.`
   The pipeline should not block on preview resolution — the next push will try again.

### 9. Final push (after refinement converges)
After the assess+refine loop in Step 7 converges, do one final commit+push with all
refined variants. Sub-step 8a fires automatically, resolving the final preview URL.

### 10. Post the final scorecard to Notion
Post a **final** comment on the ticket containing: the preview URL, the branch name,
and the **scorecard** in this format:

```
🔗 Preview: <URL>
📂 Branch: ticket/<slug>

## Variants

| Variant | Band | Direction | Gates | Weighted % | Reqs coverage | Verdict |
|---------|------|-----------|-------|-----------|---------------|---------|
| A | 🟢 Safe | [1-line concept] | 13/13 | 88% | 12/12 ✅ | Handoff-ready |
| B | 🟡 Balanced | [1-line concept] | 13/13 | 82% | 12/12 ✅ | Minor revisions |
| C | 🔴 Ambitious | [1-line concept] | 12/13 | 76% | 11/12 ⚠️ | Major revisions |

### Requirements coverage gaps (if any)
- Variant C missing R4: [description] — [why the ambitious approach conflicts]

### Flagged items
- [any gate failures, blocked items, open questions]

📄 Full directions + scores: docs/tickets/<slug>/directions.md
📋 Requirements checklist: docs/tickets/<slug>/requirements.md
```

Keep it scannable; this is what Umesh reads before deciding. The earlier progress
comments remain as a refinement timeline.

### 11. Move the ticket to In review
Update `Stage` to `In review`. Done — Umesh opens the preview, flips the switcher,
reads the scorecard, picks the winner, and merges the branch himself.

## Out of scope for v1 (flagged, not done)
- **Figma export of the 3 finals.** Planned next: push the 3 refined variants to a
  named Figma section. Needs from Umesh — the exact target section link and whether
  it's one frame per variant. Until provided, do not attempt Figma writes.

## Self-learning loop

**Skill ledger:** `docs/learning/take-ticket.md`
**Evaluator ledger:** `docs/learning/design-evaluator.md`

### Before every run
1. Read `docs/learning/take-ticket.md` for `open` entries.
2. Check if lessons apply to current ticket's surface or build pattern.
3. Apply proactively — e.g. if ledger shows "variants consistently miss empty states
   despite being in requirements", add explicit empty-state verification sub-step.
4. Log: "Applied lesson L-NNN: [brief note]".

### After Umesh reviews the preview
When Umesh gives feedback on built variants (e.g. "variant B doesn't match the
direction", "you broke existing interactions", "the switcher labels are confusing"):

1. Classify and log to the correct ledger:

| Feedback type | Where to log | Example |
|---------------|-------------|---------|
| "Variant doesn't match direction" | `take-ticket.md` | Build fidelity issue |
| "Requirement X not implemented" | `take-ticket.md` | Requirements gap in build |
| "Evaluator gave this a 2 but it's broken" | `design-evaluator.md` | Scoring calibration |
| "Existing interactions broken" | `take-ticket.md` | Convention violation |
| "Direction was wrong to begin with" | Route to `product-manager.md` or `product-owner.md` | Product decision issue — feed back to product-brief pipeline |
| "Notion not updated / preview link stale" | `take-ticket.md` | Sync reliability |
| "Build failed / recovery was messy" | `take-ticket.md` | Build pipeline robustness |

2. If feedback traces back to a product decision (not a build issue), log to the
   product agent's ledger AND note in take-ticket ledger: "Root cause is upstream —
   see product-manager.md L-NNN". This connects the two pipelines' learning.

### Refine-loop learning
After each assess+refine pass, check: did the evaluator catch the same issues Umesh
would? If the final scorecard says "Handoff-ready" but Umesh finds problems, that
gap is an evaluator calibration issue → log to `design-evaluator.md`.

### Promotion (3 occurrences)
When root-cause pattern hits 3:
- Add concrete check to this SKILL.md. Examples:
  - "Variants miss empty states" 3× → add explicit sub-step in Step 5: "render every
    container with zero data and verify the empty state exists"
  - "Existing interactions broken" 3× → add sub-step in Step 6: "before build check,
    smoke-test 3 existing interactions on the surface to verify they still work"
- Mark entries `Status: promoted`. Rule becomes permanent.

### Cross-pipeline feedback
```
Umesh reviews preview
       │
       ├── Build issue ──────→ take-ticket.md ledger
       │                        ↓ (3×) promotes into SKILL.md
       │
       ├── Scoring issue ────→ design-evaluator.md ledger
       │                        ↓ (3×) promotes into evaluator agent
       │
       └── Product issue ────→ product-*.md ledger
                                ↓ (3×) promotes into PM/PO/HoP agent
                                ↓ next /product-brief run picks it up
```

This closes the full loop: build → review → learn → next build is better.

## Stop conditions
Halt and report (don't push, comment, or move stage) if: the brief is too thin to
design from, `design-guidelines.md` is missing, `npm run build` fails and can't be
fixed, the preview URL can't be resolved, or any auth/precondition check fails. A
clean failure that leaves the board untouched beats a half-finished pipeline. **Never
merge to `main` — that gate is always Umesh's.**
