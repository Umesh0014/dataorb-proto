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
3. GitHub access works: you push via the configured git remote, and you read the
   preview URL through the **GitHub MCP** (`mcp__github__*`), which is scoped to
   this repo. There is **no `vercel` or `gh` CLI** in this environment, and the
   Vercel MCP can't address this project (the connected account exposes no team,
   so every Vercel MCP call fails on a missing `teamId`). The GitHub MCP is the
   path — see Step 9.
4. Repo is wired to Vercel with Preview Deployments on, and the **Vercel GitHub
   App is installed** — it builds a preview for each PR and comments the Ready
   URL. If unsure, say so rather than guessing.

## Pipeline

### 1. Pick the ticket
Query the board for `Stage = Inprogress` AND `Design task = true`, sorted by
`Priority`. List matches and let Umesh confirm one — OR, if he named a ticket or
pasted its URL, go straight to it. Never start on a ticket he didn't confirm.

### 2. Read the spec + the rubric
Fetch the ticket page (`Item`, `Description`, page body) — that is the brief. Read
`design-guidelines.md` in full. Identify the page/component the ticket concerns and
read its current implementation plus `MissionsLandingShell.jsx` +
`DarkPillSwitcher.jsx` live, so everything matches house style. If the brief is too
thin to design from, **stop and ask** — don't invent requirements.

### 3. Diverge — 10 directions
Generate **10 genuinely distinct design directions** for the surface — different
structural approaches, not 10 reskins. Each direction is a short concept note:
what it does differently, which user problem it leans into, which existing patterns
it reuses. Be ruthless about variety; near-duplicates waste a slot.

### 4. Score the directions → cull to top 3
Score all 10 against `design-guidelines.md`. At concept stage you can't verify
build-time gates (contrast, focus rings, ARIA), so score on **rubric alignment**:
the weighted preferences that are decidable from a concept (reuse, affordance
clarity, drill-down discoverability, hierarchy, editorial-vs-density fit,
component/schema structure, multilingual tolerance), and flag any direction whose
*approach* structurally violates a gate (e.g. leans on a radar chart, or needs a
composite number with no label). Rank, then take the **top 3**.

Write the 10 directions + their scores + the reason each of the top 3 won to an
audit file on the branch: `docs/tickets/<slug>/directions.md`. This makes the cut
reviewable later and matches how the board is kept — the decision is never silent.

### 5. Build the top 3
Build the 3 winning directions as distinct UI variants of the surface:
- Wire them through a **3-way switcher** reusing the existing pattern — thread an
  `options={["A","B","C"]}` prop through `VariantSwitcher`, or use
  `DarkPillSwitcher` directly. Do not duplicate switcher chrome.
- Lift variant state **locally in the relevant shell/page** via `React.useState`,
  mirroring the existing `const [variant, setVariant] = React.useState(...)` flow,
  and mount the switcher in the same floating cluster.
- Follow every convention: JSX, inline styles, `:root` tokens (no hardcoded hex),
  `Button`/`Card`, **no new deps**, interaction handlers and fetch logic untouched.

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

Then refine, targeting only the weak items the evaluator named (don't rewrite what
already scores 2). Re-run `npm run build`, re-assess. **Repeat until:**
- every variant passes all 13 gates AND the top variant's weighted % gained < 5
  points over the previous pass, **or**
- 3 refine passes are done.

Whichever comes first. Record the final scores. If any variant still fails a gate
after 3 passes, keep it but flag the failing gate prominently in the Notion post —
a blocked variant is information, not a reason to hide the result.

### 8. Branch + commit + push
Branch name: `ticket/<slug>` — `<slug>` is the kebab-cased Notion ticket title
(e.g. ticket "Agent Score Card" → `ticket/agent-score-card`). Commit the 3 variants
+ the `directions.md` audit file, message referencing the ticket. Push the branch.
This is a throwaway preview branch, never `main` — the merge to `main` is Umesh's
and his alone.
> Note: this assumes `CLAUDE.md` permits auto-push to `ticket/*` branches. If
> `CLAUDE.md` still requires confirmation before any push, either relax it to scope
> the gate to `main` only, or treat this step as a single confirm checkpoint.
> Flag this to Umesh on the first run rather than guessing.

