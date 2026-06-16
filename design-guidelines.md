# DataOrb — Design Guidelines & Review Framework

Operating guidelines for building screens across Insights Hub, Learning Hub, Ask Mira Pro, Missions, and Coaching artifacts. These encode the hard constraints surfaced in review sessions and adapt proven framings from **Airbnb's Design Language System** (Unified · Universal · Iconic · Conversational) and **Uber's Base** (simplicity, "act responsibly", and motion that is bold, direct, and mindful of user goals) to DataOrb's enterprise contact-center context.

The document has five parts:

1. **Principles by category** — UI, Interactions, WCAG AA, Motion. Each principle is tagged with a tier.
2. **Design Review Framework** — the same principles reorganized as **Gates → Weighted preferences → Good-to-haves → Scoring rubric**, so any screen can be evaluated for handoff-readiness with a number, not a vibe.
3. **Design Process — Phase Checklists** — Define → Journeys & Flows → Visual Design → Dev Handoff, the stage gates a workstream passes through.
4. **User Journeys & Screen Flows** — how to map journeys (not product flows) before designing multi-persona modules.
5. **Figma Structure & Design Guide** — naming and structure conventions that make Figma map 1:1 to the codebase and to handoff prompts.

> **Tier legend** — `[GATE]` binary pass/fail, a single failure blocks ship · `[W:n]` weighted preference scored 0–2 then multiplied by weight *n* · `[GTH]` good-to-have, small bonus.
>
> **Source of truth:** all color, type, spacing, radii, shadow, and severity values come from the `:root` block in `app/globals.css`. Never hardcode hex. Never fork a component to bypass a token.

---

## 1 · UI

*Airbnb's "Unified" and "Iconic" map almost directly onto DataOrb's reuse-and-restraint stance; Uber's bias toward simplicity and ample whitespace reinforces the editorial treatment for content surfaces.*

1. **Match and maintain the app's visual style — tokens and text alike.** `[GATE]` Every visual value resolves through the existing `:root` design tokens and the app's defined text styles — color, surface, spacing, radius, shadow *and* typography (font family, size, weight, line-height, letter-spacing, text color). No inline hex, no one-off type styles, no forked variants. A new screen must be visually indistinguishable in styling from the rest of the app; if a token or text style you need doesn't exist, flag it to Akash before promotion, never hardcode or invent it inline.

2. **Reuse before you build.** `[W:3]` Borrow established precedents — `ChartTooltip` for popovers, `PreviewStep` drawer for filter drawers, the **`VersionBar`** switcher for version/option toggles (see INT-3) — before introducing anything new. A new visual style is a regression unless approved. (Uber reports 3× faster delivery and 4× fewer parity issues from reuse; the same logic holds here.)

3. **Iconic charts: simple, focused, self-explanatory.** `[GATE]` Bar, trend, pie, donut, and ring only. No spider/radar charts. Every chart is fully labeled (no truncation requiring hover), readable without a manual, screenshot-clean, and also available as a table. The Apple Watch ring is the mental model for "did I hit my goal."

4. **No unexplained composite numbers.** `[GATE]` Every number carries a label stating what it is and its unit (pp gap, % change, sample count). A figure that needs verbal explanation to be understood doesn't ship.

5. **Component-driven, schema-versioned content.** `[W:2]` Content-heavy pages are assembled from containers, each with its own schema, reorderable and version-controlled. A v1 brief must keep rendering in v1 UI after v2 ships — new AI output in old UI is a defect.

6. **Highlight only what's genuinely distinct.** `[W:2]` Avoid yellow-everywhere and green/yellow card backgrounds that flatten hierarchy. Reserve color treatment for true differences in kind (Playbooks vs. brand docs, severity bands), not decoration. Highlighting everything highlights nothing.

7. **Separate identity from parameters.** `[W:2]` On artifact pages, the hero header answers *who / when / what* (agent, run date, skill type); the metadata snapshot below holds the *inputs* (filters, ranges). Don't blend the two; content begins after both.

8. **Universal & multilingual by default.** `[W:2]` Spanish, French, and Dutch run longer; production overflow is real. Prefer cards that absorb expansion over fixed-width tables, lean typographic over ambiguous icon-only labels, and build expansion tolerance in from the start rather than truncating essential messaging.

9. **Tabular primary + sidecar reveal.** `[W:2]` Per-row detail (focus areas, metadata, breakdown) opens in a sidecar/drawer, not a separate page, unless the detail genuinely warrants one. Keep the primary surface scannable.

10. **Editorial for content, density for data.** `[W:2]` Generated artifacts (Coaching Brief, Playbook) get a webpage feel — white background, ~720px readable width, generous whitespace, downloadable. Operational dashboards can be denser. Match treatment to reading mode.

11. **Act responsibly in framing.** `[GATE]` DataOrb does not make employment decisions. Quantitative data stays read-only grounding; narrative is the editable layer; coaching language carries no employment-decision framing. The interface must never imply the system is judging the person.

---

## 2 · Interactions

