# CLAUDE

What AI assistants must read before touching this repo.

---

## Read this first

[CONVENTIONS.md](CONVENTIONS.md) is authoritative. Anything here is AI-specific guardrails on top — never duplicate the conventions doc.

---

## Behavior rules

1. **Read the closest existing similar file first.** Match its patterns: file structure, style-object layout, JSDoc shape, prop ordering, import order. Don't invent a new structure.
2. **Match existing tokens.** Don't introduce new colors, fonts, shadows, or spacing values. If you need a token, either use an existing one or surface the gap in the response — don't add ad-hoc.
3. **Rule of three.** Don't extract a shared primitive until the same composition appears at 3 callsites. Until then, inline composition is fine.
4. **Don't over-abstract.** No prop named `as`, no render-prop indirection, no factory wrappers. The codebase prefers explicit composition.
5. **Don't add features the brief didn't ask for.** No "while we're here" cleanup, no speculative props, no hidden affordances.
6. **No dead code.** If you replace something, delete the old code in the same change. Don't leave commented-out blocks.
7. **Element sizes are fixed.** Layout responds (max-width, gutters); elements (button heights, icon sizes, padding, font sizes) do not.

---

## Forbidden patterns

| Pattern | Why | Use instead |
|---|---|---|
| `// click handler` / line-by-line narration | Restates the code | Comment WHY, or skip |
| `any` (if/when TS lands) | Defeats the purpose | Concrete type or `unknown` + narrow |
| Hard-coded hex / pixel font sizes / spacing magic numbers | Bypasses tokens | CSS variable from `globals.css` |
| Raw `<button>` outside `Button.jsx` | We standardized | `<Button variant="…">` |
| Bespoke white-card divs (`bg-white rounded-xl`) | We standardized | `<Card>` (with `tone` if muted/outline) |
| Inline shadow on a card | We standardized | `<Card shadow>` |
| `position: fixed` for full-height side panels | PageLayout handles this | Pass content as `rightPanel` to `<PageLayout>` |
| `height: 100vh` on layout containers | Breaks layout system | `min-height: 100vh` only on the outermost shell |
| `max-width` on cards / page wrappers | Layout owns max-width | Let `<PageLayout>`'s 1068 container size you |
| New top-level folder | Folder structure is settled | Put the file in `components/` |
| `"potentially useful" optional props` | Adds noise | Add when a 2nd consumer needs it |

---

## Page-creation recipe

For a new module page (e.g. a new Insights Hub route):

1. **Pick the route id** matching the side nav config (`/components/SideNav/configs/<module>Config.js`). If the id doesn't exist, add it to the config.
2. **Add an entry to the page resolver** in `app/page.jsx` (`INSIGHTS_PAGES` or `LEARNING_PAGES`):
   ```js
   "<id>": { Component: <NewPage>, pageName: "<Display Name>" }
   ```
   Missing routes auto-fall back to `<ComingSoon pageName=… />`.
3. **Build the page component** at `components/<NewPage>.jsx`. It receives `{ pageName }` and any wizard / detail-routing props.
4. **The page renders inside `<PageLayout>`**. Don't add new layout primitives — compose with `<Card>`, `<Button>`, `<TabsRow>`, `<StatCard>`, etc.
5. **For sub-routes that don't exist yet**, render `<ComingSoon pageName="<Sub Route>" />`.
6. **No new tokens.** If the design needs something the design system doesn't provide, surface it.

---

## Component-creation recipe

Before creating a new component:

1. **Check the standard inventory** in CONVENTIONS.md §12. If a primitive matches, compose it.
2. **Apply the rule of three.** If only 1–2 callsites need this composition, inline it.
3. **If you must create a new primitive:** location is `components/<Name>.jsx`, default-exported, JSDoc on the API.
4. **Tokens only.** Pull from `app/globals.css` CSS variables.
5. **Style-object pattern:** style block at the bottom of the file as `const xxStyles = { … }`, not co-located with each JSX node.
6. **No new dependencies** without surfacing.

---

## Layout system summary

Re-read these constraints on every layout-touching change.

- Min viewport width 1260; sidebar 64; content max-width 1068, centered with `margin-inline: auto`; minimum gutter 64 each side at 1260, grows above.
- Right panel: viewport ≥ 1644 → dock (centered as a unit: `1068 + 64 gap + 320 panel`). Viewport < 1644 → overlay the right edge of content. Mode locked at the moment the panel opens.
- `min-height: 100vh` on the root shell only. No other layout container has any `height` rule. Element sizes (icons, buttons) are fixed.

PageLayout owns this. Don't reimplement.

---

## Standard components inventory

| Component | File |
|---|---|
| `Button` | [components/Button.jsx](components/Button.jsx) |
| `Card` | [components/Card.jsx](components/Card.jsx) |
| `StatCard` | [components/StatCard.jsx](components/StatCard.jsx) |
| `Toggle` | [components/Toggle.jsx](components/Toggle.jsx) |
| `TabsRow` | [components/TabsRow.jsx](components/TabsRow.jsx) |
| `MultiLineInput` | [components/MultiLineInput.jsx](components/MultiLineInput.jsx) |
| `ComingSoon` | [components/ComingSoon.jsx](components/ComingSoon.jsx) |
| `PageLayout` | [components/PageLayout.jsx](components/PageLayout.jsx) |
| `DashboardShell` | [components/DashboardShell.jsx](components/DashboardShell.jsx) |
| `SideNav` | [components/SideNav/SideNav.jsx](components/SideNav/SideNav.jsx) |
| `RoleplayBreadcrumb` | [components/RoleplayBreadcrumb.jsx](components/RoleplayBreadcrumb.jsx) |
| `DrillHeader` | [components/DrillHeader.jsx](components/DrillHeader.jsx) |

Promotion candidates (deferred until 3rd callsite): `Pagination`, `Chip`, `PillGroup`, `Dropdown`.

---

## When in doubt

- **Don't guess.** Surface uncertainty in the response: "I'm not sure whether this should reuse `<Card tone='muted'>` or be its own primitive — both readings of the spec are plausible. Picking X for now; flag for review."
- **Don't redesign.** If the brief asks for a fix, fix only that. Don't refactor the surrounding file.
- **Don't add tests.** No test infrastructure exists; if a brief asks for tests, surface that as out-of-scope.
- **Don't push to GitHub or run destructive commands** without explicit confirmation. The repo isn't even initialized as a git repo today.