### 9. Get the Vercel preview URL (open a PR, read the Vercel bot comment)
A branch push alone gives you no readable URL here. There is **no `vercel` or `gh`
CLI** in this environment; the Vercel MCP can't address this project (no team →
every call fails on a missing `teamId`); and the branch-preview alias is **not
constructible** — Vercel truncates the branch name and injects a random hash
(`patch-7-settings-card` → `…-git-patch-7-setti-a136a3-…`). Don't attempt any of
those; they are the reason this step used to "always error."

The one reliable source is the **Vercel GitHub App**, which builds a preview for
every PR and posts the Ready URL as a `vercel[bot]` comment. Read it through the
**GitHub MCP** (`mcp__github__*`):

1. **Open a PR** for the ticket branch into `main` (draft is fine — opening a PR
   is **not** merging, and the merge gate stays Umesh's). Reuse the branch's
   existing PR if one is already open.
2. **Poll the PR for the preview URL** with `pull_request_read`:
   - `method: get_comments` → find the comment from user `vercel[bot]`. It carries
     the URL two ways — use either the markdown **Preview** link in the status
     table, or the `previewUrl` field inside the base64 `[vc]: …` payload on the
     first line.
   - The deployment is finished when that comment's status table shows **Ready**
     (equivalently: `get_check_runs` → "Vercel Preview Comments" = success, and
     the decoded payload's `nextCommitStatus` = `DEPLOYED`). Don't grab the URL
     until it's Ready.
3. **Append the ticket's route** to the preview origin so the link lands on the
   right surface (e.g. `…vercel.app/settings/credits-usage`), matching how prior
   tickets posted it.

Previews are usually Ready within ~1–2 min of opening the PR; poll a few times with
a short wait between. Do **not** fall back to the production `dataorb-proto.vercel.app`
origin — that serves `main`, not the branch, so it wouldn't show the variants.

### 10. Comment the result to Notion
Post a comment on the ticket (`notion-create-comment`, `page_id` + `markdown`)
containing: the preview URL, the branch name, the PR link, a short A/B/C legend
mapping each variant to the direction it explores, and the **scorecard** — per
variant: gates passed, weighted %, verdict (Handoff-ready / Minor / Major /
Rework / Blocked), and any flagged item. Keep it scannable; this is what Umesh
reads before deciding. Link the `directions.md` audit file.

Comments render **inline** markdown only — bold, italic, inline code, and links.
Block markdown (headings, tables, fenced code) is flattened to plain text, so lay
the scorecard out as short bold-labelled lines, not a table, and give the URL as a
real inline link.

If the preview still isn't Ready after a few polls in Step 9, **post the PR link
instead of a bare "pending"** — the PR surfaces the Vercel preview and lets Umesh
open it in one click. Never leave the comment with an unresolved error as the only
signal.

### 11. Move the ticket to In review
Update `Stage` to `In review`. Done — Umesh opens the preview, flips the switcher,
reads the scorecard, picks the winner, and merges the branch himself.

## Out of scope for v1 (flagged, not done)
- **Figma export of the 3 finals.** Planned next: push the 3 refined variants to a
  named Figma section. Needs from Umesh — the exact target section link and whether
  it's one frame per variant. Until provided, do not attempt Figma writes.

## Stop conditions
Halt and report (don't push, comment, or move stage) if: the brief is too thin to
design from, `design-guidelines.md` is missing, `npm run build` fails and can't be
fixed, or any auth/precondition check fails. A clean failure that leaves the board
untouched beats a half-finished pipeline. **Never merge to `main` — that gate is
always Umesh's.**

A preview URL that isn't Ready in time is **not** a stop condition — fall back to
the PR link per Step 10 and finish the handback. Only a failure to open the PR at
all (no GitHub access) blocks Step 9.