*Airbnb's "Conversational" — communicate in easily understood ways — and Uber's "consistency and reuse" both argue for one predictable interaction vocabulary, surfaced clearly rather than hidden.*

1. **Make affordances unmistakable.** `[W:3]` Clickable and non-clickable elements must look different. Navigation predictability and "is this a link?" ambiguity are known pain points — resolve them with consistent cursor, hover, and visual weight, never tribal knowledge.

2. **Drill-down must be discoverable.** `[W:3]` New users miss hover-only arrows. Surface the path into detail (visible chevron, row hover state, explicit control) so it's obvious on first encounter.

3. **One primitive per pattern.** `[W:2]` Sub-menus and the app-switcher menu share `RailFlyout`; right-edge panels share the `Drawer` shell. Surface, motion, and dismissal (overlay click, close button, Esc) are identical everywhere. Divergent behavior across the app is a bug. **For showing options or versions, use the `VersionBar` switcher** — the canonical segmented switcher (dark rounded pill, yellow active segment). When a screen exposes up to three options/versions/variants (e.g. V0 / V1 / V2, or option A / B / C), reach for `VersionBar` rather than building a bespoke toggle. It carries the app's switcher styling and behavior for free; if more than three options are needed, flag it — the pattern is tuned for ≤3.

4. **Tooltips are calm and predictable.** `[W:1]` Show after a 300ms delay on hover/focus; hide instantly on leave/blur. Placed right, 8px offset, vertically centered, copy matching the label, `pointer-events: none`. Tooltips clarify — they never carry primary content.

5. **Design every empty state deliberately.** `[W:2]` Zero is a state, not an accident. A grayed-out zero counter, a guiding header, or an explicit empty message must exist for any container that can render nothing (e.g. an "on track" group with no cards).

6. **State lives in memory only.** `[GATE]` No `localStorage`, `sessionStorage`, or any browser storage API. All switcher/version-toggle/view state is in-memory React. This keeps the prototype deterministic and free of stale persisted state.

7. **AI output is a starting state; the edit is user-owned.** `[W:2]` Generated narrative is editable inline, per container, with "last updated by [user]" plus an activity trail. Quantitative data (numbers, tables) stays read-only. The user decides — the system proposes.

8. **Confirm or block irreversible actions.** `[W:2]` Send, publish, delete, and similar one-way actions require a deliberate step. Where a capability isn't ready (e.g. archive in V1), block it visibly rather than letting it fail silently.

9. **Don't rewrite what works.** `[GATE]` Interaction handlers and fetch logic are never touched during a visual refactor — borrow existing wiring, change only presentation. Version/option toggles use the canonical `VersionBar` switcher (see INT-3), not a one-off control.

10. **Route open decisions, don't resolve them silently.** `[GATE]` Product or scope ambiguity goes to Akash (tokens, data/algorithm, scope) or Neil (visual/chart standards). Implementation is never the place an open product question gets quietly settled.

11. **Escape the chatbot pattern.** `[W:1]` Lead with task-based, structured interactions; reserve free-form Q&A as an on-demand follow-up, not the main interface. "The worst thing we can do is build another chatbot."

12. **Every CTA must have a journey.** `[GATE]` No button, link, card-click, row-click, or action control ships without a documented journey: where it leads, what states the user passes through (loading → success / error / empty), what happens on completion, and how the user returns. A CTA without a journey is a dead end — it promises an action the product can't deliver. If the destination isn't built yet, the CTA must be visibly blocked or absent, never present-but-broken. For CTAs that open drawers/sidecars, the drawer content and its own CTAs are part of the journey. For CTAs that trigger async operations (generate, send, publish), the journey includes the in-progress state, the success state, and the failure/retry state. A screen with undocumented CTAs is incomplete regardless of how polished it looks.

---

## 3 · WCAG AA

*Uber bakes keyboard reliability and screen-reader support into Base "for free"; Airbnb's "Universal" demands the experience be welcoming and accessible to a global community. For DataOrb these become non-negotiable floors — most are gates.*

1. **Meet contrast minimums.** `[GATE]` Body text and meaningful icons ≥ 4.5:1; large text (≥24px, or ≥19px bold) and non-text UI components (controls, focus rings, chart strokes) ≥ 3:1. Verify token pairings, don't assume.

2. **Never encode meaning in color alone.** `[GATE]` Trend, severity, status, and pass/fail pair color with a label, icon, sign, or text. A colorblind user gets the same information.

3. **Focus is always visible.** `[GATE]` Every interactive element shows the focus ring — `0 0 0 2px #FFFFFF, 0 0 0 4px #004BEF` — over its current background. Never remove outlines without an equally visible replacement.

4. **Full keyboard operability, logical order.** `[GATE]` Everything actionable is reachable and operable by keyboard. Tab order follows reading order (rail: app switcher → items in array order → help → settings → avatar). Enter/Space activate; Esc dismisses overlays.

