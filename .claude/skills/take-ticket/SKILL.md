---
name: take-ticket
description: Pick up one design ticket from the DataOrb UX Priorities Kanban (Notion), build 3 UI variants behind a switcher, push to a branch named after the ticket, post the Vercel preview link back onto the Notion ticket as a comment, and move the ticket to "In review". Use this whenever Umesh says "take a ticket", "pick up the next design ticket", "build variants for [ticket]", "run a dataorb ticket", "do [ticket name]", or otherwise wants to turn a Notion design ticket into 3 reviewable UI options on a preview branch. Trigger even when he names a specific ticket without saying the word "skill" — turning a board ticket into 3 variants on a preview branch is always this workflow.
---

# Take Ticket — DataOrb design-variant pipeline

Turn one Notion design ticket into 3 UI variants, on a preview branch, with the
link posted back to the ticket for review. Manual, one ticket per run. The human
picks the winning variant and merges — never auto-merge, never skip the review
gate. The whole value of shipping 3 options is that Umesh chooses; automating
past that point deletes the point.

## Ground truth (stable references)

- **Repo:** `https://github.com/Umesh0014/dataorb-proto.git`
- **Working clone:** the directory this skill is invoked from. If not inside the
  repo, ask for the path (do not assume `/tmp` — it wipes on reboot).
- **Stack:** Next.js 16, React 19, **JSX (not TS)**, inline styles + CSS-var
  tokens, `Button`/`Card` primitives, **no new dependencies**.
- **Notion board (data source):** `collection://1c63c9a9-bdb7-4c21-9989-d94aed7438b4`
  — "🚿 DataOrb — UX Priorities Kanban". Title field is `Item`. Tickets in scope
  have `Design task = true`.
- **Pickup stage:** `Inprogress`. **Handback stage:** `In review`.
- **Existing switcher pattern (read these live, don't trust this summary):**
  `components/DarkPillSwitcher.jsx` (generic `options` array — already supports
  3-way, no change needed), `components/VariantSwitcher.jsx` (wraps it, currently
  hardcodes `["M1","M2"]`), and `components/MissionsLandingShell.jsx` (where the
  variant `React.useState` lives and where the switcher mounts in a floating
  bottom-right cluster).
- **Conventions:** read `CLAUDE.md` and `CONVENTIONS.md` at the repo root before
  writing any code. `CLAUDE.md` forbids pushing to GitHub without explicit
  confirmation — honor that as a hard gate (Step 5).

## Preconditions (check once, fail loud if missing)

1. Inside the cloned repo, on a clean working tree (`git status`).
2. `gh auth status` and `vercel whoami` both succeed (needed to push and to read
   the preview URL — Vercel MCP is unreliable for this project, see Step 6).
3. Repo is wired to Vercel with Preview Deployments on (a branch push should
   auto-create a preview). If unsure, say so rather than guessing.

## Pipeline

### 1. Pick the ticket
Query the board for `Stage = Inprogress` AND `Design task = true`, sorted by
`Priority`. List the matches and let Umesh confirm one — OR, if he named a ticket
or pasted its URL, skip straight to it. Never start work on a ticket he didn't
confirm.

### 2. Read the spec
Fetch the ticket page: `Item` (title), `Description`, and the page body. That is
the design brief. If the brief is too thin to design from, stop and ask — don't
invent requirements.

### 3. Build 3 variants
Identify the page/component the ticket concerns. Read the current implementation
of that surface AND `MissionsLandingShell.jsx` + `DarkPillSwitcher.jsx` live, so
the variants match house style exactly. Then:

- Build **3 distinct UI directions** of that surface — genuinely different
  approaches, not three coats of paint. Make them worth choosing between.
- Wire them through a **3-way switcher** reusing the existing pattern: either
  thread an `options` prop through `VariantSwitcher` or use `DarkPillSwitcher`
  directly with `options={["A","B","C"]}`. Decide per the repo's rule-of-three at
  plan time; do not duplicate switcher chrome.
- Lift the variant state **locally in the relevant shell/page component** via
  `React.useState`, mirroring the existing `const [variant, setVariant] =
  React.useState(...)` flow, and mount the switcher in the same floating cluster.
- Follow every convention: JSX, inline styles, CSS-var tokens, `Button`/`Card`,
  **no new deps**.

Keep a short note of what each of A/B/C explores — you'll need it for the Notion
comment in Step 7.

### 4. Verify the build
Run `npm run build`. It **must pass** before anything is pushed. If it fails,
stop, report the error, and fix before continuing. Never push a red build.

### 5. Branch + commit + CONFIRM + push
Branch name: `ticket/<slug>` where `<slug>` is the kebab-cased ticket title
(e.g. `ticket/agent-score-card`). Commit with a message referencing the ticket.
Then **STOP and ask for explicit confirmation before `git push`** — this is the
`CLAUDE.md` guardrail and the safety boundary that makes this skill safe to run.
Show Umesh a one-line summary of the 3 variants so he can green-light the push.

### 6. Get the Vercel preview URL
After push, resolve the preview link via this fallback chain (Vercel MCP returns
403 for this project, so don't rely on it):
1. `vercel ls dataorb-proto` — find the deployment for this branch.
2. Else `gh api` on the branch's deployment status (the Vercel GitHub App posts
   it).
Wait for the deployment to finish building before grabbing the URL.

### 7. Comment the link to Notion
Post a comment on the ticket page containing: the preview URL, the branch name,
and a short legend mapping the switcher's A / B / C to what each variant explores.
Keep it scannable — this is what Umesh reads before deciding.

### 8. Move the ticket to In review
Update the ticket's `Stage` to `In review`. Done — Umesh opens the preview, flips
the switcher, picks the winner, and merges the branch himself.

## Stop conditions
Halt and report (don't push, comment, or move stage) if: the brief is too thin
to design from, `npm run build` fails, the push isn't confirmed, the preview URL
can't be resolved, or any auth/precondition check fails. A clean failure that
leaves the board untouched is always better than a half-finished pipeline.
