---
name: product-brief
description: Run the PM pipeline for a DataOrb Notion ticket — 4 agents (UX Researcher → Product Manager → Head of Product → Product Owner) dissect requirements, research patterns, brainstorm 9 directions across 3 ambition bands, enrich the Notion ticket with product context, and cull to 3 final directions (Safe/Balanced/Ambitious). Pauses for Umesh's approval. Output feeds directly into take-ticket for build. Use when Umesh says "brief this ticket", "product brief for [ticket]", "run the PM pipeline", "prep [ticket] for build", or wants the product thinking done before engineering starts.
---

# Product Brief — DataOrb PM Pipeline

Turn a Notion ticket into a fully-researched, requirements-locked, 3-direction brief
ready for take-ticket to build. **Four agents think before one engineer builds.**

```
  Notion ticket
       │
       ▼
  ┌─────────────────┐
  │  UX Researcher   │  → research.md (comparables, patterns, anti-patterns)
  └────────┬────────┘
           ▼
  ┌─────────────────┐
  │ Product Manager  │  → requirements.md + directions-raw.md (9 directions, 3 bands)
  └────────┬────────┘
           ▼
  ┌─────────────────┐
  │ Head of Product  │  → Notion enrichment + directions-annotated.md
  └────────┬────────┘
           ▼
  ┌─────────────────┐
  │  Product Owner   │  → directions-final.md (top 3) + Notion summary
  └────────┬────────┘
           ▼
  ┌─────────────────┐
  │  HUMAN CHECKPOINT │  ← Umesh approves/redirects the 3 directions
  └────────┬────────┘
           ▼
    take-ticket picks up from Step 5 (build)
```

## Ground truth

- **Notion board:** `collection://1c63c9a9-bdb7-4c21-9989-d94aed7438b4` — "🚿 DataOrb — UX Priorities Kanban"
- **Design rubric:** `design-guidelines.md` at repo root (read live every run)
- **Code conventions:** `CLAUDE.md` + `CONVENTIONS.md` at repo root
- **Agent definitions:** `.claude/agents/ux-researcher.md`, `product-manager.md`, `head-of-product.md`, `product-owner.md`
- **Output location:** `docs/tickets/<slug>/` on a branch named `ticket/<slug>`

## Preconditions

1. Inside the cloned repo.
2. `design-guidelines.md` exists and is readable.
3. Notion MCP is connected (needed for ticket fetch and enrichment).

## Pipeline

### 1. Pick the ticket
Same as take-ticket Step 1. Query board for `Stage = Inprogress` AND
`Design task = true`, sorted by `Priority`. Let Umesh confirm — or go straight to a
named ticket. Create branch `ticket/<slug>` and `docs/tickets/<slug>/` directory.

### 2. UX Researcher agent
Spawn the **ux-researcher** agent (`agentType: 'ux-researcher'`). Pass it:
- Notion ticket content (title, description, full page body)
- File paths for the current implementation of the surface
- DataOrb product context (enterprise contact-center, personas)

**Agent delivers:** `docs/tickets/<slug>/research.md` — competitive landscape, user
behavior patterns, anti-patterns, interaction model candidates.

Wait for completion. Read the output. If the researcher flags the ticket as too thin,
**stop and ask Umesh** — don't proceed on a thin brief.

### 3. Product Manager agent
Spawn the **product-manager** agent (`agentType: 'product-manager'`). Pass it:
- Notion ticket content
- UX research brief (`research.md`)
- Current implementation file paths
- `design-guidelines.md` path
- `CLAUDE.md` + `CONVENTIONS.md` paths

**Agent delivers:**
- `docs/tickets/<slug>/requirements.md` — exhaustive requirements checklist
- `docs/tickets/<slug>/directions-raw.md` — 9 directions across 3 ambition bands

Wait for completion. Read both outputs.

**Requirements quality check:** Verify the checklist against the Notion ticket body.
Read the ticket body sentence by sentence. If any requirement is missing from the
checklist, add it before proceeding. This catch prevents the #1 failure mode — leaked
requirements.

**CTA journey map check:** Verify `requirements.md` contains a CTA Journey Map
section. If missing, read the current implementation, identify every clickable element,
and add the map. Every CTA must have: destination, journey states, return path, and
build status. A requirements file without a CTA journey map is incomplete — don't
proceed to HoP until every CTA is documented.

### 4. Head of Product agent
Spawn the **head-of-product** agent (`agentType: 'head-of-product'`). Pass it:
- Notion ticket content
- `research.md`, `requirements.md`, `directions-raw.md`
- Current implementation file paths

**Agent delivers:**
- **Notion ticket enrichment** — structured product context block (personas, JTBD,
  product narrative, edge cases, success criteria, dependencies). Post this to the
  Notion ticket using `notion-update-page` or `notion-create-comment`.
- `docs/tickets/<slug>/directions-annotated.md` — product context annotations on
  all 9 directions

Wait for completion. Verify the Notion enrichment was posted.

### 5. Product Owner agent
Spawn the **product-owner** agent (`agentType: 'product-owner'`). Pass it:
- `requirements.md`, `research.md`, `directions-annotated.md`
- `design-guidelines.md` path
- Current implementation file paths

**Agent delivers:**
- `docs/tickets/<slug>/directions-final.md` — evaluation of all 9, selection of
  top 3 (one per band: Safe / Balanced / Ambitious)
- Notion comment summarizing the 3 final directions

Wait for completion. Post the PO's summary comment to the Notion ticket.

### 6. Commit all artifacts to branch
Commit everything in `docs/tickets/<slug>/` to the `ticket/<slug>` branch:
- `research.md`
- `requirements.md`
- `directions-raw.md`
- `directions-annotated.md`
- `directions-final.md`