5. **Use real semantics.** `[GATE]` Real `<button>`, `<aside role="navigation">`, `<ul role="list">`. Apply `aria-current="page"` to the active item, `aria-haspopup="menu"` to menu triggers, `aria-disabled` for disabled controls. Don't simulate controls with styled divs.

6. **Hit targets large enough.** `[W:2]` Effective interactive target ≥ 44×44px. The 40px icon button carries enough padding to clear the threshold, especially on touch.

7. **Decorative vs. meaningful imagery handled correctly.** `[W:2]` Decorative SVGs get `aria-hidden="true"` + `focusable="false"`. Meaningful icons get an accessible name. Notification dots are `aria-hidden`; semantic state is exposed separately.

8. **Support zoom and reflow.** `[W:1]` Usable with no loss of content or function at 200% zoom. Card-based layouts (already required for i18n) help text reflow without clipping.

9. **Non-visual path to chart data.** `[W:2]` Because every chart is also exportable as a table, that table is the accessible alternative — reachable, labeled, not hidden behind a hover-only affordance.

10. **Labelled inputs, announced status.** `[W:2]` Every control has a programmatically associated label. Errors are conveyed with text and icon, not color alone. Loading, success, and error states are announced (`role="status"` / `aria-live`).

11. **No flashing; respect motion sensitivity.** `[GATE]` Nothing flashes more than three times per second (WCAG 2.3.1). Honor `prefers-reduced-motion`. (See Motion §4.)

---

## 4 · Motion

*Adapted from Uber Base motion — bold, direct, mindful of user goals, choreographed to provide focus without intruding, distracting, or competing — and Airbnb's "Conversational", where motion breathes life and communicates. In an all-day enterprise tool, restraint wins.*

1. **One standard transition for interactive state.** `[W:2]` Background and shadow changes on interactive elements animate at `150ms ease` (`background 150ms ease, box-shadow 150ms ease`). Consistency here is what makes the UI feel coherent rather than custom per component.

2. **Motion communicates; it never decorates.** `[W:2]` Every animation earns its place by reinforcing a state change, spatial relationship, or continuity (where a drawer came from, what just updated). If it only looks nice, cut it. Mindful of the user's goal, never competing with it.

3. **Choreograph for focus, without intruding.** `[W:2]` Motion guides attention to one thing at a time and gets out of the way. No element animates in a way that delays, blocks, or distracts from the task in progress.

4. **Respect `prefers-reduced-motion`, and never flash.** `[GATE]` When reduced motion is signaled, disable or substantially reduce non-essential animation. Never flash more than three times per second. Use proper transitions over jump cuts; use placeholders to stabilize loading instead of jarring pop-in. (Mirrors WCAG §11.)

5. **Keep durations short.** `[W:2]` Micro-interactions ≤ 200ms, larger transitions ≤ 300ms. These tools run all day at operational scale — immediacy beats flourish. Nothing should feel like waiting for an animation.

6. **Easing stays restrained.** `[W:1]` Default to `ease`. Avoid bounce, overshoot, and elastic curves — they read as playful in a context that must feel dependable.

7. **Drawers and sidecars enter from their edge.** `[W:1]` Right-edge panels slide in from the right with `--shadow-drawer` and exit the same way. Motion mirrors the spatial model so the user always knows where the panel lives.

8. **Tooltips don't animate as content.** `[W:1]` Honor the 300ms show delay and instant hide; no attention-grabbing tooltip animation. A quiet clarifier, not a moment.

9. **No layout-shift on data refresh.** `[W:2]` Because state is in-memory and data can re-fetch, refreshes must not jolt the layout or lose scroll/focus position. Reserve space, animate in place, keep the surface stable while values update.

10. **AI generation states are calm, not theatrical.** `[W:2]` Loading and progress for generated artifacts (briefs, playbooks, fact-check runs) use steady, clear indicators. Convey that work is happening without simulating drama or implying more certainty than the output has.

11. **Continuity connects related views.** `[GTH]` Where two views are closely related, a continuity transition (shared element, directional slide) can carry the user between them. Use sparingly, only when it genuinely aids orientation.

12. **Microanimation for state comprehension.** `[GTH]` Subtle micro-feedback (toggle settle, check confirm) can improve comprehension and add restrained delight — as long as it never crosses into decoration or slows the task.

---

# Design Review Framework

The same principles, reorganized so any screen, prototype, or handoff can be scored before it ships. **Gates are absolute. Weighted preferences produce the score. Good-to-haves are bonus. The rubric converts all of it into a verdict.**

## A · Hard constraints (Gates) — binary, any failure blocks ship

