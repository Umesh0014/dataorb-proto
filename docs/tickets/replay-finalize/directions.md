# Replay finalize — design directions

Ticket: **Replay finalize** (Notion · DataOrb UX Priorities Kanban · P1)
Surface in scope: **the individual replay playback view** (`ReplayPlayer`).

## Why this surface

The Description names three asks. Two of them — *"design the individual replay
playback with skippable coach-commentary moments"* and *"solve where the shared
customer-context sits so it frames moment one without crowding the rest"* — both
land on the **playback view**. That is also where the open "finalize" tension
lives: the current `ReplayPlayer` is a single fixed two-column Guide layout with
always-on coach commentary and a permanently-docked customer profile. The brief
asks for (a) coaching you can *skip*, and (b) a customer-context placement that
*frames moment one without crowding the rest* — both unresolved. The
collection-layer / skill-store ask (asks #1) is already built in `ReplayLanding`
and out of scope for this round.

Anchored to: Activity (replay) → Mission → Learning Path. Primary persona is the
**new hire** (Jun 5 call: replays are ~90% a new-hire tool, "the first place they
go before drill"), with tenured agents as a secondary continuous-learning persona.

House patterns reused across all directions: the Guide two-column model, `Card`,
`:root` tokens, the `lucide-react` icon set already in `ReplayPlayer`, the
AI-disclaimer / editor-credit rule, the one-coach-commentary-per-moment rule, and
the end-mark banner — all locked in prior calls.

## The 10 directions

Scored on rubric alignment decidable at concept stage (weighted refs in parens):
reuse (UI-2·3), affordance clarity (INT-1·3), drill-down discoverability
(INT-2·3), hierarchy/highlight restraint (UI-6·2), identity-vs-params (UI-7·2),
multilingual card tolerance (UI-8·2), tabular+sidecar (UI-9·2), editorial-vs-
density fit (UI-10·2), schema/containers (UI-5·2), empty/zero states (INT-5·2),
one-primitive (INT-3·2), AI-output-is-starting-state (INT-7·2). Gate-risk flagged
where an *approach* structurally fights a gate. Each scored /20 on the decidable
subset, normalized for ranking.

| # | Direction | One-liner | Score | Note |
|---|-----------|-----------|:-----:|------|
| 1 | **Guided two-column (refined baseline)** | Customer profile + chapters in the left sidecar; transcript + coach call-out on the right; coaching collapses per-moment and globally. | **17** | Highest reuse; refines the locked Guide pattern; skippable coaching added cleanly. **WON → A** |
| 2 | **Editorial transcript-spine + margin coaching** | ~720px reading column, full call as a continuous chaptered spine, coach notes in the right margin aligned to each moment; context as a slim sticky frame. | **17** | Best editorial-vs-density fit; margin notes are a discoverable, dismissible coaching layer. **WON → B** |
| 3 | **Focus mode (chapter deck)** | One moment at a time, full-stage; a customer-context *cover* frames moment one, then collapses to a strip; coaching is a skippable reveal. | **16** | Directly answers both open asks; tuned to the new-hire 90% case (one thing at a time). **WON → C** |
| 4 | Timeline-scrubber centric | Big horizontal audio timeline with moment markers; coaching docks below the stage, dismissible per moment. | 13 | Audio-scrubber-first under-serves a transcript-driven coaching tool; markers risk hover-only discoverability (INT-2). |
| 5 | Listen / Learn global toggle | Two modes — clean transcript vs. coaching revealed — toggled globally. | 12 | "Skippable coaching" reduced to one switch; it's a feature layer, not a distinct structure — folds into A as the global toggle. |
| 6 | Commentary-first narrative | Coach commentary leads each moment as the headline; transcript demoted to supporting evidence. | 10 | Fights INT-7 / UI-11: makes editable AI commentary the primary frame and buries the read-only call it's grounded in. |
| 7 | Customer-context-as-hero cover | Moment zero is a full customer cover; the rest play with context collapsed. | 14 | Strong answer to the context ask, but as a standalone it's "baseline + a cover screen" — its best idea is absorbed into C. |
| 8 | Tabbed stage (Transcript / Coaching / Customer) | Stage swaps content via tabs per moment. | 11 | Hides coaching behind a tab → drill-down discoverability hit (INT-2·3); coaching should be visible, not excavated. |
| 9 | Dual-pane synchronized scroll | Continuous transcript scroll left, sticky commentary that updates on scroll right. | 12 | Scroll-synced sticky updates are motion-heavy (MOT-3/9 risk) and the chapter-stepped model reads cleaner. |
| 10 | Floating call-outs over a waveform hero | Waveform player hero; coaching pops as a dismissible floating card on reaching a moment. | 8 | Waveform is decorative (UI-6), floating pop-ins read theatrical (MOT-10) and fight the calm-tool stance. |

## Why the top 3 won

- **A · Guided two-column** — the lowest-risk, highest-reuse finalize: it keeps the
  locked Guide pattern Neil signed off and adds the one missing thing (skippable
  coaching) without reopening the layout. Customer context stays in its proven
  sidecar. This is the "ship it" baseline the other two are measured against.

- **B · Editorial transcript-spine** — the strongest read for the *content* mode of
  the brief: a replay is a story about one call, and the editorial column + margin
  coaching makes the call primary and the coaching a calm, dismissible annotation
  layer. Best multilingual headroom (flowing column, not a fixed two-pane) and the
  cleanest answer to "frames moment one without crowding" — context is a slim
  sticky frame, never a competing column.

- **C · Focus mode** — the strongest read for the *primary persona*. New hires are
  ~90% of usage; one-moment-at-a-time with a customer-context cover that frames the
  whole replay and then gets out of the way is the most legible first-run
  experience, and it makes "skippable coaching" a first-class step (Reveal / Skip)
  rather than a toggle bolted onto a dense layout.

Together the three span the decision space the ticket actually has to make:
*keep the dense Guide layout*, *go editorial-reading*, or *go focused-deck* — each
with a different, deliberate answer to where the customer context sits and how
coaching is skipped.

## Final scorecard (after build + 2 refine passes)

Scored by the `design-evaluator` subagent against the full rubric (13 gates, the
weighted table /104). Converged: all 13 gates pass on all three; top variant moved
+1 over the previous pass (< 5-pt threshold).

| Variant | Direction | Gates | Weighted | Verdict |
|---------|-----------|:-----:|:--------:|---------|
| **A** | Guided two-column · skippable coaching | 13/13 ✅ | **91%** | Handoff-ready |
| **B** | Editorial transcript-spine · margin coaching | 13/13 ✅ | **91%** | Handoff-ready |
| **C** | Focus mode · context cover · reveal/skip | 13/13 ✅ | **90%** | Handoff-ready |

Refine log:
- **Pass 1** — closed the one shared gate failure (G13 `prefers-reduced-motion`,
  now a global guard under `.replay-player`); raised skip/dismiss/toggle/nav hit
  targets (WCAG-6); made C's chapter dots real jump-to-step buttons (INT-2/UI-9).
- **Pass 2** — B: removed the faked-progress jolt (MOT-9), added a discoverable
  chapter-jump nav (INT-2), guiding empty state (INT-5). C + A: guiding empty
  states (INT-5).

Routed to Akash/Neil, not resolved in code (per G7/INT-10):
- **INT-7** — inline narrative editing on the player is intentionally not built; it
  lives on the review/edit screen (`ReplayEditPanel`). Confirm scope.
- **UI-9** — B's editorial margin and C's inline reveal are deliberate alternatives
  to the canonical sidecar for these reading models; confirm acceptable.
- **INT-3** — the A/B/C demo switcher reuses `DarkPillSwitcher` (meta-tooling,
  matching the Missions variant switcher), not the product `VersionBar`. Confirm
  the demo pattern is fine, or move to `VersionBar` if it ever ships as product
  chrome.