Push the branch. This preserves the full decision trail.

### 7. Human checkpoint — present the 3 directions
Present Umesh with the final 3 directions from `directions-final.md`. Show:

```
## 3 Directions Ready — [ticket title]

### A · Safe: [title]
[2-3 sentence concept from PO evaluation]
Requirements: all covered
Risk: [key risk]

### B · Balanced: [title]
[2-3 sentence concept]
Requirements: all covered
Risk: [key risk]

### C · Ambitious: [title]
[2-3 sentence concept]
Requirements: all covered
Risk: [key risk]

---
Full research + analysis: docs/tickets/<slug>/
Notion ticket enriched with product context.

**Approve these 3 for build?** Or redirect — e.g. "drop A, make C less radical",
"swap B for the cut direction B-3", "requirements missing X — re-run PM".
```

**Wait for Umesh's response.** He can:
- **Approve** → proceed to take-ticket (hand off directions + requirements)
- **Redirect** → adjust directions per feedback, re-run affected agent(s), re-present
- **Reject** → stop pipeline, ticket stays in Inprogress

### 8. Hand off to take-ticket
Once approved, the output is ready for take-ticket. Take-ticket **skips Steps 2–4**
(requirements extraction and direction generation) and picks up at **Step 5 (Build)**
using:
- `docs/tickets/<slug>/requirements.md` as the requirements contract
- `docs/tickets/<slug>/directions-final.md` for the 3 directions to build
- The branch `ticket/<slug>` already created with all artifacts

To invoke: run take-ticket and tell it the ticket has a product brief ready —
it reads `directions-final.md` and builds from there.

## Feedback loop

After Umesh reviews the built variants (via take-ticket), his feedback flows back:

1. **Direction-level feedback** ("B was right but needed X") → update
   `directions-final.md` with the learning. This informs future PM brainstorms.
2. **Requirements feedback** ("you missed that agents need Y") → add to
   `requirements.md` and flag as a "leaked requirement" — this is training data
   for the PM agent to extract better next time.
3. **Product context feedback** ("the JTBD framing is wrong") → update the Notion
   enrichment. Head of Product learns.

Over time, the agents' outputs improve because their input (Notion tickets) gets
richer from HoP enrichment, and their mistakes get caught and documented.

## Stop conditions

Halt and report if: Notion ticket is too thin (UX Researcher or PM flags it), Notion
MCP is disconnected, `design-guidelines.md` is missing, or any agent produces output
that contradicts the requirements checklist without explanation. A clean stop that
surfaces the gap beats a pipeline that invents requirements to fill holes.

## Relationship to take-ticket

```
/product-brief                          /take-ticket
├── 1. Pick ticket                      ├── 1. Pick ticket (or receive from brief)
├── 2. UX Researcher                    ├── 2. Read spec (or read brief artifacts)
├── 3. Product Manager                  ├── 3. Diverge (SKIP — brief provides)
├── 4. Head of Product                  ├── 4. Score + cull (SKIP — PO already did)
├── 5. Product Owner                    ├── 5. Build the top 3 ← STARTS HERE
├── 6. Commit artifacts                 ├── 6. Verify build
├── 7. Human checkpoint                 ├── 7. Assess + refine loop
├── 8. Hand off to take-ticket ────────►├── 8. Branch + push + Notion sync
                                        ├── 9. Final push
                                        ├── 10. Post scorecard
                                        └── 11. Move to In review
```

product-brief does the **thinking**. take-ticket does the **building**. The human
sits between them. This is the loop: think → approve → build → review → feedback → think better.

## Self-learning loop

**Skill ledger:** `docs/learning/product-brief.md`
**Agent ledgers:** each agent has its own at `docs/learning/<agent-name>.md`

### Before every run
1. Read `docs/learning/product-brief.md` for `open` skill-level lessons.
2. Instruct each agent to read its own ledger (already in their instructions).
3. If a skill-level lesson applies (e.g. "PM and HoP produce redundant context —
   clarify handoff"), adjust agent prompts or sequencing for this run.

### At the human checkpoint (Step 7)
When Umesh redirects or gives feedback, classify the feedback:

| Feedback type | Where to log | Example |
|---------------|-------------|---------|
| "Requirements missed X" | `product-manager.md` ledger | PM didn't extract a ticket requirement |
| "Direction B isn't really balanced" | `product-manager.md` ledger | Band variety issue |
| "Wrong persona prioritized" | `head-of-product.md` ledger | Context/JTBD misframed |
| "You cut the best option" | `product-owner.md` ledger | Selection judgment wrong |
| "Research missed obvious competitor" | `ux-researcher.md` ledger | Research gap |
| "Pipeline took too long / wrong sequence" | `product-brief.md` ledger | Orchestration issue |
| "Notion enrichment was wrong/thin" | `head-of-product.md` ledger | Enrichment quality |

Log the entry to the correct ledger **before** re-running the affected agent.
The re-run then picks up the fresh lesson immediately.

### After take-ticket completes (post-build feedback)
When Umesh reviews built variants and gives feedback that traces back to a product
decision (not a build issue):
1. Identify which agent's output caused the downstream problem.
2. Log to that agent's ledger with `Ticket: <slug>` and the causal chain
   (e.g. "PM requirement R4 was ambiguous → builder interpreted it wrong → variant
   B doesn't match intent").
3. This closes the full feedback loop: build review → product learning.

### Promotion
Same rules as individual agents — 3 occurrences of same root cause in any ledger
triggers a permanent instruction update. For skill-level lessons (orchestration,
sequencing), update this SKILL.md file directly.

### Quarterly review
Review all 7 ledgers. Archive stale entries. Promote recurring patterns. Update
agent instructions. This is the "retro" for the autonomous pipeline.