| # | Gate | Source |
|---|------|--------|
| G1 | Visual style matches the app: color/surface/spacing/shadow **and** typography via `:root` tokens + defined text styles; no hardcoded hex, no one-off type styles, no forked components | UI-1 |
| G2 | No spider/radar charts; every chart fully labeled and exportable as a table | UI-3 |
| G3 | No unexplained composite numbers; every number has a label + unit | UI-4 |
| G4 | No employment-decision framing; quantitative data read-only, narrative editable | UI-11 |
| G5 | State in-memory React only; no browser storage APIs | INT-6 |
| G6 | Interaction handlers + fetch logic untouched during visual refactors | INT-9 |
| G7 | Open product/scope decisions routed to Akash/Neil, not resolved in implementation | INT-10 |
| G8 | Contrast ≥ 4.5:1 text / ≥ 3:1 large text & UI components | WCAG-1 |
| G9 | Meaning never conveyed by color alone | WCAG-2 |
| G10 | Visible focus ring on every interactive element | WCAG-3 |
| G11 | Full keyboard operability with logical tab order | WCAG-4 |
| G12 | Real semantic elements + correct ARIA (`button`/`nav`/`list`, `aria-current`, `aria-haspopup`) | WCAG-5 |
| G13 | Respects `prefers-reduced-motion`; no flashing > 3×/sec (WCAG 2.3.1) | WCAG-11 / MOT-4 |
| G14 | Every CTA has a documented journey: destination, states (loading/success/error/empty), completion, and return path; unbuilt destinations are blocked or absent, never present-but-broken | INT-12 |

**Rule:** all 14 gates must pass. A single gate failure = **Blocked**, regardless of weighted score.

## B · Strong preferences (Weighted) — scored 0–2, multiplied by weight

Score each: **0** = misses, **1** = partial, **2** = fully meets.

| Ref | Preference | Weight |
|-----|-----------|:------:|
| UI-2 | Reuse existing patterns/precedents before building new | 3 |
| INT-1 | Affordances unmistakable (clickable vs. not) | 3 |
| INT-2 | Drill-down discoverable, not hover-only | 3 |
| UI-5 | Component-driven, schema-versioned containers | 2 |
| UI-6 | Highlight only what's genuinely distinct | 2 |
| UI-7 | Hero header vs. metadata snapshot separated | 2 |
| UI-8 | Card layouts with multilingual expansion tolerance | 2 |
| UI-9 | Tabular primary + sidecar reveal for detail | 2 |
| UI-10 | Editorial treatment for content, density for data | 2 |
| INT-3 | One primitive per pattern; consistent dismissal; `VersionBar` for ≤3 options/versions | 2 |
| INT-5 | Deliberate empty/zero states | 2 |
| INT-7 | AI-output-is-starting-state; user-owned inline edits + activity log | 2 |
| INT-8 | Irreversible actions confirmed or visibly blocked | 2 |
| WCAG-6 | Hit targets ≥ 44px effective | 2 |
| WCAG-7 | Decorative vs. meaningful imagery handled correctly | 2 |
| WCAG-9 | Chart data reachable as an accessible table | 2 |
| WCAG-10 | Labelled inputs; errors text+icon; status announced | 2 |
| MOT-1 | 150ms ease standard transition | 2 |
| MOT-2 | Motion communicates, never decorates | 2 |
| MOT-3 | Choreographed for focus, non-intrusive | 2 |
| MOT-5 | Durations short (≤200ms micro / ≤300ms larger) | 2 |
| MOT-9 | No layout-shift on data refresh | 2 |
| MOT-10 | AI generation states calm, not theatrical | 2 |
| INT-4 | Tooltip 300ms show / instant hide, calm | 1 |
| INT-11 | Task-first; chatbot pattern avoided | 1 |
| WCAG-8 | Zoom/reflow usable at 200% | 1 |
| MOT-6 | Restrained easing (no bounce/overshoot) | 1 |
| MOT-7 | Drawers enter from their edge | 1 |
| MOT-8 | Tooltips don't animate as content | 1 |

**Max weighted points** = Σ(2 × weight) across all rows = **104**.

## C · Good-to-haves — bonus, +1 each (cap +5)

| Ref | Good-to-have |
|-----|--------------|
| MOT-11 | Continuity transitions between closely related views |
| MOT-12 | Microanimation that improves state comprehension |
| — | Long-form artifacts downloadable (PDF) for HR/stakeholder sharing |
| — | Statistical-relevance framing surfaced ("based on 25 of 100"), sample-size honesty |
| — | Citations consolidated, not sprinkled through content |
| — | Empty state offers a guiding next-action CTA |

## D · Scoring rubric

```
1. GATES        → all 14 pass?  No → BLOCKED (stop).  Yes → continue.
2. WEIGHTED      → score = Σ(rating 0–2 × weight)
                  percent = score ÷ 104 × 100
3. GOOD-TO-HAVES → + (count × 1), capped at +5 points, added to score
                  before the percentage where helpful (optional tie-breaker)
4. VERDICT (gates already passed):
```

| Weighted % | Verdict | Action |
|:----------:|---------|--------|
| **≥ 85%** | Handoff-ready | Ship / write the Claude Code prompt |
| **70–84%** | Minor revisions | Targeted patches, then re-score |
| **55–69%** | Major revisions | Rework weak weighted items before handoff |
| **< 55%** | Rework | Back to design; structural issues |
| any gate fails | **Blocked** | Fix the gate first — score is irrelevant until it passes |

