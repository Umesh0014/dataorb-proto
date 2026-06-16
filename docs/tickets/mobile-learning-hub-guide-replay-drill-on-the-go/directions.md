# Mobile Learning Hub — Guide & Replay (and Drill) on the go

Audit trail for the take-ticket run. Notion ticket:
**Mobile Learning Hub — Guide & Replay (and Drill) on the go** (Assignee Umesh,
P2, Parking area → picked up on direct request).

The brief asks to stand up a **separate mobile surface** (its own component +
navigation layer) that reuses the desktop flows/data/state but *not* the
desktop layout (min viewport 1260, fixed element sizes). V1 priority is the
voice **Guide**; **Replay** and **Drill** follow; a connective layer of
**assignments inbox + push nudges + lightweight My Growth** runs through every
phase.

Because the app is desktop-only by design, the mobile surface is presented as a
**phone device frame on the desktop canvas** (standard design-review framing) —
not a responsive reflow. All three variants share that frame and an in-frame
**Guide voice session** (orb, pause/resume, time-remaining warning + extend,
post-session summary — carrying the audit fixes the brief names).

---

## The 10 directions

Each is a different structural answer to "what is the agent's mobile home, and
how do Guide / Replay / Drill surface off it."

1. **Today-first Agenda.** A single vertical "Today" feed. Hero = the
   next-best activity sized to the moment ("You've a 12-min break — fits one
   3-min Guide"), then due assignments as rows, then a streak strip. Bottom tab
   bar Home / Activities / Growth. Leans into the micro-moment insight that is
   the ticket's whole reason to exist.

2. **Voice-first Launchpad.** Home centres a large circular *tap-to-practice*
   voice orb (reuses the GuideSessionPage orb metaphor). One tap starts the
   next assigned Guide; Replay / Drill / assignments sit secondary below. Leans
   hardest into "Guide is voice-native, the V1 priority."

3. **Swipeable card deck.** Stacked assignment cards; swipe right to start,
   left to defer; vertical swipe through replay collections. Playful, but
   drill-down is gesture-only (hidden affordance) and gesture-only navigation
   is a keyboard/AA problem.

4. **Segmented Activity Hub.** Mobile top bar + a ≤3 segmented switcher
   (Guide / Replay / Drill); each segment is a vertical list of that activity
   type. Assignments + Growth are bottom-tab destinations. Maps cleanly to the
   three activity types and is the safest on affordance + a11y.

5. **Streak / Habit Home.** My Growth is the hero: a labelled streak ring
   (Apple-watch-ring mental model), weekly goal, next activity to keep the
   streak. Activities are reached *through* the ring. Strong habit framing
   (Neil's "build the habit of learning"), but risks burying drill-down and
   must stay clear of any judging-the-person tone.

6. **Assignments Inbox-first.** Home is the assignments inbox — what your TL
   sent, with unread/overdue states; each row drills into its activity. Push
   nudges map 1:1 to inbox items. Strong tabular-primary + visible drill-down,
   but the least editorial / voice-forward.

7. **Conversational coach.** A chat thread where an AI coach greets you and
   proposes today's practice as reply chips. **Structurally collides with
   INT-11 ("escape the chatbot pattern — the worst thing we can do is build
   another chatbot").** Rejected on principle.

8. **Bottom-sheet Launcher.** Minimal home (streak + next activity) with a
   persistent pull-up bottom sheet that reveals the full activity library.
   Reuses the Drawer edge-entry motion model. Handle is discoverable; decent,
   but the home itself is thin.

9. **Hero session + Library grid.** Top zone = the live/next Guide session
   (resume bar, time remaining); bottom zone = a 2-col grid of activity tiles.
   Mirrors the desktop Guide header+grid, cleanly separating identity (what's
   live) from parameters (the library). Familiar, but closest to a desktop
   port.

10. **Module-pivot carousel.** Three horizontally-paged "rooms" (Guide /
    Replay / Drill), each a full-screen vertical scroll, with page dots.
    Horizontal paging hides Replay/Drill behind a swipe and fights the vertical
    scroll — discoverability cost.

---

## Scoring (concept-stage, against design-guidelines.md)

Concept stage can't verify build-time gates (contrast, focus rings, ARIA), so
directions are scored on the **rubric-aligned weighted prefs decidable from a
concept** — reuse (UI-2 ·3), affordance clarity (INT-1 ·3), drill-down
discoverability (INT-2 ·3), schema/containers (UI-5 ·2), highlight-distinct
(UI-6 ·2), identity-vs-params (UI-7 ·2), multilingual card tolerance (UI-8 ·2),
tabular+sidecar (UI-9 ·2), editorial-vs-density fit (UI-10 ·2), one-primitive /
≤3 switcher (INT-3 ·2), empty states (INT-5 ·2), task-first / anti-chatbot
(INT-11 ·1) — plus a flag on any approach that *structurally* threatens a gate.

| # | Direction | Reuse | Afford | Drill | Fit/other | Concept score | Gate flag |
|---|-----------|:-----:|:------:|:-----:|:---------:|:-------------:|-----------|
| 1 | Today-first Agenda      | 2 | 2 | 2 | strong | **high** | — |
| 2 | Voice-first Launchpad   | 2 | 2 | 1 | strong | **high** | — |
| 4 | Segmented Activity Hub  | 2 | 2 | 2 | strong | **high** | — |
| 9 | Hero session + grid     | 2 | 2 | 2 | good   | high–med | close to desktop port |
| 6 | Assignments Inbox-first | 2 | 2 | 2 | med (editorial) | med | — |
| 8 | Bottom-sheet Launcher   | 2 | 1 | 1 | med | med | thin home |
| 5 | Streak / Habit Home     | 1 | 1 | 1 | med | med | G4 tone watch; ring must be labelled |
| 10| Module-pivot carousel   | 1 | 1 | 0 | med | low–med | INT-2 horizontal-swipe discoverability |
| 3 | Swipeable card deck     | 1 | 0 | 0 | low | low | INT-2 + G11 keyboard / AA — gesture-only |
| 7 | Conversational coach    | 2 | 1 | 1 | low | low | **INT-11** anti-chatbot — rejected |

---

## The cut — top 3

Chosen for **distinctness + score + structural safety**, and to give Umesh a
real spread of philosophies rather than three tunings of one idea:

- **A — Today-first Agenda (dir 1).** Top concept score. It *is* the ticket's
  thesis: practice as a habit that fits the gaps in a shift. Visible rows =
  unmistakable drill-down; the time-box hero is the differentiator nothing else
  has. Wins on the micro-moment job-to-be-done.

- **B — Voice-first Launchpad (dir 2).** Leans into the brief's stated V1
  priority ("Guide is inherently mobile-native — it's a conversation") and
  reuses the existing orb metaphor, so it's distinct from A without inventing a
  new visual language. Wins on Guide-first conviction. Its one soft spot —
  Replay/Drill discoverability — is addressed by keeping them as visible labelled
  rows beneath the orb (not hidden).

- **C — Segmented Activity Hub (dir 4).** The structured, coverage-complete
  answer: a ≤3 segmented switcher across the three activity types, safest on
  affordance and accessibility, and the most faithful to "one primitive per
  pattern." Wins on clarity and parity. The natural pick for an org that wants
  predictability over editorial flair.

Dir 9 was the strongest runner-up but reads as a port of the desktop Guide
page; A/B/C are more genuinely mobile-native and more distinct from each other.

All three carry: assignments (what's due), a labelled streak (My Growth, the
ring used only as a goal gauge — never as a verdict on the person, per G4), a
deliberate empty / all-caught-up state (INT-5), and the shared Guide voice
session with the time-remaining warning + extend and post-session summary.

Switcher: the three variants are wired through `DarkPillSwitcher`
(`options={["A","B","C"]}`), the established repo 3-way switcher that
`VariantSwitcher` already wraps — floated in a bottom-right cluster, mirroring
the Missions landing pattern.

---

## Build + refine outcome

Built all three behind the switcher at `/learning/mobile`
(`MobileLearningHubShell`), reusing the device frame, an in-frame Guide voice
session (orb, pause/resume, **time-remaining warning + extend**, post-session
summary), a labelled streak ring, the shared `Card`, and — for Variant C — the
shared `TabsRow`. `npm run build` passes.

The `design-evaluator` subagent scored the build against the full rubric, then a
refine pass targeted the weak weighted items it named (reuse `Card` over bespoke
white-card divs; add home zero-states; fix Variant B's orb affordance with an
explicit CTA; demote B's duplicate emphasis). Re-scored:

| Variant | Gates | Weighted | Verdict |
|---------|:-----:|:--------:|---------|
| A — Today-first Agenda     | 13/13 | **92%** | Handoff-ready |
| B — Voice-first Launchpad  | 13/13 | **~90%** | Handoff-ready |
| C — Segmented Activity Hub | 13/13 | **87%** | Handoff-ready |

**Flagged (routed, not silently resolved):** the rubric names `VersionBar` as the
canonical ≤3-option switcher, but this preview uses `DarkPillSwitcher` — the
documented in-repo preview meta-tooling that `VariantSwitcher` wraps and that the
take-ticket switcher pattern prescribes. Whether the A/B/C *design-preview*
switcher counts as product chrome (and so should be `VersionBar`) is a standards
call for Akash/Neil. Scored honestly as INT-3 = partial on all three; left as-is
pending that ruling. Variant C also inherits a minor `aria-selected` gap from the
shared desktop `TabsRow` primitive — not churned here, since it's an app-wide
component.
