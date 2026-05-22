# CLAUDE

What AI must read before touch repo.

---

## Read this first

[CONVENTIONS.md](CONVENTIONS.md) authoritative. Here = AI-specific guardrails on top. Never duplicate conventions doc.

---

## Behavior rules

1. **Read closest similar file first.** Match patterns: file structure, style-object layout, JSDoc shape, prop ordering, import order. No invent new structure.
2. **Match existing tokens.** No new colors, fonts, shadows, spacing. Need token? Use existing or surface gap in response — no ad-hoc.
3. **Rule of three.** No extract shared primitive until same composition at 3 callsites. Until then, inline fine.
4. **No over-abstract.** No `as` prop, no render-prop indirection, no factory wrappers. Codebase prefer explicit composition.
5. **No features brief no ask.** No "while we're here" cleanup, no speculative props, no hidden affordances.
6. **No dead code.** Replace something → delete old in same change. No commented-out blocks.
7. **Element sizes fixed.** Layout respond (max-width, gutters); elements (button heights, icon sizes, padding, font sizes) no.

---

## Forbidden patterns

| Pattern | Why | Use instead |
|---|---|---|
| `// click handler` / line-by-line narration | Restates code | Comment WHY, or skip |
| `any` (if/when TS lands) | Defeats purpose | Concrete type or `unknown` + narrow |
| Hard-coded hex / pixel font sizes / spacing magic numbers | Bypass tokens | CSS variable from `globals.css` |
| Raw `<button>` outside `Button.jsx` | Standardized | `<Button variant="…">` |
| Bespoke white-card divs (`bg-white rounded-xl`) | Standardized | `<Card>` (with `tone` if muted/outline) |
| Inline shadow on card | Standardized | `<Card shadow>` |
| `position: fixed` for full-height side panels | PageLayout handle | Pass content as `rightPanel` to `<PageLayout>` |
| `height: 100vh` on layout containers | Break layout system | `min-height: 100vh` only on outermost shell |
| `max-width` on cards / page wrappers | Layout own max-width | Let `<PageLayout>`'s 1068 container size you |
| New top-level folder | Folder structure settled | Put file in `components/` |
| `"potentially useful" optional props` | Add noise | Add when 2nd consumer need |

---

## Page-creation recipe

New module page (e.g. new Insights Hub route):

1. **Pick route id** match side nav config (`/components/SideNav/configs/<module>Config.js`). Id no exist? Add to config.
2. **Add entry to page resolver** in `app/page.jsx` (`INSIGHTS_PAGES` or `LEARNING_PAGES`):
   ```js
   "<id>": { Component: <NewPage>, pageName: "<Display Name>" }
   ```
   Missing routes auto-fall back to `<ComingSoon pageName=… />`.
3. **Build page component** at `components/<NewPage>.jsx`. Receives `{ pageName }` and any wizard / detail-routing props.
4. **Page renders inside `<PageLayout>`**. No new layout primitives — compose with `<Card>`, `<Button>`, `<TabsRow>`, `<StatCard>`, etc.
5. **Sub-routes no exist yet** → render `<ComingSoon pageName="<Sub Route>" />`.
6. **No new tokens.** Design need something design system no provide? Surface.

---

## Component-creation recipe

Before create new component:

1. **Check standard inventory** in CONVENTIONS.md §12. Primitive match? Compose it.
2. **Apply rule of three.** Only 1–2 callsites need composition? Inline.
3. **Must create new primitive:** location `components/<Name>.jsx`, default-exported, JSDoc on API.
4. **Tokens only.** Pull from `app/globals.css` CSS variables.
5. **Style-object pattern:** style block at bottom of file as `const xxStyles = { … }`, no co-locate with each JSX node.
6. **No new dependencies** without surface.

---

## Layout system summary

Re-read these constraints every layout-touching change.

- Min viewport width 1260; sidebar 64; content max-width 1068, centered with `margin-inline: auto`; min gutter 64 each side at 1260, grows above.
- Right panel: viewport ≥ 1644 → dock (centered as unit: `1068 + 64 gap + 320 panel`). Viewport < 1644 → overlay right edge of content. Mode locked moment panel opens.
- `min-height: 100vh` on root shell only. No other layout container has `height` rule. Element sizes (icons, buttons) fixed.

PageLayout owns this. No reimplement.

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
| `PageHeader` | [components/PageHeader.jsx](components/PageHeader.jsx) |

Promotion candidates (defer until 3rd callsite): `Pagination`, `Chip`, `PillGroup`, `Dropdown`.

---

## When in doubt

- **No guess.** Surface uncertainty in response: "Not sure if this reuse `<Card tone='muted'>` or own primitive — both readings plausible. Pick X for now; flag for review."
- **No redesign.** Brief ask fix? Fix only that. No refactor surrounding file.
- **No add tests.** No test infrastructure exists; brief ask tests → surface as out-of-scope.
- **No push to GitHub or run destructive commands** without explicit confirmation. Repo no init as git repo today.