**Worked example (illustrative).** A Missions detail screen passes all 14 gates. It scores full marks on reuse, primitives, and motion, but only *partial* (1) on drill-down discoverability and empty states, and *misses* (0) chart-as-table. Weighted = 92 of 104 = **88%** → **Handoff-ready**, with two flagged patches (discoverability, empty state) noted for the next round. One good-to-have present (downloadable PDF) → +1, comfortably clear of the 85% line.

---

# Design Process — Phase Checklists

A phase-gate process adapted from a proven Define → Visual Design → Dev Handoff checklist system, extended with a dedicated **Journeys & Flows** phase and re-grounded in DataOrb's prompt-first workflow and Neil's hard constraints. Each phase lists **To-Do** items and **Expected Outcomes**. Tier tags cross-reference the Review Framework above where an item is also scored.

**How to use:** a workstream advances to the next phase only when the current phase's gated items pass. Append custom items per workstream as needed.

## Phase 0 · Define

**To-Do**
- [ ] **Product goals** — usability issues and opportunities documented for the surface.
- [ ] **Business goals** — KPIs, analytics, and the ROI/outcome model are clear; KPI naming aligned with Carlos/Alex.
- [ ] **User goals** — the problem, expectations, and needs defined *per persona*, not in the abstract.
- [ ] **Ecosystem / concept diagram** — entities and their inter-connections mapped (e.g. the Activity → Mission → Learning Path hierarchy).
- [ ] **User personas** — the relevant roles and their access scopes (agent, team lead, supervisor, ops, admin).
- [ ] **Information architecture** — where this lives and how it's reached.
- [ ] **Use cases / scenarios** — CRUD operations and lifecycle stages identified.
- [ ] **Accessibility target** `[GATE]` — confirm AA as the DataOrb floor; note anywhere AAA is required for the user spectrum.
- [ ] **Design / UX principles** — this document is the reference.
- [ ] **UX writing** — language, tone, and patterns; multilingual expansion tolerance; no employment-decision framing.
- [ ] **Spell check & organise** — neat, no stray artifacts.

**Expected Outcomes** — UX documentation in Figma · written doc (Sheets/Docs) · updated terminologies (KPI names reconciled).

## Phase 1 · Journeys & Screen Flows · *the bridge*

Per Neil's standing directive: map **user journeys, not product flows**, before building V2 of any multi-persona module. V1 can ship on the single primary "bring the user in" journey; V2/V3 cannot be designed coherently without a map.

**To-Do**
- [ ] **List every journey that should exist but doesn't today** — the gap inventory comes first.
- [ ] **Map per persona** `[W:3]` — agent, team lead, supervisor. For each: *where does the journey break?* (e.g. "agent doesn't know which drills satisfy this mission's readiness criteria.")
- [ ] **Swim-lane diagrams** — sequence of events across actors and the system, one lane per actor.
- [ ] **Anchor to the hierarchy** — every journey ties to Activity (roleplay / guide / replay / probe) → Mission (time-bound, cohort, goals) → Learning Path (living, competency-based).
- [ ] **Tag each journey** — *connects to existing laid-out screens* / *needs new design* / *needs backend* / *can hold until someone complains*.
- [ ] **Cover the off-paths** — entry points, decision branches, empty/zero states, error and connection states, and exits along each path.
- [ ] **Prioritize by value** — which journeys to package for V2/V3 for highest impact; no piecemeal.

**Expected Outcomes** — journey map · prioritized journey backlog · flow diagrams that feed directly into Figma.

## Phase 2 · Visual Design

**To-Do**
- [ ] **Clarity** — goal, stakeholders, and content priority settled before pixels (Phase 0/1 done).
- [ ] **Dev sync** `[W:2]` — confirm library framework, dependencies, and the component names Akash will use, *before* designing.
- [ ] **Follow wireframes + visual language** — icons, diagrams, illustrations match the product's defined language.
- [ ] **Visual hierarchy** — established through color, type, shape, size — never color alone `[GATE]`.
- [ ] **Zone flow & page structure** — identify major information zones; explore and finalize a page-structure direction.
- [ ] **Hierarchy & scan sequence** — eye movement follows the intended order of importance.
- [ ] **Cover all use cases** `[W:2]` — error, empty, loading, connection-error, truncation, absence of data.
- [ ] **Use real content** — real strings, truncation, short text, missing data; no Lorem Ipsum; test ES/FR/NL length.
- [ ] **Define clickable areas** — every clickable region identified across all scenarios.
- [ ] **CTA journey map** `[GATE]` — every CTA has a documented journey: destination, states (loading/success/error/empty), return path. No dead-end CTAs. Unbuilt destinations blocked or absent. Async CTAs show in-progress + success + failure. Cross-module CTAs annotated with mental-model shifts.
- [ ] **Usability + visual principles** — the four-category principles above are satisfied.
- [ ] **Micro-interactions** — which pieces are interactive, and every status change they can show.
- [ ] **Consistency** `[W:2]` — elements and zones reuse existing primitives; no forked components or hardcoded hex `[GATE]`.
- [ ] **Feedback incorporated** — review notes addressed; comments resolved and posts deleted.
- [ ] **Prototype & verify** — interactions validated through prototyping.
- [ ] **Nomenclature** — frames, sections, components, and elements named per the Figma guide below.
- [ ] **Spell check & organise** — file clean; hidden/unused items removed.
- [ ] **Design system updates** — styles bound to tokens; new components created and documented; flag net-new primitives to Akash.
- [ ] **Self & peer review** — reviewed by self and at least one teammate.
- [ ] **Dev walkthrough** — front-end dev reviews for buildability.
- [ ] **Neil review** `[GATE]` — before any external/client sharing.
- [ ] **Client / stakeholder review** — approved.

