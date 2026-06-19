# Research — AskMira Pro: Stories-first landing & story artifact

Phase-1 research for the Jun 19 sharpening of **[Ask Mira Pro] Landing page**:
move off the blank chatbot homepage to a collaborative **stories surface** — arrive
to authored stories, author once / view many (token discipline), default-public
explorations, pin/highlight insights, story-as-component.

Gate applied: **insight ≠ information** — every finding ends in a design implication.
Directions are *built from* these, not decorated after. Angles deliberately skip the
already-built mental models (Briefing / Room / Player / Workspace).

## Angles (reference → insight → pro/con)

1. **Annotated timeline / "key moments"** (Koyfin, Bloomberg, Google Finance, AlphaSense, Public.com).
   *Insight:* execs read a line, not a table — "what happened *there*?" pinned to a moment.
   The same primitive serves explain-the-spike AND pin-to-story; compare-across-windows is a
   first-class control. **Pro:** instantly legible for non-technical VPs. **Con:** forces a
   time axis — weak for non-temporal cuts (segment mix, who/what).

2. **Knowledge-reuse / "someone already asked this"** (Stack Overflow duplicate intercept,
   GitHub "marked as answer", AlphaSense). *Insight:* "author once / avoid regeneration" IS
   the SO problem — treat a typed question as a search over existing stories + public
   explorations FIRST ("Marco explored this 2h ago") before spending a token; the story is the
   "accepted answer." Makes token discipline a *felt* feature. **Pro:** operationalizes the
   token goal. **Con:** a wrong "already answered" is worse than a blank prompt — needs an
   "ask fresh anyway" escape.

3. **Published artifact / report-app** (Perplexity Pages "Convert to Page", Hex data apps).
   *Insight:* the ticket's "story = generated HTML/CSS/React component" is exactly this —
   analysis is the source, story is the published build, with a clear builder-vs-viewer split
   (= our default-public-view / opt-in-private-edit). **Pro:** maps 1:1 to the artifact model.
   **Con:** Perplexity's export dead-end — plan "send to deck/board" or inherit the pain.

4. **Pin-into-doc / highlight reel** (Kindle highlights, Notion synced blocks, Perplexity Pages).
   *Insight:* a pinned insight must be a **live pointer with lineage**, not a copy-paste
   snapshot — show number + source + analysis, and an **"as of" / re-run** state. A story can be
   partly *assembled from highlights*. **Pro:** one primitive serves authoring + collaboration +
   lineage. **Con:** stale-pin risk destroys trust — "as of" is mandatory.

5. **Board / canvas of stories** (Gemini Enterprise Projects, Notion, Coda).
   *Insight:* a Sales space = a **board of story cards** (story is the atomic unit, KPIs inside);
   "run analysis" creates a card; default-public cards fill the board; cross-team stories drop in.
   **Pro:** best home for multi-story, multi-team scale + "pull in other teams." **Con:** boards
   decay into clutter without curation — risky for the once-a-week exec.

6. **Scrollytelling / stepper** (Flourish, Tableau Story Points; visual analogue of the Player).
   *Insight:* non-technical execs lose dense dashboards; proven format is **one insight per step**,
   sticky chart + prose, ending in a recommended action (maps onto the two-voice chapters).
   **Pro:** highest comprehension for the no-SQL persona. **Con:** linear — needs a jump-to escape
   for repeat visits.

## Anti-patterns to avoid
Blank chatbot homepage; dashboard-grid-first (buries the one thing that moved);
copy-paste pins without lineage; unverified AI numbers without source; wrong
"already answered" intercept with no escape; audio-only brief; export dead-end;
edit-by-default collaboration (we want default-public-**view**, private opt-in).

## Cross-cutting must-haves
Source/lineage on every AI number · text TL;DR peer to any audio/visual · EN→Arabic
re-render + RTL · visible visibility state at creation · reuse-before-regenerate
signal · "as of"/freshness on pins & KPIs · no blank start · colour never alone for deltas.

## Directions built from this (Phase 2)
Landings: **Story Board** (5) · **Ask-to-Reuse** (2) · **Living Trend** (1).
Artifacts: **Published Story** (3 + 4 pins) · **Scrolly Story** (6 + 1 timeline).
Open decision flagged for PM/PO: is a story a snapshot or a living document when its
underlying analysis re-runs? (Angle 4 gives the raw material; the policy is a human call.)