**Expected Outcomes** — Figma screens per flow · documentation · dev notes.

## Phase 3 · Dev Handoff

**To-Do**
- [ ] **Client / Neil walkthrough** — alignment before handoff.
- [ ] **Document all interactions + animation** — grid, scroll behavior, dropdowns, page transitions, micro-animation on icons/diagrams/illustrations; 150ms ease is the standard `[W:2]`.
- [ ] **Cover all use cases incl. edge cases** — error, empty, connection, and the unusual ones.
- [ ] **Prototype & verify** — a MUST at handoff, not optional.
- [ ] **Use real content** — verified, no placeholder text.
- [ ] **Spell check & organise** — final clean pass.
- [ ] **Define clickable areas** — every interactive region annotated.
- [ ] **CTA journey audit** `[GATE]` — verify every CTA's journey is documented and buildable. Every onClick/href has a destination, every async action has loading/success/error states, every dead end is blocked or removed. Include CTA audit table in handoff notes.
- [ ] **Micro-interactions** — interactive pieces and status changes spelled out.
- [ ] **Dev notes** — kept alongside the screens / micro-interactions they describe.
- [ ] **Documentation** — formal write-up of decisions and the items above.
- [ ] **Write the Claude Code handoff prompt** `[GATE]` — the prompt-first standard: *Context → Files to edit → Hard constraints → Tasks → Figma CSS placeholder blocks → Out-of-scope / flagged to Akash or Neil → Acceptance checklist → Ship section (git commands + Vercel preview)*. Handlers and fetch logic stay untouched.
- [ ] **Visual QA (next step)** — test the built version against the design; share feedback with engineers.

**Expected Outcomes** — handoff prompt(s) · annotated Figma · dev notes · Vercel preview after build.

---

# User Journeys & Screen Flows

The discipline that makes the rest predictable. Drawn directly from how DataOrb decided to approach Missions V2 and the Learning Hub end-to-end vision.

**Principles**

1. **Map user journeys, not product flows.** The question is always "where is the *user's* journey breaking?" — e.g. *how does an agent know they're meant to work on a mission?*, *how does a team lead see that an agent had every chance to practice but didn't?*, *how do I archive role plays that turned out weak?* — not "what screens does the product have."

2. **Write down all journeys that should exist but don't.** The gap inventory is the deliverable. You can only prioritize once every missing journey is on the floor next to the pieces already built.

3. **V1 can run journey-light; V2/V3 cannot.** A primary "bring the user in" journey is enough to ship V1. The moment a module is multi-persona and time-bound (Missions, Learning Hub), designing further without a journey map becomes impossible.

4. **Anchor every journey to the hierarchy.**
   - **Activity** — the atomic layer: a roleplay, a guide session, a replay, a probe interview.
   - **Mission** — time-bound, assigned to a cohort, with a start date, end date, and goals; achieved *by* doing activities. Disposable: it opens, runs, and closes.
   - **Learning Path** — the living document above missions; competency-oriented, spans personas (agents, team leads, supervisors), and a mission inherits from it.
   - **Dual taxonomy** — organize assets by **Driver** (live today, e.g. billing, account management) *and* **Competency** (the build-out, e.g. de-escalation), since drivers don't apply cleanly to guides or probes.

5. **Tag each journey for prioritization** — *connects to existing screens* / *needs new design* / *needs backend* / *hold until someone complains* — then package the highest-value set. Don't ship piecemeal; if a capability isn't ready (e.g. archive), take the stand that it's not available yet and fix it next release rather than shipping a half-journey.

**Flow format**

- Swim-lane diagrams: one lane per actor (agent / team lead / supervisor / system), time left-to-right.
- Mark **entry points**, **decision branches**, **empty/zero states**, **error & connection states**, and **exits** on every path — these become the screen states Visual Design must cover.
- Flows feed Figma. Don't open Figma on a multi-persona module before its journey map exists.

**Journey card template** *(use one per journey)*

```
Journey:        [verb + outcome, e.g. "Agent finds the drills required for their mission"]
Persona(s):     [agent / team lead / supervisor / ops]
Trigger:        [what starts it]
Today:          [does it exist? where does it break?]
Hierarchy tie:  [activity / mission / learning path node]
Steps:          [swim-lane sequence]
States needed:  [default · empty · loading · error · connection-error]
Tag:            [connects-to-existing | needs-new-design | needs-backend | hold]
Value:          [high / med / low — why]
```

---

# Figma Structure & Design Guide

The goal is a **predictable** Figma that maps 1:1 to the codebase, so any screen produces a clean handoff prompt with no guesswork. The code side already documents its conventions in `CONVENTIONS.md`; Figma mirrors them.

## File & page organization

- One Figma file per **module** (Insights Hub · Learning Hub · Ask Mira · Coaching) or per major initiative. Cover page always first.
- Standard page order: **Cover → Journeys & Flows → Wireframes → Designs → Components / Library → Archive.**
- **Cover page** carries: file purpose, owner, status, last-updated date, and links to the Vercel preview, the Notion card, and the GitHub branch.

## Frame & section naming

- Mirror code modules and pages. Screen frames that map 1:1 to a code component use that component's **PascalCase** name (`MissionsPage`, `DrillDetailPage`).
- Section per flow, slash-delimited and explicit: `[Module] / [Flow] / [State]` — e.g. `Missions / Create / Step 3 — Coverage`.
- State is always in the name: `Default`, `Empty`, `Loading`, `Error`, `Connection error`.
- Number screens in flow order so the sequence reads top-to-bottom / left-to-right.

## Layer naming

- Name layers by **role**, never the default — "Rectangle 47" is banned. Use semantic names: `card/shell`, `header/title`, `chart/bars`, `row/drill-affordance`.
- Group along component boundaries: one Figma component should equal one code component target.

## Component & variant naming — mirror code props

- Component name = **PascalCase**, matching the code component (`Button`, `Card`, `StatCard`, `Drawer`, `Chip`).
- Variant properties mirror code props exactly:
  - **`tone`** → `success` · `warning` · `danger` · `info` · `neutral` (color/intent)
  - **`size`** → `sm` · `md` · `lg`
  - **`variant`** → structural only (e.g. Button: `primary` · `text` · `icon` · `ai`)
- Never invent a Figma-only variant with no code counterpart. If one seems needed, flag to Akash before creating it `[GATE]`.
- **Options/version switchers use the `VersionBar` component** — don't draw a custom segmented control. Drop in the shared `VersionBar` (dark pill, yellow active) and configure its segments (≤3).

## Tokens & text styles — Figma ↔ `app/globals.css`

- Figma variables/styles map **1:1** to the `:root` tokens in `app/globals.css`. Name them to match: `--color-text-medium` → `color/text/medium`.
- **Bind every text layer to a shared Figma text style** that matches the app's typography (font family, size, weight, line-height, letter-spacing) — no detached or one-off type. Text styling must be indistinguishable from the rest of the app `[GATE]`.
- **No raw hex on any layer** `[GATE]` — bind to a variable. If a required token or text style is missing, flag to Akash; do not hardcode or improvise.
- Shadows resolve to `--shadow-card`, `--shadow-drawer`, `--shadow-8` — not bespoke blurs.

## Coverage & real content

- Every screen ships all its states: `default · empty · loading · error · connection-error`, plus truncation, long multilingual text (ES/FR/NL), and absence-of-data.
- **Real content only** — no Lorem Ipsum.
- Clickable areas defined and annotated for every scenario.

## Annotations & dev notes

- Use Figma annotations or a dedicated **Dev Notes** layer for: interactions, micro-animation timing (150ms standard), grid, scroll behavior, and page transitions.
- Keep each dev note adjacent to the screen it describes.
- **CSS export → prompt bridge:** export CSS per frame; Umesh pastes it into the handoff prompt's Figma-CSS placeholder block after delivery. The placeholder blocks are left empty by Claude on purpose.

## Hygiene — "Spell Check & Organise"

- Remove hidden/unused layers; reconnect or delete stray detached instances; flatten the file.
- Resolve every comment before handoff and delete the resolved posts.
- Self review → peer review → **Neil review before any external share**.
- **Screenshot wins over Figma export** when the two conflict on a value.

## The Figma → Handoff bridge

Predictable Figma makes the handoff prompt almost mechanical: it references frames by their conventional names, lists the exact code files to edit, restates the hard constraints (tokens, chart rules), enumerates tasks, leaves the CSS placeholder blocks, routes out-of-scope items to Akash or Neil by name, ends with an acceptance checklist and the ship commands (git + Vercel preview). If a screen can't be described this cleanly, the Figma isn't structured enough yet — fix the structure, not the prompt.

---

# Self-Learning Loop

A structured feedback mechanism that captures design mistakes and review corrections, promotes recurring patterns into formal guidelines, and ensures the same mistake never costs a second review cycle.

## How it works

```
  Review finds issue
        │
        ▼
  Log in Lessons Ledger (below)
        │
        ▼
  Tag: root cause + affected principle
        │
        ▼
  Same pattern logged 3× ?
        │
   ┌────┴────┐
   No        Yes
   │         │
   stays     promote to formal
   in ledger guideline / gate / weighted item
             │
             ▼
        update §1–4 + Review Framework tables
        archive ledger entries as "promoted"
```

## Lessons Ledger

Each entry follows this format. Append new entries at the top (newest first). **Every design review that catches a preventable mistake must produce a ledger entry before the review is closed.**

```
### L-[NNN] · [Short title]
- **Date:** YYYY-MM-DD
- **Surface:** [which screen / module / component]
- **What happened:** [the mistake — be specific, not "styling was off"]
- **Root cause:** [why — e.g. "designer detached text style to tweak line-height"]
- **Affected principle:** [e.g. UI-1, G1, INT-3]
- **Fix applied:** [what was done]
- **Recurrence count:** [1 | 2 | 3 → promoted]
- **Status:** open | promoted | archived
```

### Active Lessons

> *Empty at inception. First entries added during next review cycle.*

<!-- LEDGER-START — append new entries below this line, newest first -->

<!-- LEDGER-END -->

## Ledger rules

1. **Mandatory capture.** Every review finding that costs rework gets a ledger entry. No exception. The reviewer writes it; the designer confirms root cause.

2. **Tag to principle.** Every entry maps to at least one existing principle ID (UI-1 through MOT-12, G1 through G13). If no principle covers the mistake, that itself is a signal — draft a candidate principle in the entry.

3. **Recurrence triggers promotion.** When the same root-cause pattern appears 3 times across any combination of surfaces or designers:
   - Draft a new numbered principle in the appropriate section (UI / Interactions / WCAG / Motion).
   - Assign tier: `[GATE]` if the mistake could ship to users unnoticed, `[W:n]` otherwise.
   - Add corresponding row to the Review Framework tables (§A, §B, or §C).
   - Update the max weighted points if a new weighted item is added.
   - Mark all related ledger entries `Status: promoted`.

4. **Quarterly prune.** Every quarter, review open ledger entries older than 90 days with recurrence count 1. If the pattern hasn't recurred, mark `Status: archived`. The lesson served its purpose; the ledger stays lean.

5. **Cross-reference, don't duplicate.** If a lesson reinforces an existing principle but the principle's wording didn't prevent the mistake, **strengthen the existing principle's language** rather than adding a new one.

## Integration points

| When | Who | Action |
|------|-----|--------|
| Design review scores < 85% | Reviewer | Log every finding that caused point loss as a ledger entry |
| Gate failure blocks ship | Reviewer | Log the gate failure — even gate failures can reveal unclear wording worth fixing |
| Post-handoff QA finds regression | Dev (Umesh) | Log with `Surface: [built screen]`; tag affected principle |
| Code review catches design-guideline violation | Code reviewer agent | Append ledger entry automatically via commit note → manual transfer |
| Quarterly design sync | Neil + team | Prune stale entries, promote recurring patterns, update max score |

## Promotion examples

These illustrate how a ledger entry becomes a formal rule:

**Example A — Token bypass**
- L-001, L-004, L-009 all logged: "hardcoded `#F5F5F5` instead of `--color-surface-muted`" across three different screens by two designers.
- Recurrence count = 3 → **promoted**.
- Action: UI-1 wording strengthened to call out the specific hex that keeps appearing. All three entries marked `promoted`.

**Example B — Missing empty state**
- L-003, L-007, L-012: "zero-item group renders blank area with no message" on three different card-list surfaces.
- Recurrence count = 3 → **promoted**.
- Action: INT-5 upgraded from `[W:2]` to `[W:3]` and wording tightened to require a specific empty-state component. Review Framework weight updated. Max weighted points recalculated.

**Example C — Novel pattern**
- L-010, L-015, L-018: "accordion expand/collapse has no animation, feels broken" — no existing principle covers accordion motion.
- Recurrence count = 3 → **promoted**.
- Action: new MOT-13 added: "Accordion expand/collapse uses 200ms ease height transition." `[W:1]`. Added to §B weighted table. Max recalculated.

## How AI agents use this section

When the `design-evaluator` agent scores a screen:
1. **Before scoring:** read the Lessons Ledger for any `open` entries. Check the screen against each — a match means the mistake is recurring, flag it prominently.
2. **After scoring:** if any finding maps to an existing ledger entry, increment its recurrence count. If it's net-new, create a new entry.
3. **On promotion threshold:** surface the promotion recommendation in the review output — "L-007 hit 3 recurrences, recommend promoting INT-5 to W:3."

This keeps the guidelines evolving from real review data, not hypothetical best practices.

---

## References

- Airbnb Design Language System — Unified · Universal · Iconic · Conversational (Karri Saarinen / Airbnb Design).
- Uber Base design system — principles of simplicity and "act responsibly" (77 Things); Base motion choreography (bold, direct, mindful of user goals; flashing/loading accessibility).
- DataOrb internal: cross-cutting design principles, SideNav spec (focus ring, 150ms transitions, 300ms tooltip), component library, and Neil's standing chart/token constraints.

*When a guideline here conflicts with a product decision, the decision goes to Akash (tokens, data/algorithm, scope) or Neil (visual/chart standards) — never resolved silently in implementation.*
